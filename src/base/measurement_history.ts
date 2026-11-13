/**
 * Test results of a ReefDose head, typed in by hand: add one at a given date,
 * correct one, delete one.
 *
 * Reads the `measurements` attribute of the head's `regulation_last_measurement`
 * sensor (the results of the regulated parameter, `{ at, value, source,
 * suspect }`) and writes through the redsea actions `record_measurement`,
 * `update_measurement` and `delete_measurement`. Shown in the
 * `regulation_history` dialog of a head and from the parameters card.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { LitElement, css, html, nothing } from "lit";

import i18n from "../translations/myi18n.js";

//----------------------------------------------------------------------------//

/** One test result, as listed by the integration. */
export interface MeasurementEntry {
  at: string;
  parameter?: string;
  value: number;
  source?: string;
  suspect?: boolean;
}

/**
 * A date as a `datetime-local` input wants it (local time, to the minute).
 * @param date: the date
 * @return "YYYY-MM-DDTHH:MM"
 */
export function to_local_input(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * A `datetime-local` value as the actions take it (local time, no offset:
 * the integration reads it in Home Assistant's time zone).
 * @param value: "YYYY-MM-DDTHH:MM"
 * @return "YYYY-MM-DD HH:MM:00"
 */
export function from_local_input(value: string): string {
  return value.replace("T", " ") + ":00";
}

export class ReefMeasurementHistory extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .add,
    .row {
      display: grid;
      grid-template-columns: 1fr 6.5em auto auto;
      align-items: center;
      gap: 6px;
      padding: 6px 2px;
    }
    .row {
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }
    .row.suspect .value {
      color: var(--warning-color, #ff9800);
    }
    .value {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      text-align: right;
    }
    .source {
      font-size: 11px;
      color: var(--secondary-text-color);
    }
    input {
      font: inherit;
      min-width: 0;
      padding: 3px 4px;
      box-sizing: border-box;
      width: 100%;
    }
    button {
      font: inherit;
      cursor: pointer;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, white);
    }
    button.flat {
      background: none;
      color: var(--primary-text-color);
      padding: 2px 4px;
    }
    button.delete {
      color: var(--error-color, #db4437);
    }
    .error {
      color: var(--error-color, #db4437);
      padding: 4px 2px;
    }
    .empty {
      color: var(--secondary-text-color);
      padding: 8px 2px;
    }
  `;

  static override get properties() {
    return {
      entity_id: { type: String },
      _editing: { state: true },
      _error: { state: true },
      _busy: { state: true },
      _confirming: { state: true },
    };
  }

  /** The `regulation_last_measurement` sensor of the head. */
  entity_id: string = "";
  /** `at` of the result being corrected, "" when none. */
  _editing: string = "";
  _error: string = "";
  _busy: boolean = false;
  /** `at` of the result whose delete awaits a second click, "" when none. */
  _confirming: string = "";

  private _hass: any = null;
  // Results last drawn: a state update with the same ones draws nothing
  private _signature: string = "";

  set hass(hass: any) {
    this._hass = hass;
    const signature = JSON.stringify(this._state()?.attributes?.measurements);
    if (signature !== this._signature) {
      this._signature = signature;
      this.requestUpdate();
    }
  }

  get hass(): any {
    return this._hass;
  }

  private _state(): any {
    return this._hass?.states?.[this.entity_id];
  }

  /** Results of the regulated parameter, newest first. */
  entries(): MeasurementEntry[] {
    const raw = this._state()?.attributes?.measurements;
    if (!Array.isArray(raw)) return [];
    return [...raw]
      .filter((m) => m && typeof m.at === "string")
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  }

  /** Device of the head, the target of the actions. */
  device_id(): string | undefined {
    return this._hass?.entities?.[this.entity_id]?.device_id ?? undefined;
  }

  /**
   * Whether the results belong to the reeftank integration (the aquarium's
   * own chemistry sensors) rather than a redsea ReefDose head. Reeftank is
   * the canonical home of a test but only records them: it has no edit or
   * delete, so those are hidden for it.
   */
  reeftank(): boolean {
    return this._hass?.entities?.[this.entity_id]?.platform === "reeftank";
  }

  /**
   * Call the integration's action and report its error. Routes to redsea
   * (by the head's device) or to reeftank (by its aquarium and chemistry).
   * @param service: the action
   * @param data: its data
   * @return true when the integration accepted it
   */
  async call(service: string, data: Record<string, unknown>): Promise<boolean> {
    if (typeof this._hass?.callWS !== "function") {
      this._error = i18n._("measurement_history_unavailable");
      return false;
    }
    const attributes = this._state()?.attributes ?? {};
    let domain: string;
    let service_data: Record<string, unknown>;
    let with_response: boolean;
    if (this.reeftank()) {
      const aquarium = attributes.aquarium;
      const parameter = attributes.reef_parameter;
      if (!aquarium || !parameter) {
        this._error = i18n._("measurement_history_unavailable");
        return false;
      }
      domain = "reeftank";
      service_data = { aquarium, parameter, ...data };
      with_response = false;
    } else {
      const device_id = this.device_id();
      if (!device_id) {
        this._error = i18n._("measurement_history_unavailable");
        return false;
      }
      domain = "redsea";
      service_data = { device_id, ...data };
      with_response = true;
    }
    this._busy = true;
    try {
      const answer = await this._hass.callWS({
        type: "call_service",
        domain,
        service,
        service_data,
        ...(with_response ? { return_response: true } : {}),
      });
      const response = answer?.response ?? {};
      if (response.ok === false) {
        this._error = String(response.error ?? "");
        return false;
      }
      this._error = "";
      return true;
    } catch (err: any) {
      this._error = String(err?.message ?? err);
      return false;
    } finally {
      this._busy = false;
    }
  }

  private _input(id: string): HTMLInputElement | null {
    return this.shadowRoot?.querySelector("#" + id) as HTMLInputElement | null;
  }

  /** Record the result typed in the add row. */
  async add(): Promise<void> {
    const value = Number(this._input("new-value")?.value);
    const at = this._input("new-at")?.value;
    if (!Number.isFinite(value) || !at) {
      this._error = i18n._("measurement_history_invalid");
      return;
    }
    const recorded = this.reeftank()
      ? await this.call("water_test", { value, at: from_local_input(at) })
      : await this.call("record_measurement", {
          value,
          measured_at: from_local_input(at),
        });
    if (recorded) {
      const field = this._input("new-value");
      if (field) field.value = "";
    }
  }

  /** Save the correction of a result. */
  async save(entry: MeasurementEntry): Promise<void> {
    const value = Number(this._input("edit-value")?.value);
    const at = this._input("edit-at")?.value;
    if (!Number.isFinite(value) || !at) {
      this._error = i18n._("measurement_history_invalid");
      return;
    }
    const data: Record<string, unknown> = { measured_at: entry.at, value };
    if (at !== to_local_input(new Date(entry.at))) {
      data.new_measured_at = from_local_input(at);
    }
    if (entry.parameter) data.parameter = entry.parameter;
    if (await this.call("update_measurement", data)) {
      this._editing = "";
    }
  }

  /** Delete a result: a first click asks, a second one deletes. */
  async delete_entry(entry: MeasurementEntry): Promise<void> {
    if (this._confirming !== entry.at) {
      this._confirming = entry.at;
      return;
    }
    this._confirming = "";
    const data: Record<string, unknown> = { measured_at: entry.at };
    if (entry.parameter) data.parameter = entry.parameter;
    await this.call("delete_measurement", data);
  }

  private _when(at: string): string {
    const lang = this._hass?.locale?.language ?? this._hass?.language;
    try {
      return new Date(at).toLocaleString(lang, {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return at;
    }
  }

  private _render_entry(entry: MeasurementEntry, unit: string) {
    if (this._editing === entry.at) {
      return html`<div class="row editing">
        <input
          id="edit-at"
          type="datetime-local"
          .value=${to_local_input(new Date(entry.at))}
        />
        <input
          id="edit-value"
          type="number"
          step="any"
          .value=${String(entry.value)}
        />
        <button ?disabled=${this._busy} @click=${() => this.save(entry)}>
          ${i18n._("measurement_history_save")}
        </button>
        <button class="flat" @click=${() => (this._editing = "")}>✕</button>
      </div>`;
    }
    const source =
      entry.source && entry.source !== "manual" ? entry.source : "";
    return html`<div class="row ${entry.suspect ? "suspect" : ""}">
      <div>
        ${this._when(entry.at)}
        ${source ? html`<div class="source">${source}</div>` : nothing}
      </div>
      <div
        class="value"
        title=${entry.suspect ? i18n._("measurement_suspect") : ""}
      >
        ${entry.suspect ? "⚠ " : ""}${entry.value} ${unit}
      </div>
      ${
        this.reeftank()
          ? nothing
          : html`<button
                class="flat"
                title=${i18n._("measurement_history_edit")}
                @click=${() => (this._editing = entry.at)}
              >
                ✎
              </button>
              <button
                class="flat delete"
                title=${i18n._("measurement_history_delete")}
                ?disabled=${this._busy}
                @click=${() => this.delete_entry(entry)}
              >
                ${
                  this._confirming === entry.at
                    ? i18n._("measurement_history_confirm")
                    : "🗑"
                }
              </button>`
      }
    </div>`;
  }

  override render() {
    const unit = String(this._state()?.attributes?.unit_of_measurement ?? "");
    const entries = this.entries();
    return html`
      <div class="add">
        <input
          id="new-at"
          type="datetime-local"
          .value=${to_local_input(new Date())}
        />
        <input id="new-value" type="number" step="any" placeholder=${unit} />
        <button ?disabled=${this._busy} @click=${() => this.add()}>
          ${i18n._("measurement_history_add")}
        </button>
        <span></span>
      </div>
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      ${
        entries.length
          ? entries.map((entry) => this._render_entry(entry, unit))
          : html`<div class="empty">
              ${i18n._("measurement_history_empty")}
            </div>`
      }
    `;
  }
}

if (!customElements.get("reef-measurement-history"))
  customElements.define("reef-measurement-history", ReefMeasurementHistory);
