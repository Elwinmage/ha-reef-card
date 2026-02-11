import { html, TemplateResult } from "lit";
import { RSDevice } from "../device";
import { config } from "./rsato.mapping";

export class RSAto extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    model: "RSATO",
    name: "",
    elements: null,
  };

  override renderEditor(): TemplateResult {
    return html``;
  }
}
