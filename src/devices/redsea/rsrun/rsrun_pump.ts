import { html } from "lit";
import { RSDevice } from "../../device";

import { config } from "./rsrun_pump.mapping";
import { dialogs_rsrun_pump } from "./rsrun_pump.dialogs";

import type { PumpEntity } from "../../../types/index";

export class RSPump extends RSDevice {
  protected;
  id: 1 | 2;

  /** Set by the parent RSRun from the card editor configuration */
  show_add_pump: boolean = true;

  /**
   * Render a not-yet-configured pump slot.
   *
   * Nothing is drawn unless a pump is really plugged in, so an empty ReefRun
   * socket stays empty instead of inviting the user to configure thin air.
   * @return the add-pump placeholder, or an empty template
   */
  override _render(style?: any, substyle?: any): TemplateResult {
    if (!this.show_add_pump || !this.is_connected_pump()) {
      return html``;
    }
    return html`<div class="device_bg">
      ${style}
      <div>${this._render_elements(this.is_on())}</div>
    </div>`;
  }

  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_rsrun_pump]);
  }

  /**
   * True while the ReefRun has not been told what this pump is.
   * @return true when /dashboard reports type "unknown"
   */
  is_unknown(): boolean {
    const type = this.get_entity("type")?.state;
    return !type || type === "unknown";
  }

  /**
   * True when a pump is physically plugged into an unconfigured slot.
   *
   * An unknown slot reports missing_pump false whether a pump is connected or
   * not, so `temperature` is the only discriminator: it stays at 0 on an empty
   * socket and reads the real probe value as soon as a pump is plugged in.
   * @return true when hardware is detected on this slot
   */
  is_connected_pump(): boolean {
    const raw = this.get_entity("temperature")?.state;
    const temperature = Number(raw);
    return raw !== undefined && !isNaN(temperature) && temperature !== 0;
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

  /**
   * Interpret a Home Assistant boolean-ish value.
   * Covers binary_sensor states ("on"/"off"), raw JSON booleans and the
   * string forms the ReefBeat API sometimes returns ("true"/"false").
   * @param value: the raw state or attribute value
   * @return true only for an explicitly positive value
   */
  private static _is_true(value: unknown): boolean {
    if (value === true) return true;
    if (typeof value === "number") return value === 1;
    if (typeof value !== "string") return false;
    const v = value.trim().toLowerCase();
    return v === "on" || v === "true" || v === "1" || v === "yes";
  }

  /**
   * True when the ReefRun reports this pump as disconnected.
   *
   * The value comes from `missing_pump` in the /dashboard payload. It is read
   * from the dedicated entity when the integration exposes one, and falls back
   * to a `missing_pump` attribute carried by the pump `state` sensor.
   * @return true when the pump is physically missing
   */
  is_missing(): boolean {
    const entity = this.get_entity("missing_pump");
    if (entity?.state !== undefined) {
      return RSPump._is_true(entity.state);
    }
    const attr = this.get_entity("state")?.attributes?.["missing_pump"];
    if (attr !== undefined) {
      return RSPump._is_true(attr);
    }
    return false;
  }

  // Re-render when state, schedule_enabled, speed, missing_pump or parent
  // device_state changes
  override _setting_hass(obj): void {
    const stateEntity = this.entities["state"];
    const scheduleEntity = this.entities["schedule_enabled"];
    const speedEntity = this.entities["speed"];
    const missingEntity = this.entities["missing_pump"];
    // type/temperature drive the not-yet-configured placeholder
    const typeEntity = this.entities["type"];
    const temperatureEntity = this.entities["temperature"];
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
    const prevMissing = missingEntity
      ? this._hass?.states[missingEntity.entity_id]?.state
      : this._hass?.states[stateEntity?.entity_id]?.attributes?.[
          "missing_pump"
        ];

    const prevType = typeEntity
      ? this._hass?.states[typeEntity.entity_id]?.state
      : undefined;
    const prevTemperature = temperatureEntity
      ? this._hass?.states[temperatureEntity.entity_id]?.state
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
    const newMissing = missingEntity
      ? obj.states[missingEntity.entity_id]?.state
      : obj.states[stateEntity?.entity_id]?.attributes?.["missing_pump"];
    const newType = typeEntity
      ? obj.states[typeEntity.entity_id]?.state
      : undefined;
    const newTemperature = temperatureEntity
      ? obj.states[temperatureEntity.entity_id]?.state
      : undefined;

    if (
      newState !== prevState ||
      newSchedule !== prevSchedule ||
      newSpeed !== prevSpeed ||
      newDeviceState !== prevDeviceState ||
      newMissing !== prevMissing ||
      newType !== prevType ||
      newTemperature !== prevTemperature
    ) {
      this.to_render = true;
      if (newSchedule !== prevSchedule || newSpeed !== prevSpeed) {
        const elt = this._elements["sensor_controlled_in"];
        if (elt) elt.requestUpdate();
      }
      if (newMissing !== prevMissing) {
        // Elements whose class is an expression (blinking cables) are not
        // bound to a state that changed, so refresh them explicitly.
        for (const key in this._elements) {
          const elt = this._elements[key];
          if (
            typeof elt?.conf?.class === "string" &&
            elt.conf.class.includes("${")
          ) {
            elt.requestUpdate();
          }
        }
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
