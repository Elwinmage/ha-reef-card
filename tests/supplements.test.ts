// Consolidated tests for supplements

import { html } from "lit";
import { describe, expect, it, vi } from "vitest";
import supplements_list, {
  from_catalog,
  Supplements,
} from "../src/devices/redsea/rsdose/supplements";

describe("supplements.get_supplement_from_fullname() L44-49 — Bundle inner match", () => {
  it("returns bundle sub-supplement with scaled sizes when fullname matches inside a Bundle", () => {
    const list = (supplements_list as any)._list;
    const bundle = list.find((s: any) => s.type === "Bundle");
    expect(bundle).toBeDefined();

    const innerKey = Object.keys(bundle.bundle)[0];
    const innerSupp = bundle.bundle[innerKey].supplement;
    const ratio = bundle.bundle[innerKey].ratio;
    const testFullname = "__test_bundle_fullname__";

    innerSupp.fullname = testFullname;

    try {
      const result =
        supplements_list.get_supplement_from_fullname(testFullname);

      expect(result).not.toBeNull();
      expect(result.uid).toBe(innerSupp.uid);

      expect(result.sizes).toEqual(bundle.sizes.map((x: number) => x * ratio));
    } finally {
      delete innerSupp.fullname;
    }
  });

  it("returns null when fullname matches nothing in list or any bundle", () => {
    const result = supplements_list.get_supplement_from_fullname(
      "NONEXISTENT_SUPPLEMENT_XYZ",
    );
    expect(result).toBeNull();
  });
});

describe("supplements — ReefCare parts as standalone supplements", () => {
  const parts = [
    ["6b7d2c15-0d25-4447-b089-854ef6ba99f2", "Part 1: Calcium & Magnesium"],
    [
      "6f6a53db-0985-47f4-92bd-cef092d97d22",
      "Part 2: KH/Alkalinity &PH stabilizer",
    ],
    ["18c5a293-f14d-4d40-ad43-0420e54f9a45", "Part 3: Iodine & Potassium"],
    [
      "bb73e4c2-e366-4304-aaeb-50e4b52fa10f",
      "Part 4: Iron & Bioactive elements",
    ],
  ];

  it.each(parts)("finds %s by its standalone fullname", (uid, name) => {
    const result = supplements_list.get_supplement_from_fullname(
      "Red Sea - ReefCare " + name,
    );
    expect(result).not.toBeNull();
    expect(result.uid).toBe(uid);
    expect(result.type).toBeNull();
  });

  it.each(parts)(
    "keeps the same sizes by uid and by fullname (%s)",
    (uid, name) => {
      const by_uid = supplements_list.get_supplement_from_uid(uid);
      const by_fullname = supplements_list.get_supplement_from_fullname(
        "Red Sea - ReefCare " + name,
      );
      expect(by_uid.sizes).toEqual(by_fullname.sizes);
    },
  );
});

