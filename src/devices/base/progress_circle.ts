// @ts-nocheck
import { html, TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import style_progress_circle from "./progress_circle.styles";
import i18n from "../../translations/myi18n";
import { off_color } from "../../common";
import { MyElement } from "./element";
import type { HassEntity, ProgressConfig } from "../../types/index";

export class ProgressCircle extends MyElement {
  static override styles = style_progress_circle;

  @property({ type: Object })
  declare stateObjTarget: HassEntity | null;

  @property({ type: Object })
  declare conf?: ProgressConfig;

  constructor() {
    super();
    this.stateObjTarget = null;
  }

  /**
   * Evaluates label expression safely
   */
  private evaluateLabel(): string {
    if (!this.conf?.label) {
      return '';
    }

    const labelConf = this.conf.label;

    // If it's a simple string
    if (typeof labelConf === 'string') {
      return this.substituteVariables(labelConf, this.getTemplateContext());
    }

    // If it's a dynamic value with expression
    if (typeof labelConf === 'object' && 'expression' in labelConf) {
      const context = {
        ...this.getTemplateContext(),
        ...(labelConf.variables || {})
      };
      return this.substituteVariables(labelConf.expression, context);
    }

    return '';
  }

  /**
   * Extended template context for progress circle
   */
  protected getTemplateContext(): Record<string, any> {
    return {
      ...super.getTemplateContext(),
      target: this.stateObjTarget?.state,
      targetEntity: this.stateObjTarget,
      //iconv: i18n
      i18n:i18n
    };
  }

  protected _render(style: string = ''): TemplateResult {
    // Check disabled condition
    if (this.conf?.disabled_if && this.evaluateDisabledCondition(this.conf.disabled_if)) {
      return html`<br />`;
    }

    if (!this.stateObj || !this.stateObjTarget) {
      return html`<div class="error">Missing state</div>`;
    }

    const value = parseFloat(this.stateObj.state) || 0;
    const target = parseFloat(this.stateObjTarget.state) || 1;
    
    let percent = 100;
    if (value < target) {
      percent = Math.floor((value * 100) / target);
    }

    const circle_class = this.conf?.class || 'progress-circle';
    const label = this.evaluateLabel();
    
    let valueStyle = '';
    if (this.conf?.no_value) {
      valueStyle = "visibility: hidden;";
    }

    const fill = Math.max(0, percent - 2);
    const strokeDashoffset = 565 - (percent * 565 / 100);

    return html`
      <svg 
        width="100%" 
        height="100%" 
        viewBox="-25 -25 250 250" 
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg" 
        style="transform:rotate(-90deg)"
      >
        <circle 
          r="90" 
          cx="100" 
          cy="100" 
          fill="transparent" 
          stroke="rgba(150,150,150,0.6)" 
          stroke-width="16px"
        ></circle>
        <circle 
          r="90" 
          cx="100" 
          cy="100" 
          stroke="rgb(${this.c})" 
          stroke-width="16px" 
          stroke-linecap="round" 
          stroke-dashoffset="${strokeDashoffset}px" 
          fill="transparent" 
          stroke-dasharray="565.48px"
        ></circle>
        <text 
          x="71px" 
          y="115px" 
          fill="#6bdba7" 
          font-size="52px" 
          font-weight="bold" 
          style="${valueStyle} transform:rotate(90deg) translate(0px, -196px)"
        >
          ${percent}
        </text>
      </svg>
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
