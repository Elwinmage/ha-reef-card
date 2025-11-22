import { html } from "lit";
import RSDevice from "./device";

import styles from "./dose_head.styles";
import style_sensors from "./base/sensor.styles";

import {off_color} from "../common.js";

export default class DoseHead extends RSDevice{

    static styles = [styles,style_sensors];

    static get properties() {
	return {
	    entities: {},
	    config: {},
	    head_id:{},
	    state_on:{},
	    
	}
    }

    constructor(hass,entities,config,state_on){
	super();
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
	let supplement=this.hass.states[this.entities['supplement'].entity_id];
	let supplement_uid=this.hass.states[this.entities['supplement_uid'].entity_id];
	let img=null;
	img='/hacsfiles/ha-reef-card/'+supplement_uid.state+'.supplement.png';
	let style=html``;
	if(!this.state_on){
	    style=html`<style>img{filter: grayscale(90%);}</style>`;
	}
	return html`
<div class="container">
  ${style}
  <img src='${img}' onerror="this.onerror=null; this.src='/hacsfiles/ha-reef-card/generic_container.supplement.png'"/>
</div>
`;
    }

    render(){
	return html`
               ${this._render_container()}
   	        <div class="pipe" >
 		  ${this._pipe_path()}
		</div>

${this._render_actuators(this.state_on)}
${this._render_sensors(this.state_on)}
   	    `;
    }
};

window.customElements.define('dose-head', DoseHead);
