import {ReefCard} from "./card";
import { ReefCardEditor } from "./editor";


// import { loadHaComponents, DEFAULT_HA_COMPONENTS } from '@kipk/load-ha-components';

// await loadHaComponents([
//     'ha-form',
//     'hui-sensor-entity-row'
// ]);

customElements.define("reef-card",ReefCard);
customElements.define("reef-card-editor",ReefCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "reef-card",
    name: "Reef Tank Card",
    description: "A custom card for reef management.",
});

window.customCards = window.customCards || [];
window.customCards.push({
  type: "reef-card-editor",
  name: "Content Card Editor",
  preview: false, // Optional - defaults to false
    description: "Reef Card!", // Optional
    documentationURL:
    "https://github.com/Elwinmage/ha-reef-card", // Adds a help link in the frontend card editor
});
