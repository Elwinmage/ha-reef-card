/**
 * Minimal lit mock for unit tests.
 * Prevents LitElement from requiring a real browser rendering engine.
 */

export const html = (strings: TemplateStringsArray, ...values: any[]) => ({
  strings,
  values,
});

export const css = (strings: TemplateStringsArray, ...values: any[]) => ({
  strings,
  values,
});

export class LitElement {
  static styles: any;
  shadowRoot: ShadowRoot | null = null;

  requestUpdate() {}
  dispatchEvent(_event: Event): boolean {
    return true;
  }
  addEventListener() {}
  removeEventListener() {}
  connectedCallback() {}
  disconnectedCallback() {}
  updated() {}
  render(): any {
    return html``;
  }
}

export class TemplateResult {}
export type CSSResultGroup = any;
