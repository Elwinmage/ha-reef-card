import { html } from "lit";
import supplements_list from "./supplements";

import i18n from "../translations/myi18n";
import * as com from '../common';

import MyElement from "./base/element";

import { mdiDeleteEmpty } from '@mdi/js';

import { stringToTime } from '../common'

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

export function head_configuration(elt,hass,shadowRoot,saved_schedule=null){
    var content=null;
    if(saved_schedule==null ||saved_schedule.type==elt.device.get_entity('schedule_head').attributes.schedule.type){
	saved_schedule=elt.device.get_entity('schedule_head').attributes.schedule;
    }
    
    var form=shadowRoot.querySelector("#schedule");
    if(form){
	form.remove();
    }
    form=shadowRoot.createElement("form");
    form.className="schedule";
    form.id="schedule";
    var schedule_type=com.create_select(shadowRoot,'schedule',['single','custom','hourly','timer'],saved_schedule.type);
    schedule_type.addEventListener("change",function(event) {handle_schedule_type_change(event,elt,hass,shadowRoot)});
    form.appendChild(schedule_type);
    //daily dose
    var node=null;
    node=shadowRoot.createElement("label");
    node.innerHTML=i18n._("daily_dose");
    form.appendChild(node);
    var dd=shadowRoot.createElement("input");
    dd.type="number";
    dd.id="dailydose";
    dd.min=0.1;
    dd.step=0.1;
    dd.max=300;
    dd.value=elt.device.get_entity("daily_dose").state;
    form.appendChild(dd);

    //Type specific
    content=eval("head_configuration_schedule_"+saved_schedule.type+"(saved_schedule,elt,hass,shadowRoot,form);");
    
    //header days
    var node=null;
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
	if(saved_schedule && saved_schedule.days && !saved_schedule.days.includes(day)){
	    node.checked=false;
	}
	else{
	    node.checked=true;
	}
	let label=shadowRoot.createElement("label");
	label.innerHTML=i18n._("day_"+String(day))[0];
	label.className="days";
	label.htmlFor=name;
	form.appendChild(label);
	form.appendChild(node);
    }
    var save_button=shadowRoot.createElement("button");
    save_button.innerHTML=i18n._('save_schedule');
    save_button.style.width="100%",
    save_button.addEventListener("click", function(e) {e.preventDefault();save_schedule(e,shadowRoot,form,elt,hass)},false);
    form.appendChild(save_button);
    shadowRoot.querySelector("#dialog-content").appendChild(content);
}

function head_configuration_schedule_single(schedule,elt,hass,shadowRoot,form){
    //time
    form.appendChild(com.create_hour(shadowRoot,'hour',schedule.time));
    //mode
    form.appendChild(com.create_select(shadowRoot,'speed',['whisper','regular','quick'],schedule.mode));
    return form;
}


function head_configuration_schedule_custom(schedule,elt,hass,shadowRoot,form){
    const default_interval={
	    st: 0,
            end: 1440,
            nd: 10,
            mode: 'regular',
    };
    if(!schedule.intervals){
	schedule.intervals=[default_interval];
    }
    var intervals=shadowRoot.createElement("div");
    for(var interval of schedule.intervals){
	head_configuration_intervals_custom(shadowRoot,interval,intervals);
    }
    //add interval button
    form.appendChild(intervals);
    var add_button=shadowRoot.createElement("button");
    add_button.innerHTML='+';
    add_button.style.width="100%",
    add_button.addEventListener("click", function(e) {e.preventDefault();head_configuration_intervals_custom(shadowRoot,default_interval,intervals);},false);
    form.appendChild(add_button);
    return form;
}


function head_configuration_schedule_timer(schedule,elt,hass,shadowRoot,form){
    const default_interval={
	    st: 0,
            volume: 1,
            mode: 'regular',
    };
    if(!schedule.intervals){
	schedule.intervals=[default_interval];
    }
    //remove daily dose input number
    var dd=form.querySelector("#dailydose");
    dd.disabled=true;

    var intervals=shadowRoot.createElement("div");
    for(var interval of schedule.intervals){
	head_configuration_intervals_timer(shadowRoot,interval,intervals);
    }
    //add interval button
    form.appendChild(intervals);
    var add_button=shadowRoot.createElement("button");
    add_button.innerHTML='+';
    add_button.style.width="100%",
    add_button.addEventListener("click", function(e) {e.preventDefault();head_configuration_intervals_timer(shadowRoot,default_interval,intervals);},false);
    form.appendChild(add_button);
    update_dd(form);;
    return form;
}

