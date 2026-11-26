/**
 * Simulation of the animals of a tank: its fish, and the invertebrates that
 * crawl or swim (a sessile one is placed where it settled, like a plant, and
 * never comes here).
 *
 * Animals live in tank space, in centimetres: x along the front glass (0 at
 * the left), y from the surface (0) down, d from the front glass (0) back.
 *
 * Two things say how one moves. Its **surface** is where it is bound: the
 * open water, the sand, the glass or the decor — it is what an invertebrate
 * carries as `movement`, and a fish has one too (read off its profile). Its
 * **profile** is how it goes about on that surface:
 *
 * - shoal:   boids (cohesion, alignment, separation) following a target the
 *            whole school shares;
 * - cruiser: open water, long paths;
 * - benthic: slow moves with stops, over the decor and the sand;
 * - hover:   around an anchor point;
 * - sand:    crawling on the sand (gobies at their burrow, starfish).
 *
 * A group may have a home (a burrow, a host anemone): with the territory of
 * its species, its fish stay around it. A territorial species without a
 * home placed in the editor picks one at random.
 *
 * A burrowing species (`behavior.burrow`) lives in a hole at its home: in it
 * at night, and during the day mostly peeking out (only its head shows),
 * sometimes out around it, sometimes back in. One that digs its hole
 * (`behavior.digs`, a pistol shrimp) also works at its mouth and pushes out
 * the sand it shifts, in puffs.
 *
 * At night (ramping in and out) a species hides behind the nearest decor,
 * hovers in place or rests on the bottom. When food is dropped, fish are
 * drawn to the particles, each species as eager as its `feeding_response`.
 *
 * The simulation is pure (no DOM): the renderer reads `fish`, `particles`
 * and `puffs` after every step.
 */

import type { AnimalSpecies, BehaviorProfile, NightMode } from "./types";
import { sand_v, type SandSurface } from "./geometry";
import { Rng } from "./rng";

export interface TankSize {
  length: number;
  height: number;
  width: number;
}

/** Somewhere to hide or perch: a decor, in tank space. */
export interface Hideout {
  x: number;
  y: number;
  d: number;
  /** Half-width, in cm. */
  radius: number;
}

export interface SimEnv {
  size: TankSize;
  /** Height of the sand band, as a share of the tank height (no `sand`). */
  sand_band?: number;
  /**
   * The sand surface: its height along the front glass and the back wall
   * (u 0..1), as a share of the tank height from the surface (0) down (1).
   */
  sand?: SandSurface;
  hideouts: Hideout[];
}

/**
 * Surface an animal is bound to, as the simulation holds it: the sessile
 * invertebrates of `Movement` are placed, not simulated.
 */
export type Surface = "ground" | "glass" | "decor" | "swim";

/**
 * Surface an animal is bound to: what its species says, else what its
 * profile implies (a sand dweller lives on the sand, a benthic fish over
 * the decor, anything else in the open water).
 */
export function surface_of(species: AnimalSpecies): Surface {
  const movement = species.movement;
  if (movement && movement !== "sessile") return movement;
  const profile = species.behavior?.profile;
  if (profile === "sand") return "ground";
  if (profile === "benthic") return "decor";
  return "swim";
}

/** How an animal goes about on its surface, when its species does not say. */
export function default_profile(surface: Surface): BehaviorProfile {
  if (surface === "ground" || surface === "glass") return "sand";
  if (surface === "decor") return "benthic";
  return "cruiser";
}

export interface FishGroup {
  species: AnimalSpecies;
  /** Inventory line the group stands for. */
  line_id: string;
  count: number;
  size_cm: [number, number];
  /** Where the group lives, tank space (cm). */
  home?: [number, number, number] | null;
}

export interface Fish {
  id: string;
  species: AnimalSpecies;
  profile: BehaviorProfile;
  /** Surface it is bound to (the open water for a fish). */
  movement: Surface;
  size: number;
  x: number;
  y: number;
  d: number;
  vx: number;
  vy: number;
  vd: number;
  /** Cruising speed, cm/s. */
  speed: number;
  /** Animation phase, in frames. */
  phase: number;
  /** +1 facing right, -1 facing left. */
  facing: number;
  /** Turn in progress: 0 → 1, or -1 when not turning. */
  turn: number;
  /** Drawing state: the clip shown, and a cross-fade from the previous one. */
  anim?: FishAnim;
  /** Opacity (hiding at night). */
  alpha: number;
  target: [number, number, number];
  /** Seconds left resting at the target. */
  rest: number;
  /** Seconds before picking another target. */
  retarget: number;
  anchor: [number, number, number];
  /** Inventory line of the fish. */
  line_id: string;
  /** Home and territory radius (cm), for a sedentary fish. */
  home: [number, number, number] | null;
  territory: number;
  /**
   * Share of the body out of its burrow: 1 swimming free, 0 hidden in it
   * (only for burrowing species).
   */
  emerge: number;
  /**
   * What a burrowing animal does now, for how long, and the seconds left
   * before the next puff of sand while it digs.
   */
  burrow?: { mode: BurrowMode; left: number; puff?: number };
}

