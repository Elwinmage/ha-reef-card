/**
 * Extra coverage of the scene editor: edge cases of loading, saving and
 * keyboard, the stage interactions and every control of the panels.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/devices/index";
import "../src/base/index";
import "../src/aquarium/index";
import {
  SCENE_DIALOG_CLASS,
  open_scene_editor,
  species_thumb,
} from "../src/aquarium/editor/scene_editor";
import { render } from "lit";
import {
  ApiError,
  IMAGES_URL,
  ReefTankApi,
  reset_catalog_cache,
} from "../src/aquarium/api";
import * as ops from "../src/aquarium/editor/ops";
import { rect_quad } from "../src/aquarium/geometry";

afterEach(() => {
  reset_catalog_cache();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

const catalog = {
  fish: [
    {
      id: "demo_damselfish",
      kind: "fish",
      source: "bundled",
      frame: [256, 128],
      columns: 8,
      clips: { swim: { from: 0, to: 23, fps: 24, loop: true } },
      atlas: { "1x": "/f.webp" },
      size_cm: [5, 8],
      names: { en: "Demo damselfish" },
    },
  ],
  corals: [
    {
      id: "demo_euphyllia",
      kind: "coral",
      source: "bundled",
      frame: [256, 256],
      columns: 8,
      clips: {},
      atlas: { shade: "/s.webp", mask: "/m.png" },
      palette: [
        { default: "#ff0000" },
        { default: "#00ff00" },
        { default: "#0000ff", fluo: true },
        { default: "#888888" },
      ],
      size_cm: [5, 25],
    },
  ],
  presets: [
    {
      id: "reefer",
      source: "bundled",
      name: "Reefer",
      views: { front: { name: "Front" } },
    },
  ],
};

function existing_doc() {
  let doc = ops.new_document("Reefer");
  doc.id = "a1b2";
  doc.revision = 3;
  let front: string;
  let cabinet: string;
  [doc, front] = ops.add_view(doc, "Front");
  [doc, cabinet] = ops.add_view(doc, "Cabinet");
  doc = ops.update_view(doc, front, { image: "a1b2/front.webp" });
  doc = ops.set_region(doc, front, "main", rect_quad(0.1, 0.1, 0.9, 0.6));
  doc = ops.add_light(doc, "main", { device_id: "led", x: 0.4 });
  [doc] = ops.add_decor(
    doc,
    front,
    [
      [0.2, 0.5],
      [0.3, 0.4],
      [0.4, 0.55],
    ],
    0.2,
  );
  [doc] = ops.add_hotspot(
    doc,
    front,
    [
      [0, 0.7],
      [1, 0.7],
      [1, 1],
    ],
    cabinet,
  );
  [doc] = ops.add_element(doc, front, {
    kind: "device",
    device_id: "led",
    pos: [0.4, 0.05],
  });
  [doc] = ops.add_element(doc, front, {
    kind: "entity",
    entity_id: "sensor.temp",
    type: "common-sensor",
    pos: [0.8, 0.7],
  });
  [doc] = ops.add_element(doc, front, {
    kind: "marker",
    pos: [0.5, 0.05],
    roles: ["feeding_point"],
  } as any);
  [doc] = ops.add_line(doc, "main", { species: "demo_damselfish", count: 5 });
  [doc] = ops.add_line(doc, "main", { species: "free text fish", count: 1 });
  [doc] = ops.add_coral(
    doc,
    "main",
    catalog.corals[0] as any,
    front,
    [0.5, 0.55],
  );
  [doc] = ops.add_feed_source(doc, "switch.feeding_1", "shortcut");
  return { doc, front, cabinet };
}

function make_hass(doc: any, handler?: (msg: any) => any) {
  const hass: any = {
    config: { components: ["reeftank", "redsea"] },
    language: "en",
    states: {
      "sensor.temp": {
        entity_id: "sensor.temp",
        state: "25",
        attributes: { friendly_name: "Temperature" },
      },
      "light.led_kelvin": {
        entity_id: "light.led_kelvin",
        state: "on",
        attributes: {},
      },
      "light.room": { entity_id: "light.room", state: "on", attributes: {} },
      "number.pump": { entity_id: "number.pump", state: "40", attributes: {} },
      "switch.feeding_1": {
        entity_id: "switch.feeding_1",
        state: "off",
        attributes: {},
      },
    },
    entities: {
      "light.led_kelvin": {
        device_id: "led",
        translation_key: "kelvin_intensity",
      },
      "sensor.temp": { device_id: "probe" },
    },
    devices: {
      led: {
        id: "led",
        name: "RSLED-1",
        model: "RSLED160",
        identifiers: [["redsea", "hwled"]],
        area_id: "salon",
      },
      probe: {
        id: "probe",
        name: "Probe",
        identifiers: [["other", "p"]],
        area_id: "cellar",
      },
    },
    areas: {
      salon: { area_id: "salon", name: "Living room", floor_id: "ground" },
      cellar: { area_id: "cellar", name: "Cellar", floor_id: "ground" },
    },
    floors: { ground: { floor_id: "ground", name: "Ground floor", level: 0 } },
    callService: vi.fn(),
    callWS: vi.fn(async (msg: any) => {
      const custom = handler?.(msg);
      if (custom !== undefined) return custom;
      switch (msg.type) {
        case "reeftank/catalog":
          return catalog;
        case "redsea/aquariums":
          return [
            {
              provider: "redsea",
              account: "me",
              uid: "aq1",
              name: "Cloud reefer",
              system_model: "Reefer",
              dimensions_cm: { length: 120, width: 60, height: 50 },
              device_ids: ["led"],
              feeding_entities: ["switch.feeding_1", "switch.feeding_2"],
            },
          ];
        case "reeftank/aquarium/get":
          return {
            document: structuredClone(doc),
            entities: {},
            images_url: "/reeftank/images",
          };
        case "reeftank/aquarium/save":
          return {
            document: {
              ...structuredClone(msg.document),
              revision: (msg.document.revision ?? 0) + 1,
            },
            entities: {},
            images_url: "/reeftank/images",
          };
        default:
          return null;
      }
    }),
    fetchWithAuth: vi.fn(),
  };
  return hass;
}

const flush = () => new Promise((r) => setTimeout(r, 0));

async function open(hass: any, id: string | null, on_close = vi.fn()) {
  const editor: any = open_scene_editor(hass, id, on_close);
  await flush();
  await flush();
  await editor.updateComplete;
  // A stage of 1000 x 500 pixels at the origin
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 1000,
    height: 500,
    right: 1000,
    bottom: 500,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
  return editor;
}

const pointer = (type: string, x: number, y: number, extra: any = {}) =>
  new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    composed: true,
    ...extra,
  }) as any;

/** Open the editor on the given tab (and view). */
async function open_on(
  doc: any,
  tab: string,
  view: string | null = null,
  hass: any = make_hass(doc),
) {
  const editor = await open(hass, doc.id ?? null);
  if (view) editor._view_id = view;
  editor._tab = tab;
  await editor.updateComplete;
  return editor;
}

const button = (root: ParentNode, text: string) =>
  [...root.querySelectorAll("button")].find(
    (b: any) => b.textContent.trim() === text,
  ) as HTMLButtonElement;

const fieldset = (root: ParentNode, legend: string) =>
  [...root.querySelectorAll("fieldset")].find(
    (f: any) => f.querySelector("legend")?.textContent.trim() === legend,
  ) as HTMLFieldSetElement;

/** Set the value of a form control and fire an event. */
function fire(el: any, value: any, type = "change", prop = "value") {
  el[prop] = value;
  el.dispatchEvent(new Event(type));
}

