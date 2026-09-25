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
  /**
   * The identity this device is selected/looked up by (a MainDevice's
   * `value`, and the key of DeviceList.devices). Usually a config entry id
   * (several devices grouped under one physical appliance), but a plain
   * hass device id for an integration whose devices are not grouped — see
   * KNOWN_DEVICE_DOMAINS.group_by_config_entry.
   */
  key?: string;
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

export interface SocketEntity {
  entities: Record<string, any>;
  /** Cached PowerSocket LitElement rendering this socket */
  power_socket?: any;
}

export interface ProbeEntity {
  /** Probe uid, unique within its type */
  uid: string;
  /** Probe type: ph, orp, ec, temperature, ato, leak */
  type: string;
  /** Position in the hub's probe list, null when not reported */
  index: number | null;
  /** 1-based slot the probe is drawn in, set when it is placed */
  slot?: number;
  /** Probe entities keyed by translation key */
  entities: Record<string, any>;
  /** Cached ControlProbe LitElement rendering this probe */
  control_probe?: any;
}

export interface PumpEntity {
  entities: Record<string, any>;
  parent_entities?: Record<string, any>;
  /** Cached custom element rendering this pump, rebuilt when `type` changes */
  litElement?: any;
  /** Last known pump type from the `type` sensor ("return", "skimmer", …) */
  type?: string;
}

// ── RGB color ─────────────────────────────────────────────────────────────────

export interface RGB {
  r: number;
  g: number;
  b: number;
}
