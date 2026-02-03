import { html } from "lit";

import style_button from "./button.styles";

import {MyElement} from "./element";

export class Button extends  MyElement {

  static override styles = [style_button];
	
  constructor(){
    super();
  }// end of constructor

  protected override _render(style: string = ''): any {
    let sclass='button';
    let icon: any = null;
    if (this.conf && 'class' in this.conf){
      sclass=this.conf.class || 'button';
    }
    if(this.conf && 'icon' in this.conf){
      icon=html`<ha-icon icon="${this.conf.icon}"><ha-icon>`;
    }
    return html`
 <style>
.button{
background-color: rgba(${this.c},${this.alpha});
}
</style>
    <div class="button" id="${this.conf?.name || ''}" style=${style}>${icon}${this.label}</div>
`;
  }// end of function render
}// end of class
