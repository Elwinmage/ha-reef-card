/**
 * Tests for the RSATO+ card editor options.
 *
 * The three options all work the same way: they rewrite the merged element
 * configuration in `update_config()` rather than the mapping, so what is
 * asserted here is the shape of `config.elements` for a given user config.
 *
 * They exist for a top-off loop the ReefATO+ was not designed for — an RO unit
 * plumbed straight to the sump, with a valve driven by Home Assistant instead
 * of the Red Sea pump — so the rewrites have to hold up when there is no pump
 * to speak of.
 */

import { beforeAll, describe, expect, it, vi } from "vitest";
import { render } from "lit";

import { RSAto } from "../src/devices/redsea/rsato/rsato";
import { RSDevice } from "../src/devices/device";
// Registers redsea-rsato and the other device tags.
import "../src/devices/index";
// Registers click-image, history-chart and the rest: create_element() and
// the element constructors go through the custom element registry.
import "../src/base/index";
import { MyElement } from "../src/base/element";
import { HistoryChart } from "../src/base/history_chart";
import { SafeEval } from "../src/utils/SafeEval";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

if (!customElements.get("test-rsato-options")) {
  customElements.define("test-rsato-options", class extends RSAto {});
}

/**
 * Build an RSAto carrying the given editor options.
 * @param options: what the editor stored at device level
 * @param states: the hass states the picked entities resolve against
 */
function makeAto(
  options: Record<string, any> = {},
  states: Record<string, any> = {},
): any {
  const device: any = new (customElements.get("test-rsato-options") as any)();
  device.device = {
    model: "RSATO",
    name: "ato",
    // is_disabled() reads disabled_by, and undefined is not null: an
    // element without it looks disabled in Home Assistant.
    elements: [{ model: "RSATO", id: "device_id", disabled_by: null }],
  };
  device.entities = {};
  device._hass = { states, entities: {}, callService: vi.fn() };
  device.setConfig({ conf: { RSATO: { devices: { ato: options } } } });
  device.update_config();
  return device;
}

/** A hass state object, reduced to what the card reads. */
function stateOf(entity_id: string): Record<string, any> {
  return { [entity_id]: { entity_id, state: "off", attributes: {} } };
}

/** Collect the config a rendered editor control emits when the user acts. */
function editorHost(device: any): { host: HTMLElement; changes: any[] } {
  const host = document.createElement("div");
  const changes: any[] = [];
  device.addEventListener("config-changed", (e: any) =>
    changes.push(e.detail.config),
  );
  render(device.renderEditor(), host);
  return { host, changes };
}

/** The device-level options of an emitted config. */
function storedOptions(config: any): Record<string, any> {
  return config.conf.RSATO.devices.ato;
}

//----------------------------------------------------------------------------//
//   Defaults
//----------------------------------------------------------------------------//

describe("RSAto without options", () => {
  it("leaves every element as the mapping declares it", () => {
    const elements = makeAto().config.elements;
    expect(elements.volume_left.tap_action).toBeDefined();
    expect(elements.volume_left.show_value).toBeUndefined();
    expect(elements.days_till_empty.label).toBeUndefined();
    expect(elements.days_till_empty.tap_action).toBeDefined();
    expect(elements.pump_settings.disabled_if).toBe("!device.has_pump()");
    expect(elements.resume.disabled_if).toBe("!device.has_pump()");
    expect(elements.fill.icon).toBe("state");
    expect(elements.today_usage_sparkline.entities[0].entity).toBe(
      "today_volume_usage",
    );
  });

  it("reports each option as off", () => {
    const device = makeAto();
    expect(device.infinite_tank()).toBe(false);
    expect(device.external_usage_entity()).toBe("");
    expect(device.fill_entity()).toBe("");
    expect(device.stop_fill_entity()).toBe("");
  });
});

//----------------------------------------------------------------------------//
//   Infinite reservoir
//----------------------------------------------------------------------------//

