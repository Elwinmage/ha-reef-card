import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./rsato.mapping";
import { dialogs_device } from "../../device.dialogs";
import { dialogs_rsato } from "./rsato.dialogs";

export class RSAto extends RSDevice {
  constructor() {
    super();
    this.initial_config = config;
    this.load_dialogs([dialogs_device, dialogs_rsato]);
  }

  device = {
    model: "RSATO",
    name: "",
    elements: null,
  };

  /**
   * Device modes meaning no ATO pump is attached.
   *
   * The ReefATO+ has no "pump connected" flag: `/dashboard` reports the pump
   * only through `is_pump_on`, `pump_state` and `pump_speed`, none of which
   * distinguishes "stopped" from "absent". The device-level mode does, via the
   * `AtoMissingPump` state of the firmware enum.
   */
  private static readonly NO_PUMP_MODES = new Set(["missing_pump"]);

  /**
   * Device modes meaning the pump is attached but cannot do its job.
   *
   * Taken from the ATO subset of the firmware mode enum. `empty` and `leak`
   * are reservoir/plumbing conditions rather than pump faults, but they stop
   * the fill just the same, so the pump is flagged rather than shown idle.
   */
  private static readonly PUMP_FAULT_MODES = new Set([
    "malfunction",
    "stalled",
    "pump_timeout",
    "empty",
    "missing_sensor",
  ]);

  /**
   * Current device mode, as reported by the `/mode` endpoint.
   * @return the raw mode string, or "" when the entity is not available yet
   */
  private _mode(): string {
    return this.get_entity("mode")?.state ?? "";
  }

  /**
   * Read a binary sensor as a boolean.
   * @param key: the translation key of the binary sensor
   * @return true only when the entity exists and is "on"
   */
  private _is_on(key: string): boolean {
    return this.get_entity(key)?.state === "on";
  }

  /**
   * Whether an ATO pump is attached. Drives both the pump overlay and the
   * fill controls, which are meaningless without a pump.
   *
   * Defaults to true: a ReefATO+ ships with its pump, so an unknown mode must
   * show the controls rather than hide them.
   * @return false only when the device explicitly reports a missing pump
   */
  has_pump(): boolean {
    return !RSAto.NO_PUMP_MODES.has(this._mode());
  }

  /**
   * Whether the attached pump is prevented from filling.
   * @return true when the device mode names a pump-blocking condition
   */
  pump_alert(): boolean {
    return RSAto.PUMP_FAULT_MODES.has(this._mode());
  }

  /**
   * Whether a leak probe is plugged in.
   *
   * `leak_sensor.status` is not usable here: it only ever holds `dry`,
   * `aquarium_water_leak` or `rodi_water_leak`, and an unplugged probe still
   * reports `dry`. Presence lives in its own `connected` flag.
   * @return true when the probe is physically connected
   */
  has_leak_sensor(): boolean {
    return this._is_on("connected");
  }

  /**
   * Whether the leak probe is armed. A user can leave it plugged in and turn
   * it off in the app, in which case it detects nothing.
   * @return true when the probe is connected and not muted
   */
  leak_sensor_armed(): boolean {
    return this.has_leak_sensor() && this._is_on("enabled");
  }

  /**
   * Whether the leak probe is detecting water.
   *
   * The integration already reduces the three firmware values to a PROBLEM
   * binary sensor (`status !== "dry"`), so the card does not repeat the
   * string comparison.
   * @return true when water is detected, on either the tank or the RO/DI side
   */
  leak_alert(): boolean {
    if (this._is_on("status")) {
      return true;
    }
    // Fall back to the raw firmware value. The binary_sensor is computed by
    // the integration from the payload, so forcing `leak_sensor_status` in the
    // developer tools moves the sensor without moving the binary_sensor — and
    // the card would ignore a leak that is plainly displayed next to it.
    const raw = this.get_entity("leak_sensor_status")?.state;
    if (raw === undefined || raw === "unknown" || raw === "unavailable") {
      return false;
    }
    return raw !== "dry";
  }

