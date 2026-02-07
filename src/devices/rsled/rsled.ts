import { html } from "lit";
import { RSDevice } from "../device";
import { config } from "./rsled.mapping";

export class RSLed extends RSDevice {
  
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    'model': 'RSLED',
    'name': '',
    'elements': null
  };

  _render() {
    this.update_config();
    return html`
             	<div class="device_bg">
          	  <img class="device_img" id="rsled_img" alt=""  src='${this.config.background_img}' />
                 ${this._render_elements(this.is_on())}
               </div>`;
  }
}
