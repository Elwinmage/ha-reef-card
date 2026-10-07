// Tests for the Aqua Medic time-slot program helpers
// Covers: src/devices/aquamedic/common/am_program.ts

import { describe, expect, it } from "vitest";

import * as P from "../src/devices/aquamedic/common/am_program";

const RUNNER: P.AMProgramRules = {
  modes: ["stop", "auto", "feeding"],
  min_value: 30,
  has_frequency: false,
  max_slots: 48,
};

const DRIFT: P.AMProgramRules = {
  modes: [
    "stop",
    "classic_wave",
    "sine_wave",
    "random_wave",
    "constant_flow",
    "feeding",
  ],
  min_value: 0,
  has_frequency: true,
  max_slots: 48,
};

const slot = (
  start: number,
  end: number,
  mode = "auto",
  value = 60,
): P.AMSlot => ({ start, end, mode, value });

describe("mode helpers", () => {
  it("gives each known mode its colour and greys out the others", () => {
    expect(P.mode_color("auto")).toBe("0,150,255");
    expect(P.mode_color("feeding")).toBe("240,150,30");
    expect(P.mode_color("whatever")).toBe(P.mode_color("stop"));
  });

  it("tells a running mode from a stop or a feeding pause", () => {
    expect(P.is_running_mode("auto")).toBe(true);
    expect(P.is_running_mode("sine_wave")).toBe(true);
    expect(P.is_running_mode("stop")).toBe(false);
    expect(P.is_running_mode("feeding")).toBe(false);
  });
});

describe("program_rules", () => {
  it("reads what the schedule sensor publishes", () => {
    expect(
      P.program_rules({
        modes: DRIFT.modes,
        min_value: 0,
        max_slots: 48,
        kind: "drift",
      }),
    ).toEqual(DRIFT);
    expect(
      P.program_rules({ modes: RUNNER.modes, min_value: 30, kind: "runner" }),
    ).toEqual(RUNNER);
  });

  it("falls back to safe defaults when the sensor says nothing", () => {
    expect(P.program_rules(undefined)).toEqual({
      modes: ["stop", "auto", "feeding"],
      min_value: 0,
      has_frequency: false,
      max_slots: P.DEFAULT_MAX_SLOTS,
    });
    expect(
      P.program_rules({ modes: "x", min_value: "x", max_slots: 0 }).max_slots,
    ).toBe(P.DEFAULT_MAX_SLOTS);
  });
});

describe("normalize_schedule", () => {
  it("returns nothing for anything that is not a list", () => {
    expect(P.normalize_schedule(undefined)).toEqual([]);
    expect(P.normalize_schedule("x")).toEqual([]);
  });

  it("keeps usable slots, sorted by start", () => {
    const raw = [
      { slot: 1, start: 720, end: 780, mode: "feeding", value: 10 },
      { slot: 0, start: 480, end: 720, mode: "auto", value: "60" },
      { start: 100, end: 100, mode: "auto", value: 50 }, // empty window
      { start: "x", end: 200 }, // not a time
      { start: 10, end: "x" },
      null,
    ];
    expect(P.normalize_schedule(raw)).toEqual([
      { start: 480, end: 720, mode: "auto", value: 60 },
      { start: 720, end: 780, mode: "feeding", value: 10 },
    ]);
  });

  it("carries the SmartDrift fields and defaults the missing ones", () => {
    expect(
      P.normalize_schedule([
        { start: 0, end: 60, value: "x", frequency: "40", tide: true },
        { start: 60, end: 120, mode: "sine_wave", frequency: "x", tide: 1 },
      ]),
    ).toEqual([
      { start: 0, end: 60, mode: "stop", value: 0, frequency: 40, tide: true },
      {
        start: 60,
        end: 120,
        mode: "sine_wave",
        value: 0,
        frequency: 0,
        tide: false,
      },
    ]);
  });
});

describe("time helpers", () => {
  it("finds the slot running at a given minute", () => {
    const slots = [slot(60, 120), slot(180, 240)];
    expect(P.current_index(slots, 60)).toBe(0);
    expect(P.current_index(slots, 119)).toBe(0);
    expect(P.current_index(slots, 120)).toBe(-1);
    expect(P.current_index(slots, 200)).toBe(1);
    expect(P.current_index([], 0)).toBe(-1);
  });

  it("formats and parses HH:MM", () => {
    expect(P.hhmm(0)).toBe("00:00");
    expect(P.hhmm(750)).toBe("12:30");
    expect(P.parse_hhmm("12:30")).toBe(750);
    expect(P.parse_hhmm(" 8:05:00 ")).toBe(485);
    expect(P.parse_hhmm("23:59")).toBe(P.MAX_MINUTE);
    expect(P.parse_hhmm("24:00")).toBeNull();
    expect(P.parse_hhmm("")).toBeNull();
    expect(P.parse_hhmm(undefined as any)).toBeNull();
  });
});

