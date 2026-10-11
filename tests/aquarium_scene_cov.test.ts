import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AquariumScene,
  fish_frame,
  fish_groups,
  fish_layers,
  fish_scale_x,
  hideouts,
  step_coral,
  tank_size,
  type CoralState,
} from "../src/aquarium/scene";
import { WaterProjection, rect_quad } from "../src/aquarium/geometry";
import {
  coral_atlas,
  coral_palette,
  load_image,
  reset_generic_fish,
} from "../src/aquarium/sprites";
import type {
  AquariumDocument,
  Catalog,
  CoralSpecies,
  FishSpecies,
} from "../src/aquarium/types";
import * as ops from "../src/aquarium/editor/ops";

// ── Fakes ────────────────────────────────────────────────────────────────────

/** Pixels returned by getImageData, by the src of the last drawn image. */
const pixels: Record<string, Uint8ClampedArray> = {};
/** Every Image constructed through the fake. */
const images: FakeImage[] = [];

/** Image stand-in: loads asynchronously, fails when the URL contains "bad". */
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin = "";
  decoding = "";
  width = 2;
  height = 1;
  naturalWidth = 2;
  private _src = "";
  constructor() {
    images.push(this);
  }
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

interface Call {
  canvas: HTMLCanvasElement;
  op: string;
  args: any[];
  alpha: number;
}

/**
 * Fake 2D contexts recording every method call, with the canvas it was
 * made for and the globalAlpha at the time of the call.
 */
function record_contexts(only_for?: (c: HTMLCanvasElement) => boolean) {
  const calls: Call[] = [];
  const spy = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation(function (this: HTMLCanvasElement) {
      if (only_for && !only_for(this)) return null;
      const canvas = this;
      let last: any = null;
      const state: any = { globalAlpha: 1 };
      return new Proxy(state, {
        get: (t: any, k) => {
          if (k in t) return t[k];
          if (k === "createLinearGradient")
            return () => ({ addColorStop: () => undefined });
          if (k === "getImageData")
            return (_x: number, _y: number, w: number, h: number) => ({
              width: w,
              height: h,
              data: pixels[last?.src] ?? new Uint8ClampedArray(w * h * 4),
            });
          if (k === "createImageData")
            return (w: number, h: number) => ({
              width: w,
              height: h,
              data: new Uint8ClampedArray(w * h * 4),
            });
          return (...args: any[]) => {
            if (k === "drawImage") last = args[0];
            calls.push({ canvas, op: String(k), args, alpha: t.globalAlpha });
          };
        },
        set: (t: any, k, v) => ((t[k] = v), true),
      }) as any;
    } as any);
  return { calls, spy };
}

const flush = () => new Promise((r) => setTimeout(r, 5));

const fish: FishSpecies = {
  id: "damsel",
  kind: "fish",
  source: "bundled",
  frame: [256, 128],
  columns: 8,
  clips: { swim: { from: 0, to: 23, fps: 24, loop: true } },
  atlas: { "1x": "/cov/fish.webp" },
  size_cm: [5, 8],
};

const coral: CoralSpecies = {
  id: "acro",
  kind: "coral",
  source: "bundled",
  frame: [64, 64],
  columns: 4,
  clips: { day: { from: 0, to: 3, fps: 12, loop: true } },
  atlas: { shade: "/cov/shade.webp", mask: "/cov/mask.png" },
  palette: [{ default: "#ff0000", fluo: true } as any],
};

/** A document with one view over the whole picture, and a main water. */
function scene_doc(): [AquariumDocument, string] {
  let doc = ops.new_document("T");
  let view: string;
  doc.dimensions_cm = { length: 200, width: 50, height: 50 };
  [doc, view] = ops.add_view(doc, "Front");
  doc = ops.set_region(doc, view, "main", rect_quad(0, 0, 1, 1));
  return [doc, view];
}

beforeEach(() => {
  images.length = 0;
  vi.stubGlobal("Image", FakeImage);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  reset_generic_fish();
});

// ── Sprites ──────────────────────────────────────────────────────────────────

