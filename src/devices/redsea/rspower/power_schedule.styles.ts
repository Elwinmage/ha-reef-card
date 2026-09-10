import { css } from "lit";

export default css`
  :host {
    display: block;
    width: 100%;
    font-family: var(--paper-font-body1_-_font-family, "Roboto", sans-serif);
  }

  .ps-container {
    padding: 8px;
  }

  /* ── Timeline canvas ─────────────────────────────────────────────── */

  .ps-timeline {
    position: relative;
    width: 100%;
    height: 64px;
    margin-bottom: 12px;
  }

  .ps-timeline.compact {
    height: 40px;
    margin-bottom: 0;
  }

  .ps-timeline canvas {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 6px;
  }

  /* ── Compact preview (socket config dialog) ──────────────────────── */

  .ps-preview {
    display: block;
    width: 100%;
    padding: 4px 6px;
    margin-bottom: 6px;
    border-radius: 8px;
    background: var(--input-fill-color, rgba(255, 255, 255, 0.06));
    cursor: pointer;
    box-sizing: border-box;
  }

  .ps-preview:hover {
    background: var(--input-fill-color, rgba(255, 255, 255, 0.12));
  }

  /* ── Interval list ───────────────────────────────────────────────── */

  .ps-intervals {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 240px;
    overflow-y: auto;
    margin-bottom: 8px;
  }

  .ps-row {
    display: grid;
    grid-template-columns: auto 1fr 1fr auto;
    gap: 6px;
    align-items: center;
    padding: 4px 6px;
    background: var(--card-background-color, rgba(255, 255, 255, 0.05));
    border-radius: 6px;
  }

  .ps-row .idx {
    font-weight: bold;
    font-size: 0.8em;
    color: var(--primary-text-color, #fff);
    opacity: 0.6;
    min-width: 18px;
    text-align: center;
  }

  .ps-row input[type="time"] {
    background: var(--input-fill-color, rgba(255, 255, 255, 0.1));
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.15));
    border-radius: 4px;
    color: var(--primary-text-color, #fff);
    padding: 4px 6px;
    font-size: 0.85em;
    width: 100%;
    box-sizing: border-box;
  }

  .ps-row .btn-del {
    background: none;
    border: none;
    color: var(--error-color, #cf6679);
    cursor: pointer;
    font-size: 1.1em;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
  }

  .ps-row .btn-del:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .ps-row .btn-del:hover:not(:disabled) {
    background: rgba(207, 102, 121, 0.15);
  }

  /* ── Header row ──────────────────────────────────────────────────── */

  .ps-header {
    display: grid;
    grid-template-columns: auto 1fr 1fr auto;
    gap: 6px;
    padding: 0 6px 4px;
    font-size: 0.75em;
    font-weight: 500;
    color: var(--secondary-text-color, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ── Add button ──────────────────────────────────────────────────── */

  .ps-add {
    display: block;
    width: 100%;
    padding: 6px;
    background: var(--input-fill-color, rgba(255, 255, 255, 0.08));
    border: 1px dashed var(--divider-color, rgba(255, 255, 255, 0.2));
    border-radius: 6px;
    color: var(--primary-color, #3397e8);
    cursor: pointer;
    font-size: 0.85em;
    text-align: center;
    margin-bottom: 12px;
  }

  .ps-add:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .ps-add:hover:not(:disabled) {
    background: var(--input-fill-color, rgba(255, 255, 255, 0.12));
  }

  /* ── Footer buttons ──────────────────────────────────────────────── */

  .ps-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .ps-btn {
    padding: 6px 16px;
    border: none;
    border-radius: 6px;
    font-size: 0.85em;
    cursor: pointer;
  }

  .ps-btn-cancel {
    background: var(--input-fill-color, rgba(255, 255, 255, 0.1));
    color: var(--primary-text-color, #fff);
  }

  .ps-btn-save {
    background: var(--primary-color, #3397e8);
    color: #fff;
  }

  .ps-btn:hover {
    filter: brightness(1.15);
  }

  /* ── Loading / error ─────────────────────────────────────────────── */

  .ps-loading,
  .ps-error {
    text-align: center;
    padding: 24px 8px;
    color: var(--secondary-text-color, rgba(255, 255, 255, 0.5));
    font-size: 0.9em;
  }

  .ps-error {
    color: var(--error-color, #cf6679);
  }
`;
