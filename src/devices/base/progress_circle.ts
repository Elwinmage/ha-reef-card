import { html } from "lit";
import style_progress_circle from "./progress_circle.styles";
import i18n from "../../translations/myi18n.js";
import {off_color} from "../../common.js";

import {MyElement} from "./element";

/*
 *  ProgressCircle
 */
export class ProgressCircle extends  MyElement {

    static styles = style_progress_circle;

    static get properties(){
	return {
	    stateObjTarget: {},
	};
    }
    
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(){//hass,conf,device){
 	super();//hass,conf,device);
	this.stateObjTarget=null;
    }//end of constructor

    _render(){
	if ('disabled_if' in this.conf && eval(this.conf.disabled_if) ){
	    return html`<br />`;
	}
	let iconv= i18n;
	let value=this.stateObj.state;
	let target=this.stateObjTarget.state;
	let percent=100
	if(parseFloat(value) < parseFloat(target)){
	    percent=Math.floor(this.stateObj.state*100/this.stateObjTarget.state);
	}//if
	let circle_class=this.conf.class;
	let label='';
	if('label' in this.conf){
	    label=eval(this.conf.label);
	}
	let style='';
	if('no_value' in this.conf && this.conf.no_value){
	    style="visibility: hidden;";
	};
	let unit="%"
	let fill=percent-2;
	if (fill<0){
	    fill = 0;
	}
	// range 0 to 565 for 200x200
	return html`
              <svg width="100%" height="100%" viewBox="-25 -25 250 250" version="1.1" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg)">
                <circle r="90" cx="100" cy="100" fill="transparent" stroke="rgba(150,150,150,0.6)" stroke-width="16px"></circle>
                <circle r="90" cx="100" cy="100" stroke="rgb(${this.c})" stroke-width="16px" stroke-linecap="round" stroke-dashoffset="${565-percent*565/100}px" fill="transparent" stroke-dasharray="565.48px"></circle>
                <text x="71px" y="115px" fill="#6bdba7" font-size="52px" font-weight="bold" style="${style} transform:rotate(90deg) translate(0px, -196px)">${percent}</text>
               </svg>
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

//window.customElements.define('progress-circle', ProgressCircle);
