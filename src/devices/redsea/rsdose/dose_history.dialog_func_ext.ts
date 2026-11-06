/**
 * Content of the `dose_history` dialog (see rsdose.dialogs.ts).
 *
 * The history of the doses of the head the dialog was opened from. A Lit
 * element of its own: built once when the dialog opens, then only handed the
 * new hass on every update (`re_render: true` on the extend view), so the
 * chosen period survives state changes.
 */

import "../../../base/dose_history";
import type { RSDoseHistory } from "../../../base/dose_history";

/** Id of the history element inside #dialog-content. */
const VIEW_ID = "dose-head-history";

/**
 * Fill the dose_history dialog with the doses of the head.
 *
 * Called once when the dialog opens, then on every hass update.
 * @param elt: the element that opened the dialog (a button of the head)
 * @param hass: the current Home Assistant object
 * @param shadowRoot: the dialog shadow root
 * @return nothing
 */
export function dose_history(elt: any, hass: any, shadowRoot: any): void {
  const device = elt?.device;
  const container = shadowRoot?.querySelector("#dialog-content");
  if (!device || !container) return;

  const previous = shadowRoot.querySelector(
    "#" + VIEW_ID,
  ) as RSDoseHistory | null;
  if (previous) {
    previous.hass = hass;
    return;
  }

  const view = document.createElement("redsea-dose-history") as RSDoseHistory;
  view.id = VIEW_ID;
  view.device = device;
  view.head = Number(device?.config?.id ?? 0);
  view.hass = hass;
  container.appendChild(view);
}