/** A canvas context accepting every call. */
function fake_context() {
  const ctx = new Proxy(
    {},
    {
      get: (t: any, k) =>
        k in t
          ? t[k]
          : k === "createLinearGradient"
            ? () => ({ addColorStop: () => undefined })
            : () => undefined,
      set: (t: any, k, v) => ((t[k] = v), true),
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx as any,
  );
}

describe("scene editor: opening, helpers", () => {
  it("does not reopen the dialog once the editor left it", async () => {
    const { doc } = existing_doc();
    const proto: any = HTMLDialogElement.prototype;
    const saved = proto.showModal;
    const show = vi.fn();
    proto.showModal = show;
    try {
      const editor = await open(make_hass(doc), "a1b2");
      const dialog = editor.parentElement as HTMLDialogElement;
      expect(show).toHaveBeenCalledTimes(1);
      editor.remove();
      dialog.dispatchEvent(new Event("close"));
      expect(show).toHaveBeenCalledTimes(1);
    } finally {
      proto.showModal = saved;
    }
  });

  it("names the waters, and switches between them", async () => {
    const { doc, front } = existing_doc();
    doc.waters.sump = ops.empty_water();
    doc.waters.reef2 = ops.empty_water("Frag tank");
    doc.waters.water4 = ops.empty_water();
    const editor = await open_on(doc, "lights", front);
    const select = [
      ...editor.shadowRoot.querySelectorAll("label.field select"),
    ].find((s: any) =>
      s.textContent.includes("Main tank"),
    ) as HTMLSelectElement;
    expect(
      [...select.options].slice(-4).map((o) => o.textContent!.trim()),
    ).toEqual(["Main tank", "Sump", "Frag tank", "water4"]);
    fire(select, "sump");
    expect(editor._water_id).toBe("sump");
  });

  it("crops a sprite of a species without columns", () => {
    const host = document.createElement("div");
    render(
      species_thumb({ ...catalog.fish[0], columns: 0 } as any, "fish"),
      host,
    );
    const style = host.querySelector(".thumb.sprite")!.getAttribute("style")!;
    // a single column: the atlas is as wide as one frame
    expect(style).toContain("background-size:48px auto");
  });

  it("keeps its hass, and has a harmless default close callback", async () => {
    const editor: any = document.createElement("reef-aquarium-scene-editor");
    expect(editor.on_close(null)).toBeUndefined();
    const first = make_hass({});
    const second = make_hass({});
    editor.hass = first;
    editor.hass = second;
    expect(editor.hass).toBe(second);
    expect(editor._api._hass).toBe(second);
  });

  it("does nothing without Home Assistant, and closes outside a dialog", async () => {
    const editor: any = document.createElement("reef-aquarium-scene-editor");
    const closed = vi.fn();
    editor.on_close = closed;
    document.body.appendChild(editor);
    await editor.updateComplete;
    expect(editor.doc).toBeNull();
    expect(editor.shadowRoot.querySelector(".body.loading")).not.toBeNull();
    expect(await editor.save()).toBe(false);
    await editor._reload();
    expect(editor._message).toBeNull();
    editor.close(true);
    expect(editor.isConnected).toBe(false);
    expect(closed).toHaveBeenCalledWith(null);
  });
});

describe("scene editor: loading and saving", () => {
  it("works without catalog and cloud aquariums", async () => {
    const { doc, front } = existing_doc();
    const hass = make_hass(doc, (msg) =>
      msg.type === "reeftank/catalog"
        ? Promise.reject({ code: "boom", message: "" })
        : undefined,
    );
    // the cloud listing swallows its own errors; guarded anyway
    vi.spyOn(ReefTankApi.prototype, "cloud_aquariums").mockRejectedValue(
      new ApiError("boom", ""),
    );
    const editor = await open_on(doc, "aquarium", front, hass);
    expect(editor._catalog).toBeNull();
    expect(editor._clouds).toEqual([]);
    const root = editor.shadowRoot;
    // no cloud or preset choice
    expect(root.textContent).not.toContain("Aquarium of the cloud account");
    expect(root.textContent).not.toContain("Preset");
    editor._tab = "livestock";
    await editor.updateComplete;
    expect(root.querySelector(".notice")).toBeNull();
    expect(root.textContent).toContain("generic fish");
  });

  it("follows the catalog once, and keeps it when a reload fails", async () => {
    const { doc } = existing_doc();
    let installed: (() => void) | null = null;
    let fail = false;
    const hass = make_hass(doc, (msg) =>
      fail && msg.type === "reeftank/catalog"
        ? Promise.reject({ code: "x", message: "" })
        : undefined,
    );
    hass.connection = {
      subscribeMessage: vi.fn(async (cb: any) => {
        installed = cb;
        return () => undefined;
      }),
    };
    const editor = await open(hass, "a1b2");
    const before = editor._catalog;
    expect(before).not.toBeNull();
    await editor._follow_catalog(); // already followed
    expect(hass.connection.subscribeMessage).toHaveBeenCalledTimes(1);
    fail = true;
    installed!({ version: "x" } as any);
    await flush();
    await flush();
    expect(editor._catalog).toBe(before);
  });

  it("drops a catalog subscription arriving after the close", async () => {
    const { doc } = existing_doc();
    const hass = make_hass(doc);
    const unsub = vi.fn();
    let resolve: (f: () => void) => void = () => undefined;
    hass.connection = {
      subscribeMessage: vi.fn(
        () => new Promise<() => void>((r) => (resolve = r)),
      ),
    };
    const editor = await open(hass, "a1b2");
    editor.close(true);
    resolve(unsub);
    await flush();
    expect(unsub).toHaveBeenCalled();
    expect(editor._catalog_unsub).toBeNull();
  });

  it("loads a document without views or a known water", async () => {
    const empty: any = ops.new_document("Empty");
    empty.id = "e1";
    empty.waters = {};
    empty.default_view = null;
    const hass = make_hass(empty, (msg) =>
      msg.type === "reeftank/aquarium/get"
        ? { document: structuredClone(empty), entities: {} }
        : undefined,
    );
    const editor = await open(hass, "e1");
    expect(editor._view_id).toBeNull();
    expect(editor._water_id).toBe("main");
    expect(editor._images_url).toBe(IMAGES_URL);
    // views tab without a view: no view settings
    editor._tab = "views";
    await editor.updateComplete;
    expect(editor.shadowRoot.textContent).not.toContain("This view");
    expect(editor.shadowRoot.querySelector(".empty")).not.toBeNull();

    // a document with a sump only: the sump becomes the current water
    const sump: any = ops.new_document("Sump");
    sump.id = "s1";
    sump.waters = { sump: ops.empty_water() };
    const other = await open(make_hass(sump), "s1");
    expect(other._water_id).toBe("sump");
  });

  it("keeps the current view and handles a saved document without id", async () => {
    const { doc, cabinet } = existing_doc();
    const hass = make_hass(doc, (msg) =>
      msg.type === "reeftank/aquarium/save"
        ? {
            document: { ...structuredClone(msg.document), id: undefined },
            entities: {},
          }
        : undefined,
    );
    const editor = await open(hass, "a1b2");
    editor._view_id = cabinet;
    expect(await editor.save()).toBe(true);
    expect(editor._view_id).toBe(cabinet);
    expect(editor.aquarium_id).toBeNull();
    // not new, without id: closed with null
    const closed = vi.fn();
    editor.on_close = closed;
    editor.close(true);
    expect(closed).toHaveBeenCalledWith(null);
  });

  it("explains errors", async () => {
    const { doc } = existing_doc();
    const editor = await open(make_hass(doc), "a1b2");
    expect(editor._error_text(new ApiError("not_found", ""))).toContain(
      "no longer exists",
    );
    expect(editor._error_text({ message: "boom" })).toBe("Error: boom");
    expect(editor._error_text(undefined)).toBe("Error: ");
  });

  it("deletes only a saved aquarium, after confirmation", async () => {
    const { doc } = existing_doc();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    // a new aquarium: nothing to delete
    const fresh = await open(make_hass({}), null);
    await fresh._delete_aquarium();
    expect(confirm).not.toHaveBeenCalled();
    // refused
    const hass = make_hass(doc, (msg) =>
      msg.type === "reeftank/aquarium/delete"
        ? Promise.reject({ code: "unauthorized", message: "" })
        : undefined,
    );
    const editor = await open(hass, "a1b2");
    await editor._delete_aquarium();
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(
      hass.callWS.mock.calls.some(
        (c: any) => c[0].type === "reeftank/aquarium/delete",
      ),
    ).toBe(false);
    // accepted, but the server refuses
    confirm.mockReturnValue(true);
    await editor._delete_aquarium();
    expect(editor._message.text).toContain("administrator");
    expect(editor.isConnected).toBe(true);
  });
});

describe("scene editor: undo and keyboard", () => {
  it("records changes, at most 100", async () => {
    const { doc } = existing_doc();
    const editor = await open(make_hass(doc), "a1b2");
    editor.change(editor.doc);
    expect(editor._history).toHaveLength(0);
    for (let i = 0; i < 105; i++)
      editor.change({ ...editor.doc, name: `n${i}` });
    expect(editor._history).toHaveLength(100);
    expect(editor._history[0].name).toBe("n4");
    editor._history = [];
    const current = editor.doc;
    editor.undo();
    expect(editor.doc).toBe(current);
  });

  it("handles Escape, Enter, Backspace and typing", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "views", front);
    const key = (key: string, extra: any = {}, target: EventTarget = window) =>
      target.dispatchEvent(
        new KeyboardEvent("keydown", {
          key,
          bubbles: true,
          composed: true,
          ...extra,
        }),
      );
    const decor = editor.doc.views[front].decor[0].id;
    editor._drawing = [[0.1, 0.1]];
    editor._drag = { type: "lasso", points: [] };
    editor._selection = { type: "decor", id: decor };
    // Enter with too few points: nothing
    key("Enter");
    expect(editor._drawing).toHaveLength(1);
    // Escape: the drawing, then the drag, then the selection
    key("Escape");
    expect(editor._drawing).toEqual([]);
    expect(editor._drag).not.toBeNull();
    key("Escape");
    expect(editor._drag).toBeNull();
    expect(editor._selection).not.toBeNull();
    // typing in a field: no undo, no delete
    editor.change({ ...editor.doc, name: "Renamed" });
    const input = editor.shadowRoot.querySelector("input");
    key("z", { ctrlKey: true }, input);
    key("Backspace", {}, input);
    expect(editor.doc.name).toBe("Renamed");
    expect(editor.doc.views[front].decor).toHaveLength(1);
    // another key: nothing
    key("a");
    expect(editor.doc.views[front].decor).toHaveLength(1);
    // Backspace deletes the selection
    key("Backspace");
    expect(editor.doc.views[front].decor).toHaveLength(0);
    key("Escape");
    expect(editor._selection).toBeNull();
  });

  it("lists entities by domain and knows lamps only with hass", async () => {
    const { doc } = existing_doc();
    const editor = await open(make_hass(doc), "a1b2");
    expect(editor._entity_ids()).toEqual([
      "light.led_kelvin",
      "light.room",
      "number.pump",
      "sensor.temp",
      "switch.feeding_1",
    ]);
    expect(editor._is_lamp("led")).toBe(true);
    editor._hass = { ...editor._hass, states: undefined };
    expect(editor._entity_ids(["light"])).toEqual([]);
    editor._hass = null;
    expect(editor._is_lamp("led")).toBe(false);
    expect(editor._entity_ids()).toEqual([]);
  });
});

