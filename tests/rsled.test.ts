// Tests for the ReefLED G1 view
// Covers: src/devices/redsea/rsled/rsled_program.ts
//         src/devices/redsea/rsled/rsled.ts
//         src/devices/redsea/rsled/rsled_element.ts
//         src/devices/redsea/rsled/rsled_sky.ts
//         src/devices/redsea/rsled/rsled_beam.ts
//         src/devices/redsea/rsled/rsled_slider.ts

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "lit";

import "../src/devices/index";
import { RSLed, RSLed160, RSLed170 } from "../src/devices/redsea/rsled/rsled";
import { RSLedSky, SKY_DEFAULTS } from "../src/devices/redsea/rsled/rsled_sky";
import {
  BEAM_DEFAULTS,
  RSLedBeam,
  beam_light,
  is_dark,
} from "../src/devices/redsea/rsled/rsled_beam";
import {
  RSLedSlider,
  KELVIN_MIN,
  KELVIN_MAX,
} from "../src/devices/redsea/rsled/rsled_slider";
import {
  RSLedElement,
  RSLED_TICK_MS,
} from "../src/devices/redsea/rsled/rsled_element";
import { config } from "../src/devices/redsea/rsled/rsled_g1.mapping";
import { config2 } from "../src/devices/redsea/rsled/rsled_g2.mapping";
import { ClickImage } from "../src/base/click_image";
import { dialogs_rsled } from "../src/devices/redsea/rsled/rsled.dialogs";
import * as P from "../src/devices/redsea/rsled/rsled_program";

// --- Fixtures ---------------------------------------------------------------

// Real /auto/1 payload of a RSLED160 (see ha-reefbeat-component fixtures)
const PROG: P.DayProgram = {
  white: {
    points: [
      { i: 100, t: 120 },
      { i: 100, t: 480 },
    ],
    rise: 660,
    set: 1260,
  },
  blue: {
    points: [
      { i: 100, t: 60 },
      { i: 100, t: 540 },
    ],
    rise: 660,
    set: 1341,
  },
  moon: {
    points: [
      { i: 10, t: 75 },
      { i: 10, t: 105 },
    ],
    rise: 1345,
    set: 1523,
  },
};
const CLOUDS = {
  cloud_duration: 4,
  from: 859,
  intensity: "Medium",
  no_cloud_duration: 6,
  to: 996,
};

class StubRSLed160 extends RSLed160 {}
if (!customElements.get("stub-rsled160-view"))
  customElements.define("stub-rsled160-view", StubRSLed160);
class StubRSLedElement extends RSLedElement {}
if (!customElements.get("stub-rsled-element"))
  customElements.define("stub-rsled-element", StubRSLedElement);
class StubRSLed extends RSLed {}
if (!customElements.get("stub-rsled-base"))
  customElements.define("stub-rsled-base", StubRSLed);
class StubRSLed170 extends RSLed170 {}
if (!customElements.get("stub-rsled170-view"))
  customElements.define("stub-rsled170-view", StubRSLed170);

interface Opts {
  white?: number;
  blue?: number;
  moon?: number;
  intensity?: number;
  kelvin?: number | null;
  mode?: string;
  moon_day?: string;
  device_state?: string;
  program?: any;
  clouds?: any;
  no_select?: boolean;
}

/** Build a hass object holding a G1 ReefLED. */
function makeHass(opts: Opts = {}, g2 = false) {
  const states: Record<string, any> = {};
  const entities: Record<string, any> = {};
  const add = (
    domain: string,
    key: string,
    state: string,
    attributes: any = {},
  ) => {
    const id = `${domain}.led_${key}`;
    states[id] = { entity_id: id, state, attributes, last_updated: "t0" };
    entities[id] = { entity_id: id, device_id: "dev1", translation_key: key };
  };
  const b = (p?: number) => Math.round((p ?? 0) * 2.55);
  for (let d = 1; d <= 7; d++) {
    add("sensor", "auto_" + d, "Perso", {
      data: opts.program === undefined ? PROG : opts.program,
      clouds: opts.clouds === undefined ? CLOUDS : opts.clouds,
    });
  }
  if (g2) {
    // A G2 reports its white and blue channels as read-only sensors
    add("sensor", "white", String(opts.white ?? 0));
    add("sensor", "blue", String(opts.blue ?? 0));
  } else {
    add("light", "white", opts.white ? "on" : "off", {
      brightness: b(opts.white),
    });
    add("light", "blue", opts.blue ? "on" : "off", {
      brightness: b(opts.blue),
    });
  }
  add("light", "moon", opts.moon ? "on" : "off", { brightness: b(opts.moon) });
  add("light", "kelvin_intensity", opts.intensity ? "on" : "off", {
    brightness: b(opts.intensity),
    color_temp_kelvin: opts.kelvin === undefined ? 15000 : opts.kelvin,
    min_color_temp_kelvin: 9000,
    max_color_temp_kelvin: 23000,
  });
  if (!opts.no_select) add("select", "mode", opts.mode ?? "auto");
  add("sensor", "mode", opts.mode ?? "auto");
  add("sensor", "todays_moon_day", opts.moon_day ?? "5");
  add("switch", "device_state", opts.device_state ?? "on");
  add("switch", "maintenance", "off");
  add("switch", "acclimation", "on");
  add("switch", "moon_phase", "on");
  add("button", "led_identify", "unknown");
  add("binary_sensor", "battery_level", "off");
  add("sensor", "wifi_quality", "good");
  return {
    states,
    entities,
    devices: { dev1: { id: "dev1", disabled_by: null } },
    config: { time_zone: "UTC" },
    formatEntityState: (s: any) => s.state.toUpperCase(),
    callService: vi.fn(),
  } as any;
}

/** Build a ready-to-render G1 lamp. */
function makeLed(opts: Opts = {}, g2 = false): any {
  const dev = (g2 ? new StubRSLed170() : new StubRSLed160()) as any;
  const hass = makeHass(opts, g2);
  dev.device = {
    name: "LED",
    elements: [
      {
        id: "dev1",
        model: "RSLED160",
        identifiers: [["redsea", "x"]],
        disabled_by: null,
      },
    ],
  };
  dev.user_config = {};
  dev.hass = hass;
  dev._populate_entities();
  return dev;
}

/** Fix the clock at a UTC time of Tuesday 2026-01-13. */
function at(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2026, 0, 13, h, m)));
}

/** Render a MyElement-based element into a container and return its root. */
async function mount(el: any): Promise<ShadowRoot> {
  document.body.appendChild(el);
  await el.updateComplete;
  return el.shadowRoot as ShadowRoot;
}

function makeElement(Ctor: any, dev: any, conf: any, stateObj: any = null) {
  const el = new Ctor();
  el.device = dev;
  el.conf = conf;
  el.stateOn = true;
  el.stateObj = stateObj;
  el.hass = dev.hass;
  return el;
}

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

// ─── Program helpers ─────────────────────────────────────────────────────────

describe("rsled_program: local_time() on odd time zone parts", () => {
  /** Run with Intl.DateTimeFormat giving these parts. */
  function with_parts(values: Record<string, string>, run: () => void) {
    const spy = vi.spyOn(Intl, "DateTimeFormat").mockImplementation(function (
      this: any,
    ) {
      return {
        formatToParts: () =>
          Object.entries(values).map(([type, value]) => ({ type, value })),
      } as any;
    } as any);
    try {
      run();
    } finally {
      spy.mockRestore();
    }
  }

  it("falls back to the browser clock on missing parts", () => {
    const now = new Date(2026, 0, 13, 10, 30);
    const browser = P.local_time(now);
    for (const values of [
      { hour: "10", minute: "30" },
      { weekday: "Tue", minute: "30" },
      { weekday: "Tue", hour: "10" },
    ]) {
      with_parts(values, () =>
        expect(P.local_time(now, "Europe/Paris")).toEqual(browser),
      );
    }
    // Some engines write midnight as 24
    with_parts({ weekday: "Tue", hour: "24", minute: "05" }, () =>
      expect(P.local_time(now, "Europe/Paris")).toEqual({
        minute: 5,
        weekday: 2,
      }),
    );
  });
});

