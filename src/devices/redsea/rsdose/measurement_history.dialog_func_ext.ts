/**
 * Content of the `regulation_history` dialog (see regulation.dialogs.ts).
 *
 * The test results of the head the dialog was opened from, to add one at a
 * past date, correct or delete one. A Lit element of its own: built once when
 * the dialog opens, then only handed the new hass (`re_render: true`), so a
 * correction being typed survives state updates.
 */

import "../../../base/measurement_history";
import type { ReefMeasurementHistory } from "../../../base/measurement_history";

/** Id of the history element inside #dialog-content. */
const VIEW_ID = "regulation-measurement-history";

/** Sensor of the head listing its test results. */
export const LAST_MEASUREMENT = "regulation_last_measurement";

/**
 * Fill the regulation_history dialog with the results of the head.
 *
 * @param elt: the element that opened the dialog (a button of the head)
 * @param hass: the current Home Assistant object
 * @param shadowRoot: the dialog shadow root
 */
export function measurement_history(
  elt: any,
  hass: any,
  shadowRoot: any,
): void {
  const device = elt?.device;
  const container = shadowRoot?.querySelector("#dialog-content");
  if (!device || !container) return;

  const previous = shadowRoot.querySelector(
    "#" + VIEW_ID,
  ) as ReefMeasurementHistory | null;
  if (previous) {
    previous.hass = hass;
    return;
  }
  const entity_id = device.get_entity?.(LAST_MEASUREMENT)?.entity_id;
  if (!entity_id) return;
  const view = document.createElement(
    "reef-measurement-history",
  ) as ReefMeasurementHistory;
  view.id = VIEW_ID;
  view.entity_id = entity_id;
  view.hass = hass;
  container.appendChild(view);
}
