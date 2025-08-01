import { html,css } from "../../lit-core.min.js";
import RSDevice from "../device.js";

export default class RSMat extends RSDevice{

    constructor(hass,device){
	super(hass,device);
	this._img="/local/community/ha-reef-card/devices/rsmat/img/"+this.get_model()+".png";
    }


    render(){
	return html`
<p id="device_name" class="RSMAT">${this.name}</p>
<div class="device_bg">
<img src="${this.get_img()}"/>
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
