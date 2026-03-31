import { html, TemplateResult } from "lit";
import { RSPump } from "./rsrun_pump";

import { config } from "./rsrun_pump_return.mapping";

export class RSReturn extends RSPump {
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
      <img class="device_img" alt="" src="${bg_img}" style="${substyle}" />
      <div>${this._render_elements(this.is_on())}</div>
      <div>
        ${this._render_elements(this.is_on(), "ctrl_" + this.id.toString())}
      </div>
    `;
  }
}
