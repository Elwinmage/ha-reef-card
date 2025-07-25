export default class RSDose {

    constructor(model){
	this.model=model
	this.heads_nb=parseInt((model.charAt(model.length-1)));
	console.log("RSDOSE with "+this.heads_nb+" heads");
    }

    get_img(){
	return "/local/community/ha-reef-card/src/RSDOSE/img/"+this.model+".png";
    }

    get_css(){
	return "/local/community/ha-reef-card/src/RSDOSE/"+this.model+".css";
    }

    get_model(){
	return this.model;
    }
}