describe("load_image", () => {
  it("loads a picture once, and forgets a failed one", async () => {
    const a = load_image("/cov/one.png");
    expect(load_image("/cov/one.png")).toBe(a); // shared while loading
    const img = (await a) as unknown as FakeImage;
    expect(img.crossOrigin).toBe("anonymous");
    expect(img.decoding).toBe("async");
    expect(img.src).toBe("/cov/one.png");
    expect(images).toHaveLength(1);

    await expect(load_image("/cov/bad.png")).rejects.toThrow(
      "cannot load /cov/bad.png",
    );
    // dropped from the cache: a retry builds a new image
    const retry = load_image("/cov/bad.png");
    await expect(retry).rejects.toThrow();
    expect(images).toHaveLength(3);
  });
});

describe("coral_atlas", () => {
  it("recolours the atlas, with a glow layer for fluorescent colours", async () => {
    const { calls } = record_contexts();
    // shade: one pixel, full brightness; mask: weight 1 on colour 1
    pixels["/cov/shade.webp"] = new Uint8ClampedArray([
      255, 255, 255, 255, 0, 0, 0, 0,
    ]);
    pixels["/cov/mask.png"] = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 0, 0, 0,
    ]);
    const p = coral_atlas(coral, undefined);
    expect(coral_atlas(coral, undefined)).toBe(p); // cached per palette
    const atlas = await p;
    expect(atlas.body.width).toBe(2);
    expect(atlas.body.height).toBe(1);
    expect(atlas.glow).not.toBeNull();
    const puts = calls.filter((c) => c.op === "putImageData");
    expect(puts).toHaveLength(2);
    expect(Array.from(puts[0].args[0].data.slice(0, 4))).toEqual([
      255, 0, 0, 255,
    ]);
    expect(Array.from(puts[1].args[0].data.slice(0, 4))).toEqual([
      255, 0, 0, 255,
    ]);

    // no fluorescent colour: no glow layer
    const plain = await coral_atlas({ ...coral, palette: [] }, ["#00ff00"]);
    expect(plain.glow).toBeNull();
  });

  it("drops a failed atlas from the cache", async () => {
    const broken = {
      ...coral,
      id: "broken",
      atlas: { shade: "/cov/bad-s", mask: "/cov/m" },
    };
    const p = coral_atlas(broken, undefined);
    await expect(p).rejects.toThrow("cannot load /cov/bad-s");
    expect(coral_atlas(broken, undefined)).not.toBe(p);
  });

  it("defaults every colour without a species palette", () => {
    expect(
      coral_palette({ ...coral, palette: undefined } as any, undefined),
    ).toEqual([
      [128, 128, 128],
      [128, 128, 128],
      [128, 128, 128],
      [128, 128, 128],
    ]);
  });
});

// ── Scene helpers ────────────────────────────────────────────────────────────

describe("scene helpers without optional data", () => {
  it("animates a coral without clips, or with a day clip only", () => {
    const s: CoralState = { phase: "day", progress: 0, frames: 0 };
    const bare = { ...coral, clips: undefined } as any;
    expect(step_coral(s, bare, 0, 0, 0.1)).toBe(0);
    // day clip only: closing and opening hold its first frame, over 1 s
    const day_only = {
      ...coral,
      clips: { day: { from: 5, to: 8, fps: 12, loop: true } },
    };
    const d: CoralState = { phase: "day", progress: 0, frames: 0 };
    expect(step_coral(d, day_only, 1, 0, 0.5)).toBe(5);
    expect(d.phase).toBe("closing");
    expect(d.progress).toBeCloseTo(0.5);
    expect(step_coral(d, day_only, 0, 0, 0.25)).toBe(5);
    expect(d.phase).toBe("opening");
    expect(d.progress).toBeCloseTo(0.75);
  });

  it("draws a fish without clips nor facing", () => {
    const f: any = {
      species: { ...fish, clips: undefined, facing: undefined },
      phase: 3,
      turn: -1,
      facing: -1,
    };
    expect(fish_frame(f, false)).toEqual({
      frame: 0,
      turn_clip: false,
      clip: "swim",
    });
    // drawn facing right by default: mirrored when swimming left
    expect(fish_scale_x(f, false)).toBe(-1);
    // a null scale counts as looking right
    expect(fish_layers({ ...f }, 2, 0, "swim", 0)).toEqual([
      { frame: 2, sx: 0, tilt: 1, alpha: 1 },
    ]);
  });

  it("copes with missing decor, livestock and dimensions", () => {
    const projection = new WaterProjection(rect_quad(0, 0, 1, 1));
    const size = { length: 100, width: 50, height: 50 };
    expect(
      hideouts(
        { ...ops.empty_view(), decor: undefined } as any,
        projection,
        size,
      ),
    ).toEqual([]);
    const water = { ...ops.empty_water(), livestock: undefined } as any;
    expect(
      fish_groups(water, { fish: [fish], corals: [], presets: [] }),
    ).toEqual([]);
    const doc = ops.new_document("x");
    doc.dimensions_cm = { length: 0, width: 0, height: 0 };
    expect(tank_size(doc)).toEqual({ length: 100, height: 50, width: 50 });
  });
});

