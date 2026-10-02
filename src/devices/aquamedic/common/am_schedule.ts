/**
 * Time-slot program of an Aqua Medic pump: a graph of the day and the
 * editor it opens on a click.
 *
 * The graph spans the day (00:00 to 24:00). Each slot is a block in the
 * colour of its mode: its height is the programmed speed, a feeding pause
 * fills the height with a dashed outline, a stop is a thin bar on the base
 * line. A red cursor marks the current time. The whole graph is dimmed while
 * the timer switch is off, since the pump then ignores the program.
 *
 * The editor lists the slots; saving calls `aquamedic.set_schedule`, which
 * rewrites the whole program of the pump.
 *
 * Example mapping:
 *   schedule: { name: "sensor.schedule", type: "aquamedic-schedule",
 *               css: {...position of the graph...} }
 */
import { html, nothing, svg, SVGTemplateResult, TemplateResult } from "lit";
import { state } from "lit/decorators.js";

import { MyElement } from "../../../base/element";
import style_animations from "../../../utils/animations.styles";
import style_am_schedule from "./am_schedule.styles";
import i18n from "../../../translations/myi18n";
import type { HassConfig } from "../../../types/index";
import {
  AMProgramError,
  AMProgramRules,
  AMSlot,
  MINUTES_PER_DAY,
  MODE_FEEDING,
  MODE_STOP,
  check_program,
  clamp_slot,
  current_index,
  hhmm,
  is_running_mode,
  mode_color,
  next_slot,
  normalize_schedule,
  parse_hhmm,
  program_rules,
  service_slots,
} from "./am_program";

/** Period of the clock refresh moving the "now" cursor, in ms. */
export const AM_TICK_MS = 60_000;

/** Design space of the graph: its height and its margins. */
const GRAPH = { height: 200, top: 8, bottom: 24, side: 6 };

/**
 * Width of the design space, chosen from the ratio of the box each graph is
 * drawn in so the time labels are not stretched: the graph under the pump
 * is about 3:1, the one of the editor about 6:1.
 */
export const SMALL_GRAPH_WIDTH = 600;
export const PANEL_GRAPH_WIDTH = 1200;

export class AMSchedule extends MyElement {
  static override styles = [style_animations, style_am_schedule];

  @state() private _editing = false;
  @state() private _draft: AMSlot[] = [];
  @state() private _error: AMProgramError | null = null;

  private _signature: string | null = null;
  private _tick: ReturnType<typeof setInterval> | null = null;

  // ── Data ──────────────────────────────────────────────────────────────

  /** Whether the integration reported a program for this pump. */
  private _available(): boolean {
    const st = this.stateObj?.state;
    return st !== undefined && st !== "unavailable" && st !== "unknown";
  }

  private _slots(): AMSlot[] {
    return normalize_schedule(this.stateObj?.attributes?.schedule);
  }

  private _rules(): AMProgramRules {
    return program_rules(this.stateObj?.attributes);
  }

  private _timer_on(): boolean {
    return (this.device as any)?.timer_on?.() === true;
  }

  private _now(): number {
    return (this.device as any)?.now_minute?.() ?? 0;
  }

  // ── Hass updates ──────────────────────────────────────────────────────

  /**
   * The base setter only re-renders on a state change, and the state here is
   * a slot count: a slot moved or resized leaves it untouched. The program
   * itself and the timer switch are followed instead.
   */
  override set hass(obj: HassConfig) {
    this._hass = obj;
    if (this.stateObj) {
      const so = obj?.states?.[this.stateObj.entity_id];
      if (so && so !== this.stateObj) this.stateObj = so;
    }
    const signature = [
      this.stateObj?.state,
      JSON.stringify(this.stateObj?.attributes?.schedule ?? null),
      this._timer_on(),
    ].join("|");
    if (signature !== this._signature) {
      this._signature = signature;
      this.requestUpdate();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this._tick) {
      this._tick = setInterval(() => this.requestUpdate(), AM_TICK_MS);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._tick) {
      clearInterval(this._tick);
      this._tick = null;
    }
  }

  /**
   * The graph opens the editor on a click, which the generic action
   * machinery knows nothing about: say so in the tooltip.
   */
  override get_tooltip(): string {
    return this._available() ? i18n._("am_sched_title") : "";
  }

  // ── Graph ─────────────────────────────────────────────────────────────

