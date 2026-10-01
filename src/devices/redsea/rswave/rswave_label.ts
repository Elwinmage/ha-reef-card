/**
 * ReefWave LED strip: the mode of the pump, written in light white along the
 * strip of its body (a click opens its more-info dialog), and
 * the name of the pump written under it, parallel to the strip.
 *
 * The element is a full-canvas SVG in the design space (see RSWAVE_CANVAS).
 *
 * Example mapping:
 *   mode_name: { name: "mode_name", type: "rswave-label", stateObj: null,
 *                geometry: { x: 275, y: 209, angle: 18 },
 *                css: {...full canvas...} }
 */
import { html, nothing, svg, TemplateResult } from "lit";

import { RSWaveElement, RSWAVE_CANVAS } from "./rswave_element";
import { style_rswave_overlay } from "./rswave.styles";
import { fit_name } from "../rsled/rsled_name";

/** Default geometry, in design-space pixels and degrees. */
export const LABEL_DEFAULTS = {
  /** Centre of the strip */
  x: 275,
  y: 209,
  /** Slant of the strip */
  angle: 18,
  /** Size of the strip */
  length: 112,
  thickness: 18,
  mode_font_size: 15,
  /** Distance from the strip to the name, across it */
  name_offset: 25,
  /** Longest name before it is squeezed */
  max_width: 150,
  font_size: 16,
  min_font_size: 10,
};

/** Colour of the mode: a light white on the dark body of the pump. */
export const MODE_COLOR = "rgba(255,255,255,0.8)";

/** Colour of the mode when the pump is off. */
export const MODE_COLOR_OFF = "rgba(255,255,255,0.45)";

export class RSWaveLabel extends RSWaveElement {
  static override styles = style_rswave_overlay;

  protected geometry(): typeof LABEL_DEFAULTS {
    return { ...LABEL_DEFAULTS, ...((this.conf as any)?.geometry ?? {}) };
  }

  /** Re-render only when the mode, the name or the on/off state changes. */
  protected override signature(): string {
    const w = this.wave;
    return `${w?.mode?.() ?? ""}|${w?.mode_label?.() ?? ""}|${
      w?.display_name?.() ?? ""
    }|${w?.is_on?.() ?? true}`;
  }

  /**
   * Open the more-info dialog of the mode sensor.
   * @param e: the click
   */
  more_info(e: Event): void {
    e.stopPropagation();
    // check-entities: uses mode
    const entity = this.wave?.get_entity?.("sensor.mode");
    if (!entity?.entity_id) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: entity.entity_id },
      }),
    );
  }

  protected override _render(_style?: string): TemplateResult {
    const g = this.geometry();
    const on = this.wave?.is_on?.() ?? true;
    const mode = String(this.wave?.mode?.() ?? "");
    const label = String(this.wave?.mode_label?.() ?? mode).trim();
    const name = String(this.wave?.display_name?.() ?? "").trim();
    const color = on ? MODE_COLOR : MODE_COLOR_OFF;
    const fit = fit_name(name, g);
    // The name sits under the strip, across its slant
    const rad = (g.angle * Math.PI) / 180;
    const nx = g.x - g.name_offset * Math.sin(rad);
    const ny = g.y + g.name_offset * Math.cos(rad);
    // Fragments inside the <svg> must be built with the svg tag
    const strip = label
      ? svg`<g
          class="mode_click"
          transform="rotate(${g.angle} ${g.x} ${g.y})"
          @click=${(e: Event) => this.more_info(e)}
        >
          <title>${label}</title>
          <rect
            class="mode_hit"
            x="${g.x - g.length / 2}"
            y="${g.y - g.thickness / 2}"
            width="${g.length}"
            height="${g.thickness}"
            fill="transparent"
          ></rect>
          <text
            class="mode_text"
            x="${g.x}"
            y="${g.y}"
            font-size="${g.mode_font_size}"
            fill="${color}"
            text-anchor="middle"
            dominant-baseline="central"
          >
            ${label}
          </text>
        </g>`
      : nothing;
    const title = name
      ? svg`<text
          class="pump_name ${on ? "" : "off"}"
          x="${nx}"
          y="${ny}"
          font-size="${fit.size}"
          text-anchor="middle"
          dominant-baseline="central"
          transform="rotate(${g.angle} ${nx} ${ny})"
        >
          <title>${name}</title>
          ${fit.text}
        </text>`
      : nothing;
    return html`<svg
      class="rswave_canvas"
      viewBox="0 0 ${RSWAVE_CANVAS.width} ${RSWAVE_CANVAS.height}"
      preserveAspectRatio="xMidYMid meet"
    >
      ${strip} ${title}
    </svg>`;
  }
}
