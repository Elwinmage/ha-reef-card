// Tests for the Aqua Medic views
// Covers: src/devices/aquamedic/common/am_device.ts
//         src/devices/aquamedic/common/am_runner.ts
//         src/devices/aquamedic/common/am_faults.ts
//         src/devices/aquamedic/common/am_schedule.ts
//         src/devices/aquamedic/common/am.common.mapping.ts
//         src/devices/aquamedic/common/am.dialogs.ts
//         src/devices/aquamedic/dcrunner, dcskimmer, smartdrift

import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/devices/index";
import { MyElement } from "../src/base/element";
import { RSDevice } from "../src/devices/device";
import {
  AMDevice,
  AM_FAULT_KEYS,
  am_box_styles,
} from "../src/devices/aquamedic/common/am_device";
import { AMFaults } from "../src/devices/aquamedic/common/am_faults";
import {
  AMFlow,
  FLOW_PERIOD,
  PULSE_PERIOD,
  flow_period,
  pulse_period,
} from "../src/devices/aquamedic/common/am_flow";
import {
  AMSchedule,
  AM_TICK_MS,
} from "../src/devices/aquamedic/common/am_schedule";
import {
  AMLayout,
  AMPicture,
  centred_at,
  common_elements,
  picture_css,
  picture_point,
  picture_rect,
  slider_row,
  speed_hidden,
} from "../src/devices/aquamedic/common/am.common.mapping";
import { AMCapRing } from "../src/devices/aquamedic/common/am_cap_ring";
import {
  dialogs_am_drift,
  dialogs_am_runner,
} from "../src/devices/aquamedic/common/am.dialogs";
import { AMDCRunner } from "../src/devices/aquamedic/dcrunner/dcrunner";
import {
  LAYOUT as runner_layout,
  PICTURE as runner_picture,
  STREAMS as runner_streams,
  config as runner_config,
} from "../src/devices/aquamedic/dcrunner/dcrunner.mapping";
import {
  AMDCSkimmer,
  FOAM,
  WATER_PERIOD,
} from "../src/devices/aquamedic/dcskimmer/dcskimmer";
import {
  LAYOUT as skimmer_layout,
  PICTURE as skimmer_picture,
  config as skimmer_config,
} from "../src/devices/aquamedic/dcskimmer/dcskimmer.mapping";
import { AMSmartDrift } from "../src/devices/aquamedic/smartdrift/smartdrift";
import {
  CAP,
  LAYOUT as drift_layout,
  PICTURE as drift_picture,
  STREAMS as drift_streams,
  config as drift_config,
} from "../src/devices/aquamedic/smartdrift/smartdrift.mapping";
import { SafeEval } from "../src/utils/SafeEval";
import i18n from "../src/translations/myi18n";

// --- Fixtures ---------------------------------------------------------------

const RUNNER_SCHEDULE = [
  { slot: 0, start: 480, end: 720, mode: "auto", value: 60 },
  { slot: 1, start: 720, end: 735, mode: "feeding", value: 10 },
  { slot: 2, start: 1320, end: 1439, mode: "stop", value: 0 },
];

const DRIFT_SCHEDULE = [
  {
    slot: 0,
    start: 480,
    end: 720,
    mode: "sine_wave",
    value: 60,
    frequency: 40,
    tide: true,
  },
];

const RUNNER_MODES = ["stop", "auto", "feeding"];
const DRIFT_MODES = [
  "stop",
  "classic_wave",
  "sine_wave",
  "random_wave",
  "constant_flow",
  "feeding",
];

type Kind = "runner" | "legacy" | "drift";

interface Opts {
  kind?: Kind;
  power?: string;
  timer?: string;
  feed?: string;
  faults?: string[];
  schedule?: any;
  schedule_state?: string;
  speed?: string;
  time_zone?: string;
  role?: string;
  mode?: string;
  frequency?: string;
}

/** Build a hass object holding one Aqua Medic pump. */
function makeHass(opts: Opts = {}) {
  const kind = opts.kind ?? "runner";
  const states: Record<string, any> = {};
  const entities: Record<string, any> = {};
  const add = (
    domain: string,
    key: string,
    state: string,
    attributes: Record<string, any> = {},
  ) => {
    const entity_id = `${domain}.pump_${key}`;
    states[entity_id] = {
      entity_id,
      state,
      attributes: { friendly_name: `Pump ${key}`, ...attributes },
    };
    entities[entity_id] = {
      entity_id,
      device_id: "dev1",
      translation_key: key,
    };
  };

  add("switch", "power", opts.power ?? "on");
  add("switch", "feed_switch", opts.feed ?? "off");
  add("switch", "control_0_10v", "off");
  add("select", "pump_role", opts.role ?? "return");
  const speed = { min: 30, max: 100, step: 1, unit_of_measurement: "%" };
  if (kind === "legacy") {
    add("number", "flow", opts.speed ?? "60", speed);
  } else {
    add("switch", "timer_on", opts.timer ?? "on");
    for (const key of AM_FAULT_KEYS) {
      add(
        "binary_sensor",
        key,
        (opts.faults ?? []).includes(key) ? "on" : "off",
      );
    }
    const drift = kind === "drift";
    const schedule =
      opts.schedule ?? (drift ? DRIFT_SCHEDULE : RUNNER_SCHEDULE);
    add("sensor", "schedule", opts.schedule_state ?? String(schedule.length), {
      schedule,
      kind: drift ? "drift" : "runner",
      modes: drift ? DRIFT_MODES : RUNNER_MODES,
      min_value: drift ? 0 : 30,
      max_slots: 48,
    });
    if (drift) {
      add("number", "flow", opts.speed ?? "75", { ...speed, min: 0 });
      add("number", "frequency", opts.frequency ?? "50", { ...speed, min: 0 });
      add("switch", "pulse_tide", "off");
      add("select", "mode", opts.mode ?? "sine_wave");
    } else {
      add("number", "motor_speed", opts.speed ?? "60", speed);
    }
  }

  return {
    states,
    entities,
    devices: {},
    config: { time_zone: opts.time_zone ?? "UTC" },
    callService: vi.fn(),
    formatEntityState: (s: any) => "fmt:" + s.state,
  } as any;
}

const TAGS: Record<Kind, [string, string]> = {
  runner: ["aquamedic-dcrunner", "DC Runner"],
  legacy: ["aquamedic-dcrunner", "DC Runner"],
  drift: ["aquamedic-smartdrift", "SmartDrift"],
};

/** Build a device view wired to its hass, entities populated. */
function makeDevice(opts: Opts = {}, tag?: string): any {
  const kind = opts.kind ?? "runner";
  const hass = makeHass(opts);
  const device: any = new (customElements.get(tag ?? TAGS[kind][0]) as any)();
  device.device = {
    name: "Pump",
    elements: [
      {
        id: "dev1",
        name: "Pump",
        model: TAGS[kind][1],
        identifiers: [["aquamedic", "did1"]],
        disabled_by: null,
        primary_config_entry: "cfg1",
      },
    ],
  };
  device.setConfig(null);
  device.hass = hass;
  device._populate_entities();
  return device;
}

