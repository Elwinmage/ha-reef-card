/**
 * Pure helpers for the ReefLED view: daily program evaluation, sun and moon
 * course, moon phase drawing and light colours.
 *
 * Nothing here touches Lit or Home Assistant, so every function can be unit
 * tested on its own.
 *
 * G1 program format (one `/auto/<day>` source per weekday, exposed by the
 * integration as the `data` attribute of the `auto_<day>` sensor):
 *   {
 *     white: { rise: 660, set: 1260, points: [{ t: 120, i: 100 }, …] },
 *     blue:  { … },
 *     moon:  { … },
 *   }
 * `rise` and `set` are minutes from midnight (`set` may exceed 1440 when a
 * channel runs past midnight, the moon typically). Each point is `t` minutes
 * after `rise` at intensity `i` (%). The channel ramps linearly from 0 at
 * `rise`, through its points, back to 0 at `set`.
 */

export const MINUTES_PER_DAY = 1440;

/** Length of the moon cycle used by the device (moon_day is 1..28). */
export const MOON_CYCLE_DAYS = 28;

export interface ProgramPoint {
  t: number;
  i: number;
  /** Colour temperature of the point (G2), under whichever key it came */
  k?: number;
  kelvin?: number;
}

export interface ChannelProgram {
  rise: number;
  set: number;
  points?: ProgramPoint[];
}

export interface DayProgram {
  white?: ChannelProgram;
  blue?: ChannelProgram;
  moon?: ChannelProgram;
  /** G2: overall intensity, each point carrying its colour temperature */
  intensity?: ChannelProgram;
}

export interface CloudProgram {
  from?: number;
  to?: number;
  intensity?: string;
  cloud_duration?: number;
  no_cloud_duration?: number;
}

/**
 * Step of a G2's colour temperature at a value: 200 K under 10000 K, 500 K
 * above.
 * @param k: the colour temperature
 */
export function g2_kelvin_step(k: number): number {
  return k < 10000 ? 200 : 500;
}

/**
 * A colour temperature on a G2's scale.
 * @param k: the colour temperature
 */
export function g2_kelvin(k: number): number {
  const step = g2_kelvin_step(k);
  return Math.round(k / step) * step;
}

export type Channel = "white" | "blue" | "moon";

/** Every channel a day program may hold, in drawing order. */
export type ProgramChannel = Channel | "intensity";

/**
 * How a program drives the colour:
 *   - "wb": white and blue channels (G1)
 *   - "kelvin": one intensity channel whose points carry a colour
 *     temperature (G2)
 */
export type ProgramFormat = "wb" | "kelvin";

//----------------------------------------------------------------------------//
//   Program evaluation
//----------------------------------------------------------------------------//

/**
 * Whether a value looks like a usable channel program.
 * @param ch: the candidate
 */
export function is_channel(ch: any): ch is ChannelProgram {
  return (
    !!ch &&
    typeof ch === "object" &&
    Number.isFinite(Number(ch.rise)) &&
    Number.isFinite(Number(ch.set)) &&
    Number(ch.set) > Number(ch.rise)
  );
}

/**
 * Absolute breakpoints of a channel, in minutes on its own day's timeline
 * (may go past 1440).
 * @param ch: the channel program
 * @return sorted [minute, intensity] pairs, from rise (0 %) to set (0 %)
 */
export function channel_breakpoints(ch: ChannelProgram): [number, number][] {
  const rise = Number(ch.rise);
  const set = Number(ch.set);
  const pts: [number, number][] = [[rise, 0]];
  for (const p of ch.points ?? []) {
    const t = Number(p?.t);
    const i = Number(p?.i);
    if (!Number.isFinite(t) || !Number.isFinite(i)) continue;
    // Clamp inside the rise..set window: a point beyond `set` would draw a
    // spike the device never produces.
    const m = Math.min(Math.max(rise + t, rise), set);
    pts.push([m, Math.max(0, Math.min(100, i))]);
  }
  pts.push([set, 0]);
  pts.sort((a, b) => a[0] - b[0]);
  return pts;
}

/**
 * Intensity of a channel at an absolute minute of its own day.
 * @param ch: the channel program (may be undefined)
 * @param minute: minutes since midnight of the program's day (0..2879)
 * @return the intensity in %, 0 outside the rise..set window
 */
export function channel_at(
  ch: ChannelProgram | undefined | null,
  minute: number,
): number {
  if (!is_channel(ch)) return 0;
  const pts = channel_breakpoints(ch);
  if (minute < pts[0][0] || minute > pts[pts.length - 1][0]) return 0;
  // The window check above guarantees a segment ends at or after `minute`
  let k = 1;
  while (minute > pts[k][0]) k++;
  const [m0, v0] = pts[k - 1];
  const [m1, v1] = pts[k];
  if (m1 === m0) return v1;
  return v0 + ((v1 - v0) * (minute - m0)) / (m1 - m0);
}

/**
 * Intensity of a channel at a minute of today, taking into account the part
 * of yesterday's program that runs past midnight.
 * @param today: today's channel program
 * @param yesterday: yesterday's channel program
 * @param minute: minutes since today's midnight (0..1439)
 */
export function channel_value(
  today: ChannelProgram | undefined | null,
  yesterday: ChannelProgram | undefined | null,
  minute: number,
): number {
  return Math.max(
    channel_at(today, minute),
    channel_at(yesterday, minute + MINUTES_PER_DAY),
  );
}

/**
 * Sample a channel over a whole day, for the chart.
 * @param today: today's channel program
 * @param yesterday: yesterday's channel program
 * @param step: sampling step in minutes
 * @return [minute, intensity] pairs from 0 to 1440 included
 */