  /**
   * Which side a detected leak came from.
   *
   * The firmware distinguishes the aquarium loop from the RO/DI feed, which
   * is the useful half of the information: it says whether salt water is on
   * the floor or fresh water is. The card uses it to put the puddle on the
   * matching side of the picture.
   *
   * @return "aquarium", "rodi", "unknown" when a leak is reported without a
   *   readable side, or null when there is no leak
   */
  leak_source(): "aquarium" | "rodi" | "unknown" | null {
    if (!this.leak_alert()) {
      return null;
    }
    const raw = this.get_entity("leak_sensor_status")?.state;
    if (raw === "aquarium_water_leak") {
      return "aquarium";
    }
    if (raw === "rodi_water_leak") {
      return "rodi";
    }
    // The PROBLEM sensor fired but the raw status is missing or unreadable:
    // there is water, the side is not knowable.
    return "unknown";
  }

  /**
   * Whether the water-level probe is plugged in.
   *
   * Defaults to true, like `has_pump()`: the probe is what the whole device
   * is built around, so only an explicit "off" hides its settings — an
   * entity that has not reported yet must not.
   * @return false only when the device reports the probe as disconnected
   */
  has_ato_sensor(): boolean {
    return this.get_entity("ato_sensor_connected")?.state !== "off";
  }

  /**
   * Whether the leak-alarm buzzer setting is exposed by the integration.
   *
   * Domain-prefixed: integration versions before the switch exposed a
   * read-only binary_sensor of the same name, and a bare key would resolve to
   * whichever the registry walk stored last.
   *
   * The switch only exists from the integration version that added it, so the
   * element hides itself rather than rendering an entity-less icon.
   * @return true when the writable buzzer switch is available
   */
  has_buzzer(): boolean {
    return this.get_entity("switch.buzzer_enabled") !== null;
  }

  /**
   * Whether the buzzer would actually sound on a leak.
   *
   * Being enabled is not enough: the buzzer is the leak alarm, so with no
   * probe plugged in, or with the probe disarmed, nothing can ever trigger
   * it. The icon is dimmed in that case, the same way the leak overlay marks
   * a probe that is present but switched off.
   * @return true when the buzzer is on and the leak probe is armed
   */
  buzzer_armed(): boolean {
    return (
      this.get_entity("switch.buzzer_enabled")?.state === "on" &&
      this.leak_sensor_armed()
    );
  }

  /**
   * Whether the water-level probe needs attention.
   *
   * `check_sensor` is the firmware asking the user to inspect the probe
   * (fouling, position); `is_sensor_error` is a hard read failure. Either one
   * makes the level readings untrustworthy.
   * @return true when the level probe reports a problem
   */
  level_sensor_alert(): boolean {
    return this._is_on("check_sensor") || this._is_on("is_sensor_error");
  }

  /** Last known level-probe fault, to re-render only when it flips. */
  private _level_alert = false;

  /** Last known buzzer-armed state, same purpose. */
  private _buzzer_armed = false;

  /**
   * Watch the level-probe fault so the background picture follows it.
   *
   * The class is built in `_render()`, which RSDevice only re-runs when a
   * `master` element changed or a device was enabled — a plain sensor moving
   * leaves the picture with a stale class. Elements carrying a `disabled_if`
   * refresh themselves, the background has no such hook.
   *
   * The buzzer icon is watched here for a related reason: its dimming depends
   * on the leak probe, not on its own entity, and an element's `class`
   * expression is only re-evaluated when its own stateObj changes.
   */
  override _setting_hass(obj: any): void {
    super._setting_hass(obj);
    const alert = this.level_sensor_alert();
    if (alert !== this._level_alert) {
      this._level_alert = alert;
      this.requestUpdate();
    }
    const armed = this.buzzer_armed();
    if (armed !== this._buzzer_armed) {
      this._buzzer_armed = armed;
      this.requestUpdate();
    }
  }

  _render(style?: any, substyle?: any): TemplateResult {
    const bg_img = this.config.background_img ?? "";
    // A level probe fault has no overlay of its own — the probe is part of
    // the background picture — so the whole picture blinks instead, the same
    // red tint the pump and the leak probe use for their own faults.
    const alert = this.level_sensor_alert() ? " blink-alert" : "";
    return html` <div class="device_bg">
      ${style}
      <img
        class="device_img${alert}"
        id="rsdevice_img"
        alt=""
        src="${bg_img}"
        style="${substyle}"
      />
      <div>${this._render_elements(this.is_on())}</div>
    </div>`;
  }

  override renderEditor(): TemplateResult {
    return html``;
  }
}
