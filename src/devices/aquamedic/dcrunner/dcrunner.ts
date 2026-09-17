import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./dcrunner.mapping";

// TODO : Implement AQUAMEDIC DC Runner support
// labels: enhancement, aquamedic
export class AMDCRunner extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    model: "DC Runner",
    name: "",
    elements: null,
  };

  override renderEditor(): TemplateResult {
    return html``;
  }
}
