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
// Registers every device tag: linked_device_image resolves a model to its
// registered element to borrow that mapping's picture.
import "../src/devices/index";

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

// ─── Socket links (card editor) ─────────────────────────────────────────────

/** An RSPower ready to render its editor form, with a device registry. */
function makeEditorPower(
  sockets_nb = 2,
  registry: Record<string, any> = {},
  user_config: any = {},
): any {
  const dev = new StubRSPower() as any;
  dev.config = { ...dev.config, model: "RSPOWER6", sockets_nb, sockets: {} };
  dev.user_config = user_config;
  dev.device = { name: "Power strip", elements: [{ id: "own" }] };
  dev.entities = {};
  dev._sockets = [];
  dev._hass = {
    states: {},
    entities: {},
    devices: registry,
    callService: vi.fn(),
  };
  return dev;
}

const led = { id: "d-led", name: "ReefLed", identifiers: [["redsea", "led"]] };

describe("RSPower.linked_device_id", () => {
  it("reads the device linked to a socket", () => {
    const dev = makeEditorPower();
    dev.config.sockets = { socket_2: { linked_device: "d-led" } };

    expect(dev.linked_device_id(2)).toBe("d-led");
  });

  it("returns null for a socket with no link", () => {
    const dev = makeEditorPower();
    expect(dev.linked_device_id(1)).toBeNull();
  });

  it("treats an empty link as no link", () => {
    const dev = makeEditorPower();
    dev.config.sockets = { socket_1: { linked_device: "" } };

    expect(dev.linked_device_id(1)).toBeNull();
  });
});

describe("RSPower socket link editor", () => {
  /**
   * Flatten a lit template to text.
   *
   * Strings and values are interleaved, not concatenated in two blocks:
   * an interpolated attribute such as id="linked_device_${n}" is only
   * contiguous in the output if the pieces stay in source order.
   */
  function markup(result: any): string {
    if (result === null || result === undefined || result === false) return "";
    if (Array.isArray(result)) return result.map(markup).join("");
    if (typeof result === "object" && "strings" in result) {
      const strings = result.strings as string[];
      const values = result.values as any[];
      return strings
        .map((chunk, i) => chunk + (i < values.length ? markup(values[i]) : ""))
        .join("");
    }
    return String(result);
  }

  it("renders one picker per socket", () => {
    const dev = makeEditorPower(3, { "d-led": led });

    const out = markup(dev._editor_socket_links());

    expect(out).toContain("linked_device_1");
    expect(out).toContain("linked_device_2");
    expect(out).toContain("linked_device_3");
    expect(out).not.toContain("linked_device_4");
  });

  it("offers the linkable devices as options", () => {
    const dev = makeEditorPower(1, { "d-led": led });

    expect(markup(dev._editor_socket_links())).toContain("ReefLed");
  });

  it("leaves the strip itself out of its own pickers", () => {
    const dev = makeEditorPower(1, {
      own: { id: "own", name: "Power strip", identifiers: [["redsea", "p"]] },
      "d-led": led,
    });

    const out = markup(dev._editor_socket_links());

    expect(out).toContain("ReefLed");
    expect(out).not.toContain("Power strip");
  });

  it("labels a socket with its own name when it has one", () => {
    const dev = makeEditorPower(1, {});
    dev._sockets = [null, { entities: { name: { entity_id: "sensor.s1" } } }];
    dev._hass.states["sensor.s1"] = { state: "Refugium light" };

    expect(markup(dev._editor_socket_links())).toContain("Refugium light");
  });

  it("renders a picker for a strip with no socket count", () => {
    const dev = makeEditorPower(0, {});
    expect(markup(dev._editor_socket_links())).not.toContain("linked_device_1");
  });
});

