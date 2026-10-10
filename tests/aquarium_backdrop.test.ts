import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Backdrop,
  builtin_texture,
  draw_backdrop,
  drawn,
  drawn_region,
  pick_texture,
  reset_builtin_textures,
} from "../src/aquarium/backdrop";
import {
  WaterProjection,
  rect_quad,
  rough_outline,
  sand_at,
  sand_profile,
  sand_surface,
  sand_v,
} from "../src/aquarium/geometry";
import * as sprites from "../src/aquarium/sprites";
import type { Catalog, Texture } from "../src/aquarium/types";
import * as ops from "../src/aquarium/editor/ops";

/** A 2D context recording its calls. */
function fake_ctx(calls: string[] = []): any {
  const pattern = { setTransform: vi.fn() };
  return new Proxy(
    { calls, pattern, styles: [] as unknown[] },
    {
      get: (target: any, key) => {
        if (key in target) return target[key];
        if (key === "createLinearGradient")
          return () => ({ addColorStop: () => undefined });
        if (key === "createPattern") return () => pattern;
        return (...args: any[]) => {
          calls.push(String(key));
          void args;
        };
      },
      set: (target: any, key, value) => {
        if (key === "fillStyle") target.styles.push(value);
        target[key] = value;
        return true;
      },
    },
  );
}

const texture = (id: string, role: "rock" | "sand"): Texture => ({
  id,
  source: "pack",
  role,
  image: `/t/${id}.webp`,
  scale_cm: 30,
});

function doc_with_view() {
  let doc = ops.new_document("Reef");
  const [d1, v] = ops.add_view(doc, "Front");
  doc = ops.set_region(d1, v, "main", rect_quad(0.1, 0.1, 0.9, 0.8));
  doc = ops.set_region_drawn(doc, v, "main", true);
  doc = ops.set_sand_line(doc, v, "main", [
    [0.9, 0.7],
    [0.1, 0.72],
  ]);
  [doc] = ops.add_decor(
    doc,
    v,
    [
      [0.2, 0.5],
      [0.4, 0.4],
      [0.5, 0.7],
    ],
    0.8,
  );
  [doc] = ops.add_decor(
    doc,
    v,
    [
      [0.6, 0.6],
      [0.7, 0.5],
      [0.8, 0.7],
    ],
    0.2,
  );
  return { doc, v };
}

afterEach(() => {
  vi.restoreAllMocks();
  reset_builtin_textures();
});

describe("sand profile", () => {
  const p = new WaterProjection(rect_quad(0, 0, 1, 1));
  it("extends a straight sand line across the glass", () => {
    expect(
      sand_profile(
        p,
        [
          [0.25, 0.8],
          [0.75, 0.9],
        ],
        0.12,
      ),
    ).toEqual([
      [0, expect.closeTo(0.75, 6)],
      [0.25, expect.closeTo(0.8, 6)],
      [0.75, expect.closeTo(0.9, 6)],
      [1, expect.closeTo(0.95, 6)],
    ]);
  });
  it("follows the bumps, rounded, level beyond its ends", () => {
    const bumpy = sand_profile(
      p,
      [
        [0.8, 0.85],
        [0.2, 0.9],
        [0.5, 0.7],
      ],
      0.1,
    );
    expect(bumpy[0]).toEqual([0, expect.closeTo(0.9, 6)]);
    expect(bumpy.at(-1)).toEqual([1, expect.closeTo(0.85, 6)]);
    expect(bumpy.length).toBeGreaterThan(10);
    // through its points, rounded in between, never beyond them
    expect(sand_at(bumpy, 0.5)).toBeCloseTo(0.7);
    expect(sand_at(bumpy, 0.2)).toBeCloseTo(0.9);
    for (const [, v] of bumpy) {
      expect(v).toBeGreaterThanOrEqual(0.7 - 1e-9);
      expect(v).toBeLessThanOrEqual(0.9 + 1e-9);
    }
    const mid = sand_at(bumpy, 0.35);
    expect(mid).toBeGreaterThan(0.7);
    expect(mid).toBeLessThan(0.8); // above the straight line: rounded
    expect(sand_at(bumpy, -1)).toBeCloseTo(0.9);
    expect(sand_at(bumpy, 2)).toBeCloseTo(0.85);
    // a point outside the glass shapes the line, and is not kept
    const wide = sand_profile(
      p,
      [
        [-0.2, 0.9],
        [0.5, 0.7],
        [1.2, 0.9],
      ],
      0.1,
    );
    expect(wide[0][0]).toBe(0);
    expect(wide.at(-1)![0]).toBe(1);
    expect(wide[0][1]).toBeGreaterThan(0.75);
    expect(wide[0][1]).toBeLessThan(0.9);
    expect(sand_at(wide, 0.5)).toBeCloseTo(0.7);
    expect(wide.every(([u]) => u >= 0 && u <= 1)).toBe(true);
  });
  it("falls back on the sand band", () => {
    const flat = (v: number) => [
      [0, v],
      [1, v],
    ];
    expect(sand_profile(p, [], 0.2)).toEqual(flat(0.9));
    expect(sand_profile(p, null, undefined as any)).toEqual(flat(0.94));
    // points at the same place along the glass: one, level
    expect(
      sand_profile(
        p,
        [
          [0.5, 0.7],
          [0.5, 0.9],
        ],
        0.1,
      ),
    ).toEqual(flat(0.8));
    // clamped
    expect(
      sand_profile(
        p,
        [
          [0.4, 0.2],
          [0.6, 1.5],
        ],
        0.1,
      ),
    ).toEqual([
      [0, 0],
      [0.4, 0.2],
      [0.6, 1],
      [1, 1],
    ]);
    expect(
      sand_profile(
        p,
        [
          [NaN, 0],
          [1, 1],
        ],
        0.2,
      ),
    ).toEqual(flat(1)); // the one point left
  });
});

