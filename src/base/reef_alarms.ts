/**
 * Common alarm of the reef: one indicator for every alarm of the aquarium.
 *
 * Green "OK" while nothing is wrong; red, with the number of alarms, as soon
 * as one is on. A tap lists the alarms in progress (a tap on one opens its
 * entity). Usable three ways:
 *
 * - its own Lovelace card, `custom:reef-alarms-card`;
 * - on an aquarium view, as a marker with the `alarms` role;
 * - inside any other card, as the `<reef-alarms>` element.
 *
 * An alarm is, by default, a binary sensor of a reef integration (redsea,
 * aquamedic, reeftank, reef_maintenance) whose device class tells a problem
 * (problem, safety, moisture: a leak, battery: low...) and which is on.
 * The configuration adds or removes entities:
 *
 *   type: custom:reef-alarms-card
 *   title: Aquarium                # optional
 *   entities:                      # more alarms, of any integration
 *     - binary_sensor.sump_float
 *   exclude:                       # alarms not to show
 *     - binary_sensor.reefdose_head_3_regulation_alarm
 *   integrations: [redsea, reeftank]   # default: the reef integrations
 *   device_classes: [problem, moisture] # default: DEFAULT_DEVICE_CLASSES
 */

//----------------------------------------------------------------------------//
//   IMPORT
//----------------------------------------------------------------------------//
import { LitElement, css, html, nothing } from "lit";

import i18n from "../translations/myi18n.js";

//----------------------------------------------------------------------------//

/** Integrations whose alarms are gathered by default. */
export const DEFAULT_INTEGRATIONS = [
  "redsea",
  "aquamedic",
  "reeftank",
  "reef_maintenance",
];

/** Device classes of a binary sensor telling something is wrong when on. */
export const DEFAULT_DEVICE_CLASSES = [
  "problem",
  "safety",
  "moisture",
  "battery",
  "gas",
  "smoke",
  "heat",
  "cold",
  "tamper",
];

/** States of an entity added by hand that mean "in alarm". */
const ALARM_STATES = ["on", "problem", "alarm", "triggered", "unsafe"];

/** Configuration of the common alarm. */
export interface AlarmsConfig {
  title?: string;
  entities?: string[];
  exclude?: string[];
  integrations?: string[];
  device_classes?: string[];
}

/** One alarm in progress. */
export interface ActiveAlarm {
  entity_id: string;
  name: string;
  device: string;
  since: string;
}

/**
 * The alarms in progress.
 * @param hass: the Home Assistant object
 * @param config: what to gather
 * @return the alarms on, the oldest first
 */
export function active_alarms(
  hass: any,
  config: AlarmsConfig = {},
): ActiveAlarm[] {
  const states: Record<string, any> = hass?.states ?? {};
  const registry: Record<string, any> = hass?.entities ?? {};
  const integrations = config.integrations ?? DEFAULT_INTEGRATIONS;
  const classes = config.device_classes ?? DEFAULT_DEVICE_CLASSES;
  const exclude = new Set(config.exclude ?? []);
  const ids = new Set<string>(config.entities ?? []);
  for (const [entity_id, entry] of Object.entries(registry)) {
    if (!entity_id.startsWith("binary_sensor.")) continue;
    if (!integrations.includes(entry?.platform)) continue;
    if (entry?.hidden || entry?.disabled_by) continue;
    const device_class = states[entity_id]?.attributes?.device_class;
    if (classes.includes(device_class)) ids.add(entity_id);
  }
  const alarms: ActiveAlarm[] = [];
  for (const entity_id of ids) {
    if (exclude.has(entity_id)) continue;
    const state = states[entity_id];
    if (!state || !ALARM_STATES.includes(String(state.state).toLowerCase()))
      continue;
    const device_id = registry[entity_id]?.device_id;
    const device = device_id ? hass?.devices?.[device_id] : null;
    alarms.push({
      entity_id,
      name: String(state.attributes?.friendly_name ?? entity_id),
      device: String(device?.name_by_user || device?.name || ""),
      since: String(state.last_changed ?? ""),
    });
  }
  // Unknown start (an entity without last_changed): after the dated ones
  const start = (alarm: ActiveAlarm) => {
    const t = Date.parse(alarm.since);
    return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
  };
  return alarms.sort((a, b) => {
    const x = start(a);
    const y = start(b);
    return x === y ? 0 : x < y ? -1 : 1;
  });
}

