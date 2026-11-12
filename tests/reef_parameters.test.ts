/**
 * Follow-up of the water parameters: the parameters found or configured, their
 * zones, their charts and the editing of the results of a ReefDose head.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../src/base/index";
import {
  DEFAULT_RANGES,
  ReefParametersCard,
  discover_parameters,
  parameter_ranges,
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

const KH = "sensor.doser_head_1_last_test_result";
const CA = "sensor.doser_head_2_last_test_result";
const FE = "sensor.iron_test";

function makeHass(): any {
  return {
    language: "en",
    states: {
      [KH]: {
        state: "8.2",
        attributes: {
          unit_of_measurement: "dKH",
          measurements: [
            { at: new Date().toISOString(), parameter: "kh", value: 8.2 },
          ],
        },
      },
      [CA]: {
        state: "380",
        attributes: { unit_of_measurement: "ppm", measurements: [] },
      },
      [FE]: {
        state: "0.1",
        attributes: { unit_of_measurement: "ppm", ranges: [0, 1, 2, 3] },
      },
    },
    entities: {
      [KH]: {
        platform: "redsea",
        translation_key: "regulation_last_measurement",
        device_id: "head1",
      },
      [CA]: {
        platform: "redsea",
        translation_key: "regulation_last_measurement",
      },
      [FE]: { platform: "template" },
      "sensor.other": { platform: "redsea", translation_key: "x" },
    },
    callWS: vi.fn().mockResolvedValue({}),
  };
}

describe("discover_parameters", () => {
  it("finds the regulated heads and their parameter", () => {
    expect(discover_parameters(makeHass())).toEqual([
      { entity: KH, parameter: "kh" },
      { entity: CA },
    ]);
    expect(discover_parameters(null)).toEqual([]);
    // A sensor of an older integration, without its results
    const hass = makeHass();
    delete hass.states[CA].attributes.measurements;
    expect(discover_parameters(hass)[1]).toEqual({ entity: CA });
  });
});

describe("parameter_ranges", () => {
  it("prefers the entity's ranges, then the configured, then the usual", () => {
    const hass = makeHass();
    expect(parameter_ranges(hass, { entity: FE, parameter: "fe" })).toEqual([
      0, 1, 2, 3,
    ]);
    expect(
      parameter_ranges(hass, {
        entity: KH,
        parameter: "kh",
        ranges: [1, 2, 3, 4],
      }),
    ).toEqual([1, 2, 3, 4]);
    expect(parameter_ranges(hass, { entity: KH, parameter: "kh" })).toEqual(
      DEFAULT_RANGES.kh,
    );
    expect(parameter_ranges(hass, { entity: KH })).toBeNull();
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
  it("draws the regulated heads by default", async () => {
    const card = await makeCard({});
    const params = card.shadowRoot!.querySelectorAll(".parameter");
    expect(params).toHaveLength(2);
    expect(params[0]!.querySelector(".name")!.textContent).toBe("KH");
    expect(params[0]!.querySelector(".value")!.className).toContain("desired");
    // The CA head has no result yet: its sensor's name
    expect(card.getCardSize()).toBe(7);
    // Results kept by the integration: drawn from them, editable
    const chart: any = params[0]!.querySelector("history-chart");
    expect(chart.conf.points_attribute).toBe("measurements");
    expect(chart.conf.zones).toEqual(DEFAULT_RANGES.kh);
    expect(chart.conf.hours).toBe(90 * 24);
    expect(params[0]!.querySelector("button")).toBeTruthy();
    card.remove();
  });

  it("draws the configured parameters, any entity", async () => {
    const hass = makeHass();
    const card = await makeCard(
      {
        title: "Tests",
        days: 30,
        parameters: [
          { parameter: "fe", entity: FE, name: "Iron" },
          { parameter: "zz", entity: KH },
          { entity: FE },
          { entity: "sensor.gone" },
          null,
          { parameter: "kh" },
        ],
      },
      hass,
    );
    expect(card.shadowRoot!.querySelector("h1")!.textContent).toBe("Tests");
    const params = card.shadowRoot!.querySelectorAll(".parameter");
    expect(params).toHaveLength(4);
    expect(params[0]!.querySelector(".name")!.textContent).toBe("Iron");
    // From the recorder, not editable
    const chart: any = params[0]!.querySelector("history-chart");
    expect(chart.conf.points_attribute).toBeUndefined();
    expect(chart.conf.hours).toBe(30 * 24);
    expect(params[0]!.querySelector("button")).toBeNull();
    expect(params[1]!.querySelector(".name")!.textContent).toBe("ZZ");
    expect(params[2]!.querySelector(".name")!.textContent).toBe(FE);
    // Gone: no value, no chart
    expect(params[3]!.querySelector(".value")!.textContent).toContain("–");
    expect(params[3]!.querySelector("history-chart")).toBeNull();
    expect(params[3]!.querySelector(".name")!.textContent).toBe("sensor.gone");

    // The charts are built once and follow hass
    const next = makeHass();
    card.hass = next;
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector("history-chart")).toBe(chart);
    expect(chart.hass).toBe(next);
    expect(card.hass).toBe(next);
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

  it("offers the regulated heads as its first configuration", () => {
    expect(ReefParametersCard.getStubConfig(makeHass())).toEqual({
      parameters: discover_parameters(makeHass()),
    });
  });

  it("opens the results of a head to edit them", async () => {
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
    expect(editor.entity_id).toBe(KH);
    // Opened again while open: kept
    card.edit(KH);
    await card.updateComplete;
    expect(proto.showModal).toHaveBeenCalledTimes(1);
    (dialog.querySelector("header button") as HTMLElement).click();
    await card.updateComplete;
    expect(card._editing).toBe("");
    expect(card.shadowRoot!.querySelector("dialog")).toBeNull();

    // Without modal support
    proto.showModal = undefined;
    proto.close = undefined;
    card.edit(KH);
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
