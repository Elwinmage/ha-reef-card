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
            { entity: "fullcup_enabled", name: { type: "entity" } },
            { entity: "overskimming_enabled", name: { type: "entity" } },
            { entity: "overskimming_threshold", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
};
