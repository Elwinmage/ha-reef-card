/**
 * ReefLED beam: the cone of light under the lamp.
 *
 * Its colour and opacity follow the light currently produced (white, blue
 * and moon channels). At 0 % intensity (or with the lamp off) there is no
 * beam, even with the moon lit, and the lens of the picture is greyed out.
 * Inside it: the current intensity, the name of today's program and a
 * chart of that program over the day, with a red marker at the current
 * time, written under the chart. In weather mode the time of the weather's
 * place follows in brackets: the moment of the place's day played now.
 *
 * Tapping the beam opens the program editor. While the lamp identifies
 * itself, the beam blinks.
 *
 * Example mapping:
 *   beam: { name: "beam", type: "rsled-beam", stateObj: null,
 *           css: {...full canvas...} }
 */
import { html, svg, TemplateResult } from "lit";

import { RSLedElement } from "./rsled_element";
import { RSLED_CANVAS } from "./rsled_sky";
import { style_rsled_overlay } from "./rsled.styles";
import style_animations from "../../../utils/animations.styles";
import i18n from "../../../translations/myi18n";
import {
  DayProgram,
  RGB,
  format_minutes,
  kelvin_rgb,
  light_color,
  program_format,
  rgb_css,
  wb_to_kelvin_program,
} from "./rsled_program";
import { chart_scale, program_chart } from "./rsled_chart";

/** Default geometry of the beam, in design-space pixels. */
export const BEAM_DEFAULTS = {
  // Trapezoid: narrow top under the lens, wide bottom
  top: { y: 404, x1: 238, x2: 356 },
  bottom: { y: 790, x1: 90, x2: 502 },
  intensity: { x: 296, y: 478 },
  program: { x: 296, y: 504 },
  chart: { x: 152, y: 526, w: 288, h: 210 },
  // Current time, under the chart, following the marker
  clock: { dy: 42, margin: 44 },
  // Lit part of the lens in the picture, greyed out when nothing is lit
  lens: { cx: 296, cy: 424, rx: 150, ry: 64 },
};

/**
 * Whether the lamp produces no daylight: off, or at 0 % intensity. The moon
 * alone does not make a beam.
 * @param on: whether the lamp is on
 * @param intensity: overall intensity in %, null when not reported
 * @param levels: level of each channel, in %, used without intensity
 */
export function is_dark(
  on: boolean,
  intensity: number | null | undefined,
  levels: { white: number; blue: number },
): boolean {
  const main = intensity ?? Math.max(levels.white, levels.blue);
  return !on || main <= 0;
}

/**
 * Colour and strength of the beam of a lit lamp.
 *
 * A lamp driven channel by channel (G1) shows the mix of its channels. A
 * lamp driven by intensity and colour (G2) shows its colour temperature
 * and its intensity: they follow the sliders at once, while its white and
 * blue levels are computed by the lamp and read back later. So does any
 * lamp lit without reporting a white or blue level.
 * @param levels: level of each channel, in %
 * @param intensity: overall intensity, in %, when reported
 * @param kelvin: colour temperature, in K, when reported
 * @param by_colour: whether the lamp is driven by intensity and colour
 */
export function beam_light(
  levels: { white: number; blue: number; moon: number },
  intensity: number | null | undefined,
  kelvin: number | null | undefined,
  by_colour: boolean = false,
): { rgb: RGB; alpha: number } {
  const power = Number(intensity ?? 0);
  const no_mix = levels.white <= 0 && levels.blue <= 0;
  if (power > 0 && kelvin && (by_colour || no_mix)) {
    return {
      rgb: kelvin_rgb(kelvin),
      alpha: Number((0.15 + (0.6 * Math.min(100, power)) / 100).toFixed(3)),
    };
  }
  return light_color(levels.white, levels.blue, levels.moon);
}

export class RSLedBeam extends RSLedElement {
  static override styles = [style_animations, style_rsled_overlay];

