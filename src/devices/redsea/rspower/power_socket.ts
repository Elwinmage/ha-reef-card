import { html } from "lit";
import { RSDevice } from "../../device";

import styles from "./power_socket.styles";
import style_common from "../../../utils/common.styles";
import { OFF_COLOR } from "../../../utils/constants";

/**
 * Probe type a socket follows, from the `sensor_config` attribute of its
 * `socket_mode` entity. The integration fills it in one of two shapes,
 * tagged by the `sensor_source` attribute:
 *   - local probe:   { sensor: { app_cache, default_state }, … }
 *   - RSControl:     the hub's rule, { type, uid, sensor, … } — there
 *                    `sensor` is the sub-sensor name, not an object.
 * @return the type id (ph, orp, ec, temperature, ato, leak), or "" when the
 *         configuration names none
 */
export function socketSensorType(cfg: any): string {
  if (!cfg || typeof cfg !== "object") return "";
  if (typeof cfg.type === "string") return cfg.type;
  const appCache = cfg.sensor?.app_cache;
  return typeof appCache === "string" ? appCache : "";
}

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

  _pipe_path() {
    if (!this.linked_image()) {
      return html``;
    }
    let color = this.config.color;
    if (!this.state_on) {
      color = OFF_COLOR;
    }
    const parent: any = this.device;
    const start_pos = parent?.config?.sockets_nb === 6 ? 105 : 129;
    const length_scale = parent?.config?.sockets_nb === 6 ? 1 : 1.28;
    const length =
      this.socket_id % 2 !== 0 ? 10 * length_scale : 127 * length_scale;
    return html`
      <svg viewBox="0 0 86 350">
        <path
          d="M 46 ${start_pos} v ${length}"
          stroke="rgba(${color},0.5)"
          stroke-width="8"
          fill="none"
        ></path>
      </svg>
    `;
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
        <div class="pipe" style="${this.get_style(this.config.pipe)}">
          ${this._pipe_path()}
        </div>
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

  // ── Sensor mode ───────────────────────────────────────────────────────

  /**
   * Automatic mode this socket runs, or would run without a manual override.
   *
   * `socket_prev_mode` is the mode the socket was in before its current
   * one, so it only means "suspended" while the current mode is a manual
   * on/off: a socket moved from schedule to sensor keeps `prev_mode =
   * schedule` but runs its probe. The schedule it had stays stored on the
   * device, ready to be switched back to, which is why the configuration
   * attributes cannot tell the mode either.
   * @return "schedule" or "sensor", or "" for a manual or unset socket
   */
  auto_mode(): string {
    const mode = this.get_entity("socket_mode")?.state;
    if (mode === "schedule" || mode === "sensor") return mode;
    if (mode === "on" || mode === "off") {
      const prev = this.get_entity("socket_prev_mode")?.state;
      if (prev === "schedule" || prev === "sensor") return prev;
    }
    return "";
  }

  /**
   * Probe type this socket follows, whether the probe is local or on the
   * paired RSControl (see `socketSensorType`). Meant for the mapping, e.g.
   * an icon picked by probe type.
   * @return the type id, or "" when the socket has no sensor configuration
   */
  sensor_type(): string {
    return socketSensorType(
      this.get_entity("socket_mode")?.attributes?.sensor_config,
    );
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
   * Icon for this socket's switch, reflecting what is plugged into it.
   * @return the icon name, generic when nothing recognisable is linked
   */
  linked_icon(): string {
    const parent: any = this.device;
    return (
      parent?.linked_device_icon?.(this.socket_id, this.is_on()) ??
      "mdi:power-plug-off"
    );
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
