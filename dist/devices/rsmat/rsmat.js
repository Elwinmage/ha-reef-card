import { css } from "../../lit-core.min.js";

export default class RSMat {

    constructor(model){
	      this.model=model
    }

    get_img(){
	      return "/local/community/ha-reef-card/devices/rsmat/img/RSMAT.png";
    }

    get_model(){
	      return this.model;
    }
}


/*
 * CSS
 */
export const style_rsmat = css`
  p.RSMAT{
    color: yellow;
  }

  img.RSMAT {
    width: 200px;
  }
`
