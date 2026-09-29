import { css, html, TemplateResult } from "lit";

import { RSDevice } from "../../device";
import { config } from "./rsled_g1.mapping";
import { config2 } from "./rsled_g2.mapping";
import { dialogs_device } from "../../device.dialogs";
import {
  dialogs_rsled,
  dialogs_rsled_g2,
  dialogs_rsled_virtual_g1,
  dialogs_rsled_virtual_g2,
} from "./rsled.dialogs";
import { config_virtual_g1, config_virtual_g2 } from "./rsled_virtual.mapping";
import type { LinkedLed } from "./rsled_linked";
import { RSLED_CANVAS } from "./rsled_sky";
import { RSLedProgramEditor } from "./rsled_program_editor";
import i18n from "../../../translations/myi18n";

import {
  DayProgram,
  CloudProgram,
  SkyState,
  brightness_pct,
  clouds_state,
  local_time,
  normalize_clouds,
  normalize_program,
  preset_label,
  previous_weekday,
  sky_state,
  wb_to_kelvin_program,
  weather_place_minute,
} from "./rsled_program";

/** A lamp a program is written to (the lamp itself, or those of a group). */
export interface ProgramTarget {
  /** Config entry of the lamp: the device_id of the redsea services */
  device_id: string;
  /** Whether the lamp is a G2 (kelvin/intensity program) */
  g2: boolean;
  /** Model of the lamp: a G1's white/blue balance depends on it */
  model?: string;
}

/**
 * ReefLED (G1: RSLED50, RSLED90, RSLED160).
 *
 * The view is taller than the lamp picture: the sky (course of the sun) is
 * drawn above it, the beam, the sliders and the messages under it. The
 * elements are laid out in a fixed design space (RSLED_CANVAS) and the
 * helpers below give them the program, the time and the light levels.
 */
