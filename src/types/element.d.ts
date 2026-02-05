/**
 * Types pour MyElement et les composants UI
 */

export interface StateObject {
  entity_id: string;
  state: string;
  attributes?: Record<string, any>;
  [key: string]: any;
}

export interface HassConfig {
  states: { [entity_id: string]: StateObject };
  callService: (domain: string, action: string, data: any) => void;
  entities?: any[];
  devices?: Record<string, any>;
  [key: string]: any;
}

export interface DeviceEntity {
  entity_id: string;
  [key: string]: any;
}

export interface DeviceConfig {
  color: string;
  alpha: number;
  [key: string]: any;
}

export interface RSHTMLElement extends HTMLElement{
  conf: ElementConfig;
  hass: any;
}

export interface Device {
  entities: { [name: string]: DeviceEntity };
  config: DeviceConfig;
  is_on: () => boolean;
  elements?: any[];
  [key: string]: any;
}

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

export interface ElementConfig {
  name?: string;
  type: string;
  class?: string;
  label?: string | boolean;
  target?: string;
  stateObj?: boolean;
  disabled_if?: string;
  css?: { [key: string]: string };
  "elt.css"?: { [key: string]: string };
  tap_action?: Action | Action[];
  hold_action?: Action | Action[];
  double_tap_action?: Action | Action[];
  [key: string]: any;
}
