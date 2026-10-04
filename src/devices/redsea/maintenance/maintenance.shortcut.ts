/**
 * Maintenance shortcut of a device.
 *
 * A `mdi:wrench-clock` icon every device mapping places on its own picture.
 * A click opens the `maintenance_tasks` dialog (see device.dialogs.ts): the
 * maintenance overview restricted to that device and its sub-devices.
 *
 * The icon tells how urgent the maintenance is: its usual colour while every
 * task is on time, orange once one is due soon, red and blinking once one is
 * overdue (tasks whose alerts are muted do not count).
 *
 * The icon hides itself on a device without any maintenance task (older
 * integration, nothing in the catalogue for that model), so a mapping can
 * declare it unconditionally.
 */
import { COLOR_ERROR_HEX, COLOR_ORANGE_HEX } from "../../../utils/colors";

/** Key of the shortcut in the `elements` of a mapping. */
export const MAINTENANCE_SHORTCUT = "maintenance_tasks";

/**
 * Mapping entry of the maintenance shortcut.
 * @param css: where the mapping puts the icon on its picture
 * @param icon_color: colour of the icon while no task calls for attention,
 *                    the one of the settings cog by default
 * @return the element configuration
 */
export function maintenance_shortcut(
  css: Record<string, string>,
  icon_color: string = COLOR_ERROR_HEX,
) {
  return {
    name: MAINTENANCE_SHORTCUT,
    type: "click-image",
    // No entity behind it: the tasks are looked up when the dialog opens
    stateObj: null,
    icon: "mdi:wrench-clock",
    // Follows the worst task of the device: orange when one is due soon,
    // red when one is overdue
    icon_color:
      "${device.maintenance_status() === 'overdue' ? '" +
      COLOR_ERROR_HEX +
      "' : (device.maintenance_status() === 'warning' ? '" +
      COLOR_ORANGE_HEX +
      "' : '" +
      icon_color +
      "')}",
    // An overdue task makes the icon blink
    class: "${device.maintenance_status() === 'overdue' ? 'blink' : ''}",
    // Maintenance is mostly done on a device that is switched off
    off_clickable: true,
    disabled_if: "!device.has_maintenance_tasks()",
    // Absolutely positioned: never emit a <br> that shifts the flow
    no_br_if_disabled: true,
    tap_action: {
      domain: "redsea_ui",
      action: "dialog",
      data: { type: MAINTENANCE_SHORTCUT },
    },
    css,
  };
}
