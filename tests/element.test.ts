// Consolidated tests for element

import { ClickImage } from "../src/base/click_image";
import { MyElement } from "../src/base/element";
import { RSDevice } from "../src/devices/device";
import { RSDose4 } from "../src/devices/rsdose/rsdose";
import { config4 } from "../src/devices/rsdose/rsdose4.mapping";
import { RSMat } from "../src/devices/rsmat/rsmat";
import { OFF_COLOR } from "../src/utils/constants";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/base/index";

function makeState(state: string, entity_id = "sensor.test"): any {
  return { entity_id, state, attributes: {} };
}
function makeHass(extraStates: Record<string, any> = {}): any {
  return {
    states: {
      "sensor.temp": makeState("22", "sensor.temp"),
      "switch.relay": makeState("on", "switch.relay"),
      ...extraStates,
    },
    callService: vi.fn(),
    devices: {},
    entities: [],
  };
}
function makeDevice(isOn = true, color = "51,151,232", alpha = 0.8): any {
  return {
    entities: {
      temp: { entity_id: "sensor.temp" },
      relay: { entity_id: "switch.relay" },
    },
    config: { color, alpha },
    is_on: () => isOn,
    masterOn: true,
  };
}
class StubElement extends MyElement {
  protected override _render(_style: string) {
    return null;
  }
}
if (!customElements.get("test-stub")) {
  customElements.define("test-stub", StubElement);
}
class StubEl extends MyElement {}
if (!customElements.get("stub-el-cov-1"))
  customElements.define("stub-el-cov-1", StubEl);
class StubNoLoad extends MyElement {
  protected override _render() {
    return null as any;
  }
}
delete (StubNoLoad.prototype as any)._load_subelements;
if (!customElements.get("stub-el-noload"))
  customElements.define("stub-el-noload", StubNoLoad);
function makeHass_B(states: Record<string, any> = {}): any {
  return { states, entities: {}, devices: {}, callService: vi.fn() };
}
function makeState_B(state: string, entity_id = "sensor.x"): any {
  return { entity_id, state, attributes: {} };
}
function makeDevice_B(entities: Record<string, any> = {}, isOn = true): any {
  return {
    config: { color: "0,200,100", alpha: 0.8, name: "dev" },
    entities,
    is_on: () => isOn,
    masterOn: isOn,
    get_entity: (k: string) => entities[k] ?? null,
  };
}
function makeEl(): any {
  const el = new StubEl() as any;
  el.device = makeDevice();
  el.stateObj = null;
  el.stateOn = false;
  el._hass = makeHass();
  el.conf = { name: "test" };
  el.evalCtx = null;
  el.color = "0,200,100";
  el.alpha = 0.8;
  el.c = null;
  return el;
}
class StubElClick extends MyElement {
  protected override _render(_style: string): any {
    return null;
  }
}
if (!customElements.get("stub-el-click-l547"))
  customElements.define("stub-el-click-l547", StubElClick);
