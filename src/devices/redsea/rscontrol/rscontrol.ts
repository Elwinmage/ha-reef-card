import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./rscontrollite.mapping";
import { config2 } from "./rscontrolpro.mapping";

// TODO : Implement RSCONTROL support
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/96
// labels: enhancement, rscontrol
export class RSControl extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
  }

  override renderEditor(): TemplateResult {
    return html``;
  }
}

export class RSControlLite extends RSControl {}

class RSControlProEx extends RSControl {
  constructor() {
    super();
    this.initial_config = config2;
  } // end of constructor
}

export class RSControlPro extends RSControlProEx {}
