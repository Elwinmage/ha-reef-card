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
import { reset_catalog_cache } from "../src/aquarium/api";
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
        case "reeftank/aquarium/list":
          return [
            {
              id: "a1b2",
              name: "Reefer",
              revision: 3,
              render_level: "full",
              views: 2,
            },
          ];
        default:
          return null;
      }
    }),
    fetchWithAuth: vi.fn(async () => ({
      ok: true,
      json: async () => ({
        path: "a1b2/new.webp",
        url: "/x",
        width: 10,
        height: 5,
      }),
    })),
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

describe("Lovelace editor", () => {
  it("lists aquariums and emits the configuration", async () => {
    const { doc } = existing_doc();
    const hass = make_hass(doc);
    const editor: any = document.createElement("reef-aquarium-card-editor");
    editor.setConfig({ aquarium: "a1b2" });
    document.body.appendChild(editor);
    editor.hass = hass;
    await flush();
    await flush();
    await editor.updateComplete;
    const changed = vi.fn();
    editor.addEventListener("config-changed", (e: any) =>
      changed(e.detail.config),
    );
    const selects = editor.shadowRoot.querySelectorAll("select");
    expect(selects).toHaveLength(3);
    selects[1].value = "static";
    selects[1].dispatchEvent(new Event("change"));
    expect(changed).toHaveBeenLastCalledWith({
      type: "custom:reef-aquarium-card",
      aquarium: "a1b2",
      render: "static",
    });
    selects[0].value = "";
    selects[0].dispatchEvent(new Event("change"));
    expect(changed.mock.calls.at(-1)[0].aquarium).toBeUndefined();
  });

  it("explains a missing integration", async () => {
    const hass = make_hass({});
    hass.config.components = [];
    const editor: any = document.createElement("reef-aquarium-card-editor");
    editor.setConfig({});
    document.body.appendChild(editor);
    editor.hass = hass;
    await editor.updateComplete;
    expect(editor.shadowRoot.textContent).toContain("ReefTank");
  });

  it("opens the scene editor", async () => {
    const { doc } = existing_doc();
    const hass = make_hass(doc);
    const editor: any = document.createElement("reef-aquarium-card-editor");
    editor.setConfig({ aquarium: "a1b2" });
    document.body.appendChild(editor);
    editor.hass = hass;
    await flush();
    await editor.updateComplete;
    const buttons = editor.shadowRoot.querySelectorAll("button");
    buttons[1].dispatchEvent(new MouseEvent("click"));
    await flush();
    const scene: any = document.querySelector("reef-aquarium-scene-editor");
    expect(scene).not.toBeNull();
    scene.close(true);
    await flush();
    expect(document.querySelector("reef-aquarium-scene-editor")).toBeNull();
  });
});

