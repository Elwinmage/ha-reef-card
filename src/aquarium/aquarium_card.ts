/**
 * Aquarium view: a picture of the tank with its devices and entities, the
 * water tinted by the lamps and, at the `full` render level, fish and corals
 * alive in it.
 *
 * Card configuration:
 *
 *   type: custom:reef-aquarium-card
 *   aquarium: a1b2            # id of the aquarium (reeftank integration)
 *   render: static            # optional, can only lower the aquarium's level
 *   view: front               # optional, the view to start on
 *
 * Layers, bottom to top: the photo, the life canvas, the light tint of each
 * water region (CSS, multiplied), the glow canvas, the hotspots and the
 * elements.
 */

import {
  LitElement,
  html,
  nothing,
  svg,
  type PropertyValues,
  type TemplateResult,
} from "lit";
import { state } from "lit/decorators.js";
import { mdiShakerOutline, mdiDevices, mdiMapMarker } from "@mdi/js";

import type { HassConfig } from "../types/index";
import type {
  AquariumPayload,
  Catalog,
  Point,
  RenderLevel,
  SceneElement,
  View,
} from "./types";
import { RENDER_LEVELS } from "./types";
import { ReefTankApi, image_url } from "./api";
import { WaterProjection, clip_path, svg_points } from "./geometry";
import { tint_layers, water_light, type WaterLight } from "./light";
import { AquariumScene } from "./scene";
import { Backdrop, drawn } from "./backdrop";
import {
  create_entity_element,
  device_name,
  device_selector,
  device_thumbnail,
  open_device_page,
} from "./elements";
import DeviceList from "../utils/common";
import i18n from "../translations/myi18n";
import style_aquarium from "./aquarium.styles";

/** Picture of the card, shown until an aquarium is chosen. */
const PREVIEW_IMG = new URL("../img/preview-reeftank.webp", import.meta.url)
  .href;
import type { MyElement } from "../base/element";

export interface AquariumCardConfig {
  type?: string;
  aquarium?: string;
  render?: RenderLevel;
  view?: string;
}

/** The lower of two render levels. */
export function lowest_level(
  a: RenderLevel,
  b: RenderLevel | undefined | null,
): RenderLevel {
  if (!b || !RENDER_LEVELS.includes(b)) return a;
  return RENDER_LEVELS.indexOf(a) <= RENDER_LEVELS.indexOf(b) ? a : b;
}

/**
 * Flow of the pumps of a water, 0..1: the mean of its flow entities, read
 * as a percentage (or against the entity's own max).
 */
export function flow_of(hass: HassConfig, entity_ids: string[]): number {
  const values: number[] = [];
  for (const id of entity_ids ?? []) {
    const s = hass?.states?.[id];
    if (!s) continue;
    if (s.state === "on" || s.state === "off") {
      values.push(s.state === "on" ? 1 : 0);
      continue;
    }
    const v = Number(s.state);
    if (!Number.isFinite(v)) continue;
    const max = Number(s.attributes?.max);
    values.push(Number.isFinite(max) && max > 0 ? v / max : v / 100);
  }
  if (!values.length) return 0;
  return Math.max(
    0,
    Math.min(1, values.reduce((a, b) => a + b, 0) / values.length),
  );
}

/**
 * Feeding points of a view a feeding is for: the ones bound to its source,
 * else every feeding point of the view.
 */
export function feeding_targets(
  view: View | undefined,
  source: string | null | undefined,
): Point[] {
  const points = (view?.elements ?? []).filter((e) =>
    e.roles?.includes("feeding_point"),
  );
  const bound = source ? points.filter((e) => e.source === source) : [];
  const chosen = bound.length
    ? bound
    : points.filter((e) => !e.source || !source);
  return (chosen.length ? chosen : points).map((e) => e.pos);
}

export class ReefAquariumCard extends LitElement {
  static override styles = [style_aquarium];

  @state() private _config: AquariumCardConfig = {};
  @state() private _payload: AquariumPayload | null = null;
  @state() private _error: string | null = null;
  @state() private _view_id: string | null = null;
  @state() private _aspect = 16 / 9;
  @state() private _overlay: HTMLElement | null = null;
  @state() private _lights: Record<string, WaterLight> = {};

