import { describe, expect, it } from "vitest";
import * as ops from "../src/aquarium/editor/ops";
import type { CloudAquarium, Preset } from "../src/aquarium/types";

const quad = ops.empty_view().regions;
void quad;

function base() {
  let doc = ops.new_document("Tank");
  let front: string;
  let cabinet: string;
  [doc, front] = ops.add_view(doc, "Front");
  [doc, cabinet] = ops.add_view(doc, "Cabinet");
  return { doc, front, cabinet };
}

describe("documents", () => {
  it("creates a document", () => {
    const doc = ops.new_document("Nano");
    expect(doc.name).toBe("Nano");
    expect(doc.id).toMatch(/^[0-9a-f]{8}$/);
    expect(Object.keys(doc.waters)).toEqual(["main"]);
    expect(ops.new_id()).not.toBe(ops.new_id());
    // never all digits (an integer key, ordered first by JavaScript)
    for (let i = 0; i < 200; i++) expect(ops.new_id()).toMatch(/^[a-f]/);
  });

  it("names depths", () => {
    expect(ops.depth_name(0.1)).toBe("front");
    expect(ops.depth_name(0.5)).toBe("middle");
    expect(ops.depth_name(0.9)).toBe("back");
  });

  it("never modifies its input", () => {
    const { doc, front } = base();
    const before = JSON.stringify(doc);
    ops.set_region(doc, front, "main", [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]);
    ops.add_decor(
      doc,
      front,
      [
        [0, 0],
        [1, 0],
        [1, 1],
      ],
      0.2,
    );
    ops.remove_view(doc, front);
    expect(JSON.stringify(doc)).toBe(before);
  });
});

describe("cloud and presets", () => {
  const cloud: CloudAquarium = {
    provider: "redsea",
    account: "me",
    uid: "aq1",
    name: "Reefer",
    system_model: "Reefer 425 G2+",
    system_series: "reefer",
    dimensions_cm: { length: 120, width: 60, height: 50 },
    device_ids: ["led1", "dose", "led2"],
    feeding_entities: ["switch.feed_1"],
  };

  it("pre-fills from the cloud", () => {
    const doc = ops.from_cloud(cloud, (id) => id.startsWith("led"));
    expect(doc.name).toBe("Reefer");
    expect(doc.cloud).toEqual({ provider: "redsea", uid: "aq1" });
    expect(doc.waters.main.lights).toEqual([
      { device_id: "led1", x: 0.333 },
      { device_id: "led2", x: 0.667 },
    ]);
    expect(doc.feeding.sources[0]).toMatchObject({
      entity_id: "switch.feed_1",
      kind: "shortcut",
    });
    expect(ops.from_cloud(cloud).waters.main.lights).toEqual([]);
  });

  const presets: Preset[] = [
    {
      id: "r425",
      source: "bundled",
      match: { provider: "redsea", models: ["Reefer 425 G2+"] },
    },
    {
      id: "r350",
      source: "bundled",
      match: { provider: "redsea", series: ["reefer"] },
      dimensions_cm: { length: 90, width: 60, height: 50 },
    },
    {
      id: "max",
      source: "bundled",
      match: { provider: "redsea", series: ["max"] },
    },
    {
      id: "big",
      source: "bundled",
      dimensions_cm: { length: 121, width: 61, height: 50 },
    },
    { id: "other", source: "bundled", match: { provider: "other" } },
  ];

  it("matches presets on model, series, dimensions", () => {
    expect(ops.match_preset(presets, null)).toBeNull();
    expect(ops.match_preset(presets, cloud)!.id).toBe("r425");
    expect(ops.match_preset(presets, { ...cloud, system_model: "x" })!.id).toBe(
      "r350",
    );
    expect(
      ops.match_preset(presets, {
        ...cloud,
        system_model: "x",
        system_series: "max",
        dimensions_cm: null,
      })!.id,
    ).toBe("max");
    expect(
      ops.match_preset(presets, {
        ...cloud,
        system_model: "",
        system_series: "",
        dimensions_cm: { length: 120, width: 60, height: 50 },
      })!.id,
    ).toBe("big");
    expect(
      ops.match_preset(presets, {
        ...cloud,
        system_model: "",
        system_series: "",
        dimensions_cm: null,
      }),
    ).toBeNull();
  });

  it("applies a preset", () => {
    const preset: Preset = {
      id: "p",
      source: "bundled",
      dimensions_cm: { length: 90, width: 50, height: 50 },
      waters: { sump: { sand_band: 0 } },
      views: {
        front: {
          name: "Front",
          image: "/reeftank/catalog/bundled/presets/p/front.webp",
          regions: [
            { water: "main", quad: [] },
            { water: "fuge", quad: [] },
          ],
          decor: [{ id: "x", z: 0.5, poly: [] }],
          hotspots: [
            { id: "h", poly: [], goto: "cabinet", label: "" },
            { id: "h2", poly: [], goto: "nowhere", label: "" },
          ],
        },
        cabinet: { name: "Cabinet" },
      },
      default_view: "cabinet",
    };
    const doc = ops.apply_preset(ops.new_document("T"), preset);
    expect(doc.preset).toBe("p");
    expect(doc.dimensions_cm!.length).toBe(90);
    expect(Object.keys(doc.waters).sort()).toEqual(["fuge", "main", "sump"]);
    expect(doc.views.front.decor[0].id).not.toBe("x");
    expect(doc.views.front.hotspots.map((h) => h.goto)).toEqual(["cabinet"]);
    expect(doc.default_view).toBe("cabinet");
    const again = ops.apply_preset(
      { ...doc, dimensions_cm: { length: 1, width: 1, height: 1 } },
      { ...preset, default_view: undefined },
    );
    expect(again.dimensions_cm!.length).toBe(1);
    expect(again.default_view).toBe("cabinet");
    const none = ops.apply_preset(ops.new_document("T"), {
      id: "e",
      source: "user",
    });
    expect(none.default_view).toBeNull();
  });
});