export type BurrowMode = "in" | "peek" | "out" | "work";

export interface FishAnim {
  clip: string;
  frame: number;
  sx: number;
  /** Frame faded out after a clip change, with the fade progress 0 → 1. */
  /** Multiplier of the pitch (its sign follows the way the fish looks). */
  tilt: number;
  from?: { frame: number; sx: number; tilt: number; t: number };
}

export interface Particle {
  x: number;
  y: number;
  d: number;
  vy: number;
  age: number;
}

/**
 * A puff of sand pushed out of a burrow by a digging animal: it rises, then
 * spreads and settles back.
 */
export interface Puff {
  x: number;
  y: number;
  d: number;
  vx: number;
  vy: number;
  /** Seconds since it was raised, and how long it lives. */
  age: number;
  life: number;
  /** How wide it starts, cm. */
  radius: number;
}

const TURN_DURATION = 0.35;
/** Bounds of a turn drawn by a clip, seconds. */
const TURN_CLIP_S: [number, number] = [0.25, 3];
const NIGHT_RAMP_S = 20;
const DEFAULT_SPEED: [number, number] = [4, 10];
/**
 * Cruising speed of an invertebrate on its surface, cm/s, for a species
 * whose catalog descriptor gives none: a snail is slower than a shrimp.
 */
const SURFACE_SPEED: Record<Surface, [number, number]> = {
  ground: [1, 3],
  glass: [0.3, 1],
  decor: [1.5, 4],
  swim: [3, 6],
};
/** Territory of a fish whose species has none but whose line has a home. */
const DEFAULT_TERRITORY_SIZES = 3;
const MIN_TERRITORY_CM = 6;
/** Share of the body out of the burrow while peeking: the head. */
export const PEEK = 0.32;
/** Body out of (or into) the burrow per second. */
const EMERGE_RATE = 0.7;
/** How long each burrow mode lasts, seconds, and how often it comes. */
type BurrowModes = {
  mode: BurrowMode;
  weight: number;
  s: [number, number];
}[];
const BURROW_MODES: BurrowModes = [
  { mode: "peek", weight: 0.6, s: [12, 40] },
  { mode: "out", weight: 0.28, s: [5, 15] },
  { mode: "in", weight: 0.12, s: [3, 10] },
];
/** A digging species spends a good share of its day working at its hole. */
const DIG_MODES: BurrowModes = [
  { mode: "peek", weight: 0.4, s: [10, 30] },
  { mode: "work", weight: 0.3, s: [8, 25] },
  { mode: "out", weight: 0.2, s: [5, 15] },
  { mode: "in", weight: 0.1, s: [3, 10] },
];
/** Share of the body out of the burrow while working at its mouth. */
export const WORK = 0.5;
/** Seconds between two puffs of sand while digging. */
const PUFF_EVERY: [number, number] = [0.6, 1.8];
/** Grains pushed out at once. */
const PUFF_GRAINS: [number, number] = [2, 5];
/** How fast a puff falls back, cm/s². */
const PUFF_FALL = 6;
/** How much wider a puff gets per second. */
const PUFF_SPREAD = 1.6;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/**
 * How many fish of each group to draw: all of them when the total fits,
 * else proportionally, with at least one per group when possible.
 */
export function distribute(counts: number[], max: number): number[] {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total <= max) return counts.slice();
  if (max <= 0) return counts.map(() => 0);
  const out: number[] = counts.map((c) => (c > 0 ? 1 : 0));
  let left = max - out.reduce((a, b) => a + b, 0);
  if (left < 0) {
    // More groups than room: keep the first ones
    let room = max;
    return counts.map((c): number => (c > 0 && room-- > 0 ? 1 : 0));
  }
  const rest = counts.map((c, i) => c - out[i]);
  const rest_total = rest.reduce((a, b) => a + b, 0);
  const shares = rest.map((r) => (rest_total ? (r / rest_total) * left : 0));
  shares.forEach((s, i) => (out[i] += Math.floor(s)));
  left = max - out.reduce((a, b) => a + b, 0);
  const order = shares
    .map((s, i) => [s - Math.floor(s), i] as [number, number])
    .sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    if (out[i] < counts[i]) {
      out[i]++;
      left--;
    }
  }
  return out;
}

