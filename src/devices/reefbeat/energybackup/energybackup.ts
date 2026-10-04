/**
 * Energy backup view (reefbeatEnergyBackup).
 *
 * Draws the power flows between the mains, the battery and the pumps with
 * Power Flow Card Plus, a separate custom card: this view finds the sensors
 * of the service and the pumps of the installation, writes the
 * configuration of that card and embeds it. Nothing has to be configured
 * by hand.
 *
 * Power Flow Card Plus is not bundled: when it is not installed, the view
 * shows where to get it instead, and draws the flows as soon as the card
 * gets defined.
 *
 * The flow card is handed a copy of the hass object carrying a few states
 * that do not exist in Home Assistant (see utils/energy_backup.ts). A click
 * on one of them is redirected to the real entity behind it.
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//

import { html, TemplateResult } from "lit";

import type { HassConfig } from "../../../types/index";

import i18n from "../../../translations/myi18n";
import { RSDevice } from "../../device";

import {
  ENERGY_BACKUP_MODEL,
  POWER_FLOW_CARD_HACS_URL,
  POWER_FLOW_CARD_TAG,
  POWER_FLOW_CARD_URL,
} from "../../../utils/constants";
import {
  BACKUP_MAX_PUMPS,
  build_power_flow,
  pump_labels,
  resolve_backup_topology,
  select_backup_pumps,
  type BackupPump,
  type BackupTopology,
} from "../../../utils/energy_backup";

import style_common from "../../../utils/common.styles";
import style_animations from "../../../utils/animations.styles";
import style_energybackup from "./energybackup.styles";
import { config } from "./energybackup.mapping";

//----------------------------------------------------------------------------//

/** What the view currently shows. */
type BackupView = "install" | "no_entity" | "error" | "flow";

export class EnergyBackup extends RSDevice {
  static override styles = [style_common, style_animations, style_energybackup];

  // The Power Flow Card Plus element, built once and kept across renders
  private _flow_card: any = null;

  // Configuration last given to the flow card, to call setConfig() only
  // when it actually changed
  private _flow_signature: string | null = null;

  // Templates of the configuration last given to the flow card
  private _flow_templates: string | null = null;

  // Message of the flow card when it refuses its configuration
  private _flow_error: string | null = null;

  // Virtual entity id -> entity to open in its place
  private _aliases: Record<string, string> = {};

  // State objects the flow was last built from
  private _watched: unknown[] = [];

  // Sensors and pumps found, kept until the registries change
  private _topology: BackupTopology | null = null;
  private _topology_entities: unknown = null;
  private _topology_devices: unknown = null;

  // What render() last drew
  private _view: BackupView | null = null;

  // True once the view waits for the flow card to be defined
  private _waiting: boolean = false;

  /**
   * Constructor
   */
  constructor() {
    super();
    this.initial_config = config as any;
    // The flow card asks Home Assistant to open an entity either way,
    // depending on the node. Capture phase: the entity id has to be swapped
    // before the event reaches Home Assistant.
    for (const type of ["hass-more-info", "hass-action"]) {
      this.addEventListener(
        type,
        (e: Event) => this._redirect_virtual_entity(e as CustomEvent),
        true,
      );
    }
  }

  /**
   * The model Home Assistant reports is a free text the service may reword,
   * so the options are stored under the model of the mapping.
   * @return the key of this device in `conf`
   */
  override config_model(): string {
    return ENERGY_BACKUP_MODEL;
  }

  /**
   * The entities of this device carry no translation key (they come from
   * MQTT discovery): they are found by role instead, see _get_topology().
   */
  override _populate_entities(): void {}

