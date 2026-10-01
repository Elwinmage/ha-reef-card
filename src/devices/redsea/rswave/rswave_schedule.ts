/**
 * ReefWave day program: a graph of the day under the pump, and the program
 * view it opens on a click.
 *
 * The graph spans the day (00:00 to 24:00). Each interval of the program is
 * a block in the colour of its wave type: the forward intensity rises above
 * the middle line, the reverse intensity drops under it, so the direction
 * reads at a glance (forward, reverse, or both for an alternate wave). A
 * "no wave" interval is a dashed line on the middle. A red cursor marks the
 * current time.
 *
 * The program view lists every interval with its settings, the running one
 * highlighted, under a larger copy of the graph.
 *
 * Example mapping:
 *   schedule: { name: "schedule", type: "rswave-schedule", stateObj: null,
 *               css: {...position of the graph...} }
 */
import { html, nothing, svg, SVGTemplateResult, TemplateResult } from "lit";
import { state } from "lit/decorators.js";

import { RSWaveElement } from "./rswave_element";
import { style_rswave_schedule } from "./rswave.styles";
import {
  DraftSlot,
  MINUTES_PER_DAY,
  WAVE_TYPES,
  WaveInterval,
  check_draft,
  current_index,
  draft_intervals,
  hhmm,
  next_slot,
  normalize_schedule,
  parse_hhmm,
  slots_of,
  type_color,
} from "./rswave_program";
import { LibraryWave, WaveLibrary, ask, fetch_library } from "./rswave_api";
import { type_icon } from "./rswave_icons";
import i18n from "../../../translations/myi18n";

/** Size and decorations of a graph. */
export interface GraphOptions {
  /** viewBox size: the ratio of the box the graph is drawn in */
  width: number;
  height: number;
  /** Hours between two time ticks */
  tick_hours: number;
  /** Title over the graph */
  title?: string;
}

/** Graph under the pump: the ratio of its place on the picture. */
export const SMALL_GRAPH: GraphOptions = {
  width: 563,
  height: 301,
  tick_hours: 6,
};

/** Graph of the program view. */
export const PANEL_GRAPH: GraphOptions = {
  width: 680,
  height: 230,
  tick_hours: 3,
};

/** Margins of the plot inside the graph: the bottom holds ticks + legend. */
const PAD = { left: 34, right: 8, top: 24, bottom: 42 };

/** Legend row: swatch size, gap after a swatch, gap between two items. */
const LEGEND = { swatch: 16, text_gap: 3, item_gap: 14, char: 6.2 };

/**
 * Wave types used by a program, in the order the app lists them.
 * @param intervals: the normalised program
 */
export function used_types(intervals: WaveInterval[]): string[] {
  const used = new Set(intervals.map((it) => it.type));
  const known = WAVE_TYPES.filter((t) => used.has(t)) as string[];
  // Types the app does not know yet come last, as found
  const other = [...used].filter((t) => !known.includes(t));
  return [...known, ...other];
}

/**
 * Legend of the wave types used by a program: a row of type pictograms, in
 * the colour of their type, and names,
 * names, centred under the plot.
 * @param intervals: the normalised program
 * @param cx: centre of the row
 * @param y: baseline of the row
 */
export function legend(
  intervals: WaveInterval[],
  cx: number,
  y: number,
): SVGTemplateResult[] {
  const items = used_types(intervals).map((type) => {
    const label = type_label(type);
    const width = LEGEND.swatch + LEGEND.text_gap + label.length * LEGEND.char;
    return { type, label, width };
  });
  const total =
    items.reduce((sum, it) => sum + it.width, 0) +
    LEGEND.item_gap * Math.max(0, items.length - 1);
  let x = cx - total / 2;
  return items.map((it) => {
    const x0 = x;
    x += it.width + LEGEND.item_gap;
    const rgb = type_color(it.type);
    return svg`<g class="legend_item">
      <path class="legend_icon" d="${type_icon(it.type)}" fill="rgb(${rgb})"
        transform="translate(${x0} ${y - LEGEND.swatch + 3}) scale(${LEGEND.swatch / 24})"></path>
      <text class="legend" x="${x0 + LEGEND.swatch + LEGEND.text_gap}"
        y="${y}">${it.label}</text>
    </g>`;
  });
}