export class FishSim {
  readonly env: SimEnv;
  fish: Fish[] = [];
  particles: Particle[] = [];
  /** Sand raised by the animals digging their burrow. */
  puffs: Puff[] = [];
  /** 0 day .. 1 night (ramped). */
  nightness = 0;
  /** Flow of the pumps, 0..1. */
  flow = 0;
  time = 0;

  private _rng: Rng;
  private _night_target = 0;
  private _feeding_left = 0;
  private _school_targets = new Map<string, [number, number, number]>();
  private _school_timers = new Map<string, number>();

  constructor(
    env: SimEnv,
    groups: FishGroup[],
    max_fish: number,
    seed: string | number,
  ) {
    this.env = env;
    this._rng = new Rng(seed);
    const counts = distribute(
      groups.map((g) => g.count),
      max_fish,
    );
    groups.forEach((group, gi) => {
      if (!counts[gi]) return;
      const home = group.home ?? this._random_home(group);
      for (let n = 0; n < counts[gi]; n++)
        this.fish.push(this._spawn(group, n, home));
    });
  }

  /** Depth (y, cm) of the sand surface at a point along the tank. */
  sand_y(x: number, d: number = 0): number {
    const { length, height, width } = this.env.size;
    const t = clamp(x / Math.max(1, length), 0, 1);
    const sand = this.env.sand;
    if (sand) return height * sand_v(sand, t, d / Math.max(1, width));
    return height * (1 - (this.env.sand_band ?? 0.12) * 0.5);
  }

  /** A home for a territorial species without one placed. */
  private _random_home(group: FishGroup): [number, number, number] | null {
    const species = group.species;
    if (!species.behavior?.territory_cm && !species.behavior?.burrow)
      return null;
    const size = Math.max(group.size_cm[0], group.size_cm[1]);
    return this._surface_point(surface_of(species), species, size, null, 0);
  }

  private _band(species: AnimalSpecies): [number, number] {
    const band = species.behavior?.band ?? [0.1, 0.8];
    return [clamp(band[0], 0, 1), clamp(band[1], 0, 1)];
  }

  /**
   * A random coordinate, within the territory around `home` when given.
   * @param lo, hi: the range allowed without home
   * @param centre: the home's coordinate, radius: the territory's
   */
  private _around(
    lo: number,
    hi: number,
    centre: number | null,
    radius: number,
  ): number {
    if (centre === null) return this._rng.range(lo, Math.max(lo, hi));
    const a = clamp(centre - radius, lo, hi);
    const b = clamp(centre + radius, lo, hi);
    return this._rng.range(Math.min(a, b), Math.max(a, b));
  }

  private _depth(species: AnimalSpecies): [number, number] {
    const depth = species.behavior?.depth ?? [0.1, 0.9];
    return [clamp(depth[0], 0, 1), clamp(depth[1], 0, 1)];
  }

  private _random_point(
    species: AnimalSpecies,
    size: number,
    home: [number, number, number] | null = null,
    radius: number = 0,
  ): [number, number, number] {
    const { length, height, width } = this.env.size;
    const [b0, b1] = this._band(species);
    const [d0, d1] = this._depth(species);
    const margin = size * 0.8;
    const x = this._around(
      margin,
      Math.max(margin + 1, length - margin),
      home?.[0] ?? null,
      radius,
    );
    const d = this._around(
      d0 * width,
      d1 * width,
      home?.[2] ?? null,
      radius * 0.6,
    );
    // Above the sand
    const bottom = this.sand_y(x, d) - size * 0.3;
    const y = this._around(
      Math.min(b0 * height, bottom),
      Math.min(b1 * height, bottom),
      home?.[1] ?? null,
      radius * 0.6,
    );
    return [x, y, d];
  }

  /** A point on the sand (within the territory when given). */
  private _sand_point(
    size: number,
    home: [number, number, number] | null,
    radius: number,
  ): [number, number, number] {
    const { length, width } = this.env.size;
    const x = this._around(size, length - size, home?.[0] ?? null, radius);
    const d = this._around(
      0.05 * width,
      0.95 * width,
      home?.[2] ?? null,
      radius * 0.6,
    );
    return [x, this.sand_y(x, d) - size * 0.2, d];
  }

