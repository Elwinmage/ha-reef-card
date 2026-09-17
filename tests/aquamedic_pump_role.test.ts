/**
 * Tests for the ambiguous-model handling in RSDevice.render():
 *   - AMDCRunner shows a role picker while Aqua Medic's pump_role select
 *     entity is unset ("unknown"), instead of its own "in development" view.
 *   - Picking a role calls the select service on that entity.
 *   - Once the role resolves to a different concrete device (DC Skimmer),
 *     rendering is delegated to it automatically, with no re-selection of
 *     the device from the card's dropdown needed.
 *   - _setting_hass() flags a re-render when the role entity's state
 *     changes, since no rendered element is otherwise bound to it.
 */

import { describe, expect, it, vi } from "vitest";

import { RSDevice } from "../src/devices/device";
import { AMDCSkimmer } from "../src/devices/aquamedic/dcskimmer/dcskimmer";
// Registers aquamedic-dcrunner, aquamedic-dcskimmer and the other tags.
import "../src/devices/index";
import i18n from "../src/translations/myi18n";

// The still-unimplemented "in development" banner every stub device falls
// back to when its model is not ambiguous / already resolved to itself.
const DEV_PLANNED_TEXT = i18n._("dev_planned");

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

/**
 * Flatten a lit TemplateResult (including nested ones, as produced by a
 * `.map()`) into its rendered text, close enough to grep on. Event handler
 * functions are skipped rather than stringified.
 */
function markup(tpl: any): string {
  if (tpl == null) return "";
  if (Array.isArray(tpl)) return tpl.map(markup).join("");
  if (tpl?.strings && tpl?.values) {
    let out = "";
    tpl.strings.forEach((s: string, i: number) => {
      out += s;
      if (i < tpl.values.length) {
        const v = tpl.values[i];
        if (typeof v === "function") {
          // event handler, nothing to render
        } else if (v instanceof HTMLElement) {
          // a native/hui-* element the device cached: not a translation,
          // and its own text is irrelevant to what's being asserted here
        } else {
          out += markup(v);
        }
      }
    });
    return out;
  }
  return String(tpl);
}

/**
 * Build a hass object for an Aqua Medic DC Runner/Skimmer pump, with its
 * pump_role select entity set to the given role ("unknown" when omitted, as
 * a fresh installation reports it).
 */
function makeHass(role: string = "unknown"): any {
  return {
    states: {
      "select.pump_role": { entity_id: "select.pump_role", state: role },
    },
    entities: {
      "select.pump_role": {
        entity_id: "select.pump_role",
        device_id: "dev1",
        translation_key: "pump_role",
      },
    },
    devices: {},
    callService: vi.fn(),
  };
}

/** Build an AMDCRunner wired to a device whose model is the ambiguous "DC Runner". */
function makeDCRunner(role: string = "unknown"): any {
  const device: any = new (customElements.get("aquamedic-dcrunner") as any)();
  device.device = {
    name: "Pump",
    elements: [
      {
        id: "dev1",
        model: "DC Runner",
        identifiers: [["aquamedic", "did1"]],
        disabled_by: null,
        primary_config_entry: "cfg1",
      },
    ],
  };
  device.entities = {};
  device._hass = makeHass(role);
  device.setConfig(null);
  return device;
}

//----------------------------------------------------------------------------//

describe("ambiguous model — role picker", () => {
  it("shows a picker instead of its own view while the role is unknown", () => {
    const device = makeDCRunner("unknown");
    const result = markup(device.render());
    expect(result).toContain('id="pump_role_select"');
    expect(result).not.toContain(DEV_PLANNED_TEXT);
  });

  it("also shows the picker when no role entity exists yet", () => {
    const device = makeDCRunner();
    device._hass = {
      states: {},
      entities: {},
      devices: {},
      callService: vi.fn(),
    };
    const result = markup(device.render());
    expect(result).toContain('id="pump_role_select"');
  });

  it("calls the select service when a role is picked", () => {
    const device = makeDCRunner("unknown");
    (device as any)._select_pump_role("select.pump_role", "skimmer");
    expect(device._hass.callService).toHaveBeenCalledWith(
      "select",
      "select_option",
      { entity_id: "select.pump_role", option: "skimmer" },
    );
  });

  it("does nothing when no entity_id or no role is given", () => {
    const device = makeDCRunner("unknown");
    (device as any)._select_pump_role(undefined, "skimmer");
    (device as any)._select_pump_role("select.pump_role", "");
    expect(device._hass.callService).not.toHaveBeenCalled();
  });
});

describe("ambiguous model — resolved view", () => {
  it("renders its own (in development) view once the role matches it", () => {
    const device = makeDCRunner("return");
    const result = markup(device.render());
    expect(result).not.toContain('id="pump_role_select"');
    expect(result).toContain(DEV_PLANNED_TEXT);
  });

  it("delegates to AMDCSkimmer once the role says skimmer", () => {
    const device = makeDCRunner("skimmer");
    const result = device.render();
    expect(result.values[0]).toBeInstanceOf(AMDCSkimmer);
  });

  it("reuses the same delegate instance across renders", () => {
    const device = makeDCRunner("skimmer");
    const first = device.render().values[0];
    const second = device.render().values[0];
    expect(second).toBe(first);
  });

  it("switches back to its own view if the role changes away from skimmer", () => {
    const device = makeDCRunner("skimmer");
    device.render();
    device._hass = makeHass("return");
    const result = markup(device.render());
    expect(result).toContain(DEV_PLANNED_TEXT);
  });
});

