import { html, TemplateResult } from "lit";
import { RSDevice } from "../../device";
import { config } from "./rsato.mapping";
import { dialogs_device } from "../../device.dialogs";
import { dialogs_rsato } from "./rsato.dialogs";
import i18n from "../../../translations/myi18n";

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
   * Whether the buzzer setting is exposed by the integration.
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

  /**
   * Watch the level-probe fault so the background picture follows it.
   *
   * The class is built in `_render()`, which RSDevice only re-runs when a
   * `master` element changed or a device was enabled — a plain sensor moving
   * leaves the picture with a stale class. Elements carrying a `disabled_if`
   * refresh themselves, the background has no such hook.
   */
  override _setting_hass(obj: any): void {
    super._setting_hass(obj);
    const alert = this.level_sensor_alert();
    if (alert !== this._level_alert) {
      this._level_alert = alert;
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

  //--------------------------------------------------------------------------//
  //   Editor options
  //--------------------------------------------------------------------------//

  /**
   * Domains a fill / stop-fill control can be bound to.
   *
   * A press-once entity and a two-state entity are both valid ways to drive a
   * valve, so both are offered and the service is derived from the domain at
   * click time — see `_external_action()`.
   */
  private static readonly FILL_DOMAINS = [
    "button",
    "input_button",
    "switch",
    "input_boolean",
    "script",
    "valve",
  ];

  /**
   * Domains that hold a state rather than fire once.
   *
   * One such entity is the whole control: turning it on starts the fill and
   * turning it off stops it, so naming it in a single picker is enough — see
   * `_apply_external_entities()`.
   */
  private static readonly TWO_STATE_DOMAINS = new Set([
    "switch",
    "input_boolean",
    "valve",
  ]);

  /** Domains that can carry a dispensed volume. */
  private static readonly USAGE_DOMAINS = [
    "sensor",
    "input_number",
    "number",
    "counter",
  ];

  /** Label of an autonomy that never ends. */
  private static readonly INFINITE_LABEL = "'∞'";

  /** Where that label sits, once the "days" unit is gone. */
  private static readonly INFINITE_LEFT = "7%";

  /**
   * Whether the reservoir is a continuous feed rather than a container.
   *
   * An RO unit plumbed straight to the sump tops off on the fly: there is no
   * volume to run out of, so everything the card says about a reservoir —
   * percentage, autonomy, dialog — is about a tank that does not exist.
   * @return true when the user declared an infinite reservoir
   */
  infinite_tank(): boolean {
    return this.get_config_flag("infinite_tank") === true;
  }

  /**
   * Entity to read the dispensed volume from, instead of the device counter.
   * Only used when the option is switched on, so an entity left over from a
   * previous configuration does not silently take over.
   * @return the entity_id, or "" when the device counter is to be used
   */
  external_usage_entity(): string {
    return this.get_config_flag("external_usage") === true
      ? this.get_config_value("external_usage_entity")
      : "";
  }

  /**
   * Entity the fill button acts on, instead of the device button.
   * @return the entity_id, or "" when the device button is to be used
   */
  fill_entity(): string {
    return this.get_config_value("fill_entity");
  }

  /**
   * Entity the stop button acts on, instead of the device button.
   * @return the entity_id, or "" when the device button is to be used
   */
  stop_fill_entity(): string {
    return this.get_config_value("stop_fill_entity");
  }

  /**
   * Service call for an externally driven fill control.
   *
   * The user picks an entity, not a service: a valve can be a button to press
   * or a switch to hold on, and asking which would be asking them to describe
   * what the entity id already says.
   * @param entity_id: the entity the control is bound to
   * @param start: true for the fill control, false for the stop control
   * @return the action to run on tap
   */
  private _external_action(entity_id: string, start: boolean): any {
    const domain = entity_id.split(".")[0];
    let action: string;
    switch (domain) {
      case "button":
      case "input_button":
        // A press has no direction: the same entity would start and stop,
        // which is why the two controls are configured separately.
        action = "press";
        break;
      case "script":
        action = "turn_on";
        break;
      case "valve":
        action = start ? "open_valve" : "close_valve";
        break;
      default:
        action = start ? "turn_on" : "turn_off";
    }
    return { domain, action, data: "default" };
  }

  /**
   * Point a fill control at an entity of another integration.
   *
   * `name` doubles as the entity lookup key, and the raw entity_id resolves
   * through the hass states fallback of MyElement.create_element().
   * @param element: the mapping element to rewrite
   * @param entity_id: the entity to bind it to
   * @param start: true for the fill control, false for the stop control
   */
  private _bind_fill_control(
    element: any,
    entity_id: string,
    start: boolean,
  ): void {
    if (!element) {
      return;
    }
    element.name = entity_id;
    // `icon: "state"` reads the icon off the device entity, which this
    // control no longer has. Pinning the icons keeps the two buttons
    // recognisable whatever the picked entity looks like in HA.
    element.icon = start ? "mdi:water-pump" : "mdi:water-pump-off";
    // An external valve does not depend on the ReefATO+ pump: someone who
    // drives their own solenoid typically has no pump paired at all.
    delete element.disabled_if;
    element.tap_action = this._external_action(entity_id, start);
  }

  /**
   * Strip everything the card says about a reservoir that has no volume.
   * @param elements: the merged element configuration to rewrite
   */
  private _apply_infinite_tank(elements: any): void {
    const water = elements.volume_left;
    if (water) {
      // A percentage of an unlimited supply means nothing, and the dialog
      // behind the water only holds the tank capacity.
      water.show_value = false;
      delete water.tap_action;
    }
    const days = elements.days_till_empty;
    if (days) {
      days.label = RSAto.INFINITE_LABEL;
      days.unit = "";
      // The box is left-aligned and sized for "5 Days": a lone glyph sits far
      // off-centre in it, so it is nudged right by what the unit no longer
      // takes.
      if (days.css) {
        days.css.left = RSAto.INFINITE_LEFT;
      }
      // more-info would show the number the label is replacing.
      delete days.tap_action;
    }
    // The device pump and its hand-back-to-automatic button describe a fill
    // cycle that a continuous feed does not have.
    for (const key of ["pump_settings", "resume"]) {
      if (elements[key]) {
        elements[key].disabled_if = true;
        elements[key].no_br_if_disabled = true;
      }
    }
  }

  /**
   * Re-point the elements a user option redirects to their own entities.
   * @param elements: the merged element configuration to rewrite
   */
  private _apply_external_entities(elements: any): void {
    const usage = this.external_usage_entity();
    if (usage && elements.today_usage_sparkline?.entities?.[0]) {
      elements.today_usage_sparkline.entities[0].entity = usage;
    }
    // A single switch is a complete control: on fills, off stops. Leaving the
    // other picker empty is how the user says so, rather than picking the
    // same entity twice. Two press-once buttons have no such shortcut — a
    // press carries no direction — so they stay two separate choices.
    const picked_fill = this.fill_entity();
    const picked_stop = this.stop_fill_entity();
    const fill = picked_fill || RSAto._mirrored(picked_stop);
    const stop = picked_stop || RSAto._mirrored(picked_fill);
    if (fill) {
      this._bind_fill_control(elements.fill, fill, true);
    }
    if (stop) {
      this._bind_fill_control(elements.stop_fill, stop, false);
    }
  }

  /**
   * The entity to reuse for the control the user left empty.
   * @param entity_id: the entity picked for the other control
   * @return the same entity when it holds a state, "" otherwise
   */
  private static _mirrored(entity_id: string): string {
    return RSAto.TWO_STATE_DOMAINS.has(entity_id.split(".")[0])
      ? entity_id
      : "";
  }

  /**
   * Apply the editor options on top of the merged configuration.
   *
   * Done here rather than in the mapping because the options rewrite existing
   * elements — the mapping describes the ReefATO+ as Red Sea built it, the
   * options describe what the user plumbed around it.
   */
  override update_config(): void {
    super.update_config();
    const elements = this.config?.elements;
    if (!elements) {
      return;
    }
    if (this.infinite_tank()) {
      this._apply_infinite_tank(elements);
    }
    this._apply_external_entities(elements);
  }

  /**
   * Editor row: a switch bound to a device-level flag.
   * @param key: the option name
   */
  private _render_option_switch(key: string): TemplateResult {
    return html`
      <label class="switch">
        <input
          type="checkbox"
          id="${key}"
          .checked="${this.get_config_flag(key) === true}"
          @change="${(e: Event) =>
            this.set_config_value(
              key,
              (e.currentTarget as HTMLInputElement).checked,
            )}"
        />
        <span class="slider round"></span>
      </label>
      <label>${i18n._(key)}</label>
    `;
  }

  /**
   * Editor row: an entity selector bound to a device-level option.
   *
   * `ha-entity-picker` is Home Assistant's own selector and is what the user
   * expects to see, but it is not part of any public API: a plain select over
   * the matching states is rendered when the frontend does not provide it,
   * rather than an editor row that does nothing.
   * @param key: the option name
   * @param domains: the entity domains worth offering
   */
  private _render_entity_picker(
    key: string,
    domains: string[],
  ): TemplateResult {
    const value = this.get_config_value(key);
    const commit = (picked: string) =>
      this.set_config_value(key, picked.trim());

    if (customElements.get("ha-entity-picker")) {
      return html`
        <ha-entity-picker
          .hass="${this._hass}"
          .value="${value}"
          .includeDomains="${domains}"
          .label="${i18n._(key)}"
          allow-custom-entity
          @value-changed="${(e: CustomEvent) => commit(e.detail?.value ?? "")}"
        ></ha-entity-picker>
      `;
    }

    const ids = Object.keys(this._hass?.states ?? {})
      .filter((id) => domains.includes(id.split(".")[0]))
      .sort();
    return html`
      <label>${i18n._(key)}</label>
      <select
        id="${key}"
        @change="${(e: Event) => commit((e.target as HTMLSelectElement).value)}"
      >
        <option value="" ?selected="${value === ""}">
          ${i18n._("rsato_entity_none")}
        </option>
        ${ids.map(
          (id) =>
            html`<option value="${id}" ?selected="${id === value}">
              ${id}
            </option>`,
        )}
      </select>
    `;
  }

  override renderEditor(): TemplateResult {
    if (this.is_disabled()) {
      return html``;
    }
    this._populate_entities();
    this.update_config();
    return html` <form>
      ${this._editor_common()}
      <table>
        <tr>
          <td>${this._render_option_switch("infinite_tank")}</td>
        </tr>
        <tr>
          <td>${this._render_option_switch("external_usage")}</td>
        </tr>
        <tr>
          <td>
            ${this._render_entity_picker(
              "external_usage_entity",
              RSAto.USAGE_DOMAINS,
            )}
          </td>
        </tr>
        <tr>
          <td>
            ${this._render_entity_picker("fill_entity", RSAto.FILL_DOMAINS)}
          </td>
        </tr>
        <tr>
          <td>
            ${this._render_entity_picker(
              "stop_fill_entity",
              RSAto.FILL_DOMAINS,
            )}
          </td>
        </tr>
      </table>
    </form>`;
  }
}
