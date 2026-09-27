/**
 * @file Levels of a measured reading against its bounds
 * @module utils.levels
 *
 * Shared by everything that judges a reading against its four bounds
 * `[acceptable_low, desired_low, desired_high, acceptable_high]`: the
 * ReefControl probes and the RSPower local temperature (situation bars,
 * dots, value colours).
 */

import {
  COLOR_LEVEL_ACCEPTABLE_HEX,
  COLOR_LEVEL_DANGER_HEX,
  COLOR_LEVEL_DESIRED_HEX,
  COLOR_LEVEL_ERROR_HEX,
} from "./colors";

/** Where a reading stands against its bounds. */
export type ProbeLevel = "desired" | "acceptable" | "danger" | "error";

/** Level names the hub reports, to the card's own. */
export const HUB_LEVELS: Record<string, ProbeLevel> = {
  desired: "desired",
  acceptable: "acceptable",
  danger: "danger",
  sensor_data_error: "error",
};

const LEVEL_COLORS: Record<ProbeLevel, string> = {
  desired: COLOR_LEVEL_DESIRED_HEX,
  acceptable: COLOR_LEVEL_ACCEPTABLE_HEX,
  danger: COLOR_LEVEL_DANGER_HEX,
  error: COLOR_LEVEL_ERROR_HEX,
};

/** Zone colours of a situation bar, top to bottom. */
export const BAR_ZONES: readonly string[] = [
  COLOR_LEVEL_DANGER_HEX,
  COLOR_LEVEL_ACCEPTABLE_HEX,
  COLOR_LEVEL_DESIRED_HEX,
  COLOR_LEVEL_ACCEPTABLE_HEX,
  COLOR_LEVEL_DANGER_HEX,
];

/**
 * Read a `ranges` attribute.
 * @param raw: the attribute value
 * @return the four bounds, or null when unusable
 */
export function parse_ranges(raw: any): number[] | null {
  if (!Array.isArray(raw) || raw.length !== 4) return null;
  const values = raw.map((v) => (typeof v === "number" ? v : NaN));
  return values.every((v) => Number.isFinite(v)) ? values : null;
}

/**
 * Level of a reading computed from its bounds, for when the hub gives none.
 * @param value: the reading
 * @param ranges: [acceptable_low, desired_low, desired_high, acceptable_high]
 * @return the level, "error" without a usable reading or bounds
 */
export function level_from_ranges(
  value: number,
  ranges: number[] | null,
): ProbeLevel {
  if (!Number.isFinite(value) || !ranges) return "error";
  const [acc_low, des_low, des_high, acc_high] = ranges;
  if (value >= des_low && value <= des_high) return "desired";
  if (value >= acc_low && value <= acc_high) return "acceptable";
  return "danger";
}

/**
 * Colour of a level.
 * @param level: the level
 * @return a CSS colour
 */
export function level_color(level: ProbeLevel): string {
  return LEVEL_COLORS[level];
}

/**
 * Vertical position of a reading on a situation bar.
 *
 * The bar has five zones of equal height, top to bottom: danger (above the
 * acceptable high), acceptable, desired, acceptable, danger (below the
 * acceptable low). Inside a zone the position is linear; the two danger zones
 * extend as far as their neighbouring acceptable zone, then clamp.
 * @param value: the reading
 * @param ranges: [acceptable_low, desired_low, desired_high, acceptable_high]
 * @return 0 (top) to 1 (bottom), or null when it cannot be placed
 */
export function bar_position(
  value: number,
  ranges: number[] | null,
): number | null {
  if (!Number.isFinite(value) || !ranges) return null;
  const [acc_low, des_low, des_high, acc_high] = ranges;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  if (value >= acc_high) {
    const span = acc_high - des_high || 1;
    return 0.2 * (1 - clamp((value - acc_high) / span));
  }
  if (value >= des_high) {
    return 0.2 + (0.2 * (acc_high - value)) / (acc_high - des_high);
  }
  if (value >= des_low) {
    // Reached only below des_high, so the zone has a width
    return 0.4 + (0.2 * (des_high - value)) / (des_high - des_low);
  }
  if (value >= acc_low) {
    return 0.6 + (0.2 * (des_low - value)) / (des_low - acc_low);
  }
  const span = des_low - acc_low || 1;
  return 0.8 + 0.2 * clamp((acc_low - value) / span);
}

/**
 * Side of the desired range a reading lies on.
 * @param value: the reading
 * @param ranges: [acceptable_low, desired_low, desired_high, acceptable_high]
 * @return "+" above it, "−" below it, "" inside it or when unknown
 */
export function level_sign(value: number, ranges: number[] | null): string {
  if (!Number.isFinite(value) || !ranges) return "";
  if (value > ranges[2]!) return "+";
  // A true minus: a hyphen is too thin to read at that size
  if (value < ranges[1]!) return "\u2212";
  return "";
}

/**
 * Where a sign is drawn around its dot: "+" above, "−" below.
 * @param sign: the sign, as level_sign gives it
 * @return the CSS class placing it
 */
export function sign_side(sign: string): string {
  return sign === "+" ? "above" : "below";
}
