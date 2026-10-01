// Tests for the ReefWave view
// Covers: src/devices/redsea/rswave/rswave.ts
//         src/devices/redsea/rswave/rswave.mapping.ts
//         src/devices/redsea/rswave/rswave.dialogs.ts
//         src/devices/redsea/rswave/rswave_program.ts
//         src/devices/redsea/rswave/rswave_element.ts
//         src/devices/redsea/rswave/rswave_flow.ts
//         src/devices/redsea/rswave/rswave_label.ts
//         src/devices/redsea/rswave/rswave_speed.ts
//         src/devices/redsea/rswave/rswave_schedule.ts

import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "lit";

import "../src/devices/index";
import {
  RSWave,
  RSWave25,
  RSWave45,
  RUNNING_MODES,
} from "../src/devices/redsea/rswave/rswave";
import {
  CLIPS,
  FULL_CANVAS,
  config,
  icon_at,
} from "../src/devices/redsea/rswave/rswave.mapping";
import { dialogs_rswave } from "../src/devices/redsea/rswave/rswave.dialogs";
import * as W from "../src/devices/redsea/rswave/rswave_program";
import {
  RSWaveElement,
  RSWAVE_CANVAS,
  RSWAVE_TICK_MS,
} from "../src/devices/redsea/rswave/rswave_element";
import {
  FLOW_ALT_PERIODS,
  FLOW_DEFAULTS,
  FLOW_PERIOD,
  RSWaveFlow,
} from "../src/devices/redsea/rswave/rswave_flow";
import {
  LABEL_DEFAULTS,
  MODE_COLOR,
  MODE_COLOR_OFF,
  RSWaveLabel,
} from "../src/devices/redsea/rswave/rswave_label";
import { RSWaveSpeed } from "../src/devices/redsea/rswave/rswave_speed";
import {
  PANEL_GRAPH,
  RSWaveSchedule,
  SMALL_GRAPH,
  direction_label,
  program_graph,
  used_types,
  type_label,
} from "../src/devices/redsea/rswave/rswave_schedule";

// --- Fixtures ---------------------------------------------------------------

/** Day program as the integration exposes it (simulator fixture). */
const SCHEDULE = [
  { st: 0, name: "Night", type: "un", direction: "fw", fti: 25, rti: 25 },
  {
    st: 480,
    name: "Morning",
    type: "re",
    direction: "alt",
    frt: 15,
    rrt: 10,
    fti: 50,
    rti: 40,
    sn: 3,
    pd: 10,
    sync: true,
  },
  { st: 720, name: "Storm", type: "ra", direction: "alt", fti: 80, rti: 60 },
  { st: 1140, name: "Evening", type: "su", direction: "rw", fti: 40, rti: 45 },
  { st: 1320, name: "No Wave", type: "nw", direction: "fw" },
];

class StubWave extends RSWave45 {}
if (!customElements.get("stub-rswave-view"))
  customElements.define("stub-rswave-view", StubWave);
class StubWaveElement extends RSWaveElement {}
if (!customElements.get("stub-rswave-element"))
  customElements.define("stub-rswave-element", StubWaveElement);
class StubFlow extends RSWaveFlow {}
if (!customElements.get("stub-rswave-flow"))
  customElements.define("stub-rswave-flow", StubFlow);
class StubLabel extends RSWaveLabel {}
if (!customElements.get("stub-rswave-label"))
  customElements.define("stub-rswave-label", StubLabel);
class StubSpeed extends RSWaveSpeed {}
if (!customElements.get("stub-rswave-speed"))
  customElements.define("stub-rswave-speed", StubSpeed);
class StubSchedule extends RSWaveSchedule {}
if (!customElements.get("stub-rswave-schedule"))
  customElements.define("stub-rswave-schedule", StubSchedule);

interface Opts {
  device_state?: string;
  mode?: string;
  type?: string;
  direction?: string;
  fti?: string;
  rti?: string;
  schedule?: any;
  preview?: boolean;
  no_mode?: boolean;
  no_format?: boolean;
}