describe("rsled_program: channels", () => {
  it("is_channel() rejects incomplete or inverted windows", () => {
    expect(P.is_channel(null)).toBe(false);
    expect(P.is_channel({ rise: 10 })).toBe(false);
    expect(P.is_channel({ rise: 100, set: 50 })).toBe(false);
    expect(P.is_channel({ rise: 100, set: 150 })).toBe(true);
  });

  it("channel_breakpoints() ramps from rise to set, clamping points", () => {
    const pts = P.channel_breakpoints({
      rise: 100,
      set: 200,
      points: [
        { t: 50, i: 150 },
        { t: 500, i: 20 },
        { t: "x" as any, i: 5 },
        null as any,
      ],
    });
    expect(pts).toEqual([
      [100, 0],
      [150, 100],
      [200, 20],
      [200, 0],
    ]);
    expect(P.channel_breakpoints({ rise: 1, set: 2 })).toEqual([
      [1, 0],
      [2, 0],
    ]);
  });

  it("channel_at() interpolates inside the window, 0 outside", () => {
    expect(P.channel_at(PROG.white, 600)).toBe(0);
    expect(P.channel_at(PROG.white, 660)).toBe(0);
    expect(P.channel_at(PROG.white, 720)).toBe(50);
    expect(P.channel_at(PROG.white, 900)).toBe(100);
    expect(P.channel_at(PROG.white, 1200)).toBe(50);
    expect(P.channel_at(PROG.white, 1300)).toBe(0);
    expect(P.channel_at(undefined, 900)).toBe(0);
    // Vertical step: two breakpoints on the same minute
    const step = { rise: 0, set: 10, points: [{ t: 0, i: 80 }] };
    expect(P.channel_at(step, 0)).toBe(80);
  });

  it("channel_value() adds yesterday's part running past midnight", () => {
    // moon: 1345 -> 1523, i.e. until 01:23 the next day
    expect(P.channel_value(null, PROG.moon, 0)).toBe(10);
    expect(P.channel_value(null, PROG.moon, 30)).toBeCloseTo(7.26, 1);
    expect(P.channel_value(null, PROG.moon, 120)).toBe(0);
    expect(P.channel_value(PROG.moon, null, 1400)).toBeGreaterThan(0);
  });

  it("day_curve() covers the whole day and keeps breakpoints", () => {
    const curve = P.day_curve(PROG.white, PROG.white, 60);
    expect(curve[0]).toEqual([0, 0]);
    expect(curve[curve.length - 1][0]).toBe(1440);
    expect(curve.some(([m]) => m === 780)).toBe(true);
    // Yesterday's moon shows up after midnight
    const moon = P.day_curve(PROG.moon, PROG.moon);
    expect(moon.find(([m]) => m === 0)?.[1]).toBe(10);
    expect(P.day_curve(null, null, 720)).toEqual([
      [0, 0],
      [720, 0],
      [1440, 0],
    ]);
  });

  it("sun_window() spans the white and blue channels", () => {
    expect(P.sun_window(PROG)).toEqual({ rise: 660, set: 1341 });
    expect(P.sun_window(null)).toBeNull();
    expect(P.sun_window({ moon: PROG.moon })).toBeNull();
  });
});

describe("rsled_program: sky", () => {
  it("sun between rise and set", () => {
    const s = P.sky_state(1000, PROG, PROG, PROG);
    expect(s.body).toBe("sun");
    expect(s.progress).toBeCloseTo((1000 - 660) / (1341 - 660));
    expect([s.start, s.end]).toEqual([660, 1341]);
  });

  it("moon from today's set to tomorrow's rise", () => {
    const s = P.sky_state(1400, PROG, PROG, PROG);
    expect(s.body).toBe("moon");
    expect([s.start, s.end]).toEqual([1341, 660 + 1440]);
  });

  it("moon in the morning from yesterday's set to today's rise", () => {
    const s = P.sky_state(300, PROG, PROG, null);
    expect(s.body).toBe("moon");
    expect([s.start, s.end]).toEqual([1341 - 1440, 660]);
  });

  it("yesterday's day running past midnight keeps the sun up", () => {
    const late = { white: { rise: 1200, set: 1500 } };
    const s = P.sky_state(30, late, null, null);
    expect(s.body).toBe("sun");
    expect(s.start).toBe(1200 - 1440);
  });

  it("a day without program borrows its neighbours' times", () => {
    const s = P.sky_state(1400, PROG, null, null);
    expect(s.body).toBe("moon");
    expect([s.start, s.end]).toEqual([1341, 660 + 1440]);
    expect(P.sky_state(1400, null, null, PROG).end).toBe(660 + 1440);
  });

  it("no program: moon at the zenith", () => {
    expect(P.sky_state(600, null, null, null)).toEqual({
      body: "moon",
      progress: 0.5,
      start: null,
      end: null,
    });
  });

  it("night without a known start keeps the moon at the zenith", () => {
    // A lamp only lit from 00:40 to 01:00: at 00:30 no set is behind us
    const odd = { white: { rise: 1480, set: 1500 } };
    const s = P.sky_state(30, odd, odd, odd);
    expect(s).toEqual({ body: "moon", progress: 0.5, start: null, end: 40 });
  });

  it("format_minutes() wraps over midnight", () => {
    expect(P.format_minutes(65)).toBe("01:05");
    expect(P.format_minutes(1523)).toBe("01:23");
    expect(P.format_minutes(-60)).toBe("23:00");
  });

  it("clouds_state() counts clouds and checks their window", () => {
    expect(P.clouds_state(CLOUDS, 900)).toEqual({ count: 2, active: true });
    expect(P.clouds_state(CLOUDS, 100)).toEqual({ count: 2, active: false });
    expect(P.clouds_state({ intensity: "High" }, 900)).toEqual({
      count: 3,
      active: false,
    });
    expect(P.clouds_state({ intensity: "Low", from: 0, to: 10 }, 5).count).toBe(
      1,
    );
    expect(P.clouds_state({ intensity: "Strange" }, 0).count).toBe(1);
    expect(P.clouds_state({ intensity: "Off" }, 0).count).toBe(0);
    expect(P.clouds_state({}, 0).count).toBe(0);
    expect(P.clouds_state(null, 0)).toEqual({ count: 0, active: false });
  });
});

describe("rsled_program: time", () => {
  it("local_time() uses the given time zone", () => {
    // Tuesday 2026-01-13 23:30 UTC is Wednesday 00:30 in Paris
    const d = new Date(Date.UTC(2026, 0, 13, 23, 30));
    expect(P.local_time(d, "Europe/Paris")).toEqual({
      minute: 30,
      weekday: 3,
    });
    expect(P.local_time(d, "UTC")).toEqual({ minute: 1410, weekday: 2 });
  });

  it("local_time() falls back to the browser clock", () => {
    const d = new Date(2026, 0, 11, 7, 5); // a Sunday, local time
    expect(P.local_time(d)).toEqual({ minute: 425, weekday: 7 });
    expect(P.local_time(d, "Not/AZone")).toEqual({ minute: 425, weekday: 7 });
  });

  it("local_time() falls back when the formatter gives odd parts", () => {
    const spy = vi
      .spyOn(Intl, "DateTimeFormat")
      .mockImplementation(
        () => ({ formatToParts: () => [{ type: "hour", value: "07" }] }) as any,
      );
    const d = new Date(2026, 0, 11, 7, 5);
    expect(P.local_time(d, "UTC")).toEqual({ minute: 425, weekday: 7 });
    spy.mockRestore();
  });

  it("previous_weekday() wraps Monday to Sunday", () => {
    expect(P.previous_weekday(1)).toBe(7);
    expect(P.previous_weekday(5)).toBe(4);
  });
});

describe("rsled_program: moon", () => {
  it("moon_phase() maps the 28-day cycle", () => {
    expect(P.moon_phase(1)).toBe(0);
    expect(P.moon_phase(15)).toBe(0.5);
    expect(P.moon_phase(8)).toBe(0.25);
    expect(P.moon_phase(NaN)).toBe(0.5);
    expect(P.moon_phase(29)).toBe(0);
  });

  it("moon_lit_path() draws each quarter on the right side", () => {
    expect(P.moon_lit_path(0, 10)).toBe("");
    expect(P.moon_lit_path(0.99, 10)).toBe("");
    // Waxing crescent: lit limb on the right, terminator bulging right
    expect(P.moon_lit_path(0.1, 10)).toMatch(
      /0 0 1 0 10 A [\d.]+ 10 0 0 0 0 -10/,
    );
    // Waxing gibbous
    expect(P.moon_lit_path(0.4, 10)).toMatch(/0 0 1 0 10 A [\d.]+ 10 0 0 1/);
    // Waning gibbous: lit limb on the left
    expect(P.moon_lit_path(0.6, 10)).toMatch(/0 0 0 0 10 A [\d.]+ 10 0 0 0/);
    // Waning crescent
    expect(P.moon_lit_path(0.9, 10)).toMatch(/0 0 0 0 10 A [\d.]+ 10 0 0 1/);
    expect(P.moon_lit_path(-0.6, 10)).toBe(P.moon_lit_path(0.4, 10));
  });
});