/** Create one element of a device mapping and mount it. */
async function mount(device: any, key: string) {
  const conf = device.config.elements[key];
  const el: any = MyElement.create_element(device._hass, conf, device);
  el.stateOn = device.is_on();
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** Flatten a lit template into text close enough to grep on. */
function markup(tpl: any): string {
  if (tpl == null) return "";
  if (Array.isArray(tpl)) return tpl.map(markup).join("");
  if (tpl?.strings && tpl?.values) {
    let out = "";
    tpl.strings.forEach((s: string, i: number) => {
      out += s;
      if (i < tpl.values.length) {
        const v = tpl.values[i];
        if (typeof v !== "function" && !(v instanceof HTMLElement)) {
          out += markup(v);
        }
      }
    });
    return out;
  }
  return String(tpl);
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// --- Mapping ----------------------------------------------------------------

describe("Aqua Medic mappings", () => {
  const PICTURE: AMPicture = {
    box: 1.25,
    ratio: 1.2,
    width: 80,
    left: 10,
    top: 5,
  };

  it("places the picture with margins, all taken from the box width", () => {
    expect(picture_css(PICTURE)).toEqual({
      width: "80%",
      "margin-left": "10%",
      "margin-top": "5%",
    });
  });

  it("converts a point of the picture into a point of the box", () => {
    // Corners of the picture: 80 wide, 80 × 1.2 = 96 high, in a box 125 high
    expect(picture_point(PICTURE, 0, 0)).toEqual([10, 4]);
    expect(picture_point(PICTURE, 100, 100)).toEqual([90, 80.8]);
    expect(picture_point(PICTURE, 50, 50)).toEqual([50, 42.4]);
  });

  it("centres an element on a point of the box", () => {
    expect(centred_at([30, 40])).toMatchObject({
      position: "absolute",
      left: "30%",
      top: "40%",
      transform: "translate(-50%,-50%)",
    });
  });

  it("builds a slider row: a label and the slider under it", () => {
    const row = slider_row("speed", "motor_speed", "am_speed", 50) as any;
    expect(Object.keys(row)).toEqual(["speed_label", "speed_slider"]);
    expect(row.speed_label.css.top).toBe("50%");
    expect(row.speed_label.value).toBe("${i18n._('am_speed')}");
    expect(row.speed_slider.css.top).toBe("53.5%");
    expect(row.speed_slider.name).toBe("motor_speed");
  });

  it("builds the shared elements from a layout", () => {
    const layout: AMLayout = {
      icons: {
        power: [10, 5],
        feed_switch: [20, 5],
        timer_on: [30, 5],
        control_0_10v: [40, 5],
        configuration: [90, 5],
      },
      ring: { center: [70, 30], width: 28, value: true },
      faults: { top: 60, left: 3, width: 94 },
      slider_top: 65,
      schedule: { top: 78, height: 20 },
    };
    const elements: any = common_elements("motor_speed", "am_speed", layout);
    expect(elements.power.css).toMatchObject({ left: "10%", top: "5%" });
    expect(elements.power.off_clickable).toBe(true);
    expect(elements.timer_on.hold_action.data).toBe("schedule");
    expect(elements.configuration.css.left).toBe("90%");
    expect(elements.faults.css).toMatchObject({
      top: "60%",
      left: "3%",
      width: "94%",
    });
    expect(elements.speed.css).toMatchObject({
      left: "70%",
      top: "30%",
      width: "28%",
      "pointer-events": "none",
    });
    // The figure is shown, and the ring keeps its default colours
    expect(elements.speed.no_value).toBe(false);
    expect(elements.speed.colors).toEqual({});
    expect(elements.speed_label.css.top).toBe("65%");
    expect(elements.schedule.css).toMatchObject({ top: "78%", height: "20%" });
    // A fixed overlay must not be trapped by a transform
    expect(elements.schedule.css).not.toHaveProperty("transform");
  });

  it("shares the common elements across the three views", () => {
    const common = Object.keys(
      common_elements("motor_speed", "am_speed", runner_layout),
    );
    for (const config of [runner_config, skimmer_config, drift_config]) {
      expect(Object.keys(config.elements)).toEqual(
        expect.arrayContaining(common),
      );
    }
  });

  it("gives each view a box fitting its picture", () => {
    const cases: [AMPicture, AMLayout, any][] = [
      [runner_picture, runner_layout, runner_config],
      [skimmer_picture, skimmer_layout, skimmer_config],
      [drift_picture, drift_layout, drift_config],
    ];
    for (const [picture, layout, config] of cases) {
      expect(config.css).toEqual(picture_css(picture));
      // The picture stays inside the box, sideways and down
      expect(picture.left + picture.width).toBeLessThanOrEqual(100);
      expect(picture.top + picture.width * picture.ratio).toBeLessThanOrEqual(
        picture.box * 100,
      );
      // The program ends inside the box, under the sliders
      expect(layout.schedule.top + layout.schedule.height).toBeLessThanOrEqual(
        100,
      );
      expect(layout.schedule.top).toBeGreaterThan(layout.slider_top);
      expect(String(config.background_img)).toContain("am-");
      // Every icon is inside the box
      for (const [x, y] of Object.values(layout.icons)) {
        expect(x).toBeGreaterThan(0);
        expect(x).toBeLessThan(100);
        expect(y).toBeGreaterThan(0);
        expect(y).toBeLessThan(100);
      }
    }
  });

  it("draws the DC Runner ring on the motor, with its figure", () => {
    const ring: any = runner_config.elements.speed;
    expect(runner_layout.ring?.center).toEqual(
      picture_point(runner_picture, 72, 35),
    );
    expect(ring.no_value).toBe(false);
    expect(ring.colors.center).toBeDefined();
  });

  it("covers the picture with an overlay drawn in its own pixels", () => {
    expect(picture_rect(PICTURE)).toEqual({
      flex: "0 0 auto",
      position: "absolute",
      left: "10%",
      top: "4%",
      width: "80%",
      height: "76.8%",
      "pointer-events": "none",
    });
  });

  it("hides a speed that is absent or unavailable", () => {
    expect(speed_hidden("flow")).toContain("entity.flow?.state === undefined");
    expect(speed_hidden("flow")).toContain("'unavailable'");
  });

  it("leaves the ring out when the view draws its own", () => {
    const { ring: _ring, ...without } = runner_layout;
    const elements: any = common_elements("flow", "am_flow", without);
    expect(elements.speed).toBeUndefined();
    expect(elements.speed_slider).toBeDefined();
  });

  it("fits the SmartDrift ring on the front cap, over the whole picture", () => {
    const ring: any = drift_config.elements.speed;
    expect(drift_layout.ring).toBeUndefined();
    expect(ring.type).toBe("aquamedic-cap-ring");
    expect(ring.name).toBe("flow");
    expect(ring.geometry).toEqual(CAP);
    expect(ring.css).toEqual(picture_rect(drift_picture));
    // The ellipse stays inside the picture it is measured on
    expect(CAP.cx + CAP.rx + CAP.width / 2).toBeLessThan(CAP.view[0]);
    expect(CAP.cy + CAP.ry + CAP.width / 2).toBeLessThan(CAP.view[1]);
    expect(CAP.view[1] / CAP.view[0]).toBeCloseTo(drift_picture.ratio);
  });

  it("puts the skimmer controls beside the picture, not over it", () => {
    const right_edge = skimmer_picture.left + skimmer_picture.width * 0.68;
    for (const [x] of Object.values(skimmer_layout.icons)) {
      expect(x).toBeGreaterThan(right_edge);
    }
    const ring = skimmer_layout.ring!;
    expect(ring.center[0] - (ring.width * 0.72) / 2).toBeGreaterThan(
      right_edge,
    );
  });

  it("sizes the box of each view from its picture", () => {
    const text = (ratio: number) =>
      (am_box_styles(ratio) as any[]).map((style) => style.cssText).join("");
    expect(text(1.25)).toContain("aspect-ratio: 1 / 1.25");
    for (const [cls, picture] of [
      [AMDCRunner, runner_picture],
      [AMDCSkimmer, skimmer_picture],
      [AMSmartDrift, drift_picture],
    ] as [any, AMPicture][]) {
      const css = (cls.styles as any[]).map((s) => s.cssText).join("");
      expect(css).toContain("aspect-ratio: 1 / " + picture.box);
    }
  });

  it("names each model and its own picture", () => {
    expect(runner_config.model).toBe("DC Runner");
    expect(skimmer_config.model).toBe("DC Skimmer");
    expect(drift_config.model).toBe("SmartDrift");
    expect(String(runner_config.background_img)).toContain("am-dcrunner.png");
    expect(String(skimmer_config.background_img)).toContain("am-dcskimmer.png");
    expect(String(drift_config.background_img)).toContain("am-ecodrift.png");
  });

  it("drives the SmartDrift from its flow and adds the wave settings", () => {
    const elements: any = drift_config.elements;
    expect(elements.speed.name).toBe("flow");
    expect(elements.frequency_slider.name).toBe("frequency");
    expect(elements.pulse_tide.name).toBe("pulse_tide");
    expect(elements.mode.name).toBe("select.mode");
  });

  it("only uses element types the card registers", () => {
    for (const config of [runner_config, drift_config]) {
      for (const conf of Object.values<any>(config.elements)) {
        expect(customElements.get(conf.type), conf.type).toBeDefined();
      }
    }
  });

  it("hides the elements whose entity the pump lacks", () => {
    const check = (kind: Kind, key: string) => {
      const device = makeDevice({ kind });
      const conf = device.config.elements[key];
      return new SafeEval({
        entity: MyElement.createEntitiesContext(device, device._hass),
      } as any).evaluateCondition(conf.disabled_if);
    };
    // The legacy DC Runner firmware has neither timer nor program
    expect(check("legacy", "timer_on")).toBe(true);
    expect(check("legacy", "schedule")).toBe(true);
    expect(check("runner", "timer_on")).toBe(false);
    expect(check("runner", "schedule")).toBe(false);
    expect(check("runner", "feed_switch")).toBe(false);
    expect(check("runner", "control_0_10v")).toBe(false);
    // ...but its speed is there, under the current firmware's name
    expect(check("legacy", "speed")).toBe(false);
    expect(check("legacy", "speed_slider")).toBe(false);
    // The frequency only exists on a SmartDrift
    expect(check("drift", "frequency_slider")).toBe(false);
  });

  it("hides the speed while the pump is driven by its 0-10V input", () => {
    const device = makeDevice({ speed: "unavailable" });
    const evaluator = new SafeEval({
      entity: MyElement.createEntitiesContext(device, device._hass),
    } as any);
    const elements = device.config.elements;
    expect(evaluator.evaluateCondition(elements.speed.disabled_if)).toBe(true);
    expect(evaluator.evaluateCondition(elements.speed_slider.disabled_if)).toBe(
      true,
    );
    expect(evaluator.evaluateCondition(elements.speed_label.disabled_if)).toBe(
      true,
    );
  });
});

describe("Aqua Medic dialogs", () => {
  const rows = (dialog: any) =>
    dialog.config.content[0].conf.entities
      .map((row: any) => row.entity)
      .filter(Boolean);

  it("lists the DC Runner settings, then the faults", () => {
    const entities = rows(dialogs_am_runner);
    expect(entities).toContain("number.motor_speed");
    expect(entities).toContain("select.pump_role");
    expect(entities).toContain("sensor.schedule");
    expect(entities).not.toContain("select.mode");
    expect(entities.slice(-AM_FAULT_KEYS.length)).toEqual(
      AM_FAULT_KEYS.map((key) => "binary_sensor." + key),
    );
  });

  it("lists the wave settings for a SmartDrift", () => {
    const entities = rows(dialogs_am_drift);
    expect(entities).toContain("select.mode");
    expect(entities).toContain("select.linkage");
    expect(entities).toContain("number.frequency");
    expect(entities).not.toContain("select.pump_role");
  });

  it("is loaded by each view", () => {
    expect(makeDevice().dialogs.config).toEqual(dialogs_am_runner.config);
    expect(makeDevice({}, "aquamedic-dcskimmer").dialogs.config).toEqual(
      dialogs_am_runner.config,
    );
    expect(makeDevice({ kind: "drift" }).dialogs.config).toEqual(
      dialogs_am_drift.config,
    );
  });
});

// --- Device -----------------------------------------------------------------

describe("AMDevice", () => {
  it("is the base of the three views", () => {
    expect(makeDevice()).toBeInstanceOf(AMDCRunner);
    expect(makeDevice()).toBeInstanceOf(AMDevice);
    expect(makeDevice({}, "aquamedic-dcskimmer")).toBeInstanceOf(AMDCSkimmer);
    expect(makeDevice({ kind: "drift" })).toBeInstanceOf(AMSmartDrift);
    expect(makeDevice({ kind: "drift" })).toBeInstanceOf(RSDevice);
  });

  it("follows the power switch", () => {
    expect(makeDevice().is_on()).toBe(true);
    expect(makeDevice({ power: "off" }).is_on()).toBe(false);
  });

  it("reads the switches", () => {
    const device = makeDevice({ timer: "on", feed: "on" });
    expect(device.timer_on()).toBe(true);
    expect(device.is_feeding()).toBe(true);
    const off = makeDevice({ timer: "off" });
    expect(off.timer_on()).toBe(false);
    expect(off.is_feeding()).toBe(false);
    // A switch the pump does not have reads as off
    expect(makeDevice({ kind: "legacy" }).timer_on()).toBe(false);
  });

  it("exposes the program and its rules", () => {
    const device = makeDevice();
    expect(device.schedule().map((s: any) => s.mode)).toEqual([
      "auto",
      "feeding",
      "stop",
    ]);
    expect(device.program_rules()).toEqual({
      modes: RUNNER_MODES,
      min_value: 30,
      has_frequency: false,
      max_slots: 48,
    });
    expect(makeDevice({ kind: "drift" }).program_rules().has_frequency).toBe(
      true,
    );
    // No schedule sensor at all: an empty program, default rules
    const legacy = makeDevice({ kind: "legacy" });
    expect(legacy.schedule()).toEqual([]);
    expect(legacy.program_rules().min_value).toBe(0);
  });

  it("gives the minute of the day in Home Assistant's time zone", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:30:00Z"));
    expect(makeDevice().now_minute()).toBe(630);
    expect(makeDevice({ time_zone: "Europe/Paris" }).now_minute()).toBe(690);
  });

  it("lists the active faults, most severe first, without the device name", () => {
    expect(makeDevice().active_faults()).toEqual([]);
    const device = makeDevice({
      faults: ["fault_uart", "fault_no_liveload"],
    });
    expect(device.active_faults()).toEqual([
      { key: "fault_no_liveload", name: "fault_no_liveload" },
      { key: "fault_uart", name: "fault_uart" },
    ]);
  });

  it("keeps a fault name that does not start with the device name", () => {
    const device = makeDevice({ faults: ["fault_overtemp"] });
    const entity_id = device.entities["fault_overtemp"].entity_id;
    device._hass.states[entity_id].attributes = {};
    expect(device.active_faults()).toEqual([
      { key: "fault_overtemp", name: "fault_overtemp" },
    ]);
    device._hass.states[entity_id].attributes = { friendly_name: "Hot" };
    expect(device.active_faults()[0].name).toBe("Hot");
    // No device name known: the friendly name is used as is
    device.device.elements[0].name = undefined;
    device._hass.states[entity_id].attributes = { friendly_name: "Pump Hot" };
    expect(device.active_faults()[0].name).toBe("Pump Hot");
  });

  it("aliases the legacy speed entity to the current name", () => {
    const legacy = makeDevice({ kind: "legacy" });
    expect(legacy.entities["motor_speed"]).toBe(legacy.entities["flow"]);
    expect(legacy.entities["number.motor_speed"].entity_id).toBe(
      "number.pump_flow",
    );
    // The current firmware keeps its own entity
    const runner = makeDevice();
    expect(runner.entities["motor_speed"].entity_id).toBe(
      "number.pump_motor_speed",
    );
    expect(runner.entities["flow"]).toBeUndefined();
  });

  it("draws its picture and no 'planned' banner", () => {
    const device = makeDevice();
    const out = markup(device.render());
    expect(out).toContain("am-dcrunner.png");
    expect(out).not.toContain(i18n._("dev_planned"));
    expect(out).not.toContain("grayscale");
  });

  it("greys the picture out while the pump is off", () => {
    expect(markup(makeDevice({ power: "off" }).render())).toContain(
      "grayscale",
    );
  });

  it("renders without a picture", () => {
    const device = makeDevice();
    device.update_config();
    device.config.background_img = undefined;
    expect(markup(device._render("", ""))).toContain('src=""');
  });

  it("builds every element of its mapping", () => {
    for (const kind of ["runner", "drift"] as Kind[]) {
      const device = makeDevice({ kind });
      device.render();
      expect(Object.keys(device._elements).sort()).toEqual(
        Object.keys(device.config.elements).sort(),
      );
    }
  });

  it("has no editor options", () => {
    const device = makeDevice();
    device.isEditorMode = true;
    expect(markup(device.render())).toBe("");
  });
});

// --- Cap ring ---------------------------------------------------------------

describe("AMCapRing", () => {
  it("draws an ellipse fitted on the cap, the figure in its centre", async () => {
    const el = await mount(makeDevice({ kind: "drift", speed: "75" }), "speed");
    expect(el).toBeInstanceOf(AMCapRing);
    const root = el.shadowRoot;
    expect(root.querySelector("svg").getAttribute("viewBox")).toBe(
      `0 0 ${CAP.view[0]} ${CAP.view[1]}`,
    );
    expect(root.querySelector("g").getAttribute("transform")).toBe(
      `translate(${CAP.cx} ${CAP.cy}) rotate(${CAP.angle})`,
    );
    const value = root.querySelector(".cap_value");
    // Two half arcs with the measured half axes
    expect(value.getAttribute("d")).toContain(`A ${CAP.rx} ${CAP.ry}`);
    expect(value.getAttribute("stroke-dasharray")).toBe("75 100");
    expect(value.getAttribute("stroke-linecap")).toBe("round");
    expect(value.getAttribute("stroke")).toBe(`rgb(${drift_config.color})`);
    const text = root.querySelector(".cap_text");
    expect(text.textContent.trim()).toBe("75%");
    expect(text.getAttribute("x")).toBe(String(CAP.cx));
    expect(text.getAttribute("font-size")).toBe(String(CAP.font_size));
  });

  it("draws an empty ring with a flat end at 0 %", async () => {
    const el = await mount(makeDevice({ kind: "drift", speed: "0" }), "speed");
    const value = el.shadowRoot.querySelector(".cap_value");
    expect(value.getAttribute("stroke-dasharray")).toBe("0 100");
    expect(value.getAttribute("stroke-linecap")).toBe("butt");
    expect(el.shadowRoot.querySelector(".cap_text").textContent.trim()).toBe(
      "0%",
    );
  });

  it("stays within 0-100 %", async () => {
    const el = await mount(
      makeDevice({ kind: "drift", speed: "140" }),
      "speed",
    );
    expect(el.shadowRoot.querySelector(".cap_text").textContent.trim()).toBe(
      "100%",
    );
  });

  it("greys out with the pump, or with the group it is rendered in", async () => {
    const off = await mount(
      makeDevice({ kind: "drift", power: "off" }),
      "speed",
    );
    expect(
      off.shadowRoot.querySelector(".cap_value").getAttribute("stroke"),
    ).toBe("rgb(150,150,150)");

    const on = await mount(makeDevice({ kind: "drift" }), "speed");
    on.groupOn = false;
    await on.updateComplete;
    expect(
      on.shadowRoot.querySelector(".cap_value").getAttribute("stroke"),
    ).toBe("rgb(150,150,150)");
  });

  it("follows the flow entity", async () => {
    const device = makeDevice({ kind: "drift", speed: "75" });
    const el = await mount(device, "speed");
    const entity_id = device.entities["flow"].entity_id;
    device._hass.states[entity_id] = {
      ...device._hass.states[entity_id],
      state: "40",
    };
    el.hass = device._hass;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector(".cap_text").textContent.trim()).toBe(
      "40%",
    );
  });

  it("renders nothing without its entity, and avoids a division by zero", async () => {
    const device = makeDevice({ kind: "drift" });
    const el = await mount(device, "speed");
    el.conf = { ...el.conf, target: 0 };
    el.stateObjTarget = { entity_id: "x", state: "0", attributes: {} };
    await el.updateComplete;
    // A zero target counts as 1: 75 / 1, bounded to 100 %
    expect(el.shadowRoot.querySelector(".cap_text").textContent.trim()).toBe(
      "100%",
    );
    el.stateObj = null;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector("svg")).toBeNull();
  });
});

