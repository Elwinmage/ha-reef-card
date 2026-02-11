/**
 * @file Base class for UI elements
 * @module base.element
 */

import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { off_color } from "../utils/common.js";
import i18n from "../translations/myi18n.js";

import { attachClickHandlers } from "../utils/click_handler";
import { SafeEval, SafeEvalContext } from "../utils/SafeEval";

import type {
  StateObject,
  HassConfig,
  Device,
  ActionData,
  Action,
  ElementConfig,
} from "../types/element";

/**
 * MyElement component
 * @class MyElement
 * @extends {LitElement}
 */

/**
 * MyElement component
 * @class MyElement
 * @extends {LitElement}
 */

export class MyElement extends LitElement {
  @property({ type: Object, attribute: false })
  stateObj: StateObject | null = null;

  @property({ type: Boolean })
  stateOn: boolean = false;

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
  protected stateObjTarget?: StateObject;

  @state()
  protected c?: string;

  protected evalCtx: SafeEvalContext;

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

  // Initialize component
  constructor() {
    super();
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

  evaluate(expression: string) {
    this.createContext();
    return this.evalCtx.evaluate(expression);
  }

  evaluateCondition(expression: string) {
    this.createContext();
    return this.evalCtx.evaluateCondition(expression);
  }

  has_changed(hass: HassConfig): boolean {
    let res = false;
    if (this.stateObj) {
      const so = hass.states[this.stateObj.entity_id];
      if (so && this.stateObj.state !== so.state) {
        res = true;
      } else if (this.conf && "target" in this.conf && this.stateObjTarget) {
        const sot = hass.states[this.stateObjTarget.entity_id];
        if (sot && this.stateObjTarget.state !== sot.state) {
          res = true;
        }
      }
    }
    return res;
  }

  // Update Home Assistant instance
  set hass(obj: HassConfig) {
    this._hass = obj;
    if (this.stateObj) {
      const so = this._hass.states[this.stateObj.entity_id];
      if (so && this.stateObj.state !== so.state) {
        this.stateObj = so;
        this.requestUpdate();
      } else if (this.conf && "target" in this.conf && this.stateObjTarget) {
        const sot = this._hass.states[this.stateObjTarget.entity_id];
        if (sot && this.stateObjTarget.state !== sot.state) {
          this.stateObjTarget = sot || null;
          this.requestUpdate();
        }
      }
    }
  }

  // Set component configuration
  setConfig(conf: ElementConfig): void {
    this.conf = conf;
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  static create_element(
    hass: HassConfig,
    config: ElementConfig,
    device: Device,
  ): MyElement {
    const Element = customElements.get(config.type) as typeof MyElement;
    let label_name = "";
    //console.debug("Creating element", config.type);

    const elt = new Element();
    elt.device = device;
    elt.stateOn = elt.device.is_on();
    elt.hass = hass;
    elt.conf = config;
    elt.color = elt.device.config.color;
    elt.alpha = elt.device.config.alpha;

    if ("stateObj" in config && !config.stateObj) {
      elt.stateObj = null;
    } else {
      const entityData = elt.device.entities[config.name];
      if (entityData) {
        elt.stateObj = hass.states[entityData.entity_id] || null;
      }
    }

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
    if ("target" in config && elt.device && config.target) {
      const targetEntity = elt.device.entities[config.target];
      if (targetEntity) {
        elt.stateObjTarget = hass.states[targetEntity.entity_id] || null;
      }
    }

    elt.label = label_name;
    return elt;
  }

  get_style(css_level: string = "css"): string {
    let style = "";

    if (this.conf && css_level in this.conf) {
      const o_style = structuredClone(this.conf[css_level]);
      if (this.device) {
        let device_color = this.device.config.color;
        if (!this.device.is_on()) {
          device_color = off_color;
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

  // Render component template
  protected _render(_style: string): any {
    return html``;
  }

  // Render component template
  override render() {
    let _value: string | null = null;
    if (this.stateObj !== null) {
      _value = this.stateObj.state;
    }

    if (this.evaluateCondition(this.conf?.disabled_if)) {
      return html`<br />`;
    }

    if (!this.stateOn) {
      this.c = off_color;
    } else {
      this.c = this.color;
    }

    return html`
      <div class="${this.conf?.class || ""}" style="${this.get_style()}">
        ${this._render(this.get_style("css"))}
      </div>
    `;
  }

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

        case "exit-dialog":
          this.dispatchEvent(
            new CustomEvent("quit-dialog", {
              bubbles: true,
              composed: true,
              detail: {},
            }),
          );
          break;

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
