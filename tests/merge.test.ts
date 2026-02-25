/**
 * Unit tests — src/utils/merge.ts
 * Covers: isObject, mergeDeep, merge
 */

import { describe, it, expect } from "vitest";
import { isObject, mergeDeep, merge } from "../src/utils/merge";

// ── isObject ──────────────────────────────────────────────────────────────────

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

// ── mergeDeep ─────────────────────────────────────────────────────────────────

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

// ── merge ─────────────────────────────────────────────────────────────────────

describe("merge", () => {
  it("returns a merged copy without mutating target", () => {
    const target = { a: 1, b: { x: 10 } };
    const result = merge(target, { b: { y: 20 } });
    expect(result).toEqual({ a: 1, b: { x: 10, y: 20 } });
    expect(target).toEqual({ a: 1, b: { x: 10 } }); // untouched
  });

  it("overwrites primitive values from source", () => {
    expect(merge({ a: 1, b: 2 }, { b: 42 }).b).toBe(42);
  });
});
