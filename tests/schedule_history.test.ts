/**
 * Tests for the Schedule element — the measured history of the day: what is
 * read from the recorder, how it is spread over the minutes it covers, and the
 * red trace plus band drawn where the device left its schedule.
 */

import { Schedule } from "../src/base/schedule";
import { beforeEach, describe, expect, it, vi } from "vitest";

// jsdom refuses `new Schedule()` unless the class itself is registered
if (!customElements.get("common-schedule")) {
  customElements.define("common-schedule", Schedule);
}

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

/** 00:00 -> 40%, 08:00 -> 80%, 20:00 -> 40% */
const SCHEDULE_ATTR = [
  { st: 0, ti: 40 },
  { st: 480, ti: 80 },
  { st: 1200, ti: 40 },
];

const NOW = new Date(2026, 0, 15, 10, 0, 0);
const MIDNIGHT = new Date(2026, 0, 15, 0, 0, 0).getTime();
/** Timestamp of a given hour of the frozen day */
const at = (hours: number, minutes = 0): number =>
  MIDNIGHT + (hours * 60 + minutes) * 60_000;

function makeHass(speed: string | number = 80, answer: any = {}): any {
  return {
    states: {
      "number.constant_speed": {
        entity_id: "number.constant_speed",
        state: "80",
        attributes: { schedule: SCHEDULE_ATTR, unit_of_measurement: "%" },
      },
      "sensor.speed": {
        entity_id: "sensor.speed",
        state: String(speed),
        attributes: {},
      },
    },
    callService: vi.fn(),
    callWS: vi.fn(async () => answer),
    devices: {},
    entities: [],
  };
}

function makeSchedule(conf: any = {}, speed: string | number = 80): any {
  const elt: any = new Schedule();
  elt.device = {
    id: 1,
    entities: {
      constant_speed: { entity_id: "number.constant_speed" },
      speed: { entity_id: "sensor.speed" },
    },
    parent_entities: {},
    config: { color: "51,151,232", alpha: 0.8 },
    is_on: () => true,
    masterOn: true,
  };
  elt.stateOn = true;
  elt.conf = {
    name: "constant_speed",
    schedule_attribute: "schedule",
    time_field: "st",
    value_field: "ti",
    min_value: 0,
    max_value: 100,
    current_entity: "speed",
    ...conf,
  };
  const hass = makeHass(speed, conf.__answer);
  elt.stateObj = hass.states["number.constant_speed"];
  elt._hass = hass;
  return elt;
}

/** 2D context recorder keeping the strokes and the fills with their colour */
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
    beginPath: vi.fn(() => ops.push({ op: "beginPath" })),
    moveTo: vi.fn((x: number, y: number) => ops.push({ op: "moveTo", x, y })),
    lineTo: vi.fn((x: number, y: number) => ops.push({ op: "lineTo", x, y })),
    arc: vi.fn((x: number, y: number, r: number) =>
      ops.push({ op: "arc", x, y, r }),
    ),
    stroke: vi.fn(() =>
      ops.push({
        op: "stroke",
        strokeStyle: ctx.strokeStyle,
        lw: ctx.lineWidth,
      }),
    ),
    fill: vi.fn(() => ops.push({ op: "fill", fillStyle: ctx.fillStyle })),
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

/**
 * Everything the history drew.
 *
 * The "now" marker shares its colour, so the width of the trace (2) and the
 * opacity of its band tell them apart: the cursor is thinner (1.5), the gap
 * segment thicker (3), and both are filled opaque.
 */
function historyOps(ctx: any, rgb = "255,40,40", alpha = "0.2"): any[] {
  return ctx.ops.filter(
    (o: any) =>
      (o.op === "stroke" &&
        o.lw === 2 &&
        o.strokeStyle === `rgba(${rgb},0.9)`) ||
      (o.op === "fill" && o.fillStyle === `rgba(${rgb},${alpha})`),
  );
}

//----------------------------------------------------------------------------//
//   Tests
//----------------------------------------------------------------------------//

describe("Schedule — what has a history", () => {
  it("follows the entity carrying the measured value", () => {
    const elt = makeSchedule();
    expect(elt._historyEntityId()).toBe("sensor.speed");
    expect(elt._historyWanted()).toBe(true);
  });

  it("has nothing to read when the value lives in an attribute", () => {
    const elt = makeSchedule({ current_attribute: "raw_speed" });
    expect(elt._historyEntityId()).toBeNull();
    expect(elt._historyWanted()).toBe(false);
  });

  it("has nothing to read without a measured entity", () => {
    const elt = makeSchedule({ current_entity: undefined });
    expect(elt._historyWanted()).toBe(false);
  });

  it("can be turned off on its own, or with the whole deviation", () => {
    expect(makeSchedule({ show_history: false })._historyWanted()).toBe(false);
    expect(makeSchedule({ show_deviation: false })._historyWanted()).toBe(
      false,
    );
  });
});

