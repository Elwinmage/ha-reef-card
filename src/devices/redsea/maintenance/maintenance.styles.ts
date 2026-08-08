import { css } from "lit";

/**
 * Styles of the maintenance overview.
 *
 * Colors are taken from the active Home Assistant theme when available so the
 * view blends with the rest of the dashboard, with hardcoded fallbacks for
 * standalone rendering (storybook / tests).
 */
export default css`
  :host {
    --maint-ok: var(--success-color, #43a047);
    --maint-warning: var(--warning-color, #ffa600);
    --maint-overdue: var(--error-color, #db4437);
    --maint-never: var(--disabled-text-color, #9e9e9e);
    --maint-text: var(--primary-text-color, #e1e1e1);
    --maint-text-soft: var(--secondary-text-color, #9b9b9b);
    --maint-divider: var(--divider-color, rgba(127, 127, 127, 0.3));
    display: block;
  }

  .maint-root {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 4px 12px 4px;
    color: var(--maint-text);
    font-size: 14px;
  }

  /* ── Header ─────────────────────────────────────────────────────────── */

  .maint-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--maint-divider);
  }

  .maint-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1.1em;
    font-weight: 600;
  }

  .maint-counters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .maint-badge {
    border-radius: 12px;
    padding: 1px 8px;
    font-size: 0.75em;
    font-weight: 600;
    color: white;
    white-space: nowrap;
  }

  .maint-badge.overdue {
    background-color: var(--maint-overdue);
  }
  .maint-badge.warning {
    background-color: var(--maint-warning);
  }
  .maint-badge.ok {
    background-color: var(--maint-ok);
  }
  .maint-badge.never {
    background-color: var(--maint-never);
  }

  /* ── Toolbar ────────────────────────────────────────────────────────── */

  .maint-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .maint-sort {
    display: inline-flex;
    border: 1px solid var(--maint-divider);
    border-radius: 16px;
    overflow: hidden;
  }

  .maint-sort button {
    background: transparent;
    border: none;
    color: var(--maint-text-soft);
    cursor: pointer;
    font-size: 0.8em;
    font-family: inherit;
    padding: 4px 12px;
  }

  .maint-sort button.active {
    background-color: var(--primary-color, #03a9f4);
    color: white;
    font-weight: 600;
  }

  .maint-filter {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--maint-text-soft);
    cursor: pointer;
    font-size: 0.8em;
  }

  /* ── Groups & rows ──────────────────────────────────────────────────── */

  .maint-group-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    color: var(--maint-text-soft);
    font-size: 0.85em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .maint-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }

  .maint-icon {
    flex: 0 0 auto;
    color: var(--maint-text-soft);
    --mdc-icon-size: 20px;
  }

  .maint-body {
    flex: 1 1 auto;
    min-width: 0;
    cursor: pointer;
  }

  .maint-line {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .maint-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .maint-device {
    color: var(--maint-text-soft);
    font-size: 0.8em;
  }

  .maint-remaining {
    flex: 0 0 auto;
    font-size: 0.85em;
    font-weight: 600;
    white-space: nowrap;
  }

  .maint-remaining.ok {
    color: var(--maint-ok);
  }
  .maint-remaining.warning {
    color: var(--maint-warning);
  }
  .maint-remaining.overdue {
    color: var(--maint-overdue);
  }
  .maint-remaining.never {
    color: var(--maint-never);
  }

  /* ── Progress bar ───────────────────────────────────────────────────── */

  .maint-bar {
    position: relative;
    height: 8px;
    margin-top: 3px;
    border-radius: 8px;
    background-color: var(--maint-divider);
    overflow: hidden;
  }

  .maint-bar-fill {
    height: 100%;
    border-radius: 8px;
    transition: width 0.3s ease;
  }

  .maint-bar-fill.ok {
    background-color: var(--maint-ok);
  }
  .maint-bar-fill.warning {
    background-color: var(--maint-warning);
  }
  .maint-bar-fill.overdue {
    background-color: var(--maint-overdue);
  }
  .maint-bar-fill.never {
    background-color: var(--maint-never);
  }

  /* ── Reset button ───────────────────────────────────────────────────── */

  .maint-done {
    flex: 0 0 auto;
    background: transparent;
    border: 1px solid var(--maint-divider);
    border-radius: 50%;
    color: var(--maint-text-soft);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    width: 26px;
    padding: 0;
    --mdc-icon-size: 16px;
  }

  .maint-done:hover {
    border-color: var(--maint-ok);
    color: var(--maint-ok);
  }

  /* ── Notification bell ──────────────────────────────────────────────── */

  .maint-bell {
    flex: 0 0 auto;
    background: transparent;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    width: 22px;
    padding: 0;
    --mdc-icon-size: 16px;
  }

  .maint-bell.on {
    color: var(--maint-text-soft);
  }

  .maint-bell.off {
    color: var(--maint-never);
  }

  .maint-bell:hover {
    color: var(--primary-color, #03a9f4);
  }

  /* Muted tasks stay visible but visually recede: the deadline still
     matters, only the alerting is off. */
  .maint-row.muted .maint-name,
  .maint-row.muted .maint-remaining,
  .maint-row.muted .maint-icon {
    opacity: 0.55;
  }

  .maint-row.muted .maint-bar {
    opacity: 0.45;
  }

  /* ── Interval editor ────────────────────────────────────────────────── */

  .maint-tune {
    flex: 0 0 auto;
    background: transparent;
    border: none;
    color: var(--maint-text-soft);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    width: 22px;
    padding: 0;
    --mdc-icon-size: 16px;
  }

  .maint-tune:hover,
  .maint-tune.open {
    color: var(--primary-color, #03a9f4);
  }

  .maint-editor {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0 0 8px 28px;
    padding: 8px 10px;
    border-radius: 8px;
    background-color: rgba(127, 127, 127, 0.12);
  }

  .maint-editor-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .maint-editor-label {
    color: var(--maint-text-soft);
    font-size: 0.85em;
  }

  .maint-editor-value {
    font-size: 0.9em;
    font-weight: 600;
  }

  .maint-editor-bound {
    color: var(--maint-text-soft);
    font-size: 0.75em;
    min-width: 1.5em;
    text-align: center;
  }

  .maint-slider {
    flex: 1 1 auto;
    accent-color: var(--primary-color, #03a9f4);
    cursor: pointer;
    min-width: 0;
  }

  /* ── Empty state ────────────────────────────────────────────────────── */

  .maint-empty {
    color: var(--maint-text-soft);
    font-style: italic;
    padding: 12px 4px;
    text-align: center;
  }
`;