// --- Water streams ----------------------------------------------------------

describe("pump activity", () => {
  it("reads the speed from the entity driving each pump", () => {
    expect(makeDevice({ speed: "80" }).speed()).toBe(80);
    expect(makeDevice({ speed: "80" }).speed_entity()).toBe(
      "number.motor_speed",
    );
    const drift = makeDevice({ kind: "drift", speed: "45" });
    expect(drift.speed_entity()).toBe("number.flow");
    expect(drift.speed()).toBe(45);
    expect(makeDevice({ speed: "unavailable" }).speed()).toBe(0);
  });

  it("runs while it is on and not held by the feeding pause", () => {
    expect(makeDevice().is_running()).toBe(true);
    expect(makeDevice({ power: "off" }).is_running()).toBe(false);
    expect(makeDevice({ feed: "on" }).is_running()).toBe(false);
  });

  it("gives the wave frequency of a SmartDrift, none on a steady flow", () => {
    expect(
      makeDevice({ kind: "drift", frequency: "70" }).wave_frequency(),
    ).toBe(70);
    expect(
      makeDevice({ kind: "drift", frequency: "unknown" }).wave_frequency(),
    ).toBe(0);
    expect(
      makeDevice({ kind: "drift", mode: "constant_flow" }).wave_frequency(),
    ).toBeNull();
  });
});

