import { html } from "lit";
import { RSDevice } from "../device";
import { config } from "./rsrun.mapping";

export class RSRun extends RSDevice {
  
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    'model': 'RSRUN',
    'name': '',
    'elements': null
  };

  _render() {
    this.update_config();
     return html`
             	<div class="device_bg">
          	  <img class="device_img" id="rsrun_img" alt=""  src='${this.config.background_img}' />
                 ${this._render_elements(this.is_on())}
</div>`;
    }
}
