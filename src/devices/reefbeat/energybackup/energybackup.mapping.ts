/**
 * Energy backup view (reefbeatEnergyBackup).
 *
 * The view has no picture: Power Flow Card Plus fills it, and the card only
 * adds the maintenance shortcut in its top right corner.
 *
 * Options are stored at device level (conf > ENERGYBACKUP > devices > id):
 *
 *   type: custom:reef-card
 *   device: reef_battery
 *   conf:
 *     ENERGYBACKUP:
 *       devices:
 *         reef_battery:
 *           pumps:            # pumps shown in the flow (empty: the first
 *             - 1f2e3d...     # four found), as Home Assistant device ids
 */
import { ENERGY_BACKUP_MODEL } from "../../../utils/constants";
import { maintenance_shortcut } from "../../redsea/maintenance/maintenance.shortcut";

export const config = {
  name: null,
  model: ENERGY_BACKUP_MODEL,
  color: "76,175,80",
  alpha: 1,
  // Pumps shown in the flow: none picked, so the first four found
  pumps: [] as string[],
  elements: {
    // Battery discharge test, and whatever task the service adds later
    maintenance_tasks: maintenance_shortcut(
      {
        flex: "0 0 auto",
        position: "absolute",
        top: "12px",
        right: "12px",
        "z-index": "1",
      },
      "var(--secondary-text-color, #727272)",
    ),
  },
};
