/**
 * Last coverage gaps, spread across small defensive branches:
 *   base/dialog.ts, base/flow_image.ts, base/slider.ts,
 *   devices/device.ts, devices/redsea/rsrun/*, src/card.ts, src/editor.ts
 *
 * Most of these are "the entity is not there" or "the config flag is unset"
 * paths that never fire in the happy-path tests.
 */

import { Dialog } from "../src/base/dialog";
import { FlowImage } from "../src/base/flow_image";
import { Slider } from "../src/base/slider";
import { RSDevice } from "../src/devices/device";
import { RSPump } from "../src/devices/redsea/rsrun/rsrun_pump";
import { RSRun } from "../src/devices/redsea/rsrun/rsrun";
import { RSSkimmer } from "../src/devices/redsea/rsrun/rsrun_pump_skimmer";
import { add_pump } from "../src/devices/redsea/rsrun/rsrun_pump.dialog_func_ext";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

for (const [tag, cls] of [
  ["gap-dialog", Dialog],
  ["gap-flowimage", FlowImage],
  ["gap-slider", Slider],
  ["gap-rsdevice", RSDevice],
  ["gap-rspump", RSPump],
  ["gap-rsrun", RSRun],
  ["gap-rsskimmer", RSSkimmer],
] as [string, any][]) {
  if (!customElements.get(tag)) {
    customElements.define(tag, class extends cls {});
  }
}

/** Instantiate one of the elements registered above */
function make(tag: string): any {
  return new (customElements.get(tag) as any)();
}

function makeState(entity_id: string, state: string): any {
  return { entity_id, state, attributes: {} };
}

