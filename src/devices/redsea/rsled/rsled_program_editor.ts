/**
 * ReefLED program editor, opened by tapping the beam.
 *
 * Left: the chart of the day, the points of the selected channel can be
 * dragged (horizontally: time, vertically: intensity). Right: the table of
 * those points — time, intensity and, on a G2, colour temperature. The
 * first and last rows are the rise and the set of the channel: their
 * intensity is always 0 %, only their time moves.
 *
 * Saving posts the whole day program to /auto/<day> through the
 * integration's `redsea.request` service, for the day shown or for every
 * day of the week, to each lamp of the program (all the lamps of a virtual
 * ReefLED), in each lamp's own format.
 *
 * A lamp linked to a ReefBeat cloud account also offers the programs of its
 * aquarium's library: choosing one loads it, the user's own ones can also be
 * deleted. An edited program is given a name and added to the library (or,
 * for one of the user's programs, updated in it) before being sent to the lamp,
 * which then shows that name, as with the ReefBeat app.
 */
import { LitElement, html, svg, css, TemplateResult } from "lit";

import i18n from "../../../translations/myi18n";
import {
  program_chart,
  chart_scale,
  ChartBox,
  kelvin_labels,
} from "./rsled_chart";
import { day_program, WeatherSettings } from "./rsled_weather";
import {
  CLOUD_LEVELS,
  CURVE_COLORS_DEFAULT,
  CloudProgram,
  DEFAULT_KELVIN,
  DayProgram,
  EditPoint,
  MINUTES_PER_DAY,
  ProgramChannel,
  ProgramFormat,
  format_channels,
  format_minutes,
  from_edit_points,
  kelvin_key_of,
  ConvertedPoint,
  device_program,
  convert_samples_locally,
  kelvin_points_from_samples,
  kelvin_points_to_white_blue,
  white_blue_samples,
  kelvin_rgb,
  parse_time,
  place_time,
  program_format,
  rgb_css,
  to_edit_points,
  white_blue_to_kelvin_points,
  default_program_name,
  device_clouds,
  fit_clouds,
  has_clouds,
  normalize_program,
  preset_name,
  sun_window,
  wb_to_kelvin_program,
  with_cloud_durations,
} from "./rsled_program";

/**
 * Clouds as the library keeps them: their window and intensity only (the
 * lamp adds its cloud and clear durations).
 * @param clouds: clouds on the day's timeline, if any
 */
export function library_clouds(clouds: any): any {
  if (!clouds || typeof clouds !== "object") return null;
  const out: any = {};
  for (const key of ["from", "to", "intensity"]) {
    if (clouds[key] !== undefined) out[key] = clouds[key];
  }
  return out;
}

/** A program of the cloud library (see the redsea.led_library service). */
export interface LibraryEntry {
  uid: string;
  name: string;
  /** Day program on a single day's timeline: white/blue/moon or color/moon */
  program: any;
  /** Clouds on the same timeline, null when none */
  clouds?: any;
  /** A Red Sea program: it can be loaded, not edited nor deleted */
  default?: boolean;
}

/** A lamp the program is written to (see RSLed.program_targets()). */
export interface EditorTarget {
  device_id: string;
  g2: boolean;
  model?: string;
}

/** Chart area inside the editor's own SVG. */
export const EDITOR_CHART: ChartBox = { x: 26, y: 10, w: 286, h: 132 };
const EDITOR_VIEW = { width: 320, height: 164 };

/** Snap of a dragged time, in minutes. */
export const DRAG_STEP = 5;

/** Program created for an empty channel. */
export const DEFAULT_POINTS: Record<ProgramChannel, EditPoint[]> = {
  white: [
    { m: 600, i: 0 },
    { m: 720, i: 100 },
    { m: 1080, i: 100 },
    { m: 1200, i: 0 },
  ],
  blue: [
    { m: 600, i: 0 },
    { m: 720, i: 100 },
    { m: 1080, i: 100 },
    { m: 1200, i: 0 },
  ],
  intensity: [
    { m: 600, i: 0, k: DEFAULT_KELVIN },
    { m: 720, i: 100, k: DEFAULT_KELVIN },
    { m: 1080, i: 100, k: DEFAULT_KELVIN },
    { m: 1200, i: 0, k: DEFAULT_KELVIN },
  ],
  moon: [
    { m: 1320, i: 0 },
    { m: 1380, i: 10 },
    { m: 1440, i: 10 },
    { m: 1500, i: 0 },
  ],
};

/** Translation key of each channel's tab (literal, for check_translations). */
const CHANNEL_LABELS: Record<string, string> = {
  white: "led_channel_white",
  blue: "led_channel_blue",
  moon: "led_channel_moon",
  intensity: "led_channel_intensity",
};

/** A request written to a lamp (the data of redsea.request). */
interface WriteRequest {
  device_id: string;
  access_path: string;
  method: string;
  data: any;
}

/**
 * Wait a while.
 * @param ms: how long, in ms
 */
export function pause(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((done) => setTimeout(done, ms));
}

export class RSLedProgramEditor extends LitElement {
  static override styles = css`
    :host {
      /* Over the lamp's view, as tall as its content needs (see RSLed) */
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      font-family: var(--ha-font-family-body, Roboto, sans-serif);
      font-size: 12px;
      color: var(--primary-text-color, #222);
    }
    .panel {
      flex: 1;
      margin: 2%;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px;
      box-sizing: border-box;
      border-radius: 12px;
      background: var(--card-background-color, #fff);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
    }
    .header,
    .footer,
    .tabs {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .title {
      font-weight: 600;
      font-size: 14px;
      flex: 1;
    }
    .tab {
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 12px;
      padding: 2px 10px;
      cursor: pointer;
      background: transparent;
      color: inherit;
      font: inherit;
    }
    .tab.selected {
      font-weight: 700;
      border-width: 2px;
    }
    .body {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
      min-height: 0;
    }
    /* Weather being read, or a program being written: covers what it
       changes, with a spinner */
    .loading_zone {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.35);
      border-radius: inherit;
      color: #fff;
      font-weight: 500;
      text-align: center;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(255, 255, 255, 0.35);
      border-top-color: #f2c230;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .progress {
      width: 60%;
      height: 6px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.3);
      overflow: hidden;
    }
    .progress > div {
      height: 100%;
      background: #f2c230;
      transition: width 0.3s;
    }
    .colours_hint {
      margin: 0 0 4px;
      font-size: 0.9em;
      color: var(--secondary-text-color, #666);
    }
    .chart {
      flex: none;
      width: 100%;
    }
    .chart svg {
      width: 100%;
      height: auto;
      display: block;
      touch-action: none;
      background: #16213a;
      border-radius: 8px;
    }
    .points {
      flex: 1;
    }
    .mode {
      display: flex;
      border-radius: 10px;
      overflow: hidden;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      box-shadow: inset 0 0 0 1px var(--divider-color, rgba(0, 0, 0, 0.2));
    }
    .mode span {
      padding: 2px 8px;
      color: var(--secondary-text-color, #777);
    }
    .mode span.on {
      background: rgb(197, 91, 90);
      color: #fff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 11px;
    }
    col.c_time {
      width: 38%;
    }
    col.c_pct {
      width: 24%;
    }
    col.c_k {
      width: 30%;
    }
    col.c_act {
      width: 8%;
    }
    input[type="time"]::-webkit-calendar-picker-indicator {
      display: none;
    }
    input[type="number"] {
      -moz-appearance: textfield;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    th {
      text-align: left;
      font-weight: 500;
      color: var(--secondary-text-color, #666);
    }
    td {
      padding: 1px 2px;
    }
    input {
      width: 100%;
      box-sizing: border-box;
      font: inherit;
      color: inherit;
      background: transparent;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      padding: 1px 2px;
    }
    input[disabled] {
      opacity: 0.5;
    }
    button {
      font: inherit;
      cursor: pointer;
    }
    .icon_btn {
      border: none;
      background: transparent;
      color: var(--secondary-text-color, #666);
      padding: 0 4px;
    }
    .clouds_edit {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid var(--divider-color, #aaa);
      font-size: 11px;
    }
    .clouds_edit label {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-right: auto;
    }
    .clouds_edit input[type="checkbox"] {
      width: auto;
    }
    .clouds_edit input[type="time"],
    .clouds_edit select {
      width: auto;
      font-size: 11px;
    }
    .add {
      margin-top: 4px;
      width: 100%;
      border: 1px dashed var(--divider-color, #aaa);
      border-radius: 6px;
      background: transparent;
      color: inherit;
      padding: 2px;
    }
    .weather_mode {
      margin-bottom: 6px;
      padding: 4px 8px;
      border-radius: 6px;
      background: rgba(127, 127, 127, 0.1);
      color: var(--primary-text-color, #222);
    }
    .weather_mode.on {
      background: rgba(242, 194, 48, 0.18);
    }
    .weather_toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      cursor: pointer;
    }
    /* A checkbox drawn as a switch */
    .weather_switch {
      appearance: none;
      position: relative;
      width: 30px !important;
      height: 16px;
      margin: 0;
      border-radius: 8px;
      background: rgba(127, 127, 127, 0.5);
      cursor: pointer;
      transition: background 0.2s;
    }
    .weather_switch::after {
      content: "";
      position: absolute;
      top: 2px;
      left: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
      transition: left 0.2s;
    }
    .weather_switch:checked {
      background: #f2c230;
    }
    .weather_switch:checked::after {
      left: 16px;
    }
    .weather_notice {
      margin-top: 4px;
      font-size: 0.9em;
    }
    .weather_notice.pending {
      font-style: italic;
    }
    .library {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
    }
    .library_label {
      white-space: nowrap;
      color: var(--secondary-text-color, #666);
    }
    .library_select {
      flex: 1 1 auto;
      min-width: 0;
    }
    .naming {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.35);
      border-radius: inherit;
    }
    .naming_box {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 80%;
      padding: 14px;
      border-radius: 10px;
      background: var(--card-background-color, #fff);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
    .naming_box label {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .rename_error {
      color: var(--error-color, #db4437);
    }
    .naming_buttons {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .spacer {
      flex: 1;
    }
    .save {
      border: none;
      border-radius: 14px;
      padding: 4px 14px;
      color: #fff;
      background: rgb(197, 91, 90);
    }
    .cancel {
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 14px;
      padding: 4px 14px;
      background: transparent;
      color: inherit;
    }
    .swatch {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 3px;
    }
    .chart_grid {
      stroke: rgba(255, 255, 255, 0.15);
    }
    .chart_axis {
      stroke: rgba(255, 255, 255, 0.55);
    }
    .chart_tick {
      font-size: 9px;
      fill: rgba(255, 255, 255, 0.8);
    }
    .chart_curve {
      fill: none;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .kelvin_label {
      font-size: 11px;
      font-weight: 700;
    }
    .kelvin_box {
      fill: rgba(22, 33, 58, 0.4);
    }
    .kelvin_mark {
      stroke: rgba(255, 255, 255, 0.5);
    }
    .handle {
      cursor: grab;
      stroke: #16213a;
      stroke-width: 1.5;
    }
    .handle.locked {
      cursor: default;
    }
    .save:disabled,
    .all_days:disabled {
      opacity: 0.45;
      cursor: default;
    }
  `;