/** Build a hass object holding a ReefWave. */
function makeHass(opts: Opts = {}) {
  const states: Record<string, any> = {};
  const entities: Record<string, any> = {};
  const add = (
    domain: string,
    key: string,
    state: string,
    attributes: any = {},
  ) => {
    const id = `${domain}.wave_${key}`;
    states[id] = { entity_id: id, state, attributes, last_updated: "t0" };
    entities[id] = { entity_id: id, device_id: "dev1", translation_key: key };
  };
  add("switch", "device_state", opts.device_state ?? "on");
  add("switch", "maintenance", "off");
  if (!opts.no_mode) add("sensor", "mode", opts.mode ?? "auto");
  add("sensor", "wifi_quality", "good");
  add("sensor", "wave_type", opts.type ?? "re", {
    schedule: opts.schedule === undefined ? SCHEDULE : opts.schedule,
  });
  add("sensor", "wave_direction", opts.direction ?? "alt");
  add("sensor", "wave_forward_intensity", opts.fti ?? "50");
  add("sensor", "wave_backward_intensity", opts.rti ?? "40");
  if (opts.preview) {
    add("select", "preview_wave_type", "st");
    add("select", "preview_wave_direction", "rw");
    add("number", "wave_forward_intensity", "30");
    add("number", "wave_backward_intensity", "70");
  }
  return {
    states,
    entities,
    devices: { dev1: { id: "dev1", disabled_by: null } },
    config: { time_zone: "UTC" },
    formatEntityState: opts.no_format
      ? undefined
      : (s: any) => s.state.toUpperCase(),
    callService: vi.fn(),
  } as any;
}

/** Build a ready-to-render ReefWave. */
function makeWave(opts: Opts = {}): any {
  const dev = new StubWave() as any;
  dev.device = {
    name: "WAVE",
    elements: [
      {
        id: "dev1",
        model: "RSWAVE45",
        name: "RSWAVE45",
        name_by_user: "Left pump",
        identifiers: [["redsea", "x"]],
        disabled_by: null,
      },
    ],
  };
  dev.user_config = {};
  dev.hass = makeHass(opts);
  dev._populate_entities();
  return dev;
}

/** Fix the clock at a UTC time of Tuesday 2026-01-13. */
function at(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2026, 0, 13, h, m)));
}

async function mount(el: any): Promise<ShadowRoot> {
  document.body.appendChild(el);
  await el.updateComplete;
  return el.shadowRoot as ShadowRoot;
}

function makeElement(Ctor: any, dev: any, conf: any = {}, stateObj = null) {
  const el = new Ctor();
  el.device = dev;
  el.conf = conf;
  el.stateOn = true;
  el.stateObj = stateObj;
  el.hass = dev?.hass ?? {};
  return el;
}

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

// ─── Program helpers ─────────────────────────────────────────────────────────

describe("rswave_program", () => {
  it("normalize_schedule() sorts, chains the ends and starts the day at 0", () => {
    const out = W.normalize_schedule([
      { st: 600, type: "re", fti: "70", direction: "alt" },
      { st: 60, name: "Night" },
      { st: "x" },
      null,
      "junk",
      { st: 600, type: "ra" },
    ]);
    expect(out.map((i) => [i.start, i.end])).toEqual([
      [0, 600],
      [600, 1440],
    ]);
    // Defaults of a sparse entry
    expect(out[0]).toMatchObject({
      name: "Night",
      type: "nw",
      direction: "fw",
      fti: 0,
      rti: 0,
      frt: 0,
      sync: false,
    });
    // The second of two intervals on the same minute wins
    expect(out[1].type).toBe("ra");
  });

  it("normalize_schedule() reads a full entry and rejects non-lists", () => {
    const [night, morning] = W.normalize_schedule(SCHEDULE);
    expect(night.end).toBe(480);
    expect(morning).toMatchObject({
      start: 480,
      end: 720,
      frt: 15,
      rrt: 10,
      sn: 3,
      pd: 10,
      sync: true,
    });
    expect(W.normalize_schedule(null)).toEqual([]);
    expect(W.normalize_schedule({})).toEqual([]);
    expect(W.normalize_schedule([])).toEqual([]);
    // A start beyond the day is clamped onto its last minute
    expect(W.normalize_schedule([{ st: 0 }, { st: 5000 }])[1].start).toBe(1439);
  });

  it("pct() clamps and survives junk", () => {
    expect(W.pct(150)).toBe(100);
    expect(W.pct(-3)).toBe(0);
    expect(W.pct("42")).toBe(42);
    expect(W.pct(null)).toBe(0);
    expect(W.pct("")).toBe(0);
    expect(W.pct("abc")).toBe(0);
  });

  it("current_index() finds the running interval", () => {
    const p = W.normalize_schedule(SCHEDULE);
    expect(W.current_index(p, 0)).toBe(0);
    expect(W.current_index(p, 479)).toBe(0);
    expect(W.current_index(p, 480)).toBe(1);
    expect(W.current_index(p, 1439)).toBe(4);
    expect(W.current_index([], 100)).toBe(-1);
    // A program that would not start at midnight still answers its first
    const late = [{ ...p[1], start: 600 }];
    expect(W.current_index(late, 100)).toBe(0);
  });

  it("wave_speed() is the forward intensity, whatever the direction", () => {
    const w = { type: "re", direction: "fw", fti: 30, rti: 70 };
    expect(W.wave_speed(w)).toBe(30);
    expect(W.wave_speed({ ...w, direction: "rw" })).toBe(30);
    expect(W.wave_speed({ ...w, direction: "alt" })).toBe(30);
    expect(W.wave_speed({ ...w, type: "nw" })).toBe(0);
  });

  it("type_color(), hhmm() and flow_duration()", () => {
    expect(W.type_color("re")).toBe(W.WAVE_TYPE_COLORS.re);
    expect(W.type_color("zz")).toBe(W.WAVE_UNKNOWN_COLOR);
    expect(W.hhmm(0)).toBe("00:00");
    expect(W.hhmm(605)).toBe("10:05");
    expect(W.hhmm(1440)).toBe("24:00");
    expect(W.hhmm(-5)).toBe("00:00");
    expect(W.flow_duration(0)).toBe(0);
    expect(W.flow_duration(100)).toBeCloseTo(0.6);
    expect(W.flow_duration(1)).toBeCloseTo(6);
    expect(W.flow_duration(50, 1, 2)).toBeGreaterThan(1);
    expect(W.WAVE_TYPES).toContain("su");
    expect(W.WAVE_DIRECTIONS).toContain("alt");
  });
});

