/**
 * VSON fish feeder view (hacked feeder running ESPHome).
 *
 * Left: the feeder, drawn from four pictures (trap open or closed, reserve
 * full or empty), with pellets falling while the trap is open. The uptime,
 * the restart button, the feedings of the day and the low reserve warning
 * are drawn on the faces of the feeder, deformed to follow them.
 * Right: the next feeding, the five feeding slots (hour and portions, both
 * editable in place) and the button giving one portion now.
 *
 * The entities carry no translation key (ESPHome): they are found by the
 * end of their entity id, see utils/fish_feeder.ts.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//

import { html, TemplateResult } from "lit";

import type { HassConfig } from "../../../types/index";

import i18n from "../../../translations/myi18n";
import { RSDevice } from "../../device";

import {
  VSON_FEEDER_MAX_PORTIONS,
  VSON_FEEDER_MODEL,
} from "../../../utils/constants";
import {
  clamp_portions,
  daily_portions,
  day_feedings,
  feeder_slots,
  format_time,
  next_feeding,
  parse_time,
  resolve_feeder_entities,
  shadowed_slots,
  apply_pending,
  pending_settled,
  split_delay,
  split_uptime,
  time_value,
  watched_entities,
  type FeederEntities,
  type PendingValues,
  type FeederSlot,
} from "../../../utils/fish_feeder";

import style_common from "../../../utils/common.styles";
import style_animations from "../../../utils/animations.styles";
import style_vsonfeeder from "./vsonfeeder.styles";
import { config } from "./vsonfeeder.mapping";

//----------------------------------------------------------------------------//

/** Pellets drawn under the trap while it is open. */
const PELLETS = 9;

/**
 * Delay before portions are sent: clicks on - and + within it are gathered
 * into a single call, so a few quick clicks land on the right value.
 */
const SEND_DELAY_MS = 350;

/**
 * How long a value set by the user is shown when the feeder does not
 * report it back (unreachable, refused...): then the reported one wins.
 */
const PENDING_TIMEOUT_MS = 20_000;

/** How long the restart button stays armed after a first tap. */
const RESTART_ARM_MS = 3000;

export class VSONFeeder extends RSDevice {
  static override styles = [style_common, style_animations, style_vsonfeeder];

  // Entities found, kept until the entity registry changes
  private _entities: FeederEntities | null = null;
  private _entities_registry: unknown = null;
  private _entities_devices: string = "";

  // State objects the view was last drawn from
  private _watched: unknown[] = [];

  // Restart button armed by a first tap, and the timer disarming it
  private _restart_armed: boolean = false;
  private _restart_timer: ReturnType<typeof setTimeout> | null = null;

  // Values set by the user and not reported back yet (see apply_pending()),
  // when each was set, and the portions waiting to be sent
  private _pending: PendingValues = {};
  private _pending_since: Record<string, number> = {};
  private _send_timers: Record<string, ReturnType<typeof setTimeout>> = {};

  // Refreshes the countdown to the next feeding every minute
  private _clock: ReturnType<typeof setInterval> | null = null;

  /**
   * Constructor
   */
  constructor() {
    super();
    this.initial_config = config as any;
  }

  /**
   * The model Home Assistant reports is the project name of the firmware,
   * so the options are stored under the model of the mapping.
   * @return the key of this device in `conf`
   */
  override config_model(): string {
    return VSON_FEEDER_MODEL;
  }

  /**
   * The entities of this device carry no translation key (ESPHome): they
   * are found by the end of their entity id instead, see _get_entities().
   */
  override _populate_entities(): void {}

  /**
   * The feeder has no on/off switch: it is on while Home Assistant reaches
   * it (the trap sensor is available).
   * @return true when the controller answers
   */
  override is_on(): boolean {
    // Called by the base constructor, before the fields exist
    if (!this._hass) return false;
    const trap = this._get_entities().roles.trap;
    const state = trap ? this._hass?.states?.[trap]?.state : undefined;
    return state !== undefined && state !== "unavailable";
  }

