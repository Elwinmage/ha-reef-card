import { css } from "lit";

export default css`
  /* Layer the exact size of the hub picture (1952 x 2196), holding what is
     placed on the picture: probes, ports, socket masks, summary bar.
     The device box keeps a fixed 1/1.2 ratio only while nothing in its
     flow is taller; a card below the picture makes it grow, so a position
     in % of its height drifts away from the picture as the card narrows.
     This layer's height is always tied to the picture width. */
  .canvas_layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: 1952 / 2196;
    /* Full-canvas layer: let clicks through to the hub controls below */
    pointer-events: none;
  }

  .probe_slot,
  .port_slot,
  .summary {
    pointer-events: auto;
  }

  /* A powered socket of the paired strip */
  .socket_mask {
    position: absolute;
    background-color: rgba(255, 30, 30, 0.35);
    border-radius: 8%;
    pointer-events: none;
  }

  /* One-line recap of the readings. The box is a size container: the text
     follows its width, so the whole line still fits on a narrow card. */
  .summary {
    position: absolute;
    container-type: inline-size;
    box-sizing: border-box;
    overflow: hidden;
    border-radius: 999px;
    background-color: rgba(0, 0, 0, 0.55);
  }

  .summary_row {
    display: flex;
    align-items: center;
    gap: 0.9em;
    height: 100%;
    padding: 0 0.8em;
    white-space: nowrap;
    color: rgba(255, 255, 255, 0.85);
    font-size: clamp(6px, 3.3cqw, 15px);
    font-weight: bold;
  }

  .summary ha-icon {
    --mdc-icon-size: 1.3em;
  }

  .summary_item {
    display: inline-flex;
    align-items: center;
    gap: 0.2em;
    cursor: pointer;
  }
`;
