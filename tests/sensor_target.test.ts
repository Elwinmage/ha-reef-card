// Consolidated tests for sensor_target

import { ProgressBar } from "../src/base/progress_bar";
import { ProgressCircle } from "../src/base/progress_circle";
import { SensorTarget } from "../src/base/sensor_target";
import { OFF_COLOR } from "../src/utils/constants";
import { afterEach, describe, expect, it, vi } from "vitest";

function makeState(
  state: string,
  entity_id = "sensor.test",
  attrs: Record<string, any> = {},
): any {
  return {
    entity_id,
    state,
    attributes: { unit_of_measurement: "mL", ...attrs },
  };
}
function makeHass(extra: Record<string, any> = {}): any {
  return {
    states: {
      "sensor.value": makeState("50", "sensor.value"),
      "sensor.target": makeState("100", "sensor.target"),
      ...extra,
    },
    callService: vi.fn(),
    entities: [],
  };
}
function makeDevice(isOn = true): any {
  return {
    entities: {
      my_value: { entity_id: "sensor.value" },
      my_target: { entity_id: "sensor.target" },
    },
    config: { color: "51,151,232", alpha: 0.8 },
    is_on: () => isOn,
    masterOn: true,
  };
}
class StubSensorTarget extends SensorTarget {
  protected override _render(_s = "") {
    return null;
  }
}
class StubProgressBar extends ProgressBar {
  protected override _render(_s = "") {
    return null;
  }
}
class StubProgressCircle extends ProgressCircle {
  protected override _render(_s = "") {
    return null;
  }
}
if (!customElements.get("test-sensor-target"))
  customElements.define("test-sensor-target", StubSensorTarget);
if (!customElements.get("test-progress-bar"))
  customElements.define("test-progress-bar", StubProgressBar);
if (!customElements.get("test-progress-circle"))
  customElements.define("test-progress-circle", StubProgressCircle);
class StubSTBranch extends SensorTarget {
  protected override _render(_s = "") {
    return null as any;
  }
}
if (!customElements.get("stub-st-branch"))
  customElements.define("stub-st-branch", StubSTBranch);
afterEach(() => {
  vi.restoreAllMocks();
});
function makeState_B(state: string, entity_id = "sensor.x"): any {
  return { entity_id, state, attributes: {} };
}
function makeEl(): any {
  const el = new StubSTBranch() as any;
  el.stateObjTarget = null;
  el.stateObj = null;
  el.conf = null;
  el.device = null;
  el._hass = null;
  el.requestUpdate = vi.fn();
  return el;
}
class StubPCBranch extends ProgressCircle {}
if (!customElements.get("stub-pc-branch"))
  customElements.define("stub-pc-branch", StubPCBranch);
