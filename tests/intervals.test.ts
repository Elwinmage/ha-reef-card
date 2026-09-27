import { describe, it, expect } from "vitest";
import {
  intervalsValid,
  scheduleSavable,
  validateIntervals,
} from "../src/utils/intervals";

describe("validateIntervals", () => {
  it("accepts disjoint, ordered slots", () => {
    const errors = validateIntervals([
      { time: 60, duration: 30 },
      { time: 91, duration: 30 },
    ]);
    expect(errors).toEqual([
      { overlap: false, endBeforeStart: false },
      { overlap: false, endBeforeStart: false },
    ]);
    expect(intervalsValid(errors)).toBe(true);
  });

  it("flags an end that is not after the start", () => {
    expect(validateIntervals([{ time: 60, duration: 0 }])[0]).toEqual({
      overlap: false,
      endBeforeStart: true,
    });
    expect(
      validateIntervals([{ time: 60, duration: -5 }])[0].endBeforeStart,
    ).toBe(true);
    expect(
      validateIntervals([{ time: 60, duration: NaN }])[0].endBeforeStart,
    ).toBe(true);
  });

  it("flags a start that is not after the previous end", () => {
    const touching = validateIntervals([
      { time: 60, duration: 30 },
      { time: 90, duration: 30 },
    ]);
    expect(touching[1].overlap).toBe(true);
    const inside = validateIntervals([
      { time: 60, duration: 30 },
      { time: 70, duration: 30 },
    ]);
    expect(inside[1].overlap).toBe(true);
    expect(intervalsValid(inside)).toBe(false);
  });

  it("never flags the first slot as overlapping", () => {
    expect(validateIntervals([{ time: 0, duration: 10 }])[0].overlap).toBe(
      false,
    );
    expect(validateIntervals([])).toEqual([]);
  });
});

describe("scheduleSavable", () => {
  it("checks the rows in start order", () => {
    expect(
      scheduleSavable([
        { time: 600, duration: 60 },
        { time: 0, duration: 30 },
      ]),
    ).toBe(true);
    expect(
      scheduleSavable([
        { time: 20, duration: 60 },
        { time: 0, duration: 30 },
      ]),
    ).toBe(false);
  });

  it("does not reorder the rows it is given", () => {
    const rows = [
      { time: 600, duration: 60 },
      { time: 0, duration: 30 },
    ];
    scheduleSavable(rows);
    expect(rows[0].time).toBe(600);
  });
});
