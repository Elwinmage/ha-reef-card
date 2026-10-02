/**
 * Fault banner of an Aqua Medic pump.
 *
 * The integration exposes each motor fault as its own binary sensor. This
 * element gathers the ones that are on into a single blinking line over the
 * picture, the role `last_alert_message` plays on a Red Sea device. It
 * renders nothing while the pump is healthy.
 *
 * Example mapping:
 *   faults: { name: "faults", type: "aquamedic-faults", stateObj: null,
 *             css: {...position of the banner...} }
 */
import { css, html, nothing, TemplateResult } from "lit";

import { MyElement } from "../../../base/element";
import style_animations from "../../../utils/animations.styles";
import type { HassConfig } from "../../../types/index";
import type { AMFault } from "./am_device";

export class AMFaults extends MyElement {
  static override styles = [
    style_animations,
    css`
      .faults {
        box-sizing: border-box;
        width: 100%;
        padding: 2px 6px;
        border-radius: 4px;
        background-color: rgba(240, 200, 200, 0.85);
        color: #c00000;
        font-size: clamp(10px, 3.2cqw, 15px);
        font-weight: bold;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ];

  /** Keys of the faults last drawn, to re-render only on a change. */
  private _signature: string | null = null;

  private _faults(): AMFault[] {
    return (this.device as any)?.active_faults?.() ?? [];
  }

  /**
   * The base setter only follows this element's own entity, and this one
   * has none: it watches the fault sensors of the device instead.
   */
  override set hass(obj: HassConfig) {
    this._hass = obj;
    const signature = this._faults()
      .map((fault) => fault.key)
      .join("|");
    if (signature !== this._signature) {
      this._signature = signature;
      this.requestUpdate();
    }
  }

  /** One fault per line: the banner itself truncates a long list. */
  override get_tooltip(): string {
    return this._faults()
      .map((fault) => fault.name)
      .join("\n");
  }

  protected override _render(_style?: string): TemplateResult | typeof nothing {
    const faults = this._faults();
    if (faults.length === 0) return nothing;
    return html`<div class="faults blink-alert">
      ⚠ ${faults.map((fault) => fault.name).join(" · ")}
    </div>`;
  }
}
