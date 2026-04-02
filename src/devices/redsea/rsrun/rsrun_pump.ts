import { html } from "lit";
import { RSDevice } from "../../device";

import { config } from "./rsrun_pump.mapping";

import type { PumpEntity } from "../../../types/index";

export class RSPump extends RSDevice {
  protected;
  id: 1 | 2;

  override _render(style?: any, substyle?: any): TemplateResult {
    console.log("***Render UNKNOWN");
    return html``;
  }

  constructor() {
    super();
    this.initial_config = config;
  }

  // Only check the parent device_state for masterOn.
  // schedule_enabled is handled separately by each pump's render
  // (greyscale without blocking clicks).
  override is_on(): boolean {
    if (!this._hass || !this.parent_entities["device_state"]) return false;
    return (
      this._hass.states[this.parent_entities["device_state"].entity_id]
        ?.state !== "off"
    );
  }

  // True when this individual pump is active (schedule on + device on)
  is_pump_on(): boolean {
    if (!this.is_on()) return false;
    const sched = this.get_entity("schedule_enabled");
    return !sched || sched.state !== "off";
  }

  // Re-render when state, schedule_enabled, speed or parent device_state changes
  override _setting_hass(obj): void {
    const stateEntity = this.entities["state"];
    const scheduleEntity = this.entities["schedule_enabled"];
    const speedEntity = this.entities["speed"];
    // device_state lives on the parent, track it to grey-out pumps
    const deviceStateEntity = this.parent_entities?.["device_state"];

    const prevState = stateEntity
      ? this._hass?.states[stateEntity.entity_id]?.state
      : undefined;
    const prevSchedule = scheduleEntity
      ? this._hass?.states[scheduleEntity.entity_id]?.state
      : undefined;
    const prevSpeed = speedEntity
      ? this._hass?.states[speedEntity.entity_id]?.state
      : undefined;
    const prevDeviceState = deviceStateEntity
      ? this._hass?.states[deviceStateEntity.entity_id]?.state
      : undefined;

    super._setting_hass(obj);

    const newState = stateEntity
      ? obj.states[stateEntity.entity_id]?.state
      : undefined;
    const newSchedule = scheduleEntity
      ? obj.states[scheduleEntity.entity_id]?.state
      : undefined;
    const newSpeed = speedEntity
      ? obj.states[speedEntity.entity_id]?.state
      : undefined;
    const newDeviceState = deviceStateEntity
      ? obj.states[deviceStateEntity.entity_id]?.state
      : undefined;

    if (
      newState !== prevState ||
      newSchedule !== prevSchedule ||
      newSpeed !== prevSpeed ||
      newDeviceState !== prevDeviceState
    ) {
      this.to_render = true;
      if (newSchedule !== prevSchedule || newSpeed !== prevSpeed) {
        const elt = this._elements["sensor_controlled_in"];
        if (elt) elt.requestUpdate();
      }
    }
  }

  // Override get_entity to also look in parent_entities (e.g. mode,
  // ec_sensor_connected) which live on the RSRun parent device, not on
  // the individual pump.
  override get_entity(entity_translation_value: string): any {
    const own = super.get_entity(entity_translation_value);
    if (own !== null) return own;

    // Fallback: look in parent_entities
    if (!this._hass || !this.parent_entities) return null;
    const entity = this.parent_entities[entity_translation_value];
    if (!entity) return null;
    return this._hass.states[entity.entity_id] ?? null;
  }

  _render_disabled(substyle = null) {
    return {
      reason: null,
      substyle: substyle,
      maintenance_element: null,
    };
  }

  override _populate_entities() {}
}
