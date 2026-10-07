/**
 * Dialog definitions shared by the Aqua Medic views.
 *
 * Rows naming an entity the pump does not have (the wave settings on a DC
 * Runner, the timer on the legacy DC Runner firmware) are dropped by the
 * dialog box, so one list per family is enough.
 */

/** Rows every pump of the DC Runner series offers (return pump and skimmer). */
const RUNNER_ROWS = [
  { entity: "switch.power", name: { type: "entity" } },
  { entity: "number.motor_speed", name: { type: "entity" } },
  { entity: "switch.control_0_10v", name: { type: "entity" } },
  { type: "divider" },
  // Feeding pause
  { entity: "switch.feed_switch", name: { type: "entity" } },
  { entity: "number.feed_time", name: { type: "entity" } },
  { type: "divider" },
  // Timer: what the running slot applies
  { entity: "switch.timer_on", name: { type: "entity" } },
  { entity: "sensor.schedule", name: { type: "entity" } },
  { entity: "select.auto_mode", name: { type: "entity" } },
  { entity: "number.auto_gears", name: { type: "entity" } },
  { entity: "number.auto_feed_time", name: { type: "entity" } },
  { type: "divider" },
  // What the pump is: return pump or skimmer
  { entity: "select.pump_role", name: { type: "entity" } },
  { entity: "button.refresh", name: { type: "entity" } },
];

/** Rows of an EcoDrift / SmartDrift flow pump. */
const DRIFT_ROWS = [
  { entity: "switch.power", name: { type: "entity" } },
  { entity: "select.mode", name: { type: "entity" } },
  { entity: "number.flow", name: { type: "entity" } },
  { entity: "number.frequency", name: { type: "entity" } },
  { entity: "switch.pulse_tide", name: { type: "entity" } },
  { entity: "select.linkage", name: { type: "entity" } },
  { entity: "switch.control_0_10v", name: { type: "entity" } },
  { type: "divider" },
  // Feeding pause
  { entity: "switch.feed_switch", name: { type: "entity" } },
  { entity: "number.feed_time", name: { type: "entity" } },
  { type: "divider" },
  // Timer
  { entity: "switch.timer_on", name: { type: "entity" } },
  { entity: "sensor.schedule", name: { type: "entity" } },
  { type: "divider" },
  { entity: "button.refresh", name: { type: "entity" } },
];

/** Fault sensors, the same on every pump. */
const FAULT_ROWS = [
  { type: "divider" },
  { entity: "binary_sensor.fault_no_liveload", name: { type: "entity" } },
  { entity: "binary_sensor.fault_lockedrotor", name: { type: "entity" } },
  { entity: "binary_sensor.fault_overtemp", name: { type: "entity" } },
  { entity: "binary_sensor.fault_overcurrent", name: { type: "entity" } },
  { entity: "binary_sensor.fault_overvoltage", name: { type: "entity" } },
  { entity: "binary_sensor.fault_undervoltage", name: { type: "entity" } },
  { entity: "binary_sensor.fault_uart", name: { type: "entity" } },
];

/**
 * Build the settings dialog of a pump.
 * @param rows: the entity rows, before the faults
 * @return the dialog definitions, keyed by dialog type
 */
function config_dialog(rows: any[]) {
  return {
    config: {
      name: "config",
      title_key: "${i18n._('config')}",
      close_cross: false,
      content: [
        {
          view: "hui-entities-card",
          conf: {
            type: "entities",
            entities: [...rows, ...FAULT_ROWS],
          },
        },
      ],
    },
  };
}

export const dialogs_am_runner = config_dialog(RUNNER_ROWS);
export const dialogs_am_drift = config_dialog(DRIFT_ROWS);
