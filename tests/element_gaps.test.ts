/**
 * Remaining coverage gaps in base/element.ts:
 *   - the parent_entities fallback of the evaluation context
 *   - the disabled_if re-render path of the hass setter
 *   - get_class() when the expression cannot be evaluated
 *   - render() with no_br_if_disabled
 *   - run_actions() sequential mode (a redsea_ui "wait" action is present)
 *   - _execute_ui_action() more-info and its guard rails
 */

import { MyElement } from "../src/base/element";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

class GapElement extends MyElement {
  protected override _render(): any {
    return null;
  }
}
if (!customElements.get("gap-element")) {
  customElements.define("gap-element", GapElement);
}

function makeState(entity_id: string, state = "on"): any {
  return { entity_id, state, attributes: {} };
}

function makeHass(extra: Record<string, any> = {}): any {
  return {
    states: {
      "sensor.own": makeState("sensor.own", "42"),
      "switch.parent": makeState("switch.parent", "on"),
      ...extra,
    },
    entities: {},
    devices: {},
    callService: vi.fn(),
  };
}

/**
 * Build a bare element bound to a device exposing both its own entities and
 * the parent's.
 * @param conf: element configuration
 */
function makeElement(conf: any = { name: "own" }): any {
  const el: any = new (customElements.get("gap-element") as any)();
  el.device = {
    entities: { own: { entity_id: "sensor.own" } },
    parent_entities: {
      parent: { entity_id: "switch.parent" },
      // Shadowed by the device's own entity of the same name
      own: { entity_id: "sensor.shadowed" },
    },
    config: { color: "1,2,3", alpha: 0.5, elements: {} },
    is_on: () => true,
    masterOn: true,
  };
  el.conf = conf;
  el._hass = makeHass();
  el.stateObj = makeState("sensor.own", "42");
  vi.spyOn(el, "requestUpdate").mockImplementation(() => {});
  return el;
}

afterEach(() => {
  vi.restoreAllMocks();
});

//----------------------------------------------------------------------------//
//   Evaluation context
//----------------------------------------------------------------------------//

describe("MyElement evaluation context", () => {
  it("exposes the parent entities alongside the device's own", () => {
    const el = makeElement({
      name: "own",
      class: "${entity.parent.state === 'on' ? 'blink' : ''}",
    });
    el.setConfig(el.conf);
    el.hass = el._hass;
    expect(el.get_class()).toBe("blink");
  });

  it("lets a local entity win over the parent's", () => {
    const el = makeElement({
      name: "own",
      class: "${entity.own.entity_id}",
    });
    expect(el.get_class()).toBe("sensor.own");
  });

  it("skips a parent entity with no state", () => {
    const el = makeElement({
      name: "own",
      class: "${entity.ghost === undefined ? 'none' : 'some'}",
    });
    el.device.parent_entities.ghost = { entity_id: "sensor.ghost" };
    expect(el.get_class()).toBe("none");
  });
});

//----------------------------------------------------------------------------//
//   get_class
//----------------------------------------------------------------------------//