describe("flow timings", () => {
  it("makes the dashes travel faster as the pump speeds up", () => {
    expect(flow_period(0)).toBe(FLOW_PERIOD.slow);
    expect(flow_period(100)).toBeCloseTo(FLOW_PERIOD.fast);
    expect(flow_period(50)).toBeCloseTo(
      (FLOW_PERIOD.slow + FLOW_PERIOD.fast) / 2,
    );
    expect(flow_period(250)).toBeCloseTo(FLOW_PERIOD.fast);
    expect(flow_period(-5)).toBe(FLOW_PERIOD.slow);
  });

  it("makes the swell shorter as the wave frequency rises", () => {
    expect(pulse_period(0)).toBe(PULSE_PERIOD.slow);
    expect(pulse_period(100)).toBeCloseTo(PULSE_PERIOD.fast);
    expect(pulse_period(150)).toBeCloseTo(PULSE_PERIOD.fast);
    expect(pulse_period(-1)).toBe(PULSE_PERIOD.slow);
  });
});

describe("stream layouts", () => {
  it("fans four jets out of the front of the SmartDrift", () => {
    expect(drift_streams).toHaveLength(4);
    for (const stream of drift_streams) {
      expect(stream.fade).toBe("out");
      // Each jet leaves the opening and runs to the right
      expect(stream.d.startsWith(`M ${stream.from[0]} ${stream.from[1]}`)).toBe(
        true,
      );
      expect(stream.to[0]).toBeGreaterThan(stream.from[0]);
    }
    // The top jet rises, the bottom one drops
    expect(drift_streams[0].to[1]).toBeLessThan(drift_streams[0].from[1]);
    expect(drift_streams[3].to[1]).toBeGreaterThan(drift_streams[3].from[1]);
    const flow: any = drift_config.elements.flow;
    expect(flow.pulse).toBe(true);
    expect(flow.css).toEqual(picture_rect(drift_picture));
    // Drawn before the ring, so the ring and its figure stay on top
    const keys = Object.keys(drift_config.elements);
    expect(keys.indexOf("flow")).toBeLessThan(keys.indexOf("speed"));
  });

  it("draws water into the inlet and out of the outlet of the DC Runner", () => {
    const into = runner_streams.filter((s) => s.fade === "in");
    const out = runner_streams.filter((s) => s.fade === "out");
    expect(into).toHaveLength(3);
    expect(out).toHaveLength(3);
    // Inlet: from the left margin towards the pump
    for (const stream of into) {
      expect(stream.from[0]).toBeLessThan(0);
      expect(stream.to[0]).toBeGreaterThan(0);
    }
    // Outlet: upwards, into the margin over the picture
    for (const stream of out) {
      expect(stream.to[1]).toBeLessThan(0);
    }
    // The margins of the picture hold what runs past its edges
    const px = (365 * 100) / runner_picture.width; // picture pixels per box width
    const left = (runner_picture.left * px) / 100;
    const top = (runner_picture.top * px) / 100;
    for (const stream of runner_streams) {
      expect(Math.min(stream.from[0], stream.to[0])).toBeGreaterThanOrEqual(
        -left,
      );
      expect(Math.min(stream.from[1], stream.to[1])).toBeGreaterThanOrEqual(
        -top,
      );
    }
    expect((runner_config.elements as any).flow.pulse).toBeUndefined();
  });
});

