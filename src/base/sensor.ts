/**
 * Common sensor implementation
 * Example: {
 *      name: "wifi_quality",
 *      type: "common-sensor",
 *      master: true,
 *      label: false,
 *      icon: true,
 *      icon_color: "#ec2330",
 *      tap_action: {
 *        domain: "redsea_ui",
 *        action: "dialog",
 *        data: { type: "wifi" },
 *      },
 *      css: {
 *        flex: "0 0 auto",
 *        position: "absolute",
 *        width: "5.5%",
 *        height: "2%",
 *        top: "0%",
 *        right: "0%",
 *      },
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, TemplateResult, CSSResultGroup, css } from "lit";
import { property } from "lit/decorators.js";
import style_sensor from "./sensor.styles";
import { MyElement } from "./element";
import { button_color } from "../utils/common";

import type { SensorConfig } from "../types/index";

//----------------------------------------------------------------------------//

export class Sensor extends MyElement {
  static override styles: CSSResultGroup = [
    style_sensor,
    css`
      .sensor {
        background-color: var(--sensor-bg-color);
      }
    `,
  ];

  // Public reactive property
  @property({ type: Object, attribute: false })
  declare conf?: SensorConfig;

  /**
   * Constructor
   */
  constructor() {
    super();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.stateOn = this.stateObj?.state === "on";
  }

  override updated(): void {
    if (this.stateObj) {
      this.stateOn = this.stateObj.state === "on";
    }
  }

  /**
   * Render
   * @param _style: set personal style
   */
  protected override _render(_style: string = ""): TemplateResult {
    if (!this.conf) {
      return html``;
    }

    const sclass = this.conf.class || "";

    if (this.conf?.icon) {
      let color = "rgb(" + button_color + ")";
      if (this.conf?.icon_color) {
        color = this.conf.icon_color;
      }
      return html` <ha-icon
        icon="${this.stateObj.attributes.icon || "mdi:help"}"
        style="color:${color}"
      >
      </ha-icon>`;
    }

    let value: string | number = "";
    let unit = "";

    if (this.stateObj) {
      value = this.label || this.stateObj.state;
      unit =
        this.conf.unit || this.stateObj.attributes?.unit_of_measurement || "";

      if (this.conf.prefix) {
        value = this.conf.prefix + value;
      }

      if (this.conf.force_integer && typeof value === "string") {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          value = Math.round(numValue).toString();
        }
      }
    }

    return html`
      <div class="sensor ${sclass}" style="${_style}; ">
        ${value} ${unit ? html`<span class="unit">${unit}</span>` : ""}
      </div>
    `;
  }
}
