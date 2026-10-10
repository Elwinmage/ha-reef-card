import { css } from "lit";

export default css`
  :host {
    display: block;
  }
  ha-card {
    overflow: hidden;
    position: relative;
  }
  .stage {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: #0b1622;
    user-select: none;
    -webkit-user-select: none;
  }
  .stage img.bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    display: block;
  }
  .stage canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .stage canvas.glow {
    mix-blend-mode: screen;
  }
  .water {
    position: absolute;
    inset: 0;
    pointer-events: none;
    transition: background 2s linear;
  }
  .water.tint {
    mix-blend-mode: multiply;
  }
  svg.hotspots {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  svg.hotspots polygon {
    fill: rgba(255, 255, 255, 0);
    stroke: rgba(255, 255, 255, 0);
    stroke-width: 3;
    vector-effect: non-scaling-stroke;
    cursor: pointer;
    transition:
      fill 0.2s,
      stroke 0.2s;
  }
  svg.hotspots polygon:hover {
    fill: rgba(255, 255, 255, 0.12);
    stroke: rgba(255, 255, 255, 0.7);
  }
  .el {
    position: absolute;
    transform: translate(-50%, -50%);
    transform-origin: center;
    z-index: 2;
  }
  .el.device {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .el.device img {
    display: block;
    flex: none;
    width: 56px;
    max-height: 56px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  }
  .el .badge {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ff9800;
    color: white;
    display: grid;
    place-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }
  .el .badge svg {
    width: 12px;
    height: 12px;
    fill: currentColor;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(10, 20, 35, 0.62);
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8em;
    white-space: nowrap;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .chip svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
    flex: none;
  }
  .el.missing .chip {
    text-decoration: line-through;
    opacity: 0.7;
  }
  .nav {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    gap: 6px;
    align-items: center;
    z-index: 3;
  }
  .nav button,
  .overlay .close {
    border: none;
    border-radius: 16px;
    background: rgba(10, 20, 35, 0.7);
    color: white;
    padding: 4px 12px;
    cursor: pointer;
    font-size: 0.95em;
  }
  img.preview {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }
  .message {
    padding: 24px 16px;
    text-align: center;
    color: var(--secondary-text-color, #666);
  }
  .message strong {
    display: block;
    color: var(--primary-text-color, #222);
    margin-bottom: 6px;
  }
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    background: var(--card-background-color, white);
    overflow: auto;
  }
  .overlay .close {
    position: sticky;
    top: 8px;
    margin: 8px;
    z-index: 6;
    float: right;
  }
`;
