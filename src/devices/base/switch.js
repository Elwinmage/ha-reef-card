import { html } from "lit";

import style_switch from "./switch.styles";

import MyElement from "./element";

/*
 *  Switch
 */
export class Switch extends  MyElement {

    static styles = style_switch;
	
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(hass,conf,stateObj,color="255,255,255",alpha=1){
 	super(hass,conf,stateObj,color,alpha);
    }//end of constructor

    render(){
	if (this.conf.style=="switch"){
	    return html`
        <div class="switch_${this.stateObj.state}">
   	    <div class="switch_in_${this.stateObj.state}"></div>
        </div>`;
	}//if
	else if (this.conf.style=="button"){
	    console.debug("switch conf: ",this.conf);
// background-color: rgba(${this.config.color},${this.config.alpha}); 
	    return html`
 <style>
      #${this.conf.name}:hover {
background-color: rgba(${this.color},${this.alpha});
}   
</style>
   	    <div class="switch_button"  id="${this.conf.name}"></div>
`;
	}
	else{
	    console.error("Switch style "+this.conf.style+" unknown for "+this.conf.name);
	}
    }//end of function render

    async _click(e){
	console.debug("Click ",e.detail," ",e.timeStamp);
	this._toggle();
    }

    async _longclick(e){
	console.debug("Long Click");
    }//end of function longclick
    
    async _dblclick(e){
	console.debug("Double click");
    }//end of function dblclick

    _config(){
	console.debug("devices.base.switch.config");
    }
    
    _toggle(){
	if (this.stateObj.state=='on'){
	    this.stateObj.state='off';
	}//if 
	else {
	    this.stateObj.state='on';
	}//else
	//TOGGLE switch
	console.debug(this.stateObj.entity_id," => ", this.stateObj.state);
	this.requestUpdate();
    }// end of function _toggle
    
}// end of class

window.customElements.define('common-switch', Switch);
