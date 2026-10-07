/**
 * Tests for the topographic map of the ReefLED weather program.
 *
 * Covers: src/devices/redsea/rsled/rsled_map.ts
 */

import { afterEach, describe, expect, it } from "vitest";

import "../src/devices/index";
import {
  DRAG_THRESHOLD,
  MAP_FALLBACK,
  RSLedTopoMap,
  TILE,
  ZOOM,
  project,
  tile_url,
  unproject,
} from "../src/devices/redsea/rsled/rsled_map";

afterEach(() => {
  document.body.innerHTML = "";
});

async function mount(latitude = -17.71, longitude = 178.06): Promise<any> {
  const el = document.createElement("rsled-topo-map") as any;
  el.latitude = latitude;
  el.longitude = longitude;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** The map itself: what is pressed, dragged and zoomed. */
function view(el: any): HTMLElement {
  return el.shadowRoot.querySelector(".view");
}

/** A pointer event at a point of the map (jsdom has no PointerEvent). */
function pointer(type: string, x: number, y: number): Event {
  const ev = new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    composed: true,
  });
  Object.defineProperty(ev, "pointerId", { value: 1 });
  return ev;
}

describe("rsled_map: projection", () => {
  it("project() and unproject() are each other's inverse", () => {
    const world = TILE * 2 ** 3;
    expect(project(0, 0, 3)).toEqual({ x: world / 2, y: world / 2 });
    expect(project(0, -180, 3).x).toBe(0);
    const p = project(48.85, 2.35, 10);
    const back = unproject(p.x, p.y, 10);
    expect(back.latitude).toBeCloseTo(48.85, 6);
    expect(back.longitude).toBeCloseTo(2.35, 6);
    // The poles are outside the projection; the world goes round
    expect(project(90, 0, 2).y).toBeCloseTo(0, 1);
    expect(project(-90, 0, 2).y).toBeCloseTo(TILE * 4, 1);
    expect(unproject(-world / 4, world / 2, 3).longitude).toBeCloseTo(90);
    expect(unproject(world * 1.25, world / 2, 3).longitude).toBeCloseTo(-90);
    expect(unproject(0, -1e9, 3).latitude).toBeLessThanOrEqual(85.0511);
  });

  it("tile_url(): the topographic layer of OpenStreetMap", () => {
    expect(tile_url(6, 33, 22)).toBe(
      "https://b.tile.opentopomap.org/6/33/22.png",
    );
    expect(tile_url(2, 0, 0)).toContain("https://a.tile.opentopomap.org/2/");
  });
});

