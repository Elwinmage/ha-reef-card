/**
 * @file Flow Image element
 * @module base.flow-image
 *
 * Renders a <div> whose background-image scrolls continuously downward,
 * simulating water flowing through a return pump tube.
 *
 * - @keyframes injected once via adoptedStyleSheets — never rewritten after
 *   ResizeObserver measurement so the animation runs uninterrupted.
 * - Overrides set hass to intercept speed state updates directly and mutate
 *   animation-duration/play-state on the DOM node — no re-render, no restart.
 *
 * Note: flowKeyframeSheet is initialized lazily (on first use) so that
 * CSSStyleSheet.replaceSync is not called at module load time — this avoids
 * failures in test environments (jsdom) where the API may not be available.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { html, css } from "lit";
import { MyElement } from "./element";
import style_animations from "../utils/animations.styles";
import type { HassConfig } from "../types/index";
//----------------------------------------------------------------------------//

// Lazily initialized — created on first firstUpdated() call, not at module level
let flowKeyframeSheet: CSSStyleSheet | null = null;

function getFlowKeyframeSheet(): CSSStyleSheet {
  if (!flowKeyframeSheet) {
    flowKeyframeSheet = new CSSStyleSheet();
    flowKeyframeSheet.replaceSync(`
      @keyframes flowDown {
        from { background-position: 0 0; }
        to   { background-position: 0 169px; }
      }
    `);
  }
  return flowKeyframeSheet;
}

export class FlowImage extends MyElement {
  static override styles = [style_animations, css``];

  private static readonly TILE_W = 113;
  private static readonly TILE_H = 192;

  private _tileHeightPx: number = 0;
  private _resizeObserver: ResizeObserver | null = null;

  constructor() {
    super();
  }

  // Intercept hass updates to sync animation speed without re-rendering
  override set hass(obj: HassConfig) {
    if (!obj?.states || !this.stateObj?.entity_id) {
      super.hass = obj;
      return;
    }
    const fresh = obj.states[this.stateObj.entity_id];
    if (fresh && fresh.state !== this.stateObj.state) {
      // Speed changed — update stateObj and sync animation directly, no re-render
      this.stateObj = fresh;
      this._hass = obj;
      this._syncAnimation();
    } else {
      super.hass = obj;
    }
  }

  override firstUpdated() {
    if (this.shadowRoot) {
      const sheet = getFlowKeyframeSheet();
      this.shadowRoot.adoptedStyleSheets = [
        ...this.shadowRoot.adoptedStyleSheets,
        sheet,
      ];
    }
    this._syncAnimation();

    // Measure width once to compute exact tile height for seamless loop
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0 && this._tileHeightPx === 0) {
          this._tileHeightPx = Math.round(
            (w * FlowImage.TILE_H) / FlowImage.TILE_W,
          );
          getFlowKeyframeSheet().replaceSync(`
            @keyframes flowDown {
              from { background-position: 0 0; }
              to   { background-position: 0 ${this._tileHeightPx}px; }
            }
          `);
          this._resizeObserver?.disconnect();
          this._resizeObserver = null;
        }
      }
    });
    this._resizeObserver.observe(this);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  private _syncAnimation() {
    const div = this.shadowRoot?.querySelector(
      ".flow-div",
    ) as HTMLDivElement | null;
    if (!div) return;

    const speedRaw = parseFloat(this.stateObj?.state ?? "0");
    const speed = isNaN(speedRaw) ? 0 : Math.max(0, Math.min(100, speedRaw));

    // speed=0 → paused (pump off)
    // speed 40–100 → duration 10s–0.5s (below 40 treated as minimum)
    const minSpeed = 40;
    const maxSpeed = 100;
    const minDuration = 0.5; // speed=100 → fastest
    const maxDuration = 10; // speed=40  → slowest

    let duration: number;
    if (speed === 0) {
      duration = maxDuration;
    } else {
      const clamped = Math.max(minSpeed, Math.min(maxSpeed, speed));
      duration =
        maxDuration -
        ((clamped - minSpeed) / (maxSpeed - minSpeed)) *
          (maxDuration - minDuration);
    }

    div.style.animationDuration = `${duration.toFixed(2)}s`;
    div.style.animationPlayState = speed === 0 ? "paused" : "running";
  }

  protected override _render(_style: string = ""): any {
    const imageSrc = this.conf?.image?.toString() ?? "";

    // animation-duration and animation-play-state intentionally absent here —
    // managed exclusively by _syncAnimation() to avoid inline-style override
    const inlineStyle = [
      `background-image: url('${imageSrc}')`,
      `background-repeat: repeat-y`,
      `background-size: 100% auto`,
      `animation-name: flowDown`,
      `animation-timing-function: linear`,
      `animation-iteration-count: infinite`,
      `width: 100%`,
      `height: 100%`,
      _style,
    ]
      .filter(Boolean)
      .join("; ");

    return html`<div class="flow-div" style="${inlineStyle}"></div>`;
  }
}
