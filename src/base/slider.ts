/**
 * Common slider for number entities — custom implementation with value
 * displayed inside the thumb.
 *
 * Example mapping:
 *   overskimming: {
 *     name: "overskimming_threshold",
 *     type: "common-slider",
 *     min: 0,                          // optional, from entity attributes if omitted
 *     max: 100,                        // optional, from entity attributes if omitted
 *     step: 1,                         // optional, from entity attributes if omitted
 *     unit: "%",                       // optional, override entity unit
 *     slider_color: "255,0,0",         // optional, thumb & track color R,G,B
 *     css: {
 *       position: "absolute",
 *       top: "...", left: "...",
 *       width: "60%", height: "30px",
 *     },
 *   }
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, TemplateResult, CSSResultGroup } from "lit";
import { property } from "lit/decorators.js";

import { MyElement } from "./element";
import style_slider from "./slider.styles";
import style_animations from "../utils/animations.styles";

import type { BaseElementConfig } from "../types/index";

//----------------------------------------------------------------------------//
//   Types
//----------------------------------------------------------------------------//

export interface SliderConfig extends BaseElementConfig {
  name: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string; // override entity unit
  slider_color?: string; // "R,G,B"
}

//----------------------------------------------------------------------------//
//   Slider element
//----------------------------------------------------------------------------//

export class Slider extends MyElement {
  static override styles: CSSResultGroup = [style_animations, style_slider];

  @property({ type: Object, attribute: false })
  declare conf?: SliderConfig;

  /** Current displayed value (tracks drag state) */
  private _displayValue: number | null = null;

  /** Debounce timer for service calls */
  private _debounce: ReturnType<typeof setTimeout> | null = null;

  /** Whether the user is currently dragging */
  private _dragging = false;

  constructor() {
    super();
  }

  // ------------------------------------------------------------------
  //  Render
  // ------------------------------------------------------------------

  protected override _render(_style?: string): TemplateResult {
    if (!this.conf || !this.stateObj) {
      return html``;
    }

    const attrs = this.stateObj.attributes ?? {};
    const min = this.conf.min ?? attrs.min ?? 0;
    const max = this.conf.max ?? attrs.max ?? 100;
    const value = this._displayValue ?? (Number(this.stateObj.state) || 0);
    const unit = this.conf.unit ?? attrs.unit_of_measurement ?? "";
    const pct = ((value - min) / (max - min)) * 100;

    // Thumb color via CSS variable
    const colorStyle = this.conf.slider_color
      ? `--slider-color: rgb(${this.conf.slider_color})`
      : "";

    return html`
      <div
        class="slider-container"
        style="${colorStyle}"
        @pointerdown="${this._onPointerDown}"
      >
        <div class="track">
          <div class="track-fill" style="width: ${pct}%"></div>
          <div class="thumb" style="left: ${pct}%">
            <span class="thumb-label">${Math.round(value)}${unit}</span>
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  //  Pointer-based drag handling (mouse + touch)
  // ------------------------------------------------------------------

  private _onPointerDown = (ev: PointerEvent): void => {
    ev.preventDefault();
    this._dragging = true;
    const container = ev.currentTarget as HTMLElement;
    container.setPointerCapture(ev.pointerId);
    this._updateFromPointer(ev);

    let cleaned = false;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      this._dragging = false;
      try {
        container.releasePointerCapture(ev.pointerId);
      } catch (_) {
        /* already released */
      }
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointercancel", onUp);
      this._commitValue();
    };

    const onMove = (e: PointerEvent) => {
      if (this._dragging) this._updateFromPointer(e);
    };

    const onUp = () => cleanup();

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerup", onUp);
    container.addEventListener("pointercancel", onUp);
  };

  private _updateFromPointer(ev: PointerEvent): void {
    const track = this.shadowRoot?.querySelector(".track") as HTMLElement;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const attrs = this.stateObj?.attributes ?? {};
    const min = this.conf?.min ?? attrs.min ?? 0;
    const max = this.conf?.max ?? attrs.max ?? 100;
    const step = this.conf?.step ?? attrs.step ?? 1;

    // Compute ratio clamped to [0, 1]
    let ratio = (ev.clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio));

    // Snap to step
    let value = min + ratio * (max - min);
    value = Math.round(value / step) * step;
    value = Math.max(min, Math.min(max, value));

    this._displayValue = value;
    this.requestUpdate();
  }

  private _commitValue(): void {
    if (this._displayValue === null || !this._hass || !this.stateObj) return;

    const value = this._displayValue;
    this._displayValue = null;

    if (this._debounce) clearTimeout(this._debounce);
    this._debounce = setTimeout(() => {
      this._hass?.callService("number", "set_value", {
        entity_id: this.stateObj!.entity_id,
        value,
      });
    }, 150);
  }
}
