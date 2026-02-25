/**
 * Minimal lit/decorators mock for unit tests.
 * Returns identity decorators so @property, @state, @customElement, etc.
 * compile and run without a full LitElement environment.
 */

export const property = (_options?: any) => (_target: any, _key?: any) => {};
export const state = (_options?: any) => (_target: any, _key?: any) => {};
export const customElement = (_name: string) => (_target: any) => {};
export const query = (_selector: string) => (_target: any, _key?: any) => {};
export const queryAll = (_selector: string) => (_target: any, _key?: any) => {};
export const eventOptions =
  (_options?: any) => (_target: any, _key?: any) => {};
