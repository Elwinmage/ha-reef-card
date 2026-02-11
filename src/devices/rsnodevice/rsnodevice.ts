import { html } from "lit";

import { RSDevice } from "../device";
import style_nodevice from "./rsnodevice.styles";

import { config } from "./rsnodevice.mapping";

// @ts-expect-error - Class extends RSDevice compatibility
export class NoDevice extends RSDevice {
  static override styles = [style_nodevice];

  //device={'elements':[{'model':'NODEVICE','name':''}]};
  device = { model: "NODEVICE", name: "", elements: null };

  constructor() {
    super();
    this.initial_config = config;
  }

  _populate_entities() {}

  override render() {
    return this._render();
  }

  protected override _render() {
    this.update_config();
    return html`
      <div class="device_bg">
        <img class="device_img" src="${this.config.background_img}" />
      </div>
    `;
  }
}