export class RSLed extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_device, dialogs_rsled]);
  }

  device = {
    model: "RSLED",
    name: "",
    elements: null,
  };

  // ── Time and program ──────────────────────────────────────────────────

  /**
   * Current minute of the day and ISO weekday, in Home Assistant's time zone
   * (the lamp runs on the local time of the tank).
   */
  now(): { minute: number; weekday: number } {
    return local_time(new Date(), this._hass?.config?.time_zone);
  }

  /**
   * Key of the program entity of a weekday.
   * @param weekday: 1 (Monday) .. 7 (Sunday)
   */
  program_key(weekday: number): string {
    return "auto_" + weekday;
  }

  /**
   * Weekday of today's program: the lamp numbers its /auto/<day> programs by
   * ISO weekday (1 = Monday). The `active_preset` of its dashboard is not
   * that day (two lamps report different values on the same day), so it is
   * not used here.
   */
  today(): number {
    return this.now().weekday;
  }

  /** Key of today's program entity. */
  today_program_key(): string {
    return this.program_key(this.today());
  }

  /**
   * Program of a weekday, from the `data` attribute of its entity.
   * @param weekday: 1 (Monday) .. 7 (Sunday)
   */
  program(weekday: number): DayProgram | null {
    const data = this.get_entity(this.program_key(weekday))?.attributes?.data;
    return normalize_program(data, weekday, !this.has_white_blue());
  }

  /**
   * Clouds of a weekday, on the day's own timeline: from /clouds/<day> on a
   * G1, inside /auto/<day> on a G2.
   * @param weekday: 1 (Monday) .. 7 (Sunday)
   */
  clouds(weekday: number): CloudProgram | null {
    const attrs = this.get_entity(this.program_key(weekday))?.attributes;
    const raw = attrs?.clouds ?? attrs?.data?.clouds;
    return raw && typeof raw === "object"
      ? normalize_clouds(raw, weekday)
      : null;
  }

  today_program(): DayProgram | null {
    return this.program(this.today());
  }

  yesterday_program(): DayProgram | null {
    return this.program(previous_weekday(this.today()));
  }

  tomorrow_program(): DayProgram | null {
    return this.program((this.today() % 7) + 1);
  }

  /**
   * Name of the program running: from the lamp's dashboard when available
   * (G1 and G2), else from today's program entity; without the stamp the
   * app adds to library programs.
   */
  program_name(): string {
    const valid = (state?: string) =>
      state && state !== "unknown" && state !== "unavailable" ? state : "";
    return preset_label(
      valid(this.get_entity("current_program")?.state) ||
        valid(this.get_entity(this.today_program_key())?.state),
    );
  }

  /** Clouds programmed for today, and whether they are passing now. */
  clouds_state(): { count: number; active: boolean } {
    return clouds_state(this.clouds(this.today()), this.now().minute);
  }

  /** Where the sun (or the moon) stands on its course. */
  sky_state(): SkyState {
    const { minute } = this.now();
    return sky_state(
      minute,
      this.yesterday_program(),
      this.today_program(),
      this.tomorrow_program(),
    );
  }

  // ── Light ─────────────────────────────────────────────────────────────

  /**
   * Level of a light entity in % (0 when off or missing).
   * @param key: translation key of the light
   */
  light_pct(key: string): number {
    const light = this.get_entity("light." + key);
    if (!light || light.state !== "on") return 0;
    return brightness_pct(light.attributes?.brightness);
  }

  /**
   * Level of a channel in %: the light entity on a G1, the read-only sensor
   * a G2 reports its white and blue channels with.
   * @param key: white, blue or moon
   */
  channel_pct(key: string): number {
    if (this.get_entity("light." + key)) return this.light_pct(key);
    const value = Number(this.get_entity("sensor." + key)?.state);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  }

  /** Current level of each channel, in %. */
  channel_levels(): { white: number; blue: number; moon: number } {
    return {
      white: this.channel_pct("white"),
      blue: this.channel_pct("blue"),
      moon: this.channel_pct("moon"),
    };
  }

  /**
   * Overall intensity currently produced, in %, or null when the lamp does
   * not report it.
   */
  intensity_pct(): number | null {
    const light = this.get_entity("light.kelvin_intensity");
    if (!light || light.state === "unavailable") return null;
    return this.light_pct("kelvin_intensity");
  }

  /**
   * Name of the lamp as Home Assistant shows it: the one the user gave the
   * device, else its own.
   */
  display_name(): string {
    const el: any = this.device?.elements?.[0];
    return String(el?.name_by_user || el?.name || this.device?.name || "");
  }

  // ── Weather program ───────────────────────────────────────────────────

  // check-entities: uses weather_sync, weather_program

  /**
   * Current minute at the place of the weather program, while the lamp
   * follows it: the moment of the place's day the program plays now (with
   * the tank's day anchored on its own sunrise, 09:04 in France can be
   * 04:04 in the Maldives). Null outside the weather mode, or without
   * today in the generated week.
   */
  weather_place_now(): number | null {
    if (this.get_entity("weather_sync")?.state !== "on") return null;
    const days = this.get_entity("weather_program")?.attributes?.days;
    if (!Array.isArray(days)) return null;
    const now = this.now();
    const day = days.find((d: any) => d?.weekday === now.weekday);
    return weather_place_minute(now.minute, day);
  }

  // ── Mode and moon ─────────────────────────────────────────────────────

  // Read by the sky, the beam and the sliders through the helpers below:
  // check-entities: uses mode, todays_moon_day, current_program
  // check-entities: uses white, blue, moon, kelvin_intensity

  /** Raw mode: auto, manual, timer… */
  mode(): string {
    return (
      this.get_entity("select.mode")?.state ??
      this.get_entity("sensor.mode")?.state ??
      ""
    );
  }

  /** Translated mode, as Home Assistant displays it. */
  mode_label(): string {
    const entity =
      this.get_entity("select.mode") ?? this.get_entity("sensor.mode");
    if (!entity) return "";
    if (typeof this._hass?.formatEntityState === "function") {
      return this._hass.formatEntityState(entity);
    }
    return entity.state;
  }

  /** Moon day of the lunar cycle (1..28), full moon when unknown. */
  moon_day(): number {
    const day = Number(this.get_entity("todays_moon_day")?.state);
    return Number.isFinite(day) && day > 0 ? day : 15;
  }

  // ── Re-render detection ───────────────────────────────────────────────

  /** Entities the sky and the beam are drawn from. */
  private static readonly WATCHED = [
    "light.white",
    "light.blue",
    "light.moon",
    "light.kelvin_intensity",
    "sensor.white",
    "sensor.blue",
    "select.mode",
    "sensor.mode",
    "todays_moon_day",
    "current_program",
    "device_state",
  ];

  /**
   * Fingerprint of everything the sky and the beam depend on, so they only
   * re-render when one of those entities changes.
   */
  state_signature(): string {
    if (!this._hass) return "";
    const weekday = this.today();
    const keys = [
      ...RSLed.WATCHED,
      this.program_key(weekday),
      this.program_key(previous_weekday(weekday)),
      this.program_key((weekday % 7) + 1),
    ];
    return keys
      .map((key) => {
        const s = this.get_entity(key);
        return s ? `${s.state}@${s.last_updated ?? ""}` : "-";
      })
      .join("|");
  }

  // ── Render ────────────────────────────────────────────────────────────

  // The view is taller than the default device box: every layout of the
  // device (normal, disabled, maintenance) uses the design space ratio, and
  // the background pictures already carry the sky margin above the lamp.
  static override styles = [
    ...(RSDevice.styles as any[]),
    css`
      .device_bg {
        aspect-ratio: ${RSLED_CANVAS.width} / ${RSLED_CANVAS.height};
      }
      /* The program editor over the view, in the same grid cell: the card
         grows when the editor needs more height than the view */
      .rsled_stack {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
      }
      .rsled_stack > * {
        grid-area: 1 / 1;
        min-width: 0;
      }
      /* K | W/B switch, above the sliders */
      .rsled_switch {
        position: absolute;
        left: 1.4%;
        top: 51.6%;
        display: flex;
        border-radius: 10px;
        overflow: hidden;
        font-size: 10px;
        font-weight: 600;
        cursor: pointer;
        user-select: none;
        box-shadow: inset 0 0 0 1px var(--divider-color, rgba(0, 0, 0, 0.2));
      }
      .rsled_switch span {
        padding: 2px 7px;
        color: var(--secondary-text-color, #777);
      }
      .rsled_switch span.on {
        background: rgb(197, 91, 90);
        color: #fff;
      }
    `,
  ];

  override _render(style?: any, substyle?: any): TemplateResult {
    const on = this.is_on();
    return html`<div class="rsled_stack">
      <div class="device_bg">
        ${style}
        <div>${this._render_elements(on, "back")}</div>
        <img
          class="device_img"
          id="rsdevice_img"
          alt=""
          src="${this.config.background_img}"
          style="${substyle}"
        />
        <div>${this._render_elements(on)}</div>
        ${this.has_white_blue() ? this._render_slider_switch() : ""}
      </div>
      ${this._program_editor ?? ""}
    </div>`;
  }

  // ── Slider mode (G1): intensity/colour or white/blue ──────────────────

  /** Whether the lamp can be driven channel by channel (G1 only). */
  has_white_blue(): boolean {
    return true;
  }

  /** Browser storage key of the slider mode of this lamp. */
  private _slider_key(): string {
    return `ha-reef-card.rsled.${this.device?.elements?.[0]?.id ?? this.device?.name}.white_blue`;
  }

  /**
   * Whether the sliders drive the white and blue channels rather than the
   * intensity and the colour. Remembered per lamp by the browser: it is a
   * viewing choice, not a setting of the lamp.
   */
  white_blue(): boolean {
    if (!this.has_white_blue()) return false;
    if (this._white_blue === null) {
      try {
        this._white_blue = localStorage.getItem(this._slider_key()) === "1";
      } catch {
        this._white_blue = false;
      }
    }
    return this._white_blue;
  }
  private _white_blue: boolean | null = null;

  /** Switch the sliders between intensity/colour and white/blue. */
  toggle_white_blue(): void {
    this._white_blue = !this.white_blue();
    try {
      localStorage.setItem(this._slider_key(), this._white_blue ? "1" : "0");
    } catch {
      /* storage unavailable: the choice lasts for the session */
    }
    // The sliders are cached: re-evaluate their disabled_if
    for (const key of Object.keys(this._elements)) {
      this._elements[key]?.requestUpdate?.();
    }
    this.requestUpdate();
  }

  /** Small K | W/B switch above the sliders. */
  private _render_slider_switch(): TemplateResult {
    const wb = this.white_blue();
    return html`<div
      class="rsled_switch"
      title="${i18n._("white_blue_sliders")}"
      @click=${() => this.toggle_white_blue()}
    >
      <span class="${wb ? "" : "on"}">K</span
      ><span class="${wb ? "on" : ""}">W/B</span>
    </div>`;
  }

  // ── Identify ──────────────────────────────────────────────────────────

  /** How long the beam blinks after an identify, in ms. */
  static readonly IDENTIFY_MS = 10_000;
  private _identify_until = 0;
  private _identify_timer: ReturnType<typeof setTimeout> | null = null;

  /** Whether the lamp is identifying itself (beam blinking). */
  identifying(): boolean {
    return Date.now() < this._identify_until;
  }

  /** Blink the beam while the lamp identifies itself. */
  identify(): void {
    this._identify_until = Date.now() + RSLed.IDENTIFY_MS;
    this._refresh_beam();
    if (this._identify_timer) clearTimeout(this._identify_timer);
    this._identify_timer = setTimeout(() => {
      this._identify_timer = null;
      this._refresh_beam();
    }, RSLed.IDENTIFY_MS);
  }

  private _refresh_beam(): void {
    this._elements?.["beam"]?.requestUpdate?.();
  }

  private _on_device_event = (ev: Event): void => {
    if ((ev as CustomEvent).detail?.event === "rsled_identify") {
      this.identify();
    }
  };

  private _on_editor_close = (): void => {
    this._program_editor = null;
    this.requestUpdate();
  };

  /** New states: the program editor follows them (GPS weather mode). */
  override _setting_hass(obj: any): void {
    super._setting_hass(obj);
    this._program_editor?.hass_changed();
  }

  override async connectedCallback() {
    this.addEventListener("device-event", this._on_device_event);
    this.addEventListener("rsled-editor-close", this._on_editor_close);
    await super.connectedCallback();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("device-event", this._on_device_event);
    this.removeEventListener("rsled-editor-close", this._on_editor_close);
  }

  // ── Program editor ────────────────────────────────────────────────────

  /** Lamps the edited program is written to: this one. */
  program_targets(): ProgramTarget[] {
    const el = this.device?.elements?.[0];
    const device_id = el?.primary_config_entry;
    return device_id
      ? [{ device_id, g2: !this.has_white_blue(), model: el?.model }]
      : [];
  }

  /** Model whose white/blue balance converts this lamp's G1 programs. */
  g1_model(): string | undefined {
    return this.device?.elements?.[0]?.model;
  }

  private _program_editor: RSLedProgramEditor | null = null;

  /** Bounds of the colour temperature of this lamp. */
  kelvin_range(): { min: number; max: number } {
    const attrs = this.get_entity("light.kelvin_intensity")?.attributes ?? {};
    return {
      min: Number(
        attrs.min_color_temp_kelvin ?? (this.has_white_blue() ? 9000 : 8000),
      ),
      max: Number(attrs.max_color_temp_kelvin ?? 23000),
    };
  }

  /**
   * Open the editor on a day program, today's by default.
   * @param day: ISO weekday
   */
  open_program_editor(day?: number): void {
    const editor = document.createElement(
      "rsled-program-editor",
    ) as RSLedProgramEditor;
    editor.load(
      this,
      day ?? this.today(),
      this.has_white_blue() ? "wb" : "kelvin",
    );
    this._program_editor = editor;
    this.requestUpdate();
  }

  override renderEditor(): TemplateResult {
    if (this.is_disabled()) {
      return html``;
    }
    this._populate_entities();
    this.update_config();
    return html` <form>${this._editor_common()}</form>`;
  }
}