describe("Schedule — the recorder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  it("reads the day being drawn, and nothing else", async () => {
    const elt = makeSchedule();
    elt._hass.callWS = vi.fn(async () => ({
      "sensor.speed": [{ s: "40", lu: at(0) / 1000 }],
    }));
    await elt._fetchHistory();

    const message = elt._hass.callWS.mock.calls[0][0];
    expect(message.type).toBe("history/history_during_period");
    expect(message.entity_ids).toEqual(["sensor.speed"]);
    expect(Date.parse(message.start_time)).toBe(MIDNIGHT);
    expect(Date.parse(message.end_time)).toBe(NOW.getTime());
    expect(elt._history).toEqual([{ t: at(0), v: 40 }]);
  });

  it("keeps what was seen live after the last stored sample", async () => {
    const elt = makeSchedule();
    elt._history = [
      { t: at(1), v: 40 },
      { t: at(9, 30), v: 55 },
    ];
    elt._hass.callWS = vi.fn(async () => ({
      "sensor.speed": [{ s: "40", lu: at(1) / 1000 }],
    }));
    await elt._fetchHistory();

    expect(elt._history).toEqual([
      { t: at(1), v: 40 },
      { t: at(9, 30), v: 55 },
    ]);
  });

  it("survives a recorder that answers nothing good", async () => {
    const elt = makeSchedule();
    elt._hass.callWS = vi.fn(async () => {
      throw new Error("no recorder");
    });
    await elt._fetchHistory();
    expect(elt._history).toEqual([]);
    expect(elt._historyPending).toBe(false);
  });

  it("reads again only once the refresh delay has passed", () => {
    const elt = makeSchedule();
    elt._fetchHistory = vi.fn(async () => {});

    elt._refreshHistory();
    expect(elt._fetchHistory).toHaveBeenCalledTimes(1);

    elt._historyAt = Date.now();
    elt._refreshHistory();
    expect(elt._fetchHistory).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date(NOW.getTime() + 11 * 60_000));
    elt._refreshHistory();
    expect(elt._fetchHistory).toHaveBeenCalledTimes(2);
  });

  it("reads again when the day changed under a fresh read", () => {
    const elt = makeSchedule();
    elt._fetchHistory = vi.fn(async () => {});
    // Read a minute ago, but yesterday: the window itself moved
    elt._historyAt = MIDNIGHT - 60_000;
    elt._refreshHistory();
    expect(elt._fetchHistory).toHaveBeenCalledTimes(1);
  });

  it("extends the curve with every change seen live", () => {
    const elt = makeSchedule({}, 80);
    elt.requestUpdate = vi.fn();
    elt.hass = makeHass(70);
    expect(elt._history).toEqual([{ t: NOW.getTime(), v: 70 }]);
  });
});

describe("Schedule — minute by minute", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  it("holds a value until the next sample", () => {
    const elt = makeSchedule();
    elt._history = [
      { t: at(0), v: 40 },
      { t: at(9), v: 50 },
    ];
    const minutes = elt._historyPerMinute(600);

    expect(minutes).toHaveLength(601);
    expect(minutes[0]).toBe(40);
    expect(minutes[539]).toBe(40);
    expect(minutes[540]).toBe(50);
    expect(minutes[600]).toBe(50);
  });

  it("starts from the value in force when the day started", () => {
    const elt = makeSchedule();
    elt._history = [{ t: MIDNIGHT - 3600_000, v: 65 }];
    expect(elt._historyPerMinute(600)[0]).toBe(65);
  });

  it("knows nothing before the first sample", () => {
    const elt = makeSchedule();
    elt._history = [{ t: at(9), v: 50 }];
    const minutes = elt._historyPerMinute(600);
    expect(minutes[0]).toBeNull();
    expect(minutes[540]).toBe(50);
  });

  it("says nothing without any history", () => {
    expect(makeSchedule()._historyPerMinute(600)).toBeNull();
  });
});

