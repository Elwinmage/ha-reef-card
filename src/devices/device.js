import { html,LitElement } from "lit";

import i18n from "../translations/myi18n.js";

import Switch from "./base/switch";
import Button from "./base/button";
import Sensor from "./base/sensor";
import ProgressBar from "./base/progress_bar";
import SensorTarget from "./base/sensor_target";

import {off_color} from "../common.js";

import style_common from "./common.styles";

/*
 * RSDose 
 */

export default class RSDevice extends LitElement {


    static styles = [style_common];
    
    static get properties() {
	return {
	    hass: {},
	    config: {},
	    initial_config: {},
	    device:{},
	    user_config: {}
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
    }

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
	    console.debug("User config detected: ", this.user_config.conf);
	    console.debug("Initial config: ", this.initial_config);
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

    is_on(){
	return (this.hass.states[this.entities['device_state'].entity_id].state=='on');
    }
    
    _render_disabled(){
	return html`<div class="device_bg">
                          <img class="device_img_disabled" id=d_img" alt=""  src='${this.config.background_img}'/>
                          <p class='disabled_in_ha'>${i18n._("disabledInHa")}</p>
                        </div">`;
    }//end of function _render_disabled
    
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
<div class="${mapping_conf.class}">
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
<div class="${mapping_conf.class}">
<common-button .hass="${this.hass}" .conf="${mapping_conf}" .color="${color}" .alpha="${this.config.alpha}" .stateObj="${stateObject}"</common-button>
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
<div class="${mapping_conf.class}">
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
	console.debug("Progress-bar:",this.hass.states[this.entities[mapping_conf.name].entity_id],this.hass.states[this.entities[mapping_conf.target].entity_id]);
        return html`
<div class=${mapping_conf.class}>
<progress-bar .hass="${this.hass}" .conf="${mapping_conf}" .color="${color}" .alpha="${this.config.alpha}" .stateObj="${this.hass.states[this.entities[mapping_conf.name].entity_id]}" .stateObjTarget="${this.hass.states[this.entities[mapping_conf.target].entity_id]}"></progress-bar>
</div>
`;
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
<div class="${mapping_conf.class}">
<common-sensor-target .hass="${this.hass}" .conf="${mapping_conf}" .color="${color}" .alpha="${this.config.alpha}" .stateObj="${this.hass.states[this.entities[mapping_conf.name].entity_id]}" .stateObjTarget="${this.hass.states[this.entities[mapping_conf.target].entity_id]}"></common-sensor-target>
</div>
`;
    }//end of function _render_sensor

}
window.customElements.define('rs-device', RSDevice);

