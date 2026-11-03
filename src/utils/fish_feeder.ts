/**
 * VSON fish feeder helpers (hacked feeder running ESPHome).
 *
 * ESPHome entities carry no translation key: the feeder entities are found
 * by the end of their entity id, which ESPHome derives from the entity name
 * the firmware declares ("Manual Feed" -> switch.<device>_manual_feed). The
 * device part changes with the device name, the end does not.
 *
 * Everything here is pure (no Lit, no DOM) so it can be unit tested in
 * isolation.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//

import type { HassConfig } from "../types/index";

import { VSON_FEEDER_MAX_PORTIONS, VSON_FEEDER_SLOTS } from "./constants";

//----------------------------------------------------------------------------//

/** Entities of the firmware the view reads, by role. */
export type FeederRole =
  | "feed" // switch: runs the motor for one portion
  | "trap" // binary_sensor (door): the trap is open
  | "food_low" // binary_sensor (problem): the reserve is (nearly) empty
  | "uptime" // sensor: uptime of the controller, in seconds
  | "restart"; // switch: restarts the controller

/** Domain and end of the entity id of each role. */
export const FEEDER_ROLE_IDS: Record<FeederRole, [string, string]> = {
  feed: ["switch", "manual_feed"],
  trap: ["binary_sensor", "open_close_sensor"],
  food_low: ["binary_sensor", "food_level_sensor"],
  uptime: ["sensor", "system_uptime"],
  restart: ["switch", "system_restart"],
};

/** Entities of one feeding slot. */
export interface FeederSlotEntities {
  /** `time` entity holding the hour of the slot */
  time?: string;
  /** `number` entity holding the portions given at that hour */
  portions?: string;
}

/** Entities of the feeder, found on its device. */
export interface FeederEntities {
  roles: Partial<Record<FeederRole, string>>;
  /** One entry per slot, in order (slot 1 first) */
  slots: FeederSlotEntities[];
}

/** State of one feeding slot. */
export interface FeederSlot {
  /** 1-based number of the slot */
  index: number;
  time_entity?: string;
  portions_entity?: string;
  /** Minutes since midnight, null while unknown */
  minutes: number | null;
  /** Portions given at that hour (0: slot off) */
  portions: number;
  /** True when the slot will feed: known hour and at least one portion */
  active: boolean;
  /** True when one of its entities cannot be read */
  unavailable: boolean;
}

/** The next feeding to come. */
export interface NextFeeding {
  slot: FeederSlot;
  /** Minutes from now (0 to 1439) */
  in_minutes: number;
}

/**
 * Tell whether an entity id is the one of a role: same domain, and an
 * object id equal to the end, or ending with "_" + end.
 * @param entity_id: the entity id
 * @param domain: the domain of the role
 * @param end: the end of the object id
 * @return true when it matches
 */
export function entity_matches(
  entity_id: string,
  domain: string,
  end: string,
): boolean {
  const dot = entity_id.indexOf(".");
  if (dot < 0 || entity_id.slice(0, dot) !== domain) return false;
  const object_id = entity_id.slice(dot + 1);
  return object_id === end || object_id.endsWith("_" + end);
}

/**
 * Find the feeder entities among the ones of its device(s).
 * @param hass: the hass object
 * @param device_ids: the hass device ids of the feeder
 * @return the entities found, by role and by slot
 */
export function resolve_feeder_entities(
  hass: HassConfig | null | undefined,
  device_ids: string[],
): FeederEntities {
  const found: FeederEntities = {
    roles: {},
    slots: Array.from({ length: VSON_FEEDER_SLOTS }, () => ({})),
  };
  const registry: Record<string, any> = (hass?.entities as any) ?? {};
  const ids = Object.keys(registry)
    .filter((entity_id) => device_ids.includes(registry[entity_id]?.device_id))
    // Stable order, shortest first, so the pick does not depend on the
    // order of the registry
    .sort((a, b) => a.length - b.length || a.localeCompare(b));

  for (const entity_id of ids) {
    for (const role of Object.keys(FEEDER_ROLE_IDS) as FeederRole[]) {
      const [domain, end] = FEEDER_ROLE_IDS[role];
      if (!found.roles[role] && entity_matches(entity_id, domain, end)) {
        found.roles[role] = entity_id;
      }
    }
    for (let pos = 0; pos < VSON_FEEDER_SLOTS; pos++) {
      const slot = found.slots[pos] as FeederSlotEntities;
      const n = pos + 1;
      if (!slot.time && entity_matches(entity_id, "time", `slot_${n}`)) {
        slot.time = entity_id;
      }
      if (
        !slot.portions &&
        entity_matches(entity_id, "number", `portion_slot_${n}`)
      ) {
        slot.portions = entity_id;
      }
    }
  }
  return found;
}