export class ReefAlarms extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
    .indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 14px;
      border: none;
      font: inherit;
      font-weight: 600;
      color: white;
      cursor: pointer;
      background-color: var(--success-color, #43a047);
    }
    .indicator.alarm {
      background-color: var(--error-color, #db4437);
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      50% {
        box-shadow: 0 0 0 6px rgba(219, 68, 55, 0.25);
      }
    }
    ha-icon {
      --mdc-icon-size: 18px;
    }
    dialog {
      border: none;
      border-radius: 12px;
      padding: 0;
      min-width: min(360px, 90vw);
      max-width: 90vw;
      background: var(--card-background-color, white);
      color: var(--primary-text-color);
    }
    dialog::backdrop {
      background: rgba(0, 0, 0, 0.4);
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      font-weight: 600;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }
    header button {
      border: none;
      background: none;
      font-size: 18px;
      cursor: pointer;
      color: inherit;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 4px 0;
      max-height: 60vh;
      overflow-y: auto;
    }
    li {
      padding: 8px 16px;
      cursor: pointer;
    }
    li:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }
    .device,
    .since {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .none {
      padding: 16px;
      color: var(--secondary-text-color);
    }
  `;

  static override get properties() {
    return { config: { attribute: false } };
  }

  config: AlarmsConfig = {};
  private _hass: any = null;
  // Alarms last drawn: a state update that changes none draws nothing
  private _signature: string = "";

  set hass(hass: any) {
    this._hass = hass;
    const signature = JSON.stringify(this.alarms());
    if (signature !== this._signature) {
      this._signature = signature;
      this.requestUpdate();
    }
  }

  get hass(): any {
    return this._hass;
  }

  alarms(): ActiveAlarm[] {
    return active_alarms(this._hass, this.config);
  }

  /** Show the alarms in progress (top layer: above any transformed parent). */
  open(): void {
    const dialog = this.shadowRoot?.querySelector("dialog") as any;
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  close(): void {
    const dialog = this.shadowRoot?.querySelector("dialog") as any;
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  /** Open the more-info dialog of an alarm. */
  more_info(entity_id: string): void {
    this.close();
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: entity_id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _since(since: string): string {
    const lang = this._hass?.locale?.language ?? this._hass?.language;
    const date = new Date(since);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString(lang, {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  override render() {
    const alarms = this.alarms();
    const on = alarms.length > 0;
    return html`
      <button
        class="indicator ${on ? "alarm" : "ok"}"
        title=${i18n._("alarms_title")}
        @click=${(e: Event) => {
          e.stopPropagation();
          this.open();
        }}
      >
        <ha-icon icon=${on ? "mdi:alert" : "mdi:check-circle"}></ha-icon>
        ${on ? i18n._("alarms_count", { count: alarms.length }) : i18n._("alarms_ok")}
      </button>
      <dialog @click=${(e: Event) => e.stopPropagation()}>
        <header>
          ${this.config.title || i18n._("alarms_title")}
          <button @click=${() => this.close()}>✕</button>
        </header>
        ${
          on
            ? html`<ul>
                ${alarms.map(
                  (alarm) =>
                    html`<li @click=${() => this.more_info(alarm.entity_id)}>
                      <div>${alarm.name}</div>
                      ${alarm.device ? html`<div class="device">${alarm.device}</div>` : nothing}
                      <div class="since">
                        ${i18n._("alarms_since", { date: this._since(alarm.since) })}
                      </div>
                    </li>`,
                )}
              </ul>`
            : html`<div class="none">${i18n._("alarms_none")}</div>`
        }
      </dialog>
    `;
  }
}

/** The common alarm as a Lovelace card of its own. */
export class ReefAlarmsCard extends LitElement {
  static override styles = css`
    ha-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 12px 16px;
    }
    .title {
      font-weight: 500;
    }
  `;

  private _config: AlarmsConfig = {};
  private _hass: any = null;

  setConfig(config: AlarmsConfig): void {
    this._config = { ...(config ?? {}) };
    this.requestUpdate();
  }

  set hass(hass: any) {
    this._hass = hass;
    const alarms = this.shadowRoot?.querySelector(
      "reef-alarms",
    ) as ReefAlarms | null;
    if (alarms) alarms.hass = hass;
    else this.requestUpdate();
  }

  get hass(): any {
    return this._hass;
  }

  getCardSize(): number {
    return 1;
  }

  static getStubConfig(): AlarmsConfig {
    return {};
  }

  override render() {
    return html`<ha-card>
      <span class="title">${this._config.title || i18n._("alarms_title")}</span>
      <reef-alarms .config=${this._config} .hass=${this._hass}></reef-alarms>
    </ha-card>`;
  }
}

if (!customElements.get("reef-alarms"))
  customElements.define("reef-alarms", ReefAlarms);
if (!customElements.get("reef-alarms-card"))
  customElements.define("reef-alarms-card", ReefAlarmsCard);
