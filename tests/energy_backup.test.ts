// Tests for the energy backup view: detection of the reefbeatEnergyBackup
// device among the MQTT devices, lookup of its sensors and of the pumps,
// configuration written for Power Flow Card Plus, and the view embedding it.

import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/devices/index";
import DeviceList, { resolve_device_model } from "../src/utils/common";
import { RSDevice } from "../src/devices/device";
import { EnergyBackup } from "../src/devices/reefbeat/energybackup";
import {
  ENERGY_BACKUP_MODEL,
  POWER_FLOW_CARD_HACS_URL,
  POWER_FLOW_CARD_TAG,
  POWER_FLOW_CARD_URL,
} from "../src/utils/constants";
import {
  BACKUP_MAX_PUMPS,
  build_power_flow,
  find_backup_entities,
  backed_up_pumps,
  pump_available,
  pump_plugged,
  pump_direction_template,
  pump_icon,
  pump_kind,
  pump_labels,
  pump_speed,
  resolve_backup_topology,
  select_backup_pumps,
  type BackupPump,
} from "../src/utils/energy_backup";

//----------------------------------------------------------------------------//
//   Fixtures
//----------------------------------------------------------------------------//

const EB = "eb1";
const P = "sensor.reef_battery_backup_";

interface Scenario {
  /** Leave the charger sensor out (no Victron) */
  no_charger?: boolean;
  /** Leave the mains state sensor out */
  no_power_state?: boolean;
  /** Publish the sensors without their reef_role (older service) */
  no_roles?: boolean;
  /** State of the mains sensor */
  power_state?: string;
  /** Leave every Red Sea device out */
  no_redsea?: boolean;
  /** Add Aqua Medic pumps */
  aquamedic?: boolean;
  /** Runtime sensor state */
  runtime?: string;
}

/**
 * Build a hass object holding an energy backup device, another MQTT device,
 * two ReefWave and a ReefRun with its two pumps.
 */
function makeHass(o: Scenario = {}): any {
  const states: Record<string, any> = {};
  const entities: Record<string, any> = {};
  const add = (
    entity_id: string,
    device_id: string,
    state: string,
    attributes: Record<string, any> = {},
    translation_key?: string,
  ) => {
    entities[entity_id] = { entity_id, device_id, translation_key };
    states[entity_id] = { entity_id, state, attributes };
  };
  const role = (name: string) => (o.no_roles ? {} : { reef_role: name });

  add(P + "puissance", EB, "-12", role("battery_power"));
  add(P + "soc_batterie", EB, "98", role("battery_soc"));
  add(P + "tension_batterie", EB, "26.4", role("battery_voltage"));
  if (!o.no_power_state) {
    add(P + "etat_secteur", EB, o.power_state ?? "mains", role("power_state"));
  }
  add(P + "intensite_pompes", EB, "100", role("pump_intensity"));
  add(P + "autonomie", EB, o.runtime ?? "11.5", role("runtime"));
  add(P + "duree_coupure", EB, "47", role("outage_duration"));
  add(P + "energie_consommee", EB, "1.2", role("energy_consumed"));
  if (!o.no_charger) {
    add(P + "puissance_chargeur", EB, "82", role("charger_power"));
  }
  // Not a sensor: never taken for one of the service
  add("button.reef_battery_backup_puissance", EB, "unknown");
  // Registered without a device: ignored
  entities["sensor.orphan"] = { entity_id: "sensor.orphan" };

  const device = (
    id: string,
    identifier: [string, string],
    name: string,
    model: string,
    extra: Record<string, any> = {},
  ) => ({
    id,
    identifiers: [identifier],
    name,
    model,
    primary_config_entry: "entry_" + id,
    disabled_by: null,
    ...extra,
  });
  const devices: Record<string, any> = {
    [EB]: device(
      EB,
      ["mqtt", "reef_battery"],
      "Reef Battery Backup",
      "Energy Backup System",
      { model_id: "reefbeat-energy-backup" },
    ),
    plug: device("plug", ["mqtt", "0x1234"], "Some plug", "TS011F", {
      model_id: "TS011F",
    }),
    bare: device("bare", ["mqtt", "bare"], "No model id", "Thing"),
    // No identifier tuple: skipped by every lookup
    odd: { id: "odd", identifiers: ["odd"], name: "Odd", disabled_by: null },
  };

  if (!o.no_redsea) {
    add("sensor.w1_f", "w1", "60", {}, "wave_forward_intensity");
    add("sensor.w1_b", "w1", "0", {}, "wave_backward_intensity");
    add("switch.w1_state", "w1", "on", {}, "device_state");
    add("sensor.w2_b", "w2", "25", {}, "wave_backward_intensity");
    add("switch.run_state", "run", "on", {}, "device_state");
    add("number.p1_speed", "p1", "80", {}, "speed");
    add("sensor.p1_type", "p1", "return", {}, "type");
    add("switch.p1_schedule", "p1", "on", {}, "schedule_enabled");
    add("text.p1_name", "p1", "Return 12000", {}, "pump_name");
    add("sensor.p2_name", "p2", "unknown", {}, "name");
    add("number.p2_speed", "p2", "55", {}, "speed");
    add("sensor.p2_type", "p2", "skimmer", {}, "type");
    Object.assign(devices, {
      w1: device("w1", ["redsea", "hw1"], "Wave B", "RSWAVE45"),
      w2: device("w2", ["redsea", "hw2"], "Wave A", "RSWAVE25"),
      // A ReefWave without any intensity sensor is not a pump to show
      w3: device("w3", ["redsea", "hw4"], "Wave C", "RSWAVE25"),
      run: device("run", ["redsea", "hw3"], "Run", "RSRUN"),
      p1: device("p1", ["redsea", "hw3_pump_1"], "Run pump 1", "RSRUN", {
        via_device_id: "run",
      }),
      p2: device("p2", ["redsea", "hw3_pump_2"], "Run pump 2", "RSRUN"),
      // A pump without a speed, a disabled one, and a device that is no pump
      p3: device("p3", ["redsea", "hw5_pump_1"], "Run pump 3", "RSRUN"),
      off: device("off", ["redsea", "hw6"], "Disabled", "RSWAVE45", {
        disabled_by: "user",
      }),
      dose: device("dose", ["redsea", "hw7"], "Dose", "RSDOSE4"),
      // A registry row without a model
      blank: {
        ...device("blank", ["redsea", "hw8"], "Blank", ""),
        model: null,
      },
    });
  }

  if (o.aquamedic) {
    add("number.am1_speed", "am1", "40", {}, "motor_speed");
    add("switch.am1_power", "am1", "on", {}, "power");
    add("select.am1_role", "am1", "skimmer", {}, "pump_role");
    add("number.am2_speed", "am2", "30", {}, "motor_speed");
    add("number.am3_flow", "am3", "70", {}, "flow");
    add("number.am5_speed", "am5", "10", {}, "motor_speed");
    Object.assign(devices, {
      am1: device("am1", ["aquamedic", "a1"], "Runner", "DC Runner"),
      am2: device("am2", ["aquamedic", "a2"], "Skim", "DC Skimmer"),
      am3: device("am3", ["aquamedic", "a3"], "Drift", "SmartDrift"),
      // No speed entity: not a pump to show
      am4: device("am4", ["aquamedic", "a4"], "Mute", "SmartDrift"),
      am5: { ...device("am5", ["aquamedic", "a5"], "Bare", ""), model: null },
    });
  }

  return {
    states,
    entities,
    devices,
    callService: vi.fn(),
    locale: { language: "en" },
  };
}

