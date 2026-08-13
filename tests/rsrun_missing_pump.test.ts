/**
 * Tests for the "pump disconnected" feedback:
 *   - RSPump.is_missing() reads the dashboard `missing_pump` flag
 *   - MyElement.get_class() evaluates a dynamic class expression
 *   - the pump body is greyed out while the pump is missing
 */

import { MyElement } from "../src/base/element";
import { RSPump } from "../src/devices/redsea/rsrun/rsrun_pump";
import { beforeEach, describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

if (!customElements.get("test-rspump")) {
  customElements.define("test-rspump", class extends RSPump {});
}
if (!customElements.get("test-myelement")) {
  customElements.define("test-myelement", class extends MyElement {});
}

function makeState(
  state: string,
  entity_id: string,
  attributes: Record<string, any> = {},
): any {
  return { entity_id, state, attributes };
}

/** Build an RSPump with a controllable set of entities */
function makePump(states: Record<string, any> = {}, entities?: string[]): any {
  const pump: any = new (customElements.get("test-rspump") as any)();
  pump.id = 1;
  pump.entities = {};
  for (const key of entities ?? Object.keys(states)) {
    pump.entities[key] = { entity_id: `sensor.${key}` };
  }
  pump.parent_entities = {
    device_state: { entity_id: "switch.device_state" },
  };
  const hassStates: Record<string, any> = {
    "switch.device_state": makeState("on", "switch.device_state"),
  };
  for (const [key, value] of Object.entries(states)) {
    hassStates[`sensor.${key}`] =
      typeof value === "object" && value !== null && "state" in value
        ? makeState(value.state, `sensor.${key}`, value.attributes ?? {})
        : makeState(String(value), `sensor.${key}`);
  }
  pump._hass = { states: hassStates, callService: vi.fn(), entities: {} };
  return pump;
}

//----------------------------------------------------------------------------//
//   is_missing()
//----------------------------------------------------------------------------//

describe("RSPump.is_missing", () => {
  it("is false when nothing reports a missing pump", () => {
    const pump = makePump({ state: "on", schedule_enabled: "on" });
    expect(pump.is_missing()).toBe(false);
  });

  it("reads the dedicated entity when present", () => {
    const pump = makePump({ missing_pump: "on" });
    expect(pump.is_missing()).toBe(true);
  });

  it("accepts the API string and boolean forms", () => {
    for (const value of ["on", "true", "True", "1", "yes"]) {
      expect(makePump({ missing_pump: value }).is_missing()).toBe(true);
    }
    for (const value of ["off", "false", "0", "unknown", "unavailable"]) {
      expect(makePump({ missing_pump: value }).is_missing()).toBe(false);
    }
  });

  it("falls back to the missing_pump attribute of the state sensor", () => {
    const pump = makePump({
      state: { state: "on", attributes: { missing_pump: true } },
    });
    expect(pump.is_missing()).toBe(true);
  });

  it("prefers the entity over the attribute", () => {
    const pump = makePump({
      missing_pump: "off",
      state: { state: "on", attributes: { missing_pump: true } },
    });
    expect(pump.is_missing()).toBe(false);
  });
});

//----------------------------------------------------------------------------//
//   Dynamic class
//----------------------------------------------------------------------------//

describe("MyElement.get_class", () => {
  let elt: any;

  beforeEach(() => {
    elt = new (customElements.get("test-myelement") as any)();
    elt.device = {
      entities: { missing_pump: { entity_id: "binary_sensor.missing" } },
      config: { color: "1,2,3", alpha: 1 },
      is_on: () => true,
      is_missing: () => false,
    };
    elt._hass = {
      states: {
        "binary_sensor.missing": makeState("off", "binary_sensor.missing"),
      },
    };
  });

  it("returns an empty string when no class is set", () => {
    elt.conf = { name: "x" };
    expect(elt.get_class()).toBe("");
  });

  it("returns a static class untouched", () => {
    elt.conf = { name: "x", class: "tube" };
    expect(elt.get_class()).toBe("tube");
  });

  it("evaluates a device method expression", () => {
    elt.conf = {
      name: "missing_pump",
      class: "${device.is_missing() ? 'blink-fast' : ''}",
    };
    expect(elt.get_class()).toBe("");

    elt.device.is_missing = () => true;
    expect(elt.get_class()).toBe("blink-fast");
  });

  it("evaluates an entity state expression", () => {
    elt.conf = {
      name: "missing_pump",
      class: "${entity.missing_pump.state === 'on' ? 'blink' : ''}",
    };
    expect(elt.get_class()).toBe("");

    elt._hass.states["binary_sensor.missing"] = makeState(
      "on",
      "binary_sensor.missing",
    );
    expect(elt.get_class()).toBe("blink");
  });

  it("never injects undefined when the expression breaks", () => {
    elt.conf = { name: "x", class: "${nope.boom(} " };
    expect(typeof elt.get_class()).toBe("string");
  });
});

//----------------------------------------------------------------------------//
//   Rendering
//----------------------------------------------------------------------------//

describe("Pump rendering while missing", () => {
  it("treats a missing pump as off", () => {
    const pump = makePump({
      state: "on",
      schedule_enabled: "on",
      missing_pump: "on",
    });
    expect(pump.is_pump_on()).toBe(true); // schedule is still enabled
    expect(pump.is_pump_on() && !pump.is_missing()).toBe(false);
  });

  it("re-renders the pump when missing_pump changes", () => {
    const pump = makePump({
      state: "on",
      schedule_enabled: "on",
      speed: "80",
      missing_pump: "off",
    });
    pump._elements = {};
    pump.to_render = false;

    const next = JSON.parse(JSON.stringify(pump._hass));
    next.states["sensor.missing_pump"].state = "on";
    pump._setting_hass(next);

    expect(pump.to_render).toBe(true);
  });

  it("refreshes dynamic-class elements when missing_pump changes", () => {
    const pump = makePump({
      state: "on",
      schedule_enabled: "on",
      missing_pump: "off",
    });
    const cable = {
      conf: { class: "${device.is_missing() ? 'x' : ''}" },
    } as any;
    cable.requestUpdate = vi.fn();
    const body = { conf: { class: "tube" } } as any;
    body.requestUpdate = vi.fn();
    pump._elements = { cable, body };

    const next = JSON.parse(JSON.stringify(pump._hass));
    next.states["sensor.missing_pump"].state = "on";
    pump._setting_hass(next);

    expect(cable.requestUpdate).toHaveBeenCalled();
    expect(body.requestUpdate).not.toHaveBeenCalled();
  });

  it("does not re-render when nothing changed", () => {
    const pump = makePump({
      state: "on",
      schedule_enabled: "on",
      missing_pump: "off",
    });
    pump._elements = {};
    pump.to_render = false;

    pump._setting_hass(JSON.parse(JSON.stringify(pump._hass)));
    expect(pump.to_render).toBe(false);
  });
});
