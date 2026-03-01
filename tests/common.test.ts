// Consolidated tests for common

import { Sensor } from "../src/base/sensor";
import { RSSwitch } from "../src/base/switch";
import { MyI18n } from "../src/translations/myi18n";
import { attachClickHandlers } from "../src/utils/click_handler";
import {
  create_hour,
  create_select,
  default as DeviceList,
  hexToRgb,
  rgbToHex,
  stringToTime,
  toTime,
} from "../src/utils/common";
import { merge } from "../src/utils/merge";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RSDevice from "../src/devices/device";
import DeviceList from "../src/utils/common";

function makeHass(devices: Record<string, any> = {}): any {
  return { states: {}, callService: vi.fn(), devices };
}
function makeHass_B(devices: Record<string, any>) {
  return { states: {}, entities: {}, devices, callService: vi.fn() } as any;
}
function makeDevice(
  name: string,
  configEntry: string,
  idSuffix = name,
  model = "RSDoser",
  extraIds: string[] = [],
) {
  return {
    name,
    primary_config_entry: configEntry,
    model,
    identifiers: [["redsea", idSuffix, ...extraIds]],
  };
}
function makeEl(): HTMLElement {
  return document.createElement("div");
}
class StubDevice extends RSDevice {
  _render(_style: any = null, _substyle: any = null): any {
    return null;
  }
}
if (!customElements.get("stub-device-b"))
  customElements.define("stub-device-b", StubDevice);
class StubSensor extends Sensor {
  protected override _render(_s = ""): any {
    return null;
  }
}
if (!customElements.get("stub-sensor-b"))
  customElements.define("stub-sensor-b", StubSensor);
class StubSwitch extends RSSwitch {
  protected override _render(_s = ""): any {
    return null;
  }
}
if (!customElements.get("stub-switch-b"))
  customElements.define("stub-switch-b", StubSwitch);
function makeState(
  state: string,
  entity_id = "sensor.test",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass_C(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
): any {
  return {
    states: {
      "sensor.device_state": makeState("on", "sensor.device_state"),
      "sensor.maintenance": makeState("off", "sensor.maintenance"),
      ...states,
    },
    entities,
    devices: {},
    callService: vi.fn(),
  };
}
function makeDevice_B(
  model = "RSDOSE4",
  name = "my_pump",
  disabled_by: string | null = null,
): any {
  return {
    model,
    name,
    elements: [
      {
        id: "dev-id-001",
        model,
        identifiers: [[null, `${model.toLowerCase()}_1234`]],
        disabled_by,
        primary_config_entry: "cfg-entry-xyz",
      },
    ],
  };
}

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
describe("rgbToHex()", () => {
  it("converts rgb() string", () =>
    expect(rgbToHex("rgb(164, 243, 198)").toLowerCase()).toBe("#a4f3c6"));
  it("converts rgba() string (alpha ignored)", () =>
    expect(rgbToHex("rgba(164, 243, 198, 0.5)").toLowerCase()).toBe("#a4f3c6"));
  it("returns original string when already hex (line 178 — else branch)", () => {
    expect(rgbToHex("#A4F3C6")).toBe("#A4F3C6");
    expect(rgbToHex("some-invalid-color")).toBe("some-invalid-color");
  });
  it("converts black rgb(0,0,0)", () =>
    expect(rgbToHex("rgb(0,0,0)")).toBe("#000000"));
  it("converts white rgb(255,255,255)", () =>
    expect(rgbToHex("rgb(255,255,255)")).toBe("#ffffff"));
});
describe("toTime()", () => {
  it("0s → 00:00:00", () => expect(toTime(0)).toBe("00:00:00"));
  it("3661s → 01:01:01", () => expect(toTime(3661)).toBe("01:01:01"));
  it("86399s → 23:59:59", () => expect(toTime(86399)).toBe("23:59:59"));
  it("pads single-digit components", () =>
    expect(toTime(3723)).toBe("01:02:03"));
});
describe("stringToTime()", () => {
  it("'00:00' → 0", () => expect(stringToTime("00:00")).toBe(0));
  it("'01:30' → 90", () => expect(stringToTime("01:30")).toBe(90));
  it("'23:59' → 1439", () => expect(stringToTime("23:59")).toBe(1439));
  it("returns 0 for malformed input", () => {
    expect(stringToTime("invalid")).toBe(0);
    expect(stringToTime("")).toBe(0);
  });
});
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

    expect(list.main_devices).toHaveLength(1);

    expect(list.devices["entry_1"].elements).toHaveLength(2);
  });
});
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
describe("DeviceList init_devices — L87: null device entry is skipped", () => {
  it("skips a null device without throwing and processes the real one", () => {
    const hass = makeHass_B({
      "null-slot": null,
      "real-dev": makeDevice("Main", "cfg1"),
    });
    const dl = new DeviceList(hass);
    expect(dl.devices["cfg1"]).toBeDefined();
    expect(Object.keys(dl.devices).length).toBe(1);
  });
});
describe("DeviceList init_devices — L90: undefined dev_id is skipped", () => {
  it("skips a device with an empty identifiers array", () => {
    const hass = makeHass_B({
      "empty-ids": {
        name: "No ID",
        primary_config_entry: "cfgX",
        model: "X",
        identifiers: [],
      },
      "real-dev": makeDevice("Main", "cfg1"),
    });
    const dl = new DeviceList(hass);
    expect(dl.devices["cfgX"]).toBeUndefined();
    expect(dl.devices["cfg1"]).toBeDefined();
  });
});
describe("DeviceList init_devices — L118 false: dev_id.length !== 2 skips name update", () => {
  it("keeps the original device name when the second device has a 3-element identifier", () => {
    const hass = makeHass_B({
      "dev-1": makeDevice("Main Device", "cfg1", "main"),
      "dev-2": {
        name: "Sub Head",
        primary_config_entry: "cfg1",
        model: "RSHead",
        identifiers: [["redsea", "main_head_1", "extra"]],
      },
    });
    const dl = new DeviceList(hass);
    expect(dl.devices["cfg1"].name).toBe("Main Device");
  });
});
describe("DeviceList init_devices — L120 false: device is undefined after L118 guard", () => {
  it("does not update device name and does not throw when device lookup returns undefined at L120", () => {
    const dl = new DeviceList(makeHass_B({}));

    const realEntry = { name: "Original", elements: [] as any[] };
    const storage: Record<string, any> = { cfg1: realEntry };

    let getCfg1Count = 0;

    (dl as any).devices = new Proxy(storage, {
      has: (target, prop) => Reflect.has(target, prop),
      get(target, prop, receiver) {
        if (prop === "cfg1") {
          getCfg1Count++;
          return getCfg1Count === 3 ? undefined : realEntry;
        }
        return Reflect.get(target, prop, receiver);
      },
      set: (target, prop, value) => Reflect.set(target, prop, value),
    });

    (dl as any)._hass = makeHass_B({
      "dev-1": makeDevice("Updated", "cfg1", "main"),
    });

    expect(() => {
      (dl as any).init_devices();
    }).not.toThrow();

    expect(realEntry.name).toBe("Original");
  });
});
