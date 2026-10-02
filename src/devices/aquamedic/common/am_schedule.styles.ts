import { css } from "lit";

export default css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .am-schedule {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 1px solid rgba(127, 127, 127, 0.3);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.72);
    cursor: pointer;
    overflow: hidden;
  }

  .am-schedule.unavailable {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    color: rgb(90, 90, 90);
    font-size: clamp(10px, 3.2cqw, 15px);
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .axis {
    stroke: rgba(60, 60, 60, 0.35);
    stroke-width: 1;
  }

  .tick-label,
  .note {
    fill: rgb(70, 70, 70);
    font-size: 16px;
    font-family: var(--paper-font-body1_-_font-family, sans-serif);
  }

  .note {
    font-style: italic;
  }

  .now {
    stroke: rgb(255, 40, 40);
    stroke-width: 2;
  }

  .timer-off {
    opacity: 0.45;
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
    width: min(94vw, 720px);
    max-height: 88vh;
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
    border-bottom: 1px solid rgba(127, 127, 127, 0.3);
  }

  .editor-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
  }

  .editor-graph {
    flex: 0 0 auto;
    height: 120px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.85);
  }

  .editor-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .slots {
    display: grid;
    gap: 4px 6px;
    align-items: center;
    grid-template-columns: 18px auto auto 1fr 64px 26px;
  }

  .slots.drift {
    grid-template-columns: 18px auto auto 1fr 64px 64px auto 26px;
  }

  .gh {
    font-size: 10px;
    font-weight: 500;
    opacity: 0.6;
    white-space: nowrap;
    padding-bottom: 3px;
    border-bottom: 1px solid rgba(127, 127, 127, 0.3);
  }

  .num {
    font-size: 11px;
    opacity: 0.6;
    text-align: right;
  }

  .current {
    outline: 1px solid rgb(255, 40, 40);
  }

  input,
  select {
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
    padding: 3px 4px;
    border: 1px solid rgba(127, 127, 127, 0.5);
    border-radius: 4px;
    background: var(--secondary-background-color, #2a2a2a);
    color: inherit;
    font-size: 12px;
  }

  input[type="checkbox"] {
    width: auto;
  }

  input:disabled {
    opacity: 0.4;
  }

  button {
    cursor: pointer;
    border: none;
    border-radius: 4px;
    color: inherit;
    background: rgba(127, 127, 127, 0.25);
    padding: 5px 10px;
    font-size: 12px;
  }

  button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .btn-icon {
    padding: 2px 6px;
    background: none;
    font-size: 14px;
  }

  .btn-save {
    background: rgb(51, 151, 232);
    color: white;
  }

  .hint {
    font-size: 11px;
    opacity: 0.7;
  }

  .error {
    color: rgb(255, 90, 90);
    font-size: 12px;
    min-height: 15px;
  }

  .editor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .editor-actions {
    display: flex;
    gap: 8px;
  }
`;
