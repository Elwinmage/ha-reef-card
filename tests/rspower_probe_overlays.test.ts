/**
 * Tests for the probe helpers of the RSPower strip.
 *
 * Two groups of predicates drive the strip picture:
 *   - the local temperature probe, on the strip: whether one is installed,
 *     and whether it has gone silent (the picture then blinks);
 *   - the sensor-mode overlay, on each socket: which icon stands for the
 *     probe controlling that socket.
 *
 * They are evaluated by the mapping on every render, often before Home
 * Assistant has delivered every entity, so a missing entity must read as a
 * plain "no" rather than throw.
 *
 * The socket overlays are evaluated with `device` bound to the PowerSocket,
 * not to the strip: a last group checks that every `device.xxx()` call of
 * the socket templates exists on PowerSocket, for both models.
 *
 * Covers: src/devices/redsea/rspower/rspower.ts
 *         src/devices/redsea/rspower/power_socket.ts
 *         src/devices/redsea/rspower/rspower6.mapping.ts
 *         src/devices/redsea/rspower/rspower8.mapping.ts
 */

import { describe, expect, it, vi } from "vitest";
import { RSPower } from "../src/devices/redsea/rspower/rspower";
import { PowerSocket } from "../src/devices/redsea/rspower/power_socket";
import { config as config6 } from "../src/devices/redsea/rspower/rspower6.mapping";
import { config2 as config8 } from "../src/devices/redsea/rspower/rspower8.mapping";

class StubRSPowerProbes extends RSPower {}
if (!customElements.get("stub-rspower-probes"))
  customElements.define("stub-rspower-probes", StubRSPowerProbes);

class StubPowerSocketProbes extends PowerSocket {}
if (!customElements.get("stub-power-socket-probes"))
  customElements.define("stub-power-socket-probes", StubPowerSocketProbes);

// ─── Helpers ────────────────────────────────────────────────────────────────

/** An RSPower whose strip-level entities report the given states. */
function makeStrip(states: Record<string, string | null>): any {
  const dev = new StubRSPowerProbes() as any;
  dev.entities = {};
  const hass_states: Record<string, any> = {};
  for (const [key, state] of Object.entries(states)) {
    if (state === null) continue;
    dev.entities[key] = { entity_id: `sensor.${key}` };
    hass_states[`sensor.${key}`] = { state };
  }
  dev._hass = { states: hass_states, entities: {}, callService: vi.fn() };
  return dev;
}

/**
 * A PowerSocket whose socket_mode / socket_prev_mode entities report the
 * given states. A null state leaves the entity out entirely.
 */
function makeSocket(
  mode: string | null,
  sensorConfig: any = undefined,
  prevMode: string | null = null,
): any {
  const socket = new StubPowerSocketProbes() as any;
  socket.entities = {};
  const states: Record<string, any> = {};
  if (mode !== null) {
    socket.entities.socket_mode = { entity_id: "sensor.socket_1_mode" };
    states["sensor.socket_1_mode"] = {
      state: mode,
      attributes: { sensor_config: sensorConfig },
    };
  }
  if (prevMode !== null) {
    socket.entities.socket_prev_mode = { entity_id: "sensor.socket_1_prev" };
    states["sensor.socket_1_prev"] = { state: prevMode };
  }
  socket._hass = { states, entities: {}, callService: vi.fn() };
  return socket;
}

/** A sensor_config attribute for the given probe type. */
function probe(type: string): any {
  return { sensor: { app_cache: type, default_state: false }, value: 1 };
}

// ─── Local temperature probe ────────────────────────────────────────────────

describe("RSPower.has_temperature_link", () => {
  it("is true when the probe removal entity is available", () => {
    expect(
      makeStrip({ remove_temperature: "unknown" }).has_temperature_link(),
    ).toBe(true);
  });

  it("is false when the probe removal entity is unavailable", () => {
    expect(
      makeStrip({ remove_temperature: "unavailable" }).has_temperature_link(),
    ).toBe(false);
  });

  it("does not throw before the entity is known", () => {
    // Read before hass delivered the entity: must not take the card down
    const dev = makeStrip({});
    expect(() => dev.has_temperature_link()).not.toThrow();
    expect(dev.has_temperature_link()).toBe(true);
  });
});

