export const dialogs_rsrun_pump_return = {
  config_return: {
    name: "config_return",
    title_key: "${i18n._('config_return')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "type", name: { type: "entity" } },
            { entity: "model", name: { type: "entity" } },
            { entity: "name", name: { type: "entity" } },
            { entity: "state", name: { type: "entity" } },
            { entity: "reconnect_pump", name: { type: "entity" } },
          ],
        },
      },
      {
        // Wiping a pump also resets its schedule: always ask first
        view: "common-button",
        conf: {
          type: "common-button",
          stateObj: null,
          icon: "mdi:delete-outline",
          tap_action: {
            domain: "redsea_ui",
            action: "dialog",
            data: {
              type: "confirm_delete_pump",
              overload_quit: "config_return",
            },
          },
          label: "${i18n._('delete_pump')}",
          class: "dialog_button",
          css: {},
          "elt.css": {
            "background-color": "rgba(0,0,0,0)",
          },
        },
      },
    ],
  },
};
