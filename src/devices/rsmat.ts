import { html } from "lit";
import { customElement } from "lit/decorators.js";

import {RSDevice} from "./device";
import style_common from "./common.styles";

// @ts-expect-error - Class extends RSDevice compatibility
export class RSMat extends RSDevice {
  static override styles = [style_common];

  constructor() {
    super();
  }

  protected override _render() {
    const state = this.is_on();
    const disabled = this._render_disabled();
    
    if (disabled) {
      return disabled;
    }

    return html`
      <div class="device_bg">
        <img class="device_img" alt="" src='${this.config.background_img}'/>
        <div class="device_elements">
          ${this._render_elements(state)}
        </div>
      </div>
    `;
  }
}
