/**
 * Aqua Medic DC Skimmer view: the skimmer pump of the DC Runner series.
 *
 * The skimmer is tall and narrow: the picture takes the left of the box and
 * the controls the column it leaves free on its right.
 *
 *   ┌──────────────────────────────┐
 *   │  ╔═cup═╗     ⏻  🐟  ⏲  ⎓  ⚙ │
 *   │  ╚══╦══╝                     │
 *   │   ╱   ╲        ( 62% )       │  ring, beside the reaction chamber
 *   │  ╱     ╲                     │
 *   │ ═╧══◎══╧═[pump]  ⚠ faults    │
 *   │  ━━━━━━━●━━━━━━━━━━━━━━━━━   │
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
  common_elements,
  picture_css,
  picture_point,
} from "../common/am.common.mapping";

/** The picture (279×446), on the left of the box. */
export const PICTURE: AMPicture = {
  box: 1.32,
  ratio: 446 / 279,
  width: 56,
  left: 3,
  top: 1,
};

/** Height of the row of icons, in % of the box. */
const ICONS_Y = 5;

export const LAYOUT: AMLayout = {
  icons: {
    // In the column on the right of the collection cup
    power: [50, ICONS_Y],
    feed_switch: [61, ICONS_Y],
    timer_on: [72, ICONS_Y],
    control_0_10v: [83, ICONS_Y],
    configuration: [94, ICONS_Y],
    // The row is full: under the settings cog, clear of the ring
    maintenance_tasks: [94, ICONS_Y + 8],
  },
  // Level with the reaction chamber, the figure inside
  ring: {
    center: [72, picture_point(PICTURE, 0, 48)[1]],
    width: 44,
    value: true,
  },
  // Over the pump, where the picture leaves the column
  faults: { top: 45, left: 44, width: 54 },
  slider_top: 70,
  schedule: { top: 79, height: 20 },
};

export const config = {
  name: null,
  model: "DC Skimmer",
  background_img: new URL(
    "../../../img/aquamedic/am-dcskimmer.png",
    import.meta.url,
  ),
  // The picture follows the pump (see AMDCSkimmer._render()). Both files
  // share one framing, so the layout and the overlays fit either.
  state_background_imgs: {
    off: new URL("../../../img/aquamedic/am-dcskimmer.png", import.meta.url),
    on: new URL("../../../img/aquamedic/am-dcskimmer-on.png", import.meta.url),
  },
  css: picture_css(PICTURE),
  color: COLOR_AM_RGB,
  alpha: 0.7,
  elements: {
    ...common_elements("motor_speed", "am_speed", LAYOUT),
  },
};
