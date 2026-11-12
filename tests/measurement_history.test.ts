/**
 * Test results of a ReefDose head typed in by hand: the editor, its dialog
 * and the actions it calls.
 */
import { describe, expect, it, vi } from "vitest";

import {
  ReefMeasurementHistory,
  from_local_input,
  to_local_input,
} from "../src/base/measurement_history";
import { run_action } from "../src/devices/actions";
import { LAST_MEASUREMENT } from "../src/devices/redsea/rsdose/measurement_history.dialog_func_ext";

const SENSOR = "sensor.doser_head_1_last_test_result";
const RESULTS = [
  {
    at: "2026-11-01T09:00:00+01:00",
    parameter: "kh",
    value: 8.0,
    source: "manual",
  },
  {
    at: "2026-11-08T09:00:00+01:00",
    parameter: "kh",
    value: 7.2,
    source: "redsea_kh",
    suspect: true,
  },
];

function makeHass(response: any = { ok: true }, results: any = RESULTS): any {
  return {
    language: "en",
    states: {
      [SENSOR]: {
        state: "7.2",
        attributes: { measurements: results, unit_of_measurement: "dKH" },
      },
    },
    entities: { [SENSOR]: { device_id: "head1" } },
    callWS: vi.fn().mockResolvedValue({ response }),
  };
}

async function makeView(
  hass: any = makeHass(),
): Promise<ReefMeasurementHistory> {
  const view = document.createElement(
    "reef-measurement-history",
  ) as ReefMeasurementHistory;
  view.entity_id = SENSOR;
  view.hass = hass;
  document.body.appendChild(view);
  await view.updateComplete;
  return view;
}

const $ = (view: ReefMeasurementHistory, selector: string) =>
  view.shadowRoot!.querySelector(selector) as any;
const $$ = (view: ReefMeasurementHistory, selector: string) =>
  Array.from(view.shadowRoot!.querySelectorAll(selector)) as any[];

describe("local date helpers", () => {
  it("round-trip a datetime-local value", () => {
    const value = to_local_input(new Date(2026, 10, 2, 7, 5));
    expect(value).toBe("2026-11-02T07:05");
    expect(from_local_input(value)).toBe("2026-11-02 07:05:00");
  });
});

describe("reef-measurement-history", () => {
  it("lists the results, newest first, suspect ones flagged", async () => {
    const view = await makeView();
    const rows = $$(view, ".row");
    expect(rows).toHaveLength(2);
    expect(rows[0].classList.contains("suspect")).toBe(true);
    expect(rows[0].textContent).toContain("7.2 dKH");
    expect(rows[0].textContent).toContain("redsea_kh");
    expect(rows[1].textContent).not.toContain("manual");
    expect(view.device_id()).toBe("head1");
    view.remove();
  });

  it("tells when there is no result", async () => {
    const hass = makeHass();
    hass.states[SENSOR].attributes = {};
    const view = await makeView(hass);
    expect($(view, ".empty")).toBeTruthy();
    view.remove();
  });

  it("redraws only when the results change", async () => {
    const view = await makeView();
    const spy = vi.spyOn(view, "requestUpdate");
    view.hass = makeHass();
    expect(spy).not.toHaveBeenCalled();
    view.hass = makeHass({ ok: true }, [RESULTS[0]]);
    expect(spy).toHaveBeenCalled();
    view.remove();
  });

  it("adds a result at a date", async () => {
    const hass = makeHass();
    const view = await makeView(hass);
    $(view, "#new-at").value = "2026-10-30T08:15";
    $(view, "#new-value").value = "8.4";
    $(view, ".add button").click();
    await vi.waitFor(() => expect(hass.callWS).toHaveBeenCalled());
    await view.updateComplete;
    expect(hass.callWS).toHaveBeenCalledWith({
      type: "call_service",
      domain: "redsea",
      service: "record_measurement",
      service_data: {
        device_id: "head1",
        value: 8.4,
        measured_at: "2026-10-30 08:15:00",
      },
      return_response: true,
    });
    expect($(view, "#new-value").value).toBe("");
    view.remove();
  });

  it("refuses an incomplete result", async () => {
    const hass = makeHass();
    const view = await makeView(hass);
    $(view, "#new-value").value = "";
    $(view, "#new-at").value = "";
    await view.add();
    expect(hass.callWS).not.toHaveBeenCalled();
    expect(view._error).toBeTruthy();
    view.remove();
  });

  it("shows the error of the integration", async () => {
    const hass = makeHass({ ok: false, error: "no kh measurement" });
    const view = await makeView(hass);
    $(view, "#new-value").value = "8";
    await view.add();
    await view.updateComplete;
    expect($(view, ".error").textContent).toContain("no kh measurement");
    // A rejected call too
    hass.callWS.mockRejectedValueOnce(new Error("socket closed"));
    expect(await view.call("delete_measurement", {})).toBe(false);
    expect(view._error).toBe("socket closed");
    view.remove();
  });

  it("cannot act without the device of the head", async () => {
    const hass = makeHass();
    hass.entities = {};
    const view = await makeView(hass);
    expect(await view.call("delete_measurement", {})).toBe(false);
    expect(hass.callWS).not.toHaveBeenCalled();
    view.remove();
  });

  it("corrects a result, its date only when changed", async () => {
    const hass = makeHass();
    const view = await makeView(hass);
    // The edit button of the newest one
    $$(view, ".row button")[0].click();
    await view.updateComplete;
    expect($(view, ".row.editing")).toBeTruthy();
    $(view, "#edit-value").value = "7.6";
    $(view, ".row.editing button").click();
    await vi.waitFor(() => expect(hass.callWS).toHaveBeenCalled());
    expect(hass.callWS.mock.calls[0][0].service_data).toEqual({
      device_id: "head1",
      measured_at: RESULTS[1]!.at,
      value: 7.6,
      parameter: "kh",
    });
    await view.updateComplete;
    expect(view._editing).toBe("");

    view._editing = RESULTS[1]!.at;
    await view.updateComplete;
    $(view, "#edit-at").value = "2026-11-07T21:00";
    await view.save(RESULTS[1]!);
    expect(hass.callWS.mock.calls[1][0].service_data.new_measured_at).toBe(
      "2026-11-07 21:00:00",
    );
    // Cancel
    view._editing = RESULTS[1]!.at;
    await view.updateComplete;
    $$(view, ".row.editing button")[1].click();
    expect(view._editing).toBe("");
    view.remove();
  });

  it("keeps editing when the correction is refused or incomplete", async () => {
    const hass = makeHass({ ok: false, error: "nope" });
    const view = await makeView(hass);
    view._editing = RESULTS[0]!.at;
    await view.updateComplete;
    await view.save({ at: RESULTS[0]!.at, value: 8 });
    expect(view._editing).toBe(RESULTS[0]!.at);
    expect(hass.callWS.mock.calls[0][0].service_data.parameter).toBeUndefined();
    $(view, "#edit-at").value = "";
    await view.save(RESULTS[0]!);
    expect(view._error).toBeTruthy();
    view.remove();
  });

  it("deletes on a second click", async () => {
    const hass = makeHass();
    const view = await makeView(hass);
    const del = () => $$(view, ".row button.delete")[0];
    del().click();
    await view.updateComplete;
    expect(hass.callWS).not.toHaveBeenCalled();
    expect(del().textContent).toContain("Delete?");
    del().click();
    await vi.waitFor(() => expect(hass.callWS).toHaveBeenCalled());
    expect(hass.callWS.mock.calls[0][0]).toMatchObject({
      service: "delete_measurement",
      service_data: { measured_at: RESULTS[1]!.at, parameter: "kh" },
    });
    await view.delete_entry({ at: "x", value: 1 });
    await view.delete_entry({ at: "x", value: 1 });
    expect(hass.callWS.mock.calls[1][0].service_data).toEqual({
      device_id: "head1",
      measured_at: "x",
    });
    view.remove();
  });

  it("prints a date it cannot format as is", async () => {
    const view = await makeView();
    const spy = vi
      .spyOn(Date.prototype, "toLocaleString")
      .mockImplementation(() => {
        throw new RangeError("bad locale");
      });
    expect((view as any)._when("2026-11-01")).toBe("2026-11-01");
    spy.mockRestore();
    view.remove();
  });
});

