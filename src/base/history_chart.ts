/**
 * Implement a history chart drawn on a canvas, in the visual language of the
 * schedule element: light panel, grid, hour labels on the x axis and value
 * labels on the y axis.
 *
 * Reads the recorder through the `history/history_during_period` websocket
 * command. Unlike a native `hui-statistics-graph-card` it carries no card
 * chrome and, above all, no minimum height: it fills whatever box the mapping
 * gives it, however small, so the layout holds at every card width.
 *
 * Example: today's ATO consumption against its daily average
 *
 *   today_usage_chart: {
 *     name: "today_volume_usage",
 *     type: "history-chart",
 *     window: "today",
 *     unit: " mL",
 *     entities: [
 *       { entity: "today_volume_usage", color: COLOR_ORANGE_HEX, fill: true },
 *       { entity: "daily_volume_average", color: COLOR_RS_HEX },
 *     ],
 *     bg_color: "255,255,255,0.35",
 *     css: {
 *       position: "absolute",
 *       top: "62%",
 *       left: "64%",
 *       width: "34%",
 *       height: "22%",
 *     },
 *   }
 *
 * Configuration:
 *   entities       series to draw. Each is a translation key, or an object
 *                  `{ entity, color, fill, fill_color, stroke_width }`. When
 *                  absent, the element's own `name` is the single series.
 *   window         "today" spans the calendar day, local midnight to local
 *                  midnight, with the curve growing across it as the day goes
 *                  on. "rolling" (the default) spans the last `hours` hours,
 *                  so the newest sample always sits on the right edge.
 *   hours          size of the rolling window, in hours (default 24). Ignored
 *                  when `window` is "today".
 *   unit           suffix appended to the y axis labels
 *   font_size      axis label size in pixels (default 9). A box narrower than
 *                  160px drops two pixels off it, down to a floor of 6, so a
 *                  small overlay stays legible without being reconfigured.
 *   bg_color       "r,g,b,a" panel behind the chart, omitted when unset
 *   colors.line    stroke used by a series that declares no colour
 *   colors.fill    area colour used by a series whose `fill` is true, or by
 *                  the single-series form
 *   stroke_width   default line thickness in pixels (default 2)
 *   baseline       "zero" makes the vertical scale start at 0 rather than at
 *                  the lowest sample, which is what a consumption counter
 *                  wants (default "zero"; use "min" for a temperature)
 *   step           true draws a staircase, right for a counter that jumps at
 *                  each dose (default true)
 *   min_points     below this many samples a series is not drawn (default 1).
 *                  One is enough: a counter holds its value between changes,
 *                  so a lone sample is an honest flat line, and a day that has
 *                  seen a single fill would otherwise draw nothing at all.
 *   refresh        seconds between two reads at most (default 60)
 *
 * All series share one vertical scale, anchored on the highest value seen
 * across them. Per-series scales would make two unrelated curves look
 * comparable, which is the whole reason to put them on the same chart.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, TemplateResult } from "lit";
import type { CSSResultGroup } from "lit";
import { property } from "lit/decorators.js";

import { MyElement } from "./element";
import type { HassConfig } from "../types/index";

import style_history_chart from "./history_chart.styles";
import style_animations from "../utils/animations.styles";

//----------------------------------------------------------------------------//

/** One recorder sample: a numeric value at a moment in time. */
export interface HistoryPoint {
  t: number;
  v: number;
}

/** One curve: the entity it came from, how to draw it, and its samples. */
export interface HistorySeries {
  entity_id: string;
  color: string;
  fill: string;
  stroke_width: number;
  points: HistoryPoint[];
}

/** The shared scale every series is projected onto. */
export interface ChartScale {
  first: number;
  span: number;
  low: number;
  range: number;
}

// Same proportions as the schedule element, so both charts read alike. The
// two gutters holding labels are derived from the font size instead, so a
// larger font does not spill out of the box.
const PADDING_TOP = 6;
const PADDING_RIGHT = 4;
/** Gap between a y label and the axis it belongs to. */
const LABEL_GAP = 3;
/** Below this width the chart is treated as an overlay: fewer, smaller marks. */
const NARROW_WIDTH = 160;

