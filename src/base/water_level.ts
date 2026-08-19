/**
 * Implement a water level element.
 *
 * Renders a translucent body of water over the device picture, so probes,
 * pumps and the tank graduation stay visible through it. Two ways to decide
 * how high the water sits:
 *
 * 1) Ratio mode — a value and a target, like progress-bar. Used for the RO
 *    reservoir, whose fill level is a genuine volume ratio:
 *   {
 *     name: "volume_left",          // in mL
 *     target: "ato_tank_volume",    // in L
 *     target_factor: 1000,          // L -> mL
 *     type: "water-level",
 *     min_percent: 12,              // pump cannot siphon the last cm
 *     max_percent: 90,
 *   }
 *
 * 2) Discrete mode — a state maps to a fixed physical height. Used for the
 *    ATO optical probe in the sump: "desire_level_1" is not a fraction of a
 *    volume, it is a mark on the glass, so it cannot be derived from a ratio:
 *   {
 *     name: "water_level",
 *     type: "water-level",
 *     levels: {
 *       below: 34,
 *       desire_level_1: 52,
 *       desire_level_2: 66,
 *       above: 82,
 *     },
 *     min_percent: 20,
 *     max_percent: 86,
 *   }
 *   Any state missing from `levels` (typically "error", but also unknown /
 *   unavailable) renders the no-reading mark instead of an empty tank.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import {
  html,
  svg,
  TemplateResult,
  SVGTemplateResult,
  css,
  CSSResult,
} from "lit";
import { property } from "lit/decorators.js";

import type { WaterLevelConfig, StateObject } from "../types/index";
import { ProgressBar } from "./progress_bar";

import style_water_level from "./water_level.styles";

//----------------------------------------------------------------------------//

/**
 * Default water tint. Deliberately a blue rather than the RedSea device red:
 * the device colour would tint the tank in the brand red, which reads as an
 * alarm rather than as water.
 */
const DEFAULT_WATER = "rgb(48,124,214)";

/** Default tint below warn_below, and for a missing reading. */
const DEFAULT_WARN = "rgb(232,150,48)";

/** Default water opacity, flat across the whole submerged area. */
const DEFAULT_OPACITY = 0.45;

/**
 * Wave outline, one period every 100 viewBox units, drawn from x=-100 to
 * x=300 so the -100 drift never exposes an edge. Closed downward to y=100 so
 * it fills the body below the surface.
 */
const WAVE_PATH = [
  "M -100 0",
  "q 25 -3.5 50 0 q 25 3.5 50 0",
  "q 25 -3.5 50 0 q 25 3.5 50 0",
  "q 25 -3.5 50 0 q 25 3.5 50 0",
  "q 25 -3.5 50 0 q 25 3.5 50 0",
  "L 300 100 L -100 100 Z",
].join(" ");

export class WaterLevel extends ProgressBar {
  static override styles = [
    // ProgressBar.styles is always defined as an array
    ...(ProgressBar.styles as CSSResult[]),
    style_water_level,
    css`
      .wl-body {
        transform: translate(0, var(--wl-offset, 100px));
      }
    `,
  ];

  @property({ type: Object })
  declare conf?: WaterLevelConfig;

  protected override logName = "WaterLevel";

  /**
   * Constructor
   */
  constructor() {
    super();
  }

  /**
   * A discrete-level element needs no target entity: the height comes from
   * the state itself, so only stateObj has to resolve.
   */
  protected override hasTargetState(): boolean {
    if (this.conf?.levels) {
      return !!this.stateObj;
    }
    return super.hasTargetState();
  }

  /**
   * Resolve the water level as a 0-100 figure, or null when there is no
   * usable reading (probe in "error", entity unknown / unavailable, or a
   * firmware state absent from `levels`).
   */
  protected resolveLevel(): number | null {
    const state = this.stateObj?.state;

    // Discrete mode: the state names a mark on the glass.
    if (this.conf?.levels) {
      if (state === undefined) return null;
      const level = this.conf.levels[state];
      return typeof level === "number" ? level : null;
    }

    // Ratio mode: value / target, both resolved by SensorTarget so that
    // value_attribute / target_attribute / a literal numeric target all work.
    if (state === "unknown" || state === "unavailable") return null;
    return this.resolveDisplayPercent();
  }

