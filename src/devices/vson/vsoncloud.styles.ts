import { css } from "lit";

/**
 * Small additions on top of the shared feeder styles: the cloud view adds a
 * refresh button the ESPHome one does not have.
 */
export default css`
  .ff-refresh {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 4px 8px;
    margin-top: 4px;
    border: none;
    border-radius: 8px;
    background: var(--secondary-background-color, #e0e0e0);
    color: var(--secondary-text-color, #727272);
    cursor: pointer;
  }
  .ff-refresh:hover {
    filter: brightness(0.95);
  }
`;
