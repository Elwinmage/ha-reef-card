/**
 * @file Base class for UI elements
 * @module base.element
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";

import type {
  StateObject,
  HassConfig,
  Device,
  ActionData,
  Action,
  ElementConfig,
  DisabledCondition,
  DynamicValue,
} from "../types/index";

import { attachClickHandlers } from "../utils/click_handler";
import { SafeEval, SafeEvalContext } from "../utils/SafeEval";
import i18n from "../translations/myi18n.js";
import { OFF_COLOR } from "../utils/constants";

//----------------------------------------------------------------------------//

/**
 * MyElement component
 * @class MyElement
 * @extends {LitElement}
 */
export class MyElement extends LitElement {
  // Public reactive properties
  @property({ type: Object, attribute: false })
  stateObj: StateObject | null = null;

  @property({ type: Boolean })
  stateOn: boolean = false;

  // Internal states
  @state()
  protected _hass: HassConfig | null = null;

  @state()
  protected conf?: ElementConfig;

  @state()
  protected device?: Device;

  @state()
  protected color?: string;

  @state()
  protected alpha?: number;

  @state()
  protected label: string = "";

  @state()
  protected c?: string;

  protected evalCtx: SafeEvalContext;

  /**
   * Create the list of entities taht can be used in a context for string evaluation
   * @param device: the current device hass object
   * @param hass: the hass states
   * @return a context to help evaluate dynamic strings
   */
  private static createEntitiesContext(
    device: any,
    hass: any,
  ): Record<string, any> {
    const entitiesObj: Record<string, any> = {};

    if (device?.entities && hass?.states) {
      for (const key in device.entities) {
        const entity = device.entities[key];
        if (entity?.entity_id && hass.states[entity.entity_id]) {
          entitiesObj[key] = hass.states[entity.entity_id];
        }
      }
    }
    return entitiesObj;
  }

  /**
   * Generate a new element from configraiton data
   * @param hass: the hass states object
   * @param config: the configuratio ndata to apply to new object
   *            Exemple to create a button linked to supplement_bottle hass object
   *                {
   *                  name: "supplement_bottle",
   *                  label: null,
   *                  type: "common-button",
   *                  put_in: "supplement",
   *                  stateObj: null,
   *                  css: {
   *                    display: "block",
   *                    width: "100%",
   *                    height: "100%",
   *                    position: "absolute",
   *                    "background-color": "rgba(0,80,120,0)",
   *                  },
   *                  tap_action: {
   *                    domain: "redsea_ui",
   *                    action: "dialog",
   *                    data: { type: "edit_container" },
   *                    },
   *                  },
   *
   * @param device: the device to link the element to
   * @return the instance of the new element
   */
  static create_element(
    hass: HassConfig,
    config: ElementConfig,
    device: Device,
  ): MyElement {
    // Get the element name  (ex:  common-button)
    const Element = customElements.get(config.type) as typeof MyElement;
    let label_name = "";
    //  Create the element and initialize it
    const elt = new Element();
    elt.device = device;
    elt.stateOn = elt.device.is_on();
    elt.hass = hass;
    elt.conf = config;
    elt.color = elt.device.config.color;
    elt.alpha = elt.device.config.alpha;

    //link to hass entity (statObj) if required
    if ("stateObj" in config && !config.stateObj) {
      elt.stateObj = null;
    } else {
      const entityData = elt.device.entities[config.name];
      if (entityData) {
        elt.stateObj = hass.states[entityData.entity_id] || null;
      }
    }

    //Add label if required
    if ("label" in config) {
      if (typeof config.label === "boolean" && config.label !== false) {
        label_name = config.name;
      } else if (config.label && typeof config.label !== "boolean") {
        const entitiesContext = MyElement.createEntitiesContext(device, hass);

        const context = {
          stateObj: elt.stateObj,
          entity: entitiesContext,
          device: device,
          config: config,
          state: elt.stateObj?.state,
          name: config.name,
          i18n: i18n,
        };
        elt.evalCtx = new SafeEval(context);
        label_name = elt.evaluate(config.label);
      }
    }
    //link to hass entity if a target entity is also required (sensor-target,progreess-bar,progress-circle...)
    // it this elemnt is a standard hass element, do not try to run _load_subelements
    if (typeof elt._load_subelements === "function") {
      elt._load_subelements();
    }
    elt.label = label_name;
    return elt;
  }

  protected _load_subelements() {
    return;
  }
  /**
   * Constructor
   */
  constructor() {
    super();
    //Link pointer action to actions
    attachClickHandlers(this, {
      onClick: () => {
        this._click();
      },

      onDoubleClick: () => {
        this._dblclick();
      },

      onHold: () => {
        this._longclick();
      },
    });
  }