  protected geometry(): typeof BEAM_DEFAULTS {
    return { ...BEAM_DEFAULTS, ...((this.conf as any)?.geometry ?? {}) };
  }

  protected override _render(_style?: string): TemplateResult {
    const g = this.geometry();
    const on = this.led?.is_on?.() ?? true;
    const levels = this.led?.channel_levels?.() ?? {
      white: 0,
      blue: 0,
      moon: 0,
    };
    const intensity = this.led?.intensity_pct?.();
    const dark = is_dark(on, intensity, levels);
    // No light, no beam: only its outline is left, to keep it tappable
    const light = dark
      ? { rgb: [140, 140, 140] as [number, number, number], alpha: 0 }
      : beam_light(
          levels,
          intensity,
          this.led?.kelvin?.(),
          // Driven by intensity and colour: a G2, or a G1 whose sliders
          // are the intensity and colour ones (not the white/blue ones)
          this.led?.white_blue?.() === false,
        );
    const shape =
      `M ${g.top.x1} ${g.top.y} L ${g.top.x2} ${g.top.y} ` +
      `L ${g.bottom.x2} ${g.bottom.y} L ${g.bottom.x1} ${g.bottom.y} Z`;
    // Unique per instance: several lamps can share a dashboard
    const grad_id = `rsled_beam_${this._uid}`;

    // The strength of the light: its estimated PAR at the water surface
    // when the model is known, else the share of the lamp's power
    const reported = intensity !== null && intensity !== undefined;
    const par = reported ? this.led?.par?.() : null;
    const percent = reported ? `${i18n._("led_intensity")} ${intensity} %` : "";
    const intensity_txt =
      typeof par === "number"
        ? `☀ ≈ ${par} PAR`
        : percent
          ? `☀ ${percent}`
          : "";
    const intensity_tip =
      typeof par === "number"
        ? [i18n._("led_par_hint"), percent].filter((t) => t).join(" · ")
        : "";
    // Name of the program, and the day it was read from: a program of
    // another day would otherwise go unnoticed
    const name = String(this.led?.program_name?.() ?? "");
    const day = this.led?.today?.();
    const program =
      typeof day === "number" && day >= 1 && day <= 7
        ? `${name ? name + " · " : ""}${i18n._("day_" + day)}`
        : name;

    return html`<svg
      class="rsled_canvas"
      viewBox="0 0 ${RSLED_CANVAS.width} ${RSLED_CANVAS.height}"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="${grad_id}" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0"
            stop-color="${rgb_css(light.rgb)}"
            stop-opacity="${(light.alpha * 0.35).toFixed(3)}"
          ></stop>
          <stop
            offset="0.3"
            stop-color="${rgb_css(light.rgb)}"
            stop-opacity="${light.alpha}"
          ></stop>
          <stop
            offset="1"
            stop-color="${rgb_css(light.rgb)}"
            stop-opacity="${(light.alpha * 0.45).toFixed(3)}"
          ></stop>
        </linearGradient>
        <radialGradient id="${grad_id}_pool">
          <stop
            offset="0"
            stop-color="${rgb_css(light.rgb)}"
            stop-opacity="${light.alpha}"
          ></stop>
          <stop
            offset="1"
            stop-color="${rgb_css(light.rgb)}"
            stop-opacity="0"
          ></stop>
        </radialGradient>
      </defs>
      ${dark ? this._lens(g, grad_id) : ""}
      <path
        class="clickable beam_shape ${this.led?.identifying?.()
          ? "beam_identify"
          : ""}"
        d="${shape}"
        fill="url(#${grad_id})"
      ></path>
      ${dark
        ? ""
        : svg`<ellipse
              class="beam_pool"
              cx="${(g.bottom.x1 + g.bottom.x2) / 2}"
              cy="${g.bottom.y}"
              rx="${(g.bottom.x2 - g.bottom.x1) / 2}"
              ry="18"
              fill="url(#${grad_id}_pool)"
            ></ellipse>`}
      <text
        class="beam_text"
        x="${g.intensity.x}"
        y="${g.intensity.y}"
        text-anchor="middle"
      >
        ${intensity_txt}${intensity_tip
          ? svg`<title>${intensity_tip}</title>`
          : ""}
      </text>
      <text
        class="beam_title"
        x="${g.program.x}"
        y="${g.program.y}"
        text-anchor="middle"
      >
        ${program}
      </text>
      ${this._chart(g, on)}
    </svg>`;
  }