export class RSLed160 extends RSLed {}

export class RSLed90 extends RSLed {}

export class RSLed50 extends RSLed {}

/**
 * ReefLED G2 (RSLED60, RSLED115, RSLED170): same view, its own picture.
 * Its colour is only driven through kelvin and intensity, the white and
 * blue channels are read-only sensors.
 */
class RSLedG2 extends RSLed {
  constructor() {
    super();
    this.initial_config = config2;
    this.load_dialogs([dialogs_device, dialogs_rsled, dialogs_rsled_g2]);
  } // end of constructor

  override has_white_blue(): boolean {
    return false;
  }
}

export class RSLed170 extends RSLedG2 {}

export class RSLed115 extends RSLedG2 {}

export class RSLed60 extends RSLedG2 {}

/**
 * Virtual ReefLED: several lamps driven as one. It shows the G2 view as
 * soon as one of its lamps is a G2 (the group is then only driven through
 * kelvin and intensity), the G1 view otherwise, and lists its lamps bottom
 * right. An edited program is written to each of its lamps, in each lamp's
 * own format.
 */
export class RSLedVirtual extends RSLed {
  /** Whether the G2 view is set up, null before the first choice. */
  private _g2_view: boolean | null = null;

  constructor() {
    super();
    this._use_view(false);
  }

