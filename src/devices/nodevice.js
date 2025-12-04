import { html } from "lit";
import { html } from "lit";
import RSDevice from "./device";
import {config} from "./mapping/NODEVICE";
import styles from "./nodevice.styles";


/*
 * NoDevice
 */
export class NoDevice extends RSDevice{

    static styles = styles;
    device={'elements':[{'model':'NODEVICE','name':''}]};

    constructor(hass,device){
	super(config,hass,device);
    }


    _populate_entities(){
    }
    
    render(){
	return html`
<p id="device_name">${this.config.name}</p>
<div class="device_bg">
<img class="device_img" src="${this.config.background_img}"/>
</div>
`
    }
}

window.customElements.define('no-device', NoDevice);
