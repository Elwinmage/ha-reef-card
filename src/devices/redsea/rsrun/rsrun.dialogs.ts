export const dialogs_rsrun = {
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
            // Companion to the above: fetch_config only refreshes the sources
            // typed "config", fetch_data forces an early read of the polled
            // ones instead of waiting for the scan interval.
            { entity: "fetch_data", name: { type: "entity" } },
            { entity: "reset", name: { type: "entity" } },
            { entity: "firmware_update", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
};
