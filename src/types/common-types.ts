/**
 * Common type definitions to replace 'any' types
 */

import type { HassEntity, HassConfig } from "./homeassistant";

/**
 * Generic Home Assistant state object
 */
export interface StateObject extends HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

/**
 * Device configuration
 */
export interface DeviceConfig {
  color: string;
  alpha: number;
  [key: string]: any; // Allow additional properties
}

/**
 * Element context for evaluation
 */
export interface EvalContext {
  entity: Record<string, StateObject>;
  state: Record<string, StateObject>;
  hass: HassConfig;
  device: any; // Could be more specific
  [key: string]: any;
}

/**
 * Shadow root type
 */
export type ShadowRootElement = ShadowRoot & {
  querySelector: <K extends keyof HTMLElementTagNameMap>(
    selectors: K,
  ) => HTMLElementTagNameMap[K] | null;
  querySelectorAll: <K extends keyof HTMLElementTagNameMap>(
    selectors: K,
  ) => NodeListOf<HTMLElementTagNameMap[K]>;
};

/**
 * Dialog element type
 */
export interface DialogElement extends HTMLElement {
  hass?: HassConfig;
  config?: any;
  device?: any;
  get_entity?: (name: string) => any;
}

/**
 * Service call data
 */
export interface ServiceCallData {
  entity_id?: string;
  [key: string]: any;
}

/**
 * Generic callback function type
 */
export type CallbackFunction = (...args: any[]) => void | Promise<void>;

/**
 * Event handler type
 */
export type EventHandler<T = Event> = (event: T) => void | Promise<void>;