/** The card device, as DeviceList builds it. */
function deviceInfo(hass: any): any {
  return {
    name: "Reef Battery Backup",
    key: EB,
    uid: "reef_battery",
    elements: [hass.devices[EB]],
  };
}

/** Stand-in for Power Flow Card Plus. */
class FakeFlowCard extends HTMLElement {
  config: any = null;
  hass: any = null;
  static refuse: string | null = null;
  setConfig(config: any) {
    if (FakeFlowCard.refuse !== null) {
      throw new Error(FakeFlowCard.refuse);
    }
    this.config = config;
  }
}

// Captured before any spy, so installing twice never wraps a spy in a spy
const real_get = customElements.get.bind(customElements);
const real_create = document.createElement.bind(document);
let flow_card_installed = false;

/**
 * Tell the view whether Power Flow Card Plus is installed, without ever
 * defining the real tag: a custom element cannot be undefined afterwards.
 */
function installFlowCard(installed: boolean): void {
  if (!real_get("fake-flow-card")) {
    customElements.define("fake-flow-card", FakeFlowCard);
  }
  flow_card_installed = installed;
  vi.spyOn(customElements, "get").mockImplementation((tag: string) =>
    tag === POWER_FLOW_CARD_TAG
      ? flow_card_installed
        ? FakeFlowCard
        : undefined
      : real_get(tag),
  );
  vi.spyOn(document, "createElement").mockImplementation(((
    tag: string,
    options?: any,
  ) =>
    tag === POWER_FLOW_CARD_TAG
      ? real_create("fake-flow-card")
      : real_create(tag, options)) as any);
}

/** Build the view for a hass object. */
function makeView(hass: any, config: any = {}): any {
  const view = RSDevice.create_device(
    "reefbeat-energybackup",
    hass,
    config,
    deviceInfo(hass),
  ) as any;
  return view;
}

/** Mount a view and wait for its first render. */
async function mount(view: any): Promise<void> {
  document.body.appendChild(view);
  await view.updateComplete;
}

/** Text of the shadow root, whitespace collapsed. */
function text(view: any): string {
  return view.shadowRoot.textContent.replace(/\s+/g, " ").trim();
}

afterEach(() => {
  vi.restoreAllMocks();
  FakeFlowCard.refuse = null;
  document.body.querySelectorAll("reefbeat-energybackup").forEach((el) => {
    el.remove();
  });
});

//----------------------------------------------------------------------------//
//   Detection
//----------------------------------------------------------------------------//

describe("energy backup detection", () => {
  it("lists the energy backup device and no other MQTT device", () => {
    const list = new DeviceList(makeHass());
    const names = list.main_devices.map((d) => d.text);
    expect(names).toContain("Reef Battery Backup");
    expect(names).not.toContain("Some plug");
    expect(names).not.toContain("No model id");
    const main = list.find_main_device("reef_battery");
    expect(main?.value).toBe(EB);
    expect(main?.uid).toBe("reef_battery");
  });

  it("resolves its model from the model_id, whatever the model says", () => {
    const hass = makeHass();
    hass.devices[EB].model = "LiFePO4 24V 60Ah";
    const info = deviceInfo(hass);
    const model = resolve_device_model(
      hass,
      info,
      "mqtt",
      info.elements[0].model,
    );
    expect(model).toBe(ENERGY_BACKUP_MODEL);
    expect(RSDevice.tag_for_model("mqtt", model)).toBe("reefbeat-energybackup");
    expect(customElements.get("reefbeat-energybackup")).toBe(EnergyBackup);
  });

  it("keeps the raw model of a device without a known model_id", () => {
    const hass = makeHass();
    const info = { name: "x", elements: [hass.devices.plug] } as any;
    expect(resolve_device_model(hass, info, "mqtt", "TS011F")).toBe("TS011F");
    expect(resolve_device_model(hass, undefined as any, "mqtt", "X")).toBe("X");
  });
});

