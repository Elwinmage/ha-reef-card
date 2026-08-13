/**
 * Global constants used across the application
 */

/**
 * Color used when device/element is OFF or disabled
 * RGB format: "R,G,B"
 */
export const OFF_COLOR = "150,150,150";

/**
 * Default alpha (opacity) value for colors
 */
export const DEFAULT_ALPHA = 0.5;

// ─── Maintenance overview ─────────────────────────────────────────────────────

/**
 * Virtual device id used to select the maintenance overview in the card.
 * It is deliberately language independent so a stored configuration keeps
 * working when the user switches the Home Assistant language.
 */
export const MAINTENANCE_DEVICE_ID = "__maintenance__";

/**
 * Custom element tag of the maintenance overview.
 */
export const MAINTENANCE_TAG = "redsea-maintenance";

/**
 * Prefix of the `reef_role` attribute exposed by ha-reefbeat-component on
 * maintenance button entities (see maintenance.py ROLE_PREFIX).
 */
export const MAINTENANCE_ROLE_PREFIX = "maint_";

/**
 * Suffix of the `reef_role` carried by the per-task notification switch
 * (see MaintenanceNotifySwitchEntity in the integration).
 */
export const MAINTENANCE_NOTIFY_SUFFIX = "_notify";

/**
 * Infix of the `reef_role` carried by the per-task interval number
 * ("maint_<task>_interval_<unit>", see MaintenanceIntervalNumberEntity).
 * The display unit is whatever follows it.
 */
export const MAINTENANCE_INTERVAL_INFIX = "_interval_";

/**
 * Fraction of the interval below which a task is displayed as "due soon".
 */
export const MAINTENANCE_WARNING_RATIO = 0.2;