describe("scene editor: stage", () => {
  it("ignores the pointer without a stage or with an empty one", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "views", front);
    const stage = editor.shadowRoot.querySelector(".stage");
    // an empty stage box
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    } as DOMRect);
    editor._tool = "decor";
    stage.dispatchEvent(pointer("pointerdown", 10, 10));
    expect(editor._drawing).toEqual([]);
    editor._drag = {
      type: "element",
      id: editor.doc.views[front].elements[0].id,
    };
    const before = editor.doc;
    stage.dispatchEvent(pointer("pointermove", 10, 10));
    expect(editor.doc).toBe(before);
    // no view: no stage
    editor._drag = null;
    editor._view_id = null;
    await editor.updateComplete;
    expect(editor.shadowRoot.querySelector(".stage")).toBeNull();
    expect(editor._point(pointer("pointerdown", 1, 1))).toBeNull();
    editor._stage_down(pointer("pointerdown", 1, 1));
    expect(editor._drawing).toEqual([]);
    // moving without a drag: nothing
    editor._stage_move(pointer("pointermove", 1, 1));
    expect(editor.doc).toBe(before);
  });

  it("adds no sand point without a sand line, places unknown corals", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "views", front);
    const stage = editor.shadowRoot.querySelector(".stage");
    editor._tool = "sand";
    const before = editor.doc;
    stage.dispatchEvent(pointer("pointerdown", 500, 200));
    expect(editor.doc).toBe(before);
    expect(editor._drag).toBeNull();
    // the coral tool without a species: a plain click
    editor._tool = "coral";
    editor._selection = { type: "decor", id: "x" };
    stage.dispatchEvent(pointer("pointerdown", 500, 200));
    expect(editor._selection).toBeNull();
    // a species the catalog does not know
    editor._coral_species = "mystery_coral";
    stage.dispatchEvent(pointer("pointerdown", 500, 200));
    const coral = editor.doc.waters.main.corals.at(-1);
    expect(coral.species).toBe("mystery_coral");
    expect(editor._selection).toEqual({
      type: "coral",
      id: coral.id,
      water: "main",
    });
  });

  it("clears the selection on the picture only", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "views", front);
    const root = editor.shadowRoot;
    const sel = { type: "decor", id: "x" };
    editor._selection = sel;
    root
      .querySelector(".stage svg")
      .dispatchEvent(pointer("pointerdown", 5, 5));
    expect(editor._selection).toBe(sel);
    root.querySelector("img.bg").dispatchEvent(pointer("pointerdown", 5, 5));
    expect(editor._selection).toBeNull();
  });

  it("selects and reshapes decor and hotspots", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "views", front);
    const root = editor.shadowRoot;
    const stage = root.querySelector(".stage");
    // not with another tool
    editor._tool = "lasso";
    await editor.updateComplete;
    root
      .querySelector("polygon.decor")
      .dispatchEvent(pointer("pointerdown", 1, 1));
    root
      .querySelector("polygon.hotspot")
      .dispatchEvent(pointer("pointerdown", 1, 1));
    expect(editor._selection).toBeNull();
    editor._drag = null;
    editor._tool = "select";
    await editor.updateComplete;
    root
      .querySelector("polygon.decor")
      .dispatchEvent(pointer("pointerdown", 1, 1));
    const decor = editor.doc.views[front].decor[0];
    expect(editor._selection).toEqual({ type: "decor", id: decor.id });
    await editor.updateComplete;
    expect(root.querySelector("polygon.decor.selected")).not.toBeNull();
    expect(root.querySelectorAll(".handle.vertex")).toHaveLength(3);
    root
      .querySelector(".handle.vertex")
      .dispatchEvent(pointer("pointerdown", 200, 250));
    stage.dispatchEvent(pointer("pointermove", 100, 100));
    stage.dispatchEvent(pointer("pointerup", 100, 100));
    expect(editor.doc.views[front].decor[0].poly[0]).toEqual([0.1, 0.2]);
    // the hotspot
    root
      .querySelector("polygon.hotspot")
      .dispatchEvent(pointer("pointerdown", 1, 1));
    const hotspot = editor.doc.views[front].hotspots[0];
    expect(editor._selection).toEqual({ type: "hotspot", id: hotspot.id });
    await editor.updateComplete;
    expect(root.querySelector("polygon.hotspot.selected")).not.toBeNull();
    root
      .querySelector(".handle.vertex")
      .dispatchEvent(pointer("pointerdown", 0, 350));
    stage.dispatchEvent(pointer("pointermove", 0, 300));
    stage.dispatchEvent(pointer("pointerup", 0, 300));
    expect(editor.doc.views[front].hotspots[0].poly[0]).toEqual([0, 0.6]);
  });

  it("leaves a lamp of a water not outlined where it is", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "lights", front);
    editor._drag = { type: "lamp", water: "sump", index: 0 };
    const before = editor.doc;
    editor.shadowRoot
      .querySelector(".stage")
      .dispatchEvent(pointer("pointermove", 100, 100));
    expect(editor.doc).toBe(before);
  });

  it("shows the lasso while drawn, and drops a lasso too small", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "views", front);
    const root = editor.shadowRoot;
    const stage = root.querySelector(".stage");
    editor._tool = "lasso";
    stage.dispatchEvent(pointer("pointerdown", 100, 100));
    stage.dispatchEvent(pointer("pointermove", 200, 100));
    await editor.updateComplete;
    expect(root.querySelector("polyline.drawing")).not.toBeNull();
    stage.dispatchEvent(pointer("pointerup", 200, 100));
    expect(editor.doc.views[front].decor).toHaveLength(1);
    expect(editor._drag).toBeNull();
    // a lasso on a view gone: nothing selected
    editor._view_id = "ghost";
    editor._drag = {
      type: "lasso",
      points: [
        [0.1, 0.1],
        [0.5, 0.1],
        [0.5, 0.5],
      ],
    };
    editor._stage_up(pointer("pointerup", 0, 0));
    expect(editor._selection).toBeNull();
    // a drag from the tree is kept by the stage
    editor._drag = {
      type: "new",
      kind: "device",
      ref: "led",
      label: "",
      x: 0,
      y: 0,
    };
    editor._stage_up(pointer("pointerup", 0, 0));
    expect(editor._drag.type).toBe("new");
  });

  it("drags entities from the tree with a ghost", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "elements", front);
    const root = editor.shadowRoot;
    editor._expanded.add("area:cellar");
    editor._expanded.add("floor:ground");
    editor._expanded.add("device:probe");
    editor.requestUpdate();
    await editor.updateComplete;
    // the "+" button does not start a drag
    root
      .querySelector(".tree-row.entity .add")
      .dispatchEvent(pointer("pointerdown", 10, 10));
    expect(editor._drag).toBeNull();
    const row = root.querySelector(".tree-row.entity");
    row.dispatchEvent(pointer("pointerdown", 1200, 100));
    await editor.updateComplete;
    const ghost = root.querySelector(".ghost");
    expect(ghost.textContent).toContain("Temperature");
    // the drag was dropped meanwhile: the pointer no longer moves it
    editor._drag = null;
    window.dispatchEvent(pointer("pointermove", 1100, 120));
    expect(editor._drag).toBeNull();
    window.dispatchEvent(pointer("pointerup", 250, 250));
    const before = editor.doc.views[front].elements.length;
    row.dispatchEvent(pointer("pointerdown", 1200, 100));
    window.dispatchEvent(pointer("pointerup", 250, 250));
    const added = editor.doc.views[front].elements;
    expect(added).toHaveLength(before + 1);
    expect(added.at(-1)).toMatchObject({
      kind: "entity",
      entity_id: "sensor.temp",
      type: "common-sensor",
      pos: [0.25, 0.5],
    });
    // the ghost of a device
    root
      .querySelector(".tree-row.device")
      .dispatchEvent(pointer("pointerdown", 1200, 100));
    await editor.updateComplete;
    expect(root.querySelector(".ghost")).not.toBeNull();
    window.dispatchEvent(pointer("pointerup", 2000, 2000));
  });

  it("adds no element without a view", async () => {
    const { doc } = existing_doc();
    const editor = await open(make_hass(doc), "a1b2");
    const before = editor.doc;
    editor._view_id = null;
    editor._add_element("device", "led");
    expect(editor.doc).toBe(before);
    editor._view_id = "ghost";
    editor._add_element("device", "led");
    expect(editor.doc).toBe(before);
    expect(editor._selection).toBeNull();
  });

  it("uses the default sand band, and paints a stage without size", async () => {
    const { doc, front } = existing_doc();
    delete (doc.waters.main as any).sand_band;
    const editor = await open_on(doc, "views", front);
    expect(editor._default_sand("main")).toHaveLength(2);
    fake_context();
    editor._preview = true;
    await editor.updateComplete;
    const canvas = editor.shadowRoot.querySelector("canvas.backdrop");
    canvas.getBoundingClientRect = () => ({ width: 0, height: 0 });
    canvas.width = 300;
    editor._backdrop.on_change(); // a texture loaded: painted again
    expect(canvas.width).toBe(1);
    expect(canvas.height).toBe(1);
  });

  it("finishes shapes only when they can be", async () => {
    const { doc, front, cabinet } = existing_doc();
    const editor = await open_on(doc, "views", front);
    const tri = [
      [0.1, 0.1],
      [0.3, 0.1],
      [0.3, 0.3],
    ];
    editor._tool = "decor";
    editor._drawing = tri.slice(0, 2);
    editor._finish_shape();
    expect(editor._drawing).toHaveLength(2);
    // a zone opens the other view by default
    editor._tool = "hotspot";
    editor._hotspot_target = "";
    editor._drawing = tri;
    editor._finish_shape();
    expect(editor.doc.views[front].hotspots.at(-1).goto).toBe(cabinet);
    // a single view: no zone
    editor.change(ops.remove_view(editor.doc, cabinet));
    editor._drawing = tri;
    editor._finish_shape();
    expect(editor._message.text).toContain("Add another view first");
    expect(editor._drawing).toHaveLength(3);
    // decor on a view gone
    editor._tool = "decor";
    editor._view_id = "ghost";
    editor._selection = null;
    editor._finish_shape();
    expect(editor._selection).toBeNull();
    expect(editor._drawing).toEqual([]);
  });

  it("deletes every kind of selection", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "views", front);
    const view = () => editor.doc.views[front];
    editor._delete_selection(); // nothing selected
    editor._selection = { type: "hotspot", id: view().hotspots[0].id };
    editor._delete_selection();
    expect(view().hotspots).toHaveLength(0);
    editor._selection = { type: "element", id: view().elements[0].id };
    editor._delete_selection();
    expect(view().elements).toHaveLength(2);
    const coral = editor.doc.waters.main.corals[0].id;
    editor._selection = { type: "coral", id: coral, water: "main" };
    editor._delete_selection();
    expect(editor.doc.waters.main.corals).toHaveLength(0);
    const before = editor.doc;
    editor._selection = { type: "other", id: "x" };
    editor._delete_selection();
    expect(editor.doc).toBe(before);
    expect(editor._selection).toBeNull();
  });

  it("ignores an upload without a file", async () => {
    const { doc, front } = existing_doc();
    const hass = make_hass(doc);
    const editor = await open_on(doc, "views", front, hass);
    const input = { files: [], value: "x" };
    await editor._upload({ target: input });
    expect(input.value).toBe("");
    expect(hass.fetchWithAuth).not.toHaveBeenCalled();
  });

  it("closes a shape on a double click, follows the picture size", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "views", front);
    const root = editor.shadowRoot;
    const stage = root.querySelector(".stage");
    editor._tool = "region";
    await editor.updateComplete;
    // a double click on a corner does nothing
    const before = editor.doc;
    root
      .querySelector(".handle.corner")
      .dispatchEvent(new MouseEvent("dblclick"));
    stage.dispatchEvent(new MouseEvent("dblclick"));
    expect(editor.doc).toBe(before);
    editor._tool = "decor";
    for (const [x, y] of [
      [100, 100],
      [300, 100],
      [300, 300],
    ])
      stage.dispatchEvent(pointer("pointerdown", x, y));
    await editor.updateComplete;
    // the drawn points have handles that do nothing themselves
    const points = root.querySelectorAll(".handle.point");
    expect(points).toHaveLength(3);
    points[0].dispatchEvent(new MouseEvent("pointerdown"));
    expect(editor._drawing).toHaveLength(3);
    stage.dispatchEvent(new MouseEvent("dblclick"));
    expect(editor.doc.views[front].decor).toHaveLength(2);
    // the picture's size sets the stage's
    const img = root.querySelector("img.bg");
    Object.defineProperty(img, "naturalWidth", {
      value: 0,
      configurable: true,
    });
    img.dispatchEvent(new Event("load"));
    expect(editor._aspect).toBeCloseTo(16 / 9);
    Object.defineProperty(img, "naturalWidth", { value: 800 });
    Object.defineProperty(img, "naturalHeight", { value: 400 });
    img.dispatchEvent(new Event("load"));
    expect(editor._aspect).toBe(2);
  });

  it("draws what each tab shows on the stage", async () => {
    let { doc, front, cabinet } = existing_doc();
    doc = ops.update_view(doc, front, { image: null });
    doc = ops.set_region(doc, front, "sump", rect_quad(0.6, 0.6, 0.9, 0.9));
    doc = ops.set_sand_line(doc, front, "sump", [
      [0.6, 0.85],
      [0.9, 0.85],
    ]);
    doc = ops.set_sand_line(
      doc,
      front,
      "sump",
      [
        [0.6, 0.7],
        [0.9, 0.7],
      ],
      "sand_back",
    );
    doc = ops.add_water(doc, "frag");
    doc = ops.set_region(doc, front, "frag", [
      [0, 0],
      [0.1, 0],
      [0.1, 0.1],
    ]);
    doc.waters.frag.lights.push({ entity_id: "light.room", x: 0.5 });
    doc = ops.add_light(doc, "main", { entity_id: "light.room", x: 0.6 });
    doc = ops.add_water(doc, "quarantine");
    [doc] = ops.add_line(doc, "quarantine", { species: "x", count: 1 });
    doc.waters.quarantine.livestock[0].home = [0.5, 0.5, 0.5];
    doc.waters.main.livestock[0].home = [0.5, 0.5, 0.5];
    [doc] = ops.add_element(doc, front, {
      kind: "device",
      device_id: "probe",
      pos: [0.1, 0.9],
      scale: 0,
      roles: ["feeding_point"],
    } as any);
    [doc] = ops.add_element(doc, front, {
      kind: "entity",
      entity_id: "sensor.gone",
      pos: [0.2, 0.9],
    });
    [doc] = ops.add_element(doc, front, {
      kind: "entity",
      entity_id: "sensor.temp",
      label: "Water",
      pos: [0.3, 0.9],
    });
    [doc] = ops.add_element(doc, front, {
      kind: "marker",
      label: "Spot",
      pos: [0.4, 0.9],
    } as any);
    [doc] = ops.add_coral(
      doc,
      "main",
      { id: "unknown" } as any,
      front,
      [0.3, 0.5],
    );
    // a coral without view shows on every view
    [doc] = ops.add_coral(
      doc,
      "main",
      catalog.corals[0] as any,
      front,
      [0.7, 0.5],
    );
    delete (doc.waters.main.corals.at(-1) as any).view;
    [doc] = ops.add_coral(
      doc,
      "main",
      catalog.corals[0] as any,
      cabinet,
      [0.3, 0.5],
    );
    const editor = await open_on(doc, "views", front);
    const root = editor.shadowRoot;
    expect(root.querySelector(".noimage")).not.toBeNull();
    // the sand lines of another water
    const lines = root.querySelectorAll("polyline.sand");
    expect(lines).toHaveLength(2);
    expect(lines[0].getAttribute("class")).not.toContain("current");
    // the elements
    const chips = [...root.querySelectorAll(".el")].map((e: any) =>
      e.textContent.replace(/\s+/g, " ").trim(),
    );
    expect(chips).toContain("Probe");
    expect(chips).toContain("sensor.gone: ?");
    expect(chips).toContain("Water: 25");
    expect(chips).toContain("Spot");
    const probe = [...root.querySelectorAll(".el")].find((e: any) =>
      e.textContent.includes("Probe"),
    ) as HTMLElement;
    expect(probe.querySelector(".badge")).not.toBeNull();
    expect(probe.getAttribute("style")).toContain("scale(1)");
    // corals: of this view only, coloured by default without species
    editor._tab = "livestock";
    editor._selection = {
      type: "coral",
      id: editor.doc.waters.main.corals[1].id,
      water: "main",
    };
    await editor.updateComplete;
    const corals = root.querySelectorAll(".stage .coral");
    expect(corals).toHaveLength(3);
    expect(corals[1].getAttribute("style")).toContain("#ff6b81");
    expect(corals[1].classList.contains("selected")).toBe(true);
    // homes: only of the waters outlined
    expect(root.querySelectorAll(".stage .home")).toHaveLength(1);
    // lamps: of valid outlines, named by their entity
    editor._tab = "lights";
    await editor.updateComplete;
    const lamps = [...root.querySelectorAll(".lamp")].map((l: any) =>
      l.getAttribute("title"),
    );
    expect(lamps).toEqual(["RSLED-1", "light.room"]);
  });
});

