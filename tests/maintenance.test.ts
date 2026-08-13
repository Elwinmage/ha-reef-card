// Tests for the maintenance overview: collector helpers + RSMaintenance element

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  collect_maintenance_items,
  compute_percent,
  compute_status,
  group_by_device,
  has_maintenance_entities,
  humanize_task_key,
  is_maintenance_state,
  maintenance_counters,
  maintenance_signature,
  sort_maintenance_items,
  strip_device_prefix,
  warning_threshold,
} from "../src/utils/maintenance";

import { RSMaintenance } from "../src/devices/redsea/maintenance";
import { ReefCard } from "../src/card";
import { ReefCardEditor } from "../src/editor";
import { MAINTENANCE_DEVICE_ID, MAINTENANCE_TAG } from "../src/utils/constants";

// jsdom requires custom elements to be registered before they are constructed
if (!customElements.get(MAINTENANCE_TAG)) {
  customElements.define(MAINTENANCE_TAG, RSMaintenance as any);
}
if (!customElements.get("reef-card")) {
  customElements.define("reef-card", ReefCard as any);
}
if (!customElements.get("reef-card-editor")) {
  customElements.define("reef-card-editor", ReefCardEditor as any);
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * Build a maintenance button state object.
 */
function makeTask(
  entity_id: string,
  friendly_name: string,
  task_key: string,
  interval_days: number,
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
      interval_days,
      days_left,
      overdue: days_left !== null && days_left < 0,
      last_reset: days_left === null ? null : "2026-01-01T10:00:00+00:00",
      icon: "mdi:fan",
      notify: true,
      ...extra,
    },
  };
}

/**
 * Build a hass mock holding a set of maintenance entities.
 */
function makeHass(): any {
  const states: Record<string, any> = {
    "button.reefled_clean_lenses": makeTask(
      "button.reefled_clean_lenses",
      "ReefLed 160 Clean lenses",
      "led_lens",
      21,
      -3,
    ),
    "button.reefled_fan": makeTask(
      "button.reefled_fan",
      "ReefLed 160 Clean fan",
      "led_fan",
      180,
      120,
    ),
    "button.reefmat_carbon": makeTask(
      "button.reefmat_carbon",
      "ReefMat Replace carbon",
      "mat_carbon_replace",
      25,
      2,
      { notify: false },
    ),
    "button.reefrun_rotor": makeTask(
      "button.reefrun_rotor",
      "ReefRun Skimmer Clean rotor",
      "run_skim_rotor",
      135,
      null,
    ),
    // Not a maintenance entity
    "sensor.temperature": {
      entity_id: "sensor.temperature",
      state: "25.4",
      attributes: { friendly_name: "Temperature" },
    },
    // Companion notification switches (one per task)
    "switch.reefled_clean_lenses_notify": {
      entity_id: "switch.reefled_clean_lenses_notify",
      state: "on",
      attributes: {
        friendly_name: "ReefLed 160 Clean lenses (notifications)",
        reef_role: "maint_led_lens_notify",
      },
    },
    "switch.reefmat_carbon_notify": {
      entity_id: "switch.reefmat_carbon_notify",
      state: "off",
      attributes: {
        friendly_name: "ReefMat Replace carbon (notifications)",
        reef_role: "maint_mat_carbon_replace_notify",
      },
    },
    // RSRUN pump descriptors (values taken from the RUN dashboard fixture)
    "sensor.reefrun_pump_type": {
      entity_id: "sensor.reefrun_pump_type",
      state: "skimmer",
      attributes: { friendly_name: "ReefRun Skimmer Type", reef_role: "type" },
    },
    "sensor.reefrun_pump_model": {
      entity_id: "sensor.reefrun_pump_model",
      state: "rsk-900",
      attributes: {
        friendly_name: "ReefRun Skimmer Model",
        reef_role: "model",
      },
    },
    // Interval numbers: share the maint_ role prefix but are NOT tasks
    "number.reefled_clean_lenses_interval": {
      entity_id: "number.reefled_clean_lenses_interval",
      state: "3",
      attributes: {
        friendly_name: "ReefLed 160 Clean lenses (weeks)",
        reef_role: "maint_led_lens_interval_weeks",
        min: 1,
        max: 5,
        step: 1,
      },
    },
    "number.reefmat_carbon_interval": {
      entity_id: "number.reefmat_carbon_interval",
      state: "3",
      attributes: {
        friendly_name: "ReefMat Replace carbon (weeks)",
        reef_role: "maint_mat_carbon_replace_interval_weeks",
        min: 2,
        max: 5,
        step: 1,
      },
    },
    // Belongs to a device disabled in HA
    "button.disabled_task": makeTask(
      "button.disabled_task",
      "Old Led Clean lenses",
      "led_lens",
      21,
      5,
    ),
  };

  const entities: Record<string, any> = {
    "button.reefled_clean_lenses": { device_id: "dev_led" },
    "button.reefled_fan": { device_id: "dev_led" },
    "button.reefmat_carbon": { device_id: "dev_mat" },
    "button.reefrun_rotor": { device_id: "dev_run" },
    "switch.reefled_clean_lenses_notify": { device_id: "dev_led" },
    "switch.reefmat_carbon_notify": { device_id: "dev_mat" },
    "number.reefled_clean_lenses_interval": { device_id: "dev_led" },
    "number.reefmat_carbon_interval": { device_id: "dev_mat" },
    "sensor.reefrun_pump_type": { device_id: "dev_run" },
    "sensor.reefrun_pump_model": { device_id: "dev_run" },
    "button.disabled_task": { device_id: "dev_off" },
  };

  const devices: Record<string, any> = {
    dev_led: {
      id: "dev_led",
      name: "ReefLed 160",
      model: "RSLED160",
      identifiers: [["redsea", "rsled160_1"]],
      primary_config_entry: "entry_led",
      disabled_by: null,
    },
    dev_mat: {
      id: "dev_mat",
      name: "ReefMat",
      model: "RSMAT",
      identifiers: [["redsea", "rsmat_1"]],
      primary_config_entry: "entry_mat",
      disabled_by: null,
    },
    dev_run: {
      id: "dev_run",
      name: "ReefRun Skimmer",
      model: "RSRUN",
      identifiers: [["redsea", "rsrun_1_pump_1"]],
      primary_config_entry: "entry_run",
      disabled_by: null,
    },
    dev_off: {
      id: "dev_off",
      name: "Old Led",
      model: "RSLED90",
      identifiers: [["redsea", "rsled90_1"]],
      primary_config_entry: "entry_off",
      disabled_by: "user",
    },
  };

  return { states, entities, devices, callService: vi.fn() };
}

