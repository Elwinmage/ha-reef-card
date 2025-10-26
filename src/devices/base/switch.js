import { html, LitElement } from "lit";

import style_switch from "./switch.styles";


/*
 *  Switch
 */
export class Switch extends  LitElement {

    static styles = style_switch;
	
    static get properties(){
	return {
	    hass: {},
	    label: {type: String},
	    stateObj: {}
	};
    }// end of get properties 

    constructor(hass,label,stateObj){
	super();
	this.hass=hass;
	this.label=label;
	this.stateObj=stateObj;
    }//end of constructor

    render(){
	return html`
        <div class="switch_${this.stateObj.state}"  @click="${() => this._toggle()}">
   	    <div class="switch_in_${this.stateObj.state}"></div>
        </div>`;
    }//end of function render

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
