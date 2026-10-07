/**
 * Virtual ReefLED mapping: a group of lamps driven as one. It shows the view
 * of the G2 as soon as one of its lamps is a G2 (the group is then only
 * driven through kelvin and intensity), the view of the G1 otherwise. See
 * rsled_virtual_config() for what differs from a real lamp.
 */
import { rsled_virtual_config } from "./rsled.common.mapping";
import { G1_FACE } from "./rsled_g1.mapping";
import { G2_BEAM, G2_FACE, G2_NAME, G2_SKY } from "./rsled_g2.mapping";

/** Only G1 lamps: white/blue channels available. */
export const config_virtual_g1 = rsled_virtual_config({
  image: new URL("../../../img/redsea/RSLED/rsled_g1.png", import.meta.url),
  face: G1_FACE,
  white_blue: true,
});

/** At least one G2: kelvin and intensity only. */
export const config_virtual_g2 = rsled_virtual_config({
  image: new URL("../../../img/redsea/RSLED/rsled_g2.png", import.meta.url),
  face: G2_FACE,
  sky: G2_SKY,
  name: G2_NAME,
  beam: G2_BEAM,
  white_blue: false,
});
