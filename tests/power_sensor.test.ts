/**
 * Tests for the `power-sensor` element.
 *
 * The component is the unified socket mode editor of a ReefPower socket:
 * On / Off / Schedule / Sensor, each with its own content, written to the
 * device by a single Save button. What matters most is the request sent on
 * save (one per mode, and the right subscription endpoint for a local probe
 * versus a ReefControl probe), and that a failed request is reported in the
 * dialog instead of closing it.
 *
 * The RSControl probes come from the `redsea.get_control_probes` service;
 * the socket's rule is read from the `sensor_config` attribute, in its local
 * or RSControl shape; the requests sent on save replay captures of the Red
 * Sea app. A
 * socket forced on/off by hand out of an automatic mode opens on that mode
 * with a notice and a resume button.
 *
 * The rest covers the probe list built from the hub's answer,
 * the schedule interval editing, the canvas drawing guards and the template
 * wiring, which is exercised through a mounted element so every event handler
 * is really fired.
 *
 * Covers: src/devices/redsea/rspower/power_sensor.ts
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { PowerSensor } from "../src/devices/redsea/rspower/power_sensor";

// ─── Custom element registration ────────────────────────────────────────────

class StubPowerSensor extends PowerSensor {}
if (!customElements.get("stub-power-sensor"))
  customElements.define("stub-power-sensor", StubPowerSensor);

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
  document.body
    .querySelectorAll("stub-power-sensor")
    .forEach((el) => el.remove());
  vi.restoreAllMocks();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/** A canvas 2D context stub that records every call made against it. */
function makeCtx(): any {
  const calls: any[] = [];
  const ctx: any = { calls };
  for (const name of [
    "fillRect",
    "strokeRect",
    "beginPath",
    "moveTo",
    "lineTo",
    "stroke",
    "fillText",
  ]) {
    ctx[name] = (...a: any[]) => calls.push([name, ...a]);
  }
  return ctx;
}

/** Text drawn on the canvas, in order. */
function texts(ctx: any): string[] {
  return ctx.calls
    .filter((c: any) => c[0] === "fillText")
    .map((c: any) => c[1]);
}

/**
 * Give the element a measurable canvas without a real DOM one.
 * `shadowRoot` is a getter on Element, so it is spied rather than assigned.
 */
