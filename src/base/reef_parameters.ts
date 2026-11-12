/**
 * Follow-up of the water parameters: one chart per parameter followed (KH,
 * Ca, Mg, Fe...), drawn over its green (desired), orange (acceptable) and red
 * (danger) zones.
 *
 * A Lovelace card of its own, `custom:reef-parameters-card`:
 *
 *   type: custom:reef-parameters-card
 *   title: Water tests          # optional
 *   days: 90                    # window of the charts (default 90)
 *   parameters:                 # default: every regulated ReefDose head
 *     - parameter: kh           # kh ca mg k no3 po4 i fe salinity ph...
 *       entity: sensor.reefdose_head_1_last_test_result
 *     - parameter: fe
 *       entity: sensor.my_iron_tests
 *       name: Iron              # optional, the parameter's name otherwise
 *       ranges: [0.002, 0.005, 0.02, 0.05]  # optional, see below
 *
 * `ranges` are the four bounds [acceptable low, desired low, desired high,
 * acceptable high]; DEFAULT_RANGES gives them for the usual parameters, the
 * `ranges` attribute of the entity wins over both when present. An entity of
 * a ReefDose head regulation (its `measurements` attribute) is drawn from the
 * results the integration keeps, and gets a button to add, correct or delete
 * results; any other entity is drawn from the recorder.
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
  no3: [0.5, 2, 10, 25],
  po4: [0.01, 0.03, 0.1, 0.2],
  i: [0.03, 0.05, 0.08, 0.12],
  fe: [0.002, 0.005, 0.02, 0.05],
  // ppt
  salinity: [33, 34, 35.5, 36.5],
  ph: [7.8, 8.0, 8.4, 8.6],
};

/** One parameter followed. */
export interface FollowedParameter {
  parameter?: string;
  entity: string;
  name?: string;
  ranges?: number[];
}

export interface ParametersConfig {
  title?: string;
  days?: number;
  parameters?: FollowedParameter[];
}

/** Sensor of a ReefDose head listing its test results. */
const LAST_MEASUREMENT = "regulation_last_measurement";

/**
 * The regulated ReefDose heads: their last test result sensor and the
 * parameter they regulate (the configuration by default).
 */
export function discover_parameters(hass: any): FollowedParameter[] {
  const out: FollowedParameter[] = [];
  for (const [entity_id, entry] of Object.entries<any>(hass?.entities ?? {})) {
    if (entry?.platform !== "redsea") continue;
    if (entry?.translation_key !== LAST_MEASUREMENT) continue;
    const measurements = hass?.states?.[entity_id]?.attributes?.measurements;
    const parameter = Array.isArray(measurements)
      ? measurements[measurements.length - 1]?.parameter
      : undefined;
    out.push({ entity: entity_id, ...(parameter ? { parameter } : {}) });
  }
  return out.sort((a, b) => a.entity.localeCompare(b.entity));
}

/**
 * Zones of a parameter: its entity's own `ranges`, else the configured ones,
 * else the usual ones.
 */
export function parameter_ranges(
  hass: any,
  followed: FollowedParameter,
): number[] | null {
  return (
    parse_ranges(hass?.states?.[followed.entity]?.attributes?.ranges) ??
    parse_ranges(followed.ranges) ??
    DEFAULT_RANGES[followed.parameter ?? ""] ??
    null
  );
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
    ha-card {
      padding: 8px 12px 12px 12px;
    }
    h1 {
      font-size: 20px;
      font-weight: 400;
      margin: 8px 4px 4px 4px;
    }
    .parameter {
      margin-top: 10px;
    }
    .head {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 0 4px 2px 4px;
    }
    .name {
      font-weight: 600;
      flex: 1;
    }
    .value {
      font-variant-numeric: tabular-nums;
    }
    .value.danger {
      color: var(--error-color, #db4437);
    }
    .value.acceptable {
      color: var(--warning-color, #ff9800);
    }
    .value.desired {
      color: var(--success-color, #43a047);
    }
    .chart {
      display: block;
      width: 100%;
      height: 140px;
    }
    button {
      border: none;
      background: none;
      cursor: pointer;
      color: var(--primary-text-color);
      font-size: 16px;
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
    return 1 + 3 * this.parameters().length;
  }

  static getStubConfig(hass: any): ParametersConfig {
    return { parameters: discover_parameters(hass) };
  }

  /** Parameters followed: the configured ones, else the regulated heads. */
  parameters(): FollowedParameter[] {
    return (this._config.parameters ?? discover_parameters(this._hass)).filter(
      (p) => p && typeof p.entity === "string",
    );
  }

  /** Whether the entity holds the results itself (a ReefDose head). */
  keeps_results(entity_id: string): boolean {
    return Array.isArray(
      this._hass?.states?.[entity_id]?.attributes?.measurements,
    );
  }

  /** The chart of a parameter, built once. */
  chart(followed: FollowedParameter, ranges: number[] | null): any {
    const key = JSON.stringify([followed, ranges]);
    let chart = this._charts.get(key);
    if (!chart) {
      const days =
        Number(this._config.days) > 0 ? Number(this._config.days) : 90;
      const conf: Record<string, unknown> = {
        type: "history-chart",
        entities: [{ entity: followed.entity, color: "rgb(30,30,30)" }],
        hours: days * 24,
        step: true,
        baseline: "min",
        font_size: 10,
        hide_empty: false,
        bg_color: "255,255,255,0.95",
        css: { display: "block", width: "100%", height: "100%" },
      };
      if (ranges) conf.zones = ranges;
      if (this.keeps_results(followed.entity))
        conf.points_attribute = "measurements";
      chart = MyElement.create_element(
        this._hass,
        conf as any,
        host(followed.entity),
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
    if (followed.parameter) {
      const key = "parameter_" + followed.parameter;
      const label = i18n._(key);
      if (label && label !== key && !label.includes(key)) return label;
      return followed.parameter.toUpperCase();
    }
    return String(
      this._hass?.states?.[followed.entity]?.attributes?.friendly_name ??
        followed.entity,
    );
  }

  private _render_parameter(followed: FollowedParameter) {
    const state = this._hass?.states?.[followed.entity];
    const ranges = parameter_ranges(this._hass, followed);
    const value = Number(state?.state);
    const unit = state?.attributes?.unit_of_measurement ?? "";
    const editable = this.keeps_results(followed.entity);
    return html`<div class="parameter">
      <div class="head">
        <span class="name">${this._name(followed)}</span>
        <span class="value ${ReefParametersCard.zone(value, ranges)}">
          ${Number.isFinite(value) ? `${value} ${unit}` : "–"}
        </span>
        ${
          editable
            ? html`<button
                title=${i18n._("measurement_history")}
                @click=${() => this.edit(followed.entity)}
              >
                ✎
              </button>`
            : nothing
        }
      </div>
      <div class="chart">${state ? this.chart(followed, ranges) : nothing}</div>
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
          ? parameters.map((p) => this._render_parameter(p))
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
