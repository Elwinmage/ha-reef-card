/**
 * ReefLed demo: a whole day played in a minute, on the real card.
 *
 * Nothing here draws the lamp: the page loads the card itself (src/) and
 * gives it a fake Home Assistant. Two things make the day go by:
 *
 *   - the clock: the view reads the time with `new Date()`, so `Date` is
 *     replaced by a virtual one whose day runs at the chosen speed. The sun,
 *     the moon, the time under the chart and its red marker all follow;
 *   - the lamp: at each virtual minute the states a real lamp would report
 *     are computed from the day program, with the card's own helpers (the
 *     level of a channel is interpolated between its points, as the lamp
 *     does), and given to the card as a new `hass`.
 *
 * Build and open (from the repository root):
 *   npx vite build --config demo/vite.config.ts
 *   python3 -m http.server --directory demo 8000
 *   http://localhost:8000/rsled_demo.html      (?model=g2 for a G2)
 */
import * as mdi from "@mdi/js";

import "../src/index";
import {
  DEFAULT_KELVIN,
  MINUTES_PER_DAY,
  channel_value,
  edit_value_at,
  kelvin_to_white_blue,
  normalize_program,
  previous_weekday,
  to_edit_points,
  white_blue_to_kelvin,
} from "../src/devices/redsea/rsled/rsled_program";

// ── Virtual clock ────────────────────────────────────────────────────────

const RealDate = Date;

/** Minute of the virtual day, 0..1439 (fractional while it runs). */
let virtual_minute = 6 * 60;

/** Midnight of today, on the real clock: the virtual day starts there. */
const midnight = new RealDate();
midnight.setHours(0, 0, 0, 0);

function virtual_now(): number {
  return midnight.getTime() + Math.floor(virtual_minute) * 60000;
}

/** `Date`, whose "now" is the virtual time; explicit dates are untouched. */
class DemoDate extends RealDate {
  constructor(...args: any[]) {
    if (args.length === 0) {
      super(virtual_now());
    } else {
      // @ts-expect-error: forwarded as given to the Date constructor
      super(...args);
    }
  }

  static override now(): number {
    return virtual_now();
  }
}
(globalThis as any).Date = DemoDate;

/** Weekday of the virtual day: 1 (Monday) .. 7 (Sunday), as the lamp. */
const WEEKDAY = ((midnight.getDay() + 6) % 7) + 1;

// ── Home Assistant elements the card relies on ───────────────────────────

/**
 * SVG path of an "mdi:" icon.
 * @param icon: the icon name, as "mdi:weather-night"
 */
function icon_path(icon?: string): string | null {
  if (!icon || !icon.startsWith("mdi:")) return null;
  const key =
    "mdi" +
    icon
      .slice(4)
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  return (mdi as Record<string, string>)[key] ?? null;
}

class DemoIcon extends HTMLElement {
  protected _icon?: string;

  set icon(value: string | undefined) {
    this._icon = value;
    this.draw();
  }

  get icon(): string | undefined {
    return this._icon;
  }

  connectedCallback(): void {
    this._icon = this._icon ?? this.getAttribute("icon") ?? undefined;
    this.draw();
  }

  protected draw(): void {
    const path = icon_path(this._icon);
    this.style.display = "inline-flex";
    this.style.width = this.style.width || "24px";
    this.style.height = this.style.height || "24px";
    this.innerHTML = path
      ? `<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="${path}"/></svg>`
      : "";
  }
}

/** The icon of an entity: the one its state carries. */
class DemoStateIcon extends DemoIcon {
  set stateObj(value: any) {
    this._icon = value?.attributes?.icon;
    this.draw();
  }

  set hass(_value: any) {
    // Nothing to read from hass: the icon comes with the state
  }
}

if (!customElements.get("ha-icon")) customElements.define("ha-icon", DemoIcon);
if (!customElements.get("ha-state-icon"))
  customElements.define("ha-state-icon", DemoStateIcon);

// Dialogs need Home Assistant's own cards: an empty box stands for them
(window as any).loadCardHelpers = async () => ({
  createCardElement: () => document.createElement("div"),
});

// ── The lamp ─────────────────────────────────────────────────────────────

const G2 = new URLSearchParams(location.search).get("model") === "g2";
const MODEL = G2 ? "RSLED170" : "RSLED160";
const NAME = G2 ? "ReefLED 170" : "ReefLED 160";

/** Start of a weekday on the lamp's weekly timeline, in minutes. */
function day_start(weekday: number): number {
  return (weekday - 1) * MINUTES_PER_DAY;
}

