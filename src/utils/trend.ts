/**
 * @file Direction a reading is moving in
 * @module utils.trend
 *
 * A reading only says where a value stands. Around a test or a dose, where it
 * is heading says as much: this reads the slope of its last hour.
 */

import { HistoryChart, type HistoryPoint } from "../base/history_chart";

/** Where a reading is heading. */
export type Trend = "up" | "down" | "stable";

/** Hours of history the slope is measured over. */
export const TREND_HOURS = 1;
/** Trends are read again this often, in milliseconds. */
export const TREND_REFRESH_MS = 5 * 60 * 1000;
/** Shortest history worth a slope: less tells nothing about a trend. */
const MIN_SPAN_MS = 20 * 60 * 1000;
/** A trend ends a little below where it starts, so that it does not flicker. */
const LEAVE_RATIO = 0.7;

/** Slopes below these are noise, per hour. */
const STABLE_PH = 0.02;
const STABLE_ORP = 5;
const STABLE_TEMPERATURE = 0.1;
const FAHRENHEIT_PER_CELSIUS = 1.8;
/** Salinity is shown in the unit chosen on the hub. */
const STABLE_SALINITY: Record<string, number> = {
  ppt: 0.05,
  "ms/cm": 0.07,
  sg: 0.00004,
};

/**
 * Slope under which a reading counts as stable.
 * @param type: the kind of reading (ph, orp, ec, temperature)
 * @param unit: its unit
 * @return the limit, per hour
 */
export function stable_limit(type: string, unit?: string | null): number {
  const lower = String(unit ?? "").toLowerCase();
  switch (type) {
    case "ph":
      return STABLE_PH;
    case "orp":
      return STABLE_ORP;
    case "temperature":
      return lower.includes("f")
        ? STABLE_TEMPERATURE * FAHRENHEIT_PER_CELSIUS
        : STABLE_TEMPERATURE;
    default:
      return STABLE_SALINITY[lower] ?? STABLE_SALINITY.ppt!;
  }
}

/**
 * Least-squares slope of samples: unlike the gap between the first and last
 * ones, it is not moved by the noise of a single reading.
 * @param points: the samples
 * @return the slope per hour, null when they span too short a time
 */
export function slope_per_hour(points: HistoryPoint[]): number | null {
  if (points.length < 2) return null;
  const times = points.map((p) => p.t);
  const first = Math.min(...times);
  if (Math.max(...times) - first < MIN_SPAN_MS) return null;
  const hours = times.map((t) => (t - first) / 3600000);
  const mean_x = hours.reduce((sum, x) => sum + x, 0) / hours.length;
  const mean_y = points.reduce((sum, p) => sum + p.v, 0) / points.length;
  let xy = 0;
  let xx = 0;
  points.forEach((point, index) => {
    const dx = hours[index]! - mean_x;
    xy += dx * (point.v - mean_y);
    xx += dx * dx;
  });
  return xy / xx;
}

/**
 * Direction of a slope.
 * @param slope: the slope per hour, null when unknown
 * @param limit: the slope under which the reading is stable
 * @param previous: the direction last shown
 * @return the direction, null when unknown
 */
export function trend_of(
  slope: number | null,
  limit: number,
  previous?: Trend | null,
): Trend | null {
  if (slope === null) return null;
  const direction: Trend = slope > 0 ? "up" : "down";
  const needed = previous === direction ? limit * LEAVE_RATIO : limit;
  return Math.abs(slope) >= needed ? direction : "stable";
}

/** A reading to follow. */
export interface TrendReading {
  entity_id: string;
  type: string;
  unit?: string | null;
  /** Its value now: the recorder only holds its changes. */
  value: number;
}

/**
 * Read the direction of several readings from the recorder, in one call.
 * @param hass: the Home Assistant object
 * @param readings: the readings
 * @param previous: the directions last shown
 * @return the direction of each entity that has one
 */
export async function read_trends(
  hass: any,
  readings: TrendReading[],
  previous: Record<string, Trend>,
): Promise<Record<string, Trend>> {
  const now = Date.now();
  const start = now - TREND_HOURS * 3600000;
  const answer = await hass.callWS({
    type: "history/history_during_period",
    start_time: new Date(start).toISOString(),
    end_time: new Date(now).toISOString(),
    entity_ids: readings.map((r) => r.entity_id),
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false,
  });
  const trends: Record<string, Trend> = {};
  for (const reading of readings) {
    const points = HistoryChart.parse_history(answer, reading.entity_id).map(
      // The state at the start of the window can be dated earlier
      (point) => ({ t: Math.max(point.t, start), v: point.v }),
    );
    const trend = trend_of(
      slope_per_hour([...points, { t: now, v: reading.value }]),
      stable_limit(reading.type, reading.unit),
      previous[reading.entity_id],
    );
    if (trend) trends[reading.entity_id] = trend;
  }
  return trends;
}
