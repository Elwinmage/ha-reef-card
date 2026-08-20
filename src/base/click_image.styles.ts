/**
 * @file Component styles
 * @module base.click-image.styles
 */

import { css } from "lit";

export default css`
  /* Styles MDI icons */
  ha-icon.click-icon {
    cursor: pointer;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }

  ha-icon.click-icon:hover {
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
`;
