import { html,css } from "../lit-core.min.js";
import RSDevice from "./device.js";
import {config} from "./mapping/RSMAT.js";


export default class RSMat extends RSDevice{

    constructor(hass,device){
				super(hass,device,config);
    }


    render(){
	return html`
<p id="device_name" class="RSMAT">${this.conf.name}</p>
<div class="device_bg">
<img src="${this.conf.background_img}"/>
</div>`;
	
    }

}


/*
 * CSS
 */
export const style_rsmat = css`
  p.RSMAT{
    color: yellow;
  }

  img.RSMAT {
    width: 200px;
  }
`
