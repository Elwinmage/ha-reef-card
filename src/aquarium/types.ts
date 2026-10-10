/**
 * Aquarium view: types of the documents served by the reeftank integration
 * and of its asset catalog. They mirror custom_components/reeftank/models.py.
 */

/** A point of a picture, normalised to 0..1: [x, y]. */
export type Point = [number, number];

/** Render levels, from the cheapest to the richest. */
export type RenderLevel = "static" | "light" | "full";
export const RENDER_LEVELS: RenderLevel[] = ["static", "light", "full"];

export interface LightSource {
  device_id?: string;
  entity_id?: string;
  /** Position of the lamp along the tank, 0..1 (left to right). */
  x: number;
}

export interface LivestockLine {
  id: string;
  kind: "fish" | "invertebrate";
  species: string;
  name: string;
  count: number;
  size_cm?: [number, number] | null;
  added?: string | null;
  note: string;
  /**
   * Where the animals live (burrow, host anemone), in water space:
   * [u along the glass, v from the surface down, z from the front glass].
   */
  home?: [number, number, number] | null;
}

export interface Coral {
  id: string;
  species: string;
  name: string;
  view?: string | null;
  pos: Point;
  z: number;
  size_cm: number;
  palette: string[];
  added?: string | null;
  note: string;
}

export interface Water {
  name: string;
  lights: LightSource[];
  flow: string[];
  sand_band: number;
  livestock: LivestockLine[];
  corals: Coral[];
}

export interface Region {
  water: string;
  /** TL, TR, BR, BL corners; empty when not outlined yet. */
  quad: Point[];
  /**
   * Where the sand meets the front glass: a polyline left to right (2
   * points or more, following its bumps), picture space; empty to use the
   * water's sand band.
   */
  sand?: Point[];
  /**
   * Where the sand meets the back wall, as seen on the picture (a polyline
   * left to right): with the front line, the slope and the top of the sand.
   */
  sand_back?: Point[];
  /** Water drawn (textures) instead of shown from the photo. */
  drawn?: boolean;
}

export interface Decor {
  id: string;
  z: number;
  poly: Point[];
}

export type ElementKind = "device" | "entity" | "marker";

export interface SceneElement {
  id: string;
  kind: ElementKind;
  device_id?: string;
  entity_id?: string;
  type?: string;
  pos: Point;
  scale: number;
  label: string;
  roles: string[];
  source?: string | null;
}

export interface Hotspot {
  id: string;
  poly: Point[];
  goto: string;
  label: string;
}

export type BackdropMode = "photo" | "drawn";

/** What a view shows under its life: its photo, or a drawn decor. */
export interface Backdrop {
  mode: BackdropMode;
  /** Catalog textures (ids); none: the first of the catalog, else built-in. */
  rock?: string | null;
  sand?: string | null;
}

export interface View {
  name: string;
  image?: string | null;
  backdrop?: Backdrop;
  regions: Region[];
  decor: Decor[];
  elements: SceneElement[];
  hotspots: Hotspot[];
}

export interface FeedSource {
  id: string;
  type: "entity";
  entity_id: string;
  kind?: "feeder" | "shortcut" | "manual" | null;
}

export interface AquariumDocument {
  version: number;
  id?: string;
  revision: number;
  name: string;
  cloud?: { provider: string; uid: string } | null;
  preset?: string | null;
  dimensions_cm?: { length: number; width: number; height: number } | null;
  photo_light: "white" | "blue";
  render: { level: RenderLevel; max_fish: number; caustics: boolean };
  waters: Record<string, Water>;
  feeding: { sources: FeedSource[]; dedup_s: number; duration_s: number };
  views: Record<string, View>;
  default_view?: string | null;
}

export interface AquariumSummary {
  id: string;
  name: string;
  revision: number;
  preset?: string | null;
  cloud?: { provider: string; uid: string } | null;
  render_level: RenderLevel;
  views: number;
}

