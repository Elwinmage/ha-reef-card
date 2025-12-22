import { html } from "lit";

import style_messages from "./messages.styles";

import MyElement from "./element";

/*
 *  ClickImage
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
	let style=this.get_style("elt.css");
	if ("class" in this.conf){
	    sclass=this.conf.class;
	}
	let value=this.stateObj.state;
	if (value=="unavailable"){
	    value='';
	    style='';
	}
	else if('label' in this.conf){
	    value=this.conf.label+value+this.conf.label;
	}
	
	return html`<div style=${style}><marquee class="${sclass}">${value}</marquee></div>`;
    }//end of function render

}// end of class

window.customElements.define('redsea-messages', RSMessages);
