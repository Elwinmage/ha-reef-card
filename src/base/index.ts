/**
 * Define the base elements and register them
 */
import { Button } from "./button";
import { ClickImage } from "./click_image";
import { Dialog } from "./dialog";
import { ProgressBar } from "./progress_bar";
import { ProgressCircle } from "./progress_circle";
import { RSMessages } from "./messages";
import { SensorTarget } from "./sensor_target";
import { Sensor } from "./sensor";
import { RSSwitch } from "./switch";

if (!customElements.get("click-image"))
  customElements.define("click-image", ClickImage);
if (!customElements.get("common-button"))
  customElements.define("common-button", Button);
if (!customElements.get("common-dialog"))
  customElements.define("common-dialog", Dialog);
if (!customElements.get("common-sensor"))
  customElements.define("common-sensor", Sensor);
if (!customElements.get("common-sensor-target"))
  customElements.define("common-sensor-target", SensorTarget);
if (!customElements.get("common-switch"))
  customElements.define("common-switch", RSSwitch);
if (!customElements.get("progress-bar"))
  customElements.define("progress-bar", ProgressBar);
if (!customElements.get("progress-circle"))
  customElements.define("progress-circle", ProgressCircle);
if (!customElements.get("redsea-messages"))
  customElements.define("redsea-messages", RSMessages);
