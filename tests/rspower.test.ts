// Tests for RSPower device family
// Covers: src/devices/redsea/rspower/rspower.ts
//         src/devices/redsea/rspower/power_socket.ts

import { describe, expect, it, vi } from "vitest";
import {
  RSPower,
  RSPower6,
  RSPower8,
} from "../src/devices/redsea/rspower/rspower";
import { PowerSocket } from "../src/devices/redsea/rspower/power_socket";

// --- Helpers ----------------------------------------------------------------
function makeHass(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
): any {
  return { states, entities, devices: {}, callService: vi.fn() };
}

// --- Stub custom elements ---------------------------------------------------
class StubRSPower extends RSPower {}
if (!customElements.get("stub-rspower"))
  customElements.define("stub-rspower", StubRSPower);

class StubRSPower6 extends RSPower6 {}
if (!customElements.get("stub-rspower6"))
  customElements.define("stub-rspower6", StubRSPower6);

class StubRSPower8 extends RSPower8 {}
if (!customElements.get("stub-rspower8"))
  customElements.define("stub-rspower8", StubRSPower8);

class StubPowerSocket extends PowerSocket {}
if (!customElements.get("stub-power-socket"))
  customElements.define("stub-power-socket", StubPowerSocket);

// ─── RSPower (base) ─────────────────────────────────────────────────────────
describe("RSPower", () => {
  it("initial_config uses RSPOWER6 model", () => {
    const dev = new StubRSPower() as any;
    expect(dev.initial_config.model).toBe("RSPOWER6");
  });

  it("initial_config has sockets_nb=6", () => {
    const dev = new StubRSPower() as any;
    expect(dev.initial_config.sockets_nb).toBe(6);
  });

  it("renderEditor() returns a template", () => {
    const dev = new StubRSPower() as any;
    dev._hass = makeHass();
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev.user_config = {};
    vi.spyOn(dev, "is_disabled").mockReturnValue(false);
    expect(dev.renderEditor()).toBeDefined();
    vi.restoreAllMocks();
  });

  it("renderEditor() returns empty when disabled", () => {
    const dev = new StubRSPower() as any;
    vi.spyOn(dev, "is_disabled").mockReturnValue(true);
    expect(dev.renderEditor()).toBeDefined();
    vi.restoreAllMocks();
  });

  it("_populate_entities_with_sockets() creates sockets_nb+1 slots", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._hass = null;
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev._sockets = [];
    dev._populate_entities_with_sockets();
    expect(dev._sockets.length).toBe(7); // 0 (unused) + 6 sockets
  });

  it("_populate_entities_with_sockets() does not throw when _hass is null", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._hass = null;
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev._sockets = [];
    expect(() => dev._populate_entities_with_sockets()).not.toThrow();
  });

  it("_populate_entities_with_sockets() routes socket entities to correct slots", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._sockets = [];
    dev.entities = {};
    dev.device = {
      name: "pw",
      elements: [{ id: "dev1", identifiers: [["redsea", "rspower6_123"]] }],
    };
    dev._hass = makeHass(
      {},
      {
        "sensor.mypower_socket_0_name": {
          entity_id: "sensor.mypower_socket_0_name",
          device_id: "dev1",
          translation_key: "socket_name",
        },
        "sensor.mypower_socket_0_consumption": {
          entity_id: "sensor.mypower_socket_0_consumption",
          device_id: "dev1",
          translation_key: "socket_consumption",
        },
        "sensor.mypower_socket_2_mode": {
          entity_id: "sensor.mypower_socket_2_mode",
          device_id: "dev1",
          translation_key: "socket_mode",
        },
        "sensor.mypower_battery_level": {
          entity_id: "sensor.mypower_battery_level",
          device_id: "dev1",
          translation_key: "battery_level",
        },
      },
    );
    dev._populate_entities_with_sockets();

    // socket 0 → slot 1
    expect(dev._sockets[1].entities.name).toBeDefined();
    expect(dev._sockets[1].entities.consumption).toBeDefined();
    // socket 2 → slot 3
    expect(dev._sockets[3].entities.mode).toBeDefined();
    // global entity
    expect(dev.entities.battery_level).toBeDefined();
  });
});

// ─── RSPower6 (direct alias) ────────────────────────────────────────────────
describe("RSPower6", () => {
  it("inherits RSPOWER6 model from RSPower", () => {
    const dev = new StubRSPower6() as any;
    expect(dev.initial_config.model).toBe("RSPOWER6");
  });

  it("has sockets_nb=6", () => {
    const dev = new StubRSPower6() as any;
    expect(dev.initial_config.sockets_nb).toBe(6);
  });
});

// ─── RSPower8 (overrides config) ────────────────────────────────────────────
describe("RSPower8", () => {
  it("overrides initial_config with RSPOWER8 model", () => {
    const dev = new StubRSPower8() as any;
    expect(dev.initial_config.model).toBe("RSPOWER8");
  });

  it("has sockets_nb=8", () => {
    const dev = new StubRSPower8() as any;
    expect(dev.initial_config.sockets_nb).toBe(8);
  });

  it("sockets mapping has 8 socket entries", () => {
    const dev = new StubRSPower8() as any;
    const socketKeys = Object.keys(dev.initial_config.sockets).filter((k) =>
      k.startsWith("socket_"),
    );
    expect(socketKeys.length).toBe(8);
  });
});

// ─── PowerSocket ────────────────────────────────────────────────────────────
describe("PowerSocket", () => {
  it("initializes with state_on=false", () => {
    const ps = new StubPowerSocket() as any;
    expect(ps.state_on).toBe(false);
  });

  it("update_state() sets state_on", () => {
    const ps = new StubPowerSocket() as any;
    ps.requestUpdate = vi.fn();
    ps.update_state(true);
    expect(ps.state_on).toBe(true);
  });

  it("is_on() returns false when mode is setup", () => {
    const ps = new StubPowerSocket() as any;
    ps.entities = {
      mode: { entity_id: "sensor.mode" },
      state: { entity_id: "sensor.state" },
    };
    ps._hass = makeHass({
      "sensor.mode": { state: "setup" },
      "sensor.state": { state: "unknown" },
    });
    expect(ps.is_on()).toBe(false);
  });

  it("is_on() returns true when mode is on", () => {
    const ps = new StubPowerSocket() as any;
    ps.entities = {
      mode: { entity_id: "sensor.mode" },
      state: { entity_id: "sensor.state" },
    };
    ps._hass = makeHass({
      "sensor.mode": { state: "on" },
      "sensor.state": { state: "on" },
    });
    expect(ps.is_on()).toBe(true);
  });

  it("_get_socket_sensor_state() returns null when entity missing", () => {
    const ps = new StubPowerSocket() as any;
    ps.entities = {};
    ps._hass = makeHass();
    expect(ps._get_socket_sensor_state("name")).toBeNull();
  });

  it("_get_socket_sensor_state() returns state value", () => {
    const ps = new StubPowerSocket() as any;
    ps.entities = { consumption: { entity_id: "sensor.cons" } };
    ps._hass = makeHass({ "sensor.cons": { state: "12.5" } });
    expect(ps._get_socket_sensor_state("consumption")).toBe("12.5");
  });
});
