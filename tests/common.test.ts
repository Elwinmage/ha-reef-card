/**
 * Unit tests — src/utils/common.ts
 * Imports real functions/class to generate actual coverage.
 * Targets uncovered lines:
 *   61-64  (device_compare: equality branch returning 0)
 *   178    (rgbToHex: return orig when no match)
 *   215    (timeToString — called via create_hour)
 *   253-311 (create_select, create_hour)
 */

import { describe, it, expect, vi } from "vitest";
import {
  hexToRgb,
  rgbToHex,
  toTime,
  stringToTime,
  create_select,
  create_hour,
  default as DeviceList,
} from "../src/utils/common";

// ── hexToRgb ──────────────────────────────────────────────────────────────────

describe("hexToRgb()", () => {
  it("converts lowercase hex", () =>
    expect(hexToRgb("#a4f3c6")).toBe("164,243,198"));
  it("converts uppercase hex", () =>
    expect(hexToRgb("#A4F3C6")).toBe("164,243,198"));
  it("converts black", () => expect(hexToRgb("#000000")).toBe("0,0,0"));
  it("converts white", () => expect(hexToRgb("#ffffff")).toBe("255,255,255"));
  it("works without leading #", () =>
    expect(hexToRgb("A4F3C6")).toBe("164,243,198"));
  it("returns null for invalid input", () => {
    expect(hexToRgb("not-colour")).toBeNull();
    expect(hexToRgb("")).toBeNull();
  });
});

// ── rgbToHex ──────────────────────────────────────────────────────────────────

describe("rgbToHex()", () => {
  it("converts rgb() string", () =>
    expect(rgbToHex("rgb(164, 243, 198)").toLowerCase()).toBe("#a4f3c6"));
  it("converts rgba() string (alpha ignored)", () =>
    expect(rgbToHex("rgba(164, 243, 198, 0.5)").toLowerCase()).toBe("#a4f3c6"));
  it("returns original string when already hex (line 178 — else branch)", () => {
    // When no rgb/rgba match, the function returns orig
    expect(rgbToHex("#A4F3C6")).toBe("#A4F3C6");
    expect(rgbToHex("some-invalid-color")).toBe("some-invalid-color");
  });
  it("converts black rgb(0,0,0)", () =>
    expect(rgbToHex("rgb(0,0,0)")).toBe("#000000"));
  it("converts white rgb(255,255,255)", () =>
    expect(rgbToHex("rgb(255,255,255)")).toBe("#ffffff"));
});

// ── toTime ────────────────────────────────────────────────────────────────────

describe("toTime()", () => {
  it("0s → 00:00:00", () => expect(toTime(0)).toBe("00:00:00"));
  it("3661s → 01:01:01", () => expect(toTime(3661)).toBe("01:01:01"));
  it("86399s → 23:59:59", () => expect(toTime(86399)).toBe("23:59:59"));
  it("pads single-digit components", () =>
    expect(toTime(3723)).toBe("01:02:03"));
});

// ── stringToTime ──────────────────────────────────────────────────────────────

describe("stringToTime()", () => {
  it("'00:00' → 0", () => expect(stringToTime("00:00")).toBe(0));
  it("'01:30' → 90", () => expect(stringToTime("01:30")).toBe(90));
  it("'23:59' → 1439", () => expect(stringToTime("23:59")).toBe(1439));
  it("returns 0 for malformed input", () => {
    expect(stringToTime("invalid")).toBe(0);
    expect(stringToTime("")).toBe(0);
  });
});

// ── create_select (lines 245-290) ─────────────────────────────────────────────

describe("create_select() (lines 253-291)", () => {
  it("returns a div containing a label and select element", () => {
    const div = create_select("my_id", ["opt1", "opt2"]);
    expect(div.tagName).toBe("DIV");
    expect(div.querySelector("select")).toBeTruthy();
    expect(div.querySelector("label")).toBeTruthy();
  });

  it("select element has correct id with default suffix", () => {
    const div = create_select("my_id", ["opt1"]);
    expect(div.querySelector("select")?.id).toBe("my_id_1");
  });

  it("select element has correct id with custom suffix", () => {
    const div = create_select("my_id", ["opt1"], null, true, "", 3);
    expect(div.querySelector("select")?.id).toBe("my_id_3");
  });

  it("creates one option per item", () => {
    const div = create_select("id", ["a", "b", "c"]);
    const opts = div.querySelectorAll("option");
    expect(opts.length).toBe(3);
  });

  it("marks selected option when selected param is provided", () => {
    const div = create_select("id", ["opt1", "opt2"], "opt2");
    const opts = div.querySelectorAll("option");
    expect((opts[1] as HTMLOptionElement).selected).toBe(true);
  });

  it("appends suffix to option text when provided", () => {
    const div = create_select("id", ["opt1"], null, false, " mL");
    const opt = div.querySelector("option");
    expect(opt?.innerHTML).toContain("mL");
  });

  it("uses raw option value when translation=false", () => {
    const div = create_select("id", ["raw_opt"], null, false);
    const opt = div.querySelector("option");
    expect(opt?.innerHTML).toContain("raw_opt");
  });
});

