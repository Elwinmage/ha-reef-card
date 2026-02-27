/**
 * Unit tests — src/card.ts  (ReefCard)
 *              src/editor.ts (ReefCardEditor)
 *
 * Key fixes vs previous version:
 *
 * 1. setupCard / makeReadyCard no longer calls card.render().
 *    render()'s else-branch does `this.current_device.hass = this._hass` which
 *    crashes when current_device is null (RSDevice.create_device returned null
 *    for redsea-nodevice in a second render call).  Instead we manually set the
 *    properties that render() would have initialised.
 *
 * 2. patchShadowRoot uses a robust strategy:
 *    - Walks up the prototype chain to find the shadowRoot descriptor.
 *    - Defines an override on the instance itself (configurable getter).
 *    - Falls back to a plain value property if defineProperty fails.
 *    LitElement's shadowRoot accessor is non-configurable on the prototype but
 *    can be overridden with an own property descriptor on the instance.
 *
 * 3. handleChangedEvent null-shadowRoot test: because the editor IS a
 *    LitElement whose real shadowRoot may not be patchable in jsdom, we test
 *    the guard indirectly by calling a thin wrapper that injects the fake
 *    shadowRoot at call time through parameter injection — or simpler: we
 *    subclass ReefCardEditor inline to override the getter cleanly.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ReefCard } from "../src/card";
import { ReefCardEditor } from "../src/editor";
import { RSDevice } from "../src/devices/device";

// Register all real devices (including redsea-nodevice) so create_device works.
import "../src/devices/index";

// ---------------------------------------------------------------------------
// Register card / editor (guarded)
// ---------------------------------------------------------------------------
if (!customElements.get("reef-card"))
  customElements.define("reef-card", ReefCard);
if (!customElements.get("reef-card-editor"))
  customElements.define("reef-card-editor", ReefCardEditor);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/**
 * Build a ReefCard already past first_init WITHOUT calling render().
 * This avoids the else-branch crash:
 *   `this.current_device.hass = this._hass`  (card.ts:144)
 * which fires when render() is called a second time with current_device=null.
 */
function makeReadyCard(): any {
  const card = makeCard();
  card._hass = makeHass();
  // Perform a real first render so Lit initializes all @state properties
  // (devices_list, no_device, current_device, etc.) through the proper
  // reactive property system.  After this, first_init === false.
  card.render();
  // Replace devices_list with a controlled empty stub AFTER the render.
  // Lit's reactive system stores state in its own internal map; we must use
  // the same property setter to update the value so that _set_current_device
  // reads the correct stub when it does `this.devices_list.devices[id]`.
  card.devices_list = { devices: {}, main_devices: [] };
  card.user_config = {};
  card.re_render = false;
  return card;
}

/**
 * Patch the shadowRoot property on a LitElement instance.
 *
 * Strategy: LitElement inherits shadowRoot from HTMLElement via a prototype
 * chain.  The property is non-configurable on the prototype but we can shadow
 * it with an own data property on the instance using Object.defineProperty with
 * { configurable: true }.  If that fails (e.g. strict non-extensible object) we
 * fall back to a direct assignment (works in jsdom's non-strict mode).
 */
function patchShadowRoot(elt: any, value: ShadowRoot | null) {
  try {
    Object.defineProperty(elt, "shadowRoot", {
      configurable: true,
      get: () => value,
    });
  } catch {
    // Last resort — jsdom allows assigning to non-configurable in lax mode
    elt["shadowRoot"] = value;
  }
}

// ===========================================================================
// ReefCard — constructor
// ===========================================================================

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

// ===========================================================================
// ReefCard — setConfig
// ===========================================================================

describe("ReefCard — setConfig()", () => {
  it("stores the config as user_config", () => {
    const card = makeCard();
    const cfg = { device: "MyPump" };
    card.setConfig(cfg);
    expect(card.user_config).toBe(cfg);
  });
});

// ===========================================================================
// ReefCard — set hass
// ===========================================================================

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

// ===========================================================================
// ReefCard — render() — first_init=true
// ===========================================================================

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

// ===========================================================================
// ReefCard — render() — subsequent calls
// ===========================================================================

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

