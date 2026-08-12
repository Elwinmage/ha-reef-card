/**
 * The last coverage gaps: mostly the right-hand side of `??` defaults and
 * guards that only fire on incomplete data — an entity with no bounds, a
 * device with no schedule, a user config that was never written.
 */

import { Dialog } from "../src/base/dialog";
import { RSDevice } from "../src/devices/device";
import { FlowImage } from "../src/base/flow_image";
import { RSMaintenance } from "../src/devices/redsea/maintenance/maintenance";
import { RSPump } from "../src/devices/redsea/rsrun/rsrun_pump";
import { RSRun } from "../src/devices/redsea/rsrun/rsrun";
import { RSSkimmer } from "../src/devices/redsea/rsrun/rsrun_pump_skimmer";
import { Schedule } from "../src/base/schedule";
import { Slider } from "../src/base/slider";
import { add_pump } from "../src/devices/redsea/rsrun/rsrun_pump.dialog_func_ext";
import { collect_maintenance_items } from "../src/utils/maintenance";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

for (const [tag, cls] of [
  ["last-dialog", Dialog],
  ["last-flowimage", FlowImage],
  ["last-maintenance", RSMaintenance],
  ["last-rspump", RSPump],
  ["last-rsrun", RSRun],
  ["last-rsskimmer", RSSkimmer],
  ["last-schedule", Schedule],
  ["last-slider", Slider],
] as [string, any][]) {
  if (!customElements.get(tag)) {
    customElements.define(tag, class extends cls {});
  }
}

/** Instantiate one of the elements registered above */
function make(tag: string): any {
  return new (customElements.get(tag) as any)();
}

function makeState(
  entity_id: string,
  state: string,
  attributes: any = {},
): any {
  return { entity_id, state, attributes };
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

describe("Dialog unresolved rows", () => {
  /** Dialog whose element resolves nothing */
  function makeDialog(): any {
    const dlg = make("last-dialog");
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
        throw new Error(`Entity ${name} not found`);
      },
    };
    if (!customElements.get("last-entities-card")) {
      customElements.define(
        "last-entities-card",
        class extends HTMLElement {
          config: any;
          setConfig(conf: any) {
            this.config = conf;
          }
        },
      );
    }
    return dlg;
  }

  it("drops a row given as a bare string it cannot resolve", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const dlg = makeDialog();
    dlg._render_content({
      view: "last-entities-card",
      conf: { entities: ["ghost", "phantom"] },
    });
    expect(warn).toHaveBeenCalledTimes(2);
    expect(dlg.elts[0].config.entities).toEqual([]);
  });

  it("drops a row given as an object it cannot resolve", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const dlg = makeDialog();
    dlg._render_content({
      view: "last-entities-card",
      conf: { entities: [{ entity: "ghost" }] },
    });
    expect(dlg.elts[0].config.entities).toEqual([]);
  });
});

//----------------------------------------------------------------------------//
//   flow_image.ts
//----------------------------------------------------------------------------//

