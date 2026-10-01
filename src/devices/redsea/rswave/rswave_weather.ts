/**
 * ReefWave GPS weather, in the program editor: the speeds of the pumps
 * follow the weather of a place (redsea.wave_weather_*).
 *
 * The water speed of the place (wind, or ocean current where the sea model
 * covers it) is read hour by hour from Open-Meteo by the integration, and
 * becomes the speed of each pump between four bounds: the slowest and the
 * fastest speed by day, and by night. Each pump of the group can run a
 * little slower or faster than the others (its offset, e.g. -10 %).
 *
 * The settings are a draft: each change previews the day they make
 * (redsea.wave_weather_preview, after a short pause), one graph line per
 * pump; Apply saves them for the whole group and writes the pumps
 * (redsea.wave_weather_save), then tells the editor (`wave-weather-saved`)
 * so it reads the pump's program again.
 *
 * The place is typed ("lat, lon", or a map link the integration reads),
 * searched by its name (rs-place-search) or picked on Home Assistant's own
 * location selector, when there is one.
 */
import { LitElement, css, html, nothing, svg, TemplateResult } from "lit";

import { ask } from "./rswave_api";
import { parse_lat_lon } from "../rsled/rsled_weather";
import i18n from "../../../translations/myi18n";

/** Settings shared by the group, as the integration keeps them. */
export interface WaveWeatherSettings {
  enabled?: boolean;
  location?: string;
  source?: string;
  scale?: number;
  day_min?: number;
  day_max?: number;
  night_min?: number;
  night_max?: number;
  tolerance?: number;
  offset?: number;
}

/** Sources of the place's speed. */
export const WEATHER_SOURCES = ["wind", "current"];

/** Speed of the place giving the fastest speed, by source (km/h). */
export const DEFAULT_SCALE: Record<string, number> = { wind: 40, current: 2 };

/** Bounds of the speed, in the order they are shown. */
export const BOUNDS = ["day_min", "day_max", "night_min", "night_max"] as const;

/** Pause after a change before the day is previewed (ms). */
export const PREVIEW_DELAY = 600;

/** Colours of the pumps' lines in the graph. */
export const PUMP_COLORS = ["#ec2330", "#039be5", "#43a047", "#fb8c00"];

/** Size of the graph's viewBox and its margins. */
const G = { w: 480, h: 120, l: 26, r: 6, t: 6, b: 16 };

/**
 * Points of a step line of 24 hourly speeds in the graph.
 * @param speeds: speed of each hour, 0..100
 */
export function step_points(speeds: number[]): string {
  const x = (h: number) => G.l + ((G.w - G.l - G.r) * h) / 24;
  const y = (v: number) =>
    G.t + (G.h - G.t - G.b) * (1 - Math.max(0, Math.min(100, v)) / 100);
  return speeds.map((v, h) => `${x(h)},${y(v)} ${x(h + 1)},${y(v)}`).join(" ");
}

