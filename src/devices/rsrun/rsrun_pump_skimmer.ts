import { html, TemplateResult } from "lit";
import { RSPump } from "./rsrun_pump";

import { config } from "./rsrun_pump_skimmer.mapping";

export class RSSkimmer extends RSPump {
  constructor() {
    super();
    this.initial_config = config;
  }

  // Re-render when state, schedule_enabled or speed changes
  override _setting_hass(obj): void {
    const stateEntity = this.entities["state"];
    const scheduleEntity = this.entities["schedule_enabled"];
    const speedEntity = this.entities["speed"];

    const prevState = stateEntity
      ? this._hass?.states[stateEntity.entity_id]?.state
      : undefined;
    const prevSchedule = scheduleEntity
      ? this._hass?.states[scheduleEntity.entity_id]?.state
      : undefined;
    const prevSpeed = speedEntity
      ? this._hass?.states[speedEntity.entity_id]?.state
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

    if (
      newState !== prevState ||
      newSchedule !== prevSchedule ||
      newSpeed !== prevSpeed
    ) {
      this.to_render = true;
      // Force re-evaluation of disabled_if on sensor_controlled_in
      if (newSchedule !== prevSchedule || newSpeed !== prevSpeed) {
        const elt = this._elements["sensor_controlled_in"];
        if (elt) elt.requestUpdate();
      }
    }
  }

  override _render(style?: any, substyle?: any): TemplateResult {
    const stateVal = this.get_entity("state")?.state ?? "";
    const scheduleVal = this.get_entity("schedule_enabled")?.state ?? "off";

    // off: schedule disabled OR device off
    const isOff = scheduleVal === "off" || stateVal === "off";

    let bg_img: string;
    if (isOff) {
      bg_img = this.config.state_background_imgs.off.toString();
    } else if (stateVal === "full-cup") {
      bg_img = this.config.state_background_imgs.full.toString();
    } else {
      bg_img = this.config.state_background_imgs.on.toString();
    }

    return html`
      <div>
        ${this._render_elements(this.is_on(), "cables_" + this.id.toString())}
        ${this._render_elements(this.is_on(), "sensor")}
        <img class="device_img" alt="" src="${bg_img}" />
        ${this._render_elements(this.is_on(), "sensor_in")}
      </div>
    `;
  }
}
