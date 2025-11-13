import { html, LitElement } from "lit";

export default class MyElement extends LitElement{


    static get properties(){
	return {
	    hass: {},
	    conf: {},
	    stateObj: {},
//	    alreadyClicked: {type: Boolean},
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
	this.mouseUp=0;
	this.oldMouseUp=0;
	this.addEventListener("contextmenu", function(e) {e.preventDefault();});
	this.addEventListener("mousedown", function (e) {this.mouseDown=e.timeStamp;});
	this.addEventListener("touchstart", function (e) {this.mouseDown=e.timeStamp;});
	this.addEventListener("touchend", function (e) {this.mouseUp=e.timeStamp;if ( (e.timeStamp-this.mouseDown)> 500) { this._click_evt(e);}});
//	this.addEventListener("touchcancel", function (e) {this.mouseUp=e.timeStamp;this._handleClick(e);});
	
	this.addEventListener("click", function (e) {
	    this._handleClick(e);
	})};

    _handleClick(e){		      
	console.log("_handleClick",e,e.type);
	if(e.pointerType!="touch" /*&& e.type!="touchend"*/ ){
	    if (e.detail === 1) {
		console.debug(e);
		this._click_evt(e);
	    }
	    else if (e.detail === 2) {
		this.doubleClick=true;
		this._dblclick(e);
		
	    }
	}
	else{
	    console.debug("ICI:" ,e,this.oldMouseUp,this.mouseUp)
	    if ((this.mouseUp-this.oldMouseUp) < 200){
		console.debug("send dbl");
		this.doubleClick=true;
		this._dblclick(e);
	    }
	    else{
		console.debug("send single");
		this._click_evt(e);
	    }
	    this.oldMouseUp=this.mouseUp;
	}
    }

    sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms)); 
    }

    hassAction(e){
	console.debug("Hass Action: ",e);
    }//end of function hassAction

    async _click_evt(e){
	let timing = e.timeStamp-this.mouseDown;
	console.debug("Timing: ",e.timeStamp,'-',this.mouseDown,'=',timing,e);
//	if(timing > 0){
	    if(e.timeStamp-this.mouseDown > 500){
		if (this.conf["invert_action"]==true){
		    this._click(e);
		}
		else{
		    this._longclick(e);
		}
	    }
	    else{
		console.debug("sleeping");
		await this.sleep(300);
		if(this.doubleClick==true){
		    this.doubleClick=false;
		    console.debug("dbl",e);
		}
		else{
		    console.debug("simple",e);
		    if (this.conf["invert_action"]==true){
			this._longclick(e);
		    }
		    else {
			this._click(e);
		    }
		}
	    }
	    this.mouseDown=e.timeStamp;
//	}
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