// ─── Device ──────────────────────────────────────────────────────────────────

describe("RSWave device", () => {
  it("both models share the mapping and the program dialog", () => {
    for (const C of [RSWave25, RSWave45]) {
      const d = new (customElements.get(
        C === RSWave25 ? "redsea-rswave25" : "redsea-rswave45",
      ) as any)();
      expect(d).toBeInstanceOf(C);
      expect(d.initial_config).toBe(config);
      expect(d.dialogs.config).toBeDefined();
      expect(d.dialogs.wifi).toBeDefined();
    }
    expect(RSWave.styles).toBeDefined();
  });

  it("reads the program and the running interval", () => {
    at("13:00");
    const dev = makeWave();
    expect(dev.now_minute()).toBe(780);
    expect(dev.schedule()).toHaveLength(5);
    expect(dev.current_index()).toBe(2);
  });

  it("reports the mode, translated when Home Assistant can", () => {
    const dev = makeWave({ mode: "feeding" });
    expect(dev.mode()).toBe("feeding");
    expect(dev.mode_label()).toBe("FEEDING");
    expect(makeWave({ no_format: true }).mode_label()).toBe("auto");
    const none = makeWave({ no_mode: true });
    expect(none.mode()).toBe("");
    expect(none.mode_label()).toBe("");
  });

  it("runs only switched on, in auto or preview", () => {
    expect(RUNNING_MODES).toEqual(["auto", "preview"]);
    expect(makeWave().is_running()).toBe(true);
    expect(makeWave({ mode: "feeding" }).is_running()).toBe(false);
    expect(makeWave({ device_state: "off" }).is_running()).toBe(false);
  });

  it("speed and direction come from the current wave", () => {
    const dev = makeWave({ fti: "50", rti: "40", direction: "alt" });
    expect(dev.current_wave()).toEqual({
      type: "re",
      direction: "alt",
      fti: 50,
      rti: 40,
    });
    expect(dev.speed()).toBe(50);
    expect(dev.direction()).toBe("alt");

    const nw = makeWave({ type: "nw" });
    expect(nw.speed()).toBe(0);
    expect(nw.direction()).toBe("");

    const stopped = makeWave({ mode: "maintenance" });
    expect(stopped.current_wave()).toBeNull();
    expect(stopped.speed()).toBe(0);
    expect(stopped.direction()).toBe("");
  });

  it("missing current-wave entities read as a stopped forward wave", () => {
    const dev = makeWave();
    for (const key of [
      "sensor.wave_type",
      "sensor.wave_direction",
      "sensor.wave_forward_intensity",
      "sensor.wave_backward_intensity",
    ]) {
      delete dev.entities[key];
    }
    expect(dev.current_wave()).toEqual({
      type: "nw",
      direction: "fw",
      fti: 0,
      rti: 0,
    });
  });

  it("previews with the preview settings", () => {
    const dev = makeWave({ mode: "preview", preview: true });
    expect(dev.current_wave()).toEqual({
      type: "st",
      direction: "rw",
      fti: 30,
      rti: 70,
    });
    expect(dev.speed()).toBe(30);
    // Without the preview entities
    const bare = makeWave({ mode: "preview" });
    expect(bare.current_wave()).toEqual({
      type: "nw",
      direction: "fw",
      fti: 0,
      rti: 0,
    });
  });

  it("display_name() prefers the user's name", () => {
    const dev = makeWave();
    expect(dev.display_name()).toBe("Left pump");
    dev.device.elements[0].name_by_user = null;
    expect(dev.display_name()).toBe("RSWAVE45");
    dev.device.elements = [{}];
    expect(dev.display_name()).toBe("WAVE");
    dev.device = null;
    expect(dev.display_name()).toBe("");
  });

  it("state_signature() follows the watched entities", () => {
    const dev = makeWave();
    const before = dev.state_signature();
    expect(before).toContain("on@t0");
    // A missing entity reads as "-"
    expect(before).toContain("|-|");
    dev._hass.states["sensor.wave_mode"] = {
      ...dev._hass.states["sensor.wave_mode"],
      state: "feeding",
    };
    expect(dev.state_signature()).not.toBe(before);
    // A state without last_updated
    delete dev._hass.states["sensor.wave_mode"].last_updated;
    expect(dev.state_signature()).toContain("feeding@|");
    dev._hass = null;
    expect(dev.state_signature()).toBe("");
  });

  it("renders the picture and its elements", async () => {
    const dev = makeWave();
    const root = await mount(dev);
    expect(root.querySelector("img.device_img")).not.toBeNull();
    for (const tag of [
      "rswave-flow",
      "rswave-label",
      "rswave-speed",
      "rswave-schedule",
      "click-image",
    ]) {
      expect(root.querySelector(tag)).not.toBeNull();
    }
    // Without a background picture
    dev.config.background_img = undefined;
    const tpl = dev._render("", "");
    expect(tpl).toBeDefined();
  });

  it("renderEditor(): nothing while disabled, the common editor else", () => {
    const off = new StubWave() as any;
    expect(off.renderEditor().strings.join("")).toBe("");
    const dev = makeWave();
    dev._editor_common = vi.fn(() => "common");
    const tpl = dev.renderEditor();
    expect(tpl.values).toContain("common");
  });
});

