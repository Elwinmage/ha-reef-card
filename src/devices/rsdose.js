import { html } from "lit";
import RSDevice from "./device";
import {config} from "./mapping/RSDOSE4";
import DoseHead from "./dose_head";

import style_rsdose from "./rsdose.styles";
import style_common from "./common.styles";

import i18n from "../translations/myi18n.js";

import {rgbToHex,hexToRgb,updateObj} from "../common";

/*
 * RSDose 
 */
// TODO: RSDOSE Implement advanced schedule edition
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/14
//   labels: enhancement, rsdose
export default class RSDose extends RSDevice{

// TODO: RSDOSE Implement basic services
// Issue URL: https://github.com/Elwinmage/ha-reef-card/issues/13
//   labels: enhancement, rsdose
    static styles = [style_rsdose,style_common];
    _heads = [];
    
    constructor(hass,device,user_config){
	console.log("rsdose.constr config:",config);
	super(config,hass,device,user_config);
    }// end of constructor

    _populate_entities(){
	
    }

    _populate_entities_with_heads(){
	for (let i=0; i<=this.config.heads_nb;i++){
	    this._heads.push({'entities':{}});
	}
	for (var entity_id in this.hass.entities){
	    var entity=this.hass.entities[entity_id];
	    for (var d of this.device.elements){
		var fname=d['name'].split("_");
		var head_id=0;
		if (fname[fname.length  - 2 ] == "head"){
		    head_id=parseInt(fname[fname.length-1]);
		}
		if(entity.device_id == d.id){
		    if (head_id==0){
			this.entities[entity.translation_key]=entity;
		    }
		    else {
			this._heads[head_id].entities[entity.translation_key]=entity;
		    }
		    
		}
	    }
	}
    }
    _get_val(head,entity_id){
	console.debug("rsdose._get_val: "+entity_id);
	let entity = this.hass.states[this.entities[head][entity_id].entity_id];
	return entity.state;
    }
    
    _render_head(head_id){
	return html`
<div class="head" id="head_${head_id}">
	<dose-head class="head" head_id="head_${head_id}" hass="${this.hass}" entities="${this._heads[head_id].entities}" config="${this.config.heads["head_"+head_id]}" />

</div>
`;

    }
    
    render(){
	console.debug("rsdose.render");
	this.update_config();
	// disabled
	let disabled=false;
	let sub_nb=this.device.elements.length;
	for( var i = 0; i<sub_nb; i++){
	    if (this.device.elements[i].disabled_by!=null){
		disabled=true;
		break;
	    }// if
	}// for
	if (disabled==true){
	    console.log("DISABLED");
	    return this._render_disabled();
	}//if
	this._populate_entities_with_heads();
	return html`
	<div class="device_bg">
	  <img class="device_img" id="rsdose4_img" alt=""  src='${this.config.background_img}' />
        <div class="heads">
	${Array.from({length:this.config.heads_nb},(x,i) => i+1).map(head => this._render_head(head))}
       </div>
        ${this._render_actuators()}
	</div>`;

    }

    _editor_head_color(head_id){
	this.update_config();
	let color=rgbToHex("rgb\("+this.config.heads["head_"+head_id].color+"\);");
	return html `
         <input type="color" id="head_${head_id}" name="head_${head_id}" value="${color}" @change="${this.handleChangedEvent}" @input="${this.handleChangedEvent}" /> 
         <label class="tab-label">${i18n._("head")} ${head_id}: ${this.hass.states[this._heads[head_id].entities['supplement'].entity_id].state} : </label>
         <br />
     `;
    }//end of function _editor_head_color

    handleChangedEvent(changedEvent) {
	console.debug("rsdose.handleChangedEvent ",changedEvent);
	const hex=changedEvent.currentTarget.value;
	var newVal={conf:{[this.current_device.config.model]:{devices:{[this.current_device.device.name]:{heads:{[changedEvent.target.id]:{color:hexToRgb(hex)}}}}}}};
	var newConfig = JSON.parse(JSON.stringify(this._config));
	try{
	    newConfig.conf[this.current_device.config.model].devices[this.current_device.device.name].heads[changedEvent.target.id].color = hexToRgb(hex);
	}
	catch (error){
	    updateObj(newConfig,newVal);
	}
        const messageEvent = new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(messageEvent);
    }// end of function handleChangedEvent
    
    editor(doc){
	console.debug("rsdose.editor");
	this._populate_entities_with_heads();
	var element = doc.getElementById("heads_colors");
	if (element){
	    element.reset();
	}
	return html`
<hr />
<h1>${i18n._("heads_colors")}</h1>
<form id="heads_colors">
   	${Array.from({length:this.config.heads_nb},(x,i) => i+1).map(head => this._editor_head_color(head))}
</form>
`
	;
    }//end of function editor
}


window.customElements.define('rs-dose4', RSDose);

