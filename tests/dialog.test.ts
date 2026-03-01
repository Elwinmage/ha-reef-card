// Consolidated tests for dialog

import { Dialog } from "../src/base/dialog";
import { MyElement } from "../src/base/element";
import { Sensor } from "../src/base/sensor";
import { DoseHead } from "../src/devices/rsdose/dose_head";
import { RSDose2, RSDose4 } from "../src/devices/rsdose/rsdose";
import { run_action } from "../src/utils/actions";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RSDevice from "../src/devices/device";
import "../src/base/index";

function makeHass(extra: Record<string, any> = {}): any {
  return {
    states: {
      "sensor.x": { entity_id: "sensor.x", state: "on", attributes: {} },
      ...extra,
    },
    callService: vi.fn(),
    devices: {},
    entities: [],
  };
}
function makeDevice(): any {
  return {
    entities: {},
    config: { color: "51,151,232", alpha: 0.8 },
    is_on: () => true,
  };
}
function makeElt(type = "default"): any {
  return {
    device: makeDevice(),
    get_entity: (k: string) => ({ entity_id: `sensor.${k}` }),
  };
}
class StubDialog extends Dialog {}
if (!customElements.get("stub-dialog-x"))
  customElements.define("stub-dialog-x", StubDialog);
vi.mock("../src/utils/actions", () => ({ run_action: vi.fn() }));
class StubDialog_B extends StubDialog {}
if (!customElements.get("stub-dialog-cov"))
  customElements.define("stub-dialog-cov", StubDialog_B);
class StubView extends HTMLElement {
  hass: any = null;
  device: any = null;
  setConfig(_c: any) {}
}
if (!customElements.get("stub-view-cov"))
  customElements.define("stub-view-cov", StubView);
