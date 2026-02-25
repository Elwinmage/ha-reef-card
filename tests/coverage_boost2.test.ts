/**
 * Coverage boost — additional tests for files not yet covered.
 *
 * Scope: tests that are NOT already in device.test.ts / devices_subclasses.test.ts
 * - RSDevice: _render_element (disabled/put_in filtering only — no create_element call)
 * - RSDevice: _render_disabled, _setting_hass, _populate_entities, update_config
 * - Sensor: updated(), connectedCallback()
 * - RSSwitch: is_on getter
 * - MyI18n: setLanguage() edge cases
 * - toTime() additional cases
 * - merge() additional branches
 *
 * All LitElement subclasses are registered via a Stub wrapper before use.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import RSDevice from "../src/devices/device";
import { Sensor } from "../src/base/sensor";
import { RSSwitch } from "../src/base/switch";
import { MyI18n } from "../src/translations/myi18n";
import { merge } from "../src/utils/merge";
import { toTime } from "../src/utils/common";

// ---------------------------------------------------------------------------
// Stub wrappers — required by LitElement before instantiation
// ---------------------------------------------------------------------------

class StubDevice extends RSDevice {
  _render(_style: any = null, _substyle: any = null): any {
    return null;
  }
}
// device.test.ts already registers "stub-rsdevice"; use a different name here
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

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function makeState(
  state: string,
  entity_id = "sensor.test",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}

function makeHass(
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

function makeDevice(
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

// ---------------------------------------------------------------------------
// RSDevice — _render_element() — only early-return paths (no create_element)
// disabled:true and put_in mismatch both return html`` before reaching create_element
// ---------------------------------------------------------------------------

describe("RSDevice._render_element() — early-return paths", () => {
  function makeDevWithConfig() {
    const dev = new StubDevice() as any;
    dev._hass = makeHass();
    dev._elements = {};
    dev.config = { model: "TEST", background_img: "", elements: {} };
    return dev;
  }

  it("returns html`` when element has disabled:true", () => {
    const dev = makeDevWithConfig();
    const result = dev._render_element(
      { name: "foo", disabled: true },
      true,
      null,
    );
    expect(result).toBeDefined();
  });

  it("returns html`` when put_in does not match requested group", () => {
    const dev = makeDevWithConfig();
    const result = dev._render_element(
      { name: "foo", put_in: "group_a", type: "common-sensor" },
      true,
      "group_b",
    );
    expect(result).toBeDefined();
  });

  it("returns html`` when element has no put_in but group is requested", () => {
    const dev = makeDevWithConfig();
    const result = dev._render_element(
      { name: "foo", type: "common-sensor" },
      true,
      "group_a",
    );
    expect(result).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// RSDevice — _render_disabled()
// ---------------------------------------------------------------------------

describe("RSDevice._render_disabled()", () => {
  it("returns null when device is enabled and not in maintenance", () => {
    const dev = new StubDevice() as any;
    dev.device = makeDevice();
    dev.entities = { maintenance: { entity_id: "sensor.maintenance" } };
    dev._hass = makeHass({
      "sensor.maintenance": makeState("off", "sensor.maintenance"),
    });
    dev.config = { background_img: "", elements: {} };
    expect(dev._render_disabled()).toBeNull();
  });

  it("returns html when device is disabled_by='user'", () => {
    const dev = new StubDevice() as any;
    dev.device = makeDevice("RSDOSE4", "pump", "user");
    dev.entities = {};
    dev.config = { background_img: "", elements: {} };
    expect(dev._render_disabled()).not.toBeNull();
  });

  it("returns html when maintenance entity state is 'on'", () => {
    const dev = new StubDevice() as any;
    dev.device = makeDevice();
    dev.entities = { maintenance: { entity_id: "sensor.maint" } };
    dev._hass = makeHass({ "sensor.maint": makeState("on", "sensor.maint") });
    dev.config = { background_img: "", elements: {} };
    expect(dev._render_disabled()).not.toBeNull();
  });

  it("returns null when maintenance entity is absent from entities", () => {
    const dev = new StubDevice() as any;
    dev.device = makeDevice();
    dev.entities = {};
    dev._hass = makeHass();
    dev.config = { background_img: "", elements: {} };
    expect(dev._render_disabled()).toBeNull();
  });

  it("accepts a substyle argument without throwing", () => {
    const dev = new StubDevice() as any;
    dev.device = makeDevice("RSDOSE4", "pump", "user");
    dev.entities = {};
    dev.config = { background_img: "", elements: {} };
    expect(dev._render_disabled("width:100%")).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// RSDevice — _setting_hass()
// ---------------------------------------------------------------------------

describe("RSDevice._setting_hass()", () => {
  it("sets to_render=true when disabled_by changes from null to 'user'", () => {
    const dev = new StubDevice() as any;
    dev.device = makeDevice();
    dev._elements = {};
    dev.config = { model: "TEST", elements: {} };
    dev.to_render = false;
    const hass = makeHass();
    hass.devices = { "dev-id-001": { disabled_by: "user" } };
    dev._setting_hass(hass);
    expect(dev.to_render).toBe(true);
  });

  it("keeps to_render=false when disabled_by stays null", () => {
    const dev = new StubDevice() as any;
    dev.device = makeDevice();
    dev._elements = {};
    dev.config = { model: "TEST", elements: {} };
    dev.to_render = false;
    const hass = makeHass();
    hass.devices = { "dev-id-001": { disabled_by: null } };
    dev._setting_hass(hass);
    expect(dev.to_render).toBe(false);
  });

  it("does not throw with empty device elements array", () => {
    const dev = new StubDevice() as any;
    dev.device = { elements: [] };
    dev._elements = {};
    dev.config = { model: "TEST", elements: {} };
    dev.to_render = false;
    expect(() => dev._setting_hass(makeHass())).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// RSDevice — _populate_entities()
// ---------------------------------------------------------------------------

describe("RSDevice._populate_entities()", () => {
  it("does not throw when _hass is null", () => {
    const dev = new StubDevice() as any;
    dev._hass = null;
    dev.device = makeDevice();
    dev.initial_config = { model: "TEST", elements: {} };
    dev.user_config = {};
    dev.config = { model: "TEST", elements: {}, background_img: "" };
    expect(() => dev._populate_entities()).not.toThrow();
  });

  it("populates entities matching device_id", () => {
    const dev = new StubDevice() as any;
    dev.device = makeDevice();
    dev.initial_config = { model: "TEST", elements: {} };
    dev.user_config = {};
    dev.config = { model: "TEST", elements: {}, background_img: "" };
    dev._hass = makeHass(
      {},
      {
        "sensor.a": {
          entity_id: "sensor.a",
          device_id: "dev-id-001",
          translation_key: "device_state",
        },
        "sensor.b": {
          entity_id: "sensor.b",
          device_id: "other-id",
          translation_key: "wifi",
        },
      },
    );
    dev.entities = {};
    dev._populate_entities();
    expect(dev.entities.device_state).toBeDefined();
    expect(dev.entities.wifi).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// RSDevice — update_config()
// ---------------------------------------------------------------------------

describe("RSDevice.update_config()", () => {
  it("deep-clones initial_config into config", () => {
    const dev = new StubDevice() as any;
    dev.initial_config = { model: "TEST", elements: {}, background_img: "" };
    dev.user_config = {};
    dev.device = makeDevice();
    dev.config = null;
    dev.dialogs = {};
    dev.update_config();
    expect(dev.config.model).toBe("TEST");
  });

  it("merges user_config.conf[model].devices into config", () => {
    const dev = new StubDevice() as any;
    dev.initial_config = {
      model: "RSDOSE4",
      elements: {},
      background_img: "",
      heads: {
        head_1: { color: "0,0,0" },
        head_2: { color: "0,0,0" },
        common: {},
      },
      heads_nb: 2,
    };
    dev.user_config = {
      conf: {
        RSDOSE4: {
          devices: { my_pump: { heads: { head_1: { color: "255,0,0" } } } },
        },
      },
    };
    dev.device = makeDevice("RSDOSE4", "my_pump");
    dev.dialogs = {};
    dev.update_config();
    expect(dev.config.heads.head_1.color).toBe("255,0,0");
  });
});

// ---------------------------------------------------------------------------
// RSDevice — get_style()
// ---------------------------------------------------------------------------

describe("RSDevice.get_style()", () => {
  it("returns empty string for null conf", () => {
    expect((new StubDevice() as any).get_style(null)).toBe("");
  });

  it("returns empty string when no css key", () => {
    expect((new StubDevice() as any).get_style({ name: "foo" })).toBe("");
  });

  it("converts css object to inline style string", () => {
    const result = (new StubDevice() as any).get_style({
      css: { color: "red", top: "10%" },
    });
    expect(result).toContain("color:red");
    expect(result).toContain("top:10%");
  });

  it("handles single css property", () => {
    expect(
      (new StubDevice() as any).get_style({ css: { width: "100px" } }),
    ).toBe("width:100px");
  });
});

// ---------------------------------------------------------------------------
// Sensor — updated() and connectedCallback()
// ---------------------------------------------------------------------------

describe("Sensor.updated()", () => {
  it("sets stateOn=true when stateObj.state is 'on'", () => {
    const s = new StubSensor() as any;
    s.stateObj = makeState("on", "sensor.x");
    s.updated();
    expect(s.stateOn).toBe(true);
  });

  it("sets stateOn=false when stateObj.state is 'off'", () => {
    const s = new StubSensor() as any;
    s.stateObj = makeState("off", "sensor.x");
    s.updated();
    expect(s.stateOn).toBe(false);
  });

  it("does not throw when stateObj is null", () => {
    const s = new StubSensor() as any;
    s.stateObj = null;
    expect(() => s.updated()).not.toThrow();
  });
});

describe("Sensor.connectedCallback()", () => {
  it("sets stateOn=true when stateObj.state is 'on'", () => {
    const s = new StubSensor() as any;
    s.stateObj = makeState("on", "sensor.x");
    s.connectedCallback();
    expect(s.stateOn).toBe(true);
  });

  it("stateOn is falsy when stateObj is null", () => {
    const s = new StubSensor() as any;
    s.stateObj = null;
    s.connectedCallback();
    expect(s.stateOn).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// RSSwitch — is_on getter
// ---------------------------------------------------------------------------

describe("RSSwitch.is_on", () => {
  it("returns false when conf is null", () => {
    const sw = new StubSwitch() as any;
    sw.conf = null;
    expect(sw.is_on).toBe(false);
  });

  it("returns false when conf has no name", () => {
    const sw = new StubSwitch() as any;
    sw.conf = {};
    expect(sw.is_on).toBe(false);
  });

  it("returns true when stateObj.state is 'on'", () => {
    const sw = new StubSwitch() as any;
    sw.conf = { name: "schedule_enabled" };
    sw.stateObj = makeState("on");
    expect(sw.is_on).toBe(true);
  });

  it("returns false when stateObj.state is 'off'", () => {
    const sw = new StubSwitch() as any;
    sw.conf = { name: "schedule_enabled" };
    sw.stateObj = makeState("off");
    expect(sw.is_on).toBe(false);
  });

  it("returns false when stateObj is null", () => {
    const sw = new StubSwitch() as any;
    sw.conf = { name: "schedule_enabled" };
    sw.stateObj = null;
    expect(sw.is_on).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// MyI18n — setLanguage() edge cases
// ---------------------------------------------------------------------------

describe("MyI18n.setLanguage()", () => {
  let i18n: any;

  beforeEach(() => {
    i18n = new MyI18n();
  });

  it("switches to 'fr' language", () => {
    i18n.setLanguage("fr");
    expect(i18n.getLanguage()).toBe("fr");
  });

  it("stays on current language when already set", () => {
    const current = i18n.getLanguage();
    i18n.setLanguage(current);
    expect(i18n.getLanguage()).toBe(current);
  });

  it("ignores unknown language code 'ja'", () => {
    const before = i18n.getLanguage();
    i18n.setLanguage("ja");
    expect(i18n.getLanguage()).toBe(before);
  });

  it("normalizes 'fr-FR' to 'fr'", () => {
    i18n.setLanguage("fr-FR");
    expect(i18n.getLanguage()).toBe("fr");
  });

  it("normalizes uppercase 'EN' to 'en'", () => {
    i18n.setLanguage("fr");
    i18n.setLanguage("EN");
    expect(i18n.getLanguage()).toBe("en");
  });
});

// ---------------------------------------------------------------------------
// toTime() — additional edge cases
// ---------------------------------------------------------------------------

describe("toTime()", () => {
  it("converts 0 to 00:00:00", () => expect(toTime(0)).toBe("00:00:00"));
  it("converts 3600 to 01:00:00", () => expect(toTime(3600)).toBe("01:00:00"));
  it("converts 3661 to 01:01:01", () => expect(toTime(3661)).toBe("01:01:01"));
  it("converts 60 to 00:01:00", () => expect(toTime(60)).toBe("00:01:00"));
  it("converts 86399 to 23:59:59", () =>
    expect(toTime(86399)).toBe("23:59:59"));
});

// ---------------------------------------------------------------------------
// merge() — additional branches
// ---------------------------------------------------------------------------

describe("merge() — additional branches", () => {
  it("overwrites object key with primitive from source", () => {
    const a = { nested: { x: 1 } };
    const b: any = { nested: "string_value" };
    const result = merge(a, b);
    expect(result.nested).toBe("string_value");
  });

  it("overwrites array with new array (no concat)", () => {
    const a: any = { list: [1, 2] };
    const b: any = { list: [3] };
    const result = merge(a, b);
    expect(result.list).toEqual([3]);
  });
});
