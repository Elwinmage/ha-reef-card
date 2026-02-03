import { html } from "lit";
import { customElement } from "lit/decorators.js";

import style_click_image from "./click_image.styles";
import {MyElement} from "./element";

export class ClickImage extends MyElement {

  static override styles = [style_click_image];
		
  constructor(){
    super();
  }

  protected override _render(_style: string = ''): any {
    const imageSrc = this.conf?.image || '';
    const imageStyle = this.conf?.css ? 
      Object.entries(this.conf.css)
        .map(([k, v]) => `${k}:${v}`)
        .join(';') : '';
    
    return html`
      <img 
        class="click-image" 
        src="${imageSrc}" 
        style="${imageStyle}"
        alt="${this.conf?.name || 'clickable image'}" />
    `;
  }
}