describe("AMFlow", () => {
  it("draws each stream as a faint bed and travelling dashes", async () => {
    const el = await mount(makeDevice({ speed: "100" }), "flow");
    expect(el).toBeInstanceOf(AMFlow);
    const root = el.shadowRoot;
    expect(root.querySelector("svg").getAttribute("viewBox")).toBe(
      "0 0 365 439",
    );
    expect(root.querySelectorAll(".bed")).toHaveLength(6);
    const streams = [...root.querySelectorAll(".stream")] as any[];
    expect(streams).toHaveLength(6);
    expect(streams[0].getAttribute("d")).toBe(runner_streams[0].d);
    expect(streams[0].getAttribute("stroke")).toBe("url(#fade0)");
    expect(streams[0].getAttribute("stroke-width")).toBe("8");
    expect(streams[0].getAttribute("style")).toContain(
      `animation-duration:${FLOW_PERIOD.fast.toFixed(2)}s`,
    );
    // Streams are spread over the period so they do not move as one
    expect(streams[3].getAttribute("style")).toContain("animation-delay:-0.2");
    expect(el.get_tooltip()).toBe("");
  });

  it("fades a jet away and lets drawn-in water appear", async () => {
    const el = await mount(makeDevice({ speed: "100" }), "flow");
    const stops = (id: string) =>
      [...el.shadowRoot.querySelectorAll(`#${id} stop`)].map((stop: any) =>
        Number(stop.getAttribute("stop-opacity")),
      );
    // Inlet: transparent at its start, full at its end
    const into = stops("fade0");
    expect(into[0]).toBe(0);
    expect(into[2]).toBeGreaterThan(0.9);
    // Outlet: the reverse
    const out = stops("fade3");
    expect(out[0]).toBeGreaterThan(0.9);
    expect(out[2]).toBe(0);
  });

  it("is steady on a pump that makes no wave", async () => {
    const el = await mount(makeDevice(), "flow");
    const group = el.shadowRoot.querySelector("svg > g");
    expect(group.getAttribute("class")).toBe("");
    expect(group.getAttribute("style")).toBe("");
  });

  it("swells at the pace of the wave frequency on a SmartDrift", async () => {
    const el = await mount(
      makeDevice({ kind: "drift", frequency: "100" }),
      "flow",
    );
    const group = el.shadowRoot.querySelector("svg > g");
    expect(group.getAttribute("class")).toBe("pulse");
    expect(group.getAttribute("style")).toBe(
      `animation-duration:${PULSE_PERIOD.fast.toFixed(2)}s`,
    );
    expect(
      el.shadowRoot.querySelector(".stream").getAttribute("stroke-width"),
    ).toBe("22");
  });

  it("does not swell in constant flow mode", async () => {
    const el = await mount(
      makeDevice({ kind: "drift", mode: "constant_flow" }),
      "flow",
    );
    expect(el.shadowRoot.querySelector("svg > g").getAttribute("class")).toBe(
      "",
    );
  });

  it.each([
    { power: "off" },
    { feed: "on" },
    { kind: "drift" as Kind, speed: "0" },
  ])("draws nothing while the pump does not push water (%o)", async (opts) => {
    const el = await mount(makeDevice(opts), "flow");
    expect(el.shadowRoot.querySelector("svg")).toBeNull();
  });

  it("follows the pump: speed, feeding pause, power", async () => {
    const device = makeDevice({ speed: "50" });
    const el = await mount(device, "flow");
    el.hass = device._hass;
    const spy = vi.spyOn(el, "requestUpdate");

    el.hass = device._hass;
    expect(spy).not.toHaveBeenCalled();

    device._hass.states[device.entities["motor_speed"].entity_id].state = "90";
    el.hass = device._hass;
    expect(spy).toHaveBeenCalledTimes(1);

    device._hass.states[device.entities["feed_switch"].entity_id].state = "on";
    el.hass = device._hass;
    expect(spy).toHaveBeenCalledTimes(2);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector("svg")).toBeNull();
  });

  it("uses defaults for what the mapping leaves out", async () => {
    const device = makeDevice();
    const el: any = MyElement.create_element(
      device._hass,
      { name: "x", type: "aquamedic-flow", stateObj: null, view: [10, 10] },
      device,
    );
    document.body.appendChild(el);
    await el.updateComplete;
    // No stream given: an empty drawing, not an error
    expect(el.shadowRoot.querySelector("svg")).not.toBeNull();
    expect(el.shadowRoot.querySelectorAll(".stream")).toHaveLength(0);

    el.conf = {
      ...el.conf,
      color: "1,2,3",
      streams: [{ d: "M 0 0 L 5 5", from: [0, 0], to: [5, 5], fade: "out" }],
    };
    await el.updateComplete;
    expect(
      el.shadowRoot.querySelector(".stream").getAttribute("stroke-width"),
    ).toBe("12");
    expect(el.shadowRoot.querySelector("stop").getAttribute("stop-color")).toBe(
      "rgb(1,2,3)",
    );
  });

  it("stays still without a device", () => {
    const el: any = new AMFlow();
    el.device = undefined;
    el.conf = { pulse: true };
    expect(el._speed()).toBe(0);
    expect(el._pulse()).toBe(0);
  });
});

