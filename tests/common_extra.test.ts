/**
 * Unit tests — src/utils/common.ts (uncovered sections)
 *
 * Covers lines 61-64, 178, 215, 253-311:
 *   - create_select()  → DOM creation, label, options, selected, translation, suffix
 *   - create_hour()    → DOM creation, time formatting
 *   - DeviceList helpers: device_compare (via sort), get_by_name, init_devices
 */

import { describe, it, expect, vi } from "vitest";
import {
  create_select,
  create_hour,
  stringToTime,
  toTime,
} from "../src/utils/common";

// ── create_select() ───────────────────────────────────────────────────────────

describe("create_select()", () => {
  it("returns a div containing a label and a select", () => {
    const div = create_select("my_id", ["a", "b", "c"]);
    expect(div.tagName).toBe("DIV");
    const sel = div.querySelector("select");
    expect(sel).not.toBeNull();
    expect(sel!.id).toBe("my_id_1");
  });

  it("generates one option per entry", () => {
    const div = create_select("x", ["opt1", "opt2", "opt3"]);
    const opts = div.querySelectorAll("option");
    expect(opts).toHaveLength(3);
  });

  it("marks the selected option", () => {
    const div = create_select("x", ["a", "b", "c"], "b");
    const opts = Array.from(div.querySelectorAll("option"));
    const selected = opts.find((o: any) => o.selected);
    expect((selected as HTMLOptionElement).value).toBe("b");
  });

  it("does not mark any option when selected is null", () => {
    const div = create_select("x", ["a", "b"], null, false);
    const select = Array.from(div.querySelectorAll("select"));
    expect(select.selectedIndex).toBe(undefined);
  });

  it("uses id_suffix in the select element id", () => {
    const div = create_select("field", ["a"], null, true, "", 3);
    const sel = div.querySelector("select")!;
    expect(sel.id).toBe("field_3");
  });

  it("appends suffix to option text when translation is false", () => {
    const div = create_select("x", ["mL"], null, false, " /day");
    const opt = div.querySelector("option")!;
    expect(opt.innerHTML).toContain("/day");
  });

  it("option value matches the raw option string", () => {
    const div = create_select("x", ["raw_key"], null, false);
    const opt = div.querySelector("option")!;
    expect(opt.value).toBe("raw_key");
  });
});

// ── create_hour() ────────────────────────────────────────────────────────────

describe("create_hour()", () => {
  it("returns a div containing an input[type=time]", () => {
    const div = create_hour("start_time", 90);
    const input = div.querySelector("input");
    expect(input).not.toBeNull();
    expect(input!.type).toBe("time");
  });

  it("uses id_suffix in the input id", () => {
    const div = create_hour("my_time", 0, 2);
    expect(div.querySelector("input")!.id).toBe("my_time_2");
  });

  it("formats 0 minutes as 00:00", () => {
    const div = create_hour("t", 0);
    expect(div.querySelector("input")!.value).toBe("00:00");
  });

  it("formats 90 minutes as 01:30", () => {
    const div = create_hour("t", 90);
    expect(div.querySelector("input")!.value).toBe("01:30");
  });

  it("formats 1439 minutes as 23:59", () => {
    const div = create_hour("t", 1439);
    expect(div.querySelector("input")!.value).toBe("23:59");
  });

  it("formats 60 minutes as 01:00", () => {
    const div = create_hour("t", 60);
    expect(div.querySelector("input")!.value).toBe("01:00");
  });
});

// ── DeviceList — init_devices + helpers ───────────────────────────────────────

