/**
 * Common functions:
 *   + HTML:
       - create_hour to create an HTML  time input
 *     - create_select to create an HTML select input
 *   + Conversion:
 *     - timeToString
 *     - stringTotime
 *     - toTime
 *     - rgToHex
 *     - hexToRgb
 *   + Devices:
 *     - DeviceList
 *
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//

import i18n from "../translations/myi18n";
import { HassConfig, MainDevice, DeviceInfo } from "../types/index";
import { KNOWN_DEVICE_DOMAINS, ModelOverride } from "./constants";

//----------------------------------------------------------------------------//

/**
 * Auto-detect Reefbeat devices created with ha-reefbeat-component and store them in a list.
 * Works also on disabled devices.
 */
export default class DeviceList {
  // Hass object states
  private _hass: HassConfig;
  // The list of only main devices ( no sub rsdose heads or sub rsrun pumps) and no cloud devices.
  public main_devices: MainDevice[];
  // All reefbeat devices declared in ha-reefbeat-component
  public devices: { [key: string]: DeviceInfo };

  /**
   * Constructor
   * @param hass: the hass states object
   */
  constructor(hass: HassConfig) {
    this._hass = hass;
    this.main_devices = [];
    this.devices = {};
    // Find reebeat devices of ha-reefbeat-component and populate devices
    this.init_devices();
  }

  /**
   * Compare device names to help sorting list
   * @param a: a device
   * @param b: the other device to compare to
   * @return 0 if it's the same device name , -1 is b device name is greater, 1 else.
   */
  private device_compare(a: MainDevice, b: MainDevice): number {
    if (a.text < b.text) {
      return -1;
    } else if (a.text > b.text) {
      return 1;
    }
    return 0;
  }

  /**
   * Get the hass device by it's name
   * @param name: the name of the device to get
   * @return an hass device or undefined if not found
   */
  get_by_name(name: string): DeviceInfo | undefined {
    for (const id of this.main_devices) {
      if (id.text === name) {
        return this.devices[id.value];
      }
    }
    return undefined;
  }

  /**
   * Find the config entry of the device carrying a given hardware id.   *
   * Devices name each other by hardware id on the wire, and the integration
   * stores that id as `model_id` (and as the second half of its `redsea`
   * identifier). Resolving through it keeps device-to-device links tied to
   * the hardware rather than to a display name a user may change.
   * @param hwid: the hardware id reported by the peer device
   * @return the primary config entry id, or undefined when not found
   */
  get_config_entry_by_hwid(hwid: string): string | undefined {
    if (!hwid) {
      return undefined;
    }
    for (const entry in this.devices) {
      const elements = this.devices[entry]?.elements ?? [];
      for (const element of elements) {
        const el: any = element;
        if (el?.model_id === hwid) {
          return entry;
        }
        const ident = el?.identifiers?.[0];
        // Entries created before model_id existed still carry the id here.
        if (
          Array.isArray(ident) &&
          ident[0] === "redsea" &&
          ident[1] === hwid
        ) {
          return entry;
        }
      }
    }
    return undefined;
  }

  /**
   * Initialise devices and main_devices lists with devices configured by any
   * integration listed in KNOWN_DEVICE_DOMAINS (ha-reefbeat-component,
   * ha-aquamedic-component...).
   */
  private init_devices(): void {
    for (const device_id in this._hass?.devices) {
      const dev = this._hass.devices[device_id];
      if (!dev) continue;

      const dev_id = dev.identifiers[0];
      if (!dev_id || !Array.isArray(dev_id)) continue;

      const domain = KNOWN_DEVICE_DOMAINS[dev_id[0]];
      if (!domain) continue;

      // Get only main device, not sub or cloud
      const is_sub_device = (domain.sub_device_markers ?? []).some((marker) =>
        dev_id[1].includes(marker),
      );
      const is_excluded_model = (domain.excluded_models ?? []).includes(
        dev.model ?? "",
      );

      // Red Sea groups a main device with its dose heads/pumps, which share
      // one config entry: key on that so they get reassembled below. Other
      // domains are not grouped — a config entry can cover a whole account
      // (Aqua Medic) — so each hass device row is its own selectable
      // device, keyed by its own id.
      const key = domain.group_by_config_entry
        ? dev.primary_config_entry
        : dev.id;

      if (!is_sub_device && !is_excluded_model) {
        this.main_devices.push({
          value: key,
          text: dev.name,
        });
      }

      if (!Object.prototype.hasOwnProperty.call(this.devices, key)) {
        this.devices[key] = {
          name: dev.name,
          key,
          elements: [dev],
        };
      } else {
        this.devices[key]?.elements.push(dev);
        // Changes main device name with main device
        if (dev_id.length === 2 && this.devices[key]) {
          const device = this.devices[key];
          if (device) {
            device.name = dev.name;
          }
        }
      }
    }
    this.main_devices.sort(this.device_compare);
  }
}

