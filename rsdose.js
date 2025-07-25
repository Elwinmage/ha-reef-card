import { css } from "./lit-core.min.js";

/*
 * RSDose 
 */
export default class RSDose {

    constructor(model){
	this.model=model
	this.heads_nb=parseInt((model.charAt(model.length-1)));
	console.log("RSDOSE with "+this.heads_nb+" heads");
    }

    get_img(){
	return "/local/community/ha-reef-card/"+this.model+".png.js";
    }

    get_model(){
	return this.model;
    }
}


/*
 * CSS
 */
export const style_rsdose = css`
  p.RSDOSE4{
    color: red;
  }

  img.RSDOSE4 {
    width: 200px;
  }
`
