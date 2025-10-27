import { html, LitElement } from "lit";

import i18n from "../translations/myi18n.js";

import Switch from "./base/switch";

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
	    device:{},
	    user_config: {}
	}
    }
    
    constructor(config,hass,device,user_config){
	super();
	this.hass = hass;
	this.device = device;
	this.config=config;
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
	if (this.first_init){
	    console.debug("RSDevice.update_config for ",this.device);
	    if ("conf" in this.user_config){
		console.debug("User config detected");
		console.debug(this.user_config.conf);
		if (this.device.elements[0].model in this.user_config.conf){
		    let device_conf=this.user_config.conf[this.device.elements[0].model];
		    if ('common' in device_conf){
			this.find_leaves(device_conf['common'],"this.config");
			if ('devices' in device_conf && this.device.name in device_conf.devices){
			    console.log(this.device.name);
			    this.find_leaves(device_conf['devices'][this.device.name],"this.config");
			}
		    }//if
		    //apply new params
		}//if
	    }//if
	    this.first_init=false;
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


    _render_switch(swtch){
	// console.log("RENDER switch");
	// console.log(swtch);
	// console.log(this.config);
	// console.log(this.entities[swtch.name]);
	// console.log(this.hass.states[this.entities[swtch.name].entity_id]);
	//<ha-entity-toggle .hass="${this.hass}" .label="${label_name}" .stateObj="${this.hass.states[this.entities[swtch.name].entity_id]}"></ha-entity-toggle>
	let label_name=swtch.name;
	// Don not display label
	if ('label' in swtch && swtch.label==false){
	    label_name='';
	}
	//<common-switch class="on_off" .hass="${this.hass}" .label="${label_name}" .stateObj="${this.hass.states[this.entities[swtch.name].entity_id]}></common-switch>
	console.log("**//**/*/*/*/");
	console.log(this.entities[swtch.name].entity_id);
	console.log(this.hass.states[this.entities[swtch.name].entity_id]);
        return html`
<!--  <style>
      #${swtch.name}:hover {
background-color: rgba(${this.config.color},${this.config.alpha});
}
</style>
<div id="${swtch.name}" class="${swtch.class}" @click="${() => this._toggle(swtch)}"> -->
<div class="${swtch.class}">
<common-switch class="on_off" .hass="${this.hass}" .label="${label_name}"  .stateObj="${this.hass.states[this.entities[swtch.name].entity_id]}"></common-switch>
</div>
`;
//         return html`
//  <style>
//       #${swtch.name}:hover {
// background-color: rgba(${this.config.color},${this.config.alpha});
// }
// </style>
// <div id="${swtch.name}" class="${swtch.class}" @click="${() => this._toggle(swtch)}">
// <ha-entity-toggle width="500px" .hass="${this.hass}" .label="${label_name}" .stateObj="${this.hass.states[this.entities[swtch.name].entity_id]}"></ha-entity-toggle>
// </div>
// `;
    }


    _render_button(button){
	console.log("RENDER button");
	console.log(button);
	console.log(this.config);
        return html`
 <style>
      #${button.name}:hover {
background-color: rgba(${this.config.color},${this.config.alpha});
}
</style>
<div id="${button.name}" class="${button.class}" @click="${() => this._press(button)}"></div>
`;
    }
    

    _render_actuators_type(type){
	if (type.name in this.config){
	    console.log("Render "+type.name);
	    console.log(this.config);
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

    _render_disabled(){
	return html`<div class="device_bg">
                          <img class="device_img_disabled" id=d_img" alt=""  src='${this.config.background_img}'/>
                          <p class='disabled_in_ha'>${i18n._("disabledInHa")}</p>
                        </div">`;
    }// end of function -- _render_disabled
}
window.customElements.define('rs-device', RSDevice);

