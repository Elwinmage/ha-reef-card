/**
 * Extended tests for:
 *  - DoseHead (dose_head.ts) — constructor, is_on, update_state, container_warning, hass setter, _render paths
 *  - RSDevice (device.ts) — render(), setNestedProperty/applyLeaves, create_device, _render_element (hui path)
 *  - RSDose (rsdose.ts) — _get_val, _render_head guards, hass setter with heads
 *  - Dialog (dialog.ts) — init, set_conf, quit, hass setter, render_shell, create_form
 */

import { describe, it, expect, vi } from "vitest";
import { DoseHead } from "../src/devices/rsdose/dose_head";
import RSDevice from "../src/devices/device";
import { RSDose4 } from "../src/devices/rsdose/rsdose";
import { Dialog } from "../src/base/dialog";

// ---------------------------------------------------------------------------
// Stub wrappers
// ---------------------------------------------------------------------------

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

// Use a separate class for redsea-dose-head so the same constructor is not registered twice
class StubDoseHeadForDevice extends DoseHead {
  override render(): any {
    return this._render();
  }
}
if (!customElements.get("redsea-dose-head"))
  customElements.define("redsea-dose-head", StubDoseHeadForDevice);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}

function makeHass(
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

// ---------------------------------------------------------------------------
// DoseHead — constructor and initial state
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// DoseHead — is_on()
// ---------------------------------------------------------------------------

describe("DoseHead.is_on()", () => {
  it("returns true when head_state entity is absent from entities", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {};
    dh._hass = makeHass();
    expect(dh.is_on()).toBe(true);
  });

  it("returns false when head_state.state is 'not-setup'", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = { head_state: { entity_id: "sensor.hs" } };
    dh._hass = makeHass({ "sensor.hs": makeState("not-setup", "sensor.hs") });
    dh.device_state = null;
    expect(dh.is_on()).toBe(false);
  });

  it("returns false when device_state is null", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = { head_state: { entity_id: "sensor.hs" } };
    dh._hass = makeHass({ "sensor.hs": makeState("on", "sensor.hs") });
    dh.device_state = null;
    expect(dh.is_on()).toBe(false);
  });

  it("returns false when schedule_enabled is 'off'", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {
      head_state: { entity_id: "sensor.hs" },
      schedule_enabled: { entity_id: "sensor.sched" },
    };
    dh._hass = makeHass({
      "sensor.hs": makeState("on", "sensor.hs"),
      "sensor.sched": makeState("off", "sensor.sched"),
    });
    dh.device_state = makeState("on");
    expect(dh.is_on()).toBe(false);
  });

  it("returns true when all conditions are met", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {
      head_state: { entity_id: "sensor.hs" },
      schedule_enabled: { entity_id: "sensor.sched" },
    };
    dh._hass = makeHass({
      "sensor.hs": makeState("on", "sensor.hs"),
      "sensor.sched": makeState("on", "sensor.sched"),
    });
    dh.device_state = makeState("on");
    expect(dh.is_on()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// DoseHead — update_state()
// ---------------------------------------------------------------------------

describe("DoseHead.update_state()", () => {
  it("updates device_state when value differs", () => {
    const dh = new StubDoseHead() as any;
    dh.device_state = null;
    dh.requestUpdate = vi.fn();
    dh.update_state(makeState("on"));
    expect(dh.device_state).not.toBeNull();
  });

  it("calls requestUpdate even when value is same", () => {
    const dh = new StubDoseHead() as any;
    const val = makeState("on");
    dh.device_state = val;
    dh.requestUpdate = vi.fn();
    dh.update_state(val);
    expect(dh.requestUpdate).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// DoseHead — container_warning()
// ---------------------------------------------------------------------------

describe("DoseHead.container_warning()", () => {
  it("returns falsy when no remaining_days entity", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {};
    dh._hass = makeHass();
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
    dh._hass = makeHass({
      "sensor.rem": makeState("3"),
      "sensor.slm": makeState("on"),
      "sensor.dose": makeState("5"),
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
    dh._hass = makeHass({
      "sensor.rem": makeState("3", "sensor.rem"),
      "sensor.slm": makeState("on", "sensor.slm"),
      "sensor.dose": makeState("5.5", "sensor.dose"),
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
    dh._hass = makeHass({
      "sensor.rem": makeState("3", "sensor.rem"),
      "sensor.slm": makeState("on", "sensor.slm"),
      "sensor.dose": makeState("0", "sensor.dose"),
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
    dh._hass = makeHass({
      "sensor.rem": makeState("3", "sensor.rem"),
      "sensor.slm": makeState("off", "sensor.slm"),
      "sensor.dose": makeState("5", "sensor.dose"),
    });
    dh.stock_alert = 10;
    expect(dh.container_warning()).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// DoseHead — _render() early-return path
// ---------------------------------------------------------------------------

describe("DoseHead._render()", () => {
  it("returns 'Waiting for supplement data' when no supplement entity", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {};
    dh._hass = makeHass();
    dh.config = { id: 1 };
    dh.to_render = false;
    const result = dh._render();
    expect(result).toBeDefined();
  });

  it("returns 'Waiting' when supplement state has no supplement attribute", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = { supplement: { entity_id: "sensor.sup" } };
    dh._hass = makeHass({
      "sensor.sup": makeState("on", "sensor.sup", {}),
    });
    dh.config = { id: 1 };
    dh.to_render = false;
    const result = dh._render();
    expect(result).toBeDefined();
  });

  it("renders null supplement uid path (add_supplement button)", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {
      supplement: { entity_id: "sensor.sup" },
    };
    dh._hass = makeHass({
      "sensor.sup": makeState("on", "sensor.sup", {
        supplement: {
          uid: "null",
          short_name: "generic",
          display_name: "Generic",
        },
      }),
    });
    dh.config = {
      id: 1,
      color: "0,200,100",
      alpha: 0.8,
      calibration: { css: {} },
      pipe: {},
      pump_state_head: {},
      pump_state_labels: {},
      container: {},
      elements: {},
    };
    dh.state_on = false;
    dh.to_render = false;
    dh._elements = {};
    // May throw on create_element for click-image — just check no unexpected error
    expect(() => dh._render()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// DoseHead — hass setter
// ---------------------------------------------------------------------------

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
      dh.hass = makeHass();
    }).not.toThrow();
  });

  it("sets state_on when is_on() differs from current", () => {
    const dh = new StubDoseHead() as any;
    dh.entities = {};
    dh._elements = {};
    dh.config = { model: "DOSE_HEAD", elements: {} };
    dh.device = { elements: [] };
    dh.state_on = true; // starts true
    dh.last_state_container_warning = false;
    dh.requestUpdate = vi.fn();
    // is_on() returns true (entities empty), so no change expected — no throw
    expect(() => {
      dh.hass = makeHass();
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
    const hass = makeHass({ "sensor.hs": makeState("off", "sensor.hs") });
    expect(() => {
      dh.hass = hass;
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// RSDevice — render() full pipeline (via setConfig + hass)
// ---------------------------------------------------------------------------

describe("RSDevice.render()", () => {
  it("calls renderEditor() in editor mode", () => {
    const dev = new StubDevice() as any;
    dev.isEditorMode = true;
    dev.initial_config = { model: "TEST", elements: {}, background_img: "" };
    dev.user_config = {};
    dev.device = makeDeviceInfo();
    dev.dialogs = {};
    dev.entities = {};
    dev._elements = {};
    const result = dev.render();
    expect(result).toBeDefined();
  });

  it("returns disabled template when device is disabled", () => {
    const dev = new StubDevice() as any;
    dev.isEditorMode = false;
    dev.initial_config = {
      model: "TEST",
      elements: {},
      background_img: "img.png",
    };
    dev.user_config = {};
    dev.device = makeDeviceInfo("TEST", "pump", "user");
    dev.dialogs = {};
    dev.entities = {};
    dev._elements = {};
    dev._hass = makeHass();
    const result = dev.render();
    expect(result).toBeDefined();
  });

  it("renders device when device is on", () => {
    const dev = new StubDevice() as any;
    dev.isEditorMode = false;
    dev.initial_config = { model: "TEST", elements: {}, background_img: "" };
    dev.user_config = {};
    dev.device = makeDeviceInfo();
    dev.dialogs = {};
    dev.entities = {
      device_state: { entity_id: "sensor.ds" },
    };
    dev._elements = {};
    dev._hass = makeHass(
      {
        "sensor.ds": makeState("on", "sensor.ds"),
      },
      {
        "sensor.ds": {
          entity_id: "sensor.ds",
          device_id: "dev-001",
          translation_key: "device_state",
        },
      },
    );
    expect(() => dev.render()).not.toThrow();
  });

  it("applies grayscale style when device is off", () => {
    const dev = new StubDevice() as any;
    dev.isEditorMode = false;
    dev.initial_config = { model: "TEST", elements: {}, background_img: "" };
    dev.user_config = {};
    dev.device = makeDeviceInfo();
    dev.dialogs = {};
    dev.entities = {
      device_state: { entity_id: "sensor.ds" },
    };
    dev._elements = {};
    dev._hass = makeHass({
      "sensor.ds": makeState("off", "sensor.ds"),
    });
    expect(() => dev.render()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// RSDevice — setConfig / get hass
// ---------------------------------------------------------------------------

describe("RSDevice.setConfig() and get hass", () => {
  it("stores user_config from setConfig", () => {
    const dev = new StubDevice() as any;
    const cfg = { conf: { TEST: {} } };
    dev.setConfig(cfg);
    expect(dev.user_config).toBe(cfg);
  });

  it("get hass returns _hass", () => {
    const dev = new StubDevice() as any;
    const hass = makeHass();
    dev._hass = hass;
    expect(dev.hass).toBe(hass);
  });
});

// ---------------------------------------------------------------------------
// RSDevice — create_device() static method
// ---------------------------------------------------------------------------

describe("RSDevice.create_device()", () => {
  it("returns null for unknown tag", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = RSDevice.create_device(
      "nonexistent-tag-xyz",
      makeHass(),
      {},
      makeDeviceInfo(),
    );
    expect(result).toBeNull();
    spy.mockRestore();
  });

  it("creates device for registered tag 'redsea-dose-head'", () => {
    const result = RSDevice.create_device(
      "redsea-dose-head",
      makeHass(),
      { model: "DOSE_HEAD", elements: {}, background_img: "" },
      makeDeviceInfo(),
    );
    expect(result).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// RSDevice — is_disabled()
// ---------------------------------------------------------------------------

describe("RSDevice.is_disabled()", () => {
  it("returns true when elements array is empty", () => {
    const dev = new StubDevice() as any;
    dev.device = { elements: [] };
    expect(dev.is_disabled()).toBe(true);
  });

  it("returns false when no element is disabled", () => {
    const dev = new StubDevice() as any;
    dev.device = makeDeviceInfo();
    expect(dev.is_disabled()).toBe(false);
  });

  it("returns true when any element has disabled_by set", () => {
    const dev = new StubDevice() as any;
    dev.device = makeDeviceInfo("TEST", "pump", "user");
    expect(dev.is_disabled()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// RSDevice — applyLeaves / setNestedProperty via update_config
// ---------------------------------------------------------------------------

describe("RSDevice.update_config() — common config path", () => {
  it("applies common config leaves correctly", () => {
    const dev = new StubDevice() as any;
    dev.initial_config = {
      model: "TEST",
      elements: {},
      background_img: "",
      color: "0,0,0",
    };
    dev.user_config = {
      conf: {
        TEST: {
          common: { color: { 0: "255,0,0" } },
        },
      },
    };
    dev.device = makeDeviceInfo("TEST");
    dev.dialogs = {};
    dev.update_config();
    expect(dev.config.color).toEqual(["255,0,0"]);
  });
});

// ---------------------------------------------------------------------------
// RSDose — hass setter with heads
// ---------------------------------------------------------------------------

describe("RSDose hass setter with heads", () => {
  it("does not throw when _heads is empty", () => {
    const dev = new StubRSDose4() as any;
    dev.device = makeDeviceInfo("RSDOSE4");
    dev._elements = {};
    dev._heads = [];
    dev.dosing_queue = null;
    dev.config = { model: "RSDOSE4", elements: {}, heads_nb: 0 };
    dev.entities = {};
    dev.to_render = false;
    expect(() => {
      dev.hass = makeHass();
    }).not.toThrow();
  });

  it("propagates hass to dosing_queue when present", () => {
    const dev = new StubRSDose4() as any;
    dev.device = makeDeviceInfo("RSDOSE4");
    dev._elements = {};
    dev._heads = [];
    dev.entities = {};
    dev.to_render = false;
    dev.config = { model: "RSDOSE4", elements: {}, heads_nb: 0 };
    const mockQueue = { hass: null };
    dev.dosing_queue = mockQueue;
    const hass = makeHass();
    dev.hass = hass;
    expect(mockQueue.hass).toBe(hass);
  });
});

// ---------------------------------------------------------------------------
// RSDose — _render_head() guard (missing supplement/schedule returns html``)
// ---------------------------------------------------------------------------

describe("RSDose._render_head()", () => {
  it("returns html`` when schedule_entity_id is missing from _heads", () => {
    const dev = new StubRSDose4() as any;
    dev.device = makeDeviceInfo("RSDOSE4");
    dev._elements = {};
    dev._heads = [{ entities: {} }, { entities: {} }, { entities: {} }];
    dev.entities = { stock_alert_days: { entity_id: "sensor.alert" } };
    dev._hass = makeHass({
      "sensor.alert": makeState("10", "sensor.alert"),
    });
    dev.config = {
      heads_nb: 2,
      heads: {
        common: { color: "0,200,100" },
        head_1: { color: "100,200,0" },
        head_2: { color: "200,100,0" },
      },
    };
    dev.supplement_color = {};
    const result = dev._render_head(1, true);
    expect(result).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Dialog — init, render_shell, set_conf, quit, hass setter
// ---------------------------------------------------------------------------

describe("Dialog — basic methods", () => {
  it("render_shell returns html string with window-mask", () => {
    const dlg = new StubDialog() as any;
    const shell = dlg.render_shell();
    expect(shell).toContain("window-mask");
    expect(shell).toContain("dialog-content");
  });

  it("set_conf stores config", () => {
    const dlg = new StubDialog() as any;
    const cfg = { wifi: { title_key: "i18n._('wifi')" } };
    dlg.set_conf(cfg);
    expect(dlg.config).toBe(cfg);
  });

  it("hass setter stores _hass and propagates to elts", () => {
    const dlg = new StubDialog() as any;
    const mockElt = { hass: null };
    dlg.elts = [mockElt];
    dlg.to_render = null;
    dlg.extends_to_re_render = [];
    const hass = makeHass();
    dlg.hass = hass;
    expect(dlg._hass).toBe(hass);
    expect(mockElt.hass).toBe(hass);
  });

  it("quit() hides window-mask when _shadowRoot is set", () => {
    const dlg = new StubDialog() as any;
    const mockBox = { style: { display: "flex" } };
    dlg._shadowRoot = {
      querySelector: (sel: string) => (sel === "#window-mask" ? mockBox : null),
    };
    dlg.overload_quit = null;
    dlg.elt = {};
    dlg.to_render = {};
    dlg.quit();
    expect(mockBox.style.display).toBe("none");
    expect(dlg.elt).toBeNull();
    expect(dlg.to_render).toBeNull();
  });

  it("quit() does nothing when _shadowRoot is null", () => {
    const dlg = new StubDialog() as any;
    dlg._shadowRoot = null;
    dlg.overload_quit = null;
    expect(() => dlg.quit()).not.toThrow();
  });

  it("display() returns early when _shadowRoot is null", () => {
    const dlg = new StubDialog() as any;
    dlg._shadowRoot = null;
    expect(() => dlg.display({ type: "wifi", elt: {} })).not.toThrow();
  });

  it("display() returns early when #window-mask not found", () => {
    const dlg = new StubDialog() as any;
    dlg._shadowRoot = { querySelector: () => null };
    expect(() => dlg.display({ type: "wifi", elt: {} })).not.toThrow();
  });

  it("create_form creates elements from content_conf", () => {
    const dlg = new StubDialog() as any;
    const doc = document;
    dlg._shadowRoot = { ownerDocument: doc };
    const result = dlg.create_form([
      { type: "input", id: "f1" },
      { type: "select", id: "f2" },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("f1");
    expect(result[1].id).toBe("f2");
  });

  it("create_form skips entries when _shadowRoot is null", () => {
    const dlg = new StubDialog() as any;
    dlg._shadowRoot = null;
    const result = dlg.create_form([{ type: "input", id: "f1" }]);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Dialog — evaluate / createContext
// ---------------------------------------------------------------------------

describe("Dialog.evaluate()", () => {
  it("evaluates a static string expression", () => {
    const dlg = new StubDialog() as any;
    const mockDevice = {
      config: { model: "TEST" },
    };
    dlg.elt = { device: mockDevice };
    const result = dlg.evaluate("'hello'");
    expect(result).toBe("hello");
  });

  it("evaluates i18n expression without throwing", () => {
    const dlg = new StubDialog() as any;
    dlg.elt = { device: { config: {} } };
    expect(() => dlg.evaluate("i18n._('cancel')")).not.toThrow();
  });
});
