import { COLOR_WHITE_60, COLOR_ERROR_HEX } from "../../../utils/colors";

export const config = {
  name: null,
  model: "RSATO",
  background_img: new URL(
    "../../../img/redsea/RSATO/RSATO+.png",
    import.meta.url,
  ),
  css: {
    width: "100%",
  },

  elements: {
    // --- Optional accessories --------------------------------------------
    // Both overlays are full-canvas PNGs with a transparent background, so
    // they need no positioning: they are simply stacked over background_img.
    //
    // They are declared FIRST on purpose. Elements paint in declaration
    // order, so anything below stays visually and functionally on top of
    // them. pointer-events is disabled as well: a full-canvas image would
    // otherwise swallow every click aimed at the controls underneath,
    // including over its transparent areas.
    pump: {
      // Bound to `mode`: that is the entity carrying both presence and fault
      // for the pump, and a class holding a "${...}" expression is only
      // re-evaluated when the element's own stateObj changes.
      name: "mode",
      type: "click-image",
      image: new URL(
        "../../../img/redsea/RSATO/rsato_pump.png",
        import.meta.url,
      ),
      // No pump paired: draw nothing at all.
      disabled_if: "!device.has_pump()",
      no_br_if_disabled: true,
      // Paired but faulty: blink under a light red tint.
      class: "${device.pump_alert() ? 'blink-alert' : ''}",
      css: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        "pointer-events": "none",
      },
      elt_css: {
        display: "block",
        width: "100%",
      },
    },
    leak: {
      // Bound to the PROBLEM sensor so a leak re-renders the element on its
      // own. Presence is read from the probe's separate `connected` flag
      // inside has_leak_sensor(), and the disabled_if below already forces a
      // re-render on every update, so both transitions are covered.
      name: "status",
      type: "click-image",
      image: new URL("../../../img/redsea/RSATO/leak.png", import.meta.url),
      disabled_if: "!device.has_leak_sensor()",
      no_br_if_disabled: true,
      // Three states: leaking, plugged in but disarmed, normal.
      class:
        "${device.leak_alert() ? 'blink-alert' : " +
        "(device.leak_sensor_armed() ? '' : 'muted')}",
      css: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        "pointer-events": "none",
      },
      elt_css: {
        display: "block",
        width: "100%",
      },
    },

    last_message: {
      name: "last_message",
      type: "redsea-messages",
      // Absolutely positioned: never emit a <br> that shifts the flow
      no_br_if_disabled: true,
      css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "100%",
        height: "15px",
        top: "33%",
        left: "0px",
      },
      "elt.css": {
        "background-color": "rgba(220,220,220,0.7)",
      },
    },

    last_alert_message: {
      name: "last_alert_message",
      type: "redsea-messages",
      // Absolutely positioned: never emit a <br> that shifts the flow
      no_br_if_disabled: true,
      label: "'⚠'",
      css: {
        color: "red",
        flex: "0 0 auto",
        position: "absolute",
        width: "100%",
        height: "20px",
        top: "37%",
        left: "0px",
      },
      "elt.css": {
        "background-color": "rgba(240,200,200,0.7)",
      },
    },
    device_state: {
      name: "device_state",
      type: "click-image",
      icon: "state",
      icon_color: "red",
      master: true,
      tap_action: {
        domain: "switch",
        action: "toggle",
        data: "default",
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "5.5%",
        left: "75%",
      },
    },
    maintenance: {
      name: "maintenance",
      type: "click-image",
      icon: "state",
      icon_color: "red",
      master: true,
      tap_action: {
        domain: "switch",
        action: "toggle",
        data: "default",
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "5.5%",
        left: "81%",
      },
    },
    configuration: {
      name: "configuration",
      type: "click-image",
      icon: "mdi:cog",
      icon_color: COLOR_ERROR_HEX,
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: {
          type: "config",
        },
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "5.5%",
        left: "87%",
      },
    },
    wifi_quality: {
      name: "wifi_quality",
      type: "common-sensor",
      master: true,
      label: false,
      icon: true,
      icon_color: "#ec2330",
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: { type: "wifi" },
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "5.5%",
        height: "2%",
        top: "5.5%",
        left: "93%",
      },
    },
    auto_fill: {
      name: "auto_fill",
      type: "click-image",
      // Meaningless without a pump: no_br_if_disabled is required because the
      // element is absolutely positioned — a bare <br> would fall back into
      // the normal flow and shift the rest of the card.
      disabled_if: "!device.has_pump()",
      no_br_if_disabled: true,
      icon: "state",
      icon_color: "red",
      master: true,
      tap_action: {
        domain: "switch",
        action: "toggle",
        data: "default",
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "10%",
        left: "81%",
      },
    },
    mode: {
      name: "mode",
      type: "common-sensor",
      translate_values: true,
      css: {
        flex: "0 0 auto",
        position: "absolute",
        color: COLOR_WHITE_60,
        width: "27.3%",
        top: "1.5%",
        left: "74%",
      },
    },
    fill: {
      name: "fill",
      type: "click-image",
      // Meaningless without a pump: no_br_if_disabled is required because the
      // element is absolutely positioned — a bare <br> would fall back into
      // the normal flow and shift the rest of the card.
      disabled_if: "!device.has_pump()",
      no_br_if_disabled: true,
      icon: "state",
      icon_color: "red",
      master: true,
      tap_action: {
        domain: "button",
        action: "press",
        data: "default",
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "38%",
        left: "17%",
      },
    },
    stop_fill: {
      name: "stop_fill",
      type: "click-image",
      // Meaningless without a pump: no_br_if_disabled is required because the
      // element is absolutely positioned — a bare <br> would fall back into
      // the normal flow and shift the rest of the card.
      disabled_if: "!device.has_pump()",
      no_br_if_disabled: true,
      icon: "state",
      icon_color: "red",
      master: true,
      tap_action: {
        domain: "button",
        action: "press",
        data: "default",
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "38%",
        left: "26%",
      },
    },
    resume: {
      name: "resume",
      type: "click-image",
      // Meaningless without a pump: no_br_if_disabled is required because the
      // element is absolutely positioned — a bare <br> would fall back into
      // the normal flow and shift the rest of the card.
      disabled_if: "!device.has_pump()",
      no_br_if_disabled: true,
      icon: "state",
      icon_color: "red",
      master: true,
      tap_action: {
        domain: "button",
        action: "press",
        data: "default",
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "54%",
        left: "17%",
      },
    },
    // RO reservoir: a genuine volume ratio. volume_left is in mL and
    // ato_tank_volume in L, hence target_factor. min_percent is the residue
    // the pump cannot siphon, so an "empty" tank still shows a water line;
    // max_percent is the container rim in the background picture.
    volume_left: {
      name: "volume_left",
      type: "water-level",
      // Meaningless without a pump: no_br_if_disabled is required because the
      // element is absolutely positioned — a bare <br> would fall back into
      // the normal flow and shift the rest of the card.
      disabled_if: "!device.has_pump()",
      no_br_if_disabled: true,
      target: "ato_tank_volume",
      target_factor: 1000,
      min_percent: 10,
      max_percent: 95,
      warn_below: 10,
      wave: true,
      css: {
        position: "absolute",
        top: "59.5%",
        left: "0%",
        width: "26%",
        height: "36%",
      },
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: {
          type: "ato_tank",
        },
      },
    },

    // Sump probe: the state names a hole on the probe bar, not a fraction of
    // a volume, so each value maps to a fixed height. min/max stay 0/100 so
    // the levels below are read directly as a percentage of the box, which
    // makes them measurable straight off the background picture.
    // "error" is deliberately absent: it renders the no-reading mark.
    water_level: {
      name: "sensor.water_level",
      type: "water-level",
      levels: {
        below: 50.3,
        desired_level_1: 58.3,
        desired_level_2: 64.7,
        above: 80,
      },
      min_percent: 0,
      max_percent: 100,
      // Both ends of the probe are abnormal: below means the ATO is not
      // keeping up, above means it overfilled. "error" never reaches here —
      // it has no level, so it renders the blinking no-reading mark.
      warn_states: ["below", "above"],
      wave: true,
      // The level comes from sensor.water_level; the overlay shows the
      // binary_sensor instead. Both register as "water_level", hence the
      // domain prefix.
      value_entity: "binary_sensor.water_level",
      css: {
        position: "absolute",
        top: "49.5%",
        left: "51.5%",
        width: "48.5%",
        height: "45%",
      },
    },
    current_read: {
      name: "current_read",
      type: "common-sensor",
      text_color: "rgb(240,240,240)",
      round: 1,
      css: {
        position: "absolute",
        top: "91%",
        left: "54%",
        width: "40%",
      },
    },
    days_till_empty: {
      name: "days_till_empty",
      type: "common-sensor",
      // Meaningless without a pump: no_br_if_disabled is required because the
      // element is absolutely positioned — a bare <br> would fall back into
      // the normal flow and shift the rest of the card.
      disabled_if: "!device.has_pump()",
      no_br_if_disabled: true,
      text_color: "rgb(240,240,240)",
      round: 0,
      unit: "${i18n._('days')}",
      css: {
        position: "absolute",
        top: "80%",
        left: "4%",
        width: "40%",
      },
      tap_action: {
        domain: "redsea_ui",
        action: "more-info",
        data: "days_till_empty",
      },
    },
  },
};
