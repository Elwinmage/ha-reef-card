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
  custom_advance: {
    name: "custom_advance",
    title_key: "${i18n._('custom_advance')}",
    close_cross: true,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "custom_advance_value", name: { type: "entity" } },
            { entity: "advance", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
  schedule_advance: {
    name: "schedule_advance",
    title_key: "${i18n._('schedule_advance')}",
    close_cross: true,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "scheduled_advance", name: { type: "entity" } },
            { entity: "schedule_length", name: { type: "entity" } },
            { entity: "schedule_time", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
};