//----------------------------------------------------------------------------//
//   Sensors and pumps
//----------------------------------------------------------------------------//

describe("energy backup topology", () => {
  it("finds the sensors by role", () => {
    const hass = makeHass();
    const { roles } = resolve_backup_topology(hass, [EB]);
    expect(roles).toEqual({
      battery_power: P + "puissance",
      battery_soc: P + "soc_batterie",
      power_state: P + "etat_secteur",
      pump_intensity: P + "intensite_pompes",
      runtime: P + "autonomie",
      outage_duration: P + "duree_coupure",
      charger_power: P + "puissance_chargeur",
      energy_consumed: P + "energie_consommee",
    });
  });

  it("falls back to the entity id for a service without roles", () => {
    const hass = makeHass({ no_roles: true });
    const { roles } = resolve_backup_topology(hass, [EB]);
    expect(roles.battery_power).toBe(P + "puissance");
    expect(roles.charger_power).toBe(P + "puissance_chargeur");
    expect(roles.runtime).toBe(P + "autonomie");
  });

  it("reads entity ids built from the unique ids too", () => {
    const ids = [
      "sensor.reef_battery_power",
      "sensor.reef_battery_charger_power",
      "sensor.reef_battery_power_state",
      "sensor.reef_battery_soc",
      "sensor.reef_battery_charger_voltage",
      // Named after the entity alone, without the device
      "sensor.autonomie",
    ];
    expect(find_backup_entities({ states: {} } as any, ids)).toEqual({
      battery_power: "sensor.reef_battery_power",
      charger_power: "sensor.reef_battery_charger_power",
      power_state: "sensor.reef_battery_power_state",
      battery_soc: "sensor.reef_battery_soc",
      runtime: "sensor.autonomie",
    });
  });

  it("prefers the role over the entity id", () => {
    const hass = makeHass();
    hass.entities["sensor.renamed"] = { device_id: EB };
    hass.states["sensor.renamed"] = {
      state: "5",
      attributes: { reef_role: "battery_power" },
    };
    hass.states[P + "puissance"].attributes = {};
    expect(resolve_backup_topology(hass, [EB]).roles.battery_power).toBe(
      "sensor.renamed",
    );
  });

  it("finds nothing for an unknown device or without states", () => {
    const hass = makeHass();
    expect(resolve_backup_topology(hass, ["nope"]).roles).toEqual({});
    expect(find_backup_entities({} as any, [P + "puissance"])).toEqual({
      battery_power: P + "puissance",
    });
    expect(resolve_backup_topology({ states: {} } as any, [EB])).toEqual({
      roles: {},
      pumps: [],
      redsea_icons: false,
    });
  });

  it("lists the pumps, gyres first then by name", () => {
    const hass = makeHass();
    const topology = resolve_backup_topology(hass, [EB]);
    expect(topology.redsea_icons).toBe(true);
    expect(topology.pumps.map((p) => p.id)).toEqual(["w2", "w1", "p1", "p2"]);
    const [w2, w1, p1, p2] = topology.pumps as BackupPump[];
    expect(w1).toMatchObject({
      kind: "gyre",
      speed_entities: ["sensor.w1_f", "sensor.w1_b"],
      forward_entity: "sensor.w1_f",
      backward_entity: "sensor.w1_b",
      power_entities: ["switch.w1_state"],
    });
    expect(w2.speed_entities).toEqual(["sensor.w2_b"]);
    expect(w2.forward_entity).toBeUndefined();
    expect(w2.power_entities).toEqual([]);
    // Its own schedule switch, and the switch of its controller
    expect(p1.power_entities).toEqual([
      "switch.p1_schedule",
      "switch.run_state",
    ]);
    expect(p1.type_entity).toBe("sensor.p1_type");
    expect(p2.power_entities).toEqual([]);
  });

  it("describes a ReefRun pump by its controller and channel", () => {
    const hass = makeHass();
    const pumps = resolve_backup_topology(hass, [EB]).pumps;
    expect(pumps.find((p) => p.id === "p1")).toMatchObject({
      hwid: "hw3",
      owner_name: "Run",
      channel: 1,
    });
    // No parent in the registry: its own name stands in
    expect(pumps.find((p) => p.id === "p2")).toMatchObject({
      hwid: "hw3",
      owner_name: "Run pump 2",
      channel: 2,
    });
    // An identifier without a channel number
    hass.devices.p2.identifiers = [["redsea", "hw3_pump"]];
    expect(
      resolve_backup_topology(hass, [EB]).pumps.find((p) => p.id === "p2"),
    ).toMatchObject({ hwid: "hw3", channel: 0 });
  });

  it("lists the Aqua Medic pumps", () => {
    const hass = makeHass({ no_redsea: true, aquamedic: true });
    const topology = resolve_backup_topology(hass, [EB]);
    expect(topology.redsea_icons).toBe(false);
    expect(topology.pumps.map((p) => [p.id, p.kind])).toEqual([
      ["am5", "gyre"],
      ["am3", "gyre"],
      ["am1", "return"],
      ["am2", "skimmer"],
    ]);
    const am1 = topology.pumps[2] as BackupPump;
    expect(am1.power_entities).toEqual(["switch.am1_power"]);
    // The role select tells a DC Runner used as a skimmer
    expect(pump_kind(hass, am1)).toBe("skimmer");
  });
});