export function day_curve(
  today: ChannelProgram | undefined | null,
  yesterday: ChannelProgram | undefined | null,
  step: number = 5,
): [number, number][] {
  const res: [number, number][] = [];
  // Breakpoints must be part of the curve, or a 5-minute sampling would
  // round off the corners of a ramp.
  const minutes = new Set<number>();
  for (let m = 0; m <= MINUTES_PER_DAY; m += step) minutes.add(m);
  for (const [ch, shift] of [
    [today, 0],
    [yesterday, -MINUTES_PER_DAY],
  ] as const) {
    if (!is_channel(ch)) continue;
    for (const [m] of channel_breakpoints(ch)) {
      const local = m + shift;
      if (local >= 0 && local <= MINUTES_PER_DAY) minutes.add(local);
    }
  }
  for (const m of [...minutes].sort((a, b) => a - b)) {
    res.push([m, channel_value(today, yesterday, m)]);
  }
  return res;
}

/**
 * Day window of a program: the earliest rise and the latest set of the day
 * channels (white, blue or intensity — the moon is a night channel).
 * @param prog: the day program
 * @return { rise, set } in minutes, or null when the day is empty
 */
export function sun_window(
  prog: DayProgram | null | undefined,
): { rise: number; set: number } | null {
  if (!prog) return null;
  const channels = [prog.white, prog.blue, prog.intensity].filter(is_channel);
  if (!channels.length) return null;
  return {
    rise: Math.min(...channels.map((c) => Number(c.rise))),
    set: Math.max(...channels.map((c) => Number(c.set))),
  };
}

export interface SkyState {
  /** Body travelling on the arc */
  body: "sun" | "moon";
  /** Progress along the arc: 0 = left end, 1 = right end */
  progress: number;
  /** Minute (relative to today's midnight) at the left end, if known */
  start: number | null;
  /** Minute (relative to today's midnight) at the right end, if known */
  end: number | null;
}

/**
 * Where the sky stands: the sun between a rise and a set, the moon from a set
 * to the next rise. Yesterday's and tomorrow's programs give the night its
 * ends; a missing day is assumed to repeat one of its neighbours.
 * @param minute: minutes since today's midnight (0..1439)
 * @param yesterday: yesterday's program
 * @param today: today's program
 * @param tomorrow: tomorrow's program
 */
export function sky_state(
  minute: number,
  yesterday: DayProgram | null | undefined,
  today: DayProgram | null | undefined,
  tomorrow: DayProgram | null | undefined,
): SkyState {
  // A day without program borrows its neighbours' window: the sky keeps
  // its times rather than losing them for the whole night
  const wt = sun_window(today) ?? sun_window(yesterday) ?? sun_window(tomorrow);
  const wy = sun_window(yesterday) ?? wt;
  const wn = sun_window(tomorrow) ?? wt;
  const windows: { rise: number; set: number }[] = [];
  if (wy)
    windows.push({
      rise: wy.rise - MINUTES_PER_DAY,
      set: wy.set - MINUTES_PER_DAY,
    });
  if (wt) windows.push(wt);
  if (wn)
    windows.push({
      rise: wn.rise + MINUTES_PER_DAY,
      set: wn.set + MINUTES_PER_DAY,
    });
  if (!windows.length) {
    // No program at all: the moon stays at its zenith
    return { body: "moon", progress: 0.5, start: null, end: null };
  }
  for (const w of windows) {
    if (minute >= w.rise && minute <= w.set) {
      return {
        body: "sun",
        progress: (minute - w.rise) / (w.set - w.rise),
        start: w.rise,
        end: w.set,
      };
    }
  }
  const sets = windows.map((w) => w.set).filter((m) => m <= minute);
  const rises = windows.map((w) => w.rise).filter((m) => m >= minute);
  const start = sets.length ? Math.max(...sets) : null;
  // Rises are never negative: tomorrow's comes after any minute of today
  const end = Math.min(...rises);
  if (start === null || end <= start) {
    return { body: "moon", progress: 0.5, start, end };
  }
  return {
    body: "moon",
    progress: (minute - start) / (end - start),
    start,
    end,
  };
}

/**
 * Format minutes as HH:MM, wrapping over midnight.
 * @param minutes: minutes since midnight (may exceed 1440)
 */
export function format_minutes(minutes: number): string {
  const m =
    ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) %
    MINUTES_PER_DAY;
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** A day of the weather program: the sun on the tank and at the place. */
export interface WeatherDayTimes {
  sunrise?: string;
  sunset?: string;
  place_sunrise?: string;
  place_sunset?: string;
}

/**
 * Minute at the weather program's place matching a minute of the tank.
 *
 * The integration moves the place's day onto the tank's clock: shifted to
 * the tank's sunrise or sunset, stretched between both, or kept at the
 * place's own time. In every case the tank's day (sunrise to sunset) maps
 * linearly onto the place's, which this inverts, before and after the day
 * too.
 * @param minute: minute of the tank's day
 * @param day: the day of the weather program (times as "HH:MM")
 * @return the place's minute of the day (0..1439), null without the times
 */
