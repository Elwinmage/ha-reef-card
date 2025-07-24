export default class RSDose {

    constructor(model){
	this.model=model
	this.heads_nb=parseInt((model.charAt(model.length-1)));
	console.log("RSDOSE with "+this.heads_nb+" heads");
    }

}