  /** Lamps of the group, from the `linked_leds` sensor. */
  linked(): LinkedLed[] {
    const leds = this.get_entity("linked_leds")?.attributes?.leds;
    return Array.isArray(leds) ? leds : [];
  }

  /**
   * Whether one of the lamps is a G2. Without the list (older integration),
   * a group with a G2 has no white/blue lights.
   */
  is_g2(): boolean {
    const leds = this.linked();
    if (leds.length) return leds.some((led) => led?.g2 === true);
    return (
      !this.get_entity("light.white") &&
      !!this.get_entity("light.kelvin_intensity")
    );
  }

  override has_white_blue(): boolean {
    return !this.is_g2();
  }

  /**
   * Set up the mapping and the dialogs of a view.
   * @param g2: whether to show the G2 view
   */
  private _use_view(g2: boolean): void {
    this.initial_config = g2 ? config_virtual_g2 : config_virtual_g1;
    this.load_dialogs([
      dialogs_device,
      g2 ? dialogs_rsled_virtual_g2 : dialogs_rsled_virtual_g1,
    ]);
  }

  override update_config(): void {
    const g2 = this.is_g2();
    if (g2 !== this._g2_view) {
      // The elements were built for the other view: rebuild them
      if (this._g2_view !== null) this._elements = {};
      this._g2_view = g2;
      this._use_view(g2);
    }
    super.update_config();
  }

