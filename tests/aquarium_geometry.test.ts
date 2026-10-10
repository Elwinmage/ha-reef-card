import { describe, expect, it } from "vitest";
import {
  WaterProjection,
  apply,
  bbox,
  clamp01,
  clip_path,
  homography,
  point_in_polygon,
  polygon_area,
  rect_quad,
  simplify,
  solve,
  svg_points,
  UNIT_SQUARE,
} from "../src/aquarium/geometry";
import type { Point } from "../src/aquarium/types";

const quad: Point[] = [
  [0.1, 0.2],
  [0.9, 0.15],
  [0.95, 0.7],
  [0.05, 0.75],
];

describe("homography", () => {
  it("maps the unit square onto the quad", () => {
    const h = homography(UNIT_SQUARE, quad)!;
    UNIT_SQUARE.forEach(([x, y], i) => {
      const [X, Y] = apply(h, x, y);
      expect(X).toBeCloseTo(quad[i][0], 9);
      expect(Y).toBeCloseTo(quad[i][1], 9);
    });
  });

  it("refuses degenerate input", () => {
    expect(homography([[0, 0]], quad)).toBeNull();
    const flat: Point[] = [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ];
    expect(homography(UNIT_SQUARE, flat)).toBeNull();
    expect(solve([[0]], [1])).toBeNull();
  });
});

describe("WaterProjection", () => {
  const p = new WaterProjection(quad);

  it("round-trips between water and picture", () => {
    const [x, y] = p.to_picture(0.3, 0.6);
    const [u, v] = p.to_water(x, y);
    expect(u).toBeCloseTo(0.3, 9);
    expect(v).toBeCloseTo(0.6, 9);
  });

  it("draws far things smaller and towards the centre", () => {
    const front = p.to_picture(0, 0.9, 0);
    const back = p.to_picture(0, 0.9, 1);
    expect(back[0]).toBeGreaterThan(front[0]);
    expect(WaterProjection.depth_scale(1)).toBeCloseTo(0.82);
    expect(WaterProjection.depth_scale(-3)).toBe(1);
  });

  it("measures the front glass width", () => {
    const r = new WaterProjection(rect_quad(0.1, 0.1, 0.9, 0.6));
    expect(r.width_at(0.5)).toBeCloseTo(0.8, 9);
  });

  it("validates quads", () => {
    expect(WaterProjection.valid(quad)).toBe(true);
    expect(WaterProjection.valid([])).toBe(false);
    expect(WaterProjection.valid(null)).toBe(false);
    expect(
      WaterProjection.valid([
        [0.5, 0.5],
        [0.5, 0.5],
        [0.5, 0.5],
        [0.5, 0.5],
      ]),
    ).toBe(false);
    expect(() => new WaterProjection([[0, 0]] as Point[])).toThrow();
  });
});

describe("polygons", () => {
  const square: Point[] = rect_quad(0, 0, 1, 1);

  it("area, inside, bbox", () => {
    expect(Math.abs(polygon_area(square))).toBe(1);
    expect(point_in_polygon([0.5, 0.5], square)).toBe(true);
    expect(point_in_polygon([1.5, 0.5], square)).toBe(false);
    expect(bbox(quad)).toEqual([0.05, 0.15, 0.95, 0.75]);
  });

  it("simplifies a stroke", () => {
    const stroke: Point[] = [];
    for (let i = 0; i <= 100; i++) stroke.push([i / 100, 0.0005 * Math.sin(i)]);
    const out = simplify(stroke, 0.004);
    expect(out).toEqual([stroke[0], stroke[100]]);
    const corner: Point[] = [
      [0, 0],
      [0.5, 0],
      [1, 0],
      [1, 0.5],
      [1, 1],
    ];
    expect(simplify(corner, 0.01)).toEqual([
      [0, 0],
      [1, 0],
      [1, 1],
    ]);
    expect(simplify([[0, 0]], 1)).toEqual([[0, 0]]);
    expect(
      simplify(
        [
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        0.1,
      ),
    ).toHaveLength(2);
  });

  it("formats CSS and SVG", () => {
    expect(clip_path([[0.1, 0.2]])).toBe("polygon(10.000% 20.000%)");
    expect(svg_points([[0.1, 0.25]])).toBe("100.0,250.0");
    expect(clamp01(2)).toBe(1);
    expect(clamp01(NaN)).toBe(0);
  });
});
