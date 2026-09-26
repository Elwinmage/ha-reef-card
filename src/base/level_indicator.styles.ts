/**
 * @file Component styles
 * @module base.level-indicator
 */

import { css } from "lit";

export default css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .bar {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .zone {
    flex: 1;
  }

  /* A square on the bar, centred on the reading */
  .cursor {
    position: absolute;
    left: 20%;
    width: 60%;
    aspect-ratio: 1 / 1;
    transform: translateY(-50%);
    background: black;
    border: 1px solid white;
    box-sizing: border-box;
  }

  .dot {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    box-shadow:
      0 0 3px rgba(0, 0, 0, 0.8),
      inset 0 0 2px rgba(0, 0, 0, 0.35);
  }

  /* "+" above the dot, "−" below it, centred on it */
  .dot .sign {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 130%;
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
