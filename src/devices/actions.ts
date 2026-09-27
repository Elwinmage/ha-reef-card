/**
 * Specific dialog box action registery
 */

import * as dose_head_dialog_func_ext from "./redsea/rsdose/dose_head.dialog_func_ext";
import * as rsrun_pump_dialog_func_ext from "./redsea/rsrun/rsrun_pump.dialog_func_ext";
import {
  probe_calibration_ec,
  probe_calibration_ph,
} from "./redsea/rscontrol/rscontrol.dialog_func_ext";

export const actionRegistry: Record<
  string,
  Record<string, (...args: unknown[]) => unknown>
> = {
  dose_head_dialog_func_ext,
  rsrun_pump_dialog_func_ext,
  // Only the dialog builders: the module also exports its helpers
  rscontrol_dialog_func_ext: { probe_calibration_ec, probe_calibration_ph },
};

export function run_action(module: string, fname: string, ...args: any[]) {
  const fn = actionRegistry[module]?.[fname];

  if (typeof fn !== "function") {
    console.warn(`Action ${module}.${fname} introuvable`);
    return;
  }

  return fn(...args);
}
