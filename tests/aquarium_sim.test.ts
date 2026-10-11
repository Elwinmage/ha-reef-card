import { describe, expect, it } from "vitest";
import {
  FishSim,
  PEEK,
  distribute,
  type FishGroup,
  type SimEnv,
} from "../src/aquarium/sim";
import type { FishSpecies } from "../src/aquarium/types";

function species(
  id: string,
  profile: any,
  extra: Partial<FishSpecies> = {},
): FishSpecies {
  return {
    id,
    kind: "fish",
    source: "bundled",
    frame: [256, 128],
    columns: 8,
    clips: { swim: { from: 0, to: 23, fps: 24, loop: true } },
    atlas: { "1x": `/a/${id}.webp` },
    behavior: { profile, speed_cm_s: [5, 8] },
    ...extra,
  } as FishSpecies;
}

const env: SimEnv = {
  size: { length: 120, height: 50, width: 60 },
  sand_band: 0.1,
  hideouts: [{ x: 30, y: 40, d: 30, radius: 10 }],
};

function group(s: FishSpecies, count: number): FishGroup {
  return { species: s, line_id: s.id, count, size_cm: [5, 8] };
}

function run(sim: FishSim, seconds: number) {
  for (let t = 0; t < seconds; t += 1 / 30) sim.step(1 / 30);
}

describe("distribute", () => {
  it("keeps everything when it fits", () => {
    expect(distribute([3, 2], 10)).toEqual([3, 2]);
  });
  it("shares the room proportionally, one at least per group", () => {
    const out = distribute([40, 2, 0], 10);
    expect(out.reduce((a, b) => a + b, 0)).toBe(10);
    expect(out[1]).toBeGreaterThanOrEqual(1);
    expect(out[2]).toBe(0);
    expect(distribute([5, 5, 5], 2)).toEqual([1, 1, 0]);
    expect(distribute([5], 0)).toEqual([0]);
  });
});

