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
export const IMAGES_URL = "/reeftank/images";
export const UPLOAD_URL = "/api/reeftank/upload/";

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

/**
 * URL of a view picture: an uploaded picture is relative to the images
 * path, a catalog picture is already absolute.
 */
export function image_url(
  path: string | null | undefined,
  images_url: string = IMAGES_URL,
): string | null {
  if (!path) return null;
  if (path.startsWith("/") || /^https?:/.test(path)) return path;
  return `${images_url}/${path}`;
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
