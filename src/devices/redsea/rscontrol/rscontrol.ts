import { html, nothing, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./rscontrollite.mapping";
import { config2 } from "./rscontrolpro.mapping";
import {
  probe_aliases,
  probe_disconnected,
  reading_level,
  level_color,
  PRIMARY_KEYS,
  ProbeLevel,
} from "./control_probe";
import { port_aliases } from "./control_port";
import { dialogs_device } from "../../device.dialogs";
import { dialogs_rscontrol } from "./rscontrol.dialogs";

import style_common from "../../../utils/common.styles";
import style_animations from "../../../utils/animations.styles";
import style_rscontrol from "./rscontrol.styles";
import { merge } from "../../../utils/merge";
import i18n from "../../../translations/myi18n";

import type { ProbeEntity } from "../../../types/index";

/** States meaning an entity carries no usable value. */
const EMPTY_STATES: readonly string[] = ["", "unknown", "unavailable"];

/** Port states meaning the 12V output is powered. */
const PORT_ON_STATES: readonly string[] = ["on", "fallback_on"];

/** Model drawn when the paired power strip cannot be resolved. */
const DEFAULT_POWER_MODEL = "RSPOWER6";

/** Probe or port an entity belongs to, as its attributes told us. */
interface EntityScope {
  uid?: string;
  type?: string;
  index?: number | null;
  port?: number;
}

/**
 * Base class for the ReefControl hubs (RSCONTROLLITE, RSCONTROLPRO).
 *
 * Follows the RSPower architecture: the hub picture is built from full-canvas
 * overlays driven by predicates, and each ReefSense probe is rendered by its
 * own `ControlProbe` LitElement (as RSPower does with `PowerSocket`).
 *
 * Unlike sockets, probes cannot be told apart by translation key: every probe
 * of a type shares the same keys. The integration tags their entities with
 * `probe_uid` / `probe_type` / `probe_index`, and the 12V port entities with
 * `port`, which is what `_scan_entities()` groups them by.
 */
export class RSControl extends RSDevice {
  static styles = [style_common, style_animations, style_rscontrol];

  /** Probes drawn on the picture, by slot (see `_place_probes`). */
  _probes: ProbeEntity[] = [];

  /** Every probe of the hub, in the order the hub lists them. */
  _all_probes: ProbeEntity[] = [];

  // Entity scopes seen so far, by entity id. An entity gone unavailable
  // loses its attributes, and with them the probe it belongs to: without
  // this it would silently fall out of its probe.
  private _scopes: Record<string, EntityScope> = {};

  // Probe elements, kept across renders by probe key
  private _probe_elements: Record<string, any> = {};

  // Probe layout and self-drawn states last rendered, to re-render when a
  // probe comes or goes, or when a mask or the summary must change
  private _layout: string = "";

  /** Entities of each 12V port (1-based), keyed like `entities`. */
  _ports: Record<number, Record<string, any>> = {};

  // Port elements, kept across renders by port number
  private _port_elements: Record<number, any> = {};

  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_device, dialogs_rscontrol]);
  }

  // ── Entity population ─────────────────────────────────────────────────

  override _populate_entities(): void {
    this.update_config();
    this._scan_entities();
  }

  /**
   * Sort the hub's entities into global ones and per-probe ones.
   *
   * Global entities are keyed by translation key, as everywhere else. A port
   * entity is also stored as `{translation_key}_{port}` (1-based), since
   * both ports share the same keys. Probe entities go to their probe's slot
   * in `_probes`.
   */
  _scan_entities(): void {
    if (!this._hass?.entities || !this.device) return;
    const ours = new Set(this.device.elements.map((d: any) => d.id));
    const found: Record<string, ProbeEntity> = {};
    const ports: Record<number, Record<string, any>> = {};

    for (const entity_id in this._hass.entities) {
      const entity = this._hass.entities[entity_id];
      if (!ours.has(entity.device_id)) continue;
      const key = entity.translation_key;
      const domain = entity_id.split(".")[0];
      const scope = this._scope_of(entity_id);

      if (scope.uid && scope.type) {
        const probe_key = scope.type + ":" + scope.uid;
        if (!found[probe_key]) {
          found[probe_key] = {
            uid: scope.uid,
            type: scope.type,
            index: null,
            entities: {},
            // Rescans rebuild the probe list: keep the element rendering it
            control_probe: this._probe_elements[probe_key],
          };
        }
        const probe = found[probe_key];
        if (typeof scope.index === "number") probe.index = scope.index;
        // An EC probe has one set of range bounds per unit, sharing their
        // keys, and only the set of the current unit is available: never
        // let an unavailable entity hide an available one.
        const current = probe.entities[key];
        if (
          !current ||
          this._is_available(entity_id) ||
          !this._is_available(current.entity_id)
        ) {
          probe.entities[key] = entity;
          probe.entities[domain + "." + key] = entity;
        }
        continue;
      }

      this.entities[key] = entity;
      this.entities[domain + "." + key] = entity;
      if (typeof scope.port === "number") {
        const n = scope.port + 1;
        this.entities[key + "_" + n] = entity;
        this.entities[domain + "." + key + "_" + n] = entity;
        ports[n] = ports[n] ?? {};
        ports[n][key] = entity;
        ports[n][domain + "." + key] = entity;
      }
    }
    this._ports = ports;

    this._all_probes = Object.values(found).sort(
      (a, b) =>
        (a.index ?? Infinity) - (b.index ?? Infinity) ||
        (a.type + a.uid).localeCompare(b.type + b.uid),
    );
    this._probes = this._place_probes(this._all_probes);
  }

  /**
   * Give each probe its slot on the picture.
   *
   * A probe the user pinned to a slot in the editor (`probe_slots`, keyed
   * `type:uid`) takes it; the others fill the free slots in the hub's order.
   * Two probes pinned to the same slot: the first in the hub's order keeps
   * it, the other is placed as if unpinned. Probes left without a free slot
   * are not drawn.
   * @param probes: every probe, in the hub's order
   * @return the drawn probes with their `slot` set, by slot
   */
  _place_probes(probes: ProbeEntity[]): ProbeEntity[] {
    const max = Number(this.config?.probes?.max ?? 7);
    const pinned = this.config?.probe_slots ?? {};
    const slots: (ProbeEntity | null)[] = new Array(max).fill(null);
    const rest: ProbeEntity[] = [];
    for (const probe of probes) {
      const slot = Number(pinned[probe.type + ":" + probe.uid]);
      if (
        Number.isInteger(slot) &&
        slot >= 1 &&
        slot <= max &&
        !slots[slot - 1]
      ) {
        slots[slot - 1] = probe;
      } else {
        rest.push(probe);
      }
    }
    for (const probe of rest) {
      const free = slots.indexOf(null);
      if (free < 0) break;
      slots[free] = probe;
    }
    const placed: ProbeEntity[] = [];
    slots.forEach((probe, idx) => {
      if (probe) {
        probe.slot = idx + 1;
        placed.push(probe);
      }
    });
    return placed;
  }

  /**
   * Whether an entity reports a usable state.
   * @param entity_id: the entity
   * @return false when unavailable or unknown to hass
   */
  private _is_available(entity_id: string): boolean {
    const state = this._hass?.states?.[entity_id]?.state;
    return state !== undefined && state !== "unavailable";
  }

  /**
   * Probe or port an entity belongs to, remembered across updates.
   * @param entity_id: the entity
   * @return its scope, empty for a hub-level entity
   */
  private _scope_of(entity_id: string): EntityScope {
    const attrs = this._hass?.states?.[entity_id]?.attributes;
    if (attrs && typeof attrs.probe_uid === "string" && attrs.probe_type) {
      this._scopes[entity_id] = {
        uid: attrs.probe_uid,
        type: String(attrs.probe_type),
        index: typeof attrs.probe_index === "number" ? attrs.probe_index : null,
      };
    } else if (attrs && typeof attrs.port === "number") {
      this._scopes[entity_id] = { port: attrs.port };
    }
    return this._scopes[entity_id] ?? {};
  }

  /**
   * Signature of the probe layout: which probe sits in which slot.
   * @return a string that changes when a probe comes, goes or moves
   */
  private _probes_layout(): string {
    return this._probes
      .map((p) => p.slot + "=" + p.type + ":" + p.uid)
      .join(",");
  }

  // ── Hass propagation ──────────────────────────────────────────────────

  set hass(obj: any) {
    // Rescan first: overlays evaluate probes_nb() when hass reaches them.
    this._hass = obj;
    this._scan_entities();
    this._setting_hass(obj);

    // Re-render for what this card draws itself — probe slots, socket
    // masks, summary bar. Overlays, probes and ports refresh on their own.
    const layout = this._probes_layout() + "#" + this._drawn_signature();
    if (layout !== this._layout) {
      this._layout = layout;
      this.requestUpdate();
    }
    for (const probe of this._probes) {
      if (probe.control_probe) {
        probe.control_probe.hass = obj;
      }
    }
    for (const port of Object.values(this._port_elements)) {
      if (port) port.hass = obj;
    }
  }

  /**
   * Everything the card draws itself from states rather than through an
   * element: the powered sockets of the paired strip and the summary bar.
   * @return a string that changes whenever one of them must be redrawn
   */
  private _drawn_signature(): string {
    if (!this.config) return "";
    const sockets = this.has_power_link()
      ? this.linked_power_model() + ":" + this.linked_power_sockets_on()
      : "";
    if (!this.config.summary) return sockets;
    const temp = this.summary_temperature();
    const items = this.summary_items()
      .map((i) => i.text + i.title + i.level)
      .join(",");
    return [
      sockets,
      this.summary_alarm(),
      temp ? this._format(temp) : "",
      this.temperature_anomaly(),
      this.get_entity("temperature_anomaly_source")?.state,
      items,
    ].join("|");
  }

  get hass(): any {
    return this._hass;
  }

  // ── Predicates for the mapping ────────────────────────────────────────

  /**
   * Number of probes connected to the hub.
   * @return the count, capped to the slots the picture has
   */
  probes_nb(): number {
    return this._probes.length;
  }

  /**
   * Whether a probe is drawn in a slot.
   * @param slot: the 1-based slot number
   * @return true when a probe occupies it
   */
  slot_used(slot: number): boolean {
    return this._probes.some((p) => p.slot === slot);
  }

  /**
   * Highest slot in use: beyond 4, the second ReefSense box is drawn and
   * the fourth cable takes the route that goes around it.
   * @return the slot number, 0 without any probe
   */
  max_slot(): number {
    // Drawn probes always have their slot (see _place_probes)
    return this._probes.reduce((max, p) => Math.max(max, Number(p.slot)), 0);
  }

  /**
   * Hardware id of the paired power strip.
   * @return the hwid, or null when none is paired
   */
  linked_power_hwid(): string | null {
    const hwid = this.get_entity("connected_power")?.state;
    return typeof hwid === "string" && !EMPTY_STATES.includes(hwid)
      ? hwid
      : null;
  }

  /**
   * Whether a power strip is paired. Pairing survives the strip going
   * offline, so the link stays drawn — blinking — rather than disappearing.
   * @return true when paired
   */
  has_power_link(): boolean {
    return this.linked_power_hwid() !== null;
  }

  /**
   * Whether the paired power strip is unreachable.
   * @return true when paired but not connected
   */
  power_link_alert(): boolean {
    return (
      this.has_power_link() && this.get_entity("power_link_up")?.state !== "on"
    );
  }

  /**
   * Home Assistant device entry of the paired power strip.
   *
   * The hub reports its peer by hardware id, which the integration stores
   * as the device's `model_id` (and in its `redsea` identifier).
   * @return the device entry, or null when it cannot be resolved
   */
  linked_power_device(): any | null {
    const hwid = this.linked_power_hwid();
    if (!hwid || !this._hass?.devices) return null;
    for (const dev of Object.values(this._hass.devices) as any[]) {
      const ident = dev?.identifiers?.[0];
      if (
        dev?.model_id === hwid ||
        (Array.isArray(ident) && ident[0] === "redsea" && ident[1] === hwid)
      ) {
        return dev;
      }
    }
    return null;
  }

  /**
   * Model of the paired power strip.
   * @return "RSPOWER6" or "RSPOWER8"; RSPOWER6 when it cannot be resolved
   */
  linked_power_model(): string {
    return this.linked_power_device()?.model === "RSPOWER8"
      ? "RSPOWER8"
      : DEFAULT_POWER_MODEL;
  }

  /**
   * Which sockets of the paired power strip are powered.
   *
   * Read from the strip's own `socket_N_on_off` switches, which report the
   * effective state whatever drives the socket (manual, schedule, probe).
   * @return the 1-based numbers of the powered sockets
   */
  linked_power_sockets_on(): number[] {
    const dev = this.linked_power_device();
    if (!dev || !this._hass?.entities) return [];
    const on: number[] = [];
    for (const entity of Object.values(this._hass.entities) as any[]) {
      if (entity?.device_id !== dev.id) continue;
      const match = /^socket_(\d+)_on_off$/.exec(entity.translation_key ?? "");
      if (match && this._hass.states?.[entity.entity_id]?.state === "on") {
        on.push(Number(match[1]) + 1);
      }
    }
    return on.sort((a, b) => a - b);
  }

  /**
   * Hardware id of the hub itself, as the integration stores it.
   * @return the hwid, or null when the device entry carries none
   */
  hub_hwid(): string | null {
    const dev: any = this.device?.elements?.[0];
    if (dev?.model_id) return String(dev.model_id);
    const ident = dev?.identifiers?.[0];
    return Array.isArray(ident) && ident[0] === "redsea"
      ? String(ident[1])
      : null;
  }

  /**
   * Whether a 12V port drives an ATO pump.
   *
   * Two set-ups: the Red Sea ATO kit, installed as a port of type "ato",
   * or any pump on a port of type "other" following an ATO probe — the
   * way the app links an ATO probe to a port (captured: type "other",
   * mode "sensor", hub rule of type "ato"). The rule comes with the port's
   * mode sensor, as `sensor_config`.
   * @param port: the 1-based port number
   * @return true when the port is of type "ato" or follows an ATO probe
   */
  is_ato_port(port: number): boolean {
    if (this.get_entity("port_type_" + port)?.state === "ato") return true;
    const mode = this.get_entity("sensor.port_mode_" + port);
    return (
      mode?.state === "sensor" && mode.attributes?.sensor_config?.type === "ato"
    );
  }

  /**
   * Whether any 12V port drives an ATO pump.
   * @return true when at least one does
   */
  has_ato_link(): boolean {
    return this.is_ato_port(1) || this.is_ato_port(2);
  }

  /**
   * Whether a 12V port is powered.
   * @param port: the 1-based port number
   * @return true when it is on
   */
  is_port_on(port: number): boolean {
    return PORT_ON_STATES.includes(
      this.get_entity("port_state_" + port)?.state,
    );
  }

  // ── Probe rendering ───────────────────────────────────────────────────

  /**
   * Configuration of one probe: shared part, then its type, then its slot.
   * @param probe: the probe
   * @param slot: the 1-based slot number
   * @return the merged configuration
   */
  _probe_config(probe: ProbeEntity, slot: number): any {
    const probes = this.config.probes;
    const typed = merge(probes.common, probes.common.types?.[probe.type] ?? {});
    return merge(typed, probes["probe_" + slot] ?? {});
  }

  /**
   * Hub entities a probe may read, without any probe-scoped one.
   *
   * A probe entity the integration could not tag stays among the hub's own:
   * an entity that is unavailable carries no attributes, which is always the
   * case of the range bounds an EC probe keeps for its other units. Handed
   * to every probe, it would stand in for a setting that probe does not
   * have — the salinity bounds showing up in an ATO probe's settings.
   * @return the hub entities, keyed as in `entities`
   */
  _hub_entities(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, entity] of Object.entries(this.entities)) {
      const bare = key.includes(".") ? key.split(".")[1] : key;
      if (!bare.startsWith("probe_")) result[key] = entity;
    }
    return result;
  }

  _render_probe(probe: ProbeEntity, slot: number): TemplateResult {
    const conf = this._probe_config(probe, slot);
    const key = probe.type + ":" + probe.uid;
    const entities = {
      ...this._hub_entities(),
      ...probe_aliases(probe.type, probe.entities),
    };

    let elt = this._probe_elements[key];
    if (!elt) {
      elt = RSDevice.create_device(
        "redsea-control-probe",
        this._hass,
        conf,
        this as any,
      );
      this._probe_elements[key] = elt;
    }
    if (elt) {
      // Elements bind their entity when created: rebuild them when the
      // probe gains or loses an entity (one appearing after the others).
      const entity_keys = Object.keys(entities).sort().join(",");
      if (elt._entity_keys !== entity_keys) {
        elt._entity_keys = entity_keys;
        elt._elements = {};
      }
      elt.probe_type = probe.type;
      elt.probe_uid = probe.uid;
      elt.slot_id = slot;
      elt.entities = entities;
      elt.config = conf;
      elt.update_state(this.is_on());
      elt.hass = this._hass;
    }
    probe.control_probe = elt;

    return html`
      <div
        class="probe_slot"
        id="probe_${slot}"
        style="${this.get_style(conf)}"
      >
        ${elt}
      </div>
    `;
  }

  // ── Port rendering ────────────────────────────────────────────────────

  /**
   * Configuration of one port: shared part, then its own.
   * @param port: the 1-based port number
   * @return the merged configuration
   */
  _port_config(port: number): any {
    const ports = this.config.ports;
    return merge(ports.common, ports["port_" + port] ?? {});
  }

  _render_port(port: number): TemplateResult {
    const conf = this._port_config(port);
    const entities = {
      ...this._hub_entities(),
      ...port_aliases(this._ports[port] ?? {}),
    };
    let elt = this._port_elements[port];
    if (!elt) {
      elt = RSDevice.create_device(
        "redsea-control-port",
        this._hass,
        conf,
        this as any,
      );
      this._port_elements[port] = elt;
    }
    if (elt) {
      // Elements bind their entity when created: rebuild them when the
      // port gains or loses an entity
      const entity_keys = Object.keys(entities).sort().join(",");
      if (elt._entity_keys !== entity_keys) {
        elt._entity_keys = entity_keys;
        elt._elements = {};
      }
      elt.port_id = port;
      elt.entities = entities;
      elt.config = conf;
      elt.update_state(this.is_on());
      elt.hass = this._hass;
    }
    return html`<div
      class="port_slot"
      id="port_${port}"
      style="${this.get_style(conf)}"
    >
      ${elt}
    </div>`;
  }

  // ── Power strip sockets ───────────────────────────────────────────────

  /**
   * A light mask over each powered socket of the paired strip.
   *
   * Geometry is per strip model (`power_sockets` in the mapping, in % of
   * the hub picture), since the 6 and 8-socket strips are drawn differently.
   */
  _render_socket_masks(): TemplateResult | typeof nothing {
    if (!this.has_power_link()) return nothing;
    const geometry = this.config.power_sockets?.[this.linked_power_model()];
    if (!geometry) return nothing;
    return html`${this.linked_power_sockets_on().map((socket) => {
      const left = geometry.lefts[socket - 1];
      if (left === undefined) return nothing;
      return html`<div
        class="socket_mask"
        id="socket_mask_${socket}"
        style="left:${left}%;top:${geometry.top}%;width:${geometry.width}%;height:${geometry.height}%"
      ></div>`;
    })}`;
  }

  // ── Summary bar ───────────────────────────────────────────────────────

  /**
   * Open the more-info dialog of an entity.
   * @param entity_id: the entity to show
   */
  _more_info(entity_id: string): void {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: entity_id },
      }),
    );
  }

  /**
   * State object of a probe entity.
   * @param probe: the probe
   * @param key: the entity's translation key
   */
  private _probe_state(probe: ProbeEntity, key: string): any {
    const entity = probe.entities[key];
    return entity ? (this._hass?.states?.[entity.entity_id] ?? null) : null;
  }

  /**
   * Formatted state of an entity, with its unit.
   * @param st: the state object
   */
  private _format(st: any): string {
    if (typeof this._hass?.formatEntityState === "function") {
      return this._hass.formatEntityState(st);
    }
    const unit = st.attributes?.unit_of_measurement;
    return unit ? `${st.state} ${unit}` : String(st.state);
  }

  /**
   * Readings of the summary bar, in its order: pH, ORP, salinity, leak,
   * ATO water level; every probe of a type is listed.
   * @return one entry per reading, with the level it is drawn with
   */
  summary_items(): {
    type: string;
    entity_id: string;
    text: string;
    title: string;
    icon: string;
    level: ProbeLevel;
  }[] {
    const items: {
      type: string;
      entity_id: string;
      text: string;
      title: string;
      icon: string;
      level: ProbeLevel;
    }[] = [];
    for (const type of ["ph", "orp", "ec", "leak", "ato"]) {
      for (const probe of this._probes.filter((p) => p.type === type)) {
        const primary = this._probe_state(probe, PRIMARY_KEYS[type]);
        if (!primary) continue;
        const disconnected = probe_disconnected(
          this._probe_state(probe, "probe_status"),
          primary,
        );
        const entity_id = probe.entities[PRIMARY_KEYS[type]].entity_id;
        if (type === "leak") {
          const wet = primary.state === "on";
          items.push({
            type,
            entity_id,
            text: "",
            title: this._format(primary),
            icon: wet ? "mdi:water-alert" : "mdi:water-check",
            level: disconnected ? "error" : wet ? "danger" : "desired",
          });
        } else if (type === "ato") {
          const water = String(primary.state);
          // Icon only: a translated water level is too long for the bar,
          // the colour tells the level and the tooltip names it
          items.push({
            type,
            entity_id,
            text: "",
            title: this._format(primary),
            icon: "mdi:waves",
            level: disconnected
              ? "error"
              : water.startsWith("desired")
                ? "desired"
                : water === "above" || water === "below"
                  ? "acceptable"
                  : "error",
          });
        } else {
          // pH has no unit in Home Assistant: name it, as on the probe
          const text = this._format(primary);
          items.push({
            type,
            entity_id,
            text: type === "ph" && !/ph/i.test(text) ? `${text} pH` : text,
            title: text,
            icon: "",
            level: reading_level(
              primary,
              this._probe_state(probe, "probe_level"),
              disconnected,
            ),
          });
        }
      }
    }
    return items;
  }

  /**
   * Worst level among every reading of the hub, embedded temperatures
   * included: what the alarm at the head of the summary bar reports.
   * @return "danger", "acceptable", or null when everything is fine
   */
  summary_alarm(): ProbeLevel | null {
    const levels: ProbeLevel[] = this.summary_items().map((i) => i.level);
    for (const probe of this._probes) {
      const disconnected = probe_disconnected(
        this._probe_state(probe, "probe_status"),
        this._probe_state(probe, PRIMARY_KEYS[probe.type]),
      );
      const temp = this._probe_state(probe, "probe_temperature");
      if (temp && !disconnected) {
        const level_key =
          probe.type === "temperature" ? "probe_level" : "probe_temp_level";
        levels.push(
          reading_level(temp, this._probe_state(probe, level_key), false),
        );
      }
    }
    if (levels.includes("danger")) return "danger";
    if (levels.includes("acceptable")) return "acceptable";
    return null;
  }

  /**
   * Temperature shown in the summary bar: the hub's fused value when it has
   * several sources, else the reading of its temperature probe, else the
   * first embedded temperature.
   * @return the state object, or null without any temperature
   */
  summary_temperature(): any {
    const fused = this.get_entity("temperature_fusion");
    if (fused && !EMPTY_STATES.includes(fused.state)) return fused;
    const probes = [
      ...this._probes.filter((p) => p.type === "temperature"),
      ...this._probes.filter((p) => p.type !== "temperature"),
    ];
    for (const probe of probes) {
      const st = this._probe_state(probe, "probe_temperature");
      if (st && !EMPTY_STATES.includes(st.state)) return st;
    }
    return null;
  }

  /**
   * Whether the hub flags one of its temperature sources as wrong.
   * @return true when the anomaly sensor names a culprit or the readings
   *         disagree
   */
  temperature_anomaly(): boolean {
    const source = this.get_entity("temperature_anomaly_source")?.state;
    if (source && !["ok", ...EMPTY_STATES].includes(source)) return true;
    return this.get_entity("temperature_coherent")?.state === "on";
  }

  _render_summary(): TemplateResult | typeof nothing {
    const conf = this.config.summary;
    if (!conf || !this._hass) return nothing;
    const alarm = this.summary_alarm();
    const temp = this.summary_temperature();
    const anomaly = this.get_entity("temperature_anomaly_source");
    const alarm_icon = alarm
      ? html`<ha-icon
          class="summary_alarm"
          icon="mdi:alert"
          style="color:${level_color(alarm)}"
        ></ha-icon>`
      : nothing;
    const temperature = temp
      ? html`<span
          class="summary_item summary_temperature"
          title="${i18n._("temperature")}"
          @click="${() => this._more_info(temp.entity_id)}"
          >${this._format(temp)}</span
        >`
      : nothing;
    const anomaly_icon =
      this.temperature_anomaly() && anomaly
        ? html`<ha-icon
            class="summary_item summary_anomaly"
            icon="mdi:thermometer-alert"
            title="${anomaly.state}"
            style="color:${level_color("danger")}"
            @click="${() => this._more_info(anomaly.entity_id)}"
          ></ha-icon>`
        : nothing;
    const items = this.summary_items().map((item) => {
      const icon = item.icon
        ? html`<ha-icon icon="${item.icon}"></ha-icon>`
        : nothing;
      return html`<span
        class="summary_item summary_${item.type}"
        title="${item.title}"
        style="color:${level_color(item.level)}"
        @click="${() => this._more_info(item.entity_id)}"
        >${icon}${item.text}</span
      >`;
    });
    return html`<div class="summary" style="${this.get_style(conf)}">
      <div class="summary_row">
        ${alarm_icon}${temperature}${anomaly_icon}${items}
      </div>
    </div>`;
  }

  // ── Main render ───────────────────────────────────────────────────────

  override _render(style?: any, substyle?: any): TemplateResult {
    return html` <div class="device_bg">
      ${style}
      <img
        class="device_img"
        id="rscontrol_img"
        alt=""
        src="${this.config.background_img}"
        style="${substyle}"
      />
      <div>${this._render_elements(this.is_on())}</div>
      <div class="canvas_layer">
        ${this._render_socket_masks()}
        ${this._probes.map((probe) => this._render_probe(probe, probe.slot))}
        ${Array.from(
          { length: Number(this.config.ports?.nb ?? 0) },
          (_, i) => i + 1,
        ).map((port) => this._render_port(port))}
        ${this._render_summary()}
      </div>
    </div>`;
  }

  // ── Editor ────────────────────────────────────────────────────────────

  override renderEditor(): TemplateResult {
    if (this.is_disabled()) {
      return html``;
    }
    this._populate_entities();
    return html`<form>
      ${this._editor_common()}${this._editor_probe_slots()}
    </form>`;
  }

  /**
   * Name of a probe as the hub knows it, for the editor.
   * @param probe: the probe
   * @return its name, or its type and uid when it has none
   */
  probe_label(probe: ProbeEntity): string {
    const name = this._probe_state(probe, "probe_name")?.state;
    return name && !EMPTY_STATES.includes(name)
      ? `${name} (${probe.uid})`
      : `${probe.type} (${probe.uid})`;
  }

  /**
   * One picker per probe pinning it to a slot of the picture, or leaving
   * it to follow the hub's order ("Auto", which shows where it is now).
   */
  private _editor_probe_slots(): TemplateResult {
    // The configuration was just built by _populate_entities()
    const max = Number(this.config.probes.max);
    const pinned = this.config?.probe_slots ?? {};
    const slots = Array.from({ length: max }, (_, i) => i + 1);
    return html`<table>
      <tr>
        <th colspan="2">${i18n._("probe_slots")}</th>
      </tr>
      ${this._all_probes.map((probe) => {
        const key = probe.type + ":" + probe.uid;
        const current = Number(pinned[key]) || 0;
        const auto = probe.slot
          ? `${i18n._("probe_slot_auto")} (${probe.slot})`
          : i18n._("probe_slot_auto");
        return html`<tr>
          <td><label for="slot_${key}">${this.probe_label(probe)}</label></td>
          <td>
            <select
              id="slot_${key}"
              @change="${(e: Event) =>
                this._handle_probe_slot_change(
                  key,
                  (e.target as HTMLSelectElement).value,
                )}"
            >
              <option value="" ?selected=${!current}>${auto}</option>
              ${slots.map(
                (slot) =>
                  html`<option value="${slot}" ?selected=${slot === current}>
                    ${slot}
                  </option>`,
              )}
            </select>
          </td>
        </tr>`;
      })}
    </table>`;
  }

  /**
   * Pin a probe to a slot, or unpin it ("" = Auto). Unpinning removes the
   * key rather than storing an empty value.
   * @param key: the probe, as `type:uid`
   * @param value: the slot number, or "" for Auto
   */
  private _handle_probe_slot_change(key: string, value: string): void {
    const pinned: Record<string, number> = {
      ...(this.config?.probe_slots ?? {}),
    };
    if (value) {
      pinned[key] = Number(value);
    } else {
      delete pinned[key];
    }
    this.set_config_value("probe_slots", pinned);
  }
}

export class RSControlLite extends RSControl {}

class RSControlProEx extends RSControl {
  constructor() {
    super();
    this.initial_config = config2;
  } // end of constructor
}

export class RSControlPro extends RSControlProEx {}
