import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./rsrun.mapping";

import { dialogs_device } from "../../device.dialogs";
import { dialogs_rsrun } from "./rsrun.dialogs";

import i18n from "../../../translations/myi18n";

import type { PumpEntity } from "../../../types/index";

import style_rsrun from "./rsrun.styles";
import style_common from "../../../utils/common.styles";

export class RSRun extends RSDevice {
  static styles = [style_rsrun, style_common];

  _pumps: PumpEntity[] = [];

  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_device, dialogs_rsrun]);
  }

  device = {
    model: "RSRUN",
    name: "",
    elements: null,
  };

  _populate_entities(): void {
    this.update_config();
    for (const pump_id of [0, 1, 2]) {
      this._pumps.push({ entities: {}, litElement: null });
    }
    if (!this._hass) return;

    for (const entity_id in this._hass.entities) {
      const entity = this._hass.entities[entity_id];
      if (!this.device) continue;

      for (const d of this.device.elements) {
        const fname = d["identifiers"][0][1].split("_");
        let pump_id = 0;
        if (fname[fname.length - 2] === "pump") {
          pump_id = parseInt(fname[fname.length - 1]);
        }
        if (entity.device_id === d.id) {
          const domain = entity_id.split(".")[0];
          if (pump_id === 0) {
            this.entities[entity.translation_key] = entity;
            this.entities[domain + "." + entity.translation_key] = entity;
          } else {
            this._pumps[pump_id].entities[entity.translation_key] = entity;
            this._pumps[pump_id].entities[
              domain + "." + entity.translation_key
            ] = entity;
          }
        }
      }
    }
    console.log("PUMPS", this._pumps);
  }

  _render(style?: any, substyle?: any): TemplateResult {
    const bg_img = this.config.background_img ?? "";
    return html` <div class="device_bg">
      ${style}
      <img
        class="device_img"
        id="rsdevice_img"
        alt=""
        src="${bg_img}"
        style="${substyle}"
      />
      <div>${this._render_pumps(this.is_on())}</div>
      <div>${this._render_elements(this.is_on())}</div>
    </div>`;
  }

  _render_pumps(state: boolean): TemplateResult {
    for (const pump_id of [1, 2]) {
      const pump_type =
        this._hass.states[this._pumps[pump_id].entities["type"].entity_id]
          .state;
      console.log("Pump: ", pump_id, ", type: ", pump_type);
      if (this._pumps[pump_id].litElement === null) {
        const pump = RSDevice.create_device(
          "redsea-rsrun-" + pump_type,
          this._hass,
          null,
          {} as any,
        );
        pump.id = pump_id;
        pump.entities = this._pumps[pump_id].entities;
        // Pass parent-level entities (mode, ec_sensor_connected, …) so
        // child pumps (skimmer) can access them via get_entity()
        pump.parent_entities = this.entities;
        // Pass parent HA device info so pumps can get device_id for service calls
        pump.parent_device = this.device;
        this._pumps[pump_id].litElement = pump;
      } else {
        // Keep parent_entities and parent_device in sync on every hass update
        this._pumps[pump_id].litElement.parent_entities = this.entities;
        this._pumps[pump_id].litElement.parent_device = this.device;
      }
    }

    return html` <div class="pump_0">${this._pumps[1].litElement}</div>
      <div class="pump_1">${this._pumps[2].litElement}</div>`;
  }

  override _setting_hass(obj): void {
    super._setting_hass(obj);
    // Propagate hass to pump litElements via _setting_hass() directly —
    // bypasses the Lit property setter so no requestUpdate() is triggered
    // on the pump, which would restart the FlowImage CSS animation.
    for (const pump of this._pumps) {
      if (pump?.litElement?._setting_hass) {
        pump.litElement._setting_hass(obj);
      }
    }
  }

  override renderEditor(): TemplateResult {
    if (this.is_disabled()) {
      return html``;
    }
    this._populate_entities();
    this.update_config();
    return html` <form>${this._editor_common()}</form>`;
  }
}
