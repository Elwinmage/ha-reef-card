import { html } from "lit";

import style_click_image from "./click_image.styles";

import {MyElement} from "./element";

export class ClickImage extends  MyElement {

  static override styles = style_click_image;

  constructor(){
    super();
  }// end of constructor

  protected override _render(style: string = ''): any {
    let sclass="";
    if (this.conf && "class" in this.conf){
      sclass=this.conf.class || "";
    }
    
    return html`<img class="${sclass}" src=${this.conf?.image || ''} style=${style} />`;
  }// end of function render
}// end of class
