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

  // ── ReefControl link ──────────────────────────────────────────────────

  /**
   * Whether a ReefControl hub is paired with this power strip.
   *
   * Pairing survives the hub going offline, so this is read from the paired
   * flag rather than from reachability: an unplugged hub must still show its
   * link picture, blinking, instead of silently disappearing from the card.
   * @return true when a hub is paired
   */
  has_control_link(): boolean {
    return this.get_entity("control_paired")?.state === "on";
  }

  /**
   * Whether the paired hub is currently unreachable.
   * @return true when a hub is paired but its link is down
   */
  control_link_alert(): boolean {
    return (
      this.has_control_link() &&
      this.get_entity("control_link_up")?.state !== "on"
    );
  }

  /**
   * Hardware id of the paired hub, as the strip reports it.
   * @return the hub's hwid, or null when nothing is paired
   */
  linked_control_hwid(): string | null {
    const hwid = this.get_entity("connected_control")?.state;
    if (!hwid || hwid === "unknown" || hwid === "unavailable") return null;
    return hwid;
  }

  /**
   * Find the Home Assistant device entry of the paired hub.
   *
   * The strip reports its peer by hardware id, and the integration stores
   * that same id as the device's `model_id` (and as the second half of its
   * `redsea` identifier). Matching on it keeps the link tied to the hardware:
   * a device renamed in Home Assistant, or a fixture renamed in the
   * simulator, still resolves to the same entry.
   * @return the hub's device registry entry, or null when it is not found
   */
  linked_control_device(): any | null {
    const hwid = this.linked_control_hwid();
    if (!hwid || !this._hass?.devices) return null;

    for (const id in this._hass.devices) {
      const dev: any = this._hass.devices[id];
      if (!dev) continue;
      if (dev.model_id === hwid) return dev;

      // Older entries may predate model_id; the identifier carries the
      // same id, so fall back to it rather than giving up on the link.
      const ident = dev.identifiers?.[0];
      if (Array.isArray(ident) && ident[0] === "redsea" && ident[1] === hwid) {
        return dev;
      }
    }
    return null;
  }

  /**
   * Friendly name of the paired hub, as shown in Home Assistant.
   *
   * A name set by the user wins over the one the integration created, which
   * is what "friendly name" means in Home Assistant.
   * @return the hub's name, or an empty string when it cannot be resolved
   */
  linked_control_name(): string {
    const dev = this.linked_control_device();
    return dev?.name_by_user || dev?.name || "";
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
        // Per-socket entity — extract 0-based index from translation_key
        // (format: "socket_{idx}_{field}", set by the integration).
        // Then store under the base key (without index) so mappings
        // can reference "socket_mode", "socket_prev_mode" etc.
        const idxMatch = entity.translation_key.match(/^socket_(\d+)_(.+)$/);
        if (idxMatch) {
          // Integration uses 0-based indices, card slots are 1-based
          // (index 0 is unused padding).
          const slot = parseInt(idxMatch[1]) + 1;
          const baseKey = "socket_" + idxMatch[2];
          if (slot < this._sockets.length) {
            this._sockets[slot].entities[baseKey] = entity;
            // Also store with domain prefix (e.g. "select.socket_mode")
            // so dialogs can reference the right entity type.
            const domain = entity_id.split(".")[0];
            this._sockets[slot].entities[domain + "." + baseKey] = entity;
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
