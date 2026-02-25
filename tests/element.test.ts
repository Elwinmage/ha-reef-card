/**
 * Unit tests — src/base/element.ts (MyElement)
 *
 * Imports the real class to generate actual coverage.
 * Covers all methods (lines 77-570):
 *   - createEntitiesContext()
 *   - create_element(): stateObj branches, label branches, _load_subelements
 *   - createContext() / evaluate() / evaluateCondition()
 *   - has_changed()
 *   - get_style(): all CSS token branches
 *   - get_entity(): error paths
 *   - run_actions(): ha/ui actions, timer, message_box, enabled flag
 *   - _click() / _longclick() / _dblclick(): guard conditions
 *   - msgbox()
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MyElement } from "../src/base/element";
import { OFF_COLOR } from "../src/utils/constants";

// ── Minimal stubs ─────────────────────────────────────────────────────────────

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

// Register a minimal stub custom element so customElements.get() works
class StubElement extends MyElement {
  protected override _render(_style: string) {
    return null;
  }
}
if (!customElements.get("test-stub")) {
  customElements.define("test-stub", StubElement);
}

// ── createEntitiesContext (lines 77-88) ───────────────────────────────────────

describe("MyElement — createEntitiesContext (via create_element)", () => {
  it("builds entities context when device and hass are present", () => {
    const hass = makeHass();
    const device = makeDevice();
    // We access it indirectly via evaluate() with entity context
    const conf: any = {
      type: "test-stub",
      name: "temp",
      label: "${entity.temp.state}°C",
    };
    const elt = MyElement.create_element(hass, conf, device);
    // entity.temp.state should have been resolved = "22"
    expect(elt.label).toBe("22°C");
  });

  it("returns empty context when device has no entities", () => {
    const hass = makeHass();
    const device = { ...makeDevice(), entities: {} };
    const conf: any = { type: "test-stub", name: "temp" };
    expect(() => MyElement.create_element(hass, conf, device)).not.toThrow();
  });
});

// ── create_element (lines 128-170) ────────────────────────────────────────────

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

// ── has_changed (line ~293) ───────────────────────────────────────────────────

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

// ── get_style (lines 314-333) ─────────────────────────────────────────────────

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

// ── get_entity (lines 337-354) ────────────────────────────────────────────────

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

// ── evaluate / evaluateCondition (lines 218-266) ──────────────────────────────

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
    // DisabledCondition object → not string → returns false
    expect(elt.evaluateCondition({ field: "x", value: "y" })).toBe(false);
  });
});

// ── run_actions (lines 395-477) ───────────────────────────────────────────────

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

// ── _click / _longclick / _dblclick (lines 535-570) ──────────────────────────

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

// ── msgbox (lines ~570) ───────────────────────────────────────────────────────

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
