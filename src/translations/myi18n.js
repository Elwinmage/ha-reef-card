import {dict} from "./dictionnary"

class myi18n {

    constructor(){
	this.fallback="en";
	this.lang=document.querySelector('home-assistant').hass.selectedLanguage;
	this.d=dict;
    }

    _(message,params=[]){
	let res=this.d[this.lang][message];
	if (res == null){
	    res=this.d[this.fallback][message];
	}
	if (res==null){
	    res=this._("canNotFindTranslation")+message;
	}
	return res;
    }
}

var i18n = new myi18n();
export default i18n;