describe("RSAto infinite reservoir", () => {
  const elements = () => makeAto({ infinite_tank: true }).config.elements;

  it("drops what only makes sense for a container", () => {
    const els = elements();
    // A percentage of an unlimited supply, and a dialog holding the capacity
    // of a tank that does not exist.
    expect(els.volume_left.show_value).toBe(false);
    expect(els.volume_left.tap_action).toBeUndefined();
  });

  it("shows an autonomy that never ends", () => {
    const els = elements();
    expect(els.days_till_empty.unit).toBe("");
    // more-info would show the very number the label replaces.
    expect(els.days_till_empty.tap_action).toBeUndefined();
    // The label is an expression, so the quotes are what make it a string.
    const evaluated = new SafeEval({}).evaluate(els.days_till_empty.label);
    expect(evaluated).toBe("∞");
  });

  it("recentres the label the unit no longer balances", () => {
    // The box is sized for "5 Days" and left-aligned: a lone glyph would sit
    // against its left edge.
    expect(elements().days_till_empty.css.left).toBe("7%");
  });

  it("hides the controls of a fill cycle it does not have", () => {
    const els = elements();
    for (const key of ["pump_settings", "resume"]) {
      expect(els[key].disabled_if).toBe(true);
      // Absolutely positioned: a fallback <br> would shift the whole card.
      expect(els[key].no_br_if_disabled).toBe(true);
    }
  });

  it("leaves the fill controls alone", () => {
    // Filling is still filling: only the reservoir became boundless.
    const els = elements();
    expect(els.fill.icon).toBe("state");
    expect(els.stop_fill.tap_action.domain).toBe("button");
  });
});

//----------------------------------------------------------------------------//
//   External volume source
//----------------------------------------------------------------------------//

describe("RSAto external volume source", () => {
  it("redirects the daily curve to the picked entity", () => {
    const device = makeAto({
      external_usage: true,
      external_usage_entity: "sensor.rodi_meter",
    });
    const series = device.config.elements.today_usage_sparkline.entities;
    expect(series[0].entity).toBe("sensor.rodi_meter");
    // The running average is the device's own: only the source of the volume
    // moved, not the comparison it is drawn against.
    expect(series[1].entity).toBe("daily_volume_average");
  });

  it("ignores the entity while the switch is off", () => {
    // Turning the option off must fall back to the device counter rather than
    // keep reading an entity the user stopped asking for.
    const device = makeAto({ external_usage_entity: "sensor.rodi_meter" });
    expect(device.external_usage_entity()).toBe("");
    expect(
      device.config.elements.today_usage_sparkline.entities[0].entity,
    ).toBe("today_volume_usage");
  });

  it("ignores a switch turned on with no entity picked", () => {
    const device = makeAto({ external_usage: true });
    expect(
      device.config.elements.today_usage_sparkline.entities[0].entity,
    ).toBe("today_volume_usage");
  });
});

//----------------------------------------------------------------------------//
//   External fill controls
//----------------------------------------------------------------------------//

