export const dialogs_rsrun_pump_return = {
  config_return: {
    name: "config_return",
    title_key: "${i18n._('config')}",
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
    ],
  },
};