// --- Skimmer activity -------------------------------------------------------

/** Build a DC Skimmer view. */
function makeSkimmer(opts: Opts = {}): any {
  return makeDevice({ role: "skimmer", ...opts }, "aquamedic-dcskimmer");
}

describe("AMDCSkimmer activity", () => {
  it("runs while it is on and not held by the feeding pause", () => {
    expect(makeSkimmer().is_running()).toBe(true);
    expect(makeSkimmer({ power: "off" }).is_running()).toBe(false);
    expect(makeSkimmer({ feed: "on" }).is_running()).toBe(false);
  });

  it("reads the motor speed, 0 when it is not a number", () => {
    expect(makeSkimmer({ speed: "80" }).speed()).toBe(80);
    expect(makeSkimmer({ speed: "unavailable" }).speed()).toBe(0);
  });

  it("scrolls the water faster as the motor speeds up", () => {
    expect(AMDCSkimmer.water_period(30)).toBe(WATER_PERIOD.slow);
    expect(AMDCSkimmer.water_period(100)).toBe(WATER_PERIOD.fast);
    expect(AMDCSkimmer.water_period(65)).toBeCloseTo(
      (WATER_PERIOD.slow + WATER_PERIOD.fast) / 2,
    );
    // Outside the range of the motor, the pace is bounded
    expect(AMDCSkimmer.water_period(0)).toBe(WATER_PERIOD.slow);
    expect(AMDCSkimmer.water_period(150)).toBe(WATER_PERIOD.fast);
  });

  it("shows the foaming picture and the overlays while it runs", () => {
    const out = markup(makeSkimmer({ speed: "100" }).render());
    expect(out).toContain("am-dcskimmer-on.png");
    expect(out).toContain('class="water-overlay"');
    expect(out).toContain('class="foam-overlay"');
    expect(out).toContain(
      `animation-duration: ${WATER_PERIOD.fast.toFixed(2)}s`,
    );
    // The picture keeps its place: width and margins go on its wrapper
    expect(out).toContain('class="skimmer-picture"');
    expect(out).toContain("width:56%");
  });

  it("makes the bands more opaque at full speed than at the lowest", () => {
    const alpha = (speed: string) =>
      Number(
        /rgba\(255,255,255,([\d.]+)\) 10px/.exec(
          markup(makeSkimmer({ speed }).render()),
        )![1],
      );
    expect(alpha("100")).toBeGreaterThan(alpha("30"));
  });

  it.each([{ power: "off" }, { feed: "on" }])(
    "shows the idle picture and no overlay when stopped (%o)",
    (opts) => {
      const out = markup(makeSkimmer(opts).render());
      expect(out).toContain("am-dcskimmer.png");
      expect(out).not.toContain("am-dcskimmer-on.png");
      expect(out).not.toContain("water-overlay");
      expect(out).not.toContain("foam-overlay");
    },
  );

  it("re-renders when the feeding pause or the speed changes", () => {
    const device = makeSkimmer();
    // First pass with the entities known: the reference state
    device.hass = device._hass;
    device.to_render = false;
    // Nothing changed: no re-render
    device.hass = device._hass;
    expect(device.to_render).toBe(false);

    device._hass.states[device.entities["feed_switch"].entity_id].state = "on";
    device.hass = device._hass;
    expect(device.to_render).toBe(true);

    device.to_render = false;
    device._hass.states[device.entities["motor_speed"].entity_id].state = "45";
    device.hass = device._hass;
    expect(device.to_render).toBe(true);
  });

  it("fills the cup with bubbles, redrawn after each render", async () => {
    const device = makeSkimmer();
    document.body.appendChild(device);
    await device.updateComplete;
    const overlay = device.shadowRoot.querySelector(".foam-overlay");
    const bubbles = overlay.querySelectorAll(".foam-bubble");
    expect(bubbles).toHaveLength(FOAM.count);
    expect(bubbles[0].style.animationDuration).toMatch(/s$/);

    // A second pass replaces them instead of piling up
    device._spawnBubbles();
    expect(overlay.querySelectorAll(".foam-bubble")).toHaveLength(FOAM.count);
    expect(overlay.contains(bubbles[0])).toBe(false);
  });

  it("draws no bubble while the pump is stopped", async () => {
    const device = makeSkimmer({ power: "off" });
    document.body.appendChild(device);
    await device.updateComplete;
    expect(device.shadowRoot.querySelector(".foam-overlay")).toBeNull();
    expect(device.shadowRoot.querySelectorAll(".foam-bubble")).toHaveLength(0);
  });

  it("moves the bubbles on a timer, stopped when removed", async () => {
    vi.useFakeTimers();
    (window as any).loadCardHelpers = () => Promise.resolve({});
    const device = makeSkimmer();
    const spy = vi.spyOn(device, "_spawnBubbles");
    await device.connectedCallback();
    // Connecting twice must not stack a second timer
    await device.connectedCallback();
    // Connecting starts a first render, which draws the bubbles once
    await device.updateComplete;
    spy.mockClear();
    vi.advanceTimersByTime(FOAM.respawn_ms);
    expect(spy).toHaveBeenCalledTimes(1);

    device.disconnectedCallback();
    vi.advanceTimersByTime(FOAM.respawn_ms * 3);
    expect(spy).toHaveBeenCalledTimes(1);
    // Removing a view that is not ticking is harmless
    device.disconnectedCallback();
  });
});

// --- Faults banner ----------------------------------------------------------

describe("AMFaults", () => {
  it("renders nothing while the pump is healthy", async () => {
    const el = await mount(makeDevice(), "faults");
    expect(el).toBeInstanceOf(AMFaults);
    expect(el.shadowRoot.querySelector(".faults")).toBeNull();
    expect(el.get_tooltip()).toBe("");
  });

  it("shows the active faults on one blinking line", async () => {
    const el = await mount(
      makeDevice({ faults: ["fault_lockedrotor", "fault_overtemp"] }),
      "faults",
    );
    const banner = el.shadowRoot.querySelector(".faults");
    expect(banner.classList.contains("blink-alert")).toBe(true);
    expect(banner.textContent).toContain("fault_lockedrotor · fault_overtemp");
    expect(el.get_tooltip()).toBe("fault_lockedrotor\nfault_overtemp");
  });

  it("re-renders only when the set of faults changes", async () => {
    const device = makeDevice();
    const el = await mount(device, "faults");
    const spy = vi.spyOn(el, "requestUpdate");

    el.hass = device._hass;
    expect(spy).not.toHaveBeenCalled();

    const entity_id = device.entities["fault_uart"].entity_id;
    device._hass.states[entity_id].state = "on";
    el.hass = device._hass;
    expect(spy).toHaveBeenCalledTimes(1);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector(".faults")).not.toBeNull();
  });

  it("stays empty without a device", () => {
    const el: any = new AMFaults();
    el.device = undefined;
    expect(el.get_tooltip()).toBe("");
  });
});

// --- Schedule ---------------------------------------------------------------

