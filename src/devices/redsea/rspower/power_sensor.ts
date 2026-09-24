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
 *
 * A socket driven by an RSControl probe is configured on both devices, in
 * the order the Red Sea app uses (captured on the wire):
 *   1. RSPower   PUT /subscribe             { sockets: [{number,
 *                                             default_state, app_cache}] }
 *   2. RSPower   PUT /sockets/config        { sockets: [{number, mode}] }
 *   3. RSControl PUT /socket/<n>/subscribe  { uid, type, sensor, is_above,
 *                                             value, hysteresis, trigger_op }
 * The RSPower only learns which probe type to follow; the probe itself
 * (uid, as two probes may share a type) and the thresholds live on the hub,
 * under the RSPower socket number. A water-level (ATO) rule carries no
 * threshold but repeats the fallback: { uid, type, sensor, default_state }.
 *
 * Reading back, the integration merges both sides into the `sensor_config`
 * attribute of the socket's `socket_mode` entity, tagged by `sensor_source`:
 *   local   { sensor: { app_cache, default_state }, value, is_above,
 *             turn_on, … }
 *   control the hub's rule for this socket, from its GET /subscription-info:
 *           { number, type, uid, sensor, is_above, value, hysteresis,
 *             trigger_op, last_sock_op }
 *
 * The probes of a paired RSControl come from the integration's
 * `redsea.get_control_probes` service (called with `return_response`), which
 * reports every probe the hub knows, whatever entities it exposes.
 *
 * A socket driven by a schedule or a probe can be forced on/off by hand: its
 * mode then reads on/off while `socket_prev_mode` keeps the automatic one.
 * The editor opens on that automatic mode, says it is suspended, and offers
 * to resume it without rewriting its configuration.
 */

