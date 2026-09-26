import {
  elements,
  socket_common,
  socket_slots,
} from "./rspower.common.mapping";

export const config2 = {
  name: null,
  model: "RSPOWER8",
  background_img: new URL(
    "../../../img/redsea/RSPOWER/rspower8.png",
    import.meta.url,
  ),
  css: {
    width: "100%",
  },
  sockets_nb: 8,
  elements: elements,
  sockets: {
    common: socket_common({
      width: "10.8%",
      name_top: "7%",
      button_top: "25%",
      button_radius: "10%",
    }),
    ...socket_slots([
      "9%",
      "19.8%",
      "30.6%",
      "41.4%",
      "52.2%",
      "63%",
      "73.8%",
      "84.6%",
    ]),
  },
};