export class HistoryChart extends MyElement {
  static override styles: CSSResultGroup = [
    style_animations,
    style_history_chart,
  ];

  /** Curves currently drawn, in declaration order. */
  @property({ attribute: false }) series: HistorySeries[] = [];

  /** Epoch ms of the last completed read, to honour `refresh`. */
  private _last_fetch = 0;

  /** Guards against two reads overlapping when states arrive in bursts. */
  private _fetching = false;

  /** The drawing surface, grabbed on first update. */
  private _canvas: HTMLCanvasElement | null = null;

  /** Follows the box so a percentage-sized chart redraws when it changes. */
  private _ro: ResizeObserver | null = null;

  /**
   * Start reading as soon as the element is on screen.
   */
  override connectedCallback(): void {
    super.connectedCallback();
    void this.fetch_history();
  }

  /**
   * Re-read when any drawn entity moves.
   *
   * The base setter only re-renders, which would redraw the same samples. A
   * counter such as `today_volume_usage` changes exactly when a new point
   * exists, so the states themselves are the right trigger — no polling timer.
   * Every series is watched, not just the element's own `stateObj`: a second
   * curve must refresh even when the first one is idle.
   */
  override set hass(obj: HassConfig) {
    const previous = this._states_signature();
    super.hass = obj;
    if (this._states_signature() !== previous) {
      void this.fetch_history();
    }
  }

  override get hass(): HassConfig {
    return this._hass;
  }

  /**
   * Build a signature of the current states of every configured series.
   * @return a string that changes whenever one of them changes
   */
  private _states_signature(): string {
    const hass: any = this._hass;
    if (!hass?.states) {
      return "";
    }
    return this.entity_ids()
      .map((id) => hass.states[id]?.state ?? "")
      .join("|");
  }

  /**
   * Number of hours of history to draw.
   */
  get hours(): number {
    const raw = Number(this.conf?.hours);
    return Number.isFinite(raw) && raw > 0 ? raw : 24;
  }

  /**
   * Axis label size in pixels for a given box width.
   *
   * @param width: the width of the whole chart box
   * @return the font size to draw the labels at
   */
  font_size(width: number): number {
    const base = Number(this.conf?.font_size);
    const size = Number.isFinite(base) && base > 0 ? base : 9;
    // A narrow overlay gets a smaller font rather than fewer pixels of chart:
    // shrinking the labels buys back more room than dropping a grid line.
    return width < NARROW_WIDTH ? Math.max(6, size - 2) : size;
  }

  /**
   * The span the x axis covers, which is not the span of the samples.
   *
   * In "today" mode the axis is pinned to the calendar day so the curve grows
   * from left to right as the day goes on, the way the schedule element
   * reads. Deriving the span from the samples instead would keep rescaling
   * the axis and make the newest point sit on the right edge at every hour of
   * the day — which is what a rolling window is for, and a poor way to show a
   * daily counter.
   *
   * @return the first and last instant the axis represents
   */
  display_window(): { start: number; end: number } {
    const now = Date.now();
    if (this.conf?.window === "today") {
      const midnight = new Date(now);
      midnight.setHours(0, 0, 0, 0);
      const start = midnight.getTime();
      return { start, end: start + 24 * 3600 * 1000 };
    }
    return { start: now - this.hours * 3600 * 1000, end: now };
  }

