/**
 * Energy backup helpers.
 *
 * reefbeatEnergyBackup publishes its sensors over MQTT discovery: battery
 * power and state of charge, mains state, charger telemetry, runtime... The
 * energy backup view hands them to Power Flow Card Plus, which draws the
 * flows between the mains, the battery and the pumps.
 *
 * This module finds those sensors and the pumps of the installation, then
 * writes the configuration of the flow card. Everything here is pure (no
 * Lit, no DOM) so it can be unit tested in isolation.
 *
 * Two things the flow card cannot do by itself are solved by handing it
 * states that do not exist in Home Assistant ("virtual" states, see
 * PowerFlow.states):
 *
 *   - the speed of a pump is not always one entity: a wave pump runs at the
 *     highest of its forward and reverse intensities, and any pump is
 *     stopped by its switch whatever speed it is set to;
 *   - the mains node needs a power entity, which only exists when a charger
 *     reports its telemetry.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//

import type { HassConfig, HassEntity } from "../types/index";

import i18n from "../translations/myi18n";

//----------------------------------------------------------------------------//

/** Sensors of the service the view reads, named by their `reef_role`. */
export type BackupRole =
  | "battery_power"
  | "battery_soc"
  | "power_state"
  | "pump_intensity"
  | "runtime"
  | "outage_duration"
  | "charger_power"
  | "energy_consumed";

/**
 * Ends of the entity id of each sensor, for a service that does not publish
 * its `reef_role` yet (only the battery ones carried it at first).
 *
 * Home Assistant names an MQTT entity after its device and its own name,
 * which the service sets itself ("Reef Battery Backup" + "Puissance"): the
 * first ending. The second one is the unique id of the sensor, for an
 * entity id rebuilt from it.
 */
export const BACKUP_ROLE_SUFFIXES: Record<BackupRole, string[]> = {
  battery_power: ["puissance", "power"],
  battery_soc: ["soc_batterie", "soc"],
  power_state: ["etat_secteur", "power_state"],
  pump_intensity: ["intensite_pompes", "pump_intensity"],
  runtime: ["autonomie", "runtime"],
  outage_duration: ["duree_coupure", "outage_duration"],
  charger_power: ["puissance_chargeur", "charger_power"],
  energy_consumed: ["energie_consommee", "energy_consumed"],
};

/** State of the `power_state` sensor while running on the battery. */
export const BACKUP_STATE_ON_BATTERY = "battery";

/** The flow card draws four individual devices at most. */
export const BACKUP_MAX_PUMPS = 4;

/** Prefix of the virtual states handed to the flow card. */
export const VIRTUAL_PREFIX = "sensor.reef_card_flow_";

/** What a pump is, which picks its icon, its colour and its label. */
export type BackupPumpKind = "gyre" | "return" | "skimmer" | "pump";

/** Colour of each kind of pump in the flow. */
export const BACKUP_PUMP_COLORS: Record<BackupPumpKind, string> = {
  gyre: "#00bcd4",
  return: "#2196f3",
  skimmer: "#ff2030",
  pump: "#2196f3",
};

/** Colours of the battery: what it takes in, and what it gives back. */
export const BACKUP_BATTERY_COLORS = {
  consumption: "#4caf50",
  production: "#ff9800",
};

/** Order the kinds of pump are listed in. */
const KIND_ORDER: BackupPumpKind[] = ["gyre", "return", "skimmer", "pump"];