describe("views and regions", () => {
  it("adds, updates and removes views", () => {
    const { doc, front, cabinet } = base();
    expect(doc.default_view).toBe(front);
    let d = ops.update_view(doc, front, { name: "Face" });
    expect(d.views[front].name).toBe("Face");
    d = ops.update_view(d, "ghost", { name: "x" });
    let hs: string | null;
    [d, hs] = ops.add_hotspot(
      d,
      front,
      [
        [0, 0],
        [1, 0],
        [1, 1],
      ],
      cabinet,
    );
    expect(hs).not.toBeNull();
    [d] = ops.add_coral(d, "main", { id: "euphyllia" }, cabinet, [0.5, 0.5]);
    d = ops.remove_view(d, cabinet);
    expect(d.views[front].hotspots).toEqual([]);
    expect(d.waters.main.corals).toEqual([]);
    d = ops.remove_view(d, front);
    expect(d.default_view).toBeNull();
  });

  it("outlines waters", () => {
    const { doc, front } = base();
    const rect = [
      [0.1, 0.1],
      [0.9, 0.1],
      [0.9, 0.6],
      [0.1, 0.6],
    ] as any;
    let d = ops.set_region(doc, front, "sump", rect);
    expect(d.waters.sump).toBeDefined();
    d = ops.set_region(d, front, "sump", rect);
    expect(d.views[front].regions).toHaveLength(1);
    d = ops.move_region_corner(d, front, "sump", 2, [1.5, -1]);
    expect(d.views[front].regions[0].quad[2]).toEqual([1, 0]);
    d = ops.move_region_corner(d, front, "ghost", 2, [0, 0]);
    d = ops.remove_region(d, front, "sump");
    expect(d.views[front].regions).toEqual([]);
    expect(ops.set_region(d, "ghost", "main", rect)).toEqual(d);
    expect(ops.remove_region(d, "ghost", "main")).toEqual(d);
    d = ops.add_water(d, "fuge", "Refugium");
    expect(d.waters.fuge.name).toBe("Refugium");
    expect(ops.add_water(d, "fuge", "Other").waters.fuge.name).toBe("Refugium");
  });
});

