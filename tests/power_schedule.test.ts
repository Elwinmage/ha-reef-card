/**
 * Tests for the `power-schedule` element.
 *
 * The component is the on/off schedule editor for a ReefPower AC socket. Two
 * behaviours matter most and are covered first: a device chain that cannot be
 * resolved (the element must say so rather than issue a request against
 * `undefined`), and a websocket call that rejects — neither may throw and take
 * the dialog down with it.
 *
 * The rest covers interval editing, the readonly preview used inside the
 * socket config dialog, and the canvas drawing, whose guards decide whether a
 * timeline is painted at all.
 *
 * Covers: src/devices/redsea/rspower/power_schedule.ts
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { PowerSchedule } from "../src/devices/redsea/rspower/power_schedule";

// ─── Custom element registration ────────────────────────────────────────────

class StubPowerSchedule extends PowerSchedule {}
if (!customElements.get("stub-power-schedule"))
  customElements.define("stub-power-schedule", StubPowerSchedule);

// jsdom has no ResizeObserver; record the instance so tests can fire it
const original_ro = (globalThis as any).ResizeObserver;
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
  (globalThis as any).ResizeObserver = original_ro;
  vi.restoreAllMocks();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Flatten a lit template tree to text.
 *
 * Interval rows are nested TemplateResults produced by `.map()`, so joining
 * only the outer strings and values would silently miss them — an assertion
 * would then pass for the wrong reason.
 */
function renderText(result: any): string {
  if (result === null || result === undefined || result === false) return "";
  if (Array.isArray(result)) return result.map(renderText).join("");
  if (typeof result === "object" && "strings" in result) {
    return (
      (result.strings as string[]).join("") +
      (result.values as any[]).map(renderText).join("")
    );
  }
  return String(result);
}

/** A canvas 2D context stub that records every call made against it. */
function makeCtx(): any {
  const calls: any[] = [];
  return {
    calls,
    fillRect: (...a: any[]) => calls.push(["fillRect", ...a]),
    strokeRect: (...a: any[]) => calls.push(["strokeRect", ...a]),
    beginPath: () => calls.push(["beginPath"]),
    moveTo: (...a: any[]) => calls.push(["moveTo", ...a]),
    lineTo: (...a: any[]) => calls.push(["lineTo", ...a]),
    stroke: () => calls.push(["stroke"]),
    fillText: (...a: any[]) => calls.push(["fillText", ...a]),
  };
}

/** Text drawn on the canvas, in order. */
function texts(ctx: any): string[] {
  return ctx.calls
    .filter((c: any) => c[0] === "fillText")
    .map((c: any) => c[1]);
}

/**
 * Give the element a measurable canvas without a real DOM one.
 *
 * `shadowRoot` is a getter on Element, so it cannot simply be assigned. The
 * element re-queries it on every draw, so the fake has to be reachable there.
 */
function attachCanvas(el: any, width = 400, height = 64): any {
  const ctx = makeCtx();
  const canvas = {
    width: 0,
    height: 0,
    getBoundingClientRect: () => ({ width, height }),
    getContext: () => ctx,
  };
  vi.spyOn(el, "shadowRoot", "get").mockReturnValue({
    querySelector: () => canvas,
  } as any);
  return { ctx, canvas };
}

/** An element built without going through connectedCallback. */
function makeElement(conf: any = null): any {
  const el = new StubPowerSchedule() as any;
  el.conf = conf;
  return el;
}

/** A device chain resolving to the given config entry id. */
function makeDevice(entry: string | null = "entry-1", socketId = 1): any {
  return {
    socket_id: socketId,
    device: {
      device: {
        elements: entry ? [{ primary_config_entry: entry }] : [],
      },
    },
  };
}

function makeHass(over: any = {}): any {
  return {
    states: {},
    callWS: vi.fn().mockResolvedValue({
      response: { json: { intervals: [] } },
    }),
    callService: vi.fn().mockResolvedValue(undefined),
    ...over,
  };
}

/** A change event whose target carries the given time string. */
function timeEvent(value: string): any {
  return { target: { value } };
}

// ─── setConfig ──────────────────────────────────────────────────────────────

describe("PowerSchedule.setConfig", () => {
  it("stores the configuration passed by the dialog system", () => {
    const el = makeElement();
    el.setConfig({ readonly: true });
    expect(el.conf).toEqual({ readonly: true });
  });
});

