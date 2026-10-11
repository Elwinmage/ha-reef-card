// Edge cases of the aquarium logic modules, completing the main suites.
// Covers: src/aquarium/sim.ts
//         src/aquarium/editor/ops.ts
//         src/aquarium/geometry.ts
//         src/aquarium/light.ts
//         src/aquarium/tree.ts
//         src/aquarium/backdrop.ts

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FishSim,
  distribute,
  type FishGroup,
  type SimEnv,
} from "../src/aquarium/sim";
import * as ops from "../src/aquarium/editor/ops";
import { rect_quad, sand_at, smooth_line } from "../src/aquarium/geometry";
import { entity_reading, lamp_reading } from "../src/aquarium/light";
import { build_tree } from "../src/aquarium/tree";
import { Backdrop, draw_backdrop } from "../src/aquarium/backdrop";
import * as sprites from "../src/aquarium/sprites";
import type {
  Catalog,
  CloudAquarium,
  FishSpecies,
  Preset,
} from "../src/aquarium/types";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ─── Fish simulation ─────────────────────────────────────────────────────────

function species(
  id: string,
  profile: any,
  extra: Partial<FishSpecies> = {},
): FishSpecies {
  return {
    id,
    kind: "fish",
    source: "bundled",
    frame: [256, 128],
    columns: 8,
    clips: { swim: { from: 0, to: 23, fps: 24, loop: true } },
    atlas: { "1x": `/a/${id}.webp` },
    behavior: { profile, speed_cm_s: [5, 8] },
    ...extra,
  } as FishSpecies;
}

const env: SimEnv = {
  size: { length: 120, height: 50, width: 60 },
  sand_band: 0.1,
  hideouts: [],
};

function group(s: FishSpecies, count: number): FishGroup {
  return { species: s, line_id: s.id, count, size_cm: [5, 8] };
}

function inside(p: [number, number, number]) {
  expect(p[0]).toBeGreaterThanOrEqual(0);
  expect(p[0]).toBeLessThanOrEqual(env.size.length);
  expect(p[1]).toBeGreaterThanOrEqual(0);
  expect(p[1]).toBeLessThanOrEqual(env.size.height);
  expect(p[2]).toBeGreaterThanOrEqual(0);
  expect(p[2]).toBeLessThanOrEqual(env.size.width);
}

describe("distribute: odd counts", () => {
  it("draws no fish for a count that is not a number", () => {
    // NaN never fits, and leaves no share to hand out
    expect(distribute([NaN], 3)).toEqual([0]);
  });
});

