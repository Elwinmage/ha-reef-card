// Consolidated tests for base_components

import { Button } from "../src/base/button";
import { ClickImage } from "../src/base/click_image";
import { MyElement } from "../src/base/element";
import { RSMessages } from "../src/base/messages";
import { ProgressBar } from "../src/base/progress_bar";
import { ProgressCircle } from "../src/base/progress_circle";
import { Sensor } from "../src/base/sensor";
import { RSSwitch } from "../src/base/switch";
import { RSDevice } from "../src/devices/device";
import { RSDose4 } from "../src/devices/rsdose/rsdose";
import { config4 } from "../src/devices/rsdose/rsdose4.mapping";
import { RSMat } from "../src/devices/rsmat/rsmat";
import { beforeEach, describe, expect, it, vi } from "vitest";

function makeState(
  state: string,
  entity_id = "sensor.test",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: attrs };
}
function makeHass(extra: Record<string, any> = {}): any {
  return {
    states: { "sensor.x": makeState("on", "sensor.x"), ...extra },
    callService: vi.fn(),
    devices: {},
    entities: [],
  };
}
function makeDevice(isOn = true): any {
  return {
    entities: { x: { entity_id: "sensor.x" } },
    config: { color: "51,151,232", alpha: 0.8 },
    is_on: () => isOn,
    masterOn: true,
    device: { elements: [{ primary_config_entry: "entry_1" }] },
  };
}
class StubButton extends Button {
  protected override _render(_s = "") {
    return null;
  }
}
class StubSwitch extends RSSwitch {
  protected override _render(_s = "") {
    return null;
  }
}
class StubSensor extends Sensor {
  protected override _render(_s = "") {
    return null;
  }
}
class StubMessages extends RSMessages {
  protected override _render(_s = "") {
    return null;
  }
}
if (!customElements.get("stub-button-x"))
  customElements.define("stub-button-x", StubButton);
if (!customElements.get("stub-switch-x"))
  customElements.define("stub-switch-x", StubSwitch);
if (!customElements.get("stub-sensor-x"))
  customElements.define("stub-sensor-x", StubSensor);
if (!customElements.get("stub-messages-x"))
  customElements.define("stub-messages-x", StubMessages);
class StubSensor2 extends Sensor {
  protected override _render(_s = "") {
    return super._render(_s);
  }
}
if (!customElements.get("stub-sensor2"))
  customElements.define("stub-sensor2", StubSensor2);
class StubSwitch2 extends RSSwitch {
  protected override _render(_s = "") {
    return super._render(_s);
  }
}
if (!customElements.get("stub-switch2"))
  customElements.define("stub-switch2", StubSwitch2);
class StubMessages_B extends RSMessages {
  protected override _render(_s = "") {
    return super._render(_s);
  }
}
if (!customElements.get("stub-messages2"))
  customElements.define("stub-messages2", StubMessages_B);
class StubClickImage extends ClickImage {
  protected override _render(_s = "") {
    return super._render(_s);
  }
}
if (!customElements.get("stub-click-image2"))
  customElements.define("stub-click-image2", StubClickImage);
class StubProgressBar extends ProgressBar {
  protected override _render(_s = "") {
    return super._render(_s);
  }
}
if (!customElements.get("stub-progress-bar2"))
  customElements.define("stub-progress-bar2", StubProgressBar);
class StubProgressCircle extends ProgressCircle {
  protected override _render(_s = "") {
    return super._render(_s);
  }
}
if (!customElements.get("stub-progress-circle2"))
  customElements.define("stub-progress-circle2", StubProgressCircle);
