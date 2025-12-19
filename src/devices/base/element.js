import { html, LitElement } from "lit";

import {off_color} from "../../common.js";

export default class MyElement extends LitElement{
    static get properties(){
	return {
	    stateObj: {},
	    stateOn: {}
	    /*	    doubleClick: {type: Boolean},
	    mouseDown: {},*/
	};
    }// end of get properties 

    constructor(){//hass,conf,stateObj,entities={},color="255,255,255",alpha=1){
	super();
	this.mouseDown=0;
	this.mouseUp=0;
	this.oldMouseUp=0;
	this._hass=null;
	this.stateOn=false;
	this.addEventListener("contextmenu", function(e) {e.preventDefault();});
	this.addEventListener("mousedown", function (e) {this.mouseDown=e.timeStamp;});
	this.addEventListener("touchstart", function (e) {this.mouseDown=e.timeStamp;});
	this.addEventListener("touchend", function (e) {this.mouseUp=e.timeStamp;if ( (e.timeStamp-this.mouseDown)> 500) { this._click_evt(e);}});
	this.addEventListener("click", function (e) {
	    this._handleClick(e);
	})};

    // updated(changes){
    // 	console.log("RE-RENDERED element");
    // }


    set state_on(state){
	if (state!= this.stateOn){
	    this.stateOn=state;
	}
    }
    
    has_changed(hass){
	let res=false;
	if (this.stateObj){
	    let so=hass.states[this.stateObj.entity_id];
	    if(this.stateObj.state!=so.state){
		res=true;
	    }
	    else if("target" in this.conf){
		let sot=hass.states[this.stateObjTarget.entity_id];
		if(this.stateObjTarget.state!=sot.state){
		    res=true;
		}
	    }
	}
	return res;
    }
    
    set hass(obj){
	this._hass=obj;
	if (this.stateObj){
	    let so=this._hass.states[this.stateObj.entity_id];
	    if(this.stateObj.state!=so.state){
		this.stateObj=so;
	    }
	    else if(this.conf && "target" in this.conf){
		let sot=this._hass.states[this.stateObjTarget.entity_id];
		if(this.stateObjTarget.state!=sot.state){
		    this.stateObjTarget=sot;
		    this.stateObj=so; // force render
		}
	    }
	}
    }
    
    static create_element(hass,config,color,alpha,state,entities){
	let Element=customElements.get(config.type);
	let label_name='';
	// Don not display label
	if ('label' in config){
	    if (typeof config.label === 'string' ){
		label_name=config.label;
	    }
	    else if(typeof config.label === 'boolean' && config.label!=false){ 
		label_name=config.name;
	    }
	}
/*	if (! state){
	    color=off_color;
	}*/
	let elt=new Element();
	elt.stateOn=state;
	elt.hass=hass;
	elt.conf=config;
	elt.color=color;
	elt.alpha=alpha;
	elt.stateObj=hass.states[entities[config.name].entity_id];
	if ("target" in config){
	    elt.stateObjTarget=hass.states[entities[config.target].entity_id];
	}
	elt.entities=entities;
	elt.label=label_name;
	return elt;
    }//end of function - create_element

    /*
     * Build a css style string according to given json configuration
     * @conf: the css definition
     */
    get_style(){
	let style='';
	if(this.conf && 'css' in this.conf){
	    style=Object.entries(this.conf.css).map(([k, v]) => `${k}:${v}`).join(';');
	}
	return style;
    }//end of function get_style

    
    get_entity(entity_translation_value){
	return this._hass.states[this.entities[entity_translation_value].entity_id];
    }//end of function get_entity
    
    _handleClick(e){		      
	if(e.pointerType!="touch" ){
	    if (e.detail === 1) {
		this._click_evt(e);
	    }
	    else if (e.detail === 2) {
		this.doubleClick=true;
		this._dblclick(e);
		
	    }
	}
	else{
	    if ((this.mouseUp-this.oldMouseUp) < 400){
		this.doubleClick=true;
		this._dblclick(e);
	    }
	    else{
		this._click_evt(e);
	    }
	    this.oldMouseUp=this.mouseUp;
	}
    }

    sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms)); 
    }

    render(){
	if (this.stateObj){
	    console.debug("render element",this.stateObj.entity_id);
	}
	else {
	    console.debug("render element",this.conf.name);
	}
	let value=null;
	if (this.stateObj!=null){
	    value=this.stateObj.state;
	}
	if ('disabled_if' in this.conf && eval(this.conf.disabled_if)){
	    return html`<br />`;
	}
	if(!this.stateOn){
	    this.c=off_color;
	}
	else{
	    this.c=this.color;
	}
	return html`
     	    <div class="${this.conf.class}" style="${this.get_style()}"> 
	     ${this._render()}
            </div>
           `;
    }

    async run_action(action){
	if ( !("enabled" in action) || action.enabled){
	    if(action.domain=="redsea_ui"){
		switch(action.action){
		case "dialog":
		    this._hass.redsea_dialog_box.display(action.data.type,this);
		    break;
		case "exit-dialog":
		    this._hass.redsea_dialog_box.quit();
		    break;
		case "message_box":
		    this.msgbox(action.data);
		    break;
		default:
		    let error_str="Error: try to run unknown redsea_ui action: "+action.action;
		    this.msgbox(error_str);
		    console.error(error_str);
		    break;
		}//switch
	    }//if -- personnal domain
	    else{
		if(action.data=="default"){
		    action.data={"entity_id":this.stateObj.entity_id};
		}
		console.debug("Call Service",action.domain,action.action,action.data);
		this._hass.callService(action.domain, action.action, action.data);
	    }//else -- ha domain action
	}//if -- enabled
    }//end of function -- run_action

    async _click_evt(e){
	let timing = e.timeStamp-this.mouseDown;
	if(e.timeStamp-this.mouseDown > 500){
		this._longclick(e);
	}
	else{
	    await this.sleep(300);
	    if(this.doubleClick==true){
		this.doubleClick=false;
	    }
	    else{
		this._click(e);
	    }
	}
	this.mouseDown=e.timeStamp;
    }

    _click(e){
	if ('tap_action' in this.conf){
	    this.run_action(this.conf.tap_action);
	}
    }

    _longclick(e){
	if ("hold_action" in this.conf){
	    this.run_action(this.conf.hold_action);
	}
    }

    _dblclick(e){
	if ("double_tap_action" in this.conf){
	    this.run_action(this.conf.double_tap_action);
	}
    }

    dialog(type){
	this._hass.redsea_dialog_box.display(type);
    }
    
    msgbox(msg){
	this.dispatchEvent(
            new CustomEvent(
		"hass-notification",
		{
                    bubbles: true,
                    composed: true,
                    detail: {
			message: msg
                    }
		}
            )
	)
	return;
    }
}

window.customElements.define('my-element', MyElement);

