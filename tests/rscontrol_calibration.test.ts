// Calibration workflows of the ReefControl probes (EC, pH) and their dialogs

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  call,
  EC_RANGE,
  find_entry,
  find_probe,
  is_open,
  leave,
  parse_ec_value,
  PH_SOLUTIONS,
  probe_calibration_ec,
  probe_calibration_ph,
  result_text,
  run_point,
  set_message,
  show_progress,
  solution_label,
  timing,
} from "../src/devices/redsea/rscontrol/rscontrol.dialog_func_ext";
import {
  CALIBRATION_IMAGES,
  dialogs_rscontrol,
} from "../src/devices/redsea/rscontrol/rscontrol.dialogs";
import { actionRegistry } from "../src/devices/actions";
import i18n from "../src/translations/myi18n.js";

/** Answers of the hub per step; `status` is a queue. */
function makeHass(script: Record<string, any> = {}) {
  const statuses: any[] = [
    ...(script.status ?? [{ calibration_status: "success" }]),
  ];
  const callWS = vi.fn(async (msg: any) => {
    const action = msg.service_data.action;
    if (action === "status") {
      const json = statuses.length > 1 ? statuses.shift() : statuses[0];
      return { response: { ok: true, json } };
    }
    return { response: { ok: script[action] ?? true } };
  });
  return { callWS };
}

function actions(hass: any): string[] {
  return hass.callWS.mock.calls.map((c: any[]) => c[0].service_data.action);
}

function makeRoot() {
  const host = document.createElement("div");
  host.innerHTML =
    '<div id="window-mask" style="display:flex"><div id="dialog-content"></div></div>';
  document.body.appendChild(host);
  return host;
}

function makeElt(type = "ec", uid = "0x2") {
  const hub = { device: { elements: [{ primary_config_entry: "entry1" }] } };
  const probe = { probe_type: type, probe_uid: uid, device: hub };
  return { device: probe };
}

async function flush(times = 20) {
  for (let i = 0; i < times; i++) await new Promise((r) => setTimeout(r, 0));
}

function message(root: any): string {
  return root.querySelector(".calibration_message").textContent;
}

// The real wait, before the tests replace it
const real_sleep = timing.sleep;

