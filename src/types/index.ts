/**
 * Central type export for ha-reef-card
 *
 * All types should be imported from here:
 *   import type { HassConfig, DeviceInfo, ... } from "../types/index";
 */

// ── Home Assistant ─────────────────────────────────────────────────────────────
export type {
  HassEntity,
  StateObject,
  HassDevice,
  HassConfig,
  CustomCardDefinition,
} from "./homeassistant";

// ── Device ─────────────────────────────────────────────────────────────────────
export type {
  MainDevice,
  DeviceInfo,
  SelectDevice,
  UserConfig,
  DeviceEntity,
  DeviceConfig,
  Device,
  HeadEntity,
  RGB,
} from "./device";

// ── Element / UI ───────────────────────────────────────────────────────────────
export type {
  DisabledCondition,
  ActionData,
  Action,
  LabelExpression,
  DynamicValue,
  BaseElementConfig,
  ElementConfig,
  SensorConfig,
  ProgressConfig,
  ButtonConfig,
  DialogContentConfig,
  DialogConfig,
  DialogExtensionFunction,
  DialogExtension,
  RSHTMLElement,
  EvaluationContext,
  SafeEvalContext,
} from "./element";

// ── Schedule (ReefDose) ────────────────────────────────────────────────────────
export type { Schedule, ScheduleFixed, ScheduleVariable } from "./schedule";

// ── Supplement ────────────────────────────────────────────────────────────────
export type { Supplement } from "./supplement";

// ── Internationalization ───────────────────────────────────────────────────────
export type {
  NestedTranslation,
  LanguageDictionary,
  SupportedLanguage,
  I18nConfig,
  HomeAssistant,
} from "./i18n";

// ── Backward compatibility aliases ────────────────────────────────────────────
/** @deprecated Use HassEntity instead */
export type { HassEntity as HassEntityAlias } from "./homeassistant";
/** @deprecated Use BaseElementConfig instead */
export type { BaseElementConfig as ProgressConfig_compat } from "./element";
/** @deprecated Use DeviceInfo instead */
export type { DeviceInfo as DeviceInfoAlias } from "./device";

// Export constants
export { OFF_COLOR } from "../utils/constants";
