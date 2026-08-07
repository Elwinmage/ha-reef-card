/**
 * Implement a progress circle
 *
 * Examples:
 *
 * 1) Classic state/target-based circle:
 *   {
 *     name: "auto_dosed_today",
 *     target: "daily_dose",
 *     force_integer: true,
 *     type: "progress-circle",
 *     class: "today_dosing",
 *     no_value: true,
 *   }
 *
 * 2) Attribute-based circle (e.g. RSMAT maintenance countdown):
 *   {
 *     name: "replace_activated_carbon",
 *     type: "progress-circle",
 *     value_attribute: "days_left",
 *     target_attribute: "interval_days",
 *     inverted: true,
 *     colors: {
 *       background: "black",
 *       fill: "brown",
 *       center: "rgba(255,255,255,0.2)",
 *     },
 *   }
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//

import { html, TemplateResult, css, CSSResult } from "lit";
import { property } from "lit/decorators.js";

import type { ProgressConfig } from "../types/index";

import { SensorTarget } from "./sensor_target";

import style_progress_circle from "./progress_circle.styles";
import style_animations from "../utils/animations.styles";
import { OFF_COLOR } from "../utils/constants";

//----------------------------------------------------------------------------//

export class ProgressCircle extends SensorTarget {
  static override styles = [
    style_animations,
    // SensorTarget.styles is always defined as an array
    ...(SensorTarget.styles as CSSResult[]),
    // Add ProgressCircle-specific styles
    style_progress_circle,
    css`
      .progress-circle-path {
        stroke: var(--progress-stroke-color);
      }
    `,
  ];
  @property({ type: Object })
  declare conf?: ProgressConfig;

  /**
   * Constructor
   */
  constructor() {
    super();
  }

  /**
   * Render
   * @param _style: No used here
   */
  protected override _render(_style?: string): TemplateResult {
    if (!this.hasTargetState() && typeof this.conf.target !== "number") {
      const why = !this.stateObj
        ? `stateObj not resolved for name="${this.conf?.name}" — check the entity's translation_key matches (device.entities keys)`
        : `stateObjTarget not resolved for target="${(this.conf as any)?.target}" — set target_attribute if the target lives in the entity's attributes`;
      console.warn(
        `[ProgressCircle - ${this.conf?.name}] Missing state: ${why}`,
      );
      return html`<div class="error">Missing state</div>`;
    }

    // Set this.c based on DEVICE state (not stateObj state)
    if (!this.device.is_on()) {
      this.c = OFF_COLOR;
    } else {
      this.c = this.color;
    }
    if (
      this.conf?.disabled_if &&
      this.evaluateCondition(this.conf.disabled_if)
    ) {
      return html`<br />`;
    }
    // Use SensorTarget helpers so value_attribute / target_attribute are honoured.
    const value = this.getValue();
    let target = 100;
    if (typeof this.conf.target === "number") {
      target = this.conf.target;
    } else {
      target = this.getTargetValue();
    }
    if (this.conf?.target_is_remaining) {
      target += value;
    }

    let percent = 100;
    if (value < target) {
      percent = Math.floor((value * 100) / target);
    } //if

    if (this.conf?.inverted) {
      percent = 100 - percent;
    }

    const _circle_class = this.conf.class;
    const _label = this.label;

    let style = "";
    if ("no_value" in this.conf && this.conf.no_value) {
      style = "visibility: hidden;";
    }
    const _unit = "%";
    let fill = percent - 2;
    if (fill < 0) {
      fill = 0;
    }
    // Color overrides — defaults preserve legacy behaviour.
    const center_color = this.conf?.colors?.center ?? "transparent";
    const bg_stroke = this.conf?.colors?.background ?? "rgba(150,150,150,0.6)";
    // colors.fill wins over device/OFF colors when explicitly set.
    const fill_stroke = this.conf?.colors?.fill ?? `rgb(${this.c})`;

    // range 0 to 565 for 200x200
    return html` <svg
      width="100%"
      height="100%"
      viewBox="-25 -25 250 250"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      style="transform:rotate(-90deg)"
    >
      <circle
        r="90"
        cx="100"
        cy="100"
        fill="${center_color}"
        stroke="${bg_stroke}"
        stroke-width="16px"
      ></circle>
      <circle
        r="90"
        cx="100"
        cy="100"
        stroke="${fill_stroke}"
        stroke-width="16px"
        stroke-linecap="round"
        stroke-dashoffset="${565 - (percent * 565) / 100}px"
        fill="transparent"
        stroke-dasharray="565.48px"
      ></circle>
      <text
        x="115px"
        y="100px"
        fill="${fill_stroke}"
        font-size="52px"
        font-weight="bold"
        text-anchor="middle"
        dominant-baseline="middle"
        style="${style} transform:rotate(90deg) translate(0px, -196px)"
      >
        ${percent}%
      </text>
    </svg>`;
  }
}
