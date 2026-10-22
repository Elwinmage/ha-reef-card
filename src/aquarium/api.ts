/**
 * Access to the reeftank integration (and to the cloud aquariums of the
 * vendor integrations) through the Home Assistant WebSocket API.
 */

import type { HassConfig } from "../types/index";
import type {
  AquariumDocument,
  AquariumPayload,
  AquariumSummary,
  Catalog,
  CloudAquarium,
} from "./types";

export const REEFTANK_DOMAIN = "reeftank";
export const UPLOAD_URL = "/api/reeftank/upload/";
/** Most paths signed by one `reeftank/images/sign` call. */
export const MAX_SIGN_PATHS = 64;
/** Signed URLs are renewed at this fraction of their lifetime. */
const RENEW_RATIO = 0.8;
const MIN_RENEW_MS = 60 * 1000;

/** Error of a WebSocket call, with its code (not_found, conflict...). */
export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function to_error(err: any): ApiError {
  if (err instanceof ApiError) return err;
  return new ApiError(
    String(err?.code ?? "unknown"),
    String(err?.message ?? err),
  );
}

/** Whether an integration is loaded in this Home Assistant. */
export function has_component(
  hass: HassConfig | null | undefined,
  domain: string,
): boolean {
  const components: string[] | undefined = (hass as any)?.config?.components;
  return Array.isArray(components) && components.includes(domain);
}

/** Whether a picture path is an upload (private) rather than a catalog URL. */
export function is_upload(path: string | null | undefined): path is string {
  return Boolean(path) && !path!.startsWith("/") && !/^https?:/.test(path!);
}

/**
 * URL of a view picture. A catalog picture is already an absolute, public
 * URL. An uploaded picture is private: its URL is the signed one handed out
 * by the integration (`images`), or, with a reeftank older than 0.1.1, the
 * legacy static path (`legacy_images_url`). null while it is not known.
 */
export function image_url(
  path: string | null | undefined,
  images?: Record<string, string> | null,
  legacy_images_url?: string | null,
): string | null {
  if (!path) return null;
  if (!is_upload(path)) return path;
  const signed = images?.[path];
  if (signed) return signed;
  return legacy_images_url ? `${legacy_images_url}/${path}` : null;
}

/**
 * Signed URLs of the uploaded pictures, kept valid.
 *
 * The integration serves uploaded pictures to authenticated requests only;
 * an <img> cannot send the token, so it uses URLs signed for the user that
 * expire after `images_ttl`. This keeps them, renews them before they
 * expire, signs a picture it does not know yet (undo, new upload) and
 * re-signs once a picture that failed to load (expired, token revoked).
 */
export class ImageUrls {
  private _urls: Record<string, string> = {};
  private _legacy: string | null = null;
  private _ttl_s = 0;
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _pending = new Set<string>();
  /** Paths already asked for since the last renewal (no request loop). */
  private _asked = new Set<string>();

  constructor(
    private _api: () => ReefTankApi | null,
    private _changed: () => void,
  ) {}

  /** Take the pictures of a payload (get, subscribe, save). */
  load(payload: Partial<AquariumPayload> | null | undefined): void {
    this._urls = { ...(payload?.images ?? {}) };
    // An older integration: plain static path, nothing to sign
    this._legacy = payload?.images ? null : (payload?.images_url ?? null);
    this._asked.clear();
    this._schedule(payload?.images_ttl ?? 0);
  }

  /** A picture just uploaded, with the URL the upload returned. */
  add(path: string, url: string): void {
    this._urls[path] = url;
    this._asked.delete(path);
  }

  /** URL of a view picture; an unknown upload is signed in the background. */
  url(path: string | null | undefined): string | null {
    const url = image_url(path, this._urls, this._legacy);
    if (!url && is_upload(path)) this._ask(path);
    return url;
  }

  /** An <img> did not load: sign its picture again (once per period). */
  failed(path: string | null | undefined): void {
    if (is_upload(path) && !this._legacy) this._ask(path);
  }

  /** Stop renewing (element removed from the page). */
  stop(): void {
    if (this._timer) clearTimeout(this._timer);
    this._timer = null;
  }

  private _ask(path: string): void {
    if (this._asked.has(path)) return;
    this._asked.add(path);
    void this._sign([path]);
  }

  private _schedule(ttl_s: number): void {
    this.stop();
    this._ttl_s = ttl_s;
    if (!ttl_s) return;
    const delay = Math.max(MIN_RENEW_MS, ttl_s * 1000 * RENEW_RATIO);
    this._timer = setTimeout(() => {
      this._timer = null;
      this._asked.clear();
      void this._sign(Object.keys(this._urls)).finally(() =>
        this._schedule(this._ttl_s),
      );
    }, delay);
  }

