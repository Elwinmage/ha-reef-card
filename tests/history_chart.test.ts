/**
 * Tests for the `history-chart` element.
 *
 * Two things break a card and are covered first: a hass without `callWS` (no
 * recorder, or a stripped harness) and a websocket call that rejects. Neither
 * may throw — an overlay that cannot draw stays empty rather than taking the
 * card down.
 *
 * The rest covers the multi-series behaviour: one websocket call for every
 * curve, a shared vertical scale, and a missing entity that skips its series
 * instead of blanking the chart.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { HistoryChart } from "../src/base/history_chart";

// jsdom has no ResizeObserver; record the callback so tests can fire it
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
});

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

let counter = 0;

/**
 * Flatten a lit template tree to text.
 *
 * The polygons and polylines are nested TemplateResults inside `.map()`, so
 * joining only the outer strings and values would silently miss them — and an
 * assertion would then pass for the wrong reason.
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

/** A device exposing the given translation_key -> entity_id mapping. */
function makeDevice(entities: Record<string, string>): any {
  return {
    config: { color: "0,0,0", alpha: 1 },
    is_on: () => true,
    get_entity: (key: string) =>
      entities[key] ? { entity_id: entities[key] } : null,
  };
}

function makeChart(conf: Record<string, any> = {}, entities?: any): any {
  const tag = `history-chart-test-${counter++}`;
  class T extends HistoryChart {}
  customElements.define(tag, T);
  const el: any = new T();
  el.conf = { name: "usage", type: "history-chart", ...conf };
  el.device = makeDevice(
    entities ?? { usage: "sensor.usage", average: "sensor.average" },
  );
  el.stateObj = { entity_id: "sensor.usage", state: "120", attributes: {} };
  el.requestUpdate = vi.fn();
  return el;
}

/** Websocket answer in the compressed format the current core sends. */
function makeAnswer(
  rows: Record<string, Array<[number, string | number]>>,
): any {
  const out: any = {};
  for (const [entity_id, samples] of Object.entries(rows)) {
    out[entity_id] = samples.map(([lu, s]) => ({ lu, s: String(s) }));
  }
  return out;
}

//----------------------------------------------------------------------------//
//   parse_history
//----------------------------------------------------------------------------//

describe("HistoryChart.parse_history", () => {
  it("reads the compressed format", () => {
    const points = HistoryChart.parse_history(
      makeAnswer({
        "sensor.usage": [
          [1000, 0],
          [2000, 50],
        ],
      }),
      "sensor.usage",
    );
    expect(points).toEqual([
      { t: 1000000, v: 0 },
      { t: 2000000, v: 50 },
    ]);
  });

  it("reads the verbose format of older cores", () => {
    const answer = {
      "sensor.usage": [
        { state: "10", last_updated: "2026-08-20T10:00:00+00:00" },
        { state: "20", last_updated: "2026-08-20T11:00:00+00:00" },
      ],
    };
    const points = HistoryChart.parse_history(answer, "sensor.usage");
    expect(points).toHaveLength(2);
    expect(points[0]!.v).toBe(10);
    expect(points[1]!.t).toBeGreaterThan(points[0]!.t);
  });

  it("drops non-numeric states", () => {
    // A numeric sensor does reach unknown/unavailable; plotting those as 0
    // would draw a dip that never happened.
    const points = HistoryChart.parse_history(
      makeAnswer({
        "sensor.usage": [
          [1000, 10],
          [1100, "unavailable"],
          [1200, "unknown"],
          [1300, 20],
        ],
      }),
      "sensor.usage",
    );
    expect(points.map((p) => p.v)).toEqual([10, 20]);
  });

  it("drops rows with an unusable timestamp", () => {
    const answer = {
      "sensor.usage": [
        { s: "10", lu: 1000 },
        { s: "20", last_updated: "not-a-date" },
        null,
        "junk",
      ],
    };
    expect(HistoryChart.parse_history(answer, "sensor.usage")).toEqual([
      { t: 1000000, v: 10 },
    ]);
  });

  it("sorts the samples oldest first", () => {
    const points = HistoryChart.parse_history(
      makeAnswer({
        "sensor.usage": [
          [3000, 30],
          [1000, 10],
          [2000, 20],
        ],
      }),
      "sensor.usage",
    );
    expect(points.map((p) => p.v)).toEqual([10, 20, 30]);
  });

  it("returns nothing for an answer without the entity", () => {
    expect(HistoryChart.parse_history({}, "sensor.usage")).toEqual([]);
    expect(HistoryChart.parse_history(null, "sensor.usage")).toEqual([]);
    expect(
      HistoryChart.parse_history({ "sensor.usage": "nope" }, "sensor.usage"),
    ).toEqual([]);
  });
});