// ─── Lifecycle ──────────────────────────────────────────────────────────────

describe("PowerSchedule lifecycle", () => {
  it("connectedCallback() fetches when nothing is loaded yet", () => {
    const el = makeElement();
    const spy = vi.spyOn(el, "_fetchSchedule").mockResolvedValue(undefined);
    el.connectedCallback();
    expect(spy).toHaveBeenCalled();
  });

  it("connectedCallback() does not refetch an already loaded schedule", () => {
    const el = makeElement();
    el._loaded = true;
    const spy = vi.spyOn(el, "_fetchSchedule").mockResolvedValue(undefined);
    el.connectedCallback();
    expect(spy).not.toHaveBeenCalled();
  });

  it("updated() redraws the timeline", () => {
    const el = makeElement();
    const spy = vi.spyOn(el, "_drawTimeline").mockImplementation(() => {});
    el.updated();
    expect(spy).toHaveBeenCalled();
  });

  it("firstUpdated() observes the timeline box and draws once", () => {
    const el = makeElement();
    const host = {};
    vi.spyOn(el, "shadowRoot", "get").mockReturnValue({
      querySelector: () => host,
    } as any);
    const draw = vi.spyOn(el, "_drawTimeline").mockImplementation(() => {});

    el.firstUpdated();

    const ro = (globalThis as any).ResizeObserver.last;
    expect(ro.observe).toHaveBeenCalledWith(host);
    expect(draw).toHaveBeenCalledTimes(1);

    // The observer callback triggers a redraw of its own
    ro.cb();
    expect(draw).toHaveBeenCalledTimes(2);
  });

  it("firstUpdated() skips the observer when the timeline is absent", () => {
    const el = makeElement();
    vi.spyOn(el, "shadowRoot", "get").mockReturnValue({
      querySelector: () => null,
    } as any);
    const draw = vi.spyOn(el, "_drawTimeline").mockImplementation(() => {});

    el.firstUpdated();

    expect(el._resizeObserver).toBeNull();
    expect(draw).toHaveBeenCalledTimes(1);
  });

  it("disconnectedCallback() releases the observer", () => {
    const el = makeElement();
    const disconnect = vi.fn();
    el._resizeObserver = { disconnect } as any;

    el.disconnectedCallback();

    expect(disconnect).toHaveBeenCalled();
    expect(el._resizeObserver).toBeNull();
  });

  it("disconnectedCallback() is safe without an observer", () => {
    const el = makeElement();
    el._resizeObserver = null;
    expect(() => el.disconnectedCallback()).not.toThrow();
  });
});

// ─── Device chain resolution ────────────────────────────────────────────────

describe("PowerSchedule._getDeviceId", () => {
  it("finds the entry on the element's own device", () => {
    const el = makeElement();
    el.device = { elements: [{ primary_config_entry: "direct" }] };
    expect(el._getDeviceId()).toBe("direct");
  });

  it("finds the entry through parent_device", () => {
    const el = makeElement();
    el.device = {
      parent_device: { elements: [{ primary_config_entry: "via-parent" }] },
    };
    expect(el._getDeviceId()).toBe("via-parent");
  });

  it("walks the socket → device → device chain", () => {
    const el = makeElement();
    el.device = makeDevice("deep-entry");
    expect(el._getDeviceId()).toBe("deep-entry");
  });

  it("continues through parent_device when there is no device link", () => {
    const el = makeElement();
    el.device = {
      parent_device: {
        device: { elements: [{ primary_config_entry: "hop" }] },
      },
    };
    expect(el._getDeviceId()).toBe("hop");
  });

  it("returns null when no device is set", () => {
    const el = makeElement();
    el.device = null;
    expect(el._getDeviceId()).toBeNull();
  });

  it("gives up rather than walking a cyclic chain forever", () => {
    const el = makeElement();
    const node: any = { elements: [] };
    node.device = node;
    el.device = node;
    expect(el._getDeviceId()).toBeNull();
  });
});

