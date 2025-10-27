import { html } from "lit";

import style_switch from "./switch.styles";

import MyElement from "./element";

/*
 *  Switch
 */
export class Switch extends  MyElement {

    static styles = style_switch;
	

    constructor(hass,label,stateObj){
 	super(hass,label,stateObj);
    }//end of constructor

    render(){
	return html`
        <div class="switch_${this.stateObj.state}" @auxclick="${() => this.auxclick()}" @contextmenu="${() => this.contextmenu()}">
   	    <div class="switch_in_${this.stateObj.state}"></div>
        </div>`;
    }//end of function render

    async _click(e){
	console.debug("Click ",e.detail," ",e.timeStamp);
    }

    _longclick(){
	console.debug("Long Click");
    }//end of function longclick
    
    _dblclick(e){
	console.debug("Double click");
    }//end of function dblclick

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
