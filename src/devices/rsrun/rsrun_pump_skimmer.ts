import { html, TemplateResult } from "lit";
import { RSPump } from "./rsrun_pump";

import { config } from "./rsrun_pump_skimmer.mapping";

export class RSSkimmer extends RSPump {
  constructor() {
    super();
    this.initial_config = config;
  }

  override _render(style?: any, substyle?: any): TemplateResult {
    const bg_img = this.config.background_img ?? "";
    return html`
      <div>
        ${this._render_elements(this.is_on(), "cables_" + this.id.toString())}
      </div>
      <img class="device_img" alt="" src="${bg_img}" />
    `;
  }
}
