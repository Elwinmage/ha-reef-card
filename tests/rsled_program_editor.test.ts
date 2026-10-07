// Tests for the ReefLED program editor and chart
// Covers: src/devices/redsea/rsled/rsled_program_editor.ts
//         src/devices/redsea/rsled/rsled_chart.ts
//         program formats and editing helpers of rsled_program.ts

import { afterEach, describe, expect, it, vi } from "vitest";
import { render, svg } from "lit";

import "../src/devices/index";
import * as P from "../src/devices/redsea/rsled/rsled_program";
import {
  CLOUD_BAND_COLOR,
  CLOUD_BAND_OPACITY,
  CLOUD_EDGE_COLOR,
  CLOUD_STRIP_HEIGHT,
  chart_scale,
  clouds_band,
  CLOUD_COUNT,
  CLOUD_ICONS,
  CLOUD_ICON,
  kelvin_label,
  kelvin_labels,
  LABEL_CHAR,
  label_rows,
  program_chart,
} from "../src/devices/redsea/rsled/rsled_chart";
import {
  DEFAULT_POINTS,
  EDITOR_CHART,
  RSLedProgramEditor,
} from "../src/devices/redsea/rsled/rsled_program_editor";

// G1: white/blue channels
const G1: P.DayProgram = {
  white: {
    rise: 660,
    set: 1260,
    points: [
      { t: 120, i: 100 },
      { t: 480, i: 100 },
    ],
  },
  blue: {
    rise: 660,
    set: 1341,
    points: [
      { t: 60, i: 100 },
      { t: 540, i: 100 },
    ],
  },
  moon: {
    rise: 1345,
    set: 1523,
    points: [
      { t: 75, i: 10 },
      { t: 105, i: 10 },
    ],
  },
};

// G2 (assumed shape): intensity points carrying a colour temperature
const G2: P.DayProgram = {
  intensity: {
    rise: 600,
    set: 1290,
    points: [
      { t: 60, i: 40, k: 12000 },
      { t: 120, i: 100, k: 18000 },
      { t: 420, i: 100, k: 18000 },
      { t: 480, i: 100, k: 23000 },
      { t: 600, i: 100, k: 23000 },
    ],
  },
  moon: G1.moon,
};

function draw(tpl: any): SVGSVGElement {
  const div = document.createElement("div");
  render(svg`<svg>${tpl}</svg>` as any, div);
  return div.querySelector("svg") as SVGSVGElement;
}

/** A lamp stub holding a program per weekday. */
function makeLed(programs: Record<number, any> = { 1: G1 }) {
  return {
    program: (day: number) => programs[day] ?? null,
    kelvin_range: () => ({ min: 8000, max: 23000 }),
    hass: { callService: vi.fn() },
    device: { elements: [{ primary_config_entry: "entry1" }] },
  };
}

async function mountEditor(led: any, day = 1, hint: P.ProgramFormat = "wb") {
  const ed = new RSLedProgramEditor();
  ed.load(led, day, hint);
  document.body.appendChild(ed);
  await ed.updateComplete;
  return ed as any;
}