describe("energy backup pump readings", () => {
  const hass = makeHass();
  const pumps = resolve_backup_topology(hass, [EB]).pumps;
  const [w2, w1, p1, p2] = pumps as BackupPump[];

  it("reads the kind from the type sensor", () => {
    expect(pump_kind(hass, p1)).toBe("return");
    expect(pump_kind(hass, p2)).toBe("skimmer");
    expect(pump_kind(hass, w1)).toBe("gyre");
    const h = makeHass();
    h.states["sensor.p1_type"].state = "unknown";
    expect(pump_kind(h, p1)).toBe("pump");
    expect(pump_kind({} as any, p1)).toBe("pump");
  });

  it("reads the speed, zero once a switch is off", () => {
    expect(pump_speed(hass, w1)).toBe(60);
    expect(pump_speed(hass, w2)).toBe(25);
    expect(pump_speed(hass, p1)).toBe(80);
    const h = makeHass();
    h.states["switch.run_state"].state = "off";
    expect(pump_speed(h, p1)).toBe(0);
    h.states["sensor.w1_f"].state = "unavailable";
    h.states["sensor.w1_b"].state = "";
    expect(pump_speed(h, w1)).toBe(0);
    delete h.states["number.p2_speed"];
    expect(pump_speed(h, p2)).toBe(0);
    expect(pump_speed({} as any, p2)).toBe(0);
  });

  it("writes a direction template for a wave pump only", () => {
    expect(pump_direction_template(p1)).toBeNull();
    expect(pump_direction_template(w1)).toContain("states('sensor.w1_f')");
    expect(pump_direction_template(w1)).toContain("states('sensor.w1_b')");
    // A missing side reads as zero
    expect(pump_direction_template(w2)).toContain("{% set f = 0 %}");
    expect(
      pump_direction_template({
        ...w2,
        forward_entity: "sensor.f",
        backward_entity: undefined,
      }),
    ).toContain("{% set r = 0 %}");
  });

  it("picks an icon following the speed", () => {
    expect(pump_icon("gyre", 0, true)).toBe("redsea:gyre-off");
    expect(pump_icon("gyre", 20, true)).toBe("redsea:gyre-min");
    expect(pump_icon("gyre", 50, true)).toBe("redsea:gyre-med");
    expect(pump_icon("gyre", 90, true)).toBe("redsea:gyre-max");
    expect(pump_icon("skimmer", 0, true)).toBe("redsea:skimmer-off");
    expect(pump_icon("skimmer", 5, true)).toBe("redsea:skimmer-on");
    expect(pump_icon("return", 0, true)).toBe("redsea:pump-off");
    expect(pump_icon("pump", 5, true)).toBe("redsea:pump-on");
  });

  it("falls back to Material icons without the Red Sea pack", () => {
    expect(pump_icon("gyre", 0, false)).toBe("mdi:fan-off");
    expect(pump_icon("gyre", 5, false)).toBe("mdi:fan");
    expect(pump_icon("skimmer", 5, false)).toBe("mdi:chart-bubble");
    expect(pump_icon("return", 0, false)).toBe("mdi:pump-off");
    expect(pump_icon("return", 5, false)).toBe("mdi:pump");
  });

  it("labels the pumps by their name in Home Assistant", () => {
    // The name given to a ReefRun pump wins over "<controller> pump <n>";
    // without one, the name of the sub-device stands in
    expect(pump_labels(hass, pumps)).toEqual([
      "Wave A",
      "Wave B",
      "Return 12000",
      "Run pump 2",
    ]);
    // A device renamed by the user keeps that name
    const h = makeHass();
    h.devices.w1.name_by_user = "Left gyre";
    h.devices.p1.name_by_user = "Main return";
    const renamed = resolve_backup_topology(h, [EB]).pumps;
    expect(pump_labels(h, renamed)).toEqual([
      "Left gyre",
      "Wave A",
      "Main return",
      "Run pump 2",
    ]);
    // Renaming does not hide the pump from the service, which knows the
    // device by the name it reports
    expect(renamed[0]).toMatchObject({ id: "w1", owner_name: "Wave B" });
    expect(pump_labels({} as any, [p1])).toEqual(["Run pump 1"]);
  });

  it("falls back to the kind of a pump without a name", () => {
    const bare = (pump: BackupPump) => ({ ...pump, name: "" });
    expect(pump_labels(hass, [w1, w2, p2].map(bare))).toEqual([
      "Gyre 1",
      "Gyre 2",
      "Skimmer",
    ]);
    expect(
      pump_labels(hass, [
        bare({ ...p1, name_entity: undefined }),
        bare({ ...p2, type_entity: undefined }),
      ]),
    ).toEqual(["Return", "Pump"]);
  });

  it("selects the picked pumps, four at most", () => {
    const topology = resolve_backup_topology(hass, [EB]);
    const ids = (selection: string[], t = topology, h = hass) =>
      select_backup_pumps(h, t, selection).map((p) => p.id);
    expect(ids([])).toEqual(["w2", "w1", "p1", "p2"]);
    expect(ids(["p2", "w1"])).toEqual(["w1", "p2"]);
    // A selection naming no known pump falls back to the default
    expect(ids(["gone"])).toHaveLength(4);
    const many = { ...topology, pumps: [...pumps, { ...p1, id: "p9" }] };
    expect(ids([], many)).toHaveLength(BACKUP_MAX_PUMPS);
  });

  it("leaves out a pump that no longer reports a speed", () => {
    const h = makeHass();
    h.states["sensor.w1_f"].state = "unavailable";
    h.states["sensor.w1_b"].state = "unknown";
    delete h.states["number.p2_speed"];
    expect(pump_available(h, w1)).toBe(false);
    expect(pump_available(h, p2)).toBe(false);
    expect(pump_available(h, p1)).toBe(true);
    expect(pump_available({} as any, p1)).toBe(false);
    const topology = resolve_backup_topology(h, [EB]);
    expect(select_backup_pumps(h, topology, []).map((p) => p.id)).toEqual([
      "w2",
      "p1",
    ]);
    // Picked by hand, it is shown anyway
    expect(select_backup_pumps(h, topology, ["w1"]).map((p) => p.id)).toEqual([
      "w1",
    ]);
  });

  it("leaves out the empty channel of a ReefRun", () => {
    const shown = (edit: (h: any) => void, controllers?: any) => {
      const h = makeHass();
      edit(h);
      if (controllers) {
        h.states[P + "intensite_pompes"].attributes.controllers = controllers;
      }
      const topology = resolve_backup_topology(h, [EB]);
      return select_backup_pumps(h, topology, []).map((p) => p.id);
    };
    const add = (h: any, id: string, key: string, state: any, attrs = {}) => {
      h.entities[id] = { device_id: "p2", translation_key: key };
      h.states[id] = { state, attributes: attrs };
    };
    // Reported by the dedicated entity
    expect(
      shown((h) => add(h, "binary_sensor.p2_missing", "missing_pump", "on")),
    ).toEqual(["w2", "w1", "p1"]);
    expect(
      shown((h) => add(h, "binary_sensor.p2_missing", "missing_pump", "off")),
    ).toContain("p2");
    // Or by an attribute of the state sensor
    for (const value of [true, 1, "True", "yes"]) {
      expect(
        shown((h) =>
          add(h, "sensor.p2_state", "state", "x", { missing_pump: value }),
        ),
      ).not.toContain("p2");
    }
    for (const value of [false, 0, null, undefined, {}]) {
      expect(
        shown((h) =>
          add(h, "sensor.p2_state", "state", "x", { missing_pump: value }),
        ),
      ).toContain("p2");
    }
    // Or not told what it is yet
    expect(
      shown((h) => (h.states["sensor.p2_type"].state = "unknown")),
    ).not.toContain("p2");
    // Even when the service still lists it
    expect(
      shown(
        (h) => (h.states["sensor.p2_type"].state = "unknown"),
        [
          { hwid: "hw3", pump: 1 },
          { hwid: "hw3", pump: 2 },
        ],
      ),
    ).toEqual(["p1"]);
    // A channel without any of those entities is taken as plugged
    const h = makeHass();
    const p2 = resolve_backup_topology(h, [EB]).pumps.find(
      (p) => p.id === "p2",
    ) as BackupPump;
    expect(pump_plugged(h, { ...p2, type_entity: undefined })).toBe(true);
    expect(pump_plugged({} as any, { ...p2, state_entity: "sensor.x" })).toBe(
      true,
    );
    expect(pump_plugged({} as any, { ...p2, missing_entity: "sensor.x" })).toBe(
      true,
    );
    // Picked by hand, it is shown anyway
    h.states["sensor.p2_type"].state = "unknown";
    expect(
      select_backup_pumps(h, resolve_backup_topology(h, [EB]), ["p2"]),
    ).toHaveLength(1);
  });

  it("shows the pumps the service drives", () => {
    const drives = (controllers: any) => {
      const h = makeHass();
      h.states[P + "intensite_pompes"].attributes.controllers = controllers;
      const topology = resolve_backup_topology(h, [EB]);
      return {
        backed: backed_up_pumps(h, topology)?.map((p) => p.id),
        shown: select_backup_pumps(h, topology, []).map((p) => p.id),
      };
    };
    // By hardware id: a ReefWave, and one channel of the ReefRun
    expect(
      drives([
        { name: "renamed", hwid: "hw1" },
        { name: "Run", hwid: "hw3", pump: 2 },
      ]),
    ).toEqual({ backed: ["w1", "p2"], shown: ["w1", "p2"] });
    // By name, for a service that does not know the hardware id
    expect(
      drives([
        { name: "Wave A", hwid: null },
        { name: "Run", pump: 1 },
        { name: "Wave B", pump: 1 },
        { hwid: null },
        null,
      ]).backed,
    ).toEqual(["w2", "p1"]);
    // None of them known to Home Assistant: the pumps that respond
    expect(drives([{ name: "gone", hwid: "nope" }])).toEqual({
      backed: [],
      shown: ["w2", "w1", "p1", "p2"],
    });
    // Not published, or not a list
    expect(drives(undefined).backed).toBeUndefined();
    expect(drives("x").shown).toHaveLength(4);
    const h = makeHass();
    expect(
      backed_up_pumps(h, { roles: {}, pumps: [], redsea_icons: false }),
    ).toBeNull();
    expect(
      backed_up_pumps({} as any, resolve_backup_topology(h, [EB])),
    ).toBeNull();
  });
});

