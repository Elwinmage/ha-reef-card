import { html } from "lit";
import { customElement, state } from "lit/decorators.js";

import {RSDevice} from "./device";

@customElement('redsea-supplements')
// @ts-expect-error - Class extends RSDevice compatibility
export class Supplements extends RSDevice {

  
  private _list: any[] = [];

  constructor() {
    super();
  }

  protected override _render() {
    this._list = [];
    
    if (this.config?.supplements) {
      for (const key in this.config.supplements) {
        const supplement = this.config.supplements[key];
        if (supplement) {
          this._list.push({
            key: key,
            name: supplement.name || key,
            image: supplement.image || '',
            info: supplement.info || ''
          });
        }
      }
    }

    return html`
      <div class="supplements-list">
        ${this._list.map(item => html`
          <div class="supplement-item">
            ${item.image ? html`<img src="${item.image}" alt="${item.name}" />` : ''}
            <div class="supplement-name">${item.name}</div>
            ${item.info ? html`<div class="supplement-info">${item.info}</div>` : ''}
          </div>
        `)}
      </div>
    `;
  }
}
