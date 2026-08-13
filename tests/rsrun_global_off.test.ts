/**
 * Tests for the global on/off switch (device_state, held by the parent RSRun):
 *   - the skimmer falls back to its "off" body image, without water or foam
 *   - the return pump flow animation is paused
 * The greyscale filter already followed device_state; these check that the
 * images and animations agree with it.
 */

import { FlowImage } from "../src/base/flow_image";
import { RSSkimmer } from "../src/devices/redsea/rsrun/rsrun_pump_skimmer";
import { beforeEach, describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

if (!customElements.get("test-rsskimmer")) {
  customElements.define("test-rsskimmer", class extends RSSkimmer {});
}
if (!customElements.get("test-flowimage")) {
  customElements.define("test-flowimage", class extends FlowImage {});
}

const IMGS = { on: "on.png", off: "off.png", full: "full.png" };

function makeState(entity_id: string, state: string): any {
  return { entity_id, state, attributes: {} };
}

/**
 * Build a hass object for a pump.
 * @param master: state of the global on/off switch
 * @param schedule: state of the pump schedule
 * @param extra: additional states, keyed by entity_id
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

function makeSkimmer(master: string, schedule: string, state: string): any {
  const skimmer: any = new (customElements.get("test-rsskimmer") as any)();
  skimmer.id = 2;
  skimmer.entities = {
    schedule_enabled: { entity_id: "switch.schedule" },
    state: { entity_id: "sensor.state" },
    speed: { entity_id: "sensor.speed" },
  };
  skimmer.parent_entities = {
    device_state: { entity_id: "switch.device_state" },
  };
  skimmer._hass = makeHass(master, schedule, {
    "sensor.state": makeState("sensor.state", state),
    "sensor.speed": makeState("sensor.speed", "70"),
  });
  skimmer.config = { state_background_imgs: IMGS };
  // The elements are not under test here
  skimmer._render_elements = () => "";
  return skimmer;
}

/** Serialized markup of the skimmer body */
function renderSkimmer(skimmer: any): string {
  const tpl = skimmer._render();
  return tpl.strings.raw.join("\u0000") + "|" + JSON.stringify(tpl.values);
}

function makeFlow(master: string, schedule: string, speed: string): any {
  const flow: any = new (customElements.get("test-flowimage") as any)();
  flow.device = {
    entities: { schedule_enabled: { entity_id: "switch.schedule" } },
    parent_entities: { device_state: { entity_id: "switch.device_state" } },
  };
  flow.stateObj = makeState("sensor.speed", speed);
  flow._hass = makeHass(master, schedule, {
    "sensor.speed": makeState("sensor.speed", speed),
  });
  return flow;
}

/** Stub the flow div so _syncAnimation has something to write to */
function attachDiv(flow: any): any {
  const div = document.createElement("div");
  vi.spyOn(flow, "shadowRoot", "get").mockReturnValue({
    querySelector: () => div,
  } as any);
  return div;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

//----------------------------------------------------------------------------//
//   Skimmer
//----------------------------------------------------------------------------//

describe("RSSkimmer body image", () => {
  it("uses the on image while everything is running", () => {
    const out = renderSkimmer(makeSkimmer("on", "on", "on"));
    expect(out).toContain(IMGS.on);
    expect(out).not.toContain(IMGS.off);
  });

  it("uses the full image when the cup is full", () => {
    const out = renderSkimmer(makeSkimmer("on", "on", "full-cup"));
    expect(out).toContain(IMGS.full);
  });

  it("falls back to the off image when the global switch is off", () => {
    const out = renderSkimmer(makeSkimmer("off", "on", "on"));
    expect(out).toContain(IMGS.off);
    expect(out).not.toContain(IMGS.on);
  });

  it("keeps the off image when the global switch is off and the cup is full", () => {
    const out = renderSkimmer(makeSkimmer("off", "on", "full-cup"));
    expect(out).toContain(IMGS.off);
    expect(out).not.toContain(IMGS.full);
  });

  it("stops water and foam when the global switch is off", () => {
    const out = renderSkimmer(makeSkimmer("off", "on", "on"));
    expect(out).toContain("paused");
    expect(out).not.toContain("foam-overlay");
    expect(out).not.toContain("skimmerWater");
  });

  it("still greys the body out when the global switch is off", () => {
    const skimmer = makeSkimmer("off", "on", "on");
    expect(skimmer.is_pump_on()).toBe(false);
    expect(renderSkimmer(skimmer)).toContain("grayscale");
  });
});

//----------------------------------------------------------------------------//
//   Return pump flow
//----------------------------------------------------------------------------//

describe("FlowImage animation", () => {
  it("runs while the pump is running", () => {
    const flow = makeFlow("on", "on", "70");
    const div = attachDiv(flow);
    flow._syncAnimation();
    expect(div.style.animationPlayState).toBe("running");
  });

  it("pauses when the global switch is off", () => {
    const flow = makeFlow("off", "on", "70");
    const div = attachDiv(flow);
    flow._syncAnimation();
    expect(div.style.animationPlayState).toBe("paused");
  });

  it("pauses when the pump schedule is off", () => {
    const flow = makeFlow("on", "off", "70");
    const div = attachDiv(flow);
    flow._syncAnimation();
    expect(div.style.animationPlayState).toBe("paused");
  });

  it("does not fall back to the minimum speed while stopped", () => {
    const flow = makeFlow("off", "on", "0");
    const div = attachDiv(flow);
    flow._syncAnimation();
    expect(div.style.animationPlayState).toBe("paused");
  });

  it("syncs the animation when only the global switch changed", () => {
    const flow = makeFlow("on", "on", "70");
    const div = attachDiv(flow);
    flow._syncAnimation();
    flow.hass = makeHass("off", "on", {
      "sensor.speed": makeState("sensor.speed", "70"),
    });
    expect(div.style.animationPlayState).toBe("paused");
  });

  it("survives a device without a schedule entity", () => {
    const flow = makeFlow("on", "on", "70");
    delete flow.device.entities.schedule_enabled;
    const div = attachDiv(flow);
    expect(() => flow._syncAnimation()).not.toThrow();
    expect(div.style.animationPlayState).toBe("running");
  });
});
