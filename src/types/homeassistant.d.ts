/**
 * Home Assistant core types
 */

// ── Entities ──────────────────────────────────────────────────────────────────

export interface HassEntity {
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

/** Alias used in UI components */
export type StateObject = HassEntity;

// ── Devices ───────────────────────────────────────────────────────────────────

export interface HassDevice {
  id: string;
  identifiers: Array<string | [string, string]>;
  primary_config_entry: string;
  name: string;
  model?: string;
  /** Hardware id reported by the device; stable across renames. */
  model_id?: string;
  /** Name the user set in Home Assistant; overrides `name` when present. */
  name_by_user?: string | null;
  manufacturer?: string;
  sw_version?: string;
  disabled_by: string | null;
  [key: string]: any;
}

// ── Config (hass object) ──────────────────────────────────────────────────────

export interface HassConfig {
  states: Record<string, HassEntity>;
  devices: Record<string, HassDevice>;
  callService: (domain: string, action: string, data: any) => void;
  entities?: any[];
  [key: string]: any;
}

// ── Global Window ─────────────────────────────────────────────────────────────

export interface CustomCardDefinition {
  type: string;
  name: string;
  description?: string;
  preview?: boolean;
  documentationURL?: string;
}

declare global {
  interface Window {
    customCards?: Array<CustomCardDefinition>;
  }
}

export {};
