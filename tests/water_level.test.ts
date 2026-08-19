// Tests for the water-level element (ratio mode and discrete probe mode)

import { WaterLevel } from "../src/base/water_level";
import { OFF_COLOR } from "../src/utils/constants";
import { afterEach, describe, expect, it, vi } from "vitest";

function makeState(
  state: string,
  entity_id = "sensor.test",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}

function makeDevice(isOn = true): any {
  return {
    entities: {
      volume_left: { entity_id: "sensor.volume_left" },
      ato_tank_volume: { entity_id: "sensor.ato_tank_volume" },
    },
    config: { color: "51,151,232", alpha: 0.8 },
    is_on: () => isOn,
    masterOn: true,
  };
}

class StubWaterLevel extends WaterLevel {}
if (!customElements.get("test-water-level"))
  customElements.define("test-water-level", StubWaterLevel);

/** Ratio-mode element: volume_left (mL) over ato_tank_volume (L). */
function makeRatio(overrides: Record<string, any> = {}, isOn = true): any {
  const el = new StubWaterLevel() as any;
  el.conf = {
    name: "volume_left",
    target: "ato_tank_volume",
    target_factor: 1000,
    ...overrides,
  };
  el.stateObj = makeState("2500", "sensor.volume_left");
  el.stateObjTarget = makeState("5", "sensor.ato_tank_volume");
  el.device = makeDevice(isOn);
  el.color = "51,151,232";
  el.c = "51,151,232";
  el.alpha = 1;
  el.label = "";
  el.evaluate = (v: any) => v || "";
  return el;
}

/** Discrete-mode element: the ATO probe in the sump. */
function makeProbe(
  overrides: Record<string, any> = {},
  state = "desire_level_1",
): any {
  const el = new StubWaterLevel() as any;
  el.conf = {
    name: "water_level",
    levels: { below: 30, desire_level_1: 50, desire_level_2: 68, above: 88 },
    min_percent: 18,
    max_percent: 86,
    ...overrides,
  };
  el.stateObj = makeState(state, "sensor.water_level");
  el.stateObjTarget = null;
  el.device = makeDevice(true);
  el.color = "51,151,232";
  el.c = "51,151,232";
  el.alpha = 1;
  el.label = "";
  el.evaluate = (v: any) => v || "";
  return el;
}

/**
 * Flatten a lit TemplateResult, nested svg`` fragments included, so an
 * assertion can look for a class name or a value wherever it sits.
 */
function values(result: any): string {
  if (result === null || result === undefined) return "";
  if (Array.isArray(result)) return result.map(values).join("|");
  if (typeof result === "object" && "strings" in result) {
    return [
      Array.from(result.strings).join("|"),
      values(Array.from(result.values)),
    ].join("|");
  }
  return String(result);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WaterLevel — ratio mode", () => {
  it("converts the target unit via target_factor (mL over L)", () => {
    const el = makeRatio();
    // 2500 mL / (5 L * 1000) = 50 %
    expect(el.resolveLevel()).toBe(50);
  });

  it("ignores target_factor when it is absent or zero", () => {
    const el = makeRatio({ target_factor: 0 });
    // Falls back to factor 1: 2500 / 5 clamps to 100
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(el.resolveLevel()).toBe(100);
    expect(spy).toHaveBeenCalled();
  });

  it("maps the level into the water area of the picture", () => {
    const el = makeRatio({ min_percent: 12, max_percent: 90 });
    // 50 % between 12 and 90 → 51
    expect(el.mapToBox(50)).toBe(51);
  });

  it("keeps a water line at 0 % for the residue the pump cannot siphon", () => {
    const el = makeRatio({ min_percent: 12, max_percent: 90 });
    expect(el.mapToBox(0)).toBe(12);
  });

  it("clamps levels outside 0-100 before mapping", () => {
    const el = makeRatio({ min_percent: 10, max_percent: 90 });
    expect(el.mapToBox(-20)).toBe(10);
    expect(el.mapToBox(140)).toBe(90);
  });

  it("defaults to the full box when min/max are not configured", () => {
    const el = makeRatio();
    expect(el.mapToBox(0)).toBe(0);
    expect(el.mapToBox(100)).toBe(100);
  });

  it("renders the water body offset by the level", () => {
    const el = makeRatio({ min_percent: 0, max_percent: 100 });
    const result = el._render();
    // 50 % height → translated 50 units down
    expect(values(result)).toContain("|50|");
  });

  it("returns no reading when the entity is unknown or unavailable", () => {
    const el = makeRatio();
    el.stateObj = makeState("unknown", "sensor.volume_left");
    expect(el.resolveLevel()).toBeNull();
    el.stateObj = makeState("unavailable", "sensor.volume_left");
    expect(el.resolveLevel()).toBeNull();
  });
});

