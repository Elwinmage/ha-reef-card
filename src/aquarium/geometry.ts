/**
 * Geometry of the aquarium view.
 *
 * Three spaces are used:
 * - picture space: a point of the view's picture, normalised to 0..1;
 * - water space: (u, v, z) inside a water region, u left to right along the
 *   front glass, v from the surface (0) to the sand (1), z from the front
 *   glass (0) to the back wall (1);
 * - canvas space: pixels of the drawing canvas.
 *
 * A region is outlined by a quad (its front glass, TL TR BR BL), usually
 * not a rectangle since pictures are rarely shot square-on: a projective
 * transform (homography) maps the unit square onto it.
 */

import type { Point } from "./types";
import { Rng } from "./rng";

/** 3x3 matrix, row major. */
export type Matrix = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

/** How much the back wall shrinks compared to the front glass. */
export const DEPTH_SHRINK = 0.18;
/** Height (v) things converge to when they go back: around eye level. */
export const VANISH_V = 0.35;

/**
 * Solve a linear system by Gauss-Jordan elimination with partial pivoting.
 * @param a: the square matrix (rows), modified in place
 * @param b: the right-hand side, modified in place
 * @return the solution, or null for a singular system
 */
export function solve(a: number[][], b: number[]): number[] | null {
  const n = b.length;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-12) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    [b[col], b[pivot]] = [b[pivot], b[col]];
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const f = a[row][col] / a[col][col];
      if (f === 0) continue;
      for (let k = col; k < n; k++) a[row][k] -= f * a[col][k];
      b[row] -= f * b[col];
    }
  }
  return b.map((v, i) => v / a[i][i]);
}

/**
 * Homography mapping 4 source points onto 4 destination points.
 * @return the matrix, or null when the points are degenerate
 */
export function homography(src: Point[], dst: Point[]): Matrix | null {
  if (src.length !== 4 || dst.length !== 4) return null;
  const a: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [X, Y] = dst[i];
    a.push([x, y, 1, 0, 0, 0, -x * X, -y * X]);
    b.push(X);
    a.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]);
    b.push(Y);
  }
  const h = solve(a, b);
  if (!h || h.some((v) => !Number.isFinite(v))) return null;
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

/** Apply a homography to a point. */
export function apply(m: Matrix, x: number, y: number): Point {
  const w = m[6] * x + m[7] * y + m[8];
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];
}

export const UNIT_SQUARE: Point[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

/**
 * Mapping between a water region and the picture.
 */
export class WaterProjection {
  readonly quad: Point[];
  private readonly _to_picture: Matrix;
  private readonly _to_water: Matrix;

  /**
   * @param quad: the region's front glass, TL TR BR BL in picture space
   * @throws when the quad is degenerate
   */
  constructor(quad: Point[]) {
    const to_picture = homography(UNIT_SQUARE, quad);
    const to_water = homography(quad, UNIT_SQUARE);
    if (!to_picture || !to_water) throw new Error("degenerate quad");
    this.quad = quad;
    this._to_picture = to_picture;
    this._to_water = to_water;
  }

  /** Whether a quad can be used (4 corners, not degenerate). */
  static valid(quad: Point[] | undefined | null): boolean {
    if (!quad || quad.length !== 4) return false;
    return (
      Math.abs(polygon_area(quad)) > 1e-4 &&
      homography(UNIT_SQUARE, quad) !== null
    );
  }

  /** Shrink factor of things at depth z (1 at the front glass). */
  static depth_scale(z: number): number {
    return 1 - Math.max(0, Math.min(1, z)) * DEPTH_SHRINK;
  }

  /**
   * Picture point of a water point, depth included: things at the back
   * converge towards the centre and towards eye level.
   */
  to_picture(u: number, v: number, z: number = 0): Point {
    const k = WaterProjection.depth_scale(z);
    const pu = 0.5 + (u - 0.5) * k;
    const pv = VANISH_V + (v - VANISH_V) * k;
    return apply(this._to_picture, pu, pv);
  }

  /** Water point (u, v) of a picture point, on the front glass. */
  to_water(x: number, y: number): Point {
    return apply(this._to_water, x, y);
  }

  /** Water point (u, v) of a picture point, at depth z (inverse of to_picture). */
  to_water_at(x: number, y: number, z: number): Point {
    const [pu, pv] = apply(this._to_water, x, y);
    const k = WaterProjection.depth_scale(z);
    return [0.5 + (pu - 0.5) / k, VANISH_V + (pv - VANISH_V) / k];
  }

  /**
   * Width, in picture units, of the whole front glass at a given height:
   * used to turn centimetres into pixels.
   */
  width_at(v: number): number {
    const [x0, y0] = apply(this._to_picture, 0, v);
    const [x1, y1] = apply(this._to_picture, 1, v);
    return Math.hypot(x1 - x0, y1 - y0);
  }
}

/**
 * A line through points, rounded: a monotone cubic curve of y over x
 * (Fritsch–Carlson), so that bumps are smooth without overshooting the
 * points. Points are sorted left to right; fewer than 3 are kept as they
 * are.
 * @param steps: points added per segment
 */
export function smooth_line(points: Point[], steps: number = 8): Point[] {
  const sorted = points
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
    .sort((a, b) => a[0] - b[0]);
  const p = sorted.filter((q, i) => i === 0 || q[0] - sorted[i - 1][0] > 1e-6);
  if (p.length < 3) return sorted;
  const n = p.length;
  const h: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h.push(p[i + 1][0] - p[i][0]);
    slope.push((p[i + 1][1] - p[i][1]) / h[i]);
  }
  const m: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++)
    m.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  m.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const r = a * a + b * b;
    if (r > 9) {
      const t = 3 / Math.sqrt(r);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  const out: Point[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const y =
        (2 * t3 - 3 * t2 + 1) * p[i][1] +
        (t3 - 2 * t2 + t) * h[i] * m[i] +
        (-2 * t3 + 3 * t2) * p[i + 1][1] +
        (t3 - t2) * h[i] * m[i + 1];
      out.push([p[i][0] + t * h[i], y]);
    }
  }
  out.push(p[n - 1]);
  return out;
}

