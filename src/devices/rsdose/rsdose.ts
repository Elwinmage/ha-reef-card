import { html, TemplateResult } from "lit";
import {RSDevice} from "../device";
import {config4} from "./rsdose4.mapping";
import {config2} from "./rsdose2.mapping";
import {DoseHead} from "./dose_head";

import {dialogs_device} from "../device.dialogs"
import {dialogs_rsdose} from "./rsdose.dialogs"

import style_rsdose from "./rsdose.styles";
import style_common from "../../utils/common.styles";

import i18n from "../../translations/myi18n";

import {rgbToHex,hexToRgb} from "../../utils/common";
import {merge} from "../../utils/merge";

import {DosingQueue} from "./dosing_queue";
import {MyElement} from "../../base/element";
import {RSMessages} from '../../base/messages';

interface HeadEntity {
  entities: Record<string, any>;
  dose_head?: any;
}


// TODO: RSDOSE Implement advanced schedule edition
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/14
// labels: enhancement, rsdose
export class RSDose extends RSDevice{

  
  // TODO: RSDOSE Implement baifc services
  // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/13
  // labels: enhancement, rsdose
  static styles = [style_rsdose,style_common];
  _heads: HeadEntity[] = [];
  supplement_color: Record<string, any> = {};
  dosing_queue: DosingQueue | null = null;
  bundle: boolean = false;
  current_device: any;
  _config: any;

  static get properties(){
    return{
      supplement_color: {},
    }
  }
  
  constructor(){
    super();
    this.supplement_color={};
//    this.initial_config=config;
    this.dosing_queue=null;
    this.load_dialogs([dialogs_device,dialogs_rsdose]);
  }// end of constructor

  set hass(obj: any){
    this._setting_hass(obj);
    
    for (const head of this._heads){
      if ('dose_head' in head){
	head.dose_head.hass=obj;
      }
    }
    if(this.dosing_queue){
      this.dosing_queue.hass=obj;
    }
  }
  
  _populate_entities(): void {
    
  }

  _populate_entities_with_heads(): void {
    this.update_config();
    for (let i=0; i<=this.config.heads_nb;i++){
      this._heads.push({'entities':{}});
    }
    if (!this._hass) return;
    
    for (const entity_id in this._hass.entities){
      const entity=this._hass.entities[entity_id];
      if (!this.device) continue;
      
      for (const d of this.device.elements){
	const fname=d['identifiers'][0][1].split("_");
	let head_id=0;
	if (fname[fname.length  - 2 ] == "head"){
	  head_id=parseInt(fname[fname.length-1]);
	}
	if(entity.device_id == d.id){
	  if (head_id==0){
	    this.entities[entity.translation_key]=entity;
	  }
	  else {
	    this._heads[head_id]!.entities[entity.translation_key]=entity;
	  }
	  
	}
      }
    }
  }

  _get_val(head,entity_id){
    let entity = this._hass.states[this.entities[head][entity_id].entity_id];
    return entity.state;
  }
  
  _render_head(head_id,masterOn){
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
      dose_head.update_state(this.is_on());
      dose_head.hass=this._hass;
      dose_head.bundle=this.bundle;
      dose_head.masterOn=masterOn;
      
    }
    else
    {
      dose_head=RSDevice.create_device('redsea-dose-head',this._hass,new_conf,this as any);
      dose_head.entities=this._heads[head_id].entities;
      dose_head.stock_alert=this.get_entity('stock_alert_days').state;
      dose_head.state_on=schedule_state;
      dose_head.update_state(this.is_on());
      this._heads[head_id]['dose_head']=dose_head;
      dose_head.config=new_conf;
      dose_head.bundle=this.bundle;
      dose_head.masterOn=masterOn;
    }
    