describe("RSAto external fill controls", () => {
  it("binds the fill button to the picked entity", () => {
    const els = makeAto({ fill_entity: "switch.rodi_valve" }).config.elements;
    expect(els.fill.name).toBe("switch.rodi_valve");
    // `icon: "state"` reads the icon off a device entity this control no
    // longer has.
    expect(els.fill.icon).toBe("mdi:water-pump");
    // Someone driving their own valve typically has no Red Sea pump paired.
    expect(els.fill.disabled_if).toBeUndefined();
    expect(els.fill.tap_action).toEqual({
      domain: "switch",
      action: "turn_on",
      data: "default",
    });
  });

  it("binds the stop button to the picked entity", () => {
    const els = makeAto({
      stop_fill_entity: "button.rodi_stop",
    }).config.elements;
    expect(els.stop_fill.name).toBe("button.rodi_stop");
    expect(els.stop_fill.icon).toBe("mdi:water-pump-off");
    expect(els.stop_fill.tap_action).toEqual({
      domain: "button",
      action: "press",
      data: "default",
    });
    // The other control was not picked: it stays on the device button.
    expect(els.fill.icon).toBe("state");
  });

  it("derives the service from the domain of the entity", () => {
    const cases: [string, string, string][] = [
      // domain, fill service, stop service
      ["input_boolean.rodi", "turn_on", "turn_off"],
      ["valve.rodi", "open_valve", "close_valve"],
      // A press has no direction, which is why the two controls are picked
      // separately: the same button would start and stop.
      ["button.rodi", "press", "press"],
      ["input_button.rodi", "press", "press"],
      ["script.rodi_fill", "turn_on", "turn_on"],
    ];
    for (const [entity_id, on, off] of cases) {
      const els = makeAto({
        fill_entity: entity_id,
        stop_fill_entity: entity_id,
      }).config.elements;
      expect(els.fill.tap_action.domain).toBe(entity_id.split(".")[0]);
      expect(els.fill.tap_action.action).toBe(on);
      expect(els.stop_fill.tap_action.action).toBe(off);
    }
  });

  it("drives both controls from a single switch", () => {
    // on fills, off stops: picking the same entity twice would be asking the
    // user to say the same thing again.
    const els = makeAto({ fill_entity: "switch.rodi_valve" }).config.elements;
    expect(els.stop_fill.name).toBe("switch.rodi_valve");
    expect(els.stop_fill.tap_action).toEqual({
      domain: "switch",
      action: "turn_off",
      data: "default",
    });
  });

  it("mirrors a two-state entity picked for the stop control", () => {
    const els = makeAto({
      stop_fill_entity: "valve.rodi",
    }).config.elements;
    expect(els.fill.tap_action.action).toBe("open_valve");
    expect(els.stop_fill.tap_action.action).toBe("close_valve");
  });

  it("never mirrors a press-once entity", () => {
    // A press has no direction: the same button cannot mean both.
    const els = makeAto({ fill_entity: "button.rodi" }).config.elements;
    expect(els.stop_fill.icon).toBe("state");
    expect(els.stop_fill.tap_action.domain).toBe("button");
    expect(els.stop_fill.name).toBe("stop_fill");
  });

  it("keeps two entities apart when both are picked", () => {
    const els = makeAto({
      fill_entity: "switch.rodi_valve",
      stop_fill_entity: "switch.other_valve",
    }).config.elements;
    expect(els.fill.name).toBe("switch.rodi_valve");
    expect(els.stop_fill.name).toBe("switch.other_valve");
  });

  it("trims what the user typed", () => {
    const device = makeAto({ fill_entity: "  switch.rodi_valve  " });
    expect(device.fill_entity()).toBe("switch.rodi_valve");
  });

  it("ignores an empty entity", () => {
    const els = makeAto({ fill_entity: "   " }).config.elements;
    expect(els.fill.icon).toBe("state");
    expect(els.stop_fill.icon).toBe("state");
  });
});

//----------------------------------------------------------------------------//
//   Mapping without the rewritten elements
//----------------------------------------------------------------------------//

describe("RSAto options on a stripped mapping", () => {
  // The options rewrite elements by name. Nothing guarantees a future mapping
  // still declares them, and an editor option must not be able to take the
  // card down.
  const options = {
    infinite_tank: true,
    external_usage: true,
    external_usage_entity: "sensor.rodi_meter",
    fill_entity: "switch.rodi_valve",
    stop_fill_entity: "button.rodi_stop",
  };

  it("skips the elements it cannot find", () => {
    const device = makeAto(options);
    device.initial_config = { ...device.initial_config, elements: {} };
    expect(() => device.update_config()).not.toThrow();
    expect(device.config.elements).toEqual({});
  });

  it("skips an element declared without css", () => {
    const device = makeAto(options);
    device.initial_config = {
      ...device.initial_config,
      elements: { days_till_empty: { name: "days_till_empty" } },
    };
    expect(() => device.update_config()).not.toThrow();
    expect(device.config.elements.days_till_empty.css).toBeUndefined();
  });

  it("skips a configuration with no elements at all", () => {
    const device = makeAto(options);
    device.initial_config = { model: "RSATO" };
    expect(() => device.update_config()).not.toThrow();
  });
});

