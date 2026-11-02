/**
 * Dose history of a ReefDose head: its view, its dialog and the button of
 * the head configuration dialog.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LAST_DOSE, RSDoseHistory } from "../src/base/dose_history";
import { format_day, format_time } from "../src/base/messages_format";
import { run_action } from "../src/devices/actions";
import {
  DOSE_HISTORY_HIDDEN,
  dialogs_rsdose,
} from "../src/devices/redsea/rsdose/rsdose.dialogs";
import i18n from "../src/translations/myi18n.js";
import { SafeEval } from "../src/utils/SafeEval";

const SENSOR = "sensor.doser_head_2_last_dose";
const DOSES = [
  {
    head: 2,
    supplement: "KH/Alkalinity (Foundation B)",
    dose_type: "scheduled",
    volume: 12.487,
    started_at: "2026-10-30T10:28:45+01:00",
    ended_at: "2026-10-30T10:29:04+01:00",
    duration_s: 19,
  },
  {
    head: 2,
    supplement: "KH/Alkalinity (Foundation B)",
    dose_type: "manual",
    volume: 1.03,
    started_at: null,
    ended_at: "2026-10-30T09:15:19+01:00",
    duration_s: null,
  },
  {
    head: 2,
    dose_type: "scheduled",
    volume: null,
    started_at: "2026-10-29T22:00:00+01:00",
    ended_at: "2026-10-29T22:00:19+01:00",
    duration_s: 19,
    // Not in the queue: from the flow of the head
    start_estimated: true,
  },
];

function makeDevice(): any {
  return {
    config: { id: 2 },
    entities: { [LAST_DOSE]: { entity_id: SENSOR, device_id: "head_2" } },
  };
}

function makeHass(
  answer: any = { response: { doses: DOSES, retention_days: 30 } },
  state = "2026-10-30T09:29:04+00:00",
): any {
  return {
    language: "fr",
    locale: { language: "fr" },
    states: { [SENSOR]: { entity_id: SENSOR, state, attributes: {} } },
    entities: { [SENSOR]: { entity_id: SENSOR, device_id: "head_2_registry" } },
    callWS: vi.fn(async () => answer),
  };
}

async function settle(view?: RSDoseHistory): Promise<void> {
  for (let i = 0; i < 5; i++) await Promise.resolve();
  if (view) await view.updateComplete;
}

function view_of(hass: any, device: any = makeDevice()): RSDoseHistory {
  const view = document.createElement("redsea-dose-history") as RSDoseHistory;
  view.device = device;
  view.head = 2;
  document.body.appendChild(view);
  view.hass = hass;
  return view;
}

describe("dose history formats", () => {
  it("formats a time and a day", () => {
    const hass = { locale: { language: "en" } };
    expect(format_time("2026-10-30T09:29:04Z", hass)).toMatch(/\d\d:\d\d:\d\d/);
    expect(format_day("2026-10-30T09:29:04Z", hass)).toMatch(/30/);
    expect(format_time("junk", hass)).toBe("");
    expect(format_day(null, hass)).toBe("");
  });

  it("falls back when the locale is invalid", () => {
    const hass = { locale: { language: "!!" } };
    expect(format_time("2026-10-30T09:29:04Z", hass)).toBe("09:29:04");
    expect(format_day("2026-10-30T09:29:04Z", hass)).toBe("2026-10-30");
  });
});

describe("RSDoseHistory", () => {
  let views: RSDoseHistory[] = [];
  beforeEach(() => {
    views = [];
  });
  afterEach(() => {
    for (const v of views) v.remove();
  });

  it("asks the doses of the head and shows them by day", async () => {
    const hass = makeHass();
    const view = view_of(hass);
    views.push(view);
    await settle(view);
    expect(hass.callWS).toHaveBeenCalledWith({
      type: "call_service",
      domain: "redsea",
      service: "get_doses",
      service_data: { device_id: "head_2_registry", head: 2, days: 7 },
      return_response: true,
    });
    const root = view.shadowRoot!;
    expect(root.querySelectorAll(".day").length).toBe(2);
    const doses = root.querySelectorAll(".dose");
    expect(doses.length).toBe(3);
    expect(doses[0].querySelector(".volume")?.textContent).toBe("12.49 mL");
    expect(doses[0].textContent).toMatch(/→/);
    expect(doses[0].querySelector(".detail")?.textContent).toMatch(/19 s/);
    // A manual dose from the app has no start
    expect(doses[1].classList.contains("manual")).toBe(true);
    expect(doses[1].textContent).not.toMatch(/→/);
    expect(doses[2].querySelector(".volume")?.textContent).toBe("–");
    // An estimated start and duration are marked
    expect(doses[0].textContent).not.toMatch(/≈/);
    expect(doses[0].querySelector("time")?.getAttribute("title")).toBe("");
    expect(doses[2].querySelector(".when")?.textContent).toMatch(/≈/);
    expect(doses[2].querySelector(".detail")?.textContent).toMatch(/≈ 19 s/);
    expect(doses[2].querySelector("time")?.getAttribute("title")).toBe(
      i18n._("dose_history_estimated"),
    );
    expect(root.querySelector(".summary")?.textContent).toMatch(/13\.52/);
    expect(root.querySelector(".footer")?.textContent).toMatch(/3/);
    expect(root.querySelector(".footer")?.textContent).toMatch(/30/);
  });

  it("reloads on a new dose only, and on a period change", async () => {
    const hass = makeHass();
    const view = view_of(hass);
    views.push(view);
    await settle(view);
    view.hass = hass;
    expect(hass.callWS).toHaveBeenCalledTimes(1);
    view.hass = makeHass(undefined, "2026-10-30T11:00:00+00:00");
    await settle(view);
    const select = view.shadowRoot!.querySelector(
      "select",
    ) as HTMLSelectElement;
    select.value = "0";
    select.dispatchEvent(new Event("change"));
    await settle(view);
    const last = (view.hass.callWS as any).mock.calls.at(-1)[0];
    expect(last.service_data).toEqual({
      device_id: "head_2_registry",
      head: 2,
    });
    // The same period again, or junk: nothing
    select.dispatchEvent(new Event("change"));
    (view as any)._set_period({ target: { value: "x" } });
    expect((view.hass.callWS as any).mock.calls.length).toBe(2);
    // The refresh button
    (view.shadowRoot!.querySelector(".refresh") as HTMLButtonElement).click();
    await settle(view);
    expect((view.hass.callWS as any).mock.calls.length).toBe(3);
    // The labels of the periods
    expect((view as any)._period_label(1)).toBeTruthy();
    expect((view as any)._period_label(31)).toMatch(/31/);
  });

  it("names a compensation dose", async () => {
    // The rest of a lowered daily dose, offered by the app (spy 2026-11-01)
    const compensation = {
      head: 2,
      dose_type: "compensation",
      volume: 0.072727,
      started_at: null,
      ended_at: "2026-11-01T22:39:37+01:00",
      duration_s: null,
    };
    const view = view_of(
      makeHass({ response: { doses: [compensation], retention_days: 30 } }),
    );
    views.push(view);
    await settle(view);
    const dose = view.shadowRoot!.querySelector(".dose")!;
    expect(dose.querySelector(".detail")?.textContent).toMatch(
      i18n._("dose_history_compensation"),
    );
    expect(dose.classList.contains("scheduled")).toBe(true);
  });

  it("tells when there is nothing, or an error", async () => {
    const empty = view_of(makeHass({ response: { doses: "junk" } }));
    views.push(empty);
    await settle(empty);
    expect(empty.shadowRoot!.querySelector(".empty")).not.toBeNull();
    expect(empty.retention).toBeNull();

    // No answer at all
    const silent = view_of(makeHass());
    await settle(silent);
    (silent.hass.callWS as any).mockResolvedValue(undefined);
    await silent.load();
    expect(silent.entries).toEqual([]);
    silent.remove();

    const refused = view_of(
      makeHass({ response: { error: "Unknown device" } }),
    );
    views.push(refused);
    await settle(refused);
    expect(refused.shadowRoot!.querySelector(".error")?.textContent).toBe(
      "Unknown device",
    );

    const hass = makeHass();
    hass.callWS = vi.fn(async () => {
      throw new Error("lost");
    });
    const failing = view_of(hass);
    views.push(failing);
    await settle(failing);
    expect(failing.error).toBe("lost");
    hass.callWS = vi.fn(async () => {
      throw "plain";
    });
    await failing.load();
    expect(failing.error).toBe("plain");

    // No sensor, no device: unavailable
    const lost = view_of(makeHass(), { config: { id: 1 }, entities: {} });
    views.push(lost);
    await settle(lost);
    expect(lost.error).toBeTruthy();
    const no_ws = view_of({ states: {} });
    views.push(no_ws);
    await settle(no_ws);
    expect(no_ws.error).toBeTruthy();
    // The device id of the registry entry when the entity is not loaded
    const hass2 = makeHass();
    hass2.entities = {};
    const fallback = view_of(hass2);
    views.push(fallback);
    await settle(fallback);
    expect(hass2.callWS.mock.calls[0][0].service_data.device_id).toBe("head_2");
    // Head 0: every head
    const all = makeHass();
    const every = document.createElement(
      "redsea-dose-history",
    ) as RSDoseHistory;
    every.device = makeDevice();
    every.hass = all;
    await settle();
    expect(all.callWS.mock.calls[0][0].service_data.head).toBeUndefined();
  });

  it("drops an answer older than the last request", async () => {
    let release: (v: any) => void = () => {};
    const hass = makeHass();
    hass.callWS = vi
      .fn()
      .mockImplementationOnce(() => new Promise((r) => (release = r)))
      .mockImplementation(async () => ({ response: { doses: [] } }));
    const view = view_of(hass);
    views.push(view);
    await view.load();
    release({ response: { doses: DOSES } });
    await settle(view);
    expect(view.entries).toEqual([]);
  });

  it("drops a failure older than the last request", async () => {
    let fail: (e: any) => void = () => {};
    const hass = makeHass();
    hass.callWS = vi
      .fn()
      .mockImplementationOnce(() => new Promise((_r, j) => (fail = j)))
      .mockImplementation(async () => ({ response: { doses: [] } }));
    const view = view_of(hass);
    views.push(view);
    await view.load();
    fail(new Error("late"));
    await settle(view);
    expect(view.error).toBe("");
  });
});

describe("dose_history dialog", () => {
  it("is a dialog of the doser, opened from the head configuration", () => {
    const d = (dialogs_rsdose as any).dose_history;
    expect(d.content[0]).toMatchObject({
      view: "extend",
      extend: "dose_history_dialog_func_ext",
      re_render: true,
    });
    const button = (dialogs_rsdose as any).head_configuration.content.find(
      (c: any) => c.conf?.tap_action?.data?.type === "dose_history",
    );
    expect(button.disabled_if).toBe(DOSE_HISTORY_HIDDEN);
    expect(button.conf.tap_action.data.overload_quit).toBe(
      "head_configuration",
    );
  });

  it("is only shown while the last dose sensor is available", () => {
    const hidden = (entity: any) =>
      new SafeEval({ entity } as any).evaluateCondition(DOSE_HISTORY_HIDDEN);
    expect(hidden({})).toBe(true);
    expect(hidden({ poseidon_last_dose: { state: "unavailable" } })).toBe(true);
    expect(hidden({ poseidon_last_dose: { state: "unknown" } })).toBe(false);
    expect(
      hidden({ poseidon_last_dose: { state: "2026-10-30T09:29:04+00:00" } }),
    ).toBe(false);
  });

  it("builds the view once, then hands it the new hass", () => {
    const root = document.createElement("div").attachShadow({ mode: "open" });
    root.innerHTML = '<div id="dialog-content"></div>';
    const device = makeDevice();
    run_action(
      "dose_history_dialog_func_ext",
      "dose_history",
      { device },
      makeHass(),
      root,
    );
    const view = root.querySelector("#dose-head-history") as RSDoseHistory;
    expect(view).toBeInstanceOf(RSDoseHistory);
    expect(view.head).toBe(2);
    const next = makeHass();
    run_action(
      "dose_history_dialog_func_ext",
      "dose_history",
      { device },
      next,
      root,
    );
    expect(root.querySelectorAll("#dose-head-history").length).toBe(1);
    expect(view.hass).toBe(next);
    // Nothing to fill
    run_action("dose_history_dialog_func_ext", "dose_history", {}, next, root);
    run_action(
      "dose_history_dialog_func_ext",
      "dose_history",
      { device },
      next,
      null,
    );
    // No head number known: every head
    const root2 = document.createElement("div").attachShadow({ mode: "open" });
    root2.innerHTML = '<div id="dialog-content"></div>';
    run_action(
      "dose_history_dialog_func_ext",
      "dose_history",
      { device: { entities: {} } },
      next,
      root2,
    );
    expect(
      (root2.querySelector("#dose-head-history") as RSDoseHistory).head,
    ).toBe(0);
  });
});
