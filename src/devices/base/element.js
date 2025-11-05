import { html, LitElement } from "lit";

export default class MyElement extends LitElement{


    static get properties(){
	return {
	    hass: {},
	    conf: {},
	    stateObj: {},
	    alreadyClicked: {type: Boolean},
	    doubleClick: {type: Boolean},
	    mouseDown: {}
	};
    }// end of get properties 

    constructor(hass,conf,stateObj,color="255,255,255",alpha=1){
	super();
	this.hass=hass;
	this.conf=conf;
	this.color=color;
	this.alpha=alpha;
	this.stateObj=stateObj;
	//Disable context menu
	this.mouseDown=0;
	//this.addEventListener("contextmenu", function(e) {e.preventDefault();});
	this.addEventListener("mousedown", function (e) {this.mouseDown=e.timeStamp});
	    
	this.addEventListener("click", function (e) {
	    if (e.detail === 1) {
		console.debug(e);
		this._click_evt(e);
	    } else if (e.detail === 2) {
		this.doubleClick=true;
		this._dblclick(e);
	    }
	    else{
	    }
	});
	this.alreadyClicked=false;
	this.doubleClick=false;
    }

    sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms)); 
    }

    async _click_evt(e){
	console.debug(this.mouseDown,'   ',e.timeStamp-this.mouseDown);
	if(e.timeStamp-this.mouseDown > 500){
	    if (this.conf["invert_action"]==true){
		this._click(e);
	    }
	    else{
		this._longclick(e);
	    }
	}
	else{
	    await this.sleep(300);
	    if(this.doubleClick==true){
		this.doubleClick=false;
	    }
	    else{
		if (this.conf["invert_action"]==true){
		    this._longclick(e);
		}
		else {
		    this._click(e);
		}
	    }
	}
	this.mouseDown=0;
    }

    _click(e){
	console.log("click event: ",this.stateObj);
/*//	let evt = new Event('hass-more-info', { composed: true });
//	evt.detail = this.stateObj.entity_id;
//	console.log(evt);
//	let res=this.dispatchEvent(evt);

	const actionConfig = {
	    entity: this.stateObj.entity_id,
	    tap_action: {
		action: "more-info",
	    },
	};

	// Open more info on tap action
	const event = new Event("hass-action", {
	    bubbles: true,
	    composed: true,
	});
	event.detail = {
	    config: actionConfig,
	    action: "tap",
	};
	
	console.log("EVENT ***");
	console.log(event);
	let res=this.dispatchEvent(event);


	const actionConfig2 = {
	    entity: this.stateObj.entity_id,
	    tap_action: {
		action: "more-info",
	    },
	};

	console.log(res);
	console.log(res2);*/
    }

    _longclick(e){
    }

    _dblclick(e){
    }
}

window.customElements.define('my-element', MyElement);