// ── Pure helpers ─────────────────────────────────────────────────────────────

describe("maintenance helpers", () => {
  it("humanizes a task key", () => {
    expect(humanize_task_key("run_skim_venturi")).toBe("Run skim venturi");
    expect(humanize_task_key("")).toBe("");
  });

  it("strips the device prefix from a friendly name", () => {
    expect(strip_device_prefix("ReefLed 160 Clean lenses", "ReefLed 160")).toBe(
      "Clean lenses",
    );
    expect(strip_device_prefix("Clean lenses", "ReefMat")).toBe("Clean lenses");
    expect(strip_device_prefix("", "ReefMat")).toBe("");
  });

  it("computes the warning threshold with a one day floor", () => {
    expect(warning_threshold(180)).toBe(36);
    expect(warning_threshold(3)).toBe(1);
    expect(warning_threshold(0)).toBe(0);
  });

  it("derives the status from the remaining days", () => {
    expect(compute_status(null, 21)).toBe("never");
    expect(compute_status(-1, 21)).toBe("overdue");
    expect(compute_status(2, 21)).toBe("warning");
    expect(compute_status(20, 21)).toBe("ok");
  });

  it("computes the elapsed percentage clamped to [0,100]", () => {
    expect(compute_percent(null, 21)).toBe(0);
    expect(compute_percent(10, 0)).toBe(0);
    expect(compute_percent(21, 21)).toBe(0);
    expect(compute_percent(0, 20)).toBe(100);
    expect(compute_percent(10, 20)).toBe(50);
    expect(compute_percent(-50, 20)).toBe(100);
  });

  it("detects maintenance state objects", () => {
    expect(
      is_maintenance_state(makeTask("button.x", "X", "led_fan", 10, 5)),
    ).toBe(true);
    expect(is_maintenance_state({ attributes: {} })).toBe(false);
    expect(is_maintenance_state(null)).toBe(false);
    expect(
      is_maintenance_state({ attributes: { reef_role: "sensor_temp" } }),
    ).toBe(false);
    expect(is_maintenance_state({ attributes: { reef_role: "maint_x" } })).toBe(
      false,
    );
  });
});

// ── Collector ────────────────────────────────────────────────────────────────

describe("collect_maintenance_items", () => {
  it("returns an empty list without hass", () => {
    expect(collect_maintenance_items(null)).toEqual([]);
    expect(collect_maintenance_items({} as any)).toEqual([]);
  });

  it("collects only maintenance entities of enabled devices", () => {
    const items = collect_maintenance_items(makeHass());
    expect(items).toHaveLength(4);
    expect(items.map((i) => i.entity_id)).not.toContain("button.disabled_task");
    expect(items.map((i) => i.entity_id)).not.toContain("sensor.temperature");
  });

  it("resolves names, device and derived values", () => {
    const items = collect_maintenance_items(makeHass());
    const lens = items.find(
      (i) => i.entity_id === "button.reefled_clean_lenses",
    )!;

    expect(lens.name).toBe("Clean lenses");
    expect(lens.device_name).toBe("ReefLed 160");
    expect(lens.model).toBe("RSLED160");
    expect(lens.task_key).toBe("led_lens");
    expect(lens.role).toBe("maint_led_lens");
    expect(lens.icon).toBe("mdi:fan");
    expect(lens.overdue).toBe(true);
    expect(lens.overdue_days).toBe(3);
    expect(lens.status).toBe("overdue");
    expect(lens.percent).toBe(100);
  });

  it("flags never-reset tasks", () => {
    const items = collect_maintenance_items(makeHass());
    const rotor = items.find((i) => i.entity_id === "button.reefrun_rotor")!;
    expect(rotor.days_left).toBeNull();
    expect(rotor.status).toBe("never");
    expect(rotor.overdue).toBe(false);
    expect(rotor.percent).toBe(0);
    expect(rotor.last_reset).toBeNull();
  });

  it("honours a custom warning ratio", () => {
    const hass = makeHass();
    const strict = collect_maintenance_items(hass, { warning_ratio: 0.9 });
    const fan = strict.find((i) => i.entity_id === "button.reefled_fan")!;
    // 120 days left out of 180 -> warning window becomes 162 days
    expect(fan.status).toBe("warning");
  });

  it("falls back on the task key when friendly_name is missing", () => {
    const hass = makeHass();
    delete hass.states["button.reefmat_carbon"].attributes.friendly_name;
    const items = collect_maintenance_items(hass);
    const mat = items.find((i) => i.entity_id === "button.reefmat_carbon")!;
    expect(mat.name).toBe("Mat carbon replace");
  });

  it("survives a missing registry entry", () => {
    const hass = makeHass();
    delete hass.entities["button.reefmat_carbon"];
    const items = collect_maintenance_items(hass);
    const mat = items.find((i) => i.entity_id === "button.reefmat_carbon")!;
    expect(mat.device_id).toBe("");
    expect(mat.device_name).toBe("");
  });

  it("prefers the user defined device name", () => {
    const hass = makeHass();
    hass.devices.dev_mat.name_by_user = "Rouleau";
    const items = collect_maintenance_items(hass);
    const mat = items.find((i) => i.entity_id === "button.reefmat_carbon")!;
    expect(mat.device_name).toBe("Rouleau");
  });

  it("tolerates non numeric attributes", () => {
    const hass = makeHass();
    hass.states["button.reefmat_carbon"].attributes.interval_days = "n/a";
    hass.states["button.reefmat_carbon"].attributes.days_left = "unknown";
    const items = collect_maintenance_items(hass);
    const mat = items.find((i) => i.entity_id === "button.reefmat_carbon")!;
    expect(mat.interval_days).toBe(0);
    expect(mat.days_left).toBeNull();
  });
});

// ── Sorting / grouping ───────────────────────────────────────────────────────

