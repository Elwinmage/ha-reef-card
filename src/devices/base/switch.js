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
// background-color: rgba(${this.config.color},${this.config.alpha}); 
	    return html`
 <style>
      #${this.conf.name}{
background-color: rgba(${this.color},${this.alpha});
}   
</style>
   	    <div class="switch_button"  id="${this.conf.name}">${eval(this.conf.label)}</div>
`;
	}
	else{
	    console.error("Switch style "+this.conf.style+" unknown for "+this.conf.name);
	}
    }//end of function render

    async _click(e){
	let data={'entity_id':this.stateObj.entity_id};
	this.run_action("tap_action","switch","toggle",data);
    }//end of function _click

    async _longclick(e){
	let data="Hold";
	this.run_action("hold_action","__personnal__","message_box",data);
    }//end of function longclick
    
    async _dblclick(e){
	let data="Double Tap";
	this.run_action("double_tap_action","__personnal__","message_box",data);
    }//end of function dblclick
    
}// end of class

window.customElements.define('common-switch', Switch);
