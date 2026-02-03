import { html, LitElement } from "lit";

import style_dialog from "./dialog.styles";
import style_click_image from "./click_image.styles";

import { MyElement } from "./element";

import * as dhd from "../dose_head.dialog";

export class Dialog extends LitElement {

  static override styles = [style_dialog, style_click_image];

  static override get properties() {
    return {
      _shadowRoot: {},
      to_render: {},
      elt: {},
    };
  }

  protected _hass: any = null;
  protected _shadowRoot: ShadowRoot | null = null;
  protected config: any = null;
  protected elt: any = null;
  protected elts: any[] = [];
  protected extends_to_re_render: any[] = [];
  protected to_render: any = null;
  protected overload_quit: any = null;

  constructor() {
    super();
    this._hass = null;
    this._shadowRoot = null;
    this.config = null;
    this.elt = null;
    this.elts = [];
    this.extends_to_re_render = [];
    this.to_render = null;
    this.overload_quit = null;
  }

  init(hass: any, shadowRoot: ShadowRoot): void {
    this._hass = hass;
    this._shadowRoot = shadowRoot;
  }

  display(conf: any): void {
    if (!this._shadowRoot) return;
    const box = this._shadowRoot.querySelector("#window-mask") as HTMLElement | null;
    if (!box) return;
    this.elt = conf.elt;
    this.to_render = this.config?.[conf.type];
    this.overload_quit = conf.overload_quit;
    this.render();
    box.style.display = "flex";
  }

  quit(): void {
    if (this.overload_quit) {
      const event = { type: this.overload_quit, elt: this.elt };
      this.display(event);
    }
    else {
      if (this._shadowRoot) {
        const box = this._shadowRoot.querySelector("#window-mask") as HTMLElement | null;
        if (box) box.style.display = "none";
      }
      this.elt = null;
      this.to_render = null;
    }
  }

  set hass(obj: any) {
    this._hass = obj;
    if (this.elts) {
      for (const elt of this.elts) {
        elt.hass = obj;
      }
    }
    if (this.extends_to_re_render) {
      for (const _elt of this.extends_to_re_render) {
        // Note: eval usage removed for security - extend this as needed
        console.warn("extends_to_re_render not fully implemented");
      }
    }
  }

  set_conf(config: any): void {
    this.config = config;
  }

  create_form(content_conf: any): HTMLElement[] {
    const elements: HTMLElement[] = [];

    for (const input of content_conf) {
      if (!this._shadowRoot) continue;
      const doc = this._shadowRoot.ownerDocument;
      if (!doc) continue;
      const elt = doc.createElement(input.type);
      elt.id = input.id;
      elements.push(elt);
    }

    return elements;
  }

  render_dialog(elements: any[]): void {
    if (!this.to_render) return;

    for (const element of this.to_render.elements || []) {
      const tag_name = element.type;

      const r_element = elements.find((el: any) => el.name === element.name);
      if (!r_element) continue;

      const Element = customElements.get(tag_name);

      if (Element) {
        const elt = new (Element as any)() as HTMLElement & { setConfig?: (c: any) => void; hass?: any; device?: any };
        elt.setConfig?.(element);
        elt.hass = this._hass;
        elt.device = this.elt?.device;
        this.elts.push(elt);
        if (this._shadowRoot) {
          this._shadowRoot.appendChild(elt);
        }
      }
    }
  }

  override render() {
    if (this.to_render == null) {
      return html``;
    }

    return html`<redsea-ui-dialog
      .elt="${this.elt}"
      .to_render="${this.to_render}"
      .config="${this.config}"
      .hass="${this._hass}"
    ></redsea-ui-dialog>`;
  }
}
