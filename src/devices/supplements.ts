import {SUPPLEMENTS} from "./supplements_list"
import {Supplement} from "../types/supplement";

class Supplements{
  //_list: any[];
  _list: Supplement[];
  
    constructor(){
	this._list = SUPPLEMENTS;
    }//end of constructor

    get_supplement(name){
	let supplement=null;
      for ( supplement of this._list){
	    if (supplement.fullname==name){
		return supplement;
	    }
	    if(supplement.type=="Bundle"){
		console.log("BUNDLE",supplement.bundle);
		for ( var supp of Object.keys(supplement.bundle)){
		    var bundle_supplement=supplement.bundle[supp];
		    console.log("SUPP",bundle_supplement);
		    if (bundle_supplement.supplement.name==name){
			bundle_supplement.supplement.sizes=supplement.sizes.map(function(x) { return x * bundle_supplement.ratio; });
			return bundle_supplement.supplement;
		    }
		}
	    }//if
	}//for
	return null;
    }//end of function get_supplement
    
}

var supplements_list = new Supplements();
export default supplements_list;
