import { css } from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

export default class RSMat {

    constructor(model){
	this.model=model
    }

    get_img(){
	return "/local/community/ha-reef-card/src/RSMAT/img/"+this.model+".png";
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
    color: blue;
  }

  img.RSMAT {
    width: 200px;
  }
`
