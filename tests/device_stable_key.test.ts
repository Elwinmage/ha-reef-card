// Tests for the stable device key: the card configuration is stored under
// the id the integration registers a device with (its hardware id), not its
// display name, so renaming a device in Home Assistant keeps its options.

import { describe, expect, it } from "vitest";

import DeviceList, { find_main_device } from "../src/utils/common";
import { RSDevice } from "../src/devices/device";
import { RSDose4 } from "../src/devices/redsea/rsdose/rsdose";
import { RSPower6 } from "../src/devices/redsea/rspower/rspower";
import { ReefCardEditor } from "../src/editor";

class KeyDevice extends RSDevice {}
if (!customElements.get("stub-key-device"))
  customElements.define("stub-key-device", KeyDevice);
class KeyDose extends RSDose4 {}
if (!customElements.get("stub-key-dose"))
  customElements.define("stub-key-dose", KeyDose);
class KeyPower extends RSPower6 {}
if (!customElements.get("stub-key-power"))
  customElements.define("stub-key-power", KeyPower);
if (!customElements.get("stub-key-editor"))
  customElements.define("stub-key-editor", class extends ReefCardEditor {});

// ── Fixtures ─────────────────────────────────────────────────────────────────

const HWID = "3974704013";

function hassDevice(
  id: string,
  identifier: string,
  name: string,
  entry: string,
  domain = "redsea",
): any {
  return {
    id,
    identifiers: [[domain, identifier]],
    primary_config_entry: entry,
    name,
    model: "RSDOSE4",
    disabled_by: null,
  };
}

/** A card device as DeviceList builds it. */
function deviceInfo(name: string, uid?: string): any {
  return {
    name,
    key: "entry_1",
    uid,
    elements: [{ id: "dev_1", model: "RSDOSE4", disabled_by: null }],
  };
}

function makeDevice(Cls: any, name: string, uid?: string, config: any = {}) {
  const dev = new Cls() as any;
  dev.device = deviceInfo(name, uid);
  dev.user_config = config;
  return dev;
}

/** Configuration sent by the next config-changed event of a device. */
function captured(dev: any, action: () => void): any {
  let config: any = null;
  dev.addEventListener("config-changed", (e: any) => {
    config = e.detail.config;
  });
  action();
  return config;
}

// ── Device list ──────────────────────────────────────────────────────────────

describe("DeviceList stable id", () => {
  it("gives a main device the id its integration registers it under", () => {
    const list = new DeviceList({
      devices: { a: hassDevice("a", HWID, "Doser", "entry_1") },
    } as any);
    expect(list.main_devices).toEqual([
      { value: "entry_1", text: "Doser", uid: HWID },
    ]);
    expect(list.devices.entry_1.uid).toBe(HWID);
  });

  it("takes it from the main device, wherever its sub-devices come", () => {
    const head = hassDevice("h", HWID + "_head_1", "Doser Head 1", "entry_1");
    const main = hassDevice("a", HWID, "Doser", "entry_1");
    // Sub-device listed first: the group starts without a stable id
    const sub_first = new DeviceList({ devices: { h: head, a: main } } as any);
    expect(sub_first.devices.entry_1.uid).toBe(HWID);
    // Main device listed first: the sub-device must not replace it
    const main_first = new DeviceList({ devices: { a: main, h: head } } as any);
    expect(main_first.devices.entry_1.uid).toBe(HWID);
    expect(main_first.main_devices).toHaveLength(1);
  });

  it("uses the device id of an ungrouped domain", () => {
    const list = new DeviceList({
      devices: {
        p: {
          ...hassDevice("p", "did-42", "Drift", "account", "aquamedic"),
          model: "SmartDrift",
        },
      },
    } as any);
    expect(list.devices.p.uid).toBe("did-42");
    expect(list.main_devices[0].uid).toBe("did-42");
  });

  it("resolves a `device` option to its hass device", () => {
    const list = new DeviceList({
      devices: { a: hassDevice("a", HWID, "Doser", "entry_1") },
    } as any);
    expect(list.find_main_device(HWID)?.value).toBe("entry_1");
    expect(list.get_by_selector(HWID)?.name).toBe("Doser");
    expect(list.get_by_selector("Doser")?.uid).toBe(HWID);
    expect(list.get_by_selector("entry_1")?.uid).toBe(HWID);
    expect(list.get_by_selector("Ghost")).toBeUndefined();
  });
});