describe("RSPower socket link persistence", () => {
  function changeLink(dev: any, socket: number, value: string): any {
    const seen: any[] = [];
    dev.addEventListener("config-changed", (e: any) => seen.push(e.detail));
    dev._handle_socket_link_change(socket, { target: { value } } as any);
    return seen[0]?.config;
  }

  it("stores the chosen device under its socket", () => {
    const dev = makeEditorPower();

    const config = changeLink(dev, 2, "d-led");

    expect(
      config.conf.RSPOWER6.devices["Power strip"].sockets.socket_2
        .linked_device,
    ).toBe("d-led");
  });

  it("removes the key when the link is cleared", () => {
    // Storing an empty string instead would leave dead entries behind.
    const dev = makeEditorPower(
      2,
      {},
      {
        conf: {
          RSPOWER6: {
            devices: {
              "Power strip": {
                sockets: { socket_1: { linked_device: "d-led" } },
              },
            },
          },
        },
      },
    );

    const config = changeLink(dev, 1, "");

    expect(
      config.conf.RSPOWER6.devices["Power strip"].sockets.socket_1,
    ).not.toHaveProperty("linked_device");
  });

  it("keeps links set on the other sockets", () => {
    const dev = makeEditorPower(
      2,
      {},
      {
        conf: {
          RSPOWER6: {
            devices: {
              "Power strip": {
                sockets: { socket_1: { linked_device: "d-keep" } },
              },
            },
          },
        },
      },
    );

    const config = changeLink(dev, 2, "d-led");
    const sockets = config.conf.RSPOWER6.devices["Power strip"].sockets;

    expect(sockets.socket_1.linked_device).toBe("d-keep");
    expect(sockets.socket_2.linked_device).toBe("d-led");
  });

  it("does not alter the configuration object it was given", () => {
    const user_config = { conf: {} };
    const dev = makeEditorPower(1, {}, user_config);

    changeLink(dev, 1, "d-led");

    expect(user_config).toEqual({ conf: {} });
  });

  it("stays silent when the device has no name to key on", () => {
    const dev = makeEditorPower();
    dev.device = { elements: [{ id: "own" }] };
    const seen: any[] = [];
    dev.addEventListener("config-changed", (e: any) => seen.push(e));

    dev._handle_socket_link_change(1, { target: { value: "d-led" } } as any);

    expect(seen).toHaveLength(0);
  });
});

describe("RSPower socket link picker wiring", () => {
  /** Collect every function embedded in a lit template tree. */
  function handlers(result: any, found: any[] = []): any[] {
    if (typeof result === "function") found.push(result);
    else if (Array.isArray(result)) result.forEach((r) => handlers(r, found));
    else if (result && typeof result === "object" && "values" in result) {
      (result.values as any[]).forEach((v) => handlers(v, found));
    }
    return found;
  }

  it("the rendered picker persists the choice when it changes", () => {
    // Exercises the handler as the DOM would call it, not directly.
    const dev = makeEditorPower(1, { "d-led": led });
    const seen: any[] = [];
    dev.addEventListener("config-changed", (e: any) => seen.push(e.detail));

    const on_change = handlers(dev._editor_socket_links())[0];
    on_change({ target: { value: "d-led" } });

    expect(
      seen[0].config.conf.RSPOWER6.devices["Power strip"].sockets.socket_1
        .linked_device,
    ).toBe("d-led");
  });
});

describe("RSPower socket links — defensive paths", () => {
  it("renders no picker for a strip with no socket count configured", () => {
    const dev = makeEditorPower(1, {});
    delete dev.config.sockets_nb;

    const out = JSON.stringify(dev._editor_socket_links());

    expect(out).not.toContain("linked_device_1");
  });

  it("starts from an empty configuration when none exists yet", () => {
    const dev = makeEditorPower(1, {});
    dev.user_config = undefined;
    const seen: any[] = [];
    dev.addEventListener("config-changed", (e: any) => seen.push(e.detail));

    dev._handle_socket_link_change(1, { target: { value: "d-led" } } as any);

    expect(
      seen[0].config.conf.RSPOWER6.devices["Power strip"].sockets.socket_1
        .linked_device,
    ).toBe("d-led");
  });
});

