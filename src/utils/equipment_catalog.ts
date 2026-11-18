/**
 * The equipment of the reeftech-catalog (`equipment` section), as the
 * reef_maintenance integration serves it (websocket `reef_maintenance/catalog`):
 * heaters, pumps, fans... that Home Assistant cannot talk to, with their brand,
 * model, picture and category. The card never reaches the network itself.
 *
 * A socket of a power strip can be linked to one of them (`linked_equipment`
 * of the socket's configuration):
 *
 *   - an item id (`eheim-thermocontrol-200`): its picture is drawn;
 *   - `category:<id>` (`category:heater`): any equipment of that category, its
 *     picture or icon is drawn.
 *
 * What is drawn for a link: the item's picture, else the category's picture,
 * else the category's icon, else the one of the `other` category, else a plug.
 */

/** Prefix of a link to a category rather than to an item. */
export const CATEGORY_PREFIX = "category:";

/** Icon of last resort. */
export const GENERIC_EQUIPMENT_ICON = "mdi:power-plug";

export interface EquipmentView {
  categories: Record<string, any>;
  items: Record<string, any>;
}

export interface EquipmentOption {
  /** Value to store in `linked_equipment` */
  value: string;
  /** Text of the option: brand and model, or the category alone */
  text: string;
}

export interface EquipmentGroup {
  category: string;
  name: string;
  options: EquipmentOption[];
}

export interface EquipmentVisual {
  name: string;
  /** Picture to draw, null when the link has none */
  image: string | null;
  /** Icon to draw when there is no picture */
  icon: string;
}

/** A localized text of the catalog (`{en, fr}`), in the user's language. */
export function localized(value: any, lang: string, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const short = String(lang || "en").split("-")[0];
    return String(value[lang] ?? value[short] ?? value.en ?? fallback);
  }
  return fallback;
}

/** Brand and model of an item, as the pickers show them. */
export function equipment_title(item: any, id: string): string {
  const text = [item?.brand, item?.model].filter(Boolean).join(" ");
  return text || id;
}

/** The view served by the integration, null if it is not shaped as expected. */
export function equipment_view(answer: any): EquipmentView | null {
  const data = answer?.data ?? answer;
  if (!data || typeof data.items !== "object" || data.items === null)
    return null;
  return {
    categories:
      typeof data.categories === "object" && data.categories !== null
        ? data.categories
        : {},
    items: data.items,
  };
}

/**
 * The catalog grouped by category (alphabetical, `other` last), each group
 * starting with "any <category>" then its items by brand and model.
 */
export function equipment_groups(
  view: EquipmentView,
  lang: string,
  any_label: (category: string) => string,
): EquipmentGroup[] {
  const groups = new Map<string, EquipmentGroup>();
  const group_of = (category: string): EquipmentGroup => {
    let group = groups.get(category);
    if (!group) {
      group = {
        category,
        name: localized(view.categories[category]?.name, lang, category),
        options: [],
      };
      groups.set(category, group);
    }
    return group;
  };
  for (const category of Object.keys(view.categories)) group_of(category);
  for (const [id, item] of Object.entries<any>(view.items)) {
    group_of(String(item?.category ?? "other")).options.push({
      value: id,
      text: equipment_title(item, id),
    });
  }
  const ordered = [...groups.values()].sort(
    (a, b) =>
      Number(a.category === "other") - Number(b.category === "other") ||
      a.name.localeCompare(b.name),
  );
  for (const group of ordered) {
    group.options.sort((a, b) => a.text.localeCompare(b.text));
    group.options.unshift({
      value: CATEGORY_PREFIX + group.category,
      text: any_label(group.name),
    });
  }
  return ordered;
}

/**
 * What to draw for a link, null when it points at nothing the catalog has
 * (not loaded yet, or an entry removed by a release).
 */
