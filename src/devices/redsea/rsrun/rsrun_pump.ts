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
