/**
 * The water parameters of the reeftech-catalog: read from the integration,
 * completing the built-in tables of the parameters card.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../src/base/index";
import {
  CHEMISTRIES,
  DEFAULT_RANGES,
  ReefParametersCard,
  load_catalog,
  reset_catalog,
} from "../src/base/reef_parameters";
import { ReefParametersCardEditor } from "../src/base/reef_parameters_editor";
import {
  apply_parameters_catalog,
  fetch_parameters_catalog,
  ranges_of,
} from "../src/utils/parameters_catalog";

const entry = (
  unit: string,
  min: number,
  low: number,
  high: number,
  max: number,
) => ({
  unit,
  range: { min, low, high, max, optimal: low },
});

describe("ranges_of", () => {
  it("gives the four bounds, in order", () => {
    expect(ranges_of(entry("dkh", 6, 7, 8.5, 14))).toEqual([6, 7, 8.5, 14]);
  });
  it("refuses a missing or disordered band", () => {
    expect(ranges_of(undefined)).toBeNull();
    expect(ranges_of({ range: { min: 1, low: 2, high: 3 } })).toBeNull();
    expect(ranges_of(entry("dkh", 6, 9, 8, 14))).toBeNull();
    expect(
      ranges_of({ range: { min: "1", low: 2, high: 3, max: 4 } }),
    ).toBeNull();
  });
});

describe("apply_parameters_catalog", () => {
  it("completes the tables in place and keeps their order", () => {
    const chemistries: Record<string, any> = {
      kh: { unit: "dKH" },
      ca: { unit: "ppm" },
    };
    const ranges: Record<string, number[]> = { kh: [1, 2, 3, 4] };
    const view = {
      items: {
        zn: entry("ppb", 0, 1, 5, 9),
        kh: entry("dkh", 6, 7, 8.5, 14),
        orp: { ...entry("mv", 200, 300, 450, 500), device_class: "voltage" },
        weird: entry("furlong", 0, 1, 2, 3),
        bad: { unit: "ppm" },
      },
    };
    expect(apply_parameters_catalog(view, chemistries, ranges)).toBe(4);
    expect(Object.keys(chemistries)).toEqual(["kh", "ca", "zn", "orp", "bad"]);
    expect(chemistries.kh).toEqual({ unit: "dKH" });
    expect(chemistries.orp).toEqual({ unit: "mV", device_class: "voltage" });
    expect(ranges.kh).toEqual([6, 7, 8.5, 14]);
    expect(ranges.zn).toEqual([0, 1, 5, 9]);
    // No usable band: the built-in one stays
    expect("bad" in ranges).toBe(false);
  });
  it("ignores a view without items", () => {
    for (const view of [null, {}, { items: 3 }])
      expect(apply_parameters_catalog(view, {}, {})).toBe(0);
  });
});

describe("fetch_parameters_catalog", () => {
  it("asks the redsea integration for the parameters section", async () => {
    const callWS = vi.fn().mockResolvedValue({ data: { items: {} } });
    expect(await fetch_parameters_catalog({ callWS })).toEqual({ items: {} });
    expect(callWS).toHaveBeenCalledWith({
      type: "redsea/catalog",
      section: "parameters",
    });
  });
  it("gives null without an integration", async () => {
    expect(await fetch_parameters_catalog(null)).toBeNull();
    const callWS = vi.fn().mockRejectedValue(new Error("unknown command"));
    expect(await fetch_parameters_catalog({ callWS })).toBeNull();
    expect(
      await fetch_parameters_catalog({ callWS: async () => ({}) }),
    ).toBeNull();
  });
});

describe("the cards read the catalog once", () => {
  const original_ro = (globalThis as any).ResizeObserver;
  const saved_chemistries = { ...CHEMISTRIES };
  const saved_ranges = { ...DEFAULT_RANGES };
  beforeEach(() => {
    (globalThis as any).ResizeObserver = class {
      observe = vi.fn();
      disconnect = vi.fn();
    };
    reset_catalog();
  });
  afterEach(() => {
    (globalThis as any).ResizeObserver = original_ro;
    for (const k of Object.keys(CHEMISTRIES)) delete CHEMISTRIES[k];
    Object.assign(CHEMISTRIES, saved_chemistries);
    for (const k of Object.keys(DEFAULT_RANGES)) delete DEFAULT_RANGES[k];
    Object.assign(DEFAULT_RANGES, saved_ranges);
    reset_catalog();
  });

  const serving = () =>
    vi.fn().mockResolvedValue({
      data: {
        items: {
          kh: entry("dkh", 6, 7.2, 8.8, 14),
          zn: entry("ppb", 0, 1, 5, 9),
        },
      },
    });

  it("overrides the built-in zones and adds a parameter", async () => {
    const callWS = serving();
    expect(await load_catalog({ callWS })).toBe(true);
    // Asked once, whatever the number of callers
    expect(await load_catalog({ callWS })).toBe(true);
    expect(callWS).toHaveBeenCalledTimes(1);
    expect(DEFAULT_RANGES.kh).toEqual([6, 7.2, 8.8, 14]);
    expect(CHEMISTRIES.zn).toEqual({ unit: "ppb" });
  });

  it("asks again after a failure", async () => {
    expect(await load_catalog({})).toBe(false);
    const callWS = serving();
    expect(await load_catalog({ callWS })).toBe(true);
    expect(callWS).toHaveBeenCalledTimes(1);
  });

  it("the cards ask when they get the hass", async () => {
    const callWS = serving();
    const card = new ReefParametersCard();
    card.setConfig({ parameters: [] });
    card.hass = { callWS, states: {}, entities: {} };
    card.hass = { callWS, states: {}, entities: {} };
    await vi.waitFor(() =>
      expect(DEFAULT_RANGES.kh).toEqual([6, 7.2, 8.8, 14]),
    );
    expect(callWS).toHaveBeenCalledTimes(1);
    reset_catalog();
    const editor = new ReefParametersCardEditor();
    editor.setConfig({ parameters: [] });
    editor.hass = { callWS, states: {}, entities: {} };
    await vi.waitFor(() => expect(callWS).toHaveBeenCalledTimes(2));
  });
});