describe("find_main_device", () => {
  const devices = [
    { value: "entry_1", text: "Doser", uid: HWID },
    // Renamed after the first one's stable id, and after its selector key
    { value: "entry_2", text: HWID, uid: "111" },
    { value: "entry_3", text: "entry_1", uid: "222" },
    { value: "entry_4", text: "Old style" },
  ];

  it("matches the stable id, the selector key or the name", () => {
    expect(find_main_device(devices, "111")?.value).toBe("entry_2");
    expect(find_main_device(devices, "entry_4")?.value).toBe("entry_4");
    expect(find_main_device(devices, "Old style")?.value).toBe("entry_4");
  });

  it("prefers the stable id, then the key, over a name", () => {
    expect(find_main_device(devices, HWID)?.value).toBe("entry_1");
    expect(find_main_device(devices, "entry_1")?.value).toBe("entry_1");
  });

  it("finds nothing for an unknown or unusable selector", () => {
    expect(find_main_device(devices, "Ghost")).toBeUndefined();
    expect(find_main_device(devices, "")).toBeUndefined();
    expect(find_main_device(devices, undefined)).toBeUndefined();
    expect(find_main_device(devices, 42)).toBeUndefined();
    expect(find_main_device(null, "Doser")).toBeUndefined();
    expect(find_main_device(undefined, "Doser")).toBeUndefined();
  });
});

// ── Reading ──────────────────────────────────────────────────────────────────

describe("RSDevice configuration key", () => {
  it("is the stable id, the name without one, nothing without a device", () => {
    expect(makeDevice(KeyDevice, "Doser", HWID).config_device_key()).toBe(HWID);
    expect(makeDevice(KeyDevice, "Doser").config_device_key()).toBe("Doser");
    const dev = makeDevice(KeyDevice, "Doser");
    dev.device = null;
    expect(dev.config_device_key()).toBe("");
    dev.device = { name: "", elements: [] };
    expect(dev.config_device_key()).toBe("");
  });
});

describe("RSDevice.update_config with a stable key", () => {
  function read(name: string, uid: string | undefined, devices: any): any {
    const dev = makeDevice(KeyDevice, name, uid, {
      conf: { RSDOSE4: { devices } },
    });
    dev.initial_config = { model: "RSDOSE4", name: null, elements: {} };
    dev.update_config();
    return dev.config;
  }

  it("reads the options stored under the stable id", () => {
    const config = read("Doser", HWID, { [HWID]: { compact: true } });
    expect(config.compact).toBe(true);
  });

  it("keeps them once the device is renamed", () => {
    const devices = { [HWID]: { name: "Doser", compact: true } };
    expect(read("Renamed doser", HWID, devices).compact).toBe(true);
  });

  it("does not take the label of the entry for an option", () => {
    const config = read("Doser", HWID, {
      [HWID]: { name: "Doser", compact: true },
    });
    expect(config.name).toBeNull();
  });

  it("still reads a configuration stored under the name", () => {
    expect(read("Doser", HWID, { Doser: { compact: true } }).compact).toBe(
      true,
    );
    expect(read("Doser", undefined, { Doser: { compact: true } }).compact).toBe(
      true,
    );
  });

  it("prefers the stable id when both are there", () => {
    const config = read("Doser", HWID, {
      Doser: { compact: false },
      [HWID]: { compact: true },
    });
    expect(config.compact).toBe(true);
  });

  it("ignores what is not an entry", () => {
    expect(read("Doser", HWID, { [HWID]: "oops", Doser: 3 }).compact).toBe(
      undefined,
    );
    expect(read("Doser", HWID, {}).compact).toBeUndefined();
    expect(read("Doser", HWID, "oops").compact).toBeUndefined();
    expect(read("Doser", HWID, undefined).compact).toBeUndefined();
    expect(read("", undefined, { "": { compact: true } }).compact).toBe(
      undefined,
    );
  });

  it("ignores the devices map without a device", () => {
    const dev = makeDevice(KeyDevice, "Doser", HWID);
    dev.device = null;
    expect(dev.device_config_entry({ Doser: {} })).toBeNull();
  });
});

// ── Writing ──────────────────────────────────────────────────────────────────

