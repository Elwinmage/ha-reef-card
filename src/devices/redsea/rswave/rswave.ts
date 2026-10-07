import { css, html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./rswave.mapping";

import { dialogs_device } from "../../device.dialogs";
import { dialogs_rswave } from "./rswave.dialogs";
import { local_time } from "../rsled/rsled_program";
import { RSWAVE_CANVAS } from "./rswave_element";
import {
  WaveInterval,
  current_index,
  normalize_schedule,
  wave_speed,
} from "./rswave_program";

/**
 * Modes in which the pump runs its waves. Any other mode (off, feeding,
 * maintenance, shortcut_off_delay…) stops it.
 */
export const RUNNING_MODES = ["auto", "preview"];

/** The wave the pump is driving now. */
export interface CurrentWave {
  type: string;
  direction: string;
  fti: number;
  rti: number;
}

/**
 * ReefWave (RSWAVE25, RSWAVE45).
 *
 * The view is the pump picture with, around it:
 *   - the messages on top;
 *   - the common switches and the settings on the mounting clips;
 *   - the mode and the name of the pump on its LED strip;
 *   - the speed on its end cap, and a flow animated at that speed;
 *   - the day program under it, opening the program view on a click.
 *
 * The helpers below give those elements the program, the time, the mode and
 * the speed, so each element stays a plain renderer.
 */
export class RSWave extends RSDevice {
  // The device box takes the ratio of the picture, so the percentages of
  // the mapping and the full-canvas overlays land on the same points.
  static override styles = [
    ...(RSDevice.styles as any[]),
    css`
      .device_bg {
        aspect-ratio: ${RSWAVE_CANVAS.width} / ${RSWAVE_CANVAS.height};
      }
    `,
  ];

  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_device, dialogs_rswave]);
  }

  device = {
    model: "RSWAVE",
    name: "",
    elements: null,
  };

  // ── Time and program ──────────────────────────────────────────────────

  // check-entities: uses wave_type

  /** Current minute of the day, in Home Assistant's time zone. */
  now_minute(): number {
    return local_time(new Date(), this._hass?.config?.time_zone).minute;
  }

  /** The day program, normalised (empty when unknown). */
  schedule(): WaveInterval[] {
    return normalize_schedule(
      this.get_entity("sensor.wave_type")?.attributes?.schedule,
    );
  }

  /** Index of the interval running now, -1 without program. */
  current_index(): number {
    return current_index(this.schedule(), this.now_minute());
  }

  // ── Mode ──────────────────────────────────────────────────────────────

  // check-entities: uses mode

  /** Raw mode: auto, preview, feeding, maintenance, off… */
  mode(): string {
    return this.get_entity("sensor.mode")?.state ?? "";
  }

  /** Translated mode, as Home Assistant displays it. */
  mode_label(): string {
    const entity = this.get_entity("sensor.mode");
    if (!entity) return "";
    if (typeof this._hass?.formatEntityState === "function") {
      return this._hass.formatEntityState(entity);
    }
    return entity.state;
  }

  /** Whether the pump is pushing water now. */
  is_running(): boolean {
    return this.is_on() && RUNNING_MODES.includes(this.mode());
  }

  // ── Speed ─────────────────────────────────────────────────────────────

  // check-entities: uses wave_direction, wave_forward_intensity, wave_backward_intensity
  // check-entities: uses preview_wave_type, preview_wave_direction

  /**
   * The wave driven now: the preview settings while previewing, the current
   * interval of the program otherwise (as the integration computes it).
   * @return the wave, or null when the pump does not run
   */
  current_wave(): CurrentWave | null {
    if (!this.is_running()) return null;
    const read = (key: string) => this.get_entity(key)?.state;
    if (this.mode() === "preview") {
      return {
        type: String(read("select.preview_wave_type") ?? "nw"),
        direction: String(read("select.preview_wave_direction") ?? "fw"),
        fti: Number(read("number.wave_forward_intensity")) || 0,
        rti: Number(read("number.wave_backward_intensity")) || 0,
      };
    }
    return {
      type: String(read("sensor.wave_type") ?? "nw"),
      direction: String(read("sensor.wave_direction") ?? "fw"),
      fti: Number(read("sensor.wave_forward_intensity")) || 0,
      rti: Number(read("sensor.wave_backward_intensity")) || 0,
    };
  }

  /** Speed of the pump now, in % (0 when stopped). */
  speed(): number {
    const wave = this.current_wave();
    return wave ? wave_speed(wave) : 0;
  }

  /** Direction of the flow now: fw, rw or alt ("" when stopped). */
  direction(): string {
    const wave = this.current_wave();
    return wave && this.speed() > 0 ? wave.direction : "";
  }

  // ── Name ──────────────────────────────────────────────────────────────

  /**
   * Name of the pump as Home Assistant shows it: the one the user gave the
   * device, else its own.
   */
  display_name(): string {
    const el: any = this.device?.elements?.[0];
    return String(el?.name_by_user || el?.name || this.device?.name || "");
  }

  // ── Re-render detection ───────────────────────────────────────────────

  /** Entities the overlays are drawn from. */
  private static readonly WATCHED = [
    "device_state",
    "sensor.mode",
    "sensor.wave_type",
    "sensor.wave_direction",
    "sensor.wave_forward_intensity",
    "sensor.wave_backward_intensity",
    "select.preview_wave_type",
    "select.preview_wave_direction",
    "number.wave_forward_intensity",
    "number.wave_backward_intensity",
  ];

  /**
   * Fingerprint of everything the overlays depend on, so they only
   * re-render when one of those entities changes (or the name).
   */
  state_signature(): string {
    if (!this._hass) return "";
    const states = RSWave.WATCHED.map((key) => {
      const s = this.get_entity(key);
      return s ? `${s.state}@${s.last_updated ?? ""}` : "-";
    });
    return [...states, this.display_name()].join("|");
  }

  // ── Render ────────────────────────────────────────────────────────────

  override _render(style?: any, substyle?: any): TemplateResult {
    const bg_img = this.config.background_img ?? "";
    return html`<div class="device_bg">
      ${style}
      <img
        class="device_img"
        id="rsdevice_img"
        alt=""
        src="${bg_img}"
        style="${substyle}"
      />
      <div>${this._render_elements(this.is_on())}</div>
    </div>`;
  }

  override renderEditor(): TemplateResult {
    if (this.is_disabled()) {
      return html``;
    }
    this._populate_entities();
    this.update_config();
    return html`<form>${this._editor_common()}</form>`;
  }
}

export class RSWave25 extends RSWave {}

export class RSWave45 extends RSWave {}