/**
 * Translated name of a wave type.
 * @param type: nw, ra, re, st, su, un
 */
export function type_label(type: string): string {
  return i18n._("wave_type_" + type);
}

/**
 * Translated name of a direction.
 * @param direction: fw, rw, alt
 */
export function direction_label(direction: string): string {
  return i18n._("wave_dir_" + direction);
}

/**
 * Graph of a day program, as SVG fragments for a viewBox of the given size.
 * @param intervals: the normalised program
 * @param now: current minute of the day
 * @param opts: size and decorations
 */
export function program_graph(
  intervals: WaveInterval[],
  now: number,
  opts: GraphOptions,
): SVGTemplateResult {
  const { width: W, height: H } = opts;
  const L = PAD.left;
  const R = W - PAD.right;
  const T = PAD.top;
  const B = H - PAD.bottom;
  const mid = (T + B) / 2;
  const half = (B - T) / 2;
  const x_of = (minute: number) => L + ((R - L) * minute) / MINUTES_PER_DAY;

  const ticks: SVGTemplateResult[] = [];
  for (let h = 0; h <= 24; h += opts.tick_hours) {
    const x = x_of(h * 60);
    ticks.push(svg`<line class="grid" x1="${x}" y1="${T}" x2="${x}" y2="${B}"></line>
      <text class="tick" x="${x}" y="${B + 13}" text-anchor="middle">${String(h).padStart(2, "0")}h</text>`);
  }

  const blocks = intervals.map((it) => {
    const x = x_of(it.start);
    const w = x_of(it.end) - x;
    const rgb = type_color(it.type);
    const parts: SVGTemplateResult[] = [];
    if (it.type === "nw") {
      parts.push(svg`<line class="no_wave" x1="${x}" y1="${mid}" x2="${x + w}" y2="${mid}"
        stroke="rgb(${rgb})"></line>`);
    } else {
      if (it.direction !== "rw") {
        const h = (half * it.fti) / 100;
        parts.push(svg`<rect class="wave_fw" x="${x}" y="${mid - h}" width="${w}" height="${h}"
          fill="rgba(${rgb},0.45)" stroke="rgb(${rgb})" stroke-width="1"></rect>`);
      }
      if (it.direction !== "fw") {
        const h = (half * it.rti) / 100;
        parts.push(svg`<rect class="wave_rw" x="${x}" y="${mid}" width="${w}" height="${h}"
          fill="rgba(${rgb},0.3)" stroke="rgb(${rgb})" stroke-width="1"></rect>`);
      }
    }
    return svg`<g class="wave_block"><title>${hhmm(it.start)}–${hhmm(it.end)} ${it.name} (${type_label(it.type)})</title>${parts}</g>`;
  });

  const xn = x_of(now);
  const title = opts.title
    ? svg`<text class="title" x="${L}" y="14">${opts.title}</text>`
    : nothing;
  const empty = intervals.length
    ? nothing
    : svg`<text class="empty" x="${(L + R) / 2}" y="${mid}" text-anchor="middle"
        dominant-baseline="central">${i18n._("wave_no_program")}</text>`;

  return svg`
    ${title}
    <rect class="frame" x="${L}" y="${T}" width="${R - L}" height="${B - T}" rx="4"></rect>
    ${ticks}
    <line class="grid" x1="${L}" y1="${T + half / 2}" x2="${R}" y2="${T + half / 2}"></line>
    <line class="grid" x1="${L}" y1="${B - half / 2}" x2="${R}" y2="${B - half / 2}"></line>
    <text class="scale" x="${L - 4}" y="${T + 4}" text-anchor="end">100</text>
    <text class="scale" x="${L - 4}" y="${mid + 4}" text-anchor="end">0</text>
    <text class="scale" x="${L - 4}" y="${B}" text-anchor="end">100</text>
    ${blocks}
    <line class="axis" x1="${L}" y1="${mid}" x2="${R}" y2="${mid}"></line>
    ${empty}
    ${legend(intervals, (L + R) / 2, H - 6)}
    ${
      intervals.length
        ? svg`<line class="now_line" x1="${xn}" y1="${T}" x2="${xn}" y2="${B}"></line>
          <circle class="now_dot" cx="${xn}" cy="${T}" r="4"></circle>`
        : nothing
    }
  `;
}

