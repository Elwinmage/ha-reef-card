/**
 * Canvas renderer of the living part of a view: fish, corals, decor
 * cut-outs and food, depth sorted.
 *
 * Every frame draws one list sorted from the back (z = 1) to the front:
 * a fish at z = 0.7 is drawn before a decor at z = 0.5, hence hidden behind
 * it — occlusion needs no special case. A decor is the photo itself, cut out
 * along its polygon once and redrawn over what swims behind it.
 *
 * A second canvas, blended in `screen` above the light tint, draws the
 * fluorescent colours of the corals: they glow under actinic light.
 */

import type {
  AquariumDocument,
  Catalog,
  Coral,
  CoralSpecies,
  FishSpecies,
  Point,
  View,
  Water,
} from "./types";
import type { WaterLight } from "./light";
import {
  WaterProjection,
  bbox,
  clamp01,
  rough_outline,
  sand_surface,
} from "./geometry";
import {
  FishSim,
  type Fish,
  type FishGroup,
  type Hideout,
  type SimEnv,
} from "./sim";
import {
  coral_atlas,
  frame_rect,
  generic_fish,
  load_image,
  loop_frame,
  once_frame,
  type CoralAtlas,
} from "./sprites";

const DEFAULT_DIMENSIONS = { length: 100, width: 50, height: 50 };
const FRAME_STEP = 1 / 30;
/** Share of the haze colour mixed into a fish at the back of the tank. */
const HAZE = 0.25;
/** Colour of the water depth (the light tint is laid over it by the card). */
const HAZE_RGB = "rgb(120,150,170)";
/** Angle of a fish coming out of its burrow, radians from level: head up. */
const BURROW_TILT = 1.15;

/** Rendering state of a coral (opening and closing with the light). */
export interface CoralState {
  phase: "day" | "closing" | "night" | "opening";
  /** Progress of a transition, 0..1. */
  progress: number;
  /** Frames elapsed in the looping clip. */
  frames: number;
}

/**
 * Advance a coral's state.
 * @param state: the state, updated in place
 * @param species: its descriptor (clips)
 * @param nightness: 0 day .. 1 night
 * @param flow: pumps' flow 0..1 (sways faster)
 * @param dt: seconds
 * @return the atlas frame to draw
 */
export function step_coral(
  state: CoralState,
  species: CoralSpecies,
  nightness: number,
  flow: number,
  dt: number,
): number {
  const clips = species.clips ?? {};
  const close = clips.close;
  const night = nightness > 0.5;
  const duration = close
    ? (close.to - close.from + 1) / Math.max(1, close.fps)
    : 1;
  if (night && (state.phase === "day" || state.phase === "opening")) {
    // An opening interrupted closes back from where it was
    state.progress = state.phase === "opening" ? 1 - state.progress : 0;
    state.phase = "closing";
  } else if (!night && (state.phase === "night" || state.phase === "closing")) {
    state.progress = state.phase === "closing" ? 1 - state.progress : 0;
    state.phase = "opening";
  }
  if (state.phase === "closing" || state.phase === "opening") {
    state.progress += dt / duration;
    if (state.progress >= 1) {
      state.phase = state.phase === "closing" ? "night" : "day";
      state.progress = 0;
    }
  }
  const day_clip = clips.day ?? clips.swim;
  switch (state.phase) {
    case "closing":
      return close
        ? once_frame(close, state.progress)
        : day_clip
          ? day_clip.from
          : 0;
    case "opening":
      return close
        ? once_frame(close, 1 - state.progress)
        : day_clip
          ? day_clip.from
          : 0;
    case "night": {
      const c = clips.night ?? close;
      state.frames += dt * (c?.fps ?? 6);
      return c ? (clips.night ? loop_frame(c, state.frames) : c.to) : 0;
    }
    default: {
      state.frames += dt * (day_clip?.fps ?? 12) * (0.6 + 0.8 * flow);
      return day_clip ? loop_frame(day_clip, state.frames) : 0;
    }
  }
}

/**
 * Atlas frame of a fish right now.
 * @return the frame, the clip playing, and whether the turn is drawn by the
 * clip itself
 */
