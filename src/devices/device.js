import { html,LitElement } from "lit";

import i18n from "../translations/myi18n.js";

import Switch from "./base/switch";
import Button from "./base/button";
import Sensor from "./base/sensor";

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
	console.debug("RSDevice.update_config for ",this.device);
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

    _press(button){
	console.log("button pressed: :"+this.entities[button.name].entity_id);
	//	this.hass.callService("button", "press", {entity_id: this.entities[button.name].entity_id});
	
    }
    _toggle(swtch){
	console.log(this.entities);
	console.log(swtch);
	var entity_id=this.entities[swtch.name].entity_id ;
	console.log("toggle switch: "+entity_id);
	//	this.hass.callService("switch", "toggle", {entity_id: this.entities[swtch.name].entity_id});
	const actionConfig = {
	    entity: entity_id,
	    tap_action: {
		action: "more-info",
	    },
	};

	// Open more info on tap action
	const event = new Event("hass-action", {
	    bubbles: true,
	    composed: true,
	});
	event.detail = {
	    config: actionConfig,
	    action: "tap",
	};
	
	console.log("EVENT ***");
	console.log(event);
	this.dispatchEvent(event);
	
	/*	let e = new Event('hass-more-info', { composed: true });
	e.detail = { entity_id};
	console.log(e);
	let res=this.dispatchEvent(e);
	console.log(res);*/
    }

    _render_disabled(){
	return html`<div class="device_bg">
                          <img class="device_img_disabled" id=d_img" alt=""  src='${this.config.background_img}'/>
                          <p class='disabled_in_ha'>${i18n._("disabledInHa")}</p>
                        </div">`;
    }//end of function _render_disabled
    
    ////////////////////////////////////////////////////////////////////////////////
    // ACTUATORS

    _render_switch(mapping_conf){
	let label_name='';
	// Don not display label
	if ('label' in mapping_conf && mapping_conf.label!=false){
	    label_name=mapping_conf.name;
	}
        return html`
<div class="${mapping_conf.class}">
<common-switch .hass="${this.hass}" .conf="${mapping_conf}" .color="${this.config.color}" .alpha="${this.config.alpha}" .stateObj="${this.hass.states[this.entities[mapping_conf.name].entity_id]}"></common-switch>
</div>
`;
    }

    _render_button(mapping_conf){
	console.debug("devices.device._render_button",mapping_conf);
	console.debug("devices.device._render_button entities",this.entities);
	console.debug("devices.device._render_button states",this.hass.states);
	let entity=this.entities[mapping_conf.name];
	let stateObject=this.hass.states[entity.entity_id];
	return html`
<div class="${mapping_conf.class}">
<common-button .hass="${this.hass}" .conf="${mapping_conf}" .color="${this.config.color}" .alpha="${this.config.alpha}" .stateObj="${stateObject}"></common-button>
</div>
	`;
    }
    
    _render_actuators_type(type){
	if (type.name in this.config){
	    return html`${this.config[type.name].map(actuator => type.fn.call(this,actuator))}`;
	}
	console.log("No "+type.name);
	return html``;
    }
    
    
    _render_actuators(){
	let actuators=[{"name":"buttons","fn":this._render_button},{"name":"switches","fn":this._render_switch}];
	return html `
                     ${actuators.map(type => this._render_actuators_type(type))}
                      `;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // SENSORS
    _render_sensors(){
	let sensors=[{"name":"sensors","fn":this._render_sensor}];
	return html `
                     ${sensors.map(type => this._render_sensors_type(type))}
                      `;
    }

    _render_sensors_type(type){
	if (type.name in this.config){
	    return html`${this.config[type.name].map(sensor => type.fn.call(this,sensor))}`;
	}
	console.log("No "+type.name);
	return html``;
    }

    _render_sensor(mapping_conf){
	if ('disabled' in mapping_conf && mapping_conf.disabled==true){
	    return html``;
	}
	    
	let label_name='';
	// Don not display label
	if ('label' in mapping_conf && mapping_conf.label!=false){
	    label_name=mapping_conf.name;
	}
        return html`
<div class="${mapping_conf.name}">
<common-sensor .hass="${this.hass}" .conf="${mapping_conf}" .color="${this.config.color}" .alpha="${this.config.alpha}" .stateObj="${this.hass.states[this.entities[mapping_conf.name].entity_id]}"></common-sensor>
</div>
`;
    }//end of function _render_sensor
    
    
}
window.customElements.define('rs-device', RSDevice);