/** A pump the flow may show. */
export interface BackupPump {
  /** Home Assistant device id */
  id: string;
  /** Name of the device, the one the user gave it when there is one */
  name: string;
  /** True when the user renamed the device in Home Assistant */
  renamed?: boolean;
  /** Entity holding the name of the pump plugged on a ReefRun channel */
  name_entity?: string;
  /** Kind known from the device itself, when it needs no entity to tell */
  kind: BackupPumpKind;
  /** Sensor holding "return" or "skimmer" (ReefRun pump), when there is one */
  type_entity?: string;
  /** Entities holding a speed, in %: the pump runs at the highest of them */
  speed_entities: string[];
  /** Forward and reverse intensities of a wave pump, to tell its direction */
  forward_entity?: string;
  backward_entity?: string;
  /** Switches that stop the pump when off */
  power_entities: string[];
  /**
   * What the energy backup service knows the pump by (Red Sea only): the
   * hardware id of its device, its name, and its channel on a ReefRun.
   */
  hwid?: string;
  owner_name?: string;
  channel?: number;
  /**
   * Entities telling that nothing is plugged on the channel of a ReefRun:
   * its `missing_pump` entity, or the `missing_pump` attribute of its
   * `state` sensor.
   */
  missing_entity?: string;
  state_entity?: string;
}

/**
 * A pump the energy backup service drives, as it publishes it in the
 * `controllers` attribute of its pump intensity sensor.
 */
export interface BackupController {
  /** Name of the device, as the device reports it */
  name?: string;
  /** Hardware id of the device, when the service knows it */
  hwid?: string | null;
  /** Channel of the pump on a ReefRun (1 or 2), absent for a ReefWave */
  pump?: number | null;
}

/** What the view found in Home Assistant, kept between two state updates. */
export interface BackupTopology {
  /** Sensors of the service, by role */
  roles: Partial<Record<BackupRole, string>>;
  /** Pumps of the installation */
  pumps: BackupPump[];
  /** True when the Red Sea icon pack is there (ha-reefbeat-component) */
  redsea_icons: boolean;
}

/** What to hand to the flow card. */
export interface PowerFlow {
  /** Its configuration, null when the battery power sensor is missing */
  config: Record<string, any> | null;
  /** Virtual states, to add to the ones of Home Assistant */
  states: Record<string, HassEntity>;
  /** Virtual entity id -> entity to open in its place on a click */
  aliases: Record<string, string>;
  /** Entities the flow reads: nothing changes while they stay the same */
  watched: string[];
}

//----------------------------------------------------------------------------//
//   TOPOLOGY
//----------------------------------------------------------------------------//

/**
 * Index the entity registry by device.
 * @param hass: the hass object
 * @return for each device id, its entity ids
 */
function entities_by_device(hass: HassConfig): Record<string, string[]> {
  const index: Record<string, string[]> = {};
  const registry: Record<string, any> = (hass.entities as any) || {};
  for (const entity_id in registry) {
    const device_id = registry[entity_id]?.device_id;
    if (!device_id) {
      continue;
    }
    (index[device_id] ??= []).push(entity_id);
  }
  return index;
}

/**
 * Find the sensors of the energy backup service among the entities of its
 * device.
 *
 * The `reef_role` attribute wins: it survives a renamed entity. The end of
 * the entity id is the fallback for a service that does not publish the
 * role of a sensor yet.
 * @param hass: the hass object
 * @param entity_ids: the entities of the device
 * @return the entity id of each sensor found
 */
export function find_backup_entities(
  hass: HassConfig,
  entity_ids: string[],
): Partial<Record<BackupRole, string>> {
  const by_role: Partial<Record<BackupRole, string>> = {};
  const by_suffix: Partial<Record<BackupRole, string>> = {};
  const roles = Object.keys(BACKUP_ROLE_SUFFIXES) as BackupRole[];

  for (const entity_id of entity_ids) {
    if (!entity_id.startsWith("sensor.")) {
      continue;
    }
    const role = hass.states?.[entity_id]?.attributes?.reef_role;
    if (roles.includes(role)) {
      by_role[role as BackupRole] = entity_id;
      continue;
    }
    // The longest ending wins: "..._charger_power" also ends with "_power"
    const object_id = entity_id.slice("sensor.".length);
    let best: BackupRole | null = null;
    let best_length = 0;
    for (const candidate of roles) {
      for (const suffix of BACKUP_ROLE_SUFFIXES[candidate]) {
        if (
          suffix.length > best_length &&
          (object_id === suffix || object_id.endsWith("_" + suffix))
        ) {
          best = candidate;
          best_length = suffix.length;
        }
      }
    }
    if (best !== null) {
      by_suffix[best] = entity_id;
    }
  }
  return { ...by_suffix, ...by_role };
}

