/**
 * Lamps driven by a virtual ReefLED: a vertical list of thumbnails, bottom
 * right of the view. Tapping one shows that lamp's own card.
 *
 * The list comes from the `leds` attribute of the virtual lamp's
 * `linked_leds` sensor: [{hwid, name, model, g2, entry_id}, …].
 *
 * Example mapping:
 *   linked: { name: "linked_leds", type: "rsled-linked", stateObj: null,
 *             css: {...bottom right...} }
 */
import { css, html, TemplateResult } from "lit";

import { RSLedElement } from "./rsled_element";

/** One lamp linked to a virtual ReefLED, as the integration describes it. */
export interface LinkedLed {
  /** Hardware id: what the card navigates to */
  hwid: string;
  name: string;
  model?: string;
  /** Whether the lamp is a G2 (kelvin/intensity only) */
  g2?: boolean;
  /** Config entry of the lamp: the device_id of redsea services */
  entry_id?: string | null;
}

/** Thumbnail of each generation. */
export const LINKED_THUMBS = {
  g1: new URL("../../../img/redsea/RSLED/rsled_g1_thumb.png", import.meta.url),
  g2: new URL("../../../img/redsea/RSLED/rsled_g2_thumb.png", import.meta.url),
};

export class RSLedLinked extends RSLedElement {
  static override styles = css`
    :host {
      display: block;
    }
    .linked {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      width: 100%;
      max-height: 100%;
      overflow-y: auto;
      scrollbar-width: none;
    }
    .linked::-webkit-scrollbar {
      display: none;
    }
    .lamp {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      cursor: pointer;
      border-radius: 8px;
      padding: 2px 0;
      transition: background 0.2s;
    }
    .lamp:hover {
      background: rgba(127, 127, 127, 0.15);
    }
    .lamp img {
      width: 82%;
      height: auto;
      display: block;
    }
    .lamp span {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--rs-label-font, 10px);
      color: var(--secondary-text-color, #777);
    }
  `;

  /** The lamps listed, from the device. */
  lamps(): LinkedLed[] {
    return this.led?.linked?.() ?? [];
  }

  /** Re-render only when the list changes. */
  protected override signature(): string {
    return JSON.stringify(this.lamps());
  }

  /**
   * Show the card of a linked lamp.
   * @param lamp: the lamp tapped
   */
  show(lamp: LinkedLed): void {
    if (!lamp?.hwid) return;
    this.dispatchEvent(
      new CustomEvent("show-device", {
        bubbles: true,
        composed: true,
        detail: { hwid: String(lamp.hwid) },
      }),
    );
  }

  protected override _render(_style?: string): TemplateResult {
    const lamps = this.lamps();
    if (!lamps.length) return html``;
    return html`<div class="linked">
      ${lamps.map(
        (lamp) =>
          html`<div
            class="lamp"
            title="${lamp.name}${lamp.model ? ` (${lamp.model})` : ""}"
            @click=${(ev: Event) => {
              ev.stopPropagation();
              this.show(lamp);
            }}
          >
            <img
              alt="${lamp.name}"
              src="${lamp.g2 ? LINKED_THUMBS.g2 : LINKED_THUMBS.g1}"
            />
            <span>${lamp.name}</span>
          </div>`,
      )}
    </div>`;
  }
}
