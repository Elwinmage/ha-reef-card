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
    display: flex;
    flex-direction: column;
  }

  canvas {
    display: block;
    width: 100%;
    flex: 1 1 0;
    min-height: 0;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px;
  }

  .toolbar button {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border: 1px solid rgba(40, 40, 40, 0.3);
    border-radius: 6px;
    background: transparent;
    color: rgb(40, 40, 40);
    font: inherit;
    cursor: pointer;
  }

  .toolbar button.active {
    background: rgb(40, 40, 40);
    color: white;
  }

  .toolbar .more_info {
    margin-left: auto;
    border: none;
    padding: 3px;
    --mdc-icon-size: 20px;
  }
`;