// ─── Mapping and dialogs ─────────────────────────────────────────────────────

describe("rswave mapping and dialogs", () => {
  it("places the buttons on the clips, centred", () => {
    expect(config.elements.device_state.css).toEqual(
      icon_at(...CLIPS.device_state),
    );
    expect(icon_at("1%", "2%")).toMatchObject({
      left: "1%",
      top: "2%",
      transform: "translate(-50%,-50%)",
    });
    expect(config.elements.configuration.tap_action.data.type).toBe("config");
    expect(config.elements.wifi_quality.tap_action.data.type).toBe("wifi");
  });

  it("uses the view elements, overlays on the full picture", () => {
    expect(config.elements.flow.type).toBe("rswave-flow");
    expect(config.elements.flow.css).toBe(FULL_CANVAS);
    expect(config.elements.mode_name.type).toBe("rswave-label");
    expect(config.elements.speed.type).toBe("rswave-speed");
    expect(config.elements.speed.target).toBe(100);
    expect(config.elements.schedule.type).toBe("rswave-schedule");
  });

  it("settings dialog names every entity with its domain", () => {
    const rows = dialogs_rswave.config.content[0].conf.entities;
    const names = rows.filter((r: any) => r.entity).map((r: any) => r.entity);
    for (const n of names) expect(n).toMatch(/^[a-z_]+\.[a-z_]+$/);
    expect(names).toContain("number.wave_forward_intensity");
    expect(names).toContain("sensor.wave_forward_intensity");
  });
});

// ─── Base element ────────────────────────────────────────────────────────────

