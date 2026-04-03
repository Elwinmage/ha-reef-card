import { css } from "lit";

export default css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .schedule-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: pointer;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* ---- Editor overlay ---- */

  .editor-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.55);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .editor-panel {
    background: var(--card-background-color, #1c1c1c);
    color: var(--primary-text-color, #e0e0e0);
    border-radius: 12px;
    padding: 16px;
    width: min(92vw, 640px);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .editor-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
  }

  .editor-body {
    display: flex;
    gap: 16px;
    overflow: hidden;
    flex: 1;
    min-height: 0;
  }

  /* Left: chart preview */
  .editor-chart {
    flex: 1;
    min-width: 0;
    min-height: 180px;
    position: relative;
  }

  .editor-chart canvas {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.2);
  }

  /* Right: point list */
  .editor-list {
    flex: 0 0 200px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
    max-height: 300px;
  }

  .editor-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .editor-row input[type="time"] {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    color: inherit;
    padding: 4px 6px;
    font-size: 13px;
    width: 80px;
    font-family: inherit;
  }

  .editor-row input[type="number"] {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    color: inherit;
    padding: 4px 6px;
    font-size: 13px;
    width: 52px;
    text-align: right;
    font-family: inherit;
  }

  .editor-row input:focus {
    outline: none;
    border-color: rgba(0, 150, 255, 0.6);
  }

  .btn-icon {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 2px;
    font-size: 16px;
    line-height: 1;
    opacity: 0.5;
    border-radius: 4px;
  }

  .btn-icon:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  .btn-icon.delete {
    color: #e55;
  }

  .editor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    gap: 8px;
  }

  .btn-add {
    background: rgba(0, 150, 255, 0.15);
    border: 1px solid rgba(0, 150, 255, 0.3);
    color: rgba(0, 150, 255, 0.9);
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
  }

  .btn-add:hover {
    background: rgba(0, 150, 255, 0.25);
  }

  .btn-add:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .btn-save {
    background: rgba(0, 150, 255, 0.8);
    border: none;
    color: #fff;
    border-radius: 6px;
    padding: 6px 16px;
    font-size: 13px;
    cursor: pointer;
    font-weight: 500;
    font-family: inherit;
  }

  .btn-save:hover {
    background: rgba(0, 150, 255, 1);
  }

  .btn-cancel {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: inherit;
    border-radius: 6px;
    padding: 6px 16px;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;
