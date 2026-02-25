/**
 * Base class for all devices: rsdose,rsrun,rsato+,rswave,rsled
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//

import { TemplateResult, LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { HassConfig, DeviceInfo, DeviceConfig } from "../types/index";

import { merge } from "../utils/merge";
import i18n from "../translations/myi18n";

import { MyElement } from "../base/element";

import { dialogs_device } from "./device.dialogs";

import style_common from "../utils/common.styles";

//----------------------------------------------------------------------------//
@customElement("rs-device")
export class RSDevice extends LitElement {
  @state()
  public entities: Record<string, any> = {};

  @state()
  public config: DeviceConfig;

  @state()
  protected _hass: HassConfig | null = null;

  @state()
  protected device: DeviceInfo | null = null;

  @state()
  protected initial_config: Partial<DeviceConfig>;

  @state()
  protected user_config: Partial<DeviceConfig>;

  @state()
  protected _elements: any = {};

  @state()
  protected masterOn: boolean = true;

  @property({ type: Boolean })
  to_render: boolean = false;

  @property({ type: Boolean })
  isEditorMode: boolean = false;

  @state()
  protected dialogs: any;

  protected state: boolean = false;

  static styles = [style_common];

  /**
   * Create a device from a configuration (ex: rsdose4.mapping.ts)
   * @param tag_name: the name of the element (ex: redsea-rsdose4)
   * @param hass: the hass states
   * @param config: the configuration datas (generaly stored in a .mapping.ts file)
   * @param device: the hass device from ha-reefbeat-component that is representing this lit element.
   */
  static create_device(
    tag_name: string,
    hass: HassConfig,
    config: any,
    device: DeviceInfo,
  ): RSDevice | null {
    const Element = customElements.get(tag_name);

    if (!Element) {
      console.error(`Custom element ${tag_name} not found`);
      return null;
    }

    const elt = new (Element as any)() as RSDevice;
    elt.hass = hass;
    elt.device = device;
    elt.setConfig(config);

    return elt;
  }

  /**
   * Constructor
   */
  constructor() {
    super();
    //check device state
    this.state = this.is_on();
    //load associated dialog boxes
    this.load_dialogs([dialogs_device]);
  }

  /**
   * Load all dialogs box definitions linked to this device
   */
  load_dialogs(dialogs_list: any[]) {
    this.dialogs = {};
    for (const dialog of dialogs_list) {
      this.dialogs = merge(this.dialogs, dialog);
    }
  }

  /**
   * Render device
   */
  override render() {
    if (this.isEditorMode) {
      return this.renderEditor();
    }
    this.update_config();
    this.to_render = false;
    console.debug("Render ", this.config.model);

    // get style and substyle
    let style = html``;
    this._populate_entities();
    let substyle = "";
    if (this.config?.css) {
      substyle = this.get_style(this.config);
    }

    const disabled = this._render_disabled(substyle);
    if (disabled !== null) {
      return disabled;
    }
    //check device state
    if (!this.is_on()) {
      style = html`<style>
        img {
          filter: grayscale(90%);
        }
      </style>`;
      this.masterOn = false;
    } else {
      this.masterOn = true;
    }
    return this._render(style, substyle);
  }

  _render(style = null, substyle = null) {
    return html` <div class="device_bg">
      ${style}
      <img
        class="device_img"
        id="rsdevice_img"
        alt=""
        src="${this.config.background_img}"
        style="${substyle}"
      />

      <div
        id="banner"
        style="background-color:rgba(135,135,135,0.7);position:absolute;top:0%;width:100%;height: 100%;text-align:center;"
      >
        <div style="background-color:rgba(255,255,255,0.7);border-radius:30px">
          <h1 style="color:red;">${i18n._("dev_planned")}</h1>
          <h2>
            <a href="https://github.com/Elwinmage/ha-reef-card/discussions/22"
              >${i18n._("vote_next_device")}</a
            >
          </h2>
        </div>
        <div>${this._render_elements(this.is_on())}</div>
      </div>
    </div>`;
  }

  /**
   * Override this method in your component for specific editor view  for this component
   */
  renderEditor(): TemplateResult {
    return html`<p>No editor configuration available for this device</p>`;
  }

  /**
   * Check if new hass states impy a re-render and propagate for sub elements.
   * @param obj: the new hass states
   */
  _setting_hass(obj) {
    this._hass = obj;
    let re_render = false;

    // Detect enable/disable change: refresh device.elements from hass.devices
    // so that is_disabled() always reads the current state.
    if (this.device?.elements && obj.devices) {
      for (const el of this.device.elements) {
        const fresh = obj.devices[el.id];
        if (fresh && fresh.disabled_by !== el.disabled_by) {
          el.disabled_by = fresh.disabled_by;
          re_render = true;
        }
      }
    }

    for (const element in this._elements) {
      const elt = this._elements[element];
      //If the element control a master state, re-render the device
      if (elt?.conf?.master) {
        if (elt.has_changed(obj)) {
          re_render = true;
        }
      }
      elt.hass = obj;
    }
    if (re_render) {
      this.to_render = true;
      this.requestUpdate();
    }
  }

  set hass(obj: HassConfig) {
    this._setting_hass(obj);
  }

  get hass(): HassConfig | null {
    return this._hass;
  }

  setConfig(config: any): void {
    this.user_config = config;
  }

  /**
   * Recursively sets nested properties in a target object
   * Replaces the unsafe eval() version
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    let current = obj;

    // Navigate to the parent of the target property
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    // Set the final property
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
  }

  /**
   * Find and apply leaf values to configuration
   * Safe replacement for eval()-based find_leaves
   */
  private applyLeaves(tree: any, basePath: string = ""): void {
    const keys = Object.keys(tree);

    // Check if this is a leaf node (array-like object with all numeric keys)
    if (keys.length > 0 && keys.every((k) => !isNaN(Number(k)))) {
      // Convert numeric-keyed object to a proper array before applying
      const asArray = keys.map((k) => tree[k]);
      this.setNestedProperty(this.config, basePath, asArray);
      return;
    }

    // Recursively process child nodes
    for (const key of keys) {
      const newPath = basePath ? `${basePath}.${key}` : key;
      this.applyLeaves(tree[key], newPath);
    }
  }

  /**
   * Get Hass entity from it's translation key
   * @param entity_translation_value: the translation key of the entity
   * @return : the hass entity linked to this translation_key
   */
  get_entity(entity_translation_value: string): any {
    if (!this._hass || !this.entities) {
      return null;
    }
    const entity = this.entities[entity_translation_value];
    if (!entity) {
      return null;
    }
    return this._hass.states[entity.entity_id];
  }

  /**
   * Merge basic device onfiguraiton with user configuration for final configuration
   */
  update_config(): void {
    this.config = JSON.parse(JSON.stringify(this.initial_config));

    if (this.user_config && "conf" in this.user_config && this.device) {
      const model = this.device.elements[0].model;

      if (model && model in this.user_config.conf) {
        const device_conf = this.user_config.conf[model];

        // Apply common configuration
        if ("common" in device_conf) {
          this.applyLeaves(device_conf.common);
        }

        // Apply device-specific configuration
        if (
          "devices" in device_conf &&
          this.device.name in device_conf.devices
        ) {
          this.config = merge(
            this.config,
            this.user_config.conf[model].devices[this.device.name],
          );
        }
      }
    }

    // Send dialogs configuration
    if (this.dialogs) {
      this.dispatchEvent(
        new CustomEvent("config-dialog", {
          bubbles: true,
          composed: true,
          detail: {
            dialogs: this.dialogs,
            device: this,
          },
        }),
      );
    }
  }

  /*
   * Get all entities linked to this redsea device
   */
  _populate_entities() {
    this.update_config();
    if (this._hass && this.device) {
      for (const entity_id in this._hass.entities || []) {
        const entity = this._hass.entities[entity_id];
        if (entity.device_id === this.device.elements[0]?.id) {
          this.entities[entity.translation_key] = entity;
        }
      }
    } else {
      console.error(
        "_populate_entities() failed, _hass or device object is null",
      );
    }
  } //end of function - _populate_entities

  /*
   * Check is the current device is disabled or not
   */
  is_disabled(): boolean {
    if (!this.device?.elements?.length) return true;
    return this.device.elements.some((el) => el?.disabled_by !== null);
  }

  /*
   * Get the state of the device on or off.
   */
  is_on(): boolean {
    if (!this._hass || !this.entities["device_state"]) return false;
    return (
      this._hass.states[this.entities["device_state"].entity_id]?.state !==
      "off"
    );
  }

  /*
   * Special render if the device is disabled or in maintenance mode in HA
   */
  _render_disabled(substyle = null) {
    let reason: string | null = null;
    let maintenance: TemplateResult = html``;

    if (this.is_disabled()) {
      reason = i18n._("disabledInHa");
    } else if (
      this._hass &&
      this.entities["maintenance"] &&
      this._hass.states[this.entities["maintenance"].entity_id]?.state === "on"
    ) {
      reason = i18n._("maintenance");
      // if in maintenance mode, display maintenance switch
      const elements: any[] = [];
      for (const i in this.config.elements) {
        elements.push(this.config.elements[i]);
      }

      for (const swtch of elements) {
        if (swtch.name === "maintenance") {
          if (this._hass) {
            const maintenance_button = MyElement.create_element(
              this._hass,
              swtch,
              this,
            );
            maintenance = html`${maintenance_button}`;
          }
          break;
        }
      }
    }

    if (reason === null) {
      return null;
    }

    return html`<div class="device_bg">
<img class="device_img_disabled" id=d_img" alt=""  src='${this.config.background_img}' style="${substyle}"/>
<p class='disabled_in_ha'>${reason}</p>
${maintenance}
</div">`;
  }

  /*
   * Build a css style string according to given json configuration
   * @conf: the css definition
   */
  get_style(conf) {
    let style = "";
    if (conf?.css) {
      style = Object.entries(conf.css)
        .map(([k, v]) => `${k}:${v}`)
        .join(";");
    }
    return style;
  }

  /*
   * Render a single element: switch, sensor...
   * @conf: the json configuration for the element
   * @state: the state of the device on or off to adapt the render
   * @put_in: a grouping div to put element on
   */
  _render_element(conf: any, state: boolean, put_in: string | null) {
    let sensor_put_in = null;
    //Element is groupped with others
    if ("put_in" in conf) {
      sensor_put_in = conf.put_in;
    }

    //Element is disabled or not in the requested group
    if (
      ("disabled" in conf && conf.disabled === true) ||
      sensor_put_in !== put_in
    ) {
      return html``;
    }

    // Handle hui-entities-card natively — same logic as dialog.ts _render_content()
    if (conf.type === "hui-entities-card") {
      const key = "hui-entities-card." + (conf.name || "device_states");
      if (!(key in this._elements)) {
        const HuiCard = customElements.get("hui-entities-card") as any;
        if (HuiCard && this._hass && conf.conf) {
          const card = new HuiCard();
          // Resolve translation_key -> real entity_id, exactly like dialog.ts
          const clone = structuredClone(conf.conf);
          for (const pos in conf.conf.entities) {
            const e = conf.conf.entities[pos];
            if (typeof e === "string") {
              clone.entities[pos] = this.get_entity(e)?.entity_id ?? e;
            } else {
              clone.entities[pos].entity =
                this.get_entity(e.entity)?.entity_id ?? e.entity;
            }
          }
          card.setConfig(clone);
          card.hass = this._hass;
          this._elements[key] = card;
        }
      } else {
        // Propagate hass updates
        this._elements[key].hass = this._hass;
      }
      return html`${this._elements[key]}`;
    }

    let element: MyElement | null = null;
    if (conf.name in this._elements) {
      element = this._elements[conf.type + "." + conf.name];
      if (element) {
        element.stateOn = state;
      }
    } else {
      if (this._hass) {
        element = MyElement.create_element(this._hass, conf, this);
        this._elements[conf.type + "." + conf.name] = element;
      }
    }
    return html`${element}`;
  }

  /*
   * Render all elements that are declared in the configuration of the device
   * @state: the state of the device on or off to adapt the render
   * @put_in: a grouping div to put element on
   */
  _render_elements(state: boolean, put_in: string | null = null) {
    const elements: any[] = [];
    for (const i in this.config.elements) {
      elements.push(this.config.elements[i]);
    }
    return html`${elements.map((conf) =>
      this._render_element(conf, state, put_in),
    )}`;
  }
}

export default RSDevice;
