import { html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

import {RSDevice} from "./device";
import style_nodevice from "./nodevice.styles";

import {config} from "./mapping/NODEVICE";

// @ts-expect-error - Class extends RSDevice compatibility
export class NoDevice extends RSDevice {
  static override styles = [style_nodevice];

  //device={'elements':[{'model':'NODEVICE','name':''}]};
  device={'model':'NODEVICE','name':'','elements':null};

  constructor(){
    super();
    this.initial_config=config;
  }

    _populate_entities(){
    }  

  protected override _render() {

	this.update_config();
	return html`
                     <p id="device_name">${this.config.name}</p>
                     <div class="device_bg">
                       <img class="device_img" src="${this.config.background_img}"/>
                     </div>
                     `;
  }
}
