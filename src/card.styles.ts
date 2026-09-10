import { css } from "lit";

export default css`
  /* Back control for device-to-device navigation. Rendered next to the
     device selector, and on its own when the card is pinned to a device —
     in that case it is the only way home. */
  #nav_back {
    background: var(--input-fill-color, rgba(127, 127, 127, 0.12));
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    border-radius: 6px;
    color: var(--primary-text-color, inherit);
    cursor: pointer;
    font-size: 1em;
    line-height: 1;
    padding: 2px 8px;
    vertical-align: middle;
  }

  #nav_back:hover {
    background: var(--input-fill-color, rgba(127, 127, 127, 0.22));
  }

  /* Shown while the card is displaying a device reached through a link,
     rather than the one it is configured for. */
  :host(.following-link) {
    display: block;
    border: 2px solid var(--primary-color, #3397e8);
    border-radius: 12px;
    box-sizing: border-box;
  }
`;
