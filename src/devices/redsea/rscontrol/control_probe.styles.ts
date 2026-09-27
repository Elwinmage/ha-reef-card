import { css } from "lit";

export default css`
  :host {
    display: block;
    position: relative;
    width: 100%;
  }

  .probe {
    position: relative;
    width: 100%;
  }

  /* Box sized by the probe picture itself: its height follows its width,
     so everything placed in % inside it (values, bars, cog) stays on the
     same spot of the picture whatever the card size. It is also the size
     reference (cqw) of the values and of the cog. */
  .probe_box {
    position: relative;
    container-type: inline-size;
  }

  .probe_img {
    display: block;
    width: 100%;
    pointer-events: none;
  }

  /* Same cue as the device picture when the hub is switched off: its own
     <style> block cannot cross into this shadow root. */
  .probe_img.off {
    filter: grayscale(90%);
  }

  .bars {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  /* The bars catch clicks, the picture around them does not */
  .bars .bar {
    pointer-events: all;
    cursor: pointer;
  }

  /* Compact mode: a dot per reading on the tube, sized with the picture */
  .dot {
    position: absolute;
    width: 20cqw;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow:
      0 0 4cqw rgba(0, 0, 0, 0.8),
      inset 0 0 3cqw rgba(0, 0, 0, 0.35);
    cursor: pointer;
  }

  /* The sign sits on the side of the range the reading went past: "+"
     above the dot, "−" below it, centred on it */
  .dot .sign {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 30cqw;
    font-weight: bold;
    line-height: 0.8;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.9);
  }

  .dot .sign.above {
    bottom: 105%;
  }

  .dot .sign.below {
    top: 105%;
  }
`;
