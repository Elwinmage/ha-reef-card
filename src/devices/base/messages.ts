import { html } from "lit";

import style_messages from "./messages.styles";

import {MyElement} from "./element";

/*
 *  RSMessages
 */
export class RSMessages extends  MyElement {

    static styles = style_messages;

    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(hass,conf){
 	super(hass,conf,null,null);
    }//end of constructor

    _render(){
	let sclass="";
	let trash=null;
	let style=this.get_style("elt.css");
	if ("class" in this.conf){
	    sclass=this.conf.class;
	}
	let value=this.stateObj.state;
	if (value=="unavailable" ||value=="unknown" || value.length==0){
	    value='';
	    style='';
	    trash='';
	}
	else {
	    if('label' in this.conf){
		value=this.conf.label+value+this.conf.label;
	    }
	    let conf={
		"type": "click-image",
		"stateObj": null,
		"image":'/hacsfiles/ha-reef-card/trash.svg',
		"tap_action":{
		    "domain":"redsea",
		    "action":"clean_message",
		    "data":{
			"device_id":this.device.device.elements[0].primary_config_entry,
			"msg_type":this.conf.name,
		    }
		},
		"css": {
		    "display": "inline-block",
		    "position": "absolute",
		    "right": "0px"
		}
	    };
	    trash=MyElement.create_element(this._hass,conf,this.device);
	}
	return html`<div style=${style}><marquee class="${sclass}">${value}</marquee>${trash}</div>`;
    }//end of function render

}// end of class

//window.customElements.define('redsea-messages', RSMessages);
