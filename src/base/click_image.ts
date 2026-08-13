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
    const imageSrc = this.conf?.image || "";
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
          <ha-icon
            class="click-icon"
            .icon="${obj.attributes.icon}"
            style="color: ${iconColor}; ${_style}"
          ></ha-icon>
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
    return html`
      <img
        class="click-image"
        src="${imageSrc}"
        style="${_style}"
        alt="${this.conf?.name || "clickable image"}"
      />
    `;
  }
}