describe("scene editor: aquarium panel", () => {
  it("edits the name, dimensions and rendering", async () => {
    const { doc } = existing_doc();
    doc.dimensions_cm = null;
    const editor = await open_on(doc, "aquarium");
    const root = editor.shadowRoot;
    fire(root.querySelector("label.field input"), "Renamed");
    expect(editor.doc.name).toBe("Renamed");
    await editor.updateComplete;
    const dims = () =>
      [...fieldset(root, "Dimensions (cm)").querySelectorAll("input")] as any[];
    fire(dims()[0], "abc");
    expect(editor.doc.dimensions_cm).toEqual({
      length: 1,
      width: 50,
      height: 50,
    });
    await editor.updateComplete;
    expect(dims()[0].value).toBe("1");
    fire(dims()[2], "45");
    expect(editor.doc.dimensions_cm.height).toBe(45);
    await editor.updateComplete;
    const rendering = fieldset(root, "Rendering");
    const [level, light] = [...rendering.querySelectorAll("select")] as any[];
    fire(level, "static");
    expect(editor.doc.render.level).toBe("static");
    await editor.updateComplete;
    fire(rendering.querySelector("input"), "abc");
    expect(editor.doc.render.max_fish).toBe(0);
    await editor.updateComplete;
    fire(rendering.querySelector("input"), "500");
    expect(editor.doc.render.max_fish).toBe(200);
    await editor.updateComplete;
    fire(light, "blue");
    expect(editor.doc.photo_light).toBe("blue");
  });

  it("links a cloud aquarium and applies a preset", async () => {
    const { doc } = existing_doc();
    const hass = make_hass(doc, (msg) =>
      msg.type === "redsea/aquariums"
        ? [
            {
              provider: "redsea",
              uid: "aq1",
              name: "Cloud reefer",
              device_ids: [],
              feeding_entities: [],
            },
            {
              provider: "redsea",
              uid: "aq2",
              name: "Other",
              system_model: "Max",
              device_ids: [],
              feeding_entities: [],
            },
          ]
        : msg.type === "reeftank/catalog"
          ? {
              ...catalog,
              presets: [
                ...catalog.presets,
                { id: "plain", source: "bundled", views: {} },
              ],
            }
          : undefined,
    );
    const editor = await open_on(doc, "aquarium", null, hass);
    const root = editor.shadowRoot;
    const [cloud, preset] = [...root.querySelectorAll("select")] as any[];
    expect([...cloud.options].map((o: any) => o.textContent.trim())).toEqual([
      "—",
      "Cloud reefer",
      "Other (Max)",
    ]);
    // presets are named by their translations, else their name, else their id
    expect([...preset.options].map((o: any) => o.textContent.trim())).toEqual([
      "—",
      "Reefer",
      "plain",
    ]);
    fire(cloud, "");
    expect(editor.doc.cloud).toBeFalsy();
    fire(cloud, "aq2");
    expect(editor.doc.cloud).toEqual({ provider: "redsea", uid: "aq2" });
    await editor.updateComplete;
    fire(preset, "");
    expect(editor.doc.preset).toBeFalsy();
    fire(preset, "reefer");
    expect(editor.doc.preset).toBe("reefer");
    expect(editor._view_id).toBe(editor.doc.default_view);
  });

  it("applies a preset without views to a new aquarium", async () => {
    const editor = await open(make_hass({}), null);
    editor._catalog = {
      ...catalog,
      presets: [{ id: "plain", source: "bundled", views: {} }],
    };
    await editor.updateComplete;
    const preset = [...editor.shadowRoot.querySelectorAll("select")].find(
      (s: any) => s.textContent.includes("plain"),
    ) as HTMLSelectElement;
    fire(preset, "plain");
    expect(editor.doc.preset).toBe("plain");
    expect(editor._view_id).toBeNull();
  });

  it("merges a cloud aquarium into an existing document", async () => {
    const { doc, front } = existing_doc();
    doc.dimensions_cm = { length: 90, width: 45, height: 45 };
    const editor = await open(make_hass(doc), "a1b2");
    editor._view_id = front;
    const cloud = editor._clouds[0];
    editor._catalog = null;
    editor._apply_cloud(cloud);
    // dimensions and name kept, lamp and source not doubled
    expect(editor.doc.dimensions_cm.length).toBe(90);
    expect(editor.doc.name).toBe("Reefer");
    expect(editor.doc.waters.main.lights).toHaveLength(1);
    expect(editor.doc.feeding.sources.map((s: any) => s.entity_id)).toEqual([
      "switch.feeding_1",
      "switch.feeding_2",
    ]);
    expect(editor._view_id).toBe(front);
    // no main water: created for the lamps
    editor.change({ ...structuredClone(editor.doc), waters: {} });
    editor._apply_cloud(cloud);
    expect(editor.doc.waters.main.lights).toEqual([
      { device_id: "led", x: 0.5 },
    ]);
  });

  it("applies the matching preset to a new aquarium", async () => {
    const hass = make_hass({});
    const editor = await open(hass, null);
    editor._catalog = {
      ...catalog,
      presets: [
        {
          id: "reefer",
          source: "bundled",
          name: "Reefer",
          match: { models: ["Reefer"] },
          views: { front: { name: "Front" } },
          default_view: "front",
        },
      ],
    };
    editor.change({ ...structuredClone(editor.doc), name: "" });
    editor._apply_cloud(editor._clouds[0]);
    expect(editor.doc.name).toBe("Cloud reefer");
    expect(editor.doc.preset).toBe("reefer");
    expect(editor._view_id).toBe("front");
  });
});