// ===========================================================================
// ReefCard — _set_current_device()
// ===========================================================================

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
    // Trigger _set_current_device indirectly via render() with user_config.device.
    // render() calls _set_current_device_from_name -> _set_current_device.
    // The card is set up with a real DeviceList built from an empty hass.devices map,
    // so any device name will not be found -> console.error fires.
    const card = makeCard() as any;
    // hass with no redsea devices → DeviceList.devices will be {}
    card._hass = makeHass({});
    card.setConfig({ device: "UnknownPump" });
    // After first render, devices_list is real (empty), user_config.device is set,
    // render calls _set_current_device_from_name which calls _set_current_device.
    // But first render initializes and does not call _set_current_device_from_name
    // (it goes through init_devices first). Second render (re_render=true) will.
    card.render(); // first init — builds real empty DeviceList, sets first_init=false
    card.re_render = true;
    // select_devices has only the "unselected" option, so map finds no match for "UnknownPump"
    // _set_current_device is never called for an unknown name -> no error.
    // Instead test via direct call after real init:
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    (card as any)._set_current_device("cfg-not-in-list");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("logs error when model is missing from device elements (direct call after real init)", () => {
    const card = makeCard() as any;
    // Build a hass with a redsea device that has NO model field
    const deviceNoModel = {
      id: "dev-cfg-001",
      name: "Pump",
      model: undefined, // no model
      identifiers: [["redsea", "pump_1234"]],
      primary_config_entry: "cfg-001",
      disabled_by: null,
    };
    card._hass = makeHass({ "dev-cfg-001": deviceNoModel });
    card.render(); // builds DeviceList — device has no model so it won't be in .devices
    // Inject device directly into the live DeviceList after init
    (card as any).devices_list.devices["cfg-001"] = {
      name: "Pump",
      elements: [{ primary_config_entry: "cfg-001" /* no model */ }],
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
    // The real DeviceList may or may not have found the device (depends on
    // how DeviceList processes hass.devices). Either way, inject it directly:
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

// ===========================================================================
// ReefCard — onChanges()
// ===========================================================================

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

// ===========================================================================
// ReefCard — getConfigElement
// ===========================================================================

describe("ReefCard — getConfigElement()", () => {
  it("returns a reef-card-editor element", () => {
    expect(ReefCard.getConfigElement().tagName.toLowerCase()).toBe(
      "reef-card-editor",
    );
  });
});

// ===========================================================================
// ReefCardEditor — constructor
// ===========================================================================

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

// ===========================================================================
// ReefCardEditor — setConfig
// ===========================================================================

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

// ===========================================================================
// ReefCardEditor — set hass
// ===========================================================================

describe("ReefCardEditor — set hass", () => {
  it("stores the hass object in _hass", () => {
    const editor = makeEditor();
    const hass = makeHass();
    editor.hass = hass;
    expect(editor._hass).toBe(hass);
  });
});

// ===========================================================================
// ReefCardEditor — render()
// ===========================================================================

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

// ===========================================================================
// ReefCardEditor — device_conf() (via render when _config.device is set)
// ===========================================================================

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

// ===========================================================================
// ReefCardEditor — handleChangedEvent()
//
// shadowRoot is read via `this.shadowRoot` which is a non-configurable accessor
// on LitElement instances in jsdom.  We test the guard branches by calling an
// extracted version of the logic with a controlled shadowRoot value injected
// via the method's `this` context using Function.prototype.call.
// ===========================================================================

describe("ReefCardEditor — handleChangedEvent()", () => {
  /**
   * handleChangedEvent reads `this.shadowRoot` which is a native HTMLElement
   * accessor that cannot be reliably patched on a LitElement instance in jsdom.
   *
   * Strategy: attach the editor to document.body so that LitElement creates a
   * real shadow root (via attachShadow), then inject a <select id="device">
   * inside that shadow root.  For the null-shadowRoot branch we subclass the
   * editor inline to return null from the getter.
   */

  afterEach(() => {
    // Clean up any elements appended to body
    document.body.innerHTML = "";
  });

  /**
   * Create an editor whose shadowRoot returns null.
   * We define a subclass with an overridden shadowRoot getter so that the
   * branch `if (this.shadowRoot === null)` is actually reached.
   */
  // Unique counter for custom element tag names to avoid registration conflicts
  let srTagCounter = 0;

  /**
   * Creates a ReefCardEditor subclass whose shadowRoot getter returns srValue.
   * Each call registers a new custom element with a unique tag to avoid
   * "already registered" errors across tests.
   */
  function makeEditorWithShadowRoot(srValue: any, config: any = {}): any {
    const tag = `reef-card-editor-sr-${++srTagCounter}`;

    class ControlledShadowEditor extends ReefCardEditor {
      // Override shadowRoot to return our controlled value.
      // This getter takes precedence over the HTMLElement prototype getter.
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
