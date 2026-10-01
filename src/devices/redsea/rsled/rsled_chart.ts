/**
 * Day program chart, shared by the beam and the program editor.
 *
 * - G1 ("wb" format): one curve per channel, white, blue and moon.
 * - G2 ("kelvin" format): the intensity curve, each segment coloured from
 *   the colour temperature of its start to that of its end; a thin line
 *   marks every change of colour temperature and each zone is labelled
 *   with its value (12K, 18K…). The moon curve comes on top.
 */
import { svg, SVGTemplateResult } from "lit";
import { mdiClouds, mdiWeatherCloudy, mdiWeatherPartlyCloudy } from "@mdi/js";

import {
  CURVE_COLORS_DEFAULT,
  CloudProgram,
  DayProgram,
  MINUTES_PER_DAY,
  ProgramChannel,
  channel_value,
  day_curve,
  format_channels,
  kelvin_rgb,
  kelvin_segments,
  kelvin_zones,
  program_format,
  rgb_css,
  to_edit_points,
} from "./rsled_program";

export interface ChartBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChartOptions {
  /** Unique prefix for gradient ids */
  id: string;
  today: DayProgram | null;
  yesterday?: DayProgram | null;
  /** Hour ticks under the axis */
  ticks?: boolean;
  /** Channel drawn thicker, the others faded (editor) */
  highlight?: ProgramChannel | null;
  /** Clouds of the day, on its own timeline: a band over their window */
  clouds?: CloudProgram | null;
  /**
   * Colour labels of a G2 program over the chart (default); false when the
   * caller draws them itself, over what it adds (the editor's handles).
   */
  labels?: boolean;
}

/**
 * Opacity of the clouds band, by the lamp's cloud intensity. Strong enough
 * to be seen on light and dark themes, the curves being drawn over it.
 */
export const CLOUD_BAND_OPACITY: Record<string, number> = {
  Low: 0.3,
  Medium: 0.42,
  High: 0.55,
};

/**
 * Colours of the clouds band: a slate grey-blue, contrasted on light and
 * dark backgrounds, with solid edges and a strip along its top.
 */
export const CLOUD_BAND_COLOR = "rgb(130,150,180)";
export const CLOUD_EDGE_COLOR = "rgb(90,110,145)";
export const CLOUD_STRIP_HEIGHT = 4;

/**
 * Pictogram of each cloud intensity (Material Design Icons, as Home
 * Assistant's): mdi:weather-partly-cloudy, mdi:weather-cloudy, mdi:clouds.
 */
export const CLOUD_ICONS: Record<string, string> = {
  Low: mdiWeatherPartlyCloudy,
  Medium: mdiWeatherCloudy,
  High: mdiClouds,
};

/** Pictograms drawn in the band, by cloud intensity: the cloudier, the more. */
export const CLOUD_COUNT: Record<string, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

/**
 * Size of a drawn cloud: its share of the chart's height, bounded, and
 * never wider than its part of the band.
 */
export const CLOUD_ICON = { share: 0.16, min: 6, max: 28 };

/**
 * Clouds drawn in a band, spread over its width in its upper part.
 * @param box: the chart box
 * @param x0: start of the band
 * @param x1: end of the band
 * @param level: the cloud intensity (Low, Medium, High)
 */