  /**
   * A point on the front glass (within the territory when given): a snail
   * grazes it from just under the surface down to the sand.
   */
  private _glass_point(
    size: number,
    home: [number, number, number] | null,
    radius: number,
  ): [number, number, number] {
    const { length } = this.env.size;
    const x = this._around(size, length - size, home?.[0] ?? null, radius);
    const d = this._glass_depth(size);
    const bottom = this.sand_y(x, d) - size * 0.2;
    const y = this._around(
      Math.min(size * 0.5, bottom),
      bottom,
      home?.[1] ?? null,
      radius * 0.6,
    );
    return [x, y, d];
  }

  /** How far from the front glass an animal grazing it swims, cm. */
  private _glass_depth(size: number): number {
    return Math.min(this.env.size.width, size * 0.3);
  }

  private _perch(
    size: number,
    home: [number, number, number] | null = null,
    radius: number = 0,
  ): [number, number, number] {
    const { length, height, width } = this.env.size;
    const near = home
      ? this.env.hideouts.filter(
          (h) => Math.abs(h.x - home[0]) < radius + h.radius,
        )
      : this.env.hideouts;
    if (near.length && this._rng.next() < 0.7) {
      const h = this._rng.pick(near);
      const x0 = home
        ? Math.max(h.x - h.radius, home[0] - radius)
        : h.x - h.radius;
      const x1 = home
        ? Math.min(h.x + h.radius, home[0] + radius)
        : h.x + h.radius;
      return [
        clamp(
          this._rng.range(Math.min(x0, x1), Math.max(x0, x1)),
          size,
          length - size,
        ),
        clamp(h.y - size * 0.5, 0, height),
        clamp(h.d - 2, 0, width),
      ];
    }
    const [x, , d] = this._sand_point(size, home, radius);
    return [x, this.sand_y(x, d) - size * 0.3, d];
  }

  /** A point of the surface an animal is bound to. */
  private _surface_point(
    movement: Surface,
    species: AnimalSpecies,
    size: number,
    home: [number, number, number] | null,
    radius: number,
  ): [number, number, number] {
    switch (movement) {
      case "ground":
        return this._sand_point(size, home, radius);
      case "glass":
        return this._glass_point(size, home, radius);
      case "decor":
        return this._perch(size, home, radius);
      default:
        return this._random_point(species, size, home, radius);
    }
  }

  /** Where an animal heads next during the day, on its surface. */
  private _next_target(f: Fish): [number, number, number] {
    return this._surface_point(
      f.movement,
      f.species,
      f.size,
      f.home,
      f.territory,
    );
  }

  private _spawn(
    group: FishGroup,
    n: number,
    home: [number, number, number] | null,
  ): Fish {
    const species = group.species;
    const lo = Math.min(group.size_cm[0], group.size_cm[1]);
    const hi = Math.max(group.size_cm[0], group.size_cm[1]);
    const size = this._rng.range(lo, hi);
    const movement = surface_of(species);
    const profile = species.behavior?.profile ?? default_profile(movement);
    const [s0, s1] =
      species.behavior?.speed_cm_s ??
      (species.kind === "invertebrate"
        ? SURFACE_SPEED[movement]
        : DEFAULT_SPEED);
    const territory = home
      ? Math.max(
          MIN_TERRITORY_CM,
          species.behavior?.territory_cm ?? hi * DEFAULT_TERRITORY_SIZES,
        )
      : 0;
    const start = this._surface_point(movement, species, size, home, territory);
    const facing = this._rng.next() < 0.5 ? -1 : 1;
    const speed = this._rng.range(s0, s1);
    return {
      id: `${group.line_id}:${n}`,
      species,
      profile,
      movement,
      size,
      x: start[0],
      y: start[1],
      d: start[2],
      vx: facing * speed * 0.5,
      vy: 0,
      vd: 0,
      speed,
      phase: this._rng.range(0, 64),
      facing,
      turn: -1,
      alpha: 1,
      target: start,
      rest: 0,
      retarget: this._rng.range(2, 8),
      anchor: home ?? start,
      line_id: group.line_id,
      home,
      territory,
      ...(species.behavior?.burrow && home
        ? {
            // Starts in its burrow, peeking
            x: home[0],
            y: this.sand_y(home[0], home[2]),
            d: home[2],
            vx: 0,
            emerge: PEEK,
            burrow: {
              mode: "peek" as BurrowMode,
              left: this._rng.range(2, 20),
            },
          }
        : { emerge: 1 }),
    };
  }

