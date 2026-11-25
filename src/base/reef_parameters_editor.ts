/**
 * Visual editor of the water parameters card (`reef-parameters-card-editor`).
 *
 * The card is followed by chemistry, so the editor lists every chemistry of
 * the catalogue with a checkbox; ticking one binds it to a source, chosen
 * among the compatible entities (a reeftank chemistry sensor — the manual,
 * canonical source — a ReefDose head, or a probe matched by device_class or
 * unit). The view then shows only the ticked chemistries.
 *
 * An aquarium can be picked first: the chemistries it backs are then ticked
 * by themselves and only what differs from them is written to the
 * configuration (another source, other bounds, or an unticked chemistry as
 * `hide`), so a chemistry tested later turns up without touching the card.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { LitElement, css, html, nothing } from "lit";

import i18n from "../translations/myi18n.js";
import {
  CHEMISTRIES,
  DEFAULT_RANGES,
  load_catalog,
  type FollowedParameter,
  type ParameterOverride,
  type ParametersConfig,
  aquariums,
  auto_follow,
  compatible_entities,
  resolve_parameters,
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
    const first = !this._hass;
    this._hass = hass;
    if (first && hass)
      void load_catalog(hass).then((changed) => {
        if (changed) this.requestUpdate();
      });
    this.requestUpdate();
  }

  get hass(): any {
    return this._hass;
  }

  /** The chemistries followed, by chemistry: what the card itself shows. */
  private _followed(): Map<string, FollowedParameter> {
    const map = new Map<string, FollowedParameter>();
    for (const followed of resolve_parameters(this._hass, this._config))
      map.set(followed.chemistry, followed);
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

  /**
   * Save the followed chemistries.
   *
   * Under an aquarium, only what differs from what the aquarium already
   * gives is written: an entry that was changed or added, and a `hide` for
   * one that was unticked. Without an aquarium the whole list is written, as
   * it always was.
   */
  private _commit_followed(followed: Map<string, FollowedParameter>): void {
    const aquarium = this._config.aquarium;
    if (!aquarium) {
      this._commit({ ...this._config, parameters: [...followed.values()] });
      return;
    }
    const base = new Map(
      auto_follow(this._hass, aquarium).map((p) => [p.chemistry, p]),
    );
    const overrides: Array<FollowedParameter | ParameterOverride> = [];
    for (const [chemistry, entry] of followed) {
      const from_aquarium = base.get(chemistry);
      const same =
        from_aquarium !== undefined &&
        from_aquarium.source === entry.source &&
        entry.name === undefined &&
        entry.ranges === undefined;
      if (!same) overrides.push(entry);
    }
    for (const chemistry of base.keys())
      if (!followed.has(chemistry)) overrides.push({ chemistry, hide: true });
    const config = { ...this._config };
    if (overrides.length) config.parameters = overrides;
    else delete config.parameters;
    this._commit(config);
  }

  /**
   * Follow another aquarium, or none.
   *
   * The overrides are dropped on the way: they name the chemistries of the
   * aquarium being left, and a source from another tank is exactly what the
   * picker is there to avoid.
   */
  private _set_aquarium(aquarium: string): void {
    const config = { ...this._config };
    delete config.parameters;
    if (aquarium) config.aquarium = aquarium;
    else delete config.aquarium;
    this._commit(config);
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

  /** The aquarium picker, shown only when reeftank backs one. */
  private _aquarium_field() {
    const known = aquariums(this._hass);
    if (!known.length) return nothing;
    const current = this._config.aquarium ?? "";
    return html`<label class="field">
      <span>${i18n._("parameters_editor_aquarium")}</span>
      <select
        @change=${(e: Event) =>
          this._set_aquarium((e.target as HTMLSelectElement).value)}
      >
        <option value="" ?selected=${current === ""}>
          ${i18n._("parameters_editor_every_aquarium")}
        </option>
        ${known.map(
          (a) =>
            html`<option value=${a.id} ?selected=${a.id === current}>
              ${a.name}
            </option>`,
        )}
      </select>
    </label>`;
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
      ${this._aquarium_field()}
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