export function fish_frame(
  f: Fish,
  slow: boolean,
): { frame: number; turn_clip: boolean; clip: string } {
  const clips = f.species.clips ?? {};
  if (f.turn >= 0 && clips.turn)
    return {
      frame: once_frame(clips.turn, f.turn),
      turn_clip: true,
      clip: "turn",
    };
  if (slow && clips.idle)
    return {
      frame: loop_frame(clips.idle, f.phase),
      turn_clip: false,
      clip: "idle",
    };
  const name = clips.swim ? "swim" : (Object.keys(clips)[0] ?? "swim");
  const swim = clips[name];
  return {
    frame: swim ? loop_frame(swim, f.phase) : 0,
    turn_clip: false,
    clip: name,
  };
}

/**
 * Horizontal scale of a fish sprite: mirrored when it faces away from its
 * drawing, squashed while turning.
 */
export function fish_scale_x(f: Fish, turn_clip: boolean): number {
  const drawn_right = (f.species.facing ?? "right") === "right";
  if (f.turn >= 0 && turn_clip) {
    // The turn clip goes from the drawn way to the other one: shown as is
    // when the fish turns away from its drawing, mirrored otherwise.
    return drawn_right ? -f.facing : f.facing;
  }
  let facing = f.facing;
  if (f.turn >= 0 && f.turn < 0.5) facing = -facing; // still the old way
  let sx = drawn_right ? facing : -facing;
  if (f.turn >= 0) sx *= Math.max(0.08, Math.abs(Math.cos(Math.PI * f.turn)));
  return sx;
}

/** Seconds of the cross-fade between two clips of a fish. */
export const CLIP_FADE_S = 0.15;

/** One sprite to draw for a fish. */
export interface FishLayer {
  frame: number;
  sx: number;
  /** Multiplier of the pitch: its sign is the way the fish looks on screen. */
  tilt: number;
  alpha: number;
}

/**
 * Pitch multiplier of a fish sprite: the nose goes up whichever way the
 * fish looks on screen. A turn clip starts looking one way and ends looking
 * the other, while drawn with one scale all along: the multiplier goes
 * smoothly from one sign to the other, so that the tilt does not flip when
 * the clip ends.
 */
export function fish_tilt(f: Fish, sx: number, turn_clip: boolean): number {
  const sign = Math.sign(sx) || 1;
  if (turn_clip && f.turn >= 0) return sign * Math.cos(Math.PI * f.turn);
  return sign;
}

/**
 * Sprites to draw for a fish, in drawing order: the current frame, and while
 * a clip change fades, the last frame of the previous clip over it.
 *
 * Clips are generated separately (swim, idle, turn), so their poses do not
 * match exactly where they meet: a short cross-fade hides the jump.
 * @param dt: seconds since the last drawing
 */
export function fish_layers(
  f: Fish,
  frame: number,
  sx: number,
  clip: string,
  dt: number,
  tilt: number = Math.sign(sx) || 1,
): FishLayer[] {
  const anim = f.anim;
  if (!anim) {
    f.anim = { clip, frame, sx, tilt };
    return [{ frame, sx, tilt, alpha: 1 }];
  }
  if (anim.clip !== clip) {
    anim.from = { frame: anim.frame, sx: anim.sx, tilt: anim.tilt, t: 0 };
  } else if (anim.from) {
    anim.from.t += dt / CLIP_FADE_S;
    if (anim.from.t >= 1) anim.from = undefined;
  }
  anim.clip = clip;
  anim.frame = frame;
  anim.sx = sx;
  anim.tilt = tilt;
  if (!anim.from) return [{ frame, sx, tilt, alpha: 1 }];
  const w = Math.max(0, Math.min(1, anim.from.t));
  // The new frame fully opaque, the previous one fading out over it: the
  // fish never gets see-through during the change
  return [
    { frame, sx, tilt, alpha: 1 },
    {
      frame: anim.from.frame,
      sx: anim.from.sx,
      tilt: anim.from.tilt,
      alpha: 1 - w,
    },
  ];
}

/** Things that can hide a fish, in tank space (from the decor polygons). */
export function hideouts(
  view: View,
  projection: WaterProjection,
  size: SimEnv["size"],
): Hideout[] {
  const out: Hideout[] = [];
  for (const decor of view.decor ?? []) {
    const [x0, y0, x1, y1] = bbox(decor.poly);
    const [u0, v0] = projection.to_water(x0, y0);
    const [u1, v1] = projection.to_water(x1, y1);
    const u = clamp01((u0 + u1) / 2);
    const v = clamp01(Math.min(v0, v1) + Math.abs(v1 - v0) * 0.4);
    out.push({
      x: u * size.length,
      y: v * size.height,
      d: clamp01(decor.z) * size.width,
      radius: (Math.abs(u1 - u0) * size.length) / 2,
    });
  }
  return out;
}