describe("Schedule — the trace of the day", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  it("draws nothing while the device followed its schedule", () => {
    const elt = makeSchedule();
    elt._history = [
      { t: at(0), v: 40 },
      { t: at(8), v: 80 },
    ];
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    expect(historyOps(ctx).filter((o: any) => o.op === "fill")).toHaveLength(0);
  });

  it("traces the measured value, and bands the period, where it deviated", () => {
    const elt = makeSchedule({}, 50);
    // Auto regulation from 09:00: 50% while the schedule asks for 80%
    elt._history = [
      { t: at(0), v: 40 },
      { t: at(8), v: 80 },
      { t: at(9), v: 50 },
    ];
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    const drawn = historyOps(ctx);
    expect(drawn.filter((o: any) => o.op === "stroke")).toHaveLength(1);
    const fills = drawn.filter((o: any) => o.op === "fill");
    expect(fills).toHaveLength(1);
    expect(fills[0].fillStyle).toBe("rgba(255,40,40,0.2)");
  });

  it("draws one band per deviation, not one for the day", () => {
    const elt = makeSchedule({}, 80);
    // Deviates between 09:00 and 09:30, then follows again
    elt._history = [
      { t: at(8), v: 80 },
      { t: at(9), v: 50 },
      { t: at(9, 30), v: 80 },
      { t: at(9, 40), v: 50 },
      { t: at(9, 50), v: 80 },
    ];
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    expect(historyOps(ctx).filter((o: any) => o.op === "fill")).toHaveLength(2);
  });

  it("keeps the trace inside the chart area", () => {
    const elt = makeSchedule({}, 150);
    elt._history = [{ t: at(9), v: 150 }];
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    // Top padding is 16: nothing is drawn above it
    for (const op of ctx.ops.filter((o: any) => o.op === "lineTo")) {
      expect(op.y).toBeGreaterThanOrEqual(16);
    }
  });

  it("takes its colours from the configuration", () => {
    const elt = makeSchedule({
      history_color: "0,200,0",
      history_fill_alpha: 0.5,
    });
    elt._history = [{ t: at(9), v: 50 }];
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    expect(
      ctx.ops.some(
        (o: any) => o.op === "fill" && o.fillStyle === "rgba(0,200,0,0.5)",
      ),
    ).toBe(true);
  });

  it("stays out of the editor chart and of a pump switched off", () => {
    const history = [{ t: at(9), v: 50 }];

    const editor = makeSchedule();
    editor._history = history;
    const editorCtx = makeCtxSpy();
    editor._drawOnCanvas(makeCanvas(editorCtx), editor._parseSchedule(), false);
    expect(historyOps(editorCtx)).toHaveLength(0);

    const off = makeSchedule();
    off._history = history;
    off.stateOn = false;
    const offCtx = makeCtxSpy();
    off._drawOnCanvas(makeCanvas(offCtx), off._parseSchedule(), true);
    expect(historyOps(offCtx).filter((o: any) => o.op === "fill")).toHaveLength(
      0,
    );
  });
});

describe("Schedule — the edges of the history", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  it("keeps the live samples bounded", () => {
    const elt = makeSchedule({}, 80);
    elt.requestUpdate = vi.fn();
    elt._history = Array.from({ length: 2000 }, (_, i) => ({
      t: MIDNIGHT + i,
      v: 80,
    }));
    elt.hass = makeHass(70);

    expect(elt._history).toHaveLength(2000);
    expect(elt._history[0].t).toBe(MIDNIGHT + 1);
    expect(elt._history[1999]).toEqual({ t: NOW.getTime(), v: 70 });
  });

  it("follows nothing live when the history is turned off", () => {
    const elt = makeSchedule({ show_history: false }, 80);
    elt.requestUpdate = vi.fn();
    elt.hass = makeHass(70);
    expect(elt._history).toEqual([]);
  });

  it("follows nothing live when the value became unreadable", () => {
    const elt = makeSchedule({}, 80);
    elt.requestUpdate = vi.fn();
    elt.hass = makeHass(80);
    expect(elt._history).toHaveLength(1);
    elt.hass = makeHass("unavailable");
    expect(elt._history).toHaveLength(1);
  });

  it("falls back to the entity of the parent device", () => {
    const elt = makeSchedule();
    elt.device.entities = {};
    elt.device.parent_entities = { speed: { entity_id: "sensor.pump_speed" } };
    expect(elt._historyEntityId()).toBe("sensor.pump_speed");
  });

  it("has nothing to read from an entity without an id", () => {
    const elt = makeSchedule();
    elt.device.entities = { speed: {} };
    expect(elt._historyEntityId()).toBeNull();
  });

  it("asks nothing of a hass that cannot be asked", async () => {
    const elt = makeSchedule();
    elt._hass = { states: {} };
    await elt._fetchHistory();
    expect(elt._historyAt).toBe(0);
    expect(elt._historyPending).toBe(false);
  });

  it("keeps the live samples when the recorder answers nothing", async () => {
    const elt = makeSchedule();
    elt._history = [{ t: at(9), v: 50 }];
    elt._hass.callWS = vi.fn(async () => ({}));
    await elt._fetchHistory();
    expect(elt._history).toEqual([{ t: at(9), v: 50 }]);
  });

  it("says nothing when the whole history is still ahead", () => {
    const elt = makeSchedule();
    // Clock moved back: every sample is dated after the minute being drawn
    elt._history = [{ t: at(23), v: 50 }];
    expect(elt._historyPerMinute(600)).toBeNull();
  });

  it("traces the steps of a deviation that moved", () => {
    const elt = makeSchedule({}, 30);
    // The pump kept lowering itself: 50% then 30%, both under the 80% asked
    elt._history = [
      { t: at(8), v: 80 },
      { t: at(9), v: 50 },
      { t: at(9, 20), v: 30 },
    ];
    const ctx = makeCtxSpy();
    elt._drawOnCanvas(makeCanvas(ctx), elt._parseSchedule(), true);

    const drawn = historyOps(ctx);
    expect(drawn.filter((o: any) => o.op === "stroke")).toHaveLength(1);
    expect(drawn.filter((o: any) => o.op === "fill")).toHaveLength(1);
    // One single run, with the step from 50% to 30% drawn inside it
    const ys = ctx.ops
      .filter((o: any) => o.op === "lineTo")
      .map((o: any) => Math.round(o.y));
    expect(new Set(ys).size).toBeGreaterThan(2);
  });
});