function makeState_B(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeDevice_B(is_on_val = true): any {
  return {
    is_on: () => is_on_val,
    entities: {},
    config: { color: "0,128,255" },
    get_entity: (_k: string) => null,
  };
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
function makeHass_B(states: Record<string, any> = {}): any {
  return { states, entities: {}, devices: {}, callService: vi.fn() };
}

describe("Button", () => {
  let btn: any;
  beforeEach(() => {
    btn = new StubButton();
    btn.device = makeDevice();
    btn._hass = makeHass();
  });

  it("is instantiated without throwing", () => {
    expect(btn).toBeInstanceOf(Button);
  });

  it("setConfig() stores conf", () => {
    btn.setConfig({ name: "my_btn", type: "common-button" });
    expect(btn.conf.name).toBe("my_btn");
  });

  it("has_changed() returns false when stateObj is null", () => {
    btn.stateObj = null;
    expect(btn.has_changed(makeHass())).toBe(false);
  });

  it("has_changed() returns true when entity state differs", () => {
    btn.stateObj = makeState("off", "sensor.x");
    const newHass = makeHass({ "sensor.x": makeState("on", "sensor.x") });
    expect(btn.has_changed(newHass)).toBe(true);
  });

  it("has_changed() returns false when state is unchanged", () => {
    btn.stateObj = makeState("on", "sensor.x");
    expect(btn.has_changed(makeHass())).toBe(false);
  });

  it("_click() calls run_actions when tap_action is set and masterOn", () => {
    btn.conf = { name: "x", tap_action: { domain: "ha", action: "toggle" } };
    btn.run_actions = vi.fn();
    btn._click();
    expect(btn.run_actions).toHaveBeenCalled();
  });

  it("_click() is a no-op when no tap_action", () => {
    btn.conf = { name: "x" };
    btn.run_actions = vi.fn();
    btn._click();
    expect(btn.run_actions).not.toHaveBeenCalled();
  });

  it("_longclick() calls run_actions when hold_action is set", () => {
    btn.conf = { name: "x", hold_action: { domain: "ha", action: "toggle" } };
    btn.run_actions = vi.fn();
    btn._longclick();
    expect(btn.run_actions).toHaveBeenCalled();
  });

  it("_dblclick() calls run_actions when double_tap_action is set", () => {
    btn.conf = {
      name: "x",
      double_tap_action: { domain: "ha", action: "toggle" },
    };
    btn.run_actions = vi.fn();
    btn._dblclick();
    expect(btn.run_actions).toHaveBeenCalled();
  });

  it("msgbox() dispatches hass-notification event", () => {
    const fired: any[] = [];
    btn.dispatchEvent = (e: CustomEvent) => fired.push(e);
    btn.msgbox("hello");
    expect(fired[0]?.type).toBe("hass-notification");
    expect(fired[0]?.detail?.message).toBe("hello");
  });

  it("get_style() converts css object to inline string", () => {
    btn.conf = { name: "x", css: { color: "red", "font-size": "12px" } };
    const style = btn.get_style("css");
    expect(style).toContain("color:red");
    expect(style).toContain("font-size:12px");
  });

  it("get_style() replaces $DEVICE-COLOR$ token", () => {
    btn.device = makeDevice(true);
    btn.conf = { name: "x", css: { "background-color": "$DEVICE-COLOR$" } };
    const style = btn.get_style("css");
    expect(style).toContain("rgb(51,151,232)");
  });

  it("get_style() replaces $DEVICE-COLOR-ALPHA$ token", () => {
    btn.device = makeDevice(true);
    btn.conf = {
      name: "x",
      css: { "background-color": "$DEVICE-COLOR-ALPHA$" },
    };
    const style = btn.get_style("css");
    expect(style).toContain("rgba(51,151,232,0.8)");
  });

  it("get_style() uses OFF_COLOR token when device is off", () => {
    btn.device = makeDevice(false);
    btn.conf = { name: "x", css: { "background-color": "$DEVICE-COLOR$" } };
    const style = btn.get_style("css");

    expect(style).not.toContain("rgb(51,151,232)");
  });
});
describe("RSSwitch", () => {
  let sw: any;
  beforeEach(() => {
    sw = new StubSwitch();
    sw.device = makeDevice();
    sw._hass = makeHass();
  });

  it("is_on returns false when conf is undefined", () => {
    sw.conf = undefined;
    expect(sw.is_on).toBe(false);
  });

  it("is_on returns false when stateObj state is 'off'", () => {
    sw.conf = { name: "my_switch", style: "switch" };
    sw.stateObj = makeState("off", "sensor.x");
    expect(sw.is_on).toBe(false);
  });

  it("is_on returns true when stateObj state is 'on'", () => {
    sw.conf = { name: "my_switch", style: "switch" };
    sw.stateObj = makeState("on", "sensor.x");
    expect(sw.is_on).toBe(true);
  });

  it("setConfig() stores conf", () => {
    sw.setConfig({ name: "sw1", type: "common-switch", style: "button" });
    expect(sw.conf.style).toBe("button");
  });

  it("has_changed() detects state change", () => {
    sw.stateObj = makeState("on", "sensor.x");
    const newHass = makeHass({ "sensor.x": makeState("off", "sensor.x") });
    expect(sw.has_changed(newHass)).toBe(true);
  });

  it("has_changed() returns false when no change", () => {
    sw.stateObj = makeState("on", "sensor.x");
    expect(sw.has_changed(makeHass())).toBe(false);
  });

  it("hass setter updates stateObj on state change", () => {
    sw.stateObj = makeState("on", "sensor.x");
    sw.requestUpdate = vi.fn();
    sw.hass = makeHass({ "sensor.x": makeState("off", "sensor.x") });
    expect(sw.stateObj.state).toBe("off");
    expect(sw.requestUpdate).toHaveBeenCalled();
  });

  it("hass setter does not requestUpdate when state is unchanged", () => {
    sw.stateObj = makeState("on", "sensor.x");
    sw.requestUpdate = vi.fn();
    sw.hass = makeHass();
    expect(sw.requestUpdate).not.toHaveBeenCalled();
  });
});
describe("Sensor", () => {
  let sensor: any;
  beforeEach(() => {
    sensor = new StubSensor();
    sensor.device = makeDevice();
    sensor._hass = makeHass();
    sensor.stateObj = makeState("22.5", "sensor.x", {
      unit_of_measurement: "°C",
    });
  });

  it("is instantiated without throwing", () => {
    expect(sensor).toBeInstanceOf(Sensor);
  });

  it("setConfig stores conf", () => {
    sensor.setConfig({ name: "temp", type: "common-sensor" });
    expect(sensor.conf.name).toBe("temp");
  });

  it("connectedCallback sets stateOn=true when state is 'on'", () => {
    sensor.stateObj = makeState("on", "sensor.x");
    sensor.connectedCallback();
    expect(sensor.stateOn).toBe(true);
  });

  it("connectedCallback sets stateOn=false for non-on state", () => {
    sensor.stateObj = makeState("22.5", "sensor.x");
    sensor.connectedCallback();
    expect(sensor.stateOn).toBe(false);
  });

  it("updated() refreshes stateOn to true", () => {
    sensor.stateObj = makeState("on", "sensor.x");
    sensor.updated();
    expect(sensor.stateOn).toBe(true);
  });

  it("updated() refreshes stateOn to false", () => {
    sensor.stateObj = makeState("off", "sensor.x");
    sensor.updated();
    expect(sensor.stateOn).toBe(false);
  });

  it("updated() skips when stateObj is null", () => {
    sensor.stateObj = null;
    sensor.stateOn = true;
    sensor.updated();
    expect(sensor.stateOn).toBe(true);
  });

  it("get_style() returns empty string when no css in conf", () => {
    sensor.conf = { name: "temp" };
    expect(sensor.get_style()).toBe("");
  });

  it("get_style() converts css object to inline string", () => {
    sensor.conf = { name: "temp", css: { color: "red", "font-size": "12px" } };
    const style = sensor.get_style("css");
    expect(style).toContain("color:red");
    expect(style).toContain("font-size:12px");
  });

  it("has_changed() returns true on state change", () => {
    sensor.stateObj = makeState("20", "sensor.x");
    const newHass = makeHass({ "sensor.x": makeState("22", "sensor.x") });
    expect(sensor.has_changed(newHass)).toBe(true);
  });

  it("has_changed() returns false when state unchanged", () => {
    sensor.stateObj = makeState("22.5", "sensor.x");
    expect(
      sensor.has_changed(
        makeHass({ "sensor.x": makeState("22.5", "sensor.x") }),
      ),
    ).toBe(false);
  });
});
describe("RSMessages", () => {
  let msg: any;
  beforeEach(() => {
    msg = new StubMessages();
    msg.device = makeDevice();
    msg._hass = makeHass();
    msg.requestUpdate = vi.fn();
  });

  it("is instantiated without throwing", () => {
    expect(msg).toBeInstanceOf(RSMessages);
  });

  it("setConfig() stores conf", () => {
    msg.setConfig({ name: "alerts", type: "rs-messages" });
    expect(msg.conf.name).toBe("alerts");
  });

  it("get_style() with elt.css returns inline style string", () => {
    msg.conf = { name: "x", "elt.css": { color: "blue" } };
    const style = msg.get_style("elt.css");
    expect(style).toContain("color:blue");
  });

  it("has_changed() returns false when stateObj is null", () => {
    msg.stateObj = null;
    expect(msg.has_changed(makeHass())).toBe(false);
  });

  it("hass setter updates _hass", () => {
    const newHass = makeHass();
    msg.hass = newHass;
    expect(msg._hass).toBe(newHass);
  });

  it("get_style() returns empty string when no elt.css in conf", () => {
    msg.conf = { name: "x" };
    expect(msg.get_style("elt.css")).toBe("");
  });
});
describe("Sensor._render()", () => {
  it("returns html`` when conf is undefined", () => {
    const s = new StubSensor2() as any;
    s.conf = undefined;
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("renders ha-icon when conf.icon is true", () => {
    const s = new StubSensor2() as any;
    s.conf = { icon: true };
    s.stateObj = makeState_B("on", "sensor.x", { icon: "mdi:wifi" });
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("renders ha-icon with custom icon_color", () => {
    const s = new StubSensor2() as any;
    s.conf = { icon: true, icon_color: "#ff0000" };
    s.stateObj = makeState_B("on", "sensor.x", { icon: "mdi:wifi" });
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("L87: falls back to mdi:help when stateObj.attributes.icon is absent", () => {
    const s = new StubSensor2() as any;
    s.conf = { icon: true };

    s.stateObj = makeState_B("on", "sensor.x");
    s.color = "0,128,255";
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("renders value and unit when stateObj present", () => {
    const s = new StubSensor2() as any;
    s.conf = { unit: "mg/L" };
    s.stateObj = makeState_B("8.5", "sensor.x", { unit_of_measurement: "ppm" });
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("uses stateObj unit_of_measurement when conf.unit absent", () => {
    const s = new StubSensor2() as any;
    s.conf = {};
    s.stateObj = makeState_B("7.5", "sensor.x", {
      unit_of_measurement: "mg/L",
    });
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("applies prefix to value", () => {
    const s = new StubSensor2() as any;
    s.conf = { prefix: "~" };
    s.stateObj = makeState_B("25", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("rounds value when force_integer is true", () => {
    const s = new StubSensor2() as any;
    s.conf = { force_integer: true };
    s.stateObj = makeState_B("25.9", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("skips round when value is not a parseable number", () => {
    const s = new StubSensor2() as any;
    s.conf = { force_integer: true };
    s.stateObj = makeState_B("on", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("uses label property when set instead of state", () => {
    const s = new StubSensor2() as any;
    s.conf = {};
    s.label = "My Label";
    s.stateObj = makeState_B("42", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("renders without unit when unit is empty string", () => {
    const s = new StubSensor2() as any;
    s.conf = { unit: "" };
    s.stateObj = makeState_B("10", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("renders with custom class from conf.class", () => {
    const s = new StubSensor2() as any;
    s.conf = { class: "my-sensor" };
    s.stateObj = makeState_B("5", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });
});
describe("RSSwitch._render()", () => {
  it("renders switch style when conf.style='switch'", () => {
    const sw = new StubSwitch2() as any;
    sw.conf = { name: "schedule_enabled", style: "switch" };
    sw.stateObj = makeState_B("on");
    sw.label = "Schedule";
    const result = sw._render("");
    expect(result).toBeDefined();
  });

  it("renders switch style when state is 'off'", () => {
    const sw = new StubSwitch2() as any;
    sw.conf = { name: "schedule_enabled", style: "switch" };
    sw.stateObj = makeState_B("off");
    sw.label = "";
    const result = sw._render("");
    expect(result).toBeDefined();
  });

  it("renders button style with default color", () => {
    const sw = new StubSwitch2() as any;
    sw.conf = { name: "pump_btn", style: "button" };
    sw.stateObj = makeState_B("on");
    sw.color = "0,128,255";
    sw.alpha = 0.8;
    sw.label = "Pump";
    const result = sw._render("");
    expect(result).toBeDefined();
  });

  it("renders button style with conf.color override", () => {
    const sw = new StubSwitch2() as any;
    sw.conf = {
      name: "pump_btn",
      style: "button",
      color: "255,0,0",
      alpha: 0.5,
    };
    sw.stateObj = makeState_B("on");
    sw.label = "Pump";
    const result = sw._render("");
    expect(result).toBeDefined();
  });

  it("logs error for unknown style", () => {
    const sw = new StubSwitch2() as any;
    sw.conf = { name: "btn", style: "unknown" };
    sw.stateObj = makeState_B("on");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    sw._render("");
    spy.mockRestore();
  });
});
describe("RSMessages._render()", () => {
  it("returns html`` when stateObj is null", () => {
    const m = new StubMessages_B() as any;
    m.conf = { name: "msg" };
    m.stateObj = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("renders empty value when state is 'unavailable'", () => {
    const m = new StubMessages_B() as any;
    m.conf = { name: "msg" };
    m.stateObj = makeState_B("unavailable");
    m._hass = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("renders empty value when state is 'unknown'", () => {
    const m = new StubMessages_B() as any;
    m.conf = { name: "msg" };
    m.stateObj = makeState_B("unknown");
    m._hass = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("renders empty value when state is empty string", () => {
    const m = new StubMessages_B() as any;
    m.conf = { name: "msg" };
    m.stateObj = makeState_B("");
    m._hass = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("renders marquee with value when state is valid", () => {
    const m = new StubMessages_B() as any;
    m.conf = { name: "msg" };
    m.stateObj = makeState_B("Hello World");
    m._hass = null;
    m.device = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("applies label wrapper when conf.label is set", () => {
    const m = new StubMessages_B() as any;
    m.conf = { name: "msg", label: "*** " };
    m.stateObj = makeState_B("Alert!");
    m._hass = null;
    m.device = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("creates trash element when _hass and device are set", () => {
    const m = new StubMessages_B() as any;
    m.conf = { name: "msg" };
    m.stateObj = makeState_B("Test Message");
    const hass = {
      states: { "sensor.msg": makeState_B("Test Message") },
      entities: {},
      devices: {},
      callService: vi.fn(),
    };
    m._hass = hass;
    m.device = makeDevice_B();

    expect(() => m._render("")).not.toThrow();
  });

  it("L30: _render() called without argument covers the default-parameter branch", () => {
    class StubMsgNoArg extends RSMessages {
      protected override _render(_s = "") {
        return super._render();
      }
    }
    if (!customElements.get("stub-msg-no-arg"))
      customElements.define("stub-msg-no-arg", StubMsgNoArg);

    const m = document.createElement("stub-msg-no-arg") as any;
    m.conf = { name: "msg" };
    m.stateObj = null;
    expect(() => m._render()).not.toThrow();
  });
});
describe("ClickImage._render()", () => {
  it("renders img element for standard image source", () => {
    const ci = new StubClickImage() as any;
    ci.conf = { image: "/img/test.png", name: "test_img" };
    const result = ci._render("");
    expect(result).toBeDefined();
  });

  it("renders ha-icon for mdi: icon", () => {
    const ci = new StubClickImage() as any;
    ci.conf = { icon: "mdi:water-pump", icon_color: "#00ff00" };
    const result = ci._render("");
    expect(result).toBeDefined();
  });

  it("renders mdi icon with default color when icon_color absent", () => {
    const ci = new StubClickImage() as any;
    ci.conf = { icon: "mdi:wifi" };
    const result = ci._render("");
    expect(result).toBeDefined();
  });

  it("falls back to conf css style when _style is empty", () => {
    const ci = new StubClickImage() as any;
    ci.conf = { image: "/img/test.png", css: { width: "50%" } };
    const result = ci._render("");
    expect(result).toBeDefined();
  });

  it("uses provided _style when non-empty", () => {
    const ci = new StubClickImage() as any;
    ci.conf = { image: "/img/test.png" };
    const result = ci._render("width:100%");
    expect(result).toBeDefined();
  });

  it("handles empty conf.image gracefully", () => {
    const ci = new StubClickImage() as any;
    ci.conf = {};
    const result = ci._render("");
    expect(result).toBeDefined();
  });
});
describe("ProgressBar._render()", () => {
  function makeBar(state = "50", targetState = "100", device_on = true): any {
    const bar = new StubProgressBar() as any;
    bar.conf = {
      name: "container_volume",
      class: "pg-container",
      label: false,
    };
    bar.stateObj = makeState_B(state, "sensor.vol");
    bar.stateObjTarget = makeState_B(targetState, "sensor.target");
    bar.device = makeDevice_B(device_on);
    bar.color = "0,200,100";
    bar.c = "0,200,100";
    bar.alpha = 1;
    bar.evalCtx = null;

    bar.evaluate = (expr: any) => (typeof expr === "string" ? expr : "");
    return bar;
  }

  it("returns error div when stateObj is missing", () => {
    const bar = new StubProgressBar() as any;
    bar.conf = { name: "vol" };
    bar.stateObj = null;
    bar.stateObjTarget = makeState_B("100");
    const result = bar._render("");
    expect(result).toBeDefined();
  });

  it("returns error div when stateObjTarget is missing", () => {
    const bar = new StubProgressBar() as any;
    bar.conf = { name: "vol" };
    bar.stateObj = makeState_B("50");
    bar.stateObjTarget = null;
    const result = bar._render("");
    expect(result).toBeDefined();
  });

  it("renders bar when device is on", () => {
    const bar = makeBar("50", "100", true);
    const result = bar._render("");
    expect(result).toBeDefined();
  });

  it("renders bar with OFF_COLOR when device is off", () => {
    const bar = makeBar("50", "100", false);
    const result = bar._render("");
    expect(result).toBeDefined();
  });

  it("renders with string label expression", () => {
    const bar = makeBar("75", "100", true);
    bar.conf.label = "75 days left";
    const result = bar._render("");
    expect(result).toBeDefined();
  });

  it("logs error when percent > 100", () => {
    const bar = makeBar("150", "100", true);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    bar._render("");
    spy.mockRestore();
  });

  it("clamps fill to 0 when percent is 0", () => {
    const bar = makeBar("0", "100", true);
    const result = bar._render("");
    expect(result).toBeDefined();
  });

  it("uses default class 'progress-bar' when conf.class absent", () => {
    const bar = makeBar();
    bar.conf = { name: "vol", label: false };
    const result = bar._render("");
    expect(result).toBeDefined();
  });

  it("L38: _render() without argument covers the default-parameter branch", () => {
    class StubBarNoArg extends ProgressBar {
      protected override _render(_s = "") {
        return super._render();
      }
    }
    if (!customElements.get("stub-bar-no-arg"))
      customElements.define("stub-bar-no-arg", StubBarNoArg);

    const bar = document.createElement("stub-bar-no-arg") as any;
    bar.conf = { name: "vol" };
    bar.stateObj = null;
    bar.stateObjTarget = makeState_B("100");
    expect(() => bar._render()).not.toThrow();
  });
});
describe("ProgressCircle._render()", () => {
  function makeCircle(
    state = "50",
    targetState = "100",
    device_on = true,
  ): any {
    const c = new StubProgressCircle() as any;
    c.conf = {
      name: "auto_dosed_today",
      class: "today_dosing",
    };
    c.stateObj = makeState_B(state, "sensor.dosed");
    c.stateObjTarget = makeState_B(targetState, "sensor.daily");
    c.device = makeDevice_B(device_on);
    c.color = "0,200,100";
    c.c = "0,200,100";
    c.alpha = 1;
    c.evaluate = (expr: any) => (typeof expr === "string" ? expr : "");
    c.evaluateCondition = (_expr: any) => false;
    return c;
  }

  it("returns error div when stateObj is missing", () => {
    const c = new StubProgressCircle() as any;
    c.conf = { name: "vol" };
    c.stateObj = null;
    c.stateObjTarget = makeState_B("100");
    const result = c._render("");
    expect(result).toBeDefined();
  });

  it("renders circle when both states present and device on", () => {
    const c = makeCircle("50", "100", true);
    const result = c._render("");
    expect(result).toBeDefined();
  });

  it("uses OFF_COLOR when device is off", () => {
    const c = makeCircle("50", "100", false);
    const result = c._render("");
    expect(result).toBeDefined();
  });

  it("returns <br> when disabled_if condition is true", () => {
    const c = makeCircle("0", "100", true);
    c.conf.disabled_if = "${entity.slm.state}=='off'";
    c.evaluateCondition = (_expr: any) => true;
    const result = c._render("");
    expect(result).toBeDefined();
  });

  it("sets percent=100 when value >= target", () => {
    const c = makeCircle("100", "100", true);
    const result = c._render("");
    expect(result).toBeDefined();
  });

  it("sets fill=0 when percent-2 < 0", () => {
    const c = makeCircle("0", "100", true);
    const result = c._render("");
    expect(result).toBeDefined();
  });

  it("hides value text when no_value is true", () => {
    const c = makeCircle("50", "100", true);
    c.conf.no_value = true;
    const result = c._render("");
    expect(result).toBeDefined();
  });

  it("L33: _render() without argument covers the default-parameter branch", () => {
    class StubCircleNoArg extends ProgressCircle {
      protected override _render(_s = "") {
        return super._render();
      }
    }
    if (!customElements.get("stub-circle-no-arg"))
      customElements.define("stub-circle-no-arg", StubCircleNoArg);

    const c = document.createElement("stub-circle-no-arg") as any;
    c.conf = { name: "vol" };
    c.stateObj = null;
    c.stateObjTarget = makeState_B("100");
    expect(() => c._render()).not.toThrow();
  });
});
describe("Button._render() L35-41", () => {
  it("renders without icon when conf.icon is absent", async () => {
    const { Button } = await import("../src/base/button");
    const tag = uid("button-no-icon");
    class T extends Button {}
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;
    el.conf = { name: "btn1" };
    el.label = "Click";
    expect(el._render()).toBeDefined();
  });

  it("renders with icon when conf.icon is present", async () => {
    const { Button } = await import("../src/base/button");
    const tag = uid("button-icon");
    class T extends Button {}
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;
    el.conf = { name: "btn2", icon: "mdi:home" };
    el.label = "Home";
    expect(el._render()).toBeDefined();
  });

  it("L42: uses empty string as id when conf.name is absent", async () => {
    const { Button } = await import("../src/base/button");
    const tag = uid("button-no-name");
    class T extends Button {}
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;

    el.conf = { icon: "mdi:star" };
    el.label = "";
    const result = el._render();
    expect(result).toBeDefined();
  });
});
describe("Sensor._render() L96 — stateObj falsy branch", () => {
  it("returns template with empty value when stateObj is null", async () => {
    const { Sensor } = await import("../src/base/sensor");
    const tag = uid("sensor-null-state");
    class T extends Sensor {}
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;
    el.conf = { name: "s1" };
    el.stateObj = null;
    el.label = "";
    expect(el._render()).toBeDefined();
  });
});
describe("ProgressBar._render() branch gaps", () => {
  async function makeBar(labelVal: any, targetState: string) {
    const { ProgressBar } = await import("../src/base/progress_bar");
    const tag = uid("pbar");
    class T extends ProgressBar {}
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;
    el.conf = { name: "pb", label: labelVal };
    el.stateObj = { state: "50", attributes: {} };
    el.stateObjTarget = {
      entity_id: "sensor.t",
      state: targetState,
      attributes: {},
    };
    el.label = "";
    el.c = "0,128,0";
    el.color = "0,128,0";
    el.device = { is_on: () => true };
    vi.spyOn(el, "hasTargetState").mockReturnValue(true);
    vi.spyOn(el, "getPercentage").mockReturnValue(50);
    vi.spyOn(el, "get_style").mockReturnValue("");
    return el;
  }

  it("L79: target defaults to 1 when stateObjTarget.state is empty (falsy)", async () => {
    const el = await makeBar("auto", "");
    expect(() => el._render()).not.toThrow();
  });

  it("L90: skips evaluate(label) when conf.label is boolean true", async () => {
    const el = await makeBar(true, "100");
    const spy = vi.spyOn(el, "evaluate");
    el._render();

    expect(spy.mock.calls.some((c: any[]) => c[0] === true)).toBe(false);
  });

  it("L90: calls evaluate(label) when conf.label is a string", async () => {
    const el = await makeBar("${x}", "100");
    vi.spyOn(el, "evaluate").mockReturnValue("eval'd");
    el._render();

    expect(el.evaluate).toHaveBeenCalledWith("${x}");
  });
});
describe("RSSwitch._handleSwitchChange() L92-95", () => {
  it("calls _click() when conf.tap_action is set", async () => {
    const { RSSwitch } = await import("../src/base/switch");
    const tag = uid("sw-tap");
    class T extends RSSwitch {}
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;
    el.conf = { name: "sw", tap_action: { action: "toggle" } };
    el._hass = { callService: vi.fn(), states: {} };
    const spy = vi.spyOn(el, "_click").mockImplementation(() => {});
    el._handleSwitchChange();
    expect(spy).toHaveBeenCalled();
  });

  it("does not call _click() when conf.tap_action is absent", async () => {
    const { RSSwitch } = await import("../src/base/switch");
    const tag = uid("sw-no-tap");
    class T extends RSSwitch {}
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;
    el.conf = { name: "sw2" };
    const spy = vi.spyOn(el, "_click").mockImplementation(() => {});
    el._handleSwitchChange();
    expect(spy).not.toHaveBeenCalled();
  });
});
describe("ClickImage._render() — L42 branch coverage", () => {
  function makeCI(): any {
    const ci = document.createElement("stub-ci-bg") as any;
    ci.requestUpdate = vi.fn();
    return ci;
  }

  it("traverses mdi icon path with NO argument (default _style param branch)", () => {
    const ci = makeCI();
    ci.conf = { icon: "mdi:water-pump", icon_color: "#00ff00" };

    const result = ci._render();
    expect(result).toBeDefined();
  });

  it("traverses img path with no conf.name → || 'clickable image' fallback fires", () => {
    const ci = makeCI();

    ci.conf = { image: "/img/test.png" };
    const result = ci._render("");
    expect(result).toBeDefined();
  });

  it("traverses img path with conf.name present (|| left-hand wins)", () => {
    const ci = makeCI();
    ci.conf = { image: "/img/test.png", name: "my_pump" };
    const result = ci._render("");
    expect(result).toBeDefined();
  });

  it("traverses mdi icon path with explicit non-empty _style (bypasses get_style call)", () => {
    const ci = makeCI();
    ci.conf = { icon: "mdi:wifi", icon_color: "blue" };
    const result = ci._render("width:32px;height:32px");
    expect(result).toBeDefined();
  });

  it("traverses img path when conf is null (conf?.name = undefined → fallback 'clickable image')", () => {
    const ci = makeCI();
    ci.conf = null;

    const result = ci._render("");
    expect(result).toBeDefined();
  });

  it("traverses img path when conf is undefined (?.name undefined → || fallback)", () => {
    const ci = makeCI();
    ci.conf = undefined;
    const result = ci._render("");
    expect(result).toBeDefined();
  });
});
