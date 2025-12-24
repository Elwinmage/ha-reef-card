import { html } from "lit";

import style_click_image from "./click_image.styles";

import MyElement from "./element";

/*
 *  ClickImage
 */
export class ClickImage extends  MyElement {

    static styles = style_click_image;

    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(hass,conf){
 	super(hass,conf,null,null);
    }//end of constructor

    _render(style=null){
	let sclass="";
	if ("class" in this.conf){
	    sclass=this.conf.class;
	}
	
	return html`<img class="${sclass}" src=${this.conf.image} style=${style} />`;
    }//end of function render

}// end of class

window.customElements.define('click-image', ClickImage);
