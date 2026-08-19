export const dialogs_rsato = {
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
            { entity: "reset", name: { type: "entity" } },
            { entity: "firmware_update", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
  ato_tank: {
    name: "ato_tank",
    title_key: "${i18n._('ato_tank')}",
    close_cross: true,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "volume_left", name: { type: "entity" } },
            { entity: "ato_volume_left", name: { type: "entity" } },
            { entity: "ato_tank_volume", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
};
