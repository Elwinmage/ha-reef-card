/**
 * Invertebrates of the aquarium view: the assets of the catalog, the surface
 * each one is bound to in the simulation, the sand a digging shrimp raises,
 * the sessile ones settled where they were placed, and their group in the
 * editor's livestock panel.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/aquarium/index";
import {
  AquariumScene,
  animal_groups,
  sessile_scenes,
} from "../src/aquarium/scene";
import {
  FishSim,
  WORK,
  default_profile,
  puff_alpha,
  puff_radius,
  surface_of,
  type FishGroup,
  type SimEnv,
} from "../src/aquarium/sim";
import {
  invertebrate_animal,
  reset_still_atlases,
  still_atlas,
  still_sways,
} from "../src/aquarium/sprites";
import { WaterProjection, rect_quad } from "../src/aquarium/geometry";
import {
  open_scene_editor,
  species_thumb,
} from "../src/aquarium/editor/scene_editor";
import { reset_catalog_cache } from "../src/aquarium/api";
import * as ops from "../src/aquarium/editor/ops";
import type {
  Catalog,
  FishSpecies,
  InvertebrateSpecies,
} from "../src/aquarium/types";

afterEach(() => {
  reset_catalog_cache();
  reset_still_atlases();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

/** A cleaner shrimp: filmed clips, walking the rock. */
const shrimp: InvertebrateSpecies = {
  id: "lysmata_amboinensis",
  kind: "invertebrate",
  source: "pack",
  movement: "decor",
  role: ["cleaner"],
  atlas: { "1x": "/inv/lysmata.webp" },
  frame: [200, 80],
  columns: 7,
  clips: {
    swim: { from: 0, to: 39, fps: 8, loop: true },
    idle: { from: 40, to: 71, fps: 16, loop: true },
    turn: { from: 72, to: 93, fps: 16, loop: false },
  },
  facing: "right",
  length_frac: 0.96,
  size_cm: [5, 6],
  thumbnail: "/inv/thumb.webp",
  names: { en: "Cleaner shrimp" },
  scientific: "Lysmata amboinensis",
  water_types: ["marine"],
};

/** A snail: one frame, grazing the glass. */
const snail: InvertebrateSpecies = {
  id: "nerita",
  kind: "invertebrate",
  source: "pack",
  movement: "glass",
  role: ["algae_eater"],
  atlas: { "1x": "/inv/nerita.webp" },
  frame: [120, 120],
  columns: 1,
  clips: { still: { from: 0, to: 0, fps: 1, loop: false } },
  degraded: true,
  size_cm: [2, 3],
  names: { en: "Nerite snail" },
  water_types: ["marine"],
};

/** A pistol shrimp: it lives in a burrow on the sand, and digs it. */
const pistol: InvertebrateSpecies = {
  id: "alpheus_bellulus",
  kind: "invertebrate",
  source: "pack",
  movement: "ground",
  role: ["detritivore"],
  atlas: { "1x": "/inv/alpheus.webp" },
  frame: [200, 80],
  columns: 7,
  clips: { swim: { from: 0, to: 39, fps: 8, loop: true } },
  size_cm: [4, 5],
  behavior: { profile: "sand", burrow: true, digs: true, territory_cm: 12 },
  names: { en: "Tiger pistol shrimp" },
  water_types: ["marine"],
};

/** A feather duster: settled for good, and supple in the current. */
const duster: InvertebrateSpecies = {
  id: "sabellastarte",
  kind: "invertebrate",
  source: "pack",
  movement: "sessile",
  role: ["filter_feeder"],
  atlas: { "1x": "/inv/sabellastarte.webp" },
  frame: [160, 160],
  columns: 1,
  clips: { still: { from: 0, to: 0, fps: 1, loop: false } },
  degraded: true,
  flex: 0.7,
  period_s: 2.5,
  size_cm: [5, 10],
  names: { en: "Feather duster" },
  water_types: ["marine"],
};