/**
 * Height of the sand along the front glass: (u, v) points from u = 0 to
 * u = 1, v from the surface (0) down (1).
 */
export type SandProfile = [number, number][];

/**
 * Height of the sand along the front glass, from the sand line of a region.
 * @param projection: the region
 * @param line: where the sand meets the glass (picture points, left to
 *   right, following its bumps), or none
 * @param sand_band: share of the height taken by the sand, without a line
 * @param z: depth of the line (0 front glass, 1 back wall)
 * @return at least two points, the first at u = 0, the last at u = 1
 */
export function sand_profile(
  projection: WaterProjection,
  line: Point[] | undefined | null,
  sand_band: number,
  z: number = 0,
): SandProfile {
  const fallback = clamp01(1 - (sand_band ?? 0.12) * 0.5);
  const flat: SandProfile = [
    [0, fallback],
    [1, fallback],
  ];
  // Sand has no corners: the line is rounded through its points
  const points = smooth_line(line ?? [])
    .map(([x, y]) => projection.to_water_at(x, y, z))
    .filter(([u, v]) => Number.isFinite(u) && Number.isFinite(v))
    .sort((a, b) => a[0] - b[0]);
  // Points too close along the glass are one
  const merged: SandProfile = [];
  for (const [u, v] of points) {
    const last = merged[merged.length - 1];
    if (last && u - last[0] < 1e-3) last[1] = (last[1] + v) / 2;
    else merged.push([u, v]);
  }
  if (merged.length < 2) {
    if (!merged.length) return flat;
    const v = clamp01(merged[0][1]);
    return [
      [0, v],
      [1, v],
    ];
  }
  // Beyond its ends: a straight line goes on, a bumpy one stays level
  const first = merged[0];
  const last = merged[merged.length - 1];
  const straight = merged.length === 2;
  const slope = (last[1] - first[1]) / (last[0] - first[0]);
  const outside = (u: number): number =>
    straight
      ? first[1] + slope * (u - first[0])
      : u < first[0]
        ? first[1]
        : last[1];
  const inside = merged
    .filter(([u]) => u > 0 && u < 1)
    .map(([u, v]): [number, number] => [u, clamp01(v)]);
  const at = (u: number): number =>
    u <= first[0] || u >= last[0] ? outside(u) : sand_at(merged, u);
  return [[0, clamp01(at(0))], ...inside, [1, clamp01(at(1))]];
}

/**
 * The sand surface: its height along the front glass and along the back
 * wall (the same as the front without a back line), straight in between.
 */
export interface SandSurface {
  front: SandProfile;
  back: SandProfile;
}

/**
 * Sand surface of a region, from its front and back lines.
 * @param front: where the sand meets the front glass (picture points)
 * @param back: where it meets the back wall, as seen on the picture
 */
export function sand_surface(
  projection: WaterProjection,
  front: Point[] | undefined | null,
  back: Point[] | undefined | null,
  sand_band: number,
): SandSurface {
  const near = sand_profile(projection, front, sand_band, 0);
  return {
    front: near,
    back:
      back && back.length >= 2
        ? sand_profile(projection, back, sand_band, 1)
        : near,
  };
}

/** Height (v) of the sand surface at (u, z). */
export function sand_v(surface: SandSurface, u: number, z: number): number {
  const t = Math.max(0, Math.min(1, z));
  const front = sand_at(surface.front, u);
  return front + (sand_at(surface.back, u) - front) * t;
}