  /**
   * Open the real entity when the flow card asks for a virtual one.
   * @param event: the `hass-more-info` or `hass-action` event of the flow card
   */
  private _redirect_virtual_entity(event: CustomEvent): void {
    const detail = event.detail;
    const more_info = this._aliases[detail?.entityId];
    if (more_info) {
      detail.entityId = more_info;
    }
    const action = this._aliases[detail?.config?.entity];
    if (action) {
      detail.config.entity = action;
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
   * Sensors of the service and pumps of the installation.
   *
   * Looking them up walks the whole entity registry, so the result is kept
   * until a registry changes. A lookup that did not find the battery power
   * sensor is tried again: at start-up the states, hence the roles, may
   * come after the registries.
   * @param hass: the hass object
   * @return the topology
   */
  private _get_topology(hass: HassConfig): BackupTopology {
    if (
      this._topology === null ||
      this._topology_entities !== hass.entities ||
      this._topology_devices !== hass.devices ||
      !this._topology.roles.battery_power
    ) {
      this._topology = resolve_backup_topology(hass, this._device_ids());
      this._topology_entities = hass.entities;
      this._topology_devices = hass.devices;
    }
    return this._topology;
  }

  /**
   * Pumps picked in the editor.
   * @return their hass device ids, empty when none is picked
   */
  private _selected_pumps(): string[] {
    const pumps = this.config?.pumps;
    return Array.isArray(pumps)
      ? pumps.filter((id: unknown): id is string => typeof id === "string")
      : [];
  }

  /**
   * Bring the flow card up to date with the hass states, and tell what the
   * view has to show.
   * @return the view to draw
   */
  private _sync(): BackupView {
    const hass = this._hass;
    if (!hass || !customElements.get(POWER_FLOW_CARD_TAG)) {
      return "install";
    }
    const flow = build_power_flow(
      hass,
      { id: this._device_ids()[0] ?? "", name: this.device?.name ?? "" },
      this._get_topology(hass),
      this._selected_pumps(),
    );
    if (flow.config === null) {
      return "no_entity";
    }

    // The flow card subscribes to its templates once: other pumps, hence
    // other templates, need a new element.
    const templates = JSON.stringify(
      (flow.config["entities"].individual ?? []).map(
        (node: any) => node.secondary_info?.template ?? null,
      ),
    );
    if (this._flow_card === null || templates !== this._flow_templates) {
      this._flow_card = document.createElement(POWER_FLOW_CARD_TAG);
      this._flow_card.classList.add("eb-flow");
      this._flow_templates = templates;
      this._flow_signature = null;
    }

    const signature = JSON.stringify(flow.config);
    const watched = flow.watched.map((entity_id) => hass.states[entity_id]);
    const same_states =
      watched.length === this._watched.length &&
      watched.every((state, pos) => state === this._watched[pos]);
    if (signature === this._flow_signature && same_states) {
      // Nothing the flow reads has changed
      return this._flow_error === null ? "flow" : "error";
    }

    if (signature !== this._flow_signature) {
      try {
        this._flow_card.setConfig(flow.config);
        this._flow_error = null;
      } catch (error: any) {
        this._flow_error = String(error?.message ?? error);
      }
      this._flow_signature = signature;
    }
    this._watched = watched;
    this._aliases = flow.aliases;
    if (this._flow_error !== null) {
      return "error";
    }
    // The virtual states are layered over the real ones rather than copied
    // with them: an installation holds thousands of states.
    this._flow_card.hass = {
      ...hass,
      states: Object.assign(Object.create(hass.states), flow.states),
    };
    return "flow";
  }

  /**
   * Follow the hass states: the flow card is updated in place, and the view
   * is drawn again only when what it shows changes (flow card installed,
   * sensors found...).
   * @param obj: the new hass states
   */
  override _setting_hass(obj: HassConfig): void {
    super._setting_hass(obj);
    // Nothing drawn yet, or the editor form: render() does the work
    if (this._view === null || this.isEditorMode) {
      return;
    }
    const flow_card = this._flow_card;
    if (
      this.to_render ||
      this._sync() !== this._view ||
      flow_card !== this._flow_card
    ) {
      this.requestUpdate();
    }
  }

  /**
   * Draw the view again once Power Flow Card Plus gets defined: its
   * resource may load after this card, or the user may just have
   * installed it.
   */
  private _wait_for_flow_card(): void {
    if (this._waiting) {
      return;
    }
    this._waiting = true;
    customElements.whenDefined(POWER_FLOW_CARD_TAG).then(() => {
      this._waiting = false;
      this.requestUpdate();
    });
  }

  /**
   * Panel shown in place of the flows: an icon, a title, a text and links.
   * @param icon: the icon
   * @param title: the title
   * @param text: the explanation
   * @param links: the links under it
   */
  private _render_panel(
    icon: string,
    title: string,
    text: string,
    links: TemplateResult = html``,
  ): TemplateResult {
    return html`
      <div class="eb-panel">
        <ha-icon icon="${icon}"></ha-icon>
        <div class="eb-panel-title">${title}</div>
        <div class="eb-panel-text">${text}</div>
        ${links}
      </div>
    `;
  }

  /**
   * Panel shown while Power Flow Card Plus is not installed.
   */
  private _render_install(): TemplateResult {
    return this._render_panel(
      "mdi:transmission-tower-import",
      this.device?.name ?? "",
      i18n._("energy_backup_flow_card_missing"),
      html`<div class="eb-links">
        <a
          class="eb-link primary"
          href="${POWER_FLOW_CARD_HACS_URL}"
          target="_blank"
          rel="noopener noreferrer"
          >${i18n._("energy_backup_flow_card_install")}</a
        >
        <a
          class="eb-link"
          href="${POWER_FLOW_CARD_URL}"
          target="_blank"
          rel="noopener noreferrer"
          >${i18n._("energy_backup_flow_card_page")}</a
        >
      </div>`,
    );
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
      this._view = "error";
      return html`<div class="eb-root">
        ${this._render_panel(
          "mdi:battery-off-outline",
          this.device?.name ?? "",
          i18n._("disabledInHa"),
        )}
      </div>`;
    }

    this._view = this._sync();
    let body: TemplateResult;
    switch (this._view) {
      case "install":
        this._wait_for_flow_card();
        body = this._render_install();
        break;
      case "no_entity":
        body = this._render_panel(
          "mdi:battery-unknown",
          this.device?.name ?? "",
          i18n._("energy_backup_no_entity"),
        );
        break;
      case "error":
        body = this._render_panel(
          "mdi:alert-circle-outline",
          this.device?.name ?? "",
          this._flow_error ?? "",
        );
        break;
      default:
        body = html`${this._flow_card}`;
    }

    return html`
      <div class="eb-root">${this._render_elements(true)} ${body}</div>
    `;
  }

  /**
   * Add/remove a pump from the selection and persist it.
   *
   * The change applies to the pumps currently shown rather than to the
   * stored selection: without one the first pumps found are ticked, and
   * unticking one of them has to leave the others.
   * @param pump: the pump toggled by the user
   * @param checked: the new state of its checkbox
   * @param shown: the device ids of the pumps currently shown
   */
  private _toggle_pump(
    pump: BackupPump,
    checked: boolean,
    shown: string[],
  ): void {
    const next = shown.filter((id) => id !== pump.id);
    if (checked) {
      next.push(pump.id);
    }
    this.set_config_value("pumps", next);
  }

  /**
   * Editor view: the pumps to show in the flow.
   */
  override renderEditor(): TemplateResult {
    this.update_config();
    const hass = this._hass;
    const topology = hass ? this._get_topology(hass) : null;
    const pumps = topology?.pumps ?? [];
    if (!hass || !topology || pumps.length === 0) {
      return html`<div class="eb-hint">
        ${i18n._("energy_backup_no_pump")}
      </div>`;
    }
    const selection = this._selected_pumps();
    const labels = pump_labels(hass, pumps);
    // Without a selection the flow shows the pumps the service drives:
    // tick those
    const shown = select_backup_pumps(hass, topology, selection).map(
      (pump) => pump.id,
    );
    const full = shown.length >= BACKUP_MAX_PUMPS;

    return html`
      <form class="eb-editor">
        <label>${i18n._("energy_backup_pumps")}</label>
        <div class="eb-pumps">
          ${pumps.map(
            (pump, pos) => html`
              <label class="eb-pump-option">
                <input
                  type="checkbox"
                  .checked="${shown.includes(pump.id)}"
                  ?disabled="${full && !shown.includes(pump.id)}"
                  @change="${(e: Event) =>
                    this._toggle_pump(
                      pump,
                      (e.currentTarget as HTMLInputElement).checked,
                      shown,
                    )}"
                />
                <span>${labels[pos]}</span>
                ${labels[pos] === pump.name
                  ? ""
                  : html`<span class="eb-pump-device">${pump.name}</span>`}
              </label>
            `,
          )}
        </div>
        <div class="eb-hint">
          ${selection.length === 0
            ? i18n._("energy_backup_pumps_hint")
            : html`<button
                type="button"
                class="eb-clear"
                @click="${() => this.set_config_value("pumps", [])}"
              >
                ${i18n._("energy_backup_pumps_auto")}
              </button>`}
        </div>
      </form>
    `;
  }
}

export default EnergyBackup;
