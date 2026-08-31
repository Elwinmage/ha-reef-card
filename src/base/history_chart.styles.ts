/**
 * @file Component styles
 * @module base.history-chart
 */

import { css } from "lit";

export default css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .history-chart-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
