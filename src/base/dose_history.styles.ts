import { css } from "lit";

/**
 * Styles of the dose history of a ReefDose head (dialog `dose_history`),
 * on top of those of the message history.
 */
export default css`
  .day {
    margin: 10px 2px 2px 2px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
    color: var(--mh-text-soft);
  }

  .dose {
    display: grid;
    grid-template-columns: 1.4em 1fr auto;
    align-items: baseline;
    gap: 2px 8px;
    padding: 6px 2px;
    border-bottom: 1px solid var(--mh-divider);
  }

  .dose .when {
    font-variant-numeric: tabular-nums;
  }

  .dose .volume {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .dose .detail {
    grid-column: 2 / 4;
    font-size: 12px;
    color: var(--mh-text-soft);
  }

  .dose.manual .kind {
    color: var(--mh-accent);
  }

  .summary {
    font-size: 12px;
    color: var(--mh-text-soft);
  }
`;
