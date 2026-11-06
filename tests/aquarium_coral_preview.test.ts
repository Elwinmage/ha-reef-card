import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CYCLE_S,
  RECOLOUR_DELAY_MS,
  ReefCoralPreview,
  clock,
  cycle_at,
  cycle_frame,
} from "../src/aquarium/editor/coral_preview";
import type { CoralSpecies } from "../src/aquarium/types";

if (!customElements.get("reef-coral-preview"))
  customElements.define("reef-coral-preview", ReefCoralPreview);

// ── Fakes ────────────────────────────────────────────────────────────────────

/** Image stand-in: loads asynchronously, fails when the URL contains "bad". */
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin = "";
  decoding = "";
  width = 4;
  height = 2;
  private _src = "";
  get src(): string {
    return this._src;
  }
  set src(url: string) {
    this._src = url;
    setTimeout(() =>
      url.includes("bad") ? this.onerror?.() : this.onload?.(),
    );
  }
}

interface Call {
  canvas: HTMLCanvasElement;
  op: string;
  args: any[];
  state: Record<string, any>;
}

/**
 * Fake 2D contexts recording every call with the context state at the time.
 * @param none: canvases getting no context
 */
function fake_contexts(none: (c: HTMLCanvasElement) => boolean = () => false) {
  const calls: Call[] = [];
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      if (none(this)) return null;
      const canvas = this;
      const state: Record<string, any> = {
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
      };
      return new Proxy(state, {
        get: (t, k) => {
          if (k in t) return t[k as string];
          if (k === "getImageData")
            return (_x: number, _y: number, w: number, h: number) => ({
              width: w,
              height: h,
              data: new Uint8ClampedArray(w * h * 4),
            });
          if (k === "createImageData")
            return (w: number, h: number) => ({
              width: w,
              height: h,
              data: new Uint8ClampedArray(w * h * 4),
            });
          if (k === "createLinearGradient")
            return () => ({ addColorStop: () => undefined });
          return (...args: any[]) =>
            calls.push({ canvas, op: String(k), args, state: { ...t } });
        },
        set: (t, k, v) => ((t[k as string] = v), true),
      }) as any;
    } as any,
  );
  return calls;
}

let n = 0;
/** A coral of 1 x 1 frames, with atlas URLs unique to the test (cache). */
function species(extra: Partial<CoralSpecies> = {}): CoralSpecies {
  n += 1;
  return {
    id: "torch",
    kind: "coral",
    source: "bundled",
    frame: [1, 1],
    columns: 4,
    clips: {
      day: { from: 0, to: 3, fps: 12, loop: true, pingpong: true },
      close: { from: 4, to: 7, fps: 12, loop: false },
    },
    atlas: { shade: `/p${n}/shade.webp`, mask: `/p${n}/mask.png` },
    palette: [
      { default: "#00ff00", fluo: false },
      { default: "#ff0000", fluo: true },
    ],
    ...extra,
  };
}

const flush = () => new Promise((r) => setTimeout(r, 5));

/** requestAnimationFrame run by hand. */
let frames: (() => void)[] = [];

