/**
 * Dialog definitions for the ReefWave.
 *   - config: current wave, settings and device actions (the cog)
 *   - preview: maintenance switch and preview settings and buttons (the eye)
 *
 * Several translation keys exist on two platforms (the current wave is a
 * sensor, the preview wave a number): they are always named with their
 * domain so each row reaches the right entity.
 */

/** Maintenance switch: in both dialogs, a preview often comes with it. */
const MAINTENANCE_ROW = {
  entity: "switch.maintenance",
  name: { type: "entity" },
};

export const dialogs_rswave = {
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
            // Wave running now, from the day program
            { entity: "sensor.mode", name: { type: "entity" } },
            { entity: "sensor.name", name: { type: "entity" } },
            { entity: "sensor.wave_type", name: { type: "entity" } },
            { entity: "sensor.wave_direction", name: { type: "entity" } },
            {
              entity: "sensor.wave_forward_intensity",
              name: { type: "entity" },
            },
            {
              entity: "sensor.wave_backward_intensity",
              name: { type: "entity" },
            },
            { entity: "sensor.wave_forward_time", name: { type: "entity" } },
            { entity: "sensor.wave_backward_time", name: { type: "entity" } },
            { entity: "sensor.wave_step", name: { type: "entity" } },
            { type: "divider" },
            // Settings
            MAINTENANCE_ROW,
            { entity: "number.shortcut_off_delay", name: { type: "entity" } },
            // Group of the aquarium's ReefWaves (cloud)
            { entity: "switch.wave_grouped", name: { type: "entity" } },
            { type: "divider" },
            // Device actions
            { entity: "button.fetch_config", name: { type: "entity" } },
            { entity: "button.fetch_data", name: { type: "entity" } },
            { entity: "button.reset", name: { type: "entity" } },
            { entity: "button.firmware_update", name: { type: "entity" } },
            { entity: "update.firmware_update", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
  preview: {
    name: "preview",
    title_key: "${i18n._('wave_preview_title')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            MAINTENANCE_ROW,
            { type: "divider" },
            // Wave to preview
            { entity: "select.preview_wave_type", name: { type: "entity" } },
            {
              entity: "select.preview_wave_direction",
              name: { type: "entity" },
            },
            {
              entity: "number.wave_forward_intensity",
              name: { type: "entity" },
            },
            {
              entity: "number.wave_backward_intensity",
              name: { type: "entity" },
            },
            { entity: "number.wave_forward_time", name: { type: "entity" } },
            { entity: "number.wave_backward_time", name: { type: "entity" } },
            { entity: "number.wave_preview_step", name: { type: "entity" } },
            {
              entity: "number.wave_preview_wave_duration",
              name: { type: "entity" },
            },
            {
              entity: "number.wave_preview_duration",
              name: { type: "entity" },
            },
            { type: "divider" },
            // Preview actions
            { entity: "button.preview_start", name: { type: "entity" } },
            { entity: "button.preview_stop", name: { type: "entity" } },
            {
              entity: "button.preview_set_from_current",
              name: { type: "entity" },
            },
            { entity: "button.preview_save", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
};