/**
 * Pictogram and name of a wave type, for the tables of the editors.
 * @param type: the wave type
 */
export function type_cell(type: string): TemplateResult {
  return html`<svg class="chip" viewBox="0 0 24 24" aria-hidden="true">
      <path d="${type_icon(type)}" fill="rgb(${type_color(type)})"></path></svg
    >${type_label(type)}`;
}

/**
 * Replace the {placeholders} of a translated text.
 * @param key: translation key
 * @param values: placeholder values
 */
export function tr(key: string, values: Record<string, string> = {}): string {
  let text = i18n._(key);
  for (const [k, v] of Object.entries(values)) {
    text = text.replaceAll(`{${k}}`, v);
  }
  return text;
}

/**
 * Order of a group with a pump moved.
 * @param hwids: the current order
 * @param from: the pump moved
 * @param to: where it goes (index)
 */
export function moved(hwids: string[], from: string, to: number): string[] {
  const rest = hwids.filter((h) => h !== from);
  const at = Math.max(0, Math.min(rest.length, to));
  return [...rest.slice(0, at), from, ...rest.slice(at)];
}

export class RSWaveSchedule extends RSWaveElement {
  static override styles = style_rswave_schedule;

  /** Program editor open */
  @state() protected _open = false;
  /** Program being edited */
  @state() protected _slots: DraftSlot[] = [];
  /** Library of the pump, null until read */
  @state() protected _library: WaveLibrary | null = null;
  /** Message of the last refusal (reading, saving) */
  @state() protected _error = "";
  /** A call is running */
  @state() protected _busy = false;
  /** Wave shown in the wave zone under the table */
  @state() protected _focus = "";
  /** The pump's own program (GPS weather on) is still to be taken */
  protected _take_base = false;
  /** Pump of the group being dragged, pump hovered by the drag */
  @state() protected _drag = "";
  @state() protected _over = "";

  /** Re-render when the program, the current wave or the state changes. */
  protected override signature(): string {
    const program = this.wave?.get_entity?.("sensor.wave_type");
    return `${JSON.stringify(program?.attributes?.schedule ?? null)}|${
      this.wave?.state_signature?.() ?? ""
    }|${this.gps()}`;
  }

  // check-entities: uses wave_weather

  /** Whether the speeds follow the GPS weather. */
  gps(): boolean {
    return this.wave?.get_entity?.("switch.wave_weather")?.state === "on";
  }

  /**
   * Open the program editor, from the pump's current program. Public, so a
   * hold action elsewhere on the pump can open it too (redsea_ui
   * open_schedule).
   */
  public openEditor(): void {
    this._slots = slots_of(this.program().intervals);
    const cur = current_index(this.program().intervals, this.program().now);
    this._focus = cur < 0 ? "" : this._slots[cur].wave_uid;
    this._library = null;
    this._error = "";
    this._busy = false;
    this._open = true;
    this._take_base = true;
    void this.load_library();
  }

  /** Close the editor, the draft dropped. */
  public closeEditor(): void {
    this._open = false;
  }

