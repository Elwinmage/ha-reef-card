/**
 * Light of the water regions: what the lamps produce right now, turned into
 * the CSS layers tinting the water of the picture.
 *
 * A ReefLED reuses the beam's colour model (beam_light / is_dark), so the
 * tank and the lamp's own view always agree. Any other `light` entity with
 * a colour and a brightness works too.
 */

import type { HassConfig } from "../types/index";
import type { LightSource, Water } from "./types";
import { beam_light, is_dark } from "../devices/redsea/rsled/rsled_beam";
import {
  brightness_pct,
  kelvin_rgb,
} from "../devices/redsea/rsled/rsled_program";

export type RGB = [number, number, number];

/** What one lamp produces. */
export interface LampReading {
  x: number;
  rgb: RGB;
  /** 0 (off) .. 1 (full power). */
  power: number;
  dark: boolean;
}

/** Light of a whole water. */
export interface WaterLight {
  lamps: LampReading[];
  /** Every lamp dark: night for the fish and corals. */
  dark: boolean;
  /** No lamp configured: the water is not tinted. */
  none: boolean;
}

const NIGHT_RGB: RGB = [30, 40, 90];

/** Colour the lamps are compared with, depending on how the photo was lit. */
export const PHOTO_REFERENCE: Record<"white" | "blue", RGB> = {
  white: [255, 250, 235],
  blue: [110, 150, 255],
};

/**
 * Entities of a device, by "<domain>.<translation_key>".
 * @return entity ids keyed like RSDevice.entities
 */
export function device_entities(
  hass: HassConfig,
  device_id: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  const entities: Record<string, any> = (hass?.entities as any) ?? {};
  for (const entity_id in entities) {
    const entity = entities[entity_id];
    if (entity?.device_id !== device_id || !entity.translation_key) continue;
    const domain = entity_id.split(".")[0];
    out[`${domain}.${entity.translation_key}`] = entity_id;
  }
  return out;
}

function state_of(hass: HassConfig, entity_id: string | undefined): any {
  return entity_id ? hass?.states?.[entity_id] : undefined;
}

/**
 * Light of a ReefLED (or a virtual LED), read from its entities the way
 * the lamp's own view reads them.
 */
export function reefled_reading(
  hass: HassConfig,
  device_id: string,
  x: number,
): LampReading | null {
  const ents = device_entities(hass, device_id);
  const has_channels = Boolean(ents["light.white"] || ents["sensor.white"]);
  const kelvin_light = ents["light.kelvin_intensity"];
  if (!has_channels && !kelvin_light) return null;

  const power_state = state_of(hass, ents["switch.device_state"]);
  const on = power_state?.state !== "off";

  const channel = (key: string): number => {
    const light = state_of(hass, ents["light." + key]);
    if (light)
      return light.state === "on"
        ? brightness_pct(light.attributes?.brightness)
        : 0;
    const value = Number(state_of(hass, ents["sensor." + key])?.state);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  };
  const levels = {
    white: channel("white"),
    blue: channel("blue"),
    moon: channel("moon"),
  };

  const k_state = state_of(hass, kelvin_light);
  const intensity =
    k_state && k_state.state !== "unavailable"
      ? k_state.state === "on"
        ? brightness_pct(k_state.attributes?.brightness)
        : 0
      : null;
  const k = Number(k_state?.attributes?.color_temp_kelvin);
  const kelvin = Number.isFinite(k) && k > 0 ? k : null;

  if (is_dark(on, intensity, levels)) {
    return { x, rgb: NIGHT_RGB, power: 0, dark: true };
  }
  // A G2 has no white/blue light entity: it is driven by colour
  const by_colour = !ents["light.white"];
  const light = beam_light(levels, intensity, kelvin, by_colour);
  // beam alpha is 0.15 + 0.6 * power
  const power = Math.max(0, Math.min(1, (light.alpha - 0.15) / 0.6));
  // Only the moon lit: still night for the fish, but a violet glow
  const moon_only = (intensity ?? Math.max(levels.white, levels.blue)) <= 0;
  return {
    x,
    rgb: light.rgb as RGB,
    power: moon_only ? Math.min(power, 0.12) : power,
    dark: moon_only,
  };
}

