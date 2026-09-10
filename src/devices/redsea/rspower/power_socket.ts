import { html } from "lit";
import { RSDevice } from "../../device";

import styles from "./power_socket.styles";
import style_common from "../../../utils/common.styles";

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

    return html`
      <div class="socket_container">
        ${this._render_elements(this.state_on)}
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
    if (mode === "on") return true;
    if (mode === "off" || mode === "setup") return false;
    // schedule or sensor: rely on hardware state
    const state = this._get_socket_sensor_state("socket_state");
    return state === "on";
  }

  update_state(_value: boolean): void {
    this.state_on = _value;
    this.requestUpdate();
  }

  // ── Linked appliance ──────────────────────────────────────────────────

  /**
   * Thumbnail of the appliance linked to this socket.
   *
   * The link is configured on the strip, so the lookup is delegated to it.
   * @return the image URL, or an empty string when nothing is linked
   */
  linked_image(): string {
    const parent: any = this.device;
    return parent?.linked_device_image?.(this.socket_id) ?? "";
  }

  /**
   * Hardware id of the appliance linked to this socket, for navigation.
   * @return the hardware id, or an empty string when nothing is linked
   */
  linked_hwid(): string {
    const parent: any = this.device;
    return parent?.linked_device_hwid?.(this.socket_id) ?? "";
  }

  /**
   * CSS class conveying the linked appliance's state.
   * @return the class to apply, empty for the normal state
   */
  linked_class(): string {
    const parent: any = this.device;
    return parent?.linked_device_class?.(this.socket_id) ?? "";
  }
}
