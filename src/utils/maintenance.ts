/**
 * Maintenance overview helpers.
 *
 * ha-reefbeat-component exposes one button entity per maintenance task
 * (see custom_components/redsea/maintenance.py). Each of them carries:
 *
 *   reef_role     : "maint_<translation_key>"  -> stable detection marker
 *   task_key      : catalogue key, e.g. "led_lens"
 *   interval_days : configured interval in days
 *   days_left     : remaining days, negative when overdue, null when never reset
 *   overdue       : boolean
 *   last_reset    : ISO-8601 timestamp or null
 *
 * This module turns those raw states into a flat, sortable list. Everything
 * here is pure (no Lit, no DOM) so it can be unit tested in isolation.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//

import type {
  HassConfig,
  MaintenanceItem,
  MaintenanceGroup,
  MaintenanceSort,
  MaintenanceStatus,
  MaintenanceCollectOptions,
  MaintenanceUnit,
} from "../types/index";

import {
  MAINTENANCE_INTERVAL_INFIX,
  MAINTENANCE_NOTIFY_SUFFIX,
  MAINTENANCE_ROLE_PREFIX,
  MAINTENANCE_WARNING_RATIO,
} from "./constants";

//----------------------------------------------------------------------------//

/**
 * Coerce an unknown attribute into a finite number.
 * @param value: the raw attribute value
 * @param fallback: returned when the value is not a finite number
 * @return the parsed number or the fallback
 */
