import { html } from "lit";
import RSDevice from "./device";

import styles from "./dose_head.styles";
import style_sensors from "./base/sensor.styles";
import style_progress_bar from "./base/progress_bar.styles";

import {ProgressBar} from "./base/progress_bar";
import {off_color} from "../common.js";

export default class DoseHead extends RSDevice{

    static styles = [styles,style_sensors];

    static get properties() {
	return {
	    entities: {},
	    config: {},
	    head_id:{},
	    state_on:{},
	    supplement:{},
	    stock_alert: {},
	}
    }

    constructor(hass,entities,config,state_on,stock_alert){
	super();
	this.supplement=null;
	this.stock_alert=stock_alert;
    }

    _pipe_path(){
	let color=this.config.color;
	if (! this.state_on ){
	    color=off_color;
	}
	return html`
		<svg viewBox="0 0 86 56" style="fill:rgb(${color});">
		    <path d="M 14,0 C 13,12 10,18 7,25 0,34 0,45  0,55 L 12,55 c 0,-8 -0,-16 6,-24 4,-8 8,-17 8,-35 z"></path>
		    <path d="m 62,0 1,39 c 0,2 1,3 2,5 2,2 2,1 4,2 2,0 4,0 6,-2 2,-2 1,-5 2,-7 l 6,-30 -8,0 -3,8 0,-28 z"></path>
		</svg>
`;

    }

    _render_container(){
	let supplement_uid=this.supplement.attributes.supplement.uid
	let img=null;
	console.debug("uid",supplement_uid);
	img='/hacsfiles/ha-reef-card/'+supplement_uid+'.supplement.png';
	let style=html``;
	let color=this.config.color;
	if(!this.state_on){
	    style=html`<style>img{filter: grayscale(90%);}</style>`;
	    color=off_color;
	}
	return html`
<div class="container">
  ${style}
  <img src='${img}' onerror="this.onerror=null; this.src='/hacsfiles/ha-reef-card/generic_container.supplement.png'"/>
</div>
`;
    }

    render(){
	this.supplement=this.hass.states[this.entities['supplement'].entity_id];
	if (this.supplement.attributes.supplement.uid!='null'){
	    let color=this.config.color+","+this.config.alpha;
	    if (! this.state_on ){
		color=off_color+","+this.config.alpha;
	    }
	    let warning='';
	    if (this.get_entity('remaining_days').state<this.stock_alert && this.get_entity('slm').state=="on"){
		warning=html`<img class='warning' src='${new URL("./img/warning.svg",import.meta.url)}'/>"`;
	    }
	    return html`
               ${this._render_container()}
   	        <div class="pipe" >
 		  ${this._pipe_path()}
		</div>
<!-- Render schedule background -->
<div class="pump_state_head" style="background-color: rgba(${color});">
${this._render_sensors(this.state_on,"pump_state_head")}
</div>
${this._render_sensors(this.state_on)}
${this._render_actuators(this.state_on)} 
${warning}
   	    `;
	}//if
	else {
	    // TODO: add button for new supplement
	    // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/24
	    //  labels: enhancement rsdose
	    return html``;
	}//else
    }
};

window.customElements.define('dose-head', DoseHead);
