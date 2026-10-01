/**
 * ReefWave speed: a progress ring drawn on the end cap of the pump.
 *
 * A plain progress circle shows the state of one entity. The speed of a
 * wave pump is not one entity: it is the forward intensity of the current
 * wave, of the preview settings while previewing, and 0 whenever the pump
 * does not run (off, feeding, maintenance, no wave). The device computes
 * it (RSWave.speed()); this element only draws it, out of 100 %.
 *
 * The end cap is seen in perspective: the ring is an ellipse fitted on it
 * (tilted, flattened), drawn in the full-canvas design space (see
 * RSWAVE_CANVAS), filling clockwise from its top. Inside, along the axis of
 * the pump, arrows give the direction of the flow: → above the speed for a
 * forward wave, ← under it for a reverse one, both for an alternate one.
 *
 * A click on the cap opens the settings of this pump in the current wave
 * (direction, forward and reverse intensities), as the ReefBeat app lets
 * each pump of a group run the wave its own way.
 *
 * The element stays bound to the current forward intensity sensor, so the
 * tooltip still points at a real entity.
 *
 * Example mapping:
 *   speed: { name: "sensor.wave_forward_intensity", type: "rswave-speed",
 *            target: 100, geometry: { cx: 610, cy: 372, rx: 28, ry: 55 },
 *            css: {...full canvas...} }
 */
import { css, CSSResult, html, nothing, svg, TemplateResult } from "lit";
import { state } from "lit/decorators.js";

import type { HassConfig } from "../../../types/index";

import { ProgressCircle } from "../../../base/progress_circle";
import { OFF_COLOR } from "../../../utils/constants";
import { RSWAVE_CANVAS } from "./rswave_element";
import { style_rswave_overlay, style_rswave_schedule } from "./rswave.styles";
import { WaveInterval, current_index } from "./rswave_program";
import { ask } from "./rswave_api";
import { direction_label, type_cell } from "./rswave_schedule";
import i18n from "../../../translations/myi18n";

/** Ring fitted on the end cap of the picture, in design-space pixels. */
export const SPEED_DEFAULTS = {
  /** Centre of the cap */
  cx: 610.5,
  cy: 372.5,
  /** Half axes of the ring (the cap minus a margin) */
  rx: 28,
  ry: 55,
  /** Tilt of the cap, degrees */
  angle: 19,
  /** Ring thickness */
  width: 10,
  font_size: 16,
  /** Colour of the filled part, "r,g,b" */
  color: "255,0,0",
  /** Distance of the arrows from the centre, share of ry */
  arrow_offset: 0.56,
};

/** An arrow pointing forward (+x), centred on 0,0. */
const ARROW = "M -8 0 H 7 M 2 -4.5 L 7.5 0 L 2 4.5";

/** Glyphs of the directions on the buttons of the settings. */
export const DIRECTION_GLYPHS: Record<string, string> = {
  fw: "→",
  rw: "←",
  alt: "⇄",
};

export class RSWaveSpeed extends ProgressCircle {
  static override styles = [
    ...(ProgressCircle.styles as CSSResult[]),
    style_rswave_schedule,
    style_rswave_overlay,
    css`
      .speed_text {
        font-weight: 700;
      }
      /* The cap takes clicks, the rest of the canvas does not */
      .speed_click {
        pointer-events: all;
        cursor: pointer;
      }
      .dir_buttons {
        display: flex;
        gap: 8px;
      }
      .dir_buttons button {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        background: none;
        color: inherit;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        border-radius: 8px;
        padding: 6px;
      }
      .dir_buttons button.selected {
        border-color: #ec2330;
        background: rgba(236, 35, 48, 0.08);
      }
      .dir_buttons .glyph {
        font-size: 22px;
        line-height: 1;
        color: #ec2330;
      }
      .pump_field {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 2px 10px;
        font-size: 12px;
      }
      .pump_field input[type="range"] {
        grid-column: 1 / -1;
        width: 100%;
        padding: 0;
      }
      .panel.small {
        width: min(94vw, 420px);
      }
    `,
  ];