describe("RSDevice.writable_device_config", () => {
  it("writes under the stable id, labelled with the name", () => {
    const dev = makeDevice(KeyDevice, "Doser", HWID, {});
    const config = captured(dev, () => dev.set_config_value("compact", true));
    expect(config.conf.RSDOSE4.devices).toEqual({
      [HWID]: { name: "Doser", compact: true },
    });
  });

  it("moves the options stored under the name to the stable id", () => {
    const dev = makeDevice(KeyDevice, "Doser", HWID, {
      conf: { RSDOSE4: { devices: { Doser: { compact: true } } } },
    });
    const config = captured(dev, () => dev.set_config_value("other", 1));
    expect(config.conf.RSDOSE4.devices).toEqual({
      [HWID]: { name: "Doser", compact: true, other: 1 },
    });
    // The configuration in use is left untouched until the editor saves
    expect(dev.user_config.conf.RSDOSE4.devices.Doser).toEqual({
      compact: true,
    });
  });

  it("keeps the entry of the stable id when both are there", () => {
    const dev = makeDevice(KeyDevice, "Doser", HWID, {
      conf: {
        RSDOSE4: { devices: { Doser: { old: 1 }, [HWID]: { recent: 2 } } },
      },
    });
    const config = captured(dev, () => dev.set_config_value("x", 3));
    expect(config.conf.RSDOSE4.devices).toEqual({
      Doser: { old: 1 },
      [HWID]: { name: "Doser", recent: 2, x: 3 },
    });
  });

  it("refreshes the label after a rename, and leaves other devices alone", () => {
    const dev = makeDevice(KeyDevice, "Renamed doser", HWID, {
      conf: {
        RSDOSE4: {
          devices: {
            [HWID]: { name: "Doser", compact: true },
            Other: { a: 1 },
          },
        },
      },
    });
    const config = captured(dev, () => dev.set_config_value("x", 3));
    expect(config.conf.RSDOSE4.devices).toEqual({
      [HWID]: { name: "Renamed doser", compact: true, x: 3 },
      Other: { a: 1 },
    });
  });

  it("moves a card pinned by name to the stable id", () => {
    const pinned = makeDevice(KeyDevice, "Doser", HWID, { device: "Doser" });
    expect(captured(pinned, () => pinned.set_config_value("x", 1)).device).toBe(
      HWID,
    );
    // A card pinned on something else is not touched
    const other = makeDevice(KeyDevice, "Doser", HWID, { device: "Other" });
    expect(captured(other, () => other.set_config_value("x", 1)).device).toBe(
      "Other",
    );
  });

  it("keeps writing under the name for a device without a stable id", () => {
    const dev = makeDevice(KeyDevice, "Doser", undefined, { device: "Doser" });
    const config = captured(dev, () => dev.set_config_value("compact", true));
    expect(config.conf.RSDOSE4.devices).toEqual({ Doser: { compact: true } });
    expect(config.device).toBe("Doser");
  });

  it("repairs a configuration whose maps are not maps", () => {
    for (const broken of [
      { conf: null },
      { conf: { RSDOSE4: "oops" } },
      { conf: { RSDOSE4: { devices: 3 } } },
      { conf: { RSDOSE4: { devices: { [HWID]: "oops" } } } },
      null,
    ]) {
      const dev = makeDevice(KeyDevice, "Doser", HWID, broken);
      const config = captured(dev, () => dev.set_config_value("x", 1));
      expect(config.conf.RSDOSE4.devices[HWID]).toEqual({
        name: "Doser",
        x: 1,
      });
    }
  });

  it("writes nothing for an unknown device or model", () => {
    const no_device = makeDevice(KeyDevice, "Doser", HWID);
    no_device.device = null;
    expect(no_device.writable_device_config()).toBeNull();
    expect(
      captured(no_device, () => no_device.set_config_value("x", 1)),
    ).toBeNull();
    expect(
      captured(no_device, () =>
        no_device.handleChangedDeviceEvent({
          currentTarget: { checked: true },
          target: { id: "last_message" },
        }),
      ),
    ).toBeNull();

    const no_model = makeDevice(KeyDevice, "Doser", HWID);
    no_model.device.elements = [];
    expect(no_model.writable_device_config()).toBeNull();
  });
});