function attachCanvas(el: any, width = 400, height = 64, ctx: any = makeCtx()) {
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

/**
 * Probes as `redsea.get_control_probes` reports them for a real hub
 * (trimmed to the fields the editor reads).
 */
const HUB_PROBES = [
  {
    type: "ec",
    uid: "0x007BF",
    name: "Salinity temp",
    status: "auto",
    temp_value: 29.2,
  },
  {
    type: "temperature",
    uid: "0x000F7",
    name: "Temperature",
    status: "disconnected",
  },
  {
    type: "ato",
    uid: "0x0024E",
    name: "ATO",
    status: "auto",
    temp_value: 28.6,
  },
  { type: "leak", uid: "0x0032B", name: "Leak", status: "setup" },
  {
    type: "ato",
    uid: "0x0097E",
    name: "ATO",
    status: "auto",
    temp_value: 25.2,
  },
  {
    type: "ph",
    uid: "0x00B39",
    name: "pH",
    status: "disconnected",
    temp_value: 28,
  },
  { type: "orp", uid: "0x0071F", name: "ORP", status: "disconnected" },
];

/**
 * The hub's GET /subscription-info after the app configured all six
 * sockets: the integration copies each socket's rule into the
 * `sensor_config` attribute of its socket_mode entity.
 */
const HUB_RULES = [
  {
    number: 0,
    type: "ph",
    uid: "0x00B39",
    trigger_op: false,
    last_sock_op: "on",
    sensor: "primary",
    value: 8.199999809265137,
    is_above: true,
    hysteresis: 0.5,
  },
  {
    number: 1,
    type: "orp",
    uid: "0x0071F",
    trigger_op: false,
    last_sock_op: "on",
    sensor: "primary",
    value: 420,
    is_above: true,
    hysteresis: 25,
  },
  {
    number: 2,
    type: "ec",
    uid: "0x007BF",
    trigger_op: false,
    last_sock_op: "on",
    sensor: "primary",
    value: 53.0999984741211,
    is_above: true,
    hysteresis: 0.9800000190734863,
  },
  {
    number: 3,
    type: "temperature",
    uid: "0x000F7",
    trigger_op: false,
    last_sock_op: "off",
    sensor: "primary",
    value: 25,
    is_above: true,
    hysteresis: 0.5,
  },
  {
    number: 4,
    type: "ato",
    uid: "0x0097E",
    trigger_op: false,
    last_sock_op: "off",
    sensor: "temperature",
    value: 25,
    is_above: true,
    hysteresis: 0.5,
  },
  {
    number: 5,
    type: "ato",
    uid: "0x0024E",
    last_sock_op: "on",
    sensor: "primary",
  },
];

interface SetupOptions {
  mode?: string | null;
  prevMode?: string | null;
  name?: string | null;
  temperature?: string | null;
  schedule?: any;
  sensorConfig?: any;
  control?: boolean;
  hubName?: string;
  /** Config entry of the paired RSControl; null leaves it unknown. */
  controlEntry?: string | null;
  /** Answer of get_control_probes; preloaded unless `fetched` is false. */
  probes?: any[];
  /** `sensor_source` attribute of socket_mode ("local" / "control"). */
  sensorSource?: string;
  fetched?: boolean;
  entry?: string | null;
}

/**
 * A socket, its power strip and the matching hass object.
 *
 * The socket entities are keyed by translation key as PowerSocket stores
 * them; a null option leaves the entity out entirely.
 */
function makeSetup(opts: SetupOptions = {}) {
  const {
    mode = "on",
    prevMode = null,
    name = "Heater",
    temperature = "25.1",
    schedule,
    sensorConfig,
    control = false,
    hubName = "Hub",
    controlEntry = "ctl-entry",
    probes = [],
    sensorSource,
    entry = "entry-1",
  } = opts;

  const entities: Record<string, any> = {};
  const states: Record<string, any> = {};
  if (mode !== null) {
    entities.socket_mode = { entity_id: "sensor.mode" };
    states["sensor.mode"] = {
      state: mode,
      attributes: {
        schedule,
        sensor_config: sensorConfig,
        sensor_source: sensorSource,
      },
    };
  }
  if (prevMode !== null) {
    entities.socket_prev_mode = { entity_id: "sensor.prev" };
    states["sensor.prev"] = { state: prevMode };
  }
  if (name !== null) {
    entities.socket_name = { entity_id: "sensor.name" };
    states["sensor.name"] = { state: name };
  }
  if (temperature !== null) {
    entities.power_temperature = { entity_id: "sensor.temp" };
    states["sensor.temp"] = { state: temperature };
  }

  const strip = {
    elements: entry ? [{ primary_config_entry: entry }] : [],
    has_control_link: () => control,
    linked_control_hwid: () => (control ? "d4e9f4e89208" : null),
    linked_control_name: () => hubName,
    linked_control_device: () =>
      control ? { primary_config_entry: controlEntry } : null,
  };
  const socket = { socket_id: 2, entities, device: strip };
  const hass = {
    states,
    callService: vi.fn().mockResolvedValue(undefined),
    callWS: vi.fn().mockResolvedValue({ response: { probes } }),
  };
  return { socket, strip, hass };
}

/**
 * An element wired to a setup, built without being connected. The hub
 * probes are preloaded, as after a completed fetch, unless `fetched` is false.
 */
function makeElement(opts: SetupOptions = {}): any {
  const { socket, hass } = makeSetup(opts);
  const el = new StubPowerSensor() as any;
  el.device = socket;
  el.hass = hass;
  if (opts.control && opts.fetched !== false) {
    el._controlProbes = opts.probes ?? [];
    el._controlProbesHwid = "d4e9f4e89208";
  }
  return el;
}

/** An element wired to a setup and mounted, after its first render. */
async function mount(opts: SetupOptions = {}): Promise<any> {
  const el = makeElement(opts);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** Let pending promises (the probe fetch) settle, then re-render. */
async function settle(el: any): Promise<void> {
  for (let i = 0; i < 3; i++) await Promise.resolve();
  await el.updateComplete;
}

/** Buttons of the rendered element, matched on their text. */
function button(el: any, text: string): HTMLButtonElement {
  const found = Array.from(
    el.shadowRoot.querySelectorAll("button") as NodeListOf<HTMLButtonElement>,
  ).find((b) => b.textContent!.trim().includes(text));
  if (!found) throw new Error(`button "${text}" not found`);
  return found;
}

/** Last request sent to the integration. */
function lastRequest(el: any): any {
  const calls = el.hass.callService.mock.calls;
  return calls[calls.length - 1][2];
}

// ─── Configuration and lifecycle ────────────────────────────────────────────

describe("PowerSensor lifecycle", () => {
  it("setConfig() stores the configuration", () => {
    const el = new StubPowerSensor() as any;
    el.setConfig({ name: "x" });
    expect(el.conf).toEqual({ name: "x" });
  });

  it.each(["on", "off", "schedule", "sensor"])(
    "starts in the socket's current mode (%s)",
    async (mode) => {
      const el = await mount({ mode });
      expect(el._mode).toBe(mode);
    },
  );

  it("falls back to On for an unknown or missing mode", async () => {
    expect((await mount({ mode: "manual" }))._mode).toBe("on");
    expect((await mount({ mode: null }))._mode).toBe("on");
  });

  it("loads the schedule when opened in schedule mode", async () => {
    const el = await mount({
      mode: "schedule",
      schedule: { intervals: [{ time: 60, duration: 30 }] },
    });
    expect(el._intervals).toEqual([{ time: 60, duration: 30 }]);
    expect(el._scheduleLoaded).toBe(true);
  });

  it("loads the sensor configuration when opened in sensor mode", async () => {
    const el = await mount({
      mode: "sensor",
      sensorConfig: { value: 26.5 },
    });
    expect(el._value).toBe(26.5);
  });

  it("does not reload its state when connected a second time", async () => {
    const el = await mount({ mode: "schedule", schedule: { intervals: [] } });
    el._mode = "off";
    el.remove();
    document.body.appendChild(el);
    await el.updateComplete;
    // Re-reading the entity would have put the element back in schedule mode
    expect(el._mode).toBe("off");
  });

  it("observes the timeline canvas and redraws it on resize", async () => {
    const el = await mount({ mode: "schedule", schedule: { intervals: [] } });
    const ro = (globalThis as any).ResizeObserver.last;
    expect(ro.observe).toHaveBeenCalled();
    const spy = vi.spyOn(el, "_drawTimeline");
    ro.cb();
    expect(spy).toHaveBeenCalled();
  });

  it("disconnects the observer when removed", async () => {
    const el = await mount({ mode: "schedule", schedule: { intervals: [] } });
    const ro = (globalThis as any).ResizeObserver.last;
    el.remove();
    expect(ro.disconnect).toHaveBeenCalled();
    expect(el._resizeObserver).toBeNull();
  });

  it("does not observe anything when there is no timeline", async () => {
    const el = await mount({ mode: "on" });
    expect(el._resizeObserver).toBeNull();
    // Removing it without an observer must not throw
    expect(() => el.remove()).not.toThrow();
  });

  it("does not observe the canvas when ResizeObserver is unavailable", async () => {
    delete (globalThis as any).ResizeObserver;
    const el = await mount({ mode: "schedule", schedule: { intervals: [] } });
    expect(el._resizeObserver).toBeNull();
  });

  it("rebuilds the probe list when hass changes after loading", async () => {
    const el = await mount({ mode: "on" });
    const spy = vi.spyOn(el, "_buildProbeList");
    el.hass = { ...el.hass };
    await el.updateComplete;
    expect(spy).toHaveBeenCalled();
  });

  it("does not rebuild the probe list before loading", () => {
    const el = makeElement();
    const spy = vi.spyOn(el, "_buildProbeList");
    el.willUpdate(new Map([["hass", null]]));
    expect(spy).not.toHaveBeenCalled();
  });

  it("ignores a change that does not touch hass", () => {
    const el = makeElement();
    el._loaded = true;
    const spy = vi.spyOn(el, "_buildProbeList");
    el.willUpdate(new Map([["device", null]]));
    expect(spy).not.toHaveBeenCalled();
  });
});

// ─── Device helpers ─────────────────────────────────────────────────────────

describe("PowerSensor device helpers", () => {
  it("_strip() is null without a device", () => {
    const el = new StubPowerSensor() as any;
    expect(el._strip()).toBeNull();
  });

  it("_socketNum() converts the 1-based socket id to the device index", () => {
    const el = new StubPowerSensor() as any;
    el.device = { socket_id: 3 };
    expect(el._socketNum()).toBe(2);
    el.device = { config: { id: "4" } };
    expect(el._socketNum()).toBe(3);
  });

  it("_socketNum() falls back to 0 for a missing or invalid id", () => {
    const el = new StubPowerSensor() as any;
    expect(el._socketNum()).toBe(0);
    el.device = { socket_id: "abc" };
    expect(el._socketNum()).toBe(0);
    el.device = { socket_id: 0 };
    expect(el._socketNum()).toBe(0);
  });

  it("_configEntry() walks up the device chain", () => {
    const el = new StubPowerSensor() as any;
    el.device = { elements: [{ primary_config_entry: "own" }] };
    expect(el._configEntry()).toBe("own");
    el.device = {
      parent_device: { elements: [{ primary_config_entry: "parent" }] },
    };
    expect(el._configEntry()).toBe("parent");
  });

  it("_configEntry() is null when no level carries an entry", () => {
    const el = new StubPowerSensor() as any;
    expect(el._configEntry()).toBeNull();
    el.device = { device: { device: {} } };
    expect(el._configEntry()).toBeNull();
    // The walk is bounded: a cycle cannot loop for ever
    const loop: any = {};
    loop.device = loop;
    el.device = loop;
    expect(el._configEntry()).toBeNull();
  });

  it("_entityState() / _entityAttr() are null without entity or hass", () => {
    const el = makeElement();
    expect(el._entityState("missing")).toBeNull();
    expect(el._entityAttr("missing", "x")).toBeNull();
    el.hass = null;
    expect(el._entityState("socket_mode")).toBeNull();
    expect(el._entityAttr("socket_mode", "schedule")).toBeNull();
  });

  it("_socketName() ignores a missing or unknown name", () => {
    expect(makeElement({ name: "Heater" })._socketName()).toBe("Heater");
    expect(makeElement({ name: "unknown" })._socketName()).toBeNull();
    expect(makeElement({ name: null })._socketName()).toBeNull();
  });
});

// ─── Mode switching ─────────────────────────────────────────────────────────

describe("PowerSensor mode selector", () => {
  it("clicking the active mode changes nothing", async () => {
    const el = await mount({ mode: "on" });
    el._saveError = "boom";
    button(el, "On").click();
    expect(el._saveError).toBe("boom");
  });

  it("switching mode clears a previous save error", async () => {
    const el = await mount({ mode: "on" });
    el._saveError = "boom";
    button(el, "Off").click();
    expect(el._mode).toBe("off");
    expect(el._saveError).toBeNull();
  });

  it("switching to schedule loads the schedule only once", async () => {
    const el = await mount({
      mode: "on",
      schedule: { intervals: [{ time: 0, duration: 10 }] },
    });
    const spy = vi.spyOn(el, "_loadSchedule");
    el._onModeClick("schedule");
    el._onModeClick("on");
    el._onModeClick("schedule");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("switching to sensor rebuilds the probe list", async () => {
    const el = await mount({ mode: "on" });
    const spy = vi.spyOn(el, "_buildProbeList");
    el._onModeClick("sensor");
    expect(spy).toHaveBeenCalled();
  });

  it("highlights the active mode", async () => {
    const el = await mount({ mode: "off" });
    expect(button(el, "Off").className).toContain("active");
    expect(button(el, "On").className).not.toContain("active");
  });
});

// ─── Schedule ───────────────────────────────────────────────────────────────

describe("PowerSensor schedule", () => {
  it("keeps only real intervals, in time order", () => {
    const el = makeElement({
      schedule: {
        intervals: [
          { time: "600", duration: "30" },
          { time: 60, duration: 0 },
          null,
          { time: 120, duration: 15 },
        ],
      },
    });
    el._loadSchedule();
    expect(el._intervals).toEqual([
      { time: 120, duration: 15 },
      { time: 600, duration: 30 },
    ]);
  });

  it("reads an absent or malformed schedule as empty", () => {
    const el = makeElement();
    el._loadSchedule();
    expect(el._intervals).toEqual([]);
    const bad = makeElement({ schedule: { intervals: "nope" } });
    bad._loadSchedule();
    expect(bad._intervals).toEqual([]);
  });

  it("_minutesToTime() formats and wraps at midnight", () => {
    const el = makeElement();
    expect(el._minutesToTime(65)).toBe("01:05");
    expect(el._minutesToTime(1440)).toBe("00:00");
  });

  it("moving a start keeps the end in place", () => {
    const el = makeElement();
    el._intervals = [{ time: 60, duration: 60 }];
    el._onStartChange(0, { target: { value: "01:30" } });
    expect(el._intervals).toEqual([{ time: 90, duration: 30 }]);
  });

  it("a start moved past the end keeps a one-minute interval", () => {
    const el = makeElement();
    el._intervals = [{ time: 60, duration: 60 }];
    el._onStartChange(0, { target: { value: "05:00" } });
    expect(el._intervals[0]).toEqual({ time: 300, duration: 1 });
  });

  it("a start change re-sorts the intervals", () => {
    const el = makeElement();
    el._intervals = [
      { time: 60, duration: 10 },
      { time: 120, duration: 10 },
    ];
    el._onStartChange(1, { target: { value: "00:30" } });
    expect(el._intervals[0].time).toBe(30);
  });

  it("an end change sets the duration, never below one minute", () => {
    const el = makeElement();
    el._intervals = [{ time: 60, duration: 60 }];
    el._onEndChange(0, { target: { value: "03:00" } });
    expect(el._intervals[0].duration).toBe(120);
    el._onEndChange(0, { target: { value: "00:10" } });
    expect(el._intervals[0].duration).toBe(1);
  });

  it("an incomplete time is ignored", () => {
    const el = makeElement();
    el._intervals = [{ time: 60, duration: 60 }];
    el._onStartChange(0, { target: { value: "" } });
    el._onStartChange(0, { target: { value: "01" } });
    el._onEndChange(0, { target: { value: "" } });
    el._onEndChange(0, { target: { value: "xx:10" } });
    expect(el._intervals).toEqual([{ time: 60, duration: 60 }]);
  });

  it("the first interval added starts at midnight", () => {
    const el = makeElement();
    el._addInterval();
    expect(el._intervals).toEqual([{ time: 0, duration: 60 }]);
  });

  it("a new interval starts an hour after the last one", () => {
    const el = makeElement();
    el._intervals = [{ time: 60, duration: 30 }];
    el._addInterval();
    expect(el._intervals[1]).toEqual({ time: 150, duration: 60 });
  });

  it("a new interval never runs past the end of the day", () => {
    const el = makeElement();
    el._intervals = [{ time: 1380, duration: 50 }];
    el._addInterval();
    expect(el._intervals.map((iv: any) => iv.time)).toEqual([1379, 1380]);
  });

  it("no more than ten intervals can be added", () => {
    const el = makeElement();
    el._intervals = Array.from({ length: 10 }, (_, i) => ({
      time: i * 100,
      duration: 10,
    }));
    el._addInterval();
    expect(el._intervals.length).toBe(10);
  });

  it("removes an interval", () => {
    const el = makeElement();
    el._intervals = [
      { time: 0, duration: 10 },
      { time: 100, duration: 10 },
    ];
    el._removeInterval(0);
    expect(el._intervals).toEqual([{ time: 100, duration: 10 }]);
  });
});

describe("PowerSensor schedule rendering", () => {
  it("says the socket stays off when there is no interval", async () => {
    const el = await mount({ mode: "schedule", schedule: { intervals: [] } });
    expect(el.shadowRoot.textContent).toContain("00:00 → 23:59");
  });

  it("wires the interval rows to the editor", async () => {
    const el = await mount({
      mode: "schedule",
      schedule: { intervals: [{ time: 60, duration: 60 }] },
    });
    const [start, end] = Array.from(
      el.shadowRoot.querySelectorAll('input[type="time"]'),
    ) as HTMLInputElement[];
    expect(start.value).toBe("01:00");
    expect(end.value).toBe("02:00");

    end.value = "03:00";
    end.dispatchEvent(new Event("change"));
    expect(el._intervals[0].duration).toBe(120);

    start.value = "00:30";
    start.dispatchEvent(new Event("change"));
    expect(el._intervals[0].time).toBe(30);

    button(el, "−").click();
    expect(el._intervals).toEqual([]);
  });

  it("the add button adds an interval", async () => {
    const el = await mount({ mode: "schedule", schedule: { intervals: [] } });
    button(el, "Add").click();
    expect(el._intervals.length).toBe(1);
  });

  it("the add button is disabled once the list is full", async () => {
    const el = await mount({
      mode: "schedule",
      schedule: {
        intervals: Array.from({ length: 10 }, (_, i) => ({
          time: i * 100,
          duration: 10,
        })),
      },
    });
    expect(button(el, "Add").disabled).toBe(true);
  });

  it("an interval ending at midnight is shown ending at 23:59", async () => {
    const el = await mount({
      mode: "schedule",
      schedule: { intervals: [{ time: 1380, duration: 60 }] },
    });
    const end = el.shadowRoot.querySelectorAll('input[type="time"]')[1];
    expect(end.value).toBe("23:59");
  });
});

// ─── Schedule canvas ────────────────────────────────────────────────────────

describe("PowerSensor timeline drawing", () => {
  function scheduled(intervals: any[] = []): any {
    const el = makeElement({ mode: "schedule" });
    el._mode = "schedule";
    el._intervals = intervals;
    return el;
  }

  it("draws nothing outside schedule mode", () => {
    const el = makeElement();
    const { ctx } = attachCanvas(el);
    el._drawTimeline();
    expect(ctx.calls).toEqual([]);
  });

  it("draws nothing before the element is rendered", () => {
    const el = scheduled();
    expect(() => el._drawTimeline()).not.toThrow();
  });

  it("draws nothing without a canvas", () => {
    const el = scheduled();
    vi.spyOn(el, "shadowRoot", "get").mockReturnValue({
      querySelector: () => null,
    } as any);
    expect(() => el._drawTimeline()).not.toThrow();
  });

  it.each([
    [0, 64],
    [400, 0],
  ])("draws nothing on a %sx%s canvas", (w, h) => {
    const el = scheduled();
    const { ctx } = attachCanvas(el, w, h);
    el._drawTimeline();
    expect(ctx.calls).toEqual([]);
  });

  it("draws nothing without a 2D context", () => {
    const el = scheduled();
    const { canvas } = attachCanvas(el, 400, 64, null);
    el._drawTimeline();
    // The backing store was sized before the context was requested
    expect(canvas.width).toBe(400);
  });

  it.each([
    [3, 64],
    [400, 16],
  ])("draws nothing when the %sx%s canvas leaves no chart area", (w, h) => {
    const el = scheduled();
    const { ctx } = attachCanvas(el, w, h);
    el._drawTimeline();
    expect(ctx.calls).toEqual([]);
  });

  it("labels wide blocks and skips empty ones", () => {
    const el = scheduled([
      { time: 60, duration: 240 }, // wide: labelled
      { time: 600, duration: 5 }, // narrow: not labelled
      { time: 1500, duration: 30 }, // past midnight: zero width
    ]);
    const { ctx } = attachCanvas(el);
    el._drawTimeline();
    const t = texts(ctx);
    expect(t.filter((x) => x === "ON").length).toBe(1);
    // Hour labels, aligned left at 0h and right at 24h
    expect(t).toEqual(expect.arrayContaining(["0h", "12h", "24h"]));
  });

  it("scales with the device pixel ratio and defaults it to 1", () => {
    const original = window.devicePixelRatio;
    Object.defineProperty(window, "devicePixelRatio", {
      value: 0,
      configurable: true,
    });
    const el = scheduled();
    const { canvas } = attachCanvas(el, 400, 64);
    el._drawTimeline();
    expect(canvas.width).toBe(400);

    Object.defineProperty(window, "devicePixelRatio", {
      value: 2,
      configurable: true,
    });
    el._drawTimeline();
    expect(canvas.width).toBe(800);
    Object.defineProperty(window, "devicePixelRatio", {
      value: original,
      configurable: true,
    });
  });
});

// ─── Sensor configuration ───────────────────────────────────────────────────

describe("PowerSensor sensor configuration", () => {
  it("keeps the defaults without a sensor configuration", () => {
    const el = makeElement();
    el._loadSensorConfig();
    expect(el._value).toBe(25);
    expect(el._isAbove).toBe(true);
  });

  it("reads every threshold field", () => {
    const el = makeElement({
      control: true,
      probes: [{ type: "ph", uid: "0x1", name: "pH" }],
      sensorConfig: {
        is_above: 0,
        value: "7.9",
        turn_on: 0,
        sensor: { default_state: 1, app_cache: "ph" },
      },
    });
    el._buildProbeList();
    el._loadSensorConfig();
    expect(el._isAbove).toBe(false);
    expect(el._value).toBe(7.9);
    expect(el._turnOn).toBe(false);
    expect(el._fallbackOn).toBe(true);
    // Local probe first, the ReefControl pH probe second
    expect(el._probeIdx).toBe(1);
  });

  it("leaves the fields a partial configuration does not carry", () => {
    const el = makeElement({ sensorConfig: {} });
    el._buildProbeList();
    el._loadSensorConfig();
    expect(el._turnOn).toBe(true);
    expect(el._fallbackOn).toBe(false);
    expect(el._probeIdx).toBe(0);
  });

  it("ignores a probe type that is not available", () => {
    const el = makeElement({
      sensorConfig: { sensor: { app_cache: "orp" } },
    });
    el._buildProbeList();
    el._probeIdx = 0;
    el._loadSensorConfig();
    expect(el._probeIdx).toBe(0);
  });
});

describe("PowerSensor probe list", () => {
  it("offers the local probe only when it reports a value", () => {
    expect(makeElement({ temperature: "25" })._buildProbeList()).toBe(
      undefined,
    );
    for (const t of [null, "unknown", "unavailable"]) {
      const el = makeElement({ temperature: t });
      el._buildProbeList();
      expect(el._probeOptions).toEqual([]);
    }
    const el = makeElement({ temperature: "25" });
    el._buildProbeList();
    expect(el._probeOptions).toEqual([
      {
        label: "Local temperature probe",
        uid: "local",
        type: "temperature",
        sensor: "primary",
        from_control: false,
      },
    ]);
  });

  it("offers nothing more without a paired ReefControl", () => {
    const el = makeElement({ temperature: null, control: false });
    el._buildProbeList();
    expect(el._probeOptions).toEqual([]);
  });

  it("copes with a strip that knows nothing of ReefControl", () => {
    const el = makeElement({ temperature: null });
    el._controlProbes = HUB_PROBES;
    el.device = { entities: {}, device: {} };
    el._buildProbeList();
    expect(el._probeOptions).toEqual([]);
    el.device = null;
    el._buildProbeList();
    expect(el._probeOptions).toEqual([]);
  });

  it("offers nothing from the hub before its probes are known", () => {
    const el = makeElement({
      temperature: null,
      control: true,
      fetched: false,
    });
    el._buildProbeList();
    expect(el._probeOptions).toEqual([]);
  });

  it("lists every probe the hub reports, grouped by type", () => {
    // The hub of the bug report: only temperature and leak were offered
    const el = makeElement({
      temperature: null,
      control: true,
      probes: HUB_PROBES,
    });
    el._buildProbeList();
    expect(
      el._probeOptions.map((p: any) => `${p.type}:${p.sensor}:${p.uid}`),
    ).toEqual([
      "ph:primary:0x00B39",
      "ph:temperature:0x00B39",
      "orp:primary:0x0071F",
      "ec:primary:0x007BF",
      "ec:temperature:0x007BF",
      "temperature:primary:0x000F7",
      "ato:primary:0x0024E",
      "ato:temperature:0x0024E",
      "ato:primary:0x0097E",
      "ato:temperature:0x0097E",
      "leak:primary:0x0032B",
    ]);
    expect(el._probeOptions.every((p: any) => p.from_control)).toBe(true);
  });

  it("labels the probes with the hub and probe names", () => {
    const el = makeElement({
      temperature: null,
      control: true,
      probes: HUB_PROBES,
    });
    el._buildProbeList();
    const labels = el._probeOptions.map((p: any) => p.label);
    expect(labels).toContain("Hub — pH (disconnected)");
    expect(labels).toContain("Hub — pH · Temperature (disconnected)");
    expect(labels).toContain("Hub — Salinity temp");
    expect(labels).toContain("Hub — Salinity temp · Temperature");
    expect(labels).toContain("Hub — Leak");
  });

  it("tells two probes with the same name apart by their uid", () => {
    const el = makeElement({
      temperature: null,
      control: true,
      probes: HUB_PROBES,
    });
    el._buildProbeList();
    const ato = el._probeOptions
      .filter((p: any) => p.type === "ato")
      .map((p: any) => p.label);
    expect(ato).toEqual([
      "Hub — ATO [0x0024E]",
      "Hub — ATO · Temperature [0x0024E]",
      "Hub — ATO [0x0097E]",
      "Hub — ATO · Temperature [0x0097E]",
    ]);
  });

  it("does not add a uid to duplicates that have none", () => {
    const el = makeElement({
      temperature: null,
      control: true,
      probes: [{ type: "leak" }, { type: "leak" }],
    });
    el._buildProbeList();
    expect(el._probeOptions.map((p: any) => p.label)).toEqual([
      "Hub — Leak detector",
      "Hub — Leak detector",
    ]);
    expect(el._probeOptions[0].uid).toBe("");
  });

  it("falls back to the type label and the default hub name", () => {
    const el = makeElement({
      temperature: null,
      control: true,
      hubName: "",
      probes: [{ type: "orp", uid: "0x1" }],
    });
    el._buildProbeList();
    expect(el._probeOptions[0].label).toBe("RSControl — ORP");
  });

  it("offers a temperature half only for probes reporting one", () => {
    const el = makeElement({
      temperature: null,
      control: true,
      probes: [
        { type: "ph", uid: "a", name: "pH" },
        { type: "ec", uid: "b", name: "EC", temp_value: null },
        { type: "ato", uid: "c", name: "ATO", temp_value: 25 },
        // A temperature probe is already a temperature reading
        { type: "temperature", uid: "d", name: "T", temp_value: 25 },
      ],
    });
    el._buildProbeList();
    expect(el._probeOptions.map((p: any) => `${p.type}:${p.sensor}`)).toEqual([
      "ph:primary",
      "ec:primary",
      "temperature:primary",
      "ato:primary",
      "ato:temperature",
    ]);
  });

  it("gives the temperature half the temperature parameters", async () => {
    const el = await mount({
      mode: "sensor",
      temperature: null,
      control: true,
      probes: [{ type: "ato", uid: "0x0097E", name: "ATO", temp_value: 25 }],
    });
    const select = el.shadowRoot.querySelector("select") as HTMLSelectElement;
    select.value = "1";
    select.dispatchEvent(new Event("change"));
    await el.updateComplete;
    // Not the ATO notice: a threshold, its direction and hysteresis
    expect(el.shadowRoot.querySelector(".sce-ato-info")).toBeNull();
    expect(el.shadowRoot.querySelectorAll(".sce-number-input").length).toBe(2);
    expect(el._value).toBe(25);
  });

  it("ignores unknown probe types and empty entries", () => {
    const el = makeElement({
      temperature: null,
      control: true,
      probes: [null, { type: "par", uid: "x" }, { uid: "y" }],
    });
    el._buildProbeList();
    expect(el._probeOptions).toEqual([]);
  });

  it("resets the selection when it no longer exists", () => {
    const el = makeElement();
    el._probeIdx = 3;
    el._buildProbeList();
    expect(el._probeIdx).toBe(0);
  });

  it("changing probe restores that type's defaults", () => {
    const el = makeElement({
      control: true,
      probes: [{ type: "orp", uid: "0x1", name: "ORP" }],
    });
    el._buildProbeList();
    el._isAbove = false;
    el._turnOn = false;
    el._fallbackOn = true;
    el._onProbeChange({ target: { value: "1" } });
    expect(el._probeIdx).toBe(1);
    expect(el._value).toBe(420);
    expect(el._hysteresis).toBe(25);
    expect(el._isAbove).toBe(true);
    expect(el._turnOn).toBe(true);
    expect(el._fallbackOn).toBe(false);
    expect(el._probeTouched).toBe(true);
  });

  it("selecting the current probe or a missing one changes nothing", () => {
    const el = makeElement();
    el._buildProbeList();
    el._value = 30;
    el._onProbeChange({ target: { value: "0" } });
    expect(el._value).toBe(30);
    el._onProbeChange({ target: { value: "5" } });
    expect(el._probeIdx).toBe(5);
    expect(el._value).toBe(30);
  });
});

// ─── RSControl probe fetch ──────────────────────────────────────────────────

describe("PowerSensor RSControl probes", () => {
  it("asks the integration for the hub's probes when opened in sensor mode", async () => {
    const el = await mount({
      mode: "sensor",
      temperature: null,
      control: true,
      fetched: false,
      probes: HUB_PROBES,
    });
    expect(el.hass.callWS).toHaveBeenCalledWith({
      type: "call_service",
      domain: "redsea",
      service: "get_control_probes",
      service_data: { hwid: "d4e9f4e89208" },
      return_response: true,
    });
    await settle(el);
    expect(el._probeOptions.length).toBe(11);
    expect(el.shadowRoot.querySelectorAll("option").length).toBe(11);
  });

  it("shows a loading notice until the probes arrive", async () => {
    let answer: (v: any) => void = () => {};
    const el = makeElement({
      mode: "sensor",
      temperature: null,
      control: true,
      fetched: false,
    });
    el.hass.callWS.mockReturnValue(new Promise((r) => (answer = r)));
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot.textContent).toContain("Loading the RSControl probes");
    answer({ response: { probes: [{ type: "orp", uid: "0x1" }] } });
    await settle(el);
    expect(el._probesLoading).toBe(false);
    expect(el.shadowRoot.querySelector("select")).not.toBeNull();
  });

  it("selects the configured probe once the list arrives", async () => {
    let answer: (v: any) => void = () => {};
    const el = makeElement({
      mode: "sensor",
      temperature: "25",
      control: true,
      fetched: false,
      sensorConfig: { sensor: { app_cache: "leak" } },
    });
    el.hass.callWS.mockReturnValue(new Promise((r) => (answer = r)));
    document.body.appendChild(el);
    await el.updateComplete;
    // Only the local probe is known until the hub answers
    expect(el._probeIdx).toBe(0);
    answer({ response: { probes: [{ type: "leak", uid: "0x1" }] } });
    await settle(el);
    expect(el._probeIdx).toBe(1);
  });

  it("keeps a probe the user picked while the list was loading", async () => {
    let answer: (v: any) => void = () => {};
    const el = makeElement({
      mode: "sensor",
      control: true,
      fetched: false,
      sensorConfig: { sensor: { app_cache: "leak" } },
    });
    el.hass.callWS.mockReturnValue(new Promise((r) => (answer = r)));
    document.body.appendChild(el);
    await el.updateComplete;
    el._probeTouched = true;
    el._probeIdx = 0;
    answer({ response: { probes: [{ type: "leak", uid: "0x1" }] } });
    await settle(el);
    expect(el._probeIdx).toBe(0);
  });

  it("fetches the probes once per hub", async () => {
    const el = await mount({
      mode: "on",
      control: true,
      fetched: false,
      probes: HUB_PROBES,
    });
    expect(el.hass.callWS).not.toHaveBeenCalled();
    el._onModeClick("sensor");
    await settle(el);
    el._onModeClick("on");
    el._onModeClick("sensor");
    await settle(el);
    expect(el.hass.callWS).toHaveBeenCalledTimes(1);
  });

  it("does not ask without a paired hub, its hwid or callWS", async () => {
    const unpaired = makeElement({ control: false });
    await unpaired._fetchControlProbes();
    expect(unpaired.hass.callWS).not.toHaveBeenCalled();

    const noHwid = makeElement({ control: true, fetched: false });
    noHwid.device.device.linked_control_hwid = () => null;
    await noHwid._fetchControlProbes();
    expect(noHwid.hass.callWS).not.toHaveBeenCalled();

    const oldStrip = makeElement({ control: true, fetched: false });
    delete oldStrip.device.device.linked_control_hwid;
    await oldStrip._fetchControlProbes();
    expect(oldStrip.hass.callWS).not.toHaveBeenCalled();

    const noWs = makeElement({ control: true, fetched: false });
    noWs.hass.callWS = undefined;
    await noWs._fetchControlProbes();
    expect(noWs._controlProbes).toBeNull();

    const noHass = makeElement({ control: true, fetched: false });
    noHass.hass = null;
    await expect(noHass._fetchControlProbes()).resolves.toBeUndefined();
  });

  it("reads an unexpected answer as no probe", async () => {
    for (const answer of [null, {}, { response: { probes: "x" } }]) {
      const el = makeElement({ control: true, fetched: false });
      el.hass.callWS.mockResolvedValue(answer);
      await el._fetchControlProbes();
      expect(el._controlProbes).toEqual([]);
    }
  });

  it("keeps the local probe when the service fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const el = makeElement({ control: true, fetched: false });
    el.hass.callWS.mockRejectedValue(new Error("Service not found"));
    await el._fetchControlProbes();
    expect(warn).toHaveBeenCalled();
    expect(el._probesLoading).toBe(false);
    expect(el._probeOptions.map((p: any) => p.uid)).toEqual(["local"]);
  });
});

// ─── Reading the socket rule back ───────────────────────────────────────────

describe("PowerSensor rule read back", () => {
  /**
   * Socket `n` (0-based) of the capture, opened in sensor mode once the hub
   * probes are known, with its rule in `sensor_config` as the integration
   * exposes it for an RSControl probe.
   */
  async function openSocket(n: number, opts: SetupOptions = {}): Promise<any> {
    const el = makeElement({
      mode: "sensor",
      temperature: null,
      control: true,
      fetched: false,
      probes: HUB_PROBES,
      sensorSource: "control",
      sensorConfig: HUB_RULES.find((r) => r.number === n),
      ...opts,
    });
    el.device.socket_id = n + 1;
    document.body.appendChild(el);
    await settle(el);
    return el;
  }

  function selected(el: any): string {
    const p = el._probeOptions[el._probeIdx];
    return `${p.type}:${p.sensor}:${p.uid}`;
  }

  it("selects the exact probe among two of the same type", async () => {
    // Sockets 4 and 5 both follow an ATO, but not the same one
    expect(selected(await openSocket(4))).toBe("ato:temperature:0x0097E");
    expect(selected(await openSocket(5))).toBe("ato:primary:0x0024E");
  });

  it("loads the thresholds kept on the hub, without float noise", async () => {
    const ph = await openSocket(0);
    expect(selected(ph)).toBe("ph:primary:0x00B39");
    expect(ph._value).toBe(8.2);
    expect(ph._hysteresis).toBe(0.5);
    expect(ph._isAbove).toBe(true);
    // trigger_op false: "turn the socket OFF when…"
    expect(ph._turnOn).toBe(false);

    const ec = await openSocket(2);
    expect(ec._value).toBe(53.1);
    expect(ec._hysteresis).toBe(0.98);
  });

  it("shows the loaded values in the form", async () => {
    const el = await openSocket(1);
    const [value, hysteresis] = Array.from(
      el.shadowRoot.querySelectorAll(".sce-number-input"),
    ) as HTMLInputElement[];
    expect(value.value).toBe("420");
    expect(hysteresis.value).toBe("25");
  });

  it("keeps the defaults of the fields a rule does not carry", async () => {
    const el = await openSocket(5);
    // Water-level rule: no threshold, trigger_op or direction
    expect(el._value).toBe(25);
    expect(el._turnOn).toBe(true);
    expect(el._fallbackOn).toBe(false);
  });

  it("reads a rule without sub-sensor as the primary one", async () => {
    const el = await openSocket(1, {
      sensorConfig: { number: 1, type: "orp", uid: "0x0071F", value: 400 },
    });
    expect(selected(el)).toBe("orp:primary:0x0071F");
    expect(el._value).toBe(400);
  });

  it("falls back to the probe type when the exact probe is gone", async () => {
    const el = await openSocket(4, {
      sensorConfig: { ...HUB_RULES[4], uid: "0xDEAD" },
    });
    expect(selected(el)).toBe("ato:primary:0x0024E");
  });

  it("matches by type only for a rule not tagged as a control one", async () => {
    // Same rule without sensor_source: the uid is not trusted
    const el = await openSocket(4, { sensorSource: undefined });
    expect(selected(el)).toBe("ato:primary:0x0024E");
  });

  it("still reads the local probe shape", async () => {
    const el = await openSocket(0, {
      temperature: "25",
      sensorSource: "local",
      sensorConfig: {
        sensor: { app_cache: "temperature", default_state: true },
        value: 26.5,
        is_above: false,
        turn_on: false,
        hysteresis: 0.3,
      },
    });
    expect(selected(el)).toBe("temperature:primary:local");
    expect(el._value).toBe(26.5);
    expect(el._isAbove).toBe(false);
    expect(el._turnOn).toBe(false);
    expect(el._hysteresis).toBe(0.3);
    expect(el._fallbackOn).toBe(true);
  });

  it("does not override a probe picked while loading", async () => {
    let answer: (v: any) => void = () => {};
    const el = makeElement({
      mode: "sensor",
      temperature: null,
      control: true,
      fetched: false,
      sensorSource: "control",
      sensorConfig: HUB_RULES[4],
    });
    el.hass.callWS.mockReturnValue(new Promise((r) => (answer = r)));
    document.body.appendChild(el);
    await el.updateComplete;
    el._probeTouched = true;
    el._probeIdx = 0;
    answer({ response: { probes: HUB_PROBES } });
    await settle(el);
    expect(el._probeIdx).toBe(0);
  });

  it("round-trips the capture: what is read back saves unchanged", async () => {
    const el = await openSocket(4, { name: null });
    await el._save();
    const [, , hub] = el.hass.callService.mock.calls.map((c: any) => c[2]);
    expect(hub.data).toEqual({
      uid: "0x0097E",
      is_above: true,
      sensor: "temperature",
      type: "ato",
      value: 25,
      trigger_op: false,
      hysteresis: 0.5,
    });
  });
});

// ─── Manual override ────────────────────────────────────────────────────────

describe("PowerSensor manual override", () => {
  it.each([
    [
      "sensor",
      "on",
      "Sensor mode suspended: the socket was switched ON manually.",
    ],
    [
      "schedule",
      "off",
      "Schedule mode suspended: the socket was switched OFF manually.",
    ],
  ])(
    "opens on the suspended %s mode of a socket forced %s",
    async (prev, forced, notice) => {
      const el = await mount({
        mode: forced,
        prevMode: prev,
        schedule: { intervals: [] },
      });
      expect(el._mode).toBe(prev);
      expect(el._override).toEqual({ mode: prev, state: forced });
      const box = el.shadowRoot.querySelector(".sce-override");
      expect(box.textContent.replace(/\s+/g, " ")).toContain(notice);
      // The suspended mode is marked in the selector
      const active = el.shadowRoot.querySelector(".sce-mode-btn.active");
      expect(active.querySelector(".sce-mode-paused")).not.toBeNull();
    },
  );

  it("loads the configuration of the suspended mode", async () => {
    const el = await mount({
      mode: "on",
      prevMode: "sensor",
      sensorConfig: { value: 27 },
    });
    expect(el._value).toBe(27);
  });

  it("is not an override when the previous mode was manual", async () => {
    const el = await mount({ mode: "off", prevMode: "on" });
    expect(el._mode).toBe("off");
    expect(el._override).toBeNull();
    expect(el.shadowRoot.querySelector(".sce-override")).toBeNull();
  });

  it("hides the notice while another mode is selected", async () => {
    const el = await mount({ mode: "on", prevMode: "sensor" });
    button(el, "Off").click();
    await el.updateComplete;
    expect(el.shadowRoot.querySelector(".sce-override")).toBeNull();
  });

  it("resumes the suspended mode without touching its configuration", async () => {
    const el = await mount({ mode: "off", prevMode: "sensor" });
    const quit = vi.fn();
    el.addEventListener("quit-dialog", quit);
    button(el, "Resume Sensor mode").click();
    await settle(el);
    expect(el.hass.callService).toHaveBeenCalledTimes(1);
    expect(lastRequest(el)).toEqual({
      device_id: "entry-1",
      access_path: "/sockets/config",
      method: "put",
      data: { sockets: [{ number: 1, mode: "sensor", name: "Heater" }] },
      refresh: "config",
      wait: 2,
    });
    expect(quit).toHaveBeenCalled();
    expect(el._saving).toBe(false);
  });

  it("resumes without a name when the socket has none", async () => {
    const el = makeElement({ mode: "on", prevMode: "schedule", name: null });
    el._readCurrentMode();
    await el._resume();
    expect(lastRequest(el).data.sockets[0]).toEqual({
      number: 1,
      mode: "schedule",
    });
  });

  it("reports a failed resume and stays open", async () => {
    const el = makeElement({ mode: "on", prevMode: "sensor" });
    el._readCurrentMode();
    el.hass.callService.mockRejectedValue(new Error("device offline"));
    const quit = vi.fn();
    el.addEventListener("quit-dialog", quit);
    await el._resume();
    expect(el._saveError).toBe("device offline");
    expect(quit).not.toHaveBeenCalled();
    for (const err of ["timeout", null]) {
      el.hass.callService.mockRejectedValue(err);
      await el._resume();
      expect(el._saveError).toBe(err ?? "Save failed");
    }
  });

  it("resumes nothing without override, config entry or hass", async () => {
    const plain = makeElement({ mode: "on" });
    plain._readCurrentMode();
    await plain._resume();
    expect(plain.hass.callService).not.toHaveBeenCalled();

    const noEntry = makeElement({
      mode: "on",
      prevMode: "sensor",
      entry: null,
    });
    noEntry._readCurrentMode();
    await noEntry._resume();
    expect(noEntry.hass.callService).not.toHaveBeenCalled();

    const noHass = makeElement({ mode: "on", prevMode: "sensor" });
    noHass._readCurrentMode();
    const hass = noHass.hass;
    noHass.hass = null;
    await noHass._resume();
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("disables the resume button while saving", async () => {
    const el = await mount({ mode: "on", prevMode: "sensor" });
    el._saving = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector(".sce-resume-btn").disabled).toBe(true);
  });
});

// ─── Sensor rendering ───────────────────────────────────────────────────────

describe("PowerSensor sensor rendering", () => {
  it("explains why sensor mode is unusable without a probe", async () => {
    const el = await mount({ mode: "sensor", temperature: null });
    expect(el.shadowRoot.querySelector(".sce-error").textContent).toContain(
      "No probe connected",
    );
  });

  it("shows every threshold of a temperature probe and wires them", async () => {
    const el = await mount({ mode: "sensor" });

    button(el, "Turn OFF").click();
    expect(el._turnOn).toBe(false);
    await el.updateComplete;
    button(el, "Turn ON").click();
    expect(el._turnOn).toBe(true);

    button(el, "Below").click();
    expect(el._isAbove).toBe(false);
    await el.updateComplete;
    button(el, "Above").click();
    expect(el._isAbove).toBe(true);

    const fallback = el.shadowRoot.querySelectorAll(".sce-row")[4];
    const [fbOff, fbOn] = Array.from(
      fallback.querySelectorAll("button"),
    ) as HTMLButtonElement[];
    fbOn.click();
    expect(el._fallbackOn).toBe(true);
    await el.updateComplete;
    fbOff.click();
    expect(el._fallbackOn).toBe(false);

    const [value, hysteresis] = Array.from(
      el.shadowRoot.querySelectorAll(".sce-number-input"),
    ) as HTMLInputElement[];
    value.value = "27.5";
    value.dispatchEvent(new Event("input"));
    hysteresis.value = "0.3";
    hysteresis.dispatchEvent(new Event("input"));
    expect(el._value).toBe(27.5);
    expect(el._hysteresis).toBe(0.3);
  });

  it("changing the probe through the select", async () => {
    const el = await mount({
      mode: "sensor",
      control: true,
      probes: [{ type: "leak", uid: "0x1", name: "Leak" }],
    });
    const select = el.shadowRoot.querySelector("select") as HTMLSelectElement;
    select.value = "1";
    select.dispatchEvent(new Event("change"));
    await el.updateComplete;
    expect(el._probeIdx).toBe(1);
    // A leak probe only chooses what to do and the fallback state
    expect(el.shadowRoot.querySelectorAll(".sce-row").length).toBe(2);
    expect(el.shadowRoot.querySelectorAll(".sce-number-input").length).toBe(0);
  });

  it("an ATO probe has no threshold at all", async () => {
    const el = await mount({
      mode: "sensor",
      temperature: null,
      control: true,
      probes: [{ type: "ato", uid: "0x1", name: "ATO" }],
    });
    expect(el.shadowRoot.querySelector(".sce-ato-info")).not.toBeNull();
    expect(el.shadowRoot.querySelector(".sce-params")).toBeNull();
  });

  it("renders an empty parameter block for a type without any parameter", () => {
    // Only the ATO type has none, and it is shown as a notice instead; the
    // block itself must still cope with such a descriptor.
    const el = makeElement();
    const tpl = el._renderSensorParams({
      unit: "",
      defaultValue: 0,
      defaultDelta: 0,
      hasValue: false,
      hasDirection: false,
      hasTurnOn: false,
      hasHysteresis: false,
      hasFallback: false,
      isAto: false,
    });
    expect(tpl.values.every((v: any) => typeof v === "symbol")).toBe(true);
  });

  it("renders no parameters for a selection out of range", () => {
    const el = makeElement();
    el._buildProbeList();
    el._probeIdx = 4;
    const tpl = el._renderSensor();
    // Neither the ATO notice nor the parameter block is produced
    const json = JSON.stringify(tpl.values);
    expect(json).not.toContain("sce-params");
  });
});

// ─── Save ───────────────────────────────────────────────────────────────────

describe("PowerSensor save", () => {
  it("does nothing without a config entry", async () => {
    const el = makeElement({ entry: null });
    await el._save();
    expect(el.hass.callService).not.toHaveBeenCalled();
  });

  it("does nothing without hass", async () => {
    const el = makeElement();
    const hass = el.hass;
    el.hass = null;
    await el._save();
    expect(hass.callService).not.toHaveBeenCalled();
    expect(el._saving).toBe(false);
  });

  it.each(["on", "off"])(
    "writes the %s mode and the socket name, then closes",
    async (mode) => {
      const el = makeElement({ mode });
      el._mode = mode;
      const quit = vi.fn();
      el.addEventListener("quit-dialog", quit);
      await el._save();
      expect(lastRequest(el)).toEqual({
        device_id: "entry-1",
        access_path: "/sockets/config",
        method: "put",
        data: { sockets: [{ number: 1, mode, name: "Heater" }] },
        refresh: "config",
        wait: 2,
      });
      expect(quit).toHaveBeenCalled();
      expect(el._saving).toBe(false);
    },
  );

  it("leaves the name out when the socket has none", async () => {
    const el = makeElement({ name: null });
    el._mode = "off";
    await el._save();
    expect(lastRequest(el).data.sockets[0]).toEqual({ number: 1, mode: "off" });
  });

  it("writes the schedule mode then the cleaned-up intervals", async () => {
    for (const name of ["Pump", null]) {
      const el = makeElement({ name });
      el._mode = "schedule";
      el._intervals = [
        { time: 1500, duration: 10 },
        { time: 30, duration: 0 },
        { time: 10, duration: 20 },
      ];
      await el._save();
      const [first, second] = el.hass.callService.mock.calls.map(
        (c: any) => c[2],
      );
      expect(first.data.sockets[0].mode).toBe("schedule");
      expect("name" in first.data.sockets[0]).toBe(name !== null);
      expect(second.access_path).toBe("/socket/1/config/schedule");
      expect(second.data.intervals).toEqual([
        { time: 10, duration: 20 },
        { time: 1439, duration: 10 },
      ]);
    }
  });

  it("subscribes the socket to the local probe with its thresholds", async () => {
    const el = makeElement();
    el._mode = "sensor";
    el._buildProbeList();
    el._value = 26;
    el._isAbove = false;
    el._hysteresis = 0.4;
    el._turnOn = false;
    el._fallbackOn = true;
    await el._save();
    const [mode, sub] = el.hass.callService.mock.calls.map((c: any) => c[2]);
    expect(mode.data.sockets[0]).toEqual({
      number: 1,
      mode: "sensor",
      name: "Heater",
    });
    expect(sub.access_path).toBe("/temperature/subscribe");
    expect(sub.data.sockets[0]).toEqual({
      number: 1,
      default_state: true,
      app_cache: "temperature",
      turn_on: false,
      is_above: false,
      value: 26,
      hysteresis: 0.4,
      sensor: "primary",
    });
  });

  it("sends only the parameters the local probe type supports", async () => {
    const el = makeElement({ name: null });
    el._mode = "sensor";
    el._probeOptions = [
      {
        label: "x",
        uid: "u",
        type: "ato",
        sensor: "primary",
        from_control: false,
      },
    ];
    el._probeIdx = 0;
    await el._save();
    expect(lastRequest(el).data.sockets[0]).toEqual({
      number: 1,
      default_state: false,
      app_cache: "ato",
      sensor: "primary",
    });
  });

  /** A socket in sensor mode on the given hub probe, ready to save. */
  function onHubProbe(probes: any[], opts: SetupOptions = {}): any {
    const el = makeElement({
      temperature: null,
      control: true,
      probes,
      ...opts,
    });
    el._mode = "sensor";
    el._buildProbeList();
    return el;
  }

  /** Requests sent, as [device_id, access_path, data]. */
  function requests(el: any): any[] {
    return el.hass.callService.mock.calls.map((c: any) => [
      c[2].device_id,
      c[2].access_path,
      c[2].data,
    ]);
  }

  it("configures a hub probe on the RSPower then on the RSControl", async () => {
    // Replays the Red Sea app capture: ATO temperature on socket 4 (0-based)
    const el = onHubProbe(
      [{ type: "ato", uid: "0x0097E", name: "ATO", temp_value: 25.3 }],
      { name: null },
    );
    el.device.socket_id = 5;
    el._probeIdx = 1;
    el._value = 25;
    el._isAbove = true;
    el._hysteresis = 0.5;
    el._turnOn = false;
    el._fallbackOn = false;
    const quit = vi.fn();
    el.addEventListener("quit-dialog", quit);
    await el._save();
    expect(requests(el)).toEqual([
      [
        "entry-1",
        "/subscribe",
        { sockets: [{ number: 4, default_state: false, app_cache: "ato" }] },
      ],
      [
        "entry-1",
        "/sockets/config",
        { sockets: [{ number: 4, mode: "sensor" }] },
      ],
      [
        "ctl-entry",
        "/socket/4/subscribe",
        {
          uid: "0x0097E",
          is_above: true,
          sensor: "temperature",
          type: "ato",
          value: 25,
          trigger_op: false,
          hysteresis: 0.5,
        },
      ],
    ]);
    expect(quit).toHaveBeenCalled();
  });

  it("sends the hub only the parameters of the probe type", async () => {
    // Water level: no threshold, the fallback is repeated (capture: log2)
    const ato = onHubProbe([{ type: "ato", uid: "0x0024E", name: "ATO" }]);
    ato.device.socket_id = 6;
    await ato._save();
    expect(requests(ato)).toEqual([
      [
        "entry-1",
        "/subscribe",
        { sockets: [{ number: 5, default_state: false, app_cache: "ato" }] },
      ],
      [
        "entry-1",
        "/sockets/config",
        { sockets: [{ number: 5, mode: "sensor", name: "Heater" }] },
      ],
      [
        "ctl-entry",
        "/socket/5/subscribe",
        {
          uid: "0x0024E",
          default_state: false,
          sensor: "primary",
          type: "ato",
        },
      ],
    ]);

    const leak = onHubProbe([{ type: "leak", uid: "0x2", name: "Leak" }]);
    leak._turnOn = true;
    await leak._save();
    expect(lastRequest(leak).data).toEqual({
      uid: "0x2",
      type: "leak",
      sensor: "primary",
      trigger_op: true,
    });
  });

  it("keeps the socket name when switching to sensor mode", async () => {
    const el = onHubProbe([{ type: "orp", uid: "0x1", name: "ORP" }]);
    await el._save();
    expect(requests(el)[1][2].sockets[0]).toEqual({
      number: 1,
      mode: "sensor",
      name: "Heater",
    });
  });

  it("writes nothing when the RSControl cannot be addressed", async () => {
    const probes = [{ type: "orp", uid: "0x1", name: "ORP" }];
    const unknown = (el: any) => el;
    const noDevice = (el: any) => {
      el.device.device.linked_control_device = () => null;
      return el;
    };
    const oldStrip = (el: any) => {
      delete el.device.device.linked_control_device;
      return el;
    };
    for (const [opts, tweak] of [
      [{ controlEntry: null }, unknown],
      [{}, noDevice],
      [{}, oldStrip],
    ] as Array<[SetupOptions, (el: any) => any]>) {
      const el = tweak(onHubProbe(probes, opts));
      await el._save();
      expect(el.hass.callService).not.toHaveBeenCalled();
      expect(el._saveError).toBe("RSControl not found");
    }
  });

  it("reports a missing probe instead of closing", async () => {
    const el = makeElement({ temperature: null });
    el._mode = "sensor";
    el._buildProbeList();
    const quit = vi.fn();
    el.addEventListener("quit-dialog", quit);
    await el._save();
    expect(el._saveError).toBe("No probe selected");
    expect(quit).not.toHaveBeenCalled();
    expect(el.hass.callService).not.toHaveBeenCalled();
  });

  it.each([
    [new Error("device offline"), "device offline"],
    ["timeout", "timeout"],
    [null, "Save failed"],
  ])("reports a rejected request (%s)", async (err, text) => {
    const el = makeElement();
    el._mode = "on";
    el.hass.callService.mockRejectedValue(err);
    await el._save();
    expect(el._saveError).toBe(text);
    expect(el._saving).toBe(false);
  });

  it("the Save button saves, and shows progress and errors", async () => {
    const el = await mount({ mode: "off" });
    let release: () => void = () => {};
    el.hass.callService.mockReturnValue(
      new Promise<void>((r) => (release = r)),
    );
    button(el, "Save").click();
    await el.updateComplete;
    const save = el.shadowRoot.querySelector(".sce-save-btn");
    expect(save.disabled).toBe(true);
    expect(save.textContent.trim()).toBe("…");
    release();
    await Promise.resolve();
    await el.updateComplete;
    expect(save.disabled).toBe(false);

    el._saveError = "device offline";
    await el.updateComplete;
    expect(el.shadowRoot.querySelector(".sce-error").textContent).toContain(
      "device offline",
    );
  });
});

// ─── Default threshold of the selected probe ────────────────────────────────

describe("PowerSensor probe defaults", () => {
  const PH = [{ type: "ph", uid: "0x1", name: "pH" }];

  it("gives a probe picked by default its own threshold", async () => {
    // No local probe: the hub's pH comes first, not a 25 °C threshold
    const el = await mount({
      mode: "on",
      temperature: null,
      control: true,
      probes: PH,
    });
    el._onModeClick("sensor");
    expect(el._value).toBe(8.2);
    expect(el._hysteresis).toBe(0.1);
  });

  it("applies it once the hub's probes arrive", async () => {
    const el = makeElement({
      mode: "sensor",
      temperature: null,
      control: true,
      probes: [{ type: "orp", uid: "0x2", name: "ORP" }],
      fetched: false,
    });
    document.body.appendChild(el);
    await settle(el);
    expect(el._probeOptions[el._probeIdx].type).toBe("orp");
    expect(el._value).toBe(420);
    expect(el._hysteresis).toBe(25);
  });

  it("keeps the socket's own rule", async () => {
    const el = await mount({
      mode: "schedule",
      temperature: null,
      control: true,
      probes: PH,
      sensorSource: "control",
      sensorConfig: { type: "ph", uid: "0x1", value: 7.9, hysteresis: 0.2 },
    });
    // Opened on the schedule: the rule is only read when switching
    el._onModeClick("sensor");
    expect(el._value).toBe(7.9);
    expect(el._hysteresis).toBe(0.2);
    // Switching away and back keeps it
    el._onModeClick("on");
    el._value = 7.5;
    el._onModeClick("sensor");
    expect(el._value).toBe(7.5);
  });

  it("keeps what the user picked", async () => {
    const el = makeElement({
      mode: "sensor",
      control: true,
      probes: PH,
      fetched: false,
    });
    el._buildProbeList();
    el._probeTouched = true;
    el._value = 12;
    await el._fetchControlProbes();
    expect(el._value).toBe(12);
  });

  it("does nothing without any probe", () => {
    const el = makeElement({ mode: "on", temperature: null });
    el._onModeClick("sensor");
    expect(el._probeOptions).toEqual([]);
    expect(el._value).toBe(25);
  });
});
