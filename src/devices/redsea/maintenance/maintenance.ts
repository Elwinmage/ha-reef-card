/**
 * Maintenance overview.
 *
 * Presents every maintenance task exposed by ha-reefbeat-component as if the
 * whole maintenance subsystem were a single device:
 *
 *   - one progress bar per task showing how much of the interval elapsed,
 *   - a color change (green / orange / red) driven by the remaining days,
 *     with a "+X days" label once the deadline is passed,
 *   - sorting by equipment or by deadline,
 *   - an optional one-click reset calling `button.press` on the task entity.
 *
 * The element is a pseudo device: it has no HA device of its own, it scans
 * hass.states for the `reef_role: maint_*` marker (see utils/maintenance.ts).
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//

import { html, TemplateResult } from "lit";
import { state } from "lit/decorators.js";

import type {
  HassConfig,
  MaintenanceItem,
  MaintenanceSort,
} from "../../../types/index";

import i18n from "../../../translations/myi18n";
import { RSDevice } from "../../device";

import {
  collect_maintenance_items,
  group_by_device,
  maintenance_counters,
  maintenance_signature,
  sort_maintenance_items,
} from "../../../utils/maintenance";

import style_maintenance from "./maintenance.styles";
import {
  config,
  default_options,
  type MaintenanceViewOptions,
} from "./maintenance.mapping";

//----------------------------------------------------------------------------//

export class RSMaintenance extends RSDevice {
  static override styles = [style_maintenance];

  /**
   * Marker used by the card to detect that the current element already is the
   * maintenance overview, so it is not rebuilt (and its sort state lost) on
   * every render.
   */
  public readonly is_maintenance: boolean = true;

  // Pseudo device: no HA device backs this element.
  device = { model: "MAINTENANCE", name: "", elements: null };

  @state()
  private _sort: MaintenanceSort = default_options.sort;

  @state()
  private _hide_ok: boolean = default_options.hide_ok;

  // entity_id of the task whose interval editor is currently expanded.
  @state()
  private _editing: string | null = null;

  // Signature of the last rendered data set, used to skip useless re-renders.
  private _signature: string | null = null;

  // True once the user config has been applied to the internal state.
  private _options_applied: boolean = false;

  /**
   * Constructor
   */
  constructor() {
    super();
    this.initial_config = config as any;
  }

  /**
   * No HA device is attached to this pseudo device, so there is nothing to
   * populate. Entities are resolved dynamically from hass.states instead.
   */
  override _populate_entities(): void {}

  /**
   * Merge the user configuration with the defaults.
   * @return the effective view options
   */
  private _read_options(): MaintenanceViewOptions {
    const user = (this.user_config as any)?.maintenance ?? {};
    const sort: MaintenanceSort =
      user.sort === "due" || user.sort === "device"
        ? user.sort
        : default_options.sort;
    const ratio = Number(user.warning_ratio);
    return {
      sort,
      hide_ok:
        typeof user.hide_ok === "boolean"
          ? user.hide_ok
          : default_options.hide_ok,
      warning_ratio:
        Number.isFinite(ratio) && ratio > 0 && ratio < 1
          ? ratio
          : default_options.warning_ratio,
      show_reset:
        typeof user.show_reset === "boolean"
          ? user.show_reset
          : default_options.show_reset,
      show_notify:
        typeof user.show_notify === "boolean"
          ? user.show_notify
          : default_options.show_notify,
      show_interval:
        typeof user.show_interval === "boolean"
          ? user.show_interval
          : default_options.show_interval,
    };
  }

  /**
   * Store the new hass states and re-render only when the maintenance data
   * actually changed. The card pushes a new hass object on every state change
   * of the whole installation, which would otherwise repaint the list
   * constantly.
   * @param obj: the new hass states
   */
  override _setting_hass(obj: HassConfig): void {
    this._hass = obj;
    const options = this._read_options();
    const signature = maintenance_signature(
      collect_maintenance_items(obj, { warning_ratio: options.warning_ratio }),
    );
    if (signature !== this._signature) {
      this._signature = signature;
      this.requestUpdate();
    }
  }

  /**
   * Change the sort mode.
   * @param mode: the requested sort mode
   */
  private _set_sort(mode: MaintenanceSort): void {
    if (this._sort !== mode) {
      this._sort = mode;
      this.requestUpdate();
    }
  }

  /**
   * Toggle the "hide up to date tasks" filter.
   */
  private _toggle_hide_ok(): void {
    this._hide_ok = !this._hide_ok;
    this.requestUpdate();
  }

  /**
   * Open the Home Assistant more-info dialog of a task.
   * @param item: the maintenance item to detail
   */
  private _more_info(item: MaintenanceItem): void {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: item.entity_id },
      }),
    );
  }

  /**
   * Mark a maintenance task as done by pressing its button entity.
   * @param item: the maintenance item to reset
   */
  private _mark_done(item: MaintenanceItem): void {
    this._hass?.callService("button", "press", {
      entity_id: item.entity_id,
    });
  }

  /**
   * Mute/unmute the overdue alerts of a task by toggling its companion
   * notification switch. Does nothing when the switch is not exposed (older
   * integration version).
   * @param item: the maintenance item
   */
  private _toggle_notify(item: MaintenanceItem): void {
    if (!item.notify_entity_id) {
      return;
    }
    this._hass?.callService("switch", "toggle", {
      entity_id: item.notify_entity_id,
    });
  }

  /**
   * Expand/collapse the interval editor of a task. Only one row at a time
   * stays open, so the list does not turn into a wall of sliders.
   * @param item: the maintenance item
   */
  private _toggle_editor(item: MaintenanceItem): void {
    this._editing = this._editing === item.entity_id ? null : item.entity_id;
    this.requestUpdate();
  }

  /**
   * Write a new interval by setting the companion number entity. The value
   * is expressed in the entity's display unit; the integration converts it
   * back to days before storing.
   * @param item: the maintenance item
   * @param value: the new interval, in `item.interval_unit`
   */
  private _set_interval(item: MaintenanceItem, value: number): void {
    if (!item.interval_entity_id || !Number.isFinite(value)) {
      return;
    }
    // Stay inside the bounds advertised by the number entity.
    let v = value;
    if (item.interval_min !== null) {
      v = Math.max(item.interval_min, v);
    }
    if (item.interval_max !== null) {
      v = Math.min(item.interval_max, v);
    }
    this._hass?.callService("number", "set_value", {
      entity_id: item.interval_entity_id,
      value: v,
    });
  }

  /**
   * Build the parenthesised pump descriptor appended to a ReefRun sub-device
   * name, e.g. "RSRUN-1234 pump 1" -> " (Retour 12000)".
   *
   * The type is localized (the integration translates the very same enum),
   * and only the trailing figure of the model is kept: the "return-" /
   * "rsk-" prefixes are either redundant with the type or cryptic.
   * @param type: the raw `type` sensor state
   * @param model: the raw `model` sensor state
   * @return the suffix including surrounding parentheses, or "" when unknown
   */
  private _pump_suffix(type: string | null, model: string | null): string {
    const parts: string[] = [];

    if (type) {
      // Fall back to the raw value so a pump type added later by the
      // integration still displays something useful instead of the
      // "translation string not found" placeholder.
      const key = `pump_type_${type}`;
      parts.push(i18n.hasTranslation(key) ? i18n._(key) : type);
    }

    if (model) {
      const figure = model.match(/(\d+)\s*$/);
      parts.push(figure ? figure[1]! : model);
    }

    return parts.length > 0 ? ` (${parts.join(" ")})` : "";
  }

  /**
   * Full display name of a device, pump descriptor included.
   * @param name: the Home Assistant device name
   * @param type: the raw `type` sensor state
   * @param model: the raw `model` sensor state
   * @return the label shown in group headers and row subtitles
   */
  private _device_label(
    name: string,
    type: string | null,
    model: string | null,
  ): string {
    return `${name}${this._pump_suffix(type, model)}`;
  }

  /**
   * Localized name of an interval unit.
   * @param unit: the unit reported by the number entity
   * @return the translated unit label
   */
  private _unit_label(unit: string | null): string {
    switch (unit) {
      case "days":
        return i18n._("unit_days");
      case "weeks":
        return i18n._("unit_weeks");
      case "months":
        return i18n._("unit_months");
      default:
        return "";
    }
  }

  /**
   * Format the remaining time of a task.
   * @param item: the maintenance item
   * @return the label displayed on the right of the row
   */
  private _remaining_label(item: MaintenanceItem): string {
    if (item.days_left === null) {
      return i18n._("maintenance_never_done");
    }
    if (item.days_left < 0) {
      return `+${item.overdue_days} ${i18n._("days_short")}`;
    }
    if (item.days_left === 0) {
      return i18n._("maintenance_today");
    }
    return `${item.days_left} ${i18n._("days_short")}`;
  }

  /**
   * Build the accessible title of a row (native browser tooltip).
   * @param item: the maintenance item
   * @return the tooltip text
   */
  private _row_title(item: MaintenanceItem): string {
    const device = this._device_label(
      item.device_name,
      item.pump_type,
      item.pump_model,
    );
    const parts: string[] = [`${device} - ${item.name}`];
    if (item.interval_days > 0) {
      parts.push(
        `${i18n._("maintenance_interval")}: ${item.interval_days} ${i18n._("days_short")}`,
      );
    }
    if (item.last_reset) {
      const date = new Date(item.last_reset);
      if (!Number.isNaN(date.getTime())) {
        parts.push(
          `${i18n._("maintenance_last_reset")}: ${date.toLocaleDateString()}`,
        );
      }
    }
    return parts.join("\n");
  }

  /**
   * Render the counters shown next to the title.
   * @param items: the visible maintenance items
   */
  private _render_counters(items: MaintenanceItem[]): TemplateResult {
    const counters = maintenance_counters(items);
    const badges: TemplateResult[] = [];

    if (counters.overdue > 0) {
      badges.push(
        html`<span class="maint-badge overdue"
          >${counters.overdue} ${i18n._("maintenance_overdue")}</span
        >`,
      );
    }
    if (counters.warning > 0) {
      badges.push(
        html`<span class="maint-badge warning"
          >${counters.warning} ${i18n._("maintenance_due_soon")}</span
        >`,
      );
    }
    if (counters.never > 0) {
      badges.push(
        html`<span class="maint-badge never"
          >${counters.never} ${i18n._("maintenance_never_done")}</span
        >`,
      );
    }
    if (badges.length === 0 && counters.total > 0) {
      badges.push(
        html`<span class="maint-badge ok"
          >${i18n._("maintenance_all_ok")}</span
        >`,
      );
    }

    return html`<div class="maint-counters">${badges}</div>`;
  }

  /**
   * Render the sort selector and the filter toggle.
   */
  private _render_toolbar(): TemplateResult {
    return html`
      <div class="maint-toolbar">
        <div class="maint-sort">
          <button
            id="sort-device"
            class="${this._sort === "device" ? "active" : ""}"
            @click="${() => this._set_sort("device")}"
          >
            ${i18n._("sort_by_equipment")}
          </button>
          <button
            id="sort-due"
            class="${this._sort === "due" ? "active" : ""}"
            @click="${() => this._set_sort("due")}"
          >
            ${i18n._("sort_by_due_date")}
          </button>
        </div>
        <label class="maint-filter">
          <input
            id="hide-ok"
            type="checkbox"
            .checked="${this._hide_ok}"
            @change="${() => this._toggle_hide_ok()}"
          />
          ${i18n._("maintenance_hide_ok")}
        </label>
      </div>
    `;
  }

  /**
   * Render a single maintenance task row.
   * @param item: the maintenance item
   * @param options: the effective view options
   * @param with_device: true to display the device name under the task name
   */
  private _render_row(
    item: MaintenanceItem,
    options: MaintenanceViewOptions,
    with_device: boolean,
  ): TemplateResult {
    // Overdue tasks always show a full bar, never-reset ones an empty one.
    const fill = item.status === "overdue" ? 100 : item.percent;

    return html`
      <div class="maint-entry">
        <div
          class="maint-row ${item.notify ? "" : "muted"}"
          title="${this._row_title(item)}"
        >
          ${item.icon
            ? html`<ha-icon class="maint-icon" icon="${item.icon}"></ha-icon>`
            : html`<ha-icon
                class="maint-icon"
                icon="mdi:wrench-check"
              ></ha-icon>`}
          <div
            class="maint-body"
            @click="${() => this._more_info(item)}"
            @keydown="${(e: KeyboardEvent) => {
              if (e.key === "Enter") this._more_info(item);
            }}"
          >
            <div class="maint-line">
              <span class="maint-name">
                ${item.name}
                ${with_device
                  ? html`<span class="maint-device">
                      -
                      ${this._device_label(
                        item.device_name,
                        item.pump_type,
                        item.pump_model,
                      )}</span
                    >`
                  : ""}
              </span>
              <span class="maint-remaining ${item.status}">
                ${this._remaining_label(item)}
              </span>
            </div>
            <div class="maint-bar">
              <div
                class="maint-bar-fill ${item.status}"
                style="width: ${fill}%"
              ></div>
            </div>
          </div>
          ${options.show_interval && item.interval_entity_id
            ? html`<button
                class="maint-tune ${this._editing === item.entity_id
                  ? "open"
                  : ""}"
                title="${i18n._("maintenance_edit_interval")}"
                @click="${() => this._toggle_editor(item)}"
              >
                <ha-icon icon="mdi:calendar-edit"></ha-icon>
              </button>`
            : ""}
          ${options.show_notify && item.notify_entity_id
            ? html`<button
                class="maint-bell ${item.notify ? "on" : "off"}"
                title="${item.notify
                  ? i18n._("maintenance_mute")
                  : i18n._("maintenance_unmute")}"
                @click="${() => this._toggle_notify(item)}"
              >
                <ha-icon
                  icon="${item.notify ? "mdi:bell-ring" : "mdi:bell-off"}"
                ></ha-icon>
              </button>`
            : ""}
          ${options.show_reset
            ? html`<button
                class="maint-done"
                title="${i18n._("maintenance_mark_done")}"
                @click="${() => this._mark_done(item)}"
              >
                <ha-icon icon="mdi:check"></ha-icon>
              </button>`
            : ""}
        </div>
        ${this._editing === item.entity_id
          ? this._render_interval_editor(item)
          : ""}
      </div>
    `;
  }

  /**
   * Render the inline interval editor of one task.
   * The slider works in the unit advertised by the number entity (days,
   * weeks or months); the integration converts back to days on write.
   * @param item: the maintenance item being edited
   */
  private _render_interval_editor(item: MaintenanceItem): TemplateResult {
    const unit = this._unit_label(item.interval_unit);
    const min = item.interval_min ?? 1;
    const max = item.interval_max ?? 365;
    const value = item.interval_value ?? min;

    return html`
      <div class="maint-editor">
        <div class="maint-editor-line">
          <span class="maint-editor-label">
            ${i18n._("maintenance_every")}
          </span>
          <span class="maint-editor-value">${value} ${unit}</span>
        </div>
        <div class="maint-editor-line">
          <span class="maint-editor-bound">${min}</span>
          <input
            class="maint-slider"
            type="range"
            min="${min}"
            max="${max}"
            step="${item.interval_step}"
            .value="${String(value)}"
            @change="${(e: Event) =>
              this._set_interval(
                item,
                Number((e.target as HTMLInputElement).value),
              )}"
          />
          <span class="maint-editor-bound">${max}</span>
        </div>
      </div>
    `;
  }

  /**
   * Render the task list, grouped by device when sorting by equipment.
   * @param items: the sorted and filtered items
   * @param options: the effective view options
   */
  private _render_list(
    items: MaintenanceItem[],
    options: MaintenanceViewOptions,
  ): TemplateResult {
    if (items.length === 0) {
      return html`<div class="maint-empty">
        ${this._hide_ok
          ? i18n._("maintenance_all_ok")
          : i18n._("maintenance_no_task")}
      </div>`;
    }

    if (this._sort === "due") {
      return html`${items.map((item) => this._render_row(item, options, true))}`;
    }

    return html`${group_by_device(items).map(
      (group) => html`
        <div class="maint-group-title">
          ${this._device_label(
            group.device_name,
            group.pump_type,
            group.pump_model,
          )}
        </div>
        ${group.items.map((item) => this._render_row(item, options, false))}
      `,
    )}`;
  }

  /**
   * Render the whole maintenance overview.
   */
  override render(): TemplateResult {
    this.update_config();

    const options = this._read_options();
    // Apply the configured defaults once, then let the user drive the view.
    if (!this._options_applied) {
      this._sort = options.sort;
      this._hide_ok = options.hide_ok;
      this._options_applied = true;
    }

    const all = collect_maintenance_items(this._hass, {
      warning_ratio: options.warning_ratio,
    });
    const visible = this._hide_ok ? all.filter((i) => i.status !== "ok") : all;
    const sorted = sort_maintenance_items(visible, this._sort);

    return html`
      <div class="maint-root">
        <div class="maint-header">
          <div class="maint-title">
            <ha-icon icon="mdi:wrench-clock"></ha-icon>
            ${i18n._("maintenance_view")}
          </div>
          ${this._render_counters(all)}
        </div>
        ${this._render_toolbar()} ${this._render_list(sorted, options)}
      </div>
    `;
  }

  /**
   * The maintenance overview has no per-device editor options for now.
   */
  override renderEditor(): TemplateResult {
    return html`<p>${i18n._("maintenance_no_editor")}</p>`;
  }
}

export default RSMaintenance;
