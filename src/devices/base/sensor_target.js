import { html } from "lit";
import style_sensor_target from "./sensor_target.styles";


//import MyElement from "./element";
import {Sensor} from "./sensor";

/*
 *  SensorTarget
 */
//export class SensorTarget extends  MyElement {
export class SensorTarget extends  Sensor {

    static styles = style_sensor_target;

    static get properties(){
	return {
	    stateObjTarget: {},
	};
    }
    
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(hass,conf,stateObj,stateObjTarget,color="255,255,255",alpha=1){
 	super(hass,conf,stateObj,color,alpha);
	this.stateObjTarget=stateObjTarget;
    }//end of constructor

    render(){
	
	let value=this.stateObj.state;
	let target=this.stateObjTarget.state;
	if(this.conf.force_integer){
	    value=Math.floor(value);
	    target=Math.floor(target);
	}
	let sensor_class="sensor";
	if ("class" in this.conf){
	    sensor_class=this.conf.class;
	}
	let unit=this.stateObj.attributes.unit_of_measurement;
	if("unit" in this.conf){
	    unit=eval(this.conf.unit);
	}
	return html`
<style>
.sensor{
background-color: rgba(${this.color},${this.alpha});
}   
</style>
   	    <div class="${sensor_class}" id="${this.conf.name}">${value}/${target}<span class="unit">${unit}</span></div>
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

window.customElements.define('common-sensor-target', SensorTarget);
