/**
 * Declare ha-ree-card and it's editor
 */
import { ReefCard } from "./card";
import { ReefCardEditor } from "./editor";

import "./devices/index";
import "./aquarium/index";

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
  preview: false,
});
