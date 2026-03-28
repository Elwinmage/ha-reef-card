export const config = {
  name: null,
  model: "RSRUN_SKIMMER",
  background_img: new URL(
    "../../../img/redsea/RSRUN/reefrun_skimmer_off.png",
    import.meta.url,
  ),
  state_background_imgs: {
    off: new URL(
      "../../../img/redsea/RSRUN/reefrun_skimmer_off.png",
      import.meta.url,
    ),
    on: new URL(
      "../../../img/redsea/RSRUN/reefrun_skimmer_on.png",
      import.meta.url,
    ),
    full: new URL(
      "../../../img/redsea/RSRUN/reefrun_skimmer_full.png",
      import.meta.url,
    ),
  },
  css: {
    width: "100%",
  },
  elements: {
    control_1: {
      name: "schedule_enabled",
      type: "click-image",
      put_in: "ctrl_1",
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
        top: "-14%",
        left: "93.2%",
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
        top: "-14%",
        left: "-2%",
      },
    },
    state: {
      name: "mode",
      master: true,
      disabled_if: true,
    },
    speed: {
      name: "speed",
      master: true,
      disabled_if: true,
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
        top: "2%",
        left: "47.3%",
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
        top: "2%",
        left: "-3.6%",
        transform: "scaleX(-1)",
      },
    },
    rsk_cable_1: {
      name: "sensor_controlled",
      type: "click-image",
      disabled_if: "${state}==='off'",
      no_br_if_disabled: true,
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_cable.png",
        import.meta.url,
      ),
      put_in: "cables_1",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "57%",
        top: "2%",
        left: "65.4%",
      },
    },
    rsk_cable_2: {
      name: "sensor_controlled",
      type: "click-image",
      disabled_if: "${state}==='off'",
      no_br_if_disabled: true,
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_cable.png",
        import.meta.url,
      ),
      put_in: "cables_2",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "57%",
        top: "2%",
        left: "-12.6%",
        transform: "scaleX(-1)",
      },
    },
    sensor_controlled: {
      name: "sensor_controlled",
      type: "click-image",
      disabled_if: "${state}==='off'",
      no_br_if_disabled: true,
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_sensor.png",
        import.meta.url,
      ),
      put_in: "sensor",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "22%",
        top: "-27%",
        left: "34%",
      },
    },
    sensor_controlled_in: {
      name: "sensor_controlled",
      type: "click-image",
      disabled_if:
        "${state}==='off' || entity.schedule_enabled?.state === 'on'",
      no_br_if_disabled: true,
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_sensor_in.png",
        import.meta.url,
      ),
      put_in: "sensor_in",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "41%",
        top: "4%",
        left: "28%",
      },
    },
  },
};
