/**
 * Drawn decor: the water of a region drawn instead of its photo.
 *
 * A region marked `drawn` hides its part of the photo; the rest of the
 * picture (stand, cabinet, wall) stays. The outlines made on the photo
 * (water region, sand line, decor polygons) are enough to draw the tank: the water, the sand (its surface going back
 * to the back wall, and its section against the front glass), and the decor
 * filled with a rock texture, shaded by depth. The light tint of the card
 * is laid over it as over a photo, so the LEDs colour it the same way.
 *
 * Textures come from the catalog (`textures/<id>/`); without any, small
 * textures are generated here.
 */

import type {
  AquariumDocument,
  Catalog,
  Point,
  Region,
  Texture,
  View,
} from "./types";
import { WaterProjection, bbox, rough_outline, sand_surface } from "./geometry";
import { Rng } from "./rng";
import { load_image } from "./sprites";

export type TextureRole = "rock" | "sand";

/** A texture ready to draw: its picture and the tank length it covers. */
export interface TextureSource {
  image: HTMLImageElement | HTMLCanvasElement;
  scale_cm: number;
}

export type BackdropTextures = Partial<Record<TextureRole, TextureSource>>;

/** Tank length covered by the built-in textures, cm. */
const BUILTIN_SCALE_CM: Record<TextureRole, number> = { rock: 24, sand: 12 };
const BUILTIN_SIZE = 256;
const DEFAULT_SIZE = { length: 100, height: 50, width: 50 };

/** Colours of the drawn water, top and bottom (neutral: the LEDs tint it). */
export const WATER_TOP = "rgb(176,208,222)";
export const WATER_BOTTOM = "rgb(92,136,158)";

const _builtin = new Map<TextureRole, HTMLCanvasElement | null>();

/** Forget the built-in textures (tests). */
export function reset_builtin_textures(): void {
  _builtin.clear();
}

/**
 * Draw a blob on a tile, repeated across its edges so that the tile wraps.
 */
function wrapped(
  ctx: CanvasRenderingContext2D,
  size: number,
  x: number,
  y: number,
  r: number,
  paint: (cx: number, cy: number) => void,
): void {
  for (const dx of [-size, 0, size]) {
    for (const dy of [-size, 0, size]) {
      const cx = x + dx;
      const cy = y + dy;
      if (cx + r < 0 || cx - r > size || cy + r < 0 || cy - r > size) continue;
      paint(cx, cy);
    }
  }
}

/**
 * A built-in tileable texture, drawn once.
 * @return null without a 2D context
 */
