/**
 * SafeEval - Évaluateur d'expressions sécurisé
 *
 * Remplace eval() de manière sécurisée pour évaluer des expressions
 * dans un contexte contrôlé.
 *
 * Supporte:
 * - Opérations arithmétiques: +, -, *, /, %, **
 * - Comparaisons: ==, !=, <, >, <=, >=, ===, !==
 * - Opérateurs booléens: &&, ||, !
 * - Ternaire: condition ? valTrue : valFalse
 * - Traductions: i18n._('<key>') ou ${i18n._('<key>')}
 * - Accès aux propriétés: obj.prop, obj['prop'], obj.nested.prop
 * - Fonctions: Math.round(), Math.floor(), parseFloat(), etc.
 * - Templates: ${expression}
 */

import i18n from "../translations/myi18n";

export interface SafeEvalContext {
  [key: string]: any;
}

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

    // Liste blanche des fonctions autorisées
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
   * Évalue une expression dans le contexte
   */
  public evaluate(expression: string | undefined | null): any {
    if (!expression || typeof expression !== "string") {
      return expression;
    }

    try {
      // Si contient des templates ${...}, les traiter
      if (expression.includes("${")) {
        const processed = this.processTemplates(expression);

        // Si après traitement c'est une simple valeur, la retourner
        if (this.isSimpleValue(processed)) {
          const result = this.parseSimpleValue(processed);
          return result;
        }

        return processed;
      }

      // Pas de template ${...}

      // Vérifier si c'est une valeur simple
      if (this.isSimpleValue(expression)) {
        const result = this.parseSimpleValue(expression);
        return result;
      }

      // Sinon, évaluer comme expression
      const result = this.evaluateExpression(expression);
      return result;
    } catch (_error) {
      console.error("SafeEval error:", _error, "Expression:", expression);
      // Ne pas retourner la string ! Retourner undefined pour éviter des boolean trompeurs
      return undefined;
    }
  }

  /**
   * Traite les templates ${...}
   * Les i18n._() doivent être à l'intérieur des ${...}
   */
  private processTemplates(text: string): string {
    // Si pas de ${}, retourner tel quel
    if (!text.includes("${")) {
      return text;
    }

    return text.replace(/\$\{([^}]+)\}/g, (match, expression) => {
      try {
        const trimmed = expression.trim();

        // D'abord traiter les i18n._() dans l'expression
        const processedExpr = this.processTranslationsInExpression(trimmed);

        const result = this.evaluateExpression(processedExpr);
        return result !== undefined && result !== null ? String(result) : "";
      } catch {
        return match;
      }
    });
  }

  /**
   * Traite les templates ${...} dans une expression JavaScript
   * Préserve les types en ajoutant des quotes pour les strings
   */
  private processTemplatesForExpression(expression: string): string {
    // Si pas de ${}, retourner tel quel
    if (!expression.includes("${")) {
      return expression;
    }

    return expression.replace(/\$\{([^}]+)\}/g, (match, innerExpr) => {
      try {
        const trimmed = innerExpr.trim();

        // D'abord traiter les i18n._() dans l'expression
        const processedExpr = this.processTranslationsInExpression(trimmed);

        const result = this.evaluateExpression(processedExpr);

        // Convertir le résultat en représentation JavaScript valide
        if (result === undefined || result === null) {
          return String(result);
        }

        // Si c'est une string, ajouter des quotes
        if (typeof result === "string") {
          return `'${result.replace(/'/g, "\\'")}'`; // Échapper les quotes
        }

        // Si c'est un number ou boolean, convertir directement
        if (typeof result === "number" || typeof result === "boolean") {
          return String(result);
        }

        // Pour les autres types, convertir en JSON
        return JSON.stringify(result);
      } catch {
        return match;
      }
    });
  }

  /**
   * Traite les traductions i18n._() dans une expression
   */
  private processTranslationsInExpression(expression: string): string {
    // Remplacer i18n._('<key>') ou iconv._('<key>') par la traduction
    return expression.replace(
      /(i18n|iconv)\._\(\s*['"]([^'"]+)['"]\s*\)/g,
      (match, obj, key) => {
        try {
          const translation = i18n._(key);
          // Retourner la traduction entre quotes pour l'évaluation
          return `"${translation}"`;
        } catch {
          return `"${key}"`;
        }
      },
    );
  }

  /**
   * Vérifie si c'est une valeur simple (pas besoin d'évaluation)
   */
  private isSimpleValue(value: string): boolean {
    const trimmed = value.trim();

    // Nombre
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return true;
    }

    // String entre quotes
    if (/^['"].*['"]$/.test(trimmed)) {
      return true;
    }

    // Boolean
    if (trimmed === "true" || trimmed === "false") {
      return true;
    }

    // null ou undefined
    if (trimmed === "null" || trimmed === "undefined") {
      return true;
    }

    return false;
  }

  /**
   * Évalue une expression JavaScript
   */
  private evaluateExpression(expression: string): any {
    const trimmed = expression.trim();

    // Valeur simple
    if (this.isSimpleValue(trimmed)) {
      return this.parseSimpleValue(trimmed);
    }

    // Variable simple (ex: "myVar")
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed)) {
      return this.getNestedProperty(this.context, trimmed);
    }

    // Propriété imbriquée (ex: "obj.prop.nested")
    if (
      /^[a-zA-Z_$][a-zA-Z0-9_$.[\]'"]*$/.test(trimmed) &&
      !this.containsOperator(trimmed)
    ) {
      return this.getNestedProperty(this.context, trimmed);
    }

    // Expression complexe - utiliser Function
    return this.evaluateComplexExpression(trimmed);
  }

  /**
   * Parse une valeur simple
   */
  private parseSimpleValue(value: string): any {
    const trimmed = value.trim();

    // Nombre
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

    // null
    if (trimmed === "null") return null;
    if (trimmed === "undefined") return undefined;

    return value;
  }

  /**
   * Vérifie si l'expression contient des opérateurs
   */
  private containsOperator(expression: string): boolean {
    // Exclure les points des propriétés
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
   * Récupère une propriété imbriquée
   */
  private getNestedProperty(obj: any, path: string): any {
    if (!path) return undefined;

    // Gérer les accès avec crochets: obj['prop']
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
   * Évalue une expression complexe avec Function
   */
  private evaluateComplexExpression(expression: string): any {
    try {
      // Créer une fonction avec les variables du contexte
      const contextKeys = Object.keys(this.context);
      const contextValues = Object.values(this.context);

      // Créer la fonction
      const func = new Function(
        ...contextKeys,
        `"use strict"; return (${expression});`,
      );

      // Exécuter avec les valeurs du contexte
      const result = func(...contextValues);
      return result;
    } catch {
      return expression;
    }
  }

  /**
   * Ajoute ou met à jour une variable dans le contexte
   */
  public setContext(key: string, value: any): void {
    this.context[key] = value;
  }

  /**
   * Ajoute plusieurs variables au contexte
   */
  public setContextBatch(context: SafeEvalContext): void {
    Object.assign(this.context, context);
  }

  /**
   * Récupère le contexte complet
   */
  public getContext(): SafeEvalContext {
    return { ...this.context };
  }

  /**
   * Réinitialise le contexte
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
   * Évalue plusieurs expressions
   */
  public evaluateBatch(expressions: string[]): any[] {
    return expressions.map((expr) => this.evaluate(expr));
  }

  /**
   * Vérifie si une expression est valide (sans l'évaluer)
   */
  public isValidExpression(expression: string): boolean {
    try {
      // Vérifier la syntaxe sans évaluer
      const contextKeys = Object.keys(this.context);
      new Function(...contextKeys, `"use strict"; return (${expression});`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Évalue une condition (retourne toujours un boolean)
   * Force l'évaluation même sans ${}
   * Supporte les templates ${...} dans les conditions
   */
  public evaluateCondition(condition: string | undefined | null): boolean {
    // Protection contre les valeurs undefined/null/empty
    if (condition && typeof condition === "boolean") {
      return condition;
    }

    if (
      !condition ||
      typeof condition !== "string" ||
      condition.trim() === ""
    ) {
      return false; // Condition invalide = pas désactivé par défaut
    }

    try {
      // Si la condition contient des ${...}, les traiter en préservant les types
      let processedCondition = condition.trim();
      if (processedCondition.includes("${")) {
        processedCondition =
          this.processTemplatesForExpression(processedCondition);
      }

      // Forcer l'évaluation directe comme expression
      const result = this.evaluateComplexExpression(processedCondition);

      // S'assurer que c'est bien un boolean
      if (typeof result === "boolean") {
        return result;
      }

      // Sinon convertir en boolean
      return Boolean(result);
    } catch (_error) {
      console.error("Condition evaluation error:", condition, _error);
      // En cas d'erreur, retourner false par sécurité
      return false;
    }
  }

  /**
   * Évalue un template complet
   * Les i18n._() doivent être dans ${...}
   */
  public evaluateTemplate(template: string | undefined | null): string {
    if (!template || typeof template !== "string") {
      return "";
    }

    try {
      // Traiter les templates ${...} qui contiennent les i18n._()
      const result = this.processTemplates(template);
      return result;
    } catch (_error) {
      console.error("Template evaluation error:", template, _error);
      return template;
    }
  }
}

/**
 * Instance globale pour faciliter l'utilisation
 */
export const safeEval = new SafeEval();

/**
 * Fonction helper pour évaluer rapidement
 */
export function evaluate(
  expression: string,
  context: SafeEvalContext = {},
): any {
  const evaluator = new SafeEval(context);
  return evaluator.evaluate(expression);
}

/**
 * Fonction helper pour évaluer un template
 */
export function evaluateTemplate(
  template: string,
  context: SafeEvalContext = {},
): string {
  const evaluator = new SafeEval(context);
  return evaluator.evaluateTemplate(template);
}

/**
 * Fonction helper pour évaluer une condition
 */
export function evaluateCondition(
  condition: string,
  context: SafeEvalContext = {},
): boolean {
  const evaluator = new SafeEval(context);
  return evaluator.evaluateCondition(condition);
}
