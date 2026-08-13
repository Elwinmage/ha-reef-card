/**
 * UI element configuration types (MyElement, Sensor, Button, Dialog, etc.)
 */

import type { HassEntity } from "./homeassistant";

// ── Core types (from homeassistant, re-exported for convenience) ──────────────

export interface StateObject {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed?: string;
  last_updated?: string;
  context?: {
    id: string;
    parent_id?: string | null;
    user_id?: string | null;
  };
}

export interface HassConfig {
  states: Record<string, StateObject>;
  devices: Record<string, any>;
  callService: (domain: string, action: string, data: any) => void;
  entities?: any[];
  [key: string]: any;
}

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

export interface Device {
  entities: Record<string, DeviceEntity>;
  config: DeviceConfig;
  is_on: () => boolean;
  get_entity?: (name: string) => HassEntity;
  elements?: any[];
  [key: string]: any;
}

// ── Conditions ────────────────────────────────────────────────────────────────

export type DisabledCondition =
  | string
  | {
      entity?: string;
      state?: string | string[];
      attribute?: string;
      value?: any;
      operator?:
        | "equals"
        | "not_equals"
        | "greater_than"
        | "less_than"
        | "contains";
    }
  | DisabledCondition[];

// ── Actions ───────────────────────────────────────────────────────────────────

export interface ActionData {
  entity_id?: string;
  type?: string;
  overload_quit?: boolean;
  [key: string]: any;
}

export interface Action {
  domain: string;
  action: string;
  data?: ActionData | "default";
  enabled?: boolean;
}

// ── Dynamic values ────────────────────────────────────────────────────────────

export type LabelExpression = {
  expression: string;
  variables?: Record<string, any>;
};

export type DynamicValue<T = any> =
  | T
  | {
      expression: string;
      variables?: Record<string, any>;
    };

// ── Base element config ───────────────────────────────────────────────────────

export interface BaseElementConfig {
  type?: string;
  name?: string; // Optional - not all elements have a name
  class?: string;
  label?: DynamicValue<string> | boolean;
  // Widened to allow progress-circle's numeric target usage.
  target?: string | number;
  stateObj?: boolean;
  disabled_if?: DisabledCondition;
  timer?: number;
  image?: string | URL;
  css?: Record<string, string>;
  "elt.css"?: Record<string, string>;
  tap_action?: Action | Action[];
  hold_action?: Action | Action[];
  double_tap_action?: Action | Action[];
  [key: string]: any;
}

/** Alias for backward compat */
export type ElementConfig = BaseElementConfig;

// ── Specialized element configs ───────────────────────────────────────────────

export interface SensorConfig extends BaseElementConfig {
  name: string; // Sensors require a name
  prefix?: string;
  force_integer?: boolean;
  unit?: DynamicValue<string>;
  label?: DynamicValue<string>;
}

export interface ProgressConfig extends BaseElementConfig {
  name: string; // Progress elements require a name
  /**
   * Target reference:
   * - string: translation_key of a sibling entity whose state provides the target
   * - number: a fixed numeric target (progress-circle only)
   */
  target?: string | number;
  label?: DynamicValue<string>;
  no_value?: boolean;
  /** Force integer rendering (also used by SensorTarget) */
  force_integer?: boolean;
  /**
   * When set, read the current value from stateObj.attributes[value_attribute]
   * instead of stateObj.state. Useful for entities whose numeric progress
   * is exposed as an attribute (e.g. button.*.days_left).
   */
  value_attribute?: string;
  /**
   * When set, read the target value from stateObj.attributes[target_attribute]
   * (same entity, no external target needed). Takes precedence over `target`.
   */
  target_attribute?: string;
  /** Invert the computed percentage (100 - p). */
  inverted?: boolean;
  /** Treat `target` as the remaining amount; effective target = target + value. */
  target_is_remaining?: boolean;
  /** Optional color overrides. */
  colors?: {
    /** Bar/track background color (progress-bar container, progress-circle track stroke). */
    background?: string;
    /** Progression color; overrides the device color when set. */
    fill?: string;
    /** progress-circle only: center disc fill color. */
    center?: string;
  };
}

export interface ButtonConfig extends BaseElementConfig {
  name: string; // Buttons require a name
  icon?: string;
  text?: DynamicValue<string>;
}

// ── Dialog ────────────────────────────────────────────────────────────────────

export interface DialogContentConfig {
  view: "element" | "text" | "html";
  value?: DynamicValue<string>;
  conf?: BaseElementConfig;
  [key: string]: any;
}

export interface DialogConfig {
  title?: DynamicValue<string>;
  content?: DialogContentConfig[];
  extends_to_re_render?: string[];
  [key: string]: any;
}

export type DialogExtensionFunction = (
  elt: any,
  hass: any,
  shadowRoot: ShadowRoot | Document,
) => void | HTMLElement;

export interface DialogExtension {
  [dialogName: string]: DialogExtensionFunction;
}

// ── HTML Element extension ────────────────────────────────────────────────────

export interface RSHTMLElement extends HTMLElement {
  conf: BaseElementConfig;
  hass: any;
}

// ── Evaluation context ────────────────────────────────────────────────────────

export interface EvaluationContext {
  [key: string]: any;
}

export interface SafeEvalContext {
  [key: string]: any;
}
