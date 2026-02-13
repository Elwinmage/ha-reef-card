/**
 * Implement a progress circle
 * Exemple  {
 *          name: "auto_dosed_today",
 *          target: "daily_dose",
 *          force_integer: true,
 *          type: "progress-circle",
 *          class: "today_dosing",
 *          put_in: "pump_state_labels",
 *          no_value: true,
 *         },
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//

import { html, TemplateResult, css } from "lit";
import { property } from "lit/decorators.js";

import type { StateObject, ProgressConfig } from "../types/index";

import { SensorTarget } from "./sensor_target";

import style_progress_circle from "./progress_circle.styles";
import { OFF_COLOR } from "../utils/constants";

//----------------------------------------------------------------------------//

export class ProgressCircle extends SensorTarget {
  static override styles = [
    // Include parent styles from SensorTarget/Sensor chain
    ...(Array.isArray(SensorTarget.styles)
      ? SensorTarget.styles
      : [SensorTarget.styles]),
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
  protected override _render(_style: string = ""): TemplateResult {
    if (!this.hasTargetState()) {
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
    const value = this.stateObj.state;
    const target = this.stateObjTarget.state;
    let percent = 100;
    if (parseFloat(value) < parseFloat(target)) {
      percent = Math.floor(
        (Number(this.stateObj.state) * 100) / Number(this.stateObjTarget.state),
      );
    } //if
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
        fill="transparent"
        stroke="rgba(150,150,150,0.6)"
        stroke-width="16px"
      ></circle>
      <circle
        r="90"
        cx="100"
        cy="100"
        stroke="rgb(${this.c})"
        stroke-width="16px"
        stroke-linecap="round"
        stroke-dashoffset="${565 - (percent * 565) / 100}px"
        fill="transparent"
        stroke-dasharray="565.48px"
      ></circle>
      <text
        x="71px"
        y="115px"
        fill="#6bdba7"
        font-size="52px"
        font-weight="bold"
        style="${style} transform:rotate(90deg) translate(0px, -196px)"
      >
        ${percent}
      </text>
    </svg>`;
  }
}
