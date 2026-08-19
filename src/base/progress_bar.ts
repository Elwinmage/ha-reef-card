/**
 * Implement a progress bar
 *
 * Examples:
 *
 * 1) Classic state/target-based bar:
 *   {
 *     name: "container_volume",
 *     target: "save_initial_container_volume",
 *     type: "progress-bar",
 *     class: "pg-container",
 *     label: " ${entity.remaining_days.state} ${i18n._('days_left')}",
 *   }
 *
 * 2) Attribute-based bar (e.g. RSMAT scheduled maintenance button whose state
 *    is "unknown" but which exposes `interval_days` and `days_left` attributes):
 *   {
 *     name: "replace_activated_carbon",
 *     type: "progress-bar",
 *     value_attribute: "days_left",
 *     target_attribute: "interval_days",
 *     inverted: true, // days_left decreases → we want % elapsed
 *     colors: {
 *       background: "black",
 *       fill: "brown",
 *     },
 *     label: "${entity.replace_activated_carbon.attributes.days_left} d left",
 *   }
 *
 * 3) Fixed target, no target entity (e.g. a 5 L container the device does not
 *    report):
 *   {
 *     name: "container_volume",
 *     target: 5000,
 *     type: "progress-bar",
 *     unit: "ml",
 *     label: "${entity.container_volume.state} / 5000 ml",
 *   }
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, TemplateResult, css, CSSResult } from "lit";
import { property } from "lit/decorators.js";

import type { ProgressConfig } from "../types/index";
import { SensorTarget } from "./sensor_target";

import style_progress_bar from "./progress_bar.styles";
import style_animations from "../utils/animations.styles";
import { OFF_COLOR } from "../utils/constants";

//----------------------------------------------------------------------------//

export class ProgressBar extends SensorTarget {
  static override styles = [
    style_animations,
    // SensorTarget.styles is always defined as an array
    ...(SensorTarget.styles as CSSResult[]),
    // Add ProgressBar-specific styles
    style_progress_bar,
    css`
      .progress-bar-container {
        background-color: var(--progress-bg-color, rgba(0, 0, 0, 0.8));
      }
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
   * Name used in console diagnostics. Subclasses override it so a warning
   * points at the element the mapping actually declared.
   */
  protected logName = "ProgressBar";

  /**
   * Set this.c from the DEVICE state (not stateObj state): progress entities
   * hold numbers, not on/off states, so the greying must follow the device.
   * Extracted so subclasses (water-level) share the exact same rule.
   */
  protected applyStateColor(): void {
    if (!this.device.is_on()) {
      this.c = OFF_COLOR;
    } else {
      this.c = this.color;
    }
  }

  /**
   * Percentage to render, clamped to [0, 100], with `inverted` applied.
   * Out-of-range raw ratios are logged before clamping so a mis-configured
   * target stays visible in the console.
   * Extracted so subclasses share the value_attribute / target_attribute /
   * literal-target resolution without duplicating the clamping rules.
   */
  protected resolveDisplayPercent(): number {
    const value = this.getValue();
    const target = this.getTargetValue() || 1;
    let percent = this.getPercentage();
    if (this.conf?.inverted) {
      percent = 100 - percent;
    }
    if (percent > 100 || percent < 0) {
      console.error(
        `[${this.logName} - ${this.conf?.name}] out-of-range percent : ${percent}=${value}*100/${target} (inverted=${!!this.conf?.inverted})`,
      );
    }
    return Math.min(100, Math.max(0, percent));
  }

  /**
   * Progression colour. colors.fill wins over device/OFF colours when set
   * (explicit user intent).
   */
  protected resolveFillColor(): string {
    return this.conf?.colors?.fill ?? `rgb(${this.c})`;
  }

  /**
   * Render
   * @param _style: No used here
   */
  protected override _render(_style?: string): TemplateResult {
    if (!this.hasTargetState()) {
      // Diagnostic: help the user figure out what's missing.
      // When hasTargetState() is false, either stateObj is null or
      // stateObjTarget is null (target_attribute always resolves given stateObj).
      const why = !this.stateObj
        ? `stateObj not resolved for name="${this.conf?.name}" — check the entity's translation_key matches (device.entities keys)`
        : `stateObjTarget not resolved for target="${(this.conf as any)?.target}" — use a number for a fixed target, or target_attribute if it lives in the entity's attributes`;
      console.warn(`[ProgressBar - ${this.conf?.name}] Missing state: ${why}`);
      return html`<div class="error">Missing state</div>`;
    }

    this.applyStateColor();

    // Compute value/target via SensorTarget helpers so value_attribute /
    // target_attribute are honoured transparently.
    const displayPercent = this.resolveDisplayPercent();

    const bar_class = this.conf?.class || "progress-bar";
    let label = this.label || "";
    if (typeof this.conf.label !== "boolean") {
      label = this.evaluate(this.conf.label) || "";
    }
    // Optional user unit, evaluated so `${i18n._('days')}` works.
    // Rendered next to the label — the percent value keeps its "%" suffix.
    const userUnit = this.conf?.unit ? this.evaluate(this.conf.unit) || "" : "";
    const percentUnit = "%";

    const fill = Math.max(0, displayPercent - 1);

    // Color overrides — device color remains the default fill.
    const fillColor = this.resolveFillColor();
    const bgColor = this.conf?.colors?.background;
    const containerStyle = bgColor ? `--progress-bg-color: ${bgColor};` : "";

    return html`
      <div class="${bar_class}">
        <div class="progress-bar-container" style="${containerStyle}">
          <div
            class="progress-bar-fill"
            style="width: ${fill}%; --progress-fill-color: ${fillColor}"
          ></div>
        </div>
        ${label
          ? html`<span class="progress-label"
              >${label}${userUnit
                ? html`<span class="unit">${userUnit}</span>`
                : ""}</span
            >`
          : ""}
        <span class="progress-value">${displayPercent}${percentUnit}</span>
      </div>
    `;
  }
}