afterEach(() => {
  document.body.innerHTML = "";
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

describe("rsled_program: formats", () => {
  it("program_format() and format_channels()", () => {
    expect(P.program_format(G1)).toBe("wb");
    expect(P.program_format(G2)).toBe("kelvin");
    expect(P.program_format({ moon: G1.moon })).toBeNull();
    expect(P.program_format(null)).toBeNull();
    expect(P.format_channels("wb")).toEqual(["white", "blue", "moon"]);
    expect(P.format_channels("kelvin")).toEqual(["intensity", "moon"]);
  });

  it("sun_window() also reads the G2 intensity channel", () => {
    expect(P.sun_window(G2)).toEqual({ rise: 600, set: 1290 });
  });

  it("point_kelvin() reads k or kelvin", () => {
    expect(P.point_kelvin({ t: 0, i: 0, k: 12000 })).toBe(12000);
    expect(P.point_kelvin({ t: 0, i: 0, kelvin: 9000 })).toBe(9000);
    expect(P.point_kelvin({ t: 0, i: 0 })).toBeNull();
    expect(P.point_kelvin(null)).toBeNull();
  });

  it("kelvin_key_of() keeps the key the device used", () => {
    expect(P.kelvin_key_of(G2.intensity)).toBe("k");
    expect(
      P.kelvin_key_of({
        rise: 0,
        set: 10,
        points: [{ t: 1, i: 1, kelvin: 1 }],
      }),
    ).toBe("kelvin");
    expect(P.kelvin_key_of(null)).toBe("k");
  });
});

describe("rsled_program: G1 white/blue <-> kelvin", () => {
  it("white_blue_to_kelvin() inverts the G1 table", () => {
    expect(P.white_blue_to_kelvin(100, 50)).toBe(11000);
    expect(P.white_blue_to_kelvin(100, 100)).toBe(15000);
    expect(P.white_blue_to_kelvin(10, 100)).toBe(23000);
    expect(P.white_blue_to_kelvin(100, 0)).toBe(9000);
    expect(P.white_blue_to_kelvin(0, 100)).toBe(23000);
    expect(P.white_blue_to_kelvin(300, 100)).toBe(10300);
    expect(P.white_blue_to_kelvin(30, 100)).toBe(21500);
    // Nothing lit: no colour, the default one
    expect(P.white_blue_to_kelvin("x" as any, -1)).toBe(P.DEFAULT_KELVIN);
    // Round trip through the table
    for (const k of [9000, 12000, 15000, 18000, 23000]) {
      const { white, blue } = P.kelvin_to_white_blue(k);
      expect(Math.abs(P.white_blue_to_kelvin(white, blue) - k)).toBeLessThan(
        400,
      );
    }
  });

  it("each G1 model has its own white/blue table", () => {
    // RSLED50 is bluer than the RSLED160 at the same colour temperature
    expect(P.kelvin_to_white_blue(15000, "RSLED50")).toEqual({
      white: 50,
      blue: 100,
    });
    expect(P.kelvin_to_white_blue(15000, "RSLED160")).toEqual({
      white: 100,
      blue: 100,
    });
    expect(P.kelvin_to_white_blue(12000, "rsled90")).toEqual({
      white: 100,
      blue: 66,
    });
    // Unknown model: RSLED160 table
    expect(P.kelvin_to_white_blue(12000, "RSLED999")).toEqual(
      P.kelvin_to_white_blue(12000, "RSLED160"),
    );
    expect(P.white_blue_to_kelvin(50, 100, "RSLED50")).toBe(15000);
    expect(P.white_blue_to_kelvin(50, 100, "RSLED160")).toBe(20000);
    const pts = P.white_blue_to_kelvin_points(
      [
        { m: 0, i: 0 },
        { m: 5, i: 50 },
        { m: 10, i: 0 },
      ],
      [
        { m: 0, i: 0 },
        { m: 5, i: 100 },
        { m: 10, i: 0 },
      ],
      "RSLED50",
    );
    expect(pts[1].k).toBe(15000);
    expect(P.kelvin_points_to_white_blue(pts, "RSLED50").white[1].i).toBe(50);
  });

  it("kelvin_points_from_samples() clamps and colours the ends", () => {
    const samples = [
      { m: 0, w: 0, b: 0 },
      { m: 5, w: 50, b: 100 },
    ];
    expect(
      P.kelvin_points_from_samples(samples, [
        {},
        { intensity: 250, kelvin: 20000 },
      ]),
    ).toEqual([
      { m: 0, i: 0, k: 20000 },
      { m: 5, i: 0, k: 20000 },
    ]);
  });

  it("edit_value_at() interpolates edited points", () => {
    const pts = [
      { m: 0, i: 0 },
      { m: 10, i: 100 },
      { m: 10, i: 50 },
      { m: 20, i: 0 },
    ];
    expect(P.edit_value_at(pts, 5)).toBe(50);
    expect(P.edit_value_at(pts, 10)).toBe(100);
    expect(P.edit_value_at(pts, 15)).toBe(25);
    expect(P.edit_value_at(pts, 30)).toBe(0);
    expect(P.edit_value_at([], 5)).toBe(0);
    // Two points on the same minute
    expect(
      P.edit_value_at(
        [
          { m: 5, i: 0 },
          { m: 5, i: 40 },
        ],
        5,
      ),
    ).toBe(40);
  });

  it("white/blue to intensity points and back", () => {
    const white = P.to_edit_points(G1.white);
    const blue = P.to_edit_points(G1.blue);
    const pts = P.white_blue_to_kelvin_points(white, blue);
    expect(pts.map((p) => p.m)).toEqual([
      660, 720, 780, 1140, 1200, 1260, 1341,
    ]);
    expect(pts[0]).toEqual({ m: 660, i: 0, k: 20000 });
    expect(pts[1]).toEqual({ m: 720, i: 100, k: 20000 });
    expect(pts[2]).toEqual({ m: 780, i: 100, k: 15000 });
    expect(pts[pts.length - 1]).toEqual({ m: 1341, i: 0, k: 23000 });
    const back = P.kelvin_points_to_white_blue(pts);
    expect(back.white[2]).toEqual({ m: 780, i: 100 });
    expect(back.blue[1]).toEqual({ m: 720, i: 100 });
    expect(back.white[1]).toEqual({ m: 720, i: 50 });
    // Blue alone at the end of the day: the coldest colour
    expect(pts[5]).toEqual({ m: 1260, i: 57, k: 23000 });
    // Nothing lit anywhere: default colour
    const dark = P.white_blue_to_kelvin_points(
      [
        { m: 0, i: 0 },
        { m: 10, i: 0 },
      ],
      [],
    );
    expect(dark.every((p) => p.k === P.DEFAULT_KELVIN)).toBe(true);
    expect(P.white_blue_to_kelvin_points([], [])).toEqual([]);
    expect(P.kelvin_points_to_white_blue([{ m: 0, i: 50 }]).white).toEqual([
      { m: 0, i: 50 },
    ]);
  });
});

describe("rsled_program: device format", () => {
  it("day_offset() places each day on the weekly timeline", () => {
    expect(P.day_offset(1)).toBe(0);
    expect(P.day_offset(2)).toBe(1440);
    expect(P.day_offset(7)).toBe(8640);
    expect(P.day_offset(0)).toBe(0);
    expect(P.day_offset("x" as any)).toBe(0);
  });

  it("reads and writes back a real RSLED160 Tuesday (captured)", () => {
    // POST /auto/2 as the Red Sea app sends it
    const tuesday = {
      moon: {
        rise: 2760,
        set: 2940,
        points: [
          { t: 75, i: 10 },
          { t: 105, i: 10 },
        ],
      },
      blue: {
        rise: 2100,
        set: 2760,
        points: [
          { t: 60, i: 100 },
          { t: 600, i: 60 },
        ],
      },
      white: {
        rise: 2100,
        set: 2760,
        points: [
          { t: 60, i: 100 },
          { t: 600, i: 100 },
        ],
      },
    };
    const prog: any = P.normalize_program(tuesday, 2);
    expect(prog.white.rise).toBe(660);
    expect(prog.moon.set).toBe(1500);
    expect(P.sun_window(prog)).toEqual({ rise: 660, set: 1320 });
    expect(P.device_program(prog, 2)).toEqual(tuesday);
    // Its clouds, POST /clouds/4 of the same capture
    expect(
      P.normalize_clouds({ intensity: "Low", from: 5160, to: 5455 }, 4),
    ).toEqual({ intensity: "Low", from: 840, to: 1135 });
  });

  it("normalize_program() removes the day offset (G1)", () => {
    const friday = {
      white: {
        rise: 660 + 5760,
        set: 1260 + 5760,
        points: [{ t: 120, i: 100 }],
      },
      moon: { rise: 1345 + 5760, set: 1523 + 5760, points: [] },
      name: "Perso",
    };
    const prog: any = P.normalize_program(friday, 5);
    expect(prog.white).toEqual({
      rise: 660,
      set: 1260,
      points: [{ t: 120, i: 100 }],
    });
    expect(prog.moon.rise).toBe(1345);
    expect(prog.name).toBe("Perso");
    // Already on its own day (old firmware, Monday): untouched
    expect(P.normalize_program(G1, 3)).toEqual(G1);
    expect(P.normalize_program({ white: { rise: "x", set: 1 } }, 3)).toEqual({
      white: { rise: "x", set: 1 },
    });
    expect(P.normalize_program(null, 1)).toBeNull();
    expect(P.normalize_program([], 1)).toBeNull();
  });

  it("G2 read through the G1 parser: white = intensity, blue = kelvin", () => {
    const raw = {
      white: {
        rise: 480 + 1440,
        set: 1140 + 1440,
        points: [
          { t: 60, i: 100 },
          { t: 60, i: 100 },
          { t: 600, i: 100 },
          { t: 600, i: 50 },
        ],
      },
      blue: {
        rise: 480 + 1440,
        set: 1140 + 1440,
        points: [
          { t: 60, i: 15000 },
          { t: 60, i: 15000 },
          { t: 600, i: 15000 },
          { t: 600, i: 20000 },
        ],
      },
      moon: G1.moon,
    };
    const prog: any = P.normalize_program(raw, 2, true);
    expect(prog.white).toBeUndefined();
    expect(prog.blue).toBeUndefined();
    // Identical in/out values merged, a real change kept
    expect(prog.intensity).toEqual({
      rise: 480,
      set: 1140,
      points: [
        { t: 60, i: 100, k: 15000 },
        { t: 600, i: 100, k: 15000 },
        { t: 600, i: 50, k: 20000 },
      ],
    });
    expect(P.program_format(prog)).toBe("kelvin");
    // Blue holding real channel levels: default colour
    const plain: any = P.normalize_program(G1, 1, true);
    expect(plain.intensity.points[0].k).toBe(P.DEFAULT_KELVIN);
    // Nothing to decode
    expect(P.normalize_program({ moon: G1.moon }, 1, true)).toEqual({
      moon: G1.moon,
    });
  });

  it("G2 color payload read as written by the app", () => {
    const raw = {
      color: {
        rise: 480,
        set: 1140,
        points: [
          { t: 60, i1: 80, i2: 80, k1: 12000, k2: 12000 },
          { t: 300, i1: 80, i2: 100, k1: 12000, k2: 18000 },
          { t: 400, i: 60, k: 9000 },
        ],
      },
    };
    const prog: any = P.normalize_program(raw, 1, true);
    expect(prog.color).toBeUndefined();
    expect(prog.intensity.points).toEqual([
      { t: 60, i: 80, k: 12000 },
      { t: 300, i: 80, k: 12000 },
      { t: 300, i: 100, k: 18000 },
      { t: 400, i: 60, k: 9000 },
    ]);
  });

  it("normalize_clouds() removes the day offset", () => {
    expect(P.normalize_clouds({ from: 859 + 2880, to: 996 + 2880 }, 3)).toEqual(
      {
        from: 859,
        to: 996,
      },
    );
    const c = { from: 859, to: 996, intensity: "Low" };
    expect(P.normalize_clouds(c, 3)).toBe(c);
    expect(P.normalize_clouds({ intensity: "Low" }, 3)).toEqual({
      intensity: "Low",
    });
    expect(P.normalize_clouds(null, 3)).toBeNull();
  });

  it("device_program(): G1 channels shifted to the week", () => {
    const out = P.device_program({ ...G1, name: "x" } as any, 3);
    expect(out.white).toEqual({
      ...G1.white,
      rise: 660 + 2880,
      set: 1260 + 2880,
    });
    expect(out.moon.set).toBe(1523 + 2880);
    expect(out.name).toBeUndefined();
  });

  it("device_program(): G2 color points, moon and clouds", () => {
    const prog: P.DayProgram = {
      intensity: {
        rise: 480,
        set: 1140,
        points: [
          { t: 60, i: 100, k: 15000 },
          { t: 600, i: 100, k: 15000 },
          { t: 600, i: 50, k: 20000 },
          { t: 620, i: 40 },
        ],
      },
      moon: G1.moon,
    };
    const out = P.device_program(prog, 2, true, {
      from: 859,
      to: 996,
      intensity: "High",
    });
    expect(out.color.rise).toBe(480 + 1440);
    expect(out.color.set).toBe(1140 + 1440);
    expect(out.color.points).toEqual([
      { t: 60, i1: 100, i2: 100, k1: 15000, k2: 15000 },
      { t: 600, i1: 100, i2: 50, k1: 15000, k2: 20000 },
      { t: 620, i1: 40, i2: 40, k1: P.DEFAULT_KELVIN, k2: P.DEFAULT_KELVIN },
    ]);
    expect(out.moon.rise).toBe(1345 + 1440);
    expect(out.clouds).toEqual({ from: 2299, to: 2436, intensity: "High" });
    // A twin without colour takes its partner's
    const twin = P.device_program(
      {
        intensity: {
          rise: 0,
          set: 10,
          points: [
            { t: 5, i: 10, k: 9000 },
            { t: 5, i: 20 },
          ],
        },
      },
      1,
      true,
      { intensity: "Low" },
    );
    expect(twin.color.points[0]).toEqual({
      t: 5,
      i1: 10,
      i2: 20,
      k1: 9000,
      k2: 9000,
    });
    expect(twin.clouds).toEqual({ intensity: "Low" });
    expect(P.device_program({}, 1, true)).toEqual({});
  });
});

describe("rsled_program: edit points", () => {
  it("to_edit_points() frames the points with rise and set", () => {
    expect(P.to_edit_points(G1.white)).toEqual([
      { m: 660, i: 0 },
      { m: 780, i: 100 },
      { m: 1140, i: 100 },
      { m: 1260, i: 0 },
    ]);
    expect(P.to_edit_points(null)).toEqual([]);
    // Invalid points dropped, out-of-window points clamped
    const odd = P.to_edit_points({
      rise: 100,
      set: 200,
      points: [{ t: 500, i: 150 }, { t: "x" as any, i: 1 }, null as any],
    });
    expect(odd).toEqual([
      { m: 100, i: 0 },
      { m: 200, i: 100 },
      { m: 200, i: 0 },
    ]);
  });

  it("to_edit_points() with kelvin colours rise and set", () => {
    const pts = P.to_edit_points(G2.intensity, true);
    expect(pts[0]).toEqual({ m: 600, i: 0, k: 12000 });
    expect(pts[pts.length - 1]).toEqual({ m: 1290, i: 0, k: 23000 });
    const bare = P.to_edit_points({ rise: 0, set: 10 }, true);
    expect(bare).toEqual([
      { m: 0, i: 0, k: P.DEFAULT_KELVIN },
      { m: 10, i: 0, k: P.DEFAULT_KELVIN },
    ]);
    const nok = P.to_edit_points(
      { rise: 0, set: 10, points: [{ t: 5, i: 50 }] },
      true,
    );
    expect(nok[1].k).toBe(P.DEFAULT_KELVIN);
  });

  it("from_edit_points() rebuilds the channel", () => {
    expect(P.from_edit_points(P.to_edit_points(G1.white))).toEqual(G1.white);
    expect(
      P.from_edit_points(P.to_edit_points(G2.intensity, true), "k"),
    ).toEqual(G2.intensity);
    const kel = P.from_edit_points(
      [
        { m: 0, i: 0 },
        { m: 5, i: 50 },
        { m: 10, i: 0 },
      ],
      "kelvin",
    );
    expect(kel?.points).toEqual([{ t: 5, i: 50, kelvin: P.DEFAULT_KELVIN }]);
    expect(P.from_edit_points([{ m: 0, i: 0 }])).toBeNull();
  });

  it("kelvin_segments() and kelvin_zones()", () => {
    const pts = P.to_edit_points(G2.intensity, true);
    const seg = P.kelvin_segments(pts);
    expect(seg.length).toBe(pts.length - 1);
    expect(seg[0]).toEqual({
      m0: 600,
      m1: 660,
      i0: 0,
      i1: 40,
      k0: 12000,
      k1: 12000,
    });
    expect(P.kelvin_zones(pts)).toEqual([
      { m0: 600, m1: 720, k: 12000 },
      { m0: 720, m1: 1080, k: 18000 },
      { m0: 1080, m1: 1290, k: 23000 },
    ]);
    expect(P.kelvin_zones([])).toEqual([]);
    // Points without colour fall back to the default one
    const plain = [
      { m: 0, i: 0 },
      { m: 5, i: 50 },
      { m: 7, i: 50 },
      { m: 10, i: 0 },
    ];
    expect(P.kelvin_zones(plain)).toEqual([
      { m0: 0, m1: 10, k: P.DEFAULT_KELVIN },
    ]);
    expect(P.kelvin_segments(plain)[0].k0).toBe(P.DEFAULT_KELVIN);
  });

  it("parse_time() and place_time()", () => {
    expect(P.parse_time("07:05")).toBe(425);
    expect(P.parse_time(" 7:05 ")).toBe(425);
    expect(P.parse_time("24:00")).toBeNull();
    expect(P.parse_time("10:60")).toBeNull();
    expect(P.parse_time("x")).toBeNull();
    expect(P.parse_time(undefined as any)).toBeNull();
    expect(P.place_time(600, 500, 700)).toBe(600);
    // Earlier than the previous point: past midnight
    expect(P.place_time(60, 1300, null)).toBe(1500);
    expect(P.place_time(60, 1300, 1450)).toBe(1449);
    expect(P.place_time(800, null, 700)).toBe(699);
    expect(P.place_time(10, null, null)).toBe(10);
  });
});

// ─── Chart ───────────────────────────────────────────────────────────────────

describe("rsled_chart", () => {
  const box = { x: 0, y: 0, w: 1440, h: 100 };

  it("chart_scale() maps minutes and percents both ways", () => {
    const s = chart_scale(box);
    expect(s.px(720)).toBe(720);
    expect(s.py(100)).toBe(0);
    expect(s.minute_at(360)).toBe(360);
    expect(s.pct_at(25)).toBe(75);
  });

  it("kelvin_label() shortens the value", () => {
    expect(kelvin_label(12000)).toBe("12K");
    expect(kelvin_label(12500)).toBe("12.5K");
  });

  it("G1: one curve per channel, highlight fades the others", () => {
    const el = draw(program_chart(box, { id: "t", today: G1, ticks: true }));
    expect(el.querySelectorAll(".chart_curve").length).toBe(3);
    expect(el.querySelectorAll(".chart_tick").length).toBe(5);
    const hl = draw(
      program_chart(box, { id: "t", today: G1, highlight: "blue" }),
    );
    expect(hl.querySelector(".curve_blue")?.getAttribute("stroke-width")).toBe(
      "3.5",
    );
    expect(hl.querySelector(".curve_white")?.getAttribute("opacity")).toBe(
      "0.35",
    );
    expect(hl.querySelectorAll(".chart_tick").length).toBe(0);
  });

  it("G2: intensity by segment, colour changes marked and labelled", () => {
    const el = draw(program_chart(box, { id: "g2", today: G2, yesterday: G2 }));
    expect(el.querySelectorAll(".curve_intensity").length).toBe(6);
    expect(el.querySelectorAll("linearGradient").length).toBe(6);
    expect(el.querySelectorAll(".kelvin_mark").length).toBe(2);
    const labels = [...el.querySelectorAll(".kelvin_label")].map(
      (t) => t.textContent,
    );
    expect(labels).toEqual(["12K", "18K", "23K"]);
    // Yesterday's program running past midnight shows up
    const spill = draw(
      program_chart(box, {
        id: "g2",
        today: G2,
        yesterday: {
          intensity: { rise: 1400, set: 1500, points: [{ t: 50, i: 50 }] },
        },
      }),
    );
    expect(spill.querySelectorAll(".chart_curve").length).toBe(8);
  });

  it("cuts what runs past 24h: it is drawn back at the start", () => {
    const late: P.DayProgram = {
      intensity: {
        rise: 1200,
        set: 1560,
        points: [{ t: 180, i: 80, k: 12000 }],
      },
    };
    const el = draw(
      program_chart(box, { id: "late", today: late, yesterday: late }),
    );
    const clip = el.querySelector("clipPath#late_clip rect");
    expect(clip?.getAttribute("width")).toBe("1440");
    expect(
      el.querySelector("g[clip-path]")?.querySelectorAll(".chart_curve").length,
    ).toBeGreaterThan(0);
  });

  it("an empty program draws only the grid", () => {
    const el = draw(program_chart(box, { id: "e", today: null }));
    expect(el.querySelectorAll(".chart_curve").length).toBe(0);
    expect(el.querySelectorAll(".chart_grid").length).toBe(3);
  });
});

// ─── Editor ──────────────────────────────────────────────────────────────────

describe("RSLedProgramEditor", () => {
  it("loads a G1 day and renders chart and table", async () => {
    const ed = await mountEditor(makeLed());
    expect(ed.format).toBe("wb");
    expect(ed._channel).toBe("white");
    const root = ed.shadowRoot;
    expect(root.querySelectorAll(".tab").length).toBe(3);
    expect(root.querySelectorAll("tr").length).toBe(5); // header + 4 points
    expect(root.querySelectorAll(".handle").length).toBe(4);
    expect(root.querySelector("input.kelvin")).toBeNull();
    // Rise and set keep 0 %: their intensity cannot be typed
    const pct = root.querySelectorAll("input.intensity");
    expect(pct[0].disabled).toBe(true);
    expect(pct[1].disabled).toBe(false);
    expect(ed.program()).toEqual(G1);
  });

  it("G1: edits as intensity + colour, saves as white/blue", async () => {
    const led = makeLed({ 1: G1, 2: G1 });
    const ed = await mountEditor(led);
    const root = ed.shadowRoot;
    await ed.set_mode("kelvin");
    await ed.updateComplete;
    expect(ed.mode).toBe("kelvin");
    expect(ed._channel).toBe("intensity");
    expect(root.querySelectorAll("input.kelvin").length).toBe(7);
    // The chart shows the intensity coloured by temperature
    expect(root.querySelectorAll(".curve_intensity").length).toBe(6);
    expect(ed.chart_program().white).toBeUndefined();
    // Saved as white/blue: no intensity channel on a G1
    ed.set_kelvin(2, 9000);
    const prog = ed.program();
    expect(prog.intensity).toBeUndefined();
    expect(prog.white?.points?.length).toBe(5);
    // Changing day keeps the kelvin mode
    ed.load(led, 2);
    await new Promise((r) => setTimeout(r, 0));
    expect(ed.mode).toBe("kelvin");
    // Back to white/blue
    await ed.set_mode("wb");
    expect(ed.mode).toBe("wb");
    expect(ed._channel).toBe("white");
    await ed.set_mode("wb"); // already
    // An empty day in kelvin mode charts nothing
    await ed.set_mode("kelvin");
    ed.points = { intensity: [], moon: [] };
    expect(ed.chart_program()).toEqual({});
  });

  it("W/B | K and save buttons, and an empty G1 day", async () => {
    const led: any = makeLed({});
    const ed = await mountEditor(led);
    const root = ed.shadowRoot;
    root.querySelector(".mode_k").click();
    await new Promise((r) => setTimeout(r, 0));
    expect(ed.mode).toBe("kelvin");
    expect(ed.points.intensity).toEqual([]);
    ed.points = {};
    expect(ed.chart_program()).toEqual({});
    expect(ed.program()).toEqual({});
    root.querySelector(".mode_wb").click();
    await new Promise((r) => setTimeout(r, 0));
    expect(ed.mode).toBe("wb");
    ed.points = {};
    expect(ed.program()).toEqual({});
    await ed.set_mode("kelvin");
    expect(ed.points.intensity).toEqual([]);
    const closed = vi.fn();
    ed.addEventListener("rsled-editor-close", closed);
    root.querySelector("button.save").click();
    await new Promise((r) => setTimeout(r, 0));
    expect(closed).toHaveBeenCalled();
  });

  it("G1 conversion goes through redsea.led_convert", async () => {
    const led: any = makeLed();
    // The integration answers with its own values (compensation, table)
    led.hass.callWS = vi.fn(async (msg: any) => ({
      response: {
        // The editor also asks for the cloud library: not linked
        points: (msg.service_data.points ?? []).map((p: any) =>
          "kelvin" in p
            ? { white: 42, blue: 84 }
            : { kelvin: 12300, intensity: Math.max(p.white, p.blue) },
        ),
      },
    }));
    const ed = await mountEditor(led);
    await ed.set_mode("kelvin");
    const msg = led.hass.callWS.mock.calls
      .map((c: any[]) => c[0])
      .find((m: any) => m.service === "led_convert");
    expect(msg).toMatchObject({
      type: "call_service",
      domain: "redsea",
      service: "led_convert",
      return_response: true,
    });
    expect(msg.service_data.device_id).toBe("entry1");
    expect(msg.service_data.points[2]).toEqual({ white: 100, blue: 100 });
    expect(ed.points.intensity[2]).toEqual({ m: 780, i: 100, k: 12300 });
    // Saved back through the service too
    await ed.save();
    const saved = led.hass.callService.mock.calls[0][2].data;
    expect(saved.white.points[0]).toEqual({ t: 60, i: 42 });
    expect(saved.blue.points[0]).toEqual({ t: 60, i: 84 });
  });

  it("led_convert unavailable or odd: local tables", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const led: any = makeLed();
    led.hass.callWS = vi.fn(async () => undefined);
    const ed = await mountEditor(led);
    expect(await ed.convert([])).toBeNull();
    led.hass.callWS = vi.fn(async () => {
      throw new Error("unknown service");
    });
    expect(await ed.convert([{ white: 1, blue: 1 }])).toBeNull();
    expect(warn).toHaveBeenCalled();
    led.hass.callWS = vi.fn(async () => ({ response: { points: [] } }));
    expect(await ed.convert([{ white: 1, blue: 1 }])).toBeNull();
    led.hass.callWS = vi.fn(async () => ({ response: {} }));
    expect(await ed.convert([{ white: 1, blue: 1 }])).toBeNull();
    delete led.hass.callWS;
    expect(await ed.convert([{ white: 1, blue: 1 }])).toBeNull();
    await ed.set_mode("kelvin");
    expect(ed.points.intensity[2].k).toBe(15000);
    warn.mockRestore();
  });

  it("partial led_convert answers fall back point by point", () => {
    const pts = [
      { m: 0, i: 0, k: 15000 },
      { m: 5, i: 100, k: 15000 },
      { m: 10, i: 0, k: 15000 },
    ];
    const res = P.kelvin_points_to_white_blue(pts, undefined, [
      {},
      { white: 150, blue: -5 },
    ]);
    expect(res.white[1]).toEqual({ m: 5, i: 100 });
    expect(res.blue[1]).toEqual({ m: 5, i: 0 });
    expect(res.white[2]).toEqual({ m: 10, i: 0 });
  });

  it("G1 conversion uses the lamp's model", async () => {
    const led: any = makeLed();
    led.device.elements[0].model = "RSLED50";
    const ed = await mountEditor(led);
    await ed.set_mode("kelvin");
    // 13:00: white = blue = 100 % is 12000 K on a RSLED50
    expect(ed.points.intensity.find((p: any) => p.m === 780).k).toBe(12000);
  });

  it("G2: no W/B switch, mode stays kelvin", async () => {
    const ed = await mountEditor(makeLed({ 3: G2 }), 3, "kelvin");
    expect(ed.shadowRoot.querySelector(".mode")).toBeNull();
    await ed.set_mode("wb");
    expect(ed.mode).toBe("kelvin");
    expect(ed.chart_program()).toEqual(ed.program());
  });

  it("draws the part past midnight back at the start of the chart", async () => {
    const ed = await mountEditor(makeLed());
    const d = ed.shadowRoot.querySelector(".curve_moon").getAttribute("d");
    const [, x, y] = /^M ([\d.]+) ([\d.]+)/.exec(d)!;
    const { px, py } = chart_scale(EDITOR_CHART);
    // At 00:00 the moon is still at 10 %, not at 0
    expect(Number(x)).toBeCloseTo(px(0), 0);
    expect(Number(y)).toBeCloseTo(py(10), 0);
  });

  it("loads a G2 day with its colour column", async () => {
    const ed = await mountEditor(makeLed({ 3: G2 }), 3, "kelvin");
    expect(ed.format).toBe("kelvin");
    expect(ed._channel).toBe("intensity");
    expect(ed.shadowRoot.querySelectorAll("input.kelvin").length).toBe(7);
    expect(ed.program()).toEqual(G2);
  });

  it("an empty day takes the format hint", async () => {
    const ed = await mountEditor(makeLed({}), 4, "kelvin");
    expect(ed.format).toBe("kelvin");
    expect(ed.points.intensity).toEqual([]);
    expect(ed.program()).toEqual({});
    const ed2 = await mountEditor({}, 4);
    expect(ed2.format).toBe("wb");
  });

  it("switching day and channel from the header", async () => {
    const ed = await mountEditor(makeLed({ 1: G1, 2: G2 }));
    const tabs = ed.shadowRoot.querySelectorAll(".tab");
    tabs[1].click();
    await ed.updateComplete;
    expect(ed._channel).toBe("blue");
    const select = ed.shadowRoot.querySelector("select.day");
    select.value = "2";
    select.dispatchEvent(new Event("change"));
    expect(ed.day).toBe(2);
    expect(ed.format).toBe("kelvin");
    // Blue does not exist on a G2: back to the first channel
    expect(ed._channel).toBe("intensity");
  });

  it("edits times, intensities and colours from the table", async () => {
    const ed = await mountEditor(makeLed({ 1: G2 }), 1, "kelvin");
    const root = ed.shadowRoot;
    const time = root.querySelectorAll("input.time")[1];
    time.value = "11:30";
    time.dispatchEvent(new Event("change"));
    expect(ed.points.intensity[1].m).toBe(690);
    ed.set_time(1, "bad");
    ed.set_time(99, "10:00");
    expect(ed.points.intensity[1].m).toBe(690);

    const pct = root.querySelectorAll("input.intensity")[1];
    pct.value = "150";
    pct.dispatchEvent(new Event("change"));
    expect(ed.points.intensity[1].i).toBe(100);
    ed.set_intensity(0, 50); // rise stays at 0
    ed.set_intensity(1, NaN);
    expect(ed.points.intensity[0].i).toBe(0);
    expect(ed.points.intensity[1].i).toBe(100);

    const k = root.querySelectorAll("input.kelvin")[2];
    k.value = "30000";
    k.dispatchEvent(new Event("change"));
    expect(ed.points.intensity[2].k).toBe(23000);
    ed.set_kelvin(2, 7000);
    expect(ed.points.intensity[2].k).toBe(8000);
    ed.set_kelvin(2, NaN);
    ed.set_kelvin(99, 9000);
    expect(ed.points.intensity[2].k).toBe(8000);
    // Without a lamp range, the G2 bounds apply
    ed.led = {};
    ed.set_kelvin(2, 1000);
    expect(ed.points.intensity[2].k).toBe(8000);
  });

  it("adds and removes points", async () => {
    const ed = await mountEditor(makeLed());
    const root = ed.shadowRoot;
    root.querySelector("button.add").click();
    // Widest gap of white: 13:00 -> 19:00
    expect(ed.points.white.map((p: any) => p.m)).toEqual([
      660, 780, 960, 1140, 1260,
    ]);
    await ed.updateComplete;
    root.querySelectorAll("button.remove")[1].click();
    expect(ed.points.white.length).toBe(4);
    ed.remove_point(0); // rise stays
    ed.remove_point(3); // set stays
    expect(ed.points.white.length).toBe(4);
    // A gap too small to split
    ed.points.white = [
      { m: 0, i: 0 },
      { m: 1, i: 0 },
    ];
    ed.add_point();
    expect(ed.points.white.length).toBe(2);
    // A new point takes the colour of its left neighbour
    ed.points.white = [
      { m: 0, i: 0, k: 9000 },
      { m: 100, i: 0, k: 20000 },
    ];
    ed.add_point();
    expect(ed.points.white[1]).toEqual({ m: 50, i: 0, k: 9000 });
  });

  it("clears a channel and restarts it from a default program", async () => {
    const ed = await mountEditor(makeLed());
    ed.shadowRoot.querySelector("button.clear").click();
    expect(ed.points.white).toEqual([]);
    expect(ed.program().white).toBeUndefined();
    await ed.updateComplete;
    expect(ed.shadowRoot.querySelector("button.clear")).toBeNull();
    ed.add_point();
    expect(ed.points.white).toEqual(DEFAULT_POINTS.white);
  });

  it("drags a point on the chart", async () => {
    const ed = await mountEditor(makeLed());
    const { px, py } = chart_scale(EDITOR_CHART);
    // Time snapped to 5 minutes, intensity from the height
    ed.drag_to(1, px(802), py(60));
    expect(ed.points.white[1]).toEqual({ m: 800, i: 60 });
    // Bounded by its neighbours
    ed.drag_to(1, px(0), py(150));
    expect(ed.points.white[1]).toEqual({ m: 661, i: 100 });
    // Rise: only its time moves
    ed.drag_to(0, px(600), py(80));
    expect(ed.points.white[0]).toEqual({ m: 600, i: 0 });
    ed.drag_to(3, px(1440), py(0));
    expect(ed.points.white[3].m).toBe(1440);
    ed.drag_to(99, 0, 0);
    // A point past midnight stays on the next day's side
    ed._channel = "moon";
    ed.drag_to(3, px(100), py(0));
    expect(ed.points.moon[3].m).toBe(1540);
  });

  it("drags with the pointer", async () => {
    const ed = await mountEditor(makeLed());
    const root = ed.shadowRoot;
    const svg_el = root.querySelector("svg") as SVGSVGElement;
    svg_el.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 320, height: 164 }) as DOMRect;
    const handle = root.querySelectorAll(".handle")[1];
    handle.dispatchEvent(
      new PointerEvent("pointerdown", {
        clientX: 0,
        clientY: 0,
        bubbles: true,
      }),
    );
    const { px, py } = chart_scale(EDITOR_CHART);
    svg_el.dispatchEvent(
      new PointerEvent("pointermove", { clientX: px(900), clientY: py(40) }),
    );
    expect(ed.points.white[1]).toEqual({ m: 900, i: 40 });
    svg_el.dispatchEvent(new PointerEvent("pointerup", {}));
    svg_el.dispatchEvent(
      new PointerEvent("pointermove", { clientX: px(1000), clientY: py(40) }),
    );
    expect(ed.points.white[1].m).toBe(900);
    // Zero-sized box: no division by zero
    svg_el.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 0, height: 0 }) as DOMRect;
    handle.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    svg_el.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 10, clientY: 10 }),
    );
    expect(Number.isFinite(ed.points.white[1].m)).toBe(true);
    svg_el.dispatchEvent(new PointerEvent("pointercancel", {}));
  });

  it("does not drag without its chart", async () => {
    const ed = await mountEditor(makeLed());
    const handle = ed.shadowRoot.querySelectorAll(".handle")[1];
    ed.shadowRoot.querySelector("svg").remove();
    handle.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(ed.points.white[1].m).toBe(780);
  });

  it("names the lamp in its title", async () => {
    const ed = await mountEditor({ ...makeLed(), display_name: () => "Left" });
    expect(
      ed.shadowRoot.querySelector(".header .title").textContent.trim(),
    ).toMatch(/Left$/);
    // A lamp without a name: the title alone
    const bare = await mountEditor(makeLed());
    expect(
      bare.shadowRoot.querySelector(".header .title").textContent.trim(),
    ).toBe("Program");
  });

  it("saves the day, or every day, through redsea.request", async () => {
    const led = makeLed();
    const ed = await mountEditor(led);
    const closed = vi.fn();
    ed.addEventListener("rsled-editor-close", closed);
    ed.points.white[1].i = 80;
    await ed.save();
    // The day, then /auto/apply so the lamp runs it
    expect(led.hass.callService).toHaveBeenCalledTimes(2);
    expect(led.hass.callService.mock.calls[1][2]).toEqual({
      device_id: "entry1",
      access_path: "/auto/apply",
      method: "post",
      data: {},
    });
    const [domain, service, data] = led.hass.callService.mock.calls[0];
    expect([domain, service]).toEqual(["redsea", "request"]);
    expect(data.device_id).toBe("entry1");
    expect(data.access_path).toBe("/auto/1");
    expect(data.method).toBe("post");
    expect(data.data.white.points[0]).toEqual({ t: 120, i: 80 });
    // Read back lightly after a settle delay; the last request (/auto/apply,
    // above) with the integration's defaults: in full, its programs shown
    expect(data.refresh).toBe("data");
    expect(data.wait).toBe(RSLedProgramEditor.SETTLE_S);
    expect(closed).toHaveBeenCalledTimes(1);

    const box = ed.shadowRoot.querySelector("input.all_days");
    box.checked = true;
    box.dispatchEvent(new Event("change"));
    await ed.save();
    expect(led.hass.callService).toHaveBeenCalledTimes(10);
    expect(led.hass.callService.mock.calls[8][2].access_path).toBe("/auto/7");
    expect(led.hass.callService.mock.calls[9][2].access_path).toBe(
      "/auto/apply",
    );
  });

  it("saves each day with its own offset, a G2 in color format", async () => {
    const led: any = makeLed({ 3: G2 });
    led.has_white_blue = () => false;
    led.clouds = (day: number) => ({
      from: 859,
      to: 996,
      intensity: "Low",
      day,
    });
    const ed = await mountEditor(led, 3, "kelvin");
    const box = ed.shadowRoot.querySelector("input.all_days");
    box.checked = true;
    box.dispatchEvent(new Event("change"));
    await ed.save();
    const calls = led.hass.callService.mock.calls;
    expect(calls.length).toBe(8);
    const wed = calls[2][2];
    expect(wed.access_path).toBe("/auto/3");
    expect(wed.data.color.rise).toBe(600 + 2880);
    expect(wed.data.clouds.from).toBe(859 + 2880);
    expect(wed.data.white).toBeUndefined();
    expect(calls[0][2].data.color.rise).toBe(600);
  });

  it("refuses to save without hass or device", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const ed = await mountEditor({ program: () => G1 });
    const closed = vi.fn();
    ed.addEventListener("rsled-editor-close", closed);
    await ed.save();
    expect(closed).not.toHaveBeenCalled();
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });

  it("closes from the cross and the cancel button", async () => {
    const ed = await mountEditor(makeLed());
    const closed = vi.fn();
    ed.addEventListener("rsled-editor-close", closed);
    ed.shadowRoot.querySelector("button.close").click();
    ed.shadowRoot.querySelector("button.cancel").click();
    expect(closed).toHaveBeenCalledTimes(2);
    // A click inside the panel stays there
    const outer = vi.fn();
    ed.addEventListener("click", outer);
    ed.shadowRoot.querySelector(".panel").click();
    expect(outer).not.toHaveBeenCalled();
  });
});

