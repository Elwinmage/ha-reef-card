import { css } from "lit";

export default css`
  .device_bg {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: 1/1.2;
    /* Anchor for the label font below: everything drawn on the picture is
       positioned in percentages of this box, so text has to scale with it
       too. Viewport units would not do — a narrow card on a wide screen
       still needs small text. */
    container-type: inline-size;
    /* Fixed fallback for engines without container query units. */
    --rs-label-font: 0.5rem;
  }

  /* Text sized from the card width, bounded so it stays legible when the
     card is tiny and does not balloon when it is stretched wide. Tuned for
     vertical labels, where the run length is capped by the picture height
     and rotated glyphs eat more room than a horizontal line of the same
     size — hence a smaller ratio than a horizontal label would take. */
  @supports (font-size: 1cqw) {
    .device_bg {
      --rs-label-font: clamp(7px, 2.1cqw, 14px);
    }
  }

  .device_img {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
  }

  .device_img_disabled {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    filter: grayscale(80%);
  }

  .disabled_in_ha {
    color: white;
    text-align: center;
    position: absolute;
    width: 100%;
    top: 15%;
    left: 0%;
    background-color: rgba(255, 0, 0, 0.5);
  }
`;
