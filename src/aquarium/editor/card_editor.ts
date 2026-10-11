/**
 * Lovelace editor of the aquarium card: which aquarium, which render level,
 * which view to start on. The scene itself is edited in a full-screen
 * dialog (the card editor panel is too narrow to outline anything).
 */

import { LitElement, html, css, nothing, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";

import type { HassConfig } from "../../types/index";
import type { AquariumSummary, RenderLevel } from "../types";
import { RENDER_LEVELS } from "../types";
import { ReefTankApi } from "../api";
import type { AquariumCardConfig } from "../aquarium_card";
import i18n from "../../translations/myi18n";
import { open_scene_editor } from "./scene_editor";

export class ReefAquariumCardEditor extends LitElement {
  static override styles = css`
    .row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 12px;
    }
    label {
      font-weight: 500;
    }
    select,
    button {
      font: inherit;
      padding: 6px 8px;
    }
    .buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .hint {
      color: var(--secondary-text-color, #666);
      font-size: 0.9em;
    }
    .error {
      color: var(--error-color, #c00);
    }
  `;

  @state() private _config: AquariumCardConfig = {};
  @state() private _aquariums: AquariumSummary[] | null = null;
  @state() private _views: { id: string; name: string }[] = [];
  @state() private _error: string | null = null;
  private _hass: HassConfig | null = null;
  private _api: ReefTankApi | null = null;

  setConfig(config: AquariumCardConfig): void {
    this._config = { ...config };
    this._load_views();
  }

  set hass(hass: HassConfig) {
    const first = !this._hass;
    this._hass = hass;
    if (!this._api) this._api = new ReefTankApi(hass);
    else this._api.hass = hass;
    if (first) this._load();
  }

  private async _load(): Promise<void> {
    if (!this._api?.available) {
      this._error = "not_loaded";
      return;
    }
    try {
      this._aquariums = await this._api.list();
      this._error = null;
      this._load_views();
    } catch (err: any) {
      this._error = err?.code ?? "not_loaded";
    }
  }

  private async _load_views(): Promise<void> {
    const id = this._config.aquarium;
    if (!this._api?.available || !id) {
      this._views = [];
      return;
    }
    try {
      const payload = await this._api.get(id);
      this._views = Object.entries(payload.document.views).map(([vid, v]) => ({
        id: vid,
        name: v.name || vid,
      }));
    } catch {
      this._views = [];
    }
  }

  private _set(patch: Partial<AquariumCardConfig>): void {
    const config: Record<string, any> = { ...this._config, ...patch };
    for (const key of Object.keys(config)) {
      if (
        config[key] === "" ||
        config[key] === undefined ||
        config[key] === null
      )
        delete config[key];
    }
    if (!config.type) config.type = "custom:reef-aquarium-card";
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
    if ("aquarium" in patch) this._load_views();
  }

  private _edit(aquarium_id: string | null): void {
    if (!this._hass) return;
    open_scene_editor(this._hass, aquarium_id, async (saved_id) => {
      await this._load();
      if (saved_id && saved_id !== this._config.aquarium)
        this._set({ aquarium: saved_id, view: undefined });
      else this._load_views();
    });
  }

  override render(): TemplateResult {
    if (this._error === "not_loaded") {
      return html`<div class="error">${i18n._("aq_msg_not_loaded")}</div>`;
    }
    const level = this._config.render ?? "";
    return html`
      <div class="row">
        <label for="aquarium">${i18n._("aq_aquarium")}</label>
        <select
          id="aquarium"
          @change=${(e: Event) =>
            this._set({
              aquarium: (e.target as HTMLSelectElement).value,
              view: undefined,
            })}
        >
          <option value="" ?selected=${!this._config.aquarium}>
            ${i18n._("aq_choose_aquarium")}
          </option>
          ${(this._aquariums ?? []).map(
            (a) =>
              html`<option
                value="${a.id}"
                ?selected=${a.id === this._config.aquarium}
              >
                ${a.name}
              </option>`,
          )}
        </select>
      </div>
      <div class="buttons row">
        <button @click=${() => this._edit(null)}>
          ${i18n._("aq_new_aquarium")}
        </button>
        ${this._config.aquarium
          ? html`<button @click=${() => this._edit(this._config.aquarium!)}>
              ${i18n._("aq_edit_scene")}
            </button>`
          : nothing}
      </div>
      <div class="row">
        <label for="render">${i18n._("aq_render_level")}</label>
        <select
          id="render"
          @change=${(e: Event) =>
            this._set({
              render: ((e.target as HTMLSelectElement).value ||
                undefined) as RenderLevel,
            })}
        >
          <option value="" ?selected=${!level}>
            ${i18n._("aq_render_inherit")}
          </option>
          ${RENDER_LEVELS.map(
            (l) =>
              html`<option value="${l}" ?selected=${l === level}>
                ${i18n._(`aq_render_${l}`)}
              </option>`,
          )}
        </select>
        <span class="hint">${i18n._("aq_render_hint")}</span>
      </div>
      ${this._views.length > 1
        ? html`<div class="row">
            <label for="view">${i18n._("aq_start_view")}</label>
            <select
              id="view"
              @change=${(e: Event) =>
                this._set({
                  view: (e.target as HTMLSelectElement).value || undefined,
                })}
            >
              <option value="" ?selected=${!this._config.view}>
                ${i18n._("aq_default_view")}
              </option>
              ${this._views.map(
                (v) =>
                  html`<option
                    value="${v.id}"
                    ?selected=${v.id === this._config.view}
                  >
                    ${v.name}
                  </option>`,
              )}
            </select>
          </div>`
        : nothing}
    `;
  }
}
