// Tests for how probe readings are shown: level dots (compact mode), the
// clickable situation bars, the reading's 24-hour history dialog, the
// level-indicator element of the RSPower local temperature and the hub's
// buzzer.
// Covers: src/utils/levels.ts
//         src/utils/history_dialog.ts
//         src/base/level_indicator.ts
//         src/base/click_image.ts (colour expression)
//         src/devices/redsea/rscontrol/control_probe.ts (dots, history)
//         src/devices/redsea/rscontrol/rscontrol.ts (compact option)
//         src/devices/redsea/rscontrol/rscontrol.dialogs.ts
//         src/devices/redsea/rspower/rspower.ts (temperature colour)

import { describe, expect, it, vi } from "vitest";
import { render, nothing } from "lit";
import {
  ControlProbe,
  level_sign,
} from "../src/devices/redsea/rscontrol/control_probe";
import { RSControlPro } from "../src/devices/redsea/rscontrol/rscontrol";
import { RSPower6 } from "../src/devices/redsea/rspower/rspower";
import { LevelIndicator } from "../src/base/level_indicator";
import { ClickImage } from "../src/base/click_image";
import { history_dialog } from "../src/utils/history_dialog";
import { dialogs_rscontrol } from "../src/devices/redsea/rscontrol/rscontrol.dialogs";
import { dialogs_rspower } from "../src/devices/redsea/rspower/rspower.dialogs";
import { config as liteConfig } from "../src/devices/redsea/rscontrol/rscontrollite.mapping";
import { config2 as proConfig } from "../src/devices/redsea/rscontrol/rscontrolpro.mapping";
import { config as power6 } from "../src/devices/redsea/rspower/rspower6.mapping";
import { config2 as power8 } from "../src/devices/redsea/rspower/rspower8.mapping";
import { SafeEval } from "../src/utils/SafeEval";
import {
  COLOR_LEVEL_ACCEPTABLE_HEX,
  COLOR_LEVEL_DANGER_HEX,
  COLOR_LEVEL_DESIRED_HEX,
  COLOR_LEVEL_ERROR_HEX,
} from "../src/utils/colors";
import { sign_side } from "../src/utils/levels";
import "../src/devices/index";

class StubProbe extends ControlProbe {}
if (!customElements.get("stub-display-probe"))
  customElements.define("stub-display-probe", StubProbe);
class StubHub extends RSControlPro {}
if (!customElements.get("stub-display-hub"))
  customElements.define("stub-display-hub", StubHub);
class StubPower extends RSPower6 {}
if (!customElements.get("stub-display-power"))
  customElements.define("stub-display-power", StubPower);
class StubIndicator extends LevelIndicator {}
if (!customElements.get("stub-level-indicator"))
  customElements.define("stub-level-indicator", StubIndicator);
class StubClick extends ClickImage {}
if (!customElements.get("stub-display-click"))
  customElements.define("stub-display-click", StubClick);

const PH_RANGES = [7.6, 7.9, 8.4, 8.6];
const TEMP_RANGES = [21, 23, 26, 28];

function toDom(template: any): HTMLElement {
  const div = document.createElement("div");
  render(template, div);
  return div;
}

/** A probe element with the given entities (key → state). */
function makeProbe(
  type: string,
  states: Record<string, { state: string; attrs?: Record<string, any> }>,
  conf: any = {},
): any {
  const probe = new StubProbe() as any;
  probe.probe_type = type;
  probe.entities = {};
  const hass_states: Record<string, any> = {};
  for (const [key, st] of Object.entries(states)) {
    probe.entities[key] = { entity_id: "sensor." + key };
    hass_states["sensor." + key] = {
      entity_id: "sensor." + key,
      state: st.state,
      attributes: st.attrs ?? {},
    };
  }
  probe._hass = { states: hass_states, entities: {}, callService: vi.fn() };
  probe.config = conf;
  return probe;
}

// ─── Pure helpers ───────────────────────────────────────────────────────────

