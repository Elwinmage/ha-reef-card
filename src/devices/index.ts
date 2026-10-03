/**
 * Main Index for devices
 * Import and register all devices
 */

import "../base/index";

// Import devices
import { NoDevice } from "./redsea/rsnodevice";
import { RSDose4, RSDose2, DoseHead, DosingQueue } from "./redsea/rsdose";
import { RSMat } from "./redsea/rsmat";
import {
  RSLed160,
  RSLed90,
  RSLed50,
  RSLed170,
  RSLed115,
  RSLed60,
  RSLedVirtual,
  RSLedSky,
  RSLedBeam,
  RSLedSlider,
  RSLedProgramEditor,
  RSLedLinked,
  RSLedName,
  RSLedWeatherSettings,
  RSLedTopoMap,
} from "./redsea/rsled";
import { RSRun, RSPump, RSReturn, RSSkimmer } from "./redsea/rsrun";
import { RSAto } from "./redsea/rsato";
import {
  RSWave25,
  RSWave45,
  RSWaveFlow,
  RSWaveLabel,
  RSWaveLibrary,
  RSWaveLinked,
  RSWaveSchedule,
  RSWaveSpeed,
} from "./redsea/rswave";
import { RSPlaceSearch } from "../utils/place_search";
import { RSMaintenance } from "./redsea/maintenance";
import { RSPower6, RSPower8, PowerSocket, PowerSensor } from "./redsea/rspower";
import {
  RSControlLite,
  RSControlPro,
  ControlProbe,
  ControlPort,
  PortSensor,
} from "./redsea/rscontrol";
import { AMCapRing, AMFaults, AMFlow, AMSchedule } from "./aquamedic/common";
import { AMSmartDrift } from "./aquamedic/smartdrift";
import { AMDCRunner } from "./aquamedic/dcrunner";
import { AMDCSkimmer } from "./aquamedic/dcskimmer";

// register devices
if (!customElements.get("redsea-nodevice"))
  customElements.define("redsea-nodevice", NoDevice);
if (!customElements.get("redsea-rscontrollite"))
  customElements.define("redsea-rscontrollite", RSControlLite);
if (!customElements.get("redsea-rscontrolpro"))
  customElements.define("redsea-rscontrolpro", RSControlPro);
if (!customElements.get("redsea-control-probe"))
  customElements.define("redsea-control-probe", ControlProbe);
if (!customElements.get("redsea-control-port"))
  customElements.define("redsea-control-port", ControlPort);
if (!customElements.get("port-sensor"))
  customElements.define("port-sensor", PortSensor);
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
if (!customElements.get("redsea-virtual_led"))
  customElements.define("redsea-virtual_led", RSLedVirtual);
if (!customElements.get("rsled-linked"))
  customElements.define("rsled-linked", RSLedLinked);
if (!customElements.get("rsled-topo-map"))
  customElements.define("rsled-topo-map", RSLedTopoMap);
if (!customElements.get("rsled-weather-settings"))
  customElements.define("rsled-weather-settings", RSLedWeatherSettings);
if (!customElements.get("rsled-name"))
  customElements.define("rsled-name", RSLedName);
if (!customElements.get("rsled-sky"))
  customElements.define("rsled-sky", RSLedSky);
if (!customElements.get("rsled-beam"))
  customElements.define("rsled-beam", RSLedBeam);
if (!customElements.get("rsled-slider"))
  customElements.define("rsled-slider", RSLedSlider);
if (!customElements.get("rsled-program-editor"))
  customElements.define("rsled-program-editor", RSLedProgramEditor);
if (!customElements.get("redsea-rsrun"))
  customElements.define("redsea-rsrun", RSRun);
if (!customElements.get("redsea-rsrun-unknown"))
  customElements.define("redsea-rsrun-unknown", RSPump);
if (!customElements.get("redsea-rsrun-return"))
  customElements.define("redsea-rsrun-return", RSReturn);
if (!customElements.get("redsea-rsrun-skimmer"))
  customElements.define("redsea-rsrun-skimmer", RSSkimmer);