//----------------------------------------------------------------------------//
//   series_config
//----------------------------------------------------------------------------//

describe("HistoryChart.series_config", () => {
  it("falls back to the element's own name when no entities are declared", () => {
    const series = makeChart().series_config();
    expect(series.map((s: any) => s.entity_id)).toEqual(["sensor.usage"]);
  });

  it("resolves a list of translation keys", () => {
    const series = makeChart({
      entities: ["usage", "average"],
    }).series_config();
    expect(series.map((s: any) => s.entity_id)).toEqual([
      "sensor.usage",
      "sensor.average",
    ]);
  });

  it("resolves objects and keeps their per-series options", () => {
    const series = makeChart({
      entities: [
        { entity: "usage", color: "#f00", stroke_width: 4 },
        { entity: "average", color: "#0f0" },
      ],
      stroke_width: 2,
    }).series_config();
    expect(series[0].color).toBe("#f00");
    expect(series[0].stroke_width).toBe(4);
    expect(series[1].color).toBe("#0f0");
    // Falls back to the chart-level default.
    expect(series[1].stroke_width).toBe(2);
  });

  it("skips an entity the device does not expose", () => {
    // A mapping is written for the full entity set: a firmware that omits one
    // sensor must lose that curve, not the whole chart.
    const series = makeChart({
      entities: ["usage", "missing"],
    }).series_config();
    expect(series.map((s: any) => s.entity_id)).toEqual(["sensor.usage"]);
  });

  it("skips an entry with no entity at all", () => {
    const series = makeChart({
      entities: ["usage", {}, null, ""],
    }).series_config();
    expect(series).toHaveLength(1);
  });

  it("fills only the series that ask for it in the multi-series form", () => {
    const series = makeChart({
      entities: [
        { entity: "usage", fill: true, fill_color: "rgba(1,2,3,0.2)" },
        { entity: "average" },
      ],
    }).series_config();
    expect(series[0].fill).toBe("rgba(1,2,3,0.2)");
    expect(series[1].fill).toBe("none");
  });

  it("keeps the single-series form filling from colors.fill", () => {
    // Backwards compatibility: the one-curve form used to fill by default.
    const series = makeChart({
      colors: { fill: "rgba(9,9,9,0.3)" },
    }).series_config();
    expect(series[0].fill).toBe("rgba(9,9,9,0.3)");
  });

  it("uses the chart fill when a series opts in without its own colour", () => {
    const series = makeChart({
      entities: [{ entity: "usage", fill: true }, { entity: "average" }],
      colors: { fill: "rgba(4,5,6,0.4)" },
    }).series_config();
    expect(series[0].fill).toBe("rgba(4,5,6,0.4)");
    expect(series[1].fill).toBe("none");
  });

  it("lets a series colour its area without opting in explicitly", () => {
    const series = makeChart({
      entities: [{ entity: "usage", fill_color: "rgba(7,8,9,0.5)" }],
    }).series_config();
    expect(series[0].fill).toBe("rgba(7,8,9,0.5)");
  });

  it("resolves the element's own entity when the device lookup fails", () => {
    const el = makeChart();
    el.device = { config: {}, is_on: () => true };
    expect(el.series_config()[0].entity_id).toBe("sensor.usage");
  });
});

describe("HistoryChart.series_fill", () => {
  // Three curves stacked on filled areas hide each other, so the multi-series
  // form only fills on request while the single-series form keeps its old
  // fill-by-default behaviour.
  it("prefers an explicit fill_color", () => {
    expect(HistoryChart.series_fill({ fill_color: "#abc" }, "#def", true)).toBe(
      "#abc",
    );
    expect(
      HistoryChart.series_fill({ fill_color: "#abc" }, "#def", false),
    ).toBe("#abc");
  });

  it("uses the chart fill when the series opts in", () => {
    expect(HistoryChart.series_fill({ fill: true }, "#def", true)).toBe("#def");
  });

  it("does not fill an opted-out series in the multi form", () => {
    expect(HistoryChart.series_fill({}, "#def", true)).toBe("none");
    expect(HistoryChart.series_fill({ fill: false }, "#def", true)).toBe(
      "none",
    );
  });

  it("fills by default in the single-series form", () => {
    expect(HistoryChart.series_fill({}, "#def", false)).toBe("#def");
  });
});

//----------------------------------------------------------------------------//
//   Scale and grid maths
//----------------------------------------------------------------------------//