describe("RSLedProgramEditor: edge cases", () => {
  it("keeps the moon selected when switching the edit mode", async () => {
    const ed = await mountEditor(makeLed());
    ed._channel = "moon";
    await ed.set_mode("kelvin");
    expect(ed._channel).toBe("moon");
    await ed.set_mode("wb");
    expect(ed._channel).toBe("moon");
  });

  it("a point without colour takes the default one", async () => {
    const ed = await mountEditor(makeLed());
    await ed.set_mode("kelvin");
    ed.points.intensity = [
      { m: 600, i: 0 },
      { m: 700, i: 50 },
      { m: 800, i: 0 },
    ];
    ed._channel = "intensity";
    ed._tick++;
    await ed.updateComplete;
    // Table and chart use the default colour
    const kelvin = ed.shadowRoot.querySelector("input.kelvin");
    expect(kelvin.value).toBe(String(P.DEFAULT_KELVIN));
    const saved = await ed.program_to_save();
    expect(saved.white.points[0].i).toBeGreaterThan(0);
  });

  it("without any lamp to write to, the program is the edited one", async () => {
    const ed = new RSLedProgramEditor() as any;
    ed.load({ program: () => G1, device: { elements: [{}] } }, 1, "wb");
    expect(await ed.program_to_save()).toEqual(G1);
  });

  it("program_for() without points sends nothing", async () => {
    const ed = new RSLedProgramEditor() as any;
    ed.load(makeLed(), 1, "wb");
    ed.points = {};
    expect(await ed.program_for({ device_id: "x", g2: true })).toEqual({});
    ed.format = "kelvin";
    ed.mode = "kelvin";
    expect(await ed.program_for({ device_id: "y", g2: false })).toEqual({});
  });

  it("set_time() on the rise and the set, and on an empty channel", async () => {
    const ed = await mountEditor(makeLed());
    ed.set_time(0, "10:00");
    expect(ed.points.white[0].m).toBe(600);
    const last = ed.points.white.length - 1;
    ed.set_time(last, "22:00");
    expect(ed.points.white[last].m).toBe(1320);
    ed._channel = "intensity";
    ed.set_time(0, "10:00");
    expect(ed.points.intensity).toBeUndefined();
  });
});

