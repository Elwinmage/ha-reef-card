// Consolidated tests for card

import { Dialog } from "../src/base/dialog";
import { MyElement } from "../src/base/element";
import { ReefCard } from "../src/card";
import { RSDevice } from "../src/devices/device";
import { ReefCardEditor } from "../src/editor";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RSDevice from "../src/devices/device";
import "../src/devices/index";

if (!customElements.get("reef-card"))
  customElements.define("reef-card", ReefCard);
if (!customElements.get("reef-card-editor"))
  customElements.define("reef-card-editor", ReefCardEditor);
function makeHass(deviceMap: Record<string, any> = {}): any {
  return {
    states: {},
    entities: {},
    devices: deviceMap,
    callService: vi.fn(),
    language: "en",
  };
}
function makeHassDevice(
  name: string,
  model: string,
  configEntry: string,
  identifier = `${model.toLowerCase()}_1234`,
) {
  return {
    id: `dev-${configEntry}`,
    name,
    model,
    identifiers: [["redsea", identifier]],
    primary_config_entry: configEntry,
    disabled_by: null,
  };
}
function makeCard(): any {
  return new ReefCard() as any;
}
function makeEditor(): any {
  return new ReefCardEditor() as any;
}
function makeReadyCard(): any {
  const card = makeCard();
  card._hass = makeHass();
  card.render();
  card.devices_list = { devices: {}, main_devices: [] };
  card.user_config = {};
  card.re_render = false;
  return card;
}
function patchShadowRoot(elt: any, value: ShadowRoot | null) {
  try {
    Object.defineProperty(elt, "shadowRoot", {
      configurable: true,
      get: () => value,
    });
  } catch {
    elt["shadowRoot"] = value;
  }
}
const initMock = vi.fn();
vi.mock("../src/base/dialog", () => ({
  Dialog: class FakeDialog {
    init = initMock;
    hass: any = null;
  },
}));
function uid(p = "t") {
  return `${p}-${Math.random().toString(36).slice(2)}`;
}
function makeHass_B() {
  return { states: {}, devices: {}, callService: vi.fn(), entities: {} };
}
beforeAll(() => {
  if (!customElements.get("common-dialog")) {
    customElements.define("common-dialog", Dialog);
  }
});
function makeHass_C(states: Record<string, any> = {}) {
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

describe("ReefCard — constructor", () => {
  it("is instantiable without arguments", () => {
    expect(() => makeCard()).not.toThrow();
  });

  it("display-dialog: delegates to _dialog_box.display()", () => {
    const card = makeCard();
    const mockDisplay = vi.fn();
    card._dialog_box = { display: mockDisplay };
    card.dispatchEvent(
      new CustomEvent("display-dialog", { detail: { type: "wifi", elt: {} } }),
    );
    expect(mockDisplay).toHaveBeenCalledWith({ type: "wifi", elt: {} });
  });

  it("display-dialog: no-op when _dialog_box is null", () => {
    const card = makeCard();
    card._dialog_box = null;
    expect(() =>
      card.dispatchEvent(new CustomEvent("display-dialog", { detail: {} })),
    ).not.toThrow();
  });

  it("config-dialog: delegates to _dialog_box.set_conf()", () => {
    const card = makeCard();
    const mockSetConf = vi.fn();
    card._dialog_box = { set_conf: mockSetConf };
    card.dispatchEvent(
      new CustomEvent("config-dialog", { detail: { dialogs: { a: 1 } } }),
    );
    expect(mockSetConf).toHaveBeenCalledWith({ a: 1 });
  });

  it("config-dialog: no-op when _dialog_box is null", () => {
    const card = makeCard();
    card._dialog_box = null;
    expect(() =>
      card.dispatchEvent(
        new CustomEvent("config-dialog", { detail: { dialogs: {} } }),
      ),
    ).not.toThrow();
  });

  it("quit-dialog: calls _dialog_box.quit() and card.render()", () => {
    const card = makeCard();
    const mockQuit = vi.fn();
    card._dialog_box = { quit: mockQuit };
    card.render = vi.fn();
    card.dispatchEvent(new CustomEvent("quit-dialog"));
    expect(mockQuit).toHaveBeenCalled();
    expect(card.render).toHaveBeenCalled();
  });

  it("quit-dialog: no-op when _dialog_box is null", () => {
    const card = makeCard();
    card._dialog_box = null;
    card.render = vi.fn();
    expect(() =>
      card.dispatchEvent(new CustomEvent("quit-dialog")),
    ).not.toThrow();
  });
});
describe("ReefCard — setConfig()", () => {
  it("stores the config as user_config", () => {
    const card = makeCard();
    const cfg = { device: "MyPump" };
    card.setConfig(cfg);
    expect(card.user_config).toBe(cfg);
  });
});
describe("ReefCard — set hass", () => {
  it("stores _hass when first_init is true", () => {
    const card = makeCard();
    const hass = makeHass();
    card.hass = hass;
    expect(card._hass).toBe(hass);
  });

  it("propagates to current_device when first_init is false", () => {
    const card = makeReadyCard();
    const hass = makeHass();
    card.hass = hass;
    expect(card.current_device.hass).toBe(hass);
  });

  it("propagates to _dialog_box when present and first_init is false", () => {
    const card = makeReadyCard();
    const mockDialog = { hass: null };
    card._dialog_box = mockDialog;
    const hass = makeHass();
    card.hass = hass;
    expect(mockDialog.hass).toBe(hass);
  });
});
describe("ReefCard — render() first_init=true", () => {
  it("sets first_init to false after first render", () => {
    const card = makeCard();
    card._hass = makeHass();
    card.render();
    expect(card.first_init).toBe(false);
  });

  it("creates no_device and sets it as current_device", () => {
    const card = makeCard();
    card._hass = makeHass();
    card.render();
    expect(card.no_device).toBeTruthy();
    expect(card.current_device).toBe(card.no_device);
  });

  it("returns a template without device config", () => {
    const card = makeCard();
    card._hass = makeHass();
    card.user_config = {};
    expect(card.render()).toBeDefined();
  });

  it("returns a template with user_config.device set (no matching device)", () => {
    const card = makeCard();
    card._hass = makeHass();
    card.user_config = { device: "UnknownPump" };
    expect(card.render()).toBeDefined();
  });
});
describe("ReefCard — render() re_render=false (early return)", () => {
  it("returns undefined when re_render is false", () => {
    const card = makeReadyCard();
    expect(card.render()).toBeUndefined();
  });
});
describe("ReefCard — render() re_render=true", () => {
  it("returns template without device", () => {
    const card = makeReadyCard();
    card.re_render = true;
    expect(card.render()).toBeDefined();
  });

  it("calls _set_current_device when user_config.device matches a select entry", () => {
    const card = makeReadyCard();
    card.re_render = true;
    card.user_config = { device: "MyPump" };
    card.select_devices = [{ value: "cfg-001", text: "MyPump" }];
    card._set_current_device = vi.fn();
    card.render();
    expect(card._set_current_device).toHaveBeenCalledWith("cfg-001");
  });
});
describe("ReefCard — _set_current_device()", () => {
  it("sets current_device to no_device when id is 'unselected'", () => {
    const card = makeReadyCard();
    card._set_current_device("unselected");
    expect(card.current_device).toBe(card.no_device);
  });

  it("does not update when primary_config_entry already matches", () => {
    const card = makeReadyCard();
    const fakeDevice: any = {
      hass: null,
      device: { elements: [{ primary_config_entry: "cfg-001" }] },
    };
    card.current_device = fakeDevice;
    card.devices_list = {
      devices: {
        "cfg-001": {
          name: "Pump",
          elements: [{ primary_config_entry: "cfg-001", model: "RSDOSE4" }],
        },
      },
      main_devices: [],
    };
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    card._set_current_device("cfg-001");
    spy.mockRestore();
    expect(card.current_device).toBe(fakeDevice);
  });

  it("logs error when device_id is not in devices_list (via render + user_config)", () => {
    const card = makeCard() as any;

    card._hass = makeHass({});
    card.setConfig({ device: "UnknownPump" });

    card.render();
    card.re_render = true;

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    (card as any)._set_current_device("cfg-not-in-list");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("logs error when model is missing from device elements (direct call after real init)", () => {
    const card = makeCard() as any;

    const deviceNoModel = {
      id: "dev-cfg-001",
      name: "Pump",
      model: undefined,
      identifiers: [["redsea", "pump_1234"]],
      primary_config_entry: "cfg-001",
      disabled_by: null,
    };
    card._hass = makeHass({ "dev-cfg-001": deviceNoModel });
    card.render();

    (card as any).devices_list.devices["cfg-001"] = {
      name: "Pump",
      elements: [{ primary_config_entry: "cfg-001" }],
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    (card as any)._set_current_device("cfg-001");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("calls RSDevice.create_device for a valid device+model (direct call after real init)", () => {
    const card = makeCard() as any;
    const hassDevice = makeHassDevice("Pump", "RSDOSE4", "cfg-001");
    card._hass = makeHass({ "dev-cfg-001": hassDevice });
    card.render();

    (card as any).devices_list.devices["cfg-001"] = {
      name: "Pump",
      elements: [hassDevice],
    };
    const stub = vi.spyOn(RSDevice, "create_device").mockReturnValue(null);
    (card as any)._set_current_device("cfg-001");
    expect(stub).toHaveBeenCalledWith(
      "redsea-rsdose4",
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    stub.mockRestore();
  });
});
describe("ReefCard — onChanges()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets selected from shadowRoot select and calls _set_current_device", () => {
    const card = makeReadyCard();
    card.devices_list = { devices: {}, main_devices: [] };
    card.requestUpdate = vi.fn();
    card._set_current_device = vi.fn();

    const select = document.createElement("select");
    select.innerHTML = `<option value="cfg-001">Pump</option>`;
    select.value = "cfg-001";
    patchShadowRoot(card, {
      querySelector: (s: string) => (s === "#device" ? select : null),
    } as any);

    card.onChanges();
    vi.advanceTimersByTime(400);

    expect(card.selected).toBe("cfg-001");
    expect(card._set_current_device).toHaveBeenCalledWith("cfg-001");
  });

  it("logs debug when selected is 'unselected'", () => {
    const card = makeReadyCard();
    card.requestUpdate = vi.fn();

    const select = document.createElement("select");
    select.innerHTML = `<option value="unselected">--</option>`;
    select.value = "unselected";
    patchShadowRoot(card, { querySelector: () => select } as any);

    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    card.onChanges();
    vi.advanceTimersByTime(400);
    spy.mockRestore();

    expect(card.selected).toBe("unselected");
  });

  it("handles null shadowRoot gracefully", () => {
    const card = makeReadyCard();
    card.requestUpdate = vi.fn();
    patchShadowRoot(card, null);

    expect(() => {
      card.onChanges();
      vi.advanceTimersByTime(400);
    }).not.toThrow();
  });

  it("handles null select element gracefully", () => {
    const card = makeReadyCard();
    card.requestUpdate = vi.fn();
    patchShadowRoot(card, { querySelector: () => null } as any);

    expect(() => {
      card.onChanges();
      vi.advanceTimersByTime(400);
    }).not.toThrow();
  });
});
describe("ReefCard — getConfigElement()", () => {
  it("returns a reef-card-editor element", () => {
    expect(ReefCard.getConfigElement().tagName.toLowerCase()).toBe(
      "reef-card-editor",
    );
  });
});
describe("ReefCardEditor — constructor", () => {
  it("is instantiable without arguments", () => {
    expect(() => makeEditor()).not.toThrow();
  });

  it("config-changed listener calls requestUpdate", () => {
    const editor = makeEditor();
    editor.requestUpdate = vi.fn();
    editor.dispatchEvent(new CustomEvent("config-changed"));
    expect(editor.requestUpdate).toHaveBeenCalled();
  });
});
describe("ReefCardEditor — setConfig()", () => {
  it("stores the config and calls requestUpdate", () => {
    const editor = makeEditor();
    editor.requestUpdate = vi.fn();
    const cfg = { device: "Pump" };
    editor.setConfig(cfg);
    expect(editor._config).toBe(cfg);
    expect(editor.requestUpdate).toHaveBeenCalled();
  });
});
describe("ReefCardEditor — set hass", () => {
  it("stores the hass object in _hass", () => {
    const editor = makeEditor();
    const hass = makeHass();
    editor.hass = hass;
    expect(editor._hass).toBe(hass);
  });
});
describe("ReefCardEditor — render()", () => {
  it("returns empty template when _config is null", () => {
    const editor = makeEditor();
    editor._config = null;
    expect(editor.render()).toBeDefined();
  });

  it("initializes device list on first render (first_init=true)", () => {
    const editor = makeEditor();
    editor._hass = makeHass();
    editor._config = {};
    editor.requestUpdate = vi.fn();
    editor.render();
    expect(editor.first_init).toBe(false);
    expect(editor.select_devices).toBeDefined();
  });

  it("skips init_devices on subsequent renders (first_init=false)", () => {
    const editor = makeEditor();
    editor._hass = makeHass();
    editor._config = {};
    editor.first_init = false;
    const sentinel = [{ value: "x", text: "x" }];
    editor.select_devices = sentinel;
    editor.devices_list = {
      main_devices: [],
      devices: {},
      get_by_name: () => undefined,
    };
    editor.requestUpdate = vi.fn();
    editor.render();
    expect(editor.select_devices).toBe(sentinel);
  });

  it("renders with a real hass containing a redsea device", () => {
    const hassDevice = makeHassDevice("Pump", "RSDOSE4", "cfg-001");
    const editor = makeEditor();
    editor._hass = makeHass({ "dev-cfg-001": hassDevice });
    editor._config = {};
    editor.requestUpdate = vi.fn();
    expect(() => editor.render()).not.toThrow();
  });
});
describe("ReefCardEditor — device_conf()", () => {
  it("returns empty template when _config.device is empty string", () => {
    const editor = makeEditor();
    editor._hass = makeHass();
    editor._config = { device: "" };
    editor.first_init = false;
    editor.select_devices = [];
    editor.devices_list = {
      main_devices: [],
      devices: {},
      get_by_name: () => undefined,
    };
    editor.requestUpdate = vi.fn();
    expect(() => editor.render()).not.toThrow();
  });

  it("returns empty template when get_by_name returns undefined", () => {
    const editor = makeEditor();
    editor._hass = makeHass();
    editor._config = { device: "Ghost" };
    editor.first_init = false;
    editor.select_devices = [];
    editor.devices_list = {
      main_devices: [],
      devices: {},
      get_by_name: () => undefined,
    };
    editor.requestUpdate = vi.fn();
    expect(() => editor.render()).not.toThrow();
  });

  it("returns empty template when device model is missing", () => {
    const editor = makeEditor();
    editor._hass = makeHass();
    editor._config = { device: "Pump" };
    editor.first_init = false;
    editor.select_devices = [];
    const deviceNoModel = {
      name: "Pump",
      elements: [{ primary_config_entry: "cfg-001" }],
    };
    editor.devices_list = {
      main_devices: [],
      devices: {},
      get_by_name: () => deviceNoModel,
    };
    editor.requestUpdate = vi.fn();
    expect(() => editor.render()).not.toThrow();
  });

  it("sets isEditorMode=true on the device when create_device succeeds", () => {
    const editor = makeEditor();
    const hassDevice = makeHassDevice("Pump", "RSDOSE4", "cfg-001");
    const deviceInfo = { name: "Pump", elements: [hassDevice] };
    editor._hass = makeHass();
    editor._config = { device: "Pump" };
    editor.first_init = false;
    editor.select_devices = [];
    editor.devices_list = {
      main_devices: [],
      devices: {},
      get_by_name: () => deviceInfo,
    };
    editor.requestUpdate = vi.fn();

    const fakeDevice: any = { isEditorMode: false, hass: null };
    const stub = vi
      .spyOn(RSDevice, "create_device")
      .mockReturnValue(fakeDevice);
    editor.render();
    stub.mockRestore();

    expect(fakeDevice.isEditorMode).toBe(true);
    expect(editor.current_device).toBe(fakeDevice);
  });

  it("returns empty template when create_device returns null", () => {
    const editor = makeEditor();
    const hassDevice = makeHassDevice("Pump", "RSDOSE4", "cfg-001");
    const deviceInfo = { name: "Pump", elements: [hassDevice] };
    editor._hass = makeHass();
    editor._config = { device: "Pump" };
    editor.first_init = false;
    editor.select_devices = [];
    editor.devices_list = {
      main_devices: [],
      devices: {},
      get_by_name: () => deviceInfo,
    };
    editor.requestUpdate = vi.fn();

    const stub = vi.spyOn(RSDevice, "create_device").mockReturnValue(null);
    expect(() => editor.render()).not.toThrow();
    stub.mockRestore();
  });
});
describe("ReefCardEditor — handleChangedEvent()", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  let srTagCounter = 0;

  function makeEditorWithShadowRoot(srValue: any, config: any = {}): any {
    const tag = `reef-card-editor-sr-${++srTagCounter}`;

    class ControlledShadowEditor extends ReefCardEditor {
      override get shadowRoot(): any {
        return srValue;
      }
    }

    customElements.define(tag, ControlledShadowEditor);
    const ed = new ControlledShadowEditor() as any;
    ed._hass = makeHass();
    ed._config = config;
    return ed;
  }

  it("logs error and returns when shadowRoot is null", () => {
    const editor = makeEditorWithShadowRoot(null, {});
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    (editor as any).handleChangedEvent(new Event("change"));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("logs error and returns when #device element is null", () => {
    const fakeSR = { getElementById: (_id: string) => null };
    const editor = makeEditorWithShadowRoot(fakeSR, {});
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    (editor as any).handleChangedEvent(new Event("change"));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("deletes config.device and dispatches config-changed when selectedIndex=0", () => {
    const select = document.createElement("select");
    select.innerHTML = `<option value="unselected">--</option><option value="cfg-1">Pump</option>`;
    select.selectedIndex = 0;
    const fakeSR = { getElementById: (_id: string) => select };
    const editor = makeEditorWithShadowRoot(fakeSR, { device: "OldPump" });

    const events: CustomEvent[] = [];
    editor.addEventListener("config-changed", (e: Event) =>
      events.push(e as CustomEvent),
    );
    (editor as any).handleChangedEvent(new Event("change"));
    expect(events).toHaveLength(1);
    expect(events[0].detail.config.device).toBeUndefined();
  });

  it("sets config.device to option.text and dispatches config-changed when selectedIndex>0", () => {
    const select = document.createElement("select");
    select.innerHTML = `<option value="unselected">--</option><option value="cfg-1">MyPump</option>`;
    select.selectedIndex = 1;
    const fakeSR = { getElementById: (_id: string) => select };
    const editor = makeEditorWithShadowRoot(fakeSR, { device: "" });

    const events: CustomEvent[] = [];
    editor.addEventListener("config-changed", (e: Event) =>
      events.push(e as CustomEvent),
    );
    (editor as any).handleChangedEvent(new Event("change"));
    expect(events).toHaveLength(1);
    expect(events[0].detail.config.device).toBe("MyPump");
  });

  it("dispatches config-changed event with bubbles=true and composed=true", () => {
    const select = document.createElement("select");
    select.innerHTML = `<option value="unselected">--</option>`;
    select.selectedIndex = 0;
    const fakeSR = { getElementById: (_id: string) => select };
    const editor = makeEditorWithShadowRoot(fakeSR, {});

    const events: CustomEvent[] = [];
    editor.addEventListener("config-changed", (e: Event) =>
      events.push(e as CustomEvent),
    );
    (editor as any).handleChangedEvent(new Event("change"));
    expect(events[0].bubbles).toBe(true);
    expect(events[0].composed).toBe(true);
  });
});
describe("ReefCard L139-140 — dialog.init called when shadowRoot is present", () => {
  it("calls dialog.init with hass and shadowRoot on first render", async () => {
    const { ReefCard } = await import("../src/card");
    const RSDeviceMod = await import("../src/devices/device");
    vi.spyOn(RSDeviceMod.default, "create_device").mockReturnValue({} as any);

    const tag = uid("reef-card-l140");
    class T extends ReefCard {}
    if (!customElements.get(tag)) customElements.define(tag, T);

    const card = document.createElement(tag) as any;

    card.attachShadow({ mode: "open" });
    card._hass = makeHass_B();
    card.first_init = true;
    card.init_devices = vi.fn();
    card.no_device = {};
    card.current_device = { hass: null };
    card.re_render = false;

    initMock.mockClear();
    card.render();

    expect(initMock).toHaveBeenCalledWith(card._hass, card.shadowRoot);
  });
});
describe("ReefCard", () => {
  it("L102: propagates hass to _dialog_box when first_init is false", async () => {
    const { ReefCard } = await import("../src/card");
    const tag = uid("reef-card-102");
    class T extends ReefCard {}
    customElements.define(tag, T);
    const card = document.createElement(tag) as any;
    card.first_init = false;
    card.current_device = { hass: null };
    const fakeDialog = { hass: null as any };
    card._dialog_box = fakeDialog;
    const hass = makeHass_C();
    card.hass = hass;
    expect(fakeDialog.hass).toBe(hass);
  });

  it("L102: skips _dialog_box.hass update when _dialog_box is null", async () => {
    const { ReefCard } = await import("../src/card");
    const tag = uid("reef-card-102b");
    class T extends ReefCard {}
    customElements.define(tag, T);
    const card = document.createElement(tag) as any;
    card.first_init = false;
    card.current_device = { hass: null };
    card._dialog_box = null;
    const hass = makeHass_C();

    expect(() => {
      card.hass = hass;
    }).not.toThrow();
    expect(card.current_device.hass).toBe(hass);
  });
});
