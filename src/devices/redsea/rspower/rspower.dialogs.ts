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
    ],
  },
  socket_config: {
    name: "socket_config",
    title_key: "${i18n._('socket_config')} n°${config.id}",
    close_cross: false,
    content: [
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
              // Shows what is plugged in rather than a generic plug. Fixed
              // when the dialog opens: the row is built once, so a socket
              // switched while it is open keeps the icon it opened with.
              icon: "${device.linked_icon()}",
            },
            { entity: "select.socket_mode", name: { type: "entity" } },
            { entity: "socket_state", name: { type: "entity" } },
            { entity: "socket_consumption", name: { type: "entity" } },
          ],
        },
      },
      // Compact on/off timeline — rendered only when the socket runs on a
      // schedule; clicking it opens the full editor.
      {
        view: "power-schedule",
        conf: {
          type: "power-schedule",
          name: "socket_schedule_preview",
          readonly: true,
        },
      },
      // Advanced configuration button — only for schedule mode.
      // The dialog type must be a literal: it is looked up as-is in the
      // dialog table, so a template expression would resolve to nothing.
      {
        view: "common-button",
        conf: {
          type: "common-button",
          stateObj: null,
          icon: "mdi:clock-time-nine-outline",
          disabled_if: "entity.socket_mode?.state !== 'schedule'",
          no_br_if_disabled: true,
          tap_action: {
            domain: "redsea_ui",
            action: "dialog",
            data: {
              type: "socket_schedule",
              overload_quit: "socket_config",
            },
          },
          label: "${i18n._('socket_advanced_config')}",
          class: "dialog_button",
          css: {
            "margin-bottom": "5px",
            "text-align": "center",
          },
          "elt.css": {
            "background-color": "rgba(0,0,0,0)",
          },
        },
      },
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
  socket_schedule: {
    name: "socket_schedule",
    title_key: "${i18n._('socket_schedule')} n°${config.id}",
    close_cross: false,
    content: [
      {
        view: "power-schedule",
        conf: {
          type: "power-schedule",
          name: "socket_schedule",
        },
      },
    ],
  },
};