  /** Read the waves the pump can use. */
  async load_library(): Promise<void> {
    const res = await fetch_library(this.wave);
    if (res.ok) {
      this._library = res.value as WaveLibrary;
      this.take_base();
    } else {
      this._error = res.error as string;
    }
  }

  /**
   * GPS weather on: the pump runs the weather's program, made from its own
   * one (the base), which is the one edited here. Taken once per opening.
   */
  protected take_base(): void {
    const weather = this._library?.weather;
    if (!this._take_base || weather?.settings?.enabled !== true) return;
    this._take_base = false;
    const base = normalize_schedule(weather.base);
    if (base.length) this._slots = slots_of(base);
  }

  /** The GPS weather saved: the program is read again. */
  protected async on_weather_saved(e: Event): Promise<void> {
    e.stopPropagation();
    this._take_base = true;
    await this.load_library();
  }

  private _onClick(e: Event): void {
    e.stopPropagation();
    this.openEditor();
  }

  private _onOverlayClick(e: Event): void {
    e.stopPropagation();
    if (e.target === e.currentTarget) this.closeEditor();
  }

  private _onClose(e: Event): void {
    e.stopPropagation();
    this.closeEditor();
  }

  /** Program and current minute, read once per render. */
  protected program(): { intervals: WaveInterval[]; now: number } {
    return {
      intervals: this.wave?.schedule?.() ?? [],
      now: this.wave?.now_minute?.() ?? 0,
    };
  }

  /** Waves offered in the editor. */
  protected waves(): LibraryWave[] {
    return this._library?.waves ?? [];
  }

  // ── Draft edits ─────────────────────────────────────────────────────

  /** Replace a slot, keeping the draft sorted by start. */
  protected set_slot(index: number, patch: Partial<DraftSlot>): void {
    const slots = this._slots.map((s, i) =>
      i === index ? { ...s, ...patch } : s,
    );
    slots.sort((a, b) => a.st - b.st);
    this._slots = slots;
    this._error = "";
  }

  protected on_start(index: number, e: Event): void {
    const st = parse_hhmm((e.target as HTMLInputElement).value);
    if (st === null || st === 0) {
      // Midnight belongs to the first slot: put the old value back
      this.requestUpdate();
      return;
    }
    this.set_slot(index, { st });
  }

  protected on_wave(index: number, e: Event): void {
    const uid = (e.target as HTMLSelectElement).value;
    const wave = this.waves().find((w) => w.uid === uid);
    // No wave only runs forward
    const patch: Partial<DraftSlot> = { wave_uid: uid };
    if (wave?.type === "nw") patch.direction = "fw";
    this.set_slot(index, patch);
    this._focus = uid;
  }

  protected on_direction(index: number, e: Event): void {
    this.set_slot(index, { direction: (e.target as HTMLSelectElement).value });
  }

  protected add_slot(): void {
    const slot = next_slot(this._slots);
    if (slot) {
      this._slots = [...this._slots, slot].sort((a, b) => a.st - b.st);
    }
  }

  protected remove_slot(index: number): void {
    if (index === 0) return;
    this._slots = this._slots.filter((_s, i) => i !== index);
  }

  /** The wave zone changed the library: read it again, draft kept. */
  protected async on_library_changed(e: Event): Promise<void> {
    e.stopPropagation();
    await this.load_library();
  }

  // ── Group ───────────────────────────────────────────────────────────

  /**
   * Group the pump with its aquarium's other ReefWaves, or ungroup it; the
   * library (and its group) is read again.
   * @param grouped: the new state
   */
  async set_grouped(grouped: boolean): Promise<void> {
    this._busy = true;
    this._error = "";
    const res = await ask(this.wave, "wave_group_set", { grouped });
    if (res.ok) {
      await this.load_library();
    } else {
      this._error = res.error as string;
    }
    this._busy = false;
  }