export function weather_place_minute(
  minute: number,
  day: WeatherDayTimes | null | undefined,
): number | null {
  const rise = parse_time(day?.sunrise ?? "");
  const set = parse_time(day?.sunset ?? "");
  const place_rise = parse_time(day?.place_sunrise ?? "");
  const place_set = parse_time(day?.place_sunset ?? "");
  if (
    rise === null ||
    set === null ||
    place_rise === null ||
    place_set === null
  )
    return null;
  // A day running past midnight
  const span = set > rise ? set - rise : set + MINUTES_PER_DAY - rise;
  const place_span =
    place_set > place_rise
      ? place_set - place_rise
      : place_set + MINUTES_PER_DAY - place_rise;
  const m = place_rise + ((minute - rise) * place_span) / span;
  return (
    ((Math.round(m) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  );
}

/**
 * Whether clouds are programmed for the day, and whether we are inside
 * their window right now.
 * @param clouds: the clouds program of the day
 * @param minute: minutes since midnight
 * @return the number of clouds to draw (0..3) and whether they are active
 */
export function clouds_state(
  clouds: CloudProgram | null | undefined,
  minute: number,
): { count: number; active: boolean } {
  if (!clouds || typeof clouds !== "object") {
    return { count: 0, active: false };
  }
  const level = String(clouds.intensity ?? "").toLowerCase();
  const count =
    { low: 1, medium: 2, high: 3 }[level] ?? (level && level !== "off" ? 1 : 0);
  const from = Number(clouds.from);
  const to = Number(clouds.to);
  const active =
    count > 0 &&
    Number.isFinite(from) &&
    Number.isFinite(to) &&
    minute >= from &&
    minute <= to;
  return { count, active };
}

//----------------------------------------------------------------------------//
//   Time
//----------------------------------------------------------------------------//

/**
 * Current minute of the day and ISO weekday (1 = Monday … 7 = Sunday) in a
 * given time zone, falling back to the browser's own.
 * The ReefLED numbers its programs by ISO weekday: /auto/1 is Monday.
 * @param now: the date to convert
 * @param time_zone: an IANA time zone, usually hass.config.time_zone
 */
export function local_time(
  now: Date,
  time_zone?: string,
): { minute: number; weekday: number } {
  if (time_zone) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: time_zone,
        hour: "2-digit",
        minute: "2-digit",
        weekday: "short",
        hourCycle: "h23",
      }).formatToParts(now);
      // A missing part reads as NaN (or weekday 0) and is rejected below
      const get = (type: string) =>
        String(parts.find((p) => p.type === type)?.value);
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const weekday = days.indexOf(get("weekday")) + 1;
      const hour = Number(get("hour")) % 24;
      const minute = Number(get("minute"));
      if (weekday > 0 && Number.isFinite(hour) && Number.isFinite(minute)) {
        return { minute: hour * 60 + minute, weekday };
      }
    } catch {
      // Unknown time zone: use the browser's
    }
  }
  return {
    minute: now.getHours() * 60 + now.getMinutes(),
    weekday: ((now.getDay() + 6) % 7) + 1,
  };
}

/**
 * ISO weekday before the given one.
 * @param weekday: 1..7
 */
export function previous_weekday(weekday: number): number {
  return weekday === 1 ? 7 : weekday - 1;
}

//----------------------------------------------------------------------------//
//   Moon
//----------------------------------------------------------------------------//

/**
 * Moon phase from the device's moon day.
 * @param moon_day: 1..28 (1 = new moon, 15 = full moon)
 * @return the phase in [0,1): 0 new, 0.25 first quarter, 0.5 full, 0.75 last
 */
export function moon_phase(moon_day: number): number {
  const d = Number(moon_day);
  if (!Number.isFinite(d)) return 0.5;
  const p = (d - 1) / MOON_CYCLE_DAYS;
  return ((p % 1) + 1) % 1;
}

/**
 * SVG path of the lit part of the moon, centred on (0,0).
 * Northern hemisphere view: a waxing moon is lit on its right.
 * @param phase: from moon_phase()
 * @param r: moon radius
 * @return the path, or "" at new moon (nothing lit)
 */
export function moon_lit_path(phase: number, r: number): string {
  const p = ((phase % 1) + 1) % 1;
  // Illuminated fraction too small to be drawn
  if (p < 0.02 || p > 0.98) return "";
  const rx = Math.abs(Math.cos(2 * Math.PI * p)) * r;
  const waxing = p < 0.5;
  const limb_sweep = waxing ? 1 : 0;
  // Crescent: the terminator bulges towards the lit limb
  const crescent = waxing ? p < 0.25 : p > 0.75;
  const term_sweep = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0;
  const f = (n: number) => Number(n.toFixed(2));
  return (
    `M 0 ${f(-r)} A ${f(r)} ${f(r)} 0 0 ${limb_sweep} 0 ${f(r)} ` +
    `A ${f(rx)} ${f(r)} 0 0 ${term_sweep} 0 ${f(-r)} Z`
  );
}

//----------------------------------------------------------------------------//
//   Colours
//----------------------------------------------------------------------------//

export type RGB = [number, number, number];

/** Colour of each LED channel at full power. */
export const CHANNEL_RGB: Record<Channel, RGB> = {
  white: [255, 250, 235],
  blue: [40, 70, 255],
  // The moon LED of the ReefLED is violet
  moon: [150, 80, 255],
};

/**
 * Colour and opacity of the light currently produced.
 * @param white: white channel in %
 * @param blue: blue channel in %
 * @param moon: moon channel in %
 * @return the mixed colour and an opacity growing with the power
 */
export function light_color(
  white: number,
  blue: number,
  moon: number = 0,
): { rgb: RGB; alpha: number } {
  const w = clamp_pct(white);
  const b = clamp_pct(blue);
  // The moon LED is a small one: weigh it down against the main channels
  const m = clamp_pct(moon) * 0.3;
  const total = w + b + m;
  if (total <= 0) {
    return { rgb: [120, 130, 150], alpha: 0.08 };
  }
  const rgb = [0, 1, 2].map((k) =>
    Math.round(
      (w * CHANNEL_RGB.white[k] +
        b * CHANNEL_RGB.blue[k] +
        m * CHANNEL_RGB.moon[k]) /
        total,
    ),
  ) as RGB;
  const power = Math.max(w, b, m) / 100;
  return { rgb, alpha: Number((0.15 + 0.6 * power).toFixed(3)) };
}

/**
 * PAR (µmol/m²/s) at the water surface, under the centre of a lamp at full
 * power, hung at the height Red Sea recommends: read from Red Sea's
 * published figures (G2: specifications; G1: PAR maps). An estimate, to
 * tell how strong the light is rather than a share of the lamp's power.
 */
export const PAR_SURFACE: Record<string, number> = {
  RSLED50: 550,
  RSLED90: 570,
  RSLED160: 600,
  RSLED60: 500,
  RSLED115: 500,
  RSLED170: 550,
};

/**
 * Share of a G1's full output each channel gives at 100 %: from the
 * power the integration measured the intensity compensation with
 * (white alone 10320, blue alone 13370, close to their sum together).
 */
export const G1_CHANNEL_SHARE = {
  white: 10320 / (10320 + 13370),
  blue: 13370 / (10320 + 13370),
};