describe("scene editor: views panel", () => {
  it("manages the views", async () => {
    const { doc, front, cabinet } = existing_doc();
    doc.views[cabinet].name = "";
    const editor = await open_on(doc, "views", front);
    const root = editor.shadowRoot;
    const items = () =>
      [...root.querySelectorAll(".list .item")].map((i: any) =>
        i.textContent.trim(),
      );
    expect(items()).toEqual(["Front ★", "(no name)"]);
    editor._selection = { type: "decor", id: "x" };
    (root.querySelectorAll(".list .item")[1] as HTMLElement).click();
    expect(editor._view_id).toBe(cabinet);
    expect(editor._selection).toBeNull();
    await editor.updateComplete;
    // rename, make default
    fire(fieldset(root, "This view").querySelector("input"), "Cabinet");
    expect(editor.doc.views[cabinet].name).toBe("Cabinet");
    await editor.updateComplete;
    button(root, "Make it the default view").click();
    expect(editor.doc.default_view).toBe(cabinet);
    await editor.updateComplete;
    expect(button(root, "Make it the default view")).toBeUndefined();
    // add a view
    button(root, "+ Add a view").click();
    const added = editor._view_id;
    expect(editor.doc.views[added].name).toBe("View 3");
    await editor.updateComplete;
    // delete the default view: another becomes current
    editor._view_id = cabinet;
    await editor.updateComplete;
    button(root, "Delete the view").click();
    expect(editor.doc.views[cabinet]).toBeUndefined();
    expect(editor._view_id).toBe(editor.doc.default_view);
    // the last views deleted: no current view
    await editor.updateComplete;
    button(root, "Delete the view").click();
    await editor.updateComplete;
    button(root, "Delete the view").click();
    expect(editor.doc.views).toEqual({});
    expect(editor._view_id).toBeNull();
  });

  it("adds waters and outlines them", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "views", front);
    const root = editor.shadowRoot;
    button(root, "+ Add a water").click();
    expect(editor._water_id).toBe("sump");
    await editor.updateComplete;
    button(root, "+ Add a water").click();
    expect(editor._water_id).toBe("water3");
    await editor.updateComplete;
    // no outline yet: a default one
    button(root, "Outline it").click();
    expect(editor._tool).toBe("region");
    const region = () =>
      editor.doc.views[front].regions.find((r: any) => r.water === "water3");
    expect(region().quad).toEqual(rect_quad(0.1, 0.1, 0.9, 0.6));
    await editor.updateComplete;
    // an outline already there is kept
    editor.change(
      ops.set_region(
        editor.doc,
        front,
        "water3",
        rect_quad(0.2, 0.2, 0.5, 0.5),
      ),
    );
    await editor.updateComplete;
    button(root, "Edit the outline").click();
    expect(region().quad).toEqual(rect_quad(0.2, 0.2, 0.5, 0.5));
    await editor.updateComplete;
    button(root, "Remove the outline").click();
    expect(region()).toBeUndefined();
    // the tool buttons reset the drawing
    await editor.updateComplete;
    editor._drawing = [[0.1, 0.1]];
    button(root, "Polygon").click();
    expect(editor._tool).toBe("decor");
    expect(editor._drawing).toEqual([]);
  });

  it("sets the depth of decor, finishes and deletes shapes", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "views", front);
    const root = editor.shadowRoot;
    const decor = () => editor.doc.views[front].decor;
    // no decor selected: the depth for the next ones
    button(root, "Front").click();
    expect(editor._depth).toBe("front");
    expect(decor()[0].z).toBe(0.2);
    editor._selection = { type: "decor", id: decor()[0].id };
    await editor.updateComplete;
    button(root, "Back").click();
    expect(decor()[0].z).toBe(ops.DEPTHS.back);
    await editor.updateComplete;
    // a shape being drawn can be closed with a button
    editor._tool = "decor";
    editor._drawing = [
      [0.1, 0.1],
      [0.3, 0.1],
      [0.3, 0.3],
    ];
    await editor.updateComplete;
    button(root, "Close the shape").click();
    expect(decor()).toHaveLength(2);
    await editor.updateComplete;
    // the selected decor (the new one) is deleted
    button(fieldset(root, "Decor"), "Delete").click();
    expect(decor()).toHaveLength(1);
  });

  it("sets the target of zones", async () => {
    const { doc, front, cabinet } = existing_doc();
    let d = doc;
    let third: string;
    [d, third] = ops.add_view(d, "");
    const editor = await open_on(d, "views", front);
    const root = editor.shadowRoot;
    const zones = () => fieldset(root, "Clickable zones");
    const select = () => zones().querySelector("select") as HTMLSelectElement;
    expect([...select().options].map((o) => o.textContent!.trim())).toEqual([
      "Cabinet",
      third,
    ]);
    // no zone selected: the target of the next ones
    fire(select(), third);
    expect(editor._hotspot_target).toBe(third);
    expect(editor.doc.views[front].hotspots[0].goto).toBe(cabinet);
    const id = editor.doc.views[front].hotspots[0].id;
    editor._selection = { type: "hotspot", id };
    await editor.updateComplete;
    expect(select().value).toBe(cabinet);
    fire(select(), third);
    expect(editor.doc.views[front].hotspots[0].goto).toBe(third);
    await editor.updateComplete;
    button(zones(), "Delete").click();
    expect(editor.doc.views[front].hotspots).toHaveLength(0);
    // a single view: no zone
    editor.change(ops.remove_view(editor.doc, cabinet));
    editor.change(ops.remove_view(editor.doc, third));
    await editor.updateComplete;
    expect(zones().textContent).toContain("Add another view first");
  });

  it("sets textures on a view without backdrop", async () => {
    const { doc, front } = existing_doc();
    delete (doc.views[front] as any).backdrop;
    const editor = await open_on(doc, "views", front);
    const root = editor.shadowRoot;
    const rock = fieldset(root, "Background").querySelector(
      "select",
    ) as HTMLSelectElement;
    fire(rock, "");
    expect(editor.doc.views[front].backdrop).toEqual({
      mode: "photo",
      rock: null,
    });
  });
});

