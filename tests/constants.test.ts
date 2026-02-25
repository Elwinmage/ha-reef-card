/**
 * Unit tests — src/utils/constants.ts
 * Covers: OFF_COLOR, DEFAULT_ALPHA
 */

import { describe, it, expect } from "vitest";
import { OFF_COLOR, DEFAULT_ALPHA } from "../src/utils/constants";

describe("OFF_COLOR", () => {
  it("is a string", () => expect(typeof OFF_COLOR).toBe("string"));

  it("is a valid R,G,B tuple", () => {
    const parts = OFF_COLOR.split(",");
    expect(parts).toHaveLength(3);
    parts.forEach((p) => {
      const v = parseInt(p.trim(), 10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(255);
    });
  });

  it("equals '150,150,150'", () => expect(OFF_COLOR).toBe("150,150,150"));
});

describe("DEFAULT_ALPHA", () => {
  it("is a number", () => expect(typeof DEFAULT_ALPHA).toBe("number"));
  it("is in range [0, 1]", () => {
    expect(DEFAULT_ALPHA).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_ALPHA).toBeLessThanOrEqual(1);
  });
  it("equals 0.5", () => expect(DEFAULT_ALPHA).toBe(0.5));
});
