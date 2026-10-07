/**
 * Vertical slider driving one attribute of a light entity: its intensity
 * (brightness) or its colour temperature.
 *
 * The track shows what the value means: dark to light for the intensity,
 * warm white to deep blue for the colour. Dragging previews the value in the
 * thumb; releasing sends a single light.turn_on (light.turn_off at 0 %).
 *
 * Example mapping:
 *   intensity_slider: {
 *     name: "light.kelvin_intensity",
 *     type: "rsled-slider",
 *     attribute: "brightness",       // or "color_temp_kelvin"
 *     icon: "mdi:brightness-6",
 *     step: 1,                       // in % or in K
 *     track: "white",                // optional: channel colour of the
 *                                    // track (white, blue, moon)
 *     css: { position: "absolute", top: "...", left: "...", ... },
 *   }
 */
import { html, TemplateResult } from "lit";

import { MyElement } from "../../../base/element";
import { style_rsled_slider } from "./rsled.styles";
import style_animations from "../../../utils/animations.styles";
import type { HassConfig } from "../../../types/index";
import {
  CHANNEL_RGB,
  Channel,
  brightness_pct,
  g2_kelvin,
  kelvin_rgb,
  rgb_css,
} from "./rsled_program";

export { g2_kelvin };

/** G1 colour temperature bounds, used when the entity does not give any. */
export const KELVIN_MIN = 9000;
export const KELVIN_MAX = 23000;

export class RSLedSlider extends MyElement {
  static override styles = [style_animations, style_rsled_slider];

  /** Value shown while dragging, null otherwise */
  private _drag_value: number | null = null;

  /** Last colour temperature seen: an off light does not report any */
  private _last_kelvin: number | null = null;

  private get _is_kelvin(): boolean {
    return (this.conf as any)?.attribute === "color_temp_kelvin";
  }

  /** Bounds of the slider. */
  range(): { min: number; max: number; step: number } {
    const attrs = this.stateObj?.attributes ?? {};
    const conf: any = this.conf ?? {};
    if (this._is_kelvin) {
      // The lamp's bounds: those of every lamp of its group
      const lamp = (this.device as any)?.kelvin_range?.() ?? {};
      return {
        min: Number(
          conf.min ?? lamp.min ?? attrs.min_color_temp_kelvin ?? KELVIN_MIN,
        ),
        max: Number(
          conf.max ?? lamp.max ?? attrs.max_color_temp_kelvin ?? KELVIN_MAX,
        ),
        step: Number(conf.step ?? 100),
      };
    }
    return {
      min: Number(conf.min ?? 0),
      max: Number(conf.max ?? 100),
      step: Number(conf.step ?? 1),
    };
  }

  /** Current value from the entity, in % or in K. */
  value(): number {
    const attrs = this.stateObj?.attributes ?? {};
    if (this._is_kelvin) {
      const k = Number(attrs.color_temp_kelvin);
      if (Number.isFinite(k) && k > 0) {
        this._last_kelvin = k;
        return k;
      }
      const { min, max } = this.range();
      return this._last_kelvin ?? Math.round((min + max) / 2);
    }
    if (this.stateObj?.state !== "on") return 0;
    return brightness_pct(attrs.brightness);
  }

  /** Track background for the current kind of slider. */
  track_background(): string {
    if (this._is_kelvin) {
      const { min, max } = this.range();
      const stops = [0, 0.25, 0.5, 0.75, 1].map(
        (f) =>
          `${rgb_css(kelvin_rgb(min + f * (max - min)))} ${Math.round(f * 100)}%`,
      );
      return `linear-gradient(to top, ${stops.join(", ")})`;
    }
    // A single channel shows its own colour, the overall intensity the
    // colour currently set
    const track = (this.conf as any)?.track as Channel | undefined;
    const top = rgb_css(
      track && track in CHANNEL_RGB
        ? CHANNEL_RGB[track]
        : kelvin_rgb(this._current_kelvin()),
    );
    // White from black would read as "off" most of the way: start grey
    const bottom = track === "white" ? "#9a9a9a" : "#111111";
    return `linear-gradient(to top, ${bottom} 0%, ${top} 100%)`;
  }