/**
 * Find the entity of a device carrying a translation key.
 * @param hass: the hass object
 * @param entity_ids: the entities of the device
 * @param translation_key: the translation key to look for
 * @param domain: the entity domain to keep ("sensor", "switch"...), any when omitted
 * @return the entity id, or undefined
 */
function entity_by_key(
  hass: HassConfig,
  entity_ids: string[],
  translation_key: string,
  domain?: string,
): string | undefined {
  const registry: Record<string, any> = hass.entities as any;
  return entity_ids.find(
    (entity_id) =>
      registry[entity_id]?.translation_key === translation_key &&
      (!domain || entity_id.startsWith(domain + ".")),
  );
}

/**
 * Describe a Red Sea device as a pump, when it is one: a ReefWave, or one
 * of the two pumps of a ReefRun.
 * @param hass: the hass object
 * @param dev: the hass device
 * @param hwid: the second half of its `redsea` identifier
 * @param index: the entities of every device
 * @return the pump, or null
 */
function redsea_pump(
  hass: HassConfig,
  dev: any,
  hwid: string,
  index: Record<string, string[]>,
): BackupPump | null {
  const own = index[dev.id] ?? [];

  if (String(dev.model ?? "").startsWith("RSWAVE")) {
    const forward = entity_by_key(
      hass,
      own,
      "wave_forward_intensity",
      "sensor",
    );
    const backward = entity_by_key(
      hass,
      own,
      "wave_backward_intensity",
      "sensor",
    );
    const speeds = [forward, backward].filter(
      (entity_id): entity_id is string => !!entity_id,
    );
    if (speeds.length === 0) {
      return null;
    }
    const power = entity_by_key(hass, own, "device_state", "switch");
    return {
      id: dev.id,
      name: dev.name_by_user || dev.name,
      renamed: !!dev.name_by_user,
      kind: "gyre",
      speed_entities: speeds,
      forward_entity: forward,
      backward_entity: backward,
      power_entities: power ? [power] : [],
      hwid,
      owner_name: dev.name,
    };
  }

  if (hwid.includes("_pump")) {
    const speed = entity_by_key(hass, own, "speed");
    if (!speed) {
      return null;
    }
    const power: string[] = [];
    const schedule = entity_by_key(hass, own, "schedule_enabled", "switch");
    if (schedule) {
      power.push(schedule);
    }
    // The controller switch stops both pumps
    const parent = dev.via_device_id ? index[dev.via_device_id] : undefined;
    const parent_state = parent
      ? entity_by_key(hass, parent, "device_state", "switch")
      : undefined;
    if (parent_state) {
      power.push(parent_state);
    }
    return {
      id: dev.id,
      name: dev.name_by_user || dev.name,
      renamed: !!dev.name_by_user,
      kind: "pump",
      type_entity: entity_by_key(hass, own, "type", "sensor"),
      speed_entities: [speed],
      power_entities: power,
      // "<hwid of the controller>_pump_<channel>"
      hwid: hwid.replace(/_pump_?\d*$/, ""),
      owner_name: hass.devices?.[dev.via_device_id]?.name ?? dev.name,
      channel: Number(/_pump_?(\d+)$/.exec(hwid)?.[1] ?? 0),
      // The sub-device is only called "<controller> pump <n>": the name of
      // the pump itself is held by an entity
      name_entity:
        entity_by_key(hass, own, "pump_name") ??
        entity_by_key(hass, own, "name", "sensor"),
      missing_entity: entity_by_key(hass, own, "missing_pump"),
      state_entity: entity_by_key(hass, own, "state", "sensor"),
    };
  }

  return null;
}

