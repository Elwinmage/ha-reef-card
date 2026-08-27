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

//----------------------------------------------------------------------------//
//   Leak buzzer
//----------------------------------------------------------------------------//

import { dialogs_rsato } from "../src/devices/redsea/rsato/rsato.dialogs";

describe("RSAto buzzer presence", () => {
  it("hides the buzzer when the integration does not expose the switch", () => {
    // The writable switch only exists from the version that added it; the
    // read-only binary_sensor of the same name is not a substitute.
    expect(makeAto().has_buzzer()).toBe(false);
    expect(makeAto({ buzzer_enabled: "on" }).has_buzzer()).toBe(false);
  });

  it("shows the buzzer once the switch is there", () => {
    expect(makeAto({ "switch.buzzer_enabled": "off" }).has_buzzer()).toBe(true);
  });
});

describe("RSAto buzzer arming", () => {
  it("is armed when it is on and the probe can trigger it", () => {
    const device = makeAto({
      "switch.buzzer_enabled": "on",
      connected: "on",
      enabled: "on",
    });
    expect(device.buzzer_armed()).toBe(true);
  });

  it("is not armed while switched off", () => {
    const device = makeAto({
      "switch.buzzer_enabled": "off",
      connected: "on",
      enabled: "on",
    });
    expect(device.buzzer_armed()).toBe(false);
  });

  it("is not armed without a probe to trigger it", () => {
    // Enabled but deaf: the buzzer is the leak alarm, so with no probe
    // plugged in nothing can ever make it sound.
    const device = makeAto({
      "switch.buzzer_enabled": "on",
      connected: "off",
      enabled: "on",
    });
    expect(device.buzzer_armed()).toBe(false);
  });

  it("is not armed while the probe is disarmed", () => {
    const device = makeAto({
      "switch.buzzer_enabled": "on",
      connected: "on",
      enabled: "off",
    });
    expect(device.buzzer_armed()).toBe(false);
  });

  it("is not armed when the switch is missing altogether", () => {
    expect(makeAto({ connected: "on", enabled: "on" }).buzzer_armed()).toBe(
      false,
    );
  });
});

describe("RSAto buzzer re-render", () => {
  it("re-renders when the probe stops backing the buzzer", () => {
    // The dimming depends on the leak probe, not on the buzzer entity, so
    // the element cannot refresh itself: the device has to watch it.
    const device = makeAto({
      "switch.buzzer_enabled": "on",
      connected: "on",
      enabled: "on",
    });
    device._setting_hass(device._hass);
    device.requestUpdate = vi.fn();
    device._elements = {};

    device._hass.states["sensor.connected"].state = "off";
    device._setting_hass(device._hass);
    expect(device.requestUpdate).toHaveBeenCalledTimes(1);
  });

  it("does not re-render while the buzzer state is unchanged", () => {
    const device = makeAto({
      "switch.buzzer_enabled": "on",
      connected: "on",
      enabled: "on",
    });
    device._setting_hass(device._hass);
    device.requestUpdate = vi.fn();
    device._elements = {};

    device._setting_hass(device._hass);
    device._setting_hass(device._hass);
    expect(device.requestUpdate).not.toHaveBeenCalled();
  });
});

describe("RSAto buzzer element", () => {
  const buzzer: any = (config.elements as any).buzzer;

  it("targets the writable switch, not the read-only sensor", () => {
    // Both entities are called `buzzer_enabled`: a bare key resolves to
    // whichever the registry walk happened to store last.
    expect(buzzer.name).toBe("switch.buzzer_enabled");
  });

  it("disappears instead of rendering an entity-less icon", () => {
    expect(buzzer.disabled_if).toBe("!device.has_buzzer()");
    expect(buzzer.no_br_if_disabled).toBe(true);
  });

  it("follows the entity icon so bell-ring/bell-off track the state", () => {
    expect(buzzer.icon).toBe("state");
  });

  it("dims when nothing can trigger it", () => {
    expect(buzzer.class).toContain("device.buzzer_armed()");
    expect(buzzer.class).toContain("muted");
  });

  it("opens the dialog on tap and toggles on hold", () => {
    expect(buzzer.tap_action).toEqual({
      domain: "redsea_ui",
      action: "dialog",
      data: { type: "buzzer" },
    });
    expect(buzzer.hold_action).toEqual({
      domain: "switch",
      action: "toggle",
      data: "default",
    });
  });

  it("sits between the reservoir and the sump", () => {
    expect(buzzer.css.position).toBe("absolute");
    expect(buzzer.css.top).toBe("77%");
    expect(buzzer.css.left).toBe("32%");
  });
});

