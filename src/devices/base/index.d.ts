/**
 * Centralized type definitions for ha-reef-card
 */

// ============================================================================
// Home Assistant Types
// ============================================================================

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed?: string;
  last_updated?: string;
}

export interface HassDevice {
  identifiers: Array<string | [string, string]>;
  primary_config_entry: string;
  name: string;
  model?: string;
  manufacturer?: string;
  sw_version?: string;
  [key: string]: any;
}

export interface HassConfig {
  states: Record<string, HassEntity>;
  devices: Record<string, HassDevice>;
  callService: (domain: string, action: string, data: any) => void;
  [key: string]: any;
}

// ============================================================================
// Device Types
// ============================================================================

export interface DeviceEntity {
  entity_id: string;
  [key: string]: any;
}

export interface DeviceConfig {
  id?: string;
  color: string;
  alpha: number;
  background_img?: string | URL;
  [key: string]: any;
}

export interface DeviceInfo {
  name: string;
  elements: HassDevice[];
}

export interface MainDevice {
  value: string;
  text: string;
}

export interface Device {
  entities: Record<string, DeviceEntity>;
  config: DeviceConfig;
  is_on: () => boolean;
  get_entity?: (name: string) => HassEntity;
}

// ============================================================================
// Element Configuration Types
// ============================================================================

export type DynamicValue<T = any> = T | {
  expression: string;
  variables?: Record<string, any>;
};

export interface BaseElementConfig {
  type: string;
  name: string;
  class?: string;
  stateObj?: boolean;
  disabled_if?: DisabledCondition;
  css?: Record<string, string>;
  'elt.css'?: Record<string, string>;
  tap_action?: Action | Action[];
  hold_action?: Action | Action[];
  double_tap_action?: Action | Action[];
}

export interface SensorConfig extends BaseElementConfig {
  prefix?: string;
  force_integer?: boolean;
  unit?: DynamicValue<string>;
  label?: DynamicValue<string>;
}

export interface ProgressConfig extends BaseElementConfig {
  target?: string;
  label?: DynamicValue<string>;
  no_value?: boolean;
}

export interface ButtonConfig extends BaseElementConfig {
  icon?: string;
  text?: DynamicValue<string>;
}

export interface DialogContentConfig {
  view: 'element' | 'text' | 'html';
  value?: DynamicValue<string>;
  conf?: BaseElementConfig;
  [key: string]: any;
}

export interface DialogConfig {
  title?: DynamicValue<string>;
  content: DialogContentConfig[];
  extends_to_re_render?: string[];
  [key: string]: any;
}

// ============================================================================
// Condition Types
// ============================================================================

export type DisabledCondition = {
  entity?: string;
  state?: string | string[];
  attribute?: string;
  value?: any;
  operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
} | DisabledCondition[];

// ============================================================================
// Action Types
// ============================================================================

export interface ActionData {
  entity_id?: string;
  type?: string;
  overload_quit?: boolean;
  [key: string]: any;
}

export interface Action {
  domain: string;
  action: string;
  data: ActionData | "default";
  enabled?: boolean;
}

// ============================================================================
// Translation Types
// ============================================================================

export type NestedTranslation = {
  [key: string]: string | NestedTranslation;
};

export type LanguageDictionary = NestedTranslation;

export type SupportedLanguage = 'en' | 'fr' | 'de' | 'es' | 'it' | 'nl' | 'pt';

export interface I18nConfig {
  fallbackLanguage?: SupportedLanguage;
  defaultLanguage?: SupportedLanguage;
  supportedLanguages?: SupportedLanguage[];
}

// ============================================================================
// Utility Types
// ============================================================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface EvaluationContext {
  state?: string | number;
  attributes?: Record<string, any>;
  entity?: HassEntity;
  device?: Device;
  config?: any;
  i18n?: any;
  label?: string;
  [key: string]: any;
}

// ============================================================================
// Schedule Types (for dose_head)
// ============================================================================

export interface Schedule {
  type: 'fixed' | 'variable' | string;
  days: number[];
  enabled?: boolean;
  [key: string]: any;
}

export interface ScheduleFixed extends Schedule {
  type: 'fixed';
  time: string;
  dose: number;
}

export interface ScheduleVariable extends Schedule {
  type: 'variable';
  times: string[];
  doses: number[];
}

// ============================================================================
// Global Window Extensions
// ============================================================================

declare global {
  interface Window {
    customCards?: Array<CustomCardDefinition>;
  }
}

export interface CustomCardDefinition {
  type: string;
  name: string;
  description?: string;
  preview?: boolean;
  documentationURL?: string;
}
