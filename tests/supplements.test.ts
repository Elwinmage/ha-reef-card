// Consolidated tests for supplements

import { html } from "lit";
import { describe, expect, it, vi } from "vitest";
import supplements_list from "../src/devices/redsea/rsdose/supplements";

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
