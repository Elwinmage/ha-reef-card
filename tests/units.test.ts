// Tests for the unit conversion helpers

import { unit_def, unit_factor } from "../src/utils/units";
import { describe, expect, it } from "vitest";

describe("unit_def", () => {
  it("resolves volume and mass units, case-insensitively", () => {
    expect(unit_def("mL")).toEqual({ dimension: "volume", factor: 1 });
    expect(unit_def(" L ")).toEqual({ dimension: "volume", factor: 1000 });
    expect(unit_def("kg")).toEqual({ dimension: "mass", factor: 1000 });
  });

  it("returns null for unknown, empty or non-string units", () => {
    expect(unit_def("dKH")).toBeNull();
    expect(unit_def("")).toBeNull();
    expect(unit_def("   ")).toBeNull();
    expect(unit_def(undefined)).toBeNull();
    expect(unit_def(42)).toBeNull();
  });
});

describe("unit_factor", () => {
  it("converts between units of the same dimension", () => {
    expect(unit_factor("L", "mL")).toBe(1000);
    expect(unit_factor("mL", "L")).toBe(0.001);
    expect(unit_factor("mL", "mL")).toBe(1);
    expect(unit_factor("gal", "L")).toBeCloseTo(3.785411784);
    expect(unit_factor("kg", "g")).toBe(1000);
  });

  it("returns null across dimensions or for unknown units", () => {
    expect(unit_factor("L", "kg")).toBeNull();
    expect(unit_factor("L", "dKH")).toBeNull();
    expect(unit_factor(undefined, "mL")).toBeNull();
  });
});