function makeHass_C(): any {
  return { states: {}, entities: {}, devices: {}, callService: vi.fn() };
}
function makeDevice_C(masterOn = true): any {
  return {
    entities: {},
    config: { color: "0,0,0", alpha: 1 },
    is_on: () => masterOn,
    masterOn,
  };
}
function makeEl_B(confOverride: any, deviceOverride?: any): any {
  const el = new StubElClick() as any;
  el._hass = makeHass();
  el.stateObj = null;
  el.device = deviceOverride !== undefined ? deviceOverride : makeDevice();
  el.conf = confOverride;
  el.run_actions = vi.fn();
  return el;
}
function uid(prefix = "t"): string {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
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
function makeState_C(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass_D(states: Record<string, any> = {}): any {
  return { states, entities: {}, devices: {}, callService: vi.fn() };
}

describe("MyElement — createEntitiesContext (via create_element)", () => {
  it("builds entities context when device and hass are present", () => {
    const hass = makeHass();
    const device = makeDevice();

    const conf: any = {
      type: "test-stub",
      name: "temp",
      label: "${entity.temp.state}°C",
    };
    const elt = MyElement.create_element(hass, conf, device);

    expect(elt.label).toBe("22°C");
  });

  it("returns empty context when device has no entities", () => {
    const hass = makeHass();
    const device = { ...makeDevice(), entities: {} };
    const conf: any = { type: "test-stub", name: "temp" };
    expect(() => MyElement.create_element(hass, conf, device)).not.toThrow();
  });
});
describe("MyElement.create_element()", () => {
  it("sets stateObj to null when config.stateObj is false", () => {
    const conf: any = { type: "test-stub", name: "temp", stateObj: false };
    const elt = MyElement.create_element(makeHass(), conf, makeDevice());
    expect(elt.stateObj).toBeNull();
  });

  it("links stateObj from hass.states when entity exists", () => {
    const conf: any = { type: "test-stub", name: "temp" };
    const elt = MyElement.create_element(makeHass(), conf, makeDevice());
    expect(elt.stateObj?.entity_id).toBe("sensor.temp");
  });

  it("leaves stateObj null when entity_id not in hass.states", () => {
    const hass = makeHass();
    const device = {
      ...makeDevice(),
      entities: { missing: { entity_id: "sensor.missing" } },
    };
    const conf: any = { type: "test-stub", name: "missing" };
    const elt = MyElement.create_element(hass, conf, device);
    expect(elt.stateObj).toBeNull();
  });

  it("sets label to config.name when label is boolean true", () => {
    const conf: any = { type: "test-stub", name: "temp", label: true };
    const elt = MyElement.create_element(makeHass(), conf, makeDevice());
    expect(elt.label).toBe("temp");
  });

  it("evaluates string label expression", () => {
    const conf: any = { type: "test-stub", name: "temp", label: "${state}°" };
    const elt = MyElement.create_element(makeHass(), conf, makeDevice());
    expect(elt.label).toBe("22°");
  });

  it("leaves label empty when label is false", () => {
    const conf: any = { type: "test-stub", name: "temp", label: false };
    const elt = MyElement.create_element(makeHass(), conf, makeDevice());
    expect(elt.label).toBe("");
  });

  it("calls _load_subelements when method exists", () => {
    const loadSpy = vi.fn();
    class SubElt extends MyElement {
      override _load_subelements() {
        loadSpy();
      }
    }
    if (!customElements.get("test-sub"))
      customElements.define("test-sub", SubElt);
    const conf: any = { type: "test-sub", name: "temp" };
    MyElement.create_element(makeHass(), conf, makeDevice());
    expect(loadSpy).toHaveBeenCalled();
  });
});
describe("MyElement.has_changed()", () => {
  it("returns false when stateObj is null", () => {
    const elt = new StubElement() as any;
    elt.stateObj = null;
    expect(elt.has_changed(makeHass())).toBe(false);
  });

  it("returns false when state is unchanged", () => {
    const elt = new StubElement() as any;
    elt.stateObj = makeState("on", "switch.relay");
    expect(elt.has_changed(makeHass())).toBe(false);
  });

  it("returns true when state changed", () => {
    const elt = new StubElement() as any;
    elt.stateObj = makeState("off", "switch.relay");
    expect(elt.has_changed(makeHass())).toBe(true);
  });

  it("returns false when entity absent from new hass", () => {
    const elt = new StubElement() as any;
    elt.stateObj = makeState("on", "sensor.missing");
    expect(elt.has_changed(makeHass())).toBe(false);
  });
});
describe("MyElement.get_style()", () => {
  function makeElt(conf: any, device: any): StubElement {
    const elt = new StubElement() as any;
    elt.conf = conf;
    elt.device = device;
    return elt;
  }

  it("returns '' when conf is missing the css level", () => {
    const elt = makeElt({ other: {} }, makeDevice());
    expect(elt.get_style()).toBe("");
  });

  it("converts CSS map to style string", () => {
    const elt = makeElt(
      { css: { color: "red", "font-size": "12px" } },
      makeDevice(),
    );
    const style = elt.get_style();
    expect(style).toContain("color:red");
    expect(style).toContain("font-size:12px");
  });

  it("replaces $DEVICE-COLOR$ with rgb(color) when device is on", () => {
    const elt = makeElt(
      { css: { "background-color": "$DEVICE-COLOR$" } },
      makeDevice(true, "51,151,232"),
    );
    expect(elt.get_style()).toContain("rgb(51,151,232)");
  });

  it("replaces $DEVICE-COLOR$ with OFF_COLOR when device is off", () => {
    const elt = makeElt(
      { css: { "background-color": "$DEVICE-COLOR$" } },
      makeDevice(false),
    );
    expect(elt.get_style()).toContain(`rgb(${OFF_COLOR})`);
  });

  it("replaces $DEVICE-COLOR-ALPHA$ with rgba()", () => {
    const elt = makeElt(
      { css: { "background-color": "$DEVICE-COLOR-ALPHA$" } },
      makeDevice(true, "51,151,232", 0.5),
    );
    expect(elt.get_style()).toContain("rgba(51,151,232,0.5)");
  });

  it("works with elt.css level", () => {
    const elt = makeElt({ "elt.css": { display: "flex" } }, makeDevice());
    expect(elt.get_style("elt.css")).toContain("display:flex");
  });
});
describe("MyElement.get_entity()", () => {
  function makeElt(hass: any, device: any): StubElement {
    const elt = new StubElement() as any;
    elt._hass = hass;
    elt.device = device;
    return elt;
  }

  it("throws when hass is null", () => {
    const elt = makeElt(null, makeDevice());
    expect(() => elt.get_entity("temp")).toThrow(
      "Hass or device not initialized",
    );
  });

  it("throws when entity key not found in device", () => {
    const elt = makeElt(makeHass(), makeDevice());
    expect(() => elt.get_entity("unknown_key")).toThrow("not found");
  });

  it("throws when entity_id not in hass.states", () => {
    const device = {
      ...makeDevice(),
      entities: { ghost: { entity_id: "sensor.ghost" } },
    };
    const elt = makeElt(makeHass(), device);
    expect(() => elt.get_entity("ghost")).toThrow(
      "State for sensor.ghost not found",
    );
  });

  it("returns the state object when entity exists", () => {
    const elt = makeElt(makeHass(), makeDevice());
    const state = elt.get_entity("temp");
    expect(state.entity_id).toBe("sensor.temp");
  });
});
describe("MyElement.evaluate() / evaluateCondition()", () => {
  function makeElt(): StubElement {
    const elt = new StubElement() as any;
    elt._hass = makeHass();
    elt.device = makeDevice();
    elt.stateObj = makeState("22", "sensor.temp");
    elt.conf = { name: "temp" };
    return elt;
  }

  it("evaluates numeric expression", () => {
    expect(makeElt().evaluate("2 + 2")).toBe(4);
  });

  it("evaluates template with state", () => {
    expect(makeElt().evaluate("${state}°")).toBe("22°");
  });

  it("evaluates condition returning true", () => {
    const elt = makeElt() as any;
    expect(elt.evaluateCondition("state === '22'")).toBe(true);
  });

  it("evaluateCondition returns false for undefined", () => {
    const elt = makeElt() as any;
    expect(elt.evaluateCondition(undefined)).toBe(false);
  });

  it("evaluateCondition returns false for boolean false directly", () => {
    const elt = makeElt() as any;
    expect(elt.evaluateCondition(false)).toBe(false);
  });

  it("evaluateCondition with non-string structured condition returns false", () => {
    const elt = makeElt() as any;

    expect(elt.evaluateCondition({ field: "x", value: "y" })).toBe(false);
  });
});
describe("MyElement.run_actions()", () => {
  function makeElt(): StubElement {
    const elt = new StubElement() as any;
    elt._hass = makeHass();
    elt.device = makeDevice();
    elt.stateObj = makeState("on", "switch.relay");
    elt.conf = { name: "relay" };
    return elt;
  }

  it("calls callService for a HA action", async () => {
    const elt = makeElt() as any;
    const action = {
      domain: "switch",
      action: "toggle",
      data: { entity_id: "relay" },
    };
    await elt.run_actions(action);
    expect(elt._hass.callService).toHaveBeenCalledWith(
      "switch",
      "toggle",
      expect.anything(),
    );
  });

  it("resolves 'default' data to stateObj entity_id", async () => {
    const elt = makeElt() as any;
    const action = { domain: "switch", action: "toggle", data: "default" };
    await elt.run_actions(action);
    expect(elt._hass.callService).toHaveBeenCalledWith("switch", "toggle", {
      entity_id: "switch.relay",
    });
  });

  it("resolves entity_id translation key in action data", async () => {
    const elt = makeElt() as any;
    const action = {
      domain: "switch",
      action: "toggle",
      data: { entity_id: "relay" },
    };
    await elt.run_actions(action);
    expect(elt._hass.callService).toHaveBeenCalledWith("switch", "toggle", {
      entity_id: "switch.relay",
    });
  });

  it("skips disabled actions (enabled: false)", async () => {
    const elt = makeElt() as any;
    const action = {
      domain: "switch",
      action: "toggle",
      data: "default",
      enabled: false,
    };
    await elt.run_actions(action);
    expect(elt._hass.callService).not.toHaveBeenCalled();
  });

  it("accepts array of actions", async () => {
    const elt = makeElt() as any;
    const actions = [
      { domain: "switch", action: "toggle", data: "default" },
      { domain: "switch", action: "turn_on", data: "default" },
    ];
    await elt.run_actions(actions);
    expect(elt._hass.callService).toHaveBeenCalledTimes(2);
  });

  it("dispatches display-dialog event for redsea_ui/dialog", async () => {
    const elt = makeElt() as any;
    document.body.appendChild(elt);
    const events: CustomEvent[] = [];
    elt.addEventListener("display-dialog", (e: CustomEvent) => events.push(e));
    const action = {
      domain: "redsea_ui",
      action: "dialog",
      data: { type: "my_dialog" },
    };
    await elt.run_actions(action);
    expect(events).toHaveLength(1);
    expect(events[0].detail.type).toBe("my_dialog");
    document.body.removeChild(elt);
  });

  it("dispatches quit-dialog event for redsea_ui/exit-dialog", async () => {
    const elt = makeElt() as any;
    document.body.appendChild(elt);
    const events: CustomEvent[] = [];
    elt.addEventListener("quit-dialog", (e: CustomEvent) => events.push(e));
    await elt.run_actions({
      domain: "redsea_ui",
      action: "exit-dialog",
      data: {},
    });
    expect(events).toHaveLength(1);
    document.body.removeChild(elt);
  });

  it("dispatches hass-notification for redsea_ui/message_box with string data", async () => {
    const elt = makeElt() as any;
    document.body.appendChild(elt);
    const events: CustomEvent[] = [];
    elt.addEventListener("hass-notification", (e: CustomEvent) =>
      events.push(e),
    );
    await elt.run_actions({
      domain: "redsea_ui",
      action: "message_box",
      data: "'hello'",
    });
    expect(events).toHaveLength(1);
    expect(events[0].detail.message).toBe("hello");
    document.body.removeChild(elt);
  });

  it("dispatches hass-notification for message_box with object data", async () => {
    const elt = makeElt() as any;
    document.body.appendChild(elt);
    const events: CustomEvent[] = [];
    elt.addEventListener("hass-notification", (e: CustomEvent) =>
      events.push(e),
    );
    await elt.run_actions({
      domain: "redsea_ui",
      action: "message_box",
      data: { key: "val" },
    });
    expect(events).toHaveLength(1);
    expect(events[0].detail.message).toContain("key");
    document.body.removeChild(elt);
  });
});
describe("MyElement._click() / _longclick() / _dblclick()", () => {
  function makeElt(
    confOverride: any = {},
    deviceOverride: any = {},
  ): StubElement {
    const elt = new StubElement() as any;
    elt._hass = makeHass();
    elt.device = { ...makeDevice(), ...deviceOverride };
    elt.stateObj = makeState("on", "switch.relay");
    elt.conf = { name: "relay", ...confOverride };
    elt.run_actions = vi.fn();
    return elt;
  }

  it("_click() calls run_actions when tap_action is set and masterOn", () => {
    const elt = makeElt({
      tap_action: { domain: "switch", action: "toggle", data: "default" },
    }) as any;
    elt._click();
    expect(elt.run_actions).toHaveBeenCalled();
  });

  it("_click() does NOT call run_actions when no device and no tap_action", () => {
    const elt = makeElt({}) as any;
    elt._click();
    expect(elt.run_actions).not.toHaveBeenCalled();
  });

  it("_click() calls run_actions for special names when masterOn is false", () => {
    const elt = makeElt(
      {
        name: "device_state",
        tap_action: { domain: "switch", action: "toggle", data: "default" },
      },
      { masterOn: false },
    ) as any;
    elt._click();
    expect(elt.run_actions).toHaveBeenCalled();
  });

  it("_longclick() calls run_actions when hold_action is set", () => {
    const elt = makeElt({
      hold_action: { domain: "switch", action: "toggle", data: "default" },
    }) as any;
    elt._longclick();
    expect(elt.run_actions).toHaveBeenCalled();
  });

  it("_longclick() does NOT call run_actions when no hold_action", () => {
    const elt = makeElt({}) as any;
    elt._longclick();
    expect(elt.run_actions).not.toHaveBeenCalled();
  });

  it("_dblclick() calls run_actions when double_tap_action is set", () => {
    const elt = makeElt({
      double_tap_action: {
        domain: "switch",
        action: "toggle",
        data: "default",
      },
    }) as any;
    elt._dblclick();
    expect(elt.run_actions).toHaveBeenCalled();
  });

  it("_dblclick() does NOT call run_actions when no double_tap_action", () => {
    const elt = makeElt({}) as any;
    elt._dblclick();
    expect(elt.run_actions).not.toHaveBeenCalled();
  });
});
describe("MyElement.msgbox()", () => {
  it("dispatches hass-notification event with the message", () => {
    const elt = new StubElement() as any;
    document.body.appendChild(elt);
    const events: CustomEvent[] = [];
    elt.addEventListener("hass-notification", (e: CustomEvent) =>
      events.push(e),
    );
    elt.msgbox("Test message");
    expect(events).toHaveLength(1);
    expect(events[0].detail.message).toBe("Test message");
    document.body.removeChild(elt);
  });
});
describe("createEntitiesContext() — skip when entity_id absent or state missing (L82)", () => {
  it("omits entity when entity_id is missing", () => {
    const el = makeEl();
    el.device = makeDevice_B({ bad: {} });
    el._hass = makeHass_B({});
    el.evalCtx = null;

    expect(() => el.createContext()).not.toThrow();
  });

  it("omits entity when state absent from hass.states", () => {
    const el = makeEl();
    el.device = makeDevice_B({ x: { entity_id: "sensor.missing" } });
    el._hass = makeHass_B({});
    el.evalCtx = null;
    expect(() => el.createContext()).not.toThrow();
  });
});
describe("create_element() — _load_subelements missing (L172 false)", () => {
  it("does not throw when prototype has no _load_subelements", () => {
    const device = makeDevice_B({ t: { entity_id: "sensor.t" } });
    const hass = makeHass_B({ "sensor.t": makeState_B("on", "sensor.t") });
    const result = MyElement.create_element(
      hass,
      { type: "stub-el-noload", name: "t", stateObj: null } as any,
      device as any,
    );
    expect(result).not.toBeNull();
  });
});
describe("constructor click callbacks (L190, L194, L198)", () => {
  function setupEl() {
    const el = makeEl();
    document.body.appendChild(el);
    return el;
  }

  it("onClick callback reaches _click() via click + delay (L190)", async () => {
    vi.useFakeTimers();
    const el = setupEl();
    const spy = vi.spyOn(el, "_click").mockImplementation(() => {});
    el.conf = {
      name: "test",
      tap_action: { domain: "light", action: "toggle", data: {} },
    };

    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    vi.advanceTimersByTime(300);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    document.body.removeChild(el);
    vi.useRealTimers();
  });

  it("onDoubleClick callback reaches _dblclick() via dblclick event (L194)", () => {
    const el = setupEl();
    const spy = vi.spyOn(el, "_dblclick").mockImplementation(() => {});
    el.conf = {
      name: "test",
      double_tap_action: { domain: "light", action: "on", data: {} },
    };

    el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    document.body.removeChild(el);
  });

  it("onHold callback reaches _longclick() via pointerdown + hold delay (L198)", async () => {
    vi.useFakeTimers();
    const el = setupEl();
    const spy = vi.spyOn(el, "_longclick").mockImplementation(() => {});
    el.conf = {
      name: "test",
      hold_action: { domain: "light", action: "toggle", data: {} },
    };

    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    vi.advanceTimersByTime(600);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    document.body.removeChild(el);
    vi.useRealTimers();
  });
});
describe("evaluate() (L228-245)", () => {
  it("L230-231: number → String(42)", () => {
    expect(makeEl().evaluate(42 as any)).toBe("42");
  });

  it("L230-231: boolean → String(true)", () => {
    expect(makeEl().evaluate(true as any)).toBe("true");
  });

  it("L234-239: DynamicValue { expression: string } → evaluates the expression", () => {
    const el = makeEl();
    expect(el.evaluate({ expression: "'hello'" } as any)).toBe("hello");
  });

  it("L241-242: DynamicValue.expression is null → String(null) = 'null'", () => {
    expect(makeEl().evaluate({ expression: null } as any)).toBe("null");
  });

  it("L241-242: DynamicValue.expression is a number → String(3)", () => {
    expect(makeEl().evaluate({ expression: 3 } as any)).toBe("3");
  });
});
describe("getNestedProperty() via get_style (L305-308)", () => {
  it("resolves multi-level device.config path without error", () => {
    const el = makeEl();
    el.device = makeDevice_B();
    el.conf = { css: { color: "red" } };

    expect(typeof el.get_style()).toBe("string");
  });
});
describe("MyElement._render() base returns empty template (L362)", () => {
  it("returns a TemplateResult with empty strings", () => {
    const el = makeEl();
    const r = (el as any)._render("style");
    expect(r).toBeDefined();
    expect(r.strings.join("").trim()).toBe("");
  });
});
describe("render() — disabled_if branch (L378-379)", () => {
  it("returns <br /> when evaluateCondition is true", () => {
    const el = makeEl();
    el.conf = { name: "test", disabled_if: "1 === 1" };
    vi.spyOn(el, "evaluateCondition").mockReturnValue(true);
    const result = el.render();
    expect(result.strings.join("")).toContain("br");
  });
});
describe("run_actions() — HA action data branches", () => {
  it("L419-420: data='default' with stateObj → uses stateObj.entity_id", async () => {
    const el = makeEl();
    el.stateObj = makeState_B("on", "sensor.tgt");
    el._hass = makeHass_B();
    await el.run_actions([
      { domain: "light", action: "toggle", data: "default" },
    ]);
    expect(el._hass.callService).toHaveBeenCalledWith("light", "toggle", {
      entity_id: "sensor.tgt",
    });
  });

  it("L421-428: data.entity_id string → resolves via get_entity", async () => {
    const el = makeEl();
    el.device = makeDevice_B({ lamp: { entity_id: "sensor.lamp" } });
    el._hass = makeHass_B({ "sensor.lamp": makeState_B("on", "sensor.lamp") });
    await el.run_actions([
      { domain: "light", action: "turn_on", data: { entity_id: "lamp" } },
    ]);
    expect(el._hass.callService).toHaveBeenCalledWith("light", "turn_on", {
      entity_id: "sensor.lamp",
    });
  });

  it("L409: enabled=false → action filtered, callService not called", async () => {
    const el = makeEl();
    el._hass = makeHass_B();
    await el.run_actions([
      { domain: "light", action: "toggle", data: {}, enabled: false },
    ]);
    expect(el._hass.callService).not.toHaveBeenCalled();
  });
});
describe("run_actions() — timer branch (L436-437)", () => {
  it("calls _wait_timer when timer>0 and ha_actions present", async () => {
    vi.useFakeTimers();
    const el = makeEl();
    el._hass = makeHass_B();
    const spy = vi.spyOn(el, "_wait_timer").mockResolvedValue(undefined);
    const p = el.run_actions(
      [{ domain: "light", action: "toggle", data: {} }],
      3,
    );
    vi.runAllTimers();
    await p;
    expect(spy).toHaveBeenCalledWith(3);
    spy.mockRestore();
    vi.useRealTimers();
  });

  it("does NOT call _wait_timer when ha_actions is empty", async () => {
    const el = makeEl();
    el._hass = makeHass_B();
    const spy = vi.spyOn(el, "_wait_timer").mockResolvedValue(undefined);
    el.addEventListener("quit-dialog", () => {});
    await el.run_actions(
      [{ domain: "redsea_ui", action: "exit-dialog", data: {} }],
      5,
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
describe("run_actions() — UI action branches", () => {
  it("dialog → dispatches display-dialog event", async () => {
    const el = makeEl();
    el._hass = makeHass_B();
    const events: any[] = [];
    el.addEventListener("display-dialog", (e: Event) => events.push(e));
    await el.run_actions([
      {
        domain: "redsea_ui",
        action: "dialog",
        data: { type: "my_dlg", overload_quit: "back" },
      },
    ]);
    expect(events).toHaveLength(1);
    expect(events[0].detail.type).toBe("my_dlg");
    expect(events[0].detail.overload_quit).toBe("back");
  });

  it("exit-dialog → dispatches quit-dialog event", async () => {
    const el = makeEl();
    el._hass = makeHass_B();
    const events: any[] = [];
    el.addEventListener("quit-dialog", (e: Event) => events.push(e));
    await el.run_actions([
      { domain: "redsea_ui", action: "exit-dialog", data: {} },
    ]);
    expect(events).toHaveLength(1);
  });

  it("L469-470: message_box with string → evaluate() then msgbox()", async () => {
    const el = makeEl();
    el._hass = makeHass_B();
    el.conf = { name: "test" };
    const spy = vi.spyOn(el, "msgbox").mockImplementation(() => {});
    await el.run_actions([
      { domain: "redsea_ui", action: "message_box", data: "'hi'" },
    ]);
    expect(spy).toHaveBeenCalledWith("hi");
    spy.mockRestore();
  });

  it("L471-473: message_box with object → JSON.stringify then msgbox()", async () => {
    const el = makeEl();
    el._hass = makeHass_B();
    const spy = vi.spyOn(el, "msgbox").mockImplementation(() => {});
    const d = { key: "v" };
    await el.run_actions([
      { domain: "redsea_ui", action: "message_box", data: d },
    ]);
    expect(spy).toHaveBeenCalledWith(JSON.stringify(d));
    spy.mockRestore();
  });
});
describe("_wait_timer() (L485-525)", () => {
  function makeBtnEl() {
    const el = makeEl();
    const btn = document.createElement("div");
    btn.className = "button";
    btn.innerHTML = "Original";
    Object.defineProperty(el, "shadowRoot", {
      get: () => ({
        querySelector: (s: string) => (s === ".button" ? btn : null),
      }),
      configurable: true,
    });
    return { el, btn };
  }

  it("L491-495: greys out btn immediately on call", async () => {
    vi.useFakeTimers();
    const { el, btn } = makeBtnEl();
    const p = el._wait_timer(1);
    expect(btn.style.opacity).toBe("0.5");
    expect(btn.style.pointerEvents).toBe("none");
    vi.advanceTimersByTime(1000);
    await p;
    vi.useRealTimers();
  });

  it("L511-512: remaining>0 → update_label called (spinner html)", async () => {
    vi.useFakeTimers();
    const { el, btn } = makeBtnEl();
    const p = el._wait_timer(3);
    vi.advanceTimersByTime(1000);
    expect(btn.innerHTML).toContain("timer-spin");
    vi.advanceTimersByTime(2000);
    await p;
    expect(btn.style.opacity).toBe("");
    vi.useRealTimers();
  });

  it("L515-521: restores btn html and styles when remaining===0", async () => {
    vi.useFakeTimers();
    const { el, btn } = makeBtnEl();
    const p = el._wait_timer(1);
    vi.advanceTimersByTime(1000);
    await p;
    expect(btn.style.opacity).toBe("");
    expect(btn.style.cursor).toBe("");
    vi.useRealTimers();
  });

  it("L488-489/L501: btn=null — no throw, update_label skips innerHTML", async () => {
    vi.useFakeTimers();
    const el = makeEl();
    Object.defineProperty(el, "shadowRoot", {
      get: () => ({ querySelector: () => null }),
      configurable: true,
    });
    const p = el._wait_timer(1);
    vi.advanceTimersByTime(1000);
    await expect(p).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it("L515 false: btn=null at restore time — no throw", async () => {
    vi.useFakeTimers();
    const el = makeEl();
    Object.defineProperty(el, "shadowRoot", {
      get: () => null,
      configurable: true,
    });
    const p = el._wait_timer(1);
    vi.advanceTimersByTime(1000);
    await expect(p).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});
describe("MyElement._longclick() — L547 branch coverage", () => {
  it("conf=null: ?.hold_action short-circuits (L547 nullish branch)", () => {
    const el = makeEl_B(null);
    el._longclick();
    expect(el.run_actions).not.toHaveBeenCalled();
  });

  it("conf=undefined: ?.hold_action short-circuits (L547 nullish branch)", () => {
    const el = makeEl_B(undefined);
    el._longclick();
    expect(el.run_actions).not.toHaveBeenCalled();
  });

  it("hold_action set, device=null: !this.device=true → run_actions called", () => {
    const action = { domain: "switch", action: "toggle" };
    const el = makeEl_B({ name: "relay", hold_action: action }, null);
    el._longclick();
    expect(el.run_actions).toHaveBeenCalledWith(action, undefined);
  });

  it("hold_action set, masterOn=false, name='device_state' → run_actions called", () => {
    const action = { domain: "switch", action: "toggle" };
    const el = makeEl_B(
      { name: "device_state", hold_action: action },
      makeDevice_C(false),
    );
    el._longclick();
    expect(el.run_actions).toHaveBeenCalledWith(action, undefined);
  });

  it("hold_action set, masterOn=false, name not special → run_actions NOT called", () => {
    const action = { domain: "switch", action: "toggle" };
    const el = makeEl_B(
      { name: "relay", hold_action: action },
      makeDevice_C(false),
    );
    el._longclick();
    expect(el.run_actions).not.toHaveBeenCalled();
  });

  it("hold_action set, masterOn=true → run_actions called", () => {
    const action = { domain: "switch", action: "toggle" };
    const el = makeEl_B({ name: "relay", hold_action: action });
    el._longclick();
    expect(el.run_actions).toHaveBeenCalledWith(action, undefined);
  });
});
describe("MyElement._dblclick() — L561 branch coverage", () => {
  it("conf=null: ?.double_tap_action short-circuits (L561 nullish branch)", () => {
    const el = makeEl_B(null);
    el._dblclick();
    expect(el.run_actions).not.toHaveBeenCalled();
  });

  it("conf=undefined: ?.double_tap_action short-circuits (L561 nullish branch)", () => {
    const el = makeEl_B(undefined);
    el._dblclick();
    expect(el.run_actions).not.toHaveBeenCalled();
  });

  it("double_tap_action set, device=null: !this.device=true → run_actions called", () => {
    const action = { domain: "switch", action: "toggle" };
    const el = makeEl_B({ name: "relay", double_tap_action: action }, null);
    el._dblclick();
    expect(el.run_actions).toHaveBeenCalledWith(action, undefined);
  });

  it("double_tap_action set, masterOn=false, name='trash' → run_actions called", () => {
    const action = { domain: "switch", action: "toggle" };
    const el = makeEl_B(
      { name: "trash", double_tap_action: action },
      makeDevice_C(false),
    );
    el._dblclick();
    expect(el.run_actions).toHaveBeenCalledWith(action, undefined);
  });

  it("double_tap_action set, masterOn=false, name not special → run_actions NOT called", () => {
    const action = { domain: "switch", action: "toggle" };
    const el = makeEl_B(
      { name: "relay", double_tap_action: action },
      makeDevice_C(false),
    );
    el._dblclick();
    expect(el.run_actions).not.toHaveBeenCalled();
  });

  it("double_tap_action set, masterOn=true → run_actions called", () => {
    const action = { domain: "switch", action: "toggle" };
    const el = makeEl_B({ name: "relay", double_tap_action: action });
    el._dblclick();
    expect(el.run_actions).toHaveBeenCalledWith(action, undefined);
  });
});
describe("MyElement.createEntitiesContext L79 — device null branch", () => {
  it("returns empty object when device is null", async () => {
    const { MyElement } = await import("../src/base/element");

    const result = (MyElement as any).createEntitiesContext(null, {
      states: {},
    });
    expect(result).toEqual({});
  });

  it("returns empty object when hass is null", async () => {
    const { MyElement } = await import("../src/base/element");
    const result = (MyElement as any).createEntitiesContext(
      { entities: { temp: { entity_id: "sensor.temp" } } },
      null,
    );
    expect(result).toEqual({});
  });
});
describe("MyElement.getNestedProperty L305-307", () => {
  it("resolves a nested path correctly", async () => {
    const { MyElement } = await import("../src/base/element");
    const tag = uid("el-nested");
    class T extends MyElement {
      override _render() {
        return null as any;
      }
    }
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;
    el.conf = { name: "x" };

    const result = (el as any).getNestedProperty({ a: { b: 42 } }, "a.b");
    expect(result).toBe(42);
  });

  it("returns undefined for a missing nested path", async () => {
    const { MyElement } = await import("../src/base/element");
    const tag = uid("el-nested-miss");
    class T extends MyElement {
      override _render() {
        return null as any;
      }
    }
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;
    const result = (el as any).getNestedProperty({ a: {} }, "a.b.c");
    expect(result).toBeUndefined();
  });
});
describe("MyElement._wait_timer L520 — original_pointer ?? '' branch", () => {
  it("restores pointerEvents to empty string when original_pointer was null", async () => {
    vi.useFakeTimers();
    const { MyElement } = await import("../src/base/element");
    const tag = uid("el-timer");
    class T extends MyElement {
      override _render() {
        return null as any;
      }
    }
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;

    el.attachShadow({ mode: "open" });
    const btn = document.createElement("div");
    btn.className = "button";
    btn.innerHTML = "original";

    btn.style.pointerEvents = "";
    el.shadowRoot.appendChild(btn);

    const promise = el._wait_timer(1);

    vi.advanceTimersByTime(1000);
    await promise;

    expect(btn.style.pointerEvents).toBe("");
    vi.useRealTimers();
  });
});
describe("MyElement._wait_timer() — L520: ?? '' right-hand side fires when original_pointer is null", () => {
  function makeEl(): any {
    const el = document.createElement("stub-el-bg") as any;
    el.device = null;
    el.stateObj = null;
    el._hass = makeHass_D();
    el.conf = { name: "test" };
    el.requestUpdate = vi.fn();
    return el;
  }

  it("sets pointerEvents to '' via ?? '' fallback when original_pointer is null", async () => {
    vi.useFakeTimers();
    const el = makeEl();

    const btnMock: any = {
      innerHTML: "Original content",
      style: {
        opacity: "",
        filter: "",
        cursor: "",
        pointerEvents: undefined,
      },
    };

    Object.defineProperty(el, "shadowRoot", {
      get: () => ({
        querySelector: (sel: string) => (sel === ".button" ? btnMock : null),
      }),
      configurable: true,
    });

    const p = el._wait_timer(1);
    vi.advanceTimersByTime(1000);
    await p;

    expect(btnMock.style.pointerEvents).toBe("");

    vi.useRealTimers();
  });

  it("restores original pointerEvents string via ?? left-hand side when non-null", async () => {
    vi.useFakeTimers();
    const el = makeEl();

    const btnMock: any = {
      innerHTML: "Content",
      style: {
        opacity: "",
        filter: "",
        cursor: "",
        pointerEvents: "auto",
      },
    };

    Object.defineProperty(el, "shadowRoot", {
      get: () => ({
        querySelector: (sel: string) => (sel === ".button" ? btnMock : null),
      }),
      configurable: true,
    });

    const p = el._wait_timer(1);
    vi.advanceTimersByTime(1000);
    await p;

    expect(btnMock.style.pointerEvents).toBe("auto");

    vi.useRealTimers();
  });
});
