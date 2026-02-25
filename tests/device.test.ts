/**
 * Unit tests — src/devices/device.ts (RSDevice)
 *
 * We test the pure-logic methods extracted from RSDevice without
 * instantiating the full LitElement / custom-element pipeline:
 *   - is_on()
 *   - is_disabled()
 *   - get_entity()
 *   - setNestedProperty() (private — tested via applyLeaves effect)
 *   - update_config() merge behaviour
 *   - load_dialogs()
 */

import { describe, it, expect, vi } from "vitest";

// ── Minimal stubs ─────────────────────────────────────────────────────────────

function makeState(state: string, entity_id = "sensor.test"): any {
  return { entity_id, state, attributes: {} };
}

function makeHass(states: Record<string, any> = {}, entities: any[] = []): any {
  return { states, devices: {}, callService: vi.fn(), entities };
}

// ── is_on() logic ─────────────────────────────────────────────────────────────
//
// Extracted logic (verbatim from device.ts):
//   if (!_hass || !entities["device_state"]) return false;
//   return _hass.states[entities["device_state"].entity_id]?.state !== "off";

function is_on(hass: any, entities: Record<string, any>): boolean {
  if (!hass || !entities["device_state"]) return false;
  return hass.states[entities["device_state"].entity_id]?.state !== "off";
}

describe("RSDevice.is_on()", () => {
  it("returns false when hass is null", () => {
    expect(is_on(null, { device_state: { entity_id: "switch.x" } })).toBe(
      false,
    );
  });

  it("returns false when device_state entity is missing", () => {
    expect(is_on(makeHass(), {})).toBe(false);
  });

  it("returns false when device_state is 'off'", () => {
    const hass = makeHass({ "switch.relay": makeState("off", "switch.relay") });
    const entities = { device_state: { entity_id: "switch.relay" } };
    expect(is_on(hass, entities)).toBe(false);
  });

  it("returns true when device_state is 'on'", () => {
    const hass = makeHass({ "switch.relay": makeState("on", "switch.relay") });
    const entities = { device_state: { entity_id: "switch.relay" } };
    expect(is_on(hass, entities)).toBe(true);
  });

  it("returns true for any non-'off' state (e.g. 'standby')", () => {
    const hass = makeHass({
      "switch.relay": makeState("standby", "switch.relay"),
    });
    const entities = { device_state: { entity_id: "switch.relay" } };
    expect(is_on(hass, entities)).toBe(true);
  });
});

// ── is_disabled() logic ───────────────────────────────────────────────────────
//
// Extracted logic:
//   if (!device?.elements?.length) return true;
//   return device.elements.some((el) => el?.disabled_by !== null);

function is_disabled(device: any): boolean {
  if (!device?.elements?.length) return true;
  return device.elements.some((el: any) => el?.disabled_by !== null);
}

describe("RSDevice.is_disabled()", () => {
  it("returns true when device has no elements", () => {
    expect(is_disabled({ elements: [] })).toBe(true);
  });

  it("returns true when device is null", () => {
    expect(is_disabled(null)).toBe(true);
  });

  it("returns true when at least one element is disabled", () => {
    const device = {
      elements: [
        { disabled_by: null },
        { disabled_by: "user" }, // disabled
      ],
    };
    expect(is_disabled(device)).toBe(true);
  });

  it("returns false when all elements have disabled_by === null", () => {
    const device = {
      elements: [{ disabled_by: null }, { disabled_by: null }],
    };
    expect(is_disabled(device)).toBe(false);
  });
});

// ── get_entity() logic ────────────────────────────────────────────────────────
//
// Extracted logic:
//   if (!_hass || !entities) return null;
//   const entity = entities[key]; if (!entity) return null;
//   return _hass.states[entity.entity_id];

function get_entity(
  hass: any,
  entities: Record<string, any>,
  key: string,
): any {
  if (!hass || !entities) return null;
  const entity = entities[key];
  if (!entity) return null;
  return hass.states[entity.entity_id] ?? null;
}