//----------------------------------------------------------------------------//
//   Flow configuration
//----------------------------------------------------------------------------//

describe("energy backup power flow", () => {
  const device = { id: EB, name: "Reef Battery Backup" };
  const flow_of = (o: Scenario = {}, selection: string[] = []) => {
    const hass = makeHass(o);
    return build_power_flow(
      hass,
      device,
      resolve_backup_topology(hass, [EB]),
      selection,
    );
  };

  it("builds nothing without the battery power sensor", () => {
    const hass = makeHass();
    const flow = build_power_flow(hass, device, {
      roles: {},
      pumps: [],
      redsea_icons: false,
    });
    expect(flow).toEqual({
      config: null,
      states: {},
      aliases: {},
      watched: [],
    });
  });

  it("feeds the battery, the aquarium and the mains nodes", () => {
    const flow = flow_of();
    const e = flow.config!["entities"];
    expect(flow.config!["type"]).toBe("custom:power-flow-card-plus");
    expect(flow.config!["title"]).toBe("Reef Battery Backup");
    // Positive while discharging on both sides: no inversion
    expect(e.battery.entity).toBe(P + "puissance");
    expect(e.battery.invert_state).toBeUndefined();
    expect(e.battery.state_of_charge).toBe(P + "soc_batterie");
    expect(e.home.entity).toBe(P + "energie_consommee");
    expect(e.home.secondary_info).toMatchObject({
      entity: P + "autonomie",
      unit_of_measurement: "h",
    });
    // A power, not the charger voltage
    expect(e.grid.entity).toBe(P + "puissance_chargeur");
    expect(e.grid.display_state).toBe("one_way");
    expect(e.grid.power_outage).toMatchObject({
      entity: P + "etat_secteur",
      state_alert: "battery",
    });
    // No outage: its duration is not shown
    expect(e.grid.secondary_info).toBeUndefined();
    expect(flow.watched).toContain(P + "etat_secteur");
  });

  it("shows how long an outage has lasted", () => {
    const e = flow_of({ power_state: "battery" }).config!["entities"];
    expect(e.grid.secondary_info).toMatchObject({
      entity: P + "duree_coupure",
      unit_of_measurement: "min",
    });
  });

  it("leaves out a secondary line that has no value", () => {
    expect(
      flow_of({ runtime: "None" }).config!["entities"].home.secondary_info,
    ).toBeUndefined();
    expect(
      flow_of({ runtime: " " }).config!["entities"].home.secondary_info,
    ).toBeUndefined();
  });

  it("stands in for the mains power without a charger", () => {
    const flow = flow_of({ no_charger: true });
    const grid = flow.config!["entities"].grid;
    expect(grid.entity).toBe("sensor.reef_card_flow_eb1_grid");
    expect(grid.display_state).toBe("one_way_no_zero");
    expect(flow.states[grid.entity]).toMatchObject({
      state: "0",
      attributes: { unit_of_measurement: "W" },
    });
    expect(flow.aliases[grid.entity]).toBe(P + "etat_secteur");
  });

  it("draws no mains node without a charger nor a mains state", () => {
    const e = flow_of({ no_charger: true, no_power_state: true }).config![
      "entities"
    ];
    expect(e.grid).toBeUndefined();
  });

  it("draws the mains node of a charger without a mains state", () => {
    const grid = flow_of({ no_power_state: true }).config!["entities"].grid;
    expect(grid.entity).toBe(P + "puissance_chargeur");
    expect(grid.power_outage).toBeUndefined();
  });

  it("works without the optional sensors", () => {
    const hass = makeHass();
    const flow = build_power_flow(hass, device, {
      roles: { battery_power: P + "puissance" },
      pumps: [],
      redsea_icons: false,
    });
    const e = flow.config!["entities"];
    expect(e.battery.state_of_charge).toBeUndefined();
    expect(e.home.entity).toBeUndefined();
    expect(e.individual).toBeUndefined();
  });

  it("adds a node per pump, fed by a virtual speed", () => {
    const flow = flow_of();
    const nodes = flow.config!["entities"].individual;
    expect(nodes.map((n: any) => n.name)).toEqual([
      "Wave A",
      "Wave B",
      "Return 12000",
      "Run pump 2",
    ]);
    const gyre = nodes[1];
    expect(gyre.entity).toBe("sensor.reef_card_flow_w1_speed");
    expect(gyre.icon).toBe("redsea:gyre-med");
    expect(gyre.secondary_info.template).toContain("sensor.w1_f");
    expect(flow.states[gyre.entity]).toMatchObject({
      state: "60",
      attributes: { unit_of_measurement: "%", friendly_name: "Wave B" },
    });
    // A click opens the real entity
    expect(flow.aliases[gyre.entity]).toBe("sensor.w1_f");
    expect(nodes[2].secondary_info).toBeUndefined();
    expect(nodes[2].icon).toBe("redsea:pump-on");
    expect(flow.watched).toEqual(
      expect.arrayContaining([
        "sensor.w1_b",
        "switch.w1_state",
        "sensor.p1_type",
      ]),
    );
  });

  it("keeps to the picked pumps", () => {
    const nodes = flow_of({}, ["p1"]).config!["entities"].individual;
    expect(nodes).toHaveLength(1);
    expect(nodes[0].entity).toBe("sensor.reef_card_flow_p1_speed");
  });
});

