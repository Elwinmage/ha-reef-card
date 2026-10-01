/**
 * GPS weather of the ReefWaves (rswave-weather, the program editor's
 * weather zone) and the search of a place by its name (rs-place-search).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/devices/index";
import {
  GEOCODING_URL,
  RSPlaceSearch,
  place_label,
  search_places,
} from "../src/utils/place_search";
import {
  PREVIEW_DELAY,
  RSWaveWeather,
  step_points,
} from "../src/devices/redsea/rswave/rswave_weather";
import { RSWaveSchedule } from "../src/devices/redsea/rswave/rswave_schedule";
import { RSLedWeatherSettings } from "../src/devices/redsea/rsled/rsled_weather";
import * as API from "../src/devices/redsea/rswave/rswave_api";
import i18n from "../src/translations/myi18n";

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

/** A fetch answering the geocoding API. */
function geocoder(results: any, ok = true) {
  const urls: string[] = [];
  const fetcher = async (url: string) => {
    urls.push(url);
    return { ok, status: ok ? 200 : 503, json: async () => results };
  };
  return { urls, fetcher };
}

async function settle(el: any) {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
    await el.updateComplete;
  }
}

// ─── Place search ────────────────────────────────────────────────────────────

describe("search_places()", () => {
  it("asks the geocoding API and keeps the usable places", async () => {
    const { urls, fetcher } = geocoder({
      results: [
        {
          name: "Fakarava",
          admin1: "Tuamotu",
          country: "French Polynesia",
          latitude: -16.05,
          longitude: -145.66,
        },
        { name: "Bad", latitude: "x", longitude: 1 },
      ],
    });
    const found = await search_places("  fakarava ", "fr", fetcher);
    expect(found).toEqual([
      {
        label: "Fakarava, Tuamotu, French Polynesia",
        latitude: -16.05,
        longitude: -145.66,
      },
    ]);
    expect(urls[0].startsWith(GEOCODING_URL + "?")).toBe(true);
    expect(urls[0]).toContain("name=fakarava");
    expect(urls[0]).toContain("language=fr");
  });

  it("short names, no results, errors", async () => {
    const { urls, fetcher } = geocoder({});
    expect(await search_places("a", "en", fetcher)).toEqual([]);
    expect(urls).toHaveLength(0);
    expect(await search_places("nowhere", undefined, fetcher)).toEqual([]);
    await expect(
      search_places("x2", "en", geocoder({}, false).fetcher),
    ).rejects.toThrow("HTTP 503");
    await expect(search_places("x2", "en", async () => null)).rejects.toThrow(
      "HTTP ?",
    );
    // The browser's fetch by default
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, json: async () => ({}) } as any);
    expect(await search_places("maldives")).toEqual([]);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("place_label() drops the missing and repeated parts", () => {
    expect(
      place_label({ name: "Maldives", admin1: "", country: "Maldives" }),
    ).toBe("Maldives");
    expect(place_label(null)).toBe("");
  });
});