  /**
   * Write a new order of the group, then read the library again.
   * @param hwids: every pump, in the new order
   */
  async reorder(hwids: string[]): Promise<void> {
    const current = (this._library?.group ?? []).map((p) => p.hwid);
    if (hwids.join("|") === current.join("|")) return;
    this._busy = true;
    this._error = "";
    const res = await ask(this.wave, "wave_group_order", { hwids });
    if (res.ok) {
      await this.load_library();
    } else {
      this._error = res.error as string;
    }
    this._busy = false;
  }

  /** Move a pump of the group one place left (-1) or right (+1). */
  protected step(hwid: string, delta: number): void {
    const hwids = (this._library?.group ?? []).map((p) => p.hwid);
    void this.reorder(moved(hwids, hwid, hwids.indexOf(hwid) + delta));
  }

  /** A pump dropped onto another: it takes its place. */
  protected drop(target: string): void {
    const from = this._drag;
    this._drag = "";
    this._over = "";
    if (!from || from === target) return;
    const hwids = (this._library?.group ?? []).map((p) => p.hwid);
    void this.reorder(moved(hwids, from, hwids.indexOf(target)));
  }

  /** Write the draft (to the whole group), then close the editor. */
  async save(): Promise<void> {
    const problem = check_draft(this._slots, this.waves());
    if (problem) {
      this._error = i18n._(problem);
      return;
    }
    this._busy = true;
    this._error = "";
    const res = await ask(this.wave, "wave_program_save", {
      slots: this._slots.map((s) => ({ ...s })),
    });
    this._busy = false;
    if (res.ok) {
      this.closeEditor();
    } else {
      this._error = res.error as string;
    }
  }

  // ── Render ──────────────────────────────────────────────────────────

  /** Notes over the table: local mode, group, pumps missing. */
  protected notes(): TemplateResult[] {
    const lib = this._library;
    if (!lib) return [];
    const notes: TemplateResult[] = [];
    if (!lib.linked) {
      notes.push(html`<p class="note">${i18n._("wave_local_only")}</p>`);
    }
    if (lib.weather?.settings?.enabled === true) {
      notes.push(html`<p class="note gps">${i18n._("wave_weather_base")}</p>`);
    }
    if (lib.group.length > 1) {
      notes.push(
        html`<p class="note">
          ${tr("wave_group_note", {
            pumps: lib.group.map((p) => p.name).join(", "),
          })}
        </p>`,
      );
    }
    if (lib.linked) notes.push(this.group_tools(lib));
    const missing = this.missing();
    if (missing.length) {
      notes.push(
        html`<p class="note warn">
          ${tr("wave_group_missing", { pumps: missing.join(", ") })}
        </p>`,
      );
    }
    return notes;
  }

  /**
   * Group / Ungroup button of the pump and, for a group, the order of its
   * pumps: drag a pump onto another, or use its ‹ › arrows.
   * @param lib: the library read
   */
  protected group_tools(lib: WaveLibrary): TemplateResult {
    const grouped = lib.grouped === true;
    const group = lib.group;
    const order =
      grouped && group.length > 1
        ? html`<div class="order">
            <span>${i18n._("wave_group_order")}</span>
            ${group.map((pump, index) => {
              const cls = [
                "order_pump",
                pump.hwid === lib.hwid ? "current" : "",
                this._drag === pump.hwid ? "dragging" : "",
                this._over === pump.hwid && this._drag !== pump.hwid
                  ? "drop"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");
              return html`<span
                class="${cls}"
                draggable="true"
                @dragstart=${(ev: DragEvent) => {
                  this._drag = pump.hwid;
                  ev.dataTransfer?.setData("text/plain", pump.hwid);
                }}
                @dragover=${(ev: DragEvent) => {
                  ev.preventDefault();
                  this._over = pump.hwid;
                }}
                @dragleave=${() => (this._over = "")}
                @dragend=${() => {
                  this._drag = "";
                  this._over = "";
                }}
                @drop=${(ev: DragEvent) => {
                  ev.preventDefault();
                  this.drop(pump.hwid);
                }}
              >
                <button
                  class="move left"
                  title="${i18n._("wave_move_left")}"
                  ?disabled=${this._busy || index === 0}
                  @click=${() => this.step(pump.hwid, -1)}
                >
                  ‹
                </button>
                <span class="index">${index + 1}.</span>${pump.name}
                <button
                  class="move right"
                  title="${i18n._("wave_move_right")}"
                  ?disabled=${this._busy || index === group.length - 1}
                  @click=${() => this.step(pump.hwid, 1)}
                >
                  ›
                </button>
              </span>`;
            })}
          </div>`
        : nothing;
    return html`<div class="group_tools">
      <button
        class="btn_group ${grouped ? "ungroup" : "group"}"
        ?disabled=${this._busy}
        @click=${() => this.set_grouped(!grouped)}
      >
        ${i18n._(grouped ? "wave_ungroup" : "wave_group")}
      </button>
      ${order}
    </div>`;
  }