    return html`
                    <div class="head" id="head_${head_id}" style="${this.get_style(new_conf)}">
                       ${dose_head}
                    </div>
                    `;
  }

  _render(){
    this.to_render=false;
    console.debug("Render rsdose");

    this.update_config();
    let style=html``;
    this._populate_entities_with_heads();
    this.bundle=this.get_entity('bundled_heads')?.state=="on";
    
    let disabled=this._render_disabled();
    if(disabled!=null){
      return disabled;
    }
    if(!this.is_on()){
      style=html`<style>img{filter: grayscale(90%);}</style>`;
      this.masterOn=false;
    }
    else{
      this.masterOn=true;
    }
    let substyle='';
    if(this.config?.css){
      substyle=this.get_style(this.config);
      console.log("dconf",this.config.css,substyle);
      
    }

    if (this.dosing_queue==null){
      this.dosing_queue=MyElement.create_element(this._hass,this.config.dosing_queue,this) as DosingQueue;
      this.dosing_queue.color_list=this.supplement_color;
    }
    this.dosing_queue.update_state(this.is_on());
    return html`
             	<div class="device_bg">
                  ${style}
                  <img class="device_img" id="rsdose4_img" alt=""  src='${this.config.background_img}' style="${substyle}"/>
                  <div class="heads">
                     ${Array.from({length:this.config.heads_nb},(x,i) => i+1).map(head => this._render_head(head,this.masterOn))}
                 </div>
                   ${this.dosing_queue}
                 ${this._render_elements(this.is_on())}
               </div>`;
  }// end of function render
  
  _editor_head_color(head_id){
    // this.update_config();
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
                <input type="text" id="head_${head_id}-shortcut" value="${shortcuts}" @change="${this.handleChangedEvent}" ></input>
              </td>
           </tr>`;
  }// end of function _editor_head_color

  handleChangedDeviceEvent(changedEvent) {

    let value= (changedEvent.currentTarget.checked);
    let newVal={conf:{[this.config.model]:{devices:{[this.device.name]:{elements:{[changedEvent.target.id]:{disabled_if:value}}}}}}};
    let newConfig = JSON.parse(JSON.stringify(this.user_config));
    try{
      newConfig.conf[this.config.model].devices[this.device.name].elements[changedEvent.target.id].disabled_if = value;
    }
    catch (error){
      newConfig=merge(newConfig,newVal);
    }
    const messageEvent = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }
  
  handleChangedEvent(changedEvent) {
    let i_val=changedEvent.currentTarget.value;
    const head=changedEvent.target.id.split('-')[0];
    const field=changedEvent.target.id.split('-')[1]
    if (field=="color"){
      i_val=hexToRgb(i_val);
    }
    let newVal={conf:{[this.config.model]:{devices:{[this.device.name]:{heads:{[head]:{[field]:i_val}}}}}}};
    let newConfig = JSON.parse(JSON.stringify(this.user_config));
    
    try{
      newConfig.conf[this.config.model].devices[this.device.name].heads[changedEvent.target.head][field] = i_val;
    }
    catch (error){
      newConfig=merge(newConfig,newVal);
    }
    const messageEvent = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }// end of function handleChangedEvent

  is_checked(id){
    let result=false;
    if("disabled_if" in this.config.elements[id]){
      result=this.config.elements[id].disabled_if;
    }
    if(result){
      return html`
                   <label class="switch">
                      <input type="checkbox" id="${id}" @change="${this.handleChangedDeviceEvent}" checked />
                      <span class="slider round"></span>
                   </label>
                   <label>${i18n._(id)}</label>                   
`;
    }
    else{
      return html`
                   <label class="switch">
                      <input type="checkbox" id="${id}"  @change="${this.handleChangedDeviceEvent}" />
                      <span class="slider round"></span>
                   </label>
                   <label>${i18n._(id)}</label>                   
`;
    }
  }// end of function is_checked  

  override renderEditor(): TemplateResult {
    if(this.is_disabled()){
      return html``;
    }
    this._populate_entities_with_heads();
    this.update_config();
    
    return html`
                 <hr />
                 <style>
/* The switch - the box around the slider */                   .switch {
                     position: relative;
                     display: inline-block;
                     width: 30px;
                     height: 17px;

                   }

/* Hide default HTML checkbox */                   .switch input {
                     opacity: 0;
                     width: 0;
                     height: 0;
                   }
                   
/* The slider */                   .slider {
                     position: absolute;
                     cursor: pointer;
                     top: 0;
                     left: 0;
                     right: 0;
                     bottom: 0;
                     background-color: #ccc;
                     -webkit-transition: .4s;
                     transition: .4s;
                   }
                   
                   .slider:before {
                     position: absolute;
                     content: "";
                     height: 13px;
                     width: 13px;
                     left: 2px;
                     bottom: 2px;
                     background-color: white;
                     -webkit-transition: .4s;
                     transition: .4s;
                   }
                   
                   input:checked + .slider {
                     background-color: #2196F3;
                   }
                   
                   input:focus + .slider {
                     box-shadow: 0 0 1px #2196F3;
                   }
                   
                   input:checked + .slider:before {
                     -webkit-transform: translateX(13px);
                     -ms-transform: translateX(13px);
                     transform: translateX(13px);
                   }
                   
/* Rounded sliders */                   .slider.round {
                     border-radius: 17px;
                   }
                   
                   .slider.round:before {
                     border-radius: 50%;
                   }
                 </style>
                   <form id="heads_colors">
                   <table>
                   <tr><td>
${this.is_checked("last_message")}
                   </td><td>
${this.is_checked("last_alert_message")}
                   </td></tr>
                   <tr>
                     <td class="config_header">${i18n._("heads_colors")}</td>
                     <td>${i18n._("heads_shortcuts")}</td>
                   </tr>
                     ${Array.from({length:this.config.heads_nb},(x,i) => i+1).map(head => this._editor_head_color(head))}
                 </table>
                   </form>`;
    
  }// end of function renderEditor
}



export class RSDose4 extends RSDose{

  constructor(){
    super();
    this.initial_config=config4;
  }// end of constructor
}

export class RSDose2 extends RSDose{

  constructor(){
    super();
    this.initial_config=config2;
  }// end of constructor
}
