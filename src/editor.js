import { css, html, LitElement } from 'lit';

import DeviceList from './common';

import RSDose from './devices/rsdose';


export class ReefCardEditor extends LitElement {

    static get properties() {
        return {
            hass: {},
            _config: { state: true },
	    select_devices: {type: Array},
	    devices_list: {},
	    current_device: {},
        };
    }

    constructor(){
	super();
	this.select_devices=[{value:'unselected',text:"Select a device"}];
	this.first_init=true;
	this.current_device=null;
	this.addEventListener('config-changed', this.render());
    }
    
    setConfig(config) {
        this._config = config;
    }// end of function setConfig

    init_devices(){
	this.devices_list=new DeviceList(this.hass);
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

    render() {
	if(this._config){
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


    device_conf(){
	if (this._config.device && this._config.device.length > 0){
	    var device=this.devices_list.get_by_name(this._config.device);
	    var model = device.elements[0].model;
	    var lit_device=null;
	    switch(model){
	    case "RSDOSE4":
		lit_device=new RSDose(this.hass,device,this._config);
		break;
	    default:
		break;
	    }//switch
	    if (lit_device!=null && typeof lit_device['editor'] == 'function'){
		this.current_device=lit_device;
		return lit_device.editor(this.shadowRoot);
	       }//if
	}
	return ``;
    }
    
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
    }
}