/** A clam: settled too, and stiff. */
const clam: InvertebrateSpecies = {
  id: "tridacna_crocea",
  kind: "invertebrate",
  source: "pack",
  movement: "sessile",
  role: ["filter_feeder"],
  atlas: { "1x": "/inv/tridacna.webp" },
  frame: [200, 140],
  columns: 1,
  clips: { still: { from: 0, to: 0, fps: 1, loop: false } },
  size_cm: [5, 15],
  names: { en: "Crocea clam" },
  water_types: ["marine"],
};

/** Published without a picture: nothing to draw yet. */
const pictureless: InvertebrateSpecies = {
  id: "holothuria",
  kind: "invertebrate",
  source: "pack",
  movement: "ground",
  role: ["detritivore"],
  has_image: false,
  size_cm: [15, 30],
  names: { en: "Sea cucumber" },
  water_types: ["marine"],
};

const catalog: Catalog = {
  fish: [],
  corals: [],
  invertebrates: [shrimp, snail, pistol, duster, clam, pictureless],
  presets: [],
};

const env: SimEnv = {
  size: { length: 120, height: 50, width: 60 },
  sand_band: 0.1,
  hideouts: [{ x: 30, y: 40, d: 30, radius: 10 }],
};

function group(
  species: InvertebrateSpecies,
  count = 1,
  home: [number, number, number] | null = null,
): FishGroup {
  return {
    species: invertebrate_animal(species)!,
    line_id: species.id,
    count,
    size_cm: species.size_cm ?? [3, 5],
    home,
  };
}

function run(sim: FishSim, seconds: number): void {
  for (let t = 0; t < seconds; t += 1 / 30) sim.step(1 / 30);
}

/** Image stand-in: loads on the next tick. */
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin = "";
  decoding = "";
  width = 120;
  height = 80;
  private _src = "";
  get src(): string {
    return this._src;
  }
  set src(url: string) {
    this._src = url;
    setTimeout(() => this.onload?.());
  }
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("invertebrate assets", () => {
  it("gives a walking invertebrate the sprites of a fish", () => {
    const animal = invertebrate_animal(shrimp)!;
    expect(animal.kind).toBe("invertebrate");
    expect(animal.atlas["1x"]).toBe("/inv/lysmata.webp");
    expect(animal.frame).toEqual([200, 80]);
    expect(animal.columns).toBe(7);
    expect(animal.clips.swim.to).toBe(39);
    expect(animal.movement).toBe("decor");
    expect(animal.facing).toBe("right");
    // What the catalog leaves out is defaulted
    const plain = invertebrate_animal({
      ...snail,
      columns: undefined,
      clips: undefined,
    })!;
    expect(plain.columns).toBe(1);
    expect(plain.clips).toEqual({});
  });

  it("leaves out what the simulation does not move", () => {
    // Settled where it was placed: drawn like a plant, not simulated
    expect(invertebrate_animal(duster)).toBeNull();
    // No picture, or no frame to cut it into
    expect(invertebrate_animal(pictureless)).toBeNull();
    expect(invertebrate_animal({ ...snail, frame: undefined })).toBeNull();
  });

  it("bends a sessile invertebrate the current moves", async () => {
    vi.stubGlobal("Image", FakeImage);
    const ctx: any = { drawImage: () => undefined };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
    expect(still_sways(duster)).toBe(true);
    // Stiff, or filmed: nothing to generate
    expect(still_sways(clam)).toBe(false);
    expect(still_sways(shrimp)).toBe(false);
    await expect(still_atlas(duster)).resolves.not.toBeNull();
    await expect(still_atlas(clam)).resolves.toBeNull();
  });
});

