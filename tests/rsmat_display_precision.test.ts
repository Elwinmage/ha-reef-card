/**
 * Display precision of the ReefMat sensors.
 *
 * The values used to be printed as the raw state, so a sensor whose entity is
 * set to one decimal in Home Assistant showed every decimal the integration
 * reports. `format_entity_state` hands the formatting over to
 * `hass.formatEntityState`, which applies the entity display precision and
 * brings the unit along.
 */

import { describe, expect, it, vi } from "vitest";
import { render } from "lit";

import { Sensor } from "../src/base/sensor";
import { config } from "../src/devices/redsea/rsmat/rsmat.mapping";

if (!customElements.get("test-precision-sensor")) {
  customElements.define("test-precision-sensor", class extends Sensor {});
}

/** The text a Sensor renders for the given state and configuration. */
function rendered(conf: Record<string, any>, hass: Record<string, any>) {
  const sensor: any = new (
    customElements.get("test-precision-sensor") as any
  )();
  sensor.device = { is_on: () => true, config: { color: "1,2,3", alpha: 1 } };
  sensor._hass = hass;
  sensor.conf = { name: "x", type: "common-sensor", ...conf };
  sensor.stateObj = {
    entity_id: "sensor.x",
    state: "12.2345678",
    attributes: { unit_of_measurement: "m" },
  };
  const host = document.createElement("div");
  render(Sensor.prototype["_render" as keyof Sensor].call(sensor, ""), host);
  return host.textContent!.replace(/\s+/g, " ").trim();
}

describe("Sensor format_entity_state", () => {
  const formatted = () => ({
    formatEntityState: vi.fn(() => "12.2 m"),
  });

  it("prints what Home Assistant formats, unit included once", () => {
    const hass = formatted();
    expect(rendered({ format_entity_state: true }, hass)).toBe("12.2 m");
    expect(hass.formatEntityState).toHaveBeenCalledTimes(1);
  });

  it("does not add the unit or the rounding of the card", () => {
    const text = rendered(
      {
        format_entity_state: true,
        unit: "'cm'",
        round: 0,
        force_integer: true,
      },
      formatted(),
    );
    expect(text).toBe("12.2 m");
  });

  it("keeps the prefix", () => {
    const text = rendered(
      { format_entity_state: true, prefix: "'avg '" },
      formatted(),
    );
    expect(text).toBe("avg 12.2 m");
  });

  it("falls back on the raw state when the frontend has no formatter", () => {
    expect(rendered({ format_entity_state: true }, {})).toBe("12.2345678 m");
  });

  it("is opt-in: the state is untouched without the flag", () => {
    const hass = formatted();
    expect(rendered({}, hass)).toBe("12.2345678 m");
    expect(hass.formatEntityState).not.toHaveBeenCalled();
  });
});

describe("ReefMat mapping", () => {
  it.each([
    "total_usage",
    "remaining_length",
    "daily_average_usage",
    "custom_advance_value",
  ])("%s follows the display precision of its entity", (key) => {
    expect((config as any).elements[key].format_entity_state).toBe(true);
  });
});
