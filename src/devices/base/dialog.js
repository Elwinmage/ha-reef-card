import { html } from "lit";

import style_dialog from "./dialog.styles";

import MyElement from "./element";

/*
 *  Dialog
 */
export class Dialog extends  MyElement {

    static styles = style_dialog;
	
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(hass,color="255,255,255",alpha=1){
 	super(hass,null,null,color,alpha);
    }//end of constructor

    render(){
	console.debug("Dialog render: ",this.stateObj);
	return html`
<style>
.dialog{
background-color: rgba(${this.color},${this.alpha});
}   
</style>
   	    <div class="dialog" id="${this.conf.name}">${this.stateObj.state} ${this.stateObj.attributes.unit_of_measurement}</div>
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

window.customElements.define('common-dialog', Dialog);