describe("the surface an animal is bound to", () => {
  it("reads it off the species, else off its profile", () => {
    expect(surface_of(invertebrate_animal(shrimp)!)).toBe("decor");
    expect(surface_of(invertebrate_animal(snail)!)).toBe("glass");
    expect(surface_of(invertebrate_animal(pistol)!)).toBe("ground");
    // A fish says nothing: its profile tells where it lives
    const fish = (profile: any): FishSpecies =>
      ({
        id: "f",
        kind: "fish",
        source: "pack",
        frame: [128, 64],
        columns: 4,
        clips: {},
        atlas: { "1x": "/f.webp" },
        behavior: profile ? { profile } : undefined,
      }) as FishSpecies;
    expect(surface_of(fish("sand"))).toBe("ground");
    expect(surface_of(fish("benthic"))).toBe("decor");
    expect(surface_of(fish("shoal"))).toBe("swim");
    expect(surface_of(fish(null))).toBe("swim");
    // A sessile species never reaches the simulation: it swims if it does
    expect(surface_of({ ...fish(null), movement: "sessile" })).toBe("swim");
  });

  it("goes about its surface the way it suits", () => {
    expect(default_profile("ground")).toBe("sand");
    expect(default_profile("glass")).toBe("sand");
    expect(default_profile("decor")).toBe("benthic");
    expect(default_profile("swim")).toBe("cruiser");
  });

  it("keeps a snail against the glass, above the sand", () => {
    const sim = new FishSim(env, [group(snail, 3)], 30, "s");
    expect(sim.fish).toHaveLength(3);
    expect(sim.fish[0].movement).toBe("glass");
    // Its own slow pace, the species giving none
    expect(sim.fish[0].speed).toBeGreaterThan(0.2);
    expect(sim.fish[0].speed).toBeLessThanOrEqual(1);
    run(sim, 30);
    for (const f of sim.fish) {
      expect(f.d).toBeLessThan(2);
      expect(f.y).toBeLessThanOrEqual(sim.sand_y(f.x, f.d));
      expect(f.x).toBeGreaterThanOrEqual(0);
      expect(f.x).toBeLessThanOrEqual(env.size.length);
    }
  });

  it("keeps a crawler on the sand and a shrimp over the rock", () => {
    const sand = new FishSim(env, [group(pictureless_drawn(), 2)], 30, "s");
    run(sand, 20);
    for (const f of sand.fish)
      expect(f.y).toBeGreaterThan(env.size.height * 0.5);
    const rock = new FishSim(env, [group(shrimp, 2)], 30, "s");
    expect(rock.fish[0].profile).toBe("benthic");
    run(rock, 20);
    for (const f of rock.fish) expect(f.y).toBeGreaterThan(0);
  });

  it("leaves the pace of a fish alone", () => {
    const fish: FishSpecies = {
      id: "f",
      kind: "fish",
      source: "pack",
      frame: [128, 64],
      columns: 4,
      clips: {},
      atlas: { "1x": "/f.webp" },
    } as FishSpecies;
    const sim = new FishSim(
      env,
      [{ species: fish, line_id: "l", count: 1, size_cm: [5, 8] }],
      30,
      "s",
    );
    expect(sim.fish[0].speed).toBeGreaterThanOrEqual(4);
    expect(sim.fish[0].speed).toBeLessThanOrEqual(10);
  });
});

/** The sea cucumber, with a picture: a plain crawler of the sand. */
function pictureless_drawn(): InvertebrateSpecies {
  return {
    ...pictureless,
    has_image: true,
    atlas: { "1x": "/inv/holothuria.webp" },
    frame: [200, 100],
    columns: 1,
    clips: { still: { from: 0, to: 0, fps: 1, loop: false } },
  };
}

