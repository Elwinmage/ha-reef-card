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
	console.debug("ELEMENT",elt);
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


    set_conf(config){
	this.config=config;
    }

    _render_content(content_conf){
	const r_element= customElements.get(content_conf.view);
	const content= new r_element();
	// translate from translation_key to entity_id
	content.setConfig(content_conf.conf);
	content.hass=this._hass;
	return content;
    }
    
    render(){
	console.debug("RENDER Dialog",this.to_render);
	let close_conf={
	    "image": new URL('../img/close_cross.svg',import.meta.url),
	    "tap_action":{
		"domain":"redsea_ui",
		"action":"exit-dialog",
	    },
	    "label": i18n._("exit"),
	    "class": "dialog_button",
	};
	let content=html``;
	if (this.to_render != null){
	    this._shadowRoot.querySelector("#dialog-title").innerHTML=i18n._(this.to_render.title_key);
	    content=html`${this.to_render.content.map(c => this._render_content(c))}`;
	}
/*	const SsRow = customElements.get('hui-entities-card');
	const sssor = new SsRow();
	sssor.setConfig({type:"entities",entities:['switch.rsdose4_338229039_device_state']});
	sssor.hass=this._hass;
	const SRow = customElements.get('hui-toggle-entity-row');
	const ssor = new SRow();
	ssor.setConfig({type:'entity',entity:"switch.rsdose4_338229039_device_state"});
	ssor.hass=this._hass;*/
	
	return html`
          <div id="window-mask">
   	    <div id="dialog">
              <div id="dialog-close">
                 <click-image .hass=${this._hass} .conf=${close_conf}></click-image>
              </div>
              <div id="dialog-title"></div>
              <div id="dialog-content">${content}</div>
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
