import { html, TemplateResult } from "lit";
import { RSDevice } from "../device";
import { config } from "./rsrun.mapping";

import { dialogs_device } from "../device.dialogs";

export class RSRun extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_device]);
  }

  device = {
    model: "RSRUN",
    name: "",
    elements: null,
  };

  override renderEditor(): TemplateResult {
    return html``;
  }
}
