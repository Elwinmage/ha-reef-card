/**
 * Device and entity configuration types
 */

import type { HassEntity } from "./homeassistant";

// ── Card-level device selection ───────────────────────────────────────────────

export interface MainDevice {
  value: string;
  text: string;
}

export interface DeviceInfo {
  name: string;
  elements: import("./homeassistant").HassDevice[];
}

export interface SelectDevice {
  value: string;
  text: string;
}

export interface UserConfig {
  device?: string;
  [key: string]: any;
}

// ── RSDevice abstraction ──────────────────────────────────────────────────────

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

export interface HeadEntity {
  entities: Record<string, any>;
  dose_head?: any;
}

// ── RGB color ─────────────────────────────────────────────────────────────────

export interface RGB {
  r: number;
  g: number;
  b: number;
}
