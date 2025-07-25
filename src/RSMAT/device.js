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