describe("RSWaveElement", () => {
  it("re-renders only when the signature changes", () => {
    const dev = { state_signature: vi.fn(() => "a") };
    const el = makeElement(StubWaveElement, dev);
    const spy = vi.spyOn(el, "requestUpdate");
    el.hass = {};
    expect(spy).not.toHaveBeenCalled();
    dev.state_signature.mockReturnValue("b");
    el.hass = {};
    expect(spy).toHaveBeenCalled();
    el.device = null;
    expect(el.signature()).toBe("");
    expect(RSWAVE_CANVAS).toEqual({ width: 688, height: 800 });
  });

  it("ticks every minute while connected", async () => {
    vi.useFakeTimers();
    const el = makeElement(StubWaveElement, { state_signature: () => "" });
    await mount(el);
    const spy = vi.spyOn(el, "requestUpdate");
    vi.advanceTimersByTime(RSWAVE_TICK_MS);
    expect(spy).toHaveBeenCalled();
    // A second connection keeps the same timer
    el.connectedCallback();
    el.remove();
    spy.mockClear();
    vi.advanceTimersByTime(RSWAVE_TICK_MS);
    expect(spy).not.toHaveBeenCalled();
    // Disconnecting twice is harmless
    el.disconnectedCallback();
  });
});

// ─── Flow ────────────────────────────────────────────────────────────────────

describe("RSWaveFlow", () => {
  const wave = (speed: number, direction: string) => ({
    speed: () => speed,
    direction: () => direction,
  });

  it("draws nothing while the pump is stopped", async () => {
    for (const w of [wave(0, "fw"), wave(50, ""), wave(50, "up"), {}]) {
      const root = await mount(makeElement(StubFlow, w));
      expect(root.querySelector("svg")).toBeNull();
    }
    const root = await mount(makeElement(StubFlow, null));
    expect(root.querySelector("svg")).toBeNull();
  });

  it("flows forward, faster as the speed rises", async () => {
    const slow = await mount(makeElement(StubFlow, wave(20, "fw")));
    const fast = await mount(makeElement(StubFlow, wave(100, "fw")));
    const g = (r: ShadowRoot) => r.querySelector("g.flow_lines") as any;
    expect(g(slow).classList.contains("fw")).toBe(true);
    const d = (r: ShadowRoot) => parseFloat(g(r).style.animationDuration);
    expect(d(fast)).toBeLessThan(d(slow));
    expect(slow.querySelector("polygon")!.getAttribute("points")).toBe(
      FLOW_DEFAULTS.points.map((p) => p.join(",")).join(" "),
    );
    // Denser at full speed
    const op = (r: ShadowRoot) =>
      Number(r.querySelector("g[clip-path]")!.getAttribute("opacity"));
    expect(op(fast)).toBeGreaterThan(op(slow));
    expect(g(fast).querySelectorAll("path").length).toBeGreaterThan(10);
    expect(FLOW_PERIOD).toBe(36);
  });

  it("reverse and alternate waves, custom geometry", async () => {
    const rw = await mount(makeElement(StubFlow, wave(50, "rw")));
    expect(rw.querySelector("g.flow_lines.rw")).not.toBeNull();
    const alt = await mount(
      makeElement(StubFlow, wave(50, "alt"), {
        geometry: {
          points: [
            [0, 0],
            [0, 100],
            [200, 100],
          ],
        },
      }),
    );
    const g = alt.querySelector("g.flow_lines.alt") as any;
    expect(parseFloat(g.style.animationDuration)).toBeCloseTo(
      W.flow_duration(50) * FLOW_ALT_PERIODS,
      1,
    );
    expect(alt.querySelector("polygon")!.getAttribute("points")).toBe(
      "0,0 0,100 200,100",
    );
  });

  it("re-renders on speed or direction only", () => {
    const w = { speed: vi.fn(() => 10), direction: () => "fw" };
    const el = makeElement(StubFlow, w);
    expect(el.signature()).toBe("10|fw");
    el.device = {};
    expect(el.signature()).toBe("0|");
  });
});

// ─── Label ───────────────────────────────────────────────────────────────────

