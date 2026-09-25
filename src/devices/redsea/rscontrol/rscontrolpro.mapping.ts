import {
  links,
  pro_extends,
  power_sockets,
  probes,
  summary,
  widgets,
  pro_ports,
} from "./rscontrol.common.mapping";

export const config2 = {
  name: null,
  model: "RSCONTROLPRO",
  background_img: new URL(
    "../../../img/redsea/RSCONTROL/rscontrolpro.png",
    import.meta.url,
  ),
  css: {
    width: "100%",
  },
  // Declaration order is the stacking order of the overlays.
  elements: {
    ...pro_extends,
    ...links,
    ...widgets,
  },
  probes: probes,
  ports: pro_ports,
  power_sockets: power_sockets,
  summary: summary,
};
