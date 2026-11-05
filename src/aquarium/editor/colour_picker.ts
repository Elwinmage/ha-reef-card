/**
 * Colour picker drawn inside the editor: hue, saturation and lightness
 * sliders, and a hex field.
 *
 * The browser's own picker (input type=color) opens a popup placed by the
 * browser, above or below the swatch, which hides the coral preview while
 * the colour is being chosen. This one stays in the page.
 *
 * Events (detail: { value: "#rrggbb" }):
 * - `colour-input`: while a slider moves (preview only);
 * - `colour-change`: a slider released, or a hex code entered (to save).
 */

import { LitElement, css, html } from "lit";
import { property, state } from "lit/decorators.js";
import i18n from "../../translations/myi18n";

export type HSL = [number, number, number];

const HEX_RE = /^#?([0-9a-f]{6})$/i;

/**
 * Hue (0..360), saturation and lightness (0..100) of a #rrggbb colour.
 * A grey has hue 0. Kept to 1/100: whole numbers would move a colour
 * (#e1ccbf would come back as #e2cdc1) when the picker merely opens.
 */
export function hex_to_hsl(hex: string): HSL {
  const m = HEX_RE.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0x808080;
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const r2 = (v: number) => Math.round(v * 100) / 100;
  if (d === 0) return [0, 0, r2(l * 100)];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return [r2(h), r2(s * 100), r2(l * 100)];
}

/** #rrggbb of a hue (0..360), saturation and lightness (0..100). */
export function hsl_to_hex([h, s, l]: HSL): string {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) =>
    lig - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return (
    "#" +
    [f(0), f(8), f(4)]
      .map((v) =>
        Math.round(v * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

export class ReefColourPicker extends LitElement {
  /** The colour, #rrggbb. */
  @property() value = "#808080";

  /** Sliders' position (kept apart: a grey has no hue to read back). */
  @state() private _hsl: HSL = [0, 0, 50];
  /** Last colour sent: when it comes back as `value`, the sliders stay. */
  private _sent = "";

  static styles = css`
    :host {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4px 8px;
      align-items: center;
      font-size: 0.85em;
    }
    input[type="range"] {
      width: 100%;
      margin: 0;
      height: 14px;
      border-radius: 7px;
      appearance: none;
      -webkit-appearance: none;
      background: var(--track);
      cursor: pointer;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      border: 2px solid #333;
    }
    input[type="range"]::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: white;
      border: 2px solid #333;
    }
    .hex {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .hex input {
      width: 7em;
      font-family: monospace;
    }
    .swatch {
      width: 28px;
      height: 18px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #ccc);
    }
  `;

  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("value") && this.value !== this._sent) {
      this._hsl = hex_to_hsl(this.value);
    }
  }

  /** Move one slider, and tell it. */
  private _slide(index: number, e: Event, type: string): void {
    const next = [...this._hsl] as HSL;
    next[index] = Number((e.target as HTMLInputElement).value);
    this._hsl = next;
    this._send(type);
  }

  /** A hex code typed: taken when valid, else the field shows the colour. */
  private _typed(e: Event): void {
    const field = e.target as HTMLInputElement;
    const m = HEX_RE.exec(field.value.trim());
    if (!m) {
      field.value = hsl_to_hex(this._hsl);
      return;
    }
    this._hsl = hex_to_hsl(`#${m[1]}`);
    this._send("colour-input");
    this._send("colour-change");
  }

  private _send(type: string): void {
    this._sent = hsl_to_hex(this._hsl);
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { value: this._sent },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const [h, s, l] = this._hsl;
    const tracks = [
      "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
      `linear-gradient(to right, ${hsl_to_hex([h, 0, l])}, ${hsl_to_hex([h, 100, l])})`,
      `linear-gradient(to right, #000, ${hsl_to_hex([h, s, 50])}, #fff)`,
    ];
    const sliders: [string, number, number][] = [
      ["aq_hue", h, 360],
      ["aq_saturation", s, 100],
      ["aq_lightness", l, 100],
    ];
    return html`
      ${sliders.map(
        ([label, value, max], i) =>
          html`<label for="s${i}">${i18n._(label)}</label>
            <input
              id="s${i}"
              type="range"
              min="0"
              max="${max}"
              step="any"
              .value=${String(value)}
              style="--track: ${tracks[i]}"
              @input=${(e: Event) => this._slide(i, e, "colour-input")}
              @change=${(e: Event) => this._slide(i, e, "colour-change")}
            />`,
      )}
      <span class="swatch" style="background: ${hsl_to_hex(this._hsl)}"></span>
      <span class="hex"
        ><input
          type="text"
          spellcheck="false"
          .value=${hsl_to_hex(this._hsl)}
          @change=${(e: Event) => this._typed(e)}
      /></span>
    `;
  }
}
