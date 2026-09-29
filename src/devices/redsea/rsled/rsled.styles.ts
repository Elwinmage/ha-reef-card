/**
 * Styles of the ReefLED view elements: sky, beam and vertical sliders.
 */
import { css } from "lit";

/** Full-canvas SVG overlays (sky and beam): only their shapes take clicks. */
export const style_rsled_overlay = css`
  :host {
    display: block;
    pointer-events: none;
  }

  svg.rsled_canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
    font-family: var(--ha-font-family-body, Roboto, sans-serif);
  }

  .clickable {
    pointer-events: visiblePainted;
    cursor: pointer;
  }

  .sky_label {
    font-size: 17px;
    font-weight: 600;
    fill: #f2c230;
    letter-spacing: 0.5px;
    paint-order: stroke;
    stroke: rgba(20, 20, 20, 0.75);
    stroke-width: 4px;
  }

  .sky_mode {
    font-size: 34px;
    font-weight: 300;
    letter-spacing: 3px;
    text-transform: uppercase;
    fill: var(--primary-text-color, #444);
  }

  /* Name of the lamp, along its upper left edge */
  /* Written on the dark body of the lamp: a light grey, whatever the theme */
  .lamp_name {
    font-weight: 400;
    letter-spacing: 1.5px;
    fill: #e6e6e6;
    opacity: 0.85;
  }

  .lamp_name.sky_mode_off {
    fill: #9a9a9a;
  }

  .sky_mode_off {
    fill: #888888;
  }

  .beam_text {
    font-size: 18px;
    font-weight: 500;
    fill: #ffffff;
    paint-order: stroke;
    stroke: rgba(0, 0, 0, 0.45);
    stroke-width: 3px;
  }

  .beam_title {
    font-size: 16px;
    fill: #ffffff;
    paint-order: stroke;
    stroke: rgba(0, 0, 0, 0.45);
    stroke-width: 3px;
  }

  .chart_axis {
    stroke: rgba(255, 255, 255, 0.55);
    stroke-width: 1.5;
    fill: none;
  }

  .chart_grid {
    stroke: rgba(255, 255, 255, 0.18);
    stroke-width: 1;
    fill: none;
  }

  .chart_tick {
    font-size: 11px;
    fill: rgba(255, 255, 255, 0.85);
  }

  .chart_curve {
    fill: none;
    stroke-width: 2.5;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .now_marker {
    stroke: #ec2330;
    stroke-width: 2;
  }

  .now_time {
    font-size: 15px;
    font-weight: 600;
    fill: #ec2330;
    paint-order: stroke;
    stroke: rgba(255, 255, 255, 0.85);
    stroke-width: 3px;
  }

  /* The lamp identifies itself: the beam blinks */
  .beam_identify {
    animation: rsled-identify 0.8s steps(2, jump-none) infinite;
  }

  @keyframes rsled-identify {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.1;
    }
  }

  .kelvin_label {
    font-size: 12px;
    font-weight: 700;
    paint-order: stroke;
    stroke: rgba(10, 20, 40, 0.7);
    stroke-width: 3px;
  }

  .kelvin_box {
    fill: rgba(22, 33, 58, 0.4);
  }

  .kelvin_mark {
    stroke: rgba(255, 255, 255, 0.55);
    stroke-width: 1;
  }

  /* Moving clouds while their window is open */
  .cloud_active {
    animation: rsled-cloud-drift 6s ease-in-out infinite alternate;
  }

  @keyframes rsled-cloud-drift {
    from {
      transform: translateX(-6px);
    }
    to {
      transform: translateX(6px);
    }
  }
`;

/** Vertical slider driving one attribute of a light entity. */
export const style_rsled_slider = css`
  :host {
    display: block;
  }

  .vslider {
    position: relative;
    width: 100%;
    height: 100%;
    touch-action: none;
    cursor: pointer;
    user-select: none;
  }

  .vslider.disabled {
    cursor: default;
    opacity: 0.5;
  }

  .vtrack {
    position: absolute;
    left: 20%;
    width: 60%;
    top: 0;
    bottom: 0;
    border-radius: 6px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35);
    overflow: hidden;
  }

  /* Darkens the part of the track above the current value */
  .vtrack_mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    background: rgba(40, 40, 40, 0.55);
  }

  .vthumb {
    position: absolute;
    left: -25%;
    width: 150%;
    height: 22px;
    transform: translateY(50%);
    border-radius: 11px;
    background: var(--card-background-color, #fff);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    color: var(--primary-text-color, #222);
    white-space: nowrap;
    pointer-events: none;
  }

  .vicon {
    position: absolute;
    left: 50%;
    bottom: -34px;
    transform: translateX(-50%);
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color, #777);
  }
`;
