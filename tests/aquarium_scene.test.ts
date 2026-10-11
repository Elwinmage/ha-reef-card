import { describe, expect, it, vi } from "vitest";
import {
  AquariumScene,
  fish_frame,
  fish_groups,
  fish_scale_x,
  fish_layers,
  fish_tilt,
  CLIP_FADE_S,
  glow_strength,
  hideouts,
  step_coral,
  tank_size,
  type CoralState,
} from "../src/aquarium/scene";
import { WaterProjection, rect_quad } from "../src/aquarium/geometry";
import {
  GENERIC_FISH_ID,
  generic_fish,
  reset_generic_fish,
} from "../src/aquarium/sprites";
import type { Catalog, CoralSpecies, FishSpecies } from "../src/aquarium/types";
import * as ops from "../src/aquarium/editor/ops";

const coral: CoralSpecies = {
  id: "euphyllia",
  kind: "coral",
  source: "bundled",
  frame: [256, 256],
  columns: 8,
  clips: {
    day: { from: 0, to: 23, fps: 12, loop: true },
    close: { from: 24, to: 35, fps: 12, loop: false },
    night: { from: 36, to: 43, fps: 6, loop: true },
  },
  atlas: { shade: "/s.webp", mask: "/m.png" },
  palette: [],
};

const fish: FishSpecies = {
  id: "damsel",
  kind: "fish",
  source: "bundled",
  frame: [256, 128],
  columns: 8,
  clips: {
    swim: { from: 0, to: 23, fps: 24, loop: true },
    turn: { from: 24, to: 31, fps: 24, loop: false },
    idle: { from: 32, to: 43, fps: 12, loop: true },
  },
  atlas: { "1x": "/f.webp" },
  size_cm: [5, 8],
  facing: "right",
};

describe("corals", () => {
  it("open and close with the light", () => {
    const state: CoralState = { phase: "day", progress: 0, frames: 0 };
    expect(step_coral(state, coral, 0, 0, 0.5)).toBeGreaterThanOrEqual(0);
    expect(step_coral(state, coral, 1, 0, 0.1)).toBeGreaterThanOrEqual(24);
    expect(state.phase).toBe("closing");
    for (let i = 0; i < 20; i++) step_coral(state, coral, 1, 0, 0.1);
    expect(state.phase).toBe("night");
    expect(step_coral(state, coral, 1, 0, 0.1)).toBeGreaterThanOrEqual(36);
    step_coral(state, coral, 0, 0, 0.1);
    expect(state.phase).toBe("opening");
    // interrupted: closes back from where it was
    const p = state.progress;
    step_coral(state, coral, 1, 0, 0);
    expect(state.phase).toBe("closing");
    expect(state.progress).toBeCloseTo(1 - p);
    step_coral(state, coral, 0, 0, 0);
    for (let i = 0; i < 20; i++) step_coral(state, coral, 0, 1, 0.1);
    expect(state.phase).toBe("day");
  });

  it("copes with missing clips", () => {
    const bare = { ...coral, clips: {} } as CoralSpecies;
    const state: CoralState = { phase: "day", progress: 0, frames: 0 };
    expect(step_coral(state, bare, 0, 0, 0.1)).toBe(0);
    expect(step_coral(state, bare, 1, 0, 0.1)).toBe(0);
    for (let i = 0; i < 20; i++) step_coral(state, bare, 1, 0, 0.1);
    expect(step_coral(state, bare, 1, 0, 0.1)).toBe(0);
    step_coral(state, bare, 0, 0, 0.1);
    expect(step_coral(state, bare, 0, 0, 0.01)).toBe(0);
    const no_night = {
      ...coral,
      clips: { close: coral.clips.close },
    } as CoralSpecies;
    const s2: CoralState = { phase: "night", progress: 0, frames: 0 };
    expect(step_coral(s2, no_night, 1, 0, 0.1)).toBe(35);
  });
});

