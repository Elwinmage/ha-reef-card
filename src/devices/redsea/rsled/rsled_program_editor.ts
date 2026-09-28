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
 */
import { LitElement, html, svg, css, TemplateResult } from "lit";

import i18n from "../../../translations/myi18n";
import { program_chart, chart_scale, ChartBox } from "./rsled_chart";
import {
  CURVE_COLORS_DEFAULT,
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
} from "./rsled_program";

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

export class RSLedProgramEditor extends LitElement {
  static override styles = css`
    :host {
      position: absolute;
      inset: 0;
      z-index: 10;
      display: block;
      font-family: var(--ha-font-family-body, Roboto, sans-serif);
      font-size: 12px;
      color: var(--primary-text-color, #222);
    }
    .panel {
      position: absolute;
      inset: 2%;
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
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
      min-height: 0;
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
      overflow-y: auto;
      min-height: 0;
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
    .add {
      margin-top: 4px;
      width: 100%;
      border: 1px dashed var(--divider-color, #aaa);
      border-radius: 6px;
      background: transparent;
      color: inherit;
      padding: 2px;
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
    .kelvin_mark {
      stroke: rgba(255, 255, 255, 0.5);
    }
    .handle {
      cursor: grab;
      stroke: #16213a;
      stroke-width: 1.5;
    }
  `;

  static override properties = {
    _channel: { state: true },
    mode: { state: true },
    _all_days: { state: true },
    _tick: { state: true },
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

  /**
   * Load a day program into the editor.
   * @param led: the lamp
   * @param day: ISO weekday
   * @param format_hint: format to use when the day holds no program
   */
  load(led: any, day: number, format_hint: ProgramFormat = "wb"): void {
    // A G1 keeps the edit mode the user chose when changing day
    const keep_kelvin = this.led !== null && this.mode === "kelvin";
    this.led = led;
    this.day = day;
    const data = led?.program?.(day) ?? null;
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
    if (keep_kelvin) void this.set_mode("kelvin");
    if (!format_channels(this.mode).includes(this._channel)) {
      this._channel = format_channels(this.mode)[0];
    }
    this._tick++;
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
    if (mode === "kelvin") {
      const samples = white_blue_samples(
        this.points.white ?? [],
        this.points.blue ?? [],
      );
      const converted = await this.convert(
        samples.map((p) => ({ white: Math.round(p.w), blue: Math.round(p.b) })),
      );
      this.points.intensity = kelvin_points_from_samples(
        samples,
        converted ?? convert_samples_locally(samples, this._model()),
      );
    } else {
      const { white, blue } = await this._to_white_blue();
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

  /** Send the program to the lamp (to each lamp of a group) and close. */
  async save(): Promise<void> {
    const hass = this.led?.hass;
    const targets = this.targets();
    if (!hass || !targets.length) {
      console.error("RSLED program save: missing hass or device id");
      return;
    }
    const days = this._all_days ? [1, 2, 3, 4, 5, 6, 7] : [this.day];
    for (const target of targets) {
      const prog = await this.program_for(target);
      for (const day of days) {
        // Each day carries its own offset on the lamp's weekly timeline. The
        // requests are sent one after the other: /auto/apply must come last.
        await hass.callService("redsea", "request", {
          device_id: target.device_id,
          access_path: `/auto/${day}`,
          method: "post",
          data: device_program(
            prog,
            day,
            target.g2,
            target.g2 ? this.led?.clouds?.(day) : undefined,
          ),
        });
      }
      // The lamp only runs the new program once asked to (as the app does)
      await hass.callService("redsea", "request", {
        device_id: target.device_id,
        access_path: "/auto/apply",
        method: "post",
        data: {},
      });
    }
    this.close();
  }

  close(): void {
    this.dispatchEvent(
      new CustomEvent("rsled-editor-close", { bubbles: true, composed: true }),
    );
  }

  // ── Render ───────────────────────────────────────────────────────────

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
        ${this.format === "wb"
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
              >${i18n._("led_channel_" + ch)}
            </button>`,
        )}
      </div>
      <div class="body">
        <div class="chart">${this._render_chart()}</div>
        <div class="points">${this._render_table()}</div>
      </div>
      <div class="footer">
        <label
          ><input
            type="checkbox"
            class="all_days"
            style="width:auto"
            .checked=${this._all_days}
            @change=${(e: Event) => {
              this._all_days = (e.target as HTMLInputElement).checked;
            }}
          />
          ${i18n._("led_apply_all_days")}</label
        >
        <span class="spacer"></span>
        <button class="cancel" @click=${() => this.close()}>
          ${i18n._("cancel")}
        </button>
        <button class="save" @click=${() => this.save()}>
          ${i18n._("save")}
        </button>
      </div>
    </div>`;
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
      return svg`<circle class="handle" data-n="${n}" cx="${x.toFixed(1)}"
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
      })}
      ${[0, 50, 100].map(
        (pct) =>
          svg`<text class="chart_tick" x="${EDITOR_CHART.x - 4}" y="${py(pct) + 3}"
            text-anchor="end">${pct}</text>`,
      )}
      ${handles}
    </svg>`;
  }

  private _render_table(): TemplateResult {
    const pts = this._pts();
    const kelvin = this._channel === "intensity";
    const last = pts.length - 1;
    const rows = pts.map(
      (p, n) =>
        html`<tr>
          <td>
            <input
              class="time"
              type="time"
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
              ?disabled=${n === 0 || n === last}
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
            ${n === 0 || n === last
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
      <button class="add" @click=${() => this.add_point()}>
        + ${i18n._("led_add_point")}
      </button>
      ${pts.length
        ? html`<button class="add clear" @click=${() => this.clear_channel()}>
            ${i18n._("delete")}
          </button>`
        : ""}`;
  }
}
