import { html } from "lit";
import { customElement } from "lit/decorators.js";

import style_switch from "./switch.styles";
import {MyElement} from "./element";

export class RSSwitch extends MyElement {

  static override styles = style_switch;

  constructor(){
    super();
  }

  get is_on(): boolean {
    if (!this.conf || !this.conf.name) return false;
    return this.stateObj?.state === 'on';
  }

  protected override _render(_style: string = ''): any {
    if (this.conf.style=="switch"){
      return html`
<label>${this.label}</label>
<div class="switch_${this.stateObj.state}">
<div class="switch_in_${this.stateObj.state}"></div>
</div>`;
    }//if
    else if (this.conf.style=="button"){
      if ('color' in this.conf){
	this.color=this.conf.color;
      }
      if ('alpha' in this.conf){
	this.alpha=this.conf.alpha;
      }
      return html`
<style>
#${this.conf.name}{
background-color: rgba(${this.color},${this.alpha});
}   
</style>
<div class="switch_button"  id="${this.conf.name}">${this.label}</div>
`;
    }
    else{
      console.error("Switch style "+this.conf.style+" unknown for "+this.conf.name);
    }
  }
  
  private _handleSwitchChange = (e: Event): void => {
    const checkbox = e.target as HTMLInputElement;
    const newState = checkbox.checked ? 'on' : 'off';
    // Ici, déclencher l'action tap si configurée
    if (this.conf?.tap_action) {
      this._click();
    }
  }
}
