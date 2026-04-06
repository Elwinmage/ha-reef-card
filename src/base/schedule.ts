/**
 * @file Schedule chart element with inline editor and preview
 * @module base.schedule
 *
 * Renders a day-long schedule curve (00:00 - 23:59) on a <canvas>.
 * Click to open an editor overlay with live chart + editable point list.
 * Each row has a play button to preview that point's settings on the device.
 * The row matching the current time is highlighted in red.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, TemplateResult, CSSResultGroup, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import { MyElement } from "./element";
import style_schedule from "./schedule.styles";
import style_animations from "../utils/animations.styles";
import i18n from "../translations/myi18n.js";

import type { BaseElementConfig } from "../types/index";

//----------------------------------------------------------------------------//
//   Types
//----------------------------------------------------------------------------//

export interface ScheduleConfig extends BaseElementConfig {
  name: string;
  schedule_attribute?: string;
  time_field?: string;
  value_field?: string;
  pulse_field?: string;
  min_pulse?: number;
  max_pulse?: number;
  linear?: boolean;
  min_value?: number;
  max_value?: number;
  line_color?: string;
  fill_alpha?: number;
  unit?: string;
  bg_color?: string;
  label_color?: string;
  max_points?: number;
}

interface SchedulePoint {
  minutes: number;
  value: number;
  pulse?: number;
}

//----------------------------------------------------------------------------//
//   Constants
//----------------------------------------------------------------------------//
const TOTAL_MINUTES = 24 * 60;
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

  // Editor state
  @state() private _editing = false;
  @state() private _editPoints: SchedulePoint[] = [];

  // Preview state
  @state() private _previewRunning = false;
  @state() private _previewRowIdx = -1; // which row triggered the preview (-1 = manual)
  @state() private _previewValue = 0;
  @state() private _previewPulse = 0;

  private _canvas: HTMLCanvasElement | null = null;
  private _editorCanvas: HTMLCanvasElement | null = null;
  private _ro: ResizeObserver | null = null;
  private _clockTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();
  }

  // ------------------------------------------------------------------
  //  Lifecycle
  // ------------------------------------------------------------------

  override firstUpdated(): void {
    this._canvas =
      this.shadowRoot?.querySelector(".schedule-container canvas") ?? null;
    if (this._canvas) {
      this._ro = new ResizeObserver(() => this._draw());
      this._ro.observe(this._canvas);
    }
    this._clockTimer = setInterval(() => this._draw(), 60_000);
    this._draw();
  }

  override updated(): void {
    this._draw();
    if (this._editing) {
      this._drawEditorChart();
    }
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
  //  Render
  // ------------------------------------------------------------------

  protected override _render(_style?: string): TemplateResult {
    const style = this.stateOn ? "" : "filter:grayscale(90%)";
    return html`
      <div
        class="schedule-container"
        style="${style}"
        @click=${this._openEditor}
      >
        <canvas></canvas>
      </div>
      ${this._editing ? this._renderEditor() : nothing}
    `;
  }

  // ------------------------------------------------------------------
  //  Editor overlay
  // ------------------------------------------------------------------

  private _openEditor(e: Event): void {
    e.stopPropagation();
    this._editPoints = this._parseSchedule().map((p) => ({ ...p }));
    if (this._editPoints.length === 0) {
      const pt: SchedulePoint = {
        minutes: 0,
        value: this.conf?.min_value ?? 0,
      };
      if (this.conf?.pulse_field) pt.pulse = this.conf?.min_pulse ?? 0;
      this._editPoints = [pt];
    }
    this._editing = true;
    this.updateComplete.then(() => this._initEditorCanvas());
  }

  private _closeEditor(): void {
    if (this._previewRunning) this._stopPreview();
    this._editing = false;
    this._editPoints = [];
    this._editorCanvas = null;
  }

  private _initEditorCanvas(): void {
    this._editorCanvas =
      this.shadowRoot?.querySelector(".editor-chart canvas") ?? null;
    if (this._editorCanvas) {
      const ro = new ResizeObserver(() => this._drawEditorChart());
      ro.observe(this._editorCanvas);
      (this as any)._editorRo = ro;
    }
    this._drawEditorChart();
  }

  /** Find which row index is "current" based on the time of day */
  private _getCurrentRowIndex(nowMin: number): number {
    if (this._editPoints.length === 0) return -1;
    let idx = 0;
    for (let i = 1; i < this._editPoints.length; i++) {
      if (this._editPoints[i].minutes <= nowMin) idx = i;
      else break;
    }
    return idx;
  }

  private _renderEditor(): TemplateResult {
    const maxPts = this.conf?.max_points ?? 10;
    const minVal = this.conf?.min_value ?? 0;
    const maxVal = this.conf?.max_value ?? 100;
    const canAdd = this._editPoints.length < maxPts;
    const canDelete = this._editPoints.length > 1;
    const hasPulse = !!this.conf?.pulse_field;
    const minPulse = this.conf?.min_pulse ?? 0;
    const maxPulse = this.conf?.max_pulse ?? 300;
    const gridClass = hasPulse
      ? "grid-table cols-pulse"
      : "grid-table cols-base";

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const currentRowIdx = this._getCurrentRowIndex(nowMin);

    return html`
      <div class="editor-overlay" @click=${this._onOverlayClick}>
        <div class="editor-panel" @click=${(e: Event) => e.stopPropagation()}>
          <div class="editor-header">
            <h3>${i18n._("sched_title")}</h3>
            <button class="btn-icon" @click=${this._closeEditor}>
              &#x2715;
            </button>
          </div>

          <div class="editor-body">
            <div class="editor-chart"><canvas></canvas></div>

            <div class="editor-list">
              <div class="${gridClass}">
                <span class="gh"></span>
                <span class="gh">${i18n._("sched_start")}</span>
                <span class="gh">${i18n._("sched_intensity")}</span>
                ${hasPulse
                  ? html`<span class="gh">${i18n._("sched_pulse_time")}</span>`
                  : nothing}
                <span class="gh"></span>

                ${this._editPoints.map((pt, i) => {
                  const isCurrent = i === currentRowIdx;
                  const cls = isCurrent ? "current-row" : "";
                  const isActivePreview =
                    this._previewRunning && this._previewRowIdx === i;
                  return html`
                    <button
                      class="btn-icon ${isActivePreview ? "stop-row" : "play"}"
                      @click=${() => this._togglePreviewRow(i)}
                      title="${i18n._("sched_preview")}"
                    >
                      ${isActivePreview ? "\u25A0" : "\u25B6"}
                    </button>
                    <input
                      type="time"
                      class="${cls}"
                      .value=${this._minutesToTime(pt.minutes)}
                      @change=${(e: Event) => this._onTimeChange(i, e)}
                    />
                    <input
                      type="number"
                      class="${cls}"
                      min=${minVal}
                      max=${maxVal}
                      .value=${String(pt.value)}
                      @change=${(e: Event) => this._onValueChange(i, e)}
                    />
                    ${hasPulse
                      ? html`<input
                          type="number"
                          class="${cls}"
                          min=${minPulse}
                          max=${maxPulse}
                          .value=${String(pt.pulse ?? 0)}
                          @change=${(e: Event) => this._onPulseChange(i, e)}
                        />`
                      : nothing}
                    <button
                      class="btn-icon delete"
                      ?disabled=${!canDelete}
                      @click=${() => this._removePoint(i)}
                    >
                      &#x2212;
                    </button>
                  `;
                })}
              </div>
            </div>
          </div>

          <!-- Preview panel -->
          <div class="preview-bar">
            <span class="preview-label">${i18n._("sched_preview")}</span>
            <span
              class="preview-status ${this._previewRunning ? "running" : ""}"
            >
              ${this._previewRunning
                ? i18n._("sched_preview_running")
                : i18n._("sched_preview_stopped")}
            </span>
            <input
              type="number"
              class="preview-input"
              min=${minVal}
              max=${maxVal}
              .value=${String(this._previewValue)}
              @change=${this._onPreviewValueChange}
            />
            ${hasPulse
              ? html`<input
                  type="number"
                  class="preview-input"
                  min=${minPulse}
                  max=${maxPulse}
                  .value=${String(this._previewPulse)}
                  @change=${this._onPreviewPulseChange}
                />`
              : nothing}
            ${this._previewRunning
              ? html`<button class="btn-stop" @click=${this._stopPreview}>
                  ${i18n._("sched_stop")}
                </button>`
              : html`<button
                  class="btn-start"
                  @click=${this._startPreviewFromBar}
                >
                  ${i18n._("sched_preview")}
                </button>`}
          </div>

          <div class="editor-footer">
            <button
              class="btn-add"
              ?disabled=${!canAdd}
              @click=${this._addPoint}
            >
              ${i18n._("sched_add")}
            </button>
            <div style="display:flex;gap:8px">
              <button class="btn-cancel" @click=${this._closeEditor}>
                ${i18n._("sched_cancel")}
              </button>
              <button class="btn-save" @click=${this._saveSchedule}>
                ${i18n._("sched_save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  //  Editor event handlers
  // ------------------------------------------------------------------

  private _onOverlayClick(e: Event): void {
    if ((e.target as HTMLElement).classList.contains("editor-overlay")) {
      this._closeEditor();
    }
  }

  private _onTimeChange(index: number, e: Event): void {
    const input = e.target as HTMLInputElement;
    const [h, m] = input.value.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      this._editPoints[index].minutes = h * 60 + m;
      this._sortEditPoints();
      this.requestUpdate();
    }
  }

  private _onValueChange(index: number, e: Event): void {
    const input = e.target as HTMLInputElement;
    const val = Number(input.value);
    const minVal = this.conf?.min_value ?? 0;
    const maxVal = this.conf?.max_value ?? 100;
    if (!isNaN(val)) {
      this._editPoints[index].value = Math.max(minVal, Math.min(maxVal, val));
      this.requestUpdate();
    }
  }

  private _onPulseChange(index: number, e: Event): void {
    const input = e.target as HTMLInputElement;
    const val = Number(input.value);
    const minPulse = this.conf?.min_pulse ?? 0;
    const maxPulse = this.conf?.max_pulse ?? 300;
    if (!isNaN(val)) {
      this._editPoints[index].pulse = Math.max(
        minPulse,
        Math.min(maxPulse, val),
      );
      this.requestUpdate();
    }
  }

  private _addPoint(): void {
    const maxPts = this.conf?.max_points ?? 10;
    if (this._editPoints.length >= maxPts) return;
    const lastMin =
      this._editPoints.length > 0
        ? this._editPoints[this._editPoints.length - 1].minutes
        : 0;
    const newMin = Math.min(lastMin + 60, TOTAL_MINUTES - 1);
    const pt: SchedulePoint = {
      minutes: newMin,
      value: this.conf?.min_value ?? 0,
    };
    if (this.conf?.pulse_field) pt.pulse = this.conf?.min_pulse ?? 0;
    this._editPoints.push(pt);
    this._sortEditPoints();
    this.requestUpdate();
  }

  private _removePoint(index: number): void {
    if (this._editPoints.length <= 1) return;
    this._editPoints.splice(index, 1);
    this.requestUpdate();
  }

  private _sortEditPoints(): void {
    this._editPoints.sort((a, b) => a.minutes - b.minutes);
  }

  // ------------------------------------------------------------------
  //  Preview
  // ------------------------------------------------------------------

  /** Start preview from a row: PUT values then press preview_start button */
  private _startPreview(index: number): void {
    const pt = this._editPoints[index];
    if (!pt) return;
    this._previewValue = pt.value;
    this._previewPulse = pt.pulse ?? 0;
    this._previewRowIdx = index;
    this._previewRunning = true;
    this._sendPreviewValues();
    // Press the HA preview_start button entity after sending values
    this._pressButton("preview_start");
  }

  /** Stop preview: press the HA preview_stop button entity */
  private _stopPreview(): void {
    this._previewRunning = false;
    this._previewRowIdx = -1;
    this._pressButton("preview_stop");
  }

  /** Start preview from the preview bar using current bar values */
  private _startPreviewFromBar(): void {
    this._previewRowIdx = -1;
    this._previewRunning = true;
    this._sendPreviewValues();
    this._pressButton("preview_start");
  }

  /** Toggle preview from a row icon: play if not running on this row, stop if it is */
  private _togglePreviewRow(index: number): void {
    if (this._previewRunning && this._previewRowIdx === index) {
      this._stopPreview();
    } else {
      this._startPreview(index);
    }
  }

  private _onPreviewValueChange(e: Event): void {
    const val = Number((e.target as HTMLInputElement).value);
    const minVal = this.conf?.min_value ?? 0;
    const maxVal = this.conf?.max_value ?? 100;
    if (!isNaN(val)) {
      this._previewValue = Math.max(minVal, Math.min(maxVal, val));
      if (this._previewRunning) this._sendPreviewValues();
    }
  }

  private _onPreviewPulseChange(e: Event): void {
    const val = Number((e.target as HTMLInputElement).value);
    const minPulse = this.conf?.min_pulse ?? 0;
    const maxPulse = this.conf?.max_pulse ?? 300;
    if (!isNaN(val)) {
      this._previewPulse = Math.max(minPulse, Math.min(maxPulse, val));
      if (this._previewRunning) this._sendPreviewValues();
    }
  }

  /** Send current preview values via PUT /preview */
  private _sendPreviewValues(): void {
    if (!this._hass) return;
    const pumpId = (this.device as any)?.id;
    const deviceId = (this.device as any)?.parent_device?.elements?.[0]
      ?.primary_config_entry;
    if (!pumpId || !deviceId) {
      console.error("Preview: missing pump id or device_id");
      return;
    }

    const valueField = this.conf?.value_field ?? "ti";
    const pulseField = this.conf?.pulse_field;

    const pumpData: Record<string, number> = {
      [valueField]: this._previewValue,
    };
    if (pulseField) pumpData[pulseField] = this._previewPulse;

    const data = {
      device_id: deviceId,
      access_path: "/preview",
      method: "put",
      data: { ["pump_" + pumpId]: pumpData },
    };

    console.debug("Schedule preview PUT", data);
    this._hass.callService("redsea", "request", data);
  }

  /** Press a HA button entity (preview_start / preview_stop) on this pump */
  private _pressButton(translationKey: string): void {
    if (!this._hass) return;
    const entity = (this.device as any)?.entities?.[translationKey];
    if (!entity) {
      console.error(`Preview: entity "${translationKey}" not found on pump`);
      return;
    }
    console.debug(`Schedule: pressing ${translationKey}`, entity.entity_id);
    this._hass.callService("button", "press", { entity_id: entity.entity_id });
  }

  // ------------------------------------------------------------------
  //  Save
  // ------------------------------------------------------------------

  private _saveSchedule(): void {
    if (!this.stateObj || !this._hass) return;

    const timeField = this.conf?.time_field ?? "st";
    const valueField = this.conf?.value_field ?? "ti";
    const pulseField = this.conf?.pulse_field;

    const schedule = this._editPoints.map((pt) => {
      const entry: Record<string, number> = {
        [timeField]: pt.minutes,
        [valueField]: pt.value,
      };
      if (pulseField) entry[pulseField] = pt.pulse ?? 0;
      return entry;
    });

    const pumpId = (this.device as any)?.id;
    const deviceId = (this.device as any)?.parent_device?.elements?.[0]
      ?.primary_config_entry;

    if (!pumpId || !deviceId) {
      console.error("Schedule save: missing pump id or device_id", {
        pumpId,
        deviceId,
      });
      return;
    }

    const data = {
      device_id: deviceId,
      access_path: "/pump/settings",
      method: "put",
      data: { ["pump_" + pumpId]: { schedule } },
    };

    console.debug("Schedule save", data);
    this._hass.callService("redsea", "request", data);
    this._closeEditor();
  }

  // ------------------------------------------------------------------
  //  Helpers
  // ------------------------------------------------------------------

  private _minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  // ------------------------------------------------------------------
  //  Canvas drawing
  // ------------------------------------------------------------------

  private _draw(): void {
    if (!this._canvas) return;
    const points = this._parseSchedule();
    this._drawOnCanvas(this._canvas, points, true);
  }

  private _drawEditorChart(): void {
    if (!this._editorCanvas) return;
    const points = [...this._editPoints].sort((a, b) => a.minutes - b.minutes);
    this._drawOnCanvas(this._editorCanvas, points, false);
  }

  private _drawOnCanvas(
    canvas: HTMLCanvasElement,
    points: SchedulePoint[],
    showNow: boolean,
  ): void {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    ctx.clearRect(0, 0, W, H);

    const chartX = PADDING_LEFT;
    const chartY = PADDING_TOP;
    const chartW = W - PADDING_LEFT - PADDING_RIGHT;
    const chartH = H - PADDING_TOP - PADDING_BOTTOM;
    if (chartW <= 0 || chartH <= 0) return;

    if (this.conf?.bg_color) {
      ctx.fillStyle = `rgba(${this.conf.bg_color})`;
      ctx.fillRect(0, 0, W, H);
    }

    if (points.length === 0) return;

    const minVal = this.conf?.min_value ?? 0;
    const maxVal =
      this.conf?.max_value ??
      Math.max(100, ...points.map((p) => p.value)) * 1.05;
    const yRange = maxVal - minVal || 1;
    const xOf = (minutes: number): number =>
      chartX + (minutes / TOTAL_MINUTES) * chartW;
    const yOf = (value: number): number =>
      chartY + chartH - ((value - minVal) / yRange) * chartH;

    const unit =
      this.conf?.unit ?? this.stateObj?.attributes?.unit_of_measurement ?? "";

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

    const rgb = this.conf?.line_color ?? this.c ?? "0,150,255";
    const lineColor = `rgb(${rgb})`;
    const fillAlpha = this.conf?.fill_alpha ?? 0.15;
    const fillColor = `rgba(${rgb},${fillAlpha})`;
    const linear = this.conf?.linear ?? false;

    ctx.beginPath();
    const firstVal = points[0].value;
    ctx.moveTo(xOf(0), yOf(firstVal));

    if (linear) {
      for (const pt of points) ctx.lineTo(xOf(pt.minutes), yOf(pt.value));
    } else {
      let prevY = yOf(firstVal);
      for (const pt of points) {
        const px = xOf(pt.minutes);
        const py = yOf(pt.value);
        ctx.lineTo(px, prevY);
        ctx.lineTo(px, py);
        prevY = py;
      }
    }

    const lastVal = points[points.length - 1].value;
    ctx.lineTo(xOf(TOTAL_MINUTES), yOf(lastVal));
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.lineTo(xOf(TOTAL_MINUTES), yOf(minVal));
    ctx.lineTo(xOf(0), yOf(minVal));
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    if (showNow) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const nowX = xOf(nowMinutes);
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

      ctx.fillStyle = "rgba(255,40,40,0.9)";
      ctx.beginPath();
      ctx.arc(nowX, nowY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const valueStr = Number.isInteger(nowValue)
        ? String(nowValue)
        : nowValue.toFixed(1);
      const combinedLabel = unit
        ? `${timeStr} ${valueStr}${unit}`
        : `${timeStr} ${valueStr}`;

      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = "rgba(255,40,40,0.9)";
      ctx.save();
      const textW = ctx.measureText(combinedLabel).width;
      const offset = 4;
      const rightSide = nowX + offset + 12 < chartX + chartW;
      const textCenterY = Math.min(nowY + textW / 2 + 8, chartY + chartH - 2);
      ctx.translate(nowX, textCenterY);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = rightSide ? "top" : "bottom";
      ctx.fillText(combinedLabel, 0, rightSide ? offset : -offset);
      ctx.restore();
    }
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
    const gridColor = `rgba(${lc},0.12)`;
    const tickColor = `rgba(${lc},0.35)`;
    const textColor = `rgba(${lc},0.7)`;
    const axisColor = `rgba(${lc},0.5)`;

    const hourStep = isSmall ? 6 : 3;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.fillStyle = textColor;
    ctx.font = `${isSmall ? 8 : 10}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let h = 0; h <= 24; h += hourStep) {
      const x = xOf(h * 60);
      ctx.beginPath();
      ctx.moveTo(x, chartY);
      ctx.lineTo(x, chartY + chartH);
      ctx.stroke();
      ctx.strokeStyle = tickColor;
      ctx.beginPath();
      ctx.moveTo(x, chartY + chartH);
      ctx.lineTo(x, chartY + chartH + 3);
      ctx.stroke();
      ctx.strokeStyle = gridColor;
      if (h < 24)
        ctx.fillText(
          `${h.toString().padStart(2, "0")}h`,
          x,
          chartY + chartH + 5,
        );
    }

    const yRange = maxVal - minVal;
    const yStep = this._niceStep(yRange, 4);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let v = Math.ceil(minVal / yStep) * yStep; v <= maxVal; v += yStep) {
      const y = yOf(v);
      ctx.strokeStyle = gridColor;
      ctx.beginPath();
      ctx.moveTo(chartX, y);
      ctx.lineTo(chartX + chartW, y);
      ctx.stroke();
      ctx.strokeStyle = tickColor;
      ctx.beginPath();
      ctx.moveTo(chartX - 3, y);
      ctx.lineTo(chartX, y);
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.fillText(
        unit ? `${Math.round(v)}${unit}` : String(Math.round(v)),
        chartX - 5,
        y,
      );
    }

    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartH);
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.stroke();
  }

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
  //  Value interpolation
  // ------------------------------------------------------------------

  private _interpolateValue(
    points: SchedulePoint[],
    minutes: number,
    linear: boolean,
  ): number {
    if (points.length === 0) return 0;
    if (minutes <= points[0].minutes) return points[0].value;
    if (minutes >= points[points.length - 1].minutes)
      return points[points.length - 1].value;
    for (let i = 1; i < points.length; i++) {
      if (minutes <= points[i].minutes) {
        const prev = points[i - 1];
        const next = points[i];
        if (!linear || prev.minutes === next.minutes) return prev.value;
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
    const pulseField = this.conf?.pulse_field;
    const points: SchedulePoint[] = [];

    for (const entry of raw) {
      const minutes = Number(entry[timeField]);
      const value = Number(entry[valueField]);
      if (!isNaN(minutes) && !isNaN(value)) {
        const pt: SchedulePoint = { minutes, value };
        if (pulseField && entry[pulseField] !== undefined)
          pt.pulse = Number(entry[pulseField]);
        points.push(pt);
      }
    }
    points.sort((a, b) => a.minutes - b.minutes);
    return points;
  }
}
