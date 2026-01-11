import { html } from "lit";
import supplements_list from "./supplements";

import i18n from "../translations/myi18n";
import * as com from '../common';

import MyElement from "./base/element";

import { mdiDeleteEmpty } from '@mdi/js';

export function set_manual_head_volume(elt,hass,shadowRoot){
    if (elt.device.config.shortcut){
	for(let shortcut of elt.device.config.shortcut.split(',')){
	    let conf={
		"label": shortcut+"mL",
		"type":"common-button",
		"stateObj":null,
		"tap_action": [
		    {
			"domain": "number",
			"action" : "set_value",
			"data":{"entity_id":"manual_head_volume","value":shortcut}
		    },
		    {
			"domain": "button",
			"action" : "press",
			"data": {"entity_id":"manual_head"},
		    },
		    {
			"domain": "redsea_ui",
			"action" : "message_box",
			"data": "iconv._('dosing')+ ' "+shortcut+"mL'"
		    }
		],
		"css":{
		    "display": "inline-block",
		    "border":"1px solid gray",
		    "border-radius": "15px",
		    "padding-left":"10px",
		    "padding-right":"10px",
		    "margin-bottom": "20px",			    
		    "background-color": "rgb("+elt.device.config.color+")",
		    "color": "white",
		}
	    };
	    let content=MyElement.create_element(hass,conf,elt.device);
	    shadowRoot.querySelector("#dialog-content").appendChild(content);
	}
    }
}

export function add_supplement(elt,hass,shadowRoot){
    let selected_supplement=elt.device.get_entity("supplements").state;
    let supplement = supplements_list.get_supplement(selected_supplement);

    let img='/hacsfiles/ha-reef-card/generic_container.supplement.png';
    let cc=shadowRoot.querySelector("#add-supplement");
    if(cc != null){
	cc.remove();
    }
    
    if (supplement){
	let t_img='/hacsfiles/ha-reef-card/'+supplement.uid+'.supplement.png';
	var http = new XMLHttpRequest();
	http.open('HEAD', t_img, false);
	http.send();
	if(http.status != 404){
	    img=t_img;
	}
	const r_element=customElements.get("click-image");
	const content= new r_element();
	let conf={"image":img,"css":{"display": "inline-block","width":"20%"},"elt.css":{"width":"100%"}}
	content.setConfig(conf);
	let div=document.createElement("div");
	div.style.cssText = "display: inline-block";
	div.id="add-supplement";
	shadowRoot.querySelector("#dialog-content").appendChild(div);
	div.appendChild(content);
	let infos=document.createElement("div");
	infos.innerHTML ="<h1 style='text-decoration:underline'>"+supplement.fullname+"</h1>";
	infos.innerHTML+="<h2><span style='color:#009ac7'>"+i18n._("name")+":</span> "+supplement.name+"</h2>";
	infos.innerHTML+="<h2><span style='color:#d32625'>"+i18n._("brand_name")+":</span> "+supplement.brand_name+"</h2>";
	infos.innerHTML+="<h2><span style='color:rgb(175,50,175)'>"+i18n._("display_name")+":</span> "+supplement.display_name+"</h2>";
	infos.innerHTML+="<h2><span style='color:rgb(70,170,70)'>"+i18n._("short_name")+":</span> "+supplement.short_name+"</h2>";
	if ("sizes" in supplement && supplement.sizes.length>0){
            infos.innerHTML+="<h2><span style='color:#c3d737'>"+i18n._("sizes")+":</span> "+supplement.sizes+" mL</h2>";
	    //
	}
	infos.innerHTML+="<h3><span style='color:rgb(190,190,190)'>UID:</span> "+supplement.uid+"</h3>";
	//
	infos.style.cssText = "display: inline-block;width: 70%;position:relative;";
	div.appendChild(infos);
    }
    else{
	// unkown supplement
	const r_element= customElements.get("hui-entities-card");
	const content= new r_element();

	let conf={
	    "type":"entities",
	    "entities": [
		{"entity":elt.get_entity("new_supplement_brand_name").entity_id,"name":{"type":"entity"}},
		{"entity":elt.get_entity("new_supplement_name").entity_id,"name":{"type":"entity"}},
		{"entity":elt.get_entity("new_supplement_short_name").entity_id,"name":{"type":"entity"}},
	    ]
	};
	content.setConfig(conf);
	content.hass=hass;
	content.device=elt.device;
	let div=document.createElement("div");
	div.id="add-supplement";
	div.appendChild(content);

	shadowRoot.querySelector("#dialog-content").appendChild(div);
    }
}


