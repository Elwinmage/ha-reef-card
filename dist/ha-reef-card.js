import {
    LitElement,
    html,
    unsafeCSS,
} from "./lit-core.min.js";

import NoDevice,{style_nodevice} from "/local/community/ha-reef-card/devices/nodevice/nodevice.js";
import RSDose,{style_rsdose} from "/local/community/ha-reef-card/devices/rsdose/rsdose.js";
import RSMat, {style_rsmat}  from "./devices/rsmat/rsmat.js";
import RSRun, {style_rsrun} from "./devices/rsrun/rsrun.js";

class ReefCard extends LitElement {

    static get properties() {
	return {
	    hass: {},
	    config: {},
	    select_devices: {type: Array},
	    current_device: {type: String},
	    version: {type: String},
	    progs: {type: Array},
	    devices: {},
	    current_device: {}
	};
    }

   
    constructor() {
	super();
	this.version='v0.0.1';
	this.select_devices=[{value:'unselected',text:"Select a device"}];
	this.first_init=true;
	this.devices={};
	this.no_device= new NoDevice();
	this.current_device=this.no_device;
    }
    
    render() {
	if(this.first_init==true){
	    this.init_devices();
	    this.first_init=false;
	}
	return html`
          ${this.device_select()}
          ${this.current_device.render()}
    `;

    }

    device_select(){
	return html`
        <select id="device" @change="${this.onChange}">
            ${this.select_devices.map(option => html`
            <option value="${option.value}" ?selected=${this.select_devices === option.value}>${option.text}</option>
            `)}
        </select>
<div class="device">
    `;
    }

    device_compare( a, b ) {
	if ( a.text < b.text ){
	    return -1;
	}
	else if ( a.text > b.text ){
	    return 1;
	}
	return 0;
    }
    
    init_devices(){
	console.log(this.hass);
	var _devices=[]
	for (var device_id in this.hass.devices){
	    let dev=this.hass.devices[device_id];
	    let dev_id=dev.identifiers[0];
	    if (Array.isArray(dev_id) && dev_id[0]=='redsea'){// && this.hass.devices[device_id].model=="RSDEVICE160"){
		// dev.lenght==2 to get only main device, not sub
		if(dev_id.length==2){
		    _devices.push({value:dev.primary_config_entry,text:dev.name});
		}
		if  (!Object.getOwnPropertyNames(this.devices).includes(dev.primary_config_entry)){
		    Object.defineProperty(this.devices,dev.primary_config_entry , {value:{name:dev.name,elements:[dev]}})
		}
		else{
		    this.devices[dev.primary_config_entry].elements.push(dev)
		}
	    }
	}
        _devices.sort(this.device_compare);                                                                                                                                             
	console.log(this.devices)
        for (var d of _devices){
            this.select_devices.push(d);
        }                                                                                                                                                                               
	
    }

    onChange(){
	setTimeout(()=>{
            this.selected = this.shadowRoot.querySelector('#device').value;
	    this.current_device=this.no_device;
            if (this.selected=="unselected"){
		
                console.log('Nothing selected');
            }
            else{
                console.log('Selected -->', this.selected);
		var device=this.devices[this.selected]
		for  (var elt of device.elements){
		    console.log(elt.name)
		}
		var model = device.elements[0].model
		switch(model){
		case "RSDOSE2":
		case "RSDOSE4":
		    this.current_device=new RSDose(this.hass,device);
		    break;
		case "RSRUN":
		    this.current_device=new RSRun(this.hass,device);
		    break;
		case "RSWAVE":
		    break;
		case "RSMAT":
		    this.current_device=new RSMat(this.hass,device);
		    break;
		case "RSATO+":
		    break;
		case "RSLED50":
		case "RSLED60":
		case "RSLED90":
		case "RSLED115":
		case "RSLED160":
		case "RSLED170":
		    break;
		default:
		    console.log("Unknow device type: "+device.elements[0].model)
		}
		console.log("Current_device: "+this.current_device.get_img())
		/*		var e=this.shadowRoot.getElementById('device_img');
				e.setAttribute('src',this.current_device.get_img());
				e.setAttribute('class',this.current_device.get_model())
				e=this.shadowRoot.getElementById('device_name');
				e.setAttribute('class',this.current_device.get_model())
				e.innerText=elt.name;*/
		
	    }
	},300)
    }

    setConfig(config) {
	// if (!config.entities) {
	//   throw new Error("You need to define entities");
	//   }
	//   this.config = config;
	
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    getCardSize() {
	return this.config.entities.length + 1;
    }

    static get styles() {
	return [unsafeCSS(style_rsdose),
                unsafeCSS(style_rsmat),
                unsafeCSS(style_rsrun)];
    }
}

customElements.define("reef-card", ReefCard);