describe("WaterLevel — discrete probe mode", () => {
  it("maps each probe state to its fixed height", () => {
    expect(makeProbe({}, "below").resolveLevel()).toBe(30);
    expect(makeProbe({}, "desire_level_1").resolveLevel()).toBe(50);
    expect(makeProbe({}, "desire_level_2").resolveLevel()).toBe(68);
    expect(makeProbe({}, "above").resolveLevel()).toBe(88);
  });

  it("treats error as no reading rather than an empty tank", () => {
    const el = makeProbe({}, "error");
    expect(el.resolveLevel()).toBeNull();
  });

  it("treats an unmapped firmware state as no reading", () => {
    const el = makeProbe({}, "some_future_state");
    expect(el.resolveLevel()).toBeNull();
  });

  it("returns no reading when the state is missing entirely", () => {
    const el = makeProbe();
    el.stateObj = undefined;
    el.conf.levels = { below: 30 };
    expect(el.resolveLevel()).toBeNull();
  });

  it("needs no target entity", () => {
    const el = makeProbe();
    expect(el.hasTargetState()).toBe(true);
  });

  it("renders the no-reading mark on error", () => {
    const el = makeProbe({}, "error");
    expect(values(el._render())).toContain("wl-unknown");
  });

  it("renders the water body for a valid mark", () => {
    const el = makeProbe({}, "desire_level_2");
    const result = el._render();
    // 68 % between 18 and 86 → 64.24, offset 35.76
    expect(values(result)).toContain("|35.76|");
  });
});

describe("WaterLevel — colours and options", () => {
  it("uses colors.fill when set", () => {
    const el = makeRatio({ colors: { fill: "rgb(1,2,3)" } });
    expect(el.resolveWaterColor(50)).toBe("rgb(1,2,3)");
  });

  it("defaults to blue rather than the RedSea device colour", () => {
    const el = makeRatio();
    // The device colour is the brand red: it must not tint the water.
    expect(el.resolveWaterColor()).toBe("rgb(48,124,214)");
  });

  it("greys the water when the device is off", () => {
    const el = makeRatio({}, false);
    el._render();
    expect(el.c).toBe(OFF_COLOR);
  });

  it("honours a custom warning tint", () => {
    const el = makeRatio({ colors: { warn: "orange" } });
    expect(el.resolveWarnColor()).toBe("orange");
  });

  it("exposes both tints as custom properties for the animation", () => {
    const el = makeRatio();
    expect(el.alertStyle()).toContain("--wl-water: rgb(48,124,214)");
    expect(el.alertStyle()).toContain("--wl-warn: rgb(232,150,48)");
  });
});

