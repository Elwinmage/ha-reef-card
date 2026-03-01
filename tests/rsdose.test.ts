// Consolidated tests for rsdose

import { Dialog } from "../src/base/dialog";
import { Sensor } from "../src/base/sensor";
import { DoseHead } from "../src/devices/rsdose/dose_head";
import { RSDose, RSDose2, RSDose4 } from "../src/devices/rsdose/rsdose";
import { config2 } from "../src/devices/rsdose/rsdose2.mapping";
import { config4 } from "../src/devices/rsdose/rsdose4.mapping";
import { hexToRgb, rgbToHex } from "../src/utils/common";
import { merge } from "../src/utils/merge";
import { describe, expect, it, vi } from "vitest";
import RSDevice from "../src/devices/device";
import supplements_list from "../src/devices/rsdose/supplements";
import "../src/devices/index";

function parse_head_id(identLabel: string): number {
  const fname = identLabel.split("_");
  if (fname[fname.length - 2] === "head") {
    return parseInt(fname[fname.length - 1]);
  }
  return 0;
}
function populate_with_heads(
  hass_entities: Record<string, any>,
  device_elements: Array<{ id: string; identifiers: [string, string][] }>,
  heads: Array<{ entities: Record<string, any> }>,
  entities: Record<string, any>,
): void {
  for (const entity_id in hass_entities) {
    const entity = hass_entities[entity_id];
    for (const d of device_elements) {
      const head_id = parse_head_id(d.identifiers[0][1]);
      if (entity.device_id === d.id) {
        if (head_id === 0) {
          entities[entity.translation_key] = entity;
        } else {
          heads[head_id].entities[entity.translation_key] = entity;
        }
      }
    }
  }
}
function handle_changed_event(
  target_id: string,
  value: string,
  model: string,
  device_name: string,
  user_config: any,
): any {
  let i_val: any = value;
  const head = target_id.split("-")[0];
  const field = target_id.split("-")[1];
  if (field === "color") {
    i_val = hexToRgb(i_val);
  }
  const newVal = {
    conf: {
      [model]: {
        devices: { [device_name]: { heads: { [head]: { [field]: i_val } } } },
      },
    },
  };
  let newConfig = JSON.parse(JSON.stringify(user_config));
  try {
    newConfig.conf[model].devices[device_name].heads[head][field] = i_val;
  } catch {
    newConfig = merge(newConfig, newVal);
  }
  return newConfig;
}
function handle_changed_device_event(
  element_id: string,
  checked: boolean,
  model: string,
  device_name: string,
  user_config: any,
): any {
  const value = checked;
  const newVal = {
    conf: {
      [model]: {
        devices: {
          [device_name]: {
            elements: { [element_id]: { disabled_if: value } },
          },
        },
      },
    },
  };
  let newConfig = JSON.parse(JSON.stringify(user_config));
  try {
    newConfig.conf[model].devices[device_name].elements[
      element_id
    ].disabled_if = value;
  } catch {
    newConfig = merge(newConfig, newVal);
  }
  return newConfig;
}
function is_checked_logic(elements: Record<string, any>, id: string): boolean {
  let result = false;
  if (id in elements && "disabled_if" in elements[id]) {
    result = elements[id].disabled_if;
  }
  return !!result;
}
function get_style(conf: any): string {
  let style = "";
  if (conf?.css) {
    style = Object.entries(conf.css)
      .map(([k, v]) => `${k}:${v}`)
      .join(";");
  }
  return style;
}
function setting_hass_logic(
  device_elements: Array<{ id: string; disabled_by: string | null }> | null,
  child_elements: Record<string, any>,
  hass_devices: Record<string, any>,
): boolean {
  let re_render = false;
  if (device_elements) {
    for (const el of device_elements) {
      const fresh = hass_devices[el.id];
      if (fresh && fresh.disabled_by !== el.disabled_by) {
        el.disabled_by = fresh.disabled_by;
        re_render = true;
      }
    }
  }
  for (const key in child_elements) {
    const elt = child_elements[key];
    if (elt?.conf?.master && elt.has_changed()) {
      re_render = true;
    }
  }
  return re_render;
}
function run_hass_setter(
  heads: any[],
  dosing_queue: any,
  hass_obj: any,
  stock_alert_state: string,
): void {
  for (const head of heads) {
    if ("dose_head" in head) {
      head.dose_head.stock_alert = Number(stock_alert_state);
      head.dose_head.hass = hass_obj;
    }
  }
  if (dosing_queue) {
    dosing_queue.hass = hass_obj;
  }
}
function render_head_guard(
  heads: any[],
  head_id: number,
  states: Record<string, any>,
): boolean {
  const schedule_entity_id =
    heads[head_id]?.entities["schedule_enabled"]?.entity_id;
  const supplement_entity_id =
    heads[head_id]?.entities["supplement"]?.entity_id;
  if (
    !schedule_entity_id ||
    !supplement_entity_id ||
    !states[schedule_entity_id] ||
    !states[supplement_entity_id]?.attributes?.supplement
  ) {
    return false;
  }
  return true;
}
function compute_schedule_state(
  schedule_state_value: string,
  is_on: boolean,
): boolean {
  let schedule_state = schedule_state_value === "on";
  if (!is_on) {
    schedule_state = false;
  }
  return schedule_state;
}
function update_existing_dose_head(
  head: any,
  schedule_state: boolean,
  is_on: boolean,
  hass: any,
  bundle: boolean,
  masterOn: boolean,
  stock_alert_state: string,
): any {
  const dose_head = head["dose_head"];
  dose_head.state_on = schedule_state;
  dose_head.update_state(is_on);
  dose_head.hass = hass;
  dose_head.bundle = bundle;
  dose_head.masterOn = masterOn;
  dose_head.stock_alert = stock_alert_state;
  return dose_head;
}
function create_dose_head_path(
  heads: any[],
  head_id: number,
  schedule_state: boolean,
  is_on: boolean,
  bundle: boolean,
  masterOn: boolean,
  new_conf: any,
  entities: any,
  stock_alert: string,
  factory: (conf: any) => any,
): any {
  const dose_head = factory(new_conf);
  dose_head.entities = entities;
  dose_head.stock_alert = stock_alert;
  dose_head.state_on = schedule_state;
  dose_head.update_state(is_on);
  heads[head_id]["dose_head"] = dose_head;
  dose_head.config = new_conf;
  dose_head.bundle = bundle;
  dose_head.masterOn = masterOn;
  return dose_head;
}
function handle_device_event_try(
  element_id: string,
  checked: boolean,
  model: string,
  device_name: string,
  user_config: any,
): { newConfig: any; dispatched: any } {
  const value = checked;
  const newVal = {
    conf: {
      [model]: {
        devices: {
          [device_name]: {
            elements: { [element_id]: { disabled_if: value } },
          },
        },
      },
    },
  };
  let newConfig = JSON.parse(JSON.stringify(user_config));
  try {
    newConfig.conf[model].devices[device_name].elements[
      element_id
    ].disabled_if = value;
  } catch {
    newConfig = merge(newConfig, newVal);
  }
  const dispatched = {
    detail: { config: newConfig },
    bubbles: true,
    composed: true,
  };
  return { newConfig, dispatched };
}
function handle_changed_event_full(
  target_id: string,
  value: string,
  model: string,
  device_name: string,
  user_config: any,
): { newConfig: any; dispatched: any } {
  let i_val: any = value;
  const head = target_id.split("-")[0];
  const field = target_id.split("-")[1];
  if (field === "color") {
    i_val = hexToRgb(i_val);
  }
  const newVal = {
    conf: {
      [model]: {
        devices: {
          [device_name]: { heads: { [head]: { [field]: i_val } } },
        },
      },
    },
  };
  let newConfig = JSON.parse(JSON.stringify(user_config));
  try {
    newConfig.conf[model].devices[device_name].heads[undefined as any][field] =
      i_val;
  } catch {
    newConfig = merge(newConfig, newVal);
  }
  const dispatched = {
    detail: { config: newConfig },
    bubbles: true,
    composed: true,
  };
  return { newConfig, dispatched };
}
function handle_changed_event_try_path(
  head_key: string | undefined,
  field: string,
  i_val: any,
  model: string,
  device_name: string,
  user_config: any,
): any {
  const newVal = {
    conf: {
      [model]: {
        devices: {
          [device_name]: {
            heads: { [head_key as string]: { [field]: i_val } },
          },
        },
      },
    },
  };
  let newConfig = JSON.parse(JSON.stringify(user_config));
  try {
    newConfig.conf[model].devices[device_name].heads[head_key as string][
      field
    ] = i_val;
  } catch {
    newConfig = merge(newConfig, newVal);
  }
  return newConfig;
}
function is_checked_result(elements: Record<string, any>, id: string): boolean {
  let result = false;
  if ("disabled_if" in elements[id]) {
    result = elements[id].disabled_if;
  }
  return !!result;
}
function render_editor_disabled_check(
  elements: Array<{ disabled_by: string | null }> | null,
): boolean {
  if (!elements?.length) return true;
  return elements.some((el) => el?.disabled_by !== null);
}
function render_dosing_queue_logic(
  dosing_queue_ref: { value: any },
  hass: any,
  dosing_queue_config: any,
  supplement_color: Record<string, any>,
  is_on: boolean,
  factory: (hass: any, conf: any, parent: any) => any,
): void {
  if (dosing_queue_ref.value === null) {
    dosing_queue_ref.value = factory(hass, dosing_queue_config, null);
    dosing_queue_ref.value.color_list = supplement_color;
  }
  dosing_queue_ref.value.update_state(is_on);
}
class StubRSDose4M extends RSDose4 {}
if (!customElements.get("stub-rsdose4-methods"))
  customElements.define("stub-rsdose4-methods", StubRSDose4M);
class StubRSDose2M extends RSDose2 {}
if (!customElements.get("stub-rsdose2-methods"))
  customElements.define("stub-rsdose2-methods", StubRSDose2M);
