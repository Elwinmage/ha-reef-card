import { css, html, LitElement } from 'lit';

import DeviceList from './common';

export class ReefCardEditor extends LitElement {

    static get properties() {
        return {
            // hass: {},
            _config: { state: true },
	    select_devices: {type: Array},
	    devices_list: {},
        };
    }


    constructor(){
	super();
	this.select_devices=[{value:'unselected',text:"Select a device"}];
	this.first_init=true;
    }
    
    setConfig(config) {
        this._config = config;
    }


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
            <form class="table">
                <div class="row">
                    <label class="label cell" for="device">Device:</label>
                    <select id="device" class="value cell" @change="${this.handleChangedEvent}">
                      ${this.select_devices.map(option => html`
                      <option value="${option.value}" ?selected=${this.select_devices === option.value}>${option.text}</option>
                        `)}
                   </select>
                </div>
            </form>
        `;}
	    return html``;
    }// end of - render

    handleChangedEvent(changedEvent) {
        // this._config is readonly, copy needed
        var newConfig = Object.assign({}, this._config);
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
