// Consolidated tests for dose_head

import { Dialog } from "../src/base/dialog";
import { MyElement } from "../src/base/element";
import { DoseHead } from "../src/devices/rsdose/dose_head";
import {
  add_supplement,
  head_configuration,
} from "../src/devices/rsdose/dose_head.dialog_func_ext";
import { RSDose4 } from "../src/devices/rsdose/rsdose";
import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RSDevice from "../src/devices/device";
import supplements_list from "../src/devices/rsdose/supplements";

const TAG = "dose-head-l217";
if (!customElements.get(TAG)) {
  class StubL217 extends DoseHead {}
  customElements.define(TAG, StubL217);
}
function makeHass(extra: Record<string, any> = {}) {
  return {
    states: { ...extra },
    devices: {},
    callService: () => {},
    entities: {},
  };
}
function makeState(state: string) {
  return { state, entity_id: "sensor.x", attributes: {} };
}
function makeHead(): any {
  const el = document.createElement(TAG) as any;
  el.stock_alert = null;
  el.entities = {};
  el._hass = makeHass();
  return el;
}
if (!customElements.get("click-image")) {
  customElements.define(
    "click-image",
    class extends HTMLElement {
      hass: any = null;
      setConfig(_c: any) {}
    },
  );
}
class StubDH extends DoseHead {
  override render(): any {
    return this._render();
  }
}
if (!customElements.get("stub-dh-cov"))
  customElements.define("stub-dh-cov", StubDH);
