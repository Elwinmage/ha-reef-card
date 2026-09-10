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
   * Initialise devices and main_devices lists with reefbeat devices configured in ha-reefbeat-component
   */
  private init_devices(): void {
    for (const device_id in this._hass?.devices) {
      const dev = this._hass.devices[device_id];
      if (!dev) continue;

      const dev_id = dev.identifiers[0];
      if (!dev_id) continue;

      if (Array.isArray(dev_id) && dev_id[0] === "redsea") {
        // Get only main device, not sub or cloud
        if (
          !dev_id[1].includes("_head_") &&
          !dev_id[1].includes("_pump") &&
          dev.model !== "ReefBeat"
        ) {
          this.main_devices.push({
            value: dev.primary_config_entry,
            text: dev.name,
          });
        }

        if (
          !Object.prototype.hasOwnProperty.call(
            this.devices,
            dev.primary_config_entry,
          )
        ) {
          this.devices[dev.primary_config_entry] = {
            name: dev.name,
            elements: [dev],
          };
        } else {
          this.devices[dev.primary_config_entry]?.elements.push(dev);
          // Changes main device name with main device
          if (dev_id.length === 2 && this.devices[dev.primary_config_entry]) {
            const device = this.devices[dev.primary_config_entry];
            if (device) {
              device.name = dev.name;
            }
          }
        }
      }
    }
    this.main_devices.sort(this.device_compare);
  }
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
