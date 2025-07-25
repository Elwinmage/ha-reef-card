import { css } from "./lit-core.min.js";

export default class RSRun {

    constructor(model){
	this.model=model
    }

    get_img(){
	//return this.model+".png";
	return "/local/community/ha-reef-card/RSRUN.png.js";
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
