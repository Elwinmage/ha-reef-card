/**
 * Declare ha-ree-card and it's editor
 */
import { ReefCard } from "./card";
import { ReefCardEditor } from "./editor";

import "./devices/index";
import "./aquarium/index";
import "./base/reef_alarms";
import "./base/reef_parameters";
import "./base/reef_parameters_editor";
import { log_banner } from "./banner";

log_banner();

customElements.define("reef-card", ReefCard);
customElements.define("reef-card-editor", ReefCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  /**
   * Card type identifier (must match the element tag name without 'lovelace-')
   * Example: "reef-card" for <reef-card> element
   */
  type: "reef-card",

  /**
   * Display name shown in the card picker
   */
  name: "Reef Tank Card",

  /**
   * Short description of the card (optional)
   * Shown in the card picker UI
   */
  description:
    "A custom card for reef management. Monitor and control automaticaly your Red Sea ReefBeat equipment. Supports ReefDose, ReefLED, ReefATO, ReefWave, ReefMat, and ReefRun.",

  /**
   * URL to documentation (optional)
   * Link shown in the card picker for users to learn more
   */
  documentationURL: "https://github.com/Elwinmage/ha-reef-card",

  /**
   * Whether to show a preview in the card picker (optional)
   * Default: false
   * If true, Home Assistant will render a small preview of your card
   */
  preview: true,
});

window.customCards.push({
  type: "reef-aquarium-card",
  name: "Reef Aquarium Card",
  description:
    "A living picture of your aquarium: its devices and entities, the water lit by your lamps, fish and corals (needs the reeftank integration).",
  documentationURL: "https://github.com/Elwinmage/ha-reef-card",
  // Rendered with its stub configuration (no aquarium): shows its picture
  preview: true,
});

window.customCards.push({
  type: "reef-alarms-card",
  name: "Reef Alarms Card",
  description:
    "The common alarm of the reef: green while all is well, red with the alarms in progress, listed on a tap.",
  documentationURL: "https://github.com/Elwinmage/ha-reef-card",
  preview: true,
});

window.customCards.push({
  type: "reef-parameters-card",
  name: "Reef Parameters Card",
  description:
    "Follow-up of the water tests (KH, Ca, Mg, Fe...): one chart per parameter over its desired, acceptable and danger zones.",
  documentationURL: "https://github.com/Elwinmage/ha-reef-card",
  preview: true,
});
