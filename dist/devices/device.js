import { html,css } from "../lit-core.min.js";

/*
 * RSDose 
 */
export default class RSDevice {

    constructor(hass,device,config){
				this.hass = hass;
				this.device = device;
				let model=this.device.elements[0].model;
				this.conf=config;
				console.assert(this.conf.model==model);
				this.conf.name=this.device.elements[0].name;
				this.img_path="/local/community/ha-reef-card/devices/img/";
				if (this.conf.background_img==null){
						this.conf.background_img=this.img_path+this.conf.model+".png";
				}
				this.entities={};
				this._populate_entities();
				console.log(this.entities);
				
    }


		_get_val(entity_id){
				console.log("get_val for "+entity_id+": "+this.hass.states[entity_id]);
				return this.hass.states[entity_id].state;
		}
		
    _populate_entities(){
				for (var entity_id in this.hass.entities){
						var entity=this.hass.entities[entity_id];
						if(entity.device_id == this.device.elements[0].id){
								this.entities[entity.translation_key]=entity;

						}
				}
    }

		_press(button){
				console.log(button);
				// this.hass.callService("homeassistant", "press", {
				// 				entity_id: state.entity_id,
				// 		});
				// }
		}
		
		_render_sensor(sensor){
				return html`
<span id="${sensor.name}" style="top:${sensor.top};left:${sensor.left}">${this._get_val(sensor.name)}</span>
`;
		}
		
		render(){
				return html`
<div class="bg">
    <img class="device_map" id="rsdose4_img" alt=""  src='${this.conf.background_img}'/>
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
