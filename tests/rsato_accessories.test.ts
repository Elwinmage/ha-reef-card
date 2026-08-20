/**
 * Tests for the RSATO+ optional accessories (ATO pump, leak probe).
 *
 * The signals were read off a real ReefATO+ `/dashboard` payload, not guessed:
 *   - the pump has no connectivity flag at all; presence and faults both come
 *     from the device-level `mode`
 *   - the leak probe has `connected` (plugged in), `enabled` (armed) and
 *     `status`, the latter already reduced to a PROBLEM binary sensor by the
 *     integration (`status !== "dry"`)
 */

import { RSAto } from "../src/devices/redsea/rsato/rsato";
import { config } from "../src/devices/redsea/rsato/rsato.mapping";
import { describe, expect, it, vi } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

if (!customElements.get("test-rsato")) {
  customElements.define("test-rsato", class extends RSAto {});
}

/**
 * Build an RSAto whose entity registry holds the given states.
 * An omitted key reproduces an entity the integration has not created, or one
 * that has not reported yet.
 */
function makeAto(states: Record<string, string> = {}): any {
  const device: any = new (customElements.get("test-rsato") as any)();
  device.entities = {};
  const hassStates: Record<string, any> = {};
  for (const [key, state] of Object.entries(states)) {
    const entity_id = `sensor.${key}`;
    device.entities[key] = { entity_id };
    hassStates[entity_id] = { entity_id, state, attributes: {} };
  }
  device._hass = { states: hassStates, entities: {}, callService: vi.fn() };
  return device;
}

//----------------------------------------------------------------------------//
//   Pump
//----------------------------------------------------------------------------//

describe("RSAto pump detection", () => {
  it("assumes a pump is present on a normal mode", () => {
    expect(makeAto({ mode: "auto" }).has_pump()).toBe(true);
    expect(makeAto({ mode: "manual" }).has_pump()).toBe(true);
    expect(makeAto({ mode: "off" }).has_pump()).toBe(true);
  });

  it("assumes a pump is present when the mode is unknown", () => {
    // A ReefATO+ ships with its pump: an unrecognised mode must not hide the
    // fill controls, only an explicit "missing_pump" may.
    expect(makeAto().has_pump()).toBe(true);
    expect(makeAto({ mode: "some_future_mode" }).has_pump()).toBe(true);
  });

  it("hides the pump only on an explicit missing_pump mode", () => {
    expect(makeAto({ mode: "missing_pump" }).has_pump()).toBe(false);
  });

  it("keeps the pump visible while it is faulty", () => {
    // A blocked pump is still a pump: it must be shown, blinking.
    expect(makeAto({ mode: "stalled" }).has_pump()).toBe(true);
  });
});

describe("RSAto pump alerts", () => {
  it("raises no alert on a healthy mode", () => {
    expect(makeAto({ mode: "auto" }).pump_alert()).toBe(false);
    expect(makeAto({ mode: "manual" }).pump_alert()).toBe(false);
    expect(makeAto({ mode: "priming" }).pump_alert()).toBe(false);
  });

  it("raises an alert on every pump-blocking mode", () => {
    for (const mode of [
      "malfunction",
      "stalled",
      "pump_timeout",
      "empty",
      "missing_sensor",
    ]) {
      expect(makeAto({ mode }).pump_alert()).toBe(true);
    }
  });

  it("raises no alert when the pump is absent: nothing to warn about", () => {
    expect(makeAto({ mode: "missing_pump" }).pump_alert()).toBe(false);
    expect(makeAto().pump_alert()).toBe(false);
  });
});

//----------------------------------------------------------------------------//
//   Leak probe
//----------------------------------------------------------------------------//

