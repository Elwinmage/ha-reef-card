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

import {
  CURVE_COLORS_DEFAULT,
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
 * Label of a colour temperature: 12000 -> "12K", 12500 -> "12.5K".
 * @param k: the colour temperature
 */
/** Width a colour label needs, in chart units ("23K" at 12 px, plus air). */
export const LABEL_GAP = 28;
/** Height of a row of stacked colour labels, in chart units. */
export const LABEL_ROW_HEIGHT = 14;
/** Rows of stacked labels before one is left out. */
export const LABEL_ROWS = 3;

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
    <!-- A channel running past midnight is drawn back at the start of the
         chart (as "yesterday"): what goes beyond 24h is cut -->
    <g clip-path="url(#${opts.id}_clip)">
          ${format === "kelvin" ? kelvin_curve(box, opts, width("intensity"), opacity("intensity")) : ""}
    ${simple}
    </g>
    <line class="chart_axis" x1="${x}" y1="${y + h}" x2="${x + w}"
      y2="${y + h}"></line>
    ${ticks}
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
  // Short zones would write their labels over each other: stack them
  const xs = zones.map((z) => px((z.m0 + z.m1) / 2));
  const rows = label_rows(xs);
  const labels = zones.map((z, n) =>
    rows[n] === null
      ? ""
      : svg`<text class="kelvin_label" x="${xs[n]}"
      y="${y + h - 5 - (rows[n] as number) * LABEL_ROW_HEIGHT}"
      text-anchor="middle"
      fill="${rgb_css(kelvin_rgb(z.k))}">${kelvin_label(z.k)}</text>`,
  );

  return svg`
    <defs>${defs}</defs>
    ${spill_path}
    ${marks}
    ${lines}
    ${labels}
  `;
}
