import type { ElementConfig } from './common';

export interface SensorConfig extends ElementConfig {
  /**
   * Préfixe à afficher avant la valeur
   */
  prefix?: string;

  /**
   * Forcer la valeur à être un entier
   */
  force_integer?: boolean;

  /**
   * Unité personnalisée (peut être une expression)
   */
  unit?: string | SensorExpression;

  /**
   * Label personnalisé (peut être une expression)
   */
  label?: string | SensorExpression;
}

export interface SensorExpression {
  /**
   * Expression à évaluer
   */
  expression: string;

  /**
   * Variables supplémentaires à injecter dans le contexte
   */
  variables?: Record<string, any>;
}
