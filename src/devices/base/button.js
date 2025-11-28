import { html } from "lit";

import style_button from "./button.styles";

import MyElement from "./element";

import moreinfo from './more-info';

/*
 *  Button
 */
export class Button extends  MyElement {

    static styles = [style_button];
	
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(hass,conf,stateObj,color="255,255,255",alpha=1){
 	super(hass,conf,stateObj,color,alpha);
    }//end of constructor

    _render(){
	return html`
 <style>
.button{
background-color: rgba(${this.color},${this.alpha});
}
</style>
   	    <div class="button" id="${this.conf.name}"></div>
`;
    }//end of function render

    async _click(e){
	let data={'entity_id':this.stateObj.entity_id};
	this.run_action("tap_action","button","press",data);
    }

    async _longclick(e){
	let data="Hold";
	this.run_action("hold_action","__personnal__","message_box",data);
	
    }//end of function longclick
    
    async _dblclick(e){
	let data="Double Tap";
	this.run_action("double_tap_action","__personnal__","message_box",data);
	
    }//end of function dblclick

}// end of class

window.customElements.define('common-button', Button);
