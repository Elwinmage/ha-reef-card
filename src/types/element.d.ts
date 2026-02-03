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
  data: ActionData | "default";
  enabled?: boolean;
}

export type LabelExpression = {
  type: 'template';
  template: string;
  variables?: Record<string, any>;
} | string;

export type DisabledCondition = {
  entity?: string;
  state?: string | string[];
  attribute?: string;
  value?: any;
  operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
} | DisabledCondition[];

export interface ElementConfig {
  name: string;
  type: string;
  class?: string;
  label?: LabelExpression | boolean;
  target?: string;
  stateObj?: boolean;
  disabled_if?: DisabledCondition;
  css?: { [key: string]: string };
  "elt.css"?: { [key: string]: string };
  tap_action?: Action | Action[];
  hold_action?: Action | Action[];
  double_tap_action?: Action | Action[];
  [key: string]: any;
}