  /**
   * Lens of the picture, greyed out: the lamp produces no light.
   */
  private _lens(g: typeof BEAM_DEFAULTS, grad_id: string) {
    const { cx, cy, rx, ry } = g.lens;
    return svg`
      <defs>
        <radialGradient id="${grad_id}_lens">
          <stop offset="0" stop-color="#3b3e45" stop-opacity="0.96"></stop>
          <stop offset="0.85" stop-color="#303238" stop-opacity="0.93"></stop>
          <stop offset="1" stop-color="#26282d" stop-opacity="0.4"></stop>
        </radialGradient>
      </defs>
      <ellipse class="lens_off" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
        fill="url(#${grad_id}_lens)"></ellipse>
    `;
  }

  /** Identifier used to keep gradient ids unique in the page. */
  private static _next_uid = 0;
  private _uid = RSLedBeam._next_uid++;

  /**
   * Chart of today's program, a red marker at the current time.
   */
  private _chart(g: typeof BEAM_DEFAULTS, on: boolean) {
    const { x, y, w, h } = g.chart;
    const today: DayProgram | null = this.led?.today_program?.() ?? null;
    const yesterday: DayProgram | null =
      this.led?.yesterday_program?.() ?? null;
    const now: number = this.led?.now?.().minute ?? 0;
    // Outside the automatic mode the program does not drive the lamp
    const dim = this.led?.mode?.() !== "auto" || !on;
    const { px } = chart_scale(g.chart);

    return svg`
      <g class="clickable" opacity="${dim ? 0.45 : 1}">
        <rect x="${x - 10}" y="${y - 12}" width="${w + 20}" height="${h + 34}"
          rx="10" fill="rgba(10,20,40,0.2)"></rect>
        ${program_chart(g.chart, {
          id: `rsled_beam_chart_${this._uid}`,
          today,
          yesterday,
          ticks: true,
          clouds: this.led?.clouds?.(this.led?.today?.()) ?? null,
          // A G1 program: its colour zones, as the editor shows them
          kelvin:
            program_format(today) === "wb"
              ? wb_to_kelvin_program(today, this.led?.g1_model?.())
              : null,
        })}
      </g>
      ${
        today
          ? svg`<line class="now_marker" x1="${px(now)}" y1="${y - 4}"
                x2="${px(now)}" y2="${y + h}"></line>
              <circle cx="${px(now)}" cy="${y - 4}" r="3.5" fill="#ec2330"></circle>
              ${this._clock(g, px(now), now)}`
          : ""
      }
    `;
  }

  /**
   * Current time under the chart, and the weather's place time in weather
   * mode: "09:04 (04:04)".
   */
  private _clock(g: typeof BEAM_DEFAULTS, x: number, now: number) {
    const { dy, margin } = g.clock;
    const place = this.led?.weather_place_now?.() ?? null;
    const text =
      format_minutes(now) +
      (place === null ? "" : ` (${format_minutes(place)})`);
    // Kept inside the chart's width: the marker runs to both ends
    const cx = Math.max(
      g.chart.x + margin,
      Math.min(g.chart.x + g.chart.w - margin, x),
    );
    return svg`<text class="now_time" x="${cx}" y="${g.chart.y + g.chart.h + dy}"
      text-anchor="middle">${text}${
        place === null
          ? ""
          : svg`<title>${i18n._("led_weather_place_time")}</title>`
      }</text>`;
  }

  /** Tap on the beam: edit today's program. */
  override _click(): void {
    this.led?.open_program_editor?.();
  }
}
