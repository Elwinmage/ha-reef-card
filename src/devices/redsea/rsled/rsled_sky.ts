/**
 * ReefLED sky: the course of the sun (or of the moon at night) above the
 * lamp, with the rise and set times of the current program, the current
 * mode and the clouds of the day.
 *
 * The element is a full-canvas SVG drawn in the device's design space
 * (see RSLED_CANVAS). It is used twice by the mapping:
 *   - layer "back": the arc and the sun/moon, drawn behind the lamp picture
 *     so the arc ends disappear behind it like a horizon;
 *   - layer "front": the times, the mode and the clouds, over the picture.
 *
 * Example mapping:
 *   sky_back: { name: "sky_back", type: "rsled-sky", stateObj: null,
 *               layer: "back", put_in: "back", css: {...full canvas...} }
 */
import { html, svg, TemplateResult } from "lit";
import { mdiWeatherSunsetUp } from "@mdi/js";

import { RSLedElement } from "./rsled_element";
import { style_rsled_overlay } from "./rsled.styles";
import style_animations from "../../../utils/animations.styles";
import {
  format_minutes,
  moon_lit_path,
  moon_phase,
  SkyState,
} from "./rsled_program";

/** Design space of the ReefLED view (the picture is laid out in it). */
export const RSLED_CANVAS = { width: 591, height: 860 };

/** Default geometry of the sky, in design-space pixels. */
export const SKY_DEFAULTS = {
  arc: { cx: 295.5, cy: 228, rx: 255, ry: 196 },
  sun_r: 22,
  moon_r: 22,
  left_label: { x: 62, y: 262 },
  /** Offset badge, under the left time */
  offset_label: { x: 62, y: 284 },
  right_label: { x: 529, y: 262 },
  mode: { x: 295.5, y: 118 },
  clouds: { x: 400, y: 104 },
};

/** Night colour: the violet of the lamp's moon LED. */
export const NIGHT_COLOR = "#a070ff";

/** A small cloud glyph centred on (0,0), about 44×24 px. */
const CLOUD_PATH =
  "M -16 10 H 16 A 8 8 0 0 0 16 -6 A 11 11 0 0 0 -4 -10 A 9 9 0 0 0 -18 -2 A 6 6 0 0 0 -16 10 Z";

export class RSLedSky extends RSLedElement {
  static override styles = [style_animations, style_rsled_overlay];

  /** Geometry, mapping values over defaults. */
  protected geometry(): typeof SKY_DEFAULTS {
    return { ...SKY_DEFAULTS, ...((this.conf as any)?.geometry ?? {}) };
  }

  protected override _render(_style?: string): TemplateResult {
    const g = this.geometry();
    const layer = (this.conf as any)?.layer === "front" ? "front" : "back";
    const content =
      layer === "front" ? this._render_front(g) : this._render_back(g);
    return html`<svg
      class="rsled_canvas"
      viewBox="0 0 ${RSLED_CANVAS.width} ${RSLED_CANVAS.height}"
      preserveAspectRatio="xMidYMid meet"
    >
      ${content}
    </svg>`;
  }

  /**
   * Position of a point on the arc.
   * @param g: the geometry
   * @param progress: 0 = left end, 1 = right end
   */
  static arc_point(
    g: typeof SKY_DEFAULTS,
    progress: number,
  ): { x: number; y: number } {
    const p = Math.max(0, Math.min(1, progress));
    const angle = Math.PI * (1 - p);
    return {
      x: g.arc.cx + g.arc.rx * Math.cos(angle),
      y: g.arc.cy - g.arc.ry * Math.sin(angle),
    };
  }

  /** Arc and travelling body. */
  private _render_back(g: typeof SKY_DEFAULTS) {
    const sky: SkyState = this.led?.sky_state?.() ?? {
      body: "sun",
      progress: 0.5,
      start: null,
      end: null,
    };
    const on = this.led?.is_on?.() ?? true;
    const { cx, cy, rx, ry } = g.arc;
    const pos = RSLedSky.arc_point(g, sky.progress);
    const day = sky.body === "sun";
    // Travelled part: plain; still to come: dotted and faded
    const color = !on ? "#9a9a9a" : day ? "#f2c230" : NIGHT_COLOR;
    const left = `${cx - rx} ${cy}`;
    const right = `${cx + rx} ${cy}`;
    const at = `${pos.x.toFixed(1)} ${pos.y.toFixed(1)}`;

    return svg`
      <path d="M ${at} A ${rx} ${ry} 0 0 1 ${right}" fill="none"
        stroke="${color}" stroke-width="3" stroke-linecap="round"
        stroke-dasharray="2 9" opacity="0.7"></path>
      <path d="M ${left} A ${rx} ${ry} 0 0 1 ${at}" fill="none"
        stroke="${color}" stroke-width="3.5" stroke-linecap="round"></path>
      <g transform="translate(${at.replace(" ", ",")})">
        ${day ? this._sun(g, on) : this._moon(g, on)}
        ${this._time()}
      </g>
    `;
  }

  /**
   * The current time, written in the sun or the moon it travels with (the
   * time of the tank, Home Assistant's); nothing when the lamp does not
   * tell it.
   */
  private _time() {
    const minute = Number(this.led?.now?.()?.minute);
    if (!Number.isFinite(minute)) return "";
    return svg`<text class="sky_time" text-anchor="middle"
      dominant-baseline="central">${format_minutes(minute)}</text>`;
  }