  /** Colour temperature the lamp is set to, for the intensity track. */
  private _current_kelvin(): number {
    const k = Number(this.stateObj?.attributes?.color_temp_kelvin);
    return Number.isFinite(k) && k > 0 ? k : (this._last_kelvin ?? 15000);
  }

  /** Whether the user may move the slider. */
  private _enabled(): boolean {
    return !!this.stateObj && (this.device as any)?.masterOn !== false;
  }

  override set hass(obj: HassConfig) {
    this._hass = obj;
    if (!this.stateObj) return;
    const so = obj.states[this.stateObj.entity_id];
    // Brightness and colour change while the state stays "on": compare the
    // whole object, which Home Assistant replaces on every change.
    if (so && so !== this.stateObj && this._drag_value === null) {
      this.stateObj = so;
      this.requestUpdate();
    }
  }

  protected override _render(_style?: string): TemplateResult {
    if (!this.stateObj) return html``;
    const { min, max } = this.range();
    const value = this._drag_value ?? this.value();
    const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
    const clamped = Math.max(0, Math.min(100, pct));
    const label = this._is_kelvin
      ? `${(value / 1000).toFixed(1)}K`
      : `${Math.round(value)}%`;
    const icon = (this.conf as any)?.icon;
    return html`<div
      class="vslider ${this._enabled() ? "" : "disabled"}"
      @pointerdown=${this._on_pointer_down}
    >
      ${icon ? html`<ha-icon class="vicon" .icon=${icon}></ha-icon>` : ""}
      <div class="vtrack" style="background:${this.track_background()}">
        ${this._is_kelvin
          ? ""
          : html`<div
              class="vtrack_mask"
              style="height:${100 - clamped}%"
            ></div>`}
      </div>
      <div class="vthumb" style="bottom:${clamped}%">${label}</div>
    </div>`;
  }

  /**
   * Value under a pointer, snapped to the step.
   * @param client_y: the pointer's vertical position
   * @param rect: the bounding box of the slider
   */
  value_at(client_y: number, rect: { top: number; height: number }): number {
    const { min, max, step } = this.range();
    const ratio =
      rect.height > 0
        ? 1 - Math.max(0, Math.min(1, (client_y - rect.top) / rect.height))
        : 0;
    const raw = min + ratio * (max - min);
    // A G2, or a lamp grouped with one: the G2's steps
    const snapped =
      this._is_kelvin && (this.device as any)?.kelvin_g2_scale?.()
        ? g2_kelvin(raw)
        : Math.round(raw / step) * step;
    return Math.max(min, Math.min(max, snapped));
  }

  private _on_pointer_down = (ev: PointerEvent): void => {
    if (!this._enabled()) return;
    ev.preventDefault();
    ev.stopPropagation();
    const target = ev.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    try {
      target.setPointerCapture(ev.pointerId);
    } catch {
      /* not supported (tests) */
    }
    const move = (e: PointerEvent) => {
      this._drag_value = this.value_at(e.clientY, rect);
      this.requestUpdate();
    };
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
      this.commit();
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
    move(ev);
  };

  /** Send the dragged value to Home Assistant. */
  commit(): void {
    const value = this._drag_value;
    this._drag_value = null;
    if (value === null || !this._hass || !this.stateObj) {
      this.requestUpdate();
      return;
    }
    const entity_id = this.stateObj.entity_id;
    if (this._is_kelvin) {
      this._last_kelvin = value;
      this._hass.callService("light", "turn_on", {
        entity_id,
        color_temp_kelvin: value,
      });
    } else if (value <= 0) {
      this._hass.callService("light", "turn_off", { entity_id });
    } else {
      this._hass.callService("light", "turn_on", {
        entity_id,
        brightness_pct: value,
      });
    }
    this.requestUpdate();
  }
}