/**
 * Integration domain of a hass device, read from its first identifier tuple.
 * @param identifiers: the `identifiers` array of a hass device
 * @return the domain (ex: "redsea", "aquamedic"), or undefined when the
 *         device carries no recognizable identifier tuple
 */
export function domain_of(
  identifiers?: Array<string | [string, string]>,
): string | undefined {
  const ident = identifiers?.[0];
  return Array.isArray(ident) ? ident[0] : undefined;
}

/**
 * Result of looking up whether a device's model is ambiguous, and, when it
 * is, what the role entity currently says.
 */
export interface AmbiguousModel {
  domain: string;
  raw_model: string;
  override: ModelOverride;
  /** entity_id of the role entity, when one is found on this device */
  entity_id?: string;
  /** current state of the role entity, when found */
  role?: string;
}

/**
 * Looks up whether a device's model is ambiguous for its domain (see
 * KNOWN_DEVICE_DOMAINS model_overrides) and, when it is, finds the role
 * entity and its current state. Shared by resolve_device_model() — which
 * only needs the resolved model — and RSDevice's own render(), which also
 * needs the entity_id to build a role picker and delegate rendering.
 * @param hass: the hass config object, to read entities/states from
 * @param device: the DeviceInfo of the selected device
 * @param domain: the integration domain (ex: "aquamedic")
 * @param model: the raw model as reported by the integration
 * @return undefined when the domain declares no override for this model;
 *         otherwise the override plus whatever role entity/state was found
 */
export function ambiguous_model_of(
  hass: HassConfig | undefined,
  device: DeviceInfo,
  domain: string | undefined,
  model: string,
): AmbiguousModel | undefined {
  const override = domain
    ? KNOWN_DEVICE_DOMAINS[domain]?.model_overrides?.[model]
    : undefined;
  if (!override || !domain) return undefined;

  let entity_id: string | undefined;
  if (hass?.entities) {
    entity_id = find_role_entity_id(
      hass,
      device.elements ?? [],
      override.role_translation_key,
    );
  }
  const role = entity_id ? hass?.states?.[entity_id]?.state : undefined;
  return { domain, raw_model: model, override, entity_id, role };
}

/**
 * Finds the entity_id, among a device's elements, whose translation_key
 * matches the one carrying an ambiguous model's role.
 * @param hass: the hass config object, to read entities from
 * @param elements: the device's underlying hass devices
 * @param translation_key: the role entity's translation_key to look for
 * @return the matching entity_id, or undefined when none is found
 */
function find_role_entity_id(
  hass: HassConfig,
  elements: DeviceInfo["elements"],
  translation_key: string,
): string | undefined {
  for (const element of elements) {
    for (const eid in hass.entities) {
      const entity = hass.entities[eid];
      if (
        entity?.device_id === element.id &&
        entity?.translation_key === translation_key
      ) {
        return eid;
      }
    }
  }
  return undefined;
}

/**
 * Resolves an ambiguous model to the concrete one, using a role entity when
 * the domain declares one (see KNOWN_DEVICE_DOMAINS model_overrides). Aqua
 * Medic's "DC Runner" model, for instance, covers both the return pump and
 * the skimmer: the user declares which one through the `pump_role` select
 * entity, since the API exposes byte-identical data for both.
 * @param hass: the hass config object, to read entities/states from
 * @param device: the DeviceInfo of the selected device
 * @param domain: the integration domain (ex: "aquamedic")
 * @param model: the raw model as reported by the integration
 * @return the concrete model to build a tag for; the raw model when the
 *         domain declares no override for it, or the role is not (yet) set
 */
export function resolve_device_model(
  hass: HassConfig | undefined,
  device: DeviceInfo,
  domain: string | undefined,
  model: string,
): string {
  const found = ambiguous_model_of(hass, device, domain, model);
  if (!found?.role) return model;
  return found.override.role_to_model[found.role] ?? model;
}

/**
 * Convert hexadecimal color to rgb color
 * Exemple: hexToRgb('#A4F3C6') ->  '164,243,198'
 * @param hex: a string representing the hex value of the color to convert
 * @return a string representing the rgb conversion: "R,G,B" with R, G and b in range [0-255]
 */
export function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result || !result[1] || !result[2] || !result[3]) {
    return null;
  }

  const rgb = `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(
    result[3],
    16,
  )}`;
  return rgb;
}

/**
 * Convert rgb color to hexadecimal color
 * Exemple: rgbToHex('164,243,198') -> '#A4F3C6'
 * @param orig: a string representing the rgb value of the color to convert
 * @return a string representing the hex conversion:
 */
