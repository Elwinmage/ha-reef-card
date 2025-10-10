import { html } from "lit";
import RSDevice from "./device";
import {config} from "./mapping/RSDOSE4";
import DoseHead from "./dose_head";
import styles from "./rsdose.styles";


/*
 * RSDose 
 */
// TODO: RSDOSE Implement advanced schedule edition
//   labels: enhacement, rsdose
export default class RSDose extends RSDevice{

// TODO: RSDOSE Implement basic services
//   labels: enhacement, rsdose
    static styles = styles;
    _heads = []
    
    constructor(hass,device){
	super(config,hass,device);
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
	console.log("rsdose._get_val: "+entity_id);
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
	this._populate_entities_with_heads();
	console.log("000");
	console.log(this.hass);
	console.log(this.device);
	console.log("000");
	return html`
	<div class="device_bg">
	  <img class="device_img" id="rsdose4_img" alt=""  src='${this.config.background_img}' />
        <div class="heads">
	${Array.from({length:this.config.heads_nb},(x,i) => i+1).map(head => this._render_head(head))}
       </div>
	</div>`;


    }
}


window.customElements.define('rs-dose4', RSDose);