/**
 * Estimated PAR at the water surface under a lamp.
 * @param model: the lamp's model (RSLED160...)
 * @param levels: its white and blue levels, in % (a G1's output)
 * @param intensity: its intensity, in % (a G2's output: the same at any
 *                   colour temperature), null when not reported
 * @param g2: whether the lamp is driven by intensity and colour
 * @return the PAR, rounded, or null for an unknown model or without the
 *         levels to tell it from
 */
export function estimated_par(
  model: string | undefined,
  levels: { white: number; blue: number },
  intensity: number | null | undefined,
  g2: boolean,
): number | null {
  const full = PAR_SURFACE[String(model)];
  if (!full) return null;
  if (g2) {
    if (intensity === null || intensity === undefined) return null;
    return Math.round((full * clamp_pct(intensity)) / 100);
  }
  const share =
    (clamp_pct(levels.white) * G1_CHANNEL_SHARE.white +
      clamp_pct(levels.blue) * G1_CHANNEL_SHARE.blue) /
    100;
  return Math.round(full * share);
}

/**
 * White/blue balance parameter of each G1 model at a colour temperature, the
 * tables the integration uses (LEDS_CONV). The parameter `wb` runs from 0
 * to 200: at 100 and above white is full and blue is 200 - wb; below 100
 * blue is full and white is wb.
 */
const G1_KELVIN = [9000, 12000, 15000, 20000, 23000];
export const G1_WHITE_BLUE: Record<string, number[]> = {
  RSLED160: [200, 125, 100, 50, 10],
  RSLED90: [200, 134, 100, 50, 10],
  RSLED50: [200, 100, 50, 25, 5],
};

/** Model whose table applies when the model is unknown. */
export const G1_DEFAULT_MODEL = "RSLED160";

/**
 * White/blue table of a G1 model.
 * @param model: RSLED50, RSLED90 or RSLED160
 */
function g1_table(model?: string): number[] {
  return (
    G1_WHITE_BLUE[String(model ?? "").toUpperCase()] ??
    G1_WHITE_BLUE[G1_DEFAULT_MODEL]
  );
}

/**
 * Piecewise-linear interpolation, clamped at both ends (as the
 * integration's `_interp`).
 * @param x: the input
 * @param xs: abscissas, any order
 * @param ys: ordinates
 */
function interp(x: number, xs: number[], ys: number[]): number {
  const pairs = xs.map((v, n) => [v, ys[n]]).sort((a, b) => a[0] - b[0]);
  if (x <= pairs[0][0]) return pairs[0][1];
  const last = pairs[pairs.length - 1];
  if (x >= last[0]) return last[1];
  let n = 1;
  while (x > pairs[n][0]) n++;
  const [x0, y0] = pairs[n - 1];
  const [x1, y1] = pairs[n];
  return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
}

/**
 * White and blue levels (0..100) giving a colour temperature on a G1 at
 * full intensity, with the integration's formula but without its optional
 * intensity compensation: the fallback of its `redsea.led_convert`
 * service.
 * @param kelvin: the colour temperature
 * @param model: the G1 model (RSLED160 table when unknown)
 */
export function kelvin_to_white_blue(
  kelvin: number,
  model?: string,
): {
  white: number;
  blue: number;
} {
  const k = Number.isFinite(Number(kelvin)) ? Number(kelvin) : G1_KELVIN[4];
  const wb = Math.max(0, Math.min(200, interp(k, G1_KELVIN, g1_table(model))));
  return wb >= 100
    ? { white: 100, blue: Math.round(200 - wb) }
    : { white: Math.round(wb), blue: 100 };
}

/**
 * Display palette of the colour temperature: deliberately contrasted, from
 * yellow to deep blue, so a glance tells warm from cold.
 */
export const KELVIN_PALETTE: [number, RGB][] = [
  [8000, [255, 196, 40]],
  [11000, [255, 236, 150]],
  [14000, [236, 242, 255]],
  [17000, [150, 180, 255]],
  [20000, [80, 110, 255]],
  [23000, [30, 45, 235]],
];

/**
 * Display colour of a colour temperature.
 * @param kelvin: the colour temperature
 */
export function kelvin_rgb(kelvin: number): RGB {
  const pal = KELVIN_PALETTE;
  const k = Number(kelvin);
  if (!Number.isFinite(k) || k <= pal[0][0]) return [...pal[0][1]] as RGB;
  for (let n = 1; n < pal.length; n++) {
    const [k1, c1] = pal[n];
    if (k <= k1) {
      const [k0, c0] = pal[n - 1];
      const f = (k - k0) / (k1 - k0);
      return [0, 1, 2].map((c) =>
        Math.round(c0[c] + f * (c1[c] - c0[c])),
      ) as RGB;
    }
  }
  return [...pal[pal.length - 1][1]] as RGB;
}

/**
 * CSS rgb()/rgba() string.
 * @param rgb: the colour
 * @param alpha: optional opacity
 */
export function rgb_css(rgb: RGB, alpha?: number): string {
  return alpha === undefined
    ? `rgb(${rgb.join(",")})`
    : `rgba(${rgb.join(",")},${alpha})`;
}

/**
 * Percentage (0..100) from a light entity's 0..255 brightness.
 * @param brightness: the brightness attribute
 */
export function brightness_pct(brightness: any): number {
  const b = Number(brightness);
  if (!Number.isFinite(b) || b <= 0) return 0;
  return Math.round((Math.min(255, b) * 100) / 255);
}

function clamp_pct(v: any): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

//----------------------------------------------------------------------------//
//   Program formats and editing
//----------------------------------------------------------------------------//

/**
 * Format of a day program.
 * @param prog: the day program
 * @return the format, or null when the program holds no day channel
 */
export function program_format(
  prog: DayProgram | null | undefined,
): ProgramFormat | null {
  if (!prog || typeof prog !== "object") return null;
  if (is_channel(prog.intensity)) return "kelvin";
  if (is_channel(prog.white) || is_channel(prog.blue)) return "wb";
  return null;
}

