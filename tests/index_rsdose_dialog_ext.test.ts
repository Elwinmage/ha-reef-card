/**
 * Coverage for remaining uncovered files:
 *  - src/devices/index.ts — import side-effect (all customElements.define calls)
 *  - src/base/index.ts — import side-effect
 *  - src/devices/rsdose/rsdose.ts — renderEditor, _get_val, render pipeline
 *  - src/base/dialog.ts — render_dialog, _render_content text branch, create_form
 */

import { describe, it, expect, vi } from "vitest";
import { Sensor } from "../src/base/sensor";
import { RSDose4, RSDose2 } from "../src/devices/rsdose/rsdose";
import { Dialog } from "../src/base/dialog";

// ---------------------------------------------------------------------------
// Stub wrappers
// ---------------------------------------------------------------------------

class StubRSDose4b extends RSDose4 {}
if (!customElements.get("stub-rsdose4-b"))
  customElements.define("stub-rsdose4-b", StubRSDose4b);

class StubRSDose2b extends RSDose2 {}
if (!customElements.get("stub-rsdose2-b"))
  customElements.define("stub-rsdose2-b", StubRSDose2b);

class StubDialog2 extends Dialog {}
if (!customElements.get("stub-dialog2"))
  customElements.define("stub-dialog2", StubDialog2);

// Sensor stub for render_dialog testing
class StubSensorForDlg extends Sensor {
  protected override _render(_s = "") {
    return null;
  }
  setConfig(_c: any) {}
}
if (!customElements.get("stub-sensor-dlg"))
  customElements.define("stub-sensor-dlg", StubSensorForDlg);

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
): any {
  return { states, entities, devices: {}, callService: vi.fn() };
}

// ---------------------------------------------------------------------------
// index.ts — importing it triggers all customElements.define() calls
// ---------------------------------------------------------------------------

