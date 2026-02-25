/**
 * Implement a sensor target element
 * Exemple: {
 *          name: "auto_dosed_today",
 *          target: "daily_dose",
 *          force_integer: true,
 *          put_in: "pump_state_labels",
 *          class: "scheduler_label_middle",
 *          type: "common-sensor-target",
 *          css: {
 *            "text-align": "center",
 *            color: "white",
 *            "grid-column": "1",
 *            "grid-row": "2",
 *            "font-weight": "bold",
 *            "font-size": "1.2em",
 *            "margin-top": "-20%",
 *          },
 *        }
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, TemplateResult } from "lit";
import { property } from "lit/decorators.js";

import type { StateObject, HassConfig } from "../types/index";

import { Sensor } from "./sensor";

import style_sensor_target from "./sensor_target.styles";

//----------------------------------------------------------------------------//

export class SensorTarget extends Sensor {
  static override styles = [style_sensor_target];

  // Public reactive property
  @property({ type: Object })
  stateObjTarget: StateObject | null = null;

  /**
   * Constructor
   */
  constructor() {
    super();
    this.stateObjTarget = null;
  }

  /**
   * Override hass setter to also update stateObjTarget
   */
  override set hass(obj: HassConfig) {
    super.hass = obj;

    // Update stateObjTarget if it exists
    if (this.stateObjTarget && this.conf && "target" in this.conf) {
      const sot = obj.states[this.stateObjTarget.entity_id];
      if (sot && this.stateObjTarget.state !== sot.state) {
        this.stateObjTarget = sot || null;
        this.requestUpdate();
      }
    }
  }

  /**
   * Get numeric value from state object
   */
  protected getValue(): number {
    return parseFloat(this.stateObj?.state || "0") || 0;
  }

  /**
   * Get numeric target value from target state object
   */
  protected getTargetValue(): number {
    return parseFloat(this.stateObjTarget?.state || "0") || 0;
  }

  /**
   * Calculate percentage (value / target * 100)
   */
  protected getPercentage(): number {
    const value = this.getValue();
    const target = this.getTargetValue() || 1; // Avoid division by zero
    return Math.floor((value * 100) / target);
  }

  /**
   * Check if both state objects are available
   */
  protected hasTargetState(): boolean {
    return !!(this.stateObj && this.stateObjTarget);
  }

  /**
   * Render
   * @param _style: unused
   */
  protected override _render(_style: string = ""): TemplateResult {
    if (!this.hasTargetState()) {
      return html`<div class="error">Missing state</div>`;
    }

    let value = this.getValue();
    let target = this.getTargetValue();
    if (this.conf.force_integer) {
      value = Math.floor(value);
      target = Math.floor(target);
    }

    //eval de unit
    const unit = this.evaluate(
      this.conf?.unit || this.stateObj.attributes?.unit_of_measurement || "",
    );

    const sclass = this.conf?.class || "sensor";

    const style = this.get_style("css");
    const _bgColor = `rgba(${this.c},${this.alpha})`;

    return html`
      <div class="${sclass}" id="${this.conf.name}" style="${style}">
        ${value}/${target}<span class="unit">${unit}</span>
      </div>
    `;
  }

  protected override _load_subelements() {
    if (this.conf?.target && this.device) {
      const targetEntity = this.device.entities[this.conf.target];
      if (targetEntity) {
        this.stateObjTarget = this._hass.states[targetEntity.entity_id] || null;
      }
    }
  }
}
