import { html, TemplateResult } from "lit";
import { RSDevice } from "../device";
import { config } from "./rsled.mapping";
import { config2 } from "./rsled_g2.mapping";

// TODO : Implement RSLED support
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/3
// labels: enhancement, rsled
export class RSLed extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    model: "RSLED",
    name: "",
    elements: null,
  };

  override renderEditor(): TemplateResult {
    return html``;
  }
}

export class RSLed160 extends RSLed {}

export class RSLed90 extends RSLed {}

export class RSLed50 extends RSLed {}

class RSLedG2 extends RSLed {
  constructor() {
    super();
    this.initial_config = config2;
  } // end of constructor
}

export class RSLed170 extends RSLedG2 {}

export class RSLed115 extends RSLedG2 {}

export class RSLed60 extends RSLedG2 {}