describe("fish sprites", () => {
  const f: any = { species: fish, phase: 5, turn: -1, facing: 1 };

  it("picks the frame", () => {
    expect(fish_frame(f, false)).toEqual({
      frame: 5,
      turn_clip: false,
      clip: "swim",
    });
    expect(fish_frame(f, true)).toEqual({
      frame: 37,
      turn_clip: false,
      clip: "idle",
    });
    expect(fish_frame({ ...f, turn: 0.5 }, false)).toEqual({
      frame: 28,
      turn_clip: true,
      clip: "turn",
    });
    // no swim clip: the first one
    const only_idle = { ...fish, clips: { idle: fish.clips.idle } };
    expect(fish_frame({ ...f, species: only_idle }, false).clip).toBe("idle");
    expect(
      fish_frame({ ...f, species: { ...fish, clips: {} } }, false).frame,
    ).toBe(0);
  });

  it("mirrors and squashes", () => {
    expect(fish_scale_x(f, false)).toBe(1);
    expect(fish_scale_x({ ...f, facing: -1 }, false)).toBe(-1);
    expect(
      fish_scale_x({ ...f, species: { ...fish, facing: "left" } }, false),
    ).toBe(-1);
    // turning: still the old way before the middle, squashed
    expect(fish_scale_x({ ...f, turn: 0.25 }, false)).toBeCloseTo(
      -Math.cos(Math.PI * 0.25),
    );
    expect(fish_scale_x({ ...f, turn: 0.5 }, false)).toBeCloseTo(0.08);
    // a turn clip plays as drawn when turning away from the drawing...
    expect(fish_scale_x({ ...f, turn: 0.25 }, true)).toBe(-1);
    expect(fish_scale_x({ ...f, turn: 0.75 }, true)).toBe(-1);
    // ...mirrored the other way, never flipped half-way
    expect(fish_scale_x({ ...f, facing: -1, turn: 0.75 }, true)).toBe(1);
    const left = { ...fish, facing: "left" };
    expect(fish_scale_x({ ...f, species: left, turn: 0.75 }, true)).toBe(1);
  });

  it("cross-fades a clip change", () => {
    const g: any = { ...f };
    expect(fish_layers(g, 3, 1, "swim", 0.04)).toEqual([
      { frame: 3, sx: 1, tilt: 1, alpha: 1 },
    ]);
    expect(fish_layers(g, 4, 1, "swim", 0.04)).toHaveLength(1);
    // the turn starts: the last swim frame fades out over the new frame
    // (the new frame stays opaque)
    let layers = fish_layers(g, 24, 1, "turn", 0.04, 1);
    expect(layers).toEqual([
      { frame: 24, sx: 1, tilt: 1, alpha: 1 },
      { frame: 4, sx: 1, tilt: 1, alpha: 1 },
    ]);
    layers = fish_layers(g, 25, 1, "turn", CLIP_FADE_S / 2, 0.9);
    expect(layers[0].alpha).toBe(1);
    expect(layers[1].alpha).toBeCloseTo(0.5);
    expect(fish_layers(g, 26, 1, "turn", CLIP_FADE_S, -0.99)).toEqual([
      { frame: 26, sx: 1, tilt: -0.99, alpha: 1 },
    ]);
    // and back to swimming, the other way: the fading turn frame keeps its
    // tilt, already the new way
    layers = fish_layers(g, 7, -1, "swim", 0.04);
    expect(layers[0]).toEqual({ frame: 7, sx: -1, tilt: -1, alpha: 1 });
    expect(layers[1]).toEqual({ frame: 26, sx: 1, tilt: -0.99, alpha: 1 });
  });

  it("keeps the tilt continuous through a turn clip", () => {
    // turning to the left, the clip drawn as is (scale +1) all along
    const g: any = { ...f, facing: -1 };
    const sx = fish_scale_x({ ...g, turn: 0 }, true);
    expect(sx).toBe(1);
    expect(fish_tilt({ ...g, turn: 0 }, sx, true)).toBeCloseTo(1);
    expect(fish_tilt({ ...g, turn: 0.5 }, sx, true)).toBeCloseTo(0);
    // at the end, the same sign as the swim that follows
    const end = fish_tilt({ ...g, turn: 0.999 }, sx, true);
    const after = fish_tilt(
      { ...g, turn: -1 },
      fish_scale_x({ ...g, turn: -1 }, false),
      false,
    );
    expect(end).toBeCloseTo(after, 2);
    // without a clip: the sign of the (squashed) scale
    expect(fish_tilt({ ...g, turn: 0.3 }, -0.4, false)).toBe(-1);
    expect(fish_tilt({ ...g, turn: -1 }, 0, false)).toBe(1);
  });
});