describe("FishSim edge cases", () => {
  it("spawns nothing for an empty group", () => {
    const sim = new FishSim(
      env,
      [group(species("none", "cruiser"), 0), group(species("one", "hover"), 2)],
      30,
      1,
    );
    expect(sim.fish.map((f) => f.line_id)).toEqual(["one", "one"]);
  });

  it("picks points without home (default arguments)", () => {
    const sim = new FishSim(
      { ...env, hideouts: [{ x: 60, y: 30, d: 30, radius: 10 }] },
      [],
      30,
      2,
    );
    const s = species("p", "cruiser");
    for (let i = 0; i < 20; i++) {
      inside((sim as any)._random_point(s, 5));
      const perch = (sim as any)._perch(5);
      inside(perch);
    }
  });

  it("falls back to its own target before the school has one", () => {
    const sim = new FishSim(env, [group(species("s", "shoal"), 1)], 30, 3);
    const f = sim.fish[0];
    // No step yet: the school has no shared target
    const goal = (sim as any)._goal(f, 0.1);
    expect(goal.target).toBe(f.target);
    expect(goal.speed).toBe(f.speed);
  });

  it("swims alone when its school has no other member", () => {
    const sim = new FishSim(env, [group(species("lone", "shoal"), 1)], 30, 4);
    const f = sim.fish[0];
    for (let i = 0; i < 300; i++) sim.step(1 / 30);
    inside([f.x, f.y, f.d]);
    expect(Number.isFinite(f.vx) && Number.isFinite(f.vy)).toBe(true);
  });

  it("is pushed back by the side walls", () => {
    const sim = new FishSim(env, [group(species("h", "hover"), 1)], 30, 5);
    const f = sim.fish[0];
    const park = (x: number) => {
      f.x = x;
      f.y = 20;
      f.d = 30;
      f.vx = f.vy = f.vd = 0;
      f.target = [x, 20, 30];
      f.retarget = 100;
    };
    park(0);
    sim.step(1 / 30);
    expect(f.vx).toBeGreaterThan(0);
    park(env.size.length);
    sim.step(1 / 30);
    expect(f.vx).toBeLessThan(0);
  });

  it("hides at night behind the decor nearest to its home", () => {
    const hider = species("hider", "cruiser", { night: "hide" });
    const sim = new FishSim(
      {
        ...env,
        hideouts: [
          { x: 30, y: 40, d: 30, radius: 10 },
          { x: 100, y: 40, d: 30, radius: 10 },
        ],
      },
      [{ ...group(hider, 1), home: [35, 30, 30] }],
      30,
      6,
    );
    sim.force_night(true);
    for (let i = 0; i < 1800; i++) sim.step(1 / 30);
    expect(Math.abs(sim.fish[0].x - 30)).toBeLessThan(15);
  });

  it("hovers in place at night when there is nowhere to hide", () => {
    const hider = species("hider", "cruiser", { night: "hide" });
    const sim = new FishSim(env, [group(hider, 1)], 30, 7);
    const f = sim.fish[0];
    sim.force_night(true);
    for (let i = 0; i < 300; i++) sim.step(1 / 30);
    // Slow drift only: speed * 0.12 (+ the margin of the speed cap)
    expect(Math.hypot(f.vx, f.vy, f.vd)).toBeLessThanOrEqual(
      f.speed * 0.12 * 1.3 + 0.5,
    );
  });

  it("comes out of its burrow for food with the default response", () => {
    const goby = species("goby", "sand", {
      behavior: { profile: "sand", speed_cm_s: [3, 5], burrow: true },
    });
    const sim = new FishSim(
      env,
      [{ ...group(goby, 1), home: [60, 45, 30] }],
      30,
      8,
    );
    const f = sim.fish[0];
    sim.feed(60, 0, 30, 30, 10);
    for (let t = 0; t < 3; t += 1 / 10) sim.step(1 / 10);
    expect(f.emerge).toBe(1);
  });

  it("peeks when the random pick falls past every burrow mode", () => {
    const goby = species("goby", "sand", {
      behavior: { profile: "sand", speed_cm_s: [3, 5], burrow: true },
    });
    const sim = new FishSim(
      env,
      [{ ...group(goby, 1), home: [60, 45, 30] }],
      30,
      9,
    );
    const f = sim.fish[0];
    f.burrow!.mode = "out";
    f.burrow!.left = 0;
    // A pick of 1 leaves a rounding remainder after the three weights
    (sim as any)._rng.next = () => 1;
    sim.step(0.05);
    expect(f.burrow!.mode).toBe("peek");
    expect(f.burrow!.left).toBe(40);
  });

  it("frame rate: idle clip without fps, no swim clip", () => {
    const idle = species("idle", "hover", {
      clips: { idle: { from: 0, to: 3, fps: 0, loop: true } } as any,
    });
    const bare = species("bare", "hover", { clips: {} as any });
    const sim = new FishSim(env, [group(idle, 1), group(bare, 1)], 30, 10);
    const [a, b] = sim.fish;
    a.vx = a.vy = 0;
    expect(sim.idle(a)).toBe(true);
    expect(sim.frame_rate(a)).toBe(12);
    b.vx = b.speed;
    b.vy = 0;
    expect(sim.frame_rate(b)).toBeCloseTo(24 * sim.speed_factor(b));
  });
});

