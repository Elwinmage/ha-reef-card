import { html,css } from "../lit-core.min.js";
import RSDevice from "./device.js";
import {config} from "./mapping/RSRUN.js";

// TODO: RSUN Implement advanced schedule edition
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/19
//   labels: enhancement, rsrun
export default class RSRun extends RSDevice{

// TODO: RSUN Implement basic services
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/18
//   labels: enhancement, rsrun
    constructor(hass,device){
				super(hass,device,config)
    }


    _populate_entities(){
	this.entities=[[],[],[]];
	for (var entity_id in this.hass.entities){
	    var entity=this.hass.entities[entity_id];
	    for (var d of this.device.elements){
		var fname=d['name'].split("_");
		var pump_id=0;
		if (fname[fname.length  - 2 ] == "pump"){
		    pump_id=parseInt(fname[fname.length-1]);
		}
		if(entity.device_id == d.id){
		    this.entities[pump_id].push(entity);
		}
		
	    }
	}
	
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
export const style_rsrun = css`
  p.RSRUN{
    color: blue;
  }

  img.RSRUN {
    width: 200px;
  }
`