  /**
   * Map a 0-100 level onto the water area of the background picture.
   *
   * The glass rarely spans the whole element box: min_percent is where the
   * surface sits when the tank reads empty — for the RO reservoir that is the
   * residue the pump cannot siphon, so 0 % is a low water line, not a dry
   * tank — and max_percent is the brim.
   */
  protected mapToBox(level: number): number {
    const lo = this.conf?.min_percent ?? 0;
    const hi = this.conf?.max_percent ?? 100;
    const clamped = Math.min(100, Math.max(0, level));
    return lo + (clamped * (hi - lo)) / 100;
  }

  /**
   * Water tint. colors.fill wins when set, otherwise the device colour, and
   * warn_below overrides both so a low reservoir is visible at a glance.
   */
  protected resolveWaterColor(): string {
    // The device colour is NOT used as a fallback here on purpose: on a RedSea
    // device it is the brand red, which does not read as water.
    return this.conf?.colors?.fill ?? DEFAULT_WATER;
  }

  /** Tint used while alerting, and for the no-reading mark. */
  protected resolveWarnColor(): string {
    return this.conf?.colors?.warn ?? DEFAULT_WARN;
  }

  /**
   * Whether the reading warrants a visual alert.
   *
   * Ratio mode compares against warn_below. Discrete mode has no ordering to
   * compare — "above" is as abnormal as "below" — so the states that count as
   * an alert are listed explicitly in warn_states.
   */
  protected isAlerting(level: number | null): boolean {
    if (this.conf?.levels) {
      const states = this.conf.warn_states;
      const current = this.stateObj?.state;
      return !!states && !!current && states.includes(current);
    }
    const warnBelow = this.conf?.warn_below;
    return typeof warnBelow === "number" && level !== null && level < warnBelow;
  }

  /**
   * Inline custom properties driving the alert animation. The base fill stays
   * on the presentation attribute so a reduced-motion user, whose animation is
   * disabled, still sees a static warning tint rather than plain water.
   */
  protected alertStyle(): string {
    return `--wl-water: ${this.resolveWaterColor()}; --wl-warn: ${this.resolveWarnColor()}`;
  }

  /**
   * Text shown at the bottom-right of the submerged area: a percentage for a
   * ratio tank, the translated state for a discrete probe. Home Assistant
   * already ships the probe state translations, so formatEntityState is
   * preferred over the raw state.
   */
  protected resolveValueText(level: number | null): string {
    // An explicit label wins: it is a plain evaluated expression.
    if (this.conf?.label && typeof this.conf.label !== "boolean") {
      return this.evaluate(this.conf.label) || "";
    }

    // value_entity names a sibling entity to display instead of the one
    // driving the level. Two entities can share a translation_key across
    // domains (binary_sensor.water_level and sensor.water_level), so the
    // domain-prefixed key is the reliable one.
    const stateObj = this.resolveValueStateObj();

    if (this.conf?.levels) {
      // formatEntityState applies Home Assistant's own state translations,
      // which a label expression cannot reach: the SafeEval context exposes
      // entity states, not the hass helpers.
      const formatted = this._hass?.formatEntityState?.(stateObj);
      return formatted || stateObj?.state || "";
    }
    return level === null ? "--" : `${Math.round(level)}%`;
  }