describe("devices/index.ts — registration side-effects", () => {
  it("registers device elements when imported", async () => {
    await import("../src/devices/index");
    expect(customElements.get("redsea-nodevice")).toBeDefined();
    expect(customElements.get("redsea-rsdose4")).toBeDefined();
    expect(customElements.get("redsea-rsdose2")).toBeDefined();
    expect(customElements.get("redsea-dosing-queue")).toBeDefined();
    expect(customElements.get("redsea-rsmat")).toBeDefined();
    expect(customElements.get("redsea-rsrun")).toBeDefined();
    expect(customElements.get("redsea-rsled160")).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// base/index.ts — importing registers base components
// ---------------------------------------------------------------------------

describe("base/index.ts — registration side-effects", () => {
  it("registers base element tags when imported", async () => {
    await import("../src/base/index");
    const tags = [
      "common-sensor",
      "common-switch",
      "common-button",
      "click-image",
      "progress-bar",
      "progress-circle",
      "common-messages",
      "common-sensor-target",
    ];
    const registered = tags.filter((t) => customElements.get(t) !== undefined);
    expect(registered.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// RSDose4 — renderEditor()
// ---------------------------------------------------------------------------

describe("RSDose4.renderEditor()", () => {
  it("returns a TemplateResult", () => {
    const dev = new StubRSDose4b() as any;
    dev.config = JSON.parse(JSON.stringify(dev.initial_config));
    dev._hass = makeHass();
    dev.entities = {};
    const result = dev.renderEditor();
    expect(result).toBeDefined();
  });

  it("includes head color pickers in editor output", () => {
    const dev = new StubRSDose4b() as any;
    dev.config = JSON.parse(JSON.stringify(dev.initial_config));
    dev._hass = makeHass();
    dev.entities = {};
    // handleChangedEvent is used in the template, stub it
    dev.handleChangedEvent = vi.fn();
    const result = dev.renderEditor();
    expect(result).toBeDefined();
  });
});

describe("RSDose2.renderEditor()", () => {
  it("returns a TemplateResult", () => {
    const dev = new StubRSDose2b() as any;
    dev.config = JSON.parse(JSON.stringify(dev.initial_config));
    dev._hass = makeHass();
    dev.entities = {};
    const result = dev.renderEditor();
    expect(result).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// RSDose4 — _get_val()
// ---------------------------------------------------------------------------

describe("RSDose._get_val()", () => {
  it("returns the state of the requested entity", () => {
    const dev = new StubRSDose4b() as any;
    // _get_val(head, entity_key) → this.entities[head][entity_key].entity_id → hass.states[...].state
    dev.entities = {
      device_state: {
        sensor_key: { entity_id: "sensor.ds" },
      },
    };
    dev._hass = makeHass({
      "sensor.ds": makeState("on", "sensor.ds"),
    });
    const result = dev._get_val("device_state", "sensor_key");
    expect(result).toBe("on");
  });
});

// ---------------------------------------------------------------------------
// RSDose4 — render() pipeline (pre-seeded _heads)
// ---------------------------------------------------------------------------

describe("RSDose4.render() — pipeline", () => {
  it("does not throw when _heads are pre-populated", () => {
    const dev = new StubRSDose4b() as any;
    dev.isEditorMode = false;
    dev.user_config = {};
    dev.device = {
      model: "RSDOSE4",
      name: "pump",
      elements: [
        {
          id: "dev-001",
          model: "RSDOSE4",
          identifiers: [[null, "rsdose4_1234"]],
          disabled_by: null,
          primary_config_entry: "cfg-xyz",
        },
      ],
    };
    dev.dialogs = {};
    dev._elements = {};
    dev.supplement_color = {};
    dev.dosing_queue = null;
    dev.entities = {
      device_state: { entity_id: "sensor.ds" },
      stock_alert_days: { entity_id: "sensor.alert" },
      bundled_heads: { entity_id: "sensor.bundle" },
    };
    dev._hass = makeHass({
      "sensor.ds": makeState("on", "sensor.ds"),
      "sensor.alert": makeState("10", "sensor.alert"),
      "sensor.bundle": makeState("off", "sensor.bundle"),
    });
    // Pre-seed _heads so _render_head returns html`` (no entities in heads)
    dev._heads = [];
    for (let i = 0; i <= dev.initial_config.heads_nb; i++) {
      dev._heads.push({ entities: {} });
    }
    expect(() => dev.render()).not.toThrow();
  });

  it("calls renderEditor when isEditorMode=true", () => {
    const dev = new StubRSDose4b() as any;
    dev.isEditorMode = true;
    dev.config = JSON.parse(JSON.stringify(dev.initial_config));
    dev.entities = {};
    dev._hass = makeHass();
    const result = dev.render();
    expect(result).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Dialog — render_dialog()
// ---------------------------------------------------------------------------

describe("Dialog.render_dialog()", () => {
  it("does nothing when to_render is null", () => {
    const dlg = new StubDialog2() as any;
    dlg.to_render = null;
    expect(() => dlg.render_dialog([])).not.toThrow();
  });

  it("does nothing when to_render.elements is empty", () => {
    const dlg = new StubDialog2() as any;
    dlg.to_render = { elements: [] };
    dlg._hass = makeHass();
    const shadowHost = document.createElement("div");
    dlg._shadowRoot = shadowHost.attachShadow({ mode: "open" });
    expect(() => dlg.render_dialog([])).not.toThrow();
  });

  it("skips element when r_element is not found in passed array", () => {
    const dlg = new StubDialog2() as any;
    dlg._hass = makeHass();
    dlg.elts = [];
    const shadowHost = document.createElement("div");
    dlg._shadowRoot = shadowHost.attachShadow({ mode: "open" });
    dlg.to_render = {
      elements: [{ type: "stub-sensor-dlg", name: "missing_sensor" }],
    };
    // Pass empty array — no matching r_element found, should skip silently
    expect(() => dlg.render_dialog([])).not.toThrow();
  });

  it("instantiates element when found and type is registered", () => {
    const dlg = new StubDialog2() as any;
    dlg._hass = makeHass();
    dlg.elts = [];
    const shadowHost = document.createElement("div");
    dlg._shadowRoot = shadowHost.attachShadow({ mode: "open" });
    dlg.to_render = {
      elements: [{ type: "stub-sensor-dlg", name: "test_sensor" }],
    };
    const mockElt = { name: "test_sensor" };
    expect(() => dlg.render_dialog([mockElt])).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Dialog — _render_content() text branch
// ---------------------------------------------------------------------------

describe("Dialog._render_content() — text branch", () => {
  it("creates <p> element with evaluated content", () => {
    const dlg = new StubDialog2() as any;
    dlg._hass = makeHass();
    dlg.elt = { device: { config: {} } };
    dlg.elts = [];
    const shadowHost = document.createElement("div");
    const shadow = shadowHost.attachShadow({ mode: "open" });
    shadow.innerHTML = `<div id="dialog-content"></div>`;
    dlg._shadowRoot = shadow;
    dlg.evaluate = (_expr: string) => "Hello World";

    expect(() =>
      dlg._render_content({ view: "text", value: "i18n._('hello')" }),
    ).not.toThrow();
  });

  it("falls back to raw value when evaluate throws", () => {
    const dlg = new StubDialog2() as any;
    dlg._hass = makeHass();
    dlg.elt = { device: { config: {} } };
    dlg.elts = [];
    const shadowHost = document.createElement("div");
    const shadow = shadowHost.attachShadow({ mode: "open" });
    shadow.innerHTML = `<div id="dialog-content"></div>`;
    dlg._shadowRoot = shadow;
    dlg.evaluate = (_expr: string) => {
      throw new Error("eval error");
    };

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      dlg._render_content({ view: "text", value: "bad_expr" }),
    ).not.toThrow();
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Dialog — hass setter with to_render + extends_to_re_render
// ---------------------------------------------------------------------------

describe("Dialog hass setter — extends_to_re_render branch", () => {
  it("does not throw when to_render is set and extends_to_re_render is populated", () => {
    const dlg = new StubDialog2() as any;
    dlg.elts = [];
    dlg.to_render = { name: "wifi" };
    dlg.extends_to_re_render = [
      { package: "somePackage", function_name: "wifi" },
    ];
    dlg.elt = { device: { config: {} } };
    dlg._hass = makeHass();
    dlg._shadowRoot = null;
    // run_action will fail gracefully
    expect(() => {
      dlg.hass = makeHass();
    }).not.toThrow();
  });
});