describe("RSAto leak probe", () => {
  it("reports no probe when the connectivity sensor is missing or off", () => {
    expect(makeAto().has_leak_sensor()).toBe(false);
    expect(makeAto({ connected: "off" }).has_leak_sensor()).toBe(false);
  });

  it("reports a probe when it is connected", () => {
    expect(makeAto({ connected: "on" }).has_leak_sensor()).toBe(true);
  });

  it("does not infer presence from the status value", () => {
    // The firmware reports "dry" whether or not a probe is plugged in, so the
    // integration's PROBLEM sensor alone can never mean "present".
    expect(makeAto({ status: "off" }).has_leak_sensor()).toBe(false);
  });

  it("treats a connected but disabled probe as present and disarmed", () => {
    const device = makeAto({ connected: "on", enabled: "off" });
    expect(device.has_leak_sensor()).toBe(true);
    expect(device.leak_sensor_armed()).toBe(false);
  });

  it("treats a connected and enabled probe as armed", () => {
    expect(
      makeAto({ connected: "on", enabled: "on" }).leak_sensor_armed(),
    ).toBe(true);
  });

  it("never reports a disconnected probe as armed", () => {
    expect(
      makeAto({ connected: "off", enabled: "on" }).leak_sensor_armed(),
    ).toBe(false);
  });

  it("raises an alert when the problem sensor is on", () => {
    expect(makeAto({ connected: "on", status: "on" }).leak_alert()).toBe(true);
  });

  it("raises no alert on a dry probe", () => {
    expect(makeAto({ connected: "on", status: "off" }).leak_alert()).toBe(
      false,
    );
  });
});

//----------------------------------------------------------------------------//
//   Level probe
//----------------------------------------------------------------------------//

describe("RSAto level probe", () => {
  it("raises no alert when both problem sensors are clear", () => {
    expect(
      makeAto({
        check_sensor: "off",
        is_sensor_error: "off",
      }).level_sensor_alert(),
    ).toBe(false);
  });

  it("raises an alert on either problem sensor", () => {
    // check_sensor asks the user to inspect the probe; is_sensor_error is a
    // hard read failure. Either makes the level readings untrustworthy.
    expect(makeAto({ check_sensor: "on" }).level_sensor_alert()).toBe(true);
    expect(makeAto({ is_sensor_error: "on" }).level_sensor_alert()).toBe(true);
  });

  it("raises no alert when the sensors are absent", () => {
    expect(makeAto().level_sensor_alert()).toBe(false);
  });
});

//----------------------------------------------------------------------------//
//   Mapping wiring
//----------------------------------------------------------------------------//

describe("RSATO mapping", () => {
  const elements: Record<string, any> = config.elements;

  it("declares the overlays before every other element", () => {
    // Elements paint in declaration order: the full-canvas overlays must come
    // first so the controls stay on top of them.
    const keys = Object.keys(elements);
    expect(keys.slice(0, 2)).toEqual(["pump", "leak"]);
  });

  it("makes the overlays click-through", () => {
    for (const key of ["pump", "leak"]) {
      expect(elements[key].css["pointer-events"]).toBe("none");
    }
  });

  it("binds each overlay to the entity driving its animation", () => {
    // The pump has no entity of its own: `mode` carries both its presence and
    // its faults, so that is what the element must watch.
    expect(elements["pump"].name).toBe("mode");
    expect(elements["leak"].name).toBe("status");
    expect(elements["pump"].class).toContain("pump_alert()");
    expect(elements["leak"].class).toContain("leak_alert()");
    expect(elements["leak"].class).toContain("leak_sensor_armed()");
  });

  it("hides every pump-dependent control when no pump is paired", () => {
    for (const key of [
      "pump",
      "auto_fill",
      "fill",
      "stop_fill",
      "resume",
      "volume_left",
      "days_till_empty",
    ]) {
      expect(elements[key].disabled_if).toBe("!device.has_pump()");
      // Absolutely positioned: a bare <br> would shift the whole card.
      expect(elements[key].no_br_if_disabled).toBe(true);
    }
  });

  it("keeps the sump probe visible without a pump", () => {
    // The sump level comes from the controller itself, not from the pump.
    expect(elements["water_level"].disabled_if).toBeUndefined();
  });
});

//----------------------------------------------------------------------------//
//   Render
//----------------------------------------------------------------------------//

describe("RSAto._render", () => {
  it("returns a template built on the background image", () => {
    const device = makeAto({ pump_state: "ok" });
    device.config = {
      ...device.initial_config,
      background_img: "",
      elements: {},
    };
    expect(device._render(null, "")).toBeDefined();
  });

  it("falls back to an empty source when no background is configured", () => {
    const device = makeAto();
    device.config = { elements: {} };
    expect(device._render(null, "")).toBeDefined();
  });
});