describe("scene editor: devices panel", () => {
  it("shows the tree with its icons, sub-devices and loose entities", async () => {
    const { doc, front } = existing_doc();
    const hass = make_hass(doc);
    hass.areas.garage = { area_id: "garage", name: "Garage", icon: "mdi:car" };
    hass.devices.child = {
      id: "child",
      name: "Child",
      identifiers: [["other", "c"]],
      area_id: "cellar",
      via_device_id: "probe",
    };
    hass.devices.tank = {
      id: "tank",
      name: "Tank",
      identifiers: [["reeftank", "a1b2"]],
      area_id: "garage",
    };
    hass.entities["sensor.loose"] = { area_id: "garage" };
    hass.states["sensor.loose"] = {
      entity_id: "sensor.loose",
      state: "1",
      attributes: { friendly_name: "Loose" },
    };
    if (!customElements.get("ha-icon"))
      customElements.define("ha-icon", class extends HTMLElement {});
    if (!customElements.get("ha-state-icon"))
      customElements.define("ha-state-icon", class extends HTMLElement {});
    const editor = await open_on(doc, "elements", front, hass);
    const root = editor.shadowRoot;
    const names = () =>
      [...root.querySelectorAll(".tree-row .name")].map((n: any) =>
        n.textContent.trim(),
      );
    // the aquarium's area, without floor, is open
    expect(names()).toEqual(["Garage", "Tank", "Loose"]);
    expect(root.querySelector("ha-icon")).not.toBeNull();
    expect(root.querySelector("ha-state-icon")).not.toBeNull();
    // all areas: the floor opens and closes on a click
    fire(root.querySelector("label.switch input"), true, "change", "checked");
    expect(editor._all_areas).toBe(true);
    await editor.updateComplete;
    const floor = root.querySelector(".tree-row.floor") as HTMLElement;
    floor.click();
    await editor.updateComplete;
    expect(names()).toContain("Cellar");
    editor._expanded.add("area:cellar");
    editor._expanded.add("device:probe");
    floor.click();
    await editor.updateComplete;
    expect(names()).not.toContain("Cellar");
    floor.click();
    await editor.updateComplete;
    expect(names()).toContain("Child");
    // searching
    fire(root.querySelector("input.search"), "loose", "input");
    expect(editor._search).toBe("loose");
  });

  it("works without hass, and adds feeding points", async () => {
    // a view without elements (they need hass to be drawn)
    const [doc, front] = ops.add_view(ops.new_document("Bare"), "Front");
    const editor = await open(make_hass({}), null);
    const unsaved = structuredClone(editor.doc);
    delete unsaved.id;
    editor.change(unsaved);
    editor._tab = "elements";
    await editor.updateComplete;
    const root = editor.shadowRoot;
    // no view: the button does nothing
    const before = editor.doc;
    button(root, "+ Add a feeding point").click();
    expect(editor.doc).toBe(before);
    expect(editor._expanded_for).toBe("");
    editor.change(doc);
    editor._view_id = front;
    editor._hass = null;
    await editor.updateComplete;
    expect(root.querySelector(".tree .hint")).not.toBeNull();
    button(root, "+ Add a feeding point").click();
    expect(editor.doc.views[front].elements.at(-1)).toMatchObject({
      kind: "marker",
      roles: ["feeding_point"],
    });
  });

  it("edits the properties of an element", async () => {
    const { doc, front } = existing_doc();
    delete (doc.views[front].elements[1] as any).type;
    const editor = await open_on(doc, "elements", front);
    const root = editor.shadowRoot;
    const el = (i: number) => editor.doc.views[front].elements[i];
    const props = () => root.querySelector("fieldset.props");
    editor._selection = { type: "element", id: el(1).id };
    await editor.updateComplete;
    expect(props().querySelector("legend").textContent.trim()).toBe(
      "sensor.temp",
    );
    expect(props().querySelector("select").value).toBe("common-sensor");
    fire(props().querySelector("input"), "Temp");
    expect(el(1).label).toBe("Temp");
    await editor.updateComplete;
    fire(props().querySelector("select"), "common-switch");
    expect(el(1).type).toBe("common-switch");
    await editor.updateComplete;
    fire(props().querySelector("input[type=range]"), "2");
    expect(el(1).scale).toBe(2);
    await editor.updateComplete;
    // a feeding point, for one source
    const check = () =>
      props().querySelector("input[type=checkbox]") as HTMLInputElement;
    fire(check(), true, "change", "checked");
    expect(el(1).roles).toEqual(["feeding_point"]);
    await editor.updateComplete;
    const source = () =>
      [...props().querySelectorAll("select")].at(-1) as HTMLSelectElement;
    const id = editor.doc.feeding.sources[0].id;
    fire(source(), id);
    expect(el(1).source).toBe(id);
    await editor.updateComplete;
    fire(source(), "");
    expect(el(1).source).toBeNull();
    await editor.updateComplete;
    fire(check(), false, "change", "checked");
    expect(el(1).roles).toEqual([]);
    // a marker is named as such
    editor._selection = { type: "element", id: el(2).id };
    await editor.updateComplete;
    expect(props().querySelector("legend").textContent.trim()).toBe("Marker");
  });
});

