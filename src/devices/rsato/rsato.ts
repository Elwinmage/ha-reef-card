import { html,TemplateResult } from "lit";
import { RSDevice } from "../device";
import { config } from "./rsato.mapping";

import {dialogs_device} from "../device.dialogs"

import i18n from "../../translations/myi18n";

export class RSAto extends RSDevice {
  
  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    'model': 'RSATO',
    'name': '',
    'elements': null
  };

  override renderEditor(): TemplateResult {
    return html``;
  }
}