/** Light of a plain `light` entity (colour and brightness). */
export function entity_reading(
  hass: HassConfig,
  entity_id: string,
  x: number,
): LampReading {
  const state = state_of(hass, entity_id);
  if (!state || state.state !== "on") {
    return { x, rgb: NIGHT_RGB, power: 0, dark: true };
  }
  const attrs = state.attributes ?? {};
  let rgb: RGB = [255, 250, 235];
  if (Array.isArray(attrs.rgb_color) && attrs.rgb_color.length === 3) {
    rgb = attrs.rgb_color.map((c: any) => Number(c) || 0) as RGB;
  } else if (Number(attrs.color_temp_kelvin) > 0) {
    const kelvin = Number(attrs.color_temp_kelvin);
    rgb =
      kelvin < 8000
        ? [255, 214 + Math.round((kelvin / 8000) * 30), 170]
        : (kelvin_rgb(kelvin) as RGB);
  }
  const pct =
    attrs.brightness === undefined ? 100 : brightness_pct(attrs.brightness);
  return { x, rgb, power: pct / 100, dark: pct <= 0 };
}

/** What a configured light source produces. */
export function lamp_reading(
  hass: HassConfig,
  source: LightSource,
): LampReading {
  const x = Number.isFinite(source.x) ? source.x : 0.5;
  if (source.device_id) {
    const reading = reefled_reading(hass, source.device_id, x);
    if (reading) return reading;
    // Another kind of device: its first light entity, if any
    const ents = device_entities(hass, source.device_id);
    const light = Object.entries(ents).find(([key]) =>
      key.startsWith("light."),
    );
    if (light) return entity_reading(hass, light[1], x);
    return { x, rgb: NIGHT_RGB, power: 0, dark: true };
  }
  if (source.entity_id) return entity_reading(hass, source.entity_id, x);
  return { x, rgb: NIGHT_RGB, power: 0, dark: true };
}

/**
 * Light of a water.
 *
 * Without any lamp configured, night follows the sun (sun.sun) so the fish
 * still sleep, but the water is not tinted.
 */
export function water_light(
  hass: HassConfig,
  water: Water | undefined,
): WaterLight {
  const lights = water?.lights ?? [];
  if (!lights.length) {
    const sun = hass?.states?.["sun.sun"]?.state;
    return { lamps: [], dark: sun === "below_horizon", none: true };
  }
  const lamps = lights
    .map((l) => lamp_reading(hass, l))
    .sort((a, b) => a.x - b.x);
  return { lamps, dark: lamps.every((l) => l.dark), none: false };
}

/** Colour multiplying the photo: the lamp's hue relative to the photo's. */
export function relative_tint(
  rgb: RGB,
  photo: "white" | "blue",
  strength: number,
): RGB {
  const ref = PHOTO_REFERENCE[photo] ?? PHOTO_REFERENCE.white;
  const rel = rgb.map((c, i) => c / Math.max(1, ref[i]));
  const max = Math.max(...rel, 1e-6);
  const s = Math.max(0, Math.min(1, strength));
  return rel.map((c) =>
    Math.round(255 * (1 - s) + ((255 * c) / max) * s),
  ) as RGB;
}

/**
 * Darkness of the veil over the water for a lamp power: up to 0.55 with the
 * lamps off, so that the tank stays readable at night (moonlight).
 */
export const MAX_DARKNESS = 0.55;

export function darkness(power: number): number {
  const p = Math.max(0, Math.min(1, power));
  return Number((MAX_DARKNESS * Math.pow(1 - p, 1.6)).toFixed(3));
}

/** CSS backgrounds of the light layers of a water region. */
export interface TintLayers {
  /** Multiplied with the photo: hue of the light. */
  tint: string;
  /** Normal blend: darkness, horizontal (lamps) then vertical (depth). */
  veil: string;
  depth: string;
}

/**
 * CSS layers of a water's light. Stops follow the lamps along the tank so a
 * single lamp lights its own side.
 */
export function tint_layers(
  light: WaterLight,
  photo: "white" | "blue",
): TintLayers | null {
  if (light.none) return null;
  const lamps = light.lamps.length
    ? light.lamps
    : [{ x: 0.5, rgb: NIGHT_RGB, power: 0, dark: true }];
  const stops = (fn: (l: LampReading) => string): string => {
    if (lamps.length === 1) return `${fn(lamps[0])} 0%, ${fn(lamps[0])} 100%`;
    return lamps.map((l) => `${fn(l)} ${(l.x * 100).toFixed(1)}%`).join(", ");
  };
  const tint = `linear-gradient(to right, ${stops((l) => {
    const c = relative_tint(
      l.dark ? NIGHT_RGB : l.rgb,
      photo,
      l.dark ? 0.8 : 0.35 + 0.3 * l.power,
    );
    return `rgb(${c.join(",")})`;
  })})`;
  const veil = `linear-gradient(to right, ${stops((l) => `rgba(0,6,20,${darkness(l.power)})`)})`;
  const night = light.dark ? 0.08 : 0;
  const depth = `linear-gradient(to bottom, rgba(0,10,40,${night.toFixed(2)}) 0%, rgba(0,10,40,${(0.22 + night).toFixed(2)}) 100%)`;
  return { tint, veil, depth };
}