describe("supplements — read from the redsea catalog", () => {
  const items = {
    "brand-kh": {
      uid: "kh-uid",
      brand: "Brand",
      name: "KH",
      fullname: "Brand - KH",
      short_name: "KH",
      kind: "kh",
      sizes: [500],
      image: "/redsea_catalog/pack/items/brand-kh/image.webp?v=1",
      thumb: "/redsea_catalog/pack/items/brand-kh/thumb.webp?v=1",
    },
    "brand-pack": {
      uid: "pack-uid",
      brand: "Brand",
      name: "Pack",
      fullname: "Brand - Pack",
      display_name: "Pack",
      short_name: "P",
      made_by_redsea: true,
      kind: "bundle",
      sizes: [100],
      bundle: [
        { slot: 2, part: "brand-kh", ratio: 2 },
        { slot: 1, part: "missing", ratio: 1 },
      ],
    },
    bare: {},
  };

  it("converts catalog entries to the former list format", () => {
    const list = from_catalog(items as any);
    expect(list.map((s) => s.fullname)).toEqual([
      "bare",
      "Brand - KH",
      "Brand - Pack",
    ]);
    const bare = list[0];
    expect(bare).toMatchObject({
      uid: "bare",
      name: "bare",
      display_name: null,
      short_name: "",
      brand_name: "",
      type: null,
      made_by_redsea: false,
      image: null,
      thumb: null,
    });
    expect(bare.sizes).toBeUndefined();
    const pack = list[2];
    expect(pack.type).toBe("Bundle");
    expect(Object.keys(pack.bundle)).toEqual(["1", "2"]);
    expect(pack.bundle["2"]).toEqual({
      supplement: {
        uid: "kh-uid",
        name: "KH",
        display_name: null,
        short_name: "KH",
        brand_name: "Brand",
        made_by_redsea: false,
      },
      ratio: 2,
    });
    expect(pack.bundle["1"].supplement.uid).toBeUndefined();
  });

  it("gives the visual of a supplement, or null", () => {
    const supplements = new Supplements();
    supplements.set_catalog(items as any);
    expect(supplements.image_of("kh-uid")).toBe(items["brand-kh"].image);
    expect(supplements.image_of("pack-uid")).toBeNull();
    expect(supplements.image_of(undefined)).toBeNull();
  });

  it("loads once through the websocket, then follows catalog updates", async () => {
    const supplements = new Supplements();
    let listener: (event: any) => void = () => undefined;
    const unsubscribe = vi.fn();
    const hass = {
      callWS: vi.fn(async () => ({ version: "1", data: { items } })),
      connection: {
        subscribeMessage: vi.fn(async (cb: any) => {
          listener = cb;
          return unsubscribe;
        }),
      },
    };
    await supplements.ensure_loaded(hass);
    expect(hass.callWS).toHaveBeenCalledWith({ type: "redsea/catalog" });
    expect(hass.connection.subscribeMessage).toHaveBeenCalledWith(
      expect.any(Function),
      {
        type: "redsea/catalog/subscribe",
      },
    );
    expect(supplements.get_supplement_from_uid("kh-uid")?.fullname).toBe(
      "Brand - KH",
    );

    expect(supplements.loaded).toBe(true);

    // Loaded: no second call
    await supplements.ensure_loaded(hass);
    expect(hass.callWS).toHaveBeenCalledTimes(1);

    // Same version, or an install in progress: nothing re-read
    listener({ version: "1", updating: false });
    listener({ version: "2", updating: true });
    expect(hass.callWS).toHaveBeenCalledTimes(1);

    // A new release installed: re-read, and listeners told
    const changed = vi.fn();
    const stop = supplements.on_change(changed);
    hass.callWS.mockResolvedValueOnce({
      version: "2",
      data: { items: { other: { uid: "o", fullname: "X - O" } } },
    });
    listener({ version: "2", updating: false });
    await vi.waitFor(() =>
      expect(supplements.get_supplement_from_uid("o")).not.toBeNull(),
    );
    expect(supplements._version).toBe("2");
    expect(changed).toHaveBeenCalledTimes(1);
    stop();
    expect(supplements._listeners.size).toBe(0);

    // A failed re-read keeps the list
    hass.callWS.mockRejectedValueOnce(new Error("gone"));
    listener({ version: "3", updating: false });
    await Promise.resolve();
    expect(supplements.get_supplement_from_uid("o")).not.toBeNull();
  });

  it("stays empty without the websocket, retries after an error", async () => {
    const supplements = new Supplements();
    await supplements.ensure_loaded(undefined);
    await supplements.ensure_loaded({ states: {} });
    expect(supplements._list).toEqual([]);

    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    const hass = {
      callWS: vi
        .fn()
        .mockRejectedValueOnce(new Error("redsea not loaded"))
        .mockResolvedValueOnce({ data: {} }),
    };
    await supplements.ensure_loaded(hass);
    expect(supplements._loaded).toBe(false);
    expect(debug).toHaveBeenCalled();
    // No subscription available: loaded all the same
    await supplements.ensure_loaded(hass);
    expect(supplements._loaded).toBe(true);
    expect(supplements._version).toBeNull();
    expect(supplements._list).toEqual([]);
    debug.mockRestore();

    // A response without data keeps an empty list
    const empty = new Supplements();
    await empty.ensure_loaded({ callWS: vi.fn(async () => null) });
    expect(empty._list).toEqual([]);
  });

  it("does not start a second load while one is running", async () => {
    const supplements = new Supplements();
    let resolve: (v: any) => void = () => undefined;
    const hass = {
      callWS: vi.fn(
        () =>
          new Promise((r) => {
            resolve = r;
          }),
      ),
    };
    const first = supplements.ensure_loaded(hass);
    await supplements.ensure_loaded(hass);
    expect(hass.callWS).toHaveBeenCalledTimes(1);
    resolve({ version: "1", data: { items: {} } });
    await first;
    expect(supplements._loaded).toBe(true);
  });
});

describe("supplements — bundle parts found inside their bundle", () => {
  it("returns a part met in a bundle first, sizes scaled by its ratio", () => {
    const supplements = new Supplements();
    supplements.set_catalog({
      bundle: {
        uid: "b",
        fullname: "A - Bundle",
        kind: "bundle",
        sizes: [100, 200],
        bundle: [
          { slot: 1, part: "part", ratio: 1 },
          { slot: 2, part: "other", ratio: 0.5 },
        ],
      },
      part: { uid: "p", fullname: "Z - Part", name: "Part" },
      other: { uid: "o", fullname: "Z - Other", name: "Other" },
    } as any);
    expect(supplements.get_supplement_from_uid("o")).toMatchObject({
      uid: "o",
      sizes: [50, 100],
    });
    expect(supplements.get_supplement_from_uid("nothing")).toBeNull();
  });
});
