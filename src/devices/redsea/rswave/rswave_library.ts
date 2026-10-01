/**
 * ReefWave wave library: an icon on the pump view opening the editor of
 * the waves of the aquarium (cloud library), as the ReefBeat app's.
 *
 * The editor lists the waves (Red Sea ones and the user's), with the pumps
 * using each. Picking one shows its settings:
 *   - its type, picked from the app's pictograms;
 *   - its shape (forward / reverse times, pulse duration, steps: the fields
 *     its type uses), shared by every pump using the wave;
 *   - this pump's forward / reverse intensities and sync flag.
 * Then:
 *   - "Update" writes the wave (not a Red Sea one); pumps using it get their
 *     program written again by the integration;
 *   - "Create a new wave" asks a name and adds a copy with these settings;
 *   - "Delete" removes it (not a Red Sea one, nor one a program uses).
 *
 * Without a cloud account there is no library: the editor says so.
 *
 * Example mapping:
 *   library: { name: "library", type: "rswave-library", stateObj: null,
 *              css: {...position of the icon...} }
 */
import { html, nothing, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";

import { RSWaveElement } from "./rswave_element";
import { style_rswave_schedule } from "./rswave.styles";
import {
  EDITABLE_TYPES,
  EditorWave,
  WAVE_FIELD_DEFAULTS,
  WAVE_FIELD_LIMITS,
  WAVE_TYPE_FIELDS,
  type_color,
  wave_settings,
} from "./rswave_program";
import { WaveLibrary, ask, fetch_library } from "./rswave_api";
import { type_icon } from "./rswave_icons";
import { direction_label, tr, type_label } from "./rswave_schedule";
import i18n from "../../../translations/myi18n";

/** What the editor is doing with the selected wave. */
type Step = "edit" | "name" | "delete";

export class RSWaveLibrary extends RSWaveElement {
  static override styles = style_rswave_schedule;

  @state() protected _open = false;
  @state() protected _library: WaveLibrary | null = null;
  /** Wave being edited (a copy), null when none is picked */
  @state() protected _wave: EditorWave | null = null;
  @state() protected _step: Step = "edit";
  /** Name typed for a new wave */
  @state() protected _name = "";
  @state() protected _error = "";
  @state() protected _busy = false;
  /** Preview settings: direction and duration (min) */
  @state() protected _preview_dir = "alt";
  @state() protected _preview_min = 5;

  /**
   * Wave to show, set by the program editor that embeds this element
   * (conf.inline): the wave of the slot picked in its table.
   */
  // Not focus: that name is HTMLElement's
  @property({ attribute: false }) focus_uid = "";

  /** Embedded in the program editor: no icon, no overlay. */
  protected inline(): boolean {
    return (this.conf as any)?.inline === true;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.inline() && this._library === null) void this.load();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated?.(changed);
    if (
      changed.has("focus_uid") &&
      this.focus_uid &&
      this._wave?.uid !== this.focus_uid
    ) {
      this.pick(this.focus_uid);
    }
  }

  /** The icon never changes: no re-render on hass updates. */
  protected override signature(): string {
    return "";
  }

  public openEditor(): void {
    this._open = true;
    this._library = null;
    this._wave = null;
    this._step = "edit";
    this._error = "";
    this._busy = false;
    void this.load();
  }

  public closeEditor(): void {
    this._open = false;
  }

  /** A click on the backdrop (not in the panel) closes the editor. */
  protected _onOverlayClick(e: Event): void {
    e.stopPropagation();
    if (e.target === e.currentTarget) this.closeEditor();
  }

  /** Read the library, keeping the picked wave when it still exists. */
  async load(): Promise<void> {
    const res = await fetch_library(this.wave);
    if (!res.ok) {
      this._error = res.error as string;
      return;
    }
    this._library = res.value as WaveLibrary;
    const uid = this._wave?.uid ?? (this.inline() ? this.focus_uid : undefined);
    const again = this._library?.waves.find((w) => w.uid === uid);
    this._wave = again ? { ...again } : null;
  }

  protected pick(uid: string): void {
    const wave = this._library?.waves.find((w) => w.uid === uid);
    this._wave = wave ? { ...wave } : null;
    this._step = "edit";
    this._error = "";
  }

  /** Start a new wave from scratch (a regular one). */
  protected start_new(): void {
    this._wave = {
      uid: "",
      name: "",
      type: "re",
      default: false,
      frt: WAVE_FIELD_DEFAULTS.frt,
      rrt: WAVE_FIELD_DEFAULTS.rrt,
      pd: null,
      sn: null,
      fti: 50,
      rti: 50,
      sync: true,
    };
    this._name = "";
    this._step = "name";
    this._error = "";
  }

  protected set_type(type: string): void {
    if (!this._wave) return;
    const wave: any = { ...this._wave, type };
    // A field the new type uses gets a value when it had none
    for (const key of WAVE_TYPE_FIELDS[type] ?? []) {
      if (wave[key] === null || wave[key] === undefined) {
        wave[key] = WAVE_FIELD_DEFAULTS[key];
      }
    }
    this._wave = wave;
  }

  protected set_field(key: string, e: Event): void {
    if (!this._wave) return;
    const value = Number((e.target as HTMLInputElement).value);
    this._wave = { ...this._wave, [key]: value };
  }

  protected set_sync(e: Event): void {
    if (!this._wave) return;
    this._wave = {
      ...this._wave,
      sync: (e.target as HTMLInputElement).checked,
    };
  }

  /** Users of a wave (pump names). */
  protected users(uid: string): string[] {
    return this._library?.usage?.[uid] ?? [];
  }

  // ── Actions ─────────────────────────────────────────────────────────

  /**
   * Run a call, then read the library again.
   * @param service: the redsea service
   * @param data: its data
   * @return the response, null when refused (the message is shown)
   */
  protected async run(service: string, data: Record<string, unknown>) {
    this._busy = true;
    this._error = "";
    const res = await ask<any>(this.wave, service, data);
    this._busy = false;
    if (!res.ok) {
      this._error = res.error as string;
      return null;
    }
    return res.value;
  }

  // Not update(): that name is LitElement's update cycle
  /** Tell the program editor around that the library changed. */
  protected changed(): void {
    this.dispatchEvent(
      new CustomEvent("wave-library-changed", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Preview ─────────────────────────────────────────────────────────

  /** Whether the pump runs a preview now. */
  protected previewing(): boolean {
    return this.wave?.mode?.() === "preview";
  }

  /** Run the wave being edited on this pump for a while. */
  async preview(): Promise<void> {
    const w = this._wave;
    if (!w) return;
    await this.run("wave_preview", {
      settings: wave_settings(w),
      direction: this._preview_dir,
      duration: this._preview_min * 60000,
    });
  }

  async stop_preview(): Promise<void> {
    await this.run("wave_preview_stop", {});
  }

  async update_wave(): Promise<void> {
    const w = this._wave;
    if (!w || !w.uid || w.default) return;
    const res = await this.run("wave_library_save", {
      uid: w.uid,
      name: w.name,
      settings: wave_settings(w),
    });
    if (!res) return;
    this.changed();
    await this.load();
  }

  async create_wave(): Promise<void> {
    const w = this._wave;
    const name = this._name.trim();
    if (!w || !name) {
      this._error = i18n._("wave_name_required");
      return;
    }
    const res = await this.run("wave_library_save", {
      name,
      settings: wave_settings(w),
    });
    if (!res) return;
    this._wave = { ...w, uid: String(res.uid ?? ""), name, default: false };
    this._step = "edit";
    this.changed();
    await this.load();
  }

  // Not remove(): that name is HTMLElement's
  async delete_wave(): Promise<void> {
    const w = this._wave;
    if (!w || !w.uid) return;
    const res = await this.run("wave_library_delete", { uid: w.uid });
    if (!res) return;
    this._wave = null;
    this._step = "edit";
    this.changed();
    await this.load();
  }

  // ── Render ──────────────────────────────────────────────────────────

  protected renderList(): TemplateResult {
    const waves = (this._library as WaveLibrary).waves;
    return html`<div class="lib_list">
      ${waves.map((w) => {
        const users = this.users(w.uid);
        return html`<button
          class="lib_item ${this._wave?.uid === w.uid ? "selected" : ""}"
          title="${type_label(w.type)}"
          @click=${() => this.pick(w.uid)}
        >
          <svg class="chip" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="${type_icon(w.type)}"
              fill="rgb(${type_color(w.type)})"
            ></path>
          </svg>
          <span class="lib_name">${w.name}</span>
          ${w.default
            ? html`<span class="badge">${i18n._("wave_redsea")}</span>`
            : nothing}
          ${users.length
            ? html`<span class="lib_users"
                >${tr("wave_used_by", { pumps: users.join(", ") })}</span
              >`
            : nothing}
        </button>`;
      })}
      <button class="btn_add" @click=${() => this.start_new()}>
        ${i18n._("wave_new")}
      </button>
    </div>`;
  }

  protected renderTypes(w: EditorWave, locked: boolean): TemplateResult {
    // A "no wave" stays one (Red Sea only); the others pick among the app's
    const types = w.type === "nw" ? ["nw"] : EDITABLE_TYPES;
    return html`<div class="lib_types">
      ${types.map(
        (t) =>
          html`<button
            class="lib_type ${t === w.type ? "selected" : ""}"
            ?disabled=${locked}
            title="${type_label(t)}"
            @click=${() => this.set_type(t)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="${type_icon(t)}" fill="rgb(${type_color(t)})"></path>
            </svg>
            <span>${type_label(t)}</span>
          </button>`,
      )}
    </div>`;
  }

  protected renderField(w: EditorWave, key: string, locked: boolean) {
    const lim = WAVE_FIELD_LIMITS[key];
    return html`<label class="lib_field">
      <span>${i18n._("wave_field_" + key)}</span>
      <input
        type="number"
        class="field_${key}"
        min="${lim.min}"
        max="${lim.max}"
        step="${lim.step}"
        .value=${String((w as any)[key] ?? "")}
        ?disabled=${locked}
        @change=${(e: Event) => this.set_field(key, e)}
      />
    </label>`;
  }

  protected renderEditorZone(): TemplateResult {
    const w = this._wave;
    if (!w) {
      return html`<p class="note">${i18n._("wave_pick")}</p>`;
    }
    const isNew = !w.uid;
    const nw = w.type === "nw";
    const users = isNew ? [] : this.users(w.uid);
    const busy = this._busy;
    return html`<div class="lib_edit">
      <h4>${isNew ? i18n._("wave_new_title") : w.name}</h4>
      ${w.default
        ? html`<p class="note">${i18n._("wave_redsea_readonly")}</p>`
        : nothing}
      ${this.renderTypes(w, nw)}
      <div class="lib_fields">
        ${(WAVE_TYPE_FIELDS[w.type] ?? []).map((k) =>
          this.renderField(w, k, false),
        )}
        ${nw
          ? nothing
          : html`${this.renderField(w, "fti", false)}
              ${this.renderField(w, "rti", false)}
              <label class="lib_field check">
                <input
                  type="checkbox"
                  class="field_sync"
                  .checked=${w.sync === true}
                  @change=${(e: Event) => this.set_sync(e)}
                />
                <span>${i18n._("wave_field_sync")}</span>
              </label>`}
      </div>
      ${nw ? nothing : html`<p class="hint">${i18n._("wave_shape_note")}</p>`}
      ${nw ? nothing : this.renderPreview()}
      ${this._step === "name"
        ? html`<div class="lib_actions">
            <input
              type="text"
              class="new_name"
              placeholder="${i18n._("wave_field_name")}"
              .value=${this._name}
              @input=${(e: Event) =>
                (this._name = (e.target as HTMLInputElement).value)}
            />
            <button
              class="btn_save create"
              ?disabled=${busy}
              @click=${() => this.create_wave()}
            >
              ${i18n._("wave_create_confirm")}
            </button>
            ${isNew
              ? nothing
              : html`<button
                  class="btn_cancel"
                  @click=${() => (this._step = "edit")}
                >
                  ${i18n._("wave_cancel")}
                </button>`}
          </div>`
        : this._step === "delete"
          ? html`<div class="lib_actions">
              <span class="warn"
                >${tr("wave_delete_confirm", { name: w.name })}</span
              >
              <button
                class="btn_delete confirm"
                ?disabled=${busy}
                @click=${() => this.delete_wave()}
              >
                ${i18n._("wave_delete")}
              </button>
              <button class="btn_cancel" @click=${() => (this._step = "edit")}>
                ${i18n._("wave_cancel")}
              </button>
            </div>`
          : html`<div class="lib_actions">
              <button
                class="btn_save update"
                ?disabled=${busy || w.default || nw}
                @click=${() => this.update_wave()}
              >
                ${i18n._("wave_update")}
              </button>
              <button
                class="btn_cancel create_start"
                ?disabled=${busy || nw}
                @click=${() => {
                  this._name = "";
                  this._step = "name";
                }}
              >
                ${i18n._("wave_create")}
              </button>
              <button
                class="btn_delete"
                ?disabled=${busy || w.default || users.length > 0}
                title="${users.length
                  ? tr("wave_used_by", { pumps: users.join(", ") })
                  : ""}"
                @click=${() => (this._step = "delete")}
              >
                ${i18n._("wave_delete")}
              </button>
            </div>`}
    </div>`;
  }

  protected renderPreview(): TemplateResult {
    const running = this.previewing();
    return html`<div class="lib_preview">
      <span class="preview_label">${i18n._("wave_preview")}</span>
      <select
        class="preview_dir"
        @change=${(e: Event) =>
          (this._preview_dir = (e.target as HTMLSelectElement).value)}
      >
        ${["fw", "rw", "alt"].map(
          (d) =>
            html`<option value="${d}" ?selected=${d === this._preview_dir}>
              ${direction_label(d)}
            </option>`,
        )}
      </select>
      <select
        class="preview_min"
        @change=${(e: Event) =>
          (this._preview_min = Number((e.target as HTMLSelectElement).value))}
      >
        ${[1, 2, 5, 10].map(
          (m) =>
            html`<option value="${m}" ?selected=${m === this._preview_min}>
              ${m} min
            </option>`,
        )}
      </select>
      ${running
        ? html`<button
            class="btn_delete preview_stop"
            ?disabled=${this._busy}
            @click=${() => this.stop_preview()}
          >
            ${i18n._("wave_preview_stop")}
          </button>`
        : html`<button
            class="btn_cancel preview_start"
            ?disabled=${this._busy}
            @click=${() => this.preview()}
          >
            ${i18n._("wave_preview_start")}
          </button>`}
    </div>`;
  }

  /** List and editor, or why there are none. */
  protected renderBody(): TemplateResult {
    const lib = this._library;
    if (!lib) {
      return this._error
        ? html``
        : html`<p class="note">${i18n._("wave_loading")}</p>`;
    }
    if (!lib.linked) {
      return html`<p class="note">${i18n._("wave_library_cloud")}</p>`;
    }
    return html`<div class="lib_body">
      ${this.renderList()} ${this.renderEditorZone()}
    </div>`;
  }

  protected renderPanel(): TemplateResult {
    return html`<div class="overlay" @click=${this._onOverlayClick}>
      <div class="panel" @click=${(e: Event) => e.stopPropagation()}>
        <div class="panel_header">
          <h3>
            ${i18n._("wave_library")} · ${this.wave?.display_name?.() ?? ""}
          </h3>
          <button class="btn_close" @click=${() => this.closeEditor()}>
            &#x2715;
          </button>
        </div>
        ${this.renderBody()}
        ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
      </div>
    </div>`;
  }

  protected override _render(_style?: string): TemplateResult {
    if (this.inline()) {
      return html`<div class="lib_inline">
        ${this.renderBody()}
        ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
      </div>`;
    }
    return html`<button
        class="lib_open"
        title="${i18n._("wave_library")}"
        @click=${(e: Event) => {
          e.stopPropagation();
          this.openEditor();
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="${type_icon("ra")}"></path>
        </svg>
        <span>${i18n._("wave_library_short")}</span>
      </button>
      ${this._open ? this.renderPanel() : nothing}`;
  }
}
