import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

//import { RSDose } from "/local/community/ha-reef-card/src/RSDOSE/rsdose.js";
import RSDose from "./src/RSDOSE/rsdose.js";


function loadCSS(url) {
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
}

class ReefCard extends LitElement {

    static get properties() {
	return {
	    hass: {},
	    config: {},
	    select_devices: {type: Array},
	    current_device: {type: String},
	    version: {type: String},
	    progs: {type: Array},
	    devices: {}
	};
    }

    constructor() {
	super();
	this.version='v0.0.1';
	this.select_devices=[{value:'unselected',text:"Select a device"}];
	this.current_device='';
	this.first_init=true;
	this.progs=[];
	this.colors=['white','blue','moon'];
	this.devices={};
    }
    
    render() {
	if(this.first_init==true){
	    this.init_devices();
	    this.first_init=false;
	}
	return html`
          ${this.device_select()}
    `;
    }

    device_select(){
	return html`
        <select id="device" @change="${this.onChange}">
            ${this.select_devices.map(option => html`
            <option value="${option.value}" ?selected=${this.select_devices === option.value}>${option.text}</option>
            `)}
        </select>
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
		if (this.current_device == ''){
		    this.current_device=device_id;
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
            if (this.selected=="unselected"){
		
                console.log('Nothing selected');
                div_color.style.display="none";
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
		    var dev=new RSDose(model);
		    ;
		    break;
		case "RSRUN":
		    break;
		case "RSWAVE":
		    break;
		case "RSMAT":
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
	return css`
      :host {
#        font-family: "Gloria Hallelujah", cursive;
      }
      wired-card {
        background-color: white;
        padding: 16px;
        display: block;
        font-size: 18px;
      }

div.hidden{
display: none;
}

      .state {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        align-items: center;
      }
      .not-found {
        background-color: yellow;
        font-family: sans-serif;
        font-size: 14px;
        padding: 8px;
      }
      wired-toggle {
        margin-left: 8px;
      }
    `;
    }
}
customElements.define("reef-card", ReefCard);
