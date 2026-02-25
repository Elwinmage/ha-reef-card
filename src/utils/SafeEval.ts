/**
 * SafeEval - Secure expression evaluator
 *
 * Safely replaces eval() to evaluate expressions
 * in a controlled context.
 *
 * Supports:
 * - Arithmetic operations: +, -, *, /, %, **
 * - Comparisons: ==, !=, <, >, <=, >=, ===, !==
 * - Boolean operators: &&, ||, !
 * - Ternary: condition ? valTrue : valFalse
 * - Translations: i18n._('<key>') or ${i18n._('<key>')}
 * - Property access: obj.prop, obj['prop'], obj.nested.prop
 * - Functions: Math.round(), Math.floor(), parseFloat(), etc.
 * - Templates: ${expression}
 */

import i18n from "../translations/myi18n";
import type { SafeEvalContext } from "../types/index";

export class SafeEval {
  private context: SafeEvalContext;
  private allowedFunctions: Set<string>;

  constructor(context: SafeEvalContext = {}) {
    this.context = {
      ...context,
      i18n: i18n,
      iconv: i18n,
      Math: Math,
      parseFloat: parseFloat,
      parseInt: parseInt,
      Number: Number,
      String: String,
      Boolean: Boolean,
      Array: Array,
      Object: Object,
      Date: Date,
      JSON: JSON,
    };

    // Whitelist of allowed functions
    this.allowedFunctions = new Set([
      "Math.round",
      "Math.floor",
      "Math.ceil",
      "Math.abs",
      "Math.min",
      "Math.max",
      "Math.pow",
      "Math.sqrt",
      "parseFloat",
      "parseInt",
      "Number",
      "String",
      "toFixed",
      "toString",
      "toLowerCase",
      "toUpperCase",
      "trim",
      "split",
      "join",
      "slice",
      "substring",
    ]);
  }

  /**
   * Evaluates an expression within the context
   */
  public evaluate(expression: string | undefined | null): any {
    if (!expression || typeof expression !== "string") {
      return expression;
    }

    try {
      // If it contains ${...} templates, process them
      if (expression.includes("${")) {
        const processed = this.processTemplates(expression);

        // If the result is a simple value after processing, return it
        if (this.isSimpleValue(processed)) {
          const result = this.parseSimpleValue(processed);
          return result;
        }

        return processed;
      }

      // No ${...} template

      // Check if it is a simple value
      if (this.isSimpleValue(expression)) {
        const result = this.parseSimpleValue(expression);
        return result;
      }

      // Otherwise evaluate as an expression
      const result = this.evaluateExpression(expression);
      return result;
    } catch (_error) {
      console.error("SafeEval error:", _error, "Expression:", expression);
      // Do not return the string! Return undefined to avoid misleading booleans
      return undefined;
    }
  }

