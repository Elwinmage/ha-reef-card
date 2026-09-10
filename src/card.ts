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
import { has_maintenance_entities } from "./utils/maintenance";
import { MAINTENANCE_DEVICE_ID, MAINTENANCE_TAG } from "./utils/constants";

import { RSDevice } from "./devices/device";
import { Dialog } from "./base/dialog";
import style_dialog from "./base/dialog.styles";

import style_card from "./card.styles";

//----------------------------------------------------------------------------//

export class ReefCard extends LitElement {
  static override styles = [style_card, style_dialog];

  // Public reactive properties
  //  @property({ attribute: false })
  private _hass: HassConfig;

  @property({ attribute: false })
  private current_device: any = null;

  // Internal states
  //@state()
  private select_devices: SelectDevice[] = [];

  //  @state()
  private first_init: boolean = true;

  @state()
  private re_render: boolean = false;

  //  @state()
  private _dialog_box: Dialog | null = null;

  //  @state()
  private user_config: UserConfig = {};

  //  @state()
  private no_device: unknown;

  //  @state()
  private devices_list!: DeviceList;

  //  @state()
  private selected?: string;

  //  @state()
  private messages?: any;

  /**
   * Devices navigated away from, innermost last.
   *
   * Instances are kept rather than ids so going back restores the device as
   * it was left — an open editor, a sort order — instead of rebuilding it
   * from scratch. The stack lives in memory only: a page reload returns to
   * whatever the card configuration pins.
   */
  private _nav_stack: any[] = [];

