/**
 * Monitoring tab of the scene editor: choosing what is monitored, the
 * thresholds, and where the monitoring stands.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/devices/index";
import "../src/base/index";
import "../src/aquarium/index";
import { open_scene_editor } from "../src/aquarium/editor/scene_editor";
import { reset_catalog_cache } from "../src/aquarium/api";
import * as ops from "../src/aquarium/editor/ops";

afterEach(() => {
  reset_catalog_cache();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

const MONITORING = {
  ph_entity: null,
  orp_entity: null,
  co2_entity: null,
  kh_entity: null,
  ph_calibration_entity: null,
  orp_calibration_entity: null,
  pause_entities: [],
  learning_days: 14,
  ph_base_drop: 0.1,
  ph_swing_pct: 50,
  ph_profile_band: 0.05,
  ph_profile_hours: 4,
  orp_drop_mv: 30,
  orp_drop_hours: 12,
  kh_change_max: 0.5,
  pause_hours: 6,
};

const ENTITIES = {
  monitoring: "sensor.tank_monitoring",
  ph_base_low: "binary_sensor.tank_ph_low",
  ph_swing_high: "binary_sensor.tank_ph_swing",
  ph_profile_off: "binary_sensor.tank_ph_profile",
  orp_low: "binary_sensor.tank_orp_low",
  kh_fast_change: "binary_sensor.tank_kh",
};

function state(entity_id: string, value: string, attributes: any = {}) {
  return { entity_id, state: value, attributes };
}

function make_states() {
  const list = [
    state("sensor.tank_ph", "8.2", { friendly_name: "Tank pH" }),
    state("sensor.hub_acidity", "8.1", { device_class: "ph" }),
    state("sensor.tank_orp", "350", { unit_of_measurement: "mV" }),
    state("sensor.hub_redox", "350"),
    state("sensor.hub_orp", "350"),
    state("sensor.room_co2", "900"),
    state("sensor.air", "900", { device_class: "carbon_dioxide" }),
    state("sensor.ph_date", "2026-11-01", { device_class: "timestamp" }),
    state("sensor.install", "2026-01-01", { device_class: "timestamp" }),
    state("sensor.temp", "25"),
    state("switch.maintenance", "off"),
    state("input_boolean.cleaning", "off"),
    state("binary_sensor.door", "off"),
    state("light.room", "on"),
    state("sensor.tank_monitoring", "learning", { learning_pct: 40 }),
    state("binary_sensor.tank_ph_low", "on"),
    state("binary_sensor.tank_ph_swing", "off"),
    state("binary_sensor.tank_ph_profile", "unavailable"),
    state("binary_sensor.tank_orp_low", "unknown"),
    state("binary_sensor.tank_kh", "on"),
    state("sensor.head_measurement", "8.1", { unit_of_measurement: "dKH" }),
    state("sensor.head_ca", "430", { unit_of_measurement: "ppm" }),
    state("input_number.tank_kh", "8.1"),
    state("number.tank_kh", "8.1"),
  ];
  return Object.fromEntries(list.map((s) => [s.entity_id, s]));
}

function make_doc(monitoring: any = MONITORING) {
  const doc = ops.new_document("Reefer");
  doc.id = "a1b2";
  doc.revision = 3;
  return monitoring ? { ...doc, monitoring: structuredClone(monitoring) } : doc;
}

function make_hass(doc: any, entities: any = ENTITIES) {
  const hass: any = {
    config: { components: ["reeftank"] },
    language: "en",
    states: make_states(),
    entities: {},
    devices: {},
    areas: {},
    floors: {},
    callService: vi.fn(),
    callWS: vi.fn(async (msg: any) => {
      switch (msg.type) {
        case "reeftank/catalog":
          return { fish: [], corals: [], presets: [] };
        case "reeftank/aquarium/get":
          return { document: structuredClone(doc), entities };
        case "reeftank/aquarium/save":
          return { document: structuredClone(msg.document), entities };
        default:
          return null;
      }
    }),
    fetchWithAuth: vi.fn(),
  };
  return hass;
}

const flush = () => new Promise((r) => setTimeout(r, 0));

async function open(hass: any) {
  const editor: any = open_scene_editor(hass, "a1b2", vi.fn());
  await flush();
  await flush();
  await editor.updateComplete;
  const tab = [...editor.renderRoot.querySelectorAll("nav button")].at(-1);
  tab.click();
  await editor.updateComplete;
  return editor;
}

function input_of(editor: any, label: string): HTMLInputElement {
  const field = [...editor.renderRoot.querySelectorAll("label.field")].find(
    (l: any) => l.textContent.includes(label),
  ) as HTMLElement;
  return field.querySelector("input") as HTMLInputElement;
}

async function fill(editor: any, label: string, value: string) {
  const input = input_of(editor, label);
  input.value = value;
  input.dispatchEvent(new Event("change"));
  await editor.updateComplete;
}

describe("monitoring operations", () => {
  it("changes settings on a copy", () => {
    const doc = make_doc();
    const next = ops.update_monitoring(doc, { orp_drop_mv: 45 });
    expect(next.monitoring!.orp_drop_mv).toBe(45);
    expect(doc.monitoring!.orp_drop_mv).toBe(30);
  });

  it("adds a pause entity once, and removes it", () => {
    const doc = make_doc();
    const added = ops.add_pause_entity(doc, "switch.maintenance");
    expect(added.monitoring!.pause_entities).toEqual(["switch.maintenance"]);
    expect(ops.add_pause_entity(added, "switch.maintenance")).toBe(added);
    expect(ops.add_pause_entity(doc, "")).toBe(doc);
    const removed = ops.remove_pause_entity(added, "switch.maintenance");
    expect(removed.monitoring!.pause_entities).toEqual([]);
  });

  it("offers the entities that suit a field", () => {
    const hass = { states: make_states() };
    const ids = (kind: ops.MonitoringKind) =>
      ops.monitoring_candidates(hass, kind).map((c) => c.id);
    expect(ids("ph")).toEqual(["sensor.hub_acidity", "sensor.tank_ph"]);
    expect(ids("orp")).toEqual(["sensor.hub_orp", "sensor.tank_orp"]);
    expect(ids("co2")).toEqual(["sensor.air", "sensor.room_co2"]);
    expect(ids("kh")).toEqual([
      "input_number.tank_kh",
      "sensor.head_measurement",
    ]);
    expect(ids("calibration")).toEqual(["sensor.install", "sensor.ph_date"]);
    expect(ids("pause")).toContain("input_boolean.cleaning");
    expect(ids("pause")).not.toContain("light.room");
    expect(ops.monitoring_candidates(hass, "ph")[1].name).toBe("Tank pH");
    expect(ops.monitoring_candidates(hass, "ph")[0].name).toBe(
      "sensor.hub_acidity",
    );
  });

  it("prefers the adjustment date of a probe for a calibration", () => {
    const hass = {
      states: make_states(),
      entities: {
        "sensor.ph_date": { translation_key: "probe_last_adjustment" },
      },
    };
    expect(
      ops.monitoring_candidates(hass, "calibration").map((c) => c.id),
    ).toEqual(["sensor.ph_date"]);
  });

  it("offers nothing without states", () => {
    expect(ops.monitoring_candidates(null, "ph")).toEqual([]);
  });
});

describe("monitoring tab", () => {
  it("asks to save first without monitoring settings", async () => {
    const editor = await open(make_hass(make_doc(null)));
    expect(editor.renderRoot.textContent).toContain(
      "Monitoring also needs a recent ReefTank integration",
    );
    expect(editor.renderRoot.querySelector("datalist")).toBeNull();
  });

  it("sets the entities and saves them", async () => {
    const hass = make_hass(make_doc());
    const editor = await open(hass);
    await fill(editor, "pH", "sensor.tank_ph");
    await fill(editor, "KH tests", "sensor.head_measurement");
    expect(editor._doc.monitoring.kh_entity).toBe("sensor.head_measurement");
    await fill(editor, "ORP (mV)", " sensor.tank_orp ");
    expect(editor._doc.monitoring.ph_entity).toBe("sensor.tank_ph");
    expect(editor._doc.monitoring.orp_entity).toBe("sensor.tank_orp");
    await fill(editor, "ORP (mV)", "");
    expect(editor._doc.monitoring.orp_entity).toBeNull();

    await editor.save();
    const saved = hass.callWS.mock.calls
      .map((c: any[]) => c[0])
      .find((m: any) => m.type === "reeftank/aquarium/save");
    expect(saved.document.monitoring.ph_entity).toBe("sensor.tank_ph");
  });

  it("lists what suits each entity field", async () => {
    const editor = await open(make_hass(make_doc()));
    const options = editor.renderRoot.querySelectorAll(
      "datalist#monitoring_orp option",
    );
    expect([...options].map((o: any) => o.value)).toContain("sensor.tank_orp");
    expect(input_of(editor, "ORP (mV)").getAttribute("list")).toBe(
      "monitoring_orp",
    );
  });

  it("keeps thresholds within bounds", async () => {
    const editor = await open(make_hass(make_doc()));
    await fill(editor, "KH change (dKH)", "9");
    expect(editor._doc.monitoring.kh_change_max).toBe(3);
    await fill(editor, "ORP drop (mV)", "1000");
    expect(editor._doc.monitoring.orp_drop_mv).toBe(200);
    await fill(editor, "ORP drop (mV)", "1");
    expect(editor._doc.monitoring.orp_drop_mv).toBe(5);
    await fill(editor, "pH drop", "0.15");
    expect(editor._doc.monitoring.ph_base_drop).toBe(0.15);
    await fill(editor, "pH drop", "");
    expect(editor._doc.monitoring.ph_base_drop).toBe(0.15);
  });

  it("adds and removes pause entities", async () => {
    const editor = await open(make_hass(make_doc()));
    const input = editor.renderRoot.querySelector(
      "input[list=monitoring_pause]",
    );
    input.value = "switch.maintenance";
    input.dispatchEvent(new Event("change"));
    await editor.updateComplete;
    expect(editor._doc.monitoring.pause_entities).toEqual([
      "switch.maintenance",
    ]);
    expect(input.value).toBe("");
    expect(editor.renderRoot.textContent).toContain("switch.maintenance");

    const remove = editor.renderRoot.querySelector("fieldset .line button");
    remove.click();
    await editor.updateComplete;
    expect(editor._doc.monitoring.pause_entities).toEqual([]);
  });

  it("can be undone", async () => {
    const editor = await open(make_hass(make_doc()));
    await fill(editor, "ORP drop (mV)", "45");
    editor.undo();
    expect(editor._doc.monitoring.orp_drop_mv).toBe(30);
  });

  it("shows the status and the alarms", async () => {
    const editor = await open(make_hass(make_doc()));
    const text = editor.renderRoot.textContent;
    expect(text).toContain("Learning (40 %)");
    const alarms = editor.renderRoot.querySelectorAll(".monitoring-alarm");
    expect(alarms).toHaveLength(6);
    expect(alarms[0].classList.contains("on")).toBe(true);
    expect(alarms[0].textContent).toContain("Alarm");
    expect(alarms[1].textContent).toContain("OK");
    expect(alarms[2].textContent).toContain("Not available");
    expect(alarms[3].textContent).toContain("Not known yet");
    // No entity known for this alarm
    expect(alarms[4].textContent).toContain("Not known yet");
    expect(alarms[5].textContent).toContain("KH moving too fast");
  });

  it("shows no percentage once learned", async () => {
    const hass = make_hass(make_doc());
    hass.states["sensor.tank_monitoring"] = state(
      "sensor.tank_monitoring",
      "ready",
    );
    const editor = await open(hass);
    expect(editor.renderRoot.textContent).toContain("Watching");
    expect(editor.renderRoot.textContent).not.toContain(" %)");
  });

  it("counts learning from 0 without its attribute", async () => {
    const hass = make_hass(make_doc());
    hass.states["sensor.tank_monitoring"] = state(
      "sensor.tank_monitoring",
      "learning",
    );
    const editor = await open(hass);
    expect(editor.renderRoot.textContent).toContain("Learning (0 %)");
  });

  it("hides the status with an integration not giving it", async () => {
    const editor = await open(make_hass(make_doc(), {}));
    expect(editor.renderRoot.querySelector(".monitoring-alarm")).toBeNull();
    expect(editor.renderRoot.querySelector("datalist")).not.toBeNull();
  });

  it("hides the status without entities", async () => {
    const hass = make_hass(make_doc(), undefined);
    hass.callWS = vi.fn(async (msg: any) =>
      msg.type === "reeftank/aquarium/get"
        ? { document: make_doc() }
        : msg.type === "reeftank/catalog"
          ? { fish: [], corals: [], presets: [] }
          : null,
    );
    const editor = await open(hass);
    expect(editor.renderRoot.querySelector(".monitoring-alarm")).toBeNull();
  });
});