/**
 * Describe an Aqua Medic device as a pump.
 *
 * A "DC Runner" is a return pump or a skimmer, which the user tells through
 * the `pump_role` select: its state is read when the flow is built.
 * @param hass: the hass object
 * @param dev: the hass device
 * @param index: the entities of every device
 * @return the pump, or null
 */
function aquamedic_pump(
  hass: HassConfig,
  dev: any,
  index: Record<string, string[]>,
): BackupPump | null {
  const own = index[dev.id] ?? [];
  const speed =
    entity_by_key(hass, own, "motor_speed", "number") ??
    entity_by_key(hass, own, "flow", "number");
  if (!speed) {
    return null;
  }
  const power = entity_by_key(hass, own, "power", "switch");
  const model = String(dev.model ?? "")
    .toLowerCase()
    .replaceAll(" ", "");
  let kind: BackupPumpKind = "gyre";
  if (model.includes("skimmer")) {
    kind = "skimmer";
  } else if (model.includes("runner")) {
    kind = "return";
  }
  return {
    id: dev.id,
    name: dev.name_by_user || dev.name,
    renamed: !!dev.name_by_user,
    kind,
    type_entity: entity_by_key(hass, own, "pump_role", "select"),
    speed_entities: [speed],
    power_entities: power ? [power] : [],
  };
}

/**
 * List the pumps of the installation: ReefWave, ReefRun pumps and Aqua
 * Medic pumps, gyres first.
 * @param hass: the hass object
 * @param index: the entities of every device
 * @return the pumps
 */
function list_backup_pumps(
  hass: HassConfig,
  index: Record<string, string[]>,
): BackupPump[] {
  const pumps: BackupPump[] = [];
  for (const device_id in hass.devices) {
    const dev = hass.devices[device_id];
    const ident = dev?.identifiers?.[0];
    if (!dev || !Array.isArray(ident) || dev.disabled_by) {
      continue;
    }
    let pump: BackupPump | null = null;
    if (ident[0] === "redsea") {
      pump = redsea_pump(hass, dev, String(ident[1]), index);
    } else if (ident[0] === "aquamedic") {
      pump = aquamedic_pump(hass, dev, index);
    }
    if (pump) {
      pumps.push(pump);
    }
  }
  return pumps.sort(
    (a, b) =>
      KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
      a.name.localeCompare(b.name),
  );
}

/**
 * Find what the energy backup view needs in Home Assistant: the sensors of
 * the service and the pumps of the installation.
 *
 * It walks the whole entity registry, so the view keeps the result until
 * the registry changes rather than calling this on every state update.
 * @param hass: the hass object
 * @param device_ids: the hass device ids of the energy backup device
 * @return the topology
 */
export function resolve_backup_topology(
  hass: HassConfig,
  device_ids: string[],
): BackupTopology {
  const index = entities_by_device(hass);
  const own = device_ids.flatMap((device_id) => index[device_id] ?? []);
  const pumps = list_backup_pumps(hass, index);
  return {
    roles: find_backup_entities(hass, own),
    pumps,
    redsea_icons: Object.values(hass.devices ?? {}).some(
      (dev) =>
        Array.isArray(dev?.identifiers?.[0]) &&
        dev.identifiers[0][0] === "redsea",
    ),
  };
}

//----------------------------------------------------------------------------//
//   READINGS
//----------------------------------------------------------------------------//

/**
 * Read a state as a number.
 * @param hass: the hass object
 * @param entity_id: the entity to read
 * @return its value, or null when it has none ("unknown", "None"...)
 */
