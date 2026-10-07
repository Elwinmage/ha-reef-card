/**
 * Time-slot program of an Aqua Medic pump: pure helpers.
 *
 * ha-aquamedic-component decodes the 48 `AutoTimeNN` datapoints of a pump
 * into the `schedule` attribute of its `schedule` sensor, one entry per
 * programmed slot:
 *
 *   { slot: 0, start: 480, end: 720, mode: "auto", value: 60 }
 *
 * `start` / `end` are minutes since midnight. A SmartDrift slot also carries
 * `frequency` (%) and `tide` (true: tide, false: pulse). The pump follows the
 * program while its timer switch is on; outside every slot it keeps its
 * manual setting.
 *
 * Nothing here touches the DOM, so the rules the editor enforces are the
 * ones the integration applies again when the program is written.
 */

export const MINUTES_PER_DAY = 24 * 60;

/** Last minute a slot may end on: the firmware stores hour and minute. */
export const MAX_MINUTE = MINUTES_PER_DAY - 1;

/** Slots a pump can hold when the sensor does not say. */
export const DEFAULT_MAX_SLOTS = 48;

export const MODE_STOP = "stop";
export const MODE_FEEDING = "feeding";

/** Longest feeding pause the firmware accepts, in minutes. */
export const MAX_FEED_MINUTES = 60;

/** One slot of the program. */
export interface AMSlot {
  start: number;
  end: number;
  mode: string;
  value: number;
  frequency?: number;
  tide?: boolean;
}

/** What a pump accepts, as published by its schedule sensor. */
export interface AMProgramRules {
  /** Modes in wire order; the first one is always "stop" */
  modes: string[];
  /** Lowest speed of a running slot (30 on the DC Runner series) */
  min_value: number;
  /** Whether a slot carries a frequency and a pulse/tide choice */
  has_frequency: boolean;
  max_slots: number;
}

/** Colour of a stop, and of any mode this card does not know. */
const STOP_COLOR = "120,120,120";

/** Colour of each mode on the graph, as "R,G,B". */
const MODE_COLORS: Record<string, string> = {
  stop: STOP_COLOR,
  auto: "0,150,255",
  feeding: "240,150,30",
  classic_wave: "0,150,255",
  sine_wave: "0,190,170",
  random_wave: "150,110,230",
  constant_flow: "60,110,220",
};

/**
 * Colour of a mode on the graph.
 * @param mode: the slot mode
 * @return an "R,G,B" triplet, grey for an unknown mode
 */
export function mode_color(mode: string): string {
  return MODE_COLORS[mode] ?? STOP_COLOR;
}

/**
 * Whether the pump pushes water during a slot of that mode.
 * @param mode: the slot mode
 * @return false for a stop or a feeding pause
 */
export function is_running_mode(mode: string): boolean {
  return mode !== MODE_STOP && mode !== MODE_FEEDING;
}

/**
 * Read the rules of a pump from the attributes of its schedule sensor.
 * @param attributes: the attributes of the schedule sensor
 * @return the rules, with DC Runner defaults for anything missing
 */
export function program_rules(
  attributes: Record<string, any> | undefined,
): AMProgramRules {
  const modes = Array.isArray(attributes?.modes)
    ? attributes.modes.map(String)
    : [MODE_STOP, "auto", MODE_FEEDING];
  const min_value = Number(attributes?.min_value);
  const max_slots = Number(attributes?.max_slots);
  return {
    modes,
    min_value: Number.isFinite(min_value) ? min_value : 0,
    has_frequency: attributes?.kind === "drift",
    max_slots:
      Number.isFinite(max_slots) && max_slots > 0
        ? max_slots
        : DEFAULT_MAX_SLOTS,
  };
}

/**
 * Normalise the `schedule` attribute into a sorted list of slots.
 * @param raw: the attribute value, of any shape
 * @return the usable slots, by start time (empty when there is none)
 */
export function normalize_schedule(raw: unknown): AMSlot[] {
  if (!Array.isArray(raw)) return [];
  const slots: AMSlot[] = [];
  for (const entry of raw) {
    const start = Number(entry?.start);
    const end = Number(entry?.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      continue;
    }
    const slot: AMSlot = {
      start,
      end,
      mode: String(entry.mode ?? MODE_STOP),
      value: Number(entry.value) || 0,
    };
    if (entry.frequency !== undefined) {
      slot.frequency = Number(entry.frequency) || 0;
    }
    if (entry.tide !== undefined) slot.tide = entry.tide === true;
    slots.push(slot);
  }
  slots.sort((a, b) => a.start - b.start);
  return slots;
}

/**
 * The slot running at a given time.
 * @param slots: the program
 * @param minute: minutes since midnight
 * @return its index, -1 between two slots
 */
export function current_index(slots: AMSlot[], minute: number): number {
  return slots.findIndex((s) => s.start <= minute && minute < s.end);
}

/**
 * Format minutes since midnight as HH:MM.
 * @param minutes: minutes since midnight
 * @return the time, for an <input type="time">
 */
export function hhmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Read an HH:MM time.
 * @param text: the value of an <input type="time">
 * @return minutes since midnight, or null when it is not a time
 */
