/**
 * Follow-up of the water parameters: one chart per parameter followed (KH,
 * Ca, Mg, Fe...), drawn over its green (desired), orange (acceptable) and red
 * (danger) zones.
 *
 * A Lovelace card of its own, `custom:reef-parameters-card`. It is followed
 * by chemistry: each chemistry is bound to a source entity (a reeftank
 * chemistry sensor, a ReefDose head, or any probe).
 *
 *   type: custom:reef-parameters-card
 *   title: Water tests          # optional
 *   days: 90                    # window of the charts (default 90)
 *   parameters:                 # default: every chemistry an integration backs
 *     - chemistry: kh           # kh ca mg k sr no3 po4 i fe salinity temperature ph orp
 *       source: sensor.reefer_425_kh
 *     - chemistry: temperature
 *       source: sensor.tank_temperature
 *     - chemistry: fe
 *       source: sensor.my_iron_tests
 *       name: Iron              # optional, the chemistry's name otherwise
 *       ranges: [2, 5, 20, 50]  # optional, see below
 *
 * `ranges` are the four bounds [acceptable low, desired low, desired high,
 * acceptable high]; DEFAULT_RANGES gives them per chemistry, the `ranges`
 * attribute of the source entity wins over both when present. A reeftank
 * chemistry sensor or a ReefDose head keeps its own results (its
 * `measurements` attribute): it is drawn from them and gets a button to add
 * a test; any other entity (a probe) is drawn from the recorder, read-only.
 * The legacy `{ parameter, entity }` shape is still accepted.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { LitElement, css, html, nothing } from "lit";

import i18n from "../translations/myi18n.js";
import { MyElement } from "./element";
import { parse_ranges } from "../utils/levels";
import "./measurement_history";

//----------------------------------------------------------------------------//

/** Zones of the usual reef parameters, in their usual unit. */
export const DEFAULT_RANGES: Record<string, number[]> = {
  // dKH
  kh: [6.5, 7.5, 9.5, 12],
  // ppm
  ca: [350, 400, 450, 500],
  mg: [1150, 1250, 1400, 1550],
  k: [340, 380, 420, 460],
  sr: [4, 8, 10, 14],
  no3: [0.5, 2, 10, 25],
  po4: [0.01, 0.03, 0.1, 0.2],
  // ppb
  i: [40, 50, 80, 120],
  fe: [2, 5, 20, 50],
  // ppt / °C / pH / mV
  salinity: [33, 34, 35.5, 36.5],
  temperature: [23, 24, 27, 28],
  ph: [7.8, 8.0, 8.4, 8.6],
  orp: [250, 300, 450, 500],
};

/**
 * Catalogue of the chemistries the card can follow, mirroring the
 * reeftech-catalog `parameters` section: a unit and, when Home Assistant has
 * one, a sensor `device_class` to match a compatible probe by. The order is
 * the one the editor lists them in.
 */
export interface Chemistry {
  unit: string;
  device_class?: string;
}

export const CHEMISTRIES: Record<string, Chemistry> = {
  temperature: { unit: "°C", device_class: "temperature" },
  ph: { unit: "pH", device_class: "ph" },
  orp: { unit: "mV", device_class: "voltage" },
  salinity: { unit: "ppt" },
  kh: { unit: "dKH" },
  ca: { unit: "ppm" },
  mg: { unit: "ppm" },
  k: { unit: "ppm" },
  sr: { unit: "ppm" },
  i: { unit: "ppb" },
  fe: { unit: "ppb" },
  no3: { unit: "ppm" },
  po4: { unit: "ppm" },
};

/**
 * One chemistry followed and the entity its value is read from (its
 * `source`). A reeftank chemistry sensor or a ReefDose head keeps its own
 * results and is editable; any other sensor (a probe) is read-only.
 */
export interface FollowedParameter {
  chemistry: string;
  source: string;
  name?: string;
  ranges?: number[];
}

export interface ParametersConfig {
  title?: string;
  days?: number;
  parameters?: Array<FollowedParameter | LegacyParameter>;
}

/** The entity-keyed shape earlier versions configured; still accepted. */
interface LegacyParameter {
  parameter?: string;
  entity?: string;
  name?: string;
  ranges?: number[];
}

