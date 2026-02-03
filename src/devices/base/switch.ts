import { html } from "lit";

import style_switch from "./switch.styles";

import {MyElement} from "./element";

export class RSSwitch extends  MyElement {

  static override styles = style_switch;

  constructor(){
    super();
  }

  get is_on(): boolean {
    if (!this.conf || !this.conf.name) return false;
    return this.stateObj?.state === 'on';
  }

  protected override _render(_style: string = ''): any {
    if (!this.conf) {
      return html``;
    }
    const value = this.is_on ? 'ON' : 'OFF';
    return html`<div class="onoffswitch">
      <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" 
             id="${this.conf.name}" .checked=${this.is_on}>
      <label class="onoffswitch-label" for="${this.conf.name}">
        <span class="onoffswitch-inner"></span>
        <span class="onoffswitch-switch"></span>
      </label>
    </div>`;
  }
}
