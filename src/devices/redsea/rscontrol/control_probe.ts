/**
 * @file One ReefSense probe of a ReefControl hub
 * @module devices.redsea.rscontrol.control_probe
 *
 * Mirrors the PowerSocket pattern used by RSPower: the parent RSControl
 * creates one ControlProbe per probe and hands it the probe's own entities,
 * so it renders its picture, values and situation bars autonomously.
 *
 * The integration tags every probe entity with `probe_uid` / `probe_type` /
 * `probe_index`; all probes of a type share the same translation keys, so the
 * parent groups them per probe and this element receives them under their
 * translation key. Two aliases are added on top (see `probe_aliases`):
 *   - `probe_primary`:   the probe's main reading (pH, ORP, salinity, the
 *                        temperature of a temperature probe, the ATO water
 *                        level, the leak flag);
 *   - `probe_secondary`: the embedded temperature of a pH, salinity or ATO
 *                        probe.
 * Measurement entities carry a `ranges` attribute,
 * `[acceptable_low, desired_low, desired_high, acceptable_high]`.
 *
 * Each reading is shown either on a situation bar or, in the compact mode
 * the card editor switches on (`compact_probes`), as a dot coloured by its
 * level with a sign telling on which side of the desired range it lies.
 * Clicking a bar or a dot opens the reading's last 24 hours.
 */

import { html, svg, nothing, TemplateResult } from "lit";
import { RSDevice } from "../../device";

import styles from "./control_probe.styles";
import style_common from "../../../utils/common.styles";
import style_animations from "../../../utils/animations.styles";
import {
  BAR_ZONES,
  bar_position,
  HUB_LEVELS,
  level_color,
  level_from_ranges,
  level_sign,
  parse_ranges,
  sign_side,
} from "../../../utils/levels";
import type { ProbeLevel } from "../../../utils/levels";

// Re-exported: they were first written here, for the probes
export {
  bar_position,
  level_color,
  level_from_ranges,
  level_sign,
  parse_ranges,
};
export type { ProbeLevel };

// ─── Probe model ─────────────────────────────────────────────────────────────

/** Translation key of each probe type's main reading. */
export const PRIMARY_KEYS: Record<string, string> = {
  ph: "probe_ph_value",
  orp: "probe_orp_value",
  ec: "probe_ec_value",
  temperature: "probe_temperature",
  ato: "probe_water_level",
  leak: "probe_leak_detected",
};

/** Probe types with an embedded temperature. */
export const SECONDARY_TYPES: readonly string[] = ["ph", "ec", "ato"];

/** Probe types whose main reading is not a number to print. */
export const HIDDEN_PRIMARY_TYPES: readonly string[] = ["ato", "leak"];

/** Probe `status` values meaning it is unplugged from the hub. */
export const DISCONNECTED_STATUSES: readonly string[] = [
  "disconnected",
  "not_connected",
  "offline",
];

/**
 * Whether a probe is unplugged from the hub.
 * @param status: state object of its status entity
 * @param primary: state object of its main reading
 * @return true when its status or its main reading says so
 */
export function probe_disconnected(status: any, primary: any): boolean {
  const text = String(status?.state ?? "");
  if (DISCONNECTED_STATUSES.includes(text.toLowerCase())) return true;
  return primary?.state === "unavailable";
}

/**
 * Level of a reading: the hub's own verdict when it gives one, else
 * computed from the bounds. A disconnected probe has no valid reading.
 * @param value: state object of the reading
 * @param level: state object of the matching level entity
 * @param disconnected: whether the probe is unplugged
 * @return the level
 */
export function reading_level(
  value: any,
  level: any,
  disconnected: boolean,
): ProbeLevel {
  if (disconnected) return "error";
  const hub = HUB_LEVELS[level?.state];
  if (hub) return hub;
  if (!value) return "error";
  return level_from_ranges(
    parseFloat(value.state),
    parse_ranges(value.attributes?.ranges),
  );
}