describe("level_sign", () => {
  it("tells the side of the desired range", () => {
    expect(level_sign(8.5, PH_RANGES)).toBe("+");
    expect(level_sign(7.7, PH_RANGES)).toBe("−");
    expect(level_sign(8.1, PH_RANGES)).toBe("");
    expect(level_sign(NaN, PH_RANGES)).toBe("");
    expect(level_sign(8.1, null)).toBe("");
  });

  it("puts a plus above its dot and a minus below", () => {
    expect(sign_side("+")).toBe("above");
    expect(sign_side("−")).toBe("below");
  });
});

describe("history_dialog", () => {
  it("draws one reading over its level bands for 24 hours", () => {
    const dialog = history_dialog("h", "probe_primary", "T");
    expect(dialog.name).toBe("h");
    expect(dialog.title_key).toBe("T");
    const conf = dialog.content[0].conf;
    expect(dialog.content[0].view).toBe("history-chart");
    expect(conf.entities[0].entity).toBe("probe_primary");
    expect(conf.zones).toBe(true);
    expect(conf.hours).toBe(24);
    expect(conf.step).toBe(false);
  });

  it("is wired for the probes and the power center", () => {
    const control: any = dialogs_rscontrol;
    expect(control.probe_history.content[0].conf.entities[0].entity).toBe(
      "probe_primary",
    );
    expect(control.probe_temp_history.content[0].conf.entities[0].entity).toBe(
      "probe_secondary",
    );
    const power: any = dialogs_rspower;
    expect(
      power.power_temperature_history.content[0].conf.entities[0].entity,
    ).toBe("power_temperature");
  });
});

// ─── ControlProbe ───────────────────────────────────────────────────────────

describe("ControlProbe dots", () => {
  const dots = { top: 50, gap: 8 };

  it("lists the drawn readings, main one first", () => {
    const probe = makeProbe("ph", {
      probe_primary: { state: "8.1", attrs: { ranges: PH_RANGES } },
      probe_secondary: { state: "25", attrs: { ranges: TEMP_RANGES } },
    });
    expect(probe.drawn_series().map((s: any) => s.key)).toEqual([
      "probe_primary",
      "probe_secondary",
    ]);
    // An ATO probe shows its temperature only
    const ato = makeProbe("ato", {
      probe_primary: { state: "desire_level_1" },
      probe_secondary: { state: "25", attrs: { ranges: TEMP_RANGES } },
    });
    expect(ato.drawn_series().map((s: any) => s.key)).toEqual([
      "probe_secondary",
    ]);
  });

  it("is compact only when the hub says so", () => {
    expect(makeProbe("ph", {}, { compact: true }).is_compact()).toBe(true);
    expect(makeProbe("ph", {}, {}).is_compact()).toBe(false);
    const none = makeProbe("ph", {});
    none.config = null;
    expect(none.is_compact()).toBe(false);
  });

  it("draws no dot without geometry", () => {
    expect(makeProbe("ph", {}, {})._render_dots()).toBe(nothing);
  });

  it("colours each dot by its level, with the side of the range", () => {
    const probe = makeProbe(
      "ph",
      {
        probe_primary: { state: "8.5", attrs: { ranges: PH_RANGES } },
        probe_level: { state: "acceptable" },
        probe_secondary: { state: "25", attrs: { ranges: TEMP_RANGES } },
      },
      { dots },
    );
    const found = toDom(probe._render_dots()).querySelectorAll(".dot");
    expect(found).toHaveLength(2);
    const first = found[0] as HTMLElement;
    expect(first.getAttribute("style")).toContain("top:50%");
    expect(first.getAttribute("style")).toContain("left:50%");
    expect(first.getAttribute("style")).toContain(COLOR_LEVEL_ACCEPTABLE_HEX);
    expect(first.textContent!.trim()).toBe("+");
    expect(first.querySelector(".sign.above")).not.toBeNull();
    const second = found[1] as HTMLElement;
    expect(second.getAttribute("style")).toContain("top:58%");
    expect(second.getAttribute("style")).toContain(COLOR_LEVEL_DESIRED_HEX);
    expect(second.textContent!.trim()).toBe("");
  });

  it("puts a minus under the range, nothing on a disconnected probe", () => {
    const low = makeProbe(
      "temperature",
      {
        probe_primary: { state: "19", attrs: { ranges: TEMP_RANGES } },
      },
      { dots: { top: 60, left: 40 } },
    );
    const dot = toDom(low._render_dots()).querySelector(".dot") as HTMLElement;
    expect(dot.getAttribute("style")).toContain("left:40%");
    expect(dot.getAttribute("style")).toContain(COLOR_LEVEL_DANGER_HEX);
    expect(dot.textContent!.trim()).toBe("−");
    expect(dot.querySelector(".sign.below")).not.toBeNull();

    const off = makeProbe(
      "temperature",
      {
        probe_primary: { state: "19", attrs: { ranges: TEMP_RANGES } },
        probe_status: { state: "disconnected" },
      },
      { dots: { top: 60 } },
    );
    const grey = toDom(off._render_dots()).querySelector(".dot") as HTMLElement;
    expect(grey.getAttribute("style")).toContain(COLOR_LEVEL_ERROR_HEX);
    expect(grey.textContent!.trim()).toBe("");
  });

  it("draws dots instead of bars in the compact mode", () => {
    const states = {
      probe_primary: { state: "8.1", attrs: { ranges: PH_RANGES } },
    };
    const bar = { top: 50, bottom: 100, left: [0, 20] };
    const compact = makeProbe("orp", states, { bar, dots, compact: true });
    compact._render_elements = vi.fn(() => "");
    const dom = toDom(compact._render());
    expect(dom.querySelector(".dot")).not.toBeNull();
    expect(dom.querySelector(".bars")).toBeNull();
    const full = makeProbe("orp", states, { bar, dots });
    full._render_elements = vi.fn(() => "");
    const dom2 = toDom(full._render());
    expect(dom2.querySelector(".dot")).toBeNull();
    expect(dom2.querySelector(".bars")).not.toBeNull();
  });
});

