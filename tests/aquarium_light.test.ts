import { describe, expect, it } from "vitest";
import {
  darkness,
  device_entities,
  entity_reading,
  lamp_reading,
  reefled_reading,
  relative_tint,
  tint_layers,
  water_light,
} from "../src/aquarium/light";

function hass(
  states: Record<string, any>,
  entities: Record<string, any> = {},
): any {
  return { states, entities, devices: {} };
}

const g1 = {
  "light.led_white": { device_id: "led", translation_key: "white" },
  "light.led_blue": { device_id: "led", translation_key: "blue" },
  "light.led_moon": { device_id: "led", translation_key: "moon" },
  "switch.led_state": { device_id: "led", translation_key: "device_state" },
  "sensor.other": { device_id: "other", translation_key: "x" },
  "sensor.untranslated": { device_id: "led" },
};

describe("device entities", () => {
  it("keys them by domain and translation key", () => {
    expect(device_entities(hass({}, g1), "led")).toEqual({
      "light.white": "light.led_white",
      "light.blue": "light.led_blue",
      "light.moon": "light.led_moon",
      "switch.device_state": "switch.led_state",
    });
    expect(device_entities({} as any, "led")).toEqual({});
  });
});

describe("ReefLED readings", () => {
  it("reads a G1 by its channels", () => {
    const h = hass(
      {
        "light.led_white": { state: "on", attributes: { brightness: 255 } },
        "light.led_blue": { state: "on", attributes: { brightness: 255 } },
        "light.led_moon": { state: "off", attributes: {} },
        "switch.led_state": { state: "on" },
      },
      g1,
    );
    const r = reefled_reading(h, "led", 0.3)!;
    expect(r.dark).toBe(false);
    expect(r.x).toBe(0.3);
    expect(r.power).toBeCloseTo(1);
    expect(r.rgb[2]).toBeGreaterThan(r.rgb[0] - 1);
  });

  it("is dark when switched off, violet with only the moon", () => {
    const off = hass(
      {
        "light.led_white": { state: "on", attributes: { brightness: 255 } },
        "switch.led_state": { state: "off" },
      },
      g1,
    );
    expect(reefled_reading(off, "led", 0.5)!.dark).toBe(true);
    const moon = hass(
      {
        "light.led_white": { state: "off" },
        "light.led_blue": { state: "off" },
        "light.led_moon": { state: "on", attributes: { brightness: 128 } },
      },
      g1,
    );
    const r = reefled_reading(moon, "led", 0.5)!;
    expect(r.dark).toBe(true);
    expect(r.power).toBeLessThanOrEqual(0.12);
  });

  it("reads a G2 by its colour and intensity", () => {
    const ents = {
      "light.g2_k": { device_id: "g2", translation_key: "kelvin_intensity" },
      "sensor.g2_white": { device_id: "g2", translation_key: "white" },
      "sensor.g2_blue": { device_id: "g2", translation_key: "blue" },
    };
    const h = hass(
      {
        "light.g2_k": {
          state: "on",
          attributes: { brightness: 128, color_temp_kelvin: 20000 },
        },
        "sensor.g2_white": { state: "40" },
        "sensor.g2_blue": { state: "bad" },
      },
      ents,
    );
    const r = reefled_reading(h, "g2", 0.5)!;
    expect(r.dark).toBe(false);
    expect(r.power).toBeCloseTo(0.5, 1);
    expect(r.rgb[2]).toBeGreaterThan(200);
    // unavailable kelvin light: falls back on the channels
    h.states["light.g2_k"] = { state: "unavailable" };
    expect(reefled_reading(h, "g2", 0.5)!.dark).toBe(false);
    h.states["light.g2_k"] = { state: "off" };
    expect(reefled_reading(h, "g2", 0.5)!.dark).toBe(true);
  });

  it("is not a lamp without light entities", () => {
    expect(reefled_reading(hass({}, {}), "x", 0)).toBeNull();
  });
});

