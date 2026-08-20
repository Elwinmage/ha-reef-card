/**
 * Tests for the RSRun controller itself (the parent of the two pumps):
 *   - _populate_entities() splits the registry between the controller and
 *     each pump slot, keyed by translation_key and domain.translation_key
 *   - _render_pumps() instantiates the right custom element per pump type,
 *     caches it, and rebuilds it when the type changes
 *   - hass is pushed down without triggering a Lit re-render
 */

import { RSRun } from "../src/devices/redsea/rsrun/rsrun";
import { RSDevice } from "../src/devices/device";
import { afterEach, describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

if (!customElements.get("cov-rsrun")) {
  customElements.define("cov-rsrun", class extends RSRun {});
}

/** HA device entries: the controller and its two pump sub-devices */
const DEVICES = [
  { id: "dev0", identifiers: [["reefbeat", "RSRUN_1234"]] },
  { id: "dev1", identifiers: [["reefbeat", "RSRUN_1234_pump_1"]] },
  { id: "dev2", identifiers: [["reefbeat", "RSRUN_1234_pump_2"]] },
];

/** Registry entries, as hass.entities exposes them */
const REGISTRY: Record<string, any> = {
  "switch.device_state": {
    device_id: "dev0",
    translation_key: "device_state",
    entity_id: "switch.device_state",
  },
  "sensor.pump_1_type": {
    device_id: "dev1",
    translation_key: "type",
    entity_id: "sensor.pump_1_type",
  },
  "select.pump_1_model": {
    device_id: "dev1",
    translation_key: "model",
    entity_id: "select.pump_1_model",
  },
  "sensor.pump_2_type": {
    device_id: "dev2",
    translation_key: "type",
    entity_id: "sensor.pump_2_type",
  },
  "sensor.orphan": {
    device_id: "dev9",
    translation_key: "orphan",
    entity_id: "sensor.orphan",
  },
};

/**
 * Build an RSRun wired to the fixtures above.
 * @param types: reported type of pump 1 and pump 2
 * @return the RSRun instance, ready for _populate_entities()
 */
function makeRun(types: [string, string] = ["return", "skimmer"]): any {
  const run: any = new (customElements.get("cov-rsrun") as any)();
  run.entities = {};
  run._pumps = [];
  run.device = { model: "RSRUN", name: "", elements: DEVICES, id: "dev0" };
  run.update_config = vi.fn();
  run.get_config_flag = vi.fn(() => false);
  run._hass = {
    entities: REGISTRY,
    states: {
      "switch.device_state": { entity_id: "switch.device_state", state: "on" },
      "sensor.pump_1_type": {
        entity_id: "sensor.pump_1_type",
        state: types[0],
      },
      "sensor.pump_2_type": {
        entity_id: "sensor.pump_2_type",
        state: types[1],
      },
    },
    callService: vi.fn(),
  };
  return run;
}

/** Stub RSDevice.create_device so no real pump element is instantiated */
function stubCreateDevice(): any {
  return vi
    .spyOn(RSDevice, "create_device")
    .mockImplementation((tag_name: string) => {
      return { tag_name, _setting_hass: vi.fn() } as any;
    });
}

afterEach(() => {
  vi.restoreAllMocks();
});

//----------------------------------------------------------------------------//
//   _populate_entities
//----------------------------------------------------------------------------//

describe("RSRun._populate_entities", () => {
  it("keeps the controller entities on the controller", () => {
    const run = makeRun();
    run._populate_entities();
    expect(run.entities["device_state"].entity_id).toBe("switch.device_state");
    expect(run.entities["switch.device_state"].entity_id).toBe(
      "switch.device_state",
    );
  });

  it("routes each entity to its own pump slot", () => {
    const run = makeRun();
    run._populate_entities();
    expect(run._pumps[1].entities["type"].entity_id).toBe("sensor.pump_1_type");
    expect(run._pumps[2].entities["type"].entity_id).toBe("sensor.pump_2_type");
    expect(run._pumps[1].entities["type"]).not.toBe(
      run._pumps[2].entities["type"],
    );
  });

  it("indexes entities by domain too, so an ambiguous key stays reachable", () => {
    const run = makeRun();
    run._populate_entities();
    expect(run._pumps[1].entities["select.model"].entity_id).toBe(
      "select.pump_1_model",
    );
  });

  it("ignores entities belonging to another device", () => {
    const run = makeRun();
    run._populate_entities();
    expect(run.entities["orphan"]).toBeUndefined();
    expect(run._pumps[1].entities["orphan"]).toBeUndefined();
  });

  it("does not grow the slot list when called again", () => {
    const run = makeRun();
    run._populate_entities();
    run._populate_entities();
    expect(run._pumps).toHaveLength(3);
    expect(run._pumps[1].entities["type"].entity_id).toBe("sensor.pump_1_type");
  });

  it("stops early when hass is not set yet", () => {
    const run = makeRun();
    run._hass = null;
    run._populate_entities();
    expect(run._pumps).toHaveLength(3);
    expect(run._pumps[1].entities).toEqual({});
  });
});

//----------------------------------------------------------------------------//
//   _render_pumps
//----------------------------------------------------------------------------//

describe("RSRun._render_pumps", () => {
  it("instantiates the custom element matching each pump type", () => {
    const create = stubCreateDevice();
    const run = makeRun(["return", "skimmer"]);
    run._populate_entities();
    run._render_pumps(true);
    const tags = create.mock.calls.map((c: any[]) => c[0]);
    expect(tags).toEqual(["redsea-rsrun-return", "redsea-rsrun-skimmer"]);
  });

  it("wires the parent entities and device onto each pump", () => {
    stubCreateDevice();
    const run = makeRun();
    run._populate_entities();
    run._render_pumps(true);
    const pump = run._pumps[1].litElement;
    expect(pump.pump_id).toBe(1);
    expect(pump.entities).toBe(run._pumps[1].entities);
    expect(pump.parent_entities).toBe(run.entities);
    expect(pump.parent_device).toBe(run.device);
  });

  it("reuses the cached element while the type does not change", () => {
    stubCreateDevice();
    const run = makeRun();
    run._populate_entities();
    run._render_pumps(true);
    const first = run._pumps[1].litElement;
    run._render_pumps(true);
    expect(run._pumps[1].litElement).toBe(first);
  });

  it("rebuilds the element when a pump is added or deleted", () => {
    const create = stubCreateDevice();
    const run = makeRun(["unknown", "skimmer"]);
    run._populate_entities();
    run._render_pumps(true);
    const first = run._pumps[1].litElement;
    expect(first.tag_name).toBe("redsea-rsrun-unknown");

    run._hass.states["sensor.pump_1_type"].state = "return";
    run._render_pumps(true);
    expect(run._pumps[1].litElement).not.toBe(first);
    expect(create.mock.calls.at(-1)?.[0]).toBe("redsea-rsrun-return");
  });

  it("falls back to the unconfigured slot when the type has no state", () => {
    const create = stubCreateDevice();
    const run = makeRun();
    run._populate_entities();
    delete run._hass.states["sensor.pump_1_type"];
    run._render_pumps(true);
    expect(create.mock.calls[0][0]).toBe("redsea-rsrun-unknown");
  });

  it("survives a slot whose type entity is missing from the registry", () => {
    const create = stubCreateDevice();
    const run = makeRun();
    run._populate_entities();
    delete run._pumps[1].entities["type"];
    expect(() => run._render_pumps(true)).not.toThrow();
    expect(create.mock.calls[0][0]).toBe("redsea-rsrun-unknown");
  });

  it("propagates the add-pump placeholder setting on every pass", () => {
    stubCreateDevice();
    const run = makeRun();
    run._populate_entities();
    run._render_pumps(true);
    expect(run._pumps[1].litElement.show_add_pump).toBe(true);

    run.get_config_flag = vi.fn(() => true);
    run._render_pumps(true);
    expect(run._pumps[1].litElement.show_add_pump).toBe(false);
  });
});

//----------------------------------------------------------------------------//
//   hass propagation
//----------------------------------------------------------------------------//

describe("RSRun._setting_hass", () => {
  it("pushes hass to the pumps without going through the Lit setter", () => {
    stubCreateDevice();
    const run = makeRun();
    run._populate_entities();
    run._render_pumps(true);
    vi.spyOn(
      Object.getPrototypeOf(RSRun.prototype),
      "_setting_hass",
    ).mockImplementation(() => {});

    const next = { states: {}, entities: {}, callService: vi.fn() };
    run._setting_hass(next);
    expect(run._pumps[1].litElement._setting_hass).toHaveBeenCalledWith(next);
    expect(run._pumps[2].litElement._setting_hass).toHaveBeenCalledWith(next);
  });

  it("skips slots that hold no element yet", () => {
    const run = makeRun();
    run._populate_entities();
    vi.spyOn(
      Object.getPrototypeOf(RSRun.prototype),
      "_setting_hass",
    ).mockImplementation(() => {});
    expect(() => run._setting_hass({ states: {}, entities: {} })).not.toThrow();
  });
});

//----------------------------------------------------------------------------//
//   show_add_pump
//----------------------------------------------------------------------------//

describe("RSRun.show_add_pump", () => {
  it("is allowed by default", () => {
    const run = makeRun();
    expect(run.show_add_pump()).toBe(true);
  });

  it("is refused once hidden from the editor", () => {
    const run = makeRun();
    run.get_config_flag = vi.fn(() => true);
    expect(run.show_add_pump()).toBe(false);
  });
});