// ── create_hour (lines 292-311 including timeToString at line 215) ────────────

describe("create_hour() (lines 292-311)", () => {
  it("returns a div containing label and time input", () => {
    const div = create_hour("my_time");
    expect(div.tagName).toBe("DIV");
    const input = div.querySelector("input[type='time']");
    expect(input).toBeTruthy();
  });

  it("time input has correct id with default suffix", () => {
    const div = create_hour("my_time");
    expect(div.querySelector("input")?.id).toBe("my_time_1");
  });

  it("time input has correct id with custom suffix", () => {
    const div = create_hour("my_time", 0, 5);
    expect(div.querySelector("input")?.id).toBe("my_time_5");
  });

  it("defaults to 00:00 for hour=0 (timeToString, line 215)", () => {
    const div = create_hour("my_time", 0);
    expect(div.querySelector("input")?.value).toBe("00:00");
  });

  it("converts 90 minutes to 01:30 (timeToString covers line 215)", () => {
    const div = create_hour("my_time", 90);
    expect(div.querySelector("input")?.value).toBe("01:30");
  });

  it("converts 1439 minutes to 23:59", () => {
    const div = create_hour("my_time", 1439);
    expect(div.querySelector("input")?.value).toBe("23:59");
  });

  it("converts 60 minutes to 01:00", () => {
    const div = create_hour("my_time", 60);
    expect(div.querySelector("input")?.value).toBe("01:00");
  });
});

// ── DeviceList (lines 32-135, 61-64) ─────────────────────────────────────────

function makeHass(devices: Record<string, any> = {}): any {
  return { states: {}, callService: vi.fn(), devices };
}

describe("DeviceList — device_compare equal names (line 61-64)", () => {
  it("sorts alphabetically (A < B → -1, B > A → 1, equal → 0)", () => {
    const hass = makeHass({
      e1: {
        identifiers: [["redsea", "d1"]],
        primary_config_entry: "e1",
        name: "Alpha",
        model: "RSLED",
      },
      e2: {
        identifiers: [["redsea", "d2"]],
        primary_config_entry: "e2",
        name: "Alpha",
        model: "RSLED",
      },
      e3: {
        identifiers: [["redsea", "d3"]],
        primary_config_entry: "e3",
        name: "Bravo",
        model: "RSLED",
      },
    });
    const dl = new DeviceList(hass);
    const names = dl.main_devices.map((d: any) => d.text);
    // Sorted: Alpha, Alpha, Bravo — equal names both appear, order stable
    expect(names[names.length - 1]).toBe("Bravo");
  });
});

describe("DeviceList — filters", () => {
  it("only includes redsea devices", () => {
    const hass = makeHass({
      e1: {
        identifiers: [["zigbee", "0x123"]],
        primary_config_entry: "e1",
        name: "Zigbee",
        model: "X",
      },
    });
    expect(new DeviceList(hass).main_devices).toHaveLength(0);
  });

  it("excludes _head_ sub-devices", () => {
    const hass = makeHass({
      e1: {
        identifiers: [["redsea", "rsdose_head_1"]],
        primary_config_entry: "e1",
        name: "Head 1",
        model: "RSDOSE",
      },
    });
    expect(new DeviceList(hass).main_devices).toHaveLength(0);
  });

  it("excludes ReefBeat cloud devices", () => {
    const hass = makeHass({
      e1: {
        identifiers: [["redsea", "cloud"]],
        primary_config_entry: "e1",
        name: "Cloud",
        model: "ReefBeat",
      },
    });
    expect(new DeviceList(hass).main_devices).toHaveLength(0);
  });

  it("get_by_name returns correct device", () => {
    const hass = makeHass({
      e1: {
        identifiers: [["redsea", "d1"]],
        primary_config_entry: "e1",
        name: "My Reef",
        model: "RSLED",
      },
    });
    const dl = new DeviceList(hass);
    expect(dl.get_by_name("My Reef")).toBeDefined();
    expect(dl.get_by_name("Unknown")).toBeUndefined();
  });

  it("groups sub-elements under primary_config_entry", () => {
    const hass = makeHass({
      e1: {
        identifiers: [["redsea", "main"]],
        primary_config_entry: "e1",
        name: "Main",
        model: "RSDOSE",
      },
      e2: {
        identifiers: [["redsea", "head_1"]],
        primary_config_entry: "e1",
        name: "Head 1",
        model: "RSDOSE",
      },
    });
    const dl = new DeviceList(hass);
    expect(dl.devices["e1"]?.elements).toHaveLength(2);
  });
});