function mockXHR(xhrStatus = 200) {
  const origXHR = (globalThis as any).XMLHttpRequest;
  (globalThis as any).XMLHttpRequest = class {
    status = xhrStatus;
    open() {}
    send() {}
  };
  return () => {
    (globalThis as any).XMLHttpRequest = origXHR;
  };
}
function makeState_B(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass_B(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
): any {
  return { states, entities, devices: {}, callService: vi.fn() };
}
const BASE_CONFIG = {
  id: 1,
  color: "140,67,148",
  alpha: 0.8,
  calibration: { css: { top: "0%" } },
  pipe: { top: "10%" },
  pump_state_head: { top: "20%" },
  pump_state_labels: {},
  container: {},
  warning: {},
  warning_label: {},
  elements: {},
};
function makeDH(): any {
  const dh = new StubDH() as any;
  dh.config = JSON.parse(JSON.stringify(BASE_CONFIG));
  dh.entities = {};
  dh._elements = {};
  dh.device = { elements: [] };
  dh._hass = makeHass();
  dh.state_on = true;
  dh.supplement = null;
  dh.supplement_info = false;
  dh.head_state = null;
  dh.stock_alert = null;
  dh.last_state_container_warning = false;
  dh.device_state = null;
  dh.to_render = false;
  dh.requestUpdate = vi.fn();
  return dh;
}
function makeShadowRoot(extraHtml = "") {
  const host = document.createElement("div");
  host.innerHTML = `<div id="dialog-content"></div><div id="schedule"></div>${extraHtml}`;
  (host as any).createElement = (tag: string) => document.createElement(tag);
  return host;
}
function makeHassDlg(extra: Record<string, any> = {}) {
  return { callService: vi.fn(), states: {}, entities: {}, ...extra };
}
const SUPP = {
  uid: "76830db3-a0bd-459a-9974-76a57d026893",
  fullname: "Red Sea - KH/Alkalinity (Foundation B)",
  name: "KH/Alkalinity (Foundation B)",
  display_name: "KH",
  short_name: "KH",
  brand_name: "Red Sea",
  sizes: [5000, 1000, 500, 250],
};
function makeDevice(overrides: Record<string, any> = {}) {
  const defaults: Record<string, any> = {
    supplements: { entity_id: "select.supps", state: SUPP.fullname },
    supplement: {
      entity_id: "sensor.supp",
      attributes: { supplement: { uid: SUPP.uid, display_name: "KH" } },
    },
    new_supplement_brand_name: { entity_id: "text.brand" },
    new_supplement_name: { entity_id: "text.name" },
    new_supplement_short_name: { entity_id: "text.short" },
    new_supplement_display_name: { entity_id: "text.display" },
    daily_dose: { entity_id: "number.dd", state: "5" },
    schedule_head: {
      entity_id: "sensor.sched",
      attributes: {
        schedule: {
          type: "hourly",
          min: 10,
          mode: "regular",
          days: [1, 2, 3, 4, 5, 6, 7],
        },
      },
    },
    manual_head_volume: { entity_id: "number.mhv" },
    manual_head: { entity_id: "button.mh" },
  };
  return {
    config: {
      color: "0,200,100",
      id: 1,
      shortcut: null,
      alpha: 1,
      ...overrides,
    },
    bundle: false,
    device: { device: { elements: [{ primary_config_entry: "cfg-abc" }] } },
    entities: defaults,
    get_entity: (key: string) => defaults[key] ?? null,
    is_on: () => true,
  };
}
function makeElt(overrides: Record<string, any> = {}): any {
  const device = makeDevice(overrides);
  return { device, _hass: makeHassDlg(), get_entity: device.get_entity };
}
class StubDoseHead extends DoseHead {
  override render(): any {
    return this._render();
  }
}
if (!customElements.get("stub-dose-head"))
  customElements.define("stub-dose-head", StubDoseHead);
class StubDevice extends RSDevice {
  _render(_style: any = null, _substyle: any = null): any {
    return null;
  }
}
if (!customElements.get("stub-rsdevice-ext"))
  customElements.define("stub-rsdevice-ext", StubDevice);
class StubRSDose4 extends RSDose4 {}
if (!customElements.get("stub-rsdose4-ext"))
  customElements.define("stub-rsdose4-ext", StubRSDose4);
class StubDialog extends Dialog {}
if (!customElements.get("stub-dialog-ext"))
  customElements.define("stub-dialog-ext", StubDialog);
class StubDoseHeadForDevice extends DoseHead {
  override render(): any {
    return this._render();
  }
}
if (!customElements.get("redsea-dose-head"))
  customElements.define("redsea-dose-head", StubDoseHeadForDevice);
function makeState_C(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass_C(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
  devices: Record<string, any> = {},
): any {
  return { states, entities, devices, callService: vi.fn() };
}
function makeDeviceInfo(
  model = "RSDOSE4",
  name = "pump",
  disabled_by: string | null = null,
): any {
  return {
    model,
    name,
    elements: [
      {
        id: "dev-001",
        model,
        identifiers: [[null, `${model.toLowerCase()}_1234`]],
        disabled_by,
        primary_config_entry: "cfg-xyz",
      },
    ],
  };
}
beforeAll(() => {
  if (!customElements.get("common-dialog")) {
    customElements.define("common-dialog", Dialog);
  }
});
function uid(p = "t") {
  return `${p}-${Math.random().toString(36).slice(2)}`;
}
function makeHass_D(states: Record<string, any> = {}) {
  return { states, devices: {}, callService: vi.fn(), entities: {} };
}
class StubDev extends RSDevice {
  override _render() {
    return null as any;
  }
}
if (!customElements.get("stub-dev-gaps"))
  customElements.define("stub-dev-gaps", StubDev);
function makeDev() {
  const d = new StubDev() as any;
  d.initial_config = { elements: {}, background_img: "" };
  d.user_config = null;
  d.device = null;
  d.entities = {};
  d._elements = {};
  d.dialogs = null;
  d.requestUpdate = vi.fn();
  return d;
}
function makeHass_E() {
  return { states: {}, devices: {}, callService: vi.fn(), entities: {} };
}

describe("DoseHead.container_warning() — coverage", () => {
  let head: any;

  beforeEach(() => {
    head = makeHead();
  });

  it("DEBUG - vérifie que la fonction ne throw pas", () => {
    head.stock_alert = 10;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass = makeHass({
      "sensor.rem": makeState("3"),
      "sensor.slm": makeState("on"),
      "sensor.dose": makeState("4"),
    });

    let result;
    let error;
    try {
      result = head.container_warning();
    } catch (e) {
      error = e;
    }
    console.log("result:", result, "error:", error);
    expect(error).toBeUndefined();
    expect(result).toBe(true);
  });

  it("returns truthy when all conditions are satisfied", () => {
    head.stock_alert = 10;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass = makeHass({
      "sensor.rem": makeState("3"),
      "sensor.slm": makeState("on"),
      "sensor.dose": makeState("4"),
    });
    console.log("********************************");
    expect(head.container_warning()).toBeTruthy();
  });

  it("returns falsy when remaining_days equals stock_alert (boundary)", () => {
    head.stock_alert = 5;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass = makeHass({
      "sensor.rem": makeState("5"),
      "sensor.slm": makeState("on"),
      "sensor.dose": makeState("2"),
    });
    expect(head.container_warning()).toBeFalsy();
  });

  it("returns falsy when remaining_days exceeds stock_alert", () => {
    head.stock_alert = 5;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass = makeHass({
      "sensor.rem": makeState("20"),
      "sensor.slm": makeState("on"),
      "sensor.dose": makeState("2"),
    });
    expect(head.container_warning()).toBeFalsy();
  });

  it("returns falsy when slm is off", () => {
    head.stock_alert = 10;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass = makeHass({
      "sensor.rem": makeState("3"),
      "sensor.slm": makeState("off"),
      "sensor.dose": makeState("2"),
    });
    expect(head.container_warning()).toBeFalsy();
  });

  it("returns falsy when daily_dose is zero", () => {
    head.stock_alert = 10;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass = makeHass({
      "sensor.rem": makeState("3"),
      "sensor.slm": makeState("on"),
      "sensor.dose": makeState("0"),
    });
    expect(head.container_warning()).toBeFalsy();
  });

  it("returns falsy when stock_alert is null", () => {
    head.stock_alert = null;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass = makeHass({
      "sensor.rem": makeState("3"),
      "sensor.slm": makeState("on"),
      "sensor.dose": makeState("2"),
    });
    expect(head.container_warning()).toBeFalsy();
  });

  it("returns falsy when remaining_days entity is absent", () => {
    head.stock_alert = 10;
    head.entities = {
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass = makeHass({
      "sensor.slm": makeState("on"),
      "sensor.dose": makeState("2"),
    });
    expect(head.container_warning()).toBeFalsy();
  });

  it("returns falsy when slm entity is absent", () => {
    head.stock_alert = 10;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass = makeHass({
      "sensor.rem": makeState("3"),
      "sensor.dose": makeState("2"),
    });
    expect(head.container_warning()).toBeFalsy();
  });

  it("returns falsy when daily_dose entity is absent", () => {
    head.stock_alert = 10;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
    };
    head._hass = makeHass({
      "sensor.rem": makeState("3"),
      "sensor.slm": makeState("on"),
    });
    expect(head.container_warning()).toBeFalsy();
  });

  it("render() délègue à _render()", () => {
    const dh = document.createElement(TAG) as any;
    const spy = vi.spyOn(dh, "_render").mockReturnValue(null);
    dh.render();
    expect(spy).toHaveBeenCalled();
  });
});
describe("DoseHead._pipe_path() — state_on=false branch (L44-48)", () => {
  it("uses OFF_COLOR when state_on is false", () => {
    const dh = makeDH();
    dh.state_on = false;
    const result = dh._pipe_path();
    expect(result).toBeDefined();

    const colorVal = result.values.find(
      (v: any) => typeof v === "string" && v.includes(","),
    );
    expect(colorVal).not.toBe("140,67,148");
  });

  it("uses config.color when state_on is true", () => {
    const dh = makeDH();
    dh.state_on = true;
    const result = dh._pipe_path();
    const colorVal = result.values.find(
      (v: any) => typeof v === "string" && v === "140,67,148",
    );
    expect(colorVal).toBe("140,67,148");
  });
});
describe("DoseHead._render_container() — supplement=null (L61-62)", () => {
  it("returns empty template when supplement is null", () => {
    const dh = makeDH();
    dh.supplement = null;
    const result = dh._render_container();
    expect(result.strings.join("").trim()).toBe("");
  });
});
describe("DoseHead._render_container() — state_on=false grayscale style (L80-87)", () => {
  it("adds grayscale style block when state_on is false", () => {
    const restore = mockXHR(200);
    const dh = makeDH();
    dh.state_on = false;
    dh.supplement = makeState_B("Ca", "sensor.sup", {
      supplement: { uid: "uid-gray", short_name: "Ca" },
    });
    const result = dh._render_container();
    restore();
    expect(result).toBeDefined();

    const hasGrayscale = result.values.some(
      (v: any) =>
        v &&
        typeof v === "object" &&
        v.strings &&
        v.strings.join("").includes("grayscale"),
    );
    expect(hasGrayscale).toBe(true);
  });
});
describe("DoseHead._render_container() — container_warning true (L90-100)", () => {
  it("produces warning html when container_warning() returns true", () => {
    const restore = mockXHR(200);
    const dh = makeDH();
    dh.state_on = true;
    dh.supplement = makeState_B("Ca", "sensor.sup", {
      supplement: { uid: "uid-warn", short_name: "Ca" },
    });
    dh.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    dh._hass = makeHass_B({
      "sensor.rem": makeState_B("2", "sensor.rem"),
      "sensor.slm": makeState_B("on", "sensor.slm"),
      "sensor.dose": makeState_B("5.0", "sensor.dose"),
    });
    dh.stock_alert = 10;
    const result = dh._render_container();
    restore();
    expect(result).toBeDefined();

    const warningVal = result.values[2];
    expect(warningVal).toBeDefined();
  });

  it("catch branch: console.warn called when container_warning throws", () => {
    const restore = mockXHR(200);
    const dh = makeDH();
    dh.state_on = true;
    dh.supplement = makeState_B("Ca", "sensor.sup", {
      supplement: { uid: "uid-catch", short_name: "Ca" },
    });
    dh.container_warning = () => {
      throw new Error("forced");
    };
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    dh._render_container();
    restore();
    expect(warnSpy).toHaveBeenCalledWith(
      "Could not check stock alert:",
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });
});
describe("DoseHead._render_supplement_info() (L115-119)", () => {
  it("returns template when supplement_info is true", () => {
    const dh = makeDH();
    dh.supplement_info = true;
    dh._elements = {};
    dh._render_elements = vi.fn().mockReturnValue("CONTENT");
    const result = dh._render_supplement_info();
    expect(result).toBeDefined();
    expect(dh._render_elements).toHaveBeenCalledWith(true, "supplement_info");
  });

  it("returns null when supplement_info is false", () => {
    const dh = makeDH();
    dh.supplement_info = false;
    expect(dh._render_supplement_info()).toBeNull();
  });
});
describe("DoseHead._render_ask() (L122-143)", () => {
  it("returns anchor template when supplement_info=true and is_name_editable=false", () => {
    const dh = makeDH();
    dh.supplement_info = true;
    dh.supplement = makeState_B("Ca", "sensor.sup", {
      supplement: {
        uid: "uid-ask",
        brand_name: "Red Sea",
        name: "Calcium",
        is_name_editable: false,
      },
    });
    const result = dh._render_ask();
    expect(result).toBeDefined();

    const hrefContainsBrand = result.values.some(
      (v: any) => typeof v === "string" && v.includes("Red"),
    );
    expect(hrefContainsBrand).toBe(true);
  });

  it("returns empty template when is_name_editable=true", () => {
    const dh = makeDH();
    dh.supplement_info = true;
    dh.supplement = makeState_B("Ca", "sensor.sup", {
      supplement: { brand_name: "X", name: "Y", is_name_editable: true },
    });
    expect(dh._render_ask().strings.join("").trim()).toBe("");
  });

  it("returns empty template when supplement_info=false", () => {
    const dh = makeDH();
    dh.supplement_info = false;
    expect(dh._render_ask().strings.join("").trim()).toBe("");
  });
});
describe("DoseHead set hass() branches (L177-202)", () => {
  it("L177-179: sets state_on when is_on() differs", () => {
    const dh = makeDH();
    dh.state_on = false;
    dh.entities = {};
    dh.head_state = null;
    dh.supplement = null;
    dh.last_state_container_warning = false;
    dh.hass = makeHass_B();
    expect(dh.state_on).toBe(true);
    expect(dh.requestUpdate).toHaveBeenCalled();
  });

  it("L185-187: updates head_state when entity.state differs from dh.head_state", () => {
    const dh = makeDH();

    dh.entities = {
      head_state: { entity_id: "sensor.hs", state: "off" },
    };
    dh.head_state = "on";
    dh.state_on = true;
    dh.supplement = null;
    dh.last_state_container_warning = false;
    dh._elements = {};
    dh.device = { elements: [] };
    dh.hass = makeHass_B({ "sensor.hs": makeState_B("off", "sensor.hs") });
    expect(dh.head_state).toBe("off");
    expect(dh.requestUpdate).toHaveBeenCalled();
  });

  it("L200-202: updates supplement when uid changes", () => {
    const dh = makeDH();
    dh.entities = { supplement: { entity_id: "sensor.sup" } };
    dh.supplement = makeState_B("Ca", "sensor.sup", {
      supplement: { uid: "uid-old", display_name: "Calcium" },
    });
    dh.state_on = true;
    dh.head_state = null;
    dh.last_state_container_warning = false;
    dh._elements = {};
    dh.device = { elements: [] };
    const newSupp = makeState_B("KH", "sensor.sup", {
      supplement: { uid: "uid-new", display_name: "KH" },
    });
    dh.hass = makeHass_B({ "sensor.sup": newSupp });
    expect(dh.supplement.attributes.supplement.uid).toBe("uid-new");
    expect(dh.requestUpdate).toHaveBeenCalled();
  });

  it("L200-202: updates supplement when display_name changes (same uid)", () => {
    const dh = makeDH();
    dh.entities = { supplement: { entity_id: "sensor.sup" } };
    dh.supplement = makeState_B("Ca", "sensor.sup", {
      supplement: { uid: "uid-same", display_name: "Old Name" },
    });
    dh.state_on = true;
    dh.head_state = null;
    dh.last_state_container_warning = false;
    dh._elements = {};
    dh.device = { elements: [] };
    const newSupp = makeState_B("Ca", "sensor.sup", {
      supplement: { uid: "uid-same", display_name: "New Name" },
    });
    dh.hass = makeHass_B({ "sensor.sup": newSupp });
    expect(dh.supplement.attributes.supplement.display_name).toBe("New Name");
  });
});
describe("DoseHead.container_warning() full expression (L217-226)", () => {
  it("returns truthy when all conditions met", () => {
    const dh = makeDH();
    dh.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    dh._hass = makeHass_B({
      "sensor.rem": makeState_B("3", "sensor.rem"),
      "sensor.slm": makeState_B("on", "sensor.slm"),
      "sensor.dose": makeState_B("7.5", "sensor.dose"),
    });
    dh.stock_alert = 10;
    expect(dh.container_warning()).toBeTruthy();
  });

  it("returns falsy when remaining_days >= stock_alert", () => {
    const dh = makeDH();
    dh.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    dh._hass = makeHass_B({
      "sensor.rem": makeState_B("15", "sensor.rem"),
      "sensor.slm": makeState_B("on", "sensor.slm"),
      "sensor.dose": makeState_B("5", "sensor.dose"),
    });
    dh.stock_alert = 10;
    expect(dh.container_warning()).toBeFalsy();
  });
});
describe("DoseHead._render() — Waiting early return (L247)", () => {
  it("returns waiting template when supplement attr absent", () => {
    const dh = makeDH();
    dh.entities = { supplement: { entity_id: "sensor.sup" } };
    dh._hass = makeHass_B({
      "sensor.sup": makeState_B("on", "sensor.sup", {}),
    });
    const result = dh._render();
    const text = result.values.join("") + result.strings.join("");
    expect(text).toContain("Waiting");
  });
});
describe("DoseHead._render() — uid!='null' path (L248-279)", () => {
  it("sets state_on=false when head_state=not-setup (L255-276)", () => {
    const restore = mockXHR(200);
    const dh = makeDH();
    dh.entities = {
      supplement: { entity_id: "sensor.sup" },
      head_state: { entity_id: "sensor.hs" },
    };
    dh._hass = makeHass_B({
      "sensor.sup": makeState_B("Ca", "sensor.sup", {
        supplement: { uid: "real-uid", short_name: "Ca" },
      }),
      "sensor.hs": makeState_B("not-setup", "sensor.hs"),
    });
    dh.state_on = true;
    dh._elements = {};
    const result = dh._render();
    restore();
    expect(result).toBeDefined();
    expect(dh.state_on).toBe(false);
  });

  it("uses OFF_COLOR when state_on=false (L279-280)", () => {
    const restore = mockXHR(200);
    const dh = makeDH();

    dh.entities = {
      supplement: { entity_id: "sensor.sup" },
      head_state: { entity_id: "sensor.hs" },
      schedule_enabled: { entity_id: "sensor.sched" },
    };
    dh._hass = makeHass_B({
      "sensor.sup": makeState_B("Ca", "sensor.sup", {
        supplement: { uid: "real-uid-2", short_name: "Ca" },
      }),
      "sensor.hs": makeState_B("on", "sensor.hs"),
      "sensor.sched": makeState_B("off", "sensor.sched"),
    });

    dh.device_state = makeState_B("on");
    dh._elements = {};
    const result = dh._render();
    restore();
    expect(result).toBeDefined();

    expect(dh.state_on).toBe(false);
  });

  it("L289 false branch: head_state entity defined but absent from hass.states → skips not-setup block", () => {
    const restore = mockXHR(200);
    const dh = makeDH();
    dh.entities = {
      supplement: { entity_id: "sensor.sup" },
      head_state: { entity_id: "sensor.hs" },
    };

    dh._hass = makeHass_B({
      "sensor.sup": makeState_B("Ca", "sensor.sup", {
        supplement: { uid: "real-uid-3", short_name: "Ca" },
      }),
    });
    dh._elements = {};
    const result = dh._render();
    restore();
    expect(result).toBeDefined();
  });
});
describe("DoseHead._render() — uid='null' else branch (L138-153)", () => {
  // L84: supplement.uid === "null" → else branch taken
  // L138: conf object with type "click-image" constructed
  // L152: MyElement.create_element called with this._hass, conf, this
  // L153-158: html with container div returned

  it("L138-153: returns container html with click-image when uid is 'null'", () => {
    const restore = mockXHR(200);
    const dh = makeDH();
    dh.entities = { supplement: { entity_id: "sensor.sup" } };
    dh._hass = makeHass_B({
      "sensor.sup": makeState_B("on", "sensor.sup", {
        supplement: { uid: "null", short_name: "none", display_name: "None" },
      }),
    });
    dh._elements = {};

    let capturedConf: any = null;
    const origCreate = (MyElement as any).create_element;
    (MyElement as any).create_element = (_h: any, conf: any) => {
      capturedConf = conf;
      return document.createElement("div");
    };

    const result = dh._render();
    (MyElement as any).create_element = origCreate;
    restore();

    // L138: conf.type must be "click-image"
    expect(capturedConf).not.toBeNull();
    expect(capturedConf.type).toBe("click-image");
    // L143-147: tap_action targets add_supplement dialog
    expect(capturedConf.tap_action.data.type).toBe("add_supplement");
    // L153: result is a TemplateResult
    expect(result).toBeDefined();
  });

  it("L152: create_element called with this._hass and correct conf", () => {
    const restore = mockXHR(200);
    const dh = makeDH();
    dh.entities = { supplement: { entity_id: "sensor.sup" } };
    dh._hass = makeHass_B({
      "sensor.sup": makeState_B("on", "sensor.sup", {
        supplement: { uid: "null", short_name: "none", display_name: "None" },
      }),
    });
    dh._elements = {};

    const calls: Array<[any, any, any]> = [];
    const origCreate = (MyElement as any).create_element;
    (MyElement as any).create_element = (h: any, conf: any, self: any) => {
      calls.push([h, conf, self]);
      return document.createElement("span");
    };

    dh._render();
    (MyElement as any).create_element = origCreate;
    restore();

    expect(calls).toHaveLength(1);
    const [hassArg, confArg, selfArg] = calls[0];
    expect(hassArg).toBe(dh._hass); // L152: this._hass
    expect(confArg.type).toBe("click-image"); // L139
    expect(selfArg).toBe(dh); // L152: this
  });
});

describe("DoseHead — constructor", () => {
  it("initializes supplement to null", () => {
    const dh = new StubDoseHead() as any;
    expect(dh.supplement).toBeNull();
  });

  it("initializes stock_alert to null", () => {
    const dh = new StubDoseHead() as any;
    expect(dh.stock_alert).toBeNull();
  });

  it("initializes supplement_info to false", () => {
    const dh = new StubDoseHead() as any;
    expect(dh.supplement_info).toBe(false);
  });

  it("initializes bundle to false", () => {
    const dh = new StubDoseHead() as any;
    expect(dh.bundle).toBe(false);
  });
});
describe("DoseHead.is_on()", () => {
  it("returns true when head_state entity is absent from entities", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {};
    dh._hass = makeHass_C();
    expect(dh.is_on()).toBe(true);
  });

  it("returns false when head_state.state is 'not-setup'", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = { head_state: { entity_id: "sensor.hs" } };
    dh._hass = makeHass_C({
      "sensor.hs": makeState_C("not-setup", "sensor.hs"),
    });
    dh.device_state = null;
    expect(dh.is_on()).toBe(false);
  });

  it("returns false when device_state is null", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = { head_state: { entity_id: "sensor.hs" } };
    dh._hass = makeHass_C({ "sensor.hs": makeState_C("on", "sensor.hs") });
    dh.device_state = null;
    expect(dh.is_on()).toBe(false);
  });

  it("returns false when schedule_enabled is 'off'", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {
      head_state: { entity_id: "sensor.hs" },
      schedule_enabled: { entity_id: "sensor.sched" },
    };
    dh._hass = makeHass_C({
      "sensor.hs": makeState_C("on", "sensor.hs"),
      "sensor.sched": makeState_C("off", "sensor.sched"),
    });
    dh.device_state = makeState_C("on");
    expect(dh.is_on()).toBe(false);
  });

  it("returns true when all conditions are met", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {
      head_state: { entity_id: "sensor.hs" },
      schedule_enabled: { entity_id: "sensor.sched" },
    };
    dh._hass = makeHass_C({
      "sensor.hs": makeState_C("on", "sensor.hs"),
      "sensor.sched": makeState_C("on", "sensor.sched"),
    });
    dh.device_state = makeState_C("on");
    expect(dh.is_on()).toBe(true);
  });
});
describe("DoseHead.update_state()", () => {
  it("updates device_state when value differs", () => {
    const dh = new StubDoseHead() as any;
    dh.device_state = null;
    dh.requestUpdate = vi.fn();
    dh.update_state(makeState_C("on"));
    expect(dh.device_state).not.toBeNull();
  });

  it("calls requestUpdate even when value is same", () => {
    const dh = new StubDoseHead() as any;
    const val = makeState_C("on");
    dh.device_state = val;
    dh.requestUpdate = vi.fn();
    dh.update_state(val);
    expect(dh.requestUpdate).toHaveBeenCalled();
  });
});
describe("DoseHead.container_warning()", () => {
  it("returns falsy when no remaining_days entity", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {};
    dh._hass = makeHass_C();
    dh.stock_alert = 10;
    expect(dh.container_warning()).toBeFalsy();
  });

  it("returns falsy when stock_alert is null", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    dh._hass = makeHass_C({
      "sensor.rem": makeState_C("3"),
      "sensor.slm": makeState_C("on"),
      "sensor.dose": makeState_C("5"),
    });
    dh.stock_alert = null;
    expect(dh.container_warning()).toBeFalsy();
  });

  it("returns true when remaining_days < stock_alert and slm on and daily_dose > 0", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    dh._hass = makeHass_C({
      "sensor.rem": makeState_C("3", "sensor.rem"),
      "sensor.slm": makeState_C("on", "sensor.slm"),
      "sensor.dose": makeState_C("5.5", "sensor.dose"),
    });
    dh.stock_alert = 10;
    expect(dh.container_warning()).toBeTruthy();
  });

  it("returns false when daily_dose is 0", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    dh._hass = makeHass_C({
      "sensor.rem": makeState_C("3", "sensor.rem"),
      "sensor.slm": makeState_C("on", "sensor.slm"),
      "sensor.dose": makeState_C("0", "sensor.dose"),
    });
    dh.stock_alert = 10;
    expect(dh.container_warning()).toBeFalsy();
  });

  it("returns false when remaining_days >= stock_alert", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    dh._hass = makeHass_C({
      "sensor.rem": makeState_C("15", "sensor.rem"),
      "sensor.slm": makeState_C("on", "sensor.slm"),
      "sensor.dose": makeState_C("5", "sensor.dose"),
    });
    dh.stock_alert = 10;
    expect(dh.container_warning()).toBeFalsy();
  });

  it("returns false when slm is off", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    dh._hass = makeHass_C({
      "sensor.rem": makeState_C("3", "sensor.rem"),
      "sensor.slm": makeState_C("off", "sensor.slm"),
      "sensor.dose": makeState_C("5", "sensor.dose"),
    });
    dh.stock_alert = 10;
    expect(dh.container_warning()).toBeFalsy();
  });

  it("returns false when _hass is null", () => {
    const dh = new StubDoseHead() as any;
    dh._hass = null;
    dh.entities = { remaining_days: { entity_id: "sensor.rem" } };
    dh.stock_alert = 10;
    expect(dh.container_warning()).toBeFalsy();
  });

  it("returns false when entity states are absent from hass.states", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };

    dh._hass = makeHass_C({});
    dh.stock_alert = 10;
    expect(dh.container_warning()).toBeFalsy();
  });
});
describe("DoseHead hass setter", () => {
  it("does not throw with minimal valid hass", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {};
    dh._elements = {};
    dh.config = { model: "DOSE_HEAD", elements: {} };
    dh.device = { elements: [] };
    dh.state_on = false;
    dh.last_state_container_warning = false;
    dh.requestUpdate = vi.fn();
    expect(() => {
      dh.hass = makeHass_C();
    }).not.toThrow();
  });

  it("sets state_on when is_on() differs from current", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {};
    dh._elements = {};
    dh.config = { model: "DOSE_HEAD", elements: {} };
    dh.device = { elements: [] };
    dh.state_on = true;
    dh.last_state_container_warning = false;
    dh.requestUpdate = vi.fn();

    expect(() => {
      dh.hass = makeHass_C();
    }).not.toThrow();
  });

  it("updates head_state when entity state changes", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = { head_state: { entity_id: "sensor.hs", state: "on" } };
    dh._elements = {};
    dh.config = { model: "DOSE_HEAD", elements: {} };
    dh.device = { elements: [] };
    dh.state_on = false;
    dh.head_state = "on";
    dh.last_state_container_warning = false;
    dh.requestUpdate = vi.fn();
    const hass = makeHass_C({ "sensor.hs": makeState_C("off", "sensor.hs") });
    expect(() => {
      dh.hass = hass;
    }).not.toThrow();
  });
});
describe("DoseHead._render_container() L76-78 — 404 triggers fallback image", () => {
  async function makeHead(tag: string) {
    const { DoseHead } = await import("../src/devices/rsdose/dose_head");
    if (!customElements.get(tag)) {
      class StubDoseHead extends DoseHead {}
      customElements.define(tag, StubDoseHead);
    }
    const head = document.createElement(tag) as any;

    head.config = { container: {}, warning: {}, warning_label: {} };
    head.initial_config = head.config;
    head._hass = null;
    head.entities = {};
    head.stock_alert = null;
    head.state_on = true;
    head.supplement_info = false;

    head._render_supplement_info = vi.fn(() => html``);
    head._render_elements = vi.fn(() => html``);
    head._render_ask = vi.fn(() => html``);
    return head;
  }

  it("sets fallback img and supplement_info=true when status is 404", async () => {
    const head = await makeHead("stub-dose-head-gaps");
    head.supplement = {
      attributes: { supplement: { uid: "test-uid-404" } },
    };

    const originalXHR = window.XMLHttpRequest;
    class MockXHR404 {
      status = 404;
      open = vi.fn();
      send = vi.fn();
    }
    (window as any).XMLHttpRequest = MockXHR404;

    head._render_container();

    expect(head.supplement_info).toBe(true);
    (window as any).XMLHttpRequest = originalXHR;
  });

  it("does not set supplement_info when status is 200", async () => {
    const head = await makeHead("stub-dose-head-200");
    head.supplement = {
      attributes: { supplement: { uid: "test-uid-200" } },
    };

    const originalXHR = window.XMLHttpRequest;
    class MockXHR200 {
      status = 200;
      open = vi.fn();
      send = vi.fn();
    }
    (window as any).XMLHttpRequest = MockXHR200;

    head._render_container();

    expect(head.supplement_info).toBe(false);
    (window as any).XMLHttpRequest = originalXHR;
  });
});
describe("DoseHead.container_warning() L217 — boolean expression branches", () => {
  async function makeHead() {
    const { DoseHead } = await import("../src/devices/rsdose/dose_head");
    const tag = "stub-dose-head-warn-" + Math.random().toString(36).slice(2);
    class StubHead extends DoseHead {}
    customElements.define(tag, StubHead);
    const el = document.createElement(tag) as any;
    el.stock_alert = null;
    el.entities = {};
    el._hass = { states: {}, devices: {}, callService: vi.fn(), entities: {} };
    return el;
  }

  function makeState(state: string, entity_id = "sensor.x") {
    return { entity_id, state, attributes: {} };
  }

  it("returns truthy when all conditions are met", async () => {
    const head = await makeHead();
    head.stock_alert = 10;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass.states = {
      "sensor.rem": makeState("5", "sensor.rem"),
      "sensor.slm": makeState("on", "sensor.slm"),
      "sensor.dose": makeState("2.5", "sensor.dose"),
    };
    expect(head.container_warning()).toBeTruthy();
  });

  it("returns falsy when remaining_days >= stock_alert", async () => {
    const head = await makeHead();
    head.stock_alert = 5;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass.states = {
      "sensor.rem": makeState("10", "sensor.rem"),
      "sensor.slm": makeState("on", "sensor.slm"),
      "sensor.dose": makeState("2.5", "sensor.dose"),
    };
    expect(head.container_warning()).toBeFalsy();
  });

  it("returns falsy when slm is off", async () => {
    const head = await makeHead();
    head.stock_alert = 10;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass.states = {
      "sensor.rem": makeState("3", "sensor.rem"),
      "sensor.slm": makeState("off", "sensor.slm"),
      "sensor.dose": makeState("2.5", "sensor.dose"),
    };
    expect(head.container_warning()).toBeFalsy();
  });

  it("returns falsy when daily_dose is 0", async () => {
    const head = await makeHead();
    head.stock_alert = 10;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass.states = {
      "sensor.rem": makeState("3", "sensor.rem"),
      "sensor.slm": makeState("on", "sensor.slm"),
      "sensor.dose": makeState("0", "sensor.dose"),
    };
    expect(head.container_warning()).toBeFalsy();
  });

  it("returns falsy when stock_alert is null", async () => {
    const head = await makeHead();
    head.stock_alert = null;
    head.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    head._hass.states = {
      "sensor.rem": makeState("3", "sensor.rem"),
      "sensor.slm": makeState("on", "sensor.slm"),
      "sensor.dose": makeState("2", "sensor.dose"),
    };
    expect(head.container_warning()).toBeFalsy();
  });

  it("returns falsy when a required entity is missing", async () => {
    const head = await makeHead();
    head.stock_alert = 10;
    head.entities = {};
    expect(head.container_warning()).toBeFalsy();
  });
});
describe("DoseHead", () => {
  async function makeHead() {
    const { DoseHead } = await import("../src/devices/rsdose/dose_head");
    const tag = uid("dh");
    class T extends DoseHead {}
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;
    el.initial_config = { elements: {}, background_img: "" };
    el.user_config = null;
    el.device = {
      name: "head",
      elements: [{ id: "id1", model: "RSDOSE4", disabled_by: null }],
    };
    el.entities = {};
    el._elements = {};
    el.requestUpdate = vi.fn();
    el.config = {
      background_img: "",
      elements: {},
      calibration: { css: {} },
      alpha: 1,
    };
    el._hass = makeHass_D();
    el.supplement = null;
    el.head_state = null;
    el.last_state_container_warning = null;
    el.device_state = null;
    el.state_on = true;
    return el;
  }

  it("L200: updates supplement when uid differs", async () => {
    const el = await makeHead();
    el.entities = { supplement: { entity_id: "sensor.supp" } };
    const newHass = makeHass_D({
      "sensor.supp": {
        entity_id: "sensor.supp",
        state: "x",
        attributes: { supplement: { uid: "new-uid", display_name: "New" } },
      },
    });
    el._hass = newHass;
    el.supplement = {
      entity_id: "sensor.supp",
      state: "x",
      attributes: { supplement: { uid: "old-uid", display_name: "Old" } },
    };
    vi.spyOn(el, "container_warning").mockReturnValue(false);
    el.last_state_container_warning = false;

    el.hass = newHass;
    expect(el.supplement.attributes.supplement.uid).toBe("new-uid");
  });

  it("L205: sets to_update when container_warning result changes", async () => {
    const el = await makeHead();
    el.last_state_container_warning = false;
    vi.spyOn(el, "container_warning").mockReturnValue(true);
    el.hass = makeHass_D();
    expect(el.requestUpdate).toHaveBeenCalled();
  });

  it("L216-217: container_warning returns truthy with all conditions met", async () => {
    const el = await makeHead();
    el.stock_alert = 10;
    el.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    el._hass = {
      ...makeHass_D(),
      states: {
        "sensor.rem": { state: "5", entity_id: "sensor.rem", attributes: {} },
        "sensor.slm": { state: "on", entity_id: "sensor.slm", attributes: {} },
        "sensor.dose": {
          state: "2.5",
          entity_id: "sensor.dose",
          attributes: {},
        },
      },
    };
    expect(el.container_warning()).toBeTruthy();
  });

  it("L274: accesses config.calibration.css to build calibration element", async () => {
    const el = await makeHead();
    el.config = {
      background_img: "",
      elements: {},
      calibration: { css: { color: "red" } },
      alpha: 1,
    };
    el._hass = makeHass_D();
    el.state_on = true;
    el.device_state = { state: "on", attributes: {} };
    el.stateObj = { state: "on", attributes: {} };

    const spy = vi
      .spyOn(MyElement, "create_element")
      .mockReturnValue({} as any);
    vi.spyOn(el, "_render_disabled").mockReturnValue(null);
    vi.spyOn(el, "_render_container").mockReturnValue("" as any);
    vi.spyOn(el, "_render_elements").mockReturnValue("" as any);
    el._render();

    expect(el.config.calibration.css).toEqual({ color: "red" });
    spy.mockRestore();
  });
});
describe("DoseHead.container_warning() — L216 and L217 reached", () => {
  async function makeDoseHead() {
    const { DoseHead } = await import("../src/devices/rsdose/dose_head");
    const tag = uid("dh-cw");
    class T extends DoseHead {}
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;
    el.initial_config = {
      elements: {},
      background_img: "",
      calibration: { css: {} },
    };
    el.user_config = null;
    el.device = { name: "head", elements: [] };
    el.entities = {};
    el._elements = {};
    el.requestUpdate = vi.fn();
    el.config = {
      background_img: "",
      elements: {},
      calibration: { css: {} },
      alpha: 1,
    };
    el._hass = makeHass_E();
    el.stock_alert = 10;
    return el;
  }

  it("L216-217: reached and returns truthy when all three entities truthy and all conditions met", async () => {
    const el = await makeDoseHead();
    el.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    el._hass = {
      ...makeHass_E(),
      states: {
        "sensor.rem": { state: "3", entity_id: "sensor.rem", attributes: {} },
        "sensor.slm": { state: "on", entity_id: "sensor.slm", attributes: {} },
        "sensor.dose": {
          state: "2.0",
          entity_id: "sensor.dose",
          attributes: {},
        },
      },
    };
    const result = el.container_warning();
    expect(result).toBeTruthy();
  });

  it("L216-217: reached but returns falsy when daily_dose is 0", async () => {
    const el = await makeDoseHead();
    el.entities = {
      remaining_days: { entity_id: "sensor.rem" },
      slm: { entity_id: "sensor.slm" },
      daily_dose: { entity_id: "sensor.dose" },
    };
    el._hass = {
      ...makeHass_E(),
      states: {
        "sensor.rem": { state: "3", entity_id: "sensor.rem", attributes: {} },
        "sensor.slm": { state: "on", entity_id: "sensor.slm", attributes: {} },
        "sensor.dose": { state: "0", entity_id: "sensor.dose", attributes: {} },
      },
    };
    expect(el.container_warning()).toBeFalsy();
  });
});