/** Height (v) of a sand profile at a point along the glass. */
export function sand_at(profile: SandProfile, u: number): number {
  if (u <= profile[0][0]) return profile[0][1];
  for (let i = 1; i < profile.length; i++) {
    const [u1, v1] = profile[i];
    if (u <= u1) {
      const [u0, v0] = profile[i - 1];
      return v0 + ((v1 - v0) * (u - u0)) / (u1 - u0 || 1);
    }
  }
  return profile[profile.length - 1][1];
}

/** Waves of a rough outline: wavelength (picture units) and weight. */
const ROUGH_WAVES: [number, number][] = [
  [0.06, 0.55],
  [0.022, 0.3],
  [0.009, 0.15],
];

/**
 * An outline made rough, like the edge of a stone: every side cut into
 * short steps, each moved across the side by waves and a little grain. The
 * same polygon and seed always give the same outline.
 * @param amp: how far the edge wanders, picture units
 * @param step: length of the steps, picture units
 */
export function rough_outline(
  poly: Point[],
  seed: string,
  amp: number = 0.005,
  step: number = 0.005,
): Point[] {
  const rng = new Rng(`rough:${seed}`);
  const phases = ROUGH_WAVES.map(() => rng.range(0, Math.PI * 2));
  const out: Point[] = [];
  let travelled = 0;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[(i + 1) % poly.length];
    const dx = bx - ax;
    const dy = by - ay;
    const length = Math.hypot(dx, dy);
    if (length < 1e-9) continue;
    const nx = -dy / length;
    const ny = dx / length;
    const steps = Math.max(1, Math.ceil(length / step));
    for (let j = 0; j < steps; j++) {
      const t = j / steps;
      const s = travelled + t * length;
      let wave = 0;
      ROUGH_WAVES.forEach(([wavelength, weight], k) => {
        wave += weight * Math.sin((Math.PI * 2 * s) / wavelength + phases[k]);
      });
      const offset = amp * (wave + (rng.next() - 0.5) * 0.6);
      out.push([ax + t * dx + nx * offset, ay + t * dy + ny * offset]);
    }
    travelled += length;
  }
  return out.length >= 3 ? out : poly.slice();
}

/** Signed area of a polygon (shoelace). */
export function polygon_area(poly: Point[]): number {
  let area = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % poly.length];
    area += x0 * y1 - x1 * y0;
  }
  return area / 2;
}

/** Whether a point is inside a polygon (even-odd rule). */
export function point_in_polygon(p: Point, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (
      yi > p[1] !== yj > p[1] &&
      p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/** Bounding box of a polygon: [minx, miny, maxx, maxy]. */
export function bbox(poly: Point[]): [number, number, number, number] {
  let minx = Infinity;
  let miny = Infinity;
  let maxx = -Infinity;
  let maxy = -Infinity;
  for (const [x, y] of poly) {
    minx = Math.min(minx, x);
    miny = Math.min(miny, y);
    maxx = Math.max(maxx, x);
    maxy = Math.max(maxy, y);
  }
  return [minx, miny, maxx, maxy];
}

/** Distance from a point to a segment. */
function segment_distance(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t =
    len2 === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2),
        );
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/**
 * Simplify a polyline (Ramer–Douglas–Peucker): keeps the shape of a lasso
 * stroke with a handful of points.
 * @param points: the stroke
 * @param epsilon: the tolerance, in the units of the points
 */
export function simplify(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points.slice();
  let index = 0;
  let max = 0;
  const last = points.length - 1;
  for (let i = 1; i < last; i++) {
    const d = segment_distance(points[i], points[0], points[last]);
    if (d > max) {
      max = d;
      index = i;
    }
  }
  if (max <= epsilon) return [points[0], points[last]];
  const left = simplify(points.slice(0, index + 1), epsilon);
  const right = simplify(points.slice(index), epsilon);
  return [...left.slice(0, -1), ...right];
}

/** CSS clip-path of a polygon in picture space. */
export function clip_path(poly: Point[]): string {
  const pct = (v: number) => `${(v * 100).toFixed(3)}%`;
  return `polygon(${poly.map(([x, y]) => `${pct(x)} ${pct(y)}`).join(", ")})`;
}

/** SVG points attribute of a polygon in a 0..1000 viewBox. */
export function svg_points(poly: Point[]): string {
  return poly
    .map(([x, y]) => `${(x * 1000).toFixed(1)},${(y * 1000).toFixed(1)}`)
    .join(" ");
}

/** Clamp into 0..1. */
export function clamp01(v: number): number {
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
}

/** A rectangle quad (TL TR BR BL). */
export function rect_quad(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): Point[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}
