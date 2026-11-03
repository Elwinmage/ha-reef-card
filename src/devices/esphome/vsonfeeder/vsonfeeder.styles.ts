import { css } from "lit";

export default css`
  .ff-root {
    --ff-accent: rgb(255, 152, 0);
    --ff-ok: rgb(76, 175, 80);
    --ff-warn: rgb(219, 68, 55);
    --ff-muted: var(--secondary-text-color, #727272);
    --ff-surface: var(--ha-card-background, var(--card-background-color, #fff));
    --ff-line: var(--divider-color, rgba(0, 0, 0, 0.12));
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    color: var(--primary-text-color, #212121);
  }

  /* ── Feeder picture ─────────────────────────────────────────────────── */

  .ff-stage {
    position: relative;
    flex: 1 1 220px;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 8px;
    border-radius: var(--ha-card-border-radius, 12px);
    background: radial-gradient(
      ellipse at 50% 60%,
      rgba(3, 169, 244, 0.14),
      rgba(3, 169, 244, 0.03) 70%
    );
    overflow: hidden;
  }

  .ff-stage.offline .ff-img {
    filter: grayscale(90%);
    opacity: 0.7;
  }

  /* Picture box: every overlay is placed in percentages of the source
     render (367 x 368), and sized in cqw so it scales with the picture. */
  .ff-pic {
    position: relative;
    width: 100%;
    max-width: 320px;
    container-type: inline-size;
  }

  .ff-img {
    display: block;
    width: 100%;
    cursor: pointer;
    filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18));
  }

  /* Pellets falling from the lip of the open trap */
  .ff-pellets {
    position: absolute;
    left: 2%;
    top: 80%;
    width: 17%;
    height: 20%;
    pointer-events: none;
  }

  .ff-pellets span {
    position: absolute;
    top: 0;
    left: var(--x);
    width: 1.4cqw;
    height: 1.4cqw;
    border-radius: 50%;
    background: #b98a55;
    box-shadow: inset -1px -1px 0 rgba(0, 0, 0, 0.25);
    opacity: 0;
    animation: ff-fall 1.1s ease-in infinite;
    animation-delay: calc(var(--i) * 0.13s);
  }

  @keyframes ff-fall {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    100% {
      transform: translateY(18cqw);
      opacity: 0;
    }
  }

  /* Things stuck on a face of the feeder. The horizontal edges of the
     front face (trap side) go down 0.36 px per px to the right, those of
     the right face go up 0.43 px per px: skewY by the matching angles keeps
     the verticals vertical and lays the overlays flat on the faces. */
  .ff-face {
    position: absolute;
    box-sizing: border-box;
  }

  .ff-face.front {
    transform-origin: left top;
    transform: skewY(19.8deg);
  }

  .ff-face.right {
    transform: translate(-50%, -50%) skewY(-23.3deg) scaleX(0.8);
  }

  /* Uptime: a small display on the front face, above the trap */
  .ff-uptime {
    left: 4.6%;
    top: 39%;
    width: 28%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8cqw;
    padding: 0.8cqw 1.2cqw;
    border-radius: 1.2cqw;
    font-size: 4.2cqw;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    color: #9be7a8;
    background: linear-gradient(180deg, #2b3236, #1d2225);
    box-shadow:
      inset 0 0.3cqw 0.6cqw rgba(0, 0, 0, 0.6),
      0 0 0 0.3cqw rgba(255, 255, 255, 0.7);
    cursor: pointer;
  }

  .ff-uptime ha-icon {
    --mdc-icon-size: 4.2cqw;
    display: inline-flex;
  }

  /* Restart: a round push button on the right face */
  .ff-restart {
    left: 59.7%;
    top: 68.2%;
    width: 9cqw;
    height: 9cqw;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    color: #5f6368;
    background: radial-gradient(circle at 40% 35%, #ffffff, #d6d9dc);
    box-shadow:
      0 0.4cqw 0.8cqw rgba(0, 0, 0, 0.25),
      inset 0 -0.4cqw 0.6cqw rgba(0, 0, 0, 0.12),
      0 0 0 0.5cqw rgba(0, 0, 0, 0.06);
    cursor: pointer;
  }

  .ff-restart ha-icon {
    --mdc-icon-size: 5.4cqw;
    display: inline-flex;
  }

  .ff-restart:active {
    box-shadow:
      inset 0 0.4cqw 0.8cqw rgba(0, 0, 0, 0.25),
      0 0 0 0.5cqw rgba(0, 0, 0, 0.06);
  }

  .ff-restart.armed {
    color: #fff;
    background: radial-gradient(circle at 40% 35%, #ffb74d, var(--ff-accent));
  }

  .ff-restart:disabled {
    cursor: default;
    opacity: 0.5;
  }

  /* Empty reserve: a red warning on the right face */
  .ff-food-alert {
    left: 73%;
    top: 47.8%;
    width: 10cqw;
    height: 10cqw;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2cqw;
    color: #fff;
    background: var(--ff-warn);
    box-shadow: 0 0 2.4cqw rgba(219, 68, 55, 0.7);
    cursor: pointer;
  }

  .ff-food-alert ha-icon {
    --mdc-icon-size: 6.4cqw;
    display: inline-flex;
  }

  /* ── Slots panel ────────────────────────────────────────────────────── */

  .ff-panel {
    flex: 1 1 240px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ff-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 1.1em;
    font-weight: 500;
    padding-right: 36px; /* room for the maintenance shortcut */
  }

  .ff-offline {
    font-size: 0.75em;
    font-weight: 400;
    color: var(--ff-warn);
  }

  .ff-next {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(255, 152, 0, 0.12);
  }

  .ff-next > ha-icon {
    color: var(--ff-accent);
  }

  .ff-next.none {
    background: rgba(127, 127, 127, 0.1);
    color: var(--ff-muted);
  }

  .ff-next-text {
    flex: 1 1 auto;
    min-width: 0;
  }

  .ff-next-label {
    font-size: 0.75em;
    color: var(--ff-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ff-next-time {
    font-size: 1.5em;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .ff-next-delay {
    font-size: 0.55em;
    font-weight: 400;
    color: var(--ff-muted);
    margin-left: 4px;
  }

  .ff-next-portions {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 1.2em;
    font-weight: 500;
  }

  .ff-next-portions ha-icon {
    --mdc-icon-size: 20px;
    color: var(--ff-muted);
  }

  .ff-slots-head {
    display: flex;
    justify-content: space-between;
    padding: 0 6px;
    font-size: 0.75em;
    color: var(--ff-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ff-slots {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ff-slot {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 6px;
    border-radius: 10px;
    border: 1px solid var(--ff-line);
    background: var(--ff-surface);
  }

  .ff-slot.next {
    border-color: var(--ff-accent);
    box-shadow: inset 3px 0 0 var(--ff-accent);
  }

  .ff-slot.off .ff-slot-time,
  .ff-slot.off .ff-slot-index,
  .ff-slot.shadowed .ff-slot-time {
    opacity: 0.45;
  }

  .ff-slot.shadowed .ff-slot-time {
    text-decoration: line-through;
  }

  .ff-slot-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    flex: 0 0 22px;
    border-radius: 50%;
    font-size: 0.8em;
    font-weight: 500;
    color: #fff;
    background: var(--ff-accent);
  }

  .ff-slot.off .ff-slot-index {
    background: var(--ff-muted);
  }

  .ff-slot-time {
    flex: 1 1 auto;
    min-width: 0;
    font: inherit;
    font-size: 1.05em;
    font-variant-numeric: tabular-nums;
    color: inherit;
    background: transparent;
    border: none;
    padding: 2px 0;
  }

  .ff-portions {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .ff-portions-value {
    min-width: 22px;
    text-align: center;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  /* Set by the user, not reported back by the feeder yet */
  .ff-portions-value.pending,
  .ff-slot-time.pending {
    color: var(--ff-accent);
  }

  .ff-step {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: 50%;
    color: inherit;
    background: rgba(127, 127, 127, 0.12);
    cursor: pointer;
  }

  .ff-step ha-icon {
    --mdc-icon-size: 16px;
  }

  .ff-step:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .ff-total {
    font-size: 0.85em;
    color: var(--ff-muted);
    text-align: right;
    padding: 0 6px;
  }

  .ff-feed {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: auto;
    padding: 10px 16px;
    border: none;
    border-radius: 22px;
    font: inherit;
    font-weight: 500;
    color: #fff;
    background: var(--ff-accent);
    cursor: pointer;
  }

  .ff-feed:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .ff-feed.running ha-icon {
    animation: ff-spin 1s linear infinite;
  }

  @keyframes ff-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .ff-root.disabled .ff-stage {
    flex-basis: 100%;
  }
`;
