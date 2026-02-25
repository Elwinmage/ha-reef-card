import { html, TemplateResult } from "lit";
import { RSDevice } from "../device";
import { config } from "./rsmat.mapping";

import { dialogs_device } from "../device.dialogs";

import i18n from "../../translations/myi18n";

// TODO : Implement RSMAT support
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/5
// labels: enhancement, rsmat
export class RSMat extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_device]);
  }

  device = {
    model: "RSMAT",
    name: "",
    elements: null,
  };

  _render(style = null, substyle = null) {
    //position
    const position = "";
    //    position="transform:scaleX(-1)";
    return html` <div class="device_bg" style="${position}">
      ${style}
      <img
        class="device_img"
        id="rsdevice_img"
        alt=""
        src="${this.config.background_img}"
        style="${substyle}"
      />

      <div
        id="banner"
        style="background-color:rgba(135,135,135,0.7);position:absolute;top:0%;width:100%;height: 100%;text-align:center;"
      >
        <div style="background-color:rgba(255,255,255,0.7);border-radius:30px">
          <h1 style="color:red;">${i18n._("in_dev")}</h1>
        </div>
        <div>${this._render_elements(this.is_on())}</div>
      </div>
    </div>`;
  }

  override renderEditor(): TemplateResult {
    return html``;
  }
}
