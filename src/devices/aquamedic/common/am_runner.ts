/**
 * Base of the two DC Runner series views: the return pump and the skimmer.
 *
 * Both run the same firmware and expose the same entities; the card tells
 * them apart from the `pump_role` select (see KNOWN_DEVICE_DOMAINS), and
 * only their picture differs.
 */
import { AMDevice } from "./am_device";
import { dialogs_am_runner } from "./am.dialogs";

export class AMRunnerSeries extends AMDevice {
  constructor() {
    super();
    this.load_dialogs([dialogs_am_runner]);
  }

  // check-entities: uses flow

  /**
   * The legacy DC Runner firmware names its speed `flow` where the current
   * one names it `motor_speed`. Aliasing it lets one mapping serve both.
   */
  override _populate_entities(): void {
    super._populate_entities();
    if (!this.entities["motor_speed"] && this.entities["flow"]) {
      this.entities["motor_speed"] = this.entities["flow"];
      this.entities["number.motor_speed"] = this.entities["number.flow"];
    }
  }
}