  static override properties = {
    _channel: { state: true },
    mode: { state: true },
    _all_days: { state: true },
    _tick: { state: true },
    library: { state: true },
    library_entry: { state: true },
    naming: { state: true },
    deleting: { state: true },
    renaming: { state: true },
    rename_error: { state: true },
    writing: { state: true },
  };

  /** The lamp being edited */
  led: any = null;
  /** ISO weekday of the program */
  day: number = 1;
  /** Program as the device sent it */
  source: DayProgram = {};
  format: ProgramFormat = "wb";
  /**
   * How the program is edited. A G1 program (white/blue) can also be edited
   * as intensity + colour temperature; it is saved back as white/blue.
   */
  mode: ProgramFormat = "wb";
  /** Points being edited, per channel */
  points: Partial<Record<ProgramChannel, EditPoint[]>> = {};

  _channel: ProgramChannel = "white";
  _all_days: boolean = false;
  /** Bumped on every edit to re-render */
  _tick: number = 0;

  /** Programs of the cloud library, null when the lamp is not linked */
  library: LibraryEntry[] | null = null;
  /** Library program loaded in the editor, null for the lamp's own */
  library_entry: LibraryEntry | null = null;
  /** Whether the points were edited: a new program, named in the library */
  dirty: boolean = false;
  /** Name typed for a new program, null when not asking for one */
  naming: string | null = null;
  /** Whether the deletion of the loaded library program is being confirmed */
  deleting: boolean = false;
  /**
   * Clouds chosen in the editor (one window a day, as the ReefBeat app):
   * null once removed, undefined while they are the program's own.
   */
  clouds_edit: CloudProgram | null | undefined = undefined;
  /** New name typed for the loaded library program, null when not asked */
  renaming: string | null = null;
  /** Why the last renaming was refused, "" when it was not */
  rename_error: string = "";
  /** A program being written to the lamp(s): requests sent / to send */
  writing: { done: number; total: number } | null = null;

  /**
   * Pause between two requests written to a lamp (ms): a ReefLED takes time
   * to handle a command, and answers late (or not at all) to one sent too
   * soon.
   */
  static WRITE_DELAY_MS = 2000;

  /**
   * Load a day program into the editor.
   * @param led: the lamp
   * @param day: ISO weekday
   * @param format_hint: format to use when the day holds no program
   */
  load(led: any, day: number, format_hint: ProgramFormat = "wb"): void {
    const first = this.led !== led;
    this.led = led;
    this.day = day;
    this.library_entry = null;
    this._weather_sig = null;
    if (first) {
      this.weather_draft = null;
      this.preview = null;
      this.weather_settings = null;
      this.settings_dirty = false;
    }
    if (this.weather_on() || this.lamp_weather()) {
      this._sync_weather();
      // Its settings, and its own week kept aside
      if (first) void this.fetch_preview();
    } else {
      this._use(led?.program?.(day) ?? null, format_hint, !first);
    }
    // The library does not depend on the day: read once per lamp
    if (first) void this.fetch_library();
  }

  // ── GPS weather mode ─────────────────────────────────────────────────

  /** Whether the lamp follows the weather (switch weather_sync on). */
  lamp_weather(): boolean {
    return this.led?.get_entity?.("weather_sync")?.state === "on";
  }

  /**
   * The GPS weather mode chosen in the editor, not saved yet: null while it
   * is the lamp's. Nothing is written before Save.
   */
  weather_draft: boolean | null = null;

  /** Whether the editor shows the weather: the mode chosen, else the lamp's. */
  weather_on(): boolean {
    return this.weather_draft ?? this.lamp_weather();
  }

  /**
   * What the integration would make now (redsea.led_weather_preview): the
   * weather week, and the lamp's own week (kept aside in weather mode).
   */
  preview: {
    status?: string;
    error?: string;
    days?: any[];
    standard?: Record<string, any>;
    settings?: WeatherSettings;
  } | null = null;

  /** Whether the preview is being read. */
  preview_loading: boolean = false;

  /**
   * The weather settings being edited (the stored ones, as the preview
   * first gave them), saved on Save only.
   */
  weather_settings: WeatherSettings | null = null;

  /** Whether the settings were changed in the editor. */
  settings_dirty: boolean = false;

  /** A Save of the weather under way ("saving"), or done ("saved"). */
  saving: "saving" | "saved" | null = null;

  /** Pause before previewing settings changed, for changes in a row (ms). */
  static readonly PREVIEW_DELAY_MS = 400;
  private _preview_timer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Read the preview (see preview) of the settings being edited, then show
   * the day it gives.
   */
  async fetch_preview(): Promise<void> {
    this.preview_loading = true;
    this._tick++;
    const res = await this._ask(
      "led_weather_preview",
      this.settings_dirty && this.weather_settings
        ? { settings: this.weather_settings }
        : {},
    );
    this.preview = res && typeof res === "object" ? res : null;
    if (this.weather_settings === null && this.preview?.settings) {
      this.weather_settings = { ...this.preview.settings };
    }
    this.preview_loading = false;
    this._weather_sig = null;
    this._sync_weather();
    this._tick++;
  }

  /**
   * A weather setting changed in the panel: kept in the draft, and the week
   * it makes previewed once the changes pause.
   * @param key: the setting
   * @param value: its new value
   */
  set_weather_setting(key: string, value: any): void {
    this.weather_settings = { ...(this.weather_settings ?? {}), [key]: value };
    this.settings_dirty = true;
    if (this._preview_timer) clearTimeout(this._preview_timer);
    this._preview_timer = setTimeout(() => {
      this._preview_timer = null;
      void this.fetch_preview();
    }, RSLedProgramEditor.PREVIEW_DELAY_MS);
    this._tick++;
  }

