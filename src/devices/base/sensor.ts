import { html, TemplateResult, CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import style_sensor from "./sensor.styles";
import { MyElement } from "./element";
import { button_color} from "../../common";


interface SensorConfig {
  name?: string;
  class?: string;
  prefix?: string;
  force_integer?: boolean;
  unit?: string;
  label?: string;
  disabled_if?: any;
  [key: string]: any;
}

export class Sensor extends MyElement {
  static override styles: CSSResultGroup = [style_sensor, css`
    .sensor {
      background-color: var(--sensor-bg-color);
    }
  `];

  @property({ type: Object, attribute: false })
  // @ts-expect-error - Property override compatibility
  declare conf?: SensorConfig;

  constructor() {
    super();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.stateOn = this.stateObj?.state === 'on';
  }

  override updated(): void {
    if (this.stateObj) {
      this.stateOn = this.stateObj.state === 'on';
    }
  }

  protected override _render(_style: string = ''): TemplateResult {
    if (!this.conf) {
      return html``;
    }

    const sclass = this.conf.class || '';

    if (this.conf?.icon){
      return html`
      <ha-icon 
         icon="${this.stateObj.attributes.icon || 'mdi:help'}"
         style="color:rgb(${button_color})">
      </ha-icon>`;
    }

    let value: string | number = '';
    let unit = '';

    if (this.stateObj) {
      value = this.label || this.stateObj.state;
      unit = this.conf.unit || this.stateObj.attributes?.unit_of_measurement || '';

      if (this.conf.prefix) {
        value = this.conf.prefix + value;
      }

      if (this.conf.force_integer && typeof value === 'string') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          value = Math.round(numValue).toString();
        }
      }
    }

    return html`
      <div 
        class="sensor ${sclass}" 
        style="${_style}; ">
        ${value}
        ${unit ? html`<span class="unit">${unit}</span>` : ''}
      </div>
    `;
  }

}
