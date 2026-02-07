/**
 * Index principal des devices
 * Importe et enregistre tous les custom elements
 */

// Import des composants de base
import "../base/index";

// Import des devices
import { NoDevice } from "./rsnodevice";
import { RSDose4,RSDose2,DoseHead,DosingQueue} from "./rsdose";
import { RSMat } from "./rsmat";
import { RSLed } from "./rsled";
import { RSRun } from "./rsrun";
import { RSAto } from "./rsato";
import { RSWave } from "./rswave";

// Enregistrement des custom elements
customElements.define('redsea-nodevice', NoDevice);
customElements.define('redsea-rsdose4', RSDose4);
customElements.define('redsea-rsdose2', RSDose2);
customElements.define('redsea-dosing-queue', DosingQueue);
customElements.define('redsea-dose-head', DoseHead);
customElements.define('redsea-rsmat', RSMat);
customElements.define('redsea-rsled', RSLed);
customElements.define('redsea-rsrun', RSRun);
customElements.define('redsea-rsato', RSAto);
customElements.define('redsea-rswave', RSWave);

// Export des devices pour utilisation externe
export { NoDevice } from "./rsnodevice";
export { RSDose4, RSDose2, DoseHead, DosingQueue } from "./rsdose";
export { RSMat } from "./rsmat";
export { RSLed } from "./rsled";
export { RSRun } from "./rsrun";
export { RSAto } from "./rsato";
export { RSWave } from "./rswave";
