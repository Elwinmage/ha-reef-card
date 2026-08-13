/**
 * Coverage tests for the parts of the RSRun pumps that no test exercised:
 *   - RSReturn._render() (whole file was at 0%)
 *   - RSSkimmer foam bubble lifecycle and water background
 *   - FlowImage first render, tile measurement and teardown
 *
 * The rendering helpers are stubbed: what matters here is the branching, not
 * the markup produced by the shared element machinery.
 */

import { FlowImage } from "../src/base/flow_image";
import { RSReturn } from "../src/devices/redsea/rsrun/rsrun_pump_return";
import { RSSkimmer } from "../src/devices/redsea/rsrun/rsrun_pump_skimmer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

if (!customElements.get("cov-rsreturn")) {
  customElements.define("cov-rsreturn", class extends RSReturn {});
}
if (!customElements.get("cov-rsskimmer")) {
  customElements.define("cov-rsskimmer", class extends RSSkimmer {});
}
if (!customElements.get("cov-flowimage")) {
  customElements.define("cov-flowimage", class extends FlowImage {});
}

function makeState(entity_id: string, state: string): any {
  return { entity_id, state, attributes: {} };
}

/**
 * Build a hass object for a pump.
 * @param master: state of the global on/off switch
 * @param schedule: state of the pump schedule
 * @param extra: extra states keyed by entity_id
 */
function makeHass(master: string, schedule: string, extra: any = {}): any {
  return {
    states: {
      "switch.device_state": makeState("switch.device_state", master),
      "switch.schedule": makeState("switch.schedule", schedule),
      ...extra,
    },
    entities: {},
    callService: vi.fn(),
  };
}

/** Wire the entities every pump subclass reads */
function wire(pump: any, master: string, schedule: string, state: string): any {
  pump.id = 1;
  pump.entities = {
    schedule_enabled: { entity_id: "switch.schedule" },
    state: { entity_id: "sensor.state" },
    speed: { entity_id: "sensor.speed" },
  };
  pump.parent_entities = {
    device_state: { entity_id: "switch.device_state" },
  };
  pump._hass = makeHass(master, schedule, {
    "sensor.state": makeState("sensor.state", state),
    "sensor.speed": makeState("sensor.speed", "70"),
  });
  pump._render_elements = vi.fn(() => "");
  // config is normally built from the mapping on connect
  pump.config = {
    background_img: "return.png",
    state_background_imgs: { on: "on.png", off: "off.png", full: "full.png" },
  };
  return pump;
}

/** Serialized markup of a lit template */
function serialize(tpl: any): string {
  return tpl.strings.raw.join("\u0000") + "|" + JSON.stringify(tpl.values);
}

/** Replace the shadow root by a stub exposing a single overlay element */
function stubOverlay(element: any): HTMLElement {
  const overlay = document.createElement("div");
  vi.spyOn(element, "shadowRoot", "get").mockReturnValue({
    querySelector: (sel: string) =>
      sel.includes("foam-overlay") || sel.includes("flow-div") ? overlay : null,
    adoptedStyleSheets: [],
  } as any);
  return overlay;
}

