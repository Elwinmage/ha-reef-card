/**
 * @file Dialogs of the dose regulation of a ReefDose head
 * @module devices.redsea.rsdose.regulation.dialogs
 *
 * Backed by the entities of the redsea integration's dose regulation
 * (dose_regulation_entities.py), found by their translation keys on the
 * head's device:
 *
 * - the head configuration holds the mode. In brine mode the head is
 *   driven by Home Assistant alone, with manual doses: its schedule makes no
 *   sense any more and gives way to the brine (brine_content), the salinity
 *   it works on, the brine planned per day, the refractometer check and the
 *   settings. Otherwise the schedule stays (schedule_content);
 * - "regulation_assisted", reached from the head configuration in assisted
 *   mode: record a test result, review the proposed daily dose and apply or
 *   dismiss it, then the settings of the computation.
 */

/** Conditions on the head's regulation mode, for `disabled_if`. */
export const BRINE_MODE = "${entity.regulation_mode.state}==='brine'";
export const NOT_BRINE_MODE = "${entity.regulation_mode.state}!=='brine'";

/** Plain entity row named after its entity. */
const row = (entity: string) => ({ entity, name: { type: "entity" } });

/**
 * A button of a dialog opening another dialog of the same head, shown only
 * while the head's regulation mode is `mode`.
 */
function open_dialog(type: string, icon: string, label: string, mode: string) {
  return {
    view: "common-button",
    conf: {
      type: "common-button",
      stateObj: null,
      icon,
      disabled_if: `\${entity.regulation_mode.state}!=='${mode}'`,
      no_br_if_disabled: true,
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: { type, overload_quit: "head_configuration" },
      },
      label,
      class: "dialog_button",
      css: { "margin-bottom": "5px", "text-align": "center" },
      "elt.css": { "background-color": "rgba(0,0,0,0)" },
    },
  };
}

/**
 * History of one reading of the head, over `hours` hours.
 * @param entity: translation key of the reading
 * @param hours: size of the window
 * @param step: true for a value holding between two changes (a test
 *   result), false for a signal (a salinity)
 */
function history(entity: string, hours: number, step: boolean) {
  return {
    view: "history-chart",
    conf: {
      type: "history-chart",
      entities: [{ entity, color: "rgb(30,30,30)" }],
      step,
      // Nothing recorded yet (no test, no salinity read): no blank panel
      hide_empty: true,
      baseline: "min",
      hours,
      font_size: 11,
      bg_color: "255,255,255,0.95",
      css: { display: "block", width: "100%", height: "180px" },
    },
  };
}

function entities(rows: Array<Record<string, any>>) {
  return {
    view: "hui-entities-card",
    conf: { type: "entities", entities: rows },
  };
}

const divider = { type: "divider" };

/** Hide a dialog item unless `condition` is false. */
function hidden_if<T extends object>(condition: string, item: T) {
  return { ...item, disabled_if: condition };
}

/** Head configuration, in any mode: the mode, and assisted dosing. */
export const regulation_content = [
  entities([row("regulation_mode")]),
  open_dialog(
    "regulation_assisted",
    "mdi:test-tube",
    "${i18n._('regulation_assisted')}",
    "assisted",
  ),
];

/** Head configuration, out of brine mode: the head's own schedule. */
export const schedule_content = [
  hidden_if(BRINE_MODE, entities([row("schedule_enabled")])),
  hidden_if(BRINE_MODE, {
    view: "extend",
    extend: "dose_head_dialog_func_ext",
  }),
];

/** Head configuration, in brine mode: the brine instead of the schedule. */
export const brine_content = [
  // The salinity of the last week
  history("brine_salinity", 24 * 7, false),
  entities([
    row("regulation_status"),
    row("regulation_alarm"),
    row("brine_salinity"),
    row("regulation_consumption"),
    row("brine_daily_volume"),
    divider,
    // The monthly refractometer check: type the reading, record it
    row("regulation_measurement"),
    row("regulation_record"),
  ]),
  entities([
    row("brine_salinity_source"),
    row("regulation_target"),
    row("regulation_tolerance"),
    row("brine_concentration"),
    row("regulation_tank_volume"),
    row("regulation_tank_volume_used"),
    row("brine_max_rise"),
    row("brine_doses_per_day"),
    row("regulation_correction_days"),
    row("salinity_check_tolerance"),
  ]),
].map((item) => hidden_if(NOT_BRINE_MODE, item));

export const dialogs_regulation = {
  regulation_assisted: {
    name: "regulation_assisted",
    title_key: "${i18n._('regulation_assisted')} n°${config.id}",
    close_cross: true,
    content: [
      // Tests over the last 90 days (as far as the recorder keeps them)
      history("regulation_last_measurement", 24 * 90, true),
      entities([
        row("regulation_status"),
        row("regulation_last_measurement"),
        row("regulation_consumption"),
        row("regulation_proposed_dose"),
        row("daily_dose"),
        divider,
        row("regulation_measurement"),
        row("regulation_record"),
        divider,
        row("regulation_apply"),
        row("regulation_dismiss"),
      ]),
      entities([
        row("regulation_parameter"),
        row("regulation_target"),
        row("regulation_tolerance"),
        row("regulation_potency"),
        row("regulation_tank_volume"),
        row("regulation_tank_volume_used"),
        row("regulation_max_change"),
        row("regulation_correction_days"),
      ]),
    ],
  },
};
