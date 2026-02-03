import { TemplateResult, LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { property } from 'lit/decorators.js';
import DeviceList from "../common";
import { MyElement }  from "./base/element";
import { merge } from "../merge";
import i18n from "../translations/myi18n";

import type { HassConfig, Device, DeviceInfo } from "../types/index";



@customElement('rs-device')
export class RSDevice extends LitElement {

  public entities: Record<string, any> = {};
  public config: any; 
  
  protected _hass: HassConfig | null = null;
  protected device: DeviceInfo | null = null;
  protected initial_config: any;
  protected user_config: any;
  protected _elements: any = [];

  @property ()
  to_render: boolean = false;
  
  constructor() {
    super();
  }

  render(){
    return this._render();
  }

  _render(){
    return html`RSDEVICE Base class`;
  }

  _setting_hass(obj){
    this._hass=obj;
    let re_render=false;
    for (let element in this._elements){
      let elt = this._elements[element];
      if ('master' in elt.conf && elt.conf.master){
	if(elt.has_changed(obj)){
	  re_render=true;
	}
      }
      elt.hass=obj;
    }
    if(re_render){
      this.to_render=true;
      this.render();
    }
  }
  
  set hass(obj: HassConfig) {
    this._setting_hass(obj);
  }

  get hass(): HassConfig | null {
    return this._hass;
  }

  setConfig(config: any): void {
    this.user_config = config;
  }

  /**
   * Recursively sets nested properties in a target object
   * Replaces the unsafe eval() version
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    
    // Navigate to the parent of the target property
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    // Set the final property
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
  }

  /**
   * Find and apply leaf values to configuration
   * Safe replacement for eval()-based find_leaves
   */
  private applyLeaves(tree: any, basePath: string = ''): void {
    const keys = Object.keys(tree);
    
    // Check if this is a leaf node (array-like object with numeric keys)
    if (keys.length > 0 && keys[0] === '0') {
      // This is a leaf value, apply it to the config
      this.setNestedProperty(this.config, basePath, tree);
      return;
    }
    
    // Recursively process child nodes
    for (const key of keys) {
      const newPath = basePath ? `${basePath}.${key}` : key;
      this.applyLeaves(tree[key], newPath);
    }
  }

  get_entity(entity_translation_value: string): any {
    if (!this._hass || !this.entities) {
      return null;
    }
    const entity = this.entities[entity_translation_value];
    if (!entity) {
      return null;
    }
    return this._hass.states[entity.entity_id];
  }

  update_config(): void {
    this.config = JSON.parse(JSON.stringify(this.initial_config));
    
    if (this.user_config && "conf" in this.user_config && this.device) {
      const model = this.device.elements[0].model;
      
      if (model && model in this.user_config.conf) {
        const device_conf = this.user_config.conf[model];
        
        // Apply common configuration
        if ('common' in device_conf) {
          this.applyLeaves(device_conf.common);
        }
        
        // Apply device-specific configuration
        if ('devices' in device_conf && this.device.name in device_conf.devices) {
          this.config = merge(
            this.config,
            this.user_config.conf[model].devices[this.device.name]
          );
        }
      }
    }
    
    // Send dialogs configuration
    if (this.config.dialogs) {
      this.dispatchEvent(
        new CustomEvent("config-dialog", {
          bubbles: true,
          composed: true,
          detail: {
            dialogs: this.config.dialogs,
            device: this
          }
        })
      );
    }
  }

  static create_device(
    tag_name: string,
    hass: HassConfig,
    config: any,
    device: DeviceInfo
  ): RSDevice | null {
    const Element = customElements.get(tag_name);
    
    if (!Element) {
      console.error(`Custom element ${tag_name} not found`);
      return null;
    }
    
    const elt = new (Element as any)() as RSDevice;
    elt.hass = hass;
    elt.device = device;
    elt.setConfig(config);
    
    return elt;
  }

  /*
   * Get all entities linked to this redsea device
   */
  _populate_entities(){
    if (this._hass && this.device){
      for (const entity of this._hass.entities || []){
        if(entity.device_id == this.device.elements[0]?.id){
          this.entities[entity.translation_key]=entity;
        }
      }
    }
    else {
      console.error("_populate_entities() failed, _hass or device object is null");
    }
  }//end of function - _populate_entities

  /*
   * Check is the current device is disabled or not
   */
  is_disabled(){
    if (!this.device) return true;
    
    let disabled=false;
    let sub_nb=this.device.elements.length;
    for( let i = 0; i<sub_nb; i++){
      if (this.device.elements[i]?.disabled_by!=null){
        disabled=true;
        break;
      }
    }
    return disabled;
  }//end of function is_disabled


  /*
   * Get the state of the device on or off.
   */
  is_on(): boolean{
    if (!this._hass || !this.entities['device_state']) return false;
    return (this._hass.states[this.entities['device_state'].entity_id]?.state=='on');
  }//end of function - is_on

  /*
   * Special render if the device is disabled or in maintenance mode in HA
   */
  _render_disabled(){
    let reason: string | null = null;
    let maintenance : TemplateResult  = html``;
    
    if (this.is_disabled()){
      reason="disabledInHa";
    }
    else if (this._hass && this.entities['maintenance'] && 
             this._hass.states[this.entities['maintenance'].entity_id]?.state=='on'){
      reason="maintenance";
      // if in maintenance mode, display maintenance switch
      let elements: any[] =[];
      for(const i in this.config.elements){
        elements.push(this.config.elements[i]);
      }

      for ( const swtch of elements){
        if (swtch.name=="maintenance"){
          if (this._hass) {
            let maintenance_button=MyElement.create_element(this._hass,swtch,this);
            maintenance=html`${maintenance_button}`;
          }
          break;
        }
      }
    }
    
    if (reason==null){
      return null;
    }
    
    return html`<div class="device_bg">
<img class="device_img_disabled" id=d_img" alt=""  src='${this.config.background_img}'/>
<p class='disabled_in_ha'>${i18n._(reason)}</p>
${maintenance}
</div">`;
  }//end of function _render_disabled

  /*
   * Build a css style string according to given json configuration
   * @conf: the css definition
   */
  get_style(conf){
    let style='';
    if(conf && 'css' in conf){
      style=Object.entries(conf.css).map(([k, v]) => `${k}:${v}`).join(';');
    }
    return style;
  }//end of function get_style
  
  /*
   * Render a single element: switch, sensor...
   * @conf: the json configuration for the element
   * @state: the state of the device on or off to adapt the render
   * @put_in: a grouping div to put element on
   */
  _render_element(conf: any, state: boolean, put_in: string | null){
    let sensor_put_in=null;
    //Element is groupped with others 
    if ("put_in" in conf){
      sensor_put_in=conf.put_in;
    }

    //Element is disabled or not in the requested group
    if ( ('disabled' in conf && conf.disabled==true) || 
         (sensor_put_in!=put_in) ){
      return html``;
    }
    
    let element: MyElement | null = null;
    if (conf.name in this._elements){
      element= this._elements[conf.type+'.'+conf.name];
      if (element) {
        element.stateOn=state;
      }
    }
    else {
      if (this._hass) {
        element=MyElement.create_element(this._hass,conf,this);
        this._elements[conf.type+'.'+conf.name]=element;
      }
    }
    return html`${element}`;
  }//end of function - _render_actuator
  
  /*
   * Render all elements that are declared in the configuration of the device
   * @state: the state of the device on or off to adapt the render
   * @put_in: a grouping div to put element on
   */
  _render_elements(state: boolean, put_in: string | null=null){
    let elements: any[] = [];
    for(const i in this.config.elements){
      elements.push(this.config.elements[i]);
    }
    return html `${elements.map(conf => this._render_element(conf,state,put_in))}`;
  }//end of function - _render_elements

}

export default RSDevice;
