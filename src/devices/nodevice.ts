// @ts-nocheck
import { html } from "lit";
import {RSDevice} from "./device";
import {config} from "./mapping/NODEVICE";
import styles from "./nodevice.styles";

export class NoDevice extends RSDevice{

    static styles = styles;
    device={'elements':[{'model':'NODEVICE','name':''}]};

    constructor(){
	super();
      this.initial_config=config;
    }

    _populate_entities(){
    }
    
    render(){
	this.update_config();
	return html`
                     <p id="device_name">${this.config.name}</p>
                     <div class="device_bg">
                       <img class="device_img" src="${this.config.background_img}"/>
                     </div>
                     `;
    }
}