/**
 * /auto/<day> of a G1: white, blue and moon channels. The day rises at
 * 09:00, the blue first, and sets at 21:30; the moon follows until 01:00.
 * @param weekday: 1 (Monday) .. 7 (Sunday)
 */
function g1_program(weekday: number): any {
  const o = day_start(weekday);
  return {
    white: {
      rise: 600 + o,
      set: 1230 + o,
      points: [
        { t: 120, i: 70 },
        { t: 300, i: 85 },
        { t: 510, i: 70 },
      ],
    },
    blue: {
      rise: 540 + o,
      set: 1290 + o,
      points: [
        { t: 90, i: 100 },
        { t: 660, i: 100 },
      ],
    },
    moon: {
      rise: 1295 + o,
      set: 1500 + o,
      points: [
        { t: 30, i: 12 },
        { t: 175, i: 12 },
      ],
    },
  };
}

/**
 * /auto/<day> of a G2: `color` points holding intensity and colour
 * temperature, cold at both ends of the day and warmer at noon.
 * @param weekday: 1 (Monday) .. 7 (Sunday)
 */
function g2_program(weekday: number): any {
  const o = day_start(weekday);
  const point = (t: number, i: number, k: number) => ({
    t,
    i1: i,
    k1: k,
    i2: i,
    k2: k,
  });
  return {
    color: {
      rise: 540 + o,
      set: 1290 + o,
      points: [
        point(90, 40, 20000),
        point(240, 90, 15000),
        point(450, 90, 12000),
        point(630, 45, 20000),
      ],
    },
    moon: g1_program(weekday).moon,
  };
}

/** Clouds of a day: a medium cover in the early afternoon. */
function clouds(weekday: number): any {
  const o = day_start(weekday);
  return {
    from: 780 + o,
    to: 930 + o,
    intensity: "Medium",
    cloud_duration: 4,
    no_cloud_duration: 6,
  };
}

const PROGRAMS: Record<number, any> = {};
for (let day = 1; day <= 7; day++) {
  PROGRAMS[day] = G2 ? g2_program(day) : g1_program(day);
}

/** What the lamp produces at a minute of the virtual day. */
interface Light {
  white: number;
  blue: number;
  moon: number;
  intensity: number;
  kelvin: number;
}

/**
 * Colour temperature of a G2 program at a minute: interpolated between its
 * points, like its intensity.
 * @param channel: the intensity channel of the day (points carry `k`)
 * @param minute: the minute of the day
 */
function kelvin_at(channel: any, minute: number): number {
  const pts = to_edit_points(channel, true);
  if (pts.length < 2) return DEFAULT_KELVIN;
  const m = Math.min(Math.max(minute, pts[0].m), pts[pts.length - 1].m);
  let n = 1;
  while (n < pts.length - 1 && m > pts[n].m) n++;
  const a = pts[n - 1];
  const b = pts[n];
  const ka = a.k ?? DEFAULT_KELVIN;
  const kb = b.k ?? DEFAULT_KELVIN;
  if (b.m === a.m) return kb;
  return ka + ((kb - ka) * (m - a.m)) / (b.m - a.m);
}

/**
 * Levels of the lamp at a minute of the day, from its program: each channel
 * is interpolated between its points (0 at its rise and at its set), and a
 * channel of the day before may still run past midnight.
 * @param minute: the minute of the virtual day
 */
function light_at(minute: number): Light {
  const today = normalize_program(PROGRAMS[WEEKDAY], WEEKDAY, G2) as any;
  const before = previous_weekday(WEEKDAY);
  const yesterday = normalize_program(PROGRAMS[before], before, G2) as any;
  const level = (key: string) =>
    Math.round(channel_value(today?.[key], yesterday?.[key], minute));
  const moon = level("moon");

  if (G2) {
    const intensity = Math.round(
      edit_value_at(to_edit_points(today?.intensity), minute),
    );
    const kelvin = Math.round(kelvin_at(today?.intensity, minute) / 100) * 100;
    // The channels behind that colour, at that intensity
    const mix = kelvin_to_white_blue(kelvin, MODEL);
    const share = (pct: number) => Math.round((pct * intensity) / 100);
    return {
      white: share(mix.white),
      blue: share(mix.blue),
      moon,
      intensity,
      kelvin,
    };
  }
  const white = level("white");
  const blue = level("blue");
  return {
    white,
    blue,
    moon,
    intensity: Math.max(white, blue),
    kelvin: white_blue_to_kelvin(white, blue, MODEL),
  };
}

// ── Fake Home Assistant ──────────────────────────────────────────────────