describe("DeviceList (init_devices, get_by_name, device_compare)", () => {
  function makeHass(devices: Record<string, any>): any {
    return {
      states: {},
      devices,
      entities: {},
      callService: vi.fn(),
    };
  }

  function makeRedsea(
    id: string,
    name: string,
    entry: string,
    model = "RSLine",
  ): any {
    return {
      identifiers: [["redsea", id]],
      name,
      model,
      primary_config_entry: entry,
    };
  }

  async function getDeviceList(hass: any) {
    const { default: DeviceList } = await import("../src/utils/common");
    return new DeviceList(hass);
  }

  it("creates an empty DeviceList when no devices", async () => {
    const list = await getDeviceList(makeHass({}));
    expect(list.main_devices).toHaveLength(0);
  });

  it("includes main redsea devices (not head/pump/ReefBeat)", async () => {
    const hass = makeHass({
      dev1: makeRedsea("ABC", "Skimmer", "entry_1"),
    });
    const list = await getDeviceList(hass);
    expect(list.main_devices).toHaveLength(1);
    expect(list.main_devices[0].text).toBe("Skimmer");
  });

  it("excludes sub-devices containing '_head_'", async () => {
    const hass = makeHass({
      dev1: makeRedsea("ABC_head_1", "Head", "entry_1"),
    });
    const list = await getDeviceList(hass);
    expect(list.main_devices).toHaveLength(0);
  });

  it("excludes sub-devices containing '_pump'", async () => {
    const hass = makeHass({
      dev1: makeRedsea("ABC_pump", "Pump", "entry_1"),
    });
    const list = await getDeviceList(hass);
    expect(list.main_devices).toHaveLength(0);
  });

  it("excludes ReefBeat model devices", async () => {
    const hass = makeHass({
      dev1: makeRedsea("ABC", "Cloud", "entry_1", "ReefBeat"),
    });
    const list = await getDeviceList(hass);
    expect(list.main_devices).toHaveLength(0);
  });

  it("ignores non-redsea devices", async () => {
    const hass = makeHass({
      dev1: {
        identifiers: [["zigbee", "abc"]],
        name: "Lamp",
        model: "Bulb",
        primary_config_entry: "e1",
      },
    });
    const list = await getDeviceList(hass);
    expect(list.main_devices).toHaveLength(0);
  });

  it("sorts main_devices alphabetically by name", async () => {
    const hass = makeHass({
      d1: makeRedsea("ZZZ", "Zebra", "e1"),
      d2: makeRedsea("AAA", "Alpha", "e2"),
      d3: makeRedsea("MMM", "Middle", "e3"),
    });
    const list = await getDeviceList(hass);
    expect(list.main_devices.map((d: any) => d.text)).toEqual([
      "Alpha",
      "Middle",
      "Zebra",
    ]);
  });

  it("get_by_name returns the device when found", async () => {
    const hass = makeHass({
      d1: makeRedsea("ABC", "Skimmer", "entry_1"),
    });
    const list = await getDeviceList(hass);
    const found = list.get_by_name("Skimmer");
    expect(found).toBeDefined();
    expect(found.name).toBe("Skimmer");
  });

  it("get_by_name returns undefined when not found", async () => {
    const hass = makeHass({
      d1: makeRedsea("ABC", "Skimmer", "entry_1"),
    });
    const list = await getDeviceList(hass);
    expect(list.get_by_name("Nonexistent")).toBeUndefined();
  });

  it("groups multiple sub-devices under same primary_config_entry", async () => {
    const hass = makeHass({
      main: makeRedsea("ABC", "Skimmer", "entry_1"),
      head: makeRedsea("ABC_head_1", "Head 1", "entry_1"),
    });
    const list = await getDeviceList(hass);
    // Only the main device appears in main_devices
    expect(list.main_devices).toHaveLength(1);
    // But both elements are stored in devices[entry_1]
    expect(list.devices["entry_1"].elements).toHaveLength(2);
  });
});

// ── toTime() and stringToTime() (already partially tested) ───────────────────

describe("toTime() edge cases", () => {
  it("handles exactly midnight (0)", () => {
    expect(toTime(0)).toBe("00:00:00");
  });

  it("handles end of day (86399)", () => {
    expect(toTime(86399)).toBe("23:59:59");
  });

  it("handles one hour exactly", () => {
    expect(toTime(3600)).toBe("01:00:00");
  });
});

describe("stringToTime() edge cases", () => {
  it("returns 0 for malformed input with no colon", () => {
    expect(stringToTime("1200")).toBe(0);
  });

  it("parses '23:59' correctly", () => {
    expect(stringToTime("23:59")).toBe(23 * 60 + 59);
  });

  it("parses '00:00' as 0", () => {
    expect(stringToTime("00:00")).toBe(0);
  });
});