describe("rsled_program: colours", () => {
  it("light_color() mixes the channels and grows with power", () => {
    const off = P.light_color(0, 0, 0);
    expect(off.alpha).toBe(0.08);
    const white = P.light_color(100, 0);
    expect(white.rgb).toEqual(P.CHANNEL_RGB.white);
    expect(white.alpha).toBeCloseTo(0.75);
    const blue = P.light_color(0, 50);
    expect(blue.rgb).toEqual(P.CHANNEL_RGB.blue);
    expect(blue.alpha).toBeCloseTo(0.45);
    const moon = P.light_color(0, 0, 100);
    expect(moon.rgb).toEqual(P.CHANNEL_RGB.moon);
    expect(P.light_color("x" as any, 200).rgb).toEqual(P.CHANNEL_RGB.blue);
  });

  it("kelvin_to_white_blue() follows the G1 table", () => {
    // Same semantic as the integration: at 9000 K the blue is off
    expect(P.kelvin_to_white_blue(9000)).toEqual({ white: 100, blue: 0 });
    expect(P.kelvin_to_white_blue(12000)).toEqual({ white: 100, blue: 75 });
    expect(P.kelvin_to_white_blue(15000)).toEqual({ white: 100, blue: 100 });
    expect(P.kelvin_to_white_blue(23000)).toEqual({ white: 10, blue: 100 });
    expect(P.kelvin_to_white_blue(1000)).toEqual({ white: 100, blue: 0 });
    expect(P.kelvin_to_white_blue(NaN)).toEqual({ white: 10, blue: 100 });
    expect(P.kelvin_to_white_blue(99999)).toEqual({ white: 10, blue: 100 });
    expect(P.kelvin_to_white_blue(21500).white).toBe(30);
  });

  it("kelvin_rgb(), rgb_css() and brightness_pct()", () => {
    // Contrasted palette: yellow when warm, deep blue when cold
    expect(P.kelvin_rgb(8000)).toEqual([255, 196, 40]);
    expect(P.kelvin_rgb(5000)).toEqual([255, 196, 40]);
    expect(P.kelvin_rgb(NaN)).toEqual([255, 196, 40]);
    expect(P.kelvin_rgb(23000)).toEqual([30, 45, 235]);
    expect(P.kelvin_rgb(30000)).toEqual([30, 45, 235]);
    expect(P.kelvin_rgb(9500)).toEqual([255, 216, 95]);
    expect(P.rgb_css([1, 2, 3])).toBe("rgb(1,2,3)");
    expect(P.rgb_css([1, 2, 3], 0.5)).toBe("rgba(1,2,3,0.5)");
    expect(P.brightness_pct(255)).toBe(100);
    expect(P.brightness_pct(128)).toBe(50);
    expect(P.brightness_pct(999)).toBe(100);
    expect(P.brightness_pct(null)).toBe(0);
    expect(P.brightness_pct(-1)).toBe(0);
  });
});

// ─── Device ──────────────────────────────────────────────────────────────────