/**
 * Fish groups of a water: its inventory lines, with their sprites.
 * @param size: the tank, to place the homes (cm)
 */
export function fish_groups(
  water: Water,
  catalog: Catalog | null,
  size: SimEnv["size"] = DEFAULT_DIMENSIONS,
): FishGroup[] {
  const groups: FishGroup[] = [];
  for (const line of water.livestock ?? []) {
    if (line.kind !== "fish" || line.count <= 0) continue;
    // A species missing from the catalog swims as a generic fish (once the
    // catalog is known, so that nothing flashes while it loads)
    if (!catalog) continue;
    const species =
      catalog.fish.find((s) => s.id === line.species && s.atlas?.["1x"]) ??
      generic_fish();
    if (!species?.atlas?.["1x"]) continue;
    const length = line.size_cm ?? species.size_cm ?? [5, 8];
    const home = line.home;
    groups.push({
      species,
      line_id: line.id,
      count: line.count,
      size_cm: [length[0], length[1]],
      home:
        home && home.length === 3
          ? [
              clamp01(home[0]) * size.length,
              clamp01(home[1]) * size.height,
              clamp01(home[2]) * size.width,
            ]
          : null,
    });
  }
  return groups;
}

/** Tank size in cm, defaulted. */
export function tank_size(doc: AquariumDocument): SimEnv["size"] {
  const d = doc.dimensions_cm ?? DEFAULT_DIMENSIONS;
  return {
    length: d.length || 100,
    height: d.height || 50,
    width: d.width || 50,
  };
}

interface DrawItem {
  z: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

interface RegionScene {
  water_id: string;
  water: Water;
  projection: WaterProjection;
  sim: FishSim;
  corals: {
    coral: Coral;
    species: CoralSpecies;
    atlas: CoralAtlas | null;
    state: CoralState;
    frame: number;
  }[];
  light: WaterLight | null;
}

interface Cutout {
  z: number;
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
}

export interface SceneSetup {
  doc: AquariumDocument;
  view_id: string;
  catalog: Catalog | null;
  /** What the decor cut-outs are taken from: the photo... */
  background: HTMLImageElement | HTMLCanvasElement | null;
  /** ...with the regions drawn instead of photographed over it. */
  overlay?: HTMLCanvasElement | null;
  seed: string;
}

/** Whether a picture or a canvas can be drawn. */
function drawable(
  img: HTMLImageElement | HTMLCanvasElement | null | undefined,
): img is HTMLImageElement | HTMLCanvasElement {
  if (!img) return false;
  return "naturalWidth" in img ? img.naturalWidth > 0 : img.width > 0;
}

/**
 * Renderer of one view. Create it with the two canvases, configure() it,
 * start() it; it pauses itself with stop().
 */
export class AquariumScene {
  private _canvas: HTMLCanvasElement;
  private _glow: HTMLCanvasElement | null;
  private _regions: RegionScene[] = [];
  private _cutouts: Cutout[] = [];
  private _setup: SceneSetup | null = null;
  private _raf = 0;
  private _last = 0;
  private _acc = 0;
  /** Scratch canvas tinting fish frames with the depth haze. */
  private _scratch: HTMLCanvasElement | null = null;
  /** Seconds of the last simulation step (cross-fades of the fish clips). */
  private _dt = 0;
  private _running = false;
  private _ratio = 1;
  /** Fish images by URL, once loaded. */
  private _atlases = new Map<string, HTMLImageElement>();

  constructor(canvas: HTMLCanvasElement, glow: HTMLCanvasElement | null) {
    this._canvas = canvas;
    this._glow = glow;
  }

  get regions(): readonly RegionScene[] {
    return this._regions;
  }

