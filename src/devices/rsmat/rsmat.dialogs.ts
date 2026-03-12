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
  new_roll: {
    name: "new_roll",
    title_key: "${i18n._('new_roll')}",
    close_cross: true,
    content: [
      {
        view: "text",
        value: "${i18n._('new_roll_info')}",
      },
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "started_roll_diameter", name: { type: "entity" } },
          ],
        },
      },
    ],
    validate: {
      label: "${i18n._('save')}",
      class: "dialog_button",
      type: "common-button",
      stateObj: null,
      tap_action: [
        {
          domain: "button",
          action: "press",
          data: { entity_id: "new_roll" },
        },
        {
          domain: "redsea_ui",
          action: "exit-dialog",
        },
      ],
    },
  },
  end_error: {
    name: "end_error",
    title_key: "${i18n._('end_error')}",
    close_cross: true,
    content: [
      {
        view: "text",
        value: "${i18n._('end_error_info')}",
      },
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "mode", name: { type: "entity" } },
            { entity: "last_alert_message", name: { type: "entity" } },
            { entity: "last_message", name: { type: "entity" } },
          ],
        },
      },
    ],
    validate: {
      label: "${i18n._('error_corrected')}",
      class: "dialog_button",
      type: "common-button",
      stateObj: null,
      tap_action: [
        {
          domain: "button",
          action: "press",
          data: { entity_id: "delete_emergency" },
        },
        {
          domain: "redsea_ui",
          action: "exit-dialog",
        },
      ],
    },
  },
};
