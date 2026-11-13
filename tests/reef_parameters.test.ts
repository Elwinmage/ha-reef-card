/**
 * Water parameters followed by chemistry: the chemistries found or
 * configured, the entities compatible with each, their zones and charts, and
 * recording a test from the card.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../src/base/index";
import {
  DEFAULT_RANGES,
  ReefParametersCard,
  auto_follow,
  compatible_entities,
  gauge_scale,
  normalise,
  parameter_ranges,
  scale_pct,
  trend,
} from "../src/base/reef_parameters";

const original_ro = (globalThis as any).ResizeObserver;
beforeEach(() => {
  (globalThis as any).ResizeObserver = class {
    observe = vi.fn();
    disconnect = vi.fn();
  };
});
afterEach(() => {
  (globalThis as any).ResizeObserver = original_ro;
});

// A reeftank chemistry sensor (KH), a ReefDose head regulating Ca, and two
// bare probes (a temperature one, an iron one).
const KH = "sensor.reefer_425_kh";
const CA = "sensor.doser_head_2_last_test_result";
const TEMP = "sensor.tank_temp";
const FE = "sensor.iron_test";

function makeHass(): any {
  const now = new Date().toISOString();
  return {
    language: "en",
    states: {
      [KH]: {
        state: "8.2",
        attributes: {
          unit_of_measurement: "dKH",
          reef_parameter: "kh",
          aquarium: "a1b2",
          measurements: [{ at: now, parameter: "kh", value: 8.2 }],
        },
      },
      [CA]: {
        state: "430",
        attributes: {
          unit_of_measurement: "ppm",
          measurements: [{ at: now, parameter: "ca", value: 430 }],
        },
      },
      [TEMP]: {
        state: "25.4",
        attributes: { unit_of_measurement: "°C", device_class: "temperature" },
      },
      [FE]: {
        state: "5",
        attributes: { unit_of_measurement: "ppb", ranges: [0, 1, 2, 3] },
      },
    },
    entities: {
      [KH]: { platform: "reeftank" },
      [CA]: {
        platform: "redsea",
        translation_key: "regulation_last_measurement",
      },
      [TEMP]: { platform: "template" },
      [FE]: { platform: "template" },
      "sensor.other": { platform: "redsea", translation_key: "x" },
    },
    callWS: vi.fn().mockResolvedValue({}),
  };
}

describe("auto_follow", () => {
  it("binds each backed chemistry to its canonical source", () => {
    expect(auto_follow(makeHass())).toEqual([
      { chemistry: "ca", source: CA },
      { chemistry: "kh", source: KH },
    ]);
    expect(auto_follow(null)).toEqual([]);
  });

  it("prefers the reeftank sensor over a head on the same chemistry", () => {
    const hass = makeHass();
    // A redsea head also regulating KH must not add a second KH entry
    hass.states["sensor.kh_head"] = {
      state: "8.0",
      attributes: { measurements: [{ at: "x", parameter: "kh", value: 8 }] },
    };
    hass.entities["sensor.kh_head"] = {
      platform: "redsea",
      translation_key: "regulation_last_measurement",
    };
    expect(auto_follow(hass)).toEqual([
      { chemistry: "ca", source: CA },
      { chemistry: "kh", source: KH },
    ]);
  });

  it("skips a head that has not been tested yet", () => {
    const hass = makeHass();
    hass.states[CA].attributes.measurements = [];
    expect(auto_follow(hass)).toEqual([{ chemistry: "kh", source: KH }]);
  });
});

describe("compatible_entities", () => {
  it("offers the exact source, then probes by device_class or unit", () => {
    const hass = makeHass();
    expect(compatible_entities(hass, "kh")).toEqual([KH]);
    expect(compatible_entities(hass, "ca")).toEqual([CA]);
    // Temperature is matched by its device_class
    expect(compatible_entities(hass, "temperature")).toEqual([TEMP]);
    // Iron is matched by its unit (ppb)
    expect(compatible_entities(hass, "fe")).toEqual([FE]);
    // A chemistry nothing matches
    expect(compatible_entities(hass, "mg")).toEqual([]);
    expect(compatible_entities(null, "kh")).toEqual([]);
  });
});

describe("normalise", () => {
  it("reads both the new and the legacy shapes", () => {
    expect(normalise({ chemistry: "kh", source: KH })).toEqual({
      chemistry: "kh",
      source: KH,
    });
    // Legacy { parameter, entity }
    expect(normalise({ parameter: "fe", entity: FE, name: "Iron" })).toEqual({
      chemistry: "fe",
      source: FE,
      name: "Iron",
    });
    expect(
      normalise({ chemistry: "kh", source: KH, ranges: [1, 2, 3, 4] }),
    ).toEqual({ chemistry: "kh", source: KH, ranges: [1, 2, 3, 4] });
    expect(normalise(null)).toBeNull();
    expect(normalise({ chemistry: "kh" })).toBeNull();
    expect(normalise({ source: KH })).toBeNull();
  });
});

describe("parameter_ranges", () => {
  it("prefers the source's ranges, then the configured, then the usual", () => {
    const hass = makeHass();
    expect(parameter_ranges(hass, { chemistry: "fe", source: FE })).toEqual([
      0, 1, 2, 3,
    ]);
    expect(
      parameter_ranges(hass, {
        chemistry: "kh",
        source: KH,
        ranges: [1, 2, 3, 4],
      }),
    ).toEqual([1, 2, 3, 4]);
    expect(parameter_ranges(hass, { chemistry: "kh", source: KH })).toEqual(
      DEFAULT_RANGES.kh,
    );
    expect(
      parameter_ranges(hass, { chemistry: "zz", source: TEMP }),
    ).toBeNull();
  });
});

describe("gauge helpers", () => {
  it("gauge_scale pads the acceptable band and keeps the value in view", () => {
    expect(gauge_scale([400, 415, 445, 460])).toEqual([385, 475]);
    // A value past an end widens the scale
    expect(gauge_scale([400, 415, 445, 460], 380)).toEqual([380, 475]);
    expect(gauge_scale([400, 415, 445, 460], 500)).toEqual([385, 500]);
    // A zero-width band still yields a usable scale
    const [lo, hi] = gauge_scale([8, 8, 8, 8]);
    expect(hi).toBeGreaterThan(lo);
  });

  it("scale_pct places and clamps a value", () => {
    expect(scale_pct(5, 0, 10)).toBe(50);
    expect(scale_pct(-1, 0, 10)).toBe(0);
    expect(scale_pct(11, 0, 10)).toBe(100);
    expect(scale_pct(5, 10, 10)).toBe(0);
  });

  it("trend reads the direction with a dead-band", () => {
    expect(trend([])).toBeNull();
    expect(trend([5])).toBeNull();
    expect(trend([5, 6, 7, 8, 9, 10])).toBe("up");
    expect(trend([10, 9, 8, 7, 6, 5])).toBe("down");
    expect(trend([8.0, 8.01, 7.99, 8.0, 8.0, 8.01])).toBe("flat");
    // NaN samples are ignored
    expect(trend([NaN, NaN])).toBeNull();
  });
});

describe("ReefParametersCard.zone", () => {
  it("tells the zone of a value", () => {
    const r = [6.5, 7.5, 9.5, 12];
    expect(ReefParametersCard.zone(8, r)).toBe("desired");
    expect(ReefParametersCard.zone(7, r)).toBe("acceptable");
    expect(ReefParametersCard.zone(10, r)).toBe("acceptable");
    expect(ReefParametersCard.zone(5, r)).toBe("danger");
    expect(ReefParametersCard.zone(13, r)).toBe("danger");
    expect(ReefParametersCard.zone(NaN, r)).toBe("");
    expect(ReefParametersCard.zone(8, null)).toBe("");
  });
});

async function makeCard(config: any, hass: any = makeHass()) {
  const card = document.createElement(
    "reef-parameters-card",
  ) as ReefParametersCard;
  card.setConfig(config);
  card.hass = hass;
  document.body.appendChild(card);
  await card.updateComplete;
  return card;
}

describe("reef-parameters-card", () => {
  it("draws the backed chemistries by default", async () => {
    const card = await makeCard({});
    const params = card.shadowRoot!.querySelectorAll(".parameter");
    expect(params).toHaveLength(2);
    // Sorted by chemistry: ca then kh
    expect(params[1]!.querySelector(".name")!.textContent).toBe("KH");
    expect(params[1]!.querySelector(".value")!.className).toContain("desired");
    expect(card.getCardSize()).toBe(3);
    // A zone gauge is drawn with a marker, and a target label
    expect(params[1]!.querySelector(".gauge .marker")).toBeTruthy();
    expect(params[1]!.querySelector(".scale")!.textContent).toContain("target");
    // A reeftank sensor keeps its results: the sparkline reads them, editable
    const chart: any = params[1]!.querySelector("history-chart");
    expect(chart.conf.points_attribute).toBe("measurements");
    expect(chart.conf.hours).toBe(90 * 24);
    expect(params[1]!.querySelector("button")).toBeTruthy();
    card.remove();
  });

  it("draws the configured chemistries, new and legacy shapes", async () => {
    const hass = makeHass();
    const card = await makeCard(
      {
        title: "Tests",
        days: 30,
        parameters: [
          { chemistry: "temperature", source: TEMP, name: "Temp" },
          { parameter: "fe", entity: FE },
          // An unknown chemistry on a source with no ranges: a chart drawn
          // without zones
          { chemistry: "zz", source: TEMP },
          { chemistry: "gone", source: "sensor.gone" },
          null,
          { chemistry: "kh" },
        ],
      },
      hass,
    );
    expect(card.shadowRoot!.querySelector("h1")!.textContent).toBe("Tests");
    const params = card.shadowRoot!.querySelectorAll(".parameter");
    expect(params).toHaveLength(4);
    expect(params[0]!.querySelector(".name")!.textContent).toBe("Temp");
    // A probe: from the recorder, read-only
    const chart: any = params[0]!.querySelector("history-chart");
    expect(chart.conf.points_attribute).toBeUndefined();
    expect(chart.conf.hours).toBe(30 * 24);
    expect(params[0]!.querySelector("button")).toBeNull();
    expect(params[1]!.querySelector(".name")!.textContent).toBe("Fe");
    // Unknown chemistry: a chart with no zones
    const zz: any = params[2]!.querySelector("history-chart");
    expect(zz.conf.zones).toBeUndefined();
    // A chemistry whose source is gone: no value, no chart
    expect(params[3]!.querySelector(".value")!.textContent).toContain("–");
    expect(params[3]!.querySelector("history-chart")).toBeNull();

    // The charts are built once and follow hass
    const next = makeHass();
    card.hass = next;
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector("history-chart")).toBe(chart);
    expect(chart.hass).toBe(next);
    expect(card.hass).toBe(next);
    card.remove();
  });

  it("labels each tile with its source and shows a trend once data loads", async () => {
    const card = await makeCard({});
    const chips = Array.from(card.shadowRoot!.querySelectorAll(".src")).map(
      (c: any) => c.textContent.trim(),
    );
    expect(chips).toContain("reeftank");
    expect(chips).toContain("redsea");
    // No history yet: no arrow, and an empty (but present) sparkline
    expect(card.shadowRoot!.querySelector(".trend")).toBeNull();
    expect(card.shadowRoot!.querySelector(".spark.empty")).toBeTruthy();
    expect(card.shadowRoot!.querySelector(".spark polyline")).toBeNull();
    // Feed the sparklines some rising points and re-render
    for (const chart of (card as any)._charts.values())
      chart.series = [{ points: [{ v: 7 }, { v: 7.5 }, { v: 8 }, { v: 8.4 }] }];
    card.requestUpdate();
    await card.updateComplete;
    const arrow = card.shadowRoot!.querySelector(".trend")!;
    expect(arrow.textContent!.trim()).toBe("↑");
    // The trend is coloured like its value (KH 8.2 is desired)
    expect(arrow.className).toContain("desired");
    // A clean sparkline line is now drawn
    expect(card.shadowRoot!.querySelector(".spark polyline")).toBeTruthy();
    // Its min/max are labelled on the ordinate, so the amplitude is readable
    const scale = card.shadowRoot!.querySelector(".spark-scale")!;
    const bounds = Array.from(scale.querySelectorAll("span")).map((s: any) =>
      s.textContent.trim(),
    );
    expect(bounds).toEqual(["8.4", "7"]);
    card.remove();
  });

  it("opens the sensor more-info on a sparkline click", async () => {
    const card = await makeCard({});
    for (const chart of (card as any)._charts.values())
      chart.series = [{ points: [{ v: 7 }, { v: 8 }] }];
    card.requestUpdate();
    await card.updateComplete;
    let opened = "";
    card.addEventListener("hass-more-info", (e: any) => {
      opened = e.detail.entityId;
    });
    card
      .shadowRoot!.querySelector(".spark")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(opened).toBeTruthy();
    card.remove();
  });

  it("rounds sub-unit scales to two decimals (phosphate)", async () => {
    const hass = makeHass();
    hass.states["sensor.po4"] = {
      state: "0.05",
      attributes: { unit_of_measurement: "ppm" },
    };
    hass.entities["sensor.po4"] = { platform: "template" };
    const card = await makeCard(
      { parameters: [{ chemistry: "po4", source: "sensor.po4" }] },
      hass,
    );
    // Sub-unit bounds are shown with two decimals
    expect(card.shadowRoot!.querySelector(".scale")!.textContent).toMatch(
      /\d\.\d{2}\b/,
    );
    card.remove();
  });

  it("tells when nothing is followed", async () => {
    const hass = makeHass();
    hass.entities = {};
    const card = await makeCard({}, hass);
    expect(card.shadowRoot!.querySelector(".empty")).toBeTruthy();
    expect(card.shadowRoot!.querySelector("h1")!.textContent).toBe(
      "Water parameters",
    );
    card.remove();
  });

  it("refuses parameters that are not a list", () => {
    const card = new ReefParametersCard();
    card.setConfig(undefined as any);
    expect(() => card.setConfig({ parameters: "kh" } as any)).toThrow();
  });

  it("offers the backed chemistries as its first configuration", () => {
    expect(ReefParametersCard.getStubConfig(makeHass())).toEqual({
      parameters: auto_follow(makeHass()),
    });
  });

  it("opens the results of a source to record a test", async () => {
    const card = await makeCard({});
    const button = card.shadowRoot!.querySelector(
      ".parameter button",
    ) as HTMLElement;
    const proto: any = HTMLDialogElement.prototype;
    const show = proto.showModal;
    const close = proto.close;
    proto.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    proto.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    });
    button.click();
    await card.updateComplete;
    await card.updateComplete;
    const dialog: any = card.shadowRoot!.querySelector("dialog");
    expect(dialog.hasAttribute("open")).toBe(true);
    const editor: any = dialog.querySelector("reef-measurement-history");
    // The first tile (ca) is the head; its source opens
    expect(editor.entity_id).toBe(CA);
    // Opened again while open: kept
    card.edit(CA);
    await card.updateComplete;
    expect(proto.showModal).toHaveBeenCalledTimes(1);
    (dialog.querySelector("header button") as HTMLElement).click();
    await card.updateComplete;
    expect(card._editing).toBe("");
    expect(card.shadowRoot!.querySelector("dialog")).toBeNull();

    // Without modal support
    proto.showModal = undefined;
    proto.close = undefined;
    card.edit(CA);
    await card.updateComplete;
    await card.updateComplete;
    const bare: any = card.shadowRoot!.querySelector("dialog");
    expect(bare.hasAttribute("open")).toBe(true);
    card.close();
    expect(bare.hasAttribute("open")).toBe(false);
    card.close();
    proto.showModal = show;
    proto.close = close;
    card.remove();
  });
});
