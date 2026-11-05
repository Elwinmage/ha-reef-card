/**
 * Direction of a reading: the slope of its last hour, against a limit under
 * which it counts as stable.
 */
import { describe, expect, it, vi } from "vitest";
import {
  read_trends,
  slope_per_hour,
  stable_limit,
  trend_of,
} from "../src/utils/trend";

const MINUTE = 60000;

describe("stable_limit", () => {
  it("depends on the kind of reading and its unit", () => {
    expect(stable_limit("ph")).toBe(0.02);
    expect(stable_limit("orp", "mV")).toBe(5);
    expect(stable_limit("temperature", "°C")).toBe(0.1);
    expect(stable_limit("temperature", "°F")).toBeCloseTo(0.18);
    expect(stable_limit("ec", "ppt")).toBe(0.05);
    expect(stable_limit("ec", "mS/cm")).toBe(0.07);
    expect(stable_limit("ec", "SG")).toBe(0.00004);
    expect(stable_limit("ec", null)).toBe(0.05);
  });
});

describe("slope_per_hour", () => {
  it("measures a steady rise", () => {
    const points = [0, 30, 60].map((m) => ({ t: m * MINUTE, v: m / 60 }));
    expect(slope_per_hour(points)).toBeCloseTo(1);
  });

  it("is not moved by one noisy reading at the end", () => {
    const flat = Array.from({ length: 60 }, (_, m) => ({
      t: m * MINUTE,
      v: 8.2,
    }));
    const slope = slope_per_hour([...flat, { t: 60 * MINUTE, v: 8.21 }])!;
    expect(Math.abs(slope)).toBeLessThan(0.02);
  });

  it("needs enough time", () => {
    expect(slope_per_hour([])).toBeNull();
    expect(slope_per_hour([{ t: 0, v: 1 }])).toBeNull();
    expect(
      slope_per_hour([
        { t: 0, v: 1 },
        { t: 10 * MINUTE, v: 2 },
      ]),
    ).toBeNull();
  });
});

describe("trend_of", () => {
  it("tells the direction past the limit", () => {
    expect(trend_of(0.03, 0.02)).toBe("up");
    expect(trend_of(-0.03, 0.02)).toBe("down");
    expect(trend_of(0.01, 0.02)).toBe("stable");
    expect(trend_of(null, 0.02)).toBeNull();
  });

  it("holds a direction a little below the limit", () => {
    expect(trend_of(0.016, 0.02)).toBe("stable");
    expect(trend_of(0.016, 0.02, "up")).toBe("up");
    expect(trend_of(-0.016, 0.02, "up")).toBe("stable");
    expect(trend_of(0.01, 0.02, "up")).toBe("stable");
  });
});

describe("read_trends", () => {
  it("asks for everything in one call and adds the value now", async () => {
    const callWS = vi.fn(async (msg: any) => {
      const start = Date.parse(msg.start_time) / 1000;
      return {
        // Dated before the window, as the state at its start can be
        "sensor.a": [{ s: "8.0", lu: start - 3600 }],
        "sensor.b": [{ s: "300", lu: start }],
      };
    });
    const trends = await read_trends(
      { callWS },
      [
        { entity_id: "sensor.a", type: "ph", value: 8.2 },
        { entity_id: "sensor.b", type: "orp", unit: "mV", value: 300 },
        { entity_id: "sensor.c", type: "ec", unit: "ppt", value: 35 },
      ],
      {},
    );
    expect(callWS).toHaveBeenCalledTimes(1);
    expect(callWS.mock.calls[0]![0].entity_ids).toHaveLength(3);
    expect(trends).toEqual({ "sensor.a": "up", "sensor.b": "stable" });
  });
});