function series_of(points: any[], extra: any = {}): any {
  return {
    entity_id: extra.entity_id ?? "sensor.usage",
    color: extra.color ?? "#fff",
    fill: extra.fill ?? "none",
    stroke_width: extra.stroke_width ?? 2,
    points,
  };
}

describe("HistoryChart.drawable_series", () => {
  it("keeps a series with a single sample", () => {
    // A counter holds its value between changes, so one sample is an honest
    // flat line. A day that has seen a single fill must not draw nothing.
    const el = makeChart();
    el.series = [series_of([{ t: 1, v: 1 }])];
    expect(el.drawable_series()).toHaveLength(1);
  });

  it("drops a series with no sample at all", () => {
    const el = makeChart();
    el.series = [series_of([])];
    expect(el.drawable_series()).toEqual([]);
  });

  it("drops only the series that is empty", () => {
    const el = makeChart();
    el.series = [
      series_of([
        { t: 0, v: 0 },
        { t: 100, v: 10 },
      ]),
      series_of([], { entity_id: "sensor.average" }),
    ];
    expect(el.drawable_series()).toHaveLength(1);
  });

  it("honours a configured min_points", () => {
    const el = makeChart({ min_points: 5 });
    el.series = [
      series_of([
        { t: 0, v: 0 },
        { t: 100, v: 10 },
      ]),
    ];
    expect(el.drawable_series()).toEqual([]);
  });
});

describe("HistoryChart.build_scale", () => {
  it("anchors the scale at zero by default", () => {
    // A consumption counter going 40 -> 50 has risen by a quarter, not from
    // the floor to the ceiling: a min-anchored scale would exaggerate it.
    const el = makeChart();
    const scale = el.build_scale([
      series_of([
        { t: 0, v: 40 },
        { t: 100, v: 50 },
      ]),
    ]);
    expect(scale.low).toBe(0);
    expect(scale.range).toBe(50);
  });

  it("anchors on the lowest sample when asked", () => {
    const el = makeChart({ baseline: "min" });
    const scale = el.build_scale([
      series_of([
        { t: 0, v: 40 },
        { t: 100, v: 50 },
      ]),
    ]);
    expect(scale.low).toBe(40);
    expect(scale.range).toBe(10);
  });

  it("takes the value range from every series at once", () => {
    // Per-series scales would line up two unrelated curves as if they were
    // comparable — the whole reason to put them on one chart.
    const el = makeChart();
    const scale = el.build_scale([
      series_of([
        { t: 0, v: 0 },
        { t: 100, v: 100 },
      ]),
      series_of(
        [
          { t: 50, v: 20 },
          { t: 300, v: 20 },
        ],
        { entity_id: "sensor.average" },
      ),
    ]);
    expect(scale.range).toBe(100);
  });

  it("takes the time span from the window, not from the samples", () => {
    // A day that has only run to 17h must still show its full 24 hours, with
    // the curve stopping where the data stops.
    const el = makeChart({ hours: 6 });
    const scale = el.build_scale([
      series_of([
        { t: Date.now() - 1000, v: 0 },
        { t: Date.now(), v: 100 },
      ]),
    ]);
    expect(scale.span).toBe(6 * 3600 * 1000);
  });

  it("survives a flat counter without dividing by zero", () => {
    const el = makeChart({ baseline: "min" });
    const scale = el.build_scale([
      series_of([
        { t: 0, v: 7 },
        { t: 100, v: 7 },
      ]),
    ]);
    expect(scale.range).toBe(1);
  });

  it("never produces a zero span", () => {
    // A zero-length window would divide by zero when projecting.
    const el = makeChart();
    vi.spyOn(el, "display_window").mockReturnValue({ start: 500, end: 500 });
    const scale = el.build_scale([
      series_of([
        { t: 500, v: 0 },
        { t: 500, v: 10 },
      ]),
    ]);
    expect(scale.span).toBe(1);
  });
});

describe("HistoryChart.display_window", () => {
  it("spans the calendar day in today mode", () => {
    const el = makeChart({ window: "today" });
    const { start, end } = el.display_window();
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    expect(start).toBe(midnight.getTime());
    expect(end - start).toBe(24 * 3600 * 1000);
    // The window runs to tomorrow's midnight, past the present.
    expect(end).toBeGreaterThan(Date.now());
  });

  it("spans the last `hours` hours by default", () => {
    const el = makeChart({ hours: 6 });
    const { start, end } = el.display_window();
    expect(end - start).toBe(6 * 3600 * 1000);
    // The newest instant is the present, not tomorrow.
    expect(Math.abs(end - Date.now())).toBeLessThan(2000);
  });
});

