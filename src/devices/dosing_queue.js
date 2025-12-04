import { html } from "lit";

import i18n from "../translations/myi18n.js";
import MyElement from "./base/element"

import styles from "./dosing_queue.styles";
import {toTime} from "../common.js";

export default class DosingQueue extends MyElement{

    static styles = [styles];

    static get properties() {
	return {
	    state_on:{},
	    color_list: {},
	}
    }

    constructor(hass,entities,config,state_on,stateObj,color_list){
	super(hass,config,stateObj,entities);
	this.state_on=state_on;
	this.color_list=color_list;
    }

    _render_slot_schedule(slot){
	let bg_color=this.color_list[slot.head];
	return html`
<div class="slot" style="background-color: rgb(${this.color_list[slot.head]})">
<span class="dosing_queue">
${slot.head}<br />${slot.volume.toFixed(1)}mL<br />${toTime(slot.time)}</span><hr /></div>`;
     }//end of function _render_slot_schedule


    render(){
	this.schedule=this.stateObj.attributes.queue;
	if(this.state_on && this.schedule.length != 0){
	    return html`
${this.schedule.map(slot => this._render_slot_schedule(slot))}
   	    `;
	}//if
	else {
	    return html``;
	}//else
    }
};

window.customElements.define('dosing-queue', DosingQueue);
