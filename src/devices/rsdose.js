import { html } from "lit";
import RSDevice from "./device";
import {config} from "./mapping/RSDOSE4";
import DoseHead from "./dose_head";

import style_rsdose from "./rsdose.styles";
import style_common from "./common.styles";

import i18n from "../translations/myi18n.js";

import {rgbToHex,hexToRgb,updateObj} from "../common";
import {merge} from "../merge";

import {DosingQueue} from "./dosing_queue";

/*
 * RSDose 
 */
// TODO: RSDOSE Implement advanced schedule edition
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/14
//   labels: enhancement, rsdose
export default class RSDose extends RSDevice{

// TODO: RSDOSE Implement basic services
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/13
//   labels: enhancement, rsdose
    static styles = [style_rsdose,style_common];
    _heads = [];

    static get properties(){
	return{
	    supplement_color: {},
	}
    }
    
    constructor(hass,device,user_config){
	super(config,hass,device,user_config);
	this.supplement_color={};
    }// end of constructor

    _populate_entities(){
	
    }

    _populate_entities_with_heads(){
	for (let i=0; i<=this.config.heads_nb;i++){
	    this._heads.push({'entities':{}});
	}
	for (var entity_id in this.hass.entities){
	    var entity=this.hass.entities[entity_id];
	    for (var d of this.device.elements){
		var fname=d['name'].split("_");
		var head_id=0;
		if (fname[fname.length  - 2 ] == "head"){
		    head_id=parseInt(fname[fname.length-1]);
		}
		if(entity.device_id == d.id){
		    if (head_id==0){
			this.entities[entity.translation_key]=entity;
		    }
		    else {
			this._heads[head_id].entities[entity.translation_key]=entity;
		    }
		    
		}
	    }
	}
    }
    _get_val(head,entity_id){
	let entity = this.hass.states[this.entities[head][entity_id].entity_id];
	return entity.state;
    }
    
    _render_head(head_id){
	let schedule_state=(this.hass.states[this._heads[head_id].entities['schedule_enabled'].entity_id].state=='on');
	if (!this.is_on()){
	    schedule_state=false;
	}
	let short_name=this.hass.states[this._heads[head_id].entities['supplement'].entity_id].attributes.supplement.short_name;
    	this.supplement_color[short_name]=this.config.heads['head_'+head_id].color;
	let new_conf=merge(this.config.heads.common,this.config.heads["head_"+head_id]);
	return html`
<div class="head" id="head_${head_id}" style="${this.get_style(new_conf)}">
	<dose-head class="head" head_id="head_${head_id}" hass="${this.hass}" entities="${this._heads[head_id].entities}" config="${new_conf}" state_on=${schedule_state} stock_alert="${this.get_entity('stock_alert_days').state}"/>

</div>
`;
    }

    is_disabled(){
	let disabled=false;
	let sub_nb=this.device.elements.length;
	for( var i = 0; i<sub_nb; i++){
	    if (this.device.elements[i].disabled_by!=null){
		disabled=true;
		break;
	    }// if
	}// for
	return disabled;
    }//end of function is_disabled

    
    render(){
	this.update_config();
	if (this.is_disabled()){
	    return this._render_disabled();
	}//if
	let style=html``;
	let dosing_queue=html``;
	this._populate_entities_with_heads();
	if(!this.is_on()){
	    style=html`<style>img{filter: grayscale(90%);}</style>`;
	}
	let slots=(this.hass.states[this.entities['dosing_queue'].entity_id].attributes.queue).length;
	if (slots>0){
	    dosing_queue=html`
<div style="${this.get_style(this.config.dosing_queue)}">
<dosing-queue id="dosing-queue" .hass="${this.hass}" .state_on="${this.is_on()}" .config=null .entities="${this.entities}" .stateObj="${this.hass.states[this.entities['dosing_queue'].entity_id]}" .color_list="${this.supplement_color}"></dosing-queue>
</div>`;
	}
	return html`
	<div class="device_bg">
        ${style}
	  <img class="device_img" id="rsdose4_img" alt=""  src='${this.config.background_img}' />
        <div class="heads">
	${Array.from({length:this.config.heads_nb},(x,i) => i+1).map(head => this._render_head(head))}
       </div>
${dosing_queue}
        ${this._render_actuators()}
	</div>`;

    }//end of function render
    
    _editor_head_color(head_id){
	this.update_config();
	let color=rgbToHex("rgb\("+this.config.heads["head_"+head_id].color+"\);");
	return html `
         <input type="color" id="head_${head_id}" name="head_${head_id}" value="${color}" @change="${this.handleChangedEvent}" @input="${this.handleChangedEvent}" list="RedSeaColors" />
<datalist id="RedSeaColors">
<option>#8c4394</option>
<option>#0081c5</option>
<option>#008264</option>
<option>#64a04b</option>
<option>#582900</option>
<option>#f04e99</option>
<option>#f14b4c</option>
<option>#f08f37</option>
<option>#d9d326</option>
<option>#FFFFFF</option>
</datalist>
         <label class="tab-label">${i18n._("head")} ${head_id}: ${this.hass.states[this._heads[head_id].entities['supplement'].entity_id].state}</label>
         <br />
     `;
    }//end of function _editor_head_color

    handleChangedEvent(changedEvent) {
	const hex=changedEvent.currentTarget.value;
	var newVal={conf:{[this.current_device.config.model]:{devices:{[this.current_device.device.name]:{heads:{[changedEvent.target.id]:{color:hexToRgb(hex)}}}}}}};
	var newConfig = JSON.parse(JSON.stringify(this._config));
	try{
	    newConfig.conf[this.current_device.config.model].devices[this.current_device.device.name].heads[changedEvent.target.id].color = hexToRgb(hex);
	}
	catch (error){
	    updateObj(newConfig,newVal);
	}
        const messageEvent = new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(messageEvent);
    }// end of function handleChangedEvent
    
    editor(doc){
	if(this.is_disabled()){
	    return html ``;
	}
	this._populate_entities_with_heads();
	var element = doc.getElementById("heads_colors");
	if (element){
	    element.reset();
	}
	return html`
<hr />
<h1>${i18n._("heads_colors")}</h1>
<form id="heads_colors">
   	${Array.from({length:this.config.heads_nb},(x,i) => i+1).map(head => this._editor_head_color(head))}
</form>
`;
    }//end of function editor
}

window.customElements.define('rs-dose4', RSDose);