  private _hass: HassConfig | null = null;
  private _api: ReefTankApi | null = null;
  private _unsub: (() => void) | null = null;
  /** Catalog subscription (a release was installed). */
  private _catalog_unsub: (() => void) | null = null;
  private _subscribed_to: string | null = null;
  private _catalog: Catalog | null = null;
  private _stack: string[] = [];
  private _bg: HTMLImageElement | null = null;
  private _bg_url: string | null = null;
  private _elements = new Map<string, MyElement>();
  private _devices: DeviceList | null = null;
  private _scene: AquariumScene | null = null;
  private _scene_key = "";
  private _light_key = "";
  private _feeding_seen: string | null | undefined = undefined;
  private _visible = true;
  private _io: IntersectionObserver | null = null;
  private _ro: ResizeObserver | null = null;
  /** Observed stage: the backdrop and the scene follow its size. */
  private _ro_stage: Element | null = null;
  /** Drawn decor of the views without their photo. */
  private _backdrop = new Backdrop(() => this._on_resize());
  private _on_visibility = () => this._update_running();

  /** Lovelace: configuration of the card. */
  setConfig(config: AquariumCardConfig): void {
    if (!config || typeof config !== "object")
      throw new Error("invalid configuration");
    const changed = config.aquarium !== this._config.aquarium;
    this._config = { ...config };
    if (config.view) this._view_id = config.view;
    if (changed) this._resubscribe();
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("reef-aquarium-card-editor");
  }

  static getStubConfig(): AquariumCardConfig {
    return { aquarium: "" };
  }

  getCardSize(): number {
    return 6;
  }

  set hass(hass: HassConfig) {
    const first = !this._hass;
    this._hass = hass;
    if (!this._api) this._api = new ReefTankApi(hass);
    else this._api.hass = hass;
    if (first) {
      this._devices = new DeviceList(hass);
      this._resubscribe();
      this._load_catalog();
    }
    for (const element of this._elements.values()) (element as any).hass = hass;
    if (this._overlay) (this._overlay as any).hass = hass;
    this._refresh_live(first);
  }

  get hass(): HassConfig | null {
    return this._hass;
  }

  // ── Data ───────────────────────────────────────────────────────────────────

  private async _load_catalog(force: boolean = false): Promise<void> {
    if (!this._api?.available) return;
    this._follow_catalog();
    try {
      this._catalog = await this._api.catalog(force);
      this._scene_key = "";
      this.requestUpdate();
    } catch (err) {
      console.warn("aquarium: no catalog", err);
    }
  }

  /** Reload the catalog when a catalog release is installed. */
  private async _follow_catalog(): Promise<void> {
    if (this._catalog_unsub || !this._api) return;
    this._catalog_unsub = () => undefined; // pending
    try {
      this._catalog_unsub = await this._api.subscribe_catalog(() =>
        this._load_catalog(true),
      );
      if (!this.isConnected) this._stop_catalog();
    } catch {
      this._catalog_unsub = null;
    }
  }

  private _stop_catalog(): void {
    try {
      this._catalog_unsub?.();
    } catch {
      // the connection is gone
    }
    this._catalog_unsub = null;
  }

  private async _resubscribe(): Promise<void> {
    const aquarium = this._config.aquarium;
    if (!this._hass || !this._api || this._subscribed_to === aquarium) return;
    this._unsubscribe();
    this._subscribed_to = aquarium ?? null;
    this._payload = null;
    this._error = null;
    if (!this._api.available) {
      this._error = "not_loaded";
      return;
    }
    if (!aquarium) {
      this._error = "no_aquarium";
      return;
    }
    try {
      const unsub = await this._api.subscribe(aquarium, (msg) =>
        this._on_payload(msg),
      );
      if (this._subscribed_to !== aquarium) unsub();
      else this._unsub = unsub;
    } catch (err: any) {
      this._error = err?.code === "not_found" ? "not_found" : "not_loaded";
    }
  }

  private _unsubscribe(): void {
    if (this._unsub) {
      try {
        this._unsub();
      } catch {
        /* already closed */
      }
    }
    this._unsub = null;
    this._subscribed_to = null;
  }