function numeric_state(
  hass: HassConfig,
  entity_id: string | undefined,
): number | null {
  if (!entity_id) {
    return null;
  }
  const raw = hass.states?.[entity_id]?.state;
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * Kind of a pump, read from its type entity when it has one.
 * @param hass: the hass object
 * @param pump: the pump
 * @return what the pump is
 */
export function pump_kind(hass: HassConfig, pump: BackupPump): BackupPumpKind {
  const type = pump.type_entity
    ? hass.states?.[pump.type_entity]?.state
    : undefined;
  if (type === "return" || type === "skimmer") {
    return type;
  }
  return pump.kind;
}

/**
 * Speed of a pump: the highest of its speed entities, zero once one of its
 * switches is off.
 * @param hass: the hass object
 * @param pump: the pump
 * @return the speed, in %
 */
export function pump_speed(hass: HassConfig, pump: BackupPump): number {
  const stopped = pump.power_entities.some(
    (entity_id) => hass.states?.[entity_id]?.state === "off",
  );
  if (stopped) {
    return 0;
  }
  const speed = Math.max(
    0,
    ...pump.speed_entities.map(
      (entity_id) => numeric_state(hass, entity_id) ?? 0,
    ),
  );
  return Math.round(speed);
}

/**
 * Template telling the direction of a wave pump: an arrow, or nothing for a
 * pump that has no direction or is stopped.
 *
 * It has to be a template rendered by Home Assistant: the flow card only
 * shows a secondary entity whose state is a number, and it subscribes to a
 * template once, so the text cannot be rewritten on each state update.
 * @param pump: the pump
 * @return the template, or null for a pump without a direction
 */
export function pump_direction_template(pump: BackupPump): string | null {
  if (!pump.forward_entity && !pump.backward_entity) {
    return null;
  }
  const read = (entity_id: string | undefined) =>
    entity_id ? `states('${entity_id}') | float(0)` : "0";
  return (
    `{% set f = ${read(pump.forward_entity)} %}` +
    `{% set r = ${read(pump.backward_entity)} %}` +
    "{% if f > 0 and r > 0 %}⇄{% elif f > 0 %}→{% elif r > 0 %}←{% endif %}"
  );
}

/**
 * Icon of a pump, which follows its speed.
 *
 * The Red Sea icons come with ha-reefbeat-component: an installation
 * without it (Aqua Medic pumps only) gets the closest Material icons.
 * @param kind: what the pump is
 * @param speed: its speed, in %
 * @param redsea_icons: true when the Red Sea icon pack is there
 * @return the icon
 */
export function pump_icon(
  kind: BackupPumpKind,
  speed: number,
  redsea_icons: boolean,
): string {
  const running = speed > 0;
  if (kind === "gyre") {
    if (!redsea_icons) {
      return running ? "mdi:fan" : "mdi:fan-off";
    }
    if (!running) {
      return "redsea:gyre-off";
    }
    if (speed < 35) {
      return "redsea:gyre-min";
    }
    return speed < 70 ? "redsea:gyre-med" : "redsea:gyre-max";
  }
  if (kind === "skimmer") {
    if (!redsea_icons) {
      return "mdi:chart-bubble";
    }
    return running ? "redsea:skimmer-on" : "redsea:skimmer-off";
  }
  if (!redsea_icons) {
    return running ? "mdi:pump" : "mdi:pump-off";
  }
  return running ? "redsea:pump-on" : "redsea:pump-off";
}

/**
 * Label of each pump of a list: its name in Home Assistant.
 *
 * A ReefRun pump is a sub-device named after its controller ("RSRUN-1234
 * pump 1"), so the name given to the pump itself is preferred, unless the
 * user renamed the sub-device. A pump without any name falls back to its
 * kind, numbered when several share it ("Gyre 1", "Gyre 2", "Return").
 * @param hass: the hass object
 * @param pumps: the pumps
 * @return the labels, in the order of the pumps
 */
export function pump_labels(hass: HassConfig, pumps: BackupPump[]): string[] {
  const names: Record<BackupPumpKind, string> = {
    gyre: i18n._("energy_backup_gyre"),
    return: i18n._("energy_backup_return"),
    skimmer: i18n._("energy_backup_skimmer"),
    pump: i18n._("energy_backup_pump"),
  };
  const kinds = pumps.map((pump) => pump_kind(hass, pump));
  const seen: Partial<Record<BackupPumpKind, number>> = {};
  return pumps.map((pump, pos) => {
    const kind = kinds[pos] as BackupPumpKind;
    const rank = (seen[kind] = (seen[kind] ?? 0) + 1);
    const own =
      !pump.renamed && pump.name_entity
        ? String(hass.states?.[pump.name_entity]?.state ?? "").trim()
        : "";
    if (own !== "" && own !== "unknown" && own !== "unavailable") {
      return own;
    }
    if (pump.name) {
      return pump.name;
    }
    const several = kinds.filter((other) => other === kind).length > 1;
    return several ? `${names[kind]} ${rank}` : names[kind];
  });
}

/**
 * Tell whether a value reported by the integration means "true".
 * @param value: a state or an attribute
 * @return true for true, 1, "on", "true", "1" and "yes"
 */
function is_true(value: unknown): boolean {
  if (value === true || value === 1) {
    return true;
  }
  return (
    typeof value === "string" &&
    ["on", "true", "1", "yes"].includes(value.trim().toLowerCase())
  );
}

/**
 * Tell whether a pump is plugged on the channel of a ReefRun.
 *
 * A ReefRun always exposes its two channels, whatever is plugged in. The
 * controller reports an empty one as `missing_pump`, and as type "unknown"
 * while it has not been told what the pump is. Any other pump is its own
 * device, so it is there.
 * @param hass: the hass object
 * @param pump: the pump
 * @return false for an empty channel of a ReefRun
 */
export function pump_plugged(hass: HassConfig, pump: BackupPump): boolean {
  if (pump.channel === undefined) {
    return true;
  }
  const missing = pump.missing_entity
    ? hass.states?.[pump.missing_entity]?.state
    : pump.state_entity
      ? hass.states?.[pump.state_entity]?.attributes?.["missing_pump"]
      : undefined;
  if (is_true(missing)) {
    return false;
  }
  return !pump.type_entity
    ? true
    : hass.states?.[pump.type_entity]?.state !== "unknown";
}

/**
 * Tell whether a pump is there and still reports a speed. A device left in
 * Home Assistant after its hardware is gone keeps its entities, unavailable;
 * a ReefRun keeps the channel nothing is plugged on.
 * @param hass: the hass object
 * @param pump: the pump
 * @return true when the pump is plugged and one of its speed entities has
 *         a state
 */
export function pump_available(hass: HassConfig, pump: BackupPump): boolean {
  if (!pump_plugged(hass, pump)) {
    return false;
  }
  return pump.speed_entities.some((entity_id) => {
    const state = hass.states?.[entity_id]?.state;
    return (
      state !== undefined && state !== "unavailable" && state !== "unknown"
    );
  });
}

/**
 * Pumps the energy backup service drives, among the ones of the
 * installation.
 *
 * The service lists them in the `controllers` attribute of its pump
 * intensity sensor. A pump is matched on the hardware id of its device, or
 * on its name for a configuration of the service written before it kept
 * that id.
 * @param hass: the hass object
 * @param topology: what resolve_backup_topology() found
 * @return the pumps, or null when the service does not publish the list
 */
export function backed_up_pumps(
  hass: HassConfig,
  topology: BackupTopology,
): BackupPump[] | null {
  const entity_id = topology.roles.pump_intensity;
  const controllers = entity_id
    ? hass.states?.[entity_id]?.attributes?.["controllers"]
    : undefined;
  if (!Array.isArray(controllers)) {
    return null;
  }
  return topology.pumps.filter((pump) =>
    controllers.some((ctrl: BackupController) => {
      if ((ctrl?.pump ?? 0) !== (pump.channel ?? 0)) {
        return false;
      }
      return ctrl?.hwid
        ? pump.hwid === String(ctrl.hwid)
        : !!ctrl?.name && pump.owner_name === ctrl.name;
    }),
  );
}

/**
 * Pumps the flow shows, four at most:
 *
 *   1. the ones the user picked in the editor;
 *   2. else the ones the energy backup service drives, minus the empty
 *      channels of a ReefRun;
 *   3. else (service that does not publish them, or none of them known to
 *      Home Assistant) the first ones found that still report a speed.
 * @param hass: the hass object
 * @param topology: what resolve_backup_topology() found
 * @param selection: the device ids picked in the editor
 * @return the pumps to show
 */
export function select_backup_pumps(
  hass: HassConfig,
  topology: BackupTopology,
  selection: string[],
): BackupPump[] {
  let pumps = topology.pumps.filter((pump) => selection.includes(pump.id));
  if (pumps.length === 0) {
    // The service may still list a channel that has been unplugged since
    pumps = (backed_up_pumps(hass, topology) ?? []).filter((pump) =>
      pump_plugged(hass, pump),
    );
  }
  if (pumps.length === 0) {
    pumps = topology.pumps.filter((pump) => pump_available(hass, pump));
  }
  return pumps.slice(0, BACKUP_MAX_PUMPS);
}

//----------------------------------------------------------------------------//
//   FLOW
//----------------------------------------------------------------------------//

/**
 * Entity id of a virtual state.
 * @param id: the device it stands for
 * @param what: what it holds
 * @return the entity id
 */
function virtual_id(id: string, what: string): string {
  return (
    VIRTUAL_PREFIX + id.toLowerCase().replace(/[^a-z0-9_]/g, "_") + "_" + what
  );
}

/**
 * Build a virtual state.
 * @param entity_id: its entity id
 * @param state: its state
 * @param name: its display name
 * @param unit: its unit
 * @return the state object
 */
function virtual_state(
  entity_id: string,
  state: string,
  name: string,
  unit: string,
): HassEntity {
  return {
    entity_id,
    state,
    attributes: { friendly_name: name, unit_of_measurement: unit },
  };
}

/**
 * Secondary line of a node, left out while its sensor has no value: the
 * flow card would print "unknown" under the node otherwise.
 * @param hass: the hass object
 * @param entity_id: the sensor to show
 * @param unit: its unit
 * @param icon: the icon shown before the value
 * @param decimals: the number of decimals
 * @return the `secondary_info` block, or an empty object
 */
function secondary_info(
  hass: HassConfig,
  entity_id: string | undefined,
  unit: string,
  icon: string,
  decimals: number,
): Record<string, any> {
  if (numeric_state(hass, entity_id) === null) {
    return {};
  }
  return {
    secondary_info: {
      entity: entity_id,
      unit_of_measurement: unit,
      icon,
      decimals,
    },
  };
}

/**
 * Write the configuration of Power Flow Card Plus for an energy backup
 * device, with the virtual states it needs.
 *
 * Sign of the battery power: the service publishes a positive power while
 * the battery discharges, which is what the flow card expects from a single
 * battery entity, so `invert_state` stays off.
 *
 * Mains: the power of the charger feeds both the battery and the pumps,
 * which is exactly what the flow card subtracts to draw the aquarium node.
 * Without a charger sensor the mains node only tells whether the mains is
 * there, and the aquarium node shows what the battery gives.
 * @param hass: the hass object
 * @param device: id and name of the energy backup device
 * @param topology: what resolve_backup_topology() found
 * @param selection: the device ids of the pumps picked in the editor
 * @return what to hand to the flow card
 */
export function build_power_flow(
  hass: HassConfig,
  device: { id: string; name: string },
  topology: BackupTopology,
  selection: string[] = [],
): PowerFlow {
  const roles = topology.roles;
  const flow: PowerFlow = {
    config: null,
    states: {},
    aliases: {},
    watched: [],
  };
  if (!roles.battery_power) {
    return flow;
  }
  flow.watched.push(
    ...Object.values(roles).filter(
      (entity_id): entity_id is string => !!entity_id,
    ),
  );

  const entities: Record<string, any> = {
    battery: {
      entity: roles.battery_power,
      name: i18n._("energy_backup_battery"),
      icon: "mdi:battery",
      color: BACKUP_BATTERY_COLORS,
      display_state: "two_way",
      ...(roles.battery_soc
        ? {
            state_of_charge: roles.battery_soc,
            show_state_of_charge: true,
            state_of_charge_unit: "%",
            state_of_charge_decimals: 0,
          }
        : {}),
    },
    home: {
      ...(roles.energy_consumed ? { entity: roles.energy_consumed } : {}),
      name: i18n._("energy_backup_aquarium"),
      icon: "mdi:fishbowl-outline",
      color_value: true,
      // Runtime left: the flow card has no secondary line on the battery
      ...secondary_info(hass, roles.runtime, "h", "mdi:timer-sand", 1),
    },
  };

  // Mains
  if (roles.charger_power || roles.power_state) {
    let grid_entity = roles.charger_power;
    if (!grid_entity) {
      // No charger telemetry: a node without a figure, only there to tell
      // whether the mains is present
      grid_entity = virtual_id(device.id, "grid");
      flow.states[grid_entity] = virtual_state(
        grid_entity,
        "0",
        i18n._("energy_backup_mains"),
        "W",
      );
      flow.aliases[grid_entity] = roles.power_state as string;
    }
    const on_battery =
      !!roles.power_state &&
      hass.states?.[roles.power_state]?.state === BACKUP_STATE_ON_BATTERY;
    entities["grid"] = {
      entity: grid_entity,
      name: i18n._("energy_backup_mains"),
      icon: "mdi:transmission-tower",
      color_value: true,
      display_state: roles.charger_power ? "one_way" : "one_way_no_zero",
      ...(roles.power_state
        ? {
            power_outage: {
              entity: roles.power_state,
              state_alert: BACKUP_STATE_ON_BATTERY,
              label_alert: i18n._("energy_backup_outage"),
              icon_alert: "mdi:transmission-tower-off",
            },
          }
        : {}),
      // How long the outage has lasted, only while there is one
      ...(on_battery
        ? secondary_info(
            hass,
            roles.outage_duration,
            "min",
            "mdi:clock-alert-outline",
            0,
          )
        : {}),
    };
  }

  // Pumps
  // A channel of a ReefRun enters or leaves the flow when a pump is plugged
  // or unplugged: what tells it is watched for every pump, shown or not
  for (const pump of topology.pumps) {
    flow.watched.push(
      ...[
        pump.missing_entity,
        pump.state_entity,
        pump.type_entity,
        pump.name_entity,
      ].filter((entity_id): entity_id is string => !!entity_id),
    );
  }
  const pumps = select_backup_pumps(hass, topology, selection);
  const labels = pump_labels(hass, pumps);
  const individual: Record<string, any>[] = [];
  pumps.forEach((pump, pos) => {
    const kind = pump_kind(hass, pump);
    const speed = pump_speed(hass, pump);
    const label = labels[pos] as string;
    const entity_id = virtual_id(pump.id, "speed");
    flow.states[entity_id] = virtual_state(
      entity_id,
      String(speed),
      label,
      "%",
    );
    flow.aliases[entity_id] = pump.speed_entities[0] as string;
    flow.watched.push(...pump.speed_entities, ...pump.power_entities);

    const node: Record<string, any> = {
      entity: entity_id,
      name: label,
      icon: pump_icon(kind, speed, topology.redsea_icons),
      color: BACKUP_PUMP_COLORS[kind],
      unit_of_measurement: "%",
      decimals: 0,
      display_zero: true,
    };
    const direction = pump_direction_template(pump);
    if (direction !== null) {
      node["secondary_info"] = { template: direction };
    }
    individual.push(node);
  });
  if (individual.length > 0) {
    entities["individual"] = individual;
  }

  flow.config = {
    type: "custom:power-flow-card-plus",
    title: device.name,
    entities,
    clickable_entities: true,
    display_zero_lines: { mode: "show", transparency: 50 },
    use_new_flow_rate_model: true,
    // Keep the pumps where they are instead of reordering them by speed
    sort_individual_devices: false,
    // Four pumps and a battery: the bottom row would be dropped otherwise
    allow_layout_break: true,
  };
  return flow;
}
