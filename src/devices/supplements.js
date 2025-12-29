import {SUPPLEMENTS} from "./supplements_list"

class Supplements{

    constructor(){
	this._list = SUPPLEMENTS;
    }//end of constructor

    get_supplement(name){
	let supplement=null;
	for ( supplement of this._list){
	    if (supplement.fullname==name){
		return supplement;
	    }
	}//for
	return null;
    }//end of function get_supplement
    
}

var supplements_list = new Supplements();
export default supplements_list;
