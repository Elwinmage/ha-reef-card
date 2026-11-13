/**
 * Visual editor of the water parameters card (`reef-parameters-card-editor`).
 *
 * The card is followed by chemistry, so the editor lists every chemistry of
 * the catalogue with a checkbox; ticking one binds it to a source, chosen
 * among the compatible entities (a reeftank chemistry sensor — the manual,
 * canonical source — a ReefDose head, or a probe matched by device_class or
 * unit). The view then shows only the ticked chemistries.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { LitElement, css, html, nothing } from "lit";

import i18n from "../translations/myi18n.js";
import {
  CHEMISTRIES,
  DEFAULT_RANGES,
  type FollowedParameter,
  type ParametersConfig,
  compatible_entities,
  normalise,
} from "./reef_parameters";

//----------------------------------------------------------------------------//

export class ReefParametersCardEditor extends LitElement {
  static override styles = css`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 4px;
    }
    .field {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .field span {
      min-width: 120px;
    }
    .field input {
      flex: 1;
    }
    .entry {
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 3px 0;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .follow {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 150px;
    }
    .source {
      flex: 1;
      min-width: 0;
    }
    .bounds {
      display: flex;
      gap: 6px;
      margin-left: 150px;
    }
    .bounds input {
      width: 100%;
      min-width: 0;
    }
    .bounds.note {
      color: var(--secondary-text-color);
      font-size: 12px;
      font-style: italic;
    }
  `;

  static override get properties() {
    return { _config: { state: true } };
  }

  private _config: ParametersConfig = {};
  private _hass: any = null;

  setConfig(config: ParametersConfig): void {
    this._config = { ...(config ?? {}) };
  }

  set hass(hass: any) {
    this._hass = hass;
    this.requestUpdate();
  }

  get hass(): any {
    return this._hass;
  }

  /** The chemistries followed, by chemistry. */
  private _followed(): Map<string, FollowedParameter> {
    const map = new Map<string, FollowedParameter>();
    for (const entry of this._config.parameters ?? []) {
      const followed = normalise(entry);
      if (followed) map.set(followed.chemistry, followed);
    }
    return map;
  }

  /** Save the config and tell Lovelace it changed. */
  private _commit(config: ParametersConfig): void {
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
    this.requestUpdate();
  }

  private _commit_followed(followed: Map<string, FollowedParameter>): void {
    this._commit({ ...this._config, parameters: [...followed.values()] });
  }

  private _set_meta(key: "title" | "days", value: string): void {
    const config = { ...this._config };
    if (key === "days") {
      const n = Number(value);
      if (value === "" || !Number.isFinite(n)) delete config.days;
      else config.days = n;
    } else if (value === "") {
      delete config.title;
    } else {
      config.title = value;
    }
    this._commit(config);
  }

  private _toggle(chemistry: string, on: boolean): void {
    const followed = this._followed();
    if (!on) {
      followed.delete(chemistry);
    } else if (!followed.has(chemistry)) {
      const options = compatible_entities(this._hass, chemistry);
      followed.set(chemistry, { chemistry, source: options[0] ?? "" });
    }
    this._commit_followed(followed);
  }

  private _source(chemistry: string, source: string): void {
    const followed = this._followed();
    const current = followed.get(chemistry);
    if (!current) return;
    followed.set(chemistry, { ...current, source });
    this._commit_followed(followed);
  }

  /** Set one of a chemistry's four bounds (acceptable/desired low & high). */
  private _bound(chemistry: string, index: number, value: string): void {
    const followed = this._followed();
    const current = followed.get(chemistry);
    if (!current) return;
    const base = (current.ranges ??
      DEFAULT_RANGES[chemistry] ?? [0, 0, 0, 0]) as number[];
    const ranges = [...base];
    const n = Number(value);
    if (Number.isFinite(n)) ranges[index] = n;
    followed.set(chemistry, { ...current, ranges });
    this._commit_followed(followed);
  }

  private _name(chemistry: string): string {
    const key = "parameter_" + chemistry;
    const label = i18n._(key);
    return label && label !== key && !label.includes(key)
      ? label
      : chemistry.toUpperCase();
  }

  private _label(entity_id: string): string {
    return String(
      this._hass?.states?.[entity_id]?.attributes?.friendly_name ?? entity_id,
    );
  }

  /**
   * The source picker of a followed chemistry.
   *
   * Home Assistant's own `ha-entity-picker` is used so any sensor can be
   * bound (a probe the card does not recognise, such as a ReefControl pH),
   * the compatible ones only seeding the default. When the frontend does not
   * provide it, a plain select over the sensors is rendered instead, the
   * compatible ones first.
   */
  private _picker(chemistry: string, source: string) {
    if (customElements.get("ha-entity-picker")) {
      return html`<ha-entity-picker
        class="source"
        .hass=${this._hass}
        .value=${source}
        .includeDomains=${["sensor"]}
        allow-custom-entity
        @value-changed=${(e: CustomEvent) =>
          this._source(chemistry, (e.detail?.value ?? "").trim())}
      ></ha-entity-picker>`;
    }
    const compatible = compatible_entities(this._hass, chemistry);
    const sensors = Object.keys(this._hass?.states ?? {}).filter((id) =>
      id.startsWith("sensor."),
    );
    const ids = [
      ...new Set([...compatible, ...sensors, ...(source ? [source] : [])]),
    ];
    return html`<select
      class="source"
      @change=${(e: Event) =>
        this._source(chemistry, (e.target as HTMLSelectElement).value)}
    >
      ${
        ids.length === 0
          ? html`<option value="">${i18n._("parameters_editor_none")}</option>`
          : nothing
      }
      ${ids.map(
        (o) =>
          html`<option value=${o} ?selected=${o === source}>
            ${this._label(o)}
          </option>`,
      )}
    </select>`;
  }

  /**
   * The four editable bounds of a chemistry, or a note when the integration
   * provides them (a ReefControl probe exposes its own `ranges`, which win).
   */
  private _bounds(chemistry: string, followed: Map<string, FollowedParameter>) {
    const current = followed.get(chemistry);
    if (!current) return nothing;
    if (
      Array.isArray(this._hass?.states?.[current.source]?.attributes?.ranges)
    ) {
      return html`<div class="bounds note">
        ${i18n._("parameters_editor_bounds_auto")}
      </div>`;
    }
    const ranges = (current.ranges ??
      DEFAULT_RANGES[chemistry] ??
      []) as number[];
    return html`<div class="bounds">
      ${[0, 1, 2, 3].map(
        (i) =>
          html`<input
            type="number"
            step="any"
            .value=${ranges[i] !== undefined ? String(ranges[i]) : ""}
            @input=${(e: Event) =>
              this._bound(chemistry, i, (e.target as HTMLInputElement).value)}
          />`,
      )}
    </div>`;
  }

  private _row(chemistry: string, followed: Map<string, FollowedParameter>) {
    const on = followed.has(chemistry);
    const source = followed.get(chemistry)?.source ?? "";
    return html`<div class="entry">
      <div class="row">
        <label class="follow">
          <input
            type="checkbox"
            .checked=${on}
            @change=${(e: Event) =>
              this._toggle(chemistry, (e.target as HTMLInputElement).checked)}
          />
          ${this._name(chemistry)}
        </label>
        ${on ? this._picker(chemistry, source) : nothing}
      </div>
      ${on ? this._bounds(chemistry, followed) : nothing}
    </div>`;
  }

  override render() {
    const followed = this._followed();
    return html`<div class="editor">
      <label class="field">
        <span>${i18n._("parameters_title")}</span>
        <input
          type="text"
          .value=${this._config.title ?? ""}
          @input=${(e: Event) =>
            this._set_meta("title", (e.target as HTMLInputElement).value)}
        />
      </label>
      <label class="field">
        <span>days</span>
        <input
          type="number"
          .value=${this._config.days !== undefined ? String(this._config.days) : ""}
          @input=${(e: Event) =>
            this._set_meta("days", (e.target as HTMLInputElement).value)}
        />
      </label>
      ${Object.keys(CHEMISTRIES).map((chemistry) =>
        this._row(chemistry, followed),
      )}
    </div>`;
  }
}

if (!customElements.get("reef-parameters-card-editor"))
  customElements.define(
    "reef-parameters-card-editor",
    ReefParametersCardEditor,
  );
