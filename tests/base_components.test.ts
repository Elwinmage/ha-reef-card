/**
 * Unit tests — base/button.ts · base/switch.ts · base/sensor.ts · base/messages.ts
 *
 * Strategy: instantiate each class directly (as a subclass stub to avoid
 * abstract-method issues), set properties by hand, and call pure-logic
 * methods.  No LitElement lifecycle / shadow-DOM is exercised here.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Button } from "../src/base/button";
import { RSSwitch } from "../src/base/switch";
import { Sensor } from "../src/base/sensor";
import { RSMessages } from "../src/base/messages";

// ── Shared stubs ──────────────────────────────────────────────────────────────

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

// Minimal stubs — override _render() so the classes are concrete
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

// ── Button ────────────────────────────────────────────────────────────────────

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
    // OFF_COLOR is used, not the device color
    expect(style).not.toContain("rgb(51,151,232)");
  });
});

// ── RSSwitch ──────────────────────────────────────────────────────────────────

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
    sw.hass = makeHass(); // sensor.x is still "on"
    expect(sw.requestUpdate).not.toHaveBeenCalled();
  });
});

// ── Sensor ────────────────────────────────────────────────────────────────────

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
    expect(sensor.stateOn).toBe(true); // unchanged
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

// ── RSMessages ────────────────────────────────────────────────────────────────

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
