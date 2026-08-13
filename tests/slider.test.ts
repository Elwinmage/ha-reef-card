/**
 * Tests for the common slider element:
 *   - bounds, step and unit come from the config, then from the entity
 *   - pointer drag updates the displayed value and snaps it to the step
 *   - the service call is debounced and only fires on release
 */

import { Slider } from "../src/base/slider";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

if (!customElements.get("cov-slider")) {
  customElements.define("cov-slider", class extends Slider {});
}

const TRACK_LEFT = 100;
const TRACK_WIDTH = 200;

/**
 * Build a slider bound to a number entity.
 * @param conf: element configuration from the mapping
 * @param attributes: entity attributes (min, max, step, unit)
 * @param state: current entity state
 */
function makeSlider(
  conf: any = { name: "speed" },
  attributes: any = {},
  state = "50",
): any {
  const slider: any = new (customElements.get("cov-slider") as any)();
  slider.conf = conf;
  slider.stateObj = { entity_id: "number.speed", state, attributes };
  slider._hass = { states: {}, callService: vi.fn(), entities: {} };
  const track = document.createElement("div");
  track.getBoundingClientRect = () =>
    ({ left: TRACK_LEFT, width: TRACK_WIDTH }) as DOMRect;
  vi.spyOn(slider, "shadowRoot", "get").mockReturnValue({
    querySelector: (sel: string) => (sel === ".track" ? track : null),
  } as any);
  vi.spyOn(slider, "requestUpdate").mockImplementation(() => {});
  return slider;
}

/** Serialized markup of a lit template */
function serialize(tpl: any): string {
  return tpl.strings.raw.join("\u0000") + "|" + JSON.stringify(tpl.values);
}

/**
 * Build a pointer event landing at a given ratio of the track.
 * @param ratio: position along the track, 0 is the left edge
 */
function pointerAt(ratio: number): any {
  return {
    clientX: TRACK_LEFT + ratio * TRACK_WIDTH,
    pointerId: 1,
    preventDefault: vi.fn(),
  };
}

/** Minimal container recording the listeners the slider attaches */
function makeContainer(): any {
  const listeners: Record<string, any> = {};
  return {
    listeners,
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
    addEventListener: (type: string, cb: any) => (listeners[type] = cb),
    removeEventListener: (type: string) => delete listeners[type],
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

//----------------------------------------------------------------------------//
//   Render
//----------------------------------------------------------------------------//

describe("Slider render", () => {
  it("renders nothing without a config or a state", () => {
    const slider = makeSlider();
    slider.conf = undefined;
    expect(serialize(slider._render())).not.toContain("slider-container");
    slider.conf = { name: "speed" };
    slider.stateObj = null;
    expect(serialize(slider._render())).not.toContain("slider-container");
  });

  it("places the thumb according to the value between min and max", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 200 }, {}, "50");
    expect(serialize(slider._render())).toContain("25");
  });

  it("falls back to the entity bounds when the mapping has none", () => {
    const slider = makeSlider({ name: "speed" }, { min: 40, max: 60 }, "50");
    // Halfway between 40 and 60
    expect(serialize(slider._render())).toContain("50");
  });

  it("shows the unit from the mapping, then from the entity", () => {
    expect(
      serialize(makeSlider({ name: "speed", unit: "%" }, {}, "50")._render()),
    ).toContain("%");
    expect(
      serialize(
        makeSlider(
          { name: "speed" },
          { unit_of_measurement: "L/h" },
          "50",
        )._render(),
      ),
    ).toContain("L/h");
  });

  it("treats a non numeric state as zero", () => {
    const slider = makeSlider({ name: "speed" }, {}, "unavailable");
    expect(() => slider._render()).not.toThrow();
  });

  it("exposes the configured colour as a CSS variable", () => {
    const slider = makeSlider({ name: "speed", slider_color: "255,0,0" });
    expect(serialize(slider._render())).toContain("--slider-color");
  });

  it("omits the colour variable when none is configured", () => {
    expect(serialize(makeSlider()._render())).not.toContain("--slider-color");
  });
});

//----------------------------------------------------------------------------//
//   Drag
//----------------------------------------------------------------------------//