describe("RSLed device helpers", () => {
  beforeEach(() => at("15:00"));

  it("uses the G1 mapping and the ReefLED dialogs", () => {
    const dev = makeLed();
    expect(dev.initial_config).toBe(config);
    expect(Object.keys(dev.dialogs)).toEqual(
      expect.arrayContaining(["wifi", "config", "led_moon", "led_acclimation"]),
    );
    expect(dialogs_rsled.config.content.length).toBe(1);
    // A real lamp's dialog offers its staggered sunrise offset
    expect(
      dialogs_rsled.config.content[0].conf.entities.map((e: any) => e.entity),
    ).toContain("number.sunrise_offset");
  });

  it("reads today's program from the weekday entity", () => {
    const dev = makeLed();
    expect(dev.now()).toEqual({ minute: 900, weekday: 2 });
    expect(dev.today_program_key()).toBe("auto_2");
    expect(dev.today_program()).toEqual(PROG);
    expect(dev.yesterday_program()).toEqual(PROG);
    expect(dev.tomorrow_program()).toEqual(PROG);
    expect(dev.program_name()).toBe("Perso");
    expect(dev.clouds_state()).toEqual({ count: 2, active: true });
    expect(dev.sky_state().body).toBe("sun");
  });

  it("names the program from the lamp, but keeps the local weekday", () => {
    const dev = makeLed();
    expect(dev.today()).toBe(2);
    const id = "sensor.led_current_program";
    dev.hass.states[id] = {
      entity_id: id,
      state: "test",
      attributes: { active_preset: 5 },
      last_updated: "t",
    };
    dev.entities["current_program"] = { entity_id: id };
    // active_preset is not the weekday: two lamps report different ones
    expect(dev.today()).toBe(2);
    expect(dev.today_program_key()).toBe("auto_2");
    expect(dev.program_name()).toBe("test");
    // Out of range or unknown: back to the local weekday and entity name
    dev.hass.states[id] = { ...dev.hass.states[id], state: "unknown" };
    dev.hass.states[id].attributes = { active_preset: 9 };
    expect(dev.today()).toBe(2);
    expect(dev.program_name()).toBe("Perso");
  });

  it("reads programs and clouds on the lamp's weekly timeline", () => {
    // Tuesday: everything carries +1440 min on the lamp
    const shifted = {
      white: { ...PROG.white, rise: 660 + 1440, set: 1260 + 1440 },
      blue: { ...PROG.blue, rise: 660 + 1440, set: 1341 + 1440 },
      moon: { ...PROG.moon, rise: 1345 + 1440, set: 1523 + 1440 },
    };
    const dev = makeLed({
      program: shifted,
      clouds: { ...CLOUDS, from: 859 + 1440, to: 996 + 1440 },
    });
    expect(dev.today_program()).toEqual(PROG);
    expect(dev.clouds(2)).toEqual(CLOUDS);
    expect(dev.clouds_state()).toEqual({ count: 2, active: true });
    expect(dev.sky_state().body).toBe("sun");
    // A G2 keeps its clouds inside the program payload
    const g2 = makeLed(
      { program: { moon: PROG.moon, clouds: CLOUDS }, clouds: null },
      true,
    );
    expect(g2.clouds(2)).toEqual(CLOUDS);
    delete g2.entities["auto_3"];
    expect(g2.clouds(3)).toBeNull();
  });

  it("plays the program late by the lamp's sunrise offset", () => {
    const dev = makeLed();
    expect(dev.sunrise_offset()).toBe(0);
    const base = dev.sky_state();
    const id = "number.led_sunrise_offset";
    dev.hass.states[id] = {
      entity_id: id,
      state: "60",
      attributes: {},
      last_updated: "t",
    };
    dev.entities["number.sunrise_offset"] = { entity_id: id };
    expect(dev.sunrise_offset()).toBe(60);
    const late = dev.sky_state();
    // Times one hour later, the sun one hour behind
    expect(late.start).toBe(base.start! + 60);
    expect(late.end).toBe(base.end! + 60);
    expect(late.progress).toBeLessThan(base.progress);
    // 15:00 is 14:00 of the program: the clouds (14:19) have not come yet
    expect(dev.clouds_state()).toEqual({ count: 2, active: false });
    // Not a number, or negative: no offset
    dev.hass.states[id].state = "unavailable";
    expect(dev.sunrise_offset()).toBe(0);
    dev.hass.states[id].state = "-5";
    expect(dev.sunrise_offset()).toBe(0);
  });

  it("keeps unknown sky ends unknown with an offset", () => {
    const dev = makeLed({ program: null, clouds: null });
    const id = "number.led_sunrise_offset";
    dev.hass.states[id] = {
      entity_id: id,
      state: "10",
      attributes: {},
      last_updated: "t",
    };
    dev.entities["number.sunrise_offset"] = { entity_id: id };
    for (const k of ["auto_1", "auto_3"]) delete dev.entities[k];
    const sky = dev.sky_state();
    expect(sky.start).toBeNull();
    expect(sky.end).toBeNull();
  });

  it("copes with a missing program", () => {
    const dev = makeLed({ program: null, clouds: null });
    expect(dev.today_program()).toBeNull();
    expect(dev.clouds_state().count).toBe(0);
    dev.hass.states["sensor.led_auto_2"].state = "unknown";
    expect(dev.program_name()).toBe("");
    delete dev.entities["auto_2"];
    expect(dev.program_name()).toBe("");
  });

  it("reads the light levels and the intensity", () => {
    const dev = makeLed({ white: 80, blue: 100, moon: 0, intensity: 90 });
    expect(dev.channel_levels()).toEqual({ white: 80, blue: 100, moon: 0 });
    expect(dev.intensity_pct()).toBe(90);
    dev.hass.states["light.led_kelvin_intensity"].state = "unavailable";
    expect(dev.intensity_pct()).toBeNull();
    delete dev.entities["light.kelvin_intensity"];
    expect(dev.intensity_pct()).toBeNull();
  });

  it("reads the mode from the select, then from the sensor", () => {
    const dev = makeLed({ mode: "manual" });
    expect(dev.mode()).toBe("manual");
    expect(dev.mode_label()).toBe("MANUAL");
    const nosel = makeLed({ mode: "timer", no_select: true });
    expect(nosel.mode()).toBe("timer");
    nosel.hass.formatEntityState = undefined;
    expect(nosel.mode_label()).toBe("timer");
    delete nosel.entities["sensor.mode"];
    expect(nosel.mode()).toBe("");
    expect(nosel.mode_label()).toBe("");
  });

  it("reads the moon day, full moon by default", () => {
    expect(makeLed({ moon_day: "9" }).moon_day()).toBe(9);
    expect(makeLed({ moon_day: "unknown" }).moon_day()).toBe(15);
  });

  it("state_signature() changes with the watched entities", () => {
    const dev = makeLed({ intensity: 50 });
    const before = dev.state_signature();
    dev.hass.states["light.led_kelvin_intensity"] = {
      ...dev.hass.states["light.led_kelvin_intensity"],
      last_updated: "t1",
    };
    expect(dev.state_signature()).not.toBe(before);
    delete dev.hass.states["light.led_kelvin_intensity"].last_updated;
    expect(dev.state_signature()).toContain("on@|");
    dev._hass = null;
    expect(dev.state_signature()).toBe("");
  });

  it("renders the view with the picture between both layers", () => {
    const dev = makeLed();
    const div = document.createElement("div");
    render(dev._render("", "width:100%"), div);
    const bg = div.querySelector(".device_bg") as HTMLElement;
    // Back layer, picture, front layer
    expect(bg.children[0].tagName).toBe("DIV");
    const img = div.querySelector("img") as HTMLImageElement;
    expect(img.getAttribute("style")).toBe("width:100%");
    // Every layout of the device uses the design space ratio
    const styles = (RSLed as any).styles.map((s: any) => s.cssText).join("");
    expect(styles).toContain("aspect-ratio: 591 / 860");
  });

  it("renderEditor() shows the common options unless disabled", () => {
    const dev = makeLed();
    let div = document.createElement("div");
    render(dev.renderEditor(), div);
    expect(div.querySelector("form")).not.toBeNull();
    vi.spyOn(dev, "is_disabled").mockReturnValue(true);
    div = document.createElement("div");
    render(dev.renderEditor(), div);
    expect(div.textContent?.trim()).toBe("");
  });

  it("K | W/B switch: G1 only, remembered by the browser", () => {
    localStorage.clear();
    const dev = makeLed();
    expect(dev.white_blue()).toBe(false);
    let div = document.createElement("div");
    render(dev._render("", ""), div);
    const sw = div.querySelector(".rsled_switch") as HTMLElement;
    expect(sw.querySelector(".on")?.textContent).toBe("K");
    const beam = { requestUpdate: vi.fn() };
    dev._elements = { beam, other: null };
    sw.click();
    expect(dev.white_blue()).toBe(true);
    expect(beam.requestUpdate).toHaveBeenCalled();
    expect(localStorage.getItem("ha-reef-card.rsled.dev1.white_blue")).toBe(
      "1",
    );
    // A new card on the same lamp reads it back
    expect(makeLed().white_blue()).toBe(true);
    div = document.createElement("div");
    render(dev._render("", ""), div);
    expect(div.querySelector(".rsled_switch .on")?.textContent).toBe("W/B");
    // And back
    dev.toggle_white_blue();
    expect(localStorage.getItem("ha-reef-card.rsled.dev1.white_blue")).toBe(
      "0",
    );
    // A lamp without registry id is keyed by its name
    const named = makeLed();
    named.device.elements = [];
    expect(named._slider_key()).toBe("ha-reef-card.rsled.LED.white_blue");
    // No switch on a G2
    const g2 = makeLed({}, true);
    expect(g2.white_blue()).toBe(false);
    div = document.createElement("div");
    render(g2._render("", ""), div);
    expect(div.querySelector(".rsled_switch")).toBeNull();
    localStorage.clear();
  });

  it("K | W/B switch survives an unavailable storage", () => {
    const get = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("denied");
      });
    const set = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("denied");
      });
    const dev = makeLed();
    expect(dev.white_blue()).toBe(false);
    dev.toggle_white_blue();
    expect(dev.white_blue()).toBe(true);
    get.mockRestore();
    set.mockRestore();
  });

  it("identify blinks the beam for ten seconds", () => {
    vi.useFakeTimers();
    const dev = makeLed();
    const beam = { requestUpdate: vi.fn() };
    dev._elements = { beam };
    expect(dev.identifying()).toBe(false);
    document.body.appendChild(dev);
    // Other device events are not an identify
    dev.dispatchEvent(
      new CustomEvent("device-event", { detail: { event: "other" } }),
    );
    dev.dispatchEvent(new CustomEvent("device-event"));
    expect(dev.identifying()).toBe(false);
    dev.dispatchEvent(
      new CustomEvent("device-event", { detail: { event: "rsled_identify" } }),
    );
    expect(dev.identifying()).toBe(true);
    dev.identify(); // again: the timer restarts
    vi.advanceTimersByTime(10_001);
    expect(dev.identifying()).toBe(false);
    expect(beam.requestUpdate).toHaveBeenCalledTimes(3);
    document.body.removeChild(dev);
  });

  it("opens and closes the program editor", () => {
    at("15:00");
    const dev = makeLed();
    document.body.appendChild(dev);
    dev.open_program_editor();
    const ed = dev._program_editor;
    expect(ed.day).toBe(2);
    expect(ed.format).toBe("wb");
    let div = document.createElement("div");
    render(dev._render("", ""), div);
    expect(div.querySelector("rsled-program-editor")).not.toBeNull();
    const closed = vi.fn();
    ed.addEventListener("rsled-editor-close", closed);
    ed.close();
    expect(closed).toHaveBeenCalled();
    dev.dispatchEvent(new CustomEvent("rsled-editor-close"));
    expect(dev._program_editor).toBeNull();
    // A G2 without program starts in the kelvin format
    const g2 = makeLed({ program: null }, true);
    g2.open_program_editor(5);
    expect(g2._program_editor.format).toBe("kelvin");
    expect(g2._program_editor.day).toBe(5);
    document.body.removeChild(dev);
  });

  it("kelvin_range() reads the light, with per-generation defaults", () => {
    const dev = makeLed();
    expect(dev.kelvin_range()).toEqual({ min: 9000, max: 23000 });
    delete dev.entities["light.kelvin_intensity"];
    expect(dev.kelvin_range()).toEqual({ min: 9000, max: 23000 });
    const g2 = makeLed({}, true);
    delete g2.entities["light.kelvin_intensity"];
    expect(g2.kelvin_range()).toEqual({ min: 8000, max: 23000 });
  });

  it("channel levels: lights on a G1, sensors on a G2", () => {
    const g2 = makeLed({ white: 70, blue: 90, moon: 20 }, true);
    expect(g2.channel_levels()).toEqual({ white: 70, blue: 90, moon: 20 });
    g2.hass.states["sensor.led_white"].state = "unknown";
    g2.hass.states["sensor.led_blue"].state = "150";
    expect(g2.channel_pct("white")).toBe(0);
    expect(g2.channel_pct("blue")).toBe(100);
    expect(g2.channel_pct("nothing")).toBe(0);
  });

  it("G2 draws the same view with its own picture and dialogs", () => {
    const dev = makeLed({}, true);
    expect(dev.initial_config).toBe(config2);
    expect(config2.background_img.href).toContain("rsled_g2.png");
    const div = document.createElement("div");
    render(dev._render("", ""), div);
    expect(div.querySelector("#banner")).toBeNull();
    expect(div.querySelector(".device_bg")).not.toBeNull();
    const rows = dev.dialogs.config.content[0].conf.entities.map(
      (e: any) => e.entity,
    );
    expect(rows).toContain("sensor.white");
    expect(rows).not.toContain("light.white");
  });
});

// ─── Base element ────────────────────────────────────────────────────────────

