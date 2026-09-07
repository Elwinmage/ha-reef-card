// Tests for the "filter by device" option of the maintenance overview

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  collect_maintenance_items,
  filter_by_devices,
  list_maintenance_devices,
  resolve_root_device,
} from "../src/utils/maintenance";

import { RSMaintenance } from "../src/devices/redsea/maintenance";
import { MAINTENANCE_TAG } from "../src/utils/constants";

// jsdom requires custom elements to be registered before they are constructed
if (!customElements.get(MAINTENANCE_TAG)) {
  customElements.define(MAINTENANCE_TAG, RSMaintenance as any);
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * Build a maintenance button state object.
 */
function makeTask(
  entity_id: string,
  friendly_name: string,
  task_key: string,
  days_left: number | null,
  extra: Record<string, any> = {},
): any {
  return {
    entity_id,
    state: "unknown",
    attributes: {
      friendly_name,
      reef_role: "maint_" + task_key,
      task_key,
      interval_days: 30,
      days_left,
      overdue: days_left !== null && days_left < 0,
      last_reset: "2026-01-01T10:00:00+00:00",
      notify: true,
      ...extra,
    },
  };
}

/**
 * Build a hass mock holding two ReefDose heads (sub-devices of a controller),
 * an ATO and a task whose device is unknown to the registry.
 */
function makeHass(): any {
  const states: Record<string, any> = {
    "button.head1_calibrate": makeTask(
      "button.head1_calibrate",
      "SIMU-RSDOSE4 Head 1 Calibrate",
      "dose_calibrate",
      5,
    ),
    "button.head2_calibrate": makeTask(
      "button.head2_calibrate",
      "SIMU-RSDOSE4 Head 2 Calibrate",
      "dose_calibrate",
      -2,
    ),
    "button.ato_clean": makeTask(
      "button.ato_clean",
      "SIMU-RSATO Clean sensor",
      "ato_clean",
      12,
    ),
    "button.led_lens": makeTask(
      "button.led_lens",
      "SIMU-RSLED Clean lenses",
      "led_lens",
      40,
    ),
    // No registry entry: the device name only comes from the attributes.
    "button.orphan_task": makeTask(
      "button.orphan_task",
      "Ghost Clean",
      "ghost_clean",
      3,
      { device_name: "Ghost" },
    ),
  };

  const entities: Record<string, any> = {
    "button.head1_calibrate": { device_id: "dev_head1" },
    "button.head2_calibrate": { device_id: "dev_head2" },
    "button.ato_clean": { device_id: "dev_ato" },
    "button.led_lens": { device_id: "dev_led" },
  };

  const devices: Record<string, any> = {
    dev_dose: {
      id: "dev_dose",
      name: "SIMU-RSDOSE4",
      model: "RSDOSE4",
      identifiers: [["redsea", "rsdose4_1"]],
      primary_config_entry: "entry_dose",
      disabled_by: null,
    },
    dev_head1: {
      id: "dev_head1",
      name: "SIMU-RSDOSE4 Head 1",
      model: "RSDOSE4",
      identifiers: [["redsea", "rsdose4_1_head_1"]],
      primary_config_entry: "entry_dose",
      disabled_by: null,
      via_device_id: "dev_dose",
    },
    dev_head2: {
      id: "dev_head2",
      name: "SIMU-RSDOSE4 Head 2",
      model: "RSDOSE4",
      identifiers: [["redsea", "rsdose4_1_head_2"]],
      primary_config_entry: "entry_dose",
      disabled_by: null,
      via_device_id: "dev_dose",
    },
    dev_ato: {
      id: "dev_ato",
      name: "SIMU-RSATO",
      model: "RSATO",
      identifiers: [["redsea", "rsato_1"]],
      primary_config_entry: "entry_ato",
      disabled_by: null,
    },
    dev_led: {
      id: "dev_led",
      name: "SIMU-RSLED",
      model: "RSLED160",
      identifiers: [["redsea", "rsled_1"]],
      primary_config_entry: "entry_led",
      disabled_by: null,
    },
  };

  return { states, entities, devices, callService: vi.fn() };
}

// ── Root device resolution ───────────────────────────────────────────────────

describe("resolve_root_device", () => {
  const devices: Record<string, any> = {
    root: { id: "root", name: "Controller" },
    child: { id: "child", name: "Head 1", via_device_id: "root" },
    grand: { id: "grand", name: "Nozzle", via_device_id: "child" },
    renamed: { id: "renamed", name: "Raw", name_by_user: "My pump" },
    dangling: { id: "dangling", name: "Lost", via_device_id: "gone" },
    empty_via: { id: "empty_via", name: "Flat", via_device_id: "" },
    bad_via: { id: "bad_via", name: "Odd", via_device_id: 42 },
    nameless: { id: "nameless" },
    loop_a: { id: "loop_a", name: "A", via_device_id: "loop_b" },
    loop_b: { id: "loop_b", name: "B", via_device_id: "loop_a" },
  };

  it("returns the device itself when it has no parent", () => {
    expect(resolve_root_device(devices, "root", "fallback")).toEqual({
      id: "root",
      name: "Controller",
    });
  });

  it("walks the whole via_device chain", () => {
    expect(resolve_root_device(devices, "grand", "fallback")).toEqual({
      id: "root",
      name: "Controller",
    });
  });

  it("prefers the name set by the user", () => {
    expect(resolve_root_device(devices, "renamed", "fallback").name).toBe(
      "My pump",
    );
  });

  it("stops on a via_device pointing to an unknown device", () => {
    expect(resolve_root_device(devices, "dangling", "fallback").id).toBe(
      "dangling",
    );
  });

  it("ignores an empty or non string via_device", () => {
    expect(resolve_root_device(devices, "empty_via", "fallback").id).toBe(
      "empty_via",
    );
    expect(resolve_root_device(devices, "bad_via", "fallback").id).toBe(
      "bad_via",
    );
  });

  it("falls back to the given name when the device has none", () => {
    expect(resolve_root_device(devices, "nameless", "fallback")).toEqual({
      id: "nameless",
      name: "fallback",
    });
  });

  it("survives a device cycle in the registry", () => {
    expect(resolve_root_device(devices, "loop_a", "fallback").id).toBe(
      "loop_a",
    );
  });

  it("falls back when the device is missing or unset", () => {
    expect(resolve_root_device(devices, "unknown_id", "fallback")).toEqual({
      id: "unknown_id",
      name: "fallback",
    });
    expect(resolve_root_device(devices, "", "fallback")).toEqual({
      id: "",
      name: "fallback",
    });
  });
});

// ── Collector ────────────────────────────────────────────────────────────────

describe("collect_maintenance_items with sub devices", () => {
  it("attaches the root device to every item", () => {
    const items = collect_maintenance_items(makeHass());
    const head = items.find((i) => i.entity_id === "button.head1_calibrate")!;
    expect(head.device_name).toBe("SIMU-RSDOSE4 Head 1");
    expect(head.root_device_id).toBe("dev_dose");
    expect(head.root_device_name).toBe("SIMU-RSDOSE4");

    const ato = items.find((i) => i.entity_id === "button.ato_clean")!;
    expect(ato.root_device_id).toBe("dev_ato");
    expect(ato.root_device_name).toBe("SIMU-RSATO");

    const orphan = items.find((i) => i.entity_id === "button.orphan_task")!;
    expect(orphan.root_device_id).toBe("");
    expect(orphan.root_device_name).toBe("Ghost");
  });
});

// ── Device list ──────────────────────────────────────────────────────────────

describe("list_maintenance_devices", () => {
  it("lists each sub-device individually with its task count", () => {
    const devices = list_maintenance_devices(
      collect_maintenance_items(makeHass()),
    );
    expect(devices).toEqual([
      { id: "", name: "Ghost", count: 1, pump_type: null, pump_model: null },
      {
        id: "dev_ato",
        name: "SIMU-RSATO",
        count: 1,
        pump_type: null,
        pump_model: null,
      },
      {
        id: "dev_head1",
        name: "SIMU-RSDOSE4 Head 1",
        count: 1,
        pump_type: null,
        pump_model: null,
      },
      {
        id: "dev_head2",
        name: "SIMU-RSDOSE4 Head 2",
        count: 1,
        pump_type: null,
        pump_model: null,
      },
      {
        id: "dev_led",
        name: "SIMU-RSLED",
        count: 1,
        pump_type: null,
        pump_model: null,
      },
    ]);
  });

  it("returns an empty list without any task", () => {
    expect(list_maintenance_devices([])).toEqual([]);
  });
});

// ── Filter ───────────────────────────────────────────────────────────────────

describe("filter_by_devices", () => {
  let items: any[];

  beforeEach(() => {
    items = collect_maintenance_items(makeHass());
  });

  /** Entity ids kept by a given selection. */
  function kept(selection: any): string[] {
    return filter_by_devices(items, selection)
      .map((i) => i.entity_id)
      .sort();
  }

  it("keeps everything when no filter is set", () => {
    expect(filter_by_devices(items, null)).toHaveLength(5);
    expect(filter_by_devices(items, undefined)).toHaveLength(5);
    expect(filter_by_devices(items, [])).toHaveLength(5);
    // Only blank entries: still no filter
    expect(filter_by_devices(items, ["", ""])).toHaveLength(5);
  });

  it("filters on the root device name", () => {
    expect(kept(["SIMU-RSDOSE4", "SIMU-RSATO"])).toEqual([
      "button.ato_clean",
      "button.head1_calibrate",
      "button.head2_calibrate",
    ]);
  });

  it("filters on the root device id", () => {
    expect(kept(["dev_dose"])).toEqual([
      "button.head1_calibrate",
      "button.head2_calibrate",
    ]);
  });

  it("filters on a sub device name or id", () => {
    expect(kept(["SIMU-RSDOSE4 Head 2"])).toEqual(["button.head2_calibrate"]);
    expect(kept(["dev_head1"])).toEqual(["button.head1_calibrate"]);
  });

  it("keeps sub devices of a hand written parent name", () => {
    // `via_device` is not declared here, only the naming convention is.
    const flat = items.map((i) => ({
      ...i,
      root_device_id: i.device_id,
      root_device_name: i.device_name,
    }));
    const names = filter_by_devices(flat, ["SIMU-RSDOSE4"]).map(
      (i) => i.entity_id,
    );
    expect(names.sort()).toEqual([
      "button.head1_calibrate",
      "button.head2_calibrate",
    ]);
  });

  it("returns nothing for an unknown device", () => {
    expect(kept(["SIMU-NOPE"])).toEqual([]);
  });
});

// ── Element ──────────────────────────────────────────────────────────────────

describe("RSMaintenance device filter", () => {
  let elt: any;

  beforeEach(() => {
    elt = new RSMaintenance();
    elt.hass = makeHass();
  });

  it("shows every task without a filter", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelectorAll(".maint-row")).toHaveLength(5);
    document.body.removeChild(elt);
  });

  it("only renders the tasks of the selected devices", async () => {
    elt.setConfig({
      device: "__maintenance__",
      maintenance: { devices: ["SIMU-RSDOSE4", "SIMU-RSATO"] },
    });
    document.body.appendChild(elt);
    await elt.updateComplete;
    const titles = Array.from(
      elt.shadowRoot.querySelectorAll(".maint-group-title"),
    ).map((n: any) => n.textContent.trim().replace(/\s+/g, " "));
    expect(titles).toEqual([
      "SIMU-RSATO",
      "SIMU-RSDOSE4 Head 1",
      "SIMU-RSDOSE4 Head 2",
    ]);
    expect(elt.shadowRoot.querySelectorAll(".maint-row")).toHaveLength(3);
    document.body.removeChild(elt);
  });

  it("ignores non string entries of the configured filter", () => {
    elt.setConfig({ maintenance: { devices: ["SIMU-RSATO", 42, "", null] } });
    expect(elt._read_options().devices).toEqual(["SIMU-RSATO"]);
  });

  it("counts only the visible tasks in the badges", async () => {
    elt.setConfig({ maintenance: { devices: ["SIMU-RSATO"] } });
    document.body.appendChild(elt);
    await elt.updateComplete;
    // The overdue head 2 task belongs to a hidden device
    expect(elt.shadowRoot.querySelector(".maint-badge.overdue")).toBeNull();
    document.body.removeChild(elt);
  });

  it("skips the re-render when only a filtered out device changed", () => {
    elt.setConfig({ maintenance: { devices: ["SIMU-RSATO"] } });
    const hass = makeHass();
    elt._setting_hass(hass);
    const spy = vi.spyOn(elt, "requestUpdate");

    const changed = makeHass();
    changed.states["button.led_lens"].attributes.days_left = 4;
    elt._setting_hass(changed);
    expect(spy).not.toHaveBeenCalled();

    // ... but a change on a visible device still triggers one
    const visible = makeHass();
    visible.states["button.ato_clean"].attributes.days_left = 1;
    elt._setting_hass(visible);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  // ── Editor ────────────────────────────────────────────────────────────

  it("lists every device with its task count in the editor", async () => {
    elt.isEditorMode = true;
    document.body.appendChild(elt);
    await elt.updateComplete;
    const names = Array.from(
      elt.shadowRoot.querySelectorAll(".maint-device-name"),
    ).map((n: any) => n.textContent.trim());
    expect(names).toEqual([
      "Ghost",
      "SIMU-RSATO",
      "SIMU-RSDOSE4 Head 1",
      "SIMU-RSDOSE4 Head 2",
      "SIMU-RSLED",
    ]);
    const counts = Array.from(
      elt.shadowRoot.querySelectorAll(".maint-device-count"),
    ).map((n: any) => n.textContent.trim());
    expect(counts).toEqual(["1", "1", "1", "1", "1"]);
    // No selection yet: the hint is displayed instead of the reset button
    expect(elt.shadowRoot.querySelector(".maint-devices-clear")).toBeNull();
    document.body.removeChild(elt);
  });

  it("ticks the boxes of the configured devices", async () => {
    elt.setConfig({ maintenance: { devices: ["SIMU-RSDOSE4 Head 1"] } });
    elt.isEditorMode = true;
    document.body.appendChild(elt);
    await elt.updateComplete;
    const boxes = Array.from(
      elt.shadowRoot.querySelectorAll(".maint-device-option input"),
    ).map((n: any) => n.checked);
    expect(boxes).toEqual([false, false, true, false, false]);
    document.body.removeChild(elt);
  });

  it("emits config-changed when a device is ticked", async () => {
    elt.setConfig({ device: "__maintenance__" });
    elt.isEditorMode = true;
    document.body.appendChild(elt);
    await elt.updateComplete;

    let config: any = null;
    elt.addEventListener("config-changed", (e: any) => {
      config = e.detail.config;
    });

    // Third box: SIMU-RSDOSE4 Head 1
    const box = elt.shadowRoot.querySelectorAll(
      ".maint-device-option input",
    )[2];
    box.checked = true;
    box.dispatchEvent(new Event("change"));

    expect(config).toEqual({
      device: "__maintenance__",
      maintenance: { devices: ["SIMU-RSDOSE4 Head 1"] },
    });
    document.body.removeChild(elt);
  });

  it("removes a device from the filter when it is unticked", async () => {
    elt.setConfig({
      maintenance: { devices: ["SIMU-RSDOSE4 Head 1", "SIMU-RSATO"] },
    });
    elt.isEditorMode = true;
    document.body.appendChild(elt);
    await elt.updateComplete;

    let config: any = null;
    elt.addEventListener("config-changed", (e: any) => {
      config = e.detail.config;
    });

    const box = elt.shadowRoot.querySelectorAll(
      ".maint-device-option input",
    )[1];
    box.checked = false;
    box.dispatchEvent(new Event("change"));

    expect(config.maintenance.devices).toEqual(["SIMU-RSDOSE4 Head 1"]);
    document.body.removeChild(elt);
  });

  it("stores the device id when the device has no name", async () => {
    elt.setConfig({ device: "__maintenance__" });
    elt.isEditorMode = true;
    // Drop the name of the ATO: only its id is left to identify it
    elt.hass.devices.dev_ato.name = "";
    elt.hass.states["button.ato_clean"].attributes.friendly_name = "";
    document.body.appendChild(elt);
    await elt.updateComplete;

    let config: any = null;
    elt.addEventListener("config-changed", (e: any) => {
      config = e.detail.config;
    });

    // First box: the nameless device sorts before the others
    const box = elt.shadowRoot.querySelectorAll(
      ".maint-device-option input",
    )[0];
    box.checked = true;
    box.dispatchEvent(new Event("change"));

    expect(config.maintenance.devices).toEqual(["dev_ato"]);
    document.body.removeChild(elt);
  });

  it("offers a shortcut to clear the filter", async () => {
    elt.setConfig({ maintenance: { devices: ["SIMU-RSATO"] } });
    elt.isEditorMode = true;
    document.body.appendChild(elt);
    await elt.updateComplete;

    let config: any = null;
    elt.addEventListener("config-changed", (e: any) => {
      config = e.detail.config;
    });

    elt.shadowRoot.querySelector(".maint-devices-clear").click();
    expect(config.maintenance.devices).toEqual([]);
    document.body.removeChild(elt);
  });

  it("shows an empty state when no maintenance task exists", async () => {
    elt.hass = { states: {}, entities: {}, devices: {}, callService: vi.fn() };
    elt.isEditorMode = true;
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelector(".maint-devices")).toBeNull();
    expect(elt.shadowRoot.querySelector(".maint-empty")).toBeTruthy();
    document.body.removeChild(elt);
  });
});
