import { html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import style_sensor_target from "./sensor_target.styles";
import { Sensor } from "./sensor";
import type { HassEntity } from "../../types/index";

export class SensorTarget extends Sensor {
  static override styles = style_sensor_target;

  @property({ type: Object })
  override stateObjTarget: HassEntity | null = null;

  constructor() {
    super();
    this.stateObjTarget = null;
  }

  protected override _render(_style: string = ''): TemplateResult {
    if (!this.stateObj || !this.stateObjTarget) {
      return html`<div class="error">Missing state</div>`;
    }

    let value = parseFloat(this.stateObj.state) || 0;
    let target = parseFloat(this.stateObjTarget.state) || 0;
    if(this.conf.force_integer){
      value=Math.floor(value);
      target=Math.floor(target);
    }

    //eval de unit
    const unit = this.conf?.unit || this.stateObj.attributes?.unit_of_measurement || '';

    const sclass = this.conf?.class || 'sensor';
    
    const style = this.get_style('css');
    const bgColor = `rgba(${this.c},${this.alpha})`;

    return html`
<div class="${sclass}" id="${this.conf.name}" style="${style}">${value}/${target}<span class="unit">${unit}</span></div>
`;
    
  }
}
