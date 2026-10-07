/**
 * Base of the Aqua Medic device views (DC Runner, DC Skimmer, SmartDrift).
 *
 * The three pumps share their controls: a power switch, a feeding pause, a
 * timer following a time-slot program, a speed, seven fault flags. What
 * changes from one to the next is the picture, the name of the speed entity
 * and, for the SmartDrift, the wave settings. Everything common lives here
 * and in am.common.mapping.ts; each device only adds its own elements.
 *
 * Like the ReefWave view, the helpers below give the elements what they need
 * (the program, the time, the faults) so each element stays a plain renderer.
 */
import { css, CSSResult, html, TemplateResult } from "lit";

import { RSDevice } from "../../device";
import { local_time } from "../../redsea/rsled/rsled_program";
import {
  AMProgramRules,
  AMSlot,
  normalize_schedule,
  program_rules,
} from "./am_program";

/** A fault currently raised by the pump. */
export interface AMFault {
  /** translation_key of the binary sensor, ex: "fault_lockedrotor" */
  key: string;
  /** Name as Home Assistant shows it, without the device name */
  name: string;
}

/** Fault binary sensors of ha-aquamedic-component, most severe first. */
export const AM_FAULT_KEYS = [
  "fault_no_liveload",
  "fault_lockedrotor",
  "fault_overtemp",
  "fault_overcurrent",
  "fault_overvoltage",
  "fault_undervoltage",
  "fault_uart",
] as const;

// check-entities: uses fault_no_liveload, fault_lockedrotor, fault_overtemp
// check-entities: uses fault_overcurrent, fault_overvoltage, fault_undervoltage
// check-entities: uses fault_uart

/**
 * Styles of a view whose box is `ratio` times higher than wide.
 *
 * The common box is 1 × 1.2; each pump picture has its own shape, so each
 * view sets the height it needs for the picture, the sliders and the
 * program (see the `PICTURE.box` of its mapping).
 * @param ratio: height of the box, its width being 1
 */
export function am_box_styles(ratio: number): CSSResult[] {
  return [
    ...(RSDevice.styles as CSSResult[]),
    css`
      .device_bg {
        aspect-ratio: 1 / ${ratio};
      }
    `,
  ];
}

export class AMDevice extends RSDevice {
  // ── Time and program ──────────────────────────────────────────────────

  /** Current minute of the day, in Home Assistant's time zone. */
  now_minute(): number {
    return local_time(new Date(), this._hass?.config?.time_zone).minute;
  }

  /** The time-slot program, normalised (empty when unknown). */
  schedule(): AMSlot[] {
    return normalize_schedule(
      this.get_entity("sensor.schedule")?.attributes?.schedule,
    );
  }

  /** What the pump accepts in a slot, from its schedule sensor. */
  program_rules(): AMProgramRules {
    return program_rules(this.get_entity("sensor.schedule")?.attributes);
  }

  // ── Switches ──────────────────────────────────────────────────────────

  /**
   * Whether a switch of the pump is on.
   * @param key: translation key of the switch
   * @return false when it is off, unavailable or absent
   */
  switch_on(key: string): boolean {
    return this.get_entity("switch." + key)?.state === "on";
  }

  /** Whether the pump follows its time-slot program. */
  timer_on(): boolean {
    return this.switch_on("timer_on");
  }

  /** Whether the feeding pause is running. */
  is_feeding(): boolean {
    return this.switch_on("feed_switch");
  }

  // ── Activity ──────────────────────────────────────────────────────────

  /**
   * Entity driving the speed of the pump: the motor speed of a DC Runner,
   * the flow of a SmartDrift.
   */
  speed_entity(): string {
    return "number.motor_speed";
  }

  /** Speed set point, in % (0 when unknown). */
  speed(): number {
    return Number(this.get_entity(this.speed_entity())?.state) || 0;
  }

  /**
   * Whether the pump is pushing water now: switched on, and not held by the
   * feeding pause.
   */
  is_running(): boolean {
    return this.is_on() && !this.is_feeding();
  }

  // ── Faults ────────────────────────────────────────────────────────────

  /**
   * Faults the pump raises now, most severe first.
   * @return one entry per binary sensor that is on
   */
  active_faults(): AMFault[] {
    const device_name = String(this.device?.elements?.[0]?.name ?? "");
    const faults: AMFault[] = [];
    for (const key of AM_FAULT_KEYS) {
      const entity = this.get_entity("binary_sensor." + key);
      if (entity?.state !== "on") continue;
      let name = String(entity.attributes?.friendly_name ?? key);
      // Home Assistant prefixes the entity name with the device one, which
      // the card already shows.
      if (device_name && name.startsWith(device_name + " ")) {
        name = name.slice(device_name.length + 1);
      }
      faults.push({ key, name });
    }
    return faults;
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

  /**
   * Aqua Medic devices publish no message sensors, so the common editor
   * (which only toggles those) has nothing to offer.
   */
  override renderEditor(): TemplateResult {
    return html``;
  }
}