describe("check_program", () => {
  it("accepts a valid program, adjacent slots included", () => {
    expect(
      P.check_program(
        [slot(0, 60), slot(60, 120, "feeding", 10), slot(120, 180, "stop", 0)],
        RUNNER,
      ),
    ).toBeNull();
    expect(P.check_program([], RUNNER)).toBeNull();
  });

  it("refuses more slots than the pump holds", () => {
    expect(
      P.check_program([slot(0, 1), slot(1, 2)], { ...RUNNER, max_slots: 1 }),
    ).toEqual({ key: "am_sched_err_too_many", params: { max: 1 } });
  });

  it("refuses a slot ending before it starts", () => {
    expect(P.check_program([slot(0, 60), slot(120, 120)], RUNNER)).toEqual({
      key: "sched_err_end_before_start",
      params: { n: 2 },
    });
  });

  it("refuses a speed outside what the motor accepts", () => {
    expect(P.check_program([slot(0, 60, "auto", 20)], RUNNER)).toEqual({
      key: "am_sched_err_value",
      params: { n: 1, min: 30 },
    });
    expect(P.check_program([slot(0, 60, "auto", 101)], RUNNER)?.key).toBe(
      "am_sched_err_value",
    );
    // A SmartDrift has no floor
    expect(P.check_program([slot(0, 60, "sine_wave", 0)], DRIFT)).toBeNull();
  });

  it("refuses a feeding pause outside 1-60 minutes", () => {
    expect(P.check_program([slot(0, 60, "feeding", 0)], RUNNER)).toEqual({
      key: "am_sched_err_feed",
      params: { n: 1, max: 60 },
    });
    expect(P.check_program([slot(0, 60, "feeding", 61)], RUNNER)?.key).toBe(
      "am_sched_err_feed",
    );
  });

  it("refuses a frequency outside 0-100 on a SmartDrift", () => {
    const wave = { ...slot(0, 60, "sine_wave", 50), frequency: 120 };
    expect(P.check_program([wave], DRIFT)).toEqual({
      key: "am_sched_err_frequency",
      params: { n: 1 },
    });
    expect(P.check_program([{ ...wave, frequency: -1 }], DRIFT)?.key).toBe(
      "am_sched_err_frequency",
    );
    // No frequency at all reads as 0
    expect(P.check_program([slot(0, 60, "sine_wave", 50)], DRIFT)).toBeNull();
  });

  it("reports an overlap with the numbers the editor shows", () => {
    // Listed out of time order: slot 1 is the later one
    expect(P.check_program([slot(100, 200), slot(0, 150)], RUNNER)).toEqual({
      key: "sched_err_overlap",
      params: { n: 1, prev: 2 },
    });
  });
});

describe("next_slot", () => {
  it("starts where the last slot ends, an hour long", () => {
    expect(P.next_slot([slot(0, 480)], RUNNER)).toEqual({
      start: 480,
      end: 540,
      mode: "auto",
      value: 50,
    });
  });

  it("starts at midnight on an empty program, with the drift fields", () => {
    expect(P.next_slot([], DRIFT)).toEqual({
      start: 0,
      end: 60,
      mode: "classic_wave",
      value: 50,
      frequency: 50,
      tide: false,
    });
  });

  it("never proposes less than the motor floor", () => {
    expect(P.next_slot([], { ...RUNNER, min_value: 70 })?.value).toBe(70);
  });

  it("is cut at the end of the day, and refused once the day is full", () => {
    expect(P.next_slot([slot(0, 1420)], RUNNER)?.end).toBe(P.MAX_MINUTE);
    expect(P.next_slot([slot(0, P.MAX_MINUTE)], RUNNER)).toBeNull();
  });

  it("falls back to the first gap once the evening is taken", () => {
    // Listed out of order: 00:00-06:00 and 08:00-23:59 leave 06:00-08:00
    expect(
      P.next_slot([slot(480, P.MAX_MINUTE), slot(0, 360)], RUNNER),
    ).toMatchObject({ start: 360, end: 420 });
    // A gap shorter than an hour is filled exactly
    expect(P.next_slot([slot(30, P.MAX_MINUTE)], RUNNER)).toMatchObject({
      start: 0,
      end: 30,
    });
  });

  it("falls back to a stop when the pump has no running mode", () => {
    expect(P.next_slot([], { ...RUNNER, modes: ["stop"] })?.mode).toBe("stop");
  });
});

describe("clamp_slot", () => {
  it("brings the value back inside what the mode accepts", () => {
    expect(P.clamp_slot(slot(0, 60, "stop", 80), RUNNER).value).toBe(0);
    expect(P.clamp_slot(slot(0, 60, "feeding", 80), RUNNER).value).toBe(60);
    expect(P.clamp_slot(slot(0, 60, "feeding", 0), RUNNER).value).toBe(1);
    expect(P.clamp_slot(slot(0, 60, "auto", 10), RUNNER).value).toBe(30);
    expect(P.clamp_slot(slot(0, 60, "auto", 150), RUNNER).value).toBe(100);
  });
});

describe("service_slots", () => {
  it("sends the slots in time order, without the drift fields", () => {
    expect(P.service_slots([slot(120, 180), slot(0, 60)], RUNNER)).toEqual([
      { start: 0, end: 60, mode: "auto", value: 60 },
      { start: 120, end: 180, mode: "auto", value: 60 },
    ]);
  });

  it("adds frequency and tide for a SmartDrift", () => {
    expect(
      P.service_slots(
        [
          { ...slot(0, 60, "sine_wave", 40), frequency: 30, tide: true },
          slot(60, 120, "constant_flow", 40),
        ],
        DRIFT,
      ),
    ).toEqual([
      {
        start: 0,
        end: 60,
        mode: "sine_wave",
        value: 40,
        frequency: 30,
        tide: true,
      },
      {
        start: 60,
        end: 120,
        mode: "constant_flow",
        value: 40,
        frequency: 0,
        tide: false,
      },
    ]);
  });
});