  /** Nothing to edit: the weather writes the week, or it is being read. */
  locked(): boolean {
    return this.weather_on() || this.preview_loading;
  }

  /**
   * Program of a day of the weather week: the preview's, else the
   * generated one (weather_program sensor); null when neither has the day.
   * @param day: ISO weekday
   */
  weather_program(day: number): DayProgram | null {
    const days = Array.isArray(this.preview?.days)
      ? this.preview.days
      : this.led?.get_entity?.("weather_program")?.attributes?.days;
    if (!Array.isArray(days)) return null;
    const entry = days.find((d: any) => d?.weekday === day);
    return day_program(entry?.program);
  }

  /**
   * The lamp's own program of a day while it follows the weather: the week
   * the integration kept aside (the lamp holds the weather's).
   * @param day: ISO weekday
   */
  standard_program(day: number): DayProgram | null {
    return day_program(this.preview?.standard?.[String(day)]);
  }

  /** What the editor shows of the weather, to know when it changes. */
  private _weather_sig: string | null = null;

  /**
   * Show what the mode gives: in weather mode the day the weather makes,
   * read only; out of it, the lamp's own program (the one kept aside, when
   * the lamp still follows the weather), to edit. A lamp out of weather
   * mode is left as the user edits it.
   */
  private _sync_weather(): void {
    let prog: DayProgram | null;
    if (this.weather_on()) {
      prog =
        this.weather_program(this.day) ?? this.led?.program?.(this.day) ?? null;
    } else if (this.lamp_weather()) {
      prog = this.standard_program(this.day);
    } else {
      if (this._weather_sig === null) return;
      this._weather_sig = null;
      this.library_entry = null;
      // Out of weather mode: the lamp's own format again
      this._use(
        this.led?.program?.(this.day) ?? null,
        this.format,
        !this._weather_kelvin,
      );
      this._weather_kelvin = false;
      return;
    }
    const sig = `${this.weather_on()}|${JSON.stringify(prog)}`;
    if (sig === this._weather_sig) return;
    this._weather_sig = sig;
    this.library_entry = null;
    this.naming = null;
    this.deleting = false;
    const keep = this.weather_on() || !this._weather_kelvin;
    if (!this.weather_on()) this._weather_kelvin = false;
    this._use(prog, this.format, keep);
    // The colours of the weather days are set as colour temperatures: a G1
    // shows them in intensity + colour
    if (this.weather_on() && this.format === "wb" && this.mode !== "kelvin") {
      this._weather_kelvin = true;
      void this.set_mode("kelvin");
    }
  }

  /** Whether the weather mode switched a G1 to intensity + colour. */
  private _weather_kelvin: boolean = false;

  /**
   * Whether the program can be edited as white and blue curves: not on a
   * G1 grouped with a G2 (edited as intensity + colour, saved as its own
   * white/blue).
   */
  white_blue_allowed(): boolean {
    return this.led?.can_white_blue?.() !== false;
  }

  /** Programs put in the editor so far (see set_mode). */
  private _loaded: number = 0;

  /** Weather mode: the slots are shown, only their colour can be changed. */
  colour_only(): boolean {
    return this.weather_on() && !this.preview_loading;
  }

  /**
   * The colours of the day's slots become the weather days' colours (of
   * this day, or of every day): a colour profile from the rise (0) to the
   * set (1), previewed then saved with the weather settings.
   */
  private _weather_colors(): void {
    const pts = this.points.intensity ?? [];
    if (pts.length < 2) return;
    const rise = pts[0].m;
    const span = pts[pts.length - 1].m - rise || 1;
    const profile = pts.map((p) => ({
      at: Math.round(((p.m - rise) / span) * 1000) / 1000,
      k: p.k ?? DEFAULT_KELVIN,
    }));
    const days = this._all_days ? [1, 2, 3, 4, 5, 6, 7] : [this.day];
    const colors = { ...(this.weather_settings?.colors ?? {}) };
    for (const day of days) colors[String(day)] = profile;
    this.set_weather_setting("colors", colors);
  }

  /**
   * Home Assistant's states changed: a new weather week, or the mode
   * changed elsewhere.
   */
  hass_changed(): void {
    // The mode chosen here is the lamp's now: nothing left to save
    if (this.weather_draft === this.lamp_weather()) this.weather_draft = null;
    this._sync_weather();
    this._follow_write();
    this._tick++;
  }

  /**
   * Put a program in the editor.
   * @param data: the program on the day's timeline
   * @param format_hint: format to use when it holds no channel
   * @param keep_mode: keep a G1 edited as intensity + colour in that mode
   */
  private _use(
    data: DayProgram | null,
    format_hint: ProgramFormat,
    keep_mode: boolean,
  ): void {
    const keep_kelvin = keep_mode && this.mode === "kelvin";
    this._loaded++;
    this.source = data ? structuredClone(data) : {};
    this.format = program_format(this.source) ?? format_hint;
    this.points = {};
    for (const ch of format_channels(this.format)) {
      this.points[ch] = to_edit_points(
        (this.source as any)[ch],
        ch === "intensity",
      );
    }
    this.mode = this.format;
    this.dirty = false;
    this.clouds_edit = undefined;
    // A G1 grouped with a G2 is edited as its group is driven
    if (keep_kelvin || (this.format === "wb" && !this.white_blue_allowed())) {
      void this.set_mode("kelvin");
    }
    if (!format_channels(this.mode).includes(this._channel)) {
      this._channel = format_channels(this.mode)[0];
    }
    this._tick++;
  }

  // ── Cloud library ────────────────────────────────────────────────────

  /** Config entry of the lamp (of the virtual LED for a group). */
  private _own_entry(): string | undefined {
    return this.led?.device?.elements?.[0]?.primary_config_entry;
  }

  /**
   * Call a redsea service answering with a response.
   * @param service: the service
   * @param data: its data, the lamp's entry added
   * @return the response, null when the call failed
   */
  private async _ask(service: string, data: any = {}): Promise<any> {
    const hass = this.led?.hass;
    const device_id = this._own_entry();
    if (!device_id || typeof hass?.callWS !== "function") return null;
    try {
      const answer = await hass.callWS({
        type: "call_service",
        domain: "redsea",
        service,
        service_data: { device_id, ...data },
        return_response: true,
      });
      return answer?.response ?? null;
    } catch (err) {
      console.warn(`RSLED: redsea.${service} failed`, err);
      return null;
    }
  }

  /** Read the programs of the lamp's cloud library (redsea.led_library). */
  async fetch_library(): Promise<void> {
    const res = await this._ask("led_library");
    this.library =
      res?.linked === true && Array.isArray(res.programs)
        ? res.programs.filter(
            (p: any) =>
              p && typeof p.name === "string" && typeof p.program === "object",
          )
        : null;
  }

  /**
   * Load a program of the library, in the lamp's format: a G1 program is
   * shown in kelvin on a G2, a G2 one is edited in kelvin on a G1 (and saved
   * back as white/blue).
   * @param uid: the program, "" for the lamp's own program of the day
   */
  async use_library(uid: string): Promise<void> {
    const entry = this.library?.find((p) => p.uid === uid) ?? null;
    if (!entry) {
      this.load(this.led, this.day, this.format);
      return;
    }
    const lamp_g2 = this.led?.has_white_blue?.() === false;
    const entry_g2 = entry.program?.color !== undefined;
    // Library programs are on a single day's timeline: day 1 has no offset
    let prog = normalize_program(entry.program, 1, entry_g2);
    if (lamp_g2 && !entry_g2) prog = wb_to_kelvin_program(prog, this._model());
    this._use(prog, lamp_g2 ? "kelvin" : "wb", false);
    if (!lamp_g2 && entry_g2) {
      // Edited as intensity + colour on a G1 (the "wb" format)
      this.format = "wb";
      this.mode = "kelvin";
      this._channel = "intensity";
      // Saved as white/blue: the intensity channel is not the lamp's
      delete (this.source as any).intensity;
      this.points.white = [];
      this.points.blue = [];
    }
    this.library_entry = entry;
    this._tick++;
  }

  /**
   * Clouds sent with the program: the ones chosen in the editor, else the
   * library program's, else the day's.
   */
  private _clouds(day: number): any {
    if (this.clouds_edit !== undefined) return this.clouds_edit;
    return this.library_entry
      ? (this.library_entry.clouds ?? null)
      : (this.led?.clouds?.(day) ?? null);
  }

