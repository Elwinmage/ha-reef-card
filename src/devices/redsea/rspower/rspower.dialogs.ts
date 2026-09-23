/**
 * Dialog definitions for the RSPower device.
 *
 * socket_config renders the socket's entities then the PowerSensor
 * component, which owns the mode selector (On/Off/Schedule/Sensor),
 * the schedule editor and the sensor configurator as a single unified
 * inline panel — no sub-dialogs.
 */
export const dialogs_rspower = {
  config: {
    name: "config",
    title_key: "${i18n._('config')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "fetch_config", name: { type: "entity" } },
            { entity: "fetch_data", name: { type: "entity" } },
            { entity: "reset", name: { type: "entity" } },
            { entity: "firmware_update", name: { type: "entity" } },
            { type: "divider" },
            { entity: "model_type", name: { type: "entity" } },
            { entity: "max_sockets", name: { type: "entity" } },
          ],
        },
      },

      // ── Temperature probe & RSControl hub management ───────────────────
      // Mutually exclusive (integration available_fn):
      //   no probe + no hub  → install_temperature available
      //   local probe        → remove_temperature available
      //   paired hub         → unpair_control available
      // The integration sets the entity to state "unavailable" when it does
      // not apply; we grey the button out rather than hiding it so the user
      // can see what actions exist.
      {
        view: "common-button",
        conf: {
          type: "common-button",
          stateObj: null,
          icon: "mdi:thermometer-plus",
          disabled_if: "entity.install_temperature?.state === 'unavailable'",
          no_br_if_disabled: false,
          tap_action: {
            domain: "button",
            action: "press",
            data: { entity_id: "install_temperature" },
          },
          label: "${i18n._('install_temperature')}",
          class: "dialog_button",
          css: { "margin-bottom": "4px", "text-align": "center" },
          "elt.css": { "background-color": "rgba(0,0,0,0)" },
        },
      },
      {
        view: "common-button",
        conf: {
          type: "common-button",
          stateObj: null,
          icon: "mdi:thermometer-minus",
          disabled_if: "entity.remove_temperature?.state === 'unavailable'",
          no_br_if_disabled: false,
          tap_action: {
            domain: "button",
            action: "press",
            data: { entity_id: "remove_temperature" },
          },
          label: "${i18n._('remove_temperature')}",
          class: "dialog_button",
          css: { "margin-bottom": "4px", "text-align": "center" },
          "elt.css": { "background-color": "rgba(0,0,0,0)" },
        },
      },
      {
        view: "common-button",
        conf: {
          type: "common-button",
          stateObj: null,
          icon: "mdi:link-off",
          disabled_if: "entity.unpair_control?.state === 'unavailable'",
          no_br_if_disabled: false,
          tap_action: {
            domain: "button",
            action: "press",
            data: { entity_id: "unpair_control" },
          },
          label: "${i18n._('unpair_control')}",
          class: "dialog_button",
          css: { "margin-bottom": "4px", "text-align": "center" },
          "elt.css": { "background-color": "rgba(0,0,0,0)" },
        },
      },
    ],
  },

  socket_config: {
    name: "socket_config",
    title_key: "${i18n._('socket_config')} n°${config.id}",
    close_cross: false,
    content: [
      // Socket info: name, switch, state, consumption
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "socket_name", name: { type: "entity" } },
            { type: "divider" },
            {
              entity: "socket_on_off",
              name: { type: "entity" },
              icon: "${device.linked_icon()}",
            },
            { entity: "socket_state", name: { type: "entity" } },
            { entity: "socket_consumption", name: { type: "entity" } },
          ],
        },
      },

      // Unified mode editor: On/Off/Schedule/Sensor + conditional content + Save
      {
        view: "power-sensor",
        conf: {
          type: "power-sensor",
          name: "socket_mode_editor",
        },
      },

      // Delete socket button (top-right of dialog, always present)
      {
        view: "click-image",
        conf: {
          icon: "mdi:delete",
          icon_color: "rgb(51,151,232)",
          type: "click-image",
          stateObj: null,
          tap_action: [
            {
              domain: "redsea_ui",
              action: "dialog",
              data: { type: "socket_delete" },
            },
          ],
          css: {
            position: "absolute",
            top: "7%",
            right: "5%",
          },
        },
      },
    ],
  },
  power_temperature_conf: {
    name: "power_temperature_conf",
    title_key: "${i18n._('dialog_socket_temperature_conf')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "temperature_probe_name", name: { type: "entity" } },
            { entity: "get_temperature", name: { type: "entity" } },
            { entity: "power_temperature", name: { type: "entity" } },
            { type: "divider" },
            {
              entity: "temperature_desired_range_low",
              name: { type: "entity" },
            },
            {
              entity: "temperature_desired_range_high",
              name: { type: "entity" },
            },
            { type: "divider" },
            {
              entity: "temperature_acceptable_range_low",
              name: { type: "entity" },
            },
            {
              entity: "temperature_acceptable_range_high",
              name: { type: "entity" },
            },
            { type: "divider" },
            { entity: "temperature_offset", name: { type: "entity" } },
            { type: "divider" },
            { entity: "temperature_log_enabled", name: { type: "entity" } },
            {
              entity: "temperature_notifications_enabled",
              name: { type: "entity" },
            },
          ],
        },
      },
    ],
  },

  socket_delete: {
    name: "socket_delete",
    title_key: "${i18n._('dialog_socket_delete_title')} n°${config.id}",
    close_cross: false,
    content: [
      {
        view: "text",
        value: "${entity.socket_name?.state || ''}",
      },
    ],
    validate: {
      label: "${i18n._('delete')}",
      class: "dialog_button",
      type: "common-button",
      stateObj: null,
      tap_action: [
        {
          domain: "button",
          action: "press",
          data: { entity_id: "socket_delete" },
        },
        {
          domain: "redsea_ui",
          action: "message_box",
          data: "${i18n._('delete_wait')}",
        },
        {
          domain: "redsea_ui",
          action: "exit-dialog",
        },
      ],
    },
    cancel: true,
  },
};