describe("RSLedTopoMap", () => {
  it("lays the tiles around the place, marked at the centre", async () => {
    const el = await mount();
    expect(el).toBeInstanceOf(RSLedTopoMap);
    expect(el.size()).toEqual(MAP_FALLBACK);
    const tiles = [...el.shadowRoot.querySelectorAll("img.tile")] as any[];
    expect(tiles.length).toBeGreaterThanOrEqual(2);
    expect(tiles.every((t) => t.src.includes(`/${ZOOM.initial}/`))).toBe(true);
    const marker = el.shadowRoot.querySelector(".marker") as HTMLElement;
    expect(marker.style.left).toBe(`${MAP_FALLBACK.width / 2}px`);
    expect(marker.style.top).toBe(`${MAP_FALLBACK.height / 2}px`);
    // The place under the centre is the place
    const centre = el.place_at(MAP_FALLBACK.width / 2, MAP_FALLBACK.height / 2);
    expect(centre.latitude).toBeCloseTo(-17.71, 6);
    expect(centre.longitude).toBeCloseTo(178.06, 6);
    // Its sources are told
    expect(el.shadowRoot.querySelector(".attribution").textContent).toContain(
      "OpenStreetMap",
    );
  });

  it("goes round the world, and stops at its top", async () => {
    // Near the date line, zoomed out: the tiles wrap
    const el = await mount(0, 179.9);
    el._zoom = ZOOM.min;
    await el.updateComplete;
    const columns = (
      [...el.shadowRoot.querySelectorAll("img.tile")] as any[]
    ).map((t) => Number(t.src.split("/").slice(-2)[0]));
    expect(columns).toContain(0);
    expect(columns).toContain(3);
    expect(Math.min(...columns)).toBe(0);
    // Near the pole: no tile above the world
    const north = await mount(85, 0);
    north._zoom = ZOOM.min;
    await north.updateComplete;
    const rows = (
      [...north.shadowRoot.querySelectorAll("img.tile")] as any[]
    ).map((t) => Number(t.src.split("/").slice(-1)[0].replace(".png", "")));
    expect(Math.min(...rows)).toBe(0);
  });

  it("zooms with its buttons and the wheel, within its levels", async () => {
    const el = await mount();
    el.shadowRoot.querySelector(".zoom_in").click();
    expect(el._zoom).toBe(ZOOM.initial + 1);
    el.shadowRoot.querySelector(".zoom_out").click();
    view(el).dispatchEvent(
      new WheelEvent("wheel", { deltaY: -100, cancelable: true }),
    );
    expect(el._zoom).toBe(ZOOM.initial + 1);
    view(el).dispatchEvent(
      new WheelEvent("wheel", { deltaY: 100, cancelable: true }),
    );
    expect(el._zoom).toBe(ZOOM.initial);
    el.zoom_by(100);
    expect(el._zoom).toBe(ZOOM.max);
    el.zoom_by(-100);
    expect(el._zoom).toBe(ZOOM.min);
  });

  it("a click picks the place under it; a drag moves the map", async () => {
    const el = await mount();
    const picked: any[] = [];
    el.addEventListener("place-picked", (e: any) => picked.push(e.detail));
    // A click (the pointer hardly moved)
    view(el).dispatchEvent(pointer("pointerdown", 100, 60));
    view(el).dispatchEvent(
      pointer("pointermove", 100 + DRAG_THRESHOLD - 2, 60),
    );
    view(el).dispatchEvent(pointer("pointerup", 100, 60));
    expect(picked.length).toBe(1);
    expect(picked[0]).toEqual(el.place_at(100, 60));
    expect(el._center).toBeNull();
    // A drag: the map follows, nothing is picked
    const before = el.center();
    view(el).dispatchEvent(pointer("pointerdown", 100, 60));
    view(el).dispatchEvent(pointer("pointermove", 160, 60));
    view(el).dispatchEvent(pointer("pointermove", 180, 90));
    view(el).dispatchEvent(pointer("pointerup", 180, 90));
    expect(picked.length).toBe(1);
    const moved = el.center();
    expect(moved.longitude).toBeLessThan(before.longitude);
    expect(moved.latitude).toBeGreaterThan(before.latitude);
    await el.updateComplete;
    // The marker stays on the place, no longer at the centre
    const marker = el.shadowRoot.querySelector(".marker") as HTMLElement;
    expect(marker.style.left).toBe(`${MAP_FALLBACK.width / 2 + 80}px`);
    // Moves without a press, or a press cancelled: nothing
    view(el).dispatchEvent(pointer("pointermove", 10, 10));
    view(el).dispatchEvent(pointer("pointerup", 10, 10));
    view(el).dispatchEvent(pointer("pointerdown", 100, 60));
    view(el).dispatchEvent(pointer("pointercancel", 100, 60));
    view(el).dispatchEvent(pointer("pointerup", 100, 60));
    expect(picked.length).toBe(1);
    // A press on a zoom button, or on a link, is its own
    const button = el.shadowRoot.querySelector(".zoom_in");
    button.dispatchEvent(pointer("pointerdown", 10, 10));
    button.dispatchEvent(pointer("pointerup", 10, 10));
    expect(picked.length).toBe(1);
  });

  it("goes back to the place when it changes", async () => {
    const el = await mount();
    el._center = { latitude: 10, longitude: 10 };
    el.latitude = 5;
    await el.updateComplete;
    expect(el.center()).toEqual({ latitude: 5, longitude: 178.06 });
    // Before it is rendered: the size of a map not laid out yet
    const bare = new RSLedTopoMap();
    expect(bare.size()).toEqual(MAP_FALLBACK);
    expect(bare.place_at(0, 0).latitude).toBeGreaterThan(0);
  });
});