describe("notification switch handling", () => {
  it("ignores the interval number entity sharing the maint_ prefix", () => {
    const items = collect_maintenance_items(makeHass());
    expect(items.map((i) => i.entity_id)).not.toContain(
      "number.reefled_clean_lenses_interval",
    );
    expect(items).toHaveLength(4);
  });

  it("ignores the notification switches themselves", () => {
    const items = collect_maintenance_items(makeHass());
    expect(items.some((i) => i.entity_id.startsWith("switch."))).toBe(false);
  });

  it("reads the notify flag from the button", () => {
    const items = collect_maintenance_items(makeHass());
    const mat = items.find((i) => i.entity_id === "button.reefmat_carbon")!;
    const led = items.find(
      (i) => i.entity_id === "button.reefled_clean_lenses",
    )!;
    expect(mat.notify).toBe(false);
    expect(led.notify).toBe(true);
  });

  it("treats a missing notify attribute as enabled", () => {
    const hass = makeHass();
    delete hass.states["button.reefled_fan"].attributes.notify;
    const items = collect_maintenance_items(hass);
    const fan = items.find((i) => i.entity_id === "button.reefled_fan")!;
    expect(fan.notify).toBe(true);
  });

  it("resolves the companion switch of the same device", () => {
    const items = collect_maintenance_items(makeHass());
    const led = items.find(
      (i) => i.entity_id === "button.reefled_clean_lenses",
    )!;
    const mat = items.find((i) => i.entity_id === "button.reefmat_carbon")!;
    const run = items.find((i) => i.entity_id === "button.reefrun_rotor")!;
    expect(led.notify_entity_id).toBe("switch.reefled_clean_lenses_notify");
    expect(mat.notify_entity_id).toBe("switch.reefmat_carbon_notify");
    // No switch exposed for this one
    expect(run.notify_entity_id).toBeNull();
  });

  it("does not cross-match switches of another device", () => {
    const hass = makeHass();
    // Same role, different device: must not be picked up by ReefLed
    hass.states["switch.other_led_notify"] = {
      entity_id: "switch.other_led_notify",
      state: "on",
      attributes: { reef_role: "maint_led_lens_notify" },
    };
    hass.entities["switch.other_led_notify"] = { device_id: "dev_run" };
    const items = collect_maintenance_items(hass);
    const led = items.find(
      (i) => i.entity_id === "button.reefled_clean_lenses",
    )!;
    expect(led.notify_entity_id).toBe("switch.reefled_clean_lenses_notify");
  });

  it("changes the signature when notify flips", () => {
    const a = maintenance_signature(collect_maintenance_items(makeHass()));
    const hass = makeHass();
    hass.states["button.reefmat_carbon"].attributes.notify = true;
    expect(maintenance_signature(collect_maintenance_items(hass))).not.toBe(a);
  });
});

describe("RSRUN pump descriptor", () => {
  it("attaches the pump type and model to the task", () => {
    const items = collect_maintenance_items(makeHass());
    const run = items.find((i) => i.entity_id === "button.reefrun_rotor")!;
    expect(run.pump_type).toBe("skimmer");
    expect(run.pump_model).toBe("rsk-900");
  });

  it("leaves non-pump devices untouched", () => {
    const items = collect_maintenance_items(makeHass());
    const led = items.find(
      (i) => i.entity_id === "button.reefled_clean_lenses",
    )!;
    expect(led.pump_type).toBeNull();
    expect(led.pump_model).toBeNull();
  });

  it("requires BOTH type and model on the same device", () => {
    const hass = makeHass();
    delete hass.states["sensor.reefrun_pump_model"];
    const items = collect_maintenance_items(hass);
    const run = items.find((i) => i.entity_id === "button.reefrun_rotor")!;
    expect(run.pump_type).toBeNull();
  });

  it("ignores a model role carried by a non-sensor entity", () => {
    const hass = makeHass();
    // select.model exists on other Red Sea devices and must not match
    hass.states["select.reefled_model"] = {
      entity_id: "select.reefled_model",
      state: "RSLED160",
      attributes: { reef_role: "model" },
    };
    hass.states["sensor.reefled_type"] = {
      entity_id: "sensor.reefled_type",
      state: "led",
      attributes: { reef_role: "type" },
    };
    hass.entities["select.reefled_model"] = { device_id: "dev_led" };
    hass.entities["sensor.reefled_type"] = { device_id: "dev_led" };
    const items = collect_maintenance_items(hass);
    const led = items.find(
      (i) => i.entity_id === "button.reefled_clean_lenses",
    )!;
    expect(led.pump_type).toBeNull();
    expect(led.pump_model).toBeNull();
  });

  it("ignores unavailable sensor states", () => {
    const hass = makeHass();
    hass.states["sensor.reefrun_pump_model"].state = "unavailable";
    const items = collect_maintenance_items(hass);
    const run = items.find((i) => i.entity_id === "button.reefrun_rotor")!;
    expect(run.pump_type).toBeNull();
  });

  it("carries the descriptor onto the device group", () => {
    const items = sort_maintenance_items(
      collect_maintenance_items(makeHass()),
      "device",
    );
    const group = group_by_device(items).find(
      (g) => g.device_id === "dev_run",
    )!;
    expect(group.pump_type).toBe("skimmer");
    expect(group.pump_model).toBe("rsk-900");
  });
});