describe("ControlProbe history", () => {
  function listen(probe: any): any[] {
    const events: any[] = [];
    probe.addEventListener("display-dialog", (e: any) => events.push(e));
    return events;
  }

  it("opens the dialog of the reading, through the probe", () => {
    const probe = makeProbe("ph", {
      probe_name: { state: "pH" },
    });
    const events = listen(probe);
    probe.open_history("probe_primary");
    probe.open_history("probe_secondary");
    expect(events.map((e) => e.detail.type)).toEqual([
      "probe_history",
      "probe_temp_history",
    ]);
    const elt = events[0].detail.elt;
    expect(elt.device).toBe(probe);
    expect(elt.get_entity("probe_name").state).toBe("pH");
    expect(events[0].bubbles && events[0].composed).toBe(true);
  });

  it("opens it from a dot", () => {
    const probe = makeProbe(
      "orp",
      { probe_primary: { state: "300", attrs: { ranges: [1, 2, 3, 4] } } },
      { dots: { top: 50 } },
    );
    const events = listen(probe);
    const dot = toDom(probe._render_dots()).querySelector(".dot")!;
    dot.dispatchEvent(new Event("click"));
    expect(events[0].detail.type).toBe("probe_history");
  });

  it("opens it from a bar", () => {
    const probe = makeProbe(
      "ph",
      {
        probe_primary: { state: "8.1", attrs: { ranges: PH_RANGES } },
        probe_secondary: { state: "25", attrs: { ranges: TEMP_RANGES } },
      },
      { bar: { top: 50, bottom: 100, left: [0, 20], right: [80, 100] } },
    );
    const events = listen(probe);
    const bars = toDom(probe._render_bars()).querySelectorAll("g.bar");
    expect(bars).toHaveLength(2);
    bars[1]!.dispatchEvent(new Event("click"));
    expect(events[0].detail.type).toBe("probe_temp_history");
  });
});

