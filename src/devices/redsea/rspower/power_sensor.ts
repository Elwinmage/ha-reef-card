/**
 * @file Unified socket configuration editor for RSPower sockets
 * @module devices.redsea.rspower.power_sensor
 *
 * A single LitElement rendered inside the socket_config dialog that
 * replaces the removed HA select.socket_mode entity.  It provides:
 *
 *   - A 4-button mode selector: On / Off / Schedule / Sensor
 *   - Mode-conditional content:
 *       On / Off  →  nothing extra (immediate save on button click)
 *       Schedule  →  inline 24h timeline editor (canvas) + interval list
 *       Sensor    →  probe list + per-type threshold form
 *
 * All saves are deferred to a single Save button at the bottom.
 * Mode changes do NOT write to the device until the user saves.
 *
 * Endpoints used (all via redsea.request):
 *   PUT /sockets/config         { sockets: [{number, mode, name?}] }
 *   PUT /socket/n/config/schedule { intervals: [{time, duration}] }
 *   PUT /temperature/subscribe  { sockets: [{number, default_state,
 *                                  app_cache, turn_on, is_above,
 *                                  value, hysteresis, sensor}] }
 *   PUT /subscribe              { sockets: [{number, default_state,
 *                                  app_cache}] }
 */

import { html, LitElement, TemplateResult, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import styles from "./power_sensor.styles";
import i18n from "../../../translations/myi18n";

// ─── Types ───────────────────────────────────────────────────────────────────

type SocketMode = "on" | "off" | "schedule" | "sensor";
type ProbeTypeId = "temperature" | "ec" | "ph" | "orp" | "leak" | "ato";
type SubSensor = "primary" | "temperature";

interface ProbeOption {
  label: string;
  uid: string;
  type: ProbeTypeId;
  sensor: SubSensor;
  from_control: boolean;
}

interface Interval {
  time: number; // minutes from midnight
  duration: number; // minutes
}

// ─── Per-type parameter descriptors (from DEX: DeviceSubscriberType) ─────────
//
// supportsHysteresis(): Temp=true, LEVEL_TEMP(ato)=true, Ph=true, Orp=true,
//                       Salinity(ec)=true, Leak=false
// ATO (isMainLevelSensor=true): hides condition/fallback/hysteresis entirely
// Leak: shows turn_on only, hides value/is_above/hysteresis

interface ProbeTypeDef {
  unit: string;
  defaultValue: number;
  defaultDelta: number;
  hasValue: boolean; // numeric threshold input
  hasDirection: boolean; // above / below toggle
  hasTurnOn: boolean; // turn ON/OFF when triggered
  hasHysteresis: boolean;
  hasFallback: boolean;
  isAto: boolean; // pure level sensor, no threshold at all
}

const PROBE_TYPES: Record<ProbeTypeId, ProbeTypeDef> = {
  temperature: {
    unit: "°C",
    defaultValue: 25.0,
    defaultDelta: 0.5,
    hasValue: true,
    hasDirection: true,
    hasTurnOn: true,
    hasHysteresis: true,
    hasFallback: true,
    isAto: false,
  },
  ph: {
    unit: "pH",
    defaultValue: 8.2,
    defaultDelta: 0.1,
    hasValue: true,
    hasDirection: true,
    hasTurnOn: true,
    hasHysteresis: true,
    hasFallback: true,
    isAto: false,
  },
  orp: {
    unit: "mV",
    defaultValue: 420.0,
    defaultDelta: 25.0,
    hasValue: true,
    hasDirection: true,
    hasTurnOn: true,
    hasHysteresis: true,
    hasFallback: true,
    isAto: false,
  },
  ec: {
    unit: "PSU",
    defaultValue: 34.0,
    defaultDelta: 0.64,
    hasValue: true,
    hasDirection: true,
    hasTurnOn: true,
    hasHysteresis: true,
    hasFallback: true,
    isAto: false,
  },
  // ATO: isMainLevelSensor → no condition/fallback/hysteresis shown (DEX line 637)
  ato: {
    unit: "",
    defaultValue: 0,
    defaultDelta: 0,
    hasValue: false,
    hasDirection: false,
    hasTurnOn: false,
    hasHysteresis: false,
    hasFallback: false,
    isAto: true,
  },
  // Leak: binary, shows turn_on only, no value/is_above/hysteresis (DEX line 671)
  leak: {
    unit: "",
    defaultValue: 0,
    defaultDelta: 0,
    hasValue: false,
    hasDirection: false,
    hasTurnOn: true,
    hasHysteresis: false,
    hasFallback: true,
    isAto: false,
  },
};

const MODE_DEFS: Array<{ id: SocketMode; labelKey: string; icon: string }> = [
  { id: "on", labelKey: "sensor_mode_on", icon: "mdi:power" },
  { id: "off", labelKey: "sensor_mode_off", icon: "mdi:power-off" },
  {
    id: "schedule",
    labelKey: "sensor_mode_schedule",
    icon: "mdi:clock-outline",
  },
  { id: "sensor", labelKey: "sensor_mode_sensor", icon: "mdi:flask-outline" },
];

const TOTAL_MINUTES = 24 * 60;
const MAX_INTERVALS = 10;

// ─── Component ───────────────────────────────────────────────────────────────

export class PowerSensor extends LitElement {
  static styles = [styles];

  @property({ attribute: false }) hass: any = null;
  @property({ attribute: false }) device: any = null; // PowerSocket
  @property({ attribute: false }) conf: any = null;

  // ── Mode state ──────────────────────────────────────────────────────────
  @state() private _mode: SocketMode = "on";
  @state() private _saving = false;
  @state() private _saveError: string | null = null;

  // ── Schedule state ──────────────────────────────────────────────────────
  @state() private _intervals: Interval[] = [];
  private _scheduleLoaded = false;
  private _resizeObserver: ResizeObserver | null = null;

  // ── Sensor state ────────────────────────────────────────────────────────
  @state() private _probeOptions: ProbeOption[] = [];
  @state() private _probeIdx = 0;
  @state() private _isAbove = true;
  @state() private _value = 25.0;
  @state() private _hysteresis = 0.5;
  @state() private _turnOn = true;
  @state() private _fallbackOn = false;

  private _loaded = false;

  setConfig(conf: any): void {
    this.conf = conf;
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this._loaded) {
      this._mode = this._readCurrentMode();
      this._buildProbeList();
      if (this._mode === "schedule") this._loadSchedule();
      if (this._mode === "sensor") this._loadSensorConfig();
      this._loaded = true;
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
    const canvas = this.shadowRoot?.querySelector(".sce-timeline canvas");
    if (canvas && "ResizeObserver" in window) {
      this._resizeObserver = new ResizeObserver(() => this._drawTimeline());
      this._resizeObserver.observe(canvas);
    }
  }

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("hass") && this._loaded) {
      this._buildProbeList();
    }
  }

  // ── Device helpers ──────────────────────────────────────────────────────

  private _socket(): any {
    return this.device;
  }
  private _strip(): any {
    return (this.device as any)?.device ?? null;
  }

  private _socketNum(): number {
    const dev: any = this._socket();
    const raw = dev?.socket_id ?? dev?.config?.id;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n - 1 : 0;
  }

  private _configEntry(): string | null {
    let node: any = this.device;
    for (let i = 0; node && i < 5; i++) {
      const e = node?.elements?.[0]?.primary_config_entry;
      if (e) return e;
      node = node.device ?? node.parent_device;
    }
    return null;
  }

  private _entityState(key: string): string | null {
    const e = this._socket()?.entities?.[key];
    if (!e) return null;
    return this.hass?.states?.[e.entity_id]?.state ?? null;
  }

  private _entityAttr(key: string, attr: string): any {
    const e = this._socket()?.entities?.[key];
    if (!e) return null;
    return this.hass?.states?.[e.entity_id]?.attributes?.[attr] ?? null;
  }

  private _socketName(): string | null {
    const state = this._entityState("socket_name");
    return state && state !== "unknown" ? state : null;
  }

  // ── Mode ────────────────────────────────────────────────────────────────

  private _readCurrentMode(): SocketMode {
    const m = this._entityState("socket_mode");
    if (m === "on" || m === "off" || m === "schedule" || m === "sensor")
      return m;
    return "on";
  }

  private _onModeClick(mode: SocketMode): void {
    if (mode === this._mode) return;
    this._mode = mode;
    this._saveError = null;
    if (mode === "schedule" && !this._scheduleLoaded) this._loadSchedule();
    if (mode === "sensor") this._buildProbeList();
  }

  // ── Schedule helpers ────────────────────────────────────────────────────

  private _loadSchedule(): void {
    const attrs = this._entityAttr("socket_mode", "schedule");
    const raw = attrs?.intervals ?? [];
    this._intervals = Array.isArray(raw)
      ? raw
          .filter((iv: any) => Number(iv?.duration) > 0)
          .map((iv: any) => ({
            time: Number(iv.time),
            duration: Number(iv.duration),
          }))
          .sort((a: Interval, b: Interval) => a.time - b.time)
      : [];
    this._scheduleLoaded = true;
  }

  private _minutesToTime(m: number): string {
    const h = Math.floor(m / 60) % 24;
    const min = m % 60;
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }

  private _onStartChange(i: number, e: Event): void {
    const [h, m] = (e.target as HTMLInputElement).value.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const iv = this._intervals[i];
    const oldEnd = iv.time + iv.duration;
    iv.time = h * 60 + m;
    iv.duration = Math.max(1, oldEnd - iv.time);
    this._intervals = [...this._intervals].sort((a, b) => a.time - b.time);
    this.requestUpdate();
  }

  private _onEndChange(i: number, e: Event): void {
    const [h, m] = (e.target as HTMLInputElement).value.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;
    this._intervals[i].duration = Math.max(
      1,
      h * 60 + m - this._intervals[i].time,
    );
    this._intervals = [...this._intervals];
    this.requestUpdate();
  }

  private _addInterval(): void {
    if (this._intervals.length >= MAX_INTERVALS) return;
    let start = 0;
    if (this._intervals.length > 0) {
      const last = this._intervals[this._intervals.length - 1];
      start = Math.min(last.time + last.duration + 60, TOTAL_MINUTES - 61);
    }
    this._intervals = [
      ...this._intervals,
      { time: Math.max(0, start), duration: 60 },
    ].sort((a, b) => a.time - b.time);
    this.requestUpdate();
  }

  private _removeInterval(i: number): void {
    this._intervals = this._intervals.filter((_, idx) => idx !== i);
    this.requestUpdate();
  }

  // ── Schedule canvas ─────────────────────────────────────────────────────

  private _drawTimeline(): void {
    if (this._mode !== "schedule") return;
    const canvas = this.shadowRoot?.querySelector(
      ".sce-timeline canvas",
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const PAD_X = 2 * dpr,
      PAD_T = 2 * dpr,
      PAD_B = 15 * dpr;
    const cW = w - PAD_X * 2,
      cH = h - PAD_T - PAD_B;
    if (cW <= 0 || cH <= 0) return;
    const xOf = (m: number) =>
      PAD_X + (Math.max(0, Math.min(TOTAL_MINUTES, m)) / TOTAL_MINUTES) * cW;
    ctx.fillStyle = "rgba(220,60,60,0.28)";
    ctx.fillRect(PAD_X, PAD_T, cW, cH);
    ctx.font = `bold ${10 * dpr}px sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const midY = PAD_T + cH / 2;
    for (const iv of this._intervals) {
      const x1 = xOf(iv.time),
        x2 = xOf(iv.time + iv.duration);
      const bW = x2 - x1;
      if (bW <= 0) continue;
      ctx.fillStyle = "rgba(51,151,232,0.55)";
      ctx.fillRect(x1, PAD_T, bW, cH);
      if (bW > 26 * dpr) {
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fillText(i18n._("sched_on"), x1 + bW / 2, midY);
      }
    }
    ctx.strokeStyle = "rgba(0,0,0,0.10)";
    ctx.lineWidth = 1;
    for (let hour = 1; hour < 24; hour++) {
      const x = Math.round(xOf(hour * 60)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, PAD_T + cH - (hour % 3 === 0 ? cH : 4 * dpr));
      ctx.lineTo(x, PAD_T + cH);
      ctx.stroke();
    }
    const now = new Date();
    const nowX = xOf(now.getHours() * 60 + now.getMinutes());
    ctx.strokeStyle = "rgba(220,30,30,0.9)";
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(nowX, PAD_T);
    ctx.lineTo(nowX, PAD_T + cH);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD_X + 0.5, PAD_T + 0.5, cW - 1, cH - 1);
    ctx.fillStyle = "rgba(127,127,127,0.9)";
    ctx.font = `${9 * dpr}px sans-serif`;
    ctx.textBaseline = "top";
    for (let hour = 0; hour <= 24; hour += 3) {
      const x = xOf(hour * 60);
      ctx.textAlign = hour === 0 ? "left" : hour === 24 ? "right" : "center";
      ctx.fillText(hour === 24 ? "24h" : `${hour}h`, x, PAD_T + cH + 2 * dpr);
    }
  }

  // ── Sensor helpers ──────────────────────────────────────────────────────

  private _loadSensorConfig(): void {
    const cfg = this._entityAttr("socket_mode", "sensor_config");
    if (!cfg) return;
    // Structure: {sensor:{app_cache, default_state}, value, is_above, turn_on}
    if (cfg.is_above !== undefined) this._isAbove = Boolean(cfg.is_above);
    if (cfg.value !== undefined) this._value = Number(cfg.value);
    if (cfg.turn_on !== undefined) this._turnOn = Boolean(cfg.turn_on);
    const inner = cfg.sensor ?? {};
    if (inner.default_state !== undefined)
      this._fallbackOn = Boolean(inner.default_state);
    const appCache: string = inner.app_cache ?? "";
    if (appCache) {
      const idx = this._probeOptions.findIndex((p) => p.type === appCache);
      if (idx >= 0) this._probeIdx = idx;
    }
  }

  private _buildProbeList(): void {
    const options: ProbeOption[] = [];

    // ── Local temperature probe ───────────────────────────────────────────
    const tempVal = this._entityState("power_temperature");
    if (
      tempVal !== null &&
      tempVal !== "unknown" &&
      tempVal !== "unavailable"
    ) {
      options.push({
        label: i18n._("sensor_local_temp"),
        uid: "local",
        type: "temperature",
        sensor: "primary",
        from_control: false,
      });
    }
    // ── RSControl probes ──────────────────────────────────────────────────
    const strip = this._strip();
    if (strip?.has_control_link?.()) {
      const controlDev = strip.linked_control_device?.();
      if (controlDev && this.hass?.entities) {
        // Probe types and their sub-sensors to offer
        // Types come from DEX DeviceSubscriberType / ControlProbeType
        const candidates: Array<{
          type: ProbeTypeId;
          sensor: SubSensor;
          tkMatch: string;
          labelKey: string;
        }> = [
          {
            type: "ph",
            sensor: "primary",
            tkMatch: "ph",
            labelKey: "sensor_ph",
          },
          {
            type: "ph",
            sensor: "temperature",
            tkMatch: "ph",
            labelKey: "sensor_ph_temp",
          },
          {
            type: "orp",
            sensor: "primary",
            tkMatch: "orp",
            labelKey: "sensor_orp",
          },
          {
            type: "ec",
            sensor: "primary",
            tkMatch: "ec",
            labelKey: "sensor_ec",
          },
          {
            type: "ec",
            sensor: "temperature",
            tkMatch: "ec",
            labelKey: "sensor_ec_temp",
          },
          {
            type: "temperature",
            sensor: "primary",
            tkMatch: "temperature",
            labelKey: "sensor_temp",
          },
          {
            type: "ato",
            sensor: "primary",
            tkMatch: "ato",
            labelKey: "sensor_ato",
          },
          {
            type: "leak",
            sensor: "primary",
            tkMatch: "leak",
            labelKey: "sensor_leak",
          },
        ];

        // Build a map of probe type → [entities] for this RSControl device
        const probeEntities = new Map<string, any[]>();
        for (const eid in this.hass.entities) {
          const e = this.hass.entities[eid];
          if (e?.device_id !== controlDev.id) continue;
          const tk: string = e?.translation_key ?? "";
          if (!tk) continue;
          // Match by prefix (e.g. "ph_value" → type "ph")
          for (const c of candidates) {
            if (tk === c.tkMatch || tk.startsWith(c.tkMatch + "_")) {
              if (!probeEntities.has(c.tkMatch))
                probeEntities.set(c.tkMatch, []);
              probeEntities.get(c.tkMatch)!.push(e);
              break;
            }
          }
        }

        const devName =
          controlDev.name_by_user || controlDev.name || "RSControl";

        for (const c of candidates) {
          const ents = probeEntities.get(c.tkMatch);
          if (!ents?.length) continue;

          // For temperature sub-sensor, only add if a dedicated temp entity exists
          if (c.sensor === "temperature" && !probeEntities.has("temperature"))
            continue;

          // Get uid from the first entity's state attributes
          const stateObj = this.hass.states?.[ents[0].entity_id];
          const uid = stateObj?.attributes?.uid ?? ents[0].entity_id;

          // One entry per candidate: every (type, sensor) pair of the table
          // above is unique, so no de-duplication is needed here.
          options.push({
            label: `${devName} — ${i18n._(c.labelKey)}`,
            uid: String(uid),
            type: c.type,
            sensor: c.sensor,
            from_control: true,
          });
        }
      }
    }

    this._probeOptions = options;
    if (this._probeIdx >= options.length) this._probeIdx = 0;
  }

  private _onProbeChange(e: Event): void {
    const idx = Number((e.target as HTMLSelectElement).value);
    if (idx === this._probeIdx) return;
    this._probeIdx = idx;
    const probe = this._probeOptions[idx];
    if (!probe) return;
    const def = PROBE_TYPES[probe.type];
    this._value = def.defaultValue;
    this._hysteresis = def.defaultDelta;
    this._isAbove = true;
    this._turnOn = true;
    this._fallbackOn = false;
  }

  // ── Save ────────────────────────────────────────────────────────────────

  private async _save(): Promise<void> {
    const deviceId = this._configEntry();
    const socketNum = this._socketNum();
    if (!deviceId || !this.hass) return;

    this._saving = true;
    this._saveError = null;

    const name = this._socketName();

    try {
      if (this._mode === "on" || this._mode === "off") {
        // PUT /sockets/config — mode only
        const body: Record<string, unknown> = {
          number: socketNum,
          mode: this._mode,
        };
        if (name) body["name"] = name;
        await this.hass.callService("redsea", "request", {
          device_id: deviceId,
          access_path: "/sockets/config",
          method: "put",
          data: { sockets: [body] },
          refresh: "config",
          wait: 2,
        });
      } else if (this._mode === "schedule") {
        // Step 1 — set mode to schedule
        const body: Record<string, unknown> = {
          number: socketNum,
          mode: "schedule",
        };
        if (name) body["name"] = name;
        await this.hass.callService("redsea", "request", {
          device_id: deviceId,
          access_path: "/sockets/config",
          method: "put",
          data: { sockets: [body] },
          refresh: "config",
          wait: 2,
        });
        // Step 2 — write the schedule
        const intervals = this._intervals
          .filter((iv) => iv.duration > 0)
          .sort((a, b) => a.time - b.time)
          .map((iv) => ({
            time: Math.max(0, Math.min(TOTAL_MINUTES - 1, iv.time)),
            duration: Math.max(1, iv.duration),
          }));
        await this.hass.callService("redsea", "request", {
          device_id: deviceId,
          access_path: `/socket/${socketNum}/config/schedule`,
          method: "put",
          data: { intervals },
          refresh: "config",
          wait: 3,
        });
      } else {
        // Sensor mode: the only one left once on/off/schedule are handled
        const probe = this._probeOptions[this._probeIdx];
        if (!probe) throw new Error("No probe selected");

        // Step 1 — set mode to sensor
        const body: Record<string, unknown> = {
          number: socketNum,
          mode: "sensor",
        };
        if (name) body["name"] = name;
        await this.hass.callService("redsea", "request", {
          device_id: deviceId,
          access_path: "/sockets/config",
          method: "put",
          data: { sockets: [body] },
          refresh: "config",
          wait: 2,
        });

        // Step 2 — write the subscription
        // Local probe → PUT /temperature/subscribe  (DEX: S7.b6)
        // RSControl probe → PUT /subscribe          (DEX: S7.d6)
        const def = PROBE_TYPES[probe.type];
        const subscriber: Record<string, unknown> = {
          number: socketNum,
          default_state: this._fallbackOn,
          app_cache: probe.type,
        };

        if (!probe.from_control) {
          // Local temperature probe: full threshold params
          if (def.hasTurnOn) subscriber["turn_on"] = this._turnOn;
          if (def.hasDirection) subscriber["is_above"] = this._isAbove;
          if (def.hasValue) subscriber["value"] = this._value;
          if (def.hasHysteresis) subscriber["hysteresis"] = this._hysteresis;
          subscriber["sensor"] = probe.sensor;

          await this.hass.callService("redsea", "request", {
            device_id: deviceId,
            access_path: "/temperature/subscribe",
            method: "put",
            data: { sockets: [subscriber] },
            refresh: "data",
            wait: 2,
          });
        } else {
          // RSControl probe: simple binding (threshold params live on hub)
          await this.hass.callService("redsea", "request", {
            device_id: deviceId,
            access_path: "/subscribe",
            method: "put",
            data: { sockets: [subscriber] },
            refresh: "data",
            wait: 2,
          });
        }
      }

      // Close the dialog
      this.dispatchEvent(
        new CustomEvent("quit-dialog", { bubbles: true, composed: true }),
      );
    } catch (err: any) {
      this._saveError = String(err?.message ?? err ?? "Save failed");
    } finally {
      this._saving = false;
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  override render(): TemplateResult {
    return html`
      ${this._renderModeSelector()}
      ${this._mode === "schedule"
        ? html`<div class="sce-divider"></div>
            ${this._renderSchedule()}`
        : nothing}
      ${this._mode === "sensor"
        ? html`<div class="sce-divider"></div>
            ${this._renderSensor()}`
        : nothing}
      ${this._saveError
        ? html`<div class="sce-error" style="margin-top:6px">
            ${this._saveError}
          </div>`
        : nothing}
      <div class="sce-footer">
        <button
          class="sce-save-btn"
          ?disabled="${this._saving}"
          @click="${this._save}"
        >
          ${this._saving ? "…" : i18n._("sched_save")}
        </button>
      </div>
    `;
  }

  private _renderModeSelector(): TemplateResult {
    return html`
      <div class="sce-mode-section">
        <div class="sce-mode-label">${i18n._("sensor_mode_label")}</div>
        <div class="sce-mode-row">
          ${MODE_DEFS.map(
            (m) => html`
              <button
                class="sce-mode-btn ${this._mode === m.id ? "active" : ""}"
                @click="${() => this._onModeClick(m.id)}"
              >
                <ha-icon
                  icon="${m.icon}"
                  style="--mdc-icon-size:18px"
                ></ha-icon>
                ${i18n._(m.labelKey)}
              </button>
            `,
          )}
        </div>
      </div>
    `;
  }

  // ── Schedule render ─────────────────────────────────────────────────────

  private _renderSchedule(): TemplateResult {
    const canAdd = this._intervals.length < MAX_INTERVALS;
    const canDel = this._intervals.length > 0;

    return html`
      <div class="sce-schedule-wrap">
        <div class="sce-timeline" style="height:44px;margin-bottom:8px;">
          <canvas style="width:100%;height:100%;display:block;"></canvas>
        </div>
        <div
          style="display:grid;grid-template-columns:1fr 1fr auto;gap:4px 6px;align-items:center;font-size:0.8em;color:var(--secondary-text-color,#888);padding:0 0 4px;"
        >
          <span></span>
          <span style="text-align:center">${i18n._("sched_from")}</span>
          <span style="text-align:center">${i18n._("sched_to")}</span>
        </div>
        ${this._intervals.length === 0
          ? html`<div
              style="font-size:0.83em;color:var(--secondary-text-color,#888);padding:6px 0 4px;"
            >
              ${i18n._("sched_off")} — 00:00 → 23:59
            </div>`
          : nothing}
        ${this._intervals.map(
          (iv, i) => html`
            <div
              style="display:grid;grid-template-columns:1.2em 1fr 1fr auto;gap:4px 6px;align-items:center;margin-bottom:3px;"
            >
              <span
                style="font-size:0.78em;color:var(--secondary-text-color,#888);text-align:right"
                >${i + 1}</span
              >
              <input
                type="time"
                style="padding:4px;border-radius:4px;border:1px solid var(--divider-color,rgba(0,0,0,0.18));font-size:0.86em;"
                .value="${this._minutesToTime(iv.time)}"
                @change="${(e: Event) => this._onStartChange(i, e)}"
              />
              <input
                type="time"
                style="padding:4px;border-radius:4px;border:1px solid var(--divider-color,rgba(0,0,0,0.18));font-size:0.86em;"
                .value="${this._minutesToTime(
                  Math.min(iv.time + iv.duration, TOTAL_MINUTES - 1),
                )}"
                @change="${(e: Event) => this._onEndChange(i, e)}"
              />
              <button
                ?disabled="${!canDel}"
                style="padding:2px 7px;border-radius:4px;border:1px solid var(--divider-color,rgba(0,0,0,0.18));cursor:pointer;font-size:0.9em;"
                @click="${() => this._removeInterval(i)}"
              >
                &#x2212;
              </button>
            </div>
          `,
        )}
        <button
          ?disabled="${!canAdd}"
          style="margin-top:4px;padding:5px 12px;border-radius:5px;border:1px solid var(--divider-color,rgba(0,0,0,0.18));cursor:pointer;font-size:0.82em;width:100%;"
          @click="${this._addInterval}"
        >
          ${i18n._("sched_add_interval")}
        </button>
      </div>
    `;
  }

  // ── Sensor render ───────────────────────────────────────────────────────

  private _renderSensor(): TemplateResult {
    if (this._probeOptions.length === 0) {
      return html`<div class="sce-error">${i18n._("sensor_no_probe")}</div>`;
    }

    const probe = this._probeOptions[this._probeIdx];
    const def = probe ? PROBE_TYPES[probe.type] : null;

    return html`
      <div class="sce-sensor-container">
        <!-- Probe selector -->
        <div>
          <div class="sce-section-title">${i18n._("sensor_probe")}</div>
          <select
            class="sce-select"
            .value="${String(this._probeIdx)}"
            @change="${this._onProbeChange}"
          >
            ${this._probeOptions.map(
              (p, i) => html`
                <option value="${i}" ?selected="${i === this._probeIdx}">
                  ${p.label}
                </option>
              `,
            )}
          </select>
        </div>

        ${def?.isAto
          ? html`<div class="sce-ato-info">${i18n._("sensor_ato_info")}</div>`
          : def
            ? this._renderSensorParams(def)
            : nothing}
      </div>
    `;
  }

  private _renderSensorParams(def: ProbeTypeDef): TemplateResult {
    return html`
      <div class="sce-params">
        ${def.hasTurnOn
          ? html`
              <div class="sce-row">
                <div class="sce-row-label">
                  ${i18n._("sensor_activate_when")}
                </div>
                <div class="sce-toggle-pair">
                  <button
                    class="sce-toggle-btn ${this._turnOn ? "active-green" : ""}"
                    @click="${() => (this._turnOn = true)}"
                  >
                    ${i18n._("sensor_turn_on")}
                  </button>
                  <button
                    class="sce-toggle-btn ${!this._turnOn ? "active-red" : ""}"
                    @click="${() => (this._turnOn = false)}"
                  >
                    ${i18n._("sensor_turn_off")}
                  </button>
                </div>
              </div>
            `
          : nothing}
        ${def.hasDirection
          ? html`
              <div class="sce-row">
                <div class="sce-row-label">${i18n._("sensor_direction")}</div>
                <div class="sce-toggle-pair">
                  <button
                    class="sce-toggle-btn ${this._isAbove ? "active-blue" : ""}"
                    @click="${() => (this._isAbove = true)}"
                  >
                    ${i18n._("sensor_above")}
                  </button>
                  <button
                    class="sce-toggle-btn ${!this._isAbove
                      ? "active-blue"
                      : ""}"
                    @click="${() => (this._isAbove = false)}"
                  >
                    ${i18n._("sensor_below")}
                  </button>
                </div>
              </div>
            `
          : nothing}
        ${def.hasValue
          ? html`
              <div class="sce-row">
                <div class="sce-row-label">${i18n._("sensor_value")}</div>
                <input
                  class="sce-number-input"
                  type="number"
                  step="0.1"
                  .value="${String(this._value)}"
                  @input="${(e: Event) =>
                    (this._value = Number(
                      (e.target as HTMLInputElement).value,
                    ))}"
                />
                <span class="sce-unit">${def.unit}</span>
              </div>
            `
          : nothing}
        ${def.hasHysteresis
          ? html`
              <div class="sce-row">
                <div class="sce-row-label">
                  ${i18n._("sensor_hysteresis")}
                  <small>${i18n._("sensor_hysteresis_hint")}</small>
                </div>
                <input
                  class="sce-number-input"
                  type="number"
                  step="0.1"
                  min="0"
                  .value="${String(this._hysteresis)}"
                  @input="${(e: Event) =>
                    (this._hysteresis = Number(
                      (e.target as HTMLInputElement).value,
                    ))}"
                />
                <span class="sce-unit">${def.unit}</span>
              </div>
            `
          : nothing}
        ${def.hasFallback
          ? html`
              <div class="sce-row">
                <div class="sce-row-label">${i18n._("sensor_fallback")}</div>
                <div class="sce-toggle-pair">
                  <button
                    class="sce-toggle-btn ${!this._fallbackOn
                      ? "active-red"
                      : ""}"
                    @click="${() => (this._fallbackOn = false)}"
                  >
                    ${i18n._("sensor_fallback_off")}
                  </button>
                  <button
                    class="sce-toggle-btn ${this._fallbackOn
                      ? "active-green"
                      : ""}"
                    @click="${() => (this._fallbackOn = true)}"
                  >
                    ${i18n._("sensor_fallback_on")}
                  </button>
                </div>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
