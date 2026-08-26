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

  it("raises an alert from the raw status sensor alone", () => {
    // The binary_sensor is computed by the integration from the payload, so
    // forcing leak_sensor_status in the developer tools moves the sensor
    // without moving the binary_sensor.
    const device = makeAto({
      connected: "on",
      status: "off",
      leak_sensor_status: "aquarium_water_leak",
    });
    expect(device.leak_alert()).toBe(true);
  });

  it("raises an alert on an RO/DI leak too", () => {
    expect(
      makeAto({ leak_sensor_status: "rodi_water_leak" }).leak_alert(),
    ).toBe(true);
  });

  it("raises no alert on a raw dry reading", () => {
    expect(makeAto({ leak_sensor_status: "dry" }).leak_alert()).toBe(false);
  });

  it("raises no alert on an unreadable raw status", () => {
    // unknown / unavailable are not leaks, and a probe that dropped off the
    // bus must not fire the alarm.
    expect(makeAto({ leak_sensor_status: "unknown" }).leak_alert()).toBe(false);
    expect(makeAto({ leak_sensor_status: "unavailable" }).leak_alert()).toBe(
      false,
    );
    expect(makeAto().leak_alert()).toBe(false);
  });

  it("raises no alert on a dry probe", () => {
    expect(makeAto({ connected: "on", status: "off" }).leak_alert()).toBe(
      false,
    );
  });
});

describe("RSAto leak source", () => {
  it("reports no source without a leak", () => {
    expect(
      makeAto({ connected: "on", status: "off" }).leak_source(),
    ).toBeNull();
  });

  it("names the aquarium side", () => {
    expect(
      makeAto({ leak_sensor_status: "aquarium_water_leak" }).leak_source(),
    ).toBe("aquarium");
  });

  it("names the RO/DI side", () => {
    expect(
      makeAto({ leak_sensor_status: "rodi_water_leak" }).leak_source(),
    ).toBe("rodi");
  });

  it("admits it does not know when only the binary sensor fired", () => {
    // Better than guessing a side: the picture must not claim to know more
    // than the device said.
    expect(makeAto({ status: "on" }).leak_source()).toBe("unknown");
    expect(
      makeAto({
        status: "on",
        leak_sensor_status: "unavailable",
      }).leak_source(),
    ).toBe("unknown");
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

  it("draws one puddle per leak source, on its own side", () => {
    // Position carries the meaning: left under the RO reservoir, right under
    // the sump, so no label is needed on a strip 3% of the card high.
    const rodi = elements["leak_puddle_rodi"];
    const aquarium = elements["leak_puddle_aquarium"];
    const unknown = elements["leak_puddle_unknown"];

    expect(rodi.disabled_if).toBe("device.leak_source() !== 'rodi'");
    expect(aquarium.disabled_if).toBe("device.leak_source() !== 'aquarium'");
    expect(unknown.disabled_if).toBe("device.leak_source() !== 'unknown'");

    // The RO/DI puddle sits left of the aquarium one.
    expect(parseFloat(rodi.css.left)).toBeLessThan(
      parseFloat(aquarium.css.left),
    );
    // An unknown side spreads over both halves rather than guessing one.
    expect(parseFloat(unknown.css.width)).toBeGreaterThan(
      parseFloat(rodi.css.width),
    );
  });

  it("draws every puddle as a threshold, not a gauge", () => {
    for (const key of [
      "leak_puddle_rodi",
      "leak_puddle_aquarium",
      "leak_puddle_unknown",
    ]) {
      const puddle = elements[key];
      expect(puddle.no_br_if_disabled).toBe(true);
      // A fixed height: no state lookup that could fall through to the
      // no-reading mark, and no percentage printed on a puddle.
      expect(puddle.level).toBe(100);
      expect(puddle.levels).toBeUndefined();
      expect(puddle.show_value).toBe(false);
      expect(puddle.css["pointer-events"]).toBe("none");
      // No fill override: the puddle takes the device colour, like the water
      // in the two tanks.
      expect(puddle.colors).toBeUndefined();
    }
  });

  it("keeps the sump probe visible without a pump", () => {
    // The sump level comes from the controller itself, not from the pump.
    expect(elements["water_level"].disabled_if).toBeUndefined();
  });
});

//----------------------------------------------------------------------------//
//   Background alert
//----------------------------------------------------------------------------//

describe("RSAto background picture", () => {
  function render(device: any): string {
    device.config = { background_img: "", elements: {} };
    const result: any = device._render(null, "");
    return result.strings.join("") + result.values.join("");
  }

  it("blinks the picture on a level probe fault", () => {
    // The probe is part of the background picture and has no overlay of its
    // own, so the picture itself carries the alert.
    const device = makeAto({ is_sensor_error: "on" });
    expect(render(device)).toContain("blink-alert");
  });

  it("blinks on the softer check_sensor flag too", () => {
    expect(render(makeAto({ check_sensor: "on" }))).toContain("blink-alert");
  });

  it("re-renders when the probe fault appears or clears", () => {
    // RSDevice only re-runs _render() for a master element or a device
    // enable/disable, so a plain sensor change would leave a stale class.
    const device = makeAto({ is_sensor_error: "off" });
    device.requestUpdate = vi.fn();
    device._elements = {};

    device._setting_hass({
      states: {
        "sensor.is_sensor_error": {
          entity_id: "sensor.is_sensor_error",
          state: "on",
        },
      },
    });
    expect(device.requestUpdate).toHaveBeenCalledTimes(1);
  });

  it("does not re-render while the probe state is unchanged", () => {
    // Requesting an update on every hass push would redraw the whole device
    // several times a second.
    const device = makeAto({ is_sensor_error: "off" });
    device.requestUpdate = vi.fn();
    device._elements = {};

    const hass = {
      states: {
        "sensor.is_sensor_error": {
          entity_id: "sensor.is_sensor_error",
          state: "off",
        },
      },
    };
    device._setting_hass(hass);
    device._setting_hass(hass);
    expect(device.requestUpdate).not.toHaveBeenCalled();
  });

  it("leaves the picture alone when the probe is healthy", () => {
    const device = makeAto({ is_sensor_error: "off", check_sensor: "off" });
    const text = render(device);
    expect(text).toContain("device_img");
    expect(text).not.toContain("blink-alert");
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
