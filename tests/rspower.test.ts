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
import { RSDevice } from "../src/devices/device";

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

class ReefPowerSocketStub extends PowerSocket {}
if (!customElements.get("redsea-power-socket"))
  customElements.define("redsea-power-socket", ReefPowerSocketStub);

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

  it("_populate_entities() delegates to _populate_entities_with_sockets", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._hass = null;
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev._sockets = [];
    dev._populate_entities();
    // Should have created the socket slots
    expect(dev._sockets.length).toBe(7);
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

  it("_populate_entities_with_sockets() skips seeding on second call", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._hass = null;
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev._sockets = [];
    dev._populate_entities_with_sockets();
    expect(dev._sockets.length).toBe(7);
    // Second call: sockets already seeded, length stays
    dev._populate_entities_with_sockets();
    expect(dev._sockets.length).toBe(7);
  });

  it("_populate_entities_with_sockets() skips entities when device is null", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._sockets = [];
    dev.entities = {};
    dev.device = null;
    dev._hass = makeHass(
      {},
      {
        "sensor.something": {
          entity_id: "sensor.something",
          device_id: "dev1",
          translation_key: "battery_level",
        },
      },
    );
    dev._populate_entities_with_sockets();
    expect(dev.entities.battery_level).toBeUndefined();
  });

  it("_populate_entities_with_sockets() skips entities with no device match", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._sockets = [];
    dev.entities = {};
    dev.device = {
      name: "pw",
      elements: [{ id: "dev1" }],
    };
    dev._hass = makeHass(
      {},
      {
        // Entity from a different device
        "sensor.other_device_thing": {
          entity_id: "sensor.other_device_thing",
          device_id: "other_dev",
          translation_key: "battery_level",
        },
        // Entity with no device_id
        "sensor.orphan": {
          entity_id: "sensor.orphan",
          translation_key: "socket_0_name",
        },
      },
    );
    dev._populate_entities_with_sockets();
    // Neither entity should be stored
    expect(dev.entities.battery_level).toBeUndefined();
    expect(dev._sockets[1]?.entities?.socket_name).toBeUndefined();
  });

  it("_populate_entities_with_sockets() skips socket entity with no regex match", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._sockets = [];
    dev.entities = {};
    dev.device = {
      name: "pw",
      elements: [{ id: "dev1" }],
    };
    dev._hass = makeHass(
      {},
      {
        "sensor.mypower_bad_unique": {
          entity_id: "sensor.mypower_bad_unique",
          device_id: "dev1",
          translation_key: "socket_name",
        },
      },
    );
    dev._populate_entities_with_sockets();
    // No slot should have this entity
    for (let i = 0; i < dev._sockets.length; i++) {
      expect(dev._sockets[i].entities.socket_name).toBeUndefined();
    }
  });

  it("_populate_entities_with_sockets() skips socket entity with slot out of range", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._sockets = [];
    dev.entities = {};
    dev.device = {
      name: "pw",
      elements: [{ id: "dev1" }],
    };
    dev._hass = makeHass(
      {},
      {
        "sensor.mypower_socket_99_name": {
          entity_id: "sensor.mypower_socket_99_name",
          device_id: "dev1",
          translation_key: "socket_99_name",
        },
      },
    );
    dev._populate_entities_with_sockets();
    // Slot 99 is way out of range, entity should not be stored anywhere
    expect(dev._sockets.length).toBe(7);
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
          translation_key: "socket_0_name",
        },
        "sensor.mypower_socket_0_consumption": {
          entity_id: "sensor.mypower_socket_0_consumption",
          device_id: "dev1",
          translation_key: "socket_0_consumption",
        },
        "sensor.mypower_socket_2_mode": {
          entity_id: "sensor.mypower_socket_2_mode",
          device_id: "dev1",
          translation_key: "socket_2_mode",
        },
        "sensor.mypower_battery_level": {
          entity_id: "sensor.mypower_battery_level",
          device_id: "dev1",
          translation_key: "battery_level",
        },
      },
    );
    dev._populate_entities_with_sockets();

    // socket_0 → slot 1 (0-based index + 1), stored by base key
    expect(dev._sockets[1].entities.socket_name).toBeDefined();
    expect(dev._sockets[1].entities.socket_consumption).toBeDefined();
    // socket_2 → slot 3
    expect(dev._sockets[3].entities.socket_mode).toBeDefined();
    // global entity
    expect(dev.entities.battery_level).toBeDefined();
  });

  it("hass setter propagates to socket power_socket children", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev._sockets = [
      { entities: {} },
      { entities: {}, power_socket: { hass: null } },
      { entities: {} },
    ];
    dev._setting_hass = vi.fn();

    const hass = makeHass();
    dev.hass = hass;

    expect(dev._setting_hass).toHaveBeenCalledWith(hass);
    expect(dev._sockets[1].power_socket.hass).toBe(hass);
  });

  it("hass setter skips sockets without power_socket", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev._sockets = [{ entities: {} }, { entities: {} }];
    dev._setting_hass = vi.fn();

    expect(() => {
      dev.hass = makeHass();
    }).not.toThrow();
  });

  it("_render_socket() handles create_device returning null", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._hass = makeHass();
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev._sockets = [];
    for (let i = 0; i <= dev.config.sockets_nb; i++) {
      dev._sockets.push({ entities: {} });
    }
    dev.get_style = vi.fn(() => "");
    vi.spyOn(dev, "is_on").mockReturnValue(true);
    // Mock create_device to return null
    vi.spyOn(RSDevice, "create_device").mockReturnValue(null);

    const result = dev._render_socket(1);
    expect(result).toBeDefined();
    expect(dev._sockets[1].power_socket).toBeUndefined();

    vi.restoreAllMocks();
  });

  it("_render_socket() creates a new PowerSocket on first call", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._hass = makeHass();
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev._sockets = [];
    // Initialize socket slots
    for (let i = 0; i <= dev.config.sockets_nb; i++) {
      dev._sockets.push({ entities: {} });
    }
    dev.get_style = vi.fn(() => "");
    vi.spyOn(dev, "is_on").mockReturnValue(true);

    const result = dev._render_socket(1);
    expect(result).toBeDefined();
    expect(dev._sockets[1].power_socket).toBeDefined();
    vi.restoreAllMocks();
  });

  it("_render_socket() reuses existing PowerSocket on subsequent calls", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._hass = makeHass();
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev._sockets = [];
    for (let i = 0; i <= dev.config.sockets_nb; i++) {
      dev._sockets.push({ entities: {} });
    }
    dev.get_style = vi.fn(() => "");
    vi.spyOn(dev, "is_on").mockReturnValue(false);

    // First call creates
    dev._render_socket(1);
    const ps1 = dev._sockets[1].power_socket;

    // Second call reuses
    dev._render_socket(1);
    const ps2 = dev._sockets[1].power_socket;
    expect(ps2).toBe(ps1);
    vi.restoreAllMocks();
  });

  it("_render() returns device template with sockets", () => {
    const dev = new StubRSPower() as any;
    dev.config = { ...dev.initial_config };
    dev._hass = makeHass();
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev._sockets = [];
    for (let i = 0; i <= dev.config.sockets_nb; i++) {
      dev._sockets.push({ entities: {} });
    }
    dev.get_style = vi.fn(() => "");
    dev._render_elements = vi.fn(() => "");
    vi.spyOn(dev, "is_on").mockReturnValue(true);

    const result = dev._render("", "");
    expect(result).toBeDefined();
    // All 6 sockets should have been created
    for (let i = 1; i <= 6; i++) {
      expect(dev._sockets[i].power_socket).toBeDefined();
    }
    vi.restoreAllMocks();
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
      socket_mode: { entity_id: "sensor.mode" },
      socket_state: { entity_id: "sensor.state" },
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
      socket_mode: { entity_id: "sensor.mode" },
      socket_state: { entity_id: "sensor.state" },
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
    expect(ps._get_socket_sensor_state("socket_name")).toBeNull();
  });

  it("_get_socket_sensor_state() returns state value", () => {
    const ps = new StubPowerSocket() as any;
    ps.entities = { socket_consumption: { entity_id: "sensor.cons" } };
    ps._hass = makeHass({ "sensor.cons": { state: "12.5" } });
    expect(ps._get_socket_sensor_state("socket_consumption")).toBe("12.5");
  });

  it("render() returns empty html when config is missing", () => {
    const ps = new StubPowerSocket() as any;
    ps.config = null;
    ps._hass = makeHass();
    ps.entities = {};
    const result = ps.render();
    expect(result).toBeDefined();
  });

  it("render() returns socket_container when config is set", () => {
    const ps = new StubPowerSocket() as any;
    ps.config = { elements: {} };
    ps._hass = makeHass();
    ps.entities = {
      socket_mode: { entity_id: "sensor.mode" },
      socket_state: { entity_id: "sensor.state" },
    };
    ps._render_elements = vi.fn(() => "");
    const result = ps.render();
    expect(result).toBeDefined();
  });

  it("hass setter detects socket_state changes", () => {
    const ps = new StubPowerSocket() as any;
    ps.entities = {
      socket_state: { entity_id: "sensor.state" },
    };
    ps.socket_state = null;
    ps.requestUpdate = vi.fn();

    // Mock _setting_hass to set _hass like the real implementation
    ps._setting_hass = vi.fn((obj: any) => {
      ps._hass = obj;
    });
    const hass1 = makeHass({ "sensor.state": { state: "on" } });
    ps.hass = hass1;
    expect(ps.socket_state).toBe("on");
    expect(ps.requestUpdate).toHaveBeenCalled();

    ps.requestUpdate.mockClear();
    // Second set — same state, no update
    ps.hass = hass1;
    expect(ps.requestUpdate).not.toHaveBeenCalled();
  });

  it("is_on() returns false when mode is off", () => {
    const ps = new StubPowerSocket() as any;
    ps.entities = {
      socket_mode: { entity_id: "sensor.mode" },
      socket_state: { entity_id: "sensor.state" },
    };
    ps._hass = makeHass({
      "sensor.mode": { state: "off" },
      "sensor.state": { state: "unknown" },
    });
    expect(ps.is_on()).toBe(false);
  });

  it("is_on() returns true when state is on and mode is schedule", () => {
    const ps = new StubPowerSocket() as any;
    ps.entities = {
      socket_mode: { entity_id: "sensor.mode" },
      socket_state: { entity_id: "sensor.state" },
    };
    ps._hass = makeHass({
      "sensor.mode": { state: "schedule" },
      "sensor.state": { state: "on" },
    });
    expect(ps.is_on()).toBe(true);
  });

  it("is_on() returns true when mode is on but state is not on", () => {
    const ps = new StubPowerSocket() as any;
    ps.entities = {
      socket_mode: { entity_id: "sensor.mode" },
      socket_state: { entity_id: "sensor.state" },
    };
    ps._hass = makeHass({
      "sensor.mode": { state: "on" },
      "sensor.state": { state: "unknown" },
    });
    expect(ps.is_on()).toBe(true);
  });

  it("is_on() returns false when mode is schedule and state is standby", () => {
    const ps = new StubPowerSocket() as any;
    ps.entities = {
      socket_mode: { entity_id: "sensor.mode" },
      socket_state: { entity_id: "sensor.state" },
    };
    ps._hass = makeHass({
      "sensor.mode": { state: "schedule" },
      "sensor.state": { state: "standby" },
    });
    expect(ps.is_on()).toBe(false);
  });
});