describe("PowerSchedule._getSocketNumber", () => {
  it("converts the 1-based socket_id to the 0-based API index", () => {
    const el = makeElement();
    el.device = { socket_id: 3 };
    expect(el._getSocketNumber()).toBe(2);
  });

  it("falls back to config.id when socket_id is absent", () => {
    const el = makeElement();
    el.device = { config: { id: 5 } };
    expect(el._getSocketNumber()).toBe(4);
  });

  it("returns 0 for a non-numeric id", () => {
    const el = makeElement();
    el.device = { config: { id: "abc" } };
    expect(el._getSocketNumber()).toBe(0);
  });

  it("returns 0 when no device is set", () => {
    const el = makeElement();
    el.device = null;
    expect(el._getSocketNumber()).toBe(0);
  });
});

// ─── Fetch ──────────────────────────────────────────────────────────────────

describe("PowerSchedule._fetchSchedule", () => {
  /** An element whose socket mode sensor carries the given attributes. */
  function makeWithAttributes(attributes: any): any {
    const el = makeElement();
    el.device = {
      ...makeDevice(),
      entities: { socket_mode: { entity_id: "sensor.socket_mode" } },
    };
    el.hass = makeHass({
      states: { "sensor.socket_mode": { state: "schedule", attributes } },
    });
    return el;
  }

  it("reads the programme carried by the socket mode sensor", () => {
    // No request goes out: the integration already holds the schedule, so
    // the editor opens on data in hand rather than on an empty dialog.
    const el = makeWithAttributes({
      schedule: {
        intervals: [
          { time: 600, duration: 120 },
          { time: 0, duration: 60 },
        ],
      },
    });

    el._fetchSchedule();

    expect(el._intervals).toEqual([
      { time: 0, duration: 60 },
      { time: 600, duration: 120 },
    ]);
    expect(el._loaded).toBe(true);
    expect(el._loading).toBe(false);
    expect(el.hass.callWS).not.toHaveBeenCalled();
  });

  it("drops malformed and zero-length intervals", () => {
    const el = makeWithAttributes({
      schedule: {
        intervals: [
          { time: 0, duration: 60 },
          { time: "x", duration: 30 },
          { time: 120, duration: "y" },
          { time: 240, duration: 0 },
          null,
        ],
      },
    });

    el._fetchSchedule();

    expect(el._intervals).toEqual([{ time: 0, duration: 60 }]);
  });

  it("treats a sensor with no schedule attribute as an empty programme", () => {
    const el = makeWithAttributes({});

    el._fetchSchedule();

    expect(el._intervals).toEqual([]);
    expect(el._error).toBeNull();
  });

  it("treats a non-array intervals field as an empty programme", () => {
    const el = makeWithAttributes({ schedule: { intervals: "nope" } });

    el._fetchSchedule();

    expect(el._intervals).toEqual([]);
  });

  it("reports a missing socket mode sensor", () => {
    const el = makeElement();
    el.device = makeDevice();
    el.hass = makeHass();

    el._fetchSchedule();

    expect(el._error).toBe("Missing device context");
    expect(el._loading).toBe(false);
  });

  it("reports a sensor that has no state yet", () => {
    const el = makeElement();
    el.device = {
      ...makeDevice(),
      entities: { socket_mode: { entity_id: "sensor.socket_mode" } },
    };
    el.hass = makeHass({ states: {} });

    el._fetchSchedule();

    expect(el._error).toBe("Missing device context");
  });

  it("reports a missing hass", () => {
    const el = makeElement();
    el.device = {
      ...makeDevice(),
      entities: { socket_mode: { entity_id: "sensor.socket_mode" } },
    };
    el.hass = null;

    el._fetchSchedule();

    expect(el._error).toBe("Missing device context");
  });
});

// ─── Save ───────────────────────────────────────────────────────────────────

