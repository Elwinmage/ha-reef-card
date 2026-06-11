export const dialogs_rsrun_pump_skimmer = {
  config_skimmer: {
    name: "config_skimmer",
    title_key: "${i18n._('config_skimmer')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "type", name: { type: "entity" } },
            { entity: "select.model", name: { type: "entity" } },
            { entity: "name", name: { type: "entity" } },
            { entity: "state", name: { type: "entity" } },
            { entity: "reconnect_pump", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
  config_sensor: {
    name: "config_sensor",
    title_key: "${i18n._('config_sensor')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "sensor_controlled_switch", name: { type: "entity" } },
            { entity: "ec_sensor_connected", name: { type: "entity" } },
            { entity: "missing_sensor", name: { type: "entity" } },
            { type: "divider" },
            { entity: "fullcup_enabled", name: { type: "entity" } },
            { entity: "cup_last_calibration", name: { type: "entity" } },
            { type: "divider" },
            { entity: "overskimming_enabled", name: { type: "entity" } },
            { entity: "overskimming_threshold", name: { type: "entity" } },
            { entity: "skim_last_calibration", name: { type: "entity" } },
            { type: "divider" },
            { entity: "last_message", name: { type: "entity" } },
            { entity: "last_alert_message", name: { type: "entity" } },
          ],
        },
      },
      {
        view: "common-button",
        conf: {
          type: "common-button",
          stateObj: null,
          icon: "mdi:cog-outline",
          tap_action: {
            domain: "redsea_ui",
            action: "dialog",
            data: {
              type: "fullcup_calibration",
              overload_quit: "config_sensor",
            },
          },
          label: "${i18n._('fullcup_calibration')}",
          class: "dialog_button",
          css: {},
          "elt.css": {
            "background-color": "rgba(0,0,0,0)",
          },
        },
      },
      {
        view: "common-button",
        conf: {
          type: "common-button",
          stateObj: null,
          icon: "mdi:cog-outline",
          tap_action: {
            domain: "redsea_ui",
            action: "dialog",
            data: {
              type: "overskimming_calibration",
              overload_quit: "config_sensor",
            },
          },
          label: "${i18n._('overskimming_calibration')}",
          class: "dialog_button",
          css: {},
          "elt.css": {
            "background-color": "rgba(0,0,0,0)",
          },
        },
      },
    ],
  },
  fullcup_calibration: {
    name: "fullcup_calibration",
    title_key: "${i18n._('fullcup_calibration')}",
    content: [
      {
        view: "click-image",
        conf: {
          image: "/hacsfiles/ha-reef-card/img/ic_full_cup_calibration.png",
          type: "click-image",
          stateObj: null,
          tap_action: [],
          elt_css: {
            width: "40%",
            "margin-left": "20%",
          },
        },
      },
    ],
    validate: {
      label: "${i18n._('start_calibration')}",
      class: "dialog_button",
      type: "common-button",
      stateObj: null,
      tap_action: [
        {
          domain: "button",
          action: "press",
          data: { entity_id: "ec_calibration_start" },
        },

        {
          domain: "button",
          action: "press",
          data: { entity_id: "ec_calibration_cup" },
        },
        { domain: "redsea_ui", action: "wait", data: 20 },
        {
          domain: "redsea",
          action: "request",
          data: {
            device_id: "${config.id}",
            access_path: "/calibration",
            method: "get",
            data: "{}",
          },
        },

        {
          domain: "button",
          action: "press",
          data: { entity_id: "ec_calibration_end" },
        },
        {
          domain: "button",
          action: "press",
          data: { entity_id: "fetch_config" },
        },
        {
          domain: "redsea_ui",
          action: "exit-dialog",
        },
      ],
    },
  },
  overskimming_calibration: {
    name: "overskimming_calibration",
    title_key: "${i18n._('overskimming_calibration')}",
    content: [
      {
        view: "click-image",
        conf: {
          image: "/hacsfiles/ha-reef-card/img/ic_over_skimming_calibration.png",
          type: "click-image",
          stateObj: null,
          tap_action: [],
          elt_css: {
            width: "40%",
            "margin-left": "20%",
          },
        },
      },
    ],
    validate: {
      label: "${i18n._('start_calibration')}",
      class: "dialog_button",
      type: "common-button",
      stateObj: null,
      tap_action: [
        {
          domain: "button",
          action: "press",
          data: { entity_id: "ec_calibration_start" },
        },

        {
          domain: "button",
          action: "press",
          data: { entity_id: "ec_calibration_skim" },
        },
        { domain: "redsea_ui", action: "wait", data: 20 },
        // Check status via redsea.request
        {
          domain: "redsea",
          action: "request",
          data: {
            device_id: "${config.id}",
            access_path: "/calibration",
            method: "get",
            data: "{}",
          },
        },
        {
          domain: "button",
          action: "press",
          data: { entity_id: "ec_calibration_end" },
        },
        {
          domain: "button",
          action: "press",
          data: { entity_id: "fetch_config" },
        },
        {
          domain: "redsea_ui",
          action: "exit-dialog",
        },
      ],
    },
  },
};