// ── Scene ────────────────────────────────────────────────────────────────────

describe("AquariumScene configuration", () => {
  it("defaults the regions, the sand band, the fish cap and the corals", () => {
    let [doc, view] = scene_doc();
    const s = new AquariumScene(document.createElement("canvas"), null);
    // a view without regions: nothing to show
    const no_regions = structuredClone(doc);
    (no_regions.views[view] as any).regions = undefined;
    s.configure({
      doc: no_regions,
      view_id: view,
      catalog: null,
      background: null,
      seed: "s",
    });
    expect(s.regions).toHaveLength(0);

    [doc] = ops.add_line(doc, "main", { species: "damsel", count: 40 });
    (doc as any).render = undefined;
    (doc.waters.main as any).sand_band = undefined;
    (doc.waters.main as any).corals = undefined;
    s.configure({
      doc,
      view_id: view,
      catalog: { fish: [fish], corals: [], presets: [] },
      background: null,
      seed: "s",
    });
    expect(s.regions).toHaveLength(1);
    expect(s.regions[0].sim.fish).toHaveLength(30); // default cap
    expect(s.regions[0].corals).toEqual([]);
  });

  it("loads the fish atlases and the coral atlases, ignoring failures", async () => {
    record_contexts();
    let [doc, view] = scene_doc();
    [doc] = ops.add_line(doc, "main", { species: "damsel", count: 1 });
    [doc] = ops.add_line(doc, "main", { species: "ghost", count: 1 });
    // a coral of no view shows in every view
    [doc] = ops.add_coral(doc, "main", coral, null, [0.5, 0.8]);
    [doc] = ops.add_coral(doc, "main", { id: "broken" }, view, [0.5, 0.8]);
    const ghost = { ...fish, id: "ghost", atlas: { "1x": "/cov/bad-fish" } };
    const broken = {
      ...coral,
      id: "broken",
      atlas: { shade: "/cov/bad-shade", mask: "/cov/m2" },
    };
    const s = new AquariumScene(document.createElement("canvas"), null);
    s.configure({
      doc,
      view_id: view,
      catalog: { fish: [fish, ghost], corals: [coral, broken], presets: [] },
      background: null,
      seed: "s",
    });
    const corals = s.regions[0].corals;
    expect(corals.map((c) => c.species.id)).toEqual(["acro", "broken"]);
    await flush();
    await flush();
    const atlases: Map<string, unknown> = (s as any)._atlases;
    expect([...atlases.keys()]).toEqual(["/cov/fish.webp"]);
    expect(corals[0].atlas?.body).toBeInstanceOf(HTMLCanvasElement);
    expect(corals[1].atlas).toBeNull();
  });

  it("forces or eases the night", () => {
    let [doc, view] = scene_doc();
    [doc] = ops.add_line(doc, "main", { species: "damsel", count: 1 });
    const s = new AquariumScene(document.createElement("canvas"), null);
    s.configure({
      doc,
      view_id: view,
      catalog: { fish: [fish], corals: [], presets: [] },
      background: null,
      seed: "s",
    });
    s.set_light({ main: { lamps: [], dark: true, none: false } });
    // not forced: the night comes progressively
    expect(s.regions[0].sim.nightness).toBe(0);
  });

  it("feeds a default size tank without a setup", () => {
    const [doc, view] = scene_doc();
    const s = new AquariumScene(document.createElement("canvas"), null);
    s.configure({
      doc,
      view_id: view,
      catalog: null,
      background: null,
      seed: "s",
    });
    s.feed([], 10);
    const sim = s.regions[0].sim;
    // tank 200 cm long: food at the centre
    expect(sim.particles.every((p) => Math.abs(p.x - 100) <= 4)).toBe(true);
    sim.particles = [];
    (s as any)._setup = null;
    s.feed([], 10);
    // default 100 cm tank
    expect(sim.particles.every((p) => Math.abs(p.x - 50) <= 4)).toBe(true);
  });
});

