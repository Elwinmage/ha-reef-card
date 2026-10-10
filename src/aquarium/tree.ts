/**
 * Tree of the Home Assistant devices and entities offered in the scene
 * editor, laid out like the target picker of the automation editor:
 *
 *   Ground floor                      (floor)
 *     └ Utility room                  (area)
 *         └ RSLED-1100000             (device, sub-devices nested)
 *             ├ light.blue            (entity)
 *             └ sensor.white
 *   Garage                            (area without a floor)
 *   Unassigned                        (devices without an area and
 *                                      entities without device nor area)
 *
 * The tree can be limited to a scope: the areas of the aquarium, plus a set
 * of devices kept wherever they are (the Red Sea devices of the cloud
 * aquarium).
 */

import type { HassConfig } from "../types/index";

export interface TreeEntity {
  entity_id: string;
  name: string;
}

export interface TreeDevice {
  id: string;
  name: string;
  model: string;
  domain: string;
  area_id: string | null;
  entities: TreeEntity[];
  children: TreeDevice[];
}

export interface TreeArea {
  /** Area id; "" for the unassigned group. */
  id: string;
  name: string;
  icon: string | null;
  floor_id: string | null;
  devices: TreeDevice[];
  /** Entities without a device, assigned to the area directly. */
  entities: TreeEntity[];
}

export interface TreeFloor {
  id: string;
  name: string;
  icon: string | null;
  level: number | null;
  areas: TreeArea[];
}

export interface Tree {
  floors: TreeFloor[];
  /** Areas without a floor. */
  areas: TreeArea[];
  /** Devices without an area, entities without device nor area. */
  unassigned: TreeArea | null;
}

export interface TreeScope {
  /** Only these areas... */
  areas: Set<string>;
  /** ...plus these devices (and their parents), wherever they are. */
  devices?: Set<string>;
}

export interface TreeOptions {
  /** Limit the tree; null or absent shows everything. */
  scope?: TreeScope | null;
  /** Case-insensitive text matched against names and entity ids. */
  search?: string;
}

/** Where the aquarium stands. */
export interface AquariumPlace {
  area_id: string;
  floor_id: string | null;
}

function device_name(dev: any): string {
  return String(dev?.name_by_user || dev?.name || dev?.id || "");
}

function entity_name(hass: HassConfig, entity_id: string, entry: any): string {
  return String(
    hass.states?.[entity_id]?.attributes?.friendly_name ||
      entry?.name ||
      entity_id,
  );
}

/** Integration domain of a device (first identifier). */
export function device_domain(dev: any): string {
  const ident = dev?.identifiers?.[0];
  return Array.isArray(ident) ? String(ident[0]) : "";
}

/** Icon of a floor: its own, else the one Home Assistant uses by level. */
export function floor_icon(floor: {
  icon?: string | null;
  level?: number | null;
}): string {
  if (floor.icon) return floor.icon;
  const level = floor.level;
  if (level === null || level === undefined) return "mdi:home";
  if (level >= 0 && level <= 3) return `mdi:home-floor-${level}`;
  if (level === -1) return "mdi:home-floor-negative-1";
  return "mdi:home";
}

/**
 * Area of the aquarium: the area of its reeftank device when set, else the
 * area holding most of the given (cloud linked) devices. Null if unknown.
 */
export function aquarium_place(
  hass: HassConfig,
  aquarium_id: string | null | undefined,
  linked: Iterable<string> = [],
): AquariumPlace | null {
  const devices: Record<string, any> = (hass?.devices as any) ?? {};
  const areas: Record<string, any> = (hass?.areas as any) ?? {};
  const place = (area_id: string | null | undefined) =>
    area_id
      ? { area_id, floor_id: (areas[area_id]?.floor_id as string) ?? null }
      : null;

  if (aquarium_id) {
    for (const dev of Object.values(devices)) {
      const own = (dev?.identifiers ?? []).some(
        (i: any) =>
          Array.isArray(i) && i[0] === "reeftank" && i[1] === aquarium_id,
      );
      if (own && dev.area_id) return place(dev.area_id);
    }
  }
  const counts = new Map<string, number>();
  for (const id of linked) {
    const area = devices[id]?.area_id;
    if (area) counts.set(area, (counts.get(area) ?? 0) + 1);
  }
  let best: string | null = null;
  for (const [area, n] of counts) {
    if (best === null || n > counts.get(best)!) best = area;
  }
  return place(best);
}