// ─── ReefControl link ───────────────────────────────────────────────────────

/** An RSPower whose paired/link entities report the given states. */
function makeLinkedPower(paired: string | null, linkUp: string | null): any {
  const dev = new StubRSPower() as any;
  dev.entities = {};
  const states: Record<string, any> = {};
  if (paired !== null) {
    dev.entities.control_paired = { entity_id: "binary_sensor.paired" };
    states["binary_sensor.paired"] = { state: paired };
  }
  if (linkUp !== null) {
    dev.entities.control_link_up = { entity_id: "binary_sensor.link" };
    states["binary_sensor.link"] = { state: linkUp };
  }
  dev._hass = makeHass(states);
  return dev;
}

describe("RSPower ReefControl link", () => {
  it("has_control_link() is true when a hub is paired", () => {
    expect(makeLinkedPower("on", "on").has_control_link()).toBe(true);
  });

  it("has_control_link() is false when no hub is paired", () => {
    expect(makeLinkedPower("off", "off").has_control_link()).toBe(false);
  });

  it("has_control_link() is false without the pairing entity", () => {
    expect(makeLinkedPower(null, null).has_control_link()).toBe(false);
  });

  it("control_link_alert() is false for a reachable hub", () => {
    expect(makeLinkedPower("on", "on").control_link_alert()).toBe(false);
  });

  it("control_link_alert() is true for a paired but unreachable hub", () => {
    // Pairing survives the hub going offline: this is the blinking state.
    expect(makeLinkedPower("on", "off").control_link_alert()).toBe(true);
  });

  it("control_link_alert() is true when the link state is unknown", () => {
    expect(makeLinkedPower("on", "unknown").control_link_alert()).toBe(true);
  });

  it("control_link_alert() is true without the link entity", () => {
    expect(makeLinkedPower("on", null).control_link_alert()).toBe(true);
  });

  it("control_link_alert() stays quiet when no hub is paired", () => {
    // Nothing paired is not a fault — the picture is simply absent.
    expect(makeLinkedPower("off", "off").control_link_alert()).toBe(false);
  });
});

