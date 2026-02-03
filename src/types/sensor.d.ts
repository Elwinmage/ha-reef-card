import type { ElementConfig } from './common';

export interface SensorConfig extends ElementConfig {
  prefix?: string;
  force_integer?: boolean;
  unit?: string | SensorExpression;
  label?: string | SensorExpression;
}

export interface SensorExpression {
  expression: string;
  variables?: Record<string, any>;
}