describe("RSAto buzzer dialog", () => {
  const dialog: any = (dialogs_rsato as any).buzzer;

  it("is registered under the type the element opens", () => {
    expect(dialog.name).toBe("buzzer");
    expect(dialog.close_cross).toBe(true);
  });

  it("shows the setting and the live state, nothing else", () => {
    const entities = dialog.content[0].conf.entities
      .filter((e: any) => e.type !== "divider")
      .map((e: any) => e.entity);

    // The switch is the single entity for the setting: the integration no
    // longer duplicates it as a read-only binary_sensor.
    expect(entities).toContain("switch.buzzer_enabled");
    expect(entities).not.toContain("binary_sensor.buzzer_enabled");
    expect(entities).toContain("buzzer_on");
    // Only the two flags that explain a silent buzzer are repeated from the
    // leak dialog; the probe itself belongs there.
    expect(entities).toContain("connected");
    expect(entities).toContain("enabled");
    expect(entities).not.toContain("leak_sensor_current_read");
    // Device-wide config re-read belongs to the config dialog, not here.
    expect(entities).not.toContain("fetch_config");
  });
});

//----------------------------------------------------------------------------//
//   Accessory settings cogs
//----------------------------------------------------------------------------//

describe("RSAto level-probe presence", () => {
  it("assumes the probe is there until told otherwise", () => {
    // The probe is what the whole device is built around: an entity that has
    // not reported yet must not hide its settings.
    expect(makeAto().has_ato_sensor()).toBe(true);
    expect(makeAto({ ato_sensor_connected: "unknown" }).has_ato_sensor()).toBe(
      true,
    );
    expect(makeAto({ ato_sensor_connected: "on" }).has_ato_sensor()).toBe(true);
  });

  it("hides it on an explicit disconnection", () => {
    expect(makeAto({ ato_sensor_connected: "off" }).has_ato_sensor()).toBe(
      false,
    );
  });
});

describe("RSAto accessory cogs", () => {
  const elements: any = config.elements;

  it("puts one cog per socket, in the header column grid", () => {
    // Left to right, matching the three sockets on the front panel.
    expect(elements.pump_settings.css.left).toBe("75%");
    expect(elements.leak_settings.css.left).toBe("81%");
    expect(elements.ato_sensor_settings.css.left).toBe("87%");
    for (const key of [
      "pump_settings",
      "leak_settings",
      "ato_sensor_settings",
    ]) {
      expect(elements[key].css.top).toBe("16%");
      expect(elements[key].css.position).toBe("absolute");
      expect(elements[key].icon).toBe("mdi:cog");
    }
  });

  it("hides each cog when its accessory is absent", () => {
    expect(elements.pump_settings.disabled_if).toBe("!device.has_pump()");
    expect(elements.leak_settings.disabled_if).toBe(
      "!device.has_leak_sensor()",
    );
    expect(elements.ato_sensor_settings.disabled_if).toBe(
      "!device.has_ato_sensor()",
    );
    for (const key of [
      "pump_settings",
      "leak_settings",
      "ato_sensor_settings",
    ]) {
      expect(elements[key].no_br_if_disabled).toBe(true);
    }
  });

  it("opens the matching dialog on tap", () => {
    const opened: Record<string, string> = {
      pump_settings: "pump",
      leak_settings: "leak",
      ato_sensor_settings: "ato_sensor",
    };
    for (const [key, type] of Object.entries(opened)) {
      expect(elements[key].tap_action).toEqual({
        domain: "redsea_ui",
        action: "dialog",
        data: { type },
      });
      // A settings cog must not double as a toggle.
      expect(elements[key].hold_action).toBeUndefined();
    }
  });
});