describe("HistoryChart.font_size", () => {
  it("defaults to 9 pixels", () => {
    expect(makeChart().font_size(300)).toBe(9);
  });

  it("takes the configured size", () => {
    expect(makeChart({ font_size: 14 }).font_size(300)).toBe(14);
  });

  it("ignores an unusable value", () => {
    expect(makeChart({ font_size: 0 }).font_size(300)).toBe(9);
    expect(makeChart({ font_size: -4 }).font_size(300)).toBe(9);
    expect(makeChart({ font_size: "big" }).font_size(300)).toBe(9);
  });

  it("drops two pixels on a narrow box, never below six", () => {
    // Shrinking the labels buys back more room than dropping a grid line.
    expect(makeChart().font_size(150)).toBe(7);
    expect(makeChart({ font_size: 14 }).font_size(150)).toBe(12);
    expect(makeChart({ font_size: 6 }).font_size(150)).toBe(6);
  });
});

describe("HistoryChart.measure_gutter", () => {
  const scale = { first: 0, span: 1000, low: 0, range: 1000 };

  it("widens for longer labels", () => {
    const el = makeChart({ unit: " mL" });
    const bare = makeChart();
    const ctx = makeCtx();
    expect(el.measure_gutter(ctx, scale, 9)).toBeGreaterThan(
      bare.measure_gutter(ctx, scale, 9),
    );
  });

  it("falls back to an estimate without measureText", () => {
    // A canvas stub with no measureText must not collapse the gutter to
    // nothing, which would draw the labels off the left edge.
    const el = makeChart();
    const ctx: any = {};
    expect(el.measure_gutter(ctx, scale, 9)).toBeGreaterThan(0);
  });
});

describe("HistoryChart.nice_step", () => {
  // Round numbers on the axis rather than whatever the range divides into.
  it("picks a round step", () => {
    expect(HistoryChart.nice_step(100, 4)).toBe(20);
    expect(HistoryChart.nice_step(10, 4)).toBe(2);
    expect(HistoryChart.nice_step(1000, 4)).toBe(200);
  });

  it("covers every rounding bracket", () => {
    // norm <= 1.5 / 3 / 7 / above, in that order.
    expect(HistoryChart.nice_step(4, 4)).toBe(1);
    expect(HistoryChart.nice_step(10, 4)).toBe(2);
    expect(HistoryChart.nice_step(20, 4)).toBe(5);
    expect(HistoryChart.nice_step(36, 4)).toBe(10);
  });

  it("never returns zero", () => {
    // A zero step would spin the grid loop forever.
    expect(HistoryChart.nice_step(0, 4)).toBeGreaterThan(0);
  });
});

//----------------------------------------------------------------------------//
//   Canvas drawing
//----------------------------------------------------------------------------//

/** Records every 2D context call, so the drawing can be asserted on. */
function makeCtx(): any {
  const calls: any[] = [];
  const ctx: any = {
    calls,
    scale: (...a: any[]) => calls.push(["scale", ...a]),
    clearRect: (...a: any[]) => calls.push(["clearRect", ...a]),
    fillRect: (...a: any[]) => calls.push(["fillRect", ...a]),
    beginPath: () => calls.push(["beginPath"]),
    closePath: () => calls.push(["closePath"]),
    moveTo: (...a: any[]) => calls.push(["moveTo", ...a]),
    lineTo: (...a: any[]) => calls.push(["lineTo", ...a]),
    stroke: () => calls.push(["stroke"]),
    fill: () => calls.push(["fill"]),
    fillText: (...a: any[]) => calls.push(["fillText", ...a]),
    // Width follows the font actually set, otherwise the stub cannot show a
    // gutter that widens with the font size.
    measureText: (t: string) => ({
      width: t.length * (parseFloat(ctx.font) || 10) * 0.6,
    }),
  };
  return ctx;
}

/**
 * Replace the element's shadowRoot with a stub.
 *
 * `shadowRoot` is a getter on Element, so it cannot simply be assigned.
 */
function stubShadowRoot(el: any, canvas: any): void {
  Object.defineProperty(el, "shadowRoot", {
    configurable: true,
    get: () => ({ querySelector: () => canvas }),
  });
}

/** Give the element a measurable canvas without a real DOM one. */
function attachCanvas(el: any, width = 300, height = 120): any {
  const ctx = makeCtx();
  el._canvas = {
    width: 0,
    height: 0,
    getBoundingClientRect: () => ({ width, height }),
    getContext: () => ctx,
  };
  return ctx;
}

