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
}


