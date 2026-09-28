/**
 * ReefLED G1 (RSLED50, RSLED90, RSLED160) mapping: see rsled.common.mapping.ts
 * for the view every ReefLED shares.
 */
import { FaceLayout, rsled_config } from "./rsled.common.mapping";

/** G1: square lamp, faces along the lower edge of the vents. */
export const G1_FACE: FaceLayout = {
  device_state: ["6.8%", "44.6%"],
  maintenance: ["14.9%", "40.6%"],
  configuration: ["23%", "36.6%"],
  battery_level: ["31.1%", "32.6%"],
  wifi_quality: ["39.3%", "28.6%"],
  identify: ["56%", "27.9%"],
  moon_phase: ["67%", "31.2%"],
  acclimation: ["78%", "34.5%"],
  acclimation_text: ["84.5%", "34.2%"],
  right_skew: "19deg",
};

export const config = rsled_config({
  image: new URL("../../../img/redsea/RSLED/rsled_g1.png", import.meta.url),
  face: G1_FACE,
  white_blue: true,
});