describe("scene editor", () => {
  it("creates an aquarium from the cloud and saves it", async () => {
    const hass = make_hass({});
    const closed = vi.fn();
    const editor = await open(hass, null, closed);
    expect(editor.doc.name).toBe("My aquarium");
    editor._apply_cloud(editor._clouds[0]);
    expect(editor.doc.cloud).toEqual({ provider: "redsea", uid: "aq1" });
    expect(editor.doc.name).toBe("Cloud reefer");
    expect(editor.doc.waters.main.lights).toEqual([
      { device_id: "led", x: 0.5 },
    ]);
    expect(editor.doc.feeding.sources).toHaveLength(2);
    expect(editor.dirty).toBe(true);
    expect(await editor.save()).toBe(true);
    const sent = hass.callWS.mock.calls.find(
      (c: any) => c[0].type === "reeftank/aquarium/save",
    )[0];
    expect(sent.expected_revision).toBeUndefined();
    expect(editor.dirty).toBe(false);
    editor.close();
    expect(closed).toHaveBeenCalledWith(editor.doc.id);
  });

  it("renders every tab of an existing aquarium", async () => {
    const { doc } = existing_doc();
    const editor = await open(make_hass(doc), "a1b2");
    for (const tab of [
      "aquarium",
      "views",
      "elements",
      "lights",
      "livestock",
      "feeding",
    ]) {
      editor._tab = tab;
      await editor.updateComplete;
      expect(
        editor.shadowRoot.querySelector(".panel").children.length,
      ).toBeGreaterThan(0);
    }
    editor._tab = "elements";
    editor._selection = {
      type: "element",
      id: editor.doc.views[editor._view_id].elements[2].id,
    };
    await editor.updateComplete;
    expect(editor.shadowRoot.querySelector("fieldset.props")).not.toBeNull();
    editor._tab = "livestock";
    await editor.updateComplete;
    expect(editor.shadowRoot.textContent).toContain("Demo damselfish");
    expect(editor.shadowRoot.textContent).toContain("generic fish");
  });

  it("draws decor, lasso and hotspots on the stage, with undo", async () => {
    const { doc, front, cabinet } = existing_doc();
    const editor = await open(make_hass(doc), "a1b2");
    editor._tab = "views";
    editor._view_id = front;
    await editor.updateComplete;
    const stage = editor.shadowRoot.querySelector(".stage");
    const decor_before = editor.doc.views[front].decor.length;

    editor._tool = "decor";
    editor._depth = "back";
    for (const [x, y] of [
      [100, 100],
      [300, 100],
      [300, 300],
    ])
      stage.dispatchEvent(pointer("pointerdown", x, y));
    expect(editor._drawing).toHaveLength(3);
    stage.dispatchEvent(pointer("pointerdown", 101, 101)); // near the first point: closes
    expect(editor.doc.views[front].decor).toHaveLength(decor_before + 1);
    expect(editor.doc.views[front].decor.at(-1).z).toBe(0.8);

    editor._tool = "lasso";
    stage.dispatchEvent(pointer("pointerdown", 500, 100));
    for (let i = 0; i < 30; i++)
      stage.dispatchEvent(
        pointer(
          "pointermove",
          500 + 100 * Math.cos(i / 5),
          200 + 100 * Math.sin(i / 5),
        ),
      );
    stage.dispatchEvent(pointer("pointerup", 500, 100));
    expect(editor.doc.views[front].decor).toHaveLength(decor_before + 2);

    editor._tool = "hotspot";
    editor._hotspot_target = cabinet;
    for (const [x, y] of [
      [10, 10],
      [50, 10],
      [50, 50],
    ])
      stage.dispatchEvent(pointer("pointerdown", x, y));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(editor.doc.views[front].hotspots).toHaveLength(2);

    editor.undo();
    expect(editor.doc.views[front].hotspots).toHaveLength(1);
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "z", ctrlKey: true }),
    );
    expect(editor.doc.views[front].decor).toHaveLength(decor_before + 1);

    // select + delete
    editor._selection = {
      type: "decor",
      id: editor.doc.views[front].decor[0].id,
    };
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));
    expect(editor.doc.views[front].decor).toHaveLength(decor_before);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(editor._selection).toBeNull();
  });

  it("moves corners, elements, corals and lamps", async () => {
    const { doc, front } = existing_doc();
    const editor = await open(make_hass(doc), "a1b2");
    editor._view_id = front;
    editor._tab = "views";
    editor._tool = "region";
    await editor.updateComplete;
    const root = editor.shadowRoot;
    const stage = root.querySelector(".stage");
    root
      .querySelector(".handle.corner")
      .dispatchEvent(pointer("pointerdown", 100, 50));
    stage.dispatchEvent(pointer("pointermove", 50, 25));
    stage.dispatchEvent(pointer("pointerup", 50, 25));
    expect(editor.doc.views[front].regions[0].quad[0]).toEqual([0.05, 0.05]);
    expect(editor._history.length).toBe(1);

    editor._tab = "elements";
    await editor.updateComplete;
    root.querySelector(".el").dispatchEvent(pointer("pointerdown", 400, 25));
    stage.dispatchEvent(pointer("pointermove", 600, 250));
    stage.dispatchEvent(pointer("pointerup", 600, 250));
    expect(editor.doc.views[front].elements[0].pos).toEqual([0.6, 0.5]);

    editor._tab = "livestock";
    await editor.updateComplete;
    root
      .querySelector(".coral")
      .dispatchEvent(pointer("pointerdown", 500, 275));
    stage.dispatchEvent(pointer("pointermove", 300, 300));
    stage.dispatchEvent(pointer("pointerup", 300, 300));
    expect(editor.doc.waters.main.corals[0].pos).toEqual([0.3, 0.6]);
    editor._tool = "coral";
    editor._coral_species = "demo_euphyllia";
    stage.dispatchEvent(pointer("pointerdown", 700, 250));
    expect(editor.doc.waters.main.corals).toHaveLength(2);

    editor._tab = "lights";
    editor._tool = "select";
    await editor.updateComplete;
    root.querySelector(".lamp").dispatchEvent(pointer("pointerdown", 400, 50));
    stage.dispatchEvent(pointer("pointermove", 820, 50));
    stage.dispatchEvent(pointer("pointerup", 820, 50));
    expect(editor.doc.waters.main.lights[0].x).toBeCloseTo(0.9, 2);
  });

  it("draws the sand line, the decor and the homes", async () => {
    const { doc, front } = existing_doc();
    const editor = await open(make_hass(doc), "a1b2");
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
    editor._view_id = front;
    editor._tab = "views";
    await editor.updateComplete;
    const root = editor.shadowRoot;
    const stage = root.querySelector(".stage");
    const button = (text: string) =>
      [...root.querySelectorAll("button")].find(
        (b: any) => b.textContent.trim() === text,
      ) as HTMLButtonElement;
    const sand = () => editor.doc.views[front].regions[0].sand;

    // sand line: from the sand band, then moved
    button("Draw the sand line").click();
    await editor.updateComplete;
    expect(editor._tool).toBe("sand");
    expect(sand()[0][1]).toBeCloseTo(0.57);
    expect(root.querySelectorAll(".handle.sand")).toHaveLength(2);
    expect(root.querySelector("polyline.sand.current")).not.toBeNull();
    root
      .querySelector(".handle.sand")
      .dispatchEvent(pointer("pointerdown", 100, 285));
    stage.dispatchEvent(pointer("pointermove", 100, 250));
    stage.dispatchEvent(pointer("pointerup", 100, 250));
    expect(sand()[0]).toEqual([0.1, 0.5]);
    // a click adds a bump, a double click on a point removes it
    stage.dispatchEvent(pointer("pointerdown", 500, 200));
    stage.dispatchEvent(pointer("pointerup", 500, 200));
    expect(sand()).toHaveLength(3);
    expect(sand()[1]).toEqual([0.5, 0.4]);
    await editor.updateComplete;
    expect(root.querySelectorAll(".handle.sand")).toHaveLength(3);
    root
      .querySelectorAll(".handle.sand")[1]
      .dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect(sand()).toHaveLength(2);
    button("Edit the sand line").click(); // kept as it is
    expect(sand()[0]).toEqual([0.1, 0.5]);
    // the back wall line: from the front one, carried to the back
    const back = () => editor.doc.views[front].regions[0].sand_back;
    button("Draw the sand line").click();
    await editor.updateComplete;
    expect(editor._sand_line).toBe("sand_back");
    expect(back()).toHaveLength(sand().length);
    expect(back()[0][1]).toBeLessThan(sand()[0][1]);
    expect(root.querySelectorAll(".handle.sand.back")).toHaveLength(2);
    expect(root.querySelector("polyline.sand.back")).not.toBeNull();
    stage.dispatchEvent(pointer("pointerdown", 500, 150));
    stage.dispatchEvent(pointer("pointerup", 500, 150));
    expect(back()).toHaveLength(3);
    await editor.updateComplete;
    root
      .querySelectorAll(".handle.sand.back")[1]
      .dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect(back()).toHaveLength(2);
    (
      root
        .querySelectorAll("fieldset")[2]
        .querySelectorAll("button.danger")[1] as HTMLButtonElement
    ).click();
    expect(back()).toEqual([]);
    await editor.updateComplete;
    const sand_set = root.querySelectorAll("fieldset")[2];
    (sand_set.querySelector("button.danger") as HTMLButtonElement).click();
    expect(sand()).toEqual([]);
    expect(editor._tool).toBe("select");

    // decor drawn instead of the photo, with the catalog's textures
    editor._catalog = {
      ...catalog,
      textures: [
        {
          id: "live_rock",
          source: "pack",
          role: "rock",
          image: "/r.webp",
          scale_cm: 30,
          names: { en: "Live rock" },
        },
      ],
    };
    await editor.updateComplete;
    const backdrop_set = root.querySelectorAll("fieldset")[3];
    const [rock, sand_select] = [
      ...backdrop_set.querySelectorAll("select"),
    ] as HTMLSelectElement[];
    expect(sand_select.textContent).toContain("Built-in");
    expect(rock.textContent).toContain("Live rock");
    const [drawn_box] = [
      ...backdrop_set.querySelectorAll("input[type=checkbox]"),
    ] as HTMLInputElement[];
    drawn_box.checked = true;
    drawn_box.dispatchEvent(new Event("change"));
    expect(editor.doc.views[front].regions[0].drawn).toBe(true);
    rock.value = "live_rock";
    rock.dispatchEvent(new Event("change"));
    expect(editor.doc.views[front].backdrop).toEqual({
      mode: "photo",
      rock: "live_rock",
    });
    sand_select.value = "";
    sand_select.dispatchEvent(new Event("change"));
    expect(editor.doc.views[front].backdrop.sand).toBeNull();
    await editor.updateComplete;
    const preview = [
      ...root
        .querySelectorAll("fieldset")[3]
        .querySelectorAll("input[type=checkbox]"),
    ].at(-1) as HTMLInputElement;
    preview.checked = true;
    preview.dispatchEvent(new Event("change"));
    await editor.updateComplete;
    expect(root.querySelector("canvas.backdrop")).not.toBeNull();
    editor._paint_preview();
    editor._preview = false;
    await editor.updateComplete;
    editor._paint_preview(); // no canvas: nothing to do

    // homes: placed on the stage, moved, put back, removed
    editor._tab = "livestock";
    await editor.updateComplete;
    const line = () => editor.doc.waters.main.livestock[0];
    const place = root.querySelector(".home-row button") as HTMLButtonElement;
    place.click();
    await editor.updateComplete;
    expect(editor._tool).toBe("home");
    expect(root.textContent).toContain("Click where they live");
    (root.querySelector(".home-row button") as HTMLButtonElement).click();
    expect(editor._tool).toBe("select");
    await editor.updateComplete;
    place.click();
    stage.dispatchEvent(pointer("pointerdown", 500, 250));
    expect(line().home).toEqual([0.5, 0.8, 0.5]);
    expect(editor._tool).toBe("select");
    await editor.updateComplete;
    root.querySelector(".home").dispatchEvent(pointer("pointerdown", 500, 250));
    stage.dispatchEvent(pointer("pointermove", 300, 200));
    stage.dispatchEvent(pointer("pointerup", 300, 200));
    expect(line().home).toEqual([0.25, 0.6, 0.5]);
    await editor.updateComplete;
    const depth = root.querySelector(".home-row select") as HTMLSelectElement;
    depth.value = "back";
    depth.dispatchEvent(new Event("change"));
    expect(line().home[2]).toBe(0.8);
    await editor.updateComplete;
    (root.querySelector(".home-row button.icon") as HTMLButtonElement).click();
    expect(line().home).toBeNull();

    // a water without outline on this view
    editor._place_home("sump", "x", [0.5, 0.5]);
    expect(editor._message.kind).toBe("error");
    expect(editor._default_sand("sump")).toBeNull();
    editor._water_id = "sump";
    editor._tab = "views";
    await editor.updateComplete;
    expect(root.textContent).not.toContain("Draw the sand line");
  });

  it("drops a device of the tree onto the picture", async () => {
    const { doc, front } = existing_doc();
    doc.cloud = { provider: "redsea", uid: "aq1" };
    const editor = await open(make_hass(doc), "a1b2");
    editor._view_id = front;
    editor._tab = "elements";
    await editor.updateComplete;
    const before = editor.doc.views[front].elements.length;
    const row = editor.shadowRoot.querySelector(".tree-row.device");
    row.dispatchEvent(pointer("pointerdown", 1200, 100));
    window.dispatchEvent(pointer("pointermove", 1100, 100));
    expect(editor._drag.type).toBe("new");
    window.dispatchEvent(pointer("pointerup", 250, 250));
    expect(editor.doc.views[front].elements).toHaveLength(before + 1);
    // dropped outside: nothing
    row.dispatchEvent(pointer("pointerdown", 1200, 100));
    window.dispatchEvent(pointer("pointerup", 2000, 2000));
    expect(editor.doc.views[front].elements).toHaveLength(before + 1);
    // entities show once their device is open
    expect(editor.shadowRoot.querySelector(".tree-row.entity")).toBeNull();
    row.dispatchEvent(new MouseEvent("click"));
    await editor.updateComplete;
    // the "+" button adds at the centre
    editor.shadowRoot
      .querySelector(".tree-row.entity .add")
      .dispatchEvent(new MouseEvent("click"));
    expect(editor.doc.views[front].elements.at(-1).pos).toEqual([0.5, 0.5]);
  });

  it("lists the devices by floor and area, the aquarium's first", async () => {
    const { doc, front } = existing_doc();
    doc.cloud = { provider: "redsea", uid: "aq1" };
    const editor = await open(make_hass(doc), "a1b2");
    editor._view_id = front;
    editor._tab = "elements";
    await editor.updateComplete;
    const root = editor.shadowRoot;
    const names = () =>
      [...root.querySelectorAll(".tree-row .name")].map((n: any) =>
        n.textContent.trim(),
      );
    // the aquarium stands with its cloud devices: floor and area open
    expect(names()).toEqual(["Ground floor", "Living room", "RSLED-1"]);
    expect(root.querySelector("label.switch")).not.toBeNull();
    // all areas, the others closed
    editor._all_areas = true;
    await editor.updateComplete;
    expect(names()).toEqual([
      "Ground floor",
      "Cellar",
      "Living room",
      "RSLED-1",
    ]);
    // toggling an area
    const cellar = [...root.querySelectorAll(".tree-row.area")].find((r: any) =>
      r.textContent.includes("Cellar"),
    ) as HTMLElement;
    cellar.click();
    await editor.updateComplete;
    expect(names()).toContain("Probe");
    cellar.click();
    await editor.updateComplete;
    expect(names()).not.toContain("Probe");
    // a search opens everything it finds
    editor._search = "temp";
    await editor.updateComplete;
    expect(names()).toEqual(["Ground floor", "Cellar", "Probe", "Temperature"]);
    editor._search = "zzz";
    await editor.updateComplete;
    expect(root.querySelector(".tree .hint")).not.toBeNull();
    // a missing brand icon falls back to the mdi icon
    editor._search = "";
    await editor.updateComplete;
    const brand = root.querySelector("img.brand") as HTMLImageElement;
    brand.dispatchEvent(new Event("error"));
    await editor.updateComplete;
    expect(root.querySelector("img.brand")).toBeNull();
  });

  it("shows every area when the aquarium's place is unknown", async () => {
    const { doc, front } = existing_doc();
    const hass = make_hass(doc);
    delete hass.devices.led.area_id;
    const editor = await open(hass, "a1b2");
    editor._view_id = front;
    editor._tab = "elements";
    await editor.updateComplete;
    const root = editor.shadowRoot;
    const names = () =>
      [...root.querySelectorAll(".tree-row .name")].map((n: any) =>
        n.textContent.trim(),
      );
    expect(root.querySelector("label.switch")).toBeNull();
    // everything closed
    expect(names()).toEqual(["Ground floor", "Unassigned"]);
  });

  it("places the aquarium by its own device", async () => {
    const { doc, front } = existing_doc();
    const hass = make_hass(doc);
    hass.devices.tank = {
      id: "tank",
      name: "Reefer",
      identifiers: [["reeftank", "a1b2"]],
      area_id: "cellar",
    };
    const editor = await open(hass, "a1b2");
    editor._view_id = front;
    editor._tab = "elements";
    await editor.updateComplete;
    expect(
      [...editor.shadowRoot.querySelectorAll(".tree-row .name")].map((n: any) =>
        n.textContent.trim(),
      ),
    ).toEqual(["Ground floor", "Cellar", "Probe", "Reefer"]);
  });

  it("picks species with their thumbnails", async () => {
    const { doc } = existing_doc();
    const hass = make_hass(doc);
    const fox = {
      ...catalog.fish[0],
      id: "siganus_vulpinus",
      thumbnail: "/t.webp",
      names: { en: "Foxface rabbitfish" },
      scientific: "Siganus vulpinus",
    };
    hass.callWS = vi.fn(async (msg: any) =>
      msg.type === "reeftank/catalog"
        ? { ...catalog, fish: [...catalog.fish, fox] }
        : msg.type === "reeftank/aquarium/get"
          ? { document: structuredClone(doc), entities: {}, images_url: "/x" }
          : [],
    );
    const editor = await open(hass, "a1b2");
    editor._tab = "livestock";
    await editor.updateComplete;
    const root = editor.shadowRoot;
    const lines = () => editor.doc.waters.main.livestock.length;
    const before = lines();
    const input = root.querySelector(".picker input") as HTMLInputElement;
    input.dispatchEvent(new Event("focus"));
    await editor.updateComplete;
    expect(root.querySelectorAll(".picker-list .pick")).toHaveLength(2);
    // search by name
    input.value = "fox";
    input.dispatchEvent(new Event("input"));
    await editor.updateComplete;
    const picks = root.querySelectorAll(".picker-list .pick");
    expect(picks).toHaveLength(2); // the species, and "inventory only"
    expect(picks[0].querySelector("img.thumb").getAttribute("src")).toBe(
      "/t.webp",
    );
    // the Latin name replaces the id, and can be searched
    expect(picks[0].querySelector("small i").textContent).toBe(
      "Siganus vulpinus",
    );
    input.value = "VULPINUS";
    input.dispatchEvent(new Event("input"));
    await editor.updateComplete;
    expect(root.querySelectorAll(".picker-list .pick")).toHaveLength(2);
    picks[0].dispatchEvent(new MouseEvent("mousedown"));
    (picks[0] as HTMLElement).click();
    await editor.updateComplete;
    expect(lines()).toBe(before + 1);
    expect(editor.doc.waters.main.livestock.at(-1).species).toBe(
      "siganus_vulpinus",
    );
    expect(
      [...root.querySelectorAll(".card .latin")].map((n: any) => n.textContent),
    ).toContain("Siganus vulpinus");
    expect(root.querySelector(".picker-list")).toBeNull();
    // a free name with Enter: a generic fish
    const again = root.querySelector(".picker input") as HTMLInputElement;
    again.dispatchEvent(new Event("focus"));
    again.value = "Mystery tang";
    again.dispatchEvent(new Event("input"));
    await editor.updateComplete;
    again.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    await editor.updateComplete;
    expect(editor.doc.waters.main.livestock.at(-1).species).toBe(
      "Mystery tang",
    );
    // Enter on the only match picks it, Escape and blur close
    again.dispatchEvent(new Event("focus"));
    again.value = "damsel";
    again.dispatchEvent(new Event("input"));
    await editor.updateComplete;
    again.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(editor.doc.waters.main.livestock.at(-1).species).toBe(
      "demo_damselfish",
    );
    again.dispatchEvent(new Event("focus"));
    again.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    again.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    again.dispatchEvent(new Event("blur"));
    await editor.updateComplete;
    expect(editor._picker).toBeNull();
    // nothing typed + Enter: nothing added
    const count = lines();
    again.dispatchEvent(new Event("focus"));
    again.value = "";
    again.dispatchEvent(new Event("input"));
    again.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(lines()).toBe(count);

    // corals: picking sets the species to place and the tool
    const coral_input = root.querySelectorAll(
      ".picker input",
    )[1] as HTMLInputElement;
    coral_input.dispatchEvent(new Event("focus"));
    coral_input.value = "zzz";
    coral_input.dispatchEvent(new Event("input"));
    await editor.updateComplete;
    expect(root.textContent).toContain("Nothing found");
    coral_input.value = "";
    coral_input.dispatchEvent(new Event("input"));
    await editor.updateComplete;
    (root.querySelector(".picker-list .pick") as HTMLElement).click();
    await editor.updateComplete;
    expect(editor._coral_species).toBe("demo_euphyllia");
    expect(editor._tool).toBe("coral");
    expect(root.querySelector(".line.chosen")).not.toBeNull();
  });

  it("draws thumbnails from the atlas when there is none", () => {
    const host = document.createElement("div");
    render(species_thumb(catalog.fish[0] as any, "fish"), host);
    const sprite = host.querySelector(".thumb.sprite") as HTMLElement;
    expect(sprite.getAttribute("style")).toContain('url("/f.webp")');
    expect(sprite.getAttribute("style")).toContain("width:48px");
    render(species_thumb(catalog.corals[0] as any, "coral"), host);
    expect(host.querySelector(".thumb.icon")).not.toBeNull(); // no clip
    render(
      species_thumb(
        {
          ...catalog.corals[0],
          clips: { day: { from: 9, to: 9, fps: 1, loop: true } },
        } as any,
        "coral",
      ),
      host,
    );
    expect(host.querySelector(".thumb.sprite").getAttribute("style")).toContain(
      'url("/s.webp")',
    );
    render(species_thumb(undefined, "fish"), host);
    expect(host.querySelector(".thumb.icon")).not.toBeNull();
  });

  it("explains an empty catalog and follows the installs", async () => {
    const { doc } = existing_doc();
    const hass = make_hass(doc);
    let pack = { version: null as string | null, updating: true };
    let fish: any[] = [];
    let installed: ((msg: any) => void) | null = null;
    hass.callWS = vi.fn(async (msg: any) =>
      msg.type === "reeftank/catalog"
        ? { fish, corals: [], presets: [], pack }
        : msg.type === "reeftank/aquarium/get"
          ? { document: structuredClone(doc), entities: {}, images_url: "/x" }
          : [],
    );
    hass.connection = {
      subscribeMessage: vi.fn(async (cb: any) => {
        installed = cb;
        return () => (installed = null);
      }),
    };
    const editor = await open(hass, "a1b2");
    editor._tab = "livestock";
    await editor.updateComplete;
    expect(editor.shadowRoot.querySelector(".notice").textContent).toContain(
      "downloading",
    );
    editor._catalog = {
      ...editor._catalog,
      pack: { version: null, updating: false },
    };
    await editor.updateComplete;
    expect(editor.shadowRoot.querySelector(".notice").textContent).toContain(
      "update.reeftank_catalog",
    );
    // a release is installed: the catalog is reloaded
    pack = { version: "2026.10.0", updating: false };
    fish = [catalog.fish[0]];
    installed!({ version: "2026.10.0" });
    await new Promise((r) => setTimeout(r, 0));
    await editor.updateComplete;
    expect(editor.shadowRoot.querySelector(".notice")).toBeNull();
    editor.close(true);
    expect(installed).toBeNull();
  });

  it("uploads a picture", async () => {
    const { doc, front } = existing_doc();
    const hass = make_hass(doc);
    const editor = await open(hass, "a1b2");
    editor._view_id = front;
    const input = { files: [new File(["x"], "p.jpg")], value: "p.jpg" };
    await editor._upload({ target: input });
    expect(editor.doc.views[front].image).toBe("a1b2/new.webp");
    expect(input.value).toBe("");
    hass.fetchWithAuth = vi.fn(async () => ({
      ok: false,
      status: 415,
      statusText: "",
      json: async () => ({ message: "unsupported_format" }),
    }));
    await editor._upload({
      target: { files: [new File(["x"], "p.gif")], value: "" },
    });
    expect(editor._message.text).toContain("not a supported picture");
  });

  it("reports a conflict and reloads", async () => {
    const { doc } = existing_doc();
    const hass = make_hass(doc, (msg) =>
      msg.type === "reeftank/aquarium/save"
        ? Promise.reject({ code: "conflict", message: "" })
        : undefined,
    );
    const editor = await open(hass, "a1b2");
    editor.change({ ...editor.doc, name: "Renamed" });
    expect(await editor.save()).toBe(false);
    const sent = hass.callWS.mock.calls.find(
      (c: any) => c[0].type === "reeftank/aquarium/save",
    )[0];
    expect(sent.expected_revision).toBe(3);
    expect(editor._message.text).toContain("changed elsewhere");
    await editor._reload();
    expect(editor.doc.name).toBe("Reefer");
  });

  it("opens in its own modal dialog, above the card editor", async () => {
    const { doc } = existing_doc();
    const proto: any = HTMLDialogElement.prototype;
    const saved = proto.showModal;
    const show = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    proto.showModal = show;
    try {
      const closed = vi.fn();
      const editor = await open(make_hass(doc), "a1b2", closed);
      const dialog = editor.parentElement as HTMLDialogElement;
      expect(dialog.tagName).toBe("DIALOG");
      expect(dialog.classList.contains(SCENE_DIALOG_CLASS)).toBe(true);
      expect(show).toHaveBeenCalledTimes(1);
      // Escape does not close the dialog behind the editor's back
      const cancel = new Event("cancel", { cancelable: true });
      dialog.dispatchEvent(cancel);
      expect(cancel.defaultPrevented).toBe(true);
      // closed anyway by the browser: opened again
      dialog.dispatchEvent(new Event("close"));
      expect(show).toHaveBeenCalledTimes(2);
      editor.close();
      expect(dialog.isConnected).toBe(false);
      expect(editor.isConnected).toBe(false);
      expect(closed).toHaveBeenCalledWith("a1b2");
      // a browser refusing showModal: plain open dialog
      proto.showModal = () => {
        throw new Error("InvalidStateError");
      };
      const other = await open(make_hass(doc), "a1b2");
      expect(other.parentElement.hasAttribute("open")).toBe(true);
      other.close(true);
      proto.showModal = undefined;
      const third = await open(make_hass(doc), "a1b2");
      expect(third.parentElement.hasAttribute("open")).toBe(true);
      third.close(true);
    } finally {
      proto.showModal = saved;
    }
  });

  it("asks before closing with changes, deletes an aquarium", async () => {
    const { doc } = existing_doc();
    const hass = make_hass(doc);
    const closed = vi.fn();
    const editor = await open(hass, "a1b2", closed);
    editor.change({ ...editor.doc, name: "Renamed" });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    editor.close();
    expect(closed).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    await editor._delete_aquarium();
    expect(hass.callWS).toHaveBeenCalledWith({
      type: "reeftank/aquarium/delete",
      aquarium_id: "a1b2",
    });
    expect(closed).toHaveBeenCalledWith(null);
  });

  it("shows load errors", async () => {
    const hass = make_hass({}, (msg) =>
      msg.type === "reeftank/aquarium/get"
        ? Promise.reject({ code: "not_found", message: "" })
        : undefined,
    );
    const editor = await open(hass, "ghost");
    expect(editor._message.text).toContain("no longer exists");
    expect(editor._error_text({ code: "weird", message: "boom" })).toContain(
      "boom",
    );
  });
});
