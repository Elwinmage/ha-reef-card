/**
 * Clickable zones opening a device: drawn on the picture in the editor, and
 * opening the device view in the card.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/devices/index";
import "../src/base/index";
import "../src/aquarium/index";
import { open_scene_editor } from "../src/aquarium/editor/scene_editor";
import { ReefTankApi, reset_catalog_cache } from "../src/aquarium/api";
import * as ops from "../src/aquarium/editor/ops";
import { build_tree, tree_devices } from "../src/aquarium/tree";

afterEach(() => {
  reset_catalog_cache();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

const TRIANGLE: [number, number][] = [
  [0.1, 0.1],
  [0.2, 0.1],
  [0.2, 0.2],
];

function make_doc(views: number = 1) {
  let doc = ops.new_document("Reefer");
  doc.id = "a1b2";
  doc.revision = 3;
  let front: string;
  [doc, front] = ops.add_view(doc, "Front");
  let other = "";
  if (views > 1) [doc, other] = ops.add_view(doc, "Cabinet");
  doc = ops.update_view(doc, front, { image: null } as any);
  return { doc, front, other };
}

function make_hass(doc: any, devices: boolean = true) {
  const hass: any = {
    config: { components: ["reeftank"] },
    language: "en",
    states: { "sensor.pump": { state: "1", attributes: {} } },
    entities: devices
      ? {
          "sensor.pump": { device_id: "run" },
          "sensor.doser": { device_id: "dose" },
          "sensor.far": { device_id: "far" },
          "sensor.child": { device_id: "child" },
        }
      : {},
    devices: devices
      ? {
          run: { id: "run", name: "ReefRun", area_id: "room" },
          dose: { id: "dose", name: "ReefDose", area_id: "room" },
          child: {
            id: "child",
            name: "Head",
            area_id: "room",
            via_device_id: "dose",
          },
          far: { id: "far", name: "Alarm", area_id: "hall" },
        }
      : {},
    areas: {
      room: { area_id: "room", name: "Room" },
      hall: { area_id: "hall", name: "Hall" },
    },
    floors: {},
    callService: vi.fn(),
    callWS: vi.fn(async (msg: any) => {
      switch (msg.type) {
        case "reeftank/catalog":
          return { fish: [], corals: [], presets: [] };
        case "reeftank/aquarium/get":
          return { document: structuredClone(doc), entities: {} };
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
  editor._tab = "views";
  await editor.updateComplete;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 1000,
    height: 1000,
    right: 1000,
    bottom: 1000,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
  return editor;
}

const pointer = (type: string, x: number, y: number) =>
  new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    composed: true,
  }) as any;

function stage(editor: any): HTMLElement {
  return editor.renderRoot.querySelector(".stage");
}

async function drag(editor: any, points: [number, number][]) {
  const el = stage(editor);
  const [first, ...rest] = points;
  el.dispatchEvent(pointer("pointerdown", first![0], first![1]));
  for (const [x, y] of rest) el.dispatchEvent(pointer("pointermove", x, y));
  await editor.updateComplete;
  const last = points.at(-1)!;
  el.dispatchEvent(pointer("pointerup", last[0], last[1]));
  await editor.updateComplete;
}

/** Open the Devices tab and start outlining a device from its tree row. */
async function outline(editor: any, name: string, tool?: string) {
  await tab(editor, "elements");
  editor._all_areas = true;
  editor._expanded = new Set(["area:room", "area:hall", "device:dose"]);
  editor.requestUpdate();
  await editor.updateComplete;
  const row = [...editor.renderRoot.querySelectorAll(".tree-row.device")].find(
    (r: any) => r.textContent.includes(name),
  ) as HTMLElement;
  const button = row.querySelector(".add.outline") as HTMLElement;
  // Not the start of a drag of the row
  const dragged = vi.spyOn(editor, "_tree_down");
  button.dispatchEvent(pointer("pointerdown", 0, 0));
  expect(dragged).not.toHaveBeenCalled();
  button.click();
  await editor.updateComplete;
  if (tool) {
    editor._tool = tool;
    await editor.updateComplete;
  }
}