/** Entity ids of an aquarium's own entities. */
export interface AquariumEntities {
  fish?: string | null;
  corals?: string | null;
  feedings_today?: string | null;
  feeding?: string | null;
}

export interface AquariumPayload {
  document: AquariumDocument;
  entities: AquariumEntities;
  images_url: string;
}

/** An aquarium of a vendor cloud (redsea/aquariums). */
export interface CloudAquarium {
  provider: string;
  account: string;
  uid: string;
  name: string;
  system_model?: string | null;
  system_series?: string | null;
  system_type?: string | null;
  dimensions_cm?: { length: number; width: number; height: number } | null;
  device_ids: string[];
  feeding_entities: string[];
}

// ── Catalog ──────────────────────────────────────────────────────────────────

export interface Clip {
  from: number;
  to: number;
  fps: number;
  loop: boolean;
  /** Looping forward then backward (a clip generated as a ping-pong). */
  pingpong?: boolean;
}

export type BehaviorProfile =
  | "shoal"
  | "cruiser"
  | "benthic"
  | "hover"
  | "sand";
export type NightMode = "hide" | "hover" | "rest_bottom";

export interface FishBehavior {
  profile: BehaviorProfile;
  /** Preferred depth range (z), 0 front .. 1 back. */
  depth?: [number, number];
  /** Preferred height band (v), 0 surface .. 1 bottom. */
  band?: [number, number];
  speed_cm_s?: [number, number];
  /** Turning rate, radians per second. */
  turn_rate?: number;
  shoal?: { cohesion?: number; alignment?: number; separation?: number };
  /** Distance kept from its home (burrow, host), cm: a sedentary species. */
  territory_cm?: number;
  /**
   * Lives in a burrow in the sand, at its home: in it at night, often only
   * its head out during the day (watchman gobies, sleeper gobies).
   */
  burrow?: boolean;
}

export interface SpeciesBase {
  id: string;
  /** pack: downloaded catalog, user: <config>/reeftank/catalog/ */
  source: "pack" | "user" | "bundled" | "generic";
  frame: [number, number];
  columns: number;
  clips: Record<string, Clip>;
  names?: Record<string, string>;
  /** Latin name ("Siganus vulpinus", "Amphiprion sp." for a genus). */
  scientific?: string;
  /** Small picture for the editor's lists. */
  thumbnail?: string;
  demo?: boolean;
}

export interface FishSpecies extends SpeciesBase {
  kind: "fish";
  atlas: { "1x": string; "2x"?: string };
  facing?: "left" | "right";
  /** Share of the frame width taken by the fish length (default 1). */
  length_frac?: number;
  size_cm?: [number, number];
  behavior?: FishBehavior;
  night?: NightMode;
  feeding_response?: number;
}

export interface PaletteColour {
  default: string;
  fluo?: boolean;
}

export interface CoralSpecies extends SpeciesBase {
  kind: "coral";
  atlas: { shade: string; mask: string; shade_2x?: string; mask_2x?: string };
  palette: PaletteColour[];
  size_cm?: [number, number];
}

export interface Texture {
  id: string;
  source: "pack" | "user";
  kind?: "texture";
  role: "rock" | "sand";
  /** Tileable picture (URL). */
  image: string;
  /** Tank length the picture covers, cm. */
  scale_cm: number;
  names?: Record<string, string>;
}

export interface Preset {
  id: string;
  source: "bundled" | "user";
  name?: string;
  names?: Record<string, string>;
  match?: { provider?: string; series?: string[]; models?: string[] };
  dimensions_cm?: { length: number; width: number; height: number };
  waters?: Record<string, Partial<Water>>;
  views?: Record<string, Partial<View>>;
  default_view?: string;
}

export interface Catalog {
  fish: FishSpecies[];
  corals: CoralSpecies[];
  /** Rock and sand textures of the drawn decor (none in older releases). */
  textures?: Texture[];
  presets: Preset[];
  /** The downloaded catalog: its release (null before the first download). */
  pack?: { version: string | null; updating: boolean };
}
