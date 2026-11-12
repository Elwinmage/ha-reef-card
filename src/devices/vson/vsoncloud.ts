/**
 * VSON cloud feeder view (ha-vson-component, domain `vson`).
 *
 * Same look as the hacked ESPHome feeder: the feeder is drawn from four
 * pictures (trap open/closed, reserve full/empty) with pellets falling while
 * it feeds, the firmware printed on the front face, the low-food warning
 * blinking on top; the right panel carries the online state, the "feed now"
 * button and the scheduled-feeding toggle.
 *
 * The cloud exposes fewer controls than the ESPHome firmware (no per-slot
 * schedule entities), so there is no editable slot grid here. Entities are
 * found by their `reef_role` (see utils/vson_feeder.ts).
 */

import { html, TemplateResult } from "lit";

import type { HassConfig } from "../../types/index";

import i18n from "../../translations/myi18n";
import { RSDevice } from "../device";

import style_common from "../../utils/common.styles";
import style_animations from "../../utils/animations.styles";
import style_vsonfeeder from "../esphome/vsonfeeder/vsonfeeder.styles";
import style_vsoncloud from "./vsoncloud.styles";
import { config } from "./vsoncloud.mapping";
import {
  resolve_cloud_feeder_entities,
  watched_cloud_entities,
  type CloudFeederEntities,
  type CloudFeederRole,
} from "../../utils/vson_feeder";

/** Pellets drawn under the trap while it feeds. */
const PELLETS = 9;

/**
 * How long the pellets keep falling after a manual feed. The cloud has no
 * live "feeding" signal, so the animation is timed on the client.
 */
const FEEDING_MS = 4000;

export class VSONCloudFeeder extends RSDevice {
  static override styles = [
    style_common,
    style_animations,
    style_vsonfeeder,
    style_vsoncloud,
  ];

  // Entities found, kept until the entity registry changes
  private _entities: CloudFeederEntities | null = null;
  private _entities_registry: unknown = null;
  private _entities_devices: string = "";

  // State objects the view was last drawn from
  private _watched: unknown[] = [];