  /**
   * Create the main context for string evaluation
   */
  createContext() {
    const entitiesContext = MyElement.createEntitiesContext(
      this.device,
      this._hass,
    );
    const context = {
      stateObj: this.stateObj,
      entity: entitiesContext,
      device: this.device,
      config: this.conf,
      state: this.stateObj?.state,
      name: this.conf.name,
      i18n: i18n,
    };
    this.evalCtx = new SafeEval(context);
  }

  /**
   * Evaluate a  string and replace dynamic parts
   * @param expression: the string to evaluate
   * @return a string
   */
  evaluate(expression: string | DynamicValue<unknown>): string {
    // If already a plain value, return it
    if (typeof expression !== "string" && typeof expression !== "object") {
      return String(expression);
    }
    // If it's a DynamicValue object, extract the expression
    if (
      typeof expression === "object" &&
      expression !== null &&
      "expression" in expression
    ) {
      expression = expression.expression;
    }
    if (typeof expression !== "string") {
      return String(expression);
    }
    this.createContext();
    return this.evalCtx.evaluate(expression);
  }

  /**
   * Evaluate a string reprenseting a conditionnal test and replace dynamic parts
   * @param expression: the string to evaluate
   * @return a boolean
   */
  evaluateCondition(
    expression: string | DisabledCondition | undefined,
  ): boolean {
    if (typeof expression === "boolean") return expression;
    if (!expression) return false;
    if (typeof expression !== "string") {
      // Handle structured DisabledCondition objects
      return false;
    }
    this.createContext();
    return this.evalCtx.evaluateCondition(expression);
  }

  /**
   * Test the nes states in hass to check if the stateObk linked to this element has changed.
   * @param hass: the news states on hass
   * @return true on change, false else
   */
  has_changed(hass: HassConfig): boolean {
    let res = false;
    if (this.stateObj) {
      const so = hass.states[this.stateObj.entity_id];
      if (so && this.stateObj.state !== so.state) {
        res = true;
      }
    }
    return res;
  }

  /**
   * Update Home Assistant instance
   * @param hass: the news states on hass
   * if the state or the value of the current element has changes re-render the element.
   */
  set hass(obj: HassConfig) {
    this._hass = obj;
    if (this.stateObj) {
      const so = this._hass.states[this.stateObj.entity_id];
      if (so && this.stateObj.state !== so.state) {
        this.stateObj = so;
        this.requestUpdate();
      }
    }
  }

