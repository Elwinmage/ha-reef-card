/**
 * @file On/Off schedule editor for ReefPower AC sockets
 * @module devices.redsea.rspower.power_schedule
 *
 * Displays and edits the daily on/off schedule for a single socket.
 *
 * Schedule format (from the device):
 *   GET /socket/<n>/config/schedule → {"intervals": [{"time": <min>, "duration": <min>}]}
 *   PUT /socket/<n>/config/schedule ← {"intervals": [{"time": <min>, "duration": <min>}]}
 *
 * Each interval defines an ON window: the socket is ON from `time` for
 * `duration` minutes, OFF everywhere else.
 *
 * The editor fetches the current schedule via `redsea.request` (GET),
 * lets the user add/remove/edit intervals visually, and saves via
 * `redsea.request` (PUT).
 */

import { html, LitElement, TemplateResult, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import styles from "./power_schedule.styles";
import i18n from "../../../translations/myi18n";

// ────────────────────────────────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────────────────────────────────

interface Interval {
  time: number; // minutes from midnight
  duration: number; // minutes
}

const TOTAL_MINUTES = 24 * 60; // 1440
const MAX_INTERVALS = 10;

// Colours for the timeline: ON blocks vs the OFF background
const ON_COLOR = "51,151,232"; // primary-ish blue
const OFF_COLOR = "220,60,60"; // red

// ────────────────────────────────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────────────────────────────────

export class PowerSchedule extends LitElement {
  static styles = [styles];

  // --- Properties set externally by the dialog system ---
  @property({ attribute: false }) hass: any = null;
  @property({ attribute: false }) device: any = null;
  @property({ attribute: false }) conf: any = null;

  // --- Internal state ---
  @state() private _loading = true;
  @state() private _error: string | null = null;
  @state() private _intervals: Interval[] = [];

  private _resizeObserver: ResizeObserver | null = null;
  private _loaded = false;

  /** Called by the dialog system to pass configuration */
  setConfig(conf: any): void {
    this.conf = conf;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this._loaded) {
      this._fetchSchedule();
    }
  }

  override disconnectedCallback(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    super.disconnectedCallback();
  }

  override updated(): void {
    this._drawTimeline();
  }

  override firstUpdated(): void {
    // The dialog sizes its content after the first paint, so the canvas may
    // still measure 0px wide here. Redraw whenever its box changes.
    const host = this.shadowRoot?.querySelector(".ps-timeline");
    if (host && "ResizeObserver" in window) {
      this._resizeObserver = new ResizeObserver(() => this._drawTimeline());
      this._resizeObserver.observe(host);
    }
    this._drawTimeline();
  }

  // ── Data fetch / save ─────────────────────────────────────────────────

  /** Resolve the config_entry id used as `device_id` by the redsea.request service.
   *
   * The element sits at the bottom of a chain: PowerSchedule.device is the
   * PowerSocket, whose .device is the RSPower instance, whose .device is the
   * HA DeviceInfo carrying elements[0].primary_config_entry. Walk up until a
   * primary_config_entry is found so the lookup survives layout changes.
   */
  private _getDeviceId(): string | null {
    let node: any = this.device;

    for (let depth = 0; node && depth < 5; depth++) {
      const entry = node?.elements?.[0]?.primary_config_entry;
      if (entry) return entry;

      // parent_device is populated for child devices (RSRun pumps and alike)
      const parentEntry =
        node?.parent_device?.elements?.[0]?.primary_config_entry;
      if (parentEntry) return parentEntry;

      node = node.device ?? node.parent_device;
    }
    return null;
  }

  /** Get the 0-based socket number expected by the device API.
   *
   * Card-side sockets are numbered 1..N (config.id / socket_id), the REST API
   * uses /socket/0/… for the first socket.
   */
  private _getSocketNumber(): number {
    const dev: any = this.device;
    const raw = dev?.socket_id ?? dev?.config?.id;
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? num - 1 : 0;
  }

  private async _fetchSchedule(): Promise<void> {
    this._loading = true;
    this._error = null;

    const deviceId = this._getDeviceId();
    const socketNum = this._getSocketNumber();

    if (!deviceId || !this.hass) {
      console.error("PowerSchedule: missing device context", {
        deviceId,
        socketNum,
        device: this.device,
        hasHass: !!this.hass,
      });
      this._error = "Missing device context";
      this._loading = false;
      return;
    }

    try {
      // Use the WebSocket call_service message which returns the service
      // response directly (unlike the REST-based callService which is
      // fire-and-forget in the HA frontend).
      const resp = await this.hass.callWS({
        type: "call_service",
        domain: "redsea",
        service: "request",
        service_data: {
          device_id: deviceId,
          access_path: `/socket/${socketNum}/config/schedule`,
          method: "get",
        },
        return_response: true,
      });

      // Response shape: {response: {ok: true, json: {intervals: [...]}}}
      const json = resp?.response?.json ?? {};
      const intervals: Interval[] = [];

      if (json?.intervals && Array.isArray(json.intervals)) {
        for (const iv of json.intervals) {
          const t = Number(iv.time);
          const d = Number(iv.duration);
          if (!isNaN(t) && !isNaN(d) && d > 0) {
            intervals.push({ time: t, duration: d });
          }
        }
      }

      this._intervals = intervals.sort((a, b) => a.time - b.time);
      this._loaded = true;
    } catch (err: any) {
      console.error("PowerSchedule: fetch failed", err);
      this._error = String(err?.message || err);
    } finally {
      this._loading = false;
    }
  }

  private async _saveSchedule(): Promise<void> {
    const deviceId = this._getDeviceId();
    const socketNum = this._getSocketNumber();

    if (!deviceId || !this.hass) return;

    // Clean & sort intervals before sending
    const intervals = this._intervals
      .filter((iv) => iv.duration > 0)
      .sort((a, b) => a.time - b.time)
      .map((iv) => ({
        time: Math.max(0, Math.min(TOTAL_MINUTES - 1, iv.time)),
        duration: Math.max(1, iv.duration),
      }));

    try {
      await this.hass.callService("redsea", "request", {
        device_id: deviceId,
        access_path: `/socket/${socketNum}/config/schedule`,
        method: "put",
        data: { intervals },
      });

      // Close the dialog after successful save
      this.dispatchEvent(
        new CustomEvent("quit-dialog", { bubbles: true, composed: true }),
      );
    } catch (err) {
      console.error("PowerSchedule: save failed", err);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────

  override render(): TemplateResult {
    const readonly = this.conf?.readonly === true;

    if (this._loading) {
      return readonly
        ? html``
        : html`<div class="ps-container">
            <div class="ps-loading">⏳</div>
          </div>`;
    }
    if (this._error) {
      return readonly
        ? html``
        : html`<div class="ps-container">
            <div class="ps-error">${this._error}</div>
          </div>`;
    }

    // Compact preview: the timeline only, clickable to open the full editor.
    // Hidden entirely when the socket is not driven by a schedule.
    if (readonly) {
      if (!this._isScheduleMode()) return html``;
      return html`
        <div
          class="ps-preview"
          title="${i18n._("socket_schedule")}"
          @click=${this._openEditor}
        >
          <div class="ps-timeline compact"><canvas></canvas></div>
        </div>
      `;
    }

    const canAdd = this._intervals.length < MAX_INTERVALS;
    const canDelete = this._intervals.length > 0;

    return html`
      <div class="ps-container">
        <div class="ps-timeline"><canvas></canvas></div>

        <div class="ps-header">
          <span></span>
          <span>${i18n._("sched_from")}</span>
          <span>${i18n._("sched_to")}</span>
          <span></span>
        </div>

        <div class="ps-intervals">
          ${this._intervals.length === 0
            ? html`<div class="ps-loading" style="padding:8px">
                ${i18n._("sched_off")} — 00:00 → 23:59
              </div>`
            : nothing}
          ${this._intervals.map(
            (iv, i) => html`
              <div class="ps-row">
                <span class="idx">${i + 1}</span>
                <input
                  type="time"
                  .value=${this._minutesToTime(iv.time)}
                  @change=${(e: Event) => this._onStartChange(i, e)}
                />
                <input
                  type="time"
                  .value=${this._minutesToTime(
                    Math.min(iv.time + iv.duration, TOTAL_MINUTES - 1),
                  )}
                  @change=${(e: Event) => this._onEndChange(i, e)}
                />
                <button
                  class="btn-del"
                  ?disabled=${!canDelete}
                  @click=${() => this._removeInterval(i)}
                >
                  &#x2212;
                </button>
              </div>
            `,
          )}
        </div>

        <button class="ps-add" ?disabled=${!canAdd} @click=${this._addInterval}>
          ${i18n._("sched_add_interval")}
        </button>

        <div class="ps-footer">
          <button
            class="ps-btn ps-btn-save"
            @click=${() => this._saveSchedule()}
          >
            ${i18n._("sched_save")}
          </button>
        </div>
      </div>
    `;
  }

  // ── Event handlers ────────────────────────────────────────────────────

  private _onStartChange(index: number, e: Event): void {
    const input = e.target as HTMLInputElement;
    const [h, m] = input.value.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;

    const newStart = h * 60 + m;
    const iv = this._intervals[index];
    // Keep the end time the same: adjust duration
    const oldEnd = iv.time + iv.duration;
    iv.time = newStart;
    iv.duration = Math.max(1, oldEnd - newStart);

    this._intervals = [...this._intervals].sort((a, b) => a.time - b.time);
    this.requestUpdate();
  }

  private _onEndChange(index: number, e: Event): void {
    const input = e.target as HTMLInputElement;
    const [h, m] = input.value.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;

    const newEnd = h * 60 + m;
    const iv = this._intervals[index];
    iv.duration = Math.max(1, newEnd - iv.time);

    this._intervals = [...this._intervals];
    this.requestUpdate();
  }

  private _addInterval(): void {
    if (this._intervals.length >= MAX_INTERVALS) return;

    // Find a gap to place the new interval (default: start at last end + 60min)
    let startMin = 0;
    if (this._intervals.length > 0) {
      const last = this._intervals[this._intervals.length - 1];
      startMin = Math.min(last.time + last.duration + 60, TOTAL_MINUTES - 61);
    }
    startMin = Math.max(0, startMin);

    this._intervals = [
      ...this._intervals,
      { time: startMin, duration: 60 },
    ].sort((a, b) => a.time - b.time);
    this.requestUpdate();
  }

  private _removeInterval(index: number): void {
    this._intervals = this._intervals.filter((_, i) => i !== index);
    this.requestUpdate();
  }

  // ── Canvas drawing ────────────────────────────────────────────────────

  /**
   * Draw the 24h on/off timeline.
   *
   * The whole strip is OFF (red) by default; each interval paints an ON
   * (blue) block over it. An hour scale runs underneath and a marker shows
   * the current time.
   */
  private _drawTimeline(): void {
    const canvas = this.shadowRoot?.querySelector(
      ".ps-timeline canvas",
    ) as HTMLCanvasElement | null;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);

    // Assigning width/height also clears the canvas
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const compact = this.conf?.readonly === true;
    const PAD_X = 2 * dpr;
    const PAD_T = 2 * dpr;
    const PAD_B = (compact ? 12 : 15) * dpr;
    const chartW = w - PAD_X * 2;
    const chartH = h - PAD_T - PAD_B;
    if (chartW <= 0 || chartH <= 0) return;

    const xOf = (m: number) =>
      PAD_X +
      (Math.max(0, Math.min(TOTAL_MINUTES, m)) / TOTAL_MINUTES) * chartW;

    // OFF background covers the full day
    ctx.fillStyle = `rgba(${OFF_COLOR},0.30)`;
    ctx.fillRect(PAD_X, PAD_T, chartW, chartH);

    // ON blocks painted over it
    ctx.font = `bold ${(compact ? 8 : 10) * dpr}px sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const midY = PAD_T + chartH / 2;

    for (const iv of this._intervals) {
      const x1 = xOf(iv.time);
      const x2 = xOf(iv.time + iv.duration);
      const blockW = x2 - x1;
      if (blockW <= 0) continue;

      ctx.fillStyle = `rgba(${ON_COLOR},0.55)`;
      ctx.fillRect(x1, PAD_T, blockW, chartH);

      if (blockW > 26 * dpr) {
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fillText(i18n._("sched_on"), x1 + blockW / 2, midY);
      }
    }

    // Hour grid: a tick every 3h, plus a subtle line every hour
    ctx.strokeStyle = "rgba(0,0,0,0.10)";
    ctx.lineWidth = 1;
    for (let hour = 1; hour < 24; hour++) {
      const x = Math.round(xOf(hour * 60)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, PAD_T + chartH - (hour % 3 === 0 ? chartH : 4 * dpr));
      ctx.lineTo(x, PAD_T + chartH);
      ctx.stroke();
    }

    // Current time marker
    const now = new Date();
    const nowX = xOf(now.getHours() * 60 + now.getMinutes());
    ctx.strokeStyle = "rgba(220,30,30,0.95)";
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(nowX, PAD_T);
    ctx.lineTo(nowX, PAD_T + chartH);
    ctx.stroke();

    // Frame
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD_X + 0.5, PAD_T + 0.5, chartW - 1, chartH - 1);

    // Hour scale underneath. Labels are clamped so 0h and 24h stay inside.
    ctx.fillStyle = "var(--secondary-text-color)";
    ctx.fillStyle = "rgba(127,127,127,0.95)";
    ctx.font = `${(compact ? 7 : 9) * dpr}px sans-serif`;
    ctx.textBaseline = "top";
    const step = compact ? 6 : 3;
    for (let hour = 0; hour <= 24; hour += step) {
      const x = xOf(hour * 60);
      ctx.textAlign = hour === 0 ? "left" : hour === 24 ? "right" : "center";
      ctx.fillText(
        hour === 24 ? "24h" : `${hour}h`,
        x,
        PAD_T + chartH + 2 * dpr,
      );
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  /** True when the socket is currently driven by its schedule. */
  private _isScheduleMode(): boolean {
    const entities: any = (this.device as any)?.entities;
    const states: any = this.hass?.states;
    if (!entities || !states) return false;

    const read = (key: string): string | null =>
      states[entities[key]?.entity_id]?.state ?? null;

    return (
      read("socket_mode") === "schedule" ||
      read("socket_prev_mode") === "schedule"
    );
  }

  /** Open the full schedule dialog from the compact preview. */
  private _openEditor(): void {
    this.dispatchEvent(
      new CustomEvent("display-dialog", {
        bubbles: true,
        composed: true,
        detail: {
          type: "socket_schedule",
          overload_quit: "socket_config",
          elt: this,
        },
      }),
    );
  }

  private _minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }
}
