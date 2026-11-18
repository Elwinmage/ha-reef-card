/**
 * The water parameters of the reeftech-catalog (`parameters` section), as the
 * integration serves them: the card never reaches the network itself, it asks
 * the redsea integration (websocket `redsea/catalog`, section `parameters`).
 *
 * The built-in tables of reef_parameters.ts stay the fallback when the
 * integration is absent, too old or offline; the catalog completes and
 * overrides them in place, so a new parameter or a corrected band is a
 * catalog release, without a new version of the card.
 */

import type { Chemistry } from "../base/reef_parameters";

/** Unit of the catalog -> the unit the card shows. */
const UNITS: Record<string, string> = {
  dkh: "dKH",
  ppm: "ppm",
  mg_l: "ppm",
  ppb: "ppb",
  ppt: "ppt",
  celsius: "°C",
  ph: "pH",
  mv: "mV",
};

/** The zones [acceptable low, desired low, desired high, acceptable high]. */
export function ranges_of(entry: any): number[] | null {
  const range = entry?.range;
  const bounds = [range?.min, range?.low, range?.high, range?.max];
  return bounds.every((v) => typeof v === "number" && Number.isFinite(v)) &&
    bounds[0] <= bounds[1] &&
    bounds[1] <= bounds[2] &&
    bounds[2] <= bounds[3]
    ? bounds
    : null;
}

/**
 * Complete `chemistries` and `ranges` (in place) with the entries of a catalog
 * view. The order of the ones already there is kept (it is the order the
 * editor lists them in); the others follow.
 *
 * @returns the number of chemistries the catalog gave
 */
export function apply_parameters_catalog(
  view: any,
  chemistries: Record<string, Chemistry>,
  ranges: Record<string, number[]>,
): number {
  const items = view?.items;
  if (!items || typeof items !== "object") return 0;
  let count = 0;
  for (const [id, entry] of Object.entries<any>(items)) {
    const unit = UNITS[String(entry?.unit)];
    if (!unit) continue;
    const chemistry: Chemistry = { unit };
    if (typeof entry.device_class === "string")
      chemistry.device_class = entry.device_class;
    chemistries[id] = chemistry;
    const zones = ranges_of(entry);
    if (zones) ranges[id] = zones;
    count++;
  }
  return count;
}

/**
 * Ask the integration for the `parameters` catalog.
 *
 * @returns the view (`{items}`), or null when no integration serves it
 */
export async function fetch_parameters_catalog(hass: any): Promise<any | null> {
  if (typeof hass?.callWS !== "function") return null;
  try {
    const answer = await hass.callWS({
      type: "redsea/catalog",
      section: "parameters",
    });
    return answer?.data ?? null;
  } catch {
    // Integration absent or too old: the built-in tables do
    return null;
  }
}
