/**
 * @file Schedule chart element
 * @module base.schedule
 *
 * Renders a day-long schedule curve (00:00 → 23:59) on a <canvas>.
 *
 * Configuration (via mapping):
 *   {
 *     name: "speed",
 *     type: "common-schedule",
 *     schedule_attribute: "schedule",   // stateObj attribute holding the array
 *     time_field: "st",                 // field name for minutes-since-midnight
 *     value_field: "ti",                // field name for the value
 *     linear: false,                    // false = step (instant change)
 *                                       // true  = linear interpolation
 *     min_value: 0,                     // optional, default 0
 *     max_value: 100,                   // optional, auto-detected if omitted
 *     line_color: "0,150,255",          // optional, R,G,B  (defaults to device color)
 *     fill_alpha: 0.15,                 // optional, fill opacity under the curve
 *     bg_color: "0,0,0,0.6",            // optional, chart background rgba
 *     label_color: "200,200,200",       // optional, axis labels & grid R,G,B
 *     css: { ... }
 *   }
 *
 * The linked stateObj must expose an attribute (default "schedule") containing
 * an array of objects, e.g.:
 *   [
 *     { "pd": 0, "st": 0,   "ti": 80 },
 *     { "pd": 0, "st": 360, "ti": 60 },
 *     { "pd": 0, "st": 720, "ti": 80 }
 *   ]
 *
 * A vertical red line marks the current time of day.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, TemplateResult, CSSResultGroup } from "lit";
import { property } from "lit/decorators.js";

import { MyElement } from "./element";
import style_schedule from "./schedule.styles";
import style_animations from "../utils/animations.styles";

import type { BaseElementConfig } from "../types/index";

//----------------------------------------------------------------------------//
//   Types
//----------------------------------------------------------------------------//

/** Configuration specific to the schedule element */
export interface ScheduleConfig extends BaseElementConfig {
  name: string;
  schedule_attribute?: string; // attribute key on stateObj (default "schedule")
  time_field?: string; // field for minutes since midnight (default "st")
  value_field?: string; // field for the value              (default "ti")
  linear?: boolean; // true = linear transition, false = step
  min_value?: number; // Y axis minimum (default 0)
  max_value?: number; // Y axis maximum (auto-detected if omitted)
  line_color?: string; // "R,G,B" override
  fill_alpha?: number; // fill opacity (default 0.15)
  unit?: string; // unit label override (default: stateObj unit_of_measurement)
  bg_color?: string; // chart background "r,g,b,a" (default: transparent)
  label_color?: string; // axis labels & grid "R,G,B" (default: "200,200,200")
}

/** A single schedule point after parsing */
interface SchedulePoint {
  minutes: number; // 0–1439
  value: number;
}

//----------------------------------------------------------------------------//
//   Constants
//----------------------------------------------------------------------------//
const TOTAL_MINUTES = 24 * 60; // 1440
const PADDING_TOP = 16;
const PADDING_BOTTOM = 20;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 8;

//----------------------------------------------------------------------------//
//   Schedule element
//----------------------------------------------------------------------------//

export class Schedule extends MyElement {
  static override styles: CSSResultGroup = [style_animations, style_schedule];

  @property({ type: Object, attribute: false })
  declare conf?: ScheduleConfig;