describe("WaterLevel — alerting", () => {
  it("alerts below warn_below in ratio mode", () => {
    const el = makeRatio({ warn_below: 20 });
    expect(el.isAlerting(10)).toBe(true);
    expect(el.isAlerting(30)).toBe(false);
  });

  it("does not alert on warn_below when there is no reading", () => {
    const el = makeRatio({ warn_below: 20 });
    expect(el.isAlerting(null)).toBe(false);
  });

  it("does not alert when warn_below is not configured", () => {
    expect(makeRatio().isAlerting(2)).toBe(false);
  });

  it("alerts on the listed states in discrete mode", () => {
    const conf = { warn_states: ["below", "above"] };
    expect(makeProbe(conf, "below").isAlerting(30)).toBe(true);
    expect(makeProbe(conf, "above").isAlerting(88)).toBe(true);
    expect(makeProbe(conf, "desired_level_1").isAlerting(50)).toBe(false);
  });

  it("does not alert in discrete mode without warn_states", () => {
    expect(makeProbe({}, "below").isAlerting(30)).toBe(false);
  });

  it("does not alert in discrete mode when the state is missing", () => {
    const el = makeProbe({ warn_states: ["below"] }, "below");
    el.stateObj = undefined;
    expect(el.isAlerting(null)).toBe(false);
  });

  it("pulses the water and keeps the warning tint as the static fallback", () => {
    const el = makeRatio({ warn_below: 60 });
    const v = values(el._render());
    expect(v).toContain("wl-alert");
    // Reduced motion disables the animation, so the attribute must already
    // carry the warning colour rather than plain water.
    expect(v).toContain("rgb(232,150,48)");
  });

  it("keeps a static tint when warn_blink is false", () => {
    const el = makeRatio({ warn_below: 60, warn_blink: false });
    const v = values(el._render());
    expect(v).not.toContain("wl-alert");
    expect(v).toContain("rgb(232,150,48)");
  });

  it("pulses a flat surface too when the wave is disabled", () => {
    const el = makeRatio({ warn_below: 60, wave: false });
    expect(values(el._render())).toContain("wl-alert");
  });

  it("leaves the water blue when nothing is wrong", () => {
    const v = values(makeRatio()._render());
    expect(v).not.toContain("wl-alert");
    expect(v).toContain("rgb(48,124,214)");
  });

  it("blinks the no-reading mark", () => {
    const el = makeProbe({}, "error");
    expect(values(el._render())).toContain("wl-alert-stroke");
  });

  it("keeps the no-reading mark static when warn_blink is false", () => {
    const el = makeProbe({ warn_blink: false }, "error");
    expect(values(el._render())).not.toContain("wl-alert-stroke");
  });

  it("draws the wave by default and falls back to a flat rect", () => {
    expect(values(makeRatio()._render())).toContain("wl-wave");
    const flat = values(makeRatio({ wave: false })._render());
    expect(flat).not.toContain("wl-wave");
    expect(flat).toContain("<rect");
  });

  it("draws a single shape so the opacity stays uniform", () => {
    // A rect stacked under the wave path doubled the opacity below the
    // surface line and left a visible band at the waterline.
    const v = values(makeRatio()._render());
    expect(v).not.toContain("<rect");
    expect(v).not.toContain("wl-meniscus");
  });

  it("applies a flat opacity over the whole submerged area", () => {
    const el = makeRatio({ opacity: 0.6 });
    const v = values(el._render());
    expect(v).toContain("|0.6|");
    // A vertical gradient would reintroduce the lighting-effect look.
    expect(v).not.toContain("linearGradient");
  });

  it("defaults the water opacity to 0.45", () => {
    expect(values(makeRatio()._render())).toContain("|0.45|");
  });

  it("warns and renders an error block when no state resolves", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const el = makeRatio();
    el.stateObj = null;
    const result = el._render();
    expect(spy).toHaveBeenCalled();
    expect((result as any).strings.join("|")).toContain("error");
  });

  it("warns about a missing target when the value resolved", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const el = makeRatio({ target: "ato_tank_volume" });
    el.stateObjTarget = null;
    el._render();
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("stateObjTarget not resolved"),
    );
  });
});