  private _on_payload(msg: AquariumPayload | { deleted: true }): void {
    if ("deleted" in msg) {
      this._payload = null;
      this._error = "not_found";
      return;
    }
    this._error = null;
    this._payload = msg;
    const doc = msg.document;
    if (!this._view_id || !doc.views[this._view_id]) {
      this._view_id =
        (this._config.view && doc.views[this._config.view]
          ? this._config.view
          : doc.default_view) ??
        Object.keys(doc.views)[0] ??
        null;
      this._stack = [];
    }
    this._elements.clear();
    this._scene_key = "";
    this._light_key = "";
    this._refresh_live(true);
  }

  // ── Live state (lights, flow, feeding) ─────────────────────────────────────

  /** Render level actually used. */
  get level(): RenderLevel {
    const doc_level = this._payload?.document.render?.level ?? "full";
    let level = lowest_level(doc_level, this._config.render);
    const reduce =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) level = lowest_level(level, "light");
    return level;
  }

  private _refresh_live(first: boolean): void {
    const hass = this._hass;
    const doc = this._payload?.document;
    if (!hass || !doc) return;
    const view = this._view_id ? doc.views[this._view_id] : undefined;
    const lights: Record<string, WaterLight> = {};
    const flows: Record<string, number> = {};
    for (const region of view?.regions ?? []) {
      const water = doc.waters[region.water];
      lights[region.water] = water_light(hass, water);
      flows[region.water] = flow_of(hass, water?.flow ?? []);
    }
    const key = JSON.stringify(lights);
    if (key !== this._light_key) {
      this._light_key = key;
      this._lights = lights;
      this._scene?.set_light(lights, first);
    }
    this._scene?.set_flow(flows);
    this._check_feeding(view);
  }

  private _check_feeding(view: View | undefined): void {
    const entity_id = this._payload?.entities?.feeding;
    const s = entity_id ? this._hass?.states?.[entity_id] : undefined;
    const value = s?.state ?? null;
    if (this._feeding_seen === undefined) {
      this._feeding_seen = value;
      return;
    }
    if (value === this._feeding_seen) return;
    this._feeding_seen = value;
    if (!value || value === "unknown" || value === "unavailable") return;
    const duration = this._payload?.document.feeding?.duration_s ?? 45;
    this._scene?.feed(feeding_targets(view, s?.attributes?.source), duration);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    if (this._hass && !this._unsub) this._resubscribe();
    if (this._hass && this._catalog) this._follow_catalog();
    document.addEventListener("visibilitychange", this._on_visibility);
    if (typeof IntersectionObserver === "function") {
      this._io = new IntersectionObserver((entries) => {
        this._visible = entries.some((e) => e.isIntersecting);
        this._update_running();
      });
      this._io.observe(this);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsubscribe();
    this._stop_catalog();
    document.removeEventListener("visibilitychange", this._on_visibility);
    this._io?.disconnect();
    this._io = null;
    this._ro?.disconnect();
    this._ro = null;
    this._ro_stage = null;
    this._scene?.stop();
    this._scene = null;
    this._scene_key = "";
  }

  private _update_running(): void {
    const run =
      this._visible &&
      document.visibilityState !== "hidden" &&
      this.level === "full";
    if (!this._scene) return;
    if (run && !this._scene.running) this._scene.start();
    if (!run && this._scene.running) this._scene.stop();
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    this._paint_backdrop();
    this._sync_scene();
    this._observe_stage();
  }

  /** Follow the size of the stage (backdrop, then the scene's cut-outs). */
  private _observe_stage(): void {
    const stage = this.renderRoot?.querySelector?.(".stage") ?? null;
    if (stage === this._ro_stage) return;
    this._ro?.disconnect();
    this._ro = null;
    this._ro_stage = stage;
    if (stage && typeof ResizeObserver === "function") {
      this._ro = new ResizeObserver(() => this._on_resize());
      this._ro.observe(stage);
    }
  }

  private _on_resize(): void {
    this._paint_backdrop();
    this._scene?.resize();
  }

  /**
   * Draw the decor of a view shown without its photo, at the size of its
   * canvas.
   * @return the drawn decor (the source of the scene's cut-outs), or null
   */
  private _paint_backdrop(): HTMLCanvasElement | null {
    const doc = this._payload?.document;
    const view = this._view_id ? doc?.views[this._view_id] : undefined;
    const canvas = this.renderRoot?.querySelector?.(
      "canvas.backdrop",
    ) as HTMLCanvasElement | null;
    if (!doc || !view || !drawn(view) || !canvas) return null;
    const rect = canvas.getBoundingClientRect?.();
    const dpr = Math.min(2, (globalThis as any).devicePixelRatio || 1);
    const w = Math.max(
      1,
      Math.round((rect?.width || canvas.clientWidth || 1) * dpr),
    );
    const h = Math.max(
      1,
      Math.round((rect?.height || canvas.clientHeight || 1) * dpr),
    );
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    this._backdrop.configure(doc, view, this._catalog);
    return this._backdrop.paint(canvas);
  }

  /** (Re)build the life scene when what it depends on changed. */
  private _sync_scene(): void {
    const doc = this._payload?.document;
    const canvas = this.renderRoot?.querySelector?.(
      "canvas.life",
    ) as HTMLCanvasElement | null;
    if (!doc || !this._view_id || this.level !== "full" || !canvas) {
      this._scene?.stop();
      this._scene = null;
      this._scene_key = "";
      return;
    }
    const glow = this.renderRoot.querySelector(
      "canvas.glow",
    ) as HTMLCanvasElement | null;
    const view = doc.views[this._view_id];
    const is_drawn = drawn(view);
    const key = `${doc.id}:${doc.revision}:${this._view_id}:${Boolean(this._catalog)}:${this._bg_url}:${Boolean(this._bg?.naturalWidth)}:${is_drawn}`;
    if (this._scene && key === this._scene_key) return;
    this._scene_key = key;
    this._scene?.stop();
    this._scene = new AquariumScene(canvas, glow);
    this._scene.configure({
      doc,
      view_id: this._view_id,
      catalog: this._catalog,
      // A drawn decor: the cut-outs come from it, not from the photo
      background: this._bg,
      overlay: is_drawn ? this._paint_backdrop() : null,
      seed: `${doc.id}:${this._view_id}`,
    });
    this._scene.set_light(this._lights, true);
    this._refresh_live(false);
    this._update_running();
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  private _goto(view_id: string): void {
    if (!this._payload?.document.views[view_id] || view_id === this._view_id)
      return;
    if (this._view_id) this._stack.push(this._view_id);
    this._view_id = view_id;
    this._light_key = "";
    this._refresh_live(true);
  }

  private _back(): void {
    const previous = this._stack.pop();
    if (previous) {
      this._view_id = previous;
      this._light_key = "";
      this._refresh_live(true);
      this.requestUpdate();
    }
  }

  private _open_device(device_id: string): void {
    const selector = device_selector(this._devices, device_id);
    if (!selector || !customElements.get("reef-card")) {
      open_device_page(device_id);
      return;
    }
    const card: any = document.createElement("reef-card");
    card.setConfig({ type: "custom:reef-card", device: selector });
    card.hass = this._hass;
    this._overlay = card;
  }

  private _close_overlay(): void {
    this._overlay = null;
  }

  private _on_bg_load(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (img.naturalWidth && img.naturalHeight) {
      this._aspect = img.naturalWidth / img.naturalHeight;
    }
    this._bg = img;
    this._scene_key = "";
    this.requestUpdate();
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  private _message(key: string): TemplateResult {
    return html`<div class="message">
      <strong>${i18n._(`aq_msg_${key}_title`)}</strong>
      ${i18n._(`aq_msg_${key}`)}
    </div>`;
  }

  private _render_water(view: View, level: RenderLevel): TemplateResult[] {
    if (level === "static") return [];
    const doc = this._payload!.document;
    return (view.regions ?? [])
      .filter((r) => WaterProjection.valid(r.quad))
      .map((region) => {
        const light = this._lights[region.water];
        const layers = light
          ? tint_layers(light, doc.photo_light ?? "white")
          : null;
        if (!layers) return html``;
        // One clipped layer each: a clip-path isolates its content, so a
        // blend mode set inside it would not reach the photo below.
        const clip = clip_path(region.quad);
        return html`<div
            class="water tint"
            style="clip-path:${clip};background:${layers.tint}"
          ></div>
          <div
            class="water veil"
            style="clip-path:${clip};background:${layers.veil}"
          ></div>
          <div
            class="water depth"
            style="clip-path:${clip};background:${layers.depth}"
          ></div>`;
      });
  }

  private _element_node(element: SceneElement): TemplateResult {
    const hass = this._hass!;
    const style = `left:${element.pos[0] * 100}%;top:${element.pos[1] * 100}%;transform:translate(-50%,-50%) scale(${element.scale || 1})`;
    const feeding = element.roles?.includes("feeding_point");
    if (element.kind === "entity" && element.entity_id) {
      // A removed entity: the card elements cannot draw without a state
      if (!hass.states?.[element.entity_id]) {
        return html`<div class="el entity missing" style="${style}">
          <span class="chip" title="${i18n._("aq_missing_entity")}"
            >${element.label || element.entity_id}</span
          >
        </div>`;
      }
      const key = `${element.id}:${element.entity_id}:${element.type ?? ""}:${element.label}`;
      let node = this._elements.get(key);
      if (!node) {
        node = create_entity_element(hass, element) ?? undefined;
        if (node) this._elements.set(key, node);
      }
      return html`<div class="el entity" style="${style}">
        ${node ?? element.entity_id}
      </div>`;
    }
    if (element.kind === "device" && element.device_id) {
      const thumb = device_thumbnail(hass, this._devices, element.device_id);
      const name = element.label || device_name(hass, element.device_id);
      return html`<div
        class="el device"
        style="${style}"
        title="${name}"
        @click=${() => this._open_device(element.device_id!)}
      >
        ${thumb
          ? html`<img src="${thumb}" alt="${name}" />`
          : html`<span class="chip"
              ><svg viewBox="0 0 24 24"><path d="${mdiDevices}"></path></svg
              >${name}</span
            >`}
        ${feeding
          ? html`<span class="badge"
              ><svg viewBox="0 0 24 24">
                <path d="${mdiShakerOutline}"></path></svg
            ></span>`
          : nothing}
      </div>`;
    }
    return html`<div class="el marker" style="${style}">
      <span class="chip"
        ><svg viewBox="0 0 24 24">
          <path d="${feeding ? mdiShakerOutline : mdiMapMarker}"></path></svg
        >${element.label}</span
      >
    </div>`;
  }

  override render(): TemplateResult {
    // No aquarium chosen yet (the card picker's preview, a new card): its
    // picture, and what to do
    if (!this._config.aquarium)
      return html`<ha-card>
        <img class="preview" src="${PREVIEW_IMG}" alt="" />
        ${this._message("no_aquarium")}
      </ha-card>`;
    if (this._error)
      return html`<ha-card>${this._message(this._error)}</ha-card>`;
    const payload = this._payload;
    if (!payload) return html`<ha-card>${this._message("loading")}</ha-card>`;
    const doc = payload.document;
    const view = this._view_id ? doc.views[this._view_id] : undefined;
    if (!view) return html`<ha-card>${this._message("no_view")}</ha-card>`;
    const level = this.level;
    const url = image_url(view.image, payload.images_url);
    // Regions drawn over the photo (the rest of the picture stays)
    const is_drawn = drawn(view);
    if (url !== this._bg_url) {
      this._bg_url = url;
      this._bg = null;
    }
    return html`<ha-card>
      <div class="stage" style="aspect-ratio:${this._aspect}">
        ${url
          ? html`<img
              class="bg"
              src="${url}"
              alt="${doc.name}"
              crossorigin="anonymous"
              @load=${this._on_bg_load}
            />`
          : nothing}
        ${is_drawn ? html`<canvas class="backdrop"></canvas>` : nothing}
        ${level === "full" ? html`<canvas class="life"></canvas>` : nothing}
        ${this._render_water(view, level)}
        ${level === "full" ? html`<canvas class="glow"></canvas>` : nothing}
        <svg
          class="hotspots"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          ${(view.hotspots ?? []).map(
            (h) =>
              svg`<polygon
                points="${svg_points(h.poly)}"
                @click=${() => this._goto(h.goto)}
              >
                <title>${h.label || doc.views[h.goto]?.name || ""}</title>
              </polygon>`,
          )}
        </svg>
        ${(view.elements ?? []).map((e) => this._element_node(e))}
        <div class="nav">
          ${this._stack.length
            ? html`<button @click=${this._back} title="${i18n._("back")}">
                ←
              </button>`
            : nothing}
          ${this._stack.length && view.name
            ? html`<span class="chip">${view.name}</span>`
            : nothing}
        </div>
      </div>
      ${this._overlay
        ? html`<div class="overlay">
            <button class="close" @click=${this._close_overlay}>✕</button>
            ${this._overlay}
          </div>`
        : nothing}
    </ha-card>`;
  }
}