describe("device editors write under the stable key", () => {
  it("element switches", () => {
    const dev = makeDevice(KeyDevice, "Doser", HWID, {
      conf: {
        RSDOSE4: {
          devices: { Doser: { elements: { last_message: { css: {} } } } },
        },
      },
    });
    const toggle = (id: string, checked: boolean) =>
      captured(dev, () =>
        dev.handleChangedDeviceEvent({
          currentTarget: { checked },
          target: { id },
        }),
      );
    expect(toggle("last_message", true).conf.RSDOSE4.devices).toEqual({
      [HWID]: {
        name: "Doser",
        elements: { last_message: { css: {}, disabled_if: true } },
      },
    });
    expect(
      toggle("last_alert_message", false).conf.RSDOSE4.devices[HWID].elements
        .last_alert_message,
    ).toEqual({ disabled_if: false });
    // An entry without any element yet
    const bare = makeDevice(KeyDevice, "Doser", HWID, {});
    expect(
      captured(bare, () =>
        bare.handleChangedDeviceEvent({
          currentTarget: { checked: true },
          target: { id: "last_message" },
        }),
      ).conf.RSDOSE4.devices[HWID].elements,
    ).toEqual({ last_message: { disabled_if: true } });
  });

  it("ReefDose heads", () => {
    const dev = makeDevice(KeyDose, "Doser", HWID, {
      conf: {
        RSDOSE4: {
          devices: { Doser: { heads: { head_1: { color: "1,2,3" } } } },
        },
      },
    });
    const change = (id: string, value: string) =>
      captured(dev, () =>
        dev.handleChangedEvent({ currentTarget: { value }, target: { id } }),
      );
    expect(change("head_1-shortcut", "Ca").conf.RSDOSE4.devices).toEqual({
      [HWID]: {
        name: "Doser",
        heads: { head_1: { color: "1,2,3", shortcut: "Ca" } },
      },
    });
    expect(
      change("head_2-color", "#ff0000").conf.RSDOSE4.devices[HWID].heads.head_2,
    ).toEqual({ color: "255,0,0" });

    const unknown = makeDevice(KeyDose, "Doser", HWID);
    unknown.device = null;
    expect(
      captured(unknown, () =>
        unknown.handleChangedEvent({
          currentTarget: { value: "Ca" },
          target: { id: "head_1-shortcut" },
        }),
      ),
    ).toBeNull();
  });

  it("ReefDose heads of an entry without any head yet", () => {
    const dev = makeDevice(KeyDose, "Doser", HWID, {});
    const config = captured(dev, () =>
      dev.handleChangedEvent({
        currentTarget: { value: "Mg" },
        target: { id: "head_3-shortcut" },
      }),
    );
    expect(config.conf.RSDOSE4.devices[HWID].heads).toEqual({
      head_3: { shortcut: "Mg" },
    });
  });

  it("ReefControl-Power sockets", () => {
    const dev = makeDevice(KeyPower, "Strip", HWID, {
      conf: {
        RSDOSE4: {
          devices: {
            Strip: { sockets: { socket_1: { linked_device: "d1" } } },
          },
        },
      },
    });
    dev._hass = { states: {}, entities: {}, devices: {} };
    const colour = captured(dev, () =>
      dev._handle_socket_color_change(1, { target: { value: "#00ff00" } }),
    );
    expect(colour.conf.RSDOSE4.devices).toEqual({
      [HWID]: {
        name: "Strip",
        sockets: { socket_1: { linked_device: "d1", color: "0,255,0" } },
      },
    });
    // A link keeps the rest of the entry, a cleared one drops only itself
    const linked = captured(dev, () =>
      dev._handle_socket_link_change(2, { target: { value: "d2" } }),
    );
    expect(linked.conf.RSDOSE4.devices[HWID].sockets).toEqual({
      socket_1: { linked_device: "d1" },
      socket_2: { linked_device: "d2" },
    });
    const cleared = captured(dev, () =>
      dev._handle_socket_link_change(1, { target: { value: "" } }),
    );
    expect(cleared.conf.RSDOSE4.devices[HWID].sockets.socket_1).toEqual({});
  });

  it("ReefControl-Power sockets of an unknown strip", () => {
    const dev = makeDevice(KeyPower, "Strip", HWID);
    dev.device = null;
    expect(
      captured(dev, () =>
        dev._handle_socket_color_change(1, { target: { value: "#00ff00" } }),
      ),
    ).toBeNull();
    expect(
      captured(dev, () =>
        dev._handle_socket_link_change(1, { target: { value: "d2" } }),
      ),
    ).toBeNull();
  });
});

// ── Card editor ──────────────────────────────────────────────────────────────

describe("ReefCardEditor selected device", () => {
  function makeEditor(device: any): any {
    const editor: any = document.createElement("stub-key-editor");
    editor._config = { device };
    editor.select_devices = [
      { value: "unselected", text: "Select" },
      { value: "entry_1", text: "Doser", uid: HWID },
      { value: "entry_2", text: "Strip", uid: "999" },
      { value: "__maintenance__", text: "Maintenance" },
    ];
    return editor;
  }
  const selected = (editor: any) =>
    editor.select_devices
      .filter((option: any) => editor._is_selected(option))
      .map((option: any) => option.value);

  it("is found by its stable id, its name or its selector key", () => {
    expect(selected(makeEditor(HWID))).toEqual(["entry_1"]);
    expect(selected(makeEditor("Doser"))).toEqual(["entry_1"]);
    expect(selected(makeEditor("entry_2"))).toEqual(["entry_2"]);
  });

  it("is the maintenance overview when the card shows it", () => {
    expect(selected(makeEditor("__maintenance__"))).toEqual([
      "__maintenance__",
    ]);
  });

  it("is none for an unknown or missing device", () => {
    expect(selected(makeEditor("Ghost"))).toEqual([]);
    expect(selected(makeEditor(undefined))).toEqual([]);
    const no_config = makeEditor("Doser");
    no_config._config = null;
    expect(selected(no_config)).toEqual([]);
  });
});