describe("RSWaveLabel", () => {
  const dev = (o: any = {}) => ({
    is_on: () => o.on ?? true,
    mode: () => o.mode ?? "auto",
    mode_label: () => o.label ?? "Auto",
    display_name: () => o.name ?? "Left pump",
  });

  it("lights the strip in the colour of the mode, the name under it", async () => {
    const root = await mount(makeElement(StubLabel, dev()));
    // No background: the mode is written in its colour
    expect(root.querySelector("rect.mode_hit")!.getAttribute("fill")).toBe(
      "transparent",
    );
    const text = root.querySelector("text.mode_text")!;
    expect(text.getAttribute("fill")).toBe(MODE_COLOR);
    expect(text.textContent!.trim()).toBe("Auto");
    const name = root.querySelector("text.pump_name")!;
    expect(name.querySelector("title")!.textContent).toBe("Left pump");
    expect(name.classList.contains("off")).toBe(false);
    // Under the strip, across its slant
    expect(Number(name.getAttribute("y"))).toBeGreaterThan(LABEL_DEFAULTS.y);
    expect(name.getAttribute("transform")).toContain(
      `rotate(${LABEL_DEFAULTS.angle}`,
    );
  });

  it("greys out when off, unknown modes, missing parts", async () => {
    const off = await mount(makeElement(StubLabel, dev({ on: false })));
    expect(off.querySelector("text.mode_text")!.getAttribute("fill")).toBe(
      MODE_COLOR_OFF,
    );
    expect(off.querySelector("text.pump_name.off")).not.toBeNull();

    const odd = await mount(makeElement(StubLabel, dev({ mode: "weird" })));
    expect(odd.querySelector("text.mode_text")!.getAttribute("fill")).toBe(
      MODE_COLOR,
    );

    const empty = await mount(
      makeElement(StubLabel, dev({ label: " ", name: "" })),
    );
    expect(empty.querySelector("rect")).toBeNull();
    expect(empty.querySelector("text")).toBeNull();

    // A device without helpers: drawn on, nothing to write
    const bare = await mount(makeElement(StubLabel, {}));
    expect(bare.querySelector("text")).toBeNull();
    const none = await mount(makeElement(StubLabel, null));
    expect(none.querySelector("svg")).not.toBeNull();
  });

  it("a click on the mode opens its more-info dialog", async () => {
    const entity = { entity_id: "sensor.wave_mode" };
    const d: any = { ...dev(), get_entity: vi.fn(() => entity) };
    const el = makeElement(StubLabel, d);
    const root = await mount(el);
    const events: any[] = [];
    el.addEventListener("hass-more-info", (e: any) => events.push(e.detail));
    (root.querySelector("g.mode_click") as any).dispatchEvent(
      new MouseEvent("click"),
    );
    expect(d.get_entity).toHaveBeenCalledWith("sensor.mode");
    expect(events).toEqual([{ entityId: "sensor.wave_mode" }]);
    // No mode entity: nothing happens
    d.get_entity = () => null;
    el.more_info(new MouseEvent("click"));
    el.device = {};
    el.more_info(new MouseEvent("click"));
    expect(events).toHaveLength(1);
  });

  it("follows a custom geometry and re-renders on its inputs", async () => {
    const root = await mount(
      makeElement(StubLabel, dev(), { geometry: { x: 100, angle: 0 } }),
    );
    expect(root.querySelector("text.mode_text")!.getAttribute("x")).toBe("100");
    const el = makeElement(StubLabel, dev({ mode: "feeding" }));
    expect(el.signature()).toBe("feeding|Auto|Left pump|true");
    el.device = null;
    expect(el.signature()).toBe("|||true");
  });
});

// ─── Speed ───────────────────────────────────────────────────────────────────

describe("RSWaveSpeed", () => {
  it("draws the device speed out of 100", async () => {
    const dev = makeWave({ fti: "50", rti: "40", direction: "alt" });
    const so = dev._hass.states["sensor.wave_wave_forward_intensity"];
    const el = makeElement(
      StubSpeed,
      dev,
      { name: "sensor.wave_forward_intensity", target: 100 },
      so,
    );
    el.color = "197,91,90";
    const root = await mount(el);
    expect(root.querySelector("text")!.textContent!.trim()).toBe("50%");
  });

  it("re-renders when the computed speed changes", () => {
    let speed = 10;
    const dev = { speed: () => speed, is_on: () => true, entities: {} };
    const el = makeElement(StubSpeed, dev, { target: 100 });
    const spy = vi.spyOn(el, "requestUpdate");
    el.hass = { states: {} };
    expect(spy).not.toHaveBeenCalled();
    speed = 20;
    el.hass = { states: {} };
    expect(spy).toHaveBeenCalled();
    expect(el.hasTargetState()).toBe(true);
    el.device = {};
    expect(el.getValue()).toBe(0);
  });
});