beforeEach(() => {
  timing.sleep = async () => {};
  timing.max_ms = 10 * 60 * 1000;
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("helpers", () => {
  it("finds the probe and the hub config entry", () => {
    const elt = makeElt();
    expect(find_probe(elt).probe_uid).toBe("0x2");
    expect(find_entry(elt)).toBe("entry1");
    expect(find_probe({ device: {} })).toBeNull();
    expect(find_entry({ device: {} })).toBeNull();
  });

  it("reads an EC solution value", () => {
    expect(parse_ec_value("53.1")).toBe(53.1);
    expect(parse_ec_value(" 53,1 ")).toBe(53.1);
    expect(parse_ec_value(String(EC_RANGE.min))).toBe(20);
    expect(parse_ec_value("19.9")).toBeNull();
    expect(parse_ec_value("53.12")).toBeNull();
    expect(parse_ec_value("abc")).toBeNull();
    expect(parse_ec_value(undefined as any)).toBeNull();
  });

  it("labels a pH solution and tells how a calibration ended", () => {
    expect(solution_label(PH_SOLUTIONS.MID![1]!)).toBe("7.01 (25 °C)");
    expect(result_text("success")).toBe(i18n._("calibration_success"));
    expect(result_text("fail_stability")).toBe(
      i18n._("calibration_fail_stability"),
    );
    expect(result_text("fail_check_solution")).toBe(
      i18n._("calibration_fail_check_solution"),
    );
    expect(result_text("fail_value_error")).toBe(
      i18n._("calibration_fail_value"),
    );
    expect(result_text("fail_process")).toBe(i18n._("calibration_fail"));
  });

  it("calls the integration service", async () => {
    const hass = makeHass();
    const session: any = { hass, entry: "entry1", type: "ph", uid: "0x1" };
    expect(await call(session, "point", { point: "MID" })).toEqual({
      ok: true,
    });
    expect(hass.callWS).toHaveBeenCalledWith({
      type: "call_service",
      domain: "redsea",
      service: "probe_calibration",
      service_data: {
        device_id: "entry1",
        probe_type: "ph",
        probe_uid: "0x1",
        action: "point",
        point: "MID",
      },
      return_response: true,
    });
    session.hass = { callWS: vi.fn(async () => ({})) };
    expect(await call(session, "status")).toBeNull();
    session.hass = {
      callWS: vi.fn(async () => {
        throw new Error("down");
      }),
    };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await call(session, "status")).toBeNull();
    warn.mockRestore();
  });

  it("knows whether the dialog is still open", () => {
    const root = makeRoot();
    const wrapper = document.createElement("div");
    root.querySelector("#dialog-content")!.appendChild(wrapper);
    const session: any = { wrapper, shadowRoot: root };
    expect(is_open(session)).toBe(true);
    (root.querySelector("#window-mask") as HTMLElement).style.display = "none";
    expect(is_open(session)).toBe(false);
    session.shadowRoot = null;
    expect(is_open(session)).toBe(true);
    wrapper.remove();
    expect(is_open(session)).toBe(false);
  });

  it("shows the progress, and tolerates a missing message box", () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML =
      '<progress max="100"></progress><div class="calibration_message"></div>';
    const session: any = { wrapper };
    show_progress(session, { stability_progress: "65.4", time_left: 42.2 });
    expect((wrapper.querySelector("progress") as any).value).toBe(65.4);
    expect(wrapper.textContent).toBe(
      i18n._("calibration_progress", { progress: 65, time: 42 }),
    );
    show_progress(session, {});
    expect((wrapper.querySelector("progress") as any).value).toBe(0);
    show_progress({ wrapper: document.createElement("div") } as any, null);
    set_message({ wrapper: document.createElement("div") } as any, "x");
  });

  it("waits between two polls", async () => {
    vi.useFakeTimers();
    let done = false;
    const wait = real_sleep(timing.poll_ms).then(() => (done = true));
    vi.advanceTimersByTime(timing.poll_ms - 1);
    await Promise.resolve();
    expect(done).toBe(false);
    vi.advanceTimersByTime(1);
    await wait;
    expect(done).toBe(true);
    vi.useRealTimers();
  });

  it("leaves only when entered", async () => {
    const hass = makeHass();
    const session: any = { hass, entered: false };
    await leave(session);
    expect(hass.callWS).not.toHaveBeenCalled();
    session.entered = true;
    await leave(session);
    expect(actions(hass)).toEqual(["exit"]);
    expect(session.entered).toBe(false);
  });
});

describe("run_point", () => {
  function session(hass: any, root = makeRoot()): any {
    const wrapper = document.createElement("div");
    root.querySelector("#dialog-content")!.appendChild(wrapper);
    return {
      hass,
      entry: "e",
      type: "ph",
      uid: "0x1",
      entered: false,
      wrapper,
      shadowRoot: root,
    };
  }

  it("enters once, starts the point and follows it to the end", async () => {
    const hass = makeHass({
      status: [
        {
          calibration_status: "in_progress",
          time_left: 30,
          stability_progress: "40",
        },
        { calibration_status: "success" },
      ],
    });
    const s = session(hass);
    expect(await run_point(s, "MID", 7, 25)).toBe("success");
    expect(actions(hass)).toEqual(["enter", "point", "status", "status"]);
    expect(hass.callWS.mock.calls[1][0].service_data).toMatchObject({
      point: "MID",
      solution_value: 7,
      solution_rated_temp: 25,
    });
    // Already in calibration mode for the next point
    await run_point(s, "HIGH", 10);
    expect(actions(hass).filter((a) => a === "enter")).toHaveLength(1);
    expect(hass.callWS.mock.calls.at(-2)[0].service_data).not.toHaveProperty(
      "solution_rated_temp",
    );
  });

  it("reports a failed step or status", async () => {
    expect(await run_point(session(makeHass({ enter: false })), "MID", 7)).toBe(
      "fail_process",
    );
    expect(await run_point(session(makeHass({ point: false })), "MID", 7)).toBe(
      "fail_process",
    );
    const failing = makeHass({
      status: [{ calibration_status: "fail_stability" }],
    });
    expect(await run_point(session(failing), "MID", 7)).toBe("fail_stability");
  });

  it("gives up after too long", async () => {
    timing.max_ms = -1;
    // No answer to the status at all
    const hass = {
      callWS: vi.fn(async (msg: any) =>
        msg.service_data.action === "status" ? {} : { response: { ok: true } },
      ),
    };
    expect(await run_point(session(hass), "MID", 7)).toBe("fail_process");
  });

  it("leaves calibration when the dialog is closed", async () => {
    const root = makeRoot();
    const hass = makeHass();
    (root.querySelector("#window-mask") as HTMLElement).style.display = "none";
    expect(await run_point(session(hass, root), "MID", 7)).toBe("cancelled");
    expect(actions(hass)).toEqual(["enter", "point", "exit"]);
  });
});

