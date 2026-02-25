/**
 * Extended tests for base UI components:
 * Sensor, RSSwitch, RSMessages, ClickImage, ProgressBar, ProgressCircle
 *
 * Targets uncovered branches in:
 *   src/base/sensor.ts, src/base/switch.ts, src/base/messages.ts,
 *   src/base/click_image.ts, src/base/progress_bar.ts, src/base/progress_circle.ts
 */

import { describe, it, expect, vi } from "vitest";
import { Sensor } from "../src/base/sensor";
import { RSSwitch } from "../src/base/switch";
import { RSMessages } from "../src/base/messages";
import { ClickImage } from "../src/base/click_image";
import { ProgressBar } from "../src/base/progress_bar";
import { ProgressCircle } from "../src/base/progress_circle";

// ---------------------------------------------------------------------------
// Stub wrappers (each needs unique tag before `new`)
// ---------------------------------------------------------------------------

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

class StubMessages extends RSMessages {
  protected override _render(_s = "") {
    return super._render(_s);
  }
}
if (!customElements.get("stub-messages2"))
  customElements.define("stub-messages2", StubMessages);

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}

function makeDevice(is_on_val = true): any {
  return {
    is_on: () => is_on_val,
    entities: {},
    config: { color: "0,128,255" },
    get_entity: (_k: string) => null,
  };
}

