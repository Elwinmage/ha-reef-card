/**
 * Common device dialog box
 *    - wifi information
 *    - maintenance tasks of the device
 */

/**
 * Maintenance tasks of one device: the maintenance overview, restricted to
 * the device (and its sub-devices) the dialog was opened from. The list is
 * built at runtime, see maintenance.dialog_func_ext.
 *
 * Kept apart from `dialogs_device` for the devices that do not take the
 * whole common set (Aqua Medic pumps have no wifi dialog).
 */
export const dialogs_maintenance = {
  maintenance_tasks: {
    name: "maintenance_tasks",
    title_key: "${i18n._('maintenance_view')}",
    close_cross: false,
    content: [
      {
        view: "extend",
        extend: "maintenance_dialog_func_ext",
        // Days left, resets and intervals must follow the states while open
        re_render: true,
      },
    ],
  },
};

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
  ...dialogs_maintenance,
};