/**
 * Channels a program format edits and draws.
 * @param format: the program format
 */
export function format_channels(format: ProgramFormat): ProgramChannel[] {
  return format === "kelvin"
    ? ["intensity", "moon"]
    : ["white", "blue", "moon"];
}

/**
 * Colour temperature carried by a program point, if any.
 * @param p: the point
 */
export function point_kelvin(
  p: ProgramPoint | null | undefined,
): number | null {
  const k = Number(p?.k ?? p?.kelvin);
  return Number.isFinite(k) && k > 0 ? k : null;
}

/** A program point on an absolute timeline, as the editor handles it. */
export interface EditPoint {
  /** Minutes from the program day's midnight (may exceed 1440) */
  m: number;
  /** Intensity in % */
  i: number;
  /** Colour temperature (kelvin format only) */
  k?: number;
}

/** Default colour temperature of a new point. */
export const DEFAULT_KELVIN = 15000;

/**
 * Editable points of a channel: its rise (0 %), its points, its set (0 %).
 * In the kelvin format, rise and set take the colour of their neighbour.
 * @param ch: the channel program
 * @param with_kelvin: whether points carry a colour temperature
 */
export function to_edit_points(
  ch: ChannelProgram | null | undefined,
  with_kelvin: boolean = false,
): EditPoint[] {
  if (!is_channel(ch)) return [];
  const rise = Number(ch.rise);
  const set = Number(ch.set);
  const inner = (ch.points ?? [])
    .filter(
      (p) => Number.isFinite(Number(p?.t)) && Number.isFinite(Number(p?.i)),
    )
    .map((p) => {
      const pt: EditPoint = {
        m: Math.min(Math.max(rise + Number(p.t), rise), set),
        i: Math.max(0, Math.min(100, Number(p.i))),
      };
      if (with_kelvin) pt.k = point_kelvin(p) ?? DEFAULT_KELVIN;
      return pt;
    })
    .sort((a, b) => a.m - b.m);
  const first: EditPoint = { m: rise, i: 0 };
  const last: EditPoint = { m: set, i: 0 };
  if (with_kelvin) {
    first.k = inner[0]?.k ?? DEFAULT_KELVIN;
    last.k = inner[inner.length - 1]?.k ?? first.k;
  }
  return [first, ...inner, last];
}

/**
 * Channel program from edited points (first = rise, last = set).
 * @param pts: the edited points, sorted by time
 * @param kelvin_key: key the device expects for the colour of a point
 *                    (kelvin format), null for none
 * @return the channel, or null when fewer than two points remain
 */
export function from_edit_points(
  pts: EditPoint[],
  kelvin_key: "k" | "kelvin" | null = null,
): ChannelProgram | null {
  if (pts.length < 2) return null;
  const rise = Math.round(pts[0].m);
  const set = Math.round(pts[pts.length - 1].m);
  const points = pts.slice(1, -1).map((p) => {
    const out: any = { t: Math.round(p.m) - rise, i: Math.round(p.i) };
    if (kelvin_key) out[kelvin_key] = Math.round(p.k ?? DEFAULT_KELVIN);
    return out as ProgramPoint;
  });
  return { rise, set, points };
}

/**
 * Key the colour temperature is stored under in a channel, so a saved
 * program keeps the shape the device sent.
 * @param ch: the channel program
 */
export function kelvin_key_of(
  ch: ChannelProgram | null | undefined,
): "k" | "kelvin" {
  return (ch?.points ?? []).some((p) => p && "kelvin" in p) ? "kelvin" : "k";
}

/**
 * Colour zones of a kelvin channel: one per segment between two
 * consecutive points, with the colour at each end.
 * @param pts: the channel's points, from to_edit_points(ch, true)
 */
export function kelvin_segments(pts: EditPoint[]): {
  m0: number;
  m1: number;
  i0: number;
  i1: number;
  k0: number;
  k1: number;
}[] {
  const res = [];
  for (let n = 1; n < pts.length; n++) {
    const a = pts[n - 1];
    const b = pts[n];
    res.push({
      m0: a.m,
      m1: b.m,
      i0: a.i,
      i1: b.i,
      k0: a.k ?? DEFAULT_KELVIN,
      k1: b.k ?? DEFAULT_KELVIN,
    });
  }
  return res;
}

/**
 * Where the colour temperature changes: the minutes of the points where
 * it differs from the previous one, and the colour of each resulting zone.
 * @param pts: the channel's points, from to_edit_points(ch, true)
 * @return zones [{ m0, m1, k }] covering rise..set
 */
export function kelvin_zones(
  pts: EditPoint[],
): { m0: number; m1: number; k: number }[] {
  if (pts.length < 2) return [];
  const zones: { m0: number; m1: number; k: number }[] = [];
  let start = pts[0];
  // The colour of a zone is the one its points hold after the rise
  let k = pts[1].k ?? DEFAULT_KELVIN;
  for (let n = 2; n < pts.length - 1; n++) {
    const pk = pts[n].k ?? DEFAULT_KELVIN;
    if (pk !== k) {
      zones.push({ m0: start.m, m1: pts[n].m, k });
      start = pts[n];
      k = pk;
    }
  }
  zones.push({ m0: start.m, m1: pts[pts.length - 1].m, k });
  return zones;
}

/**
 * Parse an "HH:MM" time into minutes.
 * @param value: the text of a time input
 * @return minutes since midnight, or null when not a time
 */
