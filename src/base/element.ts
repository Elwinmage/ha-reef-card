/**
 * @file Base class for UI elements
 * @module base.element
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, LitElement, nothing } from "lit";
import type { CSSResultGroup } from "lit";
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
import style_animations from "../utils/animations.styles";

//----------------------------------------------------------------------------//

/** Tooltip text of the card's own actions (redsea_ui), by action. */
const UI_ACTION_TOOLTIPS: Record<string, string> = {
  "more-info": "tooltip_action_more_info",
  show_device: "tooltip_action_show_device",
  "exit-dialog": "tooltip_action_close",
  open_schedule: "tooltip_action_schedule",
  message_box: "tooltip_action_info",
};

/**
 * MyElement component
 * @class MyElement
 * @extends {LitElement}
 */
export class MyElement extends LitElement {
  // Inject animation keyframes into every element's shadow DOM
  // Typed as Lit does (ReactiveElement.styles), not inferred as CSSResult[]:
  // subclasses legitimately assign a single CSSResult or a nested group, and
  // the narrower inferred type made every one of them a TS2417.
  static override styles: CSSResultGroup = [style_animations];
  // Public reactive properties
  @property({ type: Object, attribute: false })
  stateObj: StateObject | null = null;

  @property({ type: Boolean })
  stateOn: boolean = false;

  /**
   * State of the group this element was rendered into.
   *
   * `stateOn` cannot be used for that: Sensor.updated() rewrites it from the
   * element's own entity ("on"/"off"), which is meaningless for a numeric
   * sensor such as a pump speed or a dosed volume. That rewrite also destroys
   * `stateOn` as a change trigger — it is left at false, so assigning false
   * again is a no-op and Lit schedules no update. `groupOn` is written only by
   * `_render_element`, so it stays a reliable signal. It is reactive: setting
   * it queues a re-render. null means the device never provided one.
   */
  @property({ attribute: false })
  groupOn: boolean | null = null;

  // Internal states
  //@state(hasChanged()
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

  // Dialog titles already resolved for the tooltip, by dialog type
  private _dialog_titles: Record<string, string> = {};

