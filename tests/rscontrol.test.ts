// Tests for RSControl device family and its ReefSense probes
// Covers: src/devices/redsea/rscontrol/rscontrol.ts
//         src/devices/redsea/rscontrol/control_probe.ts
//         src/devices/redsea/rscontrol/rscontrol.common.mapping.ts
//         src/devices/redsea/rscontrol/rscontrollite.mapping.ts
//         src/devices/redsea/rscontrol/rscontrolpro.mapping.ts

import { describe, expect, it, vi } from "vitest";
import { render, nothing } from "lit";
import {
  RSControl,
  RSControlLite,
  RSControlPro,
} from "../src/devices/redsea/rscontrol/rscontrol";
import {
  ControlProbe,
  bar_position,
  level_color,
  level_from_ranges,
  parse_ranges,
  probe_aliases,
} from "../src/devices/redsea/rscontrol/control_probe";
import { RSDevice } from "../src/devices/device";
import { SafeEval } from "../src/utils/SafeEval";
import { config as liteConfig } from "../src/devices/redsea/rscontrol/rscontrollite.mapping";
import { config2 as proConfig } from "../src/devices/redsea/rscontrol/rscontrolpro.mapping";
import {
  COLOR_LEVEL_ACCEPTABLE_HEX,
  COLOR_LEVEL_DANGER_HEX,
  COLOR_LEVEL_DESIRED_HEX,
  COLOR_LEVEL_ERROR_HEX,
} from "../src/utils/colors";
import "../src/devices/index";

// --- Register stub custom elements so LitElement lifecycle works in jsdom ---
class StubRSControl extends RSControl {}
if (!customElements.get("stub-rscontrol"))
  customElements.define("stub-rscontrol", StubRSControl);

class StubRSControlLite extends RSControlLite {}
if (!customElements.get("stub-rscontrollite"))
  customElements.define("stub-rscontrollite", StubRSControlLite);

class StubRSControlPro extends RSControlPro {}
if (!customElements.get("stub-rscontrolpro"))
  customElements.define("stub-rscontrolpro", StubRSControlPro);

class StubControlProbe extends ControlProbe {}
if (!customElements.get("stub-control-probe"))
  customElements.define("stub-control-probe", StubControlProbe);

// ─── Helpers ────────────────────────────────────────────────────────────────

const PH_RANGES = [7.6, 7.9, 8.4, 8.6];
const TEMP_RANGES = [21, 23, 26, 28];

interface Spec {
  id: string;
  key: string;
  state?: string;
  attrs?: Record<string, any>;
  device?: string;
}

/** Registry + states for a hub; entities belong to device "hub" by default. */
function makeHass(specs: Spec[] = [], devices: Record<string, any> = {}): any {
  const entities: Record<string, any> = {};
  const states: Record<string, any> = {};
  for (const spec of specs) {
    entities[spec.id] = {
      entity_id: spec.id,
      device_id: spec.device ?? "hub",
      translation_key: spec.key,
    };
    if (spec.state !== undefined) {
      states[spec.id] = {
        entity_id: spec.id,
        state: spec.state,
        attributes: spec.attrs ?? {},
      };
    }
  }
  return { states, entities, devices, callService: vi.fn() };
}

/** A probe entity spec. */
function probeSpec(
  id: string,
  key: string,
  state: string,
  type: string,
  uid: string,
  index: number | null,
  extra: Record<string, any> = {},
): Spec {
  return {
    id,
    key,
    state,
    attrs: { probe_uid: uid, probe_type: type, probe_index: index, ...extra },
  };
}

/** A hub wired to the given hass, with its device entry. */
function makeHub(hass: any, Klass: any = StubRSControlPro): any {
  const dev = new Klass() as any;
  dev.device = { name: "hub", elements: [{ id: "hub" }] };
  dev._hass = hass;
  dev.update_config();
  dev._scan_entities();
  return dev;
}

