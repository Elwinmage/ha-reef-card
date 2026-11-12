/**
 * Entity resolution for the cloud VSON feeder (ha-vson-component).
 *
 * Unlike the ESPHome feeder (found by entity-id suffix), the cloud
 * integration tags every entity with a stable `reef_role` attribute
 * (online, food_shortage, feed, refresh, firmware, schedule), the shared
 * ReefTech contract. Entities are matched by that role, so a renamed entity
 * still resolves.
 */

import type { HassConfig } from "../types/index";

/** Roles the cloud feeder view reads, named by their `reef_role`. */
export type CloudFeederRole =
  "online" | "food_shortage" | "feed" | "refresh" | "firmware" | "schedule";

export const CLOUD_FEEDER_ROLES: CloudFeederRole[] = [
  "online",
  "food_shortage",
  "feed",
  "refresh",
  "firmware",
  "schedule",
];

export type CloudFeederEntities = Partial<Record<CloudFeederRole, string>>;

/**
 * Entity ids of every entity belonging to the given Home Assistant devices.
 * @param hass: the hass object
 * @param device_ids: the device ids behind the card device
 * @return the entity ids
 */
export function device_entity_ids(
  hass: HassConfig | undefined,
  device_ids: string[],
): string[] {
  const registry = hass?.entities;
  if (!registry) return [];
  const wanted = new Set(device_ids);
  const ids: string[] = [];
  for (const entity_id of Object.keys(registry)) {
    const entry = registry[entity_id] as { device_id?: string } | undefined;
    if (entry?.device_id && wanted.has(entry.device_id)) {
      ids.push(entity_id);
    }
  }
  return ids;
}

/**
 * Resolve the feeder entities by their `reef_role`.
 * @param hass: the hass object
 * @param device_ids: the device ids behind the card device
 * @return the entity id found for each role
 */
export function resolve_cloud_feeder_entities(
  hass: HassConfig | undefined,
  device_ids: string[],
): CloudFeederEntities {
  const by_role: CloudFeederEntities = {};
  if (!hass) return by_role;
  for (const entity_id of device_entity_ids(hass, device_ids)) {
    const role = hass.states?.[entity_id]?.attributes?.reef_role as
      CloudFeederRole | undefined;
    if (role && CLOUD_FEEDER_ROLES.includes(role) && !by_role[role]) {
      by_role[role] = entity_id;
    }
  }
  return by_role;
}

/**
 * The entities whose state changes must redraw the view.
 * @param entities: the resolved entities
 * @return their entity ids
 */
export function watched_cloud_entities(
  entities: CloudFeederEntities,
): string[] {
  return Object.values(entities).filter((id): id is string => !!id);
}