  /** (Re)build the scene of a view. */
  configure(setup: SceneSetup): void {
    this._setup = setup;
    const { doc, view_id, catalog } = setup;
    const view = doc.views[view_id];
    this._regions = [];
    if (!view) return;
    const size = tank_size(doc);
    for (const region of view.regions ?? []) {
      const water = doc.waters[region.water];
      if (!water || !WaterProjection.valid(region.quad)) continue;
      const projection = new WaterProjection(region.quad);
      const env: SimEnv = {
        size,
        sand: sand_surface(
          projection,
          region.sand,
          region.sand_back,
          water.sand_band ?? 0.12,
        ),
        hideouts: hideouts(view, projection, size),
      };
      const sim = new FishSim(
        env,
        fish_groups(water, catalog, size),
        doc.render?.max_fish ?? 30,
        `${setup.seed}:${region.water}`,
      );
      const corals = (water.corals ?? [])
        .filter((c) => (c.view ?? view_id) === view_id)
        .map((coral) => ({
          coral,
          species: catalog?.corals.find(
            (s) => s.id === coral.species,
          ) as CoralSpecies,
          atlas: null as CoralAtlas | null,
          state: { phase: "day", progress: 0, frames: 0 } as CoralState,
          frame: 0,
        }))
        .filter((c) => c.species?.atlas?.shade);
      for (const c of corals) {
        coral_atlas(c.species, c.coral.palette).then(
          (atlas) => (c.atlas = atlas),
          () => undefined,
        );
      }
      for (const group of fish_groups(water, catalog)) {
        const url = group.species.atlas["1x"];
        load_image(url).then(
          (img) => this._atlases.set(url, img),
          () => undefined,
        );
      }
      this._regions.push({
        water_id: region.water,
        water,
        projection,
        sim,
        corals,
        light: null,
      });
    }
    this.resize();
  }

  /** Light of every water: night for the fish, glow of the corals. */
  set_light(lights: Record<string, WaterLight>, first: boolean = false): void {
    for (const r of this._regions) {
      r.light = lights[r.water_id] ?? null;
      const dark = Boolean(r.light?.dark);
      if (first) r.sim.force_night(dark);
      else r.sim.set_night(dark);
    }
  }

  /** Flow of the pumps of every water, 0..1. */
  set_flow(flows: Record<string, number>): void {
    for (const r of this._regions) r.sim.flow = flows[r.water_id] ?? 0;
  }

  /**
   * Drop food at the feeding points of the view (all of them, or the ones
   * bound to `source`); without any, at the top centre of every region.
   */
  feed(points: Point[], duration: number): void {
    const size = this._setup ? tank_size(this._setup.doc) : DEFAULT_DIMENSIONS;
    for (const r of this._regions) {
      const targets = points.length ? points : [];
      if (!targets.length) {
        r.sim.feed(size.length / 2, 0, size.width * 0.3, duration);
        continue;
      }
      for (const p of targets) {
        const [u, v] = r.projection.to_water(p[0], p[1]);
        if (u < -0.2 || u > 1.2 || v > 1.1) continue;
        r.sim.feed(
          clamp01(u) * size.length,
          Math.max(0, v) * size.height,
          size.width * 0.3,
          duration,
        );
      }
    }
  }

  /** Follow the canvas' displayed size; rebuild the decor cut-outs. */
  resize(): void {
    const rect = this._canvas.getBoundingClientRect?.();
    const dpr = Math.min(2, (globalThis as any).devicePixelRatio || 1);
    const w = Math.max(
      1,
      Math.round((rect?.width || this._canvas.clientWidth || 1) * dpr),
    );
    const h = Math.max(
      1,
      Math.round((rect?.height || this._canvas.clientHeight || 1) * dpr),
    );
    for (const c of [this._canvas, this._glow]) {
      if (c && (c.width !== w || c.height !== h)) {
        c.width = w;
        c.height = h;
      }
    }
    this._ratio = dpr;
    this._build_cutouts();
  }

