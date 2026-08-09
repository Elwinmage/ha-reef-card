/**
 * Tests for the Schedule element — focused on the live deviation overlay
 * (measured value vs. scheduled value) added on top of the day curve.
 */

import { Schedule } from "../src/base/schedule";
import { beforeEach, describe, expect, it, vi } from "vitest";

// jsdom refuses `new Schedule()` unless the class is registered
if (!customElements.get("common-schedule")) {
  customElements.define("common-schedule", Schedule);
}

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

function makeState(
  state: string,
  entity_id: string,
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: attrs };
}

const SCHEDULE_ATTR = [
  { st: 0, ti: 40 },
  { st: 480, ti: 80 },
  { st: 1200, ti: 40 },
];

function makeHass(speed: string | number = 80, extra: any = {}): any {
  return {
    states: {
      "number.constant_speed": makeState("80", "number.constant_speed", {
        schedule: SCHEDULE_ATTR,
        unit_of_measurement: "%",
      }),
      "sensor.speed": makeState(String(speed), "sensor.speed", {
        raw_speed: speed,
      }),
      ...extra,
    },
    callService: vi.fn(),
    devices: {},
    entities: [],
  };
}

function makeDevice(isOn = true): any {
  return {
    id: 1,
    entities: {
      constant_speed: { entity_id: "number.constant_speed" },
      speed: { entity_id: "sensor.speed" },
    },
    parent_entities: {},
    config: { color: "51,151,232", alpha: 0.8 },
    is_on: () => isOn,
    masterOn: true,
  };
}

/** Build a Schedule instance wired to a device/hass without rendering it */
function makeSchedule(conf: any = {}, speed: string | number = 80): any {
  const elt: any = new Schedule();
  elt.device = makeDevice();
  elt.stateOn = true;
  elt.conf = {
    name: "constant_speed",
    schedule_attribute: "schedule",
    time_field: "st",
    value_field: "ti",
    min_value: 0,
    max_value: 100,
    ...conf,
  };
  const hass = makeHass(speed);
  elt.stateObj = hass.states["number.constant_speed"];
  elt._hass = hass;
  return elt;
}

/** Minimal 2D context recorder: keeps the ops we assert on */
function makeCtxSpy() {
  const ops: any[] = [];
  const ctx: any = {
    ops,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    lineCap: "",
    lineJoin: "",
    font: "",
    textAlign: "",
    textBaseline: "",
    scale: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    setLineDash: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    beginPath: vi.fn(() => ops.push({ op: "beginPath" })),
    moveTo: vi.fn((x: number, y: number) => ops.push({ op: "moveTo", x, y })),
    lineTo: vi.fn((x: number, y: number) => ops.push({ op: "lineTo", x, y })),
    stroke: vi.fn(function (this: any) {
      ops.push({
        op: "stroke",
        strokeStyle: ctx.strokeStyle,
        lw: ctx.lineWidth,
      });
    }),
    arc: vi.fn((x: number, y: number, r: number) =>
      ops.push({
        op: "arc",
        x,
        y,
        r,
        fillStyle: ctx.fillStyle,
        strokeStyle: ctx.strokeStyle,
      }),
    ),
    measureText: vi.fn(() => ({ width: 50 })),
    fillText: vi.fn((text: string) => ops.push({ op: "fillText", text })),
  };
  return ctx;
}

function makeCanvas(ctx: any): any {
  return {
    width: 0,
    height: 0,
    getBoundingClientRect: () => ({ width: 400, height: 200 }),
    getContext: () => ctx,
  };
}

/** Freeze time at 10:00 — inside the 08:00 segment (scheduled value = 80) */
function freezeAt10h() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 0, 15, 10, 0, 0));
}

//----------------------------------------------------------------------------//
//   Tests
//----------------------------------------------------------------------------//

describe("Schedule — current value resolution", () => {
  it("returns null when no current source is configured", () => {
    const elt = makeSchedule();
    expect(elt._getCurrentValue()).toBeNull();
  });

  it("reads the state of the configured entity", () => {
    const elt = makeSchedule({ current_entity: "speed" }, 55);
    expect(elt._getCurrentValue()).toBe(55);
  });

  it("reads an attribute of the configured entity", () => {
    const elt = makeSchedule(
      { current_entity: "speed", current_attribute: "raw_speed" },
      42,
    );
    expect(elt._getCurrentValue()).toBe(42);
  });

  it("falls back to its own stateObj attribute when no entity is given", () => {
    const elt = makeSchedule({ current_attribute: "unit_of_measurement" });
    // Non-numeric attribute -> null
    expect(elt._getCurrentValue()).toBeNull();
    elt.stateObj.attributes.live = 33;
    elt.conf.current_attribute = "live";
    expect(elt._getCurrentValue()).toBe(33);
  });

  it("ignores unavailable / unknown / empty states", () => {
    for (const bad of ["unavailable", "unknown", "none", ""]) {
      const elt = makeSchedule({ current_entity: "speed" }, bad);
      expect(elt._getCurrentValue()).toBeNull();
    }
  });

  it("returns null when the entity cannot be resolved", () => {
    const elt = makeSchedule({ current_entity: "does_not_exist" });
    expect(elt._getCurrentValue()).toBeNull();
  });

  it("resolves through parent_entities as well", () => {
    const elt = makeSchedule({ current_entity: "parent_speed" });
    elt.device.parent_entities = {
      parent_speed: { entity_id: "sensor.speed" },
    };
    expect(elt._getCurrentValue()).toBe(80);
  });
});

