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
  AnimalSpecies,
  Catalog,
  Clip,
  CoralSpecies,
  FishSpecies,
  InvertebrateSpecies,
  PaletteColour,
  PlantSpecies,
  SpeciesBase,
} from "./types";
import type { RGB } from "./light";
import { clamp01 } from "./geometry";

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
  species: Pick<SpeciesBase, "frame" | "columns">,
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
 * The recoloured atlas of a coral, not cached: the editor's preview asks
 * for one per colour tried, and keeps only the last.
 * @param species: the coral
 * @param chosen: the user's colours (species defaults where missing)
 */
export async function recolour_atlas(
  species: CoralSpecies,
  chosen: string[] | undefined,
): Promise<CoralAtlas> {
  const palette = coral_palette(species, chosen);
  const fluo = [0, 1, 2, 3].map((i) => Boolean(species.palette?.[i]?.fluo));
  const [shade_img, mask_img] = await Promise.all([
    load_image(species.atlas.shade),
    load_image(species.atlas.mask),
  ]);
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
}

/**
 * The recoloured atlas of a coral (cached per species and palette).
 */
export function coral_atlas(
  species: CoralSpecies,
  chosen: string[] | undefined,
): Promise<CoralAtlas> {
  const palette = coral_palette(species, chosen);
  const key = `${species.source}:${species.id}:${palette.map(rgb_hex).join("")}`;
  let promise = _corals.get(key);
  if (!promise) {
    promise = recolour_atlas(species, chosen);
    promise.catch(() => _corals.delete(key));
    _corals.set(key, promise);
  }
  return promise;
}

// ── Still species (plants, sessile invertebrates) ────────────────────────────

/**
 * A species the card can draw from a still picture and move itself: a plant,
 * an invertebrate.
 */
export type StillKind = PlantSpecies | InvertebrateSpecies;

/**
 * The atlas a still species is drawn from. Null for a species published
 * without a picture.
 */
export function still_image_url(species: StillKind): string | null {
  return species.atlas?.["1x"] ?? null;
}

/** The clip a still species' atlas is played with. */
export function still_clip(species: StillKind): Clip | null {
  const clips = species.clips ?? {};
  return clips.sway ?? clips.day ?? Object.values(clips)[0] ?? null;
}

/**
 * Frames of a still species' atlas. One frame is a still picture — what the
 * catalog publishes for a species with no filmed animation — and that is
 * what says the card has to make the motion itself.
 */
export function still_frames(species: StillKind): number {
  const clips = Object.values(species.clips ?? {});
  if (!clips.length) return 1;
  return Math.max(1, ...clips.map((clip) => clip.to + 1));
}

// ── Sway of a still species ──────────────────────────────────────────────────

/**
 * A plant anchored at its foot, or a sessile invertebrate settled on the
 * rock, bends with the current, and the card makes that motion itself from
 * the still picture of the species.
 *
 * The frames are not moments in time but **states of bend**, from upright
 * (frame 0) to fully bent (the last one). The flow then picks how many of
 * them to play, so the same sheet serves a quiet corner and a tank in full
 * wave: the window of frames is the amplitude, the speed it is read at is
 * the frequency. Played back and forth, it also matches what a plant really
 * does under a steady current — it leans, and flutters around that lean.
 *
 * One sheet is built per species and shared by every plant of it; what
 * keeps a bed from beating as one man is the phase and amplitude each plant
 * draws from the scene's own seeded numbers.
 */

/** Frames of a sway sheet: enough to read smoothly, cheap to hold. */
export const BEND_FRAMES = 8;
/** Tallest sheet built, pixels (a plant is never drawn much taller). */
export const BEND_HEIGHT = 320;
/** Rows the picture is cut into: the bend reads smooth at this. */
export const BEND_SLICES = 24;
/** Reach of the tip of the suppliest plant, as a share of its height. */
const BEND_REACH = 0.45;

/** How far the tip of a plant reaches when fully bent, pixels. */
export function bend_amplitude(flex: number, height: number): number {
  return Math.round(BEND_REACH * clamp01(flex) * height);
}

/**
 * How the bend spreads along the stem: a supple plant curves over its whole
 * length (an exponent near 1), a stiff one only near its tip.
 */
export function bend_exponent(flex: number): number {
  return 2.2 - clamp01(flex);
}

/**
 * Sideways shift of a row of the picture, pixels.
 * @param rise: height of the row above the foot, 0 (foot) .. 1 (tip)
 * @param deflection: 0 (upright) .. 1 (fully bent)
 */
export function bend_offset(
  rise: number,
  deflection: number,
  amplitude: number,
  exponent: number,
): number {
  return amplitude * deflection * Math.pow(clamp01(rise), exponent);
}

export interface StillAtlas {
  /** The frames, side by side, from upright to fully bent. */
  sheet: HTMLCanvasElement;
  /** One frame of the sheet, pixels. */
  frame: [number, number];
  frames: number;
  /** Where the foot of the plant stands across a frame, 0..1. */
  anchor_x: number;
}

/**
 * Build the sway sheet of a still species from its picture: the picture is
 * cut into rows and every row is shifted, the more the higher it stands.
 * @return null without a 2D canvas, or for a picture of no height
 */