  // The view depends on the entities: choose it again once they are known
  override _populate_entities(): void {
    super._populate_entities();
    if (this.is_g2() !== this._g2_view) this.update_config();
  }

  /**
   * Program of a weekday. The group reads it from its first lamp: a G1's
   * white/blue program is shown as a G2 one in the G2 view.
   * @param weekday: 1 (Monday) .. 7 (Sunday)
   */
  override program(weekday: number): DayProgram | null {
    const data = this.get_entity(this.program_key(weekday))?.attributes?.data;
    const source = this.linked()[0];
    const source_g2 = source ? source.g2 === true : this.is_g2();
    const prog = normalize_program(data, weekday, source_g2);
    return this.is_g2() && !source_g2
      ? wb_to_kelvin_program(prog, source?.model)
      : prog;
  }

  /** Each lamp of the group, in its own format. */
  override program_targets(): ProgramTarget[] {
    const targets = this.linked()
      .filter((led) => typeof led?.entry_id === "string" && led.entry_id)
      .map((led) => ({
        device_id: led.entry_id as string,
        g2: led.g2 === true,
        model: led.model,
      }));
    return targets.length ? targets : super.program_targets();
  }

  /** The first G1 of the group sets the white/blue balance. */
  override g1_model(): string | undefined {
    return this.linked().find((led) => led?.g2 !== true)?.model;
  }
}
