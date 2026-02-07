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

    if (!_style){
      _style=this.get_style("css");
    }
    return html`
      <img 
        class="click-image" 
        src="${imageSrc}" 
        style="${_style}"
        alt="${this.conf?.name || 'clickable image'}" />
    `;
  }
}
