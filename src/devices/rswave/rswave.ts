import { html, TemplateResult } from "lit";
import { RSDevice } from "../device";
import { config } from "./rswave.mapping";

import {dialogs_device} from "../device.dialogs"

import i18n from "../../translations/myi18n";

export class RSWave extends RSDevice {
  
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    'model': 'RSWAVE',
    'name': '',
    'elements': null
  };


  override renderEditor(): TemplateResult {
    return html``;
  }
}

export class RSWave25 extends RSWave{
}

export class RSWave45 extends RSWave{
}
