/**
 * Plants of the aquarium view: catalog assets, document operations, drawing
 * and the editor's placing. Plants are still pictures for now — the motion
 * the current gives them comes later, generated from the same picture.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { nothing } from "lit";
import "../src/aquarium/index";
import {
  AquariumScene,
  step_sway,
  step_still_clip,
  plant_height,
  step_drift,
  sway_window,
  type PlantScene,
  type StillSway,
} from "../src/aquarium/scene";
import {
  BEND_FRAMES,
  BEND_HEIGHT,
  BEND_SLICES,
  bend_amplitude,
  bend_exponent,
  bend_offset,
  build_still_sheet,
  still_atlas,
  still_clip,
  plant_floats,
  still_frames,
  still_image_url,
  still_sways,
  reset_still_atlases,
} from "../src/aquarium/sprites";
import { rect_quad } from "../src/aquarium/geometry";
import {
  open_scene_editor,
  species_thumb,
} from "../src/aquarium/editor/scene_editor";
import { reset_catalog_cache } from "../src/aquarium/api";
import * as ops from "../src/aquarium/editor/ops";
import type { Catalog, PlantSpecies } from "../src/aquarium/types";

afterEach(() => {
  reset_catalog_cache();
  reset_still_atlases();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

/**
 * A plant as the catalog publishes it: an atlas of a single frame (a still
 * picture), with how far the current bends it.
 */
const vallisneria: PlantSpecies = {
  id: "vallisneria_spiralis",
  kind: "plant",
  source: "pack",
  zone: "background",
  atlas: { "1x": "/plants/vallisneria.webp" },
  frame: [320, 320],
  columns: 1,
  clips: { still: { from: 0, to: 0, fps: 1, loop: false } },
  degraded: true,
  thumbnail: "/plants/thumb.webp",
  size_cm: [20, 60],
  flex: 0.9,
  period_s: 3.5,
  names: { en: "Vallisneria" },
  scientific: "Vallisneria spiralis",
  water_types: ["marine", "freshwater"],
};

/** An entry shipping an atlas and nothing else: drawn as it comes. */
const bare: PlantSpecies = {
  id: "bare_weed",
  kind: "plant",
  source: "user",
  zone: "midground",
  atlas: { "1x": "/plants/bare.webp" },
  size_cm: [10, 20],
};

/** A filmed plant: it ships an atlas and is played like a fish. */
const filmed: PlantSpecies = {
  id: "cabomba",
  kind: "plant",
  source: "pack",
  zone: "midground",
  atlas: { "1x": "/plants/cabomba.webp" },
  frame: [128, 256],
  columns: 4,
  clips: { sway: { from: 0, to: 3, fps: 8, loop: true, pingpong: true } },
};

/** A floating plant: it rides the surface instead of standing. */
const frogbit: PlantSpecies = {
  id: "limnobium_laevigatum",
  kind: "plant",
  source: "pack",
  zone: "floating",
  atlas: { "1x": "/plants/frogbit.webp" },
  frame: [320, 320],
  columns: 1,
  clips: { still: { from: 0, to: 0, fps: 1, loop: false } },
  flex: 0.6,
  size_cm: [3, 6],
  names: { en: "Frogbit" },
};

/** Published without a picture: nothing to draw yet. */
const pictureless: PlantSpecies = {
  id: "anubias_nana",
  kind: "plant",
  source: "pack",
  zone: "foreground",
  has_image: false,
};

/** Image stand-in: loads asynchronously, fails on a URL holding "bad". */
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin = "";
  decoding = "";
  width = 50;
  height = 200;
  private _src = "";
  get src(): string {
    return this._src;
  }
  set src(url: string) {
    this._src = url;
    setTimeout(() =>
      url.includes("bad") ? this.onerror?.() : this.onload?.(),
    );
  }
}

/** A 2D context that records the pictures drawn through it. */
function recording_ctx(calls: any[][]): any {
  const c: any = { globalAlpha: 1, globalCompositeOperation: "source-over" };
  for (const name of [
    "save",
    "restore",
    "translate",
    "rotate",
    "scale",
    "clearRect",
    "beginPath",
    "arc",
    "fill",
    "fillRect",
    "moveTo",
    "lineTo",
    "closePath",
    "stroke",
    "clip",
    "ellipse",
    "putImageData",
  ])
    c[name] = () => undefined;
  c.drawImage = (...args: any[]) => calls.push(args);
  return c;
}

