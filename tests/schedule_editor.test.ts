/**
 * Tests for the schedule element:
 *   - parsing and interpolating the schedule attribute
 *   - the editor overlay: point add/remove/edit, sorting, current row
 *   - the preview flow (PUT /preview then press the button entity)
 *   - saving (PUT /pump/settings) and its guard rails
 *   - canvas drawing, exercised against a recording 2D context
 *
 * Lit is kept out of the way: the elements are never connected, so
 * requestUpdate and updateComplete are stubbed per instance.
 */

import { Schedule } from "../src/base/schedule";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

if (!customElements.get("cov-schedule")) {
  customElements.define("cov-schedule", class extends Schedule {});
}

const CANVAS_W = 400;
const CANVAS_H = 200;

/**
 * Recording 2D context.
 *
 * The drawing code reaches for a lot of canvas methods; rather than listing
 * them all, unknown methods are created on demand by a Proxy so a new call
 * never breaks the test for the wrong reason. Style properties stay plain
 * assignable fields.
 */
function makeCtx(): any {
  const calls: any[] = [];
  const target: any = {
    calls,
    canvas: { width: CANVAS_W, height: CANVAS_H },
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    measureText: vi.fn(() => ({ width: 10 })),
  };
  return new Proxy(target, {
    get(obj, prop: string) {
      if (prop in obj) return obj[prop];
      if (typeof prop !== "string" || prop.startsWith("_")) return undefined;
      // Style properties are read back before being restored
      if (
        /^(fillStyle|strokeStyle|font|lineWidth|globalAlpha|textAlign|textBaseline|lineCap|lineJoin|shadowBlur|shadowColor)$/.test(
          prop,
        )
      ) {
        return undefined;
      }
      obj[prop] = vi.fn((...args: any[]) => {
        calls.push([prop, ...args]);
      });
      return obj[prop];
    },
  });
}

/** Canvas stub with a fixed size and a recording context */
function makeCanvas(width = CANVAS_W, height = CANVAS_H): any {
  const ctx = makeCtx();
  return {
    ctx,
    width,
    height,
    style: {},
    getContext: vi.fn(() => ctx),
    getBoundingClientRect: () =>
      ({ width, height, left: 0, top: 0 }) as DOMRect,
  };
}

const SCHEDULE = [
  { st: 0, ti: 40 },
  { st: 480, ti: 80 },
  { st: 1200, ti: 60 },
];

/**
 * Build a schedule element bound to a pump-like device.
 * @param conf: element configuration from the mapping
 * @param schedule: raw schedule attribute
 */
function makeSchedule(conf: any = {}, schedule: any = SCHEDULE): any {
  const el: any = new (customElements.get("cov-schedule") as any)();
  el.conf = { name: "schedule", ...conf };
  el.stateObj = {
    entity_id: "sensor.pump_1_schedule",
    state: "on",
    attributes: { schedule },
  };
  el.stateOn = true;
  el.device = {
    id: 1,
    entities: {
      preview_start: { entity_id: "button.preview_start" },
      preview_stop: { entity_id: "button.preview_stop" },
    },
    parent_device: { elements: [{ primary_config_entry: "entry_1" }] },
  };
  el._hass = { states: {}, entities: {}, callService: vi.fn() };
  vi.spyOn(el, "requestUpdate").mockImplementation(() => {});
  Object.defineProperty(el, "updateComplete", {
    get: () => Promise.resolve(true),
    configurable: true,
  });
  return el;
}

/**
 * Flatten a lit template into a single string: static parts and interpolated
 * values, nested templates included.
 * @param tpl: the template (or value) to serialize
 */
function serialize(tpl: any): string {
  if (tpl === null || tpl === undefined) return "";
  if (Array.isArray(tpl)) return tpl.map(serialize).join("");
  if (typeof tpl === "function") return "";
  if (tpl?.strings?.raw) {
    const raw: string[] = Array.from(tpl.strings.raw);
    const values: any[] = tpl.values ?? [];
    return raw.map((s, i) => s + serialize(values[i])).join("");
  }
  if (typeof tpl === "object") return "";
  return String(tpl);
}

/** Input event carrying a value */
function inputEvent(value: string): any {
  return { target: { value } };
}

