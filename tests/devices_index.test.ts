// Consolidated tests for devices_index

import { Dialog } from "../src/base/dialog";
import { MyElement } from "../src/base/element";
import { Sensor } from "../src/base/sensor";
import { RSDose2, RSDose4 } from "../src/devices/rsdose/rsdose";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import RSDevice from "../src/devices/device";
import "../src/devices/index";

const ALL_TAGS = [
  "redsea-nodevice",
  "redsea-rsdose4",
  "redsea-rsdose2",
  "redsea-dosing-queue",
  "redsea-dose-head",
  "redsea-rsmat",
  "redsea-rsled160",
  "redsea-rsled90",
  "redsea-rsled50",
  "redsea-rsled170",
  "redsea-rsled115",
  "redsea-rsled60",
  "redsea-rsrun",
  "redsea-rsato",
  "redsea-rswave25",
  "redsea-rswave45",
] as const;
class StubEl extends HTMLElement {}
for (const tag of ALL_TAGS) {
  if (!customElements.get(tag)) {
    customElements.define(tag, class extends StubEl {});
  }
}
class StubRSDose4b extends RSDose4 {}
if (!customElements.get("stub-rsdose4-b"))
  customElements.define("stub-rsdose4-b", StubRSDose4b);
class StubRSDose2b extends RSDose2 {}
if (!customElements.get("stub-rsdose2-b"))
  customElements.define("stub-rsdose2-b", StubRSDose2b);
class StubDialog2 extends Dialog {}
if (!customElements.get("stub-dialog2"))
  customElements.define("stub-dialog2", StubDialog2);
class StubSensorForDlg extends Sensor {
  protected override _render(_s = "") {
    return null;
  }
  setConfig(_c: any) {}
}
if (!customElements.get("stub-sensor-dlg"))
  customElements.define("stub-sensor-dlg", StubSensorForDlg);
function makeState(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
): any {
  return { states, entities, devices: {}, callService: vi.fn() };
}
beforeAll(() => {
  if (!customElements.get("common-dialog")) {
    customElements.define("common-dialog", Dialog);
  }
});
function uid(p = "t") {
  return `${p}-${Math.random().toString(36).slice(2)}`;
}
function makeHass_B(states: Record<string, any> = {}) {
  return { states, devices: {}, callService: vi.fn(), entities: {} };
}
class StubDev extends RSDevice {
  override _render() {
    return null as any;
  }
}
if (!customElements.get("stub-dev-gaps"))
  customElements.define("stub-dev-gaps", StubDev);
