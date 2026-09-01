import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./rspower6.mapping";
import { config2 } from "./rspower8.mapping";

// TODO : Implement RSPOWER support
// labels: enhancement, rspower
export class RSPower extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
  }

  override renderEditor(): TemplateResult {
    return html``;
  }
}

export class RSPower6 extends RSPower {}

class RSPowerEN extends RSPower {
  constructor() {
    super();
    this.initial_config = config2;
  } // end of constructor
}

export class RSPower8 extends RSPowerEN {}