export function parse_time(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Place a new time between two neighbours, allowing it to run past
 * midnight when the previous point is later in the day.
 * @param minutes: the time typed (0..1439)
 * @param prev: minute of the previous point, null for the first one
 * @param next: minute of the next point, null for the last one
 * @return the absolute minute, clamped strictly between the neighbours
 */
export function place_time(
  minutes: number,
  prev: number | null,
  next: number | null,
): number {
  let m = minutes;
  if (prev !== null && m <= prev) m += MINUTES_PER_DAY;
  const lo = prev === null ? -Infinity : prev + 1;
  const hi = next === null ? 2 * MINUTES_PER_DAY - 1 : next - 1;
  return Math.max(lo, Math.min(hi, m));
}

/** Stroke colour of each channel on the charts. */
export const CURVE_COLORS_DEFAULT: Record<Channel, string> = {
  white: "#ffffff",
  blue: "#2233ee",
  moon: "#b45cff",
};

//----------------------------------------------------------------------------//
//   G1: white/blue <-> kelvin/intensity
//----------------------------------------------------------------------------//

/**
 * Colour temperature of a white/blue balance on a G1 (inverse of
 * kelvin_to_white_blue(), same formula as the integration's
 * white_and_blue_to_kelvin).
 * @param white: white channel in %
 * @param blue: blue channel in %
 * @param model: the G1 model (RSLED160 table when unknown)
 * @return the colour temperature, rounded to 100 K
 */
export function white_blue_to_kelvin(
  white: number,
  blue: number,
  model?: string,
): number {
  const w = Math.max(0, Number(white) || 0);
  const b = Math.max(0, Number(blue) || 0);
  if (w === 0 && b === 0) return DEFAULT_KELVIN;
  const wb = w >= b ? 200 - (b * 100) / w : (w * 100) / b;
  const k = interp(Math.max(0, Math.min(200, wb)), g1_table(model), G1_KELVIN);
  return Math.round(k / 100) * 100;
}

/**
 * Intensity of edited points at a minute (0 outside their window).
 * @param pts: edited points, sorted by time
 * @param m: the minute
 */
export function edit_value_at(pts: EditPoint[], m: number): number {
  if (pts.length < 2 || m < pts[0].m || m > pts[pts.length - 1].m) return 0;
  let n = 1;
  while (m > pts[n].m) n++;
  const a = pts[n - 1];
  const b = pts[n];
  if (b.m === a.m) return b.i;
  return a.i + ((b.i - a.i) * (m - a.m)) / (b.m - a.m);
}

/** White and blue levels at one time of a G1 program. */
export interface WhiteBlueSample {
  m: number;
  w: number;
  b: number;
}

/** One converted point: what the integration's led_convert answers. */
export interface ConvertedPoint {
  kelvin?: number;
  intensity?: number;
  white?: number;
  blue?: number;
}

/**
 * White and blue levels at every time either channel has a point.
 * @param white: edited white points
 * @param blue: edited blue points
 */
export function white_blue_samples(
  white: EditPoint[],
  blue: EditPoint[],
): WhiteBlueSample[] {
  const times = [...new Set([...white, ...blue].map((p) => p.m))].sort(
    (a, b) => a - b,
  );
  return times.map((m) => ({
    m,
    w: edit_value_at(white, m),
    b: edit_value_at(blue, m),
  }));
}

/**
 * Colour temperature and intensity of white/blue samples.
 * @param samples: from white_blue_samples()
 * @param model: the G1 model
 */
export function convert_samples_locally(
  samples: WhiteBlueSample[],
  model?: string,
): ConvertedPoint[] {
  return samples.map((s) => ({
    kelvin: white_blue_to_kelvin(s.w, s.b, model),
    intensity: Math.max(s.w, s.b),
  }));
}

/**
 * Intensity points carrying a colour temperature, from white/blue samples
 * and their conversion.
 * @param samples: from white_blue_samples()
 * @param converted: one conversion per sample
 * @return intensity points (first and last at 0 %)
 */
export function kelvin_points_from_samples(
  samples: WhiteBlueSample[],
  converted: ConvertedPoint[],
): EditPoint[] {
  const pts: EditPoint[] = samples.map((s, n) => {
    const i = Math.round(
      Math.max(0, Math.min(100, Number(converted[n]?.intensity) || 0)),
    );
    const k = Number(converted[n]?.kelvin);
    return i > 0 && Number.isFinite(k) ? { m: s.m, i, k } : { m: s.m, i: 0 };
  });
  // Where nothing is lit the colour is undefined: take the neighbour's
  for (let n = 0; n < pts.length; n++) {
    if (pts[n].k !== undefined) continue;
    const next = pts.slice(n + 1).find((p) => p.k !== undefined);
    const prev = pts
      .slice(0, n)
      .reverse()
      .find((p) => p.k !== undefined);
    pts[n].k = next?.k ?? prev?.k ?? DEFAULT_KELVIN;
  }
  if (pts.length) {
    pts[0].i = 0;
    pts[pts.length - 1].i = 0;
  }
  return pts;
}

/**
 * Express a G1 white/blue program as intensity points carrying a colour
 * temperature, with the local conversion.
 * @param white: edited white points
 * @param blue: edited blue points
 * @param model: the G1 model
 */
export function white_blue_to_kelvin_points(
  white: EditPoint[],
  blue: EditPoint[],
  model?: string,
): EditPoint[] {
  const samples = white_blue_samples(white, blue);
  return kelvin_points_from_samples(
    samples,
    convert_samples_locally(samples, model),
  );
}

/**
 * Split intensity points with a colour temperature back into G1 white and
 * blue channels.
 * @param pts: intensity points
 * @param model: the G1 model
 * @param converted: optional conversion of each point by the integration
 *                   (redsea.led_convert), the local tables otherwise
 * @return the white and blue points, sharing the same times
 */
export function kelvin_points_to_white_blue(
  pts: EditPoint[],
  model?: string,
  converted?: ConvertedPoint[] | null,
): {
  white: EditPoint[];
  blue: EditPoint[];
} {
  const white: EditPoint[] = [];
  const blue: EditPoint[] = [];
  pts.forEach((p, n) => {
    const c = converted?.[n];
    let w: number;
    let b: number;
    if (
      c &&
      Number.isFinite(Number(c.white)) &&
      Number.isFinite(Number(c.blue))
    ) {
      w = Number(c.white);
      b = Number(c.blue);
    } else {
      const wb = kelvin_to_white_blue(p.k ?? DEFAULT_KELVIN, model);
      w = (wb.white * p.i) / 100;
      b = (wb.blue * p.i) / 100;
    }
    white.push({ m: p.m, i: Math.round(Math.max(0, Math.min(100, w))) });
    blue.push({ m: p.m, i: Math.round(Math.max(0, Math.min(100, b))) });
  });
  return { white, blue };
}

//----------------------------------------------------------------------------//
//   Device format: day offsets, G2 colour programs
//----------------------------------------------------------------------------//

/**
 * The lamp stores the times of /auto/<day> on a weekly timeline: rise, set
 * (and the clouds' from/to) carry (day - 1) × 1440 minutes. Day 2 starts
 * at 1440. Points stay relative to their rise.
 * @param day: ISO weekday (1..7)
 */
export function day_offset(day: number): number {
  const d = Math.max(1, Math.min(7, Math.round(Number(day) || 1)));
  return (d - 1) * MINUTES_PER_DAY;
}

/**
 * Remove the day offset from a channel (a channel already on its own day,
 * such as a Monday or an old firmware's, is left untouched).
 */
function shift_channel(ch: any, offset: number): any {
  if (!ch || typeof ch !== "object") return ch;
  const rise = Number(ch.rise);
  const set = Number(ch.set);
  if (!Number.isFinite(rise) || !Number.isFinite(set) || rise < offset) {
    return ch;
  }
  return { ...ch, rise: rise - offset, set: set - offset };
}

/** Whether the blue channel of a G2 reading holds colour temperatures. */
function blue_holds_kelvin(blue: any): boolean {
  return (blue?.points ?? []).some((p: any) => Number(p?.i) > 100);
}

/**
 * Program of a day as the card works with it: times on the day's own
 * timeline, and for a G2 one intensity channel whose points carry their
 * colour temperature.
 *
 * A G2 reading comes in either shape:
 *   - the app's G1 parser shape: `white` points hold the intensities and
 *     `blue` points the colour temperatures, two points per G2 point
 *     (in and out values at the same time);
 *   - `color` points `{t, i1, i2, k1, k2}`, as the app writes them.
 * @param data: the /auto/<day> payload
 * @param day: ISO weekday
 * @param g2: whether the lamp is a G2
 */
export function normalize_program(
  data: any,
  day: number,
  g2: boolean = false,
): DayProgram | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const offset = day_offset(day);
  const out: any = {};
  for (const key of Object.keys(data)) {
    out[key] = shift_channel(data[key], offset);
  }
  if (!g2) return out as DayProgram;

  if (is_channel(out.color)) {
    const points: ProgramPoint[] = [];
    for (const p of out.color.points ?? []) {
      const t = Number(p?.t);
      const i1 = Number(p?.i1 ?? p?.i);
      const i2 = Number(p?.i2 ?? i1);
      const k1 = Number(p?.k1 ?? p?.k);
      const k2 = Number(p?.k2 ?? k1);
      points.push({ t, i: i1, k: k1 });
      if (i2 !== i1 || k2 !== k1) points.push({ t, i: i2, k: k2 });
    }
    out.intensity = { rise: out.color.rise, set: out.color.set, points };
    delete out.color;
  } else if (is_channel(out.white)) {
    const kelvins = blue_holds_kelvin(out.blue) ? out.blue.points : [];
    out.intensity = {
      rise: out.white.rise,
      set: out.white.set,
      points: (out.white.points ?? []).map((p: any, n: number) => {
        const k = Number(kelvins[n]?.i);
        return {
          t: Number(p?.t),
          i: Number(p?.i),
          k: Number.isFinite(k) && k > 100 ? k : DEFAULT_KELVIN,
        };
      }),
    };
  }
  if (out.intensity) {
    out.intensity.points = merge_twins(out.intensity.points);
  }
  delete out.white;
  delete out.blue;
  return out as DayProgram;
}

