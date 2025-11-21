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


    async run_action(type,domain,action,data){
	let enabled=true;
	if (this.conf[type]){
	    let params=['enabled','domain','action','data'];
	    for (let param of params){
		if (param in this.conf[type]){
		    eval(param+"=this.conf['"+type+"']['"+param+"'];");
		}//if - has domain
	    }// for
	}
	if (enabled){
	    if(domain=="__personnal__"){
		switch(action){
		case "message_box":
		    this.msgbox(data);
		    break;
		default:
		    let error_str="Error: try to run unknown personnal action: "+action;
		    this.msgbox(error_str);
		    console.error(error_str);
		    break;
		}//switch
	    }//if -- personnal domain
	    else{
		console.debug("Call Service",domain,action,data);
		this.hass.callService(domain, action, data);
	    }//else -- ha domain action
	}//if -- enabled
	
    }//end of function -- run_action
    
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
