import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./rspower6.mapping";
import { config2 } from "./rspower8.mapping";
import { dialogs_device } from "../../device.dialogs";
import { dialogs_rspower } from "./rspower.dialogs";

import style_common from "../../../utils/common.styles";
import i18n from "../../../translations/myi18n";
import { merge } from "../../../utils/merge";

import type { SocketEntity } from "../../../types/index";

/**
 * Base class for ReefControl Power smart centers (RSPOWER6, RSPOWER8).
 *
 * Follows the same architecture as RSDose with heads:
 * - `sockets_nb` from the mapping sets the socket count (6 or 8)
 * - `_sockets[]` holds per-socket entities, indexed 1..sockets_nb
 * - Each socket is rendered by a `PowerSocket` LitElement child
 *
 * Unlike RSDose heads, sockets are NOT separate HA sub-devices: all
 * per-socket entities live on the main device and are distinguished by
 * their entity key pattern `socket_{idx}_{field}`.
 */
export class RSPower extends RSDevice {
  static styles = [style_common];

  _sockets: SocketEntity[] = [];

  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_device, dialogs_rspower]);
  }

  // ── Entity population ─────────────────────────────────────────────────

  _populate_entities(): void {
    this._populate_entities_with_sockets();
  }

  /**
   * Populate global and per-socket entities.
   *
   * Per-socket entities are identified by matching the HA entity_id against
   * the pattern `socket_{idx}_{field}` (idx is 0-based in HA, stored
   * 1-based in `_sockets[]` to match the user-facing numbering).
   *
   * Each socket slot stores entities keyed by field suffix:
   *   _sockets[1].entities.name     → sensor.xxx_socket_0_name
   *   _sockets[1].entities.state    → sensor.xxx_socket_0_state
   *   _sockets[1].entities.mode     → sensor.xxx_socket_0_mode
   *   _sockets[1].entities.on_off   → switch.xxx_socket_0_on_off
   *   etc.
   */
  _populate_entities_with_sockets(): void {
    this.update_config();

    // Seed socket slots once (index 0 is unused, 1..sockets_nb are real)
    if (this._sockets.length === 0) {
      for (let i = 0; i <= this.config.sockets_nb; i++) {
        this._sockets.push({ entities: {} });
      }
    }
    if (!this._hass) return;

    for (const entity_id in this._hass.entities) {
      const entity = this._hass.entities[entity_id];
      if (!this.device) continue;

      // Check this entity belongs to one of our device entries
      let is_ours = false;
      for (const d of this.device.elements) {
        if (entity.device_id === d.id) {
          is_ours = true;
          break;
        }
      }
      if (!is_ours) continue;

      if (entity.translation_key?.startsWith("socket_")) {
        // Per-socket entity — extract 0-based index from unique_id
        // (format: serial_socket_N_field, stable — built from the
        // integration's key, not from translations).
        const idxMatch = (entity.unique_id ?? entity_id).match(/socket_(\d+)/);
        if (idxMatch) {
          const slot = parseInt(idxMatch[1]);
          if (slot < this._sockets.length) {
            this._sockets[slot].entities[entity.translation_key] = entity;
          }
        }
      } else {
        // Global entity (device_state, maintenance, wifi_quality, mode, …)
        this.entities[entity.translation_key] = entity;
      }
    }
  }

  // ── Hass propagation ──────────────────────────────────────────────────

  set hass(obj: any) {
    this._setting_hass(obj);

    // Propagate hass to each socket's LitElement child
    for (const socket of this._sockets) {
      if (socket?.power_socket) {
        socket.power_socket.hass = obj;
      }
    }
  }

  // ── Socket rendering ──────────────────────────────────────────────────

  _render_socket(socket_id: number): TemplateResult {
    const socket_conf = merge(
      this.config.sockets.common,
      this.config.sockets["socket_" + socket_id],
    );

    if ("power_socket" in this._sockets[socket_id]) {
      // Reuse existing LitElement
      const ps = this._sockets[socket_id].power_socket;
      ps.update_state(this.is_on());
      ps.hass = this._hass;
    } else {
      // Create a new PowerSocket LitElement
      const ps = RSDevice.create_device(
        "redsea-power-socket",
        this._hass,
        socket_conf,
        this as any,
      );
      if (ps) {
        (ps as any).socket_id = socket_id;
        ps.entities = this._sockets[socket_id].entities;
        ps.config = socket_conf;
        (ps as any).update_state(this.is_on());
        this._sockets[socket_id].power_socket = ps;
      }
    }

    return html`
      <div
        class="socket"
        id="socket_${socket_id}"
        style="${this.get_style(socket_conf)}"
      >
        ${this._sockets[socket_id].power_socket}
      </div>
    `;
  }

  // ── Main render ───────────────────────────────────────────────────────

  override _render(style?: any, substyle?: any): TemplateResult {
    return html` <div class="device_bg">
      ${style}
      <img
        class="device_img"
        id="rspower_img"
        alt=""
        src="${this.config.background_img}"
        style="${substyle}"
      />
      <div class="sockets">
        ${Array.from({ length: this.config.sockets_nb }, (_, i) => i + 1).map(
          (id) => this._render_socket(id),
        )}
      </div>
      <div>${this._render_elements(this.is_on())}</div>
    </div>`;
  }

  // ── Editor ────────────────────────────────────────────────────────────

  override renderEditor(): TemplateResult {
    if (this.is_disabled()) {
      return html``;
    }
    this._populate_entities_with_sockets();
    this.update_config();
    return html` <form>${this._editor_common()}</form>`;
  }
}

// ── Concrete subclasses ───────────────────────────────────────────────────────

export class RSPower6 extends RSPower {}

class RSPowerEN extends RSPower {
  constructor() {
    super();
    this.initial_config = config2;
  }
}

export class RSPower8 extends RSPowerEN {}