  private _lastSpeed: number | null = null;

  /** Settings open */
  @state() protected _open = false;
  @state() protected _dir = "fw";
  @state() protected _fti = 0;
  @state() protected _rti = 0;
  @state() protected _busy = false;
  @state() protected _error = "";

  protected geometry(): typeof SPEED_DEFAULTS {
    return { ...SPEED_DEFAULTS, ...((this.conf as any)?.geometry ?? {}) };
  }

  /** Speed of the pump, from the device. */
  protected override getValue(): number {
    return Number((this.device as any)?.speed?.() ?? 0) || 0;
  }

  /** The target is the full scale (100 %): no entity needed. */
  protected override hasTargetState(): boolean {
    return true;
  }

  /** Re-render when the speed or the direction changes. */
  override set hass(obj: HassConfig) {
    super.hass = obj;
    const sig =
      this.getValue() * 10 + ["", "fw", "rw", "alt"].indexOf(this.flow());
    if (sig !== this._lastSpeed) {
      this._lastSpeed = sig;
      this.requestUpdate();
    }
  }

  /** Direction of the flow now ("" when stopped). */
  protected flow(): string {
    return String((this.device as any)?.direction?.() ?? "");
  }

  /** The slot of the program running now, null without program. */
  protected current(): WaveInterval | null {
    const dev: any = this.device;
    const intervals: WaveInterval[] = dev?.schedule?.() ?? [];
    const index = current_index(intervals, dev?.now_minute?.() ?? 0);
    return index < 0 ? null : intervals[index];
  }

  /** Open the settings of this pump in the current wave. */
  public openSettings(e?: Event): void {
    e?.stopPropagation();
    const it = this.current();
    this._dir = it?.direction ?? "fw";
    this._fti = it?.fti ?? 0;
    this._rti = it?.rti ?? 0;
    this._error = "";
    this._busy = false;
    this._open = true;
  }

  public closeSettings(): void {
    this._open = false;
  }

  protected _onOverlayClick(e: Event): void {
    e.stopPropagation();
    if (e.target === e.currentTarget) this.closeSettings();
  }

  /** Write the settings of this pump, then close. */
  async save(): Promise<void> {
    this._busy = true;
    this._error = "";
    const res = await ask(this.device, "wave_pump_set", {
      direction: this._dir,
      fti: Number(this._fti),
      rti: Number(this._rti),
    });
    this._busy = false;
    if (res.ok) {
      this.closeSettings();
    } else {
      this._error = res.error as string;
    }
  }

  /**
   * Arrows of the flow, in the cap's frame.
   * @param g: the geometry
   * @param rgb: their colour
   */
  protected arrows(g: typeof SPEED_DEFAULTS, rgb: string) {
    const dir = this.flow();
    const dy = g.ry * g.arrow_offset;
    const draw = (y: number, sx: number, cls: string) =>
      svg`<path class="${cls}" d="${ARROW}" transform="translate(0 ${y}) scale(${sx} 1)"
        fill="none" stroke="rgb(${rgb})" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round"></path>`;
    return [
      dir === "fw" || dir === "alt" ? draw(-dy, 1, "arrow_fw") : nothing,
      dir === "rw" || dir === "alt" ? draw(dy, -1, "arrow_rw") : nothing,
    ];
  }

