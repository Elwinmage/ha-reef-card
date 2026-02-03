// @ts-nocheck
import { html, TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import style_progress_bar from "./progress_bar.styles";
import i18n from "../../translations/myi18n";
import { MyElement } from "./element";
import type { HassEntity, ProgressConfig } from "../../types/index";

export class ProgressBar extends MyElement {
  static override styles = style_progress_bar;

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
    if (!this.conf?.label || !this.label) {
      return '';
    }

    const labelConf = this.conf.label;

    // If it's a simple string, use this.label which is already evaluated
    if (typeof labelConf === 'string') {
      return this.substituteVariables(this.label, this.getTemplateContext());
    }

    // If it's a dynamic value with expression
    if (typeof labelConf === 'object' && 'expression' in labelConf) {
      const context = {
        ...this.getTemplateContext(),
        ...(labelConf.variables || {})
      };
      return this.substituteVariables(labelConf.expression, context);
    }

    return this.label;
  }

  /**
   * Extended template context for progress bar
   */
  protected getTemplateContext(): Record<string, any> {
    return {
      //...super.getTemplateContext(),
      target: this.stateObjTarget?.state,
      targetEntity: this.stateObjTarget,
      i18n : i18n
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
    const percent = Math.floor((value * 100) / target);
    if(percent>100){
      console.error("Error for "+this.conf.name+", target "+this.conf.target+" bad value : "+this.stateObjTarget.state);
      return html`<br />`; 
    }
    
    const bar_class = this.conf?.class || 'progress-bar';
    const label = this.evaluateLabel();
    const unit = "%";
    
    let fill = Math.max(0, percent - 1);

    return html`
      <div class="${bar_class}">
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${fill}%; background-color: rgb(${this.c})"></div>
        </div>
        ${label ? html`<span class="progress-label">${label}</span>` : ''}
        <span class="progress-value">${percent}${unit}</span>
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