  // Timestamp until which the feeding animation runs, and its timer
  private _feeding_until = 0;
  private _feeding_timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.initial_config = config as any;
  }

  /**
   * The HA device model ("WP8621"/"WP8621A") names the view and keys the
   * options, so the base default is used.
   * @return the key of this device in `conf`
   */
  override config_model(): string {
    return this.device?.elements?.[0]?.model ?? "WP8621";
  }

  /** Cloud entities carry a `reef_role`, resolved in _get_entities(). */
  override _populate_entities(): void {}

  /**
   * Hass device ids behind this card device.
   * @return the ids
   */
  private _device_ids(): string[] {
    return (this.device?.elements ?? [])
      .map((el) => el?.id)
      .filter((id): id is string => !!id);
  }

  /**
   * Entities of the feeder, resolved by `reef_role`. Walking the registry is
   * kept until the registry or the devices change.
   * @return the entities found
   */
  private _get_entities(): CloudFeederEntities {
    const registry = this._hass?.entities;
    const devices = this._device_ids().join(",");
    if (
      !this._entities ||
      this._entities_registry !== registry ||
      this._entities_devices !== devices
    ) {
      this._entities = resolve_cloud_feeder_entities(
        this._hass,
        this._device_ids(),
      );
      this._entities_registry = registry;
      this._entities_devices = devices;
    }
    return this._entities;
  }

  /**
   * The feeder is online when its `online` binary sensor reads "on". Falls
   * back to "available" when no such entity is found.
   * @return true when the feeder is online
   */
  override is_on(): boolean {
    if (!this._hass) return false;
    const entity_id = this._get_entities().online;
    if (!entity_id) return true;
    const state = this._hass.states?.[entity_id]?.state;
    return state === "on";
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._feeding_timer !== null) {
      clearTimeout(this._feeding_timer);
      this._feeding_timer = null;
    }
  }

  /**
   * Redraw when a watched state changes.
   * @param obj: the new hass states
   */
  override _setting_hass(obj: HassConfig): void {
    super._setting_hass(obj);
    if (this.isEditorMode) return;
    const watched = watched_cloud_entities(this._get_entities()).map(
      (entity_id) => obj.states?.[entity_id],
    );
    const same =
      watched.length === this._watched.length &&
      watched.every((state, pos) => state === this._watched[pos]);
    if (!same || this.to_render) {
      this._watched = watched;
      this.requestUpdate();
    }
  }

  /**
   * State of a role entity.
   * @param role: the role
   * @return the state, or undefined when not found
   */
  private _role_state(role: CloudFeederRole): string | undefined {
    const entity_id = this._get_entities()[role];
    return entity_id ? this._hass?.states?.[entity_id]?.state : undefined;
  }

  /**
   * Call a Home Assistant action on a role entity.
   * @param domain: the action domain
   * @param service: the action
   * @param role: the target role
   * @param data: extra data
   */
  private _call(
    domain: string,
    service: string,
    role: CloudFeederRole,
    data: Record<string, unknown> = {},
  ): void {
    const entity_id = this._get_entities()[role];
    if (!this._hass || !entity_id) return;
    this._hass.callService(domain, service, { entity_id, ...data });
  }

  /** Give one portion now, and run the pellet animation. */
  private _feed_now(): void {
    this._call("button", "press", "feed");
    this._feeding_until = Date.now() + FEEDING_MS;
    if (this._feeding_timer !== null) clearTimeout(this._feeding_timer);
    this._feeding_timer = setTimeout(() => {
      this._feeding_timer = null;
      this.requestUpdate();
    }, FEEDING_MS);
    this.requestUpdate();
  }

  /** Toggle scheduled feeding. */
  private _toggle_schedule(): void {
    const on = this._role_state("schedule") === "on";
    this._call("switch", on ? "turn_off" : "turn_on", "schedule");
  }

  /** Force a cloud refresh. */
  private _refresh(): void {
    this._call("button", "press", "refresh");
  }

  /**
   * Open the more-info dialog of a role entity.
   * @param role: the role
   */
  private _more_info(role: CloudFeederRole): void {
    const entity_id = this._get_entities()[role];
    if (!entity_id) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: entity_id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Picture of the feeder matching the trap and the reserve.
   * @param open: the trap feeds
   * @param empty: the reserve is low
   * @return the URL of the picture
   */
  private _picture(open: boolean, empty: boolean): string {
    const images = (this.config as any)?.images ?? config.images;
    const key = `${open ? "open" : "closed"}_${empty ? "empty" : "full"}`;
    return String(images[key]);
  }

  /** The feeder, with its firmware face, food warning and falling pellets. */
  private _render_stage(
    feeding: boolean,
    empty: boolean,
    online: boolean,
  ): TemplateResult {
    return html`
      <div class="ff-stage ${online ? "" : "offline"}">
        ${this._render_elements(true)}
        <div class="ff-pic">
          <img
            class="ff-img"
            alt="${this.device?.name ?? ""}"
            src="${this._picture(feeding, empty)}"
            @click="${() => this._more_info("online")}"
          />
          ${
            feeding
              ? html`<div class="ff-pellets" aria-hidden="true">
                  ${Array.from(
                    { length: PELLETS },
                    (_, i) =>
                      html`<span
                        style="--i:${i};--x:${(i * 37) % 100}%"
                      ></span>`,
                  )}
                </div>`
              : ""
          }
          ${this._render_firmware(online)}
          ${
            empty
              ? html`<div
                  class="ff-face top ff-food-alert blink"
                  title="${i18n._("feeder_food_low")}"
                  @click="${() => this._more_info("food_shortage")}"
                >
                  <ha-icon icon="mdi:alert"></ha-icon>
                </div>`
              : ""
          }
        </div>
      </div>
    `;
  }

  /**
   * Firmware version, printed on the front face like the ESPHome uptime.
   * @param online: the feeder is online
   */
  private _render_firmware(online: boolean): TemplateResult | string {
    const entity_id = this._get_entities().firmware;
    if (!entity_id) return "";
    const state = this._hass?.states?.[entity_id]?.state;
    const text = online && state && state !== "unavailable" ? state : "--";
    return html`<div class="ff-face front ff-uptime-label">
        ${i18n._("feeder_firmware_label")}
      </div>
      <div
        class="ff-face front ff-uptime"
        title="${i18n._("feeder_firmware")}"
        @click="${() => this._more_info("firmware")}"
      >
        <ha-icon icon="mdi:chip"></ha-icon><span>${text}</span>
      </div>`;
  }

  /** Render the view. */
  override render(): TemplateResult {
    if (this.isEditorMode) {
      return this.renderEditor();
    }
    this.update_config();
    this.to_render = false;

    if (this.is_disabled()) {
      return html`<div class="ff-root disabled">
        <div class="ff-stage">
          <img
            class="ff-img"
            alt=""
            src="${this._picture(false, false)}"
            style="filter: grayscale(80%)"
          />
          <p class="disabled_in_ha">${i18n._("disabledInHa")}</p>
        </div>
      </div>`;
    }

    const entities = this._get_entities();
    const online = this.is_on();
    const empty = this._role_state("food_shortage") === "on";
    const feeding = Date.now() < this._feeding_until;
    const schedule_on = this._role_state("schedule") === "on";

    return html`
      <div class="ff-root">
        ${this._render_stage(feeding, empty, online)}
        <div class="ff-panel">
          <div class="ff-title">
            <span>${this.device?.name ?? ""}</span>
            ${
              online
                ? ""
                : html`<span class="ff-offline"
                    >${i18n._("feeder_offline")}</span
                  >`
            }
          </div>
          ${
            entities.schedule
              ? html`<button
                  class="ff-slot ${schedule_on ? "" : "off"}"
                  title="${i18n._("feeder_schedule")}"
                  @click="${() => this._toggle_schedule()}"
                >
                  <ha-icon
                    icon="${
                      schedule_on
                        ? "mdi:calendar-check"
                        : "mdi:calendar-remove-outline"
                    }"
                  ></ha-icon>
                  <span>${i18n._("feeder_schedule")}</span>
                  <span class="ff-slot-index"
                    >${i18n._(schedule_on ? "feeder_on" : "feeder_off")}</span
                  >
                </button>`
              : ""
          }
          <button
            class="ff-feed ${feeding ? "running" : ""}"
            ?disabled="${feeding || !entities.feed}"
            @click="${() => this._feed_now()}"
          >
            <ha-icon icon="${feeding ? "mdi:pinwheel" : "mdi:fish"}"></ha-icon>
            ${i18n._(feeding ? "feeder_feeding" : "feeder_feed_now")}
          </button>
          ${
            entities.refresh
              ? html`<button
                  class="ff-refresh"
                  title="${i18n._("feeder_refresh")}"
                  @click="${() => this._refresh()}"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>`
              : ""
          }
        </div>
      </div>
    `;
  }
}

export default VSONCloudFeeder;