describe("polygons", () => {
  it("adds, moves and removes decor and hotspots", () => {
    const { doc, front, cabinet } = base();
    const tri = [
      [0, 0],
      [1, 0],
      [1, 1],
    ] as any;
    expect(ops.add_decor(doc, front, tri.slice(0, 2), 0.2)[1]).toBeNull();
    expect(ops.add_decor(doc, "ghost", tri, 0.2)[1]).toBeNull();
    let [d, id] = ops.add_decor(doc, front, tri, 0.2);
    d = ops.update_decor(d, front, id!, { z: 0.8 });
    expect(d.views[front].decor[0].z).toBe(0.8);
    d = ops.move_vertex(d, front, "decor", id!, 1, [0.5, 0.5]);
    expect(d.views[front].decor[0].poly[1]).toEqual([0.5, 0.5]);
    d = ops.move_vertex(d, front, "decor", id!, 9, [0.5, 0.5]);
    d = ops.remove_decor(d, front, id!);
    expect(d.views[front].decor).toEqual([]);
    expect(ops.remove_decor(d, "ghost", "x")).toEqual(d);

    expect(ops.add_hotspot(d, front, tri, "ghost")[1]).toBeNull();
    let hs: string | null;
    [d, hs] = ops.add_hotspot(d, front, tri, cabinet);
    d = ops.update_hotspot(d, front, hs!, { label: "Open" });
    expect(d.views[front].hotspots[0].label).toBe("Open");
    d = ops.remove_hotspot(d, front, hs!);
    expect(d.views[front].hotspots).toEqual([]);
    expect(ops.remove_hotspot(d, "ghost", "x")).toEqual(d);
    expect(ops.clamp_point([NaN, 0.123456])).toEqual([0, 0.1235]);
  });
});

describe("elements", () => {
  it("adds, updates and removes elements", () => {
    const { doc, front } = base();
    expect(
      ops.add_element(doc, "ghost", {
        kind: "device",
        device_id: "d",
        pos: [0, 0],
      })[1],
    ).toBeNull();
    let [d, dev] = ops.add_element(doc, front, {
      kind: "device",
      device_id: "d",
      entity_id: "x.y",
      pos: [2, 0.5],
    } as any);
    const el = d.views[front].elements[0];
    expect(el).toMatchObject({
      kind: "device",
      device_id: "d",
      pos: [1, 0.5],
      scale: 1,
      roles: [],
    });
    expect(el.entity_id).toBeUndefined();
    let ent: string | null;
    [d, ent] = ops.add_element(d, front, {
      kind: "entity",
      entity_id: "sensor.t",
      type: "common-sensor",
      device_id: "z",
      pos: [0.5, 0.5],
    } as any);
    expect(d.views[front].elements[1].device_id).toBeUndefined();
    d = ops.update_element(d, front, ent!, {
      pos: [-1, 0.2],
      source: "" as any,
      label: "T",
    });
    expect(d.views[front].elements[1]).toMatchObject({
      pos: [0, 0.2],
      source: null,
      label: "T",
    });
    d = ops.update_element(d, front, "ghost", { label: "x" });
    d = ops.remove_element(d, front, dev!);
    expect(d.views[front].elements).toHaveLength(1);
    expect(ops.remove_element(d, "ghost", "x")).toEqual(d);
  });
});

