/**
 * @file Main view of a ReefDose head in brine mode
 * @module devices.redsea.rsdose.brine.mapping
 *
 * In brine mode Home Assistant drives the head alone, with manual doses
 * (the redsea integration's dose regulation): the head's own schedule is
 * off and its daily dose means nothing. The head then shows, in the same
 * places:
 *
 * - the ring and the middle label: brine dosed today against the brine
 *   planned for the day;
 * - the bottom label: the salinity the brine works on, instead of the
 *   number of doses;
 * - the container: its level, without the days left (computed by the doser
 *   from the daily dose of its schedule).
 *
 * Each brine element follows the element it stands for, and only one of
 * the two is in the layout at a time (`remove_if_disabled`), so the labels
 * keep their places in the grid of the head.
 */

import { BRINE_MODE, NOT_BRINE_MODE } from "./regulation.dialogs";

type Elements = Record<string, any>;

/** `disabled_if` of an element, also true when `condition` is. */
function or_condition(conf: any, condition: string): string {
  return conf.disabled_if ? `${conf.disabled_if} || ${condition}` : condition;
}

/** Shown out of brine mode only, taken out of the layout in brine mode. */
function standard(conf: any) {
  return {
    ...conf,
    disabled_if: or_condition(conf, BRINE_MODE),
    remove_if_disabled: true,
  };
}

/** Brine variant, taken out of the layout out of brine mode. */
function brine(conf: any, changes: Record<string, any>) {
  const variant = { ...conf, ...changes, remove_if_disabled: true };
  variant.disabled_if = changes.disabled_if
    ? `${changes.disabled_if} || ${NOT_BRINE_MODE}`
    : NOT_BRINE_MODE;
  // Options of the standard element that mean nothing here
  for (const key of Object.keys(changes)) {
    if (changes[key] === undefined) delete variant[key];
  }
  return variant;
}

/** Brine dosed today, against the brine planned for the day. */
const dosed_today = {
  name: "manual_dosed_today",
  target: "brine_daily_volume",
};

/**
 * How the elements of a head change in brine mode, by element key: the
 * standard element, then its brine variant if it has one.
 */
const VARIANTS: Record<string, (conf: any) => any[]> = {
  // The "+n mL" of manual doses is the dosed volume itself in brine mode.
  // Kept as is (its line break holds the top row of the labels).
  manual_dosed_today: (conf) => [
    { ...conf, disabled_if: or_condition(conf, BRINE_MODE) },
  ],
  auto_dosed_today: (conf) => [standard(conf), brine(conf, dosed_today)],
  auto_dosed_today_circle: (conf) => [standard(conf), brine(conf, dosed_today)],
  doses_today: (conf) => [
    standard(conf),
    brine(conf, {
      name: "brine_salinity",
      type: "common-sensor",
      target: undefined,
      unit: undefined,
      force_integer: undefined,
    }),
  ],
  container_volume: (conf) => [
    { ...conf, disabled_if: or_condition(conf, BRINE_MODE) },
    brine(conf, {
      label: false,
      disabled_if: "${entity.slm.state}=='off'",
    }),
  ],
};

/**
 * Elements of a head, with their brine mode variants.
 * @param elements: the elements of a head in its mapping
 * @return the same elements, each brine variant right after the element it
 *   stands for
 */
export function with_brine_mode(elements: Elements): Elements {
  const result: Elements = {};
  for (const [key, conf] of Object.entries(elements)) {
    const variants = VARIANTS[key];
    if (!variants) {
      result[key] = conf;
      continue;
    }
    const [shown, variant] = variants(conf);
    result[key] = shown;
    if (variant) {
      result[`brine_${key}`] = variant;
    }
  }
  return result;
}