// ─── Linked appliance thumbnail ─────────────────────────────────────────────

/** A strip with socket 1 linked to a device present in the registry. */
function makeLinkedPowerStrip(
  registry_device: any = null,
  entities: Record<string, any> = {},
  states: Record<string, any> = {},
): any {
  const dev = new StubRSPower() as any;
  dev.config = { ...dev.config, model: "RSPOWER6", sockets_nb: 2, sockets: {} };
  dev.device = { name: "Power strip", elements: [{ id: "own" }] };
  dev._hass = {
    states,
    entities,
    devices: registry_device ? { "d-led": registry_device } : {},
    callService: vi.fn(),
  };
  if (registry_device) {
    dev.config.sockets = { socket_1: { linked_device: "d-led" } };
  }
  return dev;
}

describe("RSPower.linked_device_image", () => {
  it("uses the socket-sized picture for the linked model", () => {
    // Not the model's own card artwork: those are full-size device shots,
    // and shrinking one to socket size reads as a smudge.
    const dev = makeLinkedPowerStrip({ id: "d-led", model: "RSPOWER6" });

    const image = dev.linked_device_image(1);

    expect(image).toContain("subdevices/");
    expect(image).toContain("rspower6.png");
  });

  it("pictures both LED generations from their own file", () => {
    const g1 = makeLinkedPowerStrip({ id: "d-led", model: "RSLED90" });
    const g2 = makeLinkedPowerStrip({ id: "d-led", model: "RSLED115" });

    expect(g1.linked_device_image(1)).toContain("rsledG1.png");
    expect(g2.linked_device_image(1)).toContain("rsledG2.png");
  });

  it("handles a model whose name carries a plus sign", () => {
    const dev = makeLinkedPowerStrip({ id: "d-led", model: "RSATO+" });

    expect(dev.linked_device_image(1)).toContain("rsato.png");
  });

  it("returns null when nothing is linked", () => {
    const dev = makeLinkedPowerStrip();
    expect(dev.linked_device_image(1)).toBeNull();
  });

  it("returns null when the linked device left the registry", () => {
    const dev = makeLinkedPowerStrip({ id: "d-led", model: "RSPOWER6" });
    dev._hass.devices = {};

    expect(dev.linked_device_image(1)).toBeNull();
  });

  it("returns null for a device reporting no model", () => {
    const dev = makeLinkedPowerStrip({ id: "d-led" });
    expect(dev.linked_device_image(1)).toBeNull();
  });

  it("returns null for a model with no picture of its own", () => {
    // Aqua Medic and MQTT appliances have none yet.
    const dev = makeLinkedPowerStrip({ id: "d-led", model: "DCSKIMMER" });

    expect(dev.linked_device_image(1)).toBeNull();
  });
});

describe("RSPower.linked_device_mode", () => {
  const mode_entity = {
    "sensor.mode": {
      device_id: "d-led",
      translation_key: "mode",
      entity_id: "sensor.mode",
    },
  };

  it("reads the mode of the linked device", () => {
    const dev = makeLinkedPowerStrip(
      { id: "d-led", model: "RSPOWER6" },
      mode_entity,
      { "sensor.mode": { state: "auto" } },
    );

    expect(dev.linked_device_mode(1)).toBe("auto");
  });

  it("ignores a mode entity belonging to another device", () => {
    const dev = makeLinkedPowerStrip(
      { id: "d-led", model: "RSPOWER6" },
      {
        "sensor.other": {
          device_id: "d-other",
          translation_key: "mode",
          entity_id: "sensor.other",
        },
      },
      { "sensor.other": { state: "auto" } },
    );

    expect(dev.linked_device_mode(1)).toBeNull();
  });

  it("returns null when the linked device exposes no mode", () => {
    const dev = makeLinkedPowerStrip({ id: "d-led", model: "RSPOWER6" });
    expect(dev.linked_device_mode(1)).toBeNull();
  });

  it("returns null when the mode entity has no state yet", () => {
    const dev = makeLinkedPowerStrip(
      { id: "d-led", model: "RSPOWER6" },
      mode_entity,
      {},
    );

    expect(dev.linked_device_mode(1)).toBeNull();
  });

  it("returns null when nothing is linked", () => {
    const dev = makeLinkedPowerStrip();
    expect(dev.linked_device_mode(1)).toBeNull();
  });

  it("returns null without an entity registry", () => {
    const dev = makeLinkedPowerStrip({ id: "d-led", model: "RSPOWER6" });
    dev._hass.entities = null;

    expect(dev.linked_device_mode(1)).toBeNull();
  });
});