describe("PowerSchedule._saveSchedule", () => {
  it("does nothing without a resolvable device", async () => {
    const el = makeElement();
    el.device = null;
    el.hass = makeHass();

    await el._saveSchedule();

    expect(el.hass.callService).not.toHaveBeenCalled();
  });

  it("does nothing without hass", async () => {
    const el = makeElement();
    el.device = makeDevice();
    el.hass = null;

    await expect(el._saveSchedule()).resolves.toBeUndefined();
  });

  it("sends sorted, clamped intervals and closes the dialog", async () => {
    const el = makeElement();
    el.device = makeDevice("entry-2", 1);
    el.hass = makeHass();
    el._intervals = [
      { time: 600, duration: 60 },
      { time: 0, duration: 30 },
    ];
    const quit = vi.fn();
    el.addEventListener("quit-dialog", quit);

    await el._saveSchedule();

    expect(el.hass.callService).toHaveBeenCalledWith("redsea", "request", {
      device_id: "entry-2",
      access_path: "/socket/0/config/schedule",
      method: "put",
      data: {
        intervals: [
          { time: 0, duration: 30 },
          { time: 600, duration: 60 },
        ],
      },
      // The strip acknowledges the write before it serves the new programme
      // back, so the re-read has to wait for it.
      refresh: "config",
      wait: 3,
    });
    expect(quit).toHaveBeenCalled();
  });

  it("drops zero-length intervals and clamps out-of-range values", async () => {
    const el = makeElement();
    el.device = makeDevice();
    el.hass = makeHass();
    el._intervals = [
      { time: -50, duration: 10 },
      { time: 5000, duration: 20 },
      { time: 100, duration: 0 },
    ];

    await el._saveSchedule();

    const sent = el.hass.callService.mock.calls[0][2].data.intervals;
    expect(sent).toEqual([
      { time: 0, duration: 10 },
      { time: 1439, duration: 20 },
    ]);
  });

  it("closes without waiting for the device to confirm", async () => {
    // The service holds its reply until it has re-read the device, seconds
    // later. Waiting would freeze the dialog for no gain.
    vi.spyOn(console, "error").mockImplementation(() => {});
    const el = makeElement();
    el.device = makeDevice();
    el.hass = makeHass({
      callService: vi.fn().mockRejectedValue(new Error("nope")),
    });
    const quit = vi.fn();
    el.addEventListener("quit-dialog", quit);

    await el._saveSchedule();

    expect(quit).toHaveBeenCalled();
  });
});

// ─── Render ─────────────────────────────────────────────────────────────────

describe("PowerSchedule.render", () => {
  it("shows a spinner while loading", () => {
    const el = makeElement();
    el._loading = true;
    expect(renderText(el.render())).toContain("ps-loading");
  });

  it("renders nothing while loading in preview mode", () => {
    const el = makeElement({ readonly: true });
    el._loading = true;
    expect(renderText(el.render()).trim()).toBe("");
  });

  it("shows the error message", () => {
    const el = makeElement();
    el._loading = false;
    el._error = "Missing device context";
    const out = renderText(el.render());
    expect(out).toContain("ps-error");
    expect(out).toContain("Missing device context");
  });

  it("renders nothing on error in preview mode", () => {
    const el = makeElement({ readonly: true });
    el._loading = false;
    el._error = "boom";
    expect(renderText(el.render()).trim()).toBe("");
  });

  it("renders the preview when the socket runs on a schedule", () => {
    const el = makeElement({ readonly: true });
    el._loading = false;
    el.device = {
      entities: { socket_mode: { entity_id: "sensor.m" } },
    };
    el.hass = { states: { "sensor.m": { state: "schedule" } } };

    expect(renderText(el.render())).toContain("ps-preview");
  });

  it("hides the preview when the socket is not on a schedule", () => {
    const el = makeElement({ readonly: true });
    el._loading = false;
    el.device = { entities: { socket_mode: { entity_id: "sensor.m" } } };
    el.hass = { states: { "sensor.m": { state: "on" } } };

    expect(renderText(el.render()).trim()).toBe("");
  });

  it("announces an all-day off schedule when there is no interval", () => {
    const el = makeElement();
    el._loading = false;
    el._intervals = [];
    expect(renderText(el.render())).toContain("00:00");
  });

  it("renders one row per interval", () => {
    const el = makeElement();
    el._loading = false;
    el._intervals = [
      { time: 0, duration: 720 },
      { time: 1319, duration: 120 },
    ];

    const out = renderText(el.render());

    expect(out).toContain("ps-row");
    expect(out).toContain("00:00");
    expect(out).toContain("12:00");
    expect(out).toContain("21:59");
  });

  it("still renders the add button below the interval cap", () => {
    const el = makeElement();
    el._loading = false;
    el._intervals = [{ time: 0, duration: 60 }];
    expect(renderText(el.render())).toContain("ps-add");
  });

  it("renders at the interval cap without breaking", () => {
    const el = makeElement();
    el._loading = false;
    el._intervals = Array.from({ length: 10 }, (_, i) => ({
      time: i * 100,
      duration: 30,
    }));
    expect(renderText(el.render())).toContain("ps-add");
  });
});

