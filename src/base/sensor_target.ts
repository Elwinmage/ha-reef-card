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
   * Override hass setter to also update stateObjTarget and re-render
   * on attribute changes when value_attribute / target_attribute is used
   * (button-like entities whose `state` never changes).
   */
  override set hass(obj: HassConfig) {
    super.hass = obj;

    // Update stateObjTarget if it exists
    if (this.stateObjTarget && this.conf && "target" in this.conf) {
      const sot = obj.states[this.stateObjTarget.entity_id];
      if (sot && this.stateObjTarget.state !== sot.state) {
        this.stateObjTarget = sot;
        this.requestUpdate();
      }
    }

    // Attribute-based tracking: refresh stateObj and re-render when the
    // tracked attributes change, since super.hass only reacts to state changes.
    const valAttr = (this.conf as any)?.value_attribute;
    const tgtAttr = (this.conf as any)?.target_attribute;
    if ((valAttr || tgtAttr) && this.stateObj) {
      const so = obj.states[this.stateObj.entity_id];
      if (so) {
        const prevAttrs = this.stateObj.attributes ?? {};
        const nextAttrs = so.attributes ?? {};
        const changed =
          (valAttr && prevAttrs[valAttr] !== nextAttrs[valAttr]) ||
          (tgtAttr && prevAttrs[tgtAttr] !== nextAttrs[tgtAttr]);
        if (changed) {
          this.stateObj = so;
          this.requestUpdate();
        }
      }
    }
  }

  /**
   * Get numeric value.
   * If conf.value_attribute is set, read from stateObj.attributes[value_attribute]
   * instead of stateObj.state. Useful for entities whose numeric progress lives
   * in an attribute (e.g. button.*.days_left).
   */
  protected getValue(): number {
    const attrKey = (this.conf as any)?.value_attribute;
    if (attrKey && this.stateObj) {
      const raw = this.stateObj.attributes?.[attrKey];
      return parseFloat(String(raw ?? "0")) || 0;
    }
    return parseFloat(this.stateObj?.state || "0") || 0;
  }

  /**
   * Get numeric target value.
   *
   * Resolution order, most specific first:
   *   1. conf.target_attribute -> stateObj.attributes[target_attribute]
   *   2. conf.target as a number -> that literal value (no entity involved)
   *   3. stateObjTarget.state -> the sibling entity named by conf.target
   *
   * Case 2 covers targets that are a property of the installation rather than
   * of the device: a container size, a tank volume, a maintenance interval the
   * device does not expose. Writing it inline avoids creating a template
   * sensor in Home Assistant whose only job is to hold a constant.
   */
  protected getTargetValue(): number {
    return this.getRawTargetValue() * this.getTargetFactor();
  }

  /**
   * Multiplier applied to the resolved target so value and target can live in
   * different units without a template sensor in Home Assistant. The RO
   * reservoir reports volume_left in mL while ato_tank_volume is in L, hence
   * target_factor: 1000.
   */
  protected getTargetFactor(): number {
    const factor = (this.conf as any)?.target_factor;
    return typeof factor === "number" && factor !== 0 ? factor : 1;
  }

  /** Target before any unit conversion. */
  protected getRawTargetValue(): number {
    const attrKey = (this.conf as any)?.target_attribute;
    if (attrKey && this.stateObj) {
      const raw = this.stateObj.attributes?.[attrKey];
      return parseFloat(String(raw ?? "0")) || 0;
    }
    if (typeof this.conf?.target === "number") {
      return this.conf.target;
    }
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
   * Check if a target reference is available.
   * True when stateObjTarget is set, OR when conf.target_attribute is used
   * (in which case the target lives in stateObj's attributes).
   */
  protected hasTargetState(): boolean {
    if (!this.stateObj) return false;
    if ((this.conf as any)?.target_attribute) return true;
    // A literal numeric target needs no entity to resolve
    if (typeof this.conf?.target === "number") return true;
    return !!this.stateObjTarget;
  }

  /**
   * Render
   * @param _style: unused
   */
  protected override _render(_style?: string): TemplateResult {
    if (!this.hasTargetState()) {
      return html`<div class="error">Missing state</div>`;
    }

    let value = this.getValue();
    let target = this.getTargetValue();
    if (this.conf.force_integer) {
      value = Math.floor(value);
      target = Math.floor(target);
    }
    const rounded_value = this.apply_round(value);
    const rounded_target = this.apply_round(target);

    //eval de unit
    const unit = this.evaluate(
      this.conf?.unit || this.stateObj.attributes?.unit_of_measurement || "",
    );

    const sclass = this.conf?.class || "sensor";

    const style = this.get_style("css");
    const _bgColor = `rgba(${this.c},${this.alpha})`;
    const text_color = this.resolve_text_color();

    return html`
      <div
        class="${sclass}"
        id="${this.conf.name}"
        style="${style}${text_color ? `;color:${text_color}` : ""}"
      >
        ${rounded_value}/${rounded_target}<span class="unit">${unit}</span>
      </div>
    `;
  }

  protected override _load_subelements() {
    // Only a string target names an entity; a number is the value itself
    if (typeof this.conf?.target === "string" && this.device) {
      const targetEntity = this.device.entities[this.conf.target];
      if (targetEntity) {
        this.stateObjTarget = this._hass.states[targetEntity.entity_id] || null;
      }
    }
  }
}
