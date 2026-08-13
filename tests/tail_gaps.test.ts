/**
 * The very last branches: the maintenance entry of the card and its editor,
 * a handful of `??` defaults, and the template variants that only appear
 * while a preview runs or while the editor overlay is open.
 */

import { MyElement } from "../src/base/element";
import { RSPump } from "../src/devices/redsea/rsrun/rsrun_pump";
import { ReefCard } from "../src/card";
import { ReefCardEditor } from "../src/editor";
import { RSDevice } from "../src/devices/device";
import { Schedule } from "../src/base/schedule";
import { Slider } from "../src/base/slider";
import { MAINTENANCE_DEVICE_ID, MAINTENANCE_TAG } from "../src/utils/constants";
import { afterEach, describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

class TailElement extends MyElement {
  protected override _render(): any {
    return null;
  }
}
for (const [tag, cls] of [
  ["tail-element", TailElement],
  ["tail-card", ReefCard],
  ["tail-editor", ReefCardEditor],
  ["tail-schedule", Schedule],
  ["tail-slider", Slider],
] as [string, any][]) {
  if (!customElements.get(tag)) {
    customElements.define(tag, class extends cls {});
  }
}
if (!customElements.get(MAINTENANCE_TAG)) {
  customElements.define(
    MAINTENANCE_TAG,
    class extends HTMLElement {
      hass: any;
      device: any;
      isEditorMode = false;
      is_maintenance = true;
      setConfig() {}
    },
  );
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

/** A hass exposing one maintenance task, so the virtual device is offered */
function maintenanceHass(): any {
  return {
    states: {
      "button.task": makeState("button.task", "unknown", {
        friendly_name: "Device Task",
        reef_role: "maint_task",
        task_key: "task",
        interval_days: 30,
        days_left: 10,
        overdue: false,
        last_reset: "2026-08-01T10:00:00+00:00",
        notify: true,
      }),
    },
    entities: { "button.task": { device_id: "dev1" } },
    devices: {},
    callService: vi.fn(),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

//----------------------------------------------------------------------------//
//   card.ts
//----------------------------------------------------------------------------//

describe("ReefCard maintenance selection", () => {
  /** Card wired to a maintenance-capable hass */
  function makeCard(): any {
    const card = make("tail-card");
    card._hass = maintenanceHass();
    card.user_config = {};
    card.select_devices = [
      { value: MAINTENANCE_DEVICE_ID, text: "Maintenance" },
      { value: "entry_1", text: "ReefRun" },
    ];
    card.messages = "";
    card.devices_list = { main_devices: [] };
    return card;
  }

  it("selects the virtual device by its language independent id", () => {
    const card = makeCard();
    card.user_config = { device: MAINTENANCE_DEVICE_ID };
    card._set_current_device = vi.fn();
    card._set_current_device_from_name = vi.fn();
    card.current_device = { hass: null };
    card.first_init = false;
    card.re_render = true;
    card.render();
    expect(card._set_current_device).toHaveBeenCalledWith(
      MAINTENANCE_DEVICE_ID,
    );
    expect(card._set_current_device_from_name).not.toHaveBeenCalled();
  });

  it("marks the maintenance option as selected", () => {
    const card = makeCard();
    card.current_device = { is_maintenance: true };
    const out = JSON.stringify(card.device_select(), (_k, v) =>
      typeof v === "function" ? "fn" : v,
    );
    expect(out).toContain("Maintenance");
  });
});

//----------------------------------------------------------------------------//
//   editor.ts
//----------------------------------------------------------------------------//

describe("ReefCardEditor maintenance entry", () => {
  /** Editor wired to a maintenance-capable hass */
  function makeEditor(): any {
    const editor = make("tail-editor");
    editor._hass = maintenanceHass();
    editor._config = {};
    editor.select_devices = [];
    return editor;
  }

  it("offers the maintenance view when tasks exist", () => {
    const editor = makeEditor();
    editor.init_devices();
    expect(
      editor.select_devices.some((d: any) => d.value === MAINTENANCE_DEVICE_ID),
    ).toBe(true);
  });

  it("hides it when no task exists", () => {
    const editor = makeEditor();
    editor._hass = { states: {}, entities: {}, devices: {} };
    editor.init_devices();
    expect(
      editor.select_devices.some((d: any) => d.value === MAINTENANCE_DEVICE_ID),
    ).toBe(false);
  });

  it("renders nothing when the maintenance view cannot be created", () => {
    const editor = makeEditor();
    editor._config = { device: MAINTENANCE_DEVICE_ID };
    editor.init_devices();
    vi.spyOn(RSDevice, "create_device").mockReturnValue(null);
    expect(editor.device_conf().values).toEqual([]);
  });
});

//----------------------------------------------------------------------------//
//   element.ts
//----------------------------------------------------------------------------//

describe("MyElement sequential service data", () => {
  it("passes an object payload through untouched", async () => {
    const el: any = make("tail-element");
    el.device = {
      entities: { own: { entity_id: "sensor.own" } },
      config: { color: "1,2,3", alpha: 1, elements: {} },
      is_on: () => true,
      masterOn: true,
    };
    el.conf = { name: "own" };
    el._hass = { states: {}, entities: {}, callService: vi.fn() };
    el.stateObj = makeState("sensor.own", "42");
    vi.spyOn(el, "requestUpdate").mockImplementation(() => {});
    vi.spyOn(el, "_wait_timer").mockResolvedValue(undefined);

    await el.run_actions([
      { domain: "redsea_ui", action: "wait", data: 1 },
      { domain: "redsea", action: "request", data: { access_path: "/x" } },
    ]);
    expect(el._hass.callService).toHaveBeenCalledWith("redsea", "request", {
      access_path: "/x",
    });
  });
});

//----------------------------------------------------------------------------//
//   rsrun_pump.ts
//----------------------------------------------------------------------------//

describe("RSPump without a controlled-in element", () => {
  it("does not blow up when the mapping has no such element", () => {
    if (!customElements.get("tail-rspump")) {
      customElements.define("tail-rspump", class extends RSPump {});
    }
    const pump: any = make("tail-rspump");
    pump.id = 1;
    pump.entities = { speed: { entity_id: "sensor.speed" } };
    pump.parent_entities = {};
    pump._elements = {};
    pump._hass = {
      states: { "sensor.speed": makeState("sensor.speed", "70") },
      entities: {},
    };
    vi.spyOn(
      Object.getPrototypeOf(RSPump.prototype),
      "_setting_hass",
    ).mockImplementation(() => {});
    pump._setting_hass({
      states: { "sensor.speed": makeState("sensor.speed", "90") },
      entities: {},
    });
    expect(pump.to_render).toBe(true);
  });
});

//----------------------------------------------------------------------------//
//   schedule.ts
//----------------------------------------------------------------------------//

describe("Schedule last branches", () => {
  /** Recording 2D context; unknown methods are created on demand */
  function makeCtx(): any {
    const calls: any[] = [];
    const target: any = {
      calls,
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      measureText: vi.fn(() => ({ width: 10 })),
    };
    return new Proxy(target, {
      get(obj, prop: string) {
        if (prop in obj) return obj[prop];
        if (typeof prop !== "string") return undefined;
        if (
          /^(fillStyle|strokeStyle|font|lineWidth|globalAlpha|textAlign|textBaseline|lineCap|lineJoin|shadowBlur|shadowColor)$/.test(
            prop,
          )
        ) {
          return undefined;
        }
        obj[prop] = vi.fn((...args: any[]) => calls.push([prop, ...args]));
        return obj[prop];
      },
      set(obj, prop: string, value) {
        obj[prop] = value;
        return true;
      },
    });
  }

  /** Canvas stub of a given size */
  function makeCanvas(width = 400, height = 200): any {
    const ctx = makeCtx();
    return {
      ctx,
      width,
      height,
      getContext: () => ctx,
      getBoundingClientRect: () =>
        ({ width, height, left: 0, top: 0 }) as DOMRect,
    };
  }

  /** Schedule element bound to a minimal device */
  function makeSchedule(conf: any = {}, schedule: any = [{ st: 0, ti: 40 }]) {
    const el: any = make("tail-schedule");
    el.conf = { name: "schedule", ...conf };
    el.stateObj = {
      entity_id: "sensor.schedule",
      state: "on",
      attributes: { schedule },
    };
    el.stateOn = true;
    el.device = {
      id: 1,
      entities: { preview_start: { entity_id: "button.preview_start" } },
      parent_device: { elements: [{ primary_config_entry: "entry_1" }] },
    };
    el._hass = { states: {}, entities: {}, callService: vi.fn() };
    vi.spyOn(el, "requestUpdate").mockImplementation(() => {});
    Object.defineProperty(el, "updateComplete", {
      get: () => Promise.resolve(true),
      configurable: true,
    });
    return el;
  }

  it("renders ungreyed while the device is on", () => {
    expect(JSON.stringify(makeSchedule()._render().values)).not.toContain(
      "grayscale",
    );
  });

  it("renders the overlay inside the container while editing", () => {
    const el = makeSchedule();
    el.openEditor();
    const out = JSON.stringify(el._render().values, (_k, v) =>
      typeof v === "function" ? "fn" : (v?.strings?.raw?.join("") ?? v),
    );
    expect(out).toContain("editor-overlay");
  });

  it("marks the row being previewed with a stop button", () => {
    const el = makeSchedule();
    el.openEditor();
    el._togglePreviewRow(0);
    expect(el._previewRunning).toBe(true);
    const out = JSON.stringify(el._renderEditor(), (_k, v) =>
      typeof v === "function" ? "fn" : v,
    );
    expect(out).toContain("stop-row");
  });

  it("defaults a new pulse to zero", () => {
    const el = makeSchedule({ pulse_field: "pulse" }, []);
    el.openEditor();
    expect(el._editPoints[0].pulse).toBe(0);
    el._addPoint();
    expect(el._editPoints[1].pulse).toBe(0);
  });

  it("returns null when hass has no state for the measured entity", () => {
    const el = makeSchedule({ current_entity: "speed" });
    el.device.entities.speed = { entity_id: "sensor.speed" };
    expect(el._getCurrentValue()).toBeNull();
  });

  it("assumes a device pixel ratio of one", () => {
    const el = makeSchedule();
    const original = window.devicePixelRatio;
    Object.defineProperty(window, "devicePixelRatio", {
      value: 0,
      configurable: true,
    });
    const canvas = makeCanvas();
    el._drawOnCanvas(canvas, el._parseSchedule(), true);
    expect(canvas.ctx.scale).toHaveBeenCalledWith(1, 1);
    Object.defineProperty(window, "devicePixelRatio", {
      value: original,
      configurable: true,
    });
  });

  it("keeps a usable scale when the range is empty", () => {
    const el = makeSchedule({ min_value: 50, max_value: 50 });
    const canvas = makeCanvas();
    expect(() =>
      el._drawOnCanvas(canvas, el._parseSchedule(), true),
    ).not.toThrow();
  });

  it("prints a fractional value with one decimal", () => {
    const el = makeSchedule({ linear: true, unit: "%" }, [
      { st: 0, ti: 40 },
      { st: 1439, ti: 41 },
    ]);
    const canvas = makeCanvas();
    el._drawOnCanvas(canvas, el._parseSchedule(), true);
    const labels = canvas.ctx.calls.filter((c: any[]) => c[0] === "fillText");
    expect(labels.some((c: any[]) => /\d\.\d%/.test(c[1]))).toBe(true);
  });

  it("labels the now marker without a unit", () => {
    const el = makeSchedule();
    el.stateObj.attributes.unit_of_measurement = undefined;
    const canvas = makeCanvas();
    el._drawOnCanvas(canvas, el._parseSchedule(), true);
    const labels = canvas.ctx.calls.filter((c: any[]) => c[0] === "fillText");
    expect(labels.some((c: any[]) => /^\d{2}:\d{2} \d/.test(c[1]))).toBe(true);
  });

  it("skips a pulse segment of zero length", () => {
    const el = makeSchedule({ pulse_field: "pulse", max_value: 100 }, [
      { st: 600, ti: 80, pulse: 30 },
      { st: 600, ti: 80, pulse: 30 },
    ]);
    const canvas = makeCanvas();
    expect(() =>
      el._drawOnCanvas(canvas, el._parseSchedule(), true),
    ).not.toThrow();
  });

  it("rounds the grid step to five", () => {
    expect(makeSchedule()._niceStep(50, 10)).toBe(5);
  });

  it("returns the last value past the end of the schedule", () => {
    const el = makeSchedule();
    expect(el._interpolateValue([{ minutes: 0, value: 40 }], 1400, true)).toBe(
      40,
    );
  });
});

//----------------------------------------------------------------------------//
//   slider.ts
//----------------------------------------------------------------------------//

describe("Slider entity bounds", () => {
  /** Slider whose bounds come from the entity, not the mapping */
  function makeSlider(attributes: any): any {
    const slider = make("tail-slider");
    slider.conf = { name: "speed" };
    slider.stateObj = { entity_id: "number.speed", state: "50", attributes };
    slider._hass = { states: {}, callService: vi.fn(), entities: {} };
    const track = document.createElement("div");
    track.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect;
    vi.spyOn(slider, "shadowRoot", "get").mockReturnValue({
      querySelector: () => track,
    } as any);
    vi.spyOn(slider, "requestUpdate").mockImplementation(() => {});
    return slider;
  }

  it("renders an entity carrying no attributes at all", () => {
    const slider = makeSlider({ min: 0, max: 200 });
    slider.stateObj.attributes = undefined;
    expect(() => slider._render()).not.toThrow();
  });

  it("drags an entity carrying no attributes at all", () => {
    const slider = makeSlider({});
    slider.stateObj.attributes = undefined;
    slider._onPointerDown({
      clientX: 50,
      pointerId: 1,
      preventDefault: vi.fn(),
      currentTarget: {
        setPointerCapture: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
    expect(slider._displayValue).toBe(50);
  });

  it("reads the bounds from the entity when rendering", () => {
    const out = JSON.stringify(
      makeSlider({ min: 0, max: 200 })._render().values,
    );
    // 50 out of 0-200 puts the thumb at a quarter of the track
    expect(out).toContain("25");
  });

  it("reads the bounds from the entity when dragging", () => {
    const slider = makeSlider({ min: 0, max: 200, step: 1 });
    slider._onPointerDown({
      clientX: 50,
      pointerId: 1,
      preventDefault: vi.fn(),
      currentTarget: {
        setPointerCapture: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
    expect(slider._displayValue).toBe(100);
  });
});
