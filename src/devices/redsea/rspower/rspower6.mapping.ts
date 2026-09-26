import {
  elements,
  socket_common,
  socket_slots,
} from "./rspower.common.mapping";

export const config = {
  name: null,
  model: "RSPOWER6",
  background_img: new URL(
    "../../../img/redsea/RSPOWER/rspower6.png",
    import.meta.url,
  ),
  css: {
    width: "100%",
  },
  sockets_nb: 6,
  elements: elements,
  sockets: {
    common: socket_common({
      width: "13.5%",
      name_top: "-2%",
      button_top: "23%",
      button_radius: "100%",
    }),
    ...socket_slots(["10%", "24%", "38%", "52%", "66%", "80%"]),
  },
};
