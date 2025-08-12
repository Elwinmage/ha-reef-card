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
	//constructor(){
	//var device={'elements':[{'model':'NODEVICE','name':''}]};
	//super(hass,device,config);
	super(config,hass,device);
    }


    _populate_entities(){
    }
    
    render(){
	console.log("pppppp");
	console.log(this.hass);
	console.log(this.device);
	console.log("pppppp");
	return html`
<p id="device_name">${this.config.name}</p>
<div class="device_bg">
<img class="device_img" src="${this.config.background_img}"/>
</div>
`
    }
}

window.customElements.define('no-device', NoDevice);
