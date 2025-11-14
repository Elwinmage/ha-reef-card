import { html, LitElement } from "lit";

export default class MyElement extends LitElement{
    static get properties(){
	return {
	    hass: {},
	    conf: {},
	    stateObj: {},
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

    hassAction(e){
    }//end of function hassAction

    async _click_evt(e){
	let timing = e.timeStamp-this.mouseDown;
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

