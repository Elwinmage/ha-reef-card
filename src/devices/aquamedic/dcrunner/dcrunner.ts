import { AMRunnerSeries } from "../common/am_runner";
import { am_box_styles } from "../common/am_device";
import { PICTURE, config } from "./dcrunner.mapping";

/**
 * Aqua Medic DC Runner return pump.
 *
 * "DC Runner" is also the model Home Assistant reports for the skimmer of
 * the same series: this class is the one instantiated for both, and
 * RSDevice.render() hands over to AMDCSkimmer once the `pump_role` select
 * says so (see KNOWN_DEVICE_DOMAINS.aquamedic.model_overrides).
 */
export class AMDCRunner extends AMRunnerSeries {
  static override styles = am_box_styles(PICTURE.box);

  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    model: "DC Runner",
    name: "",
    elements: null,
  };
}
