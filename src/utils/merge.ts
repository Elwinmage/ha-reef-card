/**
 * Deep merge js objects
 */

/**
 * Test if an item is an object and alos if this object is not an array
 * @param item: the js object to check
 */
export function isObject(item: unknown): item is Record<string, any> {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}

/**
 * Recursive merging fonction on js objects
 */
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

/**
 * Deep merge of two json data
 * @param target: the js object to merge data in
 * @param source: the js data to add to target
 * @return the merged object. target is not changed
 */
export function merge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  return mergeDeep(structuredClone(target), source);
}