describe("RSPower.linked_device_class", () => {
  function withMode(state: string | null): any {
    return makeLinkedPowerStrip(
      { id: "d-led", model: "RSPOWER6" },
      state === null
        ? {}
        : {
            "sensor.mode": {
              device_id: "d-led",
              translation_key: "mode",
              entity_id: "sensor.mode",
            },
          },
      state === null ? {} : { "sensor.mode": { state } },
    );
  }

  it("draws an appliance running on auto plainly", () => {
    expect(withMode("auto").linked_device_class(1)).toBe("");
  });

  it("greys an appliance that is switched off", () => {
    expect(withMode("off").linked_device_class(1)).toBe("linked-off");
  });

  it("blinks an appliance left in manual", () => {
    // Not following its schedule is worth noticing.
    expect(withMode("manual").linked_device_class(1)).toBe("blink-alert");
  });

  it("blinks an appliance whose mode cannot be read", () => {
    expect(withMode(null).linked_device_class(1)).toBe("blink-alert");
  });
});

describe("PowerSocket linked appliance", () => {
  it("delegates the picture to the strip, for its own socket", () => {
    const socket = new StubPowerSocket() as any;
    socket.socket_id = 2;
    socket.device = { linked_device_image: vi.fn(() => "img.png") };

    expect(socket.linked_image()).toBe("img.png");
    expect(socket.device.linked_device_image).toHaveBeenCalledWith(2);
  });

  it("delegates the state class to the strip", () => {
    const socket = new StubPowerSocket() as any;
    socket.socket_id = 1;
    socket.device = { linked_device_class: vi.fn(() => "linked-off") };

    expect(socket.linked_class()).toBe("linked-off");
  });

  it("delegates the navigation target to the strip", () => {
    const socket = new StubPowerSocket() as any;
    socket.socket_id = 3;
    socket.device = { linked_device_hwid: vi.fn(() => "hw-1") };

    expect(socket.linked_hwid()).toBe("hw-1");
    expect(socket.device.linked_device_hwid).toHaveBeenCalledWith(3);
  });

  it("reports nothing linked when it has no parent strip", () => {
    const socket = new StubPowerSocket() as any;
    socket.device = null;

    expect(socket.linked_image()).toBe("");
    expect(socket.linked_class()).toBe("");
    expect(socket.linked_hwid()).toBe("");
  });
});