// ─── Program ─────────────────────────────────────────────────────────────────

describe("program_graph()", () => {
  const draw = (intervals: any[], now = 600, opts = SMALL_GRAPH) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    render(program_graph(intervals, now, opts), svg as any);
    return svg;
  };

  it("draws forward above, reverse under, no wave dashed", () => {
    const svg = draw(W.normalize_schedule(SCHEDULE));
    // un fw, re alt (2), ra alt (2), su rw
    expect(svg.querySelectorAll("rect.wave_fw")).toHaveLength(3);
    expect(svg.querySelectorAll("rect.wave_rw")).toHaveLength(3);
    expect(svg.querySelectorAll("line.no_wave")).toHaveLength(1);
    expect(svg.querySelector("line.now_line")).not.toBeNull();
    expect(svg.querySelector("text.title")).toBeNull();
    expect(svg.querySelector("text.empty")).toBeNull();
    // 0, 6, 12, 18, 24 h
    expect(svg.querySelectorAll("text.tick")).toHaveLength(5);
  });

  it("legend of the used types under the plot, titles on demand, empty", () => {
    const prog = W.normalize_schedule([
      { st: 0, type: "ra", fti: 50 },
      { st: 10, type: "re", fti: 50 },
      { st: 600, type: "ra", fti: 50 },
      { st: 700, type: "zz", fti: 50 },
    ]);
    const svg = draw(prog, 0, { ...PANEL_GRAPH, title: "Program" });
    // Once per type, in the app's order, unknown types last
    const items = [...svg.querySelectorAll("text.legend")].map((t) =>
      t.textContent!.trim(),
    );
    expect(items).toEqual([
      type_label("ra"),
      type_label("re"),
      type_label("zz"),
    ]);
    expect(
      svg.querySelectorAll("g.legend_item path")[0].getAttribute("fill"),
    ).toBe(`rgb(${W.WAVE_TYPE_COLORS.ra})`);
    // Under the time ticks
    const tick_y = Number(svg.querySelector("text.tick")!.getAttribute("y"));
    expect(
      Number(svg.querySelector("text.legend")!.getAttribute("y")),
    ).toBeGreaterThan(tick_y);
    expect(svg.querySelector("text.title")!.textContent).toBe("Program");
    expect(svg.querySelectorAll("text.tick")).toHaveLength(9);
    // The block names its type in its tooltip
    expect(svg.querySelector("g.wave_block title")!.textContent).toContain(
      type_label("ra"),
    );

    const empty = draw([]);
    expect(empty.querySelector("text.empty")).not.toBeNull();
    expect(empty.querySelector("line.now_line")).toBeNull();
    expect(empty.querySelector("g.legend_item")).toBeNull();
  });

  it("used_types() lists each type once, known ones first", () => {
    const prog = W.normalize_schedule([
      { st: 0, type: "un" },
      { st: 60, type: "nw" },
      { st: 120, type: "un" },
    ]);
    expect(used_types(prog)).toEqual(["nw", "un"]);
    expect(used_types([])).toEqual([]);
  });

  it("type and direction labels are translated", () => {
    expect(type_label("re")).not.toBe("");
    expect(direction_label("alt")).not.toBe("");
  });
});

describe("RSWaveSchedule (view)", () => {
  it("draws the day, greys out when off", async () => {
    at("09:00");
    const el = makeElement(StubSchedule, makeWave());
    const root = await mount(el);
    expect(root.querySelector(".program.off")).toBeNull();
    expect(root.querySelector("svg.graph text.title")).not.toBeNull();
    expect(root.querySelector(".overlay")).toBeNull();
    const off = makeElement(StubSchedule, makeWave({ device_state: "off" }));
    expect((await mount(off)).querySelector(".program.off")).not.toBeNull();
    const bare = makeElement(StubSchedule, {});
    expect((await mount(bare)).querySelector(".program.off")).toBeNull();
    expect(bare.signature()).toBe("null||false");
  });

  it("re-renders when the program changes", () => {
    const dev = makeWave();
    const el = makeElement(StubSchedule, dev);
    const before = el.signature();
    dev._hass.states["sensor.wave_wave_type"] = {
      ...dev._hass.states["sensor.wave_wave_type"],
      attributes: { schedule: [] },
    };
    expect(el.signature()).not.toBe(before);
  });
});
