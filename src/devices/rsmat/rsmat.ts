import { html, TemplateResult } from "lit";

import { RSDevice } from "../device";
import { config } from "./rsmat.mapping";

import { dialogs_device } from "../device.dialogs";
import { dialogs_rsmat } from "./rsmat.dialogs";

import i18n from "../../translations/myi18n";

// TODO : Implement RSMAT support
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/5
// labels: enhancement, rsmat
export class RSMat extends RSDevice {
  invert_position: boolean = false;

  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_device, dialogs_rsmat]);
  }

  device = {
    model: "RSMAT",
    name: "",
    elements: null,
  };

  connectedCallback() {
    super.connectedCallback();
    this._originalConfig = config; // store original reference once
  }

  private swapLeftRight = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map((item: any) => this.swapLeftRight(item));
    }

    // Leave URL instances and other class instances untouched
    if (obj instanceof URL) return obj;

    if (typeof obj === "string") {
      // Swap "left" <-> "right" in CSS string values (e.g. "top left", "flex-start")
      let result = obj
        .replace(/\bleft\b/g, "__RIGHT__")
        .replace(/\bright\b/g, "left")
        .replace(/__RIGHT__/g, "right");

      // Invert angle signs only for skewY and rotate (mirror-sensitive)
      result = result.replace(
        /(skewY|scaleX)\(\s*(-?)(\d+(?:\.\d+)?)(deg|rad|turn|grad|)\s*\)/g,
        (_match, fn, sign, value, unit) => {
          const inverted = sign === "-" ? "" : "-";
          return `${fn}(${inverted}${value}${unit})`;
        },
      );

      return result;
    }

    if (obj !== null && typeof obj === "object") {
      const newObj: any = {};
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const newKey =
          key === "right" ? "left" : key === "left" ? "right" : key;
        newObj[newKey] = this.swapLeftRight(obj[key]);
      }
      return newObj;
    }
    return obj;
  };

  override _render_disabled(substyle = null) {
    const res = super._render_disabled(substyle);
    if (res.reason === i18n._("maintenance")) {
      const position = this.get_entity("position");
      this.invert_position = position.state === "left";
      if (this.invert_position) {
        substyle += ";transform:scaleX(-1)";
        this.config = this.swapLeftRight(this.config); // swap the merged config
      }
    }
    return { reason: res.reason, substyle: substyle };
  }

  _render(style?: any, substyle?: any) {
    //position left or right
    const position = this.get_entity("position");
    this.invert_position = position.state === "left";
    if (this.invert_position) {
      substyle += ";transform:scaleX(-1)";
      this.config = this.swapLeftRight(this.config); // swap the merged config
    }

    const remaining = parseInt(this.get_entity("remaining_length").state);
    const usage = parseInt(this.get_entity("total_usage").state);
    const percent = 100 - (usage * 100) / (usage + remaining);
    const steps = [0, 25, 50, 75, 100];
    const img_state = steps.reduce((prev, curr) => {
      return Math.abs(curr - percent) < Math.abs(prev - percent) ? curr : prev;
    });
    const bg_img = this.config.state_background_imgs[`percent_${img_state}`];
    return html` <div class="device_bg">
      ${style}
      <img
        class="device_img"
        id="rsdevice_img"
        alt=""
        src="${bg_img}"
        style="${substyle}"
      />
      <div>${this._render_elements(this.is_on())}</div>
    </div>`;
  }

  override renderEditor(): TemplateResult {
    if (this.is_disabled()) {
      return html``;
    }
    this._populate_entities();
    this.update_config();
    return html` <form>${this._editor_common()}</form>`;
  }
}
