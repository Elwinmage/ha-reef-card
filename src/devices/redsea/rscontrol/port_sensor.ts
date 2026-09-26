/**
 * @file Mode editor of a ReefControl 12V port
 * @module devices.redsea.rscontrol.port_sensor
 *
 * A 12V port is driven like a power-center socket — On / Off / Schedule /
 * Probe — so this is the socket editor (PowerSensor) with the hub's own
 * endpoints, plus the power the port sends when on (`power_on_percent`).
 *
 * The port element hands the editor its entities under the socket keys
 * (`socket_mode`, `socket_name`) so everything PowerSensor reads works
 * unchanged. The `port_N_mode` sensor carries, as attributes:
 *   config        the whole `/ports/config` entry
 *   schedule      `{intervals: [{time, duration}]}`
 *   sensor_config the hub's probe rule for the port
 *
 * Writes, all on the hub (via redsea.request), in the order the Red Sea app
 * sends them (captured while setting up port 2 in probe mode):
 *   1. PUT  /ports/subscribe   {ports: [{number, default_state, type, uid,
 *                              sensor, …thresholds}]}         probe mode only
 *   2. POST /port/<n>/install  {type: "other"}          a new port only
 *   3. PUT  /port/<n>/schedule {intervals: [{time, duration}]}
 *        the programme in schedule mode; all day when a new port is
 *        installed, as the app does
 *   4. PUT  /ports/config      [whole entry, mode, power_on_percent]
 *        the firmware wants every field back, so the cached entry is
 *        resent with the changed ones
 * The rule fields of a water-level probe are confirmed by the capture; the
 * thresholds of the other types (is_above, value, hysteresis, trigger_op)
 * use the names of the hub's socket rules.
 * A factory-fresh port (type "unknown") refuses every write until
 * installed; "other" is any 12V device — an ATO port is installed by the
 * app's ATO kit wizard, which this editor does not replace.
 */

import { html, TemplateResult } from "lit";
import { state } from "lit/decorators.js";

import i18n from "../../../translations/myi18n";
import { PowerSensor, probeDef, TOTAL_MINUTES } from "../rspower/power_sensor";

/** Port type of any third-party 12V device, the one given on install. */
const PORT_TYPE_OTHER = "other";

/** Programme written when a port is installed: on all day, as the app does. */
const ALL_DAY = [{ time: 0, duration: 1439 }];

/** Fields of a `/ports/config` entry the firmware wants back on a write. */
const PORT_ENTRY_KEYS: readonly string[] = [
  "name",
  "type",
  "enabled",
  "power_on_percent",
  "power_detector_enabled",
  "is_btn_assigned",
];

export class PortSensor extends PowerSensor {
  /** Power sent while the port is on, in %. */
  @state() protected _power = 100;

  override connectedCallback(): void {
    const percent = Number(this._portEntry()?.power_on_percent);
    if (Number.isFinite(percent)) this._power = percent;
    super.connectedCallback();
  }

  // ── Device helpers ──────────────────────────────────────────────────────

  /** The hub the port belongs to. */
  private _hub(): any {
    return this.device?.device ?? null;
  }

  /**
   * The "controller" whose probes can drive this output: for a port, the
   * hub itself. Shaped like the power center PowerSensor was written for.
   */
  protected override _strip(): any {
    const hub = this._hub();
    if (!hub) return null;
    return {
      has_control_link: () => true,
      linked_control_hwid: () => hub.hub_hwid?.() ?? null,
      linked_control_name: () => hub.device?.name ?? "",
      linked_control_device: () => hub.device?.elements?.[0] ?? null,
    };
  }

  /** 0-based port number, as the hub's API counts them. */
  protected override _socketNum(): number {
    const n = Number(this.device?.port_id);
    return Number.isFinite(n) && n > 0 ? n - 1 : 0;
  }

  /** Cached `/ports/config` entry of the port. */
  private _portEntry(): Record<string, any> | null {
    const entry = this._entityAttr("socket_mode", "config");
    return entry && typeof entry === "object" ? entry : null;
  }

  /**
   * The port entry to write for a mode: the fields the firmware wants back,
   * from the cache, with the mode and power set.
   * @param mode: the mode to write
   */
  _entry(mode: string): Record<string, unknown> {
    const cached = this._portEntry() ?? {};
    const entry: Record<string, unknown> = {
      number: this._socketNum(),
      mode,
    };
    for (const key of PORT_ENTRY_KEYS) {
      if (key in cached) entry[key] = cached[key];
    }
    const name = this._socketName();
    if (name) entry["name"] = name;
    entry["power_on_percent"] = this._power;
    // Just installed: the cache still holds the factory type
    if (!this.is_installed()) entry["type"] = PORT_TYPE_OTHER;
    return entry;
  }

