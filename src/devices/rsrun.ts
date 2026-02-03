import { html,css } from "lit";
import {RSDevice} from "./device";
import {config} from "./mapping/RSRUN";
import type { HassConfig, DeviceInfo } from "../types/index";

// TODO: RSUN Implement advanced schedule edition
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/19
// labels: enhancement, rsrun
export default class RSRun extends RSDevice{

  // TODO: RSUN Implement baifc services
  // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/18
  // labels: enhancement, rsrun
  
  constructor(){
    super();
    this.initial_config = config;
  }


  _populate_entities(): void {
    this.entities=[[],[],[]];
    if (!this._hass || !this.device) return;
    
    for (const entity_id in this._hass.entities){
      const entity=this._hass.entities[entity_id];
      for (const d of this.device.elements){
        const fname=d['name'].split("_");
        let pump_id=0;
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
<p id="device_name" class="RSMAT">${this.config.name}</p>
<div class="device_bg">
<img src="${this.config.background_img}"/>
</div>`;
    
  }
}

export const style_rsrun = css`
  p.RSRUN{
    color: blue;
  }

  img.RSRUN {
    width: 200px;
  }
`;
