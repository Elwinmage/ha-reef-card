import { html,LitElement } from "lit";

import i18n from "../../translations/myi18n.js";

import style_dialog from "./dialog.styles";

import ClickImage from "./click_image";
import style_click_image from "./click_image.styles";

import MyElement from "./element";

import * as dhd from "../dose_head.dialog";

/*
 *  Dialog
 */
export class Dialog extends  LitElement {

    static styles = [style_dialog,style_click_image];

    static get properties(){
	return {
	    _hass:{},
	    _shadowRoot:{},
	    to_render: {},
	    elt: {},
	};
    }
	
    /*
     * conf the conf in mapping file
     * stateObj the hass element 
     */
    constructor(){
 	super();
	this._hass=null;
	this._shadowRoot=null;
	this.config=null;
	this.elt=null;
	this.to_render=null;
    }//end of constructor

    init(hass,shadowRoot){
	this._hass=hass;
	this._shadowRoot=shadowRoot;
    }
    

    display(type,elt=null){
	let box=this._shadowRoot.querySelector("#window-mask");
	this.elt=elt;
	this.to_render=this.config[type];
	this.render();
	box.style.display="flex";
    }

    quit(){
	this._shadowRoot.querySelector("#window-mask").style.display="none";
	this.elt=null;
	this.to_render=null;
	
    }

    set hass(obj){
	this._hass=obj;
	this.render();
    }

    set_conf(config){
	this.config=config;
    }

    _render_content(content_conf){
	const r_element= customElements.get(content_conf.view);
	const content= new r_element();
	// translate from translation_key to entity_id
	const clone = structuredClone(content_conf.conf);
	if("entities" in content_conf.conf){
	    for (let pos in content_conf.conf.entities){
		if (typeof clone.entities[pos]=="string"){
		    clone.entities[pos]=this.elt.get_entity(content_conf.conf.entities[pos]).entity_id;
		}
		else {
		    clone.entities[pos].entity=this.elt.get_entity(content_conf.conf.entities[pos].entity).entity_id;
		}
	    }
	}
	else if("entity" in content_conf.conf){
	    clone.entity=this.elt.get_entity(content_conf.conf.entity).entity_id;
	}
	console.debug("HEAD",this.elt.device.config.id);
	content.setConfig(clone);
	content.hass=this._hass;
	content.device=this.elt.device;
	this._shadowRoot.querySelector("#dialog-content").appendChild(content);
    }
    
    render(){
	let iconv=i18n;
	let close_conf={
	    "image": new URL('../img/close_cross.svg',import.meta.url),
	    "type": "common-button",
	    "stateObj": null,
	    "tap_action":{
		"domain":"redsea_ui",
		"action":"exit-dialog",
	    },
	    "label": i18n._("exit"),
	    "class": "dialog_button",
	    "elt.css":{
		"background-color":"rgb(0,0,0,0)",
	    }
	};

	if(this.to_render!=null){
	    console.debug("Render dialog",this.to_render);
	    let submit_conf=close_conf;
	    let cancel_conf=null;
	    if("validate" in this.to_render){
		submit_conf=this.to_render.validate;
	    }
	    if("cancel" in this.to_render && this.to_render.cancel){
		cancel_conf=close_conf;
		cancel_conf.label=i18n._("cancel");
		cancel_conf.css={left:"-30%"};
				
	    }

	    this._shadowRoot.querySelector("#dialog-close").innerHTML='';
	    this._shadowRoot.querySelector("#dialog-title").innerHTML='';
	    this._shadowRoot.querySelector("#dialog-content").innerHTML='';
	    this._shadowRoot.querySelector("#dialog-cancel").innerHTML='';
	    this._shadowRoot.querySelector("#dialog-submit").innerHTML='';
	    // Closing cross
	    if(!("close_cross" in this.to_render && !this.to_render.close_cross)){
		let close_cross_class=customElements.get("click-image");
		let close_cross=new close_cross_class();
		close_cross.conf=close_conf;
		close_cross.hass=this._hass;
		this._shadowRoot.querySelector("#dialog-close").appendChild(close_cross);
	    }
	    // Title
	    this._shadowRoot.querySelector("#dialog-title").innerHTML=eval(this.to_render.title_key);
	    //special content for rsdose 
	    let dose_head_dialog=dhd;
	    if("extend" in this.to_render){
		var cmd=this.to_render.extend+'.'+this.to_render.name+"(this.elt,this._hass,this._shadowRoot)";
		eval(cmd);
	    }
	    // Content
	    this.to_render.content.map(c => this._render_content(c));
	    // Submit
	    let submit_button=MyElement.create_element(this._hass,submit_conf,this.elt.device);
	    this._shadowRoot.querySelector("#dialog-submit").appendChild(submit_button);
	    //Cancel
	    if(cancel_conf){
		console.log("display cancel");
		let cancel_button=MyElement.create_element(this._hass,cancel_conf,this.elt.device);
		this._shadowRoot.querySelector("#dialog-cancel").appendChild(cancel_button);
	    }
	}
	return html`
          <div id="window-mask">
   	    <div id="dialog">
              <div id="dialog-close"></div>
              <div id="dialog-title"></div>
              <div id="dialog-content"></div>
              <div id="dialog-cancel"></div>
              <div id="dialog-submit"></div>
            </div>
         </div>
`;
    }//end of function render
}// end of class

window.customElements.define('common-dialog', Dialog);
