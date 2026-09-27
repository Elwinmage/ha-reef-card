/**
 * @file Validation of on/off schedule intervals
 * @module utils.intervals
 *
 * Shared by the schedule editors of power-center sockets and RSControl
 * ports. Each row of those editors is an ON window defined by a start time
 * and a duration; the user edits it as a start and an end.
 *
 * Rules, on the rows sorted by start time:
 *   - the end of a row is strictly after its start (duration > 0);
 *   - the start of a row is strictly after the end of the previous row.
 */

export interface ScheduleInterval {
  time: number; // minutes from midnight
  duration: number; // minutes, may be <= 0 while the user is editing
}

/** What is wrong with one row; both flags may be set at once. */
export interface IntervalError {
  /** Start is not after the end of the previous row. */
  overlap: boolean;
  /** End is not after the start of the same row. */
  endBeforeStart: boolean;
}

/**
 * Check every row against the schedule rules.
 *
 * The rows are expected in display order, which the editors keep sorted by
 * start time.
 * @param intervals - the rows being edited
 * @return one entry per row, in the same order
 */
export function validateIntervals(
  intervals: ScheduleInterval[],
): IntervalError[] {
  return intervals.map((iv, i) => {
    const prev = i > 0 ? intervals[i - 1] : null;
    return {
      overlap: prev !== null && iv.time <= prev.time + prev.duration,
      endBeforeStart: !(iv.duration > 0),
    };
  });
}

/**
 * Whether a set of rows can be saved.
 * @param errors - the result of validateIntervals
 * @return true when no row breaks a rule
 */
export function intervalsValid(errors: IntervalError[]): boolean {
  return errors.every((e) => !e.overlap && !e.endBeforeStart);
}

/**
 * Whether a schedule can be written to the device, whatever the order of
 * its rows: they are checked in start order, as they will be sent.
 * @param intervals - the rows to write
 * @return true when the sorted rows break no rule
 */
export function scheduleSavable(intervals: ScheduleInterval[]): boolean {
  const sorted = [...intervals].sort((a, b) => a.time - b.time);
  return intervalsValid(validateIntervals(sorted));
}
