/**
 * ReefLED weather program, in the program editor: its settings and the week
 * they make.
 *
 * The editor shows this panel in place of the points table while the GPS
 * weather mode is on (or chosen). The settings are the editor's draft: each
 * change is told with a `weather-setting` event {key, value}, the editor
 * previews the week they make (redsea.led_weather_preview) and saves them
 * only on Save (redsea.led_weather_save). Nothing is written from here.
 *
 * The place is typed ("lat, lon", or a map link the integration reads) or
 * picked on Home Assistant's own location selector, when there is one. The
 * week of the preview is listed day by day: the sun on the tank (the
 * place's times on hover), the sunshine, the cloud cover and the highest
 * intensity; a day is shown in the editor's chart when clicked (event
 * `weather-day` {day}).
 */
import { LitElement, css, html, TemplateResult } from "lit";

import i18n from "../../../translations/myi18n";
import { DayProgram, normalize_program } from "./rsled_program";

/**
 * A generated day's program as the charts draw it.
 * @param program: the day's program (white/blue/moon or color/moon)
 */
export function day_program(program: any): DayProgram | null {
  if (!program || typeof program !== "object") return null;
  return normalize_program(program, 1, "color" in program);
}

/** Intensity of a day's clouds, whatever the integration's version. */
export function clouds_level(d: WeatherDay): string | null {
  if (!d.clouds) return null;
  return typeof d.clouds === "string" ? d.clouds : d.clouds.intensity;
}

/** A day of the generated week (see the integration's led_weather.py). */
export interface WeatherDay {
  date: string;
  weekday: number;
  place_sunrise: string;
  place_sunset: string;
  sunrise: string;
  sunset: string;
  sunshine_hours: number;
  cloud_cover: number;
  max_intensity: number;
  /** The lamp's clouds of the day (older integrations: their intensity) */
  clouds: { from: number; to: number; intensity: string } | string | null;
  /** The day's program, on its own timeline, in the lamp's format */
  program?: any;
}

/** Settings of the weather program (the integration's WeatherSettings). */
export interface WeatherSettings {
  period?: string;
  location?: string;
  min_intensity?: number;
  max_intensity?: number;
  anchor?: string;
  sunrise?: string;
  sunset?: string;
  clouds?: boolean;
  refresh_days?: number;
  /**
   * Colours of the weather days, per weekday ("1".."7"): from the rise
   * (at 0) to the set (at 1), colour temperatures (see the editor)
   */
  colors?: Record<string, { at: number; k: number }[]>;
}

export const WEATHER_PERIODS = ["next_week", "last_week"];
export const WEATHER_ANCHORS = ["place", "sunrise", "sunset", "both"];

/**
 * Translation keys of the settings and of their options, written out so the
 * translation checker sees them.
 */
const SETTING_LABELS: Record<string, string> = {
  period: "led_weather_period",
  refresh_days: "led_weather_refresh_days",
  anchor: "led_weather_anchor",
  sunrise: "led_weather_sunrise",
  sunset: "led_weather_sunset",
  min_intensity: "led_weather_min_intensity",
  max_intensity: "led_weather_max_intensity",
};
const OPTION_LABELS: Record<string, string> = {
  next_week: "led_weather_period_next_week",
  last_week: "led_weather_period_last_week",
  place: "led_weather_anchor_place",
  sunrise: "led_weather_anchor_sunrise",
  sunset: "led_weather_anchor_sunset",
  both: "led_weather_anchor_both",
};

/** Tank times each anchor uses. */
const ANCHOR_TIMES: Record<string, string[]> = {
  place: [],
  sunrise: ["sunrise"],
  sunset: ["sunset"],
  both: ["sunrise", "sunset"],
};

/**
 * Coordinates of a "lat, lon" text, null when it is something else (a map
 * link is read by the integration, which gives back the place it found).
 * @param text: the location typed
 */
export function parse_lat_lon(
  text: string | null | undefined,
): { latitude: number; longitude: number } | null {
  const match = /^\s*(-?\d+(?:\.\d+)?)\s*[,; ]\s*(-?\d+(?:\.\d+)?)\s*$/.exec(
    text ?? "",
  );
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  return Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
    ? { latitude, longitude }
    : null;
}

