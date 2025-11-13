import { html } from "lit";

import style_message from "./message.styles";

import MyElement from "./element";

/*
 *  Message
 */
class Message extends  MyElement {

    static styles = style_message;

    static get properties(){
	return {
	    _hass:{},
	    message: {type: String},
	    shadowRoot:{}
	    
	};
    }
    
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(){
 	super(null);
    }

    init(hass,shadowRoot){
	this._hass = hass;
	this._shadowRoot=shadowRoot;
	this.message=null;
    }//end of constructor


    set hass( obj ) {
	this._hass = obj; // Don't set it to the same name or you'll cause an infinite loop
	// Add code here that handles a change in the hass object
    }
    
    async publish(message){
	let elt=this._shadowRoot.querySelector("#message");
	elt.innerHTML=message;
	console.log(elt.hidden);
	elt.hidden=false;
	await this.sleep(2000);
	for (let opacity=0.8;opacity> 0.02;opacity-=0.02){
	    elt.style.opacity=opacity;
	    await this.sleep(50);
	}
	elt.innerHTML=null;
	elt.hidden=true;
	
    }//end of function publish
    
    render(){
	console.debug("Message render", this.message);
	return html`
                <div class="content" id="message" hidden></div>
            `;
    }//end of function render

    async _click(e){
	console.debug("Click ",e.detail," ",e.timeStamp);
    }

    async _longclick(e){
	console.debug("Long Click");
    }//end of function longclick
    
    async _dblclick(e){
	console.debug("Double click");
    }//end of function dblclick
    
}// end of class

window.customElements.define('my-message', Message);

var msgbox = new Message();
export default msgbox;