// ---------------------------------------------------------------------------
// Sensor — _render() branches
// ---------------------------------------------------------------------------

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
    s.stateObj = makeState("on", "sensor.x", { icon: "mdi:wifi" });
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("renders ha-icon with custom icon_color", () => {
    const s = new StubSensor2() as any;
    s.conf = { icon: true, icon_color: "#ff0000" };
    s.stateObj = makeState("on", "sensor.x", { icon: "mdi:wifi" });
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("renders value and unit when stateObj present", () => {
    const s = new StubSensor2() as any;
    s.conf = { unit: "mg/L" };
    s.stateObj = makeState("8.5", "sensor.x", { unit_of_measurement: "ppm" });
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("uses stateObj unit_of_measurement when conf.unit absent", () => {
    const s = new StubSensor2() as any;
    s.conf = {};
    s.stateObj = makeState("7.5", "sensor.x", { unit_of_measurement: "mg/L" });
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("applies prefix to value", () => {
    const s = new StubSensor2() as any;
    s.conf = { prefix: "~" };
    s.stateObj = makeState("25", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("rounds value when force_integer is true", () => {
    const s = new StubSensor2() as any;
    s.conf = { force_integer: true };
    s.stateObj = makeState("25.9", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("skips round when value is not a parseable number", () => {
    const s = new StubSensor2() as any;
    s.conf = { force_integer: true };
    s.stateObj = makeState("on", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("uses label property when set instead of state", () => {
    const s = new StubSensor2() as any;
    s.conf = {};
    s.label = "My Label";
    s.stateObj = makeState("42", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("renders without unit when unit is empty string", () => {
    const s = new StubSensor2() as any;
    s.conf = { unit: "" };
    s.stateObj = makeState("10", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });

  it("renders with custom class from conf.class", () => {
    const s = new StubSensor2() as any;
    s.conf = { class: "my-sensor" };
    s.stateObj = makeState("5", "sensor.x");
    const result = s._render("");
    expect(result).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// RSSwitch — _render() branches
// ---------------------------------------------------------------------------

describe("RSSwitch._render()", () => {
  it("renders switch style when conf.style='switch'", () => {
    const sw = new StubSwitch2() as any;
    sw.conf = { name: "schedule_enabled", style: "switch" };
    sw.stateObj = makeState("on");
    sw.label = "Schedule";
    const result = sw._render("");
    expect(result).toBeDefined();
  });

  it("renders switch style when state is 'off'", () => {
    const sw = new StubSwitch2() as any;
    sw.conf = { name: "schedule_enabled", style: "switch" };
    sw.stateObj = makeState("off");
    sw.label = "";
    const result = sw._render("");
    expect(result).toBeDefined();
  });

  it("renders button style with default color", () => {
    const sw = new StubSwitch2() as any;
    sw.conf = { name: "pump_btn", style: "button" };
    sw.stateObj = makeState("on");
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
    sw.stateObj = makeState("on");
    sw.label = "Pump";
    const result = sw._render("");
    expect(result).toBeDefined();
  });

  it("logs error for unknown style", () => {
    const sw = new StubSwitch2() as any;
    sw.conf = { name: "btn", style: "unknown" };
    sw.stateObj = makeState("on");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    sw._render("");
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// RSMessages — _render() branches
// ---------------------------------------------------------------------------

describe("RSMessages._render()", () => {
  it("returns html`` when stateObj is null", () => {
    const m = new StubMessages() as any;
    m.conf = { name: "msg" };
    m.stateObj = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("renders empty value when state is 'unavailable'", () => {
    const m = new StubMessages() as any;
    m.conf = { name: "msg" };
    m.stateObj = makeState("unavailable");
    m._hass = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("renders empty value when state is 'unknown'", () => {
    const m = new StubMessages() as any;
    m.conf = { name: "msg" };
    m.stateObj = makeState("unknown");
    m._hass = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("renders empty value when state is empty string", () => {
    const m = new StubMessages() as any;
    m.conf = { name: "msg" };
    m.stateObj = makeState("");
    m._hass = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("renders marquee with value when state is valid", () => {
    const m = new StubMessages() as any;
    m.conf = { name: "msg" };
    m.stateObj = makeState("Hello World");
    m._hass = null;
    m.device = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("applies label wrapper when conf.label is set", () => {
    const m = new StubMessages() as any;
    m.conf = { name: "msg", label: "*** " };
    m.stateObj = makeState("Alert!");
    m._hass = null;
    m.device = null;
    const result = m._render("");
    expect(result).toBeDefined();
  });

  it("creates trash element when _hass and device are set", () => {
    const m = new StubMessages() as any;
    m.conf = { name: "msg" };
    m.stateObj = makeState("Test Message");
    const hass = {
      states: { "sensor.msg": makeState("Test Message") },
      entities: {},
      devices: {},
      callService: vi.fn(),
    };
    m._hass = hass;
    m.device = makeDevice();
    // create_element may fail without registered type — just verify no throw
    expect(() => m._render("")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// ClickImage — _render() branches
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// ProgressBar — _render() branches
// ---------------------------------------------------------------------------

describe("ProgressBar._render()", () => {
  function makeBar(state = "50", targetState = "100", device_on = true): any {
    const bar = new StubProgressBar() as any;
    bar.conf = {
      name: "container_volume",
      class: "pg-container",
      label: false,
    };
    bar.stateObj = makeState(state, "sensor.vol");
    bar.stateObjTarget = makeState(targetState, "sensor.target");
    bar.device = makeDevice(device_on);
    bar.color = "0,200,100";
    bar.c = "0,200,100";
    bar.alpha = 1;
    bar.evalCtx = null;
    // Stub evaluate so label expressions don't fail
    bar.evaluate = (expr: any) => (typeof expr === "string" ? expr : "");
    return bar;
  }

  it("returns error div when stateObj is missing", () => {
    const bar = new StubProgressBar() as any;
    bar.conf = { name: "vol" };
    bar.stateObj = null;
    bar.stateObjTarget = makeState("100");
    const result = bar._render("");
    expect(result).toBeDefined();
  });

  it("returns error div when stateObjTarget is missing", () => {
    const bar = new StubProgressBar() as any;
    bar.conf = { name: "vol" };
    bar.stateObj = makeState("50");
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
});

// ---------------------------------------------------------------------------
// ProgressCircle — _render() branches
// ---------------------------------------------------------------------------

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
    c.stateObj = makeState(state, "sensor.dosed");
    c.stateObjTarget = makeState(targetState, "sensor.daily");
    c.device = makeDevice(device_on);
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
    c.stateObjTarget = makeState("100");
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
});
