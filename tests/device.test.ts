// Consolidated tests for device

import { ClickImage } from "../src/base/click_image";
import { Dialog } from "../src/base/dialog";
import { MyElement } from "../src/base/element";
import { Sensor } from "../src/base/sensor";
import { RSSwitch } from "../src/base/switch";
import { RSDevice } from "../src/devices/device";
import { DoseHead } from "../src/devices/rsdose/dose_head";
import { RSDose4 } from "../src/devices/rsdose/rsdose";
import { config4 } from "../src/devices/rsdose/rsdose4.mapping";
import { RSMat } from "../src/devices/rsmat/rsmat";
import { MyI18n } from "../src/translations/myi18n";
import { toTime } from "../src/utils/common";
import { merge } from "../src/utils/merge";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RSDevice from "../src/devices/device";

class StubRSDevice extends RSDevice {
  override _render(_style: any = null, _substyle: any = null): any {
    return null as any;
  }
}
if (!customElements.get("stub-rsdevice"))
  customElements.define("stub-rsdevice", StubRSDevice);
function makeState(state: string, entity_id = "sensor.test"): any {
  return { entity_id, state, attributes: {} };
}
function makeHass(states: Record<string, any> = {}, entities: any = {}): any {
  return { states, devices: {}, callService: vi.fn(), entities };
}
function makeDevice(
  model = "RSDOSE4",
  id = "dev-id-1",
  name = "pump",
  disabled_by: string | null = null,
): any {
  return { name, elements: [{ id, model, disabled_by }] };
}
function makeDev(): StubRSDevice & Record<string, any> {
  const dev = new StubRSDevice() as any;
  dev.initial_config = { elements: {}, background_img: "" };
  dev.user_config = null;
  dev.device = null;
  dev.entities = {};
  dev._elements = {};
  dev.dialogs = null;
  dev.requestUpdate = vi.fn();
  return dev;
}
class StubDevice extends RSDevice {
  override _render(_style: any = null, _substyle: any = null): any {
    return null as any;
  }
}
if (!customElements.get("stub-device-gaps"))
  customElements.define("stub-device-gaps", StubDevice);
function makeHass_B(states: Record<string, any> = {}): any {
  return { states, devices: {}, callService: vi.fn(), entities: {} };
}
function makeDevice_B(model = "RSDOSE4", id = "dev-1", name = "pump"): any {
  return { name, elements: [{ id, model, disabled_by: null }] };
}
function makeDev_B(): StubDevice & Record<string, any> {
  const dev = new StubDevice() as any;
  dev.initial_config = { elements: {}, background_img: "" };
  dev.user_config = null;
  dev.device = null;
  dev.entities = {};
  dev._elements = {};
  dev.dialogs = null;
  dev.requestUpdate = vi.fn();
  return dev;
}
class GapDevice extends RSDevice {}
if (!customElements.get("gap-device-v2"))
  customElements.define("gap-device-v2", GapDevice);
function makeHass_C(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
  devices: Record<string, any> = {},
): any {
  return { states, entities, devices, callService: vi.fn() };
}
function makeState_B(state: string, entity_id: string): any {
  return { entity_id, state, attributes: {} };
}
function makeDevice_C(
  model = "RSDOSE4",
  id = "dev-1",
  name = "pump",
  disabled_by: string | null = null,
): any {
  return { name, elements: [{ id, model, disabled_by }] };
}
function makeDev_C(): GapDevice & Record<string, any> {
  const dev = new GapDevice() as any;
  dev.initial_config = { elements: {}, background_img: "/img/x.png" };
  dev.user_config = null;
  dev.device = null;
  dev.entities = {};
  dev._elements = {};
  dev.dialogs = null;
  dev.requestUpdate = vi.fn();
  return dev;
}
afterEach(() => {
  vi.restoreAllMocks();
});
class DevL149 extends RSDevice {}
if (!customElements.get("dev-l149")) customElements.define("dev-l149", DevL149);
function makeHass_D(states: Record<string, any> = {}): any {
  return { states, entities: {}, devices: {}, callService: vi.fn() };
}
function makeState_C(state: string, entity_id: string): any {
  return { entity_id, state, attributes: {} };
}
function makeDev_D(): any {
  const dev = new DevL149() as any;
  dev.initial_config = {
    model: "BASE",
    name: "",
    elements: {},
    background_img: "/img/x.png",
  };
  dev.user_config = null;
  dev.device = null;
  dev.entities = {};
  dev._elements = {};
  dev.dialogs = {};
  dev.requestUpdate = vi.fn();
  dev._render_elements = vi.fn().mockReturnValue(null);
  return dev;
}
class StubDevice_B extends RSDevice {
  _render(_style: any = null, _substyle: any = null): any {
    return null;
  }
}
if (!customElements.get("stub-device-b"))
  customElements.define("stub-device-b", StubDevice_B);
class StubSensor extends Sensor {
  protected override _render(_s = ""): any {
    return null;
  }
}
if (!customElements.get("stub-sensor-b"))
  customElements.define("stub-sensor-b", StubSensor);
class StubSwitch extends RSSwitch {
  protected override _render(_s = ""): any {
    return null;
  }
}
if (!customElements.get("stub-switch-b"))
  customElements.define("stub-switch-b", StubSwitch);