describe("the sand a digging shrimp raises", () => {
  const home: [number, number, number] = [60, 45, 30];

  function digging(): FishSim {
    const sim = new FishSim(env, [group(pistol, 1, home)], 30, "dig");
    sim.force_night(false);
    return sim;
  }

  it("works at the mouth of its burrow, half out", () => {
    const sim = digging();
    const f = sim.fish[0];
    expect(f.burrow).toBeTruthy();
    f.burrow!.mode = "work";
    f.burrow!.left = 60;
    run(sim, 5);
    expect(f.emerge).toBeCloseTo(WORK, 1);
    expect(sim.puffs.length).toBeGreaterThan(0);
  });

  it("raises its puffs, which rise, drift and settle", () => {
    const sim = digging();
    const f = sim.fish[0];
    f.burrow!.mode = "work";
    f.burrow!.left = 60;
    sim.flow = 1;
    // The first puff comes with the first step of the work
    sim.step(1 / 30);
    const puff = sim.puffs[0];
    expect(puff.vy).toBeLessThan(0);
    const from = puff.y;
    run(sim, 0.2);
    expect(puff.y).toBeLessThan(from);
    // Spreading as it goes, and showing at once then thinning out
    expect(puff_radius(puff)).toBeGreaterThan(puff.radius);
    expect(puff_alpha({ ...puff, age: 0 })).toBe(0);
    expect(puff_alpha({ ...puff, age: puff.life })).toBe(0);
    expect(puff_alpha({ ...puff, age: puff.life / 2 })).toBeGreaterThan(0);
    // None of them outlives its life
    run(sim, 10);
    f.burrow!.mode = "peek";
    run(sim, 5);
    expect(sim.puffs).toHaveLength(0);
  });

  it("only digs when its species does", () => {
    const modes = (species: InvertebrateSpecies) => {
      const sim = new FishSim(env, [group(species, 1, home)], 30, "dig");
      sim.force_night(false);
      const seen = new Set<string>();
      for (let i = 0; i < 4000; i++) {
        sim.step(1 / 30);
        seen.add(sim.fish[0].burrow!.mode);
      }
      return seen;
    };
    expect([...modes(pistol)]).toContain("work");
    const quiet = { ...pistol, behavior: { ...pistol.behavior, digs: false } };
    expect([...modes(quiet)]).not.toContain("work");
  });
});