describe("FlowImage hass setter", () => {
  /** FlowImage bound to a running pump */
  function makeFlow(): any {
    const flow = make("last-flowimage");
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
      callService: vi.fn(),
    };
    const div = document.createElement("div");
    vi.spyOn(flow, "shadowRoot", "get").mockReturnValue({
      querySelector: () => div,
      adoptedStyleSheets: [],
    } as any);
    flow.div = div;
    return flow;
  }

  it("hands over to the base setter when nothing changed", () => {
    const flow = makeFlow();
    const next = { ...flow._hass, states: { ...flow._hass.states } };
    flow.hass = next;
    expect(flow._hass).toBe(next);
    expect(flow.div.style.animationPlayState).toBe("");
  });

  it("syncs even when its own entity vanished from hass", () => {
    const flow = makeFlow();
    const next = { ...flow._hass, states: { ...flow._hass.states } };
    delete next.states["sensor.speed"];
    next.states["switch.master"] = makeState("switch.master", "off");
    flow.hass = next;
    expect(flow.div.style.animationPlayState).toBe("paused");
    // stateObj is kept: there is nothing fresher to replace it with
    expect(flow.stateObj.state).toBe("70");
  });

  it("keeps running when the schedule entity has no state", () => {
    const flow = makeFlow();
    delete flow._hass.states["switch.schedule"];
    expect(flow._is_running(flow._hass)).toBe(true);
  });

  it("keeps running when the master switch has no state", () => {
    const flow = makeFlow();
    delete flow._hass.states["switch.master"];
    expect(flow._is_running(flow._hass)).toBe(true);
  });

  it("treats a missing state as the minimum while running", () => {
    const flow = makeFlow();
    flow.stateObj = null;
    flow._syncAnimation();
    expect(flow.div.style.animationPlayState).toBe("running");
    expect(parseFloat(flow.div.style.animationDuration)).toBe(10);
  });
});

//----------------------------------------------------------------------------//
//   slider.ts
//----------------------------------------------------------------------------//