//----------------------------------------------------------------------------//
//   View
//----------------------------------------------------------------------------//

describe("energy backup view", () => {
  it("stores its options under the model of the mapping", () => {
    const view = makeView(makeHass());
    expect(view.config_model()).toBe(ENERGY_BACKUP_MODEL);
    expect(view.config_device_key()).toBe("reef_battery");
  });

  it("does not index its entities by translation key", () => {
    const view = makeView(makeHass());
    view._populate_entities();
    expect(view.entities).toEqual({});
  });

  it("shows where to get Power Flow Card Plus when it is missing", async () => {
    installFlowCard(false);
    let defined: () => void = () => {};
    const when = vi
      .spyOn(customElements, "whenDefined")
      .mockReturnValue(new Promise<any>((r) => (defined = () => r(null))));
    const view = makeView(makeHass());
    await mount(view);

    expect(text(view)).toContain("Power Flow Card Plus is needed");
    const links = [...view.shadowRoot.querySelectorAll("a")].map(
      (a: any) => a.href,
    );
    expect(links).toEqual([POWER_FLOW_CARD_HACS_URL, POWER_FLOW_CARD_URL]);
    expect(view.shadowRoot.querySelector("fake-flow-card")).toBeNull();

    // Still missing on the next states: nothing to draw again, one wait only
    view.hass = makeHass();
    view.requestUpdate();
    await view.updateComplete;
    expect(when).toHaveBeenCalledTimes(1);

    // The card gets defined: the flows replace the panel
    installFlowCard(true);
    defined();
    await Promise.resolve();
    await view.updateComplete;
    expect(view.shadowRoot.querySelector("fake-flow-card")).not.toBeNull();
  });

  it("stays on the install panel without hass", async () => {
    installFlowCard(true);
    vi.spyOn(customElements, "whenDefined").mockReturnValue(
      new Promise<any>(() => {}),
    );
    const view = makeView(makeHass());
    view._hass = null;
    expect(view._sync()).toBe("install");
  });

  it("embeds the flow card with its configuration and virtual states", async () => {
    installFlowCard(true);
    const hass = makeHass();
    const view = makeView(hass);
    await mount(view);

    const card = view.shadowRoot.querySelector("fake-flow-card") as any;
    expect(card).not.toBeNull();
    expect(card.config.entities.battery.entity).toBe(P + "puissance");
    expect(card.config.entities.individual).toHaveLength(4);
    // Real states are still reachable, virtual ones are added
    expect(card.hass.states[P + "puissance"]).toBe(
      hass.states[P + "puissance"],
    );
    expect(card.hass.states["sensor.reef_card_flow_w1_speed"].state).toBe("60");
    expect(hass.states["sensor.reef_card_flow_w1_speed"]).toBeUndefined();
    expect(card.hass.callService).toBe(hass.callService);
    // The maintenance shortcut sits beside it
    expect(view.shadowRoot.querySelector("click-image")).not.toBeNull();
  });

  it("updates the flow card in place when the states change", async () => {
    installFlowCard(true);
    const hass = makeHass();
    const view = makeView(hass);
    await mount(view);
    const card = view.shadowRoot.querySelector("fake-flow-card") as any;
    const set_config = vi.spyOn(card, "setConfig");
    const update = vi.spyOn(view, "requestUpdate");

    // Same state objects: the flow card is left alone
    const first = card.hass;
    view.hass = { ...hass };
    expect(card.hass).toBe(first);

    // A speed changes: new states, same configuration
    const faster = { ...hass, states: { ...hass.states } };
    faster.states["sensor.w1_f"] = { state: "65", attributes: {} };
    view.hass = faster;
    expect(card.hass).not.toBe(first);
    expect(card.hass.states["sensor.reef_card_flow_w1_speed"].state).toBe("65");
    expect(set_config).not.toHaveBeenCalled();

    // An icon changes with the speed: the configuration is given again
    const stopped = { ...hass, states: { ...hass.states } };
    stopped.states["sensor.w1_f"] = { state: "0", attributes: {} };
    view.hass = stopped;
    expect(set_config).toHaveBeenCalledTimes(1);
    expect(card.config.entities.individual[1].icon).toBe("redsea:gyre-off");

    // The view itself was never drawn again
    expect(update).not.toHaveBeenCalled();
    expect(view.shadowRoot.querySelector("fake-flow-card")).toBe(card);
  });

  it("looks the sensors up again when a registry changes", async () => {
    installFlowCard(true);
    const hass = makeHass({ no_charger: true });
    const view = makeView(hass);
    await mount(view);
    const card = view.shadowRoot.querySelector("fake-flow-card") as any;
    expect(card.config.entities.grid.entity).toBe(
      "sensor.reef_card_flow_eb1_grid",
    );
    view.hass = makeHass();
    expect(card.config.entities.grid.entity).toBe(P + "puissance_chargeur");
  });

  it("builds a new flow card when the pumps change", async () => {
    installFlowCard(true);
    const view = makeView(makeHass());
    await mount(view);
    const card = view.shadowRoot.querySelector("fake-flow-card");

    // A wave pump less: other templates, which the card subscribes to once
    const hass = makeHass();
    delete hass.devices.w1;
    view.hass = hass;
    await view.updateComplete;
    const next = view.shadowRoot.querySelector("fake-flow-card") as any;
    expect(next).not.toBe(card);
    expect(next.config.entities.individual).toHaveLength(3);
  });

  it("tells when the battery power sensor is missing, then recovers", async () => {
    installFlowCard(true);
    const empty = makeHass();
    for (const entity_id in empty.entities) {
      if (empty.entities[entity_id].device_id === EB) {
        delete empty.entities[entity_id];
      }
    }
    const view = makeView(empty);
    await mount(view);
    expect(text(view)).toContain("battery power sensor");
    expect(view.shadowRoot.querySelector("fake-flow-card")).toBeNull();

    view.hass = makeHass();
    await view.updateComplete;
    expect(view.shadowRoot.querySelector("fake-flow-card")).not.toBeNull();
  });

  it("shows the message of a flow card refusing its configuration", async () => {
    installFlowCard(true);
    FakeFlowCard.refuse = "bad configuration";
    const hass = makeHass();
    const view = makeView(hass);
    await mount(view);
    expect(text(view)).toContain("bad configuration");
    expect(view.shadowRoot.querySelector("fake-flow-card")).toBeNull();
    // Unchanged states keep the message
    view.hass = { ...hass };
    expect(view._view).toBe("error");
  });

  it("shows a refusal that is not an Error", async () => {
    installFlowCard(true);
    const view = makeView(makeHass());
    vi.spyOn(FakeFlowCard.prototype, "setConfig").mockImplementation(() => {
      throw "plain refusal";
    });
    await mount(view);
    expect(text(view)).toContain("plain refusal");
  });

  it("tells when the device is disabled in Home Assistant", async () => {
    installFlowCard(true);
    const hass = makeHass();
    hass.devices[EB].disabled_by = "user";
    const view = makeView(hass);
    await mount(view);
    expect(view.shadowRoot.querySelector(".eb-panel")).not.toBeNull();
    expect(view.shadowRoot.querySelector("fake-flow-card")).toBeNull();

    // Enabled again: the base class asks for a render
    const enabled = makeHass();
    view.hass = enabled;
    await view.updateComplete;
    expect(view.shadowRoot.querySelector("fake-flow-card")).not.toBeNull();
  });

  it("renders panels of a device without a name", async () => {
    installFlowCard(false);
    vi.spyOn(customElements, "whenDefined").mockReturnValue(
      new Promise<any>(() => {}),
    );
    const view = new EnergyBackup() as any;
    view.device = null;
    view.setConfig({});
    expect(view._device_ids()).toEqual([]);
    await mount(view);
    expect(view.shadowRoot.querySelector(".eb-panel")).not.toBeNull();

    // No device at all is a disabled one: every panel copes without a name
    installFlowCard(true);
    const hass = makeHass();
    const nameless = makeView(hass);
    nameless.device = { elements: [hass.devices[EB], null] };
    await mount(nameless);
    expect(nameless.shadowRoot.querySelector(".eb-panel")).not.toBeNull();
    for (const state of ["install", "no_entity", "error"]) {
      nameless.device = { elements: [{ id: EB, disabled_by: null }] };
      vi.spyOn(nameless, "_sync").mockReturnValue(state);
      nameless.requestUpdate();
      await nameless.updateComplete;
      expect(nameless.shadowRoot.querySelector(".eb-panel")).not.toBeNull();
    }
  });

  it("draws the flows of an installation without any pump", async () => {
    installFlowCard(true);
    const view = makeView(makeHass({ no_redsea: true }));
    await mount(view);
    const card = view.shadowRoot.querySelector("fake-flow-card") as any;
    expect(card.config.entities.individual).toBeUndefined();
  });

  it("finds no sensor for a device without a registry row", () => {
    installFlowCard(true);
    const view = makeView(makeHass());
    view.device = { elements: [] };
    expect(view._sync()).toBe("no_entity");
  });

  it("opens the real entity behind a virtual one", async () => {
    installFlowCard(true);
    const view = makeView(makeHass());
    await mount(view);
    const card = view.shadowRoot.querySelector("fake-flow-card") as any;
    const seen: any[] = [];
    view.addEventListener("hass-more-info", (e: any) => seen.push(e.detail));
    view.addEventListener("hass-action", (e: any) => seen.push(e.detail));

    const fire = (type: string, detail: any) =>
      card.dispatchEvent(
        new CustomEvent(type, { bubbles: true, composed: true, detail }),
      );
    fire("hass-more-info", { entityId: "sensor.reef_card_flow_w1_speed" });
    fire("hass-more-info", { entityId: P + "puissance" });
    fire("hass-action", {
      config: { entity: "sensor.reef_card_flow_p1_speed" },
    });
    fire("hass-action", { config: {} });
    fire("hass-more-info", undefined);

    expect(seen[0].entityId).toBe("sensor.w1_f");
    expect(seen[1].entityId).toBe(P + "puissance");
    expect(seen[2].config.entity).toBe("number.p1_speed");
    expect(seen[3].config.entity).toBeUndefined();
  });
});

