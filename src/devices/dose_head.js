import { html } from "lit";
import RSDevice from "./device";

import styles from "./dose_head.styles";
import style_sensors from "./base/sensor.styles";
import style_progress_bar from "./base/progress_bar.styles";

import {ProgressBar} from "./base/progress_bar";
import {off_color} from "../common.js";
import i18n from "../translations/myi18n.js";

export default class DoseHead extends RSDevice{

    static styles = [styles,style_sensors];

    static get properties() {
	return {
	    state_on:{},
	    device_state:{},
	    head_state:{},
	}
    }

    constructor(){
	super();
	this.supplement=null;
	this.stock_alert=null;
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
	img='/hacsfiles/ha-reef-card/'+supplement_uid+'.supplement.png';
	let style=html``;
	let color=this.config.color;
	if(!this.state_on){
	    style=html`<style>img#id_${supplement_uid}{filter: grayscale(90%);}</style>`;
	    color=off_color;
	}
	return html`
              <div class="container" style="${this.get_style(this.config.container)}">
                ${style}
                <img id=id_${supplement_uid} src='${img}' onerror="this.onerror=null; this.src='/hacsfiles/ha-reef-card/generic_container.supplement.png'" width="100%" />
              </div>
            `;
    }

    is_on(){
	let res=true;

	if( 'head_state' in this.entities && ( this._hass.states[this.entities['head_state'].entity_id].state=="not-setup" ||
					       !this.device_state ||
					      (this._hass.states[this.entities['schedule_enabled'].entity_id].state=='off'))){
	    res=false;
	}
	return res;
    }

    set hass(obj){
	this._setting_hass(obj);
	if(this.is_on() != this.state_on){
	    this.state_on=this.is_on();
	}
	if(this.entites && this.head_state!=this.entities['head_state'].state){
	    this.head_state=this.entities['head_state'].state;
	}
    }
    
    _render(){
	this.to_render=false;
	this.state_on=this.is_on();
	console.debug("Render dose_head n°",this.config.id);
	this.supplement=this._hass.states[this.entities['supplement'].entity_id];
	if (this.supplement.attributes.supplement.uid!='null'){
	    let warning='';
	    let calibration='';
	    let color=this.config.color+","+this.config.alpha;
	    
	    if (this._hass.states[this.entities['head_state'].entity_id].state=="not-setup"){
		this.state_on=false;
		calibration=html`<img class='calibration' style="${this.get_style(this.config.calibration)}" src='${new URL("./img/configuration.png",import.meta.url)}'/>`;
	    }
	    
	    if (! this.state_on ){
		color=off_color+","+this.config.alpha;
	    }
	    if (parseInt(this.get_entity('remaining_days').state)<parseInt(this.stock_alert) && this.get_entity('slm').state=="on"){
		warning=html`<img class='warning' src='${new URL("./img/warning.svg",import.meta.url)}'/ style="${this.get_style(this.config.warning)}" /><div class="warning" style="${this.get_style(this.config.warning_label)}">${i18n._("empty")}</div>`;
	    }
	    return html`
               ${this._render_container()}
   	        <div class="pipe" style="${this.get_style(this.config.pipe)}">
 		  ${this._pipe_path()}
		</div>
                <div class="pump_state_head" style="${this.get_style(this.config.pump_state_head)};background-color:rgba(${color});">
                  ${this._render_elements(this.state_on,"pump_state_head")}
                  <div class="pump_state_labels" style="${this.get_style(this.config.pump_state_labels)}">
                    ${this._render_elements(this.state_on,"pump_state_labels")}
                  </div>
              </div>
              ${this._render_elements(this.state_on)}
              ${warning}
              ${calibration}
   	    `;
	}//if
	else {
	    // TODO: add button for new supplement
	    // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/24
	    //  labels: enhancement rsdose
	    return html`
   <div class="container" style="${this.get_style(this.config.container)}">
     <img src='${new URL("./img/container_add.png",import.meta.url)}' />
   </div>
`;
	}//else
    }
};

window.customElements.define('dose-head', DoseHead);
