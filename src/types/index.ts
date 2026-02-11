export type { Supplement } from "./supplement";

export type { RGB, MainDevice, DeviceInfo, HassDevice } from "./common";

export type { SensorConfig, SensorExpression } from "./sensor";

// Types depuis element.d.ts (utilisés par MyElement et composants UI)
export type {
  StateObject,
  HassConfig,
  DeviceEntity,
  DeviceConfig,
  Device,
  ActionData,
  Action,
  ElementConfig,
  RSHTMLElement,
} from "./element";

// Alias pour compatibilité
export type { DeviceInfo as DeviceInfoAlias } from "./common";
export type { HassDevice as HassEntity } from "./common";
export type { ElementConfig as ProgressConfig } from "./element";