describe("rsled_program: channels without points", () => {
  it("normalize_program() decodes G2 readings without points", () => {
    const color = P.normalize_program(
      { color: { rise: 600, set: 900 } },
      1,
      true,
    );
    expect(color?.intensity).toEqual({ rise: 600, set: 900, points: [] });
    const wb = P.normalize_program(
      { white: { rise: 600, set: 900 }, blue: { rise: 600, set: 900 } },
      1,
      true,
    );
    expect(wb?.intensity).toEqual({ rise: 600, set: 900, points: [] });
  });

  it("device_program() writes a G2 channel without points", () => {
    const out = P.device_program(
      { intensity: { rise: 600, set: 900 } } as any,
      1,
      true,
    );
    expect(out.color).toEqual({ rise: 600, set: 900, points: [] });
  });
});

// Real /auto/1 and /clouds/1 of a G2, read from a user's lamp
const G2_REAL = {
  color: {
    rise: 540,
    set: 1260,
    points: [
      { t: 60, i1: 60, k1: 14000, i2: 60, k2: 14000 },
      { t: 540, i1: 60, k1: 16000, i2: 60, k2: 16000 },
      { t: 615, i1: 60, k1: 20000, i2: 60, k2: 20000 },
      { t: 660, i1: 50, k1: 23000, i2: 50, k2: 23000 },
    ],
  },
  moon: {
    rise: 1245,
    set: 1410,
    points: [
      { t: 60, i: 10 },
      { t: 105, i: 10 },
    ],
  },
};
const G2_REAL_CLOUDS = {
  from: 601,
  to: 1182,
  intensity: "Medium",
  cloud_duration: 4,
  no_cloud_duration: 6,
};

