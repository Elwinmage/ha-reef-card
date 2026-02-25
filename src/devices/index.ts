/**
 * Main Index for devices
 * Import and register all devices
 */

import "../base/index";

// Import devices
import { NoDevice } from "./rsnodevice";
import { RSDose4, RSDose2, DoseHead, DosingQueue } from "./rsdose";
import { RSMat } from "./rsmat";
import {
  RSLed160,
  RSLed90,
  RSLed50,
  RSLed170,
  RSLed115,
  RSLed60,
} from "./rsled";
import { RSRun } from "./rsrun";
import { RSAto } from "./rsato";
import { RSWave25, RSWave45 } from "./rswave";

// register devices
if (!customElements.get("redsea-nodevice"))
  customElements.define("redsea-nodevice", NoDevice);
if (!customElements.get("redsea-rsdose4"))
  customElements.define("redsea-rsdose4", RSDose4);
if (!customElements.get("redsea-rsdose2"))
  customElements.define("redsea-rsdose2", RSDose2);
if (!customElements.get("redsea-dosing-queue"))
  customElements.define("redsea-dosing-queue", DosingQueue);
if (!customElements.get("redsea-dose-head"))
  customElements.define("redsea-dose-head", DoseHead);
if (!customElements.get("redsea-rsmat"))
  customElements.define("redsea-rsmat", RSMat);
if (!customElements.get("redsea-rsled160"))
  customElements.define("redsea-rsled160", RSLed160);
if (!customElements.get("redsea-rsled90"))
  customElements.define("redsea-rsled90", RSLed90);
if (!customElements.get("redsea-rsled50"))
  customElements.define("redsea-rsled50", RSLed50);
if (!customElements.get("redsea-rsled170"))
  customElements.define("redsea-rsled170", RSLed170);
if (!customElements.get("redsea-rsled115"))
  customElements.define("redsea-rsled115", RSLed115);
if (!customElements.get("redsea-rsled60"))
  customElements.define("redsea-rsled60", RSLed60);
if (!customElements.get("redsea-rsrun"))
  customElements.define("redsea-rsrun", RSRun);
if (!customElements.get("redsea-rsato"))
  customElements.define("redsea-rsato", RSAto);
if (!customElements.get("redsea-rswave25"))
  customElements.define("redsea-rswave25", RSWave45);
if (!customElements.get("redsea-rswave45"))
  customElements.define("redsea-rswave45", RSWave25);

// Export devices
export { NoDevice } from "./rsnodevice";
export { RSDose4, RSDose2, DoseHead, DosingQueue } from "./rsdose";
export { RSMat } from "./rsmat";
export {
  RSLed160,
  RSLed90,
  RSLed50,
  RSLed170,
  RSLed115,
  RSLed60,
} from "./rsled";
export { RSRun } from "./rsrun";
export { RSAto } from "./rsato";
export { RSWave25, RSWave45 } from "./rswave";
