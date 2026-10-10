/**
 * Full-screen scene editor of an aquarium.
 *
 * Tabs: the aquarium (name, cloud link, preset, dimensions, rendering),
 * its views (pictures, water outlines, decor, hotspots), the elements
 * placed on them (device tree, drag and drop), the lights and flow, the
 * livestock (inventory, corals) and the feeding sources.
 *
 * Every change goes through the pure operations of ops.ts on a working
 * copy, kept in an undo history; nothing reaches Home Assistant before
 * Save.
 */

import { LitElement, html, nothing, svg, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import {
  mdiShakerOutline,
  mdiDevices,
  mdiChevronRight,
  mdiHome,
  mdiTextureBox,
  mdiShapeOutline,
  mdiMapMarker,
  mdiUndo,
  mdiClose,
  mdiContentSave,
  mdiFish,
  mdiFlowerPollen,
} from "@mdi/js";

import type { HassConfig } from "../../types/index";
import type {
  AquariumDocument,
  Catalog,
  CloudAquarium,
  CoralSpecies,
  Decor,
  FishSpecies,
  Hotspot,
  LivestockLine,
  Point,
  SceneElement,
  View,
} from "../types";
import { RENDER_LEVELS } from "../types";
import { ApiError, ReefTankApi, image_url, IMAGES_URL } from "../api";
import {
  WaterProjection,
  rect_quad,
  sand_profile,
  simplify,
  smooth_line,
  svg_points,
} from "../geometry";
import {
  aquarium_place,
  build_tree,
  default_element_type,
  floor_icon,
  tree_empty,
  type TreeArea,
  type TreeDevice,
  type TreeEntity,
  type TreeFloor,
} from "../tree";
import { device_entities } from "../light";
import { Backdrop, drawn_region } from "../backdrop";
import { device_name, device_thumbnail } from "../elements";
import { coral_palette, rgb_hex } from "../sprites";
import DeviceList from "../../utils/common";
import i18n from "../../translations/myi18n";
import * as ops from "./ops";
import style_editor from "./scene_editor.styles";

type Tab =
  | "aquarium"
  | "views"
  | "elements"
  | "lights"
  | "livestock"
  | "feeding";
type Tool =
  | "select"
  | "region"
  | "sand"
  | "decor"
  | "lasso"
  | "hotspot"
  | "coral"
  | "home";

type Selection =
  | { type: "decor" | "hotspot" | "element"; id: string }
  | { type: "coral"; id: string; water: string }
  | null;

type Drag =
  | { type: "corner"; water: string; index: number }
  | { type: "sand"; water: string; index: number; line: ops.SandLine }
  | { type: "home"; water: string; line: string }
  | { type: "vertex"; kind: "decor" | "hotspots"; id: string; index: number }
  | { type: "element"; id: string }
  | { type: "coral"; water: string; id: string }
  | { type: "lamp"; water: string; index: number }
  | {
      type: "new";
      kind: "device" | "entity";
      ref: string;
      label: string;
      x: number;
      y: number;
    }
  | { type: "lasso"; points: Point[] }
  | null;

const DEPTH_COLOURS: Record<ops.DepthName, string> = {
  front: "#ff9f43",
  middle: "#feca57",
  back: "#a29bfe",
};

const TABS: Tab[] = [
  "aquarium",
  "views",
  "elements",
  "lights",
  "livestock",
  "feeding",
];

/** Class of the modal dialog holding the editor. */
export const SCENE_DIALOG_CLASS = "reef-aquarium-scene-dialog";

/**
 * Open the editor over the page; `on_close` gets the saved id (or null).
 *
 * Home Assistant shows the card editor in a native modal dialog: it sits in
 * the browser's top layer and makes the rest of the page inert, whatever
 * the z-index. The scene editor is therefore put in its own modal dialog,
 * opened after it, so it stacks above the card editor and takes the input.
 * Closing it gives the card editor back, with the saved aquarium selected.
 */
export function open_scene_editor(
  hass: HassConfig,
  aquarium_id: string | null,
  on_close: (saved_id: string | null) => void,
): ReefAquariumSceneEditor {
  const editor = document.createElement(
    "reef-aquarium-scene-editor",
  ) as ReefAquariumSceneEditor;
  editor.hass = hass;
  editor.aquarium_id = aquarium_id;
  editor.on_close = on_close;

  const dialog = document.createElement("dialog");
  dialog.className = SCENE_DIALOG_CLASS;
  Object.assign(dialog.style, {
    padding: "0",
    margin: "0",
    border: "none",
    width: "100vw",
    height: "100vh",
    maxWidth: "100vw",
    maxHeight: "100vh",
    background: "transparent",
    overflow: "hidden",
  });
  // Escape is handled by the editor (it asks before dropping changes)
  dialog.addEventListener("cancel", (e) => e.preventDefault());
  // Some browsers close a modal on a repeated Escape anyway: reopen it
  dialog.addEventListener("close", () => {
    if (editor.isConnected) show_modal(dialog);
  });
  dialog.appendChild(editor);
  document.body.appendChild(dialog);
  show_modal(dialog);
  return editor;
}

function show_modal(dialog: HTMLDialogElement): void {
  try {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      return;
    }
  } catch {
    // not connected, or already open: fall back to a plain open dialog
  }
  dialog.setAttribute("open", "");
}

/** Display name of a water. */
function water_label(id: string, name: string): string {
  if (name) return name;
  if (id === "main") return i18n._("aq_water_main");
  if (id === "sump") return i18n._("aq_water_sump");
  return id;
}

/** Box of a thumbnail in the editor's lists, pixels. */
const THUMB_BOX: [number, number] = [48, 32];

/**
 * Small picture of a species: its thumbnail, else the first frame of its
 * atlas (cropped with CSS), else an icon.
 */
export function species_thumb(
  species: FishSpecies | CoralSpecies | undefined,
  kind: "fish" | "coral",
): TemplateResult {
  if (species?.thumbnail) {
    return html`<img
      class="thumb"
      src="${species.thumbnail}"
      alt=""
      loading="lazy"
    />`;
  }
  const atlas =
    species?.kind === "fish"
      ? (species as FishSpecies).atlas?.["1x"]
      : (species as CoralSpecies | undefined)?.atlas?.shade;
  const clips = species?.clips ?? {};
  const clip = clips.swim ?? clips.day ?? Object.values(clips)[0];
  if (species && atlas && clip && species.frame) {
    const [fw, fh] = species.frame;
    const scale = Math.min(THUMB_BOX[0] / fw, THUMB_BOX[1] / fh);
    const columns = Math.max(1, species.columns || 1);
    const index = clip.from;
    const style = [
      `width:${Math.round(fw * scale)}px`,
      `height:${Math.round(fh * scale)}px`,
      `background-image:url("${atlas}")`,
      `background-size:${columns * fw * scale}px auto`,
      `background-position:-${(index % columns) * fw * scale}px -${Math.floor(index / columns) * fh * scale}px`,
    ].join(";");
    return html`<span class="thumb sprite" style="${style}"></span>`;
  }
  return html`<span class="thumb icon"
    ><svg viewBox="0 0 24 24">
      <path d="${kind === "fish" ? mdiFish : mdiFlowerPollen}"></path></svg
  ></span>`;
}

/** Name of a species in the user's language. */
function species_name(
  species: { id: string; names?: Record<string, string> } | undefined,
  fallback: string,
): string {
  if (!species) return fallback;
  const lang = i18n.getLanguage();
  return species.names?.[lang] ?? species.names?.en ?? species.id;
}

/** Latin name of a species, in italics, next to its common name. */
function species_latin(
  species: { scientific?: string } | undefined,
): TemplateResult | typeof nothing {
  return species?.scientific
    ? html`<i class="latin">${species.scientific}</i>`
    : nothing;
}

export class ReefAquariumSceneEditor extends LitElement {
  static override styles = [style_editor];

  aquarium_id: string | null = null;
  on_close: (saved_id: string | null) => void = () => undefined;

  @state() private _doc: AquariumDocument | null = null;
  @state() private _tab: Tab = "aquarium";
  @state() private _view_id: string | null = null;
  @state() private _water_id = "main";
  @state() private _tool: Tool = "select";
  @state() private _drawing: Point[] = [];
  @state() private _selection: Selection = null;
  @state() private _depth: ops.DepthName = "middle";
  @state() private _hotspot_target = "";
  @state() private _coral_species = "";
  /** Inventory line whose home is being placed (tool "home"). */
  @state() private _home_line: string | null = null;
  /** The drawn decor shown over the photo. */
  @state() private _preview = false;
  /** Sand line edited by the sand tool: front glass or back wall. */
  @state() private _sand_line: ops.SandLine = "sand";
  /** Species picker opened (fish or coral), with its search text. */
  @state() private _picker: { kind: "fish" | "coral"; text: string } | null =
    null;
  @state() private _message: { kind: "info" | "error"; text: string } | null =
    null;
  @state() private _busy = false;
  @state() private _search = "";
  @state() private _all_areas = false;
  @state() private _drag: Drag = null;
  @state() private _aspect = 16 / 9;
  @state() private _catalog: Catalog | null = null;
  @state() private _clouds: CloudAquarium[] = [];

  private _hass: HassConfig | null = null;
  private _catalog_unsub: (() => void) | null = null;
  /** Open nodes of the device tree ("floor:x", "area:y", "device:z"). */
  private _expanded = new Set<string>();
  /** Aquarium whose default expansion was applied. */
  private _expanded_for: string | null = null;
  /** Integrations without a brand icon. */
  private _no_brand = new Set<string>();
  private _api: ReefTankApi | null = null;
  private _history: AquariumDocument[] = [];
  private _saved_json = "";
  private _revision: number | null = null;
  private _is_new = true;
  private _images_url = IMAGES_URL;
  private _devices: DeviceList | null = null;
  /** Document before a drag, recorded for undo once something moves. */
  private _before_drag: AquariumDocument | null = null;
  private _on_key = (e: KeyboardEvent) => this._key(e);
  /** Drawn decor of the current view (preview). */
  private _backdrop = new Backdrop(() => this._paint_preview());

  set hass(hass: HassConfig) {
    const first = !this._hass;
    this._hass = hass;
    if (!this._api) this._api = new ReefTankApi(hass);
    else this._api.hass = hass;
    if (first) this._devices = new DeviceList(hass);
    this.requestUpdate();
  }

  get hass(): HassConfig | null {
    return this._hass;
  }