describe("EC dialog", () => {
  it("does nothing without a dialog or a probe", () => {
    probe_calibration_ec(makeElt(), makeHass(), document.createElement("div"));
    const root = makeRoot();
    probe_calibration_ec({ device: {} }, makeHass(), root);
    expect(root.querySelector("#probe-calibration")).toBeNull();
  });

  it("calibrates the solution typed in", async () => {
    const root = makeRoot();
    const hass = makeHass();
    probe_calibration_ec(makeElt(), hass, root);
    // Re-rendered on each hass update: built once, fresh hass handed down
    const fresh = makeHass();
    probe_calibration_ec(makeElt(), fresh, root);
    expect(root.querySelectorAll("#probe-calibration")).toHaveLength(1);

    const input = root.querySelector(
      "#calibration_ec_value",
    ) as HTMLInputElement;
    const validate = root.querySelector(
      "#calibration_ec_validate",
    ) as HTMLButtonElement;
    input.value = "5";
    validate.click();
    await flush();
    expect(message(root)).toBe(i18n._("calibration_ec_range"));
    expect(fresh.callWS).not.toHaveBeenCalled();

    input.value = "53.1";
    validate.click();
    await flush();
    expect(actions(fresh)).toEqual(["enter", "point", "status", "exit"]);
    expect(fresh.callWS.mock.calls[1][0].service_data).toMatchObject({
      probe_type: "ec",
      point: "MID",
      solution_value: 53.1,
    });
    expect(message(root)).toBe(i18n._("calibration_success"));
    expect(input.disabled).toBe(false);
  });

  it("shows a failure, and stops quietly when closed", async () => {
    const root = makeRoot();
    const hass = makeHass({
      status: [{ calibration_status: "fail_value_error" }],
    });
    probe_calibration_ec(makeElt(), hass, root);
    const input = root.querySelector(
      "#calibration_ec_value",
    ) as HTMLInputElement;
    input.value = "53.1";
    (root.querySelector("#calibration_ec_validate") as HTMLElement).click();
    await flush();
    expect(message(root)).toBe(i18n._("calibration_fail_value"));

    (root.querySelector("#window-mask") as HTMLElement).style.display = "none";
    (root.querySelector("#calibration_ec_validate") as HTMLElement).click();
    await flush();
    expect(message(root)).toBe(i18n._("calibration_running"));
  });
});

