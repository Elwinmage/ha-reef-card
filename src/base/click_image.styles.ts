/**
 * @file Component styles
 * @module base.click-image.styles
 */

import { css } from "lit";

export default css`
  /* Styles for images */
  img.click-image:hover {
    cursor: pointer;
    background-color: rgb(235, 235, 235);
    border-radius: 30px;
  }

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
`;
