import { describe, expect, it } from "vitest";
import * as ops from "../src/aquarium/editor/ops";
import { animal_groups } from "../src/aquarium/scene";
import { drawn_fish, unknown_fish } from "../src/aquarium/sprites";
import type { Catalog, FishSpecies } from "../src/aquarium/types";

const clips = { swim: { from: 0, to: 3, fps: 8, loop: true } };

function fish(id: string, extra: Partial<FishSpecies> = {}): FishSpecies {
  return {
    id,
    kind: "fish",
    source: "pack",
    frame: [100, 50],
    columns: 4,
    clips,
    atlas: { "1x": `${id}.webp` },
    ...extra,
  } as FishSpecies;
}

const unknown = fish("unknown_fish", { facing: "left", length_frac: 0.8 });
// A species published without picture (no atlas, no frame)
const bare = {
  id: "guppy",
  kind: "fish",
  source: "pack",
  water_types: ["freshwater"],
  size_cm: [2, 4],
} as unknown as FishSpecies;

function catalog(defaults?: FishSpecies[]): Catalog {
  return {
    fish: [fish("clown"), bare],
    corals: [],
    presets: [],
    defaults,
  } as Catalog;
}

describe("default fish", () => {
  it("finds the default picture", () => {
    expect(unknown_fish(catalog([unknown]))).toBe(unknown);
    expect(unknown_fish(catalog([]))).toBeNull();
    expect(unknown_fish(catalog())).toBeNull();
    expect(unknown_fish(null)).toBeNull();
    // A default without atlas is not usable
    expect(
      unknown_fish(catalog([{ ...unknown, atlas: undefined } as any])),
    ).toBeNull();
  });

  it("keeps a species that has a picture", () => {
    const c = fish("clown");
    expect(drawn_fish(c, catalog([unknown]))).toBe(c);
  });

  it("draws a species without picture as the default fish", () => {
    const d = drawn_fish(bare, catalog([unknown]))!;
    expect(d.placeholder).toBe(true);
    expect(d.atlas).toEqual(unknown.atlas);
    expect(d.id).toBe("guppy");
    expect(d.size_cm).toEqual([2, 4]);
    expect(d.length_frac).toBe(0.8);
    expect(d.thumbnail).toBeUndefined();
    const own = drawn_fish(
      { ...bare, thumbnail: "t.webp" },
      catalog([unknown]),
    );
    expect(own?.thumbnail).toBe("t.webp");
    const from_default = drawn_fish(
      bare,
      catalog([{ ...unknown, thumbnail: "u.webp" }]),
    );
    expect(from_default?.thumbnail).toBe("u.webp");
  });

  it("has nothing to draw without a default fish", () => {
    expect(drawn_fish(bare, catalog())).toBeNull();
  });

  it("makes the scene swim it", () => {
    const water = ops.empty_water();
    water.livestock = [
      { id: "l1", kind: "fish", species: "guppy", count: 3 },
    ] as any;
    const groups = animal_groups(water, catalog([unknown]));
    expect(groups).toHaveLength(1);
    expect(groups[0].species.atlas["1x"]).toBe("unknown_fish.webp");
    // No default fish: the generic one (drawn at runtime, none without canvas)
    expect(() => animal_groups(water, catalog())).not.toThrow();
  });
});

describe("water type", () => {
  it("is marine in a new document", () => {
    expect(ops.new_document("x").water_type).toBe("marine");
  });

  it("filters the species by water", () => {
    const list = [
      { id: "a" },
      { id: "b", water_types: ["marine", "brackish"] },
      { id: "c", water_types: ["freshwater"] },
      { id: "d", water_types: [] },
    ] as { id: string; water_types?: any[] }[];
    const ids = (w: any) => ops.for_water(list, w).map((s) => s.id);
    expect(ids("marine")).toEqual(["a", "b", "d"]);
    expect(ids(undefined)).toEqual(["a", "b", "d"]);
    expect(ids("freshwater")).toEqual(["c"]);
    expect(ids("brackish")).toEqual(["b"]);
  });
});
