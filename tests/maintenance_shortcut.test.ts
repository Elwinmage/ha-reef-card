// Tests for the per-device maintenance shortcut (mdi:wrench-clock) and the
// dialog it opens: the maintenance overview restricted to one device.

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  device_maintenance_status,
  has_device_maintenance,
} from "../src/utils/maintenance";
import { MyElement } from "../src/base/element";
import "../src/base/index";
import { MAINTENANCE_TAG } from "../src/utils/constants";
import { COLOR_ERROR_HEX, COLOR_ORANGE_HEX } from "../src/utils/colors";

import { RSDevice } from "../src/devices/device";
import {
  dialogs_device,
  dialogs_maintenance,
} from "../src/devices/device.dialogs";
import { AMDCRunner, AMDCSkimmer, AMSmartDrift } from "../src/devices/index";
import { COLOR_AM_HEX } from "../src/utils/colors";
import { config as am_runner } from "../src/devices/aquamedic/dcrunner/dcrunner.mapping";
import { config as am_skimmer } from "../src/devices/aquamedic/dcskimmer/dcskimmer.mapping";
import { config as am_drift } from "../src/devices/aquamedic/smartdrift/smartdrift.mapping";
import { actionRegistry, run_action } from "../src/devices/actions";
import { RSMaintenance } from "../src/devices/redsea/maintenance";
import { maintenance_tasks } from "../src/devices/redsea/maintenance/maintenance.dialog_func_ext";
import {
  MAINTENANCE_SHORTCUT,
  maintenance_shortcut,
} from "../src/devices/redsea/maintenance/maintenance.shortcut";

import { config as rsato } from "../src/devices/redsea/rsato/rsato.mapping";
import { config as rscontrol_lite } from "../src/devices/redsea/rscontrol/rscontrollite.mapping";
import { config2 as rscontrol_pro } from "../src/devices/redsea/rscontrol/rscontrolpro.mapping";
import { config2 as rsdose2 } from "../src/devices/redsea/rsdose/rsdose2.mapping";
import { config4 as rsdose4 } from "../src/devices/redsea/rsdose/rsdose4.mapping";
import { config as rsled_g1 } from "../src/devices/redsea/rsled/rsled_g1.mapping";
import { config2 as rsled_g2 } from "../src/devices/redsea/rsled/rsled_g2.mapping";
import {
  config_virtual_g1,
  config_virtual_g2,
} from "../src/devices/redsea/rsled/rsled_virtual.mapping";
import { config as rsmat } from "../src/devices/redsea/rsmat/rsmat.mapping";
import { config as rspower6 } from "../src/devices/redsea/rspower/rspower6.mapping";
import { config2 as rspower8 } from "../src/devices/redsea/rspower/rspower8.mapping";
import { config as rsrun } from "../src/devices/redsea/rsrun/rsrun.mapping";
import { config as rswave } from "../src/devices/redsea/rswave/rswave.mapping";

