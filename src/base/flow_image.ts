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
      @keyframes flowUp {
        from { background-position: 0 0; }
        to   { background-position: 0 -169px; }
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

  /**
   * True while the pump is actually pushing water.
   *
   * Three independent things stop it, and all of them must pause the
   * animation: the global on/off switch (`device_state`, which lives on the
   * parent RSRun, not on the pump), the pump schedule, and the speed itself.
   * @param hass: the Home Assistant object to read the states from
   * @return false as soon as one of them reports the pump stopped
   */
  private _is_running(hass: HassConfig | null | undefined): boolean {
    if (!hass?.states) return false;
    const device: any = this.device;
    const schedule = device?.entities?.["schedule_enabled"];
    if (schedule && hass.states[schedule.entity_id]?.state === "off") {
      return false;
    }
    // device_state sits on the parent for a sub-device such as an RSRUN pump,
    // and on the device itself for a top-level one such as the RSATO. Both
    // are read: whichever exists must be on.
    const masters = [
      device?.parent_entities?.["device_state"],
      device?.entities?.["device_state"],
    ];
    for (const master of masters) {
      if (master && hass.states[master.entity_id]?.state === "off") {
        return false;
      }
    }
    // Optional extra gate, named in the mapping as `running_if`.
    //
    // Speed alone is enough for a pump that reports 0 when idle, but not for
    // one whose speed is a setting rather than a measurement: the RSATO
    // reports a configured pump speed at all times and says whether water is
    // actually moving through a separate `is_pump_on` flag.
    const gate_key = this.conf?.running_if;
    if (gate_key) {
      const gate = device?.entities?.[gate_key];
      if (!gate || hass.states[gate.entity_id]?.state !== "on") {
        return false;
      }
    }
    return true;
  }

  // Intercept hass updates to sync animation speed without re-rendering
  override set hass(obj: HassConfig) {
    if (!obj?.states || !this.stateObj?.entity_id) {
      super.hass = obj;
      return;
    }
    const fresh = obj.states[this.stateObj.entity_id];
    const speed_changed = Boolean(fresh) && fresh.state !== this.stateObj.state;
    const run_changed = this._is_running(obj) !== this._is_running(this._hass);
    if (speed_changed || run_changed) {
      // Speed or run state changed — update stateObj and sync the animation
      // directly, no re-render (a re-render would restart the CSS animation)
      if (fresh) {
        this.stateObj = fresh;
      }
      this._hass = obj;
      this._syncAnimation();
    } else {
      super.hass = obj;
    }
  }

  /**
   * Re-apply the animation after every render.
   *
   * `_render()` writes the whole `style` attribute through a lit binding, so
   * each time lit commits that binding it discards what `_syncAnimation()`
   * had set imperatively -- duration, play state and opacity. The element
   * then shows a still image until the next speed change.
   *
   * It bites hardest on an element carrying a `disabled_if`, which re-renders
   * on every hass update; that is the ATO outlet, frozen the moment anything
   * else on the device moved.
   *
   * Setting inline styles here starts no new update cycle: they are DOM
   * properties, not reactive ones.
   */
  override updated(changed: Map<string, unknown>) {
    super.updated(changed);
    this._syncAnimation();
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
            @keyframes flowUp {
              from { background-position: 0 0; }
              to   { background-position: 0 -${this._tileHeightPx}px; }
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

    const minSpeed = 40;
    let speedRaw = parseFloat(this.stateObj?.state ?? "0");
    const running = this._is_running(this._hass);
    if (running && speedRaw === 0) {
      speedRaw = minSpeed;
    }
    const speed = isNaN(speedRaw) ? 0 : Math.max(0, Math.min(100, speedRaw));
    // speed=0 → paused (pump off)
    // speed 40–100 → duration 10s–0.5s (below 40 treated as minimum)

    const maxSpeed = 100;
    // How long one tile takes to scroll past, at full speed and at the
    // slowest. The defaults suit a return pump pushing hard through a tube;
    // a trickle from an ATO outlet reads better much slower, hence the
    // mapping overrides.
    const minDuration = this.conf?.min_duration ?? 0.5; // speed=100 → fastest
    const maxDuration = this.conf?.max_duration ?? 10; // speed=40  → slowest

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

    const stopped = speed === 0 || !running;
    div.style.animationDuration = `${duration.toFixed(2)}s`;
    div.style.animationPlayState = stopped ? "paused" : "running";

    // Pausing alone leaves the water texture on screen, frozen. That is right
    // for a tube, which stays full when the pump stops, and wrong for an
    // outlet, where a stopped pump means no water at all -- hence the opt-in.
    if (this.conf?.hide_when_stopped) {
      div.style.opacity = stopped ? "0" : "1";
    }
  }

  protected override _render(_style: string = ""): any {
    const imageSrc = this.conf?.image?.toString() ?? "";

    // animation-duration and animation-play-state intentionally absent here —
    // managed exclusively by _syncAnimation() to avoid inline-style override
    const inlineStyle = [
      `background-image: url('${imageSrc}')`,
      `background-repeat: repeat-y`,
      `background-size: 100% auto`,
      `animation-name: flowUp`,
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