  override connectedCallback(): any {
    const done = super.connectedCallback();
    if (this._clock === null) {
      this._clock = setInterval(() => this.requestUpdate(), 60_000);
    }
    return done;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._clock !== null) {
      clearInterval(this._clock);
      this._clock = null;
    }
    if (this._restart_timer !== null) {
      clearTimeout(this._restart_timer);
      this._restart_timer = null;
      this._restart_armed = false;
    }
    // Portions still waiting are sent now rather than lost
    for (const entity_id of Object.keys(this._send_timers)) {
      this._send_portions(entity_id);
    }
  }

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
   * Entities of the feeder. Looking them up walks the whole entity
   * registry, so the result is kept until the registry changes.
   * @return the entities found
   */
  private _get_entities(): FeederEntities {
    const registry = this._hass?.entities;
    // The device may be given after the hass object (see create_device())
    const devices = this._device_ids().join(",");
    if (
      !this._entities ||
      this._entities_registry !== registry ||
      this._entities_devices !== devices
    ) {
      this._entities = resolve_feeder_entities(this._hass, this._device_ids());
      this._entities_registry = registry;
      this._entities_devices = devices;
    }
    return this._entities;
  }

  /**
   * Draw the view again when one of the states it reads changes.
   * @param obj: the new hass states
   */
  override _setting_hass(obj: HassConfig): void {
    super._setting_hass(obj);
    if (this.isEditorMode) {
      return;
    }
    const settled = this._settle_pending(obj);
    const watched = watched_entities(this._get_entities()).map(
      (entity_id) => obj.states?.[entity_id],
    );
    const same =
      watched.length === this._watched.length &&
      watched.every((state, pos) => state === this._watched[pos]);
    if (!same || settled || this.to_render) {
      this._watched = watched;
      this.requestUpdate();
    }
  }

  /**
   * Forget the values the feeder now reports, and the ones it never did.
   * A value still waiting to be sent is kept.
   * @param hass: the new hass object
   * @return true when a value was forgotten
   */
  private _settle_pending(hass: HassConfig): boolean {
    let changed = false;
    const now = Date.now();
    for (const [entity_id, value] of Object.entries(this._pending)) {
      if (this._send_timers[entity_id] !== undefined) continue;
      // Always set along with the value, see _set_pending()
      const since = this._pending_since[entity_id] as number;
      if (
        pending_settled(hass, entity_id, value) ||
        now - since > PENDING_TIMEOUT_MS
      ) {
        delete this._pending[entity_id];
        delete this._pending_since[entity_id];
        changed = true;
      }
    }
    return changed;
  }

  /**
   * Remember a value the user has set, until the feeder reports it.
   * @param entity_id: the entity
   * @param value: the portions, or the minutes since midnight
   */
  private _set_pending(entity_id: string, value: number): void {
    this._pending = { ...this._pending, [entity_id]: value };
    this._pending_since[entity_id] = Date.now();
    this.requestUpdate();
  }

  /**
   * State of an entity of a role.
   * @param role: the role
   * @return its state, or undefined when the entity is not found
   */
  private _role_state(role: keyof FeederEntities["roles"]): string | undefined {
    const entity_id = this._get_entities().roles[role];
    return entity_id ? this._hass?.states?.[entity_id]?.state : undefined;
  }

  /**
   * Call a Home Assistant action on an entity.
   * @param domain: the domain of the action
   * @param service: the action
   * @param entity_id: the target entity
   * @param data: extra data
   */
  private _call(
    domain: string,
    service: string,
    entity_id: string | undefined,
    data: Record<string, unknown> = {},
  ): void {
    if (!this._hass || !entity_id) return;
    this._hass.callService(domain, service, { entity_id, ...data });
  }

  /**
   * Give one portion now.
   */
  private _feed_now(): void {
    this._call("switch", "turn_on", this._get_entities().roles.feed);
  }

  /**
   * Set the hour of a slot.
   * @param slot: the slot
   * @param hhmm: the new hour, as the time input gives it
   */
  private _set_time(slot: FeederSlot, hhmm: string): void {
    const value = time_value(hhmm);
    if (value === null || !slot.time_entity) return;
    // Shown at once: the round trip to the feeder takes a while
    this._set_pending(slot.time_entity, parse_time(value) as number);
    this._call("time", "set_value", slot.time_entity, { time: value });
  }

  /**
   * Set the portions of a slot. The new value is shown at once, and sent
   * once the clicks stop (see SEND_DELAY_MS).
   * @param slot: the slot, with the values the user has already set
   * @param portions: the new number of portions
   */
  private _set_portions(slot: FeederSlot, portions: number): void {
    const value = clamp_portions(portions);
    const entity_id = slot.portions_entity;
    if (value === slot.portions || !entity_id) return;
    this._set_pending(entity_id, value);
    const timer = this._send_timers[entity_id];
    if (timer !== undefined) clearTimeout(timer);
    this._send_timers[entity_id] = setTimeout(
      () => this._send_portions(entity_id),
      SEND_DELAY_MS,
    );
  }

  /**
   * Send the portions set for a slot.
   * @param entity_id: the `number` entity of the slot
   */
  private _send_portions(entity_id: string): void {
    const timer = this._send_timers[entity_id];
    if (timer !== undefined) clearTimeout(timer);
    delete this._send_timers[entity_id];
    const value = this._pending[entity_id];
    if (value === undefined) return;
    // The wait for the feeder starts now
    this._pending_since[entity_id] = Date.now();
    this._call("number", "set_value", entity_id, { value });
  }

  /**
   * Open the more-info dialog of an entity.
   * @param entity_id: the entity
   */
  private _more_info(entity_id: string | undefined): void {
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
   * @param open: the trap is open
   * @param empty: the reserve is low
   * @return the URL of the picture
   */
  private _picture(open: boolean, empty: boolean): string {
    const images = (this.config as any)?.images ?? config.images;
    const key = `${open ? "open" : "closed"}_${empty ? "empty" : "full"}`;
    return String(images[key]);
  }

  /**
   * The feeder, with its status chips and the falling pellets.
   */
  private _render_stage(
    open: boolean,
    feeding: boolean,
    empty: boolean,
    online: boolean,
    slots: FeederSlot[],
  ): TemplateResult {
    const roles = this._get_entities().roles;
    return html`
      <div class="ff-stage ${online ? "" : "offline"}">
        ${this._render_elements(true)}
        <div class="ff-pic">
          <img
            class="ff-img"
            alt="${this.device?.name ?? ""}"
            src="${this._picture(open, empty)}"
            @click="${() => this._more_info(roles.trap)}"
          />
          ${
            open || feeding
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
          ${this._render_uptime(online)} ${this._render_restart(online)}
          ${this._render_schedule(slots)}
          ${
            empty
              ? html`<div
                  class="ff-face top ff-food-alert blink"
                  title="${i18n._("feeder_food_low")}"
                  @click="${() => this._more_info(roles.food_low)}"
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
   * Uptime of the controller, printed on the front face like a display.
   * @param online: the controller answers
   */
  private _render_uptime(online: boolean): TemplateResult | string {
    const entity_id = this._get_entities().roles.uptime;
    if (!entity_id) return "";
    const parts = online
      ? split_uptime(this._hass?.states?.[entity_id]?.state)
      : null;
    const text =
      parts === null
        ? "--"
        : parts.d > 0
          ? i18n._("feeder_uptime_dh", { d: parts.d, h: parts.h })
          : i18n._("feeder_uptime_hm", {
              h: parts.h,
              m: String(parts.m).padStart(2, "0"),
            });
    return html`<div class="ff-face front ff-uptime-label">
        ${i18n._("feeder_uptime_label")}
      </div>
      <div
        class="ff-face front ff-uptime"
        title="${i18n._("feeder_uptime")}"
        @click="${() => this._more_info(entity_id)}"
      >
        <ha-icon icon="mdi:timer-outline"></ha-icon><span>${text}</span>
      </div>`;
  }

  /**
   * Feedings of the day, printed on the right face: those gone by struck
   * through, the next one standing out.
   * @param slots: the feeding slots
   */
  private _render_schedule(slots: FeederSlot[]): TemplateResult | string {
    const feedings = day_feedings(slots, new Date());
    if (!feedings.length) return "";
    return html`<div class="ff-face ff-schedule">
      ${feedings.map(
        (feeding) =>
          html`<span class="${feeding.state}"
            >${format_time(feeding.minutes)}</span
          >`,
      )}
    </div>`;
  }

  /**
   * Restart button, on the right face. A first tap arms it, a second one
   * within a few seconds restarts the controller.
   * @param online: the controller answers
   */
  private _render_restart(online: boolean): TemplateResult | string {
    const entity_id = this._get_entities().roles.restart;
    if (!entity_id) return "";
    return html`<button
      class="ff-face right ff-restart ${this._restart_armed ? "armed" : ""}"
      title="${i18n._(
        this._restart_armed ? "feeder_restart_confirm" : "feeder_restart",
      )}"
      ?disabled="${!online}"
      @click="${() => this._restart(entity_id)}"
    >
      <ha-icon icon="mdi:restart"></ha-icon>
    </button>`;
  }

  /**
   * Arm the restart button, or restart the controller when it is armed.
   * @param entity_id: the restart switch
   */
  private _restart(entity_id: string): void {
    if (this._restart_timer !== null) {
      clearTimeout(this._restart_timer);
      this._restart_timer = null;
    }
    if (this._restart_armed) {
      this._restart_armed = false;
      this._call("switch", "turn_on", entity_id);
    } else {
      this._restart_armed = true;
      this._restart_timer = setTimeout(() => {
        this._restart_armed = false;
        this._restart_timer = null;
        this.requestUpdate();
      }, RESTART_ARM_MS);
    }
    this.requestUpdate();
  }

  /**
   * The next feeding, or why there is none.
   */
  private _render_next(slots: FeederSlot[]): TemplateResult {
    const next = next_feeding(slots, new Date());
    if (next === null) {
      return html`<div class="ff-next none">
        <ha-icon icon="mdi:calendar-remove-outline"></ha-icon>
        <div>${i18n._("feeder_no_slot")}</div>
      </div>`;
    }
    const { h, m } = split_delay(next.in_minutes);
    const delay =
      next.in_minutes === 0
        ? i18n._("feeder_now")
        : h > 0
          ? i18n._("feeder_in_hm", { h, m: String(m).padStart(2, "0") })
          : i18n._("feeder_in_m", { m });
    return html`<div class="ff-next">
      <ha-icon icon="mdi:clock-outline"></ha-icon>
      <div class="ff-next-text">
        <div class="ff-next-label">${i18n._("feeder_next")}</div>
        <div class="ff-next-time">
          ${format_time(next.slot.minutes as number)}
          <span class="ff-next-delay">${delay}</span>
        </div>
      </div>
      <div class="ff-next-portions">
        ${next.slot.portions}
        <ha-icon icon="mdi:shaker-outline"></ha-icon>
      </div>
    </div>`;
  }

  /**
   * One feeding slot: its hour and its portions.
   */
  private _render_slot(
    slot: FeederSlot,
    is_next: boolean,
    shadowed: boolean,
  ): TemplateResult {
    const off = !slot.active;
    const disabled = slot.unavailable;
    return html`
      <div
        class="ff-slot ${off ? "off" : ""} ${is_next ? "next" : ""} ${
          shadowed ? "shadowed" : ""
        }"
        title="${shadowed ? i18n._("feeder_slot_shadowed") : ""}"
      >
        <span class="ff-slot-index">${slot.index}</span>
        <input
          class="ff-slot-time ${
            slot.time_entity && slot.time_entity in this._pending
              ? "pending"
              : ""
          }"
          type="time"
          .value="${slot.minutes === null ? "" : format_time(slot.minutes)}"
          ?disabled="${disabled}"
          @change="${(e: Event) =>
            this._set_time(slot, (e.currentTarget as HTMLInputElement).value)}"
        />
        <div class="ff-portions">
          <button
            class="ff-step"
            ?disabled="${disabled || slot.portions <= 0}"
            @click="${() => this._set_portions(slot, slot.portions - 1)}"
            aria-label="-"
          >
            <ha-icon icon="mdi:minus"></ha-icon>
          </button>
          <span
            class="ff-portions-value ${
              slot.portions_entity && slot.portions_entity in this._pending
                ? "pending"
                : ""
            }"
            >${slot.portions}</span
          >
          <button
            class="ff-step"
            ?disabled="${disabled || slot.portions >= VSON_FEEDER_MAX_PORTIONS}"
            @click="${() => this._set_portions(slot, slot.portions + 1)}"
            aria-label="+"
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render the view.
   */
  override render(): TemplateResult {
    // render() fully overrides RSDevice.render(), so the editor-mode branch
    // has to be reproduced here.
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
    const open = this._role_state("trap") === "on";
    const feeding = this._role_state("feed") === "on";
    const empty = this._role_state("food_low") === "on";
    // What the user has just set is shown before the feeder reports it
    const slots = apply_pending(
      feeder_slots(this._hass, entities),
      this._pending,
    );
    const next = next_feeding(slots, new Date());
    const shadowed = shadowed_slots(slots);
    const total = daily_portions(slots);

    return html`
      <div class="ff-root">
        ${this._render_stage(open, feeding, empty, online, slots)}
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
          ${this._render_next(slots)}
          <div class="ff-slots-head">
            <span>${i18n._("feeder_slots")}</span>
            <span>${i18n._("feeder_portions")}</span>
          </div>
          <div class="ff-slots">
            ${slots.map((slot) =>
              this._render_slot(
                slot,
                next?.slot.index === slot.index,
                shadowed.includes(slot.index),
              ),
            )}
          </div>
          <div class="ff-total">
            ${i18n._("feeder_daily_total", { n: total })}
          </div>
          <button
            class="ff-feed ${feeding ? "running" : ""}"
            ?disabled="${!online || feeding || !entities.roles.feed}"
            @click="${() => this._feed_now()}"
          >
            <ha-icon icon="${feeding ? "mdi:pinwheel" : "mdi:fish"}"></ha-icon>
            ${i18n._(feeding ? "feeder_feeding" : "feeder_feed_now")}
          </button>
        </div>
      </div>
    `;
  }
}

export default VSONFeeder;