describe("Slider fallbacks", () => {
  /** Slider bound to a number entity with no attributes at all */
  function makeSlider(state = "50"): any {
    const slider = make("last-slider");
    slider.conf = { name: "speed" };
    slider.stateObj = { entity_id: "number.speed", state, attributes: {} };
    slider._hass = { states: {}, callService: vi.fn(), entities: {} };
    const track = document.createElement("div");
    track.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect;
    vi.spyOn(slider, "shadowRoot", "get").mockReturnValue({
      querySelector: () => track,
    } as any);
    vi.spyOn(slider, "requestUpdate").mockImplementation(() => {});
    return slider;
  }

  it("falls back to 0-100 with a step of one", () => {
    const slider = makeSlider();
    slider._onPointerDown({
      clientX: 33,
      pointerId: 1,
      preventDefault: vi.fn(),
      currentTarget: {
        setPointerCapture: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
    expect(slider._displayValue).toBe(33);
  });

  it("renders a bare entity without a unit", () => {
    const out = JSON.stringify(makeSlider()._render().values);
    expect(out).toContain("50");
  });
});

//----------------------------------------------------------------------------//
//   schedule.ts
//----------------------------------------------------------------------------//

describe("Schedule fallbacks", () => {
  /** Schedule element with the barest possible configuration */
  function makeSchedule(conf: any = {}, attributes: any = {}): any {
    const el = make("last-schedule");
    el.conf = { name: "schedule", ...conf };
    el.stateObj = {
      entity_id: "sensor.schedule",
      state: "on",
      attributes: { schedule: [{ st: 0, ti: 40 }], ...attributes },
    };
    el.stateOn = true;
    el.device = { id: 1, entities: {}, parent_device: { elements: [{}] } };
    el._hass = { states: {}, entities: {}, callService: vi.fn() };
    vi.spyOn(el, "requestUpdate").mockImplementation(() => {});
    Object.defineProperty(el, "updateComplete", {
      get: () => Promise.resolve(true),
      configurable: true,
    });
    return el;
  }

  it("resolves nothing for a device with no entities", () => {
    const el = makeSchedule({ current_entity: "speed" });
    expect(el._getCurrentValue()).toBeNull();
  });

  it("defaults the editor bounds and the point count", () => {
    const el = makeSchedule();
    el.openEditor();
    expect(JSON.stringify(el._renderEditor().strings.raw)).toContain(
      "editor-panel",
    );
    // max_points defaults to 10, so nine more points can be added
    for (let i = 0; i < 20; i++) el._addPoint();
    expect(el._editPoints).toHaveLength(10);
  });

  it("defaults the save field names", () => {
    const el = makeSchedule();
    el.openEditor();
    el._saveSchedule();
    const data = el._hass.callService.mock.calls[0]?.[2];
    expect(data).toBeUndefined();
  });

  it("keeps a fixed grid step for a zero range", () => {
    expect(makeSchedule()._niceStep(0, 5)).toBe(1);
  });

  it("returns the last value past the end of the list", () => {
    const el = makeSchedule();
    const points = [
      { minutes: 0, value: 10 },
      { minutes: 600, value: 20 },
    ];
    // minutes beyond the last point, reached through the loop guard
    expect(el._interpolateValue(points, 600, true)).toBe(20);
  });

  it("draws without a measured value configured", () => {
    const el = makeSchedule();
    const canvas = {
      width: 400,
      height: 200,
      getContext: () => null,
      getBoundingClientRect: () =>
        ({ width: 400, height: 200, left: 0, top: 0 }) as DOMRect,
    };
    expect(() =>
      el._drawOnCanvas(canvas as any, el._parseSchedule(), true),
    ).not.toThrow();
  });
});

//----------------------------------------------------------------------------//
//   rsrun and pumps
//----------------------------------------------------------------------------//

describe("RSRun and pump fallbacks", () => {
  it("skips the registry walk when the device is not set", () => {
    const run = make("last-rsrun");
    run.entities = {};
    run._pumps = [];
    run.update_config = vi.fn();
    run.device = null;
    run._hass = {
      entities: { "sensor.x": { device_id: "d", translation_key: "x" } },
      states: {},
    };
    expect(() => run._populate_entities()).not.toThrow();
    expect(run.entities).toEqual({});
  });

  it("re-renders a pump whose type changed without touching the elements", () => {
    const pump = make("last-rspump");
    pump.id = 1;
    pump.entities = { type: { entity_id: "sensor.type" } };
    pump.parent_entities = {};
    pump._elements = {};
    pump._hass = {
      states: { "sensor.type": makeState("sensor.type", "return") },
      entities: {},
    };
    vi.spyOn(
      Object.getPrototypeOf(RSPump.prototype),
      "_setting_hass",
    ).mockImplementation(() => {});
    pump._setting_hass({
      states: { "sensor.type": makeState("sensor.type", "skimmer") },
      entities: {},
    });
    expect(pump.to_render).toBe(true);
  });

  it("gives the skimmer an empty state rather than undefined", () => {
    const skimmer = make("last-rsskimmer");
    skimmer.id = 2;
    skimmer.entities = {};
    skimmer.parent_entities = {};
    skimmer._hass = { states: {}, entities: {} };
    skimmer.config = { state_background_imgs: { off: "off.png" } };
    skimmer._render_elements = () => "";
    expect(JSON.stringify(skimmer._render().values)).toContain("off.png");
  });
});

//----------------------------------------------------------------------------//
//   add_pump rows
//----------------------------------------------------------------------------//

describe("add_pump rows fallbacks", () => {
  /** Shadow root exposing an empty #dialog-content */
  function makeRoot(): any {
    const root = document.createElement("div");
    const content = document.createElement("div");
    content.id = "dialog-content";
    root.appendChild(content);
    return root;
  }

  it("leaves plain nodes alone when refreshing hass", () => {
    const hass = {
      states: { "sensor.type": makeState("sensor.type", "unknown") },
    };
    const device = { entities: { type: { entity_id: "sensor.type" } } };
    const root = makeRoot();
    const cards: any[] = [];
    RSDevice._helpersResolved = {
      createCardElement: () => {
        const card: any = document.createElement("div");
        card.hass = null;
        // A plain child alongside the card: it must be left alone
        card.appendChild(document.createElement("span"));
        cards.push(card);
        return card;
      },
    };
    add_pump({ device }, hass, root);
    // Second pass with the same type: the card is refreshed, not rebuilt
    add_pump({ device }, hass, root);
    expect(cards).toHaveLength(1);
    expect(cards[0].hass).toBe(hass);
  });

  it("falls back to the unknown layout for a type it does not know", () => {
    const hass = {
      states: { "sensor.type": makeState("sensor.type", "wavemaker") },
    };
    const device = { entities: { type: { entity_id: "sensor.type" } } };
    const root = makeRoot();
    add_pump({ device }, hass, root);
    expect(root.querySelector("#add-pump-rows").dataset.pumpType).toBe(
      "unknown",
    );
  });
});

//----------------------------------------------------------------------------//
//   maintenance view
//----------------------------------------------------------------------------//

describe("RSMaintenance option fallbacks", () => {
  /** Maintenance view with a given user config */
  function makeView(maintenance: any): any {
    const view = make("last-maintenance");
    view.user_config = maintenance === undefined ? {} : { maintenance };
    view._hass = { states: {}, entities: {}, callService: vi.fn() };
    return view;
  }

  it("keeps the default warning ratio for an out-of-range value", () => {
    for (const warning_ratio of [0, 1, 5, "x", undefined]) {
      const view = makeView({ warning_ratio });
      expect(view._read_options().warning_ratio).toBeGreaterThan(0);
      expect(view._read_options().warning_ratio).toBeLessThan(1);
    }
  });

  it("accepts a ratio inside the range", () => {
    expect(makeView({ warning_ratio: 0.5 })._read_options().warning_ratio).toBe(
      0.5,
    );
  });

  it("keeps the default hide_muted for a non boolean", () => {
    expect(makeView({ hide_muted: "yes" })._read_options().hide_muted).toBe(
      false,
    );
    expect(makeView({ hide_muted: true })._read_options().hide_muted).toBe(
      true,
    );
  });

  it("clamps an interval to the entity bounds", () => {
    const view = makeView({});
    const item: any = {
      interval_entity_id: "number.interval",
      interval_min: 5,
      interval_max: 90,
    };
    view._set_interval(item, 1);
    view._set_interval(item, 500);
    const calls = view._hass.callService.mock.calls;
    expect(calls[0][2].value).toBe(5);
    expect(calls[1][2].value).toBe(90);
  });

  it("leaves an unbounded interval untouched", () => {
    const view = makeView({});
    view._set_interval(
      {
        interval_entity_id: "number.interval",
        interval_min: null,
        interval_max: null,
      } as any,
      500,
    );
    expect(view._hass.callService.mock.calls[0][2].value).toBe(500);
  });

  it("renders the interval editor with default bounds", () => {
    const view = makeView({});
    const out = JSON.stringify(
      view._render_interval_editor({
        interval_entity_id: "number.interval",
        interval_unit: null,
        interval_min: null,
        interval_max: null,
        interval_value: null,
        interval_step: 1,
      } as any).values,
    );
    expect(out).toContain("1");
  });

  it("writes an option into an empty user config", () => {
    const view = makeView(undefined);
    view.user_config = null;
    const listener = vi.fn();
    view.addEventListener("config-changed", listener);
    view._update_option("hide_muted", true);
    expect(listener.mock.calls[0][0].detail.config.maintenance.hide_muted).toBe(
      true,
    );
  });
});

//----------------------------------------------------------------------------//
//   utils/maintenance
//----------------------------------------------------------------------------//

describe("maintenance interval without attributes", () => {
  it("survives a number entity carrying no attributes", () => {
    const items = collect_maintenance_items({
      states: {
        "button.task": {
          entity_id: "button.task",
          state: "unknown",
          attributes: {
            friendly_name: "Device Task",
            reef_role: "maint_task",
            task_key: "task",
            interval_days: 30,
            days_left: 10,
            overdue: false,
            last_reset: "2026-08-01T10:00:00+00:00",
            notify: true,
          },
        },
        "number.interval": {
          entity_id: "number.interval",
          state: "30",
          attributes: { reef_role: "maint_task_interval_days" },
        },
      },
      entities: {
        "button.task": { device_id: "dev1" },
        "number.interval": { device_id: "dev1" },
      },
      devices: {},
    } as any);
    expect(items[0].interval_step).toBe(1);
  });
});