/** Build the tree. */
export function build_tree(hass: HassConfig, options: TreeOptions = {}): Tree {
  const devices: Record<string, any> = (hass?.devices as any) ?? {};
  const entities: Record<string, any> = (hass?.entities as any) ?? {};
  const areas: Record<string, any> = (hass?.areas as any) ?? {};
  const floors: Record<string, any> = (hass?.floors as any) ?? {};
  const search = (options.search ?? "").trim().toLowerCase();
  const scope = options.scope ?? null;
  const text_match = (...values: string[]) =>
    values.some((v) => v.toLowerCase().includes(search));

  // Entities by device; entities without a device by area
  const by_device = new Map<string, TreeEntity[]>();
  const by_area = new Map<string, TreeEntity[]>();
  for (const entity_id of Object.keys(entities).sort()) {
    const entry = entities[entity_id];
    if (entry?.hidden) continue;
    const item = { entity_id, name: entity_name(hass, entity_id, entry) };
    const key =
      entry?.device_id && devices[entry.device_id] ? entry.device_id : null;
    const map = key ? by_device : by_area;
    const slot = key ?? (areas[entry?.area_id] ? entry.area_id : "");
    const list = map.get(slot) ?? [];
    list.push(item);
    map.set(slot, list);
  }

  const nodes = new Map<string, TreeDevice>();
  for (const id of Object.keys(devices)) {
    const dev = devices[id];
    nodes.set(id, {
      id,
      name: device_name(dev),
      model: String(dev?.model ?? ""),
      domain: device_domain(dev),
      area_id: areas[dev?.area_id] ? dev.area_id : null,
      entities: by_device.get(id) ?? [],
      children: [],
    });
  }

  // Nest sub-devices under their parent: they follow its place
  const roots: TreeDevice[] = [];
  for (const [id, node] of nodes) {
    const parent = devices[id]?.via_device_id;
    if (parent && nodes.has(parent) && parent !== id)
      nodes.get(parent)!.children.push(node);
    else roots.push(node);
  }

  const in_scope_device = (node: TreeDevice): boolean =>
    !scope ||
    (node.area_id !== null && scope.areas.has(node.area_id)) ||
    Boolean(scope.devices?.has(node.id)) ||
    node.children.some(in_scope_device);

  // A device matches the search by itself, an entity or a sub-device
  const matches = (node: TreeDevice): boolean =>
    !search ||
    text_match(node.name, node.model) ||
    node.entities.some((e) => text_match(e.entity_id, e.name)) ||
    node.children.some(matches);

  const by_name = <T extends { name: string }>(list: T[]) =>
    list.sort((a, b) => a.name.localeCompare(b.name));
  for (const node of nodes.values()) by_name(node.children);

  const make_area = (id: string): TreeArea | null => {
    const info = areas[id];
    const name = id ? String(info?.name ?? id) : "";
    const area_match = Boolean(search) && Boolean(id) && text_match(name);
    const area_scoped = !scope || (id !== "" && scope.areas.has(id));
    const devs = by_name(
      roots.filter(
        (n) =>
          (n.area_id ?? "") === id &&
          in_scope_device(n) &&
          (area_match || matches(n)),
      ),
    );
    const loose = area_scoped
      ? (by_area.get(id) ?? []).filter(
          (e) => !search || area_match || text_match(e.entity_id, e.name),
        )
      : [];
    if (!devs.length && !loose.length) return null;
    return {
      id,
      name,
      icon: (info?.icon as string) || null,
      floor_id: (info?.floor_id as string) || null,
      devices: devs,
      entities: loose,
    };
  };

  const tree: Tree = { floors: [], areas: [], unassigned: null };
  const floor_map = new Map<string, TreeFloor>();
  for (const id of Object.keys(areas)) {
    const area = make_area(id);
    if (!area) continue;
    const floor_id =
      area.floor_id && floors[area.floor_id] ? area.floor_id : null;
    if (!floor_id) {
      tree.areas.push(area);
      continue;
    }
    let floor = floor_map.get(floor_id);
    if (!floor) {
      const info = floors[floor_id];
      floor = {
        id: floor_id,
        name: String(info?.name ?? floor_id),
        icon: (info?.icon as string) || null,
        level: typeof info?.level === "number" ? info.level : null,
        areas: [],
      };
      floor_map.set(floor_id, floor);
    }
    floor.areas.push(area);
  }
  tree.floors = [...floor_map.values()].sort(
    (a, b) =>
      (a.level ?? Infinity) - (b.level ?? Infinity) ||
      a.name.localeCompare(b.name),
  );
  for (const floor of tree.floors) by_name(floor.areas);
  by_name(tree.areas);
  tree.unassigned = make_area("");
  return tree;
}

/** True when the tree shows nothing. */
export function tree_empty(tree: Tree): boolean {
  return !tree.floors.length && !tree.areas.length && !tree.unassigned;
}

/** Card element best suited to an entity. */
export function default_element_type(entity_id: string): string {
  const domain = entity_id.split(".")[0];
  if (["switch", "light", "input_boolean", "fan", "siren"].includes(domain))
    return "common-switch";
  return "common-sensor";
}