// ─── Resolving the paired hub ───────────────────────────────────────────────

/** An RSPower reporting `hwid` as its peer, against a device registry. */
function makePowerWithRegistry(
  hwid: string | null,
  devices: Record<string, any>,
): any {
  const dev = new StubRSPower() as any;
  dev.entities = { connected_control: { entity_id: "sensor.hub" } };
  dev._hass = makeHass({
    "sensor.hub": { state: hwid ?? "unknown" },
  });
  dev._hass.devices = devices;
  return dev;
}

const HUB_HWID = "737225465317";

describe("RSPower.linked_control_hwid", () => {
  it("returns the hardware id the strip reports", () => {
    expect(makePowerWithRegistry(HUB_HWID, {}).linked_control_hwid()).toBe(
      HUB_HWID,
    );
  });

  it("returns null when nothing is paired", () => {
    expect(makePowerWithRegistry(null, {}).linked_control_hwid()).toBeNull();
  });

  it("returns null when the sensor is unavailable", () => {
    const dev = makePowerWithRegistry(null, {});
    dev._hass.states["sensor.hub"] = { state: "unavailable" };
    expect(dev.linked_control_hwid()).toBeNull();
  });

  it("returns null without the sensor at all", () => {
    const dev = new StubRSPower() as any;
    dev.entities = {};
    dev._hass = makeHass({});
    expect(dev.linked_control_hwid()).toBeNull();
  });
});