describe("rs-place-search", () => {
  async function mount(fetcher: any) {
    const el = new RSPlaceSearch() as any;
    el.fetcher = fetcher;
    el.hass = { language: "fr-FR" };
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("searches on Enter or the button, picks a place", async () => {
    const { urls, fetcher } = geocoder({
      results: [{ name: "Maldives", latitude: 3.2, longitude: 73 }],
    });
    const el = await mount(fetcher);
    const root = el.shadowRoot;
    const input = root.querySelector("input.query");
    input.value = "maldives";
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(urls).toHaveLength(0);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    await settle(el);
    expect(urls[0]).toContain("language=fr");
    const items = root.querySelectorAll("li");
    expect(items).toHaveLength(1);
    const picked: any[] = [];
    el.addEventListener("place-picked", (e: CustomEvent) =>
      picked.push(e.detail),
    );
    (items[0] as HTMLElement).click();
    await settle(el);
    expect(picked).toEqual([
      { label: "Maldives", latitude: 3.2, longitude: 73 },
    ]);
    expect(root.querySelector("ul")).toBeNull();
    expect(input.value).toBe("Maldives");
    (root.querySelector("button.go") as HTMLElement).click();
    await settle(el);
    expect(urls).toHaveLength(2);
  });

  it("tells when nothing is found or the search fails", async () => {
    const el = await mount(geocoder({ results: [] }).fetcher);
    el._query = "zzzz";
    await el.search();
    await el.updateComplete;
    const note = el.shadowRoot.querySelector(".note");
    expect(note.textContent.trim()).toBe(i18n._("place_search_none"));
    el.fetcher = async () => {
      throw new Error("offline");
    };
    el.hass = null;
    await el.search();
    await el.updateComplete;
    const error = el.shadowRoot.querySelector(".note.error");
    expect(error.textContent).toContain("offline");
    el.fetcher = async () => {
      throw "plain";
    };
    await el.search();
    expect(el._note).toContain("plain");
    // The default lookup is the browser's fetch
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, json: async () => ({}) } as any);
    const bare = new RSPlaceSearch() as any;
    bare._query = "fakarava";
    await bare.search();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("the LED weather panel moves its place to the one found", async () => {
    const led = new RSLedWeatherSettings() as any;
    Object.assign(led, { settings: {}, hass: { config: {} } });
    document.body.appendChild(led);
    await led.updateComplete;
    const told: any[] = [];
    led.addEventListener("weather-setting", (e: CustomEvent) =>
      told.push(e.detail),
    );
    led.shadowRoot.querySelector("rs-place-search").dispatchEvent(
      new CustomEvent("place-picked", {
        detail: { latitude: 3.2, longitude: 73 },
      }),
    );
    expect(told).toEqual([{ key: "location", value: "3.2000, 73.0000" }]);
  });
});

// ─── GPS weather zone ────────────────────────────────────────────────────────

const PREVIEW = {
  status: "ok",
  latitude: -16.05,
  longitude: -145.66,
  timezone: "Pacific/Tahiti",
  source: "current",
  fallback: true,
  sunrise: "05:41",
  sunset: "18:02",
  hours: Array.from({ length: 24 }, (_v, h) => ({
    hour: h,
    value: h,
    day: h >= 6 && h < 18,
    speed: 30,
  })),
  pumps: [
    { hwid: "hw1", name: "A", offset: 0, speeds: Array(24).fill(40) },
    { hwid: "hw2", name: "B", offset: -10, speeds: Array(24).fill(35) },
  ],
};

const LIBRARY = {
  linked: true,
  hwid: "hw1",
  waves: [],
  usage: {},
  grouped: true,
  group: [
    { hwid: "hw1", name: "A", in_service: true, available: true },
    { hwid: "hw2", name: "B", in_service: true, available: true },
  ],
  weather: {
    settings: {
      enabled: true,
      location: "-16.05, -145.66",
      source: "current",
      scale: 0,
      day_min: 30,
      day_max: 80,
      night_min: 10,
      night_max: 40,
      tolerance: 5,
      offset: 0,
    },
    base: [],
  },
};

function waveDevice(answers: Record<string, any> = {}) {
  const calls: any[] = [];
  const callWS = vi.fn(async (msg: any) => {
    calls.push(msg);
    const answer = answers[msg.service];
    if (answer instanceof Error) throw answer;
    return { response: answer ?? PREVIEW };
  });
  return {
    calls,
    wave: {
      hass: { callWS },
      device: { elements: [{ primary_config_entry: "entry1" }] },
    },
  };
}

async function mountWeather(
  answers: Record<string, any> = {},
  library: any = LIBRARY,
) {
  vi.useFakeTimers();
  const ctx = waveDevice(answers);
  const el = new RSWaveWeather() as any;
  Object.assign(el, {
    wave: ctx.wave,
    hass: { config: { latitude: 44.8, longitude: -0.6 } },
    library,
  });
  document.body.appendChild(el);
  await el.updateComplete;
  await vi.advanceTimersByTimeAsync(0);
  await settle(el);
  return { ...ctx, el, root: el.shadowRoot };
}

describe("step_points()", () => {
  it("draws each hour as a step, clamped", () => {
    const pts = step_points([0, 100, 150, -5]).split(" ");
    const y = (n: number) => pts[n].split(",")[1];
    expect(pts).toHaveLength(8);
    expect(y(0)).toBe(y(1));
    expect(y(2)).toBe("6");
    expect(y(4)).toBe("6");
    expect(y(6)).toBe(y(0));
  });
});

describe("rswave-weather", () => {
  it("takes the stored settings and previews their day", async () => {
    const { el, root, calls } = await mountWeather();
    expect(calls[0].service).toBe("wave_weather_preview");
    expect(calls[0].service_data.settings).toEqual({
      location: "-16.05, -145.66",
      source: "current",
      scale: 0,
      day_min: 30,
      day_max: 80,
      night_min: 10,
      night_max: 40,
      tolerance: 5,
    });
    expect(root.querySelector("input.enabled").checked).toBe(true);
    expect(root.querySelector("input.tolerance").value).toBe("5");
    expect(root.querySelector("input.location").value).toBe("-16.05, -145.66");
    expect(root.querySelector("select.source").value).toBe("current");
    expect(root.querySelector("input.scale").value).toBe("");
    expect(root.querySelector("input.scale").placeholder).toBe("2");
    expect(root.querySelector("input.day_max").value).toBe("80");
    expect(root.querySelectorAll("polyline")).toHaveLength(2);
    expect(root.querySelectorAll("rect.night")).toHaveLength(12);
    expect(root.querySelector(".place").textContent).toContain(
      "Pacific/Tahiti",
    );
    expect(root.querySelector(".note.warn")).not.toBeNull();
    const offsets = root.querySelectorAll("input.offset");
    expect([...offsets].map((i: any) => i.value)).toEqual(["0", "-10"]);
    expect(root.querySelectorAll(".legend span")).toHaveLength(2);
    // The same library again: the draft is kept
    el._settings = { ...el._settings, day_max: 90 };
    el.library = LIBRARY;
    await el.updateComplete;
    expect(el._settings.day_max).toBe(90);
  });

  it("edits, previews after a pause, applies for the group", async () => {
    const { el, root, calls } = await mountWeather();
    const input = (cls: string) => root.querySelector(cls);
    const set = (cls: string, value: string) => {
      const i = input(cls);
      i.value = value;
      i.dispatchEvent(new Event("change"));
    };
    set("input.day_max", "90");
    set("input.location", "1, 2");
    set("select.source", "wind");
    set("input.scale", "30");
    set("input.tolerance", "8");
    const offsets = root.querySelectorAll("input.offset");
    offsets[1].value = "-20";
    offsets[1].dispatchEvent(new Event("change"));
    await el.updateComplete;
    expect(calls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(PREVIEW_DELAY);
    await settle(el);
    expect(calls).toHaveLength(2);
    expect(calls[1].service_data.settings.day_max).toBe(90);
    expect(calls[1].service_data.settings.source).toBe("wind");
    expect(calls[1].service_data.settings.tolerance).toBe(8);
    expect(calls[1].service_data.offsets).toEqual({ hw2: -20 });
    expect(el.place()).toEqual({ latitude: 1, longitude: 2 });
    // Map or search: the place moves
    el.pick({ latitude: 3.2, longitude: 73 });
    expect(el._settings.location).toBe("3.2000, 73.0000");
    el.pick({ latitude: "x" });
    expect(el._settings.location).toBe("3.2000, 73.0000");
    root.querySelector("rs-place-search").dispatchEvent(
      new CustomEvent("place-picked", {
        detail: { latitude: 1, longitude: 1 },
      }),
    );
    expect(el._settings.location).toBe("1.0000, 1.0000");
    // Turned off, applied
    const box = input("input.enabled");
    box.checked = false;
    box.dispatchEvent(new Event("change"));
    const saved: any[] = [];
    el.addEventListener("wave-weather-saved", (e: CustomEvent) =>
      saved.push(e.detail),
    );
    (input(".btn_apply") as HTMLElement).click();
    await settle(el);
    const call = calls.find((c) => c.service === "wave_weather_save");
    expect(call.service_data.enabled).toBe(false);
    expect(call.service_data.offsets).toEqual({ hw2: -20 });
    expect(call.service_data.settings.enabled).toBeUndefined();
    expect(saved).toEqual([{ enabled: false }]);
  });

  it("shows refusals and errors", async () => {
    const { el, root } = await mountWeather({
      wave_weather_preview: { status: "error", error: "No sun" },
      wave_weather_save: new Error("Refused"),
    });
    expect(root.querySelector(".error").textContent).toContain("No sun");
    await el.save();
    await el.updateComplete;
    const errors = root.querySelectorAll(".error");
    expect(errors[errors.length - 1].textContent).toContain("Refused");
    // A call refused by Home Assistant (preview)
    el.wave.hass.callWS = async () => {
      throw new Error("Down");
    };
    await el.preview();
    expect(el._preview).toEqual({ status: "error", error: "Down" });
    // The integration's own refusal (save)
    el.wave.hass.callWS = async () => ({
      response: { status: "error", error: "Bad place" },
    });
    await el.save();
    expect(el._error).toBe("Bad place");
    el.wave.hass.callWS = async () => ({ response: { status: "error" } });
    await el.save();
    expect(el._error).toBe("");
    el._preview = { status: "error" };
    await el.updateComplete;
    expect(root.querySelector(".error").textContent).toContain("⚠");
  });

  it("without a library, a preview or a map", async () => {
    const { el, root } = await mountWeather({}, null);
    expect(el._enabled).toBe(false);
    expect(el.pumps()).toEqual([]);
    expect(el.place()).toEqual({ latitude: 44.8, longitude: -0.6 });
    el.hass = null;
    expect(el.place()).toEqual({ latitude: 0, longitude: 0 });
    expect(root.querySelector("svg.graph")).toBeNull();
    expect(root.querySelector(".map_missing")).not.toBeNull();
    // The group of the library, before any preview
    el.library = { group: [{ hwid: "h", name: "N" }, { hwid: "k" }] };
    await el.updateComplete;
    el._preview = null;
    expect(el.pumps()).toEqual([
      { hwid: "h", name: "N", offset: 0 },
      { hwid: "k", name: "k", offset: 0 },
    ]);
    el._preview = { status: "ok", hours: [{ hour: 0, day: true }] };
    await el.updateComplete;
    expect(root.querySelectorAll("polyline")).toHaveLength(0);
    // A pump without speeds: an empty line
    el._preview = {
      status: "ok",
      hours: [{ hour: 0, day: true }],
      pumps: [{ hwid: "z", name: "Z" }],
    };
    await el.updateComplete;
    expect(root.querySelector("polyline").getAttribute("points")).toBe("");
    el._preview = { pumps: [{ hwid: "z" }] };
    expect(el.pumps()).toEqual([{ hwid: "z", name: "z", offset: 0 }]);
    // A pending preview is dropped when the zone goes
    el.schedule_preview();
    el.remove();
    await vi.advanceTimersByTimeAsync(PREVIEW_DELAY * 2);
    el.disconnectedCallback();
  });

  it("uses Home Assistant's map when there is one", async () => {
    if (!customElements.get("ha-selector")) {
      customElements.define("ha-selector", class extends HTMLElement {});
    }
    const { el, root } = await mountWeather();
    const map = root.querySelector("ha-selector") as any;
    expect(map.value).toEqual({ latitude: -16.05, longitude: -145.66 });
    map.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: { latitude: 5, longitude: 6 } },
      }),
    );
    expect(el._settings.location).toBe("5.0000, 6.0000");
    map.dispatchEvent(new CustomEvent("value-changed", { detail: null }));
    // The place found by the integration (a map link typed)
    el._settings = { location: "https://maps/x" };
    el._preview = { latitude: 7, longitude: 8 };
    expect(el.place()).toEqual({ latitude: 7, longitude: 8 });
  });
});

