// Types pour les fonctions utilitaires
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
  name: string;
  model?: string;
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