/** A stage of 1000 x 500 pixels at the origin. */
function stage_1000x500(): void {
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
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("plant assets", () => {
  it("says what a plant is drawn from, and how many frames it has", () => {
    expect(still_image_url(vallisneria)).toBe("/plants/vallisneria.webp");
    expect(still_image_url(filmed)).toBe("/plants/cabomba.webp");
    expect(still_image_url(pictureless)).toBeNull();
    // A single frame is a still picture; several are an animation to play
    expect(still_frames(vallisneria)).toBe(1);
    expect(still_frames(bare)).toBe(1);
    expect(still_frames(filmed)).toBe(4);
    expect(still_frames({ ...vallisneria, clips: {} })).toBe(1);
  });
});

describe("the sway of a plant", () => {
  it("reaches further the suppler the plant, and curves the lower", () => {
    expect(bend_amplitude(1, 300)).toBe(135);
    expect(bend_amplitude(0.5, 300)).toBe(68);
    expect(bend_amplitude(0, 300)).toBe(0);
    // Out of bounds values are taken as the bounds
    expect(bend_amplitude(4, 300)).toBe(bend_amplitude(1, 300));
    // A supple stem curves over its whole length, a stiff one at its tip
    expect(bend_exponent(0.9)).toBeCloseTo(1.3, 5);
    expect(bend_exponent(0.1)).toBeCloseTo(2.1, 5);
    expect(bend_exponent(0.9)).toBeLessThan(bend_exponent(0.1));
  });

  it("holds the foot still and carries the tip", () => {
    const amp = 100;
    const k = bend_exponent(0.9);
    expect(bend_offset(0, 1, amp, k)).toBe(0);
    expect(bend_offset(1, 1, amp, k)).toBeCloseTo(amp, 5);
    expect(bend_offset(1, 0, amp, k)).toBe(0);
    // Upright at rest, and always further up the stem
    const half = bend_offset(0.5, 1, amp, k);
    expect(half).toBeGreaterThan(0);
    expect(half).toBeLessThan(amp);
    expect(bend_offset(0.8, 1, amp, k)).toBeGreaterThan(half);
    // A stiff plant keeps more of its stem straight
    expect(bend_offset(0.5, 1, amp, bend_exponent(0.1))).toBeLessThan(half);
  });

  it("builds a sheet of bends from a still picture", () => {
    const calls: any[][] = [];
    const ctx: any = {};
    ctx.drawImage = (...args: any[]) => calls.push(args);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
    const img = { width: 100, height: 400 } as any;
    const atlas = build_still_sheet(img, 0.9)!;

    // Built at the working height, never taller than the picture
    const height = BEND_HEIGHT;
    const width = Math.round(100 * (height / 400));
    const amplitude = bend_amplitude(0.9, height);
    const [fw, fh] = atlas.frame;
    expect(fh).toBe(height);
    expect(fw).toBe(width + amplitude);
    expect(atlas.frames).toBe(BEND_FRAMES);
    expect(atlas.sheet.width).toBe(fw * BEND_FRAMES);
    expect(atlas.sheet.height).toBe(height);
    // The foot stands in the middle of the picture, not of the frame: the
    // room to lean into is on one side
    expect(atlas.anchor_x).toBeCloseTo(width / 2 / fw, 5);
    expect(atlas.anchor_x).toBeLessThan(0.5);

    // One slice per row and per frame
    expect(calls).toHaveLength(BEND_FRAMES * BEND_SLICES);
    const frame_of = (i: number) =>
      calls.slice(i * BEND_SLICES, (i + 1) * BEND_SLICES);
    // Upright: every row at the left edge of its frame
    expect(frame_of(0).every((c) => c[5] === 0)).toBe(true);
    // Fully bent: the tip has gone almost all the way, the foot stayed
    const last = frame_of(BEND_FRAMES - 1);
    const left = (BEND_FRAMES - 1) * fw;
    expect(last[0][5] - left).toBeGreaterThan(0.8 * amplitude);
    expect(last[0][5] - left).toBeLessThanOrEqual(amplitude);
    expect(last[BEND_SLICES - 1][5] - left).toBeLessThan(2);
    // Rows cover the picture without a gap, overlapping by a pixel
    expect(last[0][6]).toBe(0);
    const bottom = last[BEND_SLICES - 1];
    expect(bottom[6] + bottom[8]).toBe(height);
  });

  it("builds nothing it cannot draw", () => {
    expect(build_still_sheet({ width: 0, height: 0 } as any, 1)).toBeNull();
    expect(build_still_sheet({ width: 10, height: 0 } as any, 1)).toBeNull();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(build_still_sheet({ width: 10, height: 10 } as any, 1)).toBeNull();
  });

  it("has no sheet for a plant the current does not move", async () => {
    // No flex: a moss, drawn as it is
    await expect(still_atlas({ ...vallisneria, flex: 0 })).resolves.toBeNull();
    await expect(
      still_atlas({ ...vallisneria, flex: undefined }),
    ).resolves.toBeNull();
    // Several frames of its own: played as they come
    await expect(still_atlas(filmed)).resolves.toBeNull();
    expect(still_clip(filmed)?.to).toBe(3);
    // A still picture is a clip of one frame; an entry may ship none
    expect(still_clip(vallisneria)?.to).toBe(0);
    expect(still_clip(bare)).toBeNull();
  });

  it("knows which plants it has to animate itself", () => {
    expect(still_sways(vallisneria)).toBe(true);
    // Several frames: they are played as they come
    expect(still_sways(filmed)).toBe(false);
    // No picture, or a plant the current does not bend
    expect(still_sways(pictureless)).toBe(false);
    expect(still_sways({ ...vallisneria, flex: 0 })).toBe(false);
    expect(still_sways({ ...vallisneria, flex: undefined })).toBe(false);
    // Floating: it wanders along the surface, it does not bend
    expect(still_sways(frogbit)).toBe(false);
    expect(plant_floats(frogbit)).toBe(true);
    expect(plant_floats(vallisneria)).toBe(false);
  });

  it("has no sheet for a floating plant, however supple", async () => {
    await expect(still_atlas(frogbit)).resolves.toBeNull();
  });

  it("wanders a floating plant along the surface", () => {
    const sway = () => ({
      frames: 8,
      period_s: 3,
      phase: 0,
      amp: 1,
      drift_phase: 0,
    });
    // On its spot at rest, and the phase runs on
    const s1 = sway();
    expect(step_drift(s1, 0, 0)).toBe(0);
    expect(s1.drift_phase).toBe(0);
    step_drift(s1, 0, 1);
    expect(s1.drift_phase).toBeGreaterThan(0);

    // A quarter of a wander away: as far as the current carries it
    const quiet = { ...sway(), drift_phase: Math.PI / 2 };
    const wavy = { ...sway(), drift_phase: Math.PI / 2 };
    const near = step_drift(quiet, 0, 0);
    const far = step_drift(wavy, 1, 0);
    expect(near).toBeGreaterThan(0);
    expect(far).toBeGreaterThan(near);
    // Never out of its corner of the tank
    expect(far).toBeLessThan(0.07);
    // And back the other way
    const back = { ...sway(), drift_phase: -Math.PI / 2 };
    expect(step_drift(back, 1, 0)).toBeCloseTo(-far, 5);

    // The stronger the current, the quicker the wander
    const slow = sway();
    const quick = sway();
    step_drift(slow, 0, 1);
    step_drift(quick, 1, 1);
    expect(quick.drift_phase).toBeGreaterThan(slow.drift_phase);
  });

  it("opens the sway with the flow", () => {
    const frames = 8;
    // At rest it barely trembles, in full wave it lies right down
    expect(sway_window(frames, 0, 1)).toBe(1);
    expect(sway_window(frames, 1, 1)).toBe(frames - 1);
    expect(sway_window(frames, 0.5, 1)).toBeGreaterThan(
      sway_window(frames, 0.1, 1),
    );
    // Each plant reaches a little further or a little less
    expect(sway_window(frames, 1, 0.85)).toBeLessThanOrEqual(
      sway_window(frames, 1, 1.15),
    );
    // A plant whose window is closed stands still
    expect(sway_window(frames, 0, 0.2)).toBe(0);
  });

  it("plays the window back and forth", () => {
    const sway = (): StillSway => ({
      frames: 8,
      period_s: 2,
      phase: 0,
      amp: 1,
    });
    const s1 = sway();
    const seen = new Set<number>();
    for (let i = 0; i < 60; i++) seen.add(step_sway(s1, 1, 0.05));
    // Every frame of the sheet is reached, and none beyond it
    expect(Math.min(...seen)).toBe(0);
    expect(Math.max(...seen)).toBe(7);

    // One full sway takes the period the current leaves it
    const one = sway();
    const end = sway_window(8, 1, 1);
    step_sway(one, 1, 2 / (0.6 + 0.8));
    expect(one.phase).toBeCloseTo(2 * end, 5);

    // And the stronger the current, the more of a sway in the same time
    const cycles = (flow: number) => {
      const p = sway();
      step_sway(p, flow, 1);
      return p.phase / (2 * sway_window(8, flow, 1));
    };
    expect(cycles(1)).toBeGreaterThan(cycles(0.5));
    expect(cycles(0.5)).toBeGreaterThan(cycles(0));

    // Standing still: no frame, and no phase running away
    const still = { ...sway(), amp: 0.1 };
    expect(step_sway(still, 0, 1)).toBe(0);
    expect(still.phase).toBe(0);
  });

  it("plays the clip of a filmed plant, faster with the current", () => {
    const p = {
      species: filmed,
      sway: { frames: 0, period_s: 3, phase: 0, amp: 1 },
    } as PlantScene;
    expect(step_still_clip(p, 0, 0.5)).toBeGreaterThanOrEqual(0);
    const quiet = p.sway.phase;
    p.sway.phase = 0;
    step_still_clip(p, 1, 0.5);
    expect(p.sway.phase).toBeGreaterThan(quiet);
    // Without a clip there is nothing to play
    const bare = {
      species: { ...filmed, clips: {} },
      sway: { frames: 0, period_s: 3, phase: 0, amp: 1 },
    } as PlantScene;
    expect(step_still_clip(bare, 1, 0.5)).toBe(0);
    expect(bare.sway.phase).toBe(0);
  });
});

describe("a plant growing", () => {
  const day = 86400000;
  const now = Date.parse("2026-06-01T12:00:00Z");
  const planted = (added: string | null, size_cm = 20) =>
    ({
      id: "p",
      species: vallisneria.id,
      name: "",
      pos: [0.5, 0.8],
      z: 0.5,
      size_cm,
      added,
      note: "",
    }) as any;

  it("stands at the height it was planted at", () => {
    expect(plant_height(planted("2026-06-01"), vallisneria, now)).toBe(20);
    // Planted ahead of today (a clock out of step): still its own height
    expect(plant_height(planted("2026-09-01"), vallisneria, now)).toBe(20);
  });

  it("grows into the size of its species over a season", () => {
    // Vallisneria grows to 60 cm; planted at 20, a quarter of the way
    const quarter = plant_height(
      planted(new Date(now - 45 * day).toISOString().slice(0, 10)),
      vallisneria,
      now,
    );
    expect(quarter).toBeCloseTo(30, 5);
    const half = plant_height(
      planted(new Date(now - 90 * day).toISOString().slice(0, 10)),
      vallisneria,
      now,
    );
    expect(half).toBeCloseTo(40, 5);
    // And no further than its species goes
    const old = plant_height(
      planted(new Date(now - 800 * day).toISOString().slice(0, 10)),
      vallisneria,
      now,
    );
    expect(old).toBe(60);
  });

  it("grows only on what it knows", () => {
    // No date, or one that means nothing
    expect(plant_height(planted(null), vallisneria, now)).toBe(20);
    expect(plant_height(planted("whenever"), vallisneria, now)).toBe(20);
    // A species that does not say how big it gets
    expect(
      plant_height(
        planted("2020-01-01"),
        { ...vallisneria, size_cm: undefined },
        now,
      ),
    ).toBe(20);
    // Planted already grown: it does not shrink back
    expect(plant_height(planted("2020-01-01", 80), vallisneria, now)).toBe(80);
  });
});

describe("plant operations", () => {
  function planted() {
    let doc = ops.new_document("T");
    let view: string;
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.7));
    let id: string;
    [doc, id] = ops.add_plant(doc, "main", vallisneria, view, [0.4, 0.6]);
    return { doc, view, id };
  }

  it("plants one, with the height of its species", () => {
    const { doc, view, id } = planted();
    const plant = doc.waters.main.plants![0];
    expect(plant.id).toBe(id);
    expect(plant.species).toBe("vallisneria_spiralis");
    expect(plant.size_cm).toBe(40);
    expect(plant.view).toBe(view);
    expect(plant.pos).toEqual([0.4, 0.6]);
    expect(ops.depth_name(plant.z)).toBe("middle");
    expect(plant.added).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("falls back to a default height, and creates the water", () => {
    const doc = ops.new_document("T");
    const [out] = ops.add_plant(doc, "pond", { id: "mystery" }, null, [0.5, 1]);
    expect(out.waters.pond.plants![0].size_cm).toBe(20);
    expect(out.waters.pond.plants![0].view).toBeNull();
  });

  it("moves, resizes and uproots a plant", () => {
    const { doc, id } = planted();
    const moved = ops.update_plant(doc, "main", id, {
      pos: [1.4, -0.2],
      size_cm: 55,
    });
    expect(moved.waters.main.plants![0].pos).toEqual([1, 0]);
    expect(moved.waters.main.plants![0].size_cm).toBe(55);
    // unknown plant, unknown water: nothing happens
    expect(ops.update_plant(doc, "main", "nope", { size_cm: 1 })).toEqual(doc);
    expect(ops.update_plant(doc, "pond", id, { size_cm: 1 })).toEqual(doc);
    const gone = ops.remove_plant(moved, "main", id);
    expect(gone.waters.main.plants).toEqual([]);
    expect(ops.remove_plant(gone, "pond", id)).toEqual(gone);
  });

  it("never modifies its input", () => {
    const { doc, id } = planted();
    const before = JSON.stringify(doc);
    ops.update_plant(doc, "main", id, { pos: [0.1, 0.1] });
    ops.remove_plant(doc, "main", id);
    ops.add_plant(doc, "main", vallisneria, null, [0.2, 0.2]);
    expect(JSON.stringify(doc)).toBe(before);
  });

  it("keeps the plants of a water a preset touches", () => {
    const { doc } = planted();
    const out = ops.apply_preset(doc, {
      id: "p",
      source: "bundled",
      waters: { main: { name: "Main" } },
      views: { front: { name: "Front" } },
    });
    expect(out.waters.main.plants).toHaveLength(1);
  });

  it("uproots the plants of a view it removes", () => {
    const { doc, view } = planted();
    const out = ops.remove_view(doc, view);
    expect(out.waters.main.plants).toEqual([]);
  });

  it("handles a water saved before the plants", () => {
    const { doc, view, id } = planted();
    delete doc.waters.main.plants;
    expect(ops.remove_view(doc, view).waters.main.plants).toEqual([]);
    expect(ops.remove_plant(doc, "main", id).waters.main.plants).toEqual([]);
    const [out] = ops.add_plant(doc, "main", vallisneria, view, [0.5, 0.5]);
    expect(out.waters.main.plants).toHaveLength(1);
  });
});

describe("plants in the scene", () => {
  function scene_doc() {
    let doc = ops.new_document("T");
    let view: string;
    doc.dimensions_cm = { length: 120, width: 60, height: 50 };
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.7));
    [doc] = ops.add_plant(doc, "main", vallisneria, view, [0.3, 0.6]);
    // not in the catalog, and published without a picture: not drawn
    [doc] = ops.add_plant(doc, "main", { id: "unknown" }, view, [0.5, 0.6]);
    [doc] = ops.add_plant(doc, "main", pictureless, view, [0.6, 0.6]);
    // on another view: not drawn here either
    [doc] = ops.add_plant(doc, "main", vallisneria, "elsewhere", [0.7, 0.6]);
    return { doc, view };
  }

  const catalog: Catalog = {
    fish: [],
    corals: [],
    plants: [vallisneria, pictureless],
    presets: [],
  };

  it("keeps only the plants of the view that have a picture", () => {
    const { doc, view } = scene_doc();
    const scene = new AquariumScene(document.createElement("canvas"), null!);
    scene.configure({
      doc,
      view_id: view,
      catalog,
      background: null,
      seed: "s",
    });
    expect(scene.regions[0].plants).toHaveLength(1);
    expect(scene.regions[0].plants[0].url).toBe("/plants/vallisneria.webp");

    // Planted today: drawn at the height it was given
    expect(scene.regions[0].plants[0].size_cm).toBe(40);

    // A plant with no view of its own stands on whichever view shows it
    const [more] = ops.add_plant(doc, "main", vallisneria, null, [0.2, 0.6]);
    scene.configure({
      doc: more,
      view_id: view,
      catalog,
      background: null,
      seed: "s",
    });
    expect(scene.regions[0].plants).toHaveLength(2);

    // A water saved before the plants
    const old = structuredClone(doc);
    delete old.waters.main.plants;
    scene.configure({
      doc: old,
      view_id: view,
      catalog,
      background: null,
      seed: "s",
    });
    expect(scene.regions[0].plants).toHaveLength(0);
  });

  it("draws a plant standing on its foot", () => {
    let doc = ops.new_document("T");
    let view: string;
    doc.dimensions_cm = { length: 120, width: 60, height: 50 };
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.7));
    [doc] = ops.add_plant(doc, "main", bare, view, [0.3, 0.6]);
    const drawn: any[][] = [];
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      recording_ctx(drawn),
    );
    // The scene sizes itself from the box of its canvas
    stage_1000x500();
    const canvas = document.createElement("canvas");
    const scene = new AquariumScene(canvas, null!);
    scene.configure({
      doc,
      view_id: view,
      catalog: { fish: [], corals: [], plants: [bare], presets: [] },
      background: null,
      seed: "s",
    });
    // Nothing drawn while its picture is still loading
    scene.draw();
    expect(drawn).toHaveLength(0);
    const img = document.createElement("img");
    img.width = 100;
    img.height = 200;
    (scene as any)._atlases.set("/plants/bare.webp", img);
    scene.draw();
    const [src, , , , , dx, dy, w, h] = drawn.find((a) => a[0] === img)!;
    expect(src).toBe(img);
    // Twice as tall as it is wide, its foot where it was planted
    expect(w / h).toBeCloseTo(0.5, 5);
    expect(dx + w / 2).toBeCloseTo(0.3 * 1000, 5);
    expect(dy + h).toBeCloseTo(0.6 * 500, 5);
    expect(h).toBeGreaterThan(0);

    // A picture whose height is not known yet: drawn square
    drawn.length = 0;
    const flat = document.createElement("img");
    flat.width = 100;
    flat.height = 0;
    (scene as any)._atlases.set("/plants/bare.webp", flat);
    scene.draw();
    const square = drawn.find((a) => a[0] === flat)!;
    expect(square[7]).toBeCloseTo(square[8], 5);
  });
});

