/**
 * Implement the main HA editor
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { css, html, LitElement, TemplateResult } from "lit";
import { property } from "lit/decorators.js";

import type { SelectDevice, UserConfig, HassConfig } from "./types/index";

import i18n from "./translations/myi18n";
import DeviceList from "./utils/common";
import { has_maintenance_entities } from "./utils/maintenance";
import { MAINTENANCE_DEVICE_ID, MAINTENANCE_TAG } from "./utils/constants";

import { RSDevice } from "./devices/device";

//----------------------------------------------------------------------------//

export class ReefCardEditor extends LitElement {
  //CSS
  static styles = css`
    .table {
      display: table;
    }
    .row {
      display: table-row;
    }
    .cell {
      display: table-cell;
      padding: 0.5em;
    }
  `;

  // Public  reactive properties
  @property({ attribute: false })
  _config: UserConfig | null = null;

  @property({ attribute: false })
  current_device: unknown | null = null;

  //  @property({ attribute: false })
  private _hass: HassConfig;

  // Internal states
  //  @state()
  private select_devices: SelectDevice[] = [];

  //  @state()
  private first_init: boolean = true;

  //  @state()
  private devices_list!: DeviceList;

  /**
   * Constructor
   */
  constructor() {
    super();
    this.current_device = null;
    // Udapte editor card on config changes
    this.addEventListener("config-changed", () => this.requestUpdate());
  }

  /**
   * Update user configuration
   * @param config: The user config data
   */
  setConfig(config: UserConfig): void {
    this._config = config;
    //re-render
    this.requestUpdate();
  }

  /**
   * Set hass object
   * No propagation for editor
   * @param obj: the new hass object with new states
   */
  set hass(obj: HassConfig) {
    this._hass = obj;
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
    // Virtual "Maintenance" entry, offered only when maintenance tasks exist.
    if (has_maintenance_entities(this._hass)) {
      this.select_devices.push({
        value: MAINTENANCE_DEVICE_ID,
        text: i18n._("maintenance_view"),
      });
    }
  }

  /**
   * Render the editor card
   */
  render() {
    console.debug("Render Editor");
    if (this._config) {
      if (this.first_init === true) {
        this.first_init = false;
        this.init_devices();
      }
      return html`
        <div class="card-config">
          <div class="tabs">
            <div class="tab">
              <label class="rab-label" for="device">Device:</label>
              <select
                id="device"
                class="value cell"
                @change="${this.handleChangedEvent}"
              >
                ${this.select_devices.map(
                  (option) => html`
                    <option
                      value="${option.value}"
                      ?selected=${this._config.device === option.text ||
                      this._config.device === option.value}
                    >
                      ${option.text}
                    </option>
                  `,
                )}
              </select>
            </div>
            ${this.device_conf()}
          </div>
        </div>
      `;
    }
    //If not config, display nothing
    return html``;
  }

  /**
   *
   */
  private device_conf(): TemplateResult {
    if (this._config?.device?.length > 0) {
      // Maintenance overview: no HA device to resolve, render it directly.
      if (this._config.device === MAINTENANCE_DEVICE_ID) {
        const maint = RSDevice.create_device(
          MAINTENANCE_TAG,
          this._hass,
          this._config,
          { name: "", elements: [] } as any,
        );
        if (maint === null) {
          return html``;
        }
        // Enable card editor mode so the view renders its options form
        // instead of the task list.
        maint.isEditorMode = true;
        this.current_device = maint;
        return html`${maint}`;
      }
      const device = this.devices_list.get_by_name(this._config.device);
      if (!device) {
        return html``;
      }
      const model = device.elements[0]?.model;
      if (!model) {
        return html``;
      }

      const lit_device = RSDevice.create_device(
        "redsea-" + model.toLowerCase(),
        this._hass,
        this._config,
        device as any,
      );

      if (lit_device !== null) {
        // Enable card editor mode
        lit_device.isEditorMode = true;
        this.current_device = lit_device;

        // return the element
        return html`${lit_device}`;
      }
    }
    //No device so display nohting
    return html``;
  }

  /**
   * force to reload de card if a new devioce is selected.
   */
  private handleChangedEvent(_changesdEvent: Event): void {
    if (this.shadowRoot === null) {
      console.error("Can not found a device");
      return;
    }

    const newConfig = JSON.parse(JSON.stringify(this._config)) as UserConfig;
    const elt = this.shadowRoot.getElementById(
      "device",
    ) as HTMLSelectElement | null;
    if (elt === null) {
      console.error("Can not found a device");
      return;
    }
    let val = "unselected";
    if (elt.selectedIndex === 0) {
      delete newConfig.device;
    } else if (elt.value === MAINTENANCE_DEVICE_ID) {
      // Store the language independent id, not the translated label.
      newConfig.device = MAINTENANCE_DEVICE_ID;
    } else {
      val = elt.options[elt.selectedIndex].text;
      newConfig.device = val;
    }
    // Send config-changed mesage to force re-render
    // config is the configuration for this new device
    const messageEvent = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }
}