// ─── RSControl ──────────────────────────────────────────────────────────────

describe("RSControl compact option", () => {
  function hub(user: any): any {
    const dev = new StubHub() as any;
    dev.device = { name: "Hub", elements: [{ id: "hub", disabled_by: null }] };
    dev._hass = { states: {}, entities: {}, devices: {} };
    dev.setConfig(user);
    dev.update_config();
    return dev;
  }

  it("hands the option to every probe", () => {
    const probe = { type: "ph", uid: "0x1", entities: {} } as any;
    const on = hub({
      conf: { RSCONTROLPRO: { devices: { Hub: { compact_probes: true } } } },
    });
    expect(on._probe_config(probe, 1).compact).toBe(true);
    const off = hub({});
    expect(off._probe_config(probe, 1).compact).toBe(false);
    // The type's geometry is still there
    expect(off._probe_config(probe, 1).dots).toEqual({ top: 54, gap: 7 });
  });

  it("offers the switch in the editor", () => {
    const dev = hub({
      conf: { RSCONTROLPRO: { devices: { Hub: { compact_probes: true } } } },
    });
    const dom = toDom(dev.renderEditor());
    const input = dom.querySelector("#compact_probes") as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.checked).toBe(true);
  });
});

describe("RSControl buzzer", () => {
  it("sits on the LED of each model and opens its settings", () => {
    const pro: any = proConfig.elements;
    const lite: any = liteConfig.elements;
    expect(pro.buzzer.css.left).toBe("91.2%");
    expect(lite.buzzer.css.left).toBe("88.5%");
    expect(lite.buzzer.css.top).toBe("9.6%");
    expect(lite.buzzer.icon).toBe("mdi:bell-alert");
    expect(pro.buzzer.tap_action.data.type).toBe("buzzer_conf");
    const entities = (dialogs_rscontrol as any).buzzer_conf.content[0].conf
      .entities;
    expect(entities.map((e: any) => e.entity).filter(Boolean)).toContain(
      "danger_debounce_seconds",
    );
  });

  it("is green while quiet, blinks red while it sounds, red once dismissed", () => {
    const pro: any = proConfig.elements;
    const ctx = (state: string, dismissed: string) =>
      new SafeEval({
        state: state,
        entity: { buzzer_dismissed: { state: dismissed } },
      });
    const quiet = ctx("off", "off");
    const loud = ctx("on", "off");
    const dismissed = ctx("off", "on");
    expect(quiet.evaluate(pro.buzzer.icon_color)).toBe(COLOR_LEVEL_DESIRED_HEX);
    expect(quiet.evaluate(pro.buzzer.class)).toBe("");
    expect(loud.evaluate(pro.buzzer.icon_color)).toBe(COLOR_LEVEL_DANGER_HEX);
    expect(loud.evaluate(pro.buzzer.class)).toBe("blink-alert");
    expect(dismissed.evaluate(pro.buzzer.icon_color)).toBe(
      COLOR_LEVEL_DANGER_HEX,
    );
    expect(dismissed.evaluate(pro.buzzer.class)).toBe("");
    // Without the dismissed entity, only the buzzer itself counts
    expect(
      new SafeEval({ state: "off", entity: {} }).evaluate(
        pro.buzzer.icon_color,
      ),
    ).toBe(COLOR_LEVEL_DESIRED_HEX);
  });
});

