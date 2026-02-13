/**
 * Implement a progress bar
 * Exemple:{
 *           name: "container_volume", // =>  the hass entity translation_key for the current value
 *           target: "save_initial_container_volume",// =>  the hass entity translation_key for the target value
 *           type: "progress-bar",
 *           class: "pg-container",
 *           label: " ${entity.remaining_days.state} ${i18n._('days_left')}",
 *           disabled_if:
 *             "${entity.slm.state}=='off' || ${entity.daily_dose.state}==0",
 *           css: {
 *             position: "absolute",
 *             transform: "rotate(-90deg)",
 *             top: "69%",
 *             left: "-60%",
 *             width: "140%",
 *           },
 *         }
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, TemplateResult, css } from "lit";
import { property } from "lit/decorators.js";

import type { ProgressConfig, StateObject } from "../types/index";
import { SensorTarget } from "./sensor_target";

import style_progress_bar from "./progress_bar.styles";
import { OFF_COLOR } from "../utils/constants";

//----------------------------------------------------------------------------//

export class ProgressBar extends SensorTarget {
  static override styles = [
    // Include parent styles from SensorTarget/Sensor chain
    ...(Array.isArray(SensorTarget.styles)
      ? SensorTarget.styles
      : [SensorTarget.styles]),
    // Add ProgressBar-specific styles
    style_progress_bar,
    css`
      .progress-bar-fill {
        background-color: var(--progress-fill-color);
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
    // ProgressBar entities are numbers, not on/off states
    // So we check if the DEVICE is on, not if the progress value is "on"
    if (!this.device.is_on()) {
      this.c = OFF_COLOR;
    } else {
      this.c = this.color;
    }

    const percent = this.getPercentage();
    if (percent > 100) {
      console.error(
        `[ProgressBar - ${this.conf.name}] bad percent value  : ${percent}=${value}*100/${target}`,
      );
    }

    const bar_class = this.conf?.class || "progress-bar";
    let label = this.label || "";
    if (typeof this.conf.label !== "boolean") {
      label = this.evaluate(this.conf.label) || "";
    }
    const unit = "%";

    const fill = Math.max(0, percent - 1);
    const fillColor = `rgb(${this.c})`;

    return html`
      <div class="${bar_class}">
        <div class="progress-bar-container">
          <div
            class="progress-bar-fill"
            style="width: ${fill}%; --progress-fill-color: ${fillColor}"
          ></div>
        </div>
        ${label ? html`<span class="progress-label">${label}</span>` : ""}
        <span class="progress-value">${percent}${unit}</span>
      </div>
    `;
  }
}
