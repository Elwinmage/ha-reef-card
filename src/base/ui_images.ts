/**
 * @file Static UI images of the card
 * @module base.ui_images
 *
 * HACS installs a dashboard card as a single file: it never extracts an
 * archive nor installs a sibling `img/` folder for this category. These
 * images are therefore referenced through `new URL(..., import.meta.url)`,
 * which Vite inlines into the bundle in library mode, like every device
 * image of the card. No `/hacsfiles/...` path must be used for card assets.
 *
 * Each `new URL()` keeps a literal path written inline: Vite only resolves
 * the pattern statically, a helper taking the path as a variable would not
 * be bundled.
 *
 * `.href` is exported (not the URL object) because these values end up in
 * dialog configurations, which are plain data.
 */

// Generic actions
export const TRASH_ICON = new URL("../img/ui/trash.svg", import.meta.url).href;

// ReefDose calibration and priming
export const HEAD_CALIBRATION_IMG = new URL(
  "../img/ui/head_calibration.png",
  import.meta.url,
).href;
export const READ_GRADUATED_IMG = new URL(
  "../img/ui/read_graduated.jpg",
  import.meta.url,
).href;
export const PRIMING_IMG = new URL("../img/ui/priming.png", import.meta.url)
  .href;

// ReefRun skimmer calibration
export const FULL_CUP_CALIBRATION_IMG = new URL(
  "../img/ui/ic_full_cup_calibration.png",
  import.meta.url,
).href;
export const OVER_SKIMMING_CALIBRATION_IMG = new URL(
  "../img/ui/ic_over_skimming_calibration.png",
  import.meta.url,
).href;

// Bottle shown when a supplement of the catalog has no visual of its own
export const GENERIC_CONTAINER_IMG = new URL(
  "../img/ui/generic_container.supplement.png",
  import.meta.url,
).href;