function texts(ctx: any): string[] {
  return ctx.calls
    .filter((c: any) => c[0] === "fillText")
    .map((c: any) => c[1]);
}

describe("HistoryChart.draw", () => {
  it("does nothing without a canvas", () => {
    const el = makeChart();
    el._canvas = null;
    expect(() => el.draw()).not.toThrow();
  });

  it("does nothing on a zero-sized box", () => {
    const el = makeChart();
    const ctx = attachCanvas(el, 0, 0);
    el.draw();
    expect(ctx.calls).toEqual([]);
  });

  it("does nothing when the context is unavailable", () => {
    // jsdom has no 2D context unless the canvas package is installed, and a
    // card must not break because of it.
    const el = makeChart();
    el._canvas = {
      getBoundingClientRect: () => ({ width: 300, height: 120 }),
      getContext: () => null,
    };
    expect(() => el.draw()).not.toThrow();
  });

  it("draws no axis while there is nothing read yet", () => {
    // An axis around a void reads as "no consumption today"; the panel is
    // painted, the grid is not.
    const el = makeChart({ bg_color: "255,255,255,0.35" });
    const ctx = attachCanvas(el);
    el.series = [];
    el.draw();
    expect(ctx.calls.some((c: any) => c[0] === "fillRect")).toBe(true);
    expect(texts(ctx)).toEqual([]);
  });

  it("skips the panel when no bg_color is configured", () => {
    const el = makeChart();
    const ctx = attachCanvas(el);
    el.draw();
    expect(ctx.calls.some((c: any) => c[0] === "fillRect")).toBe(false);
  });

  it("gives up on a box too small for the padding", () => {
    // 20px wide is narrower than the y-axis gutter alone.
    const el = makeChart();
    const ctx = attachCanvas(el, 20, 10);
    el.series = [
      series_of([
        { t: 0, v: 0 },
        { t: 100, v: 10 },
      ]),
    ];
    el.draw();
    expect(texts(ctx)).toEqual([]);
  });

  it("scales for the device pixel ratio", () => {
    const el = makeChart();
    const ctx = attachCanvas(el);
    el.draw();
    expect(ctx.calls[0][0]).toBe("scale");
  });

  it("honours the device pixel ratio", () => {
    // The canvas backing store is sized in device pixels, otherwise the whole
    // drawing is blurry on a high-DPI screen.
    const original = window.devicePixelRatio;
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 2,
    });
    try {
      const el = makeChart();
      const ctx = attachCanvas(el, 300, 120);
      el.draw();
      expect(el._canvas.width).toBe(600);
      expect(ctx.calls[0]).toEqual(["scale", 2, 2]);
    } finally {
      Object.defineProperty(window, "devicePixelRatio", {
        configurable: true,
        value: original,
      });
    }
  });

  it("falls back to a ratio of 1", () => {
    const original = window.devicePixelRatio;
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 0,
    });
    try {
      const el = makeChart();
      const ctx = attachCanvas(el, 300, 120);
      el.draw();
      expect(ctx.calls[0]).toEqual(["scale", 1, 1]);
    } finally {
      Object.defineProperty(window, "devicePixelRatio", {
        configurable: true,
        value: original,
      });
    }
  });

  it("holds the last value up to the present", () => {
    // Otherwise the curve stops at the last recorded change, which on a
    // counter filling twice a day reads as if the device had gone silent.
    const el = makeChart({ hours: 6 });
    const ctx = attachCanvas(el, 300, 120);
    const now = Date.now();
    el.series = [
      series_of([
        { t: now - 5 * 3600 * 1000, v: 0 },
        { t: now - 4 * 3600 * 1000, v: 10 },
      ]),
    ];
    el.draw();
    const xs = ctx.calls
      .filter((c: any) => c[0] === "lineTo")
      .map((c: any) => c[1]);
    // The curve reaches the right-hand edge of the plot area, not the x of
    // the last sample two thirds of the way in.
    expect(Math.max(...xs)).toBeGreaterThan(280);
  });

  it("draws a lone sample as a flat line", () => {
    const el = makeChart({ hours: 6 });
    const ctx = attachCanvas(el, 300, 120);
    el.series = [series_of([{ t: Date.now() - 3600 * 1000, v: 42 }])];
    el.draw();
    expect(
      ctx.calls.filter((c: any) => c[0] === "stroke").length,
    ).toBeGreaterThan(0);
  });

  it("reserves more room on the left for a bigger font", () => {
    // The gutter is measured, not fixed: at 14px the labels would otherwise
    // run off the edge of the box.
    const xs = (size: number) => {
      const el = makeChart({ font_size: size, unit: " mL" });
      const ctx = attachCanvas(el, 300, 120);
      el.series = [
        series_of([
          { t: Date.now() - 3600 * 1000, v: 0 },
          { t: Date.now(), v: 1000 },
        ]),
      ];
      el.draw();
      return ctx.calls
        .filter((c: any) => c[0] === "fillText" && String(c[1]).endsWith("mL"))
        .map((c: any) => c[2]);
    };
    // Y labels are right-aligned on the gutter edge, so a wider gutter pushes
    // their x further right. Only they are looked at: the x labels are
    // centred and reach the right edge whatever the gutter does.
    expect(Math.max(...xs(14))).toBeGreaterThan(Math.max(...xs(8)));
  });

  it("labels both axes", () => {
    const el = makeChart({ unit: " mL" });
    const ctx = attachCanvas(el);
    const now = Date.now();
    el.series = [
      series_of([
        { t: now - 3600 * 1000, v: 0 },
        { t: now, v: 100 },
      ]),
    ];
    el.draw();
    const labels = texts(ctx);
    expect(labels.some((t) => t.endsWith("h"))).toBe(true);
    expect(labels.some((t) => t.endsWith(" mL"))).toBe(true);
  });

  it("draws one stroke per series plus the grid", () => {
    const el = makeChart();
    const ctx = attachCanvas(el);
    const now = Date.now();
    el.series = [
      series_of([
        { t: now - 1000, v: 0 },
        { t: now, v: 10 },
      ]),
      series_of(
        [
          { t: now - 1000, v: 5 },
          { t: now, v: 5 },
        ],
        { entity_id: "sensor.average" },
      ),
    ];
    el.draw();
    const strokes = ctx.calls.filter((c: any) => c[0] === "stroke").length;
    // Grid lines and axes, then one stroke for each of the two curves.
    expect(strokes).toBeGreaterThanOrEqual(2);
  });

  it("fills only the series that asked for an area", () => {
    const el = makeChart();
    const ctx = attachCanvas(el);
    const now = Date.now();
    el.series = [
      series_of(
        [
          { t: now - 1000, v: 0 },
          { t: now, v: 10 },
        ],
        { fill: "rgba(1,2,3,0.2)" },
      ),
      series_of(
        [
          { t: now - 1000, v: 5 },
          { t: now, v: 5 },
        ],
        { entity_id: "sensor.average" },
      ),
    ];
    el.draw();
    expect(ctx.calls.filter((c: any) => c[0] === "fill")).toHaveLength(1);
  });

  it("thins the grid and the font on a narrow box", () => {
    // The whole point of this element over a native card: it stays legible in
    // a box a statistics-graph would refuse to shrink into.
    const wide = makeChart();
    const wide_ctx = attachCanvas(wide, 400, 120);
    const narrow = makeChart();
    const narrow_ctx = attachCanvas(narrow, 150, 60);
    const now = Date.now();
    const points = [
      { t: now - 12 * 3600 * 1000, v: 0 },
      { t: now, v: 100 },
    ];
    wide.series = [series_of(points)];
    narrow.series = [series_of(points)];
    wide.draw();
    narrow.draw();
    expect(texts(narrow_ctx).length).toBeLessThan(texts(wide_ctx).length);
  });

  it("draws a staircase by default and a diagonal when asked", () => {
    const now = Date.now();
    const points = [
      { t: now - 3000, v: 0 },
      { t: now - 2000, v: 5 },
      { t: now - 1000, v: 10 },
    ];

    const stepped = makeChart();
    const stepped_ctx = attachCanvas(stepped);
    stepped.series = [series_of(points)];
    stepped.draw();

    const straight = makeChart({ step: false });
    const straight_ctx = attachCanvas(straight);
    straight.series = [series_of(points)];
    straight.draw();

    const count = (ctx: any) =>
      ctx.calls.filter((c: any) => c[0] === "lineTo").length;
    // The staircase inserts one extra corner per sample.
    expect(count(stepped_ctx)).toBeGreaterThan(count(straight_ctx));
  });
});