describe("RSPower.linked_device_image — ReefRun channels", () => {
  /** A strip linked to a pump reporting the given role. */
  function linkedPump(role: string | null): any {
    const entities =
      role === null
        ? {}
        : {
            "sensor.type": {
              device_id: "d-led",
              translation_key: "type",
              entity_id: "sensor.type",
            },
          };
    return makeLinkedPowerStrip(
      { id: "d-led", model: "RSRUN" },
      entities,
      role === null ? {} : { "sensor.type": { state: role } },
    );
  }

  it("pictures a pump by the job it does, not by its controller", () => {
    // Both channels report the controller's model, so only the role tells
    // a skimmer from a return pump.
    expect(linkedPump("return").linked_device_image(1)).toContain(
      "rsreturn.png",
    );
    expect(linkedPump("skimmer").linked_device_image(1)).toContain(
      "rsskimmer.png",
    );
  });

  it("pictures two return pumps alike, with no skimmer in sight", () => {
    // A ReefRun may drive two return pumps: roles are read per pump, so
    // nothing assumes the two channels differ.
    const dev = makeLinkedPowerStrip(
      { id: "d-led", model: "RSRUN" },
      {
        "sensor.t1": {
          device_id: "d-led",
          translation_key: "type",
          entity_id: "sensor.t1",
        },
        "sensor.t2": {
          device_id: "d-other",
          translation_key: "type",
          entity_id: "sensor.t2",
        },
      },
      {
        "sensor.t1": { state: "return" },
        "sensor.t2": { state: "return" },
      },
    );
    dev._hass.devices["d-other"] = { id: "d-other", model: "RSRUN" };
    dev.config.sockets.socket_2 = { linked_device: "d-other" };

    expect(dev.linked_device_image(1)).toContain("rsreturn.png");
    expect(dev.linked_device_image(2)).toContain("rsreturn.png");
  });

  it("shows no picture for a pump whose role cannot be read", () => {
    expect(linkedPump(null).linked_device_image(1)).toBeNull();
  });

  it("shows no picture when the role entity has no state yet", () => {
    const dev = makeLinkedPowerStrip(
      { id: "d-led", model: "RSRUN" },
      {
        "sensor.type": {
          device_id: "d-led",
          translation_key: "type",
          entity_id: "sensor.type",
        },
      },
      {},
    );

    expect(dev.linked_device_image(1)).toBeNull();
  });

  it("shows no picture for an unconfigured channel", () => {
    expect(linkedPump("unknown").linked_device_image(1)).toBeNull();
  });

  it("shows no picture without an entity registry", () => {
    const dev = linkedPump("return");
    dev._hass.entities = null;

    expect(dev.linked_device_image(1)).toBeNull();
  });

  it("ignores a type entity belonging to another device", () => {
    const dev = makeLinkedPowerStrip(
      { id: "d-led", model: "RSRUN" },
      {
        "sensor.other": {
          device_id: "d-other",
          translation_key: "type",
          entity_id: "sensor.other",
        },
      },
      { "sensor.other": { state: "return" } },
    );

    expect(dev.linked_device_image(1)).toBeNull();
  });
});

// ─── Pending schedules ──────────────────────────────────────────────────────

describe("RSPower pending schedules", () => {
  const sent = [{ time: 0, duration: 60 }];
  const before = JSON.stringify({ intervals: [{ time: 0, duration: 30 }] });
  const after = JSON.stringify({ intervals: sent });

  function strip(): any {
    return new StubRSPower() as any;
  }

  it("holds a schedule the device has not read back yet", () => {
    // Showing the old programme would make the save look ignored.
    const dev = strip();
    dev.set_pending_schedule(0, sent, before);

    expect(dev.pending_schedule(0, before)).toEqual(sent);
  });

  it("drops the note once the device reports something else", () => {
    const dev = strip();
    dev.set_pending_schedule(0, sent, before);

    expect(dev.pending_schedule(0, after)).toBeNull();
  });

  it("keeps the device's word once it has caught up", () => {
    // Including when the device rejected the write and reports the old one.
    const dev = strip();
    dev.set_pending_schedule(0, sent, before);
    dev.pending_schedule(0, after);

    expect(dev.pending_schedule(0, before)).toBeNull();
  });

  it("holds nothing for a socket never written to", () => {
    expect(strip().pending_schedule(3, before)).toBeNull();
  });

  it("keeps one note per socket", () => {
    const dev = strip();
    const other = [{ time: 600, duration: 120 }];
    dev.set_pending_schedule(0, sent, before);
    dev.set_pending_schedule(1, other, before);

    expect(dev.pending_schedule(0, before)).toEqual(sent);
    expect(dev.pending_schedule(1, before)).toEqual(other);
  });

  it("forgets a note for a write that never happened", () => {
    // A failed write triggers no re-read, so nothing else would clear it.
    const dev = new StubRSPower() as any;
    const snap = JSON.stringify({ intervals: [] });
    dev.set_pending_schedule(0, [{ time: 0, duration: 60 }], snap);

    dev.clear_pending_schedule(0);

    expect(dev.pending_schedule(0, snap)).toBeNull();
  });

  it("forgetting a socket never written to is harmless", () => {
    const dev = new StubRSPower() as any;
    expect(() => dev.clear_pending_schedule(4)).not.toThrow();
  });

  it("replaces a note when the same socket is written again", () => {
    const dev = strip();
    const second = [{ time: 60, duration: 60 }];
    dev.set_pending_schedule(0, sent, before);
    dev.set_pending_schedule(0, second, before);

    expect(dev.pending_schedule(0, before)).toEqual(second);
  });
});