describe("RSLedElement", () => {
  it("re-renders only when the signature changes", () => {
    const dev = makeLed();
    const el = new StubRSLedElement() as any;
    el.device = dev;
    const spy = vi.spyOn(el, "requestUpdate");
    el.hass = dev.hass;
    el.hass = dev.hass;
    expect(spy).toHaveBeenCalledTimes(1);
    el.device = null;
    spy.mockClear();
    el.hass = dev.hass;
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("ticks every minute while connected", () => {
    vi.useFakeTimers();
    const el = new StubRSLedElement() as any;
    document.body.appendChild(el);
    const spy = vi.spyOn(el, "requestUpdate");
    vi.advanceTimersByTime(RSLED_TICK_MS);
    expect(spy).toHaveBeenCalled();
    el.connectedCallback(); // already ticking: no second timer
    document.body.removeChild(el);
    spy.mockClear();
    vi.advanceTimersByTime(RSLED_TICK_MS * 2);
    expect(spy).not.toHaveBeenCalled();
    el.disconnectedCallback(); // already stopped
  });
});

// ─── Sky ─────────────────────────────────────────────────────────────────────

describe("RSLedSky", () => {
  it("arc_point() follows the half ellipse", () => {
    const g = SKY_DEFAULTS;
    const left = RSLedSky.arc_point(g, 0);
    expect(left.x).toBeCloseTo(g.arc.cx - g.arc.rx);
    expect(left.y).toBeCloseTo(g.arc.cy);
    const top = RSLedSky.arc_point(g, 0.5);
    expect(top.y).toBeCloseTo(g.arc.cy - g.arc.ry);
    expect(RSLedSky.arc_point(g, 2).x).toBeCloseTo(g.arc.cx + g.arc.rx);
  });

  it("back layer: sun by day, arc drawn", async () => {
    at("15:00");
    const dev = makeLed();
    const root = await mount(
      makeElement(RSLedSky, dev, { name: "sky", layer: "back", geometry: {} }),
    );
    expect(root.querySelectorAll("path").length).toBe(2);
    // Matched on localName rather than with a "radialGradient" selector:
    // camelCase SVG tag names are not matched alike by every DOM version
    const glow = [...root.querySelectorAll("*")].filter(
      (e) => e.localName === "radialGradient",
    );
    expect(glow.length).toBe(1);
    expect(
      root.querySelector("circle[fill^='url(#rsled_sun_']"),
    ).not.toBeNull();
  });

  it("back layer: the current time is written in the sun or the moon", async () => {
    at("15:07");
    const day = await mount(
      makeElement(RSLedSky, makeLed(), { layer: "back" }),
    );
    const time = day.querySelector("text.sky_time") as SVGTextElement;
    expect(time.textContent).toBe("15:07");
    // Inside the group moved along the arc with the sun
    expect(time.parentElement?.getAttribute("transform")).toContain(
      "translate(",
    );
    expect(time.parentElement?.querySelector("circle")).not.toBeNull();
    at("23:30");
    const night = await mount(
      makeElement(RSLedSky, makeLed(), { layer: "back" }),
    );
    expect(night.querySelector("text.sky_time")?.textContent).toBe("23:30");
    // Not on the front layer; nothing without the lamp's clock
    const front = await mount(
      makeElement(RSLedSky, makeLed(), { layer: "front" }),
    );
    expect(front.querySelector("text.sky_time")).toBeNull();
    const el = new RSLedSky() as any;
    el.conf = { layer: "back" };
    el.stateOn = true;
    el.device = { is_on: () => true, config: {}, entities: {} };
    expect((await mount(el)).querySelector("text.sky_time")).toBeNull();
  });

  it("back layer: moon at night, greyed when off", async () => {
    at("23:30");
    const dev = makeLed({ device_state: "off", moon_day: "9" });
    const root = await mount(makeElement(RSLedSky, dev, { layer: "back" }));
    // Two arcs and the lit part of the moon
    expect(root.querySelectorAll("path").length).toBe(3);
    expect(root.innerHTML).toContain("#9a9a9a");
    // New moon: nothing lit
    const dark = makeLed({ moon_day: "1" });
    const root2 = await mount(makeElement(RSLedSky, dark, { layer: "back" }));
    expect(root2.querySelectorAll("path").length).toBe(2);
  });

  it("back layer: grey sun when the lamp is off", async () => {
    at("15:00");
    const dev = makeLed({ device_state: "off" });
    const root = await mount(makeElement(RSLedSky, dev, { layer: "back" }));
    expect(root.innerHTML).toContain("#a0a0a0");
  });

  it("back layer without a device still draws a sun", async () => {
    const el = new RSLedSky() as any;
    el.conf = { layer: "back" };
    el.stateOn = true;
    el.device = { is_on: () => true, config: {}, entities: {} };
    const root = await mount(el);
    expect(root.querySelector("circle")).not.toBeNull();
  });

  it("front layer: times, mode and clouds in front of the sun", async () => {
    at("15:00");
    const dev = makeLed();
    const root = await mount(makeElement(RSLedSky, dev, { layer: "front" }));
    const texts = [...root.querySelectorAll("text")].map((t) =>
      t.textContent?.trim(),
    );
    expect(texts).toEqual(["11:00", "22:21", "AUTO"]);
    expect(root.querySelectorAll(".cloud_active").length).toBe(2);
  });

  it("front layer: the sunrise offset under the left time", async () => {
    at("15:00");
    const dev = makeLed();
    const id = "number.led_sunrise_offset";
    dev.hass.states[id] = {
      entity_id: id,
      state: "15",
      attributes: {},
      last_updated: "t",
    };
    dev.entities["number.sunrise_offset"] = { entity_id: id };
    const el = makeElement(RSLedSky, dev, { layer: "front" });
    const root = await mount(el);
    const texts = [...root.querySelectorAll("text")].map((t) =>
      t.textContent?.trim(),
    );
    // Times moved 15 min later, the badge under the left one
    expect(texts).toEqual(["11:15", "22:36", "+15 min", "AUTO"]);
    const seen: any[] = [];
    el.addEventListener("hass-more-info", (e: any) => seen.push(e.detail));
    (root.querySelector(".sky_offset") as any).dispatchEvent(
      new Event("click"),
    );
    expect(seen).toEqual([{ entityId: id }]);
    // The setting gone: the click does nothing
    delete dev.entities["number.sunrise_offset"];
    (el as any)._open_offset(new Event("click"));
    expect(seen).toHaveLength(1);
  });

  it("front layer: no offset badge on a lamp on time", async () => {
    at("15:00");
    const root = await mount(
      makeElement(RSLedSky, makeLed(), { layer: "front" }),
    );
    expect(root.querySelector(".sky_offset")).toBeNull();
  });

  it("front layer: faint cloud badge outside the cloud window", async () => {
    at("08:00");
    const dev = makeLed({ device_state: "off" });
    const root = await mount(makeElement(RSLedSky, dev, { layer: "front" }));
    expect(root.querySelectorAll(".cloud_active").length).toBe(0);
    expect(root.querySelectorAll("path").length).toBe(1);
    expect(root.querySelector(".sky_mode_off")).not.toBeNull();
  });

  it("front layer: no times nor clouds without program", async () => {
    at("08:00");
    const dev = makeLed({ program: null, clouds: null });
    const root = await mount(makeElement(RSLedSky, dev, { layer: "front" }));
    expect(root.querySelectorAll("text").length).toBe(1);
    expect(root.querySelectorAll("path").length).toBe(0);
  });

  it("back layer at night without helpers draws a full moon", async () => {
    const el = new RSLedSky() as any;
    el.conf = { layer: "back" };
    el.stateOn = true;
    el.device = {
      config: {},
      entities: {},
      sky_state: () => ({ body: "moon", progress: 0.2, start: 0, end: 1 }),
    };
    const root = await mount(el);
    expect(root.querySelectorAll("path").length).toBe(3);
  });

  it("front layer without helpers renders an empty mode", async () => {
    const el = new RSLedSky() as any;
    el.conf = { layer: "front" };
    el.stateOn = true;
    el.device = { config: {}, entities: {} };
    const root = await mount(el);
    expect(root.querySelector(".sky_mode")?.textContent?.trim()).toBe("");
  });

  it("tapping the mode opens the mode select", async () => {
    at("15:00");
    const dev = makeLed();
    const el = makeElement(RSLedSky, dev, { layer: "front" });
    const root = await mount(el);
    const events: any[] = [];
    el.addEventListener("hass-more-info", (e: any) => events.push(e.detail));
    (root.querySelector(".sky_mode") as any).dispatchEvent(
      new MouseEvent("click"),
    );
    expect(events).toEqual([{ entityId: "select.led_mode" }]);
    delete dev.entities["select.mode"];
    (root.querySelector(".sky_mode") as any).dispatchEvent(
      new MouseEvent("click"),
    );
    expect(events.length).toBe(1);
  });
});

// ─── Beam ────────────────────────────────────────────────────────────────────

describe("weather place time", () => {
  const day = {
    weekday: 2,
    sunrise: "11:00",
    sunset: "22:00",
    place_sunrise: "06:00",
    place_sunset: "17:00",
  };

  it("weather_place_minute(): shifted, stretched, across midnight", () => {
    // Anchored on the sunrise: 09:04 on the tank, 04:04 at the place
    expect(P.weather_place_minute(544, day)).toBe(244);
    expect(P.weather_place_minute(0, day)).toBe(1140);
    // Both anchored: the day is stretched
    const both = { ...day, sunset: "23:00" };
    expect(P.weather_place_minute(1380, both)).toBe(1020);
    expect(P.weather_place_minute(1020, both)).toBe(690);
    // Days running past midnight
    const late = {
      sunrise: "20:00",
      sunset: "02:00",
      place_sunrise: "22:00",
      place_sunset: "04:00",
    };
    expect(P.weather_place_minute(0, late)).toBe(120);
    expect(P.weather_place_minute(1380, late)).toBe(60);
    expect(P.weather_place_minute(600, { ...day, sunset: "x" })).toBeNull();
    expect(P.weather_place_minute(600, null)).toBeNull();
    expect(P.weather_place_minute(600, {})).toBeNull();
  });

  it("RSLed.weather_place_now(): only in weather mode, with today", () => {
    at("09:04");
    const dev = makeLed();
    const entities: Record<string, any> = {};
    vi.spyOn(dev, "get_entity").mockImplementation(
      (key: any) => entities[key] ?? null,
    );
    expect(dev.weather_place_now()).toBeNull();
    entities.weather_sync = { state: "on" };
    expect(dev.weather_place_now()).toBeNull();
    entities.weather_program = { attributes: { days: [day] } };
    // The fixed clock is UTC: 09:04 in the tests' time zone
    expect(dev.weather_place_now()).toBe(
      P.weather_place_minute(dev.now().minute, day),
    );
    expect(dev.weather_place_now()).not.toBeNull();
    entities.weather_program = {
      attributes: { days: [{ ...day, weekday: 5 }] },
    };
    expect(dev.weather_place_now()).toBeNull();
    entities.weather_sync = { state: "off" };
    expect(dev.weather_place_now()).toBeNull();
  });
});

describe("RSLedBeam", () => {
  it("is_dark(): off, or no intensity; channels without an intensity", () => {
    const lit = { white: 40, blue: 0 };
    const none = { white: 0, blue: 0 };
    expect(is_dark(false, 80, lit)).toBe(true);
    expect(is_dark(true, 0, lit)).toBe(true);
    expect(is_dark(true, 5, none)).toBe(false);
    expect(is_dark(true, null, lit)).toBe(false);
    expect(is_dark(true, undefined, none)).toBe(true);
  });

  it("beam_light(): from the colour when a G2 reports no channel", async () => {
    const none = { white: 0, blue: 0, moon: 0 };
    // The channels, when the lamp reports them
    expect(beam_light({ white: 40, blue: 80, moon: 0 }, 60, 15000)).toEqual(
      P.light_color(40, 80, 0),
    );
    // A lamp driven by intensity and colour: they win over its channels
    expect(
      beam_light({ white: 40, blue: 80, moon: 0 }, 60, 20000, true),
    ).toEqual({ rgb: P.kelvin_rgb(20000), alpha: 0.51 });
    // Lit, no channel reported: its colour temperature and intensity
    expect(beam_light(none, 60, 15000)).toEqual({
      rgb: P.kelvin_rgb(15000),
      alpha: 0.51,
    });
    expect(beam_light(none, 250, 9000).alpha).toBe(0.75);
    // Nothing to draw it from: the pale grey of an unknown light
    expect(beam_light(none, 60, null)).toEqual(P.light_color(0, 0, 0));
    expect(beam_light(none, null, 15000)).toEqual(P.light_color(0, 0, 0));
    expect(beam_light({ white: 0, blue: 0, moon: 50 }, 0, 15000)).toEqual(
      P.light_color(0, 0, 50),
    );

    // A G2 whose white/blue sensors are unknown: a coloured beam
    const dev = makeLed({ intensity: 60, kelvin: 12000 }, true);
    dev.hass.states["sensor.led_white"].state = "unknown";
    dev.hass.states["sensor.led_blue"].state = "unknown";
    expect(dev.kelvin()).toBe(12000);
    const root = await mount(makeElement(RSLedBeam, dev, { name: "beam" }));
    const stop = root.querySelector("linearGradient stop:nth-child(2)")!;
    expect(stop.getAttribute("stop-color")).toBe(
      P.rgb_css(P.kelvin_rgb(12000)),
    );
    expect(stop.getAttribute("stop-opacity")).toBe("0.51");
    // Its channels read back: the beam still follows the colour slider
    const lit = makeLed(
      { intensity: 60, kelvin: 20000, white: 5, blue: 60 },
      true,
    );
    const root2 = await mount(makeElement(RSLedBeam, lit, { name: "beam" }));
    expect(
      root2
        .querySelector("linearGradient stop:nth-child(2)")!
        .getAttribute("stop-color"),
    ).toBe(P.rgb_css(P.kelvin_rgb(20000)));
    // A G1 with the intensity and colour sliders: drawn from them too,
    // from its channels with the white and blue sliders
    localStorage.clear();
    const g1 = makeLed({ white: 80, blue: 20, intensity: 60, kelvin: 20000 });
    const colour = (root: ShadowRoot) =>
      root
        .querySelector("linearGradient stop:nth-child(2)")!
        .getAttribute("stop-color");
    expect(g1.white_blue()).toBe(false);
    expect(
      colour(await mount(makeElement(RSLedBeam, g1, { name: "beam" }))),
    ).toBe(P.rgb_css(P.kelvin_rgb(20000)));
    g1.toggle_white_blue();
    expect(
      colour(await mount(makeElement(RSLedBeam, g1, { name: "beam" }))),
    ).toBe(P.rgb_css(P.light_color(80, 20, 0).rgb));
    localStorage.clear();
    // No colour temperature reported
    expect(makeLed({ kelvin: null }, true).kelvin()).toBeNull();
    expect(makeLed({ kelvin: 0 }).kelvin()).toBeNull();
  });

  it("draws the program, the texts and the now marker", async () => {
    at("15:00");
    const dev = makeLed({ white: 80, blue: 100, intensity: 90 });
    const root = await mount(makeElement(RSLedBeam, dev, { name: "beam" }));
    expect(root.querySelectorAll(".chart_curve").length).toBe(3);
    expect(root.querySelector(".now_marker")).not.toBeNull();
    // A G1 program: its white/blue curves, labelled with its colour zones
    // as the editor shows them
    expect(root.querySelector(".kelvin_labels .kelvin_label")).not.toBeNull();
    const texts = [...root.querySelectorAll("text")].map((t) =>
      t.textContent?.trim(),
    );
    // The strength of the light: its estimated PAR at the surface (white
    // 80 %, blue 100 % of a ReefLED 160), the intensity in its tooltip
    const strength = root.querySelector(".beam_text") as SVGTextElement;
    const shown = [...strength.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join("")
      .trim();
    expect(shown).toBe("☀ ≈ 548 PAR");
    expect(strength.querySelector("title")?.textContent).toContain(
      "Intensity 90 %",
    );
    expect(strength.querySelector("title")?.textContent).toContain(
      "Estimated PAR",
    );
    // A model without PAR figures: the share of the lamp's power
    dev.device.elements[0].model = "RSLED999";
    expect(dev.par()).toBeNull();
    const other = await mount(makeElement(RSLedBeam, dev, { name: "beam" }));
    expect(other.querySelector(".beam_text")?.textContent?.trim()).toBe(
      "☀ Intensity 90 %",
    );
    dev.device.elements[0].model = "RSLED160";
    // The name and the day the program was read from
    expect(texts[1]).toBe("Perso · Tuesday");
    expect(root.querySelector("g")?.getAttribute("opacity")).toBe("1");
  });

  it("a program without a name only shows its day", async () => {
    at("15:00");
    const dev = makeLed();
    dev.program_name = () => "";
    const root = await mount(makeElement(RSLedBeam, dev, {}));
    const texts = [...root.querySelectorAll("text")].map((t) =>
      t.textContent?.trim(),
    );
    expect(texts[1]).toBe("Tuesday");
  });

  it("dims the chart outside auto mode and greys an off lamp", async () => {
    at("15:00");
    const dev = makeLed({ mode: "manual", device_state: "off" });
    const root = await mount(makeElement(RSLedBeam, dev, {}));
    expect(root.querySelector("g")?.getAttribute("opacity")).toBe("0.45");
    // No light: the beam is transparent, the lens greyed out
    expect(root.innerHTML).toContain("rgb(140,140,140)");
    expect(root.querySelector(".lens_off")).not.toBeNull();
    expect(root.querySelector(".beam_pool")).toBeNull();
  });

  it("the current time under the chart, with the weather's place time", async () => {
    at("15:00");
    const dev = makeLed({ white: 50, intensity: 40 });
    const root = await mount(makeElement(RSLedBeam, dev, {}));
    const clock = root.querySelector(".now_time")!;
    expect(clock.textContent?.trim()).toBe("15:00");
    expect(clock.querySelector("title")).toBeNull();
    dev.weather_place_now = () => 604;
    at("00:10");
    const early = await mount(makeElement(RSLedBeam, dev, {}));
    const text = early.querySelector(".now_time")!;
    expect(text.textContent?.trim().startsWith("00:10 (10:04)")).toBe(true);
    expect(text.querySelector("title")).not.toBeNull();
    // Kept inside the chart at midnight
    expect(Number(text.getAttribute("x"))).toBe(
      BEAM_DEFAULTS.chart.x + BEAM_DEFAULTS.clock.margin,
    );
  });

  it("no beam at 0 % intensity, even with the moon lit", async () => {
    at("15:00");
    const dark = makeLed({ moon: 30, intensity: 0 });
    const root = await mount(makeElement(RSLedBeam, dark, {}));
    const lens = root.querySelector(".lens_off")!;
    expect(lens.getAttribute("cx")).toBe(String(BEAM_DEFAULTS.lens.cx));
    expect(lens.getAttribute("ry")).toBe(String(BEAM_DEFAULTS.lens.ry));
    expect(root.querySelector(".beam_pool")).toBeNull();
    // The beam stays tappable
    expect(root.querySelector(".beam_shape")).not.toBeNull();
    const lit = await mount(
      makeElement(RSLedBeam, makeLed({ white: 50, intensity: 40 }), {}),
    );
    expect(lit.querySelector(".lens_off")).toBeNull();
    expect(lit.querySelector(".beam_pool")).not.toBeNull();
  });

  it("the G2 lens, from the model's geometry", async () => {
    at("15:00");
    const dev = makeLed({}, true);
    const root = await mount(
      makeElement(RSLedBeam, dev, config2.elements.beam),
    );
    expect(root.querySelector(".lens_off")?.getAttribute("cy")).toBe(
      String(config2.elements.beam.geometry.lens.cy),
    );
    expect(config.elements.beam.geometry).toBeUndefined();
  });

  it("estimated_par(): from the channels of a G1, the intensity of a G2", () => {
    const full = { white: 100, blue: 100 };
    // Full power: Red Sea's figures at the surface
    expect(P.estimated_par("RSLED160", full, null, false)).toBe(600);
    expect(P.estimated_par("RSLED90", full, 100, false)).toBe(570);
    expect(P.estimated_par("RSLED50", full, 100, false)).toBe(550);
    expect(P.estimated_par("RSLED170", full, 100, true)).toBe(550);
    // A G1: each channel gives its share (blue a little more than white)
    const white = P.estimated_par(
      "RSLED160",
      { white: 100, blue: 0 },
      0,
      false,
    );
    const blue = P.estimated_par("RSLED160", { white: 0, blue: 100 }, 0, false);
    expect(white).toBe(261);
    expect(blue).toBe(339);
    expect(P.estimated_par("RSLED160", { white: 0, blue: 0 }, 50, false)).toBe(
      0,
    );
    // A G2: its intensity, whatever its colour and its channels
    expect(P.estimated_par("RSLED60", { white: 0, blue: 0 }, 50, true)).toBe(
      250,
    );
    expect(P.estimated_par("RSLED115", full, 250, true)).toBe(500);
    expect(P.estimated_par("RSLED115", full, null, true)).toBeNull();
    expect(P.estimated_par("RSLED115", full, undefined, true)).toBeNull();
    // Unknown models
    expect(P.estimated_par(undefined, full, 100, false)).toBeNull();
    expect(P.estimated_par("VIRTUAL", full, 100, true)).toBeNull();
    // On the lamps
    expect(makeLed({ white: 50, blue: 50, intensity: 50 }).par()).toBe(300);
    const g2 = makeLed({ intensity: 40 }, true);
    g2.device.elements[0].model = "RSLED170";
    expect(g2.par()).toBe(220);
  });

  it("no program: no curve, no marker, no intensity", async () => {
    const dev = makeLed({ program: null });
    delete dev.entities["light.kelvin_intensity"];
    const root = await mount(makeElement(RSLedBeam, dev, {}));
    expect(root.querySelectorAll(".chart_curve").length).toBe(0);
    expect(root.querySelector(".now_marker")).toBeNull();
    expect(root.querySelector(".beam_text")?.textContent?.trim()).toBe("");
  });

  it("renders without device helpers", async () => {
    const el = new RSLedBeam() as any;
    el.conf = {};
    el.stateOn = true;
    el.device = { config: {}, entities: {} };
    const root = await mount(el);
    expect(root.querySelector(".beam_shape")).not.toBeNull();
  });

  it("tap opens the program editor", () => {
    const dev = makeLed();
    const el = makeElement(RSLedBeam, dev, {});
    const spy = vi.spyOn(dev, "open_program_editor");
    el._click();
    expect(spy).toHaveBeenCalled();
    el.device = null;
    el._click();
  });

  it("blinks while the lamp identifies itself", async () => {
    const dev = makeLed();
    dev.identify();
    const root = await mount(makeElement(RSLedBeam, dev, {}));
    expect(root.querySelector(".beam_identify")).not.toBeNull();
  });
});

// ─── Slider ──────────────────────────────────────────────────────────────────

describe("RSLedSlider", () => {
  const light = (dev: any) => dev.hass.states["light.led_kelvin_intensity"];

  it("intensity: value, range and track", async () => {
    const dev = makeLed({ intensity: 60, kelvin: 20000 });
    const el = makeElement(
      RSLedSlider,
      dev,
      { attribute: "brightness", icon: "mdi:brightness-6" },
      light(dev),
    );
    expect(el.range()).toEqual({ min: 0, max: 100, step: 1 });
    expect(el.value()).toBe(60);
    const root = await mount(el);
    expect(root.querySelector(".vthumb")?.textContent).toBe("60%");
    expect(root.querySelector(".vtrack_mask")).not.toBeNull();
    expect(root.querySelector("ha-icon")).not.toBeNull();
    expect(el.track_background()).toContain("#111111");
    // A channel slider shows its own colour
    // White starts from a light grey, not from black
    el.conf = { attribute: "brightness", track: "white" };
    expect(el.track_background()).toContain("#9a9a9a 0%");
    el.conf = { attribute: "brightness", track: "moon" };
    expect(el.track_background()).toContain(P.rgb_css(P.CHANNEL_RGB.moon));
    el.conf = { attribute: "brightness", track: "unknown" };
    // The overall intensity takes the colour the lamp is set to
    expect(el.track_background()).toContain(P.rgb_css(P.kelvin_rgb(20000)));
    el.stateObj = { entity_id: "x", state: "off", attributes: {} };
    expect(el.track_background()).toContain(P.rgb_css(P.kelvin_rgb(15000)));
  });

  it("intensity is 0 when the light is off", () => {
    const dev = makeLed({ intensity: 0 });
    const el = makeElement(
      RSLedSlider,
      dev,
      { attribute: "brightness" },
      light(dev),
    );
    expect(el.value()).toBe(0);
  });

  it("kelvin: value, fallback when off, range and track", async () => {
    const dev = makeLed({ intensity: 50, kelvin: 12000 });
    const el = makeElement(
      RSLedSlider,
      dev,
      { attribute: "color_temp_kelvin" },
      light(dev),
    );
    expect(el.range()).toEqual({ min: 9000, max: 23000, step: 100 });
    expect(el.value()).toBe(12000);
    light(dev).attributes.color_temp_kelvin = null;
    expect(el.value()).toBe(12000); // last known
    el._last_kelvin = null;
    expect(el.value()).toBe(16000); // middle of the range
    const root = await mount(el);
    expect(root.querySelector(".vthumb")?.textContent).toBe("16.0K");
    expect(root.querySelector(".vtrack_mask")).toBeNull();
    expect(el.track_background()).toMatch(/linear-gradient\(to top, rgb/);
    el.stateObj = { entity_id: "light.x", state: "off", attributes: {} };
    expect(el.range()).toEqual({ min: KELVIN_MIN, max: KELVIN_MAX, step: 100 });
    el.conf = { attribute: "color_temp_kelvin", min: 1, max: 2, step: 1 };
    expect(el.range()).toEqual({ min: 1, max: 2, step: 1 });
    // Degenerate range: the thumb stays at the bottom
    el.conf = { attribute: "brightness", min: 5, max: 5 };
    el.stateObj = light(dev);
    el.requestUpdate();
    await el.updateComplete;
    expect(root.querySelector(".vthumb")?.getAttribute("style")).toBe(
      "bottom:0%",
    );
  });

  it("renders nothing without entity", async () => {
    const dev = makeLed();
    const el = makeElement(RSLedSlider, dev, { attribute: "brightness" });
    const root = await mount(el);
    expect(root.querySelector(".vslider")).toBeNull();
    el.conf = undefined;
    expect(el.range()).toEqual({ min: 0, max: 100, step: 1 });
    expect(el.value()).toBe(0);
  });

  it("value_at() maps the pointer and snaps to the step", () => {
    const dev = makeLed();
    const el = makeElement(
      RSLedSlider,
      dev,
      { attribute: "color_temp_kelvin", step: 1000 },
      light(dev),
    );
    const rect = { top: 100, height: 200 };
    expect(el.value_at(100, rect)).toBe(23000);
    expect(el.value_at(300, rect)).toBe(9000);
    expect(el.value_at(200, rect)).toBe(16000);
    expect(el.value_at(0, rect)).toBe(23000);
    expect(el.value_at(10, { top: 0, height: 0 })).toBe(9000);
  });

  it("follows attribute changes but not while dragging", () => {
    const dev = makeLed({ intensity: 50 });
    const el = makeElement(
      RSLedSlider,
      dev,
      { attribute: "brightness" },
      light(dev),
    );
    const next = { ...light(dev), attributes: { brightness: 255 } };
    const hass = { ...dev.hass, states: { ...dev.hass.states } };
    hass.states["light.led_kelvin_intensity"] = next;
    el._drag_value = 10;
    el.hass = hass;
    expect(el.stateObj).not.toBe(next);
    el._drag_value = null;
    el.hass = hass;
    expect(el.stateObj).toBe(next);
    el.stateObj = null;
    el.hass = hass; // nothing to follow
  });

  it("drag then release sends one service call", async () => {
    const dev = makeLed({ intensity: 50 });
    const el = makeElement(
      RSLedSlider,
      dev,
      { attribute: "brightness" },
      light(dev),
    );
    const root = await mount(el);
    const box = root.querySelector(".vslider") as HTMLElement;
    box.getBoundingClientRect = () =>
      ({ top: 0, height: 100, left: 0, width: 10 }) as DOMRect;
    box.dispatchEvent(
      new PointerEvent("pointerdown", { clientY: 25, bubbles: true }),
    );
    expect(el._drag_value).toBe(75);
    box.dispatchEvent(new PointerEvent("pointermove", { clientY: 60 }));
    expect(el._drag_value).toBe(40);
    box.dispatchEvent(new PointerEvent("pointerup", {}));
    expect(dev.hass.callService).toHaveBeenCalledWith("light", "turn_on", {
      entity_id: "light.led_kelvin_intensity",
      brightness_pct: 40,
    });
  });

  it("commit(): off at 0 %, colour temperature, nothing to send", () => {
    const dev = makeLed({ intensity: 50 });
    const bright = makeElement(
      RSLedSlider,
      dev,
      { attribute: "brightness" },
      light(dev),
    );
    bright._drag_value = 0;
    bright.commit();
    expect(dev.hass.callService).toHaveBeenCalledWith("light", "turn_off", {
      entity_id: "light.led_kelvin_intensity",
    });
    const kel = makeElement(
      RSLedSlider,
      dev,
      { attribute: "color_temp_kelvin" },
      light(dev),
    );
    kel._drag_value = 20000;
    kel.commit();
    expect(dev.hass.callService).toHaveBeenCalledWith("light", "turn_on", {
      entity_id: "light.led_kelvin_intensity",
      color_temp_kelvin: 20000,
    });
    expect(kel._last_kelvin).toBe(20000);
    const calls = dev.hass.callService.mock.calls.length;
    kel.commit(); // no drag in progress
    expect(dev.hass.callService.mock.calls.length).toBe(calls);
  });

  it("does not move while the lamp is off", async () => {
    const dev = makeLed({ intensity: 50 });
    dev.masterOn = false;
    const el = makeElement(
      RSLedSlider,
      dev,
      { attribute: "brightness" },
      light(dev),
    );
    const root = await mount(el);
    const box = root.querySelector(".vslider") as HTMLElement;
    expect(box.classList.contains("disabled")).toBe(true);
    box.dispatchEvent(new PointerEvent("pointerdown", { clientY: 10 }));
    expect(el._drag_value).toBeNull();
  });
});

// ─── Mapping ─────────────────────────────────────────────────────────────────

describe("RSLed mapping", () => {
  it("draws the sky behind the picture and the rest over it", () => {
    expect(config.elements.sky_back.put_in).toBe("back");
    expect((config.elements.beam as any).put_in).toBeUndefined();
    expect(config.off_keep).toContain("device_state");
    // Every element type is registered
    for (const conf of Object.values(config.elements) as any[]) {
      expect(customElements.get(conf.type)).toBeDefined();
    }
  });

  it("G1 switches its sliders between intensity/colour and white/blue", () => {
    const dev = makeLed();
    const hidden = (key: string) =>
      dev.evaluate_condition(config.elements[key].disabled_if, {});
    expect(hidden("intensity_slider")).toBe(false);
    expect(hidden("white_slider")).toBe(true);
    vi.spyOn(dev, "white_blue").mockReturnValue(true);
    expect(hidden("intensity_slider")).toBe(true);
    expect(hidden("color_slider")).toBe(true);
    expect(hidden("white_slider")).toBe(false);
    expect(hidden("blue_slider")).toBe(false);
    expect((config.elements.moon_slider as any).disabled_if).toBeUndefined();
  });

  it("G2 has no white/blue sliders and moves its mode up", () => {
    const els: any = config2.elements;
    expect(els.white_slider).toBeUndefined();
    expect(els.blue_slider).toBeUndefined();
    expect(els.intensity_slider.disabled_if).toBeUndefined();
    expect(els.color_slider.disabled_if).toBeUndefined();
    expect(els.sky_front.geometry.mode.y).toBeLessThan(118);
    for (const conf of Object.values(els) as any[]) {
      expect(customElements.get(conf.type)).toBeDefined();
    }
  });

  it("state icons stay visible on the dark lamp when off", async () => {
    const dev = makeLed();
    const el = new ClickImage() as any;
    el.device = dev;
    el.conf = config.elements.maintenance;
    el.stateOn = true;
    el.hass = dev.hass;
    document.body.appendChild(el);
    await el.updateComplete;
    const icon = el.shadowRoot.querySelector("ha-state-icon");
    expect(icon.getAttribute("style")).toContain("rgba(255,255,255,0.45)");
  });

  it("RSLed keeps its base model", () => {
    expect((new StubRSLed() as any).device.model).toBe("RSLED");
  });

  it("a lamp lists the lamps of its group, and knows which one it is", () => {
    // Every lamp view has the list (empty, hence not shown, when alone)
    expect(config.elements.linked.type).toBe("rsled-linked");
    expect(config2.elements.linked.type).toBe("rsled-linked");
    expect(config.off_keep).toContain("linked");
    const dev = makeLed();
    expect(dev.linked()).toEqual([]);
    dev.hass.states["sensor.led_linked_leds"] = {
      entity_id: "sensor.led_linked_leds",
      state: "2",
      attributes: { leds: [{ hwid: "a", name: "A" }] },
      last_updated: "t",
    };
    dev.entities["linked_leds"] = { entity_id: "sensor.led_linked_leds" };
    expect(dev.linked()).toEqual([{ hwid: "a", name: "A" }]);
    dev.device = { elements: [{}] };
    expect(dev.current_hwid()).toBeNull();
    dev.device = { elements: [{ identifiers: [["redsea", "a"]] }] };
    expect(dev.current_hwid()).toBe("a");
    dev.device = { elements: [{ identifiers: ["weird"] }] };
    expect(dev.current_hwid()).toBeNull();
  });

  it("a G1 grouped with a G2 is not driven by white and blue", () => {
    localStorage.clear();
    const lights = (dev: any) =>
      dev.dialogs.config.content[0].conf.entities.map((e: any) => e.entity);
    const group = (dev: any, leds: any[]) => {
      dev.hass.states["sensor.led_linked_leds"] = {
        entity_id: "sensor.led_linked_leds",
        state: String(leds.length),
        attributes: { leds },
        last_updated: "t",
      };
      dev.entities["linked_leds"] = { entity_id: "sensor.led_linked_leds" };
      dev.update_config();
    };
    const dev = makeLed();
    dev.toggle_white_blue();
    expect(dev.white_blue()).toBe(true);
    expect(lights(dev)).toContain("light.white");

    // In a group of G1 only: nothing changes
    group(dev, [{ hwid: "a" }, { hwid: "b", g2: false }]);
    expect(dev.grouped_with_g2()).toBe(false);
    expect(dev.can_white_blue()).toBe(true);
    expect(dev.white_blue()).toBe(true);

    // A G2 joins: intensity and colour only, as the group is driven
    group(dev, [{ hwid: "a" }, { hwid: "b", g2: true }]);
    expect(dev.grouped_with_g2()).toBe(true);
    expect(dev.can_white_blue()).toBe(false);
    expect(dev.white_blue()).toBe(false);
    // Still a G1: its programs stay white/blue ones
    expect(dev.has_white_blue()).toBe(true);
    const div = document.createElement("div");
    render(dev._render("", ""), div);
    expect(div.querySelector(".rsled_switch")).toBeNull();
    expect(lights(dev)).not.toContain("light.white");
    expect(lights(dev)).not.toContain("light.blue");
    expect(lights(dev)).toContain("light.kelvin_intensity");
    // The other dialogs are kept
    expect(dev.dialogs.led_moon).toBeDefined();

    // The G2 leaves: white and blue are back, the browser's choice too
    group(dev, []);
    expect(dev.white_blue()).toBe(true);
    expect(lights(dev)).toContain("light.white");
    // A G2 itself is not concerned
    const g2 = makeLed({}, true);
    group(g2, [{ hwid: "a" }, { hwid: "b", g2: true }]);
    expect(g2.can_white_blue()).toBe(false);
    expect(lights(g2)).toContain("sensor.white");
    localStorage.clear();
  });
});