/** A standalone probe element with the given entities (key → state). */
function makeProbe(
  type: string,
  states: Record<string, { state: string; attrs?: Record<string, any> }>,
  conf: any = {},
): any {
  const probe = new StubControlProbe() as any;
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

/** Render a template into a detached container. */
function toDom(template: any): HTMLElement {
  const div = document.createElement("div");
  render(template, div);
  return div;
}

// ─── Pure helpers ───────────────────────────────────────────────────────────

describe("parse_ranges", () => {
  it("accepts four numbers", () => {
    expect(parse_ranges([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  it.each([
    null,
    undefined,
    "1,2,3,4",
    [1, 2, 3],
    [1, "2", 3, 4],
    [1, NaN, 3, 4],
  ])("rejects %s", (raw) => {
    expect(parse_ranges(raw)).toBeNull();
  });
});

describe("level_from_ranges", () => {
  it.each([
    [8.0, "desired"],
    [7.9, "desired"],
    [8.4, "desired"],
    [7.7, "acceptable"],
    [8.5, "acceptable"],
    [7.0, "danger"],
    [9.0, "danger"],
  ])("places %s as %s", (value, level) => {
    expect(level_from_ranges(value, PH_RANGES)).toBe(level);
  });

  it("is an error without a reading or bounds", () => {
    expect(level_from_ranges(NaN, PH_RANGES)).toBe("error");
    expect(level_from_ranges(8, null)).toBe("error");
  });
});

describe("level_color", () => {
  it("maps each level to its colour", () => {
    expect(level_color("desired")).toBe(COLOR_LEVEL_DESIRED_HEX);
    expect(level_color("acceptable")).toBe(COLOR_LEVEL_ACCEPTABLE_HEX);
    expect(level_color("danger")).toBe(COLOR_LEVEL_DANGER_HEX);
    expect(level_color("error")).toBe(COLOR_LEVEL_ERROR_HEX);
  });
});

describe("bar_position", () => {
  const r = [0, 10, 20, 30];

  it("cannot place without a reading or bounds", () => {
    expect(bar_position(NaN, r)).toBeNull();
    expect(bar_position(5, null)).toBeNull();
  });

  it("maps each zone boundary onto a fifth of the bar", () => {
    expect(bar_position(30, r)).toBeCloseTo(0.2);
    expect(bar_position(20, r)).toBeCloseTo(0.4);
    expect(bar_position(10, r)).toBeCloseTo(0.6);
    expect(bar_position(0, r)).toBeCloseTo(0.8);
  });

  it("is linear inside a zone", () => {
    expect(bar_position(25, r)).toBeCloseTo(0.3);
    expect(bar_position(15, r)).toBeCloseTo(0.5);
    expect(bar_position(5, r)).toBeCloseTo(0.7);
  });

  it("extends the danger zones then clamps", () => {
    expect(bar_position(35, r)).toBeCloseTo(0.1);
    expect(bar_position(100, r)).toBeCloseTo(0);
    expect(bar_position(-5, r)).toBeCloseTo(0.9);
    expect(bar_position(-100, r)).toBeCloseTo(1);
  });

  it("survives zero-width zones", () => {
    const flat = [10, 10, 10, 10];
    expect(bar_position(12, flat)).toBeCloseTo(0);
    expect(bar_position(10, flat)).toBeCloseTo(0.2);
    expect(bar_position(8, flat)).toBeCloseTo(1);
    // Desired zone of zero width, reached from above the acceptable low
    expect(bar_position(10, [0, 10, 10, 30])).toBeCloseTo(0.4);
  });
});

describe("probe_aliases", () => {
  it("aliases the main reading and the embedded temperature", () => {
    const ents: Record<string, any> = {
      probe_ph_value: { entity_id: "a" },
      probe_temperature: { entity_id: "b" },
    };
    const res = probe_aliases("ph", ents);
    expect(res.probe_primary).toBe(ents.probe_ph_value);
    expect(res.probe_secondary).toBe(ents.probe_temperature);
    // The input map is left untouched
    expect(ents.probe_primary).toBeUndefined();
  });

  it("uses the temperature as main reading of a temperature probe", () => {
    const ents = { probe_temperature: { entity_id: "b" } };
    const res = probe_aliases("temperature", ents);
    expect(res.probe_primary).toBe(ents.probe_temperature);
    expect(res.probe_secondary).toBeUndefined();
  });

  it("adds nothing when the entities are missing", () => {
    const res = probe_aliases("orp", {});
    expect(res.probe_primary).toBeUndefined();
    expect(res.probe_secondary).toBeUndefined();
  });
});

// ─── ControlProbe ───────────────────────────────────────────────────────────

describe("ControlProbe predicates", () => {
  it("prints the main reading except for ATO and leak probes", () => {
    const st = { probe_primary: { state: "1" } };
    expect(makeProbe("ph", st).show_primary()).toBe(true);
    expect(makeProbe("ato", st).show_primary()).toBe(false);
    expect(makeProbe("leak", st).show_primary()).toBe(false);
    expect(makeProbe("ph", {}).show_primary()).toBe(false);
  });

  it("has a secondary reading only with its entity", () => {
    expect(
      makeProbe("ph", { probe_secondary: { state: "25" } }).has_secondary(),
    ).toBe(true);
    expect(makeProbe("orp", {}).has_secondary()).toBe(false);
  });

  it.each(["disconnected", "Not_Connected", "offline"])(
    "is disconnected on status %s",
    (status) => {
      expect(
        makeProbe("ph", { probe_status: { state: status } }).is_disconnected(),
      ).toBe(true);
    },
  );

  it("is disconnected when its main reading is unavailable", () => {
    expect(
      makeProbe("ph", {
        probe_status: { state: "auto" },
        probe_primary: { state: "unavailable" },
      }).is_disconnected(),
    ).toBe(true);
  });

  it("is connected otherwise, even without a status entity", () => {
    expect(
      makeProbe("ph", { probe_primary: { state: "8.1" } }).is_disconnected(),
    ).toBe(false);
  });
});

describe("ControlProbe levels and colours", () => {
  it("trusts the hub's level first", () => {
    const probe = makeProbe("ph", {
      probe_primary: { state: "8.1", attrs: { ranges: PH_RANGES } },
      probe_level: { state: "danger" },
      probe_secondary: { state: "25" },
      probe_temp_level: { state: "sensor_data_error" },
    });
    expect(probe.primary_level()).toBe("danger");
    expect(probe.primary_color()).toBe(COLOR_LEVEL_DANGER_HEX);
    expect(probe.secondary_level()).toBe("error");
    expect(probe.secondary_color()).toBe(COLOR_LEVEL_ERROR_HEX);
  });

  it("falls back on the bounds when the hub gives no level", () => {
    const probe = makeProbe("ph", {
      probe_primary: { state: "8.1", attrs: { ranges: PH_RANGES } },
      probe_level: { state: "unknown" },
      probe_secondary: { state: "27", attrs: { ranges: TEMP_RANGES } },
    });
    expect(probe.primary_level()).toBe("desired");
    expect(probe.secondary_level()).toBe("acceptable");
  });

  it("is an error without an entity or when disconnected", () => {
    expect(makeProbe("ph", {}).primary_level()).toBe("error");
    const probe = makeProbe("ph", {
      probe_primary: { state: "8.1", attrs: { ranges: PH_RANGES } },
      probe_level: { state: "desired" },
      probe_status: { state: "disconnected" },
    });
    expect(probe.primary_level()).toBe("error");
  });
});

describe("ControlProbe picture", () => {
  const conf = {
    image: "ph_temp.png",
    img_css: { width: "106.7%" },
    aspect: 7.7,
    bar: { top: 50, bottom: 99, left: [9, 25], right: [79, 95] },
    no_temp: {
      image: "ph.png",
      img_css: { width: "100%" },
      aspect: 8.3,
      bar: { top: 50, bottom: 99, left: [4, 20] },
    },
  };

  it("uses the temperature picture when the probe has one", () => {
    const probe = makeProbe("ph", { probe_secondary: { state: "25" } }, conf);
    expect(probe.probe_image()).toBe("ph_temp.png");
    expect(probe.view().aspect).toBe(7.7);
  });

  it("switches the whole geometry to the no_temp variant", () => {
    const view = makeProbe("ph", {}, conf).view();
    expect(view.image).toBe("ph.png");
    expect(view.img_css).toEqual({ width: "100%" });
    expect(view.aspect).toBe(8.3);
    // Replaced, not merged: no stray right bar
    expect(view.bar.right).toBeUndefined();
    expect(view.bar.left).toEqual([4, 20]);
  });

  it("uses the type picture otherwise", () => {
    expect(makeProbe("orp", {}, { image: "orp.png" }).probe_image()).toBe(
      "orp.png",
    );
    expect(makeProbe("orp", {}, {}).probe_image()).toBe("");
    const bare = makeProbe("orp", {});
    bare.config = null;
    expect(bare.view()).toEqual({});
  });
});

describe("ControlProbe render", () => {
  const bar = { top: 50, bottom: 100, left: [0, 20], right: [80, 100] };

  it("renders nothing before config, hass and entities", () => {
    const probe = makeProbe("ph", {});
    probe.config = null;
    expect(toDom(probe.render()).querySelector(".probe")).toBeNull();
    const probe2 = makeProbe("ph", {});
    probe2._hass = null;
    expect(toDom(probe2._render()).querySelector(".probe")).toBeNull();
    const probe3 = makeProbe("ph", {});
    probe3.entities = null;
    expect(toDom(probe3._render()).querySelector(".probe")).toBeNull();
  });

  it("renders the picture, greyed when the hub is off", () => {
    const probe = makeProbe("orp", {}, { image: "orp.png", img_css: {} });
    probe._render_elements = vi.fn(() => "");
    probe.state_on = false;
    const dom = toDom(probe._render());
    const img = dom.querySelector("img.probe_img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("orp.png");
    expect(img.classList.contains("off")).toBe(true);
    expect(dom.querySelector(".probe")!.classList.contains("blink-alert")).toBe(
      false,
    );
  });

  it("draws everything inside a box sized by the picture", () => {
    const probe = makeProbe(
      "orp",
      {},
      { image: "orp.png", img_css: { width: "110%", left: "-5%" } },
    );
    probe._render_elements = vi.fn(() => "");
    const dom = toDom(probe._render());
    const box = dom.querySelector(".probe .probe_box") as HTMLElement;
    expect(box.getAttribute("style")).toBe("width:110%;left:-5%");
    expect(box.querySelector("img.probe_img")).not.toBeNull();
    // The picture fills the box: its own size comes from the box
    expect(box.querySelector("img")!.getAttribute("style")).toBeNull();
  });

  it("blinks a disconnected probe", () => {
    const probe = makeProbe(
      "orp",
      { probe_status: { state: "disconnected" } },
      { image: "orp.png" },
    );
    probe._render_elements = vi.fn(() => "");
    probe.state_on = true;
    const dom = toDom(probe._render());
    expect(dom.querySelector(".probe")!.classList.contains("blink-alert")).toBe(
      true,
    );
    expect(dom.querySelector("img")!.classList.contains("off")).toBe(false);
  });

  it("draws no bar without geometry or reading", () => {
    expect(makeProbe("leak", {}, {})._render_bars()).toBe(nothing);
    expect(makeProbe("orp", {}, { bar })._render_bars()).toBe(nothing);
    const noconf = makeProbe("orp", {});
    noconf.config = null;
    expect(noconf._render_bars()).toBe(nothing);
  });

  it("splits the bar between the reading and the temperature", () => {
    const probe = makeProbe(
      "ph",
      {
        probe_primary: { state: "8.7", attrs: { ranges: PH_RANGES } },
        probe_secondary: { state: "24", attrs: { ranges: TEMP_RANGES } },
      },
      { bar, aspect: 8 },
    );
    const spy = vi.spyOn(probe, "_render_bar");
    toDom(probe._render_bars());
    expect(spy.mock.calls[0][2].value).toBe(8.7);
    expect(spy.mock.calls[1][2].value).toBe(24);
  });

  it("puts the main reading left and the temperature right", () => {
    const probe = makeProbe(
      "ph",
      {
        probe_primary: { state: "8.7", attrs: { ranges: PH_RANGES } },
        probe_secondary: { state: "24", attrs: { ranges: TEMP_RANGES } },
      },
      { bar },
    );
    const spy = vi.spyOn(probe, "_render_bar");
    toDom(probe._render_bars());
    expect(spy.mock.calls[0][1]).toBe(bar.left);
    expect(spy.mock.calls[0][2].value).toBe(8.7);
    expect(spy.mock.calls[1][1]).toBe(bar.right);
    expect(spy.mock.calls[1][2].value).toBe(24);
  });

  it("draws a main reading alone on the left", () => {
    // ORP: no temperature, one bar on the left
    const orp = makeProbe(
      "orp",
      {
        probe_primary: {
          state: "300",
          attrs: { ranges: [100, 200, 400, 480] },
        },
      },
      { bar: { top: 50, bottom: 99, left: [5, 21] } },
    );
    const spy = vi.spyOn(orp, "_render_bar");
    const dom = toDom(orp._render_bars());
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][1]).toEqual([5, 21]);
    expect(spy.mock.calls[0][2].value).toBe(300);
    expect(dom.querySelectorAll("g").length).toBe(1);
  });

  it("draws a temperature probe on the right", () => {
    const probe = makeProbe(
      "temperature",
      { probe_primary: { state: "25", attrs: { ranges: TEMP_RANGES } } },
      { bar: { top: 60, bottom: 99, right: [80, 96] } },
    );
    const spy = vi.spyOn(probe, "_render_bar");
    toDom(probe._render_bars());
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][1]).toEqual([80, 96]);
  });

  it("draws only the temperature of an ATO probe, on the right", () => {
    const ato = makeProbe(
      "ato",
      {
        probe_primary: { state: "desired_level_1" },
        probe_secondary: { state: "24", attrs: { ranges: TEMP_RANGES } },
      },
      { bar: { top: 47, bottom: 99, right: [89, 104] } },
    );
    const spy = vi.spyOn(ato, "_render_bar");
    toDom(ato._render_bars());
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][2].value).toBe(24);
  });

  it("draws nothing for a reading whose entity has no state yet", () => {
    const probe = makeProbe("ph", {}, { bar });
    probe.entities.probe_secondary = { entity_id: "sensor.missing" };
    expect(probe._render_bars()).toBe(nothing);
  });

  it("draws nothing on a side with no bar", () => {
    // Temperature reading but no right bar configured
    const probe = makeProbe(
      "ato",
      { probe_secondary: { state: "24", attrs: { ranges: TEMP_RANGES } } },
      { bar: { top: 50, bottom: 99, left: [0, 20] } },
    );
    const spy = vi.spyOn(probe, "_render_bar");
    toDom(probe._render_bars());
    expect(spy).not.toHaveBeenCalled();
  });

  it("draws five zones and a square cursor", () => {
    const probe = makeProbe("orp", {}, { bar, aspect: 8 });
    const dom = toDom(
      probe._render_bar(bar, [0, 20], { value: 15, ranges: [0, 10, 20, 30] }),
    );
    expect(dom.querySelectorAll("rect").length).toBe(6);
    const cursor = dom.querySelector("rect.cursor")!;
    // 60% of the bar width, divided by the aspect ratio
    expect(parseFloat(cursor.getAttribute("width")!)).toBeCloseTo(12);
    expect(parseFloat(cursor.getAttribute("height")!)).toBeCloseTo(1.5);
    // Middle of the desired zone: 50 + 0.5 * 50
    expect(parseFloat(cursor.getAttribute("y")!) + 0.75).toBeCloseTo(75);
  });

  it("falls back to a ratio of 1 without aspect", () => {
    const probe = makeProbe("orp", {}, { bar });
    const dom = toDom(
      probe._render_bar(bar, [0, 20], { value: 15, ranges: [0, 10, 20, 30] }),
    );
    const cursor = dom.querySelector("rect.cursor")!;
    expect(parseFloat(cursor.getAttribute("height")!)).toBeCloseTo(12);
  });

  it("draws no cursor without bounds or while disconnected", () => {
    const probe = makeProbe("orp", {}, { bar });
    let dom = toDom(
      probe._render_bar(bar, [0, 20], { value: 5, ranges: null }),
    );
    expect(dom.querySelectorAll("rect").length).toBe(5);

    const off = makeProbe(
      "orp",
      { probe_status: { state: "offline" } },
      { bar },
    );
    dom = toDom(
      off._render_bar(bar, [0, 20], { value: 15, ranges: [0, 10, 20, 30] }),
    );
    expect(dom.querySelector("rect.cursor")).toBeNull();
  });

  it("render() includes the bars", () => {
    const probe = makeProbe(
      "orp",
      {
        probe_primary: {
          state: "300",
          attrs: { ranges: [100, 200, 400, 480] },
        },
      },
      { image: "orp.png", bar, aspect: 8, elements: {} },
    );
    probe.state_on = true;
    const dom = toDom(probe.render());
    expect(dom.querySelector("svg.bars")).not.toBeNull();
  });
});

describe("ControlProbe hass updates", () => {
  it("re-renders only when a drawn state changes", () => {
    const probe = makeProbe("ph", {
      probe_primary: { state: "8.1", attrs: { ranges: PH_RANGES } },
    });
    probe.requestUpdate = vi.fn();
    const hass = probe._hass;
    probe.hass = hass;
    expect(probe.requestUpdate).toHaveBeenCalledTimes(1);
    probe.hass = hass;
    expect(probe.requestUpdate).toHaveBeenCalledTimes(1);

    const next = {
      ...hass,
      states: {
        ...hass.states,
        "sensor.probe_primary": {
          ...hass.states["sensor.probe_primary"],
          state: "8.2",
        },
      },
    };
    probe.hass = next;
    expect(probe.requestUpdate).toHaveBeenCalledTimes(2);
    expect(probe.hass).toBe(next);
  });

  it("update_state() stores the hub state", () => {
    const probe = makeProbe("ph", {});
    probe.requestUpdate = vi.fn();
    probe.update_state(true);
    expect(probe.state_on).toBe(true);
    expect(probe.requestUpdate).toHaveBeenCalled();
  });
});

// ─── RSControl: models ──────────────────────────────────────────────────────

describe("RSControl models", () => {
  it("base class and Lite use the Lite mapping", () => {
    expect((new StubRSControl() as any).initial_config.model).toBe(
      "RSCONTROLLITE",
    );
    expect((new StubRSControlLite() as any).initial_config.model).toBe(
      "RSCONTROLLITE",
    );
  });

  it("Pro overrides the mapping", () => {
    expect((new StubRSControlPro() as any).initial_config.model).toBe(
      "RSCONTROLPRO",
    );
  });

  it("renderEditor() returns a template", () => {
    expect(new StubRSControl().renderEditor()).toBeDefined();
    expect(new StubRSControlPro().renderEditor()).toBeDefined();
  });

  it("stacks the overlays in the requested order", () => {
    const pro = Object.keys(proConfig.elements);
    expect(pro.slice(0, 3)).toEqual([
      "port_extend_1",
      "port_extend_2",
      "link_sense_1",
    ]);
    expect(pro.indexOf("link_sense_7")).toBeLessThan(pro.indexOf("link_power"));
    expect(pro.indexOf("is_on_power")).toBeLessThan(
      pro.indexOf("is_on_sensors"),
    );
    expect(pro.indexOf("is_on_sensors")).toBeLessThan(
      pro.indexOf("link_ato_1"),
    );
    expect(pro.indexOf("link_ato_2")).toBeLessThan(pro.indexOf("rspower6"));
    const lite = Object.keys(liteConfig.elements);
    expect(lite[0]).toBe("port_extend_lite");
    expect(lite).not.toContain("port_extend_1");
  });

  it("limits the Lite to 2 probes and one 12V port", () => {
    const lite = Object.keys(liteConfig.elements);
    expect(liteConfig.probes.max).toBe(2);
    expect(lite).toContain("link_sense_2");
    expect(lite).toContain("link_ato_1");
    expect(lite).toContain("is_on_12v_1");
    for (const key of [
      "link_sense_3",
      "link_sense_4E",
      "link_ato_2",
      "is_on_12v_2",
    ]) {
      expect(lite).not.toContain(key);
    }
    expect(proConfig.probes.max).toBe(7);

    const many: Spec[] = [0, 1, 2].map((i) =>
      probeSpec("sensor.p" + i, "probe_orp_value", "1", "orp", "0x" + i, i),
    );
    expect(makeHub(makeHass(many), StubRSControlLite).probes_nb()).toBe(2);
  });

  it("registers the probe settings dialog", () => {
    const hub = new StubRSControlPro() as any;
    expect(hub.dialogs.probe_conf.content[0].view).toBe("hui-entities-card");
    const keys = hub.dialogs.probe_conf.content[0].conf.entities
      .map((e: any) => e.entity)
      .filter(Boolean);
    for (const key of [
      "probe_desired_range_low",
      "probe_temp_acceptable_range_high",
      "probe_orp_calibration",
      "probe_temperature_calibration",
      "probe_temp_calibration",
      "probe_ec_unit",
      "probe_buzzer",
    ]) {
      expect(keys).toContain(key);
    }
    // The offsets gave way to the calibration against a reference
    expect(keys).not.toContain("probe_offset");
    // Reading now is a button of the dialog, not a row
    expect(keys).not.toContain("probe_get_value");
    expect(hub.dialogs.probe_conf.other.conf.tap_action[0].data.entity_id).toBe(
      "probe_get_value",
    );
    // The device-wide dialogs are still there
    expect(hub.dialogs.wifi).toBeDefined();
  });

  it("puts a settings cog on every probe type", () => {
    const hub = makeHub(makeHass([]));
    const common = hub.config.probes.common;
    expect(common.elements.probe_conf.tap_action.data.type).toBe("probe_conf");
    for (const type of Object.keys(common.types)) {
      const conf = hub._probe_config({ type }, 1);
      const cog = conf.elements.probe_conf;
      expect(cog.icon).toBe("mdi:cog");
      expect(cog.css.top).toMatch(/%$/);
      expect(cog.css.left).toMatch(/%$/);
      expect(conf.aspect).toBeGreaterThan(1);
    }
  });

  it("has one slot per possible probe", () => {
    for (let i = 1; i <= proConfig.probes.max; i++) {
      expect((proConfig.probes as any)["probe_" + i].id).toBe(i);
    }
  });
});

// ─── RSControl: entity sorting ──────────────────────────────────────────────

describe("RSControl._scan_entities", () => {
  const specs: Spec[] = [
    { id: "switch.hub_state", key: "device_state", state: "on" },
    {
      id: "sensor.hub_port_1_type",
      key: "port_type",
      state: "ato",
      attrs: { port: 0 },
    },
    {
      id: "sensor.hub_port_2_type",
      key: "port_type",
      state: "other",
      attrs: { port: 1 },
    },
    probeSpec("sensor.ph_b", "probe_ph_value", "8.1", "ph", "0xB", 1, {
      ranges: PH_RANGES,
    }),
    probeSpec("sensor.ph_b_t", "probe_temperature", "25", "ph", "0xB", 1),
    probeSpec("sensor.ph_a", "probe_ph_value", "8.0", "ph", "0xA", 0),
    probeSpec("sensor.orp", "probe_orp_value", "300", "orp", "0xB", null),
    {
      id: "sensor.other",
      key: "probe_ph_value",
      state: "7",
      device: "elsewhere",
    },
    { id: "sensor.no_state", key: "wifi_quality" },
  ];

  it("groups probe entities per probe, in the hub's order", () => {
    const hub = makeHub(makeHass(specs));
    expect(hub._probes.map((p: any) => p.type + ":" + p.uid)).toEqual([
      "ph:0xA",
      "ph:0xB",
      // Same uid, other type: another probe; no index sorts last
      "orp:0xB",
    ]);
    expect(hub._probes[1].entities.probe_temperature.entity_id).toBe(
      "sensor.ph_b_t",
    );
    expect(hub._probes[1].entities["sensor.probe_ph_value"].entity_id).toBe(
      "sensor.ph_b",
    );
    expect(hub.probes_nb()).toBe(3);
  });

  it("keeps hub entities global and numbers the port ones", () => {
    const hub = makeHub(makeHass(specs));
    expect(hub.entities.device_state.entity_id).toBe("switch.hub_state");
    expect(hub.entities.port_type_1.entity_id).toBe("sensor.hub_port_1_type");
    expect(hub.entities.port_type_2.entity_id).toBe("sensor.hub_port_2_type");
    expect(hub.entities.probe_ph_value).toBeUndefined();
    expect(hub.entities.wifi_quality.entity_id).toBe("sensor.no_state");
  });

  it("keeps an unavailable entity in its probe", () => {
    const hass = makeHass(specs);
    const hub = makeHub(hass);
    // Unavailable entities lose their attributes
    hass.states["sensor.ph_b"] = { state: "unavailable", attributes: {} };
    hub._scan_entities();
    expect(hub._probes[1].entities.probe_ph_value.entity_id).toBe(
      "sensor.ph_b",
    );
  });

  it("prefers the available one of entities sharing a key", () => {
    // EC: one set of bounds per unit, only the current unit's is available
    const ec = (id: string, state: string) =>
      probeSpec(id, "probe_desired_range_low", state, "ec", "0xE", 0);
    for (const order of [
      [ec("number.ppt", "32"), ec("number.sg", "unavailable")],
      [ec("number.sg", "unavailable"), ec("number.ppt", "32")],
    ]) {
      const hub = makeHub(makeHass(order));
      expect(hub._probes[0].entities.probe_desired_range_low.entity_id).toBe(
        "number.ppt",
      );
    }
    // Tagged config entities lose their attributes when unavailable:
    // an entity seen before keeps its probe, and still loses to a live one
    const hass = makeHass([ec("number.ppt", "32"), ec("number.ec", "33")]);
    const hub = makeHub(hass);
    hass.states["number.ec"] = { state: "unavailable", attributes: {} };
    delete hass.states["number.ppt"];
    hub._scan_entities();
    expect(hub._probes[0].entities.probe_desired_range_low.entity_id).toBe(
      "number.ec",
    );
  });

  it("orders probes with the same index by key and caps the count", () => {
    const many: Spec[] = [];
    for (let i = 0; i < 9; i++) {
      many.push(
        probeSpec(
          "sensor.t" + i,
          "probe_temperature",
          "25",
          "temperature",
          "0x" + i,
          null,
        ),
      );
    }
    const hub = makeHub(makeHass(many));
    expect(hub.probes_nb()).toBe(7);
    expect(hub._probes[0].uid).toBe("0x0");
  });

  it("does nothing without hass or device", () => {
    const hub = new StubRSControlPro() as any;
    hub._scan_entities();
    expect(hub._probes).toEqual([]);
    hub._hass = makeHass(specs);
    hub._scan_entities();
    expect(hub._probes).toEqual([]);
  });

  it("defaults to 7 slots before the config is built", () => {
    const hub = new StubRSControlPro() as any;
    hub.device = { name: "hub", elements: [{ id: "hub" }] };
    hub._hass = makeHass(specs);
    hub._scan_entities();
    expect(hub.probes_nb()).toBe(3);
  });

  it("_populate_entities() builds the config then scans", () => {
    const hub = new StubRSControlPro() as any;
    hub.device = { name: "hub", elements: [{ id: "hub" }] };
    hub._hass = makeHass(specs);
    hub._populate_entities();
    expect(hub.config.model).toBe("RSCONTROLPRO");
    expect(hub.probes_nb()).toBe(3);
  });
});

// ─── RSControl: hass propagation ────────────────────────────────────────────

describe("RSControl hass setter", () => {
  it("rescans, re-renders on a layout change and feeds the probes", () => {
    const specs = [
      probeSpec("sensor.orp", "probe_orp_value", "300", "orp", "0x1", 0),
    ];
    const hub = makeHub(makeHass([]));
    hub.requestUpdate = vi.fn();
    const hass = makeHass(specs);
    hub.hass = hass;
    expect(hub.requestUpdate).toHaveBeenCalledTimes(1);
    expect(hub.hass).toBe(hass);

    const child: any = { hass: null };
    hub._probe_elements["orp:0x1"] = child;
    hub.hass = hass;
    expect(hub._probes[0].control_probe).toBe(child);
    // Same layout: no device re-render, but the probe gets hass
    expect(hub.requestUpdate).toHaveBeenCalledTimes(1);
    expect(child.hass).toBe(hass);
  });
});

// ─── RSControl: predicates ──────────────────────────────────────────────────

describe("RSControl power strip link", () => {
  function hub(
    power: string | null,
    link: string | null,
    devices: Record<string, any> = {},
  ): any {
    const specs: Spec[] = [];
    if (power !== null)
      specs.push({ id: "sensor.cp", key: "connected_power", state: power });
    if (link !== null)
      specs.push({
        id: "binary_sensor.plu",
        key: "power_link_up",
        state: link,
      });
    return makeHub(makeHass(specs, devices));
  }

  it("has no link without a paired hwid", () => {
    for (const state of [null, "unknown", "unavailable", ""]) {
      const h = hub(state, null);
      expect(h.linked_power_hwid()).toBeNull();
      expect(h.has_power_link()).toBe(false);
      expect(h.power_link_alert()).toBe(false);
    }
  });

  it("alerts while the paired strip is unreachable", () => {
    expect(hub("abc", "on").has_power_link()).toBe(true);
    expect(hub("abc", "on").power_link_alert()).toBe(false);
    expect(hub("abc", "off").power_link_alert()).toBe(true);
    expect(hub("abc", null).power_link_alert()).toBe(true);
  });

  it("opens the paired strip's card on a click over it", () => {
    const link = (proConfig.elements as any).rspower_link;
    expect(link.tap_action).toEqual({
      domain: "redsea_ui",
      action: "show_device",
      data: { hwid: "${device.linked_power_hwid()}" },
    });
    const h = hub("abc", "off");
    expect(h.evaluate_condition(link.disabled_if, link)).toBe(false);
    const evaluator = new SafeEval({ device: h, entity: {}, config: {} });
    expect(evaluator.evaluate(link.tap_action.data.hwid)).toBe("abc");
    expect(hub(null, null).evaluate_condition(link.disabled_if, link)).toBe(
      true,
    );
    // Drawn over the strip, sized from the width only
    expect(link.css.top).toBe("0");
    expect(link.css["margin-top"]).toMatch(/%$/);
    expect(link.css["aspect-ratio"]).toBeDefined();
    expect(link.css.height).toBeUndefined();
  });

  it("resolves the strip model by model_id or identifier", () => {
    expect(
      hub("abc", "on", {
        d1: { model_id: "zzz", model: "RSPOWER8", identifiers: [] },
        d2: { model_id: "abc", model: "RSPOWER8" },
      }).linked_power_model(),
    ).toBe("RSPOWER8");
    expect(
      hub("abc", "on", {
        d1: null,
        d2: { identifiers: [["redsea", "abc"]], model: "RSPOWER6" },
      }).linked_power_model(),
    ).toBe("RSPOWER6");
    expect(
      hub("abc", "on", {
        d1: { identifiers: ["not-an-array"], model: "RSPOWER8" },
        d2: { identifiers: [["other", "abc"]], model: "RSPOWER8" },
      }).linked_power_model(),
    ).toBe("RSPOWER6");
  });

  it("defaults to the 6-socket strip", () => {
    expect(hub(null, null).linked_power_model()).toBe("RSPOWER6");
    const h = hub("abc", "on");
    h._hass.devices = undefined;
    expect(h.linked_power_model()).toBe("RSPOWER6");
  });
});

describe("RSControl 12V ports", () => {
  function hub(types: string[], states: string[]): any {
    const specs: Spec[] = [];
    types.forEach((t, i) =>
      specs.push({
        id: "sensor.t" + i,
        key: "port_type",
        state: t,
        attrs: { port: i },
      }),
    );
    states.forEach((s, i) =>
      specs.push({
        id: "sensor.s" + i,
        key: "port_state",
        state: s,
        attrs: { port: i },
      }),
    );
    return makeHub(makeHass(specs));
  }

  it("finds the ports driving an ATO pump", () => {
    const h = hub(["other", "ato"], []);
    expect(h.is_ato_port(1)).toBe(false);
    expect(h.is_ato_port(2)).toBe(true);
    expect(h.has_ato_link()).toBe(true);
    expect(hub(["ato"], []).has_ato_link()).toBe(true);
    expect(hub(["other"], []).has_ato_link()).toBe(false);
  });

  it("finds the powered ports", () => {
    const h = hub([], ["on", "fallback_on"]);
    expect(h.is_port_on(1)).toBe(true);
    expect(h.is_port_on(2)).toBe(true);
    const h2 = hub([], ["standby", "off"]);
    expect(h2.is_port_on(1)).toBe(false);
    expect(h2.is_port_on(2)).toBe(false);
    expect(hub([], []).is_port_on(1)).toBe(false);
  });
});

// ─── RSControl: rendering ───────────────────────────────────────────────────

describe("RSControl probe rendering", () => {
  const specs: Spec[] = [
    { id: "switch.hub_state", key: "device_state", state: "on" },
    probeSpec("sensor.ph", "probe_ph_value", "8.1", "ph", "0x1", 0, {
      ranges: PH_RANGES,
    }),
    probeSpec("sensor.ph_t", "probe_temperature", "25", "ph", "0x1", 0),
  ];

  it("merges the shared, type and slot configurations", () => {
    const hub = makeHub(makeHass(specs));
    const conf = hub._probe_config(hub._probes[0], 2);
    expect(conf.image).toContain("rssense-ph-temperature");
    expect(conf.elements.primary_value.round).toBe(2);
    expect(conf.elements.primary_value.name).toBe("probe_primary");
    expect(conf.css.left).toBe("59.1%");
    expect(conf.css.top).toBe("47.6%");
    // The slot height follows the picture, never the device box
    expect(conf.css.height).toBeUndefined();
    // Unknown type and slot: shared part only
    const bare = hub._probe_config({ type: "xyz" }, 99);
    expect(bare.image).toBeUndefined();
    expect(bare.css.left).toBeUndefined();
    // No type table at all
    delete hub.config.probes.common.types;
    expect(hub._probe_config({ type: "ph" }, 1).image).toBeUndefined();
  });

  it("creates one element per probe and reuses it", () => {
    const hub = makeHub(makeHass(specs));
    const dom = toDom(hub._render_probe(hub._probes[0], 1));
    const elt = hub._probes[0].control_probe;
    expect(elt).toBeInstanceOf(ControlProbe);
    expect(dom.querySelector("#probe_1")).not.toBeNull();
    expect(elt.probe_type).toBe("ph");
    expect(elt.probe_uid).toBe("0x1");
    expect(elt.slot_id).toBe(1);
    expect(elt.entities.probe_primary.entity_id).toBe("sensor.ph");
    expect(elt.entities.probe_secondary.entity_id).toBe("sensor.ph_t");
    expect(elt.entities.device_state.entity_id).toBe("switch.hub_state");

    const marker = { hass: null };
    elt._elements = { cached: marker };
    hub._render_probe(hub._probes[0], 1);
    expect(hub._probes[0].control_probe).toBe(elt);
    // Same entities: element cache kept
    expect(elt._elements.cached).toBe(marker);
  });

  it("rebuilds the probe's elements when its entities change", () => {
    const hub = makeHub(makeHass(specs));
    hub._render_probe(hub._probes[0], 1);
    const elt = hub._probes[0].control_probe;
    elt._elements = { cached: { hass: null } };

    delete hub._probes[0].entities.probe_temperature;
    hub._render_probe(hub._probes[0], 1);
    expect(elt._elements).toEqual({});
  });

  it("never hands a probe another probe's untagged settings", () => {
    // Unavailable entities carry no attributes: EC bounds of the other
    // units stay on the hub and must not reach an ATO probe
    const hass = makeHass([
      ...specs,
      {
        id: "number.ec_sg_low",
        key: "probe_desired_range_low",
        state: "unavailable",
      },
      { id: "select.ec_unit", key: "probe_ec_unit", state: "unavailable" },
    ]);
    const hub = makeHub(hass);
    expect(hub.entities.probe_desired_range_low.entity_id).toBe(
      "number.ec_sg_low",
    );
    hub._render_probe(hub._probes[0], 1);
    const elt = hub._probes[0].control_probe;
    expect(elt.entities.probe_desired_range_low).toBeUndefined();
    expect(elt.entities["number.probe_desired_range_low"]).toBeUndefined();
    expect(elt.entities.probe_ec_unit).toBeUndefined();
    // Hub-level entities still get through
    expect(elt.entities.device_state.entity_id).toBe("switch.hub_state");
    expect(elt.entities["switch.device_state"].entity_id).toBe(
      "switch.hub_state",
    );
  });

  it("survives a probe element that cannot be created", () => {
    const hub = makeHub(makeHass(specs));
    const spy = vi.spyOn(RSDevice, "create_device").mockReturnValue(null);
    expect(() => hub._render_probe(hub._probes[0], 1)).not.toThrow();
    expect(hub._probes[0].control_probe).toBeNull();
    spy.mockRestore();
  });

  it("_render() draws the hub and one slot per probe", () => {
    const hub = makeHub(makeHass(specs));
    hub._render_elements = vi.fn(() => "");
    const dom = toDom(hub._render("", ""));
    expect(dom.querySelector("#rscontrol_img")).not.toBeNull();
    expect(dom.querySelectorAll(".probe_slot").length).toBe(1);
  });
});

// ─── Mapping expressions ────────────────────────────────────────────────────

describe("RSControl mapping expressions", () => {
  /** Every `disabled_if` / `class` expression of a mapping. */
  function expressions(conf: any): string[] {
    const out: string[] = [];
    for (const elt of Object.values(conf.elements) as any[]) {
      if (typeof elt.disabled_if === "string") out.push(elt.disabled_if);
      if (typeof elt.class === "string")
        out.push(elt.class.replace(/^\$\{/, "").replace(/\}$/, ""));
    }
    return out;
  }

  it.each([
    ["lite", StubRSControlLite, liteConfig],
    ["pro", StubRSControlPro, proConfig],
  ])("%s: every overlay expression evaluates", (_name, Klass, conf) => {
    const hub = makeHub(makeHass([]), Klass);
    const evaluator = new SafeEval({ device: hub, entity: {}, config: {} });
    for (const expr of expressions(conf)) {
      // A broken expression evaluates to undefined
      expect(evaluator.evaluate(expr)).not.toBeUndefined();
    }
  });

  it("shows the links matching the probe count", () => {
    const probes = (n: number) =>
      Array.from({ length: n }, (_, i) =>
        probeSpec("sensor.p" + i, "probe_orp_value", "1", "orp", "0x" + i, i),
      );
    const visible = (n: number) => {
      const hub = makeHub(makeHass(probes(n)));
      return Object.entries(proConfig.elements)
        .filter(
          ([key]) => key.startsWith("port_") || key.startsWith("link_sense"),
        )
        .filter(([, elt]: any) => !hub.evaluate_condition(elt.disabled_if, elt))
        .map(([key]) => key);
    };
    expect(visible(0)).toEqual([]);
    expect(visible(4)).toEqual([
      "port_extend_1",
      "link_sense_1",
      "link_sense_2",
      "link_sense_3",
      "link_sense_4",
    ]);
    expect(visible(5)).toEqual([
      "port_extend_1",
      "port_extend_2",
      "link_sense_1",
      "link_sense_2",
      "link_sense_3",
      "link_sense_4E",
      "link_sense_5",
    ]);
  });

  it("probe values bind to the probe predicates", () => {
    const probe = makeProbe("ph", {
      probe_primary: { state: "8.1", attrs: { ranges: PH_RANGES } },
      probe_secondary: { state: "25", attrs: { ranges: TEMP_RANGES } },
    });
    const els = proConfig.probes.common.elements as any;
    expect(probe.evaluate_condition(els.primary_value.disabled_if, {})).toBe(
      false,
    );
    expect(probe.evaluate_condition(els.secondary_value.disabled_if, {})).toBe(
      false,
    );
    const evaluator = new SafeEval({ device: probe, entity: {}, config: {} });
    expect(evaluator.evaluate(els.primary_value.text_color)).toBe(
      COLOR_LEVEL_DESIRED_HEX,
    );
    expect(evaluator.evaluate(els.secondary_value.text_color)).toBe(
      COLOR_LEVEL_DESIRED_HEX,
    );
  });
});
