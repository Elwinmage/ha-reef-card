/**
 * @file Dialog showing the history of a probe reading
 * @module utils.history_dialog
 *
 * Shared by the ReefControl probes and the RSPower local temperature: a
 * history chart of one reading over 24 hours or 7 days, drawn over its five
 * level bands (danger, acceptable, desired, acceptable, danger from bottom to
 * top), read from the reading's `ranges` attribute.
 */

/**
 * Build a history dialog.
 * @param name: the dialog name
 * @param entity: translation key of the reading, resolved through the
 *   element that opens the dialog
 * @param title_key: the title expression
 * @param zones_entity: translation key of the entity giving the level bands,
 *   when the reading has none of its own
 * @return the dialog configuration
 */
export function history_dialog(
  name: string,
  entity: string,
  title_key: string,
  zones_entity?: string,
): Record<string, any> {
  return {
    name: name,
    title_key: title_key,
    close_cross: false,
    content: [
      {
        view: "history-chart",
        conf: {
          type: "history-chart",
          entities: [{ entity: entity, color: "rgb(30,30,30)" }],
          zones: true,
          zones_entity: zones_entity,
          // A probe reading is a signal, not a counter: straight segments
          // between samples, and a scale fitted to its values
          step: false,
          baseline: "min",
          hours: 24,
          periods: [24, 168],
          more_info: true,
          font_size: 11,
          bg_color: "255,255,255,0.95",
          css: { display: "block", width: "100%", height: "292px" },
        },
      },
    ],
  };
}
