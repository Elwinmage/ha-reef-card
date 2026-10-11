import { afterEach, describe, expect, it, vi } from "vitest";
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
import {
  ReefAquariumCard,
  feeding_targets,
  flow_of,
  lowest_level,
} from "../src/aquarium/aquarium_card";
import { reset_catalog_cache } from "../src/aquarium/api";
import * as ops from "../src/aquarium/editor/ops";
import { rect_quad } from "../src/aquarium/geometry";

afterEach(() => {
  reset_catalog_cache();
  document.body.innerHTML = "";
});

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
    kind: "entity",
    entity_id: "sensor.temp",
    type: "common-sensor",
    pos: [0.8, 0.7],
  });
  [doc] = ops.add_element(doc, front, {
    kind: "entity",
    entity_id: "switch.gone",
    type: "common-switch",
    pos: [0.8, 0.8],
  });
  [doc] = ops.add_element(doc, front, {
    kind: "device",
    device_id: "shelly",
    pos: [0.2, 0.05],
    roles: ["feeding_point"],
  } as any);
  [doc] = ops.add_element(doc, front, {
    kind: "device",
    device_id: "dose",
    pos: [0.3, 0.05],
  });
  [doc] = ops.add_element(doc, front, {
    kind: "marker",
    pos: [0.5, 0.05],
    roles: ["feeding_point"],
    label: "Feed",
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
  let installed: ((msg: any) => void) | null = null;
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
      dose: {
        id: "dose",
        name: "RSDOSE4",
        model: "RSDOSE4",
        identifiers: [["redsea", "hwdose"]],
        primary_config_entry: "e1",
        disabled_by: null,
      },
    },
    callService: vi.fn(),
    callWS: vi.fn(async (msg: any) =>
      msg.type === "reeftank/catalog"
        ? { fish: [], corals: [], presets: [] }
        : [],
    ),
    connection: {
      subscribeMessage: vi.fn(async (cb: any, msg: any) => {
        if (msg?.type === "reeftank/catalog/subscribe") {
          installed = cb;
          return () => (installed = null);
        }
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
  return {
    hass,
    push: (msg: any) => push?.(msg),
    installed: (version: string) => installed?.({ version }),
    has_catalog_subscription: () => installed !== null,
  };
}

async function mount(config: any, hass: any): Promise<any> {
  const card = document.createElement("reef-aquarium-card") as any;
  card.setConfig(config);
  document.body.appendChild(card);
  card.hass = hass;
  await new Promise((r) => setTimeout(r, 0));
  await card.updateComplete;
  return card;
}

describe("helpers", () => {
  it("lowers render levels", () => {
    expect(lowest_level("full", "static")).toBe("static");
    expect(lowest_level("light", "full")).toBe("light");
    expect(lowest_level("full", undefined)).toBe("full");
    expect(lowest_level("full", "bogus" as any)).toBe("full");
  });

  it("reads the flow", () => {
    const hass: any = {
      states: {
        "number.a": { state: "50", attributes: {} },
        "number.b": { state: "30", attributes: { max: 60 } },
        "switch.c": { state: "on", attributes: {} },
        "sensor.d": { state: "bad", attributes: {} },
      },
    };
    expect(flow_of(hass, ["number.a"])).toBeCloseTo(0.5);
    expect(flow_of(hass, ["number.b", "switch.c"])).toBeCloseTo(0.75);
    expect(flow_of(hass, ["sensor.d", "missing"])).toBe(0);
    expect(flow_of(hass, [])).toBe(0);
  });

  it("chooses feeding targets", () => {
    const view: any = {
      elements: [
        { pos: [0.1, 0], roles: ["feeding_point"], source: "f1" },
        { pos: [0.2, 0], roles: ["feeding_point"] },
        { pos: [0.3, 0], roles: [] },
      ],
    };
    expect(feeding_targets(view, "f1")).toEqual([[0.1, 0]]);
    expect(feeding_targets(view, null)).toEqual([
      [0.1, 0],
      [0.2, 0],
    ]);
    // A source no point is bound to: the generic points
    expect(feeding_targets(view, "other")).toEqual([[0.2, 0]]);
    expect(
      feeding_targets({ elements: [view.elements[0]] } as any, "other"),
    ).toEqual([[0.1, 0]]);
    expect(feeding_targets(undefined, null)).toEqual([]);
  });
});

describe("card", () => {
  it("explains what is missing", async () => {
    const { hass } = make_hass({});
    hass.config.components = [];
    let card = await mount({ aquarium: "a1b2" }, hass);
    expect(card.shadowRoot.textContent).toContain(
      "ReefTank integration needed",
    );
    const h2 = make_hass({}).hass;
    card = await mount({}, h2);
    expect(card.shadowRoot.textContent).toContain("No aquarium chosen");
    // the card's picture, as in the card picker
    expect(
      card.shadowRoot.querySelector("img.preview").getAttribute("src"),
    ).toContain("preview-reeftank");
    const h3 = make_hass({}).hass;
    h3.connection.subscribeMessage = vi.fn(async () =>
      Promise.reject({ code: "not_found", message: "" }),
    );
    card = await mount({ aquarium: "ghost" }, h3);
    expect(card.shadowRoot.textContent).toContain("Aquarium not found");
    expect(() => card.setConfig(null)).toThrow();
    expect(ReefAquariumCard.getStubConfig()).toEqual({ aquarium: "" });
    expect(card.getCardSize()).toBe(6);
    expect(ReefAquariumCard.getConfigElement().tagName.toLowerCase()).toBe(
      "reef-aquarium-card-editor",
    );
  });

  it("draws a view with its water, elements and hotspots", async () => {
    const { doc } = make_doc();
    const { hass } = make_hass(doc);
    const card = await mount({ aquarium: "a1b2" }, hass);
    const root = card.shadowRoot;
    expect(root.querySelector("img.bg").getAttribute("src")).toBe(
      "/reeftank/images/a1b2/front.webp",
    );
    expect(root.querySelector(".water.tint")).not.toBeNull();
    expect(root.querySelector("canvas.life")).not.toBeNull();
    expect(root.querySelectorAll(".el")).toHaveLength(5);
    expect(root.querySelector(".el.entity")).not.toBeNull();
    // An entity that no longer exists is shown as missing, not drawn
    expect(root.querySelector(".el.missing")).not.toBeNull();
    expect(root.querySelectorAll("svg.hotspots polygon")).toHaveLength(1);
    expect(card.level).toBe("full");
    expect(card.hass).toBe(hass);
  });

  it("lowers the level and navigates between views", async () => {
    const { doc, cabinet } = make_doc();
    const { hass } = make_hass(doc);
    const card = await mount({ aquarium: "a1b2", render: "static" }, hass);
    const root = card.shadowRoot;
    expect(root.querySelector("canvas.life")).toBeNull();
    expect(root.querySelector(".water")).toBeNull();
    root
      .querySelector("svg.hotspots polygon")
      .dispatchEvent(new MouseEvent("click"));
    await card.updateComplete;
    expect(card._view_id).toBe(cabinet);
    expect(root.textContent).toContain("Cabinet");
    root.querySelector(".nav button").dispatchEvent(new MouseEvent("click"));
    await card.updateComplete;
    expect(card._view_id).not.toBe(cabinet);
    card._goto("ghost");
    card._back();
  });

  it("follows the document and its deletion", async () => {
    const { doc } = make_doc();
    const h = make_hass(doc);
    const card = await mount({ aquarium: "a1b2", view: "nope" }, h.hass);
    const next = structuredClone(doc);
    next.revision = 5;
    next.views = {};
    next.default_view = null;
    h.push({ document: next, entities: {}, images_url: "/x" });
    await card.updateComplete;
    expect(card.shadowRoot.textContent).toContain("No picture yet");
    h.push({ deleted: true });
    await card.updateComplete;
    expect(card.shadowRoot.textContent).toContain("Aquarium not found");
  });

  it("reloads the catalog when a release is installed", async () => {
    const { doc } = make_doc();
    const h = make_hass(doc);
    const card = await mount({ aquarium: "a1b2" }, h.hass);
    await new Promise((r) => setTimeout(r, 0));
    expect(h.has_catalog_subscription()).toBe(true);
    const calls = () =>
      h.hass.callWS.mock.calls.filter(
        (c: any) => c[0].type === "reeftank/catalog",
      ).length;
    const before = calls();
    h.installed("2026.10.0");
    await new Promise((r) => setTimeout(r, 0));
    expect(calls()).toBe(before + 1);
    card.remove();
    expect(h.has_catalog_subscription()).toBe(false);
  });

  it("feeds the fish when the feeding event changes", async () => {
    const { doc } = make_doc();
    const { hass } = make_hass(doc);
    const card = await mount({ aquarium: "a1b2" }, hass);
    const feed = vi.fn();
    card._scene = {
      feed,
      set_light: vi.fn(),
      set_flow: vi.fn(),
      stop: vi.fn(),
      running: false,
      start: vi.fn(),
    };
    const next = {
      ...hass,
      states: {
        ...hass.states,
        "event.reefer_feeding": {
          state: "2026-01-02T00:00:00",
          attributes: { source: null },
        },
      },
    };
    card.hass = next;
    expect(feed).toHaveBeenCalledTimes(1);
    expect(feed.mock.calls[0][0]).toEqual([
      [0.2, 0.05],
      [0.5, 0.05],
    ]);
    card.hass = {
      ...next,
      states: {
        ...next.states,
        "event.reefer_feeding": { state: "unavailable", attributes: {} },
      },
    };
    expect(feed).toHaveBeenCalledTimes(1);
  });

  it("opens a device it knows, or its Home Assistant page", async () => {
    const { doc } = make_doc();
    const { hass } = make_hass(doc);
    const card = await mount({ aquarium: "a1b2" }, hass);
    card._open_device("dose");
    await card.updateComplete;
    const overlay = card.shadowRoot.querySelector(".overlay");
    expect(overlay).not.toBeNull();
    expect((overlay.querySelector("reef-card") as any).config).toEqual({
      type: "custom:reef-card",
      device: "hwdose",
    });
    card.hass = { ...hass };
    overlay.querySelector(".close").dispatchEvent(new MouseEvent("click"));
    await card.updateComplete;
    expect(card.shadowRoot.querySelector(".overlay")).toBeNull();
    card._open_device("shelly");
    expect(location.pathname).toBe("/config/devices/device/shelly");
  });

  it("follows the picture size and stops when removed", async () => {
    const { doc } = make_doc();
    const { hass } = make_hass(doc);
    const card = await mount({ aquarium: "a1b2" }, hass);
    const img = card.shadowRoot.querySelector("img.bg");
    Object.defineProperty(img, "naturalWidth", { value: 1600 });
    Object.defineProperty(img, "naturalHeight", { value: 800 });
    img.dispatchEvent(new Event("load"));
    await card.updateComplete;
    expect(card._aspect).toBe(2);
    card.remove();
    expect(card._scene).toBeNull();
  });

  it("draws the water over the photo", async () => {
    let { doc, front } = make_doc();
    doc = ops.set_region_drawn(doc, front, "main", true);
    const { hass, push } = make_hass(doc);
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
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(ctx as any);
    const observed: any[] = [];
    const RO = (globalThis as any).ResizeObserver;
    (globalThis as any).ResizeObserver = class {
      constructor(public cb: () => void) {
        observed.push(this);
      }
      observe() {}
      disconnect() {}
    };
    try {
      const card = await mount({ aquarium: "a1b2" }, hass);
      const root = card.shadowRoot;
      // the photo stays: the drawn water is laid over it
      expect(root.querySelector("img.bg")).not.toBeNull();
      const canvas = root.querySelector("canvas.backdrop");
      expect(canvas).not.toBeNull();
      expect(card._paint_backdrop()).not.toBeNull();
      expect(card._scene_key.endsWith(":true")).toBe(true);
      // the stage size followed: backdrop repainted, scene cut-outs rebuilt
      const paint = vi.spyOn(card, "_paint_backdrop");
      observed.at(-1).cb();
      expect(paint).toHaveBeenCalled();
      // back to the photo
      push({
        document: ops.set_region_drawn(doc, front, "main", false),
        entities: {},
        images_url: "/reeftank/images",
      });
      await card.updateComplete;
      expect(root.querySelector("canvas.backdrop")).toBeNull();
      expect(card._paint_backdrop()).toBeNull();
    } finally {
      spy.mockRestore();
      (globalThis as any).ResizeObserver = RO;
    }
  });
});
