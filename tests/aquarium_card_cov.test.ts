import { afterEach, describe, expect, it, vi } from "vitest";

// The scene editor dialog is tested elsewhere: here we only check what the
// Lovelace editor does when it is opened and closed.
vi.mock("../src/aquarium/editor/scene_editor", async (importOriginal) => {
  const orig: any = await importOriginal();
  return { ...orig, open_scene_editor: vi.fn() };
});

import "../src/devices/index";
import "../src/base/index";
import "../src/aquarium/index";

// The device view itself is tested elsewhere: a stand-in records its setup
class FakeReefCard extends HTMLElement {
  config: any = null;
  hass: any = null;
  setConfig(config: any) {
    this.config = config;
  }
}
if (!customElements.get("reef-card"))
  customElements.define("reef-card", FakeReefCard);

import { flow_of } from "../src/aquarium/aquarium_card";
import { ReefTankApi, reset_catalog_cache } from "../src/aquarium/api";
import * as ops from "../src/aquarium/editor/ops";
import { rect_quad } from "../src/aquarium/geometry";
import { open_scene_editor } from "../src/aquarium/editor/scene_editor";
import {
  create_entity_element,
  device_selector,
  device_thumbnail,
  entity_element_config,
  reset_thumbnails,
} from "../src/aquarium/elements";
import { MyElement } from "../src/base/element";
import { RSDevice } from "../src/devices/device";

afterEach(() => {
  reset_catalog_cache();
  reset_thumbnails();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  (open_scene_editor as any).mockReset?.();
});

const flush = () => new Promise((r) => setTimeout(r, 0));

/** A promise resolved from the outside. */
function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function make_doc() {
  let doc = ops.new_document("Reefer");
  doc.id = "a1b2";
  let front: string;
  let cabinet: string;
  [doc, front] = ops.add_view(doc, "Front");
  [doc, cabinet] = ops.add_view(doc, "Cabinet");
  doc = ops.update_view(doc, front, { image: "a1b2/front.webp" });
  doc = ops.set_region(doc, front, "main", rect_quad(0.1, 0.1, 0.9, 0.6));
  doc = ops.add_light(doc, "main", { entity_id: "light.lamp", x: 0.5 });
  doc = ops.set_flow(doc, "main", ["number.pump"]);
  [doc] = ops.add_element(doc, front, {
    kind: "device",
    device_id: "shelly",
    pos: [0.2, 0.05],
    roles: ["feeding_point"],
  } as any);
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
  return { doc, front, cabinet };
}

function make_hass(doc: any, extra: Record<string, any> = {}) {
  let push: ((msg: any) => void) | null = null;
  const hass: any = {
    config: { components: ["reeftank"] },
    language: "en",
    states: {
      "sensor.temp": { entity_id: "sensor.temp", state: "25", attributes: {} },
      "light.lamp": {
        entity_id: "light.lamp",
        state: "on",
        attributes: { rgb_color: [40, 70, 255], brightness: 255 },
      },
      "number.pump": { entity_id: "number.pump", state: "50", attributes: {} },
      "event.reefer_feeding": {
        entity_id: "event.reefer_feeding",
        state: "2026-01-01T00:00:00",
        attributes: {},
      },
    },
    entities: {},
    devices: {
      shelly: { id: "shelly", name: "Feeder", identifiers: [["shelly", "x"]] },
    },
    callService: vi.fn(),
    callWS: vi.fn(async (msg: any) =>
      msg.type === "reeftank/catalog"
        ? { fish: [], corals: [], presets: [] }
        : [],
    ),
    connection: {
      subscribeMessage: vi.fn(async (cb: any, msg: any) => {
        if (msg?.type === "reeftank/catalog/subscribe") return () => undefined;
        push = cb;
        cb({
          document: doc,
          entities: { feeding: "event.reefer_feeding" },
          images_url: "/reeftank/images",
        });
        return () => undefined;
      }),
    },
    ...extra,
  };
  return { hass, push: (msg: any) => push?.(msg) };
}

