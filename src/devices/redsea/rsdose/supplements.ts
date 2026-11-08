// Supplements of the ReefDose, read from the redsea integration.
//
// The list used to be bundled in the card (supplements_list.ts). It now comes
// from the supplements catalog the integration keeps up to date
// (reeftech-catalog), through its websocket: a new supplement no longer needs
// a release of the card. The card itself never accesses the network.
import { Supplement } from "../../../types/supplement";
import { GENERIC_CONTAINER_IMG } from "../../../base/ui_images";

// Bottle shown when a supplement has no visual of its own
export const GENERIC_CONTAINER = GENERIC_CONTAINER_IMG;

const CATALOG_COMMAND = "redsea/catalog";
const SUBSCRIBE_COMMAND = "redsea/catalog/subscribe";

// A supplement as the catalog describes it (`data.items` of redsea/catalog)
interface CatalogSupplement {
  uid?: string;
  brand?: string;
  name?: string;
  fullname?: string;
  display_name?: string;
  short_name?: string;
  made_by_redsea?: boolean;
  sizes?: number[];
  kind?: string;
  bundle?: { slot: number; part: string; ratio: number }[];
  image?: string | null;
  thumb?: string | null;
}

function part_of(item: CatalogSupplement | undefined): any {
  return {
    uid: item?.uid,
    name: item?.name,
    display_name: item?.display_name ?? null,
    short_name: item?.short_name,
    brand_name: item?.brand,
    made_by_redsea: Boolean(item?.made_by_redsea),
  };
}

// The catalog entries in the format of the former bundled list, sorted by
// full name, plus their visuals.
export function from_catalog(
  items: Record<string, CatalogSupplement>,
): Supplement[] {
  const list: Supplement[] = [];
  for (const [id, item] of Object.entries(items)) {
    const supplement: Supplement = {
      uid: item.uid ?? id,
      name: item.name ?? id,
      display_name: item.display_name ?? null,
      short_name: item.short_name ?? "",
      brand_name: item.brand ?? "",
      type: item.kind === "bundle" ? "Bundle" : null,
      concentration: null,
      made_by_redsea: Boolean(item.made_by_redsea),
      fullname: item.fullname ?? id,
      image: item.image ?? null,
      thumb: item.thumb ?? null,
    };
    if (item.sizes?.length) {
      supplement.sizes = [...item.sizes];
    }
    if (item.bundle?.length) {
      const bundle: Record<string, any> = {};
      for (const part of [...item.bundle].sort((a, b) => a.slot - b.slot)) {
        bundle[String(part.slot)] = {
          supplement: part_of(items[part.part]),
          ratio: part.ratio,
        };
      }
      supplement.bundle = bundle;
    }
    list.push(supplement);
  }
  return list.sort((a, b) => a.fullname.localeCompare(b.fullname));
}

export class Supplements {
  _list: Supplement[];
  _loading: boolean;
  _loaded: boolean;
  _version: string | null;
  _unsubscribe: (() => void) | null;
  _listeners: Set<() => void>;

  constructor() {
    this._list = [];
    this._loading = false;
    this._loaded = false;
    this._version = null;
    this._unsubscribe = null;
    this._listeners = new Set();
  } //end of constructor

  // The catalog has been read at least once (until then, a supplement
  // without a visual may just not be known yet)
  get loaded(): boolean {
    return this._loaded;
  }

  // Be told each time the catalog is (re)read; returns the unsubscribe
  on_change(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  // Replace the list with the entries of a catalog
  set_catalog(items: Record<string, CatalogSupplement>) {
    this._list = from_catalog(items);
  }

  // Load the catalog from the integration (once), then follow its updates.
  // Without the websocket (tests, redsea not loaded), the list stays as is.
  async ensure_loaded(hass: any): Promise<void> {
    if (this._loaded || this._loading || typeof hass?.callWS !== "function") {
      return;
    }
    this._loading = true;
    try {
      await this._fetch(hass);
      if (!this._unsubscribe && hass.connection?.subscribeMessage) {
        this._unsubscribe = await hass.connection.subscribeMessage(
          (event: { version: string | null; updating: boolean }) => {
            if (!event.updating && event.version !== this._version) {
              this._fetch(hass).catch(() => undefined);
            }
          },
          { type: SUBSCRIBE_COMMAND },
        );
      }
    } catch (err) {
      // redsea not loaded yet (or without a ReefDose): try again later
      console.debug("Supplements catalog not available", err);
    } finally {
      this._loading = false;
    }
  }

  async _fetch(hass: any): Promise<void> {
    const result = await hass.callWS({ type: CATALOG_COMMAND });
    this._version = result?.version ?? null;
    this.set_catalog(result?.data?.items ?? {});
    this._loaded = true;
    for (const listener of [...this._listeners]) {
      listener();
    }
  }

  // Visual of a supplement, or null when it has none
  image_of(uid: string | null | undefined): string | null {
    const supplement = this._list.find((s) => s.uid === uid);
    return supplement?.image ?? null;
  }

  get_supplement_from_uid(uid) {
    let supplement = null;
    for (supplement of this._list) {
      if (supplement.uid === uid) {
        return supplement;
      }
      if (supplement.type === "Bundle") {
        for (const supp of Object.keys(supplement.bundle)) {
          const bundle_supplement = supplement.bundle[supp];
          if (bundle_supplement.supplement.uid === uid) {
            bundle_supplement.supplement.sizes = supplement.sizes.map(
              function (x) {
                return x * bundle_supplement.ratio;
              },
            );
            return bundle_supplement.supplement;
          }
        }
      } //if
    } //for
    return null;
  } //end of function get_supplement

  get_supplement_from_fullname(name) {
    let supplement = null;
    for (supplement of this._list) {
      if (supplement.fullname === name) {
        return supplement;
      }
      if (supplement.type === "Bundle") {
        for (const supp of Object.keys(supplement.bundle)) {
          const bundle_supplement = supplement.bundle[supp];
          if (bundle_supplement.supplement.fullname === name) {
            bundle_supplement.supplement.sizes = supplement.sizes.map(
              function (x) {
                return x * bundle_supplement.ratio;
              },
            );
            return bundle_supplement.supplement;
          }
        }
      } //if
    } //for
    return null;
  } //end of function get_supplement
}

const supplements_list = new Supplements();
export default supplements_list;
