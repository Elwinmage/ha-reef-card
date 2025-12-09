import { html,LitElement } from "lit";

import i18n from "../translations/myi18n.js";

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
    
    static get properties() {
	return {
	    hass: {},
	    config: {},
	    initial_config: {},
	    device:{},
	    user_config: {},
	    _dialog_box: {}
	}
    }
    
    constructor(i_config,hass,device,user_config){
	super();
	this.hass = hass;
	this.device = device;
	this.initial_config=i_config;
	this.config=i_config;
	this.user_config=user_config;
	this.entities={};
	this.first_init=true;
	this._dialog_box=null;
    }

    config_dialog_box(){
	this._dialog_box=dialog_box;
	console.debug("config_dialog_box",this.config)
	this._dialog_box.set_conf(this.config.dialogs);
	this.hass['redsea_dialog_box']=this._dialog_box;
    }
    
    get_entity(entity_translation_value){
	return this.hass.states[this.entities[entity_translation_value].entity_id];
    }//end of function get_entity
    
    find_leaves(tree,path){
	var keys = Object.keys(tree);
	if (keys[0]=='0'){
	    eval(path+'="'+tree+'"');
	    return;
	}
	for (var key of keys){
	    let sep='.';
	    let ipath=path+sep+key;
	    this.find_leaves(tree[key],ipath);
	}
    }
        
    update_config(){
	this.config=JSON.parse(JSON.stringify(this.initial_config));
	if ("conf" in this.user_config){
	    if (this.device.elements[0].model in this.user_config.conf){
		let device_conf=this.user_config.conf[this.device.elements[0].model];
		if ('common' in device_conf){
		    this.find_leaves(device_conf['common'],"this.config");
		}//if
		if ('devices' in device_conf && this.device.name in device_conf.devices){
		    console.log(this.device.name);
		    this.find_leaves(device_conf['devices'][this.device.name],"this.config");
		}
	    }//if
	}//if
    }//end of function update_config
    
    _populate_entities(){
	for (var entity_id in this.hass.entities){
	    var entity=this.hass.entities[entity_id];
	    if(entity.device_id == this.device.elements[0].id){
		this.entities[entity.translation_key]=entity;

	    }
	}
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


    is_on(){
	return (this.hass.states[this.entities['device_state'].entity_id].state=='on');
    }

    
    _render_disabled(){
	let reason =null;
	let maintenance_button='';
	if (this.is_disabled()){
	    reason="disabledInHa";
	}
	else if (this.hass.states[this.entities['maintenance'].entity_id].state=='on'){
	    reason="maintenance";
	    for ( let swtch of this.config.switches){
		if (swtch.name=="maintenance"){
		    maintenance_button=this._render_switch(this.config.switches[1],true);
		}//if
	    }//for
	}// else if
	if (reason==null){
	    return reason;
	}
	return html`<div class="device_bg">
                          <img class="device_img_disabled" id=d_img" alt=""  src='${this.config.background_img}'/>
                          <p class='disabled_in_ha'>${i18n._(reason)}</p>
${maintenance_button}
                        </div">`;
    }//end of function _render_disabled


    get_style(conf){
	let style='';
	if(conf && 'css' in conf){
	    style=Object.entries(conf.css).map(([k, v]) => `${k}:${v}`).join(';');
	}
	return style;
    }//end of function get_style
    
    ////////////////////////////////////////////////////////////////////////////////
    // ACTUATORS

    _render_switch(mapping_conf,state){
	let label_name='';
	// Don not display label
	if ('label' in mapping_conf){
	    if (typeof mapping_conf.label === 'string' ){
		label_name=mapping_conf.label;
	    }
	    else if(typeof mapping_conf.label === 'boolean' && mapping_conf.label!=false){ 
		label_name=mapping_conf.name;
	    }
	}
	let color=this.config.color;
	if (! state){
	    color=off_color;
	}
        return html`
<div class="${mapping_conf.class}" style="${this.get_style(mapping_conf)}">
<common-switch .hass="${this.hass}" .conf="${mapping_conf}" .color="${color}" .alpha="${this.config.alpha}" .stateObj="${this.hass.states[this.entities[mapping_conf.name].entity_id]}" .label="${label_name}"></common-switch>
</div>
`;
    }

    _render_button(mapping_conf,state){
	let entity=this.entities[mapping_conf.name];
	let stateObject=this.hass.states[entity.entity_id];
	let color=this.config.color;
	if (! state){
	    color=off_color;
	}
	return html`
<div class="${mapping_conf.class}" style="${this.get_style(mapping_conf)}">
<common-button .hass="${this.hass}" .conf="${mapping_conf}" .color="${color}" .alpha="${this.config.alpha}" .stateObj="${stateObject}"></common-button>
</div>
	`;
    }
    
    _render_actuators_type(type,state){
	if (type.name in this.config){
	    return html`${this.config[type.name].map(actuator => type.fn.call(this,actuator,state))}`;
	}
	return html``;
    }
    
    
    _render_actuators(state){
	let actuators=[{"name":"buttons","fn":this._render_button},{"name":"switches","fn":this._render_switch}];
	return html `
                     ${actuators.map(type => this._render_actuators_type(type,state))}
                      `;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // SENSORS
    _render_sensors(state=true,put_in=null){
	let sensors=[{"name":"sensors","fn":this._render_sensor},{"name":"sensors_target","fn":this._render_sensor_target},{"name":"progress_bar","fn":this._render_progress_bar}];
	return html `
                     ${sensors.map(type => this._render_sensors_type(type,state,put_in))}
                      `;
    }

    _render_sensors_type(type,state,put_in){
	if (type.name in this.config){
	    return html`${this.config[type.name].map(sensor => type.fn.call(this,sensor,state,put_in))}`;
	}
	return html``;
    }

    _render_sensor(mapping_conf,state,put_in){
	let sensor_put_in=null;
	if ("put_in" in mapping_conf){
	    sensor_put_in=mapping_conf.put_in;
	}
	if ( ('disabled' in mapping_conf && mapping_conf.disabled==true) || 
	     (sensor_put_in!=put_in) ){
	    return html``;
	}
	    
	let label_name='';
	// Don not display label
	if ('label' in mapping_conf && mapping_conf.label!=false){
	    label_name=mapping_conf.name;
	}
	let color=this.config.color;
	if (! state){
	    color=off_color;
	}
        return html`
<div class="${mapping_conf.class}" style="${this.get_style(mapping_conf)}">
<common-sensor .hass="${this.hass}" .conf="${mapping_conf}" .color="${color}" .alpha="${this.config.alpha}" .stateObj="${this.hass.states[this.entities[mapping_conf.name].entity_id]}"></common-sensor>
</div>
`;
    }//end of function _render_sensor


    _render_progress_bar(mapping_conf,state,put_in){
	let sensor_put_in=null;
	if ("put_in" in mapping_conf){
	    sensor_put_in=mapping_conf.put_in;
	}
	if ( ('disabled' in mapping_conf && mapping_conf.disabled==true) || 
	     (sensor_put_in!=put_in) ){
	    return html``;
	}
	    
	let label_name='';
	// Don not display label
	if ('label' in mapping_conf && mapping_conf.label!=false){;
	    label_name=mapping_conf.name;
	}
	let color=this.config.color;
	if (! state){
	    color=off_color;
	}
	let type="progress-bar";
	if ( "type" in mapping_conf){
	    type=mapping_conf.type;
	}
	switch (type){
	case "progress-circle":
	    return html`<div class=${mapping_conf.class} style="${this.get_style(mapping_conf)}">
<progress-circle .hass="${this.hass}" .conf="${mapping_conf}" .color="${color}" .alpha="${this.config.alpha}" .stateObj="${this.hass.states[this.entities[mapping_conf.name].entity_id]}" .stateObjTarget="${this.hass.states[this.entities[mapping_conf.target].entity_id]}" .entities="${this.entities}"></progress-circle>
</div>`;
	    break;
	case "progress-bar":
	default:
            return html`
<div class=${mapping_conf.class} style="${this.get_style(mapping_conf)}">
<progress-bar .hass="${this.hass}" .conf="${mapping_conf}" .color="${color}" .alpha="${this.config.alpha}" .stateObj="${this.hass.states[this.entities[mapping_conf.name].entity_id]}" .stateObjTarget="${this.hass.states[this.entities[mapping_conf.target].entity_id]}" .entities="${this.entities}"></progress-bar>
</div>
`;
	    break;
	}
    }//end of function _render_sensor

    _render_sensor_target(mapping_conf,state,put_in){
	let sensor_put_in=null;
	if ("put_in" in mapping_conf){
	    sensor_put_in=mapping_conf.put_in;
	}
	if ( ('disabled' in mapping_conf && mapping_conf.disabled==true) || 
	     (sensor_put_in!=put_in) ){
	    return html``;
	}
	    
	let label_name='';
	// Don not display label
	if ('label' in mapping_conf && mapping_conf.label!=false){
	    label_name=mapping_conf.name;
	}
	let color=this.config.color;
	if (! state){
	    color=off_color;
	}
        return html`
<div class="${mapping_conf.class}" style="${this.get_style(mapping_conf)}">
<common-sensor-target .hass="${this.hass}" .conf="${mapping_conf}" .color="${color}" .alpha="${this.config.alpha}" .stateObj="${this.hass.states[this.entities[mapping_conf.name].entity_id]}" .stateObjTarget="${this.hass.states[this.entities[mapping_conf.target].entity_id]}"></common-sensor-target>
</div>
`;
    }//end of function _render_sensor

}
window.customElements.define('rs-device', RSDevice);

