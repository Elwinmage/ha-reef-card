/**
 * Unit conversion helpers.
 *
 * Home Assistant lets the user change the display unit of a sensor or number
 * entity (e.g. a volume in L shown in mL). The card then receives the state
 * already converted, with unit_of_measurement updated accordingly, so any
 * hard-coded conversion factor between two entities becomes wrong. These
 * helpers derive the factor from the units actually reported.
 */

/** Size of each unit expressed in its dimension's base unit. */
interface UnitDef {
  dimension: string;
  factor: number;
}

/** Volume units Home Assistant may report, base unit mL. */
const VOLUME_ML: Record<string, number> = {
  ml: 1,
  l: 1000,
  cl: 10,
  dl: 100,
  "m³": 1_000_000,
  m3: 1_000_000,
  gal: 3785.411784,
  "fl. oz.": 29.5735295625,
  "fl.oz.": 29.5735295625,
  "fl oz": 29.5735295625,
  "ft³": 28316.846592,
  ft3: 28316.846592,
  ccf: 2_831_684.6592,
};

/** Mass units, base unit g. */
const MASS_G: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  oz: 28.349523125,
  lb: 453.59237,
};

/**
 * Resolve a unit string to its dimension and size in the base unit.
 * @param unit: unit_of_measurement as reported by HA
 * @returns the definition, or null when the unit is not known
 */
export function unit_def(unit: unknown): UnitDef | null {
  if (typeof unit !== "string") return null;
  const key = unit.trim().toLowerCase();
  if (!key) return null;
  if (key in VOLUME_ML) return { dimension: "volume", factor: VOLUME_ML[key] };
  if (key in MASS_G) return { dimension: "mass", factor: MASS_G[key] };
  return null;
}

/**
 * Factor turning a figure expressed in `from` into the same quantity in `to`.
 * @param from: unit the figure is expressed in
 * @param to: unit wanted
 * @returns the multiplier, or null when either unit is unknown or the two
 *          units do not measure the same thing
 */
export function unit_factor(from: unknown, to: unknown): number | null {
  const a = unit_def(from);
  const b = unit_def(to);
  if (!a || !b || a.dimension !== b.dimension) return null;
  return a.factor / b.factor;
}