describe("AquariumScene sizing and cut-outs", () => {
  it("follows the displayed size, with a default and a capped pixel ratio", () => {
    const canvas = document.createElement("canvas");
    canvas.getBoundingClientRect = () =>
      ({ width: 100, height: 50 }) as DOMRect;
    const glow = document.createElement("canvas");
    const s = new AquariumScene(canvas, glow);
    vi.stubGlobal("devicePixelRatio", 0);
    s.resize();
    expect([canvas.width, canvas.height, glow.width, glow.height]).toEqual([
      100, 50, 100, 50,
    ]);
    expect((s as any)._ratio).toBe(1);
    vi.stubGlobal("devicePixelRatio", 3);
    s.resize();
    expect([canvas.width, canvas.height, glow.height]).toEqual([200, 100, 100]);
    expect((s as any)._ratio).toBe(2);
  });

  it("cuts the decor straight out of a photo", () => {
    const { calls } = record_contexts();
    let [doc, view] = scene_doc();
    [doc] = ops.add_decor(
      doc,
      view,
      [
        [0.25, 0.5],
        [0.5, 0.5],
        [0.5, 1],
      ],
      0.4,
    );
    const canvas = document.createElement("canvas");
    canvas.getBoundingClientRect = () =>
      ({ width: 100, height: 100 }) as DOMRect;
    const photo = document.createElement("img");
    Object.defineProperty(photo, "naturalWidth", { value: 640 });
    const s = new AquariumScene(canvas, null);
    s.configure({
      doc,
      view_id: view,
      catalog: null,
      background: photo,
      seed: "s",
    });
    const cut = (s as any)._cutouts[0];
    // the exact polygon (no rough edge over a photo): bbox + 1 px
    expect([cut.x, cut.y, cut.canvas.width, cut.canvas.height]).toEqual([
      25, 50, 26, 51,
    ]);
    const lines = calls.filter(
      (c) => c.canvas === cut.canvas && c.op === "lineTo",
    );
    expect(lines.map((c) => c.args)).toEqual([
      [25, 0],
      [25, 50],
    ]);
    expect(
      calls.some(
        (c) =>
          c.canvas === cut.canvas &&
          c.op === "drawImage" &&
          c.args[0] === photo,
      ),
    ).toBe(true);

    // drawn as a picture of the scene, even without a setup (default tank)
    calls.length = 0;
    (s as any)._setup = null;
    s.draw();
    const blit = calls.find(
      (c) => c.canvas === canvas && c.op === "drawImage",
    )!;
    expect(blit.args).toEqual([cut.canvas, 25, 50]);
  });

  it("skips the cut-outs without decor or without a 2D context", () => {
    let [doc, view] = scene_doc();
    const backdrop = document.createElement("canvas");
    backdrop.width = 10;
    const s = new AquariumScene(document.createElement("canvas"), null);
    const no_decor = structuredClone(doc);
    (no_decor.views[view] as any).decor = undefined;
    s.configure({
      doc: no_decor,
      view_id: view,
      catalog: null,
      background: backdrop,
      seed: "s",
    });
    expect((s as any)._cutouts).toEqual([]);

    [doc] = ops.add_decor(
      doc,
      view,
      [
        [0.2, 0.2],
        [0.4, 0.2],
        [0.3, 0.4],
      ],
      0.5,
    );
    // jsdom has no 2D context: the decor cannot be cut out
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    s.configure({
      doc,
      view_id: view,
      catalog: null,
      background: backdrop,
      seed: "s",
    });
    expect((s as any)._cutouts).toEqual([]);
  });
});