describe("scene inputs", () => {
  const doc = ops.new_document("T");
  doc.dimensions_cm = { length: 120, width: 60, height: 50 };

  it("finds hideouts from the decor", () => {
    const projection = new WaterProjection(rect_quad(0, 0, 1, 1));
    const view = ops.empty_view();
    view.decor.push({
      id: "d",
      z: 0.5,
      poly: [
        [0.2, 0.6],
        [0.4, 0.6],
        [0.3, 1],
      ],
    });
    const h = hideouts(view, projection, tank_size(doc));
    expect(h).toHaveLength(1);
    expect(h[0].x).toBeCloseTo(36);
    expect(h[0].d).toBeCloseTo(30);
    expect(h[0].radius).toBeCloseTo(12);
  });

  it("keeps only animated species", () => {
    const catalog: Catalog = { fish: [fish], corals: [coral], presets: [] };
    const water = ops.empty_water();
    water.livestock = [
      {
        id: "1",
        kind: "fish",
        species: "damsel",
        name: "",
        count: 3,
        note: "",
      },
      {
        id: "2",
        kind: "fish",
        species: "unknown",
        name: "",
        count: 3,
        note: "",
      },
      {
        id: "3",
        kind: "invertebrate",
        species: "damsel",
        name: "",
        count: 3,
        note: "",
      },
      {
        id: "4",
        kind: "fish",
        species: "damsel",
        name: "",
        count: 0,
        note: "",
      },
      {
        id: "5",
        kind: "fish",
        species: "damsel",
        name: "",
        count: 1,
        size_cm: [2, 3],
        note: "",
      },
    ];
    const groups = fish_groups(water, catalog);
    expect(groups.map((g) => [g.line_id, g.size_cm])).toEqual([
      ["1", [5, 8]],
      ["5", [2, 3]],
    ]);
    expect(fish_groups(water, null)).toEqual([]);

    // with a 2D canvas, a species missing from the catalog swims as a
    // generic fish
    const ctx: any = new Proxy(
      {},
      {
        get: (target: any, key) =>
          key in target
            ? target[key]
            : key === "createLinearGradient"
              ? () => ({ addColorStop: () => undefined })
              : () => undefined,
        set: (target: any, key, value) => {
          target[key] = value;
          return true;
        },
      },
    );
    const get = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(ctx);
    const url = vi
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockReturnValue("data:image/png;base64,AAAA");
    try {
      reset_generic_fish();
      const generic = generic_fish()!;
      expect(generic.id).toBe(GENERIC_FISH_ID);
      expect(generic.atlas["1x"]).toBe("data:image/png;base64,AAAA");
      expect(generic.clips.swim).toEqual({
        from: 0,
        to: 7,
        fps: 12,
        loop: true,
      });
      expect(generic_fish()).toBe(generic); // drawn once
      const with_generic = fish_groups(water, catalog);
      expect(with_generic.map((g) => [g.line_id, g.species.id])).toEqual([
        ["1", "damsel"],
        ["2", GENERIC_FISH_ID],
        ["5", "damsel"],
      ]);
    } finally {
      get.mockRestore();
      url.mockRestore();
      reset_generic_fish();
    }
    expect(tank_size(ops.new_document("x"))).toEqual({
      length: 100,
      height: 50,
      width: 50,
    });
  });

  it("measures the glow of fluorescent colours", () => {
    expect(glow_strength(null)).toBe(0);
    expect(glow_strength({ lamps: [], dark: true, none: true })).toBe(0);
    expect(
      glow_strength({
        lamps: [{ x: 0, rgb: [255, 250, 235], power: 1, dark: false }],
        dark: false,
        none: false,
      }),
    ).toBe(0);
    const blue = glow_strength({
      lamps: [{ x: 0, rgb: [40, 70, 255], power: 1, dark: false }],
      dark: false,
      none: false,
    });
    expect(blue).toBeGreaterThan(0.5);
    const moon = glow_strength({
      lamps: [{ x: 0, rgb: [40, 70, 255], power: 0, dark: true }],
      dark: true,
      none: false,
    });
    expect(moon).toBeGreaterThan(0);
    expect(moon).toBeLessThan(blue);
  });
});