  /**
   * Constructor
   */
  constructor() {
    super();
    //Treat dialog box requests
    this.addEventListener("display-dialog", (e: Event) => {
      this._handle_display_dialog(e as CustomEvent);
    });
    this.addEventListener("show-device", (e: Event) => {
      this._handle_show_device(e as CustomEvent);
    });
    this.addEventListener("config-dialog", (e: Event) => {
      if (this._dialog_box) {
        this._dialog_box.merge_conf((e as CustomEvent).detail.dialogs);
      }
    });
    this.addEventListener("quit-dialog", () => {
      if (this._dialog_box) {
        this._dialog_box.quit();
      }
      //      this.render(); /* force rerender, do not use requestUpdate*/
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
  /**
   * Mark the card while it is showing a device reached through a link.
   *
   * The border is the only cue that what is on screen is not the card's own
   * device: the picture changes completely, so without it a user who has
   * forgotten they followed a link has no way to tell.
   */
  override updated(): void {
    this.classList.toggle("following-link", this._nav_stack.length > 0);
  }

  private _handle_display_dialog(event: CustomEvent): void {
    if (this._dialog_box) {
      this._dialog_box.display(event.detail);
    }
  } // end of function - _handle_display_dialog

  /**
   * Navigate to another device managed by this card.
   *
   * The request names its target by hardware id; devices unknown to Home
   * Assistant simply have no entry, and the navigation is dropped rather
   * than blanking the card.
   * @param event: carries detail.hwid, the target's hardware id
   */
  private _handle_show_device(event: CustomEvent): void {
    const hwid = event.detail?.hwid;
    if (!hwid || !this.devices_list) {
      return;
    }
    const entry = this.devices_list.get_config_entry_by_hwid(hwid);
    if (!entry) {
      console.warn("show_device: no device found for hwid", hwid);
      return;
    }
    // A device already showing needs no navigation, and pushing it would
    // put an identical entry on the stack for the back button to undo.
    if (this._current_config_entry() === entry) {
      return;
    }
    const previous = this.current_device;
    this._set_current_device(entry);
    // create_device returns null for a model the card has no mapping for.
    // Staying put beats replacing the card with a blank the back button
    // would then have to rescue.
    if (!this.current_device) {
      this.current_device = previous;
      return;
    }
    if (this.current_device !== previous) {
      this._nav_stack.push(previous);
    }
    this.current_device.hass = this._hass;
    this.re_render = true;
    this.requestUpdate();
  } // end of function - _handle_show_device

  /**
   * Return to the device navigated away from.
   */
  private _navigate_back = (): void => {
    const previous = this._nav_stack.pop();
    if (!previous) {
      return;
    }
    this.current_device = previous;
    this.current_device.hass = this._hass;
    this.re_render = true;
    this.requestUpdate();
  };

  /**
   * Config entry currently on screen, when there is one.
   * @return the primary config entry id, or null
   */
  private _current_config_entry(): string | null {
    return (
      this.current_device?.device?.elements?.[0]?.primary_config_entry ?? null
    );
  }

  /**
   * Back control, rendered only while a navigation is in progress.
   *
   * It is the only way home when the card is pinned to a device, since the
   * device selector is not rendered in that case.
   */
  private _back_button() {
    if (this._nav_stack.length === 0) {
      return html``;
    }
    return html`<button
      id="nav_back"
      title="${i18n._("back")}"
      @click="${this._navigate_back}"
    >
      ←
    </button>`;
  }

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
      // A navigation in progress wins over the pinned device: the config is
      // re-applied on every render, and would otherwise snap the card back
      // to its configured device on the next state update.
      if (this._nav_stack.length > 0) {
        this.current_device.hass = this._hass;
        return html`
          ${this._back_button()} ${this.messages} ${this.current_device}
        `;
      }
      // The maintenance overview is a virtual device: it is matched on its
      // language independent id rather than on a localized display name.
      if (ReefCard.is_maintenance_selector(this.user_config.device)) {
        this._set_current_device(MAINTENANCE_DEVICE_ID);
      } else {
        this.select_devices.map((dev) =>
          this._set_current_device_from_name(dev, this.user_config.device),
        );
      }
      this.current_device.hass = this._hass;
      return html` ${this.messages} ${this.current_device} `;
    }
    // no secific device selected, display select form
    return html`
      ${this.device_select()} ${this._back_button()} ${this.messages}
      ${this.current_device}
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
            ?selected=${option.value === MAINTENANCE_DEVICE_ID
              ? this.current_device?.is_maintenance === true
              : this.current_device?.device?.elements?.[0]
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
    // Only offer the maintenance overview when at least one maintenance
    // task entity exists in this installation.
    if (has_maintenance_entities(this._hass)) {
      this.select_devices.push({
        value: MAINTENANCE_DEVICE_ID,
        text: i18n._("maintenance_view"),
      });
    }
  }

  /**
   * Tell whether a device selector refers to the maintenance overview.
   * Accepts the virtual id, the plain "maintenance" keyword and the localized
   * label, so configurations written by hand keep working.
   * @param name: the value stored in the card configuration
   * @return true when the maintenance overview is requested
   */
  static is_maintenance_selector(name: unknown): boolean {
    if (typeof name !== "string") {
      return false;
    }
    return (
      name === MAINTENANCE_DEVICE_ID ||
      name.toLowerCase() === "maintenance" ||
      name === i18n._("maintenance_view")
    );
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
    // Maintenance overview: build it once so the user sort/filter choices
    // are not reset on every render.
    if (ReefCard.is_maintenance_selector(device_id)) {
      if (this.current_device?.is_maintenance !== true) {
        this.current_device = RSDevice.create_device(
          MAINTENANCE_TAG,
          this._hass,
          this.user_config,
          { name: "", elements: [] } as any,
        );
      }
      return;
    }
    // The current device has not change, so no update
    // The placeholder shown before any selection carries no `device` at all,
    // so this reads through rather than assuming one is there.
    if (
      this.current_device?.device?.elements?.[0]?.primary_config_entry ===
      device_id
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
      RSDevice.tag_for_model(model),
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

      // An explicit pick is a fresh start: keeping the stack would leave a
      // back button pointing at a device the user has moved on from.
      this._nav_stack = [];

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
