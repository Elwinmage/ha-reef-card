import { html } from "lit";
import { RSDevice } from "../device";

import { config } from "./rsrun_pump.mapping";

import type { PumpEntity } from "../../types/index";

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

  _render_disabled(substyle = null) {
    return {
      reason: null,
      substyle: substyle,
      maintenance_element: null,
    };
  }

  override _populate_entities() {}
}
