/**
 * Operations of the scene editor on a working copy of an aquarium
 * document. They are pure: each one returns a new document and leaves its
 * input untouched, which gives undo for free and keeps them testable.
 */

import type {
  AquariumDocument,
  CloudAquarium,
  Coral,
  CoralSpecies,
  Decor,
  FeedSource,
  Hotspot,
  LightSource,
  LivestockLine,
  Point,
  Preset,
  SceneElement,
  View,
  Water,
} from "../types";

/** Depth presets of the decor and corals. */
export const DEPTHS = { front: 0.2, middle: 0.5, back: 0.8 } as const;
export type DepthName = keyof typeof DEPTHS;

/** Name of the depth preset closest to a z. */
export function depth_name(z: number): DepthName {
  return z < 0.35 ? "front" : z < 0.65 ? "middle" : "back";
}

/** A new short id, unique enough inside one document. */
export function new_id(): string {
  const bytes = new Uint8Array(4);
  const c = (globalThis as any).crypto;
  if (c?.getRandomValues) c.getRandomValues(bytes);
  else for (let i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);
  // Starting with a letter: an all-digit id would be an integer key, which
  // JavaScript orders before the others (views would change order)
  bytes[0] = 0xa0 + (bytes[0] % 0x60);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const clone = <T>(value: T): T => structuredClone(value);

export function empty_water(name: string = ""): Water {
  return {
    name,
    lights: [],
    flow: [],
    sand_band: 0.12,
    livestock: [],
    corals: [],
  };
}

export function empty_view(name: string = ""): View {
  return {
    name,
    image: null,
    backdrop: { mode: "photo" },
    regions: [],
    decor: [],
    elements: [],
    hotspots: [],
  };
}

/** A new document, with a main water and no view. */
export function new_document(name: string): AquariumDocument {
  return {
    version: 1,
    id: new_id(),
    revision: 0,
    name,
    cloud: null,
    preset: null,
    dimensions_cm: null,
    photo_light: "white",
    render: { level: "full", max_fish: 30, caustics: false },
    waters: { main: empty_water() },
    feeding: { sources: [], dedup_s: 120, duration_s: 45 },
    views: {},
    default_view: null,
  };
}

const norm = (s: string | null | undefined) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

/**
 * The catalog preset of a cloud aquarium: matched on its model, then its
 * series, then its dimensions.
 */
export function match_preset(
  presets: Preset[],
  cloud: CloudAquarium | null,
): Preset | null {
  if (!cloud) return null;
  const model = norm(cloud.system_model);
  const series = norm(cloud.system_series);
  const candidates = presets.filter(
    (p) => !p.match?.provider || p.match.provider === cloud.provider,
  );
  const by_model = candidates.find((p) =>
    (p.match?.models ?? []).some((m) => norm(m) === model && model),
  );
  if (by_model) return by_model;
  const d = cloud.dimensions_cm;
  const by_series = candidates.filter((p) =>
    (p.match?.series ?? []).some((s) => norm(s) === series && series),
  );
  if (by_series.length === 1 || (!d && by_series.length)) return by_series[0];
  if (d) {
    const close = (p: Preset) =>
      p.dimensions_cm &&
      Math.abs(p.dimensions_cm.length - d.length) <= 3 &&
      Math.abs(p.dimensions_cm.width - d.width) <= 3 &&
      Math.abs(p.dimensions_cm.height - d.height) <= 3;
    return (
      (by_series.length ? by_series : candidates).find(close) ??
      by_series[0] ??
      null
    );
  }
  return null;
}

/**
 * A document pre-filled from a cloud aquarium.
 * @param is_lamp: tells which of its devices are lamps
 */
export function from_cloud(
  cloud: CloudAquarium,
  is_lamp: (device_id: string) => boolean = () => false,
): AquariumDocument {
  const doc = new_document(cloud.name);
  doc.cloud = { provider: cloud.provider, uid: cloud.uid };
  doc.dimensions_cm = cloud.dimensions_cm ?? null;
  const lamps = cloud.device_ids.filter(is_lamp);
  doc.waters.main.lights = lamps.map((device_id, i) => ({
    device_id,
    x: Number(((i + 1) / (lamps.length + 1)).toFixed(3)),
  }));
  doc.feeding.sources = cloud.feeding_entities.map((entity_id) => ({
    id: new_id(),
    type: "entity",
    entity_id,
    kind: "shortcut",
  }));
  return doc;
}

/** Copy the views (and dimensions) of a catalog preset into a document. */
export function apply_preset(
  doc: AquariumDocument,
  preset: Preset,
): AquariumDocument {
  const out = clone(doc);
  out.preset = preset.id;
  if (preset.dimensions_cm && !out.dimensions_cm)
    out.dimensions_cm = clone(preset.dimensions_cm);
  for (const [water_id, water] of Object.entries(preset.waters ?? {})) {
    out.waters[water_id] = {
      ...empty_water(),
      ...(out.waters[water_id] ?? {}),
      ...clone(water),
      livestock: out.waters[water_id]?.livestock ?? [],
      corals: out.waters[water_id]?.corals ?? [],
    };
  }
  for (const [view_id, view] of Object.entries(preset.views ?? {})) {
    const merged: View = { ...empty_view(), ...clone(view) } as View;
    merged.decor = (merged.decor ?? []).map((d) => ({ ...d, id: new_id() }));
    merged.hotspots = (merged.hotspots ?? []).map((h) => ({
      ...h,
      id: new_id(),
    }));
    merged.elements = [];
    for (const region of merged.regions ?? []) {
      if (!out.waters[region.water]) out.waters[region.water] = empty_water();
    }
    out.views[view_id] = merged;
  }
  // Hotspots of the preset may point to views it does not bring
  for (const view of Object.values(out.views)) {
    view.hotspots = view.hotspots.filter((h) => out.views[h.goto]);
  }
  if (!out.default_view || !out.views[out.default_view]) {
    out.default_view =
      preset.default_view && out.views[preset.default_view]
        ? preset.default_view
        : (Object.keys(out.views)[0] ?? null);
  }
  return out;
}

// ── Views ────────────────────────────────────────────────────────────────────

export function add_view(
  doc: AquariumDocument,
  name: string,
): [AquariumDocument, string] {
  const out = clone(doc);
  const id = new_id();
  out.views[id] = empty_view(name);
  if (!out.default_view) out.default_view = id;
  return [out, id];
}

export function update_view(
  doc: AquariumDocument,
  view_id: string,
  patch: Partial<View>,
): AquariumDocument {
  const out = clone(doc);
  if (out.views[view_id]) Object.assign(out.views[view_id], clone(patch));
  return out;
}

/** Remove a view and everything pointing at it. */
export function remove_view(
  doc: AquariumDocument,
  view_id: string,
): AquariumDocument {
  const out = clone(doc);
  delete out.views[view_id];
  for (const view of Object.values(out.views)) {
    view.hotspots = view.hotspots.filter((h) => h.goto !== view_id);
  }
  for (const water of Object.values(out.waters)) {
    water.corals = water.corals.filter((c) => c.view !== view_id);
  }
  if (out.default_view === view_id)
    out.default_view = Object.keys(out.views)[0] ?? null;
  return out;
}

/** Outline (or re-outline) a water on a view. */
export function set_region(
  doc: AquariumDocument,
  view_id: string,
  water_id: string,
  quad: Point[],
): AquariumDocument {
  const out = clone(doc);
  const view = out.views[view_id];
  if (!view) return out;
  if (!out.waters[water_id]) out.waters[water_id] = empty_water();
  const region = view.regions.find((r) => r.water === water_id);
  if (region) region.quad = clone(quad);
  else view.regions.push({ water: water_id, quad: clone(quad) });
  return out;
}

export function remove_region(
  doc: AquariumDocument,
  view_id: string,
  water_id: string,
): AquariumDocument {
  const out = clone(doc);
  const view = out.views[view_id];
  if (view) view.regions = view.regions.filter((r) => r.water !== water_id);
  return out;
}

/** Move one corner of a region's quad. */
export function move_region_corner(
  doc: AquariumDocument,
  view_id: string,
  water_id: string,
  corner: number,
  p: Point,
): AquariumDocument {
  const out = clone(doc);
  const region = out.views[view_id]?.regions.find((r) => r.water === water_id);
  if (region && region.quad[corner]) region.quad[corner] = clamp_point(p);
  return out;
}

/** Most points of a sand line (as the integration allows). */
export const MAX_SAND_POINTS = 32;

const by_x = (a: Point, b: Point) => a[0] - b[0];

/** A sand line of a region: against the front glass, or the back wall. */
export type SandLine = "sand" | "sand_back";

/**
 * Set (or remove, with no points) where the sand meets the front glass on a
 * view: a polyline, left to right.
 */
export function set_sand_line(
  doc: AquariumDocument,
  view_id: string,
  water_id: string,
  points: Point[],
  line: SandLine = "sand",
): AquariumDocument {
  const out = clone(doc);
  const region = out.views[view_id]?.regions.find((r) => r.water === water_id);
  if (region)
    region[line] =
      points.length >= 2
        ? points.slice(0, MAX_SAND_POINTS).map(clamp_point).sort(by_x)
        : [];
  return out;
}

/** Move one point of a sand line. */
export function move_sand_point(
  doc: AquariumDocument,
  view_id: string,
  water_id: string,
  index: number,
  p: Point,
  line: SandLine = "sand",
): AquariumDocument {
  const out = clone(doc);
  const region = out.views[view_id]?.regions.find((r) => r.water === water_id);
  const points = region?.[line];
  if (points?.[index]) points[index] = clamp_point(p);
  return out;
}

/**
 * Add a point to a sand line (a bump), in its place from left to right.
 * @return the document, and the index of the point (-1: not added)
 */
export function add_sand_point(
  doc: AquariumDocument,
  view_id: string,
  water_id: string,
  p: Point,
  which: SandLine = "sand",
): [AquariumDocument, number] {
  const out = clone(doc);
  const region = out.views[view_id]?.regions.find((r) => r.water === water_id);
  const line = region?.[which];
  if (!line || line.length < 2 || line.length >= MAX_SAND_POINTS)
    return [out, -1];
  const point = clamp_point(p);
  line.sort(by_x);
  let index = line.findIndex((q) => q[0] > point[0]);
  if (index < 0) index = line.length;
  line.splice(index, 0, point);
  return [out, index];
}

/** Remove a point of a sand line (2 are kept). */
export function remove_sand_point(
  doc: AquariumDocument,
  view_id: string,
  water_id: string,
  index: number,
  line: SandLine = "sand",
): AquariumDocument {
  const out = clone(doc);
  const region = out.views[view_id]?.regions.find((r) => r.water === water_id);
  const points = region?.[line];
  if (points && points.length > 2 && points[index]) points.splice(index, 1);
  return out;
}

/**
 * Draw a water of a view instead of showing it from the photo (or not).
 * A view of the first version (`backdrop.mode: "drawn"`, all its regions
 * drawn) keeps its other regions drawn.
 */
export function set_region_drawn(
  doc: AquariumDocument,
  view_id: string,
  water_id: string,
  drawn: boolean,
): AquariumDocument {
  const out = clone(doc);
  const view = out.views[view_id];
  if (!view) return out;
  if (view.backdrop?.mode === "drawn") {
    view.backdrop.mode = "photo";
    for (const region of view.regions) region.drawn = true;
  }
  const region = view.regions.find((r) => r.water === water_id);
  if (region) region.drawn = drawn;
  return out;
}

export function add_water(
  doc: AquariumDocument,
  water_id: string,
  name: string = "",
): AquariumDocument {
  const out = clone(doc);
  if (!out.waters[water_id]) out.waters[water_id] = empty_water(name);
  return out;
}

// ── Polygons (decor, hotspots) ───────────────────────────────────────────────

export function clamp_point(p: Point): Point {
  const c = (v: number) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
  return [Number(c(p[0]).toFixed(4)), Number(c(p[1]).toFixed(4))];
}

export function add_decor(
  doc: AquariumDocument,
  view_id: string,
  poly: Point[],
  z: number,
): [AquariumDocument, string | null] {
  if (poly.length < 3 || !doc.views[view_id]) return [doc, null];
  const out = clone(doc);
  const id = new_id();
  out.views[view_id].decor.push({ id, z, poly: poly.map(clamp_point) });
  return [out, id];
}

export function update_decor(
  doc: AquariumDocument,
  view_id: string,
  decor_id: string,
  patch: Partial<Decor>,
): AquariumDocument {
  const out = clone(doc);
  const decor = out.views[view_id]?.decor.find((d) => d.id === decor_id);
  if (decor) Object.assign(decor, clone(patch));
  return out;
}

export function remove_decor(
  doc: AquariumDocument,
  view_id: string,
  decor_id: string,
): AquariumDocument {
  const out = clone(doc);
  const view = out.views[view_id];
  if (view) view.decor = view.decor.filter((d) => d.id !== decor_id);
  return out;
}

export function add_hotspot(
  doc: AquariumDocument,
  view_id: string,
  poly: Point[],
  goto: string,
): [AquariumDocument, string | null] {
  if (poly.length < 3 || !doc.views[view_id] || !doc.views[goto])
    return [doc, null];
  const out = clone(doc);
  const id = new_id();
  out.views[view_id].hotspots.push({
    id,
    poly: poly.map(clamp_point),
    goto,
    label: "",
  });
  return [out, id];
}

export function update_hotspot(
  doc: AquariumDocument,
  view_id: string,
  hotspot_id: string,
  patch: Partial<Hotspot>,
): AquariumDocument {
  const out = clone(doc);
  const hotspot = out.views[view_id]?.hotspots.find((h) => h.id === hotspot_id);
  if (hotspot) Object.assign(hotspot, clone(patch));
  return out;
}

export function remove_hotspot(
  doc: AquariumDocument,
  view_id: string,
  hotspot_id: string,
): AquariumDocument {
  const out = clone(doc);
  const view = out.views[view_id];
  if (view) view.hotspots = view.hotspots.filter((h) => h.id !== hotspot_id);
  return out;
}

/** Move one vertex of a polygon (decor or hotspot). */
export function move_vertex(
  doc: AquariumDocument,
  view_id: string,
  kind: "decor" | "hotspots",
  item_id: string,
  index: number,
  p: Point,
): AquariumDocument {
  const out = clone(doc);
  const item = (
    out.views[view_id]?.[kind] as (Decor | Hotspot)[] | undefined
  )?.find((x) => x.id === item_id);
  if (item && item.poly[index]) item.poly[index] = clamp_point(p);
  return out;
}

// ── Elements ─────────────────────────────────────────────────────────────────

export function add_element(
  doc: AquariumDocument,
  view_id: string,
  element: Omit<SceneElement, "id" | "scale" | "label" | "roles"> &
    Partial<SceneElement>,
): [AquariumDocument, string | null] {
  if (!doc.views[view_id]) return [doc, null];
  const out = clone(doc);
  const id = new_id();
  const full: SceneElement = {
    scale: 1,
    label: "",
    roles: [],
    ...clone(element),
    id,
    pos: clamp_point(element.pos),
  } as SceneElement;
  if (full.kind !== "device") delete full.device_id;
  if (full.kind !== "entity") {
    delete full.entity_id;
    delete full.type;
  }
  out.views[view_id].elements.push(full);
  return [out, id];
}

export function update_element(
  doc: AquariumDocument,
  view_id: string,
  element_id: string,
  patch: Partial<SceneElement>,
): AquariumDocument {
  const out = clone(doc);
  const element = out.views[view_id]?.elements.find((e) => e.id === element_id);
  if (element) {
    Object.assign(element, clone(patch));
    if (patch.pos) element.pos = clamp_point(patch.pos);
    if (element.source === undefined || element.source === "")
      element.source = null;
  }
  return out;
}

export function remove_element(
  doc: AquariumDocument,
  view_id: string,
  element_id: string,
): AquariumDocument {
  const out = clone(doc);
  const view = out.views[view_id];
  if (view) view.elements = view.elements.filter((e) => e.id !== element_id);
  return out;
}

// ── Lights and flow ──────────────────────────────────────────────────────────

export function add_light(
  doc: AquariumDocument,
  water_id: string,
  light: Omit<LightSource, "x"> & { x?: number },
): AquariumDocument {
  const out = clone(doc);
  const water = out.waters[water_id];
  if (!water) return out;
  const key = light.device_id ?? light.entity_id;
  if (water.lights.some((l) => (l.device_id ?? l.entity_id) === key))
    return out;
  water.lights.push({ ...clone(light), x: light.x ?? 0.5 });
  return out;
}

export function update_light(
  doc: AquariumDocument,
  water_id: string,
  index: number,
  patch: Partial<LightSource>,
): AquariumDocument {
  const out = clone(doc);
  const light = out.waters[water_id]?.lights[index];
  if (light) Object.assign(light, clone(patch));
  return out;
}

export function remove_light(
  doc: AquariumDocument,
  water_id: string,
  index: number,
): AquariumDocument {
  const out = clone(doc);
  out.waters[water_id]?.lights.splice(index, 1);
  return out;
}

export function set_flow(
  doc: AquariumDocument,
  water_id: string,
  flow: string[],
): AquariumDocument {
  const out = clone(doc);
  if (out.waters[water_id])
    out.waters[water_id].flow = Array.from(new Set(flow.filter((f) => f)));
  return out;
}

export function update_water(
  doc: AquariumDocument,
  water_id: string,
  patch: Partial<Water>,
): AquariumDocument {
  const out = clone(doc);
  if (out.waters[water_id]) Object.assign(out.waters[water_id], clone(patch));
  return out;
}

// ── Livestock ────────────────────────────────────────────────────────────────

export function add_line(
  doc: AquariumDocument,
  water_id: string,
  line: Partial<LivestockLine> & { species: string },
): [AquariumDocument, string] {
  const out = clone(doc);
  if (!out.waters[water_id]) out.waters[water_id] = empty_water();
  const id = new_id();
  out.waters[water_id].livestock.push({
    kind: "fish",
    name: "",
    count: 1,
    size_cm: null,
    added: new Date().toISOString().slice(0, 10),
    note: "",
    ...clone(line),
    id,
  });
  return [out, id];
}

export function update_line(
  doc: AquariumDocument,
  water_id: string,
  line_id: string,
  patch: Partial<LivestockLine>,
): AquariumDocument {
  const out = clone(doc);
  const line = out.waters[water_id]?.livestock.find((l) => l.id === line_id);
  if (line) Object.assign(line, clone(patch));
  return out;
}

export function remove_line(
  doc: AquariumDocument,
  water_id: string,
  line_id: string,
): AquariumDocument {
  const out = clone(doc);
  const water = out.waters[water_id];
  if (water) water.livestock = water.livestock.filter((l) => l.id !== line_id);
  return out;
}

export function add_coral(
  doc: AquariumDocument,
  water_id: string,
  species: CoralSpecies | { id: string; size_cm?: [number, number] },
  view_id: string | null,
  pos: Point,
): [AquariumDocument, string] {
  const out = clone(doc);
  if (!out.waters[water_id]) out.waters[water_id] = empty_water();
  const id = new_id();
  const size = species.size_cm
    ? (species.size_cm[0] + species.size_cm[1]) / 2
    : 10;
  const coral: Coral = {
    id,
    species: species.id,
    name: "",
    view: view_id,
    pos: clamp_point(pos),
    z: DEPTHS.middle,
    size_cm: Number(size.toFixed(1)),
    palette: [],
    added: new Date().toISOString().slice(0, 10),
    note: "",
  };
  out.waters[water_id].corals.push(coral);
  return [out, id];
}

export function update_coral(
  doc: AquariumDocument,
  water_id: string,
  coral_id: string,
  patch: Partial<Coral>,
): AquariumDocument {
  const out = clone(doc);
  const coral = out.waters[water_id]?.corals.find((c) => c.id === coral_id);
  if (coral) {
    Object.assign(coral, clone(patch));
    if (patch.pos) coral.pos = clamp_point(patch.pos);
  }
  return out;
}

export function remove_coral(
  doc: AquariumDocument,
  water_id: string,
  coral_id: string,
): AquariumDocument {
  const out = clone(doc);
  const water = out.waters[water_id];
  if (water) water.corals = water.corals.filter((c) => c.id !== coral_id);
  return out;
}

// ── Feeding ──────────────────────────────────────────────────────────────────

export function add_feed_source(
  doc: AquariumDocument,
  entity_id: string,
  kind: FeedSource["kind"] = null,
): [AquariumDocument, string | null] {
  if (!entity_id || doc.feeding.sources.some((s) => s.entity_id === entity_id))
    return [doc, null];
  const out = clone(doc);
  const id = new_id();
  out.feeding.sources.push({ id, type: "entity", entity_id, kind });
  return [out, id];
}

/** Remove a feeding source; elements bound to it fall back to any feeding. */
export function remove_feed_source(
  doc: AquariumDocument,
  source_id: string,
): AquariumDocument {
  const out = clone(doc);
  out.feeding.sources = out.feeding.sources.filter((s) => s.id !== source_id);
  for (const view of Object.values(out.views)) {
    for (const element of view.elements) {
      if (element.source === source_id) element.source = null;
    }
  }
  return out;
}

export function update_feeding(
  doc: AquariumDocument,
  patch: Partial<AquariumDocument["feeding"]>,
): AquariumDocument {
  const out = clone(doc);
  Object.assign(out.feeding, clone(patch));
  return out;
}

/** A document in the shape the integration validates (no stray keys). */
export function for_save(doc: AquariumDocument): AquariumDocument {
  const out = clone(doc);
  for (const view of Object.values(out.views)) {
    if (!view.image) view.image = null;
    // Left to right, as the integration stores them
    for (const region of view.regions) {
      region.sand?.sort(by_x);
      region.sand_back?.sort(by_x);
    }
    for (const element of view.elements) {
      if (!element.source) delete element.source;
      if (element.kind !== "entity") delete element.type;
    }
  }
  if (!out.default_view || !out.views[out.default_view]) {
    out.default_view = Object.keys(out.views)[0] ?? null;
  }
  return out;
}
