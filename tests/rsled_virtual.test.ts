// Tests for the virtual ReefLED view
// Covers: src/devices/redsea/rsled/rsled.ts (RSLedVirtual, program targets)
//         src/devices/redsea/rsled/rsled_linked.ts
//         src/devices/redsea/rsled/rsled_virtual.mapping.ts
//         src/devices/redsea/rsled/rsled.common.mapping.ts (virtual builder)
//         src/devices/redsea/rsled/rsled.dialogs.ts (virtual dialogs)
//         src/devices/redsea/rsled/rsled_program_editor.ts (multi-lamp save)

import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/devices/index";
import { RSLed160, RSLedVirtual } from "../src/devices/redsea/rsled/rsled";
import {
  RSLedLinked,
  LINKED_THUMBS,
  offset_label,
} from "../src/devices/redsea/rsled/rsled_linked";
import {
  config_virtual_g1,
  config_virtual_g2,
} from "../src/devices/redsea/rsled/rsled_virtual.mapping";
import { VIRTUAL_MISSING } from "../src/devices/redsea/rsled/rsled.common.mapping";
import {
  dialogs_rsled_virtual_g1,
  dialogs_rsled_virtual_g2,
} from "../src/devices/redsea/rsled/rsled.dialogs";
import { RSLedProgramEditor } from "../src/devices/redsea/rsled/rsled_program_editor";
import * as P from "../src/devices/redsea/rsled/rsled_program";

class StubVirtual extends RSLedVirtual {}
if (!customElements.get("stub-rsled-virtual"))
  customElements.define("stub-rsled-virtual", StubVirtual);
class StubLinked extends RSLedLinked {}
if (!customElements.get("stub-rsled-linked"))
  customElements.define("stub-rsled-linked", StubLinked);

const G1: P.DayProgram = {
  white: {
    rise: 660,
    set: 1260,
    points: [
      { t: 120, i: 100 },
      { t: 480, i: 100 },
    ],
  },
  blue: {
    rise: 600,
    set: 1341,
    points: [
      { t: 60, i: 100 },
      { t: 540, i: 100 },
    ],
  },
  moon: {
    rise: 1345,
    set: 1523,
    points: [{ t: 75, i: 10 }],
  },
};

const LED_G1A = {
  hwid: "h1",
  name: "Left",
  model: "RSLED160",
  g2: false,
  entry_id: "e1",
};
const LED_G1B = {
  hwid: "h2",
  name: "Middle",
  model: "RSLED90",
  g2: false,
  entry_id: "e2",
};
const LED_G2 = {
  hwid: "h3",
  name: "Right",
  model: "RSLED170",
  g2: true,
  entry_id: "e3",
};

/** Build a hass holding a virtual ReefLED. */
function makeHass(leds: any[] | null, white_lights = true) {
  const states: Record<string, any> = {};
  const entities: Record<string, any> = {};
  const add = (domain: string, key: string, state: string, attributes = {}) => {
    const id = `${domain}.v_${key}`;
    states[id] = { entity_id: id, state, attributes, last_updated: "t0" };
    entities[id] = { entity_id: id, device_id: "vdev", translation_key: key };
  };
  for (let d = 1; d <= 7; d++)
    add("sensor", "auto_" + d, "Perso", { data: G1 });
  if (leds) add("sensor", "linked_leds", String(leds.length), { leds });
  if (white_lights) {
    add("light", "white", "on", { brightness: 200 });
    add("light", "blue", "on", { brightness: 200 });
  }
  add("sensor", "white", "80");
  add("sensor", "blue", "80");
  add("light", "moon", "off");
  add("light", "kelvin_intensity", "on", { brightness: 200 });
  add("select", "mode", "auto");
  add("switch", "device_state", "on");
  add("switch", "maintenance", "off");
  return {
    states,
    entities,
    devices: { vdev: { id: "vdev", disabled_by: null } },
    config: { time_zone: "UTC" },
    callService: vi.fn(),
    callWS: vi.fn().mockRejectedValue(new Error("no ws")),
  } as any;
}

