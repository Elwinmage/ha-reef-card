import "./base/index";

import {NoDevice} from "./nodevice";
import {RSDose} from "./rsdose";
import {DosingQueue} from "./dosing_queue";
import {DoseHead} from "./dose_head";

customElements.define('redsea-nodevice',NoDevice);
customElements.define('redsea-rsdose4',RSDose);
customElements.define('dosing-queue',DosingQueue);
customElements.define('dose-head', DoseHead);
