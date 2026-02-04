import { html, css } from "lit";
import { customElement } from "lit/decorators.js";

import style_button from "./button.styles";
import {MyElement} from "./element";

export class Button extends MyElement {

  static override styles = [style_button, css`
    .button {
      background-color: var(--button-bg-color);
    }
  `];
		
  constructor(){
    super();
  }

  protected override _render(_style: string = ''): any {
    const sclass = this.conf?.class || 'button';
    const icon = this.conf?.icon 
      ? html`<ha-icon icon="${this.conf.icon}"></ha-icon>`
      : null;
    
    
    return html`
      <div 
        class="button" 
        id="${this.conf?.name || ''}" >
        ${icon}${this.label}
      </div>
    `;
  }
}