async function tab(editor: any, name: string) {
  const index = ["aquarium", "views", "elements"].indexOf(name);
  editor.renderRoot.querySelectorAll("nav button")[index].click();
  await editor.updateComplete;
}

function button(editor: any, text: string): HTMLElement {
  return [...editor.renderRoot.querySelectorAll("fieldset button")].find(
    (b: any) => b.textContent.includes(text),
  ) as HTMLElement;
}

describe("zone operations", () => {
  it("adds a zone towards a device, without a view", () => {
    const { doc, front } = make_doc();
    const [next, id] = ops.add_hotspot(doc, front, TRIANGLE, "", "run");
    expect(id).not.toBeNull();
    expect(next.views[front]!.hotspots[0]).toMatchObject({
      goto: null,
      device_id: "run",
    });
    expect(ops.add_hotspot(doc, front, TRIANGLE, "")[1]).toBeNull();
  });

  it("keeps device zones when a preset drops dead links", () => {
    const { doc, front } = make_doc();
    const [next] = ops.add_hotspot(doc, front, TRIANGLE, "", "run");
    const preset = {
      id: "p",
      name: "P",
      views: {
        p: { name: "P", hotspots: [{ id: "h", poly: TRIANGLE, goto: "gone" }] },
      },
    };
    const applied = ops.apply_preset(next, preset as any);
    expect(applied.views[front]!.hotspots).toHaveLength(1);
    expect(applied.views.p!.hotspots).toEqual([]);
  });
});

describe("tree_devices", () => {
  it("lists every device by name, sub-devices included", () => {
    const tree = build_tree(make_hass(make_doc().doc));
    expect(tree_devices(tree).map((d) => d.name)).toEqual([
      "Alarm",
      "Head",
      "ReefDose",
      "ReefRun",
    ]);
  });

  it("covers floors and unassigned devices", () => {
    const hass = make_hass(make_doc().doc);
    hass.floors = { f: { floor_id: "f", name: "Floor", level: 0 } };
    hass.areas.room.floor_id = "f";
    hass.devices.run.area_id = null;
    const names = tree_devices(build_tree(hass)).map((d) => d.name);
    expect(names).toContain("ReefRun");
    expect(names).toContain("ReefDose");
  });
});

