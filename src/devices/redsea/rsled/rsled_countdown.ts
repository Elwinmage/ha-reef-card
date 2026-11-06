/**
 * ReefLED manual mode countdown: the time left of a manual mode run for a
 * set time, on the right face of the lamp, under its icons, slanted like
 * the face.
 *
 * It only shows while the lamp is in manual mode with a duration (see
 * RSLed.manual_end), and ticks every second meanwhile. A click opens the
 * duration.
 *
 * Example mapping:
 *   manual_countdown: { name: "manual_countdown", type: "rsled-countdown",
 *                       stateObj: null,
 *                       css: { position: "absolute", left: "67%", top: "35%",
 *                              transform: "translate(-50%,-50%) skewY(19deg)" } }
 */
import { html, TemplateResult } from "lit";

import { RSLedElement } from "./rsled_element";
import { style_rsled_overlay } from "./rsled.styles";

/** Period of the countdown refresh, in ms. */
export const COUNTDOWN_TICK_MS = 1000;

/**
 * Time left, as the countdown shows it.
 * @param ms: time left, in ms (0 once over)
 * @return "m:ss", or "h:mm:ss" from an hour
 */
export function format_countdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export class RSLedCountdown extends RSLedElement {
  static override styles = style_rsled_overlay;

  /** Second timer, running only while the countdown shows. */
  private _countdown_tick: ReturnType<typeof setInterval> | null = null;

  /** End of the manual mode, null when there is nothing to count down. */
  protected end(): number | null {
    return this.led?.manual_end?.() ?? null;
  }

  protected override _render(_style?: string): TemplateResult {
    const end = this.end();
    if (end === null) return html``;
    const text = format_countdown(end - Date.now());
    return html`<span
      class="rsled_countdown clickable"
      title="${text}"
      @click=${this._open_duration}
      ><ha-icon icon="mdi:timer-sand"></ha-icon><span>${text}</span></span
    >`;
  }

  /** Ticks every second while the manual mode has an end. */
  override updated(changed: Map<string, unknown>): void {
    super.updated?.(changed);
    const running = this.isConnected && this.end() !== null;
    if (running && !this._countdown_tick) {
      this._countdown_tick = setInterval(
        () => this.requestUpdate(),
        COUNTDOWN_TICK_MS,
      );
    } else if (!running) {
      this._stop();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stop();
  }

  private _stop(): void {
    if (this._countdown_tick) {
      clearInterval(this._countdown_tick);
      this._countdown_tick = null;
    }
  }

  /** A click opens the duration of the manual mode. */
  private _open_duration = (ev: Event): void => {
    ev.stopPropagation();
    const entity = this.led?.get_entity?.("number.manual_duration");
    if (!entity?.entity_id) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: entity.entity_id },
      }),
    );
  };
}
