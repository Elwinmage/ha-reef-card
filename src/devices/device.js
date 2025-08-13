import { html, LitElement } from "lit";

/*
 * RSDose 
 */
export default class RSDevice extends LitElement {

    static get properties() {
	return {
	    hass: {},
	    config: {},
	    device:{},
	}
    }
    
    constructor(config,hass,device){
	super();
	this.hass = hass;
	this.device = device;
	this.config=config;
	this.entities={};

    }

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
	console.log("RENDER switch");
	console.log(swtch);
	console.log(this.config);
	console.log(this.entities[swtch.name]);
	console.log(this.hass.states[this.entities[swtch.name].entity_id]);
        return html`
 <style>
      #${swtch.name}:hover {
background-color: rgba(${this.config.color},${this.config.alpha});
}
</style>
<ha-entity-toggle .hass="${this.hass}" .label="${swtch.name}" .stateObj="${this.hass.states[this.entities[swtch.name].entity_id]}"></ha-entity-toggle>
<div id="${swtch.name}" class="${swtch.class}" @click="${() => this._toggle(swtch)}"></div>
`;
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
}
window.customElements.define('rs-device', RSDevice);