function save_schedule(event,shadowRoot,form,elt,hass){
    var schedule={};
    schedule.type=shadowRoot.querySelector("#schedule_1").value;
//    schedule.dd=parseFloat(shadowRoot.querySelector("#dailydose").value);
    schedule.days=[];
    for (var day=1;day<8;day++){
	var day_id="#day_"+String(day);
	if(shadowRoot.querySelector(day_id).checked){
	    schedule.days.push(day);
	}
    }
    var to_schedule=eval("save_schedule_"+schedule.type+"(shadowRoot,elt,hass,schedule)");
    if(to_schedule!=null){
	var data={
	    access_path: "/head/"+elt.device.config.id+"/settings",
	    method: "put",
	    data: {schedule:to_schedule},
	    device_id: elt.device.device.device.elements[0].primary_config_entry,
	}    
	console.debug("Call service", data);
	hass.callService("redsea","request", data);
	shadowRoot.dispatchEvent(
	    new CustomEvent(
		"hass-notification",
		{
		    bubbles: true,
		    composed: true,
			detail: {
			    message: i18n._("schedule_saved")
			}
		}
	    )
	);
    }
    else {
	console.error("Can not save schedule", data);
    }
}

function save_schedule_single(shadowRoot,elt,hass,schedule){
    schedule.dd=parseFloat(shadowRoot.querySelector("#dailydose").value);
    schedule.time=stringToTime(shadowRoot.querySelector("#hour_1").value);
    schedule.mode=shadowRoot.querySelector("#speed_1").value;
    return schedule;
}

function save_schedule_hourly(shadowRoot,elt,hass,schedule){
    schedule.dd=parseFloat(shadowRoot.querySelector("#dailydose").value);
    if (schedule.dd<5.0){
	shadowRoot.dispatchEvent(
	    new CustomEvent(
		"hass-notification",
		    {
			bubbles: true,
			composed: true,
			detail: {
			    message: i18n._("can_not_save")+i18n._("min_dose")
			}
		    }
	    )
	);
	return null;
    }//fi
    schedule.min=parseInt(shadowRoot.querySelector("#min_1").value);
    schedule.mode=shadowRoot.querySelector("#speed_1").value;
    return schedule;
}

function save_schedule_custom(shadowRoot,elt,hass,schedule){
    schedule.dd=parseFloat(shadowRoot.querySelector("#dailydose").value);
    schedule.intervals=[];
    for (var interval of shadowRoot.querySelectorAll(".interval")){
	var s_id=interval.id.split("_");
	var position = s_id[s_id.length-1];
	var start=stringToTime(interval.querySelector("#st_"+position).value);
	var end=stringToTime(interval.querySelector("#end_"+position).value);
	if (end-start < 30){
	    var msg="at_least_30m_between";
	    if (end-start < 0){
		msg="end_earlier_than_start";
	    }
	    shadowRoot.dispatchEvent(
		new CustomEvent(
		    "hass-notification",
		    {
			bubbles: true,
			composed: true,
			detail: {
			    message: i18n._("can_not_save")+i18n._(msg)
			}
		    }
		)
	    );
	    return null;
	}
	var nd=parseInt(interval.querySelector("#nd_"+position).value);
	var speed=interval.querySelector("#speed_"+position).value;
	var json_interval={st:start,end:end,nd:nd,mode:speed};
	schedule.intervals.push(json_interval);
    }//for
    schedule.intervals.sort(compare_interval) ;
    schedule.type=shadowRoot.querySelector("#schedule_1").value;
    return schedule;
}


function compare_interval( a, b ) {
    if (a.st < b.st){
	return -1;
    }
    if(a.st > b.st){
	return 1;
    }
    return 0;
}