describe("interval number handling", () => {
  it("resolves the companion interval number and its unit", () => {
    const items = collect_maintenance_items(makeHass());
    const led = items.find(
      (i) => i.entity_id === "button.reefled_clean_lenses",
    )!;
    expect(led.interval_entity_id).toBe("number.reefled_clean_lenses_interval");
    expect(led.interval_unit).toBe("weeks");
    expect(led.interval_value).toBe(3);
    expect(led.interval_min).toBe(1);
    expect(led.interval_max).toBe(5);
    expect(led.interval_step).toBe(1);
  });

  it("reads a days-based interval without converting it", () => {
    const hass = makeHass();
    hass.states["number.dose_calib"] = {
      entity_id: "number.dose_calib",
      state: "90",
      attributes: {
        reef_role: "maint_mat_carbon_replace_interval_days",
        min: 80,
        max: 120,
        step: 1,
      },
    };
    hass.entities["number.dose_calib"] = { device_id: "dev_mat" };
    // The days-based entity wins: same base role, later in the scan
    const items = collect_maintenance_items(hass);
    const mat = items.find((i) => i.entity_id === "button.reefmat_carbon")!;
    expect(["days", "weeks"]).toContain(mat.interval_unit);
    expect(mat.interval_entity_id).toBeTruthy();
  });

  it("leaves interval fields null when no number is exposed", () => {
    const items = collect_maintenance_items(makeHass());
    const run = items.find((i) => i.entity_id === "button.reefrun_rotor")!;
    expect(run.interval_entity_id).toBeNull();
    expect(run.interval_unit).toBeNull();
    expect(run.interval_value).toBeNull();
    expect(run.interval_step).toBe(1);
  });

  it("ignores a number whose role has no interval infix", () => {
    const hass = makeHass();
    hass.states["number.weird"] = {
      entity_id: "number.weird",
      state: "5",
      attributes: { reef_role: "maint_led_lens_something" },
    };
    hass.entities["number.weird"] = { device_id: "dev_led" };
    const items = collect_maintenance_items(hass);
    const led = items.find(
      (i) => i.entity_id === "button.reefled_clean_lenses",
    )!;
    expect(led.interval_entity_id).toBe("number.reefled_clean_lenses_interval");
  });

  it("ignores an unknown display unit", () => {
    const hass = makeHass();
    hass.states["number.reefled_clean_lenses_interval"].attributes.reef_role =
      "maint_led_lens_interval_fortnights";
    const items = collect_maintenance_items(hass);
    const led = items.find(
      (i) => i.entity_id === "button.reefled_clean_lenses",
    )!;
    expect(led.interval_entity_id).toBeNull();
  });

  it("tolerates an unavailable number state", () => {
    const hass = makeHass();
    hass.states["number.reefled_clean_lenses_interval"].state = "unavailable";
    const items = collect_maintenance_items(hass);
    const led = items.find(
      (i) => i.entity_id === "button.reefled_clean_lenses",
    )!;
    expect(led.interval_value).toBeNull();
    expect(led.interval_entity_id).toBeTruthy();
  });

  it("changes the signature when the interval is edited", () => {
    const a = maintenance_signature(collect_maintenance_items(makeHass()));
    const hass = makeHass();
    hass.states["number.reefled_clean_lenses_interval"].state = "4";
    expect(maintenance_signature(collect_maintenance_items(hass))).not.toBe(a);
  });
});

describe("sort_maintenance_items", () => {
  it("sorts by due date, never-reset tasks last", () => {
    const items = collect_maintenance_items(makeHass());
    const sorted = sort_maintenance_items(items, "due");
    expect(sorted.map((i) => i.entity_id)).toEqual([
      "button.reefled_clean_lenses", // -3
      "button.reefmat_carbon", // 2
      "button.reefled_fan", // 120
      "button.reefrun_rotor", // null
    ]);
  });

  it("sorts by device then by due date", () => {
    const items = collect_maintenance_items(makeHass());
    const sorted = sort_maintenance_items(items, "device");
    expect(sorted.map((i) => i.device_name)).toEqual([
      "ReefLed 160",
      "ReefLed 160",
      "ReefMat",
      "ReefRun Skimmer",
    ]);
    // Inside ReefLed 160, the overdue task comes first
    expect(sorted[0]!.entity_id).toBe("button.reefled_clean_lenses");
  });

  it("does not modify the input array", () => {
    const items = collect_maintenance_items(makeHass());
    const before = items.map((i) => i.entity_id);
    sort_maintenance_items(items, "due");
    expect(items.map((i) => i.entity_id)).toEqual(before);
  });

  it("falls back on the task name for equal deadlines", () => {
    const items = [
      { device_name: "A", name: "Zeta", days_left: 5 },
      { device_name: "A", name: "Alpha", days_left: 5 },
    ] as any;
    expect(sort_maintenance_items(items, "due").map((i) => i.name)).toEqual([
      "Alpha",
      "Zeta",
    ]);
  });
});

describe("group_by_device", () => {
  it("groups items preserving the incoming order", () => {
    const items = sort_maintenance_items(
      collect_maintenance_items(makeHass()),
      "device",
    );
    const groups = group_by_device(items);
    expect(groups.map((g) => g.device_name)).toEqual([
      "ReefLed 160",
      "ReefMat",
      "ReefRun Skimmer",
    ]);
    expect(groups[0]!.items).toHaveLength(2);
  });

  it("returns an empty list for no item", () => {
    expect(group_by_device([])).toEqual([]);
  });
});

describe("maintenance_counters", () => {
  it("counts items per status", () => {
    const items = collect_maintenance_items(makeHass());
    expect(maintenance_counters(items)).toEqual({
      total: 4,
      overdue: 1,
      warning: 1,
      never: 1,
    });
  });
});

describe("maintenance_signature", () => {
  it("is stable for identical data and changes with the values", () => {
    const a = collect_maintenance_items(makeHass());
    const b = collect_maintenance_items(makeHass());
    expect(maintenance_signature(a)).toBe(maintenance_signature(b));

    const hass = makeHass();
    hass.states["button.reefmat_carbon"].attributes.days_left = 1;
    expect(maintenance_signature(collect_maintenance_items(hass))).not.toBe(
      maintenance_signature(a),
    );
  });
});

describe("has_maintenance_entities", () => {
  it("detects the presence of maintenance entities", () => {
    expect(has_maintenance_entities(makeHass())).toBe(true);
    expect(has_maintenance_entities(null)).toBe(false);
    expect(
      has_maintenance_entities({ states: { "sensor.a": {} } } as any),
    ).toBe(false);
  });
});

// ── Element ──────────────────────────────────────────────────────────────────

