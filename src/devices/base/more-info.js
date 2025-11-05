import { html } from "lit";

import style_moreinfo from "./more-info.styles";

import MyElement from "./element";

/*
 *  MoreInfo
 */
export class MoreInfo extends  MyElement {

    static styles = style_moreinfo;
	
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(hass,color="255,255,255",alpha=1){
 	super(hass,color,alpha);
    }//end of constructor

    render(){
	console.debug("MoreInfo render: ",this.stateObj);
	return html`
<style>
.moreinfo{
background-color: rgba(${this.color},${this.alpha});
}   
</style>
   	    <div class="moreinfo" id="${this.conf.name}">${this.stateObj.state} ${this.stateObj.attributes.unit_of_measurement}</div>
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

window.customElements.define('my-moreinfo', MoreInfo);
