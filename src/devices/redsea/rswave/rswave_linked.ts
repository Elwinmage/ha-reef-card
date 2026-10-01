/**
 * Pumps of a ReefWave group: a row across the view, between the flow and
 * the program, in the group order: the thumbnail of each pump, its name
 * under it. Tapping one shows that pump's own card; the pump of this card is
 * circled in red and cannot be tapped, a pump Home Assistant cannot reach is
 * greyed out.
 *
 * Grouping and the order of the group are set in the program editor.
 *
 * The list comes from the `waves` attribute of the `linked_waves` sensor:
 * [{hwid, name, model, entry_id, available}, …] (empty for a pump alone:
 * nothing is shown).
 *
 * Example mapping:
 *   linked: { name: "linked_waves", type: "rswave-linked", stateObj: null,
 *             css: {...under the flow...} }
 */
import { css, html, TemplateResult } from "lit";

import { RSWaveElement } from "./rswave_element";

/** Thumbnail of each model (the RSPOWER subdevice pictures). */
export const LINKED_THUMBS: Record<string, URL> = {
  RSWAVE25: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rswave25.png",
    import.meta.url,
  ),
  RSWAVE45: new URL(
    "../../../img/redsea/RSPOWER/subdevices/rswave45.png",
    import.meta.url,
  ),
};

/**
 * Thumbnail of a pump (the RSWAVE45 one for an unknown model).
 * @param model: the hardware model
 */
export function thumb_of(model?: string | null): URL {
  return LINKED_THUMBS[String(model ?? "")] ?? LINKED_THUMBS.RSWAVE45;
}

/** A pump of the group, as the integration describes it. */
export interface LinkedWave {
  hwid: string;
  name: string;
  model?: string | null;
  entry_id?: string | null;
  available?: boolean;
}

export class RSWaveLinked extends RSWaveElement {
  static override styles = css`
    :host {
      display: block;
      height: 100%;
    }
    .linked {
      display: flex;
      align-items: stretch;
      justify-content: space-around;
      gap: 4px;
      width: 100%;
      height: 100%;
    }
    .pump {
      flex: 1 1 0;
      min-width: 0;
      max-width: 34%;
      /* Thumbnail on top, taking every pixel the name leaves */
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      justify-items: center;
      align-items: center;
      padding: 2px;
      border-radius: 8px;
      box-sizing: border-box;
      cursor: pointer;
      transition: background 0.2s;
    }
    .pump:hover {
      background: rgba(127, 127, 127, 0.15);
    }
    .pump.current {
      cursor: default;
      outline: 2px solid var(--error-color, #db4437);
      outline-offset: -2px;
    }
    .pump.current:hover {
      background: none;
    }
    .pump.unavailable {
      opacity: 0.45;
      filter: grayscale(90%);
    }
    .pump img {
      width: 100%;
      height: 100%;
      min-height: 0;
      object-fit: contain;
      display: block;
    }
    .pump span {
      line-height: 1.2;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--rs-label-font, 10px);
      color: var(--secondary-text-color, #777);
    }
  `;

  // check-entities: uses linked_waves

  /** The pumps listed, from the device. */
  pumps(): LinkedWave[] {
    const waves = this.wave?.get_entity?.("linked_waves")?.attributes?.waves;
    return Array.isArray(waves) ? waves : [];
  }

  /** Hardware id of the pump whose card this is. */
  current(): string | null {
    const ident = this.wave?.device?.elements?.[0]?.identifiers?.[0];
    return Array.isArray(ident) && ident[1] ? String(ident[1]) : null;
  }

  /** Re-render only when the list changes. */
  protected override signature(): string {
    return JSON.stringify(this.pumps()) + "|" + this.current();
  }

  /**
   * Show the card of a pump of the group.
   * @param pump: the pump tapped
   */
  show(pump: LinkedWave): void {
    if (!pump?.hwid) return;
    this.dispatchEvent(
      new CustomEvent("show-device", {
        bubbles: true,
        composed: true,
        detail: { hwid: String(pump.hwid) },
      }),
    );
  }

  protected override _render(_style?: string): TemplateResult {
    const pumps = this.pumps();
    if (!pumps.length) return html``;
    const current = this.current();
    return html`<div class="linked">
      ${pumps.map((pump) => {
        const mine = pump.hwid === current;
        const cls = [
          "pump",
          mine ? "current" : "",
          pump.available === false ? "unavailable" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return html`<div
          class="${cls}"
          title="${pump.name}${pump.model ? ` (${pump.model})` : ""}"
          @click=${(ev: Event) => {
            ev.stopPropagation();
            // This pump's own card is the one shown
            if (!mine) this.show(pump);
          }}
        >
          <img alt="${pump.name}" src="${thumb_of(pump.model)}" />
          <span>${pump.name}</span>
        </div>`;
      })}
    </div>`;
  }
}