  // ── Clouds ───────────────────────────────────────────────────────────

  /** Clouds of the edited day, cut to its light: null when none. */
  clouds(): CloudProgram | null {
    return fit_clouds(this._clouds(this.day), this.chart_program());
  }

  /**
   * Add the clouds (over the whole day of light, medium) or remove them.
   * @param on: whether the day has clouds
   */
  set_clouds(on: boolean): void {
    const window = sun_window(this.chart_program());
    if (on && !window) return;
    this.clouds_edit = on
      ? { from: window!.rise, to: window!.set, intensity: "Medium" }
      : null;
    this._changed();
  }

  /**
   * Set the start or the end of the clouds from an "HH:MM" text. They stay
   * inside the day of light (the lamp refuses them otherwise): a time
   * leaving nothing of them is not taken.
   * @param key: "from" or "to"
   * @param value: the text typed
   */
  set_clouds_time(key: "from" | "to", value: string): void {
    const current = this.clouds();
    const window = sun_window(this.chart_program());
    let minutes = parse_time(value);
    this._tick++;
    if (!current || !window || minutes === null) return;
    // A day of light running past midnight: the times after it
    if (minutes < window.rise && minutes + MINUTES_PER_DAY <= window.set) {
      minutes += MINUTES_PER_DAY;
    }
    minutes = Math.min(window.set, Math.max(window.rise, minutes));
    const next = {
      from: Number(current.from),
      to: Number(current.to),
      intensity: current.intensity ?? "Medium",
      [key]: minutes,
    };
    if (next.to <= next.from) return;
    this.clouds_edit = next;
    this._changed();
  }

  /**
   * Set the intensity of the clouds.
   * @param level: Low, Medium or High
   */
  set_clouds_intensity(level: string): void {
    const current = this.clouds();
    if (!current || !(CLOUD_LEVELS as readonly string[]).includes(level)) {
      return;
    }
    this.clouds_edit = {
      from: current.from,
      to: current.to,
      intensity: level,
    };
    this._changed();
  }

  /**
   * Add the edited program to the cloud library (redsea.led_library_save),
   * in the format of the first lamp it is written to, or update one of the
   * user's programs.
   * @param name: its name in the library
   * @param uid: the program to update, none to add a new one
   */
  async save_to_library(name: string, uid?: string): Promise<void> {
    const target = this.targets()[0];
    if (!target) return;
    const prog = await this.program_for(target);
    await this._ask("led_library_save", {
      name,
      program: device_program(prog, 1, target.g2),
      clouds: library_clouds(this._clouds(this.day)),
      ...(uid ? { uid } : {}),
    });
  }

  /**
   * Rename the loaded user's program (redsea.led_library_rename): in the
   * library, its curves kept, and on every day named after it of the lamp
   * and of the lamps of its group (the integration writes them, its
   * progress shown as for a week being written).
   */
  async rename_in_library(): Promise<void> {
    const entry = this.own_entry();
    const name = (this.renaming ?? "").trim();
    if (!entry || !name) return;
    if (name === entry.name) {
      this.renaming = null;
      return;
    }
    this.rename_error = "";
    const res = await this._ask("led_library_rename", {
      uid: entry.uid,
      name,
    });
    if (!res || res.error) {
      // Nothing renamed: the box stays, and says why
      this.rename_error = String(
        res?.error ?? i18n._("led_library_rename_failed"),
      );
      return;
    }
    this.renaming = null;
    await this.fetch_library();
    this.library_entry = this.library?.find((p) => p.uid === entry.uid) ?? {
      ...entry,
      name,
    };
    this._tick++;
  }

  /** Whether the loaded program is one of the user's (editable) ones. */
  own_entry(): LibraryEntry | null {
    const entry = this.library_entry;
    return entry && !entry.default ? entry : null;
  }

  /**
   * Delete the loaded program from the library (redsea.led_library_delete),
   * then show the lamp's own program again. The Red Sea programs cannot be.
   */
  async delete_from_library(): Promise<void> {
    this.deleting = false;
    const entry = this.own_entry();
    if (!entry) return;
    await this._ask("led_library_delete", { uid: entry.uid });
    await this.fetch_library();
    this.load(this.led, this.day, this.format);
  }

  /**
   * Switch a G1 program between white/blue and intensity/colour editing.
   * The points are converted by the integration (redsea.led_convert: the
   * lamp's own table and intensity compensation), locally when the service
   * does not answer. A white/blue program becomes one intensity point
   * wherever either channel had one.
   * @param mode: the edit mode
   */
  async set_mode(mode: ProgramFormat): Promise<void> {
    if (this.format !== "wb" || mode === this.mode) return;
    // Another program put in the editor meanwhile: this one is dropped
    const loaded = this._loaded;
    if (mode === "kelvin") {
      const samples = white_blue_samples(
        this.points.white ?? [],
        this.points.blue ?? [],
      );
      const converted = await this.convert(
        samples.map((p) => ({ white: Math.round(p.w), blue: Math.round(p.b) })),
      );
      if (loaded !== this._loaded) return;
      this.points.intensity = kelvin_points_from_samples(
        samples,
        converted ?? convert_samples_locally(samples, this._model()),
      );
    } else {
      const { white, blue } = await this._to_white_blue();
      if (loaded !== this._loaded) return;
      this.points.white = white;
      this.points.blue = blue;
    }
    this.mode = mode;
    if (!format_channels(mode).includes(this._channel)) {
      this._channel = format_channels(mode)[0];
    }
    this._tick++;
  }

  /**
   * Convert points through the integration's redsea.led_convert service.
   * @param points: {kelvin, intensity} or {white, blue} objects
   * @return one answer per point, or null when the service is unavailable
   */
  async convert(
    points: ConvertedPoint[],
    target?: EditorTarget,
  ): Promise<ConvertedPoint[] | null> {
    const hass = this.led?.hass;
    const device_id = (target ?? this._g1_target())?.device_id;
    if (!points.length || !device_id || typeof hass?.callWS !== "function") {
      return null;
    }
    try {
      const answer = await hass.callWS({
        type: "call_service",
        domain: "redsea",
        service: "led_convert",
        service_data: { device_id, points },
        return_response: true,
      });
      const res = answer?.response?.points;
      return Array.isArray(res) && res.length === points.length ? res : null;
    } catch (err) {
      console.warn("RSLED: redsea.led_convert failed", err);
      return null;
    }
  }

  /**
   * White/blue points from the intensity ones, through the integration.
   * @param target: the G1 lamp they are for, the first G1 by default
   */
  private async _to_white_blue(target?: EditorTarget): Promise<{
    white: EditPoint[];
    blue: EditPoint[];
  }> {
    const pts = this.points.intensity ?? [];
    const converted = await this.convert(
      pts.map((p) => ({ kelvin: p.k ?? DEFAULT_KELVIN, intensity: p.i })),
      target,
    );
    return kelvin_points_to_white_blue(
      pts,
      target?.model ?? this._model(),
      converted,
    );
  }

  /** Lamps the program is written to: the lamp, or each lamp of a group. */
  targets(): EditorTarget[] {
    const targets = this.led?.program_targets?.();
    if (Array.isArray(targets) && targets.length) return targets;
    const el = this.led?.device?.elements?.[0];
    return el?.primary_config_entry
      ? [
          {
            device_id: el.primary_config_entry,
            g2: this.led?.has_white_blue?.() === false,
            model: el.model,
          },
        ]
      : [];
  }

  /** First G1 of the targets: the one converting white/blue. */
  private _g1_target(): EditorTarget | undefined {
    return this.targets().find((t) => !t.g2);
  }

  /** Model of the lamp: each G1 has its own white/blue balance table. */
  private _model(): string | undefined {
    return (
      this.led?.g1_model?.() ??
      this._g1_target()?.model ??
      this.led?.device?.elements?.[0]?.model
    );
  }

  /** White/blue points, from the intensity ones in kelvin mode (G1). */
  private _wb_points(): { white: EditPoint[]; blue: EditPoint[] } {
    if (this.mode === "kelvin") {
      return kelvin_points_to_white_blue(
        this.points.intensity ?? [],
        this._model(),
      );
    }
    return { white: this.points.white ?? [], blue: this.points.blue ?? [] };
  }