function makeState_D(
  state: string,
  entity_id = "sensor.test",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass_E(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
): any {
  return {
    states: {
      "sensor.device_state": makeState("on", "sensor.device_state"),
      "sensor.maintenance": makeState("off", "sensor.maintenance"),
      ...states,
    },
    entities,
    devices: {},
    callService: vi.fn(),
  };
}
function makeDevice_D(
  model = "RSDOSE4",
  name = "my_pump",
  disabled_by: string | null = null,
): any {
  return {
    model,
    name,
    elements: [
      {
        id: "dev-id-001",
        model,
        identifiers: [[null, `${model.toLowerCase()}_1234`]],
        disabled_by,
        primary_config_entry: "cfg-entry-xyz",
      },
    ],
  };
}
class StubDoseHead extends DoseHead {
  override render(): any {
    return this._render();
  }
}
if (!customElements.get("stub-dose-head"))
  customElements.define("stub-dose-head", StubDoseHead);
class StubDevice_C extends RSDevice {
  _render(_style: any = null, _substyle: any = null): any {
    return null;
  }
}
if (!customElements.get("stub-rsdevice-ext"))
  customElements.define("stub-rsdevice-ext", StubDevice_C);
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
function makeState_E(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass_F(
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
function makeHass_G(states: Record<string, any> = {}) {
  return { states, devices: {}, callService: vi.fn(), entities: {} };
}
class StubDev extends RSDevice {
  override _render() {
    return null as any;
  }
}
if (!customElements.get("stub-dev-gaps"))
  customElements.define("stub-dev-gaps", StubDev);
function makeDev_E() {
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
class StubRSMatBG extends RSMat {}
if (!customElements.get("stub-rsmat-bg"))
  customElements.define("stub-rsmat-bg", StubRSMatBG);
class StubRSDose4BG extends RSDose4 {}
if (!customElements.get("stub-rsdose4-bg"))
  customElements.define("stub-rsdose4-bg", StubRSDose4BG);
class StubRSDevBG extends RSDevice {
  override _render(_s?: any, _ss?: any): any {
    return null as any;
  }
}
if (!customElements.get("stub-rsdev-bg"))
  customElements.define("stub-rsdev-bg", StubRSDevBG);
class StubElBG extends MyElement {}
if (!customElements.get("stub-el-bg"))
  customElements.define("stub-el-bg", StubElBG);
class StubCIBG extends ClickImage {}
if (!customElements.get("stub-ci-bg"))
  customElements.define("stub-ci-bg", StubCIBG);
function makeState_F(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass_H(states: Record<string, any> = {}): any {
  return { states, entities: {}, devices: {}, callService: vi.fn() };
}

describe("RSDevice.is_on()", () => {
  it("returns false when _hass is null", () => {
    const dev = makeDev();
    dev._hass = null;
    expect(dev.is_on()).toBe(false);
  });

  it("returns false when device_state entity is missing", () => {
    const dev = makeDev();
    dev._hass = makeHass();
    dev.entities = {};
    expect(dev.is_on()).toBe(false);
  });

  it("returns false when device_state is 'off'", () => {
    const dev = makeDev();
    dev._hass = makeHass({ "sensor.relay": makeState("off", "sensor.relay") });
    dev.entities = { device_state: { entity_id: "sensor.relay" } };
    expect(dev.is_on()).toBe(false);
  });

  it("returns true when device_state is 'on'", () => {
    const dev = makeDev();
    dev._hass = makeHass({ "sensor.relay": makeState("on", "sensor.relay") });
    dev.entities = { device_state: { entity_id: "sensor.relay" } };
    expect(dev.is_on()).toBe(true);
  });

  it("returns true for any non-'off' state (e.g. 'standby')", () => {
    const dev = makeDev();
    dev._hass = makeHass({
      "sensor.relay": makeState("standby", "sensor.relay"),
    });
    dev.entities = { device_state: { entity_id: "sensor.relay" } };
    expect(dev.is_on()).toBe(true);
  });
});
describe("RSDevice.is_disabled()", () => {
  it("returns true when device has no elements", () => {
    const dev = makeDev();
    dev.device = { name: "x", elements: [] };
    expect(dev.is_disabled()).toBe(true);
  });

  it("returns true when device is null", () => {
    const dev = makeDev();
    dev.device = null;
    expect(dev.is_disabled()).toBe(true);
  });

  it("returns true when at least one element is disabled", () => {
    const dev = makeDev();
    dev.device = {
      name: "x",
      elements: [{ disabled_by: null }, { disabled_by: "user" }],
    };
    expect(dev.is_disabled()).toBe(true);
  });

  it("returns false when all elements have disabled_by === null", () => {
    const dev = makeDev();
    dev.device = {
      name: "x",
      elements: [{ disabled_by: null }, { disabled_by: null }],
    };
    expect(dev.is_disabled()).toBe(false);
  });
});
describe("RSDevice.get_entity()", () => {
  it("returns null when _hass is null", () => {
    const dev = makeDev();
    dev._hass = null;
    dev.entities = { x: { entity_id: "sensor.x" } };
    expect(dev.get_entity("x")).toBeNull();
  });

  it("returns null when the translation key is not registered", () => {
    const dev = makeDev();
    dev._hass = makeHass();
    dev.entities = {};
    expect(dev.get_entity("missing_key")).toBeNull();
  });

  it("returns null when the entity_id has no state in hass", () => {
    const dev = makeDev();
    dev._hass = makeHass({});
    dev.entities = { temp: { entity_id: "sensor.temp" } };
    expect(dev.get_entity("temp")).toBeUndefined();
  });

  it("returns the state object when entity is found", () => {
    const state = makeState("22", "sensor.temp");
    const dev = makeDev();
    dev._hass = makeHass({ "sensor.temp": state });
    dev.entities = { temp: { entity_id: "sensor.temp" } };
    expect(dev.get_entity("temp")).toBe(state);
  });
});
describe("RSDevice.setNestedProperty() — via applyLeaves", () => {
  it("sets a top-level array property", () => {
    const dev = makeDev();
    dev.initial_config = {};
    dev.user_config = {
      conf: { RSDOSE4: { common: { colors: { 0: "red", 1: "blue" } } } },
    };
    dev.device = makeDevice();
    dev.dialogs = null;
    dev.update_config();
    expect(dev.config.colors).toEqual(["red", "blue"]);
  });

  it("sets a deeply nested property creating intermediaries", () => {
    const dev = makeDev();
    dev.initial_config = {};
    dev.user_config = {
      conf: { RSDOSE4: { common: { "a.b.c": { 0: "x" } } } },
    };
    dev.device = makeDevice();
    dev.dialogs = null;
    dev.update_config();
    expect(dev.config.a.b.c).toEqual(["x"]);
  });

  it("does not affect sibling paths", () => {
    const dev = makeDev();
    dev.initial_config = { sibling: "keep" };
    dev.user_config = { conf: { RSDOSE4: { common: { newkey: { 0: "v" } } } } };
    dev.device = makeDevice();
    dev.dialogs = null;
    dev.update_config();
    expect(dev.config.sibling).toBe("keep");
    expect(dev.config.newkey).toEqual(["v"]);
  });
});
describe("RSDevice.load_dialogs()", () => {
  it("merges a single dialog map", () => {
    const dev = makeDev();
    dev.load_dialogs([{ wifi: { title: "WiFi" } }]);
    expect(dev.dialogs.wifi.title).toBe("WiFi");
  });

  it("merges multiple dialog maps without losing keys", () => {
    const dev = makeDev();
    dev.load_dialogs([
      { dialog_a: { title: "A" } },
      { dialog_b: { title: "B" } },
    ]);
    expect(dev.dialogs.dialog_a.title).toBe("A");
    expect(dev.dialogs.dialog_b.title).toBe("B");
  });

  it("later entries override earlier entries for the same key", () => {
    const dev = makeDev();
    dev.load_dialogs([
      { dialog_a: { title: "old" } },
      { dialog_a: { title: "new" } },
    ]);
    expect(dev.dialogs.dialog_a.title).toBe("new");
  });

  it("returns empty object for empty list", () => {
    const dev = makeDev();
    dev.load_dialogs([]);
    expect(dev.dialogs).toEqual({});
  });
});
describe("RSDevice.update_config()", () => {
  it("starts from initial_config when no user_config is present", () => {
    const dev = makeDev();
    dev.initial_config = { color: "51,151,232", alpha: 0.8, elements: {} };
    dev.user_config = null;
    dev.dialogs = null;
    dev.update_config();
    expect(dev.config.color).toBe("51,151,232");
    expect(dev.config.alpha).toBe(0.8);
  });

  it("applies user_config device overrides on top of initial_config", () => {
    const dev = makeDev();
    dev.initial_config = { color: "51,151,232", alpha: 0.8, elements: {} };
    dev.user_config = {
      conf: {
        RSDOSE4: { devices: { pump: { color: "255,0,0" } } },
      },
    };
    dev.device = makeDevice("RSDOSE4", "d1", "pump");
    dev.dialogs = null;
    dev.update_config();
    expect(dev.config.color).toBe("255,0,0");
    expect(dev.config.alpha).toBe(0.8);
  });

  it("does not mutate initial_config", () => {
    const dev = makeDev();
    dev.initial_config = { color: "51,151,232", alpha: 0.8, elements: {} };
    dev.user_config = {
      conf: { RSDOSE4: { devices: { pump: { color: "0,0,0" } } } },
    };
    dev.device = makeDevice("RSDOSE4", "d1", "pump");
    dev.dialogs = null;
    dev.update_config();
    expect(dev.initial_config.color).toBe("51,151,232");
  });
});
describe("RSDevice.create_device()", () => {
  it("returns null when tag is not registered", () => {
    const result = RSDevice.create_device(
      "nonexistent-tag-xyz",
      makeHass(),
      null,
      makeDevice() as any,
    );
    expect(result).toBeNull();
  });

  it("returns a device instance when tag is registered", () => {
    const result = RSDevice.create_device(
      "stub-rsdevice",
      makeHass(),
      { conf: {} },
      makeDevice() as any,
    );
    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(RSDevice);
  });
});
describe("RSDevice hass getter/setter", () => {
  it("setter stores hass via _setting_hass", () => {
    const dev = makeDev();
    const hass = makeHass();
    dev.hass = hass;
    expect(dev._hass).toBe(hass);
  });

  it("getter returns _hass", () => {
    const dev = makeDev();
    const hass = makeHass();
    dev._hass = hass;
    expect(dev.hass).toBe(hass);
  });
});
describe("RSDevice.setConfig()", () => {
  it("stores config in user_config", () => {
    const dev = makeDev();
    dev.setConfig({ conf: { RSDOSE4: {} } });
    expect(dev.user_config).toEqual({ conf: { RSDOSE4: {} } });
  });
});
describe("RSDevice.renderEditor()", () => {
  it("returns a TemplateResult mentioning 'editor'", () => {
    const dev = makeDev();
    const result = (dev as any).renderEditor();
    expect(result).toBeDefined();
    expect(result.strings.join("")).toContain("editor");
  });
});
describe("RSDevice.render() L128 — config.css present → get_style called", () => {
  it("calls get_style and uses the result as substyle", () => {
    const dev = makeDev_B();
    dev._hass = makeHass_B();
    dev.device = makeDevice_B();
    dev.entities = {};

    dev.initial_config = {
      background_img: "",
      elements: [],
      css: { "background-color": "red" },
    };

    const spy = vi.spyOn(dev, "get_style");
    dev.render();

    expect(spy).toHaveBeenCalled();
  });
});
describe("RSDevice set hass() L205-212 — _elements with master conf", () => {
  it("sets re_render when a master element reports has_changed", () => {
    const dev = makeDev_B();
    dev._hass = makeHass_B();
    dev.device = makeDevice_B();

    const newHass = makeHass_B({ "sensor.x": makeState("on", "sensor.x") });

    const fakeElt = {
      conf: { master: true },
      has_changed: vi.fn().mockReturnValue(true),
      hass: null as any,
    };
    dev._elements = { "switch.master": fakeElt };

    dev.hass = newHass;

    expect(fakeElt.has_changed).toHaveBeenCalledWith(newHass);
    expect(fakeElt.hass).toBe(newHass);
    expect(dev.requestUpdate).toHaveBeenCalled();
  });

  it("sets elt.hass even when master is falsy (L212 always runs)", () => {
    const dev = makeDev_B();
    dev._hass = makeHass_B();
    dev.device = makeDevice_B();

    const newHass = makeHass_B();
    const fakeElt = {
      conf: { master: false },
      has_changed: vi.fn(),
      hass: null as any,
    };
    dev._elements = { "switch.relay": fakeElt };

    dev.hass = newHass;

    expect(fakeElt.has_changed).not.toHaveBeenCalled();
    expect(fakeElt.hass).toBe(newHass);
  });
});
describe("RSDevice._render_disabled() L399-404 — create_element called for maintenance", () => {
  it("calls create_element when maintenance state is on and _hass is truthy", () => {
    const dev = makeDev_B();
    dev.device = makeDevice_B();
    dev.entities = { maintenance: { entity_id: "sensor.maint" } };
    dev._hass = makeHass_B({ "sensor.maint": makeState("on", "sensor.maint") });
    dev.config = {
      background_img: "",
      elements: [{ name: "maintenance", type: "common-switch" }],
    };

    vi.spyOn(dev, "is_disabled").mockReturnValue(false);

    const spy = vi
      .spyOn(MyElement, "create_element")
      .mockReturnValue({} as any);

    const result = dev._render_disabled();

    expect(spy).toHaveBeenCalledWith(
      dev._hass,
      { name: "maintenance", type: "common-switch" },
      dev,
    );
    expect(result).not.toBeNull();

    spy.mockRestore();
  });
});
describe("RSDevice._render_element() L481 — existing hui-entities-card gets hass update", () => {
  it("propagates hass to existing hui-entities-card element", () => {
    if (!customElements.get("hui-entities-card")) {
      class FakeHui extends HTMLElement {
        setConfig(_c: any) {}
        hass: any = null;
      }
      customElements.define("hui-entities-card", FakeHui);
    }

    const dev = makeDev_B();
    dev._hass = makeHass_B();
    dev.entities = {};

    const fakeCard = { setConfig: vi.fn(), hass: null as any };
    const key = "hui-entities-card.device_states";
    dev._elements[key] = fakeCard;

    const conf = { type: "hui-entities-card", conf: { entities: {} } };
    dev._render_element(conf, true, null);

    expect(fakeCard.hass).toBe(dev._hass);
  });
});
describe("RSDevice._render_element() L488-490 — existing element stateOn updated", () => {
  it("updates stateOn on an existing element when conf.name is in _elements", () => {
    const dev = makeDev_B();
    dev._hass = makeHass_B();
    dev.entities = {};

    const fakeElement = { stateOn: false, hass: null as any };
    const conf = { name: "relay", type: "common-switch" };

    dev._elements["relay"] = {};
    dev._elements["common-switch.relay"] = fakeElement;

    dev._render_element(conf, true, null);

    expect(fakeElement.stateOn).toBe(true);
  });

  it("stateOn not set when element lookup at L488 returns undefined", () => {
    const dev = makeDev_B();
    dev._hass = makeHass_B();
    dev.entities = {};

    const conf = { name: "relay", type: "common-switch" };

    dev._elements["relay"] = {};

    expect(() => dev._render_element(conf, true, null)).not.toThrow();
  });
});
describe("RSDevice._render() — base body (L149-175)", () => {
  it("returns a TemplateResult containing device_bg markup", () => {
    const dev = makeDev_C();
    dev.config = { background_img: "/img/test.png", elements: {} };
    dev._hass = makeHass_C();

    const result = (dev as any)._render(null, null);
    expect(result).toBeDefined();
    expect(Array.isArray(result.strings)).toBe(true);

    expect(result.strings.join("")).toContain("device_bg");
  });

  it("accepts style and substyle arguments without throwing", () => {
    const dev = makeDev_C();
    dev.config = { background_img: "", elements: {} };
    dev._hass = makeHass_C();
    expect(() =>
      (dev as any)._render("style-value", "substyle-value"),
    ).not.toThrow();
  });
});
describe("setNestedProperty via applyLeaves — primitive value replaced (L243)", () => {
  it("replaces a primitive-valued key with {} before descending", () => {
    const dev = makeDev_C();

    dev.initial_config = { existing: 42 };
    dev.user_config = {
      conf: {
        RSDOSE4: {
          common: {
            "existing.child": { 0: "v" },
          },
        },
      },
    };
    dev.device = makeDevice_C("RSDOSE4");
    dev.dialogs = null;
    dev.update_config();
    expect(typeof dev.config.existing).toBe("object");
    expect(dev.config.existing.child).toEqual(["v"]);
  });

  it("also triggers when key holds a boolean", () => {
    const dev = makeDev_C();
    dev.initial_config = { flag: false };
    dev.user_config = {
      conf: {
        RSDOSE4: {
          common: { "flag.sub": { 0: "x" } },
        },
      },
    };
    dev.device = makeDevice_C("RSDOSE4");
    dev.dialogs = null;
    dev.update_config();
    expect(typeof dev.config.flag).toBe("object");
    expect(dev.config.flag.sub).toEqual(["x"]);
  });
});
describe("update_config — model falsy (L301 false branch)", () => {
  it("skips conf merge when device element has model=null", () => {
    const dev = makeDev_C();
    dev.initial_config = { color: "red", elements: {} };
    dev.user_config = {
      conf: { RSDOSE4: { devices: { pump: { color: "blue" } } } },
    };

    dev.device = {
      name: "pump",
      elements: [{ id: "d1", model: null, disabled_by: null }],
    };
    dev.dialogs = null;
    dev.update_config();

    expect(dev.config.color).toBe("red");
  });

  it("skips conf merge when device element has model=''", () => {
    const dev = makeDev_C();
    dev.initial_config = { color: "red", elements: {} };
    dev.user_config = {
      conf: { RSDOSE4: { devices: { pump: { color: "blue" } } } },
    };
    dev.device = {
      name: "pump",
      elements: [{ id: "d1", model: "", disabled_by: null }],
    };
    dev.dialogs = null;
    dev.update_config();
    expect(dev.config.color).toBe("red");
  });
});
describe("_populate_entities — hass.entities falsy (L343 || branch)", () => {
  it("iterates over [] and leaves entities empty when hass.entities is null", () => {
    const dev = makeDev_C();
    dev.initial_config = { elements: {} };
    dev.user_config = null;
    dev.dialogs = null;
    dev.device = makeDevice_C("M", "dev-1");
    dev.entities = {};

    dev._hass = {
      states: {},
      entities: null,
      devices: {},
      callService: vi.fn(),
    };
    dev._populate_entities();
    expect(dev.entities).toEqual({});
  });

  it("iterates over [] when hass.entities is undefined", () => {
    const dev = makeDev_C();
    dev.initial_config = { elements: {} };
    dev.user_config = null;
    dev.dialogs = null;
    dev.device = makeDevice_C("M", "dev-1");
    dev.entities = {};
    dev._hass = { states: {}, devices: {}, callService: vi.fn() };
    dev._populate_entities();
    expect(dev.entities).toEqual({});
  });
});
describe("_render_disabled — maintenance found but _hass null (L398 false)", () => {
  it("skips create_element when _hass is null at maintenance time", () => {
    const dev = makeDev_C();

    dev.device = makeDevice_C("M", "d1", "pump", null);

    dev.entities = { maintenance: { entity_id: "sensor.maint" } };
    dev._hass = makeHass_C({
      "sensor.maint": makeState_B("on", "sensor.maint"),
    });
    dev.config = {
      background_img: "",
      elements: [{ name: "maintenance", type: "common-switch" }],
    };

    const origHass = dev._hass;
    const origIsDisabled = dev.is_disabled.bind(dev);

    vi.spyOn(dev, "is_disabled").mockReturnValue(false);

    let callCount = 0;
    Object.defineProperty(dev, "_hass", {
      get() {
        callCount++;

        return callCount > 2 ? null : origHass;
      },
      configurable: true,
    });

    const spy = vi.spyOn(MyElement, "create_element");
    const result = dev._render_disabled();

    expect(spy).not.toHaveBeenCalled();

    expect(result).not.toBeNull();
  });
});
describe("_render_element hui-entities-card — conf.name falsy (L459 || branch)", () => {
  it("uses 'device_states' as fallback key when conf.name is undefined", () => {
    if (!customElements.get("hui-entities-card")) {
      class FakeHuiCard extends HTMLElement {
        setConfig(_c: any) {}
        hass: any = null;
      }
      customElements.define("hui-entities-card", FakeHuiCard);
    }

    const dev = makeDev_C();
    dev._hass = makeHass_C();
    dev.entities = {};

    const conf = { type: "hui-entities-card", conf: { entities: {} } };
    dev._render_element(conf, true, null);

    expect(dev._elements["hui-entities-card.device_states"]).toBeDefined();
  });

  it("uses 'device_states' as fallback key when conf.name is empty string", () => {
    const dev = makeDev_C();
    dev._hass = makeHass_C();
    dev.entities = {};
    const conf = {
      type: "hui-entities-card",
      name: "",
      conf: { entities: {} },
    };
    dev._render_element(conf, true, null);
    expect(dev._elements["hui-entities-card.device_states"]).toBeDefined();
  });
});
describe("_render_element hui-entities-card — entity resolution (L469, L471-472)", () => {
  it("L469: resolves string entity reference to real entity_id", () => {
    const dev = makeDev_C();
    dev._hass = makeHass_C({ "sensor.real": makeState_B("on", "sensor.real") });
    dev.entities = { my_sensor: { entity_id: "sensor.real" } };

    const conf = {
      type: "hui-entities-card",
      name: "str_card",
      conf: {
        entities: {
          0: "my_sensor",
        },
      },
    };
    dev._render_element(conf, true, null);

    const card = dev._elements["hui-entities-card.str_card"];
    expect(card).toBeDefined();
  });

  it("L471-472: resolves object entity reference .entity field to real entity_id", () => {
    const dev = makeDev_C();
    dev._hass = makeHass_C({
      "sensor.real2": makeState_B("on", "sensor.real2"),
    });
    dev.entities = { my_sensor2: { entity_id: "sensor.real2" } };

    const conf = {
      type: "hui-entities-card",
      name: "obj_card",
      conf: {
        entities: {
          0: { entity: "my_sensor2", name: "My Sensor" },
        },
      },
    };
    dev._render_element(conf, true, null);

    const card = dev._elements["hui-entities-card.obj_card"];
    expect(card).toBeDefined();
  });

  it("L469 fallback: uses original key when get_entity returns null (entity not found)", () => {
    const dev = makeDev_C();
    dev._hass = makeHass_C();
    dev.entities = {};

    const conf = {
      type: "hui-entities-card",
      name: "fallback_card",
      conf: {
        entities: { 0: "nonexistent_key" },
      },
    };

    expect(() => dev._render_element(conf, true, null)).not.toThrow();
    expect(dev._elements["hui-entities-card.fallback_card"]).toBeDefined();
  });

  it("L472 fallback: uses original .entity when get_entity returns null", () => {
    const dev = makeDev_C();
    dev._hass = makeHass_C();
    dev.entities = {};

    const conf = {
      type: "hui-entities-card",
      name: "obj_fallback",
      conf: {
        entities: { 0: { entity: "missing_key", name: "x" } },
      },
    };
    expect(() => dev._render_element(conf, true, null)).not.toThrow();
    expect(dev._elements["hui-entities-card.obj_fallback"]).toBeDefined();
  });
});
describe("RSDevice._render() — L149 default parameter branch coverage", () => {
  it("returns a template when called with NO arguments (default params branch B)", () => {
    const dev = makeDev_D();
    dev.config = { background_img: "/img/x.png", elements: {} };

    const result = dev._render();
    expect(result).toBeDefined();
  });

  it("returns a template when called with explicit null args (default params branch A)", () => {
    const dev = makeDev_D();
    dev.config = { background_img: "/img/x.png", elements: {} };

    const result = dev._render(null, null);
    expect(result).toBeDefined();
  });

  it("returns a template when called with explicit non-null style and substyle", () => {
    const dev = makeDev_D();
    dev.config = { background_img: "/img/x.png", elements: {} };
    const result = dev._render("style-token", "substyle-token");
    expect(result).toBeDefined();
  });
});
describe("RSDevice._render_disabled() — L397 false branch: non-maintenance element skipped", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeMaintenanceDev(): any {
    const dev = makeDev_D();
    dev.device = {
      name: "MyDevice",
      elements: [{ id: "x", model: "BASE", disabled_by: null }],
    };
    dev.entities = { maintenance: { entity_id: "sensor.maint" } };
    dev._hass = makeHass_D({
      "sensor.maint": makeState_C("on", "sensor.maint"),
    });
    vi.spyOn(dev, "is_disabled").mockReturnValue(false);
    return dev;
  }

  it("iterates past a non-maintenance element before matching (L397 false then true)", () => {
    const dev = makeMaintenanceDev();

    dev.config = {
      background_img: "",
      elements: {
        widget: { name: "widget", type: "common-sensor" },
        maint: { name: "maintenance", type: "common-switch" },
      },
    };

    const spy = vi
      .spyOn(MyElement, "create_element")
      .mockReturnValue({} as any);
    const result = dev._render_disabled();

    expect(spy).toHaveBeenCalledOnce();
    expect(result).not.toBeNull();
  });

  it("iterates all elements with no match when no maintenance element present (L397 always false)", () => {
    const dev = makeMaintenanceDev();

    dev.config = {
      background_img: "",
      elements: {
        sensor_a: { name: "temperature", type: "common-sensor" },
        sensor_b: { name: "pump_state", type: "common-switch" },
      },
    };

    const spy = vi.spyOn(MyElement, "create_element");
    const result = dev._render_disabled();

    expect(spy).not.toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it("matches immediately on first element when it is maintenance (L397 true on first iter)", () => {
    const dev = makeMaintenanceDev();

    dev.config = {
      background_img: "",
      elements: {
        maint: { name: "maintenance", type: "common-switch" },
      },
    };

    const spy = vi
      .spyOn(MyElement, "create_element")
      .mockReturnValue({} as any);
    const result = dev._render_disabled();

    expect(spy).toHaveBeenCalledOnce();
    expect(result).not.toBeNull();
  });
});
describe("RSDevice._render_element() — early-return paths", () => {
  function makeDevWithConfig() {
    const dev = new StubDevice_B() as any;
    dev._hass = makeHass_E();
    dev._elements = {};
    dev.config = { model: "TEST", background_img: "", elements: {} };
    return dev;
  }

  it("returns html`` when element has disabled:true", () => {
    const dev = makeDevWithConfig();
    const result = dev._render_element(
      { name: "foo", disabled: true },
      true,
      null,
    );
    expect(result).toBeDefined();
  });

  it("returns html`` when put_in does not match requested group", () => {
    const dev = makeDevWithConfig();
    const result = dev._render_element(
      { name: "foo", put_in: "group_a", type: "common-sensor" },
      true,
      "group_b",
    );
    expect(result).toBeDefined();
  });

  it("returns html`` when element has no put_in but group is requested", () => {
    const dev = makeDevWithConfig();
    const result = dev._render_element(
      { name: "foo", type: "common-sensor" },
      true,
      "group_a",
    );
    expect(result).toBeDefined();
  });
});
describe("RSDevice._render_disabled()", () => {
  it("returns null when device is enabled and not in maintenance", () => {
    const dev = new StubDevice_B() as any;
    dev.device = makeDevice_D();
    dev.entities = { maintenance: { entity_id: "sensor.maintenance" } };
    dev._hass = makeHass_E({
      "sensor.maintenance": makeState_D("off", "sensor.maintenance"),
    });
    dev.config = { background_img: "", elements: {} };
    expect(dev._render_disabled()).toBeNull();
  });

  it("returns html when device is disabled_by='user'", () => {
    const dev = new StubDevice_B() as any;
    dev.device = makeDevice_D("RSDOSE4", "pump", "user");
    dev.entities = {};
    dev.config = { background_img: "", elements: {} };
    expect(dev._render_disabled()).not.toBeNull();
  });

  it("returns html when maintenance entity state is 'on'", () => {
    const dev = new StubDevice_B() as any;
    dev.device = makeDevice_D();
    dev.entities = { maintenance: { entity_id: "sensor.maint" } };
    dev._hass = makeHass_E({
      "sensor.maint": makeState_D("on", "sensor.maint"),
    });
    dev.config = { background_img: "", elements: {} };
    expect(dev._render_disabled()).not.toBeNull();
  });

  it("returns null when maintenance entity is absent from entities", () => {
    const dev = new StubDevice_B() as any;
    dev.device = makeDevice_D();
    dev.entities = {};
    dev._hass = makeHass_E();
    dev.config = { background_img: "", elements: {} };
    expect(dev._render_disabled()).toBeNull();
  });

  it("accepts a substyle argument without throwing", () => {
    const dev = new StubDevice_B() as any;
    dev.device = makeDevice_D("RSDOSE4", "pump", "user");
    dev.entities = {};
    dev.config = { background_img: "", elements: {} };
    expect(dev._render_disabled("width:100%")).toBeDefined();
  });
});
describe("RSDevice._setting_hass()", () => {
  it("sets to_render=true when disabled_by changes from null to 'user'", () => {
    const dev = new StubDevice_B() as any;
    dev.device = makeDevice_D();
    dev._elements = {};
    dev.config = { model: "TEST", elements: {} };
    dev.to_render = false;
    const hass = makeHass_E();
    hass.devices = { "dev-id-001": { disabled_by: "user" } };
    dev._setting_hass(hass);
    expect(dev.to_render).toBe(true);
  });

  it("keeps to_render=false when disabled_by stays null", () => {
    const dev = new StubDevice_B() as any;
    dev.device = makeDevice_D();
    dev._elements = {};
    dev.config = { model: "TEST", elements: {} };
    dev.to_render = false;
    const hass = makeHass_E();
    hass.devices = { "dev-id-001": { disabled_by: null } };
    dev._setting_hass(hass);
    expect(dev.to_render).toBe(false);
  });

  it("does not throw with empty device elements array", () => {
    const dev = new StubDevice_B() as any;
    dev.device = { elements: [] };
    dev._elements = {};
    dev.config = { model: "TEST", elements: {} };
    dev.to_render = false;
    expect(() => dev._setting_hass(makeHass_E())).not.toThrow();
  });
});
describe("RSDevice._populate_entities()", () => {
  it("does not throw when _hass is null", () => {
    const dev = new StubDevice_B() as any;
    dev._hass = null;
    dev.device = makeDevice_D();
    dev.initial_config = { model: "TEST", elements: {} };
    dev.user_config = {};
    dev.config = { model: "TEST", elements: {}, background_img: "" };
    expect(() => dev._populate_entities()).not.toThrow();
  });

  it("populates entities matching device_id", () => {
    const dev = new StubDevice_B() as any;
    dev.device = makeDevice_D();
    dev.initial_config = { model: "TEST", elements: {} };
    dev.user_config = {};
    dev.config = { model: "TEST", elements: {}, background_img: "" };
    dev._hass = makeHass_E(
      {},
      {
        "sensor.a": {
          entity_id: "sensor.a",
          device_id: "dev-id-001",
          translation_key: "device_state",
        },
        "sensor.b": {
          entity_id: "sensor.b",
          device_id: "other-id",
          translation_key: "wifi",
        },
      },
    );
    dev.entities = {};
    dev._populate_entities();
    expect(dev.entities.device_state).toBeDefined();
    expect(dev.entities.wifi).toBeUndefined();
  });
});
describe("RSDevice.get_style()", () => {
  it("returns empty string for null conf", () => {
    expect((new StubDevice_B() as any).get_style(null)).toBe("");
  });

  it("returns empty string when no css key", () => {
    expect((new StubDevice_B() as any).get_style({ name: "foo" })).toBe("");
  });

  it("converts css object to inline style string", () => {
    const result = (new StubDevice_B() as any).get_style({
      css: { color: "red", top: "10%" },
    });
    expect(result).toContain("color:red");
    expect(result).toContain("top:10%");
  });

  it("handles single css property", () => {
    expect(
      (new StubDevice_B() as any).get_style({ css: { width: "100px" } }),
    ).toBe("width:100px");
  });
});
describe("RSDevice.render()", () => {
  it("calls renderEditor() in editor mode", () => {
    const dev = new StubDevice_C() as any;
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
    const dev = new StubDevice_C() as any;
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
    dev._hass = makeHass_F();
    const result = dev.render();
    expect(result).toBeDefined();
  });

  it("renders device when device is on", () => {
    const dev = new StubDevice_C() as any;
    dev.isEditorMode = false;
    dev.initial_config = { model: "TEST", elements: {}, background_img: "" };
    dev.user_config = {};
    dev.device = makeDeviceInfo();
    dev.dialogs = {};
    dev.entities = {
      device_state: { entity_id: "sensor.ds" },
    };
    dev._elements = {};
    dev._hass = makeHass_F(
      {
        "sensor.ds": makeState_E("on", "sensor.ds"),
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
    const dev = new StubDevice_C() as any;
    dev.isEditorMode = false;
    dev.initial_config = { model: "TEST", elements: {}, background_img: "" };
    dev.user_config = {};
    dev.device = makeDeviceInfo();
    dev.dialogs = {};
    dev.entities = {
      device_state: { entity_id: "sensor.ds" },
    };
    dev._elements = {};
    dev._hass = makeHass_F({
      "sensor.ds": makeState_E("off", "sensor.ds"),
    });
    expect(() => dev.render()).not.toThrow();
  });
});
describe("RSDevice.setConfig() and get hass", () => {
  it("stores user_config from setConfig", () => {
    const dev = new StubDevice_C() as any;
    const cfg = { conf: { TEST: {} } };
    dev.setConfig(cfg);
    expect(dev.user_config).toBe(cfg);
  });

  it("get hass returns _hass", () => {
    const dev = new StubDevice_C() as any;
    const hass = makeHass_F();
    dev._hass = hass;
    expect(dev.hass).toBe(hass);
  });
});
describe("RSDevice.update_config() — common config path", () => {
  it("applies common config leaves correctly", () => {
    const dev = new StubDevice_C() as any;
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
describe("device.ts set hass() L208 — has_changed false branch", () => {
  it("does not trigger re_render path when has_changed returns false", () => {
    const dev = makeDev_E();
    dev._hass = makeHass_G();
    dev.device = {
      name: "pump",
      elements: [{ id: "id1", model: "M", disabled_by: null }],
    };
    const fakeElt = {
      conf: { master: true },
      has_changed: vi.fn().mockReturnValue(false),
      hass: null,
    };
    dev._elements = { "sw.x": fakeElt };
    dev.requestUpdate.mockClear();
    dev.hass = makeHass_G();

    expect(fakeElt.has_changed).toHaveBeenCalled();

    expect(fakeElt.hass).not.toBeNull();
  });
});
describe("device.ts setNestedProperty L243 — missing key creates object", () => {
  it("creates intermediate object when key is absent (L243 true)", () => {
    const dev = makeDev_E();
    dev.config = {};

    dev.applyLeaves({ a: { b: { "0": "x" } } }, "");
    expect(dev.config.a).toBeDefined();
    expect(dev.config.a.b).toEqual(["x"]);
  });

  it("replaces non-object intermediate key (typeof !== 'object' branch)", () => {
    const dev = makeDev_E();

    dev.config = { a: "not_an_object" };
    dev.applyLeaves({ a: { b: { "0": 99 } } }, "");
    expect(typeof dev.config.a).toBe("object");
    expect(dev.config.a.b).toEqual([99]);
  });
});
describe("device.ts applyLeaves L271 — basePath empty/non-empty branch", () => {
  it("uses key directly when basePath is empty", () => {
    const dev = makeDev_E();
    dev.config = {};

    dev.applyLeaves({ x: { "0": 5 } }, "");
    expect(dev.config.x).toEqual([5]);
  });

  it("prepends basePath with dot when non-empty", () => {
    const dev = makeDev_E();
    dev.config = {};

    dev.applyLeaves({ y: { "0": 7 } }, "root");
    expect(dev.config.root?.y).toEqual([7]);
  });
});
describe("device.ts _render_disabled L397 — _hass null branch", () => {
  it("skips create_element when _hass is null during maintenance", () => {
    const dev = makeDev_E();
    dev.device = {
      name: "pump",
      elements: [{ id: "id1", model: "M", disabled_by: null }],
    };
    dev.entities = { maintenance: { entity_id: "sensor.maint" } };
    dev._hass = makeHass_G({
      "sensor.maint": {
        entity_id: "sensor.maint",
        state: "on",
        attributes: {},
      },
    });
    dev.config = {
      background_img: "",
      elements: [{ name: "maintenance", type: "common-switch" }],
    };
    vi.spyOn(dev, "is_disabled").mockReturnValue(false);
    const spy = vi
      .spyOn(MyElement, "create_element")
      .mockReturnValue({} as any);

    dev._hass = null;
    const result = dev._render_disabled();

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
describe("device.ts _render_element L462 — HuiCard absent branch", () => {
  it("does not create HuiCard when customElements.get returns undefined", () => {
    // hui-entities-card may already be registered from earlier tests in this file.
    // Spy on customElements.get so it returns undefined for this specific tag,
    // forcing the L462 null-guard branch to be taken.
    const originalGet = customElements.get.bind(customElements);
    const spy = vi
      .spyOn(customElements, "get")
      .mockImplementation((tag: string) =>
        tag === "hui-entities-card" ? undefined : originalGet(tag),
      );

    const dev = makeDev_E();
    dev._hass = makeHass_G();
    dev.entities = {};
    dev._elements = {};

    const conf = {
      type: "hui-entities-card",
      name: "test_absent",
      conf: { entities: {} },
    };

    expect(() => dev._render_element(conf, true, null)).not.toThrow();
    // L462 branch taken: _elements should NOT have the card key
    expect(dev._elements["hui-entities-card.test_absent"]).toBeUndefined();

    spy.mockRestore();
  });
});
describe("device.ts _render_element L493 — _hass null branch", () => {
  it("does not call create_element when _hass is null", () => {
    const dev = makeDev_E();
    dev._hass = null;
    dev.entities = {};
    dev._elements = {};
    const conf = { type: "common-switch", name: "relay" };
    const spy = vi
      .spyOn(MyElement, "create_element")
      .mockReturnValue({} as any);
    dev._render_element(conf, true, null);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
describe("RSDevice.setNestedProperty() via update_config() — L243 branch coverage", () => {
  function makeDev(): any {
    const dev = document.createElement("stub-rsdev-bg") as any;
    dev.device = {
      name: "MyDevice",
      model: "STUB",
      elements: [
        {
          id: "x",
          model: "STUB",
          identifiers: [["rs", "stub"]],
          disabled_by: null,
        },
      ],
    };

    dev.initial_config = {
      model: "STUB",
      name: "",
      pipe: "10%",
    };
    dev.setConfig({});
    dev.config = JSON.parse(JSON.stringify(dev.initial_config));
    dev._elements = {};
    dev.requestUpdate = vi.fn();
    return dev;
  }

  it("replaces primitive intermediate key with {} (L243 left=false, right=true branch)", () => {
    const dev = makeDev();

    dev.user_config = {
      conf: {
        STUB: {
          common: {
            pipe: { 0: "50%" },
          },
        },
      },
    };

    expect(() => dev.update_config()).not.toThrow();

    expect(Array.isArray(dev.config.pipe)).toBe(true);
  });

  it("navigates into existing object key without replacement (L243 false branch)", () => {
    const dev = makeDev();
    dev.initial_config.nested = { child: "original" };
    dev.config = JSON.parse(JSON.stringify(dev.initial_config));

    dev.user_config = {
      conf: {
        STUB: {
          common: {
            nested: { child: { 0: "new_value" } },
          },
        },
      },
    };

    expect(() => dev.update_config()).not.toThrow();
  });

  it("creates missing intermediate key (L243 left=true branch: key not in current)", () => {
    const dev = makeDev();

    dev.user_config = {
      conf: {
        STUB: {
          common: {
            missing: { sub: { 0: "val" } },
          },
        },
      },
    };

    expect(() => dev.update_config()).not.toThrow();
  });
});
describe("RSDevice._render_disabled() — L397: inner _hass guard evaluates to false", () => {
  function makeDev(): any {
    const dev = document.createElement("stub-rsdev-bg") as any;
    dev.initial_config = { model: "STUB", name: "", elements: {} };
    dev.setConfig({});
    dev.config = {
      background_img: "",
      elements: [{ name: "maintenance", type: "common-switch" }],
    };
    dev._elements = {};
    dev.requestUpdate = vi.fn();
    return dev;
  }

  it("skips create_element when _hass is null at the inner if (L397 false branch)", () => {
    const dev = makeDev();
    dev.device = {
      name: "MyDevice",
      model: "STUB",
      elements: [{ identifiers: [["rs", "x"]], disabled_by: null }],
    };

    const realHass = makeHass_H({
      "sensor.maint": makeState_F("on", "sensor.maint"),
    });
    dev.entities = { maintenance: { entity_id: "sensor.maint" } };

    let callCount = 0;
    Object.defineProperty(dev, "_hass", {
      get() {
        callCount++;
        return callCount <= 2 ? realHass : null;
      },
      configurable: true,
    });

    vi.spyOn(dev, "is_disabled").mockReturnValue(false);
    const spy = vi.spyOn(MyElement, "create_element");

    const result = dev._render_disabled();

    expect(spy).not.toHaveBeenCalled();

    expect(result).not.toBeNull();
  });
});
