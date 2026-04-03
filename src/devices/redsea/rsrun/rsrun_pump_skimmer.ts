import { html, TemplateResult } from "lit";
import { RSPump } from "./rsrun_pump";

import { config } from "./rsrun_pump_skimmer.mapping";

import style_skimmer from "./rsrun_pump_skimmer.styles";

import { dialogs_rsrun_pump_skimmer } from "./rsrun_pump_skimmer.dialogs";

export class RSSkimmer extends RSPump {
  static override styles = [...((RSPump as any).styles ?? []), style_skimmer];

  // Foam bubble config (from calibration)
  private static readonly BUBBLE_COUNT = 5;
  private static readonly BUBBLE_SIZE = 6; // px initial max diameter
  private static readonly BUBBLE_OPACITY = 0.6;
  private static readonly BUBBLE_FILL = 0.08;
  private static readonly BUBBLE_DUR = 2.9; // seconds base duration

  private _bubbleInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_rsrun_pump_skimmer]);
  }

  override connectedCallback() {
    super.connectedCallback();
    this._bubbleInterval = setInterval(() => this._spawnBubbles(), 5000);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this._bubbleInterval) {
      clearInterval(this._bubbleInterval);
      this._bubbleInterval = null;
    }
  }

  // Generate foam bubbles inside the foam-overlay (cup/godet) after first render
  override firstUpdated() {
    this._spawnBubbles();
  }

  // Re-spawn bubbles after every re-render so position randomizes on state change
  override updated() {
    this._spawnBubbles();
  }

  private _spawnBubbles() {
    // Works for both .foam-overlay (on) and .foam-overlay--full (full-cup)
    const overlay = this.shadowRoot?.querySelector(
      ".foam-overlay, .foam-overlay--full",
    );
    if (!overlay) return; // absent when isOff → nothing to do

    overlay.querySelectorAll(".foam-bubble").forEach((b) => b.remove());

    for (let i = 0; i < RSSkimmer.BUBBLE_COUNT; i++) {
      const b = document.createElement("div");
      b.className = "foam-bubble";

      const sz = 2 + Math.random() * RSSkimmer.BUBBLE_SIZE;
      const left = 5 + Math.random() * 88;
      const top = 5 + Math.random() * 85;
      const dur = RSSkimmer.BUBBLE_DUR * (0.6 + Math.random() * 0.9);
      const delay = -(Math.random() * RSSkimmer.BUBBLE_DUR * 1.5);
      //195, 186, 166
      // 200,196,176
      b.style.cssText = `
        width: ${sz.toFixed(1)}px;
        height: ${sz.toFixed(1)}px;
        left: ${left.toFixed(1)}%;
        top: ${top.toFixed(1)}%;
        border-color: rgba(210,206,186,${RSSkimmer.BUBBLE_OPACITY});
        background: rgba(220,206,186,${RSSkimmer.BUBBLE_FILL});
        animation-duration: ${dur.toFixed(10)}s;
        animation-delay: ${delay.toFixed(10)}s;
      `;
      overlay.appendChild(b);
    }
  }

  // Compute water animation background based on speed (40–100 → fast–slow)
  private _waterBackground(isOff: boolean): string {
    if (isOff) return "none";
    const speedRaw = parseFloat(this.get_entity("speed")?.state ?? "0");
    const speed = isNaN(speedRaw) ? 0 : Math.max(40, Math.min(100, speedRaw));
    const opacity = (0.15 + ((speed - 40) / 60) * 0.2).toFixed(2);
    const spd = -0.3 * speed + 32;
    return `background: repeating-linear-gradient(
      180deg,
      rgba(200,180,255,${(+opacity * 0.7).toFixed(2)}) 0px,
      rgba(250,215,255,${opacity}) 10px,
      rgba(180,155,235,${(+opacity * 0.45).toFixed(2)}) 18px,
      rgba(220,200,255,${(+opacity * 0.85).toFixed(2)}) 24px
    );
    animation: skimmerWater ${spd}s linear infinite;`;
  }

  override _render(style?: any, substyle?: any): TemplateResult {
    const stateVal = this.get_entity("state")?.state ?? "";
    const scheduleVal = this.get_entity("schedule_enabled")?.state ?? "off";

    //mode on/off grayscale — uses is_pump_on() (device_state + schedule_enabled)
    const pumpOn = this.is_pump_on();
    const off_style = !pumpOn
      ? html`<style>
          img {
            filter: grayscale(90%);
          }
        </style>`
      : html``;

    const isOff = scheduleVal === "off" || stateVal === "off";

    let bg_img: string;
    if (isOff) {
      bg_img = this.config.state_background_imgs.off.toString();
    } else if (stateVal === "full-cup") {
      bg_img = this.config.state_background_imgs.full.toString();
    } else {
      bg_img = this.config.state_background_imgs.on.toString();
    }

    const waterBgStyle = this._waterBackground(isOff);
    const waterPlayState = isOff ? "paused" : "running";
    const isFull = stateVal === "full-cup";
    const foamClass = isFull ? "foam-overlay--full" : "foam-overlay";

    return html`
      <div>
        ${this._render_elements(pumpOn, "cables_" + this.id.toString())}
        ${this._render_elements(pumpOn, "sensor")}
        <div class="skimmer-body">
          ${off_style}
          <img class="device_img" alt="" src="${bg_img}" style="${substyle}" />
          <div
            class="water-overlay"
            style="--water-play-state: ${waterPlayState}"
          >
            <div class="water-inner" style="${waterBgStyle}"></div>
          </div>
          ${!isOff
            ? html`<div
                class="${foamClass}"
                style="--water-play-state: ${waterPlayState}"
              ></div>`
            : ""}
        </div>
        ${this._render_elements(pumpOn, "sensor_in")}
      </div>
      <div>${this._render_elements(pumpOn, "ctrl_" + this.id.toString())}</div>
    `;
  }
}
