/**
 * Implement a switch element
 * Exemple: {
 *          alpha: 0,
 *          name: "schedule_enabled",
 *          master: true,
 *          type: "common-switch",
 *          class: "pump_state_head",
 *          style: "button",
 *          css: {
 *            position: "absolute",
 *            "aspect-ratio": "1/1",
 *            width: "45%",
 *            "border-radius": "50%",
 *            top: "10%",
 *            left: "32.5%",
 *          },
 *          hold_action: {
 *            enabled: true,
 *            domain: "switch",
 *            action: "toggle",
 *            data: "default",
 *          },
 *          tap_action: {
 *            domain: "redsea_ui",
 *            action: "dialog",
 *            data: { type: "head_configuration" },
 *          },
 *        }
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html } from "lit";

import { MyElement } from "./element";

import style_switch from "./switch.styles";

//----------------------------------------------------------------------------//
export class RSSwitch extends MyElement {
  static override styles = style_switch;

  /**
   * Constructor
   */
  constructor() {
    super();
  }

  /**
   * @return the state of the hass entity
   */
  get is_on(): boolean {
    if (!this.conf || !this.conf.name) return false;
    return this.stateObj?.state === "on";
  }

  /**
   * Render
   * @param _style: unused
   */
  protected override _render(_style: string = ""): any {
    if (this.conf.style === "switch") {
      return html` <label>${this.label}</label>
        <div class="switch_${this.stateObj.state}">
          <div class="switch_in_${this.stateObj.state}"></div>
        </div>`;
    } else if (this.conf.style === "button") {
      if ("color" in this.conf) {
        this.color = this.conf.color;
      }
      if ("alpha" in this.conf) {
        this.alpha = this.conf.alpha;
      }
      return html`
        <style>
          #${this.conf.name} {
            background-color: rgba(${this.color}, ${this.alpha});
          }
        </style>
        <div class="switch_button" id="${this.conf.name}">${this.label}</div>
      `;
    } else {
      console.error(
        "Switch style " + this.conf.style + " unknown for " + this.conf.name,
      );
    }
  }

  private _handleSwitchChange = (): void => {
    // If tap action is configured, run corresponding action
    if (this.conf?.tap_action) {
      this._click();
    }
  };
}
