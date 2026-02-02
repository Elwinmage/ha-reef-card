import { html, LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { off_color } from "../../common.js";
import i18n from "../../translations/myi18n.js";


////////////////////////////////////////////////////////////////////////////////
// Types et interfaces
interface StateObject {
  entity_id: string;
  state: string;
  attributes?: Record<string, any>;
  [key: string]: any;
}

interface HassConfig {
  states: { [entity_id: string]: StateObject };
  callService: (domain: string, action: string, data: any) => void;
}

interface DeviceEntity {
  entity_id: string;
  [key: string]: any;
}

interface DeviceConfig {
  color: string;
  alpha: number;
  [key: string]: any;
}

interface Device {
  entities: { [name: string]: DeviceEntity };
  config: DeviceConfig;
  is_on: () => boolean;
}

interface ActionData {
  entity_id?: string;
  type?: string;
  overload_quit?: boolean;
  [key: string]: any;
}

interface Action {
  domain: string;
  action: string;
  data: ActionData | "default";
  enabled?: boolean;
}

// Type pour les expressions de label personnalisées
type LabelExpression = {
  type: 'template';
  template: string;
  variables?: Record<string, any>;
} | string;

interface ElementConfig {
  type: string;
  name: string;
  class?: string;
  label?: LabelExpression | boolean;
  target?: string;
  stateObj?: boolean;
  disabled_if?: DisabledCondition;
  css?: { [key: string]: string };
  "elt.css"?: { [key: string]: string };
  tap_action?: Action | Action[];
  hold_action?: Action | Action[];
  double_tap_action?: Action | Action[];
  [key: string]: any;
}

// Type pour les conditions de désactivation
type DisabledCondition = {
  entity?: string;
  state?: string | string[];
  attribute?: string;
  value?: any;
  operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
} | DisabledCondition[];
////////////////////////////////////////////////////////////////////////////////

export class MyElement extends LitElement {
  @property({ type: Object })
  stateObj: StateObject | null = null;

  @property({ type: Boolean })
  stateOn: boolean = false;

  private mouseDown: number = 0;
  private mouseUp: number = 0;
  private oldMouseUp: number = 0;
  private doubleClick: boolean = false;

  protected _hass: HassConfig | null = null;
  protected conf?: ElementConfig;
  protected device?: Device;
  protected color?: string;
  protected alpha?: number;
  protected label: string = '';
  protected stateObjTarget?: StateObject;
  protected c?: string;

  constructor() {
    super();

    this.addEventListener("contextmenu", (e: Event) => {
      e.preventDefault();
    });

    this.addEventListener("pointerdown", (e: PointerEvent) => {
      this.mouseDown = e.timeStamp;
    });

    this.addEventListener("touchstart", (e: TouchEvent) => {
      this.mouseDown = e.timeStamp;
    });

    this.addEventListener("touchend", (e: TouchEvent) => {
      this.mouseUp = e.timeStamp;
      if ((e.timeStamp - this.mouseDown) > 500) {
        this._click_evt(e);
      }
    });

    this.addEventListener("pointerup", (e: PointerEvent) => {
      this._handleClick(e);
    });
  }

/*  async connectedCallback() {
    super.connectedCallback();
    
    // Attendre que les traductions soient chargées
    await i18n.translate('welcome');
  }
  */
  set state_on(state: boolean) {
    if (state !== this.stateOn) {
      this.stateOn = state;
    }
  }

  has_changed(hass: HassConfig): boolean {
    let res = false;
    if (this.stateObj) {
      let so = hass.states[this.stateObj.entity_id];
      if (this.stateObj.state !== so.state) {
        res = true;
      } else if (this.conf && "target" in this.conf && this.stateObjTarget) {
        let sot = hass.states[this.stateObjTarget.entity_id];
        if (this.stateObjTarget.state !== sot.state) {
          res = true;
        }
      }
    }
    return res;
  }

  set hass(obj: HassConfig) {
    this._hass = obj;
    if (this.stateObj) {
      let so = this._hass.states[this.stateObj.entity_id];
      if (this.stateObj.state !== so.state) {
        this.stateObj = so;
      } else if (this.conf && "target" in this.conf && this.stateObjTarget) {
        let sot = this._hass.states[this.stateObjTarget.entity_id];
        if (this.stateObjTarget.state !== sot.state) {
          this.stateObjTarget = sot;
          this.stateObj = so; // force render
        }
      }
    }
  }

  setConfig(conf: ElementConfig): void {
    this.conf = conf;
  }

  /**
   * Résout une expression de label
   */
  private resolveLabelExpression(labelExpr: LabelExpression, context: Record<string, any>): string {
    if (typeof labelExpr === 'string') {
      return this.substituteVariables(labelExpr, context);
    }

    if (typeof labelExpr === 'object' && labelExpr.type === 'template') {
      const variables = { ...context, ...(labelExpr.variables || {}) };
      return this.substituteVariables(labelExpr.template, variables);
    }

    return '';
  }

  /**
   * Substitue les variables dans une chaîne template
   * Exemple: "Hello ${name}" avec {name: "World"} => "Hello World"
   */
  private substituteVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\${([^}]+)}/g, (match, key) => {
      const value = this.getNestedProperty(variables, key.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Récupère une propriété imbriquée d'un objet
   * Exemple: getNestedProperty({user: {name: "John"}}, "user.name") => "John"
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Évalue une condition de désactivation
   */
  private evaluateDisabledCondition(condition: DisabledCondition): boolean {
    if (!this._hass) return false;

    // Si c'est un tableau de conditions (AND logique)
    if (Array.isArray(condition)) {
      return condition.every(c => this.evaluateDisabledCondition(c));
    }

    const entity = condition.entity ? this._hass.states[condition.entity] : this.stateObj;
    if (!entity) return false;

    const operator = condition.operator || 'equals';
    let actualValue: any;

    // Récupérer la valeur à comparer
    if (condition.attribute) {
      actualValue = entity.attributes?.[condition.attribute];
    } else {
      actualValue = entity.state;
    }

    // Comparer selon l'opérateur
    switch (operator) {
      case 'equals':
        if (Array.isArray(condition.state)) {
          return condition.state.includes(actualValue);
        }
        return actualValue === (condition.state || condition.value);

      case 'not_equals':
        if (Array.isArray(condition.state)) {
          return !condition.state.includes(actualValue);
        }
        return actualValue !== (condition.state || condition.value);

      case 'greater_than':
        return parseFloat(actualValue) > parseFloat(condition.value);

      case 'less_than':
        return parseFloat(actualValue) < parseFloat(condition.value);

      case 'contains':
        return String(actualValue).includes(String(condition.value));

      default:
        return false;
    }
  }

  static create_element(hass: HassConfig, config: ElementConfig, device: Device): MyElement {
    //let iconv = _i18n;
    let iconv = i18n;
    let Element = customElements.get(config.type) as typeof MyElement;
    let label_name = '';
    console.debug("Creating element", config.type);

    let elt = new Element();
    elt.device = device;
    elt.stateOn = elt.device.is_on();
    elt.hass = hass;
    elt.conf = config;
    elt.color = elt.device.config.color;
    elt.alpha = elt.device.config.alpha;

    if ('stateObj' in config && !config.stateObj) {
      elt.stateObj = null;
    } else {
      elt.stateObj = hass.states[elt.device.entities[config.name].entity_id];
    }

    // Résoudre le label
    if ('label' in config) {
      if (typeof config.label === 'boolean' && config.label !== false) {
        label_name = config.name;
      } else if (config.label && typeof config.label !== 'boolean') {
        const context = {
          entity: elt.stateObj,
          device: device,
          config: config,
          state: elt.stateObj?.state,
          name: config.name,
          iconv: iconv
        };
        label_name = elt.resolveLabelExpression(config.label, context);
      }
    }

    if ("target" in config && elt.device) {
      elt.stateObjTarget = hass.states[elt.device.entities[config.target!].entity_id];
    }

    elt.label = label_name;
    return elt;
  }

  /**
   * Build a css style string according to given json configuration
   * @param css_level: the css definition level
   */
  get_style(css_level: string = 'css'): string {
    let style = '';
    if (this.conf && css_level in this.conf) {
      style = Object.entries(this.conf[css_level]).map(([k, v]) => `${k}:${v}`).join(';');
    }
    return style;
  }

  get_entity(entity_translation_value: string): StateObject {
    if (!this._hass || !this.device) {
      throw new Error("Hass or device not initialized");
    }
    return this._hass.states[this.device.entities[entity_translation_value].entity_id];
  }

  private _handleClick(e: PointerEvent): void {
    if (e.pointerType !== "touch") {
      if (e.detail === 1) {
        this._click_evt(e);
      } else if (e.detail === 2) {
        this.doubleClick = true;
        this._dblclick(e);
      }
    } else {
      if ((this.mouseUp - this.oldMouseUp) < 400) {
        this.doubleClick = true;
        this._dblclick(e);
      } else {
        this._click_evt(e);
      }
      this.oldMouseUp = this.mouseUp;
    }
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected _render(style: string): any {
    // Méthode à implémenter dans les classes enfants
    return html``;
  }

  render() {
    let value: string | null = null;
    if (this.stateObj !== null) {
      value = this.stateObj.state;
    }

    // Évaluer la condition de désactivation
    if (this.conf && 'disabled_if' in this.conf && this.conf.disabled_if) {
      if (this.evaluateDisabledCondition(this.conf.disabled_if)) {
        return html`<br />`;
      }
    }

    if (!this.stateOn) {
      this.c = off_color;
    } else {
      this.c = this.color;
    }

    return html`
<div class="${this.conf?.class || ''}" style="${this.get_style()}">
${this._render(this.get_style('elt.css'))}
</div>
`;
  }

  async run_actions(actions: Action | Action[]): Promise<void> {
    //let iconv = _i18n;
    let iconv = i18n;
    let actionsArray: Action[] = Array.isArray(actions) ? actions : [actions];

    for (let action of actionsArray) {
      if (!("enabled" in action) || action.enabled) {
        if (action.domain === "redsea_ui") {
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
                  }
                })
              );
              break;

            case "exit-dialog":
              this.dispatchEvent(
                new CustomEvent("quit-dialog", {
                  bubbles: true,
                  composed: true,
                  detail: {}
		})
              );
              break;

            case "message_box":
              let str = '';
              if (typeof action.data === 'string') {
                // Substituer les variables dans le message
                const context = {
                  entity: this.stateObj,
                  device: this.device,
                  state: this.stateObj?.state,
                  iconv: iconv
                };
                str = this.substituteVariables(action.data, context);
              } else {
                str = JSON.stringify(action.data);
              }
              this.msgbox(str);
              break;

            default:
              let error_str = "Error: try to run unknown redsea_ui action: " + action.action;
              this.msgbox(error_str);
              console.error(error_str);
              break;
          }
        } else {
          let a_data = structuredClone(action.data);

          if (a_data === "default" && this.stateObj) {
            a_data = { entity_id: this.stateObj.entity_id };
          } else if (typeof a_data === 'object' && a_data !== null && "entity_id" in a_data) {
            a_data.entity_id = this.get_entity((action.data as ActionData).entity_id!).entity_id;
          }

          console.debug("Call Service", action.domain, action.action, a_data);
          this._hass?.callService(action.domain, action.action, a_data);
        }
      }
    }
  }

  async _click_evt(e: MouseEvent | TouchEvent): Promise<void> {
    let timing = e.timeStamp - this.mouseDown;

    if (e.timeStamp - this.mouseDown > 500) {
      this._longclick(e);
    } else {
      await this.sleep(300);
      if (this.doubleClick === true) {
        this.doubleClick = false;
      } else {
        this._click(e);
      }
    }
    this.mouseDown = e.timeStamp;
  }

  _click(e: MouseEvent | TouchEvent): void {
    if (this.conf && 'tap_action' in this.conf) {
      this.run_actions(this.conf.tap_action!);
    }
  }

  _longclick(e: MouseEvent | TouchEvent): void {
    if (this.conf && "hold_action" in this.conf) {
      this.run_actions(this.conf.hold_action!);
    }
  }

  _dblclick(e: MouseEvent | TouchEvent): void {
    if (this.conf && "double_tap_action" in this.conf) {
      this.run_actions(this.conf.double_tap_action!);
    }
  }

  msgbox(msg: string): void {
    this.dispatchEvent(
      new CustomEvent("hass-notification", {
        bubbles: true,
        composed: true,
        detail: {
          message: msg
        }
      })
    );
  }
}