// ─── Interval editing ───────────────────────────────────────────────────────

describe("PowerSchedule interval editing", () => {
  it("moving the start keeps the end and shortens the interval", () => {
    const el = makeElement();
    el._intervals = [{ time: 0, duration: 120 }];

    el._onStartChange(0, timeEvent("01:00"));

    expect(el._intervals).toEqual([{ time: 60, duration: 60 }]);
  });

  it("a start pushed past the end leaves a one-minute interval", () => {
    const el = makeElement();
    el._intervals = [{ time: 0, duration: 60 }];

    el._onStartChange(0, timeEvent("05:00"));

    expect(el._intervals).toEqual([{ time: 300, duration: 1 }]);
  });

  it("re-sorts intervals after a start moves", () => {
    const el = makeElement();
    el._intervals = [
      { time: 0, duration: 60 },
      { time: 600, duration: 60 },
    ];

    el._onStartChange(0, timeEvent("20:00"));

    expect(el._intervals[0].time).toBe(600);
  });

  it("ignores an unparsable start time", () => {
    const el = makeElement();
    el._intervals = [{ time: 0, duration: 60 }];

    el._onStartChange(0, timeEvent(""));

    expect(el._intervals).toEqual([{ time: 0, duration: 60 }]);
  });

  it("moving the end adjusts the duration", () => {
    const el = makeElement();
    el._intervals = [{ time: 60, duration: 60 }];

    el._onEndChange(0, timeEvent("04:00"));

    expect(el._intervals).toEqual([{ time: 60, duration: 180 }]);
  });

  it("an end before the start leaves a one-minute interval", () => {
    const el = makeElement();
    el._intervals = [{ time: 600, duration: 60 }];

    el._onEndChange(0, timeEvent("01:00"));

    expect(el._intervals).toEqual([{ time: 600, duration: 1 }]);
  });

  it("ignores an unparsable end time", () => {
    const el = makeElement();
    el._intervals = [{ time: 0, duration: 60 }];

    el._onEndChange(0, timeEvent("bad"));

    expect(el._intervals).toEqual([{ time: 0, duration: 60 }]);
  });

  it("adds a first interval at midnight", () => {
    const el = makeElement();
    el._intervals = [];

    el._addInterval();

    expect(el._intervals).toEqual([{ time: 0, duration: 60 }]);
  });

  it("adds the next interval an hour after the last one ends", () => {
    const el = makeElement();
    el._intervals = [{ time: 0, duration: 60 }];

    el._addInterval();

    expect(el._intervals).toEqual([
      { time: 0, duration: 60 },
      { time: 120, duration: 60 },
    ]);
  });

  it("keeps a late interval inside the day", () => {
    const el = makeElement();
    el._intervals = [{ time: 1400, duration: 30 }];

    el._addInterval();

    // 1400 + 30 + 60 overflows the day, so the new interval is clamped to
    // 23:59 minus an hour — which sorts it ahead of the existing one.
    expect(el._intervals).toEqual([
      { time: 1379, duration: 60 },
      { time: 1400, duration: 30 },
    ]);
  });

  it("refuses to add beyond the interval cap", () => {
    const el = makeElement();
    el._intervals = Array.from({ length: 10 }, (_, i) => ({
      time: i * 100,
      duration: 30,
    }));

    el._addInterval();

    expect(el._intervals).toHaveLength(10);
  });

  it("removes the interval at the given index", () => {
    const el = makeElement();
    el._intervals = [
      { time: 0, duration: 60 },
      { time: 600, duration: 60 },
    ];

    el._removeInterval(0);

    expect(el._intervals).toEqual([{ time: 600, duration: 60 }]);
  });
});

// ─── Canvas drawing ─────────────────────────────────────────────────────────