export class RSWaveWeather extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-size: 12px;
      color: var(--primary-text-color, #222);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 4px 10px;
      margin: 6px 0;
    }
    .grid.bounds {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 2px;
      color: var(--secondary-text-color, #777);
    }
    label.check {
      flex-direction: row;
      align-items: center;
      gap: 6px;
      color: inherit;
    }
    input,
    select {
      font: inherit;
      color: var(--primary-text-color, #222);
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      padding: 2px 4px;
      min-width: 0;
    }
    .unit {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .unit input {
      flex: 1;
    }
    .place,
    .note,
    .map_missing {
      color: var(--secondary-text-color, #777);
      margin: 4px 0;
    }
    .note.warn {
      color: var(--warning-color, #c77700);
    }
    .error {
      color: var(--error-color, #db4437);
      margin: 4px 0;
    }
    svg.graph {
      width: 100%;
      height: auto;
      display: block;
    }
    .night {
      fill: rgba(63, 81, 181, 0.12);
    }
    .frame {
      fill: none;
      stroke: var(--divider-color, #ccc);
    }
    .tick {
      font-size: 8px;
      fill: var(--secondary-text-color, #777);
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 2px 12px;
    }
    .legend span::before {
      content: "";
      display: inline-block;
      width: 10px;
      height: 3px;
      margin-right: 4px;
      vertical-align: middle;
      background: var(--swatch);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 6px;
    }
    .btn_apply {
      border-radius: 6px;
      padding: 5px 14px;
      border: 1px solid transparent;
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      cursor: pointer;
    }
    .btn_apply:disabled {
      opacity: 0.5;
      cursor: default;
    }
  `;

  static override properties = {
    hass: { attribute: false },
    wave: { attribute: false },
    library: { attribute: false },
    _settings: { state: true },
    _offsets: { state: true },
    _enabled: { state: true },
    _preview: { state: true },
    _busy: { state: true },
    _error: { state: true },
  };

  hass: any = null;
  /** The RSWave device: its services are called through it */
  wave: any = null;
  /** The library read by the editor: its group and GPS weather */
  library: any = null;
  /** Settings being edited */
  protected _settings: WaveWeatherSettings = {};
  /** Offsets being edited, by pump */
  protected _offsets: Record<string, number> = {};
  protected _enabled = false;
  /** The day the settings make (redsea.wave_weather_preview) */
  protected _preview: any = null;
  protected _busy = false;
  protected _error = "";
  /** Library the draft was taken from */
  private _from: any = undefined;
  private _timer: ReturnType<typeof setTimeout> | null = null;

  /** Take the draft from the library when a new one is given. */
  protected override willUpdate(): void {
    if (this.library === this._from) return;
    this._from = this.library;
    const stored = this.library?.weather?.settings ?? {};
    this._settings = { ...stored };
    this._enabled = stored.enabled === true;
    this._offsets = {};
    if (this.library) this.schedule_preview(0);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._timer) clearTimeout(this._timer);
    this._timer = null;
  }

  /**
   * Preview the day after a pause (the settings are often changed one after
   * the other).
   * @param delay: the pause (ms)
   */
  schedule_preview(delay: number = PREVIEW_DELAY): void {
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._timer = null;
      void this.preview();
    }, delay);
  }

  /** The draft as the services take it. */
  protected draft(): Record<string, unknown> {
    const { enabled: _e, offset: _o, ...shared } = this._settings;
    return { settings: shared, offsets: { ...this._offsets } };
  }

  /** Ask the day the draft makes. */
  async preview(): Promise<void> {
    const res = await ask<any>(this.wave, "wave_weather_preview", this.draft());
    this._preview = res.ok ? res.value : { status: "error", error: res.error };
  }

  /**
   * A setting changed.
   * @param key: the setting
   * @param value: its new value
   */
  change(key: string, value: unknown): void {
    this._settings = { ...this._settings, [key]: value };
    this._error = "";
    this.schedule_preview();
  }

  /**
   * The offset of a pump changed.
   * @param hwid: the pump
   * @param value: its offset, percent
   */
  set_offset(hwid: string, value: number): void {
    this._offsets = { ...this._offsets, [hwid]: value };
    this.schedule_preview();
  }

  /**
   * A place picked on the map or found by its name.
   * @param value: {latitude, longitude}
   */
  pick(value: any): void {
    const lat = Number(value?.latitude);
    const lon = Number(value?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    this.change("location", `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  }

  /** Place shown on the map: typed, else found, else the home. */
  place(): { latitude: number; longitude: number } {
    const typed = parse_lat_lon(this._settings.location);
    if (typed) return typed;
    const p = this._preview;
    if (Number.isFinite(p?.latitude) && Number.isFinite(p?.longitude)) {
      return { latitude: p.latitude, longitude: p.longitude };
    }
    return {
      latitude: Number(this.hass?.config?.latitude ?? 0),
      longitude: Number(this.hass?.config?.longitude ?? 0),
    };
  }

  /** Save for the group and write the pumps. */
  async save(): Promise<void> {
    this._busy = true;
    this._error = "";
    const res = await ask<any>(this.wave, "wave_weather_save", {
      ...this.draft(),
      enabled: this._enabled,
    });
    this._busy = false;
    const answer = res.value ?? {};
    if (!res.ok || answer.status === "error") {
      this._error = String(res.error ?? answer.error ?? "");
      return;
    }
    this.dispatchEvent(
      new CustomEvent("wave-weather-saved", {
        detail: { enabled: this._enabled },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Pumps of the group: from the preview, else the library. */
  protected pumps(): { hwid: string; name: string; offset: number }[] {
    const listed = this._preview?.pumps;
    const pumps = Array.isArray(listed)
      ? listed
      : (this.library?.group ?? []).map((p: any) => ({ ...p, offset: 0 }));
    return pumps.map((p: any) => ({
      hwid: String(p.hwid),
      name: String(p.name ?? p.hwid),
      offset: this._offsets[p.hwid] ?? Number(p.offset ?? 0),
    }));
  }

  private _map(): TemplateResult {
    if (!customElements.get("ha-selector")) {
      return html`<div class="map_missing">
        ${i18n._("led_weather_map_missing")}
      </div>`;
    }
    return html`<ha-selector
      .hass=${this.hass}
      .selector=${{ location: { radius: false } }}
      .value=${this.place()}
      @value-changed=${(e: CustomEvent) => this.pick(e.detail?.value)}
    ></ha-selector>`;
  }

  private _number(
    key: string,
    min: number,
    max: number,
    unit: string,
    placeholder = "",
  ): TemplateResult {
    const value = (this._settings as any)[key];
    return html`<label
      >${i18n._("wave_weather_" + key)}
      <span class="unit"
        ><input
          class="${key}"
          type="number"
          min="${min}"
          max="${max}"
          placeholder="${placeholder}"
          .value=${value === undefined || (value === 0 && key === "scale")
            ? ""
            : String(value)}
          @change=${(e: Event) =>
            this.change(key, Number((e.target as HTMLInputElement).value))}
        />${unit}</span
      ></label
    >`;
  }

  /** The day previewed: one line per pump, the night shaded. */
  private _graph(): TemplateResult | typeof nothing {
    const p = this._preview ?? {};
    if (p.status === "error") {
      return html`<div class="error">⚠ ${p.error ?? ""}</div>`;
    }
    const hours = Array.isArray(p.hours) ? p.hours : [];
    if (!hours.length) return nothing;
    const pumps = Array.isArray(p.pumps) ? p.pumps : [];
    const x = (h: number) => G.l + ((G.w - G.l - G.r) * h) / 24;
    const night = hours
      .filter((h: any) => !h.day)
      .map(
        (h: any) => svg`<rect class="night" x="${x(h.hour)}" y="${G.t}"
          width="${x(1) - x(0)}" height="${G.h - G.t - G.b}"></rect>`,
      );
    const ticks = [0, 6, 12, 18, 24].map(
      (h) => svg`<text class="tick" x="${x(h)}" y="${G.h - 4}"
        text-anchor="middle">${String(h).padStart(2, "0")}h</text>`,
    );
    const lines = pumps.map(
      (pump: any, i: number) => svg`<polyline fill="none" stroke-width="2"
        stroke="${PUMP_COLORS[i % PUMP_COLORS.length]}"
        points="${step_points(pump.speeds ?? [])}"><title>${pump.name}</title></polyline>`,
    );
    const source = i18n._("wave_weather_source_" + p.source);
    return html`<div class="place">
        📍 ${Number(p.latitude).toFixed(2)}, ${Number(p.longitude).toFixed(2)}
        ${p.timezone ? `· ${p.timezone}` : ""} · ☀ ${p.sunrise} – ${p.sunset} ·
        ${source}
      </div>
      ${p.fallback
        ? html`<div class="note warn">${i18n._("wave_weather_fallback")}</div>`
        : nothing}
      <svg class="graph" viewBox="0 0 ${G.w} ${G.h}">
        ${night}
        <rect
          class="frame"
          x="${G.l}"
          y="${G.t}"
          width="${G.w - G.l - G.r}"
          height="${G.h - G.t - G.b}"
        ></rect>
        <text class="tick" x="${G.l - 3}" y="${G.t + 6}" text-anchor="end">
          100
        </text>
        <text class="tick" x="${G.l - 3}" y="${G.h - G.b}" text-anchor="end">
          0
        </text>
        ${ticks} ${lines}
      </svg>
      <div class="legend">
        ${pumps.map(
          (pump: any, i: number) =>
            html`<span style="--swatch:${PUMP_COLORS[i % PUMP_COLORS.length]}"
              >${pump.name}</span
            >`,
        )}
      </div>`;
  }

  protected override render(): TemplateResult {
    const source = this._settings.source ?? "wind";
    return html`<label class="check"
        ><input
          class="enabled"
          type="checkbox"
          .checked=${this._enabled}
          @change=${(e: Event) =>
            (this._enabled = (e.target as HTMLInputElement).checked)}
        />${i18n._("wave_weather_enable")}</label
      >
      <div class="note">${i18n._("wave_weather_help")}</div>
      <label
        >📍 ${i18n._("wave_weather_location")}
        <input
          class="location"
          type="text"
          placeholder="lat, lon"
          .value=${this._settings.location ?? ""}
          @change=${(e: Event) =>
            this.change("location", (e.target as HTMLInputElement).value)}
      /></label>
      <rs-place-search
        .hass=${this.hass}
        @place-picked=${(e: CustomEvent) => this.pick(e.detail)}
      ></rs-place-search>
      ${this._map()}
      <div class="grid">
        <label
          >${i18n._("wave_weather_source")}
          <select
            class="source"
            @change=${(e: Event) =>
              this.change("source", (e.target as HTMLSelectElement).value)}
          >
            ${WEATHER_SOURCES.map(
              (s) =>
                html`<option value="${s}" ?selected=${s === source}>
                  ${i18n._("wave_weather_source_" + s)}
                </option>`,
            )}
          </select></label
        >
        ${this._number("scale", 0, 200, "km/h", String(DEFAULT_SCALE[source]))}
      </div>
      <div class="grid bounds">
        ${BOUNDS.map((key) => this._number(key, 0, 100, "%"))}
      </div>
      <div class="grid">${this._number("tolerance", 0, 30, "%")}</div>
      <div class="note">${i18n._("wave_weather_tolerance_help")}</div>
      <div class="note">${i18n._("wave_weather_offsets")}</div>
      <div class="grid">
        ${this.pumps().map(
          (pump) =>
            html`<label
              >${pump.name}
              <span class="unit"
                ><input
                  class="offset"
                  type="number"
                  min="-50"
                  max="50"
                  .value=${String(pump.offset)}
                  @change=${(e: Event) =>
                    this.set_offset(
                      pump.hwid,
                      Number((e.target as HTMLInputElement).value),
                    )}
                />%</span
              ></label
            >`,
        )}
      </div>
      ${this._graph()}
      ${this._error ? html`<div class="error">⚠ ${this._error}</div>` : nothing}
      <div class="actions">
        <button
          class="btn_apply"
          ?disabled=${this._busy}
          @click=${() => this.save()}
        >
          ${i18n._(this._busy ? "wave_saving" : "wave_weather_apply")}
        </button>
      </div>`;
  }
}
