/**
 * Base class for all devices: rsdose,rsrun,rsato+,rswave,rsled
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//

import { TemplateResult, LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { HassConfig, DeviceInfo, DeviceConfig } from "../types/index";

import { merge } from "../utils/merge";
import i18n from "../translations/myi18n";

import { MyElement } from "../base/element";
import { SafeEval } from "../utils/SafeEval";

import { dialogs_device } from "./device.dialogs";

import style_common from "../utils/common.styles";

//----------------------------------------------------------------------------//
@customElement("rs-device")
export class RSDevice extends LitElement {
  // Static cache: loadCardHelpers is resolved once for all instances.
  // This avoids a double render on init (first natural Lit render, then
  // requestUpdate() after the async await).
  private static _helpersPromise: Promise<any> | null = null;
  static _helpersResolved: any = null; // non-private so tests can inject a mock

  @property({
    type: Boolean,
    hasChanged: (newVal: boolean, oldVal: boolean) =>
      newVal === true && oldVal === false,
  })
  to_render: boolean = false;

  public entities: Record<string, any> = {};

  // Parent device entities — populated by RSRun for child pumps so they
  // can access parent-level data (mode, ec_sensor_connected, …)
  public parent_entities: Record<string, any> = {};

  // Parent HA device info — populated by RSRun for child pumps so they
  // can access the parent device_id for service calls (e.g. redsea.request)
  public parent_device: any = null;

  public config: DeviceConfig;

  protected _hass: HassConfig | null = null;

  protected device: DeviceInfo | null = null;

  protected initial_config: Partial<DeviceConfig>;

  protected user_config: Partial<DeviceConfig>;

  protected _elements: any = {};
  // Persistent CSS overrides applied by update_conf actions — survive swapLeftRight re-renders
  protected _conf_overrides: Record<string, Record<string, any>> = {};

  protected masterOn: boolean = true;

  isEditorMode: boolean = false;

  protected dialogs: any;

  protected state: boolean = false;

  static styles = [style_common];

  private _helpers: any;

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
    console.debug("Render ", this.config.model, this.device?.name);

    // get style and substyle
    let style = html``;
    this._populate_entities();
    let substyle = "";
    if (this.config?.css) {
      substyle = this.get_style(this.config);
    }

    const disabled = this._render_disabled(substyle);
    if (disabled.reason !== null) {
      const maintenance = disabled.maintenance_element
        ? html`${disabled.maintenance_element}`
        : html``;

      return html`
        <div class="device_bg">
          <img class="device_img_disabled" id=d_img" alt=""  src='${this.config.background_img}' style="${disabled.substyle}"/>
          <p class='disabled_in_ha'>${disabled.reason}</p>
         ${maintenance}
        </div">`;
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

  _render(style?: any, substyle?: any): TemplateResult {
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
   * Check if new hass states imply a re-render and propagate for sub elements.
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
      //this.requestUpdate();
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
          const domain = entity_id.split(".")[0];
          this.entities[domain + "." + entity.translation_key] = entity;
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
  _render_disabled(substyle = null): any {
    let reason: string | null = null;

    if (this.is_disabled()) {
      reason = i18n._("disabledInHa");
    } else if (
      this._hass &&
      this.entities["maintenance"] &&
      this._hass.states[this.entities["maintenance"].entity_id]?.state === "on"
    ) {
      reason = i18n._("maintenance");
    }
    // If in maintenance mode, find and build the maintenance toggle element
    let maintenance_element: any = null;
    if (reason === i18n._("maintenance") && this.config?.elements) {
      for (const i in this.config.elements) {
        const swtch = this.config.elements[i];
        if (swtch.name === "maintenance" && this._hass) {
          maintenance_element = MyElement.create_element(
            this._hass,
            swtch,
            this,
          );
          break;
        }
      }
    }

    // Always return an object — caller checks .reason !== null for overlay
    return {
      reason: reason,
      substyle: substyle,
      maintenance_element: maintenance_element,
    };
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

  async connectedCallback() {
    super.connectedCallback();
    // If helpers were already resolved (e.g. another device instance loaded them),
    // assign synchronously so the first Lit render already has them — no extra render needed.
    if (RSDevice._helpersResolved) {
      this._helpers = RSDevice._helpersResolved;
      return;
    }
    // First time: start or reuse the single shared promise.
    if (!RSDevice._helpersPromise) {
      RSDevice._helpersPromise = (window as any).loadCardHelpers();
    }
    this._helpers = await RSDevice._helpersPromise;
    RSDevice._helpersResolved = this._helpers;
    // Request update only once, only if hui-* elements are present.
    const hasHuiElement =
      this.config?.elements &&
      Object.values(this.config.elements).some((el: any) =>
        el?.type?.startsWith("hui-"),
      );
    if (hasHuiElement) {
      this.requestUpdate();
    }
  }

  /*
   * Render a single element: switch, sensor...
   * @conf: the json configuration for the element
   * @state: the state of the device on or off to adapt the render
   * @put_in: a grouping div to put element on
   */
  /**
   * Evaluate every `${...}` template found in a native card configuration.
   *
   * A `hui-*` block goes straight to `createCardElement()`, so it never passes
   * through the SafeEval that MyElement applies to labels and classes. Without
   * this, a mapping shared across seven locales can only carry hard-coded
   * strings — `name: "${i18n._('<key>')}"` would reach the legend verbatim.
   *
   * Walks the whole structure in place: templates turn up in `name`, `title`,
   * axis labels, and any option a card may add later, so the key names are not
   * hardcoded. Strings without `${` are left untouched, which keeps entity ids
   * and colours safe from the evaluator.
   *
   * @param node: the value to walk, mutated in place for objects and arrays
   * @param evaluator: the SafeEval bound to this device
   * @return the value with its templates resolved
   */
  private _resolve_templates(node: any, evaluator: SafeEval): any {
    if (typeof node === "string") {
      // The evaluator is only worth its cost on an actual template, and this
      // also guarantees a plain string is returned unchanged rather than
      // round-tripped through the expression parser.
      return node.includes("${") ? evaluator.evaluate(node) : node;
    }
    if (Array.isArray(node)) {
      for (let pos = 0; pos < node.length; pos++) {
        node[pos] = this._resolve_templates(node[pos], evaluator);
      }
      return node;
    }
    if (node && typeof node === "object") {
      for (const key of Object.keys(node)) {
        node[key] = this._resolve_templates(node[key], evaluator);
      }
      return node;
    }
    return node;
  }

  /**
   * Build the SafeEval used for both `disabled_if` and card templates.
   * @param conf: the element configuration, exposed as `config`
   * @return an evaluator bound to this device
   */
  private _evaluator(conf: any): SafeEval {
    return new SafeEval({
      entity: MyElement.createEntitiesContext(this, this._hass),
      device: this,
      config: conf,
      i18n: i18n,
    });
  }

  /**
   * Evaluate a `disabled_if` expression against this device.
   *
   * Same context as MyElement: `device`, `entity`, `config` and `i18n`, minus
   * `stateObj`, which only an element bound to an entity has.
   *
   * SafeEval.evaluateCondition() already swallows a throwing expression and
   * answers false, so a broken condition leaves the element visible rather
   * than blanking it out — which is the right way round: a mistake stays
   * findable instead of making a card silently disappear.
   * @param expression: the condition to evaluate
   * @param conf: the element configuration, exposed as `config`
   * @return true when the element should be hidden
   */
  evaluate_condition(expression: string, conf: any): boolean {
    return this._evaluator(conf).evaluateCondition(expression) === true;
  }

  _render_element(
    conf: any,
    state: boolean,
    put_in: string | null,
    declarationKey?: string,
  ) {
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

    // hui-* elements never build a MyElement, so the disabled_if that
    // MyElement.render() would have evaluated has to be handled here or it is
    // silently ignored — a native card cannot be conditionally hidden.
    if (conf.type?.startsWith("hui-") && conf.disabled_if) {
      if (this.evaluate_condition(conf.disabled_if, conf)) {
        return conf.no_br_if_disabled ? html`` : html`<br />`;
      }
    }

    // Handle hui-*-card natively — same logic as dialog.ts _render_content()
    // Requires _helpers (loaded async), skip until available
    if (conf.type?.startsWith("hui-")) {
      // Use instance _helpers or fallback to the shared resolved static
      const helpers = this._helpers ?? RSDevice._helpersResolved;
      if (!helpers) {
        return html``;
      }
      // Use declarationKey if available — keeps cache consistent with update_conf
      const key =
        declarationKey ?? conf.type + "." + (conf.name || "device_states");
      if (!(key in this._elements)) {
        if (this._hass && conf.conf) {
          // Resolve translation_key -> real entity_id, exactly like dialog.ts
          const clone = this._resolve_templates(
            structuredClone(conf.conf),
            this._evaluator(conf),
          );
          if (clone?.entity) {
            const e = clone.entity;
            if (typeof e === "string") {
              clone.entity = this.get_entity(e)?.entity_id ?? e;
            } else {
              clone.entity = this.get_entity(e.entity)?.entity_id ?? e.entity;
            }
          } else {
            for (const pos in conf.conf.entities) {
              const e = conf.conf.entities[pos];
              if (typeof e === "string") {
                clone.entities[pos] = this.get_entity(e)?.entity_id ?? e;
              } else {
                clone.entities[pos].entity =
                  this.get_entity(e.entity)?.entity_id ?? e.entity;
              }
            }
          }
          const card = helpers.createCardElement(clone);

          //Treat CSS on host element
          if (conf.css) {
            for (const [prop, value] of Object.entries(conf.css)) {
              // shadow_css entries are injected into the card's shadow DOM (see below)
              if (prop === "shadow_css") continue;
              card.style.setProperty(prop, value);
            }
          }
          card.hass = this._hass;

          // Inject styles into the card's shadow DOM (e.g. to override background,
          // min-height, or any internal style unreachable from outside).
          if (conf.css?.shadow_css) {
            const shadowCss = conf.css.shadow_css;
            const injectStyle = () => {
              if (card.shadowRoot) {
                const styleEl = document.createElement("style");
                styleEl.textContent = shadowCss;
                card.shadowRoot.appendChild(styleEl);
              } else {
                // Shadow root not ready yet, retry on next frame
                requestAnimationFrame(injectStyle);
              }
            };
            requestAnimationFrame(injectStyle);
          }

          this._elements[key] = card;
        }
      } else {
        // Propagate hass updates
        this._elements[key].hass = this._hass;
      }

      return html`${this._elements[key]}`;
    }

    let element: MyElement | null = null;
    // Use declarationKey (unique element id in mapping) as cache key.
    // This handles cases where multiple elements share the same type+name
    // (e.g. ec_sensor / ec_sensor_disconnected both have name:"is_ec_sensor_connected")
    const elementKey = declarationKey ?? conf.type + "." + conf.name;
    if (elementKey in this._elements) {
      element = this._elements[elementKey];
      if (element) {
        element.stateOn = state;
        element.groupOn = state;
      }
    } else {
      if (this._hass) {
        element = MyElement.create_element(this._hass, conf, this);
        if (element) {
          // Without this the first render of a freshly created element uses
          // the whole-device state instead of the group's.
          element.stateOn = state;
          element.groupOn = state;
        }
        this._elements[elementKey] = element;
      }
    }
    // Re-apply persistent CSS overrides (survive swapLeftRight config recreation)
    if (element && this._conf_overrides[elementKey]?.css) {
      element.merge_css(this._conf_overrides[elementKey].css);
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
      elements.push({ conf: this.config.elements[i], key: i });
    }
    return html`${elements.map(({ conf, key }) =>
      this._render_element(conf, state, put_in, key),
    )}`;
  }

  /*
   * Editor : is_ckeched
   */
  is_checked(id) {
    let result = false;
    if (this.config.elements[id] && "disabled_if" in this.config.elements[id]) {
      result = this.config.elements[id].disabled_if;
    }
    if (result) {
      return html`
        <label class="switch">
          <input
            type="checkbox"
            id="${id}"
            @change="${this.handleChangedDeviceEvent}"
            checked
          />
          <span class="slider round"></span>
        </label>
        <label>${i18n._(id)}</label>
      `;
    } else {
      return html`
        <label class="switch">
          <input
            type="checkbox"
            id="${id}"
            @change="${this.handleChangedDeviceEvent}"
          />
          <span class="slider round"></span>
        </label>
        <label>${i18n._(id)}</label>
      `;
    }
  } // end of function is_checked

  /**
   * Read a plain boolean flag stored at device level in the user config.
   * Unlike is_checked(), this is not tied to an element of the mapping.
   * @param key: the flag name
   * @return the stored value, or undefined when never set
   */
  get_config_flag(key: string): boolean | undefined {
    return this.config?.[key];
  }

  /**
   * Render an editor switch bound to a device-level flag.
   * @param key: the flag name
   * @return the switch template
   */
  is_config_checked(key: string) {
    const checked = this.get_config_flag(key) === true;
    return html`
      <label class="switch">
        <input
          type="checkbox"
          id="${key}"
          @change="${this.handleChangedConfigFlagEvent}"
          ?checked="${checked}"
        />
        <span class="slider round"></span>
      </label>
      <label>${i18n._(key)}</label>
    `;
  }

  /**
   * Persist a device-level flag toggled from the editor.
   */
  handleChangedConfigFlagEvent(changedEvent) {
    const value = changedEvent.currentTarget.checked;
    const key = changedEvent.target.id;
    const model = this.config.model;
    const newVal = {
      conf: {
        [model]: {
          devices: {
            [this.device.name]: { [key]: value },
          },
        },
      },
    };
    let newConfig = JSON.parse(JSON.stringify(this.user_config));
    try {
      newConfig.conf[model].devices[this.device.name][key] = value;
    } catch {
      newConfig = merge(newConfig, newVal);
    }
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _editor_common() {
    return html`<style>
        /* The switch - the box around the slider */
        .switch {
          position: relative;
          display: inline-block;
          width: 30px;
          height: 17px;
        }

        /* Hide default HTML checkbox */
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        /* The slider */
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          -webkit-transition: 0.4s;
          transition: 0.4s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 13px;
          width: 13px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          -webkit-transition: 0.4s;
          transition: 0.4s;
        }

        input:checked + .slider {
          background-color: #2196f3;
        }

        input:focus + .slider {
          box-shadow: 0 0 1px #2196f3;
        }

        input:checked + .slider:before {
          -webkit-transform: translateX(13px);
          -ms-transform: translateX(13px);
          transform: translateX(13px);
        }

        /* Rounded sliders */
        .slider.round {
          border-radius: 17px;
        }

        .slider.round:before {
          border-radius: 50%;
        }
      </style>
      <table>
        <tr>
          <td>${this.is_checked("last_message")}</td>
          <td>${this.is_checked("last_alert_message")}</td>
        </tr>
      </table> `;
  }

  handleChangedDeviceEvent(changedEvent) {
    const value = changedEvent.currentTarget.checked;
    const newVal = {
      conf: {
        [this.config.model]: {
          devices: {
            [this.device.name]: {
              elements: { [changedEvent.target.id]: { disabled_if: value } },
            },
          },
        },
      },
    };
    let newConfig = JSON.parse(JSON.stringify(this.user_config));
    try {
      newConfig.conf[this.config.model].devices[this.device.name].elements[
        changedEvent.target.id
      ].disabled_if = value;
    } catch {
      newConfig = merge(newConfig, newVal);
    }
    const messageEvent = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }
}

export default RSDevice;
