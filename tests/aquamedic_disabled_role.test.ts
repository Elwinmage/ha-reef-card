/**
 * Tests for an ambiguous model (Aqua Medic "DC Runner": return pump or
 * skimmer) whose device is disabled in Home Assistant.
 *
 * A disabled device has no entity left for the frontend — the pump_role
 * select carries no state and is not even listed — so the card used to
 * show its role picker instead of the "disabled" banner. The role is now
 * read back from the `model_id` of the device registry entry, where
 * ha-aquamedic-component records it:
 *   - with a role there, the right device draws its own greyed picture
 *     under the banner;
 *   - without one, the banner is drawn over the pictures of every device
 *     it could be, and no picker is offered.
 */

import { describe, expect, it, vi } from "vitest";

import { RSDevice } from "../src/devices/device";
import { ambiguous_model_of, resolve_device_model } from "../src/utils/common";
import { KNOWN_DEVICE_DOMAINS } from "../src/utils/constants";
// Registers aquamedic-dcrunner, aquamedic-dcskimmer and the other tags.
import "../src/devices/index";

const RUNNER_PICTURE = "am-dcrunner.png";
const SKIMMER_PICTURE = "am-dcskimmer.png";
const BANNER_CLASS = "disabled_in_ha";
const PICKER_ID = "pump_role_select";

//----------------------------------------------------------------------------//
//   Helpers
//----------------------------------------------------------------------------//

/** Flatten a lit TemplateResult into its rendered text, nested ones included. */
function markup(tpl: any): string {
  if (tpl == null) return "";
  if (Array.isArray(tpl)) return tpl.map(markup).join("");
  if (tpl?.strings && tpl?.values) {
    let out = "";
    tpl.strings.forEach((s: string, i: number) => {
      out += s;
      if (i < tpl.values.length) {
        const v = tpl.values[i];
        if (typeof v !== "function" && !(v instanceof HTMLElement)) {
          out += markup(v);
        }
      }
    });
    return out;
  }
  return String(tpl);
}

/** Registry entry of a DC Runner series pump. */
function makeElement(over: Record<string, any> = {}): any {
  return {
    id: "dev1",
    model: "DC Runner",
    identifiers: [["aquamedic", "did1"]],
    disabled_by: null,
    primary_config_entry: "cfg1",
    ...over,
  };
}

/** hass as the frontend gets it for a disabled device: no entity at all. */
function makeHassWithoutEntities(): any {
  return { states: {}, entities: {}, devices: {}, callService: vi.fn() };
}

/** hass with the pump_role select in the given state. */
function makeHassWithRole(state: string): any {
  return {
    states: { "select.pump_role": { state } },
    entities: {
      "select.pump_role": { device_id: "dev1", translation_key: "pump_role" },
    },
    devices: {},
    callService: vi.fn(),
  };
}

/** Build an AMDCRunner on the given registry entry and hass. */
function makeDCRunner(element: any, hass: any): any {
  const device: any = new (customElements.get("aquamedic-dcrunner") as any)();
  device.device = { name: "Pump", elements: [element] };
  device.entities = {};
  device._hass = hass;
  device.setConfig(null);
  return device;
}

/** A DC Runner disabled in Home Assistant, with the given registry role. */
function makeDisabled(model_id?: string): any {
  return makeDCRunner(
    makeElement({ disabled_by: "user", model_id }),
    makeHassWithoutEntities(),
  );
}

//----------------------------------------------------------------------------//
//   Role read back from the registry
//----------------------------------------------------------------------------//

describe("ambiguous_model_of() — role from the registry", () => {
  const lookup = (hass: any, model_id?: string) =>
    ambiguous_model_of(
      hass,
      { name: "Pump", elements: [makeElement({ model_id })] } as any,
      "aquamedic",
      "DC Runner",
    );

  it("falls back on model_id when the role entity is gone", () => {
    const found = lookup(makeHassWithoutEntities(), "skimmer");
    expect(found?.entity_id).toBeUndefined();
    expect(found?.role).toBe("skimmer");
  });

  it("falls back on model_id when the entity names no role", () => {
    expect(lookup(makeHassWithRole("unavailable"), "return")?.role).toBe(
      "return",
    );
    expect(lookup(makeHassWithRole("unknown"), "skimmer")?.role).toBe(
      "skimmer",
    );
  });

  it("lets a role declared by the entity win over the registry", () => {
    expect(lookup(makeHassWithRole("return"), "skimmer")?.role).toBe("return");
  });

  it("keeps the entity state when model_id names no role either", () => {
    expect(lookup(makeHassWithRole("unknown"), "whatever")?.role).toBe(
      "unknown",
    );
    expect(lookup(makeHassWithoutEntities())?.role).toBeUndefined();
  });

  it("resolves the concrete model of a disabled device", () => {
    const info: any = {
      name: "Pump",
      elements: [makeElement({ disabled_by: "user", model_id: "skimmer" })],
    };
    expect(
      resolve_device_model(
        makeHassWithoutEntities(),
        info,
        "aquamedic",
        "DC Runner",
      ),
    ).toBe("DC Skimmer");
  });
});

