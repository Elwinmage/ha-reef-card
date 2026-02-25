/**
 * Unit tests — devices/rsdose/rsdose.ts
 *               devices/rsdose/rsdose4.mapping.ts
 *               devices/rsdose/rsdose2.mapping.ts
 *               devices/rsdose/supplements.ts
 *               devices/rsdose/supplements_list.ts
 *
 * Strategy: same as device.test.ts — extract pure-logic functions and test
 * them directly, without triggering the LitElement / browser-rendering pipeline.
 *
 * Covered:
 *   config4 / config2 — full structural validation
 *   _populate_entities_with_heads() — entity routing logic
 *   handleChangedEvent()            — color conversion + config-changed payload
 *   handleChangedDeviceEvent()      — disabled_if toggle + config-changed payload
 *   is_checked()                    — disabled_if branch
 *   get_style()                     — css object → inline style string
 *   update_config()                 — clone + merge logic
 *   _setting_hass()                 — re-render trigger, disabled_by detection
 *   Supplements.get_supplement_from_uid()       — direct, bundle (ratio scaling), not found
 *   Supplements.get_supplement_from_fullname()  — same three branches
 */

import { describe, it, expect } from "vitest";
import { config4 } from "../src/devices/rsdose/rsdose4.mapping";
import { config2 } from "../src/devices/rsdose/rsdose2.mapping";
import supplements_list from "../src/devices/rsdose/supplements";
import { merge } from "../src/utils/merge";
import { hexToRgb } from "../src/utils/common";

// ─────────────────────────────────────────────────────────────────────────────
// config4 — rsdose4.mapping.ts
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// config2 — rsdose2.mapping.ts
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// config4 vs config2 — key structural differences
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// _populate_entities_with_heads() — extracted routing logic
//
// Verbatim from rsdose.ts:
//   const fname = d["identifiers"][0][1].split("_");
//   let head_id = 0;
//   if (fname[fname.length - 2] === "head") {
//     head_id = parseInt(fname[fname.length - 1]);
//   }
//   if (entity.device_id === d.id) {
//     if (head_id === 0) { entities[tk] = entity; }
//     else { heads[head_id].entities[tk] = entity; }
//   }
// ─────────────────────────────────────────────────────────────────────────────

// Parses an identifier label and returns the head_id (0 = global).
function parse_head_id(identLabel: string): number {
  const fname = identLabel.split("_");
  if (fname[fname.length - 2] === "head") {
    return parseInt(fname[fname.length - 1]);
  }
  return 0;
}

// Executes the full entity-routing loop.
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

// ─────────────────────────────────────────────────────────────────────────────
// handleChangedEvent() — extracted logic
//
// Verbatim from rsdose.ts (sans LitElement side-effects):
//   let i_val = currentTarget.value;
//   const head = target.id.split("-")[0];
//   const field = target.id.split("-")[1];
//   if (field === "color") { i_val = hexToRgb(i_val); }
//   const newVal = { conf: { [model]: { devices: { [device_name]: { heads: { [head]: { [field]: i_val }}}}}}}
//   newConfig = merge(JSON.parse(JSON.stringify(user_config)), newVal);  // fallback branch
// ─────────────────────────────────────────────────────────────────────────────

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
    // Direct path — will throw when user_config has no matching nested path
    newConfig.conf[model].devices[device_name].heads[head][field] = i_val;
  } catch {
    newConfig = merge(newConfig, newVal);
  }
  return newConfig;
}

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
    // target_id = "head_3-color" → head = "head_3", field = "color"
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

// ─────────────────────────────────────────────────────────────────────────────
// handleChangedDeviceEvent() — extracted logic
// ─────────────────────────────────────────────────────────────────────────────

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
    // Head color must survive the merge
    expect(
      result.conf["RSDOSE4"].devices["My RSDose"].heads?.head_1?.color,
    ).toBe("255,0,0");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// is_checked() — disabled_if branch logic
// ─────────────────────────────────────────────────────────────────────────────