//----------------------------------------------------------------------------//
//   Editor
//----------------------------------------------------------------------------//

describe("energy backup editor", () => {
  /** Mount the view in editor mode and collect what it writes. */
  async function mountEditor(hass: any, config: any = {}) {
    const view = makeView(hass, config);
    view.isEditorMode = true;
    const written: any[] = [];
    view.addEventListener("config-changed", (e: any) =>
      written.push(e.detail.config),
    );
    await mount(view);
    const boxes = () =>
      [...view.shadowRoot.querySelectorAll("input[type=checkbox]")] as any[];
    const pumps = () =>
      written[written.length - 1].conf[ENERGY_BACKUP_MODEL].devices.reef_battery
        .pumps;
    return { view, boxes, pumps, written };
  }

  /** Card configuration holding a pump selection. */
  const picked = (pumps: any) => ({
    conf: { [ENERGY_BACKUP_MODEL]: { devices: { reef_battery: { pumps } } } },
  });

  it("ticks the pumps shown without a selection", async () => {
    const { view, boxes } = await mountEditor(makeHass());
    expect(boxes().map((b) => b.checked)).toEqual([true, true, true, true]);
    expect(text(view)).toContain("Nothing picked");
    // Editor mode: the states are not followed
    view.hass = makeHass();
    expect(view._view).toBeNull();
  });

  it("unticking a pump keeps the others", async () => {
    const { boxes, pumps } = await mountEditor(makeHass());
    boxes()[1].checked = false;
    boxes()[1].dispatchEvent(new Event("change"));
    expect(pumps()).toEqual(["w2", "p1", "p2"]);
  });

  it("ticks a pump back and returns to the automatic selection", async () => {
    const { view, boxes, pumps } = await mountEditor(
      makeHass(),
      picked(["p1", 5]),
    );
    expect(boxes().map((b) => b.checked)).toEqual([false, false, true, false]);
    boxes()[0].checked = true;
    boxes()[0].dispatchEvent(new Event("change"));
    expect(pumps()).toEqual(["p1", "w2"]);

    view.shadowRoot.querySelector(".eb-clear").click();
    expect(pumps()).toEqual([]);
  });

  it("locks the other pumps once four are shown", async () => {
    const hass = makeHass({ aquamedic: true });
    const { boxes } = await mountEditor(hass);
    expect(boxes()).toHaveLength(8);
    expect(boxes().filter((b) => b.disabled)).toHaveLength(4);
    expect(boxes().filter((b) => b.checked && !b.disabled)).toHaveLength(4);
  });

  it("ignores a selection that is not a list", async () => {
    const { boxes } = await mountEditor(makeHass(), picked("p1"));
    expect(boxes().map((b) => b.checked)).toEqual([true, true, true, true]);
  });

  it("tells when there is no pump, or no hass", async () => {
    const { view } = await mountEditor(makeHass({ no_redsea: true }));
    expect(text(view)).toContain("No pump found");
    const blind = makeView(makeHass());
    blind.isEditorMode = true;
    blind._hass = null;
    await mount(blind);
    expect(text(blind)).toContain("No pump found");
  });
});
