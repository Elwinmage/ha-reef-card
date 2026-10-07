/**
 * Water streams drawn over the picture of a running pump.
 *
 * A stream is a path with a dash pattern sliding along it, so the water
 * seems to travel from the start of the path to its end: out of the front
 * of a flow pump, into the inlet and out of the outlet of a return pump.
 * The dashes slide faster as the pump speeds up, and nothing is drawn
 * while the pump is stopped (off, held by the feeding pause, or at 0 %).
 *
 * On a pump making waves, the streams also swell and fade at the pace of
 * the wave frequency (`pulse: true`), which a constant flow does not do.
 *
 * Like the cap ring, the element covers the picture and draws in the
 * picture's own pixels (`view`), so streams are given as measured on the
 * file. They may run past its edges, into the margins of the box.
 *
 * Example mapping:
 *   flow: { name: "flow", type: "aquamedic-flow", stateObj: null,
 *           view: [976, 937], width: 16,
 *           streams: [{ d: "M 880 400 q 45 -36 90 0 t 90 0",
 *                       from: [880, 400], to: [1060, 400], fade: "out" }],
 *           css: {...the rectangle of the picture...} }
 */
import { css, html, nothing, svg, TemplateResult } from "lit";

import { MyElement } from "../../../base/element";
import type { HassConfig } from "../../../types/index";

/** One stream of water. */
export interface AMStream {
  /** SVG path, drawn in the direction the water travels */
  d: string;
  /** Start and end of the path, for the fade */
  from: [number, number];
  to: [number, number];
  /** "out": fades away at its end (a jet); "in": appears along the way
   *  (water drawn into an inlet) */
  fade: "in" | "out";
}

/** Seconds a dash takes to travel its pattern, at 1 % and at 100 %. */
export const FLOW_PERIOD = { slow: 2.6, fast: 0.55 } as const;

/** Seconds of a swell, at a wave frequency of 0 % and of 100 %. */
export const PULSE_PERIOD = { slow: 5, fast: 0.8 } as const;

/** Colour of the water, "r,g,b". */
export const FLOW_COLOR = "70,150,255";

/**
 * Travel time of a dash for a pump speed.
 * @param speed: pump speed, in %
 * @return seconds, shorter as the pump speeds up
 */
export function flow_period(speed: number): number {
  const ratio = Math.max(0, Math.min(100, speed)) / 100;
  return FLOW_PERIOD.slow + ratio * (FLOW_PERIOD.fast - FLOW_PERIOD.slow);
}

/**
 * Duration of a swell for a wave frequency.
 * @param frequency: wave frequency, in %
 * @return seconds, shorter as the frequency rises
 */
export function pulse_period(frequency: number): number {
  const ratio = Math.max(0, Math.min(100, frequency)) / 100;
  return PULSE_PERIOD.slow + ratio * (PULSE_PERIOD.fast - PULSE_PERIOD.slow);
}

export class AMFlow extends MyElement {
  static override styles = [
    css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .stream,
      .bed {
        fill: none;
        stroke-linecap: round;
      }
      /* The water itself: a faint continuous line... */
      .bed {
        opacity: 0.3;
      }
      /* ...and two dashes travelling along it */
      .stream {
        stroke-dasharray: 24 26;
        animation: amFlowTravel linear infinite;
      }
      @keyframes amFlowTravel {
        from {
          stroke-dashoffset: 0;
        }
        to {
          stroke-dashoffset: -50;
        }
      }
      .pulse {
        animation: amFlowPulse ease-in-out infinite;
      }
      @keyframes amFlowPulse {
        0%,
        100% {
          opacity: 0.25;
        }
        50% {
          opacity: 1;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .stream,
        .pulse {
          animation: none;
        }
      }
    `,
  ];

  /** What the streams were last drawn from. */
  private _signature: string | null = null;

  private get _pump(): any {
    return this.device as any;
  }

  /** Speed the streams are drawn at: 0 while the pump does not run. */
  private _speed(): number {
    if (this._pump?.is_running?.() !== true) return 0;
    return Number(this._pump.speed?.()) || 0;
  }

  /** Seconds of a swell, 0 when the flow is steady. */
  private _pulse(): number {
    if ((this.conf as any)?.pulse !== true) return 0;
    const frequency = this._pump?.wave_frequency?.();
    return typeof frequency === "number" ? pulse_period(frequency) : 0;
  }

  /**
   * The base setter follows one entity; the streams depend on the whole
   * pump (power, feeding pause, speed, wave settings).
   */
  override set hass(obj: HassConfig) {
    this._hass = obj;
    const signature = `${this._speed()}|${this._pulse()}`;
    if (signature !== this._signature) {
      this._signature = signature;
      this.requestUpdate();
    }
  }

  /** An animation tells nothing a tooltip could add. */
  override get_tooltip(): string {
    return "";
  }

  protected override _render(_style?: string): TemplateResult | typeof nothing {
    const speed = this._speed();
    if (speed <= 0) return nothing;
    const conf: any = this.conf;
    const streams: AMStream[] = conf.streams ?? [];
    const [width, height] = conf.view as [number, number];
    const color: string = conf.color ?? FLOW_COLOR;
    const pulse = this._pulse();
    const period = flow_period(speed);
    // More water at speed: thicker and more opaque
    const strength = 0.55 + (Math.min(100, speed) / 100) * 0.4;

    return html`<svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        ${streams.map(
          (stream, i) =>
            svg`<linearGradient id="fade${i}" gradientUnits="userSpaceOnUse"
              x1=${stream.from[0]} y1=${stream.from[1]}
              x2=${stream.to[0]} y2=${stream.to[1]}>
              <stop offset="0" stop-color="rgb(${color})"
                stop-opacity=${stream.fade === "in" ? 0 : strength}></stop>
              <stop offset="0.35" stop-color="rgb(${color})"
                stop-opacity=${strength}></stop>
              <stop offset="1" stop-color="rgb(${color})"
                stop-opacity=${stream.fade === "in" ? strength : 0}></stop>
            </linearGradient>`,
        )}
      </defs>
      <g
        class=${pulse > 0 ? "pulse" : ""}
        style=${pulse > 0 ? `animation-duration:${pulse.toFixed(2)}s` : ""}
      >
        ${streams.map(
          (stream, i) =>
            svg`<path class="bed" d=${stream.d} stroke="url(#fade${i})"
                stroke-width=${conf.width ?? 12}></path>
              <path class="stream" d=${stream.d} pathLength="100"
              stroke="url(#fade${i})" stroke-width=${conf.width ?? 12}
              style="animation-duration:${period.toFixed(2)}s;
                animation-delay:${(-(i * period) / streams.length).toFixed(2)}s"
            ></path>`,
        )}
      </g>
    </svg>`;
  }
}