  /** Program drawn on the chart: in the edit mode. */
  chart_program(): DayProgram {
    if (this.format === "wb" && this.mode === "kelvin") {
      const out: any = {};
      const intensity = from_edit_points(this.points.intensity ?? [], "k");
      const moon = from_edit_points(this.points.moon ?? []);
      if (intensity) out.intensity = intensity;
      if (moon) out.moon = moon;
      return out;
    }
    return this.program();
  }

  /**
   * Program as it will be saved, converted locally in kelvin mode.
   * @param wb: white/blue points to use instead (converted by the
   *            integration, see program_to_save())
   */
  program(wb?: { white: EditPoint[]; blue: EditPoint[] }): DayProgram {
    const out: any = structuredClone(this.source);
    const points: Partial<Record<ProgramChannel, EditPoint[]>> = {
      ...this.points,
    };
    if (this.format === "wb") Object.assign(points, wb ?? this._wb_points());
    for (const ch of format_channels(this.format)) {
      const key =
        ch === "intensity" ? kelvin_key_of((this.source as any)[ch]) : null;
      const channel = from_edit_points(points[ch] ?? [], key);
      if (channel) out[ch] = channel;
      else delete out[ch];
    }
    return out as DayProgram;
  }

  /** Program to send: a G1 edited in kelvin goes back through led_convert. */
  async program_to_save(): Promise<DayProgram> {
    const target = this.targets()[0];
    return target ? this.program_for(target) : this.program();
  }

  /**
   * Program to send to one lamp, in its own format: white/blue for a G1
   * (converted with its own balance table), intensity + colour for a G2.
   * @param target: the lamp
   */
  async program_for(target: EditorTarget): Promise<DayProgram> {
    if (target.g2) {
      if (this.format === "kelvin") return this.program();
      // A G1 program for a G2 (not met: a group with a G2 edits in kelvin)
      if (this.mode === "kelvin") return this.chart_program();
      const out: any = {};
      const intensity = from_edit_points(
        white_blue_to_kelvin_points(
          this.points.white ?? [],
          this.points.blue ?? [],
          this._model(),
        ),
        "k",
      );
      const moon = from_edit_points(this.points.moon ?? []);
      if (intensity) out.intensity = intensity;
      if (moon) out.moon = moon;
      return out;
    }
    if (this.format === "wb") {
      return this.mode === "kelvin"
        ? this.program(await this._to_white_blue(target))
        : this.program();
    }
    // A G2 program for a G1 of the same group: split into white and blue
    const { white, blue } = await this._to_white_blue(target);
    const out: any = {};
    const channels = { white, blue, moon: this.points.moon ?? [] };
    for (const [key, pts] of Object.entries(channels)) {
      const ch = from_edit_points(pts);
      if (ch) out[key] = ch;
    }
    return out;
  }

  // ── Edits ────────────────────────────────────────────────────────────

  private _pts(): EditPoint[] {
    return this.points[this._channel] ?? [];
  }

  private _changed(): void {
    this.dirty = true;
    this._tick++;
  }

  /**
   * Set the time of a point from an "HH:MM" text.
   * @param n: index of the point
   * @param value: the text typed
   */
  set_time(n: number, value: string): void {
    const pts = this._pts();
    const minutes = parse_time(value);
    if (minutes === null || !pts[n]) return;
    pts[n].m = place_time(
      minutes,
      n > 0 ? pts[n - 1].m : null,
      n < pts.length - 1 ? pts[n + 1].m : null,
    );
    this._changed();
  }

  /**
   * Set the intensity of a point (not of the rise nor of the set).
   * @param n: index of the point
   * @param value: the intensity in %
   */
  set_intensity(n: number, value: number): void {
    const pts = this._pts();
    if (!pts[n] || n === 0 || n === pts.length - 1) return;
    const v = Number(value);
    if (!Number.isFinite(v)) return;
    pts[n].i = Math.max(0, Math.min(100, Math.round(v)));
    this._changed();
  }

  /**
   * Set the colour temperature of a point.
   * @param n: index of the point
   * @param value: the colour temperature in K
   */
  set_kelvin(n: number, value: number): void {
    const pts = this._pts();
    const v = Number(value);
    if (!pts[n] || !Number.isFinite(v)) return;
    const min = this.led?.kelvin_range?.().min ?? 8000;
    const max = this.led?.kelvin_range?.().max ?? 23000;
    pts[n].k = Math.max(min, Math.min(max, Math.round(v / 100) * 100));
    this._changed();
    if (this.weather_on()) this._weather_colors();
  }

  /** Add a point in the middle of the widest gap, or a default program. */
  add_point(): void {
    const pts = this._pts();
    if (pts.length < 2) {
      this.points[this._channel] = structuredClone(
        DEFAULT_POINTS[this._channel],
      );
      this._changed();
      return;
    }
    let best = 1;
    for (let n = 2; n < pts.length; n++) {
      if (pts[n].m - pts[n - 1].m > pts[best].m - pts[best - 1].m) best = n;
    }
    const a = pts[best - 1];
    const b = pts[best];
    if (b.m - a.m < 2) return;
    const pt: EditPoint = {
      m: Math.round((a.m + b.m) / 2),
      i: Math.round((a.i + b.i) / 2),
    };
    if (a.k !== undefined) pt.k = a.k;
    pts.splice(best, 0, pt);
    this._changed();
  }

  /**
   * Remove a point (rise and set stay).
   * @param n: index of the point
   */
  remove_point(n: number): void {
    const pts = this._pts();
    if (n <= 0 || n >= pts.length - 1) return;
    pts.splice(n, 1);
    this._changed();
  }

  /** Remove the whole channel. */
  clear_channel(): void {
    this.points[this._channel] = [];
    this._changed();
  }

  // ── Drag on the chart ────────────────────────────────────────────────

  /**
   * Move a point to a position of the chart.
   * @param n: index of the point
   * @param x: horizontal position in chart coordinates
   * @param y: vertical position in chart coordinates
   */
  drag_to(n: number, x: number, y: number): void {
    const pts = this._pts();
    if (!pts[n]) return;
    const { minute_at, pct_at } = chart_scale(EDITOR_CHART);
    // A point already past midnight stays on the next day's side
    const offset = pts[n].m >= MINUTES_PER_DAY ? MINUTES_PER_DAY : 0;
    let m = Math.round(minute_at(x) / DRAG_STEP) * DRAG_STEP + offset;
    const lo = n > 0 ? pts[n - 1].m + 1 : 0;
    const hi = n < pts.length - 1 ? pts[n + 1].m - 1 : 2 * MINUTES_PER_DAY - 1;
    m = Math.max(lo, Math.min(hi, m));
    pts[n].m = m;
    if (n > 0 && n < pts.length - 1) {
      pts[n].i = Math.max(0, Math.min(100, Math.round(pct_at(y))));
    }
    this._changed();
  }

  private _on_handle_down(ev: PointerEvent, n: number): void {
    ev.preventDefault();
    ev.stopPropagation();
    // The weather writes the week: nothing to move
    if (this.locked()) return;
    const svg_el = this.shadowRoot?.querySelector("svg") as SVGSVGElement;
    if (!svg_el) return;
    const rect = svg_el.getBoundingClientRect();
    const to_chart = (e: PointerEvent) => ({
      x: ((e.clientX - rect.left) / (rect.width || 1)) * EDITOR_VIEW.width,
      y: ((e.clientY - rect.top) / (rect.height || 1)) * EDITOR_VIEW.height,
    });
    const move = (e: PointerEvent) => {
      const p = to_chart(e);
      this.drag_to(n, p.x, p.y);
    };
    const up = () => {
      svg_el.removeEventListener("pointermove", move);
      svg_el.removeEventListener("pointerup", up);
      svg_el.removeEventListener("pointercancel", up);
    };
    try {
      svg_el.setPointerCapture(ev.pointerId);
    } catch {
      /* not supported (tests) */
    }
    svg_el.addEventListener("pointermove", move);
    svg_el.addEventListener("pointerup", up);
    svg_el.addEventListener("pointercancel", up);
  }

  // ── Save / close ─────────────────────────────────────────────────────

  /**
   * Save: a new program in a lamp linked to the cloud is first given a name
   * (see confirm_name()), the others go to the lamp at once.
   */
  async save(): Promise<void> {
    if (this.preview_loading || this.saving) return;
    if (this.weather_on()) {
      // The settings and the mode: saved and the week shown at once by the
      // integration, which then writes the lamp in the background
      if (this.weather_draft === true || this.settings_dirty) {
        if (!(await this._save_weather(true))) return;
        this._saved();
      } else {
        this.close();
      }
      return;
    }
    if (this.weather_draft === false) {
      // The lamp's own week back; the day edited, if any, written over it
      // once the lamp holds it
      const edited = this.dirty;
      if (!(await this._save_weather(false, edited))) return;
      if (!edited) {
        this._saved();
        return;
      }
      this.saving = null;
    }
    if (this.library !== null && this.dirty) {
      // One of the user's programs keeps its name, a new one gets a date
      this.naming = this.own_entry()?.name ?? default_program_name();
      return;
    }
    await this.write(this.library_entry?.name ?? null);
  }