describe("RSMaintenance element", () => {
  let elt: any;

  beforeEach(() => {
    elt = new RSMaintenance();
    elt.hass = makeHass();
  });

  it("exposes the maintenance marker used by the card", () => {
    expect(elt.is_maintenance).toBe(true);
  });

  it("has no HA entity to populate", () => {
    expect(() => elt._populate_entities()).not.toThrow();
  });

  it("renders the header, the toolbar and every task", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    const html = elt.shadowRoot.innerHTML;
    expect(html).toContain("maint-header");
    expect(html).toContain("maint-toolbar");
    expect(elt.shadowRoot.querySelectorAll(".maint-row")).toHaveLength(4);
    document.body.removeChild(elt);
  });

  it("groups rows by device and strips the device prefix from names", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    const titles = Array.from(
      elt.shadowRoot.querySelectorAll(".maint-group-title"),
    ).map((n: any) => n.textContent.trim().replace(/\s+/g, " "));
    // The RSRUN group carries its pump descriptor, the others do not.
    expect(titles).toEqual([
      "ReefLed 160",
      "ReefMat",
      "ReefRun Skimmer (skimmer 900)",
    ]);
    const names = Array.from(
      elt.shadowRoot.querySelectorAll(".maint-name"),
    ).map((n: any) => n.textContent.trim());
    expect(names[0]).toBe("Clean lenses");
    // No device suffix inside a group
    expect(
      elt.shadowRoot.querySelectorAll(".maint-group-title .maint-device"),
    ).toHaveLength(0);
    document.body.removeChild(elt);
  });

  it("shows a flat list with the device name when sorting by due date", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    elt._set_sort("due");
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelectorAll(".maint-group-title")).toHaveLength(
      0,
    );
    const devices = Array.from(
      elt.shadowRoot.querySelectorAll(".maint-device"),
    ).map((n: any) => n.textContent.trim().replace(/\s+/g, " "));
    expect(devices).toEqual([
      "- ReefLed 160",
      "- ReefMat",
      "- ReefLed 160",
      "- ReefRun Skimmer (skimmer 900)",
    ]);
    document.body.removeChild(elt);
  });

  it("colors the bars and fills them according to the status", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    elt._set_sort("due");
    await elt.updateComplete;
    const bars = Array.from(elt.shadowRoot.querySelectorAll(".maint-bar-fill"));
    // overdue -3d -> full red, 2/25 -> orange 92%, 120/180 -> green 33%, never -> grey 0%
    expect((bars[0] as any).className).toContain("overdue");
    expect((bars[0] as any).style.width).toBe("100%");
    expect((bars[1] as any).className).toContain("warning");
    expect((bars[1] as any).style.width).toBe("92%");
    expect((bars[2] as any).className).toContain("ok");
    expect((bars[2] as any).style.width).toBe("33%");
    expect((bars[3] as any).className).toContain("never");
    expect((bars[3] as any).style.width).toBe("0%");
    document.body.removeChild(elt);
  });

  it("renders the overdue label with a plus sign", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    const overdue = elt.shadowRoot.querySelector(".maint-remaining.overdue");
    expect(overdue.textContent.trim()).toBe("+3 d");
    document.body.removeChild(elt);
  });

  it("filters out up to date tasks when the filter is on", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelectorAll(".maint-row")).toHaveLength(4);
    elt._toggle_hide_ok();
    await elt.updateComplete;
    // The 120 days left task is dropped
    expect(elt.shadowRoot.querySelectorAll(".maint-row")).toHaveLength(3);
    document.body.removeChild(elt);
  });

  it("marks the active sort button", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelector("#sort-device").className).toContain(
      "active",
    );
    elt._set_sort("due");
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelector("#sort-due").className).toContain(
      "active",
    );
    document.body.removeChild(elt);
  });

  it("hides the reset button when show_reset is false", async () => {
    elt.setConfig({ maintenance: { show_reset: false } });
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelectorAll(".maint-done")).toHaveLength(0);
    document.body.removeChild(elt);
  });

  it("defaults to the device sort mode and switches on demand", () => {
    elt.render();
    expect(elt._sort).toBe("device");
    elt._set_sort("due");
    expect(elt._sort).toBe("due");
    // Setting the same mode twice is a no-op
    elt._set_sort("due");
    expect(elt._sort).toBe("due");
  });

  it("reads the sort mode from the user configuration", () => {
    elt.setConfig({ maintenance: { sort: "due", hide_ok: true } });
    elt.render();
    expect(elt._sort).toBe("due");
    expect(elt._hide_ok).toBe(true);
  });

  it("ignores an invalid sort mode and an out of range ratio", () => {
    elt.setConfig({ maintenance: { sort: "nope", warning_ratio: 12 } });
    const options = elt._read_options();
    expect(options.sort).toBe("device");
    expect(options.warning_ratio).toBe(0.2);
  });

  it("toggles the up-to-date filter", () => {
    expect(elt._hide_ok).toBe(false);
    elt._toggle_hide_ok();
    expect(elt._hide_ok).toBe(true);
  });

  it("hides up to date tasks when asked", () => {
    elt.setConfig({ maintenance: { hide_ok: true } });
    elt.render();
    const shown = elt._hide_ok;
    expect(shown).toBe(true);
  });

  it("formats the remaining label", () => {
    expect(elt._remaining_label({ days_left: null } as any)).toContain("never");
    expect(
      elt._remaining_label({ days_left: -4, overdue_days: 4 } as any),
    ).toMatch(/^\+4 /);
    expect(elt._remaining_label({ days_left: 0 } as any)).toContain("today");
    expect(elt._remaining_label({ days_left: 7 } as any)).toMatch(/^7 /);
  });

  it("builds a row tooltip with interval and last reset", () => {
    const title = elt._row_title({
      device_name: "ReefLed 160",
      name: "Clean lenses",
      interval_days: 21,
      last_reset: "2026-01-01T10:00:00+00:00",
    } as any);
    expect(title).toContain("ReefLed 160 - Clean lenses");
    expect(title).toContain("21");
  });

  it("ignores an unparsable last_reset in the tooltip", () => {
    const title = elt._row_title({
      device_name: "D",
      name: "T",
      interval_days: 0,
      last_reset: "not-a-date",
    } as any);
    expect(title).toBe("D - T");
  });

  it("presses the button entity when marking a task done", () => {
    const hass = makeHass();
    elt.hass = hass;
    elt._mark_done({ entity_id: "button.reefmat_carbon" } as any);
    expect(hass.callService).toHaveBeenCalledWith("button", "press", {
      entity_id: "button.reefmat_carbon",
    });
  });

  it("dispatches hass-more-info when a row is activated", () => {
    const spy = vi.fn();
    elt.addEventListener("hass-more-info", spy);
    elt._more_info({ entity_id: "button.reefled_fan" } as any);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].detail.entityId).toBe("button.reefled_fan");
  });

  it("only re-renders when the maintenance data changed", () => {
    const spy = vi.spyOn(elt, "requestUpdate");
    const hass = makeHass();
    elt.hass = hass;
    const first = spy.mock.calls.length;
    // Same data -> no new render
    elt.hass = makeHass();
    expect(spy.mock.calls.length).toBe(first);
    // Changed data -> render
    const changed = makeHass();
    changed.states["button.reefmat_carbon"].attributes.days_left = 15;
    elt.hass = changed;
    expect(spy.mock.calls.length).toBeGreaterThan(first);
  });

  it("renders an empty state without any task", async () => {
    elt.hass = { states: {}, entities: {}, devices: {}, callService: vi.fn() };
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelectorAll(".maint-row")).toHaveLength(0);
    expect(elt.shadowRoot.querySelector(".maint-empty")).toBeTruthy();
    document.body.removeChild(elt);
  });

  it("renders a bell only when a switch is exposed", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    // 2 of the 4 tasks have a companion switch in the fixture
    expect(elt.shadowRoot.querySelectorAll(".maint-bell")).toHaveLength(2);
    expect(elt.shadowRoot.querySelectorAll(".maint-bell.off")).toHaveLength(1);
    document.body.removeChild(elt);
  });

  it("dims the muted row", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelectorAll(".maint-row.muted")).toHaveLength(1);
    document.body.removeChild(elt);
  });

  it("toggles the companion switch when clicking the bell", async () => {
    const hass = makeHass();
    elt.hass = hass;
    document.body.appendChild(elt);
    await elt.updateComplete;
    elt.shadowRoot.querySelector(".maint-bell").click();
    expect(hass.callService).toHaveBeenCalledWith("switch", "toggle", {
      entity_id: expect.stringContaining("_notify"),
    });
    document.body.removeChild(elt);
  });

  it("does nothing when the task has no switch", () => {
    const hass = makeHass();
    elt.hass = hass;
    elt._toggle_notify({ notify_entity_id: null } as any);
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("hides the bells when show_notify is false", async () => {
    elt.setConfig({ maintenance: { show_notify: false } });
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelectorAll(".maint-bell")).toHaveLength(0);
    document.body.removeChild(elt);
  });

  it("shows the interval button only when a number is exposed", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelectorAll(".maint-tune")).toHaveLength(2);
    document.body.removeChild(elt);
  });

  it("expands the interval editor on demand", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelector(".maint-editor")).toBeNull();
    elt.shadowRoot.querySelector(".maint-tune").click();
    await elt.updateComplete;
    const editor = elt.shadowRoot.querySelector(".maint-editor");
    expect(editor).toBeTruthy();
    const slider = editor.querySelector(".maint-slider");
    expect(slider.getAttribute("min")).toBe("1");
    expect(slider.getAttribute("max")).toBe("5");
    expect(editor.textContent).toContain("weeks");
    document.body.removeChild(elt);
  });

  it("keeps only one editor open at a time", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    const tunes = elt.shadowRoot.querySelectorAll(".maint-tune");
    tunes[0].click();
    await elt.updateComplete;
    tunes[1].click();
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelectorAll(".maint-editor")).toHaveLength(1);
    document.body.removeChild(elt);
  });

  it("collapses the editor when clicking the button again", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    const tune = elt.shadowRoot.querySelector(".maint-tune");
    tune.click();
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelector(".maint-editor")).toBeTruthy();
    elt.shadowRoot.querySelector(".maint-tune").click();
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelector(".maint-editor")).toBeNull();
    document.body.removeChild(elt);
  });

  it("writes the new interval through the number entity", async () => {
    const hass = makeHass();
    elt.hass = hass;
    document.body.appendChild(elt);
    await elt.updateComplete;
    elt.shadowRoot.querySelector(".maint-tune").click();
    await elt.updateComplete;
    const slider = elt.shadowRoot.querySelector(".maint-slider");
    slider.value = "4";
    slider.dispatchEvent(new Event("change"));
    expect(hass.callService).toHaveBeenCalledWith("number", "set_value", {
      entity_id: expect.stringContaining("interval"),
      value: 4,
    });
    document.body.removeChild(elt);
  });

  it("clamps the written value to the entity bounds", () => {
    const hass = makeHass();
    elt.hass = hass;
    const item = {
      interval_entity_id: "number.x",
      interval_min: 2,
      interval_max: 5,
    } as any;
    elt._set_interval(item, 99);
    expect(hass.callService).toHaveBeenLastCalledWith("number", "set_value", {
      entity_id: "number.x",
      value: 5,
    });
    elt._set_interval(item, -1);
    expect(hass.callService).toHaveBeenLastCalledWith("number", "set_value", {
      entity_id: "number.x",
      value: 2,
    });
  });

  it("ignores an interval write without a number entity", () => {
    const hass = makeHass();
    elt.hass = hass;
    elt._set_interval({ interval_entity_id: null } as any, 4);
    elt._set_interval(
      { interval_entity_id: "number.x", interval_min: null } as any,
      NaN,
    );
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("labels each supported unit", () => {
    expect(elt._unit_label("days")).toBeTruthy();
    expect(elt._unit_label("weeks")).toBeTruthy();
    expect(elt._unit_label("months")).toBeTruthy();
    expect(elt._unit_label(null)).toBe("");
  });

  it("hides the interval editor when show_interval is false", async () => {
    elt.setConfig({ maintenance: { show_interval: false } });
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelectorAll(".maint-tune")).toHaveLength(0);
    document.body.removeChild(elt);
  });

  it("appends the pump descriptor to the group header", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    const titles = Array.from(
      elt.shadowRoot.querySelectorAll(".maint-group-title"),
    ).map((n: any) => n.textContent.trim().replace(/\s+/g, " "));
    expect(titles).toContain("ReefRun Skimmer (skimmer 900)");
    // Non-pump devices keep a plain name
    expect(titles).toContain("ReefLed 160");
    document.body.removeChild(elt);
  });

  it("appends the pump descriptor to the row subtitle in due mode", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    elt._set_sort("due");
    await elt.updateComplete;
    const devices = Array.from(
      elt.shadowRoot.querySelectorAll(".maint-device"),
    ).map((n: any) => n.textContent.trim().replace(/\s+/g, " "));
    expect(devices).toContain("- ReefRun Skimmer (skimmer 900)");
    document.body.removeChild(elt);
  });

  it("keeps only the trailing figure of the model", () => {
    expect(elt._pump_suffix("return", "return-12000")).toBe(" (return 12000)");
    expect(elt._pump_suffix("skimmer", "rsk-900")).toBe(" (skimmer 900)");
  });

  it("falls back on the raw model when it holds no figure", () => {
    expect(elt._pump_suffix("return", "custom")).toBe(" (return custom)");
  });

  it("falls back on the raw type when it is not translated", () => {
    expect(elt._pump_suffix("wavemaker", "rsw-45")).toBe(" (wavemaker 45)");
  });

  it("returns no suffix without pump details", () => {
    expect(elt._pump_suffix(null, null)).toBe("");
    expect(elt._device_label("ReefLed 160", null, null)).toBe("ReefLed 160");
  });

  it("handles a type without a model and the reverse", () => {
    expect(elt._pump_suffix("return", null)).toBe(" (return)");
    expect(elt._pump_suffix(null, "rsk-900")).toBe(" (900)");
  });

  // ── Muted filter ──────────────────────────────────────────────────────

  it("shows every task by default, muted ones included", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt._hide_muted).toBe(false);
    // 4 tasks, one of which (carbon) has notify: false
    expect(elt.shadowRoot.querySelectorAll(".maint-row")).toHaveLength(4);
    document.body.removeChild(elt);
  });

  it("hides muted tasks when the toolbar button is pressed", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    elt.shadowRoot.querySelector("#hide-muted").click();
    await elt.updateComplete;
    expect(elt._hide_muted).toBe(true);
    expect(elt.shadowRoot.querySelectorAll(".maint-row")).toHaveLength(3);
    // No muted row is left
    expect(elt.shadowRoot.querySelectorAll(".maint-row.muted")).toHaveLength(0);
    document.body.removeChild(elt);
  });

  it("restores muted tasks on a second press", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    const button = () => elt.shadowRoot.querySelector("#hide-muted");
    button().click();
    await elt.updateComplete;
    button().click();
    await elt.updateComplete;
    expect(elt._hide_muted).toBe(false);
    expect(elt.shadowRoot.querySelectorAll(".maint-row")).toHaveLength(4);
    document.body.removeChild(elt);
  });

  it("marks the muted filter button as active and flips its label", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelector("#hide-muted").className).not.toContain(
      "active",
    );
    const before = elt.shadowRoot
      .querySelector("#hide-muted")
      .textContent.trim();
    elt.shadowRoot.querySelector("#hide-muted").click();
    await elt.updateComplete;
    const after = elt.shadowRoot.querySelector("#hide-muted");
    expect(after.className).toContain("active");
    expect(after.textContent.trim()).not.toBe(before);
    document.body.removeChild(elt);
  });

  it("takes the initial muted filter state from the configuration", async () => {
    elt.setConfig({ maintenance: { hide_muted: true } });
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt._hide_muted).toBe(true);
    expect(elt.shadowRoot.querySelectorAll(".maint-row")).toHaveLength(3);
    document.body.removeChild(elt);
  });

  it("combines the muted filter with the up-to-date filter", async () => {
    elt.setConfig({ maintenance: { hide_ok: true, hide_muted: true } });
    document.body.appendChild(elt);
    await elt.updateComplete;
    // ok task (fan, 120 d) dropped by hide_ok, carbon dropped by hide_muted
    const names = Array.from(
      elt.shadowRoot.querySelectorAll(".maint-name"),
    ).map((n: any) => n.textContent.trim());
    expect(names).toEqual(["Clean lenses", "Clean rotor"]);
    document.body.removeChild(elt);
  });

  // ── Editor ────────────────────────────────────────────────────────────

  it("renders the options form in editor mode", async () => {
    elt.isEditorMode = true;
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelector(".maint-editor-form")).toBeTruthy();
    // The task list is replaced by the form
    expect(elt.shadowRoot.querySelectorAll(".maint-row")).toHaveLength(0);
    document.body.removeChild(elt);
  });

  it("reflects the stored default in the editor switch", async () => {
    elt.setConfig({ maintenance: { hide_muted: true } });
    elt.isEditorMode = true;
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelector("#hide_muted").checked).toBe(true);
    document.body.removeChild(elt);
  });

  it("defaults the editor switch to off", async () => {
    elt.isEditorMode = true;
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelector("#hide_muted").checked).toBe(false);
    document.body.removeChild(elt);
  });

  it("emits config-changed when the editor switch is toggled", async () => {
    elt.setConfig({ device: "__maintenance__" });
    elt.isEditorMode = true;
    document.body.appendChild(elt);
    await elt.updateComplete;

    let config: any = null;
    elt.addEventListener("config-changed", (e: any) => {
      config = e.detail.config;
    });

    const box = elt.shadowRoot.querySelector("#hide_muted");
    box.checked = true;
    box.dispatchEvent(new Event("change"));

    expect(config).toEqual({
      device: "__maintenance__",
      maintenance: { hide_muted: true },
    });
    document.body.removeChild(elt);
  });

  it("keeps the other maintenance options when writing one", () => {
    elt.setConfig({
      device: "__maintenance__",
      maintenance: { sort: "due", show_reset: false },
    });
    let config: any = null;
    elt.addEventListener("config-changed", (e: any) => {
      config = e.detail.config;
    });
    elt._update_option("hide_muted", true);
    expect(config.maintenance).toEqual({
      sort: "due",
      show_reset: false,
      hide_muted: true,
    });
  });

  it("writes an option even without any prior configuration", () => {
    elt.setConfig({});
    let config: any = null;
    elt.addEventListener("config-changed", (e: any) => {
      config = e.detail.config;
    });
    elt._update_option("hide_muted", false);
    expect(config.maintenance).toEqual({ hide_muted: false });
  });

  it("switches the sort mode from the toolbar buttons", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    elt.shadowRoot.querySelector("#sort-due").click();
    await elt.updateComplete;
    expect(elt._sort).toBe("due");
    elt.shadowRoot.querySelector("#sort-device").click();
    await elt.updateComplete;
    expect(elt._sort).toBe("device");
    document.body.removeChild(elt);
  });

  it("toggles the filter from the checkbox", async () => {
    document.body.appendChild(elt);
    await elt.updateComplete;
    const box = elt.shadowRoot.querySelector("#hide-ok");
    box.click();
    await elt.updateComplete;
    expect(elt._hide_ok).toBe(true);
    document.body.removeChild(elt);
  });

  it("opens more-info when clicking a row body", async () => {
    const spy = vi.fn();
    elt.addEventListener("hass-more-info", spy);
    document.body.appendChild(elt);
    await elt.updateComplete;
    elt.shadowRoot.querySelector(".maint-body").click();
    expect(spy).toHaveBeenCalled();
    document.body.removeChild(elt);
  });

  it("opens more-info on the Enter key", async () => {
    const spy = vi.fn();
    elt.addEventListener("hass-more-info", spy);
    document.body.appendChild(elt);
    await elt.updateComplete;
    const body = elt.shadowRoot.querySelector(".maint-body");
    body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(spy).not.toHaveBeenCalled();
    body.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(spy).toHaveBeenCalled();
    document.body.removeChild(elt);
  });

  it("presses the entity when clicking the reset button", async () => {
    const hass = makeHass();
    elt.hass = hass;
    document.body.appendChild(elt);
    await elt.updateComplete;
    elt.shadowRoot.querySelector(".maint-done").click();
    expect(hass.callService).toHaveBeenCalledWith(
      "button",
      "press",
      expect.objectContaining({ entity_id: expect.any(String) }),
    );
    document.body.removeChild(elt);
  });

  it("falls back on a generic icon when the entity has none", async () => {
    const hass = makeHass();
    for (const id of Object.keys(hass.states)) {
      if (hass.states[id].attributes.icon) {
        delete hass.states[id].attributes.icon;
      }
    }
    elt.hass = hass;
    document.body.appendChild(elt);
    await elt.updateComplete;
    const icons = Array.from(
      elt.shadowRoot.querySelectorAll("ha-icon.maint-icon"),
    );
    expect(icons.length).toBeGreaterThan(0);
    expect((icons[0] as any).getAttribute("icon")).toBe("mdi:wrench-check");
    document.body.removeChild(elt);
  });

  it("shows the all-clear badge when every task is up to date", async () => {
    const hass = makeHass();
    // Push every deadline far away
    for (const id of Object.keys(hass.states)) {
      const attrs = hass.states[id].attributes;
      if (attrs.reef_role) {
        attrs.days_left = 1000;
        attrs.interval_days = 2000;
        attrs.overdue = false;
        attrs.last_reset = "2026-01-01T10:00:00+00:00";
      }
    }
    elt.hass = hass;
    document.body.appendChild(elt);
    await elt.updateComplete;
    expect(elt.shadowRoot.querySelector(".maint-badge.ok")).toBeTruthy();
    expect(elt.shadowRoot.querySelector(".maint-badge.overdue")).toBeNull();
    document.body.removeChild(elt);
  });

  it("shows the all-clear message when the filter hides everything", async () => {
    const hass = makeHass();
    for (const id of Object.keys(hass.states)) {
      const attrs = hass.states[id].attributes;
      if (attrs.reef_role) {
        attrs.days_left = 1000;
        attrs.interval_days = 2000;
        attrs.overdue = false;
        attrs.last_reset = "2026-01-01T10:00:00+00:00";
      }
    }
    elt.hass = hass;
    elt.setConfig({ maintenance: { hide_ok: true } });
    document.body.appendChild(elt);
    await elt.updateComplete;
    const empty = elt.shadowRoot.querySelector(".maint-empty");
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain("up to date");
    document.body.removeChild(elt);
  });
});

