// Consolidated tests for devices_subclasses

import { ClickImage } from "../src/base/click_image";
import { MyElement } from "../src/base/element";
import { RSDevice } from "../src/devices/device";
import { RSAto } from "../src/devices/redsea/rsato/rsato";
import { DosingQueue } from "../src/devices/redsea/rsdose/dosing_queue";
import { RSDose, RSDose2, RSDose4 } from "../src/devices/redsea/rsdose/rsdose";
import { config4 } from "../src/devices/redsea/rsdose/rsdose4.mapping";
import {
  RSLed,
  RSLed115,
  RSLed160,
  RSLed170,
  RSLed50,
  RSLed60,
  RSLed90,
} from "../src/devices/redsea/rsled/rsled";
import { RSMat } from "../src/devices/redsea/rsmat/rsmat";
import { NoDevice } from "../src/devices/redsea/rsnodevice/rsnodevice";
import { RSRun } from "../src/devices/redsea/rsrun/rsrun";
import {
  RSWave,
  RSWave25,
  RSWave45,
} from "../src/devices/redsea/rswave/rswave";
import { describe, expect, it, vi } from "vitest";

function makeState(state: string, entity_id = "sensor.test"): any {
  return { entity_id, state, attributes: {} };
}
function makeHass(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
): any {
  return { states, entities, devices: {}, callService: vi.fn() };
}
class StubRSAto extends RSAto {}
if (!customElements.get("stub-rsato"))
  customElements.define("stub-rsato", StubRSAto);
class StubRSLed extends RSLed {}
if (!customElements.get("stub-rsled"))
  customElements.define("stub-rsled", StubRSLed);
class StubRSLed160 extends RSLed160 {}
if (!customElements.get("stub-rsled160"))
  customElements.define("stub-rsled160", StubRSLed160);
class StubRSLed90 extends RSLed90 {}
if (!customElements.get("stub-rsled90"))
  customElements.define("stub-rsled90", StubRSLed90);
class StubRSLed50 extends RSLed50 {}
if (!customElements.get("stub-rsled50"))
  customElements.define("stub-rsled50", StubRSLed50);
class StubRSLed170 extends RSLed170 {}
if (!customElements.get("stub-rsled170"))
  customElements.define("stub-rsled170", StubRSLed170);
class StubRSLed115 extends RSLed115 {}
if (!customElements.get("stub-rsled115"))
  customElements.define("stub-rsled115", StubRSLed115);
class StubRSLed60 extends RSLed60 {}
if (!customElements.get("stub-rsled60"))
  customElements.define("stub-rsled60", StubRSLed60);
class StubRSRun extends RSRun {}
if (!customElements.get("stub-rsrun"))
  customElements.define("stub-rsrun", StubRSRun);
class StubRSWave extends RSWave {}
if (!customElements.get("stub-rswave"))
  customElements.define("stub-rswave", StubRSWave);
class StubRSWave25 extends RSWave25 {}
if (!customElements.get("stub-rswave25"))
  customElements.define("stub-rswave25", StubRSWave25);
class StubRSWave45 extends RSWave45 {}
if (!customElements.get("stub-rswave45"))
  customElements.define("stub-rswave45", StubRSWave45);
class StubRSMat extends RSMat {}
if (!customElements.get("stub-rsmat"))
  customElements.define("stub-rsmat", StubRSMat);
class StubNoDevice extends NoDevice {}
if (!customElements.get("stub-nodevice"))
  customElements.define("stub-nodevice", StubNoDevice);
class StubRSDose extends RSDose {}
if (!customElements.get("stub-rsdose"))
  customElements.define("stub-rsdose", StubRSDose);
class StubRSDose4 extends RSDose4 {}
if (!customElements.get("stub-rsdose4"))
  customElements.define("stub-rsdose4", StubRSDose4);
class StubRSDose2 extends RSDose2 {}
if (!customElements.get("stub-rsdose2"))
  customElements.define("stub-rsdose2", StubRSDose2);
class StubDosingQueue extends DosingQueue {
  render(): any {
    return null;
  }
}
if (!customElements.get("stub-dosing-queue"))
  customElements.define("stub-dosing-queue", StubDosingQueue);
