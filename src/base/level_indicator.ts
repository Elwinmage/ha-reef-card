/**
 * Implement a level indicator: where a reading stands against its bounds.
 *
 * Two looks, as on the ReefControl probes:
 *   - a situation bar: five zones top to bottom (danger, acceptable,
 *     desired, acceptable, danger) and a cursor at the reading;
 *   - a dot (`compact`), coloured by the level, with "+" or "-" beside it
 *     when the reading is above or below its desired range.
 *
 * The reading is the element's entity. Its bounds come from its `ranges`
 * attribute, `[acceptable_low, desired_low, desired_high, acceptable_high]`;
 * its level from its `level` attribute when the device gives one, else from
 * the bounds. An unavailable reading shows no cursor and the error colour.
 *
 * Example: the RSPower local temperature
 *
 *   power_temperature_level: {
 *     name: "power_temperature",
 *     type: "level-indicator",
 *     compact: "${device.config.compact_probes === true}",
 *     tap_action: {
 *       domain: "redsea_ui",
 *       action: "dialog",
 *       data: { type: "power_temperature_history" },
 *     },
 *     css: { position: "absolute", top: "52%", left: "1.5%", width: "1%",
 *            height: "12%" },
 *   }
 *
 * Configuration:
 *   compact   true (or an expression) for the dot, else the bar
 *   dot_size  size of the dot, any CSS length (default 10px)
 *   dot_css   extra CSS of the dot, to place it elsewhere than the bar
 *             (margins in % follow the width of the element's box)
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, TemplateResult } from "lit";
import type { CSSResultGroup } from "lit";

import { MyElement } from "./element";
import style_level_indicator from "./level_indicator.styles";
import style_animations from "../utils/animations.styles";
import {
  BAR_ZONES,
  bar_position,
  HUB_LEVELS,
  level_color,
  level_from_ranges,
  level_sign,
  parse_ranges,
  sign_side,
} from "../utils/levels";
import type { ProbeLevel } from "../utils/levels";

//----------------------------------------------------------------------------//

/** States meaning there is no reading. */
const NO_READING: readonly string[] = ["unavailable", "unknown"];

export class LevelIndicator extends MyElement {
  static override styles: CSSResultGroup = [
    style_animations,
    style_level_indicator,
  ];

  /** The reading, NaN when there is none. */
  value(): number {
    const state = this.stateObj?.state;
    if (state === undefined || NO_READING.includes(state)) return NaN;
    return parseFloat(state);
  }

  /** Bounds of the reading, null when unknown. */
  ranges(): number[] | null {
    return parse_ranges(this.stateObj?.attributes?.ranges);
  }

  /**
   * Level of the reading: the device's own verdict when it gives one, else
   * computed from the bounds.
   */
  level(): ProbeLevel {
    const value = this.value();
    if (!Number.isFinite(value)) return "error";
    const own = HUB_LEVELS[this.stateObj?.attributes?.level];
    return own ?? level_from_ranges(value, this.ranges());
  }

  /** Whether the dot is drawn rather than the bar. */
  is_compact(): boolean {
    let compact: any = this.conf?.compact;
    if (typeof compact === "string") {
      compact = this.evaluate(compact);
    }
    return compact === true || compact === "true";
  }

  /**
   * Render
   * @param _style: the style built from `elt_css`
   */
  protected override _render(_style: string = ""): TemplateResult {
    const level = this.level();
    const color = level_color(level);
    if (this.is_compact()) {
      const sign =
        level === "desired" || level === "error"
          ? ""
          : level_sign(this.value(), this.ranges());
      const size = this.conf?.dot_size ?? "10px";
      return html`<div
        class="dot"
        style="width:${size};font-size:${size};background:${color};${this.get_style(
          "dot_css",
        )};${_style}"
      >
        <span class="sign ${sign_side(sign)}" style="color:${color}"
          >${sign}</span
        >
      </div>`;
    }
    const pos = bar_position(this.value(), this.ranges());
    return html`<div class="bar" style="${_style}">
      ${BAR_ZONES.map(
        (zone) => html`<div class="zone" style="background:${zone}"></div>`,
      )}
      ${pos === null
        ? ""
        : html`<div class="cursor" style="top:${pos * 100}%"></div>`}
    </div>`;
  }
}