describe("MyElement.get_class", () => {
  it("returns an empty class when the expression fails", () => {
    const el = makeElement({ name: "own", class: "${entity.own.state}" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    // evaluate() returns undefined on failure; "undefined" must not reach the DOM
    vi.spyOn(el, "evaluate").mockReturnValue(undefined as any);
    expect(el.get_class()).toBe("");
  });

  it("returns a static class untouched", () => {
    expect(makeElement({ name: "own", class: "cables" }).get_class()).toBe(
      "cables",
    );
  });

  it("returns nothing without a class", () => {
    expect(makeElement().get_class()).toBe("");
    expect(makeElement({ name: "own", class: "" }).get_class()).toBe("");
  });
});

//----------------------------------------------------------------------------//
//   hass setter
//----------------------------------------------------------------------------//

describe("MyElement hass setter", () => {
  it("re-renders on a state change of its own entity", () => {
    const el = makeElement();
    el.hass = makeHass({ "sensor.own": makeState("sensor.own", "50") });
    expect(el.requestUpdate).toHaveBeenCalled();
  });

  it("re-renders when a disabled_if condition may have changed", () => {
    const el = makeElement({ name: "own", disabled_if: "${false}" });
    el.hass = makeHass();
    expect(el.requestUpdate).toHaveBeenCalled();
  });

  it("stays quiet when nothing relevant changed", () => {
    const el = makeElement();
    el.hass = makeHass();
    expect(el.requestUpdate).not.toHaveBeenCalled();
  });
});

//----------------------------------------------------------------------------//
//   render, disabled
//----------------------------------------------------------------------------//

describe("MyElement.render when disabled", () => {
  it("renders a line break by default", () => {
    const el = makeElement({ name: "own", disabled_if: "${true}" });
    expect(JSON.stringify(el.render().strings.raw)).toContain("br");
  });

  it("renders nothing with no_br_if_disabled", () => {
    const el = makeElement({
      name: "own",
      disabled_if: "${true}",
      no_br_if_disabled: true,
    });
    expect(JSON.stringify(el.render().strings.raw)).not.toContain("br");
  });
});

//----------------------------------------------------------------------------//
//   run_actions, sequential mode
//----------------------------------------------------------------------------//

describe("MyElement.run_actions with a wait action", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Run the actions, letting every pending timer fire */
  async function run(el: any, actions: any[]): Promise<void> {
    const done = el.run_actions(actions);
    await vi.runAllTimersAsync();
    await done;
  }

  it("waits between two service calls", async () => {
    const el = makeElement();
    vi.spyOn(el, "_wait_timer").mockResolvedValue(undefined as any);
    await run(el, [
      { domain: "switch", action: "turn_on", data: "default" },
      { domain: "redsea_ui", action: "wait", data: 3 },
      { domain: "switch", action: "turn_off", data: "default" },
    ]);
    expect(el._wait_timer).toHaveBeenCalledWith(3);
    expect(el._hass.callService).toHaveBeenCalledTimes(2);
    expect(el._hass.callService.mock.calls[0][2]).toEqual({
      entity_id: "sensor.own",
    });
  });

  it("defaults the wait to one second", async () => {
    const el = makeElement();
    vi.spyOn(el, "_wait_timer").mockResolvedValue(undefined as any);
    await run(el, [{ domain: "redsea_ui", action: "wait", data: "soon" }]);
    expect(el._wait_timer).toHaveBeenCalledWith(1);
  });

  it("resolves an entity_id given by translation key", async () => {
    const el = makeElement();
    vi.spyOn(el, "_wait_timer").mockResolvedValue(undefined as any);
    await run(el, [
      { domain: "redsea_ui", action: "wait", data: 1 },
      { domain: "switch", action: "toggle", data: { entity_id: "parent" } },
    ]);
    expect(el._hass.callService).toHaveBeenCalledWith("switch", "toggle", {
      entity_id: "switch.parent",
    });
  });

  it("still runs the UI actions of the sequence", async () => {
    const el = makeElement();
    vi.spyOn(el, "_wait_timer").mockResolvedValue(undefined as any);
    const listener = vi.fn();
    el.addEventListener("quit-dialog", listener);
    await run(el, [
      { domain: "redsea_ui", action: "wait", data: 1 },
      { domain: "redsea_ui", action: "exit-dialog" },
    ]);
    expect(listener).toHaveBeenCalled();
  });

  it("skips actions explicitly disabled", async () => {
    const el = makeElement();
    vi.spyOn(el, "_wait_timer").mockResolvedValue(undefined as any);
    await run(el, [
      { domain: "redsea_ui", action: "wait", data: 1 },
      {
        domain: "switch",
        action: "turn_on",
        data: "default",
        enabled: false,
      },
    ]);
    expect(el._hass.callService).not.toHaveBeenCalled();
  });
});

//----------------------------------------------------------------------------//
//   more-info
//----------------------------------------------------------------------------//

describe("MyElement more-info action", () => {
  /** Capture the hass-more-info event fired by the element */
  function listen(el: any): any {
    const listener = vi.fn();
    el.addEventListener("hass-more-info", listener);
    return listener;
  }

  it("opens the dialog for an entity given as a plain key", async () => {
    const el = makeElement();
    const listener = listen(el);
    await el._execute_ui_action({
      domain: "redsea_ui",
      action: "more-info",
      data: "own",
    });
    expect(listener.mock.calls[0][0].detail).toEqual({
      entityId: "sensor.own",
    });
  });

  it("accepts the key inside an object", async () => {
    const el = makeElement();
    const listener = listen(el);
    await el._execute_ui_action({
      domain: "redsea_ui",
      action: "more-info",
      data: { entity_id: "own" },
    });
    expect(listener).toHaveBeenCalled();
  });

  it("falls back to the parent entities", async () => {
    const el = makeElement();
    const listener = listen(el);
    await el._execute_ui_action({
      domain: "redsea_ui",
      action: "more-info",
      data: "parent",
    });
    expect(listener.mock.calls[0][0].detail).toEqual({
      entityId: "switch.parent",
    });
  });

  it("stays silent for an unknown entity", async () => {
    const el = makeElement();
    const listener = listen(el);
    await el._execute_ui_action({
      domain: "redsea_ui",
      action: "more-info",
      data: "ghost",
    });
    expect(listener).not.toHaveBeenCalled();
  });

  it("stays silent without any data", async () => {
    const el = makeElement();
    const listener = listen(el);
    await el._execute_ui_action({
      domain: "redsea_ui",
      action: "more-info",
      data: undefined,
    });
    expect(listener).not.toHaveBeenCalled();
  });
});