/**
 * A G2 point is an "in" and an "out" value at the same time: when both are
 * equal, one edit point is enough (device_program() doubles it back).
 * @param points: intensity points with their colour temperature
 */
function merge_twins(points: ProgramPoint[]): ProgramPoint[] {
  return points.filter((p, n) => {
    const prev = points[n - 1];
    return !(
      n > 0 &&
      Number(prev.t) === Number(p.t) &&
      Number(prev.i) === Number(p.i) &&
      point_kelvin(prev) === point_kelvin(p)
    );
  });
}

/**
 * Clouds of a day on the day's own timeline.
 * @param clouds: the clouds payload
 * @param day: ISO weekday
 */
export function normalize_clouds(clouds: any, day: number): any {
  if (!clouds || typeof clouds !== "object") return clouds;
  const offset = day_offset(day);
  const from = Number(clouds.from);
  const to = Number(clouds.to);
  if (!Number.isFinite(from) || !Number.isFinite(to) || from < offset) {
    return clouds;
  }
  return { ...clouds, from: from - offset, to: to - offset };
}

/**
 * Payload to write to /auto/<day>, from a program on the day's timeline.
 *   - G1: white/blue/moon channels, rise and set shifted to the week.
 *   - G2: `color` points `{t, i1, i2, k1, k2}` (two edit points at the same
 *     time make one G2 point), `moon`, and the clouds of the day, which the
 *     G2 keeps in the same payload.
 * @param prog: the program on the day's timeline
 * @param day: ISO weekday
 * @param g2: whether the lamp is a G2
 * @param clouds: clouds of the day on its own timeline (G2)
 */