  /**
   * Save the program in the library under the name typed, then send it.
   * @param update: update the loaded user's program rather than adding one
   */
  async confirm_name(update: boolean = false): Promise<void> {
    const name = (this.naming ?? "").trim();
    if (!name) return;
    this.naming = null;
    const own = update ? this.own_entry() : null;
    await this.save_to_library(name, own?.uid);
    await this.write(name);
  }

  /**
   * Send the program to the lamp (to each lamp of a group) and close.
   * @param name: name of the program in the library, shown by the lamp;
   *              null to keep the lamp's own
   */
  async write(name: string | null): Promise<void> {
    const hass = this.led?.hass;
    const targets = this.targets();
    if (!hass || !targets.length) {
      console.error("RSLED program save: missing hass or device id");
      return;
    }
    const days = this._all_days ? [1, 2, 3, 4, 5, 6, 7] : [this.day];
    // Every request, in the order they are sent
    const ops: WriteRequest[] = [];
    const request = (
      device_id: string,
      access_path: string,
      data: any,
      method: string = "post",
    ) => {
      ops.push({ device_id, access_path, method, data });
    };
    for (const target of targets) {
      const prog = await this.program_for(target);
      // Names first, as the ReefBeat app
      if (name) {
        // As the ReefBeat app: a G1 program is named with a stamp, a G2 one
        // with its bare name
        const stamped = target.g2 ? name : preset_name(name);
        for (const day of days) {
          request(target.device_id, `/preset_name/${day}`, {
            name: stamped,
          });
        }
      }
      for (const day of days) {
        // The lamp refuses clouds outside the day of its program, and a
        // program leaving its clouds out: they are cut to the new day
        const held = this.led?.clouds?.(day) ?? null;
        const wanted = fit_clouds(this._clouds(day), prog);
        if (target.g2) {
          // A G2 keeps its clouds in its program
          request(
            target.device_id,
            `/auto/${day}`,
            device_program(prog, day, true, wanted ?? undefined),
          );
          continue;
        }
        // A G1 keeps its clouds apart: a library program or the editor
        // brings new ones, the lamp's own are kept unless the new day cuts
        // them.
        // They go before the program, and come back after it.
        const own = this._clouds(day);
        const change =
          this.library_entry !== null ||
          this.clouds_edit !== undefined ||
          wanted?.from !== own?.from ||
          wanted?.to !== own?.to;
        if (change && has_clouds(held)) {
          request(target.device_id, `/clouds/${day}`, {}, "delete");
        }
        request(
          target.device_id,
          `/auto/${day}`,
          device_program(prog, day, false),
        );
        if (change && wanted) {
          request(
            target.device_id,
            `/clouds/${day}`,
            // With the durations of their intensity, as the app sends them
            device_clouds(with_cloud_durations(wanted), day),
          );
        }
      }
      // The lamp only runs the new program once asked to (as the app does)
      request(target.device_id, "/auto/apply", {});
    }
    await this._send(hass, ops);
    this.close();
  }

  /**
   * Send the requests one after the other, paced (WRITE_DELAY_MS), the
   * progress shown meanwhile (see writing).
   * @param hass: Home Assistant
   * @param ops: the requests (redsea.request data)
   */
  private async _send(hass: any, ops: WriteRequest[]): Promise<void> {
    const total = ops.length;
    this.writing = { done: 0, total };
    this._tick++;
    try {
      for (const [n, op] of ops.entries()) {
        if (n > 0) await pause(RSLedProgramEditor.WRITE_DELAY_MS);
        await hass.callService("redsea", "request", op);
        this.writing = { done: n + 1, total };
        this._tick++;
      }
    } finally {
      this.writing = null;
      this._tick++;
    }
  }

  close(): void {
    this.dispatchEvent(
      new CustomEvent("rsled-editor-close", { bubbles: true, composed: true }),
    );
  }

  // ── Render ───────────────────────────────────────────────────────────

  /**
   * Choose the GPS weather mode in the editor: the chart shows what it
   * gives, the lamp is only written on Save (see save()).
   * @param on: the mode wanted
   */
  set_weather_mode(on: boolean): void {
    this.weather_draft = on === this.lamp_weather() ? null : on;
    // Whatever is shown now changes
    this._weather_sig = "";
    // The weather week, or the lamp's own week kept aside: read once
    if (this.preview === null && (on || this.lamp_weather())) {
      void this.fetch_preview();
    }
    this._sync_weather();
    this._tick++;
  }

  /**
   * Save the weather settings edited and the mode (redsea.led_weather_save):
   * the integration writes the weather week, or the lamp's own week back.
   * @param on: the mode saved
   */
  private async _save_weather(
    on: boolean,
    wait: boolean = false,
  ): Promise<boolean> {
    const settings = this.settings_dirty ? this.weather_settings : null;
    this.saving = "saving";
    this._tick++;
    const res = await this._ask("led_weather_save", {
      enabled: on,
      ...(settings ? { settings } : {}),
      ...(wait ? { wait: true } : {}),
    });
    if (!res || res.status === "error") {
      // Nothing saved: the editor stays, and says why
      this.saving = null;
      this.preview = {
        ...(this.preview ?? {}),
        status: "error",
        error: res?.error ?? i18n._("led_weather_save_failed"),
      };
      this._tick++;
      return false;
    }
    this.weather_draft = null;
    this.settings_dirty = false;
    return true;
  }

  /** How long "saved" shows before the editor closes (ms). */
  static readonly SAVED_MS = 800;

  /**
   * How long the integration is given to start writing the lamp(s) once it
   * saved the mode (ms): the weather week, or the lamp's own week back,
   * is written in the background.
   */
  static WRITE_GRACE_MS = 1500;

  /** Whether a Save waits for the integration to be done with the lamp(s). */
  private _write_wait: ReturnType<typeof setTimeout> | null | false = false;
  /** Whether that writing was seen under way. */
  private _write_seen: boolean = false;

  /**
   * Days the integration is writing to the lamp(s): the weather week, or
   * the lamp's own week back (weather_program's "writing"); null when it
   * writes nothing.
   */
  lamp_writing(): { done: number; total: number } | null {
    const writing =
      this.led?.get_entity?.("weather_program")?.attributes?.writing;
    const total = Number(writing?.total);
    return Number.isFinite(total)
      ? { done: Number(writing.done) || 0, total }
      : null;
  }

  /**
   * Settings saved: the integration now writes the lamp(s), a request
   * every few seconds. The editor stays, the progress shown as for a
   * program it writes itself, and closes once the lamp(s) hold the week.
   */
  private _saved(): void {
    this._write_seen = this.lamp_writing() !== null;
    this._write_wait = setTimeout(() => {
      this._write_wait = null;
      // Nothing was written (nothing to write, or done in between)
      if (this.lamp_writing() === null) this._written();
    }, RSLedProgramEditor.WRITE_GRACE_MS);
    this._tick++;
  }

  /** The states changed while a Save waits for the lamp(s) to be written. */
  private _follow_write(): void {
    if (this._write_wait === false) return;
    if (this.lamp_writing() !== null) {
      this._write_seen = true;
    } else if (this._write_seen) {
      this._written();
    }
  }

  /** The lamp(s) hold the week: said, then the editor closes. */
  private _written(): void {
    if (this._write_wait) clearTimeout(this._write_wait);
    this._write_wait = false;
    this.saving = "saved";
    this._tick++;
    setTimeout(() => this.close(), RSLedProgramEditor.SAVED_MS);
  }

