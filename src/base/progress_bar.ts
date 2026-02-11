import { html, TemplateResult, css } from "lit";
import { property } from "lit/decorators.js";
import style_progress_bar from "./progress_bar.styles";
import { MyElement } from "./element";
import type { ProgressConfig, StateObject } from "../types/index";

export class ProgressBar extends MyElement {
  static override styles = [
    style_progress_bar,
    css`
      .progress-bar-fill {
        background-color: var(--progress-fill-color);
      }
    `,
  ];

  @property({ type: Object })
  override stateObjTarget: StateObject | null = null;

  @property({ type: Object })
  declare conf?: ProgressConfig;

  constructor() {
    super();
    this.stateObjTarget = null;
  }

  protected override _render(_style: string = ""): TemplateResult {
    // Check disabled condition
    /*    console.debug("DISABLED?",this.conf.disabled_if);
    if (this.conf?.disabled_if && this.evaluateDisabledCondition(this.conf.disabled_if)) {
      return html`<br />`;
    }
*/
    if (!this.stateObj || !this.stateObjTarget) {
      return html`<div class="error">Missing state</div>`;
    }

    const value = parseFloat(this.stateObj.state) || 0;
    const target = parseFloat(this.stateObjTarget.state) || 1;
    const percent = Math.floor((value * 100) / target);
    if (percent > 100) {
      console.error(
        `[ProgressBar - ${this.conf.name}] bad percent value  : ${percent}=${value}*100/${target}`,
      );
    }

    const bar_class = this.conf?.class || "progress-bar";
    let label = this.label || "";
    if (typeof this.conf.label !== "boolean") {
      label = this.evaluate(this.conf.label) || "";
    }
    const unit = "%";

    const fill = Math.max(0, percent - 1);
    const fillColor = `rgb(${this.c})`;

    return html`
      <div class="${bar_class}">
        <div class="progress-bar-container">
          <div
            class="progress-bar-fill"
            style="width: ${fill}%; --progress-fill-color: ${fillColor}"
          ></div>
        </div>
        ${label ? html`<span class="progress-label">${label}</span>` : ""}
        <span class="progress-value">${percent}${unit}</span>
      </div>
    `;
  }
}
