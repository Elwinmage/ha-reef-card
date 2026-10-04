import { AMDevice } from "../common/am_device";
import { dialogs_am_drift } from "../common/am.dialogs";
import { dialogs_maintenance } from "../../device.dialogs";
import { am_box_styles } from "../common/am_device";
import { PICTURE, config } from "./smartdrift.mapping";

/**
 * Aqua Medic SmartDrift / EcoDrift flow pump.
 */
export class AMSmartDrift extends AMDevice {
  static override styles = am_box_styles(PICTURE.box);

  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_maintenance, dialogs_am_drift]);
  }

  device = {
    model: "SmartDrift",
    name: "",
    elements: null,
  };

  /** A flow pump is driven by its flow. */
  override speed_entity(): string {
    return "number.flow";
  }

  /**
   * Frequency of the waves, in %, or null while the pump pushes a steady
   * flow (constant flow mode) and so makes none.
   */
  wave_frequency(): number | null {
    if (this.get_entity("select.mode")?.state === "constant_flow") return null;
    return Number(this.get_entity("number.frequency")?.state) || 0;
  }
}