describe("plant pictures", () => {
  it("preloads the pictures it can, and lives without the others", async () => {
    const good: PlantSpecies = {
      ...vallisneria,
      id: "good",
      atlas: { "1x": "/plants-cov/good.webp" },
    };
    const bad: PlantSpecies = {
      ...vallisneria,
      id: "bad",
      atlas: { "1x": "/plants-cov/bad.webp" },
    };
    let doc = ops.new_document("T");
    let view: string;
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0, 0, 1, 1));
    [doc] = ops.add_plant(doc, "main", good, view, [0.3, 0.6]);
    [doc] = ops.add_plant(doc, "main", bad, view, [0.6, 0.6]);
    vi.stubGlobal("Image", FakeImage);
    try {
      const scene = new AquariumScene(document.createElement("canvas"), null!);
      scene.configure({
        doc,
        view_id: view,
        catalog: { fish: [], corals: [], plants: [good, bad], presets: [] },
        background: null,
        seed: "s",
      });
      expect(scene.regions[0].plants).toHaveLength(2);
      await new Promise((r) => setTimeout(r, 0));
      await new Promise((r) => setTimeout(r, 0));
      const atlases: Map<string, unknown> = (scene as any)._atlases;
      expect([...atlases.keys()]).toEqual(["/plants-cov/good.webp"]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("draws a swaying plant from its sheet, its foot on its spot", async () => {
    const supple: PlantSpecies = {
      ...vallisneria,
      id: "supple",
      atlas: { "1x": "/plants-cov/supple.webp" },
      flex: 0.9,
    };
    let doc = ops.new_document("T");
    let view: string;
    doc.dimensions_cm = { length: 120, width: 60, height: 50 };
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.7));
    [doc] = ops.add_plant(doc, "main", supple, view, [0.3, 0.6]);
    [doc] = ops.add_plant(doc, "main", supple, view, [0.6, 0.6]);
    const drawn: any[][] = [];
    vi.stubGlobal("Image", FakeImage);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      recording_ctx(drawn),
    );
    stage_1000x500();
    try {
      const canvas = document.createElement("canvas");
      const scene = new AquariumScene(canvas, null!);
      scene.configure({
        doc,
        view_id: view,
        catalog: { fish: [], corals: [], plants: [supple], presets: [] },
        background: null,
        seed: "s",
      });
      await tick();
      await tick();
      const [p, other] = scene.regions[0].plants;
      expect(p.atlas).not.toBeNull();
      // One sheet for the species, but each plant with its own phase and
      // reach, so a bed never beats as one man
      expect(other.atlas).toBe(p.atlas);
      expect(p.sway.phase).not.toBe(other.sway.phase);
      expect(p.sway.amp).not.toBe(other.sway.amp);
      for (const sway of [p.sway, other.sway]) {
        expect(sway.phase).toBeGreaterThanOrEqual(0);
        expect(sway.phase).toBeLessThan(2 * BEND_FRAMES);
        expect(sway.amp).toBeGreaterThanOrEqual(0.85);
        expect(sway.amp).toBeLessThan(1.15);
        expect(sway.period_s).toBe(3.5);
      }

      drawn.length = 0;
      scene.set_flow({ main: 1 });
      p.sway.phase = 3;
      scene.step(0.4);
      expect(p.frame).toBeGreaterThan(0);
      scene.draw();
      const call = drawn.find((a) => a[0] === p.atlas!.sheet)!;
      expect(call).toBeTruthy();
      // A whole frame of the sheet, and one that is on it
      const [fw, fh] = p.atlas!.frame;
      expect(call[1]).toBe(p.frame * fw);
      expect(call[1] / fw).toBeLessThan(p.atlas!.frames);
      expect(call[3]).toBe(fw);
      expect(call[4]).toBe(fh);
      // The foot stands where the plant was planted, not the frame's middle
      const [, , , , , dx, dy, w, h] = call;
      expect(dx + w * p.atlas!.anchor_x).toBeCloseTo(0.3 * 1000, 5);
      expect(dy + h).toBeCloseTo(0.6 * 500, 5);
      expect(w).toBeGreaterThan(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("copes with a descriptor that leaves things out", () => {
    // A clip that says no rate: a sensible one is used
    const slow = {
      species: {
        ...filmed,
        clips: { sway: { from: 0, to: 3, fps: 0, loop: true } },
      },
      sway: { frames: 0, period_s: 3, phase: 0, amp: 1 },
    } as PlantScene;
    step_still_clip(slow, 0, 0.5);
    expect(slow.sway.phase).toBeCloseTo(0.5 * 12 * 0.6, 5);

    // An atlas that says no columns: its frames stand in a single column
    let doc = ops.new_document("T");
    let view: string;
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.7));
    const single = { ...filmed, columns: undefined };
    [doc] = ops.add_plant(doc, "main", single, view, [0.5, 0.6]);
    const drawn: any[][] = [];
    const ctx = recording_ctx(drawn);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
    stage_1000x500();
    const scene = new AquariumScene(document.createElement("canvas"), null!);
    scene.configure({
      doc,
      view_id: view,
      catalog: { fish: [], corals: [], plants: [single], presets: [] },
      background: null,
      seed: "s",
    });
    const p = scene.regions[0].plants[0];
    const img = document.createElement("img");
    (scene as any)._atlases.set(p.url, img);
    p.sway.phase = 0;
    scene.step(0.5);
    drawn.length = 0;
    scene.draw();
    const call = drawn.find((a) => a[0] === img)!;
    expect(call[1]).toBe(0);
    expect(call[2]).toBe(p.frame * filmed.frame![1]);

    // And nothing at all to draw from: nothing drawn
    drawn.length = 0;
    (scene as any)._draw_still(ctx, scene.regions[0], p, null);
    expect(drawn).toHaveLength(0);
  });

  it("hangs a floating plant from the surface it rides", () => {
    let doc = ops.new_document("T");
    let view: string;
    doc.dimensions_cm = { length: 120, width: 60, height: 50 };
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.7));
    // Placed low on the picture: the surface is where it ends up
    [doc] = ops.add_plant(doc, "main", frogbit, view, [0.5, 0.65]);
    const drawn: any[][] = [];
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      recording_ctx(drawn),
    );
    stage_1000x500();
    const scene = new AquariumScene(document.createElement("canvas"), null!);
    scene.configure({
      doc,
      view_id: view,
      catalog: { fish: [], corals: [], plants: [frogbit], presets: [] },
      background: null,
      seed: "s",
    });
    const p = scene.regions[0].plants[0];
    const img = document.createElement("img");
    img.width = 60;
    img.height = 30;
    (scene as any)._atlases.set(p.url, img);

    // Right on its spot to start with
    p.sway.drift_phase = 0;
    scene.set_flow({ main: 0 });
    scene.step(0);
    expect(p.drift).toBe(0);
    scene.draw();
    const proj = scene.regions[0].projection;
    const [u0] = proj.to_water_at(0.5, 0.65, p.plant.z);
    const [ex, ey] = proj.to_picture(u0, 0, p.plant.z);
    const [, , , , , dx, dy, w, h] = drawn.find((a) => a[0] === img)!;
    expect(dx + w / 2).toBeCloseTo(ex * 1000, 5);
    // It hangs from the waterline, it does not stand on the spot it was put
    expect(dy).toBeCloseTo(ey * 500, 5);
    expect(dy + h).toBeLessThan(0.65 * 500);

    // Then the current carries it along the surface
    drawn.length = 0;
    p.sway.drift_phase = Math.PI / 2;
    scene.set_flow({ main: 1 });
    scene.step(0);
    expect(p.drift).toBeGreaterThan(0);
    scene.draw();
    const moved = drawn.find((a) => a[0] === img)!;
    expect(moved[5]).toBeGreaterThan(dx);
    // Still riding the surface
    expect(moved[6]).toBeCloseTo(dy, 1);
  });

  it("draws a filmed plant from the clip of its own atlas", async () => {
    let doc = ops.new_document("T");
    let view: string;
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.7));
    [doc] = ops.add_plant(doc, "main", filmed, view, [0.5, 0.6]);
    const drawn: any[][] = [];
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      recording_ctx(drawn),
    );
    stage_1000x500();
    const scene = new AquariumScene(document.createElement("canvas"), null!);
    scene.configure({
      doc,
      view_id: view,
      catalog: { fish: [], corals: [], plants: [filmed], presets: [] },
      background: null,
      seed: "s",
    });
    const p = scene.regions[0].plants[0];
    // Nothing generated: it ships its own frames
    expect(p.atlas).toBeNull();
    const img = document.createElement("img");
    (scene as any)._atlases.set(p.url, img);
    // From a known phase: 0.5 s at 8 fps, the current at rest
    p.sway.phase = 0;
    scene.step(0.5);
    expect(p.frame).toBe(2);
    scene.draw();
    const call = drawn.find((a) => a[0] === img)!;
    const [fw, fh] = filmed.frame!;
    expect(call[1]).toBe((p.frame % filmed.columns!) * fw);
    expect(call[2]).toBe(Math.floor(p.frame / filmed.columns!) * fh);
    expect(call[3]).toBe(fw);
    expect(call[4]).toBe(fh);
    // Centred on its spot: no room to lean, the frames hold the motion
    expect(call[5] + call[7] / 2).toBeCloseTo(0.5 * 1000, 5);
  });
});

