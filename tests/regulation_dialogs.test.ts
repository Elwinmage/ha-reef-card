// Dialogs of the dose regulation of a ReefDose head

import { existsSync } from "fs";
import { describe, expect, it } from "vitest";
import { SUPPLEMENTS } from "../src/devices/redsea/rsdose/supplements_list";
import { MyElement } from "../src/base/element";
import { SafeEval } from "../src/utils/SafeEval";
import { dialogs_rsdose } from "../src/devices/redsea/rsdose/rsdose.dialogs";
import {
  brine_content,
  dialogs_regulation,
  regulation_content,
  schedule_content,
} from "../src/devices/redsea/rsdose/regulation.dialogs";
import de from "../src/translations/locales/de.json";
import en from "../src/translations/locales/en.json";
import es from "../src/translations/locales/es.json";
import fr from "../src/translations/locales/fr.json";
import it_ from "../src/translations/locales/it.json";
import pl from "../src/translations/locales/pl.json";
import pt from "../src/translations/locales/pt.json";

// Translation keys of the head entities the integration builds for the
// regulation (dose_regulation_entities.py), plus the head's daily dose
const BACKEND_KEYS = new Set([
  "regulation_mode",
  "regulation_parameter",
  "brine_salinity_source",
  "regulation_target",
  "regulation_potency",
  "regulation_tolerance",
  "regulation_tank_volume",
  "regulation_max_change",
  "regulation_correction_days",
  "brine_concentration",
  "brine_max_rise",
  "brine_doses_per_day",
  "salinity_check_tolerance",
  "regulation_measurement",
  "regulation_record",
  "regulation_apply",
  "regulation_dismiss",
  "regulation_status",
  "regulation_proposed_dose",
  "regulation_consumption",
  "regulation_last_measurement",
  "regulation_tank_volume_used",
  "brine_salinity",
  "brine_daily_volume",
  "regulation_alarm",
  "daily_dose",
  "schedule_enabled",
]);

/** Evaluate a `disabled_if` with the head's regulation mode (null: none). */
function disabled(mode: string | null, condition: string): boolean {
  const device = {
    entities: { regulation_mode: { entity_id: "select.mode" } },
  };
  const hass = {
    states:
      mode === null ? {} : { "select.mode": { state: mode, attributes: {} } },
  };
  return new SafeEval({
    entity: MyElement.createEntitiesContext(device, hass),
  } as any).evaluateCondition(condition);
}

/** Every entity key a dialog refers to, through its cards and charts. */
function entity_keys(dialog: any): string[] {
  const keys: string[] = [];
  for (const content of dialog.content ?? dialog) {
    for (const row of content.conf?.entities ?? []) {
      if (row.type === "divider") continue;
      keys.push(typeof row === "string" ? row : row.entity);
    }
  }
  return keys;
}

/** Dialogs a dialog's buttons open. */
function opened(dialog: any): string[] {
  return dialog.content
    .filter((c: any) => c.view === "common-button")
    .map((c: any) => c.conf.tap_action.data.type);
}

describe("regulation dialogs", () => {
  it("are part of the doser's dialogs", () => {
    for (const name of Object.keys(dialogs_regulation)) {
      expect(dialogs_rsdose).toHaveProperty(name);
      expect((dialogs_rsdose as any)[name].name).toBe(name);
    }
  });

  it("are reached from the head configuration", () => {
    expect(opened(dialogs_rsdose.head_configuration)).toEqual([
      "priming",
      "head_calibration",
      "regulation_assisted",
    ]);
    const head = dialogs_rsdose.head_configuration.content;
    for (const item of [
      ...regulation_content,
      ...schedule_content,
      ...brine_content,
    ]) {
      expect(head).toContain(item);
    }
  });

  it("only use entities the integration builds", () => {
    for (const dialog of [
      ...Object.values(dialogs_regulation),
      regulation_content,
      schedule_content.slice(0, 1),
      brine_content,
    ]) {
      const keys = entity_keys(dialog);
      expect(keys.length).toBeGreaterThan(0);
      for (const key of keys) {
        expect(BACKEND_KEYS.has(key), `${dialog.name}: ${key}`).toBe(true);
      }
    }
  });

  it("chart a reading of each mode", () => {
    const charts = (name: string) =>
      (dialogs_regulation as any)[name].content
        .filter((c: any) => c.view === "history-chart")
        .map((c: any) => [c.conf.entities[0].entity, c.conf.step]);
    expect(charts("regulation_assisted")).toEqual([
      ["regulation_last_measurement", true],
    ]);
    expect(
      brine_content
        .filter((c: any) => c.view === "history-chart")
        .map((c: any) => [c.conf.entities[0].entity, c.conf.step]),
    ).toEqual([["brine_salinity", false]]);
  });

  it("are translated in every language", () => {
    for (const locale of [de, en, es, fr, it_, pl, pt]) {
      for (const key of ["regulation_assisted"]) {
        expect((locale as Record<string, string>)[key]).toBeTruthy();
      }
    }
  });

  it("show assisted dosing in assisted mode only", () => {
    const assisted = regulation_content.find(
      (c: any) => c.view === "common-button",
    ) as any;
    expect(assisted.conf.tap_action.data.overload_quit).toBe(
      "head_configuration",
    );
    const hidden = (mode: string | null) =>
      disabled(mode, assisted.conf.disabled_if);
    expect(hidden("assisted")).toBe(false);
    expect(hidden("brine")).toBe(true);
    expect(hidden("off")).toBe(true);
    // Entity not there (older integration): nothing to open
    expect(hidden(null)).toBe(true);
    // Hidden without leaving a line break behind
    expect(assisted.conf.no_br_if_disabled).toBe(true);
  });

  it("swap the schedule for the brine in brine mode", () => {
    const shown = (mode: string | null, items: any[]) =>
      items.map((item) => !disabled(mode, item.disabled_if));
    for (const mode of ["off", "assisted", null]) {
      expect(shown(mode, schedule_content).every(Boolean)).toBe(true);
      expect(shown(mode, brine_content).some(Boolean)).toBe(false);
    }
    expect(shown("brine", schedule_content).some(Boolean)).toBe(false);
    expect(shown("brine", brine_content).every(Boolean)).toBe(true);
    // The mode itself is always there
    expect(shown("brine", regulation_content.slice(0, 1))).toEqual([true]);
    // The schedule editor is the head's own extension
    expect(schedule_content[1]).toMatchObject({
      view: "extend",
      extend: "dose_head_dialog_func_ext",
    });
  });

  it("hide their charts while there is nothing to draw", () => {
    const charts = [
      ...dialogs_regulation.regulation_assisted.content,
      ...brine_content,
    ].filter((c: any) => c.view === "history-chart") as any[];
    expect(charts).toHaveLength(2);
    for (const chart of charts) {
      expect(chart.conf.hide_empty).toBe(true);
    }
  });

  it("offer the brine supplement, with its own bottle", () => {
    const uid = "b99739a8-bced-420e-bbdb-86ccd14524fd";
    const brine = SUPPLEMENTS.find((s) => s.uid === uid);
    expect(brine?.fullname).toBe("DIY - Brine");
    expect(brine?.made_by_redsea).toBe(false);
    expect(existsSync(`public/img/supplements/${uid}.supplement.png`)).toBe(
      true,
    );
  });
});
