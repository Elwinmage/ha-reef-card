// Tests for the ReefLED weather program in the card
// Covers: src/devices/redsea/rsled/rsled_weather.ts
//         the weather icon of the mappings

import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/devices/index";
import {
  RSLedWeatherSettings,
  day_program,
  parse_lat_lon,
} from "../src/devices/redsea/rsled/rsled_weather";
import { config } from "../src/devices/redsea/rsled/rsled_g1.mapping";
import { config2 } from "../src/devices/redsea/rsled/rsled_g2.mapping";
import { config_virtual_g2 } from "../src/devices/redsea/rsled/rsled_virtual.mapping";
import { WEATHER_ICON } from "../src/devices/redsea/rsled/rsled.common.mapping";
import { RSLedProgramEditor } from "../src/devices/redsea/rsled/rsled_program_editor";
import { dialogs_rsled } from "../src/devices/redsea/rsled/rsled.dialogs";

const DAYS = [
  {
    date: "2026-09-30",
    weekday: 3,
    place_sunrise: "06:02",
    place_sunset: "18:14",
    sunrise: "11:00",
    sunset: "22:00",
    sunshine_hours: 9.1,
    cloud_cover: 22,
    max_intensity: 92,
    clouds: null,
    program: {
      white: { rise: 660, set: 1320, points: [{ t: 300, i: 40 }] },
      blue: { rise: 660, set: 1320, points: [{ t: 300, i: 80 }] },
      moon: { rise: 1350, set: 1530, points: [{ t: 75, i: 10 }] },
    },
  },
  {
    date: "2026-10-01",
    weekday: 4,
    place_sunrise: "06:01",
    place_sunset: "18:15",
    sunrise: "11:00",
    sunset: "22:00",
    sunshine_hours: 4.2,
    cloud_cover: 64,
    max_intensity: 61,
    clouds: { from: 780, to: 960, intensity: "Medium" },
    program: {
      color: {
        rise: 660,
        set: 1320,
        points: [{ t: 300, i1: 61, i2: 61, k1: 15000, k2: 15000 }],
      },
    },
  },
  {
    date: "2026-10-02",
    weekday: 5,
    place_sunrise: "06:00",
    place_sunset: "18:16",
    sunrise: "11:00",
    sunset: "22:00",
    sunshine_hours: 2,
    cloud_cover: 88,
    max_intensity: 38,
    // Older integrations: the intensity only, no program
    clouds: "High",
  },
];

const SETTINGS = {
  period: "next_week",
  location: "-17.71, 178.06",
  min_intensity: 10,
  max_intensity: 95,
  anchor: "sunrise",
  sunrise: "11:00",
  sunset: "22:00",
  clouds: true,
  refresh_days: 7,
};