export function equipment_visual(
  view: EquipmentView | null,
  link: string | null | undefined,
  lang: string,
): EquipmentVisual | null {
  if (!view || !link) return null;
  let item: any = null;
  let category_id: string | undefined;
  if (link.startsWith(CATEGORY_PREFIX)) {
    category_id = link.slice(CATEGORY_PREFIX.length);
  } else {
    item = view.items[link];
    if (!item) return null;
    category_id = item.category;
  }
  const category = category_id ? view.categories[category_id] : undefined;
  if (!item && !category) return null;
  const other = view.categories.other;
  const image =
    (item && (item.thumb || item.image)) ||
    category?.thumb ||
    category?.image ||
    null;
  return {
    name: item
      ? equipment_title(item, link)
      : localized(category?.name, lang, category_id ?? ""),
    image,
    icon: category?.icon || other?.icon || GENERIC_EQUIPMENT_ICON,
  };
}

/** Page-wide cache: one question to the integration, whatever the cards. */
let loading: Promise<EquipmentView | null> | null = null;
let loaded: EquipmentView | null = null;

/** The view already loaded, null before. */
export function cached_equipment(): EquipmentView | null {
  return loaded;
}

/**
 * Ask the integration for the equipment catalog (once per page, again after a
 * failure).
 *
 * @returns the view, or null when no integration serves it
 */
export function load_equipment(hass: any): Promise<EquipmentView | null> {
  if (loaded) return Promise.resolve(loaded);
  if (!loading) {
    loading = (async () => {
      if (typeof hass?.callWS !== "function") return null;
      try {
        loaded = equipment_view(
          await hass.callWS({ type: "reef_maintenance/catalog" }),
        );
      } catch {
        // Integration absent or too old: nothing to link to
        loaded = null;
      }
      return loaded;
    })().then((view) => {
      if (!view) loading = null;
      return view;
    });
  }
  return loading;
}

/** Forget what was loaded (tests). */
export function reset_equipment(): void {
  loading = null;
  loaded = null;
}

// -- Level 2: keep the maintenance of a linked equipment --------------------

/** An equipment kept by the reef_maintenance integration. */
export interface KeptEquipment {
  equipment_id: string;
  name: string;
  source: string;
  model: string;
  brand: string;
  entry_id: string;
  tasks: string[];
}

/** The stored reference (`item:<id>` / `category:<id>`) of a card link. */
export function maintenance_source(link: string): string {
  return link.startsWith(CATEGORY_PREFIX) ? link : `item:${link}`;
}

/** The equipments reef_maintenance keeps; an empty list without it. */
export async function list_kept(hass: any): Promise<KeptEquipment[]> {
  if (typeof hass?.callWS !== "function") return [];
  try {
    const answer = await hass.callWS({
      type: "reef_maintenance/equipment/list",
    });
    return Array.isArray(answer?.equipments) ? answer.equipments : [];
  } catch {
    return [];
  }
}

/**
 * Keep the maintenance of an equipment of the catalog: reef_maintenance
 * creates it with the tasks the catalog gives it.
 *
 * @returns the id of the equipment, null if it could not be created (the
 *   integration is absent or too old, or the user is not an administrator)
 */
export async function keep_maintenance(
  hass: any,
  link: string,
  name?: string,
): Promise<string | null> {
  if (typeof hass?.callWS !== "function") return null;
  try {
    const message: Record<string, unknown> = {
      type: "reef_maintenance/equipment/add",
      source: maintenance_source(link),
    };
    if (name) message.name = name;
    const answer = await hass.callWS(message);
    return typeof answer?.equipment_id === "string"
      ? answer.equipment_id
      : null;
  } catch {
    return null;
  }
}

/** Stop keeping an equipment; true when it is gone. */
export async function drop_maintenance(
  hass: any,
  equipment_id: string,
): Promise<boolean> {
  if (typeof hass?.callWS !== "function") return false;
  try {
    await hass.callWS({
      type: "reef_maintenance/equipment/remove",
      equipment_id,
    });
    return true;
  } catch {
    return false;
  }
}
