import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./rspower6.mapping";
import { config2 } from "./rspower8.mapping";

// TODO : Implement RSPOWER support
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/97
// labels: enhancement, rspower
export class RSPower extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
  }

  // override _render(style?: any, substyle?: any) {
  //   return html` <div class="device_bg">
  //     ${style}
  //     <img
  //       class="device_img"
  //       id="rspower6_img"
  //       alt=""
  //       src="${this.config.background_img}"
  //       style="${substyle}"
  //     />
  //     <div>${this._render_elements(this.is_on())}</div>
  //   </div>`;
  // } // end of function render

  override renderEditor(): TemplateResult {
    return html``;
  }
}

export class RSPower6 extends RSPower {}

class RSPowerEN extends RSPower {
  constructor() {
    super();
    this.initial_config = config2;
  } // end of constructor

  // override _render(style?: any, substyle?: any) {
  //   return html` <div class="device_bg">
  //     ${style}
  //     <img
  //       class="device_img"
  //       id="rspower6_img"
  //       alt=""
  //       src="${this.config.background_img}"
  //       style="${substyle}"
  //     />
  //     <div>${this._render_elements(this.is_on())}</div>
  //   </div>`;
  // } // end of function render
}

export class RSPower8 extends RSPowerEN {}
