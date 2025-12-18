import { html } from "lit";
import style_progress_bar from "./progress_bar.styles";
import i18n from "../../translations/myi18n.js";
import {off_color} from "../../common.js";

import MyElement from "./element";

/*
 *  ProgressBar
 */
//export class ProgressBar extends  MyElement {
export class ProgressBar extends  MyElement {

    static styles = style_progress_bar;

    static get properties(){
	return {
	    stateObjTarget: {},
	};
    }
    
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(hass,conf,stateObj,stateObjTarget,entities,color="255,255,255",alpha=1){
 	super(hass,conf,stateObj,entities,color,alpha);
	this.stateObjTarget=stateObjTarget;
    }//end of constructor

    _render(){
	if ('disabled_if' in this.conf && eval(this.conf.disabled_if) ){
	    return html`<br />`;
	}
	let iconv= i18n;
	let value=this.stateObj.state;
	let target=this.stateObjTarget.state;
	let percent=Math.floor(this.stateObj.state*100/this.stateObjTarget.state);
	let bar_class=this.conf.class;
	let label='';
	if('label' in this.conf){
	    label=eval(this.conf.label);
	}
	let unit="%"
	let fill=percent-1;
	if (fill<0){
	    fill = 0;
	}
	return html`
            <style>
             div.progress{
               background-color: rgba(${this.c},0.8);
              }   
            </style>
              <div class="bar" id="${this.conf.name}" style="background-color:rgba(150,150,150,0.7)">
       	        <div class="progress" id="${this.conf.name}" style="width:${fill}%;height:100;">&nbsp</div>
                <label class="progress-bar"};" >${percent}${unit} - ${label}</label>
              </div>
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

window.customElements.define('progress-bar', ProgressBar);
