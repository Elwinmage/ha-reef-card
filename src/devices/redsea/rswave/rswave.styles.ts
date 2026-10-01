/**
 * Styles of the ReefWave view elements: flow, LED strip label and day
 * program (graph and program view).
 */
import { css } from "lit";

/** Full-canvas SVG overlays (flow, label): they never take clicks. */
export const style_rswave_overlay = css`
  :host {
    display: block;
    pointer-events: none;
  }

  svg.rswave_canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
    font-family: var(--ha-font-family-body, Roboto, sans-serif);
  }

  /* ── LED strip ─────────────────────────────────────────────────── */

  .mode_text {
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    paint-order: stroke;
    stroke: rgba(20, 20, 20, 0.55);
    stroke-width: 2px;
  }

  /* The mode takes clicks (more-info), the rest of the overlay does not */
  .mode_click {
    pointer-events: all;
    cursor: pointer;
  }

  /* Written on the dark body of the pump: a light grey, whatever the theme */
  .pump_name {
    font-weight: 400;
    letter-spacing: 1px;
    fill: #e6e6e6;
    opacity: 0.9;
    paint-order: stroke;
    stroke: rgba(20, 20, 20, 0.6);
    stroke-width: 3px;
  }

  .pump_name.off {
    fill: #9a9a9a;
  }

  /* ── Flow ──────────────────────────────────────────────────────── */

  .flow_lines {
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  .flow_lines.fw {
    animation-name: rswave-flow-fw;
  }

  .flow_lines.rw {
    animation-name: rswave-flow-rw;
  }

  .flow_lines.alt {
    animation-name: rswave-flow-alt;
    animation-direction: alternate;
    animation-timing-function: ease-in-out;
  }

  /* One period of the stripes (FLOW_PERIOD) per loop: seamless */
  @keyframes rswave-flow-fw {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-36px);
    }
  }

  @keyframes rswave-flow-rw {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(36px);
    }
  }

  /* Alternate: back and forth over several periods (FLOW_ALT_PERIODS) */
  @keyframes rswave-flow-alt {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-216px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .flow_lines {
      animation: none;
    }
  }
`;

