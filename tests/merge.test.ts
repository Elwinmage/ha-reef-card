// Consolidated tests for merge

import { Sensor } from "../src/base/sensor";
import { RSSwitch } from "../src/base/switch";
import { MyI18n } from "../src/translations/myi18n";
import { toTime } from "../src/utils/common";
import { isObject, merge, mergeDeep } from "../src/utils/merge";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RSDevice from "../src/devices/device";

class StubDevice extends RSDevice {
  _render(_style: any = null, _substyle: any = null): any {
    return null;
  }
}
if (!customElements.get("stub-device-b"))
  customElements.define("stub-device-b", StubDevice);
class StubSensor extends Sensor {
  protected override _render(_s = ""): any {
    return null;
  }
}
if (!customElements.get("stub-sensor-b"))
  customElements.define("stub-sensor-b", StubSensor);
class StubSwitch extends RSSwitch {
  protected override _render(_s = ""): any {
    return null;
  }
}
if (!customElements.get("stub-switch-b"))
  customElements.define("stub-switch-b", StubSwitch);
function makeState(
  state: string,
  entity_id = "sensor.test",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
): any {
  return {
    states: {
      "sensor.device_state": makeState("on", "sensor.device_state"),
      "sensor.maintenance": makeState("off", "sensor.maintenance"),
      ...states,
    },
    entities,
    devices: {},
    callService: vi.fn(),
  };
}
function makeDevice(
  model = "RSDOSE4",
  name = "my_pump",
  disabled_by: string | null = null,
): any {
  return {
    model,
    name,
    elements: [
      {
        id: "dev-id-001",
        model,
        identifiers: [[null, `${model.toLowerCase()}_1234`]],
        disabled_by,
        primary_config_entry: "cfg-entry-xyz",
      },
    ],
  };
}

describe("isObject", () => {
  it("returns true for plain objects", () => {
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject({})).toBe(true);
  });

  it("returns false for arrays", () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it("returns false for null", () => {
    expect(isObject(null)).toBe(false);
  });

  it("returns false for primitives", () => {
    expect(isObject(42)).toBe(false);
    expect(isObject("string")).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });
});
describe("mergeDeep", () => {
  it("merges flat objects", () => {
    expect(mergeDeep({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it("overwrites primitive values from source", () => {
    expect(mergeDeep({ a: 1, b: 2 }, { b: 99 })).toEqual({ a: 1, b: 99 });
  });

  it("deep-merges nested objects", () => {
    const result = mergeDeep(
      { a: { x: 1, y: 2 }, b: 3 },
      { a: { y: 99, z: 100 } },
    );
    expect(result).toEqual({ a: { x: 1, y: 99, z: 100 }, b: 3 });
  });

  it("handles multiple sources", () => {
    expect(mergeDeep({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it("returns target when no sources provided", () => {
    const target = { a: 1 };
    expect(mergeDeep(target)).toBe(target);
  });

  it("mutates target in place", () => {
    const target = { a: 1 };
    mergeDeep(target, { b: 2 });
    expect(target).toEqual({ a: 1, b: 2 });
  });

  it("initialises missing nested keys on target", () => {
    const result = mergeDeep({} as any, { nested: { deep: true } });
    expect(result).toEqual({ nested: { deep: true } });
  });
});
describe("merge", () => {
  it("returns a merged copy without mutating target", () => {
    const target = { a: 1, b: { x: 10 } };
    const result = merge(target, { b: { y: 20 } });
    expect(result).toEqual({ a: 1, b: { x: 10, y: 20 } });
    expect(target).toEqual({ a: 1, b: { x: 10 } });
  });

  it("overwrites primitive values from source", () => {
    expect(merge({ a: 1, b: 2 }, { b: 42 }).b).toBe(42);
  });

  it("should handle non-object target", () => {
    const result = mergeDeep(null as any, { a: 1 });
    expect(result).toBe(null);
  });

  it("should handle non-object source", () => {
    const target = { a: 1 };
    const result = mergeDeep(target, null as any);
    expect(result).toEqual({ a: 1 });
  });

  it("should skip initialisation if key already exists", () => {
    const target = { nested: { initial: true } };
    const source = { nested: { added: true } };
    const result = merge(target, source);
    expect(result.nested.initial).toBe(true);
    expect(result.nested.added).toBe(true);
  });
});
describe("merge() — additional branches", () => {
  it("overwrites object key with primitive from source", () => {
    const a = { nested: { x: 1 } };
    const b: any = { nested: "string_value" };
    const result = merge(a, b);
    expect(result.nested).toBe("string_value");
  });

  it("overwrites array with new array (no concat)", () => {
    const a: any = { list: [1, 2] };
    const b: any = { list: [3] };
    const result = merge(a, b);
    expect(result.list).toEqual([3]);
  });
});