  /**
   * Create the list of entities taht can be used in a context for string evaluation
   * @param device: the current device hass object
   * @param hass: the hass states
   * @return a context to help evaluate dynamic strings
   */
  static createEntitiesContext(device: any, hass: any): Record<string, any> {
    const entitiesObj: Record<string, any> = {};

    if (device?.entities && hass?.states) {
      for (const key in device.entities) {
        const entity = device.entities[key];
        if (entity?.entity_id && hass.states[entity.entity_id]) {
          entitiesObj[key] = hass.states[entity.entity_id];
        }
      }
    }
    // Include parent entities (lower priority — don't overwrite local ones)
    if (device?.parent_entities && hass?.states) {
      for (const key in device.parent_entities) {
        if (key in entitiesObj) continue;
        const entity = device.parent_entities[key];
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
    // Return null if the element type is not registered
    if (!Element) {
      console.error(`create_element: unknown element type "${config.type}"`);
      return null as unknown as MyElement;
    }
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
      const entityData =
        elt.device.entities[config.name] ??
        elt.device.parent_entities?.[config.name];
      if (entityData) {
        elt.stateObj = hass.states[entityData.entity_id] || null;
      } else if (config.name && hass.states[config.name]) {
        // The name is already an entity_id. Registry keys are translation
        // keys, so an entity picked by the user in the card editor — which
        // belongs to another integration entirely — can only be named this
        // way. Tried last: a translation key always wins over a state lookup.
        elt.stateObj = hass.states[config.name];
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
    // Keyboard users reach actionable elements through tabindex (see
    // render()): Enter or Space runs the tap action, as a click does.
    this.addEventListener("keydown", (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && this.is_actionable()) {
        e.preventDefault();
        this._click();
      }
    });
  }

  /**
   * Merge extra CSS into this element's own configuration.
   *
   * The device re-applies persistent overrides after a config rebuild, which
   * used to poke at the protected `conf` from outside the class. This is the
   * same operation with a public seam, and it tolerates an element whose conf
   * carries no `css` yet.
   * @param css: the properties to merge in
   */
  merge_css(css: Record<string, string>): void {
    if (!this.conf) {
      return;
    }
    this.conf.css = { ...(this.conf.css ?? {}), ...css };
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
        return;
      }
    }
    // If element has a disabled_if condition, re-render so the condition
    // is re-evaluated when any referenced entity changes state.
    if (this.conf?.disabled_if) {
      this.requestUpdate();
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
        // The device-colour tokens apply to any property, not just
        // background-color: `color`, `border-color` and friends need them too.
        for (const [key, val] of Object.entries(o_style)) {
          if (val === "$DEVICE-COLOR$") {
            o_style[key] = "rgb(" + device_color + ")";
          } else if (val === "$DEVICE-COLOR-ALPHA$") {
            o_style[key] =
              "rgba(" + device_color + "," + this.device.config.alpha + ")";
          }
        }
      }
      style = Object.entries(o_style)
        .map(([k, v]) => `${k}:${v}`)
        .join(";");
    }
    return style;
  }

  /**
   * Resolve the CSS class list of the wrapper div.
   *
   * A static string is returned as-is. A string containing a `${...}`
   * template is evaluated against the usual context, which allows a mapping
   * to switch a class on an entity state, e.g.:
   *   class: "${device.is_missing() ? 'blink-fast' : ''}"
   *   class: "${entity.missing_pump?.state === 'on' ? 'blink' : ''}"
   * @return the class attribute to apply
   */
  get_class(): string {
    const cls = this.conf?.class;
    if (typeof cls !== "string" || cls.length === 0) {
      return "";
    }
    if (!cls.includes("${")) {
      return cls;
    }
    const evaluated = this.evaluate(cls);
    // A failed evaluation returns undefined: fall back to no class rather
    // than injecting "undefined" into the DOM.
    return typeof evaluated === "string" ? evaluated.trim() : "";
  }

  /**
   * Get hass entity from it's tranlation name
   */
  get_entity(entity_translation_value: string): StateObject {
    if (!this._hass || !this.device) {
      throw new Error("Hass or device not initialized");
    }
    const entity =
      this.device.entities[entity_translation_value] ??
      this.device.parent_entities?.[entity_translation_value];
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
      if (this.conf?.no_br_if_disabled) {
        return html``;
      }
      return html`<br />`;
    }

    if (!this.stateOn) {
      this.c = OFF_COLOR;
    } else {
      this.c = this.color;
    }

    // Native tooltip and accessible name: tells what a symbol is and what
    // a click would do before anything is triggered
    const tooltip = this.get_tooltip();
    this._update_a11y(tooltip);
    // The pointer cursor shows only where a click, a double click or a hold
    // would do something now, whatever the element type draws inside. A
    // mapping may pick another cursor for a clickable element, never a
    // pointer for one that is not.
    const clickable = this.is_clickable();
    let style = this.get_style();
    let cursor = "";
    if (!clickable) {
      cursor = "cursor:default";
    } else if (!("cursor" in (this.conf?.css ?? {}))) {
      cursor = "cursor:pointer";
    }
    if (cursor) style = style ? `${style};${cursor}` : cursor;
    const cls = [this.get_class(), clickable ? "clickable" : ""]
      .filter((c) => c)
      .join(" ");
    return html`
      <div class="${cls}" style="${style}" title="${tooltip || nothing}">
        ${this._render(this.get_style("elt_css"))}
      </div>
    `;
    /*    return html`
      <div class="${this.conf?.class || ""}" style="${this.get_style()}">
        ${this._render(this.get_style("css"))}
      </div>
    `;*/
  }

  //--------------------------------------------------------------------------//
  //   Tooltip
  //--------------------------------------------------------------------------//

  /**
   * Enabled actions of one trigger.
   * @param actions: the tap, hold or double tap actions
   * @return the enabled ones
   */
  private _enabled_actions(actions: Action | Action[] | undefined): Action[] {
    if (!actions) return [];
    const list = Array.isArray(actions) ? actions : [actions];
    return list.filter((a) => a.enabled !== false);
  }

  /**
   * Whether a click, a double click or a hold does something.
   * @return true when at least one action is enabled
   */
  is_actionable(): boolean {
    return (
      this._enabled_actions(this.conf?.tap_action).length > 0 ||
      this._enabled_actions(this.conf?.double_tap_action).length > 0 ||
      this._enabled_actions(this.conf?.hold_action).length > 0
    );
  }

  /**
   * Whether the element reacts to a pointer in the device's current state:
   * a device switched off ignores them, except on the few elements that
   * must stay usable (its on/off switch, wifi, trash, `off_clickable`).
   * @return true when actions may run
   */
  accepts_actions(): boolean {
    return (
      !this.device ||
      this.device.masterOn ||
      this.conf?.off_clickable === true ||
      ["device_state", "trash", "wifi"].includes(this.conf?.name)
    );
  }

  /**
   * Whether a click, a double click or a hold would do something now.
   * @return true for an element with enabled actions that accepts them
   */
  is_clickable(): boolean {
    return this.is_actionable() && this.accepts_actions();
  }

  /**
   * Expose a clickable element as a focusable button named by its
   * tooltip, for keyboards and screen readers.
   * @param tooltip: the element's tooltip
   */
  private _update_a11y(tooltip: string): void {
    if (this.is_clickable()) {
      this.setAttribute("role", "button");
      if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    } else {
      this.removeAttribute("role");
      this.removeAttribute("tabindex");
    }
    if (tooltip) this.setAttribute("aria-label", tooltip);
    else this.removeAttribute("aria-label");
  }

  /**
   * Translate a key, or return null when no language has it.
   * @param key: the translation key
   * @param params: the parameters of the string
   * @return the translation or null
   */
  private _tr(
    key: string,
    params?: Record<string, string | number>,
  ): string | null {
    if (!i18n.hasTranslation(key) && !i18n.hasTranslation(key, "en")) {
      return null;
    }
    return i18n._(key, params);
  }

  /**
   * Evaluate a tooltip or title expression into plain text.
   * @param value: what the evaluation returned
   * @return the text, "" when the evaluation failed
   */
  private static _text(value: unknown): string {
    return value === undefined || value === null ? "" : String(value);
  }

  /**
   * Title of a dialog of the device, as the dialog box would show it.
   * @param type: the dialog type
   * @return the title, or "" when unknown
   */
  private _dialog_title(type: string): string {
    if (type in this._dialog_titles) return this._dialog_titles[type]!;
    let title = "";
    // Sub-devices (a pump, a head, a port) may borrow their parent's dialogs
    let node: any = this.device;
    while (node && !node.dialogs?.[type]?.title_key) node = node.device;
    if (node) {
      const ctx = new SafeEval({
        config: node.config,
        device: node,
        i18n: i18n,
        entity: MyElement.createEntitiesContext(node, this._hass),
      });
      // Titles are written as HTML into the dialog box: keep the text only
      title = MyElement._text(ctx.evaluate(node.dialogs[type].title_key))
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }
    this._dialog_titles[type] = title;
    return title;
  }

  /**
   * Describe what one action does.
   * @param action: the action
   * @return the description, or "" for an action with nothing to tell
   */
  private _describe_action(action: Action): string {
    const data: any = action.data;
    if (action.domain === "redsea_ui") {
      if (action.action === "dialog") {
        const title = this._dialog_title(String(data?.type));
        return title
          ? i18n._("tooltip_action_dialog", { name: title })
          : i18n._("tooltip_action_dialog_generic");
      }
      // wait, update_conf, device_event: internal steps, nothing to tell
      const key = UI_ACTION_TOOLTIPS[action.action];
      return key ? i18n._(key) : "";
    }
    // Home Assistant service: name the entity it acts on, when it is not
    // the one the element already shows
    let target: StateObject | null = null;
    if (typeof data?.entity_id === "string") {
      try {
        target = this.get_entity(data.entity_id);
      } catch {
        target = null;
      }
    }
    const name =
      target && target.entity_id !== this.stateObj?.entity_id
        ? String(target.attributes?.friendly_name ?? "")
        : "";
    const verb =
      this._tr("tooltip_svc_" + action.action, { name }) ??
      i18n._("tooltip_svc_generic", {
        name: name || `${action.domain}.${action.action}`,
      });
    return verb.replace(/\s+/g, " ").trim();
  }

  /**
   * Describe what a trigger (tap, hold...) does.
   * @param key: the translation key of the trigger
   * @param actions: its actions
   * @return one line, or "" when it does nothing worth telling
   */
  private _describe_trigger(
    key: string,
    actions: Action | Action[] | undefined,
  ): string {
    const parts = this._enabled_actions(actions)
      .map((a) => this._describe_action(a))
      .filter((d) => d);
    if (parts.length === 0) return "";
    return `${i18n._(key)}: ${[...new Set(parts)].join(", ")}`;
  }

  /**
   * What the element shows, for the first line of its tooltip.
   * @return the entity name and its value, the label, or ""
   */
  protected tooltip_subject(): string {
    if (!this.stateObj) return String(this.label).trim();
    const format = (this._hass as any)?.formatEntityState;
    const value = format
      ? format.call(this._hass, this.stateObj)
      : this.stateObj.state;
    return [this.stateObj.attributes?.friendly_name, value]
      .filter((part) => part)
      .join(": ");
  }

  /**
   * Text of the element's native tooltip, also used as its accessible name.
   *
   * `tooltip` in the configuration wins (false removes it). Otherwise it
   * names what the element shows, then what a click, a double click and a
   * hold would do, so nothing has to be pressed to find out.
   * @return the tooltip, or "" for none
   */
  get_tooltip(): string {
    const custom = this.conf?.tooltip;
    if (custom === false) return "";
    if (typeof custom === "string" && custom && !custom.includes("${")) {
      return this._tr(custom) ?? custom;
    }
    if (custom) return MyElement._text(this.evaluate(custom));
    return [
      this.tooltip_subject(),
      this._describe_trigger("tooltip_tap", this.conf?.tap_action),
      this._describe_trigger(
        "tooltip_double_tap",
        this.conf?.double_tap_action,
      ),
      this._describe_trigger("tooltip_hold", this.conf?.hold_action),
    ]
      .filter((line) => line)
      .join("\n");
  }

  /**
   * Check and run the declared action after a click, double click or hold.
   * @param actions: the list of actions to run
   * @param timer: a time (in seconds) to wait before executing the last action
   */
  async run_actions(actions: Action | Action[], timer?: number): Promise<void> {
    const actionsArray: Action[] = Array.isArray(actions) ? actions : [actions];
    // Filter enabled actions
    const enabledActions = actionsArray.filter((a) =>
      "enabled" in a ? a.enabled : true,
    );

    // Check if there are any wait actions
    const hasWaitAction = enabledActions.some(
      (a) => a.domain === "redsea_ui" && a.action === "wait",
    );

    // If there are wait actions, process sequentially
    if (hasWaitAction) {
      for (const action of enabledActions) {
        if (action.domain === "redsea_ui" && action.action === "wait") {
          // Wait for specified duration (in seconds)
          const duration = typeof action.data === "number" ? action.data : 1;
          await this._wait_timer(duration);
        } else if (action.domain !== "redsea_ui") {
          // Execute HA service call
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
        } else {
          // Handle other UI actions
          await this._execute_ui_action(action);
        }
      }
      return;
    }

    // Original behavior: fire all HA service calls immediately
    const ha_actions = enabledActions.filter((a) => a.domain !== "redsea_ui");
    const ui_actions = enabledActions.filter((a) => a.domain === "redsea_ui");

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
      await this._execute_ui_action(action);
    }
  }

  /**
   * Execute a single UI action
   */
  private async _execute_ui_action(action: Action): Promise<void> {
    switch (action.action) {
      case "more-info":
        const entityKey =
          typeof action.data === "string"
            ? action.data
            : (action.data as ActionData)?.entity_id;
        const entityObj =
          this.device?.entities?.[entityKey] ??
          this.device?.parent_entities?.[entityKey];
        if (entityKey && entityObj) {
          this.dispatchEvent(
            new CustomEvent("hass-more-info", {
              bubbles: true,
              composed: true,
              detail: {
                entityId: entityObj.entity_id,
              },
            }),
          );
        }
        break;
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
      case "show_device": {
        // Navigate the card to another device it already manages. The target
        // is named by hardware id — the one identifier that survives a rename
        // in Home Assistant and in the device's own payload. The card resolves
        // it; the element only says where it wants to go.
        const raw =
          typeof action.data === "string"
            ? action.data
            : ((action.data as any)?.hwid ?? (action.data as any)?.device);
        const hwid = typeof raw === "string" ? this.evaluate(raw) : raw;
        if (hwid) {
          this.dispatchEvent(
            new CustomEvent("show-device", {
              bubbles: true,
              composed: true,
              detail: { hwid: String(hwid) },
            }),
          );
        }
        break;
      }
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
      case "device_event":
        this.dispatchEvent(
          new CustomEvent("device-event", {
            bubbles: true,
            composed: true,
            detail: {
              event: (action.data as any)?.event,
              payload: (action.data as any)?.payload,
            },
          }),
        );
        break;
      case "open_schedule": {
        // data is the mapping key of the schedule element to open, e.g.
        // "schedule_1". Elements are cached on the device under that key.
        const key =
          typeof action.data === "string"
            ? action.data
            : ((action.data as any)?.element as string | undefined);
        const target = key ? (this.device as any)?._elements?.[key] : undefined;
        if (target && typeof target.openEditor === "function") {
          target.openEditor();
        } else {
          console.debug("open_schedule: no schedule element named", key);
        }
        break;
      }
      case "update_conf":
        if (
          this.device?.config?.elements &&
          action.data &&
          typeof action.data === "object"
        ) {
          const patch = action.data as Record<string, any>;
          for (const [elemName, elemPatch] of Object.entries(patch)) {
            if (elemName in this.device.config.elements) {
              const elemConf = this.device.config.elements[elemName];
              const cacheKey = elemName;
              const cachedElt = (this.device as any)._elements?.[cacheKey];

              const overrides = (this.device as any)._conf_overrides;
              if (overrides) {
                if (!overrides[elemName]) overrides[elemName] = {};
                for (const [key, val] of Object.entries(elemPatch as any)) {
                  if (
                    val !== null &&
                    typeof val === "object" &&
                    !Array.isArray(val)
                  ) {
                    overrides[elemName][key] = {
                      ...(overrides[elemName][key] ?? {}),
                      ...(val as any),
                    };
                  } else {
                    overrides[elemName][key] = val;
                  }
                }
              }

              if (cachedElt && (elemPatch as any).css) {
                if (elemConf.type?.startsWith("hui-")) {
                  for (const [prop, val] of Object.entries(
                    (elemPatch as any).css,
                  )) {
                    cachedElt.style.setProperty(prop, val as string);
                  }
                } else {
                  if (cachedElt.conf?.css) {
                    Object.assign(cachedElt.conf.css, (elemPatch as any).css);
                  }
                  cachedElt.requestUpdate();
                }
              }
            }
          }
          this.device.requestUpdate();
        }
        break;
    }
  }

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
        btn.innerHTML = `<span style="display:inline-block;animation:timer-spin 1s linear infinite;font-size:1.1em">↻</span> ${remaining}s`;
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
    if (this.conf?.tap_action && this.accepts_actions()) {
      this.run_actions(this.conf.tap_action, this.conf.timer);
    }
  }

  /**
   * Test if the hold click  must be taken into account and run associated actions
   */
  _longclick(): void {
    if (this.conf?.hold_action && this.accepts_actions()) {
      this.run_actions(this.conf.hold_action, this.conf.timer);
    }
  }

  /**
   * Test if the double click  must be taken into account and run associated actions
   */
  _dblclick(): void {
    if (this.conf?.double_tap_action && this.accepts_actions()) {
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