export class RSLedWeatherSettings extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-size: 12px;
      color: var(--primary-text-color, #222);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 10px;
      margin: 6px 0;
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
    }
    label.wide {
      grid-column: 1 / -1;
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
    input:disabled {
      opacity: 0.45;
    }
    .unit {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .unit input {
      flex: 1;
    }
    .map_missing,
    .place,
    .error {
      color: var(--secondary-text-color, #777);
      margin: 4px 0;
    }
    .error {
      color: var(--error-color, #db4437);
    }
    .day_line {
      display: flex;
      flex-wrap: wrap;
      gap: 2px 10px;
      padding: 2px 4px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--secondary-text-color, #777);
    }
    .day_line.selected {
      background: rgba(242, 194, 48, 0.25);
    }
    .day_name {
      font-weight: 500;
      color: var(--primary-text-color, #222);
      min-width: 72px;
    }
  `;

  static override properties = {
    hass: { attribute: false },
    settings: { attribute: false },
    preview: { attribute: false },
    day: { type: Number },
  };

  hass: any = null;
  /** The settings being edited */
  settings: WeatherSettings = {};
  /** The week they make (redsea.led_weather_preview) */
  preview: any = null;
  /** Weekday shown in the editor's chart */
  day: number = 1;

  /**
   * Tell the editor a setting changed.
   * @param key: the setting
   * @param value: its new value
   */
  change(key: string, value: any): void {
    this.dispatchEvent(
      new CustomEvent("weather-setting", {
        detail: { key, value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Place shown on the map: the one typed, else the one the integration
   * found (a map link), else the Home Assistant home.
   */
  place(): { latitude: number; longitude: number } {
    const typed = parse_lat_lon(this.settings?.location);
    if (typed) return typed;
    const lat = Number(this.preview?.latitude);
    const lon = Number(this.preview?.longitude);
    if (
      this.preview?.latitude !== undefined &&
      Number.isFinite(lat) &&
      Number.isFinite(lon)
    ) {
      return { latitude: lat, longitude: lon };
    }
    return {
      latitude: Number(this.hass?.config?.latitude ?? 0),
      longitude: Number(this.hass?.config?.longitude ?? 0),
    };
  }

  /**
   * A point picked on the map becomes the place.
   * @param value: {latitude, longitude} from the location selector
   */
  pick(value: any): void {
    const lat = Number(value?.latitude);
    const lon = Number(value?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    this.change("location", `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  }

  private _render_map(): TemplateResult {
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

  /** A number field, told as a number. */
  private _number(
    key: keyof WeatherSettings,
    min: number,
    max: number,
    unit: string,
  ): TemplateResult {
    return html`<label
      >${i18n._(SETTING_LABELS[key])}
      <span class="unit"
        ><input
          class="${key}"
          type="number"
          min="${min}"
          max="${max}"
          .value=${String(this.settings?.[key] ?? "")}
          @change=${(e: Event) =>
            this.change(key, Number((e.target as HTMLInputElement).value))}
        />${unit}</span
      ></label
    >`;
  }

  /** A choice among options, labelled by their translation. */
  private _select(
    key: keyof WeatherSettings,
    options: string[],
  ): TemplateResult {
    const value = this.settings?.[key];
    return html`<label
      >${i18n._(SETTING_LABELS[key])}
      <select
        class="${key}"
        @change=${(e: Event) =>
          this.change(key, (e.target as HTMLSelectElement).value)}
      >
        ${options.map(
          (o) =>
            html`<option value="${o}" ?selected=${o === value}>
              ${i18n._(OPTION_LABELS[o])}
            </option>`,
        )}
      </select></label
    >`;
  }

  /** Time of the tank's sunrise or sunset, used by some anchors only. */
  private _time(key: "sunrise" | "sunset"): TemplateResult {
    const used = (
      ANCHOR_TIMES[this.settings?.anchor ?? "place"] ?? []
    ).includes(key);
    return html`<label
      >${i18n._(SETTING_LABELS[key])}
      <input
        class="${key}"
        type="time"
        ?disabled=${!used}
        .value=${String(this.settings?.[key] ?? "").slice(0, 5)}
        @change=${(e: Event) =>
          this.change(key, (e.target as HTMLInputElement).value)}
    /></label>`;
  }

  private _render_week(): TemplateResult | string {
    const preview = this.preview ?? {};
    if (preview.status === "error") {
      return html`<div class="error">⚠ ${preview.error ?? ""}</div>`;
    }
    const days: WeatherDay[] = Array.isArray(preview.days) ? preview.days : [];
    if (!days.length) return "";
    const place =
      preview.latitude !== undefined
        ? `${Number(preview.latitude).toFixed(2)}, ${Number(preview.longitude).toFixed(2)}` +
          (preview.timezone ? ` · ${preview.timezone}` : "")
        : "";
    return html`<div class="place">📍 ${place}</div>
      ${days.map((d) => {
        const level = clouds_level(d);
        return html`<div
          class="day_line ${d.weekday === this.day ? "selected" : ""}"
          @click=${() =>
            this.dispatchEvent(
              new CustomEvent("weather-day", {
                detail: { day: d.weekday },
                bubbles: true,
                composed: true,
              }),
            )}
        >
          <span class="day_name">${i18n._("day_" + d.weekday)}</span>
          <span title="${d.place_sunrise} – ${d.place_sunset}"
            >☀ ${d.sunrise} – ${d.sunset}</span
          >
          <span>⏱ ${d.sunshine_hours} h</span>
          <span>☁ ${d.cloud_cover} %${level ? ` (${level})` : ""}</span>
          <span>▲ ${d.max_intensity} %</span>
        </div>`;
      })}`;
  }

  protected override render(): TemplateResult {
    return html`<label class="wide"
        >📍 ${i18n._("led_weather_location")}
        <input
          class="location"
          type="text"
          placeholder="lat, lon"
          .value=${this.settings?.location ?? ""}
          @change=${(e: Event) =>
            this.change("location", (e.target as HTMLInputElement).value)}
      /></label>
      ${this._render_map()}
      <div class="grid">
        ${this._select("period", WEATHER_PERIODS)}
        ${this._number("refresh_days", 3, 15, i18n._("led_weather_days"))}
        ${this._select("anchor", WEATHER_ANCHORS)}
        <span></span>
        ${this._time("sunrise")} ${this._time("sunset")}
        ${this._number("min_intensity", 0, 100, "%")}
        ${this._number("max_intensity", 0, 100, "%")}
        <label class="check wide"
          ><input
            class="clouds"
            type="checkbox"
            .checked=${this.settings?.clouds !== false}
            @change=${(e: Event) =>
              this.change("clouds", (e.target as HTMLInputElement).checked)}
          />☁ ${i18n._("led_weather_clouds")}</label
        >
      </div>
      ${this._render_week()}`;
  }
}
