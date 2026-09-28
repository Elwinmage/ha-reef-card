/**
 * ReefLED name: the name of the lamp, written in the sky along the upper
 * left edge of the lamp, parallel to it.
 *
 * The element is a full-canvas SVG in the design space (see RSLED_CANVAS).
 * Each model sets where the text sits and its slant (the edge of a G2 is
 * less steep than a G1's). A long name is squeezed to the length of the
 * edge: set smaller, then cut with an ellipsis (the whole name shows on
 * hover), rather than overflowing onto the rise time.
 *
 * Example mapping:
 *   lamp_name: { name: "lamp_name", type: "rsled-name", stateObj: null,
 *                geometry: { x: 150, y: 181, angle: -33 },
 *                css: {...full canvas...} }
 */
import { html, TemplateResult } from "lit";

import { RSLedElement } from "./rsled_element";
import { RSLED_CANVAS } from "./rsled_sky";
import { style_rsled_overlay } from "./rsled.styles";

/** Default geometry (G1), in design-space pixels and degrees. */
export const NAME_DEFAULTS = {
  /** Centre of the text */
  x: 150,
  y: 181,
  /** Slant of the text, the one of the lamp's edge */
  angle: -33,
  /** Longest text before it is squeezed */
  max_width: 215,
  font_size: 21,
  /** Smallest size before the name is cut */
  min_font_size: 14,
};

/** Rough width of a character, as a share of the font size. */
export const CHAR_WIDTH = 0.58;

/**
 * Size and text of a name fitting a width.
 * @param name: the name
 * @param g: the geometry (max_width, font_size, min_font_size)
 * @return the font size, and the name, cut with an ellipsis if needed
 */
export function fit_name(
  name: string,
  g: { max_width: number; font_size: number; min_font_size: number },
): { size: number; text: string } {
  const fits = (size: number) => Math.floor(g.max_width / (size * CHAR_WIDTH));
  if (name.length <= fits(g.font_size))
    return { size: g.font_size, text: name };
  const size = Math.max(
    g.min_font_size,
    Math.floor(g.max_width / (name.length * CHAR_WIDTH)),
  );
  const room = fits(size);
  return {
    size,
    text: name.length <= room ? name : name.slice(0, room - 1).trimEnd() + "…",
  };
}

export class RSLedName extends RSLedElement {
  static override styles = style_rsled_overlay;

  protected geometry(): typeof NAME_DEFAULTS {
    return { ...NAME_DEFAULTS, ...((this.conf as any)?.geometry ?? {}) };
  }

  /** Re-render only when the name or the on/off state changes. */
  protected override signature(): string {
    return `${this.led?.display_name?.() ?? ""}|${this.led?.is_on?.() ?? true}`;
  }

  protected override _render(_style?: string): TemplateResult {
    const name = String(this.led?.display_name?.() ?? "").trim();
    if (!name) return html``;
    const g = this.geometry();
    const on = this.led?.is_on?.() ?? true;
    const fit = fit_name(name, g);
    return html`<svg
      class="rsled_canvas"
      viewBox="0 0 ${RSLED_CANVAS.width} ${RSLED_CANVAS.height}"
      preserveAspectRatio="xMidYMid meet"
    >
      <text
        class="lamp_name ${on ? "" : "sky_mode_off"}"
        x="${g.x}"
        y="${g.y}"
        font-size="${fit.size}"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(${g.angle} ${g.x} ${g.y})"
      >
        <title>${name}</title>
        ${fit.text}
      </text>
    </svg>`;
  }
}