export function build_still_sheet(
  img: CanvasImageSource & { width: number; height: number },
  flex: number,
): StillAtlas | null {
  if (!img.height || !img.width) return null;
  const height = Math.min(BEND_HEIGHT, img.height);
  const scale = height / img.height;
  const width = Math.max(1, Math.round(img.width * scale));
  const amplitude = bend_amplitude(flex, height);
  const exponent = bend_exponent(flex);
  const fw = width + amplitude;
  const canvas = document.createElement("canvas");
  canvas.width = fw * BEND_FRAMES;
  canvas.height = height;
  const ctx = canvas.getContext?.("2d") ?? null;
  if (!ctx) return null;
  const rows = Math.max(1, Math.min(BEND_SLICES, height));
  for (let f = 0; f < BEND_FRAMES; f++) {
    const deflection = f / (BEND_FRAMES - 1);
    const left = f * fw;
    for (let r = 0; r < rows; r++) {
      const y0 = Math.round((r * height) / rows);
      const y1 = Math.round(((r + 1) * height) / rows);
      // Rows are counted down the picture; the foot is at its bottom
      const rise = 1 - (y0 + y1) / 2 / height;
      const dx = bend_offset(rise, deflection, amplitude, exponent);
      // One pixel of overlap, or the rows would show their seams
      const over = r + 1 < rows ? 1 : 0;
      ctx.drawImage(
        img,
        0,
        y0 / scale,
        img.width,
        (y1 - y0 + over) / scale,
        left + dx,
        y0,
        width,
        y1 - y0 + over,
      );
    }
  }
  return {
    sheet: canvas,
    frame: [fw, height],
    frames: BEND_FRAMES,
    anchor_x: width / 2 / fw,
  };
}

/**
 * Whether the card makes the motion of a species itself: it takes a still
 * picture (a one frame atlas) that the current bends. A filmed plant or
 * shrimp plays its own frames, a moss or a clam does not move, and a
 * floating plant does not bend — it wanders along the surface instead. So
 * what the generator is for is read off the assets, off `flex` and off
 * `zone`, with no field to keep in step with them.
 */
export function still_sways(species: StillKind): boolean {
  return Boolean(
    still_image_url(species) &&
    still_frames(species) <= 1 &&
    (species.flex ?? 0) > 0 &&
    (species.kind !== "plant" || species.zone !== "floating"),
  );
}

/** Whether a plant rides the surface instead of standing on its foot. */
export function plant_floats(species: PlantSpecies): boolean {
  return species.zone === "floating";
}

const _stills = new Map<string, Promise<StillAtlas | null>>();

/**
 * The sway sheet of a still species (cached per species). Null for one that
 * does not move with the current (a moss, a clam, a species shipping its own
 * atlas): it is drawn from its picture as it is.
 */
export function still_atlas(species: StillKind): Promise<StillAtlas | null> {
  const url = still_image_url(species);
  const flex = species.flex ?? 0;
  if (!url || !still_sways(species)) return Promise.resolve(null);
  const key = `${species.kind}:${species.source}:${species.id}:${flex}`;
  let promise = _stills.get(key);
  if (!promise) {
    promise = load_image(url).then((img) => build_still_sheet(img, flex));
    promise.catch(() => _stills.delete(key));
    _stills.set(key, promise);
  }
  return promise;
}

/** Forget the sway sheets (tests). */
export function reset_still_atlases(): void {
  _stills.clear();
}

// ── Invertebrates ────────────────────────────────────────────────────────────

/**
 * An invertebrate as the simulation moves it: a crawling or swimming one
 * carries the same sprites and the same behaviour as a fish, so it is drawn
 * by the same code. Null for a sessile species — it is placed where it
 * settled, like a plant — and for one published without a picture.
 */
export function invertebrate_animal(
  species: InvertebrateSpecies,
): AnimalSpecies | null {
  const url = species.atlas?.["1x"];
  if (!url || !species.frame || species.movement === "sessile") return null;
  return {
    ...species,
    kind: "invertebrate",
    atlas: { ...species.atlas, "1x": url },
    frame: species.frame,
    columns: species.columns ?? 1,
    clips: species.clips ?? {},
  };
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

// ── Default fish for a species without picture ───────────────────────────────

/** Id of the default picture of a fish without one, in the catalog. */
export const UNKNOWN_FISH_ID = "unknown_fish";

/** The default "?" fish of the catalog; null in a catalog without it. */
export function unknown_fish(
  catalog: Catalog | null | undefined,
): FishSpecies | null {
  return (
    catalog?.defaults?.find(
      (d) => d.id === UNKNOWN_FISH_ID && d.atlas?.["1x"],
    ) ?? null
  );
}

/**
 * The fish as it is drawn: itself when it has a picture, else with the
 * sprite of the default fish (it keeps its own size and behaviour). Null
 * when it has no picture and the catalog has no default one.
 */
export function drawn_fish(
  species: FishSpecies,
  catalog: Catalog | null | undefined,
): FishSpecies | null {
  if (species.atlas?.["1x"]) return species;
  const unknown = unknown_fish(catalog);
  if (!unknown) return null;
  return {
    ...species,
    frame: unknown.frame,
    columns: unknown.columns,
    clips: unknown.clips,
    atlas: unknown.atlas,
    thumbnail: species.thumbnail ?? unknown.thumbnail,
    facing: unknown.facing,
    length_frac: unknown.length_frac,
    placeholder: true,
  };
}

/** Forget the generic fish (tests). */
export function reset_generic_fish(): void {
  _generic = undefined;
}
