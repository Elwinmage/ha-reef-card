/**
 * Tests for the runtime-built rows of the RSRun "add pump" dialog:
 *   - unknown  -> type only
 *   - return   -> type, sensor model, editable name
 *   - skimmer  -> type, select model, editable name
 *   - the DOM is only rebuilt when the detected type changes
 */

import { add_pump } from "../src/devices/redsea/rsrun/rsrun_pump.dialog_func_ext";
import { RSDevice } from "../src/devices/device";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Registry entries the integration exposes for a fully configured pump */
const ENTITIES: Record<string, { entity_id: string }> = {
  type: { entity_id: "sensor.pump_1_type" },
  model: { entity_id: "sensor.pump_1_model" },
  "sensor.model": { entity_id: "sensor.pump_1_model" },
  "select.model": { entity_id: "select.pump_1_model" },
  pump_name: { entity_id: "text.pump_1_name" },
};

function makeHass(type: string, entities = ENTITIES): any {
  const states: Record<string, any> = {};
  for (const key in entities) {
    const entity_id = entities[key].entity_id;
    states[entity_id] = { entity_id, state: "x", attributes: {} };
  }
  if (states[entities.type?.entity_id]) {
    states[entities.type.entity_id].state = type;
  }
  return { states };
}

/** Minimal dialog shadow root: only #dialog-content is needed */
function makeShadowRoot(): any {
  const root = document.createElement("div");
  const content = document.createElement("div");
  content.id = "dialog-content";
  root.appendChild(content);
  return root;
}

function makeElt(entities = ENTITIES): any {
  return { device: { entities, parent_entities: {} } };
}

/** Entity ids handed to the generated entities card, in order */
function rows(shadowRoot: any): string[] {
  const card = shadowRoot.querySelector("#add-pump-rows")?.firstChild as any;
  return card ? card.__config.entities.map((e: any) => e.entity) : [];
}

beforeEach(() => {
  // Stand in for the lazily loaded HA card helpers
  RSDevice._helpersResolved = {
    createCardElement: (config: any) => {
      const card: any = document.createElement("div");
      card.__config = config;
      return card;
    },
  };
});

//----------------------------------------------------------------------------//

describe("add_pump dialog rows", () => {
  it("shows only the type before the detection ran", () => {
    const shadowRoot = makeShadowRoot();
    add_pump(makeElt(), makeHass("unknown"), shadowRoot);
    expect(rows(shadowRoot)).toEqual(["sensor.pump_1_type"]);
  });

  it("falls back to the unknown layout for an unexpected type", () => {
    const shadowRoot = makeShadowRoot();
    add_pump(makeElt(), makeHass("wave"), shadowRoot);
    expect(rows(shadowRoot)).toEqual(["sensor.pump_1_type"]);
  });

  it("shows the sensor model for a return pump", () => {
    const shadowRoot = makeShadowRoot();
    add_pump(makeElt(), makeHass("return"), shadowRoot);
    expect(rows(shadowRoot)).toEqual([
      "sensor.pump_1_type",
      "sensor.pump_1_model",
      "text.pump_1_name",
    ]);
  });

  it("shows the select model for a skimmer", () => {
    const shadowRoot = makeShadowRoot();
    add_pump(makeElt(), makeHass("skimmer"), shadowRoot);
    expect(rows(shadowRoot)).toEqual([
      "sensor.pump_1_type",
      "select.pump_1_model",
      "text.pump_1_name",
    ]);
  });

  it("drops rows whose entity has no state", () => {
    const shadowRoot = makeShadowRoot();
    const hass = makeHass("return");
    delete hass.states["text.pump_1_name"];
    add_pump(makeElt(), hass, shadowRoot);
    expect(rows(shadowRoot)).toEqual([
      "sensor.pump_1_type",
      "sensor.pump_1_model",
    ]);
  });

  it("renders nothing when the type entity is unusable", () => {
    const shadowRoot = makeShadowRoot();
    add_pump(makeElt({}), makeHass("return", {}), shadowRoot);
    expect(shadowRoot.querySelector("#add-pump-rows")).toBeNull();
  });

  it("keeps the DOM while the type does not change", () => {
    const shadowRoot = makeShadowRoot();
    const elt = makeElt();
    add_pump(elt, makeHass("return"), shadowRoot);
    const first = shadowRoot.querySelector("#add-pump-rows");
    add_pump(elt, makeHass("return"), shadowRoot);
    expect(shadowRoot.querySelector("#add-pump-rows")).toBe(first);
  });

  it("rebuilds the rows once the detection changes the type", () => {
    const shadowRoot = makeShadowRoot();
    const elt = makeElt();
    add_pump(elt, makeHass("unknown"), shadowRoot);
    const first = shadowRoot.querySelector("#add-pump-rows");
    add_pump(elt, makeHass("skimmer"), shadowRoot);
    expect(shadowRoot.querySelector("#add-pump-rows")).not.toBe(first);
    expect(rows(shadowRoot)).toHaveLength(3);
  });

  it("pushes hass down to the card instead of rebuilding it", () => {
    const shadowRoot = makeShadowRoot();
    const elt = makeElt();
    add_pump(elt, makeHass("skimmer"), shadowRoot);
    const next = makeHass("skimmer");
    add_pump(elt, next, shadowRoot);
    const card: any = shadowRoot.querySelector("#add-pump-rows").firstChild;
    expect(card.hass).toBe(next);
  });

  it("waits for the HA helpers rather than rendering an empty dialog", () => {
    RSDevice._helpersResolved = null;
    vi.spyOn(customElements, "get").mockReturnValue(undefined as any);
    const shadowRoot = makeShadowRoot();
    add_pump(makeElt(), makeHass("skimmer"), shadowRoot);
    expect(shadowRoot.querySelector("#add-pump-rows")).toBeNull();
    vi.restoreAllMocks();
  });
});