describe("regulation_history dialog", () => {
  function makeRoot(): any {
    const root = document.createElement("div");
    root.innerHTML = `<div id="dialog-content"></div>`;
    return root;
  }
  const device = {
    get_entity: (key: string) =>
      key === LAST_MEASUREMENT ? { entity_id: SENSOR } : null,
  };

  it("builds the editor once, then hands it the new hass", () => {
    const root = makeRoot();
    const hass = makeHass();
    run_action(
      "measurement_history_dialog_func_ext",
      "regulation_history",
      { device },
      hass,
      root,
    );
    const view = root.querySelector("reef-measurement-history") as any;
    expect(view.entity_id).toBe(SENSOR);
    const other = makeHass();
    run_action(
      "measurement_history_dialog_func_ext",
      "regulation_history",
      { device },
      other,
      root,
    );
    expect(root.querySelectorAll("reef-measurement-history")).toHaveLength(1);
    expect(view.hass).toBe(other);
  });

  it("draws nothing without the head or its sensor", () => {
    const root = makeRoot();
    run_action(
      "measurement_history_dialog_func_ext",
      "regulation_history",
      {},
      makeHass(),
      root,
    );
    run_action(
      "measurement_history_dialog_func_ext",
      "regulation_history",
      { device: { get_entity: () => null } },
      makeHass(),
      root,
    );
    expect(root.querySelector("reef-measurement-history")).toBeNull();
  });
});

describe("reef-measurement-history answers", () => {
  it("reads an answer without response, an error without text", async () => {
    const hass = makeHass();
    const view = await makeView(hass);
    hass.callWS.mockResolvedValueOnce({});
    expect(await view.call("delete_measurement", {})).toBe(true);
    hass.callWS.mockResolvedValueOnce({ response: { ok: false } });
    expect(await view.call("delete_measurement", {})).toBe(false);
    expect(view._error).toBe("");
    hass.callWS.mockRejectedValueOnce("boom");
    expect(await view.call("delete_measurement", {})).toBe(false);
    expect(view._error).toBe("boom");
    view.remove();
  });
});

describe("custom elements", () => {
  it("are defined once, whatever the imports", async () => {
    vi.resetModules();
    await import("../src/base/measurement_history");
    await import("../src/base/reef_alarms");
    await import("../src/base/reef_parameters");
    expect(customElements.get("reef-measurement-history")).toBeTruthy();
    expect(customElements.get("reef-alarms")).toBeTruthy();
    expect(customElements.get("reef-alarms-card")).toBeTruthy();
    expect(customElements.get("reef-parameters-card")).toBeTruthy();
  });
});