describe("zones in the editor", () => {
  it("outlines a device from the tree with a rectangle", async () => {
    const { doc, front } = make_doc();
    const editor = await open(make_hass(doc));
    await outline(editor, "ReefRun");
    expect(editor._tool).toBe("hotspot_rect");
    expect(editor.renderRoot.textContent).toContain("ReefRun");
    await drag(editor, [
      [100, 100],
      [300, 400],
    ]);
    const zone = editor.doc.views[front].hotspots[0];
    expect(zone.device_id).toBe("run");
    expect(zone.poly).toEqual([
      [0.1, 0.1],
      [0.3, 0.1],
      [0.3, 0.4],
      [0.1, 0.4],
    ]);
    expect(editor._selection).toEqual({ type: "hotspot", id: zone.id });
    expect(editor._outline_device).toBe("");
    expect(editor._tool).toBe("select");
  });

  it("previews the rectangle while it is drawn", async () => {
    const { doc } = make_doc();
    const editor = await open(make_hass(doc));
    await outline(editor, "ReefRun");
    const el = stage(editor);
    el.dispatchEvent(pointer("pointerdown", 100, 100));
    el.dispatchEvent(pointer("pointermove", 300, 300));
    await editor.updateComplete;
    expect(editor.renderRoot.querySelector("polyline.drawing")).not.toBeNull();
  });

  it("takes a click for a click, not for a zone", async () => {
    const { doc, front } = make_doc();
    const editor = await open(make_hass(doc));
    await outline(editor, "ReefRun");
    await drag(editor, [
      [100, 100],
      [102, 300],
    ]);
    await drag(editor, [
      [100, 100],
      [300, 102],
    ]);
    expect(editor.doc.views[front].hotspots).toEqual([]);
    expect(editor._outline_device).toBe("run");
  });

  it("outlines by hand", async () => {
    const { doc, front } = make_doc();
    const editor = await open(make_hass(doc));
    await outline(editor, "ReefDose", "hotspot_lasso");
    await drag(editor, [
      [100, 100],
      [300, 100],
      [300, 300],
      [100, 300],
    ]);
    const zone = editor.doc.views[front].hotspots[0];
    expect(zone.device_id).toBe("dose");
    expect(zone.poly.length).toBeGreaterThanOrEqual(3);
    expect(editor.doc.views[front].decor).toEqual([]);
  });

  it("ignores a stroke too short for a shape", async () => {
    const { doc, front } = make_doc();
    const editor = await open(make_hass(doc));
    await outline(editor, "ReefRun", "hotspot_lasso");
    await drag(editor, [
      [100, 100],
      [101, 101],
    ]);
    expect(editor.doc.views[front].hotspots).toEqual([]);
  });

  it("outlines with a polygon, closed from the panel", async () => {
    const { doc, front } = make_doc();
    const editor = await open(make_hass(doc));
    await outline(editor, "ReefRun", "hotspot");
    editor._drawing = TRIANGLE;
    await editor.updateComplete;
    button(editor, "Close the shape").click();
    expect(editor.doc.views[front].hotspots[0].device_id).toBe("run");
    expect(editor._drawing).toEqual([]);
  });

  it("cancels an outline, and leaves it with the tab", async () => {
    const { doc } = make_doc();
    const editor = await open(make_hass(doc));
    await outline(editor, "ReefRun");
    button(editor, "Cancel").click();
    expect(editor._outline_device).toBe("");
    expect(editor._tool).toBe("select");

    await outline(editor, "ReefRun");
    await tab(editor, "views");
    expect(editor._outline_device).toBe("");
  });

  it("changes or deletes the zone of a device", async () => {
    const { doc, front } = make_doc();
    const [start, id] = ops.add_hotspot(doc, front, TRIANGLE, "", "run");
    const editor = await open(make_hass(start));
    await tab(editor, "elements");
    editor._selection = { type: "hotspot", id };
    await editor.updateComplete;
    const select = editor.renderRoot.querySelector(
      ".panel fieldset select",
    ) as HTMLSelectElement;
    expect(select.value).toBe("run");
    select.value = "dose";
    select.dispatchEvent(new Event("change"));
    expect(editor.doc.views[front].hotspots[0].device_id).toBe("dose");
    await editor.updateComplete;
    button(editor, "Delete").click();
    expect(editor.doc.views[front].hotspots).toEqual([]);
  });

  it("offers the devices of the aquarium's area first", async () => {
    const { doc, front } = make_doc();
    const [start, id] = ops.add_hotspot(doc, front, TRIANGLE, "", "run");
    const hass = make_hass(start);
    hass.devices.tank = {
      id: "tank",
      name: "Reefer",
      area_id: "room",
      identifiers: [["reeftank", "a1b2"]],
    };
    const editor = await open(hass);
    await tab(editor, "elements");
    editor._selection = { type: "hotspot", id };
    await editor.updateComplete;
    const names = [
      ...editor.renderRoot.querySelectorAll(".panel fieldset option"),
    ].map((o: any) => o.textContent.trim());
    expect(names.at(-1)).toBe("Alarm");
  });

  it("still names a device gone from Home Assistant", async () => {
    const { doc, front } = make_doc();
    const [start, id] = ops.add_hotspot(doc, front, TRIANGLE, "", "gone");
    const editor = await open(make_hass(start));
    await tab(editor, "elements");
    editor._selection = { type: "hotspot", id };
    await editor.updateComplete;
    expect(
      (editor.renderRoot.querySelector(".panel fieldset select") as any).value,
    ).toBe("gone");
  });

  it("keeps zones of views and of devices apart", async () => {
    const { doc, front, other } = make_doc(2);
    const [start, id] = ops.add_hotspot(doc, front, TRIANGLE, other);
    const [both, zone] = ops.add_hotspot(start, front, TRIANGLE, "", "run");
    const editor = await open(make_hass(both));
    await tab(editor, "elements");
    editor._selection = { type: "hotspot", id };
    await editor.updateComplete;
    expect(editor.renderRoot.textContent).not.toContain("Zone of a device");

    await tab(editor, "views");
    editor._selection = { type: "hotspot", id: zone };
    await editor.updateComplete;
    const zones = [...editor.renderRoot.querySelectorAll("fieldset")].find(
      (f: any) => f.textContent.includes("Clickable zones"),
    ) as HTMLElement;
    expect(zones.querySelector("button.danger")).toBeNull();
  });

  it("draws zones to a view with the same tools", async () => {
    const { doc, front, other } = make_doc(2);
    const editor = await open(make_hass(doc));
    editor._tool = "hotspot_rect";
    await editor.updateComplete;
    await drag(editor, [
      [100, 100],
      [300, 300],
    ]);
    expect(editor.doc.views[front].hotspots[0].goto).toBe(other);
    expect(editor._tool).toBe("hotspot_rect");
  });

  it("offers the devices of the linked cloud aquarium", async () => {
    const { doc } = make_doc();
    const editor = await open(make_hass(doc));
    editor._clouds = [{ uid: "other", device_ids: [] }];
    expect(editor._hotspot_devices().length).toBeGreaterThan(0);
  });

  it("offers nothing without Home Assistant", async () => {
    const { doc } = make_doc();
    const editor = await open(make_hass(doc));
    editor._hass = null;
    expect(editor._hotspot_devices()).toEqual([]);
  });

  it("sets the size of the fish, within bounds", async () => {
    const { doc } = make_doc();
    const editor = await open(make_hass(doc));
    await tab(editor, "aquarium");
    const input = [...editor.renderRoot.querySelectorAll("label.field")]
      .find((l: any) => l.textContent.includes("Fish size"))!
      .querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("100");
    const set = async (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event("change"));
      await editor.updateComplete;
      return editor.doc.render.fish_scale;
    };
    expect(await set("150")).toBe(1.5);
    expect(await set("1000")).toBe(3);
    expect(await set("1")).toBe(0.25);
    expect(await set("")).toBe(0.25);
  });

  it("keeps the default size on an empty field", async () => {
    const { doc } = make_doc();
    const editor = await open(make_hass(doc));
    await tab(editor, "aquarium");
    const input = [...editor.renderRoot.querySelectorAll("label.field")]
      .find((l: any) => l.textContent.includes("Fish size"))!
      .querySelector("input") as HTMLInputElement;
    input.value = "";
    input.dispatchEvent(new Event("change"));
    expect(editor.doc.render.fish_scale).toBe(1);
  });
});

describe("zones in the card", () => {
  async function card_with(start: any) {
    const hass = make_hass(start);
    const card: any = document.createElement("reef-aquarium-card");
    card._hass = hass;
    card._api = new ReefTankApi(hass);
    card._payload = { document: start, entities: {} };
    return card;
  }

  it("names what a zone opens", async () => {
    const { doc, front, other } = make_doc(2);
    const [start] = ops.add_hotspot(doc, front, TRIANGLE, other);
    const [both] = ops.add_hotspot(start, front, TRIANGLE, "", "run");
    const card = await card_with(both);
    const [to_view, to_device] = both.views[front]!.hotspots;
    expect(card._hotspot_title(to_view)).toBe("Cabinet");
    expect(card._hotspot_title(to_device)).toBe("ReefRun");
    expect(card._hotspot_title({ ...to_device, label: "Pump" })).toBe("Pump");
    card._payload = null;
    expect(card._hotspot_title(to_view)).toBe("");
  });
});
