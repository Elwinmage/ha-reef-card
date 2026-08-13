/**
 * Config of a pump slot that is not configured yet (type "unknown").
 *
 * A pump can be plugged in and still be unknown to the ReefRun: /dashboard
 * then reports name "", type/model "unknown" and missing_pump false. The only
 * hint that something is physically connected is a non-zero temperature.
 */

export const config = {
  name: null,
  model: "RSRUN_UNKNOWN",
  background_img: "",
  css: {
    width: "100%",
  },
  elements: {
    add_pump: {
      name: "type",
      type: "click-image",
      image: new URL("../../../img/redsea/RSRUN/add_pump.png", import.meta.url),
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: { type: "add_pump" },
      },
      elt_css: {
        width: "50%",
        cursor: "pointer",
        left: "40%",
        position: "absolute",
      },
    },
  },
};
