/**
 * Fish simulation.
 *
 * Fish live in tank space, in centimetres: x along the front glass (0 at the
 * left), y from the surface (0) down, d from the front glass (0) back. Every
 * species follows a behaviour profile from its catalog descriptor:
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
 * sometimes out around it, sometimes back in.
 *
 * At night (ramping in and out) a species hides behind the nearest decor,
 * hovers in place or rests on the bottom. When food is dropped, fish are
 * drawn to the particles, each species as eager as its `feeding_response`.
 *
 * The simulation is pure (no DOM): the renderer reads `fish` and
 * `particles` after every step.
 */

import type { BehaviorProfile, FishSpecies, NightMode } from "./types";
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

export interface FishGroup {
  species: FishSpecies;
  /** Inventory line the group stands for. */
  line_id: string;
  count: number;
  size_cm: [number, number];
  /** Where the group lives, tank space (cm). */
  home?: [number, number, number] | null;
}

export interface Fish {
  id: string;
  species: FishSpecies;
  profile: BehaviorProfile;
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
  /** What a burrowing fish does now, and for how long. */
  burrow?: { mode: BurrowMode; left: number };
}

export type BurrowMode = "in" | "peek" | "out";

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

const TURN_DURATION = 0.35;
/** Bounds of a turn drawn by a clip, seconds. */
const TURN_CLIP_S: [number, number] = [0.25, 3];
const NIGHT_RAMP_S = 20;
const DEFAULT_SPEED: [number, number] = [4, 10];
/** Territory of a fish whose species has none but whose line has a home. */
const DEFAULT_TERRITORY_SIZES = 3;
const MIN_TERRITORY_CM = 6;
/** Share of the body out of the burrow while peeking: the head. */
export const PEEK = 0.32;
/** Body out of (or into) the burrow per second. */
const EMERGE_RATE = 0.7;
/** How long each burrow mode lasts, seconds, and how often it comes. */
const BURROW_MODES: {
  mode: BurrowMode;
  weight: number;
  s: [number, number];
}[] = [
  { mode: "peek", weight: 0.6, s: [12, 40] },
  { mode: "out", weight: 0.28, s: [5, 15] },
  { mode: "in", weight: 0.12, s: [3, 10] },
];

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
    const profile = species.behavior.profile;
    if (profile === "sand") return this._sand_point(size, null, 0);
    if (profile === "benthic") return this._perch(size, null, 0);
    return this._random_point(species, size, null, 0);
  }

  private _band(species: FishSpecies): [number, number] {
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

  private _depth(species: FishSpecies): [number, number] {
    const depth = species.behavior?.depth ?? [0.1, 0.9];
    return [clamp(depth[0], 0, 1), clamp(depth[1], 0, 1)];
  }

  private _random_point(
    species: FishSpecies,
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

  /** Where a fish heads next during the day, by profile. */
  private _next_target(f: Fish): [number, number, number] {
    if (f.profile === "sand")
      return this._sand_point(f.size, f.home, f.territory);
    if (f.profile === "benthic")
      return this._perch(f.size, f.home, f.territory);
    return this._random_point(f.species, f.size, f.home, f.territory);
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
    const profile = species.behavior?.profile ?? "cruiser";
    const [s0, s1] = species.behavior?.speed_cm_s ?? DEFAULT_SPEED;
    const territory = home
      ? Math.max(
          MIN_TERRITORY_CM,
          species.behavior?.territory_cm ?? hi * DEFAULT_TERRITORY_SIZES,
        )
      : 0;
    const start =
      profile === "sand"
        ? this._sand_point(size, home, territory)
        : profile === "benthic"
          ? this._perch(size, home, territory)
          : this._random_point(species, size, home, territory);
    const facing = this._rng.next() < 0.5 ? -1 : 1;
    const speed = this._rng.range(s0, s1);
    return {
      id: `${group.line_id}:${n}`,
      species,
      profile,
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

  /** Share of the body a burrowing fish wants out of its burrow. */
  private _burrow_want(f: Fish, dt: number): number {
    const state = f.burrow!;
    if (this.nightness > 0.5) return 0;
    if (this.feeding && (f.species.feeding_response ?? 0.5) > 0) return 1;
    state.left -= dt;
    if (state.left <= 0) {
      let pick = this._rng.next();
      const next =
        BURROW_MODES.find((m) => (pick -= m.weight) < 0) ?? BURROW_MODES[0];
      state.mode = next.mode;
      state.left = this._rng.range(next.s[0], next.s[1]);
    }
    return state.mode === "out" ? 1 : state.mode === "peek" ? PEEK : 0;
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
    this._step_schools(dt);
    for (const f of this.fish) this._step_fish(f, dt);
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