// ─── Editor operations ───────────────────────────────────────────────────────

describe("ops edge cases", () => {
  function base() {
    let doc = ops.new_document("Tank");
    let front: string;
    [doc, front] = ops.add_view(doc, "Front");
    return { doc, front };
  }

  it("makes ids without crypto", () => {
    vi.stubGlobal("crypto", undefined);
    const id = ops.new_id();
    expect(id).toMatch(/^[a-f][0-9a-f]{7}$/);
  });

  it("matches the dimensions among several presets of a series", () => {
    const presets: Preset[] = [
      {
        id: "r350",
        source: "bundled",
        match: { series: ["reefer"] },
        dimensions_cm: { length: 90, width: 50, height: 50 },
      },
      {
        id: "r425",
        source: "bundled",
        match: { series: ["reefer"] },
        dimensions_cm: { length: 120, width: 60, height: 50 },
      },
    ];
    const cloud: CloudAquarium = {
      provider: "redsea",
      account: "me",
      uid: "u",
      name: "R",
      system_model: "",
      system_series: "Reefer",
      dimensions_cm: { length: 121, width: 60, height: 51 },
      device_ids: [],
      feeding_entities: [],
    };
    expect(ops.match_preset(presets, cloud)!.id).toBe("r425");
    // No dimensions close: the first of the series
    expect(
      ops.match_preset(presets, {
        ...cloud,
        dimensions_cm: { length: 10, width: 10, height: 10 },
      })!.id,
    ).toBe("r350");
  });

  it("pre-fills from a cloud aquarium without dimensions", () => {
    const doc = ops.from_cloud({
      provider: "redsea",
      account: "me",
      uid: "u",
      name: "R",
      device_ids: [],
      feeding_entities: [],
    } as any);
    expect(doc.dimensions_cm).toBeNull();
  });

  it("applies a preset view without decor, hotspots nor regions", () => {
    const doc = ops.apply_preset(ops.new_document("T"), {
      id: "p",
      source: "bundled",
      views: {
        bare: {
          name: "Bare",
          decor: undefined,
          hotspots: undefined,
          regions: undefined,
        } as any,
      },
    });
    expect(doc.views.bare.decor).toEqual([]);
    expect(doc.views.bare.hotspots).toEqual([]);
    expect(doc.views.bare.elements).toEqual([]);
  });

  it("adds a water without a name", () => {
    const doc = ops.add_water(ops.new_document("T"), "sump");
    expect(doc.waters.sump.name).toBe("");
  });

  it("ignores updates of missing items", () => {
    const { doc, front } = base();
    const same = (d: typeof doc) => expect(d).toEqual(doc);
    same(ops.update_decor(doc, front, "ghost", { z: 0.1 }));
    same(ops.update_hotspot(doc, front, "ghost", { label: "x" }));
    same(ops.update_element(doc, front, "ghost", { label: "x" }));
    same(ops.update_light(doc, "main", 3, { x: 0.1 }));
    same(ops.update_water(doc, "ghost", { name: "x" }));
    same(ops.update_line(doc, "main", "ghost", { name: "x" }));
    same(ops.update_coral(doc, "main", "ghost", { name: "x" }));
  });

  it("updates an element without moving it, keeping its source", () => {
    let { doc, front } = base();
    let el: string | null;
    [doc, el] = ops.add_element(doc, front, {
      kind: "entity",
      entity_id: "switch.feed",
      pos: [0.5, 0.5],
      source: "src1",
    } as any);
    doc = ops.update_element(doc, front, el!, { label: "Feeder" });
    const element = doc.views[front].elements[0];
    expect(element.label).toBe("Feeder");
    expect(element.pos).toEqual([0.5, 0.5]);
    expect(element.source).toBe("src1");
  });

  it("keeps the elements bound to another feeding source", () => {
    let { doc, front } = base();
    let a: string | null;
    let b: string | null;
    [doc, a] = ops.add_feed_source(doc, "switch.a");
    [doc, b] = ops.add_feed_source(doc, "switch.b");
    [doc] = ops.add_element(doc, front, {
      kind: "entity",
      entity_id: "switch.a",
      pos: [0.1, 0.1],
      source: a,
    } as any);
    [doc] = ops.add_element(doc, front, {
      kind: "entity",
      entity_id: "switch.b",
      pos: [0.2, 0.2],
      source: b,
    } as any);
    doc = ops.remove_feed_source(doc, a!);
    expect(doc.views[front].elements.map((e) => e.source)).toEqual([null, b]);
  });

  it("does not add a light twice, matched by entity", () => {
    let doc = ops.add_light(ops.new_document("T"), "main", {
      entity_id: "light.lamp",
    } as any);
    doc = ops.add_light(doc, "main", { entity_id: "light.lamp" } as any);
    expect(doc.waters.main.lights).toEqual([
      { entity_id: "light.lamp", x: 0.5 },
    ]);
    doc = ops.add_light(doc, "main", { entity_id: "light.other" } as any);
    expect(doc.waters.main.lights).toHaveLength(2);
  });
});

