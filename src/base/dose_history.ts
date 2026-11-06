/**
 * History of the doses of a ReefDose head.
 *
 * Shown in the `dose_history` dialog (see rsdose.dialogs.ts), opened from the
 * configuration dialog of a head while its doser is in Poseidon mode: only
 * then does the doser tell its doses (dosing-log). The entries come from the
 * integration's `redsea.get_doses` action; the view reloads them when the
 * `poseidon_last_dose` sensor of the head changes while it is open.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { LitElement, html, nothing } from "lit";

import i18n from "../translations/myi18n.js";
import style_dose_history from "./dose_history.styles";
import { format_day, format_time } from "./messages_format";
import style_messages_history from "./messages_history.styles";
import { PERIODS } from "./messages_history";

//----------------------------------------------------------------------------//

/** Sensor of the head telling its last dose. */
export const LAST_DOSE = "poseidon_last_dose";

/** One dose, as sent by the integration. */
export interface DoseEntry {
  head: number;
  supplement?: string | null;
  brand?: string | null;
  dose_type?: string | null;
  volume?: number | null;
  started_at?: string | null;
  ended_at: string;
  duration_s?: number | null;
  /** Start and duration estimated from the flow of the head */
  start_estimated?: boolean;
}

export class RSDoseHistory extends LitElement {
  static override styles = [style_messages_history, style_dose_history];

  static override get properties() {
    return {
      period: { state: true },
      entries: { state: true },
      loading: { state: true },
      error: { state: true },
      retention: { state: true },
    };
  }

  /** The dose head the history is of (an RSDevice). */
  device: any = null;
  /** Number of the head. */
  head: number = 0;
  /** Period shown, in days (0: everything kept). */
  period: number = 7;
  entries: DoseEntry[] = [];
  loading: boolean = false;
  error: string = "";
  /** Retention of the integration, in days (from the last answer). */
  retention: number | null = null;

  private _hass: any = null;
  // State of the last dose sensor at the last load
  private _signature: string | null = null;
  // Rank of the last request: an older answer never replaces a newer one
  private _request: number = 0;

  /**
   * Home Assistant object. A new dose reloads the list.
   */
  set hass(hass: any) {
    this._hass = hass;
    const signature = this._sensor_state();
    if (signature !== this._signature) {
      this._signature = signature;
      void this.load();
    }
  }

  get hass(): any {
    return this._hass;
  }

  /** Registry entry of the last dose sensor of the head. */
  private _sensor(): any {
    return this.device?.entities?.[LAST_DOSE] ?? null;
  }

  /** State of the last dose sensor (its last dose). */
  private _sensor_state(): string {
    const id = this._sensor()?.entity_id;
    return String((id && this._hass?.states?.[id]?.state) ?? "");
  }

  /**
   * Device of the head in Home Assistant (the action's device_id).
   */
  private _device_id(): string | undefined {
    const sensor = this._sensor();
    return (
      this._hass?.entities?.[sensor?.entity_id]?.device_id ??
      sensor?.device_id ??
      undefined
    );
  }

  /**
   * Load the doses of the current period.
   */
  async load(): Promise<void> {
    const hass = this._hass;
    const device_id = this._device_id();
    if (!device_id || typeof hass?.callWS !== "function") {
      this.error = i18n._("dose_history_unavailable");
      return;
    }
    const request = ++this._request;
    this.loading = true;
    const service_data: Record<string, unknown> = { device_id };
    if (this.head > 0) service_data.head = this.head;
    if (this.period > 0) service_data.days = this.period;
    try {
      const answer = await hass.callWS({
        type: "call_service",
        domain: "redsea",
        service: "get_doses",
        service_data,
        return_response: true,
      });
      if (request !== this._request) return;
      const response = answer?.response ?? {};
      if (response.error) {
        this.error = String(response.error);
        this.entries = [];
      } else {
        this.error = "";
        this.entries = Array.isArray(response.doses)
          ? (response.doses as DoseEntry[])
          : [];
        this.retention =
          typeof response.retention_days === "number"
            ? response.retention_days
            : null;
      }
    } catch (err: any) {
      if (request !== this._request) return;
      this.error = String(err?.message ?? err);
      this.entries = [];
    } finally {
      if (request === this._request) this.loading = false;
    }
  }