// ── Card integration ─────────────────────────────────────────────────────────

describe("maintenance selector", () => {
  it("recognises every accepted spelling", () => {
    expect(ReefCard.is_maintenance_selector(MAINTENANCE_DEVICE_ID)).toBe(true);
    expect(ReefCard.is_maintenance_selector("maintenance")).toBe(true);
    expect(ReefCard.is_maintenance_selector("Maintenance")).toBe(true);
    expect(ReefCard.is_maintenance_selector("ReefMat")).toBe(false);
    expect(ReefCard.is_maintenance_selector(undefined)).toBe(false);
  });
});

describe("card integration", () => {
  it("offers the maintenance entry only when tasks exist", () => {
    const card: any = new ReefCard();

    card._hass = makeHass();
    card.init_devices();
    expect(
      card.select_devices.some((d: any) => d.value === MAINTENANCE_DEVICE_ID),
    ).toBe(true);

    card._hass = {
      states: {},
      entities: {},
      devices: {},
      callService: vi.fn(),
    };
    card.init_devices();
    expect(
      card.select_devices.some((d: any) => d.value === MAINTENANCE_DEVICE_ID),
    ).toBe(false);
  });

  it("builds the maintenance element once and keeps it across renders", () => {
    const card: any = new ReefCard();
    card._hass = makeHass();
    card.user_config = {};
    card.current_device = null;

    card._set_current_device(MAINTENANCE_DEVICE_ID);
    const first = card.current_device;
    expect(first).toBeTruthy();
    expect(first.is_maintenance).toBe(true);

    // A second call must not rebuild the element (sort state would be lost)
    card._set_current_device(MAINTENANCE_DEVICE_ID);
    expect(card.current_device).toBe(first);
  });

  it("keeps the user sort choice across a hass update", () => {
    const card: any = new ReefCard();
    card._hass = makeHass();
    card.user_config = { device: MAINTENANCE_DEVICE_ID };
    card.current_device = null;

    card._set_current_device(MAINTENANCE_DEVICE_ID);
    card.current_device._set_sort("due");
    card._set_current_device(MAINTENANCE_DEVICE_ID);
    expect(card.current_device._sort).toBe("due");
  });
});