  /**
   * Set component configuration
   */
  setConfig(conf: ElementConfig): void {
    this.conf = conf;
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * Transform config part of the css information to js object representing this css.
   * @param css_level: the tag of css level : "css" or "elt.css"
   */
  get_style(css_level: string = "css"): string {
    let style = "";

    if (this.conf && css_level in this.conf) {
      const o_style = structuredClone(this.conf[css_level]);
      if (this.device) {
        let device_color = this.device.config.color;
        if (!this.device.is_on()) {
          device_color = OFF_COLOR;
        }
        if (o_style["background-color"] === "$DEVICE-COLOR$") {
          o_style["background-color"] = "rgb(" + device_color + ")";
        } else if (o_style["background-color"] === "$DEVICE-COLOR-ALPHA$") {
          o_style["background-color"] =
            "rgba(" + device_color + "," + this.device.config.alpha + ")";
        }
      }
      style = Object.entries(o_style)
        .map(([k, v]) => `${k}:${v}`)
        .join(";");
    }
    return style;
  }

  /**
   * Get hass entity from it's tranlation name
   */
  get_entity(entity_translation_value: string): StateObject {
    if (!this._hass || !this.device) {
      throw new Error("Hass or device not initialized");
    }
    const entity = this.device.entities[entity_translation_value];
    if (!entity) {
      throw new Error(`Entity ${entity_translation_value} not found`);
    }
    const state = this._hass.states[entity.entity_id];
    if (!state) {
      throw new Error(`State for ${entity.entity_id} not found`);
    }
    return state;
  }

  /*
   * Render component template
   * Must be overrided by buttons, switch, click-image,progres-* ...
   */
  protected _render(_style: string): any {
    return html``;
  }

  /*
   * Render component template
   * Common render part to all elements.
   *   - test if render condition is met
   *   - set the color according to state
   *   - call the _render() function of elements
   */
  override render() {
    let _value: string | null = null;
    if (this.stateObj !== null) {
      _value = this.stateObj.state;
    }

    if (this.evaluateCondition(this.conf?.disabled_if)) {
      return html`<br />`;
    }

    if (!this.stateOn) {
      this.c = OFF_COLOR;
    } else {
      this.c = this.color;
    }

    return html`
      <div class="${this.conf?.class || ""}" style="${this.get_style()}">
        ${this._render(this.get_style("css"))}
      </div>
    `;
  }

  /**
   * Check and run the declared action after a click, double click or hold.
   * @param actions: the list of actions to run
   * @param timer: a time (in seconds) to wait before executing the last action
   */
  async run_actions(actions: Action | Action[], timer?: number): Promise<void> {
    const actionsArray: Action[] = Array.isArray(actions) ? actions : [actions];

    // Separate HA service calls from UI navigation actions (dialog/exit-dialog)
    // Execution order:
    //   1. All HA service calls immediately (device processes them)
    //   2. Wait timer if set (device acknowledgement delay)
    //   3. UI navigation actions (dialog switch / close)
    const ha_actions = actionsArray.filter(
      (a) => ("enabled" in a ? a.enabled : true) && a.domain !== "redsea_ui",
    );
    const ui_actions = actionsArray.filter(
      (a) => ("enabled" in a ? a.enabled : true) && a.domain === "redsea_ui",
    );

    // Step 1 : fire all HA service calls immediately
    for (const action of ha_actions) {
      let a_data = structuredClone(action.data);

      if (a_data === "default" && this.stateObj) {
        a_data = { entity_id: this.stateObj.entity_id };
      } else if (
        typeof a_data === "object" &&
        a_data !== null &&
        "entity_id" in a_data
      ) {
        a_data.entity_id = this.get_entity(
          (action.data as ActionData).entity_id,
        ).entity_id;
      }

      console.debug("Call Service", action.domain, action.action, a_data);
      this._hass?.callService(action.domain, action.action, a_data);
    }

    // Step 2 : wait timer if HA actions were sent and a timer is defined
    if (timer && timer > 0 && ha_actions.length > 0) {
      await this._wait_timer(timer);
    }

    // Step 3 : execute UI navigation actions
    for (const action of ui_actions) {
      switch (action.action) {
        case "dialog":
          this.dispatchEvent(
            new CustomEvent("display-dialog", {
              bubbles: true,
              composed: true,
              detail: {
                type: (action.data as ActionData).type,
                overload_quit: (action.data as ActionData).overload_quit,
                elt: this,
              },
            }),
          );
          break;
        //exit dialog box
        case "exit-dialog":
          this.dispatchEvent(
            new CustomEvent("quit-dialog", {
              bubbles: true,
              composed: true,
              detail: {},
            }),
          );
          break;
        // display a short hass message box
        case "message_box":
          let str = "";
          if (typeof action.data === "string") {
            str = this.evaluate(action.data);
          } else {
            str = JSON.stringify(action.data);
          }
          this.msgbox(str);
          break;
      }
    }
  }

  /**
   * Wait for a timer while showing a spinning indicator on the button that triggered the action.
   * The button is greyed out and shows a rotating arrow + countdown during the wait.
   * @param seconds - Number of seconds to wait
   */
  async _wait_timer(seconds: number): Promise<void> {
    // The button is rendered as <div class="button"> inside this element's shadow root
    const btn = this.shadowRoot?.querySelector(".button") as HTMLElement | null;
    const original_html = btn?.innerHTML ?? null;
    const original_pointer = btn?.style.pointerEvents ?? null;

    if (btn) {
      btn.style.opacity = "0.5";
      btn.style.filter = "grayscale(60%)";
      btn.style.cursor = "not-allowed";
      btn.style.pointerEvents = "none"; // block re-clicks
    }

    let remaining = seconds;

    const update_label = () => {
      if (btn) {
        btn.innerHTML = `<span style="display:inline-block;animation:timer-spin 1s linear infinite;font-size:1.1em">↻</span>`;
      }
    };

    update_label();

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        remaining--;
        if (remaining > 0) {
          update_label();
        } else {
          clearInterval(interval);
          if (btn && original_html !== null) {
            btn.innerHTML = original_html;
            btn.style.opacity = "";
            btn.style.filter = "";
            btn.style.cursor = "";
            btn.style.pointerEvents = original_pointer ?? "";
          }
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * Test if the click must be taken into account and run associated actions
   */
  _click(): void {
    if (
      this.conf?.tap_action &&
      (!this.device ||
        this.device.masterOn ||
        ["device_state", "trash", "wifi"].includes(this.conf?.name))
    ) {
      this.run_actions(this.conf.tap_action, this.conf.timer);
    }
  }

  /**
   * Test if the hold click  must be taken into account and run associated actions
   */
  _longclick(): void {
    if (
      this.conf?.hold_action &&
      (!this.device ||
        this.device.masterOn ||
        ["device_state", "trash", "wifi"].includes(this.conf?.name))
    ) {
      this.run_actions(this.conf.hold_action, this.conf.timer);
    }
  }

  /**
   * Test if the double click  must be taken into account and run associated actions
   */
  _dblclick(): void {
    if (
      this.conf?.double_tap_action &&
      (!this.device ||
        this.device.masterOn ||
        ["device_state", "trash", "wifi"].includes(this.conf?.name))
    ) {
      this.run_actions(this.conf.double_tap_action, this.conf.timer);
    }
  }

  /**
   * Display a hass notification
   * @param msg: the text to display
   */
  msgbox(msg: string): void {
    this.dispatchEvent(
      new CustomEvent("hass-notification", {
        bubbles: true,
        composed: true,
        detail: {
          message: msg,
        },
      }),
    );
  }
}