export function band_clouds(
  box: ChartBox,
  x0: number,
  x1: number,
  level: string,
): SVGTemplateResult[] {
  const wanted = CLOUD_COUNT[level] ?? CLOUD_COUNT["Medium"];
  const icon = CLOUD_ICONS[level] ?? CLOUD_ICONS["Medium"];
  const width = x1 - x0;
  let size = Math.max(
    CLOUD_ICON.min,
    Math.min(CLOUD_ICON.max, box.h * CLOUD_ICON.share),
  );
  // A narrow band holds fewer, then smaller clouds
  const count = Math.max(1, Math.min(wanted, Math.floor(width / size)));
  size = Math.max(CLOUD_ICON.min, Math.min(size, (width / count) * 0.95));
  const scale = (size / 24).toFixed(3);
  return Array.from({ length: count }, (_, n) => {
    const cx = x0 + ((n + 0.5) * width) / count;
    // Staggered, as in a sky
    const cy = box.y + box.h * (n % 2 ? 0.34 : 0.2);
    return svg`<path class="clouds_icon" d="${icon}"
      transform="translate(${(cx - size / 2).toFixed(1)} ${(cy - size / 2).toFixed(1)}) scale(${scale})"
      fill="#e8eef6" fill-opacity="0.9" stroke="rgba(20,30,50,0.55)"
      stroke-width="1" paint-order="stroke"></path>`;
  });
}

/**
 * Band of the clouds over the chart: their window, shaded by their
 * intensity, with clouds drawn in it (more for a cloudier sky).
 * @param box: the chart box
 * @param clouds: the clouds of the day, on its own timeline
 */
export function clouds_band(
  box: ChartBox,
  clouds: CloudProgram | null | undefined,
): SVGTemplateResult | string {
  const from = Number(clouds?.from);
  const to = Number(clouds?.to);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return "";
  const { px } = chart_scale(box);
  const x0 = Math.max(box.x, px(from));
  const x1 = Math.min(box.x + box.w, px(to));
  if (x1 <= x0) return "";
  const level = String(clouds?.intensity ?? "Medium");
  const opacity = CLOUD_BAND_OPACITY[level] ?? CLOUD_BAND_OPACITY["Medium"];
  return svg`<g class="clouds_band">
    <rect x="${x0}" y="${box.y}" width="${x1 - x0}" height="${box.h}"
      fill="${CLOUD_BAND_COLOR}" opacity="${opacity}">
      <title>☁ ${level}</title>
    </rect>
    <rect class="clouds_strip" x="${x0}" y="${box.y}" width="${x1 - x0}"
      height="${CLOUD_STRIP_HEIGHT}" fill="${CLOUD_EDGE_COLOR}"
      opacity="0.9"></rect>
    <line x1="${x0}" y1="${box.y}" x2="${x0}" y2="${box.y + box.h}"
      stroke="${CLOUD_EDGE_COLOR}" stroke-opacity="0.9"
      stroke-width="1.5" stroke-dasharray="4 3"></line>
    <line x1="${x1}" y1="${box.y}" x2="${x1}" y2="${box.y + box.h}"
      stroke="${CLOUD_EDGE_COLOR}" stroke-opacity="0.9"
      stroke-width="1.5" stroke-dasharray="4 3"></line>
    ${band_clouds(box, x0, x1, level)}
  </g>`;
}

/**
 * Coordinates helpers of a chart box.
 * @param box: the chart box
 */
export function chart_scale(box: ChartBox) {
  return {
    px: (minute: number) => box.x + (minute / MINUTES_PER_DAY) * box.w,
    py: (pct: number) => box.y + box.h - (pct / 100) * box.h,
    minute_at: (x: number) => ((x - box.x) / box.w) * MINUTES_PER_DAY,
    pct_at: (y: number) => ((box.y + box.h - y) / box.h) * 100,
  };
}

/**
 * Room a colour label needs across the chart, in chart units: the labels
 * are written upright (rotated by 90°), so only the height of the 12 px
 * text, plus air.
 */
export const LABEL_GAP = 13;
/** Rows of labels before one is left out: upright labels need one. */
export const LABEL_ROWS = 1;

/**
 * Row of each colour label: the lowest one where it does not overlap the
 * previous label of that row. A label finding no room is left out.
 * @param xs: centre of each label, from left to right
 * @param gap: least distance between two centres on a row
 * @param rows: number of rows
 * @return the row of each label (0 = bottom), or null when left out
 */
