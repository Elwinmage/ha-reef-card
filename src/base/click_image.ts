/**
 * Implement Click image
 * The image can be a regular image or a mdi icon.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html } from "lit";

import { MyElement } from "./element";

import style_click_image from "./click_image.styles";
import style_animations from "../utils/animations.styles";
//----------------------------------------------------------------------------//

export class ClickImage extends MyElement {
  static override styles = [style_animations, style_click_image];

  /**
   * Constructor
   */
  constructor() {
    super();
  }

  /**
   * Render
   * @param _style: set the style of <ha-icon> or <img>
   */
  protected override _render(_style: string = ""): any {
    // An image may be an expression when it depends on device state — a
    // linked device's picture, say. Static images stay untouched: mapping
    // entries pass a URL object built at module load, not a string.
    let imageSrc: any = this.conf?.image || "";
    if (typeof imageSrc === "string" && imageSrc.includes("${")) {
      imageSrc = this.evaluate(imageSrc);
    }
    const icon = this.conf?.icon || "";
    let iconColor = this.conf?.icon_color || "currentColor";

    /*    if (!_style) {
      _style = this.get_style("css");
    }
*/
    // Mode 1 : MDI Icon
    if (icon) {
      if (icon === "state") {
        const obj = this.get_entity(this.conf.name);
        if (obj.state === "off") {
          iconColor = "#666666";
        }
        return html`
          <ha-state-icon
            class="click-icon"
            .hass="${this._hass}"
            .stateObj="${obj}"
            style="color: ${iconColor}; ${_style}"
          ></ha-state-icon>
        `;
      }
      if (icon.startsWith("mdi:") || icon.startsWith("redsea:")) {
        return html`
          <ha-icon
            class="click-icon"
            .icon="${icon}"
            style="color: ${iconColor}; ${_style}"
          ></ha-icon>
        `;
      }
    }

    // Mode 2 : Standard image
    //
    // `off` mirrors what RSDevice does to its own background picture: its
    // <style> block cannot cross into this shadow root, so an overlay would
    // otherwise stay in colour over a greyed-out device.
    return html`
      <img
        class="click-image ${this.stateOn ? "" : "off"}"
        src="${imageSrc}"
        style="${_style}"
        alt="${this.conf?.name || "clickable image"}"
      />
    `;
  }
}
