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
import { RSLed160,RSLed90,RSLed50,RSLed170,RSLed115,RSLed60  } from "./rsled";
import { RSRun } from "./rsrun";
import { RSAto } from "./rsato";
import { RSWave25, RSWave45 } from "./rswave";

// Enregistrement des custom elements
customElements.define('redsea-nodevice', NoDevice);
customElements.define('redsea-rsdose4', RSDose4);
customElements.define('redsea-rsdose2', RSDose2);
customElements.define('redsea-dosing-queue', DosingQueue);
customElements.define('redsea-dose-head', DoseHead);
customElements.define('redsea-rsmat', RSMat);
customElements.define('redsea-rsled160', RSLed160);
customElements.define('redsea-rsled90', RSLed90);
customElements.define('redsea-rsled50', RSLed50);
customElements.define('redsea-rsled170', RSLed170);
customElements.define('redsea-rsled115', RSLed115);
customElements.define('redsea-rsled60', RSLed60);
customElements.define('redsea-rsrun', RSRun);
customElements.define('redsea-rsato+', RSAto);
customElements.define('redsea-rswave25', RSWave45);
customElements.define('redsea-rswave45', RSWave25);

// Export des devices pour utilisation externe
export { NoDevice } from "./rsnodevice";
export { RSDose4, RSDose2, DoseHead, DosingQueue } from "./rsdose";
export { RSMat } from "./rsmat";
export { RSLed160,RSLed90,RSLed50,RSLed170,RSLed115,RSLed60  } from "./rsled";
export { RSRun } from "./rsrun";
export { RSAto } from "./rsato";
export { RSWave25,RSWave45 } from "./rswave";