  private _build_cutouts(): void {
    this._cutouts = [];
    const setup = this._setup;
    const img = setup?.background;
    const overlay = setup?.overlay;
    const view = setup?.doc.views[setup.view_id];
    const sources = [img, overlay].filter(drawable);
    if (!sources.length || !view) return;
    const W = this._canvas.width;
    const H = this._canvas.height;
    // Over a drawn decor, the stones have the rough edge they are drawn with
    const rough = drawable(overlay);
    for (const decor of view.decor ?? []) {
      const outline = rough ? rough_outline(decor.poly, decor.id) : decor.poly;
      const [x0, y0, x1, y1] = bbox(outline);
      const cx = Math.floor(x0 * W);
      const cy = Math.floor(y0 * H);
      const cw = Math.max(1, Math.ceil((x1 - x0) * W) + 1);
      const ch = Math.max(1, Math.ceil((y1 - y0) * H) + 1);
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.beginPath();
      outline.forEach(([x, y], i) => {
        const px = x * W - cx;
        const py = y * H - cy;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.clip();
      for (const source of sources) ctx.drawImage(source, -cx, -cy, W, H);
      this._cutouts.push({ z: decor.z, canvas, x: cx, y: cy });
    }
  }

  start(): void {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();
    const tick = (now: number) => {
      if (!this._running) return;
      this._acc += Math.min(0.25, (now - this._last) / 1000);
      this._last = now;
      if (this._acc >= FRAME_STEP) {
        const dt = this._acc;
        this._acc = 0;
        this.step(dt);
        this.draw();
      }
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  stop(): void {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
  }

  get running(): boolean {
    return this._running;
  }

  /** Advance every simulation. */
  step(dt: number): void {
    this._dt = dt;
    for (const r of this._regions) {
      r.sim.step(dt);
      for (const c of r.corals) {
        c.frame = step_coral(
          c.state,
          c.species,
          r.sim.nightness,
          r.sim.flow,
          dt,
        );
      }
    }
  }

  /** Pixels per centimetre at a water height and depth. */
  private _px_per_cm(r: RegionScene, v: number, z: number): number {
    const size = this._setup ? tank_size(this._setup.doc) : DEFAULT_DIMENSIONS;
    return (
      ((r.projection.width_at(v) * this._canvas.width) / size.length) *
      WaterProjection.depth_scale(z)
    );
  }

  /** Draw the current frame. */
  draw(): void {
    const ctx = this._canvas.getContext("2d");
    if (!ctx) return;
    const W = this._canvas.width;
    const H = this._canvas.height;
    ctx.clearRect(0, 0, W, H);
    const glow = this._glow?.getContext("2d") ?? null;
    glow?.clearRect(0, 0, W, H);
    const size = this._setup ? tank_size(this._setup.doc) : DEFAULT_DIMENSIONS;

    for (const r of this._regions) {
      const items: DrawItem[] = [];
      for (const cut of this._cutouts) {
        items.push({
          z: cut.z,
          draw: (c) => c.drawImage(cut.canvas, cut.x, cut.y),
        });
      }
      for (const f of r.sim.fish) {
        const img = this._atlases.get(f.species.atlas["1x"]);
        if (!img) continue;
        const z = f.d / size.width;
        items.push({ z, draw: (c) => this._draw_fish(c, r, f, img, z) });
      }
      for (const p of r.sim.particles) {
        if (p.age < 0) continue;
        const z = p.d / size.width;
        items.push({
          z,
          draw: (c) => {
            const [x, y] = r.projection.to_picture(
              p.x / size.length,
              p.y / size.height,
              z,
            );
            const rad = Math.max(
              1.2,
              0.25 * this._px_per_cm(r, p.y / size.height, z),
            );
            c.fillStyle = "rgba(205,160,95,0.9)";
            c.beginPath();
            c.arc(x * W, y * H, rad, 0, Math.PI * 2);
            c.fill();
          },
        });
      }
      for (const c of r.corals) {
        if (!c.atlas) continue;
        items.push({
          z: c.coral.z,
          draw: (ctx2) => this._draw_coral(ctx2, glow, r, c),
        });
      }
      items.sort((a, b) => b.z - a.z);

      ctx.save();
      ctx.beginPath();
      r.projection.quad.forEach(([x, y], i) =>
        i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H),
      );
      ctx.closePath();
      ctx.clip();
      for (const item of items) item.draw(ctx);
      ctx.restore();
    }
  }

  private _draw_fish(
    ctx: CanvasRenderingContext2D,
    r: RegionScene,
    f: Fish,
    img: HTMLImageElement,
    z: number,
  ): void {
    const W = this._canvas.width;
    const H = this._canvas.height;
    const size = tank_size(this._setup!.doc);
    const v = f.y / size.height;
    const [x, y] = r.projection.to_picture(f.x / size.length, v, z);
    // The frame holds the fish with some room (tail swing, turn)
    const width =
      (f.size * this._px_per_cm(r, v, z)) / (f.species.length_frac || 1);
    const [fw, fh] = f.species.frame;
    const height = (width * fh) / fw;
    const { frame, turn_clip, clip } = fish_frame(f, r.sim.idle(f));
    const scale_x = fish_scale_x(f, turn_clip);
    const layers = fish_layers(
      f,
      frame,
      scale_x,
      clip,
      this._dt,
      fish_tilt(f, scale_x, turn_clip),
    );
    const pitch = FishSim.pitch(f);
    const haze = z * HAZE;
    // In its burrow: head up out of the hole, the rest hidden by the sand
    const emerge = f.emerge ?? 1;
    if (emerge <= 0.001) return;
    const burrowed = emerge < 1;
    const nose = (f.species.facing ?? "right") === "right" ? 1 : -1;
    const body = width * (f.species.length_frac || 1);
    for (const layer of layers) {
      const [sx, sy, sw, sh] = frame_rect(f.species, layer.frame);
      // Depth haze tints the sprite: mixed as transparency, the decor and
      // the other fish would show through the body.
      const sprite =
        haze > 0.005 ? this._hazed(img, sx, sy, sw, sh, haze) : null;
      ctx.save();
      ctx.globalAlpha = f.alpha * layer.alpha;
      let left = -width / 2;
      if (burrowed) {
        // Only above the hole
        ctx.beginPath();
        ctx.rect(0, 0, W, y * H);
        ctx.clip();
        ctx.translate(x * W, y * H);
        ctx.rotate(-BURROW_TILT * Math.sign(layer.sx || 1) * nose);
        left = nose * (emerge * body - body / 2) - width / 2;
      } else {
        ctx.translate(x * W, y * H);
        ctx.rotate(pitch * layer.tilt);
      }
      ctx.scale(layer.sx, 1);
      if (sprite) {
        ctx.drawImage(sprite, 0, 0, sw, sh, left, -height / 2, width, height);
      } else {
        ctx.drawImage(img, sx, sy, sw, sh, left, -height / 2, width, height);
      }
      ctx.restore();
    }
  }

  /**
   * A frame tinted with the haze colour, on a scratch canvas (reused).
   * @return null when no 2D context is available
   */
  private _hazed(
    img: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    haze: number,
  ): HTMLCanvasElement | null {
    const canvas = (this._scratch ??= document.createElement("canvas"));
    if (canvas.width < sw) canvas.width = sw;
    if (canvas.height < sh) canvas.height = sh;
    const c = canvas.getContext("2d");
    if (!c) return null;
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    c.clearRect(0, 0, sw, sh);
    c.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    // Only over the fish's own pixels
    c.globalCompositeOperation = "source-atop";
    c.globalAlpha = haze;
    c.fillStyle = HAZE_RGB;
    c.fillRect(0, 0, sw, sh);
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    return canvas;
  }

  private _draw_coral(
    ctx: CanvasRenderingContext2D,
    glow: CanvasRenderingContext2D | null,
    r: RegionScene,
    c: RegionScene["corals"][number],
  ): void {
    const W = this._canvas.width;
    const H = this._canvas.height;
    const [px, py] = c.coral.pos;
    const [, v] = r.projection.to_water(px, py);
    const width =
      c.coral.size_cm *
      this._px_per_cm(r, clamp01(v), 0) *
      WaterProjection.depth_scale(c.coral.z);
    const [fw, fh] = c.species.frame;
    const height = (width * fh) / fw;
    const frame = c.frame;
    const [sx, sy, sw, sh] = frame_rect(c.species, frame);
    // pos is the foot of the coral
    const dx = px * W - width / 2;
    const dy = py * H - height;
    ctx.drawImage(c.atlas!.body, sx, sy, sw, sh, dx, dy, width, height);
    const strength = glow_strength(r.light);
    if (glow && c.atlas!.glow && strength > 0) {
      glow.save();
      glow.globalAlpha = strength;
      glow.drawImage(c.atlas!.glow, sx, sy, sw, sh, dx, dy, width, height);
      glow.restore();
    }
  }
}

/**
 * How much fluorescent colours glow: strong under blue light, a little
 * under the moon, none under white light.
 */
export function glow_strength(light: WaterLight | null): number {
  if (!light || light.none) return 0;
  let best = 0;
  for (const lamp of light.lamps) {
    const [r, g, b] = lamp.rgb;
    const blueness = Math.max(
      0,
      Math.min(1, (b - Math.max(r, g) * 0.95) / 120),
    );
    const value = lamp.dark
      ? 0.25 * blueness
      : blueness * (0.3 + 0.5 * lamp.power);
    best = Math.max(best, value);
  }
  return Number(best.toFixed(3));
}

export type { FishSpecies };