describe("rsled_program: real G2 payload", () => {
  it("reads the colour points as intensity + colour temperature", () => {
    const prog = P.normalize_program(G2_REAL, 1, true)!;
    expect(prog.intensity).toEqual({
      rise: 540,
      set: 1260,
      points: [
        { t: 60, i: 60, k: 14000 },
        { t: 540, i: 60, k: 16000 },
        { t: 615, i: 60, k: 20000 },
        { t: 660, i: 50, k: 23000 },
      ],
    });
    expect(prog.moon).toEqual(G2_REAL.moon);
    expect(P.sun_window(prog)).toEqual({ rise: 540, set: 1260 });
  });

  it("writes back the very same payload, on any day's timeline", () => {
    const prog = P.normalize_program(G2_REAL, 1, true)!;
    const clouds = P.normalize_clouds(G2_REAL_CLOUDS, 1);
    expect(P.device_program(prog, 1, true, clouds)).toEqual({
      ...G2_REAL,
      clouds: G2_REAL_CLOUDS,
    });
    const day3 = P.device_program(prog, 3, true, clouds);
    expect(day3.color.rise).toBe(540 + 2 * 1440);
    expect(day3.color.points).toEqual(G2_REAL.color.points);
    expect(day3.clouds.from).toBe(601 + 2 * 1440);
  });

  it("edits and saves it unchanged through the editor", async () => {
    const led = {
      program: (day: number) => P.normalize_program(G2_REAL, day, true),
      clouds: () => G2_REAL_CLOUDS,
      has_white_blue: () => false,
      kelvin_range: () => ({ min: 8000, max: 23000 }),
      hass: { callService: vi.fn() },
      device: { elements: [{ primary_config_entry: "g2", model: "RSLED170" }] },
    };
    const ed = await mountEditor(led, 1, "kelvin");
    expect(ed.format).toBe("kelvin");
    expect(ed.points.intensity.length).toBe(6); // rise, 4 points, set
    await ed.save();
    const sent = led.hass.callService.mock.calls[0][2];
    expect(sent.access_path).toBe("/auto/1");
    expect(sent.data.color).toEqual(G2_REAL.color);
    expect(sent.data.moon).toEqual(G2_REAL.moon);
  });
});

