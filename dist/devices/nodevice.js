import { html,css } from "../../lit-core.min.js";

/*
 * RSDose 
 */
export default class NoDevice {

    constructor(){
	this.device = null;
	this.model="";
	this.name="";
    }

    get_img(){
	      return "/local/community/ha-reef-card/devices/nodevice/img/logo-redsea.jpg";
    }

    get_model(){
	      return this.model;
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
