/**
 * Temperature unit helpers.
 *
 * Red Sea devices only speak Celsius. Home Assistant converts the state of
 * its own entities to the unit system of the installation (°F in the US),
 * but it leaves attributes and the card's own forms alone: every value the
 * card reads raw from the device, or sends to it, has to be converted here.
 */

/** The only unit the devices accept. */
export const CELSIUS = "°C";
export const FAHRENHEIT = "°F";
export const KELVIN = "K";

/**
 * Temperature unit of the Home Assistant installation.
 * @param hass: the Home Assistant object
 * @return "°C", "°F" or "K"; "°C" when unknown
 */
export function ha_temperature_unit(hass: any): string {
  const unit = hass?.config?.unit_system?.temperature;
  return unit === FAHRENHEIT || unit === KELVIN ? unit : CELSIUS;
}

/**
 * Whether values must be converted between the device and the display.
 * @param hass: the Home Assistant object
 * @return true when Home Assistant does not display Celsius
 */
export function needs_conversion(hass: any): boolean {
  return ha_temperature_unit(hass) !== CELSIUS;
}

/**
 * Convert a Celsius temperature into a unit.
 * @param value: the temperature in °C
 * @param unit: the target unit
 * @return the converted temperature
 */
export function from_celsius(value: number, unit: string): number {
  if (unit === FAHRENHEIT) return (value * 9) / 5 + 32;
  if (unit === KELVIN) return value + 273.15;
  return value;
}

/**
 * Convert a temperature into Celsius.
 * @param value: the temperature in `unit`
 * @param unit: its unit
 * @return the temperature in °C
 */
export function to_celsius(value: number, unit: string): number {
  if (unit === FAHRENHEIT) return ((value - 32) * 5) / 9;
  if (unit === KELVIN) return value - 273.15;
  return value;
}

/**
 * Convert a Celsius temperature difference (an hysteresis, a spread) into a
 * unit: no offset, only the scale.
 * @param delta: the difference in °C
 * @param unit: the target unit
 * @return the converted difference
 */
export function delta_from_celsius(delta: number, unit: string): number {
  return unit === FAHRENHEIT ? (delta * 9) / 5 : delta;
}

/**
 * Convert a temperature difference into Celsius.
 * @param delta: the difference in `unit`
 * @param unit: its unit
 * @return the difference in °C
 */
export function delta_to_celsius(delta: number, unit: string): number {
  return unit === FAHRENHEIT ? (delta * 5) / 9 : delta;
}

/**
 * Round a displayed value: two decimals at most, float noise removed.
 * @param value: the value
 * @return the rounded value
 */
export function round_display(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Whether an entity reports a temperature.
 * @param stateObj: the entity state
 * @return true for a temperature entity
 */
export function is_temperature_entity(stateObj: any): boolean {
  const attrs = stateObj?.attributes;
  if (!attrs) return false;
  if (attrs.device_class === "temperature") return true;
  const unit = attrs.unit_of_measurement;
  return unit === CELSIUS || unit === FAHRENHEIT || unit === KELVIN;
}

/**
 * Bounds read from an entity attribute are raw device values, in Celsius,
 * while Home Assistant may display the entity itself in another unit: bring
 * them to the entity's displayed unit so both can be compared.
 * @param values: the bounds in °C
 * @param stateObj: the entity the bounds belong to
 * @return the bounds in the entity's unit
 */
export function attribute_to_entity_unit(
  values: number[],
  stateObj: any,
): number[] {
  if (!is_temperature_entity(stateObj)) return values;
  const unit = stateObj.attributes.unit_of_measurement;
  if (unit !== FAHRENHEIT && unit !== KELVIN) return values;
  return values.map((v) => from_celsius(v, unit));
}