describe("AMSchedule graph", () => {
  it("draws one block per slot and a cursor at the current time", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-15T12:00:00Z"));
    const el = await mount(makeDevice(), "schedule");
    expect(el).toBeInstanceOf(AMSchedule);
    const root = el.shadowRoot;
    const rects = [...root.querySelectorAll("rect")];
    expect(rects).toHaveLength(3);
    // Running slot: height follows the speed (60 % of the 168 high plot)
    expect(Number(rects[0].getAttribute("height"))).toBeCloseTo(100.8);
    // Feeding pause: dashed, full height
    expect(rects[1].getAttribute("stroke-dasharray")).toBe("4 3");
    expect(rects[1].getAttribute("height")).toBe("168");
    // Stop: a thin bar on the base line
    expect(rects[2].getAttribute("height")).toBe("4");
    // Noon is the middle of the graph
    expect(root.querySelector(".now").getAttribute("x1")).toBe("300");
    expect(root.querySelectorAll(".tick-label")).toHaveLength(5);
    expect(root.querySelector(".note")).toBeNull();
    expect(root.querySelector(".timer-off")).toBeNull();
    expect(el.get_tooltip()).toBe(i18n._("am_sched_title"));
  });

  it("keeps a sliver visible for a very short or very slow slot", async () => {
    const el = await mount(
      makeDevice({
        kind: "drift",
        schedule: [{ start: 0, end: 1, mode: "constant_flow", value: 0 }],
      }),
      "schedule",
    );
    const rect = el.shadowRoot.querySelector("rect");
    expect(rect.getAttribute("width")).toBe("1");
    expect(rect.getAttribute("height")).toBe("2");
  });

  it("dims the graph and says so while the timer is off", async () => {
    const el = await mount(makeDevice({ timer: "off" }), "schedule");
    const root = el.shadowRoot;
    expect(root.querySelector("g").getAttribute("class")).toBe("timer-off");
    expect(root.querySelector(".note").textContent).toBe(
      i18n._("am_sched_timer_off"),
    );
  });

  it("says when nothing is programmed", async () => {
    const el = await mount(makeDevice({ schedule: [] }), "schedule");
    expect(el.shadowRoot.querySelector(".note").textContent).toBe(
      i18n._("am_sched_empty"),
    );
    expect(el.shadowRoot.querySelectorAll("rect")).toHaveLength(0);
  });

  it("greys out with the pump", async () => {
    const el = await mount(makeDevice({ power: "off" }), "schedule");
    expect(
      el.shadowRoot.querySelector(".am-schedule").getAttribute("style"),
    ).toContain("grayscale");
  });

  it.each(["unavailable", "unknown"])(
    "shows a placeholder while the program is %s",
    async (schedule_state) => {
      const el = await mount(makeDevice({ schedule_state }), "schedule");
      const box = el.shadowRoot.querySelector(".am-schedule");
      expect(box.classList.contains("unavailable")).toBe(true);
      expect(box.textContent).toContain(i18n._("am_sched_unavailable"));
      expect(el.get_tooltip()).toBe("");
      // ...and cannot be edited
      el.openEditor();
      await el.updateComplete;
      expect(el.shadowRoot.querySelector(".editor-overlay")).toBeNull();
    },
  );

  it("is unavailable when the pump has no schedule sensor", async () => {
    const device = makeDevice({ kind: "legacy" });
    const el: any = MyElement.create_element(
      device._hass,
      device.config.elements.schedule,
      device,
    );
    expect(el.stateObj).toBeNull();
    el.hass = device._hass;
    expect(el.get_tooltip()).toBe("");
    expect(markup(el._render())).toContain("unavailable");
  });
});

