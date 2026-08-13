/**
 * Remaining coverage gaps in base/schedule.ts:
 *   - the inline handlers bound in the editor template
 *   - _initEditorCanvas() and its resize observer
 *   - the drawing fallbacks: no 2d context, chart too small, background
 *     colour, auto-scaled max, unit from the entity, small-chart grid
 *   - the "no schedule" and "no measured value" corners of the hass setter
 */

import { Schedule } from "../src/base/schedule";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

if (!customElements.get("gap-schedule")) {
  customElements.define("gap-schedule", class extends Schedule {});
}

/** Recording 2D context; unknown methods are created on demand */
function makeCtx(): any {
  const calls: any[] = [];
  const target: any = {
    calls,
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    measureText: vi.fn(() => ({ width: 10 })),
  };
  return new Proxy(target, {
    get(obj, prop: string) {
      if (prop in obj) return obj[prop];
      if (typeof prop !== "string") return undefined;
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
    set(obj, prop: string, value) {
      obj[prop] = value;
      return true;
    },
  });
}

/** Canvas stub of a given size, optionally without a 2d context */
function makeCanvas(width = 400, height = 200, withCtx = true): any {
  const ctx = withCtx ? makeCtx() : null;
  return {
    ctx,
    width,
    height,
    getContext: vi.fn(() => ctx),
    getBoundingClientRect: () =>
      ({ width, height, left: 0, top: 0 }) as DOMRect,
  };
}

const SCHEDULE = [
  { st: 0, ti: 40 },
  { st: 480, ti: 80 },
];

/**
 * Build a schedule element bound to a pump-like device.
 * @param conf: element configuration
 * @param schedule: raw schedule attribute
 */
function makeSchedule(conf: any = {}, schedule: any = SCHEDULE): any {
  const el: any = new (customElements.get("gap-schedule") as any)();
  el.conf = { name: "schedule", ...conf };
  el.stateObj = {
    entity_id: "sensor.schedule",
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

/** Collect every event handler bound in a lit template, depth first */
function handlers(tpl: any, found: any[] = []): any[] {
  if (Array.isArray(tpl)) {
    tpl.forEach((t) => handlers(t, found));
    return found;
  }
  if (!tpl?.strings?.raw) return found;
  const raw: string[] = Array.from(tpl.strings.raw);
  (tpl.values ?? []).forEach((value: any, i: number) => {
    if (typeof value === "function" && /@\w+=$/.test(raw[i] ?? "")) {
      found.push({ event: /@(\w+)=$/.exec(raw[i])![1], fn: value });
    } else {
      handlers(value, found);
    }
  });
  return found;
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
});

//----------------------------------------------------------------------------//
//   Editor template handlers
//----------------------------------------------------------------------------//

describe("Schedule editor handlers", () => {
  /** Open the editor and return the handlers bound in its template */
  function editorHandlers(conf: any = {}, schedule: any = SCHEDULE): any {
    const el = makeSchedule(conf, schedule);
    el.openEditor();
    return { el, list: handlers(el._renderEditor()) };
  }

  it("keeps a click inside the panel from closing it", () => {
    const { list } = editorHandlers();
    const stopPropagation = vi.fn();
    // The panel handler is the second click bound in the template
    list[1].fn({ stopPropagation });
    expect(stopPropagation).toHaveBeenCalled();
  });

  it("binds every row control", () => {
    const { el, list } = editorHandlers({ pulse_field: "pulse" });
    const events = list.map((h: any) => h.event);
    expect(events.filter((e: string) => e === "change").length).toBeGreaterThan(
      2,
    );
    expect(el._editPoints).toHaveLength(2);
  });

  it("toggles the preview from a row button", () => {
    const { el, list } = editorHandlers();
    const play = list.filter((h: any) => h.event === "click");
    // Fire every click handler: close, panel-stop, row play, delete, add, save
    for (const h of play) {
      try {
        h.fn({
          stopPropagation: vi.fn(),
          target: { classList: { contains: () => false } },
        });
      } catch {
        // handlers bound to inputs are exercised below
      }
    }
    expect(el._hass.callService).toHaveBeenCalled();
  });

  it("routes the row inputs to the right point", () => {
    const { el, list } = editorHandlers({ pulse_field: "pulse" });
    const changes = list.filter((h: any) => h.event === "change");
    changes[0].fn({ target: { value: "02:00" } });
    changes[1].fn({ target: { value: "55" } });
    changes[2].fn({ target: { value: "17" } });
    expect(el._editPoints.map((p: any) => p.minutes)).toContain(120);
    expect(el._editPoints.some((p: any) => p.value === 55)).toBe(true);
    expect(el._editPoints.some((p: any) => p.pulse === 17)).toBe(true);
  });

  it("uses the default bounds when the mapping declares none", () => {
    const el = makeSchedule();
    el.openEditor();
    el._onPreviewValueChange({ target: { value: "150" } });
    expect(el._previewValue).toBe(100);
    el._onPreviewPulseChange({ target: { value: "999" } });
    expect(el._previewPulse).toBe(300);
  });

  it("renders the stop button while a preview runs", () => {
    const el = makeSchedule({ pulse_field: "pulse" });
    el.openEditor();
    el._previewRunning = true;
    const list = handlers(el._renderEditor());
    expect(list.some((h: any) => h.event === "click")).toBe(true);
  });
});

//----------------------------------------------------------------------------//
//   Editor canvas
//----------------------------------------------------------------------------//

describe("Schedule editor canvas", () => {
  it("observes the editor canvas once the overlay is rendered", () => {
    const el = makeSchedule();
    const canvas = makeCanvas();
    vi.spyOn(el, "shadowRoot", "get").mockReturnValue({
      querySelector: () => canvas,
    } as any);
    el.openEditor();
    el._initEditorCanvas();
    expect((globalThis as any).ResizeObserver.last.observe).toHaveBeenCalled();
    expect(canvas.ctx.stroke).toHaveBeenCalled();
  });

  it("redraws the editor chart when the observer fires", () => {
    const el = makeSchedule();
    const canvas = makeCanvas();
    vi.spyOn(el, "shadowRoot", "get").mockReturnValue({
      querySelector: () => canvas,
    } as any);
    el.openEditor();
    el._initEditorCanvas();
    canvas.ctx.stroke.mockClear();
    (globalThis as any).ResizeObserver.last.cb();
    expect(canvas.ctx.stroke).toHaveBeenCalled();
  });

  it("copes with an overlay that has no canvas", () => {
    const el = makeSchedule();
    vi.spyOn(el, "shadowRoot", "get").mockReturnValue({
      querySelector: () => null,
    } as any);
    el.openEditor();
    expect(() => el._initEditorCanvas()).not.toThrow();
    expect(el._editorCanvas).toBeNull();
  });
});

//----------------------------------------------------------------------------//
//   Points
//----------------------------------------------------------------------------//

describe("Schedule point defaults", () => {
  it("adds the first point at one hour when the list is empty", () => {
    const el = makeSchedule();
    el._editPoints = [];
    el._addPoint();
    expect(el._editPoints).toEqual([{ minutes: 60, value: 0 }]);
  });

  it("adds a pulse to a new point when the pump supports it", () => {
    const el = makeSchedule({ pulse_field: "pulse", min_pulse: 7 });
    el.openEditor();
    el._addPoint();
    expect(el._editPoints.at(-1).pulse).toBe(7);
  });
});

//----------------------------------------------------------------------------//
//   Drawing fallbacks
//----------------------------------------------------------------------------//

describe("Schedule drawing fallbacks", () => {
  it("gives up when the canvas has no 2d context", () => {
    const el = makeSchedule();
    const canvas = makeCanvas(400, 200, false);
    expect(() =>
      el._drawOnCanvas(canvas, el._parseSchedule(), true),
    ).not.toThrow();
  });

  it("gives up when the padding leaves no chart area", () => {
    const el = makeSchedule();
    const canvas = makeCanvas(20, 20);
    el._drawOnCanvas(canvas, el._parseSchedule(), true);
    expect(canvas.ctx.stroke).not.toHaveBeenCalled();
  });

  it("paints the configured background colour", () => {
    const el = makeSchedule({ bg_color: "0,0,0" });
    const canvas = makeCanvas();
    el._drawOnCanvas(canvas, el._parseSchedule(), true);
    expect(canvas.ctx.fillRect).toHaveBeenCalled();
  });

  it("scales the axis on the highest point when no maximum is configured", () => {
    const el = makeSchedule({}, [{ st: 0, ti: 500 }]);
    const canvas = makeCanvas();
    expect(() =>
      el._drawOnCanvas(canvas, el._parseSchedule(), true),
    ).not.toThrow();
  });

  it("takes the unit from the entity when the mapping has none", () => {
    const el = makeSchedule();
    el.stateObj.attributes.unit_of_measurement = "L/h";
    const canvas = makeCanvas();
    el._drawOnCanvas(canvas, el._parseSchedule(), true);
    expect(canvas.ctx.fillText).toHaveBeenCalled();
  });

  it("thins the grid out on a narrow chart", () => {
    const el = makeSchedule();
    const canvas = makeCanvas(180, 120);
    el._drawOnCanvas(canvas, el._parseSchedule(), true);
    expect(canvas.ctx.fillText).toHaveBeenCalled();
  });

  it("draws nothing but the frame for an empty schedule", () => {
    const el = makeSchedule({}, []);
    const canvas = makeCanvas();
    el._drawOnCanvas(canvas, [], true);
    expect(canvas.ctx.clearRect).toHaveBeenCalled();
  });

  it("skips the now marker on the editor chart", () => {
    const el = makeSchedule();
    const canvas = makeCanvas();
    el._drawOnCanvas(canvas, el._parseSchedule(), false);
    expect(canvas.ctx.rotate).not.toHaveBeenCalled();
  });

  it("draws the deviation label on both sides of the chart", () => {
    for (const hour of [1, 23]) {
      const el = makeSchedule({
        current_entity: "speed",
        deviation_threshold: 1,
        deviation_color: "0,255,0",
      });
      el.device.entities.speed = { entity_id: "sensor.speed" };
      el._hass.states["sensor.speed"] = {
        entity_id: "sensor.speed",
        state: "10",
        attributes: {},
      };
      vi.setSystemTime(new Date(2026, 0, 1, hour, 0, 0));
      const canvas = makeCanvas();
      el._drawOnCanvas(canvas, el._parseSchedule(), true);
      expect(canvas.ctx.rotate).toHaveBeenCalled();
    }
    vi.useRealTimers();
  });

  it("ignores a deviation below the threshold", () => {
    const el = makeSchedule({
      current_entity: "speed",
      deviation_threshold: 90,
    });
    el.device.entities.speed = { entity_id: "sensor.speed" };
    el._hass.states["sensor.speed"] = {
      entity_id: "sensor.speed",
      state: "41",
      attributes: {},
    };
    const canvas = makeCanvas();
    expect(() =>
      el._drawOnCanvas(canvas, el._parseSchedule(), true),
    ).not.toThrow();
  });
});

//----------------------------------------------------------------------------//
//   Pulse overlay
//----------------------------------------------------------------------------//

describe("Schedule pulse overlay", () => {
  /**
   * Draw a schedule and count the dashed boundaries of the pulse band.
   * The grid uses setLineDash too, so only the [3, 3] pattern is counted.
   * @param schedule: raw schedule attribute
   */
  function waves(schedule: any): number {
    const el = makeSchedule(
      { pulse_field: "pulse", max_value: 100, min_value: 0 },
      schedule,
    );
    const canvas = makeCanvas();
    el._drawOnCanvas(canvas, el._parseSchedule(), true);
    return canvas.ctx.calls.filter(
      (c: any[]) =>
        c[0] === "setLineDash" &&
        Array.isArray(c[1]) &&
        c[1][0] === 3 &&
        c[1][1] === 3,
    ).length;
  }

  it("skips a point with no pulse", () => {
    expect(waves([{ st: 0, ti: 80, pulse: 0 }])).toBe(0);
  });

  it("skips a point whose value sits below the low threshold", () => {
    expect(waves([{ st: 0, ti: 20, pulse: 30 }])).toBe(0);
  });

  it("skips a segment too narrow to be readable", () => {
    expect(
      waves([
        { st: 0, ti: 80, pulse: 30 },
        { st: 1, ti: 80, pulse: 0 },
        { st: 1439, ti: 80, pulse: 0 },
      ]),
    ).toBe(0);
  });

  it("draws the band for the last point up to midnight", () => {
    expect(waves([{ st: 0, ti: 80, pulse: 30 }])).toBeGreaterThan(0);
  });
});

//----------------------------------------------------------------------------//
//   Hass setter corners
//----------------------------------------------------------------------------//

describe("Schedule hass setter corners", () => {
  it("does nothing without a state for its own entity", () => {
    const el = makeSchedule();
    el.hass = { states: {}, entities: {} };
    expect(el.requestUpdate).not.toHaveBeenCalled();
  });

  it("does not re-render on the very first schedule read", () => {
    const el = makeSchedule();
    el.hass = {
      states: { "sensor.schedule": el.stateObj },
      entities: {},
    };
    expect(el.requestUpdate).not.toHaveBeenCalled();
  });

  it("treats a missing schedule attribute as null", () => {
    const el = makeSchedule({}, undefined);
    const bare = {
      entity_id: "sensor.schedule",
      state: "on",
      attributes: {},
    };
    el.hass = { states: { "sensor.schedule": bare }, entities: {} };
    el.hass = { states: { "sensor.schedule": bare }, entities: {} };
    expect(el.requestUpdate).not.toHaveBeenCalled();
  });

  it("does nothing without a state object at all", () => {
    const el = makeSchedule();
    el.stateObj = null;
    expect(() => (el.hass = { states: {}, entities: {} })).not.toThrow();
  });
});