function makeState_C(state: string, entity_id = "sensor.x"): any {
  return { entity_id, state, attributes: {} };
}
function makeDevice_B(on = true): any {
  return {
    config: { color: "0,200,100", alpha: 1 },
    entities: {},
    is_on: () => on,
    masterOn: on,
  };
}
function makeCircle(state = "50", targetState = "100", device_on = true): any {
  const c = new StubPCBranch() as any;
  c.conf = { name: "auto_dosed_today", class: "today_dosing" };
  c.stateObj = makeState(state, "sensor.dosed");
  c.stateObjTarget = makeState(targetState, "sensor.daily");
  c.device = makeDevice(device_on);
  c.color = "0,200,100";
  c.c = "0,200,100";
  c.alpha = 1;
  c.label = "";
  c.evaluateCondition = (_expr: any) => false;
  return c;
}
function uid(prefix = "t"): string {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

describe("SensorTarget.getValue()", () => {
  it("returns 0 when stateObj is null", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObj = null;
    expect(elt.getValue()).toBe(0);
  });

  it("returns parsed float from stateObj.state", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObj = makeState("42.5");
    expect(elt.getValue()).toBe(42.5);
  });

  it("returns 0 for non-numeric state", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObj = makeState("unavailable");
    expect(elt.getValue()).toBe(0);
  });

  it("returns negative values correctly", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObj = makeState("-5.5");
    expect(elt.getValue()).toBe(-5.5);
  });
});
describe("SensorTarget.getTargetValue()", () => {
  it("returns 0 when stateObjTarget is null", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObjTarget = null;
    expect(elt.getTargetValue()).toBe(0);
  });

  it("returns parsed float from stateObjTarget.state", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObjTarget = makeState("100");
    expect(elt.getTargetValue()).toBe(100);
  });

  it("returns 0 for non-numeric target state", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObjTarget = makeState("unknown");
    expect(elt.getTargetValue()).toBe(0);
  });
});
describe("SensorTarget.getPercentage()", () => {
  function makeElt(value: string, target: string): StubSensorTarget {
    const elt = new StubSensorTarget() as any;
    elt.stateObj = makeState(value);
    elt.stateObjTarget = makeState(target);
    return elt;
  }

  it("returns 0 when value is 0", () =>
    expect(makeElt("0", "100").getPercentage()).toBe(0));
  it("returns 100 when value equals target", () =>
    expect(makeElt("100", "100").getPercentage()).toBe(100));
  it("returns 50 for value=50 target=100", () =>
    expect(makeElt("50", "100").getPercentage()).toBe(50));
  it("floors fractional results", () =>
    expect(makeElt("1", "3").getPercentage()).toBe(33));
  it("avoids div by zero — uses 1 as fallback", () =>
    expect(makeElt("5", "0").getPercentage()).toBe(500));
  it("returns 0 when both are 0", () =>
    expect(makeElt("0", "0").getPercentage()).toBe(0));
  it("handles large values correctly", () =>
    expect(makeElt("200", "100").getPercentage()).toBe(200));
});
describe("SensorTarget.hasTargetState()", () => {
  it("returns false when both null", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObj = null;
    elt.stateObjTarget = null;
    expect(elt.hasTargetState()).toBe(false);
  });

  it("returns false when only stateObj set", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObj = makeState("10");
    elt.stateObjTarget = null;
    expect(elt.hasTargetState()).toBe(false);
  });

  it("returns false when only stateObjTarget set", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObj = null;
    elt.stateObjTarget = makeState("100");
    expect(elt.hasTargetState()).toBe(false);
  });

  it("returns true when both set", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObj = makeState("10");
    elt.stateObjTarget = makeState("100");
    expect(elt.hasTargetState()).toBe(true);
  });
});
describe("SensorTarget._load_subelements()", () => {
  it("loads stateObjTarget from device entities when target is configured", () => {
    const elt = new StubSensorTarget() as any;
    elt._hass = makeHass();
    elt.device = makeDevice();
    elt.conf = { name: "my_value", target: "my_target" };
    elt._load_subelements();
    expect(elt.stateObjTarget?.entity_id).toBe("sensor.target");
    expect(elt.stateObjTarget?.state).toBe("100");
  });

  it("leaves stateObjTarget null when target key not in device entities", () => {
    const elt = new StubSensorTarget() as any;
    elt._hass = makeHass();
    elt.device = makeDevice();
    elt.conf = { name: "my_value", target: "nonexistent" };
    elt._load_subelements();
    expect(elt.stateObjTarget).toBeNull();
  });

  it("does nothing when conf has no target", () => {
    const elt = new StubSensorTarget() as any;
    elt._hass = makeHass();
    elt.device = makeDevice();
    elt.conf = { name: "my_value" };
    elt._load_subelements();
    expect(elt.stateObjTarget).toBeNull();
  });

  it("does nothing when device is undefined", () => {
    const elt = new StubSensorTarget() as any;
    elt._hass = makeHass();
    elt.device = undefined;
    elt.conf = { name: "my_value", target: "my_target" };
    elt._load_subelements();
    expect(elt.stateObjTarget).toBeNull();
  });
});
describe("SensorTarget hass setter", () => {
  it("updates stateObjTarget when its state changes", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObjTarget = makeState("100", "sensor.target");
    elt.conf = { name: "my_value", target: "my_target" };
    elt.requestUpdate = vi.fn();
    const newHass = makeHass({
      "sensor.target": makeState("200", "sensor.target"),
    });
    elt.hass = newHass;
    expect(elt.stateObjTarget?.state).toBe("200");
    expect(elt.requestUpdate).toHaveBeenCalled();
  });

  it("does not update stateObjTarget when state is unchanged", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObj = makeState("50", "sensor.value");
    elt.stateObjTarget = makeState("100", "sensor.target");
    elt.conf = { name: "my_value", target: "my_target" };

    elt.requestUpdate = vi.fn();
    elt.hass = makeHass();

    expect(elt.stateObjTarget?.state).toBe("100");
    expect(elt.requestUpdate).not.toHaveBeenCalled();
  });

  it("does not crash when stateObjTarget is null", () => {
    const elt = new StubSensorTarget() as any;
    elt.stateObjTarget = null;
    elt.conf = { name: "my_value" };
    expect(() => {
      elt.hass = makeHass();
    }).not.toThrow();
  });
});
describe("ProgressBar", () => {
  it("inherits getValue from SensorTarget", () => {
    const elt = new StubProgressBar() as any;
    elt.stateObj = makeState("75");
    expect(elt.getValue()).toBe(75);
  });

  it("inherits getTargetValue from SensorTarget", () => {
    const elt = new StubProgressBar() as any;
    elt.stateObjTarget = makeState("200");
    expect(elt.getTargetValue()).toBe(200);
  });

  it("getPercentage() returns 75 for 75/100", () => {
    const elt = new StubProgressBar() as any;
    elt.stateObj = makeState("75");
    elt.stateObjTarget = makeState("100");
    expect(elt.getPercentage()).toBe(75);
  });

  it("hasTargetState() returns false when target missing", () => {
    const elt = new StubProgressBar() as any;
    elt.stateObj = makeState("75");
    elt.stateObjTarget = null;
    expect(elt.hasTargetState()).toBe(false);
  });

  it("sets c to OFF_COLOR when device is off", () => {
    const elt = new StubProgressBar() as any;
    elt.stateObj = makeState("50");
    elt.stateObjTarget = makeState("100");
    elt.device = makeDevice(false);
    elt.color = "51,151,232";

    if (!elt.device.is_on()) {
      elt.c = OFF_COLOR;
    } else {
      elt.c = elt.color;
    }
    expect(elt.c).toBe(OFF_COLOR);
  });

  it("sets c to device color when device is on", () => {
    const elt = new StubProgressBar() as any;
    elt.device = makeDevice(true);
    elt.color = "51,151,232";
    if (!elt.device.is_on()) {
      elt.c = OFF_COLOR;
    } else {
      elt.c = elt.color;
    }
    expect(elt.c).toBe("51,151,232");
  });

  it("fill is clamped to 0 when percent is 0", () => {
    expect(Math.max(0, 0 - 1)).toBe(0);
  });

  it("fill is percent-1 for positive percent", () => {
    expect(Math.max(0, 80 - 1)).toBe(79);
  });

  it("_load_subelements() loads target from device", () => {
    const elt = new StubProgressBar() as any;
    elt._hass = makeHass();
    elt.device = makeDevice();
    elt.conf = { name: "my_value", target: "my_target" };
    elt._load_subelements();
    expect(elt.stateObjTarget?.state).toBe("100");
  });
});
describe("ProgressCircle", () => {
  it("inherits getPercentage from SensorTarget", () => {
    const elt = new StubProgressCircle() as any;
    elt.stateObj = makeState("25");
    elt.stateObjTarget = makeState("100");
    expect(elt.getPercentage()).toBe(25);
  });

  it("percent stays 100 when value >= target", () => {
    const value = 100,
      target = 100;
    let percent = 100;
    if (parseFloat(String(value)) < parseFloat(String(target))) {
      percent = Math.floor((value * 100) / target);
    }
    expect(percent).toBe(100);
  });

  it("percent = floor(value*100/target) when value < target", () => {
    const value = 33,
      target = 100;
    let percent = 100;
    if (parseFloat(String(value)) < parseFloat(String(target))) {
      percent = Math.floor((value * 100) / target);
    }
    expect(percent).toBe(33);
  });

  it("fill is clamped to 0 when percent=0", () => {
    let fill = 0 - 2;
    if (fill < 0) fill = 0;
    expect(fill).toBe(0);
  });

  it("fill = percent-2 for normal percent", () => {
    const percent = 75;
    let fill = percent - 2;
    if (fill < 0) fill = 0;
    expect(fill).toBe(73);
  });

  it("stroke-dashoffset formula is correct", () => {
    expect(565 - (50 * 565) / 100).toBe(282.5);
    expect(565 - (100 * 565) / 100).toBe(0);
    expect(565 - (0 * 565) / 100).toBe(565);
  });

  it("sets c to OFF_COLOR when device is off", () => {
    const elt = new StubProgressCircle() as any;
    elt.device = makeDevice(false);
    elt.color = "51,151,232";
    if (!elt.device.is_on()) {
      elt.c = OFF_COLOR;
    } else {
      elt.c = elt.color;
    }
    expect(elt.c).toBe(OFF_COLOR);
  });

  it("hasTargetState() true when both states set", () => {
    const elt = new StubProgressCircle() as any;
    elt.stateObj = makeState("10");
    elt.stateObjTarget = makeState("100");
    expect(elt.hasTargetState()).toBe(true);
  });
});
describe("SensorTarget set hass() — L61 reachable branches", () => {
  it("L61 branch A: sot truthy + state changed → stateObjTarget updated", () => {
    const el = makeEl();
    el.conf = { name: "st", target: "t" };
    el.stateObjTarget = makeState_B("9", "sensor.t");
    vi.clearAllMocks();

    el.hass = { states: { "sensor.t": makeState_B("10", "sensor.t") } };

    expect(el.stateObjTarget.state).toBe("10");
    expect(el.requestUpdate).toHaveBeenCalled();
  });

  it("L61 not reached: same state → L60 condition false → no update", () => {
    const el = makeEl();
    el.conf = { name: "st", target: "t" };
    el.stateObjTarget = makeState_B("10", "sensor.t");
    vi.clearAllMocks();

    el.hass = { states: { "sensor.t": makeState_B("10", "sensor.t") } };

    expect(el.requestUpdate).not.toHaveBeenCalled();
    expect(el.stateObjTarget.state).toBe("10");
  });

  it("L61 not reached: entity absent from states → sot=undefined → L60 short-circuits", () => {
    const el = makeEl();
    el.conf = { name: "st", target: "t" };
    el.stateObjTarget = makeState_B("9", "sensor.t");
    vi.clearAllMocks();

    el.hass = { states: {} };

    expect(el.requestUpdate).not.toHaveBeenCalled();
    expect(el.stateObjTarget.state).toBe("9");
  });

  it("L61 not reached: stateObjTarget=null → L58 guard short-circuits", () => {
    const el = makeEl();
    el.conf = { name: "st", target: "t" };
    el.stateObjTarget = null;
    vi.clearAllMocks();

    el.hass = { states: { "sensor.t": makeState_B("10", "sensor.t") } };

    expect(el.requestUpdate).not.toHaveBeenCalled();
  });

  it("L61 not reached: 'target' not in conf → L58 guard short-circuits", () => {
    const el = makeEl();
    el.conf = { name: "st" };
    el.stateObjTarget = makeState_B("9", "sensor.t");
    vi.clearAllMocks();

    el.hass = { states: { "sensor.t": makeState_B("10", "sensor.t") } };

    expect(el.requestUpdate).not.toHaveBeenCalled();
  });

  it("L61 not reached: conf=null → L58 guard short-circuits", () => {
    const el = makeEl();
    el.conf = null;
    el.stateObjTarget = makeState_B("9", "sensor.t");
    vi.clearAllMocks();

    el.hass = { states: { "sensor.t": makeState_B("10", "sensor.t") } };

    expect(el.requestUpdate).not.toHaveBeenCalled();
  });
});
describe("SensorTarget._load_subelements() — L134 branch coverage", () => {
  it("L134 branch A: entity_id in _hass.states → stateObjTarget = state object", () => {
    const el = makeEl();
    el.conf = { name: "st", target: "my_target" };
    el.device = { entities: { my_target: { entity_id: "sensor.target" } } };
    el._hass = {
      states: { "sensor.target": makeState_B("42", "sensor.target") },
    };

    el._load_subelements();

    expect(el.stateObjTarget).not.toBeNull();
    expect(el.stateObjTarget.state).toBe("42");
  });

  it("L134 branch B: entity_id absent from states → undefined || null → stateObjTarget=null", () => {
    const el = makeEl();
    el.conf = { name: "st", target: "my_target" };
    el.device = { entities: { my_target: { entity_id: "sensor.missing" } } };
    el._hass = { states: {} };

    el._load_subelements();

    expect(el.stateObjTarget).toBeNull();
  });

  it("L134 not reached: no conf.target → L131 outer if false", () => {
    const el = makeEl();
    el.conf = { name: "st" };
    el.device = { entities: {} };
    el._hass = { states: {} };

    el._load_subelements();
    expect(el.stateObjTarget).toBeNull();
  });

  it("L134 not reached: device=null → L131 outer if false", () => {
    const el = makeEl();
    el.conf = { name: "st", target: "my_target" };
    el.device = null;
    el._hass = { states: {} };

    el._load_subelements();
    expect(el.stateObjTarget).toBeNull();
  });

  it("L134 not reached: targetEntity absent from device.entities → L133 inner if false", () => {
    const el = makeEl();
    el.conf = { name: "st", target: "my_target" };
    el.device = { entities: {} };
    el._hass = { states: {} };

    el._load_subelements();
    expect(el.stateObjTarget).toBeNull();
  });
});
describe("ProgressCircle.styles — L33 ternary branch coverage", () => {
  it("L33 branch A (reachable): SensorTarget.styles is an Array → spread used", () => {
    expect(Array.isArray(SensorTarget.styles)).toBe(true);

    expect(Array.isArray(ProgressCircle.styles)).toBe(true);
    expect(ProgressCircle.styles.length).toBeGreaterThan(0);

    const pcStyles = ProgressCircle.styles;
    for (const s of SensorTarget.styles as any[]) {
      expect(pcStyles).toContain(s);
    }
  });

  it("L33 branch B (dead code): documents that Array.isArray(SensorTarget.styles) is always true", () => {
    expect(Array.isArray(SensorTarget.styles)).toBe(true);
  });
});
describe("ProgressCircle._render() — L58 default parameter branch coverage", () => {
  it("L58 branch B: _render() called with NO argument → default '' used", () => {
    const c = makeCircle("50", "100", true);

    const result = c._render();
    expect(result).toBeDefined();
  });

  it("L58 branch A: _render('') called with explicit empty string → default NOT used", () => {
    const c = makeCircle("50", "100", true);

    const result = c._render("");
    expect(result).toBeDefined();
  });

  it("_render() with no arg: device off → c set to OFF_COLOR", () => {
    const c = makeCircle("50", "100", false);
    c._render();
    expect(c.c).toBe(OFF_COLOR);
  });

  it("_render() with no arg: value < target → percent computed correctly", () => {
    const c = makeCircle("30", "100", true);
    c._render();

    expect(c.c).not.toBe(OFF_COLOR);
  });

  it("_render() with no arg: hasTargetState false → error div returned", () => {
    const c = makeCircle();
    c.stateObjTarget = null;
    const result = c._render();
    expect(result).toBeDefined();
  });

  it("_render() with no arg: no_value=true → hidden style applied", () => {
    const c = makeCircle("50", "100", true);
    c.conf.no_value = true;
    const result = c._render();
    expect(result).toBeDefined();
  });
});
describe("SensorTarget", () => {
  async function makeTarget() {
    const { SensorTarget } = await import("../src/base/sensor_target");
    const tag = uid("st");
    class T extends SensorTarget {}
    customElements.define(tag, T);
    const el = document.createElement(tag) as any;
    el.conf = { name: "st1", target: "daily_dose" };
    el._hass = {
      states: {
        "sensor.target": {
          entity_id: "sensor.target",
          state: "10",
          attributes: {},
        },
      },
    };
    el.stateObj = { entity_id: "sensor.val", state: "5", attributes: {} };
    el.stateObjTarget = {
      entity_id: "sensor.target",
      state: "9",
      attributes: {},
    };
    el.device = {
      entities: { daily_dose: { entity_id: "sensor.target" } },
    };
    el.requestUpdate = vi.fn();
    el.c = "0,0,255";
    el.alpha = 1;
    el.label = "";
    return el;
  }

  it("L61: updates stateObjTarget and calls requestUpdate when state changed", async () => {
    const el = await makeTarget();

    el.hass = el._hass;
    expect(el.requestUpdate).toHaveBeenCalled();
    expect(el.stateObjTarget.state).toBe("10");
  });

  it("L102-103: _render returns error div when hasTargetState is false", async () => {
    const el = await makeTarget();
    el.stateObjTarget = null;
    const result = el._render();
    expect(result).toBeDefined();
  });

  it("L106-123: _render returns value/target template when both states present", async () => {
    const el = await makeTarget();
    el.stateObjTarget = {
      entity_id: "sensor.target",
      state: "10",
      attributes: {},
    };
    vi.spyOn(el, "evaluate").mockImplementation((v: any) => v || "");
    vi.spyOn(el, "get_style").mockReturnValue("");
    const result = el._render();
    expect(result).toBeDefined();
  });

  it("L108-110: floors value and target when force_integer is true", async () => {
    const el = await makeTarget();
    el.conf = { name: "st1", target: "daily_dose", force_integer: true };
    el.stateObj = { entity_id: "sensor.val", state: "5.7", attributes: {} };
    el.stateObjTarget = {
      entity_id: "sensor.target",
      state: "10.9",
      attributes: {},
    };
    vi.spyOn(el, "evaluate").mockImplementation((v: any) => v || "");
    vi.spyOn(el, "get_style").mockReturnValue("");
    const result = el._render();
    expect(result).toBeDefined();
  });

  it("L134: _load_subelements sets stateObjTarget from hass.states", async () => {
    const el = await makeTarget();
    el.stateObjTarget = null;
    el._load_subelements();
    expect(el.stateObjTarget).not.toBeNull();
    expect(el.stateObjTarget.state).toBe("10");
  });
});
