import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./rsato.mapping";
import { dialogs_device } from "../../device.dialogs";
import { dialogs_rsato } from "./rsato.dialogs";

export class RSAto extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_device, dialogs_rsato]);
  }

  device = {
    model: "RSATO",
    name: "",
    elements: null,
  };

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
      <div>${this._render_elements(this.is_on())}</div>
    </div>`;
  }

  override renderEditor(): TemplateResult {
    return html``;
  }
}
