import { html, TemplateResult } from "lit";
import { RSDevice } from "../device";
import { config } from "./rsrun.mapping";

import { dialogs_device } from "../device.dialogs";

// TODO : Implement RSRUN support
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/7
// labels: enhancement, rsrun	break;
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