describe("lights, flow, livestock, feeding", () => {
  it("manages lights and flow", () => {
    const { doc } = base();
    let d = ops.add_light(doc, "main", { device_id: "led" });
    d = ops.add_light(d, "main", { device_id: "led" });
    d = ops.add_light(d, "main", { entity_id: "light.x", x: 0.2 });
    expect(d.waters.main.lights).toEqual([
      { device_id: "led", x: 0.5 },
      { entity_id: "light.x", x: 0.2 },
    ]);
    expect(ops.add_light(d, "ghost", { device_id: "a" })).toEqual(d);
    d = ops.update_light(d, "main", 0, { x: 0.7 });
    expect(d.waters.main.lights[0].x).toBe(0.7);
    d = ops.remove_light(d, "main", 1);
    expect(d.waters.main.lights).toHaveLength(1);
    d = ops.set_flow(d, "main", ["number.a", "number.a", ""]);
    expect(d.waters.main.flow).toEqual(["number.a"]);
    d = ops.update_water(d, "main", { sand_band: 0.2 });
    expect(d.waters.main.sand_band).toBe(0.2);
    expect(ops.set_flow(d, "ghost", ["x"])).toEqual(d);
  });

  it("manages livestock and corals", () => {
    const { doc, front } = base();
    let [d, line] = ops.add_line(doc, "quarantine", {
      species: "tang",
      count: 2,
    });
    expect(d.waters.quarantine.livestock[0]).toMatchObject({
      species: "tang",
      count: 2,
      kind: "fish",
    });
    d = ops.update_line(d, "quarantine", line, { count: 3 });
    expect(d.waters.quarantine.livestock[0].count).toBe(3);
    d = ops.remove_line(d, "quarantine", line);
    expect(d.waters.quarantine.livestock).toEqual([]);
    let coral: string;
    [d, coral] = ops.add_coral(
      d,
      "sump",
      { id: "euphyllia", size_cm: [5, 25] } as any,
      front,
      [0.5, 0.8],
    );
    expect(d.waters.sump.corals[0]).toMatchObject({
      species: "euphyllia",
      size_cm: 15,
      z: 0.5,
    });
    d = ops.update_coral(d, "sump", coral, {
      pos: [3, 3],
      palette: ["#ffffff"],
    });
    expect(d.waters.sump.corals[0].pos).toEqual([1, 1]);
    d = ops.update_coral(d, "sump", coral, { z: 0.2 });
    d = ops.remove_coral(d, "sump", coral);
    expect(d.waters.sump.corals).toEqual([]);
    expect(ops.remove_coral(d, "ghost", "x")).toEqual(d);
    expect(ops.remove_line(d, "ghost", "x")).toEqual(d);
  });

  it("manages feeding sources", () => {
    const { doc, front } = base();
    let [d, src] = ops.add_feed_source(doc, "sensor.feeder");
    expect(ops.add_feed_source(d, "sensor.feeder")[1]).toBeNull();
    expect(ops.add_feed_source(d, "")[1]).toBeNull();
    let el: string | null;
    [d, el] = ops.add_element(d, front, {
      kind: "marker",
      pos: [0.5, 0.1],
      roles: ["feeding_point"],
      source: src,
    } as any);
    d = ops.remove_feed_source(d, src!);
    expect(d.feeding.sources).toEqual([]);
    expect(d.views[front].elements.find((e) => e.id === el)!.source).toBeNull();
    d = ops.update_feeding(d, { duration_s: 60 });
    expect(d.feeding.duration_s).toBe(60);
  });

  it("prepares a document for saving", () => {
    const { doc, front } = base();
    let [d] = ops.add_element(doc, front, {
      kind: "marker",
      pos: [0, 0],
      source: null,
    } as any);
    [d] = ops.add_element(d, front, {
      kind: "entity",
      entity_id: "s.x",
      type: "common-sensor",
      pos: [0, 0],
      source: "ab",
    } as any);
    d.views[front].image = "";
    d.default_view = "ghost";
    const out = ops.for_save(d);
    expect(out.views[front].image).toBeNull();
    expect("source" in out.views[front].elements[0]).toBe(false);
    expect(out.views[front].elements[1].source).toBe("ab");
    expect(out.default_view).toBe(front);
  });
});