/**
 * Entity ids the view reads, to tell when it has to be drawn again.
 * @param entities: the feeder entities
 * @return every entity id found
 */
export function watched_entities(entities: FeederEntities): string[] {
  const ids: string[] = Object.values(entities.roles).filter(
    (id): id is string => !!id,
  );
  for (const slot of entities.slots) {
    if (slot.time) ids.push(slot.time);
    if (slot.portions) ids.push(slot.portions);
  }
  return ids;
}

/**
 * Parse the state of a `time` entity.
 * @param state: "HH:MM" or "HH:MM:SS"
 * @return minutes since midnight, or null when it is not a time
 */
export function parse_time(state: unknown): number | null {
  if (typeof state !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(state.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Format minutes since midnight as "HH:MM".
 * @param minutes: minutes since midnight
 * @return the time
 */
export function format_time(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return (
    String(Math.floor(m / 60)).padStart(2, "0") +
    ":" +
    String(m % 60).padStart(2, "0")
  );
}

/**
 * Value the `time.set_value` action expects.
 * @param hhmm: "HH:MM" as an <input type="time"> gives it
 * @return "HH:MM:00", or null when it is not a time
 */
export function time_value(hhmm: string): string | null {
  const minutes = parse_time(hhmm);
  return minutes === null ? null : format_time(minutes) + ":00";
}

/**
 * Clamp a number of portions to what the firmware accepts.
 * @param value: the wanted number of portions
 * @return an integer between 0 and VSON_FEEDER_MAX_PORTIONS
 */
export function clamp_portions(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(VSON_FEEDER_MAX_PORTIONS, Math.max(0, Math.round(value)));
}

/** States Home Assistant gives an entity it cannot read. */
const UNAVAILABLE = ["unavailable", "unknown"];

/**
 * State of the feeding slots.
 * @param hass: the hass object
 * @param entities: the feeder entities
 * @return one entry per slot, in order
 */
export function feeder_slots(
  hass: HassConfig | null | undefined,
  entities: FeederEntities,
): FeederSlot[] {
  return entities.slots.map((slot, pos) => {
    const time_state = slot.time ? hass?.states?.[slot.time]?.state : undefined;
    const portions_state = slot.portions
      ? hass?.states?.[slot.portions]?.state
      : undefined;
    const minutes = parse_time(time_state);
    const raw = Number(portions_state);
    const portions = Number.isFinite(raw) ? clamp_portions(raw) : 0;
    const unavailable =
      !slot.time ||
      !slot.portions ||
      time_state === undefined ||
      portions_state === undefined ||
      UNAVAILABLE.includes(String(time_state)) ||
      UNAVAILABLE.includes(String(portions_state));
    return {
      index: pos + 1,
      time_entity: slot.time,
      portions_entity: slot.portions,
      minutes,
      portions,
      active: !unavailable && minutes !== null && portions > 0,
      unavailable,
    };
  });
}

/**
 * Next feeding to come, today or tomorrow.
 *
 * A slot due this very minute is the next one (the firmware fires at the
 * start of the minute and keeps feeding for a while).
 * @param slots: the feeding slots
 * @param now: the current time
 * @return the next feeding, or null when no slot is active
 */
export function next_feeding(
  slots: FeederSlot[],
  now: Date,
): NextFeeding | null {
  const current = now.getHours() * 60 + now.getMinutes();
  let best: NextFeeding | null = null;
  for (const slot of slots) {
    if (!slot.active || slot.minutes === null) continue;
    const in_minutes = (slot.minutes - current + 1440) % 1440;
    if (
      best === null ||
      in_minutes < best.in_minutes ||
      (in_minutes === best.in_minutes && slot.index < best.slot.index)
    ) {
      best = { slot, in_minutes };
    }
  }
  return best;
}

/**
 * Portions given in a day.
 *
 * Two slots set to the same minute feed only once: the firmware skips a
 * slot while another one is still feeding.
 * @param slots: the feeding slots
 * @return the number of portions
 */
export function daily_portions(slots: FeederSlot[]): number {
  const by_minute = new Map<number, number>();
  for (const slot of slots) {
    if (!slot.active || slot.minutes === null) continue;
    if (!by_minute.has(slot.minutes)) {
      by_minute.set(slot.minutes, slot.portions);
    }
  }
  let total = 0;
  for (const portions of by_minute.values()) total += portions;
  return total;
}

/**
 * Slots set to the same minute as an earlier active slot: the firmware
 * skips them (see daily_portions()).
 * @param slots: the feeding slots
 * @return the 1-based numbers of the slots that never feed
 */
export function shadowed_slots(slots: FeederSlot[]): number[] {
  const seen = new Set<number>();
  const shadowed: number[] = [];
  for (const slot of slots) {
    if (!slot.active || slot.minutes === null) continue;
    if (seen.has(slot.minutes)) shadowed.push(slot.index);
    else seen.add(slot.minutes);
  }
  return shadowed;
}

/**
 * Split a delay in hours and minutes.
 * @param minutes: the delay
 * @return whole hours, and the minutes left
 */
export function split_delay(minutes: number): { h: number; m: number } {
  const total = Math.max(0, Math.round(minutes));
  return { h: Math.floor(total / 60), m: total % 60 };
}

/**
 * Split an uptime in days, hours and minutes.
 * @param state: the state of the uptime sensor, in seconds
 * @return the parts, or null when the state is not a number of seconds
 */
export function split_uptime(
  state: unknown,
): { d: number; h: number; m: number } | null {
  const seconds = Number(state);
  if (state === null || state === "" || !Number.isFinite(seconds)) {
    return null;
  }
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  return {
    d: Math.floor(minutes / 1440),
    h: Math.floor((minutes % 1440) / 60),
    m: minutes % 60,
  };
}

/**
 * Values the user has just set, not yet reported back by the feeder: the
 * portions of a `number` entity, or the minutes since midnight of a `time`
 * entity, by entity id.
 */
export type PendingValues = Record<string, number>;

/**
 * Show the values the user has just set in place of the reported ones, so
 * the view answers at once instead of waiting for the round trip to the
 * feeder.
 * @param slots: the slots, as reported
 * @param pending: the values set and not reported back yet
 * @return the slots as they will be
 */
export function apply_pending(
  slots: FeederSlot[],
  pending: PendingValues,
): FeederSlot[] {
  return slots.map((slot) => {
    const portions =
      slot.portions_entity !== undefined && slot.portions_entity in pending
        ? (pending[slot.portions_entity] as number)
        : slot.portions;
    const minutes =
      slot.time_entity !== undefined && slot.time_entity in pending
        ? (pending[slot.time_entity] as number)
        : slot.minutes;
    if (portions === slot.portions && minutes === slot.minutes) return slot;
    return {
      ...slot,
      portions,
      minutes,
      active: !slot.unavailable && minutes !== null && portions > 0,
    };
  });
}

/**
 * Tell whether the feeder reports a value the user has set.
 * @param hass: the hass object
 * @param entity_id: the `number` or `time` entity
 * @param value: the portions or the minutes since midnight that were set
 * @return true once the state of the entity holds that value
 */
export function pending_settled(
  hass: HassConfig | null | undefined,
  entity_id: string,
  value: number,
): boolean {
  const state = hass?.states?.[entity_id]?.state;
  if (entity_id.startsWith("time.")) return parse_time(state) === value;
  return state !== undefined && state !== "" && Number(state) === value;
}
