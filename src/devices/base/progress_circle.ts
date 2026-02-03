import { html, TemplateResult, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import style_progress_circle from "./progress_circle.styles";
import { MyElement } from "./element";
import type { HassEntity, ProgressConfig } from "../../types/index";

export class ProgressCircle extends MyElement {
  static override styles = [style_progress_circle, css`
    .progress-circle-path {
      stroke: var(--progress-stroke-color);
    }
  `];

  @property({ type: Object })
  override stateObjTarget: HassEntity | null = null;

  @property({ type: Object })
  declare conf?: ProgressConfig;

  constructor() {
    super();
    this.stateObjTarget = null;
  }

  protected override _render(_style: string = ''): TemplateResult {
    if (this.conf?.disabled_if && this.evaluateDisabledCondition(this.conf.disabled_if)) {
      return html`<br />`;
    }
    let value=this.stateObj.state;
    let target=this.stateObjTarget.state;
    let percent=100
    if(parseFloat(value) < parseFloat(target)){
      percent=Math.floor( Number(this.stateObj.state)*100/this.stateObjTarget.state);
    }//if
    let circle_class=this.conf.class;
    let label=this.label;
    
    let style='';
	if('no_value' in this.conf && this.conf.no_value){
	    style="visibility: hidden;";
	};
	let unit="%"
	let fill=percent-2;
	if (fill<0){
	    fill = 0;
	}
	// range 0 to 565 for 200x200
	return html`
              <svg width="100%" height="100%" viewBox="-25 -25 250 250" version="1.1" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg)">
                <circle r="90" cx="100" cy="100" fill="transparent" stroke="rgba(150,150,150,0.6)" stroke-width="16px"></circle>
                <circle r="90" cx="100" cy="100" stroke="rgb(${this.c})" stroke-width="16px" stroke-linecap="round" stroke-dashoffset="${565-percent*565/100}px" fill="transparent" stroke-dasharray="565.48px"></circle>
                <text x="71px" y="115px" fill="#6bdba7" font-size="52px" font-weight="bold" style="${style} transform:rotate(90deg) translate(0px, -196px)">${percent}</text>
</svg>`;
  }

}
