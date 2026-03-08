export const dialogs_rsmat = {
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
            { entity: "mode", name: { type: "entity" } },
            { entity: "fetch_config", name: { type: "entity" } },
            { entity: "reset", name: { type: "entity" } },
            { entity: "model", name: { type: "entity" } },
            { entity: "position", name: { type: "entity" } },
            { entity: "firmware_update", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
};
