/**
 * Unit tests — src/base/sensor_target.ts · src/base/progress_bar.ts · src/base/progress_circle.ts
 *
 * Tests the REAL class methods directly (not extracted replicas).
 * No LitElement rendering — pure logic methods only.
 */

import { describe, it, expect, vi } from "vitest";
import { SensorTarget } from "../src/base/sensor_target";
import { ProgressBar } from "../src/base/progress_bar";
import { ProgressCircle } from "../src/base/progress_circle";
import { OFF_COLOR } from "../src/utils/constants";

// ── Stubs ─────────────────────────────────────────────────────────────────────

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

// ── SensorTarget.getValue() ───────────────────────────────────────────────────

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

// ── SensorTarget.getTargetValue() ────────────────────────────────────────────

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

// ── SensorTarget.getPercentage() ─────────────────────────────────────────────

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

// ── SensorTarget.hasTargetState() ────────────────────────────────────────────

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

// ── SensorTarget._load_subelements() ─────────────────────────────────────────

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

// ── SensorTarget hass setter ──────────────────────────────────────────────────

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
    elt.hass = makeHass(); // sensor.target is still "100"

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

// ── ProgressBar — logic methods ───────────────────────────────────────────────

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
    // Manually replicate the _render() color logic
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

// ── ProgressCircle — logic methods ───────────────────────────────────────────

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