describe("RSControl water", () => {
  function hub(states: Record<string, string>): any {
    const dev = new StubHub() as any;
    dev.get_entity = (key: string) =>
      key in states ? { state: states[key], attributes: {} } : null;
    return dev;
  }

  it("fills the ATO reservoir while the pump runs", () => {
    expect(hub({ port_type_1: "ato", port_state_1: "on" }).ato_pump_on()).toBe(
      true,
    );
    expect(
      hub({ port_type_2: "ato", port_state_2: "fallback_on" }).ato_pump_on(),
    ).toBe(true);
    expect(hub({ port_type_1: "ato", port_state_1: "off" }).ato_pump_on()).toBe(
      false,
    );
    expect(
      hub({ port_type_1: "other", port_state_1: "on" }).ato_pump_on(),
    ).toBe(false);
    const els: any = proConfig.elements;
    expect(els.ato_flow.type).toBe("flow-image");
    expect(els.ato_flow.disabled_if).toBe("!device.ato_pump_on()");
    expect(els.ato_flow.hide_when_stopped).toBe(true);
    expect(els.ato_reservoir.type).toBe("water-level");
    expect(els.ato_reservoir.disabled_if).toBe("!device.ato_pump_on()");
  });

  it("marks a wet leak probe with the side of the leak", () => {
    const probe = (state: string, origin?: string): any =>
      makeProbe("leak", {
        probe_primary: { state },
        ...(origin ? { probe_leak_status: { state: origin } } : {}),
      });
    const aquarium = probe("on", "aquarium_water_leak");
    expect(aquarium.leak_detected()).toBe(true);
    expect(aquarium.leak_icon()).toBe("mdi:fish");
    expect(probe("on", "rodi_water_leak").leak_icon()).toBe("mdi:cup-water");
    // Wet but not read yet, or no origin sensor: no icon
    expect(probe("on", "unknown").leak_icon()).toBe("");
    expect(probe("on").leak_icon()).toBe("");
    const dry = probe("off", "aquarium_water_leak");
    expect(dry.leak_detected()).toBe(false);
    expect(dry.leak_icon()).toBe("");
  });

  it("draws the sump water on the ATO probe at its marks", () => {
    const water = (proConfig as any).probes.common.types.ato.elements
      .water_level;
    expect(water.type).toBe("water-level");
    expect(Object.keys(water.levels)).toEqual([
      "below",
      "desired_level_1",
      "desired_level_2",
      "above",
    ]);
    const leak = (proConfig as any).probes.common.types.leak.elements;
    expect(leak.leak_puddle.disabled_if).toBe("!device.leak_detected()");
    expect(leak.leak_source.icon).toBe("${device.leak_icon()}");
  });
});

describe("ClickImage icon expression", () => {
  it("evaluates an icon that follows the device", () => {
    const img = new StubClick() as any;
    img.conf = { name: "x", icon: "${device.icon()}" };
    img.device = {
      entities: {},
      get_entity: () => null,
      config: {},
      is_on: () => true,
      icon: () => "mdi:fish",
    };
    img.stateObj = null;
    img._hass = { states: {} };
    const icon = toDom(img._render("")).querySelector("ha-icon") as any;
    expect(icon.icon).toBe("mdi:fish");
    // An empty result falls back to the image
    img.device.icon = () => "";
    expect(toDom(img._render("")).querySelector("ha-icon")).toBeNull();
    // So does an expression that evaluates to nothing
    img.evaluate = () => undefined;
    expect(toDom(img._render("")).querySelector("ha-icon")).toBeNull();
  });
});

describe("ClickImage colour expression", () => {
  it("evaluates a colour that follows the state", () => {
    const img = new StubClick() as any;
    img.conf = {
      name: "x",
      icon: "mdi:bell",
      icon_color: "${state === 'on' ? 'red' : 'green'}",
    };
    img.device = {
      entities: {},
      get_entity: () => null,
      config: {},
      is_on: () => true,
    };
    img.stateObj = { entity_id: "b.x", state: "on", attributes: {} };
    img._hass = { states: {} };
    const dom = toDom(img._render(""));
    expect(
      (dom.querySelector("ha-icon") as HTMLElement).getAttribute("style"),
    ).toContain("color: red");
  });
});

// ─── Level indicator ────────────────────────────────────────────────────────