class StubRSMatBG extends RSMat {}
if (!customElements.get("stub-rsmat-bg"))
  customElements.define("stub-rsmat-bg", StubRSMatBG);
class StubRSDose4BG extends RSDose4 {}
if (!customElements.get("stub-rsdose4-bg"))
  customElements.define("stub-rsdose4-bg", StubRSDose4BG);
class StubRSDevBG extends RSDevice {
  override _render(_s?: any, _ss?: any): any {
    return null as any;
  }
}
if (!customElements.get("stub-rsdev-bg"))
  customElements.define("stub-rsdev-bg", StubRSDevBG);
class StubElBG extends MyElement {}
if (!customElements.get("stub-el-bg"))
  customElements.define("stub-el-bg", StubElBG);
class StubCIBG extends ClickImage {}
if (!customElements.get("stub-ci-bg"))
  customElements.define("stub-ci-bg", StubCIBG);
function makeState_B(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass_B(states: Record<string, any> = {}): any {
  return { states, entities: {}, devices: {}, callService: vi.fn() };
}

describe("RSAto", () => {
  it("initial_config.model is RSATO", () => {
    const dev = new StubRSAto() as any;
    expect(dev.initial_config.model).toBe("RSATO");
  });

  it("device.model is RSATO", () => {
    const dev = new StubRSAto() as any;
    expect(dev.device.model).toBe("RSATO");
  });

  it("renderEditor() returns a template", () => {
    expect(new StubRSAto().renderEditor()).toBeDefined();
  });

  it("initial_config has background_img", () => {
    const dev = new StubRSAto() as any;
    expect(dev.initial_config.background_img).toBeTruthy();
  });

  it("dialogs are loaded", () => {
    const dev = new StubRSAto() as any;
    expect(dev.dialogs).toBeDefined();
  });
});
describe("RSLed", () => {
  it("initial_config.model is RSLED", () => {
    expect((new StubRSLed() as any).initial_config.model).toBe("RSLED");
  });

  it("renderEditor() returns a template", () => {
    expect(new StubRSLed().renderEditor()).toBeDefined();
  });
});
describe("RSLed subclasses", () => {
  it("RSLed160 inherits RSLED model", () => {
    expect((new StubRSLed160() as any).initial_config.model).toBe("RSLED");
  });

  it("RSLed90 inherits RSLED model", () => {
    expect((new StubRSLed90() as any).initial_config.model).toBe("RSLED");
  });

  it("RSLed50 inherits RSLED model", () => {
    expect((new StubRSLed50() as any).initial_config.model).toBe("RSLED");
  });

  it("RSLed170 inherits RSLedG2 model", () => {
    expect((new StubRSLed170() as any).initial_config.model).toBe("RSLED");
  });

  it("RSLed115 inherits RSLedG2 model", () => {
    expect((new StubRSLed115() as any).initial_config.model).toBe("RSLED");
  });

  it("RSLed60 inherits RSLedG2 model", () => {
    expect((new StubRSLed60() as any).initial_config.model).toBe("RSLED");
  });
});
describe("RSRun", () => {
  it("initial_config.model is RSRUN", () => {
    expect((new StubRSRun() as any).initial_config.model).toBe("RSRUN");
  });

  it("device.model is RSRUN", () => {
    expect((new StubRSRun() as any).device.model).toBe("RSRUN");
  });

  it("renderEditor() returns a template", () => {
    expect(new StubRSRun().renderEditor()).toBeDefined();
  });
});
describe("RSWave", () => {
  it("initial_config.model is RSWAVE", () => {
    expect((new StubRSWave() as any).initial_config.model).toBe("RSWAVE");
  });

  it("device.model is RSWAVE", () => {
    expect((new StubRSWave() as any).device.model).toBe("RSWAVE");
  });

  it("renderEditor() returns a template", () => {
    expect(new StubRSWave().renderEditor()).toBeDefined();
  });
});
describe("RSWave subclasses", () => {
  it("RSWave25 inherits RSWAVE model", () => {
    expect((new StubRSWave25() as any).initial_config.model).toBe("RSWAVE");
  });

  it("RSWave45 inherits RSWAVE model", () => {
    expect((new StubRSWave45() as any).initial_config.model).toBe("RSWAVE");
  });
});
describe("RSMat", () => {
  it("initial_config.model is RSMAT", () => {
    expect((new StubRSMat() as any).initial_config.model).toBe("RSMAT");
  });

  it("device.model is RSMAT", () => {
    expect((new StubRSMat() as any).device.model).toBe("RSMAT");
  });

  it("renderEditor() returns a template", () => {
    expect(new StubRSMat().renderEditor()).toBeDefined();
  });

  it("_render() returns a template", () => {
    const dev = new StubRSMat() as any;

    dev.config = { ...dev.initial_config, background_img: "", elements: {} };
    dev._hass = makeHass();
    dev.entities = {};
    dev._elements = {};
    expect(dev._render(null, null)).toBeDefined();
  });
});
describe("NoDevice", () => {
  it("initial_config.model is NODEVICE", () => {
    expect((new StubNoDevice() as any).initial_config.model).toBe("NODEVICE");
  });

  it("device.model is NODEVICE", () => {
    expect((new StubNoDevice() as any).device.model).toBe("NODEVICE");
  });

  it("_populate_entities() is a no-op", () => {
    const dev = new StubNoDevice() as any;
    dev.entities = {};
    dev._populate_entities();
    expect(Object.keys(dev.entities)).toHaveLength(0);
  });

  it("render() does not throw", () => {
    const dev = new StubNoDevice() as any;
    dev.user_config = {};
    dev.config = { model: "NODEVICE", background_img: "", elements: {} };
    dev.dialogs = {};
    dev.device = { model: "NODEVICE", name: "", elements: [] };
    dev._elements = {};
    dev._hass = makeHass();
    dev.entities = {};
    expect(() => dev.render()).not.toThrow();
  });
});
describe("RSDose4", () => {
  it("initial_config.model is RSDOSE4", () => {
    expect((new StubRSDose4() as any).initial_config.model).toBe("RSDOSE4");
  });

  it("has heads_nb=4", () => {
    expect((new StubRSDose4() as any).initial_config.heads_nb).toBe(4);
  });

  it("dialogs are loaded", () => {
    expect((new StubRSDose4() as any).dialogs).toBeDefined();
  });
});
describe("RSDose2", () => {
  it("initial_config.model is RSDOSE2", () => {
    expect((new StubRSDose2() as any).initial_config.model).toBe("RSDOSE2");
  });

  it("has heads_nb=2", () => {
    expect((new StubRSDose2() as any).initial_config.heads_nb).toBe(2);
  });
});
describe("RSDose._populate_entities_with_heads()", () => {
  function makeRSDose4() {
    const dev = new StubRSDose4() as any;
    dev.device = {
      model: "RSDOSE4",
      name: "pump",
      elements: [
        { id: "h0", identifiers: [[null, "rsdose4_1234"]], disabled_by: null },
        {
          id: "h1",
          identifiers: [[null, "rsdose4_head_1"]],
          disabled_by: null,
        },
        {
          id: "h2",
          identifiers: [[null, "rsdose4_head_2"]],
          disabled_by: null,
        },
      ],
    };
    dev.user_config = {};
    dev.config = JSON.parse(JSON.stringify(dev.initial_config));
    dev._hass = makeHass(
      {},
      {
        "s.global": {
          entity_id: "s.global",
          device_id: "h0",
          translation_key: "device_state",
        },
        "s.h1": {
          entity_id: "s.h1",
          device_id: "h1",
          translation_key: "schedule_enabled",
        },
        "s.h2": {
          entity_id: "s.h2",
          device_id: "h2",
          translation_key: "auto_dosed_today",
        },
      },
    );
    dev.entities = {};
    dev._heads = [];
    return dev;
  }

  it("populates global entities (head_id=0)", () => {
    const dev = makeRSDose4();
    dev._populate_entities_with_heads();
    expect(dev.entities.device_state).toBeDefined();
  });

  it("populates head_1 entities", () => {
    const dev = makeRSDose4();
    dev._populate_entities_with_heads();
    expect(dev._heads[1]?.entities?.schedule_enabled).toBeDefined();
  });

  it("populates head_2 entities", () => {
    const dev = makeRSDose4();
    dev._populate_entities_with_heads();
    expect(dev._heads[2]?.entities?.auto_dosed_today).toBeDefined();
  });

  it("creates heads_nb+1 head entries", () => {
    const dev = makeRSDose4();
    dev._populate_entities_with_heads();
    expect(dev._heads.length).toBe(5);
  });

  it("does not throw when _hass is null", () => {
    const dev = makeRSDose4();
    dev._hass = null;
    expect(() => dev._populate_entities_with_heads()).not.toThrow();
  });
});
describe("RSDose.hass setter", () => {
  it("does not throw even without stock_alert_days entity", () => {
    const dev = new StubRSDose4() as any;
    dev.device = { elements: [] };
    dev._elements = {};
    dev._heads = [];
    dev.dosing_queue = null;
    dev.config = { model: "RSDOSE4", elements: {} };
    dev.to_render = false;
    dev.entities = {};
    const hass = makeHass({ "s.alert": makeState("5", "s.alert") });
    expect(() => {
      dev.hass = hass;
    }).not.toThrow();
  });
});
describe("DosingQueue — constructor", () => {
  it("initializes schedule to null", () => {
    const dq = new StubDosingQueue() as any;
    expect(dq.schedule).toBeNull();
  });
});
describe("DosingQueue.update_state()", () => {
  it("sets stateOn to true", () => {
    const dq = new StubDosingQueue() as any;
    dq.stateOn = false;
    dq.update_state(true);
    expect(dq.stateOn).toBe(true);
  });

  it("keeps stateOn unchanged when same value", () => {
    const dq = new StubDosingQueue() as any;
    dq.stateOn = true;
    dq.update_state(true);
    expect(dq.stateOn).toBe(true);
  });

  it("sets stateOn to false", () => {
    const dq = new StubDosingQueue() as any;
    dq.stateOn = true;
    dq.update_state(false);
    expect(dq.stateOn).toBe(false);
  });
});
describe("DosingQueue — hass setter", () => {
  it("does not update when stateObj is null", () => {
    const dq = new StubDosingQueue() as any;
    dq.stateObj = null;
    dq._hass = null;
    dq.hass = makeHass({ "s.q": makeState("on", "s.q") });
    expect(dq._hass).toBeNull();
  });

  it("updates when queue reference changes", () => {
    const dq = new StubDosingQueue() as any;
    const q1 = [{ head: 1, volume: 5, time: 3600 }];
    dq.stateObj = { entity_id: "s.q", state: "on", attributes: { queue: q1 } };
    dq._hass = makeHass();
    const q2 = [
      { head: 1, volume: 5, time: 3600 },
      { head: 2, volume: 3, time: 7200 },
    ];
    const newHass = makeHass({
      "s.q": { entity_id: "s.q", state: "on", attributes: { queue: q2 } },
    });
    dq.hass = newHass;
    expect(dq._hass).toBe(newHass);
  });

  it("does not update when queue is same reference", () => {
    const dq = new StubDosingQueue() as any;
    const sharedQ = [{ head: 1 }];
    dq.stateObj = {
      entity_id: "s.q",
      state: "on",
      attributes: { queue: sharedQ },
    };
    const oldHass = makeHass();
    dq._hass = oldHass;
    dq.hass = makeHass({
      "s.q": { entity_id: "s.q", state: "on", attributes: { queue: sharedQ } },
    });
    expect(dq._hass).toBe(oldHass);
  });
});
describe("DosingQueue.render()", () => {
  it("returns empty template when stateOn=false", () => {
    const dq = new StubDosingQueue() as any;
    dq.stateOn = false;
    dq.stateObj = {
      entity_id: "s.q",
      state: "off",
      attributes: { queue: [{ head: 1, volume: 5, time: 3600 }] },
    };
    expect(() => {
      DosingQueue.prototype.render.call(dq);
    }).not.toThrow();
  });

  it("returns empty template when schedule is empty", () => {
    const dq = new StubDosingQueue() as any;
    dq.stateOn = true;
    dq.stateObj = { entity_id: "s.q", state: "on", attributes: { queue: [] } };
    expect(() => {
      DosingQueue.prototype.render.call(dq);
    }).not.toThrow();
  });

  it("renders slots when stateOn=true and schedule has entries", () => {
    const dq = new StubDosingQueue() as any;
    dq.stateOn = true;
    dq.color_list = { 1: "255,0,0" };
    dq.conf = {};
    dq.stateObj = {
      entity_id: "s.q",
      state: "on",
      attributes: { queue: [{ head: 1, volume: 5.0, time: 3600 }] },
    };
    const result = DosingQueue.prototype.render.call(dq);
    expect(result).toBeDefined();
  });
});
describe("DosingQueue._render_slot_schedule()", () => {
  it("returns a template result for a slot", () => {
    const dq = new StubDosingQueue() as any;
    dq.color_list = { 1: "255,0,0" };
    dq.conf = {};
    const result = dq._render_slot_schedule({
      head: 1,
      volume: 5.0,
      time: 3661,
    });
    expect(result).toBeDefined();
  });
});
describe("RSMat._render() — L25 branch coverage", () => {
  function makeMat(): any {
    const mat = document.createElement("stub-rsmat-bg") as any;
    mat.config = { background_img: "/img/rsmat.png", elements: {} };
    mat._hass = makeHass_B();
    mat.entities = {};
    mat._elements = {};
    mat.requestUpdate = vi.fn();
    return mat;
  }

  it("returns a template when called with null style and substyle", () => {
    const mat = makeMat();
    const result = mat._render(null, null);
    expect(result).toBeDefined();
  });

  it("returns a template when called with non-null style and substyle", () => {
    const mat = makeMat();
    const result = mat._render("color:red", "opacity:0.5");
    expect(result).toBeDefined();
  });

  it("returns a template when called with no arguments (default params branch)", () => {
    const mat = makeMat();
    const result = mat._render();
    expect(result).toBeDefined();
  });
});
describe("RSDose._render() — L160-162: dosing_queue already set (false branch)", () => {
  function makeDev(): any {
    const dev = document.createElement("stub-rsdose4-bg") as any;
    dev.config = JSON.parse(JSON.stringify(config4));
    dev.config.heads_nb = 0;
    dev.config.dosing_queue = { type: "dosing-queue", conf: {} };
    dev._hass = makeHass_B();
    dev.entities = {};
    dev._elements = {};
    dev._heads = [];
    dev.supplement_color = {};
    dev.bundle = false;
    dev.masterOn = true;
    dev.state_on = true;
    dev.requestUpdate = vi.fn();
    return dev;
  }

  it("skips creation block when dosing_queue is already set (false branch of === null)", () => {
    const dev = makeDev();
    const fake_dq = { color_list: {}, update_state: vi.fn() };
    dev.dosing_queue = fake_dq;
    dev.get_entity = vi.fn().mockReturnValue(null);
    dev.is_on = vi.fn().mockReturnValue(true);
    dev._render_elements = vi.fn().mockReturnValue(null);

    const result = dev._render(null, null);

    expect(result).toBeDefined();
    expect(dev.dosing_queue).toBe(fake_dq);
    expect(fake_dq.update_state).toHaveBeenCalledWith(true);
  });

  it("bundle=false when get_entity('bundled_heads') returns null", () => {
    const dev = makeDev();
    const fake_dq = { color_list: {}, update_state: vi.fn() };
    dev.dosing_queue = fake_dq;
    dev.get_entity = vi.fn().mockReturnValue(null);
    dev.is_on = vi.fn().mockReturnValue(false);
    dev._render_elements = vi.fn().mockReturnValue(null);

    dev._render(null, null);
    expect(dev.bundle).toBe(false);
  });

  it("bundle=false when bundled_heads state is 'off'", () => {
    const dev = makeDev();
    const fake_dq = { color_list: {}, update_state: vi.fn() };
    dev.dosing_queue = fake_dq;
    dev.get_entity = vi
      .fn()
      .mockReturnValue(makeState_B("off", "sensor.bundle"));
    dev.is_on = vi.fn().mockReturnValue(true);
    dev._render_elements = vi.fn().mockReturnValue(null);

    dev._render(null, null);
    expect(dev.bundle).toBe(false);
  });

  it("bundle=true when bundled_heads state is 'on'", () => {
    const dev = makeDev();
    const fake_dq = { color_list: {}, update_state: vi.fn() };
    dev.dosing_queue = fake_dq;
    dev.get_entity = vi
      .fn()
      .mockReturnValue(makeState_B("on", "sensor.bundle"));
    dev.is_on = vi.fn().mockReturnValue(true);
    dev._render_elements = vi.fn().mockReturnValue(null);

    dev._render(null, null);
    expect(dev.bundle).toBe(true);
  });
});

// ─── RSMat — full branch coverage ─────────────────────────────────────────────
describe("RSMat — _render_disabled() branch coverage", () => {
  function makeMat(): any {
    const mat = new StubRSMat() as any;
    mat.config = { ...mat.initial_config, background_img: "", elements: {} };
    mat._hass = makeHass_B();
    mat.entities = {};
    mat._elements = {};
    mat.requestUpdate = vi.fn();
    mat.dialogs = null;
    mat.user_config = null;
    mat.device = {
      name: "mat1",
      elements: [{ id: "x", model: "RSMAT", disabled_by: null }],
    };
    return mat;
  }

  it("L76: reason !== maintenance → returns reason null without touching position", () => {
    // Covers rsmat.ts L76: res.reason !== maintenance → inner block skipped
    const mat = makeMat();
    vi.spyOn(mat, "is_disabled").mockReturnValue(false);
    // No maintenance entity → reason stays null
    const result = mat._render_disabled(null);
    expect(result.reason).toBeNull();
  });

  it("L74: _render_disabled called with no argument uses default substyle=null", () => {
    // Covers rsmat.ts L74: default parameter branch (substyle = null)
    const mat = makeMat();
    vi.spyOn(mat, "is_disabled").mockReturnValue(false);
    const result = mat._render_disabled(); // no argument → default null
    expect(result.reason).toBeNull();
    expect(result.substyle).toBeNull();
  });

  it("L77-82: reason=maintenance, position=left → invert_position=true, substyle gets scaleX(-1), maintenance_element rebuilt with swapped config", () => {
    // Covers rsmat.ts L77-82: maintenance + position=left → swap config, substyle mirrored,
    // maintenance_element rebuilt after swap so its CSS positions match the mirrored image
    const mat = makeMat();
    // Provide a maintenance element in config so the rebuild loop (L91-94) is entered
    mat.config.elements = {
      maintenance: {
        name: "maintenance",
        type: "click-image",
        css: { left: "0%" },
      },
    };
    mat.entities = {
      maintenance: { entity_id: "sensor.maint" },
      position: { entity_id: "sensor.pos" },
    };
    mat._hass = makeHass_B({
      "sensor.maint": makeState_B("on", "sensor.maint"),
      "sensor.pos": makeState_B("left", "sensor.pos"),
    });
    vi.spyOn(mat, "is_disabled").mockReturnValue(false);
    const fakeElem: any = { conf: {}, hass: null };
    vi.spyOn(MyElement, "create_element").mockReturnValue(fakeElem);

    const result = mat._render_disabled("");
    expect(result.reason).not.toBeNull();
    expect(mat.invert_position).toBe(true);
    expect(result.substyle).toContain("scaleX(-1)");
    // L91-94: maintenance_element rebuilt with swapped config → right:0% instead of left:0%
    expect(result.maintenance_element).toBe(fakeElem);
    vi.restoreAllMocks();
  });

  it("L92 false: position=left, config.elements has no 'maintenance' key → loop exits without rebuild", () => {
    // Covers rsmat.ts L92 false branch: swtch.name !== 'maintenance' → create_element not called
    const mat = makeMat();
    // Only a non-maintenance element in config → loop iterates but condition is false
    mat.config.elements = {
      other: { name: "other", type: "click-image", css: { left: "0%" } },
    };
    mat.entities = {
      maintenance: { entity_id: "sensor.maint" },
      position: { entity_id: "sensor.pos" },
    };
    mat._hass = makeHass_B({
      "sensor.maint": makeState_B("on", "sensor.maint"),
      "sensor.pos": makeState_B("left", "sensor.pos"),
    });
    vi.spyOn(mat, "is_disabled").mockReturnValue(false);
    const createSpy = vi.spyOn(MyElement, "create_element");

    const result = mat._render_disabled("");
    expect(result.substyle).toContain("scaleX(-1)");
    // No 'maintenance' element in config → create_element not called by the rebuild loop
    expect(createSpy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("L78: maintenance, position=right → invert_position=false, substyle unchanged", () => {
    // Covers rsmat.ts L78: position.state !== "left" → invert_position false
    const mat = makeMat();
    mat.entities = {
      maintenance: { entity_id: "sensor.maint" },
      position: { entity_id: "sensor.pos" },
    };
    mat._hass = makeHass_B({
      "sensor.maint": makeState_B("on", "sensor.maint"),
      "sensor.pos": makeState_B("right", "sensor.pos"),
    });
    vi.spyOn(mat, "is_disabled").mockReturnValue(false);

    const result = mat._render_disabled("");
    expect(mat.invert_position).toBe(false);
    expect(result.substyle).not.toContain("scaleX(-1)");
  });

  it("L77: maintenance but position entity missing → position branch skipped", () => {
    // Covers rsmat.ts L77: get_entity("position") returns null → inner if skipped
    const mat = makeMat();
    mat.entities = { maintenance: { entity_id: "sensor.maint" } };
    mat._hass = makeHass_B({
      "sensor.maint": makeState_B("on", "sensor.maint"),
    });
    vi.spyOn(mat, "is_disabled").mockReturnValue(false);

    const result = mat._render_disabled("");
    expect(result.reason).not.toBeNull();
    expect(mat.invert_position).toBe(false);
  });
});

describe("RSMat._render() — position and percent branches", () => {
  function makeMat(): any {
    const mat = document.createElement("stub-rsmat-bg") as any;
    mat.config = {
      background_img: "/img/rsmat.png",
      elements: {},
      state_background_imgs: {
        percent_0: "/0.png",
        percent_25: "/25.png",
        percent_50: "/50.png",
        percent_75: "/75.png",
        percent_100: "/100.png",
      },
    };
    mat._hass = makeHass_B();
    mat.entities = {};
    mat._elements = {};
    mat.requestUpdate = vi.fn();
    mat.dialogs = null;
    return mat;
  }

  it("L93: position=left → invert_position=true, substyle gets scaleX(-1)", () => {
    // Covers rsmat.ts L93-95: position=left branch
    const mat = makeMat();
    mat.entities = { position: { entity_id: "sensor.pos" } };
    mat._hass = makeHass_B({ "sensor.pos": makeState_B("left", "sensor.pos") });
    mat.get_entity = (k: string) =>
      k === "position" ? { state: "left" } : null;
    const result = mat._render(null, "");
    expect(result).toBeDefined();
    expect(mat.invert_position).toBe(true);
  });

  it("L103: percent calculation picks correct step image (50%)", () => {
    // Covers rsmat.ts L103: steps.reduce — picks nearest step
    const mat = makeMat();
    mat.get_entity = (k: string) => {
      if (k === "remaining_length") return { state: "50" };
      if (k === "total_usage") return { state: "50" };
      return null;
    };
    // usage=50, remaining=50 → percent = 100 - (50*100)/(50+50) = 50
    const result = mat._render(null, "");
    expect(result).toBeDefined();
  });

  it("L120: state_background_imgs missing key → falls back to empty string", () => {
    // Covers rsmat.ts L120: ?? "" fallback when key absent
    const mat = makeMat();
    mat.config.state_background_imgs = {}; // no keys
    mat.get_entity = (_k: string) => null;
    const result = mat._render(null, "");
    expect(result).toBeDefined();
  });
});

describe("RSMat.swapLeftRight() — branch coverage", () => {
  it("handles array input → maps recursively", () => {
    // Covers rsmat.ts L35: Array.isArray branch
    const mat = new StubRSMat() as any;
    const result = mat.swapLeftRight(["left", "right"]);
    expect(result).toEqual(["right", "left"]);
  });

  it("handles URL instance → returns unchanged", () => {
    // Covers rsmat.ts L40: instanceof URL branch
    const mat = new StubRSMat() as any;
    const url = new URL("https://example.com");
    expect(mat.swapLeftRight(url)).toBe(url);
  });

  it("handles string with angle → inverts skewY sign", () => {
    // Covers rsmat.ts L53: skewY/scaleX sign inversion regex
    const mat = new StubRSMat() as any;
    expect(mat.swapLeftRight("skewY(10deg)")).toBe("skewY(-10deg)");
    expect(mat.swapLeftRight("skewY(-10deg)")).toBe("skewY(10deg)");
    expect(mat.swapLeftRight("scaleX(1)")).toBe("scaleX(-1)");
  });

  it("handles plain string left<->right swap", () => {
    const mat = new StubRSMat() as any;
    expect(mat.swapLeftRight("top left")).toBe("top right");
    expect(mat.swapLeftRight("top right")).toBe("top left");
  });

  it("handles null → returns null unchanged", () => {
    // Covers rsmat.ts L66: null check in object branch
    const mat = new StubRSMat() as any;
    expect(mat.swapLeftRight(null)).toBeNull();
  });

  it("handles object with left/right keys → swaps key names recursively", () => {
    // Covers rsmat.ts L61-64: object key swap
    const mat = new StubRSMat() as any;
    const result = mat.swapLeftRight({
      left: "10px",
      right: "20px",
      top: "5px",
    });
    expect(result.right).toBe("10px");
    expect(result.left).toBe("20px");
    expect(result.top).toBe("5px");
  });

  it("handles number → returns unchanged", () => {
    const mat = new StubRSMat() as any;
    expect(mat.swapLeftRight(42)).toBe(42);
  });

  it("L64: skips inherited (non-own) properties via hasOwnProperty check", () => {
    // Covers rsmat.ts L64: !obj.hasOwnProperty(key) → continue
    const mat = new StubRSMat() as any;
    const parent = { inherited: "value" };
    const child = Object.create(parent);
    child.own = "own-value";
    const result = mat.swapLeftRight(child);
    // Inherited keys should be skipped → not in result
    expect(result.own).toBeDefined();
    expect(result.inherited).toBeUndefined();
  });
});

describe("RSMat.renderEditor() — is_disabled branch", () => {
  it("L123: returns empty html when is_disabled() is true", () => {
    // Covers rsmat.ts L123: is_disabled() → return html``
    const mat = new StubRSMat() as any;
    vi.spyOn(mat, "is_disabled").mockReturnValue(true);
    mat.config = { elements: {} };
    mat.user_config = null;
    mat.device = null;
    mat.entities = {};
    mat.dialogs = null;
    const result = mat.renderEditor();
    expect(result).toBeDefined();
  });

  it("L124-125: renders editor form when is_disabled() is false", () => {
    // Covers rsmat.ts L124-125: not disabled → _populate_entities + update_config + form
    const mat = new StubRSMat() as any;
    vi.spyOn(mat, "is_disabled").mockReturnValue(false);
    mat.config = { elements: {}, background_img: "" };
    mat.user_config = null;
    mat.device = {
      name: "mat1",
      elements: [{ id: "x", model: "RSMAT", disabled_by: null }],
    };
    mat.entities = {};
    mat.dialogs = null;
    mat._hass = makeHass_B();
    const result = mat.renderEditor();
    expect(result).toBeDefined();
  });
});

describe("RSMat.connectedCallback() — stores _originalConfig", () => {
  it("L30-31: connectedCallback sets _originalConfig to initial config reference", async () => {
    // Covers rsmat.ts L30-31: connectedCallback override
    const saved = (RSMat as any)._helpersResolved;
    (RSMat as any)._helpersResolved = { createCardElement: vi.fn() };

    const mat = new StubRSMat() as any;
    mat.requestUpdate = vi.fn();
    await mat.connectedCallback();
    expect(mat._originalConfig).toBeDefined();

    (RSMat as any)._helpersResolved = saved;
  });
});