export function builtin_texture(role: TextureRole): HTMLCanvasElement | null {
  if (_builtin.has(role)) return _builtin.get(role)!;
  const size = BUILTIN_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    _builtin.set(role, null);
    return null;
  }
  const rng = new Rng(`texture:${role}`);
  if (role === "rock") {
    // Porous aragonite: light and dark blotches, coralline patches, holes
    ctx.fillStyle = "rgb(152,138,118)";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 160; i++) {
      const r = rng.range(6, 26);
      const light = rng.range(-38, 34);
      const c = 150 + light;
      ctx.fillStyle = `rgba(${c},${c - 12},${c - 30},${rng.range(0.25, 0.6).toFixed(2)})`;
      wrapped(ctx, size, rng.range(0, size), rng.range(0, size), r, (x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    for (let i = 0; i < 26; i++) {
      const r = rng.range(5, 18);
      ctx.fillStyle = `rgba(196,${rng.int(96, 128)},${rng.int(140, 170)},${rng.range(0.3, 0.6).toFixed(2)})`;
      wrapped(ctx, size, rng.range(0, size), rng.range(0, size), r, (x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    for (let i = 0; i < 90; i++) {
      const r = rng.range(0.8, 2.6);
      ctx.fillStyle = `rgba(48,38,30,${rng.range(0.3, 0.6).toFixed(2)})`;
      wrapped(ctx, size, rng.range(0, size), rng.range(0, size), r, (x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  } else {
    // Aragonite sand: cream grains, a few darker ones
    ctx.fillStyle = "rgb(222,212,188)";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 5200; i++) {
      const c = rng.next() < 0.08 ? rng.int(120, 160) : rng.int(196, 248);
      const r = rng.range(0.6, 1.8);
      ctx.fillStyle = `rgba(${c},${c - 8},${c - 26},${rng.range(0.5, 0.95).toFixed(2)})`;
      wrapped(ctx, size, rng.range(0, size), rng.range(0, size), r, (x, y) =>
        ctx.fillRect(x - r, y - r, r * 2, r * 2),
      );
    }
  }
  _builtin.set(role, canvas);
  return canvas;
}

/** The catalog texture of a role a view asks for: by id, else the first. */
export function pick_texture(
  catalog: Catalog | null,
  role: TextureRole,
  id: string | null | undefined,
): Texture | null {
  const textures = (catalog?.textures ?? []).filter(
    (t) => t.role === role && t.image,
  );
  return textures.find((t) => t.id === id) ?? textures[0] ?? null;
}

/**
 * Whether a region is drawn instead of shown from the photo. A view of the
 * first version (`backdrop.mode: "drawn"`) draws all its regions.
 */
export function drawn_region(
  view: View | undefined | null,
  region: Region | undefined | null,
): boolean {
  return Boolean(region?.drawn || view?.backdrop?.mode === "drawn");
}

/** Whether a view draws any of its regions. */
export function drawn(view: View | undefined | null): boolean {
  return (view?.regions ?? []).some((r) => drawn_region(view, r));
}

/** Trace a closed polygon of picture points, in pixels. */
function trace(
  ctx: CanvasRenderingContext2D,
  poly: Point[],
  W: number,
  H: number,
): void {
  ctx.beginPath();
  poly.forEach(([x, y], i) =>
    i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H),
  );
  ctx.closePath();
}

/**
 * A fill repeating a texture at its real size.
 * @param px_per_cm: scale of the tank on the canvas
 */
function texture_fill(
  ctx: CanvasRenderingContext2D,
  source: TextureSource | undefined,
  role: TextureRole,
  px_per_cm: number,
): CanvasPattern | string {
  const image = source?.image ?? builtin_texture(role);
  const fallback = role === "rock" ? "rgb(140,126,108)" : "rgb(214,204,180)";
  if (!image) return fallback;
  const scale_cm = source?.scale_cm ?? BUILTIN_SCALE_CM[role];
  const pattern = ctx.createPattern(image, "repeat");
  if (!pattern) return fallback;
  const k = (scale_cm * px_per_cm) / Math.max(1, image.width);
  const Matrix = (globalThis as any).DOMMatrix;
  if (Matrix && pattern.setTransform)
    pattern.setTransform(new Matrix().scaleSelf(k, k));
  return pattern;
}

/**
 * Draw the drawn regions of a view on a canvas of W x H pixels; the rest
 * stays transparent (the photo shows through).
 * @param textures: the textures loaded (built-in ones for the others)
 */
export function draw_backdrop(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  doc: AquariumDocument,
  view: View,
  textures: BackdropTextures,
): void {
  const d = doc.dimensions_cm ?? DEFAULT_SIZE;
  const size = {
    length: d.length || 100,
    height: d.height || 50,
    width: d.width || 50,
  };
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  for (const region of view.regions ?? []) {
    if (!drawn_region(view, region) || !WaterProjection.valid(region.quad))
      continue;
    const water = doc.waters[region.water];
    const p = new WaterProjection(region.quad);
    const px_per_cm = (p.width_at(0.5) * W) / size.length;
    const sand = sand_surface(
      p,
      region.sand,
      region.sand_back,
      water?.sand_band ?? 0.12,
    );
    const mean_of = (profile: [number, number][]) =>
      profile.reduce((a, [, v]) => a + v, 0) / profile.length;
    const at = (u: number, v: number, z: number): Point =>
      p.to_picture(u, v, z);

    ctx.save();
    trace(ctx, region.quad, W, H);
    ctx.clip();

    // Water, lighter near the surface
    const [tx, ty] = at(0.5, 0, 0);
    const [bx, by] = at(0.5, 1, 0);
    const water_fill = ctx.createLinearGradient(tx * W, ty * H, bx * W, by * H);
    water_fill.addColorStop(0, WATER_TOP);
    water_fill.addColorStop(1, WATER_BOTTOM);
    ctx.fillStyle = water_fill;
    ctx.fillRect(0, 0, W, H);

    // Back wall: a little darker, for the depth
    trace(ctx, [at(0, 0, 1), at(1, 0, 1), at(1, 1, 1), at(0, 1, 1)], W, H);
    ctx.fillStyle = "rgba(20,52,72,0.22)";
    ctx.fill();

    // Sand surface, from the back wall to the front glass
    const sand_fill = texture_fill(ctx, textures.sand, "sand", px_per_cm);
    const back = sand.back.map(([u, v]) => at(u, v, 1));
    const front = sand.front.map(([u, v]) => at(u, v, 0));
    trace(ctx, [...back, ...[...front].reverse()], W, H);
    ctx.fillStyle = sand_fill;
    ctx.fill();
    const [, back_y] = at(0.5, mean_of(sand.back), 1);
    const [, front_y] = at(0.5, mean_of(sand.front), 0);
    const recede = ctx.createLinearGradient(0, back_y * H, 0, front_y * H);
    recede.addColorStop(0, "rgba(20,52,72,0.45)");
    recede.addColorStop(1, "rgba(20,52,72,0)");
    ctx.fillStyle = recede;
    ctx.fill();

    // Decor, from the back to the front
    const rock_fill = texture_fill(ctx, textures.rock, "rock", px_per_cm);
    const decor = [...(view.decor ?? [])].sort((a, b) => b.z - a.z);
    for (const item of decor) {
      const [, y0, , y1] = bbox(item.poly);
      // A stone has no straight edges
      trace(ctx, rough_outline(item.poly, item.id), W, H);
      ctx.fillStyle = rock_fill;
      ctx.fill();
      // Lit from above
      const shade = ctx.createLinearGradient(0, y0 * H, 0, y1 * H);
      shade.addColorStop(0, "rgba(255,248,235,0.14)");
      shade.addColorStop(1, "rgba(10,14,20,0.42)");
      ctx.fillStyle = shade;
      ctx.fill();
      // Hazier at the back
      ctx.fillStyle = `rgba(96,138,160,${(0.45 * Math.max(0, Math.min(1, item.z))).toFixed(3)})`;
      ctx.fill();
      ctx.lineWidth = Math.max(1, W / 600);
      ctx.strokeStyle = "rgba(12,16,20,0.35)";
      ctx.stroke();
    }

    // Section of the sand against the front glass
    trace(ctx, [...front, at(1, 1, 0), at(0, 1, 0)], W, H);
    ctx.fillStyle = sand_fill;
    ctx.fill();
    ctx.fillStyle = "rgba(70,50,30,0.22)";
    ctx.fill();
    ctx.beginPath();
    front.forEach(([x, y], i) =>
      i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H),
    );
    ctx.lineWidth = Math.max(1, W / 500);
    ctx.strokeStyle = "rgba(255,250,235,0.35)";
    ctx.stroke();
    ctx.restore();

    // The glass edges
    trace(ctx, region.quad, W, H);
    ctx.lineWidth = Math.max(1, W / 400);
    ctx.strokeStyle = "rgba(220,240,255,0.35)";
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The drawn decor of a view: loads its textures, and draws it on demand,
 * cached until the view, the size or a texture changes.
 */
export class Backdrop {
  private _doc: AquariumDocument | null = null;
  private _view: View | null = null;
  private _textures: BackdropTextures = {};
  private _wanted: Partial<Record<TextureRole, string>> = {};
  private _canvas: HTMLCanvasElement | null = null;
  private _key = "";
  private _version = 0;

  /** @param on_change: called when a texture finished loading */
  constructor(private readonly on_change: () => void = () => undefined) {}

  /** Follow a view (and the textures it asks for). */
  configure(doc: AquariumDocument, view: View, catalog: Catalog | null): void {
    this._doc = doc;
    this._view = view;
    for (const role of ["rock", "sand"] as TextureRole[]) {
      const texture = pick_texture(catalog, role, view.backdrop?.[role]);
      const url = texture?.image ?? "";
      if (this._wanted[role] === url) continue;
      this._wanted[role] = url;
      delete this._textures[role];
      this._version++;
      if (!texture) continue;
      load_image(url).then(
        (image) => {
          if (this._wanted[role] !== url) return;
          this._textures[role] = { image, scale_cm: texture.scale_cm || 30 };
          this._version++;
          this.on_change();
        },
        () => undefined,
      );
    }
  }

  get textures(): BackdropTextures {
    return this._textures;
  }

  /**
   * The decor drawn at a size.
   * @return null before configure(), or without a 2D context
   */
  render(W: number, H: number): HTMLCanvasElement | null {
    const doc = this._doc;
    const view = this._view;
    if (!doc || !view || W < 1 || H < 1) return null;
    const key = `${W}x${H}:${this._version}:${JSON.stringify([doc.dimensions_cm, doc.waters, view])}`;
    if (this._canvas && key === this._key) return this._canvas;
    const canvas = this._canvas ?? document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    draw_backdrop(ctx, W, H, doc, view, this._textures);
    this._canvas = canvas;
    this._key = key;
    return canvas;
  }

  /** Draw the decor onto a visible canvas, at its own size. */
  paint(target: HTMLCanvasElement): HTMLCanvasElement | null {
    const source = this.render(target.width, target.height);
    const ctx = target.getContext("2d");
    if (!source || !ctx) return null;
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(source, 0, 0);
    return source;
  }
}