// ─── Program editor: base program, saved weather, GPS mark ───────────────────

class StubWeatherSchedule extends RSWaveSchedule {}
if (!customElements.get("stub-rswave-weather-editor"))
  customElements.define("stub-rswave-weather-editor", StubWeatherSchedule);

describe("RSWaveSchedule with the GPS weather", () => {
  function scheduleOf(library: any, entities: Record<string, any> = {}) {
    const calls: any[] = [];
    const callWS = vi.fn(async (msg: any) => {
      calls.push(msg);
      if (msg.service === "wave_library") return { response: library };
      return { response: PREVIEW };
    });
    const el = new StubWeatherSchedule() as any;
    el.device = {
      hass: { callWS },
      device: { elements: [{ primary_config_entry: "entry1" }] },
      schedule: () => [
        {
          start: 0,
          end: 1440,
          uid: "w",
          name: "W",
          type: "re",
          direction: "fw",
          fti: 20,
          rti: 10,
        },
      ],
      now_minute: () => 60,
      is_on: () => true,
      display_name: () => "A",
      state_signature: () => "sig",
      get_entity: (key: string) => entities[key] ?? null,
    };
    el.conf = {};
    el.stateOn = true;
    el.stateObj = null;
    el.hass = {};
    return { el, calls };
  }

  it("edits the pump's own program and reads it again once saved", async () => {
    const base = [
      { st: 0, wave_uid: "night", name: "N", type: "re", direction: "fw" },
      { st: 600, wave_uid: "day", name: "D", type: "ra", direction: "alt" },
    ];
    const library = { ...LIBRARY, weather: { ...LIBRARY.weather, base } };
    const { el, calls } = scheduleOf(library, {
      "switch.wave_weather": { state: "on" },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.gps()).toBe(true);
    expect(el.signature()).toContain("|true");
    expect(el.shadowRoot.querySelector(".graph .title").textContent).toContain(
      i18n._("wave_weather_short"),
    );
    el.openEditor();
    await settle(el);
    expect(el._slots.map((s: any) => s.wave_uid)).toEqual(["night", "day"]);
    const reads = () =>
      calls.filter((c) => c.service === "wave_library").length;
    const root = el.shadowRoot;
    expect(root.querySelector(".note.gps")).not.toBeNull();
    const zone = root.querySelector("rswave-weather");
    expect(zone.library).toBe(el._library);
    // Taken once: a new reading keeps the draft
    el._slots = [{ st: 0, wave_uid: "x", direction: "fw" }];
    await el.load_library();
    expect(el._slots[0].wave_uid).toBe("x");
    // Saved: the program is read again, the base taken again
    const before = reads();
    zone.dispatchEvent(
      new CustomEvent("wave-weather-saved", { detail: { enabled: true } }),
    );
    await settle(el);
    expect(reads()).toBeGreaterThan(before);
    expect(el._slots[0].wave_uid).toBe("night");
  });

  it("off, or on without a base: the program read is edited", async () => {
    const off = scheduleOf({ ...LIBRARY, weather: {} });
    document.body.appendChild(off.el);
    await off.el.updateComplete;
    expect(off.el.gps()).toBe(false);
    off.el.openEditor();
    await settle(off.el);
    expect(off.el._slots[0].wave_uid).toBe("w");
    expect(off.el.shadowRoot.querySelector(".note.gps")).toBeNull();
    const empty = scheduleOf(LIBRARY);
    document.body.appendChild(empty.el);
    await empty.el.updateComplete;
    empty.el.openEditor();
    await settle(empty.el);
    expect(empty.el._slots[0].wave_uid).toBe("w");
    expect(empty.el._take_base).toBe(false);
  });

  it("fetch_library() keeps the weather given", async () => {
    const dev = {
      hass: {
        callWS: async () => ({ response: { weather: { settings: {} } } }),
      },
      device: { elements: [{ primary_config_entry: "e" }] },
    };
    expect((await API.fetch_library(dev)).value!.weather).toEqual({
      settings: {},
    });
  });
});
