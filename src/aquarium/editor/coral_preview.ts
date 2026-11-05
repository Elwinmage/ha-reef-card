/**
 * Large picture of a coral in the colours being chosen, in the scene
 * editor: the small swatches alone do not tell which part of the coral a
 * colour paints.
 *
 * Three modes:
 * - day: open, in daylight;
 * - night: closed, under the moon, its fluorescent colours glowing;
 * - cycle: a day in CYCLE_S seconds, looped: waking (it opens), the day
 *   (it sways, the light turns actinic in the evening), falling asleep (it
 *   closes), the night. A clock tells the simulated hour. Its button
 *   pressed again pauses it, and again resumes it.
 */

import { LitElement, css, html } from "lit";
import { property, state } from "lit/decorators.js";
import type { CoralSpecies } from "../types";
import {
  frame_rect,
  loop_frame,
  once_frame,
  recolour_atlas,
  type CoralAtlas,
} from "../sprites";
import i18n from "../../translations/myi18n";

export type PreviewMode = "day" | "night" | "cycle";

/** Length of the accelerated day, seconds. */
export const CYCLE_S = 18;
/** Wait after a colour change before recolouring the atlas, ms. */
export const RECOLOUR_DELAY_MS = 120;

export type CyclePhase = "waking" | "day" | "falling" | "night";

/** What the preview shows at a moment of the accelerated day. */
export interface CycleState {
  phase: CyclePhase;
  /** Progress through the phase, 0..1. */
  progress: number;
  /** Seconds since the phase started. */
  elapsed: number;
  /** Simulated hour, 0..24. */
  hour: number;
  /** Brightness of the coral, 0..1. */
  light: number;
  /** Strength of the fluorescent glow, 0..1. */
  glow: number;
  /** Blue of the water (dawn, actinic evening, night), 0..1. */
  blue: number;
}

/** Phases: duration (s), hours, and light/glow/blue at their start and end. */
const PHASES: {
  phase: CyclePhase;
  seconds: number;
  hours: [number, number];
  light: [number, number];
  glow: [number, number];
  blue: [number, number];
}[] = [
  {
    phase: "waking",
    seconds: 3,
    hours: [7, 9],
    light: [0.3, 1],
    glow: [0.5, 0.2],
    blue: [0.6, 0.1],
  },
  {
    phase: "day",
    seconds: 7,
    hours: [9, 20],
    light: [1, 1],
    glow: [0.2, 0.8],
    blue: [0.1, 0.4],
  },
  {
    phase: "falling",
    seconds: 3,
    hours: [20, 22],
    light: [1, 0.3],
    glow: [0.8, 0.5],
    blue: [0.4, 0.6],
  },
  {
    phase: "night",
    seconds: 5,
    hours: [22, 31],
    light: [0.3, 0.3],
    glow: [0.5, 0.5],
    blue: [0.6, 0.6],
  },
];

const lerp = ([a, b]: [number, number], t: number) => a + (b - a) * t;

/**
 * State of the accelerated day at `t` seconds (any real number: it loops).
 */
export function cycle_at(t: number): CycleState {
  let rest = ((t % CYCLE_S) + CYCLE_S) % CYCLE_S;
  let index = 0;
  while (index < PHASES.length - 1 && rest >= PHASES[index].seconds) {
    rest -= PHASES[index].seconds;
    index += 1;
  }
  const p = PHASES[index];
  const progress = Math.min(1, rest / p.seconds);
  return {
    phase: p.phase,
    progress,
    elapsed: rest,
    hour: lerp(p.hours, progress) % 24,
    light: lerp(p.light, progress),
    glow: lerp(p.glow, progress),
    blue: lerp(p.blue, progress),
  };
}

