import {
  links,
  lite_extends,
  power_sockets,
  probes,
  summary,
  widgets,
  lite_ports,
} from "./rscontrol.common.mapping";

/**
 * The Lite takes at most 2 probes (one extension box with 2 ports) and has a
 * single 12V port: the overlays for further probes and for the second port
 * can never show, so they are left out.
 */
const LITE_UNUSED: readonly string[] = [
  "link_sense_3",
  "link_sense_4",
  "link_sense_4E",
  "link_sense_5",
  "link_sense_6",
  "link_sense_7",
  "link_ato_2",
  "is_on_12v_2",
];

const lite_links = Object.fromEntries(
  Object.entries(links).filter(([key]) => !LITE_UNUSED.includes(key)),
);

export const config = {
  name: null,
  model: "RSCONTROLLITE",
  background_img: new URL(
    "../../../img/redsea/RSCONTROL/rscontrollite.png",
    import.meta.url,
  ),
  css: {
    width: "100%",
  },
  // Declaration order is the stacking order of the overlays.
  elements: {
    ...lite_extends,
    ...lite_links,
    ...widgets,
  },
  probes: { ...probes, max: 2 },
  ports: lite_ports,
  power_sockets: power_sockets,
  summary: summary,
};
