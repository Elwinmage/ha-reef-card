import { html,LitElement } from "lit";
import i18n from "../translations/myi18n.js";

import MyElement from "./base/element";

import Switch from "./base/switch";
import Button from "./base/button";
import Sensor from "./base/sensor";
import ProgressBar from "./base/progress_bar";
import ProgressCircle from "./base/progress_circle";
import SensorTarget from "./base/sensor_target";

import {off_color} from "../common.js";

import style_common from "./common.styles";

import dialog_box from "./base/dialog";

let iconv = i18n;

/*
 * RSDevice
 */
export default class RSDevice extends LitElement {

    static styles = [style_common];
    
    // Device is updated when hass is updated
   static get properties() {
	return {
	    //_hass: {},
	}
    }// end of reactives properties

    /*
     * Construct a new Redsea LitElement of type name
     * @name: type of device: redsea-rsdose2, redsea-rswave...
     * @hass: the homeassistant states
     * @config: the user configuration file
     * @device: the hass redsea device 
     */
    static create_device(name,hass,config,device){
	let Element=customElements.get(name);
	if ( typeof Element=="undefined"){
	    Element=customElements.get("redsea-nodevice");
	}
	let elt=new Element();
	elt.hass=hass;
	elt.user_config=config;
	elt.device=device;
	return elt;
    }// end of - create_device

    /*
     * CONSTRUCTOR
     */
    constructor(){
	super();
	this.entities={};
	this._elements=[];
	this.first_init=true;
	this._dialog_box=null;
    }//end of constructor

    set hass(obj){
	this._hass=obj;
	for (let element in this._elements){
	    let elt = this._elements[element];
	    elt.hass=obj;
	}
    }

    /*
     * Load available dialog box for the current device
     */
    config_dialog_box(){
	this._dialog_box=dialog_box;
	this._dialog_box.set_conf(this.config.dialogs);
	this._hass['redsea_dialog_box']=this._dialog_box;
    }// end of config_dialog_box

    /*
     * Return  the hass entity id according to it's translation key
     * Entities list must be populate before with this._populate_entities()
     * @entity_translation_value: a strign representation the translation key of the entity
     */
    get_entity(entity_translation_value){
	return this._hass.states[this.entities[entity_translation_value].entity_id];
    }//end of function get_entity


    /*
     * Find leaves on a json configuration object
     * @tree: the current json object to search for
     * @path: the path to search for leaves
     */
    find_leaves(tree,path){
	var keys = Object.keys(tree);
	if (keys[0]=='0'){
	    eval(path+'="'+tree+'"');
	    return;
	}//if
	for (var key of keys){
	    let sep='.';
	    let ipath=path+sep+key;
	    this.find_leaves(tree[key],ipath);
	}//for
    }//end of function - find_leaves

    /*
     * Update default configuration with user values changes
     */
    update_config(){
	this.config=JSON.parse(JSON.stringify(this.initial_config));
	if (this.user_config && "conf" in this.user_config){
	    if (this.device.elements[0].model in this.user_config.conf){
		let device_conf=this.user_config.conf[this.device.elements[0].model];
		if ('common' in device_conf){
		    this.find_leaves(device_conf['common'],"this.config");
		}//if
		if ('devices' in device_conf && this.device.name in device_conf.devices){
		    this.find_leaves(device_conf['devices'][this.device.name],"this.config");
		}
	    }//if
	}//if
    }//end of function update_config
    
    /*
     * Get all entities linked to this redsea device
     */
    _populate_entities(){
	for (var entity of this._hass.entities){
	    if(entity.device_id == this.device.elements[0].id){
		this.entities[entity.translation_key]=entity;
	    }//if
	}//for
    }//end of function - _populate_entities

    /*
     * Check is the current device is disabled or not
     */
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


    /*
     * Get the state of the device on or off.
     */
    is_on(){
	return (this._hass.states[this.entities['device_state'].entity_id].state=='on');
    }//end of function - is_on

    /*
     * Special render if the device is disabled or in maintenance mode in HA
     */
    _render_disabled(){
	let reason =null;
	let maintenance='';
	if (this.is_disabled()){
	    reason="disabledInHa";
	}
	else if (this._hass.states[this.entities['maintenance'].entity_id].state=='on'){
	    reason="maintenance";
	    // if in maintenance mode, display maintenance switch
	    for ( let swtch of this.config.elements){
		if (swtch.name=="maintenance"){
		    let maintenance_button=MyElement.create_element(this._hass,swtch,this.config.color,this.config.alpha,true,this.entities);
		    maintenance=html`
                                      ${maintenance_button}
                                    `;
		    break;
		}//if
	    }//for
	}// else if
	if (reason==null){
	    return reason;
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
     * Render a sungle element: switch, sensor...
     * @conf: the json configuration for the element
     * @state: the state of the device on or off to adapt the render
     * @put_in: a grouping div to put element on
     */
    _render_element(conf,state,put_in){
	let sensor_put_in=null;
	//Element is groupped with others 
	if ("put_in" in conf){
	    sensor_put_in=conf.put_in;
	}//if

	//Element is disabled or not i nthe requested group
	if ( ('disabled' in conf && disabled==true) || 
	     (sensor_put_in!=put_in) ){
	    return html``;
	}//if
	
	let element = null;
	if (conf.name in this._elements){
	    element= this._elements[conf.type+'.'+conf.name];
	    element.state_on=state;
	}
	else {
	    element=MyElement.create_element(this._hass,conf,this.config.color,this.config.alpha,state,this.entities);
	    this._elements[conf.type+'.'+conf.name]=element;
	    console.debug(this._elements);
	}
        return html`
                       ${element}
                     `;
    }//end of function - _render_actuator

    /*
     * Render all elements that are declared in the configuration of the device
     * @state: the state of the device on or off to adapt the render
     * @put_in: a grouping div to put element on
     */
    _render_elements(state,put_in=null){
	return html `
                     ${this.config.elements.map(conf => this._render_element(conf,state,put_in))}
                     `;
    }//end of function - _render_elements
    
}//end of class RSDevice

window.customElements.define('rs-device', RSDevice);
