import { html,css } from "../lit-core.min.js";

/*
 * RSDose 
 */
export default class RSDevice {

    constructor(device){
	this.device = device;
	this.model=this.device.elements[0].model;
	this.name=this.device.elements[0].name;
	this._img="/local/community/ha-reef-card/img/logo-redsea.jpg";
    }

    get_img(){
	return this._img;
    }

    get_model(){
	return this.model;
    }

    render(){
	return html`
<div class="bg">
    <img class="device_map" id="rsdose4_img" alt=""  src='${this.get_img}'/>
</div>
`
    }
}


/*
 * CSS
 */
export const style_rsdevice = css`

.bg{
  position: relative;
  top: 0;
  left : 0;
  border: 2px blue solid;
  oaspect-ratio: 2/1;
}

.device_map{
  position: relative;
  top: 0;
  left : 0;
  width: 100%;
  border: 1px black solid;
}
`
