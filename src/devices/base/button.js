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

    _render(){
	let label='';
	let sclass='button';
	if ('label' in this.conf){
	    label=this.conf.label;
	}
	if ('class' in this.conf){
	    sclass=this.conf.class;
	}
	return html`
 <style>
.button{
background-color: rgba(${this.color},${this.alpha});
}
</style>
   	    <div class="button" id="${this.conf.name}">${label}</div>
`;
    }//end of function render

}// end of class

window.customElements.define('common-button', Button);