describe("Schedule — deviation overlay", () => {
  beforeEach(() => {
    freezeAt10h();
  });

  it("draws a single marker on the curve when there is no deviation", () => {
    const elt = makeSchedule({ current_entity: "speed" }, 80);
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    const arcs = ctx.ops.filter((o: any) => o.op === "arc");
    expect(arcs).toHaveLength(1);
  });

  it("draws two markers and a gap segment when the pump deviates", () => {
    const elt = makeSchedule({ current_entity: "speed" }, 30);
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    const arcs = ctx.ops.filter((o: any) => o.op === "arc");
    // One hollow marker on the schedule, one filled marker on the real value
    expect(arcs).toHaveLength(2);
    // The two markers sit on the same x but at different heights
    expect(arcs[0].x).toBeCloseTo(arcs[1].x);
    expect(arcs[0].y).not.toBeCloseTo(arcs[1].y);
    // A thick stroke (lineWidth 3) materialises the gap
    expect(ctx.ops.some((o: any) => o.op === "stroke" && o.lw === 3)).toBe(
      true,
    );
  });

  it("labels the measured value and the signed delta", () => {
    const elt = makeSchedule({ current_entity: "speed", unit: "%" }, 30);
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    const label = ctx.ops.filter((o: any) => o.op === "fillText").pop();
    expect(label.text).toContain("10:00");
    expect(label.text).toContain("30%");
    expect(label.text).toContain("(-50)");
  });

  it("uses a + sign when the pump runs faster than scheduled", () => {
    const elt = makeSchedule({ current_entity: "speed", unit: "%" }, 95);
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    const label = ctx.ops.filter((o: any) => o.op === "fillText").pop();
    expect(label.text).toContain("(+15)");
  });

  it("stays silent for gaps below the threshold", () => {
    const elt = makeSchedule(
      { current_entity: "speed", deviation_threshold: 5 },
      77,
    );
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    expect(ctx.ops.filter((o: any) => o.op === "arc")).toHaveLength(1);
  });

  it("can be disabled with show_deviation:false", () => {
    const elt = makeSchedule(
      { current_entity: "speed", show_deviation: false },
      10,
    );
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    expect(ctx.ops.filter((o: any) => o.op === "arc")).toHaveLength(1);
  });

  it("does not draw a deviation while the pump is off", () => {
    const elt = makeSchedule({ current_entity: "speed" }, 0);
    elt.stateOn = false;
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    expect(ctx.ops.filter((o: any) => o.op === "arc")).toHaveLength(1);
  });

  it("clamps an out-of-range measured value inside the chart area", () => {
    const elt = makeSchedule({ current_entity: "speed", unit: "%" }, 150);
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    const arcs = ctx.ops.filter((o: any) => o.op === "arc");
    // Chart top padding is 16 -> nothing may be drawn above it
    for (const a of arcs) expect(a.y).toBeGreaterThanOrEqual(16);
    // The label still reports the raw value
    const label = ctx.ops.filter((o: any) => o.op === "fillText").pop();
    expect(label.text).toContain("150%");
  });

  it("ignores the deviation on the editor chart (showNow = false)", () => {
    const elt = makeSchedule({ current_entity: "speed" }, 30);
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), false);

    expect(ctx.ops.filter((o: any) => o.op === "arc")).toHaveLength(0);
  });
});

describe("Schedule — hass updates", () => {
  it("re-renders when the measured value changes", () => {
    const elt = makeSchedule({ current_entity: "speed" }, 80);
    elt.requestUpdate = vi.fn();

    elt.hass = makeHass(80);
    const initial = elt.requestUpdate.mock.calls.length;

    elt.hass = makeHass(45);
    expect(elt.requestUpdate.mock.calls.length).toBeGreaterThan(initial);
  });

  it("does not re-render when nothing changed", () => {
    const elt = makeSchedule({ current_entity: "speed" }, 80);
    elt.hass = makeHass(80);
    elt.requestUpdate = vi.fn();

    elt.hass = makeHass(80);
    expect(elt.requestUpdate).not.toHaveBeenCalled();
  });

  it("re-renders when only the schedule attribute changed", () => {
    const elt = makeSchedule({ current_entity: "speed" }, 80);
    elt.hass = makeHass(80);
    elt.requestUpdate = vi.fn();

    const hass = makeHass(80);
    hass.states["number.constant_speed"].attributes.schedule = [
      { st: 0, ti: 10 },
    ];
    elt.hass = hass;

    expect(elt.requestUpdate).toHaveBeenCalled();
    expect(elt.stateObj.attributes.schedule).toHaveLength(1);
  });
});
