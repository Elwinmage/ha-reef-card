import { html, TemplateResult } from "lit";
import { RSPump } from "./rsrun_pump";

import { config } from "./rsrun_pump_return.mapping";

import { dialogs_rsrun_pump_return } from "./rsrun_pump_return.dialogs";

export class RSReturn extends RSPump {
  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_rsrun_pump_return]);
  }

  override _render(style?: any, substyle?: any): TemplateResult {
    const bg_img = this.config.background_img ?? "";
    const pumpOn = this.is_pump_on();
    const off_style = !pumpOn
      ? html`<style>
          img {
            filter: grayscale(90%);
          }
        </style>`
      : html``;
    return html`
      <div>
        ${this._render_elements(pumpOn, "cables_" + this.id.toString())}
      </div>
      ${off_style}
      <img class="device_img" alt="" src="${bg_img}" style="${substyle}" />
      <div>${this._render_elements(pumpOn)}</div>
      <div>${this._render_elements(pumpOn, "ctrl_" + this.id.toString())}</div>
    `;
  }
}
