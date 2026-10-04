/**
 * Global constants used across the application
 */

/**
 * Color used when device/element is OFF or disabled
 * RGB format: "R,G,B"
 */
export const OFF_COLOR = "150,150,150";

/**
 * Default alpha (opacity) value for colors
 */
export const DEFAULT_ALPHA = 0.5;

// ─── Maintenance overview ─────────────────────────────────────────────────────

/**
 * Virtual device id used to select the maintenance overview in the card.
 * It is deliberately language independent so a stored configuration keeps
 * working when the user switches the Home Assistant language.
 */
export const MAINTENANCE_DEVICE_ID = "__maintenance__";

/**
 * Custom element tag of the maintenance overview.
 */
export const MAINTENANCE_TAG = "redsea-maintenance";

/**
 * Prefix of the `reef_role` attribute exposed by ha-reefbeat-component on
 * maintenance button entities (see maintenance.py ROLE_PREFIX).
 */
export const MAINTENANCE_ROLE_PREFIX = "maint_";

/**
 * Suffix of the `reef_role` carried by the per-task notification switch
 * (see MaintenanceNotifySwitchEntity in the integration).
 */
export const MAINTENANCE_NOTIFY_SUFFIX = "_notify";

/**
 * Infix of the `reef_role` carried by the per-task interval number
 * ("maint_<task>_interval_<unit>", see MaintenanceIntervalNumberEntity).
 * The display unit is whatever follows it.
 */
export const MAINTENANCE_INTERVAL_INFIX = "_interval_";

/**
 * Fraction of the interval below which a task is displayed as "due soon".
 */
export const MAINTENANCE_WARNING_RATIO = 0.2;

// ─── Energy backup ────────────────────────────────────────────────────────────

/**
 * `model_id` published by reefbeatEnergyBackup for its Home Assistant device
 * (see MODEL_ID in its device_info.py). It never changes, whatever the
 * battery or the display name.
 */
export const ENERGY_BACKUP_MODEL_ID = "reefbeat-energy-backup";

/**
 * Model the energy backup view is registered under: its custom element tag
 * derives from it ("reefbeat-energybackup"), and so does the key of its
 * options in the card configuration.
 */
export const ENERGY_BACKUP_MODEL = "ENERGYBACKUP";

/** Custom element of Power Flow Card Plus, which draws the power flows. */
export const POWER_FLOW_CARD_TAG = "power-flow-card-plus";

/** Project page of Power Flow Card Plus. */
export const POWER_FLOW_CARD_URL =
  "https://github.com/flixlix/power-flow-card-plus";

/** Link opening Power Flow Card Plus in the HACS of the user. */
export const POWER_FLOW_CARD_HACS_URL =
  "https://my.home-assistant.io/redirect/hacs_repository/?owner=flixlix&repository=power-flow-card-plus&category=plugin";

// ─── Device domains ───────────────────────────────────────────────────────────

/**
 * How to resolve an ambiguous model to a concrete one via a role entity.
 * Aqua Medic's "DC Runner" model, for instance, covers both the return pump
 * and the skimmer — same firmware, same Gizwits product key, API cannot
 * tell them apart — so the user declares which one through a `pump_role`
 * select entity, and the card reads it back to pick the right display.
 */
export interface ModelOverride {
  /** `translation_key` of the entity carrying the role (ex: "pump_role") */
  role_translation_key: string;
  /** Maps the role entity's state to the concrete model. An unmapped state
   *  (ex: "unknown", before the user has made a choice) keeps the raw model. */
  role_to_model: Record<string, string>;
}

/**
 * An integration whose devices are offered as top-level, user-selectable
 * devices in the card (the device dropdown, and RSDevice.tag_for_model()).
 */
export interface KnownDeviceDomain {
  /** Prefix used to build the custom element tag, ex: "aquamedic" -> "aquamedic-smartdrift" */
  tag_prefix: string;
  /** Identifier fragments marking a sub-device to leave out of the main list (a dose head, a pump...) */
  sub_device_markers?: string[];
  /** `device.model` values standing for a virtual/cloud aggregator device rather than a real appliance */
  excluded_models?: string[];
  /** Raw model -> how to resolve it to a concrete one (see ModelOverride) */
  model_overrides?: Record<string, ModelOverride>;
  /**
   * Whether devices sharing the same config entry should be merged into one
   * selectable device. Red Sea needs this: one physical RSRun or RSDose is
   * split across several hass device-registry rows (a main device plus its
   * pumps or dose heads) that all share one config entry and must be
   * reassembled. Defaults to false: each hass device row is its own
   * selectable device, keyed by its own id — the right default for an
   * integration whose config entry covers a whole account rather than a
   * single appliance (Aqua Medic can register several independent pumps
   * under one config entry), where grouping by config entry would merge
   * unrelated devices into one and make the dropdown always show whichever
   * one happened to be pushed first.
   */
  group_by_config_entry?: boolean;
  /**
   * `translation_key` of the entity is_on() and the "disabled/maintenance"
   * overlay read to tell a device on from off. Defaults to "device_state"
   * (Red Sea's convention) when a domain does not declare its own.
   */
  power_translation_key?: string;
  /**
   * `model_id` of the devices to keep, mapped to the model their view is
   * registered under. A domain shared with unrelated devices needs this:
   * `mqtt` covers every MQTT device of the installation, and only the ones
   * publishing a known `model_id` are ours. When declared, a device whose
   * `model_id` is not listed is ignored, and the mapped model replaces the
   * free-text `model`, which a publisher may reword at any time.
   */
  model_ids?: Record<string, string>;
}

/**
 * Registry of integrations this card knows how to list devices for.
 *
 * Adding a new manufacturer is a one line addition here — nothing else in
 * the card needs to know the domain name, since `DeviceList` and
 * `RSDevice.tag_for_model()` both read it from this table.
 */
export const KNOWN_DEVICE_DOMAINS: Record<string, KnownDeviceDomain> = {
  redsea: {
    tag_prefix: "redsea",
    sub_device_markers: ["_head_", "_pump"],
    excluded_models: ["ReefBeat"],
    group_by_config_entry: true,
  },
  aquamedic: {
    tag_prefix: "aquamedic",
    // Aqua Medic exposes the on/off switch as "power", not "device_state"
    // (see ha-aquamedic-component switch.py) — is_on() reads through this.
    power_translation_key: "power",
    model_overrides: {
      "DC Runner": {
        role_translation_key: "pump_role",
        role_to_model: {
          return: "DC Runner",
          skimmer: "DC Skimmer",
        },
      },
    },
  },
  // reefbeatEnergyBackup publishes its entities over MQTT discovery, so its
  // device belongs to the `mqtt` domain along with every other MQTT device:
  // the stable `model_id` it publishes (see device_info.py) tells it apart.
  mqtt: {
    tag_prefix: "reefbeat",
    model_ids: {
      [ENERGY_BACKUP_MODEL_ID]: ENERGY_BACKUP_MODEL,
    },
  },
};