beforeEach(() => {
  vi.stubGlobal("Image", FakeImage);
  frames = [];
  vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
    frames.push(cb);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

// ── The accelerated day ──────────────────────────────────────────────────────

describe("cycle_at", () => {
  it("goes through waking, day, falling asleep and night, and loops", () => {
    const at = (t: number) => cycle_at(t);
    expect(at(0)).toMatchObject({ phase: "waking", progress: 0, hour: 7 });
    expect(at(1.5).hour).toBeCloseTo(8);
    expect(at(3)).toMatchObject({ phase: "day", progress: 0, hour: 9 });
    expect(at(10)).toMatchObject({ phase: "falling", hour: 20 });
    expect(at(13)).toMatchObject({ phase: "night", hour: 22 });
    // the night goes over midnight
    expect(at(15.5).hour).toBeCloseTo(2.5);
    // looped, also before 0
    expect(at(CYCLE_S + 1)).toEqual(at(1));
    expect(at(-1)).toEqual(at(CYCLE_S - 1));
    // dark at night, bright by day, glowing most in the evening
    expect(at(15).light).toBeLessThan(at(6).light);
    expect(at(9.9).glow).toBeGreaterThan(at(6).glow);
  });

  it("formats the hour", () => {
    expect(clock(7.5)).toBe("07:30");
    expect(clock(23.999)).toBe("23:59");
    expect(clock(0)).toBe("00:00");
  });
});

describe("cycle_frame", () => {
  const coral = species();
  const state = (phase: any, progress = 0, elapsed = 0) =>
    ({ ...cycle_at(0), phase, progress, elapsed }) as any;

  it("opens, sways, closes and sleeps", () => {
    // waking: the close clip backwards
    expect(cycle_frame(coral, state("waking", 0))).toBe(7);
    expect(cycle_frame(coral, state("waking", 1))).toBe(4);
    // day: the day clip from its first frame
    expect(cycle_frame(coral, state("day", 0, 0))).toBe(0);
    expect(cycle_frame(coral, state("day", 0.1, 2 / 12))).toBe(2);
    // falling asleep, then closed all night
    expect(cycle_frame(coral, state("falling", 0))).toBe(4);
    expect(cycle_frame(coral, state("falling", 1))).toBe(7);
    expect(cycle_frame(coral, state("night"))).toBe(7);
  });

  it("stays on the first frame of a coral that does not close", () => {
    const open = species({
      clips: { sway: { from: 2, to: 3, fps: 12, loop: true } },
    });
    for (const phase of ["waking", "falling", "night"])
      expect(cycle_frame(open, state(phase, 0.5))).toBe(2);
    const bare = species({ clips: undefined as any });
    expect(cycle_frame(bare, state("day", 0.5, 1))).toBe(0);
  });
});

// ── <reef-coral-preview> ─────────────────────────────────────────────────────

async function preview(
  coral: CoralSpecies | null,
  palette: string[] = [],
): Promise<ReefCoralPreview> {
  const el = document.createElement("reef-coral-preview") as ReefCoralPreview;
  el.species = coral;
  el.palette = palette;
  document.body.appendChild(el);
  await el.updateComplete;
  await flush(); // the atlas is recoloured
  return el;
}

const shown = (calls: Call[], el: ReefCoralPreview) => {
  const canvas = el.shadowRoot!.querySelector("canvas");
  return calls.filter((c) => c.canvas === canvas);
};
const button = (el: ReefCoralPreview, mode: string) =>
  el.shadowRoot!.querySelector(
    `button[data-mode=${mode}]`,
  ) as HTMLButtonElement;

describe("reef-coral-preview", () => {
  it("shows the open coral by day, glowing", async () => {
    const calls = fake_contexts();
    const el = await preview(species());
    expect(button(el, "day").classList.contains("on")).toBe(true);
    expect(button(el, "day").textContent).toContain("Day");
    const drawn = shown(calls, el).filter((c) => c.op === "drawImage");
    // the coral (darkened on the scratch canvas), then its glow
    expect(drawn).toHaveLength(2);
    expect(drawn[1].state.globalCompositeOperation).toBe("screen");
    // frame 0 of the atlas, no clock
    expect(drawn[1].args.slice(1, 3)).toEqual([0, 0]);
    expect(shown(calls, el).some((c) => c.op === "fillText")).toBe(false);
  });

  it("shows the closed coral at night", async () => {
    const calls = fake_contexts();
    const el = await preview(species());
    calls.length = 0;
    button(el, "night").click();
    await el.updateComplete;
    expect(el.mode).toBe("night");
    const glow = shown(calls, el).find(
      (c) =>
        c.op === "drawImage" && c.state.globalCompositeOperation === "screen",
    )!;
    // frame 7 (last of close) in a 4 columns atlas: x 3, y 1
    expect(glow.args.slice(1, 3)).toEqual([3, 1]);
    expect(frames).toEqual([]); // still: no animation
  });

  it("plays the accelerated day with its clock, and stops", async () => {
    const calls = fake_contexts();
    const now = vi.spyOn(performance, "now").mockReturnValue(1000);
    const el = await preview(species());
    calls.length = 0;
    button(el, "cycle").click();
    await el.updateComplete;
    expect(frames).toHaveLength(1);
    const text = () =>
      shown(calls, el)
        .filter((c) => c.op === "fillText")
        .map((c) => c.args[0]);
    expect(text()).toEqual(["☀ 07:00"]);
    // 14 s later: 1 s into the night (22:00 + 0.2 x 9 h)
    now.mockReturnValue(15000);
    frames.shift()!();
    expect(text().at(-1)).toBe("☾ 23:48");
    expect(frames).toHaveLength(1);
    // back to day: the animation stops
    button(el, "day").click();
    await el.updateComplete;
    expect(cancelAnimationFrame).toHaveBeenCalled();
    // removed while playing: stopped too
    button(el, "cycle").click();
    await el.updateComplete;
    el.remove();
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it("pauses the accelerated day on its hour, and resumes it", async () => {
    const calls = fake_contexts();
    const now = vi.spyOn(performance, "now").mockReturnValue(1000);
    const el = await preview(species());
    const cycle = button(el, "cycle");
    expect(cycle.textContent).toContain("▶");
    cycle.click();
    await el.updateComplete;
    expect(cycle.textContent).toContain("⏸");
    const text = () =>
      shown(calls, el)
        .filter((c) => c.op === "fillText")
        .map((c) => c.args[0])
        .at(-1);

    // 1.5 s in (08:00): paused, the animation stopped, the hour stays
    now.mockReturnValue(2500);
    cycle.click();
    await el.updateComplete;
    expect(el.paused).toBe(true);
    expect(cycle.textContent).toContain("▶");
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
    expect(text()).toBe("☀ 08:00");
    now.mockReturnValue(60000);
    el.paint(); // a colour changed meanwhile: still 08:00
    expect(text()).toBe("☀ 08:00");

    // resumed from 08:00, whatever time went by
    frames.length = 0;
    cycle.click();
    await el.updateComplete;
    expect(el.paused).toBe(false);
    expect(frames).toHaveLength(1);
    expect(text()).toBe("☀ 08:00");
    now.mockReturnValue(60000 + 1500); // 1.5 s more: 09:00
    frames.shift()!();
    expect(text()).toBe("☀ 09:00");

    // paused, then another mode: the next cycle starts playing at 07:00
    cycle.click();
    await el.updateComplete;
    button(el, "night").click();
    await el.updateComplete;
    expect(el.paused).toBe(false);
    cycle.click();
    await el.updateComplete;
    expect(text()).toBe("☀ 07:00");
  });

  it("recolours at once for a new coral, after a pause for colours", async () => {
    fake_contexts();
    const el = await preview(species(), ["#111111"]);
    const recolour = vi.spyOn(el, "recolour");
    vi.useFakeTimers();
    el.palette = ["#222222"];
    await el.updateComplete;
    el.palette = ["#333333"]; // a slider moving: the first one is dropped
    await el.updateComplete;
    expect(recolour).not.toHaveBeenCalled();
    vi.advanceTimersByTime(RECOLOUR_DELAY_MS);
    expect(recolour).toHaveBeenCalledTimes(1);

    el.species = species();
    await el.updateComplete;
    expect(recolour).toHaveBeenCalledTimes(2);

    // removed with a recolouring pending: dropped
    el.palette = ["#444444"];
    await el.updateComplete;
    el.remove();
    vi.advanceTimersByTime(RECOLOUR_DELAY_MS);
    expect(recolour).toHaveBeenCalledTimes(2);
  });

  it("keeps only the last recolouring asked", async () => {
    const calls = fake_contexts();
    const el = await preview(species());
    calls.length = 0;
    await Promise.all([el.recolour(), el.recolour()]);
    expect(shown(calls, el).filter((c) => c.op === "fillRect").length).toBe(1);
  });

  it("draws nothing without a species, an atlas, a canvas or a context", async () => {
    const calls = fake_contexts(
      (c) => c.parentNode instanceof ShadowRoot && c.width === 1,
    );
    // no species
    const empty = await preview(null);
    await empty.recolour();
    expect(shown(calls, empty)).toEqual([]);

    // atlas not reachable
    const coral = species();
    coral.atlas.shade = "/bad/shade.webp";
    const broken = await preview(coral);
    expect(shown(calls, broken)).toEqual([]);

    // no context on the shown canvas (sized to the frame first)
    const blind = await preview(species());
    expect(shown(calls, blind)).toEqual([]);

    // no canvas
    blind.shadowRoot!.querySelector("canvas")!.remove();
    expect(() => blind.paint()).not.toThrow();
  });

  it("draws a coral without fluorescent colours, on a sized canvas", async () => {
    const calls = fake_contexts();
    const coral = species({ palette: [{ default: "#00ff00", fluo: false }] });
    const el = await preview(coral);
    el.paint(); // canvas already at the frame size
    expect(
      shown(calls, el).filter(
        (c) =>
          c.op === "drawImage" && c.state.globalCompositeOperation === "screen",
      ),
    ).toEqual([]);
  });
});
