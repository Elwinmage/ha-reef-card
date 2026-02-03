// @ts-nocheck
import { html } from "lit";

import style_messages from "./messages.styles";

import {MyElement} from "./element";

export class RSMessages extends  MyElement {

  static override styles = style_messages;

  constructor(){
    super();
  }
  
  protected override _render(_style: string = ''): any {
    let sclass="";
    let trash: any = null;
    let computed_style=this.get_style("elt.css");
    if (this.conf && "class" in this.conf){
      sclass=this.conf.class || "";
    }
    if (!this.stateObj) {
      return html``;
    }
    let value=this.stateObj.state;
    if (value=="unavailable" ||value=="unknown" || value.length==0){
      value='';
      computed_style = '';
      trash = null;
    }
    else {
      if(this.conf && 'label' in this.conf){
        value=this.conf.label+value+this.conf.label;
      }
      const conf={
        "type": "click-image",
        "stateObj": null,
        "image":'/hacsfiles/ha-reef-card/trash.svg',
        "tap_action":{
          "domain":"redsea",
          "action":"clean_message",
          "data":{
            "device_id":this.device?.elements?.[0]?.primary_config_entry,
            "msg_type":this.conf?.name,
          }
        },
        "css": {
          "display": "inline-block",
          "position": "absolute",
          "right": "0px"
        }
      };
      if (this._hass) {
        trash=MyElement.create_element(this._hass,conf,this.device);
      }
    }
    return html`<div style=${computed_style}><marquee class="${sclass}">${value}</marquee>${trash}</div>`;
  }
}
