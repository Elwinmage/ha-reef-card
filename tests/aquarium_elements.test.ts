import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/devices/index";
import "../src/base/index";
import DeviceList from "../src/utils/common";
import {
  create_entity_element,
  device_name,
  device_selector,
  device_thumbnail,
  entity_element_config,
  find_device_info,
  host_device,
  open_device_page,
  reset_thumbnails,
} from "../src/aquarium/elements";

afterEach(() => reset_thumbnails());

const hass: any = {
  states: {
    "sensor.temp": {
      entity_id: "sensor.temp",
      state: "25.4",
      attributes: { unit_of_measurement: "°C" },
    },
  },
  entities: {},
  devices: {
    dose: {
      id: "dose",
      name: "RSDOSE4",
      model: "RSDOSE4",
      identifiers: [["redsea", "hwdose"]],
      primary_config_entry: "entry1",
      disabled_by: null,
    },
    shelly: {
      id: "shelly",
      name: "Heater",
      name_by_user: "My heater",
      identifiers: [["shelly", "x"]],
    },
  },
  callService: vi.fn(),
  language: "en",
};

describe("entity elements", () => {
  it("configures sensors, switches and buttons", () => {
    expect(entity_element_config("sensor.temp")).toMatchObject({
      type: "common-sensor",
      name: "sensor.temp",
    });
    const sw = entity_element_config("switch.heater", undefined, "Heater");
    expect(sw).toMatchObject({
      type: "common-switch",
      style: "switch",
      label: "Heater",
    });
    expect((sw.tap_action as any).action).toBe("toggle");
    const btn = entity_element_config("button.feed");
    expect((btn.tap_action as any).domain).toBe("button");
    expect(btn.icon).toBe(true);
    expect(entity_element_config("binary_sensor.leak").translate_values).toBe(
      true,
    );
    expect(
      entity_element_config("sensor.temp", "common-sensor", "T").prefix,
    ).toBe('"T "');
  });

  it("builds a host device", () => {
    const host = host_device(["sensor.temp"]);
    expect(host.entities["sensor.temp"]).toEqual({ entity_id: "sensor.temp" });
    expect(host.is_on()).toBe(true);
    expect(host.is_missing()).toBe(false);
    expect(host.requestUpdate()).toBeUndefined();
  });

  it("creates the card element", () => {
    const el: any = create_entity_element(hass, {
      id: "e",
      kind: "entity",
      entity_id: "sensor.temp",
      pos: [0, 0],
      scale: 1,
      label: "",
      roles: [],
    });
    expect(el).not.toBeNull();
    expect(el.stateObj.state).toBe("25.4");
    expect(
      create_entity_element(hass, {
        id: "e",
        kind: "entity",
        pos: [0, 0],
        scale: 1,
        label: "",
        roles: [],
      }),
    ).toBeNull();
    expect(
      create_entity_element(hass, {
        id: "e",
        kind: "entity",
        entity_id: "sensor.temp",
        type: "no-such-element",
        pos: [0, 0],
        scale: 1,
        label: "",
        roles: [],
      }),
    ).toBeNull();
  });
});

describe("devices", () => {
  const list = new DeviceList(hass);

  it("finds the card device of a hass device", () => {
    expect(find_device_info(list, "dose")?.name).toBe("RSDOSE4");
    expect(find_device_info(list, "shelly")).toBeNull();
    expect(find_device_info(null, "dose")).toBeNull();
    expect(device_selector(list, "dose")).toBe("hwdose");
    expect(device_selector(list, "shelly")).toBeNull();
  });

  it("gets a thumbnail from the device view, cached", () => {
    const url = device_thumbnail(hass, list, "dose");
    expect(url).toMatch(/RSDOSE4\.png/);
    expect(device_thumbnail(hass, list, "dose")).toBe(url);
    expect(device_thumbnail(hass, list, "shelly")).toBeNull();
  });

  it("names devices and opens their page", () => {
    expect(device_name(hass, "shelly")).toBe("My heater");
    expect(device_name(hass, "dose")).toBe("RSDOSE4");
    expect(device_name(hass, "ghost")).toBe("ghost");
    expect(device_name(hass, undefined)).toBe("");
    const listener = vi.fn();
    window.addEventListener("location-changed", listener);
    open_device_page("shelly");
    expect(location.pathname).toBe("/config/devices/device/shelly");
    expect(listener).toHaveBeenCalled();
  });
});
