import { css } from "lit";

export default css`
  :host {
    position: fixed;
    inset: 0;
    z-index: 9999;
    font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    color: var(--primary-text-color, #1c1c1c);
  }
  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
  }
  .dialog {
    position: relative;
    margin: auto;
    width: min(1600px, 100vw);
    height: min(1000px, 100vh);
    background: var(--card-background-color, #fff);
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    border-radius: 8px;
    overflow: hidden;
  }
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--divider-color, #ddd);
  }
  header h2 {
    margin: 0;
    font-size: 1.15em;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .grow {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .message {
    font-size: 0.9em;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .message.info {
    background: var(--success-color, #43a047);
    color: white;
  }
  .message.error {
    background: var(--error-color, #db4437);
    color: white;
  }
  button {
    font: inherit;
    border: 1px solid var(--divider-color, #ccc);
    background: var(--secondary-background-color, #f5f5f5);
    color: inherit;
    border-radius: 6px;
    padding: 5px 10px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button.active {
    background: var(--primary-color, #03a9f4);
    border-color: var(--primary-color, #03a9f4);
    color: white;
  }
  button.primary {
    background: var(--primary-color, #03a9f4);
    border-color: var(--primary-color, #03a9f4);
    color: white;
  }
  button.danger {
    border-color: var(--error-color, #db4437);
    color: var(--error-color, #db4437);
    background: none;
  }
  button.icon {
    padding: 4px 6px;
  }
  button.depth {
    border-left: 6px solid var(--c);
  }
  button svg,
  .chip svg,
  .tree-row svg,
  .ghost svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
    flex: none;
  }
  .body {
    flex: 1;
    display: flex;
    min-height: 0;
  }
  .body.loading {
    align-items: center;
    justify-content: center;
  }
  aside {
    width: 380px;
    flex: none;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--divider-color, #ddd);
    min-height: 0;
  }
  aside nav {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid var(--divider-color, #ddd);
  }
  aside nav button {
    padding: 4px 8px;
    font-size: 0.9em;
  }
  .panel {
    flex: 1;
    overflow: auto;
    padding: 10px 12px 40px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  fieldset {
    border: 1px solid var(--divider-color, #ddd);
    border-radius: 6px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
  }
  legend {
    font-weight: 500;
    padding: 0 4px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 0.9em;
  }
  .field.small {
    flex: 1 1 0;
    min-width: 0;
  }
  .field input:not([type="checkbox"]):not([type="color"]),
  .field select,
  fieldset > input,
  fieldset > select,
  .panel > input,
  .panel > select {
    width: 100%;
    box-sizing: border-box;
  }
  input,
  select {
    font: inherit;
    padding: 5px 6px;
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 4px;
    background: var(--card-background-color, white);
    color: inherit;
    min-width: 0;
  }
  input[type="range"] {
    padding: 0;
  }
  input[type="color"] {
    width: 36px;
    height: 28px;
    padding: 0 2px;
  }
  .check {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9em;
  }
  .hint {
    color: var(--secondary-text-color, #777);
    font-size: 0.82em;
  }
  .buttons,
  .row3,
  .line,
  .palette {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
  }
  .row3 {
    flex-wrap: nowrap;
  }
  .line .grow {
    font-size: 0.9em;
  }
  .line .latin {
    font-weight: normal;
    font-size: 0.85em;
    color: var(--secondary-text-color, #777);
    margin-left: 4px;
  }
  .list .item,
  .card {
    border: 1px solid var(--divider-color, #ddd);
    border-radius: 6px;
    padding: 6px 8px;
    margin-bottom: 4px;
    cursor: pointer;
  }
  .list .item.current,
  .card.current {
    border-color: var(--primary-color, #03a9f4);
    box-shadow: inset 3px 0 0 var(--primary-color, #03a9f4);
  }
  .card {
    cursor: default;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .suggestion {
    font-size: 0.85em;
  }
  .search {
    width: 100%;
    box-sizing: border-box;
  }
  .picker {
    position: relative;
  }
  .picker-list {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    z-index: 5;
    max-height: 280px;
    overflow: auto;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 4px;
  }
  button.pick {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    text-align: left;
    border: none;
    background: none;
    padding: 4px 6px;
    border-radius: 4px;
    cursor: pointer;
  }
  button.pick:hover {
    background: var(--secondary-background-color, #f0f0f0);
  }
  button.pick small {
    color: var(--secondary-text-color, #777);
    font-size: 0.8em;
  }
  button.pick.custom {
    font-style: italic;
  }
  .thumb {
    flex: none;
    width: 48px;
    height: 32px;
    object-fit: contain;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .thumb.sprite {
    display: inline-block;
    background-repeat: no-repeat;
  }
  .thumb.icon svg {
    width: 22px;
    height: 22px;
    fill: var(--secondary-text-color, #777);
  }
  .line.chosen {
    margin: 4px 0;
  }
  .notice {
    margin: 4px 0 8px;
    padding: 8px 10px;
    border-radius: 6px;
    background: rgba(255, 152, 0, 0.12);
    border-left: 3px solid #ff9800;
    font-size: 0.9em;
  }
  .tree {
    font-size: 0.88em;
    display: flex;
    flex-direction: column;
  }
  .tree .hint {
    padding: 6px 4px;
    color: var(--secondary-text-color, #777);
  }
  .tree-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 32px;
    padding: 2px 4px 2px calc(4px + var(--depth, 0) * 16px);
    border-radius: 6px;
    cursor: pointer;
    touch-action: none;
  }
  .tree-row.device,
  .tree-row.entity {
    cursor: grab;
  }
  .tree-row:hover {
    background: var(--secondary-background-color, #f0f0f0);
  }
  .tree-row.floor {
    font-weight: 500;
  }
  .tree-row ha-icon,
  .tree-row ha-state-icon {
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color, #555);
    flex: none;
  }
  .tree-row img.brand {
    width: 20px;
    height: 20px;
    object-fit: contain;
    flex: none;
  }
  .tree-row .label {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .tree-row .name,
  .tree-row .sub {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tree-row .sub {
    font-size: 0.85em;
    color: var(--secondary-text-color, #777);
  }
  .tree-row .count {
    font-size: 0.8em;
    color: var(--secondary-text-color, #777);
  }
  .tree-row svg.chevron,
  .tree-row span.chevron {
    width: 20px;
    height: 20px;
    flex: none;
    transition: transform 0.15s;
    color: var(--secondary-text-color, #777);
  }
  .tree-row svg.chevron.open {
    transform: rotate(90deg);
  }
  .tree-row .add {
    padding: 0 6px;
    line-height: 1.3;
    visibility: hidden;
  }
  .tree-row:hover .add {
    visibility: visible;
  }
  @media (hover: none) {
    .tree-row .add {
      visibility: visible;
    }
  }
  label.switch {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.9em;
  }
  label.switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  label.switch .slider {
    position: relative;
    width: 34px;
    height: 14px;
    border-radius: 7px;
    background: var(--disabled-color, #bbb);
    flex: none;
    transition: background 0.15s;
  }
  label.switch .slider::after {
    content: "";
    position: absolute;
    top: -3px;
    left: -2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fafafa;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    transition: transform 0.15s;
  }
  label.switch input:checked + .slider {
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 50%,
      transparent
    );
  }
  label.switch input:checked + .slider::after {
    transform: translateX(18px);
    background: var(--primary-color, #03a9f4);
  }
  label.switch input:focus-visible + .slider {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }
  main {
    flex: 1;
    min-width: 0;
    background: #1b2430;
    display: flex;
    overflow: auto;
    padding: 12px;
  }
  .stage-wrap {
    margin: auto;
    width: 100%;
    max-height: 100%;
    display: flex;
  }
  .stage {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: calc(100vh - 140px);
    background: #0b1622;
    touch-action: none;
    user-select: none;
  }
  .stage.tool-decor,
  .stage.tool-hotspot,
  .stage.tool-lasso,
  .stage.tool-coral,
  .stage.tool-home {
    cursor: crosshair;
  }
  .stage > img.bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    pointer-events: none;
  }
  .noimage,
  .empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9fb3c8;
    text-align: center;
    padding: 20px;
  }
  .empty {
    position: static;
    margin: auto;
  }
  .stage > canvas.backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .stage > svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  polygon {
    vector-effect: non-scaling-stroke;
    stroke-width: 2;
  }
  polygon.region {
    fill: rgba(0, 200, 255, 0.06);
    stroke: rgba(0, 200, 255, 0.6);
    stroke-dasharray: 6 4;
    pointer-events: none;
  }
  polygon.region.current {
    stroke: rgb(0, 220, 255);
    fill: rgba(0, 200, 255, 0.12);
  }
  polygon.decor {
    fill: color-mix(in srgb, var(--c) 30%, transparent);
    stroke: var(--c);
  }
  polygon.hotspot {
    fill: rgba(255, 255, 255, 0.12);
    stroke: white;
    stroke-dasharray: 4 3;
  }
  polygon.selected {
    stroke: white;
    stroke-width: 3;
  }
  polyline.drawing {
    fill: none;
    stroke: #00e5ff;
    stroke-width: 2;
    vector-effect: non-scaling-stroke;
  }
  .handle {
    position: absolute;
    width: 14px;
    height: 14px;
    margin: -7px 0 0 -7px;
    border-radius: 50%;
    background: white;
    border: 2px solid #00b8d4;
    cursor: move;
    touch-action: none;
    z-index: 4;
  }
  .handle.corner {
    border-color: #00e5ff;
    width: 18px;
    height: 18px;
    margin: -9px 0 0 -9px;
  }
  .handle.sand {
    border-color: #f5c26b;
    border-radius: 3px;
  }
  polyline.sand {
    fill: none;
    stroke: rgba(245, 194, 107, 0.55);
    stroke-width: 2;
    stroke-dasharray: 8 4;
    vector-effect: non-scaling-stroke;
    pointer-events: none;
  }
  polyline.sand.current {
    stroke: #f5c26b;
  }
  polyline.sand.back {
    stroke-dasharray: 3 4;
  }
  .handle.sand.back {
    border-color: #c99a4a;
    background: #f5e6c8;
  }
  .handle.point {
    width: 8px;
    height: 8px;
    margin: -4px 0 0 -4px;
    pointer-events: none;
  }
  .el {
    position: absolute;
    cursor: move;
    touch-action: none;
    z-index: 3;
    display: flex;
    gap: 2px;
    align-items: center;
    width: max-content;
  }
  .el img {
    display: block;
    flex: none;
    width: 56px;
    max-height: 56px;
    object-fit: contain;
    pointer-events: none;
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
  .el.selected {
    outline: 2px dashed #00e5ff;
    outline-offset: 3px;
  }
  .chip,
  .ghost {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(10, 20, 35, 0.75);
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8em;
    white-space: nowrap;
  }
  .ghost {
    position: fixed;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 10;
  }
  .coral {
    position: absolute;
    width: 18px;
    height: 18px;
    margin: -9px 0 0 -9px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    background: var(--c);
    border: 2px solid white;
    cursor: move;
    touch-action: none;
    z-index: 3;
  }
  .coral.selected {
    box-shadow: 0 0 0 3px #00e5ff;
  }
  .home {
    position: absolute;
    width: 24px;
    height: 24px;
    margin: -12px 0 0 -12px;
    border-radius: 50%;
    background: rgba(10, 20, 35, 0.75);
    border: 2px solid #f5c26b;
    display: grid;
    place-items: center;
    cursor: move;
    touch-action: none;
    z-index: 3;
  }
  .home svg {
    width: 16px;
    height: 16px;
    fill: #f5c26b;
    pointer-events: none;
  }
  .home-row {
    margin-top: 4px;
  }
  .home-row select {
    width: auto;
  }
  .lamp {
    position: absolute;
    transform: translate(-50%, -110%);
    font-size: 22px;
    color: #ffe066;
    text-shadow: 0 0 6px #000;
    cursor: ew-resize;
    touch-action: none;
    z-index: 4;
  }
  @media (max-width: 800px) {
    .dialog {
      border-radius: 0;
    }
    .body {
      flex-direction: column;
    }
    aside {
      width: auto;
      max-height: 50%;
      border-right: none;
      border-bottom: 1px solid var(--divider-color, #ddd);
    }
  }
`;