describe("WaterLevel — value overlay", () => {
  it("shows a rounded percentage in ratio mode", () => {
    const el = makeRatio();
    expect(el.resolveValueText(el.resolveLevel())).toBe("50%");
  });

  it("shows a dash when the ratio has no reading", () => {
    const el = makeRatio();
    expect(el.resolveValueText(null)).toBe("--");
  });

  it("shows the state translated by Home Assistant in discrete mode", () => {
    const el = makeProbe({}, "desired_level_1");
    el._hass = { formatEntityState: () => "Niveau souhaite 1" };
    expect(el.resolveValueText(50)).toBe("Niveau souhaite 1");
  });

  it("falls back to the raw state when no translation is available", () => {
    const el = makeProbe({}, "above");
    el._hass = {};
    expect(el.resolveValueText(88)).toBe("above");
  });

  it("falls back to an empty label when there is no state at all", () => {
    const el = makeProbe({}, "above");
    el._hass = {};
    el.stateObj = undefined;
    expect(el.resolveValueText(null)).toBe("");
  });

  it("renders the overlay at the bottom-right of the water area", () => {
    const el = makeRatio();
    expect(values(el._render())).toContain("wl-value");
  });

  it("renders the overlay on the no-reading mark too", () => {
    const el = makeProbe({}, "error");
    el._hass = {};
    expect(values(el._render())).toContain("wl-value");
  });

  it("honours text_color for the overlay", () => {
    const el = makeRatio({ text_color: "rgb(9,9,9)" });
    expect(values(el._render())).toContain("rgb(9,9,9)");
  });

  it("omits the overlay when show_value is false", () => {
    const el = makeRatio({ show_value: false });
    expect(values(el._render())).not.toContain("wl-value");
  });

  it("prefers an explicit label over the entity state", () => {
    const el = makeProbe({ label: "custom" }, "above");
    expect(el.resolveValueText(88)).toBe("custom");
  });

  it("falls back to an empty string when the label evaluates to nothing", () => {
    const el = makeProbe({ label: "x" }, "above");
    el.evaluate = () => "";
    expect(el.resolveValueText(88)).toBe("");
  });

  it("ignores a boolean label", () => {
    const el = makeProbe({ label: true }, "above");
    el._hass = {};
    expect(el.resolveValueText(88)).toBe("above");
  });

  it("displays value_entity instead of the level entity", () => {
    const el = makeProbe(
      { value_entity: "binary_sensor.water_level" },
      "above",
    );
    el.device.entities["binary_sensor.water_level"] = {
      entity_id: "binary_sensor.wl",
    };
    el._hass = {
      states: { "binary_sensor.wl": makeState("on", "binary_sensor.wl") },
      formatEntityState: (s: any) => (s.state === "on" ? "Humide" : "Sec"),
    };
    expect(el.resolveValueText(88)).toBe("Humide");
  });

  it("resolves value_entity from the parent device too", () => {
    const el = makeProbe(
      { value_entity: "binary_sensor.water_level" },
      "above",
    );
    el.device.parent_entities = {
      "binary_sensor.water_level": { entity_id: "binary_sensor.wl" },
    };
    el._hass = {
      states: { "binary_sensor.wl": makeState("off", "binary_sensor.wl") },
    };
    expect(el.resolveValueText(88)).toBe("off");
  });

  it("warns and shows nothing when value_entity cannot be resolved", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const el = makeProbe({ value_entity: "binary_sensor.nope" }, "above");
    el._hass = { states: {} };
    expect(el.resolveValueText(88)).toBe("");
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("not resolved"));
  });

  it("warns when value_entity is registered but has no state yet", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const el = makeProbe(
      { value_entity: "binary_sensor.water_level" },
      "above",
    );
    el.device.entities["binary_sensor.water_level"] = {
      entity_id: "binary_sensor.wl",
    };
    el._hass = { states: {} };
    expect(el.resolveValueText(88)).toBe("");
    expect(spy).toHaveBeenCalled();
  });

  it("omits the overlay when the text resolves to nothing", () => {
    const el = makeProbe({}, "above");
    el._hass = {};
    el.stateObj = undefined;
    el.conf.levels = { above: 88 };
    expect(el.renderValue(null)).toBe("");
  });
});
