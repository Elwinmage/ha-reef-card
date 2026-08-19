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
  /**
   * Legacy integer rendering. Prefer `round`.
   * Kept because it is used in 16 mappings, and because its behaviour differs
   * between elements: common-sensor rounds, common-sensor-target floors.
   */
  force_integer?: boolean;
  /**
   * Decimals to display: round(2) -> "12.34", round(0) -> "12".
   * Consistent across every element, unlike force_integer. Non-numeric states
   * are left untouched. Applied after force_integer when both are set.
   */
  round?: number;
  /**
   * Colour of the rendered text, unit included.
   * Use this rather than `css: { color }` when a `unit_css` is also set, since
   * the unit span would otherwise be able to diverge. Accepts the
   * `$DEVICE-COLOR$` / `$DEVICE-COLOR-ALPHA$` tokens.
   */
  text_color?: DynamicValue<string>;
  unit?: DynamicValue<string>;
  label?: DynamicValue<string>;
}

export interface ProgressConfig extends BaseElementConfig {
  name: string; // Progress elements require a name
  /**
   * Target reference:
   * - string: translation_key of a sibling entity whose state provides the target
   * - number: a fixed numeric target, resolved without any entity lookup.
   *   Honoured by progress-bar, progress-circle and common-sensor-target.
   *   `target_attribute` still takes precedence when both are set.
   */
  target?: string | number;
  /**
   * Multiplier applied to the resolved target, for when value and target are
   * reported in different units. volume_left is in mL and ato_tank_volume in
   * L, so target_factor: 1000 makes the ratio meaningful without adding a
   * template sensor in Home Assistant.
   */
  target_factor?: number;
  label?: DynamicValue<string>;
  no_value?: boolean;
  /** Force integer rendering (also used by SensorTarget). Prefer `round`. */
  force_integer?: boolean;
  /** Decimals to display; round(0) is an integer. See SensorConfig.round. */
  round?: number;
  /** Colour of the rendered text, unit included. See SensorConfig.text_color. */
  text_color?: DynamicValue<string>;
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
    /** water-level only: tint used below warn_below and for a missing reading. */
    warn?: string;
  };
}

/**
 * Configuration of a `water-level` element: a translucent body of water drawn
 * over the device picture, high enough to read at a glance but transparent
 * enough that pumps and probes stay visible through it.
 */
export interface WaterLevelConfig extends ProgressConfig {
  /**
   * Discrete mode: maps an entity state to a water height (0-100).
   *
   * The ATO optical probe reports a mark on the glass ("desire_level_1",
   * "below", ...), not a volume ratio, so the height cannot be derived from
   * value/target. Any state absent from this map — "error", unknown,
   * unavailable — renders the no-reading mark instead of an empty tank.
   */
  levels?: Record<string, number>;

  /**
   * Water surface height when the level reads 0 %, as a percentage of the
   * element box. Also the geometric offset of the glass in the background
   * picture: the RO reservoir keeps a residue the pump cannot siphon, so its
   * empty state is a low water line rather than a dry tank.
   */
  min_percent?: number;

  /** Water surface height when the level reads 100 %. Defaults to 100. */
  max_percent?: number;

  /** Animated surface. On by default; disabled under prefers-reduced-motion. */
  wave?: boolean;

  /** Ratio mode: below this level (0-100), the element raises an alert. */
  warn_below?: number;

  /**
   * Discrete mode: states that raise an alert. There is no ordering to compare
   * against here — "above" is as abnormal as "below" — so they are listed.
   */
  warn_states?: string[];

  /**
   * Alerting pulses the water between colors.fill and colors.warn. Set false
   * for a static warning tint. Always static under prefers-reduced-motion.
   */
  warn_blink?: boolean;

  /**
   * Water opacity, flat over the whole submerged area. Defaults to 0.45.
   * The fill is composited with mix-blend-mode: multiply, so it darkens the
   * picture behind instead of averaging toward the water colour — pumps and
   * probes stay readable through it.
   */
  opacity?: number;

  /**
   * Show the reading at the bottom-right of the submerged area: a percentage
   * in ratio mode, the translated state in discrete mode. On by default.
   */
  show_value?: boolean;

  /**
   * Entity displayed in the overlay, when it differs from the entity driving
   * the water height. Its state goes through Home Assistant's own state
   * translations, which a `label` expression cannot do.
   *
   * Use a domain-prefixed key whenever several domains expose the same
   * translation_key — binary_sensor.water_level and sensor.water_level both
   * register as "water_level", and the bare key resolves to whichever the
   * entity registry yielded last.
   */
  value_entity?: string;
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
