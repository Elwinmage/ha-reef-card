// Contract check: entities published by reefbeatEnergyBackup over MQTT must be
// picked up by the card's maintenance collector with no card-side change.
import { collect_maintenance_items } from "../src/utils/maintenance";
import { describe, expect, it } from "vitest";

// Captured from BatteryTestMaintenance.publish_discovery()/publish_state() in
// reefbeatEnergyBackup, then shaped the way HA's MQTT integration would
// register them. Regenerate with scripts/gen_maintenance_fixture.py in that
// repo if the payloads change.
const hass = {
  states: {
    "button.reef_battery_battery_discharge_test": {
      entity_id: "button.reef_battery_battery_discharge_test",
      state: "unknown",
      attributes: {
        reef_role: "maint_battery_discharge_test",
        task_key: "battery_discharge_test",
        interval_days: 90,
        days_left: 90,
        overdue: false,
        last_reset: "2026-08-10T12:00:00+00:00",
        notify: true,
        icon: "mdi:battery-clock",
        friendly_name: "Reef Battery Backup Test de decharge batterie",
      },
    },
    "number.reef_battery_battery_discharge_test_interval_months": {
      entity_id: "number.reef_battery_battery_discharge_test_interval_months",
      state: "3",
      attributes: {
        reef_role: "maint_battery_discharge_test_interval_months",
        friendly_name: "Reef Battery Backup Test batterie intervalle",
        min: 1,
        max: 12,
        step: 1,
        unit_of_measurement: "months",
        icon: "mdi:calendar-sync",
      },
    },
    "switch.reef_battery_battery_discharge_test_notify": {
      entity_id: "switch.reef_battery_battery_discharge_test_notify",
      state: "ON",
      attributes: {
        reef_role: "maint_battery_discharge_test_notify",
        friendly_name: "Reef Battery Backup Test batterie notifications",
        icon: "mdi:bell",
      },
    },
  },
  entities: {
    "button.reef_battery_battery_discharge_test": {
      device_id: "dev_batt",
    },
    "number.reef_battery_battery_discharge_test_interval_months": {
      device_id: "dev_batt",
    },
    "switch.reef_battery_battery_discharge_test_notify": {
      device_id: "dev_batt",
    },
  },
  devices: {
    dev_batt: {
      name: "Reef Battery Backup",
      model: "LiFePO4 24V 60Ah",
    },
  },
};

describe("reefbeatEnergyBackup battery test", () => {
  it("is collected as a maintenance item", () => {
    const items = collect_maintenance_items(hass as any);
    expect(items).toHaveLength(1);
    const item = items[0];
    expect(item.task_key).toBe("battery_discharge_test");
    expect(item.device_name).toBe("Reef Battery Backup");
    expect(item.interval_days).toBe(90);
    expect(item.days_left).not.toBeNull();
    expect(item.overdue).toBe(false);
    expect(item.status).toBe("ok");
  });

  it("resolves the companion number and switch of the same device", () => {
    const item = collect_maintenance_items(hass as any)[0];
    expect(item.interval_entity_id).toBe(
      "number.reef_battery_battery_discharge_test_interval_months",
    );
    expect(item.interval_unit).toBe("months");
    expect(item.interval_value).toBe(3);
    expect(item.interval_min).toBe(1);
    expect(item.interval_max).toBe(12);
    expect(item.notify_entity_id).toBe(
      "switch.reef_battery_battery_discharge_test_notify",
    );
    expect(item.notify).toBe(true);
  });

  it("strips the device prefix from the displayed name", () => {
    expect(collect_maintenance_items(hass as any)[0].name).toBe(
      "Test de decharge batterie",
    );
  });
});
