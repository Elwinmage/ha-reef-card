import { html } from "lit";

import style_click_image from "./click_image.styles";
import { MyElement } from "./element";

export class ClickImage extends MyElement {
  static override styles = [style_click_image];

  constructor() {
    super();
  }

  protected override _render(_style: string = ""): any {
    const imageSrc = this.conf?.image || "";
    const icon = this.conf?.icon || "";
    const iconColor = this.conf?.icon_color || "currentColor";

    if (!_style) {
      _style = this.get_style("css");
    }

    // Mode 1 : Icône MDI
    if (icon && icon.startsWith("mdi:")) {
      return html`
        <ha-icon
          class="click-icon"
          .icon="${icon}"
          style="color: ${iconColor}; ${_style}"
        ></ha-icon>
      `;
    }

    // Mode 2 : Image classique (par défaut)
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
