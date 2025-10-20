import {
    LitElement,
    html,
 } from "lit";

import DeviceList from './common';

import styles from './card.styles';

import NoDevice from './devices/nodevice';
import RSDose from './devices/rsdose';

export class ReefCard extends LitElement {

    static styles = styles;
    
    static get properties() {
	return {
	    hass: {},
	    user_config: {},
	    select_devices: {type: Array},
	    current_device: {type: String},
	    version: {type: String},
	    progs: {type: Array},
	    devices_list: {},
	    current_device: html``
	};
    }
    
    constructor() {
	super();
	this.version='v0.0.1';
	this.select_devices=[{value:'unselected',text:"Select a device"}];
	this.first_init=true;
    }

    _set_current_device_from_name(dev,name){
	if (dev['text']==name){
	    this._set_current_device(dev['value']);
	}
    }
    
    render() {
	console.log(this.hass);
	if(this.first_init==true){
	    this.init_devices();
	    this.first_init=false;
	    this.no_device=html`<no-device id="device" hass="${this.hass}"/>`;
	    this.current_device=this.no_device;
	    if(this.user_config['device']){
		this.select_devices.map(dev => this._set_current_device_from_name(dev,this.user_config.device));
		return html`${this.current_device}`;
	    }
	}
	return html`
          ${this.device_select()}
  ${this.current_device}
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

    init_devices(){
	this.devices_list=new DeviceList(this.hass);
	for (var d of this.devices_list.main_devices){
	    this.select_devices.push(d);
	}// for
    }

    _set_current_device(device_id){
        console.log('Selected -->', device_id);
	if (device_id=="unselected"){
	    this.current_device=this.no_device;
	    return;
	}
	var device=this.devices_list.devices[device_id];
	var model = device.elements[0].model;
	    //TODO : Implement MAIN tank view support
	    //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/11
	    // labels: enhancement

	switch(model){
	    //TODO : Implement RSDOSE support
	    //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/10
	    // labels: enhancement, rsdose
	case "RSDOSE2":
	    //TODO : Implement RSDOSE2 support
	    //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/9
	    // labels: enhancement, rsdose, rsdose2
	case "RSDOSE4":
	    //TODO : Implement RSDOSE4 support
	    //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/8
	    // labels: enhancement, rsdose, rsdose4
	    //this.current_device=new RSDose(this.hass,device);
	    this.current_device=html`<rs-dose4 id="device" hass="${this.hass}" device="${device}"/>`;
	    break;
	case "RSRUN":
	    //TODO : Implement RSRUN support
	    //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/7
	    // labels: enhancement, rsrun

	    //										this.current_device=new RSRun(this.hass,device);
	    break;
	case "RSWAVE":
	    //TODO : Implement RSWAVE support
	    //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/6
	    // labels: enhancement, rswave

	    break;
	case "RSMAT":
	    //TODO : Implement RSMAT support
	    //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/5
	    // labels: enhancement, rsmat

	    //										this.current_device=new RSMat(this.hass,device);
	    break;
	case "RSATO+":
	    //TODO : Implement RSATO+ support
	    //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/4
	    // labels: enhancement, rsato
	    
	    break;
	    //TODO : Implement RSLED support
	    //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/3
	    // labels: enhancement, rsled
	    
	case "RSLED50":
	case "RSLED60":
	case "RSLED90":
	case "RSLED115":
	case "RSLED160":
	case "RSLED170":
	    break;
	default:
	    console.log("Unknow device type: "+model)
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
		this._set_current_device(this.selected);
	    }
	},300)
    }

    // card configuration
    static getConfigElement() {
        return document.createElement("reef-card-editor");
    }

    setConfig(config) {
	console.log("setConfig");
	// if (!config.entities) {
	//   throw new Error("You need to define entities");
	//   }
	this.user_config = config;
	
    }

}