describe("AMSchedule updates", () => {
  it("follows the program and the timer, not only the slot count", async () => {
    const device = makeDevice();
    const el = await mount(device, "schedule");
    el.hass = device._hass;
    const spy = vi.spyOn(el, "requestUpdate");

    // Same state object: nothing to redraw
    el.hass = device._hass;
    expect(spy).not.toHaveBeenCalled();

    // A slot resized: same count, different program
    const sensor = device.entities["schedule"].entity_id;
    device._hass.states[sensor] = {
      ...device._hass.states[sensor],
      attributes: {
        ...device._hass.states[sensor].attributes,
        schedule: [{ start: 0, end: 60, mode: "auto", value: 40 }],
      },
    };
    el.hass = device._hass;
    expect(spy).toHaveBeenCalled();
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll("rect")).toHaveLength(1);

    // The timer switched off: the sensor itself did not change
    spy.mockClear();
    device._hass.states[device.entities["timer_on"].entity_id].state = "off";
    el.hass = device._hass;
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("tolerates a sensor that disappears", async () => {
    const device = makeDevice();
    const el = await mount(device, "schedule");
    const before = el.stateObj;
    el.hass = { ...device._hass, states: {} };
    expect(el.stateObj).toBe(before);
  });

  it("moves the cursor every minute, and stops when removed", async () => {
    vi.useFakeTimers();
    const device = makeDevice();
    const el: any = MyElement.create_element(
      device._hass,
      device.config.elements.schedule,
      device,
    );
    document.body.appendChild(el);
    const spy = vi.spyOn(el, "requestUpdate");
    // Connecting twice must not stack a second timer
    el.connectedCallback();
    vi.advanceTimersByTime(AM_TICK_MS);
    expect(spy).toHaveBeenCalledTimes(1);

    el.remove();
    vi.advanceTimersByTime(AM_TICK_MS * 3);
    expect(spy).toHaveBeenCalledTimes(1);
    // Removing an element that is not ticking is harmless
    el.disconnectedCallback();
  });
});

// --- Editor -----------------------------------------------------------------

/** Mount a schedule element with its editor open. */
async function open(opts: Opts = {}) {
  const device = makeDevice(opts);
  const el = await mount(device, "schedule");
  el.shadowRoot.querySelector(".am-schedule").click();
  await el.updateComplete;
  return { device, el, root: el.shadowRoot as ShadowRoot };
}

/** Change the value of an input and wait for the editor to redraw. */
async function change(el: any, input: any, value: string | boolean) {
  if (typeof value === "boolean") input.checked = value;
  else input.value = value;
  input.dispatchEvent(new Event("change"));
  await el.updateComplete;
}

describe("AMSchedule editor", () => {
  it("opens on a click and lists the slots", async () => {
    const { root } = await open();
    expect(root.querySelector(".editor-overlay")).not.toBeNull();
    expect(root.querySelectorAll(".num")).toHaveLength(3);
    const times = [...root.querySelectorAll('input[type="time"]')] as any[];
    expect(times.map((t) => t.value)).toEqual([
      "08:00",
      "12:00",
      "12:00",
      "12:15",
      "22:00",
      "23:59",
    ]);
    // A DC Runner has neither frequency nor tide columns
    expect(root.querySelector(".slots").classList.contains("drift")).toBe(
      false,
    );
    expect(root.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    const options = [...root.querySelectorAll("select")[0].options];
    expect(options.map((o: any) => o.value)).toEqual(RUNNER_MODES);
    expect(options[1].textContent.trim()).toBe(i18n._("am_mode_auto"));
    expect(options[1].selected).toBe(true);
  });

  it("opens from the timer icon's long press", async () => {
    const device = makeDevice();
    device.render();
    const timer = device._elements["timer_on"];
    await timer.run_actions(device.config.elements.timer_on.hold_action);
    expect(device._elements["schedule"]._editing).toBe(true);
  });

  it("bounds the value input from the mode of the slot", async () => {
    const { root } = await open();
    const values = [...root.querySelectorAll('input[type="number"]')] as any[];
    // auto: motor floor to 100 %
    expect(values[0].min).toBe("30");
    expect(values[0].max).toBe("100");
    expect(values[0].disabled).toBe(false);
    // feeding: 1 to 60 minutes
    expect(values[1].min).toBe("1");
    expect(values[1].max).toBe("60");
    expect(values[1].title).toBe(i18n._("am_sched_minutes"));
    // stop: nothing to set
    expect(values[2].disabled).toBe(true);
  });

  it("highlights the slot running now, only while the timer is on", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-15T09:00:00Z"));
    const on = await open();
    expect(on.root.querySelectorAll(".slots .current")).toHaveLength(4);
    document.body.innerHTML = "";
    const off = await open({ timer: "off" });
    expect(off.root.querySelectorAll(".slots .current")).toHaveLength(0);
  });

  it("edits times, mode and value", async () => {
    const { el, root } = await open();
    const times = root.querySelectorAll('input[type="time"]');
    await change(el, times[0], "07:30");
    await change(el, times[1], "11:00");
    expect(el._draft[0]).toMatchObject({ start: 450, end: 660 });
    // Not a time: ignored
    await change(el, times[0], "");
    expect(el._draft[0].start).toBe(450);

    await change(el, root.querySelectorAll('input[type="number"]')[0], "72.4");
    expect(el._draft[0].value).toBe(72);
    // An emptied field: ignored rather than read as 0
    await change(el, root.querySelectorAll('input[type="number"]')[0], "");
    expect(el._draft[0].value).toBe(72);

    // Switching to a feeding pause brings the value back inside 1-60
    await change(el, root.querySelectorAll("select")[0], "feeding");
    expect(el._draft[0]).toMatchObject({ mode: "feeding", value: 60 });
    expect(el._error).toBeNull();
  });

  it("reports the first problem and locks the save button", async () => {
    const { el, root } = await open();
    await change(el, root.querySelectorAll('input[type="time"]')[1], "13:00");
    expect(el._error).toEqual({
      key: "sched_err_overlap",
      params: { n: 2, prev: 1 },
    });
    expect(root.querySelector(".error").textContent.trim()).toBe(
      i18n._("sched_err_overlap", { n: 2, prev: 1 }),
    );
    const save: any = root.querySelector(".btn-save");
    expect(save.disabled).toBe(true);
    // Saving anyway (keyboard, stale click) sends nothing
    el._save();
    expect(el._hass.callService).not.toHaveBeenCalled();
    expect(el._editing).toBe(true);
  });

  it("adds a slot after the last one and removes one", async () => {
    const { el, root } = await open({
      schedule: [{ start: 480, end: 720, mode: "auto", value: 60 }],
    });
    const add: any = root.querySelector(".editor-footer > button");
    add.click();
    await el.updateComplete;
    expect(el._draft).toHaveLength(2);
    expect(el._draft[1]).toEqual({
      start: 720,
      end: 780,
      mode: "auto",
      value: 50,
    });

    (root.querySelectorAll(".btn-icon")[1] as any).click();
    await el.updateComplete;
    expect(el._draft).toEqual([
      { start: 720, end: 780, mode: "auto", value: 50 },
    ]);
  });

  it("cannot add once the day or the pump is full", async () => {
    const full = await open({
      schedule: [{ start: 0, end: 1439, mode: "auto", value: 60 }],
    });
    const add: any = full.root.querySelector(".editor-footer > button");
    expect(add.disabled).toBe(true);
    full.el._add();
    expect(full.el._draft).toHaveLength(1);

    document.body.innerHTML = "";
    const device = makeDevice();
    const sensor = device.entities["schedule"].entity_id;
    device._hass.states[sensor].attributes.max_slots = 3;
    const el = await mount(device, "schedule");
    el.openEditor();
    await el.updateComplete;
    expect(
      (el.shadowRoot.querySelector(".editor-footer > button") as any).disabled,
    ).toBe(true);
  });

  it("saves the whole program through the integration service", async () => {
    const { device, el, root } = await open();
    await change(el, root.querySelectorAll('input[type="number"]')[0], "80");
    (root.querySelector(".btn-save") as any).click();
    await el.updateComplete;

    expect(device._hass.callService).toHaveBeenCalledWith(
      "aquamedic",
      "set_schedule",
      {
        entity_id: "sensor.pump_schedule",
        slots: [
          { start: 480, end: 720, mode: "auto", value: 80 },
          { start: 720, end: 735, mode: "feeding", value: 10 },
          { start: 1320, end: 1439, mode: "stop", value: 0 },
        ],
      },
    );
    expect(root.querySelector(".editor-overlay")).toBeNull();
    expect(el._draft).toEqual([]);
  });

  it("does not save without hass", async () => {
    const { el } = await open();
    const call = el._hass.callService;
    el._hass = null;
    el._save();
    expect(call).not.toHaveBeenCalled();
    expect(el._editing).toBe(true);
  });

  it("closes without saving from the cross, cancel or the backdrop", async () => {
    for (const selector of [
      ".editor-header .btn-icon",
      ".editor-actions button",
      ".editor-overlay",
    ]) {
      const { device, el, root } = await open();
      (root.querySelector(selector) as any).click();
      await el.updateComplete;
      expect(root.querySelector(".editor-overlay"), selector).toBeNull();
      expect(device._hass.callService).not.toHaveBeenCalled();
      document.body.innerHTML = "";
    }
  });

  it("stays open on a click inside the panel", async () => {
    const { el, root } = await open();
    (root.querySelector(".editor-panel") as any).click();
    await el.updateComplete;
    expect(root.querySelector(".editor-overlay")).not.toBeNull();
  });
});

describe("AMSchedule editor — SmartDrift", () => {
  it("adds the frequency and tide columns", async () => {
    const { el, root } = await open({ kind: "drift" });
    expect(root.querySelector(".slots").classList.contains("drift")).toBe(true);
    const numbers = root.querySelectorAll('input[type="number"]') as any;
    expect(numbers).toHaveLength(2);
    expect(numbers[1].value).toBe("40");
    const tide: any = root.querySelector('input[type="checkbox"]');
    expect(tide.checked).toBe(true);
    const options = [...root.querySelector("select").options];
    expect(options.map((o: any) => o.value)).toEqual(DRIFT_MODES);

    await change(el, numbers[1], "55");
    await change(el, tide, false);
    expect(el._draft[0]).toMatchObject({ frequency: 55, tide: false });
  });

  it("locks frequency and tide on a slot that makes no wave", async () => {
    const { root } = await open({
      kind: "drift",
      schedule: [{ start: 0, end: 60, mode: "feeding", value: 10 }],
    });
    const numbers = root.querySelectorAll('input[type="number"]') as any;
    expect(numbers[1].disabled).toBe(true);
    // A slot read without frequency shows 0, and no tide
    expect(numbers[1].value).toBe("0");
    const tide: any = root.querySelector('input[type="checkbox"]');
    expect(tide.disabled).toBe(true);
    expect(tide.checked).toBe(false);
  });

  it("sends frequency and tide with each slot", async () => {
    const { device, el } = await open({ kind: "drift" });
    el._save();
    expect(device._hass.callService).toHaveBeenCalledWith(
      "aquamedic",
      "set_schedule",
      {
        entity_id: "sensor.pump_schedule",
        slots: [
          {
            start: 480,
            end: 720,
            mode: "sine_wave",
            value: 60,
            frequency: 40,
            tide: true,
          },
        ],
      },
    );
  });
});

describe("AMSchedule without a device", () => {
  it("reads the timer as off and midnight as the current time", () => {
    const el: any = new AMSchedule();
    el.device = undefined;
    expect(el._timer_on()).toBe(false);
    expect(el._now()).toBe(0);
  });
});
