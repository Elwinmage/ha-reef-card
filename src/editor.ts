import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import i18n from "./translations/myi18n";

import DeviceList from './common';
import {RSDevice} from './devices/device';

interface HassConfig {
  device?: string;
  [key: string]: any;
}

interface SelectDevice {
  value: string;
  text: string;
}

export class ReefCardEditor extends LitElement {

  @property({ attribute: false })
  _config: HassConfig | null = null;

  @property({ attribute: false })
  current_device: any | null = null;
  
  @property({ attribute: false })
  private _hass: any;
  
  @state()
  private select_devices: SelectDevice[] = [];
  
  @state()
  private first_init: boolean = true;
  
  @state()
  private devices_list!: DeviceList;

  constructor(){
    super();
    this.current_device=null;
    this.addEventListener('config-changed',  () => this.requestUpdate());    
  }// end of constructor

  setConfig(config: HassConfig): void {
    console.log("setConfig CARD");
    this._config = config;
    //this.render();
    this.requestUpdate();
  }// end of function setConfig

  set hass(obj: any){
    this._hass=obj;
  }
  
  private init_devices(): void {
    this.devices_list=new DeviceList(this._hass);
    this.select_devices=[{value:'unselected',text:i18n._("select_device")}];
    for (const d of this.devices_list.main_devices){
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
    console.log("Render Editor");
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
        <option value="${option.value}" ?selected=${this._config!.device === option.text}>${option.text}</option>
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

  private device_conf() {
    if (this._config && this._config.device && this._config.device.length > 0){
      const device=this.devices_list.get_by_name(this._config.device);
      if (!device) {
        return ``;
      }
      const model = device.elements[0]?.model;
      if (!model) {
        return ``;
      }
      // @ts-ignore - DeviceInfo type mismatch
            const lit_device=RSDevice.create_device("redsea-"+model.toLowerCase(),this._hass,this._config,device);
      if (lit_device!=null && typeof lit_device['editor'] == 'function'){
// @ts-ignore - editor property exists at runtime
		this.current_device=lit_device;
	// @ts-ignore - editor property exists at runtime
	return lit_device.editor(this.shadowRoot);
      }// if
    }
    return ``;
  }// end of function - device_conf

  private handleChangedEvent(_changesdEvent: Event): void {
    // this._config is readonly, copy needed
    if (this.shadowRoot == null){
      console.error("Can not found a device");
      return;
    }

    const newConfig = JSON.parse(JSON.stringify(this._config)) as HassConfig; 
    const elt = this.shadowRoot.getElementById("device") as HTMLSelectElement | null;
    if (elt == null){
      console.error("Can not found a device");
      return;
    }
    let val='unselected';
    if (elt.selectedIndex == 0){
      delete newConfig.device;
    }
    else{
      val = elt.options[elt.selectedIndex]!.text;
      newConfig.device = val;
    }
    const messageEvent = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }// end of function - handleChangesdEvent    
}// end of class ReefCardEditor