/** Sensor of a ReefDose head listing its test results. */
const LAST_MEASUREMENT = "regulation_last_measurement";

/** The chemistry a ReefDose head regulates, from its last results. */
function head_chemistry(hass: any, entity_id: string): string | undefined {
  const measurements = hass?.states?.[entity_id]?.attributes?.measurements;
  return Array.isArray(measurements)
    ? measurements[measurements.length - 1]?.parameter
    : undefined;
}

/**
 * The entities that may be bound to a chemistry, best first.
 *
 * The aquarium's own reeftank sensor of the chemistry (the canonical,
 * editable, "manual" source) and a ReefDose head regulating it come first;
 * then any probe matching the chemistry's `device_class` (temperature, pH,
 * ORP) or, failing that, its unit (a KH/Ca/... monitor). The editor offers
 * this short list, and still lets any entity be picked by hand.
 */
export function compatible_entities(hass: any, chemistry: string): string[] {
  const meta = CHEMISTRIES[chemistry];
  const exact: string[] = [];
  const probes: string[] = [];
  for (const [entity_id, entry] of Object.entries<any>(hass?.entities ?? {})) {
    const attributes = hass?.states?.[entity_id]?.attributes;
    if (!attributes) continue;
    // A reeftank chemistry sensor or a ReefDose head is an exact source of
    // one chemistry only; it is never offered as a generic probe of another.
    const is_reeftank =
      entry?.platform === "reeftank" && attributes.reef_parameter;
    const is_head =
      entry?.platform === "redsea" &&
      entry?.translation_key === LAST_MEASUREMENT;
    if (is_reeftank || is_head) {
      const own = is_reeftank
        ? attributes.reef_parameter
        : head_chemistry(hass, entity_id);
      if (own === chemistry) exact.push(entity_id);
      continue;
    }
    if (meta?.device_class && attributes.device_class === meta.device_class) {
      probes.push(entity_id);
    } else if (meta?.unit && attributes.unit_of_measurement === meta.unit) {
      probes.push(entity_id);
    }
  }
  return [...exact.sort(), ...probes.sort()];
}

/**
 * The chemistries to follow by default: those an integration already backs,
 * each bound to its canonical source. Reeftank is the canonical home of a
 * water test, so its sensors are taken first and the view works without the
 * redsea integration; a regulated ReefDose head is taken for a chemistry
 * reeftank does not cover, so a chemistry never shows up twice.
 */
export function auto_follow(hass: any): FollowedParameter[] {
  const out: FollowedParameter[] = [];
  const seen = new Set<string>();
  for (const [entity_id, entry] of Object.entries<any>(hass?.entities ?? {})) {
    if (entry?.platform !== "reeftank") continue;
    const chemistry = hass?.states?.[entity_id]?.attributes?.reef_parameter;
    if (!chemistry || seen.has(chemistry)) continue;
    seen.add(chemistry);
    out.push({ chemistry, source: entity_id });
  }
  for (const [entity_id, entry] of Object.entries<any>(hass?.entities ?? {})) {
    if (entry?.platform !== "redsea") continue;
    if (entry?.translation_key !== LAST_MEASUREMENT) continue;
    const chemistry = head_chemistry(hass, entity_id);
    if (!chemistry || seen.has(chemistry)) continue;
    seen.add(chemistry);
    out.push({ chemistry, source: entity_id });
  }
  return out.sort((a, b) => a.chemistry.localeCompare(b.chemistry));
}

/** A legacy `{ parameter, entity }` entry read as `{ chemistry, source }`. */
export function normalise(entry: any): FollowedParameter | null {
  if (!entry) return null;
  const chemistry = entry.chemistry ?? entry.parameter;
  const source = entry.source ?? entry.entity;
  if (typeof chemistry !== "string" || typeof source !== "string") return null;
  const out: FollowedParameter = { chemistry, source };
  if (entry.name) out.name = entry.name;
  if (entry.ranges) out.ranges = entry.ranges;
  return out;
}

/**
 * Zones of a chemistry: its source entity's own `ranges`, else the configured
 * ones, else the usual ones for that chemistry.
 */
