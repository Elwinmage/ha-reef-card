/**
 * The equipment of the reeftech-catalog and its link to a socket of a power
 * strip (RSPower): reading the catalog, what is drawn for a link, the picker
 * and the exclusivity with a linked device.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RSPower } from "../src/devices/redsea/rspower/rspower";
import {
  CATEGORY_PREFIX,
  GENERIC_EQUIPMENT_ICON,
  cached_equipment,
  equipment_groups,
  equipment_title,
  equipment_view,
  equipment_visual,
  drop_maintenance,
  keep_maintenance,
  list_kept,
  load_equipment,
  localized,
  maintenance_source,
  reset_equipment,
} from "../src/utils/equipment_catalog";
import "../src/devices/index";

const DATA = {
  categories: {
    heater: {
      name: { en: "Heater", fr: "Chauffage" },
      icon: "mdi:thermometer",
      thumb: "/c/heater/thumb.webp",
    },
    fan: { name: { en: "Fan", fr: "Ventilateur" }, icon: "mdi:fan" },
    other: { name: { en: "Other" }, icon: "mdi:help-circle" },
  },
  items: {
    "eheim-200": {
      category: "heater",
      brand: "Eheim",
      model: "thermocontrol 200",
      thumb: "/i/eheim-200/thumb.webp",
      image: "/i/eheim-200/image.webp",
    },
    "jebao-fan": { category: "fan", brand: "Jebao", model: "F1" },
    "acme-x": { category: "heater", brand: "Acme" },
    stray: { brand: "Nobody", model: "Z" },
  },
};
const view = equipment_view({ data: DATA })!;

describe("equipment_view", () => {
  it("reads the answer of the websocket", () => {
    expect(view.items["eheim-200"].brand).toBe("Eheim");
    expect(equipment_view(DATA)).not.toBeNull();
    expect(equipment_view({ data: { items: {} } })).toEqual({
      categories: {},
      items: {},
    });
  });
  it("refuses what is not a catalog", () => {
    for (const bad of [null, {}, { data: {} }, { data: { items: null } }])
      expect(equipment_view(bad)).toBeNull();
  });
});

describe("localized", () => {
  it("picks the language, then its short form, then English", () => {
    const name = { en: "Heater", fr: "Chauffage" };
    expect(localized(name, "fr")).toBe("Chauffage");
    expect(localized(name, "fr-CA")).toBe("Chauffage");
    expect(localized(name, "de")).toBe("Heater");
    expect(localized("plain", "fr")).toBe("plain");
    expect(localized(undefined, "fr", "x")).toBe("x");
    expect(localized({ fr: "seul" }, "")).toBe("");
  });
});

describe("equipment_title", () => {
  it("is the brand and the model, else the id", () => {
    expect(equipment_title(DATA.items["eheim-200"], "eheim-200")).toBe(
      "Eheim thermocontrol 200",
    );
    expect(equipment_title(DATA.items["acme-x"], "acme-x")).toBe("Acme");
    expect(equipment_title({}, "id")).toBe("id");
    expect(equipment_title(undefined, "id")).toBe("id");
  });
});

describe("equipment_groups", () => {
  const groups = equipment_groups(view, "fr", (name) => `Any ${name}`);
  it("lists the categories alphabetically, other last", () => {
    expect(groups.map((g) => g.name)).toEqual([
      "Chauffage",
      "Ventilateur",
      "Other",
    ]);
  });
  it("starts each group with any equipment of it, then the items sorted", () => {
    expect(groups[0].options).toEqual([
      { value: "category:heater", text: "Any Chauffage" },
      { value: "acme-x", text: "Acme" },
      { value: "eheim-200", text: "Eheim thermocontrol 200" },
    ]);
    // An item whose category is unknown is listed under its own group
    expect(groups[2].options.map((o) => o.value)).toEqual([
      "category:other",
      "stray",
    ]);
  });
  it("makes a group for a category nobody uses, and for an unknown one", () => {
    const sparse = equipment_view({
      categories: {},
      items: { a: { category: "mystery", brand: "B" } },
    })!;
    const found = equipment_groups(sparse, "en", (n) => n);
    expect(found[0].name).toBe("mystery");
  });
});

describe("equipment_visual", () => {
  it("draws the picture of an item", () => {
    expect(equipment_visual(view, "eheim-200", "en")).toEqual({
      name: "Eheim thermocontrol 200",
      image: "/i/eheim-200/thumb.webp",
      icon: "mdi:thermometer",
    });
    // No thumbnail: the picture
    const only_image = equipment_view({
      categories: DATA.categories,
      items: { x: { category: "fan", image: "/i.webp" } },
    });
    expect(equipment_visual(only_image, "x", "en")?.image).toBe("/i.webp");
  });
  it("falls back on the picture of the category, then its icon", () => {
    expect(equipment_visual(view, "acme-x", "en")?.image).toBe(
      "/c/heater/thumb.webp",
    );
    expect(equipment_visual(view, "jebao-fan", "en")).toEqual({
      name: "Jebao F1",
      image: null,
      icon: "mdi:fan",
    });
    expect(equipment_visual(view, CATEGORY_PREFIX + "heater", "fr")).toEqual({
      name: "Chauffage",
      image: "/c/heater/thumb.webp",
      icon: "mdi:thermometer",
    });
  });
  it("uses the icon of the other category for an item of an unknown one", () => {
    expect(equipment_visual(view, "stray", "en")?.icon).toBe("mdi:help-circle");
    const no_other = equipment_view({
      categories: { fan: DATA.categories.fan },
      items: { s: { brand: "B" } },
    });
    expect(equipment_visual(no_other, "s", "en")?.icon).toBe(
      GENERIC_EQUIPMENT_ICON,
    );
  });
  it("is null when the link points at nothing", () => {
    expect(equipment_visual(null, "eheim-200", "en")).toBeNull();
    expect(equipment_visual(view, null, "en")).toBeNull();
    expect(equipment_visual(view, "gone", "en")).toBeNull();
    expect(equipment_visual(view, "category:gone", "en")).toBeNull();
  });
});

describe("load_equipment", () => {
  beforeEach(() => reset_equipment());
  afterEach(() => reset_equipment());

  it("asks reef_maintenance once", async () => {
    const callWS = vi.fn().mockResolvedValue({ data: DATA });
    expect(cached_equipment()).toBeNull();
    const [a, b] = await Promise.all([
      load_equipment({ callWS }),
      load_equipment({ callWS }),
    ]);
    expect(a).toBe(b);
    expect(await load_equipment({ callWS })).toBe(a);
    expect(callWS).toHaveBeenCalledTimes(1);
    expect(callWS).toHaveBeenCalledWith({ type: "reef_maintenance/catalog" });
    expect(cached_equipment()).toBe(a);
  });
  it("asks again after a failure", async () => {
    expect(await load_equipment(null)).toBeNull();
    const failing = vi.fn().mockRejectedValue(new Error("unknown command"));
    expect(await load_equipment({ callWS: failing })).toBeNull();
    const callWS = vi.fn().mockResolvedValue({ data: DATA });
    expect(await load_equipment({ callWS })).not.toBeNull();
  });
});

// --- The link on a power strip ----------------------------------------------

class StubPower extends RSPower {}
if (!customElements.get("stub-equipment-power"))
  customElements.define("stub-equipment-power", StubPower);

function strip(sockets: Record<string, any>, ws: any = null): any {
  const dev = new StubPower() as any;
  dev.config = { ...dev.config, model: "RSPOWER6", sockets_nb: 2, sockets };
  dev.user_config = {};
  dev.device = { name: "Power strip", elements: [{ id: "own" }] };
  dev.entities = {};
  dev._sockets = [];
  dev._hass = {
    language: "fr",
    states: {},
    entities: {},
    devices: { "d-led": { id: "d-led", model: "RSPOWER6" } },
    callService: vi.fn(),
    callWS: ws,
  };
  return dev;
}

describe("RSPower linked equipment", () => {
  beforeEach(() => reset_equipment());
  afterEach(() => reset_equipment());

  it("reads the link, a device winning over it", () => {
    const dev = strip({ socket_1: { linked_equipment: "eheim-200" } });
    expect(dev.linked_equipment(1)).toBe("eheim-200");
    expect(dev.linked_equipment(2)).toBeNull();
    dev.config.sockets.socket_1.linked_device = "d-led";
    expect(dev.linked_equipment(1)).toBeNull();
    dev.config.sockets.socket_2 = { linked_equipment: 3 };
    expect(dev.linked_equipment(2)).toBeNull();
  });

  it("draws the picture and the icon once the catalog is there", async () => {
    const ws = vi.fn().mockResolvedValue({ data: DATA });
    const dev = strip({ socket_1: { linked_equipment: "eheim-200" } }, ws);
    // Not loaded yet: nothing drawn, and the catalog is asked for once
    expect(dev.linked_device_image(1)).toBeNull();
    expect(dev.linked_device_icon(1, true)).toBe("mdi:power-plug");
    expect(dev.linked_device_icon(1, false)).toBe("mdi:power-plug-off");
    dev.linked_device_image(1);
    await vi.waitFor(() => expect(cached_equipment()).not.toBeNull());
    expect(ws).toHaveBeenCalledTimes(1);
    expect(dev.linked_device_image(1)).toBe("/i/eheim-200/thumb.webp");
    expect(dev.linked_device_icon(1, true)).toBe("mdi:thermometer");
    // A category alone
    dev.config.sockets.socket_2 = { linked_equipment: "category:fan" };
    expect(dev.linked_device_image(2)).toBeNull();
    expect(dev.linked_device_icon(2, false)).toBe("mdi:fan");
  });

  it("draws again the sockets when the catalog arrives", async () => {
    const ws = vi.fn().mockResolvedValue({ data: DATA });
    const dev = strip({ socket_1: { linked_equipment: "eheim-200" } }, ws);
    const socket = { power_socket: { requestUpdate: vi.fn() } };
    dev._sockets = [{}, socket];
    const update = vi.spyOn(dev, "requestUpdate");
    dev.linked_device_image(1);
    await vi.waitFor(() => expect(update).toHaveBeenCalled());
    expect(socket.power_socket.requestUpdate).toHaveBeenCalled();
  });

  it("does not draw without the integration", async () => {
    const ws = vi.fn().mockRejectedValue(new Error("unknown command"));
    const dev = strip({ socket_1: { linked_equipment: "eheim-200" } }, ws);
    expect(dev.linked_device_image(1)).toBeNull();
    await vi.waitFor(() => expect(ws).toHaveBeenCalled());
    expect(dev.linked_device_image(1)).toBeNull();
    expect(ws).toHaveBeenCalledTimes(1);
    // No hass yet: nothing is asked
    const bare = strip({ socket_1: { linked_equipment: "eheim-200" } });
    bare._hass = null;
    expect(bare.linked_device_image(1)).toBeNull();
  });

  it("offers the catalog in the editor, once it is loaded", async () => {
    const ws = vi.fn().mockResolvedValue({ data: DATA });
    const dev = strip({ socket_2: { linked_equipment: "category:fan" } }, ws);
    const empty = dev._editor_equipment_row(1);
    expect(empty.strings.join("")).toBe("");
    await vi.waitFor(() => expect(cached_equipment()).not.toBeNull());
    const row = dev._editor_equipment_row(2);
    expect(row.strings.join("")).toContain("linked_equipment_");
    expect(JSON.stringify(row.values)).toContain("category:fan");
    // The picker stores the choice
    const handler = row.values.find((v: any) => typeof v === "function");
    const seen: any[] = [];
    dev.addEventListener("config-changed", (e: any) => seen.push(e));
    handler({ target: { value: "jebao-fan" } });
    expect(seen).toHaveLength(1);
  });

  it("stores the link and clears it", () => {
    const dev = strip({});
    const seen: any[] = [];
    dev.addEventListener("config-changed", (e: any) => seen.push(e.detail));
    dev._handle_socket_equipment_change(1, {
      target: { value: "eheim-200" },
    } as any);
    expect(
      seen[0].config.conf.RSPOWER6.devices["Power strip"].sockets.socket_1
        .linked_equipment,
    ).toBe("eheim-200");
    dev.user_config = seen[0].config.conf.RSPOWER6
      ? { RSPOWER6: seen[0].config.conf.RSPOWER6 }
      : {};
    dev._handle_socket_equipment_change(1, { target: { value: "" } } as any);
    const cleared =
      seen[1].config.conf.RSPOWER6.devices["Power strip"].sockets.socket_1;
    expect(cleared?.linked_equipment).toBeUndefined();
  });

  it("ignores the change when the configuration cannot be written", () => {
    const dev = strip({});
    const seen: any[] = [];
    dev.addEventListener("config-changed", (e: any) => seen.push(e));
    vi.spyOn(dev, "_writable_socket_config").mockReturnValue(null);
    dev._handle_socket_equipment_change(1, { target: { value: "x" } } as any);
    expect(seen).toEqual([]);
  });

  it("a device chosen afterwards replaces the equipment", () => {
    const dev = strip({ socket_1: { linked_equipment: "eheim-200" } });
    const target = dev._writable_socket_config(1);
    target.socket_conf.linked_equipment = "eheim-200";
    vi.spyOn(dev, "_writable_socket_config").mockReturnValue(target);
    dev._handle_socket_link_change(1, { target: { value: "d-led" } } as any);
    expect(target.socket_conf.linked_device).toBe("d-led");
    expect(target.socket_conf.linked_equipment).toBeUndefined();
  });
});

// --- Level 2: keep the maintenance of the equipment --------------------------

const KEPT = {
  equipment_id: "eheim_1",
  name: "Heater",
  source: "item:eheim-200",
  model: "Eheim",
  brand: "eheim",
  entry_id: "e",
  tasks: ["visual_inspection", "heater_test"],
};

describe("reef_maintenance equipment commands", () => {
  it("turns a card link into a stored reference", () => {
    expect(maintenance_source("eheim-200")).toBe("item:eheim-200");
    expect(maintenance_source("category:heater")).toBe("category:heater");
  });
  it("lists what is kept, nothing without the integration", async () => {
    const callWS = vi.fn().mockResolvedValue({ equipments: [KEPT] });
    expect(await list_kept({ callWS })).toEqual([KEPT]);
    expect(callWS).toHaveBeenCalledWith({
      type: "reef_maintenance/equipment/list",
    });
    expect(await list_kept(null)).toEqual([]);
    expect(await list_kept({ callWS: async () => ({}) })).toEqual([]);
    expect(
      await list_kept({ callWS: vi.fn().mockRejectedValue(new Error("x")) }),
    ).toEqual([]);
  });
  it("creates an equipment and gives its id", async () => {
    const callWS = vi.fn().mockResolvedValue({ equipment_id: "eheim_1" });
    expect(await keep_maintenance({ callWS }, "eheim-200")).toBe("eheim_1");
    expect(callWS).toHaveBeenCalledWith({
      type: "reef_maintenance/equipment/add",
      source: "item:eheim-200",
    });
    await keep_maintenance({ callWS }, "category:heater", "Heater");
    expect(callWS).toHaveBeenLastCalledWith({
      type: "reef_maintenance/equipment/add",
      source: "category:heater",
      name: "Heater",
    });
  });
  it("gives null when it cannot create it", async () => {
    expect(await keep_maintenance(null, "x")).toBeNull();
    expect(
      await keep_maintenance({ callWS: async () => ({}) }, "x"),
    ).toBeNull();
    const denied = vi.fn().mockRejectedValue(new Error("unauthorized"));
    expect(await keep_maintenance({ callWS: denied }, "x")).toBeNull();
  });
  it("removes an equipment", async () => {
    const callWS = vi.fn().mockResolvedValue({ removed: true });
    expect(await drop_maintenance({ callWS }, "eheim_1")).toBe(true);
    expect(callWS).toHaveBeenCalledWith({
      type: "reef_maintenance/equipment/remove",
      equipment_id: "eheim_1",
    });
    expect(await drop_maintenance(null, "x")).toBe(false);
    expect(
      await drop_maintenance(
        { callWS: vi.fn().mockRejectedValue(new Error("x")) },
        "x",
      ),
    ).toBe(false);
  });
});

describe("RSPower keeps the maintenance of a linked equipment", () => {
  beforeEach(() => reset_equipment());
  afterEach(() => reset_equipment());

  /** hass answering the catalog and the equipment commands */
  function wsFor(kept: any[] = []) {
    return vi.fn(async (msg: any) => {
      if (msg.type === "reef_maintenance/catalog") return { data: DATA };
      if (msg.type === "reef_maintenance/equipment/list")
        return { equipments: kept };
      if (msg.type === "reef_maintenance/equipment/add")
        return { equipment_id: "eheim_1" };
      if (msg.type === "reef_maintenance/equipment/remove")
        return { removed: true };
      throw new Error("unknown " + msg.type);
    });
  }

  async function ready(dev: any) {
    dev._equipment();
    await vi.waitFor(() => expect(cached_equipment()).not.toBeNull());
  }

  const text = (t: any): string => JSON.stringify([t.strings, t.values]);

  it("reads the id of what is kept", () => {
    const dev = strip({ socket_1: { linked_maintenance: "eheim_1" } });
    expect(dev.linked_maintenance(1)).toBe("eheim_1");
    expect(dev.linked_maintenance(2)).toBeNull();
  });

  it("offers to keep it, then shows what is kept", async () => {
    const ws = wsFor([KEPT]);
    const dev = strip({ socket_1: { linked_equipment: "eheim-200" } }, ws);
    await ready(dev);
    const row = dev._editor_equipment_row(1);
    // The integration is asked what it keeps, once
    await vi.waitFor(() =>
      expect(ws).toHaveBeenCalledWith({
        type: "reef_maintenance/equipment/list",
      }),
    );
    expect(text(row)).toContain("maintenance_link");
    expect(text(dev._maintenance_controls(1))).not.toContain(
      "maintenance_kept",
    );
    // Once created, the socket points at it and the controls say so
    dev.config.sockets.socket_1.linked_maintenance = "eheim_1";
    await vi.waitFor(() => expect(dev._kept).toHaveLength(1));
    const controls = text(dev._maintenance_controls(1));
    expect(controls).toContain("2 maintenance tasks kept");
    // The buttons call the handlers
    const click = (t: any) =>
      t.values.find((v: any) => typeof v === "function");
    const stop = vi.spyOn(dev, "_handle_stop_maintenance").mockResolvedValue();
    click(dev._maintenance_controls(1))();
    expect(stop).toHaveBeenCalledWith(1, "eheim_1");
    delete dev.config.sockets.socket_1.linked_maintenance;
    const keep = vi.spyOn(dev, "_handle_keep_maintenance").mockResolvedValue();
    click(dev._maintenance_controls(1))();
    expect(keep).toHaveBeenCalledWith(1);
    dev.config.sockets.socket_1.linked_maintenance = "eheim_1";
    // A socket with nothing linked has no controls
    expect(text(dev._editor_equipment_row(2))).not.toContain(
      "maintenance_link",
    );
    expect(
      ws.mock.calls.filter((c) => c[0].type.endsWith("/list")),
    ).toHaveLength(1);
  });

  it("creates the equipment and records its id in the card", async () => {
    const ws = wsFor();
    const dev = strip({ socket_1: { linked_equipment: "eheim-200" } }, ws);
    await ready(dev);
    const seen: any[] = [];
    dev.addEventListener("config-changed", (e: any) => seen.push(e.detail));
    await dev._handle_keep_maintenance(1);
    expect(ws).toHaveBeenCalledWith({
      type: "reef_maintenance/equipment/add",
      source: "item:eheim-200",
    });
    expect(
      seen[0].config.conf.RSPOWER6.devices["Power strip"].sockets.socket_1
        .linked_maintenance,
    ).toBe("eheim_1");
  });

  it("changes nothing when it cannot create it", async () => {
    const ws = vi.fn(async (msg: any) => {
      if (msg.type === "reef_maintenance/catalog") return { data: DATA };
      throw new Error("unauthorized");
    });
    const dev = strip({ socket_1: { linked_equipment: "eheim-200" } }, ws);
    await ready(dev);
    const seen: any[] = [];
    dev.addEventListener("config-changed", (e: any) => seen.push(e));
    await dev._handle_keep_maintenance(1);
    // Nothing linked: nothing to create either
    await dev._handle_keep_maintenance(2);
    expect(seen).toEqual([]);
    // The configuration cannot be written: the equipment exists, the id is lost
    const good = strip(
      { socket_1: { linked_equipment: "eheim-200" } },
      wsFor(),
    );
    await ready(good);
    vi.spyOn(good, "_writable_socket_config").mockReturnValue(null);
    await good._handle_keep_maintenance(1);
    expect(good.linked_maintenance(1)).toBeNull();
  });

  it("stops keeping it and forgets the id", async () => {
    const ws = wsFor([KEPT]);
    const dev = strip(
      {
        socket_1: {
          linked_equipment: "eheim-200",
          linked_maintenance: "eheim_1",
        },
      },
      ws,
    );
    const seen: any[] = [];
    dev.addEventListener("config-changed", (e: any) => seen.push(e.detail));
    await dev._handle_stop_maintenance(1, "eheim_1");
    expect(ws).toHaveBeenCalledWith({
      type: "reef_maintenance/equipment/remove",
      equipment_id: "eheim_1",
    });
    const socket =
      seen[0].config.conf.RSPOWER6.devices["Power strip"].sockets.socket_1;
    expect(socket.linked_maintenance).toBeUndefined();
    vi.spyOn(dev, "_writable_socket_config").mockReturnValue(null);
    await dev._handle_stop_maintenance(1, "eheim_1");
    expect(seen).toHaveLength(1);
  });

  it("forgets the kept id when the link changes", () => {
    const dev = strip({
      socket_1: {
        linked_equipment: "eheim-200",
        linked_maintenance: "eheim_1",
      },
    });
    const target = dev._writable_socket_config(1);
    vi.spyOn(dev, "_writable_socket_config").mockReturnValue(target);
    dev._handle_socket_equipment_change(1, {
      target: { value: "category:fan" },
    } as any);
    expect(target.socket_conf.linked_equipment).toBe("category:fan");
    expect(target.socket_conf.linked_maintenance).toBeUndefined();
    target.socket_conf.linked_maintenance = "eheim_1";
    dev._handle_socket_link_change(1, { target: { value: "d-led" } } as any);
    expect(target.socket_conf.linked_maintenance).toBeUndefined();
  });
});
