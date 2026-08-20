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
    return this._is_on("status");
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

  _render(style?: any, substyle?: any): TemplateResult {
    const bg_img = this.config.background_img ?? "";
    return html` <div class="device_bg">
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
    return html``;
  }
}