  /**
   * Draw a program.
   * @param slots: the slots to draw
   * @param dimmed: whether the pump ignores the program now
   * @param width: width of the design space
   * @return the svg of the graph
   */
  private _graph(
    slots: AMSlot[],
    dimmed: boolean,
    width: number = SMALL_GRAPH_WIDTH,
  ): SVGTemplateResult {
    const plot_w = width - 2 * GRAPH.side;
    const plot_h = GRAPH.height - GRAPH.top - GRAPH.bottom;
    const base = GRAPH.top + plot_h;
    const x_of = (minute: number) =>
      GRAPH.side + (minute / MINUTES_PER_DAY) * plot_w;

    const blocks = slots.map((slot) => {
      const color = mode_color(slot.mode);
      const x = x_of(slot.start);
      const width = Math.max(x_of(slot.end) - x, 1);
      if (slot.mode === MODE_STOP) {
        return svg`<rect x=${x} y=${base - 4} width=${width} height="4"
          fill="rgb(${color})"></rect>`;
      }
      if (slot.mode === MODE_FEEDING) {
        return svg`<rect x=${x} y=${GRAPH.top} width=${width}
          height=${plot_h} fill="rgba(${color},0.25)"
          stroke="rgb(${color})" stroke-dasharray="4 3"></rect>`;
      }
      const height = Math.max((slot.value / 100) * plot_h, 2);
      return svg`<rect x=${x} y=${base - height} width=${width}
        height=${height} fill="rgba(${color},0.6)"
        stroke="rgb(${color})"></rect>`;
    });

    const ticks = [0, 6, 12, 18, 24].map((hour) => {
      const x = x_of(hour * 60);
      const anchor = hour === 0 ? "start" : hour === 24 ? "end" : "middle";
      return svg`<line class="axis" x1=${x} y1=${GRAPH.top} x2=${x}
          y2=${base + 4}></line>
        <text class="tick-label" x=${x} y=${GRAPH.height - 4}
          text-anchor=${anchor}>${String(hour).padStart(2, "0")}</text>`;
    });

    const note = dimmed
      ? i18n._("am_sched_timer_off")
      : slots.length === 0
        ? i18n._("am_sched_empty")
        : "";
    const now = x_of(this._now());

    return svg`<svg viewBox="0 0 ${width} ${GRAPH.height}"
      preserveAspectRatio="none">
      <g class=${dimmed ? "timer-off" : ""}>
        ${ticks}
        <line class="axis" x1=${GRAPH.side} y1=${base}
          x2=${width - GRAPH.side} y2=${base}></line>
        ${blocks}
        <line class="now" x1=${now} y1=${GRAPH.top} x2=${now} y2=${base}></line>
      </g>
      ${
        note
          ? svg`<text class="note" x=${width / 2} y=${GRAPH.top + 18}
              text-anchor="middle">${note}</text>`
          : nothing
      }
    </svg>`;
  }

  // ── Render ────────────────────────────────────────────────────────────

  protected override _render(_style?: string): TemplateResult {
    if (!this._available()) {
      return html`<div class="am-schedule unavailable">
        ${i18n._("am_sched_unavailable")}
      </div>`;
    }
    const style = this.stateOn ? "" : "filter:grayscale(90%)";
    return html`
      <div class="am-schedule" style="${style}" @click=${this._on_open}>
        ${this._graph(this._slots(), !this._timer_on())}
      </div>
      ${this._editing ? this._render_editor() : nothing}
    `;
  }

  // ── Editor ────────────────────────────────────────────────────────────

  /**
   * Open the editor from outside the element, e.g. on a long press on the
   * timer icon (the `open_schedule` action).
   */
  public openEditor(): void {
    if (!this._available()) return;
    this._draft = this._slots().map((slot) => ({ ...slot }));
    this._error = null;
    this._editing = true;
  }

  private _on_open = (e: Event): void => {
    e.stopPropagation();
    this.openEditor();
  };

  private _close = (): void => {
    this._editing = false;
    this._draft = [];
    this._error = null;
  };

  /**
   * Apply a change to one slot of the draft and check the result.
   * @param index: position of the slot in the draft
   * @param patch: the fields to change
   */
  private _update(index: number, patch: Partial<AMSlot>): void {
    const rules = this._rules();
    this._draft = this._draft.map((slot, i) =>
      i === index ? clamp_slot({ ...slot, ...patch }, rules) : slot,
    );
    this._error = check_program(this._draft, rules);
  }

  private _on_time(index: number, field: "start" | "end", e: Event): void {
    const minutes = parse_hhmm((e.target as HTMLInputElement).value);
    if (minutes !== null) this._update(index, { [field]: minutes });
  }

