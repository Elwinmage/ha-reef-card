/**
 * Implement the topographic map of the ReefLED weather program.
 *
 * A small slippy map of OpenStreetMap data with a relief layer (OpenTopoMap
 * tiles), to pick the place whose weather the lamp follows: dragged to move,
 * zoomed with its buttons or the wheel, a click sets the place. No map
 * library: the tiles are laid out here (Web Mercator). A place is searched
 * by its name beside it (rs-place-search): the map goes where it is set.
 *
 * Usage:
 *   <rsled-topo-map .latitude=${lat} .longitude=${lon}
 *     @place-picked=${(e) => e.detail}>   // {latitude, longitude}
 *   </rsled-topo-map>
 *
 * The tiles are loaded by the browser from opentopomap.org.
 *
 * @element rsled-topo-map
 */

import { LitElement, css, html, TemplateResult } from "lit";

/** Side of a map tile, in pixels. */
export const TILE = 256;

/** Zoom levels of the map (OpenTopoMap serves up to 17). */
export const ZOOM = { min: 2, max: 17, initial: 6 };

/** Size of the map when the element is not laid out yet (tests). */
export const MAP_FALLBACK = { width: 320, height: 200 };

/** A pointer moved by more than this is a drag, not a click (pixels). */
export const DRAG_THRESHOLD = 4;

/** Latitude the Web Mercator projection stops at. */
const MAX_LAT = 85.0511;

/** Sub-domains the tiles are served from. */
const SERVERS = ["a", "b", "c"];

/**
 * URL of a tile of the topographic layer.
 * @param z: zoom level
 * @param x: tile column
 * @param y: tile row
 */
export function tile_url(z: number, x: number, y: number): string {
  const server = SERVERS[Math.abs(x + y) % SERVERS.length];
  return `https://${server}.tile.opentopomap.org/${z}/${x}/${y}.png`;
}

/**
 * Position of a place on the world map of a zoom level, in pixels.
 * @param latitude: degrees, kept inside the projection
 * @param longitude: degrees
 * @param zoom: zoom level
 */
