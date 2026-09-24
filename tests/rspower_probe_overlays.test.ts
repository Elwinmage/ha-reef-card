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
import { SafeEval } from "../src/utils/SafeEval";
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

describe("PowerSocket.auto_mode", () => {
  it.each(["schedule", "sensor"])("is the running %s mode", (mode) => {
    expect(makeSocket(mode).auto_mode()).toBe(mode);
  });

  it.each(["schedule", "sensor"])(
    "is the %s mode a manual on/off suspended",
    (prev) => {
      expect(makeSocket("on", undefined, prev).auto_mode()).toBe(prev);
      expect(makeSocket("off", undefined, prev).auto_mode()).toBe(prev);
    },
  );

  it("ignores the previous mode while an automatic mode runs", () => {
    // Moved from schedule to sensor: the schedule is kept on the device,
    // prev_mode says schedule, but the socket follows its probe
    expect(makeSocket("sensor", undefined, "schedule").auto_mode()).toBe(
      "sensor",
    );
    expect(makeSocket("schedule", undefined, "sensor").auto_mode()).toBe(
      "schedule",
    );
  });

  it("is empty for a manual, unset or unknown socket", () => {
    expect(makeSocket("on").auto_mode()).toBe("");
    expect(makeSocket("off", undefined, "on").auto_mode()).toBe("");
    expect(makeSocket("setup", undefined, "sensor").auto_mode()).toBe("");
    expect(makeSocket(null).auto_mode()).toBe("");
  });
});

describe("PowerSocket.sensor_type", () => {
  it("reads the local probe shape", () => {
    expect(makeSocket("sensor", probe("temperature")).sensor_type()).toBe(
      "temperature",
    );
  });

  it("reads the RSControl rule shape", () => {
    // Here `sensor` is the sub-sensor name, the type sits at the top level
    const rule = {
      number: 4,
      type: "ato",
      uid: "0x0097E",
      sensor: "temperature",
    };
    expect(makeSocket("sensor", rule).sensor_type()).toBe("ato");
  });

  it("is empty without a usable configuration", () => {
    for (const cfg of [
      undefined,
      null,
      "ph",
      {},
      { type: 3 },
      { sensor: {} },
    ]) {
      expect(makeSocket("sensor", cfg).sensor_type()).toBe("");
    }
    expect(makeSocket(null).sensor_type()).toBe("");
  });
});

describe("PowerSocket.sensor_reading", () => {
  it("is the temperature for a probe's temperature sub-sensor", () => {
    // subscription-info, socket 4: the ATO probe's temperature
    const rule = { type: "ato", uid: "0x0097E", sensor: "temperature" };
    expect(makeSocket("sensor", rule).sensor_reading()).toBe("temperature");
    // The probe itself is still an ATO one
    expect(makeSocket("sensor", rule).sensor_type()).toBe("ato");
  });

  it("is the probe type for its primary measurement", () => {
    // subscription-info, socket 5: the ATO water level
    const rule = { type: "ato", uid: "0x0024E", sensor: "primary" };
    expect(makeSocket("sensor", rule).sensor_reading()).toBe("ato");
    expect(makeSocket("sensor", probe("ph")).sensor_reading()).toBe("ph");
  });

  it("is empty without sensor configuration", () => {
    expect(makeSocket("sensor", undefined).sensor_reading()).toBe("");
    expect(makeSocket(null).sensor_reading()).toBe("");
  });
});

describe.each([
  ["RSPOWER6", config6],
  ["RSPOWER8", config8],
])("%s socket mode icon", (_model, config: any) => {
  /** An element of the socket templates, by key. */
  function elementOf(node: any, key: string): any {
    if (node && typeof node === "object") {
      if (node[key]) return node[key];
      for (const v of Object.values(node)) {
        const found = elementOf(v, key);
        if (found) return found;
      }
    }
    return null;
  }

  function evalCtx(mode: string, cfg: any, prev: string | null): SafeEval {
    const socket = makeSocket(mode, cfg, prev);
    const entity: Record<string, any> = {};
    for (const [key, ent] of Object.entries<any>(socket.entities)) {
      entity[key] = socket._hass.states[ent.entity_id];
    }
    return new SafeEval({ entity, device: socket } as any);
  }

  function render(mode: string, cfg: any, prev: string | null = null): string {
    return evalCtx(mode, cfg, prev).evaluate(
      elementOf(config.sockets, "socket_mode_icon_static").icon,
    );
  }

  /** Whether the clock (schedule) and probe icons are hidden. */
  function hidden(mode: string, prev: string | null): [boolean, boolean] {
    const ctx = evalCtx(mode, probe("ph"), prev);
    return [
      ctx.evaluateCondition(
        elementOf(config.sockets, "socket_mode_icon").disabled_if,
      ),
      ctx.evaluateCondition(
        elementOf(config.sockets, "socket_mode_icon_static").disabled_if,
      ),
    ];
  }

  it("shows a thermometer for the temperature of a pH, EC or ATO probe", () => {
    for (const type of ["ph", "ec", "ato"]) {
      expect(
        render("sensor", { type, uid: "0x1", sensor: "temperature" }),
      ).toBe("mdi:thermometer");
    }
    expect(
      render("sensor", { type: "ato", uid: "0x1", sensor: "primary" }),
    ).toBe("mdi:cup-water");
  });

  it("shows the probe, not the clock, of a socket moved from schedule", () => {
    expect(render("sensor", probe("ph"), "schedule")).toBe("mdi:ph");
    expect(hidden("sensor", "schedule")).toEqual([true, false]);
  });

  it("shows the clock of a schedule, running or suspended", () => {
    expect(hidden("schedule", "sensor")).toEqual([false, true]);
    expect(hidden("off", "schedule")).toEqual([false, true]);
  });

  it("has no second icon row under the sockets", () => {
    expect(elementOf(config.sockets, "socket_sensor_main_icon")).toBeNull();
  });

  it("shows the probe type of a local or a hub probe", () => {
    expect(render("sensor", probe("temperature"))).toBe("mdi:thermometer");
    expect(
      render("sensor", { type: "ph", uid: "0x00B39", sensor: "primary" }),
    ).toBe("mdi:ph");
    expect(render("on", { type: "orp", uid: "0x1" }, "sensor")).toBe(
      "mdi:flash-triangle",
    );
  });

  it("shows the power icon outside sensor mode or for an unknown type", () => {
    expect(render("on", probe("ph"))).toBe("mdi:power");
    expect(render("sensor", {})).toBe("mdi:power");
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
