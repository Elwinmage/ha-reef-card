import {
  COLOR_ERROR_HEX,
  COLOR_RS_RGBSTR,
  COLOR_WHITE_60,
} from "../../../utils/colors";

export const config = {
  name: null,
  model: "RSPOWER6",
  background_img: new URL(
    "../../../img/redsea/RSPOWER/rspower6.png",
    import.meta.url,
  ),
  css: {
    width: "100%",
  },
  sockets_nb: 6,
  elements: {
    rssense_temperature: {
      name: "rssense_temperature",
      type: "click-image",
      // A paired hub takes the probe's slot: the two pictures occupy the
      // same corner, so the probe steps aside rather than overlapping.
      disabled_if:
        "device.has_control_link() || entity.power_temperature?.state === 'unknown'",
      no_br_if_disabled: true,
      image: new URL(
        "../../../img/redsea/RSPOWER/rssense-temperature-power.png",
        import.meta.url,
      ),
      css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "100%",
        top: "0%",
        left: "0%",
      },
    },
    rscontrol_link: {
      // Bound to the pairing flag so the element re-renders when a hub is
      // paired or dropped; `disabled_if` forces a refresh on every update,
      // which also catches the link going up and down underneath.
      name: "control_paired",
      type: "click-image",
      disabled_if: "!device.has_control_link()",
      no_br_if_disabled: true,
      // Paired but unreachable: blink under a light red tint.
      class: "${device.control_link_alert() ? 'blink-alert' : ''}",
      image: new URL(
        "../../../img/redsea/RSPOWER/rscontrol_rspower_link.png",
        import.meta.url,
      ),
      css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "100%",
        top: "0%",
        left: "0%",
        // A full-canvas image would otherwise swallow clicks aimed at the
        // controls underneath, including over its transparent areas — the
        // hub name sits inside this picture's box.
        "pointer-events": "none",
      },
    },
    rscontrol_name: {
      // Bound to the pairing flag like the picture above: its `disabled_if`
      // forces a re-render on every update, which is what keeps the `value`
      // expression fresh when the hub is renamed or swapped.
      name: "control_paired",
      type: "common-sensor",
      value: "${device.linked_control_name()}",
      // Hidden unless the hub resolves to a device Home Assistant knows:
      // a name that cannot be resolved has nothing to navigate to, and a
      // clickable label leading nowhere is worse than no label.
      disabled_if: "!device.linked_control_name()",
      no_br_if_disabled: true,
      tap_action: {
        domain: "redsea_ui",
        action: "show_device",
        data: { hwid: "${device.linked_control_hwid()}" },
      },
      css: {
        position: "absolute",
        top: "31.5%",
        left: "2.5%",
        cursor: "pointer",
        "writing-mode": "vertical-rl",
        "text-orientation": "mixed",
        transform: "rotate(180deg)",
        color: COLOR_WHITE_60,
        // Scales with the card width — a fixed rem overflows on mobile and
        // reads too small in a browser.
        "font-size": "var(--rs-label-font)",
        "white-space": "nowrap",
        overflow: "hidden",
        "max-height": "26%",
      },
    },
    power_temperature: {
      name: "power_temperature",
      type: "common-sensor",
      disabled_if: "device.has_control_link() || ${state} === 'unknown'",
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "33%",
        color: COLOR_WHITE_60,
        left: "0.5%",
        "font-size": "0.65rem",
      },
    },
    last_message: {
      name: "last_message",
      type: "redsea-messages",
      no_br_if_disabled: true,
      css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "100%",
        height: "15px",
        top: "51%",
        left: "0px",
      },
      "elt.css": {
        "background-color": "rgba(220,220,220,0.7)",
      },
    },
    last_alert_message: {
      name: "last_alert_message",
      type: "redsea-messages",
      no_br_if_disabled: true,
      label: "'⚠'",
      css: {
        color: "red",
        flex: "0 0 auto",
        position: "absolute",
        width: "100%",
        height: "20px",
        top: "55%",
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
        top: "2%",
        left: "10%",
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
        top: "2%",
        left: "16%",
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
        top: "2%",
        right: "22%",
      },
    },
    wifi_quality: {
      name: "wifi_quality",
      type: "common-sensor",
      master: true,
      label: false,
      icon: true,
      icon_color: COLOR_ERROR_HEX,
      tap_action: {
        domain: "redsea_ui",
        action: "dialog",
        data: { type: "wifi" },
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "2%",
        right: "16%",
      },
    },
    battery_level: {
      name: "battery_level",
      type: "common-sensor",
      master: true,
      label: false,
      icon: true,
      icon_color: "red",
      css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "2%",
        right: "10%",
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
        width: "5.3%",
        top: "6.5%",
        left: "45%",
        "font-size": "0.9rem",
      },
    },
    total_consumption: {
      name: "total_consumption",
      type: "common-sensor",
      round: 1,
      unit: "'W'",
      tap_action: {
        domain: "redsea_ui",
        action: "more-info",
        data: "total_consumption",
      },
      css: {
        flex: "0 0 auto",
        position: "absolute",
        color: COLOR_WHITE_60,
        top: "6.5%",
        left: "64%",
        "font-size": "0.9rem",
        cursor: "pointer",
      },
    },
  },
  sockets: {
    common: {
      alpha: "0.2",
      css: {
        top: "9.5%",
        position: "absolute",
        flex: "0 0 auto",
        width: "13.5%",
        height: "13.5%",
      },
      elements: {
        socket_name_label: {
          name: "socket_name",
          type: "common-sensor",
          disabled_if: "entity.socket_mode?.state === 'setup'",
          no_br_if_disabled: true,
          css: {
            position: "absolute",
            top: "-2%",
            left: "0%",
            width: "100%",
            "text-align": "center",
            "font-size": "0.7em",
            "font-weight": "bold",
            color: "white",
            "text-shadow": "0 0 3px rgba(0,0,0,0.7)",
            overflow: "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
          },
        },
        socket_consumption_label: {
          name: "socket_consumption",
          type: "common-sensor",
          round: 1,
          unit: "'W'",
          disabled_if: "entity.socket_mode?.state === 'setup'",
          no_br_if_disabled: true,
          tap_action: {
            domain: "redsea_ui",
            action: "more-info",
            data: "socket_consumption",
          },
          css: {
            position: "absolute",
            bottom: "0%",
            left: "0%",
            width: "100%",
            "text-align": "center",
            "font-size": "0.55em",
            color: "rgba(255,255,255,0.8)",
          },
        },
        socket_on_off: {
          name: "socket_on_off",
          type: "click-image",
          icon: "state",
          class: "on_off",
          style: "button",
          icon_color: COLOR_RS_RGBSTR,
          disabled_if: "entity.socket_mode?.state === 'setup'",
          no_br_if_disabled: true,
          tap_action: {
            domain: "redsea_ui",
            action: "dialog",
            data: { type: "socket_config" },
          },
          hold_action: {
            domain: "switch",
            action: "toggle",
            data: "default",
          },
          css: {
            position: "absolute",
            width: "70%",
            "aspect-ratio": "1/1",
            top: "23%",
            left: "15%",
            "border-radius": "100%",
            "--mdc-icon-size": "100%",
            "border-width": "2px",
            "border-style": "solid",
            "border-color": "$DEVICE-COLOR-ALPHA$",
            "background-color": "$DEVICE-COLOR-ALPHA$",
          },
        },
        linked_thumbnail: {
          // The strip holds the link, the socket only draws it. Bound to the
          // socket mode so it refreshes with the rest, and disabled when no
          // appliance is linked or its model has no picture to borrow.
          name: "socket_mode",
          type: "click-image",
          image: "${device.linked_image()}",
          disabled_if: "!device.linked_image()",
          no_br_if_disabled: true,
          class: "${device.linked_class()}",
          tap_action: {
            domain: "redsea_ui",
            action: "show_device",
            data: { hwid: "${device.linked_hwid()}" },
          },
          css: {
            position: "absolute",
            width: "90%",
            left: "5%",
            cursor: "pointer",
            // Thumbnails hang below the strip in two staggered rows so
            // neighbours do not overlap. Odd sockets take the near row; the
            // even ones override this to the far row.
            top: "110%",
          },
        },
        socket_mode_icon: {
          name: "socket_mode",
          type: "common-sensor",
          icon: "'mdi:clock-time-nine-outline'",
          icon_color: "rgba(255,255,255,0.5)",
          disabled_if:
            "entity.socket_mode?.state !== 'schedule' && entity.socket_prev_mode?.state !== 'schedule'",
          no_br_if_disabled: true,
          tap_action: {
            domain: "redsea_ui",
            action: "dialog",
            data: { type: "socket_schedule" },
          },
          css: {
            position: "absolute",
            width: "70%",
            "aspect-ratio": "1/1",
            top: "60%",
            left: "15%",
            "--mdc-icon-size": "40%",
            cursor: "pointer",
          },
        },
        socket_mode_icon_static: {
          name: "socket_mode",
          type: "common-sensor",
          icon: "${entity.socket_mode?.state === 'sensor' || entity.socket_prev_mode?.state === 'sensor' ? 'mdi:flask-outline' : 'mdi:power'}",
          icon_color: "rgba(255,255,255,0.5)",
          disabled_if:
            "entity.socket_mode?.state === 'setup' || entity.socket_mode?.state === 'schedule' || entity.socket_prev_mode?.state === 'schedule'",
          no_br_if_disabled: true,
          css: {
            position: "absolute",
            width: "70%",
            "aspect-ratio": "1/1",
            top: "60%",
            left: "15%",
            "--mdc-icon-size": "40%",
            "pointer-events": "none",
          },
        },
        socket_manual_override: {
          name: "socket_prev_mode",
          type: "common-sensor",
          icon: "'mdi:hand-back-left-outline'",
          icon_color: "rgba(255,255,255,0.5)",
          disabled_if:
            "entity.socket_mode?.state === 'setup' || entity.socket_mode?.state === 'schedule' || entity.socket_mode?.state === 'sensor' || (entity.socket_prev_mode?.state !== 'schedule' && entity.socket_prev_mode?.state !== 'sensor')",
          no_br_if_disabled: true,
          css: {
            position: "absolute",
            top: "60%",
            left: "70%",
            "--mdc-icon-size": "75%",
            "pointer-events": "none",
          },
        },
        socket_setup: {
          name: "socket_mode",
          type: "click-image",
          icon: "mdi:plus",
          icon_color: "rgba(255,255,255,0.35)",
          disabled_if: "entity.socket_mode?.state !== 'setup'",
          no_br_if_disabled: true,
          tap_action: {
            domain: "redsea_ui",
            action: "dialog",
            data: { type: "socket_config" },
          },
          css: {
            position: "absolute",
            width: "70%",
            "aspect-ratio": "1/1",
            top: "23%",
            left: "15%",
            "--mdc-icon-size": "100%",
            cursor: "pointer",
          },
        },
      },
    },
    socket_1: {
      id: 1,
      color: "255,0,0",
      css: { left: "10%" },
    },
    socket_2: {
      elements: {
        linked_thumbnail: { css: { top: "225%" } },
      },
      color: "0,255,0",
      id: 2,
      css: { left: "24%" },
    },
    socket_3: {
      id: 3,
      color: "0,0,255",
      css: { left: "38%" },
    },
    socket_4: {
      elements: {
        linked_thumbnail: { css: { top: "225%" } },
      },
      id: 4,
      color: "255,255,0",
      css: { left: "52%" },
    },
    socket_5: {
      id: 5,
      color: "255,0,255",
      css: { left: "66%" },
    },
    socket_6: {
      elements: {
        linked_thumbnail: { css: { top: "225%" } },
      },
      id: 6,
      color: "0,255,255",
      css: { left: "80%" },
    },
  },
};
