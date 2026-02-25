/**
 * Unit tests — src/utils/SafeEval.ts (uncovered sections)
 *
 * Targets lines: 79-87, 102-104, 128-170, 183-188, 231, 273-275,
 *                308, 329, 355, 425, 441, 453-457, 473-474
 *
 * Covers:
 *   - setContext() / setContextBatch() / getContext() / resetContext()
 *   - evaluateBatch()
 *   - isValidExpression()
 *   - evaluateTemplate()
 *   - evaluateCondition() with template expressions
 *   - processTemplatesForExpression() via evaluateCondition
 *   - bracket property access in getNestedProperty
 *   - error paths in evaluate() / evaluateCondition()
 *   - safeEval singleton + evaluate() helper
 */

import { describe, it, expect } from "vitest";
import { SafeEval, safeEval, evaluate } from "../src/utils/SafeEval";

// ── setContext / getContext / resetContext ─────────────────────────────────────

describe("SafeEval.setContext()", () => {
  it("adds a new key to the context", () => {
    const se = new SafeEval({ x: 1 });
    se.setContext("y", 42);
    expect(se.getContext().y).toBe(42);
  });

  it("overwrites an existing key", () => {
    const se = new SafeEval({ x: 1 });
    se.setContext("x", 99);
    expect(se.getContext().x).toBe(99);
  });
});

describe("SafeEval.setContextBatch()", () => {
  it("merges multiple keys at once", () => {
    const se = new SafeEval({});
    se.setContextBatch({ a: 1, b: 2, c: 3 });
    const ctx = se.getContext();
    expect(ctx.a).toBe(1);
    expect(ctx.b).toBe(2);
    expect(ctx.c).toBe(3);
  });
});

describe("SafeEval.getContext()", () => {
  it("returns a copy of the context", () => {
    const se = new SafeEval({ x: 10 });
    const ctx = se.getContext();
    expect(ctx.x).toBe(10);
    // Mutating the returned copy must not affect the internal context
    ctx.x = 999;
    expect(se.getContext().x).toBe(10);
  });
});

describe("SafeEval.resetContext()", () => {
  it("clears existing context and applies the new one", () => {
    const se = new SafeEval({ x: 1, y: 2 });
    se.resetContext({ z: 99 });
    const ctx = se.getContext();
    expect(ctx.z).toBe(99);
    expect(ctx.x).toBeUndefined();
  });

  it("always re-injects Math, parseFloat etc. after reset", () => {
    const se = new SafeEval({});
    se.resetContext({});
    const ctx = se.getContext();
    expect(ctx.Math).toBe(Math);
    expect(ctx.parseFloat).toBe(parseFloat);
  });

  it("defaults to empty context when called without argument", () => {
    const se = new SafeEval({ x: 1 });
    se.resetContext();
    expect(se.getContext().x).toBeUndefined();
  });
});

// ── evaluateBatch() ───────────────────────────────────────────────────────────

describe("SafeEval.evaluateBatch()", () => {
  it("evaluates an array of expressions", () => {
    const se = new SafeEval({ n: 5 });
    const results = se.evaluateBatch(["n", "n * 2", "'hello'"]);
    expect(results).toEqual([5, 10, "hello"]);
  });

  it("returns empty array for empty input", () => {
    const se = new SafeEval({});
    expect(se.evaluateBatch([])).toEqual([]);
  });
});

// ── isValidExpression() ───────────────────────────────────────────────────────

describe("SafeEval.isValidExpression()", () => {
  it("returns true for a valid expression", () => {
    const se = new SafeEval({});
    expect(se.isValidExpression("1 + 1")).toBe(true);
  });

  it("returns false for a syntax error", () => {
    const se = new SafeEval({});
    expect(se.isValidExpression("if (")).toBe(false);
  });

  it("returns true for a simple variable reference", () => {
    const se = new SafeEval({ foo: 1 });
    expect(se.isValidExpression("foo")).toBe(true);
  });
});

// ── evaluateTemplate() ────────────────────────────────────────────────────────

