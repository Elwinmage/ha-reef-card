/**
 * Default configuration of the maintenance overview.
 *
 * User overrides are read from the top level `maintenance` key of the card
 * configuration (see maintenance.ts `_read_options`), e.g.
 *
 *   type: custom:reef-card
 *   device: __maintenance__
 *   maintenance:
 *     sort: due          # "device" (default) or "due"
 *     hide_ok: false     # hide tasks that are neither overdue nor due soon
 *     hide_muted: false  # hide tasks whose notifications are turned off
 *     warning_ratio: 0.2 # last 20% of the interval switches to orange
 *     show_reset: true   # show the "mark as done" button on each row
 *     show_notify: true  # show the mute/unmute bell on each row
 *     show_interval: true # show the interval editor button on each row
 */

import type { MaintenanceSort } from "../../../types/index";

export interface MaintenanceViewOptions {
  sort: MaintenanceSort;
  hide_ok: boolean;
  hide_muted: boolean;
  warning_ratio: number;
  show_reset: boolean;
  show_notify: boolean;
  show_interval: boolean;
}

export const config = {
  name: "",
  model: "MAINTENANCE",
  color: "197,91,90",
  alpha: 1,
  elements: {},
};

export const default_options: MaintenanceViewOptions = {
  sort: "device",
  hide_ok: false,
  // Muted tasks stay visible by default: silencing an alert should not
  // make the deadline disappear from the overview.
  hide_muted: false,
  warning_ratio: 0.2,
  show_reset: true,
  show_notify: true,
  show_interval: true,
};
