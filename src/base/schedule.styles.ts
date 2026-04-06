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
    width: min(92vw, 660px);
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    gap: 10px;
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
    gap: 12px;
    overflow: hidden;
    flex: 1;
    min-height: 0;
  }

  /* Left: chart preview */
  .editor-chart {
    flex: 0 0 38%;
    min-width: 0;
    min-height: 160px;
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
    flex: 1;
    min-width: 0;
    overflow-y: auto;
  }

  /* ---- CSS Grid table ---- */
  .grid-table {
    display: grid;
    gap: 3px 4px;
    align-items: center;
  }

  /* play | time | value | delete */
  .cols-base {
    grid-template-columns: 22px auto 1fr 22px;
  }

  /* play | time | value | pulse | delete */
  .cols-pulse {
    grid-template-columns: 22px auto 1fr 1fr 22px;
  }

  /* Header cells */
  .gh {
    font-size: 10px;
    font-weight: 500;
    opacity: 0.5;
    white-space: nowrap;
    padding-bottom: 3px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }

  /* Inputs */
  .grid-table input[type="time"],
  .grid-table input[type="number"] {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    color: inherit;
    padding: 3px 4px;
    font-size: 12px;
    font-family: inherit;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .grid-table input[type="number"] {
    text-align: right;
  }

  .grid-table input:focus {
    outline: none;
    border-color: rgba(0, 150, 255, 0.6);
  }

  /* Current time row highlight */
  .grid-table input.current-row {
    border-color: rgba(255, 60, 60, 0.7);
    box-shadow: 0 0 0 1px rgba(255, 60, 60, 0.25);
  }

  /* ---- Icon buttons ---- */

  .btn-icon {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 1px;
    font-size: 14px;
    line-height: 1;
    opacity: 0.4;
    border-radius: 4px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-icon:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  .btn-icon.delete {
    color: #e55;
  }

  .btn-icon.play {
    color: #4a4;
    font-size: 11px;
  }

  .btn-icon.play:hover {
    color: #6d6;
    background: rgba(80, 200, 80, 0.12);
  }

  .btn-icon.stop-row {
    color: #e55;
    font-size: 11px;
  }

  .btn-icon.stop-row:hover {
    color: #f77;
    background: rgba(255, 80, 80, 0.12);
  }

  /* ---- Preview bar ---- */

  .preview-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    flex-wrap: wrap;
  }

  .preview-label {
    font-size: 11px;
    font-weight: 500;
    opacity: 0.6;
    white-space: nowrap;
  }

  .preview-status {
    font-size: 11px;
    opacity: 0.4;
    min-width: 60px;
  }

  .preview-status.running {
    color: #4a4;
    opacity: 1;
    font-weight: 500;
  }

  .preview-input {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    color: inherit;
    padding: 3px 4px;
    font-size: 12px;
    font-family: inherit;
    width: 56px;
    text-align: right;
    box-sizing: border-box;
  }

  .preview-input:focus {
    outline: none;
    border-color: rgba(0, 150, 255, 0.6);
  }

  .preview-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .preview-field-label {
    font-size: 9px;
    font-weight: 500;
    opacity: 0.45;
    white-space: nowrap;
  }

  .btn-stop {
    background: rgba(255, 70, 70, 0.15);
    border: 1px solid rgba(255, 70, 70, 0.3);
    color: rgba(255, 70, 70, 0.9);
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
  }

  .btn-stop:hover {
    background: rgba(255, 70, 70, 0.25);
  }

  .btn-stop:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .btn-start {
    background: rgba(80, 200, 80, 0.15);
    border: 1px solid rgba(80, 200, 80, 0.3);
    color: rgba(80, 200, 80, 0.9);
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
  }

  .btn-start:hover {
    background: rgba(80, 200, 80, 0.25);
  }

  /* ---- Footer ---- */

  .editor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    gap: 8px;
  }

  .btn-add {
    background: rgba(0, 150, 255, 0.15);
    border: 1px solid rgba(0, 150, 255, 0.3);
    color: rgba(0, 150, 255, 0.9);
    border-radius: 6px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    margin-top: 6px;
    align-self: flex-start;
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
    padding: 5px 14px;
    font-size: 12px;
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
    padding: 5px 14px;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;
