export const config = {
  name: null,
  model: "RSRUN_RETURN",
  background_img: new URL(
    "../../../img/redsea/RSRUN/reefrun_return.png",
    import.meta.url,
  ),
  css: {
    width: "100%",
  },
  elements: {
    flow: {
      name: "speed",
      type: "flow-image",
      image: new URL(
        "../../../img/redsea/RSRUN/water_seamless.png",
        import.meta.url,
      ),
      class: "tube",
      "animation-name": "flowUp",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        top: "25%",
        left: "45%",
        width: "10%",
        height: "13%",
      },
    },
    pipe_1: {
      name: "missing_pump",
      type: "click-image",
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_pump_return_pipe.png",
        import.meta.url,
      ),
      put_in: "cables_1",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "57%",
        top: "2%",
        left: "1.2%",
      },
    },
    pipe_2: {
      name: "missing_pump",
      type: "click-image",
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_pump_return_pipe.png",
        import.meta.url,
      ),
      put_in: "cables_2",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "57%",
        top: "2%",
        left: "41.2%",
        transform: "scaleX(-1)",
      },
    },
    alim_cable_1: {
      name: "missing_pump",
      type: "click-image",
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_cable.png",
        import.meta.url,
      ),
      put_in: "cables_1",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "57%",
        top: "-134.5%",
        left: "47.3%",
      },
    },
    alim_cable_2: {
      name: "missing_pump",
      type: "click-image",
      image: new URL(
        "../../../img/redsea/RSRUN/reefrun_cable.png",
        import.meta.url,
      ),
      put_in: "cables_2",
      elt_css: {
        flex: "0 0 auto",
        position: "absolute",
        width: "57%",
        top: "-134.5%",
        left: "-3.5%",
        transform: "scaleX(-1)",
      },
    },
  },
};