async function mount(config: any, hass: any): Promise<any> {
  const card = document.createElement("reef-aquarium-card") as any;
  card.setConfig(config);
  document.body.appendChild(card);
  card.hass = hass;
  await flush();
  await card.updateComplete;
  return card;
}

/** A stand-in for the life scene, recording what the card asks of it. */
function fake_scene(running = false) {
  return {
    running,
    start: vi.fn(),
    stop: vi.fn(),
    feed: vi.fn(),
    set_light: vi.fn(),
    set_flow: vi.fn(),
    resize: vi.fn(),
  };
}

/** A 2D context accepting every call (jsdom has no canvas). */
function stub_canvas() {
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
  return vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(ctx as any);
}

describe("flow helper", () => {
  it("reads switches off and tolerates no entity list", () => {
    const hass: any = { states: { "switch.p": { state: "off" } } };
    expect(flow_of(hass, ["switch.p"])).toBe(0);
    expect(flow_of(hass, null as any)).toBe(0);
  });
});

describe("card subscriptions", () => {
  it("drops a subscription answered after the aquarium changed", async () => {
    const first = deferred<() => void>();
    const unsub_a = vi.fn();
    const { hass } = make_hass({});
    hass.connection.subscribeMessage = vi.fn(async (_cb: any, msg: any) => {
      if (msg.type === "reeftank/catalog/subscribe") return () => undefined;
      if (msg.aquarium_id === "a") return first.promise;
      return () => undefined;
    });
    const card = await mount({ aquarium: "a" }, hass);
    card.setConfig({ aquarium: "b" });
    first.resolve(unsub_a);
    await flush();
    expect(unsub_a).toHaveBeenCalledTimes(1);
    expect(card._subscribed_to).toBe("b");
  });

  it("reports an unexpected subscription error as not loaded", async () => {
    const { hass } = make_hass({});
    hass.connection.subscribeMessage = vi.fn(async (_cb: any, msg: any) => {
      if (msg.type === "reeftank/catalog/subscribe") return () => undefined;
      throw { code: "boom", message: "x" };
    });
    const card = await mount({ aquarium: "a" }, hass);
    expect(card._error).toBe("not_loaded");
    expect(card.shadowRoot.textContent).toContain(
      "ReefTank integration needed",
    );
  });

  it("warns when the catalog cannot be read", async () => {
    const { doc } = make_doc();
    const { hass } = make_hass(doc);
    hass.callWS = vi.fn(async () => {
      throw { code: "nope", message: "no catalog" };
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const card = await mount({ aquarium: "a1b2" }, hass);
    await flush();
    expect(warn).toHaveBeenCalledWith(
      "aquarium: no catalog",
      expect.anything(),
    );
    expect(card._catalog).toBeNull();
  });

  it("closes a catalog subscription answered after removal", async () => {
    const pending = deferred<() => void>();
    const unsub = vi.fn();
    const { doc } = make_doc();
    const { hass } = make_hass(doc);
    const base = hass.connection.subscribeMessage;
    hass.connection.subscribeMessage = vi.fn(async (cb: any, msg: any) =>
      msg.type === "reeftank/catalog/subscribe"
        ? pending.promise
        : base(cb, msg),
    );
    const card = await mount({ aquarium: "a1b2" }, hass);
    // Removed while the subscription is pending: the placeholder is dropped
    card.remove();
    expect(card._catalog_unsub).toBeNull();
    pending.resolve(unsub);
    await flush();
    expect(unsub).toHaveBeenCalledTimes(1);
    expect(card._catalog_unsub).toBeNull();
  });

  it("subscribes again when attached again", async () => {
    const { doc } = make_doc();
    const { hass } = make_hass(doc);
    const card = await mount({ aquarium: "a1b2" }, hass);
    await flush();
    expect(card._catalog).not.toBeNull();
    const types = () =>
      hass.connection.subscribeMessage.mock.calls.map((c: any) => c[1].type);
    const before = types().length;
    card.remove();
    document.body.appendChild(card);
    await flush();
    expect(types().slice(before)).toEqual(
      expect.arrayContaining([
        "reeftank/aquarium/subscribe",
        "reeftank/catalog/subscribe",
      ]),
    );
    expect(card._unsub).not.toBeNull();
  });

  it("picks the configured view when the current one is gone", async () => {
    const { doc, cabinet } = make_doc();
    const h = make_hass(doc);
    const card = await mount({ aquarium: "a1b2", view: cabinet }, h.hass);
    expect(card._view_id).toBe(cabinet);
    card._view_id = "ghost";
    h.push({ document: doc, entities: {}, images_url: "/x" });
    expect(card._view_id).toBe(cabinet);
  });
});

describe("card running state", () => {
  it("runs the scene only while visible", async () => {
    const observers: any[] = [];
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observed: any[] = [];
        disconnect = vi.fn();
        constructor(public cb: (entries: any[]) => void) {
          observers.push(this);
        }
        observe(el: any) {
          this.observed.push(el);
        }
      },
    );
    const { doc } = make_doc();
    const { hass } = make_hass(doc);
    const card = await mount({ aquarium: "a1b2" }, hass);
    const io = observers.at(-1);
    expect(io.observed).toContain(card);

    // Visible and not running: started
    let scene = fake_scene(false);
    card._scene = scene;
    io.cb([{ isIntersecting: true }]);
    expect(scene.start).toHaveBeenCalledTimes(1);
    // Visible and already running: left alone
    scene = fake_scene(true);
    card._scene = scene;
    io.cb([{ isIntersecting: true }]);
    expect(scene.start).not.toHaveBeenCalled();
    expect(scene.stop).not.toHaveBeenCalled();
    // Scrolled away while running: stopped
    io.cb([{ isIntersecting: false }]);
    expect(card._visible).toBe(false);
    expect(scene.stop).toHaveBeenCalledTimes(1);
    // Not visible and not running: nothing to do
    scene = fake_scene(false);
    card._scene = scene;
    io.cb([{ isIntersecting: false }]);
    expect(scene.start).not.toHaveBeenCalled();
    expect(scene.stop).not.toHaveBeenCalled();
    // No scene at all: nothing happens
    card._scene = null;
    expect(() => io.cb([{ isIntersecting: true }])).not.toThrow();

    card.remove();
    expect(io.disconnect).toHaveBeenCalled();
  });

  it("stops the scene when the page is hidden", async () => {
    const { doc } = make_doc();
    const { hass } = make_hass(doc);
    const card = await mount({ aquarium: "a1b2" }, hass);
    const scene = fake_scene(true);
    card._scene = scene;
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    try {
      document.dispatchEvent(new Event("visibilitychange"));
      expect(scene.stop).toHaveBeenCalledTimes(1);
    } finally {
      delete (document as any).visibilityState;
    }
    expect(document.visibilityState).not.toBe("hidden");
  });

  it("lowers to the light level when motion is reduced", async () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: q.includes("reduce"),
    }));
    const { doc } = make_doc();
    const { hass } = make_hass(doc);
    const card = await mount({ aquarium: "a1b2" }, hass);
    expect(card.level).toBe("light");
    expect(card.shadowRoot.querySelector("canvas.life")).toBeNull();
    // The water tint is still drawn at the light level
    expect(card.shadowRoot.querySelector(".water.tint")).not.toBeNull();
  });
});

