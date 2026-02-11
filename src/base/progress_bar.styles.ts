import { css } from "lit";

export default css`
  .progress-bar {
    position: relative;
    border-radius: 20px;
    border: 1px solid white;
    padding: 2px;
  }

  .progress-bar-container {
    position: relative;
    height: 20px;
    border-radius: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    border-radius: 20px;
    transition: width 0.3s ease;
  }

  .progress-label {
    position: absolute;
    top: 2px;
    left: 5px;
    color: white;
    font-size: 0.8em;
    font-weight: bold;
    z-index: 2;
  }

  .progress-value {
    position: absolute;
    top: 2px;
    right: 5px;
    color: white;
    font-size: 0.8em;
    font-weight: bold;
    z-index: 2;
  }
`;
