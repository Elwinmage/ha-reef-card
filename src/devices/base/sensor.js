import { html } from "lit";

import style_sensor from "./sensor.styles";

import MyElement from "./element";

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

    render(){
	console.debug("Sensor render: ",this.stateObj);
	return html`
<style>
.sensor{
background-color: rgba(${this.color},${this.alpha});
}   
</style>
   	    <div class="sensor" id="${this.conf.name}">${this.stateObj.state} ${this.stateObj.attributes.unit_of_measurement}</div>
`;
    }//end of function render

    async _click(e){
	console.debug("Click ",e.detail," ",e.timeStamp);
    }

    async _longclick(e){
	console.debug("Long Click");
    }//end of function longclick
    
    async _dblclick(e){
	console.debug("Double click");
    }//end of function dblclick
    
}// end of class

window.customElements.define('common-sensor', Sensor);