describe("ambiguous model — re-render on role change", () => {
  it("flags a re-render when the role entity's state changes", () => {
    const device = makeDCRunner("unknown");
    device.to_render = false;
    device.hass = makeHass("skimmer");
    expect(device.to_render).toBe(true);
  });

  it("does not flag a re-render when nothing about the role changed", () => {
    const device = makeDCRunner("unknown");
    // Prime _last_ambiguous_role with an identical hass update first.
    device.hass = makeHass("unknown");
    device.to_render = false;
    device.hass = makeHass("unknown");
    expect(device.to_render).toBe(false);
  });
});

describe("tag_for_model", () => {
  it("resolves both concrete Aqua Medic pump models", () => {
    expect(RSDevice.tag_for_model("aquamedic", "DC Runner")).toBe(
      "aquamedic-dcrunner",
    );
    expect(RSDevice.tag_for_model("aquamedic", "DC Skimmer")).toBe(
      "aquamedic-dcskimmer",
    );
    expect(customElements.get("aquamedic-dcskimmer")).toBeDefined();
  });
});

describe("is_on() — domain-specific power entity", () => {
  it("reads Aqua Medic's 'power' switch rather than 'device_state'", () => {
    const device = makeDCRunner("return");
    device.entities = {
      power: { entity_id: "switch.pump_power" },
    };
    device._hass = {
      states: { "switch.pump_power": { state: "on" } },
      entities: {},
      devices: {},
      callService: vi.fn(),
    };
    expect(device.is_on()).toBe(true);

    device._hass.states["switch.pump_power"].state = "off";
    expect(device.is_on()).toBe(false);
  });
});

describe("tag_for_model — missing domain", () => {
  it("falls back to 'unknown' rather than 'undefined' when the domain is missing", () => {
    expect(RSDevice.tag_for_model(undefined as any, "DC Runner")).toBe(
      "unknown-unknown",
    );
  });
});

describe("ambiguous model — role picker wiring", () => {
  it("invokes _select_pump_role through the select's own @change binding", () => {
    const device = makeDCRunner("unknown");
    const result = device.render();
    // _render_role_picker()'s <select @change="${handler}"> is the only
    // function among its top-level interpolated values.
    const handler = (result.values as any[]).find(
      (v) => typeof v === "function",
    );
    expect(typeof handler).toBe("function");
    handler({ target: { value: "skimmer" } } as any);
    expect(device._hass.callService).toHaveBeenCalledWith(
      "select",
      "select_option",
      { entity_id: "select.pump_role", option: "skimmer" },
    );
  });
});

describe("ambiguous model — delegate with no registered tag", () => {
  // Injects a throwaway domain into the shared KNOWN_DEVICE_DOMAINS registry
  // to exercise the one path Aqua Medic's own two roles never take: a role
  // resolving to a model nothing registers a custom element for.
  it("falls through to its own view when the resolved model has no tag", async () => {
    const { KNOWN_DEVICE_DOMAINS } = await import("../src/utils/constants");
    KNOWN_DEVICE_DOMAINS["testdomain"] = {
      tag_prefix: "testdomain",
      model_overrides: {
        Ambiguous: {
          role_translation_key: "test_role",
          role_to_model: { alt: "Nonexistent Model" },
        },
      },
    };
    try {
      const device: any = new (customElements.get(
        "aquamedic-dcrunner",
      ) as any)();
      device.device = {
        name: "Pump",
        elements: [
          {
            id: "dev1",
            model: "Ambiguous",
            identifiers: [["testdomain", "did1"]],
            disabled_by: null,
            primary_config_entry: "cfg1",
          },
        ],
      };
      device.entities = {};
      device._hass = {
        states: { "select.test_role": { state: "alt" } },
        entities: {
          "select.test_role": {
            device_id: "dev1",
            translation_key: "test_role",
          },
        },
        devices: {},
        callService: vi.fn(),
      };
      device.setConfig(null);

      const result = markup(device.render());
      // "testdomain-nonexistentmodel" is registered nowhere: create_device()
      // returns null, and _render_delegate() falls through rather than
      // returning it — this instance's own (unimplemented) view shows
      // instead of a blank card.
      expect(result).toContain(DEV_PLANNED_TEXT);
    } finally {
      delete KNOWN_DEVICE_DOMAINS["testdomain"];
    }
  });
});

describe("stub devices — renderEditor()", () => {
  it("every Aqua Medic stub returns an empty editor view", () => {
    for (const tag of [
      "aquamedic-smartdrift",
      "aquamedic-dcrunner",
      "aquamedic-dcskimmer",
    ]) {
      const device: any = new (customElements.get(tag) as any)();
      expect(device.renderEditor()).toBeDefined();
      expect(markup(device.renderEditor())).toBe("");
    }
  });
});

describe("_ambiguous_model() — degenerate inputs", () => {
  it("still resolves when hass hasn't been set yet", () => {
    // this._hass ?? undefined: exercises the nullish branch, taken when
    // render() (or a direct call, as here) runs before any hass update.
    const device = makeDCRunner("unknown");
    device._hass = null;
    const result = (device as any)._ambiguous_model();
    expect(result).toBeDefined();
    expect(result.role).toBeUndefined();
  });
});

describe("ambiguous_model_of() — degenerate inputs", () => {
  it("treats a device with no elements as carrying no role entity", async () => {
    const { ambiguous_model_of } = await import("../src/utils/common");
    const hass: any = {
      entities: {
        "select.pump_role": {
          device_id: "dev1",
          translation_key: "pump_role",
        },
      },
      states: { "select.pump_role": { state: "skimmer" } },
    };
    const result = ambiguous_model_of(
      hass,
      { name: "Pump", elements: undefined as any },
      "aquamedic",
      "DC Runner",
    );
    expect(result?.entity_id).toBeUndefined();
    expect(result?.role).toBeUndefined();
  });
});