  private _on_number(
    index: number,
    field: "value" | "frequency",
    e: Event,
  ): void {
    // An emptied field reads as "", which Number() would turn into 0
    const raw = (e.target as HTMLInputElement).value;
    const value = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(value)) return;
    this._update(index, { [field]: Math.round(value) });
  }

  private _add = (): void => {
    const rules = this._rules();
    const slot = next_slot(this._draft, rules);
    if (!slot) return;
    this._draft = [...this._draft, slot];
    this._error = check_program(this._draft, rules);
  };

  private _remove(index: number): void {
    this._draft = this._draft.filter((_, i) => i !== index);
    this._error = check_program(this._draft, this._rules());
  }

  /** Write the draft to the pump, unless it breaks a rule. */
  private _save = (): void => {
    if (!this._hass || !this.stateObj) return;
    const rules = this._rules();
    this._error = check_program(this._draft, rules);
    if (this._error) return;
    this._hass.callService("aquamedic", "set_schedule", {
      entity_id: this.stateObj.entity_id,
      slots: service_slots(this._draft, rules),
    });
    this._close();
  };

  /**
   * One line of the editor.
   * @param slot: the slot
   * @param index: its position in the draft
   * @param rules: what the pump accepts
   * @param running: whether it is the slot running now
   */
  private _render_row(
    slot: AMSlot,
    index: number,
    rules: AMProgramRules,
    running: boolean,
  ): TemplateResult {
    const cls = running ? "current" : "";
    const feeding = slot.mode === MODE_FEEDING;
    const stopped = slot.mode === MODE_STOP;
    return html`
      <span class="num">${index + 1}</span>
      <input
        type="time"
        class="${cls}"
        .value=${hhmm(slot.start)}
        @change=${(e: Event) => this._on_time(index, "start", e)}
      />
      <input
        type="time"
        class="${cls}"
        .value=${hhmm(slot.end)}
        @change=${(e: Event) => this._on_time(index, "end", e)}
      />
      <select
        class="${cls}"
        @change=${(e: Event) =>
          this._update(index, { mode: (e.target as HTMLSelectElement).value })}
      >
        ${rules.modes.map(
          (mode) =>
            html`<option value=${mode} ?selected=${mode === slot.mode}>
              ${i18n._("am_mode_" + mode)}
            </option>`,
        )}
      </select>
      <input
        type="number"
        class="${cls}"
        min=${feeding ? 1 : rules.min_value}
        max=${feeding ? 60 : 100}
        ?disabled=${stopped}
        title=${feeding ? i18n._("am_sched_minutes") : "%"}
        .value=${String(slot.value)}
        @change=${(e: Event) => this._on_number(index, "value", e)}
      />
      ${rules.has_frequency
        ? html`<input
              type="number"
              class="${cls}"
              min="0"
              max="100"
              ?disabled=${!is_running_mode(slot.mode)}
              .value=${String(slot.frequency ?? 0)}
              @change=${(e: Event) => this._on_number(index, "frequency", e)}
            />
            <input
              type="checkbox"
              ?disabled=${!is_running_mode(slot.mode)}
              .checked=${slot.tide === true}
              @change=${(e: Event) =>
                this._update(index, {
                  tide: (e.target as HTMLInputElement).checked,
                })}
            />`
        : nothing}
      <button
        class="btn-icon"
        title="${i18n._("delete")}"
        @click=${() => this._remove(index)}
      >
        &#x2212;
      </button>
    `;
  }

  private _render_editor(): TemplateResult {
    const rules = this._rules();
    const running = this._timer_on()
      ? current_index(this._draft, this._now())
      : -1;
    const can_add =
      this._draft.length < rules.max_slots &&
      next_slot(this._draft, rules) !== null;
    return html`
      <div class="editor-overlay" @click=${this._close}>
        <div class="editor-panel" @click=${(e: Event) => e.stopPropagation()}>
          <div class="editor-header">
            <h3>${i18n._("am_sched_title")}</h3>
            <button class="btn-icon" @click=${this._close}>&#x2715;</button>
          </div>
          <div class="editor-graph">
            ${this._graph(this._draft, false, PANEL_GRAPH_WIDTH)}
          </div>
          <div class="editor-list">
            <div class="slots ${rules.has_frequency ? "drift" : ""}">
              <span class="gh"></span>
              <span class="gh">${i18n._("sched_from")}</span>
              <span class="gh">${i18n._("sched_to")}</span>
              <span class="gh">${i18n._("am_sched_mode")}</span>
              <span class="gh">${i18n._("am_sched_value")}</span>
              ${rules.has_frequency
                ? html`<span class="gh">${i18n._("am_sched_frequency")}</span>
                    <span class="gh">${i18n._("am_sched_tide")}</span>`
                : nothing}
              <span class="gh"></span>
              ${this._draft.map((slot, i) =>
                this._render_row(slot, i, rules, i === running),
              )}
            </div>
          </div>
          <div class="hint">${i18n._("am_sched_hint")}</div>
          <div class="error">
            ${this._error ? i18n._(this._error.key, this._error.params) : ""}
          </div>
          <div class="editor-footer">
            <button ?disabled=${!can_add} @click=${this._add}>
              ${i18n._("sched_add")}
            </button>
            <div class="editor-actions">
              <button @click=${this._close}>${i18n._("sched_cancel")}</button>
              <button
                class="btn-save"
                ?disabled=${this._error !== null}
                @click=${this._save}
              >
                ${i18n._("sched_save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
