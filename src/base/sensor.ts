/**
 * Common sensor implementation
 * Example: {
 *      name: "wifi_quality",
 *      type: "common-sensor",
 *      master: true,
 *      label: false,
 *      icon: true,
 *      icon_color: "#ec2330",
 *      round: 2,               // 12.3456 -> "12.35"
 *      text_color: "$DEVICE-COLOR$",   // value + unit share the colour
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
import style_animations from "../utils/animations.styles";
import { MyElement } from "./element";
import { COLOR_BUTTON_RGB } from "../utils/colors";
import { OFF_COLOR } from "../utils/constants";

import type { SensorConfig } from "../types/index";

//----------------------------------------------------------------------------//

export class Sensor extends MyElement {
  static override styles: CSSResultGroup = [
    style_animations,
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
   * Number of decimals to render, or null when the value is left untouched.
   *
   * `round` is the general form: round(2) keeps two decimals, round(0) yields
   * an integer. `force_integer` predates it and is kept working, but it is
   * NOT folded into round(0) here on purpose: this class rounds while
   * SensorTarget floors, and silently changing either would shift displayed
   * doses. New configs should use `round`.
   */
  protected round_digits(): number | null {
    const digits = (this.conf as any)?.round;
    if (typeof digits === "number" && Number.isFinite(digits) && digits >= 0) {
      return Math.floor(digits);
    }
    return null;
  }

  /**
   * Apply `round` to a value, leaving non-numeric values alone.
   */
  protected apply_round(value: string | number): string | number {
    const digits = this.round_digits();
    if (digits === null) return value;
    const numeric = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(numeric)) return value;
    return numeric.toFixed(digits);
  }

  /**
   * Resolve conf.text_color into a usable CSS colour.
   *
   * A literal such as "red" or "#ec2330" is used as is: evaluate() would treat
   * it as a JS expression and return undefined. Only a real template — one
   * containing ${...} — is evaluated. The device-colour tokens are honoured
   * here too, so text_color behaves like the css block.
   */
  protected resolve_text_color(): string {
    const raw = this.conf?.text_color;
    if (!raw) return "";

    let value: string;
    if (typeof raw === "string" && !raw.includes("${")) {
      value = raw;
    } else {
      value = String(this.evaluate(raw) ?? "");
    }
    value = value.replaceAll('"', "");

    if (
      this.device &&
      (value === "$DEVICE-COLOR$" || value === "$DEVICE-COLOR-ALPHA$")
    ) {
      const device_color = this.device.is_on()
        ? this.device.config.color
        : OFF_COLOR;
      value =
        value === "$DEVICE-COLOR$"
          ? `rgb(${device_color})`
          : `rgba(${device_color},${this.device.config.alpha})`;
    }
    return value;
  }

  /**
   * Render
   * @param _style: set personal style
   */
  protected override _render(_style?: string): TemplateResult {
    if (!this.conf) {
      return html``;
    }

    const sclass = this.conf.class || "";

    if (this.conf?.icon) {
      let color = "rgb(" + COLOR_BUTTON_RGB + ")";
      if (this.conf?.icon_color) {
        color = this.conf.icon_color;
      }
      //      this._hass.entities?.[this.stateObj.entity_id]?.icon
      //icon="${this.stateObj.attributes.icon || "mdi:help"}"
      /*      return html` <ha-icon
        icon="${this._hass.entities?.[this.stateObj.entity_id]?.icon || "mdi:help"}"
        style="color:${color}"
      >
      </ha-icon>`;*/
      return html`<ha-state-icon
        .hass=${this._hass}
        .stateObj=${this.stateObj}
        style="color:${color}"
      ></ha-state-icon>`;
    }

    let value: string | number = "";
    let unit = "";

    if (this.stateObj) {
      if (this.conf?.translate_values) {
        value = this.label || this._hass.formatEntityState(this.stateObj);
      } else {
        value = this.label || this.stateObj.state;
      }

      if (this.conf.unit) {
        unit = this.evaluate(this.conf.unit);
      } else {
        unit = this.stateObj.attributes?.unit_of_measurement || "";
      }

      if (this.conf.force_integer && typeof value === "string") {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          value = Math.round(numValue).toString();
        }
      }
      value = this.apply_round(value);
      if (this.conf.prefix) {
        value = this.evaluate(this.conf.prefix).replaceAll('"', "") + value;
      }
    }

    // text_color colours the value AND the unit, which `css: {color}` cannot
    // guarantee once unit_css sets its own colour. Wrapping both in one span
    // keeps them consistent whatever unit_css does.
    const text_color = this.resolve_text_color();
    const body = html`${value}
    ${unit
      ? html`<span style=${this.get_style("unit_css")}>${unit}</span>`
      : ""}`;

    return text_color
      ? html`<span style="color:${text_color}">${body}</span>`
      : body;
  }
}
