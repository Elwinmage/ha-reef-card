/**
 * ReefWave editor calls: the redsea.wave_* services of ha-reefbeat-component.
 *
 *   wave_library        waves the pump can use (cloud library of its
 *                       aquarium with its own intensities, or the waves of
 *                       its program without a cloud account), the pumps
 *                       using each wave, and the pump's group
 *   wave_library_save   create or update a wave
 *   wave_library_delete delete a wave
 *   wave_program_save   write the day program (of the whole group)
 *   wave_group_set      group the pump with its aquarium's ReefWaves, or
 *                       ungroup it
 *   wave_group_order    order the pumps of the group
 *   wave_weather_*      GPS weather (see rswave_weather)
 *
 * A refused call comes back as a translated Home Assistant error: its
 * message is given to the user as is.
 */

/** A wave as the services give it (this pump's intensities). */
export interface LibraryWave {
  uid: string;
  name: string;
  type: string;
  default: boolean;
  frt: number | null;
  rrt: number | null;
  pd: number | null;
  sn: number | null;
  fti: number;
  rti: number;
  sync: boolean;
}

/** A pump of the group. */
export interface GroupPump {
  hwid: string;
  name: string;
  in_service: boolean;
  available: boolean;
}

/** Answer of redsea.wave_library. */
export interface WaveLibrary {
  linked: boolean;
  hwid: string;
  waves: LibraryWave[];
  /** Pumps using each wave, by uid */
  usage: Record<string, string[]>;
  group: GroupPump[];
  /** Grouped in the app; null without a cloud account */
  grouped: boolean | null;
  /** GPS weather: {settings, base (the pump's own program while on), result} */
  weather: any;
}

/** Slot of a day program, as redsea.wave_program_save takes it. */
export interface ProgramSlot {
  st: number;
  wave_uid: string;
  direction: string;
}

/** Outcome of a call: its response, or the message of its refusal. */
export interface Outcome<T> {
  ok: boolean;
  /** The response, when ok */
  value?: T;
  /** The message of the refusal, when not ok */
  error?: string;
}

/**
 * Config entry of the pump: the device_id of the redsea services.
 * @param device: the RSWave device
 */
export function entry_of(device: any): string | undefined {
  return device?.device?.elements?.[0]?.primary_config_entry ?? undefined;
}

/**
 * Message of a failed call.
 * @param err: what callWS rejected with
 */
export function error_message(err: unknown): string {
  if (typeof err === "string") return err;
  const message = (err as any)?.message;
  return typeof message === "string" && message ? message : String(err);
}

/**
 * Call a redsea service answering with a response.
 * @param device: the RSWave device
 * @param service: the service
 * @param data: its data, the pump's entry added
 */
export async function ask<T>(
  device: any,
  service: string,
  data: Record<string, unknown> = {},
): Promise<Outcome<T>> {
  const hass = device?.hass;
  const device_id = entry_of(device);
  if (!device_id || typeof hass?.callWS !== "function") {
    return { ok: false, error: "Home Assistant is not reachable" };
  }
  try {
    const answer = await hass.callWS({
      type: "call_service",
      domain: "redsea",
      service,
      service_data: { device_id, ...data },
      return_response: true,
    });
    return { ok: true, value: (answer?.response ?? {}) as T };
  } catch (err) {
    return { ok: false, error: error_message(err) };
  }
}

/**
 * Read the pump's library, normalised (unusable entries dropped).
 * @param device: the RSWave device
 */
export async function fetch_library(
  device: any,
): Promise<Outcome<WaveLibrary>> {
  const res = await ask<any>(device, "wave_library");
  if (!res.ok) return { ok: false, error: res.error };
  const v = res.value;
  const waves = (Array.isArray(v.waves) ? v.waves : []).filter(
    (w: any) => w && typeof w.uid === "string" && w.uid,
  );
  return {
    ok: true,
    value: {
      linked: v.linked === true,
      hwid: String(v.hwid ?? ""),
      waves,
      usage: v.usage && typeof v.usage === "object" ? v.usage : {},
      group: Array.isArray(v.group) ? v.group : [],
      grouped: typeof v.grouped === "boolean" ? v.grouped : null,
      weather: v.weather && typeof v.weather === "object" ? v.weather : {},
    },
  };
}