export function parse_hhmm(text: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(text ?? "").trim());
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes <= MAX_MINUTE ? minutes : null;
}

/** A problem found in a program: a translation key and its parameters. */
export interface AMProgramError {
  key: string;
  params: Record<string, string | number>;
}

/**
 * Check a program against the rules of the pump.
 *
 * Slots are numbered from 1 in the order given, which is the order the
 * editor lists them in.
 * @param slots: the program being edited
 * @param rules: what the pump accepts
 * @return the first problem, or null when the program can be written
 */
export function check_program(
  slots: AMSlot[],
  rules: AMProgramRules,
): AMProgramError | null {
  if (slots.length > rules.max_slots) {
    return { key: "am_sched_err_too_many", params: { max: rules.max_slots } };
  }
  for (const [i, slot] of slots.entries()) {
    const n = i + 1;
    if (slot.end <= slot.start) {
      return { key: "sched_err_end_before_start", params: { n } };
    }
    if (slot.mode === MODE_FEEDING) {
      if (slot.value < 1 || slot.value > MAX_FEED_MINUTES) {
        return {
          key: "am_sched_err_feed",
          params: { n, max: MAX_FEED_MINUTES },
        };
      }
    } else if (
      is_running_mode(slot.mode) &&
      (slot.value < rules.min_value || slot.value > 100)
    ) {
      return {
        key: "am_sched_err_value",
        params: { n, min: rules.min_value },
      };
    }
    if (
      rules.has_frequency &&
      ((slot.frequency ?? 0) < 0 || (slot.frequency ?? 0) > 100)
    ) {
      return { key: "am_sched_err_frequency", params: { n } };
    }
  }
  // Overlaps are looked for in time order, but reported with the numbers
  // the editor shows.
  const order = slots
    .map((slot, i) => ({ slot, n: i + 1 }))
    .sort((a, b) => a.slot.start - b.slot.start);
  let previous: (typeof order)[number] | null = null;
  for (const current of order) {
    if (previous && current.slot.start < previous.slot.end) {
      return {
        key: "sched_err_overlap",
        params: { n: current.n, prev: previous.n },
      };
    }
    previous = current;
  }
  return null;
}

/**
 * First free window of the day at or after a given minute.
 * @param slots: the program, in any order
 * @param from: the minute to look from
 * @return its [start, end], or null when the rest of the day is taken
 */
function free_window(slots: AMSlot[], from: number): [number, number] | null {
  const sorted = [...slots].sort((a, b) => a.start - b.start);
  let start = from;
  for (const slot of sorted) {
    if (slot.end <= start) continue;
    if (slot.start > start) return [start, slot.start];
    start = slot.end;
  }
  return start < MAX_MINUTE ? [start, MAX_MINUTE] : null;
}

/**
 * A new slot, an hour long when there is room: after the last slot, else in
 * the first gap left in the day.
 * @param slots: the program being edited
 * @param rules: what the pump accepts
 * @return the slot, or null when the day is full
 */
export function next_slot(
  slots: AMSlot[],
  rules: AMProgramRules,
): AMSlot | null {
  const last_end = slots.reduce((end, s) => Math.max(end, s.end), 0);
  const free = free_window(slots, last_end) ?? free_window(slots, 0);
  if (!free) return null;
  const mode = rules.modes.find(is_running_mode) ?? MODE_STOP;
  const slot: AMSlot = {
    start: free[0],
    end: Math.min(free[0] + 60, free[1]),
    mode,
    value: Math.max(rules.min_value, 50),
  };
  if (rules.has_frequency) {
    slot.frequency = 50;
    slot.tide = false;
  }
  return slot;
}

/**
 * Bring the value of a slot back inside what its mode accepts, so switching
 * a slot from a speed to a feeding pause (or back) never leaves a value the
 * pump would refuse.
 * @param slot: the slot, changed in place
 * @param rules: what the pump accepts
 * @return the same slot
 */
export function clamp_slot(slot: AMSlot, rules: AMProgramRules): AMSlot {
  if (slot.mode === MODE_STOP) {
    slot.value = 0;
  } else if (slot.mode === MODE_FEEDING) {
    slot.value = Math.min(Math.max(slot.value, 1), MAX_FEED_MINUTES);
  } else {
    slot.value = Math.min(Math.max(slot.value, rules.min_value), 100);
  }
  return slot;
}

/**
 * The slots as the `aquamedic.set_schedule` service expects them.
 * @param slots: the program being edited
 * @param rules: what the pump accepts
 * @return the service payload, in time order
 */
export function service_slots(
  slots: AMSlot[],
  rules: AMProgramRules,
): Record<string, any>[] {
  return [...slots]
    .sort((a, b) => a.start - b.start)
    .map((slot) => {
      const out: Record<string, any> = {
        start: slot.start,
        end: slot.end,
        mode: slot.mode,
        value: slot.value,
      };
      if (rules.has_frequency) {
        out.frequency = slot.frequency ?? 0;
        out.tide = slot.tide === true;
      }
      return out;
    });
}
