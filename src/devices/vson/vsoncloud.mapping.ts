/**
 * VSON cloud feeder (ha-vson-component, domain `vson`).
 *
 * Same look as the hacked ESPHome feeder — the four feeder pictures (trap
 * open/closed, reserve full/empty) and the falling pellets — but driven by
 * the cloud entities, which it finds by their `reef_role` (online,
 * food_shortage, feed, firmware, schedule). The pictures are shared with the
 * ESPHome view, so no new asset is needed.
 *
 * The device is recognised by its domain (`vson`); the HA device model
 * ("WP8621"/"WP8621A") names the view (see VSON_CLOUD_MODELS).
 */
import { maintenance_shortcut } from "../redsea/maintenance/maintenance.shortcut";

export const config = {
  name: null,
  // The HA model names the view; the component reports it via config_model().
  model: null,
  // Thumbnail used in the aquarium view and the RSPower sockets.
  background_img: new URL(
    "../../img/esphome/VSONFEEDER/closed_full.webp",
    import.meta.url,
  ),
  images: {
    closed_full: new URL(
      "../../img/esphome/VSONFEEDER/closed_full.webp",
      import.meta.url,
    ),
    closed_empty: new URL(
      "../../img/esphome/VSONFEEDER/closed_empty.webp",
      import.meta.url,
    ),
    open_full: new URL(
      "../../img/esphome/VSONFEEDER/open_full.webp",
      import.meta.url,
    ),
    open_empty: new URL(
      "../../img/esphome/VSONFEEDER/open_empty.webp",
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