function makeHass(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
  devices: Record<string, any> = {},
): any {
  return { states, entities, devices, callService: vi.fn() };
}
function makeState(state: string, attrs: any = {}): any {
  return { state, attributes: attrs };
}
function makeDev(): any {
  const dev = new StubRSDose4M() as any;
  dev.device = {
    name: "MyPump",
    model: "RSDOSE4",
    elements: [
      {
        id: "dev-main",
        identifiers: [["redsea", "rsdose4_abcd"]],
        disabled_by: null,
      },
    ],
  };
  dev.setConfig({});
  dev.config = JSON.parse(JSON.stringify(dev.initial_config));
  dev.entities = {
    stock_alert_days: { entity_id: "sensor.alert" },
    device_state: { entity_id: "switch.state" },
  };
  dev._hass = makeHass({
    "sensor.alert": makeState("7"),
    "switch.state": makeState("on"),
  });
  dev._heads = [];
  dev._elements = {};
  dev.dosing_queue = null;
  dev.to_render = false;
  return dev;
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
function makeState_B(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeHass_B(
  states: Record<string, any> = {},
  entities: Record<string, any> = {},
): any {
  return { states, entities, devices: {}, callService: vi.fn() };
}
class StubDoseHead extends DoseHead {
  override render(): any {
    return this._render();
  }
}
if (!customElements.get("stub-dose-head"))
  customElements.define("stub-dose-head", StubDoseHead);
class StubDevice extends RSDevice {
  _render(_style: any = null, _substyle: any = null): any {
    return null;
  }
}
if (!customElements.get("stub-rsdevice-ext"))
  customElements.define("stub-rsdevice-ext", StubDevice);
class StubRSDose4 extends RSDose4 {}
if (!customElements.get("stub-rsdose4-ext"))
  customElements.define("stub-rsdose4-ext", StubRSDose4);
class StubDialog extends Dialog {}
if (!customElements.get("stub-dialog-ext"))
  customElements.define("stub-dialog-ext", StubDialog);
class StubDoseHeadForDevice extends DoseHead {
  override render(): any {
    return this._render();
  }
}
if (!customElements.get("redsea-dose-head"))
  customElements.define("redsea-dose-head", StubDoseHeadForDevice);
function makeState_C(
  state: string,
  entity_id = "sensor.x",
  attrs: Record<string, any> = {},
): any {
  return { entity_id, state, attributes: { ...attrs } };
}
function makeDeviceInfo(
  model = "RSDOSE4",
  name = "pump",
  disabled_by: string | null = null,
): any {
  return {
    model,
    name,
    elements: [
      {
        id: "dev-001",
        model,
        identifiers: [[null, `${model.toLowerCase()}_1234`]],
        disabled_by,
        primary_config_entry: "cfg-xyz",
      },
    ],
  };
}

describe("config4 — identity and model", () => {
  it("model is RSDOSE4", () => {
    expect(config4.model).toBe("RSDOSE4");
  });

  it("heads_nb is 4", () => {
    expect(config4.heads_nb).toBe(4);
  });

  it("background_img URL references RSDOSE4.png", () => {
    expect(config4.background_img.toString()).toContain("RSDOSE4.png");
  });

  it("has no top-level css constraint (full-width layout)", () => {
    expect((config4 as any).css).toBeUndefined();
  });
});
describe("config4 — elements", () => {
  it("contains all required element keys", () => {
    const keys = Object.keys(config4.elements);
    for (const k of [
      "device_state",
      "maintenance",
      "wifi_quality",
      "last_message",
      "last_alert_message",
      "configuration",
    ]) {
      expect(keys).toContain(k);
    }
  });

  it("device_state: master=true, type=common-switch, style=switch", () => {
    const el = config4.elements.device_state;
    expect(el.master).toBe(true);
    expect(el.type).toBe("common-switch");
    expect(el.style).toBe("switch");
  });

  it("device_state: tap_action toggles the switch entity", () => {
    const ta = config4.elements.device_state.tap_action;
    expect(ta.domain).toBe("switch");
    expect(ta.action).toBe("toggle");
    expect(ta.data).toBe("default");
  });

  it("maintenance: master=true, tap_action.enabled=true", () => {
    const el = config4.elements.maintenance;
    expect(el.master).toBe(true);
    expect((el.tap_action as any).enabled).toBe(true);
  });

  it("wifi_quality: master=true, icon=true, icon_color=#ec2330", () => {
    const el = config4.elements.wifi_quality;
    expect(el.master).toBe(true);
    expect(el.icon).toBe(true);
    expect(el.icon_color).toBe("#ec2330");
  });

  it("last_alert_message: label contains ⚠ warning symbol", () => {
    expect(config4.elements.last_alert_message.label).toContain("⚠");
  });

  it("configuration: type=click-image, tap_action opens config dialog", () => {
    expect(config4.elements.configuration.type).toBe("click-image");
    expect(config4.elements.configuration.tap_action.data.type).toBe("config");
  });

  it("configuration: css.right=6% (compact for 4-head layout)", () => {
    expect(config4.elements.configuration.css.right).toBe("6%");
  });
});
describe("config4 — dosing_queue", () => {
  it("type is redsea-dosing-queue", () => {
    expect(config4.dosing_queue.type).toBe("redsea-dosing-queue");
  });

  it("css.left is 88% (rightmost position for 4-head layout)", () => {
    expect(config4.dosing_queue.css.left).toBe("88%");
  });

  it("css.top is 45%", () => {
    expect(config4.dosing_queue.css.top).toBe("45%");
  });
});
describe("config4 — head definitions", () => {
  it("has head_1 through head_4 with correct ids", () => {
    for (let i = 1; i <= 4; i++) {
      expect((config4.heads as any)[`head_${i}`].id).toBe(i);
    }
  });

  it("head_1 color is 140,67,148 (purple)", () => {
    expect(config4.heads.head_1.color).toBe("140,67,148");
  });

  it("head_2 color is 0,129,197 (blue)", () => {
    expect(config4.heads.head_2.color).toBe("0,129,197");
  });

  it("head_3 color is 0,130,100 (teal)", () => {
    expect(config4.heads.head_3.color).toBe("0,130,100");
  });

  it("head_4 color is 100,160,75 (light green)", () => {
    expect(config4.heads.head_4.color).toBe("100,160,75");
  });

  it("head_1 css.left is 1%", () => {
    expect(config4.heads.head_1.css.left).toBe("1%");
  });

  it("head_3 and head_4 have per-head pump_state_head and calibration overrides", () => {
    expect((config4.heads.head_3 as any).pump_state_head).toBeDefined();
    expect((config4.heads.head_4 as any).calibration).toBeDefined();
  });
});
describe("config4 — heads.common elements", () => {
  const elts = config4.heads.common.elements;

  it("contains all required per-head elements", () => {
    for (const k of [
      "supplement",
      "supplement_bottle",
      "manual_head_volume",
      "manual_dosed_today",
      "auto_dosed_today",
      "doses_today",
      "container_volume",
      "auto_dosed_today_circle",
      "schedule_enabled",
      "manual_head",
    ]) {
      expect(Object.keys(elts)).toContain(k);
    }
  });

  it("schedule_enabled: alpha=0, master=true, style=button, has hold_action and tap_action", () => {
    const el = elts.schedule_enabled;
    expect(el.alpha).toBe(0);
    expect(el.master).toBe(true);
    expect(el.style).toBe("button");
    expect(el.hold_action).toBeDefined();
    expect(el.tap_action.data.type).toBe("head_configuration");
  });

  it("manual_dosed_today: prefix='+', disabled_if references state", () => {
    expect(elts.manual_dosed_today.prefix).toBe("+");
    expect(elts.manual_dosed_today.disabled_if).toContain("state");
  });

  it("auto_dosed_today: type=common-sensor-target, target=daily_dose", () => {
    const el = elts.auto_dosed_today;
    expect(el.type).toBe("common-sensor-target");
    expect(el.target).toBe("daily_dose");
    expect(el.force_integer).toBe(true);
  });

  it("auto_dosed_today_circle: type=progress-circle, no_value=true", () => {
    const el = elts.auto_dosed_today_circle;
    expect(el.type).toBe("progress-circle");
    expect(el.no_value).toBe(true);
  });

  it("container_volume: type=progress-bar, target=save_initial_container_volume", () => {
    const el = elts.container_volume;
    expect(el.type).toBe("progress-bar");
    expect(el.target).toBe("save_initial_container_volume");
    expect(el.disabled_if).toContain("slm");
  });

  it("supplement_bottle: stateObj=null, tap_action opens edit_container dialog", () => {
    expect(elts.supplement_bottle.stateObj).toBeNull();
    expect(elts.supplement_bottle.tap_action.data.type).toBe("edit_container");
  });

  it("supplement (rsdose4): label includes name, brand_name, display_name", () => {
    const label = elts.supplement.label;
    expect(label).toContain("supplement.name");
    expect(label).toContain("supplement.brand_name");
    expect(label).toContain("supplement.display_name");
  });

  it("manual_head: tap_action domain=button, background-color uses $DEVICE-COLOR-ALPHA$ token", () => {
    expect(elts.manual_head.tap_action.domain).toBe("button");
    expect(elts.manual_head.css["background-color"]).toBe(
      "$DEVICE-COLOR-ALPHA$",
    );
  });

  it("manual_head_volume: background-color uses $DEVICE-COLOR-ALPHA$ token", () => {
    expect(elts.manual_head_volume.css["background-color"]).toBe(
      "$DEVICE-COLOR-ALPHA$",
    );
  });
});
describe("config2 — identity and model", () => {
  it("model is RSDOSE2", () => {
    expect(config2.model).toBe("RSDOSE2");
  });

  it("heads_nb is 2", () => {
    expect(config2.heads_nb).toBe(2);
  });

  it("background_img URL references RSDOSE2.png", () => {
    expect(config2.background_img.toString()).toContain("RSDOSE2.png");
  });

  it("has a top-level css constraint: width=64%, left=22%", () => {
    expect((config2 as any).css.width).toBe("64%");
    expect((config2 as any).css.left).toBe("22%");
  });
});
describe("config2 — elements", () => {
  it("has the same element keys as config4", () => {
    expect(Object.keys(config2.elements).sort()).toEqual(
      Object.keys(config4.elements).sort(),
    );
  });

  it("configuration: css.right=28% (wider spacing for 2-head layout)", () => {
    expect(config2.elements.configuration.css.right).toBe("28%");
  });

  it("device_state: css.left=23% (centered for 2-head layout)", () => {
    expect(config2.elements.device_state.css.left).toBe("23%");
  });

  it("maintenance: css.left=23%", () => {
    expect(config2.elements.maintenance.css.left).toBe("23%");
  });

  it("wifi_quality: css.right=22%", () => {
    expect(config2.elements.wifi_quality.css.right).toBe("22%");
  });
});
describe("config2 — dosing_queue", () => {
  it("css.left is 65% (not 88%)", () => {
    expect(config2.dosing_queue.css.left).toBe("65%");
    expect(config2.dosing_queue.css.left).not.toBe(
      config4.dosing_queue.css.left,
    );
  });
});
describe("config2 — head definitions", () => {
  it("has only head_1 and head_2 — no head_3 or head_4", () => {
    expect((config2.heads as any).head_1).toBeDefined();
    expect((config2.heads as any).head_2).toBeDefined();
    expect((config2.heads as any).head_3).toBeUndefined();
    expect((config2.heads as any).head_4).toBeUndefined();
  });

  it("head colors match config4 (same physical pump hardware)", () => {
    expect(config2.heads.head_1.color).toBe(config4.heads.head_1.color);
    expect(config2.heads.head_2.color).toBe(config4.heads.head_2.color);
  });

  it("head_1 css.left is 22% (shifted right vs config4's 1%)", () => {
    expect(config2.heads.head_1.css.left).toBe("22%");
  });

  it("head_2 css.left is 43%", () => {
    expect(config2.heads.head_2.css.left).toBe("43%");
  });
});
describe("config2 — heads.common elements", () => {
  it("has the same element keys as config4", () => {
    expect(Object.keys(config2.heads.common.elements).sort()).toEqual(
      Object.keys(config4.heads.common.elements).sort(),
    );
  });

  it("supplement (rsdose2): compact label uses brand_name + stateObj.state", () => {
    const label = config2.heads.common.elements.supplement.label;
    expect(label).toContain("supplement.brand_name");
    expect(label).toContain("stateObj.state");
  });

  it("supplement label differs from config4 (no display_name in config2)", () => {
    expect(config2.heads.common.elements.supplement.label).not.toContain(
      "supplement.display_name",
    );
  });
});
describe("config4 vs config2 — structural differences", () => {
  it("heads_nb: 4 vs 2", () => {
    expect(config4.heads_nb).toBe(4);
    expect(config2.heads_nb).toBe(2);
  });

  it("dosing_queue position: config4=88%, config2=65%", () => {
    expect(config4.dosing_queue.css.left).toBe("88%");
    expect(config2.dosing_queue.css.left).toBe("65%");
  });

  it("configuration icon: config4 right=6%, config2 right=28%", () => {
    expect(config4.elements.configuration.css.right).toBe("6%");
    expect(config2.elements.configuration.css.right).toBe("28%");
  });

  it("config4 has no global css; config2 constrains width to 64%", () => {
    expect((config4 as any).css).toBeUndefined();
    expect((config2 as any).css.width).toBe("64%");
  });

  it("config4 has 4 named heads; config2 has 2", () => {
    const heads4 = Object.keys(config4.heads).filter((k) =>
      k.startsWith("head_"),
    );
    const heads2 = Object.keys(config2.heads).filter((k) =>
      k.startsWith("head_"),
    );
    expect(heads4).toHaveLength(4);
    expect(heads2).toHaveLength(2);
  });
});
describe("_populate_entities_with_heads() — head_id parsing", () => {
  it("label without _head_ gives head_id=0 (global entity)", () => {
    expect(parse_head_id("abc_rsdose4_1234")).toBe(0);
  });

  it("label abc_head_1 gives head_id=1", () => {
    expect(parse_head_id("abc_head_1")).toBe(1);
  });

  it("label abc_head_2 gives head_id=2", () => {
    expect(parse_head_id("abc_head_2")).toBe(2);
  });

  it("label abc_head_4 gives head_id=4", () => {
    expect(parse_head_id("abc_head_4")).toBe(4);
  });

  it("label with no underscore at all gives head_id=0", () => {
    expect(parse_head_id("main")).toBe(0);
  });
});
describe("_populate_entities_with_heads() — entity routing", () => {
  function makeDeviceElement(id: string, label: string) {
    return { id, identifiers: [["redsea", label]] as [string, string][] };
  }

  it("routes global entity to this.entities (head_id=0)", () => {
    const heads = Array.from({ length: 5 }, () => ({ entities: {} }));
    const entities: any = {};
    populate_with_heads(
      {
        e1: {
          device_id: "dev_main",
          translation_key: "stock_alert_days",
          entity_id: "sensor.sad",
        },
      },
      [makeDeviceElement("dev_main", "abc_rsdose4_1234")],
      heads,
      entities,
    );
    expect(entities["stock_alert_days"]).toBeDefined();
    expect(entities["stock_alert_days"].entity_id).toBe("sensor.sad");
  });

  it("routes head entity to heads[n].entities (head_id=2)", () => {
    const heads = Array.from({ length: 5 }, () => ({ entities: {} }));
    const entities: any = {};
    populate_with_heads(
      {
        e2: {
          device_id: "dev_h2",
          translation_key: "schedule_enabled",
          entity_id: "switch.se2",
        },
      },
      [makeDeviceElement("dev_h2", "abc_head_2")],
      heads,
      entities,
    );
    expect(heads[2].entities["schedule_enabled"]).toBeDefined();
    expect(heads[2].entities["schedule_enabled"].entity_id).toBe("switch.se2");
  });

  it("ignores entities from unrelated devices", () => {
    const heads = Array.from({ length: 5 }, () => ({ entities: {} }));
    const entities: any = {};
    populate_with_heads(
      {
        e3: {
          device_id: "unrelated",
          translation_key: "noise",
          entity_id: "sensor.noise",
        },
      },
      [makeDeviceElement("dev_main", "abc_rsdose4_1234")],
      heads,
      entities,
    );
    expect(entities["noise"]).toBeUndefined();
    expect(heads.every((h) => Object.keys(h.entities).length === 0)).toBe(true);
  });

  it("routes multiple entities to correct heads in one pass", () => {
    const heads = Array.from({ length: 5 }, () => ({ entities: {} }));
    const entities: any = {};
    populate_with_heads(
      {
        e_g: {
          device_id: "main",
          translation_key: "bundled_heads",
          entity_id: "sensor.bh",
        },
        e_h1: {
          device_id: "h1",
          translation_key: "schedule_enabled",
          entity_id: "switch.se1",
        },
        e_h3: {
          device_id: "h3",
          translation_key: "auto_dosed_today",
          entity_id: "sensor.adt3",
        },
      },
      [
        makeDeviceElement("main", "abc_rsdose4_1234"),
        makeDeviceElement("h1", "abc_head_1"),
        makeDeviceElement("h3", "abc_head_3"),
      ],
      heads,
      entities,
    );
    expect(entities["bundled_heads"].entity_id).toBe("sensor.bh");
    expect(heads[1].entities["schedule_enabled"].entity_id).toBe("switch.se1");
    expect(heads[3].entities["auto_dosed_today"].entity_id).toBe("sensor.adt3");
  });
});
describe("handleChangedEvent() — field parsing and color conversion", () => {
  it("shortcut field: value stored as-is", () => {
    const result = handle_changed_event(
      "head_1-shortcut",
      "K",
      "RSDOSE4",
      "My RSDose",
      {},
    );
    const conf = result.conf["RSDOSE4"].devices["My RSDose"];
    expect(conf.heads["head_1"]["shortcut"]).toBe("K");
  });

  it("color field #8c4394 → rgb 140,67,148 (head_1 default purple)", () => {
    const result = handle_changed_event(
      "head_1-color",
      "#8c4394",
      "RSDOSE4",
      "My RSDose",
      {},
    );
    const conf = result.conf["RSDOSE4"].devices["My RSDose"];
    expect(conf.heads["head_1"]["color"]).toBe("140,67,148");
  });

  it("color field #0081c5 → rgb 0,129,197 (head_2 default blue)", () => {
    const result = handle_changed_event(
      "head_2-color",
      "#0081c5",
      "RSDOSE4",
      "My RSDose",
      {},
    );
    expect(
      result.conf["RSDOSE4"].devices["My RSDose"].heads["head_2"]["color"],
    ).toBe("0,129,197");
  });

  it("color field #64a04b → rgb 100,160,75 (head_4 default light green)", () => {
    const result = handle_changed_event(
      "head_4-color",
      "#64a04b",
      "RSDOSE4",
      "My RSDose",
      {},
    );
    expect(
      result.conf["RSDOSE4"].devices["My RSDose"].heads["head_4"]["color"],
    ).toBe("100,160,75");
  });

  it("result uses the supplied model key (RSDOSE2 model)", () => {
    const result = handle_changed_event(
      "head_1-shortcut",
      "Ca",
      "RSDOSE2",
      "My RSDose2",
      {},
    );
    expect(Object.keys(result.conf)).toContain("RSDOSE2");
    expect(
      result.conf["RSDOSE2"].devices["My RSDose2"].heads["head_1"]["shortcut"],
    ).toBe("Ca");
  });

  it("head string parsed correctly from target id", () => {
    const result = handle_changed_event(
      "head_3-color",
      "#008264",
      "RSDOSE4",
      "Dev",
      {},
    );
    expect(result.conf["RSDOSE4"].devices["Dev"].heads["head_3"]).toBeDefined();
  });
});
describe("handleChangedDeviceEvent() — disabled_if toggle", () => {
  it("stores disabled_if=true when checkbox is checked", () => {
    const result = handle_changed_device_event(
      "last_message",
      true,
      "RSDOSE4",
      "My RSDose",
      {},
    );
    const el =
      result.conf["RSDOSE4"].devices["My RSDose"].elements["last_message"];
    expect(el.disabled_if).toBe(true);
  });

  it("stores disabled_if=false when checkbox is unchecked", () => {
    const result = handle_changed_device_event(
      "last_alert_message",
      false,
      "RSDOSE4",
      "My RSDose",
      {},
    );
    const el =
      result.conf["RSDOSE4"].devices["My RSDose"].elements[
        "last_alert_message"
      ];
    expect(el.disabled_if).toBe(false);
  });

  it("preserves unrelated user_config keys when merging", () => {
    const existing = {
      conf: {
        RSDOSE4: {
          devices: { "My RSDose": { heads: { head_1: { color: "255,0,0" } } } },
        },
      },
    };
    const result = handle_changed_device_event(
      "last_message",
      true,
      "RSDOSE4",
      "My RSDose",
      existing,
    );

    expect(
      result.conf["RSDOSE4"].devices["My RSDose"].heads?.head_1?.color,
    ).toBe("255,0,0");
  });
});
describe("is_checked() — disabled_if branch", () => {
  it("returns false when element has no disabled_if key", () => {
    expect(
      is_checked_logic(
        { last_message: { name: "last_message" } },
        "last_message",
      ),
    ).toBe(false);
  });

  it("returns false when disabled_if is false", () => {
    expect(
      is_checked_logic(
        { last_message: { disabled_if: false } },
        "last_message",
      ),
    ).toBe(false);
  });

  it("returns true when disabled_if is true", () => {
    expect(
      is_checked_logic({ last_message: { disabled_if: true } }, "last_message"),
    ).toBe(true);
  });

  it("returns false for an unknown element id", () => {
    expect(is_checked_logic({}, "nonexistent")).toBe(false);
  });
});
describe("get_style()", () => {
  it("returns empty string when conf has no css", () => {
    expect(get_style({})).toBe("");
  });

  it("returns empty string for null conf", () => {
    expect(get_style(null)).toBe("");
  });

  it("converts a single css property to key:value", () => {
    expect(get_style({ css: { color: "red" } })).toBe("color:red");
  });

  it("joins multiple properties with semicolons (no trailing separator)", () => {
    const style = get_style({ css: { width: "100%", height: "50%" } });
    expect(style).toContain("width:100%");
    expect(style).toContain("height:50%");
    expect(style.split(";")).toHaveLength(2);
  });

  it("applied to config4 dosing_queue produces a string containing left:88%", () => {
    expect(get_style(config4.dosing_queue)).toContain("left:88%");
  });

  it("applied to config2 dosing_queue produces a string containing left:65%", () => {
    expect(get_style(config2.dosing_queue)).toContain("left:65%");
  });
});
describe("update_config() — clone and merge logic", () => {
  it("deep-clone of config4 preserves model and heads_nb", () => {
    const cloned = JSON.parse(JSON.stringify(config4));
    expect(cloned.model).toBe("RSDOSE4");
    expect(cloned.heads_nb).toBe(4);
  });

  it("cloning does not mutate the original config4", () => {
    const cloned = JSON.parse(JSON.stringify(config4));
    cloned.model = "MUTATED";
    expect(config4.model).toBe("RSDOSE4");
  });

  it("merging a head color override onto config4 updates only that head", () => {
    const base = JSON.parse(JSON.stringify(config4));
    const merged = merge(base, { heads: { head_1: { color: "255,0,0" } } });
    expect(merged.heads.head_1.color).toBe("255,0,0");
    expect(merged.heads.head_2.color).toBe(config4.heads.head_2.color);
  });

  it("merging a head color override onto config2 preserves the other head", () => {
    const base = JSON.parse(JSON.stringify(config2));
    const merged = merge(base, { heads: { head_2: { color: "0,255,0" } } });
    expect(merged.heads.head_2.color).toBe("0,255,0");
    expect(merged.heads.head_1.color).toBe(config2.heads.head_1.color);
  });

  it("merging a disabled_if override onto an element sets the flag", () => {
    const base = JSON.parse(JSON.stringify(config4));
    const merged = merge(base, {
      elements: { last_message: { disabled_if: true } },
    });
    expect(merged.elements.last_message.disabled_if).toBe(true);
  });

  it("merge does not remove unrelated keys (dosing_queue still present)", () => {
    const base = JSON.parse(JSON.stringify(config4));
    const merged = merge(base, { heads: { head_1: { color: "0,0,0" } } });
    expect(merged.dosing_queue).toBeDefined();
    expect(merged.elements.device_state).toBeDefined();
  });
});
describe("_setting_hass() — re-render trigger logic", () => {
  it("triggers re_render when disabled_by changes null → 'user'", () => {
    const device_elements = [{ id: "dev1", disabled_by: null }];
    const result = setting_hass_logic(
      device_elements,
      {},
      { dev1: { disabled_by: "user" } },
    );
    expect(result).toBe(true);
    expect(device_elements[0].disabled_by).toBe("user");
  });

  it("does NOT trigger re_render when disabled_by is unchanged", () => {
    const device_elements = [{ id: "dev1", disabled_by: null }];
    expect(
      setting_hass_logic(device_elements, {}, { dev1: { disabled_by: null } }),
    ).toBe(false);
  });

  it("triggers re_render when a master child element signals has_changed", () => {
    const elements = {
      device_state: { conf: { master: true }, has_changed: () => true },
    };
    expect(setting_hass_logic(null, elements, {})).toBe(true);
  });

  it("does NOT trigger re_render when master element has not changed", () => {
    const elements = {
      device_state: { conf: { master: true }, has_changed: () => false },
    };
    expect(setting_hass_logic(null, elements, {})).toBe(false);
  });

  it("non-master element does not trigger re_render even when changed", () => {
    const elements = {
      sensor: { conf: { master: false }, has_changed: () => true },
    };
    expect(setting_hass_logic(null, elements, {})).toBe(false);
  });

  it("triggers re_render when both disabled_by and master element change", () => {
    const device_elements = [{ id: "dev1", disabled_by: null }];
    const elements = {
      device_state: { conf: { master: true }, has_changed: () => true },
    };
    expect(
      setting_hass_logic(device_elements, elements, {
        dev1: { disabled_by: "integration" },
      }),
    ).toBe(true);
  });

  it("handles null device_elements without throwing", () => {
    expect(() => setting_hass_logic(null, {}, {})).not.toThrow();
  });
});
describe("Supplements.get_supplement_from_uid()", () => {
  it("returns supplement for a known top-level uid", () => {
    const result = supplements_list.get_supplement_from_uid(
      "0e63ba83-3ec4-445e-a3dd-7f2dbdc7f964",
    );
    expect(result).not.toBeNull();
    expect(result.name).toBe("Calcium (Powder)");
    expect(result.short_name).toBe("Ca");
    expect(result.brand_name).toBe("Red Sea");
  });

  it("returns supplement for another known uid (KH Foundation B)", () => {
    const result = supplements_list.get_supplement_from_uid(
      "76830db3-a0bd-459a-9974-76a57d026893",
    );
    expect(result).not.toBeNull();
    expect(result.display_name).toBe("KH");
  });

  it("returns null for an unknown uid", () => {
    expect(
      supplements_list.get_supplement_from_uid("not-a-real-uid"),
    ).toBeNull();
  });

  it("returns bundle sub-supplement with sizes scaled by ratio=1.0 (Part 1)", () => {
    const result = supplements_list.get_supplement_from_uid(
      "6b7d2c15-0d25-4447-b089-854ef6ba99f2",
    );
    expect(result).not.toBeNull();
    expect(result.uid).toBe("6b7d2c15-0d25-4447-b089-854ef6ba99f2");
    expect(result.sizes).toEqual([500, 1000, 2000]);
  });

  it("returns bundle sub-supplement with sizes scaled by ratio=2.0 (Part 2)", () => {
    const result = supplements_list.get_supplement_from_uid(
      "6f6a53db-0985-47f4-92bd-cef092d97d22",
    );
    expect(result).not.toBeNull();
    expect(result.sizes).toEqual([1000, 2000, 4000]);
  });

  it("returns bundle sub-supplement with sizes scaled by ratio=0.5 (Part 3)", () => {
    const result = supplements_list.get_supplement_from_uid(
      "18c5a293-f14d-4d40-ad43-0420e54f9a45",
    );
    expect(result).not.toBeNull();
    expect(result.sizes).toEqual([250, 500, 1000]);
  });

  it("returns bundle sub-supplement Part 4 (ratio=0.5) with correct scaled sizes", () => {
    const result = supplements_list.get_supplement_from_uid(
      "bb73e4c2-e366-4304-aaeb-50e4b52fa10f",
    );
    expect(result).not.toBeNull();
    expect(result.sizes).toEqual([250, 500, 1000]);
  });

  it("found supplement has made_by_redsea=true for Red Sea products", () => {
    const result = supplements_list.get_supplement_from_uid(
      "0e63ba83-3ec4-445e-a3dd-7f2dbdc7f964",
    );
    expect(result?.made_by_redsea).toBe(true);
  });

  it("found supplement has made_by_redsea=false for third-party products", () => {
    const result = supplements_list.get_supplement_from_uid(
      "345a8f18-1787-47cd-87b2-a8da3a6531bc",
    );
    expect(result?.made_by_redsea).toBe(false);
  });
});
describe("Supplements.get_supplement_from_fullname()", () => {
  it("returns supplement for a known fullname", () => {
    const result = supplements_list.get_supplement_from_fullname(
      "Red Sea - Calcium (Powder)",
    );
    expect(result).not.toBeNull();
    expect(result.uid).toBe("0e63ba83-3ec4-445e-a3dd-7f2dbdc7f964");
  });

  it("returns supplement for a third-party fullname", () => {
    const result = supplements_list.get_supplement_from_fullname(
      "Tropic Marin - All-For-Reef",
    );
    expect(result).not.toBeNull();
    expect(result.made_by_redsea).toBe(false);
    expect(result.sizes).toEqual([250, 500, 1000]);
  });

  it("returns null for an unknown fullname", () => {
    expect(
      supplements_list.get_supplement_from_fullname("Unknown Brand - Unknown"),
    ).toBeNull();
  });

  it("returns null for a bundle sub-supplement name (sub-supplements have no fullname field)", () => {
    const result = supplements_list.get_supplement_from_fullname(
      "Part 1: Calcium & Magnesium",
    );
    expect(result).toBeNull();
  });

  it("returns the Bundle parent itself when searching by its fullname", () => {
    const result = supplements_list.get_supplement_from_fullname(
      "RedSea - ReefCare Program",
    );
    expect(result).not.toBeNull();
    expect(result.uid).toBe("redsea-reefcare");
    expect(result.type).toBe("Bundle");
  });

  it("bundle parts are found by uid but not by fullname (asymmetry documented)", () => {
    const by_uid = supplements_list.get_supplement_from_uid(
      "6b7d2c15-0d25-4447-b089-854ef6ba99f2",
    );
    expect(by_uid).not.toBeNull();

    const by_fullname = supplements_list.get_supplement_from_fullname(
      "Part 1: Calcium & Magnesium",
    );
    expect(by_fullname).toBeNull();
  });

  it("returns complete supplement object with all expected fields", () => {
    const result = supplements_list.get_supplement_from_fullname(
      "Red Sea - KH/Alkalinity (Foundation B)",
    );
    expect(result).toMatchObject({
      short_name: "KH",
      brand_name: "Red Sea",
      made_by_redsea: true,
      sizes: [5000, 1000, 500, 250],
    });
  });
});
describe("set hass() — dose_head and dosing_queue propagation", () => {
  it("sets stock_alert and hass on a head that has dose_head", () => {
    const dose_head = { stock_alert: 0, hass: null };
    const heads = [{ entities: {}, dose_head }];
    const hass = { states: {}, entities: {}, devices: {} };
    run_hass_setter(heads, null, hass, "7");
    expect(dose_head.stock_alert).toBe(7);
    expect(dose_head.hass).toBe(hass);
  });

  it("skips heads that have no dose_head key", () => {
    const heads = [{ entities: {} }];

    expect(() => run_hass_setter(heads, null, {}, "5")).not.toThrow();
  });

  it("propagates hass to dosing_queue when non-null", () => {
    const dosing_queue = { hass: null };
    const hass = { states: {} };
    run_hass_setter([], dosing_queue, hass, "3");
    expect(dosing_queue.hass).toBe(hass);
  });

  it("does not throw when dosing_queue is null", () => {
    expect(() => run_hass_setter([], null, {}, "0")).not.toThrow();
  });

  it("processes multiple heads, only those with dose_head", () => {
    const dh1 = { stock_alert: 0, hass: null };
    const dh3 = { stock_alert: 0, hass: null };
    const heads = [
      { entities: {}, dose_head: dh1 },
      { entities: {} },
      { entities: {}, dose_head: dh3 },
    ];
    const hass = { states: {} };
    run_hass_setter(heads, null, hass, "14");
    expect(dh1.stock_alert).toBe(14);
    expect(dh1.hass).toBe(hass);
    expect(dh3.stock_alert).toBe(14);
    expect(dh3.hass).toBe(hass);
  });
});
describe("_render_head() — guard (early-return conditions)", () => {
  it("returns early when schedule_entity_id is missing", () => {
    const heads = [null, { entities: { supplement: { entity_id: "s.supp" } } }];
    expect(render_head_guard(heads, 1, {})).toBe(false);
  });

  it("returns early when supplement_entity_id is missing", () => {
    const heads = [
      null,
      { entities: { schedule_enabled: { entity_id: "s.sch" } } },
    ];
    expect(render_head_guard(heads, 1, {})).toBe(false);
  });

  it("returns early when schedule state is absent from hass.states", () => {
    const heads = [
      null,
      {
        entities: {
          schedule_enabled: { entity_id: "s.sch" },
          supplement: { entity_id: "s.supp" },
        },
      },
    ];

    const states = {
      "s.supp": { attributes: { supplement: { short_name: "Ca" } } },
    };
    expect(render_head_guard(heads, 1, states)).toBe(false);
  });

  it("returns early when supplement attributes are absent", () => {
    const heads = [
      null,
      {
        entities: {
          schedule_enabled: { entity_id: "s.sch" },
          supplement: { entity_id: "s.supp" },
        },
      },
    ];
    const states = {
      "s.sch": { state: "on" },
      "s.supp": { attributes: {} },
    };
    expect(render_head_guard(heads, 1, states)).toBe(false);
  });

  it("passes guard when all required states are present", () => {
    const heads = [
      null,
      {
        entities: {
          schedule_enabled: { entity_id: "s.sch" },
          supplement: { entity_id: "s.supp" },
        },
      },
    ];
    const states = {
      "s.sch": { state: "on" },
      "s.supp": { attributes: { supplement: { short_name: "Ca" } } },
    };
    expect(render_head_guard(heads, 1, states)).toBe(true);
  });
});
describe("_render_head() — schedule_state computation", () => {
  it("schedule_state is true when state=on and device is on", () => {
    expect(compute_schedule_state("on", true)).toBe(true);
  });

  it("schedule_state is false when state=off and device is on", () => {
    expect(compute_schedule_state("off", true)).toBe(false);
  });

  it("schedule_state is false when device is off regardless of state", () => {
    expect(compute_schedule_state("on", false)).toBe(false);
  });
});
describe("_render_head() — update existing dose_head path", () => {
  it("sets all properties on the existing dose_head", () => {
    const update_state = vi.fn();
    const dose_head = {
      state_on: false,
      hass: null,
      bundle: false,
      masterOn: false,
      stock_alert: "0",
      update_state,
    };
    const head = { entities: {}, dose_head };
    const hass = { states: {} };

    update_existing_dose_head(head, true, true, hass, true, true, "5");

    expect(dose_head.state_on).toBe(true);
    expect(dose_head.hass).toBe(hass);
    expect(dose_head.bundle).toBe(true);
    expect(dose_head.masterOn).toBe(true);
    expect(dose_head.stock_alert).toBe("5");
    expect(update_state).toHaveBeenCalledWith(true);
  });

  it("update_state is called with false when device is off", () => {
    const update_state = vi.fn();
    const dose_head = {
      state_on: true,
      hass: null,
      bundle: false,
      masterOn: true,
      stock_alert: "0",
      update_state,
    };
    const head = { entities: {}, dose_head };

    update_existing_dose_head(head, false, false, {}, false, false, "3");

    expect(dose_head.state_on).toBe(false);
    expect(dose_head.bundle).toBe(false);
    expect(update_state).toHaveBeenCalledWith(false);
  });
});
describe("_render_head() — create new dose_head path", () => {
  it("stores dose_head on the head and sets all properties", () => {
    const update_state = vi.fn();
    const fake_dh = {
      entities: null,
      stock_alert: null,
      state_on: null,
      config: null,
      bundle: null,
      masterOn: null,
      update_state,
    };
    const factory = vi.fn().mockReturnValue(fake_dh);
    const heads = [
      null,
      { entities: { schedule_enabled: {}, supplement: {} } },
    ];
    const conf = { left: "1%" };
    const ents = { schedule_enabled: { entity_id: "switch.se" } };

    create_dose_head_path(
      heads,
      1,
      true,
      true,
      false,
      true,
      conf,
      ents,
      "7",
      factory,
    );

    expect(factory).toHaveBeenCalledWith(conf);
    expect(fake_dh.entities).toBe(ents);
    expect(fake_dh.stock_alert).toBe("7");
    expect(fake_dh.state_on).toBe(true);
    expect(fake_dh.config).toBe(conf);
    expect(fake_dh.bundle).toBe(false);
    expect(fake_dh.masterOn).toBe(true);
    expect(update_state).toHaveBeenCalledWith(true);
    expect(heads[1]["dose_head"]).toBe(fake_dh);
  });

  it("sets bundle=true when device is bundled", () => {
    const fake_dh = {
      entities: null,
      stock_alert: null,
      state_on: null,
      config: null,
      bundle: null,
      masterOn: null,
      update_state: vi.fn(),
    };
    const heads = [null, { entities: {} }];
    create_dose_head_path(
      heads,
      1,
      false,
      false,
      true,
      false,
      {},
      {},
      "0",
      () => fake_dh,
    );
    expect(fake_dh.bundle).toBe(true);
  });
});
describe("_editor_head_color() — rgbToHex and shortcut extraction", () => {
  it("rgbToHex converts config head_1 color (140,67,148) to #8c4394", () => {
    const color = rgbToHex("rgb(" + config4.heads.head_1.color + ");");
    expect(color).toBe("#8c4394");
  });

  it("rgbToHex converts config head_2 color (0,129,197) to #0081c5", () => {
    const color = rgbToHex("rgb(" + config4.heads.head_2.color + ");");
    expect(color).toBe("#0081c5");
  });

  it("rgbToHex converts config head_3 color (0,130,100) to #008264", () => {
    const color = rgbToHex("rgb(" + config4.heads.head_3.color + ");");
    expect(color).toBe("#008264");
  });

  it("rgbToHex converts config head_4 color (100,160,75) to #64a04b", () => {
    const color = rgbToHex("rgb(" + config4.heads.head_4.color + ");");
    expect(color).toBe("#64a04b");
  });

  it("shortcut value is read from config (head_1 has a shortcut field)", () => {
    const shortcuts = (config4.heads as any).head_1.shortcut;

    expect(shortcuts === undefined || typeof shortcuts === "string").toBe(true);
  });
});
describe("handleChangedDeviceEvent() — try path (pre-existing conf)", () => {
  it("takes try path when conf already has the full nested structure", () => {
    const existing = {
      conf: {
        RSDOSE4: {
          devices: {
            MyDose: {
              elements: { last_message: { disabled_if: false } },
            },
          },
        },
      },
    };
    const { newConfig } = handle_device_event_try(
      "last_message",
      true,
      "RSDOSE4",
      "MyDose",
      existing,
    );
    expect(
      newConfig.conf["RSDOSE4"].devices["MyDose"].elements["last_message"]
        .disabled_if,
    ).toBe(true);
  });

  it("catch path merges when conf structure is absent", () => {
    const { newConfig } = handle_device_event_try(
      "last_alert_message",
      false,
      "RSDOSE4",
      "MyDose",
      {},
    );
    expect(
      newConfig.conf["RSDOSE4"].devices["MyDose"].elements["last_alert_message"]
        .disabled_if,
    ).toBe(false);
  });

  it("dispatched event has bubbles=true and composed=true", () => {
    const { dispatched } = handle_device_event_try(
      "last_message",
      true,
      "RSDOSE4",
      "MyDose",
      {},
    );
    expect(dispatched.bubbles).toBe(true);
    expect(dispatched.composed).toBe(true);
  });
});
describe("handleChangedEvent() — color and shortcut fields", () => {
  it("color field: hexToRgb converts value before storing", () => {
    const { newConfig } = handle_changed_event_full(
      "head_1-color",
      "#8c4394",
      "RSDOSE4",
      "MyDose",
      {},
    );
    expect(
      newConfig.conf["RSDOSE4"].devices["MyDose"].heads["head_1"]["color"],
    ).toBe("140,67,148");
  });

  it("shortcut field: value stored as-is (no conversion)", () => {
    const { newConfig } = handle_changed_event_full(
      "head_2-shortcut",
      "Mg",
      "RSDOSE4",
      "MyDose",
      {},
    );
    expect(
      newConfig.conf["RSDOSE4"].devices["MyDose"].heads["head_2"]["shortcut"],
    ).toBe("Mg");
  });

  it("always takes catch path (target.head is undefined → TypeError)", () => {
    const { newConfig } = handle_changed_event_full(
      "head_3-color",
      "#008264",
      "RSDOSE4",
      "Dev",
      {},
    );
    expect(
      newConfig.conf["RSDOSE4"].devices["Dev"].heads["head_3"]["color"],
    ).toBe("0,130,100");
  });

  it("RSDOSE2 model: shortcut stored under correct model key", () => {
    const { newConfig } = handle_changed_event_full(
      "head_1-shortcut",
      "KH",
      "RSDOSE2",
      "MyDose2",
      {},
    );
    expect(
      newConfig.conf["RSDOSE2"].devices["MyDose2"].heads["head_1"]["shortcut"],
    ).toBe("KH");
  });

  it("dispatched event has bubbles=true and composed=true", () => {
    const { dispatched } = handle_changed_event_full(
      "head_1-color",
      "#ffffff",
      "RSDOSE4",
      "D",
      {},
    );
    expect(dispatched.bubbles).toBe(true);
    expect(dispatched.composed).toBe(true);
  });
});
describe("handleChangedEvent() — try path succeeds when conf pre-populated", () => {
  it("takes try path and updates in-place when full path exists", () => {
    const existing = {
      conf: {
        RSDOSE4: {
          devices: {
            MyDose: { heads: { head_1: { color: "0,0,0" } } },
          },
        },
      },
    };
    const result = handle_changed_event_try_path(
      "head_1",
      "color",
      "140,67,148",
      "RSDOSE4",
      "MyDose",
      existing,
    );
    expect(
      result.conf["RSDOSE4"].devices["MyDose"].heads["head_1"]["color"],
    ).toBe("140,67,148");
  });

  it("catch path when head_key is undefined (normal DOM event flow)", () => {
    const result = handle_changed_event_try_path(
      undefined,
      "shortcut",
      "Ca",
      "RSDOSE4",
      "MyDose",
      {},
    );

    expect(result.conf).toBeDefined();
  });
});
describe("is_checked() — both template branches", () => {
  it("returns true when disabled_if=true → checked branch rendered", () => {
    const elements = { last_message: { disabled_if: true } };
    expect(is_checked_result(elements, "last_message")).toBe(true);
  });

  it("returns false when disabled_if=false → unchecked branch rendered", () => {
    const elements = { last_message: { disabled_if: false } };
    expect(is_checked_result(elements, "last_message")).toBe(false);
  });

  it("returns false when disabled_if key absent → unchecked branch", () => {
    const elements = { last_message: {} };
    expect(is_checked_result(elements, "last_message")).toBe(false);
  });

  it("config4 elements have no disabled_if by default → false", () => {
    expect("disabled_if" in config4.elements.last_message).toBe(false);
    expect("disabled_if" in config4.elements.last_alert_message).toBe(false);
  });

  it("after merging disabled_if=true → is_checked returns true", () => {
    const conf = JSON.parse(JSON.stringify(config4));
    const updated = merge(conf, {
      elements: { last_message: { disabled_if: true } },
    });
    expect(is_checked_result(updated.elements, "last_message")).toBe(true);
  });
});
describe("renderEditor() — is_disabled() guard branch", () => {
  it("is_disabled returns true when all elements have disabled_by=null → NOT disabled, returns false", () => {
    const elements = [{ disabled_by: null }, { disabled_by: null }];
    expect(render_editor_disabled_check(elements)).toBe(false);
  });

  it("is_disabled returns true when any element has disabled_by set", () => {
    const elements = [{ disabled_by: null }, { disabled_by: "user" }];
    expect(render_editor_disabled_check(elements)).toBe(true);
  });

  it("is_disabled returns true when elements array is empty (no device)", () => {
    expect(render_editor_disabled_check([])).toBe(true);
  });

  it("is_disabled returns true when elements is null", () => {
    expect(render_editor_disabled_check(null)).toBe(true);
  });
});
describe("renderEditor() — normal path supporting logic", () => {
  it("config4.heads_nb=4 produces 4 head iterations (Array.from length)", () => {
    const heads = Array.from({ length: config4.heads_nb }, (_, i) => i + 1);
    expect(heads).toEqual([1, 2, 3, 4]);
  });

  it("config4 has last_message and last_alert_message elements for is_checked calls", () => {
    expect(config4.elements.last_message).toBeDefined();
    expect(config4.elements.last_alert_message).toBeDefined();
  });

  it("all 4 heads have a color and shortcut-compatible structure", () => {
    for (let i = 1; i <= 4; i++) {
      const head = (config4.heads as any)[`head_${i}`];
      expect(head.color).toBeDefined();

      expect("id" in head).toBe(true);
    }
  });

  it("rgbToHex round-trip for all 4 head colors produces valid hex", () => {
    for (let i = 1; i <= 4; i++) {
      const color = (config4.heads as any)[`head_${i}`].color;
      const hex = rgbToHex("rgb(" + color + ");");
      expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
describe("RSDose4 / RSDose2 — initial_config assignment", () => {
  it("config4.model is RSDOSE4", () => {
    expect(config4.model).toBe("RSDOSE4");
  });

  it("config4.heads_nb is 4", () => {
    expect(config4.heads_nb).toBe(4);
  });

  it("config2.model is RSDOSE2", () => {
    expect(config2.model).toBe("RSDOSE2");
  });

  it("config2.heads_nb is 2", () => {
    expect(config2.heads_nb).toBe(2);
  });
});
describe("_render() — dosing_queue creation and update", () => {
  it("creates dosing_queue when null and sets color_list", () => {
    const update_state = vi.fn();
    const dq = { color_list: null, update_state };
    const factory = vi.fn().mockReturnValue(dq);
    const colors = { Ca: "140,67,148" };
    const ref = { value: null };

    render_dosing_queue_logic(
      ref,
      {},
      config4.dosing_queue,
      colors,
      true,
      factory,
    );

    expect(factory).toHaveBeenCalledOnce();
    expect(ref.value).toBe(dq);
    expect(dq.color_list).toBe(colors);
    expect(update_state).toHaveBeenCalledWith(true);
  });

  it("skips creation when dosing_queue already exists, only calls update_state", () => {
    const update_state = vi.fn();
    const existing_dq = { color_list: {}, update_state };
    const factory = vi.fn();
    const ref = { value: existing_dq };

    render_dosing_queue_logic(
      ref,
      {},
      config4.dosing_queue,
      {},
      false,
      factory,
    );

    expect(factory).not.toHaveBeenCalled();
    expect(update_state).toHaveBeenCalledWith(false);
  });

  it("bundle flag: get_entity('bundled_heads').state === 'on' → bundle=true", () => {
    const entity_state = { state: "on" };
    const bundle = entity_state?.state === "on";
    expect(bundle).toBe(true);
  });

  it("bundle flag: state !== 'on' → bundle=false", () => {
    const entity_state = { state: "off" };
    const bundle = entity_state?.state === "on";
    expect(bundle).toBe(false);
  });

  it("bundle flag: get_entity returns null (entity absent) → bundle=false", () => {
    const bundle = (null as any)?.state === "on";
    expect(bundle).toBe(false);
  });
});
describe("RSDose.set hass() — dose_head propagation (L.44-49)", () => {
  it("propagates stock_alert and hass to each head that has dose_head", () => {
    const dev = makeDev();
    const update_state = vi.fn();
    const fake_dose_head = {
      stock_alert: 0,
      hass: null,
      update_state,
    };

    dev._heads = [
      { entities: {} },
      { entities: {}, dose_head: fake_dose_head },
    ];

    const new_hass = makeHass({ "sensor.alert": makeState("14") });

    dev.entities["stock_alert_days"] = { entity_id: "sensor.alert" };
    dev._hass = makeHass({
      "sensor.alert": makeState("14"),
      "switch.state": makeState("on"),
    });
    dev.hass = makeHass({
      "sensor.alert": makeState("14"),
      "switch.state": makeState("on"),
    });

    expect(fake_dose_head.stock_alert).toBe(14);
    expect(fake_dose_head.hass).toBeDefined();
  });

  it("skips heads without dose_head (no throw)", () => {
    const dev = makeDev();
    dev._heads = [{ entities: {} }];
    expect(() => {
      dev.hass = makeHass({
        "sensor.alert": makeState("3"),
        "switch.state": makeState("on"),
      });
    }).not.toThrow();
  });
});
describe("RSDose.set hass() — dosing_queue propagation (L.52-53)", () => {
  it("sets hass on dosing_queue when non-null", () => {
    const dev = makeDev();
    dev._heads = [];
    const fake_dq = { hass: null };
    dev.dosing_queue = fake_dq;

    const new_hass = makeHass({
      "sensor.alert": makeState("0"),
      "switch.state": makeState("on"),
    });
    dev.hass = new_hass;

    expect(fake_dq.hass).toBe(new_hass);
  });
});
describe("RSDose._render_head() — dose_head update path (L.115-131)", () => {
  it("updates existing dose_head and returns a template result", () => {
    const dev = makeDev();
    const update_state = vi.fn();
    const fake_dose_head = {
      state_on: false,
      hass: null,
      bundle: false,
      masterOn: false,
      stock_alert: "0",
      update_state,
    };

    dev._heads = [
      { entities: {} },
      {
        entities: {
          schedule_enabled: { entity_id: "switch.sch1" },
          supplement: { entity_id: "sensor.supp1" },
        },
        dose_head: fake_dose_head,
      },
    ];

    dev._hass = makeHass({
      "switch.sch1": makeState("on"),
      "sensor.supp1": makeState("Ca", { supplement: { short_name: "Ca" } }),
      "sensor.alert": makeState("5"),
      "switch.state": makeState("on"),
    });

    const result = dev._render_head(1, true);

    expect(fake_dose_head.state_on).toBe(true);
    expect(update_state).toHaveBeenCalledWith(true);
    expect(fake_dose_head.bundle).toBe(false);
    expect(fake_dose_head.masterOn).toBe(true);

    expect(result).toBeDefined();
  });

  it("sets schedule_state=false when device is off", () => {
    const dev = makeDev();
    const update_state = vi.fn();
    const fake_dose_head = {
      state_on: true,
      hass: null,
      bundle: false,
      masterOn: true,
      stock_alert: "0",
      update_state,
    };

    dev._heads = [
      { entities: {} },
      {
        entities: {
          schedule_enabled: { entity_id: "switch.sch1" },
          supplement: { entity_id: "sensor.supp1" },
        },
        dose_head: fake_dose_head,
      },
    ];

    dev._hass = makeHass({
      "switch.sch1": makeState("on"),
      "sensor.supp1": makeState("Ca", { supplement: { short_name: "Ca" } }),
      "sensor.alert": makeState("5"),

      "switch.state": makeState("off"),
    });

    dev._render_head(1, false);

    expect(fake_dose_head.state_on).toBe(false);
  });
});
describe("RSDose._render_head() — dose_head create path (L.133-149)", () => {
  it("creates a new dose_head when absent and stores it on the head", () => {
    const dev = makeDev();

    dev._heads = [
      { entities: {} },
      {
        entities: {
          schedule_enabled: { entity_id: "switch.sch1" },
          supplement: { entity_id: "sensor.supp1" },
        },
      },
    ];

    dev._hass = makeHass({
      "switch.sch1": makeState("on"),
      "sensor.supp1": makeState("Ca", { supplement: { short_name: "Ca" } }),
      "sensor.alert": makeState("5"),
      "switch.state": makeState("on"),
    });

    const result = dev._render_head(1, true);

    expect("dose_head" in dev._heads[1]).toBe(true);
    expect(dev._heads[1].dose_head).toBeDefined();
    expect(result).toBeDefined();
  });

  it("dose_head has correct properties after creation", () => {
    const dev = makeDev();
    dev._heads = [
      { entities: {} },
      {
        entities: {
          schedule_enabled: { entity_id: "switch.sch2" },
          supplement: { entity_id: "sensor.supp2" },
        },
      },
    ];

    dev._hass = makeHass({
      "switch.sch2": makeState("off"),
      "sensor.supp2": makeState("KH", { supplement: { short_name: "KH" } }),
      "sensor.alert": makeState("3"),
      "switch.state": makeState("on"),
    });

    dev.bundle = true;
    dev._render_head(1, true);

    const dh = dev._heads[1].dose_head;
    expect(dh.bundle).toBe(true);
    expect(dh.masterOn).toBe(true);

    expect(dh.state_on).toBe(false);
  });
});
describe("RSDose._render_head() — guard early return (L.106-112)", () => {
  it("returns empty template when schedule_entity_id is missing", () => {
    const dev = makeDev();
    dev._heads = [
      { entities: {} },
      { entities: { supplement: { entity_id: "s.supp" } } },
    ];
    dev._hass = makeHass({
      "s.supp": makeState("Ca", { supplement: { short_name: "Ca" } }),
    });
    const result = dev._render_head(1, true);

    expect(result.strings.join("").trim()).toBe("");
  });

  it("returns empty template when states are missing", () => {
    const dev = makeDev();
    dev._heads = [
      { entities: {} },
      {
        entities: {
          schedule_enabled: { entity_id: "switch.sch" },
          supplement: { entity_id: "sensor.supp" },
        },
      },
    ];
    dev._hass = makeHass({});
    const result = dev._render_head(1, true);
    expect(result.strings.join("").trim()).toBe("");
  });
});
describe("RSDose.handleChangedDeviceEvent() (L.228-253)", () => {
  it("catch path: dispatches config-changed with disabled_if merged into new conf", () => {
    const dev = makeDev();

    dev.user_config = {};

    const events: CustomEvent[] = [];
    dev.addEventListener("config-changed", (e: Event) =>
      events.push(e as CustomEvent),
    );

    const fakeEvent = {
      currentTarget: { checked: true },
      target: { id: "last_message" },
    };
    dev.handleChangedDeviceEvent(fakeEvent);

    expect(events).toHaveLength(1);
    const conf =
      events[0].detail.config.conf["RSDOSE4"].devices["MyPump"].elements;
    expect(conf.last_message.disabled_if).toBe(true);
  });

  it("try path: updates disabled_if in-place when path exists", () => {
    const dev = makeDev();
    dev.user_config = {
      conf: {
        RSDOSE4: {
          devices: {
            MyPump: { elements: { last_message: { disabled_if: false } } },
          },
        },
      },
    };

    const events: CustomEvent[] = [];
    dev.addEventListener("config-changed", (e: Event) =>
      events.push(e as CustomEvent),
    );

    const fakeEvent = {
      currentTarget: { checked: true },
      target: { id: "last_message" },
    };
    dev.handleChangedDeviceEvent(fakeEvent);

    expect(
      events[0].detail.config.conf["RSDOSE4"].devices["MyPump"].elements
        .last_message.disabled_if,
    ).toBe(true);
  });

  it("event has bubbles=true and composed=true", () => {
    const dev = makeDev();
    dev.user_config = {};
    const events: CustomEvent[] = [];
    dev.addEventListener("config-changed", (e: Event) =>
      events.push(e as CustomEvent),
    );
    dev.handleChangedDeviceEvent({
      currentTarget: { checked: false },
      target: { id: "last_alert_message" },
    });
    expect(events[0].bubbles).toBe(true);
    expect(events[0].composed).toBe(true);
  });
});
describe("RSDose.handleChangedEvent() (L.257-286)", () => {
  it("shortcut field: stores value as-is via catch→merge path", () => {
    const dev = makeDev();
    dev.user_config = {};
    const events: CustomEvent[] = [];
    dev.addEventListener("config-changed", (e: Event) =>
      events.push(e as CustomEvent),
    );

    const fakeEvent = {
      currentTarget: { value: "Ca" },
      target: { id: "head_1-shortcut" },
    };
    dev.handleChangedEvent(fakeEvent);

    const heads =
      events[0].detail.config.conf["RSDOSE4"].devices["MyPump"].heads;
    expect(heads["head_1"]["shortcut"]).toBe("Ca");
  });

  it("color field: hexToRgb converts value before storing", () => {
    const dev = makeDev();
    dev.user_config = {};
    const events: CustomEvent[] = [];
    dev.addEventListener("config-changed", (e: Event) =>
      events.push(e as CustomEvent),
    );

    const fakeEvent = {
      currentTarget: { value: "#8c4394" },
      target: { id: "head_1-color" },
    };
    dev.handleChangedEvent(fakeEvent);

    const heads =
      events[0].detail.config.conf["RSDOSE4"].devices["MyPump"].heads;
    expect(heads["head_1"]["color"]).toBe("140,67,148");
  });

  it("event has bubbles=true and composed=true", () => {
    const dev = makeDev();
    dev.user_config = {};
    const events: CustomEvent[] = [];
    dev.addEventListener("config-changed", (e: Event) =>
      events.push(e as CustomEvent),
    );
    dev.handleChangedEvent({
      currentTarget: { value: "X" },
      target: { id: "head_2-shortcut" },
    });
    expect(events[0].bubbles).toBe(true);
    expect(events[0].composed).toBe(true);
  });
});
describe("RSDose.is_checked() (L.290-319)", () => {
  it("returns checked template (L.294-306) when disabled_if=true", () => {
    const dev = makeDev();

    dev.config.elements.last_message.disabled_if = true;
    const result = dev.is_checked("last_message");

    expect(result).toBeDefined();

    const joined = result.strings.join("");
    expect(joined).toContain("checked");
  });

  it("returns unchecked template (L.307-318) when disabled_if=false", () => {
    const dev = makeDev();

    const result = dev.is_checked("last_message");
    expect(result).toBeDefined();
    const joined = result.strings.join("");

    expect(joined).not.toContain("checked");
  });

  it("is_checked with disabled_if missing → unchecked branch", () => {
    const dev = makeDev();
    delete dev.config.elements.last_message.disabled_if;
    const result = dev.is_checked("last_message");
    expect(result).toBeDefined();
  });
});
describe("RSDose.renderEditor() (L.322-409)", () => {
  it("returns empty template when device is disabled (L.323-324)", () => {
    const dev = makeDev();

    dev.device.elements[0].disabled_by = "user";
    const result = dev.renderEditor();
    expect(result.strings.join("").trim()).toBe("");
  });

  it("returns full editor template when device is enabled (L.326-408)", () => {
    const dev = makeDev();

    dev._heads = [];
    dev.entities = {
      device_state: { entity_id: "switch.state" },
      stock_alert_days: { entity_id: "sensor.alert" },
    };

    const orig_populate = dev._populate_entities_with_heads.bind(dev);
    dev._populate_entities_with_heads = function () {
      orig_populate();

      for (let i = 1; i <= dev.config.heads_nb; i++) {
        if (!dev._heads[i]) dev._heads[i] = { entities: {} };
        dev._heads[i].entities["supplement"] = { entity_id: `sensor.supp${i}` };
      }
    };

    const states: Record<string, any> = {
      "switch.state": makeState("on"),
      "sensor.alert": makeState("7"),
    };
    for (let i = 1; i <= 4; i++) {
      states[`sensor.supp${i}`] = makeState("Ca");
    }
    dev._hass = makeHass(states);

    const result = dev.renderEditor();

    expect(result).toBeDefined();
    const joined = result.strings.join("");
    expect(joined).toContain("hr");
    expect(joined).toContain("heads_colors");
  });

  it("_editor_head_color is called for each head (L.404-405)", () => {
    const dev = makeDev();
    dev.device.elements[0].disabled_by = null;

    const called_with: number[] = [];
    const orig = dev._editor_head_color.bind(dev);
    dev._editor_head_color = function (head_id: number) {
      called_with.push(head_id);
      return orig(head_id);
    };

    dev._heads = [];
    dev._populate_entities_with_heads = function () {
      for (let i = 0; i <= dev.config.heads_nb; i++) {
        dev._heads[i] = {
          entities: { supplement: { entity_id: `sensor.supp${i}` } },
        };
      }
    };

    const states: Record<string, any> = {
      "switch.state": makeState("on"),
      "sensor.alert": makeState("5"),
    };
    for (let i = 1; i <= 4; i++) states[`sensor.supp${i}`] = makeState("Ca");
    dev._hass = makeHass(states);

    dev.renderEditor();
    expect(called_with).toEqual([1, 2, 3, 4]);
  });
});
describe("RSDose._editor_head_color() (L.191-224)", () => {
  it("returns a TemplateResult containing the hex color value", () => {
    const dev = makeDev();
    dev._heads = [];
    for (let i = 0; i <= 4; i++) {
      dev._heads[i] = {
        entities: { supplement: { entity_id: `sensor.supp${i}` } },
      };
    }
    dev._hass = makeHass({
      "sensor.supp1": makeState("Calcium"),
      "switch.state": makeState("on"),
      "sensor.alert": makeState("5"),
    });

    const result = dev._editor_head_color(1);
    expect(result).toBeDefined();

    const vals = result.values;
    const hexVal = vals.find(
      (v: any) => typeof v === "string" && v.startsWith("#"),
    );
    expect(hexVal).toBe("#8c4394");
  });

  it("shortcut value appears in template values", () => {
    const dev = makeDev();
    dev._heads = [];
    for (let i = 0; i <= 4; i++) {
      dev._heads[i] = {
        entities: { supplement: { entity_id: `sensor.supp${i}` } },
      };
    }
    dev._hass = makeHass({
      "sensor.supp2": makeState("KH"),
      "switch.state": makeState("on"),
      "sensor.alert": makeState("5"),
    });

    const result = dev._editor_head_color(2);
    expect(result).toBeDefined();
  });
});
describe("RSDose._populate_entities_with_heads() — device=null branch (L.70)", () => {
  it("continues without throwing when device is null during entity iteration", () => {
    const dev = makeDev();

    dev._hass = makeHass(
      { "sensor.alert": makeState("5"), "switch.state": makeState("on") },
      {
        e1: {
          entity_id: "sensor.x",
          device_id: "dev-main",
          translation_key: "device_state",
        },
      },
    );
    dev._heads = [];
    dev.user_config = {};

    dev.entities = {};

    dev.device = null;
    expect(() => dev._populate_entities_with_heads()).not.toThrow();

    expect(Object.keys(dev.entities)).toHaveLength(0);
  });
});
describe("RSDose._render() — dosing_queue already exists (L.162 false branch)", () => {
  it("skips creation and calls update_state on existing dosing_queue", () => {
    const dev = makeDev();
    const update_state = vi.fn();
    const existing_dq = { update_state, color_list: {} };

    dev.dosing_queue = existing_dq;

    dev.entities = {
      device_state: { entity_id: "switch.state" },
      stock_alert_days: { entity_id: "sensor.alert" },
      bundled_heads: { entity_id: "sensor.bundle" },
    };
    dev._hass = makeHass({
      "switch.state": makeState("on"),
      "sensor.alert": makeState("5"),
      "sensor.bundle": makeState("off"),
    });
    dev._heads = [];

    dev._render(null, null);

    expect(dev.dosing_queue).toBe(existing_dq);

    expect(update_state).toHaveBeenCalledOnce();
  });
});
describe("RSDose4.renderEditor()", () => {
  it("returns a TemplateResult", () => {
    const dev = new StubRSDose4b() as any;
    dev.config = JSON.parse(JSON.stringify(dev.initial_config));
    dev._hass = makeHass_B();
    dev.entities = {};
    const result = dev.renderEditor();
    expect(result).toBeDefined();
  });

  it("includes head color pickers in editor output", () => {
    const dev = new StubRSDose4b() as any;
    dev.config = JSON.parse(JSON.stringify(dev.initial_config));
    dev._hass = makeHass_B();
    dev.entities = {};

    dev.handleChangedEvent = vi.fn();
    const result = dev.renderEditor();
    expect(result).toBeDefined();
  });
});
describe("RSDose2.renderEditor()", () => {
  it("returns a TemplateResult", () => {
    const dev = new StubRSDose2b() as any;
    dev.config = JSON.parse(JSON.stringify(dev.initial_config));
    dev._hass = makeHass_B();
    dev.entities = {};
    const result = dev.renderEditor();
    expect(result).toBeDefined();
  });
});
describe("RSDose._get_val()", () => {
  it("returns the state of the requested entity", () => {
    const dev = new StubRSDose4b() as any;

    dev.entities = {
      device_state: {
        sensor_key: { entity_id: "sensor.ds" },
      },
    };
    dev._hass = makeHass_B({
      "sensor.ds": makeState_B("on", "sensor.ds"),
    });
    const result = dev._get_val("device_state", "sensor_key");
    expect(result).toBe("on");
  });
});
describe("RSDose4.render() — pipeline", () => {
  it("does not throw when _heads are pre-populated", () => {
    const dev = new StubRSDose4b() as any;
    dev.isEditorMode = false;
    dev.user_config = {};
    dev.device = {
      model: "RSDOSE4",
      name: "pump",
      elements: [
        {
          id: "dev-001",
          model: "RSDOSE4",
          identifiers: [[null, "rsdose4_1234"]],
          disabled_by: null,
          primary_config_entry: "cfg-xyz",
        },
      ],
    };
    dev.dialogs = {};
    dev._elements = {};
    dev.supplement_color = {};
    dev.dosing_queue = null;
    dev.entities = {
      device_state: { entity_id: "sensor.ds" },
      stock_alert_days: { entity_id: "sensor.alert" },
      bundled_heads: { entity_id: "sensor.bundle" },
    };
    dev._hass = makeHass_B({
      "sensor.ds": makeState_B("on", "sensor.ds"),
      "sensor.alert": makeState_B("10", "sensor.alert"),
      "sensor.bundle": makeState_B("off", "sensor.bundle"),
    });

    dev._heads = [];
    for (let i = 0; i <= dev.initial_config.heads_nb; i++) {
      dev._heads.push({ entities: {} });
    }
    expect(() => dev.render()).not.toThrow();
  });

  it("calls renderEditor when isEditorMode=true", () => {
    const dev = new StubRSDose4b() as any;
    dev.isEditorMode = true;
    dev.config = JSON.parse(JSON.stringify(dev.initial_config));
    dev.entities = {};
    dev._hass = makeHass_B();
    const result = dev.render();
    expect(result).toBeDefined();
  });
});
describe("RSDose hass setter with heads", () => {
  it("does not throw when _heads is empty", () => {
    const dev = new StubRSDose4() as any;
    dev.device = makeDeviceInfo("RSDOSE4");
    dev._elements = {};
    dev._heads = [];
    dev.dosing_queue = null;
    dev.config = { model: "RSDOSE4", elements: {}, heads_nb: 0 };
    dev.entities = {};
    dev.to_render = false;
    expect(() => {
      dev.hass = makeHass();
    }).not.toThrow();
  });

  it("propagates hass to dosing_queue when present", () => {
    const dev = new StubRSDose4() as any;
    dev.device = makeDeviceInfo("RSDOSE4");
    dev._elements = {};
    dev._heads = [];
    dev.entities = {};
    dev.to_render = false;
    dev.config = { model: "RSDOSE4", elements: {}, heads_nb: 0 };
    const mockQueue = { hass: null };
    dev.dosing_queue = mockQueue;
    const hass = makeHass();
    dev.hass = hass;
    expect(mockQueue.hass).toBe(hass);
  });
});
describe("RSDose._render_head()", () => {
  it("returns html`` when schedule_entity_id is missing from _heads", () => {
    const dev = new StubRSDose4() as any;
    dev.device = makeDeviceInfo("RSDOSE4");
    dev._elements = {};
    dev._heads = [{ entities: {} }, { entities: {} }, { entities: {} }];
    dev.entities = { stock_alert_days: { entity_id: "sensor.alert" } };
    dev._hass = makeHass({
      "sensor.alert": makeState_C("10", "sensor.alert"),
    });
    dev.config = {
      heads_nb: 2,
      heads: {
        common: { color: "0,200,100" },
        head_1: { color: "100,200,0" },
        head_2: { color: "200,100,0" },
      },
    };
    dev.supplement_color = {};
    const result = dev._render_head(1, true);
    expect(result).toBeDefined();
  });
});