export function parameter_ranges(
  hass: any,
  followed: FollowedParameter,
): number[] | null {
  return (
    parse_ranges(hass?.states?.[followed.source]?.attributes?.ranges) ??
    parse_ranges(followed.ranges) ??
    DEFAULT_RANGES[followed.chemistry] ??
    null
  );
}

/**
 * The scale the gauge spans: the acceptable band padded by a quarter on each
 * side, so the danger zones stay visible. The scale is not configurable; it
 * only follows the bounds. A value past the ends widens it to stay in view.
 */
export function gauge_scale(
  ranges: number[],
  value?: number,
): [number, number] {
  const [lo, , , hi] = ranges as [number, number, number, number];
  const span = hi - lo || Math.abs(hi) || 1;
  let min = lo - span * 0.25;
  let max = hi + span * 0.25;
  if (Number.isFinite(value)) {
    min = Math.min(min, value as number);
    max = Math.max(max, value as number);
  }
  return [min, max];
}

/** Position of a value on a scale, clamped to 0..100 %. */
export function scale_pct(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/**
 * Which way a series of values is heading: the recent third compared with the
 * oldest third, flat inside a relative dead-band. Null with too few points.
 */
export function trend(
  values: number[],
  deadband = 0.04,
): "up" | "down" | "flat" | null {
  const v = values.filter((x) => Number.isFinite(x));
  if (v.length < 2) return null;
  const n = Math.max(1, Math.floor(v.length / 3));
  const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
  const first = avg(v.slice(0, n));
  const last = avg(v.slice(-n));
  const rel = (last - first) / (Math.abs(first) || 1);
  if (rel > deadband) return "up";
  if (rel < -deadband) return "down";
  return "flat";
}

/** The bare device the card elements expect, for an entity id. */
function host(entity_id: string): any {
  return {
    entities: { [entity_id]: { entity_id } },
    parent_entities: {},
    config: { color: "255,255,255", alpha: 0.7 },
    masterOn: true,
    is_on: () => true,
  };
}

export class ReefParametersCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      --rp-green: var(--success-color, #2fa36b);
      --rp-amber: var(--warning-color, #e39200);
      --rp-red: var(--error-color, #db4a4a);
      --rp-green-band: color-mix(in srgb, var(--rp-green) 22%, transparent);
      --rp-amber-band: color-mix(in srgb, var(--rp-amber) 24%, transparent);
      --rp-red-band: color-mix(in srgb, var(--rp-red) 20%, transparent);
      --rp-hair: var(--divider-color, rgba(130, 130, 130, 0.22));
    }
    ha-card {
      padding: 10px 12px 12px;
    }
    h1 {
      font-size: 17px;
      font-weight: 600;
      margin: 6px 4px 10px;
    }
    .grid {
      display: grid;
      /* minmax(0, 1fr): let the columns shrink to the card, so the right
         column never spills out over a neighbouring card. */
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 10px;
    }
    @media (max-width: 500px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
    .parameter {
      position: relative;
      border: 1px solid var(--rp-hair);
      border-radius: 14px;
      padding: 11px 12px 12px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      /* Stay inside the grid cell and clip the hidden data feeder. */
      min-width: 0;
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .name {
      font-weight: 600;
      font-size: 13.5px;
      flex: 1;
    }
    .src {
      font-size: 10.5px;
      color: var(--secondary-text-color);
      background: color-mix(
        in srgb,
        var(--secondary-text-color) 13%,
        transparent
      );
      padding: 2px 7px;
      border-radius: 999px;
    }
    .value {
      display: flex;
      align-items: baseline;
      gap: 4px;
      font-variant-numeric: tabular-nums;
    }
    .value b {
      font-size: 24px;
      font-weight: 680;
      letter-spacing: -0.02em;
    }
    .value .unit {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .value.danger b {
      color: var(--rp-red);
    }
    .value.acceptable b {
      color: var(--rp-amber);
    }
    .value.desired b {
      color: var(--rp-green);
    }
    .gauge {
      position: relative;
      height: 11px;
      border-radius: 999px;
      overflow: hidden;
      display: flex;
    }
    .gauge i {
      height: 100%;
    }
    .gauge i.red {
      background: var(--rp-red-band);
    }
    .gauge i.amber {
      background: var(--rp-amber-band);
    }
    .gauge i.green {
      background: var(--rp-green-band);
    }
    .marker {
      position: absolute;
      top: -3px;
      width: 4px;
      height: 17px;
      border-radius: 3px;
      background: var(--primary-text-color);
      transform: translateX(-50%);
      box-shadow: 0 0 0 2px var(--card-background-color, #fff);
    }
    .scale {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
      margin-top: -2px;
    }
    .foot {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    /* Hidden data feeder: the history chart fetches the series, the clean
       sparkline below is drawn from its points. */
    .feed {
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .spark-wrap {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: stretch;
      gap: 4px;
    }
    /* Min/max of the plotted series, so the amplitude of the trend is read. */
    .spark-scale {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 9px;
      line-height: 1;
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
    }
    .spark {
      flex: 1;
      height: 30px;
      min-width: 0;
      cursor: pointer;
      display: block;
    }
    .spark.empty {
      height: 30px;
    }
    .trend {
      font-size: 15px;
      line-height: 1;
      width: 18px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .trend.desired {
      color: var(--rp-green);
    }
    .trend.acceptable {
      color: var(--rp-amber);
    }
    .trend.danger {
      color: var(--rp-red);
    }
    button {
      border: 1px solid
        color-mix(in srgb, var(--primary-color) 30%, var(--rp-hair));
      background: none;
      cursor: pointer;
      color: var(--primary-color);
      border-radius: 8px;
      padding: 3px 9px;
      font-size: 12px;
      font-weight: 600;
    }
    dialog {
      border: none;
      border-radius: 12px;
      padding: 0;
      width: min(480px, 92vw);
      background: var(--card-background-color, white);
      color: var(--primary-text-color);
    }
    dialog::backdrop {
      background: rgba(0, 0, 0, 0.4);
    }
    dialog header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      font-weight: 600;
    }
    dialog reef-measurement-history {
      padding: 0 12px 12px 12px;
    }
    .empty {
      padding: 12px 4px;
      color: var(--secondary-text-color);
    }
  `;

  static override get properties() {
    return { _editing: { state: true } };
  }

  /** Entity whose results are being edited, "" when none. */
  _editing: string = "";
  private _config: ParametersConfig = {};
  private _hass: any = null;
  private _charts = new Map<string, any>();

  setConfig(config: ParametersConfig): void {
    if (config?.parameters !== undefined && !Array.isArray(config.parameters))
      throw new Error("parameters must be a list");
    this._config = { ...(config ?? {}) };
    this._charts.clear();
    this.requestUpdate();
  }

  set hass(hass: any) {
    this._hass = hass;
    for (const chart of this._charts.values()) chart.hass = hass;
    this.requestUpdate();
  }

  get hass(): any {
    return this._hass;
  }

  getCardSize(): number {
    return 1 + 2 * Math.ceil(this.parameters().length / 2);
  }

  static getStubConfig(hass: any): ParametersConfig {
    return { parameters: auto_follow(hass) };
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("reef-parameters-card-editor");
  }

  /** Chemistries followed: the configured ones, else the ones auto-found. */
  parameters(): FollowedParameter[] {
    const configured = this._config.parameters?.map(normalise);
    return (configured ?? auto_follow(this._hass)).filter(
      (p): p is FollowedParameter => p !== null && p !== undefined,
    );
  }

  /** Whether the entity holds the results itself (reeftank sensor or head). */
  keeps_results(entity_id: string): boolean {
    return Array.isArray(
      this._hass?.states?.[entity_id]?.attributes?.measurements,
    );
  }

  private _chart_key(
    followed: FollowedParameter,
    ranges: number[] | null,
  ): string {
    return JSON.stringify([followed, ranges]);
  }

  /** The compact sparkline of a parameter, built once, coloured by zone. */
  chart(followed: FollowedParameter, ranges: number[] | null): any {
    const key = this._chart_key(followed, ranges);
    let chart = this._charts.get(key);
    if (!chart) {
      const days =
        Number(this._config.days) > 0 ? Number(this._config.days) : 90;
      const value = Number(this._hass?.states?.[followed.source]?.state);
      const conf: Record<string, unknown> = {
        type: "history-chart",
        entities: [
          { entity: followed.source, color: this._zone_colour(value, ranges) },
        ],
        hours: days * 24,
        baseline: "min",
        hide_empty: false,
        css: { display: "block", width: "100%", height: "100%" },
      };
      if (this.keeps_results(followed.source))
        conf.points_attribute = "measurements";
      chart = MyElement.create_element(
        this._hass,
        conf as any,
        host(followed.source),
      );
      this._charts.set(key, chart);
    }
    return chart;
  }

  /** Zone a value falls in, for its colour. */
  static zone(value: number, ranges: number[] | null): string {
    if (!ranges || !Number.isFinite(value)) return "";
    const [a_low, d_low, d_high, a_high] = ranges as [
      number,
      number,
      number,
      number,
    ];
    if (value < a_low || value > a_high) return "danger";
    if (value < d_low || value > d_high) return "acceptable";
    return "desired";
  }

  private _name(followed: FollowedParameter): string {
    if (followed.name) return followed.name;
    const key = "parameter_" + followed.chemistry;
    const label = i18n._(key);
    if (label && label !== key && !label.includes(key)) return label;
    return followed.chemistry.toUpperCase();
  }

  /** A short label of where the value comes from (the integration). */
  private _source_label(followed: FollowedParameter): string {
    return String(this._hass?.entities?.[followed.source]?.platform ?? "");
  }

  /** The CSS colour of a value's zone (desired / acceptable / danger). */
  private _zone_colour(value: number, ranges: number[] | null): string {
    return (
      {
        desired: "var(--success-color,#2fa36b)",
        acceptable: "var(--warning-color,#e39200)",
        danger: "var(--error-color,#db4a4a)",
      }[ReefParametersCard.zone(value, ranges)] ??
      "var(--secondary-text-color,#8a93a5)"
    );
  }

  /** Open Home Assistant's more-info dialog for the source entity. */
  private _more_info(entity_id: string): void {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: entity_id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** A clean sparkline of the loaded series, coloured by zone, clickable. */
  private _sparkline(followed: FollowedParameter, ranges: number[] | null) {
    const open = () => this._more_info(followed.source);
    const chart = this._charts.get(this._chart_key(followed, ranges));
    const points = chart?.series?.[0]?.points;
    const vs = Array.isArray(points)
      ? points.map((p: any) => p.v).filter((v: any) => Number.isFinite(v))
      : [];
    if (vs.length < 2) {
      return html`<svg class="spark empty" @click=${open}></svg>`;
    }
    const value = Number(this._hass?.states?.[followed.source]?.state);
    const lo = Math.min(...vs);
    const hi = Math.max(...vs);
    const span = hi - lo || 1;
    const w = 100;
    const h = 30;
    const d = vs
      .map((v: number, i: number) => {
        const x = (i / (vs.length - 1)) * w;
        const y = h - 3 - ((v - lo) / span) * (h - 6);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return html`<div class="spark-wrap">
      <svg
        class="spark"
        viewBox="0 0 ${w} ${h}"
        preserveAspectRatio="none"
        @click=${open}
      >
        <polyline
          points=${d}
          fill="none"
          stroke=${this._zone_colour(value, ranges)}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <div class="spark-scale">
        <span>${this._round(hi)}</span>
        <span>${this._round(lo)}</span>
      </div>
    </div>`;
  }

  /** Rounds a scale label to a sensible precision for its magnitude. */
  private _round(x: number): number {
    const a = Math.abs(x);
    const digits = a < 1 ? 2 : a < 100 ? 1 : 0;
    return Number(x.toFixed(digits));
  }

  /** The zone gauge: proportional bands with a marker at the value. */
  private _gauge(value: number, ranges: number[]) {
    const [a_low, d_low, d_high, a_high] = ranges as [
      number,
      number,
      number,
      number,
    ];
    const [min, max] = gauge_scale(ranges, value);
    const seg = (lo: number, hi: number) =>
      scale_pct(hi, min, max) - scale_pct(lo, min, max);
    const bands: [string, number][] = [
      ["red", seg(min, a_low)],
      ["amber", seg(a_low, d_low)],
      ["green", seg(d_low, d_high)],
      ["amber", seg(d_high, a_high)],
      ["red", seg(a_high, max)],
    ];
    const target = this._round((d_low + d_high) / 2);
    return html`<div class="gauge">
        ${bands.map(([c, w]) => html`<i class="${c}" style="width:${w}%"></i>`)}
        ${
          Number.isFinite(value)
            ? html`<div
                class="marker"
                style="left:${scale_pct(value, min, max)}%"
              ></div>`
            : nothing
        }
      </div>
      <div class="scale">
        <span>${this._round(min)}</span>
        <span>${i18n._("parameters_target")} ${target}</span>
        <span>${this._round(max)}</span>
      </div>`;
  }

  /** The trend arrow, from the series the sparkline loaded, zone-coloured. */
  private _trend(followed: FollowedParameter, ranges: number[] | null) {
    const chart = this._charts.get(this._chart_key(followed, ranges));
    const points = chart?.series?.[0]?.points;
    if (!Array.isArray(points)) return nothing;
    const dir = trend(points.map((p: any) => p.v));
    if (!dir) return nothing;
    const symbol = { up: "↑", down: "↓", flat: "≈" }[dir];
    const value = Number(this._hass?.states?.[followed.source]?.state);
    const zone = ReefParametersCard.zone(value, ranges);
    return html`<span class="trend ${zone}">${symbol}</span>`;
  }

  private _render_parameter(followed: FollowedParameter) {
    const state = this._hass?.states?.[followed.source];
    const ranges = parameter_ranges(this._hass, followed);
    const value = Number(state?.state);
    const unit = state?.attributes?.unit_of_measurement ?? "";
    const editable = this.keeps_results(followed.source);
    const source = this._source_label(followed);
    return html`<div class="parameter">
      <div class="head">
        <span class="name">${this._name(followed)}</span>
        ${source ? html`<span class="src">${source}</span>` : nothing}
      </div>
      <div class="value ${ReefParametersCard.zone(value, ranges)}">
        ${
          Number.isFinite(value)
            ? html`<b>${value}</b><span class="unit">${unit}</span>`
            : html`<b>–</b>`
        }
      </div>
      ${ranges ? this._gauge(value, ranges) : nothing}
      <div class="foot">
        ${state ? html`<div class="feed">${this.chart(followed, ranges)}</div>` : nothing}
        ${state ? this._sparkline(followed, ranges) : nothing}
        ${state ? this._trend(followed, ranges) : nothing}
        ${
          editable
            ? html`<button
                title=${i18n._("measurement_history")}
                @click=${() => this.edit(followed.source)}
              >
                ${i18n._("measurement_history_add")}
              </button>`
            : nothing
        }
      </div>
    </div>`;
  }

  /** Open the results of an entity, to add, correct or delete one. */
  edit(entity_id: string): void {
    this._editing = entity_id;
    void this.updateComplete.then(() => {
      const dialog = this.shadowRoot?.querySelector("dialog") as any;
      if (dialog && !dialog.open) {
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      }
    });
  }

  close(): void {
    const dialog = this.shadowRoot?.querySelector("dialog") as any;
    if (dialog?.open && typeof dialog.close === "function") dialog.close();
    else dialog?.removeAttribute?.("open");
    this._editing = "";
  }

  override render() {
    const parameters = this.parameters();
    return html`<ha-card>
      <h1>${this._config.title || i18n._("parameters_title")}</h1>
      ${
        parameters.length
          ? html`<div class="grid">
              ${parameters.map((p) => this._render_parameter(p))}
            </div>`
          : html`<div class="empty">${i18n._("parameters_none")}</div>`
      }
      ${
        this._editing
          ? html`<dialog @close=${() => (this._editing = "")}>
              <header>
                ${i18n._("measurement_history")}
                <button @click=${() => this.close()}>✕</button>
              </header>
              <reef-measurement-history
                .entity_id=${this._editing}
                .hass=${this._hass}
              ></reef-measurement-history>
            </dialog>`
          : nothing
      }
    </ha-card>`;
  }
}

if (!customElements.get("reef-parameters-card"))
  customElements.define("reef-parameters-card", ReefParametersCard);