  /**
   * The GPS weather mode switch, when the integration has the weather
   * program. While it is on the integration writes the week: an edit lasts
   * until its next weather fetch.
   */
  private _render_weather_notice(): TemplateResult | string {
    const entity = this.led?.get_entity?.("weather_sync");
    if (!entity) return "";
    const on = this.weather_on();
    const pending = this.preview_loading || this.saving === "saving";
    const failed =
      this.preview?.status === "error"
        ? `⚠ ${this.preview.error ?? ""}`.trim()
        : "";
    const notice = this.saving
      ? this.saving === "saving"
        ? `⏳ ${i18n._("led_weather_saving")}`
        : `✓ ${i18n._("led_weather_saved")}`
      : pending
        ? `⏳ ${i18n._("led_weather_loading")}`
        : failed ||
          (this.weather_draft === true || (on && this.settings_dirty)
            ? i18n._("led_weather_draft_on")
            : this.weather_draft === false
              ? i18n._("led_weather_draft_off")
              : on
                ? i18n._("led_weather_active")
                : "");
    return html`<div class="weather_mode ${on ? "on" : ""}">
      <label class="weather_toggle"
        ><input
          type="checkbox"
          role="switch"
          class="weather_switch"
          .checked=${on}
          ?disabled=${entity.state === "unavailable" || pending}
          @change=${(e: Event) =>
            this.set_weather_mode((e.target as HTMLInputElement).checked)}
        />
        ☀ ${i18n._("led_weather_mode")}</label
      >
      ${notice
        ? html`<div class="weather_notice ${pending ? "pending" : ""}">
            ${notice}
          </div>`
        : ""}
    </div>`;
  }

  /** Programs of the cloud library, when the lamp is linked to it. */
  private _render_library(): TemplateResult | string {
    if (this.library === null || this.locked()) return "";
    const selected = this.library_entry?.uid ?? "";
    return html`<div class="library">
      <span class="library_label">☁ ${i18n._("led_library")}</span>
      <select
        class="library_select"
        @change=${(e: Event) =>
          this.use_library((e.target as HTMLSelectElement).value)}
      >
        <option value="" ?selected=${selected === ""}>
          ${i18n._("led_library_current")}
        </option>
        ${this._render_group("led_library_redsea", true, selected)}
        ${this._render_group("led_library_mine", false, selected)}
      </select>
      ${this.own_entry()
        ? html`<button
            class="icon_btn library_rename"
            title="${i18n._("led_library_rename")}"
            @click=${() => {
              this.rename_error = "";
              // Only drawn for one of the user's programs
              this.renaming = this.own_entry()!.name;
            }}
          >
            ✎
          </button>`
        : ""}
      ${this.own_entry()
        ? html`<button
            class="icon_btn library_delete"
            title="${i18n._("led_library_delete")}"
            @click=${() => {
              this.deleting = true;
            }}
          >
            🗑
          </button>`
        : ""}
    </div>`;
  }

  /**
   * Programs of the library of one kind.
   * @param label: translation key of the group
   * @param red_sea: the Red Sea programs, else the user's
   * @param selected: uid of the program loaded
   */
  private _render_group(
    label: string,
    red_sea: boolean,
    selected: string,
  ): TemplateResult | string {
    // Only drawn with a library (see _render_library())
    const programs = (this.library as LibraryEntry[]).filter(
      (p) => (p.default === true) === red_sea,
    );
    if (!programs.length) return "";
    return html`<optgroup label="${i18n._(label)}">
      ${programs.map(
        (p) =>
          html`<option value="${p.uid}" ?selected=${p.uid === selected}>
            ${p.name}
          </option>`,
      )}
    </optgroup>`;
  }

  /** Confirmation of the deletion of the loaded library program. */
  private _render_deleting(): TemplateResult | string {
    const entry = this.own_entry();
    if (!this.deleting || !entry) return "";
    return html`<div class="naming">
      <div class="naming_box">
        <span>${i18n._("led_library_delete_confirm")}</span>
        <strong class="deleting_name">${entry.name}</strong>
        <div class="naming_buttons">
          <button
            class="cancel deleting_cancel"
            @click=${() => {
              this.deleting = false;
            }}
          >
            ${i18n._("cancel")}
          </button>
          <button
            class="save deleting_confirm"
            @click=${() => this.delete_from_library()}
          >
            ${i18n._("led_library_delete")}
          </button>
        </div>
      </div>
    </div>`;
  }

  /** New name of the loaded library program. */
  private _render_renaming(): TemplateResult | string {
    if (this.renaming === null || !this.own_entry()) return "";
    return html`<div class="naming">
      <div class="naming_box">
        <label>
          ${i18n._("led_library_rename")}
          <input
            class="renaming_input"
            .value=${this.renaming}
            @input=${(e: Event) => {
              this.renaming = (e.target as HTMLInputElement).value;
            }}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === "Enter") void this.rename_in_library();
            }}
          />
        </label>
        ${this.rename_error
          ? html`<span class="rename_error">⚠ ${this.rename_error}</span>`
          : ""}
        <div class="naming_buttons">
          <button
            class="cancel renaming_cancel"
            @click=${() => {
              this.renaming = null;
            }}
          >
            ${i18n._("cancel")}
          </button>
          <button
            class="save renaming_confirm"
            ?disabled=${!this.renaming.trim()}
            @click=${() => this.rename_in_library()}
          >
            ${i18n._("led_library_rename")}
          </button>
        </div>
      </div>
    </div>`;
  }

  /** Name of a new program, asked before it is saved. */
  private _render_naming(): TemplateResult | string {
    if (this.naming === null) return "";
    return html`<div class="naming">
      <div class="naming_box">
        <label>
          ${i18n._("led_library_name")}
          <input
            class="naming_input"
            .value=${this.naming}
            @input=${(e: Event) => {
              this.naming = (e.target as HTMLInputElement).value;
            }}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === "Enter") void this.confirm_name();
            }}
          />
        </label>
        <div class="naming_buttons">
          <button
            class="cancel naming_cancel"
            @click=${() => {
              this.naming = null;
            }}
          >
            ${i18n._("cancel")}
          </button>
          ${this.own_entry()
            ? html`<button
                class="save naming_update"
                ?disabled=${!this.naming.trim()}
                @click=${() => this.confirm_name(true)}
              >
                ${i18n._("led_library_update")}
              </button>`
            : ""}
          <button
            class="save naming_save"
            ?disabled=${!this.naming.trim()}
            @click=${() => this.confirm_name()}
          >
            ${i18n._(this.own_entry() ? "led_library_new" : "save")}
          </button>
        </div>
      </div>
    </div>`;
  }

  private _color(ch: ProgramChannel): string {
    return ch === "intensity"
      ? "#f2c230"
      : CURVE_COLORS_DEFAULT[ch as keyof typeof CURVE_COLORS_DEFAULT];
  }

  /** Border of a tab: white would vanish on a light card. */
  private _tab_color(ch: ProgramChannel): string {
    return ch === "white" ? "#9aa0a6" : this._color(ch);
  }

  protected override render(): TemplateResult {
    const channels = format_channels(this.mode);
    return html`<div class="panel" @click=${(e: Event) => e.stopPropagation()}>
      <div class="header">
        <span class="title">${i18n._("led_program")}</span>
        <select
          class="day"
          @change=${(e: Event) =>
            this.load(
              this.led,
              Number((e.target as HTMLSelectElement).value),
              this.format,
            )}
        >
          ${[1, 2, 3, 4, 5, 6, 7].map(
            (d) =>
              html`<option value="${d}" ?selected=${d === this.day}>
                ${i18n._("day_" + d)}
              </option>`,
          )}
        </select>
        ${this.format === "wb" && this.white_blue_allowed()
          ? html`<div class="mode" title="${i18n._("white_blue_sliders")}">
              <span
                class="mode_wb ${this.mode === "wb" ? "on" : ""}"
                @click=${() => this.set_mode("wb")}
                >W/B</span
              ><span
                class="mode_k ${this.mode === "kelvin" ? "on" : ""}"
                @click=${() => this.set_mode("kelvin")}
                >K</span
              >
            </div>`
          : ""}
        <button class="icon_btn close" @click=${() => this.close()}>✕</button>
      </div>
      ${this._render_weather_notice()} ${this._render_library()}
      <div class="tabs">
        ${channels.map(
          (ch) =>
            html`<button
              class="tab ${ch === this._channel ? "selected" : ""}"
              style="border-color:${this._tab_color(ch)}"
              @click=${() => {
                this._channel = ch;
              }}
            >
              <span class="swatch" style="background:${this._color(ch)}"></span
              >${i18n._(CHANNEL_LABELS[ch])}
            </button>`,
        )}
      </div>
      <div class="body">
        <div class="chart">${this._render_chart()}</div>
        <div class="points">
          ${this.weather_on()
            ? html`<div class="colours_hint">
                  ${i18n._("led_weather_colours_only")}
                </div>
                ${this._render_table()} ${this._render_weather()}`
            : html`${this._render_table()} ${this._render_clouds()}`}
        </div>
        ${this.preview_loading
          ? html`<div class="loading_zone">
              <div class="spinner"></div>
              <span>${i18n._("led_weather_loading")}</span>
            </div>`
          : ""}
      </div>
      <div class="footer">
        <label
          ><input
            type="checkbox"
            class="all_days"
            style="width:auto"
            ?disabled=${this.preview_loading || this.saving !== null}
            .checked=${this._all_days}
            @change=${(e: Event) => {
              this._all_days = (e.target as HTMLInputElement).checked;
            }}
          />
          ${i18n._("led_apply_all_days")}</label
        >
        <span class="spacer"></span>
        <button
          class="cancel"
          ?disabled=${this.saving !== null}
          @click=${() => this.close()}
        >
          ${i18n._("cancel")}
        </button>
        <button
          class="save"
          ?disabled=${this.saving !== null ||
          this.preview_loading ||
          (this.weather_on() &&
            this.weather_draft === null &&
            !this.settings_dirty)}
          @click=${() => this.save()}
        >
          ${i18n._("save")}
        </button>
      </div>
      ${this._render_naming()} ${this._render_deleting()}
      ${this._render_renaming()} ${this._render_writing()}
    </div>`;
  }

