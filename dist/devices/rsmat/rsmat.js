import { html,css } from "../../lit-core.min.js";

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

    render(){
	return html`
<p id="device_name" class="RSMAT">${this.name}</p>
<div class="device_bg">
<img src="${this.get_img()}"/>
</div>`;
	
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
