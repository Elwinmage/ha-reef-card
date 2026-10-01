/**
 * ReefWave flow: the water pushed by the pump, under it, in the triangle
 * running from its outlet (right, narrow) to the open tank (left, wide).
 *
 * Curved stripes drift through the triangle at a pace proportional to the
 * pump speed: leftwards for a forward wave, rightwards for a reverse one,
 * back and forth for an alternate one. The flow is denser as the speed
 * rises, and vanishes when the pump stops (off, feeding, maintenance, no
 * wave).
 *
 * The element is a full-canvas SVG in the design space (see RSWAVE_CANVAS).
 *
 * Example mapping:
 *   flow: { name: "flow", type: "rswave-flow", stateObj: null,
 *           geometry: { points: [[53,244],[59,403],[504,416]] },
 *           css: {...full canvas...} }
 */
import { html, svg, TemplateResult } from "lit";

import { RSWaveElement, RSWAVE_CANVAS } from "./rswave_element";
import { style_rswave_overlay } from "./rswave.styles";
import { flow_duration } from "./rswave_program";

/** Default triangle, in design-space pixels: top-left, bottom-left, outlet. */
export const FLOW_DEFAULTS = {
  points: [
    [53, 244],
    [59, 403],
    [504, 416],
  ] as [number, number][],
  /** Water colour, "r,g,b" */
  color: "64,164,223",
};

/** Distance between two stripes; one loop of the animation moves one. */
export const FLOW_PERIOD = 36;

/** Periods an alternate wave travels before turning back. */
export const FLOW_ALT_PERIODS = 6;

export class RSWaveFlow extends RSWaveElement {
  static override styles = style_rswave_overlay;

  protected geometry(): typeof FLOW_DEFAULTS {
    return { ...FLOW_DEFAULTS, ...((this.conf as any)?.geometry ?? {}) };
  }

  /** Re-render only when the speed or the direction changes. */
  protected override signature(): string {
    return `${this.wave?.speed?.() ?? 0}|${this.wave?.direction?.() ?? ""}`;
  }

  /**
   * Stripes covering the triangle, plus the margin the animation slides
   * them through.
   * @param x0: left edge of the triangle
   * @param x1: right edge of the triangle
   * @param y0: top of the triangle
   * @param y1: bottom of the triangle
   */
  protected stripes(x0: number, x1: number, y0: number, y1: number) {
    const margin = FLOW_PERIOD * (FLOW_ALT_PERIODS + 1);
    const lines: TemplateResult[] = [];
    const bulge = (y1 - y0) * 0.12;
    for (let x = x0 - FLOW_PERIOD; x <= x1 + margin; x += FLOW_PERIOD) {
      lines.push(
        svg`<path d="M ${x} ${y0} Q ${x - bulge} ${(y0 + y1) / 2} ${x} ${y1}"
          fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="3"
          stroke-linecap="round"></path>`,
      );
    }
    return lines;
  }

  protected override _render(_style?: string): TemplateResult {
    const speed = Number(this.wave?.speed?.() ?? 0);
    const direction = String(this.wave?.direction?.() ?? "");
    const duration = flow_duration(speed);
    if (!duration || !["fw", "rw", "alt"].includes(direction)) {
      return html``;
    }
    const g = this.geometry();
    const xs = g.points.map((p) => p[0]);
    const ys = g.points.map((p) => p[1]);
    const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
    const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
    const points = g.points.map((p) => p.join(",")).join(" ");
    // Denser water as the pump pushes harder
    const strength = 0.25 + (0.6 * Math.min(100, speed)) / 100;
    const loop = direction === "alt" ? duration * FLOW_ALT_PERIODS : duration;
    const id = "rswave_flow";
    return html`<svg
      class="rswave_canvas"
      viewBox="0 0 ${RSWAVE_CANVAS.width} ${RSWAVE_CANVAS.height}"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id="${id}_clip">
          <polygon points="${points}"></polygon>
        </clipPath>
        <linearGradient id="${id}_water" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stop-color="rgb(${g.color})" stop-opacity="0.55" />
          <stop offset="1" stop-color="rgb(${g.color})" stop-opacity="0.05" />
        </linearGradient>
      </defs>
      <g clip-path="url(#${id}_clip)" opacity="${strength.toFixed(2)}">
        <polygon points="${points}" fill="url(#${id}_water)"></polygon>
        <g
          class="flow_lines ${direction}"
          style="animation-duration:${loop.toFixed(2)}s"
        >
          ${this.stripes(x0, x1, y0, y1)}
        </g>
      </g>
    </svg>`;
  }
}