export function label_rows(
  xs: number[],
  gap: number = LABEL_GAP,
  rows: number = LABEL_ROWS,
): (number | null)[] {
  const last: number[] = [];
  return xs.map((x) => {
    for (let r = 0; r < rows; r++) {
      if (last[r] === undefined || x - last[r] >= gap) {
        last[r] = x;
        return r;
      }
    }
    return null;
  });
}

/**
 * Label of a colour temperature: 12000 -> "12K", 12500 -> "12.5K".
 * @param k: the colour temperature
 */
export function kelvin_label(k: number): string {
  const v = Math.round(k / 100) / 10;
  return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}K`;
}

/**
 * Chart of a day program: grid, curves, axis and ticks.
 * @param box: where to draw
 * @param opts: what to draw
 */
export function program_chart(
  box: ChartBox,
  opts: ChartOptions,
): SVGTemplateResult {
  const { x, y, w, h } = box;
  const { px, py } = chart_scale(box);
  const format = program_format(opts.today) ?? "wb";
  const highlight = opts.highlight ?? null;
  const width = (ch: ProgramChannel) =>
    highlight === null ? 2.5 : highlight === ch ? 3.5 : 1.5;
  const opacity = (ch: ProgramChannel) =>
    highlight === null || highlight === ch ? 1 : 0.35;

  // Simple curves: every channel of a G1, the moon of a G2
  const simple = format_channels(format)
    .filter((ch) => ch !== "intensity")
    .reverse()
    .map((ch) => {
      const pts = day_curve(
        (opts.today as any)?.[ch],
        (opts.yesterday as any)?.[ch],
        10,
      );
      if (!pts.some(([, v]) => v > 0)) return svg``;
      const d = pts
        .map(
          ([m, v], k) =>
            `${k ? "L" : "M"} ${px(m).toFixed(1)} ${py(v).toFixed(1)}`,
        )
        .join(" ");
      return svg`<path class="chart_curve curve_${ch}" d="${d}"
        stroke="${CURVE_COLORS_DEFAULT[ch as keyof typeof CURVE_COLORS_DEFAULT]}"
        stroke-width="${width(ch)}" opacity="${opacity(ch)}"></path>`;
    });

  const ticks = opts.ticks
    ? [0, 6, 12, 18, 24].map(
        (hour) =>
          svg`<text class="chart_tick" x="${px(hour * 60)}" y="${y + h + 15}"
            text-anchor="middle">${hour}h</text>`,
      )
    : [];

  return svg`
    ${[25, 50, 75].map(
      (pct) => svg`<line class="chart_grid" x1="${x}" y1="${py(pct)}"
        x2="${x + w}" y2="${py(pct)}"></line>`,
    )}
