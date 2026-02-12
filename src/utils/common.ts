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
 *   + Colors:
 *     - off_color
 *     - button_color
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
   * Initialise devices and main_devices lists with reefbeat devices configured in ha-reefbeat-component
   */
  private init_devices(): void {
    for (const device_id in this._hass.devices) {
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
 * Color of off elements
 */
export const off_color: string = "150,150,150";
/**
 * blue color for buttons
 */
export const button_color: string = "51,151,232";

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