  /**
   * Resolve the configured series into drawable descriptors.
   *
   * Accepts a bare translation key, an object, or no `entities` at all — in
   * which case the element's own `name` is the single series, which keeps the
   * simple one-curve form working unchanged.
   *
   * @return one descriptor per series that resolves to a real entity
   */
  series_config(): HistorySeries[] {
    const raw = this.conf?.entities;
    const declared: any[] = Array.isArray(raw)
      ? raw
      : [{ entity: this.conf?.name }];

    const default_color = this.conf?.colors?.line || "currentColor";
    const default_fill = this.conf?.colors?.fill ?? "none";
    const default_width = Number(this.conf?.stroke_width ?? 2);

    const out: HistorySeries[] = [];
    for (const item of declared) {
      const key = typeof item === "string" ? item : item?.entity;
      if (!key) {
        continue;
      }
      // A key naming an entity the device does not expose is skipped rather
      // than fatal: a mapping is written for the full entity set, and a
      // firmware that omits one sensor must not blank the whole chart.
      const entity_id = this.resolve_entity_id(key);
      if (!entity_id) {
        continue;
      }
      const conf = typeof item === "string" ? {} : item;
      out.push({
        entity_id,
        color: conf.color || default_color,
        fill: HistoryChart.series_fill(conf, default_fill, Array.isArray(raw)),
        stroke_width: Number(conf.stroke_width ?? default_width),
        points: [],
      });
    }
    return out;
  }

  /**
   * Decide the area colour of one series.
   *
   * Three curves stacked on filled areas hide each other, so in the
   * multi-series form a series is only filled when it asks to be. The
   * single-series form keeps filling from `colors.fill` alone, which is how it
   * behaved before several series were allowed.
   *
   * @param conf: the series configuration, `{}` for a bare translation key
   * @param default_fill: the chart-level `colors.fill`
   * @param multi: whether an `entities` list was declared
   * @return a fill colour, or "none"
   */
  static series_fill(conf: any, default_fill: string, multi: boolean): string {
    if (conf.fill_color) {
      return conf.fill_color;
    }
    if (conf.fill === true) {
      return default_fill;
    }
    return multi ? "none" : default_fill;
  }

  /**
   * Turn a translation key into a real entity_id.
   *
   * Falls back to the element's own stateObj so a single-series chart still
   * works on an element whose device lookup is unavailable.
   * @param key: the translation key from the mapping
   * @return the entity_id, or null when it cannot be resolved
   */
  resolve_entity_id(key: string): string | null {
    const resolved = (this.device as any)?.get_entity?.(key)?.entity_id;
    if (resolved) {
      return resolved;
    }
    if (key === this.conf?.name && this.stateObj?.entity_id) {
      return this.stateObj.entity_id;
    }
    return null;
  }

  /**
   * Entity ids of every configured series.
   */
  entity_ids(): string[] {
    return this.series_config().map((s) => s.entity_id);
  }

  /**
   * Read the recorder for the configured window.
   *
   * Every series is asked for in a single websocket call: the command takes a
   * list, and two round trips for two curves of the same chart would be
   * wasteful and could return misaligned windows.
   *
   * Never throws: a missing recorder, a websocket refusal or an entity with no
   * history all end up as an empty chart rather than a broken card.
   */
  async fetch_history(): Promise<void> {
    const wanted = this.series_config();
    const hass: any = this._hass;
    if (wanted.length === 0 || typeof hass?.callWS !== "function") {
      return;
    }

    const refresh = Number(this.conf?.refresh ?? 60) * 1000;
    const now = Date.now();
    if (this._fetching || now - this._last_fetch < refresh) {
      return;
    }
    this._fetching = true;

    try {
      const span = this.display_window();
      // Never ask beyond the present: the recorder has nothing there, and a
      // "today" window runs to tomorrow's midnight.
      const end = new Date(Math.min(now, span.end));
      const start = new Date(span.start);
      const answer = await hass.callWS({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        entity_ids: wanted.map((s) => s.entity_id),
        // The chart only needs numbers: skipping attributes keeps the payload
        // small on entities that have been updating all day.
        minimal_response: true,
        no_attributes: true,
      });
      for (const s of wanted) {
        s.points = HistoryChart.parse_history(answer, s.entity_id);
      }
      this.series = wanted;
      this._last_fetch = Date.now();
      if (this.conf?.debug) {
        // `debug: true` in the mapping prints what was resolved and how much
        // came back, which is the only way to tell an unresolved entity from
        // an empty recorder without a debugger.
        console.info(
          "history-chart",
          start.toISOString(),
          "->",
          end.toISOString(),
          wanted.map((s) => `${s.entity_id}: ${s.points.length} point(s)`),
        );
      }
    } catch (err) {
      // Recorder disabled, entities excluded from it, or the socket dropped.
      console.debug("history-chart: no history", err);
      this.series = [];
    } finally {
      this._fetching = false;
    }
  }