describe("scene editor: lights panel", () => {
  it("edits the lamps, the flow and the sand band", async () => {
    const { doc, front } = existing_doc();
    doc.waters.main.lights.push({ entity_id: "light.room", x: 0.7 });
    doc.waters.main.flow = ["number.pump"];
    const editor = await open_on(doc, "lights", front);
    const root = editor.shadowRoot;
    const water = () => editor.doc.waters.main;
    const lamps = fieldset(root, "Lamps");
    expect(lamps.textContent).toContain("light.room");
    fire(lamps.querySelector("input[type=range]"), "0.25");
    expect(water().lights[0].x).toBe(0.25);
    await editor.updateComplete;
    (lamps.querySelector("button.icon") as HTMLButtonElement).click();
    expect(water().lights).toEqual([{ entity_id: "light.room", x: 0.7 }]);
    await editor.updateComplete;
    const add = lamps.querySelector("select") as HTMLSelectElement;
    fire(add, "");
    expect(water().lights).toHaveLength(1);
    fire(add, "device|led");
    expect(water().lights.at(-1)).toMatchObject({ device_id: "led" });
    expect(add.value).toBe("");
    await editor.updateComplete;
    fire(add, "entity|light.led_kelvin");
    expect(water().lights.at(-1)).toMatchObject({
      entity_id: "light.led_kelvin",
    });
    await editor.updateComplete;
    // flow
    const flow = fieldset(root, "Flow (pumps)");
    const input = flow.querySelector("input") as HTMLInputElement;
    fire(input, "  ");
    expect(water().flow).toEqual(["number.pump"]);
    fire(input, "fan.wave");
    expect(water().flow).toEqual(["number.pump", "fan.wave"]);
    expect(input.value).toBe("");
    await editor.updateComplete;
    (flow.querySelector("button.icon") as HTMLButtonElement).click();
    expect(water().flow).toEqual(["fan.wave"]);
    await editor.updateComplete;
    // sand band
    const band = [...root.querySelectorAll("input[type=range]")].at(
      -1,
    ) as HTMLInputElement;
    fire(band, "0.2");
    expect(water().sand_band).toBe(0.2);
  });

  it("lists no lamp device without devices, nothing for a missing water", async () => {
    const { doc, front } = existing_doc();
    const hass = make_hass(doc);
    hass.devices = undefined;
    const editor = await open_on(doc, "lights", front, hass);
    const add = fieldset(editor.shadowRoot, "Lamps").querySelector("select")!;
    expect([...add.options].some((o) => o.value.startsWith("device|"))).toBe(
      false,
    );
    editor._water_id = "ghost";
    await editor.updateComplete;
    expect(fieldset(editor.shadowRoot, "Lamps")).toBeUndefined();
    editor._tab = "livestock";
    await editor.updateComplete;
    expect(fieldset(editor.shadowRoot, "Corals")).toBeUndefined();
  });
});