  /**
   * The clouds of the day: one window (inside the day of light) and its
   * intensity, as in the ReefBeat app. In weather mode the weather sets
   * them (see the weather settings).
   */
  private _render_clouds(): TemplateResult {
    const clouds = this.clouds();
    const locked = this.locked();
    const labels: Record<string, string> = {
      Low: i18n._("led_clouds_low"),
      Medium: i18n._("led_clouds_medium"),
      High: i18n._("led_clouds_high"),
    };
    const time = (key: "from" | "to") =>
      html`<input
        class="clouds_${key}"
        type="time"
        title="${i18n._(key === "from" ? "sched_from" : "sched_to")}"
        ?disabled=${locked}
        .value=${format_minutes(Number(clouds?.[key]))}
        @change=${(e: Event) =>
          this.set_clouds_time(key, (e.target as HTMLInputElement).value)}
      />`;
    return html`<div class="clouds_edit">
      <label
        ><input
          type="checkbox"
          class="clouds_on"
          ?disabled=${locked || !sun_window(this.chart_program())}
          .checked=${clouds !== null}
          @change=${(e: Event) =>
            this.set_clouds((e.target as HTMLInputElement).checked)}
        />
        ☁ ${i18n._("led_weather_clouds")}</label
      >
      ${clouds
        ? html`${time("from")} – ${time("to")}
            <select
              class="clouds_level"
              ?disabled=${locked}
              @change=${(e: Event) =>
                this.set_clouds_intensity(
                  (e.target as HTMLSelectElement).value,
                )}
            >
              ${CLOUD_LEVELS.map(
                (level) =>
                  html`<option
                    value="${level}"
                    ?selected=${level === clouds.intensity}
                  >
                    ${labels[level]}
                  </option>`,
              )}
            </select>`
        : ""}
    </div>`;
  }

  /** A program being written: its progress, over the editor. */
  private _render_writing(): TemplateResult | string {
    // Written by the editor (a program), or by the integration (the
    // weather week, the lamp's own week back)
    const writing = this.writing ?? this.lamp_writing();
    if (!writing) return "";
    const { done, total } = writing;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return html`<div class="loading_zone writing">
      <div class="spinner"></div>
      <span>${i18n._("led_writing", { done, total })}</span>
      <div class="progress"><div style="width:${pct}%"></div></div>
    </div>`;
  }

  /** Settings of the weather program, and the week they make. */
  private _render_weather(): TemplateResult {
    return html`<rsled-weather-settings
      .hass=${this.led?.hass}
      .settings=${this.weather_settings ?? {}}
      .preview=${this.preview}
      .day=${this.day}
      @weather-setting=${(e: CustomEvent) =>
        this.set_weather_setting(e.detail.key, e.detail.value)}
      @weather-day=${(e: CustomEvent) =>
        this.load(this.led, e.detail.day, this.format)}
    ></rsled-weather-settings>`;
  }

  private _render_chart(): TemplateResult {
    const today = this.chart_program();
    const { px, py } = chart_scale(EDITOR_CHART);
    const pts = this._pts();
    const handles = pts.map((p, n) => {
      const fill =
        this._channel === "intensity"
          ? rgb_css(kelvin_rgb(p.k ?? DEFAULT_KELVIN))
          : this._color(this._channel);
      const x = px(p.m % MINUTES_PER_DAY);
      return svg`<circle class="handle ${this.locked() ? "locked" : ""}" data-n="${n}" cx="${x.toFixed(1)}"
        cy="${py(p.i).toFixed(1)}" r="${n === 0 || n === pts.length - 1 ? 4.5 : 6}"
        fill="${fill}"
        @pointerdown=${(e: PointerEvent) => this._on_handle_down(e, n)}></circle>`;
    });
    return html`<svg
      viewBox="0 0 ${EDITOR_VIEW.width} ${EDITOR_VIEW.height}"
      preserveAspectRatio="xMidYMid meet"
    >
      ${program_chart(EDITOR_CHART, {
        id: "rsled_editor",
        today,
        // The part of the program running past midnight is drawn back at
        // the start of the chart, where its points are shown
        yesterday: today,
        ticks: true,
        highlight: this._channel,
        clouds: this.clouds(),
        // Over the points: drawn after them
        labels: false,
      })}
      ${[0, 50, 100].map(
        (pct) =>
          svg`<text class="chart_tick" x="${EDITOR_CHART.x - 4}" y="${py(pct) + 3}"
            text-anchor="end">${pct}</text>`,
      )}
      ${handles} ${kelvin_labels(EDITOR_CHART, today)}
    </svg>`;
  }

  private _render_table(): TemplateResult {
    const pts = this._pts();
    const kelvin = this._channel === "intensity";
    const last = pts.length - 1;
    // The weather writes the week: shown, only its colours edited
    const locked = this.locked();
    const k_locked = locked && !this.colour_only();
    const rows = pts.map(
      (p, n) =>
        html`<tr>
          <td>
            <input
              class="time"
              type="time"
              ?disabled=${locked}
              .value=${format_minutes(p.m)}
              @change=${(e: Event) =>
                this.set_time(n, (e.target as HTMLInputElement).value)}
            />
          </td>
          <td>
            <input
              class="intensity"
              type="number"
              min="0"
              max="100"
              .value=${String(Math.round(p.i))}
              ?disabled=${locked || n === 0 || n === last}
              @change=${(e: Event) =>
                this.set_intensity(
                  n,
                  Number((e.target as HTMLInputElement).value),
                )}
            />
          </td>
          ${kelvin
            ? html`<td>
                <input
                  class="kelvin"
                  type="number"
                  step="100"
                  ?disabled=${k_locked}
                  .value=${String(p.k ?? DEFAULT_KELVIN)}
                  style="border-color:${rgb_css(
                    kelvin_rgb(p.k ?? DEFAULT_KELVIN),
                  )}"
                  @change=${(e: Event) =>
                    this.set_kelvin(
                      n,
                      Number((e.target as HTMLInputElement).value),
                    )}
                />
              </td>`
            : ""}
          <td>
            ${locked
              ? ""
              : n === 0 || n === last
                ? html`<span title="${i18n._(n === 0 ? "led_rise" : "led_set")}"
                    >${n === 0 ? "↗" : "↘"}</span
                  >`
                : html`<button
                    class="icon_btn remove"
                    @click=${() => this.remove_point(n)}
                  >
                    ✕
                  </button>`}
          </td>
        </tr>`,
    );
    return html`<table>
        <colgroup>
          <col class="c_time" />
          <col class="c_pct" />
          ${kelvin ? html`<col class="c_k" />` : ""}
          <col class="c_act" />
        </colgroup>
        <tr>
          <th>h</th>
          <th>%</th>
          ${kelvin ? html`<th>K</th>` : ""}
          <th></th>
        </tr>
        ${rows}
      </table>
      ${locked
        ? ""
        : html`<button class="add" @click=${() => this.add_point()}>
            + ${i18n._("led_add_point")}
          </button>`}
      ${pts.length && !locked
        ? html`<button class="add clear" @click=${() => this.clear_channel()}>
            ${i18n._("delete")}
          </button>`
        : ""}`;
  }
}