  /**
   * Whether the port has been installed. Read from its `/ports/config`
   * entry, as the integration does; missing information counts as
   * installed, so a write is never preceded by a needless install.
   * @return false only for a port the hub reports as uninstalled
   */
  is_installed(): boolean {
    const type = this._portEntry()?.type;
    return !(typeof type === "string" && type === "unknown");
  }

  /**
   * Send one request to the hub.
   * @param path: the endpoint
   * @param data: the body
   * @param method: the HTTP method
   */
  private async _request(
    path: string,
    data: unknown,
    method: string = "put",
    last: boolean = true,
  ): Promise<void> {
    // The integration shows each accepted write at once (optimistic
    // update); only the last one of a save waits for the hub to settle and
    // reads its configuration back.
    await this.hass.callService("redsea", "request", {
      device_id: this._configEntry(),
      access_path: path,
      method,
      data,
      refresh: last ? "config" : "data",
      wait: last ? 2 : 0,
    });
  }

  private _close(): void {
    this.dispatchEvent(
      new CustomEvent("quit-dialog", { bubbles: true, composed: true }),
    );
  }

  // ── Save ────────────────────────────────────────────────────────────────

  protected override async _save(): Promise<void> {
    if (!this._configEntry() || !this.hass) return;
    const number = this._socketNum();
    const installing = !this.is_installed();
    this._saving = true;
    this._saveError = null;
    try {
      // 1 — the probe rule, first as the app does
      if (this._mode === "sensor") {
        const probe = this._probeOptions[this._probeIdx];
        if (!probe) throw new Error("No probe selected");
        const def = probeDef(probe);
        const rule: Record<string, unknown> = {
          number,
          // No power center in between: the hub keeps the fallback itself
          // (every probe type has one, the water level included)
          default_state: this._fallbackOn,
          type: probe.type,
          uid: probe.uid,
          sensor: probe.sensor,
        };
        if (def.hasDirection) rule["is_above"] = this._isAbove;
        if (def.hasValue) rule["value"] = this._value;
        if (def.hasHysteresis) rule["hysteresis"] = this._hysteresis;
        if (def.hasTurnOn) rule["trigger_op"] = this._turnOn;
        await this._request(
          "/ports/subscribe",
          { ports: [rule] },
          "put",
          false,
        );
      }
      // 2 — a factory-fresh port refuses every write until installed
      if (installing) {
        await this._request(
          `/port/${number}/install`,
          { type: PORT_TYPE_OTHER },
          "post",
          false,
        );
      }
      // 3 — the programme: the one edited, or all day on a new port
      if (this._mode === "schedule") {
        const intervals = this._intervals
          .filter((iv) => iv.duration > 0)
          .sort((a, b) => a.time - b.time)
          .map((iv) => ({
            time: Math.max(0, Math.min(TOTAL_MINUTES - 1, iv.time)),
            duration: Math.max(1, iv.duration),
          }));
        await this._request(
          `/port/${number}/schedule`,
          { intervals },
          "put",
          false,
        );
      } else if (installing) {
        await this._request(
          `/port/${number}/schedule`,
          { intervals: ALL_DAY },
          "put",
          false,
        );
      }
      // 4 — the whole entry, with its mode and power
      await this._request("/ports/config", [this._entry(this._mode)]);
      this._close();
    } catch (err: any) {
      this._saveError = String(err?.message ?? err ?? "Save failed");
    } finally {
      this._saving = false;
    }
  }

  /**
   * Resume the automatic mode a manual on/off suspended: only the mode is
   * written back, the schedule or probe rule is still on the hub.
   */
  protected override async _resume(): Promise<void> {
    if (!this._configEntry() || !this.hass || !this._override) return;
    this._saving = true;
    this._saveError = null;
    try {
      await this._request("/ports/config", [this._entry(this._override.mode)]);
      this._close();
    } catch (err: any) {
      this._saveError = String(err?.message ?? err ?? "Save failed");
    } finally {
      this._saving = false;
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  /** Power sent while the port is on. */
  protected override _renderExtra(): TemplateResult {
    return html`
      <div class="sce-divider"></div>
      <div class="sce-row">
        <div class="sce-row-label">${i18n._("port_power")}</div>
        <input
          class="sce-power-range"
          type="range"
          min="0"
          max="100"
          step="1"
          style="flex:1"
          .value="${String(this._power)}"
          @input="${(e: Event) =>
            (this._power = Number((e.target as HTMLInputElement).value))}"
        />
        <span class="sce-unit">${this._power} %</span>
      </div>
    `;
  }
}