describe("AquariumScene", () => {
  it("builds the regions of a view and runs without a 2D context", () => {
    let doc = ops.new_document("T");
    let view: string;
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.7));
    doc = ops.set_region(doc, view, "sump", []);
    [doc] = ops.add_line(doc, "main", { species: "damsel", count: 4 });
    [doc] = ops.add_coral(doc, "main", coral, view, [0.5, 0.6]);
    [doc] = ops.add_coral(doc, "main", { id: "unknown" }, view, [0.5, 0.6]);
    const catalog: Catalog = { fish: [fish], corals: [coral], presets: [] };
    const canvas = document.createElement("canvas");
    const scene = new AquariumScene(canvas, document.createElement("canvas"));
    scene.configure({
      doc,
      view_id: view,
      catalog,
      background: null,
      seed: "s",
    });
    expect(scene.regions).toHaveLength(1);
    expect(scene.regions[0].sim.fish).toHaveLength(4);
    expect(scene.regions[0].corals).toHaveLength(1);

    scene.set_light({ main: { lamps: [], dark: true, none: false } }, true);
    expect(scene.regions[0].sim.nightness).toBe(1);
    scene.set_light({}, false);
    scene.set_flow({ main: 0.5 });
    expect(scene.regions[0].sim.flow).toBe(0.5);

    scene.feed([], 30);
    expect(scene.regions[0].sim.particles.length).toBeGreaterThan(0);
    scene.feed([[0.5, 0.05]], 30);
    scene.feed([[5, 5]], 30);
    scene.step(0.1);
    scene.draw();

    const raf = vi
      .spyOn(globalThis, "requestAnimationFrame")
      .mockImplementation(() => 1);
    const caf = vi
      .spyOn(globalThis, "cancelAnimationFrame")
      .mockImplementation(() => undefined);
    scene.start();
    scene.start();
    expect(scene.running).toBe(true);
    scene.stop();
    expect(scene.running).toBe(false);
    raf.mockRestore();
    caf.mockRestore();

    scene.configure({
      doc,
      view_id: "ghost",
      catalog,
      background: null,
      seed: "s",
    });
    expect(scene.regions).toHaveLength(0);
  });

  it("tints far fish with the haze instead of making them see-through", () => {
    let doc = ops.new_document("T");
    let view: string;
    doc.dimensions_cm = { length: 120, width: 60, height: 50 };
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0.1, 0.1, 0.9, 0.7));
    [doc] = ops.add_line(doc, "main", { species: "damsel", count: 3 });
    const calls: { op: string; alpha: number; mode: string; arg?: any }[] = [];
    const fake = (): any => {
      const c: any = {
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
        fillStyle: "",
      };
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
        "moveTo",
        "lineTo",
        "closePath",
        "stroke",
        "clip",
        "ellipse",
        "setTransform",
        "resetTransform",
        "putImageData",
      ])
        c[name] = () => undefined;
      c.drawImage = (src: any) =>
        calls.push({
          op: "draw",
          alpha: c.globalAlpha,
          mode: c.globalCompositeOperation,
          arg: src,
        });
      c.fillRect = () =>
        calls.push({
          op: "fill",
          alpha: c.globalAlpha,
          mode: c.globalCompositeOperation,
          arg: c.fillStyle,
        });
      return c;
    };
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockImplementation(fake as any);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;
      const scene = new AquariumScene(canvas, null as any);
      scene.configure({
        doc,
        view_id: view,
        catalog: { fish: [fish], corals: [], presets: [] },
        background: null,
        seed: "s",
      });
      const img = document.createElement("img");
      (scene as any)._atlases.set(fish.atlas["1x"], img);
      const fishes = scene.regions[0].sim.fish;
      fishes[0].d = 0; // at the front glass: no haze
      fishes[1].d = 60; // at the back
      fishes[2].d = 60;
      fishes[2].alpha = 0.4; // hiding at night: faded on purpose
      scene.draw();
      const sprites = calls.filter(
        (c) => c.op === "draw" && c.mode === "source-over",
      );
      // every fish drawn opaque (but the hiding one)
      const on_main = sprites.filter(
        (c) => c.arg === img || c.arg?.tagName === "CANVAS",
      );
      expect(on_main.some((c) => c.arg === img && c.alpha === 1)).toBe(true);
      const tinted = calls.filter(
        (c) => c.op === "fill" && c.mode === "source-atop",
      );
      expect(tinted.length).toBeGreaterThanOrEqual(2);
      expect(tinted[0].arg).toBe("rgb(120,150,170)");
      expect(tinted[0].alpha).toBeCloseTo(0.25);
      const hazed = sprites.filter((c) => c.arg?.tagName === "CANVAS");
      expect(hazed.map((c) => c.alpha).sort()).toEqual([0.4, 1]);
      // no 2D context for the scratch canvas: drawn without the haze
      spy.mockImplementation(((type: string) => null) as any);
      calls.length = 0;
      (scene as any)._scratch = null;
      expect((scene as any)._hazed(img, 0, 0, 10, 10, 0.2)).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });

  it("places homes, follows the sand line, cuts the decor from a drawn backdrop", () => {
    let doc = ops.new_document("T");
    let view: string;
    doc.dimensions_cm = { length: 100, width: 50, height: 50 };
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0, 0, 1, 1));
    doc = ops.set_sand_line(doc, view, "main", [
      [0, 0.8],
      [1, 0.9],
    ]);
    [doc] = ops.add_decor(
      doc,
      view,
      [
        [0.2, 0.5],
        [0.4, 0.4],
        [0.5, 0.7],
      ],
      0.5,
    );
    let line: string;
    [doc, line] = ops.add_line(doc, "main", { species: "damsel", count: 2 });
    doc = ops.update_line(doc, "main", line, { home: [0.5, 2, 0.2] });
    const groups = fish_groups(
      doc.waters.main,
      { fish: [fish], corals: [], presets: [] },
      tank_size(doc),
    );
    expect(groups[0].home).toEqual([50, 50, 10]);
    const drawn: string[] = [];
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockImplementation(
        () =>
          new Proxy(
            {},
            {
              get: (t: any, k) =>
                k in t
                  ? t[k]
                  : k === "drawImage"
                    ? (src: any) => drawn.push(src?.tagName)
                    : () => undefined,
              set: (t: any, k, v) => ((t[k] = v), true),
            },
          ) as any,
      );
    try {
      const canvas = document.createElement("canvas");
      const backdrop = document.createElement("canvas");
      backdrop.width = 0;
      const scene = new AquariumScene(canvas, null as any);
      const setup = {
        doc,
        view_id: view,
        catalog: { fish: [fish], corals: [], presets: [] },
        background: null,
        overlay: backdrop,
        seed: "s",
      };
      scene.configure(setup);
      // an empty canvas: nothing to cut out yet
      expect((scene as any)._cutouts).toHaveLength(0);
      const sim = scene.regions[0].sim;
      expect(sim.env.sand!.front[0][1]).toBeCloseTo(0.8);
      expect(sim.env.sand!.front[1][1]).toBeCloseTo(0.9);
      // no back line: as high at the back
      expect(sim.env.sand!.back).toBe(sim.env.sand!.front);
      expect(sim.fish[0].home).toEqual([50, 50, 10]);
      backdrop.width = 300;
      scene.resize();
      expect((scene as any)._cutouts).toHaveLength(1);
      expect(drawn).toContain("CANVAS");
    } finally {
      spy.mockRestore();
    }
  });

  it("draws a fish in its burrow head up, cut at the sand", () => {
    let doc = ops.new_document("T");
    let view: string;
    doc.dimensions_cm = { length: 100, width: 50, height: 50 };
    [doc, view] = ops.add_view(doc, "Front");
    doc = ops.set_region(doc, view, "main", rect_quad(0, 0, 1, 1));
    [doc] = ops.add_line(doc, "main", { species: "goby", count: 1 });
    const goby = {
      ...fish,
      id: "goby",
      facing: "left" as const,
      behavior: { profile: "sand" as const, burrow: true, territory_cm: 8 },
    };
    const calls: { op: string; args: any[] }[] = [];
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockImplementation(
        () =>
          new Proxy(
            {},
            {
              get: (t: any, k) =>
                k in t
                  ? t[k]
                  : (...args: any[]) => calls.push({ op: String(k), args }),
              set: (t: any, k, v) => ((t[k] = v), true),
            },
          ) as any,
      );
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;
      const scene = new AquariumScene(canvas, null as any);
      scene.configure({
        doc,
        view_id: view,
        catalog: { fish: [goby], corals: [], presets: [] },
        background: null,
        seed: "s",
      });
      const img = document.createElement("img");
      (scene as any)._atlases.set(goby.atlas["1x"], img);
      const f = scene.regions[0].sim.fish[0];
      expect(f.emerge).toBeLessThan(1);
      scene.draw();
      const rotate = calls.find((c) => c.op === "rotate")!;
      expect(Math.abs(rotate.args[0])).toBeCloseTo(1.15);
      expect(calls.some((c) => c.op === "rect")).toBe(true);
      expect(calls.some((c) => c.op === "drawImage")).toBe(true);
      // fully in: not drawn
      f.emerge = 0;
      calls.length = 0;
      scene.draw();
      expect(calls.some((c) => c.op === "drawImage")).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });
});
