import {
  links,
  off_keep,
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
    // Pro only: stack the maintenance, buzzer and Poseidon icons in a
    // single column against the right edge, evenly spaced. A fixed-size
    // icon grows relative to a narrow (mobile) card, so the old spread-out
    // row let the maintenance icon drift left over the wifi one; a shared
    // right edge keeps them clear at every width.
    maintenance_tasks: {
      ...widgets.maintenance_tasks,
      css: { ...widgets.maintenance_tasks.css, top: "2%", right: "3%" },
    },
    buzzer: {
      ...widgets.buzzer,
      css: {
        ...widgets.buzzer.css,
        top: "9%",
        right: "3%",
        left: undefined,
        transform: undefined,
      },
    },
    poseidon: {
      ...widgets.poseidon,
      css: { ...widgets.poseidon.css, top: "16%", right: "3%" },
    },
  },
  probes: probes,
  ports: pro_ports,
  power_sockets: power_sockets,
  summary: summary,
  off_keep: off_keep,
};
