import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./dcskimmer.mapping";

// The DC Skimmer and the DC Runner return pump share the same Gizwits
// product key and are both reported to Home Assistant with model "DC
// Runner" (see ha-aquamedic-component entity.py resolve_model()). The card
// tells them apart by reading the device's pump_role select entity (see
// KNOWN_DEVICE_DOMAINS.aquamedic.model_overrides in utils/constants.ts) --
// the same idea as RSRun picking between its RSPump/RSReturn/RSSkimmer
// sub-elements from a "type" sensor, one level up since here each pump is
// its own top-level device rather than a sub-element of a shared one.
// TODO : Implement AQUAMEDIC DC Skimmer support
// labels: enhancement, aquamedic
export class AMDCSkimmer extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    model: "DC Skimmer",
    name: "",
    elements: null,
  };

  override renderEditor(): TemplateResult {
    return html``;
  }
}