describe("PowerSchedule._drawTimeline", () => {
  it("does nothing without a canvas", () => {
    const el = makeElement();
    vi.spyOn(el, "shadowRoot", "get").mockReturnValue({
      querySelector: () => null,
    } as any);
    expect(() => el._drawTimeline()).not.toThrow();
  });

  it("does nothing without a shadow root", () => {
    const el = makeElement();
    vi.spyOn(el, "shadowRoot", "get").mockReturnValue(null as any);
    expect(() => el._drawTimeline()).not.toThrow();
  });

  it("skips a canvas that has not been laid out yet", () => {
    const el = makeElement();
    const { ctx } = attachCanvas(el, 0, 0);
    el._drawTimeline();
    expect(ctx.calls).toHaveLength(0);
  });

  it("skips a canvas with no height", () => {
    const el = makeElement();
    const { ctx } = attachCanvas(el, 400, 0);
    el._drawTimeline();
    expect(ctx.calls).toHaveLength(0);
  });

  it("bails out when the 2D context is unavailable", () => {
    const el = makeElement();
    const canvas = {
      width: 0,
      height: 0,
      getBoundingClientRect: () => ({ width: 400, height: 64 }),
      getContext: () => null,
    };
    vi.spyOn(el, "shadowRoot", "get").mockReturnValue({
      querySelector: () => canvas,
    } as any);
    expect(() => el._drawTimeline()).not.toThrow();
  });

  it("skips drawing when padding leaves no room", () => {
    const el = makeElement();
    const { ctx } = attachCanvas(el, 400, 4);
    el._drawTimeline();
    expect(ctx.calls).toHaveLength(0);
  });

  it("sizes the canvas to its box and paints the off background", () => {
    const el = makeElement();
    const { ctx, canvas } = attachCanvas(el, 400, 64);
    el._intervals = [];

    el._drawTimeline();

    const dpr = window.devicePixelRatio || 1;
    expect(canvas.width).toBe(Math.round(400 * dpr));
    expect(canvas.height).toBe(Math.round(64 * dpr));
    expect(ctx.calls.some((c: any) => c[0] === "fillRect")).toBe(true);
  });

  it("paints an on block and labels it when wide enough", () => {
    const el = makeElement();
    const { ctx } = attachCanvas(el, 400, 64);
    el._intervals = [{ time: 0, duration: 720 }];

    el._drawTimeline();

    // Two fillRects: the off background plus the on block
    const rects = ctx.calls.filter((c: any) => c[0] === "fillRect");
    expect(rects.length).toBeGreaterThanOrEqual(2);
    expect(texts(ctx).length).toBeGreaterThan(0);
  });

  it("skips the label on a block too narrow to hold it", () => {
    const el = makeElement();
    const { ctx } = attachCanvas(el, 400, 64);
    el._intervals = [{ time: 0, duration: 5 }];

    el._drawTimeline();

    // Only the hour scale is written, no ON label inside the block
    expect(texts(ctx).every((t: string) => t.endsWith("h"))).toBe(true);
  });

  it("ignores an interval with no duration on screen", () => {
    const el = makeElement();
    const { ctx } = attachCanvas(el, 400, 64);
    el._intervals = [{ time: 100, duration: 0 }];

    el._drawTimeline();

    const rects = ctx.calls.filter((c: any) => c[0] === "fillRect");
    expect(rects).toHaveLength(1);
  });

  it("writes a three-hourly scale in the editor", () => {
    const el = makeElement();
    const { ctx } = attachCanvas(el, 400, 64);

    el._drawTimeline();

    const hours = texts(ctx);
    expect(hours).toContain("0h");
    expect(hours).toContain("3h");
    expect(hours).toContain("24h");
  });

  it("thins the scale to six-hourly in the compact preview", () => {
    const el = makeElement({ readonly: true });
    const { ctx } = attachCanvas(el, 400, 40);

    el._drawTimeline();

    const hours = texts(ctx);
    expect(hours).toContain("0h");
    expect(hours).toContain("6h");
    expect(hours).not.toContain("3h");
  });

  it("falls back to a device pixel ratio of 1", () => {
    const el = makeElement();
    const original = window.devicePixelRatio;
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 0,
    });
    const { canvas } = attachCanvas(el, 400, 64);

    el._drawTimeline();

    expect(canvas.width).toBe(400);
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: original,
    });
  });
});

// ─── Helpers ────────────────────────────────────────────────────────────────

