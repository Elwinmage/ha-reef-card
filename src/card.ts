import { LitElement, html } from "lit";

import { property, state } from "lit/decorators.js";

import i18n from "./translations/myi18n.js";

import DeviceList from "./utils/common";

import style_card from "./card.styles";

import { RSDevice } from "./devices/device";
import { Dialog } from "./base/dialog";

import style_dialog from "./base/dialog.styles";

interface SelectDevice {
  value: string;
  text: string;
}

interface UserConfig {
  device?: string;
  [key: string]: any;
}

interface CustomEvent<T = any> extends Event {
  detail: T;
}

export class ReefCard extends LitElement {
  static override styles = [style_card, style_dialog];

  // Propriétés réactives publiques (avec @property)
  @property({ attribute: false })
  private _hass: any;

  @property({ attribute: false })
  private current_device: any;

  // États internes (avec @state)
  @state()
  private select_devices: SelectDevice[] = [];

  @state()
  private first_init: boolean = true;

  @state()
  private re_render: boolean = false;

  @state()
  private _dialog_box: Dialog | null = null;

  @state()
  private user_config: UserConfig = {};

  @state()
  private no_device: any;

  @state()
  private devices_list!: DeviceList;

  @state()
  private selected?: string;

  @state()
  private messages?: any;

  constructor() {
    super();
    this.addEventListener("display-dialog", (e: Event) => {
      this._handle_display_dialog(e as CustomEvent);
    });
    this.addEventListener("config-dialog", (e: Event) => {
      if (this._dialog_box) {
        this._dialog_box.set_conf((e as CustomEvent).detail.dialogs);
      }
    });
    this.addEventListener("quit-dialog", () => {
      if (this._dialog_box) {
        this._dialog_box.quit();
      }
      this.render(); /* force rerender*/
    });
  } // end of constructor

  setConfig(config: UserConfig): void {
    this.user_config = config;
  } // end of function - setConfig

  set hass(obj: any) {
    if (this.first_init === true) {
      this._hass = obj;
    } else {
      this.current_device.hass = obj;
      if (this._dialog_box) {
        this._dialog_box.hass = obj;
      }
    }
  }

  private _handle_display_dialog(event: CustomEvent): void {
    if (this._dialog_box) {
      this._dialog_box.display(event.detail);
    }
  } // end of function - _handle_display_dialog

  override render() {
    console.debug("render main");
    if (this.first_init === true) {
      this.init_devices();
      this.first_init = false;
      this.no_device = RSDevice.create_device(
        "redsea-nodevice",
        this._hass,
        null,
        {} as any,
      );
      this.current_device = this.no_device;
      this._dialog_box = new Dialog();
      if (this.shadowRoot) {
        this._dialog_box.init(this._hass, this.shadowRoot);
      }
    } // if
    else {
      this.current_device.hass = this._hass;
      if (!this.re_render) {
        return;
      }
    }

    if (this.user_config["device"]) {
      this.select_devices.map((dev) =>
        this._set_current_device_from_name(dev, this.user_config.device),
      );
      this.current_device.hass = this._hass;
      // A specific device has been selected
      return html` ${this.messages} ${this.current_device} `;
    } // fi
    // no secific device selected, display select form
    return html`
      ${this.device_select()} ${this.messages} ${this.current_device}
    `;
  } // end of render

  private device_select() {
    return html` <select id="device" @change="${this.onChanges}">
      ${this.select_devices.map(
        (option) => html`
          <option
            value="${option.value}"
            ?selected=${this.current_device?.device?.elements?.[0]
              ?.primary_config_entry === option.value}
          >
            ${option.text}
          </option>
        `,
      )}
    </select>`;
  }

  private init_devices(): void {
    this.devices_list = new DeviceList(this._hass);
    this.select_devices = [
      { value: "unselected", text: i18n._("select_device") },
    ];

    for (const d of this.devices_list.main_devices) {
      this.select_devices.push(d);
    } // for
  } // end of init_devices

  private _set_current_device_from_name(dev: SelectDevice, name: string): void {
    if (dev["text"] === name) {
      this._set_current_device(dev["value"]);
    }
  } // end of _set_current_device_from_name

  private _set_current_device(device_id: string): void {
    // No device selected, display redsea logo
    if (device_id === "unselected") {
      this.current_device = this.no_device;
      return;
    }

    if (
      this.current_device.device !== null &&
      this.current_device.device.elements &&
      this.current_device.device.elements[0].primary_config_entry === device_id
    ) {
      console.debug(
        "current device not updated",
        this.current_device.device.name,
      );
      return;
    }

    const device = this.devices_list.devices[device_id];
    if (!device) {
      console.error("Device not found:", device_id);
      return;
    }
    const model = device.elements[0]?.model;
    if (!model) {
      console.error("Device model not found");
      return;
    }
    this.current_device = RSDevice.create_device(
      "redsea-" + model.toLowerCase(),
      this._hass,
      this.user_config,
      device,
    );
    // TODO : Implement MAIN tank view support
    // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/11
    // labels: enhancement
    switch (model) {
      // TODO : Implement RSDOSE support
      // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/10
      // labels: enhancement, rsdose
      case "RSDOSE2":
      // TODO : Implement RSDOSE2 support
      // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/9
      // labels: enhancement, rsdose, rsdose2
      case "RSDOSE4":
        // TODO : Implement RSDOSE4 support
        // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/8
        // labels: enhancement, rsdose, rsdose4
        break;
      case "RSRUN":
      // TODO : Implement RSRUN support
      // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/7
      // labels: enhancement, rsrun	break;
      case "RSWAVE":
        // TODO : Implement RSWAVE support
        // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/6
        // labels: enhancement, rswave
        break;
      case "RSMAT":
        // TODO : Implement RSMAT support
        // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/5
        // labels: enhancement, rsmat
        break;
      case "RSATO+":
        // TODO : Implement RSATO+ support
        // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/4
        // labels: enhancement, rsato
        break;
      // TODO : Implement RSLED support
      // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/3
      // labels: enhancement, rsled
      case "RSLED50":
      case "RSLED60":
      case "RSLED90":
      case "RSLED115":
      case "RSLED160":
      case "RSLED170":
        break;
      default:
        console.debug("Unknow device type: " + model);
    }
  }

  private onChanges = (): void => {
    setTimeout(() => {
      if (this.shadowRoot) {
        const selectElement = this.shadowRoot.querySelector(
          "#device",
        ) as HTMLSelectElement | null;
        if (selectElement) {
          this.selected = selectElement.value;
        }
      }
      this.current_device = this.no_device;

      if (this.selected === "unselected") {
        console.debug("Nothing selected");
      } else if (this.selected) {
        this._set_current_device(this.selected);
      }
      this.re_render = true;
      this.requestUpdate();
    }, 300);
  }; // end of onChanges

  static getConfigElement() {
    return document.createElement("reef-card-editor");
  } // end of getConfigElement
} // end of class ReefCard