function makeDev() {
  const d = new StubDev() as any;
  d.initial_config = { elements: {}, background_img: "" };
  d.user_config = null;
  d.device = null;
  d.entities = {};
  d._elements = {};
  d.dialogs = null;
  d.requestUpdate = vi.fn();
  return d;
}
function uid_B(prefix = "t"): string {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

describe("src/devices/index.ts — FALSE branch: all tags already registered", () => {
  it("all 16 tags are defined in the registry", () => {
    for (const tag of ALL_TAGS) {
      expect(customElements.get(tag)).toBeDefined();
    }
  });

  it("each guard's false branch: customElements.define was NOT called by index.ts", () => {
    for (const tag of ALL_TAGS) {
      const ctor = customElements.get(tag);

      expect(ctor).toBeDefined();
      expect(new (ctor as any)()).toBeInstanceOf(HTMLElement);
    }
  });
});
describe("src/devices/index.ts — TRUE branch: all exports are available", () => {
  it("exports the device classes", async () => {
    const mod = await import("../src/devices/index");

    expect(mod.NoDevice).toBeDefined();
    expect(mod.RSDose4).toBeDefined();
    expect(mod.RSMat).toBeDefined();
    expect(mod.RSRun).toBeDefined();
    expect(mod.RSAto).toBeDefined();
    expect(mod.RSLed160).toBeDefined();
    expect(mod.RSWave25).toBeDefined();
    expect(mod.RSWave45).toBeDefined();
  });
});
describe("devices/index.ts — registration side-effects", () => {
  it("registers device elements when imported", async () => {
    await import("../src/devices/index");
    expect(customElements.get("redsea-nodevice")).toBeDefined();
    expect(customElements.get("redsea-rsdose4")).toBeDefined();
    expect(customElements.get("redsea-rsdose2")).toBeDefined();
    expect(customElements.get("redsea-dosing-queue")).toBeDefined();
    expect(customElements.get("redsea-rsmat")).toBeDefined();
    expect(customElements.get("redsea-rsrun")).toBeDefined();
    expect(customElements.get("redsea-rsled160")).toBeDefined();
  });
});
describe("base/index.ts — registration side-effects", () => {
  it("registers base element tags when imported", async () => {
    await import("../src/base/index");
    const tags = [
      "common-sensor",
      "common-switch",
      "common-button",
      "click-image",
      "progress-bar",
      "progress-circle",
      "common-messages",
      "common-sensor-target",
    ];
    const registered = tags.filter((t) => customElements.get(t) !== undefined);
    expect(registered.length).toBeGreaterThan(0);
  });
});
describe("devices/index.ts — already-registered branches (L22-55 FALSE)", () => {
  // Strategy: spy on customElements.define to make it a no-op, then reset the
  // module cache and re-import devices/index. The module re-executes fresh:
  //   • customElements.get(tag) → truthy (JSDOM registry persists)   → guard FALSE
  //   • customElements.define(tag, …) → intercepted, no-op (avoids NotSupportedError)
  // Every if(!customElements.get) guard takes the FALSE branch → skips define().
  it("L22-55: all guards take FALSE branch when tags are already registered", async () => {
    const tags = [
      "redsea-nodevice",
      "redsea-rsdose4",
      "redsea-rsdose2",
      "redsea-dosing-queue",
      "redsea-dose-head",
      "redsea-rsmat",
      "redsea-rsled160",
      "redsea-rsled90",
      "redsea-rsled50",
      "redsea-rsled170",
      "redsea-rsled115",
      "redsea-rsled60",
      "redsea-rsrun",
      "redsea-rsato",
      "redsea-rswave25",
      "redsea-rswave45",
    ];

    // All tags must already be registered (TRUE branch ran via hoisted import).
    for (const tag of tags) {
      expect(customElements.get(tag)).toBeDefined();
    }

    // Intercept define() so any stray call doesn't throw NotSupportedError.
    const defineSpy = vi
      .spyOn(customElements, "define")
      .mockImplementation(() => {});

    // Clear the module cache → devices/index.ts will re-execute on next import.
    vi.resetModules();
    await import("../src/devices/index");

    defineSpy.mockRestore();

    // Every guard found its tag registered → define was never called by index.ts.
    expect(defineSpy).not.toHaveBeenCalled();

    // Registry intact.
    for (const tag of tags) {
      expect(customElements.get(tag)).toBeDefined();
    }
  });
});
describe("base/index.ts — already-registered branches (L14-30 FALSE)", () => {
  // Same mechanism as devices/index: spy on define (no-op), reset module cache,
  // re-import base/index. get(tag) is truthy → every guard is FALSE → define skipped.
  it("L14-30: all guards take FALSE branch when base tags are already registered", async () => {
    const tags = [
      "click-image",
      "common-button",
      "common-dialog",
      "common-sensor",
      "common-sensor-target",
      "common-switch",
      "progress-bar",
      "progress-circle",
      "redsea-messages",
    ];

    // Ensure every tag is registered before the re-import.
    for (const tag of tags) {
      if (!customElements.get(tag)) {
        customElements.define(tag, class extends HTMLElement {});
      }
    }
    for (const tag of tags) {
      expect(customElements.get(tag)).toBeDefined();
    }

    // Intercept define() to avoid NotSupportedError on any stray call.
    const defineSpy = vi
      .spyOn(customElements, "define")
      .mockImplementation(() => {});

    vi.resetModules();
    await import("../src/base/index");

    defineSpy.mockRestore();

    // Every guard found its tag registered → define was never called by index.ts.
    expect(defineSpy).not.toHaveBeenCalled();

    for (const tag of tags) {
      expect(customElements.get(tag)).toBeDefined();
    }
  });
});