describe("rsled_chart: colour labels of short zones", () => {
  it("label_rows() stacks labels too close to each other", () => {
    expect(label_rows([10, 50, 90], 28, 3)).toEqual([0, 0, 0]);
    expect(label_rows([10, 20, 30, 100], 28, 3)).toEqual([0, 1, 2, 0]);
    // No row left: the label is left out
    expect(label_rows([10, 15, 20, 25], 28, 3)).toEqual([0, 1, 2, null]);
    // Upright labels: one row, the height of the text apart
    expect(label_rows([10, 20, 30])).toEqual([0, null, 0]);
  });

  it("the real G2 program gets its labels upright, at the bottom", () => {
    const today = P.normalize_program(G2_REAL, 1, true)!;
    const el = draw(program_chart(EDITOR_CHART, { id: "real", today }));
    const labels = [...el.querySelectorAll(".kelvin_label")];
    const base = EDITOR_CHART.y + EDITOR_CHART.h - 4;
    expect(labels.length).toBe(3);
    for (const t of labels) {
      expect(Number(t.getAttribute("y"))).toBe(base);
      expect(t.parentElement!.getAttribute("transform")).toBe(
        `rotate(-90 ${t.getAttribute("x")} ${base})`,
      );
      expect(t.getAttribute("text-anchor")).toBe("start");
      // On a small box as long as the text
      const rect = t.parentElement!.querySelector(".kelvin_box")!;
      expect(Number(rect.getAttribute("width"))).toBeCloseTo(
        t.textContent!.length * LABEL_CHAR + 4,
      );
    }
    // Over everything, taking no clicks
    const group = el.querySelector(".kelvin_labels")!;
    expect(group.getAttribute("pointer-events")).toBe("none");
    expect(group.parentElement!.lastElementChild).toBe(group);
    // Left to the caller, or nothing for a G1
    const apart = draw(
      program_chart(EDITOR_CHART, { id: "apart", today, labels: false }),
    );
    expect(apart.querySelector(".kelvin_label")).toBeNull();
    expect(kelvin_labels(EDITOR_CHART, G1)).toBe("");
    expect(kelvin_labels(EDITOR_CHART, null)).toBe("");
  });

  it("leaves out a label finding no room", () => {
    const today = {
      intensity: {
        rise: 600,
        set: 700,
        points: [
          { t: 10, i: 50, k: 9000 },
          { t: 15, i: 50, k: 12000 },
          { t: 20, i: 50, k: 15000 },
          { t: 25, i: 50, k: 18000 },
        ],
      },
    };
    const el = draw(program_chart(EDITOR_CHART, { id: "tight", today }));
    // Four zones within a few minutes: room for one label only
    expect(el.querySelectorAll(".kelvin_label").length).toBe(1);
  });
});

