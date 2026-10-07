import { css } from "lit";

export default css`
  .eb-root {
    position: relative;
    width: 100%;
  }

  .eb-flow {
    display: block;
    width: 100%;
  }

  .eb-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 24px 16px;
    text-align: center;
    color: var(--primary-text-color, #212121);
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: var(--ha-card-border-radius, 12px);
  }

  .eb-panel ha-icon {
    --mdc-icon-size: 40px;
    color: var(--secondary-text-color, #727272);
  }

  .eb-panel-title {
    font-size: 1.1em;
    font-weight: 500;
  }

  .eb-panel-text {
    color: var(--secondary-text-color, #727272);
  }

  .eb-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .eb-link {
    padding: 6px 14px;
    border-radius: 18px;
    text-decoration: none;
    color: var(--primary-color, #03a9f4);
    border: 1px solid var(--primary-color, #03a9f4);
  }

  .eb-link.primary {
    color: var(--text-primary-color, #fff);
    background: var(--primary-color, #03a9f4);
  }

  .eb-pumps {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 6px 0;
  }

  .eb-pump-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .eb-pump-device {
    color: var(--secondary-text-color, #727272);
  }

  .eb-hint {
    color: var(--secondary-text-color, #727272);
    font-size: 0.9em;
  }

  .eb-clear {
    cursor: pointer;
  }
`;
