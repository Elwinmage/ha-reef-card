/**
 * Index principal des devices
 * Importe et enregistre tous les custom elements
 */

// Import des composants de base
import "../base/index";

// Import des devices
import { NoDevice } from "./rsnodevice";
import { RSDose, DoseHead, DosingQueue } from "./rsdose";

// Enregistrement des custom elements
customElements.define('redsea-nodevice', NoDevice);
customElements.define('redsea-rsdose4', RSDose);
customElements.define('redsea-dosing-queue', DosingQueue);
customElements.define('redsea-dose-head', DoseHead);

// Export des devices pour utilisation externe
export { NoDevice } from "./rsnodevice";
export { RSDose, DoseHead, DosingQueue } from "./rsdose";