describe("LevelIndicator", () => {
  function indicator(
    state: string | null,
    attributes: any = { ranges: TEMP_RANGES },
    conf: any = {},
  ): any {
    const elt = new StubIndicator() as any;
    elt.conf = { name: "power_temperature", ...conf };
    elt.device = {
      entities: {},
      get_entity: () => null,
      config: { compact_probes: true },
      is_on: () => true,
    };
    elt._hass = { states: {} };
    elt.stateObj =
      state === null ? null : { entity_id: "sensor.t", state, attributes };
    return elt;
  }

  it("reads the value, none when unavailable", () => {
    expect(indicator("25.5").value()).toBe(25.5);
    expect(Number.isNaN(indicator("unavailable").value())).toBe(true);
    expect(Number.isNaN(indicator(null).value())).toBe(true);
  });

  it("takes the device's level, else the bounds", () => {
    expect(indicator("25", { level: "danger" }).level()).toBe("danger");
    expect(indicator("27", { ranges: TEMP_RANGES }).level()).toBe("acceptable");
    expect(indicator("unknown").level()).toBe("error");
    expect(indicator("27", { level: "odd", ranges: TEMP_RANGES }).level()).toBe(
      "acceptable",
    );
  });

  it("is compact by flag or by expression", () => {
    expect(indicator("25", {}, { compact: true }).is_compact()).toBe(true);
    expect(indicator("25", {}, { compact: "true" }).is_compact()).toBe(true);
    expect(
      indicator(
        "25",
        {},
        {
          compact: "${device.config.compact_probes === true}",
        },
      ).is_compact(),
    ).toBe(true);
    expect(indicator("25", {}, {}).is_compact()).toBe(false);
  });

  it("draws a bar with a cursor at the reading", () => {
    const dom = toDom(indicator("24.5")._render());
    expect(dom.querySelectorAll(".zone")).toHaveLength(5);
    const cursor = dom.querySelector(".cursor") as HTMLElement;
    // 24.5 is in the desired zone: between 40% and 60% from the top
    const top = parseFloat(cursor.getAttribute("style")!.split(":")[1]!);
    expect(top).toBeGreaterThan(40);
    expect(top).toBeLessThan(60);
    expect(
      toDom(indicator("24.5", {})._render("")).querySelector(".cursor"),
    ).toBeNull();
  });

  it("draws a dot with the side of the range", () => {
    const high = toDom(
      indicator("27", { ranges: TEMP_RANGES }, { compact: true })._render(""),
    ).querySelector(".dot") as HTMLElement;
    expect(high.getAttribute("style")).toContain("width:10px");
    expect(high.getAttribute("style")).toContain(COLOR_LEVEL_ACCEPTABLE_HEX);
    expect(high.textContent!.trim()).toBe("+");
    const fine = toDom(
      indicator(
        "24",
        { ranges: TEMP_RANGES },
        {
          compact: true,
          dot_size: "8px",
          dot_css: { "margin-left": "3px" },
        },
      )._render(""),
    ).querySelector(".dot") as HTMLElement;
    expect(fine.getAttribute("style")).toContain("width:8px");
    expect(fine.getAttribute("style")).toContain("margin-left:3px");
    expect(fine.textContent!.trim()).toBe("");
    const none = toDom(
      indicator("unavailable", {}, { compact: true })._render(""),
    ).querySelector(".dot") as HTMLElement;
    expect(none.textContent!.trim()).toBe("");
  });
});

// ─── RSPower ────────────────────────────────────────────────────────────────

