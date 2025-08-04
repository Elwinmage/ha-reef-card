import { html,css } from "../lit-core.min.js";
/*
 * RSDose 
 */
export default class RSDevice {

    constructor(hass,device){
	this.hass = hass;
	this.device = device;
	this.model=this.device.elements[0].model;
	this.name=this.device.elements[0].name;
	this.img_path="/local/community/ha-reef-card/devices/img/";
	this._img=this.img_path+this.get_model()+".png";
	this.entities=[];
	this._populate_entities();
	console.log(this.entities);
    }

    _populate_entities(){
	console.log("popualte entities for "+this.device.elements[0].id)
	for (var entity_id in this.hass.entities){
	    var entity=this.hass.entities[entity_id];
	    if(entity.device_id == this.device.elements[0].id){
		this.entities.push(entity);
	    }
	}
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
