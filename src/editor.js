import { css, html, LitElement } from 'lit';

import DeviceList from './common';

//import RSDevice from './devices/device';
import RSDose from './devices/rsdose';

var rsdevice = require('RSDevice');

/*
 * ReefCard Editor for Home Assistant
 */
export class ReefCardEditor extends LitElement {

    static get properties() {
        return {
            _hass: {},
            _config: { state: true },
	    current_device: {},
        };//end of reactives properties
    }

    /*
     * CONSTRUCTOR
     */
    constructor(){
	super();
	this.select_devices=[{value:'unselected',text:"Select a device"}];
	this.first_init=true;
	this.current_device=null;
	this.addEventListener('config-changed', this.render());
    }//end of constructor

    /*
     * Get user configuration
     */
    setConfig(config) {
	console.log("setConfig CARD");
        this._config = config;
    }// end of function setConfig

    set hass(obj){
	this._hass=obj;
    }
    
    init_devices(){
	this.devices_list=new DeviceList(this._hass);
	for (var d of this.devices_list.main_devices){
	    this.select_devices.push(d);
	}// for
    }

    static styles = css`
            .table {
                display: table;
            }
            .row {
                display: table-row;
            }
            .cell {
                display: table-cell;
                padding: 0.5em;
            }
        `;

    /*
     * RENDER
     */
    render() {
	console.log("rerender");
	if(this._config){
	    console.log("yes");
	    if (this.first_init==true){
		this.first_init=false;
		this.init_devices();
	    }
	    return html`
            <div class="card-config">
                <div class="tabs">
                <div class="tab">
                    <label class="rab-label" for="device">Device:</label>
                    <select id="device" class="value cell" @change="${this.handleChangedEvent}">
                      ${this.select_devices.map(option => html`
                      <option value="${option.value}" ?selected=${this._config.device === option.text}>${option.text}</option>
                        `)}
                   </select>
</div>
                ${this.device_conf()}
                </div>
            </div>
        `;
	}
	   return html``;
    }// end of - render

    /*
     * Display specific configuration for selected device
     */
    device_conf(){
	if (this._config.device && this._config.device.length > 0){
	    var device=this.devices_list.get_by_name(this._config.device);
	    var model = device.elements[0].model;
	    var lit_device=rsdevice.create_device("redsea-"+model.toLowerCase(),this._hass,this._config,device);
	    if (lit_device!=null && typeof lit_device['editor'] == 'function'){
		this.current_device=lit_device;
		return lit_device.editor(this.shadowRoot);
	       }//if
	}
	return ``;
    }//end of function - device_conf

    /*
     * Send event when configuration changed
     */
    handleChangedEvent(changedEvent) {
        // this._config is readonly, copy needed
        var newConfig = JSON.parse(JSON.stringify(this._config)); 
	var elt = this.shadowRoot.getElementById("device");
	let val='unselected';
	if (elt.selectedIndex == 0){
	    delete newConfig.device;
	}
	else{
	    val = elt.options[elt.selectedIndex].text;
	    newConfig.device = val;
	}
        const messageEvent = new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(messageEvent);
    }// end of function - handleChangedEvent
    
}// end of class ReefCardEditor
