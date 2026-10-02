import { CSSResult, html, nothing, TemplateResult } from "lit";

import { am_box_styles } from "../common/am_device";
import { AMRunnerSeries } from "../common/am_runner";
import { PICTURE, config } from "./dcskimmer.mapping";
import style_skimmer from "./dcskimmer.styles";

/** Speeds between which the water animation goes from slow to fast, in %. */
export const WATER_SPEED_RANGE = [30, 100] as const;

/** Seconds the water bands take to scroll once, at the slowest and fastest. */
export const WATER_PERIOD = { slow: 20, fast: 2.5 } as const;

/** Foam bubbles in the collection cup. */
export const FOAM = {
  count: 7,
  /** Largest diameter before the pop, in px */
  size: 7,
  /** Base duration of a bubble, in seconds */
  duration: 2.9,
  /** Period of the redraw moving the bubbles around, in ms */
  respawn_ms: 5000,
} as const;

/**
 * Aqua Medic DC Skimmer.
 *
 * The DC Skimmer and the DC Runner return pump share the same Gizwits
 * product key and are both reported to Home Assistant with model "DC
 * Runner" (see ha-aquamedic-component entity.py resolve_model()). The card
 * tells them apart by reading the device's pump_role select entity (see
 * KNOWN_DEVICE_DOMAINS.aquamedic.model_overrides in utils/constants.ts) --
 * the same idea as RSRun picking between its RSPump/RSReturn/RSSkimmer
 * sub-elements from a "type" sensor, one level up since here each pump is
 * its own top-level device rather than a sub-element of a shared one.
 *
 * Like the ReefRun skimmer, the picture follows the pump: an idle skimmer
 * when it is stopped, a foaming one when it runs, with water bands rising
 * in the reaction chamber at the pace of the motor and bubbles popping in
 * the cup. The Aqua Medic firmware has no full-cup detection, so there is no
 * third state.
 */
export class AMDCSkimmer extends AMRunnerSeries {
  static override styles = [
    ...(am_box_styles(PICTURE.box) as CSSResult[]),
    style_skimmer,
  ];

  private _bubbleInterval: ReturnType<typeof setInterval> | null = null;

  /** What the picture was last drawn from: running state and speed. */
  private _activity: string | null = null;

  constructor() {
    super();
    this.initial_config = config;
  }

  device = {
    model: "DC Skimmer",
    name: "",
    elements: null,
  };

  // ── State ─────────────────────────────────────────────────────────────

  /**
   * Seconds the water bands take to scroll once: the faster the motor, the
   * shorter.
   * @param speed: motor speed, in %
   */
  static water_period(speed: number): number {
    const [low, high] = WATER_SPEED_RANGE;
    const ratio = (Math.max(low, Math.min(high, speed)) - low) / (high - low);
    return WATER_PERIOD.slow + ratio * (WATER_PERIOD.fast - WATER_PERIOD.slow);
  }

  // ── Re-render detection ───────────────────────────────────────────────

  /**
   * The picture depends on the feeding pause and on the speed, which no
   * master element watches: follow them here.
   */
  override _setting_hass(obj): void {
    super._setting_hass(obj);
    const activity = `${this.is_running()}|${this.speed()}`;
    if (this._activity !== null && activity !== this._activity) {
      this.to_render = true;
    }
    this._activity = activity;
  }

  // ── Foam ──────────────────────────────────────────────────────────────

  override async connectedCallback() {
    // Started before awaiting the base: RSDevice.connectedCallback() waits on
    // loadCardHelpers(), and the foam must not be held hostage to a module
    // load.
    if (!this._bubbleInterval) {
      this._bubbleInterval = setInterval(
        () => this._spawnBubbles(),
        FOAM.respawn_ms,
      );
    }
    await super.connectedCallback();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this._bubbleInterval) {
      clearInterval(this._bubbleInterval);
      this._bubbleInterval = null;
    }
  }

  /** Bubbles are redrawn after every render, so they move around. */
  override updated() {
    this._spawnBubbles();
  }

  /** Fill the cup with bubbles at random places, sizes and paces. */
  private _spawnBubbles(): void {
    const overlay = this.shadowRoot?.querySelector(".foam-overlay");
    if (!overlay) return; // absent while the pump is stopped

    overlay.querySelectorAll(".foam-bubble").forEach((b) => b.remove());

    for (let i = 0; i < FOAM.count; i++) {
      const bubble = document.createElement("div");
      bubble.className = "foam-bubble";
      const size = 2 + Math.random() * FOAM.size;
      const left = 4 + Math.random() * 88;
      const top = 8 + Math.random() * 80;
      const duration = FOAM.duration * (0.6 + Math.random() * 0.9);
      const delay = -(Math.random() * FOAM.duration * 1.5);
      bubble.style.cssText = `
        width: ${size.toFixed(1)}px;
        height: ${size.toFixed(1)}px;
        left: ${left.toFixed(1)}%;
        top: ${top.toFixed(1)}%;
        border: 1.5px solid rgba(235,225,200,0.75);
        background: rgba(235,220,190,0.15);
        animation-duration: ${duration.toFixed(2)}s;
        animation-delay: ${delay.toFixed(2)}s;
      `;
      overlay.appendChild(bubble);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────

  /**
   * Style of the scrolling bands: light translucent stripes, more opaque
   * and faster as the motor speeds up.
   * @param speed: motor speed, in %
   */
  private _water_style(speed: number): string {
    const [low, high] = WATER_SPEED_RANGE;
    const ratio = (Math.max(low, Math.min(high, speed)) - low) / (high - low);
    const alpha = 0.14 + ratio * 0.2;
    const a = (factor: number) => (alpha * factor).toFixed(2);
    return `background: repeating-linear-gradient(
        180deg,
        rgba(255,255,255,${a(0.55)}) 0px,
        rgba(255,255,255,${a(1)}) 10px,
        rgba(255,255,255,${a(0.3)}) 18px,
        rgba(255,255,255,${a(0.8)}) 24px
      );
      animation-duration: ${AMDCSkimmer.water_period(speed).toFixed(2)}s;`;
  }

  override _render(style?: any, substyle?: any): TemplateResult {
    const running = this.is_running();
    const images = this.config.state_background_imgs;
    const bg_img = running ? images.on : images.off;
    return html`<div class="device_bg">
      ${style}
      <div class="skimmer-picture" style="${substyle}">
        <img class="device_img" id="rsdevice_img" alt="" src="${bg_img}" />
        ${running
          ? html`<div class="water-overlay">
                <div
                  class="water-inner"
                  style="${this._water_style(this.speed())}"
                ></div>
              </div>
              <div class="foam-overlay"></div>`
          : nothing}
      </div>
      <div>${this._render_elements(this.is_on())}</div>
    </div>`;
  }
}
