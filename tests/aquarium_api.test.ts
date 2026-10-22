import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  ImageUrls,
  MAX_SIGN_PATHS,
  ReefTankApi,
  has_component,
  image_url,
  is_upload,
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
    // An upload is private: only its signed URL, unknown otherwise
    expect(image_url("a1/b.webp")).toBeNull();
    expect(image_url("a1/b.webp", { "a1/b.webp": "/s?authSig=1" })).toBe(
      "/s?authSig=1",
    );
    // reeftank < 0.1.1: the legacy static path
    expect(image_url("a1/b.webp", null, "/x")).toBe("/x/a1/b.webp");
    expect(is_upload("a1/b.webp")).toBe(true);
    expect(is_upload("/reeftank/catalog/p.webp")).toBe(false);
    expect(is_upload(null)).toBe(false);
    expect(image_url("/reeftank/catalog/bundled/p.webp")).toBe(
      "/reeftank/catalog/bundled/p.webp",
    );
    expect(image_url("https://x/y.png")).toBe("https://x/y.png");
    expect(image_url(null)).toBeNull();
  });
});

describe("ImageUrls", () => {
  const signer = (fail: boolean = false) => {
    let n = 0;
    const api: any = {
      sign_images: vi.fn(async (paths: string[]) => {
        if (fail) throw new ApiError("unknown_command", "");
        n += 1;
        return Object.fromEntries(
          paths
            .filter((p) => !p.startsWith("bad"))
            .map((p) => [p, `/api/reeftank/images/${p}?authSig=${n}`]),
        );
      }),
    };
    return api;
  };
  const flush = () => new Promise((r) => setTimeout(r, 0));

  afterEach(() => vi.useRealTimers());

  it("uses the signed URLs of the payload", () => {
    const changed = vi.fn();
    const urls = new ImageUrls(() => signer(), changed);
    urls.load({ images: { "a/b.webp": "/s1" }, images_ttl: 86400 });
    expect(urls.url("a/b.webp")).toBe("/s1");
    expect(urls.url("/reeftank/catalog/p.webp")).toBe(
      "/reeftank/catalog/p.webp",
    );
    expect(urls.url(null)).toBeNull();
    urls.stop();
  });

  it("signs an unknown picture once, in the background", async () => {
    const api = signer();
    const changed = vi.fn();
    const urls = new ImageUrls(() => api, changed);
    urls.load({ images: {} });
    expect(urls.url("a/new.webp")).toBeNull();
    expect(urls.url("a/new.webp")).toBeNull(); // already being signed
    await flush();
    expect(api.sign_images).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(urls.url("a/new.webp")).toBe(
      "/api/reeftank/images/a/new.webp?authSig=1",
    );
    // a path the integration refuses: asked once, never again
    expect(urls.url("bad/x.webp")).toBeNull();
    await flush();
    expect(urls.url("bad/x.webp")).toBeNull();
    await flush();
    expect(api.sign_images).toHaveBeenCalledTimes(2);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it("re-signs a picture that failed to load, once per period", async () => {
    const api = signer();
    const urls = new ImageUrls(() => api, vi.fn());
    urls.load({ images: { "a/b.webp": "/expired" }, images_ttl: 3600 });
    urls.failed("a/b.webp");
    urls.failed("a/b.webp");
    urls.failed("/reeftank/catalog/p.webp");
    await flush();
    expect(api.sign_images).toHaveBeenCalledTimes(1);
    expect(urls.url("a/b.webp")).toContain("authSig=1");
    urls.stop();
  });

  it("renews the URLs before they expire", async () => {
    vi.useFakeTimers();
    const api = signer();
    const changed = vi.fn();
    const urls = new ImageUrls(() => api, changed);
    urls.load({ images: { "a/b.webp": "/s0" }, images_ttl: 1000 });
    await vi.advanceTimersByTimeAsync(799 * 1000);
    expect(api.sign_images).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000);
    expect(api.sign_images).toHaveBeenCalledWith(["a/b.webp"]);
    expect(urls.url("a/b.webp")).toContain("authSig=1");
    // and again, the next period
    await vi.advanceTimersByTimeAsync(800 * 1000);
    expect(urls.url("a/b.webp")).toContain("authSig=2");
    urls.stop();
    await vi.advanceTimersByTimeAsync(2000 * 1000);
    expect(api.sign_images).toHaveBeenCalledTimes(2);
  });

  it("signs many pictures in batches", async () => {
    vi.useFakeTimers();
    const api = signer();
    const urls = new ImageUrls(() => api, vi.fn());
    const images = Object.fromEntries(
      Array.from({ length: MAX_SIGN_PATHS + 1 }, (_, i) => [
        `a/${i}.webp`,
        "/",
      ]),
    );
    urls.load({ images, images_ttl: 10 }); // renewal never under a minute
    await vi.advanceTimersByTimeAsync(60 * 1000);
    expect(api.sign_images).toHaveBeenCalledTimes(2);
    urls.stop();
  });

  it("keeps the legacy static path of older integrations", async () => {
    const api = signer();
    const urls = new ImageUrls(() => api, vi.fn());
    urls.load({ images_url: "/reeftank/images" });
    expect(urls.url("a/b.webp")).toBe("/reeftank/images/a/b.webp");
    urls.failed("a/b.webp");
    await flush();
    expect(api.sign_images).not.toHaveBeenCalled();
    urls.load(null);
    expect(urls.url("a/b.webp")).toBeNull();
  });

  it("takes an uploaded picture's URL and survives errors", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const api = signer(true);
    let current: any = null;
    const urls = new ImageUrls(() => current, vi.fn());
    urls.load({ images: {} });
    expect(urls.url("a/b.webp")).toBeNull(); // no api yet: nothing asked
    current = api;
    urls.add("a/up.webp", "/signed-up");
    expect(urls.url("a/up.webp")).toBe("/signed-up");
    urls.failed("a/up.webp");
    await flush();
    expect(warn).toHaveBeenCalled();
    expect(urls.url("a/up.webp")).toBe("/signed-up");
    warn.mockRestore();
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
    await api.sign_images(["a/b.webp"]);
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
      { type: "reeftank/images/sign", paths: ["a/b.webp"] },
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
