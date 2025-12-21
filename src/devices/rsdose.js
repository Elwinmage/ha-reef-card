import { html } from "lit";
import RSDevice from "./device";
import {config} from "./mapping/RSDOSE4";
import DoseHead from "./dose_head";

import style_rsdose from "./rsdose.styles";
import style_common from "./common.styles";

import i18n from "../translations/myi18n.js";

import {rgbToHex,hexToRgb} from "../common";
import {merge} from "../merge";

import {DosingQueue} from "./dosing_queue";
import MyElement from "./base/element";

import dialog_box from "./base/dialog";

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
    
    constructor(){
	super();
	this.supplement_color={};
	this.initial_config=config;
	this.dosing_queue=null;
    }// end of constructor

    set hass(obj){
	this._setting_hass(obj);
	for (let head of this._heads){
	    if ('dose_head' in head){
		head.dose_head.hass=obj;
	    }
	}
	if(this.dosing_queue){
	    this.dosing_queue.hass=obj;
	}
    }
    
    _populate_entities(){
	
    }

    _populate_entities_with_heads(){
	this.update_config();
	this.config_dialog_box();
	for (let i=0; i<=this.config.heads_nb;i++){
	    this._heads.push({'entities':{}});
	}
	for (var entity_id in this._hass.entities){
	    var entity=this._hass.entities[entity_id];
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
	let entity = this._hass.states[this.entities[head][entity_id].entity_id];
	return entity.state;
    }
    
    _render_head(head_id){
	let dose_head=null;
	let new_conf=merge(this.config.heads.common,this.config.heads["head_"+head_id]);
	let schedule_state=(this._hass.states[this._heads[head_id].entities['schedule_enabled'].entity_id].state=='on');
	if (!this.is_on()){
	    schedule_state=false;
	}
	let short_name=this._hass.states[this._heads[head_id].entities['supplement'].entity_id].attributes.supplement.short_name;
    	this.supplement_color[short_name]=this.config.heads['head_'+head_id].color;

	if ( "dose_head" in this._heads[head_id]){
	    dose_head=this._heads[head_id]["dose_head"];
	    dose_head.state_on=schedule_state;
	    dose_head.device_state=this.is_on();
	    dose_head.hass=this._hass;
	    
	}
	else
	{
	    dose_head=RSDevice.create_device('dose-head',this._hass,new_conf,null);
	    dose_head.entities=this._heads[head_id].entities;
	    dose_head.stock_alert=this.get_entity('stock_alert_days').state;
	    dose_head.state_on=schedule_state;
	    dose_head.device_state=this.is_on();
	    this._heads[head_id]['dose_head']=dose_head;
	    dose_head.config=new_conf;
	}
	
	return html`
                    <div class="head" id="head_${head_id}" style="${this.get_style(new_conf)}">
                       ${dose_head}
                    </div>
                    `;
    }

    // updated(changes){
    // 	console.log("RE-RENDERED");
    // }

    _render(){
	this.to_render=false;
	console.debug("Render rsdose");
	this.update_config();
	let style=html``;
	this._populate_entities_with_heads();
	
	let disabled=this._render_disabled();
	if(disabled!=null){
	    return disabled;
	}
	if(!this.is_on()){
	    style=html`<style>img{filter: grayscale(90%);}</style>`;
	}
	if (this.dosing_queue==null){
	    this.dosing_queue=MyElement.create_element(this._hass,this.config.dosing_queue,this);
	    this.dosing_queue.color_list=this.supplement_color;
	}
	return html`
             	<div class="device_bg">
                  ${style}
          	  <img class="device_img" id="rsdose4_img" alt=""  src='${this.config.background_img}' />
                  <div class="heads">
                     ${Array.from({length:this.config.heads_nb},(x,i) => i+1).map(head => this._render_head(head))}
                 </div>
                   ${this.dosing_queue}
                 ${this._render_elements()}
               </div>`;
    }//end of function render
    
    _editor_head_color(head_id){
	this.update_config();
	let color=rgbToHex("rgb\("+this.config.heads["head_"+head_id].color+"\);");
	let shortcuts=this.config.heads["head_"+head_id].shortcut;
	return html `
             <tr>
               <td class="config_color">
                 <input type="color" id="head_${head_id}-color" value="${color}" @change="${this.handleChangedEvent}" @input="${this.handleChangedEvent}" list="RedSeaColors" />
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
                <label class="tab-label">${i18n._("head")} ${head_id}: ${this._hass.states[this._heads[head_id].entities['supplement'].entity_id].state}</label>
              </td>
              <td>
                <input type="text" id="head_${head_id}-shortcut" value="${shortcuts}" @input="${this.handleChangedEvent}"></input>
              </td>
           </tr>`;
    }//end of function _editor_head_color

    handleChangedEvent(changedEvent) {
	let i_val=changedEvent.currentTarget.value;
	const head=changedEvent.target.id.split('-')[0];
	const field=changedEvent.target.id.split('-')[1]
	if (field=="color"){
	    i_val=hexToRgb(i_val);
	}
	var newVal={conf:{[this.current_device.config.model]:{devices:{[this.current_device.device.name]:{heads:{[head]:{[field]:i_val}}}}}}};
	var newConfig = JSON.parse(JSON.stringify(this._config));
	try{
	    newConfig.conf[this.current_device.config.model].devices[this.current_device.device.name].heads[changedEvent.target.head][field] = i_val;
	}
	catch (error){
	    newConfig=merge(newConfig,newVal);
	    console.debug("merged",newConfig,newVal);
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
                 <table>
                   <tr>
                     <td class="config_header">${i18n._("heads_colors")}</td>
                     <td>${i18n._("heads_shortcuts")}</td>
                   </tr>
                   <form id="heads_colors">
                     ${Array.from({length:this.config.heads_nb},(x,i) => i+1).map(head => this._editor_head_color(head))}
                   </form>
                 </table>`;
    }//end of function editor
}

window.customElements.define('redsea-rsdose4', RSDose);