/**
 * Add the `probe_primary` / `probe_secondary` aliases to a probe's entities.
 * @param type: the probe type
 * @param entities: the probe's entities, keyed by translation key
 * @return a new map with the aliases, when their entity exists
 */
export function probe_aliases(
  type: string,
  entities: Record<string, any>,
): Record<string, any> {
  const result = { ...entities };
  const primary = entities[PRIMARY_KEYS[type]];
  if (primary) result.probe_primary = primary;
  if (SECONDARY_TYPES.includes(type) && entities.probe_temperature) {
    result.probe_secondary = entities.probe_temperature;
  }
  return result;
}

/** Dialog showing the history of each reading. */
const HISTORY_DIALOGS: Record<string, string> = {
  probe_primary: "probe_history",
  probe_secondary: "probe_temp_history",
};

/** Icon of each side a leak may come from. */
const LEAK_ICONS: Record<string, string> = {
  aquarium: "mdi:fish",
  rodi: "mdi:cup-water",
};

/** Level entity judging each reading. */
const LEVEL_KEYS: Record<string, string> = {
  probe_primary: "probe_level",
  probe_secondary: "probe_temp_level",
};

/** A reading and the bounds it is placed against. */
interface BarSeries {
  key: string;
  value: number;
  ranges: number[] | null;
}

// ─── Element ─────────────────────────────────────────────────────────────────

export class ControlProbe extends RSDevice {
  static styles = [styles, style_common, style_animations];

  static get properties() {
    return {
      state_on: {},
    };
  }

  state_on: boolean = false;
  probe_type: string = "";
  probe_uid: string = "";
  slot_id: number = 0;

  // Last states the picture depends on, to re-render only on a change
  private _signature: string = "";

  constructor() {
    super();
    this.state_on = false;
  }

  override render() {
    return this._render();
  }

  set hass(obj: any) {
    this._setting_hass(obj);
    const signature = this._states_signature();
    if (signature !== this._signature) {
      this._signature = signature;
      this.requestUpdate();
    }
  }

  get hass(): any {
    return this._hass;
  }

  update_state(value: boolean): void {
    this.state_on = value;
    this.requestUpdate();
  }

  /**
   * Everything the picture itself draws from (the values print themselves).
   * @return a string that changes whenever the bars or blink must change
   */
  private _states_signature(): string {
    return [
      "probe_primary",
      "probe_secondary",
      "probe_level",
      "probe_temp_level",
      "probe_status",
    ]
      .map((key) => {
        const st = this.get_entity(key);
        return st
          ? st.state + JSON.stringify(st.attributes?.ranges ?? null)
          : "";
      })
      .join("|");
  }

  // ── Predicates for the mapping ─────────────────────────────────────────

  /**
   * Whether the main reading is printed: not for ATO and leak probes, whose
   * main reading is a state rather than a number.
   * @return true when it is shown
   */
  show_primary(): boolean {
    return (
      !HIDDEN_PRIMARY_TYPES.includes(this.probe_type) &&
      !!this.entities?.probe_primary
    );
  }

  /**
   * Whether the probe has an embedded temperature.
   * @return true for a pH, salinity or ATO probe exposing it
   */
  has_secondary(): boolean {
    return !!this.entities?.probe_secondary;
  }

  /**
   * Whether the probe is unplugged from the hub.
   * @return true when its status or its main reading says so
   */
  is_disconnected(): boolean {
    return probe_disconnected(
      this.get_entity("probe_status"),
      this.get_entity("probe_primary"),
    );
  }

  primary_level(): ProbeLevel {
    return this._level("probe_primary", "probe_level");
  }

  secondary_level(): ProbeLevel {
    return this._level("probe_secondary", "probe_temp_level");
  }

  primary_color(): string {
    return level_color(this.primary_level());
  }

  secondary_color(): string {
    return level_color(this.secondary_level());
  }