  protected renderSettings(): TemplateResult {
    const it = this.current();
    const field = (key: "_fti" | "_rti", label: string, disabled: boolean) =>
      html`<label class="pump_field">
        <span>${i18n._(label)}</span>
        <span class="num">${this[key]} %</span>
        <input
          type="range"
          class="${key}"
          min="0"
          max="100"
          step="5"
          .value=${String(this[key])}
          ?disabled=${disabled}
          @input=${(e: Event) =>
            (this[key] = Number((e.target as HTMLInputElement).value))}
        />
      </label>`;
    const moving = it !== null && it.type !== "nw";
    return html`<div class="overlay" @click=${this._onOverlayClick}>
      <div class="panel small" @click=${(e: Event) => e.stopPropagation()}>
        <div class="panel_header">
          <h3>
            ${i18n._("wave_current")} ·
            ${(this.device as any)?.display_name?.() ?? ""}
          </h3>
          <button class="btn_close" @click=${() => this.closeSettings()}>
            &#x2715;
          </button>
        </div>
        ${it
          ? html`<p class="current_wave">
              ${type_cell(it.type)} <strong>${it.name}</strong>
            </p>`
          : html`<p class="note">${i18n._("wave_no_program")}</p>`}
        ${moving
          ? html`<div class="dir_buttons">
                ${["fw", "rw", "alt"].map(
                  (d) =>
                    html`<button
                      class="dir_${d} ${d === this._dir ? "selected" : ""}"
                      @click=${() => (this._dir = d)}
                    >
                      <span class="glyph">${DIRECTION_GLYPHS[d]}</span>
                      <span>${direction_label(d)}</span>
                    </button>`,
                )}
              </div>
              ${field("_fti", "wave_field_fti", this._dir === "rw")}
              ${field("_rti", "wave_field_rti", this._dir === "fw")}
              <p class="hint">${i18n._("wave_pump_note")}</p>`
          : nothing}
        ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
        <div class="panel_footer">
          <button class="btn_cancel" @click=${() => this.closeSettings()}>
            ${i18n._("wave_cancel")}
          </button>
          <button
            class="btn_save"
            ?disabled=${this._busy || !moving}
            @click=${() => this.save()}
          >
            ${this._busy ? i18n._("wave_saving") : i18n._("wave_save")}
          </button>
        </div>
      </div>
    </div>`;
  }

  protected override _render(_style?: string): TemplateResult {
    const g = this.geometry();
    const on = this.groupOn ?? (this.device as any)?.is_on?.() ?? true;
    const rgb = on ? g.color : OFF_COLOR;
    const percent = Math.max(0, Math.min(100, Math.round(this.getValue())));
    // Clockwise from the top: two half arcs, measured in % via pathLength
    const ring = `M 0 ${-g.ry} A ${g.rx} ${g.ry} 0 1 1 0 ${g.ry} A ${g.rx} ${g.ry} 0 1 1 0 ${-g.ry}`;
    return html`<svg
        class="rswave_canvas"
        viewBox="0 0 ${RSWAVE_CANVAS.width} ${RSWAVE_CANVAS.height}"
        preserveAspectRatio="xMidYMid meet"
      >
        <g class="speed_click" @click=${(e: Event) => this.openSettings(e)}>
          <title>${i18n._("wave_current")}</title>
          <g transform="translate(${g.cx} ${g.cy}) rotate(${g.angle})">
            <ellipse
              class="speed_hit"
              rx="${g.rx + g.width / 2}"
              ry="${g.ry + g.width / 2}"
              fill="transparent"
            ></ellipse>
            <path
              class="speed_track"
              d="${ring}"
              fill="none"
              stroke="rgba(150,150,150,0.6)"
              stroke-width="${g.width}"
            ></path>
            <path
              class="speed_value"
              d="${ring}"
              pathLength="100"
              fill="none"
              stroke="rgb(${rgb})"
              stroke-width="${g.width}"
              stroke-linecap="${percent > 0 ? "round" : "butt"}"
              stroke-dasharray="${percent} 100"
            ></path>
            ${this.arrows(g, rgb)}
          </g>
          <text
            class="speed_text"
            x="${g.cx}"
            y="${g.cy}"
            font-size="${g.font_size}"
            fill="rgb(${rgb})"
            text-anchor="middle"
            dominant-baseline="central"
          >
            ${percent}%
          </text>
        </g>
      </svg>
      ${this._open ? this.renderSettings() : nothing}`;
  }
}
