import { html, TemplateResult, CSSResultGroup } from "lit";
import { property } from "lit/decorators.js";
import style_sensor from "./sensor.styles";
import { MyElement } from "./element";
import i18n from "../../translations/myi18n";
import type { HassConfig, ElementConfig, StateObject } from "../../types/sensor.d";

/**
 * Configuration spécifique au Sensor
 */
interface SensorConfig extends ElementConfig {
  prefix?: string;
  force_integer?: boolean;
  unit?: string | { expression: string; variables?: Record<string, any> };
  label?: string | { expression: string; variables?: Record<string, any> };
}

/**
 * Sensor Component
 * Affiche la valeur d'un capteur avec unité et formatage
 */
export class Sensor extends MyElement {
  static styles: CSSResultGroup = style_sensor;

  @property({ type: Object })
  declare conf?: SensorConfig;

  /**
   * @param hass - Configuration Home Assistant
   * @param conf - Configuration du sensor depuis le mapping
   * @param stateObj - État de l'entité Home Assistant
   * @param color - Couleur RGB (format: "r,g,b")
   * @param alpha - Opacité (0-1)
   */
  constructor(
    hass: HassConfig,
    conf: SensorConfig,
    stateObj: StateObject,
    color: string = "255,255,255",
    alpha: number = 1
  ) {
    super();
    this._hass = hass;
    this.conf = conf;
    this.stateObj = stateObj;
    this.color = color;
    this.alpha = alpha;
    this.c = color;
  }

  /**
   * Évalue une expression pour le label
   */
  private evaluateLabelExpression(): string | number {
    if (!this.conf?.label) {
      return this.stateObj?.state || '';
    }

    const labelConf = this.conf.label;

    // Si c'est une chaîne simple, la substituer
    if (typeof labelConf === 'string') {
      return this.substituteVariables(labelConf, this.getTemplateContext());
    }

    // Si c'est un objet avec expression
    if (typeof labelConf === 'object' && 'expression' in labelConf) {
      const context = {
        ...this.getTemplateContext(),
        ...(labelConf.variables || {})
      };
      return this.substituteVariables(labelConf.expression, context);
    }

    return this.stateObj?.state || '';
  }

  /**
   * Évalue une expression pour l'unité
   */
  private evaluateUnitExpression(): string {
    if (!this.conf?.unit) {
      return this.stateObj?.attributes?.unit_of_measurement || '';
    }

    const unitConf = this.conf.unit;

    // Si c'est une chaîne simple
    if (typeof unitConf === 'string') {
      return this.substituteVariables(unitConf, this.getTemplateContext());
    }

    // Si c'est un objet avec expression
    if (typeof unitConf === 'object' && 'expression' in unitConf) {
      const context = {
        ...this.getTemplateContext(),
        ...(unitConf.variables || {})
      };
      return this.substituteVariables(unitConf.expression, context);
    }

    return '';
  }

  /**
   * Obtient le contexte pour les templates
   */
  private getTemplateContext(): Record<string, any> {
    return {
      state: this.stateObj?.state,
      attributes: this.stateObj?.attributes,
      entity: this.stateObj,
      device: this.device,
      config: this.conf,
      i18n: i18n,
      label: this.label
    };
  }

  /**
   * Substitue les variables dans une expression
   * Supporte ${variable} et {variable}
   */
  private substituteVariables(expression: string, context: Record<string, any>): string {
    // Remplacer ${variable}
    let result = expression.replace(/\$\{([^}]+)\}/g, (match, key) => {
      const value = this.getNestedProperty(context, key.trim());
      return value !== undefined ? String(value) : match;
    });

    // Remplacer {variable}
    result = result.replace(/\{([^}]+)\}/g, (match, key) => {
      const value = this.getNestedProperty(context, key.trim());
      return value !== undefined ? String(value) : match;
    });

    return result;
  }

  /**
   * Récupère une propriété imbriquée
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Formate la valeur selon la configuration
   */
  private formatValue(value: any): string | number {
    // Forcer en entier si demandé
    if (this.conf?.force_integer && typeof value === 'number') {
      return Math.floor(value);
    }

    // Si c'est une chaîne de nombre, la parser si force_integer
    if (this.conf?.force_integer && typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        return Math.floor(parsed);
      }
    }

    return value;
  }

  /**
   * Render du sensor
   */
  protected _render(style: string | null = null): TemplateResult {
    if (!this.stateObj) {
      return html`<div class="sensor error">No state</div>`;
    }

    // Obtenir la valeur
    let value: string | number = this.stateObj.state;

    // Si un label est configuré, l'évaluer
    if (this.conf?.label) {
      value = this.evaluateLabelExpression();
    }

    // Formater la valeur
    value = this.formatValue(value);

    // Déterminer la classe CSS
    const sensor_class = this.conf?.class || "sensor";

    // Obtenir l'unité
    let unit = '';
    if (this.conf?.unit) {
      unit = this.evaluateUnitExpression();
    } else if (this.stateObj.attributes?.unit_of_measurement) {
      unit = this.stateObj.attributes.unit_of_measurement;
    }

    // Obtenir le préfixe
    const prefix = this.conf?.prefix || '';

    return html`
<style>
.sensor {
background-color: rgba(${this.c}, ${this.alpha});
}
</style>
<div
class="${sensor_class}"
id="${this.conf?.name || ''}"
style="${style || ''}"
>
${prefix}${value}<span class="unit">${unit}</span>
</div>
`;
  }
}

