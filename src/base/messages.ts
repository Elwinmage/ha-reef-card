/**
 * An auto scrolling text implemntation
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html } from "lit";

import type { ElementConfig } from "../types/element";
import { MyElement } from "./element";

import style_messages from "./messages.styles";

//----------------------------------------------------------------------------//
export class RSMessages extends MyElement {
  static override styles = style_messages;

  /**
   * Constructor
   */
  constructor() {
    super();
  }

  /**
   * Render
   * @param _style: Not used here
   */
  protected override _render(_style?: string): any {
    const sclass = this.conf?.class || "";
    let trash: any = null;
    let computed_style = this.get_style("elt.css");

    if (!this.stateObj) {
      return html``;
    }

    let value = this.stateObj.state;
    if (value === "unavailable" || value === "unknown" || value.length === 0) {
      value = "";
      computed_style = "";
      trash = null;
    } else {
      if (this.conf && "label" in this.conf) {
        value = this.conf.label + value + this.conf.label;
      }
      // Add a trash button to clean the message queue
      const conf: ElementConfig = {
        type: "click-image",
        name: "trash",
        stateObj: false,
        image: "/hacsfiles/ha-reef-card/img/trash.svg",
        tap_action: {
          domain: "redsea",
          action: "clean_message",
          data: {
            device_id: this.device?.device?.elements?.[0]?.primary_config_entry,
            msg_type: this.conf?.name,
          },
        },
        css: {
          display: "inline-block",
          position: "absolute",
          right: "0px",
        },
      };

      if (this._hass && this.device) {
        trash = MyElement.create_element(this._hass, conf, this.device);
      }
    }

    return html`
      <div style=${computed_style}>
        <marquee class="${sclass}">${value}</marquee>
        ${trash}
      </div>
    `;
  }
}
