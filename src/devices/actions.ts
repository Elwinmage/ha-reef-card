import * as dose_head_dialog_func_ext from "./rsdose/dose_head.dialog_func_ext";

export const actionRegistry: Record<
  string,
  Record<string, (...args: unknown[]) => unknown>
> = {
  dose_head_dialog_func_ext,
};

export function run_action(module: string, fname: string, ...args: any[]) {
  const fn = actionRegistry[module]?.[fname];

  if (typeof fn !== "function") {
    console.warn(`Action ${module}.${fname} introuvable`);
    return;
  }

  return fn(...args);
}