  /** Pumps of the group blocking a save. */
  protected missing(): string[] {
    return (this._library?.group ?? [])
      .filter((p) => p.in_service && !p.available)
      .map((p) => p.name);
  }

  /**
   * Row of the editor for one slot.
   * @param slot: the slot
   * @param index: its place in the draft
   * @param end: its end (next start)
   * @param current: whether it runs now
   */
  protected row(
    slot: DraftSlot,
    index: number,
    end: number,
    current: boolean,
  ): TemplateResult {
    const waves = this.waves();
    const wave = waves.find((w) => w.uid === slot.wave_uid);
    const moving = wave !== undefined && wave.type !== "nw";
    return html`<tr class="${current ? "current" : ""}">
      <td>
        <input
          type="time"
          class="start"
          .value=${hhmm(slot.st)}
          ?disabled=${index === 0}
          @change=${(e: Event) => this.on_start(index, e)}
        />
      </td>
      <td class="end">${hhmm(end)}</td>
      <td>
        <select class="wave" @change=${(e: Event) => this.on_wave(index, e)}>
          ${wave
            ? nothing
            : html`<option value="${slot.wave_uid}" selected>
                ${i18n._("wave_unknown")}
              </option>`}
          ${waves.map(
            (w) =>
              html`<option
                value="${w.uid}"
                ?selected=${w.uid === slot.wave_uid}
              >
                ${w.name}
              </option>`,
          )}
        </select>
      </td>
      <td>${wave ? type_cell(wave.type) : "–"}</td>
      <td>
        <select
          class="direction"
          ?disabled=${!moving}
          @change=${(e: Event) => this.on_direction(index, e)}
        >
          ${["fw", "rw", "alt"].map(
            (d) =>
              html`<option value="${d}" ?selected=${d === slot.direction}>
                ${direction_label(d)}
              </option>`,
          )}
        </select>
      </td>
      <td class="num">${moving ? `${wave!.fti} %` : "–"}</td>
      <td class="num">${moving ? `${wave!.rti} %` : "–"}</td>
      <td class="actions">
        <button
          class="btn_icon edit ${slot.wave_uid === this._focus
            ? "focused"
            : ""}"
          title="${i18n._("wave_edit")}"
          @click=${() => (this._focus = slot.wave_uid)}
        >
          &#x270E;
        </button>
        <button
          class="btn_icon remove"
          title="${i18n._("wave_remove_slot")}"
          ?disabled=${index === 0}
          @click=${() => this.remove_slot(index)}
        >
          &#x2212;
        </button>
      </td>
    </tr>`;
  }

