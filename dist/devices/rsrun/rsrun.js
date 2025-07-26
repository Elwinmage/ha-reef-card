import { css } from "../../lit-core.min.js";

export default class RSRun {

    constructor(model){
	      this.model=model
    }

    get_img(){
	      return "/local/community/ha-reef-card/devices/rsrun/img/RSRUN.png";
    }

    get_model(){
	      return this.model;
    }
}


/*
 * CSS
 */
export const style_rsrun = css`
  p.RSRUN{
    color: blue;
  }

  img.RSRUN {
    width: 200px;
  }
`