describe("rsled_chart: clouds band", () => {
  it("shades the clouds' window by their intensity", () => {
    const el = draw(
      program_chart(EDITOR_CHART, {
        id: "cl",
        today: G1,
        clouds: { from: 720, to: 900, intensity: "High" },
      }),
    );
    const rect = el.querySelector(".clouds_band rect") as SVGRectElement;
    const { px } = chart_scale(EDITOR_CHART);
    expect(Number(rect.getAttribute("x"))).toBeCloseTo(px(720));
    expect(Number(rect.getAttribute("width"))).toBeCloseTo(px(900) - px(720));
    expect(rect.getAttribute("opacity")).toBe(String(CLOUD_BAND_OPACITY.High));
    expect(el.querySelectorAll(".clouds_band line").length).toBe(2);
    // Visible on any theme: a strip along the top of the window
    const strip = el.querySelector(".clouds_strip") as SVGRectElement;
    expect(strip.getAttribute("x")).toBe(rect.getAttribute("x"));
    expect(strip.getAttribute("width")).toBe(rect.getAttribute("width"));
    expect(Number(strip.getAttribute("height"))).toBe(CLOUD_STRIP_HEIGHT);
    expect(strip.getAttribute("fill")).toBe(CLOUD_EDGE_COLOR);
    expect(rect.getAttribute("fill")).toBe(CLOUD_BAND_COLOR);
  });

  it("clouds in the band: the cloudier, the more", () => {
    const clouds = (level: string, from = 480, to = 1140, box = EDITOR_CHART) =>
      [
        ...draw(
          clouds_band(box, { from, to, intensity: level }) as any,
        ).querySelectorAll(".clouds_icon"),
      ] as SVGPathElement[];
    expect(clouds("Low").length).toBe(CLOUD_COUNT.Low);
    expect(clouds("Medium").length).toBe(CLOUD_COUNT.Medium);
    expect(clouds("High").length).toBe(CLOUD_COUNT.High);
    expect(clouds("Storm").length).toBe(CLOUD_COUNT.Medium);
    // The pictogram of the intensity
    expect(clouds("Low")[0].getAttribute("d")).toBe(CLOUD_ICONS.Low);
    expect(clouds("Medium")[0].getAttribute("d")).toBe(CLOUD_ICONS.Medium);
    expect(clouds("High")[2].getAttribute("d")).toBe(CLOUD_ICONS.High);
    expect(clouds("Storm")[0].getAttribute("d")).toBe(CLOUD_ICONS.Medium);
    // Sized by the chart, spread over the band
    const size = Math.min(CLOUD_ICON.max, EDITOR_CHART.h * CLOUD_ICON.share);
    const high = clouds("High").map((c) => c.getAttribute("transform")!);
    expect(high[0]).toContain(`scale(${(size / 24).toFixed(3)})`);
    expect(new Set(high).size).toBe(3);
    // A narrow band: fewer, smaller clouds, never under the least size
    const { px } = chart_scale(EDITOR_CHART);
    const narrow = clouds("High", 600, 600 + 30);
    const room = px(630) - px(600);
    expect(narrow.length).toBe(Math.max(1, Math.floor(room / size)));
    const tiny = clouds("High", 600, 602);
    expect(tiny.length).toBe(1);
    expect(tiny[0].getAttribute("transform")).toContain(
      `scale(${(CLOUD_ICON.min / 24).toFixed(3)})`,
    );
  });

  it("nothing without a window; an unknown intensity is a medium one", () => {
    expect(clouds_band(EDITOR_CHART, null)).toBe("");
    expect(clouds_band(EDITOR_CHART, { from: 900, to: 800 })).toBe("");
    expect(clouds_band(EDITOR_CHART, { from: 2000, to: 2100 })).toBe("");
    const el = draw(clouds_band(EDITOR_CHART, { from: -100, to: 100 }) as any);
    const rect = el.querySelector("rect") as SVGRectElement;
    expect(Number(rect.getAttribute("x"))).toBe(EDITOR_CHART.x);
    expect(rect.getAttribute("opacity")).toBe(
      String(CLOUD_BAND_OPACITY.Medium),
    );
    const odd = draw(
      clouds_band(EDITOR_CHART, {
        from: 0,
        to: 100,
        intensity: "Storm",
      }) as any,
    );
    expect(odd.querySelector("rect")?.getAttribute("opacity")).toBe(
      String(CLOUD_BAND_OPACITY.Medium),
    );
  });

  it("the editor shows the clouds of the day, the beam today's", async () => {
    const led: any = {
      program: () => G1,
      clouds: () => ({ from: 720, to: 900, intensity: "Low" }),
      kelvin_range: () => ({ min: 8000, max: 23000 }),
      hass: { callService: vi.fn() },
      device: { elements: [{ primary_config_entry: "e" }] },
    };
    const ed = await mountEditor(led);
    expect(ed.shadowRoot.querySelector(".clouds_band")).not.toBeNull();
  });
});