function to_number(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Coerce an unknown attribute into a finite number or null.
 * `null`/`undefined`/"unknown" all mean "the task was never reset".
 * @param value: the raw attribute value
 * @return the parsed number, or null when not available
 */
function to_number_or_null(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Turn a task_key into a readable fallback label.
 * Example: "run_skim_venturi" -> "Run skim venturi"
 * @param task_key: the catalogue key
 * @return a humanized label
 */
export function humanize_task_key(task_key: string): string {
  const words = String(task_key || "")
    .replace(/[_-]+/g, " ")
    .trim();
  if (words.length === 0) {
    return "";
  }
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Remove the device name that Home Assistant prepends to friendly_name when
 * `has_entity_name` is set on the entity.
 * @param friendly_name: the full friendly name, e.g. "ReefLed 160 Clean lenses"
 * @param device_name: the owning device name, e.g. "ReefLed 160"
 * @return the entity-only part, e.g. "Clean lenses"
 */
export function strip_device_prefix(
  friendly_name: string,
  device_name: string,
): string {
  if (!friendly_name) {
    return "";
  }
  if (device_name && friendly_name.startsWith(device_name + " ")) {
    return friendly_name.slice(device_name.length + 1);
  }
  return friendly_name;
}

/**
 * Compute the number of days below which a task is considered "due soon".
 * Always at least one day so that short intervals still get a warning step.
 * @param interval_days: the configured interval
 * @param ratio: the fraction of the interval used as warning window
 * @return the warning threshold in days
 */
export function warning_threshold(
  interval_days: number,
  ratio: number = MAINTENANCE_WARNING_RATIO,
): number {
  if (interval_days <= 0) {
    return 0;
  }
  return Math.max(1, Math.round(interval_days * ratio));
}

/**
 * Derive the display status of a task.
 * @param days_left: remaining days, null when never reset
 * @param interval_days: the configured interval
 * @param ratio: the warning window ratio
 * @return the status used to pick a color
 */
export function compute_status(
  days_left: number | null,
  interval_days: number,
  ratio: number = MAINTENANCE_WARNING_RATIO,
): MaintenanceStatus {
  if (days_left === null) {
    return "never";
  }
  if (days_left < 0) {
    return "overdue";
  }
  if (days_left <= warning_threshold(interval_days, ratio)) {
    return "warning";
  }
  return "ok";
}

/**
 * Compute the elapsed percentage of the interval.
 * @param days_left: remaining days, null when never reset
 * @param interval_days: the configured interval
 * @return a value clamped to [0, 100]; 0 when the task was never reset
 */
export function compute_percent(
  days_left: number | null,
  interval_days: number,
): number {
  if (days_left === null || interval_days <= 0) {
    return 0;
  }
  const elapsed = ((interval_days - days_left) / interval_days) * 100;
  return Math.min(100, Math.max(0, Math.round(elapsed)));
}

/**
 * Tell whether a state object looks like a ha-reefbeat maintenance entity.
 * @param state: an entry of hass.states
 * @return true when the entity exposes the maintenance contract
 */
export function is_maintenance_state(state: any, entity_id?: string): boolean {
  const attrs = state?.attributes;
  if (!attrs) {
    return false;
  }
  // The integration also exposes `maint_*` roles on the interval number and
  // the notification switch of each task. The action button is the single
  // source of truth (it carries every computed attribute), so restrict the
  // scan to that domain rather than relying on attribute shape alone.
  const id = entity_id ?? state?.entity_id;
  if (typeof id === "string" && !id.startsWith("button.")) {
    return false;
  }
  const role = attrs.reef_role;
  if (typeof role !== "string" || !role.startsWith(MAINTENANCE_ROLE_PREFIX)) {
    return false;
  }
  return typeof attrs.task_key === "string" && attrs.task_key.length > 0;
}

/**
 * Build an index of the per-task notification switches, keyed by
 * "<device_id>|<button reef_role>". The switch role is the button role with
 * the "_notify" suffix appended (see MaintenanceNotifySwitchEntity).
 * @param hass: the hass states object
 * @return a lookup table from device+role to switch entity_id
 */
function index_notify_switches(hass: HassConfig): Record<string, string> {
  const index: Record<string, string> = {};
  const registry: Record<string, any> = (hass.entities as any) || {};

  for (const entity_id in hass.states) {
    if (!entity_id.startsWith("switch.")) {
      continue;
    }
    const role = hass.states[entity_id]?.attributes?.reef_role;
    if (
      typeof role !== "string" ||
      !role.startsWith(MAINTENANCE_ROLE_PREFIX) ||
      !role.endsWith(MAINTENANCE_NOTIFY_SUFFIX)
    ) {
      continue;
    }
    const base = role.slice(0, -MAINTENANCE_NOTIFY_SUFFIX.length);
    const device_id = registry[entity_id]?.device_id || "";
    index[`${device_id}|${base}`] = entity_id;
  }

  return index;
}

/**
 * Build an index of the RSRUN per-pump descriptors, keyed by device_id.
 *
 * Each pump sub-device carries `sensor` entities whose `reef_role` is "type"
 * ("return"/"skimmer") and "model" ("return-12000", "rsk-900"). Requiring
 * BOTH on the same device is what makes this specific to ReefRun pumps:
 * other Red Sea devices expose a `model` role on a `select` entity, and a
 * lone `name` sensor, but never this pair on a sensor.
 * @param hass: the hass states object
 * @return a lookup table from device_id to the pump type and model
 */
function index_pump_details(
  hass: HassConfig,
): Record<string, { type: string | null; model: string | null }> {
  const registry: Record<string, any> = (hass.entities as any) || {};
  const found: Record<string, { type: string | null; model: string | null }> =
    {};

  for (const entity_id in hass.states) {
    if (!entity_id.startsWith("sensor.")) {
      continue;
    }
    const state = hass.states[entity_id];
    const role = state?.attributes?.reef_role;
    if (role !== "type" && role !== "model") {
      continue;
    }
    const device_id = registry[entity_id]?.device_id;
    if (!device_id) {
      continue;
    }
    // Ignore unavailable/unknown states rather than printing them.
    const value = state.state;
    if (
      typeof value !== "string" ||
      value === "" ||
      value === "unknown" ||
      value === "unavailable"
    ) {
      continue;
    }
    const entry = (found[device_id] ??= { type: null, model: null });
    if (role === "type") {
      entry.type = value;
    } else {
      entry.model = value;
    }
  }

  // Keep only devices exposing the pair.
  const index: Record<string, { type: string | null; model: string | null }> =
    {};
  for (const device_id in found) {
    const entry = found[device_id]!;
    if (entry.type !== null && entry.model !== null) {
      index[device_id] = entry;
    }
  }

  return index;
}

/** Interval number entity resolved for one task. */
interface IntervalRef {
  entity_id: string;
  unit: MaintenanceUnit;
  value: number | null;
  min: number | null;
  max: number | null;
  step: number;
}

/**
 * Build an index of the per-task interval numbers, keyed by
 * "<device_id>|<button reef_role>". The number role is the button role with
 * "_interval_<unit>" appended, so the unit is read straight from the role and
 * no extra attribute is needed.
 * @param hass: the hass states object
 * @return a lookup table from device+role to the interval descriptor
 */
function index_interval_numbers(hass: HassConfig): Record<string, IntervalRef> {
  const index: Record<string, IntervalRef> = {};
  const registry: Record<string, any> = (hass.entities as any) || {};

  for (const entity_id in hass.states) {
    if (!entity_id.startsWith("number.")) {
      continue;
    }
    const state = hass.states[entity_id];
    const role = state?.attributes?.reef_role;
    if (typeof role !== "string" || !role.startsWith(MAINTENANCE_ROLE_PREFIX)) {
      continue;
    }
    const cut = role.lastIndexOf(MAINTENANCE_INTERVAL_INFIX);
    if (cut < 0) {
      continue;
    }
    const unit = role.slice(cut + MAINTENANCE_INTERVAL_INFIX.length);
    if (unit !== "days" && unit !== "weeks" && unit !== "months") {
      continue;
    }

    const attrs = state.attributes || {};
    const raw = Number(state.state);
    const device_id = registry[entity_id]?.device_id || "";
    const step = Number(attrs.step);

    index[`${device_id}|${role.slice(0, cut)}`] = {
      entity_id,
      unit,
      value: Number.isFinite(raw) ? raw : null,
      min: Number.isFinite(Number(attrs.min)) ? Number(attrs.min) : null,
      max: Number.isFinite(Number(attrs.max)) ? Number(attrs.max) : null,
      step: Number.isFinite(step) && step > 0 ? step : 1,
    };
  }

  return index;
}

/**
 * Scan hass.states and build the list of maintenance items.
 * Entities belonging to a device disabled in Home Assistant are skipped.
 * @param hass: the hass states object
 * @param options: collection options (warning ratio)
 * @return the (unsorted) list of maintenance items
 */
export function collect_maintenance_items(
  hass: HassConfig | null,
  options: MaintenanceCollectOptions = {},
): MaintenanceItem[] {
  const items: MaintenanceItem[] = [];
  if (!hass?.states) {
    return items;
  }

  const ratio = options.warning_ratio ?? MAINTENANCE_WARNING_RATIO;
  const registry: Record<string, any> = (hass.entities as any) || {};
  const devices: Record<string, any> = hass.devices || {};
  const notify_switches = index_notify_switches(hass);
  const interval_numbers = index_interval_numbers(hass);
  const pump_details = index_pump_details(hass);

  for (const entity_id in hass.states) {
    const state = hass.states[entity_id];
    if (!is_maintenance_state(state, entity_id)) {
      continue;
    }

    const attrs = state.attributes;
    const reg = registry[entity_id];
    const device_id: string = reg?.device_id || "";
    const device = device_id ? devices[device_id] : undefined;

    // Hide tasks of devices the user disabled in HA: their entities are
    // still in the registry but no longer actionable.
    if (device?.disabled_by) {
      continue;
    }

    const device_name: string =
      device?.name_by_user || device?.name || attrs.device_name || "";

    const interval_days = Math.max(0, to_number(attrs.interval_days, 0));
    const days_left = to_number_or_null(attrs.days_left);
    const overdue = days_left !== null && days_left < 0;

    const friendly = strip_device_prefix(
      String(attrs.friendly_name || ""),
      device_name,
    );

    // The button mirrors its companion switch in the `notify` attribute;
    // a missing attribute (older integration) means "notifications on".
    const notify = attrs.notify !== false;
    const role_str = String(attrs.reef_role);
    const interval_ref = interval_numbers[`${device_id}|${role_str}`] ?? null;
    const pump = device_id ? (pump_details[device_id] ?? null) : null;

    items.push({
      entity_id,
      task_key: String(attrs.task_key),
      role: String(attrs.reef_role),
      notify,
      notify_entity_id: notify_switches[`${device_id}|${role_str}`] ?? null,
      interval_entity_id: interval_ref?.entity_id ?? null,
      interval_unit: interval_ref?.unit ?? null,
      interval_value: interval_ref?.value ?? null,
      interval_min: interval_ref?.min ?? null,
      interval_max: interval_ref?.max ?? null,
      interval_step: interval_ref?.step ?? 1,
      pump_type: pump?.type ?? null,
      pump_model: pump?.model ?? null,
      name: friendly || humanize_task_key(String(attrs.task_key)),
      icon: typeof attrs.icon === "string" ? attrs.icon : null,
      device_id,
      device_name,
      model: device?.model || "",
      interval_days,
      days_left,
      overdue,
      overdue_days: overdue ? Math.abs(days_left as number) : 0,
      last_reset:
        typeof attrs.last_reset === "string" ? attrs.last_reset : null,
      percent: compute_percent(days_left, interval_days),
      status: compute_status(days_left, interval_days, ratio),
    });
  }

  return items;
}

/**
 * Compare two items by deadline. Never-reset tasks are pushed to the end
 * since they have no computable deadline yet.
 * @param a: first item
 * @param b: second item
 * @return a negative/zero/positive number, Array.sort style
 */
function compare_due(a: MaintenanceItem, b: MaintenanceItem): number {
  if (a.days_left === null && b.days_left === null) {
    return 0;
  }
  if (a.days_left === null) {
    return 1;
  }
  if (b.days_left === null) {
    return -1;
  }
  return a.days_left - b.days_left;
}

/**
 * Sort maintenance items.
 * @param items: the list to sort (not modified)
 * @param mode: "device" groups by equipment then by deadline,
 *              "due" sorts globally by deadline
 * @return a new sorted array
 */
export function sort_maintenance_items(
  items: MaintenanceItem[],
  mode: MaintenanceSort,
): MaintenanceItem[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (mode === "due") {
      return (
        compare_due(a, b) ||
        a.device_name.localeCompare(b.device_name) ||
        a.name.localeCompare(b.name)
      );
    }
    return (
      a.device_name.localeCompare(b.device_name) ||
      compare_due(a, b) ||
      a.name.localeCompare(b.name)
    );
  });
  return sorted;
}

/**
 * Group already sorted items by device, preserving the incoming order.
 * @param items: the sorted list of items
 * @return one group per device
 */
export function group_by_device(items: MaintenanceItem[]): MaintenanceGroup[] {
  const groups: MaintenanceGroup[] = [];
  const index: Record<string, MaintenanceGroup> = {};

  for (const item of items) {
    const key = item.device_id || item.device_name;
    let group = index[key];
    if (!group) {
      group = {
        device_id: item.device_id,
        device_name: item.device_name,
        // All items of a group share the same device, so the first one
        // carries the pump details for the whole header.
        pump_type: item.pump_type,
        pump_model: item.pump_model,
        items: [],
      };
      index[key] = group;
      groups.push(group);
    }
    group.items.push(item);
  }

  return groups;
}

/**
 * Count items per status, used by the header summary.
 * @param items: the list of items
 * @return the number of items in each status
 */
export function maintenance_counters(items: MaintenanceItem[]): {
  total: number;
  overdue: number;
  warning: number;
  never: number;
} {
  const counters = { total: items.length, overdue: 0, warning: 0, never: 0 };
  for (const item of items) {
    if (item.status === "overdue") {
      counters.overdue += 1;
    } else if (item.status === "warning") {
      counters.warning += 1;
    } else if (item.status === "never") {
      counters.never += 1;
    }
  }
  return counters;
}

/**
 * Build a cheap signature of the maintenance data, used to decide whether a
 * new hass object actually requires a re-render.
 * @param items: the list of items
 * @return a stable string changing only when displayed data changes
 */
export function maintenance_signature(items: MaintenanceItem[]): string {
  return items
    .map(
      (i) =>
        `${i.entity_id}|${i.days_left}|${i.interval_days}|${i.device_name}|${i.last_reset}|${i.notify}|${i.interval_value}`,
    )
    .sort()
    .join(";");
}

/**
 * Tell whether at least one maintenance entity is available.
 * Used by the card to show the "Maintenance" entry in the device selector
 * only when it makes sense.
 * @param hass: the hass states object
 * @return true when at least one maintenance entity exists
 */
export function has_maintenance_entities(hass: HassConfig | null): boolean {
  if (!hass?.states) {
    return false;
  }
  for (const entity_id in hass.states) {
    if (is_maintenance_state(hass.states[entity_id], entity_id)) {
      return true;
    }
  }
  return false;
}