describe("scene editor: livestock panel", () => {
  it("edits the inventory lines", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "livestock", front);
    const root = editor.shadowRoot;
    const lines = () => editor.doc.waters.main.livestock;
    const card = (i: number) =>
      fieldset(root, "Fish and invertebrates").querySelectorAll(".card")[i];
    const inputs = (i: number) =>
      [...card(i).querySelectorAll("input")] as HTMLInputElement[];
    fire(inputs(0)[0], "x");
    expect(lines()[0].count).toBe(0);
    await editor.updateComplete;
    // the free text fish has no size: defaults
    fire(inputs(1)[1], "x");
    expect(lines()[1].size_cm).toEqual([1, 5]);
    await editor.updateComplete;
    fire(inputs(1)[2], "x");
    expect(lines()[1].size_cm).toEqual([1, 5]);
    await editor.updateComplete;
    fire(inputs(1)[2], "9");
    expect(lines()[1].size_cm).toEqual([1, 9]);
    await editor.updateComplete;
    fire(inputs(1)[3], "Shy");
    expect(lines()[1].note).toBe("Shy");
    await editor.updateComplete;
    // a line without size, without species: size max keeps 1 as min
    editor.change(
      ops.update_line(editor.doc, "main", lines()[1].id, { size_cm: null }),
    );
    await editor.updateComplete;
    fire(inputs(1)[2], "7");
    expect(lines()[1].size_cm).toEqual([1, 7]);
    await editor.updateComplete;
    (card(1).querySelector("button.icon") as HTMLButtonElement).click();
    expect(lines()).toHaveLength(1);
  });

  it("adds a fish with the custom choice of the picker", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "livestock", front);
    const root = editor.shadowRoot;
    const input = root.querySelector(".picker input") as HTMLInputElement;
    input.dispatchEvent(new Event("focus"));
    fire(input, "Blue tang", "input");
    await editor.updateComplete;
    const custom = root.querySelector(".pick.custom") as HTMLElement;
    const down = new MouseEvent("mousedown", { cancelable: true });
    custom.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    custom.click();
    expect(editor.doc.waters.main.livestock.at(-1)).toMatchObject({
      species: "Blue tang",
      size_cm: null,
    });
    expect(editor._picker).toBeNull();
  });

  it("edits the corals", async () => {
    const { doc, front } = existing_doc();
    const editor = await open_on(doc, "livestock", front);
    const root = editor.shadowRoot;
    const coral = () => editor.doc.waters.main.corals[0];
    const card = () =>
      fieldset(root, "Corals").querySelector(".card") as HTMLElement;
    card().click();
    expect(editor._selection).toEqual({
      type: "coral",
      id: coral().id,
      water: "main",
    });
    await editor.updateComplete;
    expect(card().classList.contains("current")).toBe(true);
    fire(card().querySelector("input[type=number]"), "x");
    expect(coral().size_cm).toBe(10);
    await editor.updateComplete;
    fire(card().querySelector("select"), "front");
    expect(coral().z).toBe(ops.DEPTHS.front);
    await editor.updateComplete;
    const colours = card().querySelectorAll("input[type=color]");
    expect(colours.length).toBeGreaterThan(1);
    fire(colours[1], "#123456");
    expect(coral().palette[1]).toBe("#123456");
    expect(coral().palette).toHaveLength(colours.length);
    await editor.updateComplete;
    (card().querySelector(".palette button") as HTMLButtonElement).click();
    expect(coral().palette).toEqual([]);
    await editor.updateComplete;
    (card().querySelector("button.icon") as HTMLButtonElement).click();
    expect(editor.doc.waters.main.corals).toHaveLength(0);
  });
});

describe("scene editor: feeding panel", () => {
  it("edits the sources and the timings, and tests a feeding", async () => {
    const { doc, front } = existing_doc();
    doc.cloud = { provider: "redsea", uid: "aq1" };
    const hass = make_hass(doc);
    const editor = await open_on(doc, "feeding", front, hass);
    const root = editor.shadowRoot;
    const sources = () => editor.doc.feeding.sources;
    const kind = () =>
      root.querySelector("fieldset .line select") as HTMLSelectElement;
    fire(kind(), "feeder");
    expect(sources()[0].kind).toBe("feeder");
    await editor.updateComplete;
    fire(kind(), "");
    expect(sources()[0].kind).toBeNull();
    await editor.updateComplete;
    // the cloud's other feeding entity is suggested
    button(root, "+ switch.feeding_2").click();
    expect(sources().at(-1)).toMatchObject({
      entity_id: "switch.feeding_2",
      kind: "shortcut",
    });
    await editor.updateComplete;
    expect(root.querySelector("button.suggestion")).toBeNull();
    const add = root.querySelector(
      "input[list=feed_entities]",
    ) as HTMLInputElement;
    fire(add, " ");
    expect(sources()).toHaveLength(2);
    fire(add, "button.feed");
    expect(sources()).toHaveLength(3);
    await editor.updateComplete;
    (
      root.querySelector("fieldset .line button.icon") as HTMLButtonElement
    ).click();
    expect(sources()).toHaveLength(2);
    await editor.updateComplete;
    const [duration, dedup] = [
      ...root.querySelectorAll(".row3 input"),
    ] as HTMLInputElement[];
    fire(duration, "x");
    expect(editor.doc.feeding.duration_s).toBe(45);
    await editor.updateComplete;
    fire(dedup, "9999");
    expect(editor.doc.feeding.dedup_s).toBe(3600);
    await editor.updateComplete;
    fire(dedup, "x");
    expect(editor.doc.feeding.dedup_s).toBe(0);
    await editor.updateComplete;
    button(root, "Test a feeding").click();
    expect(hass.callService).toHaveBeenCalledWith("reeftank", "feed", {
      aquarium: "a1b2",
    });
  });

  it("offers no test feeding for a new aquarium", async () => {
    const editor = await open(make_hass({}), null);
    editor._tab = "feeding";
    await editor.updateComplete;
    expect(button(editor.shadowRoot, "Test a feeding")).toBeUndefined();
  });
});

describe("scene editor: header and tabs", () => {
  it("saves, closes, switches tabs and views from the header", async () => {
    const { doc, front, cabinet } = existing_doc();
    doc.views[cabinet].name = "";
    const hass = make_hass(doc);
    const closed = vi.fn();
    const editor = await open(hass, "a1b2", closed);
    const root = editor.shadowRoot;
    // tabs
    editor._tool = "decor";
    editor._drawing = [[0.1, 0.1]];
    button(root, "Light & flow").click();
    expect(editor._tab).toBe("lights");
    expect(editor._tool).toBe("select");
    expect(editor._drawing).toEqual([]);
    await editor.updateComplete;
    // the view choice of the other tabs, unnamed views by id
    const select = root.querySelector(".panel select") as HTMLSelectElement;
    expect([...select.options].map((o) => o.textContent!.trim())).toEqual([
      "Front",
      cabinet,
    ]);
    editor._selection = { type: "decor", id: "x" };
    fire(select, cabinet);
    expect(editor._view_id).toBe(cabinet);
    expect(editor._selection).toBeNull();
    // save
    editor.change({ ...editor.doc, name: "Renamed" });
    await editor.updateComplete;
    button(root, "Save").click();
    await flush();
    expect(editor.dirty).toBe(false);
    // close
    (root.querySelector('button[title="Close"]') as HTMLButtonElement).click();
    expect(closed).toHaveBeenCalledWith("a1b2");
    expect(document.querySelector(`.${SCENE_DIALOG_CLASS}`)).toBeNull();
    void front;
  });
});