beforeEach(() => {
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
//   dialog.ts
//----------------------------------------------------------------------------//

describe("Dialog config merging", () => {
  it("adds sub-device dialogs without dropping the parent's", () => {
    const dlg = make("gap-dialog");
    dlg.set_conf({ a: { name: "a" } });
    dlg.merge_conf({ b: { name: "b" } });
    expect(Object.keys(dlg.config)).toEqual(["a", "b"]);
  });
});

describe("Dialog entity rows", () => {
  /** Dialog wired to a shadow root exposing #dialog-content */
  function makeDialog(entities: Record<string, any>): any {
    const dlg = make("gap-dialog");
    const content = document.createElement("div");
    content.id = "dialog-content";
    const root = document.createElement("div");
    root.appendChild(content);
    dlg._shadowRoot = root;
    dlg._hass = { states: {}, entities: {} };
    dlg.elts = [];
    dlg.to_render = { name: "test" };
    dlg.elt = {
      device: {},
      get_entity: (name: string) => {
        const found = entities[name];
        if (!found) throw new Error(`Entity ${name} not found`);
        return found;
      },
    };
    return dlg;
  }

  /** A card element standing in for hui-entities-card */
  function stubCard(): any {
    const CardClass = class extends HTMLElement {
      config: any;
      setConfig(conf: any) {
        this.config = conf;
      }
    };
    if (!customElements.get("gap-entities-card")) {
      customElements.define("gap-entities-card", CardClass);
    }
    return CardClass;
  }

  it("keeps dividers untouched", () => {
    stubCard();
    const dlg = makeDialog({ speed: { entity_id: "number.speed" } });
    dlg._render_content({
      view: "gap-entities-card",
      conf: {
        entities: [{ type: "divider" }, { entity: "speed" }],
      },
    });
    const card = dlg.elts[0];
    expect(card.config.entities[0]).toEqual({ type: "divider" });
    expect(card.config.entities[1].entity).toBe("number.speed");
  });

  it("resolves an entity given as a bare string", () => {
    stubCard();
    const dlg = makeDialog({ speed: { entity_id: "number.speed" } });
    dlg._render_content({
      view: "gap-entities-card",
      conf: { entities: ["speed"] },
    });
    expect(dlg.elts[0].config.entities[0]).toBe("number.speed");
  });

  it("gives up on a single-entity card it cannot resolve", () => {
    stubCard();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const dlg = makeDialog({});
    dlg._render_content({
      view: "gap-entities-card",
      conf: { entity: "ghost" },
    });
    expect(warn).toHaveBeenCalled();
    expect(dlg.elts).toHaveLength(0);
  });

  it("resolves a single-entity card", () => {
    stubCard();
    const dlg = makeDialog({ speed: { entity_id: "number.speed" } });
    dlg._render_content({
      view: "gap-entities-card",
      conf: { entity: "speed" },
    });
    expect(dlg.elts[0].config.entity).toBe("number.speed");
  });
});

//----------------------------------------------------------------------------//
//   device.ts, device-level config flags
//----------------------------------------------------------------------------//

describe("RSDevice config flags", () => {
  /** Device with a user config shaped like the card's YAML */
  function makeDeviceWithConfig(stored?: boolean): any {
    const dev = make("gap-rsdevice");
    dev.config = {
      model: "RSRUN",
      ...(stored === undefined ? {} : { hide: stored }),
    };
    dev.device = { name: "ReefRun" };
    dev.user_config = { conf: { RSRUN: { devices: { ReefRun: {} } } } };
    return dev;
  }

  it("returns undefined for a flag never set", () => {
    expect(makeDeviceWithConfig().get_config_flag("hide")).toBeUndefined();
  });

  it("returns the stored value", () => {
    expect(makeDeviceWithConfig(true).get_config_flag("hide")).toBe(true);
  });

  it("renders a switch reflecting the flag", () => {
    const out = JSON.stringify(
      makeDeviceWithConfig(true).is_config_checked("hide").values,
    );
    expect(out).toContain("hide");
  });

  it("persists a toggle into an existing config branch", () => {
    const dev = makeDeviceWithConfig(false);
    const listener = vi.fn();
    dev.addEventListener("config-changed", listener);
    dev.handleChangedConfigFlagEvent({
      currentTarget: { checked: true },
      target: { id: "hide" },
    });
    expect(
      listener.mock.calls[0][0].detail.config.conf.RSRUN.devices.ReefRun.hide,
    ).toBe(true);
  });

  it("creates the config branch when it does not exist yet", () => {
    const dev = makeDeviceWithConfig(false);
    dev.user_config = {};
    const listener = vi.fn();
    dev.addEventListener("config-changed", listener);
    dev.handleChangedConfigFlagEvent({
      currentTarget: { checked: true },
      target: { id: "hide" },
    });
    expect(
      listener.mock.calls[0][0].detail.config.conf.RSRUN.devices.ReefRun.hide,
    ).toBe(true);
  });
});

//----------------------------------------------------------------------------//
//   rsrun.ts
//----------------------------------------------------------------------------//

describe("RSRun editor", () => {
  /** RSRun with just enough wiring to render its editor form */
  function makeRun(): any {
    const run = make("gap-rsrun");
    run.entities = {};
    run._pumps = [];
    run.device = { model: "RSRUN", name: "ReefRun", elements: [], id: "dev0" };
    run.config = { model: "RSRUN", background_img: "run.png" };
    run.update_config = vi.fn();
    run._editor_common = vi.fn(() => "");
    run._hass = { entities: {}, states: {} };
    return run;
  }

  it("renders the hide-add-pump switch", () => {
    const run = makeRun();
    run.is_disabled = () => false;
    expect(JSON.stringify(run.renderEditor().values)).toContain(
      "hide_add_pump",
    );
  });

  it("renders nothing for a disabled device", () => {
    const run = makeRun();
    run.is_disabled = () => true;
    expect(run.renderEditor().values).toEqual([]);
  });

  it("skips a device element without an identifier match", () => {
    const run = makeRun();
    run.device.elements = [
      { id: "dev0", identifiers: [["reefbeat", "RSRUN"]] },
    ];
    run._hass = {
      entities: {
        "sensor.x": {
          device_id: "other",
          translation_key: "x",
          entity_id: "sensor.x",
        },
      },
      states: {},
    };
    run._populate_entities();
    expect(run.entities).toEqual({});
  });

  it("renders the body image", () => {
    const run = makeRun();
    run._render_elements = vi.fn(() => "");
    run._render_pumps = vi.fn(() => "");
    expect(JSON.stringify(run._render().values)).toContain("run.png");
  });

  it("falls back to an empty body image", () => {
    const run = makeRun();
    run.config = { model: "RSRUN" };
    run._render_elements = vi.fn(() => "");
    run._render_pumps = vi.fn(() => "");
    expect(() => run._render()).not.toThrow();
  });
});

//----------------------------------------------------------------------------//
//   rsrun_pump.ts
//----------------------------------------------------------------------------//

describe("RSPump helpers", () => {
  /** Pump wired to the entities its hass setter watches */
  function makePump(states: Record<string, string> = {}): any {
    const pump = make("gap-rspump");
    pump.id = 1;
    pump.entities = {
      schedule_enabled: { entity_id: "switch.schedule" },
      speed: { entity_id: "sensor.speed" },
      missing_pump: { entity_id: "binary_sensor.missing" },
      type: { entity_id: "sensor.type" },
      temperature: { entity_id: "sensor.temperature" },
    };
    pump.parent_entities = { device_state: { entity_id: "switch.master" } };
    pump._elements = {};
    pump._hass = {
      states: Object.fromEntries(
        Object.entries({
          "switch.schedule": "on",
          "sensor.speed": "70",
          "binary_sensor.missing": "off",
          "sensor.type": "return",
          "sensor.temperature": "41",
          "switch.master": "on",
          ...states,
        }).map(([k, v]) => [k, makeState(k, v as string)]),
      ),
      entities: {},
    };
    return pump;
  }

  it("recognises every affirmative form", () => {
    const is_true = (RSPump as any)._is_true;
    for (const value of [true, 1, "on", "TRUE", " 1 ", "yes"]) {
      expect(is_true(value)).toBe(true);
    }
    for (const value of [false, 0, 2, "off", "no", null, undefined, {}]) {
      expect(is_true(value)).toBe(false);
    }
  });

  it("looks entities up on the parent when the pump has none", () => {
    const pump = makePump();
    expect(pump.get_entity("device_state").state).toBe("on");
  });

  it("returns null for an entity nobody has", () => {
    const pump = makePump();
    expect(pump.get_entity("ghost")).toBeNull();
  });

  it("returns null without hass or parent entities", () => {
    const pump = makePump();
    pump.parent_entities = null;
    expect(pump.get_entity("device_state")).toBeNull();
    const other = makePump();
    other._hass = null;
    expect(other.get_entity("device_state")).toBeNull();
  });

  it("returns null when the parent entity has no state", () => {
    const pump = makePump();
    pump.parent_entities.ghost = { entity_id: "sensor.ghost" };
    expect(pump.get_entity("ghost")).toBeNull();
  });

  it("describes itself as never disabled", () => {
    const pump = makePump();
    expect(pump._render_disabled()).toEqual({
      reason: null,
      substyle: null,
      maintenance_element: null,
    });
    expect(pump._render_disabled("x").substyle).toBe("x");
  });

  it("does not populate entities of its own", () => {
    const pump = makePump();
    pump.entities = { kept: 1 };
    pump._populate_entities();
    expect(pump.entities).toEqual({ kept: 1 });
  });

  it("refreshes the controlled-in element when the speed changes", () => {
    const pump = makePump();
    const elt = { requestUpdate: vi.fn() };
    pump._elements["sensor_controlled_in"] = elt;
    const next = structuredClone(pump._hass);
    next.states["sensor.speed"] = makeState("sensor.speed", "90");
    vi.spyOn(
      Object.getPrototypeOf(RSPump.prototype),
      "_setting_hass",
    ).mockImplementation(() => {});
    pump._setting_hass(next);
    expect(elt.requestUpdate).toHaveBeenCalled();
    expect(pump.to_render).toBe(true);
  });

  it("refreshes expression-driven elements when the pump is unplugged", () => {
    const pump = makePump();
    const blinking = { conf: { class: "${x}" }, requestUpdate: vi.fn() };
    const plain = { conf: { class: "cables" }, requestUpdate: vi.fn() };
    pump._elements = { blinking, plain };
    const next = structuredClone(pump._hass);
    next.states["binary_sensor.missing"] = makeState(
      "binary_sensor.missing",
      "on",
    );
    vi.spyOn(
      Object.getPrototypeOf(RSPump.prototype),
      "_setting_hass",
    ).mockImplementation(() => {});
    pump._setting_hass(next);
    expect(blinking.requestUpdate).toHaveBeenCalled();
    expect(plain.requestUpdate).not.toHaveBeenCalled();
  });

  it("stays quiet when no watched entity moved", () => {
    const pump = makePump();
    const elt = { requestUpdate: vi.fn() };
    pump._elements["sensor_controlled_in"] = elt;
    vi.spyOn(
      Object.getPrototypeOf(RSPump.prototype),
      "_setting_hass",
    ).mockImplementation(() => {});
    pump._setting_hass(structuredClone(pump._hass));
    expect(elt.requestUpdate).not.toHaveBeenCalled();
  });

  it("tolerates a pump whose entities are not registered", () => {
    const pump = makePump();
    pump.entities = {};
    pump.parent_entities = {};
    vi.spyOn(
      Object.getPrototypeOf(RSPump.prototype),
      "_setting_hass",
    ).mockImplementation(() => {});
    expect(() => pump._setting_hass(pump._hass)).not.toThrow();
  });
});

//----------------------------------------------------------------------------//
//   rsrun_pump_skimmer.ts
//----------------------------------------------------------------------------//

describe("RSSkimmer defaults", () => {
  it("treats a missing speed as the minimum", () => {
    const skimmer = make("gap-rsskimmer");
    skimmer.entities = {};
    skimmer.parent_entities = {};
    skimmer._hass = { states: {}, entities: {} };
    const css = skimmer._waterBackground(false);
    expect(css).toContain("skimmerWater");
  });

  it("inherits the pump styles even without any of its own", () => {
    expect(Array.isArray((RSSkimmer as any).styles)).toBe(true);
  });
});

//----------------------------------------------------------------------------//
//   flow_image.ts
//----------------------------------------------------------------------------//

describe("FlowImage guards", () => {
  /** FlowImage bound to a pump with a schedule and a master switch */
  function makeFlow(): any {
    const flow = make("gap-flowimage");
    flow.device = {
      entities: { schedule_enabled: { entity_id: "switch.schedule" } },
      parent_entities: { device_state: { entity_id: "switch.master" } },
    };
    flow.stateObj = makeState("sensor.speed", "70");
    flow._hass = {
      states: {
        "switch.schedule": makeState("switch.schedule", "on"),
        "switch.master": makeState("switch.master", "on"),
        "sensor.speed": makeState("sensor.speed", "70"),
      },
      entities: {},
    };
    return flow;
  }

  it("reports stopped without any hass", () => {
    expect(makeFlow()._is_running(null)).toBe(false);
  });

  it("reports running for a device with no schedule and no master", () => {
    const flow = makeFlow();
    flow.device = { entities: {}, parent_entities: {} };
    expect(flow._is_running(flow._hass)).toBe(true);
  });

  it("adopts the shared keyframe sheet on first render", () => {
    const flow = makeFlow();
    const root = { adoptedStyleSheets: [], querySelector: () => null };
    vi.spyOn(flow, "shadowRoot", "get").mockReturnValue(root as any);
    flow.firstUpdated();
    expect(root.adoptedStyleSheets).toHaveLength(1);
  });

  it("skips the sheet when there is no shadow root", () => {
    const flow = makeFlow();
    vi.spyOn(flow, "shadowRoot", "get").mockReturnValue(null as any);
    expect(() => flow.firstUpdated()).not.toThrow();
  });

  it("measures the tile only once", () => {
    const flow = makeFlow();
    const root = { adoptedStyleSheets: [], querySelector: () => null };
    vi.spyOn(flow, "shadowRoot", "get").mockReturnValue(root as any);
    flow.firstUpdated();
    const observer = (globalThis as any).ResizeObserver.last;
    observer.cb([{ contentRect: { width: 100 } }]);
    const measured = flow._tileHeightPx;
    observer.cb([{ contentRect: { width: 400 } }]);
    expect(flow._tileHeightPx).toBe(measured);
  });

  it("pauses at speed zero even while the pump is meant to run", () => {
    const flow = makeFlow();
    const div = document.createElement("div");
    vi.spyOn(flow, "shadowRoot", "get").mockReturnValue({
      querySelector: () => div,
    } as any);
    flow.stateObj = makeState("sensor.speed", "unavailable");
    flow._syncAnimation();
    expect(div.style.animationPlayState).toBe("paused");
    expect(parseFloat(div.style.animationDuration)).toBe(10);
  });

  it("renders without an inline style", () => {
    const flow = makeFlow();
    flow.conf = { image: "water.png" };
    expect(JSON.stringify(flow._render().values)).toContain("water.png");
  });
});

//----------------------------------------------------------------------------//
//   slider.ts
//----------------------------------------------------------------------------//

describe("Slider defaults", () => {
  it("uses the entity step, then falls back to one", () => {
    const slider = make("gap-slider");
    slider.conf = { name: "speed" };
    slider._hass = { states: {}, callService: vi.fn(), entities: {} };
    const track = document.createElement("div");
    track.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect;
    vi.spyOn(slider, "shadowRoot", "get").mockReturnValue({
      querySelector: () => track,
    } as any);
    vi.spyOn(slider, "requestUpdate").mockImplementation(() => {});

    slider.stateObj = {
      entity_id: "number.speed",
      state: "50",
      attributes: { min: 0, max: 100, step: 25 },
    };
    slider._onPointerDown({
      clientX: 30,
      pointerId: 1,
      preventDefault: vi.fn(),
      currentTarget: {
        setPointerCapture: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
    expect(slider._displayValue).toBe(25);
  });
});

//----------------------------------------------------------------------------//
//   rsrun_pump.dialog_func_ext.ts
//----------------------------------------------------------------------------//

describe("add_pump rows guards", () => {
  it("does nothing without a device or a container", () => {
    const root = document.createElement("div");
    expect(() => add_pump({}, { states: {} }, root)).not.toThrow();
    const withContent = document.createElement("div");
    const content = document.createElement("div");
    content.id = "dialog-content";
    withContent.appendChild(content);
    expect(() => add_pump({}, { states: {} }, withContent)).not.toThrow();
  });

  it("falls back to the registered custom element when helpers are absent", () => {
    RSDevice._helpersResolved = null;
    if (!customElements.get("gap-fallback-card")) {
      customElements.define(
        "gap-fallback-card",
        class extends HTMLElement {
          config: any;
          setConfig(conf: any) {
            this.config = conf;
          }
        },
      );
    }
    const CardClass = customElements.get("gap-fallback-card");
    vi.spyOn(customElements, "get").mockReturnValue(CardClass as any);
    const root = document.createElement("div");
    const content = document.createElement("div");
    content.id = "dialog-content";
    root.appendChild(content);
    add_pump(
      { device: { entities: { type: { entity_id: "sensor.type" } } } },
      { states: { "sensor.type": makeState("sensor.type", "unknown") } },
      root,
    );
    expect(root.querySelector("#add-pump-rows")).not.toBeNull();
  });
});