  /** Entity whose state is displayed; defaults to the level entity. */
  protected resolveValueStateObj(): StateObject | null {
    const key = this.conf?.value_entity;
    if (!key) {
      return this.stateObj;
    }
    const entity =
      this.device?.entities?.[key] ?? this.device?.parent_entities?.[key];
    const resolved = entity?.entity_id
      ? (this._hass?.states?.[entity.entity_id] ?? null)
      : null;
    if (!resolved) {
      console.warn(
        `[WaterLevel - ${this.conf?.name}] value_entity "${key}" not resolved — use a domain-prefixed key when several domains share a translation_key`,
      );
    }
    return resolved;
  }

  /**
   * No-reading mark: a dashed line at mid height rather than an empty tank.
   */
  protected renderUnknown(): SVGTemplateResult {
    const blink = this.conf?.warn_blink !== false;
    return svg`
      <line
        class="wl-unknown${blink ? " wl-alert-stroke" : ""}"
        style="${this.alertStyle()}"
        x1="4" y1="50" x2="96" y2="50"
        stroke="${this.resolveWarnColor()}"
        stroke-opacity="0.75"
      ></line>
    `;
  }

  /**
   * Value overlay, anchored at the bottom-right of the submerged area.
   * Rendered as HTML rather than SVG <text>: the SVG uses
   * preserveAspectRatio="none", which would stretch any glyph with the box.
   */
  protected renderValue(level: number | null): TemplateResult | string {
    if (this.conf?.show_value === false) {
      return "";
    }
    const text = this.resolveValueText(level);
    if (!text) {
      return "";
    }
    const color = this.resolve_text_color() || "white";
    return html`<span class="wl-value" style="color:${color}">${text}</span>`;
  }

  /**
   * Render
   * @param _style: not used here, the SVG fills the wrapper div
   */
  protected override _render(_style?: string): TemplateResult {
    if (!this.hasTargetState()) {
      const why = !this.stateObj
        ? `stateObj not resolved for name="${this.conf?.name}" — check the entity's translation_key matches (device.entities keys)`
        : `stateObjTarget not resolved for target="${this.conf?.target}" — use a number for a fixed target, target_attribute, or levels for a discrete probe`;
      console.warn(`[WaterLevel - ${this.conf?.name}] Missing state: ${why}`);
      return html`<div class="error">Missing state</div>`;
    }

    this.applyStateColor();

    const level = this.resolveLevel();
    const alerting = this.isAlerting(level);
    const blink = alerting && this.conf?.warn_blink !== false;
    // While alerting the attribute holds the warning tint; the animation then
    // oscillates back toward --wl-water.
    const water = alerting ? this.resolveWarnColor() : this.resolveWaterColor();
    const alertClass = blink ? " wl-alert" : "";
    // One flat tint over the whole submerged area, from the bottom up to the
    // water line. A vertical gradient was tried first and read as a lighting
    // effect rather than as water depth.
    const opacity = this.conf?.opacity ?? DEFAULT_OPACITY;

    if (level === null) {
      return html`
        <div class="wl-root">
          <svg
            class="water-level"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            ${this.renderUnknown()}
          </svg>
          ${this.renderValue(null)}
        </div>
      `;
    }

    const height = this.mapToBox(level);
    // SVG origin is top-left: a 20 % fill sits 80 units down. Rounded to keep
    // the inline style readable and stable across float noise.
    const offset = Math.round((100 - height) * 100) / 100;
    const wave = this.conf?.wave !== false;

    return html`
      <div class="wl-root">
        <svg
          class="water-level"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g class="wl-body wl-blend" style="--wl-offset: ${offset}px">
            ${wave
              ? svg`<path
                    class="wl-wave${alertClass}"
                    style="${this.alertStyle()}"
                    d="${WAVE_PATH}"
                    fill="${water}"
                    fill-opacity="${opacity}"
                  ></path>`
              : svg`<rect
                    class="${alertClass.trim()}"
                    style="${this.alertStyle()}"
                    x="-100"
                    y="0"
                    width="400"
                    height="100"
                    fill="${water}"
                    fill-opacity="${opacity}"
                  ></rect>`}
          </g>
        </svg>
        ${this.renderValue(level)}
      </div>
    `;
  }
}
