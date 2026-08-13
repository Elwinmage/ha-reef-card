import { css } from "lit";

export default css`
  :host {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .slider-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .track {
    position: relative;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.2);
    cursor: pointer;
  }

  .track-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 3px;
    background: var(--slider-color, rgb(0, 150, 255));
    pointer-events: none;
  }

  .thumb {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    min-width: 32px;
    height: 22px;
    border-radius: 11px;
    background: var(--slider-color, rgb(0, 150, 255));
    border: 2px solid rgba(255, 255, 255, 0.8);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    touch-action: none;
    z-index: 1;
  }

  .thumb-label {
    font-size: 10px;
    font-weight: bold;
    color: #fff;
    white-space: nowrap;
    padding: 0 4px;
    pointer-events: none;
  }
`;