describe("card rendering", () => {
  it("draws a bare view with defaults", async () => {
    const { doc, front } = make_doc();
    const bare: any = structuredClone(doc);
    delete bare.render;
    delete bare.feeding;
    delete bare.views[front].regions;
    delete bare.views[front].hotspots;
    delete bare.views[front].elements;
    const { hass } = make_hass(bare);
    const card = await mount({ aquarium: "a1b2" }, hass);
    const root = card.shadowRoot;
    expect(card.level).toBe("full");
    expect(root.querySelector(".water")).toBeNull();
    expect(root.querySelectorAll("svg.hotspots polygon")).toHaveLength(0);
    expect(root.querySelectorAll(".el")).toHaveLength(0);

    // A feeding without a configured duration lasts 45 s, on no point
    const scene = fake_scene();
    card._scene = scene;
    card.hass = {
      ...hass,
      states: {
        ...hass.states,
        "event.reefer_feeding": { state: "2026-02-01", attributes: {} },
      },
    };
    expect(scene.feed).toHaveBeenCalledWith([], 45);
  });

  it("draws every kind of element", async () => {
    const { doc, front } = make_doc();
    const d: any = structuredClone(doc);
    delete d.photo_light;
    // A water no region light reaches (it does not exist)
    d.views[front].regions.push({
      water: "ghost",
      quad: rect_quad(0.2, 0.2, 0.3, 0.3),
    });
    d.views[front].hotspots.push({
      id: "h2",
      poly: [
        [0, 0],
        [0.1, 0],
        [0.1, 0.1],
      ],
      goto: "nowhere",
      label: "",
    });
    d.views[front].elements = [
      {
        id: "e1",
        kind: "entity",
        entity_id: "sensor.temp",
        pos: [0.1, 0.1],
        scale: 0,
        label: "",
        roles: [],
      },
      {
        id: "e2",
        kind: "entity",
        entity_id: "sensor.temp",
        type: "no-such-element",
        pos: [0.2, 0.1],
        scale: 1,
        label: "",
        roles: [],
      },
      {
        id: "e3",
        kind: "device",
        device_id: "shelly",
        pos: [0.3, 0.1],
        scale: 1,
        label: "",
        roles: [],
      },
      {
        id: "e4",
        kind: "marker",
        pos: [0.4, 0.1],
        scale: 1,
        label: "Rock",
        roles: [],
      },
    ];
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { hass } = make_hass(d);
    const card = await mount({ aquarium: "a1b2" }, hass);
    const root = card.shadowRoot;
    // Only the lit water is tinted, with the white photo by default
    expect(root.querySelectorAll(".water.tint")).toHaveLength(1);
    const els = root.querySelectorAll(".el");
    expect(els).toHaveLength(4);
    // No scale: drawn at scale 1; no type: the default element
    expect(els[0].getAttribute("style")).toContain("scale(1)");
    expect(els[0].querySelector("common-sensor")).not.toBeNull();
    // An element the card cannot build: its entity id is shown instead
    expect(els[1].textContent.trim()).toBe("sensor.temp");
    expect(error).toHaveBeenCalled();
    // A device without picture: a chip with its name
    expect(els[2].textContent).toContain("Feeder");
    // A plain marker: the map-marker icon, no feeding badge
    expect(els[3].querySelector(".badge")).toBeNull();
    expect(els[3].textContent).toContain("Rock");
    // A hotspot to a missing view has an empty title
    const titles = root.querySelectorAll("svg.hotspots polygon title");
    expect(titles[1].textContent!.trim()).toBe("");

    // A tap on a device the card has no view for opens its page
    els[2].dispatchEvent(new MouseEvent("click"));
    expect(location.pathname).toBe("/config/devices/device/shelly");

    // No light reading at all for the region: no tint
    card._lights = {};
    await card.updateComplete;
    expect(root.querySelector(".water")).toBeNull();
  });

  it("navigates from a card with no current view", async () => {
    const { doc, front } = make_doc();
    const { hass } = make_hass(doc);
    const card = await mount({ aquarium: "a1b2" }, hass);
    card._view_id = null;
    card._goto(front);
    expect(card._view_id).toBe(front);
    expect(card._stack).toEqual([]);
  });

  it("keeps the aspect of a picture without size", async () => {
    const { doc } = make_doc();
    const { hass } = make_hass(doc);
    const card = await mount({ aquarium: "a1b2" }, hass);
    const img = card.shadowRoot.querySelector("img.bg");
    img.dispatchEvent(new Event("load"));
    expect(card._aspect).toBeCloseTo(16 / 9);
    expect(card._bg).toBe(img);
  });

  it("paints the drawn decor at device pixel ratio 1 by default", async () => {
    let { doc, front } = make_doc();
    doc = ops.set_region_drawn(doc, front, "main", true);
    const spy = stub_canvas();
    vi.stubGlobal("devicePixelRatio", 0);
    try {
      const { hass } = make_hass(doc);
      const card = await mount({ aquarium: "a1b2" }, hass);
      const canvas = card.shadowRoot.querySelector("canvas.backdrop");
      vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
        width: 300,
        height: 150,
      } as DOMRect);
      expect(card._paint_backdrop()).not.toBeNull();
      expect(canvas.width).toBe(300);
      expect(canvas.height).toBe(150);
      // The decor asks for a repaint once its textures are loaded
      const paint = vi.spyOn(card, "_paint_backdrop");
      const scene = fake_scene();
      card._scene = scene;
      card._backdrop.on_change();
      expect(paint).toHaveBeenCalled();
      expect(scene.resize).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
});

describe("Lovelace editor", () => {
  function editor_hass(views: Record<string, any>) {
    return {
      config: { components: ["reeftank"] },
      language: "en",
      states: {},
      callWS: vi.fn(async (msg: any) => {
        if (msg.type === "reeftank/aquarium/list")
          return [{ id: "a1b2", name: "Reefer" }];
        if (msg.type === "reeftank/aquarium/get")
          return { document: { views }, entities: {}, images_url: "/x" };
        return null;
      }),
    } as any;
  }

  async function make_editor(config: any, hass: any) {
    const editor: any = document.createElement("reef-aquarium-card-editor");
    editor.setConfig(config);
    document.body.appendChild(editor);
    editor.hass = hass;
    await flush();
    await flush();
    await editor.updateComplete;
    const changed = vi.fn();
    editor.addEventListener("config-changed", (e: any) =>
      changed(e.detail.config),
    );
    return { editor, changed };
  }

  it("names views by id, and chooses the start view", async () => {
    const hass = editor_hass({ v1: { name: "Front" }, v2: {} });
    const { editor, changed } = await make_editor({ aquarium: "a1b2" }, hass);
    expect(editor._views).toEqual([
      { id: "v1", name: "Front" },
      { id: "v2", name: "v2" },
    ]);
    const selects = editor.shadowRoot.querySelectorAll("select");
    expect(selects).toHaveLength(3);
    selects[2].value = "v2";
    selects[2].dispatchEvent(new Event("change"));
    expect(changed.mock.calls.at(-1)[0].view).toBe("v2");
    await editor.updateComplete;
    selects[2].value = "";
    selects[2].dispatchEvent(new Event("change"));
    expect("view" in changed.mock.calls.at(-1)[0]).toBe(false);
    // The render level back to inherited
    selects[1].value = "";
    selects[1].dispatchEvent(new Event("change"));
    expect("render" in changed.mock.calls.at(-1)[0]).toBe(false);
  });

  it("follows a new hass without reloading", async () => {
    const hass = editor_hass({});
    const { editor } = await make_editor({}, hass);
    const next = { ...hass };
    editor.hass = next;
    expect(editor._api._hass).toBe(next);
    const lists = hass.callWS.mock.calls.filter(
      (c: any) => c[0].type === "reeftank/aquarium/list",
    );
    expect(lists).toHaveLength(1);
  });

  it("shows the list error, and no views when they cannot be read", async () => {
    const hass = editor_hass({});
    hass.callWS = vi.fn(async (msg: any) => {
      throw { code: msg.type === "reeftank/aquarium/list" ? "denied" : "x" };
    });
    const { editor } = await make_editor({ aquarium: "a1b2" }, hass);
    expect(editor._error).toBe("denied");
    // Views that cannot be read: none offered
    editor._views = [{ id: "old", name: "Old" }];
    await editor._load_views();
    expect(editor._views).toEqual([]);
    expect(hass.callWS).toHaveBeenCalledWith({
      type: "reeftank/aquarium/get",
      aquarium_id: "a1b2",
    });
    // An error without a code
    vi.spyOn(ReefTankApi.prototype, "list").mockRejectedValue({});
    await editor._load();
    expect(editor._error).toBe("not_loaded");
  });

  it("opens the scene editor and follows what was saved", async () => {
    const hass = editor_hass({ v1: { name: "Front" } });
    const { editor, changed } = await make_editor({}, hass);
    const open = open_scene_editor as any;
    // Only the "new aquarium" button without an aquarium
    const buttons = editor.shadowRoot.querySelectorAll("button");
    expect(buttons).toHaveLength(1);
    buttons[0].dispatchEvent(new MouseEvent("click"));
    expect(open).toHaveBeenCalledWith(hass, null, expect.any(Function));
    // Saved as a new aquarium: the card shows it
    await open.mock.calls[0][2]("new1");
    expect(changed).toHaveBeenLastCalledWith({
      type: "custom:reef-aquarium-card",
      aquarium: "new1",
    });
    // Closed without saving: the views are reloaded only
    const count = changed.mock.calls.length;
    await open.mock.calls[0][2](null);
    expect(changed.mock.calls.length).toBe(count);
  });

  it("does not open the scene editor before hass", () => {
    const editor: any = document.createElement("reef-aquarium-card-editor");
    editor._edit(null);
    expect(open_scene_editor).not.toHaveBeenCalled();
  });
});

describe("elements", () => {
  it("leaves an unlabelled switch without label", () => {
    expect(entity_element_config("switch.heater").label).toBe(false);
  });

  it("returns null when the element cannot be built", () => {
    vi.spyOn(MyElement, "create_element").mockImplementation(() => {
      throw new Error("bad");
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const el = create_entity_element({ states: {} } as any, {
      id: "e",
      kind: "entity",
      entity_id: "sensor.temp",
      pos: [0, 0],
      scale: 1,
      label: "",
      roles: [],
    });
    expect(el).toBeNull();
    expect(error).toHaveBeenCalledWith(
      "aquarium: cannot create element for",
      "sensor.temp",
      expect.any(Error),
    );
  });

  it("selects a device by key, or not at all", () => {
    const list: any = {
      devices: {
        k1: { key: "key1", elements: [{ id: "d1" }] },
        k2: { elements: [{ id: "d2" }] },
      },
    };
    expect(device_selector(list, "d1")).toBe("key1");
    expect(device_selector(list, "d2")).toBeNull();
  });

  it("finds a thumbnail in every place a device view keeps it", () => {
    const hass: any = { states: {}, devices: {} };
    const list: any = {
      devices: {
        k1: { elements: [{ id: "d1", model: "RSDOSE4" }] },
        k2: { elements: [{ id: "d2", model: "RSDOSE4" }] },
        k3: { elements: [{ id: "d3", model: "RSDOSE4" }] },
        k4: { elements: [{ id: "d4", model: "RSDOSE4" }] },
      },
    };
    const tag = vi.spyOn(RSDevice, "tag_for_model");
    const create = vi.spyOn(RSDevice, "create_device");
    // No identifiers: the redsea domain; no device view
    create.mockReturnValueOnce(null);
    expect(device_thumbnail(hass, list, "d1")).toBeNull();
    expect(tag).toHaveBeenCalledWith("redsea", "RSDOSE4");
    // The picture of the initial configuration
    create.mockReturnValueOnce({
      config: {},
      initial_config: { background_img: "/init.png" },
    } as any);
    expect(device_thumbnail(hass, list, "d2")).toBe("/init.png");
    // A device view without picture
    create.mockReturnValueOnce({} as any);
    expect(device_thumbnail(hass, list, "d3")).toBeNull();
    // A device view that fails
    create.mockImplementationOnce(() => {
      throw new Error("bad");
    });
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    expect(device_thumbnail(hass, list, "d4")).toBeNull();
    expect(debug).toHaveBeenCalled();
  });
});

describe("registration", () => {
  it("does not define the elements twice", async () => {
    // Fresh copies of the dependencies register their own elements again:
    // let those through as no-ops, only the aquarium tags are checked.
    const define = vi
      .spyOn(customElements, "define")
      .mockImplementation(() => undefined);
    vi.resetModules();
    const mod = await import("../src/aquarium/index");
    for (const tag of [
      "reef-aquarium-card",
      "reef-aquarium-card-editor",
      "reef-aquarium-scene-editor",
    ]) {
      expect(define).not.toHaveBeenCalledWith(tag, expect.anything());
      expect(customElements.get(tag)).toBeDefined();
    }
    expect(mod.ReefAquariumCard).toBeDefined();
  });
});