describe("pH dialog", () => {
  function open(hass: any) {
    const root = makeRoot();
    probe_calibration_ph(makeElt("ph", "0x1"), hass, root);
    const $ = (id: string) => root.querySelector("#" + id) as any;
    return { root, $ };
  }

  it("calibrates pH 7 then pH 10", async () => {
    const hass = makeHass();
    const { root, $ } = open(hass);
    expect($("calibration_ph_step2").hidden).toBe(true);
    $("calibration_ph_mid").value = "1";
    $("calibration_ph_start1").click();
    await flush();
    expect($("calibration_ph_step1").hidden).toBe(true);
    expect($("calibration_ph_step2").hidden).toBe(false);
    expect(message(root)).toBe(i18n._("calibration_ph_rinse"));
    expect(hass.callWS.mock.calls[1][0].service_data).toMatchObject({
      point: "MID",
      solution_value: 7.01,
      solution_rated_temp: 25,
    });

    $("calibration_ph_second").value = "4";
    $("calibration_ph_start2").click();
    await flush();
    expect(hass.callWS.mock.calls.at(-3)[0].service_data).toMatchObject({
      point: "HIGH",
      solution_value: 9.18,
    });
    expect(actions(hass).at(-1)).toBe("exit");
    expect(message(root)).toBe(i18n._("calibration_success"));
  });

  it("offers pH 4 for fresh water", async () => {
    const hass = makeHass();
    const { $ } = open(hass);
    $("calibration_ph_start1").click();
    await flush();
    $("calibration_ph_point").value = "LOW";
    $("calibration_ph_point").dispatchEvent(new Event("change"));
    expect($("calibration_ph_second").options).toHaveLength(
      PH_SOLUTIONS.LOW!.length,
    );
    $("calibration_ph_start2").click();
    await flush();
    expect(hass.callWS.mock.calls.at(-3)[0].service_data).toMatchObject({
      point: "LOW",
      solution_value: 4,
    });
  });

  it("finishes after one point", async () => {
    const hass = makeHass();
    const { root, $ } = open(hass);
    $("calibration_ph_start1").click();
    await flush();
    $("calibration_ph_finish").click();
    await flush();
    expect(actions(hass).at(-1)).toBe("exit");
    expect($("calibration_ph_step2").hidden).toBe(true);
    expect(message(root)).toBe(i18n._("calibration_success"));
  });

  it("lets a failed point be started again, and stops when closed", async () => {
    const hass = makeHass({
      status: [{ calibration_status: "fail_check_solution" }],
    });
    const { root, $ } = open(hass);
    $("calibration_ph_start1").click();
    await flush();
    expect(message(root)).toBe(i18n._("calibration_fail_check_solution"));
    expect($("calibration_ph_start1").disabled).toBe(false);
    expect($("calibration_ph_step1").hidden).toBe(false);

    (root.querySelector("#window-mask") as HTMLElement).style.display = "none";
    $("calibration_ph_start1").click();
    await flush();
    expect(message(root)).toBe(i18n._("calibration_running"));
  });
});

describe("dialogs", () => {
  const dialogs: any = dialogs_rscontrol;

  it("shows the calibration of the probe's own type", () => {
    const buttons = dialogs.probe_conf.content.filter(
      (c: any) => c.view === "common-button",
    );
    expect(buttons.map((b: any) => b.conf.tap_action.data.type)).toEqual([
      "probe_calibration_ph",
      "probe_calibration_ec",
      "probe_calibration_orp",
      "probe_calibration_temperature",
      "probe_calibration_temp",
    ]);
    expect(buttons[0].conf.disabled_if).toContain("!entity.probe_ph_value");
    expect(buttons[0].conf.label).toBe("${i18n._('probe_calibrate')}");
    expect(buttons[0].conf.tap_action.data.overload_quit).toBe("probe_conf");
    expect(buttons[4].conf.disabled_if).toContain(
      "!entity.probe_temp_calibration",
    );
    expect(buttons[4].conf.label).toBe(
      "${i18n._('probe_calibrate_temperature')}",
    );
  });

  it("describes each calibration with its picture", () => {
    for (const type of ["ph", "ec", "orp"]) {
      const dialog = dialogs[`probe_calibration_${type}`];
      expect(dialog.name).toBe(`probe_calibration_${type}`);
      expect(dialog.content[0].conf.image).toBe(CALIBRATION_IMAGES[type]);
      expect(CALIBRATION_IMAGES[type]).toContain(
        `img/redsea/RSSENSE/${type}_calibration.png`,
      );
      expect(dialog.content[1].value).toContain("calibration_dip_probe");
    }
    expect(
      dialogs.probe_calibration_orp.content[2].conf.entities[0].entity,
    ).toBe("probe_orp_calibration");
    expect(dialogs.probe_calibration_ec.content[2].extend).toBe(
      "rscontrol_dialog_func_ext",
    );
  });

  it("calibrates a temperature by its real value, without a picture", () => {
    for (const [name, entity] of [
      ["temperature", "probe_temperature_calibration"],
      ["temp", "probe_temp_calibration"],
    ]) {
      const dialog = dialogs[`probe_calibration_${name}`];
      expect(dialog.content[0].value).toContain("calibration_dip_temperature");
      expect(dialog.content[1].conf.entities[0].entity).toBe(entity);
      expect(dialog.content.some((c: any) => c.view === "click-image")).toBe(
        false,
      );
    }
  });

  it("registers the workflows", () => {
    expect(actionRegistry.rscontrol_dialog_func_ext!.probe_calibration_ec).toBe(
      probe_calibration_ec,
    );
    expect(actionRegistry.rscontrol_dialog_func_ext!.probe_calibration_ph).toBe(
      probe_calibration_ph,
    );
  });
});