// ─── Geometry ────────────────────────────────────────────────────────────────

describe("smooth_line: monotone cubic", () => {
  it("averages the slopes of a rising line and stays monotone", () => {
    const out = smooth_line(
      [
        [0, 0],
        [1, 1],
        [2, 3],
      ],
      4,
    );
    expect(out[0]).toEqual([0, 0]);
    expect(out[out.length - 1]).toEqual([2, 3]);
    for (let i = 1; i < out.length; i++)
      expect(out[i][1]).toBeGreaterThanOrEqual(out[i - 1][1]);
  });

  it("keeps a flat segment flat", () => {
    const out = smooth_line(
      [
        [0, 0],
        [1, 0],
        [2, 1],
      ],
      4,
    );
    for (const [x, y] of out) if (x <= 1) expect(y).toBeCloseTo(0);
  });

  it("limits the tangents on a sharp bend (no overshoot)", () => {
    const out = smooth_line(
      [
        [0, 0],
        [1, 0.01],
        [2, 10],
      ],
      8,
    );
    for (let i = 1; i < out.length; i++)
      expect(out[i][1]).toBeGreaterThanOrEqual(out[i - 1][1] - 1e-9);
    for (const [x, y] of out) if (x <= 1) expect(y).toBeLessThanOrEqual(0.01);
  });
});

describe("sand_at: degenerate profile", () => {
  it("does not divide by a span that is not a number", () => {
    // A broken first point: the span falls back to 1
    expect(
      sand_at(
        [
          [NaN, 0.2],
          [0.5, 0.6],
        ],
        0.3,
      ),
    ).toBeNaN();
  });
});

// ─── Light ───────────────────────────────────────────────────────────────────

describe("light edge cases", () => {
  it("reads an entity on without attributes as full white", () => {
    const hass: any = { states: { "light.l": { state: "on" } } };
    expect(entity_reading(hass, "light.l", 0.3)).toEqual({
      x: 0.3,
      rgb: [255, 250, 235],
      power: 1,
      dark: false,
    });
  });

  it("reads unparsable colour components as 0", () => {
    const hass: any = {
      states: {
        "light.l": {
          state: "on",
          attributes: { rgb_color: ["x", 10, 20], brightness: 255 },
        },
      },
    };
    expect(entity_reading(hass, "light.l", 0.5).rgb).toEqual([0, 10, 20]);
  });

  it("reads a ReefLED device source with its own model", () => {
    const hass: any = {
      states: {
        "light.w": { state: "on", attributes: { brightness: 255 } },
        "light.b": { state: "on", attributes: { brightness: 255 } },
        "switch.s": { state: "on" },
      },
      entities: {
        "light.w": { device_id: "led", translation_key: "white" },
        "light.b": { device_id: "led", translation_key: "blue" },
        "switch.s": { device_id: "led", translation_key: "device_state" },
      },
    };
    const reading = lamp_reading(hass, { device_id: "led", x: 0.4 } as any);
    expect(reading.x).toBe(0.4);
    expect(reading.dark).toBe(false);
    expect(reading.power).toBeGreaterThan(0.5);
  });
});

