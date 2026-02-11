export function isObject(item: unknown): item is Record<string, any> {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}

export function mergeDeep<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(
          target[key] as Record<string, any>,
          source[key] as Record<string, any>,
        );
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export function merge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  return mergeDeep(structuredClone(target), source);
}
