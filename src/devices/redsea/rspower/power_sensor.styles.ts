import { css } from "lit";

export default css`
  :host {
    display: block;
  }

  /* ── Mode selector ──────────────────────────────────────────────────── */
  .sce-mode-section {
    padding: 8px 0 4px;
  }

  .sce-mode-label {
    font-size: 0.72em;
    color: var(--secondary-text-color, #888);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }

  .sce-mode-row {
    display: flex;
    gap: 5px;
  }

  .sce-mode-btn {
    flex: 1 1 0;
    padding: 6px 4px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.18));
    border-radius: 6px;
    background: transparent;
    color: var(--secondary-text-color, #888);
    font-size: 0.78em;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    transition:
      background 0.15s,
      color 0.15s,
      border-color 0.15s;
  }

  .sce-mode-btn:hover:not(:disabled) {
    background: rgba(51, 151, 232, 0.08);
    border-color: rgba(51, 151, 232, 0.4);
  }

  .sce-mode-btn.active {
    background: rgba(51, 151, 232, 0.14);
    border-color: rgba(51, 151, 232, 0.7);
    color: var(--primary-text-color, #000);
    font-weight: 600;
  }

  /* Marks the automatic mode a manual on/off suspended */
  .sce-mode-paused {
    --mdc-icon-size: 14px;
    color: var(--warning-color, #e6a23c);
  }

  .sce-mode-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  /* ── Divider ────────────────────────────────────────────────────────── */
  .sce-divider {
    height: 1px;
    background: var(--divider-color, rgba(0, 0, 0, 0.12));
    margin: 8px 0;
  }

  /* ── Schedule ───────────────────────────────────────────────────────── */
  .sce-schedule-wrap {
    /* power-schedule renders itself */
  }

  /* ── Sensor section ─────────────────────────────────────────────────── */
  .sce-sensor-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 0;
  }

  .sce-section-title {
    font-size: 0.72em;
    color: var(--secondary-text-color, #888);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 3px;
  }

  .sce-error {
    padding: 9px 11px;
    border-radius: 6px;
    background: rgba(220, 60, 60, 0.1);
    color: var(--error-color, #c0392b);
    font-size: 0.84em;
    border-left: 3px solid var(--error-color, #c0392b);
  }

  .sce-select {
    width: 100%;
    padding: 7px 8px;
    border-radius: 6px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.18));
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #000);
    font-size: 0.88em;
    box-sizing: border-box;
    cursor: pointer;
  }

  /* ── Params ─────────────────────────────────────────────────────────── */
  .sce-params {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border-radius: 8px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
  }

  .sce-row {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
    min-height: 30px;
  }

  .sce-row-label {
    flex: 1 1 auto;
    font-size: 0.84em;
    color: var(--primary-text-color, #000);
    line-height: 1.3;
  }

  .sce-row-label small {
    display: block;
    color: var(--secondary-text-color, #888);
    font-size: 0.83em;
    margin-top: 1px;
  }

  /* toggle pair */
  .sce-toggle-pair {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .sce-toggle-btn {
    padding: 4px 10px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.18));
    border-radius: 4px;
    background: transparent;
    color: var(--primary-text-color, #000);
    font-size: 0.8em;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .sce-toggle-btn.active-blue {
    background: rgba(51, 151, 232, 0.8);
    color: #fff;
    border-color: rgba(51, 151, 232, 0.8);
  }

  .sce-toggle-btn.active-green {
    background: rgba(51, 190, 100, 0.78);
    color: #fff;
    border-color: rgba(51, 190, 100, 0.78);
  }

  .sce-toggle-btn.active-red {
    background: rgba(210, 60, 60, 0.75);
    color: #fff;
    border-color: rgba(210, 60, 60, 0.75);
  }

  /* number input */
  .sce-number-input {
    width: 78px;
    flex: 0 0 auto;
    padding: 4px 6px;
    border-radius: 4px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.18));
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #000);
    font-size: 0.86em;
    text-align: right;
    box-sizing: border-box;
  }

  .sce-unit {
    flex: 0 0 auto;
    font-size: 0.76em;
    color: var(--secondary-text-color, #888);
    min-width: 26px;
  }

  /* ── Save footer ────────────────────────────────────────────────────── */
  .sce-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 6px;
  }

  .sce-save-btn {
    padding: 7px 20px;
    border: none;
    border-radius: 6px;
    background: rgba(51, 151, 232, 0.85);
    color: #fff;
    font-size: 0.88em;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .sce-save-btn:hover {
    background: rgba(51, 151, 232, 1);
  }

  .sce-save-btn:disabled {
    opacity: 0.38;
    cursor: default;
  }

  /* ── ATO info ───────────────────────────────────────────────────────── */
  /* ── Manual override notice ──────────────────────────────────────── */
  .sce-override {
    margin-top: 8px;
    padding: 8px 11px;
    border-radius: 6px;
    background: rgba(230, 162, 60, 0.12);
    border-left: 3px solid var(--warning-color, #e6a23c);
    font-size: 0.82em;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sce-resume-btn {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: 1px solid var(--warning-color, #e6a23c);
    border-radius: 6px;
    background: transparent;
    color: var(--primary-text-color, #000);
    font-size: 1em;
    cursor: pointer;
    --mdc-icon-size: 16px;
  }

  .sce-resume-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .sce-ato-info {
    padding: 8px 11px;
    border-radius: 6px;
    background: rgba(51, 151, 232, 0.08);
    font-size: 0.82em;
    color: var(--secondary-text-color, #888);
  }
`;
