export default class DeviceList {

    constructor(hass){
	this._hass=hass;
	this.main_devices=[];
	this.devices={};
	this.init_devices();
    }//end of - constructor

    device_compare( a, b ) {
	if ( a.text < b.text ){
	    return -1;
	}// if
	else if ( a.text > b.text ){
	    return 1;
	}// else
	return 0;
    }//end of - device_compare

    get_by_name(name){
	for (var id of this.main_devices) {
	    if (id.text == name){
		return this.devices[id.value];
	    }//if
	}//for
    }//enf of function get_by_name
    
    init_devices(){
	console.log(this._hass);
	for (var device_id in this._hass.devices){
	    let dev=this._hass.devices[device_id];
	    let dev_id=dev.identifiers[0];
	    if (Array.isArray(dev_id) && dev_id[0]=='redsea'){
		// dev.lenght==2 to get only main device, not sub
		if(dev_id.length==2 && dev.model!='ReefBeat'){
		    this.main_devices.push({value:dev.primary_config_entry,text:dev.name});
		}
		if  (!Object.getOwnPropertyNames(this.devices).includes(dev.primary_config_entry)){
		    Object.defineProperty(this.devices,dev.primary_config_entry , {value:{name:dev.name,elements:[dev]}})
		}
		else{
		    this.devices[dev.primary_config_entry].elements.push(dev);
		    // Change main device name with main device
		    if(dev_id.length==2){
			this.devices[dev.primary_config_entry].name=dev.name;
		    }//if
		    
		}//else
	    }
	}//for
	this.main_devices.sort(this.device_compare);
	console.log(this.devices)
    }// end of - init_devices
};


export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var rgb=parseInt(result[1], 16)+","+parseInt(result[2], 16)+","+ parseInt(result[3], 16)
    console.log("hexToRgb: ",hex," => ",rgb);
/*    return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
    } : null;*/
    return rgb;
}

/**
 * Convert RGB to Hex. Allows whitespace. If given hex, returns that hex. Alpha opacity is discarded.
 * Supports formats:
 * #fc0
 * #ffcc00
 * rgb( 255, 255, 255 )
 * rgba( 255, 255, 255, 0.5 )
 * rgba( 255 255 255 / 0.5 )
 */
export function rgbToHex( orig ) {	
	var regex_hex, regex_trim, color, regex_rgb, matches, hex;
	
	// Remove whitespace
	regex_trim = new RegExp(/[^#0-9a-f\.\(\)rgba]+/gim);
	color = orig.replace( regex_trim, ' ' ).trim();
	
	// Check if already hex
	regex_hex = new RegExp(/#(([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1}))|(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}))/gi);
	if ( regex_hex.exec( color ) ) {
		return color;
	}
	
	// Extract RGB values
	regex_rgb = new RegExp( /rgba?\([\t\s]*([0-9]{1,3})[\t\s]*[, ][\t\s]*([0-9]{1,3})[\t\s]*[, ][\t\s]*([0-9]{1,3})[\t\s]*([,\/][\t\s]*[0-9\.]{1,})?[\t\s]*\);?/gim );
	matches = regex_rgb.exec( orig );
	
	if ( matches ) {
		hex = 
			'#' +
			(matches[1] | 1 << 8).toString(16).slice(1) +
			(matches[2] | 1 << 8).toString(16).slice(1) +
			(matches[3] | 1 << 8).toString(16).slice(1);
		return hex;
	}else{
		return orig;
	}
}

//ajoute un attribut avec son chemin complet
export function updateObj(obj,newVal){
    var keys = Object.keys(newVal);
    var n = obj;
    if ( keys.length > 0){
	if (!(keys[0] in obj)){
	    obj[keys[0]]=newVal[keys[0]];
	    return;
	}
	updateObj(obj[keys[0]],newVal[keys[0]]);
    }
    return;
}