  private _sun(g: typeof SKY_DEFAULTS, on: boolean) {
    const core = on ? "#f5a623" : "#a0a0a0";
    const glow = on ? "#ffd36b" : "#c8c8c8";
    const id = `rsled_sun_${this._uid}`;
    return svg`
      <defs>
        <radialGradient id="${id}">
          <stop offset="0.45" stop-color="${glow}" stop-opacity="0.55"></stop>
          <stop offset="1" stop-color="${glow}" stop-opacity="0"></stop>
        </radialGradient>
      </defs>
      <circle r="${g.sun_r * 1.9}" fill="url(#${id})"></circle>
      <circle r="${g.sun_r}" fill="${core}"></circle>
    `;
  }

  /** Identifier used to keep gradient ids unique in the page. */
  private static _next_uid = 0;
  private _uid = RSLedSky._next_uid++;

  private _moon(g: typeof SKY_DEFAULTS, on: boolean) {
    const phase = moon_phase(this.led?.moon_day?.() ?? 15);
    const lit = moon_lit_path(phase, g.moon_r);
    const lit_color = on ? "#f1e9ff" : "#b5b5b5";
    const glow = on ? NIGHT_COLOR : "#c8c8c8";
    const id = `rsled_moon_${this._uid}`;
    return svg`
      <defs>
        <radialGradient id="${id}">
          <stop offset="0.5" stop-color="${glow}" stop-opacity="0.5"></stop>
          <stop offset="1" stop-color="${glow}" stop-opacity="0"></stop>
        </radialGradient>
      </defs>
      <circle r="${g.moon_r * 1.9}" fill="url(#${id})"></circle>
      <circle r="${g.moon_r}" fill="#2e2548" stroke="${lit_color}"
        stroke-opacity="0.35" stroke-width="1"></circle>
      ${lit ? svg`<path d="${lit}" fill="${lit_color}"></path>` : ""}
    `;
  }

  /** Times, mode and clouds. */
  private _render_front(g: typeof SKY_DEFAULTS) {
    const sky: SkyState | null = this.led?.sky_state?.() ?? null;
    const on = this.led?.is_on?.() ?? true;
    const labels =
      sky && sky.start !== null && sky.end !== null
        ? svg`
          <text class="sky_label" x="${g.left_label.x}" y="${g.left_label.y}"
            text-anchor="middle">${format_minutes(sky.start)}</text>
          <text class="sky_label" x="${g.right_label.x}" y="${g.right_label.y}"
            text-anchor="middle">${format_minutes(sky.end)}</text>`
        : "";
    const mode = String(this.led?.mode_label?.() ?? "");
    return svg`
      ${labels}
      ${this._offset(g)}
      <text
        class="sky_mode clickable ${on ? "" : "sky_mode_off"}"
        x="${g.mode.x}" y="${g.mode.y}" text-anchor="middle"
        @click=${this._open_mode}
      >${mode}</text>
      ${this._clouds(g, sky)}
    `;
  }

  /**
   * Clouds of the day. While their window is open they drift in front of
   * the sun; otherwise a faint cloud next to the mode tells they are
   * programmed.
   */
  private _clouds(g: typeof SKY_DEFAULTS, sky: SkyState | null) {
    const clouds: { count: number; active: boolean } =
      this.led?.clouds_state?.() ?? { count: 0, active: false };
    if (!clouds.count) return "";
    if (!clouds.active || !sky || sky.body !== "sun") {
      return svg`<g transform="translate(${g.clouds.x},${g.clouds.y}) scale(0.7)">
        <path d="${CLOUD_PATH}" fill="rgba(200,208,220,0.55)"
          stroke="rgba(120,130,150,0.6)" stroke-width="1.5"></path></g>`;
    }
    const pos = RSLedSky.arc_point(g, sky.progress);
    const offsets = [
      [-26, 14],
      [24, 20],
      [0, -18],
    ].slice(0, clouds.count);
    const items = offsets.map(
      ([dx, dy], n) => svg`
        <g transform="translate(${(pos.x + dx).toFixed(1)},${(pos.y + dy).toFixed(1)})">
          <path class="cloud_active" style="animation-delay:${-n * 2}s"
            d="${CLOUD_PATH}" fill="rgba(240,244,250,0.92)"
            stroke="rgba(120,130,150,0.55)" stroke-width="1.2"></path>
        </g>`,
    );
    return svg`<g>${items}</g>`;
  }

  /** Tap on the mode: open the mode selector of Home Assistant. */
  /**
   * Staggered sunrise of the lamp: "+15 min" with a sunrise pictogram under
   * the left time, only when the lamp starts late. A click opens its
   * setting.
   */
  private _offset(g: typeof SKY_DEFAULTS) {
    const offset: number = this.led?.sunrise_offset?.() ?? 0;
    if (!offset) return "";
    const { x, y } = g.offset_label;
    const text = `+${offset} min`;
    // Pictogram (24 px scaled to 14) then the text, centred together
    const width = 14 + 3 + text.length * 7.4;
    const x0 = x - width / 2;
    return svg`<g class="sky_offset clickable" @click=${this._open_offset}>
      <title>${text}</title>
      <path d="${mdiWeatherSunsetUp}"
        transform="translate(${x0.toFixed(1)} ${y - 12}) scale(${14 / 24})"></path>
      <text x="${(x0 + 17).toFixed(1)}" y="${y}">${text}</text>
    </g>`;
  }

  private _open_offset = (ev: Event): void => {
    ev.stopPropagation();
    const entity = this.led?.get_entity?.("number.sunrise_offset");
    if (!entity?.entity_id) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: entity.entity_id },
      }),
    );
  };

  private _open_mode = (ev: Event): void => {
    ev.stopPropagation();
    const entity = this.led?.entities?.["select.mode"];
    if (!entity) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: entity.entity_id },
      }),
    );
  };
}