//----------------------------------------------------------------------------//
//   Disabled device, role known
//----------------------------------------------------------------------------//

describe("disabled ambiguous device — role known from the registry", () => {
  it("shows the banner over the return pump, not the picker", () => {
    const result = markup(makeDisabled("return").render());
    expect(result).toContain(BANNER_CLASS);
    expect(result).toContain("device_img_disabled");
    expect(result).toContain(RUNNER_PICTURE);
    expect(result).not.toContain(PICKER_ID);
  });

  it("hands over to the skimmer, which shows the banner over its own picture", () => {
    const device = makeDisabled("skimmer");
    expect(markup(device.render())).not.toContain(PICKER_ID);

    const delegate = device._delegate;
    expect(delegate?.tagName.toLowerCase()).toBe("aquamedic-dcskimmer");
    const result = markup(delegate.render());
    expect(result).toContain(BANNER_CLASS);
    expect(result).toContain("device_img_disabled");
    expect(result).toContain(SKIMMER_PICTURE);
    expect(result).not.toContain(RUNNER_PICTURE);
    expect(result).not.toContain(PICKER_ID);
  });
});

//----------------------------------------------------------------------------//
//   Disabled device, role unknown
//----------------------------------------------------------------------------//

describe("disabled ambiguous device — role unknown", () => {
  it("shows the banner over both pictures, without a picker", () => {
    const result = markup(makeDisabled().render());
    expect(result).toContain(BANNER_CLASS);
    expect(result).toContain("device_roles_disabled");
    expect(result).toContain(RUNNER_PICTURE);
    expect(result).toContain(SKIMMER_PICTURE);
    expect(result).not.toContain(PICKER_ID);
  });

  it("does the same when the entity is listed but says unknown", () => {
    const device = makeDCRunner(
      makeElement({ disabled_by: "user" }),
      makeHassWithRole("unknown"),
    );
    const result = markup(device.render());
    expect(result).toContain("device_roles_disabled");
    expect(result).not.toContain(PICKER_ID);
  });

  it("still offers the picker while the device is enabled", () => {
    const device = makeDCRunner(makeElement(), makeHassWithRole("unknown"));
    const result = markup(device.render());
    expect(result).toContain(PICKER_ID);
    expect(result).not.toContain(BANNER_CLASS);
  });

  it("looks the pictures up once", () => {
    const device = makeDisabled();
    const override =
      KNOWN_DEVICE_DOMAINS["aquamedic"]!.model_overrides!["DC Runner"]!;
    const first = device._role_pictures("aquamedic", override);
    expect(first).toHaveLength(2);
    expect(device._role_pictures("aquamedic", override)).toBe(first);
  });

  it("leaves out a role without a view or without a picture", () => {
    // A view carrying no picture, to stand next to a model nothing registers
    class BareDevice extends RSDevice {}
    if (!customElements.get("testdomain-bare")) {
      customElements.define("testdomain-bare", BareDevice);
    }
    KNOWN_DEVICE_DOMAINS["testdomain"] = {
      tag_prefix: "testdomain",
      model_overrides: {
        Ambiguous: {
          role_translation_key: "test_role",
          role_to_model: { a: "Bare", b: "Nonexistent Model", c: "Ambiguous" },
        },
      },
    };
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const device = makeDCRunner(
        makeElement({
          model: "Ambiguous",
          identifiers: [["testdomain", "did1"]],
          disabled_by: "user",
        }),
        makeHassWithoutEntities(),
      );
      // The instance stands for the raw model, as AMDCRunner does for
      // "DC Runner": that is what makes it reach the unknown-role view.
      device.initial_config = { ...device.initial_config, model: "Ambiguous" };

      const result = markup(device.render());
      expect(result).toContain(BANNER_CLASS);
      expect(result).toContain("device_roles_disabled");
      expect(result).not.toContain("<img");
    } finally {
      delete KNOWN_DEVICE_DOMAINS["testdomain"];
      error.mockRestore();
    }
  });
});

//----------------------------------------------------------------------------//
//   Registry updates
//----------------------------------------------------------------------------//

describe("_setting_hass() — role recorded in the registry", () => {
  it("picks up a model_id written after the device was loaded", () => {
    const device = makeDisabled();
    device.hass = makeHassWithoutEntities();
    device.to_render = false;

    const hass = makeHassWithoutEntities();
    hass.devices = {
      dev1: makeElement({ disabled_by: "user", model_id: "skimmer" }),
    };
    device.hass = hass;

    expect(device.device.elements[0].model_id).toBe("skimmer");
    expect(device.to_render).toBe(true);
    expect(markup(device.render())).not.toContain("device_roles_disabled");
    expect(device._delegate?.tagName.toLowerCase()).toBe("aquamedic-dcskimmer");
  });

  it("leaves a model_id that did not change alone", () => {
    const device = makeDisabled("return");
    device.hass = makeHassWithoutEntities();
    device.to_render = false;

    const hass = makeHassWithoutEntities();
    hass.devices = {
      dev1: makeElement({ disabled_by: "user", model_id: "return" }),
    };
    device.hass = hass;

    expect(device.to_render).toBe(false);
  });
});
