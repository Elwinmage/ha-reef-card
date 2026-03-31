// ─── Color constants ──────────────────────────────────────────────────────────
// Primary REDSEA brand color (red)

const COLOR_RS_RGB = "197,91,90";
// ──────────────────────────────────────────────────────────────────────────────

export const config = {
  name: null,
  model: "RSRUN_RETURN",
  background_img: new URL(
    "../../../img/redsea/RSRUN/reefrun_return.png",
    import.meta.url,
  ),
  css: {
    width: "100%",
  },
  color: COLOR_RS_RGB,
  elements: {
    speed_1: {
      name: "speed",
      type: "progress-circle",
      target: 100,
      put_in: "ctrl_1",
      no_value: true,
      force_integer: true,
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "-184.2%",
        left: "77.2%",
        width: "25%",
      },
    },
    speed_2: {
      name: "speed",
      type: "progress-circle",
      target: 100,
      put_in: "ctrl_2",
      no_value: true,
      force_integer: true,
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "-184.5%",
        left: "-11.7%",
        width: "25%",
      },
    },
    control_1: {
      name: "schedule_enabled",
      type: "click-image",
      icon: "state",
      put_in: "ctrl_1",
      icon_color: "red",
      tap_action: {
        domain: "switch",
        action: "toggle",
        data: "default",
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "-176%",
        left: "84.2%",
      },
    },
    control_2: {
      name: "schedule_enabled",
      type: "click-image",
      put_in: "ctrl_2",
      icon: "state",
      icon_color: "red",
      tap_action: {
        domain: "switch",
        action: "toggle",
        data: "default",
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "-176%",
        left: "-4%",
      },
    },
    flow: {
      name: "speed",
      type: "flow-image",
      image: new URL(
        "../../../img/redsea/RSRUN/water_seamless.png",
        import.meta.url,
      ),
      //disabled_if: "entity.schedule_enabled?.state === 'off'",
      class: "tube",
      "animation-name": "flowUp",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "25%",
        left: "45%",
        width: "10%",
        height: "13%",
      },
    },
    pipe_1: {
      name: "missing_pump",
      type: "click-image",
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_pump_return_pipe.png",
        import.meta.url,
      ),
      put_in: "cables_1",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "57%",
        top: "2%",
        left: "1.2%",
      },
    },
    pipe_2: {
      name: "missing_pump",
      type: "click-image",
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_pump_return_pipe.png",
        import.meta.url,
      ),
      put_in: "cables_2",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "57%",
        top: "2%",
        left: "41.2%",
        transform: "scaleX(-1)",
      },
    },
    alim_cable_1: {
      name: "missing_pump",
      type: "click-image",
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_cable.png",
        import.meta.url,
      ),
      put_in: "cables_1",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "57%",
        top: "-134.5%",
        left: "38.2%",
      },
    },
    alim_cable_2: {
      name: "missing_pump",
      type: "click-image",
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_cable.png",
        import.meta.url,
      ),
      put_in: "cables_2",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "57%",
        top: "-134.5%",
        left: "-6.5%",
        transform: "scaleX(-1)",
      },
    },
  },
};
