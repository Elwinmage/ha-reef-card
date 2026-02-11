import { html, TemplateResult } from "lit";
import { RSDevice } from "../device";
import { config } from "./rswave.mapping";

export class RSWave extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    model: "RSWAVE",
    name: "",
    elements: null,
  };

  override renderEditor(): TemplateResult {
    return html``;
  }
}

export class RSWave25 extends RSWave {}

export class RSWave45 extends RSWave {}