function makeHass_B(states: Record<string, any> = {}): any {
  return { states, entities: {}, devices: {}, callService: vi.fn() };
}
function makeDevice_B(extraEntities: Record<string, any> = {}): any {
  const entities = { s1: { entity_id: "sensor.s1" }, ...extraEntities };
  return {
    config: { color: "0,200,100", alpha: 0.8, name: "dev" },
    entities,
    is_on: () => true,
    masterOn: true,
    get_entity: (k: string) => entities[k] ?? null,
  };
}
function makeElt_B(device?: any): any {
  const dev = device ?? makeDevice();
  return {
    device: dev,
    get_entity: (k: string) => dev.get_entity(k),
  };
}
function makeSR() {
  const host = document.createElement("div");
  const sr = host.attachShadow({ mode: "open" });
  sr.innerHTML = `<div id="dialog-box"> <div id="bt_left"></div> <div id="bt_center"></div> <div id="bt_right"></div> <div id="dialog-close"></div> </div>`;
  return sr;
}
function makeDlg(): any {
  const dlg = new StubDialog() as any;
  dlg._hass = makeHass();
  dlg._shadowRoot = makeSR();
  dlg.elt = makeElt();
  dlg.elts = [];
  dlg.extends_to_re_render = [];
  dlg.to_render = null;
  dlg.overload_quit = null;
  dlg.config = {};
  dlg.evalCtx = null;
  return dlg;
}
function uid(p = "dlg") {
  return `${p}-${Math.random().toString(36).slice(2)}`;
}
function makeHass_C(states: Record<string, any> = {}) {
  return { states, devices: {}, callService: vi.fn(), entities: {} };
}
async function makeDialog() {
  const { Dialog } = await import("../src/base/dialog");
  if (!customElements.get("common-dialog"))
    customElements.define("common-dialog", Dialog);
  const dlg = document.createElement("common-dialog") as any;
  return { dlg, Dialog };
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
class StubDialog_C extends StubDialog {}
if (!customElements.get("stub-dialog-ext"))
  customElements.define("stub-dialog-ext", StubDialog_C);
class StubDoseHeadForDevice extends DoseHead {
  override render(): any {
    return this._render();
  }
}
if (!customElements.get("redsea-dose-head"))
  customElements.define("redsea-dose-head", StubDoseHeadForDevice);
function makeState(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass_D(
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
class StubRSDose4b extends RSDose4 {}
if (!customElements.get("stub-rsdose4-b"))
  customElements.define("stub-rsdose4-b", StubRSDose4b);
class StubRSDose2b extends RSDose2 {}
if (!customElements.get("stub-rsdose2-b"))
  customElements.define("stub-rsdose2-b", StubRSDose2b);
class StubDialog2 extends Dialog {}
if (!customElements.get("stub-dialog2"))
  customElements.define("stub-dialog2", StubDialog2);
class StubSensorForDlg extends Sensor {
  protected override _render(_s = "") {
    return null;
  }
  setConfig(_c: any) {}
}
if (!customElements.get("stub-sensor-dlg"))
  customElements.define("stub-sensor-dlg", StubSensorForDlg);
function makeHass_E(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
): any {
  return { states, entities, devices: {}, callService: vi.fn() };
}

describe("Dialog.render_shell()", () => {
  it("returns a string containing #window-mask", () => {
    const d = new StubDialog() as any;
    const shell = d.render_shell();
    expect(shell).toContain("window-mask");
  });

  it("contains #dialog-title and #dialog-content slots", () => {
    const d = new StubDialog() as any;
    const shell = d.render_shell();
    expect(shell).toContain("dialog-title");
    expect(shell).toContain("dialog-content");
  });

  it("contains bt_left, bt_center, bt_right button slots", () => {
    const d = new StubDialog() as any;
    const shell = d.render_shell();
    expect(shell).toContain("bt_left");
    expect(shell).toContain("bt_center");
    expect(shell).toContain("bt_right");
  });
});
describe("Dialog.set_conf()", () => {
  it("stores the config object", () => {
    const d = new StubDialog() as any;
    const config = { my_dialog: { title_key: "hello", content: [] } };
    d.set_conf(config);
    expect(d.config).toBe(config);
  });
});
describe("Dialog.quit()", () => {
  it("calls display() with overload_quit type when set", () => {
    const d = new StubDialog() as any;
    d.overload_quit = "next_screen";
    d.elt = makeElt();
    d.display = vi.fn();
    d.quit();
    expect(d.display).toHaveBeenCalledWith({ type: "next_screen", elt: d.elt });
  });

  it("hides the dialog box when no overload_quit", () => {
    const d = new StubDialog() as any;
    d.overload_quit = null;
    const box = { style: { display: "flex" } };
    d._shadowRoot = { querySelector: () => box };
    d.quit();
    expect(box.style.display).toBe("none");
    expect(d.elt).toBeNull();
    expect(d.to_render).toBeNull();
  });

  // L116: box found → sets display=none and nullifies elt (no to_render check)
  it("L116: hides box and nullifies elt when box found", () => {
    const dlg = makeDlg();
    dlg.overload_quit = null;
    const box = { style: { display: "flex" } };
    dlg._shadowRoot = { querySelector: () => box };
    dlg.quit();
    expect(box.style.display).toBe("none");
    expect(dlg.elt).toBeNull();
  });

  // L116: box null → querySelector returns null, no throw
  it("L116: does not throw when box is null", () => {
    const dlg = makeDlg();
    dlg.overload_quit = null;
    dlg._shadowRoot = { querySelector: () => null };
    expect(() => dlg.quit()).not.toThrow();
  });

  it("does nothing when _shadowRoot is null and no overload_quit", () => {
    const d = new StubDialog() as any;
    d.overload_quit = null;
    d._shadowRoot = null;
    expect(() => d.quit()).not.toThrow();
  });
});
describe("Dialog hass setter", () => {
  it("updates _hass", () => {
    const d = new StubDialog() as any;
    const hass = makeHass();
    d.elts = [];
    d.hass = hass;
    expect(d._hass).toBe(hass);
  });

  it("propagates hass to child elts", () => {
    const d = new StubDialog() as any;
    const child = { hass: null };
    d.elts = [child];
    d.to_render = null;
    const hass = makeHass();
    d.hass = hass;
    expect(child.hass).toBe(hass);
  });
});
describe("Dialog.create_form()", () => {
  it("returns empty array for empty input", () => {
    const d = new StubDialog() as any;
    d._shadowRoot = {
      ownerDocument: document,
      querySelector: () => null,
    };
    expect(d.create_form([])).toEqual([]);
  });

  it("creates an element for each input entry", () => {
    const d = new StubDialog() as any;
    d._shadowRoot = {
      ownerDocument: document,
      querySelector: () => null,
    };
    const result = d.create_form([
      { type: "input", id: "field_1" },
      { type: "select", id: "field_2" },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("field_1");
    expect(result[1].id).toBe("field_2");
  });

  it("skips entries when _shadowRoot has no ownerDocument", () => {
    const d = new StubDialog() as any;
    d._shadowRoot = null;
    const result = d.create_form([{ type: "input", id: "x" }]);
    expect(result).toHaveLength(0);
  });
});
describe("Dialog.evaluate()", () => {
  it("evaluates a static string through SafeEval", () => {
    const d = new StubDialog() as any;
    d.elt = makeElt();
    const result = d.evaluate("'hello'");
    expect(result).toBe("hello");
  });

  it("evaluates a number expression", () => {
    const d = new StubDialog() as any;
    d.elt = makeElt();
    const result = d.evaluate("1 + 1");
    expect(result).toBe(2);
  });
});
describe("Dialog.createContext() — evalCtx already set (L69 false)", () => {
  it("does not overwrite existing evalCtx", () => {
    const dlg = makeDlg();
    const ctx = { evaluate: vi.fn().mockReturnValue("x") };
    dlg.evalCtx = ctx;
    dlg.createContext();
    expect(dlg.evalCtx).toBe(ctx);
  });
});
describe("Dialog.init() (L84-89)", () => {
  it("stores hass + shadowRoot and appends shell HTML", () => {
    const dlg = new StubDialog_B() as any;
    const host = document.createElement("div");
    const appended: any[] = [];
    host.appendChild = (n: any) => {
      appended.push(n);
      return n;
    };
    const hass = makeHass_B();
    dlg.init(hass, host);
    expect(dlg._hass).toBe(hass);
    expect(dlg._shadowRoot).toBe(host);
    expect(appended.length).toBe(1);
  });
});
describe("Dialog.display()", () => {
  it("L97: returns early when _shadowRoot is null", () => {
    const dlg = makeDlg();
    dlg._shadowRoot = null;
    const spy = vi.spyOn(dlg, "_fill_content").mockImplementation(() => {});
    dlg.display({ type: "x", elt: makeElt_B() });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("L98: returns early when #window-mask not found", () => {
    const dlg = makeDlg();
    dlg._shadowRoot = { querySelector: () => null };
    const spy = vi.spyOn(dlg, "_fill_content").mockImplementation(() => {});
    dlg.display({ type: "x", elt: makeElt_B() });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("L99-104: full path — sets elt/to_render, calls _fill_content, shows box", () => {
    const dlg = makeDlg();
    dlg.config = { mytype: { title_key: "'T'" } };
    const box = { style: { display: "" } };
    dlg._shadowRoot = {
      querySelector: (s: string) => (s === "#window-mask" ? box : null),
    };
    const spy = vi.spyOn(dlg, "_fill_content").mockImplementation(() => {});
    const elt = makeElt_B();
    dlg.display({ type: "mytype", elt, overload_quit: "back" });
    expect(dlg.elt).toBe(elt);
    expect(dlg.overload_quit).toBe("back");
    expect(box.style.display).toBe("flex");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
describe("Dialog.set hass() — elts falsy (L126 false)", () => {
  it("does not throw when elts is null", () => {
    const dlg = makeDlg();
    dlg.elts = null;
    dlg.to_render = null;
    expect(() => {
      dlg.hass = makeHass_B();
    }).not.toThrow();
  });

  it("propagates hass to every elt when elts is an array", () => {
    const dlg = makeDlg();
    const fakeElt = { hass: null };
    dlg.elts = [fakeElt];
    dlg.to_render = null;
    const h = makeHass_B();
    dlg.hass = h;
    expect(fakeElt.hass).toBe(h);
  });
});
describe("Dialog.create_form() — doc=null branch (L154)", () => {
  it("skips entry when shadowRoot.ownerDocument is null", () => {
    const dlg = makeDlg();
    dlg._shadowRoot = { ownerDocument: null };
    expect(dlg.create_form([{ type: "input", id: "f1" }])).toHaveLength(0);
  });

  it("skips entry when _shadowRoot is null", () => {
    const dlg = makeDlg();
    dlg._shadowRoot = null;
    expect(dlg.create_form([{ type: "input", id: "f1" }])).toHaveLength(0);
  });
});
describe("Dialog.render_dialog() — _shadowRoot and Element branches", () => {
  it("L174: skips when custom element not registered for type", () => {
    const dlg = makeDlg();
    dlg.to_render = { elements: [{ type: "no-such-element-xyz", name: "e1" }] };
    dlg.render_dialog([{ name: "e1" }]);
    expect(dlg.elts).toHaveLength(0);
  });

  it("L184 true: appends elt to _shadowRoot when present", () => {
    const dlg = makeDlg();
    dlg.to_render = { elements: [{ type: "stub-view-cov", name: "e1" }] };
    const appended: any[] = [];
    dlg._shadowRoot = { appendChild: (el: any) => appended.push(el) };
    dlg.render_dialog([{ name: "e1" }]);
    expect(dlg.elts).toHaveLength(1);
    expect(appended).toHaveLength(1);
  });

  it("L184 false: does not append when _shadowRoot is null", () => {
    const dlg = makeDlg();
    dlg.to_render = { elements: [{ type: "stub-view-cov", name: "e1" }] };
    dlg._shadowRoot = null;
    dlg.render_dialog([{ name: "e1" }]);
    expect(dlg.elts).toHaveLength(1);
  });
});
describe("Dialog._render_content() — common-button branch (L193-194)", () => {
  it("calls MyElement.create_element and pushes to elts", () => {
    const dlg = makeDlg();
    const stub = document.createElement("div") as any;
    stub.hass = null;
    stub.device = null;
    const spy = vi.spyOn(MyElement, "create_element").mockReturnValue(stub);
    const appendSpy = vi.fn();
    dlg._shadowRoot = { querySelector: () => ({ appendChild: appendSpy }) };

    dlg._render_content({
      view: "common-button",
      conf: { type: "common-button", name: "ok", stateObj: null },
    });

    expect(spy).toHaveBeenCalled();
    expect(dlg.elts).toContain(stub);
    spy.mockRestore();
  });
});
describe("Dialog._render_content() — text branch (L199-207)", () => {
  it("L199: creates <p> and evaluates content", () => {
    const dlg = makeDlg();
    const appended: any[] = [];
    dlg._shadowRoot = {
      appendChild: (el: any) => appended.push(el),
      querySelector: () => ({ appendChild: vi.fn() }),
    };
    dlg._render_content({ view: "text", value: "'world'" });
    const p = appended.find((e: any) => e.tagName === "P");
    expect(p).toBeDefined();
    expect(p.innerHTML).toBe("world");
  });
});
describe("Dialog._render_content() — extend branch (L208-223)", () => {
  it("L208: calls run_action with extend package", () => {
    vi.mocked(run_action).mockReset();
    const dlg = makeDlg();
    dlg.to_render = { name: "myDlg" };
    dlg._render_content({ view: "extend", extend: "pkg", re_render: false });
    expect(run_action).toHaveBeenCalledWith(
      "pkg",
      "myDlg",
      dlg.elt,
      dlg._hass,
      dlg._shadowRoot,
    );
    expect(dlg.extends_to_re_render).toHaveLength(0);
  });

  it("L217: re_render=true → pushes to extends_to_re_render", () => {
    vi.mocked(run_action).mockReset();
    const dlg = makeDlg();
    dlg.to_render = { name: "myDlg" };
    dlg._render_content({ view: "extend", extend: "pkg", re_render: true });
    expect(dlg.extends_to_re_render).toHaveLength(1);
    expect(dlg.extends_to_re_render[0]).toEqual({
      package: "pkg",
      function_name: "myDlg",
    });
  });
});
describe("Dialog._render_content() — else branch: custom view (L224-250)", () => {
  function makeFilledDlg() {
    const dev = makeDevice_B({ s1: { entity_id: "sensor.s1" } });
    const dlg = makeDlg();
    dlg.elt = makeElt_B(dev);
    const appended: any[] = [];
    dlg._shadowRoot = {
      querySelector: () => ({ appendChild: (el: any) => appended.push(el) }),
    };
    return { dlg, appended };
  }

  it("L229-234: entities string → resolves entity_id via get_entity", () => {
    const { dlg, appended } = makeFilledDlg();
    dlg._render_content({
      view: "stub-view-cov",
      conf: { type: "stub-view-cov", entities: { pos0: "s1" } },
    });
    expect(appended[0]).toBeDefined();
  });

  it("L235-238: entities object → resolves entity from .entity key", () => {
    const { dlg, appended } = makeFilledDlg();
    dlg._render_content({
      view: "stub-view-cov",
      conf: { type: "stub-view-cov", entities: { pos0: { entity: "s1" } } },
    });
    expect(appended[0]).toBeDefined();
  });

  it("L241-242: entity (not entities) → resolves single entity_id", () => {
    const { dlg, appended } = makeFilledDlg();
    dlg._render_content({
      view: "stub-view-cov",
      conf: { type: "stub-view-cov", entity: "s1" },
    });
    expect(appended[0]).toBeDefined();
  });

  it("L241 false branch: conf with neither entities nor entity → skips both branches", () => {
    const { dlg, appended } = makeFilledDlg();

    dlg._render_content({
      view: "stub-view-cov",
      conf: { type: "stub-view-cov", name: "plain" },
    });
    expect(appended[0]).toBeDefined();
  });
});
describe("Dialog._fill_content() — to_render=null (L277)", () => {
  it("does nothing when to_render is null", () => {
    const dlg = makeDlg();
    dlg.to_render = null;
    expect(() => dlg._fill_content()).not.toThrow();
  });
});
describe("Dialog._fill_content() — full path", () => {
  function setupFill(toRender: any) {
    const dlg = makeDlg();
    dlg.to_render = toRender;

    const host = document.createElement("div");
    const sr = host.attachShadow({ mode: "open" });

    sr.innerHTML = `
      <div id="dialog-close"></div>
      <div id="dialog-title"></div>
      <div id="dialog-content"></div>
      <div id="bt_left"></div>
      <div id="bt_center"></div>
      <div id="bt_right"></div>`;
    dlg._shadowRoot = sr;

    const stubEl = document.createElement("div") as any;
    vi.spyOn(MyElement, "create_element").mockReturnValue(stubEl);

    dlg._render_content = vi.fn();
    return dlg;
  }

  it("L295-299: validate key → submit_conf replaced by to_render.validate", () => {
    const dlg = setupFill({
      title_key: "'T'",
      content: [],
      validate: { type: "common-button", name: "ok", label: "OK" },
    });
    expect(() => dlg._fill_content()).not.toThrow();

    expect(
      dlg._shadowRoot.querySelector("#bt_right").children.length,
    ).toBeGreaterThanOrEqual(1);
    vi.restoreAllMocks();
  });

  it("L301: cancel=true → cancel_conf is built, bt_left gets a button", () => {
    const dlg = setupFill({
      title_key: "'T'",
      content: [],
      cancel: true,
    });
    expect(() => dlg._fill_content()).not.toThrow();
    expect(
      dlg._shadowRoot.querySelector("#bt_left").children.length,
    ).toBeGreaterThanOrEqual(1);
    vi.restoreAllMocks();
  });

  it("L314 true: no close_cross key → close cross created and appended", () => {
    const dlg = setupFill({ title_key: "'T'", content: [] });

    expect(() => dlg._fill_content()).not.toThrow();
    vi.restoreAllMocks();
  });

  it("L314 false: close_cross=false → no close cross appended", () => {
    const dlg = setupFill({
      title_key: "'T'",
      content: [],
      close_cross: false,
    });
    dlg._fill_content();
    expect(dlg._shadowRoot.querySelector("#dialog-close").children.length).toBe(
      0,
    );
    vi.restoreAllMocks();
  });

  it("L340: other key → bt_center gets a button", () => {
    const dlg = setupFill({
      title_key: "'T'",
      content: [],
      other: { conf: { type: "common-button", name: "other", label: "Other" } },
    });
    expect(() => dlg._fill_content()).not.toThrow();
    expect(
      dlg._shadowRoot.querySelector("#bt_center").children.length,
    ).toBeGreaterThanOrEqual(1);
    vi.restoreAllMocks();
  });

  it("L349: cancel_conf set → bt_left button appended", () => {
    const dlg = setupFill({ title_key: "'T'", content: [], cancel: true });
    dlg._fill_content();
    expect(
      dlg._shadowRoot.querySelector("#bt_left").children.length,
    ).toBeGreaterThanOrEqual(1);
    vi.restoreAllMocks();
  });
});
describe("Dialog.render_dialog L166 — elements falsy → empty array branch", () => {
  it("does not iterate when to_render.elements is undefined", async () => {
    const { dlg } = await makeDialog();
    dlg.to_render = { elements: undefined };
    expect(() => dlg.render_dialog([])).not.toThrow();
  });
});
describe("Dialog._render_content L241 — entity key present branch", () => {
  it("resolves entity_id when 'entity' is in content_conf.conf", async () => {
    const { dlg } = await makeDialog();
    dlg._hass = makeHass_C();
    dlg.elts = [];

    const fakeEntityResult = { entity_id: "sensor.real" };
    dlg.elt = {
      get_entity: vi.fn().mockReturnValue(fakeEntityResult),
      device: { name: "dev" },
    };

    const viewTag = uid("dlg-view");
    class ViewEl extends HTMLElement {
      setConfig(_c: any) {}
      hass: any = null;
      device: any = null;
    }
    customElements.define(viewTag, ViewEl);

    const shadow = document.createElement("div");
    shadow.innerHTML = `<div id="dialog-content"></div>`;
    dlg._shadowRoot = shadow;

    const content_conf = {
      view: viewTag,
      conf: {
        entity: "temperature",
        name: "temp",
      },
    };

    dlg._render_content(content_conf);
    expect(dlg.elt.get_entity).toHaveBeenCalledWith("temperature");
  });
});
describe("Dialog L330 — to_render.content.map executed", () => {
  it("calls _render_content for each item in to_render.content", async () => {
    const { dlg } = await makeDialog();

    const container = document.createElement("div");
    container.innerHTML = `
      <div id="window-mask" style="display:none"></div>
      <div id="dialog-close"></div>
      <div id="dialog-title"></div>
      <div id="dialog-content"></div>
      <div id="bt_left"></div>
      <div id="bt_center"></div>
      <div id="bt_right"></div>
    `;
    dlg._shadowRoot = container;
    dlg._hass = makeHass_C();
    dlg.evaluate = vi.fn().mockReturnValue("");
    dlg.elts = [];
    dlg.extends_to_re_render = [];
    dlg.overload_quit = null;
    dlg.evalCtx = null;
    dlg.elt = {
      device: { name: "d" },
      get_entity: vi.fn().mockReturnValue({ entity_id: "sensor.x" }),
    };

    if (!customElements.get("click-image")) {
      class FakeClickImage extends HTMLElement {
        conf: any;
        hass: any;
      }
      customElements.define("click-image", FakeClickImage);
    }

    const renderSpy = vi
      .spyOn(dlg, "_render_content")
      .mockImplementation(() => {});

    const createSpy = vi
      .spyOn(MyElement, "create_element")
      .mockImplementation(() => {
        return document.createElement("div");
      });

    dlg.to_render = {
      title_key: "title",
      content: [
        { view: "text", value: "a" },
        { view: "text", value: "b" },
      ],
      other: null,
      submit: { label_key: "ok" },
    };

    dlg._fill_content();

    expect(renderSpy).toHaveBeenCalledTimes(2);
    renderSpy.mockRestore();
    createSpy.mockRestore();
  });
});
describe("Dialog — basic methods", () => {
  it("render_shell returns html string with window-mask", () => {
    const dlg = new StubDialog_C() as any;
    const shell = dlg.render_shell();
    expect(shell).toContain("window-mask");
    expect(shell).toContain("dialog-content");
  });

  it("set_conf stores config", () => {
    const dlg = new StubDialog_C() as any;
    const cfg = { wifi: { title_key: "i18n._('wifi')" } };
    dlg.set_conf(cfg);
    expect(dlg.config).toBe(cfg);
  });

  it("hass setter stores _hass and propagates to elts", () => {
    const dlg = new StubDialog_C() as any;
    const mockElt = { hass: null };
    dlg.elts = [mockElt];
    dlg.to_render = null;
    dlg.extends_to_re_render = [];
    const hass = makeHass_D();
    dlg.hass = hass;
    expect(dlg._hass).toBe(hass);
    expect(mockElt.hass).toBe(hass);
  });

  it("quit() hides window-mask when _shadowRoot is set", () => {
    const dlg = new StubDialog_C() as any;
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
    const dlg = new StubDialog_C() as any;
    dlg._shadowRoot = null;
    dlg.overload_quit = null;
    expect(() => dlg.quit()).not.toThrow();
  });

  it("display() returns early when _shadowRoot is null", () => {
    const dlg = new StubDialog_C() as any;
    dlg._shadowRoot = null;
    expect(() => dlg.display({ type: "wifi", elt: {} })).not.toThrow();
  });

  it("display() returns early when #window-mask not found", () => {
    const dlg = new StubDialog_C() as any;
    dlg._shadowRoot = { querySelector: () => null };
    expect(() => dlg.display({ type: "wifi", elt: {} })).not.toThrow();
  });

  it("create_form creates elements from content_conf", () => {
    const dlg = new StubDialog_C() as any;
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
    const dlg = new StubDialog_C() as any;
    dlg._shadowRoot = null;
    const result = dlg.create_form([{ type: "input", id: "f1" }]);
    expect(result).toHaveLength(0);
  });
});
describe("Dialog.render_dialog()", () => {
  it("does nothing when to_render is null", () => {
    const dlg = new StubDialog2() as any;
    dlg.to_render = null;
    expect(() => dlg.render_dialog([])).not.toThrow();
  });

  it("does nothing when to_render.elements is empty", () => {
    const dlg = new StubDialog2() as any;
    dlg.to_render = { elements: [] };
    dlg._hass = makeHass_E();
    const shadowHost = document.createElement("div");
    dlg._shadowRoot = shadowHost.attachShadow({ mode: "open" });
    expect(() => dlg.render_dialog([])).not.toThrow();
  });

  it("skips element when r_element is not found in passed array", () => {
    const dlg = new StubDialog2() as any;
    dlg._hass = makeHass_E();
    dlg.elts = [];
    const shadowHost = document.createElement("div");
    dlg._shadowRoot = shadowHost.attachShadow({ mode: "open" });
    dlg.to_render = {
      elements: [{ type: "stub-sensor-dlg", name: "missing_sensor" }],
    };

    expect(() => dlg.render_dialog([])).not.toThrow();
  });

  it("instantiates element when found and type is registered", () => {
    const dlg = new StubDialog2() as any;
    dlg._hass = makeHass_E();
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
describe("Dialog._render_content() — text branch", () => {
  it("creates <p> element with evaluated content", () => {
    const dlg = new StubDialog2() as any;
    dlg._hass = makeHass_E();
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
    dlg._hass = makeHass_E();
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
describe("Dialog hass setter — extends_to_re_render branch", () => {
  it("does not throw when to_render is set and extends_to_re_render is populated", () => {
    const dlg = new StubDialog2() as any;
    dlg.elts = [];
    dlg.to_render = { name: "wifi" };
    dlg.extends_to_re_render = [
      { package: "somePackage", function_name: "wifi" },
    ];
    dlg.elt = { device: { config: {} } };
    dlg._hass = makeHass_E();
    dlg._shadowRoot = null;

    expect(() => {
      dlg.hass = makeHass_E();
    }).not.toThrow();
  });
});