describe("AquariumScene animation loop", () => {
  it("steps at most 30 times a second and stops for good", () => {
    let [doc, view] = scene_doc();
    [doc] = ops.add_line(doc, "main", { species: "damsel", count: 1 });
    const s = new AquariumScene(document.createElement("canvas"), null);
    s.configure({
      doc,
      view_id: view,
      catalog: { fish: [fish], corals: [], presets: [] },
      background: null,
      seed: "s",
    });
    const ticks: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
      ticks.push(cb),
    );
    const cancel = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancel);
    vi.spyOn(performance, "now").mockReturnValue(1000);
    const step = vi.spyOn(s, "step");
    const draw = vi.spyOn(s, "draw");

    // stopping a scene never started cancels nothing
    s.stop();
    expect(cancel).not.toHaveBeenCalled();

    s.start();
    expect(ticks).toHaveLength(1);
    ticks[0](1010); // 10 ms: too early for a step
    expect(step).not.toHaveBeenCalled();
    expect(ticks).toHaveLength(2);
    ticks[1](1050); // 50 ms in all
    expect(step).toHaveBeenCalledTimes(1);
    expect(step.mock.calls[0][0]).toBeCloseTo(0.05);
    expect(draw).toHaveBeenCalledTimes(1);
    ticks[2](5000); // a long pause counts as 0.25 s at most
    expect(step.mock.calls[1][0]).toBeCloseTo(0.25);

    s.stop();
    expect(cancel).toHaveBeenCalledWith(4);
    // a frame already requested does nothing once stopped
    ticks[3](6000);
    expect(step).toHaveBeenCalledTimes(2);
    expect(ticks).toHaveLength(4);
  });
});