//----------------------------------------------------------------------------//
//   Raw entity ids
//----------------------------------------------------------------------------//

describe("entities of another integration", () => {
  it("resolves an element named by its entity_id", () => {
    // An entity picked in the editor belongs to another integration: it has
    // no translation key, so the entity_id itself is the name.
    const hass: any = { states: stateOf("switch.rodi_valve"), entities: {} };
    const device = makeAto({}, hass.states);
    const element = MyElement.create_element(
      hass,
      { type: "click-image", name: "switch.rodi_valve" } as any,
      device,
    );
    expect(element.stateObj?.entity_id).toBe("switch.rodi_valve");
  });

  it("resolves a chart series named by its entity_id", () => {
    const chart: any = new HistoryChart();
    chart.device = { get_entity: () => null };
    chart._hass = { states: stateOf("sensor.rodi_meter") };
    chart.conf = { name: "sensor.rodi_meter" };
    expect(chart.resolve_entity_id("sensor.rodi_meter")).toBe(
      "sensor.rodi_meter",
    );
    expect(chart.resolve_entity_id("sensor.unknown_one")).toBeNull();
  });
});

//----------------------------------------------------------------------------//
//   Config round trip
//----------------------------------------------------------------------------//

describe("options of a device whose reported model differs", () => {
  /**
   * Build an RSAto as Home Assistant describes it: the integration reports
   * the model as RSATO+, while the mapping calls itself RSATO.
   */
  function makeReported(): any {
    const device: any = new (customElements.get("test-rsato-options") as any)();
    device.device = {
      model: "RSATO",
      name: "ato",
      elements: [{ model: "RSATO+", id: "device_id", disabled_by: null }],
    };
    device.entities = {};
    device._hass = { states: {}, entities: {}, callService: vi.fn() };
    device.setConfig({});
    device.update_config();
    return device;
  }

  it("reads back what the editor wrote", () => {
    // The two sides used different keys: options were written under the
    // mapping model and read under the reported one, so every switch went
    // straight back to off.
    const device = makeReported();
    const changes: any[] = [];
    device.addEventListener("config-changed", (e: any) =>
      changes.push(e.detail.config),
    );

    device.set_config_value("infinite_tank", true);
    device.setConfig(changes[0]);
    device.update_config();

    expect(device.infinite_tank()).toBe(true);
    expect(device.config.elements.days_till_empty.unit).toBe("");
  });

  it("reads back a hidden element too", () => {
    const device = makeReported();
    const changes: any[] = [];
    device.addEventListener("config-changed", (e: any) =>
      changes.push(e.detail.config),
    );

    device.handleChangedDeviceEvent({
      currentTarget: { checked: true },
      target: { id: "last_message" },
    });
    device.setConfig(changes[0]);
    device.update_config();

    expect(device.config.elements.last_message.disabled_if).toBe(true);
  });

  it("falls back to the mapping model when no device is attached", () => {
    const device = makeAto();
    device.device = null;
    expect(device.config_model()).toBe("RSATO");
  });
});

//----------------------------------------------------------------------------//
//   Element tag
//----------------------------------------------------------------------------//

describe("device tag of a model", () => {
  it("drops the + of a model name", () => {
    // The ReefATO+ reports RSATO+, and "+" cannot appear in a custom element
    // name: the editor built the tag on its own, kept the +, and found
    // nothing to instantiate.
    expect(RSDevice.tag_for_model("RSATO+")).toBe("redsea-rsato");
    expect(customElements.get(RSDevice.tag_for_model("RSATO+"))).toBeDefined();
  });

  it("leaves a plain model alone", () => {
    expect(RSDevice.tag_for_model("RSMAT")).toBe("redsea-rsmat");
  });
});

//----------------------------------------------------------------------------//
//   Editor
//----------------------------------------------------------------------------//

// The two picker tests below are ordered: `ha-entity-picker` cannot be
// undefined once registered, so the fallback is exercised first.

