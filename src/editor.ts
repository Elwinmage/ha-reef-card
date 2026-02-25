/**
 * Implement the main HA editor
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { css, html, LitElement, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";

import type { SelectDevice, UserConfig, HassConfig } from "./types/index";

import i18n from "./translations/myi18n";
import DeviceList from "./utils/common";

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

  @property({ attribute: false })
  private _hass: HassConfig;

  // Internal states
  @state()
  private select_devices: SelectDevice[] = [];

  @state()
  private first_init: boolean = true;

  @state()
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
                      ?selected=${this._config.device === option.text}
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