describe("RSPower local temperature", () => {
  function power(state: string | null, attributes: any = {}): any {
    const dev = new StubPower() as any;
    dev.get_entity = (key: string) =>
      key === "power_temperature" && state !== null
        ? { entity_id: "sensor.t", state, attributes }
        : null;
    return dev;
  }

  it("colours the value by its level", () => {
    expect(power("25", { level: "desired" }).temperature_color()).toBe(
      COLOR_LEVEL_DESIRED_HEX,
    );
    expect(
      power("30", { ranges: [24, 25, 26.5, 28] }).temperature_color(),
    ).toBe(COLOR_LEVEL_DANGER_HEX);
    expect(power("unknown").temperature_color()).toBe(COLOR_LEVEL_ERROR_HEX);
    expect(power(null).temperature_color()).toBe(COLOR_LEVEL_ERROR_HEX);
  });

  it("shows its level beside the probe on both models", () => {
    for (const conf of [power6, power8] as any[]) {
      const level = conf.elements.power_temperature_level;
      expect(level.type).toBe("level-indicator");
      expect(level.tap_action.data.type).toBe("power_temperature_history");
      expect(conf.elements.power_temperature.text_color).toBe(
        "${device.temperature_color()}",
      );
    }
  });

  it("offers the compact switch in the editor", () => {
    const dev = new StubPower() as any;
    dev._hass = { states: {}, entities: {}, devices: {} };
    dev.device = { name: "pw", elements: [] };
    dev.entities = {};
    dev.user_config = {};
    vi.spyOn(dev, "is_disabled").mockReturnValue(false);
    const dom = toDom(dev.renderEditor());
    expect(dom.querySelector("#compact_probes")).not.toBeNull();
  });
});

describe("Probe settings dialog", () => {
  it("offers to read the probe now, unless it is unplugged", () => {
    const other = (dialogs_rscontrol as any).probe_conf.other.conf;
    expect(other.tap_action[0]).toEqual({
      domain: "button",
      action: "press",
      data: { entity_id: "probe_get_value" },
    });
    const hidden = (entity: any): boolean =>
      new SafeEval({ entity }).evaluate(other.disabled_if);
    expect(hidden({})).toBe(true);
    expect(hidden({ probe_get_value: { state: "unavailable" } })).toBe(true);
    expect(hidden({ probe_get_value: { state: "unknown" } })).toBe(false);
  });
});

describe("RSControl connectivity and leak detection", () => {
  it("dims a leak probe the hub does not watch", () => {
    const leak = (entities: Record<string, string>): any =>
      makeProbe(
        "leak",
        Object.fromEntries(
          Object.entries(entities).map(([k, v]) => [k, { state: v }]),
        ),
      );
    expect(leak({ leak_detector_enabled: "off" }).leak_muted()).toBe(true);
    expect(leak({ leak_detector_enabled: "on" }).leak_muted()).toBe(false);
    // Without the setting, the state the hub reports
    expect(leak({ leak_detector: "off" }).leak_muted()).toBe(true);
    expect(leak({}).leak_muted()).toBe(false);
    // Only leak probes
    const ph = makeProbe("ph", { leak_detector_enabled: { state: "off" } });
    expect(ph.leak_muted()).toBe(false);
  });

  it("draws the dimmed probe", () => {
    const probe = makeProbe(
      "leak",
      { leak_detector_enabled: { state: "off" } },
      { image: "leak.png" },
    );
    probe._render_elements = vi.fn(() => "");
    const dom = toDom(probe._render());
    expect(dom.querySelector(".probe")!.classList.contains("muted")).toBe(true);
  });

  it("shows the hub connectivity in its settings", () => {
    expect((proConfig.elements as any).connectivity).toBeUndefined();
    const keys = (dialogs_rscontrol as any).config.content[0].conf.entities.map(
      (e: any) => e.entity,
    );
    for (const key of [
      "is_internet_connected",
      "cable_connected",
      "connected_power",
      "connected_power_state",
      "power_link_up",
    ]) {
      expect(keys).toContain(key);
    }
    // The wifi keeps its own dialog
    expect(keys).not.toContain("wifi_quality");
  });

  it("lists the detection, the port type and the hub mode", () => {
    const rows = (name: string): string[] =>
      (dialogs_rscontrol as any)[name].content[0].conf.entities.map(
        (e: any) => e.entity,
      );
    expect(rows("buzzer_conf")).toContain("leak_detector_enabled");
    expect(rows("buzzer_conf")).toContain("leak_detector");
    expect(rows("port_conf")).toContain("port_type");
    expect(rows("probe_conf")).toContain("probe_leak_detected");
    expect(rows("probe_conf")).toContain("control_mode");
  });
});