// Extracted logic from rsdose.ts is_checked():
//   let result = false;
//   if ("disabled_if" in config.elements[id]) { result = config.elements[id].disabled_if; }
//   return !!result; (determines which template branch to use)

function is_checked_logic(elements: Record<string, any>, id: string): boolean {
  let result = false;
  if (id in elements && "disabled_if" in elements[id]) {
    result = elements[id].disabled_if;
  }
  return !!result;
}

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

// ─────────────────────────────────────────────────────────────────────────────
// get_style() — extracted logic (same as in device.ts)
// ─────────────────────────────────────────────────────────────────────────────

function get_style(conf: any): string {
  let style = "";
  if (conf?.css) {
    style = Object.entries(conf.css)
      .map(([k, v]) => `${k}:${v}`)
      .join(";");
  }
  return style;
}

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

// ─────────────────────────────────────────────────────────────────────────────
// update_config() — clone + merge logic
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// _setting_hass() — re-render trigger logic
//
// Extracted from device.ts _setting_hass():
//   - Iterate device.elements; if fresh.disabled_by !== el.disabled_by → re_render
//   - Iterate _elements; if elt.conf.master && elt.has_changed(obj) → re_render
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Supplements.get_supplement_from_uid()
// ─────────────────────────────────────────────────────────────────────────────

describe("Supplements.get_supplement_from_uid()", () => {
  it("returns supplement for a known top-level uid", () => {
    const result = supplements_list.get_supplement_from_uid(
      "0e63ba83-3ec4-445e-a3dd-7f2dbdc7f964", // Calcium (Powder)
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
    // Bundle ReefCare: sizes=[500,1000,2000], Part 1 ratio=1.0 → [500,1000,2000]
    const result = supplements_list.get_supplement_from_uid(
      "6b7d2c15-0d25-4447-b089-854ef6ba99f2",
    );
    expect(result).not.toBeNull();
    expect(result.uid).toBe("6b7d2c15-0d25-4447-b089-854ef6ba99f2");
    expect(result.sizes).toEqual([500, 1000, 2000]);
  });

  it("returns bundle sub-supplement with sizes scaled by ratio=2.0 (Part 2)", () => {
    // Bundle sizes=[500,1000,2000], ratio=2.0 → [1000,2000,4000]
    const result = supplements_list.get_supplement_from_uid(
      "6f6a53db-0985-47f4-92bd-cef092d97d22",
    );
    expect(result).not.toBeNull();
    expect(result.sizes).toEqual([1000, 2000, 4000]);
  });

  it("returns bundle sub-supplement with sizes scaled by ratio=0.5 (Part 3)", () => {
    // Bundle sizes=[500,1000,2000], ratio=0.5 → [250,500,1000]
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
    // Aqua Forest - Calcium
    const result = supplements_list.get_supplement_from_uid(
      "345a8f18-1787-47cd-87b2-a8da3a6531bc",
    );
    expect(result?.made_by_redsea).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Supplements.get_supplement_from_fullname()
// ─────────────────────────────────────────────────────────────────────────────

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
    // Bundle sub-supplements only have a `name` field, not `fullname`.
    // get_supplement_from_fullname() compares against .fullname which is undefined,
    // so bundle parts are unreachable through this method.
    const result = supplements_list.get_supplement_from_fullname(
      "Part 1: Calcium & Magnesium",
    );
    expect(result).toBeNull();
  });

  it("returns the Bundle parent itself when searching by its fullname", () => {
    // The ReefCare Bundle has a fullname on the top-level supplement object.
    const result = supplements_list.get_supplement_from_fullname(
      "RedSea - ReefCare Program",
    );
    expect(result).not.toBeNull();
    expect(result.uid).toBe("redsea-reefcare");
    expect(result.type).toBe("Bundle");
  });

  it("bundle parts are found by uid but not by fullname (asymmetry documented)", () => {
    // By uid: found
    const by_uid = supplements_list.get_supplement_from_uid(
      "6b7d2c15-0d25-4447-b089-854ef6ba99f2",
    );
    expect(by_uid).not.toBeNull();
    // By fullname: not found (no fullname on sub-supplement)
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
