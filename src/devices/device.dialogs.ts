/**
 * Common device dialog box
 *    - wifi information (and the cloud account and aquarium)
 *    - maintenance tasks of the device
 *    - history of the messages and alerts of the device
 *    - Poseidon mode of the device
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

/**
 * Button of the config dialog of a device opening its message history: the
 * banners that open it too are not shown while there is no message.
 */
export const messages_history_button = {
  view: "common-button",
  conf: {
    type: "common-button",
    stateObj: null,
    icon: "mdi:message-text-clock-outline",
    tap_action: {
      domain: "redsea_ui",
      action: "dialog",
      data: {
        type: "messages_history",
        overload_quit: "config",
      },
    },
    label: "${i18n._('messages_history')}",
    class: "dialog_button",
    css: {
      "margin-top": "5px",
      "text-align": "center",
    },
    "elt.css": {
      "background-color": "rgba(0,0,0,0)",
    },
  },
};

/**
 * Messages and alerts of one device, newest first. Opened by a click on the
 * scrolling message banner; the list is built at runtime, see
 * messages_history.dialog_func_ext.
 */
export const dialogs_messages = {
  messages_history: {
    name: "messages_history",
    title_key: "${i18n._('messages_history')}",
    close_cross: false,
    content: [
      {
        view: "extend",
        extend: "messages_dialog_func_ext",
        // A new message or alert reloads the list while it is open
        re_render: true,
      },
    ],
  },
};

/**
 * Poseidon mode of one device: the mode itself, the strategy and the polling
 * pause (spy mode only), then what the relay sees of the device: its
 * connection state and the last frame each way. Opened by a tap on the
 * trident of the device; the entities missing on a device without keys are
 * skipped.
 */
export const dialogs_poseidon = {
  poseidon: {
    name: "poseidon",
    title_key: "${i18n._('poseidon')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "poseidon_mode", name: { type: "entity" } },
            { entity: "poseidon_strategy", name: { type: "entity" } },
            { entity: "poseidon_poll_pause", name: { type: "entity" } },
            // What the relay sees of the device (attributes of the mode)
            { type: "divider" },
            {
              type: "attribute",
              entity: "poseidon_mode",
              attribute: "connection_state",
              name: "${i18n._('poseidon_connection_state')}",
            },
            {
              type: "attribute",
              entity: "poseidon_mode",
              attribute: "last_up",
              name: "${i18n._('poseidon_last_up')}",
              format: "relative",
            },
            {
              type: "attribute",
              entity: "poseidon_mode",
              attribute: "last_down",
              name: "${i18n._('poseidon_last_down')}",
              format: "relative",
            },
          ],
        },
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
            // Cloud aquarium of the device (skipped when the integration
            // does not provide it)
            { entity: "aquarium", name: { type: "entity" } },
            { entity: "use_cloud_api", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
  ...dialogs_maintenance,
  ...dialogs_messages,
  ...dialogs_poseidon,
};