describe("FishSim", () => {
  it("spawns deterministic fish inside the tank", () => {
    const groups = [
      group(species("chromis", "shoal"), 7),
      group(species("tang", "cruiser"), 1),
    ];
    const a = new FishSim(env, groups, 30, "seed");
    const b = new FishSim(env, groups, 30, "seed");
    expect(a.fish).toHaveLength(8);
    expect(a.fish.map((f) => f.x)).toEqual(b.fish.map((f) => f.x));
    run(a, 20);
    for (const f of a.fish) {
      expect(f.x).toBeGreaterThanOrEqual(0);
      expect(f.x).toBeLessThanOrEqual(120);
      expect(f.y).toBeGreaterThanOrEqual(0);
      expect(f.y).toBeLessThanOrEqual(50);
      expect(f.d).toBeGreaterThanOrEqual(0);
      expect(f.d).toBeLessThanOrEqual(60);
      expect(Number.isFinite(f.phase)).toBe(true);
    }
  });

  it("caps the fish drawn", () => {
    const sim = new FishSim(
      env,
      [group(species("chromis", "shoal"), 50)],
      12,
      1,
    );
    expect(sim.fish).toHaveLength(12);
  });

  it("keeps a school together", () => {
    const sim = new FishSim(
      env,
      [group(species("chromis", "shoal"), 8)],
      30,
      "school",
    );
    const spread = () => {
      const xs = sim.fish.map((f) => f.x);
      return Math.max(...xs) - Math.min(...xs);
    };
    run(sim, 30);
    expect(spread()).toBeLessThan(80);
  });

  it("moves every profile", () => {
    const groups = ["benthic", "hover", "cruiser"].map((p) =>
      group(species(p, p), 2),
    );
    const sim = new FishSim({ ...env, hideouts: [] }, groups, 30, 3);
    const start = sim.fish.map((f) => [f.x, f.y]);
    run(sim, 15);
    const moved = sim.fish.filter(
      (f, i) => Math.hypot(f.x - start[i][0], f.y - start[i][1]) > 0.5,
    );
    expect(moved.length).toBeGreaterThan(3);
  });

  it("hides at night behind the decor, and comes back", () => {
    const hider = species("hider", "cruiser", { night: "hide" });
    const sim = new FishSim(env, [group(hider, 3)], 30, 4);
    sim.set_night(true);
    run(sim, 60);
    expect(sim.nightness).toBe(1);
    for (const f of sim.fish) {
      expect(f.alpha).toBeCloseTo(0.35);
      expect(Math.hypot(f.x - 30, f.y - 40)).toBeLessThan(20);
      expect(f.d).toBeGreaterThan(30);
    }
    sim.force_night(false);
    expect(sim.nightness).toBe(0);
    expect(sim.fish[0].alpha).toBe(1);
  });

  it("rests on the bottom or hovers at night", () => {
    const sim = new FishSim(
      env,
      [
        group(species("rest", "cruiser", { night: "rest_bottom" }), 1),
        group(species("hov", "cruiser"), 1),
      ],
      30,
      5,
    );
    sim.force_night(true);
    run(sim, 40);
    expect(sim.fish[0].y).toBeGreaterThan(40);
  });

  it("goes for the food and eats it", () => {
    const eager = species("eager", "cruiser", { feeding_response: 1 });
    const sim = new FishSim(env, [group(eager, 4)], 30, 6);
    sim.feed(60, 0, 20, 30, 10);
    expect(sim.feeding).toBe(true);
    expect(sim.particles).toHaveLength(10);
    run(sim, 25);
    expect(sim.particles.length).toBeLessThan(10);
    run(sim, 10);
    expect(sim.feeding).toBe(false);
    expect(sim.particles).toHaveLength(0);
  });

  it("drifts with the flow and turns", () => {
    const sim = new FishSim(
      { ...env, hideouts: [] },
      [group(species("t", "cruiser"), 3)],
      30,
      7,
    );
    sim.flow = 1;
    let turned = false;
    for (let i = 0; i < 900; i++) {
      sim.step(1 / 30);
      if (sim.fish.some((f) => f.turn >= 0)) turned = true;
    }
    expect(turned).toBe(true);
    const f = sim.fish[0];
    expect(sim.speed_factor(f)).toBeGreaterThanOrEqual(0.35);
    expect(sim.frame_rate(f)).toBeGreaterThan(0);
    expect(Math.abs(FishSim.pitch({ ...f, vx: 0, vy: 100 }))).toBeCloseTo(0.45);
  });

  it("times turns by their clip and idles at the idle rate", () => {
    const clips = {
      swim: { from: 0, to: 23, fps: 24, loop: true },
      idle: { from: 24, to: 47, fps: 12, loop: true, pingpong: true },
      turn: { from: 48, to: 77, fps: 24, loop: false },
    };
    const s = species("p", "cruiser", { clips });
    const sim = new FishSim({ ...env, hideouts: [] }, [group(s, 1)], 30, 3);
    const f = sim.fish[0];
    expect(FishSim.turn_duration(f)).toBeCloseTo(30 / 24);
    expect(
      FishSim.turn_duration({
        ...f,
        species: { ...s, clips: { turn: { ...clips.turn, to: 48 } } },
      }),
    ).toBe(0.25);
    expect(
      FishSim.turn_duration({ ...f, species: species("q", "cruiser") }),
    ).toBe(0.35);
    // slow: the idle clip at its own rate, with some hysteresis
    f.vx = 0;
    f.vy = 0;
    expect(sim.idle(f)).toBe(true);
    expect(sim.frame_rate(f)).toBe(12);
    f.vx = f.speed * 0.55;
    expect(sim.idle(f)).toBe(false);
    f.anim = { clip: "idle", frame: 30, sx: 1 };
    expect(sim.idle(f)).toBe(true);
    f.vx = f.speed;
    expect(sim.idle(f)).toBe(false);
    expect(sim.frame_rate(f)).toBeCloseTo(24);
    expect(sim.idle({ ...f, species: species("q", "cruiser") })).toBe(false);
  });

  it("keeps above a sloping sand line", () => {
    const sloped: SimEnv = {
      ...env,
      sand: {
        front: [
          [0, 0.6],
          [1, 0.9],
        ],
        // higher at the back: a bank
        back: [
          [0, 0.4],
          [1, 0.7],
        ],
      },
      hideouts: [],
    };
    const sim = new FishSim(
      sloped,
      [
        group(
          species("low", "cruiser", {
            behavior: { profile: "cruiser", band: [0.9, 1] },
          }),
          4,
        ),
      ],
      30,
      11,
    );
    expect(sim.sand_y(0)).toBeCloseTo(30);
    expect(sim.sand_y(120)).toBeCloseTo(45);
    expect(sim.sand_y(-10)).toBeCloseTo(30);
    expect(sim.sand_y(0, 60)).toBeCloseTo(20);
    expect(sim.sand_y(120, 30)).toBeCloseTo(40);
    run(sim, 20);
    for (const f of sim.fish)
      expect(f.y).toBeLessThanOrEqual(sim.sand_y(f.x, f.d) + 0.01);
    // without a line: the sand band
    expect(
      new FishSim({ ...env, sand_band: undefined }, [], 1, 1).sand_y(0),
    ).toBeCloseTo(47);
  });

  it("crawls on the sand around its burrow, and goes in at night", () => {
    const goby = species("goby", "sand", {
      behavior: { profile: "sand", speed_cm_s: [2, 3], territory_cm: 8 },
    });
    const home: [number, number, number] = [90, 44, 20];
    const sim = new FishSim(
      {
        ...env,
        sand: {
          front: [
            [0, 0.9],
            [1, 0.9],
          ],
          back: [
            [0, 0.9],
            [1, 0.9],
          ],
        },
      },
      [{ ...group(goby, 2), home }],
      30,
      12,
    );
    for (const f of sim.fish) {
      expect(f.home).toEqual(home);
      expect(f.territory).toBe(8);
    }
    run(sim, 60);
    for (const f of sim.fish) {
      expect(Math.abs(f.x - 90)).toBeLessThan(8 + f.size);
      expect(f.y).toBeGreaterThan(sim.sand_y(f.x) - f.size);
    }
    sim.force_night(true);
    run(sim, 60);
    for (const f of sim.fish) expect(Math.abs(f.x - 90)).toBeLessThan(3);
  });

  it("stays in its territory, with a home picked when none is placed", () => {
    const kinds = ["benthic", "hover", "cruiser", "shoal", "sand"];
    const groups = kinds.map((p) =>
      group(
        species(p, p, {
          behavior: { profile: p as any, speed_cm_s: [4, 6], territory_cm: 10 },
        }),
        2,
      ),
    );
    const sim = new FishSim(env, groups, 30, 13);
    for (const f of sim.fish) expect(f.home).not.toBeNull();
    // the same home for a whole group
    expect(sim.fish[0].home).toBe(sim.fish[1].home);
    expect(FishSim.school(sim.fish[6])).toBe("line:shoal");
    run(sim, 40);
    for (const f of sim.fish)
      expect(Math.abs(f.x - f.home![0])).toBeLessThan(10 + 3 * f.size);
    // a home placed on a line of a species without territory: a default one
    const free = new FishSim(
      env,
      [{ ...group(species("free", "hover"), 1), home: [20, 10, 10] }],
      30,
      14,
    );
    expect(free.fish[0].territory).toBe(24);
    expect(free.fish[0].anchor).toEqual([20, 10, 10]);
    // hides near its home at night
    const hider = new FishSim(
      env,
      [
        {
          ...group(species("h", "cruiser", { night: "hide" }), 1),
          home: [35, 30, 20],
        },
      ],
      30,
      15,
    );
    hider.force_night(true);
    run(hider, 40);
    expect(Math.abs(hider.fish[0].x - 30)).toBeLessThan(15);
  });

  it("lives in its burrow: in at night, peeking or out by day", () => {
    const goby = species("goby", "sand", {
      behavior: {
        profile: "sand",
        speed_cm_s: [3, 5],
        territory_cm: 10,
        burrow: true,
      },
      feeding_response: 0.8,
    });
    const home: [number, number, number] = [60, 45, 30];
    const sim = new FishSim(
      { ...env, hideouts: [] },
      [{ ...group(goby, 1), home }],
      30,
      21,
    );
    const f = sim.fish[0];
    expect(f.emerge).toBe(PEEK);
    expect([f.x, f.d]).toEqual([60, 30]);
    const seen = new Set<string>();
    let far = 0;
    for (let t = 0; t < 600; t += 1 / 10) {
      sim.step(1 / 10);
      seen.add(f.emerge >= 1 ? "out" : f.emerge > 0.2 ? "peek" : "in");
      far = Math.max(far, Math.abs(f.x - 60));
      if (f.emerge < 1) {
        // held in its hole
        expect(f.x).toBe(60);
        expect(f.y).toBeCloseTo(sim.sand_y(60, 30));
      }
    }
    expect([...seen].sort()).toEqual(["in", "out", "peek"]);
    expect(far).toBeGreaterThan(1);
    expect(far).toBeLessThan(10 + 3 * f.size);
    // night: back in, whatever it was doing
    sim.set_night(true);
    for (let t = 0; t < 120; t += 1 / 10) sim.step(1 / 10);
    expect(f.emerge).toBe(0);
    expect(f.x).toBe(60);
    // food by day: comes out
    sim.force_night(false);
    sim.feed(60, 0, 30, 30, 10);
    for (let t = 0; t < 3; t += 1 / 10) sim.step(1 / 10);
    expect(f.emerge).toBe(1);
    // a burrowing species without home or territory digs one on the sand
    const free = new FishSim(
      env,
      [
        group(
          species("g2", "sand", {
            behavior: { profile: "sand", burrow: true },
          }),
          1,
        ),
      ],
      30,
      22,
    );
    expect(free.fish[0].home).not.toBeNull();
    expect(free.fish[0].emerge).toBe(PEEK);
  });
});