describe("invertebrates in the scene", () => {
  function scene_doc() {
    let doc = ops.new_document("T");
    let view: string;
    doc.dimensions_cm = { length: 120, width: 60, height: 50 };
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.7));
    return { doc, view };
  }

  function line(
    doc: any,
    species: string,
    extra: Record<string, any> = {},
  ): any {
    const [out] = ops.add_line(doc, "main", {
      species,
      kind: "invertebrate",
      count: 1,
      ...extra,
    });
    return out;
  }

  it("walks the lines whose species moves, and leaves the others", () => {
    let { doc } = scene_doc();
    doc = line(doc, shrimp.id);
    doc = line(doc, snail.id, { count: 2 });
    // Settled, unknown, pictureless or empty: not simulated
    doc = line(doc, duster.id, { home: [0.5, 0.8, 0.5] });
    doc = line(doc, "mystery_crab");
    doc = line(doc, pictureless.id);
    doc = line(doc, shrimp.id, { count: 0 });
    const groups = animal_groups(doc.waters.main, catalog, {
      length: 120,
      height: 50,
      width: 60,
    });
    expect(groups.map((g) => g.species.id)).toEqual([shrimp.id, snail.id]);
    expect(groups[1].count).toBe(2);
    expect(groups[0].size_cm).toEqual([5, 6]);
  });

  it("settles a sessile line where its home was placed", () => {
    let { doc } = scene_doc();
    doc = line(doc, duster.id, { count: 3, home: [0.4, 0.6, 0.5] });
    const projection = new WaterProjection(rect_quad(0.1, 0.1, 0.9, 0.7));
    const items = sessile_scenes(
      doc.waters.main,
      catalog,
      projection,
      { length: 120, height: 50, width: 60 },
      "s",
    );
    expect(items).toHaveLength(3);
    // The first one exactly on the home, the others around it
    expect(items[0].pos).toEqual(projection.to_picture(0.4, 0.6, 0.5));
    expect(items[1].pos).not.toEqual(items[0].pos);
    for (const item of items) {
      expect(item.species.id).toBe(duster.id);
      expect(item.fit).toBe("width");
      expect(item.floats).toBe(false);
      expect(item.size_cm).toBeGreaterThanOrEqual(5);
      expect(item.size_cm).toBeLessThanOrEqual(10);
    }
    // A crowd is capped
    doc = line(doc, clam.id, { count: 200, home: [0.5, 0.5, 0.5] });
    const crowd = sessile_scenes(doc.waters.main, catalog, projection);
    expect(crowd.filter((i) => i.species.id === clam.id)).toHaveLength(24);
  });

  it("settles nothing it cannot place or draw", () => {
    let { doc } = scene_doc();
    // No home yet, a walking species, an unknown one, no picture
    doc = line(doc, duster.id);
    doc = line(doc, shrimp.id, { home: [0.5, 0.5, 0.5] });
    doc = line(doc, "mystery_clam", { home: [0.5, 0.5, 0.5] });
    doc = line(doc, pictureless.id, { home: [0.5, 0.5, 0.5] });
    doc = line(doc, duster.id, { count: 0, home: [0.5, 0.5, 0.5] });
    const projection = new WaterProjection(rect_quad(0.1, 0.1, 0.9, 0.7));
    expect(sessile_scenes(doc.waters.main, catalog, projection)).toEqual([]);
    expect(sessile_scenes(doc.waters.main, null, projection)).toEqual([]);
    // A water saved before the invertebrates
    expect(
      sessile_scenes(
        { ...doc.waters.main, livestock: undefined } as any,
        catalog,
        projection,
      ),
    ).toEqual([]);
  });

  it("falls back to a size when neither the line nor the species says", () => {
    let { doc } = scene_doc();
    doc = line(doc, duster.id, { size_cm: null, home: [0.5, 0.5, 0.5] });
    const projection = new WaterProjection(rect_quad(0.1, 0.1, 0.9, 0.7));
    const [item] = sessile_scenes(
      doc.waters.main,
      { ...catalog, invertebrates: [{ ...duster, size_cm: undefined }] },
      projection,
    );
    expect(item.size_cm).toBeGreaterThanOrEqual(3);
    expect(item.size_cm).toBeLessThanOrEqual(5);
  });

  it("draws the sessile ones and the sand of the burrows", async () => {
    vi.stubGlobal("Image", FakeImage);
    let { doc, view } = scene_doc();
    doc = line(doc, duster.id, { home: [0.4, 0.6, 0.5] });
    doc = line(doc, pistol.id, { home: [0.5, 0.9, 0.5] });
    const drawn: any[][] = [];
    const circles: any[] = [];
    const ctx: any = {
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      drawImage: (...args: any[]) => drawn.push(args),
      arc: (...args: any[]) => circles.push(args),
    };
    for (const name of [
      "save",
      "restore",
      "translate",
      "rotate",
      "scale",
      "clearRect",
      "beginPath",
      "fill",
      "fillRect",
      "moveTo",
      "lineTo",
      "closePath",
      "clip",
      "rect",
      "ellipse",
      "stroke",
      "putImageData",
    ])
      ctx[name] = () => undefined;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 500;
    const scene = new AquariumScene(canvas, null!);
    scene.configure({
      doc,
      view_id: view,
      catalog,
      background: null,
      seed: "s",
    });
    expect(scene.regions[0].sessiles).toHaveLength(1);
    await tick();
    await tick();
    const item = scene.regions[0].sessiles[0];
    expect(item.atlas).not.toBeNull();

    // Its sheet is read as the current opens it
    const sim = scene.regions[0].sim;
    sim.flow = 1;
    item.sway.phase = 0;
    scene.step(0.5);
    expect(item.frame).toBeGreaterThan(0);

    // The sand of a digging shrimp is drawn as soft grains
    const f = sim.fish[0];
    f.burrow!.mode = "work";
    f.burrow!.left = 60;
    for (let i = 0; i < 90; i++) scene.step(1 / 30);
    expect(sim.puffs.length).toBeGreaterThan(0);
    drawn.length = 0;
    circles.length = 0;
    scene.draw();
    expect(drawn.some((c) => c[0] === item.atlas!.sheet)).toBe(true);
    expect(circles.length).toBeGreaterThan(0);
    // A puff that has lived its life is not drawn any more
    for (const p of sim.puffs) p.age = p.life;
    circles.length = 0;
    scene.draw();
    expect(circles).toHaveLength(0);
  });
});

