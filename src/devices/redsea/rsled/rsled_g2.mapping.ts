/**
 * ReefLED G2 (RSLED60, RSLED115, RSLED170) mapping: see
 * rsled.common.mapping.ts for the view every ReefLED shares. The rounder lamp
 * moves the icons on its faces and its higher top pushes the mode up. The G2
 * has no white/blue lights: its colour only goes through kelvin and
 * intensity, so the white/blue sliders never show.
 */
import { FaceLayout, rsled_config } from "./rsled.common.mapping";

/** G2: rounded lamp, faces on the smooth band under the vents. */
export const G2_FACE: FaceLayout = {
  device_state: ["6.8%", "39.2%"],
  maintenance: ["14.4%", "36.8%"],
  configuration: ["22%", "34.3%"],
  battery_level: ["29.6%", "31.8%"],
  wifi_quality: ["37.2%", "29.4%"],
  identify: ["58.4%", "29.4%"],
  moon_phase: ["68.5%", "32.1%"],
  acclimation: ["78.7%", "36.5%"],
  acclimation_text: ["85.5%", "37.6%"],
  right_skew: "21deg",
};

/** The G2 top rises higher than the G1's: the mode goes up with it. */
export const G2_SKY = {
  mode: { x: 295.5, y: 84 },
  clouds: { x: 405, y: 78 },
};

/** The G2's face is less steep and higher than the G1's. */
export const G2_NAME = { x: 118, y: 278, angle: -27 };

/** The G2's lens is a little higher and rounder than the G1's. */
export const G2_BEAM = {
  lens: { cx: 300, cy: 418, rx: 152, ry: 70 },
};

export const config2 = rsled_config({
  image: new URL("../../../img/redsea/RSLED/rsled_g2.png", import.meta.url),
  face: G2_FACE,
  sky: G2_SKY,
  name: G2_NAME,
  beam: G2_BEAM,
  white_blue: false,
});