  private _canvas: HTMLCanvasElement | null = null;
  private _ro: ResizeObserver | null = null;
  private _clockTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();
  }

  // ------------------------------------------------------------------
  //  Lifecycle
  // ------------------------------------------------------------------

  override firstUpdated(): void {
    this._canvas = this.shadowRoot?.querySelector("canvas") ?? null;
    if (this._canvas) {
      this._ro = new ResizeObserver(() => this._draw());
      this._ro.observe(this._canvas);
    }
    // Redraw every minute so the "now" bar stays current
    this._clockTimer = setInterval(() => this._draw(), 60_000);
    this._draw();
  }

  override updated(): void {
    this._draw();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._ro?.disconnect();
    this._ro = null;
    if (this._clockTimer !== null) {
      clearInterval(this._clockTimer);
      this._clockTimer = null;
    }
  }

  // ------------------------------------------------------------------
  //  Render (just a canvas wrapper — all drawing is imperative)
  // ------------------------------------------------------------------

  protected override _render(_style?: string): TemplateResult {
    const style = this.stateOn ? "" : "filter:grayscale(90%)";

    return html`
      <div class="schedule-container" style="${style}">
        <canvas></canvas>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  //  Canvas drawing
  // ------------------------------------------------------------------

  private _draw(): void {
    const canvas = this._canvas;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Hi-DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Chart area
    const chartX = PADDING_LEFT;
    const chartY = PADDING_TOP;
    const chartW = W - PADDING_LEFT - PADDING_RIGHT;
    const chartH = H - PADDING_TOP - PADDING_BOTTOM;

    if (chartW <= 0 || chartH <= 0) return;

    // Background fill (covers the full canvas including axes/labels area)
    if (this.conf?.bg_color) {
      ctx.fillStyle = `rgba(${this.conf.bg_color})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Parse schedule data
    const points = this._parseSchedule();
    if (points.length === 0) {
      console.error("No points in schedule", this.conf);
      return;
    }

    // Y range
    const minVal = this.conf?.min_value ?? 0;
    const maxVal =
      this.conf?.max_value ??
      Math.max(100, ...points.map((p) => p.value)) * 1.05;
    const yRange = maxVal - minVal || 1;

    // Helpers: data → pixel
    const xOf = (minutes: number): number =>
      chartX + (minutes / TOTAL_MINUTES) * chartW;
    const yOf = (value: number): number =>
      chartY + chartH - ((value - minVal) / yRange) * chartH;

    // Unit: config override, then entity attribute, then empty
    const unit =
      this.conf?.unit ?? this.stateObj?.attributes?.unit_of_measurement ?? "";

    // ------------------------------------------------------------------
    //  Background grid + labels
    // ------------------------------------------------------------------
    this._drawGrid(
      ctx,
      chartX,
      chartY,
      chartW,
      chartH,
      minVal,
      maxVal,
      xOf,
      yOf,
      W,
      unit,
      this.conf?.label_color ?? "200,200,200",
    );

    // ------------------------------------------------------------------
    //  Curve color
    // ------------------------------------------------------------------
    const rgb = this.conf?.line_color ?? this.c ?? "0,150,255";
    const lineColor = `rgb(${rgb})`;
    const fillAlpha = this.conf?.fill_alpha ?? 0.15;
    const fillColor = `rgba(${rgb},${fillAlpha})`;

    const linear = this.conf?.linear ?? false;

    // ------------------------------------------------------------------
    //  Build path
    // ------------------------------------------------------------------
    ctx.beginPath();

    // Start: horizontal line from midnight at the first point's value
    const firstVal = points[0].value;
    ctx.moveTo(xOf(0), yOf(firstVal));

    if (linear) {
      // ---- Linear transitions: straight lines between successive points ----
      for (const pt of points) {
        ctx.lineTo(xOf(pt.minutes), yOf(pt.value));
      }
    } else {
      // ---- Step transitions: horizontal then vertical ----
      let prevY = yOf(firstVal);
      for (const pt of points) {
        const px = xOf(pt.minutes);
        const py = yOf(pt.value);
        // Horizontal at previous value up to this time
        ctx.lineTo(px, prevY);
        // Vertical jump to new value
        ctx.lineTo(px, py);
        prevY = py;
      }
    }

    // Extend to end of day at last value
    const lastVal = points[points.length - 1].value;
    ctx.lineTo(xOf(TOTAL_MINUTES), yOf(lastVal));

    // Stroke the curve
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Fill under the curve
    ctx.lineTo(xOf(TOTAL_MINUTES), yOf(minVal));
    ctx.lineTo(xOf(0), yOf(minVal));
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // ------------------------------------------------------------------
    //  Current-time vertical bar (red) + time & value labels
    // ------------------------------------------------------------------
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nowX = xOf(nowMinutes);

    // Compute current value by interpolating the schedule at nowMinutes
    const nowValue = this._interpolateValue(points, nowMinutes, linear);
    const nowY = yOf(nowValue);

    ctx.strokeStyle = "rgba(255,40,40,0.9)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(nowX, chartY);
    ctx.lineTo(nowX, chartY + chartH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Small dot at the intersection of the bar and the curve
    ctx.fillStyle = "rgba(255,40,40,0.9)";
    ctx.beginPath();
    ctx.arc(nowX, nowY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Build combined label: "HH:MM  value"
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const valueStr = Number.isInteger(nowValue)
      ? String(nowValue)
      : nowValue.toFixed(1);
    const combinedLabel = unit
      ? `${timeStr} ${valueStr}${unit}`
      : `${timeStr} ${valueStr}`;

    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "rgba(255,40,40,0.9)";

    // Draw label vertically along the red bar
    ctx.save();
    const textW = ctx.measureText(combinedLabel).width;
    // Place to the right of the bar; flip to left if too close to the edge
    const offset = 4;
    const rightSide = nowX + offset + 12 < chartX + chartW;

    // Center the text vertically between the dot and the bottom of the chart
    const textCenterY = Math.min(nowY + textW / 2 + 8, chartY + chartH - 2);

    ctx.translate(nowX, textCenterY);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = rightSide ? "top" : "bottom";
    ctx.fillText(combinedLabel, 0, rightSide ? offset : -offset);
    ctx.restore();
  }

  // ------------------------------------------------------------------
  //  Grid & labels
  // ------------------------------------------------------------------

  private _drawGrid(
    ctx: CanvasRenderingContext2D,
    chartX: number,
    chartY: number,
    chartW: number,
    chartH: number,
    minVal: number,
    maxVal: number,
    xOf: (m: number) => number,
    yOf: (v: number) => number,
    totalW: number,
    unit: string,
    lc: string,
  ): void {
    const isSmall = totalW < 200;

    // Derived colors from label_color base
    const gridColor = `rgba(${lc},0.12)`;
    const tickColor = `rgba(${lc},0.35)`;
    const textColor = `rgba(${lc},0.7)`;
    const axisColor = `rgba(${lc},0.5)`;

    // ------------------------------------------------------------------
    //  X axis (time) — grid lines + labels
    // ------------------------------------------------------------------
    const hourStep = isSmall ? 6 : 3;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.fillStyle = textColor;
    ctx.font = `${isSmall ? 8 : 10}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let h = 0; h <= 24; h += hourStep) {
      const x = xOf(h * 60);
      // Vertical grid line
      ctx.beginPath();
      ctx.moveTo(x, chartY);
      ctx.lineTo(x, chartY + chartH);
      ctx.stroke();
      // Tick mark
      ctx.strokeStyle = tickColor;
      ctx.beginPath();
      ctx.moveTo(x, chartY + chartH);
      ctx.lineTo(x, chartY + chartH + 3);
      ctx.stroke();
      ctx.strokeStyle = gridColor;
      // Label
      if (h < 24) {
        const label = `${h.toString().padStart(2, "0")}h`;
        ctx.fillText(label, x, chartY + chartH + 5);
      }
    }

    // ------------------------------------------------------------------
    //  Y axis (value) — grid lines + labels
    // ------------------------------------------------------------------
    const yRange = maxVal - minVal;
    const yStep = this._niceStep(yRange, 4);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let v = Math.ceil(minVal / yStep) * yStep; v <= maxVal; v += yStep) {
      const y = yOf(v);
      // Horizontal grid line
      ctx.strokeStyle = gridColor;
      ctx.beginPath();
      ctx.moveTo(chartX, y);
      ctx.lineTo(chartX + chartW, y);
      ctx.stroke();
      // Tick mark
      ctx.strokeStyle = tickColor;
      ctx.beginPath();
      ctx.moveTo(chartX - 3, y);
      ctx.lineTo(chartX, y);
      ctx.stroke();
      // Label
      ctx.fillStyle = textColor;
      const yLabel = unit ? `${Math.round(v)}${unit}` : String(Math.round(v));
      ctx.fillText(yLabel, chartX - 5, y);
    }

    // ------------------------------------------------------------------
    //  Axis lines (solid)
    // ------------------------------------------------------------------
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Y axis (left edge)
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartH);
    // X axis (bottom edge)
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.stroke();
  }

  /** Compute a "nice" rounded step for grid lines. */
  private _niceStep(range: number, targetLines: number): number {
    const rough = range / targetLines;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    let nice: number;
    if (norm <= 1.5) nice = 1;
    else if (norm <= 3) nice = 2;
    else if (norm <= 7) nice = 5;
    else nice = 10;
    return nice * mag || 1;
  }

  // ------------------------------------------------------------------
  //  Value interpolation at a given time
  // ------------------------------------------------------------------

  /**
   * Return the schedule value at a given minute of the day.
   * - Step mode: value of the last point before or at `minutes`
   * - Linear mode: linear interpolation between surrounding points
   */
  private _interpolateValue(
    points: SchedulePoint[],
    minutes: number,
    linear: boolean,
  ): number {
    if (points.length === 0) return 0;

    // Before the first point → use first point's value
    if (minutes <= points[0].minutes) return points[0].value;

    // After the last point → use last point's value
    if (minutes >= points[points.length - 1].minutes) {
      return points[points.length - 1].value;
    }

    // Find the surrounding points
    for (let i = 1; i < points.length; i++) {
      if (minutes <= points[i].minutes) {
        const prev = points[i - 1];
        const next = points[i];

        if (!linear || prev.minutes === next.minutes) {
          // Step mode: hold previous value until the next point
          return prev.value;
        }

        // Linear interpolation
        const t = (minutes - prev.minutes) / (next.minutes - prev.minutes);
        return prev.value + t * (next.value - prev.value);
      }
    }

    return points[points.length - 1].value;
  }

  // ------------------------------------------------------------------
  //  Schedule data parsing
  // ------------------------------------------------------------------

  private _parseSchedule(): SchedulePoint[] {
    if (!this.stateObj?.attributes) return [];

    const attrName = this.conf?.schedule_attribute ?? "schedule";
    const raw = this.stateObj.attributes[attrName];
    if (!Array.isArray(raw)) return [];

    const timeField = this.conf?.time_field ?? "st";
    const valueField = this.conf?.value_field ?? "ti";

    const points: SchedulePoint[] = [];

    for (const entry of raw) {
      const minutes = Number(entry[timeField]);
      const value = Number(entry[valueField]);
      if (!isNaN(minutes) && !isNaN(value)) {
        points.push({ minutes, value });
      }
    }

    // Sort by time
    points.sort((a, b) => a.minutes - b.minutes);

    return points;
  }
}