export function device_program(
  prog: DayProgram,
  day: number,
  g2: boolean = false,
  clouds?: any,
): any {
  const offset = day_offset(day);
  const shift = (ch: any) =>
    is_channel(ch)
      ? { ...ch, rise: Number(ch.rise) + offset, set: Number(ch.set) + offset }
      : undefined;
  if (!g2) {
    const out: any = {};
    for (const key of Object.keys(prog)) {
      const ch = shift((prog as any)[key]);
      if (ch) out[key] = ch;
    }
    return out;
  }
  const out: any = {};
  const color = prog.intensity;
  if (is_channel(color)) {
    const pts = color.points ?? [];
    const points: any[] = [];
    for (let n = 0; n < pts.length; n++) {
      const a = pts[n];
      const b = pts[n + 1];
      const twin = b !== undefined && Number(b.t) === Number(a.t);
      const k1 = point_kelvin(a) ?? DEFAULT_KELVIN;
      const k2 = twin ? (point_kelvin(b) ?? k1) : k1;
      points.push({
        t: Number(a.t),
        i1: Number(a.i),
        i2: twin ? Number(b.i) : Number(a.i),
        k1,
        k2,
      });
      if (twin) n++;
    }
    out.color = { ...shift(color), points };
  }
  const moon = shift(prog.moon);
  if (moon) out.moon = moon;
  const shifted = device_clouds(clouds, day);
  if (shifted) out.clouds = shifted;
  return out;
}

/**
 * Clouds of a day as the lamp stores them: on its weekly timeline.
 * @param clouds: clouds on the day's own timeline
 * @param day: ISO weekday
 * @return the clouds with their offset, null when there are none
 */
export function device_clouds(clouds: any, day: number): any {
  if (!clouds || typeof clouds !== "object") return null;
  const offset = day_offset(day);
  const from = Number(clouds.from);
  const to = Number(clouds.to);
  return {
    ...clouds,
    ...(Number.isFinite(from) ? { from: from + offset } : {}),
    ...(Number.isFinite(to) ? { to: to + offset } : {}),
  };
}

/** Cloud intensities of a lamp, lightest first (ReefBeat app). */
export const CLOUD_LEVELS = ["Low", "Medium", "High"] as const;

/**
 * Minutes of cloud, then of clear sky, of each intensity: sent with the
 * clouds of a G1, as the ReefBeat app does (CloudsIntensity).
 */
export const CLOUD_DURATIONS: Record<string, [number, number]> = {
  Low: [3, 7],
  Medium: [4, 6],
  High: [6, 4],
};

/**
 * Clouds with the cloud and clear durations of their intensity.
 * @param clouds: clouds ({from, to, intensity})
 * @return the clouds as a G1 takes them; unchanged for an unknown intensity
 */
export function with_cloud_durations(clouds: any): any {
  const durations = CLOUD_DURATIONS[String(clouds?.intensity)];
  if (!clouds || typeof clouds !== "object" || !durations) return clouds;
  return {
    ...clouds,
    cloud_duration: durations[0],
    no_cloud_duration: durations[1],
  };
}

/**
 * Whether clouds are set: a window with its start and end.
 * @param clouds: clouds as the lamp holds them ({} once removed)
 */
export function has_clouds(clouds: any): boolean {
  return (
    !!clouds &&
    typeof clouds === "object" &&
    Number.isFinite(Number(clouds.from ?? NaN)) &&
    Number.isFinite(Number(clouds.to ?? NaN))
  );
}

/**
 * Clouds kept inside a program's day. A lamp refuses clouds outside the
 * [rise, set] of the program it holds ("Cloud period is outside the preset
 * [rise:set] interval"), and a program whose day leaves its clouds out.
 * @param clouds: clouds on the day's timeline
 * @param prog: the program on the same timeline
 * @return the clouds cut to the day of light (moon left out), null when
 *         none, or when nothing of them is left
 */
export function fit_clouds(clouds: any, prog: DayProgram | null): any {
  if (!has_clouds(clouds)) return null;
  const from = Number(clouds.from);
  const to = Number(clouds.to);
  const channels = (["white", "blue", "intensity"] as const)
    .map((key) => (prog as any)?.[key])
    .filter(is_channel);
  if (!channels.length) return null;
  const rise = Math.min(...channels.map((ch) => Number(ch.rise)));
  const set = Math.max(...channels.map((ch) => Number(ch.set)));
  const start = Math.max(from, rise);
  const end = Math.min(to, set);
  if (end <= start) return null;
  return start === from && end === to
    ? clouds
    : { ...clouds, from: start, to: end };
}

/**
 * Name of a program as the user gave it. The ReefBeat app stores the name
 * of a library program on the lamp with a creation stamp in milliseconds
 * ("Perso-1745049718480"): the stamp is left out.
 * @param name: the preset name read from the lamp
 */
export function preset_label(name: string): string {
  return name.replace(/-\d{13}$/, "");
}

/**
 * Name the lamp stores for a library program: its name and a stamp, as
 * the ReefBeat app writes it.
 * @param name: the program's name in the library
 * @param now: the time of the write
 */
export function preset_name(name: string, now: Date = new Date()): string {
  return `${name}-${now.getTime()}`;
}

/**
 * Default name of a new program: "prog-" and the local date, YYYYMMDDHHMM.
 * @param now: the date
 */
export function default_program_name(now: Date = new Date()): string {
  const two = (n: number) => String(n).padStart(2, "0");
  return (
    "prog-" +
    now.getFullYear() +
    two(now.getMonth() + 1) +
    two(now.getDate()) +
    two(now.getHours()) +
    two(now.getMinutes())
  );
}

/**
 * A G1 white/blue day program expressed as a G2 one: intensity points
 * carrying their colour temperature, the moon unchanged. Used by a virtual
 * lamp showing the G2 view while its program is read from a G1.
 * @param prog: the G1 program (white, blue, moon)
 * @param model: the G1 model, for its white/blue balance table
 * @return the program with an intensity channel instead of white and blue
 */
export function wb_to_kelvin_program(
  prog: DayProgram | null,
  model?: string,
): DayProgram | null {
  if (!prog) return null;
  if (!is_channel(prog.white) && !is_channel(prog.blue)) return prog;
  const pts = white_blue_to_kelvin_points(
    to_edit_points(prog.white),
    to_edit_points(prog.blue),
    model,
  );
  const out: DayProgram = { ...prog };
  delete out.white;
  delete out.blue;
  // A channel always has its rise and set: at least two points
  out.intensity = from_edit_points(pts, "k") as ChannelProgram;
  return out;
}
