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
 * The rest covers the probe list built from the Home Assistant registries,
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

interface SetupOptions {
  mode?: string | null;
  name?: string | null;
  temperature?: string | null;
  schedule?: any;
  sensorConfig?: any;
  control?: boolean;
  controlDevice?: any;
  controlEntities?: Record<string, any>;
  controlStates?: Record<string, any>;
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
    name = "Heater",
    temperature = "25.1",
    schedule,
    sensorConfig,
    control = false,
    controlDevice = { id: "ctl", name: "Hub" },
    controlEntities = {},
    controlStates = {},
    entry = "entry-1",
  } = opts;

  const entities: Record<string, any> = {};
  const states: Record<string, any> = { ...controlStates };
  if (mode !== null) {
    entities.socket_mode = { entity_id: "sensor.mode" };
    states["sensor.mode"] = {
      state: mode,
      attributes: { schedule, sensor_config: sensorConfig },
    };
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
    linked_control_device: () => controlDevice,
  };
  const socket = { socket_id: 2, entities, device: strip };
  const hass = {
    states,
    entities: controlEntities,
    callService: vi.fn().mockResolvedValue(undefined),
  };
  return { socket, strip, hass };
}

/** An element wired to a setup, built without being connected. */
function makeElement(opts: SetupOptions = {}): any {
  const { socket, hass } = makeSetup(opts);
  const el = new StubPowerSensor() as any;
  el.device = socket;
  el.hass = hass;
  return el;
}

/** An element wired to a setup and mounted, after its first render. */
async function mount(opts: SetupOptions = {}): Promise<any> {
  const el = makeElement(opts);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** ReefControl registry entries for the given translation keys. */
function controlRegistry(
  keys: string[],
  device_id = "ctl",
): Record<string, any> {
  const out: Record<string, any> = {};
  keys.forEach((tk, i) => {
    out[`sensor.ctl_${i}`] = {
      entity_id: `sensor.ctl_${i}`,
      device_id,
      translation_key: tk,
    };
  });
  return out;
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
      controlEntities: controlRegistry(["ph_value"]),
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
    el.device = { entities: {}, device: {} };
    el._buildProbeList();
    expect(el._probeOptions).toEqual([]);
    el.device = { entities: {}, device: { has_control_link: () => true } };
    el._buildProbeList();
    expect(el._probeOptions).toEqual([]);
    el.device = null;
    el._buildProbeList();
    expect(el._probeOptions).toEqual([]);
  });

  it("needs the ReefControl device and the entity registry", () => {
    const noDevice = makeElement({
      temperature: null,
      control: true,
      controlDevice: null,
      controlEntities: controlRegistry(["ph"]),
    });
    noDevice._buildProbeList();
    expect(noDevice._probeOptions).toEqual([]);

    const noRegistry = makeElement({ temperature: null, control: true });
    noRegistry.hass.entities = undefined;
    noRegistry._buildProbeList();
    expect(noRegistry._probeOptions).toEqual([]);
  });

  it("lists the ReefControl probes in a fixed order", () => {
    const el = makeElement({
      temperature: null,
      control: true,
      controlEntities: controlRegistry([
        "leak",
        "ato_level",
        "temperature",
        "ec_value",
        "orp",
        "ph_value",
        "ph_temperature",
      ]),
    });
    el._buildProbeList();
    expect(el._probeOptions.map((p: any) => `${p.type}:${p.sensor}`)).toEqual([
      "ph:primary",
      "ph:temperature",
      "orp:primary",
      "ec:primary",
      "ec:temperature",
      "temperature:primary",
      "ato:primary",
      "leak:primary",
    ]);
    expect(el._probeOptions[0].label).toBe("Hub — pH");
    expect(el._probeOptions.every((p: any) => p.from_control)).toBe(true);
  });

  it("offers the temperature half of a dual probe only with a temperature entity", () => {
    const el = makeElement({
      temperature: null,
      control: true,
      controlEntities: controlRegistry(["ph_value", "ec"]),
    });
    el._buildProbeList();
    expect(el._probeOptions.map((p: any) => p.sensor)).toEqual([
      "primary",
      "primary",
    ]);
  });

  it("skips entities of other devices, without key or unknown", () => {
    const el = makeElement({
      temperature: null,
      control: true,
      controlEntities: {
        ...controlRegistry(["ph"], "other"),
        "sensor.nokey": { entity_id: "sensor.nokey", device_id: "ctl" },
        "sensor.empty": {
          entity_id: "sensor.empty",
          device_id: "ctl",
          translation_key: "",
        },
        "sensor.phosphate": {
          entity_id: "sensor.phosphate",
          device_id: "ctl",
          translation_key: "phosphate",
        },
        "sensor.null": null,
      },
    });
    el._buildProbeList();
    expect(el._probeOptions).toEqual([]);
  });

  it("takes the probe uid from its state, else from its entity id", () => {
    const el = makeElement({
      temperature: null,
      control: true,
      controlEntities: controlRegistry(["ph", "ph_temp_x", "orp"]),
      controlStates: { "sensor.ctl_0": { attributes: { uid: 42 } } },
    });
    el._buildProbeList();
    expect(el._probeOptions[0].uid).toBe("42");
    expect(el._probeOptions[1].uid).toBe("sensor.ctl_2");

    el.hass.states = undefined;
    el._buildProbeList();
    expect(el._probeOptions[0].uid).toBe("sensor.ctl_0");
  });

  it("names the probes after the ReefControl device", () => {
    const named = (device: any) => {
      const el = makeElement({
        temperature: null,
        control: true,
        controlDevice: device,
        controlEntities: controlRegistry(["orp"]),
      });
      el._buildProbeList();
      return el._probeOptions[0].label;
    };
    expect(named({ id: "ctl", name: "Hub", name_by_user: "Mine" })).toBe(
      "Mine — ORP",
    );
    expect(named({ id: "ctl" })).toBe("RSControl — ORP");
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
      controlEntities: controlRegistry(["orp"]),
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
      controlEntities: controlRegistry(["leak"]),
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
      controlEntities: controlRegistry(["ato"]),
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

  it("binds the socket to a ReefControl probe", async () => {
    const el = makeElement({
      temperature: null,
      control: true,
      controlEntities: controlRegistry(["orp"]),
    });
    el._mode = "sensor";
    el._buildProbeList();
    await el._save();
    const req = lastRequest(el);
    expect(req.access_path).toBe("/subscribe");
    expect(req.data.sockets[0]).toEqual({
      number: 1,
      default_state: false,
      app_cache: "orp",
    });
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