<defs>
      <clipPath id="${opts.id}_clip">
        <rect x="${x}" y="${y - 6}" width="${w}" height="${h + 12}"></rect>
      </clipPath>
    </defs>
    ${clouds_band(box, opts.clouds)}
    <!-- A channel running past midnight is drawn back at the start of the
         chart (as "yesterday"): what goes beyond 24h is cut -->
    <g clip-path="url(#${opts.id}_clip)">
          ${format === "kelvin" ? kelvin_curve(box, opts, width("intensity"), opacity("intensity")) : ""}
    ${simple}
    </g>
    <line class="chart_axis" x1="${x}" y1="${y + h}" x2="${x + w}"
      y2="${y + h}"></line>
    ${ticks}
    ${opts.labels === false ? "" : kelvin_labels(box, opts.today)}
  `;
}

/**
 * G2 intensity curve, coloured by colour temperature, with its zones.
 */
function kelvin_curve(
  box: ChartBox,
  opts: ChartOptions,
  stroke_width: number,
  opacity: number,
): SVGTemplateResult {
  const { y, h } = box;
  const { px, py } = chart_scale(box);
  const pts = to_edit_points(opts.today?.intensity, true);
  const segments = kelvin_segments(pts);
  const zones = kelvin_zones(pts);

  // Part of yesterday's program still running after midnight
  const spill = day_curve(null, opts.yesterday?.intensity, 10).filter(
    ([, v]) => v > 0,
  );
  const spill_path = spill.length
    ? svg`<path class="chart_curve" d="${spill
        .map(
          ([m, v], k) =>
            `${k ? "L" : "M"} ${px(m).toFixed(1)} ${py(v).toFixed(1)}`,
        )
        .join(" ")}" stroke="rgba(255,255,255,0.6)"
        stroke-width="${stroke_width}" opacity="${opacity}"></path>`
    : "";

  const defs = segments.map(
    (s, n) => svg`<linearGradient id="${opts.id}_k${n}"
        gradientUnits="userSpaceOnUse" x1="${px(s.m0)}" y1="0"
        x2="${px(s.m1)}" y2="0">
        <stop offset="0" stop-color="${rgb_css(kelvin_rgb(s.k0))}"></stop>
        <stop offset="1" stop-color="${rgb_css(kelvin_rgb(s.k1))}"></stop>
      </linearGradient>`,
  );
  const lines = segments.map((s, n) => {
    // A flat, horizontal segment has a zero-height bounding box: a
    // gradient stroke still works with userSpaceOnUse coordinates
    return svg`<path class="chart_curve curve_intensity"
        d="M ${px(s.m0).toFixed(1)} ${py(s.i0).toFixed(1)} L ${px(s.m1).toFixed(1)} ${py(s.i1).toFixed(1)}"
        stroke="url(#${opts.id}_k${n})" stroke-width="${stroke_width}"
        opacity="${opacity}"></path>`;
  });

  // A line where the colour changes, a label per zone
  const marks = zones.slice(1).map((z) => {
    const v = channel_value(opts.today?.intensity, null, z.m0);
    return svg`<line class="kelvin_mark" x1="${px(z.m0)}" y1="${y + h}"
      x2="${px(z.m0)}" y2="${py(v)}"></line>`;
  });
  // Upright labels, reading upwards from the bottom of each zone: a zone
  // too short for its label (the previous one too close) goes without
  return svg`
    <defs>${defs}</defs>
    ${spill_path}
    ${marks}
    ${lines}
  `;
}

/** Width of a character of a colour label, in chart units (bold 11-12 px). */
export const LABEL_CHAR = 6.8;

/**
 * Colour labels of a G2 program: one per zone, upright, reading upwards
 * from the bottom of the zone, each on a small dark box so it stays
 * readable over the curve and its points. A zone too short for its label
 * (the previous one too close) goes without. They take no clicks: the
 * points under them can still be moved.
 * @param box: the chart box
 * @param today: the day's program
 */
export function kelvin_labels(
  box: ChartBox,
  today: DayProgram | null | undefined,
): SVGTemplateResult | string {
  if (program_format(today ?? null) !== "kelvin") return "";
  const { px } = chart_scale(box);
  const zones = kelvin_zones(to_edit_points(today?.intensity, true));
  const xs = zones.map((z) => px((z.m0 + z.m1) / 2));
  const rows = label_rows(xs);
  const base = box.y + box.h - 4;
  return svg`<g class="kelvin_labels" pointer-events="none">${zones.map(
    (z, n) => {
      if (rows[n] === null) return "";
      const x = xs[n].toFixed(1);
      const text = kelvin_label(z.k);
      return svg`<g transform="rotate(-90 ${x} ${base})">
        <rect class="kelvin_box" x="${(xs[n] - 2).toFixed(1)}" y="${base - 7}"
          width="${(text.length * LABEL_CHAR + 4).toFixed(1)}" height="14"
          rx="3"></rect>
        <text class="kelvin_label" x="${x}" y="${base}" text-anchor="start"
          dominant-baseline="central"
          fill="${rgb_css(kelvin_rgb(z.k))}">${text}</text>
      </g>`;
    },
  )}</g>`;
}