export function set_container_volume(elt,hass,shadowRoot){
    let selected_supplement=elt.device.get_entity("supplement").state;
    let supplement = supplements_list.get_supplement(selected_supplement);
    if(!supplement){
	selected_supplement=elt.device.get_entity("supplements").state;
	supplement = supplements_list.get_supplement(selected_supplement);
    }
    if (supplement && supplement.sizes){
	for (let size of supplement.sizes){
	    let label=size+"mL";
	    if(size>= 1000){
		label=size/1000+"L";   
	    }
	    let conf={
		"label": label,
		"type":"common-button",
		"stateObj":null,
		"tap_action": [
		    {
			"domain": "switch",
			"action" : "turn_on",
			"data":{"entity_id":"slm"}
		    },
		    {
			"domain": "number",
			"action" : "set_value",
			"data":{"entity_id":"container_volume","value":size}
		    },
		    {
			"domain": "number",
			"action" : "set_value",
			"data":{"entity_id":"save_initial_container_volume","value":size}
		    },
		],
		"css":{
		    "display": "inline-block",
		    "border":"1px solid gray",
		    "border-radius": "15px",
		    "padding-left":"10px",
		    "padding-right":"10px",
		    "margin-bottom": "20px",			    
		    "background-color": "rgb("+elt.device.config.color+")",
		    "color": "white",
		},
		"elt.css":{
		    "background-color": "rgb("+elt.device.config.color+")",
		    "color": "white",
		}
		
	    };
	    let content=MyElement.create_element(hass,conf,elt.device);
	    shadowRoot.querySelector("#dialog-content").appendChild(content);
	}//for
    }
}

export function edit_container(elt,hass,shadowRoot){
    set_container_volume(elt,hass,shadowRoot);
}

export function head_configuration(elt,hass,shadowRoot,schedule=null){
    var content=null;
    if(schedule==null || schedule.type==elt.device.get_entity('schedule_head').attributes.schedule.type){
	schedule=elt.device.get_entity('schedule_head').attributes.schedule;
    }
    
    var form=shadowRoot.querySelector("#schedule");
    if(form){
	form.remove();
    }
    form=shadowRoot.createElement("form");
    form.className="schedule";
    form.id="schedule";
    var schedule_type=com.create_select(shadowRoot,'schedule',['single','custom','hourly','timer'],schedule.type);
    schedule_type.addEventListener("change",function(event) {handle_schedule_type_change(event,elt,hass,shadowRoot)});
    form.appendChild(schedule_type);
    content=eval("head_configuration_schedule_"+schedule.type+"(schedule,elt,hass,shadowRoot,form);");
    shadowRoot.querySelector("#dialog-content").appendChild(content);
}

function head_configuration_schedule_single(schedule,elt,hass,shadowRoot,form){
    var node=null;
    //header
    node=shadowRoot.createElement("label");
    node.innerHTML=i18n._("days");
    form.appendChild(node);
    //days
    for(let day=1;day<8;day++ ){
	let name="day_"+String(day);
	node=shadowRoot.createElement("input");
	node.className=("days");
	node.type="checkbox";
	node.value=name;
	node.id=name;
	node.checked=true;
	let label=shadowRoot.createElement("label");
	label.innerHTML=i18n._("day_"+String(day))[0];
	label.className="days";
	label.htmlFor=name;
	form.appendChild(label);
	form.appendChild(node);
    }
    //time
    form.appendChild(com.create_hour(shadowRoot,'hour',schedule.time));
    //mode
    form.appendChild(com.create_select(shadowRoot,'speed',['whisper','regular','quick'],schedule.mode));
    return form;
}

function head_configuration_schedule_custom(schedule,elt,hass,shadowRoot,form){
    console.log("INTERVALS",schedule.intervals);
    if(!schedule.intervals){
	schedule.intervals=[{
	    st: 0,
            end: 1440,
            nd: 10,
            mode: 'regular',
	}];
    }
    for(var interval of schedule.intervals){
	head_configuration_intervals(shadowRoot,interval,form);
    }
    return form;
}


function head_configuration_intervals(shadowRoot,interval,form){
    let start=com.create_hour(shadowRoot,'st',interval.st);
    let end=com.create_hour(shadowRoot,'end',interval.nd);
    let nd=com.create_select(shadowRoot,'nd', Array(24).fill().map((x,i)=>i+1),interval.nd,false);
    form.appendChild(start);
    form.appendChild(end);
    form.appendChild(nd);
    form.appendChild(com.create_select(shadowRoot,'speed',['whisper','regular','quick'],interval.mode));
}

function head_configuration_schedule_hourly(schedule,elt,hass,shadowRoot,form){
    //let min=com.create_select(shadowRoot,'min', [0,10,20,30,40,50],schedule.min,false,"min");
    let min=com.create_select(shadowRoot,'min', Array(6).fill().map((x,i)=>i*10),schedule.min,false,"min");
    form.appendChild(min);
    
    //mode
    form.appendChild(com.create_select(shadowRoot,'speed',['whisper','regular','quick'],schedule.mode));
    return form;

}

function head_configuration_schedule_timer(schedule,elt,hass,shadowRoot,form){
    return form;
}

function handle_schedule_type_change(event,elt,hass,shadowRoot){
    var schedule={type:event.target.value};
    head_configuration(elt,hass,shadowRoot,schedule);
}
