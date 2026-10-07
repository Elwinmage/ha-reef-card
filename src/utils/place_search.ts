/**
 * Search of a place by its name, to bring the map of a GPS weather editor
 * there before the fine pick: "Maldives", "Fakarava", "Bordeaux"...
 *
 * The names are looked up with the Open-Meteo geocoding API (no key, the
 * provider of the weather itself), from the browser. A few places are
 * offered; the one picked is told with a `place-picked` event
 * {latitude, longitude, label}.
 *
 * Usage:
 *   <rs-place-search .hass=${hass}
 *     @place-picked=${(e) => this.pick(e.detail)}></rs-place-search>
 */
import { LitElement, css, html, nothing, TemplateResult } from "lit";

import i18n from "../translations/myi18n";

export const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

/** Places offered for a name. */
export const PLACE_COUNT = 6;

/** A place found. */
export interface FoundPlace {
  label: string;
  latitude: number;
  longitude: number;
}

/**
 * Label of a place of the geocoding API: its name, region and country.
 * @param r: a result of the API
 */
export function place_label(r: any): string {
  const parts = [r?.name, r?.admin1, r?.country].filter(
    (p, i, all) => typeof p === "string" && p && all.indexOf(p) === i,
  );
  return parts.join(", ");
}

/**
 * Places matching a name.
 * @param name: what the user typed
 * @param language: language of the names (en, fr...)
 * @param fetcher: fetch (the browser's by default)
 * @return the places found, an empty list when none
 * @throws when the API cannot be reached
 */
export async function search_places(
  name: string,
  language: string = "en",
  fetcher: (url: string) => Promise<any> = (url) => fetch(url),
): Promise<FoundPlace[]> {
  const query = name.trim();
  if (query.length < 2) return [];
  const params = new URLSearchParams({
    name: query,
    count: String(PLACE_COUNT),
    language,
    format: "json",
  });
  const res = await fetcher(`${GEOCODING_URL}?${params}`);
  if (!res?.ok) throw new Error(`HTTP ${res?.status ?? "?"}`);
  const data = await res.json();
  const results = Array.isArray(data?.results) ? data.results : [];
  return results
    .filter(
      (r: any) =>
        Number.isFinite(Number(r?.latitude)) &&
        Number.isFinite(Number(r?.longitude)),
    )
    .map((r: any) => ({
      label: place_label(r),
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
    }));
}

export class RSPlaceSearch extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-size: 12px;
    }
    .search {
      display: flex;
      gap: 4px;
    }
    input {
      flex: 1;
      min-width: 0;
      font: inherit;
      color: var(--primary-text-color, #222);
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      padding: 2px 4px;
    }
    button {
      font: inherit;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      background: none;
      color: inherit;
      cursor: pointer;
    }
    ul {
      list-style: none;
      margin: 2px 0;
      padding: 0;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
    }
    li {
      padding: 3px 6px;
      cursor: pointer;
    }
    li:hover {
      background: rgba(127, 127, 127, 0.15);
    }
    .note {
      margin: 2px 0;
      color: var(--secondary-text-color, #777);
    }
    .note.error {
      color: var(--error-color, #db4437);
    }
  `;

  static override properties = {
    hass: { attribute: false },
    _query: { state: true },
    _places: { state: true },
    _note: { state: true },
    _error: { state: true },
  };

  hass: any = null;
  protected _query = "";
  protected _places: FoundPlace[] = [];
  /** Message under the field: nothing found, searching */
  protected _note = "";
  protected _error = false;
  /** Lookup used, replaced by the tests */
  fetcher: (url: string) => Promise<any> = (url) => fetch(url);

  /** Look the typed name up. */
  async search(): Promise<void> {
    this._places = [];
    this._error = false;
    this._note = i18n._("place_search_running");
    try {
      const language = String(this.hass?.language ?? "en").slice(0, 2);
      this._places = await search_places(this._query, language, this.fetcher);
      this._note = this._places.length ? "" : i18n._("place_search_none");
    } catch (err) {
      this._error = true;
      this._note = `${i18n._("place_search_failed")} (${(err as Error)?.message ?? err})`;
    }
  }

  /**
   * Tell the editor the place picked, the list closed.
   * @param place: the place
   */
  pick(place: FoundPlace): void {
    this._places = [];
    this._query = place.label;
    this.dispatchEvent(
      new CustomEvent("place-picked", {
        detail: { ...place },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override render(): TemplateResult {
    return html`<div class="search">
        <input
          class="query"
          type="search"
          placeholder="${i18n._("place_search")}"
          .value=${this._query}
          @input=${(e: Event) =>
            (this._query = (e.target as HTMLInputElement).value)}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void this.search();
            }
          }}
        />
        <button
          class="go"
          title="${i18n._("place_search")}"
          @click=${() => this.search()}
        >
          🔍
        </button>
      </div>
      ${this._places.length
        ? html`<ul>
            ${this._places.map(
              (p) => html`<li @click=${() => this.pick(p)}>${p.label}</li>`,
            )}
          </ul>`
        : nothing}
      ${this._note
        ? html`<div class="note ${this._error ? "error" : ""}">
            ${this._note}
          </div>`
        : nothing}`;
  }
}
