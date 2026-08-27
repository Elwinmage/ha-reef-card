export const dialogs_rsato = {
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
            { entity: "firmware_update", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
  ato_tank: {
    name: "ato_tank",
    title_key: "${i18n._('ato_tank')}",
    close_cross: true,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "volume_left", name: { type: "entity" } },
            { entity: "ato_volume_left", name: { type: "entity" } },
            { entity: "ato_tank_volume", name: { type: "entity" } },
          ],
        },
      },
    ],
  },
  // Everything the RSATO+ exposes about its leak-alarm buzzer: the setting
  // and whether it is sounding right now.
  //
  // The probe itself lives in the `leak` dialog; only the two flags that
  // explain a silent buzzer are repeated here.
  buzzer: {
    name: "buzzer",
    title_key: "${i18n._('buzzer')}",
    close_cross: true,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            { entity: "switch.buzzer_enabled", name: { type: "entity" } },
            // Sounding right now, as opposed to merely enabled.
            { entity: "buzzer_on", name: { type: "entity" } },
            { type: "divider" },
            // Why an enabled buzzer may still never sound: it is the leak
            // alarm, so an unplugged or disarmed probe silences it.
            { entity: "connected", name: { type: "entity" } },
            { entity: "enabled", name: { type: "entity" } },
          ],
        },
      },
    ],
  },

  // Consumption, opened from the usage chart. Six figures forming a grid:
  // fills and volume, each read today, as a daily average and as a lifetime
  // total. The chart itself plots the two "volume" cells of the first two
  // rows, so the dialog is the same story with the numbers spelled out.
  usage: {
    name: "usage",
    title_key: "${i18n._('usage')}",
    close_cross: true,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            // Today. Both reset at midnight.
            { entity: "today_fills", name: { type: "entity" } },
            { entity: "today_volume_usage", name: { type: "entity" } },
            { type: "divider" },
            // The running averages the two lines of the chart compare
            // against: today above its average means evaporation is up.
            { entity: "daily_fills_average", name: { type: "entity" } },
            { entity: "daily_volume_average", name: { type: "entity" } },
            { type: "divider" },
            // Lifetime counters, never reset.
            { entity: "total_fills", name: { type: "entity" } },
            { entity: "total_volume_usage", name: { type: "entity" } },
            { type: "divider" },
            // What the reservoir has left to feed all of the above.
            { entity: "volume_left", name: { type: "entity" } },
            { entity: "days_till_empty", name: { type: "entity" } },
          ],
        },
      },
    ],
  },

  // ATO pump: everything the device reports about the pump behind the
  // fill/stop/resume buttons, which the card itself only shows as a picture.
  pump: {
    name: "pump",
    title_key: "${i18n._('pump')}",
    close_cross: true,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            // Running state. `prev_pump_state` is what it was doing before,
            // which is the only clue left once a fault cleared itself.
            { entity: "is_pump_on", name: { type: "entity" } },
            { entity: "pump_state", name: { type: "entity" } },
            { entity: "prev_pump_state", name: { type: "entity" } },
            { entity: "pump_speed", name: { type: "entity" } },
            { type: "divider" },
            // Live measurements: what the pump draws and delivers.
            { entity: "pump_consumption", name: { type: "entity" } },
            { entity: "flow_rate", name: { type: "entity" } },
            { type: "divider" },
            // The three current thresholds the firmware compares against to
            // call a dry run or a blockage.
            { entity: "pump_empty_threshold", name: { type: "entity" } },
            {
              entity: "pump_soft_blockage_threshold",
              name: { type: "entity" },
            },
            { entity: "pump_blockage_threshold", name: { type: "entity" } },
            { type: "divider" },
            // Last time it ran, and what asked it to.
            { entity: "last_pump_on_cause", name: { type: "entity" } },
            { entity: "last_fill_date", name: { type: "entity" } },
          ],
        },
      },
    ],
  },

  // Leak probe: presence, arming, verdict, and the raw reading behind it.
  leak: {
    name: "leak",
    title_key: "${i18n._('leak_sensor')}",
    close_cross: true,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            // Plugged in, armed, and the wet/dry verdict.
            { entity: "connected", name: { type: "entity" } },
            { entity: "enabled", name: { type: "entity" } },
            { entity: "status", name: { type: "entity" } },
            { type: "divider" },
            // Which side the water came from, and the raw probe reading the
            // wet/dry verdict is derived from.
            { entity: "leak_sensor_status", name: { type: "entity" } },
            { entity: "leak_sensor_current_read", name: { type: "entity" } },
            { type: "divider" },
            // The alarm this probe drives.
            { entity: "switch.buzzer_enabled", name: { type: "entity" } },
            { entity: "buzzer_on", name: { type: "entity" } },
          ],
        },
      },
    ],
  },

  // Water-level probe: the sensor the whole ATO decision rests on.
  ato_sensor: {
    name: "ato_sensor",
    title_key: "${i18n._('ato_sensor')}",
    close_cross: true,
    content: [
      {
        view: "hui-entities-card",
        conf: {
          type: "entities",
          entities: [
            // Health first: an uncalibrated or faulty probe makes every
            // reading below meaningless.
            { entity: "ato_sensor_connected", name: { type: "entity" } },
            { entity: "is_calibrated", name: { type: "entity" } },
            { entity: "check_sensor", name: { type: "entity" } },
            { entity: "is_sensor_error", name: { type: "entity" } },
            { type: "divider" },
            // The level itself. Both names are domain-prefixed: the reading
            // is a sensor, the "is it where it should be" flag a
            // binary_sensor, and they share a translation key.
            { entity: "sensor.water_level", name: { type: "entity" } },
            { entity: "binary_sensor.water_level", name: { type: "entity" } },
            { entity: "current_level", name: { type: "entity" } },
            { type: "divider" },
            // The two electrodes behind the level reading: `last_pump_on_cause`
            // names one of them when a fill starts.
            { entity: "s1_average", name: { type: "entity" } },
            { entity: "s2_average", name: { type: "entity" } },
            { type: "divider" },
            // The temperature probe shares the same physical sensor.
            { entity: "is_temp_enabled", name: { type: "entity" } },
            { entity: "current_read", name: { type: "entity" } },
            { entity: "temperature_probe_status", name: { type: "entity" } },
            { entity: "temperature_log_enabled", name: { type: "entity" } },
            { type: "divider" },
            // Identity and service history of the probe cartridge.
            { entity: "ato_sensor_code", name: { type: "entity" } },
            {
              entity: "ato_sensor_last_installation_date",
              name: { type: "entity" },
            },
            {
              entity: "ato_sensor_last_adjustment_date",
              name: { type: "entity" },
            },
          ],
        },
      },
    ],
  },
};
