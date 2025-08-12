import { html } from "lit";
import RSDevice from "./device";

import styles from "./dose_head.styles";


export default class DoseHead extends RSDevice{

    static styles = styles;

    static get properties() {
	return {
	    entities: {},
	    config: {},
	    head_id:{},
	}
    }

    constructor(hass,entities,config){
	super();
    }

    
    _pipe_path(){
	return html`
		<svg viewBox="0 0 86 56" style="fill:rgb(${this.config.color});">
		    <path d="M 14,0 C 13,12 10,18 7,25 0,34 0,45  0,55 L 12,55 c 0,-8 -0,-16 6,-24 4,-8 8,-17 8,-35 z"></path>
		    <path d="m 62,0 1,39 c 0,2 1,3 2,5 2,2 2,1 4,2 2,0 4,0 6,-2 2,-2 1,-5 2,-7 l 6,-30 -8,0 -3,8 0,-28 z"></path>
		</svg>
`;

    }

    _render_container(){
	console.log(this.hass);
	console.log(this.entities);
	console.log(this.entities['supplement']);
	let supplement=this.hass.states[this.entities['supplement'].entity_id];
	let supplement_uid=this.hass.states[this.entities['supplement_uid'].entity_id];
	let img=null;
	switch (supplement_uid.state){
 	case "7d67412c-fde0-44d4-882a-dc8746fd4acb":
	    img=new URL('img/redsea_foundation_A.png',import.meta.url);
	    break;
	case "76830db3-a0bd-459a-9974-76a57d026893":
	    img=new URL('img/redsea_foundation_B.png',import.meta.url);
	    break;
	case "f524734e-8651-496e-b09b-640b40fc8bab":
	    img=new URL('img/redsea_foundation_C.png',import.meta.url);
	    break;
	default:
	    img=new URL('img/generic_container.png',import.meta.url); 
	    break;
	}
	
	return html`
<div class="container">
  <img src='${img}'/>
</div>
`;
    }

    render(){
	return html`
               ${this._render_container()}
   	        <div class="pipe" >
 		  ${this._pipe_path()}
		</div>
${this._render_actuators()}
   	    `;
    }
};

window.customElements.define('dose-head', DoseHead);
