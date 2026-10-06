/**
 * ReefWave day program: parsing and pure helpers.
 *
 * The integration exposes the /auto program of the pump as the `schedule`
 * attribute of the `wave_type` sensor: a list of intervals, each starting at
 * `st` (minute of the day) and running until the next one, or midnight.
 *
 *   { st, wave_uid, name, type, direction, frt, rrt, fti, rti, sn, pd, sync }
 *
 *   - type      nw (no wave), ra (random), re (regular), st (step),
 *               su (surface), un (uniform)
 *   - direction fw (forward), rw (reverse), alt (alternate)
 *   - fti / rti forward / reverse intensity, in %
 *   - frt / rrt forward / reverse time, in minutes
 *   - sn        number of steps (step waves)
 *   - pd        pulse duration
 *
 * Nothing here touches the DOM: the graph, the program view and the device
 * all build on these helpers.
 */

/** Minutes in a day: the program wraps at midnight. */
export const MINUTES_PER_DAY = 24 * 60;

/** Wave types, in the order the app lists them. */
export const WAVE_TYPES = ["nw", "ra", "re", "st", "su", "un"] as const;

/** Wave directions. */
export const WAVE_DIRECTIONS = ["fw", "rw", "alt"] as const;

/**
 * Colour of each wave type, as an "r,g,b" triplet. Picked to stay readable
 * on light and dark themes, and distinct from the "now" red.
 */
export const WAVE_TYPE_COLORS: Record<string, string> = {
  nw: "150,150,150",
  ra: "155,89,182",
  re: "52,152,219",
  st: "26,188,156",
  su: "241,196,15",
  un: "46,204,113",
};

/** Colour of a type the table above does not know. */
export const WAVE_UNKNOWN_COLOR = "120,144,156";

/** One interval of the day program, normalised. */
export interface WaveInterval {
  /** Start, in minutes from midnight */
  start: number;
  /** End, in minutes from midnight (the next start, or 1440) */
  end: number;
  /** Library wave the interval uses ("" when unknown) */
  uid: string;
  name: string;
  type: string;
  direction: string;
  /** Forward intensity, % */
  fti: number;
  /** Reverse intensity, % */
  rti: number;
  /** Forward time */
  frt: number;
  /** Reverse time */
  rrt: number;
  /** Steps */
  sn: number;
  /** Pulse duration */
  pd: number;
  /** Synchronised with the other pumps of the group */
  sync: boolean;
}

/**
 * Read a number, defaulting when absent or not a number.
 * @param value: the raw value
 * @param fallback: what an unusable value reads as
 */
function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return value === null || value === "" || !Number.isFinite(n) ? fallback : n;
}

/**
 * Clamp a percentage to 0..100.
 * @param value: the raw value
 */
export function pct(value: unknown): number {
  return Math.max(0, Math.min(100, num(value)));
}

/**
 * Normalise the raw `schedule` attribute into a sorted list of intervals
 * covering the day. Entries without a usable start are dropped; the first
 * interval is stretched back to midnight, as the pump runs it from there.
 * @param raw: the `schedule` attribute (any shape)
 * @return the intervals, sorted by start, possibly empty
 */
export function normalize_schedule(raw: unknown): WaveInterval[] {
  if (!Array.isArray(raw)) return [];
  const items = raw
    .filter((r) => r && typeof r === "object" && Number.isFinite(Number(r.st)))
    .map((r: any) => ({
      start: Math.max(0, Math.min(MINUTES_PER_DAY - 1, Number(r.st))),
      end: MINUTES_PER_DAY,
      uid: String(r.wave_uid ?? ""),
      name: String(r.name ?? ""),
      type: String(r.type ?? "nw"),
      direction: String(r.direction ?? "fw"),
      fti: pct(r.fti),
      rti: pct(r.rti),
      frt: num(r.frt),
      rrt: num(r.rrt),
      sn: num(r.sn),
      pd: num(r.pd),
      sync: r.sync === true,
    }))
    .sort((a, b) => a.start - b.start);
  for (let i = 0; i < items.length; i++) {
    items[i].end = i + 1 < items.length ? items[i + 1].start : MINUTES_PER_DAY;
  }
  if (items.length) items[0].start = 0;
  // Two intervals on the same minute: the first one never runs
  return items.filter((it) => it.end > it.start);
}