/** Day program: graph and program view. */
export const style_rswave_schedule = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .program {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    font-family: var(--ha-font-family-body, Roboto, sans-serif);
  }

  .program.off {
    filter: grayscale(90%);
  }

  svg.graph {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .frame {
    fill: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    stroke: var(--divider-color, rgba(127, 127, 127, 0.3));
    stroke-width: 1;
  }

  .axis {
    stroke: var(--secondary-text-color, #888);
    stroke-width: 1;
    opacity: 0.6;
  }

  .grid {
    stroke: var(--divider-color, rgba(127, 127, 127, 0.25));
    stroke-width: 1;
    stroke-dasharray: 2 3;
  }

  .tick,
  .scale {
    fill: var(--secondary-text-color, #888);
    font-size: 11px;
  }

  .title {
    fill: var(--primary-text-color, #333);
    font-size: 13px;
    font-weight: 600;
  }

  .legend {
    fill: var(--primary-text-color, #333);
    font-size: 11px;
  }

  .no_wave {
    stroke-width: 2;
    stroke-dasharray: 4 3;
  }

  .now_line {
    stroke: rgb(255, 40, 40);
    stroke-width: 2;
  }

  .now_dot {
    fill: rgb(255, 40, 40);
  }

  .empty {
    fill: var(--secondary-text-color, #888);
    font-size: 13px;
  }

  /* ── Program view (overlay) ────────────────────────────────────── */

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.55);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    /* Opened from an overlay that lets clicks through */
    pointer-events: auto;
  }

  .panel {
    background: var(--card-background-color, #1c1c1c);
    color: var(--primary-text-color, #e0e0e0);
    border-radius: 12px;
    padding: 16px;
    width: min(96vw, 760px);
    max-height: 94vh;
    /* The whole panel scrolls when it is taller than the screen: the table
       itself never does, it is shown whole */
    overflow-y: auto;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }

  .panel_header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
  }

  .panel_header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
  }

  .btn_close {
    background: none;
    border: none;
    color: inherit;
    font-size: 16px;
    cursor: pointer;
    padding: 4px 8px;
  }

  .panel_graph {
    height: 230px;
    flex: 0 0 auto;
  }

  .panel_table {
    flex: 0 0 auto;
    overflow: visible;
  }

  .wave_zone {
    flex: 0 0 auto;
    border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    padding-top: 8px;
  }

  .wave_zone h4 {
    margin: 0 0 6px;
    font-size: 14px;
    font-weight: 500;
  }

  td.actions {
    white-space: nowrap;
  }

  .btn_icon.focused {
    color: #ec2330;
  }

  .lib_preview {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 8px;
    background: rgba(127, 127, 127, 0.08);
  }

  .preview_label {
    font-size: 12px;
    font-weight: 500;
    margin-right: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  th {
    text-align: left;
    font-weight: 500;
    font-size: 11px;
    opacity: 0.6;
    padding: 4px 6px;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    white-space: nowrap;
  }

  td {
    padding: 5px 6px;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
    white-space: nowrap;
  }

  td.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  tr.current td {
    background: rgba(255, 40, 40, 0.12);
    font-weight: 600;
  }

  .chip {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin-right: 6px;
    vertical-align: middle;
  }

  /* ── Editors (program, library) ────────────────────────────────── */

  .note {
    margin: 0;
    font-size: 12px;
    opacity: 0.8;
  }

  .note.warn,
  .warn {
    color: var(--warning-color, #c77700);
    opacity: 1;
  }

  /* Grouping of the pump and order of the group, under the group note */
  .group_tools {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin: 2px 0 4px;
    font-size: 12px;
  }

  .btn_group {
    background: none;
    color: inherit;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
    border-radius: 6px;
    padding: 3px 10px;
    cursor: pointer;
  }

  .order {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  .order_pump {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 4px;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
    border-radius: 12px;
    cursor: grab;
    user-select: none;
  }

  .order_pump.current {
    border-color: var(--error-color, #db4437);
  }

  .order_pump.dragging {
    opacity: 0.4;
  }

  .order_pump.drop {
    background: rgba(236, 35, 48, 0.12);
  }

  .order_pump .index {
    opacity: 0.6;
    margin-right: 2px;
  }

  .move {
    padding: 0 3px;
    border: none;
    background: none;
    color: inherit;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
  }

  .move:disabled {
    opacity: 0.25;
    cursor: default;
  }

  .hint {
    margin: 4px 0 0;
    font-size: 11px;
    opacity: 0.65;
  }

  .error {
    margin: 0;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 12px;
    color: var(--error-color, #db4437);
    background: rgba(219, 68, 55, 0.1);
  }

  input,
  select {
    font: inherit;
    font-size: 13px;
    color: inherit;
    background: var(--input-fill-color, rgba(127, 127, 127, 0.08));
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
    border-radius: 4px;
    padding: 3px 4px;
    box-sizing: border-box;
  }

  input:disabled,
  select:disabled,
  button:disabled {
    opacity: 0.45;
    cursor: default;
  }

  td.end {
    opacity: 0.7;
    font-variant-numeric: tabular-nums;
  }

  select.wave {
    max-width: 160px;
  }

  button {
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }

  .btn_icon {
    background: none;
    border: none;
    color: inherit;
    font-size: 16px;
    padding: 0 6px;
  }

  .btn_add {
    margin-top: 6px;
    background: none;
    border: 1px dashed var(--divider-color, rgba(127, 127, 127, 0.5));
    border-radius: 6px;
    color: inherit;
    padding: 4px 10px;
  }

  .panel_footer,
  .lib_actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .btn_save,
  .btn_cancel,
  .btn_delete {
    border-radius: 6px;
    padding: 5px 14px;
    border: 1px solid transparent;
  }

  .btn_save {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }

  .btn_cancel {
    background: none;
    color: inherit;
    border-color: var(--divider-color, rgba(127, 127, 127, 0.4));
  }

  .btn_delete {
    background: none;
    color: var(--error-color, #db4437);
    border-color: var(--error-color, #db4437);
  }

  /* ── Library ───────────────────────────────────────────────────── */

  .lib_open {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 24px;
    padding: 1px 10px 1px 6px;
    border-radius: 12px;
    font-size: 12px;
    white-space: nowrap;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
    background: var(--card-background-color, #fff);
    color: #ec2330;
  }

  .lib_open svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  .lib_body {
    display: flex;
    gap: 12px;
  }

  .lib_list {
    flex: 0 0 40%;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .lib_item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 6px;
    text-align: left;
    background: none;
    color: inherit;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    border-radius: 8px;
    padding: 6px 8px;
  }

  .lib_item.selected {
    border-color: var(--primary-color, #03a9f4);
    background: rgba(3, 169, 244, 0.08);
  }

  .lib_name {
    font-weight: 500;
  }

  .badge {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 8px;
    color: #ec2330;
    border: 1px solid #ec2330;
  }

  .lib_users {
    flex-basis: 100%;
    font-size: 11px;
    opacity: 0.65;
  }

  .lib_edit {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .lib_edit h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }

  .lib_types {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
  }

  .lib_type {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: none;
    color: inherit;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    border-radius: 8px;
    padding: 4px;
    font-size: 11px;
  }

  .lib_type svg {
    width: 28px;
    height: 28px;
  }

  .lib_type.selected {
    border-color: #ec2330;
    background: rgba(236, 35, 48, 0.08);
  }

  .lib_fields {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 6px 10px;
  }

  .lib_field {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 11px;
  }

  .lib_field.check {
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  input.new_name {
    flex: 1;
    min-width: 120px;
  }

  @media (max-width: 560px) {
    .lib_body {
      flex-direction: column;
    }
  }
`;