  /**
   * Level of a reading: the hub's own verdict when it gives one, else
   * computed from the bounds. A disconnected probe has no valid reading.
   * @param value_key: the reading's entity key
   * @param level_key: the matching level entity key
   * @return the level
   */
  private _level(value_key: string, level_key: string): ProbeLevel {
    return reading_level(
      this.get_entity(value_key),
      this.get_entity(level_key),
      this.is_disconnected(),
    );
  }

  /**
   * Reading and bounds of a measurement entity.
   * @param key: the entity key
   * @return the series, or null without such entity
   */
  private _series(key: string): BarSeries | null {
    const st = this.get_entity(key);
    if (!st) return null;
    return {
      key: key,
      value: parseFloat(st.state),
      ranges: parse_ranges(st.attributes?.ranges),
    };
  }

  /**
   * The readings drawn beside the probe, main one first: the main reading
   * when it is a number, then the embedded temperature.
   * @return the series, those without an entity left out
   */
  drawn_series(): BarSeries[] {
    const out: BarSeries[] = [];
    const primary = this.show_primary() ? this._series("probe_primary") : null;
    if (primary) out.push(primary);
    const secondary = this.has_secondary()
      ? this._series("probe_secondary")
      : null;
    if (secondary) out.push(secondary);
    return out;
  }

  /**
   * Whether a leak probe is wet.
   * @return true when it detects water
   */
  leak_detected(): boolean {
    return this.get_entity("probe_primary")?.state === "on";
  }

  /**
   * Icon telling where the water of a detected leak comes from: a fish for
   * the tank, a cup of water for the ATO reservoir. The hub knows it from
   * the leak sensor of its ATO port.
   * @return the icon, or "" when there is no leak or its side is unknown
   */
  leak_icon(): string {
    if (!this.leak_detected()) return "";
    return LEAK_ICONS[(this.device as any)?.leak_source?.()] ?? "";
  }

  /**
   * Whether the readings are shown as dots rather than bars.
   * @return true in the compact mode
   */
  is_compact(): boolean {
    return this.config?.compact === true;
  }

  /**
   * Open the last 24 hours of a reading.
   *
   * The dialog resolves its entities through the element it is given: the
   * probe itself stands for it, since the dialog wants an element whose
   * device holds the probe's entities (as the cog is).
   * @param key: "probe_primary" or "probe_secondary"
   */
  open_history(key: string): void {
    this.dispatchEvent(
      new CustomEvent("display-dialog", {
        bubbles: true,
        composed: true,
        detail: {
          type: HISTORY_DIALOGS[key],
          elt: {
            device: this,
            get_entity: (k: string) => this.get_entity(k),
          },
        },
      }),
    );
  }

  // ── Rendering ───────────────────────────────────────────────────────────

  /**
   * Picture settings in effect: the type's own, or its `no_temp` variant
   * when the probe has no embedded temperature (a pH probe without
   * temperature has a picture, and so a geometry, of its own).
   * @return the configuration holding image, img_css, aspect and bar
   */
  view(): any {
    const conf: any = this.config ?? {};
    if (conf.no_temp && !this.has_secondary()) {
      return { ...conf, ...conf.no_temp };
    }
    return conf;
  }

  /**
   * Picture of the probe.
   * @return the image URL
   */
  probe_image(): string {
    return String(this.view().image ?? "");
  }

  _render(_style = null, _substyle = null): TemplateResult {
    this.to_render = false;
    if (!this.config || !this._hass || !this.entities) {
      return html``;
    }
    const view = this.view();
    const box_style = this.get_style({ css: view.img_css });
    const alert = this.is_disconnected() ? "blink-alert" : "";
    // Everything is drawn inside the picture box, in % of the picture
    return html`
      <div class="probe ${alert}">
        <div class="probe_box" style="${box_style}">
          <img
            class="probe_img ${this.state_on ? "" : "off"}"
            src="${this.probe_image()}"
            alt=""
          />
          ${this.is_compact() ? this._render_dots() : this._render_bars()}
          ${this._render_elements(this.state_on)}
        </div>
      </div>
    `;
  }

