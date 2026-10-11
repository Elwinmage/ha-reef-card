import { describe, expect, it } from "vitest";
import {
  aquarium_place,
  build_tree,
  default_element_type,
  device_domain,
  floor_icon,
  tree_empty,
  type Tree,
} from "../src/aquarium/tree";

const hass: any = {
  floors: {
    up: { floor_id: "up", name: "Upstairs", level: 1 },
    ground: { floor_id: "ground", name: "Ground floor", level: 0 },
  },
  areas: {
    utility: { area_id: "utility", name: "Utility room", floor_id: "ground" },
    living: {
      area_id: "living",
      name: "Living room",
      floor_id: "ground",
      icon: "mdi:sofa",
    },
    office: { area_id: "office", name: "Office", floor_id: "up" },
    garage: { area_id: "garage", name: "Garage" },
    lost: { area_id: "lost", name: "Lost", floor_id: "gone" },
  },
  devices: {
    led: {
      id: "led",
      name: "RSLED-1",
      model: "RSLED160",
      identifiers: [["redsea", "hw1"]],
      area_id: "utility",
    },
    led2: {
      id: "led2",
      name: "RSLED-2",
      name_by_user: "Left lamp",
      identifiers: [["redsea", "hw2"]],
      area_id: "utility",
    },
    run: {
      id: "run",
      name: "RSRUN",
      identifiers: [["redsea", "hw3"]],
      area_id: "living",
    },
    pump: {
      id: "pump",
      name: "Return pump",
      identifiers: [["redsea", "hw3_pump_1"]],
      via_device_id: "run",
      area_id: "utility",
    },
    dc: {
      id: "dc",
      name: "DC Runner #1",
      identifiers: [["aquamedic", "x"]],
      area_id: "garage",
    },
    heater: {
      id: "heater",
      name: "Heater",
      identifiers: [["shelly", "y"]],
      area_id: "office",
    },
    weird: { id: "weird", name: "No ident", area_id: "unknown_area" },
    tank: {
      id: "tank",
      name: "Reefer",
      identifiers: [["reeftank", "a1b2"]],
      area_id: "living",
    },
  },
  entities: {
    "light.led_blue": { device_id: "led" },
    "sensor.led_white": { device_id: "led", name: "White" },
    "sensor.pump_speed": { device_id: "pump" },
    "sensor.dc_speed": { device_id: "dc" },
    "switch.heater": { device_id: "heater" },
    "sensor.hidden": { device_id: "heater", hidden: true },
    "sun.sun": {},
    "input_boolean.vacation": { area_id: "utility" },
    "sensor.ghost_dev": { device_id: "missing" },
  },
  states: { "light.led_blue": { attributes: { friendly_name: "LED blue" } } },
};

/** Flat "floor/area/device" paths of a tree. */
function paths(tree: Tree): string[] {
  const out: string[] = [];
  const areas = (prefix: string, list: Tree["areas"]) =>
    list.forEach((a) => {
      a.devices.forEach((d) => out.push(`${prefix}${a.name || "-"}/${d.id}`));
      a.entities.forEach((e) =>
        out.push(`${prefix}${a.name || "-"}/${e.entity_id}`),
      );
    });
  tree.floors.forEach((f) => areas(`${f.name}/`, f.areas));
  areas("", tree.areas);
  if (tree.unassigned) areas("", [tree.unassigned]);
  return out;
}