describe("RSPower.linked_device_hwid", () => {
  it("gives the hardware id of the linked device", () => {
    const dev = makeLinkedPowerStrip({
      id: "d-led",
      model: "RSLED90",
      model_id: "737225465317",
    });

    expect(dev.linked_device_hwid(1)).toBe("737225465317");
  });

  it("falls back to the redsea identifier when model_id is absent", () => {
    const dev = makeLinkedPowerStrip({
      id: "d-led",
      model: "RSLED90",
      identifiers: [["redsea", "111"]],
    });

    expect(dev.linked_device_hwid(1)).toBe("111");
  });

  it("ignores an identifier from another integration", () => {
    const dev = makeLinkedPowerStrip({
      id: "d-led",
      model: "RSLED90",
      identifiers: [["other", "111"]],
    });

    expect(dev.linked_device_hwid(1)).toBe("");
  });

  it("gives nothing when the socket has no link", () => {
    expect(makeLinkedPowerStrip().linked_device_hwid(1)).toBe("");
  });

  it("gives nothing when the linked device left the registry", () => {
    const dev = makeLinkedPowerStrip({ id: "d-led", model: "RSLED90" });
    dev._hass.devices = {};

    expect(dev.linked_device_hwid(1)).toBe("");
  });

  it("resolves a pump through its parent's id, which can draw it", () => {
    // Sub-devices carry the controller's hardware id.
    const dev = makeLinkedPowerStrip({
      id: "d-led",
      model: "RSRUN",
      model_id: "run-hwid",
    });

    expect(dev.linked_device_hwid(1)).toBe("run-hwid");
  });
});

// ─── Health of a pump, which has no mode ────────────────────────────────────

describe("RSPower.linked_device_class — ReefRun pumps", () => {
  /** A strip linked to a pump reporting the given state and no mode. */
  function pumpInState(state: string | null): any {
    const entities =
      state === null
        ? {}
        : {
            "sensor.state": {
              device_id: "d-led",
              translation_key: "state",
              entity_id: "sensor.state",
            },
          };
    return makeLinkedPowerStrip(
      { id: "d-led", model: "RSRUN" },
      entities,
      state === null ? {} : { "sensor.state": { state } },
    );
  }

  it("draws a pump running normally plainly", () => {
    // Mode lives on the controller; a pump reports its health as a state.
    expect(pumpInState("operational").linked_device_class(1)).toBe("");
  });

  it("blinks a pump in any other state", () => {
    expect(pumpInState("dry-run").linked_device_class(1)).toBe("blink-alert");
    expect(pumpInState("not-connected").linked_device_class(1)).toBe(
      "blink-alert",
    );
    expect(pumpInState("maintenance").linked_device_class(1)).toBe(
      "blink-alert",
    );
  });

  it("blinks when neither mode nor state can be read", () => {
    // A device disabled in Home Assistant exposes no entities at all.
    expect(pumpInState(null).linked_device_class(1)).toBe("blink-alert");
  });

  it("keeps reading the mode when the device has one", () => {
    const dev = makeLinkedPowerStrip(
      { id: "d-led", model: "RSLED90" },
      {
        "sensor.mode": {
          device_id: "d-led",
          translation_key: "mode",
          entity_id: "sensor.mode",
        },
        "sensor.state": {
          device_id: "d-led",
          translation_key: "state",
          entity_id: "sensor.state",
        },
      },
      {
        "sensor.mode": { state: "auto" },
        "sensor.state": { state: "dry-run" },
      },
    );

    expect(dev.linked_device_class(1)).toBe("");
  });
});

