/**
 * ReefLED beam: the cone of light under the lamp.
 *
 * Its colour and opacity follow the light currently produced (white, blue
 * and moon channels). Inside it: the current intensity, the name of today's
 * program and a chart of that program over the day, with a red marker at
 * the current time.
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
import { DayProgram, light_color, rgb_css } from "./rsled_program";
import { chart_scale, program_chart } from "./rsled_chart";

/** Default geometry of the beam, in design-space pixels. */
export const BEAM_DEFAULTS = {
  // Trapezoid: narrow top under the lens, wide bottom
  top: { y: 404, x1: 238, x2: 356 },
  bottom: { y: 790, x1: 90, x2: 502 },
  intensity: { x: 296, y: 478 },
  program: { x: 296, y: 504 },
  chart: { x: 152, y: 526, w: 288, h: 210 },
};

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
    const light = on
      ? light_color(levels.white, levels.blue, levels.moon)
      : { rgb: [140, 140, 140] as [number, number, number], alpha: 0.12 };
    const shape =
      `M ${g.top.x1} ${g.top.y} L ${g.top.x2} ${g.top.y} ` +
      `L ${g.bottom.x2} ${g.bottom.y} L ${g.bottom.x1} ${g.bottom.y} Z`;
    // Unique per instance: several lamps can share a dashboard
    const grad_id = `rsled_beam_${this._uid}`;

    const intensity = this.led?.intensity_pct?.();
    const intensity_txt =
      intensity === null || intensity === undefined
        ? ""
        : `☀ ${i18n._("led_intensity")} ${intensity} %`;
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
      <path
        class="clickable beam_shape ${this.led?.identifying?.()
          ? "beam_identify"
          : ""}"
        d="${shape}"
        fill="url(#${grad_id})"
      ></path>
      <ellipse
        cx="${(g.bottom.x1 + g.bottom.x2) / 2}"
        cy="${g.bottom.y}"
        rx="${(g.bottom.x2 - g.bottom.x1) / 2}"
        ry="18"
        fill="url(#${grad_id}_pool)"
      ></ellipse>
      <text
        class="beam_text"
        x="${g.intensity.x}"
        y="${g.intensity.y}"
        text-anchor="middle"
      >
        ${intensity_txt}
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
        })}
      </g>
      ${
        today
          ? svg`<line class="now_marker" x1="${px(now)}" y1="${y - 4}"
                x2="${px(now)}" y2="${y + h}"></line>
              <circle cx="${px(now)}" cy="${y - 4}" r="3.5" fill="#ec2330"></circle>`
          : ""
      }
    `;
  }

  /** Tap on the beam: edit today's program. */
  override _click(): void {
    this.led?.open_program_editor?.();
  }
}
