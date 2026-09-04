import { html } from "lit";
import { RSDevice } from "../../device";

import styles from "./power_socket.styles";
import style_common from "../../../utils/common.styles";

import i18n from "../../../translations/myi18n";
import { OFF_COLOR } from "../../../utils/constants";

/**
 * LitElement rendering a single RSPower AC socket.
 *
 * Mirrors the DoseHead pattern used by RSDose: the parent RSPower creates
 * one PowerSocket per configured socket and passes it the per-socket
 * entities so it can render name, state, mode and consumption autonomously.
 */
export class PowerSocket extends RSDevice {
  static styles = [styles, style_common];

  static get properties() {
    return {
      state_on: {},
      socket_state: {},
    };
  }

  // Instance properties
  state_on: boolean = false;
  socket_state: string | null = null;
  socket_id: number = 0;

  constructor() {
    super();
    this.state_on = false;
    this.socket_state = null;
  }

  override render() {
    return this._render();
  }

  _render(_style = null, _substyle = null) {
    this.to_render = false;

    // Guard: config and hass may not be set on the first Lit render cycle
    if (!this.config || !this._hass || !this.entities) {
      return html``;
    }

    this.state_on = this.is_on();

    const name =
      this._get_socket_sensor_state("socket_name") ?? `S${this.socket_id}`;
    const mode = this._get_socket_sensor_state("socket_mode") ?? "setup";
    const state = this._get_socket_sensor_state("socket_state") ?? "unknown";
    const consumption = this._get_socket_sensor_state("socket_consumption");

    // Determine visual state class
    let stateClass = "off";
    if (state === "on" || mode === "on") {
      stateClass = "on";
    } else if (state === "standby") {
      stateClass = "standby";
    }

    // Consumption display (only when socket is active)
    let consumptionHtml = html``;
    if (consumption !== null && stateClass === "on") {
      const val = parseFloat(consumption);
      if (!isNaN(val)) {
        consumptionHtml = html`<div class="socket_consumption">
          ${val.toFixed(1)}W
        </div>`;
      }
    }

    return html`
      <div class="socket_container">
        <div class="socket_label">${name}</div>
        ${consumptionHtml} ${this._render_elements(this.state_on)}
      </div>
    `;
  }

  /**
   * Read the current HA state for a per-socket sensor.
   *
   * Per-socket entities are stored in `this.entities` by the parent's
   * `_populate_entities_with_sockets()` under their translation_key
   * (e.g. "socket_name", "socket_state", "socket_mode", "socket_consumption").
   */
  _get_socket_sensor_state(translation_key: string): string | null {
    const entity = this.entities?.[translation_key];
    if (!entity) return null;
    const stateObj = this._hass?.states?.[entity.entity_id];
    return stateObj?.state ?? null;
  }

  set hass(obj: any) {
    let to_update = false;
    this._setting_hass(obj);

    // Detect state changes
    const newState = this._get_socket_sensor_state("socket_state");
    if (newState !== this.socket_state) {
      this.socket_state = newState;
      to_update = true;
    }

    if (to_update) {
      this.requestUpdate();
    }
  }

  is_on(): boolean {
    const mode = this._get_socket_sensor_state("socket_mode");
    const state = this._get_socket_sensor_state("socket_state");
    if (mode === "off" || mode === "setup") return false;
    if (state === "on") return true;
    if (mode === "on") return true;
    return false;
  }

  update_state(value: boolean): void {
    if (this.state_on !== value) {
      this.state_on = value;
    }
    this.requestUpdate();
  }
}