  /**
   * Show another period.
   * @param e: change event of the period select
   */
  private _set_period(e: Event): void {
    const value = Number((e.target as HTMLSelectElement).value);
    if (Number.isNaN(value) || value === this.period) return;
    this.period = value;
    void this.load();
  }

  /**
   * Label of a period.
   * @param days: the period, 0 for everything kept
   */
  private _period_label(days: number): string {
    if (days === 0) return i18n._("messages_history_all_kept");
    if (days === 1) return i18n._("messages_history_24h");
    return i18n._("messages_history_days", { days });
  }

  /**
   * A volume in mL.
   * @param volume: the volume, may be missing
   */
  private _volume(volume: number | null | undefined): string {
    return typeof volume === "number" ? `${volume.toFixed(2)} mL` : "–";
  }

  private _render_dose(dose: DoseEntry) {
    const manual = dose.dose_type === "manual";
    const end = format_time(dose.ended_at, this._hass);
    // Not in the dosing queue (the dose at midnight, a manual one from the
    // app): start and duration estimated from the flow of the head
    const approx = dose.start_estimated ? "≈ " : "";
    const start = dose.started_at
      ? approx + format_time(dose.started_at, this._hass)
      : "";
    // The rest of a lowered daily dose, offered by the app
    const kind = manual
      ? i18n._("dose_history_manual")
      : dose.dose_type === "compensation"
        ? i18n._("dose_history_compensation")
        : i18n._("dose_history_scheduled");
    const duration =
      typeof dose.duration_s === "number"
        ? approx +
          i18n._("dose_history_duration", {
            seconds: Math.round(dose.duration_s),
          })
        : i18n._("dose_history_no_start");
    return html`
      <li class="dose ${manual ? "manual" : "scheduled"}">
        <span class="kind" aria-hidden="true">${manual ? "✋" : "⏱"}</span>
        <span class="when">
          ${start
            ? html`<time
                  datetime="${dose.started_at}"
                  title="${dose.start_estimated
                    ? i18n._("dose_history_estimated")
                    : ""}"
                  >${start}</time
                >
                → `
            : nothing}
          <time datetime="${dose.ended_at}">${end}</time>
        </span>
        <span class="volume">${this._volume(dose.volume)}</span>
        <span class="detail">${kind} · ${duration}</span>
      </li>
    `;
  }

  /** The doses, a header before the first one of each day. */
  private _render_list() {
    const items: unknown[] = [];
    let day = "";
    for (const dose of this.entries) {
      const this_day = format_day(dose.ended_at, this._hass);
      if (this_day !== day) {
        day = this_day;
        items.push(html`<li class="day">${day}</li>`);
      }
      items.push(this._render_dose(dose));
    }
    return html`<ul class="list">
      ${items}
    </ul>`;
  }

  override render() {
    const total = this.entries.reduce(
      (sum, d) => sum + (typeof d.volume === "number" ? d.volume : 0),
      0,
    );
    return html`
      <div class="root">
        <div class="toolbar">
          <select
            class="period"
            aria-label="${i18n._("messages_history_period")}"
            @change=${(e: Event) => this._set_period(e)}
          >
            ${PERIODS.map(
              (d) =>
                html`<option value="${d}" ?selected=${d === this.period}>
                  ${this._period_label(d)}
                </option>`,
            )}
          </select>
          ${this.entries.length
            ? html`<span class="summary"
                >${i18n._("dose_history_total", {
                  volume: total.toFixed(2),
                })}</span
              >`
            : nothing}
          <button
            class="refresh"
            title="${i18n._("messages_history_refresh")}"
            aria-label="${i18n._("messages_history_refresh")}"
            ?disabled=${this.loading}
            @click=${() => void this.load()}
          >
            ⟳
          </button>
        </div>
        ${this.error
          ? html`<div class="error">${this.error}</div>`
          : this.entries.length === 0
            ? html`<div class="empty">
                ${this.loading
                  ? i18n._("messages_history_loading")
                  : i18n._("dose_history_empty")}
              </div>`
            : this._render_list()}
        <div class="footer">
          ${i18n._("dose_history_count", { count: this.entries.length })}
          ${this.retention
            ? html` ·
              ${i18n._("messages_history_retention", {
                days: this.retention,
              })}`
            : nothing}
        </div>
      </div>
    `;
  }
}

if (!customElements.get("redsea-dose-history"))
  customElements.define("redsea-dose-history", RSDoseHistory);