  /**
   * Turn a websocket answer into usable samples.
   *
   * The compressed format gives `s` for the state and `lu` for the epoch in
   * seconds; older cores answer with `state` and `last_updated`. Both are
   * accepted, and anything not parsable as a number is dropped — `unknown`
   * and `unavailable` are states a numeric sensor does reach.
   *
   * @param answer: the raw websocket answer
   * @param entity_id: the entity the samples belong to
   * @return the samples, oldest first
   */
  static parse_history(answer: any, entity_id: string): HistoryPoint[] {
    const rows = answer?.[entity_id];
    if (!Array.isArray(rows)) {
      return [];
    }
    const points: HistoryPoint[] = [];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const raw = "s" in row ? row.s : row.state;
      const value = Number(raw);
      if (!Number.isFinite(value)) continue;
      const stamp =
        "lu" in row ? Number(row.lu) * 1000 : Date.parse(row.last_updated);
      if (!Number.isFinite(stamp)) continue;
      points.push({ t: stamp, v: value });
    }
    points.sort((a, b) => a.t - b.t);
    return points;
  }

  /**
   * Compute the scale shared by every drawable series.
   *
   * The time span and the vertical range are taken across all series at once:
   * per-series scales would line up two unrelated curves as if they were
   * comparable, which is exactly the mistake a shared chart invites.
   *
   * @param drawable: the series that have enough samples
   * @return the projection parameters
   */
  build_scale(drawable: HistorySeries[]): ChartScale {
    const values = drawable.flatMap((s) => s.points.map((p) => p.v));
    // The horizontal axis comes from the configured window, not from the
    // samples: a day that has only run to 17h must still show its full 24
    // hours, with the curve stopping where the data stops.
    const window = this.display_window();
    const first = window.start;
    // A window of zero length would divide by zero; draw it flat instead.
    const span = window.end - first || 1;
    const high = Math.max(...values);
    const low =
      this.conf?.baseline === "min"
        ? Math.min(...values)
        : Math.min(0, ...values);
    // Same guard vertically: a counter that never moved is a flat line, not a
    // division by zero.
    const range = high - low || 1;
    return { first, span, low, range };
  }

  /**
   * Series with enough samples to be worth drawing.
   */
  drawable_series(): HistorySeries[] {
    const min_points = Math.max(1, Number(this.conf?.min_points ?? 1));
    return this.series.filter((s) => s.points.length >= min_points);
  }

  /**
   * Pick a round step between two grid lines.
   *
   * Borrowed from the schedule element so both charts land on the same kind of
   * numbers rather than on whatever the data range divides into.
   * @param range: the value range to cover
   * @param target_lines: roughly how many lines are wanted
   * @return the step to use, never zero
   */
  static nice_step(range: number, target_lines: number): number {
    const rough = range / target_lines;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    let nice: number;
    if (norm <= 1.5) nice = 1;
    else if (norm <= 3) nice = 2;
    else if (norm <= 7) nice = 5;
    else nice = 10;
    return nice * mag || 1;
  }

  /**
   * Grab the canvas and start following the box it is given.
   *
   * A percentage-sized box changes with the card width, and the canvas has to
   * be re-measured and redrawn each time or the drawing is stretched.
   */
  override firstUpdated(): void {
    this._canvas =
      this.shadowRoot?.querySelector(".history-chart-container canvas") ?? null;
    if (this._canvas && typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver(() => this.draw());
      this._ro.observe(this._canvas);
    }
    this.draw();
  }

  override updated(): void {
    this.draw();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._ro?.disconnect();
    this._ro = null;
  }

  /**
   * Draw the whole chart: panel, grid, axes, then the curves.
   *
   * Sized from the live box rather than from a fixed viewBox, so the labels
   * keep their pixel size at any width — the reason this is a canvas and not
   * an SVG stretched by `preserveAspectRatio="none"`, which would squash the
   * text along with everything else.
   */
  draw(): void {
    const canvas = this._canvas;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (this.conf?.bg_color) {
      ctx.fillStyle = `rgba(${this.conf.bg_color})`;
      ctx.fillRect(0, 0, rect.width, rect.height);
    }

    const drawable = this.drawable_series();
    if (drawable.length === 0) {
      // Nothing read yet: leave the panel empty rather than drawing an axis
      // around a void, which reads as "no consumption today".
      return;
    }

    const scale = this.build_scale(drawable);
    const font_size = this.font_size(rect.width);
    ctx.font = `${font_size}px sans-serif`;

    // The left gutter is measured from the labels that will actually be
    // drawn, so it follows both the font size and the magnitude of the
    // values: "1200 mL" needs more room than "8".
    const chart_x = this.measure_gutter(ctx, scale, font_size);
    const chart_y = PADDING_TOP;
    const chart_w = rect.width - chart_x - PADDING_RIGHT;
    const chart_h = rect.height - PADDING_TOP - (font_size + 5);
    if (chart_w <= 0 || chart_h <= 0) {
      return;
    }

    const x_of = (t: number): number =>
      chart_x + ((t - scale.first) / scale.span) * chart_w;
    const y_of = (v: number): number =>
      chart_y + chart_h - ((v - scale.low) / scale.range) * chart_h;

    this.draw_grid(
      ctx,
      chart_x,
      chart_y,
      chart_w,
      chart_h,
      scale,
      y_of,
      font_size,
    );

    for (const series of drawable) {
      this.draw_series(ctx, series, chart_y, chart_h, x_of, y_of);
    }
  }

  /**
   * Width to reserve on the left for the y labels.
   *
   * Measured on the widest label rather than fixed, because both the font
   * size and the magnitude of the values move it: at 14px, "1200 mL" is more
   * than twice the 30px the schedule element reserves.
   *
   * @param ctx: the context, with its font already set
   * @param scale: the scale the labels are taken from
   * @param font_size: the size the labels are drawn at
   * @return the x coordinate the plot area starts at
   */
  measure_gutter(
    ctx: CanvasRenderingContext2D,
    scale: ChartScale,
    font_size: number,
  ): number {
    const unit = this.conf?.unit ?? "";
    const step = HistoryChart.nice_step(scale.range, 4);
    const high = scale.low + scale.range;
    let widest = 0;
    for (let v = Math.ceil(scale.low / step) * step; v <= high; v += step) {
      const label = `${Math.round(v)}${unit}`;
      // measureText is unavailable on a stub context; fall back to a rough
      // per-character estimate rather than collapsing the gutter to nothing.
      const width =
        typeof ctx.measureText === "function"
          ? ctx.measureText(label).width
          : label.length * font_size * 0.6;
      widest = Math.max(widest, width);
    }
    return widest + LABEL_GAP * 2;
  }

  /**
   * Draw the panel grid, the tick labels and the two axes.
   *
   * X labels are hours of the day read off the samples themselves, so a
   * six-hour window is labelled with its own six hours rather than with a
   * fixed 00h..24h ruler.
   */
  draw_grid(
    ctx: CanvasRenderingContext2D,
    chart_x: number,
    chart_y: number,
    chart_w: number,
    chart_h: number,
    scale: ChartScale,
    y_of: (v: number) => number,
    font_size: number,
  ): void {
    const lc = this.conf?.axis_color ?? "40,40,40";
    const small = chart_w < NARROW_WIDTH;
    const grid_color = `rgba(${lc},0.15)`;
    const text_color = `rgba(${lc},0.7)`;
    const axis_color = `rgba(${lc},0.5)`;
    const unit = this.conf?.unit ?? "";

    ctx.lineWidth = 0.5;

    // --- x axis: hour marks ------------------------------------------------
    const hours = scale.span / 3600 / 1000;
    const hour_step = Math.max(1, Math.round(hours / (small ? 3 : 6)));
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    // Walked forward from the left edge so a calendar day starts on 00h,
    // rather than backward from now, which would land on arbitrary hours.
    for (let ahead = 0; ahead < hours; ahead += hour_step) {
      const stamp = scale.first + ahead * 3600 * 1000;
      const x = chart_x + ((stamp - scale.first) / scale.span) * chart_w;
      ctx.strokeStyle = grid_color;
      ctx.beginPath();
      ctx.moveTo(x, chart_y);
      ctx.lineTo(x, chart_y + chart_h);
      ctx.stroke();
      ctx.fillStyle = text_color;
      const label = new Date(stamp).getHours().toString().padStart(2, "0");
      ctx.fillText(`${label}h`, x, chart_y + chart_h + 2);
    }

    // --- y axis: value marks ----------------------------------------------
    const high = scale.low + scale.range;
    const y_step = HistoryChart.nice_step(scale.range, small ? 2 : 4);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (
      let v = Math.ceil(scale.low / y_step) * y_step;
      v <= high;
      v += y_step
    ) {
      const y = y_of(v);
      ctx.strokeStyle = grid_color;
      ctx.beginPath();
      ctx.moveTo(chart_x, y);
      ctx.lineTo(chart_x + chart_w, y);
      ctx.stroke();
      ctx.fillStyle = text_color;
      ctx.fillText(`${Math.round(v)}${unit}`, chart_x - LABEL_GAP, y);
    }

    ctx.strokeStyle = axis_color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chart_x, chart_y);
    ctx.lineTo(chart_x, chart_y + chart_h);
    ctx.lineTo(chart_x + chart_w, chart_y + chart_h);
    ctx.stroke();
  }

  /**
   * Draw one curve, and its area when the series asked for one.
   */
  draw_series(
    ctx: CanvasRenderingContext2D,
    series: HistorySeries,
    chart_y: number,
    chart_h: number,
    x_of: (t: number) => number,
    y_of: (v: number) => number,
  ): void {
    const step = this.conf?.step !== false;
    const coords: Array<[number, number]> = [];
    let previous_y: number | null = null;

    for (const point of series.points) {
      const x = x_of(point.t);
      const y = y_of(point.v);
      // A counter jumps at each dose and holds its value in between, so the
      // honest drawing is a staircase: a diagonal would invent a slow rise
      // that never happened.
      if (step && previous_y !== null) {
        coords.push([x, previous_y]);
      }
      coords.push([x, y]);
      previous_y = y;
    }

    // Hold the last value up to the present. Without this the curve stops at
    // the last recorded change rather than at now, which on a counter that
    // fills twice a day reads as if the device had gone silent — and leaves a
    // lone sample with nothing to draw at all.
    // No emptiness guard: draw() only ever passes series that
    // drawable_series() kept, so there is at least one sample and previous_y
    // has been set.
    const edge = x_of(Math.min(Date.now(), this.display_window().end));
    if (edge > coords[coords.length - 1]![0]) {
      coords.push([edge, previous_y as number]);
    }

    if (series.fill !== "none") {
      ctx.beginPath();
      ctx.moveTo(coords[0]![0], chart_y + chart_h);
      for (const [x, y] of coords) {
        ctx.lineTo(x, y);
      }
      ctx.lineTo(coords[coords.length - 1]![0], chart_y + chart_h);
      ctx.closePath();
      ctx.fillStyle = series.fill;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(coords[0]![0], coords[0]![1]);
    for (const [x, y] of coords) {
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = series.color;
    ctx.lineWidth = series.stroke_width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }

  /**
   * Render
   * @param _style: the style built from `elt_css`
   */
  protected override _render(_style: string = ""): TemplateResult {
    return html`
      <div class="history-chart-container" style="${_style}">
        <canvas></canvas>
      </div>
    `;
  }
}