export function project(
  latitude: number,
  longitude: number,
  zoom: number,
): { x: number; y: number } {
  const size = TILE * 2 ** zoom;
  const lat = Math.max(-MAX_LAT, Math.min(MAX_LAT, latitude));
  const sin = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((longitude + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  };
}

/**
 * Place of a position on the world map of a zoom level.
 * @param x: pixels from the left (wrapped around the world)
 * @param y: pixels from the top
 * @param zoom: zoom level
 */
export function unproject(
  x: number,
  y: number,
  zoom: number,
): { latitude: number; longitude: number } {
  const size = TILE * 2 ** zoom;
  const wrapped = ((x % size) + size) % size;
  const n = Math.PI * (1 - (2 * y) / size);
  const latitude = (Math.atan(Math.sinh(n)) * 180) / Math.PI;
  return {
    latitude: Math.max(-MAX_LAT, Math.min(MAX_LAT, latitude)),
    longitude: (wrapped / size) * 360 - 180,
  };
}

export class RSLedTopoMap extends LitElement {
  static override styles = css`
    :host {
      display: block;
      margin: 4px 0;
    }
    .view {
      position: relative;
      height: 200px;
      overflow: hidden;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #ccc);
      background: #dfe6e0;
      touch-action: none;
      user-select: none;
      cursor: crosshair;
    }
    img.tile {
      position: absolute;
      width: 256px;
      height: 256px;
      pointer-events: none;
    }
    .marker {
      position: absolute;
      width: 14px;
      height: 14px;
      margin: -7px 0 0 -7px;
      border-radius: 50%;
      background: #e53935;
      border: 2px solid #fff;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
      pointer-events: none;
    }
    .zoom {
      position: absolute;
      top: 6px;
      left: 6px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .zoom button {
      width: 24px;
      height: 24px;
      padding: 0;
      border: 1px solid rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.92);
      color: #222;
      font-size: 16px;
      line-height: 1;
      cursor: pointer;
    }
    .attribution {
      position: absolute;
      right: 0;
      bottom: 0;
      padding: 0 4px;
      background: rgba(255, 255, 255, 0.8);
      color: #333;
      font-size: 9px;
    }
    .attribution a {
      color: inherit;
    }
  `;

  static override properties = {
    latitude: { type: Number },
    longitude: { type: Number },
    _zoom: { state: true },
    _center: { state: true },
  };

  /** The place marked on the map */
  latitude: number = 0;
  longitude: number = 0;

  _zoom: number = ZOOM.initial;
  /** Centre of the view, null while it is the place */
  _center: { latitude: number; longitude: number } | null = null;

  private _pick(place: { latitude: number; longitude: number }): void {
    this.dispatchEvent(
      new CustomEvent("place-picked", {
        detail: place,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Where a drag started: the pointer, and the centre in world pixels. */
  private _drag: { px: number; py: number; x: number; y: number } | null = null;
  private _moved: boolean = false;

  /** The view goes back to the place when it changes from outside. */
  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("latitude") || changed.has("longitude")) {
      this._center = null;
    }
  }

  /** The map itself (the search is above it). */
  private _view(): HTMLElement | null {
    return this.renderRoot?.querySelector?.(".view") ?? null;
  }

  /** Laid out: the tiles are placed again for the real size of the map. */
  protected override firstUpdated(): void {
    this.requestUpdate();
  }

  /** Size of the map on screen. */
  size(): { width: number; height: number } {
    const view = this._view();
    return {
      width: view?.clientWidth || MAP_FALLBACK.width,
      height: view?.clientHeight || MAP_FALLBACK.height,
    };
  }

  /** Centre of the view. */
  center(): { latitude: number; longitude: number } {
    return (
      this._center ?? { latitude: this.latitude, longitude: this.longitude }
    );
  }

  /** World pixels of the top left corner of the view. */
  private _origin(): { x: number; y: number } {
    const { width, height } = this.size();
    const c = this.center();
    const p = project(c.latitude, c.longitude, this._zoom);
    return { x: p.x - width / 2, y: p.y - height / 2 };
  }

  /**
   * Zoom in or out, around the centre of the view.
   * @param delta: levels to add
   */
  zoom_by(delta: number): void {
    this._zoom = Math.max(ZOOM.min, Math.min(ZOOM.max, this._zoom + delta));
  }

  /**
   * Place under a point of the map.
   * @param x: pixels from the left of the map
   * @param y: pixels from its top
   */
  place_at(x: number, y: number): { latitude: number; longitude: number } {
    const origin = this._origin();
    return unproject(origin.x + x, origin.y + y, this._zoom);
  }

  /** Position of a pointer event inside the map. */
  private _point(ev: MouseEvent): { x: number; y: number } {
    // Only asked for a press on the map: it is rendered
    const rect = this._view()!.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }

  private _on_down = (ev: PointerEvent): void => {
    // The buttons and the links keep their own clicks
    if ((ev.target as HTMLElement | null)?.closest?.("button, a")) return;
    const c = this.center();
    const p = project(c.latitude, c.longitude, this._zoom);
    this._drag = { px: ev.clientX, py: ev.clientY, x: p.x, y: p.y };
    this._moved = false;
    // The map follows the pointer even when it leaves it
    (ev.currentTarget as HTMLElement | null)?.setPointerCapture?.(ev.pointerId);
  };

  private _on_move = (ev: PointerEvent): void => {
    const drag = this._drag;
    if (!drag) return;
    const dx = ev.clientX - drag.px;
    const dy = ev.clientY - drag.py;
    if (!this._moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    this._moved = true;
    this._center = unproject(drag.x - dx, drag.y - dy, this._zoom);
  };

  private _on_up = (ev: PointerEvent): void => {
    const drag = this._drag;
    this._drag = null;
    if (!drag || this._moved) return;
    // A click: the place under it is picked
    const { x, y } = this._point(ev);
    this._pick(this.place_at(x, y));
  };

  private _on_cancel = (): void => {
    this._drag = null;
  };

  private _on_wheel = (ev: WheelEvent): void => {
    ev.preventDefault();
    this.zoom_by(ev.deltaY < 0 ? 1 : -1);
  };

  protected override render(): TemplateResult {
    const { width, height } = this.size();
    const origin = this._origin();
    const count = 2 ** this._zoom;
    const tiles: TemplateResult[] = [];
    const first_x = Math.floor(origin.x / TILE);
    const first_y = Math.floor(origin.y / TILE);
    const last_x = Math.floor((origin.x + width) / TILE);
    const last_y = Math.floor((origin.y + height) / TILE);
    for (let ty = first_y; ty <= last_y; ty++) {
      // Nothing above the top nor under the bottom of the world
      if (ty < 0 || ty >= count) continue;
      for (let tx = first_x; tx <= last_x; tx++) {
        // The world goes round
        const wrapped = ((tx % count) + count) % count;
        tiles.push(
          html`<img
            class="tile"
            alt=""
            draggable="false"
            src="${tile_url(this._zoom, wrapped, ty)}"
            style="left:${Math.round(tx * TILE - origin.x)}px;top:${Math.round(
              ty * TILE - origin.y,
            )}px"
          />`,
        );
      }
    }
    const place = project(this.latitude, this.longitude, this._zoom);
    // The listeners are on the map inside the shadow tree: there the
    // target of a press is the element pressed (a zoom button, a link)
    return html`<div
      class="view"
      @pointerdown=${this._on_down}
      @pointermove=${this._on_move}
      @pointerup=${this._on_up}
      @pointercancel=${this._on_cancel}
      @wheel=${this._on_wheel}
    >
      ${tiles}
      <div
        class="marker"
        style="left:${Math.round(place.x - origin.x)}px;top:${Math.round(
          place.y - origin.y,
        )}px"
      ></div>
      <div class="zoom">
        <button class="zoom_in" @click=${() => this.zoom_by(1)}>+</button>
        <button class="zoom_out" @click=${() => this.zoom_by(-1)}>−</button>
      </div>
      <div class="attribution">
        ©
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          >OpenStreetMap</a
        >, SRTM |
        <a href="https://opentopomap.org" target="_blank" rel="noreferrer"
          >OpenTopoMap</a
        >
        (CC-BY-SA)
      </div>
    </div>`;
  }
}
