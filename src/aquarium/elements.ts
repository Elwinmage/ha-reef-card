/**
 * Devices and entities placed on an aquarium picture.
 *
 * - an entity is drawn by the card's own elements (common-sensor,
 *   common-switch...), so it looks and acts as on the device views;
 * - a device shows its picture; a tap opens its view of the card when the
 *   card knows the model, its Home Assistant page otherwise.
 */

import type { HassConfig, DeviceInfo, ElementConfig } from "../types/index";
import type { SceneElement } from "./types";
import DeviceList, { domain_of, resolve_device_model } from "../utils/common";
import { MyElement } from "../base/element";
import { RSDevice } from "../devices/device";
import { default_element_type } from "./tree";

/** Style of an entity chip over the picture. */
const CHIP_CSS: Record<string, string> = {
  "background-color": "rgba(10,20,35,0.62)",
  color: "white",
  padding: "2px 8px",
  "border-radius": "10px",
  "font-size": "0.85em",
  "white-space": "nowrap",
  "backdrop-filter": "blur(2px)",
};

/**
 * Configuration of the card element drawing an entity.
 */
export function entity_element_config(
  entity_id: string,
  type?: string,
  label?: string,
): ElementConfig {
  const element_type = type || default_element_type(entity_id);
  const domain = entity_id.split(".")[0];
  // The card's more-info action takes the entity key as a plain string
  const more_info = {
    domain: "redsea_ui",
    action: "more-info",
    data: entity_id,
  } as any;
  if (element_type === "common-switch") {
    return {
      type: "common-switch",
      name: entity_id,
      style: "switch",
      label: label || false,
      css: { ...CHIP_CSS },
      tap_action: {
        domain: "homeassistant",
        action: "toggle",
        data: "default",
      },
      hold_action: more_info,
    } as ElementConfig;
  }
  const conf: ElementConfig = {
    type: element_type,
    name: entity_id,
    css: { ...CHIP_CSS },
    tap_action: more_info,
  } as ElementConfig;
  if (domain === "button") {
    conf.tap_action = { domain: "button", action: "press", data: "default" };
    conf.hold_action = more_info;
    conf.icon = true;
  }
  if (domain === "binary_sensor") conf.translate_values = true;
  if (label) conf.prefix = JSON.stringify(label + " ");
  return conf;
}

/**
 * The minimal device the card elements expect around them (colours,
 * entity lookup by key). On the aquarium picture, an element names its
 * entity directly.
 */
export function host_device(entity_ids: string[]): any {
  const entities: Record<string, { entity_id: string }> = {};
  for (const id of entity_ids) entities[id] = { entity_id: id };
  return {
    entities,
    parent_entities: {},
    config: { color: "255,255,255", alpha: 0.7 },
    masterOn: true,
    is_on: () => true,
    is_missing: () => false,
    requestUpdate: () => undefined,
  };
}

/** Create the card element of an entity element of the scene. */
export function create_entity_element(
  hass: HassConfig,
  element: SceneElement,
): MyElement | null {
  if (!element.entity_id) return null;
  const conf = entity_element_config(
    element.entity_id,
    element.type,
    element.label,
  );
  try {
    return MyElement.create_element(
      hass,
      conf,
      host_device([element.entity_id]),
    );
  } catch (err) {
    console.error(
      "aquarium: cannot create element for",
      element.entity_id,
      err,
    );
    return null;
  }
}

/** The card's device (grouping sub-devices) a hass device belongs to. */
export function find_device_info(
  list: DeviceList | null,
  device_id: string,
): DeviceInfo | null {
  if (!list) return null;
  for (const key in list.devices) {
    const info = list.devices[key];
    if (info.elements?.some((el: any) => el?.id === device_id)) return info;
  }
  return null;
}

/**
 * What to put in a reef-card configuration to show a device: its stable
 * id, else its selector key.
 */
export function device_selector(
  list: DeviceList | null,
  device_id: string,
): string | null {
  const info = find_device_info(list, device_id);
  if (!info) return null;
  return info.uid ?? info.key ?? null;
}

const _thumbnails = new Map<string, string | null>();

/**
 * Picture of a device, the one its view of the card draws (cached).
 * @return a URL, or null for a device the card has no view for
 */
export function device_thumbnail(
  hass: HassConfig,
  list: DeviceList | null,
  device_id: string,
): string | null {
  if (_thumbnails.has(device_id)) return _thumbnails.get(device_id) ?? null;
  let url: string | null = null;
  const info = find_device_info(list, device_id);
  const el: any = info?.elements?.[0];
  if (info && el?.model) {
    try {
      const domain = domain_of(el.identifiers) ?? "redsea";
      const model = resolve_device_model(hass, info, domain, el.model);
      const device: any = RSDevice.create_device(
        RSDevice.tag_for_model(domain, model),
        hass,
        {},
        info,
      );
      if (device) {
        device.update_config?.();
        const img =
          device.config?.background_img ??
          device.initial_config?.background_img;
        url = img ? String(img) : null;
      }
    } catch (err) {
      console.debug("aquarium: no thumbnail for", device_id, err);
      url = null;
    }
  }
  _thumbnails.set(device_id, url);
  return url;
}

/** Forget the cached thumbnails (tests). */
export function reset_thumbnails(): void {
  _thumbnails.clear();
}

/** Display name of a hass device. */
export function device_name(
  hass: HassConfig,
  device_id: string | undefined,
): string {
  const dev = device_id ? (hass?.devices as any)?.[device_id] : null;
  return String(dev?.name_by_user || dev?.name || device_id || "");
}

/** Open the Home Assistant page of a device. */
export function open_device_page(device_id: string): void {
  const path = `/config/devices/device/${device_id}`;
  history.pushState(null, "", path);
  window.dispatchEvent(
    new CustomEvent("location-changed", { detail: { replace: false } }),
  );
}