describe("Slider drag", () => {
  it("updates the displayed value on press", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100 });
    const container = makeContainer();
    slider._onPointerDown({ ...pointerAt(0.25), currentTarget: container });
    expect(slider._displayValue).toBe(25);
    expect(container.setPointerCapture).toHaveBeenCalled();
  });

  it("snaps the value to the configured step", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100, step: 10 });
    slider._onPointerDown({
      ...pointerAt(0.24),
      currentTarget: makeContainer(),
    });
    expect(slider._displayValue).toBe(20);
  });

  it("clamps a pointer dragged outside the track", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100 });
    slider._onPointerDown({ ...pointerAt(-2), currentTarget: makeContainer() });
    expect(slider._displayValue).toBe(0);
    slider._onPointerDown({ ...pointerAt(3), currentTarget: makeContainer() });
    expect(slider._displayValue).toBe(100);
  });

  it("follows the pointer while dragging", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100 });
    const container = makeContainer();
    slider._onPointerDown({ ...pointerAt(0.1), currentTarget: container });
    container.listeners["pointermove"](pointerAt(0.8));
    expect(slider._displayValue).toBe(80);
  });

  it("ignores moves once the drag ended", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100 });
    const container = makeContainer();
    slider._onPointerDown({ ...pointerAt(0.1), currentTarget: container });
    const onMove = container.listeners["pointermove"];
    slider._dragging = false;
    onMove(pointerAt(0.8));
    expect(slider._displayValue).toBe(10);
  });

  it("does nothing when the track is not rendered yet", () => {
    const slider = makeSlider();
    vi.spyOn(slider, "shadowRoot", "get").mockReturnValue({
      querySelector: () => null,
    } as any);
    slider._onPointerDown({
      ...pointerAt(0.5),
      currentTarget: makeContainer(),
    });
    expect(slider._displayValue).toBeNull();
  });
});

//----------------------------------------------------------------------------//
//   Commit
//----------------------------------------------------------------------------//

describe("Slider commit", () => {
  /** Press then release the slider at a given ratio of the track */
  function drag(slider: any, ratio: number): any {
    const container = makeContainer();
    slider._onPointerDown({ ...pointerAt(ratio), currentTarget: container });
    container.listeners["pointerup"]();
    return container;
  }

  it("calls the number service after the debounce", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100 });
    drag(slider, 0.5);
    expect(slider._hass.callService).not.toHaveBeenCalled();
    vi.advanceTimersByTime(150);
    expect(slider._hass.callService).toHaveBeenCalledWith(
      "number",
      "set_value",
      { entity_id: "number.speed", value: 50 },
    );
  });

  it("only sends the last value of a burst", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100 });
    drag(slider, 0.2);
    drag(slider, 0.9);
    vi.advanceTimersByTime(150);
    expect(slider._hass.callService).toHaveBeenCalledTimes(1);
    expect(slider._hass.callService.mock.calls[0][2].value).toBe(90);
  });

  it("releases the pointer capture and drops its listeners", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100 });
    const container = drag(slider, 0.5);
    expect(container.releasePointerCapture).toHaveBeenCalled();
    expect(container.listeners["pointermove"]).toBeUndefined();
  });

  it("cleans up only once when release and cancel both fire", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100 });
    const container = makeContainer();
    slider._onPointerDown({ ...pointerAt(0.5), currentTarget: container });
    const onUp = container.listeners["pointerup"];
    onUp();
    onUp();
    vi.advanceTimersByTime(150);
    expect(slider._hass.callService).toHaveBeenCalledTimes(1);
  });

  it("survives a pointer capture already released", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100 });
    const container = makeContainer();
    container.releasePointerCapture = vi.fn(() => {
      throw new Error("not captured");
    });
    slider._onPointerDown({ ...pointerAt(0.5), currentTarget: container });
    expect(() => container.listeners["pointerup"]()).not.toThrow();
  });

  it("sends nothing when the value was never touched", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100 });
    slider._commitValue();
    vi.advanceTimersByTime(150);
    expect(slider._hass.callService).not.toHaveBeenCalled();
  });

  it("sends nothing without hass", () => {
    const slider = makeSlider({ name: "speed", min: 0, max: 100 });
    const callService = slider._hass.callService;
    slider._displayValue = 42;
    slider._hass = null;
    slider._commitValue();
    vi.advanceTimersByTime(150);
    expect(callService).not.toHaveBeenCalled();
  });
});