describe("editor integration", () => {
  it("stores the language independent id for the maintenance entry", () => {
    const editor: any = new ReefCardEditor();
    editor._hass = makeHass();
    editor._config = {};

    const select = document.createElement("select");
    select.id = "device";
    for (const value of ["unselected", MAINTENANCE_DEVICE_ID]) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.text = value === MAINTENANCE_DEVICE_ID ? "Maintenance" : "Select";
      select.appendChild(opt);
    }
    select.value = MAINTENANCE_DEVICE_ID;

    // A real shadow root is needed: the editor calls getElementById on it
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    root.appendChild(select);
    Object.defineProperty(editor, "shadowRoot", {
      configurable: true,
      get: () => root,
    });

    const spy = vi.fn();
    editor.addEventListener("config-changed", spy);
    editor.handleChangedEvent(new Event("change"));

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].detail.config.device).toBe(
      MAINTENANCE_DEVICE_ID,
    );
  });

  it("renders the maintenance preview without resolving a HA device", () => {
    const editor: any = new ReefCardEditor();
    editor._hass = makeHass();
    editor._config = { device: MAINTENANCE_DEVICE_ID };
    editor.devices_list = {
      devices: {},
      main_devices: [],
      get_by_name: () => undefined,
    };

    const tpl = editor.device_conf();
    expect(tpl).toBeTruthy();
    expect(editor.current_device.is_maintenance).toBe(true);
  });
});
