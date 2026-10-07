/**
 * Base of the ReefLED view elements (sky, beam).
 *
 * These elements read several entities of the device at once (program,
 * lights, mode, moon…) instead of a single stateObj, so the default
 * MyElement change detection — a state string comparison on one entity —
 * does not fit. Each element declares a signature of what it depends on and
 * only re-renders when it changes; a one-minute timer moves the clock-driven
 * parts (sun course, "now" marker) even when no entity changes.
 */
import { MyElement } from "../../../base/element";
import type { HassConfig } from "../../../types/index";

/** Period of the clock refresh, in ms. */
export const RSLED_TICK_MS = 60_000;

export class RSLedElement extends MyElement {
  private _signature: string | null = null;
  private _tick: ReturnType<typeof setInterval> | null = null;

  /**
   * The ReefLED device this element belongs to.
   * Typed loosely: the element only relies on the RSLed helpers.
   */
  protected get led(): any {
    return this.device as any;
  }

  /**
   * Fingerprint of everything the element depends on.
   * @return a string that changes whenever a re-render is needed
   */
  protected signature(): string {
    return this.led?.state_signature?.() ?? "";
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
      this._tick = setInterval(() => this.requestUpdate(), RSLED_TICK_MS);
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