/**
 * The hass object of a minute: the entities of the lamp, as the
 * integration exposes them.
 * @param minute: the minute of the virtual day
 */
function hass_at(minute: number): any {
  const states: Record<string, any> = {};
  const entities: Record<string, any> = {};
  const add = (
    domain: string,
    key: string,
    state: string | number,
    attributes: Record<string, any> = {},
  ) => {
    const id = `${domain}.reefled_${key}`;
    states[id] = {
      entity_id: id,
      state: String(state),
      attributes,
      last_updated: String(minute),
    };
    entities[id] = {
      entity_id: id,
      device_id: "lamp",
      translation_key: key,
      platform: "redsea",
    };
  };
  const light = light_at(minute);
  const brightness = (pct: number) => Math.round(pct * 2.55);
  const lamp = (key: string, pct: number, attributes: any = {}) =>
    add("light", key, pct > 0 ? "on" : "off", {
      brightness: brightness(pct),
      ...attributes,
    });

  for (let day = 1; day <= 7; day++) {
    add("sensor", "auto_" + day, "Demo", {
      data: PROGRAMS[day],
      clouds: clouds(day),
    });
  }
  if (G2) {
    // A G2 reports its white and blue channels as read-only sensors
    add("sensor", "white", light.white);
    add("sensor", "blue", light.blue);
  } else {
    lamp("white", light.white);
    lamp("blue", light.blue);
  }
  lamp("moon", light.moon);
  lamp("kelvin_intensity", light.intensity, {
    color_temp_kelvin: light.kelvin,
    min_color_temp_kelvin: G2 ? 8000 : 9000,
    max_color_temp_kelvin: 23000,
  });

  add("switch", "device_state", "on", { icon: "mdi:power-plug" });
  add("switch", "maintenance", "off", { icon: "mdi:account-wrench-outline" });
  add("sensor", "wifi_quality", "good", { icon: "mdi:wifi-strength-3" });
  add("binary_sensor", "battery_level", "off", { icon: "mdi:battery" });
  add("select", "mode", "auto");
  add("sensor", "mode", "auto");
  add("sensor", "current_program", "Demo");
  add("sensor", "todays_moon_day", "10");
  add("switch", "moon_phase", "on", { icon: "mdi:weather-night" });
  add("switch", "acclimation", "off", { icon: "mdi:fish" });
  add("button", "led_identify", "unknown");

  return {
    states,
    entities,
    devices: {
      lamp: {
        id: "lamp",
        name: NAME,
        model: MODEL,
        model_id: "DEMO",
        identifiers: [["redsea", "DEMO"]],
        primary_config_entry: "demo",
        disabled_by: null,
      },
    },
    // No time zone: the card then reads the (virtual) local time
    config: {},
    language: "en",
    locale: { language: "en" },
    formatEntityState: (state: any) => state.state,
    callService: async () => ({}),
    callWS: async () => ({ response: {} }),
    localize: (key: string) => key,
    themes: {},
    user: {},
  };
}

// ── Page ─────────────────────────────────────────────────────────────────

const by_id = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;

const card = document.createElement("reef-card") as any;
card.setConfig({ type: "custom:reef-card", device: NAME });
by_id("host").appendChild(card);
by_id(G2 ? "g2" : "g1").classList.add("on");

const play = by_id<HTMLButtonElement>("play");
const speed = by_id<HTMLSelectElement>("speed");
const slider = by_id<HTMLInputElement>("time");
const clock = by_id("clock");

let running = true;
let shown = -1;

/** Give the card the lamp of the current virtual minute. */
function show(): void {
  const minute = Math.floor(virtual_minute);
  if (minute === shown) return;
  shown = minute;
  card.hass = hass_at(minute);
  slider.value = String(minute);
  const two = (n: number) => String(n).padStart(2, "0");
  clock.textContent = `${two(Math.floor(minute / 60))}:${two(minute % 60)}`;
}

let last = performance.now();

function frame(now: number): void {
  const elapsed = (now - last) / 1000;
  last = now;
  if (running) {
    // The whole day lasts `speed` seconds
    virtual_minute =
      (virtual_minute + (elapsed * MINUTES_PER_DAY) / Number(speed.value)) %
      MINUTES_PER_DAY;
  }
  show();
  requestAnimationFrame(frame);
}

play.addEventListener("click", () => {
  running = !running;
  play.textContent = running ? "Pause" : "Play";
});
slider.addEventListener("input", () => {
  virtual_minute = Number(slider.value);
  show();
});

show();
requestAnimationFrame(frame);
