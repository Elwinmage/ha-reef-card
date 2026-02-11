export const dialogs_device = {
  wifi: {
    name: "wifi",
    title_key: "${i18n._('wifi')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "wifi_ssid", name: { type: "entity" } },
            { entity: "ip", name: { type: "entity" } },
            { entity: "wifi_signal", name: { type: "entity" } },
            { entity: "wifi_quality", name: { type: "entity" } },
            { entity: "cloud_connect", name: { type: "entity" } },
            { entity: "cloud_state", name: { type: "entity" } },
            { entity: "cloud_account", name: { type: "entity" } },
            { entity: "use_cloud_api", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
};
