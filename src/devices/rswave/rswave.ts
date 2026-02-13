import { html, TemplateResult } from "lit";
import { RSDevice } from "../device";
import { config } from "./rswave.mapping";

import { dialogs_device } from "../device.dialogs";

// TODO : Implement RSWAVE support
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/6
// labels: enhancement, rswave
export class RSWave extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_device]);
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
