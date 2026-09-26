/**
 * @file One 12V port of a ReefControl hub
 * @module devices.redsea.rscontrol.control_port
 *
 * Mirrors the PowerSocket pattern of RSPower: the parent RSControl creates
 * one ControlPort per port and hands it the port's entities, grouped by
 * their `port` attribute since both ports share the same translation keys.
 *
 * The entities are also given under the power-center socket keys
 * (`socket_mode`, `socket_name`, …): the port editor is the socket editor
 * with the hub's endpoints, and reads them by those keys.
 */

import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";

import styles from "./control_port.styles";
import style_common from "../../../utils/common.styles";
import style_animations from "../../../utils/animations.styles";

/** Port keys the socket editor reads, by the socket key it reads them as. */
const SOCKET_ALIASES: Record<string, string> = {
  socket_mode: "port_mode",
  socket_name: "port_name",
  socket_state: "port_state",
  socket_on_off: "port_on_off",
  socket_consumption: "port_consumption",
};

/**
 * Add the socket-key aliases to a port's entities.
 * @param entities: the port's entities, keyed by translation key
 * @return a new map with the aliases, when their entity exists
 */
export function port_aliases(
  entities: Record<string, any>,
): Record<string, any> {
  const result = { ...entities };
  for (const [alias, key] of Object.entries(SOCKET_ALIASES)) {
    // The mode and name exist as sensors and as a text: the sensor is the
    // one carrying the editor's attributes
    const entity = entities["sensor." + key] ?? entities[key];
    if (entity) result[alias] = entity;
  }
  return result;
}

export class ControlPort extends RSDevice {
  static styles = [styles, style_common, style_animations];

  static get properties() {
    return {
      state_on: {},
    };
  }

  state_on: boolean = false;
  /** 1-based port number, as printed on the hub. */
  port_id: number = 0;

  // Last states the port depends on, to re-render only on a change
  private _signature: string = "";

  constructor() {
    super();
    this.state_on = false;
  }

  override render() {
    return this._render();
  }

  set hass(obj: any) {
    this._setting_hass(obj);
    const signature = ["port_mode", "port_state", "port_consumption"]
      .map((key) => this.get_entity(key)?.state ?? "")
      .join("|");
    if (signature !== this._signature) {
      this._signature = signature;
      this.requestUpdate();
    }
  }

  get hass(): any {
    return this._hass;
  }

  update_state(value: boolean): void {
    this.state_on = value;
    this.requestUpdate();
  }

  _render(_style = null, _substyle = null): TemplateResult {
    this.to_render = false;
    if (!this.config || !this._hass || !this.entities) {
      return html``;
    }
    return html`<div class="port">
      ${this._render_elements(this.state_on)}
    </div>`;
  }
}
