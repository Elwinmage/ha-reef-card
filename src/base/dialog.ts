import { html, LitElement } from "lit";

import style_dialog from "./dialog.styles";
import style_click_image from "./click_image.styles";
import { SafeEval, SafeEvalContext } from '../utils/SafeEval';

import { RSHTMLElement } from "../types/index";

import i18n from "../translations/myi18n.js";

import { MyElement } from "./element";

import { run_action } from "../utils/actions";

export class Dialog extends LitElement {

  static override styles = [style_dialog, style_click_image];

  static override get properties() {
    return {
      _shadowRoot: {},
      to_render: {},
      elt: {},
    };
  }

  protected _hass: any = null;
  protected _shadowRoot: ShadowRoot | null = null;
  protected config: any = null;
  protected elt: any = null;
  protected elts: any[] = [];
  protected extends_to_re_render: any[] = [];
  protected to_render: any = null;
  protected overload_quit: any = null;
  protected evalCtx: SafeEvalContext;

  constructor() {
    super();
    this._hass = null;
    this._shadowRoot = null;
    this.config = null;
    this.elt = null;
    this.elts = [];
    this.extends_to_re_render = [];
    this.to_render = null;
    this.overload_quit = null;
  }

  createContext(){
    if(!this.evalCtx){
	const context = {
	  config: this.elt.device.config,
	  i18n: i18n,
	};
      this.evalCtx = new SafeEval(context);
    }      
  }
  
  evaluate(expression: string){
    this.createContext();
    return this.evalCtx.evaluate(expression);
  }

  
  init(hass: any, shadowRoot: ShadowRoot): void {
    this._hass = hass;
    this._shadowRoot = shadowRoot;
  }

  display(conf: any): void {
    if (!this._shadowRoot) return;
    const box = this._shadowRoot.querySelector("#window-mask") as HTMLElement | null;
    
    if (!box) return;
    this.elt = conf.elt;
    this.to_render = this.config?.[conf.type];
    this.overload_quit = conf.overload_quit;
    this.evalCtx = null;
    this.render();// no this.requestUpdate() here !!
    box.style.display = "flex";
  }

  quit(): void {
    if (this.overload_quit) {
      const event = { type: this.overload_quit, elt: this.elt };
      this.display(event);
    }
    else {
      if (this._shadowRoot) {
        const box = this._shadowRoot.querySelector("#window-mask") as HTMLElement | null;
        if (box) box.style.display = "none";
      }
      this.elt = null;
      this.to_render = null;
    }
  }

  set hass(obj: any) {
    this._hass = obj;
    if (this.elts) {
      for (const elt of this.elts) {
        elt.hass = obj;
      }
    }
    if (this.to_render && this.extends_to_re_render) {
      for (const _elt of this.extends_to_re_render) {
	run_action(_elt.package,_elt.function_name,this.elt,this._hass,this._shadowRoot);
      }
    }
  }

  set_conf(config: any): void {
    this.config = config;
  }

  create_form(content_conf: any): HTMLElement[] {
    const elements: HTMLElement[] = [];

    for (const input of content_conf) {
      if (!this._shadowRoot) continue;
      const doc = this._shadowRoot.ownerDocument;
      if (!doc) continue;
      const elt = doc.createElement(input.type);
      elt.id = input.id;
      elements.push(elt);
    }

    return elements;
  }

  render_dialog(elements: any[]): void {
    if (!this.to_render) return;

    for (const element of this.to_render.elements || []) {
      const tag_name = element.type;

      const r_element = elements.find((el: any) => el.name === element.name);
      if (!r_element) continue;

      const Element = customElements.get(tag_name);

      if (Element) {
        const elt = new (Element as any)() as HTMLElement & { setConfig?: (c: any) => void; hass?: any; device?: any };
        elt.setConfig?.(element);
        elt.hass = this._hass;
        elt.device = this.elt?.device;
        this.elts.push(elt);
        if (this._shadowRoot) {
          this._shadowRoot.appendChild(elt);
        }
      }
    }
  }


  _render_content(content_conf){
	var content=null;
	if(content_conf.view=="common-button"){
	    content=MyElement.create_element(this._hass,content_conf.conf,this.elt.device);
	}
	else if(content_conf.view=="text"){
	  //content=this._shadowRoot.createElement("p");
	  content=document.createElement("p");
	  this._shadowRoot.appendChild(content);
	    try {
		content.innerHTML=this.evaluate(content_conf.value);
	    }
	    catch (error){
		console.error("ERROR",error);
		content.innerHTML=content_conf.value;
	    }
	}
	else if(content_conf.view=="extend"){

	  run_action(content_conf.extend,this.to_render.name,this.elt,this._hass,this._shadowRoot);

	  
	    if (content_conf.re_render){
	      this.extends_to_re_render.push({"package":content_conf.extend,"function_name":this.to_render.name});
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
    let close_conf={
      "image": new URL('../img/close_cross.svg',import.meta.url),
      "type": "common-button",
      "stateObj": null,
      "tap_action":{
	"domain":"redsea_ui",
	"action":"exit-dialog",
      },
      "label": "${i18n._('exit')}",
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
	cancel_conf.label="${i18n._('cancel')}";
	cancel_conf.css={left:"-30%"};
	
      }

      this._shadowRoot.querySelector("#dialog-close").innerHTML='';
      this._shadowRoot.querySelector("#dialog-title").innerHTML='';
      this._shadowRoot.querySelector("#dialog-content").innerHTML='';
      this._shadowRoot.querySelector("#bt_left").innerHTML='';
      this._shadowRoot.querySelector("#bt_center").innerHTML='';
      this._shadowRoot.querySelector("#bt_right").innerHTML='';
      // Closing cross
      if(!("close_cross" in this.to_render && !this.to_render.close_cross)){
	let close_cross_class=customElements.get("click-image");
	let close_cross=new close_cross_class();
	(close_cross as RSHTMLElement).conf=close_conf;
	(close_cross as RSHTMLElement).hass=this._hass;
	this._shadowRoot.querySelector("#dialog-close").appendChild(close_cross);
      }
      // Title
      this._shadowRoot.querySelector("#dialog-title").innerHTML=this.evaluate(this.to_render.title_key);
      // Content
      this.elts=[];
      this.extends_to_re_render=[];
      this.to_render.content.map(c => this._render_content(c));
      // Submit
      let submit_button=MyElement.create_element(this._hass,submit_conf,this.elt.device);
      this._shadowRoot.querySelector("#bt_right").appendChild(submit_button);
      // Other
      if(this.to_render.other){
	let other_button=MyElement.create_element(this._hass,this.to_render.other.conf,this.elt.device);
	this._shadowRoot.querySelector("#bt_center").appendChild(other_button);
      }
      //Cancel
      if(cancel_conf){
	let cancel_button=MyElement.create_element(this._hass,cancel_conf,this.elt.device);
	this._shadowRoot.querySelector("#bt_left").appendChild(cancel_button);
      }
    }
    return html`
<div id="window-mask">
  <div id="dialog">
    <div id="dialog-close"></div>
    <div id="dialog-title"></div>
    <div id="dialog-content"></div>
    <div id="dialog-buttons">
      <div id="bt_left"></div>
      <div id="bt_center"></div>
      <div id="bt_right"></div>
    </div>
   </div>
</div>
`;
  }//end of function render
}
