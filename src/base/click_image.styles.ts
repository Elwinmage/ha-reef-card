/**
 * @file Component styles
 * @module base.click-image.styles
 */

import { css } from "lit";

export default css`
  /* Styles MDI icons. The cursor comes from MyElement, which sets it on
     clickable elements only; so does the hover feedback. */
  ha-icon.click-icon,
  ha-state-icon.click-icon {
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }

  .clickable ha-icon.click-icon:hover,
  .clickable ha-state-icon.click-icon:hover {
    transform: scale(1.1);
    opacity: 0.8;
  }

  /* Common style */
  .click-image,
  .click-icon {
    display: inline-block;
  }

  /* An <img> with no elt_css renders at its intrinsic size and ignores the
     width its wrapper was given, which is how a positioned overlay ends up
     spilling over the card. This only ever clamps: an image already smaller
     than its wrapper is untouched. Elements that must *fill* their wrapper
     still say so with elt_css.width. */
  .click-image {
    max-width: 100%;
  }

  /* Device switched off.
     RSDevice greys its own background picture with a <style> block in its
     shadow root, but that selector cannot reach an <img> living inside this
     element's own shadow root -- so a device turned off used to grey its
     background while its image overlays stayed in full colour. Each image
     element greys itself instead, with the same 90% the device uses.
     Icons are already handled upstream: MyElement.render() swaps their
     colour for OFF_COLOR. */
  .click-image.off {
    filter: grayscale(90%);
  }

  /* A linked appliance that is switched off. The filter sits on the wrapper
     rather than the image so it also covers anything drawn over it. */
  .linked-off {
    filter: grayscale(90%);
    opacity: 0.75;
  }
`;