function save_schedule_timer(shadowRoot,elt,hass,schedule){
    schedule.intervals=[];
    for (var interval of shadowRoot.querySelectorAll(".interval")){
	var s_id=interval.id.split("_");
	var position = s_id[s_id.length-1];
	var start=stringToTime(interval.querySelector("#st_"+position).value);
	var volume=parseFloat(interval.querySelector("#volume_"+position).value);
	var speed=interval.querySelector("#speed_"+position).value;
	var json_interval={st:start,volume:volume,mode:speed};
	schedule.intervals.push(json_interval);
    }//for
    schedule.intervals.sort(compare_interval) ;
    schedule.type=shadowRoot.querySelector("#schedule_1").value;
    return schedule;
}


function head_configuration_intervals_custom(shadowRoot,interval,form){
    let div=shadowRoot.createElement('div');
    var position=0;
    for (position=0;position<100;position++){
	var c_elt=form.querySelector("#interval_"+position);
	if(c_elt==null){
	    break;
	}
    }
    div.className="interval";
    div.id="interval_"+position;
    let start=com.create_hour(shadowRoot,'st',interval.st,position);
    let end=com.create_hour(shadowRoot,'end',interval.end,position);
    let nd=com.create_select(shadowRoot,'nd', Array(24).fill().map((x,i)=>i+1),interval.nd,false,'',position);
    div.appendChild(start);
    div.appendChild(end);
    div.appendChild(nd);
    div.appendChild(com.create_select(shadowRoot,'speed',['whisper','regular','quick'],interval.mode,true,'',position));

    let delete_button=shadowRoot.createElement("button");
    delete_button.className="delete_button";
    if(position==0){
	delete_button.style.visibility="hidden";
    }
    delete_button.addEventListener("click", function(e) {e.preventDefault();head_configuration_delete_interval(position,form);},false);
    div.appendChild(delete_button);
    form.appendChild(div);
}

function head_configuration_intervals_timer(shadowRoot,interval,form){
    let div=shadowRoot.createElement('div');
    var position=0;
    for (position=0;position<100;position++){
	var c_elt=form.querySelector("#interval_"+position);
	if(c_elt==null){
	    break;
	}
    }
    div.className="interval";
    div.id="interval_"+position;
    let start=com.create_hour(shadowRoot,'st',interval.st,position);
    //header days
    var vol=shadowRoot.createElement('div');
    var node=null;
    node=shadowRoot.createElement("label");
    node.innerHTML=i18n._("volume");

    let volume=shadowRoot.createElement("input");
    volume.type="number";
    volume.min=0.1;
    volume.set=0.1;
    volume.max=300;
    volume.id="volume_"+position;
    volume.value="1";
    volume.className="volume";
    volume.addEventListener("change", (event) => { update_dd(shadowRoot)})
    vol.appendChild(node);
    vol.appendChild(volume);

    //
    div.appendChild(start);
    div.appendChild(vol);
    div.appendChild(com.create_select(shadowRoot,'speed',['whisper','regular','quick'],interval.mode,true,'',position));

    let delete_button=shadowRoot.createElement("button");
    delete_button.className="delete_button";
    if(position==0){
	delete_button.style.visibility="hidden";
    }
    delete_button.addEventListener("click", function(e) {e.preventDefault();head_configuration_delete_interval(position,form);},false);
    div.appendChild(delete_button);
    form.appendChild(div);
}

function head_configuration_delete_interval(position,intervals){
    var interval=intervals.querySelector("#interval_"+position);
    interval.remove();
}

function head_configuration_schedule_hourly(schedule,elt,hass,shadowRoot,form){
    let min=com.create_select(shadowRoot,'min', Array(6).fill().map((x,i)=>i*10),schedule.min,false,"min");
    form.appendChild(min);
    //mode
    form.appendChild(com.create_select(shadowRoot,'speed',['whisper','regular','quick'],schedule.mode));
    return form;

}


function handle_schedule_type_change(event,elt,hass,shadowRoot){
    var schedule={type:event.target.value};
    head_configuration(elt,hass,shadowRoot,schedule);
}

function update_dd(shadowRoot){
    var total_volume=shadowRoot.querySelector("#dailydose");
    var total=0;
    for (var volume of shadowRoot.querySelectorAll(".volume")){
	total += parseFloat(volume.value);
    }
    total_volume.value=total;
}
