export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface MainDevice {
  value: string;
  text: string;
}

export interface DeviceInfo {
  name: string;
  elements: HassDevice[];
}

export interface HassDevice {
  identifiers: Array<string | [string, string]>;
  primary_config_entry: string;
  entity_id: string;
  state: any;
  name: string;
  model?: string;
  [key: string]: any;
}

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

export interface ElementConfig {
  type: string;
  name: string;
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

export interface HassConfig {
  devices: {
    [device_id: string]: HassDevice;
  };
  [key: string]: any;
  states: { [entity_id: string]: StateObject };
  callService: (domain: string, action: string, data: any) => void;
  
}
