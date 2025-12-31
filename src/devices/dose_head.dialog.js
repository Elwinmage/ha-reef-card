import { html } from "lit";
import supplements_list from "./supplements";

import i18n from "../translations/myi18n";

import MyElement from "./base/element";

//import Icon from '@mdi/react';
import { mdiDeleteEmpty } from '@mdi/js';

export function set_manual_head_volume(elt,hass,shadowRoot){
    if (elt.device.config.shortcut){
	for(let shortcut of elt.device.config.shortcut.split(',')){
	    /*const r_element= customElements.get("common-button");
	    const content= new r_element();*/
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
	    /*content.setConfig(conf);
	    content.device=elt.device;
	    content.hass=hass;*/
	    let content=MyElement.create_element(hass,conf,elt.device);
	    shadowRoot.querySelector("#dialog-content").appendChild(content);
	}
    }
}

export function add_supplement(elt,hass,shadowRoot){
    let selected_supplement=elt.device.get_entity("supplements").state;
    let supplement = supplements_list.get_supplement(selected_supplement);

    let img='/hacsfiles/ha-reef-card/generic_container.supplement.png';
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
	shadowRoot.querySelector("#dialog-content").appendChild(content);
    }

}