describe("plants in the editor", () => {
  const catalog = {
    fish: [],
    corals: [],
    plants: [vallisneria, filmed, pictureless, frogbit],
    presets: [],
  };

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

  async function open_editor() {
    let doc = ops.new_document("Reefer");
    doc.id = "a1b2";
    let view: string;
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.6));
    [doc] = ops.add_plant(doc, "main", vallisneria, view, [0.5, 0.55]);
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
    // The panel opens one group at a time: these tests are about the plants
    editor._group = "plants";
    await editor.updateComplete;
    return { editor, view };
  }

  it("shows a thumbnail for every kind of plant", () => {
    const still: any = species_thumb(vallisneria, "plant");
    expect(JSON.stringify(still.values)).toContain("thumb.webp");
    const sprite: any = species_thumb(filmed, "plant");
    expect(JSON.stringify(sprite.values)).toContain("cabomba.webp");
    // No picture at all: an icon
    const icon: any = species_thumb(pictureless, "plant");
    expect(JSON.stringify(icon.values)).not.toContain("webp");
    expect(species_thumb(undefined, "plant")).toBeTruthy();
  });

  it("places, moves, resizes and uproots a plant", async () => {
    const { editor } = await open_editor();
    const root = editor.shadowRoot;
    const stage = root.querySelector(".stage");

    // Dragging the mark on the picture
    root
      .querySelector(".plant")
      .dispatchEvent(pointer("pointerdown", 500, 275));
    stage.dispatchEvent(pointer("pointermove", 300, 300));
    stage.dispatchEvent(pointer("pointerup", 300, 300));
    expect(editor.doc.waters.main.plants[0].pos).toEqual([0.3, 0.6]);
    expect(editor._selection).toEqual({
      type: "plant",
      id: editor.doc.waters.main.plants[0].id,
      water: "main",
    });

    // Dragging it open it as well
    expect(editor._entry).toBe(editor.doc.waters.main.plants[0].id);

    // Planting another one with the tool opens it in its turn
    editor._tool = "plant";
    editor._plant_species = "vallisneria_spiralis";
    stage.dispatchEvent(pointer("pointerdown", 700, 250));
    expect(editor.doc.waters.main.plants).toHaveLength(2);
    expect(editor._entry).toBe(editor.doc.waters.main.plants[1].id);
    await editor.updateComplete;

    // Height and depth of the plant open
    const card = () =>
      root.querySelectorAll("fieldset")[3].querySelector(".card.current");
    const height = card().querySelector('input[type="number"]');
    height.value = "45";
    height.dispatchEvent(new Event("change"));
    expect(editor.doc.waters.main.plants[1].size_cm).toBe(45);
    height.value = "";
    height.dispatchEvent(new Event("change"));
    expect(editor.doc.waters.main.plants[1].size_cm).toBe(20);
    const depth = card().querySelector("select");
    depth.value = "back";
    depth.dispatchEvent(new Event("change"));
    expect(ops.depth_name(editor.doc.waters.main.plants[1].z)).toBe("back");

    // Uprooting the selected one with the keyboard
    await editor.updateComplete;
    editor._delete_selection();
    expect(editor.doc.waters.main.plants).toHaveLength(1);

    // And the last one with the ✕ of its own panel
    await editor.updateComplete;
    root.querySelectorAll("fieldset")[3].querySelector(".entry-head").click();
    await editor.updateComplete;
    root
      .querySelectorAll("fieldset")[3]
      .querySelector("button.icon")
      .dispatchEvent(new MouseEvent("click"));
    expect(editor.doc.waters.main.plants).toHaveLength(0);
  });

  it("picks a species to plant", async () => {
    const { editor } = await open_editor();
    const root = editor.shadowRoot;
    const searches = root.querySelectorAll("fieldset .picker .search");
    const search = searches[searches.length - 1];
    search.dispatchEvent(new Event("focus"));
    await editor.updateComplete;
    const picks = root
      .querySelectorAll("fieldset")[3]
      .querySelectorAll("button.pick");
    expect(picks.length).toBe(4);
    picks[0].dispatchEvent(new MouseEvent("click"));
    expect(editor._plant_species).toBe("vallisneria_spiralis");
    expect(editor._tool).toBe("plant");

    // Nothing matching: a plant name cannot be invented, unlike a fish
    editor._picker = { kind: "plant", text: "zzz" };
    await editor.updateComplete;
    expect(
      root.querySelectorAll("fieldset")[3].querySelector(".picker-list")
        .textContent,
    ).toContain("Nothing found");
  });

  it("copes with a water saved before the plants", async () => {
    const { editor } = await open_editor();
    const root = editor.shadowRoot;
    delete editor._doc.waters.main.plants;
    editor.requestUpdate();
    await editor.updateComplete;
    expect(root.querySelector(".plant")).toBeNull();
    expect(
      root.querySelectorAll("fieldset")[3].querySelectorAll(".card"),
    ).toHaveLength(0);

    // A plant with no view of its own shows on the view that holds it
    const [doc] = ops.add_plant(
      editor._doc,
      "main",
      vallisneria,
      null,
      [0.4, 0.5],
    );
    editor._doc = doc;
    await editor.updateComplete;
    expect(root.querySelector(".plant")).not.toBeNull();

    // A plant of another view is not marked on this one
    const [other] = ops.add_plant(
      editor._doc,
      "main",
      vallisneria,
      "elsewhere",
      [0.1, 0.1],
    );
    editor._doc = other;
    await editor.updateComplete;
    expect(root.querySelectorAll(".plant")).toHaveLength(1);

    // A species missing from the catalog can still be planted
    editor._tool = "plant";
    editor._plant_species = "mystery_moss";
    root
      .querySelector(".stage")
      .dispatchEvent(pointer("pointerdown", 500, 250));
    expect(editor.doc.waters.main.plants).toHaveLength(3);
    expect(editor.doc.waters.main.plants[2].species).toBe("mystery_moss");
    expect(editor.doc.waters.main.plants[2].size_cm).toBe(20);
  });

  it("marks a floating plant where it floats, not where it was dropped", async () => {
    const { editor } = await open_editor();
    const root = editor.shadowRoot;
    const proj = (editor as any)._projection("main");
    const waterline = (pos: [number, number], z: number) => {
      const [u] = proj.to_water_at(pos[0], pos[1], z);
      return proj.to_picture(u, 0, z);
    };

    // Dropped low on the picture: what is stored is the surface above it
    editor._tool = "plant";
    editor._plant_species = frogbit.id;
    root
      .querySelector(".stage")
      .dispatchEvent(pointer("pointerdown", 400, 400));
    const plant = editor.doc.waters.main.plants[1];
    expect(plant.species).toBe(frogbit.id);
    const [ex, ey] = waterline([0.4, 0.8], plant.z);
    expect(plant.pos[0]).toBeCloseTo(ex, 3);
    expect(plant.pos[1]).toBeCloseTo(ey, 3);
    expect(plant.pos[1]).toBeLessThan(0.3);

    // Its mark says so too, and wears its own shape
    await editor.updateComplete;
    const at = (el: any): [number, number] => [
      parseFloat(el.style.left) / 100,
      parseFloat(el.style.top) / 100,
    ];
    const marks = [...root.querySelectorAll(".plant.floating")];
    expect(marks).toHaveLength(1);
    expect(at(marks[0])[1]).toBeCloseTo(plant.pos[1], 3);

    // A point gone stale is still shown on the surface
    const stale = ops.update_plant(editor._doc, "main", plant.id, {
      pos: [0.4, 0.95],
    });
    editor._doc = stale;
    await editor.updateComplete;
    const moved = root.querySelector(".plant.floating");
    const [sx, sy] = waterline([0.4, 0.95], plant.z);
    expect(at(moved)[0]).toBeCloseTo(sx, 5);
    expect(at(moved)[1]).toBeCloseTo(sy, 5);
    expect(sy).toBeLessThan(0.3);

    // Dragging it down leaves it on the surface
    const stage = root.querySelector(".stage");
    moved.dispatchEvent(pointer("pointerdown", sx * 1000, sy * 500));
    stage.dispatchEvent(pointer("pointermove", 700, 450));
    stage.dispatchEvent(pointer("pointerup", 700, 450));
    const dragged = editor.doc.waters.main.plants.find(
      (x: any) => x.id === plant.id,
    );
    const [dx, dy] = waterline([0.7, 0.9], plant.z);
    expect(dragged.pos[0]).toBeCloseTo(dx, 3);
    expect(dragged.pos[1]).toBeCloseTo(dy, 3);

    // Removed from under the drag: the point is taken as it comes
    editor._drag = { type: "plant", water: "main", id: "gone" };
    stage.dispatchEvent(pointer("pointermove", 200, 100));
    stage.dispatchEvent(pointer("pointerup", 200, 100));

    // A plant that stands is left where it was put
    const standing = editor.doc.waters.main.plants[0];
    expect(standing.pos).toEqual([0.5, 0.55]);
  });

  it("tells where to click, and falls back without an outline", async () => {
    const { editor } = await open_editor();
    const hint = () =>
      [
        ...editor.shadowRoot
          .querySelectorAll("fieldset")[3]
          .querySelectorAll(".hint"),
      ]
        .map((e: any) => e.textContent.trim())
        .join(" ");
    editor._plant_species = vallisneria.id;
    await editor.updateComplete;
    expect(hint()).toContain("foot of the plant");
    editor._plant_species = frogbit.id;
    await editor.updateComplete;
    expect(hint()).toContain("surface");

    // A water with no outline: the point is kept as it is
    const pos: [number, number] = [0.3, 0.4];
    expect((editor as any)._waterline("sump", pos, 0.5)).toBe(pos);
  });

  it("does not call a catalog of plants empty", async () => {
    const { editor } = await open_editor();
    expect(editor._catalog_notice()).toBeTruthy();
    editor._catalog = { fish: [], corals: [], plants: [vallisneria] };
    expect(editor._catalog_notice()).toBe(nothing);
  });
});