describe("PowerSchedule._isScheduleMode", () => {
  it("is false without device entities", () => {
    const el = makeElement();
    el.device = null;
    el.hass = { states: {} };
    expect(el._isScheduleMode()).toBe(false);
  });

  it("is false without hass states", () => {
    const el = makeElement();
    el.device = { entities: {} };
    el.hass = null;
    expect(el._isScheduleMode()).toBe(false);
  });

  it("is true when the socket mode is schedule", () => {
    const el = makeElement();
    el.device = { entities: { socket_mode: { entity_id: "sensor.m" } } };
    el.hass = { states: { "sensor.m": { state: "schedule" } } };
    expect(el._isScheduleMode()).toBe(true);
  });

  it("is true when a schedule is only the previous mode", () => {
    const el = makeElement();
    el.device = {
      entities: {
        socket_mode: { entity_id: "sensor.m" },
        socket_prev_mode: { entity_id: "sensor.p" },
      },
    };
    el.hass = {
      states: {
        "sensor.m": { state: "off" },
        "sensor.p": { state: "schedule" },
      },
    };
    expect(el._isScheduleMode()).toBe(true);
  });

  it("is false for a socket driven by anything else", () => {
    const el = makeElement();
    el.device = { entities: { socket_mode: { entity_id: "sensor.m" } } };
    el.hass = { states: { "sensor.m": { state: "on" } } };
    expect(el._isScheduleMode()).toBe(false);
  });

  it("is false when the mode entity has no state", () => {
    const el = makeElement();
    el.device = { entities: {} };
    el.hass = { states: {} };
    expect(el._isScheduleMode()).toBe(false);
  });
});

describe("PowerSchedule._openEditor", () => {
  it("asks the card to open the full schedule dialog", () => {
    const el = makeElement();
    const seen: any[] = [];
    el.addEventListener("display-dialog", (e: any) => seen.push(e.detail));

    el._openEditor();

    expect(seen).toHaveLength(1);
    expect(seen[0].type).toBe("socket_schedule");
    expect(seen[0].overload_quit).toBe("socket_config");
    expect(seen[0].elt).toBe(el);
  });
});

describe("PowerSchedule._minutesToTime", () => {
  it("pads hours and minutes", () => {
    const el = makeElement();
    expect(el._minutesToTime(0)).toBe("00:00");
    expect(el._minutesToTime(65)).toBe("01:05");
    expect(el._minutesToTime(1439)).toBe("23:59");
  });

  it("wraps a full day back to midnight", () => {
    const el = makeElement();
    expect(el._minutesToTime(1440)).toBe("00:00");
  });
});

// ─── Mounted interactions ───────────────────────────────────────────────────

/**
 * Mount a ready-to-edit element in the document.
 *
 * The handlers bound inside the template only run when the rendered DOM
 * fires, so they need a real element rather than a direct method call.
 * `_loaded` is set up front so connectedCallback does not issue a request.
 */
async function mount(intervals: any[], conf: any = null): Promise<any> {
  const el = document.createElement("stub-power-schedule") as any;
  el.conf = conf;
  el._loaded = true;
  el._loading = false;
  el._intervals = intervals;
  el.device = makeDevice();
  el.hass = makeHass();
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function q(el: any, selector: string): any {
  return el.shadowRoot.querySelector(selector);
}

function qAll(el: any, selector: string): any[] {
  return Array.from(el.shadowRoot.querySelectorAll(selector));
}

describe("PowerSchedule mounted interactions", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("editing the start field updates the interval", async () => {
    const el = await mount([{ time: 0, duration: 120 }]);

    const start = qAll(el, 'input[type="time"]')[0];
    start.value = "01:00";
    start.dispatchEvent(new Event("change"));

    expect(el._intervals).toEqual([{ time: 60, duration: 60 }]);
  });

  it("editing the end field updates the interval", async () => {
    const el = await mount([{ time: 60, duration: 60 }]);

    const end = qAll(el, 'input[type="time"]')[1];
    end.value = "04:00";
    end.dispatchEvent(new Event("change"));

    expect(el._intervals).toEqual([{ time: 60, duration: 180 }]);
  });

  it("the minus button removes its row", async () => {
    const el = await mount([
      { time: 0, duration: 60 },
      { time: 600, duration: 60 },
    ]);

    qAll(el, "button.btn-del")[0].click();

    expect(el._intervals).toEqual([{ time: 600, duration: 60 }]);
  });

  it("the add button appends an interval", async () => {
    const el = await mount([]);

    q(el, "button.ps-add").click();

    expect(el._intervals).toEqual([{ time: 0, duration: 60 }]);
  });

  it("the save button sends the schedule", async () => {
    const el = await mount([{ time: 0, duration: 60 }]);

    q(el, "button.ps-btn-save").click();
    await Promise.resolve();

    expect(el.hass.callService).toHaveBeenCalledWith(
      "redsea",
      "request",
      expect.objectContaining({ method: "put" }),
    );
  });

  it("clicking the preview asks for the full editor", async () => {
    const el = await mount([{ time: 0, duration: 60 }], { readonly: true });
    el.device = {
      ...makeDevice(),
      entities: { socket_mode: { entity_id: "sensor.m" } },
    };
    el.hass = { ...makeHass(), states: { "sensor.m": { state: "schedule" } } };
    el.requestUpdate();
    await el.updateComplete;

    const seen: any[] = [];
    el.addEventListener("display-dialog", (e: any) => seen.push(e.detail));
    q(el, ".ps-preview").click();

    expect(seen).toHaveLength(1);
    expect(seen[0].type).toBe("socket_schedule");
  });
});

