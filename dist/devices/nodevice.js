import { html,css } from "../lit-core.min.js";
import RSDevice from "./device.js";

/*
 * RSDose 
 */
export default class NoDevice extends RSDevice{

    constructor(hass){
	var device={'elements':[{'model':'NODEVICE','name':''}]}
	super(hass,device);
    }


    _populate_entities(){
    }
    
    render(){
	return html`
<p id="device_name" class="RSDOSE4">${this.name}</p>
<div class="device_bg">
<img src="${this.get_img()}"/>
</div>
`
    }
}


/*
 * CSS
 */
export const style_nodevice = css`
`