/** Still states of the day and night modes. */
const STILL: Record<"day" | "night", CycleState> = {
  day: {
    phase: "day",
    progress: 0,
    elapsed: 0,
    hour: 12,
    light: 1,
    glow: 0.2,
    blue: 0.1,
  },
  night: {
    phase: "night",
    progress: 0,
    elapsed: 0,
    hour: 0,
    light: 0.3,
    glow: 0.5,
    blue: 0.6,
  },
};

/** Atlas frame of a coral in a state of the day. */
export function cycle_frame(species: CoralSpecies, s: CycleState): number {
  const clips = species.clips ?? {};
  const day = clips.day ?? Object.values(clips)[0];
  const close = clips.close;
  const first = day?.from ?? 0;
  switch (s.phase) {
    case "waking":
      return close ? once_frame(close, 1 - s.progress) : first;
    case "falling":
      return close ? once_frame(close, s.progress) : first;
    case "night":
      return close ? close.to : first;
    default:
      return day && s.elapsed > 0
        ? loop_frame(day, s.elapsed * day.fps)
        : first;
  }
}

/** "07:30" */
export function clock(hour: number): string {
  const minutes = Math.floor(hour * 60) % (24 * 60);
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Water colour: daylight blue to night blue. */
function water(blue: number, light: number): [string, string] {
  const mix = (a: number[], b: number[], t: number) =>
    `rgb(${a.map((v, i) => Math.round((v + (b[i] - v) * t) * light)).join(",")})`;
  return [
    mix([40, 110, 160], [25, 45, 140], blue),
    mix([12, 35, 60], [8, 12, 50], blue),
  ];
}

export class ReefCoralPreview extends LitElement {
  /** The coral species (its atlases and default palette). */
  @property({ attribute: false }) species: CoralSpecies | null = null;
  /** The chosen colours, #rrggbb (species defaults where missing). */
  @property({ attribute: false }) palette: string[] = [];
  /** What is shown. */
  @state() mode: PreviewMode = "day";
  /** The cycle stopped on its current hour. */
  @state() paused = false;

  /** Recoloured atlas of the current palette (null while loading). */
  private _atlas: CoralAtlas | null = null;
  /** Last recolouring asked: an older one finishing late is dropped. */
  private _request = 0;
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _raf: number | null = null;
  /** Time origin of the cycle, ms. */
  private _start = 0;
  /** Seconds of cycle played when it was paused. */
  private _paused_at = 0;
  /** Scratch canvas: a frame darkened before it is drawn. */
  private _scratch: HTMLCanvasElement | null = null;

  static styles = css`
    :host {
      display: block;
      position: relative;
    }
    canvas {
      display: block;
      width: 100%;
      max-height: 280px;
      object-fit: contain;
      border-radius: 6px;
      background: #0a1a2e;
    }
    .modes {
      display: flex;
      gap: 4px;
      margin-bottom: 4px;
    }
    .modes button {
      flex: 1;
      padding: 3px 6px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      background: var(--card-background-color, white);
      color: var(--primary-text-color, #222);
      cursor: pointer;
      font-size: 0.85em;
    }
    .modes button.on {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
      color: white;
    }
  `;

  render() {
    const modes: [PreviewMode, string][] = [
      ["day", `☀ ${i18n._("aq_preview_day")}`],
      ["night", `☾ ${i18n._("aq_preview_night")}`],
      [
        "cycle",
        `${this.mode === "cycle" && !this.paused ? "⏸" : "▶"} ${i18n._("aq_preview_cycle")}`,
      ],
    ];
    return html`<div class="modes">
        ${modes.map(
          ([mode, label]) =>
            html`<button
              class="${this.mode === mode ? "on" : ""}"
              data-mode="${mode}"
              @click=${() => this._set_mode(mode)}
            >
              ${label}
            </button>`,
        )}
      </div>
      <canvas></canvas>`;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stop();
    if (this._timer !== null) clearTimeout(this._timer);
    this._timer = null;
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("species") || changed.has("palette")) {
      // The first picture without waiting, later colours after a short
      // pause: a slider being dragged sends many
      if (this._timer !== null) clearTimeout(this._timer);
      this._timer = null;
      if (this._atlas === null || changed.has("species")) void this.recolour();
      else
        this._timer = setTimeout(() => {
          this._timer = null;
          void this.recolour();
        }, RECOLOUR_DELAY_MS);
    }
    if (changed.has("mode")) {
      this._stop();
      if (this.mode === "cycle") {
        this._start = performance.now();
        this._tick();
      } else this.paint();
    }
  }

  private _set_mode(mode: PreviewMode): void {
    if (mode === "cycle" && this.mode === "cycle") {
      // Pressed again: pause on the current hour, or resume from it
      if (this.paused) {
        this._start = performance.now() - this._paused_at * 1000;
        this.paused = false;
        this._tick();
      } else {
        this._paused_at = this._cycle_s();
        this.paused = true;
        this._stop();
        this.paint();
      }
      return;
    }
    this.mode = mode;
    this.paused = false;
  }

  /** Seconds of cycle played. */
  private _cycle_s(): number {
    return this.paused
      ? this._paused_at
      : (performance.now() - this._start) / 1000;
  }

  /** Recolour the atlas in the current palette, then draw. */
  async recolour(): Promise<void> {
    if (!this.species) return;
    const request = ++this._request;
    let atlas: CoralAtlas;
    try {
      atlas = await recolour_atlas(this.species, this.palette);
    } catch {
      return; // atlas not reachable: the canvas keeps its background
    }
    if (request !== this._request) return;
    this._atlas = atlas;
    this.paint();
  }

  /** Next frame of the cycle, while it is shown. */
  private _tick(): void {
    this.paint();
    this._raf = requestAnimationFrame(() => this._tick());
  }

  private _stop(): void {
    if (this._raf !== null) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  /** State shown now. */
  current(): CycleState {
    return this.mode === "cycle" ? cycle_at(this._cycle_s()) : STILL[this.mode];
  }

  /** Draw the coral in the current state. */
  paint(): void {
    const canvas = this.renderRoot.querySelector("canvas");
    if (!this.species || !this._atlas || !canvas) return;
    const s = this.current();
    const [sx, sy, sw, sh] = frame_rect(
      this.species,
      cycle_frame(this.species, s),
    );
    if (canvas.width !== sw) canvas.width = sw;
    if (canvas.height !== sh) canvas.height = sh;
    const ctx = canvas.getContext("2d");
    const scratch = (this._scratch ??= document.createElement("canvas"));
    scratch.width = sw;
    scratch.height = sh;
    const sc = scratch.getContext("2d");
    if (!ctx || !sc) return;

    // Water
    const [top, bottom] = water(s.blue, 0.4 + 0.6 * s.light);
    const gradient = ctx.createLinearGradient(0, 0, 0, sh);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, sw, sh);

    // Coral, darkened and tinted by the light (on its own pixels only)
    sc.globalCompositeOperation = "source-over";
    sc.clearRect(0, 0, sw, sh);
    sc.drawImage(this._atlas.body, sx, sy, sw, sh, 0, 0, sw, sh);
    sc.globalCompositeOperation = "source-atop";
    sc.fillStyle = `rgba(4,10,40,${(1 - s.light) * (0.6 + 0.4 * s.blue)})`;
    sc.fillRect(0, 0, sw, sh);
    ctx.drawImage(scratch, 0, 0);

    // Fluorescent colours glowing
    if (this._atlas.glow) {
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = s.glow;
      ctx.drawImage(this._atlas.glow, sx, sy, sw, sh, 0, 0, sw, sh);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }

    // Clock of the accelerated day
    if (this.mode === "cycle") {
      const size = Math.max(10, Math.round(sh / 11));
      ctx.font = `${size}px sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText(
        `${s.phase === "night" || s.phase === "falling" ? "☾" : "☀"} ${clock(s.hour)}`,
        sw - size / 2,
        size / 2,
      );
    }
  }
}
