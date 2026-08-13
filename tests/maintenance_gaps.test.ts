/**
 * Remaining coverage gaps in utils/maintenance.ts — the three registry
 * indexers and the sort comparator. These walk every hass entity and bail out
 * on anything malformed, so the branches only fire on odd registries: an
 * entity absent from the registry, a role without the expected prefix or
 * suffix, a number with no bounds, a device with no name.
 */

import {
  collect_maintenance_items,
  group_by_device,
  sort_maintenance_items,
} from "../src/utils/maintenance";
import { describe, expect, it } from "vitest";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

/**
 * Build a maintenance task button.
 * @param entity_id: the button entity id
 * @param role: its reef_role
 * @param attributes: extra attributes merged into the state
 */
function makeTask(entity_id: string, role: string, attributes: any = {}): any {
  return {
    entity_id,
    state: "unknown",
    attributes: {
      friendly_name: "Device Task",
      reef_role: role,
      task_key: role.replace("maint_", ""),
      interval_days: 30,
      days_left: 10,
      overdue: false,
      last_reset: "2026-08-01T10:00:00+00:00",
      icon: "mdi:fan",
      notify: true,
      ...attributes,
    },
  };
}

/**
 * Build a hass object out of raw states and registry entries.
 * @param states: keyed by entity_id
 * @param entities: registry entries, keyed by entity_id
 * @param devices: device registry, keyed by device_id
 */
function makeHass(states: any, entities: any = {}, devices: any = {}): any {
  return { states, entities, devices };
}

//----------------------------------------------------------------------------//
//   Notify switches
//----------------------------------------------------------------------------//

describe("maintenance notify switches", () => {
  /** Collect the first item produced for a given switch fixture */
  function firstItem(extra_states: any, entities: any = {}): any {
    const states = {
      "button.task": makeTask("button.task", "maint_task"),
      ...extra_states,
    };
    return collect_maintenance_items(
      makeHass(states, {
        "button.task": { device_id: "dev1" },
        ...entities,
      }),
    )[0];
  }

  it("binds a switch whose role matches the task", () => {
    const item = firstItem(
      {
        "switch.notify": {
          entity_id: "switch.notify",
          state: "on",
          attributes: { reef_role: "maint_task_notify" },
        },
      },
      { "switch.notify": { device_id: "dev1" } },
    );
    expect(item.notify_entity_id).toBe("switch.notify");
  });

  it("ignores a switch missing from the registry", () => {
    const item = firstItem({
      "switch.notify": {
        entity_id: "switch.notify",
        state: "on",
        attributes: { reef_role: "maint_task_notify" },
      },
    });
    // Indexed under the empty device id, so it cannot match the task
    expect(item.notify_entity_id).toBeNull();
  });

  it("ignores a role that is not a maintenance notify switch", () => {
    for (const reef_role of ["task_notify", "maint_task", 42, undefined]) {
      const item = firstItem(
        {
          "switch.other": {
            entity_id: "switch.other",
            state: "on",
            attributes: { reef_role },
          },
        },
        { "switch.other": { device_id: "dev1" } },
      );
      expect(item.notify_entity_id).toBeNull();
    }
  });
});

//----------------------------------------------------------------------------//
//   Interval numbers
//----------------------------------------------------------------------------//

describe("maintenance interval numbers", () => {
  /** Build a number entity carrying an interval */
  function makeNumber(role: string, attributes: any = {}): any {
    return {
      "number.interval": {
        entity_id: "number.interval",
        state: "30",
        attributes: {
          reef_role: role,
          min: 1,
          max: 90,
          step: 1,
          ...attributes,
        },
      },
    };
  }

  /** Collect the interval bound to the single task of the fixture */
  function interval(states: any, registered = true): any {
    const all = {
      "button.task": makeTask("button.task", "maint_task"),
      ...states,
    };
    const entities: any = { "button.task": { device_id: "dev1" } };
    if (registered) entities["number.interval"] = { device_id: "dev1" };
    const item = collect_maintenance_items(makeHass(all, entities))[0];
    return {
      entity_id: item.interval_entity_id,
      unit: item.interval_unit,
      value: item.interval_value,
      min: item.interval_min,
      max: item.interval_max,
      step: item.interval_step,
    };
  }

  it("binds a number whose role carries a known unit", () => {
    expect(interval(makeNumber("maint_task_interval_days"))).toMatchObject({
      entity_id: "number.interval",
      unit: "days",
      value: 30,
      min: 1,
      max: 90,
      step: 1,
    });
  });

  it("accepts weeks and months too", () => {
    for (const unit of ["weeks", "months"]) {
      expect(interval(makeNumber(`maint_task_interval_${unit}`)).unit).toBe(
        unit,
      );
    }
  });

  it("rejects an unknown unit", () => {
    expect(interval(makeNumber("maint_task_interval_hours")).unit).toBeNull();
  });

  it("rejects a role with no interval infix", () => {
    expect(interval(makeNumber("maint_task_days")).unit).toBeNull();
  });

  it("rejects a role outside the maintenance namespace", () => {
    expect(interval(makeNumber("task_interval_days")).unit).toBeNull();
    expect(interval(makeNumber(undefined as any)).unit).toBeNull();
  });

  it("falls back to sane values for a number with no bounds", () => {
    const found = interval(
      makeNumber("maint_task_interval_days", {
        min: "x",
        max: undefined,
        step: 0,
      }),
    );
    expect(found.min).toBeNull();
    expect(found.max).toBeNull();
    expect(found.step).toBe(1);
  });

  it("reports a null value for an unusable state", () => {
    const states = makeNumber("maint_task_interval_days");
    states["number.interval"].state = "unavailable";
    expect(interval(states).value).toBeNull();
  });

  it("ignores a number absent from the registry", () => {
    expect(
      interval(makeNumber("maint_task_interval_days"), false).unit,
    ).toBeNull();
  });

  it("ignores entities of other domains", () => {
    expect(
      interval({
        "sensor.interval": {
          entity_id: "sensor.interval",
          state: "30",
          attributes: { reef_role: "maint_task_interval_days" },
        },
      }).unit,
    ).toBeNull();
  });
});