  /** Share of the body a burrowing animal wants out of its burrow. */
  private _burrow_want(f: Fish, dt: number): number {
    const state = f.burrow!;
    if (this.nightness > 0.5) return 0;
    if (this.feeding && (f.species.feeding_response ?? 0.5) > 0) return 1;
    const modes = f.species.behavior?.digs ? DIG_MODES : BURROW_MODES;
    state.left -= dt;
    if (state.left <= 0) {
      let pick = this._rng.next();
      const next = modes.find((m) => (pick -= m.weight) < 0) ?? modes[0];
      state.mode = next.mode;
      state.left = this._rng.range(next.s[0], next.s[1]);
    }
    if (state.mode === "out") return 1;
    if (state.mode === "peek") return PEEK;
    return state.mode === "work" ? WORK : 0;
  }

  /**
   * An animal digging at the mouth of its burrow: it pushes the sand it
   * shifts out of the hole, in puffs.
   */
  private _step_work(f: Fish, dt: number): void {
    const state = f.burrow!;
    state.puff = (state.puff ?? 0) - dt;
    if (state.puff > 0) return;
    state.puff = this._rng.range(PUFF_EVERY[0], PUFF_EVERY[1]);
    const grains = Math.round(this._rng.range(PUFF_GRAINS[0], PUFF_GRAINS[1]));
    const top = this.sand_y(f.x, f.d);
    for (let i = 0; i < grains; i++) {
      this.puffs.push({
        x: f.x + this._rng.range(-f.size * 0.4, f.size * 0.4),
        y: top,
        d: f.d,
        vx: this._rng.range(-1.5, 1.5),
        // Up out of the hole (y grows downwards)
        vy: -this._rng.range(2, 5),
        age: 0,
        life: this._rng.range(1.2, 2.4),
        radius: Math.max(0.2, f.size * this._rng.range(0.06, 0.14)),
      });
    }
  }

  /**
   * A burrowing fish at its burrow: held in the hole, coming out or going
   * in. Once fully out it swims like the others, and comes back to the hole
   * before going in.
   * @return true when the fish is held at its burrow this step
   */
  private _step_burrow(f: Fish, dt: number): boolean {
    const home = f.home!;
    const want = this._burrow_want(f, dt);
    if (f.emerge >= 1 && want >= 1) return false;
    const at_home = Math.hypot(f.x - home[0], f.d - home[2]) < f.size * 0.6;
    if (f.emerge >= 1 && !at_home) {
      // Swim back to the hole first
      f.target = [
        home[0],
        this.sand_y(home[0], home[2]) - f.size * 0.2,
        home[2],
      ];
      return false;
    }
    f.x = home[0];
    f.d = home[2];
    f.y = this.sand_y(home[0], home[2]);
    f.vx = f.vy = f.vd = 0;
    f.turn = -1;
    const step = EMERGE_RATE * dt;
    f.emerge = clamp(f.emerge + clamp(want - f.emerge, -step, step), 0, 1);
    if (f.burrow!.mode === "work") this._step_work(f, dt);
    f.phase += dt * this.frame_rate(f);
    return true;
  }

  /** Night (true) or day: the fish switch over NIGHT_RAMP_S seconds. */
  set_night(dark: boolean): void {
    this._night_target = dark ? 1 : 0;
  }

  /** Jump straight to day or night (first render). */
  force_night(dark: boolean): void {
    this._night_target = this.nightness = dark ? 1 : 0;
    for (const f of this.fish)
      f.alpha = dark && f.species.night === "hide" ? 0.35 : 1;
  }

