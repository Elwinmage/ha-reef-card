import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./rspower6.mapping";
import { config2 } from "./rspower8.mapping";
import { dialogs_device } from "../../device.dialogs";
import { dialogs_rspower } from "./rspower.dialogs";

import style_common from "../../../utils/common.styles";
import i18n from "../../../translations/myi18n";
import { merge } from "../../../utils/merge";
import {
  list_linkable_devices,
  OTHER_DEVICE_VALUE,
} from "../../../utils/common";

import type { SocketEntity } from "../../../types/index";

/**
 * Socket thumbnails, keyed by hardware model.
 *
 * Each URL is written out in full rather than built from the model name: the
 * bundler only rewrites `new URL()` when its path is a literal, so a computed
 * one silently resolves to the wrong place.
 *
 * ReefRun channels are keyed by the role their pump reports rather than by a
 * model: both pumps carry the controller's, so only their job tells a return
 * pump from a skimmer. First and second generation lights share a picture.
 *
 * Models absent from this table simply get no thumbnail.
 */
const SUB_DEVICE_IMAGES: Record<string, URL> = {
  "RSATO+": new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsato.png",
    import.meta.url,
  ),
  RSCONTROLLITE: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rscontrollite.png",
    import.meta.url,
  ),
  RSCONTROLPRO: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rscontrolpro.png",
    import.meta.url,
  ),
  RSDOSE2: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsdose2.png",
    import.meta.url,
  ),
  RSDOSE4: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsdose4.png",
    import.meta.url,
  ),
  RSMAT: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsmat.png",
    import.meta.url,
  ),
  RSPOWER6: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rspower6.png",
    import.meta.url,
  ),
  RSPOWER8: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rspower8.png",
    import.meta.url,
  ),
  RSWAVE25: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rswave25.png",
    import.meta.url,
  ),
  RSWAVE45: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rswave45.png",
    import.meta.url,
  ),
  RSLED50: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsledG1.png",
    import.meta.url,
  ),
  RSLED90: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsledG1.png",
    import.meta.url,
  ),
  RSLED160: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsledG1.png",
    import.meta.url,
  ),
  RSLED60: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsledG2.png",
    import.meta.url,
  ),
  RSLED115: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsledG2.png",
    import.meta.url,
  ),
  RSLED170: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsledG2.png",
    import.meta.url,
  ),
  return: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsreturn.png",
    import.meta.url,
  ),
  skimmer: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rsskimmer.png",
    import.meta.url,
  ),
};

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
    return html` <form>
      ${this._editor_common()}${this._editor_socket_links()}
    </form>`;
  }

  // ── Pending schedules ─────────────────────────────────────────────────

  /**
   * Schedules written to the strip but not yet read back.
   *
   * A write is acknowledged before the strip serves the new programme, so
   * for a few seconds the mode sensor still carries the previous one.
   * Showing that would make a save look like it was ignored. The editor is
   * rebuilt on every open, so the note has to outlive it and lives here.
   *
   * Each entry keeps the attribute as it read at save time: once the device
   * reports something else, the refresh has landed and the note is dropped —
   * whatever the device says then wins, including a rejected write.
   */
  private _pending_schedules = new Map<
    number,
    { intervals: unknown[]; snapshot: string }
  >();

  /**
   * Remember a schedule just written, pending the device reading it back.
   * @param socket: the 0-based socket number used by the device API
   * @param intervals: the programme that was sent
   * @param snapshot: the attribute as it read before the write
   */
  set_pending_schedule(
    socket: number,
    intervals: unknown[],
    snapshot: string,
  ): void {
    this._pending_schedules.set(socket, { intervals, snapshot });
  }

  /**
   * Forget a pending schedule, when the write it stood for did not happen.
   *
   * A failed write triggers no re-read, so nothing would ever come along to
   * clear the note: it would keep showing a programme the device never got.
   * @param socket: the 0-based socket number used by the device API
   */
  clear_pending_schedule(socket: number): void {
    this._pending_schedules.delete(socket);
  }

  /**
   * The schedule to show for a socket while a write settles.
   * @param socket: the 0-based socket number used by the device API
   * @param current: the attribute the device reports now
   * @return the pending programme, or null once the device has caught up
   */
  pending_schedule(socket: number, current: string): unknown[] | null {
    const pending = this._pending_schedules.get(socket);
    if (!pending) {
      return null;
    }
    if (pending.snapshot !== current) {
      this._pending_schedules.delete(socket);
      return null;
    }
    return pending.intervals;
  }

  // ── Socket links ──────────────────────────────────────────────────────

  /**
   * Per-socket pickers binding a socket to a device known to Home Assistant.
   *
   * The link lives in the card configuration rather than on the strip: the
   * firmware has no notion of what is plugged into a socket, and the editor
   * is the only place able to persist a card's own configuration.
   */
  private _editor_socket_links(): TemplateResult {
    // A socket cannot power the strip it belongs to. The registry id is the
    // usual handle; the config entry is the fallback when the card was given
    // a device record that carries no id.
    const own = this.device?.elements?.[0];
    const own_id = own?.id ?? own?.primary_config_entry ?? null;
    const candidates = list_linkable_devices(this._hass, own_id);
    const count = Number(this.config?.sockets_nb ?? 0);

    const rows: TemplateResult[] = [];
    for (let socket = 1; socket <= count; socket++) {
      rows.push(this._editor_socket_link_row(socket, candidates));
    }

    return html`<table>
      <tr>
        <th colspan="2">${i18n._("linked_device")}</th>
      </tr>
      ${rows}
    </table>`;
  }

  /**
   * One picker row: the socket's own name when it has one, then the list.
   * @param socket: the 1-based socket number
   * @param candidates: the devices offered for linking
   */
  private _editor_socket_link_row(
    socket: number,
    candidates: { value: string; text: string }[],
  ): TemplateResult {
    const selected = this.linked_device_id(socket);
    const socket_name =
      this._sockets[socket]?.entities?.name &&
      this._hass?.states[this._sockets[socket].entities.name.entity_id]?.state;

    return html`<tr>
      <td>
        <label for="linked_device_${socket}">
          ${socket}${socket_name ? " — " + socket_name : ""}
        </label>
      </td>
      <td>
        <select
          id="linked_device_${socket}"
          .value="${selected ?? ""}"
          @change="${(e: Event) => this._handle_socket_link_change(socket, e)}"
        >
          <option value="" ?selected=${!selected}>
            ${i18n._("no_device")}
          </option>
          <option
            value="${OTHER_DEVICE_VALUE}"
            ?selected=${selected === OTHER_DEVICE_VALUE}
          >
            ${i18n._("other_device")}
          </option>
          ${candidates.map(
            (candidate) => html`
              <option
                value="${candidate.value}"
                ?selected=${candidate.value === selected}
              >
                ${candidate.text}
              </option>
            `,
          )}
        </select>
      </td>
    </tr>`;
  }

  /**
   * Device currently linked to a socket, if any.
   * @param socket: the 1-based socket number
   * @return the Home Assistant device id, or null when nothing is linked
   */
  linked_device_id(socket: number): string | null {
    const linked = this.config?.sockets?.["socket_" + socket]?.linked_device;
    return typeof linked === "string" && linked.length > 0 ? linked : null;
  }

  /**
   * Thumbnail of the device linked to a socket.
   *
   * Pictures come from the dedicated `subdevices` folder rather than from
   * each model's own mapping: those are full-size device shots, drawn to be
   * the whole card, and shrinking one to socket size reads as a smudge.
   *
   * A ReefRun pump is pictured by what it drives, not by its controller: the
   * two channels look nothing alike on a tank, and the controller has no
   * plug of its own anyway.
   * @param socket: the 1-based socket number
   * @return the image URL, or null when the model has no picture
   */
  linked_device_image(socket: number): string | null {
    const device_id = this.linked_device_id(socket);
    if (!device_id) {
      return null;
    }
    const model = String(
      (this._hass?.devices?.[device_id] as any)?.model ?? "",
    );
    // The role is tried first and the model only as a fallback. Keying on
    // the controller's model instead would tie this to the exact string the
    // firmware reports, and a pump is better pictured by its job anyway.
    const file =
      SUB_DEVICE_IMAGES[this._pump_role(socket)] ?? SUB_DEVICE_IMAGES[model];
    // Aqua Medic and MQTT appliances have no picture of their own yet.
    return file ? String(file) : null;
  }

  /**
   * Hardware id of the device linked to a socket.
   *
   * Navigation names its target by hardware id, so the linked device's
   * registry entry is translated into the same handle the ReefControl link
   * uses. Sub-devices carry their parent's id, which is what makes a pump
   * resolve to the controller card that can actually draw it.
   * @param socket: the 1-based socket number
   * @return the hardware id, or an empty string when there is nothing linked
   */
  linked_device_hwid(socket: number): string {
    const device_id = this.linked_device_id(socket);
    if (!device_id) {
      return "";
    }
    const dev: any = this._hass?.devices?.[device_id];
    if (dev?.model_id) {
      return String(dev.model_id);
    }
    const ident = dev?.identifiers?.[0];
    // Entries created before model_id existed still carry the id here.
    return Array.isArray(ident) && ident[0] === "redsea"
      ? String(ident[1])
      : "";
  }

  /**
   * Which job a linked ReefRun pump is doing.
   *
   * The channel's role lives on the pump's own `type` entity, the same one
   * the ReefRun card reads to decide which element to draw.
   * @param device_id: the pump's Home Assistant device id
   * @return "return", "skimmer", or "" when the role cannot be read
   */
  private _pump_role(socket: number): string {
    const live = this._linked_entity_state(socket, "type");
    if (live) {
      return live;
    }
    // A device disabled in Home Assistant exposes no entities, so its role
    // can no longer be read. The editor recorded it when the link was made,
    // which keeps the picture right instead of dropping it.
    const stored = this.config?.sockets?.["socket_" + socket]?.linked_role;
    return typeof stored === "string" ? stored : "";
  }

  /**
   * Operating mode of the device linked to a socket.
   *
   * Entities are matched on their translation key, the same convention
   * `_populate_entities` uses, so this follows a device renamed in Home
   * Assistant.
   * @param socket: the 1-based socket number
   * @return the mode state, or null when there is none to read
   */
  linked_device_mode(socket: number): string | null {
    return this._linked_entity_state(socket, "mode");
  }

  /**
   * State of one of the linked device's entities, found by translation key.
   *
   * Entities are matched on their translation key, the same convention
   * `_populate_entities` uses, so this follows a device renamed in Home
   * Assistant. A disabled device has no entities at all and reads as null.
   * @param socket: the 1-based socket number
   * @param key: the entity's translation key
   * @return the state, or null when there is none to read
   */
  private _linked_entity_state(socket: number, key: string): string | null {
    return this._entity_state_of(this.linked_device_id(socket), key);
  }

  /**
   * State of a given device's entity, found by translation key.
   * @param device_id: the device's Home Assistant id
   * @param key: the entity's translation key
   * @return the state, or null when there is none to read
   */
  private _entity_state_of(
    device_id: string | null,
    key: string,
  ): string | null {
    if (!device_id || !this._hass?.entities) {
      return null;
    }
    for (const entity of Object.values(this._hass.entities) as any[]) {
      if (entity?.device_id === device_id && entity?.translation_key === key) {
        return this._hass.states?.[entity.entity_id]?.state ?? null;
      }
    }
    return null;
  }

  /**
   * How the linked thumbnail should be drawn, from the appliance's mode.
   *
   * Running normally it is shown plain; switched off it is greyed; anything
   * else — manual, an unknown mode, a device gone unavailable — blinks,
   * because a socket whose appliance is not following its schedule is worth
   * noticing.
   * @param socket: the 1-based socket number
   * @return the CSS class to apply, empty for the normal state
   */
  linked_device_class(socket: number): string {
    const mode = this.linked_device_mode(socket);
    if (mode === "auto") {
      return "";
    }
    if (mode === "off") {
      return "linked-off";
    }
    if (mode === null) {
      // A ReefRun pump carries no mode — that lives on the controller — and
      // reports its health as a state instead. Anything but a pump running
      // normally is worth a look.
      const state = this._linked_entity_state(socket, "state");
      if (state !== null) {
        return state === "operational" ? "" : "blink-alert";
      }
    }
    return "blink-alert";
  }

  /**
   * Persist a socket link into the card configuration.
   *
   * Clearing a link removes the key rather than storing an empty string, so
   * a configuration never accumulates dead entries.
   * @param socket: the 1-based socket number
   * @param event: the select change event
   */
  private _handle_socket_link_change(socket: number, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const model = this.config_model();
    const device_name = this.device?.name;
    if (!model || !device_name) {
      return;
    }

    let new_config = JSON.parse(JSON.stringify(this.user_config ?? {}));
    new_config = merge(new_config, {
      conf: {
        [model]: {
          devices: {
            [device_name]: { sockets: { ["socket_" + socket]: {} } },
          },
        },
      },
    });

    const socket_conf =
      new_config.conf[model].devices[device_name].sockets["socket_" + socket];
    if (value) {
      socket_conf.linked_device = value;
      // A ReefRun pump is pictured by its job, which is readable now but not
      // once the device is disabled in Home Assistant. Recording it here
      // keeps the thumbnail right for as long as the link lasts.
      const role = this._entity_state_of(value, "type");
      if (role) {
        socket_conf.linked_role = role;
      } else {
        delete socket_conf.linked_role;
      }
    } else {
      delete socket_conf.linked_device;
      delete socket_conf.linked_role;
    }

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: new_config },
        bubbles: true,
        composed: true,
      }),
    );
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
