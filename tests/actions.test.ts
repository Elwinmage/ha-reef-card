/**
 * Unit tests — src/devices/actions.ts
 * Covers: actionRegistry structure, run_action dispatch and error handling
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { run_action, actionRegistry } from "../src/devices/actions";

describe("actionRegistry", () => {
  it("is a non-null object", () => {
    expect(actionRegistry).toBeDefined();
    expect(typeof actionRegistry).toBe("object");
  });

  it("contains the dose_head_dialog_func_ext module", () => {
    expect(actionRegistry).toHaveProperty("dose_head_dialog_func_ext");
  });
});

describe("run_action()", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("calls the registered function with forwarded arguments", () => {
    const mockFn = vi.fn().mockReturnValue("result");
    (actionRegistry as any)["_test_mod"] = { fn: mockFn };

    const ret = run_action("_test_mod", "fn", "arg1", 42);

    expect(mockFn).toHaveBeenCalledOnce();
    expect(mockFn).toHaveBeenCalledWith("arg1", 42);
    expect(ret).toBe("result");

    delete (actionRegistry as any)["_test_mod"];
  });

  it("returns undefined and warns when module is missing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(run_action("nonexistent", "fn")).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("returns undefined and warns when function is missing in module", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    (actionRegistry as any)["_empty_mod"] = {};

    expect(run_action("_empty_mod", "missing_fn")).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();

    delete (actionRegistry as any)["_empty_mod"];
  });
});