describe("sand surface and stone edges", () => {
  const p = new WaterProjection(rect_quad(0.1, 0.1, 0.9, 0.9));
  it("finds water points at a depth", () => {
    const [x, y] = p.to_picture(0.2, 0.8, 1);
    const [u, v] = p.to_water_at(x, y, 1);
    expect(u).toBeCloseTo(0.2);
    expect(v).toBeCloseTo(0.8);
  });
  it("slopes from the front line to the back one", () => {
    const back = [p.to_picture(0, 0.6, 1), p.to_picture(1, 0.6, 1)];
    const surface = sand_surface(p, [], back, 0.2);
    expect(sand_v(surface, 0.5, 0)).toBeCloseTo(0.9);
    expect(sand_v(surface, 0.5, 1)).toBeCloseTo(0.6);
    expect(sand_v(surface, 0.5, 0.5)).toBeCloseTo(0.75);
    expect(sand_v(surface, 0.5, 9)).toBeCloseTo(0.6);
    // no back line: level
    const level = sand_surface(p, null, [back[0]], 0.2);
    expect(level.back).toBe(level.front);
  });
  it("roughens the edges of a stone, the same way every time", () => {
    const square: [number, number][] = [
      [0.2, 0.2],
      [0.4, 0.2],
      [0.4, 0.4],
      [0.2, 0.4],
    ];
    const rough = rough_outline(square, "d1");
    expect(rough.length).toBeGreaterThan(100);
    expect(rough_outline(square, "d1")).toEqual(rough);
    expect(rough_outline(square, "d2")).not.toEqual(rough);
    // off the straight edge, but not far
    const top = rough.filter(([x, y]) => x > 0.25 && x < 0.35 && y < 0.3);
    expect(top.some(([, y]) => Math.abs(y - 0.2) > 0.001)).toBe(true);
    for (const [x, y] of rough) {
      expect(x).toBeGreaterThan(0.19);
      expect(y).toBeLessThan(0.41);
    }
    // degenerate: kept as is
    const dot: [number, number][] = [
      [0.5, 0.5],
      [0.5, 0.5],
      [0.5, 0.5],
    ];
    expect(rough_outline(dot, "x")).toEqual(dot);
  });
});

