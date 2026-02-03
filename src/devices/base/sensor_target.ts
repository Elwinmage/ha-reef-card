// @ts-nocheck
// @ts-nocheck
import { html, TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import style_sensor_target from "./sensor_target.styles";
import i18n from "../../translations/myi18n";
import { Sensor } from "./sensor";
import type { HassConfig, HassEntity, SensorConfig } from "../../types/index";

export class SensorTarget extends Sensor {
  static override styles = style_sensor_target;

  @property({ type: Object })
  declare stateObjTarget: HassEntity | null;

  constructor() {
    super();
    this.stateObjTarget = null;
  }

  /**
   * Evaluates unit expression safely
   */
  private evaluateUnit(): string {
    if (!this.conf?.unit) {
      return this.stateObj?.attributes?.unit_of_measurement || '';
    }

    const unitConf = this.conf.unit;

    // If it's a simple string
    if (typeof unitConf === 'string') {
      return this.substituteVariables(unitConf, this.getTemplateContext());
    }

    // If it's a dynamic value with expression
    if (typeof unitConf === 'object' && 'expression' in unitConf) {
      const context = {
        ...this.getTemplateContext(),
        ...(unitConf.variables || {})
      };
      return this.substituteVariables(unitConf.expression, context);
    }

    return '';
  }



    protected getTemplateContext(): Record<string, any> {
    return {
      //...super.getTemplateContext(),
      target: this.stateObjTarget?.state,
      targetEntity: this.stateObjTarget,
      //iconv: i18n
      i18n: i18n
    };
  }

  protected _render(style: string | null = null): TemplateResult {
    if (!this.stateObj || !this.stateObjTarget) {
      return html`<div class="sensor error">Missing state</div>`;
    }

    let value: number | string = parseFloat(this.stateObj.state) || this.stateObj.state;
    let target: number | string = parseFloat(this.stateObjTarget.state) || this.stateObjTarget.state;

    if (this.conf?.force_integer) {
      value = Math.floor(Number(value));
      target = Math.floor(Number(target));
    }

    const sensor_class = this.conf?.class || "sensor";
    const unit = this.evaluateUnit();

    return html`
      <div class="${sensor_class}" id="${this.conf?.name || ''}">
        ${value}/${target}<span class="unit">${unit}</span>
      </div>
    `;
  }

  async _click(e: PointerEvent | TouchEvent): Promise<void> {
    console.debug("Click", (e as any).detail, e.timeStamp);
  }

  async _longclick(e: PointerEvent | TouchEvent): Promise<void> {
    console.debug("Long Click");
  }

  async _dblclick(e: PointerEvent | TouchEvent): Promise<void> {
    console.debug("Double click");
  }
}
