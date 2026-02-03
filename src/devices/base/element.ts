import { html, LitElement, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { off_color } from "../../common.js";
import i18n from "../../translations/myi18n.js";

import { attachClickHandlers } from "./click_handler"

// Import des types depuis le dossier types
import type {
  StateObject,
  HassConfig,
  DeviceEntity,
  DeviceConfig,
  Device,
  ActionData,
  Action,
  LabelExpression,
  DisabledCondition,
  ElementConfig
} from "../../types/element";

const iconv = i18n;

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
  protected label: string = '';
  
  @state()
  protected stateObjTarget?: StateObject;
  
  @state()
  protected c?: string;


  private static createEntitiesContext(device: any, hass: any): Record<string, any> {
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
      }
    });
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

  set hass(obj: HassConfig) {
    this._hass = obj;
    if (this.stateObj) {
      const so = this._hass.states[this.stateObj.entity_id];
      if (so && this.stateObj.state !== so.state) {
        this.stateObj = so;
      }
      else if (this.conf && "target" in this.conf && this.stateObjTarget) {
	const sot = this._hass.states[this.stateObjTarget.entity_id];
        if (sot && this.stateObjTarget.state !== sot.state) {
          this.stateObjTarget = sot || null;
          this.stateObj = so; // force render
	}
      }
    }
  }

  setConfig(conf: ElementConfig): void {
    this.conf = conf;
  }

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
   * Substitue les variables dans un template string
   * Gère les traductions i18n._() et les expressions JavaScript
   */
  protected substituteVariables(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    processed = processed.replace(/(i18n)\._\(['"]([^'"]+)['"]\)/g, (match, obj, key) => {
      try {
	return i18n._(key);
      } catch (error) {
	console.warn(`Translation not found for key: ${key}`);
	return key;
      }
    });
    
    // Étape 2: Remplacer les variables et expressions ${...}
    processed = processed.replace(/\${([^}]+)}/g, (match, expression) => {
      try {
	const trimmed = expression.trim();
	
	// Variable simple (ex: state, device.name)
	if (/^[a-zA-Z_$][a-zA-Z0-9_$.]*$/.test(trimmed)) {
          const value = this.getNestedProperty(variables, trimmed);
          return value !== undefined ? String(value) : match;
	}
	
	// Expression complexe (ex: state * 2, condition ? a : b)
	// Créer une fonction avec les variables comme paramètres
	const varNames = Object.keys(variables);
	const varValues = Object.values(variables);
	
	const contextVars = {
          ...variables,
          i18n: i18n,
	};
	
	const func = new Function(
          ...Object.keys(contextVars),
          `"use strict"; return (${trimmed});`
	);
	
	const result = func(...Object.values(contextVars));
	return result !== undefined && result !== null ? String(result) : match;
      } catch (error) {
	console.error('Error evaluating expression:', expression, error);
	return match;
      }
    });
    
    return processed;
  }

  /**
   * Accède à une propriété imbriquée d'un objet via un chemin
   * Ex: getNestedProperty({a: {b: {c: 1}}}, 'a.b.c') => 1
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }
  
  protected evaluateDisabledCondition(condition: DisabledCondition): boolean {
    if (!this._hass) return false;

    if (Array.isArray(condition)) {
      return condition.every(c => this.evaluateDisabledCondition(c));
    }

    const entity = condition.entity ? this._hass.states[condition.entity] : this.stateObj;
    if (!entity) return false;

    const operator = condition.operator || 'equals';
    let actualValue: any;

    if (condition.attribute) {
      actualValue = entity.attributes?.[condition.attribute];
    } else {
      actualValue = entity.state;
    }

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
      const entityData = elt.device.entities[config.name];
      if (entityData) {
        elt.stateObj = hass.states[entityData.entity_id] || null;
      }
    }

    if ('label' in config) {
      if (typeof config.label === 'boolean' && config.label !== false) {
	label_name = config.name;
      } else if (config.label && typeof config.label !== 'boolean') {
	// Créer un objet avec toutes les entités du device
	const entitiesContext = MyElement.createEntitiesContext(device, hass);
	
	const context = {
	  entity: entitiesContext,      // Accès via entity.nom_entite.state
	  entities: entitiesContext,    // Accès via entities.nom_entite.state (alias)
	  device: device,
	  config: config,
	  state: elt.stateObj?.state,
	  name: config.name,
	  i18n: i18n
	};
	label_name = elt.resolveLabelExpression(config.label, context);
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

  get_style(css_level: string = 'css'): string {
    let style = '';
    //Set device color patch
    if (this.conf && css_level in this.conf) {
      let o_style = structuredClone(this.conf[css_level]);
      if(o_style['background-color']=="$DEVICE-COLOR$"){
	o_style['background-color']="rgb("+this.device.config.color+")";
      }
      else  if(o_style['background-color']=="$DEVICE-COLOR-ALPHA$"){
	o_style['background-color']="rgba("+this.device.config.color+","+this.device.config.alpha+")";
      }
      style = Object.entries(o_style).map(([k, v]) => `${k}:${v}`).join(';');
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

  protected _render(style: string): any {
    return html``;
  }

  override render() {
    let value: string | null = null;
    if (this.stateObj !== null) {
      value = this.stateObj.state;
    }

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
${this._render(this.get_style('css'))}
</div>
`;
  }

  async run_actions(actions: Action | Action[]): Promise<void> {
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
		// Créer un objet avec toutes les entités du device
		const entitiesContext = MyElement.createEntitiesContext(this.device, this._hass);
		
		const context = {
		  entity: entitiesContext,
		  entities: entitiesContext,
		  device: this.device,
		  state: this.stateObj?.state,
		  i18n: i18n
		};
		str = this.substituteVariables(action.data, context);
	      } else {
		str = JSON.stringify(action.data);
	      }
	      this.msgbox(str);
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


  _click(): void {
    if (this.conf && 'tap_action' in this.conf) {
      this.run_actions(this.conf.tap_action!);
    }
  }

  _longclick(): void {
    if (this.conf && "hold_action" in this.conf) {
      this.run_actions(this.conf.hold_action!);
    }
  }

  _dblclick(): void {
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