async function mount(props: Record<string, any> = {}) {
  const el = new RSLedWeatherSettings() as any;
  Object.assign(el, { settings: SETTINGS, hass: { config: {} }, ...props });
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** Settings told by the panel. */
function told(el: any): any[] {
  const out: any[] = [];
  el.addEventListener("weather-setting", (e: CustomEvent) =>
    out.push([e.detail.key, e.detail.value]),
  );
  return out;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("parse_lat_lon()", () => {
  it("reads 'lat, lon', not a map link", () => {
    expect(parse_lat_lon("-17.71, 178.06")).toEqual({
      latitude: -17.71,
      longitude: 178.06,
    });
    expect(parse_lat_lon("43.6 1.44")).toEqual({
      latitude: 43.6,
      longitude: 1.44,
    });
    expect(parse_lat_lon("https://maps.google.com/@1,2")).toBeNull();
    expect(parse_lat_lon("95, 10")).toBeNull();
    expect(parse_lat_lon(null)).toBeNull();
  });
});

describe("RSLedWeatherSettings", () => {
  it("shows the settings; a change is told, nothing written", async () => {
    const el = await mount();
    const root = el.shadowRoot;
    const changes = told(el);
    expect(root.querySelector(".location").value).toBe("-17.71, 178.06");
    expect(root.querySelector("select.period").value).toBe("next_week");
    expect(root.querySelector("select.anchor").value).toBe("sunrise");
    // The anchor uses the tank's sunrise only
    expect(root.querySelector("input.sunrise").disabled).toBe(false);
    expect(root.querySelector("input.sunset").disabled).toBe(true);
    const set = (sel: string, value: any, prop = "value") => {
      const input = root.querySelector(sel);
      input[prop] = value;
      input.dispatchEvent(new Event("change"));
    };
    set(".location", "1, 2");
    set("select.period", "last_week");
    set("select.anchor", "both");
    set("input.sunrise", "09:30");
    set("input.sunset", "21:00");
    set("input.min_intensity", "5");
    set("input.max_intensity", "80");
    set("input.refresh_days", "3");
    set("input.clouds", false, "checked");
    expect(changes).toEqual([
      ["location", "1, 2"],
      ["period", "last_week"],
      ["anchor", "both"],
      ["sunrise", "09:30"],
      ["sunset", "21:00"],
      ["min_intensity", 5],
      ["max_intensity", 80],
      ["refresh_days", 3],
      ["clouds", false],
    ]);
    // No map component in the tests: the hint instead
    expect(root.querySelector(".map_missing")).not.toBeNull();
  });

  it("the week of the preview, a day chosen from it", async () => {
    const el = await mount({
      preview: {
        status: "ok",
        latitude: -17.71,
        longitude: 178.06,
        timezone: "Pacific/Fiji",
        days: DAYS,
      },
      day: 4,
    });
    const root = el.shadowRoot;
    expect(root.querySelector(".place").textContent).toContain(
      "-17.71, 178.06 · Pacific/Fiji",
    );
    const lines = root.querySelectorAll(".day_line");
    expect(lines.length).toBe(3);
    const spans = (n: number) =>
      [...lines[n].querySelectorAll("span")].map((c: any) =>
        c.textContent.trim().replace(/\s+/g, " "),
      );
    expect(spans(1)).toEqual([
      "Thursday",
      "☀ 11:00 – 22:00",
      "⏱ 4.2 h",
      "☁ 64 % (Medium)",
      "▲ 61 %",
    ]);
    expect(spans(2)[3]).toBe("☁ 88 % (High)");
    expect(spans(0)[3]).toBe("☁ 22 %");
    expect(lines[0].querySelector("span[title]").getAttribute("title")).toBe(
      "06:02 – 18:14",
    );
    expect(lines[1].classList.contains("selected")).toBe(true);
    const chosen: number[] = [];
    el.addEventListener("weather-day", (e: CustomEvent) =>
      chosen.push(e.detail.day),
    );
    lines[2].click();
    expect(chosen).toEqual([5]);
  });

  it("an error, nothing yet, a place not known", async () => {
    const err = await mount({ preview: { status: "error", error: "offline" } });
    expect(err.shadowRoot.querySelector(".error").textContent).toContain(
      "offline",
    );
    const bare = await mount({ preview: { status: "error" } });
    expect(bare.shadowRoot.querySelector(".error").textContent.trim()).toBe(
      "⚠",
    );
    const none = await mount({ preview: null, settings: undefined });
    expect(none.shadowRoot.querySelector(".day_line")).toBeNull();
    expect(none.shadowRoot.querySelector(".location").value).toBe("");
    // Without an anchor: the place's time, no tank time
    expect(none.shadowRoot.querySelector("input.sunrise").disabled).toBe(true);
    const odd = await mount({ settings: { anchor: "x" } });
    expect(odd.shadowRoot.querySelector("input.sunrise").disabled).toBe(true);
    const noplace = await mount({ preview: { days: DAYS } });
    expect(noplace.shadowRoot.querySelector(".place").textContent.trim()).toBe(
      "📍",
    );
    const notz = await mount({
      preview: { latitude: 1, longitude: 2, days: DAYS },
    });
    expect(notz.shadowRoot.querySelector(".place").textContent).not.toContain(
      "·",
    );
  });

  it("the place: typed, else found by the integration, else home", async () => {
    const hass = { config: { latitude: 44.84, longitude: -0.58 } };
    const typed = await mount({ settings: { location: "1.5, 2.5" }, hass });
    expect(typed.place()).toEqual({ latitude: 1.5, longitude: 2.5 });
    const found = await mount({
      settings: { location: "https://maps/@3,4" },
      preview: { latitude: 3, longitude: 4 },
      hass,
    });
    expect(found.place()).toEqual({ latitude: 3, longitude: 4 });
    const home = await mount({ settings: {}, hass });
    expect(home.place()).toEqual({ latitude: 44.84, longitude: -0.58 });
    const none = await mount({ settings: {}, hass: null });
    expect(none.place()).toEqual({ latitude: 0, longitude: 0 });
  });

  it("a point picked on Home Assistant's map becomes the place", async () => {
    class FakeSelector extends HTMLElement {}
    if (!customElements.get("ha-selector"))
      customElements.define("ha-selector", FakeSelector);
    const el = await mount();
    const changes = told(el);
    const selector = el.shadowRoot.querySelector("ha-selector");
    expect(selector.selector).toEqual({ location: { radius: false } });
    expect(selector.value).toEqual({ latitude: -17.71, longitude: 178.06 });
    selector.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: { latitude: 7, longitude: 8 } },
      }),
    );
    selector.dispatchEvent(new CustomEvent("value-changed", {}));
    el.pick({ latitude: "x" });
    expect(changes).toEqual([["location", "7.0000, 8.0000"]]);
  });
});

describe("weather icon", () => {
  it("bottom right on every view, turns the GPS weather mode on/off", () => {
    expect(config.elements.weather.css.left).toBe(WEATHER_ICON[0]);
    expect(config.elements.weather.icon).toBe("mdi:weather-partly-cloudy");
    expect(config2.elements.weather.css.top).toBe(WEATHER_ICON[1]);
    expect(config_virtual_g2.elements.weather.css.left).toBe(WEATHER_ICON[0]);
    // The lamps of a virtual LED leave it the bottom right corner
    expect(config_virtual_g2.elements.linked.css.height).toBe("28%");
    expect(config.elements.weather.tap_action).toEqual({
      domain: "switch",
      action: "toggle",
      data: "default",
    });
    expect(config.elements.weather.disabled_if).toBe("!entity.weather_sync");
    expect(config.off_keep).toContain("weather");
    expect(dialogs_rsled).not.toHaveProperty("led_weather");
    expect(customElements.get("rsled-weather-settings")).toBe(
      RSLedWeatherSettings,
    );
  });

  it("the editor's draft settings and mode, before any preview", () => {
    const ed: any = new RSLedProgramEditor();
    vi.useFakeTimers();
    ed.set_weather_setting("anchor", "both");
    expect(ed.weather_settings).toEqual({ anchor: "both" });
    ed.set_weather_mode(false); // off, and the lamp off: nothing to read
    expect(ed.preview_loading).toBe(false);
    vi.clearAllTimers();
    vi.useRealTimers();
  });
});

describe("day_program()", () => {
  it("reads a G1 or a G2 day, nothing else", () => {
    expect(day_program(null)).toBeNull();
    expect(day_program("x")).toBeNull();
    expect(day_program(DAYS[0].program)?.white?.rise).toBe(660);
    expect(day_program(DAYS[1].program)?.intensity?.points).toEqual([
      { t: 300, i: 61, k: 15000 },
    ]);
  });
});