//----------------------------------------------------------------------------//
//   fetch_history
//----------------------------------------------------------------------------//

describe("HistoryChart.fetch_history", () => {
  let el: any;

  beforeEach(() => {
    el = makeChart({ entities: ["usage", "average"], refresh: 0 });
  });

  it("does nothing without a hass able to call the websocket", async () => {
    el._hass = { states: {} };
    await el.fetch_history();
    expect(el.series).toEqual([]);
  });

  it("does nothing when no series resolves", async () => {
    el.conf.entities = ["missing"];
    el._hass = { states: {}, callWS: vi.fn() };
    await el.fetch_history();
    expect(el._hass.callWS).not.toHaveBeenCalled();
  });

  it("asks for every entity in a single call", async () => {
    // Two round trips for one chart would be wasteful and could return
    // misaligned windows.
    const callWS = vi.fn().mockResolvedValue(makeAnswer({}));
    el._hass = { states: {}, callWS };
    await el.fetch_history();

    expect(callWS).toHaveBeenCalledTimes(1);
    const sent = callWS.mock.calls[0]![0];
    expect(sent.type).toBe("history/history_during_period");
    expect(sent.entity_ids).toEqual(["sensor.usage", "sensor.average"]);
    expect(sent.minimal_response).toBe(true);
  });

  it("asks for the configured window", async () => {
    const callWS = vi.fn().mockResolvedValue(makeAnswer({}));
    el._hass = { states: {}, callWS };
    el.conf.hours = 6;
    await el.fetch_history();
    const sent = callWS.mock.calls[0]![0];
    const span = Date.parse(sent.end_time) - Date.parse(sent.start_time);
    expect(Math.round(span / 3600000)).toBe(6);
  });

  it("never asks the recorder beyond the present", async () => {
    // A "today" window runs to tomorrow's midnight, where there is nothing to
    // read yet.
    const callWS = vi.fn().mockResolvedValue(makeAnswer({}));
    el._hass = { states: {}, callWS };
    el.conf.window = "today";
    await el.fetch_history();
    const sent = callWS.mock.calls[0]![0];
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    expect(Date.parse(sent.start_time)).toBe(midnight.getTime());
    expect(Date.parse(sent.end_time)).toBeLessThanOrEqual(Date.now() + 2000);
  });

  it("defaults to a 24 hour window on a bad `hours`", () => {
    expect(makeChart({ hours: 0 }).hours).toBe(24);
    expect(makeChart({ hours: -3 }).hours).toBe(24);
    expect(makeChart({ hours: "nope" }).hours).toBe(24);
    expect(makeChart({ hours: 6 }).hours).toBe(6);
  });

  it("splits the answer across the series", async () => {
    const callWS = vi.fn().mockResolvedValue(
      makeAnswer({
        "sensor.usage": [
          [1000, 5],
          [2000, 9],
        ],
        "sensor.average": [[1000, 7]],
      }),
    );
    el._hass = { states: {}, callWS };
    await el.fetch_history();
    expect(el.series[0].points.map((p: any) => p.v)).toEqual([5, 9]);
    expect(el.series[1].points.map((p: any) => p.v)).toEqual([7]);
  });

  it("reports what it resolved when debug is on", async () => {
    // The only way to tell an unresolved entity from an empty recorder
    // without attaching a debugger to the browser.
    const callWS = vi
      .fn()
      .mockResolvedValue(makeAnswer({ "sensor.usage": [[1000, 5]] }));
    el._hass = { states: {}, callWS };
    el.conf.debug = true;
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await el.fetch_history();
    expect(info).toHaveBeenCalled();
    expect(String(info.mock.calls[0])).toContain("sensor.usage: 1 point(s)");
    info.mockRestore();
  });

  it("stays quiet when debug is off", async () => {
    const callWS = vi.fn().mockResolvedValue(makeAnswer({}));
    el._hass = { states: {}, callWS };
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await el.fetch_history();
    expect(info).not.toHaveBeenCalled();
    info.mockRestore();
  });

  it("keeps the card alive when the websocket rejects", async () => {
    // Recorder disabled, or the entities excluded from it.
    const callWS = vi.fn().mockRejectedValue(new Error("no recorder"));
    el._hass = { states: {}, callWS };
    el.series = [
      {
        entity_id: "x",
        color: "#fff",
        fill: "none",
        stroke_width: 2,
        points: [],
      },
    ];
    await expect(el.fetch_history()).resolves.toBeUndefined();
    expect(el.series).toEqual([]);
  });

  it("does not read twice inside the refresh window", async () => {
    const callWS = vi.fn().mockResolvedValue(makeAnswer({}));
    el._hass = { states: {}, callWS };
    el.conf.refresh = 60;
    await el.fetch_history();
    await el.fetch_history();
    expect(callWS).toHaveBeenCalledTimes(1);
  });

  it("reads again once the refresh window has passed", async () => {
    const callWS = vi.fn().mockResolvedValue(makeAnswer({}));
    el._hass = { states: {}, callWS };
    await el.fetch_history();
    await el.fetch_history();
    expect(callWS).toHaveBeenCalledTimes(2);
  });

  it("re-reads when a second series moves, not only the first", async () => {
    // The element's own stateObj follows `name` alone; a chart watching only
    // that would go stale whenever the other curve is the one updating.
    const callWS = vi.fn().mockResolvedValue(makeAnswer({}));
    el._hass = {
      states: {
        "sensor.usage": { entity_id: "sensor.usage", state: "120" },
        "sensor.average": { entity_id: "sensor.average", state: "10" },
      },
      callWS,
    };
    await el.fetch_history();
    const before = callWS.mock.calls.length;

    el.hass = {
      states: {
        "sensor.usage": { entity_id: "sensor.usage", state: "120" },
        "sensor.average": { entity_id: "sensor.average", state: "11" },
      },
      callWS,
    };
    await Promise.resolve();
    await Promise.resolve();
    expect(callWS.mock.calls.length).toBeGreaterThan(before);
  });

  it("does not re-read when no state changed", async () => {
    const callWS = vi.fn().mockResolvedValue(makeAnswer({}));
    const states = {
      "sensor.usage": { entity_id: "sensor.usage", state: "120" },
      "sensor.average": { entity_id: "sensor.average", state: "10" },
    };
    el._hass = { states, callWS };
    await el.fetch_history();
    const before = callWS.mock.calls.length;

    el.hass = { states, callWS };
    await Promise.resolve();
    expect(callWS.mock.calls.length).toBe(before);
  });
});

