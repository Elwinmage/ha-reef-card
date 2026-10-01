/**
 * Search of a place by its name (rs-place-search, Open-Meteo geocoding).
 */
import { afterEach, describe, expect, it } from "vitest";

import "../src/devices/index";
import {
  GEOCODING_URL,
  PLACE_COUNT,
  RSPlaceSearch,
  place_label,
  search_places,
} from "../src/utils/place_search";
import i18n from "../src/translations/myi18n";

/** A fetch answering with a body, recording the URLs asked. */
function fetcher(body: any, ok = true, status = 200) {
  const urls: string[] = [];
  const fn = async (url: string) => {
    urls.push(url);
    return { ok, status, json: async () => body };
  };
  return { fn, urls };
}

const MALDIVES = {
  results: [
    { name: "Maldives", country: "Maldives", latitude: 3.2, longitude: 73.2 },
    {
      name: "Malé",
      admin1: "Kaafu",
      country: "Maldives",
      latitude: 4.17,
      longitude: 73.5,
    },
    { name: "Nowhere", latitude: "x", longitude: 1 },
  ],
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("place_label()", () => {
  it("joins name, region and country, without repeats nor gaps", () => {
    expect(place_label(MALDIVES.results[0])).toBe("Maldives");
    expect(place_label(MALDIVES.results[1])).toBe("Malé, Kaafu, Maldives");
    expect(place_label({ name: "A", admin1: "", country: 3 })).toBe("A");
    expect(place_label(null)).toBe("");
  });
});

describe("search_places()", () => {
  it("asks the geocoding API and keeps the places with coordinates", async () => {
    const { fn, urls } = fetcher(MALDIVES);
    const places = await search_places("  maldives ", "fr", fn);
    expect(places).toEqual([
      { label: "Maldives", latitude: 3.2, longitude: 73.2 },
      { label: "Malé, Kaafu, Maldives", latitude: 4.17, longitude: 73.5 },
    ]);
    const url = new URL(urls[0]);
    expect(`${url.origin}${url.pathname}`).toBe(GEOCODING_URL);
    expect(url.searchParams.get("name")).toBe("maldives");
    expect(url.searchParams.get("language")).toBe("fr");
    expect(url.searchParams.get("count")).toBe(String(PLACE_COUNT));
  });

  it("too short a name asks nothing; no result is an empty list", async () => {
    const { fn, urls } = fetcher({});
    expect(await search_places("m", "en", fn)).toEqual([]);
    expect(urls).toHaveLength(0);
    expect(await search_places("zzzz", undefined, fn)).toEqual([]);
  });

  it("an HTTP error is thrown", async () => {
    await expect(
      search_places("fakarava", "en", fetcher({}, false, 500).fn),
    ).rejects.toThrow("HTTP 500");
    await expect(
      search_places("fakarava", "en", async () => null),
    ).rejects.toThrow("HTTP ?");
  });

  it("uses the browser's fetch by default", async () => {
    const saved = globalThis.fetch;
    const { fn } = fetcher(MALDIVES);
    globalThis.fetch = fn as any;
    try {
      expect(await search_places("maldives")).toHaveLength(2);
    } finally {
      globalThis.fetch = saved;
    }
  });
});

describe("RSPlaceSearch", () => {
  async function mount(body: any = MALDIVES, ok = true) {
    const el = new RSPlaceSearch() as any;
    el.hass = { language: "fr-FR" };
    const f = fetcher(body, ok, 503);
    el.fetcher = f.fn;
    document.body.appendChild(el);
    await el.updateComplete;
    return { el, root: el.shadowRoot as ShadowRoot, urls: f.urls };
  }

  function type(root: ShadowRoot, value: string) {
    const input = root.querySelector("input.query") as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event("input"));
  }

  it("Enter searches; a place picked is told and fills the field", async () => {
    const { el, root, urls } = await mount();
    type(root, "maldives");
    const input = root.querySelector("input.query") as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(urls).toHaveLength(0);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    expect(new URL(urls[0]).searchParams.get("language")).toBe("fr");
    const items = root.querySelectorAll("li");
    expect(items).toHaveLength(2);
    const picked: any[] = [];
    el.addEventListener("place-picked", (e: CustomEvent) =>
      picked.push(e.detail),
    );
    (items[1] as HTMLElement).click();
    await el.updateComplete;
    expect(picked).toEqual([
      { label: "Malé, Kaafu, Maldives", latitude: 4.17, longitude: 73.5 },
    ]);
    expect(root.querySelector("ul")).toBeNull();
    expect(el._query).toBe("Malé, Kaafu, Maldives");
  });

  it("the button searches; nothing found is said", async () => {
    const { el, root } = await mount({ results: [] });
    type(root, "zzzz");
    (root.querySelector("button.go") as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    const note = root.querySelector(".note")!;
    expect(note.textContent!.trim()).toBe(i18n._("place_search_none"));
    expect(note.classList.contains("error")).toBe(false);
  });

  it("a failed lookup is shown as an error; English by default", async () => {
    const { el, root, urls } = await mount({}, false);
    el.hass = null;
    type(root, "fakarava");
    await el.search();
    await el.updateComplete;
    const note = root.querySelector(".note.error")!;
    expect(note.textContent).toContain(i18n._("place_search_failed"));
    expect(note.textContent).toContain("HTTP 503");
    expect(new URL(urls[0]).searchParams.get("language")).toBe("en");
    // A rejection that is not an Error
    el.fetcher = async () => {
      throw "offline";
    };
    await el.search();
    expect(el._note).toContain("offline");
  });

  it("uses the browser's fetch by default", async () => {
    const saved = globalThis.fetch;
    const { fn, urls } = fetcher(MALDIVES);
    globalThis.fetch = fn as any;
    try {
      const el = new RSPlaceSearch() as any;
      el._query = "maldives";
      await el.search();
      expect(urls).toHaveLength(1);
      expect(el._places).toHaveLength(2);
    } finally {
      globalThis.fetch = saved;
    }
  });
});
