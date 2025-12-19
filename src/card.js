import {
    LitElement,
    html,
 } from "lit";

import DeviceList from './common';

import style_card from './card.styles';

import RSDevice from './devices/device';
import NoDevice from './devices/nodevice';
import RSDose from './devices/rsdose';

import dialog_box from './devices/base/dialog';
import style_dialog from './devices/base/dialog.styles';

/*
 *  ReefCard. Implement a reefcard for HomeAssistant
 */
export class ReefCard extends LitElement {

    static styles = [style_card,style_dialog];

    // Card is updated when new device is selected or when hass is updated
    static get properties() {
	return {
	    _hass: {},
	    current_device: {},
	};
    }//end of reactives properties

    /*
     * CONSTRUCTOR
     */
    constructor() {
	super();
	this.version='v0.0.1';
	this.select_devices=[{value:'unselected',text:"Select a device"}];
	this.first_init=true;
    }//end of constructor

    /*
     * Get user configuration
     */
    setConfig(config) {
	this.user_config = config;
    }//end of function - setConfig


    set hass(obj){
	if(this.first_init==true){
	    this._hass=obj;
	}
	else {
	    this.current_device.hass=obj;
	    dialog_box.hass=obj;
	}

    }
    
    /*
     * RENDER
     */
    render() {
	console.debug("render main");
	if(this.first_init==true){
	    this.init_devices();
	    this.first_init=false;
	    this.no_device=RSDevice.create_device("redsea-nodevice",this._hass,null,null);
	    this.current_device=this.no_device;
	}//if
	else {
	    this.current_device.hass=this._hass;
	    return;
	}
	//Init conf and DOM for dialog box
	dialog_box.init(this._hass,this.shadowRoot);
	if(this.user_config['device']){
	    this.select_devices.map(dev => this._set_current_device_from_name(dev,this.user_config.device));
	    this.current_device.hass=this._hass;
	    //A specific device has been selected
	    return html`
                       ${this.current_device}
                       ${dialog_box.render()}
                       `;
	}//fi
	// no secific device selected, display select form
	return html`
          ${this.device_select()}
          ${this.current_device}
          ${dialog_box.render()}
    `;
    }//end of render

    /*
     * display select form to choose wich device to display
     */
    device_select(){
	return html`
           <select id="device" @change="${this.onChange}">
              ${this.select_devices.map(option => html`
              <option value="${option.value}" ?selected=${this.select_devices === option.value}>${option.text}</option>
              `)}
          </select>
    `;
    }

    /*
     * Initialise available redsea devices list
     */
    init_devices(){
	this.devices_list=new DeviceList(this._hass);
	for (var d of this.devices_list.main_devices){
	    this.select_devices.push(d);
	}// for
    }//end of init_devices

    /*
     * Set the current device to display giving it's name
     */
    _set_current_device_from_name(dev,name){
	if (dev['text']==name){
	    this._set_current_device(dev['value']);
	}
    }//end of _set_current_device_from_name

    /*
     * Set the current device to display giving it's id
     */
    _set_current_device(device_id){
	//No device selected, display redsea logo
	if (device_id=="unselected"){
	    this.current_device=this.no_device;
	    return;
	}
	
	if (this.current_device.device != null &&
            this.current_device.device.elements[0].primary_config_entry ==device_id){
            console.debug("current device not updated",this.current_device.device.name);
            return;
        }
	
	var device=this.devices_list.devices[device_id];
	var model = device.elements[0].model;
	this.current_device=RSDevice.create_device("redsea-"+model.toLowerCase(),this._hass,this.user_config,device);

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
	    
	    break;
	case "RSRUN":
	    //TODO : Implement RSRUN support
	    //Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/7
	    // labels: enhancement, rsrun
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

    /*
     * When SELECT form change, update the current redsea device to display.
     */
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
    }// end of onChange

    /*
     * Card editor
     */
    static getConfigElement() {
        return document.createElement("reef-card-editor");
    }//end of getConfigElement
}//end of class ReefCard
