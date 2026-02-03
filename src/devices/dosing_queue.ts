// @ts-nocheck
import { html } from "lit";

import i18n from "../translations/myi18n";
import {MyElement} from "./base/element"

import styles from "./dosing_queue.styles";
import {toTime} from "../common";

export class DosingQueue extends MyElement{

    static styles = [styles];

    static get properties() {
	return {
	    state_on:{},
	}
    }

    constructor(){
	super();
	this.schdedule=null;
    }

    _render_slot_schedule(slot){
	let bg_color=this.color_list[slot.head];
	return html`
           <div class="slot" style="background-color: rgb(${this.color_list[slot.head]})">
             <span class="dosing_queue">
              ${slot.head}<br />
              ${slot.volume.toFixed(1)}mL<br />
              ${toTime(slot.time)}
             </span><hr />
          </div>`;
     }// end of function _render_slot_schedule


    set hass(obj){
	if (this.stateObj && this.stateObj.attributes.queue != obj.states[this.stateObj.entity_id].attributes.queue){
	    this._hass=obj;
	    this.stateObj=obj.states[this.stateObj.entity_id];
	}
    }
    
    render(){
	this.schedule=this.stateObj.attributes.queue;
	if(this.stateOn && this.schedule.length != 0){
	    return html`
                  <div style="${this.get_style(this.config)}">
                    ${this.schedule.map(slot => this._render_slot_schedule(slot))}
                  </div>
   	    `;
	}// if	else {
	    return html``;
	}// else    }
};

// window.customElements.define('doifng-queue', DoifngQueue);