function makeVirtual(leds: any[] | null, white_lights = true): any {
  const dev = new StubVirtual() as any;
  dev.device = {
    name: "Virtual",
    elements: [
      {
        id: "vdev",
        model: "virtual_led",
        identifiers: [["redsea", "Virtual"]],
        disabled_by: null,
        primary_config_entry: "ve",
      },
    ],
  };
  dev.user_config = {};
  dev.hass = makeHass(leds, white_lights);
  dev._populate_entities();
  return dev;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("virtual mapping and dialogs", () => {
  it("drops what a virtual lamp has no entity for, adds its lamps", () => {
    for (const cfg of [config_virtual_g1, config_virtual_g2]) {
      for (const key of VIRTUAL_MISSING) {
        expect(cfg.elements).not.toHaveProperty(key);
      }
      expect(cfg.elements.linked.type).toBe("rsled-linked");
      expect(cfg.off_keep).toContain("linked");
      expect(cfg.off_keep).not.toContain("last_message");
      expect(cfg.model).toBe("virtual_led");
    }
    // G1 view: white/blue sliders; G2 view: intensity/colour only
    expect(config_virtual_g1.elements).toHaveProperty("white_slider");
    expect(config_virtual_g2.elements).not.toHaveProperty("white_slider");
    expect(String(config_virtual_g2.background_img)).toContain("rsled_g2");
  });

  it("config dialog lists the lamps, without real-lamp-only entities", () => {
    const names = (d: any) =>
      d.config.content[0].conf.entities.map((e: any) => e.entity);
    const g1 = names(dialogs_rsled_virtual_g1);
    expect(g1).toContain("linked_leds");
    expect(g1).toContain("light.white");
    expect(g1).not.toContain("current_program");
    expect(g1).not.toContain("firmware_update");
    // Each lamp's own offset: set by the virtual LED, not shown
    expect(g1).not.toContain("number.sunrise_offset");
    expect(g1.indexOf("linked_leds")).toBe(
      g1.indexOf("binary_sensor.status") - 1,
    );
    const g2 = names(dialogs_rsled_virtual_g2);
    expect(g2).toContain("sensor.white");
    expect(g2).not.toContain("light.white");
    expect(g2).not.toContain("number.sunrise_offset");
    expect(dialogs_rsled_virtual_g2).toHaveProperty("led_moon");
    expect(dialogs_rsled_virtual_g1).toHaveProperty("led_acclimation");
  });
});

describe("RSLedVirtual", () => {
  it("has the dialogs of a lamp; the weather is in the program editor", () => {
    const dev = makeVirtual([LED_G1A, LED_G2], false);
    expect(dev.dialogs).not.toHaveProperty("led_weather");
    expect(dev.dialogs).toHaveProperty("led_moon");
  });

  it("is registered for the virtual_led model", () => {
    expect(customElements.get("redsea-virtual_led")).toBe(RSLedVirtual);
    expect(customElements.get("rsled-linked")).toBe(RSLedLinked);
  });

  it("only G1 lamps: G1 view, white/blue, program of the first lamp", () => {
    const dev = makeVirtual([LED_G1A, LED_G1B]);
    expect(dev.is_g2()).toBe(false);
    expect(dev.has_white_blue()).toBe(true);
    expect(dev.config.elements).toHaveProperty("white_slider");
    expect(dev.program(1)).toEqual(G1);
    expect(dev.g1_model()).toBe("RSLED160");
    // Lamps of several models: no single PAR
    expect(dev.par_model()).toBeUndefined();
    expect(dev.par()).toBeNull();
    expect(makeVirtual([LED_G1A, LED_G1A]).par_model()).toBe("RSLED160");
    expect(dev.program_targets()).toEqual([
      { device_id: "e1", g2: false, model: "RSLED160" },
      { device_id: "e2", g2: false, model: "RSLED90" },
    ]);
  });

  it("a G2 among the lamps: G2 view, G1 program shown in kelvin", () => {
    const dev = makeVirtual([LED_G1A, LED_G2], false);
    expect(dev.is_g2()).toBe(true);
    expect(dev.has_white_blue()).toBe(false);
    expect(dev.config.elements).not.toHaveProperty("white_slider");
    expect(String(dev.config.background_img)).toContain("rsled_g2");
    const prog = dev.program(1);
    expect(prog.white).toBeUndefined();
    expect(prog.intensity.rise).toBe(600);
    expect(prog.intensity.set).toBe(1341);
    expect(prog.intensity.points.every((p: any) => p.k > 0)).toBe(true);
    expect(prog.moon).toEqual(G1.moon);
    expect(dev.program_targets().map((t: any) => t.g2)).toEqual([false, true]);
  });

  it("a G2 first: its program is read as a G2 one", () => {
    const dev = makeVirtual([LED_G2, LED_G1A], false);
    const hass = dev.hass;
    hass.states["sensor.v_auto_1"].attributes.data = {
      color: {
        rise: 600,
        set: 1200,
        points: [{ t: 60, i1: 50, i2: 50, k1: 12000, k2: 12000 }],
      },
    };
    expect(dev.program(1).intensity.points).toEqual([
      { t: 60, i: 50, k: 12000 },
    ]);
  });

  it("without the lamps list, guesses the view from the lights", () => {
    expect(makeVirtual(null, true).is_g2()).toBe(false);
    const g2 = makeVirtual(null, false);
    expect(g2.is_g2()).toBe(true);
    expect(g2.linked()).toEqual([]);
    // No lamp: the program goes to the virtual entry itself
    expect(g2.program_targets()).toEqual([
      { device_id: "ve", g2: true, model: "virtual_led" },
    ]);
  });

  it("without the lamps list, reads the program in its own view", () => {
    expect(makeVirtual(null, true).program(1)).toEqual(G1);
    // G2 view: the white/blue reading is decoded as a G2 one
    const g2 = makeVirtual(null, false).program(1);
    expect(g2.white).toBeUndefined();
    expect(g2.intensity.rise).toBe(660);
  });

  it("rebuilds its elements when the view changes", () => {
    const dev = makeVirtual([LED_G1A]);
    dev._elements = { stale: {} };
    dev.hass.states["sensor.v_linked_leds"].attributes.leds = [LED_G2];
    dev.update_config();
    expect(dev._elements).toEqual({});
    expect(dev.is_g2()).toBe(true);
    // Same view again: the elements are kept
    dev._elements = { kept: {} };
    dev.update_config();
    expect(dev._elements).toEqual({ kept: {} });
  });

  it("chooses the view once the entities are known", () => {
    const dev = new StubVirtual() as any;
    dev.device = {
      name: "V",
      elements: [{ id: "vdev", model: "virtual_led", disabled_by: null }],
    };
    dev.user_config = {};
    dev.hass = makeHass([LED_G2], false);
    dev.update_config();
    expect(dev.config.elements).toHaveProperty("white_slider");
    dev._populate_entities();
    expect(dev.config.elements).not.toHaveProperty("white_slider");
  });

  it("a real lamp writes its program to itself", () => {
    const dev = new RSLed160() as any;
    dev.device = {
      elements: [{ model: "RSLED160", primary_config_entry: "e9" }],
    };
    expect(dev.program_targets()).toEqual([
      { device_id: "e9", g2: false, model: "RSLED160" },
    ]);
    expect(dev.g1_model()).toBe("RSLED160");
    dev.device = { elements: [{}] };
    expect(dev.program_targets()).toEqual([]);
  });
});

describe("RSLedLinked", () => {
  async function mountLinked(dev: any) {
    const el = new StubLinked() as any;
    el.device = dev;
    el.conf = { type: "rsled-linked", stateObj: null };
    el.stateOn = true;
    el.stateObj = null;
    el.hass = dev.hass;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("lists the lamps with the thumbnail of their generation", async () => {
    const el = await mountLinked(makeVirtual([LED_G1A, LED_G2], false));
    const lamps = el.shadowRoot.querySelectorAll(".lamp");
    expect(lamps.length).toBe(2);
    expect(lamps[0].querySelector("span").textContent).toBe("Left");
    expect(lamps[0].getAttribute("title")).toBe("Left (RSLED160)");
    expect(lamps[0].querySelector("img").getAttribute("src")).toBe(
      String(LINKED_THUMBS.g1),
    );
    expect(lamps[1].querySelector("img").getAttribute("src")).toBe(
      String(LINKED_THUMBS.g2),
    );
  });

  it("a staggered group shows each lamp's sunrise offset", async () => {
    const el = await mountLinked(
      makeVirtual([
        { ...LED_G1A, offset: 0 },
        { ...LED_G2, offset: 10 },
        { ...LED_G1B, offset: null },
      ]),
    );
    const offsets = [...el.shadowRoot.querySelectorAll(".lamp")].map(
      (l: any) => l.querySelector(".offset")?.textContent ?? null,
    );
    expect(offsets).toEqual(["+0 min", "+10 min", null]);
    // Not staggered (all on time): no offset shown
    const flat = await mountLinked(
      makeVirtual([
        { ...LED_G1A, offset: 0 },
        { ...LED_G2, offset: 0 },
      ]),
    );
    expect(flat.shadowRoot.querySelector(".offset")).toBeNull();
    expect(offset_label({ hwid: "h", name: "n", offset: 7.6 })).toBe("+8 min");
    expect(offset_label({ hwid: "h", name: "n", offset: NaN })).toBe("");
    expect(offset_label({ hwid: "h", name: "n" })).toBe("");
  });

  it("a lamp without a model is titled by its name only", async () => {
    const { model: _m, ...no_model } = LED_G1A;
    const el = await mountLinked(makeVirtual([no_model]));
    expect(el.shadowRoot.querySelector(".lamp").getAttribute("title")).toBe(
      "Left",
    );
  });

  it("on a lamp of the group: the lamp circled, not tapped", async () => {
    const dev: any = makeVirtual([LED_G1A, LED_G1B]);
    dev.current_hwid = () => "h2";
    const el = await mountLinked(dev);
    const lamps = el.shadowRoot.querySelectorAll(".lamp");
    expect(lamps[0].classList.contains("current")).toBe(false);
    expect(lamps[1].classList.contains("current")).toBe(true);
    const seen: any[] = [];
    document.body.addEventListener("show-device", (e: any) =>
      seen.push(e.detail),
    );
    lamps[1].click();
    expect(seen).toEqual([]);
    lamps[0].click();
    expect(seen.length).toBe(1);
  });

  it("a tap shows the lamp's own card", async () => {
    const el = await mountLinked(makeVirtual([LED_G1A, LED_G1B]));
    const seen: any[] = [];
    document.body.addEventListener("show-device", (e: any) =>
      seen.push(e.detail),
    );
    el.shadowRoot.querySelectorAll(".lamp")[1].click();
    expect(seen).toEqual([{ hwid: "h2" }]);
    el.show({ name: "none" });
    expect(seen.length).toBe(1);
  });

  it("renders nothing without lamps, re-renders when the list changes", async () => {
    const dev = makeVirtual(null);
    const el = await mountLinked(dev);
    expect(el.shadowRoot.querySelector(".linked")).toBeNull();
    expect(el.lamps()).toEqual([]);
    const spy = vi.spyOn(el, "requestUpdate");
    el.hass = dev.hass;
    expect(spy).not.toHaveBeenCalled();
    el.device = { linked: () => [LED_G1A] };
    el.hass = dev.hass;
    expect(spy).toHaveBeenCalled();
    el.device = null;
    expect(el.lamps()).toEqual([]);
  });
});

describe("program editor: a group of lamps", () => {
  function calls(hass: any) {
    return hass.callService.mock.calls.map((c: any[]) => c[2]);
  }

  it("G1 group edited in W/B: the same program to each lamp", async () => {
    const dev = makeVirtual([LED_G1A, LED_G1B]);
    const ed = new RSLedProgramEditor() as any;
    ed.load(dev, 1, "wb");
    await ed.save();
    const sent = calls(dev.hass);
    expect(sent.map((c: any) => `${c.device_id} ${c.access_path}`)).toEqual([
      "e1 /auto/1",
      "e1 /auto/apply",
      "e2 /auto/1",
      "e2 /auto/apply",
    ]);
    expect(sent[0].data.white).toEqual(G1.white);
    expect(sent[2].data).toEqual(sent[0].data);
  });

  it("G1 group edited in kelvin: each lamp converts with its own model", async () => {
    const dev = makeVirtual([LED_G1A, LED_G1B]);
    const ed = new RSLedProgramEditor() as any;
    ed.load(dev, 1, "wb");
    await ed.set_mode("kelvin");
    // The service is asked for each lamp, on its own entry
    dev.hass.callWS = vi.fn().mockResolvedValue({});
    await ed.save();
    const targets = dev.hass.callWS.mock.calls.map(
      (c: any[]) => c[0].service_data.device_id,
    );
    expect(targets).toEqual(["e1", "e2"]);
    const sent = calls(dev.hass);
    // Local fallback with each model's table: RSLED90 and RSLED160 differ
    expect(sent[0].data.white).toBeDefined();
    expect(sent[2].data.blue).toBeDefined();
  });

  it("mixed group: G2 format for the G2, white/blue for the G1", async () => {
    const dev = makeVirtual([LED_G1A, LED_G2], false);
    const ed = new RSLedProgramEditor() as any;
    ed.load(dev, 2, "kelvin");
    expect(ed.format).toBe("kelvin");
    await ed.save();
    const sent = calls(dev.hass);
    expect(sent.map((c: any) => `${c.device_id} ${c.access_path}`)).toEqual([
      "e1 /auto/2",
      "e1 /auto/apply",
      "e3 /auto/2",
      "e3 /auto/apply",
    ]);
    // G1: white/blue channels on day 2's timeline
    expect(sent[0].data.white.rise).toBeGreaterThanOrEqual(1440);
    expect(sent[0].data.intensity).toBeUndefined();
    expect(sent[0].data.moon.rise).toBe(1345 + 1440);
    // G2: colour points
    expect(sent[2].data.color.points[0]).toHaveProperty("k1");
    expect(sent[2].data.white).toBeUndefined();
  });

  it("program_for(): a G1 program for a G2 lamp", async () => {
    const dev = makeVirtual([LED_G1A]);
    const ed = new RSLedProgramEditor() as any;
    ed.load(dev, 1, "wb");
    const g2 = { device_id: "x", g2: true };
    const wb = await ed.program_for(g2);
    expect(wb.intensity.points.every((p: any) => p.k > 0)).toBe(true);
    expect(wb.moon).toEqual(G1.moon);
    await ed.set_mode("kelvin");
    const k = await ed.program_for(g2);
    expect(k.intensity).toBeDefined();
    expect(k.white).toBeUndefined();
    // Nothing left to send: empty program
    ed.points = { white: [], blue: [], moon: [] };
    ed.mode = "wb";
    expect(await ed.program_for(g2)).toEqual({});
    ed.format = "kelvin";
    ed.points = { intensity: [], moon: [] };
    expect(await ed.program_for({ device_id: "y", g2: false })).toEqual({});
  });

  it("targets(): falls back to the lamp's own entry", () => {
    const ed = new RSLedProgramEditor() as any;
    ed.led = {
      has_white_blue: () => false,
      device: { elements: [{ primary_config_entry: "own", model: "M" }] },
    };
    expect(ed.targets()).toEqual([{ device_id: "own", g2: true, model: "M" }]);
    ed.led = { device: { elements: [{}] } };
    expect(ed.targets()).toEqual([]);
  });
});

describe("rsled_program: wb_to_kelvin_program", () => {
  it("replaces white/blue by intensity points with a colour", () => {
    expect(P.wb_to_kelvin_program(null)).toBeNull();
    const moon_only = { moon: G1.moon };
    expect(P.wb_to_kelvin_program(moon_only)).toBe(moon_only);
    const out = P.wb_to_kelvin_program(G1, "RSLED160")!;
    expect(out.white).toBeUndefined();
    expect(out.blue).toBeUndefined();
    expect(out.intensity!.rise).toBe(600);
    // Full white + full blue at 13:00
    const noon = out.intensity!.points!.find((p) => p.t === 780 - 600)!;
    expect(noon.i).toBe(100);
  });
});
