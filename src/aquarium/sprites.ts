/**
 * Sprites: frames out of the catalog atlases, and coral recolouring.
 *
 * A coral atlas comes as two pictures (see reeftank scripts/build_atlas.py):
 * - shade: brightness of every pixel, with alpha;
 * - mask:  R/G/B = weight of palette colours 1/2/3, colour 4 gets the rest.
 *
 * pixel = shade × (w1·c1 + w2·c2 + w3·c3 + (1 − w1 − w2 − w3)·c4)
 *
 * The recoloured atlas is computed once per (species, palette) and cached;
 * drawing a frame is then a plain blit.
 */

import type {
  Clip,
  CoralSpecies,
  FishSpecies,
  PaletteColour,
  SpeciesBase,
} from "./types";
import type { RGB } from "./light";

/** Source rectangle of a frame in an atlas: [sx, sy, w, h]. */
export type Rect = [number, number, number, number];

/**
 * Frame of a looping clip for an animation phase (in frames).
 * @param clip: the clip
 * @param phase: frames elapsed since the clip started (any real number)
 */
export function loop_frame(clip: Clip, phase: number): number {
  const len = Math.max(1, clip.to - clip.from + 1);
  // A ping-pong clip plays 0 .. len-1 .. 1, then again
  const period = clip.pingpong && len > 1 ? 2 * len - 2 : len;
  const n = ((Math.floor(phase) % period) + period) % period;
  return clip.from + (n < len ? n : period - n);
}

/**
 * Frame of a clip played once, at a progress.
 * @param progress: 0 (first frame) .. 1 (last frame)
 */
export function once_frame(clip: Clip, progress: number): number {
  const len = Math.max(1, clip.to - clip.from + 1);
  const p = Math.max(0, Math.min(1, progress));
  return clip.from + Math.min(len - 1, Math.floor(p * len));
}

/**
 * Where a frame lies in an atlas.
 * @param species: its descriptor (frame size, columns)
 * @param index: frame index
 * @param scale: 2 for a double resolution atlas
 */
export function frame_rect(
  species: SpeciesBase,
  index: number,
  scale: number = 1,
): Rect {
  const [w, h] = species.frame;
  const columns = Math.max(1, species.columns || 1);
  return [
    (index % columns) * w * scale,
    Math.floor(index / columns) * h * scale,
    w * scale,
    h * scale,
  ];
}

/** "#rrggbb" → [r, g, b]. */
export function hex_rgb(
  hex: string | undefined,
  fallback: RGB = [128, 128, 128],
): RGB {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex ?? "");
  if (!m) return fallback;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/** [r, g, b] → "#rrggbb". */