  protected renderPanel(now: number): TemplateResult {
    const slots = this._slots;
    const waves = this.waves();
    const preview = draft_intervals(slots, waves);
    const cur = current_index(preview, now);
    const loading = this._library === null && !this._error;
    const blocked = this._busy || loading || this.missing().length > 0;
    return html`<div class="overlay" @click=${this._onOverlayClick}>
      <div class="panel" @click=${(e: Event) => e.stopPropagation()}>
        <div class="panel_header">
          <h3>
            ${i18n._("wave_program")} · ${this.wave?.display_name?.() ?? ""}
          </h3>
          <button class="btn_close" @click=${this._onClose}>&#x2715;</button>
        </div>
        <div class="panel_graph">
          <svg
            class="graph"
            viewBox="0 0 ${PANEL_GRAPH.width} ${PANEL_GRAPH.height}"
            preserveAspectRatio="xMidYMid meet"
          >
            ${program_graph(preview, now, PANEL_GRAPH)}
          </svg>
        </div>
        ${this.notes()}
        <div class="panel_table">
          ${loading
            ? html`<p class="note">${i18n._("wave_loading")}</p>`
            : html`<table>
                  <thead>
                    <tr>
                      <th>${i18n._("wave_col_start")}</th>
                      <th>${i18n._("wave_col_end")}</th>
                      <th>${i18n._("wave_col_wave")}</th>
                      <th>${i18n._("wave_col_type")}</th>
                      <th>${i18n._("wave_col_direction")}</th>
                      <th>${i18n._("wave_col_forward")}</th>
                      <th>${i18n._("wave_col_reverse")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${slots.map((slot, i) =>
                      this.row(
                        slot,
                        i,
                        i + 1 < slots.length
                          ? slots[i + 1].st
                          : MINUTES_PER_DAY,
                        i === cur,
                      ),
                    )}
                  </tbody>
                </table>
                <button
                  class="btn_add"
                  ?disabled=${next_slot(slots) === null}
                  @click=${() => this.add_slot()}
                >
                  ${i18n._("wave_add_slot")}
                </button>`}
        </div>
        ${loading
          ? nothing
          : html`<div class="weather_zone">
              <h4>🌍 ${i18n._("wave_weather")}</h4>
              <rswave-weather
                .hass=${this._hass}
                .wave=${this.wave}
                .library=${this._library}
                @wave-weather-saved=${(e: Event) => this.on_weather_saved(e)}
              ></rswave-weather>
            </div>`}
        ${loading || !this._library?.linked
          ? nothing
          : html`<div class="wave_zone">
              <h4>${i18n._("wave_zone")}</h4>
              <rswave-library
                .device=${this.device}
                .conf=${{ inline: true }}
                .stateOn=${true}
                .stateObj=${null}
                .hass=${this._hass}
                .focus_uid=${this._focus}
                @wave-library-changed=${(e: Event) =>
                  this.on_library_changed(e)}
              ></rswave-library>
            </div>`}
        ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
        <div class="panel_footer">
          <button class="btn_cancel" @click=${this._onClose}>
            ${i18n._("wave_cancel")}
          </button>
          <button
            class="btn_save"
            ?disabled=${blocked}
            @click=${() => this.save()}
          >
            ${this._busy ? i18n._("wave_saving") : i18n._("wave_save")}
          </button>
        </div>
      </div>
    </div>`;
  }

  protected override _render(_style?: string): TemplateResult {
    const { intervals, now } = this.program();
    const on = this.wave?.is_on?.() ?? true;
    return html`<div class="program ${on ? "" : "off"}" @click=${this._onClick}>
        <svg
          class="graph"
          viewBox="0 0 ${SMALL_GRAPH.width} ${SMALL_GRAPH.height}"
          preserveAspectRatio="xMidYMid meet"
        >
          ${program_graph(intervals, now, {
            ...SMALL_GRAPH,
            title:
              i18n._("wave_program") +
              (this.gps() ? ` · 🌍 ${i18n._("wave_weather_short")}` : ""),
          })}
        </svg>
      </div>
      ${this._open ? this.renderPanel(now) : nothing}`;
  }
}