describe("sand line ops", () => {
  it("sets, sorts, moves and removes a sand line", () => {
    const { doc, v } = doc_with_view();
    const region = () => doc2.views[v].regions[0];
    let doc2 = doc;
    expect(region().sand).toEqual([
      [0.1, 0.72],
      [0.9, 0.7],
    ]);
    doc2 = ops.move_sand_point(doc2, v, "main", 0, [-1, 0.5]);
    expect(region().sand![0]).toEqual([0, 0.5]);
    expect(ops.move_sand_point(doc2, v, "main", 5, [0, 0])).toEqual(doc2);
    doc2 = ops.move_sand_point(doc2, v, "main", 0, [0.95, 0.5]);
    expect(ops.for_save(doc2).views[v].regions[0].sand![0][0]).toBe(0.9);
    // bumps: added in their place, removed down to 2 points
    let index: number;
    [doc2, index] = ops.add_sand_point(doc2, v, "main", [0.5, 0.6]);
    expect(index).toBe(0);
    expect(region().sand!.map((q) => q[0])).toEqual([0.5, 0.9, 0.95]);
    [doc2, index] = ops.add_sand_point(doc2, v, "main", [1, 0.6]);
    expect(index).toBe(3);
    doc2 = ops.remove_sand_point(doc2, v, "main", 3);
    doc2 = ops.remove_sand_point(doc2, v, "main", 1);
    expect(region().sand).toHaveLength(2);
    expect(ops.remove_sand_point(doc2, v, "main", 0)).toEqual(doc2);
    const full = ops.set_sand_line(
      doc2,
      v,
      "main",
      Array.from({ length: 40 }, (_, i): [number, number] => [i / 40, 0.8]),
    );
    expect(full.views[v].regions[0].sand).toHaveLength(ops.MAX_SAND_POINTS);
    expect(ops.add_sand_point(full, v, "main", [0.5, 0.5])[1]).toBe(-1);
    doc2 = ops.set_sand_line(doc2, v, "main", []);
    expect(region().sand).toEqual([]);
    expect(ops.add_sand_point(doc2, v, "main", [0.5, 0.5])[1]).toBe(-1);
    // the back line, on its own
    doc2 = ops.set_sand_line(
      doc2,
      v,
      "main",
      [
        [0.8, 0.5],
        [0.2, 0.55],
      ],
      "sand_back",
    );
    expect(region().sand_back).toEqual([
      [0.2, 0.55],
      [0.8, 0.5],
    ]);
    [doc2] = ops.add_sand_point(doc2, v, "main", [0.5, 0.45], "sand_back");
    doc2 = ops.move_sand_point(doc2, v, "main", 1, [0.5, 0.4], "sand_back");
    expect(region().sand_back![1]).toEqual([0.5, 0.4]);
    doc2 = ops.remove_sand_point(doc2, v, "main", 1, "sand_back");
    expect(region().sand_back).toHaveLength(2);
    doc2 = ops.move_sand_point(doc2, v, "main", 0, [0.9, 0.5], "sand_back");
    expect(ops.for_save(doc2).views[v].regions[0].sand_back![0][0]).toBe(0.8);
    expect(region().sand).toEqual([]);
    expect(ops.set_sand_line(doc2, v, "sump", [])).toEqual(doc2);
    expect(ops.set_sand_line(doc2, "ghost", "main", [])).toEqual(doc2);
    expect(ops.empty_view().backdrop).toEqual({ mode: "photo" });
  });
});

