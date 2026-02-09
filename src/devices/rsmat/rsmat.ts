import { html } from "lit";
import { RSDevice } from "../device";
import { config } from "./rsmat.mapping";

export class RSMat extends RSDevice {
  
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    'model': 'RSMAT',
    'name': '',
    'elements': null
  };

  _render() {
    return html`
             	<div class="device_bg">
          	  <img class="device_img" id="rsmat_img" alt=""  src='${this.config.background_img}' />
                 ${this._render_elements(this.is_on())}
               </div>`;
  }

  override renderEditor(): TemplateResult {
    return html``;
  }
}