//----------------------------------------------------------------------------//
//   Lifecycle
//----------------------------------------------------------------------------//

describe("HistoryChart lifecycle", () => {
  it("reads as soon as it is attached", async () => {
    const callWS = vi.fn().mockResolvedValue(makeAnswer({}));
    const el = makeChart();
    el._hass = { states: {}, callWS };
    document.body.appendChild(el);
    await Promise.resolve();
    await Promise.resolve();
    expect(callWS).toHaveBeenCalled();
    el.remove();
  });

  it("exposes the hass it was given", () => {
    const el = makeChart();
    const hass = { states: {}, callWS: vi.fn() };
    el.hass = hass;
    expect(el.hass).toBe(hass);
  });

  it("has an empty signature without a hass", () => {
    const el = makeChart();
    el._hass = null;
    expect(el._states_signature()).toBe("");
  });
});

describe("HistoryChart.firstUpdated", () => {
  it("observes the canvas when the browser supports it", () => {
    const el = makeChart();
    const canvas = { getBoundingClientRect: () => ({ width: 0, height: 0 }) };
    stubShadowRoot(el, canvas);
    el.firstUpdated();
    const observer = (globalThis as any).ResizeObserver.last;
    expect(observer.observe).toHaveBeenCalled();

    // The observer callback is what redraws when the card is resized.
    const ctx = attachCanvas(el, 300, 120);
    observer.cb();
    expect(ctx.calls.length).toBeGreaterThan(0);

    el.disconnectedCallback();
    expect(el._ro).toBeNull();
  });

  it("still works where ResizeObserver does not exist", () => {
    // A chart that cannot follow its box is worse than one that does, but it
    // must not take the card down with it.
    const original = (globalThis as any).ResizeObserver;
    (globalThis as any).ResizeObserver = undefined;
    try {
      const el = makeChart();
      stubShadowRoot(el, {
        getBoundingClientRect: () => ({ width: 0, height: 0 }),
      });
      expect(() => el.firstUpdated()).not.toThrow();
      expect(el._ro).toBeNull();
    } finally {
      (globalThis as any).ResizeObserver = original;
    }
  });

  it("survives a shadow root with no canvas", () => {
    const el = makeChart();
    stubShadowRoot(el, null);
    expect(() => el.firstUpdated()).not.toThrow();
  });

  it("redraws on update", () => {
    const el = makeChart();
    const ctx = attachCanvas(el);
    el.updated();
    expect(ctx.calls.length).toBeGreaterThan(0);
  });
});

//----------------------------------------------------------------------------//
//   Render
//----------------------------------------------------------------------------//

describe("HistoryChart render", () => {
  it("renders without a style argument", () => {
    const el = makeChart();
    expect(() => renderText(el._render())).not.toThrow();
  });

  it("renders a canvas container carrying the element style", () => {
    const el = makeChart();
    const text = renderText(el._render("width:100%"));
    expect(text).toContain("history-chart-container");
    expect(text).toContain("canvas");
    expect(text).toContain("width:100%");
  });
});