export function rgbToHex(orig: string): string {
  const regex_trim = /[^#0-9a-f\.\(\)rgba]+/gim;
  const color = orig.replace(regex_trim, " ").trim();

  const regex_hex =
    /#(([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1}))|(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}))/gi;
  if (regex_hex.exec(color)) {
    return color;
  }
  const regex_rgb =
    /rgba?\([\t\s]*([0-9]{1,3})[\t\s]*[, ][\t\s]*([0-9]{1,3})[\t\s]*[, ][\t\s]*([0-9]{1,3})[\t\s]*([,\/][\t\s]*[0-9\.]{1,})?[\t\s]*\);?/gim;
  const matches = regex_rgb.exec(orig);

  if (matches && matches[1] && matches[2] && matches[3]) {
    const hex =
      "#" +
      (parseInt(matches[1]) | (1 << 8)).toString(16).slice(1) +
      (parseInt(matches[2]) | (1 << 8)).toString(16).slice(1) +
      (parseInt(matches[3]) | (1 << 8)).toString(16).slice(1);
    return hex;
  } else {
    return orig;
  }
}

/**
 * Convert time number representing seconds from midnight  to a string with the following format "HH:MM:SS"
 * @param time: the number of seconds since midnight
 * @return the converted time "HH:MM:SS"
 */
export function toTime(time: number): string {
  const seconds = time % 60;
  const minutes = ((time - seconds) / 60) % 60;
  const hours = (time - seconds - minutes * 60) / 3600;

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

/**
 * Convert redsea time number representing minutes from midnight  to a string with the following format "HH:MM"
 * @param time: the number of minutes since midnight
 * @return the converted time "HH:MM"
 */
function timeToString(time: number): string {
  return (
    String(Math.floor(time / 60)).padStart(2, "0") +
    ":" +
    String(Math.floor(time % 60)).padStart(2, "0")
  );
}

/**
 * Convert string time from "HH:MM" format to redsea time number representing minutes from midnight
 * @param str: the time "HH:MM"
 * @return a integer representing the number of minutes since midnight
 */
export function stringToTime(str: string): number {
  const s_time = str.split(":");
  if (s_time.length < 2 || !s_time[0] || !s_time[1]) {
    return 0;
  }
  return parseInt(s_time[0]) * 60 + parseInt(s_time[1]);
}

/**
 * Create an HTML select form
 * @param id: the HTML is of SELECT element
 * @param options: the list of options in SELECT
 * @param selected: the string representing the selected option
 * @param translation: if true the option is translated to current language
 * @param suffix: string added to option or translated option
 * @param id_suffix: suffix added to SELECT id
 * @return a div HTML element containing the SELECT form
 */
export function create_select(
  id: string,
  options: string[],
  selected: string | null = null,
  translation: boolean = true,
  suffix: string = "",
  id_suffix: number = 1,
): HTMLDivElement {
  const div = document.createElement("div");
  const label = document.createElement("label");

  label.htmlFor = id;
  label.innerHTML = i18n._(id);

  const node = document.createElement("select");
  node.id = id + "_" + id_suffix;

  for (const option of options) {
    const opt = document.createElement("option");
    opt.value = option;

    if (translation) {
      opt.innerHTML = i18n._(option) + suffix;
    } else {
      opt.innerHTML = option + suffix;
    }

    if (selected !== null && selected === option) {
      opt.selected = true;
    }

    node.appendChild(opt);
  }

  div.appendChild(label);
  div.appendChild(node);

  return div;
}

/**
 * Create a HTML TIME INPUT
 * @param id: the HTML is of SELECT element
 * @param hour: the number of minutes sonce midnigth to represent
 * @param id_suffix: suffix added to SELECT id
 * @return a div HTML element containing the TIME INPUT form
 */
export function create_hour(
  id: string,
  hour: number = 0,
  id_suffix: number = 1,
): HTMLDivElement {
  const div = document.createElement("div");
  const label = document.createElement("label");

  label.htmlFor = id;
  label.innerHTML = i18n._(id);

  const node = document.createElement("input");
  node.type = "time";
  node.id = id + "_" + id_suffix;
  node.value = timeToString(hour);

  div.appendChild(label);
  div.appendChild(node);

  return div;
}

//----------------------------------------------------------------------------//
//   LINKABLE DEVICES
//----------------------------------------------------------------------------//

/**
 * Integrations whose devices may be linked to a ReefPower socket.
 *
 * A socket drives whatever is plugged into it, and that appliance is often
 * already known to Home Assistant through one of these. Filtering keeps the
 * picker to a handful of plausible choices instead of every device in the
 * installation.
 *
 * `mqtt` is deliberately narrowed: the reefbeat Backup service publishes a
 * stable `model_id` for exactly this purpose, and without that check the
 * picker would list every MQTT device the user owns.
 */
export const LINKABLE_INTEGRATIONS: Record<string, string | null> = {
  redsea: null,
  aquamedic: null,
  mqtt: "reefbeat-energy-backup",
};

/**
 * Identifier fragments marking a sub-device with no plug of its own.
 *
 * A ReefDose has a single power lead whatever its head count, so its heads
 * are not separate appliances and offering them would let a socket claim to
 * drive something it does not.
 *
 * ReefRun pumps are deliberately absent from this list: the controller is a
 * dual driver whose two pumps are powered independently, so each is its own
 * appliance and may sit on its own socket.
 */
const SUB_DEVICE_MARKERS = ["_head_"];

/**
 * Models drawing their power through a sub-device rather than directly.
 *
 * The ReefRun controller is fed by its return or skimmer pump: it has no
 * mains lead of its own, so only its pumps can be tied to a socket. Its
 * pumps stay listed — this excludes the parent, not the family.
 */
const POWERED_THROUGH_SUB_DEVICE_MODELS = ["RSRUN"];

/** Model carried by the cloud account and its per-aquarium entries. */
const CLOUD_MODEL = "ReefBeat";

/** Value standing for an appliance the card does not know about. */
export const OTHER_DEVICE_VALUE = "other";

/**
 * Whether a registry entry is the one the caller asked to leave out.
 *
 * A socket cannot power the strip it belongs to, and the caller may know
 * that strip by any of the handles the registry exposes. Matching all three
 * means the exclusion holds whichever one it was given — and matching the
 * config entry also covers a device's own sub-entries.
 */
function is_excluded(
  dev: any,
  device_id: string,
  exclude: string | null,
): boolean {
  if (!exclude) {
    return false;
  }
  return (
    dev.id === exclude ||
    device_id === exclude ||
    dev.primary_config_entry === exclude
  );
}

/**
 * Append a channel number to labels that would otherwise be identical.
 *
 * The two pumps of a dual controller are registered under the controller's
 * title, so renaming it leaves both entries reading the same with no way to
 * tell which socket drives which pump. Names that already differ are left
 * alone: numbering everything would add noise to the common case.
 */
function disambiguate(entries: { entry: MainDevice; key: string }[]): void {
  const seen = new Map<string, number>();
  for (const { entry } of entries) {
    seen.set(entry.text, (seen.get(entry.text) ?? 0) + 1);
  }

  for (const { entry, key } of entries) {
    // Every label was counted in the pass above, so the lookup always hits.
    if (seen.get(entry.text)! < 2) {
      continue;
    }
    const channel = /_(?:pump|head)_(\d+)/.exec(key);
    if (channel) {
      entry.text = `${entry.text} — ${channel[1]}`;
    }
  }
}

/**
 * List the devices that may be linked to a socket, filtered by integration.
 *
 * @param hass: the hass object holding the device registry
 * @param exclude_device_id: a device to leave out, normally the strip itself
 * @return devices as {value: hass device id, text: display name}, sorted
 */
export function list_linkable_devices(
  hass: HassConfig | null,
  exclude_device_id: string | null = null,
): MainDevice[] {
  const found: MainDevice[] = [];
  const labelled: { entry: MainDevice; key: string }[] = [];
  if (!hass?.devices) {
    return found;
  }

  for (const device_id in hass.devices) {
    const dev: any = hass.devices[device_id];
    if (!dev || is_excluded(dev, device_id, exclude_device_id)) {
      continue;
    }

    const ident = dev.identifiers?.[0];
    if (!Array.isArray(ident)) {
      continue;
    }
    const domain = ident[0];
    if (!(domain in LINKABLE_INTEGRATIONS)) {
      continue;
    }

    // Some integrations expose one device per sub-unit; a socket powers the
    // appliance as a whole, so those are not offered.
    const key = String(ident[1] ?? "");
    if (SUB_DEVICE_MARKERS.some((marker) => key.includes(marker))) {
      continue;
    }

    const required_model = LINKABLE_INTEGRATIONS[domain];
    if (required_model && dev.model_id !== required_model) {
      continue;
    }

    // The cloud account and the per-aquarium groupings are registry entries
    // with nothing to plug in: they all carry the ReefBeat model.
    if (dev.model === CLOUD_MODEL) {
      continue;
    }

    // The parent is skipped, not its sub-devices: a marker in the identifier
    // is what tells the two apart.
    if (
      POWERED_THROUGH_SUB_DEVICE_MODELS.includes(String(dev.model ?? "")) &&
      !key.includes("_")
    ) {
      continue;
    }

    const entry: MainDevice = {
      value: dev.id ?? device_id,
      text: dev.name_by_user || dev.name || String(device_id),
    };
    found.push(entry);
    labelled.push({ entry, key });
  }

  disambiguate(labelled);
  found.sort((a, b) => (a.text < b.text ? -1 : a.text > b.text ? 1 : 0));
  return found;
}
