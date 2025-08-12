import {ReefCard} from "./card";
import {NoDevice} from "./devices/nodevice";
//import {RSDevice} from "./devices/device";
import {RSDose} from "./devices/rsdose";
//import { ReefCardEditor } from "./editor";

customElements.define("reef-card",ReefCard);
//customElements.define('rs-device', RSDevice);
customElements.define('rs-dose', RSDOse);
customElements.define("no-device",NoDevice);

//customElements.define("reef-card-editor",ReefCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "reef-card",
    name: "Reef Tank Card",
    description: "A custom card for reef management.",
});