// ─── Optimistic display ─────────────────────────────────────────────────────

describe("PowerSchedule optimistic display", () => {
  /** An element wired to a strip that records pending schedules. */
  function makeWired(attributeSchedule: any, strip: any = {}): any {
    const el = makeElement();
    el.device = {
      socket_id: 1,
      entities: { socket_mode: { entity_id: "sensor.socket_mode" } },
      // The strip is both the pending-schedule holder and the next link in
      // the chain _getDeviceId walks to reach the config entry.
      device: strip
        ? { ...strip, elements: [{ primary_config_entry: "entry-1" }] }
        : null,
    };
    el.hass = makeHass({
      states: {
        "sensor.socket_mode": {
          state: "schedule",
          attributes: { schedule: attributeSchedule },
        },
      },
    });
    return el;
  }

  const stored = { intervals: [{ time: 0, duration: 30 }] };
  const justSaved = [{ time: 600, duration: 60 }];

  it("shows a schedule just written rather than the stored one", () => {
    const el = makeWired(stored, {
      pending_schedule: vi.fn(() => justSaved),
    });

    el._fetchSchedule();

    expect(el._intervals).toEqual(justSaved);
  });

  it("asks the strip about its own socket, with what the device reports", () => {
    const pending_schedule = vi.fn(() => null);
    const el = makeWired(stored, { pending_schedule });

    el._fetchSchedule();

    expect(pending_schedule).toHaveBeenCalledWith(0, JSON.stringify(stored));
  });

  it("falls back to the stored schedule once the device caught up", () => {
    const el = makeWired(stored, { pending_schedule: vi.fn(() => null) });

    el._fetchSchedule();

    expect(el._intervals).toEqual([{ time: 0, duration: 30 }]);
  });

  it("reads the stored schedule when the strip cannot be reached", () => {
    const el = makeWired(stored, null);

    el._fetchSchedule();

    expect(el._intervals).toEqual([{ time: 0, duration: 30 }]);
  });

  it("notes the sent schedule on the strip after a successful save", () => {
    const set_pending_schedule = vi.fn();
    const el = makeWired(stored, { set_pending_schedule });
    el._intervals = [{ time: 600, duration: 60 }];

    return el._saveSchedule().then(() => {
      expect(set_pending_schedule).toHaveBeenCalledWith(
        0,
        [{ time: 600, duration: 60 }],
        JSON.stringify(stored),
      );
    });
  });

  it("takes back the note when the save failed", async () => {
    // A failed write triggers no re-read, so nothing else would ever clear
    // it: the socket would keep showing a programme it never received.
    vi.spyOn(console, "error").mockImplementation(() => {});
    const clear_pending_schedule = vi.fn();
    const el = makeWired(stored, {
      set_pending_schedule: vi.fn(),
      clear_pending_schedule,
    });
    el.hass.callService = vi.fn().mockRejectedValue(new Error("nope"));

    await el._saveSchedule();

    expect(clear_pending_schedule).toHaveBeenCalledWith(0);
  });

  it("saves without a strip to note it on", async () => {
    const el = makeWired(stored, null);

    await expect(el._saveSchedule()).resolves.toBeUndefined();
  });

  it("treats a sensor with no schedule attribute as an empty snapshot", () => {
    const pending_schedule = vi.fn(() => null);
    const el = makeWired(undefined, { pending_schedule });

    el._fetchSchedule();

    expect(pending_schedule).toHaveBeenCalledWith(0, "null");
  });
});
