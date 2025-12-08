import { html, LitElement } from "lit";

export default class MyElement extends LitElement{
    static get properties(){
	return {
//	    conf: {},
	    stateObj: {},
	    color: {},
	    doubleClick: {type: Boolean},
	    mouseDown: {},
//	    entities: {}
	};
    }// end of get properties 

    constructor(hass,conf,stateObj,entities={},color="255,255,255",alpha=1){
	super();
	this.hass=hass;
	this.conf=conf;
	this.color=color;
	this.alpha=alpha;
	this.stateObj=stateObj;
	this.entities=entities;
	this.mouseDown=0;
	this.mouseUp=0;
	this.oldMouseUp=0;
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

    
    get_entity(entity_translation_value){
	return this.hass.states[this.entities[entity_translation_value].entity_id];
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
	let value=this.stateObj.state;

	if ('disabled_if' in this.conf && eval(this.conf.disabled_if)){
	    return html`<br />`;
	}
	return this._render()
    }
    
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
    }

    _longclick(e){
    }

    _dblclick(e){
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

