/**
 * Dialog definitions for the ReefLED.
 *   - config: device actions, mode, manual settings and diagnostics
 *   - led_moon: moon phase switch and settings
 *   - led_acclimation: acclimation switch, progress and settings
 */

export const dialogs_rsled = {
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
            { entity: "select.mode", name: { type: "entity" } },
            { entity: "manual_duration", name: { type: "entity" } },
            // Staggered sunrise: minutes the lamp's day starts late (lamps
            // with /offset only, dropped elsewhere)
            { entity: "number.sunrise_offset", name: { type: "entity" } },
            { type: "divider" },
            { entity: "light.kelvin_intensity", name: { type: "entity" } },
            { entity: "light.white", name: { type: "entity" } },
            { entity: "light.blue", name: { type: "entity" } },
            { entity: "light.moon", name: { type: "entity" } },
            { type: "divider" },
            { entity: "current_program", name: { type: "entity" } },
            { entity: "binary_sensor.status", name: { type: "entity" } },
            { entity: "sensor.temperature", name: { type: "entity" } },
            { entity: "sensor.fan", name: { type: "entity" } },
            { type: "divider" },
            { entity: "fetch_config", name: { type: "entity" } },
            { entity: "fetch_data", name: { type: "entity" } },
            { entity: "reset", name: { type: "entity" } },
            { entity: "firmware_update", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
  led_moon: {
    name: "led_moon",
    title_key: "${i18n._('led_moon')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "switch.moon_phase", name: { type: "entity" } },
            { entity: "moon_day", name: { type: "entity" } },
            { type: "divider" },
            { entity: "todays_moon_day", name: { type: "entity" } },
            { entity: "moon_intensity", name: { type: "entity" } },
            { entity: "next_full_moon", name: { type: "entity" } },
            { entity: "next_new_moon", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
  led_acclimation: {
    name: "led_acclimation",
    title_key: "${i18n._('led_acclimation')}",
    close_cross: false,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "switch.acclimation", name: { type: "entity" } },
            { entity: "number.acclimation_duration", name: { type: "entity" } },
            {
              entity: "number.acclimation_start_intensity_factor",
              name: { type: "entity" },
            },
            { type: "divider" },
            { entity: "acclimation_remaining_days", name: { type: "entity" } },
            {
              entity: "acclimation_current_intensity_factor",
              name: { type: "entity" },
            },
          ],
        },
      },
    ],
  },
};

/**
 * G2 configuration: no white/blue lights, the channels are read-only
 * sensors there.
 */
export const dialogs_rsled_g2 = {
  config: {
    ...dialogs_rsled.config,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "select.mode", name: { type: "entity" } },
            { entity: "manual_duration", name: { type: "entity" } },
            // Staggered sunrise: minutes the lamp's day starts late (lamps
            // with /offset only, dropped elsewhere)
            { entity: "number.sunrise_offset", name: { type: "entity" } },
            { type: "divider" },
            { entity: "light.kelvin_intensity", name: { type: "entity" } },
            { entity: "light.moon", name: { type: "entity" } },
            { entity: "sensor.white", name: { type: "entity" } },
            { entity: "sensor.blue", name: { type: "entity" } },
            { type: "divider" },
            { entity: "current_program", name: { type: "entity" } },
            { entity: "binary_sensor.status", name: { type: "entity" } },
            { entity: "sensor.temperature", name: { type: "entity" } },
            { entity: "sensor.fan", name: { type: "entity" } },
            { type: "divider" },
            { entity: "fetch_config", name: { type: "entity" } },
            { entity: "fetch_data", name: { type: "entity" } },
            { entity: "reset", name: { type: "entity" } },
            { entity: "firmware_update", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
};

/** Entities of the config dialog a virtual ReefLED does not have. */
const VIRTUAL_NO_ENTITY = [
  "current_program",
  // Each lamp's own: the virtual LED sets them from its staggered delay
  "number.sunrise_offset",
  "sensor.temperature",
  "sensor.fan",
  "firmware_update",
];

/**
 * Config dialog of a virtual ReefLED, from a real lamp's one: without what
 * only a real lamp reports, with the list of its lamps.
 * @param dialogs: the dialogs of the generation shown
 */
function virtual_dialogs(dialogs: any) {
  const content = dialogs.config.content[0];
  const entities = content.conf.entities
    .filter((e: any) => !VIRTUAL_NO_ENTITY.includes(e.entity))
    .map((e: any) =>
      e.entity === "binary_sensor.status"
        ? [{ entity: "linked_leds", name: { type: "entity" } }, e]
        : [e],
    )
    .flat();
  // The whole set: merged over a real lamp's, the list of entities would
  // keep the real lamp's extra rows
  return {
    ...dialogs,
    config: {
      ...dialogs.config,
      content: [{ ...content, conf: { ...content.conf, entities } }],
    },
  };
}

/** Virtual ReefLED of G1 lamps only. */
export const dialogs_rsled_virtual_g1 = virtual_dialogs(dialogs_rsled);

/** Virtual ReefLED with at least one G2. */
export const dialogs_rsled_virtual_g2 = virtual_dialogs({
  ...dialogs_rsled,
  ...dialogs_rsled_g2,
});
