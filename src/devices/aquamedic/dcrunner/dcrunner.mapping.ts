/**
 * Aqua Medic DC Runner view: the return pump of the DC Runner series.
 *
 * The pump fills the picture down to 78 % of its height: the outlet on the
 * top left, the motor on the right, the impeller behind the clear volute.
 *
 *   ┌──────────────────────────────┐
 *   │   ↑↑↑                        │  water out of the outlet
 *   │  ║outlet║   ⏻  🐟  ⏲  ⎓  ⚙ │  icons over the motor
 *   │  ╚══╗ ┌──────(62%)────┐      │  ring on the motor housing
 * →→│ inlet ◎ impeller      │      │  water into the inlet
 *   │ ⚠ faults                     │
 *   │  ━━━━━━━●━━━━━━━━━━━━━━━━━   │  speed, under the base plate
 *   │  [ time-slot program ]       │
 *   └──────────────────────────────┘
 *
 * The shared elements and the geometry helpers are described in
 * ../common/am.common.mapping.ts.
 */
import { COLOR_AM_RGB } from "../../../utils/colors";
import {
  AMLayout,
  AMPicture,
  picture_rect,
  common_elements,
  picture_css,
  picture_point,
} from "../common/am.common.mapping";
import type { AMStream } from "../common/am_flow";

/**
 * The picture (365×439). It leaves a margin on its left and over it, where
 * the water drawn into the inlet and pushed out of the outlet is shown.
 */
export const PICTURE: AMPicture = {
  box: 1.3,
  ratio: 439 / 365,
  width: 82,
  left: 14,
  top: 9,
};

/**
 * Water through the pump, in pixels of the picture: three streams drawn
 * into the inlet (front left), three pushed up out of the outlet (top).
 */
export const STREAMS: AMStream[] = [
  // Into the inlet, whose opening faces the lower left
  {
    d: "M -58 250 q 30 -14 54 -4 t 52 -8",
    from: [-58, 250],
    to: [48, 238],
    fade: "in",
  },
  {
    d: "M -58 280 q 30 -8 56 -10 t 54 -20",
    from: [-58, 280],
    to: [52, 250],
    fade: "in",
  },
  {
    d: "M -46 312 q 28 -8 48 -22 t 48 -28",
    from: [-46, 312],
    to: [50, 262],
    fade: "in",
  },
  // Out of the outlet
  {
    d: "M 82 10 q -10 -12 0 -25 t 0 -25",
    from: [82, 10],
    to: [82, -40],
    fade: "out",
  },
  {
    d: "M 99 6 q -10 -11 0 -23 t 0 -23",
    from: [99, 6],
    to: [99, -40],
    fade: "out",
  },
  {
    d: "M 116 10 q -10 -12 0 -25 t 0 -25",
    from: [116, 10],
    to: [116, -40],
    fade: "out",
  },
];

/** Height of the row of icons, over the motor, in % of the picture. */
const ICONS_Y = 6;

export const LAYOUT: AMLayout = {
  icons: {
    // To the right of the outlet, in the free space over the motor
    power: picture_point(PICTURE, 50, ICONS_Y),
    feed_switch: picture_point(PICTURE, 62, ICONS_Y),
    timer_on: picture_point(PICTURE, 74, ICONS_Y),
    control_0_10v: picture_point(PICTURE, 86, ICONS_Y),
    configuration: picture_point(PICTURE, 98, ICONS_Y),
  },
  // On the flat of the motor housing. The housing is silver: a light disc
  // carries the figure and a darker track shows the unfilled part.
  ring: {
    center: picture_point(PICTURE, 72, 35),
    width: 30,
    value: true,
    colors: {
      background: "rgba(70,70,70,0.45)",
      center: "rgba(255,255,255,0.8)",
    },
  },
  // Under the base plate
  faults: { top: 67, left: 3, width: 94 },
  slider_top: 71.5,
  schedule: { top: 80.5, height: 18.5 },
};

export const config = {
  name: null,
  model: "DC Runner",
  background_img: new URL(
    "../../../img/aquamedic/am-dcrunner.png",
    import.meta.url,
  ),
  css: picture_css(PICTURE),
  color: COLOR_AM_RGB,
  alpha: 0.7,
  elements: {
    ...common_elements("motor_speed", "am_speed", LAYOUT),

    // ── Water drawn in and pushed out while the pump runs ────────────
    flow: {
      name: "flow_streams",
      type: "aquamedic-flow",
      stateObj: null,
      view: [365, 439],
      width: 8,
      streams: STREAMS,
      css: picture_rect(PICTURE),
    },
  },
};