beforeEach(() => {
  (globalThis as any).ResizeObserver = class {
    static last: any = null;
    observe = vi.fn();
    disconnect = vi.fn();
    constructor(public cb: any) {
      (globalThis as any).ResizeObserver.last = this;
    }
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

//----------------------------------------------------------------------------//
//   Parsing
//----------------------------------------------------------------------------//

describe("Schedule parsing", () => {
  it("reads the default time and value fields", () => {
    const points = makeSchedule()._parseSchedule();
    expect(points).toEqual([
      { minutes: 0, value: 40 },
      { minutes: 480, value: 80 },
      { minutes: 1200, value: 60 },
    ]);
  });

  it("sorts the points by time", () => {
    const points = makeSchedule({}, [
      { st: 600, ti: 10 },
      { st: 60, ti: 20 },
    ])._parseSchedule();
    expect(points.map((p: any) => p.minutes)).toEqual([60, 600]);
  });

  it("honours custom field names and the pulse field", () => {
    const points = makeSchedule(
      { time_field: "start", value_field: "intensity", pulse_field: "pulse" },
      [{ start: 120, intensity: 55, pulse: 30 }],
    )._parseSchedule();
    expect(points).toEqual([{ minutes: 120, value: 55, pulse: 30 }]);
  });

  it("skips entries that are not numbers", () => {
    const points = makeSchedule({}, [
      { st: "bad", ti: 10 },
      { st: 60, ti: "bad" },
      { st: 60, ti: 20 },
    ])._parseSchedule();
    expect(points).toHaveLength(1);
  });

  it("returns nothing without a usable attribute", () => {
    expect(makeSchedule({}, null)._parseSchedule()).toEqual([]);
    const el = makeSchedule();
    el.stateObj = null;
    expect(el._parseSchedule()).toEqual([]);
  });
});

//----------------------------------------------------------------------------//
//   Interpolation
//----------------------------------------------------------------------------//

describe("Schedule interpolation", () => {
  const points = [
    { minutes: 0, value: 40 },
    { minutes: 600, value: 80 },
  ];

  it("holds the previous value in step mode", () => {
    expect(makeSchedule()._interpolateValue(points, 300, false)).toBe(40);
  });

  it("interpolates linearly when asked", () => {
    expect(makeSchedule()._interpolateValue(points, 300, true)).toBe(60);
  });

  it("clamps before the first and after the last point", () => {
    const el = makeSchedule();
    expect(el._interpolateValue(points, -10, true)).toBe(40);
    expect(el._interpolateValue(points, 2000, true)).toBe(80);
  });

  it("survives two points sharing the same time", () => {
    const el = makeSchedule();
    const dup = [
      { minutes: 0, value: 40 },
      { minutes: 300, value: 50 },
      { minutes: 300, value: 70 },
      { minutes: 600, value: 80 },
    ];
    expect(el._interpolateValue(dup, 300, true)).toBe(50);
  });

  it("returns zero without any point", () => {
    expect(makeSchedule()._interpolateValue([], 300, true)).toBe(0);
  });
});

//----------------------------------------------------------------------------//
//   Editor lifecycle
//----------------------------------------------------------------------------//

describe("Schedule editor", () => {
  it("loads a copy of the schedule, not the schedule itself", () => {
    const el = makeSchedule();
    el.openEditor();
    expect(el._editing).toBe(true);
    expect(el._editPoints).toHaveLength(3);
    el._editPoints[0].value = 99;
    expect(el._parseSchedule()[0].value).toBe(40);
  });

  it("seeds one point when the schedule is empty", () => {
    const el = makeSchedule({ min_value: 25 }, []);
    el.openEditor();
    expect(el._editPoints).toEqual([{ minutes: 0, value: 25 }]);
  });

  it("seeds the pulse field when the pump supports it", () => {
    const el = makeSchedule({ pulse_field: "pulse", min_pulse: 5 }, []);
    el.openEditor();
    expect(el._editPoints[0].pulse).toBe(5);
  });

  it("stops the click from reaching the card behind it", () => {
    const el = makeSchedule();
    const stopPropagation = vi.fn();
    el._openEditor({ stopPropagation });
    expect(stopPropagation).toHaveBeenCalled();
    expect(el._editing).toBe(true);
  });

  it("drops its state on close", () => {
    const el = makeSchedule();
    el.openEditor();
    el._closeEditor();
    expect(el._editing).toBe(false);
    expect(el._editPoints).toEqual([]);
    expect(el._editorCanvas).toBeNull();
  });

  it("stops a running preview on close", () => {
    const el = makeSchedule();
    el.openEditor();
    el._previewRunning = true;
    el._closeEditor();
    expect(el._hass.callService).toHaveBeenCalledWith("button", "press", {
      entity_id: "button.preview_stop",
    });
  });

  it("closes only when the click landed on the backdrop", () => {
    const el = makeSchedule();
    el.openEditor();
    el._onOverlayClick({ target: { classList: { contains: () => false } } });
    expect(el._editing).toBe(true);
    el._onOverlayClick({ target: { classList: { contains: () => true } } });
    expect(el._editing).toBe(false);
  });

  it("highlights the row covering the current time", () => {
    const el = makeSchedule();
    el.openEditor();
    expect(el._getCurrentRowIndex(0)).toBe(0);
    expect(el._getCurrentRowIndex(500)).toBe(1);
    expect(el._getCurrentRowIndex(1439)).toBe(2);
  });

  it("has no current row without points", () => {
    const el = makeSchedule();
    expect(el._getCurrentRowIndex(500)).toBe(-1);
  });

  it("renders the overlay with one row per point", () => {
    const el = makeSchedule({ pulse_field: "pulse" });
    el.openEditor();
    const out = serialize(el._renderEditor());
    expect(out).toContain("editor-overlay");
    expect(out).toContain("cols-pulse");
  });

  it("renders the base grid when the pump has no pulse", () => {
    const el = makeSchedule();
    el.openEditor();
    expect(serialize(el._renderEditor())).toContain("cols-base");
  });
});

//----------------------------------------------------------------------------//
//   Editing points
//----------------------------------------------------------------------------//

describe("Schedule point edition", () => {
  it("converts a time input into minutes and re-sorts", () => {
    const el = makeSchedule();
    el.openEditor();
    el._onTimeChange(0, inputEvent("22:30"));
    expect(el._editPoints.map((p: any) => p.minutes)).toEqual([
      480, 1200, 1350,
    ]);
  });

  it("ignores an unparsable time", () => {
    const el = makeSchedule();
    el.openEditor();
    el._onTimeChange(0, inputEvent("--:--"));
    expect(el._editPoints[0].minutes).toBe(0);
  });

  it("clamps the value to the configured range", () => {
    const el = makeSchedule({ min_value: 20, max_value: 90 });
    el.openEditor();
    el._onValueChange(0, inputEvent("120"));
    expect(el._editPoints[0].value).toBe(90);
    el._onValueChange(0, inputEvent("0"));
    expect(el._editPoints[0].value).toBe(20);
  });

  it("ignores a non numeric value", () => {
    const el = makeSchedule();
    el.openEditor();
    el._onValueChange(0, inputEvent("abc"));
    expect(el._editPoints[0].value).toBe(40);
  });

  it("clamps the pulse to the configured range", () => {
    const el = makeSchedule({
      pulse_field: "pulse",
      min_pulse: 5,
      max_pulse: 9,
    });
    el.openEditor();
    el._onPulseChange(0, inputEvent("100"));
    expect(el._editPoints[0].pulse).toBe(9);
    el._onPulseChange(0, inputEvent("1"));
    expect(el._editPoints[0].pulse).toBe(5);
  });

  it("ignores a non numeric pulse", () => {
    const el = makeSchedule({ pulse_field: "pulse" });
    el.openEditor();
    el._onPulseChange(0, inputEvent("abc"));
    expect(el._editPoints[0].pulse).toBeUndefined();
  });

  it("adds a point one hour after the last one", () => {
    const el = makeSchedule();
    el.openEditor();
    el._addPoint();
    expect(el._editPoints.map((p: any) => p.minutes)).toEqual([
      0, 480, 1200, 1260,
    ]);
  });

  it("never adds a point past the end of the day", () => {
    const el = makeSchedule({}, [{ st: 1430, ti: 50 }]);
    el.openEditor();
    el._addPoint();
    expect(el._editPoints[1].minutes).toBe(1439);
  });

  it("refuses to go past max_points", () => {
    const el = makeSchedule({ max_points: 3 });
    el.openEditor();
    el._addPoint();
    expect(el._editPoints).toHaveLength(3);
  });

  it("removes a point", () => {
    const el = makeSchedule();
    el.openEditor();
    el._removePoint(1);
    expect(el._editPoints.map((p: any) => p.minutes)).toEqual([0, 1200]);
  });

  it("keeps at least one point", () => {
    const el = makeSchedule({}, [{ st: 0, ti: 50 }]);
    el.openEditor();
    el._removePoint(0);
    expect(el._editPoints).toHaveLength(1);
  });
});

//----------------------------------------------------------------------------//
//   Preview
//----------------------------------------------------------------------------//

describe("Schedule preview", () => {
  /** The redsea.request payloads sent during the test */
  function requests(el: any): any[] {
    return el._hass.callService.mock.calls
      .filter((c: any[]) => c[0] === "redsea")
      .map((c: any[]) => c[2]);
  }

  it("sends the row values then presses the start button", () => {
    const el = makeSchedule({ pulse_field: "pulse" }, [
      { st: 0, ti: 40, pulse: 20 },
    ]);
    el.openEditor();
    el._startPreview(0);
    expect(el._previewRunning).toBe(true);
    expect(requests(el)[0]).toMatchObject({
      device_id: "entry_1",
      access_path: "/preview",
      method: "put",
      data: { pump_1: { ti: 40, pulse: 20 } },
    });
    expect(el._hass.callService).toHaveBeenCalledWith("button", "press", {
      entity_id: "button.preview_start",
    });
  });

  it("ignores a row that does not exist", () => {
    const el = makeSchedule();
    el.openEditor();
    el._startPreview(99);
    expect(el._previewRunning).toBe(false);
  });

  it("presses the stop button when stopping", () => {
    const el = makeSchedule();
    el.openEditor();
    el._startPreview(0);
    el._stopPreview();
    expect(el._previewRunning).toBe(false);
    expect(el._previewRowIdx).toBe(-1);
    expect(el._hass.callService).toHaveBeenCalledWith("button", "press", {
      entity_id: "button.preview_stop",
    });
  });

  it("starts from the bar without binding a row", () => {
    const el = makeSchedule();
    el.openEditor();
    el._previewValue = 55;
    el._startPreviewFromBar();
    expect(el._previewRowIdx).toBe(-1);
    expect(requests(el)[0].data.pump_1.ti).toBe(55);
  });

  it("toggles the same row off and another row on", () => {
    const el = makeSchedule();
    el.openEditor();
    el._togglePreviewRow(0);
    expect(el._previewRunning).toBe(true);
    el._togglePreviewRow(0);
    expect(el._previewRunning).toBe(false);
    el._togglePreviewRow(1);
    expect(el._previewRowIdx).toBe(1);
  });

  it("pushes a value edited in the bar only while running", () => {
    const el = makeSchedule({ min_value: 0, max_value: 100 });
    el.openEditor();
    el._onPreviewValueChange(inputEvent("70"));
    expect(el._previewValue).toBe(70);
    expect(requests(el)).toHaveLength(0);
    el._previewRunning = true;
    el._onPreviewValueChange(inputEvent("80"));
    expect(requests(el)).toHaveLength(1);
  });

  it("clamps and ignores bad preview values", () => {
    const el = makeSchedule({ min_value: 10, max_value: 50 });
    el.openEditor();
    el._onPreviewValueChange(inputEvent("999"));
    expect(el._previewValue).toBe(50);
    el._onPreviewValueChange(inputEvent("abc"));
    expect(el._previewValue).toBe(50);
  });

  it("clamps and ignores bad preview pulses", () => {
    const el = makeSchedule({ min_pulse: 5, max_pulse: 60 });
    el.openEditor();
    el._onPreviewPulseChange(inputEvent("999"));
    expect(el._previewPulse).toBe(60);
    el._onPreviewPulseChange(inputEvent("abc"));
    expect(el._previewPulse).toBe(60);
    el._previewRunning = true;
    el._onPreviewPulseChange(inputEvent("30"));
    expect(requests(el)).toHaveLength(1);
  });

  it("does nothing without hass", () => {
    const el = makeSchedule();
    const callService = el._hass.callService;
    el._hass = null;
    el._sendPreviewValues();
    el._pressButton("preview_start");
    expect(callService).not.toHaveBeenCalled();
  });

  it("reports a device it cannot address", () => {
    const el = makeSchedule();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    el.device.parent_device = null;
    el._sendPreviewValues();
    expect(error).toHaveBeenCalled();
    expect(el._hass.callService).not.toHaveBeenCalled();
  });

  it("reports a missing button entity", () => {
    const el = makeSchedule();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    delete el.device.entities.preview_start;
    el._pressButton("preview_start");
    expect(error).toHaveBeenCalled();
    expect(el._hass.callService).not.toHaveBeenCalled();
  });
});

//----------------------------------------------------------------------------//
//   Save
//----------------------------------------------------------------------------//

describe("Schedule save", () => {
  it("puts the edited points on /pump/settings and closes", () => {
    const el = makeSchedule();
    el.openEditor();
    el._editPoints[0].value = 45;
    el._saveSchedule();
    expect(el._hass.callService).toHaveBeenCalledWith("redsea", "request", {
      device_id: "entry_1",
      access_path: "/pump/settings",
      method: "put",
      data: {
        pump_1: {
          schedule: [
            { st: 0, ti: 45 },
            { st: 480, ti: 80 },
            { st: 1200, ti: 60 },
          ],
        },
      },
    });
    expect(el._editing).toBe(false);
  });

  it("writes the pulse field when the pump has one", () => {
    const el = makeSchedule({ pulse_field: "pulse" }, [{ st: 0, ti: 40 }]);
    el.openEditor();
    el._saveSchedule();
    const data = el._hass.callService.mock.calls[0][2];
    expect(data.data.pump_1.schedule[0]).toEqual({ st: 0, ti: 40, pulse: 0 });
  });

  it("uses the configured field names", () => {
    const el = makeSchedule({ time_field: "start", value_field: "intensity" }, [
      { start: 60, intensity: 30 },
    ]);
    el.openEditor();
    el._saveSchedule();
    const data = el._hass.callService.mock.calls[0][2];
    expect(data.data.pump_1.schedule[0]).toEqual({ start: 60, intensity: 30 });
  });

  it("sends nothing without a state object or hass", () => {
    const el = makeSchedule();
    el.openEditor();
    el.stateObj = null;
    el._saveSchedule();
    expect(el._hass.callService).not.toHaveBeenCalled();
  });

  it("reports a device it cannot address", () => {
    const el = makeSchedule();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    el.openEditor();
    el.device.id = null;
    el._saveSchedule();
    expect(error).toHaveBeenCalled();
    expect(el._editing).toBe(true);
  });
});

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

describe("Schedule helpers", () => {
  it("formats minutes as a padded clock time", () => {
    const el = makeSchedule();
    expect(el._minutesToTime(0)).toBe("00:00");
    expect(el._minutesToTime(75)).toBe("01:15");
    expect(el._minutesToTime(1439)).toBe("23:59");
  });

  it("rounds the grid step to a readable value", () => {
    const el = makeSchedule();
    expect(el._niceStep(100, 5)).toBe(20);
    expect(el._niceStep(10, 5)).toBe(2);
    expect(el._niceStep(1000, 4)).toBe(200);
    expect(el._niceStep(0, 5)).toBe(1);
  });
});

//----------------------------------------------------------------------------//
//   Measured value
//----------------------------------------------------------------------------//

describe("Schedule measured value", () => {
  /** Bind a measured-value entity to the element */
  function withCurrent(el: any, state: any): any {
    el.device.entities.speed = { entity_id: "sensor.speed" };
    el._hass.states["sensor.speed"] = {
      entity_id: "sensor.speed",
      state,
      attributes: { raw: state },
    };
    return el;
  }

  it("is null when the element is not configured for it", () => {
    expect(makeSchedule()._getCurrentValue()).toBeNull();
  });

  it("reads the state of the configured entity", () => {
    const el = withCurrent(makeSchedule({ current_entity: "speed" }), "72");
    expect(el._getCurrentValue()).toBe(72);
  });

  it("reads an attribute of the configured entity", () => {
    const el = withCurrent(
      makeSchedule({ current_entity: "speed", current_attribute: "raw" }),
      "72",
    );
    expect(el._getCurrentValue()).toBe(72);
  });

  it("falls back to its own attributes without a current entity", () => {
    const el = makeSchedule({ current_attribute: "live" });
    el.stateObj.attributes.live = 33;
    expect(el._getCurrentValue()).toBe(33);
  });

  it("rejects unusable states", () => {
    for (const state of ["unavailable", "unknown", "none", "", "abc"]) {
      const el = withCurrent(makeSchedule({ current_entity: "speed" }), state);
      expect(el._getCurrentValue()).toBeNull();
    }
  });

  it("is null when the entity cannot be resolved", () => {
    const el = makeSchedule({ current_entity: "speed" });
    expect(el._getCurrentValue()).toBeNull();
  });

  it("looks the entity up on the parent when the pump has none", () => {
    const el = makeSchedule({ current_entity: "speed" });
    el.device.parent_entities = { speed: { entity_id: "sensor.speed" } };
    el._hass.states["sensor.speed"] = {
      entity_id: "sensor.speed",
      state: "44",
      attributes: {},
    };
    expect(el._getCurrentValue()).toBe(44);
  });
});

//----------------------------------------------------------------------------//
//   Hass updates
//----------------------------------------------------------------------------//

describe("Schedule hass updates", () => {
  it("re-renders when the measured value moves", () => {
    const el = makeSchedule({ current_entity: "speed" });
    el.device.entities.speed = { entity_id: "sensor.speed" };
    const states = {
      "sensor.speed": {
        entity_id: "sensor.speed",
        state: "40",
        attributes: {},
      },
    };
    el.hass = { states, entities: {} };
    const before = el.requestUpdate.mock.calls.length;
    el.hass = {
      states: {
        "sensor.speed": {
          entity_id: "sensor.speed",
          state: "80",
          attributes: {},
        },
      },
      entities: {},
    };
    expect(el.requestUpdate.mock.calls.length).toBeGreaterThan(before);
  });

  it("refreshes the state object when only the schedule changed", () => {
    const el = makeSchedule();
    const base = {
      entity_id: "sensor.pump_1_schedule",
      state: "on",
      attributes: { schedule: SCHEDULE },
    };
    el.hass = { states: { "sensor.pump_1_schedule": base }, entities: {} };
    const next = {
      ...base,
      attributes: { schedule: [{ st: 0, ti: 10 }] },
    };
    el.hass = { states: { "sensor.pump_1_schedule": next }, entities: {} };
    expect(el.stateObj).toBe(next);
  });

  it("does not touch the state object when nothing changed", () => {
    const el = makeSchedule();
    const same = el.stateObj;
    el.hass = { states: { "sensor.pump_1_schedule": same }, entities: {} };
    el.hass = { states: { "sensor.pump_1_schedule": same }, entities: {} };
    expect(el.stateObj).toBe(same);
  });
});

//----------------------------------------------------------------------------//
//   Drawing
//----------------------------------------------------------------------------//

describe("Schedule drawing", () => {
  it("draws the schedule on the main canvas", () => {
    const el = makeSchedule();
    el._canvas = makeCanvas();
    el._draw();
    expect(el._canvas.ctx.stroke).toHaveBeenCalled();
    expect(el._canvas.ctx.fillText).toHaveBeenCalled();
  });

  it("does nothing without a canvas", () => {
    const el = makeSchedule();
    expect(() => el._draw()).not.toThrow();
    expect(() => el._drawEditorChart()).not.toThrow();
  });

  it("gives up on a canvas with no size", () => {
    const el = makeSchedule();
    const canvas = makeCanvas(0, 0);
    el._drawOnCanvas(canvas, el._parseSchedule(), true);
    expect(canvas.ctx.stroke).not.toHaveBeenCalled();
  });

  it("draws the editor chart from the edited points", () => {
    const el = makeSchedule();
    el.openEditor();
    el._editorCanvas = makeCanvas();
    el._drawEditorChart();
    expect(el._editorCanvas.ctx.stroke).toHaveBeenCalled();
  });

  it("draws an empty schedule without failing", () => {
    const el = makeSchedule({}, []);
    el._canvas = makeCanvas();
    expect(() => el._draw()).not.toThrow();
  });

  it("draws the pulse oscillation band when a point has one", () => {
    const el = makeSchedule({ pulse_field: "pulse", max_value: 100 }, [
      { st: 0, ti: 80, pulse: 20 },
      { st: 720, ti: 90, pulse: 0 },
    ]);
    el._canvas = makeCanvas();
    el._draw();
    expect(el._canvas.ctx.setLineDash).toHaveBeenCalled();
  });

  it("draws the deviation when the measured value differs", () => {
    const el = makeSchedule({
      current_entity: "speed",
      deviation_threshold: 1,
    });
    el.device.entities.speed = { entity_id: "sensor.speed" };
    el._hass.states["sensor.speed"] = {
      entity_id: "sensor.speed",
      state: "5",
      attributes: {},
    };
    el._canvas = makeCanvas();
    el._draw();
    expect(el._canvas.ctx.arc).toHaveBeenCalled();
  });

  it("skips the deviation when it is disabled", () => {
    const el = makeSchedule({ current_entity: "speed", show_deviation: false });
    el.device.entities.speed = { entity_id: "sensor.speed" };
    el._hass.states["sensor.speed"] = {
      entity_id: "sensor.speed",
      state: "5",
      attributes: {},
    };
    el._canvas = makeCanvas();
    expect(() => el._draw()).not.toThrow();
  });

  it("honours the linear mode", () => {
    const el = makeSchedule({ linear: true });
    el._canvas = makeCanvas();
    expect(() => el._draw()).not.toThrow();
  });
});

//----------------------------------------------------------------------------//
//   Lifecycle
//----------------------------------------------------------------------------//

describe("Schedule lifecycle", () => {
  /** Expose a canvas through a stubbed shadow root */
  function stubShadowRoot(el: any, canvas: any): void {
    vi.spyOn(el, "shadowRoot", "get").mockReturnValue({
      querySelector: () => canvas,
    } as any);
  }

  it("wires the resize observer and the clock on first render", () => {
    vi.useFakeTimers();
    const el = makeSchedule();
    const canvas = makeCanvas();
    stubShadowRoot(el, canvas);
    el.firstUpdated();
    expect((globalThis as any).ResizeObserver.last.observe).toHaveBeenCalled();
    expect(canvas.ctx.stroke).toHaveBeenCalled();

    canvas.ctx.stroke.mockClear();
    vi.advanceTimersByTime(60_000);
    expect(canvas.ctx.stroke).toHaveBeenCalled();
  });

  it("redraws when the observer fires", () => {
    const el = makeSchedule();
    const canvas = makeCanvas();
    stubShadowRoot(el, canvas);
    el.firstUpdated();
    canvas.ctx.stroke.mockClear();
    (globalThis as any).ResizeObserver.last.cb();
    expect(canvas.ctx.stroke).toHaveBeenCalled();
  });

  it("still starts the clock without a canvas", () => {
    const el = makeSchedule();
    stubShadowRoot(el, null);
    el.firstUpdated();
    expect(el._ro).toBeNull();
    expect(el._clockTimer).not.toBeNull();
  });

  it("redraws the editor chart on update while editing", () => {
    const el = makeSchedule();
    el.openEditor();
    el._canvas = makeCanvas();
    el._editorCanvas = makeCanvas();
    el.updated();
    expect(el._editorCanvas.ctx.stroke).toHaveBeenCalled();
  });

  it("leaves the editor chart alone when not editing", () => {
    const el = makeSchedule();
    el._canvas = makeCanvas();
    el._editorCanvas = makeCanvas();
    el.updated();
    expect(el._editorCanvas.ctx.stroke).not.toHaveBeenCalled();
  });

  it("releases the observer and the clock when detached", () => {
    const el = makeSchedule();
    const canvas = makeCanvas();
    stubShadowRoot(el, canvas);
    vi.spyOn(
      Object.getPrototypeOf(Schedule.prototype),
      "disconnectedCallback",
    ).mockImplementation(() => {});
    el.firstUpdated();
    const observer = (globalThis as any).ResizeObserver.last;
    el.disconnectedCallback();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(el._ro).toBeNull();
    expect(el._clockTimer).toBeNull();
    expect(() => el.disconnectedCallback()).not.toThrow();
  });

  it("greys the chart out when the device is off", () => {
    const el = makeSchedule();
    el.stateOn = false;
    expect(serialize(el._render())).toContain("grayscale");
  });
});