if (!customElements.get("redsea-rsato"))
  customElements.define("redsea-rsato", RSAto);
if (!customElements.get("redsea-rswave25"))
  customElements.define("redsea-rswave25", RSWave25);
if (!customElements.get("redsea-rswave45"))
  customElements.define("redsea-rswave45", RSWave45);
if (!customElements.get("rswave-flow"))
  customElements.define("rswave-flow", RSWaveFlow);
if (!customElements.get("rswave-library"))
  customElements.define("rswave-library", RSWaveLibrary);
if (!customElements.get("rswave-linked"))
  customElements.define("rswave-linked", RSWaveLinked);
if (!customElements.get("rswave-label"))
  customElements.define("rswave-label", RSWaveLabel);
if (!customElements.get("rswave-schedule"))
  customElements.define("rswave-schedule", RSWaveSchedule);
if (!customElements.get("rswave-speed"))
  customElements.define("rswave-speed", RSWaveSpeed);
if (!customElements.get("rs-place-search"))
  customElements.define("rs-place-search", RSPlaceSearch);
if (!customElements.get("redsea-maintenance"))
  customElements.define("redsea-maintenance", RSMaintenance);
if (!customElements.get("redsea-power-socket"))
  customElements.define("redsea-power-socket", PowerSocket);
if (!customElements.get("power-sensor"))
  customElements.define("power-sensor", PowerSensor);
if (!customElements.get("redsea-rspower6"))
  customElements.define("redsea-rspower6", RSPower6);
if (!customElements.get("redsea-rspower8"))
  customElements.define("redsea-rspower8", RSPower8);
if (!customElements.get("aquamedic-cap-ring"))
  customElements.define("aquamedic-cap-ring", AMCapRing);
if (!customElements.get("aquamedic-faults"))
  customElements.define("aquamedic-faults", AMFaults);
if (!customElements.get("aquamedic-flow"))
  customElements.define("aquamedic-flow", AMFlow);
if (!customElements.get("aquamedic-schedule"))
  customElements.define("aquamedic-schedule", AMSchedule);
if (!customElements.get("aquamedic-smartdrift"))
  customElements.define("aquamedic-smartdrift", AMSmartDrift);
if (!customElements.get("aquamedic-dcrunner"))
  customElements.define("aquamedic-dcrunner", AMDCRunner);
if (!customElements.get("aquamedic-dcskimmer"))
  customElements.define("aquamedic-dcskimmer", AMDCSkimmer);

// Export devices
export { NoDevice } from "./redsea/rsnodevice";
export { RSDose4, RSDose2, DoseHead, DosingQueue } from "./redsea/rsdose";
export { RSMat } from "./redsea/rsmat";
export {
  RSLed160,
  RSLed90,
  RSLed50,
  RSLed170,
  RSLed115,
  RSLed60,
  RSLedVirtual,
  RSLedSky,
  RSLedBeam,
  RSLedSlider,
  RSLedProgramEditor,
  RSLedLinked,
  RSLedName,
  RSLedWeatherSettings,
  RSLedTopoMap,
} from "./redsea/rsled";
export { RSRun } from "./redsea/rsrun";
export { RSAto } from "./redsea/rsato";
export {
  RSWave25,
  RSWave45,
  RSWaveFlow,
  RSWaveLabel,
  RSWaveLibrary,
  RSWaveLinked,
  RSWaveSchedule,
  RSWaveSpeed,
} from "./redsea/rswave";
export { RSPlaceSearch } from "../utils/place_search";
export { RSMaintenance } from "./redsea/maintenance";
export { RSPower6, RSPower8, PowerSocket, PowerSensor } from "./redsea/rspower";
export {
  RSControlLite,
  RSControlPro,
  ControlProbe,
  ControlPort,
  PortSensor,
} from "./redsea/rscontrol";
export { AMCapRing, AMFaults, AMFlow, AMSchedule } from "./aquamedic/common";
export { AMSmartDrift } from "./aquamedic/smartdrift";
export { AMDCRunner } from "./aquamedic/dcrunner";
export { AMDCSkimmer } from "./aquamedic/dcskimmer";
