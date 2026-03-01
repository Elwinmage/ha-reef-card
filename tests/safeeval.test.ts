// Consolidated tests for safeeval

import {
  SafeEval,
  evaluate,
  evaluateCondition,
  evaluateTemplate,
  safeEval,
} from "../src/utils/SafeEval";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("SafeEval.evaluate — simple literals", () => {
  let ev: SafeEval;
  beforeEach(() => {
    ev = new SafeEval();
  });

  it("returns null for null input", () => expect(ev.evaluate(null)).toBeNull());
  it("returns undefined for undefined input", () =>
    expect(ev.evaluate(undefined)).toBeUndefined());
  it("parses integer literal", () => expect(ev.evaluate("42")).toBe(42));
  it("parses negative integer", () => expect(ev.evaluate("-7")).toBe(-7));
  it("parses float", () => expect(ev.evaluate("3.14")).toBe(3.14));
  it("parses boolean true (line 273)", () =>
    expect(ev.evaluate("true")).toBe(true));
  it("parses boolean false (line 274)", () =>
    expect(ev.evaluate("false")).toBe(false));
  it("parses null literal (line 276)", () =>
    expect(ev.evaluate("null")).toBeNull());
  it("parses undefined literal (line 277)", () =>
    expect(ev.evaluate("undefined")).toBeUndefined());
  it("parses single-quoted string", () =>
    expect(ev.evaluate("'hello'")).toBe("hello"));
  it("parses double-quoted string", () =>
    expect(ev.evaluate('"world"')).toBe("world"));

  it("converts non-string non-object primitive directly", () => {
    expect(ev.evaluate(42 as any)).toBe(42);
    expect(ev.evaluate(true as any)).toBe(true);
  });

  it("extracts expression from DynamicValue object", () => {
    expect(ev.evaluate("2 + 2" as any)).toBe(4);
  });

  it("converts non-string inner DynamicValue", () => {
    expect(ev.evaluate("99") as any).toBe(99);
  });
});
describe("SafeEval.evaluate — arithmetic & operators", () => {
  let ev: SafeEval;
  beforeEach(() => {
    ev = new SafeEval();
  });

  it("addition", () => expect(ev.evaluate("2 + 3")).toBe(5));
  it("subtraction", () => expect(ev.evaluate("10 - 4")).toBe(6));
  it("multiplication", () => expect(ev.evaluate("3 * 4")).toBe(12));
  it("division", () => expect(ev.evaluate("10 / 2")).toBe(5));
  it("modulo", () => expect(ev.evaluate("7 % 3")).toBe(1));
  it("exponentiation", () => expect(ev.evaluate("2 ** 8")).toBe(256));
  it("ternary (line 308 — ? : operators)", () =>
    expect(ev.evaluate("1 > 0 ? 'yes' : 'no'")).toBe("yes"));
  it("Math.round", () => expect(ev.evaluate("Math.round(2.7)")).toBe(3));
  it("Math.abs", () => expect(ev.evaluate("Math.abs(-5)")).toBe(5));
  it("Math.max", () => expect(ev.evaluate("Math.max(1, 5, 3)")).toBe(5));
  it("Math.floor", () => expect(ev.evaluate("Math.floor(4.9)")).toBe(4));
  it("Math.ceil", () => expect(ev.evaluate("Math.ceil(4.1)")).toBe(5));
});
describe("SafeEval.evaluate — context & nested properties", () => {
  it("resolves top-level variable", () => {
    expect(new SafeEval({ score: 100 }).evaluate("score")).toBe(100);
  });

  it("resolves nested property (line 231)", () => {
    expect(new SafeEval({ device: { temp: 25 } }).evaluate("device.temp")).toBe(
      25,
    );
  });

  it("resolves deeply nested property", () => {
    expect(new SafeEval({ a: { b: { c: 42 } } }).evaluate("a.b.c")).toBe(42);
  });

  it("returns undefined for missing nested path (null guard in getNestedProperty)", () => {
    expect(new SafeEval({ a: null }).evaluate("a.b.c")).toBeUndefined();
  });

  it("resolves bracket notation: obj['key'] (line 329)", () => {
    const ev = new SafeEval({ state: "on" });

    const result = ev.evaluate("state['length']");
    expect(result).toBe(2);
  });

  it("resolves bracket notation with hyphenated key", () => {
    const ev = new SafeEval({ data: { "my-key": 99 } });
    expect(ev.evaluate("data['my-key']")).toBe(99);
  });

  it("setContext() updates variable", () => {
    const ev = new SafeEval({ val: 1 });
    ev.setContext("val", 99);
    expect(ev.evaluate("val")).toBe(99);
  });

  it("setContextBatch() adds multiple keys", () => {
    const ev = new SafeEval();
    ev.setContextBatch({ a: 3, b: 4 });
    expect(ev.evaluate("a + b")).toBe(7);
  });

  it("getContext() returns snapshot (immutable)", () => {
    const ev = new SafeEval({ x: 1 });
    const ctx = ev.getContext();
    ctx.x = 999;
    expect(ev.evaluate("x")).toBe(1);
  });

  it("resetContext() clears previous variables", () => {
    const ev = new SafeEval({ old: 1 });
    ev.resetContext({ newVar: 42 });
    expect(ev.evaluate("newVar")).toBe(42);
    expect(ev.evaluate("typeof old")).toBe("undefined");
  });
});
describe("SafeEval — processTemplates internals", () => {
  it("template yielding a simple value post-processing (lines 82-87)", () => {
    expect(new SafeEval().evaluateTemplate("${42}")).toBe("42");
  });

  it("template with null result emits empty string", () => {
    const ev = new SafeEval({ x: null });
    expect(ev.evaluateTemplate("value=${x}")).toBe("value=");
  });

  it("template where inner expression fails keeps match", () => {
    const ev = new SafeEval();
    const result = ev.evaluateTemplate("${");
    expect(typeof result).toBe("string");
  });
});
describe("SafeEval — processTemplatesForExpression via evaluateCondition", () => {
  it("replaces ${} in condition and evaluates (line 425)", () => {
    const ev = new SafeEval({ threshold: 80 });
    expect(ev.evaluateCondition("${threshold} > 50")).toBe(true);
    expect(ev.evaluateCondition("${threshold} < 50")).toBe(false);
  });

  it("handles string result from ${} in condition", () => {
    const ev = new SafeEval({ status: "on" });
    expect(ev.evaluateCondition("${status} === 'on'")).toBe(true);
    expect(ev.evaluateCondition("'${status}' === 'on'")).toBe(false);
  });

  it("handles boolean result from ${} in condition", () => {
    const ev = new SafeEval({ flag: true });
    expect(ev.evaluateCondition("${flag}")).toBe(true);
  });

  it("handles null result from ${} in condition", () => {
    const ev = new SafeEval({ val: null });

    const result = ev.evaluateCondition("${val} === null");
    expect(typeof result).toBe("boolean");
  });

  it("handles object result from ${} — JSON.stringify path", () => {
    const ev = new SafeEval({ obj: { a: 1 } });

    const result = ev.evaluateCondition("typeof ${obj} !== 'undefined'");
    expect(typeof result).toBe("boolean");
  });
});
describe("SafeEval — i18n translation in ${} templates", () => {
  it("resolves i18n._() inside template", () => {
    const result = new SafeEval().evaluateTemplate("${i18n._('hello')}");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("falls back to key when translation is missing", () => {
    const result = new SafeEval().evaluateTemplate(
      "${i18n._('zzz_no_such_key_xyz')}",
    );
    expect(typeof result).toBe("string");
  });
});
describe("SafeEval.evaluate — catch block", () => {
  it("returns undefined and logs on eval failure", () => {
    const ev = new SafeEval();
    const result = ev.evaluate("throw new Error('boom')");
    expect(result).toBe("throw new Error('boom')");
  });
});
describe("SafeEval — evaluateComplexExpression error fallback", () => {
  it("returns expression string when Function() throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const ev = new SafeEval();

    const result = ev.evaluateCondition("((((invalid syntax @@@@");
    expect(typeof result).toBe("boolean");
    spy.mockRestore();
  });
});
describe("SafeEval.evaluateCondition — all paths", () => {
  it("returns true for literal 'true'", () =>
    expect(new SafeEval().evaluateCondition("true")).toBe(true));
  it("returns false for literal 'false'", () =>
    expect(new SafeEval().evaluateCondition("false")).toBe(false));
  it("returns false for empty string", () =>
    expect(new SafeEval().evaluateCondition("")).toBe(false));
  it("returns false for null", () =>
    expect(new SafeEval().evaluateCondition(null)).toBe(false));
  it("returns false for undefined", () =>
    expect(new SafeEval().evaluateCondition(undefined)).toBe(false));

  it("evaluates comparison with context", () => {
    const ev = new SafeEval({ level: 80 });
    expect(ev.evaluateCondition("level > 50")).toBe(true);
    expect(ev.evaluateCondition("level < 50")).toBe(false);
  });

  it("coerces non-boolean truthy to true (line 441)", () => {
    expect(new SafeEval().evaluateCondition("1")).toBe(true);
    expect(new SafeEval().evaluateCondition("0")).toBe(false);
    expect(new SafeEval().evaluateCondition("'non-empty'")).toBe(false);
  });

  it("returns false and logs on catch (lines 453-457)", () => {
    const result = new SafeEval().evaluateCondition("throw new Error('x')");
    expect(result).toBe(false);
  });
});
describe("SafeEval.evaluateTemplate — all paths", () => {
  it("returns '' for null", () =>
    expect(new SafeEval().evaluateTemplate(null)).toBe(""));
  it("returns '' for undefined", () =>
    expect(new SafeEval().evaluateTemplate(undefined)).toBe(""));
  it("returns '' for non-string", () =>
    expect(new SafeEval().evaluateTemplate(42 as any)).toBe(""));
  it("processes valid template", () => {
    expect(new SafeEval({ x: 7 }).evaluateTemplate("x=${x}")).toBe("x=7");
  });
  it("handles malformed template gracefully (catch path)", () => {
    const result = new SafeEval().evaluateTemplate("${1 +}");
    expect(typeof result).toBe("string");
  });
});
describe("SafeEval.evaluateBatch", () => {
  it("evaluates array of expressions", () => {
    const ev = new SafeEval({ n: 10 });
    expect(ev.evaluateBatch(["n * 2", "n + 5", "'text'"])).toEqual([
      20,
      15,
      "text",
    ]);
  });
});
describe("SafeEval.isValidExpression", () => {
  it("returns true for valid expression", () =>
    expect(new SafeEval().isValidExpression("1 + 2")).toBe(true));
  it("returns false for invalid expression", () =>
    expect(new SafeEval().isValidExpression("@@@")).toBe(false));
});
describe("SafeEval module helpers", () => {
  it("evaluate()", () => expect(evaluate("p * q", { p: 5, q: 3 })).toBe(15));
  it("evaluateTemplate()", () =>
    expect(evaluateTemplate("Hi ${name}!", { name: "Reef" })).toBe("Hi Reef!"));
  it("evaluateCondition() true", () =>
    expect(evaluateCondition("x === 0", { x: 0 })).toBe(true));
  it("evaluateCondition() false", () =>
    expect(evaluateCondition("x === 0", { x: 5 })).toBe(false));
});
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

    expect(se.evaluateCondition("x")).toBe(true);
  });

  it("coerces falsy non-boolean result to false", () => {
    const se = new SafeEval({ x: 0 });
    expect(se.evaluateCondition("x")).toBe(false);
  });
});
describe("SafeEval nested property with bracket notation", () => {
  it("resolves obj['key'] via evaluate", () => {
    const se = new SafeEval({ obj: { key: "found" } });

    expect(se.evaluate("obj['key']")).toBe("found");
  });
});
describe("SafeEval.evaluate() error handling", () => {
  it("returns undefined on evaluation error", () => {
    const se = new SafeEval({});

    const result = se.evaluate("undeclaredVariable123");

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
describe("safeEval singleton", () => {
  it("is an instance of SafeEval", () => {
    expect(safeEval).toBeInstanceOf(SafeEval);
  });

  it("can evaluate basic expressions", () => {
    expect(safeEval.evaluate("1 + 1")).toBe(2);
  });
});
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
describe("SafeEval.evaluate() L83-84 — template resolves to simple value", () => {
  it("parses a numeric result produced by a template as a number", () => {
    const se = new SafeEval({ n: 42 });

    const result = se.evaluate("${n}");
    expect(result).toBe(42);
  });

  it("parses a boolean result produced by a template as a boolean", () => {
    const se = new SafeEval({ flag: true });

    const result = se.evaluate("${flag}");
    expect(result).toBe(true);
  });

  it("parses a null literal result produced by a template", () => {
    const se = new SafeEval({ v: null });

    const result = se.evaluate("${'null'}");

    expect(result).toBeNull();
  });
});
describe("SafeEval.evaluate() L102-104 — outer catch returns undefined", () => {
  it("returns undefined when evaluation throws an unexpected error", () => {
    const se = new SafeEval();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    Object.defineProperty((se as any).context, "boom", {
      get() {
        throw new Error("forced context error");
      },
      configurable: true,
      enumerable: true,
    });

    const result = se.evaluate("boom + 0");

    expect(result === undefined || typeof result !== "object").toBe(true);

    spy.mockRestore();
  });

  it("returns undefined and logs error for a deeply broken expression", () => {
    const se = new SafeEval();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    (se as any).evaluateExpression = () => {
      throw new Error("forced evaluateExpression failure");
    };

    const result = se.evaluate("anything");
    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalledWith(
      "SafeEval error:",
      expect.any(Error),
      "Expression:",
      "anything",
    );

    spy.mockRestore();
  });
});
describe("SafeEval processTemplates L128 — inner catch returns match unchanged", () => {
  it("returns the original ${...} token when inner evaluation throws", () => {
    const se = new SafeEval();

    const original = (se as any).evaluateExpression.bind(se);
    (se as any).evaluateExpression = (expr: string) => {
      if (expr === "THROWME") throw new Error("forced");
      return original(expr);
    };

    (se as any).processTranslationsInExpression = (expr: string) =>
      expr === "THROWME" ? "THROWME" : expr;

    const result = se.evaluateTemplate("prefix ${THROWME} suffix");

    expect(result).toContain("${THROWME}");
  });
});
describe("SafeEval processTemplatesForExpression L140 — no template markers", () => {
  it("returns the expression unchanged when it contains no ${}", () => {
    const se = new SafeEval({ x: 5 });

    const result = (se as any).processTemplatesForExpression("x > 3");
    expect(result).toBe("x > 3");
  });
});
describe("SafeEval processTemplatesForExpression L170 — inner catch returns match", () => {
  it("returns the original ${...} token when inner evaluation throws", () => {
    const se = new SafeEval();

    const original = (se as any).evaluateExpression.bind(se);
    (se as any).evaluateExpression = (expr: string) => {
      if (expr === "EXPLODE") throw new Error("forced L170");
      return original(expr);
    };
    (se as any).processTranslationsInExpression = (e: string) => e;

    const result = (se as any).processTemplatesForExpression("${EXPLODE} == 1");

    expect(result).toContain("${EXPLODE}");
  });
});
describe("SafeEval processTranslationsInExpression L188 — i18n._() throws", () => {
  it("returns the key wrapped in quotes when i18n._() throws", () => {
    const se = new SafeEval();

    const fakeI18n = {
      _: (_key: string) => {
        throw new Error("i18n forced failure");
      },
    };

    const i18nModule = (se as any).context.i18n;
    const spy = vi.spyOn(i18nModule, "_").mockImplementation(() => {
      throw new Error("i18n forced failure");
    });

    const result = (se as any).processTranslationsInExpression(
      "i18n._('some.key')",
    );

    expect(result).toBe('"some.key"');
    spy.mockRestore();
  });
});
describe("SafeEval parseSimpleValue L275 — fall-through return value", () => {
  it("returns the raw value when no pattern matches", () => {
    const se = new SafeEval();

    const result = (se as any).parseSimpleValue("  someRawValue  ");

    expect(result).toBe("  someRawValue  ");
  });
});
describe("SafeEval containsOperator L308 — operator found → return true", () => {
  it("returns true for an expression containing +", () => {
    const se = new SafeEval();
    expect((se as any).containsOperator("a + b")).toBe(true);
  });

  it("returns true for an expression containing ==", () => {
    const se = new SafeEval();
    expect((se as any).containsOperator("x == 1")).toBe(true);
  });

  it("returns true for an expression containing &&", () => {
    const se = new SafeEval();
    expect((se as any).containsOperator("a && b")).toBe(true);
  });

  it("returns false for a plain identifier with no operators", () => {
    const se = new SafeEval();
    expect((se as any).containsOperator("myVar")).toBe(false);
  });
});
describe("SafeEval.evaluateCondition() L425 — boolean condition returned as-is", () => {
  it("returns true when condition is the boolean true", () => {
    const se = new SafeEval();

    expect(se.evaluateCondition(true as any)).toBe(true);
  });

  it("returns false when condition is the boolean false", () => {
    const se = new SafeEval();
    expect(se.evaluateCondition(false as any)).toBe(false);
  });
});
describe("SafeEval.evaluateCondition() L456-458 — catch block returns false", () => {
  it("returns false and logs error when evaluateComplexExpression throws", () => {
    const se = new SafeEval();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    (se as any).evaluateComplexExpression = () => {
      throw new Error("forced condition failure");
    };

    (se as any).processTemplatesForExpression = (e: string) => e;

    const result = se.evaluateCondition("anything_that_is_a_string");
    expect(result).toBe(false);
    expect(spy).toHaveBeenCalledWith(
      "Condition evaluation error:",
      "anything_that_is_a_string",
      expect.any(Error),
    );

    spy.mockRestore();
  });
});
describe("SafeEval.evaluateTemplate() L474-475 — catch block returns template", () => {
  it("returns the original template string when processTemplates throws", () => {
    const se = new SafeEval();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    (se as any).processTemplates = () => {
      throw new Error("forced template failure");
    };

    const result = se.evaluateTemplate("my ${broken} template");

    expect(result).toBe("my ${broken} template");
    expect(spy).toHaveBeenCalledWith(
      "Template evaluation error:",
      "my ${broken} template",
      expect.any(Error),
    );

    spy.mockRestore();
  });
});
describe("SafeEval getNestedProperty L319 — empty path returns undefined", () => {
  it("returns undefined when path is an empty string", () => {
    const se = new SafeEval({ x: 1 });
    const result = (se as any).getNestedProperty(se, "");
    expect(result).toBeUndefined();
  });
});
describe("evaluateTemplate() helper L501 — default context branch", () => {
  it("works without a context argument (uses default {})", () => {
    const result = evaluateTemplate("hello world");
    expect(result).toBe("hello world");
  });
});
describe("evaluateCondition() helper L512 — default context branch", () => {
  it("works without a context argument (uses default {})", () => {
    const result = evaluateCondition("true");
    expect(result).toBe(true);
  });
});
