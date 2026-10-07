/**
 * Speed ring fitted on a part of the pump picture seen in perspective.
 *
 * A plain progress circle is round. The front cap of a SmartDrift is seen
 * from the side, so on the picture it is an ellipse: this ring is that
 * ellipse (slightly tilted, flattened), filling clockwise from its top, the
 * figure in its centre — the way the ReefWave draws its speed on its end
 * cap.
 *
 * The element covers the picture and draws in the picture's own pixels
 * (`geometry.view` is the size of the PNG), so the ellipse is given as
 * measured on the file and follows the picture when it is moved or resized.
 *
 * Example mapping:
 *   speed: { name: "flow", type: "aquamedic-cap-ring", target: 100,
 *            geometry: { view: [976, 937], cx: 677, cy: 466, rx: 164,
 *                        ry: 238, angle: -2.4, width: 30, font_size: 120 },
 *            css: {...the rectangle of the picture...} }
 */
import { css, CSSResult, html, TemplateResult } from "lit";

import { ProgressCircle } from "../../../base/progress_circle";
import { OFF_COLOR } from "../../../utils/constants";

/** Shape of the ring, in pixels of the picture. */
export interface CapRingGeometry {
  /** Size of the picture: the design space of the drawing */
  view: [number, number];
  /** Centre of the cap */
  cx: number;
  cy: number;
  /** Half axes of the ring centre line */
  rx: number;
  ry: number;
  /** Tilt of the cap, degrees */
  angle: number;
  /** Ring thickness */
  width: number;
  font_size: number;
}

export class AMCapRing extends ProgressCircle {
  static override styles = [
    ...(ProgressCircle.styles as CSSResult[]),
    css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .cap_text {
        font-weight: 700;
        /* A dark edge keeps the figure readable over the embossed logo */
        paint-order: stroke;
        stroke: rgba(0, 0, 0, 0.75);
        stroke-linejoin: round;
      }
    `,
  ];

  protected geometry(): CapRingGeometry {
    return (this.conf as any).geometry as CapRingGeometry;
  }

  protected override _render(_style?: string): TemplateResult {
    if (!this.hasTargetState()) {
      return html``;
    }
    const g = this.geometry();
    const on = this.groupOn ?? this.device.is_on();
    const rgb = on ? this.color : OFF_COLOR;
    const target = this.getTargetValue() || 1;
    const percent = Math.max(
      0,
      Math.min(100, Math.round((this.getValue() * 100) / target)),
    );
    // Clockwise from the top: two half arcs, measured in % via pathLength
    const ring = `M 0 ${-g.ry} A ${g.rx} ${g.ry} 0 1 1 0 ${g.ry} A ${g.rx} ${g.ry} 0 1 1 0 ${-g.ry}`;
    return html`<svg
      viewBox="0 0 ${g.view[0]} ${g.view[1]}"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(${g.cx} ${g.cy}) rotate(${g.angle})">
        <path
          class="cap_track"
          d="${ring}"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          stroke-width="${g.width}"
        ></path>
        <path
          class="cap_value"
          d="${ring}"
          pathLength="100"
          fill="none"
          stroke="rgb(${rgb})"
          stroke-width="${g.width}"
          stroke-linecap="${percent > 0 ? "round" : "butt"}"
          stroke-dasharray="${percent} 100"
        ></path>
      </g>
      <text
        class="cap_text"
        x="${g.cx}"
        y="${g.cy}"
        font-size="${g.font_size}"
        stroke-width="${g.font_size / 9}"
        fill="rgb(${rgb})"
        text-anchor="middle"
        dominant-baseline="central"
      >
        ${percent}%
      </text>
    </svg>`;
  }
}
