/**
 * Aquarium view: types of the documents served by the reeftank integration
 * and of its asset catalog. They mirror custom_components/reeftank/models.py.
 */

/** A point of a picture, normalised to 0..1: [x, y]. */
export type Point = [number, number];

/** Water of an aquarium, and of the species living in it. */
export type WaterType = "marine" | "freshwater" | "brackish";
export const WATER_TYPES: WaterType[] = ["marine", "freshwater", "brackish"];
/** Water of a document saved before the water types (and of a species that does not say). */
export const DEFAULT_WATER_TYPE: WaterType = "marine";

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

/** A plant of an aquarium, standing where it was planted. */
export interface Plant {
  id: string;
  species: string;
  name: string;
  view?: string | null;
  /** Foot of the plant, picture space. */
  pos: Point;
  z: number;
  /** How tall it stands, cm. */
  size_cm: number;
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
  /** None in a document saved before the plants. */
  plants?: Plant[];
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
  /** Entity: keep the label for the editor, draw the value alone. */
  hide_label?: boolean;
  /** Entity: colour of the text (#rrggbb), the chip's own when none. */
  text_color?: string | null;
  roles: string[];
  source?: string | null;
}

export interface Hotspot {
  id: string;
  poly: Point[];
  /** View it opens; null when it opens a device. */
  goto: string | null;
  /** Device whose view it opens. */
  device_id?: string | null;
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

/** What is monitored in an aquarium, and the thresholds of its alarms. */
export interface Monitoring {
  ph_entity?: string | null;
  orp_entity?: string | null;
  /** CO2 of the room: tells a CO2 effect from an alkalinity problem. */
  co2_entity?: string | null;
  /** KH tests, in dKH: tells a KH drop from a CO2 effect or a probe. */
  kh_entity?: string | null;
  /** Entities changing when a probe was calibrated (a date, usually). */
  ph_calibration_entity?: string | null;
  orp_calibration_entity?: string | null;
  /** The analysis is suspended while one of them is on. */
  pause_entities: string[];
  learning_days: number;
  ph_base_drop: number;
  ph_swing_pct: number;
  ph_profile_band: number;
  ph_profile_hours: number;
  orp_drop_mv: number;
  orp_drop_hours: number;
  kh_change_max: number;
  pause_hours: number;
}

export interface AquariumDocument {
  version: number;
  id?: string;
  revision: number;
  name: string;
  cloud?: { provider: string; uid: string } | null;
  /** Marine, freshwater or brackish: filters the species offered. */
  water_type?: WaterType;
  preset?: string | null;
  dimensions_cm?: { length: number; width: number; height: number } | null;
  /** Net water volume (L): tank and sump, without rock and sand. */
  water_volume_l?: number | null;
  photo_light: "white" | "blue";
  render: {
    level: RenderLevel;
    max_fish: number;
    /** Fish size against the tank: 1 keeps their real size in cm. */
    fish_scale?: number;
    caustics: boolean;
    /** Darkness of the water with the lamps off, 0..0.95 (default 0.55). */
    night_darkness?: number;
  };
  waters: Record<string, Water>;
  feeding: { sources: FeedSource[]; dedup_s: number; duration_s: number };
  /** Absent until saved, or with a reeftank older than the monitoring. */
  monitoring?: Monitoring;
  views: Record<string, View>;
  default_view?: string | null;
}

export interface AquariumSummary {
  id: string;
  name: string;
  revision: number;
  water_type?: WaterType;
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
  monitoring?: string | null;
  ph_base_low?: string | null;
  ph_swing_high?: string | null;
  ph_profile_off?: string | null;
  orp_low?: string | null;
  probe_suspect?: string | null;
  kh_fast_change?: string | null;
  kh_estimated?: string | null;
}

export interface AquariumPayload {
  document: AquariumDocument;
  entities: AquariumEntities;
  /** Uploaded pictures of the document → URL signed for this user. */
  images?: Record<string, string>;
  /** Lifetime of the signed URLs, in seconds. */
  images_ttl?: number;
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
  /** Volumes in the account's unit (`measuring_unit`: litres or gallons). */
  water_volume?: number | null;
  net_water_volume?: number | null;
  measuring_unit?: string | null;
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
  "shoal" | "cruiser" | "benthic" | "hover" | "sand";
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

/**
 * What every species of the catalog carries, whatever its assets: a species
 * drawn from a still picture has no frames and no clips.
 */
export interface SpeciesIdentity {
  id: string;
  /** pack: downloaded catalog, user: <config>/reeftank/catalog/ */
  source: "pack" | "user" | "bundled" | "generic";
  names?: Record<string, string>;
  /** Latin name ("Siganus vulpinus", "Amphiprion sp." for a genus). */
  scientific?: string;
  /** Small picture for the editor's lists. */
  thumbnail?: string;
  demo?: boolean;
  /** Waters the species lives in; none: marine. */
  water_types?: WaterType[];
  /**
   * False for a species published without a picture (no atlas, frame or
   * clips): it is drawn with the default "?" fish of the catalog.
   */
  has_image?: boolean;
  /** Atlas made from a single photo (a simple animation). */
  degraded?: boolean;
}

/** A species drawn from an atlas of frames, played as clips. */
export interface SpeciesBase extends SpeciesIdentity {
  frame: [number, number];
  columns: number;
  clips: Record<string, Clip>;
}

/**
 * Assets of a species whose motion the card computes itself: a still cutout
 * picture, and how the current moves it. A ready-made atlas may come along
 * (a filmed species), and then it is played as it is.
 *
 * Which assets are there is what says how the species is drawn — a still
 * `image` alone means the card makes the frames, an `atlas` means the plain
 * sprite path. There is no field to keep in step with them, and shipping an
 * atlas later upgrades a species without touching its other fields.
 */
export interface StillSpecies extends SpeciesIdentity {
  /** Still cutout picture, upright, cut at the foot. */
  image?: string;
  /** Ready-made atlas; with `frame`, `columns` and `clips`. */
  atlas?: { "1x": string; "2x"?: string };
  frame?: [number, number];
  columns?: number;
  clips?: Record<string, Clip>;
  /** How far the current bends it: 0 stiff, 1 very supple. */
  flex?: number;
  /** Time of one sway, seconds. */
  period_s?: number;
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
  /** Drawn with the sprite of the default fish (the species has none). */
  placeholder?: boolean;
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

export interface PlantSpecies extends StillSpecies {
  kind: "plant";
  zone: "background" | "midground" | "foreground" | "floating" | "epiphyte";
  /** Height of the grown plant (it stands, so size is how tall it is). */
  size_cm?: [number, number];
}

export interface InvertebrateSpecies extends StillSpecies {
  kind: "invertebrate";
  role: string[];
  /** Where it lives: the surface it is bound to. */
  movement: "ground" | "glass" | "decor" | "sessile" | "swim";
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
  /** Plants and invertebrates (none in older releases). */
  plants?: PlantSpecies[];
  invertebrates?: InvertebrateSpecies[];
  /**
   * Pictures shown for a species that has none (`unknown_fish`: a black fish
   * with a white "?"); none in older releases.
   */
  defaults?: FishSpecies[];
  /** Rock and sand textures of the drawn decor (none in older releases). */
  textures?: Texture[];
  presets: Preset[];
  /** The downloaded catalog: its release (null before the first download). */
  pack?: { version: string | null; updating: boolean };
}
