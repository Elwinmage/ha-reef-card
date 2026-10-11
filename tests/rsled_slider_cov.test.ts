// Colour temperature bounds of the ReefLED slider, by source.
// Covers: src/devices/redsea/rsled/rsled_slider.ts

import { describe, expect, it } from "vitest";

import "../src/devices/index";
import {
  KELVIN_MAX,
  KELVIN_MIN,
  RSLedSlider,
} from "../src/devices/redsea/rsled/rsled_slider";

function slider(device: any, attributes: any): any {
  const el: any = new RSLedSlider();
  el.device = device;
  el.conf = { attribute: "color_temp_kelvin" };
  el.stateObj =
    attributes === null
      ? null
      : { entity_id: "light.k", state: "on", attributes };
  return el;
}

describe("RSLedSlider kelvin range", () => {
  it("uses the entity bounds when the device gives none", () => {
    // A device without kelvin_range()
    const el = slider(
      {},
      { min_color_temp_kelvin: 10000, max_color_temp_kelvin: 20000 },
    );
    expect(el.range()).toEqual({ min: 10000, max: 20000, step: 100 });
  });

  it("falls back to the G1 bounds without device nor entity bounds", () => {
    const el = slider(undefined, null);
    expect(el.range()).toEqual({ min: KELVIN_MIN, max: KELVIN_MAX, step: 100 });
  });

  it("prefers the lamp group bounds to the entity ones", () => {
    const el = slider(
      { kelvin_range: () => ({ min: 12000, max: 18000 }) },
      { min_color_temp_kelvin: 10000, max_color_temp_kelvin: 20000 },
    );
    expect(el.range()).toEqual({ min: 12000, max: 18000, step: 100 });
  });
});
