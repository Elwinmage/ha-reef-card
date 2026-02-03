import {Button} from "./button";
import {ClickImage} from "./click_image";
import {Dialog} from "./dialog";
import {ProgressBar} from "./progress_bar";
import {ProgressCircle} from "./progress_circle";
import {RSMessages} from "./messages";
import {SensorTarget} from "./sensor_target";
import {Sensor} from "./sensor";
import {RSSwitch} from "./switch";


customElements.define('click-image', ClickImage);
customElements.define('common-button', Button);
customElements.define('common-dialog', Dialog);
customElements.define('common-sensor', Sensor);
customElements.define('common-sensor-target', SensorTarget);
customElements.define('common-switch', RSSwitch);
customElements.define('progress-bar', ProgressBar);
customElements.define('progress-circle', ProgressCircle);
customElements.define('redsea-messages', RSMessages);
