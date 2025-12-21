import { html } from "lit";

import style_sensor from "./sensor.styles";
import MyElement from "./element";
import i18n from "../../translations/myi18n.js";

/*
 *  Sensor
 */
export class Sensor extends  MyElement {

    static styles = style_sensor;
	
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(hass,conf,stateObj,color="255,255,255",alpha=1){
 	super(hass,conf,stateObj,color,alpha);
    }//end of constructor
    
    _render(style=null){
	let value=this.stateObj.state;
	if(this.conf.force_integer){
	    value=Math.floor(value);
	}
	let sensor_class="sensor";
	if ("class" in this.conf){
	    sensor_class=this.conf.class;
	}
	let unit='';
	if("unit" in this.conf){
	    unit=eval(this.conf.unit);
	}
	else if ('unit_of_measurement' in this.stateObj.attributes){
	    unit=this.stateObj.attributes.unit_of_measurement;
	}
	return html`
          <style>
           .sensor{
              background-color: rgba(${this.c},${this.alpha});
           }   
          </style>
   	    <div class="${sensor_class}" id="${this.conf.name}" style=${style}>${this.conf.prefix}${value}<span class="unit">${unit}</span></div>
`;
    }//end of function render

}// end of class

window.customElements.define('common-sensor', Sensor);