describe("RSAto accessory dialogs", () => {
  /** Entity names of a dialog, dividers dropped. */
  function entities_of(name: string): string[] {
    return (dialogs_rsato as any)[name].content[0].conf.entities
      .filter((e: any) => e.type !== "divider")
      .map((e: any) => e.entity);
  }

  it("registers one dialog per cog", () => {
    for (const name of ["pump", "leak", "ato_sensor"]) {
      expect((dialogs_rsato as any)[name].name).toBe(name);
      expect((dialogs_rsato as any)[name].close_cross).toBe(true);
    }
  });

  it("gathers the pump sensors", () => {
    const entities = entities_of("pump");
    for (const key of [
      "is_pump_on",
      "pump_state",
      "prev_pump_state",
      "pump_speed",
      "pump_consumption",
      "flow_rate",
      "pump_empty_threshold",
      "pump_soft_blockage_threshold",
      "pump_blockage_threshold",
      "last_pump_on_cause",
      "last_fill_date",
    ]) {
      expect(entities).toContain(key);
    }
  });

  it("gathers the leak probe sensors and the alarm it drives", () => {
    const entities = entities_of("leak");
    for (const key of [
      "connected",
      "enabled",
      "status",
      "leak_sensor_status",
      "leak_sensor_current_read",
      "switch.buzzer_enabled",
      "buzzer_on",
    ]) {
      expect(entities).toContain(key);
    }
  });

  it("gathers the level probe sensors, health first", () => {
    const entities = entities_of("ato_sensor");
    for (const key of [
      "ato_sensor_connected",
      "is_calibrated",
      "check_sensor",
      "is_sensor_error",
      "current_level",
      "s1_average",
      "s2_average",
      "is_temp_enabled",
      "current_read",
      "temperature_probe_status",
      "ato_sensor_code",
    ]) {
      expect(entities).toContain(key);
    }
  });

  it("disambiguates water_level, which exists in two domains", () => {
    // A bare `water_level` resolves to either the sensor or the
    // binary_sensor, depending on the registry walk order.
    const entities = entities_of("ato_sensor");
    expect(entities).toContain("sensor.water_level");
    expect(entities).toContain("binary_sensor.water_level");
    expect(entities).not.toContain("water_level");
  });

  it("reports whether the buzzer is sounding, not just enabled", () => {
    expect(entities_of("buzzer")).toContain("buzzer_on");
  });
});

//----------------------------------------------------------------------------//
//   Consumption
//----------------------------------------------------------------------------//

describe("RSAto usage chart", () => {
  const chart: any = (config.elements as any).today_usage_sparkline;

  it("opens the consumption dialog on tap", () => {
    expect(chart.tap_action).toEqual({
      domain: "redsea_ui",
      action: "dialog",
      data: { type: "usage" },
    });
  });

  it("accepts pointer events, unlike the full-canvas overlays", () => {
    // The overlays disable them so they do not swallow clicks over their
    // transparent areas; the chart is a real target and the only element
    // underneath carries no tap_action.
    expect(chart.css["pointer-events"]).toBeUndefined();
  });
});

describe("RSAto usage dialog", () => {
  const entities: string[] = (
    dialogs_rsato as any
  ).usage.content[0].conf.entities
    .filter((e: any) => e.type !== "divider")
    .map((e: any) => e.entity);

  it("spells out the six consumption figures", () => {
    // Fills and volume, each read today, on average and since day one.
    // The chart plots two of them; the other four exist nowhere else.
    for (const key of [
      "today_fills",
      "today_volume_usage",
      "daily_fills_average",
      "daily_volume_average",
      "total_fills",
      "total_volume_usage",
    ]) {
      expect(entities).toContain(key);
    }
  });

  it("closes with what is left to consume", () => {
    expect(entities).toContain("volume_left");
    expect(entities).toContain("days_till_empty");
  });
});

//----------------------------------------------------------------------------//
//   Config dialogs
//----------------------------------------------------------------------------//

import { dialogs_rsdose } from "../src/devices/redsea/rsdose/rsdose.dialogs";
import { dialogs_rsmat } from "../src/devices/redsea/rsmat/rsmat.dialogs";
import { dialogs_rsrun } from "../src/devices/redsea/rsrun/rsrun.dialogs";

describe("config dialogs", () => {
  const all: Record<string, any> = {
    rsato: dialogs_rsato,
    rsdose: dialogs_rsdose,
    rsmat: dialogs_rsmat,
    rsrun: dialogs_rsrun,
  };

  it("offers fetch_data right after fetch_config on every device", () => {
    // The two buttons cover the two halves of the source list, so they only
    // make sense read together.
    for (const [device, dialogs] of Object.entries(all)) {
      const entities = dialogs.config.content[0].conf.entities
        .filter((e: any) => e.type !== "divider")
        .map((e: any) => e.entity);
      const at = entities.indexOf("fetch_config");
      expect(at, device).toBeGreaterThanOrEqual(0);
      expect(entities[at + 1], device).toBe("fetch_data");
    }
  });
});
