import { html } from "lit";
import { RSDevice } from "../device";
import { config } from "./rswave.mapping";

export class RSWave extends RSDevice {
  
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    'model': 'RSWAVE',
    'name': '',
    'elements': null
  };

  _render() {
    this.update_config();
     return html`
             	<div class="device_bg">
          	  <img class="device_img" id="rsdose4_img" alt=""  src='${this.config.background_img}' />
                 ${this._render_elements(this.is_on())}
</div>`;
    }
}