//----------------------------------------------------------------------------//
//   Pump details
//----------------------------------------------------------------------------//

describe("maintenance pump details", () => {
  /** Collect the pump type and model resolved for the single task */
  function details(states: any, registered = true): any {
    const all = {
      "button.task": makeTask("button.task", "maint_task"),
      ...states,
    };
    const entities: any = { "button.task": { device_id: "dev1" } };
    if (registered) {
      for (const id in states) entities[id] = { device_id: "dev1" };
    }
    const item = collect_maintenance_items(makeHass(all, entities))[0];
    return { type: item.pump_type, model: item.pump_model };
  }

  it("reads both the type and the model", () => {
    expect(
      details({
        "sensor.type": {
          entity_id: "sensor.type",
          state: "skimmer",
          attributes: { reef_role: "type" },
        },
        "sensor.model": {
          entity_id: "sensor.model",
          state: "rsk-900",
          attributes: { reef_role: "model" },
        },
      }),
    ).toEqual({ type: "skimmer", model: "rsk-900" });
  });

  it("ignores an unusable state", () => {
    for (const state of ["", "unknown", "unavailable", 42]) {
      expect(
        details({
          "sensor.type": {
            entity_id: "sensor.type",
            state,
            attributes: { reef_role: "type" },
          },
        }).type,
      ).toBeNull();
    }
  });

  it("ignores a sensor absent from the registry", () => {
    expect(
      details(
        {
          "sensor.type": {
            entity_id: "sensor.type",
            state: "return",
            attributes: { reef_role: "type" },
          },
        },
        false,
      ).type,
    ).toBeNull();
  });

  it("ignores a role that is neither type nor model", () => {
    expect(
      details({
        "sensor.other": {
          entity_id: "sensor.other",
          state: "x",
          attributes: { reef_role: "speed" },
        },
      }).type,
    ).toBeNull();
  });

  it("ignores entities of other domains", () => {
    expect(
      details({
        "switch.type": {
          entity_id: "switch.type",
          state: "return",
          attributes: { reef_role: "type" },
        },
      }).type,
    ).toBeNull();
  });
});

//----------------------------------------------------------------------------//
//   Collect guard rails
//----------------------------------------------------------------------------//

describe("collect_maintenance_items guard rails", () => {
  it("returns nothing without hass", () => {
    expect(collect_maintenance_items(null as any)).toEqual([]);
    expect(collect_maintenance_items({} as any)).toEqual([]);
  });

  it("copes with a hass exposing no registry at all", () => {
    const items = collect_maintenance_items({
      states: { "button.task": makeTask("button.task", "maint_task") },
    } as any);
    expect(items).toHaveLength(1);
    expect(items[0].device_id).toBe("");
  });

  it("honours a custom warning ratio", () => {
    const states = {
      "button.task": makeTask("button.task", "maint_task", {
        interval_days: 100,
        days_left: 50,
      }),
    };
    expect(collect_maintenance_items(makeHass(states))[0].status).toBe("ok");
    const early = collect_maintenance_items(makeHass(states), {
      warning_ratio: 0.8,
    });
    expect(early[0].status).toBe("warning");
  });
});

//----------------------------------------------------------------------------//
//   Sorting and grouping
//----------------------------------------------------------------------------//

describe("maintenance sorting", () => {
  /** Minimal item skeleton for the comparator */
  function item(days_left: number | null, device_id = "dev1"): any {
    return {
      entity_id: `button.${days_left}`,
      device_id,
      device_name: device_id === "" ? "" : `Device ${device_id}`,
      days_left,
      name: "task",
    };
  }

  it("pushes never-reset tasks to the end", () => {
    const sorted = sort_maintenance_items([item(null), item(5), item(1)]);
    expect(sorted.map((i: any) => i.days_left)).toEqual([1, 5, null]);
  });

  it("keeps two never-reset tasks in place", () => {
    const sorted = sort_maintenance_items([item(null), item(null)]);
    expect(sorted).toHaveLength(2);
  });

  it("does not modify the input list", () => {
    const items = [item(5), item(1)];
    sort_maintenance_items(items);
    expect(items[0].days_left).toBe(5);
  });

  it("groups by device, falling back to the name", () => {
    const groups = group_by_device([
      item(1, "dev1"),
      item(2, "dev1"),
      item(3, "dev2"),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].items).toHaveLength(2);
  });

  it("groups nameless devices under their display name", () => {
    const groups = group_by_device([{ ...item(1, ""), device_name: "Orphan" }]);
    expect(groups[0].device_name).toBe("Orphan");
  });
});
