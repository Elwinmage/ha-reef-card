/**
 * Maintenance overview types.
 *
 * A "maintenance item" is the card-side projection of a single maintenance
 * button entity exposed by ha-reefbeat-component. Those entities carry the
 * `reef_role` attribute (prefixed with `maint_`) plus the computed attributes
 * `task_key`, `interval_days`, `days_left`, `overdue` and `last_reset`.
 */

/** Lifecycle status of a maintenance task, used to pick a color. */
export type MaintenanceStatus = "never" | "ok" | "warning" | "overdue";

/** Display unit used by the interval number entity. */
export type MaintenanceUnit = "days" | "weeks" | "months";

/** Available sort modes for the maintenance overview. */
export type MaintenanceSort = "device" | "due";

export interface MaintenanceItem {
  /** Home Assistant entity_id of the maintenance button. */
  entity_id: string;
  /** Stable task identifier coming from the integration catalogue. */
  task_key: string;
  /** `reef_role` attribute, e.g. "maint_led_lens". */
  role: string;
  /** False when the user muted the overdue alerts of this task. */
  notify: boolean;
  /** entity_id of the companion notification switch, null when absent. */
  notify_entity_id: string | null;
  /** entity_id of the companion interval number, null when absent. */
  interval_entity_id: string | null;
  /** Display unit of the interval number ("days" | "weeks" | "months"). */
  interval_unit: MaintenanceUnit | null;
  /** Current interval expressed in `interval_unit`, null when unavailable. */
  interval_value: number | null;
  /** Slider bounds and step, expressed in `interval_unit`. */
  interval_min: number | null;
  interval_max: number | null;
  interval_step: number;
  /** RSRUN pump type ("return" / "skimmer"), null for other devices. */
  pump_type: string | null;
  /** RSRUN pump model ("return-12000", "rsk-900"), null for other devices. */
  pump_model: string | null;
  /** Human readable task name (friendly_name without the device prefix). */
  name: string;
  /** MDI icon declared on the entity, if any. */
  icon: string | null;
  /** HA device id owning the entity ("" when the registry entry is missing). */
  device_id: string;
  /** Human readable device name (sub-devices included, e.g. "RSDose4 Head 1"). */
  device_name: string;
  /** Device model as declared in the HA device registry. */
  model: string;
  /** Configured interval in days (0 when unknown). */
  interval_days: number;
  /** Remaining days before the deadline, negative when overdue, null when the task was never reset. */
  days_left: number | null;
  /** True when the deadline is passed. */
  overdue: boolean;
  /** Number of days past the deadline (0 when not overdue). */
  overdue_days: number;
  /** ISO-8601 timestamp of the last reset, null when never done. */
  last_reset: string | null;
  /** Elapsed part of the interval, clamped to [0, 100]. */
  percent: number;
  /** Derived status used for coloring. */
  status: MaintenanceStatus;
}

/** A group of maintenance items belonging to the same HA device. */
export interface MaintenanceGroup {
  device_id: string;
  device_name: string;
  /** RSRUN pump type of the device, null when not a pump. */
  pump_type: string | null;
  /** RSRUN pump model of the device, null when not a pump. */
  pump_model: string | null;
  items: MaintenanceItem[];
}

/** Options accepted by `collect_maintenance_items`. */
export interface MaintenanceCollectOptions {
  /**
   * Fraction of the interval below which a task switches to the "warning"
   * status. Defaults to 0.2 (i.e. the last 20% of the interval).
   */
  warning_ratio?: number;
}
