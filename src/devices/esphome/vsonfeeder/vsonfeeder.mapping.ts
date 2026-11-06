/**
 * VSON fish feeder (hacked, ESPHome firmware).
 *
 * The view draws the feeder itself: four pictures (trap open or closed,
 * reserve full or empty) picked from the trap and food level sensors, then
 * the feeding slots beside it. Only the maintenance shortcut goes through
 * the element machinery of the card.
 *
 * The device is recognised by the ESPHome project name its firmware
 * declares (see VSON_FEEDER_PROJECT):
 *
 *   esphome:
 *     project:
 *       name: "vson.fish_feeder"
 *       version: "1.0.0"
 */
import { VSON_FEEDER_MODEL } from "../../../utils/constants";
import { maintenance_shortcut } from "../../redsea/maintenance/maintenance.shortcut";

export const config = {
  name: null,
  model: VSON_FEEDER_MODEL,
  // Picture used by the device thumbnails (aquarium view, RSPower sockets)
  background_img: new URL(
    "../../../img/esphome/VSONFEEDER/closed_full.webp",
    import.meta.url,
  ),
  images: {
    closed_full: new URL(
      "../../../img/esphome/VSONFEEDER/closed_full.webp",
      import.meta.url,
    ),
    closed_empty: new URL(
      "../../../img/esphome/VSONFEEDER/closed_empty.webp",
      import.meta.url,
    ),
    open_full: new URL(
      "../../../img/esphome/VSONFEEDER/open_full.webp",
      import.meta.url,
    ),
    open_empty: new URL(
      "../../../img/esphome/VSONFEEDER/open_empty.webp",
      import.meta.url,
    ),
  },
  color: "255,152,0",
  alpha: 1,
  elements: {
    maintenance_tasks: maintenance_shortcut(
      {
        flex: "0 0 auto",
        position: "absolute",
        top: "8px",
        right: "8px",
        "z-index": "2",
      },
      "var(--secondary-text-color, #727272)",
    ),
  },
};
