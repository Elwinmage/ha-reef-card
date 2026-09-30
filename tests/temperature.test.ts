/**
 * Tests for the temperature unit helpers and their use on raw device bounds.
 *
 * Covers: src/utils/temperature.ts, entity_ranges in src/utils/levels.ts,
 *         solution_label in rscontrol.dialog_func_ext.ts
 */

import { describe, expect, it } from "vitest";
import {
  attribute_to_entity_unit,
  delta_from_celsius,
  delta_to_celsius,
  from_celsius,
  ha_temperature_unit,
  is_temperature_entity,
  needs_conversion,
  round_display,
  to_celsius,
} from "../src/utils/temperature";
import { entity_ranges } from "../src/utils/levels";
import {
  PH_SOLUTIONS,
  solution_label,
} from "../src/devices/redsea/rscontrol/rscontrol.dialog_func_ext";

const hassIn = (temperature: any) => ({
  config: { unit_system: { temperature } },
});

describe("ha_temperature_unit", () => {
  it("reads the unit system of Home Assistant", () => {
    expect(ha_temperature_unit(hassIn("°F"))).toBe("°F");
    expect(ha_temperature_unit(hassIn("K"))).toBe("K");
    expect(ha_temperature_unit(hassIn("°C"))).toBe("°C");
  });

  it("falls back to Celsius", () => {
    expect(ha_temperature_unit(null)).toBe("°C");
    expect(ha_temperature_unit({})).toBe("°C");
    expect(ha_temperature_unit(hassIn("weird"))).toBe("°C");
  });

  it("tells when a conversion is needed", () => {
    expect(needs_conversion(hassIn("°F"))).toBe(true);
    expect(needs_conversion(hassIn("°C"))).toBe(false);
  });
});

describe("conversions", () => {
  it("converts temperatures both ways", () => {
    expect(from_celsius(25, "°F")).toBe(77);
    expect(to_celsius(77, "°F")).toBe(25);
    expect(from_celsius(25, "K")).toBeCloseTo(298.15);
    expect(to_celsius(298.15, "K")).toBeCloseTo(25);
    expect(from_celsius(25, "°C")).toBe(25);
    expect(to_celsius(25, "°C")).toBe(25);
  });

  it("scales a difference without offset", () => {
    expect(delta_from_celsius(0.5, "°F")).toBe(0.9);
    expect(delta_to_celsius(0.9, "°F")).toBeCloseTo(0.5);
    expect(delta_from_celsius(0.5, "K")).toBe(0.5);
    expect(delta_to_celsius(0.5, "°C")).toBe(0.5);
  });

  it("rounds a displayed value to two decimals", () => {
    expect(round_display(77.55000000000001)).toBe(77.55);
    expect(round_display(from_celsius(25.3, "°F"))).toBe(77.54);
  });
});

describe("raw bounds of an entity", () => {
  const temp = (unit: string, ranges: any, device_class = "temperature") => ({
    state: "80",
    attributes: { unit_of_measurement: unit, device_class, ranges },
  });

  it("recognises a temperature entity", () => {
    expect(is_temperature_entity(temp("°F", null))).toBe(true);
    expect(
      is_temperature_entity({ attributes: { unit_of_measurement: "°C" } }),
    ).toBe(true);
    expect(
      is_temperature_entity({ attributes: { unit_of_measurement: "pH" } }),
    ).toBe(false);
    expect(is_temperature_entity(null)).toBe(false);
  });

  it("converts Celsius bounds of a °F entity", () => {
    expect(entity_ranges(temp("°F", [20, 24, 26, 30]))).toEqual([
      68, 75.2, 78.8, 86,
    ]);
    expect(
      attribute_to_entity_unit([25], temp("K", null)).map(
        (v) => Math.round(v * 100) / 100,
      ),
    ).toEqual([298.15]);
  });

  it("keeps the bounds of a °C entity, or of another measure", () => {
    expect(entity_ranges(temp("°C", [20, 24, 26, 30]))).toEqual([
      20, 24, 26, 30,
    ]);
    expect(
      entity_ranges({
        attributes: { unit_of_measurement: "pH", ranges: [7.8, 8, 8.3, 8.5] },
      }),
    ).toEqual([7.8, 8, 8.3, 8.5]);
  });

  it("gives null for unusable bounds", () => {
    expect(entity_ranges(temp("°F", [1, 2]))).toBeNull();
    expect(entity_ranges(null)).toBeNull();
  });
});

describe("pH solution labels", () => {
  it("shows the rated temperature in the unit of Home Assistant", () => {
    const solution = PH_SOLUTIONS.MID![1]!;
    expect(solution_label(solution)).toBe("7.01 (25 °C)");
    expect(solution_label(solution, "°F")).toBe("7.01 (77 °F)");
    expect(solution_label(PH_SOLUTIONS.MID![2]!, "°F")).toBe("7 (68 °F)");
  });
});