  /**
   * Drop food at a point of the tank.
   * @param x, y, d: where (cm)
   * @param duration: seconds the fish keep looking for food
   */
  feed(
    x: number,
    y: number,
    d: number,
    duration: number,
    count: number = 24,
  ): void {
    const { length, width } = this.env.size;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: clamp(x + this._rng.range(-4, 4), 0, length),
        y: Math.max(0, y) + this._rng.range(0, 2),
        d: clamp(d + this._rng.range(-3, 3), 0, width),
        vy: this._rng.range(1.2, 2.8),
        age: -this._rng.range(0, 3),
      });
    }
    this._feeding_left = Math.max(this._feeding_left, duration);
  }

  get feeding(): boolean {
    return this._feeding_left > 0;
  }

  /** Advance the simulation by dt seconds. */
  step(dt: number): void {
    dt = clamp(dt, 0, 0.1);
    this.time += dt;
    const ramp = dt / NIGHT_RAMP_S;
    this.nightness = clamp(
      this.nightness + clamp(this._night_target - this.nightness, -ramp, ramp),
      0,
      1,
    );
    this._step_particles(dt);
    this._step_puffs(dt);
    this._step_schools(dt);
    for (const f of this.fish) this._step_fish(f, dt);
  }

  /** Advance the sand puffs: they rise, drift with the current, settle. */
  private _step_puffs(dt: number): void {
    const { length } = this.env.size;
    for (const p of this.puffs) {
      p.age += dt;
      p.vy += PUFF_FALL * dt;
      p.vx *= 1 - Math.min(1, dt * 1.5);
      p.x = clamp(p.x + (p.vx + this.flow * 2) * dt, 0, length);
      p.y += p.vy * dt;
    }
    this.puffs = this.puffs.filter((p) => p.age < p.life);
  }

  private _step_particles(dt: number): void {
    const { length } = this.env.size;
    const drift = this.flow * 3 * Math.sin(this.time * 0.4);
    for (const p of this.particles) {
      p.age += dt;
      if (p.age < 0) continue;
      p.y += p.vy * dt;
      p.x = clamp(p.x + drift * dt, 0, length);
    }
    this.particles = this.particles.filter(
      (p) => p.y < this.sand_y(p.x, p.d) && p.age < 90,
    );
    if (this._feeding_left > 0) {
      this._feeding_left -= dt;
      if (this._feeding_left <= 0) this.particles = [];
    }
  }

  private _step_schools(dt: number): void {
    for (const f of this.fish) {
      if (f.profile !== "shoal") continue;
      const key = FishSim.school(f);
      const timer = (this._school_timers.get(key) ?? 0) - dt / 2;
      if (!this._school_targets.has(key) || timer <= 0) {
        this._school_targets.set(
          key,
          this._random_point(f.species, f.size, f.home, f.territory),
        );
        this._school_timers.set(key, this._rng.range(5, 12));
      } else {
        this._school_timers.set(key, timer);
      }
    }
  }

  private _nearest_particle(f: Fish): Particle | null {
    let best: Particle | null = null;
    let dist = Infinity;
    for (const p of this.particles) {
      if (p.age < 0) continue;
      const dd = Math.hypot(p.x - f.x, p.y - f.y, (p.d - f.d) * 0.5);
      if (dd < dist) {
        dist = dd;
        best = p;
      }
    }
    return best;
  }

  /** School of a fish: its species, or its line when it has a home. */
  static school(f: Fish): string {
    return f.home ? `line:${f.line_id}` : f.species.id;
  }

  private _nearest_hideout(f: Fish): Hideout | null {
    let best: Hideout | null = null;
    let dist = Infinity;
    // Around its home for a sedentary fish
    const [x, y] = f.home ?? [f.x, f.y];
    for (const h of this.env.hideouts) {
      const dd = Math.hypot(h.x - x, h.y - y);
      if (dd < dist) {
        dist = dd;
        best = h;
      }
    }
    return best;
  }

  /** Where a fish wants to go, and how fast (cm/s). */
  private _goal(
    f: Fish,
    dt: number,
  ): { target: [number, number, number]; speed: number } {
    const night_mode: NightMode = f.species.night ?? "hover";
    const response = f.species.feeding_response ?? 0.5;

    // A burrowing fish going back in: to its hole
    if (
      f.burrow &&
      (f.burrow.mode !== "out" || this.nightness > 0.5) &&
      !this.feeding
    )
      return { target: f.target, speed: f.speed * 0.8 };

    // Food first, for those who care
    if (this.feeding && response > 0 && this.nightness < 0.8) {
      const p = this._nearest_particle(f);
      if (p) {
        if (
          Math.hypot(p.x - f.x, p.y - f.y, p.d - f.d) <
          Math.max(1.5, f.size * 0.4)
        ) {
          this.particles.splice(this.particles.indexOf(p), 1);
        }
        return {
          target: [p.x, p.y, p.d],
          speed: f.speed * (1 + 1.5 * response),
        };
      }
    }

    // Night
    if (this.nightness > 0.5) {
      if (night_mode === "hide") {
        const h = this._nearest_hideout(f);
        if (h) {
          return {
            target: [h.x, h.y, Math.min(this.env.size.width, h.d + 6)],
            speed: f.speed * 0.6,
          };
        }
      }
      if (night_mode === "rest_bottom" || f.profile === "sand") {
        // At home (in its burrow), else where it is
        const x = f.home?.[0] ?? f.x;
        const d = f.home?.[2] ?? f.d;
        const bottom = this.sand_y(x, d) - f.size * 0.2;
        return { target: [x, bottom, d], speed: f.speed * 0.3 };
      }
      return { target: [f.x, f.y, f.d], speed: f.speed * 0.12 };
    }

    // Day
    f.retarget -= dt;
    switch (f.profile) {
      case "shoal": {
        const t = this._school_targets.get(FishSim.school(f)) ?? f.target;
        return { target: t, speed: f.speed };
      }
      case "sand":
      case "benthic": {
        const sand = f.profile === "sand";
        if (Math.hypot(f.target[0] - f.x, f.target[1] - f.y) < f.size * 0.6) {
          if (f.rest <= 0)
            f.rest = sand ? this._rng.range(2, 7) : this._rng.range(1, 4);
          f.rest -= dt;
          if (f.rest <= 0) f.target = this._next_target(f);
          return { target: [f.x, f.y, f.d], speed: 0 };
        }
        return { target: f.target, speed: f.speed * (sand ? 0.4 : 0.5) };
      }
      case "hover": {
        if (f.retarget <= 0) {
          const r = Math.max(4, f.size * 2);
          f.target = [
            clamp(
              f.anchor[0] + this._rng.range(-r, r),
              f.size,
              this.env.size.length - f.size,
            ),
            clamp(
              f.anchor[1] + this._rng.range(-r / 2, r / 2),
              0,
              this.env.size.height,
            ),
            clamp(
              f.anchor[2] + this._rng.range(-r / 2, r / 2),
              0,
              this.env.size.width,
            ),
          ];
          f.retarget = this._rng.range(2, 5);
        }
        return { target: f.target, speed: f.speed * 0.4 };
      }
      default: {
        if (
          f.retarget <= 0 ||
          Math.hypot(f.target[0] - f.x, f.target[1] - f.y) < f.size
        ) {
          f.target = this._next_target(f);
          f.retarget = this._rng.range(4, 10);
        }
        return { target: f.target, speed: f.speed };
      }
    }
  }

  private _step_fish(f: Fish, dt: number): void {
    const { length, height, width } = this.env.size;
    if (f.burrow && f.home && this._step_burrow(f, dt)) return;
    const goal = this._goal(f, dt);

    // Seek with arrival
    const dx = goal.target[0] - f.x;
    const dy = goal.target[1] - f.y;
    const dd = goal.target[2] - f.d;
    const dist = Math.hypot(dx, dy, dd) || 1;
    const arrive = Math.min(1, dist / Math.max(2, f.size));
    let ax = (dx / dist) * goal.speed * arrive - f.vx;
    let ay = (dy / dist) * goal.speed * arrive * 0.6 - f.vy;
    let ad = (dd / dist) * goal.speed * arrive * 0.5 - f.vd;

    // School
    if (f.profile === "shoal" && this.nightness < 0.5) {
      const w = f.species.behavior?.shoal ?? {};
      let cx = 0;
      let cy = 0;
      let cd = 0;
      let mvx = 0;
      let mvy = 0;
      let sx = 0;
      let sy = 0;
      let n = 0;
      const radius = f.size * 8;
      for (const o of this.fish) {
        if (o === f || o.species.id !== f.species.id) continue;
        const ox = o.x - f.x;
        const oy = o.y - f.y;
        const od = o.d - f.d;
        const r = Math.hypot(ox, oy, od);
        if (r > radius) continue;
        n++;
        cx += o.x;
        cy += o.y;
        cd += o.d;
        mvx += o.vx;
        mvy += o.vy;
        if (r < f.size * 1.6 && r > 0) {
          sx -= ox / (r * r);
          sy -= oy / (r * r);
        }
      }
      if (n) {
        const coh = w.cohesion ?? 1;
        const ali = w.alignment ?? 0.8;
        const sep = w.separation ?? 1.2;
        ax +=
          (cx / n - f.x) * 0.3 * coh +
          (mvx / n - f.vx) * 0.5 * ali +
          sx * 30 * sep;
        ay +=
          (cy / n - f.y) * 0.3 * coh +
          (mvy / n - f.vy) * 0.5 * ali +
          sy * 30 * sep;
        ad += (cd / n - f.d) * 0.2 * coh;
      }
    }

    // Walls
    const margin = f.size * 0.7;
    if (f.x < margin) ax += (margin - f.x) * 4;
    if (f.x > length - margin) ax -= (f.x - (length - margin)) * 4;
    if (f.y < f.size * 0.3) ay += (f.size * 0.3 - f.y) * 4;
    // The sand is the floor (sand dwellers stay on it)
    const floor =
      this.sand_y(f.x, f.d) - f.size * (f.profile === "sand" ? 0.15 : 0.3);
    if (f.y > floor) ay -= (f.y - floor) * 4;
    // A grazer of the glass stays against it
    if (f.movement === "glass") ad += (this._glass_depth(f.size) - f.d) * 4;

    const turn_rate = f.species.behavior?.turn_rate ?? 2.5;
    const gain = clamp(turn_rate * dt, 0, 1);
    f.vx += ax * gain;
    f.vy += ay * gain;
    f.vd += ad * gain;

    // Current from the pumps: a slow sway
    const drift = this.flow * 2.5 * Math.sin(this.time * 0.35 + f.phase);

    const max = goal.speed * 1.3 + 0.5;
    const sp = Math.hypot(f.vx, f.vy, f.vd);
    if (sp > max) {
      f.vx *= max / sp;
      f.vy *= max / sp;
      f.vd *= max / sp;
    }
    f.x = clamp(f.x + (f.vx + drift) * dt, 0, length);
    f.y = clamp(f.y + f.vy * dt, 0, Math.min(height, this.sand_y(f.x, f.d)));
    f.d = clamp(f.d + f.vd * dt, 0, width);

    // Facing, with hysteresis and a short turn animation
    if (f.turn >= 0) {
      f.turn += dt / FishSim.turn_duration(f);
      if (f.turn >= 1) f.turn = -1;
    } else if (Math.abs(f.vx) > 0.8 && Math.sign(f.vx) !== f.facing) {
      f.facing = Math.sign(f.vx);
      f.turn = 0;
    }

    // Hiding fish fade behind their decor
    const hide = f.species.night === "hide" ? this.nightness : 0;
    f.alpha = 1 - 0.65 * hide;
    // The animation phase runs at a speed following the swimming speed, so
    // the tail beats faster when the fish hurries.
    f.phase += dt * this.frame_rate(f);
  }

  /** Swimming speed relative to cruising: drives the tail beat. */
  speed_factor(f: Fish): number {
    const sp = Math.hypot(f.vx, f.vy);
    return clamp(sp / Math.max(1, f.speed), 0.35, 2.5);
  }

  /** True when a fish moves slowly enough to play its idle clip. */
  idle(f: Fish): boolean {
    if (!f.species.clips?.idle) return false;
    // Hysteresis, so that a fish near the threshold does not flicker
    const limit = f.anim?.clip === "idle" ? 0.6 : 0.5;
    return this.speed_factor(f) < limit;
  }

  /**
   * Frames per second of the clip a fish plays right now: the idle clip at
   * its own rate, the swim clip following the swimming speed.
   */
  frame_rate(f: Fish): number {
    if (this.idle(f)) return f.species.clips?.idle?.fps || 12;
    const clip = f.species.clips?.swim;
    return (clip?.fps ?? 24) * this.speed_factor(f);
  }

  /** Seconds a turn lasts: its clip's length, else a quick squash. */
  static turn_duration(f: Fish): number {
    const clip = f.species.clips?.turn;
    if (!clip) return TURN_DURATION;
    const seconds = (clip.to - clip.from + 1) / Math.max(1, clip.fps);
    return clamp(seconds, TURN_CLIP_S[0], TURN_CLIP_S[1]);
  }

  /** Pitch of a fish, in radians (nose up negative). */
  static pitch(f: Fish): number {
    const h = Math.max(0.5, Math.abs(f.vx));
    return clamp(Math.atan2(f.vy, h), -0.45, 0.45);
  }
}

/** How opaque a puff of sand is now: it shows at once, then thins out. */
export function puff_alpha(p: Puff): number {
  const t = clamp(p.age / Math.max(0.01, p.life), 0, 1);
  return 0.5 * (1 - t) * Math.min(1, t * 8);
}

/** How wide a puff of sand is now, cm: it spreads as it drifts. */
export function puff_radius(p: Puff): number {
  return p.radius * (1 + PUFF_SPREAD * p.age);
}