describe("RSPower.temperature_link_alert", () => {
  it("is false for a connected probe reporting a value", () => {
    expect(
      makeStrip({
        status_temperature: "connected",
        power_temperature: "25.2",
      }).temperature_link_alert(),
    ).toBe(false);
  });

  it("is true for a disconnected probe", () => {
    expect(
      makeStrip({
        status_temperature: "disconnected",
        power_temperature: "25.2",
      }).temperature_link_alert(),
    ).toBe(true);
  });

  it("is true for a probe that stopped reporting", () => {
    expect(
      makeStrip({
        status_temperature: "connected",
        power_temperature: "unknown",
      }).temperature_link_alert(),
    ).toBe(true);
  });

  it("stays quiet without any probe entity", () => {
    expect(makeStrip({}).temperature_link_alert()).toBe(false);
  });
});

// ─── Sensor-mode overlay ────────────────────────────────────────────────────

describe("PowerSocket.sensor_main_icon", () => {
  it.each([
    ["ph", "mdi:ph"],
    ["orp", "mdi:lightning-bolt-circle"],
    ["ec", "mdi:water-percent"],
    ["ato", "mdi:waves-arrow-up"],
    ["leak", "mdi:water-alert"],
  ])("shows the %s probe icon", (type, icon) => {
    expect(makeSocket("sensor", probe(type)).sensor_main_icon()).toBe(icon);
  });

  it("has no main icon for a temperature probe", () => {
    // The static mode icon already shows a thermometer for it
    expect(makeSocket("sensor", probe("temperature")).sensor_main_icon()).toBe(
      "",
    );
  });

  it("keeps the icon while a sensor socket is forced on or off", () => {
    expect(makeSocket("on", probe("orp"), "sensor").sensor_main_icon()).toBe(
      "mdi:lightning-bolt-circle",
    );
  });

  it("follows this socket only, not the first one in sensor mode", () => {
    const ph = makeSocket("sensor", probe("ph"));
    const plain = makeSocket("on", probe("ph"), "schedule");
    expect(ph.sensor_main_icon()).toBe("mdi:ph");
    expect(plain.sensor_main_icon()).toBe("");
  });

  it("has no icon without a usable sensor configuration", () => {
    for (const cfg of [undefined, null, {}, { app_cache: "ph" }, probe("")]) {
      expect(makeSocket("sensor", cfg).sensor_main_icon()).toBe("");
    }
  });

  it("has no icon when only the previous mode is known", () => {
    // Previous mode says sensor, but no socket_mode entity to read the
    // probe type from
    expect(makeSocket(null, undefined, "sensor").sensor_main_icon()).toBe("");
  });

  it("has no icon before hass or the entities are known", () => {
    const socket = makeSocket("sensor", probe("ph"));
    socket._hass = null;
    expect(socket.sensor_main_icon()).toBe("");
    expect(makeSocket(null).sensor_main_icon()).toBe("");
  });
});

// ─── Socket templates against PowerSocket ───────────────────────────────────

/** Every `device.name(` call found in a mapping subtree. */
function deviceCalls(node: any, out: Set<string> = new Set()): Set<string> {
  if (typeof node === "string") {
    for (const m of node.matchAll(/\bdevice\.([A-Za-z_]\w*)\s*\(/g)) {
      out.add(m[1]);
    }
  } else if (node && typeof node === "object" && !(node instanceof URL)) {
    Object.values(node).forEach((v) => deviceCalls(v, out));
  }
  return out;
}

describe.each([
  ["RSPOWER6", config6],
  ["RSPOWER8", config8],
])("%s socket templates", (_model, config: any) => {
  it("only call methods that exist on PowerSocket", () => {
    const calls = deviceCalls(config.sockets);
    expect(calls.size).toBeGreaterThan(0);
    const missing = [...calls].filter(
      (name) => typeof (PowerSocket.prototype as any)[name] !== "function",
    );
    expect(missing).toEqual([]);
  });

  it("only call methods that exist on RSPower at strip level", () => {
    const missing = [...deviceCalls(config.elements)].filter(
      (name) => typeof (RSPower.prototype as any)[name] !== "function",
    );
    expect(missing).toEqual([]);
  });
});