describe("light entities", () => {
  it("reads colour, temperature and brightness", () => {
    const h = hass({
      "light.rgb": {
        state: "on",
        attributes: { rgb_color: [10, 20, 30], brightness: 255 },
      },
      "light.warm": { state: "on", attributes: { color_temp_kelvin: 3000 } },
      "light.cold": {
        state: "on",
        attributes: { color_temp_kelvin: 20000, brightness: 0 },
      },
      "light.off": { state: "off" },
    });
    expect(entity_reading(h, "light.rgb", 0)).toEqual({
      x: 0,
      rgb: [10, 20, 30],
      power: 1,
      dark: false,
    });
    expect(entity_reading(h, "light.warm", 0).rgb[2]).toBe(170);
    expect(entity_reading(h, "light.cold", 0).dark).toBe(true);
    expect(entity_reading(h, "light.off", 0).dark).toBe(true);
    expect(entity_reading(h, "light.missing", 0).dark).toBe(true);
  });

  it("dispatches sources", () => {
    const h = hass(
      { "light.plain_dev": { state: "on", attributes: {} } },
      { "light.plain_dev": { device_id: "plain", translation_key: "main" } },
    );
    expect(lamp_reading(h, { device_id: "plain", x: 0.2 }).dark).toBe(false);
    expect(lamp_reading(h, { device_id: "nothing", x: 0.2 }).dark).toBe(true);
    expect(lamp_reading(h, { entity_id: "light.plain_dev", x: NaN }).x).toBe(
      0.5,
    );
    expect(lamp_reading(h, { x: 0.1 }).dark).toBe(true);
  });
});

describe("water light", () => {
  it("follows the sun without lamps", () => {
    const night = water_light(hass({ "sun.sun": { state: "below_horizon" } }), {
      lights: [],
    } as any);
    expect(night).toEqual({ lamps: [], dark: true, none: true });
    expect(tint_layers(night, "white")).toBeNull();
    expect(water_light(hass({}), undefined).dark).toBe(false);
  });

  it("sorts lamps and builds the tint", () => {
    const h = hass({
      "light.a": {
        state: "on",
        attributes: { rgb_color: [40, 70, 255], brightness: 255 },
      },
      "light.b": { state: "off" },
    });
    const light = water_light(h, {
      lights: [
        { entity_id: "light.b", x: 0.8 },
        { entity_id: "light.a", x: 0.2 },
      ],
    } as any);
    expect(light.lamps.map((l) => l.x)).toEqual([0.2, 0.8]);
    expect(light.dark).toBe(false);
    const layers = tint_layers(light, "white")!;
    expect(layers.tint).toContain("20.0%");
    expect(layers.veil).toContain("80.0%");
    expect(layers.depth).toContain("rgba(0,10,40,0.00)");
    const single = tint_layers(
      { lamps: [light.lamps[0]], dark: false, none: false },
      "blue",
    )!;
    expect(single.tint).toContain("0%");
    const empty = tint_layers({ lamps: [], dark: true, none: false }, "white")!;
    expect(empty.depth).toContain("0.08");
  });

  it("computes relative tints and darkness", () => {
    expect(relative_tint([255, 250, 235], "white", 1)).toEqual([255, 255, 255]);
    const blue = relative_tint([40, 70, 255], "white", 1);
    expect(blue[2]).toBe(255);
    expect(blue[0]).toBeLessThan(60);
    expect(relative_tint([40, 70, 255], "white", 0)).toEqual([255, 255, 255]);
    // An unknown photo light falls back on the white reference
    expect(relative_tint([1, 1, 1], "bogus" as any, 0.5)).toEqual(
      relative_tint([1, 1, 1], "white", 0.5),
    );
    expect(darkness(1)).toBe(0);
    expect(darkness(0)).toBe(0.55);
    expect(darkness(5)).toBe(0);
  });
});