  private async _sign(paths: string[]): Promise<void> {
    const api = this._api();
    const todo = paths.filter((p) => !this._pending.has(p));
    if (!api || !todo.length) return;
    todo.forEach((p) => this._pending.add(p));
    try {
      let changed = false;
      for (let i = 0; i < todo.length; i += MAX_SIGN_PATHS) {
        const signed = await api.sign_images(todo.slice(i, i + MAX_SIGN_PATHS));
        Object.assign(this._urls, signed);
        changed ||= Object.keys(signed).length > 0;
      }
      if (changed) this._changed();
    } catch (err) {
      console.warn("aquarium: cannot sign pictures", err);
    } finally {
      todo.forEach((p) => this._pending.delete(p));
    }
  }
}

let _catalog: { at: number; promise: Promise<Catalog> } | null = null;
const CATALOG_TTL_MS = 5 * 60 * 1000;

export class ReefTankApi {
  private _hass: HassConfig;

  constructor(hass: HassConfig) {
    this._hass = hass;
  }

  set hass(hass: HassConfig) {
    this._hass = hass;
  }

  /** Whether the reeftank integration is loaded. */
  get available(): boolean {
    return has_component(this._hass, REEFTANK_DOMAIN);
  }

  private async _ws<T>(msg: Record<string, any>): Promise<T> {
    try {
      return (await (this._hass as any).callWS(msg)) as T;
    } catch (err) {
      throw to_error(err);
    }
  }

  list(): Promise<AquariumSummary[]> {
    return this._ws({ type: "reeftank/aquarium/list" });
  }

  get(aquarium_id: string): Promise<AquariumPayload> {
    return this._ws({ type: "reeftank/aquarium/get", aquarium_id });
  }

  /**
   * Follow an aquarium: `callback` gets the payload now and after every
   * change, or {deleted: true}.
   * @return the unsubscribe function
   */
  async subscribe(
    aquarium_id: string,
    callback: (payload: AquariumPayload | { deleted: true }) => void,
  ): Promise<() => void> {
    const connection = (this._hass as any)?.connection;
    if (!connection?.subscribeMessage)
      throw new ApiError("no_connection", "no connection");
    try {
      return await connection.subscribeMessage(callback, {
        type: "reeftank/aquarium/subscribe",
        aquarium_id,
      });
    } catch (err) {
      throw to_error(err);
    }
  }

  save(
    document: AquariumDocument,
    expected_revision?: number | null,
  ): Promise<AquariumPayload> {
    const msg: Record<string, any> = {
      type: "reeftank/aquarium/save",
      document,
    };
    if (expected_revision !== undefined && expected_revision !== null) {
      msg.expected_revision = expected_revision;
    }
    return this._ws(msg);
  }

  remove(aquarium_id: string): Promise<void> {
    return this._ws({ type: "reeftank/aquarium/delete", aquarium_id });
  }

  /** URLs of uploaded pictures signed for this user: {path: url}. */
  sign_images(paths: string[]): Promise<Record<string, string>> {
    return this._ws({ type: "reeftank/images/sign", paths });
  }

  /**
   * Be told when a catalog release is installed.
   * @return the unsubscribe function
   */
  async subscribe_catalog(callback: () => void): Promise<() => void> {
    const connection = (this._hass as any)?.connection;
    if (!connection?.subscribeMessage)
      throw new ApiError("no_connection", "no connection");
    try {
      return await connection.subscribeMessage(
        () => {
          reset_catalog_cache();
          callback();
        },
        { type: "reeftank/catalog/subscribe" },
      );
    } catch (err) {
      throw to_error(err);
    }
  }

  /** The asset catalog, cached a few minutes for the whole page. */
  catalog(force: boolean = false): Promise<Catalog> {
    const now = Date.now();
    if (force || !_catalog || now - _catalog.at > CATALOG_TTL_MS) {
      const promise = this._ws<Catalog>({ type: "reeftank/catalog" });
      _catalog = { at: now, promise };
      promise.catch(() => (_catalog = null));
    }
    return _catalog.promise;
  }

  /** Aquarium of every vendor cloud whose integration is loaded. */
  async cloud_aquariums(): Promise<CloudAquarium[]> {
    if (!has_component(this._hass, "redsea")) return [];
    try {
      return await this._ws<CloudAquarium[]>({ type: "redsea/aquariums" });
    } catch {
      // An older redsea integration without the command
      return [];
    }
  }

  /**
   * Upload a background picture.
   * @return where it is stored and its size once normalised
   */
  async upload(
    aquarium_id: string,
    file: Blob,
    name: string = "picture",
  ): Promise<{ path: string; url: string; width: number; height: number }> {
    const form = new FormData();
    form.append("file", file, name);
    const fetcher = (this._hass as any)?.fetchWithAuth;
    if (typeof fetcher !== "function")
      throw new ApiError("no_connection", "no connection");
    const response: Response = await fetcher.call(
      this._hass,
      UPLOAD_URL + aquarium_id,
      {
        method: "POST",
        body: form,
      },
    );
    let body: any = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    if (!response.ok) {
      throw new ApiError(
        String(body?.message ?? response.status),
        String(body?.message ?? response.statusText),
      );
    }
    return body;
  }
}

/** Forget the cached catalog (tests, user catalog changed). */
export function reset_catalog_cache(): void {
  _catalog = null;
}
