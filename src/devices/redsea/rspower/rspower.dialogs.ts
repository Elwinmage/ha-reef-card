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
    title_key: "${i18n._('socket_config')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "socket_name", name: { type: "entity" } },
            { type: "divider" },
            { entity: "socket_on_off", name: { type: "entity" } },
            { entity: "select.socket_mode", name: { type: "entity" } },
            { entity: "socket_state", name: { type: "entity" } },
            { entity: "socket_consumption", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
};
