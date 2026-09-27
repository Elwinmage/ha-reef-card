import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./smartdrift.mapping";

// TODO : Implement AQUAMEDIC SmartDrift support
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/106
// labels: enhancement, aquamedic
export class AMSmartDrift extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    model: "SmartDrift",
    name: "",
    elements: null,
  };

  override renderEditor(): TemplateResult {
    return html``;
  }
}
