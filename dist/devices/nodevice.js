import { html,css } from "../lit-core.min.js";
import RSDevice from "./device.js";
import {config} from "./mapping/NODEVICE.js";


/*
 * RSDose 
 */
export default class NoDevice extends RSDevice{

    constructor(hass){
				var device={'elements':[{'model':'NODEVICE','name':''}]};
				super(hass,device,config);
    }


    _populate_entities(){
    }
    
    render(){
	return html`
<p id="device_name" class="RSDOSE4">${this.conf.name}</p>
<div class="device_bg">
<img src="${this.conf.background_img}"/>
</div>
`
    }
}


/*
 * CSS
 */
export const style_nodevice = css`
`
