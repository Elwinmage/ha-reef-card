/**
 * Dialogs shared by every RSRun pump, whatever its type.
 *
 *  - add_pump            : shown when a pump is plugged but not configured yet
 *                          (/dashboard reports type "unknown"). Runs the
 *                          detect-and-add button, then lets the user pick the
 *                          exact model — the ReefRun detection is only a
 *                          suggestion and can be wrong (a rsk-900 is reported
 *                          as rsk-300 on some firmwares).
 *  - confirm_delete_pump : confirmation asked before wiping a pump config,
 *                          because DELETE /pump/{id}/settings also resets the
 *                          schedule and the sensor_controlled flag.
 */

export const dialogs_rsrun_pump = {
  add_pump: {
    name: "add_pump",
    title_key: "${i18n._('add_pump')}",
    close_cross: false,
    content: [
      {
        view: "text",
        value: "${i18n._('add_pump_text')}",
      },
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "type", name: { type: "entity" } },
            { entity: "select.model", name: { type: "entity" } },
            { entity: "name", name: { type: "entity" } },
          ],
        },
      },
    ],
    // Center button: run the detection. The dialog stays open so the rows
    // above refresh in place and the model can then be corrected.
    other: {
      conf: {
        type: "common-button",
        stateObj: null,
        icon: "mdi:magnify-plus-outline",
        label: "${i18n._('detect_and_add_pump')}",
        class: "dialog_button",
        css: {},
        "elt.css": {
          "background-color": "rgba(0,0,0,0)",
        },
        tap_action: [
          {
            domain: "button",
            action: "press",
            data: { entity_id: "detect_pump" },
          },
          { domain: "redsea_ui", action: "wait", data: 10 },
          {
            domain: "button",
            action: "press",
            data: { entity_id: "fetch_config" },
          },
        ],
      },
    },
  },

  confirm_delete_pump: {
    name: "confirm_delete_pump",
    title_key: "${i18n._('confirm_delete_pump')}",
    close_cross: false,
    cancel: true,
    content: [
      {
        view: "text",
        value: "${i18n._('confirm_delete_pump_text')}",
      },
    ],
    validate: {
      label: "${i18n._('delete_pump')}",
      class: "dialog_button",
      type: "common-button",
      icon: "mdi:delete-outline",
      stateObj: null,
      tap_action: [
        {
          domain: "button",
          action: "press",
          data: { entity_id: "delete_pump" },
        },
        { domain: "redsea_ui", action: "wait", data: 5 },
        {
          domain: "button",
          action: "press",
          data: { entity_id: "fetch_config" },
        },
        { domain: "redsea_ui", action: "exit-dialog" },
      ],
    },
  },
};