// jsdom requires custom elements to be registered before they are constructed
if (!customElements.get(MAINTENANCE_TAG)) {
  customElements.define(MAINTENANCE_TAG, RSMaintenance as any);
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeTask(friendly_name: string, task_key: string, extra = {}): any {
  return {
    state: "unknown",
    attributes: {
      friendly_name,
      reef_role: "maint_" + task_key,
      task_key,
      interval_days: 30,
      days_left: 5,
      overdue: false,
      last_reset: "2026-01-01T10:00:00+00:00",
      notify: true,
      ...extra,
    },
  };
}

/**
 * A doser with two heads (sub-devices), an ATO, a disabled lamp and a task
 * unknown to the registry.
 */
function makeHass(): any {
  return {
    states: {
      "button.head1_calibrate": makeTask(
        "SIMU-RSDOSE4 Head 1 Calibrate",
        "dose_calibrate",
      ),
      "button.head2_calibrate": makeTask(
        "SIMU-RSDOSE4 Head 2 Calibrate",
        "dose_calibrate",
      ),
      "button.ato_clean": makeTask("SIMU-RSATO Clean sensor", "ato_clean"),
      "button.led_lens": makeTask("SIMU-RSLED Clean lenses", "led_lens"),
      "button.orphan_task": makeTask("Ghost Clean", "ghost_clean", {
        device_name: "Ghost",
      }),
      // Not a maintenance entity
      "sensor.ato_level": { state: "ok", attributes: {} },
    },
    entities: {
      "button.head1_calibrate": { device_id: "dev_head1" },
      "button.head2_calibrate": { device_id: "dev_head2" },
      "button.ato_clean": { device_id: "dev_ato" },
      "button.led_lens": { device_id: "dev_led" },
    },
    devices: {
      dev_dose: { id: "dev_dose", name: "SIMU-RSDOSE4", disabled_by: null },
      dev_head1: {
        id: "dev_head1",
        name: "SIMU-RSDOSE4 Head 1",
        disabled_by: null,
        via_device_id: "dev_dose",
      },
      dev_head2: {
        id: "dev_head2",
        name: "SIMU-RSDOSE4 Head 2",
        disabled_by: null,
        via_device_id: "dev_dose",
      },
      dev_ato: {
        id: "dev_ato",
        name: "Raw ATO",
        name_by_user: "SIMU-RSATO",
        disabled_by: null,
      },
      dev_led: { id: "dev_led", name: "SIMU-RSLED", disabled_by: "user" },
    },
    callService: vi.fn(),
  };
}

/** A card device, as DeviceList builds it. */
function makeDevice(name: string, ids: string[]): any {
  return { name, elements: ids.map((id) => ({ id, disabled_by: null })) };
}

function makeRSDevice(hass: any, device: any): any {
  const dev = new RSDevice() as any;
  dev._hass = hass;
  dev.device = device;
  return dev;
}

/** Minimal dialog shadow root: only #dialog-content is needed */
function makeShadowRoot(): any {
  const root = document.createElement("div");
  const content = document.createElement("div");
  content.id = "dialog-content";
  root.appendChild(content);
  document.body.appendChild(root);
  return root;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

// ── Detection ────────────────────────────────────────────────────────────────

describe("has_device_maintenance", () => {
  it("is false without hass, states or selection", () => {
    expect(has_device_maintenance(null, ["dev_ato"])).toBe(false);
    expect(has_device_maintenance({} as any, ["dev_ato"])).toBe(false);
    expect(has_device_maintenance(makeHass(), [])).toBe(false);
  });

  it("matches the device owning the task by id", () => {
    expect(has_device_maintenance(makeHass(), ["dev_ato"])).toBe(true);
  });

  it("matches sub-devices through their root device", () => {
    expect(has_device_maintenance(makeHass(), ["dev_dose"])).toBe(true);
  });

  it("matches by name, the one set by the user first", () => {
    expect(has_device_maintenance(makeHass(), ["SIMU-RSATO"])).toBe(true);
    expect(has_device_maintenance(makeHass(), ["Raw ATO"])).toBe(false);
  });

  it("matches sub-devices by name prefix without via_device", () => {
    const hass = makeHass();
    delete hass.devices.dev_head1.via_device_id;
    delete hass.devices.dev_head2.via_device_id;
    expect(has_device_maintenance(hass, ["dev_dose"])).toBe(false);
    expect(has_device_maintenance(hass, ["SIMU-RSDOSE4"])).toBe(true);
  });

  it("matches the root name of a sub-device", () => {
    const hass = makeHass();
    hass.devices.dev_head1.name = "Head 1";
    hass.devices.dev_head2.name = "Head 2";
    expect(has_device_maintenance(hass, ["SIMU-RSDOSE4"])).toBe(true);
  });

  it("falls back to the name carried by the task", () => {
    expect(has_device_maintenance(makeHass(), ["Ghost"])).toBe(true);
  });

  it("copes with a task that has no device nor name", () => {
    const hass = makeHass();
    delete hass.states["button.orphan_task"].attributes.device_name;
    delete hass.entities;
    delete hass.devices;
    expect(has_device_maintenance(hass, ["Ghost"])).toBe(false);
  });

  it("ignores the tasks of a disabled device", () => {
    expect(has_device_maintenance(makeHass(), ["dev_led"])).toBe(false);
  });

  it("is false for a device without any task", () => {
    expect(has_device_maintenance(makeHass(), ["dev_wave"])).toBe(false);
  });
});

describe("device_maintenance_status", () => {
  /** Hass with the ATO task set to the given attributes. */
  function withAto(attrs: Record<string, any>): any {
    const hass = makeHass();
    Object.assign(hass.states["button.ato_clean"].attributes, attrs);
    return hass;
  }

  it("is null without any task for the devices", () => {
    expect(device_maintenance_status(null, ["dev_ato"])).toBeNull();
    expect(device_maintenance_status(makeHass(), [])).toBeNull();
    expect(device_maintenance_status(makeHass(), ["dev_wave"])).toBeNull();
  });

  it("is ok while every task is on time", () => {
    expect(
      device_maintenance_status(withAto({ days_left: 20 }), ["dev_ato"]),
    ).toBe("ok");
  });

  it("is warning once a task enters the warning window", () => {
    // 30 days * 0.2 = the last 6 days
    expect(device_maintenance_status(makeHass(), ["dev_ato"])).toBe("warning");
    // A narrower window leaves 5 days out of it
    expect(device_maintenance_status(makeHass(), ["dev_ato"], 0.1)).toBe("ok");
  });

  it("is overdue once a task is past its deadline", () => {
    expect(
      device_maintenance_status(withAto({ days_left: -1 }), ["dev_ato"]),
    ).toBe("overdue");
  });

  it("keeps the worst status of the sub-devices", () => {
    const hass = makeHass();
    hass.states["button.head1_calibrate"].attributes.days_left = 25;
    hass.states["button.head2_calibrate"].attributes.days_left = 25;
    expect(device_maintenance_status(hass, ["dev_dose"])).toBe("ok");
    hass.states["button.head1_calibrate"].attributes.days_left = 3;
    expect(device_maintenance_status(hass, ["dev_dose"])).toBe("warning");
    // A later task that is fine does not lower it
    hass.states["button.head2_calibrate"].attributes.days_left = 28;
    expect(device_maintenance_status(hass, ["dev_dose"])).toBe("warning");
    hass.states["button.head2_calibrate"].attributes.days_left = -4;
    expect(device_maintenance_status(hass, ["dev_dose"])).toBe("overdue");
  });

  it("does not call for attention on a muted task", () => {
    const hass = withAto({ days_left: -10, notify: false });
    expect(device_maintenance_status(hass, ["dev_ato"])).toBe("ok");
  });

  it("does not call for attention on a task never reset", () => {
    const hass = withAto({ days_left: null });
    expect(device_maintenance_status(hass, ["dev_ato"])).toBe("ok");
  });

  it("copes with a missing interval", () => {
    const hass = withAto({ days_left: 3, interval_days: "soon" });
    expect(device_maintenance_status(hass, ["dev_ato"])).toBe("ok");
  });
});

describe("RSDevice maintenance helpers", () => {
  it("reports the worst status, with the user's warning window", () => {
    const hass = makeHass();
    const dev = makeRSDevice(hass, makeDevice("SIMU-RSATO", ["dev_ato"]));
    expect(dev.maintenance_status()).toBe("warning");
    dev.user_config = { maintenance: { warning_ratio: 0.1 } };
    expect(dev.maintenance_status()).toBe("ok");
    // An unusable ratio falls back to the default window
    dev.user_config = { maintenance: { warning_ratio: 4 } };
    expect(dev.maintenance_status()).toBe("warning");
    dev.user_config = { maintenance: { warning_ratio: "x" } };
    expect(dev.maintenance_status()).toBe("warning");
    dev.user_config = { maintenance: { warning_ratio: 0 } };
    expect(dev.maintenance_status()).toBe("warning");
    expect(
      makeRSDevice(hass, makeDevice("Wave", ["dev_wave"])).maintenance_status(),
    ).toBeNull();
  });

  it("lists the ids of its HA devices, then its name", () => {
    const dev = makeRSDevice(
      makeHass(),
      makeDevice("SIMU-RSDOSE4", ["dev_dose", "dev_head1"]),
    );
    expect(dev.maintenance_device_ids()).toEqual([
      "dev_dose",
      "dev_head1",
      "SIMU-RSDOSE4",
    ]);
  });

  it("skips what is missing", () => {
    const dev = makeRSDevice(makeHass(), null);
    expect(dev.maintenance_device_ids()).toEqual([]);
    dev.device = { name: "", elements: [null, { id: "" }] };
    expect(dev.maintenance_device_ids()).toEqual([]);
    dev.device = { name: "Lonely" };
    expect(dev.maintenance_device_ids()).toEqual(["Lonely"]);
  });

  it("tells whether the device has maintenance tasks", () => {
    const hass = makeHass();
    expect(
      makeRSDevice(
        hass,
        makeDevice("SIMU-RSDOSE4", ["dev_dose"]),
      ).has_maintenance_tasks(),
    ).toBe(true);
    expect(
      makeRSDevice(
        hass,
        makeDevice("SIMU-RSWAVE", ["dev_wave"]),
      ).has_maintenance_tasks(),
    ).toBe(false);
    expect(makeRSDevice(hass, null).has_maintenance_tasks()).toBe(false);
  });

  it("drives the visibility of the shortcut", () => {
    const hass = makeHass();
    const conf = maintenance_shortcut({});
    const with_tasks = makeRSDevice(hass, makeDevice("ATO", ["dev_ato"]));
    const without = makeRSDevice(hass, makeDevice("Wave", ["dev_wave"]));
    // true means "hidden"
    expect(with_tasks.evaluate_condition(conf.disabled_if, conf)).toBe(false);
    expect(without.evaluate_condition(conf.disabled_if, conf)).toBe(true);
  });
});

// ── Shortcut element ─────────────────────────────────────────────────────────

describe("maintenance_shortcut", () => {
  it("opens the maintenance_tasks dialog from a wrench-clock icon", () => {
    const css = { position: "absolute", top: "1%", left: "2%" };
    const conf = maintenance_shortcut(css);
    expect(conf.name).toBe(MAINTENANCE_SHORTCUT);
    expect(conf.type).toBe("click-image");
    expect(conf.icon).toBe("mdi:wrench-clock");
    expect(conf.stateObj).toBeNull();
    expect(conf.off_clickable).toBe(true);
    expect(conf.no_br_if_disabled).toBe(true);
    expect(conf.tap_action).toEqual({
      domain: "redsea_ui",
      action: "dialog",
      data: { type: "maintenance_tasks" },
    });
    expect(conf.css).toBe(css);
  });

  /** The shortcut as the card draws it, on a device with one ATO task. */
  function drawn(days_left: number, icon_color?: string) {
    const hass = makeHass();
    hass.states["button.ato_clean"].attributes.days_left = days_left;
    const dev = makeRSDevice(hass, makeDevice("SIMU-RSATO", ["dev_ato"]));
    dev.config = { color: "0,0,0", alpha: 1 };
    const conf: any = maintenance_shortcut({}, icon_color);
    const elt: any = MyElement.create_element(hass, conf, dev);
    return { color: elt.evaluate(conf.icon_color), cls: elt.get_class() };
  }

  it("keeps its colour and stays still while every task is on time", () => {
    expect(drawn(20)).toEqual({ color: COLOR_ERROR_HEX, cls: "" });
    expect(drawn(20, "#fff")).toEqual({ color: "#fff", cls: "" });
  });

  it("turns orange when a task is due soon", () => {
    expect(drawn(3)).toEqual({ color: COLOR_ORANGE_HEX, cls: "" });
    expect(drawn(3, "#fff")).toEqual({ color: COLOR_ORANGE_HEX, cls: "" });
  });

  it("turns red and blinks when a task is overdue", () => {
    expect(drawn(-2)).toEqual({ color: COLOR_ERROR_HEX, cls: "blink" });
    expect(drawn(-2, "#fff")).toEqual({ color: COLOR_ERROR_HEX, cls: "blink" });
  });

  it("targets a dialog every device loads, built by a registered action", () => {
    const dialog = (dialogs_device as any)[MAINTENANCE_SHORTCUT];
    expect(dialog.name).toBe(MAINTENANCE_SHORTCUT);
    const extend = dialog.content[0];
    expect(extend.view).toBe("extend");
    expect(extend.re_render).toBe(true);
    // dialog.ts calls actionRegistry[extend][dialog.name]
    expect(actionRegistry[extend.extend][dialog.name]).toBe(maintenance_tasks);
    expect((new RSDevice() as any).dialogs[MAINTENANCE_SHORTCUT]).toBeDefined();
  });

  const MAPPINGS: Record<string, any> = {
    rsato,
    rscontrol_lite,
    rscontrol_pro,
    rsdose2,
    rsdose4,
    rsled_g1,
    rsled_g2,
    config_virtual_g1,
    config_virtual_g2,
    rsmat,
    rspower6,
    rspower8,
    rsrun,
    rswave,
    am_runner,
    am_skimmer,
    am_drift,
  };

  it.each(Object.keys(MAPPINGS))("is placed on the %s view", (model) => {
    const elt = MAPPINGS[model].elements[MAINTENANCE_SHORTCUT];
    expect(elt).toBeDefined();
    expect(elt.icon).toBe("mdi:wrench-clock");
    expect(elt.css.position).toBe("absolute");
    expect(elt.css.top).toMatch(/%$/);
    expect(elt.css.left ?? elt.css.right).toMatch(/%$/);
  });

  it.each(Object.keys(MAPPINGS))(
    "does not sit on another icon of the %s view",
    (model) => {
      const elements = MAPPINGS[model].elements;
      const mine = elements[MAINTENANCE_SHORTCUT].css;
      for (const key in elements) {
        if (key === MAINTENANCE_SHORTCUT) continue;
        const css = elements[key]?.css;
        if (!css || css.top !== mine.top) continue;
        const same_left = mine.left !== undefined && css.left === mine.left;
        const same_right = mine.right !== undefined && css.right === mine.right;
        expect(same_left || same_right, key).toBe(false);
      }
    },
  );

  it("is drawn in the Aqua Medic colour on an Aqua Medic pump", () => {
    for (const mapping of [am_runner, am_skimmer, am_drift] as any[]) {
      expect(mapping.elements[MAINTENANCE_SHORTCUT].icon_color).toContain(
        COLOR_AM_HEX,
      );
    }
  });

  it("opens its dialog on the Aqua Medic pumps too", () => {
    expect(dialogs_device.maintenance_tasks).toBe(
      dialogs_maintenance.maintenance_tasks,
    );
    for (const View of [AMDCRunner, AMDCSkimmer, AMSmartDrift] as any[]) {
      const dev = new View();
      expect(dev.dialogs[MAINTENANCE_SHORTCUT]).toBeDefined();
      // Their own settings dialog is still there
      expect(dev.dialogs.config).toBeDefined();
    }
  });

  it("stays on a ReefLED that is switched off", () => {
    expect(rsled_g1.off_keep).toContain(MAINTENANCE_SHORTCUT);
    expect(config_virtual_g2.off_keep).toContain(MAINTENANCE_SHORTCUT);
  });
});

// ── Dialog content ───────────────────────────────────────────────────────────

describe("maintenance_tasks dialog", () => {
  function open(device: any, hass = makeHass()) {
    const shadowRoot = makeShadowRoot();
    const elt = { device: makeRSDevice(hass, device) };
    maintenance_tasks(elt, hass, shadowRoot);
    const wrapper = shadowRoot.querySelector("#device-maintenance");
    return { shadowRoot, elt, hass, wrapper, view: wrapper?.view };
  }

  it("shows only the tasks of the device and its sub-devices", async () => {
    const { view } = open(makeDevice("SIMU-RSDOSE4", ["dev_dose"]));
    await view.updateComplete;
    expect(view.embedded).toBe(true);
    const root = view.shadowRoot;
    expect(root.querySelectorAll(".maint-row")).toHaveLength(2);
    const groups = [...root.querySelectorAll(".maint-group-title")].map(
      (g: any) => g.textContent.trim(),
    );
    expect(groups).toEqual(["SIMU-RSDOSE4 Head 1", "SIMU-RSDOSE4 Head 2"]);
  });

  it("leaves the title to the dialog and keeps the counters", async () => {
    const { view } = open(makeDevice("SIMU-RSATO", ["dev_ato"]));
    await view.updateComplete;
    const root = view.shadowRoot;
    expect(root.querySelector(".maint-root.embedded")).not.toBeNull();
    expect(root.querySelector(".maint-title")).toBeNull();
    expect(root.querySelector(".maint-counters")).not.toBeNull();
    expect(root.querySelectorAll(".maint-row")).toHaveLength(1);
  });

  it("keeps the title of the standalone overview", async () => {
    const view: any = RSDevice.create_device(MAINTENANCE_TAG, makeHass(), {}, {
      name: "",
      elements: [],
    } as any);
    document.body.appendChild(view);
    await view.updateComplete;
    expect(view.embedded).toBe(false);
    expect(view.shadowRoot.querySelector(".maint-title")).not.toBeNull();
    expect(view.shadowRoot.querySelector(".maint-root.embedded")).toBeNull();
  });

  it("applies the user's display options, but its own device filter", async () => {
    const hass = makeHass();
    const shadowRoot = makeShadowRoot();
    const device = makeRSDevice(hass, makeDevice("SIMU-RSATO", ["dev_ato"]));
    device.user_config = {
      maintenance: {
        show_reset: false,
        sort: "due",
        devices: ["SIMU-RSDOSE4"],
      },
    };
    maintenance_tasks({ device }, hass, shadowRoot);
    const view = shadowRoot.querySelector("#device-maintenance").view;
    await view.updateComplete;
    const root = view.shadowRoot;
    expect(root.querySelectorAll(".maint-row")).toHaveLength(1);
    expect(root.querySelector(".maint-done")).toBeNull();
    expect(root.querySelector("#sort-device").className).toBe("active");
  });

  it("resets a task from the dialog", async () => {
    const { view, hass } = open(makeDevice("SIMU-RSATO", ["dev_ato"]));
    await view.updateComplete;
    view.shadowRoot.querySelector(".maint-done").click();
    expect(hass.callService).toHaveBeenCalledWith("button", "press", {
      entity_id: "button.ato_clean",
    });
  });

  it("is built once, then only follows the states", async () => {
    const { shadowRoot, elt, view } = open(
      makeDevice("SIMU-RSATO", ["dev_ato"]),
    );
    await view.updateComplete;
    const next = makeHass();
    next.states["button.ato_clean"].attributes.days_left = -3;
    maintenance_tasks(elt, next, shadowRoot);
    expect(shadowRoot.querySelectorAll("#device-maintenance")).toHaveLength(1);
    expect(shadowRoot.querySelector("#device-maintenance").view).toBe(view);
    await view.updateComplete;
    expect(
      view.shadowRoot.querySelector(".maint-badge.overdue"),
    ).not.toBeNull();
  });

  it("survives a wrapper that lost its view", () => {
    const { shadowRoot, elt, wrapper } = open(
      makeDevice("SIMU-RSATO", ["dev_ato"]),
    );
    wrapper.view = null;
    expect(() => maintenance_tasks(elt, makeHass(), shadowRoot)).not.toThrow();
    expect(shadowRoot.querySelectorAll("#device-maintenance")).toHaveLength(1);
  });

  it("is reached through the action registry, as dialog.ts does", () => {
    const hass = makeHass();
    const shadowRoot = makeShadowRoot();
    const elt = {
      device: makeRSDevice(hass, makeDevice("SIMU-RSATO", ["dev_ato"])),
    };
    run_action(
      "maintenance_dialog_func_ext",
      "maintenance_tasks",
      elt,
      hass,
      shadowRoot,
    );
    expect(shadowRoot.querySelector("#device-maintenance")).not.toBeNull();
  });

  it("does nothing without a device or a dialog", () => {
    const hass = makeHass();
    const shadowRoot = makeShadowRoot();
    maintenance_tasks(null, hass, shadowRoot);
    maintenance_tasks({}, hass, shadowRoot);
    expect(shadowRoot.querySelector("#device-maintenance")).toBeNull();
    const elt = {
      device: makeRSDevice(hass, makeDevice("SIMU-RSATO", ["dev_ato"])),
    };
    expect(() => maintenance_tasks(elt, hass, null)).not.toThrow();
    expect(() =>
      maintenance_tasks(elt, hass, document.createElement("div")),
    ).not.toThrow();
  });

  it("never opens unrestricted from an unidentified device", () => {
    // An empty filter would list the tasks of every device
    const { wrapper } = open({ name: "", elements: [] });
    expect(wrapper).toBeNull();
    const shadowRoot = makeShadowRoot();
    maintenance_tasks({ device: {} }, makeHass(), shadowRoot);
    expect(shadowRoot.querySelector("#device-maintenance")).toBeNull();
  });

  it("does nothing when the overview element is not available", () => {
    const spy = vi.spyOn(RSDevice, "create_device").mockReturnValue(null);
    const { wrapper } = open(makeDevice("SIMU-RSATO", ["dev_ato"]));
    expect(wrapper).toBeNull();
    spy.mockRestore();
  });
});