describe("backdrop", () => {
  it("knows whether a view is drawn, and picks its textures", () => {
    expect(drawn(undefined)).toBe(false);
    const { doc, v } = doc_with_view();
    expect(drawn(doc.views[v])).toBe(true);
    const off = ops.set_region_drawn(doc, v, "main", false);
    expect(drawn(off.views[v])).toBe(false);
    // a view of the first version draws all its regions...
    let legacy = ops.update_view(off, v, { backdrop: { mode: "drawn" } });
    legacy = ops.set_region(legacy, v, "sump", rect_quad(0, 0.8, 1, 1));
    expect(drawn_region(legacy.views[v], legacy.views[v].regions[1])).toBe(
      true,
    );
    // ...until a region is chosen: the others keep being drawn
    const chosen = ops.set_region_drawn(legacy, v, "main", false);
    expect(chosen.views[v].backdrop!.mode).toBe("photo");
    expect(chosen.views[v].regions.map((r) => r.drawn)).toEqual([false, true]);
    expect(ops.set_region_drawn(chosen, "ghost", "main", true)).toEqual(chosen);
    expect(ops.set_region_drawn(chosen, v, "ghost", true)).toEqual(chosen);
    const catalog = {
      fish: [],
      corals: [],
      presets: [],
      textures: [
        texture("rock_a", "rock"),
        texture("rock_b", "rock"),
        texture("sand_a", "sand"),
      ],
    } as Catalog;
    expect(pick_texture(catalog, "rock", "rock_b")?.id).toBe("rock_b");
    expect(pick_texture(catalog, "rock", "gone")?.id).toBe("rock_a");
    expect(pick_texture(catalog, "sand", null)?.id).toBe("sand_a");
    expect(pick_texture(null, "sand", null)).toBeNull();
  });

  it("draws built-in textures once, wrapping at the edges", () => {
    const calls: string[] = [];
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      fake_ctx(calls),
    );
    const rock = builtin_texture("rock");
    expect(rock?.width).toBe(256);
    expect(builtin_texture("rock")).toBe(rock);
    expect(builtin_texture("sand")).not.toBe(rock);
    expect(calls.filter((c) => c === "arc").length).toBeGreaterThan(276);
    expect(calls).toContain("fillRect");
  });

  it("has no built-in texture without a 2D context", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(builtin_texture("sand")).toBeNull();
    expect(builtin_texture("sand")).toBeNull();
  });

  it("draws the water, the sand and the decor", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      fake_ctx(),
    );
    const { doc, v } = doc_with_view();
    const view = doc.views[v];
    view.regions.push({ water: "sump", quad: [], drawn: true }); // not outlined
    view.regions.push({ water: "photo", quad: rect_quad(0, 0, 1, 1) }); // from the photo
    const calls: string[] = [];
    const ctx = fake_ctx(calls);
    (globalThis as any).DOMMatrix = class {
      scaleSelf() {
        return this;
      }
    };
    try {
      draw_backdrop(ctx, 800, 450, doc, view, {
        rock: { image: { width: 512 } as any, scale_cm: 30 },
      });
    } finally {
      delete (globalThis as any).DOMMatrix;
    }
    expect(ctx.pattern.setTransform).toHaveBeenCalled();
    // water, back wall, sand surface (+ recede), 2 decor x 3, section x 2
    expect(calls.filter((c) => c === "fill").length).toBe(1 + 2 + 6 + 2);
    expect(calls.filter((c) => c === "clip").length).toBe(1);
    // without dimensions nor a pattern: plain colours
    const flat = fake_ctx();
    flat.createPattern = () => null;
    draw_backdrop(
      flat,
      100,
      100,
      { ...doc, dimensions_cm: { length: 0, width: 0, height: 0 } },
      { ...view, decor: undefined as any, regions: [view.regions[0]] },
      {},
    );
    expect(flat.styles).toContain("rgb(214,204,180)");
    draw_backdrop(
      fake_ctx(),
      10,
      10,
      doc,
      { ...view, regions: undefined as any },
      {},
    );
  });

  it("falls back to plain colours without built-in textures", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { doc, v } = doc_with_view();
    const ctx = fake_ctx();
    draw_backdrop(ctx, 100, 100, doc, doc.views[v], {});
    expect(ctx.styles).toContain("rgb(214,204,180)");
    expect(ctx.styles).toContain("rgb(140,126,108)");
  });

  it("loads the textures of a view and draws it once per change", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      fake_ctx(),
    );
    const images: Record<string, any> = {
      "/t/rock_a.webp": { width: 64 },
    };
    vi.spyOn(sprites, "load_image").mockImplementation((url: string) =>
      images[url] ? Promise.resolve(images[url]) : Promise.reject(new Error()),
    );
    const { doc, v } = doc_with_view();
    const view = doc.views[v];
    const catalog = {
      fish: [],
      corals: [],
      presets: [],
      textures: [texture("rock_a", "rock"), texture("sand_x", "sand")],
    } as Catalog;
    const changed = vi.fn();
    const backdrop = new Backdrop(changed);
    expect(backdrop.render(10, 10)).toBeNull();
    backdrop.configure(doc, view, catalog);
    backdrop.configure(doc, view, catalog); // unchanged: no reload
    await new Promise((r) => setTimeout(r, 0));
    expect(changed).toHaveBeenCalledTimes(1);
    expect(backdrop.textures.rock?.image).toBe(images["/t/rock_a.webp"]);
    expect(backdrop.textures.sand).toBeUndefined();
    const first = backdrop.render(200, 100);
    expect(first?.width).toBe(200);
    expect(backdrop.render(200, 100)).toBe(first);
    expect(backdrop.render(0, 100)).toBeNull();
    // another texture: the previous one is dropped, a late load ignored
    backdrop.configure(
      doc,
      { ...view, backdrop: { mode: "drawn", rock: "gone" } },
      { ...catalog, textures: [] },
    );
    expect(backdrop.textures.rock).toBeUndefined();
    // painted onto a visible canvas
    const target = document.createElement("canvas");
    target.width = 50;
    target.height = 20;
    expect(backdrop.paint(target)?.width).toBe(50);
    // a texture loaded after the view changed is not used
    let resolve: (img: any) => void = () => undefined;
    (sprites.load_image as any).mockImplementation(
      () => new Promise((r) => (resolve = r)),
    );
    backdrop.configure(doc, view, catalog);
    backdrop.configure(doc, view, { ...catalog, textures: [] });
    resolve({ width: 8 });
    await new Promise((r) => setTimeout(r, 0));
    expect(backdrop.textures.rock).toBeUndefined();
    // a texture without its scale covers 30 cm
    (sprites.load_image as any).mockImplementation(() =>
      Promise.resolve({ width: 8 }),
    );
    backdrop.configure(doc, view, {
      ...catalog,
      textures: [{ ...texture("rock_c", "rock"), scale_cm: 0 }],
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(backdrop.textures.rock?.scale_cm).toBe(30);
  });

  it("draws nothing without a 2D context", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { doc, v } = doc_with_view();
    const backdrop = new Backdrop();
    backdrop.configure(doc, doc.views[v], null);
    expect(backdrop.render(10, 10)).toBeNull();
    expect(backdrop.paint(document.createElement("canvas"))).toBeNull();
  });
});