export function rgb_hex(rgb: RGB): string {
  return (
    "#" +
    rgb
      .map((c) =>
        Math.round(Math.max(0, Math.min(255, c)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/**
 * The four colours of a coral: the user's choice where given, else the
 * species' defaults.
 */
export function coral_palette(
  species: CoralSpecies,
  chosen: string[] | undefined,
): RGB[] {
  const defaults: PaletteColour[] = species.palette ?? [];
  const out: RGB[] = [];
  for (let i = 0; i < 4; i++) {
    out.push(hex_rgb(chosen?.[i] ?? defaults[i]?.default, [128, 128, 128]));
  }
  return out;
}

/**
 * Recolour a coral: compute RGBA pixels from shade and mask pixels.
 * @param shade: RGBA pixels of the shade atlas
 * @param mask: RGBA pixels of the mask atlas (same size)
 * @param palette: the 4 colours
 * @param only: when given, keep only the colours flagged true (fluorescent
 *              glow layer); the others are left transparent
 * @return RGBA pixels
 */
export function recolor_pixels(
  shade: Uint8ClampedArray,
  mask: Uint8ClampedArray,
  palette: RGB[],
  only?: boolean[],
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(shade.length);
  const [c1, c2, c3, c4] = palette;
  const keep = only ?? [true, true, true, true];
  for (let i = 0; i < shade.length; i += 4) {
    const a = shade[i + 3];
    if (a === 0) continue;
    const v = shade[i] / 255;
    const w1 = mask[i] / 255;
    const w2 = mask[i + 1] / 255;
    const w3 = mask[i + 2] / 255;
    const w4 = Math.max(0, 1 - w1 - w2 - w3);
    const ws = [w1 * +keep[0], w2 * +keep[1], w3 * +keep[2], w4 * +keep[3]];
    const kept = ws[0] + ws[1] + ws[2] + ws[3];
    if (kept <= 0) continue;
    for (let k = 0; k < 3; k++) {
      out[i + k] =
        (v * (ws[0] * c1[k] + ws[1] * c2[k] + ws[2] * c3[k] + ws[3] * c4[k])) /
        (only ? kept : 1);
    }
    out[i + 3] = only ? a * kept : a;
  }
  return out;
}

// ── Loading ──────────────────────────────────────────────────────────────────

const _images = new Map<string, Promise<HTMLImageElement>>();

/** Load a picture once (shared by every card on the page). */
export function load_image(url: string): Promise<HTMLImageElement> {
  let promise = _images.get(url);
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => {
        _images.delete(url);
        reject(new Error(`cannot load ${url}`));
      };
      img.src = url;
    });
    _images.set(url, promise);
  }
  return promise;
}

/** Pixels of a picture. */
function pixels_of(
  img: CanvasImageSource & { width: number; height: number },
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

export interface CoralAtlas {
  /** The recoloured atlas. */
  body: HTMLCanvasElement;
  /** Fluorescent colours only (null when the coral has none). */
  glow: HTMLCanvasElement | null;
}

const _corals = new Map<string, Promise<CoralAtlas>>();

/**
 * The recoloured atlas of a coral (cached per species and palette).
 */
export function coral_atlas(
  species: CoralSpecies,
  chosen: string[] | undefined,
): Promise<CoralAtlas> {
  const palette = coral_palette(species, chosen);
  const fluo = [0, 1, 2, 3].map((i) => Boolean(species.palette?.[i]?.fluo));
  const key = `${species.source}:${species.id}:${palette.map(rgb_hex).join("")}`;
  let promise = _corals.get(key);
  if (!promise) {
    promise = Promise.all([
      load_image(species.atlas.shade),
      load_image(species.atlas.mask),
    ]).then(([shade_img, mask_img]) => {
      const shade = pixels_of(shade_img);
      const mask = pixels_of(mask_img);
      const make = (data: Uint8ClampedArray): HTMLCanvasElement => {
        const canvas = document.createElement("canvas");
        canvas.width = shade.width;
        canvas.height = shade.height;
        const ctx = canvas.getContext("2d")!;
        const image = ctx.createImageData(shade.width, shade.height);
        image.data.set(data);
        ctx.putImageData(image, 0, 0);
        return canvas;
      };
      return {
        body: make(recolor_pixels(shade.data, mask.data, palette)),
        glow: fluo.some((f) => f)
          ? make(recolor_pixels(shade.data, mask.data, palette, fluo))
          : null,
      };
    });
    promise.catch(() => _corals.delete(key));
    _corals.set(key, promise);
  }
  return promise;
}

// ── Generic fish ─────────────────────────────────────────────────────────────

/** Id of the stand-in of species missing from the catalog. */
export const GENERIC_FISH_ID = "__generic__";
const GENERIC_FRAME: [number, number] = [128, 64];
const GENERIC_FRAMES = 8;
let _generic: FishSpecies | null | undefined;

/**
 * A plain grey-blue fish drawn at runtime, standing in for an inventory line
 * whose species is not in the catalog (a custom name, a species removed from
 * the catalog). Null without a 2D canvas.
 */
export function generic_fish(): FishSpecies | null {
  if (_generic !== undefined) return _generic;
  const [w, h] = GENERIC_FRAME;
  const canvas = document.createElement("canvas");
  canvas.width = w * GENERIC_FRAMES;
  canvas.height = h;
  const ctx = canvas.getContext?.("2d") ?? null;
  if (!ctx) return (_generic = null);
  for (let i = 0; i < GENERIC_FRAMES; i++) {
    const beat = Math.sin((2 * Math.PI * i) / GENERIC_FRAMES);
    ctx.save();
    ctx.translate(i * w + w / 2, h / 2);
    // Tail: swings with the beat
    ctx.fillStyle = "#6f8799";
    ctx.beginPath();
    ctx.moveTo(-34, 0);
    ctx.lineTo(-58, -16 + beat * 7);
    ctx.lineTo(-54, beat * 4);
    ctx.lineTo(-58, 16 + beat * 7);
    ctx.closePath();
    ctx.fill();
    // Body, lighter belly
    const body = ctx.createLinearGradient(0, -20, 0, 20);
    body.addColorStop(0, "#5f7a8f");
    body.addColorStop(1, "#c9d6df");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(4, 0, 42, 19, 0, 0, 2 * Math.PI);
    ctx.fill();
    // Dorsal fin and eye
    ctx.fillStyle = "#6f8799";
    ctx.beginPath();
    ctx.moveTo(-14, -16);
    ctx.quadraticCurveTo(2, -30, 18, -17);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1d2a33";
    ctx.beginPath();
    ctx.arc(30, -4, 3.2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
  _generic = {
    id: GENERIC_FISH_ID,
    kind: "fish",
    source: "generic",
    frame: GENERIC_FRAME,
    columns: GENERIC_FRAMES,
    clips: { swim: { from: 0, to: GENERIC_FRAMES - 1, fps: 12, loop: true } },
    atlas: { "1x": canvas.toDataURL("image/png") },
    facing: "right",
    length_frac: 0.9,
    behavior: { profile: "cruiser" },
    night: "hover",
    feeding_response: 0.6,
  };
  return _generic;
}

/** Forget the generic fish (tests). */
export function reset_generic_fish(): void {
  _generic = undefined;
}
