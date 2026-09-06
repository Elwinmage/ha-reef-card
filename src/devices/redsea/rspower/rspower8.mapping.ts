import { COLOR_ERROR_HEX, COLOR_WHITE_60 } from "../../../utils/colors";

export const config2 = {
  name: null,
  model: "RSPOWER8",
  background_img: new URL(
    "../../../img/redsea/RSPOWER/rspower8.png",
    import.meta.url,
  ),
  css: {
    width: "100%",
  },
  sockets_nb: 8,
  elements: {
    last_message: {
      name: "last_message",
      type: "redsea-messages",
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
        left: "54%",
      },
    },
  },
  sockets: {
    common: {
      css: {
        top: "9.5%",
        position: "absolute",
        flex: "0 0 auto",
        width: "10.8%",
        height: "13.5%",
      },
      elements: {
        socket_on_off: {
          name: "socket_on_off",
          type: "click-image",
          icon: "state",
          class: "on_off",
          style: "button",
          disabled_if: "entity.socket_mode?.state === 'setup'",
          no_br_if_disabled: true,
          tap_action: {
            domain: "switch",
            action: "toggle",
            data: "default",
          },
          css: {
            position: "absolute",
            width: "70%",
            "aspect-ratio": "1/1",
            top: "25%",
            left: "15%",
            "border-radius": "10%",
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
            top: "25%",
            left: "15%",
            "--mdc-icon-size": "100%",
            cursor: "pointer",
          },
        },
      },
    },
    socket_1: {
      id: 1,
      css: { left: "9%", "background-color": "rgba(255,0,0,0.2)" },
    },
    socket_2: {
      id: 2,
      css: { left: "19.8%", "background-color": "rgba(0,255,0,0.2)" },
    },
    socket_3: {
      id: 3,
      css: { left: "30.6%", "background-color": "rgba(0,0,255,0.2)" },
    },
    socket_4: {
      id: 4,
      css: { left: "41.4%", "background-color": "rgba(255,255,0,0.2)" },
    },
    socket_5: {
      id: 5,
      css: { left: "52.2%", "background-color": "rgba(255,0,255,0.2)" },
    },
    socket_6: {
      id: 6,
      css: { left: "63%", "background-color": "rgba(0,255,255,0.2)" },
    },
    socket_7: {
      id: 7,
      css: { left: "73.8%", "background-color": "rgba(125,125,255,0.2)" },
    },
    socket_8: {
      id: 8,
      css: { left: "84.6%", "background-color": "rgba(255,100,20,0.2)" },
    },
  },
};