/**
 * Index of the interval running at a minute of the day.
 * @param intervals: the normalised program
 * @param minute: minute of the day
 * @return the index, or -1 for an empty program
 */
export function current_index(
  intervals: WaveInterval[],
  minute: number,
): number {
  for (let i = intervals.length - 1; i >= 0; i--) {
    if (minute >= intervals[i].start) return i;
  }
  return intervals.length ? 0 : -1;
}

/**
 * Speed a wave drives the pump at, in %: its forward intensity, whatever
 * its direction (the direction only drives the flow animation). No wave
 * is 0.
 * @param wave: type, direction and intensities
 */
export function wave_speed(wave: {
  type: string;
  direction: string;
  fti: number;
  rti: number;
}): number {
  if (wave.type === "nw") return 0;
  return pct(wave.fti);
}

/**
 * Colour of a wave type, as an "r,g,b" triplet.
 * @param type: the wave type
 */
export function type_color(type: string): string {
  return WAVE_TYPE_COLORS[type] ?? WAVE_UNKNOWN_COLOR;
}

/**
 * Format a minute of the day as HH:MM.
 * @param minute: minute of the day (1440 reads as 24:00)
 */
export function hhmm(minute: number): string {
  const m = Math.max(0, Math.min(MINUTES_PER_DAY, Math.round(minute)));
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/**
 * Duration of the flow animation for a speed: the faster the pump, the
 * shorter one loop.
 * @param speed: 0..100
 * @param fastest: duration at 100 %, in s
 * @param slowest: duration at 1 %, in s
 * @return the duration in s, 0 when the pump is stopped
 */
export function flow_duration(
  speed: number,
  fastest = 0.6,
  slowest = 6,
): number {
  const s = pct(speed);
  if (s === 0) return 0;
  return slowest - ((s - 1) / 99) * (slowest - fastest);
}

// ── Editing ───────────────────────────────────────────────────────────────

/** A slot of a program being edited: start, wave and direction. */
export interface DraftSlot {
  st: number;
  wave_uid: string;
  direction: string;
}

/** A wave as the editors know it (see LibraryWave in rswave_api). */
export interface EditorWave {
  uid: string;
  name: string;
  type: string;
  fti: number;
  rti: number;
  frt?: number | null;
  rrt?: number | null;
  pd?: number | null;
  sn?: number | null;
  sync?: boolean;
  default?: boolean;
}

/**
 * Shape fields each wave type uses, as the ReefBeat app (and the
 * integration) define them. "No wave" has none.
 */
export const WAVE_TYPE_FIELDS: Record<string, string[]> = {
  nw: [],
  ra: ["frt", "rrt"],
  re: ["frt", "rrt"],
  st: ["frt", "rrt", "pd", "sn"],
  su: ["pd"],
  un: ["frt", "rrt", "pd"],
};

/** Input limits of the wave fields: frt / rrt in min, pd in s, % for fti / rti. */
export const WAVE_FIELD_LIMITS: Record<
  string,
  { min: number; max: number; step: number }
> = {
  frt: { min: 1, max: 60, step: 1 },
  rrt: { min: 1, max: 60, step: 1 },
  pd: { min: 0.5, max: 25, step: 0.5 },
  sn: { min: 2, max: 10, step: 1 },
  fti: { min: 0, max: 100, step: 5 },
  rti: { min: 0, max: 100, step: 5 },
};

/** Types a user wave can take (a "no wave" is a Red Sea one only). */
export const EDITABLE_TYPES = ["un", "ra", "re", "st", "su"];

/**
 * Minute of the day from an "HH:MM" text.
 * @param text: the value of a time input
 * @return the minute, null when unreadable
 */
export function parse_hhmm(text: string): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(text ?? ""));
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Slots of a normalised program, to start editing from.
 * @param intervals: the program
 */
export function slots_of(intervals: WaveInterval[]): DraftSlot[] {
  return intervals.map((it) => ({
    st: it.start,
    wave_uid: it.uid,
    direction: it.direction,
  }));
}

