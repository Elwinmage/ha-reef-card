/**
 * Content of the `maintenance_tasks` dialog (see device.dialogs.ts).
 *
 * The dialog shows the maintenance overview restricted to the device it was
 * opened from. The overview is a Lit element of its own, with its sort,
 * filters and interval editor: it is built once when the dialog opens, then
 * only handed the new hass on every update (`re_render: true` on the extend
 * view), so an open interval editor or a sort choice survives state changes.
 */

import { RSDevice } from "../../device";
import { MAINTENANCE_TAG } from "../../../utils/constants";

/** Id of the wrapper holding the overview inside #dialog-content. */
const WRAPPER_ID = "device-maintenance";

/**
 * Fill the maintenance_tasks dialog with the tasks of the device.
 *
 * Called once when the dialog opens, then on every hass update.
 * @param elt: the element that opened the dialog (the maintenance shortcut)
 * @param hass: the current Home Assistant object
 * @param shadowRoot: the dialog shadow root
 * @return nothing
 */
export function maintenance_tasks(elt: any, hass: any, shadowRoot: any): void {
  const device = elt?.device;
  const container = shadowRoot?.querySelector("#dialog-content");
  if (!device || !container) return;

  const previous = shadowRoot.querySelector("#" + WRAPPER_ID);
  if (previous) {
    // Already built: keep the DOM, just push the fresh hass down.
    if (previous.view) previous.view.hass = hass;
    return;
  }

  // An empty filter means "every device" for the overview: never open it
  // unrestricted from a device that could not be identified.
  const devices: string[] = device.maintenance_device_ids?.() ?? [];
  if (devices.length === 0) return;

  const view: any = RSDevice.create_device(
    MAINTENANCE_TAG,
    hass,
    {
      maintenance: {
        // The user's display options (warning ratio, buttons shown, hidden
        // tasks) apply here too; only the device filter is forced.
        ...(device.user_config?.maintenance ?? {}),
        devices,
        sort: "device",
      },
    },
    { name: "", elements: [] } as any,
  );
  if (!view) return;
  view.embedded = true;

  const wrapper: any = document.createElement("div");
  wrapper.id = WRAPPER_ID;
  wrapper.view = view;
  wrapper.appendChild(view);
  container.appendChild(wrapper);
}
