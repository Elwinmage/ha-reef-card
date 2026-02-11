/**
 * Dosing schedule types (ReefDose)
 */

export interface Schedule {
  type: "fixed" | "variable" | string;
  days: number[];
  enabled?: boolean;
  [key: string]: any;
}

export interface ScheduleFixed extends Schedule {
  type: "fixed";
  time: string;
  dose: number;
}

export interface ScheduleVariable extends Schedule {
  type: "variable";
  times: string[];
  doses: number[];
}