  /** The working copy (tests). */
  get doc(): AquariumDocument | null {
    return this._doc;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this._on_key);
    this._load();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._on_key);
    this._catalog_unsub?.();
    this._catalog_unsub = null;
  }

  /** Reload the catalog when a catalog release is installed. */
  private async _follow_catalog(): Promise<void> {
    if (this._catalog_unsub || !this._api) return;
    try {
      const unsub = await this._api.subscribe_catalog(async () => {
        this._catalog = await this._api!.catalog(true).catch(
          () => this._catalog,
        );
      });
      if (this.isConnected) this._catalog_unsub = unsub;
      else unsub();
    } catch {
      // no connection: the catalog stays as loaded
    }
  }

  // ── Loading and saving ─────────────────────────────────────────────────────

  private async _load(): Promise<void> {
    if (!this._api) return;
    this._busy = true;
    try {
      const [catalog, clouds] = await Promise.all([
        this._api.catalog().catch(() => null),
        this._api.cloud_aquariums().catch(() => []),
      ]);
      this._catalog = catalog;
      this._clouds = clouds;
      this._follow_catalog();
      if (this.aquarium_id) {
        const payload = await this._api.get(this.aquarium_id);
        this._set_loaded(payload.document, payload.images_url);
      } else {
        this._doc = ops.new_document(i18n._("aq_new_aquarium_name"));
        this._is_new = true;
        this._saved_json = "";
        this._view_id = null;
      }
    } catch (err: any) {
      this._message = { kind: "error", text: this._error_text(err) };
    } finally {
      this._busy = false;
    }
  }

  private _set_loaded(doc: AquariumDocument, images_url?: string): void {
    this._doc = doc;
    this._revision = doc.revision;
    this._is_new = false;
    this._saved_json = JSON.stringify(doc);
    this._history = [];
    this._images_url = images_url ?? IMAGES_URL;
    if (!this._view_id || !doc.views[this._view_id]) {
      this._view_id = doc.default_view ?? Object.keys(doc.views)[0] ?? null;
    }
    if (!doc.waters[this._water_id])
      this._water_id = Object.keys(doc.waters)[0] ?? "main";
  }

  private _error_text(err: any): string {
    const code = err instanceof ApiError ? err.code : String(err?.code ?? "");
    const key = `aq_err_${code}`;
    const text = i18n._(key);
    return text.endsWith(key)
      ? `${i18n._("aq_err_generic")} ${err?.message ?? ""}`
      : text;
  }

  get dirty(): boolean {
    return Boolean(this._doc) && JSON.stringify(this._doc) !== this._saved_json;
  }

  /** Save the working copy. */
  async save(): Promise<boolean> {
    if (!this._doc || !this._api) return false;
    this._busy = true;
    try {
      const payload = await this._api.save(
        ops.for_save(this._doc),
        this._is_new ? null : this._revision,
      );
      this._set_loaded(payload.document, payload.images_url);
      this.aquarium_id = payload.document.id ?? null;
      this._message = { kind: "info", text: i18n._("aq_saved") };
      return true;
    } catch (err: any) {
      this._message = { kind: "error", text: this._error_text(err) };
      return false;
    } finally {
      this._busy = false;
    }
  }

  private async _reload(): Promise<void> {
    if (!this.aquarium_id) return;
    this._view_id = null;
    this._message = null;
    await this._load();
  }

  close(force: boolean = false): void {
    if (!force && this.dirty && !confirm(i18n._("aq_discard_changes"))) return;
    this._detach();
    this.on_close(this._is_new ? null : (this._doc?.id ?? null));
  }

  /** Remove the editor, and the modal dialog holding it. */
  private _detach(): void {
    const dialog = this.parentElement;
    this.remove();
    if (dialog?.classList.contains(SCENE_DIALOG_CLASS)) {
      (dialog as HTMLDialogElement).close?.();
      dialog.remove();
    }
  }

  private async _delete_aquarium(): Promise<void> {
    if (!this._doc?.id || this._is_new || !this._api) return;
    if (!confirm(i18n._("aq_delete_confirm", { name: this._doc.name }))) return;
    try {
      await this._api.remove(this._doc.id);
      this._detach();
      this.on_close(null);
    } catch (err: any) {
      this._message = { kind: "error", text: this._error_text(err) };
    }
  }

  // ── Changes and undo ───────────────────────────────────────────────────────

  /** Apply a change to the working copy, keeping the previous one for undo. */
  change(next: AquariumDocument, record: boolean = true): void {
    if (!this._doc || next === this._doc) return;
    if (record) {
      this._history.push(this._doc);
      if (this._history.length > 100) this._history.shift();
    }
    this._doc = next;
  }

  undo(): void {
    const previous = this._history.pop();
    if (previous) {
      this._doc = previous;
      this._selection = null;
      this._drawing = [];
    }
  }

  private _key(e: KeyboardEvent): void {
    const target = e.composedPath()[0] as HTMLElement | undefined;
    const typing =
      target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !typing) {
      e.preventDefault();
      this.undo();
    } else if (e.key === "Escape") {
      if (this._drawing.length) this._drawing = [];
      else if (this._drag) this._drag = null;
      else this._selection = null;
    } else if (e.key === "Enter" && this._drawing.length >= 3) {
      this._finish_shape();
    } else if ((e.key === "Delete" || e.key === "Backspace") && !typing) {
      this._delete_selection();
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private get _view(): View | undefined {
    return this._view_id ? this._doc?.views[this._view_id] : undefined;
  }

  private _species_fish(id: string): FishSpecies | undefined {
    return this._catalog?.fish.find((s) => s.id === id);
  }

  private _species_coral(id: string): CoralSpecies | undefined {
    return this._catalog?.corals.find((s) => s.id === id);
  }

  private _entity_ids(domains?: string[]): string[] {
    const ids = Object.keys((this._hass?.states as any) ?? {});
    return (
      domains ? ids.filter((id) => domains.includes(id.split(".")[0])) : ids
    ).sort();
  }

  private _is_lamp = (device_id: string): boolean => {
    if (!this._hass) return false;
    const ents = device_entities(this._hass, device_id);
    return Boolean(
      ents["light.kelvin_intensity"] ||
      ents["light.white"] ||
      ents["sensor.white"],
    );
  };

  /** Picture point under the pointer. */
  private _point(e: PointerEvent | MouseEvent): Point | null {
    const stage = this.renderRoot.querySelector(".stage") as HTMLElement | null;
    if (!stage) return null;
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  }

  private _inside_stage(e: PointerEvent): boolean {
    const p = this._point(e);
    return Boolean(p && p[0] >= 0 && p[0] <= 1 && p[1] >= 0 && p[1] <= 1);
  }

  // ── Stage interactions ─────────────────────────────────────────────────────

  private _stage_down(e: PointerEvent): void {
    const p = this._point(e);
    if (!p || !this._doc || !this._view_id) return;
    if (this._tool === "lasso") {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      this._drag = { type: "lasso", points: [p] };
      return;
    }
    if (this._tool === "decor" || this._tool === "hotspot") {
      // Closing the shape by clicking near its first point
      const first = this._drawing[0];
      if (
        first &&
        this._drawing.length >= 3 &&
        Math.hypot(first[0] - p[0], first[1] - p[1]) < 0.015
      ) {
        this._finish_shape();
        return;
      }
      this._drawing = [...this._drawing, ops.clamp_point(p)];
      return;
    }
    if (this._tool === "sand") {
      // A click on the picture adds a point to the sand line (a bump)
      const line = this._sand_line;
      const [doc, index] = ops.add_sand_point(
        this._doc,
        this._view_id,
        this._water_id,
        p,
        line,
      );
      if (index >= 0) {
        this.change(doc);
        this._start_drag(e, {
          type: "sand",
          water: this._water_id,
          index,
          line,
        });
      }
      return;
    }
    if (this._tool === "home" && this._home_line) {
      this._place_home(this._water_id, this._home_line, p);
      this._tool = "select";
      this._home_line = null;
      return;
    }
    if (this._tool === "coral" && this._coral_species) {
      const species = this._species_coral(this._coral_species) ?? {
        id: this._coral_species,
      };
      const [doc, id] = ops.add_coral(
        this._doc,
        this._water_id,
        species as CoralSpecies,
        this._view_id,
        p,
      );
      this.change(doc);
      this._selection = { type: "coral", id, water: this._water_id };
      return;
    }
    if (
      e.target === e.currentTarget ||
      (e.target as Element)?.tagName === "IMG"
    )
      this._selection = null;
  }

  private _stage_move(e: PointerEvent): void {
    const drag = this._drag;
    if (!drag || !this._doc || !this._view_id) return;
    const p = this._point(e);
    if (!p) return;
    if (this._before_drag) {
      this._history.push(this._before_drag);
      this._before_drag = null;
    }
    const v = this._view_id;
    switch (drag.type) {
      case "lasso":
        drag.points.push(p);
        this.requestUpdate();
        break;
      case "corner":
        this.change(
          ops.move_region_corner(this._doc, v, drag.water, drag.index, p),
          false,
        );
        break;
      case "sand":
        this.change(
          ops.move_sand_point(
            this._doc,
            v,
            drag.water,
            drag.index,
            p,
            drag.line,
          ),
          false,
        );
        break;
      case "home":
        this._place_home(drag.water, drag.line, p, false);
        break;
      case "vertex":
        this.change(
          ops.move_vertex(this._doc, v, drag.kind, drag.id, drag.index, p),
          false,
        );
        break;
      case "element":
        this.change(
          ops.update_element(this._doc, v, drag.id, { pos: p }),
          false,
        );
        break;
      case "coral":
        this.change(
          ops.update_coral(this._doc, drag.water, drag.id, { pos: p }),
          false,
        );
        break;
      case "lamp": {
        const region = this._view?.regions.find((r) => r.water === drag.water);
        if (region && WaterProjection.valid(region.quad)) {
          const [u] = new WaterProjection(region.quad).to_water(p[0], p[1]);
          const x = Number(Math.max(0, Math.min(1, u)).toFixed(3));
          this.change(
            ops.update_light(this._doc, drag.water, drag.index, { x }),
            false,
          );
        }
        break;
      }
    }
  }

  private _stage_up(e: PointerEvent): void {
    const drag = this._drag;
    if (drag?.type === "lasso" && this._doc && this._view_id) {
      const poly = simplify(drag.points, 0.004);
      if (poly.length >= 3) {
        const [doc, id] = ops.add_decor(
          this._doc,
          this._view_id,
          poly,
          ops.DEPTHS[this._depth],
        );
        this.change(doc);
        if (id) this._selection = { type: "decor", id };
      }
    }
    if (drag && drag.type !== "new") this._drag = null;
    this._before_drag = null;
    void e;
  }

  /** Start moving something already on the stage (records one undo step). */
  private _start_drag(e: PointerEvent, drag: Exclude<Drag, null>): void {
    e.stopPropagation();
    e.preventDefault();
    this._before_drag = this._doc;
    const stage = this.renderRoot.querySelector(".stage") as HTMLElement | null;
    stage?.setPointerCapture?.(e.pointerId);
    this._drag = drag;
  }

  /** Drag from the device tree: follow the pointer over the whole editor. */
  private _tree_down(
    e: PointerEvent,
    kind: "device" | "entity",
    ref: string,
    label: string,
  ): void {
    e.preventDefault();
    this._drag = { type: "new", kind, ref, label, x: e.clientX, y: e.clientY };
    const move = (ev: PointerEvent) => {
      if (this._drag?.type === "new")
        this._drag = { ...this._drag, x: ev.clientX, y: ev.clientY };
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const drag = this._drag;
      this._drag = null;
      if (drag?.type === "new" && this._inside_stage(ev)) {
        this._add_element(kind, ref, this._point(ev)!);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  private _add_element(
    kind: "device" | "entity",
    ref: string,
    pos: Point = [0.5, 0.5],
  ): void {
    if (!this._doc || !this._view_id) return;
    const element =
      kind === "device"
        ? { kind, device_id: ref, pos }
        : { kind, entity_id: ref, type: default_element_type(ref), pos };
    const [doc, id] = ops.add_element(this._doc, this._view_id, element as any);
    this.change(doc);
    if (id) this._selection = { type: "element", id };
  }

  /** Projection of a water on the current view, when it is outlined. */
  private _projection(water_id: string): WaterProjection | null {
    const region = this._view?.regions.find((r) => r.water === water_id);
    return region && WaterProjection.valid(region.quad)
      ? new WaterProjection(region.quad)
      : null;
  }

  /**
   * Put the home of an inventory line under a picture point (on its water,
   * at the depth it had, else in the middle).
   */
  private _place_home(
    water_id: string,
    line_id: string,
    p: Point,
    record: boolean = true,
  ): void {
    const projection = this._projection(water_id);
    if (!projection || !this._doc) {
      this._message = { kind: "error", text: i18n._("aq_home_needs_outline") };
      return;
    }
    const line = this._doc.waters[water_id]?.livestock.find(
      (l) => l.id === line_id,
    );
    const [u, v] = projection.to_water(p[0], p[1]);
    const r = (x: number) => Number(Math.max(0, Math.min(1, x)).toFixed(3));
    const z = line?.home?.[2] ?? ops.DEPTHS.middle;
    this.change(
      ops.update_line(this._doc, water_id, line_id, { home: [r(u), r(v), z] }),
      record,
    );
  }

  /**
   * Default sand line of a water: along the front glass, its sand band;
   * along the back wall, the front line carried to the back.
   */
  private _default_sand(
    water_id: string,
    line: ops.SandLine = "sand",
  ): Point[] | null {
    const projection = this._projection(water_id);
    if (!projection) return null;
    const region = this._view?.regions.find((r) => r.water === water_id);
    const band = this._doc?.waters[water_id]?.sand_band ?? 0.12;
    const z = line === "sand_back" ? 1 : 0;
    return sand_profile(projection, region?.sand, band).map(([u, v]) =>
      projection.to_picture(u, v, z),
    );
  }

  /** Draw the decor of the view on the preview canvas, when shown. */
  private _paint_preview(): void {
    const canvas = this.renderRoot?.querySelector?.(
      "canvas.backdrop",
    ) as HTMLCanvasElement | null;
    const view = this._view;
    if (!canvas || !view || !this._doc) return;
    const rect = canvas.getBoundingClientRect?.();
    const w = Math.max(1, Math.round(rect?.width || canvas.clientWidth || 1));
    const h = Math.max(1, Math.round(rect?.height || canvas.clientHeight || 1));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    this._backdrop.configure(this._doc, view, this._catalog);
    this._backdrop.paint(canvas);
  }

  private _finish_shape(): void {
    if (!this._doc || !this._view_id || this._drawing.length < 3) return;
    if (this._tool === "hotspot") {
      const goto =
        this._hotspot_target ||
        Object.keys(this._doc.views).find((v) => v !== this._view_id) ||
        "";
      const [doc, id] = ops.add_hotspot(
        this._doc,
        this._view_id,
        this._drawing,
        goto,
      );
      if (!id) {
        this._message = {
          kind: "error",
          text: i18n._("aq_hotspot_needs_view"),
        };
        return;
      }
      this.change(doc);
      this._selection = { type: "hotspot", id };
    } else {
      const [doc, id] = ops.add_decor(
        this._doc,
        this._view_id,
        this._drawing,
        ops.DEPTHS[this._depth],
      );
      this.change(doc);
      if (id) this._selection = { type: "decor", id };
    }
    this._drawing = [];
  }

  private _delete_selection(): void {
    const sel = this._selection;
    if (!sel || !this._doc || !this._view_id) return;
    const v = this._view_id;
    if (sel.type === "decor")
      this.change(ops.remove_decor(this._doc, v, sel.id));
    else if (sel.type === "hotspot")
      this.change(ops.remove_hotspot(this._doc, v, sel.id));
    else if (sel.type === "element")
      this.change(ops.remove_element(this._doc, v, sel.id));
    else if (sel.type === "coral")
      this.change(ops.remove_coral(this._doc, sel.water, sel.id));
    this._selection = null;
  }

  private async _upload(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file || !this._doc?.id || !this._view_id || !this._api) return;
    this._busy = true;
    this._message = { kind: "info", text: i18n._("aq_uploading") };
    try {
      const result = await this._api.upload(this._doc.id, file, file.name);
      this.change(
        ops.update_view(this._doc, this._view_id, { image: result.path }),
      );
      this._message = null;
    } catch (err: any) {
      this._message = { kind: "error", text: this._error_text(err) };
    } finally {
      this._busy = false;
    }
  }

  // ── Rendering: stage ───────────────────────────────────────────────────────

  private _handle(
    p: Point,
    cls: string,
    on_down: (e: PointerEvent) => void,
    title: string = "",
    on_dblclick: ((e: MouseEvent) => void) | null = null,
  ): TemplateResult {
    return html`<div
      class="handle ${cls}"
      style="left:${p[0] * 100}%;top:${p[1] * 100}%"
      title="${title}"
      @pointerdown=${on_down}
      @dblclick=${on_dblclick ?? (() => undefined)}
    ></div>`;
  }

  private _render_stage(): TemplateResult {
    const view = this._view;
    if (!view)
      return html`<div class="empty">${i18n._("aq_no_view_yet")}</div>`;
    const url = image_url(view.image, this._images_url);
    const sel = this._selection;
    const drawing =
      this._drag?.type === "lasso" ? this._drag.points : this._drawing;
    const tab = this._tab;
    return html`<div class="stage-wrap">
      <div
        class="stage tool-${this._tool}"
        style="aspect-ratio:${this._aspect}"
        @pointerdown=${this._stage_down}
        @pointermove=${this._stage_move}
        @pointerup=${this._stage_up}
        @dblclick=${() => this._drawing.length >= 3 && this._finish_shape()}
      >
        ${url
          ? html`<img
              class="bg"
              src="${url}"
              draggable="false"
              @load=${(e: Event) => {
                const img = e.target as HTMLImageElement;
                if (img.naturalWidth)
                  this._aspect = img.naturalWidth / img.naturalHeight;
              }}
            />`
          : html`<div class="noimage">${i18n._("aq_upload_hint")}</div>`}
        ${this._preview ? html`<canvas class="backdrop"></canvas>` : nothing}
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
          ${view.regions.map(
            (r) =>
              svg`<polygon
                class="region ${r.water === this._water_id ? "current" : ""}"
                points="${svg_points(r.quad)}"
              ></polygon>`,
          )}
          ${tab === "views"
            ? view.regions.flatMap((r) =>
                (["sand", "sand_back"] as ops.SandLine[])
                  .filter((line) => (r[line]?.length ?? 0) >= 2)
                  .map(
                    (line) =>
                      svg`<polyline
                          class="sand ${line === "sand_back" ? "back" : ""} ${r.water === this._water_id ? "current" : ""}"
                          points="${svg_points(smooth_line(r[line]!))}"
                        ></polyline>`,
                  ),
              )
            : nothing}
          ${view.decor.map(
            (d) =>
              svg`<polygon
                class="decor ${sel?.type === "decor" && sel.id === d.id ? "selected" : ""}"
                style="--c:${DEPTH_COLOURS[ops.depth_name(d.z)]}"
                points="${svg_points(d.poly)}"
                @pointerdown=${(e: PointerEvent) => {
                  if (this._tool !== "select") return;
                  e.stopPropagation();
                  this._selection = { type: "decor", id: d.id };
                }}
              ></polygon>`,
          )}
          ${view.hotspots.map(
            (h) =>
              svg`<polygon
                class="hotspot ${sel?.type === "hotspot" && sel.id === h.id ? "selected" : ""}"
                points="${svg_points(h.poly)}"
                @pointerdown=${(e: PointerEvent) => {
                  if (this._tool !== "select") return;
                  e.stopPropagation();
                  this._selection = { type: "hotspot", id: h.id };
                }}
              ></polygon>`,
          )}
          ${drawing.length
            ? svg`<polyline class="drawing" points="${svg_points(drawing)}"></polyline>`
            : nothing}
        </svg>
        ${this._render_handles(view)}
        ${tab === "elements" || tab === "feeding" || tab === "views"
          ? view.elements.map((el) => this._render_element(el))
          : nothing}
        ${tab === "livestock" ? this._render_coral_marks() : nothing}
        ${tab === "livestock" ? this._render_home_marks() : nothing}
        ${tab === "lights" ? this._render_lamp_marks(view) : nothing}
      </div>
    </div>`;
  }

  private _render_handles(view: View): TemplateResult[] {
    const out: TemplateResult[] = [];
    const sel = this._selection;
    if (this._tab === "views" && this._tool === "region") {
      const region = view.regions.find((r) => r.water === this._water_id);
      region?.quad.forEach((p, index) =>
        out.push(
          this._handle(p, "corner", (e) =>
            this._start_drag(e, {
              type: "corner",
              water: this._water_id,
              index,
            }),
          ),
        ),
      );
    }
    if (this._tab === "views" && this._tool === "sand") {
      const region = view.regions.find((r) => r.water === this._water_id);
      const line = this._sand_line;
      region?.[line]?.forEach((p, index) =>
        out.push(
          this._handle(
            p,
            line === "sand_back" ? "sand back" : "sand",
            (e) =>
              this._start_drag(e, {
                type: "sand",
                water: this._water_id,
                index,
                line,
              }),
            i18n._("aq_sand_point"),
            (e) => {
              // A double click removes the point (2 stay)
              e.stopPropagation();
              this.change(
                ops.remove_sand_point(
                  this._doc!,
                  this._view_id!,
                  this._water_id,
                  index,
                  line,
                ),
              );
            },
          ),
        ),
      );
    }
    if (sel?.type === "decor" || sel?.type === "hotspot") {
      const kind = sel.type === "decor" ? "decor" : "hotspots";
      const item = (view[kind] as (Decor | Hotspot)[]).find(
        (x) => x.id === sel.id,
      );
      item?.poly.forEach((p, index) =>
        out.push(
          this._handle(p, "vertex", (e) =>
            this._start_drag(e, { type: "vertex", kind, id: sel.id, index }),
          ),
        ),
      );
    }
    for (const p of this._drawing)
      out.push(this._handle(p, "point", () => undefined));
    return out;
  }

  private _render_element(el: SceneElement): TemplateResult {
    const hass = this._hass!;
    const selected =
      this._selection?.type === "element" && this._selection.id === el.id;
    const feeding = el.roles.includes("feeding_point");
    let body: TemplateResult;
    if (el.kind === "device" && el.device_id) {
      const thumb = device_thumbnail(hass, this._devices, el.device_id);
      const name = el.label || device_name(hass, el.device_id);
      body = thumb
        ? html`<img src="${thumb}" alt="${name}" draggable="false" />`
        : html`<span class="chip"
            ><svg viewBox="0 0 24 24"><path d="${mdiDevices}"></path></svg
            >${name}</span
          >`;
    } else if (el.kind === "entity" && el.entity_id) {
      const s = hass.states?.[el.entity_id];
      const text = `${el.label || s?.attributes?.friendly_name || el.entity_id}: ${s?.state ?? "?"}`;
      body = html`<span class="chip">${text}</span>`;
    } else {
      // A marker shows its role in its own icon: no badge
      body = html`<span class="chip"
        ><svg viewBox="0 0 24 24">
          <path d="${feeding ? mdiShakerOutline : mdiMapMarker}"></path></svg
        >${el.label}</span
      >`;
    }
    return html`<div
      class="el ${selected ? "selected" : ""}"
      style="left:${el.pos[0] * 100}%;top:${el.pos[1] *
      100}%;transform:translate(-50%,-50%) scale(${el.scale || 1})"
      @pointerdown=${(e: PointerEvent) => {
        this._selection = { type: "element", id: el.id };
        this._start_drag(e, { type: "element", id: el.id });
      }}
    >
      ${body}
      ${feeding && el.kind !== "marker"
        ? html`<span class="badge" title="${i18n._("aq_feeding_point")}"
            ><svg viewBox="0 0 24 24">
              <path d="${mdiShakerOutline}"></path></svg
          ></span>`
        : nothing}
    </div>`;
  }

  private _render_coral_marks(): TemplateResult[] {
    const doc = this._doc!;
    const out: TemplateResult[] = [];
    for (const [water_id, water] of Object.entries(doc.waters)) {
      for (const coral of water.corals) {
        if ((coral.view ?? this._view_id) !== this._view_id) continue;
        const species = this._species_coral(coral.species);
        const colour = species
          ? rgb_hex(coral_palette(species, coral.palette)[1])
          : "#ff6b81";
        const selected =
          this._selection?.type === "coral" && this._selection.id === coral.id;
        out.push(
          html`<div
            class="coral ${selected ? "selected" : ""}"
            style="left:${coral.pos[0] * 100}%;top:${coral.pos[1] *
            100}%;--c:${colour}"
            title="${coral.name || species_name(species, coral.species)}"
            @pointerdown=${(e: PointerEvent) => {
              this._selection = {
                type: "coral",
                id: coral.id,
                water: water_id,
              };
              this._start_drag(e, {
                type: "coral",
                water: water_id,
                id: coral.id,
              });
            }}
          ></div>`,
        );
      }
    }
    return out;
  }

  /** Homes of the inventory lines of every water outlined on the view. */
  private _render_home_marks(): TemplateResult[] {
    const doc = this._doc!;
    const out: TemplateResult[] = [];
    for (const [water_id, water] of Object.entries(doc.waters)) {
      const projection = this._projection(water_id);
      if (!projection) continue;
      for (const line of water.livestock) {
        if (!line.home) continue;
        const [x, y] = projection.to_picture(...line.home);
        const species = this._species_fish(line.species);
        out.push(
          html`<div
            class="home"
            style="left:${x * 100}%;top:${y * 100}%"
            title="${line.name || species_name(species, line.species)}"
            @pointerdown=${(e: PointerEvent) =>
              this._start_drag(e, {
                type: "home",
                water: water_id,
                line: line.id,
              })}
          >
            <svg viewBox="0 0 24 24"><path d="${mdiHome}"></path></svg>
          </div>`,
        );
      }
    }
    return out;
  }

  private _render_lamp_marks(view: View): TemplateResult[] {
    const out: TemplateResult[] = [];
    for (const region of view.regions) {
      if (!WaterProjection.valid(region.quad)) continue;
      const projection = new WaterProjection(region.quad);
      const water = this._doc!.waters[region.water];
      water?.lights.forEach((light, index) => {
        const p = projection.to_picture(light.x, 0, 0);
        out.push(
          html`<div
            class="lamp"
            style="left:${p[0] * 100}%;top:${p[1] * 100}%"
            title="${light.device_id
              ? device_name(this._hass!, light.device_id)
              : light.entity_id}"
            @pointerdown=${(e: PointerEvent) =>
              this._start_drag(e, { type: "lamp", water: region.water, index })}
          >
            ☀
          </div>`,
        );
      });
    }
    return out;
  }

  // ── Rendering: panels ──────────────────────────────────────────────────────

  private _water_select(): TemplateResult {
    const doc = this._doc!;
    return html`<label class="field"
      >${i18n._("aq_water")}
      <select
        @change=${(e: Event) =>
          (this._water_id = (e.target as HTMLSelectElement).value)}
      >
        ${Object.entries(doc.waters).map(
          ([id, w]) =>
            html`<option value="${id}" ?selected=${id === this._water_id}>
              ${water_label(id, w.name)}
            </option>`,
        )}
      </select>
    </label>`;
  }

  private _panel_aquarium(): TemplateResult {
    const doc = this._doc!;
    const d = doc.dimensions_cm;
    const set_dim = (key: "length" | "width" | "height", value: string) => {
      const current = doc.dimensions_cm ?? {
        length: 100,
        width: 50,
        height: 50,
      };
      const next = { ...current, [key]: Math.max(1, Number(value) || 1) };
      this.change({ ...structuredClone(doc), dimensions_cm: next });
    };
    const presets = this._catalog?.presets ?? [];
    return html`
      <label class="field"
        >${i18n._("aq_name")}
        <input
          .value=${doc.name}
          @change=${(e: Event) =>
            this.change({
              ...structuredClone(doc),
              name: (e.target as HTMLInputElement).value,
            })}
      /></label>
      ${this._clouds.length
        ? html`<label class="field"
            >${i18n._("aq_cloud_aquarium")}
            <select
              @change=${(e: Event) => {
                const uid = (e.target as HTMLSelectElement).value;
                const cloud = this._clouds.find((c) => c.uid === uid);
                if (cloud) this._apply_cloud(cloud);
              }}
            >
              <option value="">—</option>
              ${this._clouds.map(
                (c) =>
                  html`<option
                    value="${c.uid}"
                    ?selected=${doc.cloud?.uid === c.uid}
                  >
                    ${c.name}${c.system_model ? ` (${c.system_model})` : ""}
                  </option>`,
              )}
            </select>
            <span class="hint">${i18n._("aq_cloud_hint")}</span>
          </label>`
        : nothing}
      ${presets.length
        ? html`<label class="field"
            >${i18n._("aq_preset")}
            <select
              @change=${(e: Event) => {
                const preset = presets.find(
                  (p) => p.id === (e.target as HTMLSelectElement).value,
                );
                if (preset) {
                  this.change(ops.apply_preset(doc, preset));
                  this._view_id = this._doc!.default_view ?? null;
                }
              }}
            >
              <option value="">—</option>
              ${presets.map(
                (p) =>
                  html`<option value="${p.id}" ?selected=${doc.preset === p.id}>
                    ${species_name({ ...p, id: p.name ?? p.id }, p.id)}
                  </option>`,
              )}
            </select>
          </label>`
        : nothing}
      <fieldset>
        <legend>${i18n._("aq_dimensions")}</legend>
        <div class="row3">
          ${(["length", "width", "height"] as const).map(
            (k) =>
              html`<label class="field small"
                >${i18n._(`aq_dim_${k}`)}
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  .value=${d ? String(d[k]) : ""}
                  @change=${(e: Event) =>
                    set_dim(k, (e.target as HTMLInputElement).value)}
              /></label>`,
          )}
        </div>
      </fieldset>
      <fieldset>
        <legend>${i18n._("aq_rendering")}</legend>
        <label class="field"
          >${i18n._("aq_render_level")}
          <select
            @change=${(e: Event) =>
              this.change({
                ...structuredClone(doc),
                render: {
                  ...doc.render,
                  level: (e.target as HTMLSelectElement).value as any,
                },
              })}
          >
            ${RENDER_LEVELS.map(
              (l) =>
                html`<option value="${l}" ?selected=${doc.render.level === l}>
                  ${i18n._(`aq_render_${l}`)}
                </option>`,
            )}
          </select>
        </label>
        <label class="field"
          >${i18n._("aq_max_fish")}
          <input
            type="number"
            min="0"
            max="200"
            .value=${String(doc.render.max_fish)}
            @change=${(e: Event) =>
              this.change({
                ...structuredClone(doc),
                render: {
                  ...doc.render,
                  max_fish: Math.max(
                    0,
                    Math.min(
                      200,
                      Number((e.target as HTMLInputElement).value) || 0,
                    ),
                  ),
                },
              })}
          />
        </label>
        <label class="field"
          >${i18n._("aq_photo_light")}
          <select
            @change=${(e: Event) =>
              this.change({
                ...structuredClone(doc),
                photo_light: (e.target as HTMLSelectElement).value as any,
              })}
          >
            <option value="white" ?selected=${doc.photo_light === "white"}>
              ${i18n._("aq_photo_white")}
            </option>
            <option value="blue" ?selected=${doc.photo_light === "blue"}>
              ${i18n._("aq_photo_blue")}
            </option>
          </select>
        </label>
      </fieldset>
      ${!this._is_new
        ? html`<button class="danger" @click=${this._delete_aquarium}>
            ${i18n._("aq_delete_aquarium")}
          </button>`
        : nothing}
    `;
  }

  private _apply_cloud(cloud: CloudAquarium): void {
    const doc = this._doc!;
    const filled = ops.from_cloud(cloud, this._is_lamp);
    const next = structuredClone(doc);
    next.cloud = filled.cloud;
    if (!next.dimensions_cm) next.dimensions_cm = filled.dimensions_cm;
    if (
      this._is_new &&
      (!next.name || next.name === i18n._("aq_new_aquarium_name"))
    )
      next.name = filled.name;
    for (const light of filled.waters.main.lights) {
      if (!next.waters.main) next.waters.main = ops.empty_water();
      if (!next.waters.main.lights.some((l) => l.device_id === light.device_id))
        next.waters.main.lights.push(light);
    }
    for (const source of filled.feeding.sources) {
      if (!next.feeding.sources.some((s) => s.entity_id === source.entity_id))
        next.feeding.sources.push(source);
    }
    let out = next;
    const preset = ops.match_preset(this._catalog?.presets ?? [], cloud);
    if (preset && !Object.keys(out.views).length)
      out = ops.apply_preset(out, preset);
    this.change(out);
    if (!this._view_id) this._view_id = out.default_view ?? null;
  }

  private _panel_views(): TemplateResult {
    const doc = this._doc!;
    const view = this._view;
    const v = this._view_id;
    const region = view?.regions.find((r) => r.water === this._water_id);
    const sel = this._selection;
    const selected_decor =
      sel?.type === "decor"
        ? view?.decor.find((d) => d.id === sel.id)
        : undefined;
    const selected_hotspot =
      sel?.type === "hotspot"
        ? view?.hotspots.find((h) => h.id === sel.id)
        : undefined;
    const other_views = Object.entries(doc.views).filter(([id]) => id !== v);
    return html`
      <div class="list">
        ${Object.entries(doc.views).map(
          ([id, vw]) =>
            html`<div
              class="item ${id === v ? "current" : ""}"
              @click=${() => ((this._view_id = id), (this._selection = null))}
            >
              <span
                >${vw.name || i18n._("aq_view_unnamed")}${doc.default_view ===
                id
                  ? " ★"
                  : ""}</span
              >
            </div>`,
        )}
      </div>
      <button
        @click=${() => {
          const [next, id] = ops.add_view(
            doc,
            `${i18n._("aq_view")} ${Object.keys(doc.views).length + 1}`,
          );
          this.change(next);
          this._view_id = id;
        }}
      >
        + ${i18n._("aq_add_view")}
      </button>
      ${view && v
        ? html`
            <fieldset>
              <legend>${i18n._("aq_this_view")}</legend>
              <label class="field"
                >${i18n._("aq_name")}
                <input
                  .value=${view.name}
                  @change=${(e: Event) =>
                    this.change(
                      ops.update_view(doc, v, {
                        name: (e.target as HTMLInputElement).value,
                      }),
                    )}
              /></label>
              <label class="field"
                >${i18n._("aq_picture")}
                <input
                  type="file"
                  accept="image/*"
                  ?disabled=${this._busy}
                  @change=${this._upload}
                />
                <span class="hint">${i18n._("aq_picture_hint")}</span>
              </label>
              <div class="buttons">
                ${doc.default_view !== v
                  ? html`<button
                      @click=${() =>
                        this.change({
                          ...structuredClone(doc),
                          default_view: v,
                        })}
                    >
                      ${i18n._("aq_make_default")}
                    </button>`
                  : nothing}
                <button
                  class="danger"
                  @click=${() => (
                    this.change(ops.remove_view(doc, v)),
                    (this._view_id = this._doc!.default_view ?? null)
                  )}
                >
                  ${i18n._("aq_delete_view")}
                </button>
              </div>
            </fieldset>
            <fieldset>
              <legend>${i18n._("aq_water_outline")}</legend>
              ${this._water_select()}
              <div class="buttons">
                <button
                  @click=${() => {
                    const id = Object.keys(doc.waters).includes("sump")
                      ? `water${Object.keys(doc.waters).length + 1}`
                      : "sump";
                    this.change(ops.add_water(doc, id));
                    this._water_id = id;
                  }}
                >
                  + ${i18n._("aq_add_water")}
                </button>
                <button
                  class="${this._tool === "region" ? "active" : ""}"
                  @click=${() => {
                    if (!region || region.quad.length !== 4)
                      this.change(
                        ops.set_region(
                          doc,
                          v,
                          this._water_id,
                          rect_quad(0.1, 0.1, 0.9, 0.6),
                        ),
                      );
                    this._tool = "region";
                  }}
                >
                  ${region?.quad.length === 4
                    ? i18n._("aq_edit_outline")
                    : i18n._("aq_outline")}
                </button>
                ${region
                  ? html`<button
                      class="danger"
                      @click=${() =>
                        this.change(ops.remove_region(doc, v, this._water_id))}
                    >
                      ${i18n._("aq_remove_outline")}
                    </button>`
                  : nothing}
              </div>
              <span class="hint">${i18n._("aq_outline_hint")}</span>
            </fieldset>
            ${this._sand_fieldset()} ${this._backdrop_fieldset()}
            <fieldset>
              <legend>${i18n._("aq_decor")}</legend>
              <div class="buttons">
                ${(["front", "middle", "back"] as ops.DepthName[]).map(
                  (name) =>
                    html`<button
                      class="depth ${this._depth === name ? "active" : ""}"
                      style="--c:${DEPTH_COLOURS[name]}"
                      @click=${() => {
                        this._depth = name;
                        if (selected_decor)
                          this.change(
                            ops.update_decor(doc, v, selected_decor.id, {
                              z: ops.DEPTHS[name],
                            }),
                          );
                      }}
                    >
                      ${i18n._(`aq_depth_${name}`)}
                    </button>`,
                )}
              </div>
              <div class="buttons">
                ${this._tool_button("decor", "aq_tool_polygon")}
                ${this._tool_button("lasso", "aq_tool_lasso")}
                ${this._tool_button("select", "aq_tool_select")}
                ${this._drawing.length >= 3
                  ? html`<button @click=${this._finish_shape}>
                      ${i18n._("aq_finish_shape")}
                    </button>`
                  : nothing}
                ${selected_decor
                  ? html`<button
                      class="danger"
                      @click=${this._delete_selection}
                    >
                      ${i18n._("aq_delete")}
                    </button>`
                  : nothing}
              </div>
              <span class="hint">${i18n._("aq_decor_hint")}</span>
            </fieldset>
            <fieldset>
              <legend>${i18n._("aq_hotspots")}</legend>
              ${other_views.length
                ? html`<label class="field"
                      >${i18n._("aq_hotspot_target")}
                      <select
                        @change=${(e: Event) => {
                          const goto = (e.target as HTMLSelectElement).value;
                          this._hotspot_target = goto;
                          if (selected_hotspot)
                            this.change(
                              ops.update_hotspot(doc, v, selected_hotspot.id, {
                                goto,
                              }),
                            );
                        }}
                      >
                        ${other_views.map(
                          ([id, vw]) =>
                            html`<option
                              value="${id}"
                              ?selected=${(selected_hotspot?.goto ??
                                this._hotspot_target) === id}
                            >
                              ${vw.name || id}
                            </option>`,
                        )}
                      </select>
                    </label>
                    <div class="buttons">
                      ${this._tool_button("hotspot", "aq_tool_hotspot")}
                      ${selected_hotspot
                        ? html`<button
                            class="danger"
                            @click=${this._delete_selection}
                          >
                            ${i18n._("aq_delete")}
                          </button>`
                        : nothing}
                    </div>`
                : html`<span class="hint"
                    >${i18n._("aq_hotspot_needs_view")}</span
                  >`}
            </fieldset>
          `
        : nothing}
    `;
  }

  /** Where the sand meets the front glass and the back wall. */
  private _sand_fieldset(): TemplateResult | typeof nothing {
    const v = this._view_id!;
    const region = this._view?.regions.find((r) => r.water === this._water_id);
    if (!region || !WaterProjection.valid(region.quad)) return nothing;
    const row = (line: ops.SandLine) => {
      const has_line = (region[line]?.length ?? 0) >= 2;
      const editing = this._tool === "sand" && this._sand_line === line;
      const back = line === "sand_back";
      return html`<div class="buttons">
        <span class="grow"
          >${i18n._(back ? "aq_sand_back" : "aq_sand_front")}</span
        >
        <button
          class="${editing ? "active" : ""}"
          @click=${() => {
            const points = has_line
              ? null
              : this._default_sand(this._water_id, line);
            if (points)
              this.change(
                ops.set_sand_line(this._doc!, v, this._water_id, points, line),
              );
            this._sand_line = line;
            this._tool = "sand";
          }}
        >
          ${i18n._(has_line ? "aq_sand_edit" : "aq_sand_draw")}
        </button>
        ${has_line
          ? html`<button
              class="danger"
              @click=${() => {
                this.change(
                  ops.set_sand_line(this._doc!, v, this._water_id, [], line),
                );
                this._tool = "select";
              }}
            >
              ${i18n._("aq_delete")}
            </button>`
          : nothing}
      </div>`;
    };
    return html`<fieldset>
      <legend>${i18n._("aq_sand_line")}</legend>
      ${row("sand")} ${row("sand_back")}
      <span class="hint">${i18n._("aq_sand_hint")}</span>
    </fieldset>`;
  }

  /** The water drawn instead of photographed, and the textures. */
  private _backdrop_fieldset(): TemplateResult {
    const v = this._view_id!;
    const view = this._view!;
    const region = view.regions.find((r) => r.water === this._water_id);
    const backdrop = view.backdrop ?? { mode: "photo" as const };
    // From the document at the time of the change (several in a row)
    const set = (patch: Partial<NonNullable<View["backdrop"]>>) =>
      this.change(
        ops.update_view(this._doc!, v, {
          backdrop: {
            ...(this._view?.backdrop ?? { mode: "photo" }),
            ...patch,
          },
        }),
      );
    const textures = this._catalog?.textures ?? [];
    const select = (role: "rock" | "sand") => {
      const list = textures.filter((t) => t.role === role);
      return html`<label class="field small"
        >${i18n._(`aq_texture_${role}`)}
        <select
          @change=${(e: Event) =>
            set({ [role]: (e.target as HTMLSelectElement).value || null })}
        >
          <option value="" ?selected=${!backdrop[role]}>
            ${i18n._(list.length ? "aq_texture_default" : "aq_texture_builtin")}
          </option>
          ${list.map(
            (t) =>
              html`<option value="${t.id}" ?selected=${backdrop[role] === t.id}>
                ${species_name(t, t.id)}
              </option>`,
          )}
        </select>
      </label>`;
    };
    return html`<fieldset>
      <legend>${i18n._("aq_backdrop")}</legend>
      ${region && WaterProjection.valid(region.quad)
        ? html`<label class="check"
            ><input
              type="checkbox"
              .checked=${drawn_region(view, region)}
              @change=${(e: Event) =>
                this.change(
                  ops.set_region_drawn(
                    this._doc!,
                    v,
                    this._water_id,
                    (e.target as HTMLInputElement).checked,
                  ),
                )}
            />${i18n._("aq_backdrop_drawn_water")}</label
          >`
        : nothing}
      <div class="row3">${select("rock")} ${select("sand")}</div>
      <label class="check"
        ><input
          type="checkbox"
          .checked=${this._preview}
          @change=${(e: Event) =>
            (this._preview = (e.target as HTMLInputElement).checked)}
        />${i18n._("aq_backdrop_preview")}</label
      >
      <span class="hint">${i18n._("aq_backdrop_hint")}</span>
    </fieldset>`;
  }

  /** Home of an inventory line: place it on the stage, its depth, clear. */
  private _home_controls(
    line: LivestockLine,
    set: (patch: Partial<LivestockLine>) => void,
  ): TemplateResult {
    const placing = this._tool === "home" && this._home_line === line.id;
    return html`<div class="line home-row">
      <span class="grow">${i18n._("aq_home")}</span>
      <button
        class="${placing ? "active" : ""}"
        @click=${() => {
          this._tool = placing ? "select" : "home";
          this._home_line = placing ? null : line.id;
        }}
      >
        ${i18n._(line.home ? "aq_home_move" : "aq_home_place")}
      </button>
      ${line.home
        ? html`<select
              title="${i18n._("aq_depth")}"
              @change=${(e: Event) =>
                set({
                  home: [
                    line.home![0],
                    line.home![1],
                    ops.DEPTHS[
                      (e.target as HTMLSelectElement).value as ops.DepthName
                    ],
                  ],
                })}
            >
              ${(["front", "middle", "back"] as ops.DepthName[]).map(
                (n) =>
                  html`<option
                    value="${n}"
                    ?selected=${ops.depth_name(line.home![2]) === n}
                  >
                    ${i18n._(`aq_depth_${n}`)}
                  </option>`,
              )}
            </select>
            <button class="icon" @click=${() => set({ home: null })}>✕</button>`
        : nothing}
    </div>`;
  }

  private _tool_button(tool: Tool, label: string): TemplateResult {
    return html`<button
      class="${this._tool === tool ? "active" : ""}"
      @click=${() => {
        this._tool = tool;
        this._drawing = [];
      }}
    >
      ${i18n._(label)}
    </button>`;
  }

  /** An HA icon when the frontend provides it, else an mdi path. */
  private _icon(icon: string | null, fallback: string): TemplateResult {
    return icon && customElements.get("ha-icon")
      ? html`<ha-icon .icon=${icon}></ha-icon>`
      : html`<svg viewBox="0 0 24 24"><path d="${fallback}"></path></svg>`;
  }

  private _is_open(key: string): boolean {
    return Boolean(this._search.trim()) || this._expanded.has(key);
  }

  private _toggle(key: string): void {
    if (this._expanded.has(key)) this._expanded.delete(key);
    else this._expanded.add(key);
    this.requestUpdate();
  }

  private _chevron(open: boolean): TemplateResult {
    return html`<svg class="chevron ${open ? "open" : ""}" viewBox="0 0 24 24">
      <path d="${mdiChevronRight}"></path>
    </svg>`;
  }

  private _add_button(kind: "device" | "entity", ref: string): TemplateResult {
    return html`<button
      class="add"
      title="${i18n._("aq_add")}"
      @pointerdown=${(e: Event) => e.stopPropagation()}
      @click=${(e: Event) => {
        e.stopPropagation();
        this._add_element(kind, ref);
      }}
    >
      +
    </button>`;
  }

  private _render_tree_entity(ent: TreeEntity, depth: number): TemplateResult {
    const hass = this._hass;
    const state = hass?.states?.[ent.entity_id];
    const icon =
      state && customElements.get("ha-state-icon")
        ? html`<ha-state-icon .hass=${hass} .stateObj=${state}></ha-state-icon>`
        : html`<svg viewBox="0 0 24 24">
            <path d="${mdiShapeOutline}"></path>
          </svg>`;
    return html`<div
      class="tree-row entity"
      style="--depth:${depth}"
      @pointerdown=${(e: PointerEvent) =>
        this._tree_down(e, "entity", ent.entity_id, ent.name)}
      title="${i18n._("aq_drag_hint")}"
    >
      ${icon}
      <span class="label"
        ><span class="name">${ent.name}</span
        ><span class="sub">${ent.entity_id}</span></span
      >
      ${this._add_button("entity", ent.entity_id)}
    </div>`;
  }

  private _render_tree_device(dev: TreeDevice, depth: number): TemplateResult {
    const key = `device:${dev.id}`;
    const has_children = dev.entities.length + dev.children.length > 0;
    const open = has_children && this._is_open(key);
    const brand =
      dev.domain && !this._no_brand.has(dev.domain)
        ? html`<img
            class="brand"
            src="https://brands.home-assistant.io/_/${dev.domain}/icon.png"
            alt=""
            referrerpolicy="no-referrer"
            draggable="false"
            @error=${() => {
              this._no_brand.add(dev.domain);
              this.requestUpdate();
            }}
          />`
        : html`<svg viewBox="0 0 24 24"><path d="${mdiDevices}"></path></svg>`;
    return html`<div
        class="tree-row device"
        style="--depth:${depth}"
        @pointerdown=${(e: PointerEvent) =>
          this._tree_down(e, "device", dev.id, dev.name)}
        @click=${() => has_children && this._toggle(key)}
        title="${i18n._("aq_drag_hint")}"
      >
        ${brand}
        <span class="label"
          ><span class="name">${dev.name}</span>${dev.model &&
          dev.model !== dev.name
            ? html`<span class="sub">${dev.model}</span>`
            : nothing}</span
        >
        ${this._add_button("device", dev.id)}
        ${has_children
          ? this._chevron(open)
          : html`<span class="chevron"></span>`}
      </div>
      ${open
        ? html`${dev.entities.map((e) =>
            this._render_tree_entity(e, depth + 1),
          )}
          ${dev.children.map((c) => this._render_tree_device(c, depth + 1))}`
        : nothing}`;
  }

  private _render_tree_area(area: TreeArea, depth: number): TemplateResult {
    const key = `area:${area.id}`;
    const open = this._is_open(key);
    const count = area.devices.length + area.entities.length;
    return html`<div
        class="tree-row group area"
        style="--depth:${depth}"
        @click=${() => this._toggle(key)}
      >
        ${area.id
          ? this._icon(area.icon, mdiTextureBox)
          : this._icon(null, mdiDevices)}
        <span class="label"
          ><span class="name"
            >${area.id ? area.name : i18n._("aq_unassigned")}</span
          ></span
        >
        <span class="count">${count}</span>
        ${this._chevron(open)}
      </div>
      ${open
        ? html`${area.devices.map((d) =>
            this._render_tree_device(d, depth + 1),
          )}
          ${area.entities.map((e) => this._render_tree_entity(e, depth + 1))}`
        : nothing}`;
  }

  private _render_tree_floor(floor: TreeFloor): TemplateResult {
    const key = `floor:${floor.id}`;
    const open = this._is_open(key);
    return html`<div
        class="tree-row group floor"
        style="--depth:0"
        @click=${() => this._toggle(key)}
      >
        ${this._icon(floor_icon(floor), mdiHome)}
        <span class="label"><span class="name">${floor.name}</span></span>
        ${this._chevron(open)}
      </div>
      ${open ? floor.areas.map((a) => this._render_tree_area(a, 1)) : nothing}`;
  }

  private _panel_elements(): TemplateResult {
    const doc = this._doc!;
    const v = this._view_id;
    const linked = doc.cloud
      ? this._clouds.find((c) => c.uid === doc.cloud!.uid)
      : undefined;
    const hass = this._hass;
    const place = hass
      ? aquarium_place(hass, doc.id, linked?.device_ids ?? [])
      : null;
    // Open the aquarium's floor and area once per aquarium
    if (this._expanded_for !== (doc.id ?? "")) {
      this._expanded_for = doc.id ?? "";
      this._expanded = new Set();
      if (place) {
        if (place.floor_id) this._expanded.add(`floor:${place.floor_id}`);
        this._expanded.add(`area:${place.area_id}`);
      }
    }
    const scoped = Boolean(place) && !this._all_areas;
    const tree = hass
      ? build_tree(hass, {
          search: this._search,
          scope: scoped
            ? {
                areas: new Set([place!.area_id]),
                devices: new Set(linked?.device_ids ?? []),
              }
            : null,
        })
      : null;
    const sel = this._selection;
    const element =
      sel?.type === "element"
        ? this._view?.elements.find((e) => e.id === sel.id)
        : undefined;
    return html`
      ${element && v ? this._element_properties(element, v) : nothing}
      <input
        class="search"
        placeholder="${i18n._("aq_search")}"
        .value=${this._search}
        @input=${(e: Event) =>
          (this._search = (e.target as HTMLInputElement).value)}
      />
      ${place
        ? html`<label class="switch"
            ><input
              type="checkbox"
              .checked=${this._all_areas}
              @change=${(e: Event) =>
                (this._all_areas = (e.target as HTMLInputElement).checked)}
            /><span class="slider"></span> ${i18n._("aq_all_areas")}</label
          >`
        : nothing}
      <button
        @click=${() =>
          v &&
          this.change(
            ops.add_element(doc, v, {
              kind: "marker",
              pos: [0.5, 0.2],
              roles: ["feeding_point"],
              label: "",
            })[0],
          )}
      >
        + ${i18n._("aq_add_marker")}
      </button>
      <div class="tree">
        ${tree?.floors.map((f) => this._render_tree_floor(f))}
        ${tree?.areas.map((a) => this._render_tree_area(a, 0))}
        ${tree?.unassigned
          ? this._render_tree_area(tree.unassigned, 0)
          : nothing}
        ${!tree || tree_empty(tree)
          ? html`<div class="hint">${i18n._("aq_no_match")}</div>`
          : nothing}
      </div>
    `;
  }

  private _element_properties(
    element: SceneElement,
    v: string,
  ): TemplateResult {
    const doc = this._doc!;
    const set = (patch: Partial<SceneElement>) =>
      this.change(ops.update_element(doc, v, element.id, patch));
    const feeding = element.roles.includes("feeding_point");
    return html`<fieldset class="props">
      <legend>
        ${element.kind === "device"
          ? device_name(this._hass!, element.device_id)
          : element.entity_id || i18n._("aq_marker")}
      </legend>
      <label class="field"
        >${i18n._("aq_label")}
        <input
          .value=${element.label}
          @change=${(e: Event) =>
            set({ label: (e.target as HTMLInputElement).value })}
      /></label>
      ${element.kind === "entity"
        ? html`<label class="field"
            >${i18n._("aq_element_type")}
            <select
              @change=${(e: Event) =>
                set({ type: (e.target as HTMLSelectElement).value })}
            >
              ${["common-sensor", "common-switch"].map(
                (t) =>
                  html`<option
                    value="${t}"
                    ?selected=${(element.type ?? "common-sensor") === t}
                  >
                    ${i18n._(`aq_type_${t.replace("common-", "")}`)}
                  </option>`,
              )}
            </select>
          </label>`
        : nothing}
      <label class="field"
        >${i18n._("aq_scale")}
        <input
          type="range"
          min="0.4"
          max="3"
          step="0.1"
          .value=${String(element.scale)}
          @change=${(e: Event) =>
            set({ scale: Number((e.target as HTMLInputElement).value) })}
      /></label>
      <label class="check"
        ><input
          type="checkbox"
          .checked=${feeding}
          @change=${(e: Event) =>
            set({
              roles: (e.target as HTMLInputElement).checked
                ? ["feeding_point"]
                : [],
            })}
        />
        ${i18n._("aq_feeding_point")}</label
      >
      ${feeding && doc.feeding.sources.length
        ? html`<label class="field"
            >${i18n._("aq_feeding_source")}
            <select
              @change=${(e: Event) =>
                set({ source: (e.target as HTMLSelectElement).value || null })}
            >
              <option value="" ?selected=${!element.source}>
                ${i18n._("aq_any_source")}
              </option>
              ${doc.feeding.sources.map(
                (s) =>
                  html`<option
                    value="${s.id}"
                    ?selected=${element.source === s.id}
                  >
                    ${s.entity_id}
                  </option>`,
              )}
            </select>
          </label>`
        : nothing}
      <button class="danger" @click=${this._delete_selection}>
        ${i18n._("aq_delete")}
      </button>
    </fieldset>`;
  }

  private _panel_lights(): TemplateResult {
    const doc = this._doc!;
    const water = doc.waters[this._water_id];
    const lamps = Object.keys((this._hass?.devices as any) ?? {}).filter(
      this._is_lamp,
    );
    const light_entities = this._entity_ids(["light"]);
    const flow_entities = this._entity_ids([
      "number",
      "sensor",
      "switch",
      "input_number",
      "fan",
    ]);
    return html`
      ${this._water_select()}
      ${water
        ? html`
            <fieldset>
              <legend>${i18n._("aq_lights")}</legend>
              ${water.lights.map(
                (l, i) =>
                  html`<div class="line">
                    <span class="grow"
                      >${l.device_id
                        ? device_name(this._hass!, l.device_id)
                        : l.entity_id}</span
                    >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      .value=${String(l.x)}
                      title="${i18n._("aq_light_position")}"
                      @change=${(e: Event) =>
                        this.change(
                          ops.update_light(doc, this._water_id, i, {
                            x: Number((e.target as HTMLInputElement).value),
                          }),
                        )}
                    />
                    <button
                      class="icon"
                      @click=${() =>
                        this.change(ops.remove_light(doc, this._water_id, i))}
                    >
                      ✕
                    </button>
                  </div>`,
              )}
              <select
                @change=${(e: Event) => {
                  const value = (e.target as HTMLSelectElement).value;
                  (e.target as HTMLSelectElement).value = "";
                  if (!value) return;
                  const [kind, ref] = value.split("|");
                  this.change(
                    ops.add_light(
                      doc,
                      this._water_id,
                      kind === "device"
                        ? { device_id: ref }
                        : { entity_id: ref },
                    ),
                  );
                }}
              >
                <option value="">+ ${i18n._("aq_add_light")}</option>
                ${lamps.map(
                  (id) =>
                    html`<option value="device|${id}">
                      ${device_name(this._hass!, id)}
                    </option>`,
                )}
                ${light_entities.map(
                  (id) => html`<option value="entity|${id}">${id}</option>`,
                )}
              </select>
              <span class="hint">${i18n._("aq_lights_hint")}</span>
            </fieldset>
            <fieldset>
              <legend>${i18n._("aq_flow")}</legend>
              ${water.flow.map(
                (id) =>
                  html`<div class="line">
                    <span class="grow">${id}</span>
                    <button
                      class="icon"
                      @click=${() =>
                        this.change(
                          ops.set_flow(
                            doc,
                            this._water_id,
                            water.flow.filter((f) => f !== id),
                          ),
                        )}
                    >
                      ✕
                    </button>
                  </div>`,
              )}
              <input
                list="flow_entities"
                placeholder="+ ${i18n._("aq_add_flow")}"
                @change=${(e: Event) => {
                  const value = (e.target as HTMLInputElement).value.trim();
                  (e.target as HTMLInputElement).value = "";
                  if (value)
                    this.change(
                      ops.set_flow(doc, this._water_id, [...water.flow, value]),
                    );
                }}
              />
              <datalist id="flow_entities">
                ${flow_entities.map(
                  (id) => html`<option value="${id}"></option>`,
                )}
              </datalist>
              <span class="hint">${i18n._("aq_flow_hint")}</span>
            </fieldset>
            <label class="field"
              >${i18n._("aq_sand_band")}
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                .value=${String(water.sand_band)}
                @change=${(e: Event) =>
                  this.change(
                    ops.update_water(doc, this._water_id, {
                      sand_band: Number((e.target as HTMLInputElement).value),
                    }),
                  )}
              />
            </label>
          `
        : nothing}
    `;
  }

  /**
   * Search field with a list of species (thumbnail, name, id). A fish name
   * that is not in the catalog can be added too (a generic fish).
   */
  private _species_picker(
    kind: "fish" | "coral",
    list: (FishSpecies | CoralSpecies)[],
    placeholder: string,
    on_pick: (id: string) => void,
  ): TemplateResult {
    const open = this._picker?.kind === kind;
    const text = open ? this._picker!.text : "";
    const query = text.trim().toLowerCase();
    const matches = list.filter(
      (s) =>
        !query ||
        s.id.toLowerCase().includes(query) ||
        species_name(s, s.id).toLowerCase().includes(query) ||
        (s.scientific ?? "").toLowerCase().includes(query) ||
        Object.values(s.names ?? {}).some((n) =>
          n.toLowerCase().includes(query),
        ),
    );
    const exact = list.some(
      (s) => s.id === text.trim() || species_name(s, s.id) === text.trim(),
    );
    const pick = (id: string) => {
      this._picker = null;
      on_pick(id);
    };
    return html`<div class="picker">
      <input
        class="search"
        placeholder="${placeholder}"
        .value=${text}
        @focus=${() => (this._picker = { kind, text })}
        @blur=${() => (this._picker = null)}
        @input=${(e: Event) =>
          (this._picker = { kind, text: (e.target as HTMLInputElement).value })}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === "Escape") (e.target as HTMLInputElement).blur();
          if (e.key !== "Enter") return;
          const value = text.trim();
          const found =
            list.find(
              (s) => s.id === value || species_name(s, s.id) === value,
            ) ?? (matches.length === 1 ? matches[0] : undefined);
          if (found) pick(found.id);
          else if (value && kind === "fish") pick(value);
        }}
      />
      ${open
        ? html`<div class="picker-list">
            ${matches.map(
              (s) =>
                html`<button
                  class="pick"
                  @mousedown=${(e: Event) => e.preventDefault()}
                  @click=${() => pick(s.id)}
                >
                  ${species_thumb(s, kind)}
                  <span class="grow">${species_name(s, s.id)}</span>
                  ${s.scientific
                    ? html`<small><i>${s.scientific}</i></small>`
                    : html`<small>${s.id}</small>`}
                </button>`,
            )}
            ${kind === "fish" && query && !exact
              ? html`<button
                  class="pick custom"
                  @mousedown=${(e: Event) => e.preventDefault()}
                  @click=${() => pick(text.trim())}
                >
                  ${species_thumb(undefined, kind)}
                  <span class="grow"
                    >${i18n._("aq_inventory_only", { name: text.trim() })}</span
                  >
                </button>`
              : nothing}
            ${!matches.length && kind === "coral"
              ? html`<span class="hint">${i18n._("aq_no_match")}</span>`
              : nothing}
          </div>`
        : nothing}
    </div>`;
  }

  /** Why the catalog is empty, when it is. */
  private _catalog_notice(): TemplateResult | typeof nothing {
    const catalog = this._catalog;
    if (!catalog || catalog.fish.length || catalog.corals.length)
      return nothing;
    return html`<p class="notice">
      ${i18n._(
        catalog.pack?.updating ? "aq_catalog_updating" : "aq_catalog_empty",
      )}
    </p>`;
  }

  private _panel_livestock(): TemplateResult {
    const doc = this._doc!;
    const water = doc.waters[this._water_id];
    const fish = this._catalog?.fish ?? [];
    const corals = this._catalog?.corals ?? [];
    const sel = this._selection;
    return html`
      ${this._water_select()} ${this._catalog_notice()}
      ${water
        ? html`<fieldset>
              <legend>${i18n._("aq_fish_inventory")}</legend>
              ${water.livestock.map((line) => {
                const species = this._species_fish(line.species);
                const set = (patch: any) =>
                  this.change(
                    ops.update_line(doc, this._water_id, line.id, patch),
                  );
                const size = line.size_cm ?? species?.size_cm ?? null;
                return html`<div class="card">
                  <div class="line">
                    ${species_thumb(species, "fish")}
                    <strong class="grow"
                      >${line.name || species_name(species, line.species)}
                      ${species_latin(species)}</strong
                    >
                    ${species
                      ? nothing
                      : html`<span class="hint"
                          >${i18n._("aq_no_animation")}</span
                        >`}
                    <button
                      class="icon"
                      @click=${() =>
                        this.change(
                          ops.remove_line(doc, this._water_id, line.id),
                        )}
                    >
                      ✕
                    </button>
                  </div>
                  <div class="row3">
                    <label class="field small"
                      >${i18n._("aq_count")}<input
                        type="number"
                        min="0"
                        .value=${String(line.count)}
                        @change=${(e: Event) =>
                          set({
                            count: Math.max(
                              0,
                              Number((e.target as HTMLInputElement).value) || 0,
                            ),
                          })}
                    /></label>
                    <label class="field small"
                      >${i18n._("aq_size_min")}<input
                        type="number"
                        min="0.1"
                        step="0.5"
                        .value=${size ? String(size[0]) : ""}
                        @change=${(e: Event) =>
                          set({
                            size_cm: [
                              Number((e.target as HTMLInputElement).value) || 1,
                              size?.[1] ?? 5,
                            ],
                          })}
                    /></label>
                    <label class="field small"
                      >${i18n._("aq_size_max")}<input
                        type="number"
                        min="0.1"
                        step="0.5"
                        .value=${size ? String(size[1]) : ""}
                        @change=${(e: Event) =>
                          set({
                            size_cm: [
                              size?.[0] ?? 1,
                              Number((e.target as HTMLInputElement).value) || 5,
                            ],
                          })}
                    /></label>
                  </div>
                  <label class="field"
                    >${i18n._("aq_note")}<input
                      .value=${line.note}
                      @change=${(e: Event) =>
                        set({ note: (e.target as HTMLInputElement).value })}
                  /></label>
                  ${this._home_controls(line, set)}
                </div>`;
              })}
              ${this._species_picker(
                "fish",
                fish,
                `+ ${i18n._("aq_add_fish")}`,
                (id) => {
                  const species = fish.find((s) => s.id === id);
                  const [next] = ops.add_line(doc, this._water_id, {
                    species: id,
                    count: 1,
                    size_cm: species?.size_cm ?? null,
                    kind: "fish",
                  });
                  this.change(next);
                },
              )}
              <span class="hint">${i18n._("aq_fish_hint")}</span>
              ${this._tool === "home"
                ? html`<span class="hint">${i18n._("aq_home_hint")}</span>`
                : nothing}
            </fieldset>
            <fieldset>
              <legend>${i18n._("aq_corals")}</legend>
              ${water.corals.map((coral) => {
                const species = this._species_coral(coral.species);
                const palette = species
                  ? coral_palette(species, coral.palette)
                  : [];
                const set = (patch: any) =>
                  this.change(
                    ops.update_coral(doc, this._water_id, coral.id, patch),
                  );
                const selected = sel?.type === "coral" && sel.id === coral.id;
                return html`<div
                  class="card ${selected ? "current" : ""}"
                  @click=${() =>
                    (this._selection = {
                      type: "coral",
                      id: coral.id,
                      water: this._water_id,
                    })}
                >
                  <div class="line">
                    ${species_thumb(species, "coral")}
                    <strong class="grow"
                      >${coral.name || species_name(species, coral.species)}
                      ${species_latin(species)}</strong
                    >
                    <button
                      class="icon"
                      @click=${() =>
                        this.change(
                          ops.remove_coral(doc, this._water_id, coral.id),
                        )}
                    >
                      ✕
                    </button>
                  </div>
                  <div class="row3">
                    <label class="field small"
                      >${i18n._("aq_size_cm")}<input
                        type="number"
                        min="0.5"
                        step="0.5"
                        .value=${String(coral.size_cm)}
                        @change=${(e: Event) =>
                          set({
                            size_cm:
                              Number((e.target as HTMLInputElement).value) ||
                              10,
                          })}
                    /></label>
                    <label class="field small"
                      >${i18n._("aq_depth")}
                      <select
                        @change=${(e: Event) =>
                          set({
                            z: ops.DEPTHS[
                              (e.target as HTMLSelectElement)
                                .value as ops.DepthName
                            ],
                          })}
                      >
                        ${(["front", "middle", "back"] as ops.DepthName[]).map(
                          (n) =>
                            html`<option
                              value="${n}"
                              ?selected=${ops.depth_name(coral.z) === n}
                            >
                              ${i18n._(`aq_depth_${n}`)}
                            </option>`,
                        )}
                      </select>
                    </label>
                  </div>
                  ${palette.length
                    ? html`<div class="palette">
                        ${palette.map(
                          (c, i) =>
                            html`<input
                              type="color"
                              .value=${rgb_hex(c)}
                              title="${i18n._("aq_colour")} ${i + 1}"
                              @change=${(e: Event) => {
                                const next = palette.map(rgb_hex);
                                next[i] = (e.target as HTMLInputElement).value;
                                set({ palette: next });
                              }}
                            />`,
                        )}
                        <button
                          class="icon"
                          title="${i18n._("aq_reset_colours")}"
                          @click=${() => set({ palette: [] })}
                        >
                          ↺
                        </button>
                      </div>`
                    : nothing}
                </div>`;
              })}
              <div class="field">
                ${i18n._("aq_coral_species")}
                ${this._coral_species
                  ? html`<div class="line chosen">
                      ${species_thumb(
                        this._species_coral(this._coral_species),
                        "coral",
                      )}
                      <span class="grow"
                        >${species_name(
                          this._species_coral(this._coral_species),
                          this._coral_species,
                        )}
                        ${species_latin(
                          this._species_coral(this._coral_species),
                        )}</span
                      >
                    </div>`
                  : nothing}
                ${this._species_picker(
                  "coral",
                  corals,
                  i18n._("aq_search"),
                  (id) => {
                    this._coral_species = id;
                    this._tool = "coral";
                  },
                )}
              </div>
              <div class="buttons">
                ${this._tool_button("coral", "aq_place_coral")}
                ${this._tool_button("select", "aq_tool_select")}
              </div>
              <span class="hint">${i18n._("aq_coral_hint")}</span>
            </fieldset>`
        : nothing}
    `;
  }

  private _panel_feeding(): TemplateResult {
    const doc = this._doc!;
    const linked = doc.cloud
      ? this._clouds.find((c) => c.uid === doc.cloud!.uid)
      : undefined;
    const suggestions = (linked?.feeding_entities ?? []).filter(
      (id) => !doc.feeding.sources.some((s) => s.entity_id === id),
    );
    const candidates = this._entity_ids([
      "sensor",
      "switch",
      "button",
      "input_button",
      "input_boolean",
      "event",
      "binary_sensor",
    ]);
    return html`
      <fieldset>
        <legend>${i18n._("aq_feeding_sources")}</legend>
        ${doc.feeding.sources.map(
          (s) =>
            html`<div class="line">
              <span class="grow">${s.entity_id}</span>
              <select
                @change=${(e: Event) => {
                  const next = structuredClone(doc);
                  const src = next.feeding.sources.find((x) => x.id === s.id)!;
                  src.kind = ((e.target as HTMLSelectElement).value ||
                    null) as any;
                  this.change(next);
                }}
              >
                <option value="" ?selected=${!s.kind}>
                  ${i18n._("aq_kind_auto")}
                </option>
                ${["feeder", "shortcut", "manual"].map(
                  (k) =>
                    html`<option value="${k}" ?selected=${s.kind === k}>
                      ${i18n._(`aq_kind_${k}`)}
                    </option>`,
                )}
              </select>
              <button
                class="icon"
                @click=${() => this.change(ops.remove_feed_source(doc, s.id))}
              >
                ✕
              </button>
            </div>`,
        )}
        ${suggestions.map(
          (id) =>
            html`<button
              class="suggestion"
              @click=${() =>
                this.change(ops.add_feed_source(doc, id, "shortcut")[0])}
            >
              + ${id}
            </button>`,
        )}
        <input
          list="feed_entities"
          placeholder="+ ${i18n._("aq_add_source")}"
          @change=${(e: Event) => {
            const input = e.target as HTMLInputElement;
            const value = input.value.trim();
            input.value = "";
            if (value) this.change(ops.add_feed_source(doc, value)[0]);
          }}
        />
        <datalist id="feed_entities">
          ${candidates.map((id) => html`<option value="${id}"></option>`)}
        </datalist>
        <span class="hint">${i18n._("aq_feeding_hint")}</span>
      </fieldset>
      <div class="row3">
        <label class="field small"
          >${i18n._("aq_feed_duration")}
          <input
            type="number"
            min="5"
            max="600"
            .value=${String(doc.feeding.duration_s)}
            @change=${(e: Event) =>
              this.change(
                ops.update_feeding(doc, {
                  duration_s: Math.max(
                    5,
                    Math.min(
                      600,
                      Number((e.target as HTMLInputElement).value) || 45,
                    ),
                  ),
                }),
              )}
        /></label>
        <label class="field small"
          >${i18n._("aq_feed_dedup")}
          <input
            type="number"
            min="0"
            max="3600"
            .value=${String(doc.feeding.dedup_s)}
            @change=${(e: Event) =>
              this.change(
                ops.update_feeding(doc, {
                  dedup_s: Math.max(
                    0,
                    Math.min(
                      3600,
                      Number((e.target as HTMLInputElement).value) || 0,
                    ),
                  ),
                }),
              )}
        /></label>
      </div>
      ${!this._is_new && doc.id
        ? html`<button
            @click=${() =>
              (this._hass as any)?.callService("reeftank", "feed", {
                aquarium: doc.id,
              })}
          >
            ${i18n._("aq_test_feeding")}
          </button>`
        : nothing}
    `;
  }

  protected override updated(): void {
    if (this._preview) this._paint_preview();
  }

  override render(): TemplateResult {
    const doc = this._doc;
    const drag = this._drag;
    return html`<div class="backdrop">
      <div class="dialog" role="dialog" aria-modal="true">
        <header>
          <h2>${doc?.name ?? i18n._("aq_loading")}</h2>
          ${this._message
            ? html`<span class="message ${this._message.kind}"
                >${this._message.text}</span
              >`
            : nothing}
          ${this._message?.kind === "error" && !this._is_new
            ? html`<button @click=${this._reload}>
                ${i18n._("aq_reload")}
              </button>`
            : nothing}
          <span class="grow"></span>
          <button
            class="icon"
            title="${i18n._("aq_undo")}"
            ?disabled=${!this._history.length}
            @click=${this.undo}
          >
            <svg viewBox="0 0 24 24"><path d="${mdiUndo}"></path></svg>
          </button>
          <button
            class="primary"
            ?disabled=${this._busy || !doc}
            @click=${() => this.save()}
          >
            <svg viewBox="0 0 24 24"><path d="${mdiContentSave}"></path></svg
            >${i18n._("aq_save")}
          </button>
          <button
            class="icon"
            title="${i18n._("aq_close")}"
            @click=${() => this.close()}
          >
            <svg viewBox="0 0 24 24"><path d="${mdiClose}"></path></svg>
          </button>
        </header>
        ${doc
          ? html`<div class="body">
              <aside>
                <nav>
                  ${TABS.map(
                    (t) =>
                      html`<button
                        class="${this._tab === t ? "active" : ""}"
                        @click=${() => (
                          (this._tab = t),
                          (this._tool = "select"),
                          (this._drawing = [])
                        )}
                      >
                        ${i18n._(`aq_tab_${t}`)}
                      </button>`,
                  )}
                </nav>
                <div class="panel">
                  ${this._tab !== "aquarium" &&
                  this._tab !== "views" &&
                  Object.keys(doc.views).length > 1
                    ? html`<label class="field"
                        >${i18n._("aq_view")}
                        <select
                          @change=${(e: Event) => (
                            (this._view_id = (
                              e.target as HTMLSelectElement
                            ).value),
                            (this._selection = null)
                          )}
                        >
                          ${Object.entries(doc.views).map(
                            ([id, v]) =>
                              html`<option
                                value="${id}"
                                ?selected=${id === this._view_id}
                              >
                                ${v.name || id}
                              </option>`,
                          )}
                        </select>
                      </label>`
                    : nothing}
                  ${this._tab === "aquarium"
                    ? this._panel_aquarium()
                    : this._tab === "views"
                      ? this._panel_views()
                      : this._tab === "elements"
                        ? this._panel_elements()
                        : this._tab === "lights"
                          ? this._panel_lights()
                          : this._tab === "livestock"
                            ? this._panel_livestock()
                            : this._panel_feeding()}
                </div>
              </aside>
              <main>${this._render_stage()}</main>
            </div>`
          : html`<div class="body loading">${i18n._("aq_loading")}</div>`}
        ${drag?.type === "new"
          ? html`<div class="ghost" style="left:${drag.x}px;top:${drag.y}px">
              <svg viewBox="0 0 24 24">
                <path
                  d="${drag.kind === "device" ? mdiDevices : mdiMapMarker}"
                ></path></svg
              >${drag.label}
            </div>`
          : nothing}
      </div>
    </div>`;
  }
}
