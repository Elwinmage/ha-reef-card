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

    render(){
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
	//	this.hass.callService("button", "press", {entity_id: this.entities[button.name].entity_id});
	this.msgbox("Click");
    }

    async _longclick(e){
	//	moreinfo.display("testme","hello");
	this.msgbox("Long Click");
    }//end of function longclick
    
    async _dblclick(e){
	this.msgbox("Double Click");
    }//end of function dblclick

    _config(){
	console.debug("devices.base.button.config");
    }
    
    _toggle(){
	if (this.stateObj.state=='on'){
	    this.stateObj.state='off';
	}//if 
	else {
	    this.stateObj.state='on';
	}//else
	//TOGGLE button
	console.debug(this.stateObj.entity_id," => ", this.stateObj.state);
	this.requestUpdate();
    }// end of function _toggle
    
}// end of class

window.customElements.define('common-button', Button);