/**
 * The program a draft would make, for the graph: each slot with the wave
 * it uses (an unknown wave reads as "no wave").
 * @param slots: the draft, any order
 * @param waves: the waves the pump can use
 */
export function draft_intervals(
  slots: DraftSlot[],
  waves: EditorWave[],
): WaveInterval[] {
  const by_uid = new Map(waves.map((w) => [w.uid, w]));
  return normalize_schedule(
    slots.map((s) => {
      const w = by_uid.get(s.wave_uid);
      return {
        st: s.st,
        wave_uid: s.wave_uid,
        name: w?.name ?? "",
        type: w?.type ?? "nw",
        direction: s.direction,
        fti: w?.fti ?? 0,
        rti: w?.rti ?? 0,
        frt: w?.frt,
        rrt: w?.rrt,
        pd: w?.pd,
        sn: w?.sn,
        sync: w?.sync,
      };
    }),
  );
}

/**
 * What prevents a draft from being saved, as a translation key.
 * @param slots: the draft
 * @param waves: the waves the pump can use
 * @return null when it can be saved
 */
export function check_draft(
  slots: DraftSlot[],
  waves: EditorWave[],
): string | null {
  if (!slots.length) return "wave_err_empty";
  const uids = new Set(waves.map((w) => w.uid));
  if (slots.some((s) => !uids.has(s.wave_uid))) return "wave_err_no_wave";
  const starts = slots.map((s) => s.st);
  if (new Set(starts).size !== starts.length) return "wave_err_same_start";
  const ends = [...starts.slice(1), MINUTES_PER_DAY];
  if (starts.some((st, i) => ends[i] - st < SLOT_GAP)) {
    return "wave_err_too_short";
  }
  return null;
}

/**
 * Shortest slot, in minutes (the last one up to midnight): the cloud takes
 * a shorter one, but the pump silently leaves it out of its program. Also
 * the start of a slot added after the last one.
 */
export const SLOT_GAP = 15;

/**
 * A new slot, at the end of the day: SLOT_GAP minutes after the start of
 * the last slot, with its wave and direction, and SLOT_GAP minutes of its
 * own before midnight.
 * @param slots: the draft, sorted by start
 * @return the slot, null when the last slot starts too close to midnight
 *         (see make_room())
 */
export function next_slot(slots: DraftSlot[]): DraftSlot | null {
  const last = slots[slots.length - 1];
  if (!last) return null;
  const st = last.st + SLOT_GAP;
  if (st + SLOT_GAP > MINUTES_PER_DAY) return null;
  return { st, wave_uid: last.wave_uid, direction: last.direction };
}

/**
 * Move the last slots earlier, SLOT_GAP minutes apart, so that next_slot()
 * has room at the end of the day. The first slot, at midnight, never moves.
 * @param slots: the draft, sorted by start
 * @return the draft moved, null when the day is too full for it
 */
export function make_room(slots: DraftSlot[]): DraftSlot[] | null {
  const out = slots.map((s) => ({ ...s }));
  let latest = MINUTES_PER_DAY - 2 * SLOT_GAP;
  for (let i = out.length - 1; i > 0 && out[i].st > latest; i--) {
    out[i].st = latest;
    latest -= SLOT_GAP;
  }
  const sorted = out.every((s, i) => i === 0 || s.st > out[i - 1].st);
  return out.length && sorted ? out : null;
}

/**
 * Settings of a wave for redsea.wave_library_save: its type's shape
 * fields, and this pump's intensities.
 * @param wave: the wave being edited
 */
export function wave_settings(wave: EditorWave): Record<string, unknown> {
  const out: Record<string, unknown> = {
    type: wave.type,
    fti: Number(wave.fti),
    rti: Number(wave.rti),
    sync: wave.sync === true,
  };
  for (const key of WAVE_TYPE_FIELDS[wave.type] ?? []) {
    out[key] = Number((wave as any)[key]);
  }
  return out;
}

/** Longest wave name the ReefBeat cloud takes (a longer one is refused). */
export const WAVE_NAME_MAX = 15;

/**
 * Default value of a shape field a wave switching type gains (the Red Sea
 * waves' values).
 */
export const WAVE_FIELD_DEFAULTS: Record<string, number> = {
  frt: 10,
  rrt: 2,
  pd: 3,
  sn: 6,
};
