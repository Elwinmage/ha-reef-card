/**
 * Base of the ReefWave view elements (flow, label, program).
 *
 * These elements read several entities of the device at once (mode, current
 * wave, program…) instead of a single stateObj, so the default MyElement
 * change detection does not fit. Each element declares a signature of what
 * it depends on and only re-renders when it changes; a one-minute timer
 * moves the clock-driven parts (the "now" marker of the program).
 */
import { MyElement } from "../../../base/element";
import type { HassConfig } from "../../../types/index";

/** Period of the clock refresh, in ms. */
export const RSWAVE_TICK_MS = 60_000;

/** Design space of the full-canvas overlays: the background picture. */
export const RSWAVE_CANVAS = { width: 688, height: 800 };

export class RSWaveElement extends MyElement {
  private _signature: string | null = null;
  private _tick: ReturnType<typeof setInterval> | null = null;

  /**
   * The ReefWave device this element belongs to.
   * Typed loosely: the element only relies on the RSWave helpers.
   */
  protected get wave(): any {
    return this.device as any;
  }

  /**
   * Fingerprint of everything the element depends on.
   * @return a string that changes whenever a re-render is needed
   */
  protected signature(): string {
    return this.wave?.state_signature?.() ?? "";
  }

  override set hass(obj: HassConfig) {
    this._hass = obj;
    const sig = this.signature();
    if (sig !== this._signature) {
      this._signature = sig;
      this.requestUpdate();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this._tick) {
      this._tick = setInterval(() => this.requestUpdate(), RSWAVE_TICK_MS);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._tick) {
      clearInterval(this._tick);
      this._tick = null;
    }
  }
}
