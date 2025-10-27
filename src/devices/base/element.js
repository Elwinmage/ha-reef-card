import { html, LitElement } from "lit";

export default class MyElement extends LitElement{

    static get properties(){
	return {
	    hass: {},
	    label: {type: String},
	    stateObj: {},
	    alreadyClicked: {type: Boolean},
	    doubleClick: {type: Boolean},
	    mouseDown: {}
	    
	};
    }// end of get properties 

    constructor(hass,label,stateObj){
	super();
	this.hass=hass;
	this.label=label;
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
	this.mouseDown=0;
    }
}

window.customElements.define('my-element', MyElement);