describe("RSAto editor without ha-entity-picker", () => {
  it("stores a toggled switch", () => {
    const device = makeAto();
    const { host, changes } = editorHost(device);
    const input = host.querySelector("#infinite_tank") as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event("change"));
    expect(storedOptions(changes[0]).infinite_tank).toBe(true);
  });

  it("reflects a stored switch", () => {
    const device = makeAto({ infinite_tank: true });
    const { host } = editorHost(device);
    expect(
      (host.querySelector("#infinite_tank") as HTMLInputElement).checked,
    ).toBe(true);
  });

  it("falls back to a plain select over the matching states", () => {
    const states = {
      ...stateOf("switch.rodi_valve"),
      ...stateOf("sensor.rodi_meter"),
      ...stateOf("light.sump"),
    };
    const device = makeAto({}, states);
    const { host, changes } = editorHost(device);

    const fill = host.querySelector("#fill_entity") as HTMLSelectElement;
    const offered = Array.from(fill.options).map((o) => o.value);
    // A light cannot fill anything, and the empty option is what unsets it.
    expect(offered).toContain("switch.rodi_valve");
    expect(offered).not.toContain("light.sump");
    expect(offered).not.toContain("sensor.rodi_meter");
    expect(offered[0]).toBe("");

    fill.value = "switch.rodi_valve";
    fill.dispatchEvent(new Event("change"));
    expect(storedOptions(changes[0]).fill_entity).toBe("switch.rodi_valve");
  });

  it("offers volume entities to the volume picker only", () => {
    const states = {
      ...stateOf("sensor.rodi_meter"),
      ...stateOf("switch.rodi_valve"),
    };
    const { host } = editorHost(makeAto({}, states));
    const usage = host.querySelector(
      "#external_usage_entity",
    ) as HTMLSelectElement;
    const offered = Array.from(usage.options).map((o) => o.value);
    expect(offered).toContain("sensor.rodi_meter");
    expect(offered).not.toContain("switch.rodi_valve");
  });

  it("offers an empty list before hass arrives", () => {
    // The editor can be rendered by Home Assistant before it hands the card
    // its states: an empty picker beats a crash.
    const device = makeAto();
    device._hass = null;
    const { host } = editorHost(device);
    const fill = host.querySelector("#fill_entity") as HTMLSelectElement;
    expect(Array.from(fill.options).map((o) => o.value)).toEqual([""]);
  });

  it("renders nothing for a device disabled in Home Assistant", () => {
    const device = makeAto();
    device.is_disabled = () => true;
    const { host } = editorHost(device);
    expect(host.querySelector("#infinite_tank")).toBeNull();
  });
});

describe("RSAto editor with ha-entity-picker", () => {
  // Registered in beforeAll, not in the suite body: describe callbacks all
  // run at collection time, which would define the element before the
  // fallback suite above ever runs.
  beforeAll(() => {
    if (!customElements.get("ha-entity-picker")) {
      customElements.define("ha-entity-picker", class extends HTMLElement {});
    }
  });

  it("prefers the Home Assistant picker", () => {
    const device = makeAto({ fill_entity: "switch.rodi_valve" });
    const { host, changes } = editorHost(device);
    const pickers = host.querySelectorAll("ha-entity-picker");
    // One per entity option: volume source, fill, stop fill.
    expect(pickers.length).toBe(3);
    expect(host.querySelector("select")).toBeNull();

    pickers[1].dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: "button.rodi" } }),
    );
    expect(storedOptions(changes[0]).fill_entity).toBe("button.rodi");
  });

  it("stores an emptied picker", () => {
    // Clearing the picker sends a value-changed with nothing in it, which is
    // how the user hands the control back to the device button.
    const device = makeAto({ fill_entity: "switch.rodi_valve" });
    const { host, changes } = editorHost(device);
    const pickers = host.querySelectorAll("ha-entity-picker");
    pickers[1].dispatchEvent(new CustomEvent("value-changed", { detail: {} }));
    expect(storedOptions(changes[0]).fill_entity).toBe("");
  });
});