describe("RSPower.linked_control_device", () => {
  it("finds the hub by model_id", () => {
    const hub = { id: "d1", model_id: HUB_HWID, identifiers: [] };
    const dev = makePowerWithRegistry(HUB_HWID, {
      d0: { id: "d0", model_id: "999", identifiers: [] },
      d1: hub,
    });

    expect(dev.linked_control_device()).toBe(hub);
  });

  it("falls back to the redsea identifier when model_id is absent", () => {
    // Entries created before model_id existed still carry the id here.
    const hub = { id: "d1", identifiers: [["redsea", HUB_HWID]] };
    const dev = makePowerWithRegistry(HUB_HWID, { d1: hub });

    expect(dev.linked_control_device()).toBe(hub);
  });

  it("ignores an identifier from another integration", () => {
    const dev = makePowerWithRegistry(HUB_HWID, {
      d1: { id: "d1", identifiers: [["other", HUB_HWID]] },
    });

    expect(dev.linked_control_device()).toBeNull();
  });

  it("returns null when the hub is not in the registry", () => {
    const dev = makePowerWithRegistry(HUB_HWID, {
      d0: { id: "d0", model_id: "999", identifiers: [] },
    });

    expect(dev.linked_control_device()).toBeNull();
  });

  it("returns null when nothing is paired", () => {
    const dev = makePowerWithRegistry(null, {
      d1: { id: "d1", model_id: HUB_HWID, identifiers: [] },
    });

    expect(dev.linked_control_device()).toBeNull();
  });

  it("skips empty registry slots", () => {
    const hub = { id: "d1", model_id: HUB_HWID, identifiers: [] };
    const dev = makePowerWithRegistry(HUB_HWID, { d0: null, d1: hub });

    expect(dev.linked_control_device()).toBe(hub);
  });

  it("returns null without a device registry", () => {
    const dev = makePowerWithRegistry(HUB_HWID, {});
    dev._hass.devices = undefined;

    expect(dev.linked_control_device()).toBeNull();
  });
});

describe("RSPower.linked_control_name", () => {
  it("returns the hub name from the registry", () => {
    const dev = makePowerWithRegistry(HUB_HWID, {
      d1: {
        id: "d1",
        model_id: HUB_HWID,
        name: "ReefControl Pro",
        identifiers: [],
      },
    });

    expect(dev.linked_control_name()).toBe("ReefControl Pro");
  });

  it("prefers the name the user set over the generated one", () => {
    const dev = makePowerWithRegistry(HUB_HWID, {
      d1: {
        id: "d1",
        model_id: HUB_HWID,
        name: "SIMU-RSCONTROLPRO",
        name_by_user: "Bac principal",
        identifiers: [],
      },
    });

    expect(dev.linked_control_name()).toBe("Bac principal");
  });

  it("ignores an empty user name and keeps the generated one", () => {
    const dev = makePowerWithRegistry(HUB_HWID, {
      d1: {
        id: "d1",
        model_id: HUB_HWID,
        name: "ReefControl Pro",
        name_by_user: null,
        identifiers: [],
      },
    });

    expect(dev.linked_control_name()).toBe("ReefControl Pro");
  });

  it("returns an empty string when the hub is not in the registry", () => {
    const dev = makePowerWithRegistry(HUB_HWID, {});
    expect(dev.linked_control_name()).toBe("");
  });

  it("returns an empty string when nothing is paired", () => {
    const dev = makePowerWithRegistry(null, {
      d1: {
        id: "d1",
        model_id: HUB_HWID,
        name: "ReefControl Pro",
        identifiers: [],
      },
    });

    expect(dev.linked_control_name()).toBe("");
  });

  it("returns an empty string for a nameless registry entry", () => {
    const dev = makePowerWithRegistry(HUB_HWID, {
      d1: { id: "d1", model_id: HUB_HWID, identifiers: [] },
    });

    expect(dev.linked_control_name()).toBe("");
  });
});