describe("device tree", () => {
  it("groups by floor and area, nests sub-devices", () => {
    const tree = build_tree(hass);
    expect(tree.floors.map((f) => f.name)).toEqual([
      "Ground floor",
      "Upstairs",
    ]);
    expect(tree.floors[0].areas.map((a) => a.name)).toEqual([
      "Living room",
      "Utility room",
    ]);
    expect(tree.floors[0].areas[0].icon).toBe("mdi:sofa");
    expect(paths(tree)).toEqual([
      "Ground floor/Living room/tank",
      "Ground floor/Living room/run",
      "Ground floor/Utility room/led2",
      "Ground floor/Utility room/led",
      "Ground floor/Utility room/input_boolean.vacation",
      "Upstairs/Office/heater",
      "Garage/dc",
      "-/weird",
      "-/sensor.ghost_dev",
      "-/sun.sun",
    ]);
    const run = tree.floors[0].areas[0].devices[1];
    // the pump follows its parent
    expect(run.children.map((c) => c.name)).toEqual(["Return pump"]);
    const led = tree.floors[0].areas[1].devices[1];
    expect(led.entities).toEqual([
      { entity_id: "light.led_blue", name: "LED blue" },
      { entity_id: "sensor.led_white", name: "White" },
    ]);
    // an area whose floor is gone stands alone; empty areas are dropped
    expect(tree.areas.map((a) => a.name)).toEqual(["Garage"]);
    expect(tree_empty(tree)).toBe(false);
  });

  it("limits to the aquarium's area plus linked devices", () => {
    const tree = build_tree(hass, {
      scope: { areas: new Set(["utility"]), devices: new Set(["dc", "pump"]) },
    });
    expect(paths(tree)).toEqual([
      "Ground floor/Living room/run",
      "Ground floor/Utility room/led2",
      "Ground floor/Utility room/led",
      "Ground floor/Utility room/input_boolean.vacation",
      "Garage/dc",
    ]);
    expect(
      paths(build_tree(hass, { scope: { areas: new Set(["garage"]) } })),
    ).toEqual(["Garage/dc"]);
  });

  it("searches names, entities and areas", () => {
    expect(paths(build_tree(hass, { search: "pump" }))).toEqual([
      "Ground floor/Living room/run",
    ]);
    expect(paths(build_tree(hass, { search: "runner" }))).toEqual([
      "Garage/dc",
    ]);
    expect(paths(build_tree(hass, { search: "sun" }))).toEqual(["-/sun.sun"]);
    expect(paths(build_tree(hass, { search: "rsled160" }))).toEqual([
      "Ground floor/Utility room/led",
    ]);
    // an area name brings all its content
    expect(paths(build_tree(hass, { search: "office" }))).toEqual([
      "Upstairs/Office/heater",
    ]);
    expect(paths(build_tree(hass, { search: "vacation" }))).toEqual([
      "Ground floor/Utility room/input_boolean.vacation",
    ]);
    expect(tree_empty(build_tree(hass, { search: "zzz" }))).toBe(true);
    expect(tree_empty(build_tree({} as any))).toBe(true);
  });

  it("finds where the aquarium stands", () => {
    expect(aquarium_place(hass, "a1b2")).toEqual({
      area_id: "living",
      floor_id: "ground",
    });
    // without its own device: the area of most linked devices
    expect(aquarium_place(hass, "other", ["led", "led2", "run"])).toEqual({
      area_id: "utility",
      floor_id: "ground",
    });
    expect(aquarium_place(hass, null, ["dc"])).toEqual({
      area_id: "garage",
      floor_id: null,
    });
    expect(aquarium_place(hass, "other", ["ghost"])).toBeNull();
    expect(aquarium_place({} as any, "a1b2")).toBeNull();
  });

  it("picks floor icons", () => {
    expect(floor_icon({ icon: "mdi:stairs", level: 0 })).toBe("mdi:stairs");
    expect(floor_icon({ level: 2 })).toBe("mdi:home-floor-2");
    expect(floor_icon({ level: -1 })).toBe("mdi:home-floor-negative-1");
    expect(floor_icon({ level: 7 })).toBe("mdi:home");
    expect(floor_icon({ level: null })).toBe("mdi:home");
  });

  it("picks element types and domains", () => {
    expect(default_element_type("switch.x")).toBe("common-switch");
    expect(default_element_type("light.x")).toBe("common-switch");
    expect(default_element_type("sensor.x")).toBe("common-sensor");
    expect(device_domain({ identifiers: [["redsea", "a"]] })).toBe("redsea");
    expect(device_domain({})).toBe("");
  });
});
