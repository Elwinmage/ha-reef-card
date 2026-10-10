import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  ReefTankApi,
  has_component,
  image_url,
  reset_catalog_cache,
} from "../src/aquarium/api";

function hass(extra: Record<string, any> = {}): any {
  return {
    config: { components: ["reeftank", "redsea"] },
    callWS: vi.fn(async (msg: any) => ({ echo: msg })),
    connection: { subscribeMessage: vi.fn(async () => () => undefined) },
    ...extra,
  };
}

afterEach(() => reset_catalog_cache());

describe("helpers", () => {
  it("knows the loaded components", () => {
    expect(has_component(hass(), "reeftank")).toBe(true);
    expect(has_component(hass(), "x")).toBe(false);
    expect(has_component(null, "x")).toBe(false);
  });
  it("resolves picture URLs", () => {
    expect(image_url("a1/b.webp")).toBe("/reeftank/images/a1/b.webp");
    expect(image_url("a1/b.webp", "/x")).toBe("/x/a1/b.webp");
    expect(image_url("/reeftank/catalog/bundled/p.webp")).toBe(
      "/reeftank/catalog/bundled/p.webp",
    );
    expect(image_url("https://x/y.png")).toBe("https://x/y.png");
    expect(image_url(null)).toBeNull();
  });
});

describe("ReefTankApi", () => {
  it("sends the WebSocket commands", async () => {
    const h = hass();
    const api = new ReefTankApi(h);
    expect(api.available).toBe(true);
    await api.list();
    await api.get("a");
    await api.save({ name: "x" } as any, 3);
    await api.save({ name: "x" } as any, null);
    await api.remove("a");
    const types = h.callWS.mock.calls.map((c: any) => c[0]);
    expect(types).toEqual([
      { type: "reeftank/aquarium/list" },
      { type: "reeftank/aquarium/get", aquarium_id: "a" },
      {
        type: "reeftank/aquarium/save",
        document: { name: "x" },
        expected_revision: 3,
      },
      { type: "reeftank/aquarium/save", document: { name: "x" } },
      { type: "reeftank/aquarium/delete", aquarium_id: "a" },
    ]);
  });

  it("turns errors into ApiError", async () => {
    const api = new ReefTankApi(
      hass({
        callWS: vi.fn(async () =>
          Promise.reject({ code: "conflict", message: "changed" }),
        ),
      }),
    );
    await expect(api.list()).rejects.toMatchObject({
      code: "conflict",
      message: "changed",
    });
    const api2 = new ReefTankApi(
      hass({
        callWS: vi.fn(async () => Promise.reject(new ApiError("x", "y"))),
      }),
    );
    await expect(api2.list()).rejects.toMatchObject({ code: "x" });
    const api3 = new ReefTankApi(
      hass({ callWS: vi.fn(async () => Promise.reject("boom")) }),
    );
    await expect(api3.list()).rejects.toMatchObject({ code: "unknown" });
  });

  it("subscribes", async () => {
    const h = hass();
    const api = new ReefTankApi(h);
    const cb = vi.fn();
    const unsub = await api.subscribe("a", cb);
    expect(typeof unsub).toBe("function");
    expect(h.connection.subscribeMessage).toHaveBeenCalledWith(cb, {
      type: "reeftank/aquarium/subscribe",
      aquarium_id: "a",
    });
    await expect(
      new ReefTankApi(hass({ connection: null })).subscribe("a", cb),
    ).rejects.toMatchObject({ code: "no_connection" });
    const failing = hass({
      connection: {
        subscribeMessage: vi.fn(async () =>
          Promise.reject({ code: "not_found", message: "" }),
        ),
      },
    });
    await expect(
      new ReefTankApi(failing).subscribe("a", cb),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("caches the catalog", async () => {
    const h = hass();
    const api = new ReefTankApi(h);
    await api.catalog();
    await api.catalog();
    expect(h.callWS).toHaveBeenCalledTimes(1);
    await api.catalog(true);
    expect(h.callWS).toHaveBeenCalledTimes(2);
    const bad = new ReefTankApi(
      hass({ callWS: vi.fn(async () => Promise.reject({ code: "x" })) }),
    );
    reset_catalog_cache();
    await expect(bad.catalog()).rejects.toBeTruthy();
    await new Promise((r) => setTimeout(r, 0));
    await expect(api.catalog()).resolves.toBeTruthy();
  });

  it("lists cloud aquariums when redsea is there", async () => {
    const h = hass({ callWS: vi.fn(async () => [{ uid: "1" }]) });
    expect(await new ReefTankApi(h).cloud_aquariums()).toEqual([{ uid: "1" }]);
    expect(
      await new ReefTankApi(
        hass({ config: { components: [] } }),
      ).cloud_aquariums(),
    ).toEqual([]);
    const old = hass({
      callWS: vi.fn(async () => Promise.reject({ code: "unknown_command" })),
    });
    expect(await new ReefTankApi(old).cloud_aquariums()).toEqual([]);
  });

  it("uploads pictures", async () => {
    const ok = {
      ok: true,
      json: async () => ({
        path: "a/b.webp",
        url: "/reeftank/images/a/b.webp",
        width: 1,
        height: 1,
      }),
    };
    const h = hass({ fetchWithAuth: vi.fn(async () => ok) });
    const api = new ReefTankApi(h);
    api.hass = h;
    const result = await api.upload("a", new Blob(["x"]), "p.jpg");
    expect(result.path).toBe("a/b.webp");
    const [url, init] = h.fetchWithAuth.mock.calls[0];
    expect(url).toBe("/api/reeftank/upload/a");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);

    const refused = hass({
      fetchWithAuth: vi.fn(async () => ({
        ok: false,
        status: 415,
        statusText: "x",
        json: async () => ({ message: "unsupported_format" }),
      })),
    });
    await expect(
      new ReefTankApi(refused).upload("a", new Blob(["x"])),
    ).rejects.toMatchObject({ code: "unsupported_format" });
    const broken = hass({
      fetchWithAuth: vi.fn(async () => ({
        ok: false,
        status: 500,
        statusText: "err",
        json: async () => Promise.reject(new Error()),
      })),
    });
    await expect(
      new ReefTankApi(broken).upload("a", new Blob(["x"])),
    ).rejects.toMatchObject({ code: "500" });
    await expect(
      new ReefTankApi(hass()).upload("a", new Blob(["x"])),
    ).rejects.toMatchObject({ code: "no_connection" });
  });
});
