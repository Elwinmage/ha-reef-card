// Consolidated tests for devices_subclasses

import { ClickImage } from "../src/base/click_image";
import { MyElement } from "../src/base/element";
import { RSDevice } from "../src/devices/device";
import { RSAto } from "../src/devices/rsato/rsato";
import { DosingQueue } from "../src/devices/rsdose/dosing_queue";
import { RSDose, RSDose2, RSDose4 } from "../src/devices/rsdose/rsdose";
import { config4 } from "../src/devices/rsdose/rsdose4.mapping";
import {
  RSLed,
  RSLed115,
  RSLed160,
  RSLed170,
  RSLed50,
  RSLed60,
  RSLed90,
} from "../src/devices/rsled/rsled";
import { RSMat } from "../src/devices/rsmat/rsmat";
import { NoDevice } from "../src/devices/rsnodevice/rsnodevice";
import { RSRun } from "../src/devices/rsrun/rsrun";
import { RSWave, RSWave25, RSWave45 } from "../src/devices/rswave/rswave";
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
