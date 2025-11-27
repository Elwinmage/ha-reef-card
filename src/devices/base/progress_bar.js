import { html } from "lit";
import style_progress_bar from "./progress_bar.styles";


import MyElement from "./element";

/*
 *  ProgressBar
 */
//export class ProgressBar extends  MyElement {
export class ProgressBar extends  MyElement {

    static styles = style_progress_bar;

    static get properties(){
	return {
	    stateObjTarget: {},
	};
    }
    
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(hass,conf,stateObj,stateObjTarget,color="255,255,255",alpha=1){
 	super(hass,conf,stateObj,color,alpha);
	this.stateObjTarget=stateObjTarget;
    }//end of constructor

    render(){
	
	let value=this.stateObj.state;
	let target=this.stateObjTarget.state;
	let percent=Math.floor(this.stateObj.state*100/this.stateObjTarget.state);
	let bar_class=this.conf.class;
	let unit="%"
	return html`
<style>
div.progress{
background-color: rgba(${this.color},0.8);
}   
</style>
   	    <div class="bar" id="${this.conf.name}">
       	      <div class="progress" id="${this.conf.name}" style="width:${percent}%;">${percent}${unit}</div>
            </div>
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

window.customElements.define('progress-bar', ProgressBar);