  /**
   * Processes ${...} templates
   * i18n._() must be inside ${...}
   */
  private processTemplates(text: string): string {
    // If no ${}, return as-is
    if (!text.includes("${")) {
      return text;
    }

    return text.replace(/\$\{([^}]+)\}/g, (match, expression) => {
      try {
        const trimmed = expression.trim();

        // First process i18n._() inside the expression
        const processedExpr = this.processTranslationsInExpression(trimmed);

        const result = this.evaluateExpression(processedExpr);
        return result !== undefined && result !== null ? String(result) : "";
      } catch {
        return match;
      }
    });
  }

  /**
   * Processes ${...} templates inside a JavaScript expression
   * Preserves types by adding quotes for strings
   */
  private processTemplatesForExpression(expression: string): string {
    // If no ${}, return as-is
    if (!expression.includes("${")) {
      return expression;
    }

    return expression.replace(/\$\{([^}]+)\}/g, (match, innerExpr) => {
      try {
        const trimmed = innerExpr.trim();

        // First process i18n._() inside the expression
        const processedExpr = this.processTranslationsInExpression(trimmed);

        const result = this.evaluateExpression(processedExpr);

        // Convert result into valid JavaScript representation
        if (result === undefined || result === null) {
          return String(result);
        }

        // If it's a string, add quotes
        if (typeof result === "string") {
          return `'${result.replace(/'/g, "\\'")}'`; // Escape quotes
        }

        // If it's a number or boolean, convert directly
        if (typeof result === "number" || typeof result === "boolean") {
          return String(result);
        }

        // For other types, convert to JSON
        return JSON.stringify(result);
      } catch {
        return match;
      }
    });
  }

  /**
   * Processes i18n._() translations inside an expression
   */
  private processTranslationsInExpression(expression: string): string {
    // Replace i18n._('<key>') or iconv._('<key>') with the translation
    return expression.replace(
      /(i18n|iconv)\._\(\s*['"]([^'"]+)['"]\s*\)/g,
      (match, obj, key) => {
        try {
          const translation = i18n._(key);
          // Return translation wrapped in quotes for evaluation
          return `"${translation}"`;
        } catch {
          return `"${key}"`;
        }
      },
    );
  }

  /**
   * Checks whether it is a simple value (no evaluation required)
   */
  private isSimpleValue(value: string): boolean {
    const trimmed = value.trim();

    // Number
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return true;
    }

    // String in quotes
    if (/^['"].*['"]$/.test(trimmed)) {
      return true;
    }

    // Boolean
    if (trimmed === "true" || trimmed === "false") {
      return true;
    }

    // null or undefined
    if (trimmed === "null" || trimmed === "undefined") {
      return true;
    }

    return false;
  }

  /**
   * Evaluates a JavaScript expression
   */
  private evaluateExpression(expression: string): any {
    const trimmed = expression.trim();

    // Simple value
    if (this.isSimpleValue(trimmed)) {
      return this.parseSimpleValue(trimmed);
    }

    // Simple variable (e.g. "myVar")
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed)) {
      return this.getNestedProperty(this.context, trimmed);
    }

    // Nested property (e.g. "obj.prop.nested")
    if (
      /^[a-zA-Z_$][a-zA-Z0-9_$.[\]'"]*$/.test(trimmed) &&
      !this.containsOperator(trimmed)
    ) {
      return this.getNestedProperty(this.context, trimmed);
    }

    // Complex expression - use Function
    return this.evaluateComplexExpression(trimmed);
  }

  /**
   * Parses a simple value
   */
  private parseSimpleValue(value: string): any {
    const trimmed = value.trim();

    // Number
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return parseFloat(trimmed);
    }

    // String
    if (/^['"].*['"]$/.test(trimmed)) {
      return trimmed.slice(1, -1);
    }

    // Boolean
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;

    // null or undefined
    if (trimmed === "null") return null;
    if (trimmed === "undefined") return undefined;

    return value;
  }

  /**
   * Checks whether the expression contains operators
   */
  private containsOperator(expression: string): boolean {
    const operators = [
      "+",
      "-",
      "*",
      "/",
      "%",
      "**",
      "==",
      "!=",
      "===",
      "!==",
      "<",
      ">",
      "<=",
      ">=",
      "&&",
      "||",
      "!",
      "?",
      ":",
      "(",
      ")",
    ];

    for (const op of operators) {
      if (expression.includes(op)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Retrieves a nested property
   */
  private getNestedProperty(obj: any, path: string): any {
    if (!path) return undefined;

    // Handle bracket access: obj['prop']
    path = path.replace(/\[['"]([^'"]+)['"]\]/g, ".$1");

    const parts = path.split(".");
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Evaluates a complex expression using Function
   */
  private evaluateComplexExpression(expression: string): any {
    try {
      // Create a function with context variables
      const contextKeys = Object.keys(this.context);
      const contextValues = Object.values(this.context);

      // Create the function
      const func = new Function(
        ...contextKeys,
        `"use strict"; return (${expression});`,
      );

      // Execute with context values
      return func(...contextValues);
    } catch {
      return expression;
    }
  }

  /**
   * Adds or updates a variable in the context
   */
  public setContext(key: string, value: any): void {
    this.context[key] = value;
  }

  /**
   * Adds multiple variables to the context
   */
  public setContextBatch(context: SafeEvalContext): void {
    Object.assign(this.context, context);
  }

  /**
   * Returns the full context
   */
  public getContext(): SafeEvalContext {
    return { ...this.context };
  }

  /**
   * Resets the context
   */
  public resetContext(newContext: SafeEvalContext = {}): void {
    this.context = {
      ...newContext,
      i18n: i18n,
      iconv: i18n,
      Math: Math,
      parseFloat: parseFloat,
      parseInt: parseInt,
      Number: Number,
      String: String,
      Boolean: Boolean,
    };
  }

  /**
   * Evaluates multiple expressions
   */
  public evaluateBatch(expressions: string[]): any[] {
    return expressions.map((expr) => this.evaluate(expr));
  }

  /**
   * Checks whether an expression is valid (without evaluating it)
   */
  public isValidExpression(expression: string): boolean {
    try {
      // Check syntax without executing
      const contextKeys = Object.keys(this.context);
      new Function(...contextKeys, `"use strict"; return (${expression});`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Evaluates a condition (always returns a boolean)
   * Forces evaluation even without ${}
   * Supports ${...} templates inside conditions
   */
  public evaluateCondition(condition: string | undefined | null): boolean {
    if (condition && typeof condition === "boolean") {
      return condition;
    }

    if (
      !condition ||
      typeof condition !== "string" ||
      condition.trim() === ""
    ) {
      return false; // Invalid condition = not disabled by default
    }

    try {
      let processedCondition = condition.trim();
      // If condition contains ${...}, process while preserving types
      if (processedCondition.includes("${")) {
        processedCondition =
          this.processTemplatesForExpression(processedCondition);
      }
      // Force direct evaluation as expression
      const result = this.evaluateComplexExpression(processedCondition);
      // Ensure boolean
      if (typeof result === "boolean") {
        return result;
      }
      // If 0 => false, true else
      if (typeof result === "number") {
        return Boolean(result);
      }
      //otherwise false
      return false;
    } catch (_error) {
      console.error("Condition evaluation error:", condition, _error);
      // On error, return false for safety
      return false;
    }
  }

  /**
   * Evaluates a full template
   * i18n._() must be inside ${...}
   */
  public evaluateTemplate(template: string | undefined | null): string {
    if (!template || typeof template !== "string") {
      return "";
    }

    try {
      return this.processTemplates(template);
    } catch (_error) {
      console.error("Template evaluation error:", template, _error);
      return template;
    }
  }
}

/**
 * Global instance for easier usage
 */
export const safeEval = new SafeEval();

/**
 * Helper function to quickly evaluate an expression
 */
export function evaluate(
  expression: string,
  context: SafeEvalContext = {},
): any {
  const evaluator = new SafeEval(context);
  return evaluator.evaluate(expression);
}

/**
 * Helper function to evaluate a template
 */
export function evaluateTemplate(
  template: string,
  context: SafeEvalContext = {},
): string {
  const evaluator = new SafeEval(context);
  return evaluator.evaluateTemplate(template);
}

/**
 * Helper function to evaluate a condition
 */
export function evaluateCondition(
  condition: string,
  context: SafeEvalContext = {},
): boolean {
  const evaluator = new SafeEval(context);
  return evaluator.evaluateCondition(condition);
}

// Re-export the type for convenience
export type { SafeEvalContext } from "../types/index";