describe("invertebrates in the editor", () => {
  function make_hass(doc: any) {
    return {
      config: { components: ["reeftank"] },
      language: "en",
      states: {},
      entities: {},
      devices: {},
      areas: {},
      floors: {},
      callService: vi.fn(),
      callWS: vi.fn(async (msg: any) => {
        switch (msg.type) {
          case "reeftank/catalog":
            return catalog;
          case "reeftank/aquarium/get":
            return {
              document: structuredClone(doc),
              entities: {},
              images: {},
            };
          case "reeftank/aquarium/list":
            return [];
          default:
            return null;
        }
      }),
      fetchWithAuth: vi.fn(),
    } as any;
  }

  const flush = () => new Promise((r) => setTimeout(r, 0));

  const pointer = (type: string, x: number, y: number) =>
    new MouseEvent(type, {
      clientX: x,
      clientY: y,
      bubbles: true,
      composed: true,
    }) as any;

  async function open_editor(lines: any[] = []) {
    let doc = ops.new_document("Reefer");
    doc.id = "a1b2";
    let view: string;
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.6));
    for (const line of lines) {
      [doc] = ops.add_line(doc, "main", { kind: "invertebrate", ...line });
    }
    const editor: any = open_scene_editor(make_hass(doc), "a1b2", vi.fn());
    await flush();
    await flush();
    await editor.updateComplete;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 1000,
      height: 500,
      right: 1000,
      bottom: 500,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    editor._view_id = view;
    editor._tab = "livestock";
    await editor.updateComplete;
    return { editor, view };
  }

  /** The head of a group of the panel, by its label. */
  const head = (root: ParentNode, label: string) =>
    [...root.querySelectorAll(".group-head")].find(
      (b: any) => b.querySelector("span")?.textContent.trim() === label,
    ) as HTMLButtonElement;

  const group_of = (root: ParentNode, label: string) =>
    head(root, label).closest("fieldset") as HTMLFieldSetElement;

  it("opens one group at a time, and one species in it", async () => {
    const { editor } = await open_editor([
      { species: shrimp.id, count: 2 },
      { species: snail.id, count: 5 },
    ]);
    const root = editor.shadowRoot;
    // Four groups, all closed, each saying how much it holds
    expect(root.querySelectorAll("fieldset.group")).toHaveLength(4);
    expect(root.querySelectorAll(".card")).toHaveLength(0);
    expect(
      head(root, "Invertebrates").querySelector("small").textContent.trim(),
    ).toBe("2");

    head(root, "Invertebrates").click();
    await editor.updateComplete;
    expect(editor._group).toBe("invertebrates");
    const cards = group_of(root, "Invertebrates").querySelectorAll(".card");
    expect(cards).toHaveLength(2);
    // Picture and name only, with where it lives and how many
    expect(cards[0].textContent).toContain("Cleaner shrimp");
    expect(cards[0].textContent).toContain("on the rock");
    expect(cards[0].textContent).toContain("×2");
    expect(cards[1].textContent).toContain("on the glass");
    expect(cards[0].querySelectorAll("input")).toHaveLength(0);

    // Opening one shows its settings; opening the other closes it
    (cards[0].querySelector(".entry-head") as HTMLButtonElement).click();
    await editor.updateComplete;
    expect(editor._entry).toBe(editor.doc.waters.main.livestock[0].id);
    expect(cards[0].querySelectorAll("input").length).toBeGreaterThan(0);
    (cards[1].querySelector(".entry-head") as HTMLButtonElement).click();
    await editor.updateComplete;
    expect(editor._entry).toBe(editor.doc.waters.main.livestock[1].id);
    expect(
      group_of(root, "Invertebrates")
        .querySelectorAll(".card")[0]
        .querySelectorAll("input"),
    ).toHaveLength(0);

    // Another group closes this one, and the species it had open
    head(root, "Fish").click();
    await editor.updateComplete;
    expect(editor._group).toBe("fish");
    expect(editor._entry).toBeNull();
    expect(
      group_of(root, "Invertebrates").querySelectorAll(".card"),
    ).toHaveLength(0);
    // Clicking its own head again closes it
    head(root, "Fish").click();
    await editor.updateComplete;
    expect(editor._group).toBeNull();
  });

  it("adds a species, edits its line and removes it", async () => {
    const { editor } = await open_editor();
    const root = editor.shadowRoot;
    head(root, "Invertebrates").click();
    await editor.updateComplete;
    const search = group_of(root, "Invertebrates").querySelector(
      ".picker input",
    ) as HTMLInputElement;
    search.dispatchEvent(new Event("focus"));
    search.value = "shrimp";
    search.dispatchEvent(new Event("input"));
    await editor.updateComplete;
    const picks = group_of(root, "Invertebrates").querySelectorAll(
      ".picker-list .pick",
    );
    // Only the species of the catalog: an invertebrate cannot be invented
    expect(picks).toHaveLength(2);
    (picks[0] as HTMLElement).click();
    await editor.updateComplete;
    const line = () => editor.doc.waters.main.livestock[0];
    expect(line()).toMatchObject({
      kind: "invertebrate",
      species: shrimp.id,
      size_cm: [5, 6],
    });
    // Added and opened at once
    expect(editor._entry).toBe(line().id);

    const card = () =>
      group_of(root, "Invertebrates").querySelector(".card") as HTMLElement;
    const inputs = () =>
      [...card().querySelectorAll("input")] as HTMLInputElement[];
    inputs()[0].value = "4";
    inputs()[0].dispatchEvent(new Event("change"));
    expect(line().count).toBe(4);
    await editor.updateComplete;
    inputs()[3].value = "Pairs with a goby";
    inputs()[3].dispatchEvent(new Event("change"));
    expect(line().note).toBe("Pairs with a goby");
    await editor.updateComplete;
    (card().querySelector("button.icon.remove") as HTMLButtonElement).click();
    expect(editor.doc.waters.main.livestock).toHaveLength(0);
    expect(editor._entry).toBeNull();
  });

  it("asks where a sessile species settled, and marks its home", async () => {
    const { editor } = await open_editor();
    const root = editor.shadowRoot;
    head(root, "Invertebrates").click();
    await editor.updateComplete;
    const search = group_of(root, "Invertebrates").querySelector(
      ".picker input",
    ) as HTMLInputElement;
    search.dispatchEvent(new Event("focus"));
    search.value = "feather";
    search.dispatchEvent(new Event("input"));
    await editor.updateComplete;
    (
      group_of(root, "Invertebrates").querySelector(
        ".picker-list .pick",
      ) as HTMLElement
    ).click();
    await editor.updateComplete;
    const line = () => editor.doc.waters.main.livestock[0];
    // Settled: the home tool is armed straight away, and it says so
    expect(editor._tool).toBe("home");
    expect(editor._home_line).toBe(line().id);
    expect(root.textContent).toContain("place it where it settled");

    // Placed on the picture, where the mark then stands
    root
      .querySelector(".stage")
      .dispatchEvent(pointer("pointerdown", 500, 250));
    expect(line().home).toEqual([0.5, 0.8, 0.5]);
    expect(editor._tool).toBe("select");
    await editor.updateComplete;
    expect(root.textContent).not.toContain("place it where it settled");
    const mark = root.querySelector(".home");
    expect(mark.getAttribute("title")).toBe("Feather duster");
  });

  it("says when the catalog does not know a species", async () => {
    const { editor } = await open_editor([
      { species: "mystery_crab", count: 1 },
    ]);
    const root = editor.shadowRoot;
    head(root, "Invertebrates").click();
    await editor.updateComplete;
    expect(group_of(root, "Invertebrates").textContent).toContain(
      "not in the catalog",
    );
    // And an icon stands in for the picture it has not got
    const icon: any = species_thumb(undefined, "invertebrate");
    expect(JSON.stringify(icon.values)).not.toContain("webp");
  });
});