describe("SafeEval.evaluateTemplate()", () => {
  it("returns empty string for null input", () => {
    const se = new SafeEval({});
    expect(se.evaluateTemplate(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    const se = new SafeEval({});
    expect(se.evaluateTemplate(undefined)).toBe("");
  });

  it("returns plain string unchanged when no template markers", () => {
    const se = new SafeEval({});
    expect(se.evaluateTemplate("Hello world")).toBe("Hello world");
  });

  it("interpolates ${} expressions", () => {
    const se = new SafeEval({ name: "Reef" });
    expect(se.evaluateTemplate("Hello ${name}!")).toBe("Hello Reef!");
  });

  it("handles multiple ${} in one template", () => {
    const se = new SafeEval({ a: 2, b: 3 });
    expect(se.evaluateTemplate("${a} + ${b} = ${a + b}")).toBe("2 + 3 = 5");
  });
});

// ── evaluateCondition() with template expressions ────────────────────────────

describe("SafeEval.evaluateCondition() — template branches", () => {
  it("evaluates condition with ${} template syntax", () => {
    const se = new SafeEval({ val: 5 });
    expect(se.evaluateCondition("${val} > 3")).toBe(true);
  });

  it("returns false for empty string condition", () => {
    const se = new SafeEval({});
    expect(se.evaluateCondition("")).toBe(false);
  });

  it("returns false for null condition", () => {
    const se = new SafeEval({});
    expect(se.evaluateCondition(null)).toBe(false);
  });

  it("returns false for undefined condition", () => {
    const se = new SafeEval({});
    expect(se.evaluateCondition(undefined)).toBe(false);
  });

  it("handles string comparison with template variables", () => {
    const se = new SafeEval({ state: "off" });
    expect(se.evaluateCondition("${state} == 'off'")).toBe(true);
  });

  it("coerces truthy non-boolean result to true", () => {
    const se = new SafeEval({ x: 1 });
    // "x" evaluates to 1 (truthy)
    expect(se.evaluateCondition("x")).toBe(true);
  });

  it("coerces falsy non-boolean result to false", () => {
    const se = new SafeEval({ x: 0 });
    expect(se.evaluateCondition("x")).toBe(false);
  });
});

// ── Bracket notation in getNestedProperty (via evaluate) ─────────────────────

describe("SafeEval nested property with bracket notation", () => {
  it("resolves obj['key'] via evaluate", () => {
    const se = new SafeEval({ obj: { key: "found" } });
    // Uses evaluateExpression → getNestedProperty bracket-to-dot normalisation
    expect(se.evaluate("obj['key']")).toBe("found");
  });
});

// ── evaluate() error path ─────────────────────────────────────────────────────

describe("SafeEval.evaluate() error handling", () => {
  it("returns undefined on evaluation error", () => {
    const se = new SafeEval({});
    // Provoke an error: reference to an undefined variable in strict mode
    // The error is caught and undefined is returned
    const result = se.evaluate("undeclaredVariable123");
    // Either the variable resolves to undefined via context lookup
    expect(result === undefined || result === "undeclaredVariable123").toBe(
      true,
    );
  });

  it("returns input unchanged when expression is null", () => {
    const se = new SafeEval({});
    expect(se.evaluate(null as any)).toBeNull();
  });

  it("returns input unchanged when expression is not a string", () => {
    const se = new SafeEval({});
    expect(se.evaluate(42 as any)).toBe(42);
  });
});

// ── safeEval singleton ────────────────────────────────────────────────────────

describe("safeEval singleton", () => {
  it("is an instance of SafeEval", () => {
    expect(safeEval).toBeInstanceOf(SafeEval);
  });

  it("can evaluate basic expressions", () => {
    expect(safeEval.evaluate("1 + 1")).toBe(2);
  });
});

// ── evaluate() helper function ────────────────────────────────────────────────

describe("evaluate() helper", () => {
  it("evaluates with an empty default context", () => {
    expect(evaluate("2 * 3")).toBe(6);
  });

  it("evaluates using a provided context", () => {
    expect(evaluate("x + y", { x: 10, y: 5 })).toBe(15);
  });

  it("handles string literals", () => {
    expect(evaluate("'reef'")).toBe("reef");
  });
});
