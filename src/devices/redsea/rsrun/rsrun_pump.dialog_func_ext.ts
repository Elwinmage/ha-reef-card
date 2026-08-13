/**
 * Dynamic content of the RSRun "add pump" dialog.
 *
 * The rows to display depend on what the ReefRun has detected, and the
 * integration does not expose the same entities for every pump type:
 *
 *   unknown : nothing is known yet  -> only the type row
 *   return  : the model is a sensor -> type, sensor model, editable name
 *   skimmer : the model is a select -> type, select model, editable name
 *
 * A static dialog definition cannot express that, so the entities card is
 * rebuilt here on every hass update (`re_render: true` on the extend view),
 * guarded by the detected type so the DOM is only recreated when the type
 * actually changes — otherwise the rows would flicker once per second.
 */

import { RSDevice } from "../../device";

/**
 * Rows per pump type, in display order.
 * Each row is a list of candidate translation keys: the first one that
 * resolves to a live entity wins. The domain-qualified key comes first
 * because `model` alone is ambiguous when the integration exposes both a
 * sensor and a select for the same pump.
 */
const ROWS_BY_TYPE: Record<string, string[][]> = {
  unknown: [["type"]],
  return: [["type"], ["sensor.model", "model"], ["pump_name"]],
  skimmer: [["type"], ["select.model", "model"], ["pump_name"]],
};

/** Id of the wrapper holding the generated rows inside #dialog-content. */
const WRAPPER_ID = "add-pump-rows";

/**
 * Resolve the first candidate that maps to an entity with a live state.
 *
 * Deliberately does not use `device.get_entity()`: the pump litElement is
 * rebuilt when the type changes, so the device instance still referenced by
 * the open dialog may hold a stale `_hass`. The `hass` passed by the dialog
 * is always the current one.
 * @param device: the pump device holding the entity registry entries
 * @param hass: the current Home Assistant object
 * @param candidates: translation keys to try, most specific first
 * @return the resolved entity_id, or null when none is usable
 */
function resolve(device: any, hass: any, candidates: string[]): string | null {
  for (const name of candidates) {
    const entity =
      device?.entities?.[name] ?? device?.parent_entities?.[name] ?? null;
    const entity_id = entity?.entity_id;
    if (entity_id && hass?.states?.[entity_id]) {
      return entity_id;
    }
  }
  return null;
}

/**
 * Read the pump type currently reported by the ReefRun.
 * @param device: the pump device
 * @param hass: the current Home Assistant object
 * @return "return", "skimmer" or "unknown"
 */
function read_type(device: any, hass: any): string {
  const entity_id = resolve(device, hass, ["type"]);
  const state = entity_id ? hass.states[entity_id]?.state : null;
  return state && state in ROWS_BY_TYPE ? state : "unknown";
}

/**
 * Build the entities card matching the detected pump type.
 * @param entities: resolved rows for the entities card
 * @param hass: the current Home Assistant object
 * @param device: the pump device, forwarded like dialog.ts does
 * @return the card element, or null while the HA helpers are unavailable
 */
function build_card(entities: any[], hass: any, device: any): any {
  let card: any = null;
  const helpers = RSDevice._helpersResolved;
  if (helpers) {
    card = helpers.createCardElement({ type: "entities", entities });
  } else {
    // Fallback when the helpers have not resolved yet. Returning null is
    // safe: re_render calls us again on the next hass update.
    const CardClass = customElements.get("hui-entities-card");
    if (!CardClass) return null;
    card = new (CardClass as any)();
    card.setConfig({ type: "entities", entities });
  }
  card.hass = hass;
  card.device = device;
  return card;
}

/**
 * Fill the add_pump dialog with the rows matching the detected pump type.
 *
 * Called once when the dialog opens, then on every hass update.
 * @param elt: the element that opened the dialog (the add_pump placeholder)
 * @param hass: the current Home Assistant object
 * @param shadowRoot: the dialog shadow root
 * @return nothing
 */
export function add_pump(elt: any, hass: any, shadowRoot: any): void {
  const device = elt?.device;
  const container = shadowRoot?.querySelector("#dialog-content");
  if (!device || !container) return;

  const type = read_type(device, hass);
  const previous = shadowRoot.querySelector("#" + WRAPPER_ID);

  if (previous) {
    if (previous.dataset.pumpType === type) {
      // Same type: keep the DOM, just push the fresh hass down.
      previous.querySelectorAll("*").forEach((child: any) => {
        if ("hass" in child) child.hass = hass;
      });
      return;
    }
    previous.remove();
  }

  // read_type() only ever returns a key of ROWS_BY_TYPE
  const entities = ROWS_BY_TYPE[type]
    .map((candidates) => resolve(device, hass, candidates))
    .filter((entity_id): entity_id is string => entity_id !== null)
    .map((entity) => ({ entity, name: { type: "entity" } }));

  if (entities.length === 0) return;

  const card = build_card(entities, hass, device);
  if (!card) return;

  const wrapper = document.createElement("div");
  wrapper.id = WRAPPER_ID;
  wrapper.dataset.pumpType = type;
  wrapper.appendChild(card);
  container.appendChild(wrapper);
}
