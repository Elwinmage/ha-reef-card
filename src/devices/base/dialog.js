import { html,LitElement } from "lit";

import i18n from "../../translations/myi18n.js";

import style_dialog from "./dialog.styles";

import ClickImage from "./click_image";
import style_click_image from "./click_image.styles";

import MyElement from "./element";

import * as dhd from "../dose_head.dialog";

var iconv=i18n;

/*
 *  Dialog
 */
export class Dialog extends  LitElement {

    static styles = [style_dialog,style_click_image];

    static get properties(){
	return {
//	    _hass:{},
	    _shadowRoot:{},
	    to_render: {},
	    elt: {},
/*	    elts: [],
	    extends_to_re_render:[],*/
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
	this.elts=[];
	this.extends_to_re_render=[];
	this.to_render=null;
	this.overload_quit=null;
    }//end of constructor

    init(hass,shadowRoot){
	this._hass=hass;
	this._shadowRoot=shadowRoot;
    }
    

    display(conf){
	let box=this._shadowRoot.querySelector("#window-mask");
	this.elt=conf.elt;
	this.to_render=this.config[conf.type];
	this.overload_quit=conf.overload_quit;
	this.render();
	box.style.display="flex";
    }

    quit(){
	if (this.overload_quit){
	    var event={type:this.overload_quit,elt:this.elt};
	    this.display(event);
	}
	else {
	    this._shadowRoot.querySelector("#window-mask").style.display="none";
	    this.elt=null;
	    this.to_render=null;
	}
    }

    set hass(obj){
	this._hass=obj;
	if(this.elts){
	    for (let elt of this.elts){
		elt.hass=obj;
	    }
	}
	if(this.extends_to_re_render){
	    let dose_head_dialog=dhd;
	    for(let elt of this.extends_to_re_render){
		eval(elt);
	    }
	}
	//	this.render();
    }

    set_conf(config){
	this.config=config;
    }

    _render_content(content_conf){
	var content=null;
	if(content_conf.view=="common-button"){
	    content=MyElement.create_element(this._hass,content_conf.conf,this.elt.device);
	}
	else if(content_conf.view=="text"){
	    content=this._shadowRoot.createElement("p");
	    try {
		content.innerHTML=eval(content_conf.value);
	    }
	    catch (error){
		console.error("ERROR",error);
		content.innerHTML=content_conf.value;
	    }
	}
	else if(content_conf.view=="extend"){
	    let dose_head_dialog=dhd;
	    var cmd=content_conf.extend+'.'+this.to_render.name+"(this.elt,this._hass,this._shadowRoot)";
	    eval(cmd);
	    if (content_conf.re_render){
		this.extends_to_re_render.push(cmd);
	    }
	    return;
	}
	else{
	    const r_element= customElements.get(content_conf.view);
	    content= new r_element();
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
	    content.setConfig(clone);
	    content.hass=this._hass;
	    content.device=this.elt.device;
	}
	this.elts.push(content);
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
		"background-color":"rgba(0,0,0,0)",
	    }
	};

	if(this.to_render!=null){
	    let submit_conf=close_conf;
	    let cancel_conf=null;
	    if("validate" in this.to_render){
		this.to_render.validate['elt.css']={"background-color":"rgba(0,0,0,0)"};
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
	    // Content
	    this.elts=[];
	    this.extends_to_re_render=[];
	    this.to_render.content.map(c => this._render_content(c));
	    // Submit
	    let submit_button=MyElement.create_element(this._hass,submit_conf,this.elt.device);
	    this._shadowRoot.querySelector("#dialog-submit").appendChild(submit_button);
	    //Cancel
	    if(cancel_conf){
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
