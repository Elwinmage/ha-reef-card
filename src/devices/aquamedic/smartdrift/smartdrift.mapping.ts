/**
 * Aqua Medic SmartDrift view (SmartDrift / EcoDrift): a flow pump.
 *
 * The picture file is "ecodrift": EcoDrift is the marketed product name,
 * while "SmartDrift" is the model string ha-aquamedic-component reports.
 *
 * On top of the shared elements it shows the wave settings:
 *
 *   ┌──────────────────────────────┐
 *   │ ⏻  🐟  ⏲  ⎓  ≋  [ mode ] ⚙ │  + pulse/tide switch and wave mode
 *   │      ▟██████◜‾‾◝             │
 *   │      ███████( 75% )          │  ring fitted on the front cap
 *   │      ▜██████◟__◞             │
 *   │  ━━━━━━━●━━━━━━━━━━━━━━━━━   │  flow
 *   │  ━━━━━━━●━━━━━━━━━━━━━━━━━   │  wave frequency
 *   │  [ time-slot program ]       │
 *   └──────────────────────────────┘
 *
 * The shared elements and the geometry helpers are described in
 * ../common/am.common.mapping.ts.
 */
import { COLOR_AM_HEX, COLOR_AM_RGB } from "../../../utils/colors";
import {
  AMLayout,
  AMPicture,
  picture_rect,
  speed_hidden,
  LABEL_CSS,
  centred_at,
  slider_row,
  common_elements,
  picture_css,
} from "../common/am.common.mapping";
import type { CapRingGeometry } from "../common/am_cap_ring";
import type { AMStream } from "../common/am_flow";

/** The picture (976×937), centred under the row of icons. */
export const PICTURE: AMPicture = {
  box: 1.3,
  ratio: 937 / 976,
  width: 64,
  left: 18,
  top: 10,
};

/** Height of the row of icons, over the picture, in % of the box. */
const ICONS_Y = 4.2;

/**
 * The front cap, as measured on the picture: seen slightly from the side,
 * it is an ellipse 358 × 508 px, tilted 2.4° to the left. The ring runs
 * along its edge.
 */
export const CAP: CapRingGeometry = {
  view: [976, 937],
  cx: 677,
  cy: 466,
  rx: 163,
  ry: 237,
  angle: -2.4,
  width: 30,
  font_size: 120,
};

/**
 * A jet leaving the front of the pump: a wavy line starting between the
 * blades and running into the right margin of the box.
 * @param x: start, in pixels of the picture
 * @param y: start, in pixels of the picture
 * @param slope: how much it rises (negative) or drops per wave, in pixels
 */
function jet(x: number, y: number, slope: number): AMStream {
  const wave = 92;
  const waves = 4;
  return {
    d:
      `M ${x} ${y} q ${wave / 2} -34 ${wave} ${slope}` +
      ` t ${wave} ${slope}`.repeat(waves - 1),
    from: [x, y],
    to: [x + wave * waves, y + slope * waves],
    fade: "out",
  };
}

/** Four jets fanning out of the opening, around the cap. */
export const STREAMS: AMStream[] = [
  jet(760, 215, -22),
  jet(870, 385, -8),
  jet(870, 550, 8),
  jet(760, 715, 22),
];

export const LAYOUT: AMLayout = {
  icons: {
    power: [6, ICONS_Y],
    feed_switch: [16, ICONS_Y],
    timer_on: [26, ICONS_Y],
    control_0_10v: [36, ICONS_Y],
    configuration: [94, ICONS_Y],
    // The row is full: under the settings cog, in the right margin
    maintenance_tasks: [94, ICONS_Y + 7],
  },
  faults: { top: 55, left: 3, width: 94 },
  slider_top: 59.5,
  schedule: { top: 79, height: 20 },
};

export const config = {
  name: null,
  model: "SmartDrift",
  background_img: new URL(
    "../../../img/aquamedic/am-ecodrift.png",
    import.meta.url,
  ),
  css: picture_css(PICTURE),
  color: COLOR_AM_RGB,
  alpha: 0.7,
  elements: {
    ...common_elements("flow", "am_flow", LAYOUT),

    // ── Water pushed out of the front, under the ring ────────────────
    flow: {
      name: "flow_streams",
      type: "aquamedic-flow",
      stateObj: null,
      view: CAP.view,
      width: 22,
      // The waves swell at the pace of the wave frequency
      pulse: true,
      streams: STREAMS,
      css: picture_rect(PICTURE),
    },

    // ── Flow: a ring fitted on the front cap, the figure in its centre ─
    speed: {
      name: "flow",
      type: "aquamedic-cap-ring",
      target: 100,
      geometry: CAP,
      disabled_if: speed_hidden("flow"),
      no_br_if_disabled: true,
      css: picture_rect(PICTURE),
    },

    // ── Row of icons: wave settings ──────────────────────────────────
    pulse_tide: {
      name: "pulse_tide",
      type: "click-image",
      icon: "state",
      icon_color: COLOR_AM_HEX,
      tap_action: { domain: "switch", action: "toggle", data: "default" },
      css: centred_at([46, ICONS_Y]),
    },
    mode: {
      name: "select.mode",
      type: "common-sensor",
      translate_values: true,
      tap_action: {
        domain: "redsea_ui",
        action: "more-info",
        data: "select.mode",
      },
      css: {
        ...LABEL_CSS,
        ...centred_at([70, ICONS_Y]),
        "max-width": "34%",
        overflow: "hidden",
        "text-overflow": "ellipsis",
      },
    },

    // ── Wave frequency, under the flow ───────────────────────────────
    ...slider_row("frequency", "frequency", "am_frequency", 69),
  },
};
