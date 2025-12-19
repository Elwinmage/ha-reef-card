import { html,LitElement } from "lit";

import i18n from "../../translations/myi18n.js";

import style_dialog from "./dialog.styles";

import ClickImage from "./click_image";
import style_click_image from "./click_image.styles";

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
	content.setConfig(clone);
//	content.setConfig({type:"entities",entities:[{entity:'number.simu_rsdose4_1210347614_head_1_manual_volume',name:{type:"entity"}}, 'button.simu_rsdose4_1210347614_head_1_manual_dosing']});
	content.hass=this._hass;
	content.entities=this.elt.entities;
	this._shadowRoot.querySelector("#dialog-content").appendChild(content);
    }
    
    render(){
	let close_conf={
	    "image": new URL('../img/close_cross.svg',import.meta.url),
	    "tap_action":{
		"domain":"redsea_ui",
		"action":"exit-dialog",
	    },
	    "label": i18n._("exit"),
	    "class": "dialog_button",
	};
	if(this.to_render!=null){
	    console.debug("Render dialog");
	     this._shadowRoot.querySelector("#dialog-close").innerHTML='';
	    this._shadowRoot.querySelector("#dialog-title").innerHTML='';
	    this._shadowRoot.querySelector("#dialog-content").innerHTML='';
	    // Closing cross
	    if(!("close_cross" in this.to_render && !this.to_render.close_cross)){
		let close_cross_class=customElements.get("click-image");
		let close_cross=new close_cross_class();
		close_cross.conf=close_conf;
		close_cross.hass=this._hass;
		this._shadowRoot.querySelector("#dialog-close").appendChild(close_cross);
	    }
	    // Title
	    this._shadowRoot.querySelector("#dialog-title").innerHTML=i18n._(this.to_render.title_key);
	    // Content
	    this.to_render.content.map(c => this._render_content(c));
	}
	return html`
          <div id="window-mask">
   	    <div id="dialog">
              <div id="dialog-close"></div>
              <div id="dialog-title"></div>
              <div id="dialog-content"></div>
              <div id="dialog-submit">
                 <common-button .hass=${this._hass} .conf=${close_conf}/>
              </div>
            </div>
         </div>
`;
    }//end of function render
}// end of class

window.customElements.define('common-dialog', Dialog);

var dialog_box = new Dialog();
export default dialog_box;