describe("AquariumScene drawing", () => {
  function fish_scene(
    species: FishSpecies,
    glow: HTMLCanvasElement | null = null,
  ) {
    let [doc, view] = scene_doc();
    [doc] = ops.add_line(doc, "main", { species: species.id, count: 1 });
    const canvas = document.createElement("canvas");
    // displayed at 400 x 200 (resize() follows the displayed size)
    canvas.getBoundingClientRect = () =>
      ({ width: 400, height: 200 }) as DOMRect;
    const s = new AquariumScene(canvas, glow);
    s.configure({
      doc,
      view_id: view,
      catalog: { fish: [species], corals: [coral], presets: [] },
      background: null,
      seed: "s",
    });
    return { s, canvas, doc, view };
  }

  it("draws only loaded fish, and food once it has dropped", () => {
    const { calls } = record_contexts();
    const { s, canvas } = fish_scene(fish);
    // the atlas is not loaded yet: nothing drawn
    s.draw();
    expect(calls.some((c) => c.op === "drawImage")).toBe(false);

    const sim = s.regions[0].sim;
    sim.particles = [
      { x: 100, y: 25, d: 0, vy: 1, age: -1 }, // not dropped yet
      { x: 100, y: 25, d: 0, vy: 1, age: 0 },
    ];
    calls.length = 0;
    (s as any)._setup = null; // default 100 cm tank
    s.draw();
    const arcs = calls.filter((c) => c.canvas === canvas && c.op === "arc");
    expect(arcs).toHaveLength(1);
    // x = 100 cm of a 100 cm tank: the right edge
    expect(arcs[0].args[0]).toBeCloseTo(400);
    expect(arcs[0].args[2]).toBeGreaterThanOrEqual(1.2);
  });

  it("draws a fish fully out, and a burrowed one with a null scale", () => {
    const { calls } = record_contexts();
    const plain = { ...fish, facing: undefined, length_frac: undefined } as any;
    const { s, canvas } = fish_scene(plain);
    const img = document.createElement("img");
    (s as any)._atlases.set(fish.atlas["1x"], img);
    const f: any = s.regions[0].sim.fish[0];
    f.d = 0; // at the front: no haze
    f.emerge = undefined; // no burrow: fully out
    f.turn = -1;
    s.draw();
    const on_main = calls.filter((c) => c.canvas === canvas);
    expect(on_main.some((c) => c.op === "rect")).toBe(false);
    expect(on_main.some((c) => c.op === "drawImage" && c.args[0] === img)).toBe(
      true,
    );

    // in its burrow and facing nowhere: tilted as if looking right
    calls.length = 0;
    f.emerge = 0.5;
    f.facing = 0;
    f.anim = undefined;
    s.draw();
    const rotate = calls.find((c) => c.canvas === canvas && c.op === "rotate")!;
    expect(rotate.args[0]).toBeCloseTo(-1.15);
  });

  it("enlarges the haze scratch canvas for big frames", () => {
    record_contexts();
    const big = { ...fish, frame: [512, 256] as [number, number] };
    const { s } = fish_scene(big);
    const img = document.createElement("img");
    (s as any)._atlases.set(fish.atlas["1x"], img);
    s.regions[0].sim.fish[0].d = 50; // at the back: hazed
    s.draw();
    const scratch: HTMLCanvasElement = (s as any)._scratch;
    expect([scratch.width, scratch.height]).toEqual([512, 256]);
  });

  it("draws the corals, glowing under blue light only", () => {
    const glow = document.createElement("canvas");
    const { calls } = record_contexts();
    let [doc, view] = scene_doc();
    [doc] = ops.add_coral(doc, "main", coral, view, [0.5, 0.8]);
    [doc] = ops.add_coral(doc, "main", coral, view, [0.25, 0.8]);
    const canvas = document.createElement("canvas");
    // displayed at 400 x 200 (resize() follows the displayed size)
    canvas.getBoundingClientRect = () =>
      ({ width: 400, height: 200 }) as DOMRect;
    const s = new AquariumScene(canvas, glow);
    s.configure({
      doc,
      view_id: view,
      catalog: { fish: [], corals: [coral], presets: [] },
      background: null,
      seed: "s",
    });
    const [c1, c2] = s.regions[0].corals;
    const body = document.createElement("canvas");
    const fluo = document.createElement("canvas");
    c1.atlas = { body, glow: fluo };
    c2.atlas = null; // still loading: not drawn
    calls.length = 0;
    s.set_light(
      {
        main: {
          lamps: [{ x: 0, rgb: [40, 70, 255], power: 1, dark: false }],
          dark: false,
          none: false,
        },
      },
      true,
    );
    s.draw();
    const bodies = calls.filter(
      (c) => c.canvas === canvas && c.op === "drawImage",
    );
    expect(bodies).toHaveLength(1);
    expect(bodies[0].args[0]).toBe(body);
    // the foot of the coral sits at its position
    const [, , , , , dx, dy, w, h] = bodies[0].args;
    expect(dx + w / 2).toBeCloseTo(200);
    expect(dy + h).toBeCloseTo(160);
    const glows = calls.filter(
      (c) => c.canvas === glow && c.op === "drawImage",
    );
    expect(glows).toHaveLength(1);
    expect(glows[0].args[0]).toBe(fluo);
    expect(glows[0].alpha).toBeGreaterThan(0.5);

    // white light: no glow
    calls.length = 0;
    s.set_light(
      {
        main: {
          lamps: [{ x: 0, rgb: [255, 250, 235], power: 1, dark: false }],
          dark: false,
          none: false,
        },
      },
      true,
    );
    s.draw();
    expect(calls.some((c) => c.canvas === glow && c.op === "drawImage")).toBe(
      false,
    );

    // no fluorescent layer: no glow either
    calls.length = 0;
    c1.atlas = { body, glow: null };
    s.set_light(
      {
        main: {
          lamps: [{ x: 0, rgb: [40, 70, 255], power: 1, dark: false }],
          dark: false,
          none: false,
        },
      },
      true,
    );
    s.draw();
    expect(calls.some((c) => c.canvas === glow && c.op === "drawImage")).toBe(
      false,
    );
    expect(calls.some((c) => c.canvas === canvas && c.op === "drawImage")).toBe(
      true,
    );
  });

  it("draws the corals without a glow canvas", () => {
    const { calls } = record_contexts();
    let [doc, view] = scene_doc();
    [doc] = ops.add_coral(doc, "main", coral, view, [0.5, 0.8]);
    const canvas = document.createElement("canvas");
    const s = new AquariumScene(canvas, null);
    s.configure({
      doc,
      view_id: view,
      catalog: { fish: [], corals: [coral], presets: [] },
      background: null,
      seed: "s",
    });
    const body = document.createElement("canvas");
    s.regions[0].corals[0].atlas = {
      body,
      glow: document.createElement("canvas"),
    };
    s.set_light(
      {
        main: {
          lamps: [{ x: 0, rgb: [40, 70, 255], power: 1, dark: false }],
          dark: false,
          none: false,
        },
      },
      true,
    );
    calls.length = 0;
    s.draw();
    const drawn = calls.filter((c) => c.op === "drawImage");
    expect(drawn.map((c) => c.args[0])).toEqual([body]);
  });
});