// ─── Tree ────────────────────────────────────────────────────────────────────

describe("tree edge cases", () => {
  it("names unnamed devices, areas and floors after their ids", () => {
    const hass: any = {
      floors: {
        f1: {},
        f2: { name: "Two" },
        f3: { name: "Three", level: 0 },
      },
      areas: {
        a1: { floor_id: "f1" },
        a2: { name: "B", floor_id: "f2" },
        a3: { name: "C", floor_id: "f3" },
      },
      devices: {
        d1: { id: "d1", area_id: "a1" },
        d2: { name: "D2", area_id: "a2" },
        d3: { name: "D3", area_id: "a3" },
        x: {},
      },
      entities: {},
      states: {},
    };
    const tree = build_tree(hass);
    // Leveled floors first, then by name (the id when unnamed)
    expect(tree.floors.map((f) => f.id)).toEqual(["f3", "f1", "f2"]);
    const f1 = tree.floors[1];
    expect(f1).toMatchObject({ name: "f1", icon: null, level: null });
    expect(f1.areas[0].name).toBe("a1");
    expect(f1.areas[0].devices[0].name).toBe("d1");
    expect(tree.unassigned!.devices.map((d) => d.name)).toEqual([""]);
  });
});

// ─── Backdrop ────────────────────────────────────────────────────────────────

/** A 2D context recording the names of its calls. */
function fake_ctx(calls: string[] = []): any {
  const pattern = { setTransform: vi.fn() };
  return new Proxy(
    { calls },
    {
      get: (target: any, key) => {
        if (key in target) return target[key];
        if (key === "createLinearGradient")
          return () => ({ addColorStop: () => undefined });
        if (key === "createPattern") return () => pattern;
        return () => {
          calls.push(String(key));
        };
      },
      set: (target: any, key, value) => {
        target[key] = value;
        return true;
      },
    },
  );
}

describe("backdrop edge cases", () => {
  function doc_on(water: string) {
    let doc = ops.new_document("Reef");
    const [d1, v] = ops.add_view(doc, "Front");
    doc = ops.set_region(d1, v, water, rect_quad(0.1, 0.1, 0.9, 0.8));
    doc = ops.set_region_drawn(doc, v, water, true);
    return { doc, v };
  }

  it("draws a region of an unknown water with the default sand band", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      fake_ctx(),
    );
    const known = doc_on("main");
    const ghost = doc_on("ghost");
    delete ghost.doc.waters.ghost;
    const a: string[] = [];
    const b: string[] = [];
    draw_backdrop(
      fake_ctx(a),
      200,
      100,
      known.doc,
      known.doc.views[known.v],
      {},
    );
    draw_backdrop(
      fake_ctx(b),
      200,
      100,
      ghost.doc,
      ghost.doc.views[ghost.v],
      {},
    );
    // The main water has the default band (0.12): the same drawing
    expect(b).toEqual(a);
    expect(b).toContain("fill");
  });

  it("loads textures without a change callback", async () => {
    vi.spyOn(sprites, "load_image").mockImplementation(() =>
      Promise.resolve({ width: 16 } as any),
    );
    const { doc, v } = doc_on("main");
    const catalog = {
      fish: [],
      corals: [],
      presets: [],
      textures: [
        {
          id: "r",
          source: "pack",
          role: "rock",
          image: "/t/r.webp",
          scale_cm: 20,
        },
      ],
    } as unknown as Catalog;
    const backdrop = new Backdrop();
    backdrop.configure(doc, doc.views[v], catalog);
    await new Promise((r) => setTimeout(r, 0));
    expect(backdrop.textures.rock).toEqual({
      image: { width: 16 },
      scale_cm: 20,
    });
  });
});