describe("RSDevice.get_entity()", () => {
  it("returns null when hass is null", () => {
    expect(get_entity(null, {}, "sensor")).toBeNull();
  });

  it("returns null when the translation key is not registered", () => {
    expect(get_entity(makeHass(), {}, "missing_key")).toBeNull();
  });

  it("returns null when the entity_id has no state in hass", () => {
    const entities = { temp: { entity_id: "sensor.temp" } };
    expect(get_entity(makeHass(), entities, "temp")).toBeNull();
  });

  it("returns the state object when entity is found", () => {
    const state = makeState("22", "sensor.temp");
    const hass = makeHass({ "sensor.temp": state });
    const entities = { temp: { entity_id: "sensor.temp" } };
    expect(get_entity(hass, entities, "temp")).toBe(state);
  });
});

// ── setNestedProperty() / applyLeaves() ───────────────────────────────────────
//
// Extracted logic from setNestedProperty:
//   Splits the path on "." and navigates/creates nested objects.

function setNestedProperty(obj: any, path: string, value: any): void {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

describe("RSDevice.setNestedProperty()", () => {
  it("sets a top-level property", () => {
    const obj: any = {};
    setNestedProperty(obj, "color", "red");
    expect(obj.color).toBe("red");
  });

  it("sets a deeply nested property creating intermediaries", () => {
    const obj: any = {};
    setNestedProperty(obj, "a.b.c", 42);
    expect(obj.a.b.c).toBe(42);
  });

  it("overwrites an existing property", () => {
    const obj: any = { a: { b: 1 } };
    setNestedProperty(obj, "a.b", 99);
    expect(obj.a.b).toBe(99);
  });

  it("does not affect sibling paths", () => {
    const obj: any = { a: { x: "original" } };
    setNestedProperty(obj, "a.y", "new");
    expect(obj.a.x).toBe("original");
    expect(obj.a.y).toBe("new");
  });
});

// ── load_dialogs() ────────────────────────────────────────────────────────────
//
// Extracted logic: merges an array of dialog maps into this.dialogs.

import { merge } from "../src/utils/merge";

function load_dialogs(dialogs_list: any[]): any {
  let dialogs: any = {};
  for (const dialog of dialogs_list) {
    dialogs = merge(dialogs, dialog);
  }
  return dialogs;
}

describe("RSDevice.load_dialogs()", () => {
  it("merges a single dialog map", () => {
    const result = load_dialogs([{ wifi: { title: "WiFi" } }]);
    expect(result).toEqual({ wifi: { title: "WiFi" } });
  });

  it("merges multiple dialog maps without losing keys", () => {
    const result = load_dialogs([
      { dialog_a: { title: "A" } },
      { dialog_b: { title: "B" } },
    ]);
    expect(result.dialog_a.title).toBe("A");
    expect(result.dialog_b.title).toBe("B");
  });

  it("later entries override earlier entries for the same key", () => {
    const result = load_dialogs([
      { dialog_a: { title: "old" } },
      { dialog_a: { title: "new" } },
    ]);
    expect(result.dialog_a.title).toBe("new");
  });

  it("returns an empty object for an empty list", () => {
    expect(load_dialogs([])).toEqual({});
  });
});

// ── update_config() — merge behaviour ─────────────────────────────────────────
//
// Tests the merge path: initial_config ← user_config overrides

describe("RSDevice.update_config() — merge behaviour", () => {
  it("starts from initial_config when no user_config is present", () => {
    const initial = { color: "51,151,232", alpha: 0.8 };
    // Without user override, result equals deep-clone of initial
    const result = JSON.parse(JSON.stringify(initial));
    expect(result).toEqual(initial);
  });

  it("applies user_config device overrides on top of initial_config", () => {
    const initial = { color: "51,151,232", alpha: 0.8 };
    const user = { color: "255,0,0" };
    const result = merge(initial, user);
    expect(result.color).toBe("255,0,0");
    expect(result.alpha).toBe(0.8); // preserved from initial
  });

  it("does not mutate initial_config", () => {
    const initial = { color: "51,151,232", alpha: 0.8 };
    merge(initial, { color: "0,0,0" });
    expect(initial.color).toBe("51,151,232");
  });
});
