import {ReefCard} from "./card";
import { ReefCardEditor } from "./editor";

customElements.define("reef-card",ReefCard);
customElements.define("reef-card-editor",ReefCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "reef-card",
    name: "Reef Tank Card",
    description: "A custom card for reef management.",
});