import { html, LitElement, TemplateResult, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import styles from "./power_sensor.styles";
import i18n from "../../../translations/myi18n";
import { socketSensorType } from "./power_socket";

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

/**
 * RSControl probe types offered to a socket, in display order, with the
 * label used when the hub reports no name. A probe that also reports a
 * `temp_value` (pH, EC, ATO…) is offered a second time for its temperature
 * reading (sub-sensor "temperature").
 */
const CONTROL_PROBE_TYPES: Array<{ type: ProbeTypeId; labelKey: string }> = [
  { type: "ph", labelKey: "sensor_ph" },
  { type: "orp", labelKey: "sensor_orp" },
  { type: "ec", labelKey: "sensor_ec" },
  { type: "temperature", labelKey: "sensor_temp" },
  { type: "ato", labelKey: "sensor_ato" },
  { type: "leak", labelKey: "sensor_leak" },
];

/**
 * Parameters of a probe: the temperature reading of any probe behaves like a
 * temperature probe, whatever the probe type.
 */
function probeDef(probe: ProbeOption): ProbeTypeDef {
  return probe.sensor === "temperature"
    ? PROBE_TYPES.temperature
    : PROBE_TYPES[probe.type];
}

/**
 * Thresholds come back from the hub as float32 (8.2 → 8.199999809…) and the
 * app sends float64 noise (0.4999999999999991): keep two decimals, the
 * finest step any probe type uses.
 */
function round2(v: unknown): number {
  return Math.round(Number(v) * 100) / 100;
}

/** Automatic modes a manual on/off can suspend. */
type AutoMode = "schedule" | "sensor";

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
  /**
   * Automatic mode suspended by a manual on/off, with the forced state;
   * null when the socket runs its mode normally.
   */
  @state() private _override: { mode: AutoMode; state: "on" | "off" } | null =
    null;

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
  @state() private _probesLoading = false;

  /** Probes reported by the paired RSControl; null until fetched. */
  private _controlProbes: any[] | null = null;
  /** Hub the probes above were fetched for, so they are fetched once. */
  private _controlProbesHwid: string | null = null;
  /** Set once the user picks a probe: a late fetch must not override it. */
  private _probeTouched = false;

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
      if (this._mode === "sensor") {
        this._loadSensorConfig();
        void this._fetchControlProbes();
      }
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

  /** Config entry of the paired RSControl, target of its requests. */
  private _controlConfigEntry(): string | null {
    return (
      this._strip()?.linked_control_device?.()?.primary_config_entry ?? null
    );
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
    this._override = null;
    if (m === "on" || m === "off") {
      // Forced by hand out of an automatic mode: open on that mode
      const prev = this._entityState("socket_prev_mode");
      if (prev === "schedule" || prev === "sensor") {
        this._override = { mode: prev, state: m };
        return prev;
      }
      return m;
    }
    if (m === "schedule" || m === "sensor") return m;
    return "on";
  }

  private _onModeClick(mode: SocketMode): void {
    if (mode === this._mode) return;
    this._mode = mode;
    this._saveError = null;
    if (mode === "schedule" && !this._scheduleLoaded) this._loadSchedule();
    if (mode === "sensor") {
      this._buildProbeList();
      void this._fetchControlProbes();
    }
  }

  /**
   * Resume the automatic mode a manual on/off suspended.
   *
   * Only the mode is written back: the schedule or the probe subscription
   * are still stored on the device, so they are left untouched.
   */
  private async _resume(): Promise<void> {
    const deviceId = this._configEntry();
    if (!deviceId || !this.hass || !this._override) return;
    this._saving = true;
    this._saveError = null;
    try {
      const body: Record<string, unknown> = {
        number: this._socketNum(),
        mode: this._override.mode,
      };
      const name = this._socketName();
      if (name) body["name"] = name;
      await this.hass.callService("redsea", "request", {
        device_id: deviceId,
        access_path: "/sockets/config",
        method: "put",
        data: { sockets: [body] },
        refresh: "config",
        wait: 2,
      });
      this.dispatchEvent(
        new CustomEvent("quit-dialog", { bubbles: true, composed: true }),
      );
    } catch (err: any) {
      this._saveError = String(err?.message ?? err ?? "Save failed");
    } finally {
      this._saving = false;
    }
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
    // Both shapes share is_above / value / hysteresis; the action is
    // `turn_on` locally and `trigger_op` on the hub (see the file header).
    if (cfg.is_above !== undefined) this._isAbove = Boolean(cfg.is_above);
    if (cfg.value !== undefined) this._value = round2(cfg.value);
    if (cfg.hysteresis !== undefined) this._hysteresis = round2(cfg.hysteresis);
    const action = cfg.trigger_op ?? cfg.turn_on;
    if (action !== undefined) this._turnOn = Boolean(action);
    const inner = cfg.sensor;
    if (inner?.default_state !== undefined)
      this._fallbackOn = Boolean(inner.default_state);
    this._selectConfiguredProbe();
  }

  /**
   * Select the probe the socket currently follows: the exact hub probe (uid
   * and sub-sensor) for a control rule, else the first probe of its type.
   */
  private _selectConfiguredProbe(): void {
    const cfg = this._entityAttr("socket_mode", "sensor_config");
    const type = socketSensorType(cfg);
    if (!type) return;
    let idx = -1;
    if (this._entityAttr("socket_mode", "sensor_source") === "control") {
      const sensor = cfg.sensor ?? "primary";
      idx = this._probeOptions.findIndex(
        (p) =>
          p.from_control &&
          p.type === type &&
          p.uid === cfg.uid &&
          p.sensor === sensor,
      );
    }
    if (idx < 0) idx = this._probeOptions.findIndex((p) => p.type === type);
    if (idx >= 0) this._probeIdx = idx;
  }

  /**
   * Call a `redsea` service addressed to the paired hub and return its
   * response. A failed call is reported in the console and read as no
   * answer, so a missing service never blocks the editor.
   */
  private async _callHub(service: string, hwid: string): Promise<any> {
    try {
      const answer = await this.hass.callWS({
        type: "call_service",
        domain: "redsea",
        service,
        service_data: { hwid },
        return_response: true,
      });
      return answer?.response ?? null;
    } catch (err) {
      console.warn(`RSPower: redsea.${service} failed`, err);
      return null;
    }
  }

  /**
   * Fetch the probes of the paired RSControl, once per hub, from
   * `redsea.get_control_probes`: it covers every probe the hub reports,
   * including those without a matching entity. A failed call leaves the hub
   * probes out rather than blocking the editor.
   */
  private async _fetchControlProbes(): Promise<void> {
    const strip = this._strip();
    if (!strip?.has_control_link?.()) return;
    const hwid: string | null = strip.linked_control_hwid?.() ?? null;
    if (!hwid || hwid === this._controlProbesHwid) return;
    if (typeof this.hass?.callWS !== "function") return;

    this._controlProbesHwid = hwid;
    this._probesLoading = true;
    const answer = await this._callHub("get_control_probes", hwid);
    this._controlProbes = Array.isArray(answer?.probes) ? answer.probes : [];
    this._probesLoading = false;

    this._buildProbeList();
    if (!this._probeTouched) this._selectConfiguredProbe();
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
    if (strip?.has_control_link?.() && this._controlProbes) {
      const hub = strip.linked_control_name?.() || "RSControl";
      const control: ProbeOption[] = [];
      for (const t of CONTROL_PROBE_TYPES) {
        for (const p of this._controlProbes) {
          if (p?.type !== t.type) continue;
          const name = p.name || i18n._(t.labelKey);
          const state =
            p.status === "disconnected"
              ? ` (${i18n._("sensor_probe_disconnected")})`
              : "";
          const uid = String(p.uid ?? "");
          control.push({
            label: `${hub} — ${name}${state}`,
            uid,
            type: t.type,
            sensor: "primary",
            from_control: true,
          });
          if (
            t.type !== "temperature" &&
            p.temp_value !== undefined &&
            p.temp_value !== null
          )
            control.push({
              label: `${hub} — ${name} · ${i18n._("sensor_temp")}${state}`,
              uid,
              type: t.type,
              sensor: "temperature",
              from_control: true,
            });
        }
      }
      // Two probes of the same type and name (e.g. two ATO sensors) would
      // read the same: tell them apart by their hardware uid.
      const seen = new Map<string, number>();
      for (const o of control) seen.set(o.label, (seen.get(o.label) ?? 0) + 1);
      for (const o of control) {
        if (seen.get(o.label)! > 1 && o.uid) o.label += ` [${o.uid}]`;
      }
      options.push(...control);
    }

    this._probeOptions = options;
    if (this._probeIdx >= options.length) this._probeIdx = 0;
  }

  private _onProbeChange(e: Event): void {
    const idx = Number((e.target as HTMLSelectElement).value);
    if (idx === this._probeIdx) return;
    this._probeIdx = idx;
    this._probeTouched = true;
    const probe = this._probeOptions[idx];
    if (!probe) return;
    const def = probeDef(probe);
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
        const def = probeDef(probe);

        const modeBody: Record<string, unknown> = {
          number: socketNum,
          mode: "sensor",
        };
        if (name) modeBody["name"] = name;
        const setMode = () =>
          this.hass.callService("redsea", "request", {
            device_id: deviceId,
            access_path: "/sockets/config",
            method: "put",
            data: { sockets: [modeBody] },
            refresh: "config",
            wait: 2,
          });

        if (!probe.from_control) {
          // Local temperature probe (DEX: S7.b6): the RSPower holds
          // everything, thresholds included.
          await setMode();
          const subscriber: Record<string, unknown> = {
            number: socketNum,
            default_state: this._fallbackOn,
            app_cache: probe.type,
          };
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
          // RSControl probe: split between the strip and the hub, see the
          // file header. Checked first so nothing is half written.
          const controlId = this._controlConfigEntry();
          if (!controlId) throw new Error("RSControl not found");

          // 1 — RSPower follows this probe type (DEX: S7.d6)
          await this.hass.callService("redsea", "request", {
            device_id: deviceId,
            access_path: "/subscribe",
            method: "put",
            data: {
              sockets: [
                {
                  number: socketNum,
                  default_state: this._fallbackOn,
                  app_cache: probe.type,
                },
              ],
            },
            refresh: "data",
            wait: 2,
          });

          // 2 — socket switched to sensor mode
          await setMode();

          // 3 — the hub watches this probe for this socket
          const rule: Record<string, unknown> = {
            uid: probe.uid,
            type: probe.type,
            sensor: probe.sensor,
          };
          if (def.hasDirection) rule["is_above"] = this._isAbove;
          if (def.hasValue) rule["value"] = this._value;
          if (def.hasHysteresis) rule["hysteresis"] = this._hysteresis;
          if (def.hasTurnOn) rule["trigger_op"] = this._turnOn;
          // A water-level rule repeats the fallback state on the hub
          if (def.isAto) rule["default_state"] = this._fallbackOn;
          await this.hass.callService("redsea", "request", {
            device_id: controlId,
            access_path: `/socket/${socketNum}/subscribe`,
            method: "put",
            data: rule,
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
      ${this._renderModeSelector()} ${this._renderOverride()}
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
                ${this._override?.mode === m.id
                  ? html`<ha-icon
                      class="sce-mode-paused"
                      icon="mdi:hand-back-left-outline"
                    ></ha-icon>`
                  : nothing}
              </button>
            `,
          )}
        </div>
      </div>
    `;
  }

  /**
   * Notice shown while the selected mode is the automatic one a manual
   * on/off suspended, with a button to resume it as configured.
   */
  private _renderOverride(): TemplateResult | typeof nothing {
    const o = this._override;
    if (!o || this._mode !== o.mode) return nothing;
    const mode = i18n._(MODE_DEFS.find((m) => m.id === o.mode)!.labelKey);
    return html`
      <div class="sce-override">
        <div>
          ${i18n._("sensor_override_notice", {
            mode,
            state: i18n._(o.state === "on" ? "sched_on" : "sched_off"),
          })}
        </div>
        <button
          class="sce-resume-btn"
          ?disabled="${this._saving}"
          @click="${this._resume}"
        >
          <ha-icon icon="mdi:play-circle-outline"></ha-icon>
          ${i18n._("sensor_override_resume", { mode })}
        </button>
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
      return this._probesLoading
        ? html`<div class="sce-ato-info">
            ${i18n._("sensor_probes_loading")}
          </div>`
        : html`<div class="sce-error">${i18n._("sensor_no_probe")}</div>`;
    }

    const probe = this._probeOptions[this._probeIdx];
    const def = probe ? probeDef(probe) : null;

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
