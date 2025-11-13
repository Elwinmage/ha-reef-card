import { html } from "lit";

import style_button from "./button.styles";

import MyElement from "./element";

import moreinfo from './more-info';
//import msgbox from './message';

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
//	this.addEventListener("hass-action", function (e) {console.debug("HASS ACTION!!!");});
	this.addEventListener("hass-notification", function (e) {console.debug("HASS NOTIFICATION!!!");});

    }//end of constructor

    render(){
	console.debug("devices.base.button.render",this.conf);
	return html`
 <style>
.button{
background-color: rgba(${this.color},${this.alpha});
}
</style>
   	    <div class="button" @action="${this._handleAction}" id="${this.conf.name}"></div>
`;
    }//end of function render


    _handleAction(ev) {
	console.debug("ENFINNN!!");
    }
    
    async _click(e){
	console.debug("Click button ",e.detail," ",e.timeStamp);
	//console.debug("button pressed: :"+this.stateObj.entity_id);
	//msgbox.publish("button pressed!"+this.stateObj.entity_id);
	//	this.hass.callService("button", "press", {entity_id: this.entities[button.name].entity_id});
	 this.dispatchEvent(
            new CustomEvent(
              "hass-notification",
              {
                bubbles: true,
                composed: true,
                detail: {
                    message: "click"
                }
              }
            )
	 )

    }

    async _longclick(e){
	console.debug("Long Click");
	//	moreinfo.display("testme","hello");
	 this.dispatchEvent(
            new CustomEvent(
              "hass-notification",
              {
                bubbles: true,
                composed: true,
                detail: {
                    message: "long"
                }
              }
            )
	 )
	
    }//end of function longclick
    
    async _dblclick(e){
	console.debug("Double click");
	 this.dispatchEvent(
            new CustomEvent(
              "hass-notification",
              {
                bubbles: true,
                composed: true,
                detail: {
                    message: "double"
                }
              }
            )
	 )


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
