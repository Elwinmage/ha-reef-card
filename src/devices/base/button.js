import { html } from "lit";

import style_button from "./button.styles";

import MyElement from "./element";

import moreinfo from './more-info';

/*
 *  Button
 */
export class Button extends  MyElement {

    static styles = [style_button];
	
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(hass,conf,stateObj,color="255,255,255",alpha=1){
 	super(hass,conf,stateObj,color,alpha);
    }//end of constructor

    _render(style=null){
	let sclass='button';
	let icon=null;
	if ('class' in this.conf){
	    sclass=this.conf.class;
	}
	if('icon' in this.conf){
	    icon=html`<ha-icon icon="${this.conf.icon}"><ha-icon>`;
	}
	return html`
 <style>
.button{
background-color: rgba(${this.c},${this.alpha});
}
</style>
	    <div class="button" id="${this.conf.name}" style=${style}>${icon}${this.label}</div>
`;
    }//end of function render

}// end of class

window.customElements.define('common-button', Button);
