import i18n from "./translations/myi18n";

interface HassDevice {
  identifiers: Array<string | [string, string]>;
  primary_config_entry: string;
  name: string;
  model?: string;
  [key: string]: any;
}

interface HassConfig {
  devices: {
    [device_id: string]: HassDevice;
  };
  [key: string]: any;
}

interface DeviceInfo {
  name: string;
  elements: HassDevice[];
}

interface MainDevice {
  value: string;
  text: string;
}

export default class DeviceList {
  private _hass: HassConfig;
  public main_devices: MainDevice[];
  public devices: { [key: string]: DeviceInfo };

  constructor(hass: HassConfig) {
    this._hass = hass;
    this.main_devices = [];
    this.devices = {};
    this.init_devices();
  }

  private device_compare(a: MainDevice, b: MainDevice): number {
    if (a.text < b.text) {
      return -1;
    } else if (a.text > b.text) {
      return 1;
    }
    return 0;
  }

  get_by_name(name: string): DeviceInfo | undefined {
    for (const id of this.main_devices) {
      if (id.text === name) {
        return this.devices[id.value];
      }
    }
    return undefined;
  }

  private init_devices(): void {
    for (const device_id in this._hass.devices) {
      const dev = this._hass.devices[device_id];
      if (!dev) continue;
      
      const dev_id = dev.identifiers[0];
      if (!dev_id) continue;

      if (Array.isArray(dev_id) && dev_id[0] === 'redsea') {
        // Get only main device, not sub or cloud
	if (
          !dev_id[1].includes("_head_") &&
            !dev_id[1].includes("_pump") &&
            dev.model !== 'ReefBeat'
        ) {
          this.main_devices.push({
            value: dev.primary_config_entry,
            text: dev.name
          });
        }

        if (!Object.prototype.hasOwnProperty.call(this.devices, dev.primary_config_entry)) {
          this.devices[dev.primary_config_entry] = {
            name: dev.name,
            elements: [dev]
          };
        } else {
          this.devices[dev.primary_config_entry]?.elements.push(dev);
          // Changes main device name with main device
          if (dev_id.length === 2 && this.devices[dev.primary_config_entry]) {
            this.devices[dev.primary_config_entry]!.name = dev.name;
          }
        }
      }
    }
    this.main_devices.sort(this.device_compare);
  }
}

export function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result || !result[1] || !result[2] || !result[3]) {
    return null;
  }

  const rgb = `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
  return rgb;
}

export function rgbToHex(orig: string): string {
  const regex_trim = /[^#0-9a-f\.\(\)rgba]+/gim;
  const color = orig.replace(regex_trim, ' ').trim();

  const regex_hex = /#(([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1}))|(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}))/gi;
  if (regex_hex.exec(color)) {
    return color;
  }
  const regex_rgb = /rgba?\([\t\s]*([0-9]{1,3})[\t\s]*[, ][\t\s]*([0-9]{1,3})[\t\s]*[, ][\t\s]*([0-9]{1,3})[\t\s]*([,\/][\t\s]*[0-9\.]{1,})?[\t\s]*\);?/gim;
  const matches = regex_rgb.exec(orig);

  if (matches && matches[1] && matches[2] && matches[3]) {
    const hex =
      '#' +
      (parseInt(matches[1]) | 1 << 8).toString(16).slice(1) +
      (parseInt(matches[2]) | 1 << 8).toString(16).slice(1) +
      (parseInt(matches[3]) | 1 << 8).toString(16).slice(1);
    return hex;
  } else {
    return orig;
  }
}

export const off_color: string = "150,150,150";
export const button_color: string = "0,60,78";

export function toTime(time: number): string {
  const seconds = time % 60;
  const minutes = ((time - seconds) / 60) % 60;
  const hours = (time - seconds - minutes * 60) / 3600;

  return String(hours).padStart(2, '0') + ":" +
    String(minutes).padStart(2, '0') + ":" +
    String(seconds).padStart(2, '0');
}

function timeToString(time: number): string {
  return String(Math.floor(time / 60)).padStart(2, '0') + ':' +
    String(Math.floor(time % 60)).padStart(2, "0");
}

export function stringToTime(str: string): number {
  const s_time = str.split(":");
  if (s_time.length < 2 || !s_time[0] || !s_time[1]) {
    return 0;
  }
  return parseInt(s_time[0]) * 60 + parseInt(s_time[1]);
}

export function create_select(
  _shadowRoot: Document | ShadowRoot,
  id: string,
  options: string[],
  selected: string | null = null,
  translation: boolean = true,
  suffix: string = '',
  id_suffix: number = 1
): HTMLDivElement {
  const div = document.createElement('div');
  const label = document.createElement('label');

  label.htmlFor = id;
  label.innerHTML = i18n._(id);

  const node = document.createElement("select");
  node.id = id + '_' + id_suffix;

  for (const option of options) {
    const opt = document.createElement('option');
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

export function create_hour(
  _shadowRoot: Document | ShadowRoot,
  id: string,
  hour: number = 0,
  id_suffix: number = 1
): HTMLDivElement {
  const div = document.createElement('div');
  const label = document.createElement('label');

  label.htmlFor = id;
  label.innerHTML = i18n._(id);

  const node = document.createElement("input");
  node.type = "time";
  node.id = id + '_' + id_suffix;
  node.value = timeToString(hour);

  div.appendChild(label);
  div.appendChild(node);

  return div;
}
