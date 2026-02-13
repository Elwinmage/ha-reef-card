/**
 * Implement the main HA card for all reefbeat devices
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { LitElement, html } from "lit";
import { property, state } from "lit/decorators.js";

import type { SelectDevice, UserConfig, HassConfig } from "./types/index";

import i18n from "./translations/myi18n.js";
import DeviceList from "./utils/common";

import { RSDevice } from "./devices/device";
import { Dialog } from "./base/dialog";
import style_dialog from "./base/dialog.styles";

import style_card from "./card.styles";

//----------------------------------------------------------------------------//

export class ReefCard extends LitElement {
  static override styles = [style_card, style_dialog];

  // Public reactive properties
  @property({ attribute: false })
  private _hass: HassConfig;

  @property({ attribute: false })
  private current_device: any = null;

  // Internal states
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
  private no_device: unknown;

  @state()
  private devices_list!: DeviceList;

  @state()
  private selected?: string;

  @state()
  private messages?: any;

  /**
   * Constructor
   */
  constructor() {
    super();
    //Treat dialog box requests
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
      this.render(); /* force rerender, do not use requestUpdate*/
    });
  }

  /**
   * Update user configuration
   * @param config: The user config data
   */
  setConfig(config: UserConfig): void {
    this.user_config = config;
  }

  /**
   * Set hass object
   * Propagate hass update to dialog_box
   * @param obj: the new hass object with new states
   */
  set hass(obj: HassConfig) {
    if (this.first_init === true) {
      this._hass = obj;
    } else {
      this.current_device.hass = obj;
      if (this._dialog_box) {
        this._dialog_box.hass = obj;
      }
    }
  }

  /**
   * Display dialog box
   * @param event : the event contains in "details" field:
   *                 - type: The type of dialog box to display
   *                 - overload_quit: the dialog box to display when closing this, if null close close this box
   *                 - elt: the lit element caller
   */
  private _handle_display_dialog(event: CustomEvent): void {
    if (this._dialog_box) {
      this._dialog_box.display(event.detail);
    }
  } // end of function - _handle_display_dialog

  /**
   * Main render method.
   */
  override render() {
    console.debug("render main");
    if (this.first_init === true) {
      this.init_devices();
      this.first_init = false;
      //At first create a nodevice
      this.no_device = RSDevice.create_device(
        "redsea-nodevice",
        this._hass,
        null,
        {} as any,
      );
      this.current_device = this.no_device;
      //Create the dailog box
      this._dialog_box = new Dialog();
      if (this.shadowRoot) {
        this._dialog_box.init(this._hass, this.shadowRoot);
      }
    } else {
      //Update hass object to propagate new states
      this.current_device.hass = this._hass;
      if (!this.re_render) {
        return;
      }
    }
    //If a device as been specialy selected, set it as current device and display it
    if (this.user_config["device"]) {
      this.select_devices.map((dev) =>
        this._set_current_device_from_name(dev, this.user_config.device),
      );
      this.current_device.hass = this._hass;
      return html` ${this.messages} ${this.current_device} `;
    }
    // no secific device selected, display select form
    return html`
      ${this.device_select()} ${this.messages} ${this.current_device}
    `;
  }

  /**
   * Display select html element to choose a redsea device
   */
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

  /**
   * Create the list of detected redsea devices.
   */
  private init_devices(): void {
    this.devices_list = new DeviceList(this._hass);
    this.select_devices = [
      { value: "unselected", text: i18n._("select_device") },
    ];
    for (const d of this.devices_list.main_devices) {
      this.select_devices.push(d);
    }
  }

  /**
   * Set the device  to display according to it's name
   * this method is called be a loop on all redsea devices
   * @param dev: the hass device object
   * @param name: the name of the device in hass
   */
  private _set_current_device_from_name(dev: SelectDevice, name: string): void {
    if (dev["text"] === name) {
      this._set_current_device(dev["value"]);
    }
  }

  /**
   * Set  to display using it's hass id
   * @param device_id: the hass device id
   */
  private _set_current_device(device_id: string): void {
    // No device selected, display redsea logo
    if (device_id === "unselected") {
      this.current_device = this.no_device;
      return;
    }
    // The current device has not change, so no update
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

    // Get hass device from it's hass id
    const device = this.devices_list.devices[device_id];
    if (!device) {
      console.error("Device not found:", device_id);
      return;
    }
    //Get device model
    const model = device.elements[0]?.model;
    if (!model) {
      console.error("Device model not found");
      return;
    }
    //Create the new "lit device"
    this.current_device = RSDevice.create_device(
      "redsea-" + model.toLowerCase(),
      this._hass,
      this.user_config,
      device,
    );
    // TODO : Implement MAIN tank view support
    // Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/11
    // labels: enhancement
  }

  /**
   * Handler when the value of devices select form change
   */
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
  };

  /**
   * Get reef-card-editor
   */
  static getConfigElement() {
    return document.createElement("reef-card-editor");
  }
}