// ─── A pump whose device was disabled ───────────────────────────────────────

describe("RSPower.linked_device_image — role remembered at link time", () => {
  it("keeps picturing a pump whose device was disabled", () => {
    // A disabled device exposes no entities, so its role is unreadable and
    // the controller model has no picture of its own.
    const dev = makeLinkedPowerStrip({ id: "d-led", model: "RSRUN" });
    dev.config.sockets.socket_1.linked_role = "skimmer";

    expect(dev.linked_device_image(1)).toContain("rsskimmer.png");
  });

  it("prefers the role the device reports over the recorded one", () => {
    // A pump swapped for the other kind should not keep the old picture.
    const dev = makeLinkedPowerStrip(
      { id: "d-led", model: "RSRUN" },
      {
        "sensor.type": {
          device_id: "d-led",
          translation_key: "type",
          entity_id: "sensor.type",
        },
      },
      { "sensor.type": { state: "return" } },
    );
    dev.config.sockets.socket_1.linked_role = "skimmer";

    expect(dev.linked_device_image(1)).toContain("rsreturn.png");
  });

  it("shows no picture when no role was ever recorded", () => {
    const dev = makeLinkedPowerStrip({ id: "d-led", model: "RSRUN" });

    expect(dev.linked_device_image(1)).toBeNull();
  });
});

describe("RSPower socket link — recording the role", () => {
  function changeLinkOn(dev: any, socket: number, value: string): any {
    const seen: any[] = [];
    dev.addEventListener("config-changed", (e: any) => seen.push(e.detail));
    dev._handle_socket_link_change(socket, { target: { value } } as any);
    return seen[0]?.config?.conf?.RSPOWER6?.devices?.["Power strip"]?.sockets;
  }

  it("records the role of a pump being linked", () => {
    const dev = makeEditorPower(2, {});
    dev._hass.entities = {
      "sensor.type": {
        device_id: "d-pump",
        translation_key: "type",
        entity_id: "sensor.type",
      },
    };
    dev._hass.states["sensor.type"] = { state: "skimmer" };

    const sockets = changeLinkOn(dev, 1, "d-pump");

    expect(sockets.socket_1.linked_role).toBe("skimmer");
  });

  it("records no role for a device that reports none", () => {
    const dev = makeEditorPower(2, {});

    const sockets = changeLinkOn(dev, 1, "d-led");

    expect(sockets.socket_1).not.toHaveProperty("linked_role");
  });

  it("drops a stale role when the link is replaced", () => {
    const dev = makeEditorPower(
      2,
      {},
      {
        conf: {
          RSPOWER6: {
            devices: {
              "Power strip": {
                sockets: {
                  socket_1: { linked_device: "d-pump", linked_role: "skimmer" },
                },
              },
            },
          },
        },
      },
    );

    const sockets = changeLinkOn(dev, 1, "d-led");

    expect(sockets.socket_1).not.toHaveProperty("linked_role");
  });

  it("drops the role when the link is cleared", () => {
    const dev = makeEditorPower(
      2,
      {},
      {
        conf: {
          RSPOWER6: {
            devices: {
              "Power strip": {
                sockets: {
                  socket_1: { linked_device: "d-pump", linked_role: "return" },
                },
              },
            },
          },
        },
      },
    );

    const sockets = changeLinkOn(dev, 1, "");

    expect(sockets.socket_1).not.toHaveProperty("linked_role");
  });
});