beforeEach(() => {
  // jsdom has no ResizeObserver; record the callback so tests can fire it
  (globalThis as any).ResizeObserver = class {
    static last: any = null;
    observe = vi.fn();
    disconnect = vi.fn();
    constructor(public cb: any) {
      (globalThis as any).ResizeObserver.last = this;
    }
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

//----------------------------------------------------------------------------//
//   RSReturn
//----------------------------------------------------------------------------//

describe("RSReturn._render", () => {
  it("draws the body image and the cables of its own slot", () => {
    const pump: any = wire(
      new (customElements.get("cov-rsreturn") as any)(),
      "on",
      "on",
      "on",
    );
    const out = serialize(pump._render());
    expect(out).toContain("device_img");
    expect(pump._render_elements).toHaveBeenCalledWith(true, "cables_1");
    expect(pump._render_elements).toHaveBeenCalledWith(true, "ctrl_1");
    expect(out).not.toContain("grayscale");
  });

  it("greys the body out when the global switch is off", () => {
    const pump: any = wire(
      new (customElements.get("cov-rsreturn") as any)(),
      "off",
      "on",
      "on",
    );
    expect(serialize(pump._render())).toContain("grayscale");
    expect(pump._render_elements).toHaveBeenCalledWith(false, "cables_1");
  });

  it("greys the body out when the pump is disconnected", () => {
    const pump: any = wire(
      new (customElements.get("cov-rsreturn") as any)(),
      "on",
      "on",
      "on",
    );
    pump.entities["missing_pump"] = { entity_id: "sensor.missing" };
    pump._hass.states["sensor.missing"] = makeState("sensor.missing", "on");
    expect(serialize(pump._render())).toContain("grayscale");
  });

  it("falls back to an empty image when the mapping has none", () => {
    const pump: any = wire(
      new (customElements.get("cov-rsreturn") as any)(),
      "on",
      "on",
      "on",
    );
    pump.config = { ...pump.config, background_img: undefined };
    expect(() => pump._render()).not.toThrow();
  });
});

//----------------------------------------------------------------------------//
//   RSSkimmer foam
//----------------------------------------------------------------------------//

describe("RSSkimmer foam bubbles", () => {
  it("spawns the configured number of bubbles inside the overlay", () => {
    const skimmer: any = wire(
      new (customElements.get("cov-rsskimmer") as any)(),
      "on",
      "on",
      "on",
    );
    const overlay = stubOverlay(skimmer);
    skimmer.firstUpdated();
    expect(overlay.querySelectorAll(".foam-bubble")).toHaveLength(5);
  });

  it("replaces the previous bubbles on every re-render", () => {
    const skimmer: any = wire(
      new (customElements.get("cov-rsskimmer") as any)(),
      "on",
      "on",
      "on",
    );
    const overlay = stubOverlay(skimmer);
    skimmer.firstUpdated();
    const first = overlay.firstChild;
    skimmer.updated();
    expect(overlay.querySelectorAll(".foam-bubble")).toHaveLength(5);
    expect(overlay.firstChild).not.toBe(first);
  });

  it("does nothing when the overlay is absent (pump stopped)", () => {
    const skimmer: any = wire(
      new (customElements.get("cov-rsskimmer") as any)(),
      "on",
      "on",
      "on",
    );
    vi.spyOn(skimmer, "shadowRoot", "get").mockReturnValue({
      querySelector: () => null,
    } as any);
    expect(() => skimmer.firstUpdated()).not.toThrow();
  });

  it("respawns bubbles periodically while connected", () => {
    vi.useFakeTimers();
    // Only the RSSkimmer half of the lifecycle is under test. Letting the
    // Lit half run would call attachShadow/adoptStyles on the stubbed shadow
    // root and reject asynchronously.
    const parent = Object.getPrototypeOf(RSSkimmer.prototype);
    vi.spyOn(parent, "connectedCallback").mockImplementation(() => {});
    vi.spyOn(parent, "disconnectedCallback").mockImplementation(() => {});

    const skimmer: any = wire(
      new (customElements.get("cov-rsskimmer") as any)(),
      "on",
      "on",
      "on",
    );
    const overlay = stubOverlay(skimmer);
    skimmer.connectedCallback();
    vi.advanceTimersByTime(5000);
    expect(overlay.querySelectorAll(".foam-bubble")).toHaveLength(5);
    skimmer.disconnectedCallback();
    overlay.innerHTML = "";
    vi.advanceTimersByTime(15000);
    expect(overlay.querySelectorAll(".foam-bubble")).toHaveLength(0);
    vi.useRealTimers();
  });

  it("tolerates being detached twice", () => {
    const parent = Object.getPrototypeOf(RSSkimmer.prototype);
    vi.spyOn(parent, "disconnectedCallback").mockImplementation(() => {});
    const skimmer: any = wire(
      new (customElements.get("cov-rsskimmer") as any)(),
      "on",
      "on",
      "on",
    );
    skimmer.disconnectedCallback();
    expect(() => skimmer.disconnectedCallback()).not.toThrow();
  });
});

//----------------------------------------------------------------------------//
//   RSSkimmer water background
//----------------------------------------------------------------------------//

describe("RSSkimmer water background", () => {
  /**
   * Extract the animation duration the skimmer computes for a given speed.
   * @param speed: reported pump speed
   * @return the duration in seconds
   */
  function duration(speed: string): number {
    const skimmer: any = wire(
      new (customElements.get("cov-rsskimmer") as any)(),
      "on",
      "on",
      "on",
    );
    skimmer._hass.states["sensor.speed"] = makeState("sensor.speed", speed);
    const css = skimmer._waterBackground(false);
    return parseFloat(/skimmerWater ([\d.]+)s/.exec(css)?.[1] ?? "0");
  }

  it("returns no background while stopped", () => {
    const skimmer: any = wire(
      new (customElements.get("cov-rsskimmer") as any)(),
      "on",
      "on",
      "on",
    );
    expect(skimmer._waterBackground(true)).toBe("none");
  });

  it("scrolls faster as the speed increases", () => {
    expect(duration("100")).toBeLessThan(duration("40"));
  });

  it("clamps a speed below the minimum", () => {
    expect(duration("0")).toBeCloseTo(duration("40"), 5);
  });

  it("treats a non numeric speed as zero rather than clamping it", () => {
    // Documents the current behaviour: an "unavailable" speed scrolls slower
    // than the 40% minimum instead of being clamped to it
    expect(duration("unavailable")).toBeGreaterThan(duration("40"));
  });
});

//----------------------------------------------------------------------------//
//   FlowImage
//----------------------------------------------------------------------------//

describe("FlowImage rendering", () => {
  /** Build a FlowImage bound to a running pump */
  function makeFlow(image?: string): any {
    const flow: any = new (customElements.get("cov-flowimage") as any)();
    flow.device = {
      entities: { schedule_enabled: { entity_id: "switch.schedule" } },
      parent_entities: { device_state: { entity_id: "switch.device_state" } },
    };
    flow.conf = image ? { image } : {};
    flow.stateObj = makeState("sensor.speed", "70");
    flow._hass = makeHass("on", "on", {
      "sensor.speed": makeState("sensor.speed", "70"),
    });
    return flow;
  }

  it("renders a repeating background bound to the flow keyframes", () => {
    const out = serialize(makeFlow("water.png")._render());
    expect(out).toContain("flow-div");
    expect(out).toContain("water.png");
    expect(out).toContain("flowUp");
    // duration and play state are owned by _syncAnimation
    expect(out).not.toContain("animation-duration");
  });

  it("renders without an image configured", () => {
    expect(() => makeFlow()._render()).not.toThrow();
  });

  it("measures the tile height once and stops observing", () => {
    const flow = makeFlow("water.png");
    stubOverlay(flow);
    flow.firstUpdated();
    const observer = (globalThis as any).ResizeObserver.last;
    observer.cb([{ contentRect: { width: 113 } }]);
    expect(flow._tileHeightPx).toBe(192);
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it("ignores a zero width measurement", () => {
    const flow = makeFlow("water.png");
    stubOverlay(flow);
    flow.firstUpdated();
    (globalThis as any).ResizeObserver.last.cb([{ contentRect: { width: 0 } }]);
    expect(flow._tileHeightPx).toBe(0);
  });

  it("drops the observer when detached", () => {
    const flow = makeFlow("water.png");
    stubOverlay(flow);
    flow.firstUpdated();
    const observer = (globalThis as any).ResizeObserver.last;
    flow.disconnectedCallback();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(flow._resizeObserver).toBeNull();
  });

  it("does nothing when there is no flow div to animate", () => {
    const flow = makeFlow("water.png");
    vi.spyOn(flow, "shadowRoot", "get").mockReturnValue({
      querySelector: () => null,
    } as any);
    expect(() => flow._syncAnimation()).not.toThrow();
  });

  it("falls back to the parent setter without a state object", () => {
    const flow = makeFlow("water.png");
    flow.stateObj = null;
    const next = makeHass("on", "on");
    flow.hass = next;
    expect(flow._hass).toBe(next);
  });

  it("speeds the scroll up as the pump speed increases", () => {
    const fast = makeFlow("water.png");
    const div_fast = stubOverlay(fast);
    fast.stateObj = makeState("sensor.speed", "100");
    fast._syncAnimation();

    const slow = makeFlow("water.png");
    const div_slow = stubOverlay(slow);
    slow.stateObj = makeState("sensor.speed", "40");
    slow._syncAnimation();

    expect(parseFloat(div_fast.style.animationDuration)).toBeLessThan(
      parseFloat(div_slow.style.animationDuration),
    );
  });
});
