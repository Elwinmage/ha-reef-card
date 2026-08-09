/**
 * Tests for the "pump plugged but not configured" flow:
 *   - RSPump.is_unknown() / is_connected_pump()
 *   - the add_pump placeholder is only drawn for a real, unconfigured pump
 *   - the shared add_pump / confirm_delete_pump dialogs are registered
 *   - the device-level editor flag that hides the placeholder
 */

import { RSPump } from "../src/devices/redsea/rsrun/rsrun_pump";
import { dialogs_rsrun_pump } from "../src/devices/redsea/rsrun/rsrun_pump.dialogs";
import { dialogs_rsrun_pump_return } from "../src/devices/redsea/rsrun/rsrun_pump_return.dialogs";
import { dialogs_rsrun_pump_skimmer } from "../src/devices/redsea/rsrun/rsrun_pump_skimmer.dialogs";
import { describe, expect, it, vi } from "vitest";

if (!customElements.get("test-unknown-pump")) {
  customElements.define("test-unknown-pump", class extends RSPump {});
}

function makeState(state: string, entity_id: string): any {
  return { entity_id, state, attributes: {} };
}

/** Build an unconfigured pump with the given type / temperature readings */
function makePump(type = "unknown", temperature = "0"): any {
  const pump: any = new (customElements.get("test-unknown-pump") as any)();
  pump.id = 2;
  pump.entities = {
    type: { entity_id: "sensor.type" },
    temperature: { entity_id: "sensor.temperature" },
  };
  pump.parent_entities = { device_state: { entity_id: "switch.device_state" } };
  pump._hass = {
    states: {
      "switch.device_state": makeState("on", "switch.device_state"),
      "sensor.type": makeState(type, "sensor.type"),
      "sensor.temperature": makeState(temperature, "sensor.temperature"),
    },
    callService: vi.fn(),
  };
  return pump;
}

//----------------------------------------------------------------------------//

describe("RSPump — unconfigured slot detection", () => {
  it("reports an unknown type", () => {
    expect(makePump("unknown").is_unknown()).toBe(true);
    expect(makePump("skimmer").is_unknown()).toBe(false);
    expect(makePump("return").is_unknown()).toBe(false);
  });

  it("treats a missing type sensor as unknown", () => {
    const pump = makePump();
    delete pump.entities.type;
    expect(pump.is_unknown()).toBe(true);
  });

  it("uses temperature to tell an empty socket from a plugged pump", () => {
    // Empty socket: /dashboard reports temperature 0
    expect(makePump("unknown", "0").is_connected_pump()).toBe(false);
    // Pump plugged but not added yet
    expect(makePump("unknown", "36.463409423828125").is_connected_pump()).toBe(
      true,
    );
  });

  it("ignores non numeric temperatures", () => {
    expect(makePump("unknown", "unavailable").is_connected_pump()).toBe(false);
    expect(makePump("unknown", "unknown").is_connected_pump()).toBe(false);
  });
});

describe("RSPump — add_pump placeholder", () => {
  it("draws nothing on an empty socket", () => {
    const pump = makePump("unknown", "0");
    pump._render_elements = vi.fn(() => "ELEMENTS");
    const tpl: any = pump._render();
    expect(pump._render_elements).not.toHaveBeenCalled();
    expect(tpl.values ?? []).toHaveLength(0);
  });

  it("draws the placeholder when a pump is plugged in", () => {
    const pump = makePump("unknown", "36.4");
    pump._render_elements = vi.fn(() => "ELEMENTS");
    pump._render();
    expect(pump._render_elements).toHaveBeenCalled();
  });

  it("draws nothing when the placeholder is disabled from the editor", () => {
    const pump = makePump("unknown", "36.4");
    pump.show_add_pump = false;
    pump._render_elements = vi.fn(() => "ELEMENTS");
    pump._render();
    expect(pump._render_elements).not.toHaveBeenCalled();
  });

  it("exposes an add_pump element pointing at the add_pump dialog", () => {
    const pump = makePump();
    const elt = pump.initial_config.elements.add_pump;
    expect(elt.type).toBe("click-image");
    expect(elt.tap_action.action).toBe("dialog");
    expect(elt.tap_action.data.type).toBe("add_pump");
  });

  it("re-renders when type or temperature changes", () => {
    const pump = makePump("unknown", "0");
    pump._elements = {};
    pump.to_render = false;

    const next = JSON.parse(JSON.stringify(pump._hass));
    next.states["sensor.temperature"].state = "36.4";
    pump._setting_hass(next);
    expect(pump.to_render).toBe(true);

    pump.to_render = false;
    const after = JSON.parse(JSON.stringify(pump._hass));
    after.states["sensor.type"].state = "skimmer";
    pump._setting_hass(after);
    expect(pump.to_render).toBe(true);
  });
});

describe("Pump dialogs", () => {
  it("registers add_pump with a detect-and-add button", () => {
    const dlg: any = dialogs_rsrun_pump.add_pump;
    const actions = dlg.other.conf.tap_action;
    expect(actions[0]).toMatchObject({
      domain: "button",
      action: "press",
      data: { entity_id: "detect_pump" },
    });
    // The model row must stay editable so a wrong detection can be corrected
    const rows = dlg.content[1].conf.entities.map((e: any) => e.entity);
    expect(rows).toContain("select.model");
  });

  it("guards delete_pump behind a confirmation", () => {
    const dlg: any = dialogs_rsrun_pump.confirm_delete_pump;
    expect(dlg.cancel).toBe(true);
    expect(dlg.validate.tap_action[0]).toMatchObject({
      domain: "button",
      action: "press",
      data: { entity_id: "delete_pump" },
    });
  });

  it("adds the delete button to both configuration dialogs", () => {
    for (const [dlg, back] of [
      [dialogs_rsrun_pump_return.config_return, "config_return"],
      [dialogs_rsrun_pump_skimmer.config_skimmer, "config_skimmer"],
    ] as any[]) {
      const button = dlg.content.find(
        (c: any) =>
          c.view === "common-button" && c.conf?.icon?.includes("delete"),
      );
      expect(button).toBeDefined();
      expect(button.conf.tap_action.data).toMatchObject({
        type: "confirm_delete_pump",
        overload_quit: back,
      });
    }
  });

  it("never deletes without going through the confirmation dialog", () => {
    const raw = JSON.stringify([
      dialogs_rsrun_pump_return,
      dialogs_rsrun_pump_skimmer,
    ]);
    // delete_pump may only be pressed from the shared confirmation dialog
    expect(raw).not.toContain('"entity_id":"delete_pump"');
  });
});