  /**
   * Situation bars, beside the probe tube.
   *
   * The main reading goes on the left bar and the temperature on the right
   * one. A probe type without a left bar (a temperature probe, whose main
   * reading is a temperature) draws its main reading on the right. The
   * water level of an ATO probe is not drawn here: only its temperature is.
   */
  _render_bars(): TemplateResult | typeof nothing {
    const bar = this.view().bar;
    if (!bar) return nothing;
    const series = this.drawn_series();
    const primary = series.find((s) => s.key === "probe_primary") ?? null;
    const secondary = series.find((s) => s.key === "probe_secondary") ?? null;
    let left: BarSeries | null = null;
    let right: BarSeries | null = secondary;
    if (primary && bar.left) left = primary;
    else if (primary && !right) right = primary;
    if (!left && !right) return nothing;
    return html`<svg
      class="bars"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      ${left ? this._render_bar(bar, bar.left, left) : nothing}
      ${right && bar.right ? this._render_bar(bar, bar.right, right) : nothing}
    </svg>`;
  }

  /**
   * One bar: five coloured zones and a cursor at the reading.
   * @param bar: the bar geometry (top and bottom, in % of the picture)
   * @param x: the bar's [left, right] edges, in % of the picture width
   * @param series: the reading placed on it
   */
  _render_bar(bar: any, x: number[], series: BarSeries): TemplateResult {
    const [x0, x1] = x;
    const width = x1 - x0;
    const zone = (bar.bottom - bar.top) / BAR_ZONES.length;
    const zones = BAR_ZONES.map(
      (color, idx) =>
        svg`<rect x="${x0}" y="${bar.top + idx * zone}" width="${width}"
          height="${zone}" fill="${color}"></rect>`,
    );

    const pos = this.is_disconnected()
      ? null
      : bar_position(series.value, series.ranges);
    let cursor: TemplateResult | typeof nothing = nothing;
    if (pos !== null) {
      // A square on screen: the picture is `aspect` times taller than wide
      const size = width * 0.6;
      const height = size / (this.view().aspect || 1);
      const cy = bar.top + pos * (bar.bottom - bar.top);
      cursor = svg`<rect class="cursor" x="${x0 + (width - size) / 2}"
        y="${cy - height / 2}" width="${size}" height="${height}"
        fill="black" stroke="white" stroke-width="1"
        vector-effect="non-scaling-stroke"></rect>`;
    }
    return svg`<g class="bar" @click=${(e: Event) => {
      e.stopPropagation();
      this.open_history(series.key);
    }}>${zones}${cursor}</g>`;
  }

  /**
   * Compact mode: one dot per reading, under the probe's cog, coloured by
   * its level, with "+" or "-" beside it when the reading is above or
   * below its desired range.
   */
  _render_dots(): TemplateResult | typeof nothing {
    const dots = this.view().dots;
    if (!dots) return nothing;
    const disconnected = this.is_disconnected();
    return html`${this.drawn_series().map((series, idx) => {
      const level = reading_level(
        this.get_entity(series.key),
        this.get_entity(LEVEL_KEYS[series.key]!),
        disconnected,
      );
      const sign =
        level === "desired" || level === "error"
          ? ""
          : level_sign(series.value, series.ranges);
      const color = level_color(level);
      const top = Number(dots.top) + idx * Number(dots.gap ?? 0);
      return html`<div
        class="dot"
        style="top:${top}%;left:${dots.left ?? 50}%;background:${color}"
        @click="${(e: Event) => {
          e.stopPropagation();
          this.open_history(series.key);
        }}"
      >
        <span class="sign ${sign_side(sign)}" style="color:${color}"
          >${sign}</span
        >
      </div>`;
    })}`;
  }
}
