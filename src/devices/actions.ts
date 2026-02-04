import * as dose_head_dialog from "./dose_head.dialog";

export const actionRegistry: Record<string, Record<string, Function>> = {
  dose_head_dialog,
};

export function run_action(module: string, fname: string, ...args: any[]) {
  const fn = actionRegistry[module]?.[fname];

  if (typeof fn !== "function") {
    console.warn(`Action ${module}.${fname} introuvable`);
    return;
  }

  return fn(...args);
}
